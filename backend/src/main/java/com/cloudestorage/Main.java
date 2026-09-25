package com.cloudestorage;

import com.cloudestorage.config.GsonJsonMapper;
import com.cloudestorage.dto.LoginRequest;
import com.cloudestorage.dto.RegisterRequest;
import com.cloudestorage.model.FileRecord;
import com.cloudestorage.model.Session;
import com.cloudestorage.model.User;
import com.cloudestorage.repository.Database;
import com.cloudestorage.repository.FileRepository;
import com.cloudestorage.repository.SessionRepository;
import com.cloudestorage.repository.UserRepository;
import com.cloudestorage.service.*;
import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.UnauthorizedResponse;
import io.javalin.http.staticfiles.Location;
import io.javalin.http.UploadedFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

public class Main {

    private static final String SESSION_COOKIE_NAME = "session";
    // în producție (spatele unui reverse proxy/ingress cu TLS), lasă true.
    // dacă testezi local peste http simplu (nu https), browserul refuză să
    // trimită înapoi un cookie "Secure" pe o conexiune nesecurizată — setează
    // COOKIE_SECURE=false ca variabilă de mediu doar pentru testare locală.
    private static final boolean COOKIE_SECURE = !"false".equalsIgnoreCase(System.getenv("COOKIE_SECURE"));

    public static void main(String[] args) {
        Database.initSchema();

        UserRepository userRepository = new UserRepository();
        SessionRepository sessionRepository = new SessionRepository();
        FileRepository fileRepository = new FileRepository();

        AuthService authService = new BCryptAuthService(userRepository);
        SessionService sessionService = new SessionService(sessionRepository, userRepository);
        EncryptionService encryptionService = new AesEncryptionService();
        FileStorageService fileStorageService = new LocalFileStorageService();

        String frontendOrigin = System.getenv().getOrDefault("FRONTEND_ORIGIN", "http://localhost:5173");

        Javalin app = Javalin.create(config -> {
            config.jsonMapper(new GsonJsonMapper());

            // servește build-ul React (dist/) dacă există — folosit în producție/container,
            // unde frontend-ul e pe același origin ca backend-ul (evită CORS/SameSite complet)
            config.staticFiles.add(sf -> {
                sf.hostedPath = "/";
                sf.directory = "public";
                sf.location = Location.EXTERNAL;
            });
            config.spaRoot.addFile("/", "public/index.html", Location.EXTERNAL);
        }).start(Integer.parseInt(System.getenv().getOrDefault("PORT", "7070")));

        // CORS controlat manual — util doar în development (frontend pe alt port, ex.
        // vite dev server pe 5173). În producție (același origin, servit din /public
        // de mai sus), aceste header-e sunt inofensive dar inutile.
        app.before(ctx -> {
            ctx.header("Access-Control-Allow-Origin", frontendOrigin);
            ctx.header("Access-Control-Allow-Credentials", "true");
            ctx.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
            ctx.header("Access-Control-Allow-Headers", "Content-Type");
        });
        app.options("/*", ctx -> ctx.status(HttpStatus.OK));

        app.get("/health", ctx -> ctx.result("CloudEStorage server is running"));

        // ===================== AUTH =====================

        app.post("/api/register", ctx -> {
            RegisterRequest request = ctx.bodyAsClass(RegisterRequest.class);
            try {
                User newUser = authService.register(request.username, request.password);
                ctx.status(HttpStatus.CREATED).json(Map.of(
                        "id", newUser.getId(),
                        "username", newUser.getUsername(),
                        "createdAt", newUser.getCreatedAt().toString()
                ));
            } catch (IllegalArgumentException e) {
                ctx.status(HttpStatus.CONFLICT).json(Map.of("error", e.getMessage()));
            }
        });

        app.post("/api/login", ctx -> {
            LoginRequest request = ctx.bodyAsClass(LoginRequest.class);
            try {
                User user = authService.login(request.username, request.password);
                Session session = sessionService.createSession(user);
                setSessionCookie(ctx, session.getToken());

                ctx.status(HttpStatus.OK).json(Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "createdAt", user.getCreatedAt().toString()
                ));
            } catch (IllegalArgumentException e) {
                ctx.status(HttpStatus.UNAUTHORIZED).json(Map.of("error", e.getMessage()));
            }
        });

        app.post("/api/logout", ctx -> {
            ctx.removeCookie(SESSION_COOKIE_NAME, "/");
            ctx.status(HttpStatus.OK).json(Map.of("message", "Deconectat"));
        });

        app.post("/api/logout-all", ctx -> {
            User user = requireAuth(ctx, sessionService);
            sessionService.revokeAllForUser(user.getId());
            ctx.removeCookie(SESSION_COOKIE_NAME, "/");
            ctx.status(HttpStatus.OK).json(Map.of("message", "Toate sesiunile au fost revocate"));
        });

        app.get("/api/me", ctx -> {
            User user = requireAuth(ctx, sessionService);
            ctx.json(Map.of("id", user.getId(), "username", user.getUsername()));
        });

        // ===================== FILES =====================

        app.post("/api/files", ctx -> {
            User user = requireAuth(ctx, sessionService);
            UploadedFile uploaded = ctx.uploadedFile("file");

            if (uploaded == null) {
                ctx.status(HttpStatus.BAD_REQUEST).json(Map.of("error", "Niciun fișier trimis (câmp 'file' lipsă)"));
                return;
            }

            byte[] plainBytes = uploaded.content().readAllBytes();
            byte[] encryptedBytes = encryptionService.encrypt(plainBytes);

            String storedFilename = UUID.randomUUID().toString();
            fileStorageService.store(storedFilename, encryptedBytes);

            FileRecord record = new FileRecord(
                    null, user.getId(), uploaded.filename(), storedFilename,
                    plainBytes.length, uploaded.contentType(), LocalDateTime.now(), null
            );
            FileRecord saved = fileRepository.save(record);

            ctx.status(HttpStatus.CREATED).json(toFileJson(saved));
        });

        app.get("/api/files", ctx -> {
            User user = requireAuth(ctx, sessionService);
            List<FileRecord> files = fileRepository.findByOwner(user.getId());
            ctx.json(files.stream().map(Main::toFileJson).collect(Collectors.toList()));
        });

        app.get("/api/files/{id}", ctx -> {
            User user = requireAuth(ctx, sessionService);
            long id = Long.parseLong(ctx.pathParam("id"));

            FileRecord file = fileRepository.findById(id);
            if (file == null || file.getOwnerId() != user.getId()) {
                ctx.status(HttpStatus.NOT_FOUND).json(Map.of("error", "Fișier inexistent"));
                return;
            }

            byte[] encryptedBytes = fileStorageService.retrieve(file.getStoredFilename());
            byte[] plainBytes = encryptionService.decrypt(encryptedBytes);

            ctx.header("Content-Disposition", "attachment; filename=\"" + file.getOriginalFilename() + "\"");
            ctx.contentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
            ctx.result(plainBytes);
        });

        app.delete("/api/files/{id}", ctx -> {
            User user = requireAuth(ctx, sessionService);
            long id = Long.parseLong(ctx.pathParam("id"));

            FileRecord file = fileRepository.findById(id);
            if (file == null || file.getOwnerId() != user.getId()) {
                ctx.status(HttpStatus.NOT_FOUND).json(Map.of("error", "Fișier inexistent"));
                return;
            }

            fileRepository.softDelete(id);
            ctx.status(HttpStatus.OK).json(Map.of("message", "Fișier șters"));
        });
    }

    // extrage și validează sesiunea din cookie; aruncă 401 dacă lipsește/invalidă —
    // Javalin prinde automat UnauthorizedResponse și răspunde corect clientului
    private static User requireAuth(Context ctx, SessionService sessionService) {
        String token = ctx.cookie(SESSION_COOKIE_NAME);
        User user = sessionService.validate(token);
        if (user == null) {
            throw new UnauthorizedResponse("Neautentificat");
        }
        return user;
    }

    private static void setSessionCookie(Context ctx, String token) {
        StringBuilder cookie = new StringBuilder();
        cookie.append(SESSION_COOKIE_NAME).append("=").append(token)
              .append("; Path=/")
              .append("; HttpOnly")
              .append("; SameSite=Strict")
              .append("; Max-Age=").append(60 * 60 * 24); // 24h, în acord cu durata sesiunii din SessionService
        if (COOKIE_SECURE) {
            cookie.append("; Secure");
        }
        ctx.header("Set-Cookie", cookie.toString());
    }

    private static Map<String, Object> toFileJson(FileRecord f) {
        return Map.of(
                "id", f.getId(),
                "originalFilename", f.getOriginalFilename(),
                "fileSize", f.getFileSize(),
                "contentType", f.getContentType() == null ? "" : f.getContentType(),
                "uploadedAt", f.getUploadedAt().toString()
        );
    }
}

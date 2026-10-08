package com.cloudestorage.service;

import com.cloudestorage.model.User;
import com.cloudestorage.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

public class BCryptAuthService implements AuthService {

    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[A-Za-z0-9._@-]{3,64}$");
    private static final int PASSWORD_MIN_CHARS = 8;
    // BCrypt ignoră tot ce depășește 72 de bytes — refuzăm explicit în loc să trunchiem silențios
    private static final int PASSWORD_MAX_BYTES = 72;
    // hash dummy, folosit ca login-ul pe un user inexistent să consume același timp ca unul existent
    private static final String DUMMY_HASH = BCrypt.hashpw("dummy-password-for-timing", BCrypt.gensalt());

    private final UserRepository userRepository;

    public BCryptAuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User register(String username, String plainPassword) {
        validateCredentials(username, plainPassword);

        User existing = userRepository.findByUsername(username);
        if (existing != null) {
            throw new IllegalArgumentException("Username-ul este deja folosit");
        }

        String hashedPassword = BCrypt.hashpw(plainPassword, BCrypt.gensalt());
        User newUser = new User(null, username, hashedPassword, null, LocalDateTime.now());

        return userRepository.save(newUser);
    }

    @Override
    public User login(String username, String plainPassword) {
        if (username == null || plainPassword == null) {
            throw new IllegalArgumentException("Username sau parolă incorecte");
        }

        User user = userRepository.findByUsername(username);

        if (user == null) {
            // verificare dummy: răspunsul durează cât pentru un user real (fără enumerare prin timing)
            BCrypt.checkpw(plainPassword, DUMMY_HASH);
            throw new IllegalArgumentException("Username sau parolă incorecte");
        }
        if (!user.checkPassword(plainPassword)) {
            throw new IllegalArgumentException("Username sau parolă incorecte");
        }

        return user;
    }

    private static void validateCredentials(String username, String password) {
        if (username == null || !USERNAME_PATTERN.matcher(username).matches()) {
            throw new InvalidInputException("Username invalid (3–64 caractere: litere, cifre, . _ @ -)");
        }
        if (password == null || password.length() < PASSWORD_MIN_CHARS) {
            throw new InvalidInputException("Parola trebuie să aibă cel puțin " + PASSWORD_MIN_CHARS + " caractere");
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > PASSWORD_MAX_BYTES) {
            throw new InvalidInputException("Parola este prea lungă (maxim " + PASSWORD_MAX_BYTES + " bytes)");
        }
    }

    // eroare de validare a inputului — distinctă de conflict (username deja folosit), ca să mapăm 400 vs 409
    public static class InvalidInputException extends IllegalArgumentException {
        public InvalidInputException(String message) {
            super(message);
        }
    }

    @Override
    public User changePassword(User user, String newPlainPassword) {
        String newHashedPassword = BCrypt.hashpw(newPlainPassword, BCrypt.gensalt());

        User updatedUser = new User(
                user.getId(), user.getUsername(), newHashedPassword,
                user.getTwoFactorSecret(), user.getCreatedAt()
        );

        return userRepository.update(updatedUser);
    }
}

# ---------- stage 1: build frontend (React/Vite) ----------
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---------- stage 2: build backend (Java/Maven) ----------
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn -B dependency:go-offline
COPY backend/src ./src
RUN mvn -B clean package -DskipTests

# ---------- stage 3: runtime ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# jar-ul backend-ului
COPY --from=backend-build /app/backend/target/cloudestorage.jar ./cloudestorage.jar

# build-ul frontend-ului, servit static de Javalin din folderul "public"
COPY --from=frontend-build /app/frontend/dist ./public

# datele persistente (SQLite, cheia de criptare, fișierele) — mapate pe un volum în K8s
VOLUME ["/app/data"]

ENV PORT=7070
ENV COOKIE_SECURE=true
EXPOSE 7070

ENTRYPOINT ["java", "-jar", "cloudestorage.jar"]

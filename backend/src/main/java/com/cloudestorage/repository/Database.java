package com.cloudestorage.repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

// Rădăcina proiectului este directorul de lucru curent la rulare (java -jar / mvn exec:java
// din root). Fișierul .sqlite se creează automat aici, în folderul data/, la prima pornire.
public class Database {

    private static final String DB_PATH = "data/cloudestorage.sqlite";
    private static final String URL = "jdbc:sqlite:" + DB_PATH;

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL);
    }

    // creează schema dacă nu există deja — idempotent, sigur de rulat la fiecare pornire
    public static void initSchema() {
        // SQLite creează fișierul .sqlite, dar NU și folderul părinte — îl creăm noi întâi
        try {
            Files.createDirectories(Path.of(DB_PATH).getParent());
        } catch (IOException e) {
            throw new RuntimeException("Nu s-a putut crea directorul bazei de date: " + e.getMessage(), e);
        }

        String[] statements = {
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    two_factor_secret TEXT,
                    created_at TEXT NOT NULL
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS file_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    owner_id INTEGER NOT NULL,
                    original_filename TEXT NOT NULL,
                    stored_filename TEXT NOT NULL,
                    file_size INTEGER NOT NULL,
                    content_type TEXT,
                    uploaded_at TEXT NOT NULL,
                    deleted_at TEXT,
                    FOREIGN KEY (owner_id) REFERENCES users(id)
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    token TEXT UNIQUE NOT NULL,
                    user_id INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    expires_at TEXT NOT NULL,
                    revoked INTEGER NOT NULL DEFAULT 0,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS share_links (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    token TEXT UNIQUE NOT NULL,
                    file_id INTEGER NOT NULL,
                    permission TEXT NOT NULL,
                    expires_at TEXT,
                    password_hash TEXT,
                    FOREIGN KEY (file_id) REFERENCES file_records(id)
                )
                """
        };

        try (Connection conn = getConnection(); Statement stmt = conn.createStatement()) {
            for (String sql : statements) {
                stmt.execute(sql);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Eroare la inițializarea schemei bazei de date: " + e.getMessage(), e);
        }

        // dacă baza de date exista deja dintr-o versiune anterioară (fără aceste coloane),
        // le adăugăm acum — SQLite nu are "ADD COLUMN IF NOT EXISTS", deci ignorăm eroarea
        // "duplicate column" dacă există deja
        tryAddColumn("file_records", "deleted_at TEXT");
        tryAddColumn("sessions", "token TEXT");
    }

    private static void tryAddColumn(String table, String columnDef) {
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement()) {
            stmt.execute("ALTER TABLE " + table + " ADD COLUMN " + columnDef);
        } catch (SQLException e) {
            // coloana există deja — normal la fiecare pornire ulterioară primei, se ignoră
        }
    }
}

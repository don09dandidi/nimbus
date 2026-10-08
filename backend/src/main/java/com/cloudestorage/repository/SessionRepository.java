package com.cloudestorage.repository;

import com.cloudestorage.model.Session;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;

public class SessionRepository {

    public Session save(Session session) {
        String sql = "INSERT INTO sessions (token, user_id, created_at, expires_at, revoked) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, session.getToken());
            stmt.setLong(2, session.getUserId());
            stmt.setString(3, session.getCreatedAt().toString());
            stmt.setString(4, session.getExpiresAt().toString());
            stmt.setInt(5, session.isRevoked() ? 1 : 0);

            stmt.executeUpdate();

            try (ResultSet keys = stmt.getGeneratedKeys()) {
                if (keys.next()) {
                    return new Session(keys.getLong(1), session.getToken(), session.getUserId(),
                            session.getCreatedAt(), session.getExpiresAt(), session.isRevoked());
                }
            }
            return session;

        } catch (SQLException e) {
            throw new RuntimeException("Eroare la salvarea sesiunii: " + e.getMessage(), e);
        }
    }

    public Session findByToken(String token) {
        String sql = "SELECT id, token, user_id, created_at, expires_at, revoked FROM sessions WHERE token = ?";

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, token);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new Session(
                            rs.getLong("id"),
                            rs.getString("token"),
                            rs.getLong("user_id"),
                            LocalDateTime.parse(rs.getString("created_at")),
                            LocalDateTime.parse(rs.getString("expires_at")),
                            rs.getInt("revoked") == 1
                    );
                }
            }
            return null;

        } catch (SQLException e) {
            throw new RuntimeException("Eroare la căutarea sesiunii: " + e.getMessage(), e);
        }
    }

    public void revokeAllForUser(long userId) {
        String sql = "UPDATE sessions SET revoked = 1 WHERE user_id = ?";

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, userId);
            stmt.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException("Eroare la revocarea sesiunilor: " + e.getMessage(), e);
        }
    }

    public void revokeByToken(String token) {
        String sql = "UPDATE sessions SET revoked = 1 WHERE token = ?";

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, token);
            stmt.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException("Eroare la revocarea sesiunii: " + e.getMessage(), e);
        }
    }
}

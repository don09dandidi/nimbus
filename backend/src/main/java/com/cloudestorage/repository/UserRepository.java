package com.cloudestorage.repository;

import com.cloudestorage.model.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;

// clasă responsabilă DOAR cu accesul la baza de date pentru User
// nicio logică de business aici (fără hashing, fără validări) - de asta se ocupă AuthService
public class UserRepository {

    public User save(User user) {
        String sql = "INSERT INTO users (username, password_hash, two_factor_secret, created_at) VALUES (?, ?, ?, ?)";

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getPasswordHash());
            stmt.setString(3, user.getTwoFactorSecret());
            stmt.setString(4, user.getCreatedAt().toString());

            stmt.executeUpdate();

            try (ResultSet keys = stmt.getGeneratedKeys()) {
                if (keys.next()) {
                    long generatedId = keys.getLong(1);
                    return new User(generatedId, user.getUsername(), user.getPasswordHash(),
                            user.getTwoFactorSecret(), user.getCreatedAt());
                }
            }

            return user;

        } catch (SQLException e) {
            throw new RuntimeException("Eroare la salvarea utilizatorului: " + e.getMessage(), e);
        }
    }

    public User update(User user) {
        String sql = "UPDATE users SET password_hash = ? WHERE id = ?";

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, user.getPasswordHash());
            stmt.setLong(2, user.getId());

            int rowsAffected = stmt.executeUpdate();

            if (rowsAffected == 0) {
                throw new RuntimeException("Actualizare eșuată: niciun user cu id-ul " + user.getId() + " nu există în baza de date");
            }

            return user;

        } catch (SQLException e) {
            throw new RuntimeException("Eroare la actualizarea utilizatorului: " + e.getMessage(), e);
        }
    }

    public User findByUsername(String username) {
        String sql = "SELECT id, username, password_hash, two_factor_secret, created_at FROM users WHERE username = ?";

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new User(
                            rs.getLong("id"),
                            rs.getString("username"),
                            rs.getString("password_hash"),
                            rs.getString("two_factor_secret"),
                            LocalDateTime.parse(rs.getString("created_at"))
                    );
                }
            }

            return null;

        } catch (SQLException e) {
            throw new RuntimeException("Eroare la căutarea utilizatorului: " + e.getMessage(), e);
        }
    }

    public User findById(long id) {
        String sql = "SELECT id, username, password_hash, two_factor_secret, created_at FROM users WHERE id = ?";

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new User(
                            rs.getLong("id"),
                            rs.getString("username"),
                            rs.getString("password_hash"),
                            rs.getString("two_factor_secret"),
                            LocalDateTime.parse(rs.getString("created_at"))
                    );
                }
            }
            return null;

        } catch (SQLException e) {
            throw new RuntimeException("Eroare la căutarea utilizatorului: " + e.getMessage(), e);
        }
    }
}

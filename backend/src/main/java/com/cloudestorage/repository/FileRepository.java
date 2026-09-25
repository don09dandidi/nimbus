package com.cloudestorage.repository;

import com.cloudestorage.model.FileRecord;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class FileRepository {

    public FileRecord save(FileRecord file) {
        String sql = "INSERT INTO file_records (owner_id, original_filename, stored_filename, file_size, content_type, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setLong(1, file.getOwnerId());
            stmt.setString(2, file.getOriginalFilename());
            stmt.setString(3, file.getStoredFilename());
            stmt.setLong(4, file.getFileSize());
            stmt.setString(5, file.getContentType());
            stmt.setString(6, file.getUploadedAt().toString());

            stmt.executeUpdate();

            try (ResultSet keys = stmt.getGeneratedKeys()) {
                if (keys.next()) {
                    return new FileRecord(keys.getLong(1), file.getOwnerId(), file.getOriginalFilename(),
                            file.getStoredFilename(), file.getFileSize(), file.getContentType(),
                            file.getUploadedAt(), null);
                }
            }
            return file;

        } catch (SQLException e) {
            throw new RuntimeException("Eroare la salvarea fișierului: " + e.getMessage(), e);
        }
    }

    public FileRecord findById(long id) {
        String sql = "SELECT id, owner_id, original_filename, stored_filename, file_size, content_type, uploaded_at, deleted_at " +
                "FROM file_records WHERE id = ? AND deleted_at IS NULL";

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
            return null;

        } catch (SQLException e) {
            throw new RuntimeException("Eroare la căutarea fișierului: " + e.getMessage(), e);
        }
    }

    public List<FileRecord> findByOwner(long ownerId) {
        String sql = "SELECT id, owner_id, original_filename, stored_filename, file_size, content_type, uploaded_at, deleted_at " +
                "FROM file_records WHERE owner_id = ? AND deleted_at IS NULL ORDER BY uploaded_at DESC";

        List<FileRecord> results = new ArrayList<>();

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, ownerId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    results.add(mapRow(rs));
                }
            }
            return results;

        } catch (SQLException e) {
            throw new RuntimeException("Eroare la listarea fișierelor: " + e.getMessage(), e);
        }
    }

    public void softDelete(long id) {
        String sql = "UPDATE file_records SET deleted_at = ? WHERE id = ?";

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, LocalDateTime.now().toString());
            stmt.setLong(2, id);
            stmt.executeUpdate();

        } catch (SQLException e) {
            throw new RuntimeException("Eroare la ștergerea fișierului: " + e.getMessage(), e);
        }
    }

    private FileRecord mapRow(ResultSet rs) throws SQLException {
        String deletedAtStr = rs.getString("deleted_at");
        return new FileRecord(
                rs.getLong("id"),
                rs.getLong("owner_id"),
                rs.getString("original_filename"),
                rs.getString("stored_filename"),
                rs.getLong("file_size"),
                rs.getString("content_type"),
                LocalDateTime.parse(rs.getString("uploaded_at")),
                deletedAtStr == null ? null : LocalDateTime.parse(deletedAtStr)
        );
    }
}

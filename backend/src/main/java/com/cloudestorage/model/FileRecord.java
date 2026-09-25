package com.cloudestorage.model;

import java.time.LocalDateTime;

public class FileRecord {
    private final Long id;
    private final long ownerId;
    private final String originalFilename;
    private final String storedFilename;
    private final long fileSize;
    private final String contentType;
    private final LocalDateTime uploadedAt;
    private final LocalDateTime deletedAt;

    public FileRecord(Long id, long ownerId, String originalFilename, String storedFilename,
                       long fileSize, String contentType, LocalDateTime uploadedAt, LocalDateTime deletedAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.originalFilename = originalFilename;
        this.storedFilename = storedFilename;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.uploadedAt = uploadedAt;
        this.deletedAt = deletedAt;
    }

    public Long getId() { return id; }
    public long getOwnerId() { return ownerId; }
    public String getOriginalFilename() { return originalFilename; }
    public String getStoredFilename() { return storedFilename; }
    public long getFileSize() { return fileSize; }
    public String getContentType() { return contentType; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
}

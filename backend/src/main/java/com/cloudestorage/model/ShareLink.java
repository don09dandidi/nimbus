package com.cloudestorage.model;

import java.time.LocalDateTime;

public class ShareLink {
    public enum PermissionType { READ, WRITE }

    private final Long id;
    private final String token;
    private final long fileId;
    private final PermissionType permission;
    private final LocalDateTime expiresAt;
    private final String passwordHash;

    public ShareLink(Long id, String token, long fileId, PermissionType permission,
                      LocalDateTime expiresAt, String passwordHash) {
        this.id = id;
        this.token = token;
        this.fileId = fileId;
        this.permission = permission;
        this.expiresAt = expiresAt;
        this.passwordHash = passwordHash;
    }

    public Long getId() { return id; }
    public String getToken() { return token; }
    public long getFileId() { return fileId; }
    public PermissionType getPermission() { return permission; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public String getPasswordHash() { return passwordHash; }
}

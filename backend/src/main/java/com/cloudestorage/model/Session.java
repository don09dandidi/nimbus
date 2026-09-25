package com.cloudestorage.model;

import java.time.LocalDateTime;

public class Session {
    private final Long id;
    private final String token;
    private final long userId;
    private final LocalDateTime createdAt;
    private final LocalDateTime expiresAt;
    private final boolean revoked;

    public Session(Long id, String token, long userId, LocalDateTime createdAt, LocalDateTime expiresAt, boolean revoked) {
        this.id = id;
        this.token = token;
        this.userId = userId;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.revoked = revoked;
    }

    public Long getId() { return id; }
    public String getToken() { return token; }
    public long getUserId() { return userId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public boolean isRevoked() { return revoked; }

    public boolean isValid() {
        return !revoked && LocalDateTime.now().isBefore(expiresAt);
    }
}

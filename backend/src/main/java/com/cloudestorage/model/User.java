package com.cloudestorage.model;

import org.mindrot.jbcrypt.BCrypt;

import java.time.LocalDateTime;

public class User {
    private final Long id;
    private final String username;
    private final String passwordHash;
    private final String twoFactorSecret;
    private final LocalDateTime createdAt;

    public User(Long id, String username, String passwordHash, String twoFactorSecret, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.twoFactorSecret = twoFactorSecret;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getTwoFactorSecret() {
        return twoFactorSecret;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean checkPassword(String plainPassword) {
        return BCrypt.checkpw(plainPassword, this.passwordHash);
    }
}

package com.cloudestorage.service;

import com.cloudestorage.model.User;

// contract pentru autentificare — orice implementare (BCrypt, sau alta mai târziu) respectă asta
public interface AuthService {

    User register(String username, String plainPassword);

    User login(String username, String plainPassword);

    User changePassword(User user, String newPlainPassword);
}

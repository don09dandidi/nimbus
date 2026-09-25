package com.cloudestorage.service;

import com.cloudestorage.model.User;
import com.cloudestorage.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;

import java.time.LocalDateTime;

public class BCryptAuthService implements AuthService {

    private final UserRepository userRepository;

    public BCryptAuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User register(String username, String plainPassword) {
        User existing = userRepository.findByUsername(username);
        if (existing != null) {
            throw new IllegalArgumentException("Username-ul este deja folosit");
        }

        String hashedPassword = BCrypt.hashpw(plainPassword, BCrypt.gensalt());
        User newUser = new User(null, username, hashedPassword, null, LocalDateTime.now());

        return userRepository.save(newUser);
    }

    @Override
    public User login(String username, String plainPassword) {
        User user = userRepository.findByUsername(username);

        if (user == null || !user.checkPassword(plainPassword)) {
            throw new IllegalArgumentException("Username sau parolă incorecte");
        }

        return user;
    }

    @Override
    public User changePassword(User user, String newPlainPassword) {
        String newHashedPassword = BCrypt.hashpw(newPlainPassword, BCrypt.gensalt());

        User updatedUser = new User(
                user.getId(), user.getUsername(), newHashedPassword,
                user.getTwoFactorSecret(), user.getCreatedAt()
        );

        return userRepository.update(updatedUser);
    }
}

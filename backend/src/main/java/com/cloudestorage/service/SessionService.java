package com.cloudestorage.service;

import com.cloudestorage.model.Session;
import com.cloudestorage.model.User;
import com.cloudestorage.repository.SessionRepository;
import com.cloudestorage.repository.UserRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

// creează și validează sesiuni — tokenul e opac (nu ține date, doar identifică rândul din DB)
public class SessionService {

    private static final int TOKEN_BYTES = 32;
    private static final int SESSION_DURATION_HOURS = 24;

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final SecureRandom random = new SecureRandom();

    public SessionService(SessionRepository sessionRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    public Session createSession(User user) {
        byte[] tokenBytes = new byte[TOKEN_BYTES];
        random.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        Session session = new Session(
                null, token, user.getId(),
                LocalDateTime.now(), LocalDateTime.now().plusHours(SESSION_DURATION_HOURS), false
        );

        return sessionRepository.save(session);
    }

    // întoarce userul autentificat dacă tokenul e valid, sau null altfel — apelantul decide ce face
    public User validate(String token) {
        if (token == null) return null;

        Session session = sessionRepository.findByToken(token);
        if (session == null || !session.isValid()) {
            return null;
        }

        return userRepository.findById(session.getUserId());
    }

    // revocă sesiunea curentă (logout pe acest device); tokenul null/necunoscut e ignorat
    public void revoke(String token) {
        if (token == null) return;
        sessionRepository.revokeByToken(token);
    }

    public void revokeAllForUser(long userId) {
        sessionRepository.revokeAllForUser(userId);
    }
}

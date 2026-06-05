package com.library.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Service
public class SessionService {

    private static final String PREFIX = "session:";

    private final StringRedisTemplate redisTemplate;
    private final Duration ttl;

    public SessionService(StringRedisTemplate redisTemplate,
            @Value("${session.ttl-hours:24}") long ttlHours) {
        this.redisTemplate = redisTemplate;
        this.ttl = Duration.ofHours(ttlHours);
    }

    public String createSession(String username) {
        String sessionId = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(PREFIX + sessionId, username, ttl);
        return sessionId;
    }

    public Optional<String> getUsername(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return Optional.empty();
        }
        return Optional.ofNullable(redisTemplate.opsForValue().get(PREFIX + sessionId));
    }

    public void deleteSession(String sessionId) {
        if (sessionId != null && !sessionId.isBlank()) {
            redisTemplate.delete(PREFIX + sessionId);
        }
    }
}

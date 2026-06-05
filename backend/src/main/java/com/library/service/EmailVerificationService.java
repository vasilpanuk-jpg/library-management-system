package com.library.service;

import com.library.exception.ApiException;
import com.library.model.User;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;

@Service
public class EmailVerificationService {

    private static final String PREFIX = "email-verify:";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final Duration codeTtl;
    private final Duration resendCooldown;

    public EmailVerificationService(StringRedisTemplate redisTemplate,
            EmailService emailService,
            UserRepository userRepository,
            @Value("${email.verification.ttl-minutes:15}") long ttlMinutes,
            @Value("${email.verification.resend-seconds:60}") long resendSeconds) {
        this.redisTemplate = redisTemplate;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.codeTtl = Duration.ofMinutes(ttlMinutes);
        this.resendCooldown = Duration.ofSeconds(resendSeconds);
    }

    public void sendVerificationCode(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email обов'язковий для верифікації");
        }
        String cooldownKey = PREFIX + "cooldown:" + user.getEmail().toLowerCase();
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey))) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Зачекайте перед повторним надсиланням коду");
        }
        String code = generateCode();
        redisTemplate.opsForValue().set(PREFIX + user.getEmail().toLowerCase(), code, codeTtl);
        redisTemplate.opsForValue().set(cooldownKey, "1", resendCooldown);
        emailService.sendVerificationCode(user.getEmail(), code);
    }

    @Transactional
    public User verifyEmail(String email, String code) {
        String normalizedEmail = email.trim().toLowerCase();
        String normalizedCode = code == null ? "" : code.replaceAll("\\D", "");
        if (normalizedCode.length() != 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Код має містити 8 цифр");
        }
        String storedCode = redisTemplate.opsForValue().get(PREFIX + normalizedEmail);
        if (storedCode == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Код прострочений або не існує");
        }
        if (!storedCode.equals(normalizedCode)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Невірний код підтвердження");
        }
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Користувача з таким email не знайдено"));
        user.setEmailVerified(true);
        User saved = userRepository.save(user);
        redisTemplate.delete(PREFIX + normalizedEmail);
        return saved;
    }

    private String generateCode() {
        int value = RANDOM.nextInt(100_000_000);
        return String.format("%08d", value);
    }
}

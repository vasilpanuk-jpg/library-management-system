package com.library.controller;

import com.library.config.SessionCookieSupport;
import com.library.dto.AuthDtos;
import com.library.dto.UserProfileDto;
import com.library.model.User;
import com.library.security.SessionAuthFilter;
import com.library.service.EmailVerificationService;
import com.library.service.SessionService;
import com.library.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Реєстрація, вхід та верифікація email")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private SessionCookieSupport sessionCookieSupport;

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    @Operation(summary = "Реєстрація нового читача")
    public ResponseEntity<AuthDtos.RegisterResponse> register(@RequestBody AuthDtos.RegisterRequest req) {
        User user = userService.registerUser(req);
        return ResponseEntity.ok(new AuthDtos.RegisterResponse(
                "На ваш email надіслано 8-значний код підтвердження",
                user.getEmail(),
                true));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Підтвердження email 8-значним кодом")
    public ResponseEntity<AuthDtos.AuthResponse> verifyEmail(@RequestBody AuthDtos.VerifyEmailRequest req,
            HttpServletResponse response) {
        User user = emailVerificationService.verifyEmail(req.getEmail(), req.getCode());
        String sessionId = sessionService.createSession(user.getUsername());
        sessionCookieSupport.attachSessionCookie(response, sessionId);
        return ResponseEntity.ok(new AuthDtos.AuthResponse(UserProfileDto.from(user)));
    }

    @PostMapping("/resend-code")
    @Operation(summary = "Повторне надсилання коду підтвердження")
    public ResponseEntity<AuthDtos.MessageResponse> resendCode(@RequestBody AuthDtos.ResendCodeRequest req) {
        User user = userService.findUserByEmail(req.getEmail());
        if (user.isEmailVerified()) {
            return ResponseEntity.ok(new AuthDtos.MessageResponse("Email вже підтверджено"));
        }
        emailVerificationService.sendVerificationCode(user);
        return ResponseEntity.ok(new AuthDtos.MessageResponse("Код підтвердження надіслано повторно"));
    }

    @PostMapping("/login")
    @Operation(summary = "Вхід у систему")
    public ResponseEntity<?> login(@RequestBody AuthDtos.LoginRequest req, HttpServletResponse response) {
        try {
            authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
            userService.ensureEmailVerified(req.getUsername());
            String sessionId = sessionService.createSession(req.getUsername());
            sessionCookieSupport.attachSessionCookie(response, sessionId);
            UserProfileDto user = userService.findProfileByUsername(req.getUsername());
            return ResponseEntity.ok(new AuthDtos.AuthResponse(user));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(new AuthDtos.MessageResponse("Невірний логін або пароль"));
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "Вихід із системи")
    public ResponseEntity<AuthDtos.MessageResponse> logout(HttpServletRequest request, HttpServletResponse response) {
        String sessionId = SessionAuthFilter.extractSessionId(request);
        sessionService.deleteSession(sessionId);
        sessionCookieSupport.clearSessionCookie(response);
        return ResponseEntity.ok(new AuthDtos.MessageResponse("Ви вийшли з системи"));
    }

    @GetMapping("/session")
    @Operation(summary = "Перевірка активної сесії")
    public ResponseEntity<AuthDtos.AuthResponse> session(HttpServletRequest request) {
        String sessionId = SessionAuthFilter.extractSessionId(request);
        return sessionService.getUsername(sessionId)
                .map(username -> ResponseEntity.ok(
                        new AuthDtos.AuthResponse(userService.findProfileByUsername(username))))
                .orElseGet(() -> ResponseEntity.status(401).build());
    }
}

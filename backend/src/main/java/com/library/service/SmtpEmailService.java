package com.library.service;

import com.library.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

public class SmtpEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(SmtpEmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String appName;

    public SmtpEmailService(JavaMailSender mailSender, String fromAddress, String appName) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.appName = appName;
    }

    @Override
    public void sendVerificationCode(String email, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(email);
        message.setSubject(appName + " — код підтвердження email");
        message.setText("""
                Вітаємо!

                Ваш код підтвердження: %s

                Код дійсний обмежений час. Якщо ви не реєструвалися — проігноруйте цей лист.

                З повагою,
                %s
                """.formatted(code, appName));
        try {
            mailSender.send(message);
            log.info("Verification email sent to {}", email);
        } catch (Exception ex) {
            log.error("Failed to send verification email to {}", email, ex);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Не вдалося надіслати лист. Перевірте налаштування пошти.");
        }
    }
}

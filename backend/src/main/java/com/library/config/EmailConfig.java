package com.library.config;

import com.library.service.EmailService;
import com.library.service.SmtpEmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;

@Configuration
public class EmailConfig {

    @Bean
    @ConditionalOnProperty(name = "email.smtp.enabled", havingValue = "true", matchIfMissing = true)
    public EmailService smtpEmailService(JavaMailSender mailSender,
            @Value("${spring.mail.username}") String fromAddress,
            @Value("${email.from-name:Technical Literature Library}") String appName) {
        return new SmtpEmailService(mailSender, fromAddress, appName);
    }
}

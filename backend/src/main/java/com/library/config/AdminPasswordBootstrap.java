package com.library.config;

import com.library.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@ConditionalOnProperty(name = "library.bootstrap.reset-admin-password")
public class AdminPasswordBootstrap {

    private static final Logger log = LoggerFactory.getLogger(AdminPasswordBootstrap.class);

    @Bean
    CommandLineRunner resetAdminPassword(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${library.bootstrap.reset-admin-password}") String newPassword) {
        return args -> userRepository.findByUsername("admin").ifPresentOrElse(user -> {
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setEmailVerified(true);
            userRepository.save(user);
            log.warn("Admin password was reset via library.bootstrap.reset-admin-password");
        }, () -> log.warn("Admin user not found; password reset skipped"));
    }
}

package com.library.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    private String email;

    @Column(name = "full_name")
    private String fullName;

    private String phone;

    @Column(nullable = false)
    private String role; // ROLE_ADMIN, ROLE_LIBRARIAN, ROLE_READER

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    private Instant createdAt = Instant.now();
}

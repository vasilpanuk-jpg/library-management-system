package com.library.config;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BcryptHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        for (String password : new String[] { "admin", "librarian", "reader", "reader123" }) {
            System.out.println(password + " -> " + encoder.encode(password));
        }
    }
}

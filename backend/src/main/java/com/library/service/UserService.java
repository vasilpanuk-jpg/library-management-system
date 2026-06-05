package com.library.service;

import com.library.dto.AuthDtos;
import com.library.dto.UserProfileDto;
import com.library.exception.ApiException;
import com.library.model.Reader;
import com.library.model.User;
import com.library.repository.ReaderRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReaderRepository readerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    @Lazy
    private EmailVerificationService emailVerificationService;

    @Transactional
    @CacheEvict(value = "users::byUsername", key = "#request.username")
    public User registerUser(AuthDtos.RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Користувач вже існує");
        }
        if (request.getEmail() != null
                && userRepository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Email вже використовується");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole() == null ? "ROLE_READER" : request.getRole());
        user.setEmailVerified(false);
        User saved = userRepository.save(user);

        Reader reader = new Reader();
        reader.setFullName(saved.getFullName() != null ? saved.getFullName() : saved.getUsername());
        reader.setEmail(saved.getEmail());
        reader.setPhone(saved.getPhone());
        reader.setUser(saved);
        readerRepository.save(reader);

        emailVerificationService.sendVerificationCode(saved);
        return saved;
    }

    public void ensureEmailVerified(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Користувача не знайдено"));
        if (!user.isEmailVerified()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Підтвердіть email перед входом у систему");
        }
    }

    public List<UserProfileDto> findAllProfiles() {
        return userRepository.findAll().stream().map(UserProfileDto::from).toList();
    }

    public UserProfileDto findProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Користувача не знайдено"));
        return UserProfileDto.from(user);
    }

    public User findUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Користувача з таким email не знайдено"));
    }

    @Transactional
    @CacheEvict(value = "users::byUsername", key = "#username")
    public UserProfileDto updateProfile(String username, AuthDtos.UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Користувача не знайдено"));
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        boolean emailChanged = false;
        if (request.getEmail() != null && !Objects.equals(request.getEmail(), user.getEmail())) {
            if (userRepository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
                throw new ApiException(HttpStatus.CONFLICT, "Email вже використовується");
            }
            user.setEmail(request.getEmail());
            user.setEmailVerified(false);
            emailChanged = true;
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        User saved = userRepository.save(user);

        readerRepository.findByUserId(saved.getId()).ifPresent(reader -> {
            reader.setFullName(saved.getFullName());
            reader.setEmail(saved.getEmail());
            reader.setPhone(saved.getPhone());
            readerRepository.save(reader);
        });

        if (emailChanged) {
            emailVerificationService.sendVerificationCode(saved);
        }
        return UserProfileDto.from(saved);
    }

    @Transactional
    @CacheEvict(value = "users::byUsername", allEntries = true)
    public UserProfileDto changeRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Користувача не знайдено"));
        user.setRole(role);
        return UserProfileDto.from(userRepository.save(user));
    }

    @Override
    @Cacheable(value = "users::byUsername", key = "#username")
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Collection<GrantedAuthority> authorities = Collections
                .singletonList(new SimpleGrantedAuthority(user.getRole()));
        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(),
                authorities);
    }
}

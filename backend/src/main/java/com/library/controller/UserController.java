package com.library.controller;

import com.library.dto.AuthDtos;
import com.library.dto.UserProfileDto;
import com.library.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Керування користувачами та профілем")
@SecurityRequirement(name = "sessionCookie")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LIBRARIAN')")
    @Operation(summary = "Список усіх користувачів")
    public List<UserProfileDto> all() {
        return userService.findAllProfiles();
    }

    @GetMapping("/me")
    @Operation(summary = "Поточний користувач")
    public UserProfileDto me(@AuthenticationPrincipal UserDetails principal) {
        return userService.findProfileByUsername(principal.getUsername());
    }

    @PutMapping("/me")
    @Operation(summary = "Оновлення профілю поточного користувача")
    public UserProfileDto updateMe(@AuthenticationPrincipal UserDetails principal,
            @RequestBody AuthDtos.UpdateProfileRequest request) {
        return userService.updateProfile(principal.getUsername(), request);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Зміна ролі користувача")
    public UserProfileDto changeRole(@PathVariable Long id, @RequestBody AuthDtos.ChangeRoleRequest request) {
        return userService.changeRole(id, request.getRole());
    }
}

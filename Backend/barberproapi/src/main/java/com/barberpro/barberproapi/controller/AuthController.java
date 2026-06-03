package com.barberpro.barberproapi.controller;

import com.barberpro.barberproapi.domain.User;
import com.barberpro.barberproapi.dto.LoginRequest;
import com.barberpro.barberproapi.dto.LoginResponse;
import com.barberpro.barberproapi.dto.RegisterRequest;
import com.barberpro.barberproapi.dto.UserResponse;
import com.barberpro.barberproapi.service.AuthService;
import com.barberpro.barberproapi.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return userService.me((User) authentication.getPrincipal());
    }
}

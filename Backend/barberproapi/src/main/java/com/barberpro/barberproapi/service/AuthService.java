package com.barberpro.barberproapi.service;

import com.barberpro.barberproapi.domain.User;
import com.barberpro.barberproapi.domain.UserRole;
import com.barberpro.barberproapi.dto.LoginRequest;
import com.barberpro.barberproapi.dto.LoginResponse;
import com.barberpro.barberproapi.dto.RegisterRequest;
import com.barberpro.barberproapi.dto.UserResponse;
import com.barberpro.barberproapi.exception.BusinessException;
import com.barberpro.barberproapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw BusinessException.conflict("E-mail já cadastrado.");
        }

        User user = User.builder()
                .nome(request.nome().trim())
                .email(email)
                .senhaHash(passwordEncoder.encode(request.senha()))
                .role(UserRole.CLIENTE)
                .build();

        return UserResponse.from(userRepository.save(user));
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> BusinessException.unauthorized("Credenciais inválidas."));

        if (!passwordEncoder.matches(request.senha(), user.getSenhaHash())) {
            throw BusinessException.unauthorized("Credenciais inválidas.");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, UserResponse.from(user));
    }
}

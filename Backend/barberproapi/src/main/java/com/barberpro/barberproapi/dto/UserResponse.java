package com.barberpro.barberproapi.dto;

import com.barberpro.barberproapi.domain.User;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String nome,
        String email,
        String role,
        @JsonProperty("created_at")
        LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getNome(),
                user.getEmail(),
                user.getRole().toLower(),
                user.getCreatedAt()
        );
    }
}

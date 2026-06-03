package com.barberpro.barberproapi.dto;

public record LoginResponse(
        String token,
        UserResponse user
) {
}

package com.barberpro.barberproapi.dto;

import jakarta.validation.constraints.NotBlank;

public record HelloMessageRequest(
        @NotBlank(message = "Mensagem obrigatória.")
        String message
) {
}

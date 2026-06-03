package com.barberpro.barberproapi.dto;

import jakarta.validation.constraints.NotBlank;

public record AppointmentStatusRequest(
        @NotBlank(message = "Status é obrigatório.")
        String status
) {
}

package com.barberpro.barberproapi.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.time.LocalDateTime;

public record AppointmentCreatedEvent(
        @JsonProperty("appointment_id")
        Long appointmentId,
        @JsonProperty("cliente_id")
        Long clienteId,
        @JsonProperty("barbeiro_id")
        Long barbeiroId,
        @JsonProperty("service_id")
        Long serviceId,
        @JsonProperty("data_hora")
        LocalDateTime dataHora
) implements Serializable {
}

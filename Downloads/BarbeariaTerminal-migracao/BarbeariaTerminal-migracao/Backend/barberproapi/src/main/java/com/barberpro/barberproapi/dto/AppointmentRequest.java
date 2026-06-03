package com.barberpro.barberproapi.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AppointmentRequest(
        @JsonProperty("service_id")
        @NotNull(message = "Serviço é obrigatório.")
        Long serviceId,

        @JsonProperty("barbeiro_id")
        @NotNull(message = "Selecione um barbeiro para o agendamento.")
        Long barbeiroId,

        @JsonProperty("data_hora")
        @NotNull(message = "Data/hora é obrigatória.")
        @Future(message = "Não é permitido agendar para uma data/hora no passado.")
        LocalDateTime dataHora,

        String observacoes
) {
}

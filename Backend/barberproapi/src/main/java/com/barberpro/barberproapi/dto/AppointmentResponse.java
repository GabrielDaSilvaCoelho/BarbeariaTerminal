package com.barberpro.barberproapi.dto;

import com.barberpro.barberproapi.domain.Appointment;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        @JsonProperty("data_hora")
        LocalDateTime dataHora,
        String status,
        String observacoes,
        @JsonProperty("created_at")
        LocalDateTime createdAt,
        @JsonProperty("cliente_nome")
        String clienteNome,
        @JsonProperty("cliente_id")
        Long clienteId,
        @JsonProperty("barbeiro_nome")
        String barbeiroNome,
        @JsonProperty("barbeiro_id")
        Long barbeiroId,
        @JsonProperty("servico_nome")
        String servicoNome,
        BigDecimal preco,
        @JsonProperty("duracao_min")
        Integer duracaoMin
) {
    public static AppointmentResponse from(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getDataHora(),
                appointment.getStatus().toLower(),
                appointment.getObservacoes(),
                appointment.getCreatedAt(),
                appointment.getCliente() != null ? appointment.getCliente().getNome() : null,
                appointment.getCliente() != null ? appointment.getCliente().getId() : null,
                appointment.getBarbeiro() != null ? appointment.getBarbeiro().getNome() : null,
                appointment.getBarbeiro() != null ? appointment.getBarbeiro().getId() : null,
                appointment.getService() != null ? appointment.getService().getNome() : null,
                appointment.getService() != null ? appointment.getService().getPreco() : null,
                appointment.getService() != null ? appointment.getService().getDuracaoMin() : null
        );
    }
}
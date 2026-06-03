package com.barberpro.barberproapi.dto;

import com.barberpro.barberproapi.domain.BarberService;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BarberServiceResponse(
        Long id,
        String nome,
        String descricao,
        BigDecimal preco,
        @JsonProperty("duracao_min")
        Integer duracaoMin,
        Boolean ativo,
        @JsonProperty("created_at")
        LocalDateTime createdAt
) {
    public static BarberServiceResponse from(BarberService service) {
        return new BarberServiceResponse(
                service.getId(),
                service.getNome(),
                service.getDescricao(),
                service.getPreco(),
                service.getDuracaoMin(),
                service.getAtivo(),
                service.getCreatedAt()
        );
    }
}

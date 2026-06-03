package com.barberpro.barberproapi.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record BarberServiceRequest(
        @NotBlank(message = "Nome é obrigatório.")
        String nome,

        String descricao,

        @NotNull(message = "Preço é obrigatório.")
        @DecimalMin(value = "0.01", message = "Preço inválido.")
        BigDecimal preco,

        @JsonProperty("duracao_min")
        @NotNull(message = "Duração é obrigatória.")
        @Min(value = 1, message = "Duração inválida.")
        Integer duracaoMin,

        Boolean ativo
) {
}

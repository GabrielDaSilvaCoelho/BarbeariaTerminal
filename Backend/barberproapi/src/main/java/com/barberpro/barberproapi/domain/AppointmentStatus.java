package com.barberpro.barberproapi.domain;

public enum AppointmentStatus {
    PENDENTE,
    PROCESSANDO,
    CONFIRMADO,
    CONCLUIDO,
    CANCELADO,
    ERRO;

    public String toLower() {
        return name().toLowerCase();
    }

    public static AppointmentStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Status é obrigatório.");
        }
        return AppointmentStatus.valueOf(value.trim().toUpperCase());
    }

    public boolean isActive() {
        return this == PENDENTE || this == PROCESSANDO || this == CONFIRMADO;
    }
}

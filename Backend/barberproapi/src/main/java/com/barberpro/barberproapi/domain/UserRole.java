package com.barberpro.barberproapi.domain;

public enum UserRole {
    CLIENTE,
    BARBEIRO,
    ADMIN;

    public String toLower() {
        return name().toLowerCase();
    }

    public static UserRole fromString(String value) {
        if (value == null) {
            return CLIENTE;
        }
        return UserRole.valueOf(value.trim().toUpperCase());
    }
}

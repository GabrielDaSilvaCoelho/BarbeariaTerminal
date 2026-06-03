package com.barberpro.barberproapi.service.strategy;

import com.barberpro.barberproapi.domain.Appointment;
import com.barberpro.barberproapi.domain.AppointmentStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PremiumConfirmationStrategy implements AppointmentConfirmationStrategy {

    private static final int DURACAO_MINIMA_PREMIUM = 60;

    @Override
    public String confirm(Appointment appointment) {
        appointment.setStatus(AppointmentStatus.CONFIRMADO);
        appointment.setProcessedAt(LocalDateTime.now());
        return String.format(
                "Agendamento premium confirmado (serviço '%s', %d min) com validação extra.",
                appointment.getService().getNome(),
                appointment.getService().getDuracaoMin()
        );
    }

    @Override
    public boolean supports(Appointment appointment) {
        return appointment.getService() != null
                && appointment.getService().getDuracaoMin() >= DURACAO_MINIMA_PREMIUM;
    }
}

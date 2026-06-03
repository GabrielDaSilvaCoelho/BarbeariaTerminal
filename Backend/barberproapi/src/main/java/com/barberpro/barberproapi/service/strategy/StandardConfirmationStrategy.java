package com.barberpro.barberproapi.service.strategy;

import com.barberpro.barberproapi.domain.Appointment;
import com.barberpro.barberproapi.domain.AppointmentStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class StandardConfirmationStrategy implements AppointmentConfirmationStrategy {

    @Override
    public String confirm(Appointment appointment) {
        appointment.setStatus(AppointmentStatus.CONFIRMADO);
        appointment.setProcessedAt(LocalDateTime.now());
        return "Agendamento confirmado pelo consumer via estratégia padrão.";
    }

    @Override
    public boolean supports(Appointment appointment) {
        return true;
    }
}

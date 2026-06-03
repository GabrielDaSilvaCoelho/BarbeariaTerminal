package com.barberpro.barberproapi.service.strategy;

import com.barberpro.barberproapi.domain.Appointment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ConfirmationStrategyResolver {

    private final List<AppointmentConfirmationStrategy> strategies;
    public AppointmentConfirmationStrategy resolve(Appointment appointment) {
        return strategies.stream()
                .filter(s -> s.supports(appointment))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Nenhuma strategy encontrada para o agendamento id=" + appointment.getId()
                ));
    }
}

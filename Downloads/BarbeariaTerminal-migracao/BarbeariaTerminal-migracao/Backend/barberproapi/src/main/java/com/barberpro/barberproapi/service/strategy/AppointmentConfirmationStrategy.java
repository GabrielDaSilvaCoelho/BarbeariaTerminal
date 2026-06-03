package com.barberpro.barberproapi.service.strategy;

import com.barberpro.barberproapi.domain.Appointment;

public interface AppointmentConfirmationStrategy {

    String confirm(Appointment appointment);
    boolean supports(Appointment appointment);
}

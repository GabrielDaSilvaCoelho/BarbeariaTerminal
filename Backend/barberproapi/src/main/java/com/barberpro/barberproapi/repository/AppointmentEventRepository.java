package com.barberpro.barberproapi.repository;

import com.barberpro.barberproapi.domain.AppointmentEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentEventRepository extends JpaRepository<AppointmentEvent, Long> {
}

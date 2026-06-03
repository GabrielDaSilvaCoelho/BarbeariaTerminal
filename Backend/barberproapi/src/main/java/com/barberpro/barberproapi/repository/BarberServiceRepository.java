package com.barberpro.barberproapi.repository;

import com.barberpro.barberproapi.domain.BarberService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BarberServiceRepository extends JpaRepository<BarberService, Long> {
    List<BarberService> findByAtivoTrueOrderByIdDesc();
    Optional<BarberService> findByNomeIgnoreCase(String nome);
}

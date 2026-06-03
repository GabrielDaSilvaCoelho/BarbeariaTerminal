package com.barberpro.barberproapi.repository;

import com.barberpro.barberproapi.domain.Appointment;
import com.barberpro.barberproapi.domain.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByStatusInOrderByDataHoraDesc(Collection<AppointmentStatus> statuses);

    List<Appointment> findByBarbeiroIdAndStatusInAndDataHoraBetweenOrderByDataHoraAsc(
        Long barbeiroId,
        Collection<AppointmentStatus> statuses,
        LocalDateTime inicio,
        LocalDateTime fim
);

    List<Appointment> findByClienteIdAndStatusInOrderByDataHoraDesc(Long clienteId, Collection<AppointmentStatus> statuses);

    @Query(value = """
            SELECT a.*
            FROM appointments a
            JOIN services s ON s.id = a.service_id
            WHERE a.barbeiro_id = :barbeiroId
              AND a.status IN ('PENDENTE', 'PROCESSANDO', 'CONFIRMADO')
              AND a.data_hora < :endAt
              AND (a.data_hora + (s.duracao_min * INTERVAL '1 minute')) > :startAt
            LIMIT 1
            """, nativeQuery = true)
    Optional<Appointment> findConflictByRange(
            @Param("barbeiroId") Long barbeiroId,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt
    );
}

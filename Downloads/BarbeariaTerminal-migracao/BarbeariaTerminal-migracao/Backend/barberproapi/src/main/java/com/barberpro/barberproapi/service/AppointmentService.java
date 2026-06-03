package com.barberpro.barberproapi.service;

import com.barberpro.barberproapi.domain.*;
import com.barberpro.barberproapi.dto.AppointmentCreatedEvent;
import com.barberpro.barberproapi.dto.AppointmentRequest;
import com.barberpro.barberproapi.dto.AppointmentResponse;
import com.barberpro.barberproapi.exception.BusinessException;
import com.barberpro.barberproapi.repository.AppointmentEventRepository;
import com.barberpro.barberproapi.repository.AppointmentRepository;
import com.barberpro.barberproapi.repository.BarberServiceRepository;
import com.barberpro.barberproapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentEventRepository appointmentEventRepository;
    private final BarberServiceRepository barberServiceRepository;
    private final UserRepository userRepository;
    private final AppointmentProducer appointmentProducer;
    private final WebSocketNotificationService webSocketNotificationService;

    private static final List<AppointmentStatus> ACTIVE_STATUSES = List.of(
            AppointmentStatus.PENDENTE,
            AppointmentStatus.CONFIRMADO
    );

    private static final List<AppointmentStatus> HISTORY_STATUSES = List.of(
            AppointmentStatus.CONCLUIDO,
            AppointmentStatus.CANCELADO,
            AppointmentStatus.ERRO
    );

    @Transactional
    public AppointmentResponse create(AppointmentRequest request, User clienteLogado) {
        if (clienteLogado.getRole() != UserRole.CLIENTE) {
            throw BusinessException.forbidden("Apenas clientes podem criar agendamentos.");
        }

        BarberService service = barberServiceRepository.findById(request.serviceId())
                .orElseThrow(() -> BusinessException.notFound("Serviço não encontrado."));

        if (!Boolean.TRUE.equals(service.getAtivo())) {
            throw BusinessException.badRequest("Serviço inativo.");
        }

        User barbeiro = userRepository.findById(request.barbeiroId())
                .orElseThrow(() -> BusinessException.notFound("Barbeiro não encontrado."));

        if (barbeiro.getRole() != UserRole.BARBEIRO && barbeiro.getRole() != UserRole.ADMIN) {
            throw BusinessException.badRequest("O usuário selecionado não é barbeiro.");
        }

        LocalDateTime startAt = request.dataHora();
        LocalDateTime endAt = startAt.plusMinutes(service.getDuracaoMin());

        appointmentRepository.findConflictByRange(barbeiro.getId(), startAt, endAt)
                .ifPresent(conflict -> {
                    throw BusinessException.conflict(
                            "Esse horário conflita com outro agendamento já existente para o barbeiro selecionado.");
                });

        Appointment appointment = Appointment.builder()
                .cliente(clienteLogado)
                .barbeiro(barbeiro)
                .service(service)
                .dataHora(startAt)
                .status(AppointmentStatus.PENDENTE)
                .observacoes(normalize(request.observacoes()))
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        saveEvent(saved, "APPOINTMENT_CREATED", null, saved.getStatus().name(),
                "Agendamento criado e aguardando confirmação do barbeiro.");

        appointmentProducer.publishAppointmentCreated(new AppointmentCreatedEvent(
                saved.getId(),
                clienteLogado.getId(),
                barbeiro.getId(),
                service.getId(),
                saved.getDataHora()
        ));

        return AppointmentResponse.from(saved);
    }

    @Transactional(readOnly = true)
public List<String> horariosDisponiveis(Long barbeiroId, Long serviceId, java.time.LocalDate data) {
    BarberService service = barberServiceRepository.findById(serviceId)
            .orElseThrow(() -> BusinessException.notFound("Serviço não encontrado."));

    LocalDateTime inicioDia = data.atTime(0, 0);
    LocalDateTime fimDia = data.atTime(23, 59);

    List<AppointmentStatus> statuses = List.of(
            AppointmentStatus.PENDENTE,
            AppointmentStatus.PROCESSANDO,
            AppointmentStatus.CONFIRMADO
    );

    List<Appointment> agendamentos = appointmentRepository
            .findByBarbeiroIdAndStatusInAndDataHoraBetweenOrderByDataHoraAsc(
                    barbeiroId,
                    statuses,
                    inicioDia,
                    fimDia
            );

    List<String> disponiveis = new java.util.ArrayList<>();

    int inicioExpediente = 9 * 60;
    int fimExpediente = 18 * 60;
    int intervalo = 30;
    int duracaoNovoServico = service.getDuracaoMin();

    for (int minuto = inicioExpediente; minuto + duracaoNovoServico <= fimExpediente; minuto += intervalo) {
        int novoInicio = minuto;
        int novoFim = minuto + duracaoNovoServico;

        boolean ocupado = agendamentos.stream().anyMatch(ag -> {
            int agInicio = ag.getDataHora().getHour() * 60 + ag.getDataHora().getMinute();
            int agFim = agInicio + ag.getService().getDuracaoMin();

            return novoInicio < agFim && novoFim > agInicio;
        });

        if (!ocupado) {
            int hora = minuto / 60;
            int min = minuto % 60;
            disponiveis.add(String.format("%02d:%02d", hora, min));
        }
    }

    return disponiveis;
}

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listAll(User user, String tipo) {
        boolean historico = "historico".equalsIgnoreCase(tipo);
        List<AppointmentStatus> statuses = historico ? HISTORY_STATUSES : ACTIVE_STATUSES;

        if (user.getRole() == UserRole.CLIENTE) {
            return appointmentRepository
                    .findByClienteIdAndStatusInOrderByDataHoraDesc(user.getId(), statuses)
                    .stream()
                    .map(AppointmentResponse::from)
                    .toList();
        }

        return appointmentRepository.findByStatusInOrderByDataHoraDesc(statuses)
                .stream()
                .map(AppointmentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse findById(Long id) {
        return AppointmentResponse.from(findAppointment(id));
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, String statusValue) {
        Appointment appointment = findAppointment(id);
        AppointmentStatus oldStatus = appointment.getStatus();
        AppointmentStatus newStatus = AppointmentStatus.fromString(statusValue);

        if (newStatus == AppointmentStatus.CONCLUIDO) {
            concludeAppointment(appointment, LocalDateTime.now(),
                    "STATUS_UPDATED", "Status alterado manualmente para CONCLUIDO.");
            return AppointmentResponse.from(appointment);
        }

        appointment.setStatus(newStatus);
        if (newStatus == AppointmentStatus.CONFIRMADO) {
            appointment.setProcessedAt(LocalDateTime.now());
        }

        Appointment saved = appointmentRepository.save(appointment);
        saveEvent(saved, "STATUS_UPDATED", oldStatus.name(), newStatus.name(), "Status alterado manualmente.");

        AppointmentResponse response = AppointmentResponse.from(saved);
        webSocketNotificationService.notifyAdmin(response);
        webSocketNotificationService.notifyBarbeiro(String.valueOf(saved.getBarbeiro().getId()), response);

        return response;
    }

    @Transactional
    public AppointmentResponse remove(Long id, User user) {
        Appointment appointment = findAppointment(id);

        boolean isClienteDono = user.getRole() == UserRole.CLIENTE
                && appointment.getCliente().getId().equals(user.getId());
        boolean isAdminOuBarbeiro = user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.BARBEIRO;

        if (!isClienteDono && !isAdminOuBarbeiro) {
            throw BusinessException.forbidden("Você não tem permissão para remover este agendamento.");
        }

        AppointmentStatus oldStatus = appointment.getStatus();
        appointment.setStatus(AppointmentStatus.CANCELADO);
        Appointment saved = appointmentRepository.save(appointment);
        saveEvent(saved, "APPOINTMENT_CANCELLED", oldStatus.name(), saved.getStatus().name(),
                "Agendamento cancelado.");

        AppointmentResponse response = AppointmentResponse.from(saved);
        webSocketNotificationService.notifyAdmin(response);
        webSocketNotificationService.notifyBarbeiro(String.valueOf(saved.getBarbeiro().getId()), response);
        return response;
    }

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void autoComplete() {
        List<Appointment> confirmados = appointmentRepository
                .findByStatusInOrderByDataHoraDesc(List.of(AppointmentStatus.CONFIRMADO));

        LocalDateTime agora = LocalDateTime.now();
        log.info("autoComplete rodando | agora: {} | confirmados encontrados: {}", agora, confirmados.size());

        for (Appointment appt : confirmados) {
            LocalDateTime fim = appt.getDataHora().plusMinutes(appt.getService().getDuracaoMin());
            log.info("Agendamento {} | dataHora: {} | fim: {} | conclui: {}",
                    appt.getId(), appt.getDataHora(), fim, agora.isAfter(fim));

            if (agora.isAfter(fim)) {
                concludeAppointment(appt, agora, "AUTO_COMPLETED",
                        "Concluído automaticamente após horário.");
                log.info("Agendamento {} concluído automaticamente.", appt.getId());
            }
        }
    }

    private void concludeAppointment(Appointment appt, LocalDateTime agora,
                                     String eventType, String eventPayload) {
        AppointmentStatus old = appt.getStatus();
        appt.setStatus(AppointmentStatus.CONCLUIDO);
        appt.setProcessedAt(agora);

        Appointment saved = appointmentRepository.save(appt);
        saveEvent(saved, eventType, old.name(), AppointmentStatus.CONCLUIDO.name(), eventPayload);

        AppointmentResponse response = AppointmentResponse.from(saved);
        webSocketNotificationService.notifyAdmin(response);
        webSocketNotificationService.notifyBarbeiro(String.valueOf(saved.getBarbeiro().getId()), response);
        appointmentProducer.publishAppointmentDone(saved.getId());
    }

    private Appointment findAppointment(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Agendamento não encontrado."));
    }

    private void saveEvent(Appointment appointment, String type,
                           String oldStatus, String newStatus, String payload) {
        AppointmentEvent event = AppointmentEvent.builder()
                .appointment(appointment)
                .eventType(type)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .payload(payload)
                .build();
        appointmentEventRepository.save(event);
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
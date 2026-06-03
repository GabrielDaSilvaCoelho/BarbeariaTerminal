package com.barberpro.barberproapi.service;

import com.barberpro.barberproapi.domain.*;
import com.barberpro.barberproapi.dto.AppointmentRequest;
import com.barberpro.barberproapi.dto.AppointmentResponse;
import com.barberpro.barberproapi.exception.BusinessException;
import com.barberpro.barberproapi.repository.AppointmentEventRepository;
import com.barberpro.barberproapi.repository.AppointmentRepository;
import com.barberpro.barberproapi.repository.BarberServiceRepository;
import com.barberpro.barberproapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AppointmentService - testes unitários")
class AppointmentServiceTest {

    @Mock AppointmentRepository appointmentRepository;
    @Mock AppointmentEventRepository appointmentEventRepository;
    @Mock BarberServiceRepository barberServiceRepository;
    @Mock UserRepository userRepository;
    @Mock AppointmentProducer appointmentProducer;
    @Mock WebSocketNotificationService webSocketNotificationService;

    @InjectMocks AppointmentService appointmentService;

    private User cliente;
    private User barbeiro;
    private BarberService servico;

    @BeforeEach
    void setUp() {
        cliente = User.builder()
                .id(1L)
                .nome("João Cliente")
                .email("joao@email.com")
                .role(UserRole.CLIENTE)
                .build();

        barbeiro = User.builder()
                .id(2L)
                .nome("Carlos Barbeiro")
                .email("carlos@email.com")
                .role(UserRole.BARBEIRO)
                .build();

        servico = BarberService.builder()
                .id(1L)
                .nome("Corte simples")
                .duracaoMin(30)
                .ativo(true)
                .build();
    }

    @Test
    @DisplayName("create: deve lançar exceção quando usuário não é CLIENTE")
    void create_deveRejeitarSeNaoForCliente() {
        User admin = User.builder().id(3L).role(UserRole.ADMIN).build();
        AppointmentRequest req = new AppointmentRequest(1L, 2L, LocalDateTime.now().plusDays(1), null);

        assertThatThrownBy(() -> appointmentService.create(req, admin))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("clientes");
    }

    @Test
    @DisplayName("create: deve lançar exceção quando serviço não existe")
    void create_deveRejeitarServicoInexistente() {
        when(barberServiceRepository.findById(99L)).thenReturn(Optional.empty());
        AppointmentRequest req = new AppointmentRequest(99L, 2L, LocalDateTime.now().plusDays(1), null);

        assertThatThrownBy(() -> appointmentService.create(req, cliente))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Serviço");
    }

    @Test
    @DisplayName("create: deve lançar exceção quando serviço está inativo")
    void create_deveRejeitarServicoInativo() {
        servico.setAtivo(false);
        when(barberServiceRepository.findById(1L)).thenReturn(Optional.of(servico));
        AppointmentRequest req = new AppointmentRequest(1L, 2L, LocalDateTime.now().plusDays(1), null);

        assertThatThrownBy(() -> appointmentService.create(req, cliente))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("inativo");
    }

    @Test
    @DisplayName("create: deve lançar exceção quando barbeiro não existe")
    void create_deveRejeitarBarbeiroInexistente() {
        when(barberServiceRepository.findById(1L)).thenReturn(Optional.of(servico));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        AppointmentRequest req = new AppointmentRequest(1L, 99L, LocalDateTime.now().plusDays(1), null);

        assertThatThrownBy(() -> appointmentService.create(req, cliente))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Barbeiro");
    }

    @Test
    @DisplayName("create: deve lançar exceção em conflito de horário")
    void create_deveRejeitarConflitoDeHorario() {
        when(barberServiceRepository.findById(1L)).thenReturn(Optional.of(servico));
        when(userRepository.findById(2L)).thenReturn(Optional.of(barbeiro));
        when(appointmentRepository.findConflictByRange(eq(2L), any(), any()))
                .thenReturn(Optional.of(new Appointment()));

        AppointmentRequest req = new AppointmentRequest(1L, 2L, LocalDateTime.now().plusDays(1), null);

        assertThatThrownBy(() -> appointmentService.create(req, cliente))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("conflita");
    }

    @Test
    @DisplayName("updateStatus: deve lançar exceção quando agendamento não existe")
    void updateStatus_deveRejeitarIdInexistente() {
        when(appointmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.updateStatus(999L, "CONFIRMADO"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("não encontrado");
    }

    @Test
    @DisplayName("updateStatus: deve atualizar status e notificar via WebSocket")
    void updateStatus_deveAtualizarENotificar() {
        Appointment appt = Appointment.builder()
                .id(1L)
                .cliente(cliente)
                .barbeiro(barbeiro)
                .service(servico)
                .dataHora(LocalDateTime.now().plusDays(1))
                .status(AppointmentStatus.PENDENTE)
                .build();

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appt));
        when(appointmentRepository.save(any())).thenReturn(appt);

        appointmentService.updateStatus(1L, "CONFIRMADO");

        assertThat(appt.getStatus()).isEqualTo(AppointmentStatus.CONFIRMADO);
        verify(webSocketNotificationService, times(1)).notifyAdmin(any());
        verify(webSocketNotificationService, times(1)).notifyBarbeiro(any(), any());
        verify(appointmentEventRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("remove: cliente dono deve conseguir cancelar")
    void remove_clienteDonoPodeCancelar() {
        Appointment appt = Appointment.builder()
                .id(1L)
                .cliente(cliente)
                .barbeiro(barbeiro)
                .service(servico)
                .dataHora(LocalDateTime.now().plusDays(1))
                .status(AppointmentStatus.PENDENTE)
                .build();

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appt));
        when(appointmentRepository.save(any())).thenReturn(appt);

        appointmentService.remove(1L, cliente);

        assertThat(appt.getStatus()).isEqualTo(AppointmentStatus.CANCELADO);
        verify(webSocketNotificationService).notifyAdmin(any());
        verify(webSocketNotificationService).notifyBarbeiro(any(), any());
    }

    @Test
    @DisplayName("remove: cliente que não é dono não pode cancelar")
    void remove_clienteNaoDonodeveSerRejeitado() {
        User outro = User.builder().id(99L).role(UserRole.CLIENTE).build();
        Appointment appt = Appointment.builder()
                .id(1L)
                .cliente(cliente)
                .barbeiro(barbeiro)
                .service(servico)
                .status(AppointmentStatus.PENDENTE)
                .build();

        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(appt));

        assertThatThrownBy(() -> appointmentService.remove(1L, outro))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("permissão");
    }

    @Test
    @DisplayName("listAll: cliente vê apenas seus agendamentos ativos")
    void listAll_clienteVeApenasSeus() {
        when(appointmentRepository.findByClienteIdAndStatusInOrderByDataHoraDesc(eq(1L), anyList()))
                .thenReturn(List.of());

        appointmentService.listAll(cliente, "ativos");

        verify(appointmentRepository).findByClienteIdAndStatusInOrderByDataHoraDesc(eq(1L), anyList());
        verify(appointmentRepository, never()).findByStatusInOrderByDataHoraDesc(anyList());
    }

    @Test
    @DisplayName("listAll: admin vê todos os agendamentos")
    void listAll_adminVeTodos() {
        User admin = User.builder().id(3L).role(UserRole.ADMIN).build();
        when(appointmentRepository.findByStatusInOrderByDataHoraDesc(anyList()))
                .thenReturn(List.of());

        appointmentService.listAll(admin, "ativos");

        verify(appointmentRepository).findByStatusInOrderByDataHoraDesc(anyList());
        verify(appointmentRepository, never())
                .findByClienteIdAndStatusInOrderByDataHoraDesc(anyLong(), anyList());
    }
}
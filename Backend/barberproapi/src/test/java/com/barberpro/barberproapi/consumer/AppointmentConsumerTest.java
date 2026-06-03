package com.barberpro.barberproapi.consumer;

import com.barberpro.barberproapi.dto.AppointmentCreatedEvent;
import com.barberpro.barberproapi.dto.AppointmentResponse;
import com.barberpro.barberproapi.service.AppointmentService;
import com.barberpro.barberproapi.service.WebSocketNotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AppointmentConsumer - testes unitários")
class AppointmentConsumerTest {

    @Mock AppointmentService appointmentService;
    @Mock WebSocketNotificationService webSocketNotificationService;
    @InjectMocks AppointmentConsumer consumer;

    private AppointmentCreatedEvent fakeEvent() {
        return new AppointmentCreatedEvent(
                1L,
                1L,
                2L,
                1L,
                LocalDateTime.now().plusDays(1)
        );
    }

    private AppointmentResponse fakeResponse() {
        return new AppointmentResponse(
                1L,
                LocalDateTime.now().plusDays(1),
                "pendente", null,
                LocalDateTime.now(),
                "João Cliente", 1L,
                "Carlos Barbeiro", 2L,
                "Corte simples",
                BigDecimal.valueOf(40), 30
        );
    }

    @Test
    @DisplayName("consume: deve notificar admin e barbeiro ao receber evento valido")
    void consume_notificaAdminEBarbeiro() {
        AppointmentCreatedEvent event = fakeEvent();
        AppointmentResponse response = fakeResponse();

        Message msg = mock(Message.class);
        MessageProperties props = new MessageProperties();
        props.setReceivedRoutingKey("appointment.barbeiro.2");

        when(msg.getMessageProperties()).thenReturn(props);
        when(appointmentService.findById(1L)).thenReturn(response);

        consumer.consume(event, msg);

        verify(webSocketNotificationService).notifyAdmin(response);
        verify(webSocketNotificationService).notifyBarbeiro("2", response);
    }

    @Test
    @DisplayName("consume: deve ignorar mensagem com routing key inesperada")
    void consume_ignoraMensagemComRoutingKeyErrada() {
        AppointmentCreatedEvent event = fakeEvent();

        Message msg = mock(Message.class);
        MessageProperties props = new MessageProperties();
        props.setReceivedRoutingKey("appointment.barbeiro.99");

        when(msg.getMessageProperties()).thenReturn(props);

        consumer.consume(event, msg);

        verifyNoInteractions(appointmentService);
        verifyNoInteractions(webSocketNotificationService);
    }

    @Test
    @DisplayName("consumeDone: deve notificar admin e barbeiro ao concluir agendamento")
    void consumeDone_notificaAdminEBarbeiro() {
        AppointmentResponse response = fakeResponse();
        when(appointmentService.findById(1L)).thenReturn(response);

        consumer.consumeDone(1L);

        verify(webSocketNotificationService).notifyAdmin(response);
        verify(webSocketNotificationService).notifyBarbeiro("2", response);
    }
}
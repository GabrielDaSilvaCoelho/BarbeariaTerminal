package com.barberpro.barberproapi.consumer;

import com.barberpro.barberproapi.config.RabbitMQConfig;
import com.barberpro.barberproapi.dto.AppointmentCreatedEvent;
import com.barberpro.barberproapi.dto.AppointmentResponse;
import com.barberpro.barberproapi.service.AppointmentService;
import com.barberpro.barberproapi.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentConsumer {

    private final AppointmentService appointmentService;
    private final WebSocketNotificationService webSocketNotificationService;

    @RabbitListener(queues = RabbitMQConfig.APPOINTMENTS_QUEUE)
    public void consume(AppointmentCreatedEvent event, Message message) {
        String routingKey = message.getMessageProperties().getReceivedRoutingKey();
        log.info("Mensagem recebida | routing key: {} | barbeiroId: {} | appointmentId: {}",
                routingKey, event.barbeiroId(), event.appointmentId());

        String expectedKey = RabbitMQConfig.appointmentRoutingKey(event.barbeiroId());
        if (!expectedKey.equals(routingKey)) {
            log.warn("Routing key inesperada: {} (esperado: {}). Mensagem ignorada.", routingKey, expectedKey);
            return;
        }

        AppointmentResponse response = appointmentService.findById(event.appointmentId());
        webSocketNotificationService.notifyAdmin(response);
        webSocketNotificationService.notifyBarbeiro(String.valueOf(event.barbeiroId()), response);

        log.info("Barbeiro {} notificado sobre agendamento {} — aguardando confirmação manual.",
                event.barbeiroId(), event.appointmentId());
    }

    @RabbitListener(queues = RabbitMQConfig.APPOINTMENTS_DONE_QUEUE)
    public void consumeDone(Long appointmentId) {
        log.info("Publish OUT consumido | appointmentId: {}", appointmentId);
        AppointmentResponse response = appointmentService.findById(appointmentId);
        webSocketNotificationService.notifyAdmin(response);
        webSocketNotificationService.notifyBarbeiro(String.valueOf(response.barbeiroId()), response);
        log.info("Agendamento {} marcado como concluído e notificado.", appointmentId);
    }

    @RabbitListener(queues = RabbitMQConfig.HELLO_QUEUE)
    public void consumeHello(String message) {
        log.info("Mensagem recebida da fila hello: {}", message);
    }
}
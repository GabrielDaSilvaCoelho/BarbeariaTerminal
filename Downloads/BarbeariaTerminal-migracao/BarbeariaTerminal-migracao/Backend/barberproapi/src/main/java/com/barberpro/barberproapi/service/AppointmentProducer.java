package com.barberpro.barberproapi.service;

import com.barberpro.barberproapi.config.RabbitMQConfig;
import com.barberpro.barberproapi.dto.AppointmentCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentProducer {

    private final RabbitTemplate rabbitTemplate;

    public void publishAppointmentCreated(AppointmentCreatedEvent event) {
        String routingKey = RabbitMQConfig.appointmentRoutingKey(event.barbeiroId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, routingKey, event);
        log.info("Publish IN | appointmentId: {} | barbeiroId: {}", event.appointmentId(), event.barbeiroId());
    }

    public void publishAppointmentDone(Long appointmentId) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.APPOINTMENT_DONE_ROUTING_KEY,
                appointmentId
        );
        log.info("Publish OUT | appointmentId: {}", appointmentId);
    }

    public void publishHelloMessage(String message) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.HELLO_ROUTING_KEY, message);
    }
}
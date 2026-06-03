package com.barberpro.barberproapi.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE                       = "barberpro.exchange";

    public static final String APPOINTMENTS_QUEUE             = "barberpro.appointments.queue";
    public static final String APPOINTMENT_ROUTING_KEY_PREFIX = "appointment.barbeiro.";

    public static final String APPOINTMENTS_DONE_QUEUE        = "barberpro.appointments.done.queue";
    public static final String APPOINTMENT_DONE_ROUTING_KEY   = "appointment.concluido";

    public static final String HELLO_QUEUE                    = "barberpro.hello.queue";
    public static final String HELLO_ROUTING_KEY              = "hello.message";

    public static String appointmentRoutingKey(Long barbeiroId) {
        return APPOINTMENT_ROUTING_KEY_PREFIX + barbeiroId;
    }

    @Bean
    public TopicExchange barberProExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue appointmentsQueue() {
        return new Queue(APPOINTMENTS_QUEUE, true);
    }

    @Bean
    public Queue appointmentsDoneQueue() {
        return new Queue(APPOINTMENTS_DONE_QUEUE, true);
    }

    @Bean
    public Queue helloQueue() {
        return new Queue(HELLO_QUEUE, false);
    }

    @Bean
    public Binding appointmentsBinding() {
        return BindingBuilder
                .bind(appointmentsQueue())
                .to(barberProExchange())
                .with(APPOINTMENT_ROUTING_KEY_PREFIX + "*");
    }

    @Bean
    public Binding appointmentsDoneBinding() {
        return BindingBuilder
                .bind(appointmentsDoneQueue())
                .to(barberProExchange())
                .with(APPOINTMENT_DONE_ROUTING_KEY);
    }

    @Bean
    public Binding helloBinding() {
        return BindingBuilder
                .bind(helloQueue())
                .to(barberProExchange())
                .with(HELLO_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter jsonMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter);
        return factory;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            MessageConverter jsonMessageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter);
        return rabbitTemplate;
    }
}
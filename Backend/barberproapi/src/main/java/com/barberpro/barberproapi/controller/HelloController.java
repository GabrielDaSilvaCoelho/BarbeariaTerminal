package com.barberpro.barberproapi.controller;

import com.barberpro.barberproapi.dto.HelloMessageRequest;
import com.barberpro.barberproapi.service.AppointmentProducer;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/hello")
@RequiredArgsConstructor
public class HelloController {

    private final AppointmentProducer producer;

    @PostMapping
    public Map<String, Object> send(@Valid @RequestBody HelloMessageRequest request) {
        producer.publishHelloMessage(request.message());
        return Map.of(
                "success", true,
                "message", "Mensagem enviada com sucesso para a fila"
        );
    }
}

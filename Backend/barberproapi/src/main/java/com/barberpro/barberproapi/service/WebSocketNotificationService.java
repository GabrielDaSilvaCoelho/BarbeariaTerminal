package com.barberpro.barberproapi.service;

import com.barberpro.barberproapi.dto.AppointmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyAdmin(AppointmentResponse response) {
        messagingTemplate.convertAndSend("/topic/appointments/admin", response);
    }

    public void notifyBarbeiro(String barbeiroId, AppointmentResponse response) {
        messagingTemplate.convertAndSend("/topic/appointments/" + barbeiroId, response);
    }
}

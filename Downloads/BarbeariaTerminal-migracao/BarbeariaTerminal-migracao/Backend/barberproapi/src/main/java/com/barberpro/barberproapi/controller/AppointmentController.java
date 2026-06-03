package com.barberpro.barberproapi.controller;

import com.barberpro.barberproapi.domain.User;
import com.barberpro.barberproapi.dto.AppointmentRequest;
import com.barberpro.barberproapi.dto.AppointmentResponse;
import com.barberpro.barberproapi.dto.AppointmentStatusRequest;
import com.barberpro.barberproapi.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public List<AppointmentResponse> list(
            Authentication authentication,
            @RequestParam(defaultValue = "ativos") String tipo
    ) {
        User user = (User) authentication.getPrincipal();
        return appointmentService.listAll(user, tipo);
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<AppointmentResponse> create(
            @Valid @RequestBody AppointmentRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.create(request, user));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'BARBEIRO')")
    public AppointmentResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentStatusRequest request
    ) {
        return appointmentService.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    public AppointmentResponse remove(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return appointmentService.remove(id, user);
    }

    @GetMapping("/disponibilidade")
    public List<String> disponibilidade(
            @RequestParam Long barbeiroId,
            @RequestParam Long serviceId,
            @RequestParam String data
    ) {
        return appointmentService.horariosDisponiveis(
                barbeiroId,
                serviceId,
                java.time.LocalDate.parse(data)
        );
    }
}
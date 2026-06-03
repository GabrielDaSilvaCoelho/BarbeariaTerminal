package com.barberpro.barberproapi.controller;

import com.barberpro.barberproapi.dto.BarberServiceRequest;
import com.barberpro.barberproapi.dto.BarberServiceResponse;
import com.barberpro.barberproapi.service.BarberServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class BarberServiceController {

    private final BarberServiceService service;

    @GetMapping
    public List<BarberServiceResponse> list() {
        return service.listAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BARBEIRO')")
    public ResponseEntity<BarberServiceResponse> create(@Valid @RequestBody BarberServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BARBEIRO')")
    public BarberServiceResponse update(@PathVariable Long id, @Valid @RequestBody BarberServiceRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BARBEIRO')")
    public BarberServiceResponse remove(@PathVariable Long id) {
        return service.remove(id);
    }
}

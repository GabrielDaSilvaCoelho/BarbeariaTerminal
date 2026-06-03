package com.barberpro.barberproapi.service;

import com.barberpro.barberproapi.domain.*;
import com.barberpro.barberproapi.repository.AppointmentRepository;
import com.barberpro.barberproapi.repository.BarberServiceRepository;
import com.barberpro.barberproapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BarberServiceRepository barberServiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String senhaHash = passwordEncoder.encode("123456");

        User admin = createUserIfNotExists("Administrador", "admin@barberpro.com", senhaHash, UserRole.ADMIN);
        User barbeiro = createUserIfNotExists("Carlos Barber", "carlos@barberpro.com", senhaHash, UserRole.BARBEIRO);
        User cliente = createUserIfNotExists("João Cliente", "joao@barberpro.com", senhaHash, UserRole.CLIENTE);

        BarberService corte = createServiceIfNotExists(
                "Corte Tradicional",
                "Corte masculino tradicional na tesoura e máquina.",
                new BigDecimal("35.00"),
                40
        );

        createServiceIfNotExists(
                "Barba",
                "Modelagem e acabamento completo da barba.",
                new BigDecimal("25.00"),
                30
        );

        BarberService combo = createServiceIfNotExists(
                "Corte + Barba",
                "Pacote completo com corte e barba.",
                new BigDecimal("55.00"),
                70
        );

        if (appointmentRepository.count() == 0) {
            appointmentRepository.save(Appointment.builder()
                    .cliente(cliente)
                    .barbeiro(barbeiro)
                    .service(corte)
                    .dataHora(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0))
                    .status(AppointmentStatus.PENDENTE)
                    .observacoes("Cliente prefere corte baixo nas laterais.")
                    .build());

            appointmentRepository.save(Appointment.builder()
                    .cliente(cliente)
                    .barbeiro(barbeiro)
                    .service(combo)
                    .dataHora(LocalDateTime.now().plusDays(2).withHour(14).withMinute(30).withSecond(0).withNano(0))
                    .status(AppointmentStatus.CONFIRMADO)
                    .observacoes("Agendamento de demonstração para a apresentação.")
                    .build());

            appointmentRepository.save(Appointment.builder()
                    .cliente(cliente)
                    .barbeiro(barbeiro)
                    .service(corte)
                    .dataHora(LocalDateTime.now().minusDays(2).withHour(9).withMinute(0).withSecond(0).withNano(0))
                    .status(AppointmentStatus.CONCLUIDO)
                    .observacoes("Atendimento finalizado com sucesso.")
                    .processedAt(LocalDateTime.now().minusDays(2).withHour(10).withMinute(0))
                    .build());
        }

        System.out.println("Seed Spring Boot executada.");
        System.out.println("Admin: admin@barberpro.com / 123456");
        System.out.println("Cliente: joao@barberpro.com / 123456");
        System.out.println("Barbeiro: carlos@barberpro.com / 123456");
    }

    private User createUserIfNotExists(String nome, String email, String senhaHash, UserRole role) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User user = existing.get();
            user.setNome(nome);
            user.setSenhaHash(senhaHash);
            user.setRole(role);
            return userRepository.save(user);
        }

        return userRepository.save(User.builder()
                .nome(nome)
                .email(email)
                .senhaHash(senhaHash)
                .role(role)
                .build());
    }

    private BarberService createServiceIfNotExists(String nome, String descricao, BigDecimal preco, Integer duracaoMin) {
        return barberServiceRepository.findByNomeIgnoreCase(nome)
                .orElseGet(() -> barberServiceRepository.save(BarberService.builder()
                        .nome(nome)
                        .descricao(descricao)
                        .preco(preco)
                        .duracaoMin(duracaoMin)
                        .ativo(true)
                        .build()));
    }
}

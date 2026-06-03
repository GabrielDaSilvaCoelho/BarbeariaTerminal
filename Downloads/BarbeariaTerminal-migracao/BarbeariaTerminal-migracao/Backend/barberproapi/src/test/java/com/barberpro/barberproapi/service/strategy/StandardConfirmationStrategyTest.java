package com.barberpro.barberproapi.service.strategy;

import com.barberpro.barberproapi.domain.Appointment;
import com.barberpro.barberproapi.domain.AppointmentStatus;
import com.barberpro.barberproapi.domain.BarberService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Strategy - testes unitários")
class StandardConfirmationStrategyTest {

    StandardConfirmationStrategy standard = new StandardConfirmationStrategy();
    PremiumConfirmationStrategy premium   = new PremiumConfirmationStrategy();

    private Appointment appointmentComDuracao(int duracaoMin) {
        BarberService servico = BarberService.builder()
                .id(1L)
                .nome("Corte")
                .duracaoMin(duracaoMin)
                .ativo(true)
                .build();
        return Appointment.builder()
                .id(1L)
                .service(servico)
                .status(AppointmentStatus.PENDENTE)
                .build();
    }

    @Test
    @DisplayName("Standard: supports retorna true para qualquer agendamento")
    void standard_supportsQualquerAgendamento() {
        assertThat(standard.supports(appointmentComDuracao(30))).isTrue();
        assertThat(standard.supports(appointmentComDuracao(90))).isTrue();
    }

    @Test
    @DisplayName("Standard: confirm muda status para CONFIRMADO")
    void standard_confirmMudaStatus() {
        Appointment appt = appointmentComDuracao(30);
        standard.confirm(appt);
        assertThat(appt.getStatus()).isEqualTo(AppointmentStatus.CONFIRMADO);
        assertThat(appt.getProcessedAt()).isNotNull();
    }

    @Test
    @DisplayName("Standard: confirm retorna mensagem não vazia")
    void standard_confirmRetornaMensagem() {
        String msg = standard.confirm(appointmentComDuracao(30));
        assertThat(msg).isNotBlank();
    }

    @Test
    @DisplayName("Premium: supports retorna true para duração >= 60 min")
    void premium_supportsAgendamentoPremium() {
        assertThat(premium.supports(appointmentComDuracao(60))).isTrue();
        assertThat(premium.supports(appointmentComDuracao(90))).isTrue();
    }

    @Test
    @DisplayName("Premium: supports retorna false para duração < 60 min")
    void premium_naoSuportaAgendamentoCurto() {
        assertThat(premium.supports(appointmentComDuracao(30))).isFalse();
        assertThat(premium.supports(appointmentComDuracao(59))).isFalse();
    }

    @Test
    @DisplayName("Premium: confirm muda status para CONFIRMADO e retorna mensagem com nome do serviço")
    void premium_confirmMudaStatusERetornaMensagem() {
        Appointment appt = appointmentComDuracao(90);
        String msg = premium.confirm(appt);
        assertThat(appt.getStatus()).isEqualTo(AppointmentStatus.CONFIRMADO);
        assertThat(appt.getProcessedAt()).isNotNull();
        assertThat(msg).contains("Corte").contains("90");
    }

    @Test
    @DisplayName("Resolver: escolhe Premium para agendamento longo")
    void resolver_escolhePremiumParaAgendamentoLongo() {
        ConfirmationStrategyResolver resolver =
                new ConfirmationStrategyResolver(List.of(premium, standard));

        AppointmentConfirmationStrategy chosen = resolver.resolve(appointmentComDuracao(90));
        assertThat(chosen).isInstanceOf(PremiumConfirmationStrategy.class);
    }

    @Test
    @DisplayName("Resolver: escolhe Standard para agendamento curto")
    void resolver_escolheStandardParaAgendamentoCurto() {
        ConfirmationStrategyResolver resolver =
                new ConfirmationStrategyResolver(List.of(premium, standard));

        AppointmentConfirmationStrategy chosen = resolver.resolve(appointmentComDuracao(30));
        assertThat(chosen).isInstanceOf(StandardConfirmationStrategy.class);
    }

    @Test
    @DisplayName("Resolver: lança exceção se nenhuma strategy suporta")
    void resolver_lancaExcecaoSemStrategy() {
        ConfirmationStrategyResolver resolver =
                new ConfirmationStrategyResolver(List.of());

        assertThatThrownBy(() -> resolver.resolve(appointmentComDuracao(30)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Nenhuma strategy");
    }
}
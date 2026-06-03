import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Feedback from '../components/Feedback.jsx';
import api, { getApiError } from '../services/api.js';
import { createAppointment } from '../services/appointmentService.js';
import { listServices } from '../services/barberServiceService.js';
import { listBarbeiros } from '../services/userService.js';
import { formatCurrency } from '../services/formatters.js';

export default function NovoAgendamento() {
  const [services, setServices] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);

  const [form, setForm] = useState({
    service_id: '',
    barbeiro_id: '',
    data: '',
    hora: '',
    observacoes: '',
  });

  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'service_id' || name === 'barbeiro_id' || name === 'data'
        ? { hora: '' }
        : {}),
    }));
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesData, barbeirosData] = await Promise.all([
          listServices(),
          listBarbeiros(),
        ]);

        setServices(servicesData);
        setBarbeiros(barbeirosData);
      } catch (error) {
        setFeedback({
          message: getApiError(error, 'Erro ao carregar dados do agendamento.'),
          type: 'error',
        });
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function carregarHorariosDisponiveis() {
      if (!form.service_id || !form.barbeiro_id || !form.data) {
        setHorariosDisponiveis([]);
        return;
      }

      try {
        setLoadingHorarios(true);

        const response = await api.get('/appointments/disponibilidade', {
          params: {
            serviceId: Number(form.service_id),
            barbeiroId: Number(form.barbeiro_id),
            data: form.data,
          },
        });

        setHorariosDisponiveis(response.data);
      } catch (error) {
        setHorariosDisponiveis([]);
        setFeedback({
          message: getApiError(error, 'Erro ao carregar horários disponíveis.'),
          type: 'error',
        });
      } finally {
        setLoadingHorarios(false);
      }
    }

    carregarHorariosDisponiveis();
  }, [form.service_id, form.barbeiro_id, form.data]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setFeedback({ message: '', type: '' });

    try {
      const payload = {
        service_id: Number(form.service_id),
        barbeiro_id: Number(form.barbeiro_id),
        data_hora: `${form.data}T${form.hora}:00`,
        observacoes: form.observacoes.trim() || null,
      };

      await createAppointment(payload);

      setFeedback({
        message: 'Agendamento criado com sucesso.',
        type: 'success',
      });

      setForm({
        service_id: '',
        barbeiro_id: '',
        data: '',
        hora: '',
        observacoes: '',
      });

      setHorariosDisponiveis([]);
    } catch (error) {
      setFeedback({
        message: getApiError(error, 'Erro ao criar agendamento.'),
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="form-page dark">
      <div className="form-card appointment-card">
        <Link to="/dashboard-cliente" className="back-link">
          ← Voltar
        </Link>
        <img
            src="/images/logo-barber.svg"
            alt="Logo BarberPro"
            className="login-logo"
          />
        <h1>Novo Agendamento</h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="service_id">Serviço</label>
          <select
            id="service_id"
            name="service_id"
            value={form.service_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecione</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.nome} - {formatCurrency(service.preco)}
              </option>
            ))}
          </select>

          <label htmlFor="barbeiro_id">Barbeiro</label>
          <select
            id="barbeiro_id"
            name="barbeiro_id"
            value={form.barbeiro_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecione</option>
            {barbeiros.map((barbeiro) => (
              <option key={barbeiro.id} value={barbeiro.id}>
                {barbeiro.nome}
              </option>
            ))}
          </select>

          <label htmlFor="data">Data</label>
          <input
            id="data"
            name="data"
            type="date"
            value={form.data}
            onChange={handleChange}
            required
          />

          <label htmlFor="hora">Hora</label>
          <select
            id="hora"
            name="hora"
            value={form.hora}
            onChange={handleChange}
            disabled={
              !form.service_id ||
              !form.barbeiro_id ||
              !form.data ||
              loadingHorarios
            }
            required
          >
            <option value="">
              {loadingHorarios
                ? 'Carregando horários...'
                : 'Selecione um horário'}
            </option>

            {horariosDisponiveis.map((horario) => (
              <option key={horario} value={horario}>
                {horario}
              </option>
            ))}
          </select>

          {!loadingHorarios &&
            form.service_id &&
            form.barbeiro_id &&
            form.data &&
            horariosDisponiveis.length === 0 && (
              <p className="feedback error">
                Nenhum horário disponível para essa data.
              </p>
            )}

          <label htmlFor="observacoes">Observações</label>
          <textarea
            id="observacoes"
            name="observacoes"
            rows="4"
            value={form.observacoes}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading || loadingHorarios}>
            {loading ? 'Salvando...' : 'Salvar agendamento'}
          </button>
        </form>

        <Feedback message={feedback.message} type={feedback.type} />
      </div>
    </main>
  );
}
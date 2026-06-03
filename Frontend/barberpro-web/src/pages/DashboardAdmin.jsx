import { useEffect, useMemo, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import AppLayout from '../components/AppLayout.jsx';
import AppointmentCard from '../components/AppointmentCard.jsx';
import Feedback from '../components/Feedback.jsx';
import { listAppointments, updateAppointmentStatus } from '../services/appointmentService.js';
import { getApiError } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const menuAdmin    = [{ to: '/dashboard-admin', label: 'Agenda geral' }, { to: '/novo-servico', label: 'Novo serviço' }];
const menuBarbeiro = [{ to: '/dashboard-admin', label: 'Minha agenda' }, { to: '/novo-servico', label: 'Novo serviço' }];

const STATUS_ATIVOS = ['pendente', 'processando', 'confirmado'];

function mergeAppointment(prev, updated) {
  const existe = prev.find((a) => a.id === updated.id);
  if (existe) return prev.map((a) => (a.id === updated.id ? updated : a));
  return [updated, ...prev];
}

export default function DashboardAdmin() {
  const { user } = useAuth();
  const isBarbeiro = user?.role === 'barbeiro';

  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [feedback, setFeedback]         = useState({ message: '', type: '' });
  const [loading, setLoading]           = useState(false);
  const stompClientRef                  = useRef(null);

  async function loadData() {
    setLoading(true);
    setFeedback({ message: 'Carregando agendamentos...', type: '' });
    try {
      const data = await listAppointments('ativos');
      const filtrado = isBarbeiro
        ? data.filter((a) => a.barbeiro_id === user.id)
        : data;
      setAppointments(filtrado);
      setFeedback({ message: filtrado.length ? '' : 'Nenhum agendamento encontrado.', type: '' });
    } catch (error) {
      setFeedback({ message: getApiError(error, 'Erro ao buscar agendamentos.'), type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const topic = isBarbeiro
      ? `/topic/appointments/${user.id}`
      : '/topic/appointments/admin';

    function connectStomp() {
      const client = new Client({
        webSocketFactory: () => new window.SockJS('http://localhost:8080/ws'),
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe(topic, (msg) => {
            const updated = JSON.parse(msg.body);
            setAppointments((prev) => mergeAppointment(prev, updated));
          });
        },
        onStompError: (frame) => console.error('STOMP error:', frame),
      });
      client.activate();
      stompClientRef.current = client;
    }

    if (window.SockJS) {
      connectStomp();
    } else {
      const interval = setInterval(() => {
        if (window.SockJS) { clearInterval(interval); connectStomp(); }
      }, 100);
    }

    return () => stompClientRef.current?.deactivate();
  }, [user.id, isBarbeiro]);

  async function handleStatusChange(id, status) {
    try {

      const updated = await updateAppointmentStatus(id, status);
      if (!STATUS_ATIVOS.includes(updated.status)) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
      } else {
        setAppointments((prev) => mergeAppointment(prev, updated));
      }
    } catch (error) {
      alert(getApiError(error, 'Erro ao atualizar status.'));
    }
  }

  const filteredAppointments = useMemo(() => {
    return statusFilter
      ? appointments.filter((item) => item.status === statusFilter)
      : appointments;
  }, [appointments, statusFilter]);

  return (
    <AppLayout
      title={isBarbeiro ? 'Minha Agenda' : 'Dashboard Administrativo'}
      menu={isBarbeiro ? menuBarbeiro : menuAdmin}
    >
      <section className="panel">
        <div className="panel-header">
          <label htmlFor="status-filter">Filtrar por status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>

        <Feedback
          message={loading ? feedback.message : filteredAppointments.length ? '' : feedback.message}
          type={feedback.type}
        />

        <div className="cards">
          {filteredAppointments.map((item) => (
            <AppointmentCard
              key={item.id}
              appointment={item}
              showClient
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
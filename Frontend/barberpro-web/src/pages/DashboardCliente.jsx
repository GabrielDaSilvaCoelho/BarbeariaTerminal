import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import AppointmentCard from '../components/AppointmentCard.jsx';
import Feedback from '../components/Feedback.jsx';
import { cancelAppointment, listAppointments } from '../services/appointmentService.js';
import { getApiError } from '../services/api.js';

const menu = [
  { to: '/dashboard-cliente', label: 'Meus agendamentos' },
  { to: '/novo-agendamento', label: 'Novo agendamento' },
];

export default function DashboardCliente() {
  const [appointments, setAppointments] = useState([]);
  const [viewFilter, setViewFilter] = useState('ativos');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    setFeedback({ message: 'Carregando agendamentos...', type: '' });

    try {
      const data = await listAppointments(viewFilter);
      setAppointments(data);
      setFeedback({ message: data.length ? '' : 'Nenhum agendamento encontrado.', type: '' });
    } catch (error) {
      setFeedback({ message: getApiError(error, 'Erro ao buscar agendamentos.'), type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [viewFilter]);

  const filteredAppointments = useMemo(() => {
    const term = searchFilter.trim().toLowerCase();

    return appointments.filter((item) => {
      const matchesStatus = statusFilter ? item.status === statusFilter : true;

      const matchesSearch = term
        ? [item.barbeiro_nome, item.servico_nome, item.status]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term))
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchFilter]);

  async function handleCancel(id) {
    const confirmed = window.confirm('Deseja cancelar este agendamento?');
    if (!confirmed) return;

    try {
      await cancelAppointment(id);
      await loadData();
    } catch (error) {
      alert(getApiError(error, 'Erro ao cancelar agendamento.'));
    }
  }

  return (
    <AppLayout title="Meus Agendamentos" menu={menu}>
      <section className="panel">
        <div className="panel-header">
          <div className="filter-group">

            <div>
              <label htmlFor="view-filter">Visualização</label>
              <select id="view-filter" value={viewFilter} onChange={(event) => setViewFilter(event.target.value)}>
                <option value="ativos">Agendamentos ativos</option>
                <option value="historico">Histórico</option>
              </select>
            </div>

            <div>
              <label htmlFor="status-filter">Filtrar por status</label>
              <select id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>

            <div>
              <label htmlFor="search-filter">Buscar</label>
              <input
                id="search-filter"
                type="text"
                placeholder="Buscar por serviço, barbeiro ou status"
                value={searchFilter}
                onChange={(event) => setSearchFilter(event.target.value)}
              />
            </div>
          </div>
        </div>

        <Feedback message={loading ? feedback.message : (filteredAppointments.length ? '' : feedback.message)} type={feedback.type} />

        <div className="cards">
          {filteredAppointments.map((item) => {
            const canCancel = viewFilter === 'ativos' && ['pendente', 'processando', 'confirmado'].includes(item.status);

            return (
              <AppointmentCard
                key={item.id}
                appointment={item}
                canCancel={canCancel}
                onCancel={handleCancel}
              />
            );
          })}
        </div>
      </section>
    </AppLayout>
  );
}

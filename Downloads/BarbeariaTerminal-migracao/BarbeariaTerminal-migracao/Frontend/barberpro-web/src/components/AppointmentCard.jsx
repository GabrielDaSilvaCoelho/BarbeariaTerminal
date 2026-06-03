import StatusBadge from './StatusBadge.jsx';
import { formatCurrency, formatDateTime } from '../services/formatters.js';

export default function AppointmentCard({ appointment, showClient = false, onCancel, onStatusChange, canCancel }) {
  return (
    <div className="card-item">
      <h3>{appointment.servico_nome}</h3>

      {showClient && <p><strong>Cliente:</strong> {appointment.cliente_nome || '-'}</p>}
      <p><strong>Barbeiro:</strong> {appointment.barbeiro_nome || 'Não definido'}</p>
      <p><strong>Preço:</strong> {formatCurrency(appointment.preco)}</p>
      <p><strong>Duração:</strong> {appointment.duracao_min} min</p>
      <p><strong>Data:</strong> {formatDateTime(appointment.data_hora)}</p>
      <p><strong>Status:</strong> <StatusBadge status={appointment.status} /></p>
      <p><strong>Observações:</strong> {appointment.observacoes || '-'}</p>

      {onStatusChange && (
        <div className="actions">
          <button type="button" className="small confirm" onClick={() => onStatusChange(appointment.id, 'confirmado')}>Confirmar</button>
          <button type="button" className="small done" onClick={() => onStatusChange(appointment.id, 'concluido')}>Concluir</button>
          <button type="button" className="small cancel" onClick={() => onStatusChange(appointment.id, 'cancelado')}>Cancelar</button>
        </div>
      )}

      {canCancel && (
        <button type="button" className="btn-danger small" onClick={() => onCancel(appointment.id)}>
          Cancelar
        </button>
      )}
    </div>
  );
}

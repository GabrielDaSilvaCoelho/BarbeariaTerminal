const user = requireRole('cliente');
const userInfo = document.getElementById('user-info');
const logoutBtn = document.getElementById('logout-btn');
const listEl = document.getElementById('appointments-list');
const feedback = document.getElementById('feedback');
const statusFilter = document.getElementById('status-filter');
const searchFilter = document.getElementById('search-filter');
const viewFilter = document.getElementById('view-filter');

userInfo.textContent = `${user.nome} (${user.role})`;

logoutBtn.addEventListener('click', logout);
statusFilter.addEventListener('change', loadAppointments);
searchFilter.addEventListener('input', loadAppointments);
viewFilter.addEventListener('change', loadAppointments);

async function loadAppointments() {
  try {
    feedback.textContent = 'Carregando agendamentos...';
    feedback.className = 'feedback';

    const tipo = viewFilter.value;

    const response = await fetch(`${API_BASE}/appointments?tipo=${tipo}`, {
      headers: authHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar agendamentos.');
    }

    const selectedStatus = statusFilter.value;
    const searchTerm = searchFilter.value.trim().toLowerCase();

    let filtered = selectedStatus
      ? data.filter(item => item.status === selectedStatus)
      : data;

    if (searchTerm) {
      filtered = filtered.filter(item => {
        const barbeiro = (item.barbeiro_nome || '').toLowerCase();
        const servico = (item.servico_nome || '').toLowerCase();
        const status = (item.status || '').toLowerCase();

        return (
          barbeiro.includes(searchTerm) ||
          servico.includes(searchTerm) ||
          status.includes(searchTerm)
        );
      });
    }

    renderAppointments(filtered, tipo);

    feedback.textContent = filtered.length
      ? ''
      : 'Nenhum agendamento encontrado.';
  } catch (error) {
    feedback.textContent = error.message;
    feedback.className = 'feedback error';
  }
}

async function cancelAppointment(id) {
  if (!confirm('Deseja cancelar este agendamento?')) return;

  try {
    const response = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao cancelar agendamento.');
    }

    loadAppointments();
  } catch (error) {
    alert(error.message);
  }
}

function renderAppointments(appointments, tipo) {
  listEl.innerHTML = '';

  appointments.forEach(item => {
    const canCancel =
      tipo === 'ativos' &&
      (item.status === 'pendente' || item.status === 'confirmado');

    const card = document.createElement('div');
    card.className = 'card-item';

    card.innerHTML = `
      <h3>${item.servico_nome}</h3>
      <p><strong>Barbeiro:</strong> ${item.barbeiro_nome || 'Não definido'}</p>
      <p><strong>Preço:</strong> R$ ${Number(item.preco).toFixed(2)}</p>
      <p><strong>Duração:</strong> ${item.duracao_min} min</p>
      <p><strong>Data:</strong> ${new Date(item.data_hora).toLocaleString('pt-BR')}</p>
      <p><strong>Status:</strong> <span class="badge ${item.status}">${item.status}</span></p>
      <p><strong>Observações:</strong> ${item.observacoes || '-'}</p>
      ${canCancel ? `<button class="btn-danger small" data-id="${item.id}">Cancelar</button>` : ''}
    `;

    listEl.appendChild(card);
  });

  document.querySelectorAll('.btn-danger.small').forEach(btn => {
    btn.addEventListener('click', () => cancelAppointment(btn.dataset.id));
  });
}

loadAppointments();
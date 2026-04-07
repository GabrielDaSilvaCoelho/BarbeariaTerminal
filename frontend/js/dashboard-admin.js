const user = requireRole('admin', 'barbeiro');
const userInfo = document.getElementById('user-info');
const logoutBtn = document.getElementById('logout-btn');
const listEl = document.getElementById('appointments-list');
const feedback = document.getElementById('feedback');
const statusFilter = document.getElementById('status-filter');

userInfo.textContent = `${user.nome} (${user.role})`;

logoutBtn.addEventListener('click', logout);
statusFilter.addEventListener('change', loadAppointments);

async function loadAppointments() {
  try {
    feedback.textContent = 'Carregando agendamentos...';
    feedback.className = 'feedback';

    const response = await fetch(`${API_BASE}/appointments`, {
      headers: authHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar agendamentos.');
    }

    const selectedStatus = statusFilter.value;
    const filtered = selectedStatus
      ? data.filter(item => item.status === selectedStatus)
      : data;

    renderAppointments(filtered);

    feedback.textContent = filtered.length
      ? ''
      : 'Nenhum agendamento encontrado.';
  } catch (error) {
    feedback.textContent = error.message;
    feedback.className = 'feedback error';
  }
}

async function updateStatus(id, status) {
  try {
    const response = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao atualizar status.');
    }

    loadAppointments();
  } catch (error) {
    alert(error.message);
  }
}

function renderAppointments(appointments) {
  listEl.innerHTML = '';

  appointments.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card-item';

    card.innerHTML = `
      <h3>${item.servico_nome}</h3>
      <p><strong>Cliente:</strong> ${item.cliente_nome}</p>
      <p><strong>Barbeiro:</strong> ${item.barbeiro_nome || 'Não definido'}</p>
      <p><strong>Preço:</strong> R$ ${Number(item.preco).toFixed(2)}</p>
      <p><strong>Duração:</strong> ${item.duracao_min} min</p>
      <p><strong>Data:</strong> ${new Date(item.data_hora).toLocaleString('pt-BR')}</p>
      <p><strong>Status:</strong> <span class="badge ${item.status}">${item.status}</span></p>
      <p><strong>Observações:</strong> ${item.observacoes || '-'}</p>
      <div class="actions">
        <button class="small confirm" data-id="${item.id}" data-status="confirmado">Confirmar</button>
        <button class="small done" data-id="${item.id}" data-status="concluido">Concluir</button>
        <button class="small cancel" data-id="${item.id}" data-status="cancelado">Cancelar</button>
      </div>
    `;

    listEl.appendChild(card);
  });

  document.querySelectorAll('.actions button').forEach(btn => {
    btn.addEventListener('click', () => updateStatus(btn.dataset.id, btn.dataset.status));
  });
}

loadAppointments();
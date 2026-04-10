requireRole('cliente');

const serviceSelect = document.getElementById('service_id');
const barbeiroSelect = document.getElementById('barbeiro_id');
const form = document.getElementById('appointment-form');
const feedback = document.getElementById('feedback');
const submitBtn = form.querySelector('button[type="submit"]');

async function loadServices() {
  const response = await fetch(`${API_BASE}/services`, {
    headers: authHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao carregar serviços.');
  }

  serviceSelect.innerHTML = '<option value="">Selecione</option>';

  data.forEach(service => {
    const option = document.createElement('option');
    option.value = service.id;
    option.textContent = `${service.nome} - R$ ${Number(service.preco).toFixed(2)}`;
    serviceSelect.appendChild(option);
  });
}

async function loadBarbeiros() {
  const response = await fetch(`${API_BASE}/barbeiros`, {
    headers: authHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao carregar barbeiros.');
  }

  barbeiroSelect.innerHTML = '<option value="">Selecione</option>';

  data.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = `${user.nome}`;
    barbeiroSelect.appendChild(option);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const service_id = document.getElementById('service_id').value;
  const barbeiro_id = document.getElementById('barbeiro_id').value;
  const data = document.getElementById('data').value;
  const hora = document.getElementById('hora').value;
  const observacoes = document.getElementById('observacoes').value.trim();

  const data_hora = `${data}T${hora}:00`;

  try {
    const response = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        service_id,
        barbeiro_id: barbeiro_id || null,
        data_hora,
        observacoes
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao criar agendamento.');
    }

    feedback.textContent = 'Agendamento criado com sucesso.';
    feedback.className = 'feedback success';
    form.reset();
  } catch (error) {
    feedback.textContent = error.message;
    feedback.className = 'feedback error';
  }
});

async function excluirAgendamento(id) {
  const confirmar = confirm('Tem certeza que deseja excluir este agendamento?');

  if (!confirmar) return;

  try {
    const response = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir agendamento.');
    }

    setFeedback('Agendamento removido com sucesso.', 'success');
    loadAppointments();
  } catch (error) {
    setFeedback(error.message, 'error');
  }
}

(async function init() {
  try {
    await loadServices();
    await loadBarbeiros();
  } catch (error) {
    feedback.textContent = error.message;
    feedback.className = 'feedback error';
  }finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Entrar';
  }
})();
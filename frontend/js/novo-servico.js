const user = requireRole('admin', 'barbeiro');
const userInfo = document.getElementById('user-info');
const logoutBtn = document.getElementById('logout-btn');
const form = document.getElementById('service-form');
const feedback = document.getElementById('feedback');
const servicesList = document.getElementById('services-list');

const serviceIdInput = document.getElementById('service-id');
const saveBtn = document.getElementById('save-btn');

userInfo.textContent = `${user.nome} (${user.role})`;
logoutBtn.addEventListener('click', logout);

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = serviceIdInput.value;
  const nome = document.getElementById('nome').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const preco = document.getElementById('preco').value;
  const duracao_min = document.getElementById('duracao_min').value;

  const isEdit = !!id;
  const url = isEdit ? `${API_BASE}/services/${id}` : `${API_BASE}/services`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify({
        nome,
        descricao,
        preco,
        duracao_min,
        ativo: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao salvar serviço.');
    }

    feedback.textContent = isEdit
      ? 'Serviço atualizado com sucesso.'
      : 'Serviço salvo com sucesso.';
    feedback.className = 'feedback success';

    resetForm();
    loadServices();
  } catch (error) {
    feedback.textContent = error.message;
    feedback.className = 'feedback error';
  }
});

async function loadServices() {
  try {
    const response = await fetch(`${API_BASE}/services`, {
      headers: authHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao carregar serviços.');
    }

    renderServices(data);
  } catch (error) {
    servicesList.innerHTML = `<p>${error.message}</p>`;
  }
}

function editService(service) {
  serviceIdInput.value = service.id;
  document.getElementById('nome').value = service.nome;
  document.getElementById('descricao').value = service.descricao || '';
  document.getElementById('preco').value = service.preco;
  document.getElementById('duracao_min').value = service.duracao_min;

  saveBtn.textContent = 'Atualizar serviço';
  feedback.textContent = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteService(id) {
  const confirmed = confirm('Deseja realmente excluir este serviço?');
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE}/services/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao excluir serviço.');
    }

    feedback.textContent = 'Serviço excluído com sucesso.';
    feedback.className = 'feedback success';

    if (serviceIdInput.value === String(id)) {
      resetForm();
    }

    loadServices();
  } catch (error) {
    alert(error.message);
  }
}

function renderServices(services) {
  servicesList.innerHTML = '';

  if (!services.length) {
    servicesList.innerHTML = '<p>Nenhum serviço cadastrado.</p>';
    return;
  }

  services.forEach(service => {
    const card = document.createElement('div');
    card.className = 'card-item';

    card.innerHTML = `
      <h3>${service.nome}</h3>
      <p><strong>Descrição:</strong> ${service.descricao || '-'}</p>
      <p><strong>Preço:</strong> R$ ${Number(service.preco).toFixed(2)}</p>
      <p><strong>Duração:</strong> ${service.duracao_min} min</p>

      <div class="actions">
        <button class="small edit" data-id="${service.id}">Editar</button>
        <button class="small delete" data-id="${service.id}">Excluir</button>
      </div>
    `;

    servicesList.appendChild(card);

    card.querySelector('.edit').addEventListener('click', () => editService(service));
    card.querySelector('.delete').addEventListener('click', () => deleteService(service.id));
  });
}

function resetForm() {
  form.reset();
  serviceIdInput.value = '';
  saveBtn.textContent = 'Salvar serviço';
}

loadServices();
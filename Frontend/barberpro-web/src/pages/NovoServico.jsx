import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout.jsx';
import Feedback from '../components/Feedback.jsx';
import { getApiError } from '../services/api.js';
import { createService, deleteService, listServices, updateService } from '../services/barberServiceService.js';
import { formatCurrency } from '../services/formatters.js';

const menu = [
  { to: '/dashboard-admin', label: 'Dashboard' },
  { to: '/novo-servico', label: 'Serviços' },
];

const emptyForm = {
  id: '',
  nome: '',
  descricao: '',
  preco: '',
  duracao_min: '',
};

export default function NovoServico() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(form.id);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
  }

  async function loadData() {
    try {
      const data = await listServices();
      setServices(data);
    } catch (error) {
      setFeedback({ message: getApiError(error, 'Erro ao carregar serviços.'), type: 'error' });
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setFeedback({ message: '', type: '' });

    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      preco: Number(form.preco),
      duracao_min: Number(form.duracao_min),
      ativo: true,
    };

    try {
      if (isEdit) {
        await updateService(form.id, payload);
      } else {
        await createService(payload);
      }

      setFeedback({
        message: isEdit ? 'Serviço atualizado com sucesso.' : 'Serviço salvo com sucesso.',
        type: 'success',
      });

      resetForm();
      await loadData();
    } catch (error) {
      setFeedback({ message: getApiError(error, 'Erro ao salvar serviço.'), type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(service) {
    setForm({
      id: service.id,
      nome: service.nome || '',
      descricao: service.descricao || '',
      preco: service.preco ?? '',
      duracao_min: service.duracao_min ?? '',
    });

    setFeedback({ message: '', type: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Deseja realmente excluir este serviço?');
    if (!confirmed) return;

    try {
      await deleteService(id);
      setFeedback({ message: 'Serviço excluído com sucesso.', type: 'success' });

      if (String(form.id) === String(id)) {
        resetForm();
      }

      await loadData();
    } catch (error) {
      alert(getApiError(error, 'Erro ao excluir serviço.'));
    }
  }

  return (
    <AppLayout title="Gerenciar Serviços" menu={menu}>
      <section className="panel">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input id="nome" name="nome" type="text" value={form.nome} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="descricao">Descrição</label>
            <textarea id="descricao" name="descricao" value={form.descricao} onChange={handleChange} />
          </div>

          <div className="grid">
            <div className="field">
              <label htmlFor="preco">Preço</label>
              <input id="preco" name="preco" type="number" step="0.01" value={form.preco} onChange={handleChange} required />
            </div>

            <div className="field">
              <label htmlFor="duracao_min">Duração (min)</label>
              <input id="duracao_min" name="duracao_min" type="number" value={form.duracao_min} onChange={handleChange} required />
            </div>
          </div>

          <div className="actions form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : isEdit ? 'Atualizar serviço' : 'Salvar serviço'}
            </button>

            {isEdit && (
              <button type="button" className="small neutral" onClick={resetForm}>Cancelar edição</button>
            )}
          </div>
        </form>

        <Feedback message={feedback.message} type={feedback.type} />

        <hr />

        <h3>Serviços cadastrados</h3>
        <div className="cards">
          {!services.length && <p>Nenhum serviço cadastrado.</p>}

          {services.map((service) => (
            <div className="card-item" key={service.id}>
              <h3>{service.nome}</h3>
              <p><strong>Descrição:</strong> {service.descricao || '-'}</p>
              <p><strong>Preço:</strong> {formatCurrency(service.preco)}</p>
              <p><strong>Duração:</strong> {service.duracao_min} min</p>

              <div className="actions">
                <button type="button" className="small edit" onClick={() => handleEdit(service)}>Editar</button>
                <button type="button" className="small delete" onClick={() => handleDelete(service.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}

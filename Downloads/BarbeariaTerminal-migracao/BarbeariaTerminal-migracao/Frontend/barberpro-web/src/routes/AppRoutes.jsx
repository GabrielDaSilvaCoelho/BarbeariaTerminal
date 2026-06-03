import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Login from '../pages/Login.jsx';
import Cadastro from '../pages/Cadastro.jsx';
import DashboardCliente from '../pages/DashboardCliente.jsx';
import DashboardAdmin from '../pages/DashboardAdmin.jsx';
import NovoAgendamento from '../pages/NovoAgendamento.jsx';
import NovoServico from '../pages/NovoServico.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      <Route element={<ProtectedRoute allowedRoles={["cliente"]} />}>
        <Route path="/dashboard-cliente" element={<DashboardCliente />} />
        <Route path="/novo-agendamento" element={<NovoAgendamento />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin", "barbeiro"]} />}>
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/novo-servico" element={<NovoServico />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}


import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Invoices from './pages/Invoices';

// Re-verified routing for Leads, Products, Sales

// Protected Route Component
const ProtectedRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-dark-bg text-white">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if profile is loaded and approved
  if (profile && !profile.is_approved) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-dark-bg p-4 text-center">
        <div className="glass p-8 rounded-2xl max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">Aguardando Aprovação</h2>
          <p className="text-gray-400">Seu cadastro foi realizado com sucesso. Aguarde um administrador ativar sua conta para acessar o sistema.</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-brand-700 text-white rounded-lg">Verificar novamente</button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/products" element={<Products />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/invoices" element={<Invoices />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

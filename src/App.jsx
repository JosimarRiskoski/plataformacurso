import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import TenantHome from './pages/TenantHome';
import WatchPage from './pages/WatchPage';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import CourseEditor from './pages/Admin/CourseEditor';
import CheckoutPage from './pages/Checkout';
import PlatformSignup from './pages/PlatformSignup';
import SetupPending from './pages/SetupPending';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota raiz: Landing Page de Venda do Software */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup-platform" element={<PlatformSignup />} />


          {/* Simulação de rota de tenant (em produção seria por subdomínio) */}
          <Route path="/:tenantSlug" element={<TenantHome />} />
          {/* Simulação de rota de tenant (em produção seria por subdomínio) */}
          <Route path="/:tenantSlug" element={<TenantHome />} />
          <Route path="/:tenantSlug/setup-pending" element={<SetupPending />} />
          <Route path="/:tenantSlug/login" element={<LoginPage />} />
          <Route path="/:tenantSlug/register" element={<RegisterPage />} />

          {/* Área Administrativa (Produtor) */}
          <Route path="/:tenantSlug/admin" element={<AdminDashboard />} />
          <Route path="/:tenantSlug/admin/courses" element={<AdminDashboard />} />
          <Route path="/:tenantSlug/admin/courses/new" element={<CourseEditor />} />
          <Route path="/:tenantSlug/admin/courses/:courseId" element={<CourseEditor />} />

          {/* Rota do Player (Curso e Aula) */}
          <Route path="/:tenantSlug/assistir/:courseId" element={<WatchPage />} />
          <Route path="/:tenantSlug/assistir/:courseId/:lessonId" element={<WatchPage />} />

          {/* Checkout (Simulação) */}
          <Route path="/:tenantSlug/checkout/:courseId" element={<CheckoutPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

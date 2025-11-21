import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Merchants from './pages/Merchants';
import Cases from './pages/Cases';
import Orders from './pages/Orders';
import { getCurrentUser } from './services/api';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      getCurrentUser()
        .then((res: any) => {
          if (res.data?.role === 'admin') {
            setUser(res.data);
          } else {
            localStorage.removeItem('admin_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>加载中...</div>;
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={() => { localStorage.removeItem('admin_token'); setUser(null); }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/merchants" element={<Merchants />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/Layout/MainLayout'
import Home from './pages/Home/index'
import Cases from './pages/Cases/index'
import CaseDetail from './pages/CaseDetail/index'
import Designers from './pages/Designers/index'
import DesignerDetail from './pages/DesignerDetail/index'
import Login from './pages/Login/index'
import Register from './pages/Register/index'
import UserCenter from './pages/UserCenter/index'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="cases" element={<Cases />} />
          <Route path="cases/:id" element={<CaseDetail />} />
          <Route path="designers" element={<Designers />} />
          <Route path="designers/:id" element={<DesignerDetail />} />
          <Route path="user" element={<UserCenter />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

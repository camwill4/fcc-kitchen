import { useState } from 'react'
import NavBar from './components/NavBar'
import Dashboard from './components/Dashboard'
import CountForm from './components/CountForm'
import OrderOutput from './components/OrderOutput'
import ProductManager from './components/ProductManager'

export default function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col">
      <NavBar page={page} onNavigate={setPage} />
      <main className="flex-1 overflow-y-auto">
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'count'     && <CountForm onNavigate={setPage} />}
        {page === 'order'     && <OrderOutput onNavigate={setPage} />}
        {page === 'manage'    && <ProductManager />}
      </main>
    </div>
  )
}

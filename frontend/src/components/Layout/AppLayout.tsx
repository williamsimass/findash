import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transações',
  '/installments': 'Parcelas',
  '/profile':      'Configurações',
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] || 'FinDash'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

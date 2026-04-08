import { Menu, Sun, Moon, LogOut, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface HeaderProps {
  onMenuClick: () => void
  title: string
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
    toast.success('Até logo! 👋')
  }

  return (
    <header className="h-16 shrink-0 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 dark:text-gray-400 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 dark:text-gray-400 transition-colors"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications placeholder */}
        <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 dark:text-gray-400 transition-colors relative">
          <Bell className="w-4.5 h-4.5" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-base cursor-pointer"
          title={user?.full_name}
        >
          {user?.avatar_icon || '👤'}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-500 dark:text-gray-400 hover:text-rose-500 transition-colors"
          title="Sair"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  )
}

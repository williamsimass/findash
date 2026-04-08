import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, CreditCard,
  Settings, X, TrendingUp, Sparkles, MessageCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'
import { useEffect, useState } from 'react'
import { CURRENT_VERSION, CHANGELOG_SEEN_KEY } from '../../pages/Changelog'

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight,   label: 'Transações' },
  { to: '/installments', icon: CreditCard,        label: 'Parcelas' },
  { to: '/profile',      icon: Settings,          label: 'Configurações' },
]

function useHasNewUpdate() {
  const [hasNew, setHasNew] = useState(() => {
    return localStorage.getItem(CHANGELOG_SEEN_KEY) !== CURRENT_VERSION
  })

  useEffect(() => {
    function onSeen() { setHasNew(false) }
    window.addEventListener('changelog-seen', onSeen)
    return () => window.removeEventListener('changelog-seen', onSeen)
  }, [])

  return hasNew
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth()
  const hasNewUpdate = useHasNewUpdate()

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-200 dark:border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          FinDash
        </span>
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="ml-auto lg:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 dark:text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white'
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom links: Changelog + Contact */}
      <div className="px-3 pb-2 space-y-1">
        <NavLink
          to="/changelog"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white'
            )
          }
        >
          <div className="relative shrink-0">
            <Sparkles className="w-5 h-5" />
            {hasNewUpdate && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-gray-900 animate-pulse" />
            )}
          </div>
          <span>Notas de Atualização</span>
          {hasNewUpdate && (
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold leading-none">
              Novo
            </span>
          )}
        </NavLink>

        <NavLink
          to="/contact"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white'
            )
          }
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
          Contato
        </NavLink>
      </div>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-gray-800">
        <NavLink
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors group"
        >
          <div className="w-9 h-9 rounded-full bg-brand-500/10 flex items-center justify-center text-lg shrink-0">
            {user?.avatar_icon || '👤'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {user?.full_name || user?.username}
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
        </NavLink>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800 h-screen sticky top-0 flex-col">
        {content}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800 flex flex-col lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

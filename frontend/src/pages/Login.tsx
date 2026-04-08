import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, TrendingUp, DollarSign, PieChart, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'
import type { User } from '../types'

type Tab = 'login' | 'register'

interface LoginForm { username: string; password: string }
interface RegisterForm { username: string; email: string; full_name: string; password: string; confirm: string }

export default function Login() {
  const [tab, setTab] = useState<Tab>('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const loginForm  = useForm<LoginForm>()
  const regForm    = useForm<RegisterForm>()

  async function onLogin(data: LoginForm) {
    setLoading(true)
    try {
      const res = await authApi.login(data.username, data.password)
      setAuth(res.data.user as User, res.data.access_token)
      toast.success(`Bem-vindo, ${res.data.user.full_name}! 🎉`)
      navigate('/dashboard')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Erro ao entrar'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function onRegister(data: RegisterForm) {
    if (data.password !== data.confirm) {
      toast.error('As senhas não conferem')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.register({
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        password: data.password,
      })
      setAuth(res.data.user as User, res.data.access_token)
      toast.success('Conta criada com sucesso! 🎉')
      navigate('/dashboard')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Erro ao cadastrar'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-gray-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-500 to-violet-400 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-900/30 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">FinDash</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Controle total<br />das suas finanças
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Gerencie receitas, gastos e parcelas em tempo real com um dashboard profissional e intuitivo.
          </p>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: DollarSign, label: 'Saldo em tempo real',     desc: 'Veja seu saldo atualizado a cada transação' },
            { icon: PieChart,   label: 'Análise por categoria',   desc: 'Gráficos detalhados dos seus gastos' },
            { icon: TrendingUp, label: 'Parcelas inteligentes',   desc: 'Controle cada parcela do cartão de crédito' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-4 bg-white/10 backdrop-blur rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-white/70 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">FinDash</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="card p-8">
            {/* Theme toggle */}
            <div className="flex justify-end mb-2">
              <button
                onClick={toggleTheme}
                className="text-xs text-slate-400 dark:text-gray-500 hover:text-brand-500 transition-colors"
              >
                {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo escuro'}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-gray-800 rounded-xl p-1 mb-8">
              {(['login', 'register'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200',
                    tab === t
                      ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'
                  )}
                >
                  {t === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-5"
                >
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      Bem-vindo de volta! 👋
                    </p>
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                      Entre com suas credenciais para continuar.
                    </p>
                  </div>

                  <div>
                    <label className="label">Usuário</label>
                    <input
                      className="input-base"
                      placeholder="seu_usuario"
                      {...loginForm.register('username', { required: true })}
                    />
                  </div>

                  <div>
                    <label className="label">Senha</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        className="input-base pr-12"
                        placeholder="••••••••"
                        {...loginForm.register('password', { required: true })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    {loading ? 'Entrando...' : 'Entrar'}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={regForm.handleSubmit(onRegister)}
                  className="space-y-4"
                >
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      Crie sua conta ✨
                    </p>
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                      Comece a controlar suas finanças hoje.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Nome completo</label>
                      <input className="input-base" placeholder="João Silva"
                        {...regForm.register('full_name', { required: true })} />
                    </div>
                    <div>
                      <label className="label">Usuário</label>
                      <input className="input-base" placeholder="joao123"
                        {...regForm.register('username', { required: true })} />
                    </div>
                  </div>

                  <div>
                    <label className="label">E-mail</label>
                    <input type="email" className="input-base" placeholder="joao@email.com"
                      {...regForm.register('email', { required: true })} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Senha</label>
                      <input type="password" className="input-base" placeholder="••••••••"
                        {...regForm.register('password', { required: true, minLength: 6 })} />
                    </div>
                    <div>
                      <label className="label">Confirmar</label>
                      <input type="password" className="input-base" placeholder="••••••••"
                        {...regForm.register('confirm', { required: true })} />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    {loading ? 'Criando conta...' : 'Criar conta'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

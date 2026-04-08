import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { User, Lock, Palette, Save, Sun, Moon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { AVATAR_ICONS } from '../types'
import { cn } from '../lib/utils'

interface ProfileForm  { full_name: string }
interface PasswordForm { current_password: string; new_password: string; confirm: string }

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [saving, setSaving]       = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [avatar, setAvatar]       = useState(user?.avatar_icon || '👤')

  const pf = useForm<ProfileForm>({ defaultValues: { full_name: user?.full_name || '' } })
  const pw = useForm<PasswordForm>()

  async function saveProfile(data: ProfileForm) {
    setSaving(true)
    try {
      await updateUser({ full_name: data.full_name, avatar_icon: avatar })
      toast.success('Perfil atualizado! ✅')
    } catch {
      toast.error('Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarChange(icon: string) {
    setAvatar(icon)
    try {
      await updateUser({ avatar_icon: icon })
      toast.success('Avatar atualizado!')
    } catch {
      toast.error('Erro ao atualizar avatar')
    }
  }

  async function handleThemeChange(t: 'dark' | 'light') {
    setTheme(t)
    try {
      await updateUser({ theme: t })
    } catch { /* silent */ }
  }

  async function savePassword(data: PasswordForm) {
    if (data.new_password !== data.confirm) {
      toast.error('As senhas não conferem')
      return
    }
    setSavingPass(true)
    try {
      await usersApi.changePassword(data.current_password, data.new_password)
      toast.success('Senha alterada com sucesso!')
      pw.reset()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Erro ao alterar senha'
      toast.error(msg)
    } finally {
      setSavingPass(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Avatar section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
            <Palette className="w-4 h-4 text-brand-500" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Ícone do Perfil</h3>
        </div>

        {/* Current avatar preview */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-3xl">
            {avatar}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.full_name}</p>
            <p className="text-sm text-slate-500 dark:text-gray-400">@{user?.username}</p>
          </div>
        </div>

        {/* Avatar grid */}
        <div className="grid grid-cols-8 gap-2">
          {AVATAR_ICONS.map((icon) => (
            <button
              key={icon}
              onClick={() => handleAvatarChange(icon)}
              className={cn(
                'w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all hover:scale-110',
                avatar === icon
                  ? 'bg-brand-500 shadow-md shadow-brand-500/30 scale-110 ring-2 ring-brand-300'
                  : 'bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700'
              )}
            >
              {icon}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Theme section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-brand-500" /> : <Sun className="w-4 h-4 text-brand-500" />}
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Tema</h3>
        </div>

        <div className="flex gap-3">
          {([
            { value: 'light' as const, icon: Sun,  label: 'Claro' },
            { value: 'dark'  as const, icon: Moon, label: 'Escuro' },
          ]).map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => handleThemeChange(value)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all border-2',
                theme === value
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25'
                  : 'bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-gray-700 hover:border-brand-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Profile info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
            <User className="w-4 h-4 text-brand-500" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Informações Pessoais</h3>
        </div>

        <form onSubmit={pf.handleSubmit(saveProfile)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nome completo</label>
              <input
                className="input-base"
                {...pf.register('full_name', { required: true })}
              />
            </div>
            <div>
              <label className="label">Usuário</label>
              <input className="input-base opacity-50 cursor-not-allowed" value={user?.username || ''} disabled />
            </div>
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input-base opacity-50 cursor-not-allowed" value={user?.email || ''} disabled />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </form>
      </motion.div>

      {/* Change password */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <Lock className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Alterar Senha</h3>
        </div>

        <form onSubmit={pw.handleSubmit(savePassword)} className="space-y-4">
          <div>
            <label className="label">Senha atual</label>
            <input type="password" className="input-base" placeholder="••••••••"
              {...pw.register('current_password', { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nova senha</label>
              <input type="password" className="input-base" placeholder="••••••••"
                {...pw.register('new_password', { required: true, minLength: 6 })} />
            </div>
            <div>
              <label className="label">Confirmar</label>
              <input type="password" className="input-base" placeholder="••••••••"
                {...pw.register('confirm', { required: true })} />
            </div>
          </div>

          <button type="submit" disabled={savingPass} className="btn-danger">
            {savingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {savingPass ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

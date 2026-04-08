import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatMonthYear(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM/yyyy', { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd 'de' MMM", { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function currentMonthISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

export function nextMonthFirstISO(): string {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return next.toISOString().slice(0, 10)
}

export function isSameMonth(dateStr: string): boolean {
  try {
    const d = parseISO(dateStr)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  } catch {
    return false
  }
}

export function isDueSoon(dateStr: string): boolean {
  try {
    const d = parseISO(dateStr)
    const now = new Date()
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  } catch {
    return false
  }
}

export function isOverdue(dateStr: string): boolean {
  try {
    const d = parseISO(dateStr)
    return d < new Date()
  } catch {
    return false
  }
}

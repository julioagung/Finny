import type { AppState } from '../types'

// Default categories — selalu ada untuk semua user baru
export const defaultCategories: AppState['categories'] = [
  { id: 'c1', name: 'Gaji', type: 'income', icon: '💼', color: '#27AE60' },
  { id: 'c2', name: 'Freelance', type: 'income', icon: '💻', color: '#2980B9' },
  { id: 'c3', name: 'Bonus', type: 'income', icon: '🎁', color: '#8E44AD' },
  { id: 'c4', name: 'Bisnis', type: 'income', icon: '📈', color: '#E67E22' },
  { id: 'c5', name: 'Lainnya', type: 'income', icon: '✨', color: '#16A085' },
  { id: 'c6', name: 'Makanan', type: 'expense', icon: '🍜', color: '#E74C3C' },
  { id: 'c7', name: 'Transportasi', type: 'expense', icon: '🚗', color: '#E67E22' },
  { id: 'c8', name: 'Hiburan', type: 'expense', icon: '🎮', color: '#9B59B6' },
  { id: 'c9', name: 'Belanja', type: 'expense', icon: '🛍️', color: '#E91E8C' },
  { id: 'c10', name: 'Tagihan', type: 'expense', icon: '📄', color: '#7F8C8D' },
  { id: 'c11', name: 'Kesehatan', type: 'expense', icon: '💊', color: '#1ABC9C' },
  { id: 'c12', name: 'Kopi', type: 'expense', icon: '☕', color: '#795548' },
  { id: 'c13', name: 'Internet', type: 'expense', icon: '📶', color: '#3498DB' },
  { id: 'c14', name: 'Gym', type: 'expense', icon: '💪', color: '#F39C12' },
  { id: 'c15', name: 'Pendidikan', type: 'expense', icon: '📚', color: '#2ECC71' },
  { id: 'c16', name: 'Lainnya', type: 'expense', icon: '📦', color: '#95A5A6' },
]

export const seedData: AppState = {
  userName: 'User',
  darkMode: false,
  profilePhoto: null,
  notifications: [],
  notificationSettings: {
    budgetWarning: true,
    recurringReminder: true,
    goalsMilestone: true,
    lowBalance: true,
  },
  wallets: [],
  categories: defaultCategories,
  transactions: [],
  budgets: [],
  savingsGoals: [],
  recurringTransactions: [],
}

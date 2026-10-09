import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { AppState, Transaction, Wallet, Budget, SavingsGoal, RecurringTransaction, Category, AppNotification, NotificationSettings } from '../types'
import { seedData } from '../data/seed'

type Action =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'EDIT_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_WALLET'; payload: Wallet }
  | { type: 'EDIT_WALLET'; payload: Wallet }
  | { type: 'DELETE_WALLET'; payload: string }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'EDIT_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'ADD_GOAL'; payload: SavingsGoal }
  | { type: 'EDIT_GOAL'; payload: SavingsGoal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_RECURRING'; payload: RecurringTransaction }
  | { type: 'DELETE_RECURRING'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'EDIT_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_USER_NAME'; payload: string }
  | { type: 'SET_PROFILE_PHOTO'; payload: string | null }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DISMISS_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'UPDATE_NOTIFICATION_SETTINGS'; payload: Partial<NotificationSettings> }
  | { type: 'RESET_DATA' }


function applyTransactionToWallets(wallets: Wallet[], tx: Transaction, reverse = false): Wallet[] {
  const sign = reverse ? -1 : 1
  return wallets.map(w => {
    if (tx.type === 'income' && w.id === tx.walletId) return { ...w, balance: w.balance + sign * tx.amount }
    if (tx.type === 'expense' && w.id === tx.walletId) return { ...w, balance: w.balance - sign * tx.amount }
    if (tx.type === 'transfer') {
      if (w.id === tx.walletId) return { ...w, balance: w.balance - sign * tx.amount }
      if (w.id === tx.toWalletId) return { ...w, balance: w.balance + sign * tx.amount }
    }
    return w
  })
}

// Generate smart notifications based on current state after a mutation
function generateNotifications(state: AppState, newNotifs: AppNotification[]): AppNotification[] {
  const existingIds = new Set(state.notifications.map(n => n.id))
  return [...newNotifs.filter(n => !existingIds.has(n.id)), ...state.notifications].slice(0, 50)
}

function checkBudgetNotifications(state: AppState): AppNotification[] {
  if (!state.notificationSettings.budgetWarning) return []
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  const notifs: AppNotification[] = []

  state.budgets.forEach(b => {
    const cat = state.categories.find(c => c.id === b.categoryId)
    const spent = state.transactions
      .filter(t => t.type === 'expense' && t.categoryId === b.categoryId) 
      .filter(t => { const d = new Date(t.date); return d.getMonth() === month && d.getFullYear() === year })
      .reduce((s, t) => s + t.amount, 0)
    const pct = (spent / b.limit) * 100
    const key80 = `budget-warn-${b.id}-${year}-${month}`
    const key100 = `budget-exceed-${b.id}-${year}-${month}`

    if (pct >= 100 && !state.notifications.find(n => n.id === key100)) {
      notifs.push({ id: key100, type: 'budget_exceeded', title: 'Budget Terlampaui!', message: `Budget ${cat?.name ?? 'kategori ini'} sudah melebihi limit bulan ini.`, icon: '🚨', read: false, createdAt: new Date().toISOString(), linkTo: 'budget' })
    } else if (pct >= 80 && pct < 100 && !state.notifications.find(n => n.id === key80)) {
      notifs.push({ id: key80, type: 'budget_warning', title: 'Budget Hampir Habis', message: `${cat?.name ?? 'Budget'} sudah ${Math.round(pct)}% dari limit. You're getting close 💗`, icon: '⚠️', read: false, createdAt: new Date().toISOString(), linkTo: 'budget' })
    }
  })
  return notifs
}

function checkRecurringNotifications(state: AppState): AppNotification[] {
  if (!state.notificationSettings.recurringReminder) return []
  const now = new Date()
  const today = now.getDate()
  const notifs: AppNotification[] = []

  state.recurringTransactions.forEach(r => {
    const diff = r.dayOfMonth - today
    if (diff >= 0 && diff <= 2) {
      const key = `recurring-${r.id}-${now.getFullYear()}-${now.getMonth()}`
      if (!state.notifications.find(n => n.id === key)) {
        const when = diff === 0 ? 'hari ini' : diff === 1 ? 'besok' : 'lusa'
        notifs.push({ id: key, type: 'recurring_due', title: 'Transaksi Rutin', message: `${r.name} sebesar Rp ${r.amount.toLocaleString('id-ID')} jatuh tempo ${when}.`, icon: '🔄', read: false, createdAt: new Date().toISOString(), linkTo: 'recurring' })
      }
    }
  })
  return notifs
}

function checkGoalNotifications(state: AppState): AppNotification[] {
  if (!state.notificationSettings.goalsMilestone) return []
  const notifs: AppNotification[] = []

  state.savingsGoals.forEach(g => {
    const pct = (g.currentAmount / g.targetAmount) * 100
    const milestones = [25, 50, 75, 100]
    milestones.forEach(m => {
      if (pct >= m) {
        const key = `goal-${g.id}-${m}`
        if (!state.notifications.find(n => n.id === key)) {
          const isComplete = m === 100
          notifs.push({
            id: key,
            type: isComplete ? 'goal_complete' : 'goal_milestone',
            title: isComplete ? 'Goal Tercapai! 🎉' : `Goal ${m}%`,
            message: isComplete ? `${g.icon} ${g.name} sudah terpenuhi! Kamu amazing!` : `${g.icon} ${g.name} sudah mencapai ${m}%. Little steps, big goals! 💗`,
            icon: isComplete ? '🏆' : '🎯',
            read: false,
            createdAt: new Date().toISOString(),
            linkTo: 'goals',
          })
        }
      }
    })
  })
  return notifs
}

function checkLowBalanceNotifications(state: AppState): AppNotification[] {
  if (!state.notificationSettings.lowBalance) return []
  const notifs: AppNotification[] = []

  state.wallets.forEach(w => {
    if (w.balance < 50000 && w.balance >= 0) {
      const key = `low-balance-${w.id}-${new Date().toDateString()}`
      if (!state.notifications.find(n => n.id === key)) {
        notifs.push({ id: key, type: 'low_balance', title: 'Saldo Menipis', message: `Saldo ${w.icon} ${w.name} tinggal Rp ${w.balance.toLocaleString('id-ID')}. Jangan lupa top up ya! 💸`, icon: '💰', read: false, createdAt: new Date().toISOString(), linkTo: 'wallets' })
      }
    }
  })
  return notifs
}

function refreshNotifications(state: AppState): AppNotification[] {
  const all = [
    ...checkBudgetNotifications(state),
    ...checkRecurringNotifications(state),
    ...checkGoalNotifications(state),
    ...checkLowBalanceNotifications(state),
  ]
  return generateNotifications(state, all)
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      const newWallets = applyTransactionToWallets(state.wallets, action.payload)
      const next = { ...state, transactions: [action.payload, ...state.transactions], wallets: newWallets }
      return { ...next, notifications: refreshNotifications(next) }
    }
    case 'EDIT_TRANSACTION': {
      const old = state.transactions.find(t => t.id === action.payload.id)!
      let wallets = applyTransactionToWallets(state.wallets, old, true)
      wallets = applyTransactionToWallets(wallets, action.payload)
      const next = { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t), wallets }
      return { ...next, notifications: refreshNotifications(next) }
    }
    case 'DELETE_TRANSACTION': {
      const tx = state.transactions.find(t => t.id === action.payload)!
      const wallets = applyTransactionToWallets(state.wallets, tx, true)
      const next = { ...state, transactions: state.transactions.filter(t => t.id !== action.payload), wallets }
      return { ...next, notifications: refreshNotifications(next) }
    }
    case 'ADD_WALLET':
      return { ...state, wallets: [...state.wallets, action.payload] }
    case 'EDIT_WALLET': {
      const next = { ...state, wallets: state.wallets.map(w => w.id === action.payload.id ? action.payload : w) }
      return { ...next, notifications: refreshNotifications(next) }
    }
    case 'DELETE_WALLET':
      return { ...state, wallets: state.wallets.filter(w => w.id !== action.payload) }
    case 'ADD_BUDGET': {
      const next = { ...state, budgets: [...state.budgets, action.payload] }
      return { ...next, notifications: refreshNotifications(next) }
    }
    case 'EDIT_BUDGET': {
      const next = { ...state, budgets: state.budgets.map(b => b.id === action.payload.id ? action.payload : b) }
      return { ...next, notifications: refreshNotifications(next) }
    }
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter(b => b.id !== action.payload) }
    case 'ADD_GOAL': {
      const next = { ...state, savingsGoals: [...state.savingsGoals, action.payload] }
      return { ...next, notifications: refreshNotifications(next) }
    }
    case 'EDIT_GOAL': {
      const next = { ...state, savingsGoals: state.savingsGoals.map(g => g.id === action.payload.id ? action.payload : g) }
      return { ...next, notifications: refreshNotifications(next) }
    }
    case 'DELETE_GOAL':
      return { ...state, savingsGoals: state.savingsGoals.filter(g => g.id !== action.payload) }
    case 'ADD_RECURRING': {
      const next = { ...state, recurringTransactions: [...state.recurringTransactions, action.payload] }
      return { ...next, notifications: refreshNotifications(next) }
    }
    case 'DELETE_RECURRING':
      return { ...state, recurringTransactions: state.recurringTransactions.filter(r => r.id !== action.payload) }
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    case 'EDIT_CATEGORY':
      return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) }
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode }
    case 'SET_USER_NAME':
      return { ...state, userName: action.payload }
    case 'SET_PROFILE_PHOTO':
      return { ...state, profilePhoto: action.payload }
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) }
    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) }
    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) }
    case 'CLEAR_ALL_NOTIFICATIONS':
      return { ...state, notifications: [] }
    case 'UPDATE_NOTIFICATION_SETTINGS': {
      const next = { ...state, notificationSettings: { ...state.notificationSettings, ...action.payload } }
      return { ...next, notifications: refreshNotifications(next) }
    }
    case 'RESET_DATA':
      return {
        ...seedData,
        darkMode: state.darkMode,
        userName: state.userName,
        profilePhoto: state.profilePhoto,
        notifications: [],
        notificationSettings: state.notificationSettings,
        transactions: [],
        wallets: [{ id: 'w1', name: 'Cash', type: 'cash', balance: 0, icon: '💵', color: '#27AE60' }],
        budgets: [],
        savingsGoals: [],
        recurringTransactions: [],
      }
    default:
      return state
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null)

export function AppProvider({ children, userName }: { children: ReactNode; userName?: string }) {
  const [state, dispatch] = useReducer(reducer, {
    ...seedData,
    userName: userName || 'User',
    notifications: refreshNotifications(seedData),
  })

  // Sync userName dari auth setiap kali berubah
  useEffect(() => {
    if (userName && userName !== state.userName) {
      dispatch({ type: 'SET_USER_NAME', payload: userName })
    }
  }, [userName])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

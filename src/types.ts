export type TransactionType = 'income' | 'expense' | 'transfer'

export interface Wallet {
  id: string
  name: string
  type: string
  balance: number
  icon: string
  color: string
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  categoryId: string
  walletId: string
  toWalletId?: string
  date: string
  note: string
  createdAt: string
}

export interface Budget {
  id: string
  categoryId: string
  limit: number
  period: 'monthly'
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  icon: string
  color: string
}

export interface RecurringTransaction {
  id: string
  name: string
  type: 'income' | 'expense'
  amount: number
  categoryId: string
  walletId: string
  dayOfMonth: number
  note: string
}

export interface AppNotification {
  id: string
  type: 'budget_warning' | 'budget_exceeded' | 'recurring_due' | 'goal_milestone' | 'goal_complete' | 'low_balance'
  title: string
  message: string
  icon: string
  read: boolean
  createdAt: string
  linkTo?: string
}

export interface NotificationSettings {
  budgetWarning: boolean
  recurringReminder: boolean
  goalsMilestone: boolean
  lowBalance: boolean
}

export interface AppState {
  wallets: Wallet[]
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
  savingsGoals: SavingsGoal[]
  recurringTransactions: RecurringTransaction[]
  notifications: AppNotification[]
  notificationSettings: NotificationSettings
  darkMode: boolean
  userName: string
  profilePhoto: string | null
}

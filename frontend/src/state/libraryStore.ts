import { useSyncExternalStore } from 'react'
import {
  Book,
  BookFilters,
  DashboardSnapshot,
  LoanRecord,
  ReportMetric,
  UserProfile,
  UserRole,
} from '../types/library'
import { buildReportMetrics, libraryApi } from '../services/libraryApi'

type AppState = {
  currentUser: UserProfile | null
  users: UserProfile[]
  books: Book[]
  loans: LoanRecord[]
  dashboard: DashboardSnapshot | null
  loading: boolean
  error: string | null
}

type LoginCredentials = {
  username: string
  password: string
}

type RegisterPayload = {
  username: string
  fullName: string
  email: string
  phone: string
  password: string
}

type BookDraft = Omit<Book, 'id' | 'issuedCount' | 'status' | 'availableCopies'> & {
  totalCopies: number
  availableCopies?: number
  issuedCount?: number
  status?: Book['status']
}

type ProfilePatch = Partial<Pick<UserProfile, 'fullName' | 'email' | 'phone' | 'password'>>

type LoanDraft = {
  bookId: number
  readerId: number
  periodDays?: number
}

const emptyDashboard: DashboardSnapshot = {
  totalBooks: 0,
  availableBooks: 0,
  issuedBooks: 0,
  overdueLoans: 0,
  averageLoanDays: 0,
  popularBooks: [],
  readerActivity: [],
}

let state: AppState = {
  currentUser: null,
  users: [],
  books: [],
  loans: [],
  dashboard: null,
  loading: false,
  error: null,
}

const listeners = new Set<() => void>()

function setState(patch: Partial<AppState>) {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getState() {
  return state
}

async function refreshCoreData() {
  const [books, loans, dashboard] = await Promise.all([
    libraryApi.fetchBooks(),
    libraryApi.fetchLoans(),
    libraryApi.fetchDashboard(),
  ])
  let users = state.users
  if (state.currentUser?.role === 'ROLE_ADMIN' || state.currentUser?.role === 'ROLE_LIBRARIAN') {
    users = await libraryApi.fetchUsers()
  }
  setState({ books, loans, dashboard, users, error: null })
}

export function useLibraryStore() {
  return useSyncExternalStore(subscribe, getState, getState)
}

export const libraryActions = {
  async initialize() {
    setState({ loading: true })
    try {
      const session = await libraryApi.checkSession()
      if (!session.ok) {
        setState({ currentUser: null, books: [], loans: [], users: [], dashboard: null })
        return
      }
      setState({ currentUser: session.user })
      if (session.user.emailVerified) {
        await refreshCoreData()
      }
    } catch {
      setState({ currentUser: null, books: [], loans: [], users: [], dashboard: null })
    } finally {
      setState({ loading: false })
    }
  },

  async login({ username, password }: LoginCredentials) {
    setState({ loading: true, error: null })
    try {
      const result = await libraryApi.login(username, password)
      if (!result.ok) {
        setState({ error: result.message })
        return result
      }
      setState({ currentUser: result.user })
      if (result.user.emailVerified) {
        await refreshCoreData()
      }
      return result
    } finally {
      setState({ loading: false })
    }
  },

  async register(payload: RegisterPayload) {
    setState({ loading: true, error: null })
    try {
      const result = await libraryApi.register(payload)
      if (!result.ok) {
        setState({ error: result.message })
        return result
      }
      return result
    } finally {
      setState({ loading: false })
    }
  },

  async verifyEmail(email: string, code: string) {
    setState({ loading: true, error: null })
    try {
      const result = await libraryApi.verifyEmail(email, code)
      if (!result.ok) {
        setState({ error: result.message })
        return result
      }
      setState({ currentUser: result.user })
      await refreshCoreData()
      return result
    } finally {
      setState({ loading: false })
    }
  },

  async resendVerificationCode(email: string) {
    return libraryApi.resendVerificationCode(email)
  },

  async logout() {
    try {
      await libraryApi.logout()
    } finally {
      setState({
        currentUser: null,
        users: [],
        books: [],
        loans: [],
        dashboard: null,
        error: null,
      })
    }
  },

  async updateProfile(patch: ProfilePatch) {
    if (!state.currentUser) return
    const updated = await libraryApi.updateProfile(patch)
    setState({
      currentUser: updated,
      users: state.users.map((user) => (user.id === updated.id ? updated : user)),
    })
  },

  async addBook(draft: BookDraft) {
    const created = await libraryApi.createBook({
      title: draft.title,
      author: draft.author,
      isbn: draft.isbn,
      category: draft.category,
      keywords: draft.keywords,
      year: draft.year,
      publisher: draft.publisher,
      location: draft.location,
      totalCopies: draft.totalCopies,
      availableCopies: draft.availableCopies ?? draft.totalCopies,
      status: draft.status ?? 'available',
    })
    await refreshCoreData()
    return created
  },

  async updateBook(bookId: number, patch: Partial<Book>) {
    await libraryApi.updateBook(bookId, patch)
    await refreshCoreData()
  },

  async deleteBook(bookId: number) {
    await libraryApi.deleteBook(bookId)
    await refreshCoreData()
  },

  async issueLoan(draft: LoanDraft) {
    const result = await libraryApi.issueLoan(draft.bookId, draft.readerId, draft.periodDays)
    if (result.ok) {
      await refreshCoreData()
    }
    return result
  },

  async returnLoan(loanId: number) {
    await libraryApi.returnLoan(loanId)
    await refreshCoreData()
  },

  async changeRole(userId: number, role: UserRole) {
    const updated = await libraryApi.changeRole(userId, role)
    setState({
      users: state.users.map((user) => (user.id === userId ? updated : user)),
      currentUser: state.currentUser?.id === userId ? updated : state.currentUser,
    })
  },
}

export function selectBooks(filters: BookFilters) {
  const query = filters.query.trim().toLowerCase()
  return state.books
    .filter((book) => {
      const matchesQuery = !query || [book.title, book.author, book.isbn, book.category, ...book.keywords]
        .join(' ')
        .toLowerCase()
        .includes(query)
      const matchesCategory = !filters.category || filters.category === 'all' || book.category === filters.category
      const matchesStatus = !filters.status || filters.status === 'all' || book.status === filters.status
      return matchesQuery && matchesCategory && matchesStatus
    })
    .sort((left, right) => {
      switch (filters.sortBy) {
        case 'author':
          return left.author.localeCompare(right.author)
        case 'available':
          return right.availableCopies - left.availableCopies
        case 'issued':
          return right.issuedCount - left.issuedCount
        default:
          return left.title.localeCompare(right.title)
      }
    })
}

export function selectLoans() {
  return state.loans.slice().sort((left, right) => right.issueDate.localeCompare(left.issueDate))
}

export function selectDashboardSnapshot(): DashboardSnapshot {
  return state.dashboard ?? emptyDashboard
}

export function selectReportMetrics(): ReportMetric[] {
  return buildReportMetrics(selectDashboardSnapshot())
}

export function getCategories() {
  return Array.from(new Set(state.books.map((book) => book.category))).sort()
}

export function getUsersByRole(role?: UserRole) {
  if (!role) return state.users
  return state.users.filter((user) => user.role === role)
}

export function getCurrentUser() {
  return state.currentUser
}

export function getAllUsers() {
  return state.users
}

export function getAllBooks() {
  return state.books
}

export function getAllLoans() {
  return selectLoans()
}

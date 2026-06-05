import api from './api'
import {
  Book,
  BookFilters,
  DashboardSnapshot,
  LoanRecord,
  ReportMetric,
  UserProfile,
  UserRole,
} from '../types/library'

type AuthResponse = {
  user: UserProfile
}

type RegisterResponse = {
  message: string
  email: string
  requiresVerification: boolean
}

type BookApi = {
  id: number
  title: string
  author: string
  isbn: string
  category: string
  keywords: string[]
  year: number
  publisher: string
  location: string
  totalCopies: number
  availableCopies: number
  status: Book['status']
  issuedCount: number
  lastIssuedAt?: string
}

type LoanApi = {
  id: number
  bookId: number
  readerId: number
  readerName: string
  issueDate: string
  dueDate: string
  returnedAt?: string
  status: LoanRecord['status']
}

type DashboardApi = {
  totalBooks: number
  availableBooks: number
  issuedBooks: number
  overdueLoans: number
  averageLoanDays: number
  popularBooks: { name: string; count: number }[]
  readerActivity: { name: string; count: number }[]
}

function mapBook(book: BookApi): Book {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    category: book.category,
    keywords: book.keywords ?? [],
    year: book.year,
    publisher: book.publisher,
    location: book.location ?? '',
    totalCopies: book.totalCopies,
    availableCopies: book.availableCopies,
    status: book.status,
    issuedCount: Number(book.issuedCount ?? 0),
    lastIssuedAt: book.lastIssuedAt,
  }
}

function mapLoan(loan: LoanApi): LoanRecord {
  return {
    id: loan.id,
    bookId: loan.bookId,
    readerId: loan.readerId,
    readerName: loan.readerName,
    issueDate: loan.issueDate,
    dueDate: loan.dueDate,
    returnedAt: loan.returnedAt,
    status: loan.status,
  }
}

function mapDashboard(data: DashboardApi): DashboardSnapshot {
  return {
    totalBooks: data.totalBooks,
    availableBooks: data.availableBooks,
    issuedBooks: data.issuedBooks,
    overdueLoans: data.overdueLoans,
    averageLoanDays: data.averageLoanDays,
    popularBooks: data.popularBooks.map((item) => ({ title: item.name, count: item.count })),
    readerActivity: data.readerActivity.map((item) => ({ name: item.name, count: item.count })),
  }
}

function extractError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  return 'Сталася помилка під час запиту'
}

export const libraryApi = {
  async checkSession() {
    try {
      const { data } = await api.get<AuthResponse>('/api/auth/session')
      return { ok: true as const, user: data.user }
    } catch {
      return { ok: false as const }
    }
  },

  async login(username: string, password: string) {
    try {
      const { data } = await api.post<AuthResponse>('/api/auth/login', { username, password })
      return { ok: true as const, user: data.user }
    } catch (error) {
      return { ok: false as const, message: extractError(error) }
    }
  },

  async register(payload: {
    username: string
    fullName: string
    email: string
    phone: string
    password: string
  }) {
    try {
      const { data } = await api.post<RegisterResponse>('/api/auth/register', payload)
      return { ok: true as const, ...data }
    } catch (error) {
      return { ok: false as const, message: extractError(error) }
    }
  },

  async verifyEmail(email: string, code: string) {
    try {
      const { data } = await api.post<AuthResponse>('/api/auth/verify-email', { email, code })
      return { ok: true as const, user: data.user }
    } catch (error) {
      return { ok: false as const, message: extractError(error) }
    }
  },

  async resendVerificationCode(email: string) {
    try {
      const { data } = await api.post<{ message: string }>('/api/auth/resend-code', { email })
      return { ok: true as const, message: data.message }
    } catch (error) {
      return { ok: false as const, message: extractError(error) }
    }
  },

  async logout() {
    await api.post('/api/auth/logout')
  },

  async fetchCurrentUser() {
    const { data } = await api.get<UserProfile>('/api/users/me')
    return data
  },

  async fetchUsers() {
    const { data } = await api.get<UserProfile[]>('/api/users')
    return data
  },

  async updateProfile(patch: Partial<Pick<UserProfile, 'fullName' | 'email' | 'phone' | 'password'>>) {
    const { data } = await api.put<UserProfile>('/api/users/me', patch)
    return data
  },

  async changeRole(userId: number, role: UserRole) {
    const { data } = await api.put<UserProfile>(`/api/users/${userId}/role`, { role })
    return data
  },

  async fetchBooks(filters?: Partial<BookFilters>) {
    const { data } = await api.get<BookApi[]>('/api/books', {
      params: {
        query: filters?.query,
        category: filters?.category,
        status: filters?.status,
      },
    })
    return data.map(mapBook)
  },

  async createBook(book: Omit<Book, 'id' | 'issuedCount' | 'status' | 'availableCopies'> & {
    totalCopies: number
    availableCopies?: number
    status?: Book['status']
  }) {
    const { data } = await api.post<BookApi>('/api/books', book)
    return mapBook(data)
  },

  async updateBook(bookId: number, patch: Partial<Book>) {
    const { data } = await api.put<BookApi>(`/api/books/${bookId}`, patch)
    return mapBook(data)
  },

  async deleteBook(bookId: number) {
    await api.delete(`/api/books/${bookId}`)
  },

  async fetchLoans() {
    const { data } = await api.get<LoanApi[]>('/api/loans')
    return data.map(mapLoan)
  },

  async issueLoan(bookId: number, readerId: number, periodDays?: number) {
    try {
      const { data } = await api.post<LoanApi>('/api/loans', {}, {
        params: { bookId, readerId, periodDays },
      })
      return { ok: true as const, loan: mapLoan(data) }
    } catch (error) {
      return { ok: false as const, message: extractError(error) }
    }
  },

  async returnLoan(loanId: number) {
    const { data } = await api.put<LoanApi>(`/api/loans/return/${loanId}`)
    return mapLoan(data)
  },

  async fetchOverdueLoans() {
    const { data } = await api.get<LoanApi[]>('/api/loans/overdue')
    return data.map(mapLoan)
  },

  async fetchDashboard() {
    const { data } = await api.get<DashboardApi>('/api/reports/dashboard')
    return mapDashboard(data)
  },
}

export function buildReportMetrics(snapshot: DashboardSnapshot): ReportMetric[] {
  return [
    { label: 'Загальна кількість книг', value: snapshot.totalBooks },
    { label: 'Доступні книги', value: snapshot.availableBooks },
    { label: 'Видані книги', value: snapshot.issuedBooks },
    { label: 'Прострочені видачі', value: snapshot.overdueLoans },
    { label: 'Середній час читання', value: snapshot.averageLoanDays, detail: 'днів' },
  ]
}

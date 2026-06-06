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

function toInt(value: number) {
  return Math.round(Number(value ?? 0))
}

function mapDashboard(data: DashboardApi): DashboardSnapshot {
  return {
    totalBooks: toInt(data.totalBooks),
    availableBooks: toInt(data.availableBooks),
    issuedBooks: toInt(data.issuedBooks),
    overdueLoans: toInt(data.overdueLoans),
    averageLoanDays: toInt(data.averageLoanDays),
    popularBooks: data.popularBooks.map((item) => ({ title: item.name, count: toInt(item.count) })),
    readerActivity: data.readerActivity.map((item) => ({ name: item.name, count: toInt(item.count) })),
  }
}

function extractError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  if (error instanceof Error) return error.message
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

  async exportReport(type: 'excel' | 'pdf') {
    try {
      const response = await api.get(`/api/reports/export?type=${type}`, { responseType: 'blob' })
      const contentType = String(response.headers['content-type'] ?? '')
      if (contentType.includes('application/json')) {
        const text = await (response.data as Blob).text()
        const payload = JSON.parse(text) as { message?: string }
        return { ok: false as const, message: payload.message ?? 'Не вдалося завантажити звіт' }
      }
      return { ok: true as const, blob: response.data as Blob }
    } catch (error) {
      return { ok: false as const, message: extractError(error) }
    }
  },
}

export function buildReportMetrics(snapshot: DashboardSnapshot): ReportMetric[] {
  return [
    { label: 'Загальна кількість книг', value: toInt(snapshot.totalBooks) },
    { label: 'Доступні книги', value: toInt(snapshot.availableBooks) },
    { label: 'Видані книги', value: toInt(snapshot.issuedBooks) },
    { label: 'Прострочені видачі', value: toInt(snapshot.overdueLoans) },
    { label: 'Середній час читання', value: toInt(snapshot.averageLoanDays), detail: 'днів' },
  ]
}

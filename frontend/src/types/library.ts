export type UserRole = 'ROLE_ADMIN' | 'ROLE_LIBRARIAN' | 'ROLE_READER'

export type UserProfile = {
  id: number
  username: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  emailVerified: boolean
  password?: string
}

export type BookStatus = 'available' | 'issued' | 'maintenance' | 'lost'

export type Book = {
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
  status: BookStatus
  issuedCount: number
  lastIssuedAt?: string
}

export type LoanStatus = 'active' | 'returned' | 'overdue'

export type LoanRecord = {
  id: number
  bookId: number
  readerId: number
  readerName: string
  issueDate: string
  dueDate: string
  returnedAt?: string
  status: LoanStatus
}

export type ReportMetric = {
  label: string
  value: number
  detail?: string
}

export type BookFilters = {
  query: string
  category: string
  status: string
  sortBy: 'title' | 'author' | 'available' | 'issued'
}

export type DashboardSnapshot = {
  totalBooks: number
  availableBooks: number
  issuedBooks: number
  overdueLoans: number
  averageLoanDays: number
  popularBooks: { title: string; count: number }[]
  readerActivity: { name: string; count: number }[]
}

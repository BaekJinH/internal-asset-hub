import type { Account } from '@/entities/account/model/account-types'

export const MOCK_DEFAULT_PASSWORD = 'tinto0527'

export const mockAccounts: Account[] = [
  { id: 'acc-001', userId: 'u-001', email: 'zunion@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-002', userId: 'u-002', email: 'jinnychoi@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-003', userId: 'u-003', email: 'yja201109@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-004', userId: 'u-004', email: 'yeong_2@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-005', userId: 'u-005', email: 'umain9436@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-006', userId: 'u-006', email: 'nuc@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-007', userId: 'u-007', email: 'parksaeim92@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-008', userId: 'u-008', email: '0915lgw@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-009', userId: 'u-009', email: '2kunhee94@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-010', userId: 'u-010', email: 'wls6482@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-011', userId: 'u-011', email: 'eychoi@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-012', userId: 'u-012', email: 'praise159@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-013', userId: 'u-013', email: 'jiwon94k@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-014', userId: 'u-014', email: 'bjh1234@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
  { id: 'acc-015', userId: 'u-015', email: 'donghooridge@tinto.co.kr', password: MOCK_DEFAULT_PASSWORD },
]

export function getAccountByEmail(email: string): Account | undefined {
  return mockAccounts.find((account) => account.email.toLowerCase() === email.toLowerCase())
}

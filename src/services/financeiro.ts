import pb from '@/lib/pocketbase/client'
import type { Patient } from './patients'
import type { Appointment } from './appointments'

export interface Transaction {
  id: string
  user_id: string
  patient_id: string
  appointment_id?: string
  description: string
  amount: number
  due_date: string
  payment_date?: string
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado' | 'aguardando'
  payment_method?:
    | 'pix'
    | 'dinheiro'
    | 'cartao de credito'
    | 'cartao de debito'
    | 'boleto'
    | 'transferencia'
    | ''
  installments?: number
  observations?: string
  receipt_number?: string
  receipt_issued_date?: string
  created: string
  updated: string
  expand?: {
    patient_id?: Patient
    appointment_id?: Appointment
  }
}

export const getTransactions = () =>
  pb.collection<Transaction>('financeiro').getFullList({
    expand: 'patient_id,appointment_id',
    sort: '-due_date',
  })

export const getTransactionsByPatient = (patientId: string) =>
  pb.collection<Transaction>('financeiro').getFullList({
    filter: `patient_id = '${patientId}'`,
    expand: 'patient_id,appointment_id',
    sort: '-due_date',
  })

export const createTransaction = (data: Partial<Transaction>) =>
  pb.collection<Transaction>('financeiro').create({ ...data, user_id: pb.authStore.record?.id })

export const updateTransaction = (id: string, data: Partial<Transaction>) =>
  pb.collection<Transaction>('financeiro').update(id, data)

export const deleteTransaction = (id: string) => pb.collection<Transaction>('financeiro').delete(id)

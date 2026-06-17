import { useEffect, useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Transaction, getTransactions, updateTransaction } from '@/services/financeiro'
import { Appointment, getAppointments } from '@/services/appointments'
import { Patient, getPatients } from '@/services/patients'
import { FinanceiroFormDialog } from '@/components/FinanceiroFormDialog'

export default function FinanceiroIndex() {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [statusFilter, setStatusFilter] = useState('todos')
  const [patientFilter, setPatientFilter] = useState('todos')
  const [methodFilter, setMethodFilter] = useState('todos')

  const loadData = async () => {
    try {
      const [txData, apptsData, ptsData] = await Promise.all([
        getTransactions(),
        getAppointments(),
        getPatients(),
      ])
      setTransactions(txData)
      setAppointments(apptsData)
      setPatients(ptsData)
    } catch (e) {
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('financeiro', loadData)
  useRealtime('appointments', loadData)

  const handleMarkAsPaid = async (id: string) => {
    try {
      await updateTransaction(id, {
        status: 'pago',
        payment_date: new Date().toISOString().substring(0, 10) + 'T12:00:00.000Z',
      })
      toast({ title: 'Pagamento registrado com sucesso' })
    } catch (e) {
      toast({ title: 'Erro ao registrar pagamento', variant: 'destructive' })
    }
  }

  // Derived metrics
  const monthStart = new Date(`${currentMonth}-01T00:00:00Z`)
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999)

  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.due_date)
    return d >= monthStart && d <= monthEnd
  })

  const receitaMes = monthTransactions
    .filter((t) => t.status === 'pago')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalPendente = transactions
    .filter((t) => t.status === 'pendente' || t.status === 'aguardando')
    .reduce((acc, t) => acc + t.amount, 0)

  const pagamentosAtrasados = transactions.filter((t) => t.status === 'atrasado').length

  const monthAppts = appointments.filter((a) => {
    if (!a.appointment_date) return false
    const d = new Date(a.appointment_date)
    return d >= monthStart && d <= monthEnd
  })

  const billedApptIds = new Set(transactions.map((t) => t.appointment_id).filter(Boolean))
  const unbilledCount = monthAppts.filter((a) => !billedApptIds.has(a.id)).length

  const filteredList = monthTransactions.filter((t) => {
    if (statusFilter !== 'todos' && t.status !== statusFilter) return false
    if (patientFilter !== 'todos' && t.patient_id !== patientFilter) return false
    if (methodFilter !== 'todos' && t.payment_method !== methodFilter) return false
    return true
  })

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Carregando painel financeiro...</div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          Financeiro Global
        </h1>
        <Button
          onClick={() => {
            setEditingTransaction(null)
            setFormOpen(true)
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Receita do Mês (Pago)</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{formatCurrency(receitaMes)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ref. {currentMonth}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Pendente Global</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalPendente)}</div>
            <p className="text-xs text-muted-foreground mt-1">Lançamentos em aberto</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pagamentos Atrasados</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{pagamentosAtrasados}</div>
            <p className="text-xs text-muted-foreground mt-1">Faturas vencidas não pagas</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Consultas Não Faturadas</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unbilledCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Sessões do mês sem lançamento</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="text-lg">Lançamentos do Mês</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="w-auto h-9"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={patientFilter} onValueChange={setPatientFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Pacientes</SelectItem>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name.split(' ')[0]} {p.name.split(' ').pop()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Métodos</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao de credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vencimento</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  {t.due_date
                    ? new Date(t.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                    : '-'}
                </TableCell>
                <TableCell className="font-medium">
                  {t.expand?.patient_id?.name || 'Desconhecido'}
                </TableCell>
                <TableCell className="text-muted-foreground">{t.description}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(t.amount)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      t.status === 'pago'
                        ? 'default'
                        : t.status === 'atrasado'
                          ? 'destructive'
                          : t.status === 'cancelado'
                            ? 'secondary'
                            : 'outline'
                    }
                    className={
                      t.status === 'pago'
                        ? 'bg-teal-600'
                        : t.status === 'pendente'
                          ? 'text-amber-600 border-amber-600'
                          : ''
                    }
                  >
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {t.status !== 'pago' && t.status !== 'cancelado' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-teal-600 border-teal-200 hover:bg-teal-50"
                        onClick={() => handleMarkAsPaid(t.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Pago
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTransaction(t)
                        setFormOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredList.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum lançamento encontrado para os filtros selecionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <FinanceiroFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        transaction={editingTransaction}
      />
    </div>
  )
}

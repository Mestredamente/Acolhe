import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, Circle, Clock, Activity, RefreshCw, Send, ExternalLink } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { getConfig, ConfigClinica } from '@/services/config_clinica'
import { Patient } from '@/services/patients'
import { Appointment } from '@/services/appointments'
import { Evolucao } from '@/services/evolucoes'
import { Transaction } from '@/services/financeiro'
import { User } from '@/services/users'

interface LogEntry {
  id: number
  text: string
  type: 'info' | 'success' | 'error'
  time: Date
}

export default function JornadaControl() {
  const { toast } = useToast()

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [userRecord, setUserRecord] = useState<User | null>(null)
  const [userConfig, setUserConfig] = useState<ConfigClinica | null>(null)

  const [testPatient, setTestPatient] = useState<Patient | null>(null)
  const [testAppointment, setTestAppointment] = useState<Appointment | null>(null)
  const [testEvolution, setTestEvolution] = useState<Evolucao | null>(null)
  const [testTransaction, setTestTransaction] = useState<Transaction | null>(null)

  const [portalInvited, setPortalInvited] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const addLog = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs((prev) => [{ id: Date.now() + Math.random(), text, type, time: new Date() }, ...prev])
  }

  const loadData = async () => {
    setIsLoading(true)
    addLog('Conectando ao banco de dados...', 'info')
    try {
      if (!pb.authStore.record?.id) throw new Error('Usuário não autenticado.')

      const me = await pb.collection('users').getOne<User>(pb.authStore.record.id)
      setUserRecord(me)

      const conf = await getConfig(me.id)
      setUserConfig(conf)
      addLog('Configuração clínica verificada.', conf ? 'success' : 'info')

      const patients = await pb
        .collection<Patient>('patients')
        .getList(1, 1, { filter: `email="teste_jornada@exemplo.com"` })
      if (patients.items.length > 0) {
        const p = patients.items[0]
        setTestPatient(p)
        addLog('Tabela patients: Paciente de teste encontrado.', 'success')

        const appts = await pb
          .collection<Appointment>('appointments')
          .getList(1, 1, { filter: `patient_id="${p.id}"`, sort: '-created' })
        if (appts.items.length > 0) {
          setTestAppointment(appts.items[0])
          addLog(
            `Tabela appointments: Agendamento encontrado (Status: ${appts.items[0].status}).`,
            'success',
          )
        } else {
          setTestAppointment(null)
        }

        const evos = await pb
          .collection<Evolucao>('evolucoes')
          .getList(1, 1, { filter: `patient_id="${p.id}"` })
        if (evos.items.length > 0) {
          setTestEvolution(evos.items[0])
          addLog('Tabela evolucoes: Evolução encontrada.', 'success')
        } else {
          setTestEvolution(null)
        }

        const trans = await pb
          .collection<Transaction>('financeiro')
          .getList(1, 1, { filter: `patient_id="${p.id}"` })
        if (trans.items.length > 0) {
          setTestTransaction(trans.items[0])
          addLog('Tabela financeiro: Lançamento encontrado.', 'success')
        } else {
          setTestTransaction(null)
        }
      } else {
        setTestPatient(null)
        setTestAppointment(null)
        setTestEvolution(null)
        setTestTransaction(null)
        addLog('Nenhum dado de teste encontrado.', 'info')
      }
    } catch (e: any) {
      addLog(`Erro de conexão/permissão: ${e.message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const onboardingCompleted = !!userRecord?.onboarding_completo
  const configOk = !!(
    userConfig?.nome_clinica &&
    userConfig?.crp_psicologo &&
    userConfig?.horario_inicio &&
    userConfig?.horario_fim
  )

  const getOnboardingStatus = () => {
    if (onboardingCompleted && configOk) return 'completed'
    if (onboardingCompleted || configOk) return 'started'
    return 'pending'
  }

  const getFirstConsultationStatus = () => {
    if (testPatient && testAppointment) return 'completed'
    if (testPatient) return 'started'
    return 'pending'
  }

  const getEvolutionStatus = () => {
    if (testEvolution && testAppointment?.status === 'concluida') return 'completed'
    if (testEvolution || testAppointment?.status === 'concluida') return 'started'
    return 'pending'
  }

  const getReceiptStatus = () => {
    if (testTransaction?.receipt_number) return 'completed'
    if (testTransaction) return 'started'
    return 'pending'
  }

  const getPortalStatus = () => (portalInvited ? 'completed' : 'pending')

  const timelineStages = [
    { name: 'Onboarding', status: getOnboardingStatus() },
    { name: '1ª Consulta', status: getFirstConsultationStatus() },
    { name: 'Evolução', status: getEvolutionStatus() },
    { name: 'Faturamento', status: getReceiptStatus() },
    { name: 'Portal', status: getPortalStatus() },
  ]

  const completeOnboarding = async () => {
    try {
      await pb.collection('users').update(userRecord!.id, { onboarding_completo: true })
      addLog('Onboarding marcado como completo.', 'success')
      loadData()
    } catch (e: any) {
      addLog(`Erro ao atualizar onboarding: ${e.message}`, 'error')
    }
  }

  const createTestPatient = async () => {
    try {
      addLog('Criando paciente de teste...', 'info')
      const p = await pb.collection<Patient>('patients').create({
        name: 'Paciente de Teste da Jornada',
        email: 'teste_jornada@exemplo.com',
        cpf: '000.000.000-00',
        phone: '11999999999',
        emergency_contact_name: 'Contato Teste',
        emergency_contact_phone: '11888888888',
        user_id: userRecord!.id,
        status: 'active',
      })
      setTestPatient(p)
      addLog('Paciente criado com sucesso.', 'success')

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      addLog('Criando agendamento vinculado...', 'info')
      const a = await pb.collection<Appointment>('appointments').create({
        patient_id: p.id,
        user_id: userRecord!.id,
        appointment_date: tomorrow.toISOString(),
        start_time: '10:00',
        end_time: '11:00',
        type: 'Presencial',
        status: 'agendada',
        patient_name_text: p.name,
      })
      setTestAppointment(a)
      addLog('Agendamento criado com sucesso.', 'success')
    } catch (e: any) {
      addLog(`Erro ao criar paciente/agendamento: ${e.message}`, 'error')
    }
  }

  const createTestFinanceiro = async () => {
    if (!testPatient) return
    try {
      addLog('Gerando lançamento financeiro e recibo...', 'info')
      const val = userConfig?.valor_consulta_padrao || 150
      const t = await pb.collection<Transaction>('financeiro').create({
        patient_id: testPatient.id,
        user_id: userRecord!.id,
        description: 'Sessão de Teste',
        amount: val,
        due_date: new Date().toISOString(),
        status: 'pago',
        payment_method: 'pix',
        receipt_number: `REC-TEST-${Math.floor(Math.random() * 1000)}`,
        receipt_issued_date: new Date().toISOString(),
      })
      setTestTransaction(t)
      addLog('Lançamento financeiro e recibo criados.', 'success')
    } catch (e: any) {
      addLog(`Erro ao criar financeiro: ${e.message}`, 'error')
    }
  }

  const sendInvite = () => {
    addLog('Simulando envio de e-mail de convite...', 'info')
    setTimeout(() => {
      addLog('Convite enviado com sucesso para teste_jornada@exemplo.com', 'success')
      setPortalInvited(true)
      toast({
        title: 'Convite Enviado',
        description: 'O paciente de teste recebeu o acesso ao portal.',
      })
    }, 800)
  }

  const handleReset = async () => {
    if (!testPatient) return
    addLog('Iniciando limpeza de dados de teste...', 'info')
    try {
      const trans = await pb
        .collection('financeiro')
        .getFullList({ filter: `patient_id="${testPatient.id}"` })
      for (const t of trans) await pb.collection('financeiro').delete(t.id)

      const evos = await pb
        .collection('evolucoes')
        .getFullList({ filter: `patient_id="${testPatient.id}"` })
      for (const e of evos) await pb.collection('evolucoes').delete(e.id)

      const appts = await pb
        .collection('appointments')
        .getFullList({ filter: `patient_id="${testPatient.id}"` })
      for (const a of appts) await pb.collection('appointments').delete(a.id)

      await pb.collection('patients').delete(testPatient.id)

      setTestPatient(null)
      setTestAppointment(null)
      setTestEvolution(null)
      setTestTransaction(null)
      setPortalInvited(false)

      addLog('Limpeza concluída com sucesso.', 'success')
      toast({ title: 'Jornada Resetada', description: 'Todos os dados de teste foram apagados.' })
    } catch (e: any) {
      addLog(`Erro ao limpar dados de teste: ${e.message}`, 'error')
    }
  }

  if (userRecord && !['admin', 'psicologo'].includes(userRecord.profile)) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Acesso negado. Esta tela é restrita a psicólogos e administradores.
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            Controle de Jornada do Psicólogo
          </h1>
          <p className="text-muted-foreground mt-1">
            Valide e simule o fluxo completo do sistema antes do uso real.
          </p>
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
        <Activity className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
        <div className="text-sm text-teal-800 leading-relaxed">
          <strong>Aviso Importante:</strong> Este simulador testa o fluxo completo do MVP. Execute-o
          para garantir que as configurações clínicas, faturamento e integrações estejam
          funcionando. <strong>Todos os dados criados aqui são fictícios</strong> e podem ser limpos
          a qualquer momento usando o botão de reset.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ESQUERDA: Timeline e Steps */}
        <div className="lg:col-span-2 space-y-8">
          {/* TIMELINE */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between overflow-x-auto pb-2 px-2">
              {timelineStages.map((stage, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 relative min-w-[90px] md:min-w-[120px]"
                >
                  {i !== 0 && (
                    <div
                      className={`absolute top-4 -left-[50%] w-full h-[3px] transition-colors duration-500 ${
                        stage.status === 'completed' ? 'bg-teal-500' : 'bg-slate-100'
                      }`}
                    />
                  )}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center z-10 border-[3px] transition-colors duration-500 bg-white ${
                      stage.status === 'completed'
                        ? 'border-teal-500 text-teal-600'
                        : stage.status === 'started'
                          ? 'border-amber-400 text-amber-500 shadow-[0_0_0_4px_rgba(251,191,36,0.1)]'
                          : 'border-slate-200 text-slate-300'
                    }`}
                  >
                    {stage.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 fill-teal-50" />
                    ) : stage.status === 'started' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      stage.status === 'completed'
                        ? 'text-teal-700'
                        : stage.status === 'started'
                          ? 'text-amber-600'
                          : 'text-slate-400'
                    }`}
                  >
                    {stage.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* WIZARD STEPS */}
          <div className="space-y-4">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="py-4 bg-slate-50/50 border-b">
                <CardTitle className="text-base flex justify-between items-center text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    Onboarding & Configurações Iniciais
                  </span>
                  <Badge
                    variant={onboardingCompleted && configOk ? 'default' : 'secondary'}
                    className={
                      onboardingCompleted && configOk
                        ? 'bg-teal-600 hover:bg-teal-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }
                  >
                    {onboardingCompleted && configOk ? 'Concluído' : 'Pendente'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                {!onboardingCompleted && (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <p className="text-sm text-amber-800">
                      Seu onboarding ainda não foi marcado como concluído no sistema.
                    </p>
                    <Button
                      onClick={completeOnboarding}
                      variant="outline"
                      className="shrink-0 border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                    >
                      Marcar como Completo
                    </Button>
                  </div>
                )}
                {!configOk && (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <p className="text-sm text-amber-800">
                      Suas configurações clínicas (nome, CRP ou horários) estão incompletas.
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className="shrink-0 border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                    >
                      <Link to="/configuracoes">Ir para Configurações</Link>
                    </Button>
                  </div>
                )}
                {onboardingCompleted && configOk && (
                  <p className="text-sm text-teal-700 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-teal-500" /> Configurações validadas com
                    sucesso. Tudo pronto para atender.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="py-4 bg-slate-50/50 border-b">
                <CardTitle className="text-base flex justify-between items-center text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    Paciente Teste e Agendamento
                  </span>
                  <Badge
                    variant={testPatient && testAppointment ? 'default' : 'secondary'}
                    className={
                      testPatient && testAppointment
                        ? 'bg-teal-600 hover:bg-teal-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }
                  >
                    {testPatient && testAppointment ? 'Concluído' : 'Pendente'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {!testPatient ? (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <p className="text-sm text-slate-600">
                      Nenhum paciente de teste gerado. Crie um para testar a agenda.
                    </p>
                    <Button
                      onClick={createTestPatient}
                      className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Criar Paciente de Teste
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-teal-700 font-medium flex items-center gap-2 bg-teal-50 p-3 rounded-lg border border-teal-100">
                      <CheckCircle2 className="w-5 h-5 text-teal-500" /> Paciente "
                      {testPatient.name}" criado no sistema.
                    </p>
                    {testAppointment ? (
                      <p className="text-sm text-teal-700 font-medium flex items-center gap-2 bg-teal-50 p-3 rounded-lg border border-teal-100">
                        <CheckCircle2 className="w-5 h-5 text-teal-500" /> Agendamento presencial
                        para {new Date(testAppointment.appointment_date).toLocaleDateString()}{' '}
                        gerado com sucesso.
                      </p>
                    ) : (
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-amber-600">
                          Paciente criado, mas agendamento falhou ou foi excluído manualmente.
                        </p>
                        <Button onClick={createTestPatient} variant="outline" className="shrink-0">
                          Recriar Paciente e Agendamento
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="py-4 bg-slate-50/50 border-b">
                <CardTitle className="text-base flex justify-between items-center text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    Evolução e Finalização de Consulta
                  </span>
                  <Badge
                    variant={
                      testEvolution && testAppointment?.status === 'concluida'
                        ? 'default'
                        : 'secondary'
                    }
                    className={
                      testEvolution && testAppointment?.status === 'concluida'
                        ? 'bg-teal-600 hover:bg-teal-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }
                  >
                    {testEvolution && testAppointment?.status === 'concluida'
                      ? 'Concluído'
                      : 'Pendente'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Para testar o fluxo clínico, abra o prontuário do paciente teste. Edite o status
                  do agendamento para <strong>Concluída</strong> e escreva uma nova{' '}
                  <strong>Evolução</strong>. Volte aqui para validar.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" disabled={!testPatient} className="bg-white">
                    <Link to={testPatient ? `/pacientes/${testPatient.id}` : '#'}>
                      Abrir Prontuário Teste <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                    </Link>
                  </Button>
                  <Button
                    onClick={loadData}
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />{' '}
                    Validar Progresso
                  </Button>
                </div>

                {testEvolution && testAppointment?.status === 'concluida' && (
                  <p className="text-sm text-teal-700 font-medium flex items-center gap-2 bg-teal-50 p-3 rounded-lg border border-teal-100">
                    <CheckCircle2 className="w-5 h-5 text-teal-500" /> Evolução registrada e
                    consulta marcada como concluída.
                  </p>
                )}
                {testPatient && (!testEvolution || testAppointment?.status !== 'concluida') && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mt-2">
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside ml-4">
                      {testAppointment?.status !== 'concluida' && (
                        <li>
                          Agendamento precisa ter status "Concluída" (Atual:{' '}
                          {testAppointment?.status || 'Nenhum'})
                        </li>
                      )}
                      {!testEvolution && <li>Nenhuma evolução registrada para este paciente</li>}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="py-4 bg-slate-50/50 border-b">
                <CardTitle className="text-base flex justify-between items-center text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    Faturamento e Recibo
                  </span>
                  <Badge
                    variant={testTransaction?.receipt_number ? 'default' : 'secondary'}
                    className={
                      testTransaction?.receipt_number
                        ? 'bg-teal-600 hover:bg-teal-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }
                  >
                    {testTransaction?.receipt_number ? 'Concluído' : 'Pendente'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <p className="text-sm text-slate-600">
                  Verifique a integração financeira gerando automaticamente um lançamento e emitindo
                  um recibo vinculado a este paciente.
                </p>
                {!testTransaction ? (
                  <Button
                    onClick={createTestFinanceiro}
                    disabled={!testPatient}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Gerar Lançamento e Recibo
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-teal-700 font-medium flex items-center gap-2 bg-teal-50 p-3 rounded-lg border border-teal-100">
                      <CheckCircle2 className="w-5 h-5 text-teal-500" /> Lançamento de R${' '}
                      {testTransaction.amount} criado (Status: {testTransaction.status}).
                    </p>
                    {testTransaction.receipt_number ? (
                      <p className="text-sm text-teal-700 font-medium flex items-center gap-2 bg-teal-50 p-3 rounded-lg border border-teal-100">
                        <CheckCircle2 className="w-5 h-5 text-teal-500" /> Recibo emitido:{' '}
                        {testTransaction.receipt_number}
                      </p>
                    ) : (
                      <p className="text-sm text-amber-600 font-medium bg-amber-50 p-3 rounded-lg border border-amber-100">
                        Lançamento existe, mas o recibo não foi emitido.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="py-4 bg-slate-50/50 border-b">
                <CardTitle className="text-base flex justify-between items-center text-slate-800">
                  <span className="flex items-center gap-2">
                    <span className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      5
                    </span>
                    Portal do Paciente
                  </span>
                  <Badge
                    variant={portalInvited ? 'default' : 'secondary'}
                    className={
                      portalInvited
                        ? 'bg-teal-600 hover:bg-teal-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }
                  >
                    {portalInvited ? 'Concluído' : 'Pendente'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <p className="text-sm text-slate-600">
                  Simule a experiência do paciente no seu portal exclusivo. (Requer paciente de
                  teste criado)
                </p>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                    CREDENCIAS DO PACIENTE
                  </p>
                  <p className="font-mono text-sm text-slate-800">
                    Email: teste_jornada@exemplo.com
                  </p>
                  <p className="font-mono text-sm text-slate-800">
                    Senha: Preenchida automaticamente no portal
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={sendInvite}
                    disabled={!testPatient || portalInvited}
                    className={portalInvited ? 'bg-teal-600 text-white hover:bg-teal-700' : ''}
                  >
                    {portalInvited ? (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {portalInvited ? 'Convite Enviado' : 'Enviar Convite para Portal'}
                  </Button>
                  <Button asChild variant="outline" className="bg-white">
                    <Link to="/portal/login" target="_blank">
                      Acessar Portal do Paciente{' '}
                      <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* DIREITA: Logs e Ações */}
        <div className="lg:col-span-1">
          <Card className="h-full min-h-[600px] flex flex-col border-slate-200 shadow-sm overflow-hidden sticky top-6">
            <CardHeader className="py-4 bg-slate-50/50 border-b">
              <CardTitle className="text-base flex justify-between items-center text-slate-800">
                Painel de Validação
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={loadData}
                  title="Atualizar Status"
                  className="h-8 w-8 text-slate-500 hover:text-slate-900"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary' : ''}`}
                  />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 bg-slate-950 text-slate-300 font-mono text-xs">
              <div className="p-4 space-y-3">
                {logs.length === 0 && (
                  <span className="text-slate-500 italic">Aguardando execuções do sistema...</span>
                )}
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex gap-3 border-b border-white/5 pb-2 last:border-0 ${
                      log.type === 'error'
                        ? 'text-rose-400'
                        : log.type === 'success'
                          ? 'text-teal-400'
                          : 'text-slate-300'
                    }`}
                  >
                    <span className="opacity-40 shrink-0">
                      [
                      {log.time.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                      ]
                    </span>
                    <span className="break-words leading-relaxed">{log.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-5 border-t bg-slate-50">
              <Button
                onClick={handleReset}
                variant="destructive"
                className="w-full shadow-sm"
                disabled={!testPatient && logs.length < 5}
              >
                Resetar Dados do Teste
              </Button>
              <p className="text-xs text-center text-slate-500 mt-3">
                Remove paciente, agenda, evolução e finanças de teste. Mantém suas configurações
                clínicas intactas.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

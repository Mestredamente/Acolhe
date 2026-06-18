import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { AlertCircle, Server, Activity, Lock, Box, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ModuleStatus = 'Core' | 'Ativo' | 'Inativo' | 'Em Breve' | 'Concluído'

interface SystemModule {
  id: string
  name: string
  description: string
  status: ModuleStatus
  locked: boolean
}

interface Phase {
  id: number
  name: string
  warning?: string
  modules: SystemModule[]
}

const initialPhases: Phase[] = [
  {
    id: 0,
    name: 'Fase 0 — Fundação',
    modules: [
      {
        id: 'm0-1',
        name: 'Autenticação',
        description: 'Sistema base de login e registro',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm0-2',
        name: 'RBAC',
        description: 'Controle de acesso baseado em funções',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm0-3',
        name: 'Auditoria e Logs',
        description: 'Rastreamento de ações do sistema',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm0-4',
        name: 'Conformidade LGPD/CFP',
        description: 'Adequação às normas',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm0-5',
        name: 'Termos de Serviço e Privacidade',
        description: 'Políticas do sistema',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm0-6',
        name: 'CI/CD',
        description: 'Esteira de deploy contínuo',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm0-7',
        name: 'Validações e Máscaras',
        description: 'Entrada de dados consistentes',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm0-8',
        name: 'Integração ViaCEP e Receita Federal',
        description: 'Consultas externas',
        status: 'Core',
        locked: true,
      },
    ],
  },
  {
    id: 1,
    name: 'Fase 1 — MVP Clínico',
    warning: 'Módulos core do MVP não podem ser desativados.',
    modules: [
      {
        id: 'm1-1',
        name: 'Pacientes (CRUD)',
        description: 'Gestão de cadastro de pacientes',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm1-2',
        name: 'Prontuários',
        description: 'Anamneses e evoluções',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm1-3',
        name: 'Agendamento (Google Calendar)',
        description: 'Gestão da agenda',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm1-4',
        name: 'Dashboard',
        description: 'Visão geral clínica',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm1-5',
        name: 'Autenticação de paciente',
        description: 'Login para pacientes',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm1-6',
        name: 'Telepsicologia (Zoom)',
        description: 'Atendimentos online',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm1-7',
        name: 'Faturamento (recibos)',
        description: 'Emissão de recibos',
        status: 'Core',
        locked: true,
      },
      {
        id: 'm1-8',
        name: 'NF-e (Omie + NFe.io)',
        description: 'Notas fiscais eletrônicas',
        status: 'Core',
        locked: true,
      },
    ],
  },
  {
    id: 2,
    name: 'Fase 2 — Portal do Paciente & Automações',
    modules: [
      {
        id: 'm2-1',
        name: 'Portal do Paciente',
        description: 'Área exclusiva para pacientes',
        status: 'Ativo',
        locked: false,
      },
      {
        id: 'm2-2',
        name: 'Automações WhatsApp',
        description: 'Envio de mensagens automáticas',
        status: 'Ativo',
        locked: false,
      },
      {
        id: 'm2-3',
        name: 'Transcrição automática',
        description: 'Transcrição de áudio para texto',
        status: 'Inativo',
        locked: false,
      },
      {
        id: 'm2-4',
        name: 'Análise de sentimentos',
        description: 'Análise de humor em diários',
        status: 'Ativo',
        locked: false,
      },
    ],
  },
  {
    id: 3,
    name: 'Fase 3 — IA & Análises',
    modules: [
      {
        id: 'm3-1',
        name: 'Assistente de prontuários',
        description: 'IA para redigir evoluções',
        status: 'Inativo',
        locked: false,
      },
      {
        id: 'm3-2',
        name: 'Análise de padrões clínicos',
        description: 'Descoberta de padrões no paciente',
        status: 'Ativo',
        locked: false,
      },
      {
        id: 'm3-3',
        name: 'Gerador de documentos',
        description: 'Criação de laudos automáticos',
        status: 'Inativo',
        locked: false,
      },
      {
        id: 'm3-4',
        name: 'Análise preditiva',
        description: 'Previsões sobre o tratamento',
        status: 'Inativo',
        locked: false,
      },
      {
        id: 'm3-5',
        name: 'Orquestração Claude + OpenAI',
        description: 'Integração de múltiplos LLMs',
        status: 'Inativo',
        locked: false,
      },
      {
        id: 'm3-6',
        name: 'Validação de outputs',
        description: 'Auditoria e correção das respostas IA',
        status: 'Inativo',
        locked: false,
      },
      {
        id: 'm3-7',
        name: 'Auditoria de IA',
        description: 'Registro das ações da inteligência artificial',
        status: 'Inativo',
        locked: false,
      },
    ],
  },
  {
    id: 4,
    name: 'Fase 4 — Multi-Tenant & Clínicas',
    warning: 'Fase 4 requer plano de clínica. Disponível em breve.',
    modules: [
      {
        id: 'm4-1',
        name: 'Gestão de clínicas',
        description: 'Administração de múltiplas unidades',
        status: 'Inativo',
        locked: false,
      },
      {
        id: 'm4-2',
        name: 'Gestão de psicólogos',
        description: 'Gestão da equipe clínica',
        status: 'Inativo',
        locked: false,
      },
      {
        id: 'm4-3',
        name: 'Gestão de secretárias',
        description: 'Gestão da equipe administrativa',
        status: 'Inativo',
        locked: false,
      },
      {
        id: 'm4-4',
        name: 'Supervisão',
        description: 'Acesso de supervisores',
        status: 'Inativo',
        locked: false,
      },
      {
        id: 'm4-5',
        name: 'Atendimentos em Grupo',
        description: 'Sessões coletivas',
        status: 'Inativo',
        locked: false,
      },
      {
        id: 'm4-6',
        name: 'Controle de ponto',
        description: 'Registro de jornada da equipe',
        status: 'Inativo',
        locked: false,
      },
      {
        id: 'm4-7',
        name: 'Folha de pagamento',
        description: 'Gestão financeira da equipe',
        status: 'Inativo',
        locked: false,
      },
    ],
  },
  {
    id: 5,
    name: 'Fase 5 — Gestor SaaS & Escalabilidade',
    warning: 'Fase 5 requer licenciamento SaaS. Disponível em breve.',
    modules: [
      {
        id: 'm5-1',
        name: 'Dashboard do gestor',
        description: 'Métricas globais da plataforma',
        status: 'Em Breve',
        locked: true,
      },
      {
        id: 'm5-2',
        name: 'Gestão de assinaturas (Stripe)',
        description: 'Cobrança do SaaS',
        status: 'Em Breve',
        locked: true,
      },
      {
        id: 'm5-3',
        name: 'Gestão de planos',
        description: 'Configuração de tiers',
        status: 'Em Breve',
        locked: true,
      },
      {
        id: 'm5-4',
        name: 'Suporte',
        description: 'Helpdesk centralizado',
        status: 'Em Breve',
        locked: true,
      },
      {
        id: 'm5-5',
        name: 'Analytics',
        description: 'Análise de uso e engajamento',
        status: 'Em Breve',
        locked: true,
      },
      {
        id: 'm5-6',
        name: 'Escalabilidade (Kubernetes)',
        description: 'Infraestrutura elástica',
        status: 'Em Breve',
        locked: true,
      },
      {
        id: 'm5-7',
        name: 'Migração de infra',
        description: 'Ferramentas de migração de dados',
        status: 'Em Breve',
        locked: true,
      },
      {
        id: 'm5-8',
        name: 'Preparação para app nativo',
        description: 'APIs Mobile-first',
        status: 'Em Breve',
        locked: true,
      },
    ],
  },
]

export default function ModulosList() {
  const { user } = useAuth()
  const [phases, setPhases] = useState<Phase[]>(initialPhases)

  if (user?.profile !== 'admin') {
    return <Navigate to="/" replace />
  }

  const toggleModule = (phaseId: number, moduleId: string) => {
    setPhases((current) =>
      current.map((phase) => {
        if (phase.id !== phaseId) return phase
        return {
          ...phase,
          modules: phase.modules.map((mod) => {
            if (mod.id !== moduleId || mod.locked) return mod
            return {
              ...mod,
              status: mod.status === 'Ativo' ? 'Inativo' : 'Ativo',
            }
          }),
        }
      }),
    )
  }

  const stats = useMemo(() => {
    let active = 0
    let lockedCore = 0
    let inactive = 0
    let highestPhase = 0

    phases.forEach((phase) => {
      let phaseActiveCount = 0
      const totalModules = phase.modules.length

      phase.modules.forEach((mod) => {
        if (mod.status === 'Ativo') active++
        if (mod.status === 'Core') lockedCore++
        if (mod.status === 'Inativo') inactive++
        if (mod.status === 'Ativo' || mod.status === 'Core') phaseActiveCount++
      })

      if (totalModules > 0 && phaseActiveCount / totalModules >= 0.5) {
        highestPhase = Math.max(highestPhase, phase.id)
      }
    })

    return { active, lockedCore, inactive, highestPhase }
  }, [phases])

  const getBadgeStyle = (status: ModuleStatus) => {
    switch (status) {
      case 'Core':
      case 'Concluído':
        return 'bg-blue-100 text-[#1E40AF] border-blue-200'
      case 'Ativo':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Inativo':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      case 'Em Breve':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 font-sans">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1E40AF] tracking-tight">Módulos do Sistema</h1>
        <p className="text-slate-500">
          Gerencie os módulos ativos, monitore a fundação do sistema e visualize o roadmap de
          escalabilidade.
        </p>
      </div>

      <Alert className="bg-amber-50 border-amber-200 text-amber-800">
        <AlertCircle className="h-4 w-4" color="#d97706" />
        <AlertTitle className="font-semibold text-amber-900">Atenção</AlertTitle>
        <AlertDescription>
          Alterar módulos afeta todos os usuários do sistema. Desative com cautela. Módulos core não
          podem ser removidos.
        </AlertDescription>
      </Alert>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200 rounded-[8px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Módulos Ativos</CardTitle>
            <Activity className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 rounded-[8px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Módulos Core Bloqueados
            </CardTitle>
            <Lock className="h-4 w-4 text-[#1E40AF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.lockedCore}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 rounded-[8px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Módulos Inativos</CardTitle>
            <Box className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 bg-[#1E40AF] text-white rounded-[8px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Fase Atual do Sistema
            </CardTitle>
            <Server className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Fase {stats.highestPhase}</div>
          </CardContent>
        </Card>
      </div>

      {/* Phases */}
      <div className="space-y-10">
        {phases.map((phase) => (
          <div key={phase.id} className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h2 className="text-xl font-bold text-slate-900">{phase.name}</h2>
              {phase.warning && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{phase.warning}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {phase.modules.map((mod) => (
                <Card
                  key={mod.id}
                  className={cn(
                    'shadow-sm transition-all duration-200 rounded-[8px] flex flex-col h-full',
                    mod.status === 'Em Breve' ? 'opacity-70 bg-slate-50/50' : 'bg-white',
                  )}
                >
                  <CardContent className="p-5 flex flex-col h-full flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="font-semibold text-slate-900 leading-tight">{mod.name}</div>
                        <p className="text-sm text-slate-500 leading-snug">{mod.description}</p>
                      </div>
                      <div className="flex-shrink-0 pt-0.5">
                        {mod.locked ? (
                          mod.status === 'Em Breve' ? null : (
                            <Lock className="w-4 h-4 text-slate-300" />
                          )
                        ) : (
                          <Switch
                            checked={mod.status === 'Ativo' || mod.status === 'Core'}
                            onCheckedChange={() => toggleModule(phase.id, mod.id)}
                            className="data-[state=checked]:bg-[#1E40AF]"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium rounded-full',
                          getBadgeStyle(mod.status),
                        )}
                      >
                        {mod.status === 'Core' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {mod.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

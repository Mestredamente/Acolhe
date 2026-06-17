import { useState, useEffect } from 'react'
import { Bot } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Automacao, AutomacaoHistorico, getAutomacoes, getHistorico } from '@/services/automacoes'
import { getConfig, ConfigClinica } from '@/services/config_clinica'
import { ConnectionCard } from './ConnectionCard'
import { AutomacaoList } from './AutomacaoList'
import { Historico } from './Historico'
import { LgpdAlert } from './LgpdAlert'

export default function AutomacoesList() {
  const [config, setConfig] = useState<ConfigClinica | null>(null)
  const [automacoes, setAutomacoes] = useState<Automacao[]>([])
  const [historico, setHistorico] = useState<AutomacaoHistorico[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const userId = pb.authStore.record?.id
    if (!userId) return
    const [cfg, autos, hist] = await Promise.all([
      getConfig(userId),
      getAutomacoes(),
      getHistorico(),
    ])
    setConfig(cfg)
    setAutomacoes(autos)
    setHistorico(hist)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return null

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up pb-10">
      <div>
        <h1 className="text-3xl font-bold text-cyan-900 tracking-tight flex items-center gap-2">
          <Bot className="w-8 h-8 text-cyan-700" />
          Automações de WhatsApp
        </h1>
        <p className="text-slate-500 mt-2">
          Gerencie o envio automático de confirmações, lembretes e pesquisas pós-sessão.
        </p>
      </div>

      <ConnectionCard config={config} onUpdate={loadData} />

      {config?.whatsapp_connected && <AutomacaoList automacoes={automacoes} onUpdate={loadData} />}

      <Historico historico={historico} />

      <LgpdAlert />
    </div>
  )
}

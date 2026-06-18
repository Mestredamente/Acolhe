import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { logSessionAccess } from '@/services/telepsicologia'
import { Video, ShieldCheck, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

export default function Sessao() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const [joined, setJoined] = useState(false)
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const apt = await pb
          .collection('appointments')
          .getFirstListItem(`link_sessao ~ '${id}' || id = '${id}'`)
        if (apt) setAppointment(apt)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (isAuthenticated) load()
    else setLoading(false)
  }, [id, isAuthenticated])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="loading-spinner border-blue-600" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" />

  const handleJoin = async () => {
    if (appointment) {
      await logSessionAccess(appointment.id, 'entrada').catch(console.error)
    }
    setJoined(true)
  }

  const handleLeave = async () => {
    if (appointment) {
      await logSessionAccess(appointment.id, 'saida').catch(console.error)
    }
    window.close()
    // Fallback se window.close() for bloqueado pelo navegador
    window.location.href = user?.profile === 'paciente' ? '/portal/atendimentos' : '/agenda'
  }

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 max-w-md w-full text-center space-y-6 animate-fade-in-up">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <Video className="w-8 h-8 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sala Virtual Segura</h1>
            <p className="text-slate-500 mt-2">Pronto para iniciar a sessão de telepsicologia?</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 bg-emerald-50 py-2 px-4 rounded-full mx-auto w-max border border-emerald-100 font-medium">
            <ShieldCheck className="w-4 h-4" />
            Acesso monitorado (CFP/LGPD)
          </div>

          <Button
            size="lg"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white shadow-md transition-all"
            onClick={handleJoin}
          >
            <Video className="w-4 h-4 mr-2" />
            Ingressar na Sessão
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white font-sans">
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Sessão em Andamento</h2>
            <p className="text-xs text-slate-400">Ambiente seguro e criptografado</p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleLeave}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da Sala
        </Button>
      </header>

      <main className="flex-1 p-6 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full">
        <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600">
              <User className="w-12 h-12 text-slate-400" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg text-sm backdrop-blur-md text-white font-medium border border-white/10">
            {user?.name || 'Participante'}
          </div>
        </div>
      </main>
    </div>
  )
}

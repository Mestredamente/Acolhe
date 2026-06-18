import { useEffect, useState } from 'react'
import { getActiveTermos, getMyAceites, createAceite, TermoVersionamento } from '@/services/termos'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

export function TermosAcceptanceModal() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [termos, setTermos] = useState<TermoVersionamento[]>([])
  const [acceptedState, setAcceptedState] = useState<Record<string, boolean>>({})
  const [canAcceptState, setCanAcceptState] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    const checkTermos = async () => {
      try {
        const active = await getActiveTermos()
        const myAceites = await getMyAceites(user.id)
        const myAceiteTermoIds = new Set(myAceites.map((a) => a.termo_id))

        const pending = active.filter((t) => !myAceiteTermoIds.has(t.id) && t.obrigatorio)
        if (pending.length > 0) {
          setTermos(pending)
          setOpen(true)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    checkTermos()
  }, [user])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, id: string) => {
    const target = e.currentTarget
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 20) {
      setCanAcceptState((prev) => ({ ...prev, [id]: true }))
    }
  }

  const handleAcceptAll = async () => {
    setSaving(true)
    try {
      for (const t of termos) {
        if (acceptedState[t.id]) {
          await createAceite(t.id, user!.id)
        }
      }
      setOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !open) return null

  const allChecked = termos.every((t) => acceptedState[t.id])

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>Atualização dos Termos Legais</DialogTitle>
          <DialogDescription>
            Publicamos novas versões dos nossos termos. Para continuar usando o PsicoGestão, você
            precisa ler e aceitar os documentos abaixo. Role até o final de cada termo para
            habilitar a opção de aceite.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {termos.map((t) => (
            <div key={t.id} className="space-y-3">
              <h3 className="font-semibold text-sm">
                {t.titulo} (Versão {t.versao})
              </h3>
              <ScrollArea
                className="h-48 rounded-md border p-4 bg-muted/20"
                onScrollCapture={(e) => handleScroll(e, t.id)}
              >
                <div className="whitespace-pre-wrap text-sm text-muted-foreground pb-4">
                  {t.conteudo}
                </div>
              </ScrollArea>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`accept-${t.id}`}
                  disabled={!canAcceptState[t.id]}
                  checked={acceptedState[t.id] || false}
                  onCheckedChange={(c) => setAcceptedState((prev) => ({ ...prev, [t.id]: !!c }))}
                />
                <label
                  htmlFor={`accept-${t.id}`}
                  className={`text-sm font-medium leading-none ${!canAcceptState[t.id] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  Li e aceito o documento: {t.titulo}
                </label>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="shrink-0 pt-4">
          <Button disabled={!allChecked || saving} onClick={handleAcceptAll}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Anamnese, getAnamnese, saveAnamnese } from '@/services/anamneses'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { AnamneseForm } from './AnamneseForm'
import { AnamneseView } from './AnamneseView'

export function AnamneseTab({ patientId }: { patientId: string }) {
  const { toast } = useToast()
  const [anamnese, setAnamnese] = useState<Anamnese | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadAnamnese = async () => {
    setLoading(true)
    try {
      const data = await getAnamnese(patientId)
      setAnamnese(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnamnese()
  }, [patientId])

  useRealtime('anamneses', (e) => {
    if (e.record.patient_id === patientId) loadAnamnese()
  })

  const handleSave = async (data: Partial<Anamnese>) => {
    try {
      data.patient_id = patientId
      if (!data.completion_date) {
        data.completion_date = new Date().toISOString()
      }
      await saveAnamnese(data)
      toast({ title: 'Sucesso', description: 'Anamnese salva com sucesso.' })
      setIsEditing(false)
      loadAnamnese()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message || 'Erro ao salvar', variant: 'destructive' })
    }
  }

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando anamnese...</div>

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Anamnese</CardTitle>
          <CardDescription>Registro clínico inicial do paciente.</CardDescription>
        </div>
        <div className="flex gap-2 items-center">
          <Badge
            variant={anamnese ? 'default' : 'secondary'}
            className={anamnese ? 'bg-cyan-600' : ''}
          >
            {anamnese ? 'Preenchida' : 'Pendente'}
          </Badge>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <AnamneseForm
            initialData={anamnese || {}}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : anamnese ? (
          <AnamneseView anamnese={anamnese} />
        ) : (
          <div className="text-center py-12 text-muted-foreground animate-fade-in">
            <p className="mb-4">Anamnese ainda não preenchida.</p>
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Preencher Anamnese
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

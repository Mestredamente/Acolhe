import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import { createConsentimento } from '@/services/consentimentos'

export function PortalOnboarding() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [patient, setPatient] = useState<any>(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)

  const [consents, setConsents] = useState({
    lgpd: false,
    uso_ia: false,
    telepsicologia: false,
    termos_plataforma: false,
  })

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const result = await pb
          .collection('patients')
          .getFirstListItem(`link_convite="${token}" && status_convite="enviado"`)
        setPatient(result)
      } catch (e) {
        toast({
          title: 'Link inválido',
          description: 'O link de convite é inválido ou já foi utilizado.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    if (token) verifyToken()
  }, [token])

  const handleRegister = async () => {
    if (!password) {
      toast({ title: 'Erro', description: 'Por favor, insira uma senha.', variant: 'destructive' })
      return
    }
    if (!consents.lgpd || !consents.termos_plataforma) {
      toast({
        title: 'Erro',
        description: 'Os termos de uso e LGPD são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      const user = await pb.collection('users').create({
        email: patient.email,
        password: password,
        passwordConfirm: password,
        name: patient.name,
        profile: 'paciente',
        status: 'ativo',
      })

      await pb.collection('patients').update(patient.id, {
        user_id: user.id,
        status_convite: 'aceito',
        link_convite: '',
      })

      const types = ['lgpd', 'uso_ia', 'telepsicologia', 'termos_plataforma']
      for (const t of types) {
        await createConsentimento({
          paciente_id: patient.id,
          tipo: t as any,
          aceito: consents[t as keyof typeof consents],
          data_aceite: new Date().toISOString(),
          versao_termo: '1.0',
        })
      }

      toast({
        title: 'Sucesso!',
        description: 'Sua conta foi criada. Faça login para acessar o portal.',
      })
      navigate('/portal/login')
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar sua conta.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Carregando...</div>

  if (!patient) return <div className="p-8 text-center text-red-600">Convite inválido.</div>

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Bem-vindo(a), {patient.name}!</CardTitle>
          <CardDescription>
            Finalize seu cadastro e revise os termos de consentimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={patient.email} disabled />
          </div>
          <div className="space-y-2">
            <Label>Crie uma Senha</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium text-slate-800">Termos e Consentimentos</h3>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="c-lgpd"
                checked={consents.lgpd}
                onCheckedChange={(c) => setConsents({ ...consents, lgpd: !!c })}
              />
              <Label htmlFor="c-lgpd" className="leading-snug">
                Eu concordo com o Termo de Tratamento de Dados (LGPD). (Obrigatório)
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="c-termos"
                checked={consents.termos_plataforma}
                onCheckedChange={(c) => setConsents({ ...consents, termos_plataforma: !!c })}
              />
              <Label htmlFor="c-termos" className="leading-snug">
                Eu concordo com os Termos de Uso da Plataforma. (Obrigatório)
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="c-ia"
                checked={consents.uso_ia}
                onCheckedChange={(c) => setConsents({ ...consents, uso_ia: !!c })}
              />
              <Label htmlFor="c-ia" className="leading-snug">
                Eu autorizo o uso de ferramentas de Inteligência Artificial para transcrição e
                auxílio na elaboração de resumos pelo meu psicólogo. (Opcional)
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="c-tele"
                checked={consents.telepsicologia}
                onCheckedChange={(c) => setConsents({ ...consents, telepsicologia: !!c })}
              />
              <Label htmlFor="c-tele" className="leading-snug">
                Eu concordo com os termos de atendimento em modalidade online (Telepsicologia).
                (Opcional)
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRegister} className="w-full" disabled={loading}>
            Finalizar Cadastro
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

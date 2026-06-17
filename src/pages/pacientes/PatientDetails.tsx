import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Copy,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { mockPatients } from '@/lib/mock-data'

export default function PatientDetails() {
  const { id } = useParams()
  const { toast } = useToast()

  const patient = mockPatients.find((p) => p.id === id)

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Paciente não encontrado</h2>
        <Button asChild className="mt-4">
          <Link to="/">Voltar ao Início</Link>
        </Button>
      </div>
    )
  }

  const handleCopyBilling = () => {
    const textToCopy = `Nome: ${patient.name}\nDocumento: ${patient.billing.document}\nEndereço: ${patient.billing.address}`
    navigator.clipboard.writeText(textToCopy)
    toast({
      title: 'Dados copiados!',
      description: 'Os dados de faturamento foram copiados para a área de transferência.',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/pacientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-primary">Ficha do Paciente</h1>
      </div>

      {/* Profile Header */}
      <Card className="shadow-sm border-t-4 border-t-primary">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
              <AvatarImage src={patient.photoUrl} alt={patient.name} />
              <AvatarFallback className="text-2xl">{patient.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold tracking-tight">{patient.name}</h2>
                <Badge
                  variant={patient.status === 'Ativo' ? 'default' : 'secondary'}
                  className={patient.status === 'Ativo' ? 'bg-green-600' : ''}
                >
                  {patient.status}
                </Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" /> {patient.age} anos • Nasc:{' '}
                {new Date(patient.dob).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button className="flex-1 md:flex-none">
                <Calendar className="h-4 w-4 mr-2" /> Agendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs System */}
      <Tabs defaultValue="cadastrais" className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap bg-background border-b rounded-none px-0 gap-6">
          <TabsTrigger
            value="cadastrais"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Dados Cadastrais
          </TabsTrigger>
          <TabsTrigger
            value="anamnese"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Anamnese
          </TabsTrigger>
          <TabsTrigger
            value="prontuario"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Prontuário
          </TabsTrigger>
          <TabsTrigger
            value="evolucoes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Evoluções
          </TabsTrigger>
          <TabsTrigger
            value="documentos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Documentos
          </TabsTrigger>
          <TabsTrigger
            value="financeiro"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3"
          >
            Financeiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cadastrais" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                    <p className="text-sm">{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CPF</p>
                    <p className="text-sm">{patient.cpf}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Telefone
                    </p>
                    <p className="text-sm">{patient.phone}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </p>
                    <p className="text-sm">{patient.email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Endereço
                    </p>
                    <p className="text-sm">{patient.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" /> Contato de Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome do Contato</p>
                    <p className="text-sm">{patient.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                    <p className="text-sm">{patient.emergencyContact.phone}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-l-4 border-l-primary/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Faturamento
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyBilling}
                    className="text-primary hover:bg-primary/10"
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copiar Dados
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CPF / CNPJ</p>
                    <p className="text-sm font-mono">{patient.billing.document}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Endereço de Cobrança
                    </p>
                    <p className="text-sm">{patient.billing.address}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="anamnese" className="mt-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Anamnese</CardTitle>
              <CardDescription>Histórico e dados iniciais do paciente.</CardDescription>
            </CardHeader>
            <CardContent className="h-32 flex items-center justify-center border-t border-dashed bg-muted/20">
              <p className="text-muted-foreground text-sm">
                Nenhum registro de anamnese encontrado. Clique em "Nova Anamnese" para começar.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholders for other tabs to show full functional UI */}
        {['prontuario', 'evolucoes', 'documentos', 'financeiro'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="capitalize">{tab}</CardTitle>
                <CardDescription>Gestão de {tab} do paciente.</CardDescription>
              </CardHeader>
              <CardContent className="h-32 flex items-center justify-center border-t border-dashed bg-muted/20">
                <p className="text-muted-foreground text-sm">Área em desenvolvimento para {tab}.</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

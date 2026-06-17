import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PacientesList() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie todos os seus pacientes.</p>
        </div>
        <Button>Novo Paciente</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listagem Completa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            Selecione um paciente na Dashboard por enquanto.
          </p>
          <Button variant="outline" asChild>
            <Link to="/">Voltar ao Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

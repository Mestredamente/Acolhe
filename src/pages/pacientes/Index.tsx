import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PatientFormDialog } from '@/components/PatientFormDialog'
import { getPatients, Patient } from '@/services/patients'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'

export default function PacientesList() {
  const [patients, setPatients] = useState<Patient[]>([])

  const loadData = async () => {
    try {
      setPatients(await getPatients())
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('patients', loadData)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie todos os seus pacientes.</p>
        </div>
        <PatientFormDialog />
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Listagem Completa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Email/Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => {
                  const avatarUrl = patient.avatar ? pb.files.getURL(patient, patient.avatar) : ''
                  return (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={avatarUrl} alt={patient.name} />
                            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium text-sm">{patient.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{patient.email || '-'}</div>
                        <div className="text-xs text-muted-foreground">{patient.phone || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={patient.status === 'active' ? 'default' : 'secondary'}
                          className={
                            patient.status === 'active' ? 'bg-teal-600 hover:bg-teal-700' : ''
                          }
                        >
                          {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-primary hover:bg-primary/10"
                        >
                          <Link to={`/pacientes/${patient.id}`}>Abrir Ficha</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {patients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum paciente cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

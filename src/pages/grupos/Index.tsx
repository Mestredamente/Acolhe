import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getGrupos, GrupoTerapeutico } from '@/services/grupos'
import { Badge } from '@/components/ui/badge'
import { GrupoFormDialog } from '@/components/grupos/GrupoFormDialog'

export default function GruposList() {
  const [grupos, setGrupos] = useState<GrupoTerapeutico[]>([])

  useEffect(() => {
    getGrupos().then(setGrupos)
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Grupos Terapêuticos</h1>
          <p className="text-slate-500">Gerencie sessões em grupo e participantes</p>
        </div>
        <GrupoFormDialog
          trigger={
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Grupo
            </Button>
          }
          onSaved={() => getGrupos().then(setGrupos)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {grupos.map((g) => (
          <Card key={g.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{g.nome}</CardTitle>
                <Badge
                  variant={g.status === 'ativo' ? 'default' : 'secondary'}
                  className={g.status === 'ativo' ? 'bg-emerald-500' : ''}
                >
                  {g.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{g.tema}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm mb-4">
                <Users className="w-4 h-4 text-slate-500" />
                <span>
                  {g.participantes?.length || 0} / {g.limite_participantes} participantes
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{g.descricao}</p>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/grupos/${g.id}`}>Gerenciar</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {grupos.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            Nenhum grupo cadastrado.
          </div>
        )}
      </div>
    </div>
  )
}

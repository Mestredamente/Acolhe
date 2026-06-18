import pb from '@/lib/pocketbase/client'

export interface TenantDemo {
  id: string
  nome: string
  tipo: 'clinica' | 'autonomo'
  plano: string
  status: 'ativo' | 'inativo'
  data_expiracao?: string
  demo_user_id?: string
  demo_clinica_id?: string
  created: string
  updated: string
  expand?: {
    demo_user_id?: { email: string }
  }
}

export const getTenantsDemo = () =>
  pb
    .collection<TenantDemo>('tenants_demo')
    .getFullList({ expand: 'demo_user_id', sort: '-created' })
export const deleteTenantDemo = (id: string) => pb.collection('tenants_demo').delete(id)
export const createDemoTenant = (data: { nome: string; tipo: string; plano: string }) =>
  pb.send('/backend/v1/demo-tenants', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

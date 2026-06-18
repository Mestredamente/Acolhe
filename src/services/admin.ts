import pb from '@/lib/pocketbase/client'

export interface EmpresaFiscal {
  id: string
  cnpj: string
  razao_social: string
  endereco?: string
  regime_tributario?: string
  created: string
  updated: string
}

export const getEmpresaFiscal = async () => {
  const records = await pb.collection<EmpresaFiscal>('empresa_fiscal').getFullList()
  return records[0] || null
}

export const saveEmpresaFiscal = async (data: Partial<EmpresaFiscal>, id?: string) => {
  if (id) {
    return pb.collection<EmpresaFiscal>('empresa_fiscal').update(id, data)
  }
  return pb.collection<EmpresaFiscal>('empresa_fiscal').create(data)
}

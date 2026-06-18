import pb from '@/lib/pocketbase/client'

export interface EmpresaFiscal {
  id: string
  cnpj: string
  razao_social: string
  endereco?: string
  regime_tributario?: string
  nome_aplicativo?: string
  logo_aplicativo?: string
  nome_fantasia?: string
  inscricao_estadual?: string
  inscricao_municipal?: string
  telefone?: string
  email_contato?: string
  website?: string
  cor_primaria?: string
  frase_boas_vindas?: string
  cep?: string
  logradouro?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
}

export async function getEmpresaFiscal(): Promise<EmpresaFiscal | null> {
  try {
    const records = await pb.collection('empresa_fiscal').getFullList<EmpresaFiscal>()
    return records.length > 0 ? records[0] : null
  } catch {
    return null
  }
}

export async function saveEmpresaFiscal(
  id: string | null,
  data: Partial<EmpresaFiscal> | FormData,
): Promise<EmpresaFiscal> {
  if (id) {
    return await pb.collection('empresa_fiscal').update<EmpresaFiscal>(id, data)
  } else {
    return await pb.collection('empresa_fiscal').create<EmpresaFiscal>(data)
  }
}

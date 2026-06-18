import pb from '@/lib/pocketbase/client'

export interface EmpresaFiscal {
  id: string
  cnpj: string
  razao_social: string
  nome_fantasia?: string
  inscricao_estadual?: string
  inscricao_municipal?: string
  regime_tributario?: string
  endereco?: string
  telefone?: string
  email_contato?: string
  website?: string
  nome_aplicativo?: string
  logo_aplicativo?: string
  cor_primaria?: string
  frase_boas_vindas?: string
  cep?: string
  logradouro?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
  timezone?: string
  moeda?: string
  idioma?: string
  dominio_personalizado?: string
}

export const getEmpresaFiscal = async () => {
  try {
    const records = await pb.collection('empresa_fiscal').getFullList<EmpresaFiscal>()
    return records[0] || null
  } catch {
    return null
  }
}

export const saveEmpresaFiscal = async (
  id: string | null,
  data: FormData | Partial<EmpresaFiscal>,
) => {
  if (id) {
    return pb.collection('empresa_fiscal').update<EmpresaFiscal>(id, data)
  }
  return pb.collection('empresa_fiscal').create<EmpresaFiscal>(data)
}

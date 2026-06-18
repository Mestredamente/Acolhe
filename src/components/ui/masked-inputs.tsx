import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, X, Search, Loader2, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Utility functions
export function isValidCPF(cpf: string) {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false
  let chk1 = 0,
    chk2 = 0
  for (let i = 0; i < 9; i++) {
    chk1 += parseInt(cpf.charAt(i)) * (10 - i)
    chk2 += parseInt(cpf.charAt(i)) * (11 - i)
  }
  chk1 = (chk1 * 10) % 11
  if (chk1 === 10 || chk1 === 11) chk1 = 0
  chk2 += chk1 * 2
  chk2 = (chk2 * 10) % 11
  if (chk2 === 10 || chk2 === 11) chk2 = 0
  return chk1 === parseInt(cpf.charAt(9)) && chk2 === parseInt(cpf.charAt(10))
}

export function isValidCNPJ(cnpj: string) {
  cnpj = cnpj.replace(/[^\d]+/g, '')
  if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false
  let size = cnpj.length - 2
  let numbers = cnpj.substring(0, size)
  let digits = cnpj.substring(size)
  let sum = 0
  let pos = size - 7
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false
  size = size + 1
  numbers = cnpj.substring(0, size)
  sum = 0
  pos = size - 7
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return result === parseInt(digits.charAt(1))
}

export function isValidCpfOrCnpj(value: string) {
  const clean = value.replace(/\D/g, '')
  if (clean.length === 11) return isValidCPF(clean)
  if (clean.length === 14) return isValidCNPJ(clean)
  return false
}

export const CpfInput = React.forwardRef<HTMLInputElement, any>(
  ({ onValidityChange, value, onChange, className, ...props }, ref) => {
    const { toast } = useToast()
    const [valid, setValid] = useState<boolean | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, '')
      if (val.length > 11) val = val.slice(0, 11)
      let masked = val
      if (val.length > 9) masked = val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      else if (val.length > 6) masked = val.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
      else if (val.length > 3) masked = val.replace(/(\d{3})(\d{1,3})/, '$1.$2')

      e.target.value = masked
      if (onChange) onChange(e)

      if (val.length === 11) {
        const isValid = isValidCPF(val)
        setValid(isValid)
        if (onValidityChange) onValidityChange(isValid)
        if (!isValid) {
          toast({
            title: (
              <div className="flex items-center gap-2">
                <X className="w-4 h-4" /> Erro
              </div>
            ),
            description: 'CPF inválido.',
            className: 'bg-[#DC2626] text-white border-none',
            duration: 5000,
          })
        }
      } else {
        setValid(null)
        if (onValidityChange) onValidityChange(false)
      }
    }

    return (
      <div className="relative flex items-center">
        <Input
          ref={ref}
          value={value}
          onChange={handleChange}
          maxLength={14}
          className={cn('pr-10', className)}
          {...props}
        />
        {valid === true && (
          <Check className="absolute right-3 w-4 h-4 text-emerald-500 animate-slide-in-left" />
        )}
        {valid === false && (
          <X className="absolute right-3 w-4 h-4 text-red-500 animate-slide-in-left" />
        )}
      </div>
    )
  },
)
CpfInput.displayName = 'CpfInput'

export const CpfCnpjInput = React.forwardRef<HTMLInputElement, any>(
  ({ onValidityChange, onFetchData, value, onChange, className, ...props }, ref) => {
    const { toast } = useToast()
    const [valid, setValid] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, '')
      if (val.length > 14) val = val.slice(0, 14)
      let masked = val
      if (val.length <= 11) {
        if (val.length > 9) masked = val.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
        else if (val.length > 6) masked = val.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
        else if (val.length > 3) masked = val.replace(/(\d{3})(\d{1,3})/, '$1.$2')
      } else {
        masked = val.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5')
      }

      e.target.value = masked
      if (onChange) onChange(e)

      if (val.length === 11 || val.length === 14) {
        const isValid = val.length === 11 ? isValidCPF(val) : isValidCNPJ(val)
        setValid(isValid)
        if (onValidityChange) onValidityChange(isValid)
        if (!isValid) {
          toast({
            title: (
              <div className="flex items-center gap-2">
                <X className="w-4 h-4" /> Erro
              </div>
            ),
            description: val.length === 11 ? 'CPF inválido.' : 'CNPJ inválido.',
            className: 'bg-[#DC2626] text-white border-none',
            duration: 5000,
          })
        }
      } else {
        setValid(null)
        if (onValidityChange) onValidityChange(false)
      }
    }

    const fetchCNPJ = async () => {
      const clean = typeof value === 'string' ? value.replace(/\D/g, '') : ''
      if (clean.length !== 14) return

      setLoading(true)
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" /> Buscando dados
          </div>
        ),
        description: 'Buscando dados do CNPJ...',
        className: 'bg-[#3B82F6] text-white border-none',
        duration: 3000,
      })

      try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`)
        if (!res.ok) throw new Error('CNPJ não encontrado')
        const data = await res.json()

        toast({
          title: (
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" /> Sucesso
            </div>
          ),
          description: 'Dados do CNPJ encontrados!',
          className: 'bg-[#10B981] text-white border-none',
          duration: 3000,
        })

        if (onFetchData) {
          onFetchData({
            nome: data.razao_social || data.nome_fantasia || '',
            cep: data.cep || '',
            logradouro: data.logradouro || '',
            numero: data.numero || '',
            bairro: data.bairro || '',
            cidade: data.municipio || '',
            estado: data.uf || '',
            pais: 'Brasil',
          })
        }
      } catch (err) {
        toast({
          title: (
            <div className="flex items-center gap-2">
              <X className="w-4 h-4" /> Erro
            </div>
          ),
          description: 'Não foi possível buscar os dados deste CNPJ.',
          className: 'bg-[#DC2626] text-white border-none',
          duration: 5000,
        })
      } finally {
        setLoading(false)
      }
    }

    const cleanLength = typeof value === 'string' ? value.replace(/\D/g, '').length : 0

    return (
      <div className="flex gap-2 relative items-center w-full">
        <div className="relative flex-1">
          <Input
            ref={ref}
            value={value}
            onChange={handleChange}
            maxLength={18}
            className={cn('pr-10', className)}
            {...props}
          />
          {valid === true && cleanLength === 11 && (
            <Check className="absolute right-3 top-3 w-4 h-4 text-emerald-500 animate-slide-in-left" />
          )}
          {valid === false && cleanLength === 11 && (
            <X className="absolute right-3 top-3 w-4 h-4 text-red-500 animate-slide-in-left" />
          )}
        </div>
        {cleanLength === 14 && (
          <Button
            type="button"
            variant="secondary"
            onClick={fetchCNPJ}
            disabled={loading || valid === false}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Buscar Dados
          </Button>
        )}
      </div>
    )
  },
)
CpfCnpjInput.displayName = 'CpfCnpjInput'

const countryCodes = [
  { code: 'BR', ddi: '+55', flag: '🇧🇷' },
  { code: 'US', ddi: '+1', flag: '🇺🇸' },
  { code: 'PT', ddi: '+351', flag: '🇵🇹' },
]

export const PhoneInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onChange, onBlur, className, ...props }, ref) => {
    const { toast } = useToast()
    const [ddi, setDdi] = useState('+55')
    const [valid, setValid] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      if (typeof value === 'string' && value.startsWith('+')) {
        const found = countryCodes.find((c) => value.startsWith(c.ddi))
        if (found && found.ddi !== ddi) {
          setDdi(found.ddi)
        }
      }
    }, [value, ddi])

    const formatPhone = (val: string) => {
      const clean = val.replace(/\D/g, '')
      if (ddi === '+55') {
        if (clean.length > 10)
          return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15)
        if (clean.length > 6) return clean.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
        if (clean.length > 2) return clean.replace(/(\d{2})(\d{0,5})/, '($1) $2')
        return clean
      }
      return clean
    }

    const localValue = typeof value === 'string' ? value.replace(ddi, '').trim() : ''

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = formatPhone(e.target.value)
      if (onChange) {
        const syntheticEvent = { ...e, target: { ...e.target, value: `${ddi} ${masked}` } }
        onChange(syntheticEvent as any)
      }
      setValid(null)
    }

    const handleDdiChange = (newDdi: string) => {
      setDdi(newDdi)
      if (onChange) {
        const cleanVal = formatPhone(localValue)
        onChange({ target: { value: `${newDdi} ${cleanVal}` } } as any)
      }
    }

    const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) onBlur(e)

      const cleanNum = localValue.replace(/\D/g, '')
      if (!cleanNum) return

      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 800))

        let isValid = true
        if (ddi === '+55') {
          isValid = cleanNum.length === 10 || cleanNum.length === 11
        } else {
          isValid = cleanNum.length >= 8
        }

        setValid(isValid)
        if (!isValid) {
          toast({
            title: (
              <div className="flex items-center gap-2">
                <X className="w-4 h-4" /> Erro
              </div>
            ),
            description: 'Número inválido ou inativo.',
            className: 'bg-[#DC2626] text-white border-none',
            duration: 5000,
          })
        }
      } catch (err) {
        setValid(true)
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="flex relative items-center">
        <Select value={ddi} onValueChange={handleDdiChange}>
          <SelectTrigger className="w-[110px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="DDI" />
          </SelectTrigger>
          <SelectContent>
            {countryCodes.map((c) => (
              <SelectItem key={c.ddi} value={c.ddi}>
                {c.flag} {c.ddi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Input
            ref={ref}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn('rounded-l-none pr-10', className)}
            placeholder="(00) 00000-0000"
            {...props}
          />
          <div className="absolute right-3 top-3">
            {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
            {!loading && valid === true && (
              <Check className="w-4 h-4 text-emerald-500 animate-slide-in-left" />
            )}
            {!loading && valid === false && (
              <X
                className="w-4 h-4 text-red-500 animate-slide-in-left"
                title="Número inválido ou inativo"
              />
            )}
          </div>
        </div>
      </div>
    )
  },
)
PhoneInput.displayName = 'PhoneInput'

export function CurrencyInput({ value, onChange, className, ...props }: any) {
  const displayValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const numericValue = Number(raw) / 100
    onChange(numericValue)
  }

  return <Input value={displayValue} onChange={handleChange} className={className} {...props} />
}

export function AddressFormFields({
  form,
  prefix = '',
  label,
}: {
  form: any
  prefix?: string
  label: string
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const cepValue = form.watch(`${prefix}cep`)

  useEffect(() => {
    const fetchCep = async () => {
      const cleanCep = typeof cepValue === 'string' ? cepValue.replace(/\D/g, '') : ''
      if (cleanCep.length === 8) {
        setLoading(true)
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
          const data = await response.json()
          if (data.erro) {
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4" /> Erro
                </div>
              ),
              description: 'CEP não encontrado.',
              className: 'bg-[#DC2626] text-white border-none',
              duration: 5000,
            })
            form.setError(`${prefix}cep`, {
              type: 'manual',
              message: 'CEP inválido ou não encontrado',
            })
          } else {
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> Sucesso
                </div>
              ),
              description: 'Endereço encontrado!',
              className: 'bg-[#10B981] text-white border-none',
              duration: 3000,
            })
            form.clearErrors(`${prefix}cep`)
            form.setValue(`${prefix}logradouro`, data.logradouro || '', { shouldValidate: true })
            form.setValue(`${prefix}bairro`, data.bairro || '', { shouldValidate: true })
            form.setValue(`${prefix}cidade`, data.localidade || '', { shouldValidate: true })
            form.setValue(`${prefix}estado`, data.uf || '', { shouldValidate: true })
            form.setValue(`${prefix}pais`, 'Brasil', { shouldValidate: true })

            const numeroInput = document.getElementsByName(`${prefix}numero`)[0]
            if (numeroInput) numeroInput.focus()
          }
        } catch (err) {
          toast({
            title: (
              <div className="flex items-center gap-2">
                <X className="w-4 h-4" /> Erro
              </div>
            ),
            description: 'Falha ao buscar CEP.',
            className: 'bg-[#DC2626] text-white border-none',
            duration: 5000,
          })
        } finally {
          setLoading(false)
        }
      }
    }

    const debounceId = setTimeout(() => {
      fetchCep()
    }, 500)

    return () => clearTimeout(debounceId)
  }, [cepValue, prefix, form, toast])

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 8) val = val.slice(0, 8)
    if (val.length > 5) val = val.replace(/^(\d{5})(\d)/, '$1-$2')
    form.setValue(`${prefix}cep`, val, { shouldValidate: true })
  }

  const cepError = form.formState.errors[`${prefix}cep`]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary border-b pb-2 w-full">{label}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <FormField
          control={form.control}
          name={`${prefix}cep`}
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel>CEP</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    maxLength={9}
                    className={cn(
                      'pr-10',
                      cepError ? 'border-red-500 focus-visible:ring-red-500' : '',
                    )}
                  />
                </FormControl>
                <div className="absolute right-3 top-3">
                  {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                  {cepError && !loading && (
                    <X
                      className="w-4 h-4 text-red-500 animate-slide-in-left"
                      title={cepError.message as string}
                    />
                  )}
                  {!cepError && !loading && field.value?.length === 9 && (
                    <Check className="w-4 h-4 text-emerald-500 animate-slide-in-left" />
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}logradouro`}
          render={({ field }) => (
            <FormItem className="md:col-span-7">
              <FormLabel>Rua / Logradouro</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}numero`}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input {...field} id={`${prefix}numero`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}bairro`}
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}cidade`}
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}estado`}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input {...field} maxLength={2} className="uppercase" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}pais`}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>País</FormLabel>
              <FormControl>
                <Input {...field} defaultValue="Brasil" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

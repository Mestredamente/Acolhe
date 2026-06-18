import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Check, X, Search, Loader2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'

export function isValidCPF(cpf: string) {
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  let sum = 0,
    rest
  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i)
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(cpf.substring(9, 10))) return false
  sum = 0
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i)
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(cpf.substring(10, 11))) return false
  return true
}

export function isValidCNPJ(cnpj: string) {
  cnpj = cnpj.replace(/\D/g, '')
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false
  let size = cnpj.length - 2
  let numbers = cnpj.substring(0, size)
  const digits = cnpj.substring(size)
  let sum = 0,
    pos = size - 7
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
  if (result !== parseInt(digits.charAt(1))) return false
  return true
}

export function isValidCpfOrCnpj(val: string) {
  const clean = val.replace(/\D/g, '')
  if (clean.length === 11) return isValidCPF(clean)
  if (clean.length === 14) return isValidCNPJ(clean)
  return false
}

export const CpfInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onChange, onValidityChange, ...props }, ref) => {
    const [valid, setValid] = useState<boolean | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.replace(/\D/g, '')
      if (v.length > 11) v = v.substring(0, 11)
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')

      e.target.value = v
      if (onChange) onChange(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const v = e.target.value
      if (!v) {
        setValid(null)
        onValidityChange?.(true)
        return
      }
      const isV = isValidCPF(v)
      setValid(isV)
      onValidityChange?.(isV)
      if (props.onBlur) props.onBlur(e)
    }

    return (
      <div className="relative flex items-center">
        <Input ref={ref} value={value} onChange={handleChange} onBlur={handleBlur} {...props} />
        {valid === true && <Check className="absolute right-3 text-emerald-500 w-4 h-4" />}
        {valid === false && (
          <Tooltip>
            <TooltipTrigger asChild>
              <X className="absolute right-3 text-red-500 w-4 h-4 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              <p>CPF inválido</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    )
  },
)
CpfInput.displayName = 'CpfInput'

export const CpfCnpjInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onChange, onValidityChange, onFetchData, ...props }, ref) => {
    const [valid, setValid] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.replace(/\D/g, '')
      if (v.length > 14) v = v.substring(0, 14)
      if (v.length <= 11) {
        v = v.replace(/(\d{3})(\d)/, '$1.$2')
        v = v.replace(/(\d{3})(\d)/, '$1.$2')
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      } else {
        v = v.replace(/^(\d{2})(\d)/, '$1.$2')
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
        v = v.replace(/(\d{4})(\d)/, '$1-$2')
      }
      e.target.value = v
      if (onChange) onChange(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const v = e.target.value
      if (!v) {
        setValid(null)
        onValidityChange?.(true)
        return
      }
      const isV = isValidCpfOrCnpj(v)
      setValid(isV)
      onValidityChange?.(isV)
      if (props.onBlur) props.onBlur(e)
    }

    const handleFetch = async () => {
      if (valid) {
        setLoading(true)
        await new Promise((r) => setTimeout(r, 1000))
        setLoading(false)
        toast({
          title: 'Busca automática da Receita Federal',
          description: 'Simulada para demonstração.',
          variant: 'info',
        })
        onFetchData?.({
          nome: 'Empresa Fictícia LTDA',
          cep: '01310-100',
          logradouro: 'Avenida Paulista',
          numero: '1000',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
          pais: 'Brasil',
        })
      }
    }

    return (
      <div className="flex items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <Input ref={ref} value={value} onChange={handleChange} onBlur={handleBlur} {...props} />
          {valid === true && <Check className="absolute right-3 text-emerald-500 w-4 h-4" />}
          {valid === false && (
            <Tooltip>
              <TooltipTrigger asChild>
                <X className="absolute right-3 text-red-500 w-4 h-4 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>CNPJ/CPF inválido</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        {onFetchData && (
          <Button
            type="button"
            variant="outline"
            onClick={handleFetch}
            disabled={!valid || loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="ml-2 sr-only md:not-sr-only">Buscar</span>
          </Button>
        )}
      </div>
    )
  },
)
CpfCnpjInput.displayName = 'CpfCnpjInput'

export const PhoneInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onChange, ...props }, ref) => {
    const [ddi, setDdi] = useState('+55')
    const [rawNumber, setRawNumber] = useState('')

    useEffect(() => {
      if (value && typeof value === 'string') {
        const match = value.match(/^(\+\d+)\s*(.*)/)
        if (match) {
          setDdi(match[1])
          setRawNumber(match[2].replace(/\D/g, ''))
        } else {
          setRawNumber(value.replace(/\D/g, ''))
        }
      } else if (!value) {
        setRawNumber('')
      }
    }, [value])

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.replace(/\D/g, '')
      setRawNumber(v)

      const synthesizedEvent = {
        ...e,
        target: { ...e.target, value: v ? `${ddi} ${v}` : '' },
      }
      if (onChange) onChange(synthesizedEvent as any)
    }

    const handleDdiChange = (newDdi: string) => {
      setDdi(newDdi)
      if (rawNumber) {
        const synthesizedEvent = {
          target: { value: `${newDdi} ${rawNumber}` },
        }
        if (onChange) onChange(synthesizedEvent as any)
      }
    }

    let displayValue = rawNumber
    if (ddi === '+55') {
      if (displayValue.length > 11) displayValue = displayValue.substring(0, 11)
      if (displayValue.length > 2) {
        displayValue = `(${displayValue.substring(0, 2)}) ${displayValue.substring(2)}`
      }
      if (displayValue.length > 9) {
        displayValue = `${displayValue.substring(0, 9)}-${displayValue.substring(9)}`
      }
    } else {
      if (displayValue.length > 15) displayValue = displayValue.substring(0, 15)
    }

    return (
      <div className="flex gap-2">
        <Select value={ddi} onValueChange={handleDdiChange}>
          <SelectTrigger className="w-[100px] shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="+55">🇧🇷 +55</SelectItem>
            <SelectItem value="+1">🇺🇸 +1</SelectItem>
            <SelectItem value="+351">🇵🇹 +351</SelectItem>
          </SelectContent>
        </Select>
        <Input
          ref={ref}
          value={displayValue}
          onChange={handleNumberChange}
          placeholder={ddi === '+55' ? '(00) 00000-0000' : ''}
          {...props}
        />
      </div>
    )
  },
)
PhoneInput.displayName = 'PhoneInput'

export const CurrencyInput = React.forwardRef<HTMLInputElement, any>(
  ({ value, onChange, ...props }, ref) => {
    const displayValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.replace(/\D/g, '')
      if (!v) v = '0'
      const numeric = parseInt(v, 10) / 100
      if (onChange) onChange(numeric)
    }

    return <Input ref={ref} value={displayValue} onChange={handleChange} {...props} />
  },
)
CurrencyInput.displayName = 'CurrencyInput'

export function AddressFormFields({
  form,
  prefix = '',
  label,
}: {
  form: any
  prefix?: string
  label?: string
}) {
  const [loadingCep, setLoadingCep] = useState(false)

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 8) v = v.substring(0, 8)
    v = v.replace(/^(\d{5})(\d)/, '$1-$2')
    form.setValue(`${prefix}cep`, v)

    if (v.length === 9) {
      setLoadingCep(true)
      await new Promise((r) => setTimeout(r, 1000))
      const cepRaw = v.replace(/\D/g, '')
      if (cepRaw === '01310100') {
        form.setValue(`${prefix}logradouro`, 'Avenida Paulista')
        form.setValue(`${prefix}bairro`, 'Bela Vista')
        form.setValue(`${prefix}cidade`, 'São Paulo')
        form.setValue(`${prefix}estado`, 'SP')
        form.setValue(`${prefix}pais`, 'Brasil')
      } else {
        form.setValue(`${prefix}logradouro`, 'Rua Exemplo')
        form.setValue(`${prefix}bairro`, 'Bairro Padrão')
        form.setValue(`${prefix}cidade`, 'Cidade Teste')
        form.setValue(`${prefix}estado`, 'EX')
        form.setValue(`${prefix}pais`, 'Brasil')
      }
      setLoadingCep(false)
      document.getElementById(`${prefix}numero`)?.focus()
    }
  }

  return (
    <div className="space-y-4">
      {label && <h3 className="font-semibold text-primary border-b pb-2">{label}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name={`${prefix}cep`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <div className="relative flex items-center">
                  <Input {...field} onChange={handleCepChange} placeholder="00000-000" />
                  {loadingCep && (
                    <Loader2 className="absolute right-3 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}logradouro`}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Logradouro</FormLabel>
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
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input id={`${prefix}numero`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}bairro`}
          render={({ field }) => (
            <FormItem>
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
            <FormItem>
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
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

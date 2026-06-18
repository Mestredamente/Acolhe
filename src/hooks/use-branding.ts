import { useEffect, useState } from 'react'
import { getEmpresaFiscal } from '@/services/empresa_fiscal'
import { useRealtime } from './use-realtime'
import pb from '@/lib/pocketbase/client'

export function useBranding() {
  const [appName, setAppName] = useState('PsicoGestão')
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#1E3A5F')

  const applyData = (data: any) => {
    if (data.nome_aplicativo) setAppName(data.nome_aplicativo)
    if (data.logo_aplicativo) setLogoUrl(pb.files.getUrl(data, data.logo_aplicativo))
    if (data.cor_primaria) setPrimaryColor(data.cor_primaria)
  }

  useEffect(() => {
    if (pb.authStore.isValid) {
      getEmpresaFiscal().then((data) => {
        if (data) applyData(data)
      })
    }
  }, [])

  useRealtime('empresa_fiscal', (e) => {
    if (e.action === 'update' || e.action === 'create') {
      applyData(e.record)
    }
  })

  useEffect(() => {
    document.title = appName
  }, [appName])

  useEffect(() => {
    if (primaryColor) {
      const hex = primaryColor.replace('#', '')
      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16) / 255
        const g = parseInt(hex.substring(2, 4), 16) / 255
        const b = parseInt(hex.substring(4, 6), 16) / 255
        const max = Math.max(r, g, b),
          min = Math.min(r, g, b)
        let h = 0,
          s = 0,
          l = (max + min) / 2

        if (max !== min) {
          const d = max - min
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0)
              break
            case g:
              h = (b - r) / d + 2
              break
            case b:
              h = (r - g) / d + 4
              break
          }
          h /= 6
        }

        const lValue = l * 100
        const fgL = lValue > 60 ? 10 : 98

        document.documentElement.style.setProperty(
          '--primary',
          `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${lValue.toFixed(1)}%`,
        )
        document.documentElement.style.setProperty('--primary-foreground', `0 0% ${fgL}%`)
      }
    }
  }, [primaryColor])

  return { appName, logoUrl, primaryColor }
}

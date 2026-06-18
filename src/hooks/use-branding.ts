import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { getEmpresaFiscal } from '@/services/empresa_fiscal'

let cachedBranding: {
  appName: string
  logoUrl: string | null
  primaryColor: string | null
  welcomePhrase: string | null
} | null = null

function applyColor(hex: string | null) {
  if (hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      const r = parseInt(result[1], 16) / 255
      const g = parseInt(result[2], 16) / 255
      const b = parseInt(result[3], 16) / 255

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

      const hDeg = Math.round(h * 360)
      const sPct = Math.round(s * 100)
      const lPct = Math.round(l * 100)

      document.documentElement.style.setProperty('--primary', `${hDeg} ${sPct}% ${lPct}%`)
    }
  }
}

export function useBranding() {
  const [appName, setAppName] = useState(cachedBranding?.appName || 'PsicoGestão')
  const [logoUrl, setLogoUrl] = useState<string | null>(cachedBranding?.logoUrl || null)
  const [primaryColor, setPrimaryColor] = useState<string | null>(
    cachedBranding?.primaryColor || null,
  )
  const [welcomePhrase, setWelcomePhrase] = useState<string | null>(
    cachedBranding?.welcomePhrase || null,
  )

  useEffect(() => {
    if (cachedBranding) {
      applyColor(cachedBranding.primaryColor)
      document.title = cachedBranding.appName
      return
    }

    getEmpresaFiscal()
      .then((data) => {
        if (data) {
          const newAppName = data.nome_aplicativo || 'PsicoGestão'
          const newLogoUrl = data.logo_aplicativo
            ? pb.files.getUrl(data, data.logo_aplicativo)
            : null
          const newPrimaryColor = data.cor_primaria || null
          const newWelcomePhrase = data.frase_boas_vindas || null

          cachedBranding = {
            appName: newAppName,
            logoUrl: newLogoUrl,
            primaryColor: newPrimaryColor,
            welcomePhrase: newWelcomePhrase,
          }
          setAppName(newAppName)
          setLogoUrl(newLogoUrl)
          setPrimaryColor(newPrimaryColor)
          setWelcomePhrase(newWelcomePhrase)

          applyColor(newPrimaryColor)
          document.title = newAppName
        }
      })
      .catch(() => {})
  }, [])

  return { appName, logoUrl, primaryColor, welcomePhrase }
}

import React, { useRef, useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw, Check, X } from 'lucide-react'

export interface SignatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (signatureData: string) => void
  defaultSignature?: string
}

export function SignatureDialog({
  open,
  onOpenChange,
  onConfirm,
  defaultSignature,
}: SignatureDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [useDefault, setUseDefault] = useState(!!defaultSignature)

  useEffect(() => {
    if (open) {
      setHasDrawn(false)
      setUseDefault(!!defaultSignature)
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [open, defaultSignature])

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (useDefault) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY

    ctx.beginPath()
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || useDefault) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
    ctx.strokeStyle = '#003344'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()
    setHasDrawn(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const handleClear = () => {
    setUseDefault(false)
    setHasDrawn(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const handleConfirm = () => {
    if (useDefault && defaultSignature) {
      onConfirm(defaultSignature)
    } else {
      const canvas = canvasRef.current
      if (canvas && hasDrawn) {
        onConfirm(canvas.toDataURL('image/png'))
      } else {
        onConfirm('')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-cyan-900">Assinatura Digital</DialogTitle>
          <DialogDescription>
            Assine abaixo para confirmar a validade deste registro.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-md flex items-start gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-600 leading-tight">
            Assinatura digital simulada. Em produção, requer certificação ICP-Brasil para validade
            jurídica plena. Conformidade CFP e LGPD.
          </p>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-white relative">
          {useDefault && defaultSignature ? (
            <div className="flex flex-col items-center justify-center p-4 h-[200px] w-full group">
              <img
                src={defaultSignature}
                alt="Assinatura Padrão"
                className="max-h-full max-w-full object-contain mix-blend-multiply opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Assinar Manualmente
                </Button>
              </div>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              className="w-full h-[200px] touch-none cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          )}
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between mt-4">
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={!hasDrawn && !useDefault}
            className="text-slate-500"
          >
            <X className="w-4 h-4 mr-2" /> Limpar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hasDrawn && !useDefault}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Check className="w-4 h-4 mr-2" /> Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

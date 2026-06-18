import pb from '@/lib/pocketbase/client'

export function DemoBanner() {
  const isDemo = sessionStorage.getItem('demo_mode') === 'true'
  if (!isDemo) return null

  const exitDemo = () => {
    const adminAuth = sessionStorage.getItem('admin_auth')
    if (adminAuth) {
      const { token, record } = JSON.parse(adminAuth)
      pb.authStore.save(token, record)
    } else {
      pb.authStore.clear()
    }
    sessionStorage.removeItem('demo_mode')
    sessionStorage.removeItem('admin_auth')
    window.location.href = '/admin/demonstracao'
  }

  return (
    <div className="w-full bg-orange-500 text-white px-4 py-2 text-center text-sm font-semibold flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6 z-[999] shrink-0">
      <span>
        Modo de Demonstração — dados fictícios. Sandbox isolado. Sem acesso a dados reais.
      </span>
      <button
        onClick={exitDemo}
        className="bg-white text-orange-600 px-3 py-1 rounded text-xs font-bold hover:bg-orange-50 shadow-sm transition-colors"
      >
        Sair do Modo de Demonstração
      </button>
    </div>
  )
}

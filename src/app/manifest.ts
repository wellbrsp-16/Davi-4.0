import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Davi 4.0 - Sonic e Amigos',
    short_name: 'Davi 4.0',
    description: 'Painel de gerenciamento do aniversário de 4 anos do Davi - Tema Sonic',
    start_url: '/',
    display: 'standalone',
    background_color: '#1E40AF',
    theme_color: '#1E40AF',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  }
}

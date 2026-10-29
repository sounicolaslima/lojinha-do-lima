
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lojinha do Lima',
    short_name: 'Lojinha do Lima',
    description: 'Aplicativo oficial do meu site',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/icons/icon-192',
        sizes: '192x192',
        type: 'image/jpg',
      },
      {
        src: '/icons/icon-512',
        sizes: '512x512',
        type: 'image/jpg',
      },
    ],
  }
}

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tronics Store – Instant Gaming Top-Ups',
    short_name: 'Tronics',
    description: 'Fast and secure Mobile Legends diamonds & gaming top-ups. Instant 24/7 delivery.',
    start_url: '/?source=pwa',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#00F2FE',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

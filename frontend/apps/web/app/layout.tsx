import type { Metadata } from 'next'
import { Providers } from '#app/providers'

export const metadata: Metadata = {
  title: 'TypeSafe Stack Web',
  description: 'Type-safe web application',
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

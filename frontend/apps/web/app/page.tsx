import Link from 'next/link'

export default function HomePage(): JSX.Element {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">TypeSafe Stack Web</h1>
      <p className="text-gray-600 mb-8">
        Type-safe web application with compile-time guarantees - optimized build
      </p>

      <div className="space-y-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/transaction" className="text-blue-600 hover:text-blue-800 underline">
                View Transaction Example
              </Link>
            </li>
            <li>
              <Link href="/features" className="text-green-600 hover:text-green-800 underline">
                🚩 Feature Flags Demo
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}

import { getPartsByCategory } from '@/lib/queries/parts'

export default async function HomePage() {
  const cassettes = await getPartsByCategory('cassette')
  const chains = await getPartsByCategory('chain')

  return (
    <main style={{ padding: 40, fontFamily: 'Arial, sans-serif' }}>
      <h1>PartCheck database connection works</h1>
      <p>
        If you can see real parts below, your Next app is reading from Supabase.
      </p>

      <section style={{ marginTop: 32 }}>
        <h2>Cassettes</h2>
        {cassettes.length === 0 ? (
          <p>No cassette rows found.</p>
        ) : (
          <ul>
            {cassettes.map((part) => (
              <li key={part.id}>
                <strong>{part.name}</strong>
                {part.brand ? ` — ${part.brand.name}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Chains</h2>
        {chains.length === 0 ? (
          <p>No chain rows found.</p>
        ) : (
          <ul>
            {chains.map((part) => (
              <li key={part.id}>
                <strong>{part.name}</strong>
                {part.brand ? ` — ${part.brand.name}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
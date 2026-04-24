import { getDrivetrainParts } from '@/lib/queries/drivetrain'
import { CompatibilityForm } from '@/components/CompatibilityForm'
import { Navbar } from '@/components/Navbar'

export default async function CheckPage() {
  const parts = await getDrivetrainParts()

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />

      <main
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        <section
          style={{
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 800,
              color: '#111827',
            }}
          >
            Drivetrain Compatibility Checker
          </h1>

          <p
            style={{
              marginTop: 12,
              maxWidth: 760,
              color: '#4b5563',
              fontSize: 16,
              lineHeight: 1.6,
            }}
          >
            Check compatibility across cassette, chain, rear derailleur,
            shifter, crankset, chainring, and bottom bracket.
          </p>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 24,
          }}
        >
          <CompatibilityForm
            cassettes={parts.cassettes}
            chains={parts.chains}
            derailleurs={parts.derailleurs}
            shifters={parts.shifters}
            cranksets={parts.cranksets}
            chainrings={parts.chainrings}
            bottomBrackets={parts.bottomBrackets}
          />
        </section>
      </main>
    </div>
  )
}
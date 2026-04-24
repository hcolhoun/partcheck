'use client'

import { useState } from 'react'
import { SearchableSelect } from '@/components/SearchableSelect'

type Part = {
  id: string
  name: string
}

type CompatibilityIssue = {
  message: string
  severity: 'warning' | 'incompatible'
  confidence: 'low' | 'medium' | 'high'
  sourceName: string | null
  sourceType: string | null
  sourceUrl: string | null
}

type CompatibilityResult = {
  status: 'compatible' | 'warning' | 'incompatible'
  issues: CompatibilityIssue[]
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 20,
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20, color: '#111827' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        marginTop: 8,
        background: active ? '#111827' : '#f3f4f6',
        color: active ? '#ffffff' : '#374151',
        border: '1px solid #d1d5db',
        borderRadius: 6,
        padding: '6px 10px',
        cursor: 'pointer',
        fontSize: 13,
      }}
    >
      {label}
    </button>
  )
}

function SmallLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: 'block',
        marginTop: 10,
        marginBottom: 4,
        color: '#111827',
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      {children}
    </label>
  )
}

function SmallInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: 8,
        border: '1px solid #d1d5db',
        borderRadius: 6,
        background: '#ffffff',
        color: '#111827',
      }}
    />
  )
}

function SmallSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        width: '100%',
        padding: 8,
        border: '1px solid #d1d5db',
        borderRadius: 6,
        background: '#ffffff',
        color: '#111827',
      }}
    />
  )
}

function ResultPanel({ result }: { result: CompatibilityResult }) {
  const incompatibleIssues = result.issues.filter(
    (issue) => issue.severity === 'incompatible'
  )

  const warningIssues = result.issues.filter(
    (issue) => issue.severity === 'warning'
  )

  const verdict =
    result.status === 'compatible'
      ? 'This build looks compatible based on the current rules.'
      : result.status === 'warning'
      ? 'This build may work, but there are important warnings to review.'
      : 'This build has compatibility conflicts that should be fixed before buying parts.'

  const panelStyle =
    result.status === 'compatible'
      ? {
          background: '#ecfdf5',
          border: '1px solid #10b981',
          color: '#065f46',
        }
      : result.status === 'warning'
      ? {
          background: '#fffbeb',
          border: '1px solid #f59e0b',
          color: '#92400e',
        }
      : {
          background: '#fef2f2',
          border: '1px solid #ef4444',
          color: '#991b1b',
        }

  return (
    <section
      style={{
        padding: 20,
        borderRadius: 12,
        ...panelStyle,
      }}
    >
      <h2 style={{ marginTop: 0 }}>Result</h2>

      <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        {result.status === 'compatible'
          ? 'Compatible'
          : result.status === 'warning'
          ? 'Warnings found'
          : 'Incompatible'}
      </p>

      <p style={{ marginTop: 0 }}>{verdict}</p>

      {incompatibleIssues.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <h3 style={{ marginBottom: 8 }}>Critical incompatibilities</h3>
          <ul style={{ paddingLeft: 20 }}>
            {incompatibleIssues.map((issue, i) => (
              <li key={i} style={{ marginBottom: 12 }}>
                <div>
                  <strong>Fix required:</strong> {issue.message}
                </div>
                <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>
                  Confidence: <strong>{issue.confidence}</strong>
                  {issue.sourceName ? (
                    <>
                      {' '}
                      • Source: <strong>{issue.sourceName}</strong>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {warningIssues.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <h3 style={{ marginBottom: 8 }}>Warnings</h3>
          <ul style={{ paddingLeft: 20 }}>
            {warningIssues.map((issue, i) => (
              <li key={i} style={{ marginBottom: 12 }}>
                <div>
                  <strong>Check carefully:</strong> {issue.message}
                </div>
                <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>
                  Confidence: <strong>{issue.confidence}</strong>
                  {issue.sourceName ? (
                    <>
                      {' '}
                      • Source: <strong>{issue.sourceName}</strong>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.issues.length === 0 && (
        <p style={{ marginBottom: 0 }}>No issues detected.</p>
      )}
    </section>
  )
}

export function CompatibilityForm({
  cassettes,
  chains,
  derailleurs,
  shifters,
  cranksets,
  chainrings,
  bottomBrackets,
}: {
  cassettes: Part[]
  chains: Part[]
  derailleurs: Part[]
  shifters: Part[]
  cranksets: Part[]
  chainrings: Part[]
  bottomBrackets: Part[]
}) {
  const [selected, setSelected] = useState({
    cassette: '',
    chain: '',
    derailleur: '',
    shifter: '',
    crankset: '',
    chainring: '',
    bottomBracket: '',
  })

  const [customMode, setCustomMode] = useState({
    cassette: false,
    derailleur: false,
    chainring: false,
  })

  const [custom, setCustom] = useState({
    cassette: {
      name: '',
      speed: '',
      min_tooth: '',
      max_tooth: '',
      freehub: '',
      chain_family: '',
    },
    derailleur: {
      name: '',
      speed: '',
      max_tooth: '',
      actuation: '',
    },
    chainring: {
      name: '',
      tooth_count: '',
      chainring_mount: '',
      drivetrain_family: '',
      offset_mm: '',
    },
  })

  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    if (
      (!customMode.cassette && !selected.cassette) ||
      !selected.chain ||
      (!customMode.derailleur && !selected.derailleur) ||
      !selected.shifter ||
      !selected.crankset ||
      (!customMode.chainring && !selected.chainring) ||
      !selected.bottomBracket
    ) {
      alert('Please select all required components')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cassetteId: customMode.cassette ? null : selected.cassette,
          chainId: selected.chain,
          derailleurId: customMode.derailleur ? null : selected.derailleur,
          shifterId: selected.shifter,
          cranksetId: selected.crankset,
          chainringId: customMode.chainring ? null : selected.chainring,
          bottomBracketId: selected.bottomBracket,
          customCassette: customMode.cassette ? custom.cassette : null,
          customDerailleur: customMode.derailleur ? custom.derailleur : null,
          customChainring: customMode.chainring ? custom.chainring : null,
        }),
      })

      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error(err)
      alert('Error checking compatibility')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <SectionCard title="Rear Drivetrain">
        <SearchableSelect
          label="Cassette"
          value={selected.cassette}
          options={cassettes}
          placeholder="Select cassette"
          onChange={(value) => setSelected({ ...selected, cassette: value })}
        />

        <ToggleButton
          active={customMode.cassette}
          onClick={() =>
            setCustomMode({ ...customMode, cassette: !customMode.cassette })
          }
          label={
            customMode.cassette
              ? 'Using custom cassette specs'
              : '+ Enter custom cassette specs'
          }
        />

        {customMode.cassette && (
          <div style={{ marginTop: 10, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
            <SmallLabel>Name</SmallLabel>
            <SmallInput
              value={custom.cassette.name}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  cassette: { ...custom.cassette, name: e.target.value },
                })
              }
              placeholder="e.g. ZTTO 12-speed cassette"
            />

            <SmallLabel>Speed</SmallLabel>
            <SmallInput
              type="number"
              value={custom.cassette.speed}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  cassette: { ...custom.cassette, speed: e.target.value },
                })
              }
              placeholder="12"
            />

            <SmallLabel>Min tooth</SmallLabel>
            <SmallInput
              type="number"
              value={custom.cassette.min_tooth}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  cassette: { ...custom.cassette, min_tooth: e.target.value },
                })
              }
              placeholder="10"
            />

            <SmallLabel>Max tooth</SmallLabel>
            <SmallInput
              type="number"
              value={custom.cassette.max_tooth}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  cassette: { ...custom.cassette, max_tooth: e.target.value },
                })
              }
              placeholder="52"
            />

            <SmallLabel>Freehub</SmallLabel>
            <SmallSelect
              value={custom.cassette.freehub}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  cassette: { ...custom.cassette, freehub: e.target.value },
                })
              }
            >
              <option value="">Select freehub</option>
              <option value="hg">HG</option>
              <option value="xd">XD</option>
              <option value="microspline">Microspline</option>
            </SmallSelect>

            <SmallLabel>Chain family</SmallLabel>
            <SmallSelect
              value={custom.cassette.chain_family}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  cassette: { ...custom.cassette, chain_family: e.target.value },
                })
              }
            >
              <option value="">Select chain family</option>
              <option value="shimano-11-mtb-chain-family">Shimano 11 MTB</option>
              <option value="shimano-12-mtb-chain-family">Shimano 12 MTB</option>
              <option value="sram-eagle-chain-family">SRAM Eagle</option>
            </SmallSelect>
          </div>
        )}

        <SearchableSelect
          label="Chain"
          value={selected.chain}
          options={chains}
          placeholder="Select chain"
          onChange={(value) => setSelected({ ...selected, chain: value })}
        />

        <SearchableSelect
          label="Rear Derailleur"
          value={selected.derailleur}
          options={derailleurs}
          placeholder="Select derailleur"
          onChange={(value) => setSelected({ ...selected, derailleur: value })}
        />

        <ToggleButton
          active={customMode.derailleur}
          onClick={() =>
            setCustomMode({ ...customMode, derailleur: !customMode.derailleur })
          }
          label={
            customMode.derailleur
              ? 'Using custom derailleur specs'
              : '+ Enter custom derailleur specs'
          }
        />

        {customMode.derailleur && (
          <div style={{ marginTop: 10, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
            <SmallLabel>Name</SmallLabel>
            <SmallInput
              value={custom.derailleur.name}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  derailleur: { ...custom.derailleur, name: e.target.value },
                })
              }
              placeholder="e.g. Custom 12-speed derailleur"
            />

            <SmallLabel>Speed</SmallLabel>
            <SmallInput
              type="number"
              value={custom.derailleur.speed}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  derailleur: { ...custom.derailleur, speed: e.target.value },
                })
              }
              placeholder="12"
            />

            <SmallLabel>Max tooth</SmallLabel>
            <SmallInput
              type="number"
              value={custom.derailleur.max_tooth}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  derailleur: { ...custom.derailleur, max_tooth: e.target.value },
                })
              }
              placeholder="52"
            />

            <SmallLabel>Actuation</SmallLabel>
            <SmallSelect
              value={custom.derailleur.actuation}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  derailleur: { ...custom.derailleur, actuation: e.target.value },
                })
              }
            >
              <option value="">Select actuation</option>
              <option value="shimano-11-mtb-actuation">Shimano 11 MTB</option>
              <option value="shimano-12-mtb-actuation">Shimano 12 MTB</option>
              <option value="sram-eagle-mech-actuation">SRAM Eagle mechanical</option>
            </SmallSelect>
          </div>
        )}

        <SearchableSelect
          label="Shifter"
          value={selected.shifter}
          options={shifters}
          placeholder="Select shifter"
          onChange={(value) => setSelected({ ...selected, shifter: value })}
        />
      </SectionCard>

      <SectionCard title="Front Drivetrain">
        <SearchableSelect
          label="Crankset"
          value={selected.crankset}
          options={cranksets}
          placeholder="Select crankset"
          onChange={(value) => setSelected({ ...selected, crankset: value })}
        />

        <SearchableSelect
          label="Chainring"
          value={selected.chainring}
          options={chainrings}
          placeholder="Select chainring"
          onChange={(value) => setSelected({ ...selected, chainring: value })}
        />

        <ToggleButton
          active={customMode.chainring}
          onClick={() =>
            setCustomMode({ ...customMode, chainring: !customMode.chainring })
          }
          label={
            customMode.chainring
              ? 'Using custom chainring specs'
              : '+ Enter custom chainring specs'
          }
        />

        {customMode.chainring && (
          <div style={{ marginTop: 10, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa' }}>
            <SmallLabel>Name</SmallLabel>
            <SmallInput
              value={custom.chainring.name}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  chainring: { ...custom.chainring, name: e.target.value },
                })
              }
              placeholder="e.g. 34T direct mount ring"
            />

            <SmallLabel>Tooth count</SmallLabel>
            <SmallInput
              type="number"
              value={custom.chainring.tooth_count}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  chainring: { ...custom.chainring, tooth_count: e.target.value },
                })
              }
              placeholder="34"
            />

            <SmallLabel>Chainring mount</SmallLabel>
            <SmallSelect
              value={custom.chainring.chainring_mount}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  chainring: { ...custom.chainring, chainring_mount: e.target.value },
                })
              }
            >
              <option value="">Select mount</option>
              <option value="sram-3-bolt-direct-mount">SRAM 3-bolt direct mount</option>
              <option value="shimano-96-bcd-4-bolt">Shimano 96 BCD 4-bolt</option>
              <option value="104-bcd-4-bolt">104 BCD 4-bolt</option>
            </SmallSelect>

            <SmallLabel>Drivetrain family</SmallLabel>
            <SmallSelect
              value={custom.chainring.drivetrain_family}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  chainring: { ...custom.chainring, drivetrain_family: e.target.value },
                })
              }
            >
              <option value="">Select drivetrain family</option>
              <option value="shimano-11-mtb-drivetrain">Shimano 11 MTB</option>
              <option value="shimano-12-mtb-drivetrain">Shimano 12 MTB</option>
              <option value="sram-eagle-12-drivetrain">SRAM Eagle 12</option>
            </SmallSelect>

            <SmallLabel>Offset (mm)</SmallLabel>
            <SmallInput
              type="number"
              value={custom.chainring.offset_mm}
              onChange={(e) =>
                setCustom({
                  ...custom,
                  chainring: { ...custom.chainring, offset_mm: e.target.value },
                })
              }
              placeholder="3"
            />
          </div>
        )}

        <SearchableSelect
          label="Bottom Bracket"
          value={selected.bottomBracket}
          options={bottomBrackets}
          placeholder="Select bottom bracket"
          onChange={(value) =>
            setSelected({ ...selected, bottomBracket: value })
          }
        />
      </SectionCard>

      <div>
        <button
          onClick={handleCheck}
          style={{
            padding: '12px 18px',
            background: '#111827',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          {loading ? 'Checking...' : 'Check Compatibility'}
        </button>
      </div>

      {result && <ResultPanel result={result} />}
    </div>
  )
}
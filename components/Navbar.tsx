import Link from 'next/link'

const navItems = [
  { label: 'Drivetrain', href: '/check', active: true },
  { label: 'Wheels / Hubs', href: '#', active: false },
  { label: 'Headset', href: '#', active: false },
  { label: 'Brakes', href: '#', active: false },
  { label: 'Frame', href: '#', active: false },
]

export function Navbar() {
  return (
    <header
      style={{
        borderBottom: '1px solid #e5e7eb',
        background: '#ffffff',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#111827',
              }}
            >
              PartCheck
            </div>
            <div
              style={{
                fontSize: 14,
                color: '#6b7280',
              }}
            >
              Compatibility-first bike build planning
            </div>
          </div>

          <nav
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            {navItems.map((item) =>
              item.active ? (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: '#111827',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.label}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: '#f3f4f6',
                    color: '#9ca3af',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'not-allowed',
                  }}
                >
                  {item.label}
                </span>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
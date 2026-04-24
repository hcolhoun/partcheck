'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type Option = {
  id: string
  name: string
}

export function SearchableSelect({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  options: Option[]
  placeholder: string
  onChange: (value: string) => void
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const selectedOption = options.find((option) => option.id === value) ?? null

  const [query, setQuery] = useState(selectedOption?.name ?? '')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setQuery(selectedOption?.name ?? '')
  }, [selectedOption?.name])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setQuery(selectedOption?.name ?? '')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedOption?.name])

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) return options

    return options.filter((option) =>
      option.name.toLowerCase().includes(q)
    )
  }, [options, query])

  const handleSelect = (option: Option) => {
    onChange(option.id)
    setQuery(option.name)
    setIsOpen(false)
  }

  const clearSelection = () => {
    onChange('')
    setQuery('')
    setIsOpen(true)
    inputRef.current?.focus()
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        marginTop: 12,
        position: 'relative',
      }}
    >
      <label
        style={{
          display: 'block',
          color: '#111827',
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {label}
      </label>

      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            if (value) {
              onChange('')
            }
          }}
          style={{
            padding: 10,
            width: '100%',
            color: '#111827',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: 6,
          }}
        />

        {value ? (
          <button
            type="button"
            onClick={clearSelection}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#111827',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        ) : null}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 6,
            background: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
            maxHeight: 260,
            overflowY: 'auto',
            zIndex: 50,
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = option.id === value

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    border: 'none',
                    borderBottom: '1px solid #f3f4f6',
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    color: '#111827',
                    cursor: 'pointer',
                  }}
                >
                  {option.name}
                </button>
              )
            })
          ) : (
            <div
              style={{
                padding: '12px',
                color: '#6b7280',
                fontSize: 14,
              }}
            >
              No matching results
            </div>
          )}
        </div>
      )}

      {selectedOption ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            color: '#6b7280',
          }}
        >
          Selected: {selectedOption.name}
        </div>
      ) : null}
    </div>
  )
}
import React from 'react'

export default function Avatar({ src, name, size = 44, groupAvatars = null, className = '' }) {
  if (groupAvatars && groupAvatars.length >= 2) {
    const displayList = groupAvatars.slice(0, 4)
    return (
      <div
        className={`avatar group-avatar-grid ${className}`}
        style={{
          width: size,
          height: size,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: 1.5,
          padding: 1.5,
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#1b2637',
          flexShrink: 0,
        }}
      >
        {displayList.map((avSrc, idx) => (
          <div
            key={idx}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#2b394e',
            }}
          >
            {avSrc ? (
              <img
                src={avSrc}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: size * 0.22, color: '#cfd6e4' }}>•</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  const initials = (name || '?').trim().charAt(0).toUpperCase()

  return (
    <div
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: 'linear-gradient(135deg, #2b394e, #182230)',
        color: '#e2e8f0',
        fontWeight: 600,
        fontSize: size * 0.4,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name || ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initials
      )}
    </div>
  )
}

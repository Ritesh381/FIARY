import React from 'react'

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-gray-800/50 border border-gray-700/80 rounded-2xl shadow-lg ${className}`}>
        {children}
    </div>
  )
}

export default GlassCard

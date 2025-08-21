import { ReactNode } from 'react'

interface BleedProps {
  children: ReactNode
}

export default function Bleed({ children }: BleedProps) {
  return <div className="bleed">{children}</div>
}

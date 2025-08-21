'use client'

import { KBarSearchProvider } from './KBarProvider'
import siteMetadata from '@/data/siteMetadata.cjs'

export function SearchProvider({ children }: { children: React.ReactNode }) {
  if (siteMetadata.search?.provider === 'kbar') {
    return (
      <KBarSearchProvider kbarConfig={siteMetadata.search.kbarConfig}>
        {children}
      </KBarSearchProvider>
    )
  }
  
  return <>{children}</>
}

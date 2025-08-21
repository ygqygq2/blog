'use client'

import siteMetadata from '@/data/siteMetadata.cjs'

import { KBarSearchProvider } from './KBarProvider'

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

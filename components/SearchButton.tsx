'use client'

import { useKBar } from 'kbar'
import siteMetadata from '@/data/siteMetadata.cjs'

const SearchButton = () => {
  const { query } = useKBar()

  if (
    siteMetadata.search &&
    (siteMetadata.search.provider === 'algolia' || 
     siteMetadata.search.provider === 'kbar' ||
     siteMetadata.search.provider === 'local')
  ) {
    return (
      <button
        onClick={query.toggle}
        aria-label="Search"
        className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="hover:text-primary-500 dark:hover:text-primary-400 h-6 w-6 text-gray-900 dark:text-gray-100"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </button>
    )
  }

  return null
}

export default SearchButton

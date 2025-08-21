'use client'

import siteMetadata from '@/data/siteMetadata.cjs'

// 简单的搜索按钮组件，替代 pliny 的搜索按钮
const SimpleSearchButton = ({ children, onClick }: { 
  children: React.ReactNode
  onClick?: () => void 
}) => {
  return (
    <button
      onClick={onClick}
      aria-label="Search"
      className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {children}
    </button>
  )
}

const SearchButton = () => {
  if (
    siteMetadata.search &&
    (siteMetadata.search.provider === 'algolia' || siteMetadata.search.provider === 'kbar')
  ) {
    const handleSearch = () => {
      // 这里可以添加搜索逻辑
      console.log('搜索功能待实现')
    }

    return (
      <SimpleSearchButton onClick={handleSearch}>
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
      </SimpleSearchButton>
    )
  }
  
  return null
}

export default SearchButton

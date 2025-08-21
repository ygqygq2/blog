import { ReactElement } from 'react'

interface TOCInlineProps {
  toc: Array<{
    value: string
    url: string
    depth: number
  }>
  indentDepth?: number
  fromHeading?: number
  toHeading?: number
  asDisclosure?: boolean
  exclude?: string | string[]
}

export default function TOCInline({
  toc,
  indentDepth = 3,
  fromHeading = 1,
  toHeading = 6,
  asDisclosure = false,
  exclude = '',
}: TOCInlineProps): ReactElement {
  const re = Array.isArray(exclude)
    ? new RegExp('^(' + exclude.join('|') + ')$', 'i')
    : new RegExp('^(' + exclude + ')$', 'i')

  const filteredToc = toc.filter(
    (heading) =>
      heading.depth >= fromHeading && heading.depth <= toHeading && !re.test(heading.value)
  )

  const tocList = (
    <ul>
      {filteredToc.map((heading) => (
        <li key={heading.value} className={`${heading.depth >= indentDepth && 'ml-6'}`}>
          <a href={heading.url}>{heading.value}</a>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="toc">
      {asDisclosure ? (
        <details open>
          <summary className="cursor-pointer text-xl leading-7 font-semibold text-gray-800 dark:text-gray-200">
            Table of Contents
          </summary>
          <div className="mt-1 ml-6">{tocList}</div>
        </details>
      ) : (
        tocList
      )}
    </div>
  )
}

/**
 * 内容处理和分词工具
 */

import { ContentParser } from './search/content-parser'
import { ChineseTokenizer } from './search/tokenizer'
import type { SearchableContent } from './search-types'

// 重新导出，保持向后兼容
export { ChineseTokenizer, ContentParser }
export type { SearchableContent }

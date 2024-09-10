import { NewsletterAPI } from 'pliny/newsletter'

import siteMetadata from '@/data/siteMetadata'

const handler = NewsletterAPI({
  // @ts-expect-error ignore
  provider: siteMetadata.newsletter.provider,
})

export { handler as GET, handler as POST }

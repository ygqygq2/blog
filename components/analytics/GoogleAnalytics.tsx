import Script from 'next/script'

export interface GoogleAnalyticsProps {
  googleAnalyticsId: string
}

export const GA = ({ googleAnalyticsId }: GoogleAnalyticsProps) => {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
      />

      <Script strategy="afterInteractive" id="ga-script">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}');
        `}
      </Script>
    </>
  )
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const logEvent = (action: string, category: string, label?: string, value?: number) => {
  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

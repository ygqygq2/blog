import Script from 'next/script'

export interface ClarityProps {
  ClarityWebsiteId: string
}

// https://clarity.microsoft.com/
// https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup
export const Clarity = ({ ClarityWebsiteId }: ClarityProps) => {
  return (
    <>
      <Script id="microsoft-clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${ClarityWebsiteId}");
          `}
      </Script>
    </>
  )
}

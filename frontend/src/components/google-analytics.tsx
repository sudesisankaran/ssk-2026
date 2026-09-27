import Script from "next/script";

const GA_ID =
  process.env.NEXT_PUBLIC_GA_ID ?? "G-K7KJGTX5E6";

export function GoogleAnalytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}

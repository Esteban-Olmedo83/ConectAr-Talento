'use client'

import Script from 'next/script'

const CRISP_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID

export function CrispChat() {
  if (!CRISP_ID || process.env.NODE_ENV !== 'production') return null

  return (
    <Script id="crisp-chat" strategy="afterInteractive">
      {`
        window.$crisp = [];
        window.CRISP_WEBSITE_ID = "${CRISP_ID}";
        (function(){
          var d = document;
          var s = d.createElement("script");
          s.src = "https://client.crisp.chat/l.js";
          s.async = 1;
          d.getElementsByTagName("head")[0].appendChild(s);
        })();
      `}
    </Script>
  )
}

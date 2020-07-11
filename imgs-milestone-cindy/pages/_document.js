import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";
import config from "../config";

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />)
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        )
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head prefix="og:http://ogp.me/ns# article:http://ogp.me/ns/article#">
          <meta charSet="utf-8" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="twitter:creator" content="@vavel" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@vavel" />
          <meta content="summary_large_image" name="twitter:card" />
          <meta property="og:type" content="article" />
          <meta
            property="og:updated_time"
            content="2019-12-25T19:39:02+01:00"
          />
          <meta property="og:locale" content="en" />
          <meta property="og:site_name" content="VAVEL Images" />
          <meta name="twitter:site" content="@vavel" />
          <meta httpEquiv="Content-Language" content="en" />

          <link
            href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700&display=swap"
            rel="stylesheet"
          />
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${config.googleMapKey}&libraries=places&language=en`}
          ></script>
          {/* Global site tag (gtag.js) - Google Analytics */}
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=UA-78170725-1"
          ></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'UA-78170725-1');
            `
            }}
          />
          <script 
            dangerouslySetInnerHTML={{
              __html: `
              _atrk_opts = { atrk_acct:"Mo9il1awEti2fn", domain:"vavel.com",dynamic: true};
              (function() { var as = document.createElement('script'); 
              as.type = 'text/javascript'; 
              as.async = true; 
              as.src = "https://certify-js.alexametrics.com/atrk.js"; 
              var s = document.getElementsByTagName('script')[0];
              s.parentNode.insertBefore(as, s); 
              })();
            `
            }}
          />
          <noscript>
            <img src="https://certify.alexametrics.com/atrk.gif?account=Mo9il1awEti2fn" style={{display: 'none'}} height="1" width="1" alt="" />
          </noscript>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

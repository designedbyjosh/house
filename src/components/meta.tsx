import Head from 'next/head'

export default function Meta() {
  return (
    <head>
      <script src='https://api.mapbox.com/mapbox-gl-js/v3.0.0-beta.1/mapbox-gl.js'></script>
      <link href='https://api.mapbox.com/mapbox-gl-js/v3.0.0-beta.1/mapbox-gl.css' rel='stylesheet' />
      <link
        rel="apple-touch-icon"
        sizes="152x152"
        href="/favicon/favicon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="152x152"
        href="/favicon/favicon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="152x152"
        href="/favicon/favicon.png"
      />
      <link rel="manifest" href="/favicon/site.webmanifest" />
      <link
        rel="mask-icon"
        href="/favicon/favicon.svg"
        color="#000000"
      />
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin='anonymous' />
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Markazi+Text&display=swap" 
        rel="stylesheet" />
      <link
        rel="shortcut icon"
        href="/favicon/favicon.ico" />
      <meta
        name="msapplication-TileColor"
        content="#E7E5E4" />
      <meta
        name="msapplication-config"
        content="/favicon/browserconfig.xml" />
      <link
        rel="alternate"
        type="application/rss+xml"
        href="/feed.xml" />
      {process.env.NODE_ENV !== "development" && <script
        async
        defer
        data-website-id="0c2d1d76-f787-455b-8a1f-655057a2d1f3"
        src="https://umami.josh.house/umami.js" />}
      <meta
        name="description"
        content={`I'm a software engineer living in Australia. Here I document my projects, adventures overseas, and photographs of our beautiful world.`}
      />
    </head>
  )
}
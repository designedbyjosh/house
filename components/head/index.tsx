import Head from 'next/head'

/**
 * Renders the head metadata for a page
 * 
 * @author Josh <code@josh.house> 
 */
const HeadComponent = ({ metadata }) => {

    return (
        <Head>
            <title>{metadata.title}</title>
            <meta name="description" content={metadata.description} />
            <meta property="og:type" content="website" />
            <meta name="og:title" property="og:title" content={metadata.title} />
            <meta name="og:description" property="og:description" content={metadata.description} />
            <meta property="og:site_name" content={`${metadata.canonical}`} />
            <meta property="og:url" content="" />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={metadata.title} />
            <meta name="twitter:description" content={metadata.description} />
            <link rel="icon" type="image/png" href="/static/images/favicon.png" />
            <link rel="apple-touch-icon" href="/static/images/favicon.png" />
            <meta property="og:image" content={metadata.coverImage} />
            <meta name="twitter:image" content={metadata.coverImage} />
            <link rel="stylesheet" href="" />
        </Head>
    )
}

export default HeadComponent;
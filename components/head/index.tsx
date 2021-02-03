import Head from 'next/head'

/**
 * Renders the head metadata for a page
 * 
 * @author Josh <code@josh.house> 
 */
const HeadComponent = ({title, description, canonical, coverImage}) => {

    return (
    <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="og:title" property="og:title" content={title} />
        <meta name="og:description" property="og:description" content={description} />
        <meta property="og:site_name" content={`${canonical}`} />
        <meta property="og:url" content="" />  
        <meta name="twitter:card" content="summary" /> 
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <link rel="icon" type="image/png" href="/static/images/favicon.png" />
        <link rel="apple-touch-icon" href="/static/images/favicon.png" />
        <meta property="og:image" content={coverImage} />  
        <meta name="twitter:image" content={coverImage} />   
        <link rel="stylesheet" href="" /> 
        </Head>
    )
}

export default HeadComponent;
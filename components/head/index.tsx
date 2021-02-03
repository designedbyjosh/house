import Head from 'next/head'

/**
 * Renders the head metadata for a page
 * 
 * @author Josh <code@josh.house> 
 */
const HeadComponent = (props) => {

    return (
    <Head>
        <title>{props.title}</title>
        <meta name="description" content={props.description} />
        <meta property="og:type" content="website" />
        <meta name="og:title" property="og:title" content={props.title} />
        <meta name="og:description" property="og:description" content={props.description} />
        <meta property="og:site_name" content={`${props.canonical}`} />
        <meta property="og:url" content="" />  
        <meta name="twitter:card" content="summary" /> 
        <meta name="twitter:title" content={props.title} />
        <meta name="twitter:description" content={props.description} />
        <link rel="icon" type="image/png" href="/static/images/favicon.png" />
        <link rel="apple-touch-icon" href="/static/images/favicon.png" />
        <meta property="og:image" content={props.coverImage} />  
        <meta name="twitter:image" content={props.coverImage} />   
        <link rel="stylesheet" href="" /> 
        </Head>
    )
}

export default HeadComponent;
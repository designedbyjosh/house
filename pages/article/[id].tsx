import react from "react";
import matter from 'gray-matter';
import Reader from "../../components/article/reader";
import Head from 'next/head'
import Link from "next/link";
import Router from 'next/router'

const Article = ({ props }) => {

    if (props.error === true) {
        return <div />
    }
    else {

    let parsed = matter(props.article)
    return (<>
    <Head>
        <title>{parsed.data.title}</title>
        <meta name="description" content={parsed.data.description} />
        <meta property="og:type" content="website" />
        <meta name="og:title" property="og:title" content={parsed.data.title} />
        <meta name="og:description" property="og:description" content={parsed.data.description} />
        <meta property="og:site_name" content={`${props.canonical}`} />
        <meta property="og:url" content="" />  
        <meta name="twitter:card" content="summary" /> 
        <meta name="twitter:title" content={parsed.data.title} />
        <meta name="twitter:description" content={parsed.data.description} />
        <link rel="icon" type="image/png" href="/static/images/favicon.png" />
        <link rel="apple-touch-icon" href="/static/images/favicon.png" />
        <link rel="stylesheet" href="" />
        <meta property="og:image" content={parsed.data.coverImage} />  
        <meta name="twitter:image" content={parsed.data.coverImage} />   
        <link rel="canonical" href="" />
        <script type="text/javascript" src="" ></script>
    </Head>
    <Reader article={{metadata: parsed.data, content: parsed.content} as Article} />
    </>)
    }
};

Article.getInitialProps = async (context) => {

    const { id } = context.query;

    var article;
    var error;
    try {
        article = await import(`../../content/articles/${id}.md`);
        article = article.default;
    }
    catch {
        error = true;
    }

    return {
        props: {
            article,
            error
        },
    };
}

export default Article;

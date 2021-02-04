import react from "react";
import matter from 'gray-matter';
import Reader from "../../components/article/reader";
import Head from '../../components/head';

/**
 * Renders an article for a given slug (id)
 * 
 * @author Josh <code@josh.house> 
 */
const Article = ({ props }) => {

    if (props.error === true) {
        return <div />
    }
    else {

        let parsed = matter(props.article)
        return (<>
            <Head {...parsed.data as any} />
            <Reader article={{ metadata: parsed.data, content: parsed.content } as Article} />
        </>)
    }
};

Article.getInitialProps = async (context) => {

    const { id } = context.query;

    var article;
    var error;
    try {
        article = await import(`../../content/article/${id}.md`);
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

export const getStaticPaths = async () => {
    return {
        paths: [
          { params: { id: 'category-slug-1'} },
          { params: { id: 'category-slug-2'} },
          { params: { id: 'category-slug-3'} }
         ],
       fallback: false // fallback is set to false because we already know the slugs ahead of time
     }  
  }
export default Article;

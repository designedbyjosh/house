import react from "react";
import matter from 'gray-matter';
import Reader from "../../components/article/reader";
import Link from "next/link";
import Router from 'next/router'
import Head from "next/head";

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

    let parsed = matter(props.problem)
    return (<>
    <Head {...parsed.data} />
    <Reader style={{height: 120}} article={{metadata: parsed.data, content: parsed.content} as Article} />
    </>)
    }
};

Article.getInitialProps = async (context) => {

    const { id } = context.query;

    var problem;
    var error;
    try {
        problem = await import(`../../content/problem/notes/${id}.md`);
        problem = problem.default;
    }
    catch {
        error = true;
    }

    return {
        props: {
            problem,
            error
        },
    };
}

export default Article;

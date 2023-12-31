import {Helmet} from 'react-helmet-async';

interface Props {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
    keywords?: string;
    author?: string;
    url?: string;
}

const metaDefaults = {
    title: 'Apollo',
    description: 'Decentralized Q&A: Ask, share, and learn with Apollo on NOSTR',
    keywords: 'nostr, bitcoin, NIPS, decentralized Q&A, NOSTR platform, collaborative learning, community knowledge sharing, user-driven Q&A, decentralized ecosystem, Apollo questions and answers, NOSTR community discussions, insightful exchanges, decentralized learning platform',
    author: 'Apollo Engineering',
    type: 'website',
    url: 'https://apolloqa.vercel.app' // TODO: Change this when we have a custom domain
}

const SEOContainer = ({title, description, name, type, keywords, author, url}: Props) => {
    return (
        <Helmet>
            { /* Standard metadata tags */}
            <title>{title ?? metaDefaults.title}</title>
            <meta name='description' content={description ?? metaDefaults.description}/>
            <meta name='keywords' content={`${keywords ?? ''} ${metaDefaults.keywords}`}/>
            <meta name='author' content={author ?? metaDefaults.author}/>
            { /* End standard metadata tags */}

            { /* Facebook tags */}
            <meta property="og:url" content={`${metaDefaults.url}${url ?? ''}`}/>
            <meta property="og:type" content={type ?? metaDefaults.type}/>
            <meta property="og:title" content={title ?? metaDefaults.title}/>
            <meta property="og:description" content={description ?? metaDefaults.description}/>
            { /* End Facebook tags */}

            { /* Twitter tags */}
            <meta name="twitter:creator" content={name ?? metaDefaults.author}/>
            <meta name="twitter:card" content={type ?? metaDefaults.type}/>
            <meta name="twitter:title" content={title ?? metaDefaults.title}/>
            <meta name="twitter:description" content={description ?? metaDefaults.description}/>
            { /* End Twitter tags */}
        </Helmet>
    )
}

export default SEOContainer

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Container from './container';
import Link from 'next/link';
import NowPlaying from './now-playing';

export default function Header({currentPage} : {currentPage: string}) {

  return (
    <Container>
        <div className="flex pt-8 pb-4">
            <div className="flex-1 left-0">
                <h1 className="text-4xl md:text-6xl  md:pt-16">
                    <Link href="/">
                    Joshua Whitcombe
                    </Link>
                </h1>
            </div>
            <div className="flex justify-end flex-col">
                <div className="h-9 md:h-10">
                <a className="hover:opacity-50" href="mailto:hello@josh.house">
                    <FontAwesomeIcon className='pr-2' size='lg' icon={faEnvelope} />
                </a>
                <a className="hover:opacity-50" href="https://umami.josh.house/share/Vru7iEaq/Josh's%20Blog">
                    <FontAwesomeIcon className='pr-2 pl-2' size='lg' icon={faChartLine} />
                </a>
                </div>
            </div>
        </div>
        
        <div className="flex pb-4">
            <div className="flex-1 inline left-0">
                <Link href="/">
            <button className={`${currentPage == "/" || currentPage == "" && "bg-stone-500 !text-white"} hover:bg-stone-800 hover:text-white text-black dark:text-white py-1 px-4 rounded`}>
                Photography
            </button>
            </Link>
            <Link href="/blog">
            <button className={`${currentPage == "/blog" && "bg-stone-500 !text-white"} ml-2  hover:bg-stone-800 hover:text-white text-black dark:text-white py-1 px-4 rounded`}>
                Blog
            </button>
            </Link>
            </div>
            <div className="flex justify-end flex-col">
            <NowPlaying />
            </div>
        </div>
    </Container>
  )
}
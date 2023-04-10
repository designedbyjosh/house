'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Container from './container';
import Link from 'next/link';
import NowPlaying from './now-playing';
import { Tooltip } from '@nextui-org/react';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Header() {

    const router = useRouter()

    const pageButton = (pageRef: string, pageText?: string, tooltipText?: string, main?: boolean) => {
        let page = "/" + pageRef.toLowerCase();
        return <Link href={page}>
                <Tooltip content={tooltipText} rounded placement='bottom'>
                <button className={`${(page == router.pathname) && "bg-stone-500 !text-white"} mr-2 hover:bg-stone-800 hover:text-white text-black dark:text-white py-1 px-4 rounded`}>
                    {pageText || pageRef}
                </button>
        </Tooltip>
            </Link>
    }

    return (
        <Container>
            <div className="flex pt-8 pb-4">
                <div className="flex-1 left-0">
                    <h1 className="text-3xl md:text-6xl  md:pt-16">
                        <Link href="/">
                            Joshua Whitcombe
                        </Link>
                    </h1>
                </div>
                <div className="flex justify-end flex-col">
                    <div className="h-8 md:h-10">
                        <a className="hover:opacity-50" href="mailto:hello@josh.house">
                            <FontAwesomeIcon className='pr-2' size='lg' icon={faEnvelope} />
                        </a>
                        <a className="hover:opacity-50" href="https://www.linkedin.com/in/anengineercalledjosh/">
                            <FontAwesomeIcon className='pr-2 pl-2' size='lg' icon={faLinkedin} />
                        </a>
                        <a className="hover:opacity-50" href="https://github.com/designedbyjosh/house">
                            <Tooltip enterDelay={300} content={"Source code lives here"} rounded placement='left'>
                                <FontAwesomeIcon className='pr-2 pl-2' size='lg' icon={faGithub} />
                            </Tooltip>
                        </a>
                        <a className="hover:opacity-50" href="https://umami.josh.house/share/Vru7iEaq/Josh's%20Blog">
                            <FontAwesomeIcon className='pr-2 pl-2' size='lg' icon={faChartLine} />
                        </a>
                    </div>
                </div>
            </div>

            <div className="flex pb-5 md:pb-7 flex-col md:flex-row">
                <div className="flex-1 inline left-0 ">
                    {pageButton("", "Photography", undefined, true)}
                    {pageButton("Blog")}
                    {pageButton("Music", "", "My top tracks of all time, refreshed on page load.")}
                </div>
                <div className="flex md:justify-end mt-4 ml-1 md:mt-1">
                    <NowPlaying />
                </div>
            </div>
        </Container>
    )
}
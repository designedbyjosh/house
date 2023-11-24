'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChartLine, faEnvelope, faHamburger, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import Container from './container';
import Link from 'next/link';
import NowPlaying from './now-playing';
import { Tooltip } from '@nextui-org/react';
import { faGithub, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { motion } from "framer-motion"
import {isMobile} from 'react-device-detect';

export default function Header() {

    const pathname = usePathname()
    const pageButton = (pageRef: string, pageText?: string, tooltipText?: string, main?: boolean) => {
        let page = "/" + pageRef.toLowerCase();
        return <Link href={page}>
            <Tooltip content={tooltipText} rounded placement='bottom'>
                <button className={`${(page == pathname) && "!bg-stone-800 !text-white"} w-full my-1 md:w-auto mr-2 bg-stone-300 dark:bg-stone-900 hover:bg-stone-800 hover:text-white py-1 px-4 rounded`}>
                    {pageText || pageRef}
                </button>
            </Tooltip>
        </Link>

    }
    const [expanded, setExpanded] = useState(pathname == "/" && !isMobile ? true : false);


    return (
        <Container >
            <div className="flex pt-8 pb-4 not-active">
                <div className="items-center flex flex-1 left-0">
                    <h1 className="text-2xl md:text-6xl">
                        <Link href="/">
                            Joshua Whitcombe
                        </Link>
                    </h1>
                    <NowPlaying count={(expanded && isMobile) ? 10 : 30} className="text-md"/>
                </div>
                <div className="flex justify-center align-center flex-col">
                    <div className="h-8 mt-3 md:mt-0 md:h-10">
                        {expanded && <><a className="hover:opacity-50" href="https://www.instagram.com/jbwhitcombe/">
                            <FontAwesomeIcon className='mr-2 ml-2' size='lg' icon={faInstagram} />
                        </a>
                            <a className="hover:opacity-50" href="https://www.linkedin.com/in/anengineercalledjosh/">
                                <FontAwesomeIcon className='mr-2 ml-2' size='lg' icon={faLinkedin} />
                            </a>
                            <a className="hover:opacity-50" href="https://github.com/designedbyjosh/house">
                                <Tooltip enterDelay={300} content={"Source code lives here"} rounded placement='left'>
                                    <FontAwesomeIcon className='mr-2 ml-2' size='lg' icon={faGithub} />
                                </Tooltip>
                            </a>
                            <a className="hover:opacity-50" href="https://umami.josh.house/share/Vru7iEaq/Josh's%20Blog">
                                <FontAwesomeIcon className='ml-2 mr-2' size='lg' icon={faChartLine} />
                            </a>
                        </>}
                        <FontAwesomeIcon onClick={() => setExpanded(!expanded)} className='text-2xl ml-2 hover:cursor-pointer hover:opacity-50' size='lg' icon={faBars} />
                    </div>
                </div>
            </div>
            <motion.div layout className="flex pb-5 md:pb-7 flex-col">
                {expanded && <motion.div
                    initial={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    animate={{ opacity: 1 }}

                    layout
                    className="flex-1 inline left-0 ">
                    {pageButton("", "Home", undefined, true)}
                    {pageButton("Travel")}
                    {pageButton("Blog")}
                    {pageButton("Photography")}
                    {pageButton("Music", "", "My top tracks of all time, refreshed on page load.")}
                </motion.div>}
            </motion.div>
        </Container>
    )
}
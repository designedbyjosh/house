'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChartLine } from '@fortawesome/free-solid-svg-icons';
import Container from './container';
import Link from 'next/link';
import NowPlaying from './now-playing';
import { Tooltip } from '@nextui-org/react';
import { faGithub, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion } from "framer-motion"
import {isMobile} from 'react-device-detect';
import EmailSignup from './emailSignup';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { CornerDialog } from 'evergreen-ui';

export default function Header() {

    const pathname = usePathname()
    const pageButton = (pageRef: string, pageText?: string, tooltipText?: string, main?: boolean) => {
        let page = "/" + pageRef.toLowerCase();
        return <Link href={page}>
            <Tooltip content={tooltipText} rounded placement='bottom'>
                <motion.button layout className={`${(page == pathname) && "!bg-neutral-800 !text-white"} w-full my-1 text-sm md:w-auto mr-2 bg-slate-50 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:opacity-70 hover:text-white py-2 px-4 rounded`}>
                    {pageText || pageRef}
                </motion.button>
            </Tooltip>
        </Link>
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedValue = localStorage.getItem('hasSubscribed')
            if (!storedValue) {
                setTimeout(() => { setShowSignupPrompt(true) }, 5000)
            }
        }
    }, [])

    const iconLink = (link: string, icon: IconProp) => <motion.a 
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    exit={{opacity: 0}}
    layout
    className="hover:opacity-50" href={link}>
        <FontAwesomeIcon className='ml-2 mr-2' size='lg' icon={icon} />
    </motion.a>

    const [expanded, setExpanded] = useState(false);
    const [showSignupPrompt, setShowSignupPrompt] = useState(false);


    return (
        <Container>
            <div className="flex pt-8 pb-4 not-active">
                <div className="flex-1 left-0">
                    <h1 className="text-2xl md:text-6xl">
                        <Link href="/">
                            Joshua Whitcombe
                        </Link>
                    </h1>
                    <NowPlaying count={(expanded && isMobile) ? 10 : 30} className="text-md"/>
                </div>
                <div className="flex justify-center align-center flex-col">
                    <div className="h-8 mt-3 md:mt-0 md:h-10">
                        {expanded && <>
                        {iconLink("https://umami.josh.house/share/Vru7iEaq/Josh's%20Blog", faChartLine)}
                        {iconLink("https://www.linkedin.com/in/anengineercalledjosh/", faLinkedin)}
                        {iconLink("https://github.com/designedbyjosh/house", faGithub)}
                        </>}
                        {iconLink("https://www.instagram.com/jbwhitcombe/", faInstagram)}
                        <FontAwesomeIcon onClick={() => setExpanded(!expanded)} className='text-2xl ml-2 hover:cursor-pointer hover:opacity-50' size='lg' icon={faBars} />
                    </div>
                </div>
            </div>
            <motion.div layout className="flex pb-5 md:pb-5 flex-col">
                {expanded && <motion.div
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    exit={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 inline left-0 ">
                    {pageButton("", "Home", undefined, true)}
                    {pageButton("Travel")}
                    {pageButton("Blog")}
                    {pageButton("Photography")}
                    {pageButton("Music", "", "My top tracks of all time, refreshed on page load.")}
                </motion.div>}
            </motion.div>
            <CornerDialog width={300} hasClose={false} containerProps={{ className:"dark:bg-neutral-900", style: { zIndex: 999, border: "1px gray solid", boxShadow: 'none' } }} hasFooter={false} isShown={showSignupPrompt}>
                <EmailSignup setShowSignupPrompt={(targetState) => setShowSignupPrompt(targetState)} />
            </CornerDialog>
        </Container>
    )
}
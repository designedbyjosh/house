import { SpotapiObject, socket } from "@/lib/spotapi"
import { faSpotify } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import { motion } from 'framer-motion'
import { Tooltip } from '@nextui-org/react';
import moment from "moment"
import Link from "next/link"

export default function NowPlaying() {

    const [music, setMusic] = useState({now_playing: {}, top_tracks: {}, top_artists: {}} as SpotapiObject)

    useEffect(() => {socket.emit('immediate_refresh_request', (data: any) => setMusic(data))}, []);

    // Handles any incoming request for music updates
    socket.on('update', (data) => {
        setMusic(data)
    })

    const main = (tooltip: string, color: string, currentSong: string, playing: boolean) => <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        layout
    >
        <Link href="https://github.com/designedbyjosh/spotapi">
            <Tooltip enterDelay={200} content={tooltip} rounded>
                <FontAwesomeIcon icon={faSpotify} size="lg" className={`mr-2 ${color}`} beatFade={playing} />
                <motion.span className={`${playing ? 'text-black dark:text-white' : color}`} layout >{currentSong}</motion.span>
            </Tooltip>
        </Link>
    </motion.div>

    if (Object.keys(music).length === 0 || Object.keys(music?.now_playing!).length === 0) return <div/>

    return music?.now_playing?.is_playing
        ? main("This is being updated live using my Spotapi service", "text-green-600", music.now_playing?.item?.name!, true)
        : main(`I stopped listening ${moment(music?.now_playing?.timestamp).fromNow()}`, "text-stone-600", music.now_playing?.item?.name!, false)

}
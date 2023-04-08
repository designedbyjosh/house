import { socket } from "@/lib/spotapi"
import { faSpotify } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import { motion } from 'framer-motion'
import { Tooltip } from '@nextui-org/react';
import moment from "moment"
import Link from "next/link"

export default function NowPlaying() {

    const [music, setMusic] = useState({} as any)

    socket.on('refresh', (data) => {
        setMusic(data)
    })

    const currentSong = music.item?.album?.name

    return music.now_playing ? <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        layout
    >
        <Link href="https://github.com/designedbyjosh/spotapi">
            <Tooltip content={"This is being updated live using my Spotapi service"} rounded>
                <FontAwesomeIcon icon={faSpotify} size="lg" className="mr-2 text-green-600" beatFade />
                <motion.span layout >{currentSong}</motion.span>
            </Tooltip>
        </Link>
    </motion.div> :
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layout
        >
            <Link href="https://github.com/designedbyjosh/spotapi">
                <Tooltip content={`I stopped listening ${moment(music.timestamp).fromNow()}`} rounded>
                    <FontAwesomeIcon icon={faSpotify} size="lg" className="mr-2 text-stone-600"/>
                    <motion.span layout className="text-stone-600">{currentSong}</motion.span>
                </Tooltip>
            </Link>
        </motion.div>

}
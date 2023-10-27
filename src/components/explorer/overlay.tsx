import { faArrowDown, faArrowLeft, faArrowRight, faArrowUp, faCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Tooltip } from "@nextui-org/react"
import moment from "moment"
import { useState } from "react"
import { motion } from "framer-motion"
import { Nullable } from "@tryghost/content-api"
import Zoom from 'react-medium-image-zoom'
import Link from "next/link"

type Props = {
  type?: string,
  text: string,
  date: Date,
  updated: Date,
  index?: number,
  totalIndex?: number,
  nextIndex?: () => void,
  previousIndex?: () => void,
  image?: Nullable<string> | undefined,
  image_alt?: Nullable<string> | undefined,
  body?: string,
  title?: string,
  slug?: string,
}

export default function Overlay({ image, slug, body, title, image_alt, type = "text", text, date, updated, index, totalIndex, nextIndex, previousIndex }: Props) {

  const recent = moment().diff(moment(updated), 'hours') < 8

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`dark:text-white text-black overlay bg-white dark:bg-black flex flex-col`}>
      <div className="flex-1 overflow-y-auto">
        <div className="text-xs font-semibold  mb-5 flex-row flex">
          <FontAwesomeIcon onClick={() => { index! > 0 && totalIndex! > 1 && previousIndex!() }} className='cursor-pointer pr-5' style={{opacity: index! > 0 && totalIndex! > 1 ? 1 : 0.1}} size="lg" icon={faArrowLeft} />
          <FontAwesomeIcon onClick={() => { index! < totalIndex! - 1 && nextIndex!() }} className='cursor-pointer' style={{opacity: index! < totalIndex! - 1 ? 1 : 0.1}} size="lg" icon={faArrowRight} />
          <div className="pl-5 font-bold">
          {date.toLocaleDateString('en-au',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            </div>
        </div>
        <div className="text-xl font-bold">
          {title}
        </div>
        {image && <img className="mt-2" src={image!} />}
        <div className={`py-3 mb-5`}>
          <motion.span className={`opacity-50`}>{text}</motion.span>
        </div>
        {(body) && <><Link href={`/blog/${slug}`} className={`text-med mr-1 bg-stone-800 hover:bg-stone-900 text-white hover:text-white py-1 px-3 rounded`}>
            Fullscreen Reader
          </Link>
          <motion.div className="blog-post mt-8" layout dangerouslySetInnerHTML={{ "__html": body }} /> </>}
      </div>
      <div className="flex justify-center items-center">

      </div>
    </motion.div>
  )
}
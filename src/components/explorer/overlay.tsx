import { faArrowDown, faArrowLeft, faArrowRight, faArrowUp, faCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Tooltip } from "@nextui-org/react"
import moment from "moment"
import { useState } from "react"
import { motion } from "framer-motion"
import { Nullable } from "@tryghost/content-api"
import Zoom from 'react-medium-image-zoom'

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
}

export default function Overlay({ image, image_alt, type = "text", text, date, updated, index, totalIndex, nextIndex, previousIndex }: Props) {

  const recent = moment().diff(moment(updated), 'hours') < 8

  const [expanded, setExpanded] = useState(false)

  return (
    <div className="text-white overlay blurred flex flex-col">
      <div className="flex-1">
        <div className="text-2xl font-semibold">
          {date.toLocaleDateString('en-au',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
        </div>
        <div className="py-3">
          {text}
        </div>
        {expanded && image && <motion.div layout>
          <Zoom classDialog='custom-zoom'><motion.img layout initial={{opacity: 0}} animate={{ opacity: 1}} exit={{opacity: 0}} style={{ borderRadius: 10, overflow: 'hidden', objectFit: 'cover', minHeight: '250px', minWidth: '100%' }} alt={image_alt!} className="pt-2 md:pt-4" src={image!} /></Zoom>
        </motion.div>}
        <div className="text-xs opacity-50 font-semibold  m-2.5 flex-row flex text-center justify-center">
          {index! > 0 && totalIndex! > 1 && <FontAwesomeIcon onClick={() => { previousIndex!() }} className='cursor-pointer' size="lg" icon={faArrowLeft} />}
          <Tooltip content={`Updated ${moment(updated).fromNow()}`} rounded placement='bottom'>
            <FontAwesomeIcon onClick={() => image && setExpanded(!expanded)} beatFade={recent} className={`${recent ? 'text-green-500' : 'text-gray-500'} pr-5 pl-5`} size="lg" icon={image ? (expanded ? faArrowUp : faArrowDown) : faCircle} />
          </Tooltip>
          {index! < totalIndex! - 1 && <FontAwesomeIcon onClick={() => { nextIndex!() }} className='cursor-pointer' size="lg" icon={faArrowRight} />}
        </div>
      </div>
      <div className="flex justify-center items-center">

      </div>
    </div>
  )
}
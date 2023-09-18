import { faArrowLeft, faArrowRight, faCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Tooltip } from "@nextui-org/react"
import moment from "moment"

type Props = {
  type?: string,
  text: string,
  date: Date,
  updated: Date,
  index?: number,
  totalIndex?: number,
  nextIndex?: () => void,
  previousIndex?: () => void,
}

export default function Overlay({ type = "text", text, date, updated, index, totalIndex, nextIndex, previousIndex }: Props) {

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
        <div className="text-xs opacity-50 font-semibold  m-2.5 flex-row flex text-center justify-center">
        { index! > 0 && totalIndex! > 1 && <FontAwesomeIcon onClick={() => {previousIndex!()}} className='cursor-pointer' size="lg" icon={faArrowLeft} />}
        <Tooltip content={`Updated ${moment(updated).fromNow()}`} rounded placement='bottom'>
          <FontAwesomeIcon beatFade className='text-green-500 pr-5 pl-5' size="lg" icon={faCircle} />
          </Tooltip>
          {index! < totalIndex! - 1 && <FontAwesomeIcon onClick={() => {nextIndex!()}} className='cursor-pointer' size="lg" icon={faArrowRight} />}
        </div>
      </div>
      <div className="flex justify-center items-center">
          
      </div>
    </div>
  )
}
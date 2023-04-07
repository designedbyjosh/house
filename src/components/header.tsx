import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faEnvelope } from '@fortawesome/free-solid-svg-icons';

export default function Header({}) {
  return (
    <>
        <div className="flex pt-8 pb-4">
            <div className="flex-1 left-0">
                <h1 className="text-4xl md:text-6xl  md:pt-16">
                    Joshua Whitcombe
                </h1>
            </div>
            <div className="flex justify-end flex-col">
                <div className="h-9 md:h-10">
                <FontAwesomeIcon className='pr-2' size='lg' icon={faEnvelope} />
                <a className="hover:opacity-50" href="https://umami.josh.house/share/Vru7iEaq/Josh's%20Blog">
                    <FontAwesomeIcon className='pr-2 pl-2' size='lg' icon={faChartLine} />
                </a>
                </div>
            </div>
        </div>
        
        <h3 className="text-xl pb-6">
        <button className="bg-stone-700 hover:bg-stone-800 text-white py-1 px-4 rounded">
            Photography
        </button>
        <button disabled className="bg-stone-800 text-white/20 py-1 px-4 ml-2 rounded">
            Blog
        </button>
        <button disabled className="bg-stone-800 text-white/20 py-1 px-4 ml-2 rounded">
            Analytics
        </button>
        </h3>
    </>
  )
}
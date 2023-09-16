
import Container from '@/components/container';
import Map from '@/components/map'
import { faCircle, faPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from "framer-motion"
import moment from 'moment';
import Head from 'next/head';
import { useEffect, useState } from 'react';
export interface index {
}

export default function Index({ }: index) {


  return (
    <>
    <Head>
        <title>{`Josh Lives Here`}</title>
      </Head>
      <Container>
        <div className="text-white overlay blurred">
          <div className="text-2xl font-semibold">
          {new Date().toLocaleDateString('en-au',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="py-3">
          I am currently in transit to the United States from Australia, arriving {moment("2023-09-17T22:50:00Z").fromNow()}.
          </div>
          <div className="text-xs opacity-50 font-semibold">
          <FontAwesomeIcon beatFade className='text-green-500 pr-2' size="sm" icon={faCircle} /> Updated {moment("2023-09-16T14:50:00Z").fromNow()}
          </div>
        </div>
      </Container>
    <motion.div  initial={{ opacity: 0 }}
    animate={{opacity: 1 }}
    exit={{ opacity: 0 }} >
       <Map 
       time={'dusk'} 
       style={{top: 0, left:0, right: 0, bottom: 0,position: 'absolute', zIndex: -99}} 
       latitude={28.471637} 
       longitude={-81.471122}
       zoomLevel={2}  />
    </motion.div>
    </>
  )
}
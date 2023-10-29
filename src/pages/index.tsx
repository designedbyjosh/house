'use client'
import Container from '@/components/container';
import { motion } from "framer-motion"
import moment from 'moment';
import Head from 'next/head';
import { useState } from 'react';
import { GetStaticProps } from 'next'
import { getTravelPosts } from '@/lib/ghost';
import Overlay from '@/components/explorer/overlay';
import { PostOrPage } from '@tryghost/content-api';
import Map from '@/components/map';


export default function Index({ }) {
  
  return (
    <>
    <Head>
        <title>{`Josh Posts Here`}</title>
      </Head>
      <Container>
        <div className="flex flex-col lg:flex-row max-w-full overflow-hidden m-10">
        <div style={{textAlign: 'right', flex: 1}} className="hidden lg:inline">
        <img style={{maxWidth: '100px'}} className='inline' src={"https://blog.josh.house/content/images/2023/10/Aaron-Josh-Betty-Bravo-40.jpg"}></img>
        </div>
        <div style={{flex: 4}} className="md:px-6 flex-auto">
          <p className="about text-xl md:text-2xl">
            G&apos;day,
            <br /> <br />
            I’m Josh. I’m an Aussie who lives in Sydney, Australia. 
            <br/> <br/>
            During the day, I work as a data engineer for <a href="https://palantir.com">Palantir</a>.
            <br/> <br/>
            The rest of the time, I get amongst <a href="/blog">adventure sports</a>, <a href="/travel">overseas travel</a> and <a href="/blog">writing about navigating grief</a>.
            <br/> <br/>
            <i>- Josh</i>
          </p>
        </div>
        </div>
      </Container>
    </>
  )
}
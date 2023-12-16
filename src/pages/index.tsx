'use client'
import Container from '@/components/container';
import { motion } from "framer-motion"
import moment from 'moment';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next'
import { SubscribeToNewsletter, getTravelPosts } from '@/lib/ghost';
import Overlay from '@/components/explorer/overlay';
import { PostOrPage } from '@tryghost/content-api';
import Map from '@/components/map';
import { CornerDialog, toaster } from 'evergreen-ui';
import isValidEmail from 'is-valid-email';
import Image from 'next/image';


export default function Index({ }) {
  const profileURL = "https://blog.josh.house/content/images/2023/11/DALL-E-2023-11-06-16.56.47---extend-the-background.png"

  return (
    <>
      <Head>
        <title>{`Josh Posts Here`}</title>
      </Head>
      <Container>
          <Image 
            alt={"Joshua Whitcombe standing in a field"}
            src={profileURL}
            width="0"
            height="0"
            priority
            sizes="100vw"
            className="w-full h-auto"></Image>
          <div style={{ flex: 4 }} className="md:px-6 flex-auto">
            <p className="about text-l md:text-2xl mt-10">
              G&apos;day,
              <br /> <br />
              I’m Josh. I’m an Aussie who lives in Sydney, Australia.
              <br /> <br />
              During the day, I work as a data engineer for <a href="https://palantir.com">Palantir</a>.
              <br /> <br />
              The rest of the time, I get amongst <a href="/photography">photography</a>, <a href="/travel">overseas travel</a> and <a href="/blog">writing about navigating grief</a>.
              <br /> <br />
              <i>- Josh</i>
            </p>
          </div>
      </Container>
    </>
  )
}
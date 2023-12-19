'use client'
import Container from '@/components/container';
import { motion } from "framer-motion"
import moment from 'moment';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next'
import { ExtractTravelMetadata, PostOrPageWithLocation, SubscribeToNewsletter, getLatestPost, getLatestTravelPost, getTravelPosts } from '@/lib/ghost';
import Overlay from '@/components/explorer/overlay';
import { PostOrPage } from '@tryghost/content-api';
import Map from '@/components/map';
import { CornerDialog, StatusIndicator, toaster } from 'evergreen-ui';
import isValidEmail from 'is-valid-email';
import Image from 'next/image';
import { useTheme } from 'next-themes';


export default function Index({ latestPost, latestTravelUpdate } : { latestPost: PostOrPage, latestTravelUpdate: PostOrPageWithLocation}) {
  const profileURL = "https://blog.josh.house/content/images/2023/11/DALL-E-2023-11-06-16.56.47---extend-the-background.png"

  return (
    <>
      <Head>
        <title>{`Josh Posts Here`}</title>
      </Head>
      <Container>
        <div style={{ flex: 4 }} className="grid grid-cols-1 gap-x-5 md:grid-cols-2 md:mb-5">
          <a href={`/blog/${latestPost.slug}`} className="bg-slate-50 p-7 hover:bg-slate-200 cursor-pointer">
            <span><StatusIndicator color="red" /><span className="text-xs opacity-50">Latest Article<span className="font-semibold ml-1">{moment(latestPost.published_at).fromNow()}</span></span></span>
            <h2 className="text-sm py-1">{latestPost.title}</h2>
            <span className="text-xs opacity-30">{latestPost.reading_time} minute read</span>
          </a>
          <a href={`/travel?slug=${latestTravelUpdate.slug}`} className="bg-slate-50 p-7 hover:bg-slate-200 cursor-pointer">
          <span><StatusIndicator color="blue" /><span className="text-xs opacity-50">Travel Update<span className="font-semibold ml-1">{moment(latestTravelUpdate.published_at).fromNow()}</span></span></span>
            <h2 className="text-sm py-1">{latestTravelUpdate.excerpt}</h2>
            <span className="text-xs opacity-30">{latestTravelUpdate.title}</span>
          </a>
        </div>
        <Image
          alt={"Joshua Whitcombe standing in a field"}
          src={profileURL}
          width="0"
          height="0"
          priority
          sizes="100vw"
          className="w-full h-auto"></Image>
        <div style={{ flex: 4 }} className="md:p-10 p-6 flex-auto bg-slate-50">
          <p className="about text-l md:text-2xl">
            G&apos;day,
            <br /> <br />
            I’m Josh. I’m an Aussie who lives in Sydney, Australia.
            <br /> <br />
            During the day, I work as a data engineer for <a href="https://palantir.com">Palantir</a>.
            <br /> <br />
            The rest of the time, I get amongst <a href="/photography">photography</a>, <a href="/travel">overseas travel</a> and <a href="/blog/after-the-wards-navigating-lifes-turbulent-currents-as-a-gay-widower">ways to navigate adversity</a>.
            <br /> <br />
            <i>- Josh</i>
          </p>
        </div>
      </Container>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (props) => {

  let latestPost = await getLatestPost();
  let latestTravelUpdate = await getLatestTravelPost();

  return {
    props: { latestPost, latestTravelUpdate },
    revalidate: 30,
  }
}
'use client'
import Container from '@/components/container';
import { motion } from "framer-motion"
import moment from 'moment';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next'
import { ExtractTravelMetadata, PostOrPageWithLocation, SubscribeToNewsletter, getLatestPhoto, getLatestPost, getLatestTravelPost, getTravelPosts } from '@/lib/ghost';
import Overlay from '@/components/explorer/overlay';
import { PostOrPage } from '@tryghost/content-api';
import Map from '@/components/map';
import { CornerDialog, StatusIndicator, toaster } from 'evergreen-ui';
import isValidEmail from 'is-valid-email';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import Zoom from 'react-medium-image-zoom'
import EmailSignup from '@/components/emailSignup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocation, faLocationPin, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import { renderArticleButton } from './blog/[slug]';


export default function Index({ latestPost, latestTravelUpdate, latestPhoto } : { latestPhoto: PostOrPage, latestPost: PostOrPage, latestTravelUpdate: PostOrPageWithLocation}) {
  const profileURL = "https://blog.josh.house/content/images/2023/11/DALL-E-2023-11-06-16.56.47---extend-the-background.png"

  return (
    <>
      <Head>
        <title>{`Josh Posts Here`}</title>
      </Head>
      <Container>
        <div style={{ flex: 4 }} className="grid grid-cols-1 gap-x-5 md:grid-cols-2 md:mb-5">
          {renderArticleButton(latestPost, <><StatusIndicator color="red" />Latest Article</>)}
          <a href={`/travel?slug=${latestTravelUpdate.slug}`} className="bg-neutral-100 mb-5 md:mb-0 p-7 hover:bg-neutral-200 cursor-pointer rounded">
          <span><FontAwesomeIcon size="sm" color="orange" icon={faQuoteLeft} className="mr-2" /><span className="text-xs">Travel Update</span></span>
            <h2 className="text-lg py-1 font-semibold">{latestTravelUpdate.excerpt}</h2>
            <span className="text-xs">{latestTravelUpdate.title} - {moment(latestTravelUpdate.published_at).fromNow()}</span>
          </a>
        </div>
        <div className="bg-neutral-100 rounded">
        <Image
          alt={"Joshua Whitcombe standing in a field"}
          src={profileURL}
          width="0"
          height="0"
          priority
          sizes="100vw"
          className="w-full h-auto rounded"></Image>
          <div className="md:p-10 p-6 flex-auto">
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
        </div>
        <div style={{ flex: 4 }} className="grid grid-cols-1 gap-x-5 md:grid-cols-2 my-5 md:">
          <a href={`/blog/${latestPhoto.slug}`} style={{position: 'relative'}} className="bg-neutral-100 mb-5 md:mb-0 hover:opacity-90 cursor-pointer rounded">
            {/* <Zoom classDialog='custom-zoom'> */}
            <span style={{position: 'absolute', bottom: 20, left: 20, zIndex: 10}} ><span className="text-xs text-white"><FontAwesomeIcon size="sm" className="mr-1" icon={faLocationPin} /> {latestPhoto.feature_image_caption}</span></span>
            <div className="rounded" style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9, background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 1) 100%)'}} />
              <Image 
                width="1200"
                height="800"
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 50vw, 100vw"
                className="h-full h-auto rounded"
                placeholder="empty"
                alt={latestPhoto.feature_image_alt!} 
                src={latestPhoto.feature_image!} 
              />
            {/* </Zoom> */}
          </a>
          <div className="bg-neutral-100 mb-5 md:mb-0 p-7 rounded">
            <EmailSignup showCancel={false} header="Mailing List" signupText='Join my Mailing List' message="I occasionally publish articles here on my website about my adventures, if you'd like to receive these straight to your inbox, sign up below." />
          </div>
        </div>
      </Container>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (props) => {

  let latestPost = await getLatestPost();
  let latestTravelUpdate = await getLatestTravelPost();
  let latestPhoto = await getLatestPhoto();

  return {
    props: { latestPost, latestTravelUpdate, latestPhoto },
    revalidate: 30,
  }
}
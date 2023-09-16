import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../components/container'
import { getPhotos } from '../lib/ghost'
import { PostsOrPages } from '@tryghost/content-api'
import moment from 'moment';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { delay, motion } from "framer-motion"
import {useRef, useEffect,  useState, CSSProperties } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax


type Props = {
    latitude: number,
    longitude: number,
    style: CSSProperties,
    rotation?: number,
    zoomLevel?: number,
    pitch?: number,
    bearing?: number,
    time?: string
  }

export default function Map({ latitude, longitude, style, rotation=1000, zoomLevel=18, pitch=60, bearing=-60, time="night" } : Props) {

  mapboxgl.accessToken = 'pk.eyJ1IjoiamJ3aGl0Y29tYmUiLCJhIjoiY2o1b2s2N3RhMDB6NjMzcHFwZTJmbDJsdCJ9.KgiXUqT9bHXVulRlN7Ch6Q';

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(longitude);
  const [lat, setLat] = useState(latitude);
  const [zoom, setZoom] = useState(zoomLevel);

  function rotateCamera(timestamp: number) {
    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    map.current.rotateTo((timestamp / rotation) % 360, { duration: 0 });
    // Request the next frame of the animation.
    requestAnimationFrame(rotateCamera);
  }

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
    container: mapContainer.current,
    center: [lng, lat],
    zoom: zoom,
    pitch: pitch, // pitch in degrees
    bearing: bearing, // bearing in degrees
    });
    map.current.on('style.load', () => {
      map.current.setConfigProperty('basemap', 'lightPreset', time);
    });
    map.current.on('load', () => {
      // Start the animation.
      rotateCamera(0);
    });
  });

  return (
    <>
      <div style={style} ref={mapContainer}/>
    </>
  )
}
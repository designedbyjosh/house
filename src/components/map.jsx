import 'react-medium-image-zoom/dist/styles.css'
import {useRef, useEffect,  useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

export default function Map({ latitude, longitude, style, rotation=1000, zoom=18, pitch=60, bearing=-60, time="night" }) {
  
  mapboxgl.accessToken = 'pk.eyJ1IjoiamJ3aGl0Y29tYmUiLCJhIjoiY2o1b2s2N3RhMDB6NjMzcHFwZTJmbDJsdCJ9.KgiXUqT9bHXVulRlN7Ch6Q';
  
  const mapContainer = useRef(null);
  const map = useRef(null);

  function rotateCamera(timestamp) {
    map.current.rotateTo((timestamp / rotation) % 360, { duration: 0 });
    requestAnimationFrame(rotateCamera);
  }
  
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
    container: mapContainer.current,
    center: [longitude, latitude],
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
import 'react-medium-image-zoom/dist/styles.css'
import {useRef, useEffect,  useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css';
import {isMobile} from 'react-device-detect';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import * as rdd from 'react-device-detect';

export default function Map({ latitude, longitude, style, rotation=1000, zoom=18, pitch=60, bearing=-60, time="night" }) {
  
  mapboxgl.accessToken = 'pk.eyJ1IjoiamJ3aGl0Y29tYmUiLCJhIjoiY2o1b2s2N3RhMDB6NjMzcHFwZTJmbDJsdCJ9.KgiXUqT9bHXVulRlN7Ch6Q';
  
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [flying, setFlying] = useState(false)
  let frames = []

  function rotateCamera(timestamp) {
    !flying && map.current.rotateTo((timestamp / rotation) % 360, { duration: 0 });
    let currentFrame = requestAnimationFrame(rotateCamera);
    frames.push(currentFrame)
  }
  
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
    container: mapContainer.current,
    });
    map.current.on('style.load', () => {
      map.current.setConfigProperty('basemap', 'lightPreset', time);
    });
  }, []);

  useEffect(() => {
    if (!map.current.style._loaded) return;
    map.current.setConfigProperty('basemap', 'lightPreset', time);
  }, [time]);

  useEffect(() => {

    const target = {
      center: [longitude, latitude],
      offset: isMobile ? [0, -100] : [300,0],
      zoom,
      bearing,
      pitch
      };
  

    map.current.flyTo({
      ...target, // Fly to the selected target
      duration: 5000, // Animate over 12 seconds
      essential: true // This animation is considered essential with
      })

  }, [latitude, longitude, zoom])

  return (
    <>
      <div style={style} ref={mapContainer}/>
    </>
  )
}
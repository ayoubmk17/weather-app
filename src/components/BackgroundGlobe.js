import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import './BackgroundGlobe.css';

function BackgroundGlobe({ globeCoords, markers, onZoomOutRef }) {
  const globeEl = useRef();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const handleZoomOut = () => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      controls.autoRotate = true;
      globeEl.current.pointOfView(
        { lat: 0, lng: 0, altitude: 2.5 },
        2000
      );
    }
  };

  useEffect(() => {
    if (typeof onZoomOutRef === 'function') {
      onZoomOutRef(handleZoomOut);
    }
  }, [onZoomOutRef]);

  useEffect(() => {
    if (globeEl.current) {
      const globe = globeEl.current;
      
      const controls = globe.controls();
      controls.enableZoom = true;
      controls.enableRotate = true;
      controls.enablePan = true;
      controls.minDistance = 120;
      controls.maxDistance = 800;
      controls.rotateSpeed = 0.8;
      controls.zoomSpeed = 1.2;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;

      globe.resumeAnimation();
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (globeCoords.lat !== 0 && globeCoords.lng !== 0 && globeEl.current) {
      const controls = globeEl.current.controls();
      
      controls.autoRotate = false;
      
      globeEl.current.pointOfView(
        { lat: globeCoords.lat, lng: globeCoords.lng, altitude: 1.5 },
        1500
      );

      setTimeout(() => {
        globeEl.current.pointOfView(
          { lat: globeCoords.lat, lng: globeCoords.lng, altitude: 0.4 },
          1500
        );
      }, 1600);
    }
  }, [globeCoords]);

  return (
    <div className="background-globe">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={markers}
        pointLat={(d) => d.lat}
        pointLng={(d) => d.lng}
        pointColor={() => 'orange'}
        pointAltitude={0.05}
        pointRadius={0.5}
        pointResolution={16}
        enablePointerInteraction={true}
        dragRotate={true}
      />
    </div>
  );
}

export default BackgroundGlobe;
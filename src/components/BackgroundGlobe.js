import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import './BackgroundGlobe.css';

function BackgroundGlobe({ globeCoords, markers }) {
  const globeEl = useRef();
  const [autoRotate, setAutoRotate] = useState(true); // <-- Ajout du contrôle d'auto-rotation

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = autoRotate;
      globeEl.current.controls().autoRotateSpeed = 0.5; // Vitesse de rotation
    }
  }, [autoRotate]);

  useEffect(() => {
    if (globeCoords.lat !== 0 && globeCoords.lng !== 0 && globeEl.current) {
      // Stopper l'auto-rotation une fois la ville affichée
      setAutoRotate(false);

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
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={markers}
        pointLat={(d) => d.lat}
        pointLng={(d) => d.lng}
        pointColor={() => 'orange'}
        pointAltitude={0.03}
        pointRadius={0.3}
        pointResolution={12}
      />
    </div>
  );
}

export default BackgroundGlobe;
import React, { useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import './BackgroundGlobe.css';

function BackgroundGlobe({ globeCoords, markers }) {
  const globeEl = useRef();

  useEffect(() => {
    if (globeCoords.lat !== 0 && globeCoords.lng !== 0 && globeEl.current) {
      // 1er mouvement : tourner doucement
      globeEl.current.pointOfView(
        { lat: globeCoords.lat, lng: globeCoords.lng, altitude: 1.5 },
        1500
      );

      // 2ème mouvement : petit zoom automatique après rotation
      setTimeout(() => {
        globeEl.current.pointOfView(
          { lat: globeCoords.lat, lng: globeCoords.lng, altitude: 0.4 }, // Plus proche
          1500
        );
      }, 1600); // attendre que la rotation soit presque finie
    }
  }, [globeCoords]);

  return (
    <div className="background-globe">
      <Globe
        ref={globeEl}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={markers}  // Ajout de données pour les markers
        pointLat={(d) => d.lat}
        pointLng={(d) => d.lng}
        pointColor={() => 'orange'}  // Couleur du marker
        pointAltitude={0.03}  // Hauteur du point
        pointRadius={0.3}  // Taille du point
        pointResolution={12}  // Résolution du cercle
      />
    </div>
  );
}

export default BackgroundGlobe;

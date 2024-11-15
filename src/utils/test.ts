// src/CesiumMap.tsx
import React, { useEffect, useRef } from 'react';
import Cesium from 'cesium';

const CesiumMap: React.FC = () => {
  const cesiumContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cesiumContainer.current) return;

    // Initialize Cesium viewer
    const viewer = new Cesium.Viewer(cesiumContainer.current, {
    //   terrainProvider: Cesium.createWorldTerrain(),
    });

    // Define the flight path
    const positions = [
      Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 500),
      Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0553706, 500),
      Cesium.Cartesian3.fromDegrees(-123.0704619, 44.0553706, 500),
      Cesium.Cartesian3.fromDegrees(-123.0704619, 44.0503706, 500),
    ];

    const start = Cesium.JulianDate.now();
    const stop = Cesium.JulianDate.addSeconds(start, positions.length * 10, new Cesium.JulianDate());

    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    viewer.clock.multiplier = 1;

    const property = new Cesium.SampledPositionProperty();

    for (let i = 0; i < positions.length; i++) {
      const time = Cesium.JulianDate.addSeconds(start, i * 10, new Cesium.JulianDate());
      property.addSample(time, positions[i]);
    }

    // Create the drone entity
    viewer.entities.add({
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
        start: start,
        stop: stop,
      })]),
      position: property,
      orientation: new Cesium.VelocityOrientationProperty(property),
      model: {
        uri: 'https://cesium.com/downloads/cesiumjs/releases/1.79/Apps/SampleData/models/CesiumAir/Cesium_Air.glb',
        minimumPixelSize: 64,
      },
      path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: Cesium.Color.YELLOW,
        }),
        width: 10,
      },
    });

    // Fly the camera to the drone path
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 1000),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-45.0),
        roll: 0.0,
      },
    });

    return () => {
      viewer.destroy();
    };
  }, []);

  return(
    1
  ) 

};

export default CesiumMap;

"use client";

import React from "react";
import GeocoderInputs from "@/components/app/map/GeocoderInputs";
import MapDisplay from "@/components/app/map/MapDisplay";
import AvailableVehicles from "@/components/app/vehicles/AvailableVehicles";
import RouteInfo from "@/components/app/map/RouteInfo";
import { useMapContext } from "@/providers/MapContext";

const Home: React.FC = () => {
  const { startCoords } = useMapContext();

  return (
    <div className="h-screen w-full relative">
      <div className="absolute top-0 left-0 z-50 py-3 px-2 right-0 flex justify-center items-center pointer-events-none">
        <div className="w-full max-w-3xl pointer-events-auto">
          <GeocoderInputs />
        </div>
      </div>
      {startCoords && <AvailableVehicles />}
      <RouteInfo />
      <div className="absolute inset-0">
        <MapDisplay />
      </div>
    </div>
  );
};

export default Home;

"use client";

import React from "react";
import GeocoderInputs from "@/components/app/map/GeocoderInputs";
import MapDisplay from "@/components/app/map/MapDisplay";

const Home: React.FC = () => {
  return (
    <div className="h-screen">
      <div className="fixed top-0 left-0 z-50 p-4 right-0 flex justify-center">
        <GeocoderInputs />
      </div>
      <div>
        <MapDisplay />
      </div>
    </div>
  );
};

export default Home;

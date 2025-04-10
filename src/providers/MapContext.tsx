"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface RouteInfo {
  duration: number; // en secondes
  distance: number; // en mètres
}

interface IMapContext {
  startCoords: [number, number] | null;
  setStartCoords: React.Dispatch<React.SetStateAction<[number, number] | null>>;
  endCoords: [number, number] | null;
  setEndCoords: React.Dispatch<React.SetStateAction<[number, number] | null>>;
  routeRequested: boolean;
  setRouteRequested: React.Dispatch<React.SetStateAction<boolean>>;
  routeInfo: RouteInfo | null;
  setRouteInfo: React.Dispatch<React.SetStateAction<RouteInfo | null>>;
  avoidTolls: boolean;
  setAvoidTolls: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRoute: () => void;
}

const MapContext = createContext<IMapContext | undefined>(undefined);

interface MapProviderProps {
  children: ReactNode;
}

export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [endCoords, setEndCoords] = useState<[number, number] | null>(null);
  const [routeRequested, setRouteRequested] = useState<boolean>(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [avoidTolls, setAvoidTolls] = useState<boolean>(false);

  const triggerRoute = () => {
    setRouteRequested(true);
  };

  return (
    <MapContext.Provider
      value={{
        startCoords,
        setStartCoords,
        endCoords,
        setEndCoords,
        routeRequested,
        setRouteRequested,
        routeInfo,
        setRouteInfo,
        avoidTolls,
        setAvoidTolls,
        triggerRoute,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = (): IMapContext => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within a MapProvider");
  }
  return context;
};

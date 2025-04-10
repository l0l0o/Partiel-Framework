"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useMapContext } from "@/providers/MapContext";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const GeocoderInputs: React.FC = () => {
  const geocoderStartContainer = useRef<HTMLDivElement>(null);
  const geocoderEndContainer = useRef<HTMLDivElement>(null);
  const {
    setStartCoords,
    setEndCoords,
    triggerRoute,
    startCoords,
    endCoords,
    avoidTolls,
    setAvoidTolls,
  } = useMapContext();

  useEffect(() => {
    if (geocoderStartContainer.current && mapboxgl.accessToken) {
      const geocoderStart = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken as string,
        mapboxgl: mapboxgl as any,
        placeholder: "Adresse de départ",
        marker: false,
      });
      geocoderStart.addTo(geocoderStartContainer.current);
      geocoderStart.on(
        "result",
        (e: { result: { center: [number, number] } }) => {
          const coords: [number, number] = e.result.center;
          console.log("coords:", coords);
          setStartCoords(coords);
        }
      );
    }

    if (geocoderEndContainer.current && mapboxgl.accessToken && mapboxgl) {
      const geocoderEnd = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken as string,
        mapboxgl: mapboxgl as any,
        placeholder: "Adresse d'arrivée",
        marker: false,
      });
      geocoderEnd.addTo(geocoderEndContainer.current);
      geocoderEnd.on(
        "result",
        (e: { result: { center: [number, number] } }) => {
          const coords: [number, number] = e.result.center;
          setEndCoords(coords);
        }
      );
    }

    // Ajouter des styles personnalisés pour les entrées geocoder
    const style = document.createElement("style");
    style.innerHTML = `
      .mapboxgl-ctrl-geocoder {
        min-width: 200px;
        max-width: 250px;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(8px);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.4);
      }
      .mapboxgl-ctrl-geocoder--input {
        height: 40px;
        font-size: 14px;
        padding-left: 12px;
        background-color: transparent;
      }
      .mapboxgl-ctrl-geocoder--icon-search {
        left: 8px;
        top: 11px;
      }
      .mapboxgl-ctrl-geocoder--input:focus {
        outline: none;
      }
      .mapboxgl-ctrl-geocoder--pin-right {
        right: 8px;
      }
      .mapboxgl-ctrl-geocoder--suggestions {
        background-color: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        z-index: 999 !important;
      }
      .suggestions {
        z-index: 999 !important;
      }
      .mapboxgl-ctrl-geocoder {
        z-index: 100;
        position: relative;
      }
    `;
    document.head.appendChild(style);
  }, [setStartCoords, setEndCoords]);

  const handleClick = () => {
    if (!startCoords || !endCoords) {
      alert("Veuillez sélectionner les deux adresses.");
      return;
    }
    triggerRoute();
  };

  const handleTollsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvoidTolls(e.target.checked);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto relative">
      <div className="flex flex-row gap-2 p-2 items-center justify-between w-full bg-white/40 backdrop-blur-md rounded-lg shadow-lg border border-white/40 z-20 relative">
        <div ref={geocoderStartContainer} className="w-[42%] z-30" />
        <div ref={geocoderEndContainer} className="w-[42%] z-30" />
        <button
          onClick={handleClick}
          className="w-14 h-14 flex items-center justify-center bg-blue-500/80 hover:bg-blue-600/90 text-white rounded-lg shadow-md transition-colors backdrop-blur-sm"
          aria-label="Rechercher"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-7 h-7"
          >
            <path
              fillRule="evenodd"
              d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="flex items-center justify-center bg-white/40 backdrop-blur-md py-1 px-3 rounded-lg shadow-md border border-white/40 z-10 relative -mt-2">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={avoidTolls}
            onChange={handleTollsChange}
          />
          <div className="relative w-9 h-5 bg-gray-200/80 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500/80"></div>
          <span className="ml-2 text-xs font-medium text-gray-900">
            Éviter les péages
          </span>
        </label>
      </div>
    </div>
  );
};

export default GeocoderInputs;

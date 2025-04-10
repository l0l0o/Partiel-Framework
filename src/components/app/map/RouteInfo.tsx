"use client";

import React from "react";
import { useMapContext } from "@/providers/MapContext";

const RouteInfo: React.FC = () => {
  const { routeInfo, avoidTolls } = useMapContext();

  if (!routeInfo) return null;

  // Formatage de la durée
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)} sec`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h${remainingMinutes}min`;
  };

  // Formatage de la distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1).replace(".", ",")}km`;
  };

  return (
    <div className="fixed right-2 bottom-2 p-2 bg-white/30 backdrop-blur-md shadow-lg rounded-lg border border-white/40 z-40 animate-fade-in hover:scale-105 transition-transform duration-300 hover:bg-white/50">
      <div className="text-xs font-medium text-gray-800">
        <div className="flex items-center gap-1.5 mb-1 group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-600 transition-colors"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-bold group-hover:text-blue-700 transition-colors">
            Durée:
          </span>{" "}
          <span className="font-semibold">
            {formatDuration(routeInfo.duration)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mb-1 group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-600 transition-colors"
          >
            <path
              fillRule="evenodd"
              d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-bold group-hover:text-blue-700 transition-colors">
            Distance:
          </span>{" "}
          <span className="font-semibold">
            {formatDistance(routeInfo.distance)}
          </span>
        </div>
        <div className="flex items-center mt-1.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors duration-300 ${
              avoidTolls
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }`}
          >
            {avoidTolls ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                Sans péages
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3 mr-1"
                >
                  <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
                </svg>
                Itinéraire standard
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RouteInfo;

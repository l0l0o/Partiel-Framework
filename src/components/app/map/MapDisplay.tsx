"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useMapContext } from "@/providers/MapContext";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

interface Car {
  id: number;
  available: boolean;
  autonomy: number;
  lat: number;
  lng: number;
  image: string;
  name: string;
  description: string;
  power: number;
  seats: number;
  doors: number;
  brand: string;
  model: string;
  year: number;
  color: string;
}

const MapDisplay: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const {
    startCoords,
    endCoords,
    routeRequested,
    setRouteRequested,
    setRouteInfo,
    avoidTolls,
    setStartCoords,
    triggerRoute,
  } = useMapContext();
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const carMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const startMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const endMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const mapSourceRef = useRef<string | null>(null);
  const [, setCarsGeoJson] = useState<GeoJSON.FeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });
  const activePopupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    if (!map && mapContainer.current) {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v10",
        center: [2.3522, 48.8566],
        zoom: 12,
      });
      mapInstance.on("load", () => {
        setMap(mapInstance);

        // Ajouter les styles CSS pour les clusters
        const style = document.createElement("style");
        style.textContent = `
          .car-cluster {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            backdrop-filter: blur(4px);
          }
          .car-cluster-small {
            width: 35px;
            height: 35px;
            font-size: 12px;
          }
          .car-cluster-medium {
            width: 45px;
            height: 45px;
            font-size: 14px;
          }
          .car-cluster-large {
            width: 55px;
            height: 55px;
            font-size: 16px;
          }
          .car-popup {
            max-width: 250px !important;
            z-index: 5;
          }
          .car-popup .mapboxgl-popup-content {
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.08);
            background-color: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(5px);
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
          }
          .car-popup .mapboxgl-popup-content.selected {
            background-color: rgba(255, 255, 255, 1);
            box-shadow: 0 3px 8px rgba(22, 163, 74, 0.3);
            border: 1px solid rgba(22, 163, 74, 0.3);
          }
          .car-popup .mapboxgl-popup-content:hover {
            background-color: rgba(255, 255, 255, 1);
            box-shadow: 0 3px 8px rgba(59, 130, 246, 0.15);
            transform: translateY(-2px);
          }
          .car-popup-content {
            position: relative;
          }
          .car-popup-content::after {
            content: '';
            position: absolute;
            bottom: -5px;
            right: -5px;
            width: 20px;
            height: 20px;
            background-color: rgba(59, 130, 246, 0.8);
            border-radius: 50%;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7' /%3E%3C/svg%3E");
            background-size: 70%;
            background-position: center;
            background-repeat: no-repeat;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .car-popup img {
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            background-color: #fff;
            display: block;
            margin: 0 auto 12px auto;
            max-height: 120px;
          }
          .mapboxgl-popup-tip {
            transition: all 0.2s ease;
          }
          .car-popup:hover .mapboxgl-popup-tip {
            border-top-color: rgba(255, 255, 255, 1);
          }
        `;
        document.head.appendChild(style);
      });
    }
  }, [map]);

  // Fonction pour mettre à jour le champ d'adresse de départ
  const updateStartAddressInput = async (
    lng: number,
    lat: number,
    carName: string
  ) => {
    try {
      // Utiliser l'API de géocodage inverse de Mapbox pour obtenir l'adresse
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=fr&types=address,poi,place`
      );

      if (!response.ok) throw new Error("Erreur lors du géocodage inverse");

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        // Prendre la première adresse trouvée
        const address = data.features[0].place_name;

        // Trouver spécifiquement l'input de départ (le premier input du geocoder)
        const geocoderContainers = document.querySelectorAll(
          ".mapboxgl-ctrl-geocoder"
        );
        if (geocoderContainers.length > 0) {
          const startInput = geocoderContainers[0].querySelector(
            "input"
          ) as HTMLInputElement;
          if (startInput) {
            // Mettre à jour la valeur
            startInput.value = address;

            // Simuler un événement input pour que Mapbox réagisse
            const inputEvent = new Event("input", { bubbles: true });
            startInput.dispatchEvent(inputEvent);

            // Simuler également un événement change
            const changeEvent = new Event("change", { bubbles: true });
            startInput.dispatchEvent(changeEvent);
          }
        }
      }

      // Petit message pour informer l'utilisateur
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-50 shadow-lg text-sm";
      toast.textContent = `Position de départ mise à jour: ${carName}`;
      document.body.appendChild(toast);

      // Supprimer le toast après 3 secondes
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.5s ease";
        setTimeout(() => document.body.removeChild(toast), 500);
      }, 3000);

      // Déclencher le calcul d'itinéraire si nous avons une destination
      if (endCoords) {
        // Attendre un court instant pour que les coordonnées de départ soient bien mises à jour
        setTimeout(() => {
          triggerRoute();

          // Petit message pour informer l'utilisateur de la création de l'itinéraire
          const routeToast = document.createElement("div");
          routeToast.className =
            "fixed top-16 left-1/2 transform -translate-x-1/2 bg-blue-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-50 shadow-lg text-sm";
          routeToast.textContent = "Calcul de l'itinéraire en cours...";
          document.body.appendChild(routeToast);

          // Supprimer le toast après 3 secondes
          setTimeout(() => {
            routeToast.style.opacity = "0";
            routeToast.style.transition = "opacity 0.5s ease";
            setTimeout(() => document.body.removeChild(routeToast), 500);
          }, 3000);
        }, 500);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'adresse:", error);
    }
  };

  // Convertir les objets voitures en GeoJSON pour clustering
  const carsToGeoJson = (cars: Car[]) => {
    const features = cars.map((car) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [car.lng, car.lat],
      },
      properties: {
        id: car.id,
        name: car.name,
        autonomy: car.autonomy,
        brand: car.brand,
        model: car.model,
        description: car.description || "",
        image: car.image || "",
        available: car.available,
      },
    }));

    return {
      type: "FeatureCollection" as const,
      features,
    };
  };

  // Fonction pour gérer le clic sur un marqueur ou un cluster
  const handleMarkerClick = (
    e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }
  ) => {
    if (!map || !e.features) return;

    const feature = e.features[0];

    if (feature.properties && feature.properties.cluster) {
      // C'est un cluster, on zoom dessus
      const clusterId = feature.properties.cluster_id;
      const source = map.getSource("cars") as mapboxgl.GeoJSONSource;

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom === null || zoom === undefined) return;

        map.easeTo({
          center: (feature.geometry as GeoJSON.Point).coordinates as [
            number,
            number
          ],
          zoom: zoom,
        });
      });
    } else if (feature.properties) {
      // C'est un marqueur individuel, on le sélectionne
      const { coordinates } = feature.geometry as GeoJSON.Point;
      const properties = feature.properties;

      // Mettre à jour les coordonnées de départ et l'interface
      setStartCoords([coordinates[0], coordinates[1]]);
      updateStartAddressInput(coordinates[0], coordinates[1], properties.name);
    }
  };

  // Récupérer et afficher les voitures disponibles lorsque le point de départ est défini
  useEffect(() => {
    const fetchAndDisplayCars = async () => {
      if (!map || !startCoords) return;

      // Supprimer les anciennes sources et couches de clustering s'il y en a
      if (mapSourceRef.current && map.getSource(mapSourceRef.current)) {
        // Vérifier et supprimer toutes les couches associées à la source
        if (map.getLayer("unclustered-point-label"))
          map.removeLayer("unclustered-point-label");
        if (map.getLayer("unclustered-point"))
          map.removeLayer("unclustered-point");
        if (map.getLayer("cluster-count")) map.removeLayer("cluster-count");
        if (map.getLayer("clusters")) map.removeLayer("clusters");

        // Maintenant on peut supprimer la source
        map.removeSource(mapSourceRef.current);
      }

      // Enlever les marqueurs individuels existants
      carMarkersRef.current.forEach((marker) => marker.remove());
      carMarkersRef.current = [];

      try {
        // Récupérer les voitures depuis l'API
        const response = await fetch(
          `/api/cars?lat=${startCoords[1]}&lng=${startCoords[0]}&radius=100`
        );
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des véhicules");

        const carsData = await response.json();

        // Convertir les données des voitures en GeoJSON pour le clustering
        const geoJsonData = carsToGeoJson(carsData);
        setCarsGeoJson(geoJsonData);

        // Créer une source de données GeoJSON avec clustering activé
        mapSourceRef.current = "cars";
        map.addSource("cars", {
          type: "geojson",
          data: geoJsonData,
          cluster: true,
          clusterMaxZoom: 14, // Zoom maximal auquel les points se regrouperont
          clusterRadius: 50, // Rayon dans lequel les points sont regroupés
        });

        // Ajouter une couche pour les clusters
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "cars",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "rgba(59, 130, 246, 0.7)", // Bleu pour les petits clusters
              5,
              "rgba(25, 118, 210, 0.7)", // Bleu plus foncé pour les moyens
              15,
              "rgba(13, 71, 161, 0.7)", // Bleu très foncé pour les grands
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20, // Rayon pour les petits clusters
              5,
              25, // Rayon pour les moyens
              15,
              30, // Rayon pour les grands
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "white",
          },
        });

        // Ajouter une couche pour afficher le nombre de points dans un cluster
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "cars",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 14,
          },
          paint: {
            "text-color": "white",
          },
        });

        // Ajouter une couche pour les points individuels (non regroupés)
        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "cars",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "rgba(59, 130, 246, 0.8)",
            "circle-radius": 12,
            "circle-stroke-width": 2,
            "circle-stroke-color": "white",
            "circle-stroke-opacity": 0.8,
          },
        });

        // Ajouter une couche pour les étiquettes des points
        map.addLayer({
          id: "unclustered-point-label",
          type: "symbol",
          source: "cars",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 1.5],
            "text-anchor": "top",
            "text-size": 10,
            "text-allow-overlap": false,
          },
          paint: {
            "text-color": "#333",
            "text-halo-color": "white",
            "text-halo-width": 1,
          },
        });

        // Ajouter une icône de voiture si elle n'existe pas encore
        if (!map.hasImage("car")) {
          const carImage = new Image();
          carImage.onload = () => {
            if (map && !map.hasImage("car")) {
              map.addImage("car", carImage);
            }
          };
          carImage.src = "/car-pin.svg";
        }

        // Ajouter des événements d'interaction
        map.on("click", "clusters", handleMarkerClick);
        map.on("click", "unclustered-point", handleMarkerClick);

        // Changer le curseur au survol des clusters et points
        map.on("mouseenter", "clusters", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "clusters", () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("mouseenter", "unclustered-point", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "unclustered-point", () => {
          map.getCanvas().style.cursor = "";
        });

        // Modifier les événements de survol pour une meilleure expérience
        map.on("mouseenter", "unclustered-point", (e) => {
          map.getCanvas().style.cursor = "pointer";

          // Vérifier si la couche existe avant de modifier ses propriétés
          if (map.getLayer("unclustered-point")) {
            // Augmenter la taille du cercle au survol
            map.setPaintProperty("unclustered-point", "circle-radius", 15);
            map.setPaintProperty(
              "unclustered-point",
              "circle-color",
              "rgba(59, 130, 246, 0.9)"
            );
            map.setPaintProperty("unclustered-point", "circle-stroke-width", 3);
          }

          if (!e.features || e.features.length === 0) return;

          // Fermer toute popup existante
          if (activePopupRef.current) {
            activePopupRef.current.remove();
            activePopupRef.current = null;
          }

          const coordinates = (
            e.features[0].geometry as GeoJSON.Point
          ).coordinates.slice() as [number, number];
          const properties = e.features[0].properties;

          if (!properties) return;

          const popupHTML = `
            <div style="max-width: 250px; padding: 10px; cursor: pointer;" class="car-popup-content">
              ${
                properties.image
                  ? `<div style="height: 100px; width: 100%; position: relative; margin-bottom: 10px; display: flex; justify-content: center; align-items: center;">
                <img src="${properties.image}" alt="${properties.name}" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
              </div>`
                  : ""
              }
              <h3 style="font-weight: bold; margin-bottom: 5px;">${
                properties.name
              }</h3>
              <p style="margin-bottom: 5px;"><b>Autonomie:</b> ${
                properties.autonomy
              } km</p>
              <p style="margin-bottom: 0;"><b>Marque:</b> ${properties.brand} ${
            properties.model
          }</p>
            </div>
          `;

          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            maxWidth: "250px",
            className: "car-popup",
            offset: 15, // Ajouter un décalage pour éloigner la popup de l'icône
          })
            .setLngLat(coordinates)
            .setHTML(popupHTML)
            .addTo(map);

          // Stocker la référence de la popup active
          activePopupRef.current = popup;

          // Ajouter un événement de clic à toute la popup
          setTimeout(() => {
            const popupContent = document.querySelector(".car-popup-content");
            if (popupContent) {
              popupContent.addEventListener("click", () => {
                setStartCoords(coordinates);
                updateStartAddressInput(
                  coordinates[0],
                  coordinates[1],
                  properties.name
                );

                // Ne pas fermer la popup, juste la transformer pour indiquer la sélection
                const popupElement = document.querySelector(
                  ".mapboxgl-popup-content"
                );
                if (popupElement) {
                  popupElement.classList.add("selected");
                  // Ajouter un style pour indiquer que le véhicule est sélectionné
                  popupElement.innerHTML += `
                    <div class="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  `;
                }

                // Mettre en évidence le cercle au lieu de le supprimer
                if (map.getLayer("unclustered-point")) {
                  map.setPaintProperty("unclustered-point", "circle-color", [
                    "case",
                    ["==", ["get", "id"], properties.id],
                    "rgba(22, 163, 74, 0.8)", // Vert pour le point sélectionné
                    "rgba(59, 130, 246, 0.8)", // Bleu pour les autres points
                  ]);

                  map.setPaintProperty(
                    "unclustered-point",
                    "circle-stroke-color",
                    [
                      "case",
                      ["==", ["get", "id"], properties.id],
                      "#16a34a", // Bordure verte pour le point sélectionné
                      "white", // Bordure blanche pour les autres points
                    ]
                  );
                }
              });
            }
          }, 10);
        });

        // Simplifier la gestion de la fermeture des popups
        map.on("mouseleave", "unclustered-point", () => {
          // Vérifier si la couche existe avant de modifier ses propriétés
          if (map.getLayer("unclustered-point")) {
            // Réinitialiser le style du cercle quand on quitte le point
            map.setPaintProperty("unclustered-point", "circle-radius", 12);
            map.setPaintProperty(
              "unclustered-point",
              "circle-color",
              "rgba(59, 130, 246, 0.8)"
            );
            map.setPaintProperty("unclustered-point", "circle-stroke-width", 2);
          }

          map.getCanvas().style.cursor = "";

          if (activePopupRef.current) {
            // Ajouter un délai plus long pour permettre le passage de la souris sur la popup
            setTimeout(() => {
              // Vérifier si la souris est sur la popup
              const popupElement = document.querySelector(".mapboxgl-popup");
              if (popupElement) {
                const rect = popupElement.getBoundingClientRect();
                const mouseX = (window.event as MouseEvent)?.clientX || 0;
                const mouseY = (window.event as MouseEvent)?.clientY || 0;

                // Ajouter une marge de tolérance autour de la popup (15px)
                const tolerance = 15;

                // Si la souris n'est pas sur la popup ou dans la zone de tolérance, la fermer
                if (
                  mouseX < rect.left - tolerance ||
                  mouseX > rect.right + tolerance ||
                  mouseY < rect.top - tolerance ||
                  mouseY > rect.bottom + tolerance
                ) {
                  activePopupRef.current?.remove();
                  activePopupRef.current = null;
                }
              }
            }, 150); // Augmenter le délai à 150ms pour un comportement moins sensible
          }
        });
      } catch (error) {
        console.error("Erreur lors de l'affichage des voitures:", error);

        // Utiliser des données fictives en cas d'erreur
        const mockCars: Car[] = [
          {
            id: 1,
            available: true,
            autonomy: 300,
            lat: startCoords[1] + 0.02,
            lng: startCoords[0] + 0.02,
            name: "Tesla Model S",
            brand: "Tesla",
            model: "Model S",
            description: "Une voiture électrique haut de gamme",
            image: "/images/tesla-model-s.jpg",
            power: 450,
            seats: 5,
            doors: 4,
            year: 2022,
            color: "Noir",
          },
          {
            id: 2,
            available: true,
            autonomy: 350,
            lat: startCoords[1] - 0.01,
            lng: startCoords[0] + 0.01,
            name: "Tesla Model 3",
            brand: "Tesla",
            model: "Model 3",
            description: "Une voiture électrique populaire",
            image: "/images/tesla-model-3.jpg",
            power: 350,
            seats: 5,
            doors: 4,
            year: 2022,
            color: "Blanc",
          },
          {
            id: 3,
            available: true,
            autonomy: 240,
            lat: startCoords[1] + 0.01,
            lng: startCoords[0] - 0.02,
            name: "Nissan Leaf",
            brand: "Nissan",
            model: "Leaf",
            description: "Une voiture électrique compacte",
            image: "/images/nissan-leaf.jpg",
            power: 200,
            seats: 5,
            doors: 4,
            year: 2021,
            color: "Bleu",
          },
        ];

        // Convertir les données fictives en GeoJSON
        const mockGeoJson = carsToGeoJson(mockCars);
        setCarsGeoJson(mockGeoJson);

        // Ajouter une source avec les données fictives
        mapSourceRef.current = "mock-cars";
        map.addSource("mock-cars", {
          type: "geojson",
          data: mockGeoJson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        // Ajouter les mêmes couches pour les données fictives
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "mock-cars",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "rgba(59, 130, 246, 0.7)",
              5,
              "rgba(25, 118, 210, 0.7)",
              15,
              "rgba(13, 71, 161, 0.7)",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              5,
              25,
              15,
              30,
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "white",
          },
        });

        // Ajouter une couche pour afficher le nombre de points dans un cluster
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "mock-cars",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 14,
          },
          paint: {
            "text-color": "white",
          },
        });

        // Faire la même chose pour les données fictives (mock cars)
        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "mock-cars",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "rgba(59, 130, 246, 0.8)",
            "circle-radius": 12,
            "circle-stroke-width": 2,
            "circle-stroke-color": "white",
            "circle-stroke-opacity": 0.8,
          },
        });

        map.addLayer({
          id: "unclustered-point-label",
          type: "symbol",
          source: "mock-cars",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 1.5],
            "text-anchor": "top",
            "text-size": 10,
            "text-allow-overlap": false,
          },
          paint: {
            "text-color": "#333",
            "text-halo-color": "white",
            "text-halo-width": 1,
          },
        });

        // Ajouter des popups pour les points fictifs
        map.on("mouseenter", "unclustered-point", (e) => {
          if (!e.features || e.features.length === 0) return;

          // Fermer toute popup existante
          if (activePopupRef.current) {
            activePopupRef.current.remove();
            activePopupRef.current = null;
          }

          const coordinates = (
            e.features[0].geometry as GeoJSON.Point
          ).coordinates.slice() as [number, number];
          const properties = e.features[0].properties;

          if (!properties) return;

          const popupHTML = `
            <div style="max-width: 250px; padding: 10px; cursor: pointer;" class="car-popup-content">
              ${
                properties.image
                  ? `<div style="height: 100px; width: 100%; position: relative; margin-bottom: 10px; display: flex; justify-content: center; align-items: center;">
                <img src="${properties.image}" alt="${properties.name}" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
              </div>`
                  : ""
              }
              <h3 style="font-weight: bold; margin-bottom: 5px;">${
                properties.name
              }</h3>
              <p style="margin-bottom: 5px;"><b>Autonomie:</b> ${
                properties.autonomy
              } km</p>
              <p style="margin-bottom: 0;"><b>Marque:</b> ${properties.brand} ${
            properties.model
          }</p>
            </div>
          `;

          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            maxWidth: "250px",
            className: "car-popup",
            offset: 15, // Ajouter un décalage pour éloigner la popup de l'icône
          })
            .setLngLat(coordinates)
            .setHTML(popupHTML)
            .addTo(map);

          // Stocker la référence de la popup active
          activePopupRef.current = popup;

          // Ajouter un événement de clic à toute la popup
          setTimeout(() => {
            const popupContent = document.querySelector(".car-popup-content");
            if (popupContent) {
              popupContent.addEventListener("click", () => {
                setStartCoords(coordinates);
                updateStartAddressInput(
                  coordinates[0],
                  coordinates[1],
                  properties.name
                );

                // Ne pas fermer la popup, juste la transformer pour indiquer la sélection
                const popupElement = document.querySelector(
                  ".mapboxgl-popup-content"
                );
                if (popupElement) {
                  popupElement.classList.add("selected");
                  // Ajouter un style pour indiquer que le véhicule est sélectionné
                  popupElement.innerHTML += `
                    <div class="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  `;
                }

                // Mettre en évidence le cercle au lieu de le supprimer
                if (map.getLayer("unclustered-point")) {
                  map.setPaintProperty("unclustered-point", "circle-color", [
                    "case",
                    ["==", ["get", "id"], properties.id],
                    "rgba(22, 163, 74, 0.8)", // Vert pour le point sélectionné
                    "rgba(59, 130, 246, 0.8)", // Bleu pour les autres points
                  ]);

                  map.setPaintProperty(
                    "unclustered-point",
                    "circle-stroke-color",
                    [
                      "case",
                      ["==", ["get", "id"], properties.id],
                      "#16a34a", // Bordure verte pour le point sélectionné
                      "white", // Bordure blanche pour les autres points
                    ]
                  );
                }
              });
            }
          }, 10);
        });

        // Simplifier la gestion de la fermeture des popups
        map.on("mouseleave", "unclustered-point", () => {
          if (activePopupRef.current) {
            // Ajouter un délai plus long pour permettre le passage de la souris sur la popup
            setTimeout(() => {
              // Vérifier si la souris est sur la popup
              const popupElement = document.querySelector(".mapboxgl-popup");
              if (popupElement) {
                const rect = popupElement.getBoundingClientRect();
                const mouseX = (window.event as MouseEvent)?.clientX || 0;
                const mouseY = (window.event as MouseEvent)?.clientY || 0;

                // Ajouter une marge de tolérance autour de la popup (15px)
                const tolerance = 15;

                // Si la souris n'est pas sur la popup ou dans la zone de tolérance, la fermer
                if (
                  mouseX < rect.left - tolerance ||
                  mouseX > rect.right + tolerance ||
                  mouseY < rect.top - tolerance ||
                  mouseY > rect.bottom + tolerance
                ) {
                  activePopupRef.current?.remove();
                  activePopupRef.current = null;
                }
              }
            }, 150); // Augmenter le délai à 150ms pour un comportement moins sensible
          }
        });
      }
    };

    fetchAndDisplayCars();

    // Nettoyer les événements lors du démontage du composant
    return () => {
      if (map) {
        // Fermer toute popup active lors du nettoyage
        if (activePopupRef.current) {
          activePopupRef.current.remove();
          activePopupRef.current = null;
        }

        try {
          // Vérifier et supprimer les couches liées à mock-cars
          if (map.getLayer("unclustered-point-label"))
            map.removeLayer("unclustered-point-label");
          if (map.getLayer("unclustered-point"))
            map.removeLayer("unclustered-point");
          if (map.getLayer("cluster-count")) map.removeLayer("cluster-count");
          if (map.getLayer("clusters")) map.removeLayer("clusters");
          if (mapSourceRef.current && map.getSource(mapSourceRef.current)) {
            map.removeSource(mapSourceRef.current);
          }
        } catch (error) {
          console.error("Erreur lors de la suppression des couches:", error);
        }
      }
    };
  }, [map, startCoords]);

  useEffect(() => {
    if (map && routeRequested && startCoords && endCoords) {
      const getRoute = async (
        start: [number, number],
        end: [number, number]
      ) => {
        // Ajout de l'option exclude=toll si avoidTolls est true
        const excludeParam = avoidTolls ? "&exclude=toll" : "";

        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&overview=full&alternatives=false&annotations=duration,distance,speed${excludeParam}&access_token=${mapboxgl.accessToken}`
        );
        const json = await query.json();
        const route = json.routes[0];
        const data = route.geometry;
        const distance = route.distance; // en mètres
        const duration = route.duration; // en secondes

        // Stocker les informations d'itinéraire dans le contexte
        setRouteInfo({
          distance,
          duration,
        });

        console.log("Distance (m) :", distance);
        console.log("Durée (s) :", duration);
        console.log("Éviter les péages:", avoidTolls);

        if (map.getSource("route")) {
          (map.getSource("route") as mapboxgl.GeoJSONSource).setData(data);
        } else {
          map.addSource("route", {
            type: "geojson",
            data: data,
          });

          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#3887be",
              "line-width": 5,
              "line-opacity": 0.75,
            },
          });
        }

        // Animer la caméra pour montrer l'itinéraire complet
        const midpoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2] as [
          number,
          number
        ];

        // D'abord, nous éloignons la caméra pour préparer l'animation complète
        map.flyTo({
          center: midpoint,
          zoom: 10,
          speed: 0.5,
          curve: 1,
          essential: true,
        });

        // Ensuite, nous ajustons les limites pour voir l'itinéraire complet
        setTimeout(() => {
          // Ajuster la vue de la carte pour montrer l'itinéraire complet
          const bounds = new mapboxgl.LngLatBounds();

          // Ajouter les points de départ et d'arrivée aux limites
          bounds.extend(start);
          bounds.extend(end);

          // Ajouter tous les points du tracé aux limites
          route.geometry.coordinates.forEach((point: [number, number]) => {
            bounds.extend(point);
          });

          // Ajuster la vue avec animation
          map.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 }, // Ajouter de la marge autour du tracé
            maxZoom: 14, // Limiter le zoom maximum pour les courtes distances
            duration: 1500, // Animation plus douce
            easing: (t) => t * (2 - t), // Fonction d'accélération personnalisée
          });

          // Après avoir montré l'itinéraire complet, recentrer sur le point de départ
          setTimeout(() => {
            // Calculer l'angle d'orientation vers le premier segment de l'itinéraire
            if (route.geometry.coordinates.length > 1) {
              const firstPoint = route.geometry.coordinates[0];
              const secondPoint = route.geometry.coordinates[1];

              // Calculer l'angle entre le point de départ et le premier point de l'itinéraire
              const angle =
                (Math.atan2(
                  secondPoint[1] - firstPoint[1],
                  secondPoint[0] - firstPoint[0]
                ) *
                  180) /
                Math.PI;

              // Orienter la caméra dans le sens de la direction
              map.flyTo({
                center: start,
                zoom: 14,
                speed: 0.5,
                duration: 2000,
                curve: 1,
                bearing: angle, // Ajouter une rotation de la caméra
                pitch: 45, // Incliner la caméra pour une vue en perspective
                essential: true,
              });
            } else {
              // Si pas assez de points dans l'itinéraire, utiliser l'animation standard
              map.flyTo({
                center: start,
                zoom: 14,
                speed: 0.5,
                duration: 2000,
                curve: 1,
                essential: true,
              });
            }
          }, 3000);
        }, 800);
      };

      getRoute(startCoords, endCoords);
      setRouteRequested(false);
    }
  }, [
    map,
    routeRequested,
    startCoords,
    endCoords,
    setRouteRequested,
    setRouteInfo,
    avoidTolls,
  ]);

  useEffect(() => {
    if (!map) return;

    // Supprimer les marqueurs précédents
    if (startMarkerRef.current) {
      startMarkerRef.current.remove();
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      endMarkerRef.current.remove();
      endMarkerRef.current = null;
    }

    // Supprimer également le tracé de l'itinéraire lorsque les coordonnées changent
    if (map.getSource("route")) {
      try {
        // Supprimer la couche avant la source
        if (map.getLayer("route")) {
          map.removeLayer("route");
        }
        map.removeSource("route");
      } catch (error) {
        console.error("Erreur lors de la suppression du tracé:", error);
      }
    }

    // Ajouter de nouveaux marqueurs si les coordonnées sont définies
    if (startCoords) {
      startMarkerRef.current = new mapboxgl.Marker({ color: "blue" })
        .setLngLat(startCoords)
        .setPopup(new mapboxgl.Popup().setHTML("<h3>Départ</h3>"))
        .addTo(map);

      // Animer et centrer la carte sur le point de départ
      map.flyTo({
        center: startCoords,
        zoom: 14,
        speed: 1.2,
        curve: 1.42,
        essential: true,
      });
    }

    if (endCoords) {
      endMarkerRef.current = new mapboxgl.Marker({ color: "green" })
        .setLngLat(endCoords)
        .setPopup(new mapboxgl.Popup().setHTML("<h3>Arrivée</h3>"))
        .addTo(map);
    }
  }, [map, startCoords, endCoords]);

  // Ajouter spécifiquement pour les popups une gestion du mouseenter
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      if (!activePopupRef.current) return;

      // Trouver l'élément popup
      const popupElement = document.querySelector(".mapboxgl-popup");
      if (popupElement && e.target && popupElement.contains(e.target as Node)) {
        // La souris est entrée dans la popup, on veut la garder ouverte
        if (activePopupRef.current) {
          const popupWithTimeout = activePopupRef.current as unknown as {
            _closeTimeout?: NodeJS.Timeout;
          };
          if (popupWithTimeout._closeTimeout) {
            clearTimeout(popupWithTimeout._closeTimeout);
          }
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver);

    // Nettoyage de l'événement lors du démontage
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default MapDisplay;

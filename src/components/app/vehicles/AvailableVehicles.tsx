"use client";

import React, { useEffect, useState } from "react";
import { useMapContext } from "@/providers/MapContext";
import Image from "next/image";

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

const AvailableVehicles: React.FC = () => {
  const { startCoords, routeInfo, setStartCoords, endCoords, triggerRoute } =
    useMapContext();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      if (!startCoords) return;

      setLoading(true);
      setIsVisible(false);

      try {
        // Construire l'URL de l'API avec les coordonnées et la distance du trajet (si disponible)
        let apiUrl = `/api/cars?lat=${startCoords[1]}&lng=${startCoords[0]}&radius=100`;

        // Si des informations d'itinéraire sont disponibles, ajouter la distance à l'URL
        if (routeInfo) {
          apiUrl += `&routeDistance=${routeInfo.distance}`;
        }

        const response = await fetch(apiUrl);
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des véhicules");

        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des véhicules:", error);
        // Utilisons des données fictives pour la démo en cas d'erreur
        setCars(mockCars);
      } finally {
        setLoading(false);
        // Déclencher l'animation après le chargement des données
        setTimeout(() => setIsVisible(true), 100);
      }
    };

    fetchCars();
  }, [startCoords, routeInfo]);

  if (!startCoords) return null;

  // Styles CSS dynamiques
  const containerStyle = {
    transform: isVisible ? "translateX(0)" : "translateX(-100%)",
    opacity: isVisible ? 1 : 0,
    transition: "transform 0.5s ease-out, opacity 0.5s ease-out",
  };

  // Fonction pour évaluer l'adéquation du véhicule par rapport au trajet
  const getRecommendationStatus = (
    autonomy: number
  ): { text: string; color: string } => {
    if (!routeInfo) {
      return { text: "Non évalué", color: "bg-gray-100 text-gray-800" };
    }

    const distanceKm = routeInfo.distance / 1000;
    const ratio = autonomy / distanceKm;

    if (ratio < 1) {
      return {
        text: "Autonomie insuffisante",
        color: "bg-red-100 text-red-800",
      };
    } else if (ratio < 1.3) {
      return {
        text: "Juste suffisant",
        color: "bg-yellow-100 text-yellow-800",
      };
    } else if (ratio < 2) {
      return { text: "Recommandé", color: "bg-green-100 text-green-800" };
    } else {
      return {
        text: "Parfaitement adapté",
        color: "bg-blue-100 text-blue-800",
      };
    }
  };

  // Fonction pour sélectionner une voiture
  const handleSelectCar = (car: Car) => {
    // Mettre à jour le point de départ avec les coordonnées de la voiture
    setStartCoords([car.lng, car.lat]);
    setSelectedCarId(car.id);

    // Mettre à jour l'input avec l'adresse correspondante (géocodage inverse)
    const updateAddressInput = async () => {
      try {
        // Utiliser l'API de géocodage inverse de Mapbox pour obtenir l'adresse
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${car.lng},${car.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&language=fr&types=address,poi,place`
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

              // Ajouter un effet visuel pour mettre en évidence la mise à jour
              startInput.classList.add("highlight-update");
              setTimeout(() => {
                startInput.classList.remove("highlight-update");
              }, 1000);

              // Ajouter le style pour l'animation highlight si nécessaire
              const style = document.createElement("style");
              style.textContent = `
                @keyframes highlight {
                  0% { background-color: rgba(59, 130, 246, 0.2); }
                  100% { background-color: transparent; }
                }
                .highlight-update {
                  animation: highlight 1s ease-out;
                }
              `;
              document.head.appendChild(style);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'adresse:", error);
      }
    };

    // Appeler la fonction pour mettre à jour l'adresse
    updateAddressInput();

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

    // Petit message pour informer l'utilisateur
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-50 shadow-lg text-sm";
    toast.textContent = `Position de départ mise à jour: ${car.name}`;
    document.body.appendChild(toast);

    // Supprimer le toast après 3 secondes
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.5s ease";
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 3000);
  };

  return (
    <div
      className="fixed left-2 bottom-2 w-64 bg-white/30 backdrop-blur-md shadow-lg z-40 overflow-y-auto p-3 border border-white/40 rounded-lg"
      style={{
        ...containerStyle,
        maxHeight: "calc(100vh - 120px)",
      }}
    >
      <h2 className="text-base font-bold mb-2 text-gray-800">
        Véhicules disponibles
      </h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-sm text-gray-700">Chargement des véhicules...</p>
        </div>
      ) : cars.length === 0 ? (
        <div className="bg-white/40 rounded-lg p-3 backdrop-blur-sm border border-white/40">
          <p className="text-sm text-gray-700">
            {routeInfo
              ? "Aucun véhicule avec l'autonomie suffisante pour ce trajet."
              : "Aucun véhicule disponible dans cette zone."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cars.map((car) => {
            const recommendation = getRecommendationStatus(car.autonomy);
            return (
              <div
                key={car.id}
                className={`border rounded-lg p-2 hover:shadow-md transition-shadow bg-white/40 backdrop-blur-sm relative ${
                  selectedCarId === car.id
                    ? "border-blue-500 shadow-md"
                    : "border-white/40"
                }`}
              >
                {routeInfo && (
                  <div className="absolute top-1 right-1 z-10">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${recommendation.color}`}
                    >
                      {recommendation.text}
                    </span>
                  </div>
                )}
                <div className="relative h-28 mb-1">
                  {car.image && (
                    <Image
                      src={car.image}
                      alt={car.name}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  )}
                </div>
                <h3 className="font-bold text-sm text-gray-800">{car.name}</h3>
                <div className="grid grid-cols-2 gap-1 text-xs mt-1 text-gray-700">
                  <div>
                    <span className="font-medium">Marque:</span> {car.brand}
                  </div>
                  <div>
                    <span className="font-medium">Modèle:</span> {car.model}
                  </div>
                  <div>
                    <span className="font-medium">Autonomie:</span>{" "}
                    {car.autonomy} km
                  </div>
                  <div>
                    <span className="font-medium">Puissance:</span> {car.power}{" "}
                    ch
                  </div>
                  <div>
                    <span className="font-medium">Places:</span> {car.seats}
                  </div>
                  <div>
                    <span className="font-medium">Couleur:</span> {car.color}
                  </div>
                </div>
                {routeInfo && (
                  <div className="mt-1 mb-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium">Distance trajet:</span>
                      <span>
                        {(routeInfo.distance / 1000)
                          .toFixed(1)
                          .replace(".", ",")}{" "}
                        km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Autonomie restante:</span>
                      <span
                        className={
                          car.autonomy - routeInfo.distance / 1000 < 50
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {Math.max(0, car.autonomy - routeInfo.distance / 1000)
                          .toFixed(1)
                          .replace(".", ",")}{" "}
                        km
                      </span>
                    </div>
                  </div>
                )}
                <button
                  className="w-full mt-2 bg-blue-500/80 hover:bg-blue-600/90 text-white py-1.5 rounded text-xs backdrop-blur-sm transition-colors"
                  onClick={() => handleSelectCar(car)}
                >
                  Sélectionner
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Données de test en cas d'échec de l'API
const mockCars: Car[] = [
  {
    id: 1,
    available: true,
    autonomy: 300,
    lat: 44.84,
    lng: -0.57,
    image:
      "https://www.beev.co/wp-content/uploads/2023/09/21ee09d6-43bd-4fd0-9c18-72a16e127f5f-9qrtqg.png",
    name: "Tesla Model S",
    description:
      "La Tesla Model S est une berline électrique haute performance.",
    power: 1000,
    seats: 5,
    doors: 4,
    brand: "Tesla",
    model: "Model S",
    year: 2023,
    color: "Red",
  },
  {
    id: 2,
    available: true,
    autonomy: 350,
    lat: 44.85,
    lng: -0.58,
    image:
      "https://adhgfzvyfq.cloudimg.io/v7/https://id-cs.com/media/car_images/car_901/Model_3_Pearl_White_Multi-Coat.png?force_format=webp",
    name: "Tesla Model 3",
    description:
      "La Tesla Model 3 est une voiture électrique abordable et efficace.",
    power: 450,
    seats: 5,
    doors: 4,
    brand: "Tesla",
    model: "Model 3",
    year: 2023,
    color: "Blue",
  },
  {
    id: 3,
    available: true,
    autonomy: 240,
    lat: 44.83,
    lng: -0.56,
    image:
      "https://www.pngplay.com/wp-content/uploads/13/Nissan-Leaf-Transparent-Free-PNG.png",
    name: "Nissan Leaf",
    description:
      "La Nissan Leaf est l'une des voitures électriques les plus populaires au monde.",
    power: 150,
    seats: 5,
    doors: 4,
    brand: "Nissan",
    model: "Leaf",
    year: 2022,
    color: "Silver",
  },
];

export default AvailableVehicles;

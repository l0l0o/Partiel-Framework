import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseInt(searchParams.get("radius") || "100"); // rayon en km
    const routeDistance = parseFloat(searchParams.get("routeDistance") || "0"); // distance du trajet en mètres

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Latitude et longitude requises" },
        { status: 400 }
      );
    }

    // Conversion du rayon en degrés approximatifs (1 degré ≈ 111 km)
    const radiusInDegrees = radius / 111;

    // Recherche des voitures disponibles dans le rayon spécifié
    let cars = await prisma.car.findMany({
      where: {
        available: true,
        lat: {
          gte: lat - radiusInDegrees,
          lte: lat + radiusInDegrees,
        },
        lng: {
          gte: lng - radiusInDegrees,
          lte: lng + radiusInDegrees,
        },
      },
    });

    // Filtrage plus précis avec calcul de distance euclidienne
    cars = cars.filter((car) => {
      // Calcul de la distance approximative en utilisant la distance euclidienne
      const distanceFromStart = Math.sqrt(
        Math.pow((car.lat - lat) * 111, 2) +
          Math.pow((car.lng - lng) * 111 * Math.cos((lat * Math.PI) / 180), 2)
      );
      return distanceFromStart <= radius;
    });

    // Filtrer les voitures qui n'ont pas l'autonomie suffisante pour le trajet
    if (routeDistance > 0) {
      // Convertir la distance du trajet de mètres à kilomètres
      const routeDistanceInKm = routeDistance / 1000;

      // Filtrer les voitures qui n'ont pas l'autonomie suffisante
      cars = cars.filter((car) => car.autonomy >= routeDistanceInKm);
    }

    // Trier les voitures par adéquation avec le trajet
    // - Si un trajet est spécifié, trier par ratio d'autonomie/distance (privilégier les véhicules avec une autonomie adaptée)
    // - Sinon, trier par autonomie décroissante
    if (routeDistance > 0) {
      const routeDistanceInKm = routeDistance / 1000;
      cars = cars.sort((a, b) => {
        // Calculer le ratio d'autonomie par rapport à la distance
        const ratioA = a.autonomy / routeDistanceInKm;
        const ratioB = b.autonomy / routeDistanceInKm;

        // Un ratio proche de 1.5-2 est idéal (ni trop juste, ni trop élevé)
        const optimalRatio = 1.75;
        const scoreA = Math.abs(ratioA - optimalRatio);
        const scoreB = Math.abs(ratioB - optimalRatio);

        // Trier par score croissant (plus le score est petit, plus le véhicule est adapté)
        return scoreA - scoreB;
      });
    } else {
      // Si pas de trajet spécifié, trier par autonomie décroissante
      cars = cars.sort((a, b) => b.autonomy - a.autonomy);
    }

    return NextResponse.json(cars);
  } catch (error) {
    console.error("Erreur lors de la récupération des voitures:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

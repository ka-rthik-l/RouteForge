import { Stop } from "@/types";

/** Default Kochi metro delivery route — deliberately naive order for demo. */
export const kochiDefaultStops: Stop[] = [
  {
    id: "0",
    name: "Depot — Kaloor Hub",
    address: "Kaloor Junction, Ernakulam",
    lat: 9.9945,
    lng: 76.2922,
    eta: "—",
    isDepot: true,
  },
  {
    id: "1",
    name: "Fort Kochi Cafe",
    address: "Fort Kochi, Kochi",
    lat: 9.9656,
    lng: 76.2409,
    eta: "—",
  },
  {
    id: "2",
    name: "Lulu Mall",
    address: "Edappally, Kochi",
    lat: 10.0274,
    lng: 76.308,
    eta: "—",
  },
  {
    id: "3",
    name: "InfoPark Kakkanad",
    address: "Kakkanad, Kochi",
    lat: 10.015,
    lng: 76.3408,
    eta: "—",
  },
  {
    id: "4",
    name: "Marine Drive",
    address: "Marine Drive, Kochi",
    lat: 9.9784,
    lng: 76.281,
    eta: "—",
  },
  {
    id: "5",
    name: "Vytilla Mobility Hub",
    address: "Vytilla, Kochi",
    lat: 9.9699,
    lng: 76.3211,
    eta: "—",
  },
];

/** Kochi metro centre — used when scattering new stops on the map. */
export const KOCHI_CENTER = { lat: 9.985, lng: 76.29 };

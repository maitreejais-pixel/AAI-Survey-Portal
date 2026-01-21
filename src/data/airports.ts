export interface Airport {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const airports: Airport[] = [
  {
    code: "DEL",
    name: "Indira Gandhi International Airport",
    latitude: 28.5562,
    longitude: 77.1,
  },
  {
    code: "BOM",
    name: "Chhatrapati Shivaji Maharaj International Airport",
    latitude: 28.5845, // as per your input
    longitude: 77.2058, // as per your input
  },
];

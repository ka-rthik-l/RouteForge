export interface Stop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  eta?: string;          // calculated after optimization
  order?: number;        // position in optimized route
  isDepot?: boolean;
}

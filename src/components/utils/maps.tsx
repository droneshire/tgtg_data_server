import React, { FC } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useQuery } from "react-query";
import { GOOGLE_MAPS_API_KEY } from "utils/constants";
import { Region } from "types/user";

export type MarkerType = {
  id: string;
  location: google.maps.LatLngLiteral;
  name: string;
  phone_number: string;
  website: string;
};

export interface MapProps {
  updateRegion: (region: Region) => void;
  isUpdating: boolean;
}
export const MapsModal: FC<MapProps> = ({ updateRegion, isUpdating }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const mapRef = React.useRef<google.maps.Map | null>(null);

  const [clickedPos, setClickedPos] = React.useState<google.maps.LatLngLiteral>(
    {} as google.maps.LatLngLiteral
  );
  const [selectedMarker, setSelectedMarker] = React.useState<MarkerType>(
    {} as MarkerType
  );

  const moveTo = (position: google.maps.LatLngLiteral) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat: position.lat, lng: position.lng });
      mapRef.current.setZoom(12);
      setClickedPos(position);
    }
  };

  const onLoad = (map: google.maps.Map): void => {
    mapRef.current = map;
  };

  const onUnMount = (): void => {
    mapRef.current = null;
  };

  const onMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng === undefined) {
      return;
    }

    
    setClickedPos({
      lattitude: event.latLng.lat(),
      longitude: event.latLng.lng(),
    });
    setSelectedMarker({} as MarkerType);
  };

  const onMarkerClick = (marker: MarkerType) => setSelectedMarker(marker);

  if (!isLoaded) return <div>Map Loading ...</div>;
};

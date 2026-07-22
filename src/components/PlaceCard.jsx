import { MapPin } from "lucide-react";

export function PlaceCard({ place }) {
  return (
    <div className="place-card">
      <img src={place.image} alt={place.name} className="place-image" />
      <div className="place-info">
        <h3>{place.name}</h3>
        <p className="place-description">{place.description}</p>
        <div className="place-address">
          {/* <MapPin size={16} color="#38bdf8" />
          <span>{place.address}</span> */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="place-address-link"
          >
            <MapPin size={16} /> <span>{place.address}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

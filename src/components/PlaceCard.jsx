import { MapPin } from "lucide-react";

import "./PlaceCard.css";
export function PlaceCard({ place }) {
  return (
    <div className="place-card">
      <img src={place.image} alt={place.name} className="place-image" />
      <div className="place-info">
        <h3>{place.name}</h3>
        <p className="place-description">{place.description}</p>
        <div className="place-address">
          {Array.isArray(place.address) && place.address.length > 0 ? (
            place.address.map((addr, index) => (
              <div
                key={index}
                className="flex items-center gap-1 text-sm text-gray-300"
              >
                <a
  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.name}, ${addr}`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="place-address-link"
>
  <span>📍</span>
                <span>{addr}</span>
</a>
                
              </div>
            ))
          ) : (
            <span className="text-sm text-gray-400">📍 Адреса не вказана</span>
          )}
        </div>
      </div>
    </div>
  );
}

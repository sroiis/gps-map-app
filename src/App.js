import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapPage() {
  const [position, setPosition] = useState(null);
  const [place, setPlace] = useState("Fetching place...");
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`
          );
          const data = await response.json();
          if (data && data.address) {
            const { city, town, village, state, country } = data.address;
            const placeName = city || town || village || state || country || "Unknown place";
            setPlace(placeName);
          } else {
            setPlace("Place not found");
          }
        } catch (error) {
          console.error(error);
          setPlace("Error fetching place");
        }
      },
      (err) => {
        console.error(err);
        alert("Enable location access!");
        setPlace("Location not available");
      }
    );

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        navigate("/coords");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="p-4 text-center font-semibold text-lg bg-gray-100">
        Current Place: {place}
        <div className="text-sm font-normal text-gray-600 mt-1">
          Press <kbd>Enter</kbd> to view your coordinates
        </div>
      </div>

      <div className="flex-grow">
        {position ? (
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            <Marker position={position} />
          </MapContainer>
        ) : (
          <div className="text-center mt-20 text-xl">Getting your location...</div>
        )}
      </div>
    </div>
  );
}

function CoordsPage() {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => {
        console.error(err);
        alert("Couldn't fetch GPS coordinates.");
      }
    );
  }, []);

  return (
    <div className="text-center mt-20 text-xl">
      {coords ? (
        <div>
          <p>📍 Your GPS Coordinates:</p>
          <p>Latitude: {coords.lat}</p>
          <p>Longitude: {coords.lon}</p>
        </div>
      ) : (
        <p>Loading coordinates...</p>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/coords" element={<CoordsPage />} />
      </Routes>
    </Router>
  );
}

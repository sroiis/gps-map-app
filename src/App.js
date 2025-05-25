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
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error(err);
        alert("Enable location access!");
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
    <div className="h-screen w-full">
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



"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { TrackingData } from "../../../lib/helper/types";
import Navbar from "../components/navbar";

function TrackShipment() {
  const [labelId, setLabelId] = useState(""); 
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 
  const [isOffline, setIsOffline] = useState(false); // To check if the user is offline

  const searchParams = useSearchParams();
  const router = useRouter();
  const queryLabelId = searchParams?.get("labelId") || ""; 

  useEffect(() => {
    const checkOfflineStatus = () => {
      setIsOffline(!navigator.onLine);  
    };

    window.addEventListener('offline', checkOfflineStatus);
    window.addEventListener('online', checkOfflineStatus);

    return () => {
      window.removeEventListener('offline', checkOfflineStatus);
      window.removeEventListener('online', checkOfflineStatus);
    };
  }, []);

  useEffect(() => {
    if (queryLabelId) {
      setLabelId(queryLabelId); 
      handleSubmit(queryLabelId); 
    }
  }, [queryLabelId]);

  const handleSubmit = async (labelId: string) => {
    if (!labelId) {
      setError("Label ID is required.");
      return;
    }

    setLoading(true); 
    setError(null); 

    try {
      router.replace(`/tracking?labelId=${labelId}`);

      const response = await axios.get(`/api/shipengine/tracking/${labelId}`);
      setTrackingData(response.data); 
    } catch (err) {
      console.error("Error tracking shipment:", err);
      setError("Failed to track shipment. Please check the label ID and try again.");
    } finally {
      setLoading(false); 
    }
  };

  // Display offline message
  if (isOffline) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-2xl font-semibold text-red-500">
          <p>YOU ARE OFFLINE!</p>
          <p className="text-lg text-black mt-2">Please check your internet connection to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-black py-8 text-black">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Track Your Shipment</h1>

          {/* Shipment Tracking Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(labelId);
            }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex flex-col space-y-4">
              <label htmlFor="labelId" className="text-3xl font-bold text-orange-500">
                Enter Label ID or Tracking Number:
              </label>
              <input
                type="text"
                id="labelId"
                value={labelId}
                onChange={(e) => setLabelId(e.target.value)}
                className="p-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter label ID"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors disabled:bg-blue-300"
              >
                {loading ? "Tracking..." : "Track Shipment"}
              </button>
            </div>
          </form>

          {/* Error message */}
          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Display Tracking Data */}
          {trackingData && (
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Tracking Details</h2>
              <div className="space-y-4">
                <p>
                  <span className="font-semibold">Tracking Number:</span>{" "}
                  {trackingData.trackingNumber}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  {trackingData.statusDescription}
                </p>
                <p>
                  <span className="font-semibold">Carrier Status:</span>{" "}
                  {trackingData.carrierStatusDescription || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Estimated Delivery:</span>{" "}
                  {trackingData.estimatedDeliveryDate || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Actual Delivery:</span>{" "}
                  {trackingData.actualDeliveryDate || "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackShipment />
    </Suspense>
  );
}

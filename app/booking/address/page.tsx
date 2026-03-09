"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookingProgressBar,
  BookingContainer,
} from "@/components/booking/BookingProgressBar";
import { FormInput, FormActions } from "@/components/booking/FormComponents";

const STEPS = [
  { name: "size", label: "Size" },
  { name: "dates", label: "Dates" },
  { name: "address", label: "Address" },
  { name: "details", label: "Info" },
  { name: "review", label: "Review" },
];

export default function BookingAddressPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("MO");
  const [zip, setZip] = useState("");

  useEffect(() => {
    const sizeId = sessionStorage.getItem("booking_size_id");
    if (!sizeId) {
      router.push("/booking");
    }
  }, [router]);

  const handleUseMyLocation = () => {
    setIsLocating(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

          if (!apiKey) {
            setError("Google Maps API key not configured");
            setIsLocating(false);
            return;
          }

          // Use Google Maps Geocoding API to reverse geocode
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
          );

          const data = await response.json();

          if (data.status === "OK" && data.results.length > 0) {
            const result = data.results[0];
            const components = result.address_components;

            // Extract address components
            let streetNumber = "";
            let route = "";
            let foundCity = "";
            let foundState = "";
            let foundZip = "";

            components.forEach((component: any) => {
              const types = component.types;
              if (types.includes("street_number")) {
                streetNumber = component.long_name;
              } else if (types.includes("route")) {
                route = component.long_name;
              } else if (types.includes("locality")) {
                foundCity = component.long_name;
              } else if (types.includes("administrative_area_level_1")) {
                foundState = component.short_name;
              } else if (types.includes("postal_code")) {
                foundZip = component.long_name;
              }
            });

            // Autofill the form
            if (streetNumber && route) {
              setAddressLine1(`${streetNumber} ${route}`);
            }
            if (foundCity) setCity(foundCity);
            if (foundState) setState(foundState);
            if (foundZip) setZip(foundZip);
          } else {
            setError("Could not find address for your location");
          }
        } catch (err) {
          setError("Error fetching address. Please try again.");
          console.error("Geocoding error:", err);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("Location access denied. Please enter address manually.");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information unavailable");
            break;
          case error.TIMEOUT:
            setError("Location request timed out");
            break;
          default:
            setError("Error getting location");
        }
      },
    );
  };

  const handleBack = () => {
    router.push("/booking/dates");
  };

  const handleContinue = async () => {
    setError("");

    if (!addressLine1 || !city || !state || !zip) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      sessionStorage.setItem("booking_address_line1", addressLine1);
      sessionStorage.setItem("booking_address_line2", addressLine2);
      sessionStorage.setItem("booking_city", city);
      sessionStorage.setItem("booking_state", state);
      sessionStorage.setItem("booking_zip", zip);

      router.push("/booking/details");
    } catch (err) {
      setError("Error saving address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BookingContainer
      title="Delivery Address"
      description="Where should we deliver your dumpster?"
      showHeader={true}
    >
      <BookingProgressBar
        currentStep={2}
        totalSteps={STEPS.length}
        steps={STEPS}
      />

      <div className="max-w-2xl">
        {/* Use My Location Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-5 h-5 ${isLocating ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isLocating ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              )}
            </svg>
            {isLocating ? "Getting location..." : "Use My Location"}
          </button>
          <p className="text-sm text-white/60 mt-2">
            Click to automatically fill in your address using your current
            location
          </p>
        </div>

        <div className="space-y-6">
          <FormInput
            label="Street Address"
            name="address-line1"
            autoComplete="address-line1"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="123 Main Street"
            required
          />

          <FormInput
            label="Apartment, Suite, etc."
            name="address-line2"
            autoComplete="address-line2"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Apt 4B (optional)"
          />

          <div className="grid md:grid-cols-2 gap-6">
            <FormInput
              label="City"
              name="address-level2"
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Columbia"
              required
            />

            <FormInput
              label="State"
              name="address-level1"
              autoComplete="address-level1"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              maxLength={2}
              required
            />
          </div>

          <FormInput
            label="ZIP Code"
            name="postal-code"
            autoComplete="postal-code"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="65201"
            pattern="[0-9]{5}(-[0-9]{4})?"
            required
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        <FormActions
          onBack={handleBack}
          onNext={handleContinue}
          nextLabel="Continue to Details"
          isLoading={isLoading}
        />
      </div>
    </BookingContainer>
  );
}

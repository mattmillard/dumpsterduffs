"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookingProgressBar,
  BookingContainer,
} from "@/components/booking/BookingProgressBar";
import { FormInput, FormActions } from "@/components/booking/FormComponents";
import { PriceSummary } from "@/components/booking/PriceSummary";
import {
  getMinimumDeliveryDate,
  getMaximumDeliveryDate,
  calculatePickupDate,
  calculatePriceEstimate,
} from "@/lib/utils/pricing";
import { DumpsterSizeOption } from "@/types/booking";

const STEPS = [
  { name: "size", label: "Size" },
  { name: "dates", label: "Dates" },
  { name: "address", label: "Address" },
  { name: "details", label: "Info" },
  { name: "review", label: "Review" },
];

export default function BookingDatesPage() {
  const router = useRouter();
  const [deliveryDate, setDeliveryDate] = useState("");
  const [rentalDays, setRentalDays] = useState(3);
  const [sizes, setSizes] = useState<DumpsterSizeOption[]>([]);
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [availabilityWarning, setAvailabilityWarning] = useState<string>("");

  useEffect(() => {
    async function loadSizesAndSelection() {
      const response = await fetch("/api/public/sizes", { cache: "no-store" });
      const data = (await response.json()) as DumpsterSizeOption[];
      setSizes(data || []);

      const activeSizes = data.filter((size) => size.is_active !== false);
      const defaultId = activeSizes[0]?.id || data[0]?.id || "";
      const sizeId = sessionStorage.getItem("booking_size_id") || defaultId;
      const validSizeId = data.some((size) => size.id === sizeId)
        ? sizeId
        : defaultId;

      if (!validSizeId) {
        setError("No dumpster sizes are available.");
        return;
      }

      sessionStorage.setItem("booking_size_id", validSizeId);
      setSelectedSizeId(validSizeId);

      const minDate = getMinimumDeliveryDate(1);
      setDeliveryDate(minDate);
    }

    loadSizesAndSelection();
  }, [router]);

  const selectedSize = sizes.find((s) => s.id === selectedSizeId);
  const pickupDate = deliveryDate
    ? calculatePickupDate(deliveryDate, rentalDays)
    : "";
  const priceEstimate = selectedSize
    ? calculatePriceEstimate(selectedSize, rentalDays)
    : null;

  // Check availability when delivery date changes
  useEffect(() => {
    async function checkAvailability() {
      if (!deliveryDate || !selectedSize) return;

      setAvailabilityWarning("");

      try {
        const response = await fetch(
          `/api/public/availability?date=${deliveryDate}`,
        );
        const availability = await response.json();

        // Check if selected size is blocked
        const sizeYards = selectedSize.size_yards;
        const sizeAvailability = availability.sizes?.find(
          (sa: any) => sa.size_yards === sizeYards,
        );

        // Show warning if date is NOT bookable or has blocking reasons
        if (
          sizeAvailability && 
          !sizeAvailability.isBookable
        ) {
          const reason =
            availability.blockedReasons?.[0] ||
            "This date is not available for booking";
          setAvailabilityWarning(reason);
        }
      } catch (err) {
        console.error("Error checking availability:", err);
      }
    }

    checkAvailability();
  }, [deliveryDate, selectedSize]);

  const handleBack = () => {
    router.push("/booking");
  };

  const handleContinue = async () => {
    setError("");

    if (!deliveryDate) {
      setError("Please select a delivery date");
      return;
    }

    if (rentalDays < 1 || rentalDays > 365) {
      setError("Invalid rental duration");
      return;
    }

    // Check if date has availability warning
    if (availabilityWarning) {
      setError(
        `Cannot proceed: ${availabilityWarning}. Please select a different date.`,
      );
      return;
    }

    setIsLoading(true);
    try {
      // Double-check availability before proceeding
      const response = await fetch(
        `/api/public/availability?date=${deliveryDate}`,
      );
      const availability = await response.json();

      const sizeYards = selectedSize?.size_yards;
      const sizeAvailability = availability.sizes?.find(
        (sa: any) => sa.size_yards === sizeYards,
      );

      if (sizeAvailability && !sizeAvailability.isBookable) {
        setError(
          "This date is no longer available. Please select a different date.",
        );
        setIsLoading(false);
        return;
      }

      // Store dates in session
      sessionStorage.setItem("booking_delivery_date", deliveryDate);
      sessionStorage.setItem("booking_rental_days", rentalDays.toString());
      sessionStorage.setItem("booking_pickup_date", pickupDate);

      router.push("/booking/address");
    } catch (err) {
      setError("Error validating availability. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BookingContainer
      title="Select Rental Dates"
      description="Choose your delivery and pickup dates. All bookings are 24-hour periods."
      showHeader={true}
    >
      <BookingProgressBar
        currentStep={1}
        totalSteps={STEPS.length}
        steps={STEPS}
      />

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-2">
          <div className="space-y-6">
            <FormInput
              label="Delivery Date"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={getMinimumDeliveryDate(1)}
              max={getMaximumDeliveryDate(90)}
              required
            />

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Rental Duration
                <span className="text-primary ml-1">*</span>
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={rentalDays}
                  onChange={(e) =>
                    setRentalDays(Math.max(1, parseInt(e.target.value) || 0))
                  }
                  className="input-field flex-1 text-center"
                />
                <span className="text-white font-semibold whitespace-nowrap">
                  {rentalDays} day{rentalDays !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-[#999999] mt-2">
                Pickup Date: {new Date(pickupDate).toLocaleDateString()}
              </p>
            </div>

            {availabilityWarning && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-500 text-xl">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-yellow-500 mb-1">
                      Date Not Available
                    </p>
                    <p className="text-sm text-yellow-400">
                      {availabilityWarning}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>

          <FormActions
            onBack={handleBack}
            onNext={handleContinue}
            nextLabel="Continue to Address"
            isLoading={isLoading}
          />
        </div>

        {/* Price Summary */}
        {selectedSize && priceEstimate && (
          <div className="md:col-span-1">
            <div className="sticky top-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Order Summary
              </h3>
              <div className="bg-[#1A1A1A] border border-[#404040] rounded-lg p-4 mb-4">
                <p className="text-sm text-[#999999] mb-1">Selected Size</p>
                <p className="text-white font-bold">{selectedSize.name}</p>
              </div>
              <PriceSummary
                size={selectedSize}
                rentalDays={rentalDays}
                {...priceEstimate}
              />
            </div>
          </div>
        )}
      </div>
    </BookingContainer>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackFormStep } from "@/lib/utils/analytics";
import {
  BookingProgressBar,
  BookingContainer,
} from "@/components/booking/BookingProgressBar";
import { FormActions } from "@/components/booking/FormComponents";
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
  const [hasInteractedWithDateInputs, setHasInteractedWithDateInputs] =
    useState(false);
  const [sizes, setSizes] = useState<DumpsterSizeOption[]>([]);
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [availabilityWarning, setAvailabilityWarning] = useState<string>("");

  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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
        const response = await fetch("/api/public/booking-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            delivery_date: deliveryDate,
            pickup_date: pickupDate,
            size_yards: selectedSize.size_yards,
          }),
        });

        const result = await response.json();

        if (!result.bookable) {
          setAvailabilityWarning(
            result.message ||
              "This reservation range is unavailable. Choose different dates.",
          );
        }
      } catch (err) {
        console.error("Error checking availability:", err);
      }
    }

    checkAvailability();
  }, [deliveryDate, pickupDate, selectedSize]);

  const handleBack = () => {
    router.push("/booking");
  };

  const handleContinue = async () => {
    setError("");

    if (!deliveryDate) {
      setError("Please select a delivery date");
      return;
    }

    if (deliveryDate <= getLocalDateString()) {
      setError("Delivery date must be in the future");
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
      const response = await fetch("/api/public/booking-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_date: deliveryDate,
          pickup_date: pickupDate,
          size_yards: selectedSize?.size_yards,
        }),
      });

      const checkResult = await response.json();

      if (!checkResult.bookable) {
        setError(
          checkResult.message ||
            "This reservation range is no longer available. Please select different dates.",
        );
        setIsLoading(false);
        return;
      }

      // Store dates in session
      sessionStorage.setItem("booking_delivery_date", deliveryDate);
      sessionStorage.setItem("booking_rental_days", rentalDays.toString());
      sessionStorage.setItem("booking_pickup_date", pickupDate);

      // Track form step
      trackFormStep("booking", 2, "dates");

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
            <div className="mb-6">
              <label
                htmlFor="delivery-date"
                className="block text-sm font-semibold text-white mb-2"
              >
                Delivery Date
                <span className="text-primary ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  id="delivery-date"
                  type="date"
                  value={deliveryDate}
                  onFocus={() => setHasInteractedWithDateInputs(true)}
                  onClick={(e) => {
                    const input = e.currentTarget as HTMLInputElement & {
                      showPicker?: () => void;
                    };

                    setHasInteractedWithDateInputs(true);
                    input.focus();
                    input.showPicker?.();
                  }}
                  onChange={(e) => {
                    setHasInteractedWithDateInputs(true);
                    setDeliveryDate(e.target.value);
                  }}
                  min={getMinimumDeliveryDate(1)}
                  max={getMaximumDeliveryDate(90)}
                  className={`input-field w-full pr-12 cursor-pointer ${
                    hasInteractedWithDateInputs ? "" : "calendar-attention"
                  } date-input-with-icon`}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
              </div>
            </div>

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
                  onFocus={() => setHasInteractedWithDateInputs(true)}
                  onChange={(e) => {
                    setHasInteractedWithDateInputs(true);
                    setRentalDays(Math.max(1, parseInt(e.target.value) || 0));
                  }}
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

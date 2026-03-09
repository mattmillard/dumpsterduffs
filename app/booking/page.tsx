"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookingProgressBar,
  BookingContainer,
} from "@/components/booking/BookingProgressBar";
import { SizeSelection } from "@/components/booking/SizeSelection";
import { FormActions } from "@/components/booking/FormComponents";
import { DumpsterSizeOption } from "@/types/booking";
import { trackFormStart, trackFormStep } from "@/lib/utils/analytics";

const STEPS = [
  { name: "size", label: "Size" },
  { name: "dates", label: "Dates" },
  { name: "address", label: "Address" },
  { name: "details", label: "Info" },
  { name: "review", label: "Review" },
];

export default function BookingSizePage() {
  const router = useRouter();
  const [sizes, setSizes] = useState<DumpsterSizeOption[]>([]);
  const [selectedSizeId, setSelectedSizeId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadSizes() {
      const response = await fetch("/api/public/sizes", { cache: "no-store" });
      const data = (await response.json()) as DumpsterSizeOption[];
      setSizes(data || []);

      // Find first active size as default
      const firstActiveSize = data.find((size) => size.is_active !== false);
      if (firstActiveSize) {
        setSelectedSizeId(firstActiveSize.id);
        sessionStorage.setItem("booking_size_id", firstActiveSize.id);
      } else if (data.length > 0) {
        // Fallback to first size if none are active
        setSelectedSizeId(data[0].id);
        sessionStorage.setItem("booking_size_id", data[0].id);
      }
    }

    loadSizes();

    // Track form start
    trackFormStart("booking");
  }, []);

  const handleSelectSize = (sizeId: string) => {
    setSelectedSizeId(sizeId);
  };

  const handleContinue = async () => {
    if (!selectedSizeId) return;

    setIsLoading(true);
    try {
      // Store selected size in session/state
      // TODO: Use server action or context to persist state
      sessionStorage.setItem("booking_size_id", selectedSizeId);

      // Track form step
      trackFormStep("booking", 1, "size");

      // Navigate to next step
      router.push("/booking/dates");
    } catch (error) {
      console.error("Error selecting size:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BookingContainer
      title="Choose Your Dumpster Size"
      description="Select the right size for your project. Not sure? Our team can help!"
      showHeader={true}
    >
      <BookingProgressBar
        currentStep={0}
        totalSteps={STEPS.length}
        steps={STEPS}
      />

      <div className="mb-8">
        <SizeSelection
          sizes={sizes}
          selectedSizeId={selectedSizeId}
          onSelect={handleSelectSize}
          mobileButton={
            <button
              onClick={handleContinue}
              disabled={isLoading || !selectedSizeId}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Continue to Dates"
              )}
            </button>
          }
        />
      </div>

      <FormActions
        onNext={handleContinue}
        nextLabel="Continue to Dates"
        nextDisabled={!selectedSizeId}
        isLoading={isLoading}
      />
    </BookingContainer>
  );
}

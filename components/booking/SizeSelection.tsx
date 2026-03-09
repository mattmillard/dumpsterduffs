"use client";

import React from "react";
import { DumpsterSizeOption } from "@/types/booking";

interface SizeCardProps {
  size: DumpsterSizeOption;
  isSelected: boolean;
  onSelect: (sizeId: string) => void;
}

export function SizeCard({ size, isSelected, onSelect }: SizeCardProps) {
  const isDisabled = size.is_active === false;

  return (
    <div
      onClick={() => !isDisabled && onSelect(size.id)}
      className={`p-6 rounded-lg transition-all duration-200 border-2 relative ${
        isDisabled
          ? "border-[#404040] bg-[#0D0D0D] opacity-60 cursor-not-allowed"
          : isSelected
            ? "border-primary bg-primary/10 shadow-lg cursor-pointer"
            : "border-[#404040] bg-[#1A1A1A] hover:border-primary/50 hover:shadow-md cursor-pointer"
      }`}
    >
      {isDisabled && (
        <div className="absolute top-4 right-4 bg-[#404040] text-white text-xs font-bold px-3 py-1 rounded-full">
          UNAVAILABLE
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">{size.name}</h3>
          <p className="text-sm text-[#999999]">{size.description}</p>
        </div>
        {isSelected && !isDisabled && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Dimensions */}
      <div className="mb-4 pb-4 border-b border-[#404040]">
        <p className="text-xs font-semibold text-[#999999] uppercase mb-2">
          Dimensions
        </p>
        <p className="text-sm text-white font-mono">
          {size.dimensions.length}' L × {size.dimensions.width}' W ×{" "}
          {size.dimensions.height}' H
        </p>
      </div>

      {/* Ideal for */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-[#999999] uppercase mb-2">
          Ideal For
        </p>
        <ul className="space-y-1">
          {size.ideal_for.slice(0, 3).map((item, idx) => (
            <li key={idx} className="text-sm text-white flex items-start">
              <span className="text-primary mr-2">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing */}
      <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
        <p className="text-xs text-[#999999] mb-1">Starting at</p>
        <p className="text-2xl font-bold text-primary">
          ${size.price_base.toFixed(2)}
        </p>
        <p className="text-xs text-[#999999] mt-2">
          ${size.price_per_day.toFixed(2)}/day after 3-day rental
        </p>
      </div>
    </div>
  );
}

interface SizeSelectionProps {
  sizes: DumpsterSizeOption[];
  selectedSizeId?: string;
  onSelect: (sizeId: string) => void;
  isLoading?: boolean;
  mobileButton?: React.ReactNode;
}

export function SizeSelection({
  sizes,
  selectedSizeId,
  onSelect,
  isLoading,
  mobileButton,
}: SizeSelectionProps) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-80 bg-[#1A1A1A] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const selectedIndex = sizes.findIndex((size) => size.id === selectedSizeId);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {sizes.map((size, index) => (
        <React.Fragment key={size.id}>
          <SizeCard
            size={size}
            isSelected={selectedSizeId === size.id}
            onSelect={onSelect}
          />
          {/* Show button after selected size on mobile only */}
          {mobileButton && index === selectedIndex && (
            <div className="md:hidden col-span-1">{mobileButton}</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

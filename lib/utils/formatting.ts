// Formatting utilities
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const normalized =
    cleaned.length > 10 && cleaned.startsWith("1") ? cleaned.slice(1) : cleaned;

  if (normalized.length === 10) {
    return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  }
  return phone;
}

export function maskPhoneInput(value: string): string {
  const rawDigits = value.replace(/\D/g, "");
  const normalized =
    rawDigits.length > 10 && rawDigits.startsWith("1")
      ? rawDigits.slice(1)
      : rawDigits;
  const digits = normalized.slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function formatAddress(
  line1: string,
  city: string,
  state: string,
  zip: string,
  line2?: string,
): string {
  const parts = [line1, line2 || "", `${city}, ${state} ${zip}`].filter(
    Boolean,
  );
  return parts.join("\n");
}

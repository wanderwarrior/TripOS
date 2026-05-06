import type {
  BookingStatus,
  LeadSource,
  LeadStatus,
  PaymentType,
  TripStatus,
} from "@prisma/client";

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "REQUIREMENT_UNDERSTOOD",
  "QUOTED",
  "FOLLOW_UP",
  "WON",
  "LOST",
];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  REQUIREMENT_UNDERSTOOD: "Understood",
  QUOTED: "Quoted",
  FOLLOW_UP: "Follow up",
  WON: "Won",
  LOST: "Lost",
};

export const LEAD_STATUS_COLUMN_DESC: Record<LeadStatus, string> = {
  NEW: "Just landed",
  CONTACTED: "Reached out",
  REQUIREMENT_UNDERSTOOD: "Brief captured",
  QUOTED: "Quote sent",
  FOLLOW_UP: "Awaiting reply",
  WON: "Booked",
  LOST: "Closed",
};

export type LeadStatusTone =
  | "default"
  | "outline"
  | "accent"
  | "muted"
  | "danger"
  | "success";

export const LEAD_STATUS_TONE: Record<LeadStatus, LeadStatusTone> = {
  NEW: "outline",
  CONTACTED: "accent",
  REQUIREMENT_UNDERSTOOD: "accent",
  QUOTED: "default",
  FOLLOW_UP: "muted",
  WON: "success",
  LOST: "danger",
};

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  MANUAL: "Manual",
  INSTAGRAM: "Instagram",
  REFERRAL: "Referral",
  WEBSITE: "Website",
  WHATSAPP: "WhatsApp",
  GOOGLE: "Google",
  OTHER: "Other",
};

export const TRIP_STATUS_LABEL: Record<TripStatus, string> = {
  PLANNING: "Planning",
  QUOTED: "Quoted",
  BOOKED: "Booked",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const TRIP_STATUS_TONE: Record<TripStatus, LeadStatusTone> = {
  PLANNING: "outline",
  QUOTED: "accent",
  BOOKED: "default",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export const BOOKING_STATUS_ORDER: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const BOOKING_STATUS_TONE: Record<BookingStatus, LeadStatusTone> = {
  PENDING: "outline",
  CONFIRMED: "accent",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export const PAYMENT_TYPE_LABEL: Record<PaymentType, string> = {
  ADVANCE: "Advance",
  PARTIAL: "Partial",
  FINAL: "Final",
};

export function whatsappLink(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export function telLink(phone?: string | null) {
  return phone ? `tel:${phone}` : null;
}

export function mailtoLink(email?: string | null) {
  return email ? `mailto:${email}` : null;
}

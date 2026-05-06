import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export const genai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export type ItineraryDay = {
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  food: string;
  notes: string;
};

export type ItineraryContent = {
  summary: string;
  days: ItineraryDay[];
};

export type GenerateInput = {
  destination: string;
  days: number;
  travelers: number;
  travelType: string;
  budget?: number | null;
  pace: string;
  interests: string[];
  hotelType: string;
  notes?: string | null;
};

const SYSTEM = `You are a senior luxury travel curator. You write calm, premium, evocative copy. Avoid clichés and exclamation marks. Be concise but vivid.`;

function budgetTier(input: GenerateInput) {
  if (!input.budget) return "Mid-range to premium";
  const perPersonPerDay = input.budget / input.travelers / input.days;
  if (perPersonPerDay >= 25000) return "Ultra-luxury";
  if (perPersonPerDay >= 12000) return "Luxury";
  if (perPersonPerDay >= 6000) return "Premium";
  return "Mid-range";
}

function buildPrompt(input: GenerateInput) {
  const interests =
    input.interests.length > 0
      ? input.interests.join(", ")
      : "general sightseeing, food, and culture";
  const notes = input.notes?.trim() || "None";
  const travelersDesc = `${input.travelers} ${
    input.travelers === 1 ? "traveler" : "travelers"
  } (${input.travelType})`;

  return `Create a highly personalized, premium travel itinerary.

Trip Details:

* Destination: ${input.destination}
* Duration: ${input.days} days
* Travelers: ${travelersDesc}
* Budget level: ${budgetTier(input)}${
    input.budget ? ` (₹${input.budget.toLocaleString("en-IN")} total)` : ""
  }
* Travel style: ${input.pace}
* Interests: ${interests}
* Hotel category: ${input.hotelType}
* Special notes: ${notes}

Instructions:

1. Create a day-by-day itinerary with clear structure.

2. For each day include:
   * Morning activity (with timing)
   * Afternoon activity
   * Evening plan
   * Food recommendations (specific, local)
   * Travel logistics (distance, travel time, transport type)

3. Make it feel realistic:
   * Avoid overpacking days
   * Group nearby attractions
   * Mention rest time where needed

4. Personalize based on traveler type:
   * Honeymoon → romantic experiences
   * Family → kid-friendly
   * Luxury → premium experiences

5. Add premium touches:
   * Hidden gems
   * Unique experiences
   * Local insider tips

6. Keep tone:
   * Professional
   * Premium
   * Easy to read

7. Format output in clean structured JSON like:

{
  "summary": "",
  "days": [
    {
      "title": "Day 1: Arrival & Leisure",
      "morning": "",
      "afternoon": "",
      "evening": "",
      "food": "",
      "notes": ""
    }
  ]
}

Return JSON ONLY. The "summary" should be a 2-3 sentence overview of the entire trip. The "notes" field per day should hold travel logistics (distance, transport, travel time) plus any insider tips. Produce exactly ${input.days} day(s) in the "days" array.`;
}

export async function generateItineraryAI(
  input: GenerateInput
): Promise<ItineraryContent> {
  if (!genai) {
    return mockItinerary(input);
  }
  try {
    const response = await genai.models.generateContent({
      model,
      contents: buildPrompt(input),
      config: {
        systemInstruction: SYSTEM,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });
    const raw = response.text ?? "{}";
    const parsed = JSON.parse(raw) as ItineraryContent;
    if (!parsed?.days?.length) throw new Error("Empty itinerary");
    return parsed;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[gemini] falling back to mock itinerary —", msg);
    return mockItinerary(input);
  }
}

function mockItinerary(input: GenerateInput): ItineraryContent {
  return {
    summary: `A ${input.days}-day ${input.travelType.toLowerCase()} journey through ${input.destination}, paced ${input.pace.toLowerCase()} and centered on ${
      input.interests.length > 0
        ? input.interests.slice(0, 3).join(", ")
        : "the destination's signature experiences"
    }.`,
    days: Array.from({ length: input.days }, (_, i) => ({
      title: `Day ${i + 1}: ${
        i === 0
          ? "Arrival & Leisure"
          : i === input.days - 1
            ? "Farewell & Departure"
            : `Exploring ${input.destination}`
      }`,
      morning:
        "9:00 AM — Begin gently with a slow breakfast at the hotel, followed by a curated walk through a quiet quarter of the city.",
      afternoon:
        "1:30 PM — A signature lunch at a local favorite, then a private experience handpicked for the day's theme.",
      evening:
        "7:00 PM — Sunset views from a curated vantage point, followed by a chef-led dinner.",
      food:
        "Local specialty for lunch, regional thali for dinner. Reservations made on your behalf.",
      notes:
        "Local transfers via private car (15–20 min between stops). Carry a light layer for evenings. Insider tip: ask the concierge for the off-menu dessert.",
    })),
  };
}

"use client";

import { Compass, Wand2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TripWizard } from "@/components/trip-wizard";
import { TripBriefForm } from "@/components/trip-brief-form";

type PrefillFromContact = {
  contactId: string;
  leadName: string;
  destination?: string | null;
  startDate?: string | null;
  days?: number | null;
  travelers?: number | null;
  budget?: number | null;
  notes?: string | null;
};

/**
 * Two paths into a new trip. Tabs are persistent across the lifetime of the
 * page so an agent can flip between modes without losing typed input in the
 * non-active tab.
 */
export function NewTripTabs({
  prefill,
}: {
  prefill?: PrefillFromContact;
}) {
  return (
    <Tabs defaultValue="wizard" className="mx-auto max-w-2xl">
      <TabsList className="mx-auto mb-8 flex w-fit">
        <TabsTrigger value="wizard" className="gap-1.5">
          <Compass className="h-3.5 w-3.5" />
          Quick wizard
        </TabsTrigger>
        <TabsTrigger value="brief" className="gap-1.5">
          <Wand2 className="h-3.5 w-3.5" />
          Detailed brief
        </TabsTrigger>
      </TabsList>

      <TabsContent value="wizard">
        <TripWizard prefill={prefill} />
      </TabsContent>

      <TabsContent value="brief">
        <TripBriefForm
          contactId={prefill?.contactId ?? null}
          contactName={prefill?.leadName ?? null}
        />
      </TabsContent>
    </Tabs>
  );
}

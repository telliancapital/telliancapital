"use client";

import { useLiveQuery } from "@sanity/preview-kit";
import { CONTACT_QUERY } from "@/sanity/lib/queries";

export function ContactLivePreview({ initialData }: { initialData: any }) {
  const [data, loading] = useLiveQuery(initialData, CONTACT_QUERY);

  if (loading) {
    return <div>Loading preview...</div>;
  }

  return data;
}

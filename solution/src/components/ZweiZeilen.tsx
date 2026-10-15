"use client";

import { useEffect } from "react";

import { zweiZeilenRegel } from "@/zweiZeilen";

/* Überschriften höchstens zweizeilig (siehe zweiZeilen.ts) — in der
   Vorlage in main.tsx nach dem Mount der App aufgerufen. */
export function ZweiZeilen() {
  useEffect(() => {
    zweiZeilenRegel();
  }, []);
  return null;
}

import { Truck, RotateCcw, ShieldCheck, Wrench, Sparkles } from "lucide-react";
export const topics = [
  ["delivery", "Delivery", Truck],
  ["returns", "Returns", RotateCcw],
  ["warranty", "Warranty", ShieldCheck],
  ["setup", "Getting started", Wrench],
  ["care", "Care & upkeep", Sparkles],
] as const;

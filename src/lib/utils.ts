import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- VEHICLE TAG HELPER ---
export const getVehicleTags = (type: string) => {
  const t = type.toLowerCase();

  if (t === "bus") {
    return [{
      label: "Bus",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    }];
  }
  if (t === "jeepney") {
    return [{
      label: "Jeepney",
      color: "bg-violet-100 text-violet-700 border-violet-200",
    }];
  }
  if (t === "e-jeepney") {
    return [{
      label: "E-Jeep",
      color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    }];
  }
  if (t === "tricycle") {
    return [{
      label: "Tricycle",
      color: "bg-green-100 text-green-700 border-green-200",
    }];
  }

  // Mixed / Grand Terminals
  if (t === "mixed") {
    return [
      { label: "Bus", color: "bg-blue-100 text-blue-700 border-blue-200" },
      {
        label: "Jeepney",
        color: "bg-violet-100 text-violet-700 border-violet-200",
      },
    ];
  }

  return [{
    label: "Terminal",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  }];
};

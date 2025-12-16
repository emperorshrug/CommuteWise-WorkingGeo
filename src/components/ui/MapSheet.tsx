import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import { MapPin, AlertTriangle, Car, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function MapSheet() {
  const {
    selectedTerminal,
    clearSelection,
    isRouteViewMode,
    currentMapLocationName,
  } = useAppStore();

  if (isRouteViewMode) return null;

  return (
    <Drawer open={true} modal={false}>
      <DrawerContent className="bg-white max-h-[85vh] outline-none shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-md mx-auto px-4 pb-6 pt-2">
          <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />

          {selectedTerminal ? (
            // TERMINAL VIEW (Use your existing code here or from previous examples)
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
              <h2 className="text-xl font-bold">{selectedTerminal.name}</h2>
              {/* ... details ... */}
              <Button
                onClick={clearSelection}
                variant="secondary"
                className="w-full mt-4"
              >
                Close
              </Button>
            </div>
          ) : (
            // --- QC DASHBOARD VIEW ---
            <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <DrawerHeader className="p-0 text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <DrawerTitle className="text-2xl font-extrabold text-slate-900 leading-none mb-1">
                      {currentMapLocationName.split(",")[0] || "Quezon City"}
                    </DrawerTitle>
                    <DrawerDescription className="font-medium text-slate-500 flex items-center gap-1">
                      <MapPin size={12} />{" "}
                      {currentMapLocationName.includes(",")
                        ? currentMapLocationName.split(",")[1].trim()
                        : "Metro Manila"}
                    </DrawerDescription>
                  </div>
                  {/* QC LOGO PLACEHOLDER */}
                  <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border border-blue-100">
                    <Navigation size={20} />
                  </div>
                </div>
              </DrawerHeader>

              {/* LIVE METRICS (Mocked for now) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <span className="text-2xl font-black text-slate-800">42</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Active Terminals
                  </span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <span className="text-2xl font-black text-blue-600">15</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Available Routes
                  </span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <div className="flex items-center gap-1 text-orange-500">
                    <AlertTriangle
                      size={16}
                      fill="currentColor"
                      className="text-orange-500"
                    />
                    <span className="text-2xl font-black">5</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Alerts
                  </span>
                </div>
              </div>

              {/* NOTIFICATION CARDS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  Community Updates
                </h4>

                <Card className="p-3 bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="mt-1 bg-orange-100 p-1.5 rounded-md text-orange-600 h-fit">
                      <Car size={16} />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-800">
                        Congestion Alert
                      </h5>
                      <p className="text-xs text-slate-500 leading-snug mt-0.5">
                        Heavy traffic reported along Commonwealth Avenue
                        Westbound.
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium mt-2 block">
                        12 mins ago • 45 confirmations
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

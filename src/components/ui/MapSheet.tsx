/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import { Star, MapPin, Bus, ThumbsUp, X, Map as MapIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getVehicleTags } from "@/lib/utils";

export default function MapSheet() {
  const {
    selectedTerminal,
    clearSelection,
    selectRoute,
    isRouteViewMode,
    currentMapLocationName,
  } = useAppStore();

  const { data: routes = [] } = useQuery({
    queryKey: ["routes", selectedTerminal?.id],
    queryFn: async () => {
      if (!selectedTerminal) return [];
      const { data } = await supabase
        .from("routes")
        .select("*")
        .eq("terminal_id", selectedTerminal.id);
      return data || [];
    },
    enabled: !!selectedTerminal,
  });

  // Sheet is always open in "Explore" mode unless we are viewing a specific route
  const isOpen = !isRouteViewMode;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && clearSelection()}
      modal={false}
    >
      <DrawerContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="z-[50] bg-slate-50 max-h-[85vh] outline-none shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] fixed inset-x-0"
        style={{ bottom: "var(--nav-height, 0px)" }}
      >
        <div className="w-full max-w-md mx-auto relative">
          {/* CLOSE BUTTON (Only show if a terminal is selected) */}
          {selectedTerminal && (
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => clearSelection()}
                className="h-8 w-8 rounded-full bg-slate-200/50 hover:bg-slate-200"
              >
                <X size={16} />
              </Button>
            </div>
          )}

          {/* --- CONTENT SWITCHER --- */}
          {selectedTerminal ? (
            // MODE A: TERMINAL DETAILS
            <>
              <DrawerHeader className="text-left pb-2">
                <div>
                  <DrawerTitle className="text-2xl font-extrabold text-slate-900 leading-tight pr-10">
                    {selectedTerminal.name}
                  </DrawerTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getVehicleTags(selectedTerminal.type).map((tag, i) => (
                      <span
                        key={i}
                        className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${tag.color}`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  <DrawerDescription className="flex items-center mt-2 text-slate-500 font-medium">
                    <MapPin size={14} className="mr-1" />
                    {selectedTerminal.address || "Quezon City, Metro Manila"}
                  </DrawerDescription>
                </div>
                <div className="flex gap-3 mt-3">
                  <span className="flex items-center text-sm font-bold text-slate-700 bg-white border px-2 py-1 rounded-md shadow-sm">
                    <Star
                      size={14}
                      className="text-yellow-500 fill-yellow-500 mr-1.5"
                    />
                    {selectedTerminal.rating > 0
                      ? selectedTerminal.rating
                      : "New"}
                    <span className="text-slate-400 font-normal ml-1">
                      ({selectedTerminal.rating_count || 0})
                    </span>
                  </span>
                  <span className="flex items-center text-sm font-bold text-slate-700 bg-white border px-2 py-1 rounded-md shadow-sm">
                    <Bus size={14} className="text-blue-500 mr-1.5" />
                    {routes.length} Routes
                  </span>
                </div>
              </DrawerHeader>

              <div className="p-4 pt-0 space-y-4 overflow-y-auto max-h-[50vh]">
                <Card className="p-4 bg-white border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm text-slate-800">
                      Community Rating
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] text-blue-600"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                          JD
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-700">
                            John Doe
                          </div>
                          <div className="flex text-yellow-400 text-[10px]">
                            <Star size={10} fill="currentColor" />
                            <Star size={10} fill="currentColor" />
                            <Star size={10} fill="currentColor" />
                            <Star size={10} fill="currentColor" />
                            <Star size={10} fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">2d ago</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      "Organized queuing system during rush hour. Easy to
                      locate."
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-slate-400 hover:text-blue-500 cursor-pointer w-fit">
                      <ThumbsUp size={12} />
                      <span className="text-[10px]">Helpful (12)</span>
                    </div>
                  </div>
                </Card>

                <div>
                  <h4 className="font-bold text-sm text-slate-800 mb-2 px-1">
                    Available Routes
                  </h4>
                  {routes.length === 0 ? (
                    <div className="text-center p-6 text-slate-400 text-sm italic border-2 border-dashed rounded-lg">
                      No routes found for this terminal yet.
                    </div>
                  ) : (
                    routes.map((route: any) => (
                      <Card
                        key={route.id}
                        className={`mb-3 overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                          selectedTerminal.type === "bus"
                            ? "border-l-blue-500"
                            : "border-l-violet-500"
                        }`}
                        onClick={async () => {
                          const { data: stops } = await supabase
                            .from("route_stops")
                            .select("*")
                            .eq("route_id", route.id)
                            .order("order_index", { ascending: true });
                          selectRoute(route, stops || []);
                        }}
                      >
                        <div className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="font-extrabold text-base text-slate-800">
                                  {route.name}
                                </h5>
                                {route.fare === 0 && (
                                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200">
                                    LIBRENG SAKAY
                                  </span>
                                )}
                                {route.is_strict && (
                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                    STRICT STOPS
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-medium mt-1">
                                {selectedTerminal.name}{" "}
                                <span className="text-slate-300 mx-1">➜</span>{" "}
                                {route.destination}
                              </div>
                            </div>
                            <div className="text-right min-w-[60px]">
                              {route.fare === 0 ? (
                                <div className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded inline-block">
                                  FREE
                                </div>
                              ) : (
                                <div className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded inline-block">
                                  ₱ {route.fare}
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 mt-1">
                                {route.eta || "~20 mins"}
                              </div>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 flex justify-between items-center">
                            <span className="font-semibold text-slate-600">
                              {route.is_strict
                                ? "Designated Stops"
                                : "Flexible Stops"}
                            </span>
                            <span className="text-blue-600 font-medium flex items-center">
                              View Map <Bus size={10} className="ml-1" />
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
              <DrawerFooter className="pt-2">
                <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
                  Get Directions to Terminal
                </Button>
              </DrawerFooter>
            </>
          ) : (
            // MODE B: GENERAL MAP INFO (Minimzed State)
            <DrawerHeader className="text-left pb-6 pt-2">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-full">
                  <MapIcon className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <DrawerTitle className="text-xl font-bold text-slate-900">
                    {currentMapLocationName}
                  </DrawerTitle>
                  <DrawerDescription className="text-xs font-medium text-slate-500">
                    Current Map Location
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

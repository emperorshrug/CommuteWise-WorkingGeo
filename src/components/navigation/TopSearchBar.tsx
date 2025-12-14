import { useState, useEffect } from "react";
import {
  Search,
  Menu,
  X,
  MapPin,
  ArrowLeft,
  Map as MapIcon,
  Star,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";

// Nominatim Result Type
interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export default function TopSearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [startQuery, setStartQuery] = useState("Current Location");
  const [destQuery, setDestQuery] = useState("");
  const [activeField, setActiveField] = useState<"start" | "dest">("dest");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { setSearchDestination, clearSelection, setPickingLocation } =
    useAppStore();

  // 1. Debounce Logic (Increased to 1000ms to allow free API breathing room)
  useEffect(() => {
    const query = activeField === "start" ? startQuery : destQuery;
    if (query === "Current Location") return;

    const timer = setTimeout(() => setDebouncedQuery(query), 1000);
    return () => clearTimeout(timer);
  }, [startQuery, destQuery, activeField]);

  // 2. Fetch Search Results
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (
        !debouncedQuery ||
        debouncedQuery === "Current Location" ||
        debouncedQuery.length < 3
      )
        return [];

      // Added addressdetails=1 and limited viewbox to help accuracy
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          debouncedQuery
        )}&limit=5&viewbox=120.90,14.35,121.15,14.75`
      );

      if (!res.ok) throw new Error("Search failed");

      return (await res.json()) as SearchResult[];
    },
    enabled: !!debouncedQuery && isExpanded,
    retry: false, // STOP RETRYING ON 403 (Saves your credits/ban status)
    staleTime: 1000 * 60 * 5, // Cache results for 5 mins
  });

  const handleSelect = (place: SearchResult) => {
    if (activeField === "dest") {
      setSearchDestination({
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        name: place.display_name.split(",")[0],
      });
      setDestQuery(place.display_name.split(",")[0]);
      setIsExpanded(false);
    } else {
      setStartQuery(place.display_name.split(",")[0]);
    }
  };

  const handleSelectOnMap = () => {
    setIsExpanded(false);
    setPickingLocation(true); // Enable "Pick Mode" in Map
  };

  const isSearching =
    (startQuery !== "Current Location" && activeField === "start") ||
    (destQuery.length > 0 && activeField === "dest");

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-[150] bg-white flex flex-col animate-in slide-in-from-bottom-5 duration-200">
        <div className="p-4 shadow-sm border-b border-slate-100 bg-white z-10">
          <div className="flex gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="mt-1"
              onClick={() => setIsExpanded(false)}
            >
              <ArrowLeft className="h-6 w-6 text-slate-700" />
            </Button>
            <div className="flex-1 flex flex-col gap-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full border-2 border-blue-500 bg-white"></div>
                <Input
                  className="pl-8 bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-blue-500"
                  value={startQuery}
                  onChange={(e) => setStartQuery(e.target.value)}
                  onFocus={() => {
                    setActiveField("start");
                    if (startQuery === "Current Location") setStartQuery("");
                  }}
                  onBlur={() => {
                    if (startQuery === "") setStartQuery("Current Location");
                  }}
                  placeholder="Start Location"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 fill-red-500" />
                <Input
                  autoFocus
                  className="pl-8 bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-red-500"
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  onFocus={() => setActiveField("dest")}
                  placeholder="Where to?"
                />
                {destQuery && (
                  <button
                    onClick={() => setDestQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-2">
          {isLoading && isSearching && (
            <div className="p-4 text-center text-xs text-slate-400 animate-pulse">
              Searching locations...
            </div>
          )}

          {!isLoading && isSearching && results.length > 0 && (
            <ul className="divide-y divide-slate-50">
              {results.map((place) => (
                <li
                  key={place.place_id}
                  className="p-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3 transition-colors rounded-lg"
                  onClick={() => handleSelect(place)}
                >
                  <div className="mt-0.5 bg-slate-100 p-2 rounded-full shrink-0">
                    <MapPin className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                      {place.display_name.split(",")[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {place.display_name.split(",").slice(1).join(",")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && isSearching && results.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">
              No results found. Try a different keyword.
            </div>
          )}

          {!isSearching && (
            <div className="space-y-4 pt-2">
              <button
                onClick={handleSelectOnMap}
                className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
              >
                <div className="bg-blue-100 p-2 rounded-full">
                  <MapIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-800">
                    Select on Map
                  </div>
                  <div className="text-xs text-slate-500">
                    Choose location manually
                  </div>
                </div>
              </button>

              <div className="px-2">
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Favorites
                </h4>
                <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-800">
                      Home
                    </div>
                    <div className="text-xs text-slate-500">
                      Quezon City, Metro Manila
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-2">
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Recent
                </h4>
                <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <div className="bg-slate-100 p-2 rounded-full">
                    <History className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-800">
                      SM North EDSA
                    </div>
                    <div className="text-xs text-slate-500">
                      North Avenue, Quezon City
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto pointer-events-auto flex flex-col gap-2">
      <div className="flex gap-2 items-center w-full">
        <Button
          variant="outline"
          size="icon"
          className="bg-white shadow-md shrink-0 h-10 w-10 border-slate-200"
          onClick={clearSelection}
        >
          <Menu className="h-5 w-5 text-slate-700" />
        </Button>
        <div
          className="relative flex-1 bg-white shadow-md rounded-md flex items-center border border-slate-200 cursor-text"
          onClick={() => setIsExpanded(true)}
        >
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <Input
            readOnly
            placeholder="Where to?"
            className="pl-9 border-0 focus-visible:ring-0 rounded-md h-10 text-slate-700 placeholder:text-slate-400 cursor-pointer pointer-events-none"
            value={destQuery}
          />
        </div>
      </div>
    </div>
  );
}

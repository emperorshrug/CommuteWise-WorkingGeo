// FIX: Clean imports
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent } from "@/components/ui/card"; // Removed Header/Title/Description
import { Button } from "@/components/ui/button";
import {
  Clock,
  Calendar,
  Lock,
  ArrowRight,
  History as HistoryIcon,
} from "lucide-react"; // Removed MapPin if not used

export default function History() {
  // ... rest of code
  const { user } = useAppStore();
  const navigate = useNavigate();
  const isGuest = user?.role === "guest";

  // Mock Data (Replica of your GoogleAI data)
  const trips = [
    {
      id: 1,
      from: "Home",
      to: "UP Ayala Technohub",
      date: "Oct 24, 8:30 AM",
      duration: "25 min",
      cost: "₱20.00",
      mode: "Jeepney",
    },
    {
      id: 2,
      from: "SM North EDSA",
      to: "Tandang Sora Palengke",
      date: "Oct 23, 6:15 PM",
      duration: "45 min",
      cost: "₱35.00",
      mode: "Bus",
    },
    {
      id: 3,
      from: "Quezon City Hall",
      to: "Visayas Avenue",
      date: "Oct 22, 5:00 PM",
      duration: "35 min",
      cost: "₱15.00",
      mode: "Jeepney",
    },
  ];

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
          <Lock className="h-8 w-8 text-slate-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Login Required</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Your trip history is saved securely in the cloud. Please log in to
            view your past rides and activity.
          </p>
        </div>
        <Button
          onClick={() => navigate("/auth")}
          className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 shadow-md"
        >
          Log In to View History
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <HistoryIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Your Activity
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Recent trips around Quezon City
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {trips.map((trip) => (
          <Card
            key={trip.id}
            className="shadow-sm hover:shadow-md transition-shadow border-slate-200"
          >
            <CardContent className="p-4">
              {/* Header: Date & Cost */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <Calendar size={12} className="mr-1" />
                  {trip.date}
                </div>
                <div className="font-bold text-green-700 bg-green-50 px-2 py-1 rounded text-xs border border-green-100">
                  {trip.cost}
                </div>
              </div>

              {/* Visual Route Line */}
              <div className="relative pl-3 border-l-2 border-dashed border-slate-200 ml-1 space-y-6 mb-4">
                <div className="relative">
                  <div className="absolute -left-[19px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                  <p className="text-xs text-slate-400 mb-0.5 font-medium">
                    Origin
                  </p>
                  <p className="text-sm font-bold text-slate-800 leading-none">
                    {trip.from}
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[19px] top-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white shadow-sm" />
                  <p className="text-xs text-slate-400 mb-0.5 font-medium">
                    Destination
                  </p>
                  <p className="text-sm font-bold text-slate-800 leading-none">
                    {trip.to}
                  </p>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                <div className="flex gap-2">
                  <span className="flex items-center text-[10px] text-slate-600 font-bold bg-slate-100 px-2 py-1 rounded">
                    <Clock size={12} className="mr-1" /> {trip.duration}
                  </span>
                  <span className="flex items-center text-[10px] text-slate-600 font-bold bg-slate-100 px-2 py-1 rounded">
                    {trip.mode}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-blue-600"
                >
                  <ArrowRight size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";
import { Map, Users, History, User } from "lucide-react";
import { cn } from "@/lib/utils"; // Shadcn utility helper

export default function BottomNav() {
  const location = useLocation();

  // Helper to check if a tab is active
  const isActive = (path: string) => location.pathname === path;

  // The list of tabs
  const navItems = [
    { name: "Explore", path: "/", icon: Map },
    { name: "Community", path: "/community", icon: Users },
    { name: "Activity", path: "/activity", icon: History },
    { name: "Account", path: "/account", icon: User },
  ];

  return (
    <nav className="flex justify-around items-center p-2 pb-4 bg-white">
      {navItems.map((item) => {
        const active = isActive(item.path);

        return (
          <Link
            key={item.name}
            to={item.path}
            className="flex flex-col items-center flex-1 py-1"
          >
            {/* Icon */}
            <div
              className={cn(
                "p-1 rounded-full transition-colors",
                active ? "bg-blue-100 text-blue-600" : "text-gray-500"
              )}
            >
              <item.icon size={24} strokeWidth={active ? 2.5 : 2} />
            </div>

            {/* Label */}
            <span
              className={cn(
                "text-[10px] mt-1 font-medium",
                active ? "text-blue-600" : "text-gray-500"
              )}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TopSearchBar() {
  return (
    <div className="flex gap-2 items-center w-full max-w-md mx-auto pointer-events-auto">
      {/* Side Menu Button (Hamburger) */}
      <Button
        variant="outline"
        size="icon"
        className="bg-white shadow-md shrink-0"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* The Search Input */}
      <div className="relative flex-1 bg-white shadow-md rounded-md flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search destination..."
          className="pl-9 border-0 focus-visible:ring-0 rounded-md h-10"
        />
      </div>
    </div>
  );
}

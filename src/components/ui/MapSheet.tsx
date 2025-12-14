import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import { Star, Navigation } from "lucide-react";

export default function MapSheet() {
  const { selectedTerminal, clearSelection } = useAppStore();

  // The sheet is open only if a terminal is selected
  const isOpen = !!selectedTerminal;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && clearSelection()}>
      <DrawerContent className="bg-white max-h-[90vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl font-bold">
              {selectedTerminal?.name || "Terminal Name"}
            </DrawerTitle>
            <DrawerDescription>
              {selectedTerminal?.address || "Loading address..."}
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pt-0 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center text-yellow-600 font-bold">
                4.8 <Star size={16} className="fill-yellow-600 ml-1" />
              </span>
              <span className="text-gray-400 text-sm">(98 reviews)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Navigation size={16} className="mr-2" />
                Routes
              </Button>
              <Button variant="outline" className="w-full">
                Share
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

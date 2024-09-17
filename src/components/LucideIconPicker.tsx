import React, { useState, useMemo } from "react";
import {
  AlertCircle,
  Archive,
  ArrowRight,
  Bell,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Cloud,
  Code,
  Coffee,
  Cog,
  Copy,
  Download,
  Edit,
  Eye,
  File,
  Folder,
  Globe,
  Heart,
  Home,
  Image,
  Info,
  Link,
  List,
  Lock,
  Mail,
  Map,
  Menu,
  Moon,
  Music,
  Package,
  Phone,
  Play,
  Plus,
  Power,
  Printer,
  Save,
  Search,
  Send,
  Settings,
  Share,
  ShoppingCart,
  Star,
  Sun,
  Trash,
  User,
  Video,
  Volume,
  Wifi,
  ZoomIn,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";

const iconMap = {
  AlertCircle,
  Archive,
  ArrowRight,
  Bell,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Cloud,
  Code,
  Coffee,
  Cog,
  Copy,
  Download,
  Edit,
  Eye,
  File,
  Folder,
  Globe,
  Heart,
  Home,
  Image,
  Info,
  Link,
  List,
  Lock,
  Mail,
  Map,
  Menu,
  Moon,
  Music,
  Package,
  Phone,
  Play,
  Plus,
  Power,
  Printer,
  Save,
  Search,
  Send,
  Settings,
  Share,
  ShoppingCart,
  Star,
  Sun,
  Trash,
  User,
  Video,
  Volume,
  Wifi,
  ZoomIn,
};

type IconName = keyof typeof iconMap;

interface LucideIconPickerProps {
  onSelectIcon: (iconName: IconName) => void;
  selectedIcon?: IconName;
}

const LucideIconPicker: React.FC<LucideIconPickerProps> = ({
  onSelectIcon,
  selectedIcon,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIcons = useMemo(() => {
    return Object.keys(iconMap).filter((name) =>
      name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) as IconName[];
  }, [searchQuery]);

  const handleSelectIcon = (iconName: IconName) => {
    onSelectIcon(iconName);
    setOpen(false);
  };

  const SelectedIcon = selectedIcon ? iconMap[selectedIcon] : AlertCircle;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-52 justify-between">
          <SelectedIcon className="mr-2 h-4 w-4" />
          {selectedIcon ?? "Select icon..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px]">
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="h-[300px] overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-7 gap-1">
              {filteredIcons.map((name) => {
                const Icon = iconMap[name];
                return (
                  <Button
                    key={name}
                    variant="ghost"
                    className="h-10 w-10 p-0"
                    onClick={() => handleSelectIcon(name)}
                    title={name}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LucideIconPicker;

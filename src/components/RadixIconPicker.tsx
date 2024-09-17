import React, { useState, useMemo } from "react";
import * as RadixIcons from "@radix-ui/react-icons";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";

type IconName = keyof typeof RadixIcons;

interface RadixIconPickerProps {
  onSelectIcon: (iconName: IconName) => void;
  selectedIcon?: IconName;
}

const RadixIconPicker: React.FC<RadixIconPickerProps> = ({
  onSelectIcon,
  selectedIcon,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const iconNames = useMemo(() => Object.keys(RadixIcons) as IconName[], []);

  const filteredIcons = useMemo(() => {
    return iconNames.filter((name) =>
      name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [iconNames, searchQuery]);

  const handleSelectIcon = (iconName: IconName) => {
    onSelectIcon(iconName);
    setOpen(false);
  };

  const SelectedIcon = selectedIcon
    ? RadixIcons[selectedIcon]
    : RadixIcons.QuestionMarkCircledIcon;

  return (
    <div>
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
                  const Icon = RadixIcons[name];
                  return (
                    <Button
                      key={name}
                      variant="ghost"
                      className="h-8 w-8 p-0"
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
      <p className="mt-2 text-xs text-gray-500">
        Total icons: {iconNames.length}, Filtered: {filteredIcons.length}
      </p>
    </div>
  );
};

export default RadixIconPicker;

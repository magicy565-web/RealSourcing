import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  Video,
  Building2,
  FileText,
  Settings,
  Plus,
  Search,
  UserPlus,
  HelpCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigate = (path: string) => {
    setLocation(path);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/webinars")}>
            <Video className="mr-2 h-4 w-4" />
            <span>Webinars</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/factories")}>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Factories</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/reports")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => navigate("/webinars/create")}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Webinar</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/factories")}>
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Add Factory</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/webinars")}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search Webinars</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/factories")}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search Factories</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Help">
          <CommandItem onSelect={() => navigate("/help")}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  return {
    open: () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "k", metaKey: true })
      );
    },
  };
}

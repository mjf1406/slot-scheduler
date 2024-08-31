// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  User,
  Settings,
  LayoutGrid,
  LucideIcon, 
  CalendarCheck2
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
  under_construction: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
  under_construction: boolean;
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

function sortByLabel<T extends { label: string }>(items: T[]): T[] {
  return items.sort((a, b) => a.label.localeCompare(b.label));
}

export function getMenuList(pathname: string): Group[] {
  const unsortedMenuList: Group[] = [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname.includes("/dashboard"),
          icon: LayoutGrid,
          under_construction: true,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/timetables",

          label: "Timetables",
          active: pathname.includes("/classes"),
          icon: CalendarCheck2,
          under_construction: false,
          submenus: [
            // TODO: dynamically set these 
            {
              href: "/timetables/tt1",
              label: "TT 1",
              active: pathname.includes("/timetable/tt1"),
              under_construction: true,
            },
            {
              href: "/timetables/tt2",
              label: "TT 2",
              active: pathname.includes("/timetable/tt2"),
              under_construction: true,
            }
          ]
        }
      ]
    },
    {
      groupLabel: "User",
      menus: [
        {
          href: "/account",
          label: "Account",
          active: pathname.includes("/account"),
          icon: User,
          under_construction: true,
          submenus: []
        },
        {
          href: "/settings",
          label: "Settings",
          active: pathname.includes("/settings"),
          icon: Settings,
          under_construction: true,
          submenus: []
        }
      ]
    },
  ];

  // Sort menus and submenus within each group
  const sortedMenuList = unsortedMenuList.map(group => ({
    ...group,
    menus: sortByLabel(group.menus.map(menu => ({
      ...menu,
      submenus: sortByLabel(menu.submenus)
    })))
  }));

  return sortedMenuList;
}

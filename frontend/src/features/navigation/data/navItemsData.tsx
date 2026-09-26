import { NavItemInterface } from "../types/NavItemsInterface";
import {
  ChevronRight,
  Home,
  Users,
  CreditCard,
  Briefcase,
  Key,
  FileText,
  Trash,
  Folder,
  Settings,
} from "lucide-react";

export const navItems: NavItemInterface[] = [
  {
    title: "Accueil",
    icon: <Home className="h-6 w-8" />,
    href: "/dashboard"
  },
  { title: "projects", icon: <Folder className="h-6 w-8" />, href: "/dashboard/projects" },
  { title: "Devis", icon: <FileText className="h-6 w-8" />, href: "/dashboard/quotes" },
  { title: "Clients", icon: <Users className="h-6 w-8" />, href: "/dashboard/clients" },
  { title: "Factures", icon: <CreditCard className="h-6 w-8" />, href: "/dashboard/invoices" },
  { title: "System", isHeader: true, icon: null },
  { title: "Paramètres", icon: <Settings className="h-6 w-8" />, href: "/dashboard/settings" },
];
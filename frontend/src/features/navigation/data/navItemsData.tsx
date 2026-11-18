import { NavItemInterface } from "../types/NavItemsInterface";
import {
  Home,
  Users,
  CreditCard,
  FileText,
  GitBranch,
  Settings,
} from "lucide-react";

export const navItems: NavItemInterface[] = [
  {
    title: "Accueil",
    icon: <Home className="h-6 w-8" />,
    href: "/dashboard"
  },
  { title: "Clients", icon: <Users className="h-6 w-8" />, href: "/dashboard/clients" },
  { title: "Devis", icon: <FileText className="h-6 w-8" />, href: "/dashboard/quotes" },
  { title: "Factures", icon: <CreditCard className="h-6 w-8" />, href: "/dashboard/invoices" },
  { title: "Relances", icon: <GitBranch className="h-6 w-8" />, href: "/dashboard/relances", badge: "New" },
  { title: "System", isHeader: true, icon: null },
  { title: "Paramètres", icon: <Settings className="h-6 w-8" />, href: "/dashboard/settings" },
];
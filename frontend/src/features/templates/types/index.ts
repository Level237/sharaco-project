export interface DocumentTemplate {
  id: string;
  name: string;
  user_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
  logo_url?: string;
  font_family: string;
  header_text?: string;
  footer_text?: string;
  show_bank_details: boolean;
  show_tax_id: boolean;
  layout_style: 'classic' | 'modern' | 'minimal' | "bold" | "elegant";
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentCreate {
    id?: string;
    type: string;
    client_id: string;
    client_name: string;
    client_email: string;
    client_address: string;
    client_phone: string;
    items: Array<{
        description: string;
        quantity: number;
        unit_price_cents: number;
        tax_rate: number;
    }>;
    template_id?: string | null;
    due_date?: string | null;
    notes?: string | null;
    reference?: string | null;
}

export interface DocumentUpdate {
    client_id?: string;
    client_name?: string;
    client_email?: string;
    client_address?: string;
    client_phone?: string;
    items?: Array<{
        description: string;
        quantity: number;
        unit_price_cents: number;
        tax_rate: number;
    }>;
    template_id?: string | null;
    due_date?: string | null;
    notes?: string | null;
}
export interface TemplateCreate {
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
  logo_url?: string;
  font_family: string;
  header_text?: string;
  footer_text?: string;
  show_bank_details?: boolean;
  show_tax_id?: boolean;
  layout_style: 'classic' | 'modern' | 'minimal';
  is_default?: boolean;
}

export interface TemplateUpdate {
  name?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  text_color?: string;
  background_color?: string;
  logo_url?: string;
  font_family?: string;
  header_text?: string;
  footer_text?: string;
  show_bank_details?: boolean;
  show_tax_id?: boolean;
  layout_style?: 'classic' | 'modern' | 'minimal';
  is_default?: boolean;
}

/**
 * Ré-export de DocumentPreviewRequest depuis quotes/types pour un accès
 * uniforme depuis les composants templates.
 * Évite la duplication de définition et les conflits de type.
 */
export type { DocumentPreviewRequest } from '@/features/quotes/types';

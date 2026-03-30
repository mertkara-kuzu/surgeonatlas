// Database types matching Supabase schema

export interface Doctor {
  id: string;
  title: string | null;
  first_name: string | null;
  last_name: string | null;
  slug: string;
  specialty_id: string | null;
  city: string;
  address: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  bio_tr: string | null;
  bio_en: string | null;
  meta_tr: string | null;
  meta_en: string | null;
  photo_url: string | null;
  verified: boolean;
  claimed: boolean;
  source_table: string | null;
  original_name: string | null;
  rating_avg: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  specialty?: Specialty;
}

export interface Facility {
  id: string;
  name: string;
  slug: string;
  facility_type: string | null;
  city: string;
  address: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  bio_tr: string | null;
  bio_en: string | null;
  meta_tr: string | null;
  meta_en: string | null;
  photo_url: string | null;
  verified: boolean;
  source_table: string | null;
  original_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Specialty {
  id: string;
  name_tr: string;
  name_en: string;
  slug: string;
  description_tr: string | null;
  description_en: string | null;
  icon: string | null;
}

export interface Review {
  id: string;
  doctor_id: string;
  user_id: string | null;
  rating: number;
  text: string | null;
  verified: boolean;
  created_at: string;
  // Joined
  profile?: Profile;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "patient" | "doctor" | "admin";
  language_pref: "tr" | "en";
  avatar_url: string | null;
}

export interface BookingRequest {
  id: string;
  doctor_id: string;
  user_id: string | null;
  patient_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  message: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  matchedDoctors?: Doctor[];
}

// Helper types
export interface DoctorFilters {
  city?: string;
  specialty?: string;
  search?: string;
  sort?: "newest" | "rating" | "name";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
}

// City info for landing pages
export interface CityInfo {
  name: string;
  slug: string;
  doctorCount: number;
}

export const TURKISH_CITIES = [
  "Istanbul", "Ankara", "Izmir", "Antalya", "Bursa", "Adana",
  "Konya", "Gaziantep", "Mersin", "Kayseri", "Eskisehir",
  "Diyarbakir", "Samsun", "Trabzon", "Denizli", "Malatya",
] as const;

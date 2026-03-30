import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Doctor, DoctorFilters, PaginatedResponse, Specialty } from "./types";
import { MOCK_DOCTORS, MOCK_SPECIALTIES } from "./mock-data";

// ============================================================
// SUPABASE CLIENT (nullable when env vars are missing)
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================================
// DOCTORS
// ============================================================

export async function getDoctors(
  filters: DoctorFilters = {}
): Promise<PaginatedResponse<Doctor>> {
  const { city, specialty, search, sort = "name", page = 1, limit = 20 } = filters;

  // --- MOCK fallback ---
  if (!supabase) {
    let results = [...MOCK_DOCTORS];

    if (city) results = results.filter((d) => d.city.toLowerCase() === city.toLowerCase());
    if (specialty) results = results.filter((d) => d.specialty_id === specialty);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (d) =>
          (d.first_name && d.first_name.toLowerCase().includes(q)) ||
          (d.last_name && d.last_name.toLowerCase().includes(q)) ||
          (d.original_name && d.original_name.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case "rating":
        results.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
        break;
      case "newest":
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "name":
      default:
        results.sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''));
    }

    const from = (page - 1) * limit;
    const paged = results.slice(from, from + limit);

    return {
      data: paged,
      count: results.length,
      page,
      totalPages: Math.ceil(results.length / limit),
    };
  }

  // --- Supabase ---
  let query = supabase
    .from("doctors")
    .select("*, specialty:specialties(*)", { count: "exact" });

  if (city) query = query.eq("city", city);
  if (specialty) query = query.eq("specialty_id", specialty);
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,original_name.ilike.%${search}%`
    );
  }

  switch (sort) {
    case "rating":
      query = query.order("rating_avg", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "name":
    default:
      query = query.order("last_name", { ascending: true });
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data as Doctor[]) || [],
    count: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  if (!supabase) {
    return MOCK_DOCTORS.find((d) => d.slug === slug) || null;
  }

  const { data, error } = await supabase
    .from("doctors")
    .select("*, specialty:specialties(*)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Doctor;
}

export async function getSimilarDoctors(
  doctor: Doctor,
  limit: number = 4
): Promise<Doctor[]> {
  if (!supabase) {
    return MOCK_DOCTORS.filter(
      (d) =>
        d.id !== doctor.id &&
        (d.specialty_id === doctor.specialty_id || d.city === doctor.city)
    ).slice(0, limit);
  }

  const { data } = await supabase
    .from("doctors")
    .select("*, specialty:specialties(*)")
    .eq("specialty_id", doctor.specialty_id)
    .eq("city", doctor.city)
    .neq("id", doctor.id)
    .limit(limit);

  return (data as Doctor[]) || [];
}

export async function getFeaturedDoctors(limit: number = 6): Promise<Doctor[]> {
  if (!supabase) {
    return [...MOCK_DOCTORS]
      .sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0))
      .slice(0, limit);
  }

  const { data } = await supabase
    .from("doctors")
    .select("*, specialty:specialties(*)")
    .order("rating_avg", { ascending: false })
    .limit(limit);

  return (data as Doctor[]) || [];
}

// ============================================================
// SPECIALTIES
// ============================================================

export async function getSpecialties(): Promise<Specialty[]> {
  if (!supabase) {
    return MOCK_SPECIALTIES.sort((a, b) => a.name_en.localeCompare(b.name_en));
  }

  const { data } = await supabase
    .from("specialties")
    .select("*")
    .neq("id", "genel")
    .order("name_en");

  return (data as Specialty[]) || [];
}

// ============================================================
// REVIEWS
// ============================================================

export async function getDoctorReviews(doctorId: string) {
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("reviews")
    .select("*, profile:profiles(full_name, avatar_url)")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });

  return data || [];
}

// ============================================================
// CITIES
// ============================================================

export async function getCitiesWithCounts() {
  if (!supabase) {
    const counts: Record<string, number> = {};
    MOCK_DOCTORS.forEach((d) => {
      counts[d.city] = (counts[d.city] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        doctorCount: count,
      }))
      .sort((a, b) => b.doctorCount - a.doctorCount);
  }

  const { data } = await supabase
    .from("doctors")
    .select("city")
    .not("city", "is", null);

  if (!data) return [];

  const counts: Record<string, number> = {};
  data.forEach((d) => {
    counts[d.city] = (counts[d.city] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      doctorCount: count,
    }))
    .sort((a, b) => b.doctorCount - a.doctorCount);
}

export async function searchDoctors(query: string): Promise<Doctor[]> {
  if (!supabase) {
    const q = query.toLowerCase();
    return MOCK_DOCTORS.filter(
      (d) =>
        (d.first_name && d.first_name.toLowerCase().includes(q)) ||
        (d.last_name && d.last_name.toLowerCase().includes(q)) ||
        (d.original_name && d.original_name.toLowerCase().includes(q)) ||
        d.city.toLowerCase().includes(q)
    );
  }

  const { data } = await supabase
    .from("doctors")
    .select("*, specialty:specialties(*)")
    .or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,original_name.ilike.%${query}%,city.ilike.%${query}%`
    )
    .order("rating_avg", { ascending: false })
    .limit(50);

  return (data as Doctor[]) || [];
}

export async function getSpecialtyBySlug(slug: string): Promise<Specialty | null> {
  if (!supabase) {
    return MOCK_SPECIALTIES.find((s) => s.slug === slug) || null;
  }

  const { data, error } = await supabase
    .from("specialties")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Specialty;
}

export async function getDoctorsBySpecialty(specialtyId: string): Promise<Doctor[]> {
  if (!supabase) {
    return MOCK_DOCTORS.filter((d) => d.specialty_id === specialtyId)
      .sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
  }

  const { data } = await supabase
    .from("doctors")
    .select("*, specialty:specialties(*)")
    .eq("specialty_id", specialtyId)
    .order("rating_avg", { ascending: false });

  return (data as Doctor[]) || [];
}

export async function getSpecialtiesForCity(city: string): Promise<Specialty[]> {
  if (!supabase) {
    const specialtyIds = new Set(
      MOCK_DOCTORS.filter((d) => d.city.toLowerCase() === city.toLowerCase())
        .map((d) => d.specialty_id)
        .filter(Boolean)
    );
    return MOCK_SPECIALTIES.filter((s) => specialtyIds.has(s.id));
  }

  const { data: doctors } = await supabase
    .from("doctors")
    .select("specialty_id")
    .ilike("city", city)
    .not("specialty_id", "is", null);

  if (!doctors) return [];

  const ids = [...new Set(doctors.map((d) => d.specialty_id))];
  const { data } = await supabase
    .from("specialties")
    .select("*")
    .in("id", ids);

  return (data as Specialty[]) || [];
}

export async function getDoctorsByCityAndSpecialty(
  city: string,
  specialtySlug: string
): Promise<Doctor[]> {
  if (!supabase) {
    const spec = MOCK_SPECIALTIES.find((s) => s.slug === specialtySlug);
    if (!spec) return [];
    return MOCK_DOCTORS.filter(
      (d) =>
        d.city.toLowerCase() === city.toLowerCase() &&
        d.specialty_id === spec.id
    );
  }

  const specResult = await getSpecialtyBySlug(specialtySlug);
  if (!specResult) return [];

  const { data } = await supabase
    .from("doctors")
    .select("*, specialty:specialties(*)")
    .ilike("city", city)
    .eq("specialty_id", specResult.id)
    .order("rating_avg", { ascending: false });

  return (data as Doctor[]) || [];
}

export async function getDoctorsByCity(city: string): Promise<Doctor[]> {
  if (!supabase) {
    return MOCK_DOCTORS.filter(
      (d) => d.city.toLowerCase() === city.toLowerCase()
    ).sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
  }

  const { data } = await supabase
    .from("doctors")
    .select("*, specialty:specialties(*)")
    .ilike("city", city)
    .order("rating_avg", { ascending: false });

  return (data as Doctor[]) || [];
}

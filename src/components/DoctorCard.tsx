import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MapPin, Star, BadgeCheck, Phone } from "lucide-react";
import type { Doctor } from "@/lib/types";

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const t = useTranslations("common");
  const locale = useLocale();

  const fullName = [doctor.title, doctor.first_name, doctor.last_name]
    .filter(Boolean)
    .join(" ");

  const specialtyName = doctor.specialty
    ? locale === "tr"
      ? doctor.specialty.name_tr
      : doctor.specialty.name_en
    : null;

  return (
    <Link href={`/doctors/${doctor.slug}`} className="card group block">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <span className="text-lg font-bold">
            {(doctor.first_name?.[0] || "D")}
            {(doctor.last_name?.[0] || "")}
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors">
                {fullName || doctor.original_name}
              </h3>
              {specialtyName && (
                <p className="mt-0.5 text-sm text-primary-600">{specialtyName}</p>
              )}
            </div>
            {doctor.verified && (
              <span className="badge-verified flex-shrink-0">
                <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                {t("verified")}
              </span>
            )}
          </div>

          {/* Location */}
          <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{doctor.city}</span>
            {doctor.address && (
              <span className="hidden truncate sm:inline"> &middot; {doctor.address}</span>
            )}
          </div>

          {/* Rating + Phone */}
          <div className="mt-2 flex items-center gap-4">
            {doctor.rating_avg > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-gray-700">
                  {doctor.rating_avg.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  ({doctor.review_count} {t("reviews")})
                </span>
              </div>
            )}
            {doctor.phone && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Phone className="h-3.5 w-3.5" />
                <span>{doctor.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

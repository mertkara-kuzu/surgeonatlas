import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import SearchBar from "@/components/SearchBar";
import {
  BadgeCheck, BotMessageSquare, Star, ArrowRight,
  Scissors, Eye, Bone, Heart, Baby, Brain, Smile
} from "lucide-react";

const SPECIALTIES_PREVIEW = [
  { icon: Scissors, slugEn: "plastic-surgery", nameTr: "Plastik Cerrahi", nameEn: "Plastic Surgery" },
  { icon: Smile, slugEn: "dentistry", nameTr: "Dis Hekimligi", nameEn: "Dentistry" },
  { icon: Eye, slugEn: "ophthalmology", nameTr: "Goz Hastaliklari", nameEn: "Ophthalmology" },
  { icon: Bone, slugEn: "orthopedics", nameTr: "Ortopedi", nameEn: "Orthopedics" },
  { icon: Heart, slugEn: "cardiology", nameTr: "Kardiyoloji", nameEn: "Cardiology" },
  { icon: Baby, slugEn: "obstetrics-gynecology", nameTr: "Kadin Dogum", nameEn: "OB/GYN" },
  { icon: Brain, slugEn: "neurology", nameTr: "Noroloji", nameEn: "Neurology" },
];

const CITIES_PREVIEW = [
  { name: "Istanbul", count: 850 },
  { name: "Ankara", count: 320 },
  { name: "Izmir", count: 210 },
  { name: "Antalya", count: 180 },
  { name: "Bursa", count: 120 },
  { name: "Adana", count: 95 },
];

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-6 text-lg text-primary-100 sm:text-xl">
              {t("home.heroSubtitle")}
            </p>
            <div className="mt-10">
              <SearchBar size="lg" />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-200">
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4" /> 2,500+ {locale === "tr" ? "Dogrulanmis Doktor" : "Verified Doctors"}
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4" /> 81 {locale === "tr" ? "Sehir" : "Cities"}
              </span>
              <span className="flex items-center gap-1.5">
                <BotMessageSquare className="h-4 w-4" /> AI {locale === "tr" ? "Destekli" : "Powered"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-gray-900">
            {t("home.popularSpecialties")}
          </h2>
          <Link href="/specialties" className="flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600">
            {t("common.seeAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {SPECIALTIES_PREVIEW.map((spec) => {
            const Icon = spec.icon;
            return (
              <Link
                key={spec.slugEn}
                href={`/specialties/${spec.slugEn}`}
                className="group flex flex-col items-center rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500 transition-colors group-hover:bg-primary-100">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="mt-3 text-xs font-medium text-gray-700">
                  {locale === "tr" ? spec.nameTr : spec.nameEn}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Cities */}
      <section className="bg-medical-gray">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900">
            {t("home.popularCities")}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CITIES_PREVIEW.map((city) => (
              <Link
                key={city.name}
                href={`/${city.name.toLowerCase()}`}
                className="group rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-500">
                  {city.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {city.count} {locale === "tr" ? "doktor" : "doctors"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-2xl font-bold text-gray-900">
          {t("home.whyChooseUs")}
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            { icon: BadgeCheck, title: t("home.benefit1Title"), desc: t("home.benefit1Desc"), color: "text-green-500 bg-green-50" },
            { icon: BotMessageSquare, title: t("home.benefit2Title"), desc: t("home.benefit2Desc"), color: "text-primary-500 bg-primary-50" },
            { icon: Star, title: t("home.benefit3Title"), desc: t("home.benefit3Desc"), color: "text-amber-500 bg-amber-50" },
          ].map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div key={i} className="card text-center">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${benefit.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{benefit.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA - AI Surgeon Finder */}
      <section className="bg-gradient-to-r from-accent-500 to-accent-600">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-white">
            {t("home.ctaTitle")}
          </h2>
          <p className="mt-4 text-lg text-accent-100">{t("home.ctaSubtitle")}</p>
          <Link href="/find-surgeon" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-accent-600 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl">
            <BotMessageSquare className="h-5 w-5" />
            {t("home.ctaButton")}
          </Link>
        </div>
      </section>
    </>
  );
}

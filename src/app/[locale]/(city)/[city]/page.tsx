import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getDoctorsByCity, getSpecialtiesForCity } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';
import { MapPin } from 'lucide-react';

export async function generateMetadata(props: {
  params: Promise<{ locale: string; city: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const cityName = params.city.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `Doctors in ${cityName}`,
    description: `Find verified doctors in ${cityName}, Turkey`,
  };
}

export default async function CityPage(props: {
  params: Promise<{ locale: string; city: string }>;
}) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale });
  const locale = params.locale;

  const citySlug = params.city;
  const cityName = citySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const [doctors, specialties] = await Promise.all([
    getDoctorsByCity(citySlug),
    getSpecialtiesForCity(citySlug),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <MapPin size={32} />
            <h1 className="text-4xl font-bold">{cityName}</h1>
          </div>
          <p className="text-primary-100 text-lg">
            {doctors.length} {t('nav.doctors').toLowerCase()}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {specialties.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('nav.specialties')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {specialties.map((spec) => (
                <Link
                  key={spec.id}
                  href={`/${citySlug}/${spec.slug}`}
                  className="px-4 py-3 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-lg text-center transition-colors"
                >
                  <p className="font-medium text-gray-900 text-sm">
                    {locale === 'tr' ? spec.name_tr : spec.name_en}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('common.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

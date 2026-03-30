import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getDoctorsByCityAndSpecialty } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';

export async function generateMetadata(props: {
  params: Promise<{ locale: string; city: string; specialty: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const cityName = params.city.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const specName = params.specialty.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${specName} in ${cityName}`,
    description: `Find ${specName} doctors in ${cityName}, Turkey`,
  };
}

export default async function CitySpecialtyPage(props: {
  params: Promise<{ locale: string; city: string; specialty: string }>;
}) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale });

  const citySlug = params.city;
  const specialtySlug = params.specialty;
  const cityName = citySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const specName = specialtySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const doctors = await getDoctorsByCityAndSpecialty(citySlug, specialtySlug);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link
              href={`/${citySlug}`}
              className="text-primary-100 hover:text-white text-sm font-medium"
            >
              ← {cityName}
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {specName} — {cityName}
          </h1>
          <p className="text-primary-100 text-lg">
            {doctors.length} {t('nav.doctors').toLowerCase()}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-6">{t('common.noResults')}</p>
            <Link
              href={`/${citySlug}`}
              className="inline-block px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              {cityName}
            </Link>
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

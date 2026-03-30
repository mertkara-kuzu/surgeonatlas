import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getDoctorsByCityAndSpecialty } from '@/lib/supabase';
import { DoctorCard } from '@/components/DoctorCard';
import { MapPin } from 'lucide-react';

export async function generateMetadata(props: {
  params: Promise<{ locale: string; city: string; specialty: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const city = params.city.replace(/-/g, ' ').toUpperCase();
  const specialty = params.specialty.replace(/-/g, ' ').toUpperCase();

  return {
    title: `${specialty} in ${city}`,
    description: `Find ${specialty} doctors in ${city}`,
  };
}

export default async function CitySpecialtyPage(props: {
  params: Promise<{ locale: string; city: string; specialty: string }>;
}) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale });

  const citySlug = params.city;
  const specialtySlug = params.specialty;
  const cityName = citySlug.replace(/-/g, ' ').toUpperCase();
  const specialtyName = specialtySlug.replace(/-/g, ' ');

  const doctors = await getDoctorsByCityAndSpecialty(citySlug, specialtySlug);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link
              href={`/${params.locale}/${citySlug}`}
              className="text-primary-100 hover:text-white text-sm font-medium inline-flex items-center gap-1"
            >
              ← {cityName}
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {specialtyName} {t('common.in')} {cityName}
          </h1>
          <p className="text-primary-100 text-lg">
            {t('city.foundDoctors', { count: doctors.length })}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
            <p className="text-gray-600 text-sm font-medium">
              {specialtyName} {t('common.specialists')}
            </p>
            <p className="text-4xl font-bold text-primary-600 mt-2">
              {doctors.length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg p-6 border border-accent-200">
            <p className="text-gray-600 text-sm font-medium">
              {t('common.verified')}
            </p>
            <p className="text-4xl font-bold text-accent-600 mt-2">
              {doctors.filter((d) => d.is_verified).length}
            </p>
          </div>
        </div>

        {/* Doctors */}
        {doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-6">
              {t('city.noDoctorsFound')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href={`/${params.locale}/${citySlug}`}
                className="inline-block px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                {t('common.viewAllDoctors', { city: cityName })}
              </Link>
              <Link
                href="/doctors"
                className="inline-block px-6 py-2 border-2 border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50"
              >
                {t('common.browseDoctors')}
              </Link>
            </div>
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

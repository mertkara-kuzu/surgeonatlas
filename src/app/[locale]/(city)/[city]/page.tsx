import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  getDoctorsByCity,
  getSpecialtiesForCity,
} from '@/lib/supabase';
import { DoctorCard } from '@/components/DoctorCard';
import { MapPin } from 'lucide-react';

export async function generateMetadata(props: {
  params: Promise<{ locale: string; city: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const city = params.city.replace('-', ' ').toUpperCase();

  return {
    title: `Doctors in ${city}`,
    description: `Find and connect with verified doctors in ${city}`,
  };
}

export default async function CityPage(props: {
  params: Promise<{ locale: string; city: string }>;
}) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale });

  const citySlug = params.city;
  const cityName = citySlug.replace(/-/g, ' ').toUpperCase();

  const [doctors, specialties] = await Promise.all([
    getDoctorsByCity(citySlug),
    getSpecialtiesForCity(citySlug),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <MapPin size={32} />
            <h1 className="text-4xl font-bold">{t('city.doctorsIn', { city: cityName })}</h1>
          </div>
          <p className="text-primary-100 text-lg">
            {t('city.foundDoctors', { count: doctors.length })}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
            <p className="text-gray-600 text-sm font-medium">
              {t('city.totalDoctors')}
            </p>
            <p className="text-4xl font-bold text-primary-600 mt-2">
              {doctors.length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg p-6 border border-accent-200">
            <p className="text-gray-600 text-sm font-medium">
              {t('city.specialties')}
            </p>
            <p className="text-4xl font-bold text-accent-600 mt-2">
              {specialties.length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <p className="text-gray-600 text-sm font-medium">
              {t('city.verified')}
            </p>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {doctors.filter((d) => d.is_verified).length}
            </p>
          </div>
        </div>

        {/* Specialties */}
        {specialties.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('city.specialtiesAvailable')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {specialties.map((specialty) => (
                <Link
                  key={specialty.id}
                  href={`/${params.locale}/${citySlug}/${specialty.slug}`}
                  className="px-4 py-3 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-lg text-center transition-colors"
                >
                  <p className="font-medium text-gray-900 text-sm">
                    {specialty.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {specialty.doctor_count}{' '}
                    {specialty.doctor_count === 1
                      ? t('common.doctor')
                      : t('common.doctors')}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Doctors */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('city.allDoctors')}
          </h2>

          {doctors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {t('city.noDoctorsFound')}
              </p>
              <Link
                href="/doctors"
                className="inline-block mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                {t('common.browseDoctors')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

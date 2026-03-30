import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getDoctorsBySpecialty, getSpecialtyBySlug } from '@/lib/supabase';
import { DoctorCard } from '@/components/DoctorCard';
import { Stethoscope } from 'lucide-react';

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  try {
    const specialty = await getSpecialtyBySlug(params.slug, params.locale);

    return {
      title: specialty?.name,
      description: specialty?.description || `${specialty?.name} specialists`,
    };
  } catch {
    return {
      title: 'Specialty Not Found',
    };
  }
}

export default async function SpecialtyPage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale });

  const specialty = await getSpecialtyBySlug(params.slug, params.locale);
  const doctors = await getDoctorsBySpecialty(params.slug);

  if (!specialty) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('common.notFound')}
          </h1>
          <p className="text-gray-600 mb-8">{t('specialty.notFound')}</p>
          <Link
            href="/specialties"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            {t('common.backToSpecialties')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope size={32} />
            <h1 className="text-4xl font-bold">{specialty.name}</h1>
          </div>
          <p className="text-primary-100 text-lg">
            {t('specialty.foundSpecialists', { count: doctors.length })}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Description */}
        {specialty.description && (
          <section className="mb-12 bg-gray-50 rounded-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('specialty.about')}
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {specialty.description}
            </p>
          </section>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
            <p className="text-gray-600 text-sm font-medium">
              {t('specialty.totalSpecialists')}
            </p>
            <p className="text-4xl font-bold text-primary-600 mt-2">
              {doctors.length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg p-6 border border-accent-200">
            <p className="text-gray-600 text-sm font-medium">
              {t('specialty.verified')}
            </p>
            <p className="text-4xl font-bold text-accent-600 mt-2">
              {doctors.filter((d) => d.is_verified).length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <p className="text-gray-600 text-sm font-medium">
              {t('specialty.averageExperience')}
            </p>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {Math.round(
                doctors.reduce((sum, d) => sum + d.experience_years, 0) /
                  doctors.length
              )}
              {t('specialty.years')}
            </p>
          </div>
        </div>

        {/* Doctors */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('specialty.specialists')}
          </h2>

          {doctors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {t('specialty.noDoctorsFound')}
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

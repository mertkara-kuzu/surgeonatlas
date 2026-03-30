import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getDoctorsBySpecialty, getSpecialtyBySlug } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';
import { Stethoscope } from 'lucide-react';

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const specialty = await getSpecialtyBySlug(params.slug);
  const name = specialty
    ? params.locale === 'tr' ? specialty.name_tr : specialty.name_en
    : 'Specialty';

  return {
    title: name,
    description: `${name} specialists in Turkey`,
  };
}

export default async function SpecialtyPage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale });
  const locale = params.locale;

  const specialty = await getSpecialtyBySlug(params.slug);

  if (!specialty) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">{t('common.noResults')}</p>
          <Link
            href="/specialties"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            {t('nav.specialties')}
          </Link>
        </div>
      </div>
    );
  }

  const doctors = await getDoctorsBySpecialty(specialty.id);
  const specName = locale === 'tr' ? specialty.name_tr : specialty.name_en;
  const specDesc = locale === 'tr' ? specialty.description_tr : specialty.description_en;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope size={32} />
            <h1 className="text-4xl font-bold">{specName}</h1>
          </div>
          <p className="text-primary-100 text-lg">
            {doctors.length} {t('nav.doctors').toLowerCase()}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {specDesc && (
          <section className="mb-12 bg-gray-50 rounded-lg p-8 border border-gray-200">
            <p className="text-gray-700 leading-relaxed text-lg">{specDesc}</p>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
            <p className="text-gray-600 text-sm font-medium">{t('nav.doctors')}</p>
            <p className="text-4xl font-bold text-primary-600 mt-2">{doctors.length}</p>
          </div>
          <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg p-6 border border-accent-200">
            <p className="text-gray-600 text-sm font-medium">{t('common.verified')}</p>
            <p className="text-4xl font-bold text-accent-600 mt-2">
              {doctors.filter((d) => d.verified).length}
            </p>
          </div>
        </div>

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

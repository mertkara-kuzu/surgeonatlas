import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getSpecialties } from '@/lib/supabase';
import { Stethoscope } from 'lucide-react';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: 'specialties' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function SpecialtiesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale });
  const locale = params.locale;

  const specialties = await getSpecialties();

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope size={32} />
            <h1 className="text-4xl font-bold">{t('specialties.title')}</h1>
          </div>
          <p className="text-primary-100 text-lg">{t('specialties.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {specialties.map((spec) => (
            <Link
              key={spec.id}
              href={`/specialties/${spec.slug}`}
              className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors">
                {locale === 'tr' ? spec.name_tr : spec.name_en}
              </h3>
              {spec.description_en && (
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {locale === 'tr' ? spec.description_tr : spec.description_en}
                </p>
              )}
            </Link>
          ))}
        </div>

        {specialties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('common.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

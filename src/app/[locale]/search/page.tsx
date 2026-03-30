import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { searchDoctors } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';
import { Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Search Results',
  description: 'Search results for doctors',
};

export default async function SearchPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const t = await getTranslations({ locale: params.locale });

  const query = searchParams.q || '';
  const doctors = query ? await searchDoctors(query) : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">
            {t('search.title')}
          </h1>
          <p className="text-primary-100">
            {query
              ? t('search.resultsFor', { query })
              : t('search.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <form action="" method="get" className="mb-12">
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder={t('search.placeholder')}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Results */}
        {!query ? (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              {t('search.enterQuery')}
            </p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-6">
              {t('search.noResults', { query })}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/doctors"
                className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                {t('common.browseDoctors')}
              </Link>
              <Link
                href="/find-surgeon"
                className="inline-block px-6 py-3 border-2 border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50"
              >
                {t('search.tryAI')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                {t('search.foundResults', { count: doctors.length })}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

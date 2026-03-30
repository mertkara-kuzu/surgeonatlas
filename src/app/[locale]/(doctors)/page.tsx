import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getDoctors, getSpecialties, getCitiesWithCounts } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';
import { Search } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default async function DoctorsPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    city?: string;
    specialty?: string;
    search?: string;
    sort?: string;
  }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const t = await getTranslations({ locale: params.locale });
  const locale = params.locale;

  const page = parseInt(searchParams.page || '1', 10);
  const city = searchParams.city || '';
  const specialty = searchParams.specialty || '';
  const search = searchParams.search || '';
  const sort = (searchParams.sort || 'name') as 'name' | 'rating' | 'newest';

  const result = await getDoctors({
    city,
    specialty,
    search,
    sort,
    limit: ITEMS_PER_PAGE,
    page,
  });

  const doctors = result.data;
  const total = result.count;
  const totalPages = result.totalPages;

  const [specialties, cities] = await Promise.all([
    getSpecialties(),
    getCitiesWithCounts(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">{t('doctors.title')}</h1>
          <p className="text-primary-100">{t('doctors.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {t('common.filters')}
              </h2>

              {/* Specialty Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('common.specialty')}
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <Link
                    href={`/doctors?sort=${sort}${city ? `&city=${city}` : ''}`}
                    className={`block px-3 py-2 rounded-md text-sm ${
                      !specialty
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t('common.allSpecialties')}
                  </Link>
                  {specialties.map((spec) => (
                    <Link
                      key={spec.id}
                      href={`/doctors?specialty=${spec.slug}&sort=${sort}${city ? `&city=${city}` : ''}`}
                      className={`block px-3 py-2 rounded-md text-sm ${
                        specialty === spec.slug
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {locale === 'tr' ? spec.name_tr : spec.name_en}
                    </Link>
                  ))}
                </div>
              </div>

              {/* City Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('common.city')}
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <Link
                    href={`/doctors?sort=${sort}${specialty ? `&specialty=${specialty}` : ''}`}
                    className={`block px-3 py-2 rounded-md text-sm ${
                      !city
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t('common.allCities')}
                  </Link>
                  {cities.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/doctors?city=${c.slug}&sort=${sort}${specialty ? `&specialty=${specialty}` : ''}`}
                      className={`block px-3 py-2 rounded-md text-sm flex justify-between ${
                        city === c.slug
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {c.doctorCount}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-gray-600">
                {t('doctors.resultsCount', { count: total })}
              </p>
            </div>

            {doctors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {t('common.noResults')}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {doctors.map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`/doctors?page=${p}&sort=${sort}${city ? `&city=${city}` : ''}${specialty ? `&specialty=${specialty}` : ''}`}
                        className={`px-4 py-2 rounded-md ${
                          p === page
                            ? 'bg-primary-500 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getDoctors, getSpecialties, getCitiesWithCounts } from '@/lib/supabase';
import { DoctorCard } from '@/components/DoctorCard';
import { ChevronDown, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Find Doctors',
  description: 'Browse our network of verified medical professionals',
};

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

  const page = parseInt(searchParams.page || '1', 10);
  const city = searchParams.city || '';
  const specialty = searchParams.specialty || '';
  const search = searchParams.search || '';
  const sort = searchParams.sort || 'name';

  // Fetch doctors with filters
  const { doctors, total } = await getDoctors({
    city,
    specialty,
    search,
    sort,
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
  });

  const [specialties, cities] = await Promise.all([
    getSpecialties(),
    getCitiesWithCounts(),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const buildFilterUrl = (newFilters: Record<string, string | null>) => {
    const params = new URLSearchParams();
    const filters = { city, specialty, search, sort, ...newFilters };

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', '1');

    return `?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {t('doctors.filters')}
              </h2>

              {/* Search Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.search')}
                </label>
                <form action="" method="get" className="flex gap-2">
                  <input
                    type="hidden"
                    name="city"
                    value={city}
                  />
                  <input
                    type="hidden"
                    name="specialty"
                    value={specialty}
                  />
                  <input
                    type="hidden"
                    name="sort"
                    value={sort}
                  />
                  <input
                    type="text"
                    name="search"
                    placeholder={t('doctors.searchPlaceholder')}
                    defaultValue={search}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                  >
                    <Search size={18} />
                  </button>
                </form>
              </div>

              {/* Specialty Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('doctors.specialty')}
                </label>
                <div className="space-y-2">
                  <Link
                    href={buildFilterUrl({ specialty: null })}
                    className={`block px-3 py-2 rounded-md text-sm ${
                      !specialty
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t('common.all')}
                  </Link>
                  {specialties.map((spec) => (
                    <Link
                      key={spec.id}
                      href={buildFilterUrl({ specialty: spec.slug })}
                      className={`block px-3 py-2 rounded-md text-sm ${
                        specialty === spec.slug
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {spec.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* City Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('doctors.city')}
                </label>
                <div className="space-y-2">
                  <Link
                    href={buildFilterUrl({ city: null })}
                    className={`block px-3 py-2 rounded-md text-sm ${
                      !city
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t('common.all')}
                  </Link>
                  {cities.map((c) => (
                    <Link
                      key={c.id}
                      href={buildFilterUrl({ city: c.slug })}
                      className={`block px-3 py-2 rounded-md text-sm flex justify-between ${
                        city === c.slug
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {c.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('doctors.sortBy')}
                </label>
                <select
                  value={sort}
                  onChange={(e) => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('sort', e.target.value);
                    window.location.href = url.toString();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="name">{t('doctors.sortName')}</option>
                  <option value="rating">{t('doctors.sortRating')}</option>
                  <option value="newest">{t('doctors.sortNewest')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Info */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                {t('doctors.showing', { total, page, pages: totalPages })}
              </p>
            </div>

            {doctors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {t('doctors.noResults')}
                </p>
              </div>
            ) : (
              <>
                {/* Doctor Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {doctors.map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    {page > 1 && (
                      <Link
                        href={buildFilterUrl({ page: String(page - 1) })}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        {t('common.previous')}
                      </Link>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={buildFilterUrl({ page: String(p) })}
                        className={`px-4 py-2 rounded-md ${
                          p === page
                            ? 'bg-primary-500 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </Link>
                    ))}

                    {page < totalPages && (
                      <Link
                        href={buildFilterUrl({ page: String(page + 1) })}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        {t('common.next')}
                      </Link>
                    )}
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

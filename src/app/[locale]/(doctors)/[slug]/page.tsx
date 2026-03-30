import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  getDoctorBySlug,
  getDoctorReviews,
  getSimilarDoctors,
} from '@/lib/supabase';
import { Doctor } from '@/lib/types';
import { DoctorCard } from '@/components/DoctorCard';
import {
  MapPin,
  Phone,
  Star,
  CheckCircle,
  Calendar,
  MessageSquare,
} from 'lucide-react';

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const doctor = await getDoctorBySlug(params.slug, params.locale);

  if (!doctor) {
    return {
      title: 'Doctor Not Found',
    };
  }

  return {
    title: `${doctor.first_name} ${doctor.last_name} - ${doctor.specialty}`,
    description: doctor.bio || `${doctor.specialty} specialist`,
  };
}

export default async function DoctorProfilePage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale });

  const doctor = await getDoctorBySlug(params.slug, params.locale);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('common.notFound')}
          </h1>
          <p className="text-gray-600 mb-8">{t('doctor.notFound')}</p>
          <Link
            href="/doctors"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            {t('common.backToDoctors')}
          </Link>
        </div>
      </div>
    );
  }

  const [reviews, similarDoctors] = await Promise.all([
    getDoctorReviews(doctor.id, 5),
    getSimilarDoctors(doctor.id, doctor.specialty, 3),
  ]);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Background */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Doctor Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg -mt-16 relative z-10 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white text-4xl font-bold">
                {doctor.first_name[0]}
                {doctor.last_name[0]}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">
                  {doctor.title} {doctor.first_name} {doctor.last_name}
                </h1>
                {doctor.is_verified && (
                  <CheckCircle
                    size={28}
                    className="text-green-500"
                    fill="currentColor"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full font-medium">
                  {doctor.specialty}
                </span>
                {doctor.subspecialties && (
                  <span className="inline-block px-4 py-2 bg-accent-100 text-accent-700 rounded-full font-medium">
                    {doctor.subspecialties}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(Number(averageRating))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                  <span className="ml-2 font-semibold text-gray-900">
                    {averageRating}
                  </span>
                  <span className="text-gray-600">
                    ({reviews.length} {t('doctor.reviews')})
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                {doctor.experience_years} {t('doctor.yearsExperience')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium">
                  <Calendar size={18} />
                  {t('doctor.requestAppointment')}
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 font-medium">
                  <MessageSquare size={18} />
                  {t('doctor.sendMessage')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            {doctor.bio && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('doctor.about')}
                </h2>
                <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
              </section>
            )}

            {/* Contact Info */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('doctor.contactInfo')}
              </h2>
              <div className="space-y-4">
                {doctor.phone && (
                  <div className="flex items-center gap-3">
                    <Phone
                      size={20}
                      className="text-primary-500 flex-shrink-0"
                    />
                    <span className="text-gray-700">{doctor.phone}</span>
                  </div>
                )}
                {doctor.address && (
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={20}
                      className="text-primary-500 flex-shrink-0 mt-1"
                    />
                    <div>
                      <p className="text-gray-700">{doctor.address}</p>
                      <p className="text-gray-600">
                        {doctor.city}, {doctor.state}
                      </p>
                      {/* Map Placeholder */}
                      <div className="mt-4 bg-gray-200 rounded-lg h-64 flex items-center justify-center text-gray-500">
                        {t('doctor.mapPlaceholder')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('doctor.reviews')} ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <p className="text-gray-600">{t('doctor.noReviews')}</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {review.patient_name}
                        </h4>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {review.comment}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(review.created_at).toLocaleDateString(
                          params.locale
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Info */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-8 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                {t('doctor.quickInfo')}
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">{t('doctor.experience')}</p>
                  <p className="font-medium text-gray-900">
                    {doctor.experience_years} {t('doctor.years')}
                  </p>
                </div>
                {doctor.education && (
                  <div>
                    <p className="text-gray-600">{t('doctor.education')}</p>
                    <p className="font-medium text-gray-900">
                      {doctor.education}
                    </p>
                  </div>
                )}
                {doctor.languages && (
                  <div>
                    <p className="text-gray-600">{t('doctor.languages')}</p>
                    <p className="font-medium text-gray-900">
                      {doctor.languages}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Doctors */}
        {similarDoctors.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('doctor.similarDoctors')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarDoctors.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  getDoctorBySlug,
  getDoctorReviews,
  getSimilarDoctors,
} from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';
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
  const doctor = await getDoctorBySlug(params.slug);

  if (!doctor) {
    return { title: 'Doctor Not Found' };
  }

  const name = [doctor.title, doctor.first_name, doctor.last_name].filter(Boolean).join(' ');
  const bio = params.locale === 'tr' ? doctor.bio_tr : doctor.bio_en;

  return {
    title: name,
    description: bio || `${name} - SurgeonAtlas`,
  };
}

export default async function DoctorProfilePage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale });
  const locale = params.locale;

  const doctor = await getDoctorBySlug(params.slug);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">{t('common.noResults')}</p>
          <Link
            href="/doctors"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            {t('nav.doctors')}
          </Link>
        </div>
      </div>
    );
  }

  const [reviews, similarDoctors] = await Promise.all([
    getDoctorReviews(doctor.id),
    getSimilarDoctors(doctor),
  ]);

  const fullName = [doctor.title, doctor.first_name, doctor.last_name].filter(Boolean).join(' ');
  const bio = locale === 'tr' ? doctor.bio_tr : doctor.bio_en;
  const specialtyName = doctor.specialty
    ? locale === 'tr' ? doctor.specialty.name_tr : doctor.specialty.name_en
    : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Doctor Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg -mt-16 relative z-10 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white text-4xl font-bold">
                {(doctor.first_name?.[0] || 'D')}
                {(doctor.last_name?.[0] || '')}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {fullName || doctor.original_name}
                </h1>
                {doctor.verified && (
                  <CheckCircle size={24} className="text-green-500" />
                )}
              </div>

              {specialtyName && (
                <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full font-medium mb-4">
                  {specialtyName}
                </span>
              )}

              <div className="flex items-center gap-4 mb-4">
                {doctor.rating_avg > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={18} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-gray-900">
                      {doctor.rating_avg.toFixed(1)}
                    </span>
                    <span className="text-gray-600">
                      ({doctor.review_count} {t('common.reviews')})
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium">
                  <Calendar size={18} />
                  {t('doctorProfile.requestAppointment')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {bio && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('doctorProfile.about')}
                </h2>
                <p className="text-gray-700 leading-relaxed">{bio}</p>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('doctorProfile.contactInfo')}
              </h2>
              <div className="space-y-4">
                {doctor.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-primary-500 flex-shrink-0" />
                    <span className="text-gray-700">{doctor.phone}</span>
                  </div>
                )}
                {(doctor.address || doctor.city) && (
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-primary-500 flex-shrink-0 mt-1" />
                    <div>
                      {doctor.address && <p className="text-gray-700">{doctor.address}</p>}
                      <p className="text-gray-600">{doctor.city}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('doctorProfile.patientReviews')} ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <p className="text-gray-600">{t('common.noResults')}</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: { id: string; rating: number; text: string | null; created_at: string; profile?: { full_name: string | null } }) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {review.profile?.full_name || 'Anonymous'}
                        </h4>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                      {review.text && <p className="text-gray-600 text-sm mb-2">{review.text}</p>}
                      <p className="text-gray-500 text-xs">
                        {new Date(review.created_at).toLocaleDateString(locale)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
            {!doctor.claimed && (
              <div className="bg-accent-50 rounded-lg border border-accent-200 p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('doctorProfile.claimProfile')}
                </h3>
                <Link href="/auth/signup" className="btn-accent text-sm">
                  {t('doctorProfile.claimButton')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {similarDoctors.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('doctorProfile.similarDoctors')}
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

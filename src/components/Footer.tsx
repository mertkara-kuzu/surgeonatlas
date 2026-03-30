import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Stethoscope } from "lucide-react";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading text-lg font-bold text-primary-500">
                Surgeon<span className="text-accent-500">Atlas</span>
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-gray-500">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t("footer.quickLinks")}</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/doctors" className="text-sm text-gray-500 hover:text-primary-500">{t("nav.doctors")}</Link></li>
              <li><Link href="/specialties" className="text-sm text-gray-500 hover:text-primary-500">{t("nav.specialties")}</Link></li>
              <li><Link href="/find-surgeon" className="text-sm text-gray-500 hover:text-primary-500">{t("nav.findSurgeon")}</Link></li>
              <li><Link href="/auth/signup" className="text-sm text-gray-500 hover:text-primary-500">{t("common.signup")}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t("footer.legal")}</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/" className="text-sm text-gray-500 hover:text-primary-500">{t("footer.privacy")}</Link></li>
              <li><Link href="/" className="text-sm text-gray-500 hover:text-primary-500">{t("footer.terms")}</Link></li>
              <li><Link href="/" className="text-sm text-gray-500 hover:text-primary-500">{t("nav.contact")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6">
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} SurgeonAtlas. {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}

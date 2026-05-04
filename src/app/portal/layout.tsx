import { AuthProvider } from "@/lib/portal/auth";
import { I18nProvider } from "@/lib/portal/i18n";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>{children}</AuthProvider>
    </I18nProvider>
  );
}

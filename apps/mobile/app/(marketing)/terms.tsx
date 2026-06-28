import { LegalPage } from "@/components/marketing/LegalPage";
import { useTranslation } from "react-i18next";

export default function TermsScreen() {
  const { t } = useTranslation("marketing");
  return (
    <LegalPage
      docKey="terms"
      metaTitle={t("legal.terms.meta.title")}
      metaDescription={t("legal.terms.meta.description")}
      metaCanonical={t("legal.terms.meta.canonical")}
    />
  );
}

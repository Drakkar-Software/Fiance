import { LegalPage } from "@/components/marketing/LegalPage";
import { useTranslation } from "react-i18next";

export default function PrivacyScreen() {
  const { t } = useTranslation("marketing");
  return (
    <LegalPage
      docKey="privacy"
      metaTitle={t("legal.privacy.meta.title")}
      metaDescription={t("legal.privacy.meta.description")}
      metaCanonical={t("legal.privacy.meta.canonical")}
    />
  );
}

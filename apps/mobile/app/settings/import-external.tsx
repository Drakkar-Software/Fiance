import React from "react";
import { View, Text, ScrollView } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { FileSpreadsheet, Globe } from "lucide-react-native";
import { SectionTitle, FormCard } from "@/components/FormSection";
import { SettingsRow } from "@/components/SettingsRow";

export default function ImportExternalScreen() {
  const { t } = useTranslation("settings");
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-accent-paper" showsVerticalScrollIndicator={false}>
      <View className="px-4 pt-4">
        <SectionTitle>{t("importExternalSection")}</SectionTitle>
        <Text className="text-sm text-mute leading-5 mb-3 -mt-1">
          {t("importExternalChooserDesc")}
        </Text>
        <FormCard>
          <SettingsRow
            icon={<FileSpreadsheet size={18} color="#10B981" />}
            label={t("importSourceFile")}
            sublabel={t("importSourceFileDesc")}
            onPress={() => router.push("/settings/import-file?source=file")}
          />
          <SettingsRow
            icon={<Globe size={18} color="#b96a4a" />}
            label={t("importSourceMariagesNet")}
            sublabel={t("importSourceMariagesNetDesc")}
            onPress={() => router.push("/settings/import-file?source=mariagesnet")}
            last
          />
        </FormCard>
      </View>
    </ScrollView>
  );
}

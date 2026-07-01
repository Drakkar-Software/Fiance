import React from "react";
import { PinSetup as UiPinSetup } from "@fiance/ui/components";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "react";

type PinSetupProps = ComponentProps<typeof UiPinSetup>;

export function PinSetup(props: PinSetupProps) {
  const { t } = useTranslation("settings");
  return (
    <UiPinSetup
      labels={{
        createTitle: t("pinSetup.createTitle"),
        confirmTitle: t("pinSetup.confirmTitle"),
        createSubtitle: t("pinSetup.createSubtitle"),
        confirmSubtitle: t("pinSetup.confirmSubtitle"),
        mismatchError: t("pinSetup.mismatchError"),
      }}
      {...props}
    />
  );
}

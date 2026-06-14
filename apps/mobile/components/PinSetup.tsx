import React from "react";
import { PinSetup as SeahorsePinSetup } from "@drakkar.software/seahorse/components";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "react";

type PinSetupProps = ComponentProps<typeof SeahorsePinSetup>;

export function PinSetup(props: PinSetupProps) {
  const { t } = useTranslation("settings");
  return (
    <SeahorsePinSetup
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

import React from "react";
import { PinSetup as SeahorsePinSetup } from "@drakkar.software/seahorse/components";
import type { ComponentProps } from "react";

type PinSetupProps = ComponentProps<typeof SeahorsePinSetup>;

export function PinSetup(props: PinSetupProps) {
  return (
    <SeahorsePinSetup
      labels={{
        createTitle: "Créer un code PIN",
        confirmTitle: "Confirmer le code PIN",
        createSubtitle: "Choisissez un code à 4 chiffres",
        confirmSubtitle: "Entrez le même code pour confirmer",
        mismatchError: "Les codes ne correspondent pas",
      }}
      {...props}
    />
  );
}

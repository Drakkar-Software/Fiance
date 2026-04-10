import React, { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react-native";

interface QRScannerScreenProps {
  onScanned: (url: string) => void;
  onClose: () => void;
}

export function QRScannerScreen({ onScanned, onClose }: QRScannerScreenProps) {
  const { t } = useTranslation("common");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned) return;
      setScanned(true);
      onScanned(data);
    },
    [scanned, onScanned]
  );

  if (!permission) {
    return <View style={StyleSheet.absoluteFill} />;
  }

  if (!permission.granted) {
    return (
      <View style={StyleSheet.absoluteFill} className="bg-gray-950 items-center justify-center px-8">
        <Pressable onPress={onClose} className="absolute top-14 left-5 p-2">
          <X size={24} color="#fff" />
        </Pressable>
        <Text className="text-white text-xl font-bold text-center mb-3">
          {t("onboarding.cameraPermissionTitle")}
        </Text>
        <Text className="text-gray-400 text-center mb-8">
          {t("onboarding.cameraPermissionMessage")}
        </Text>
        <Pressable
          onPress={requestPermission}
          className="bg-primary-500 rounded-2xl px-8 py-3.5 active:opacity-80"
        >
          <Text className="text-white font-semibold text-base">
            {t("onboarding.allowCamera")}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handleBarCodeScanned}
      />

      {/* Close button */}
      <Pressable
        onPress={onClose}
        className="absolute top-14 left-5 p-2 bg-black/40 rounded-full"
      >
        <X size={24} color="#fff" />
      </Pressable>

      {/* Viewfinder overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View className="flex-1 bg-black/50" />
        <View className="flex-row">
          <View className="flex-1 bg-black/50" />
          <View style={{ width: 220, height: 220, borderRadius: 16, borderWidth: 3, borderColor: "#EC4899" }} />
          <View className="flex-1 bg-black/50" />
        </View>
        <View className="flex-1 bg-black/50 items-center justify-start pt-6">
          <Text className="text-white text-sm font-medium opacity-80">
            {t("onboarding.scanQR")}
          </Text>
        </View>
      </View>
    </View>
  );
}

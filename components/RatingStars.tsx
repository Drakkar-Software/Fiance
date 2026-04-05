import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RatingStarsProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
  color?: string;
}

export function RatingStars({
  rating,
  onChange,
  size = 20,
  color = "#F59E0B",
}: RatingStarsProps) {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => onChange?.(star === rating ? 0 : star)}
          disabled={!onChange}
        >
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={star <= rating ? color : "#D1D5DB"}
          />
        </Pressable>
      ))}
    </View>
  );
}

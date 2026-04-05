import React from "react";
import { View, Pressable } from "react-native";
import { Star } from "lucide-react-native";

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
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        return (
          <Pressable
            key={star}
            onPress={() => onChange?.(star === rating ? 0 : star)}
            disabled={!onChange}
          >
            <Star
              size={size}
              color={filled ? color : "#D1D5DB"}
              fill={filled ? color : "transparent"}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

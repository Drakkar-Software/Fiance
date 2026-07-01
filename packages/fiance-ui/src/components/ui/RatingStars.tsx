import React from "react";
import { View } from "react-native-css/components";
import { Pressable } from "../../primitives/pressable";
import { Star } from "lucide-react-native";

interface RatingStarsProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
  /** Color for filled stars. Defaults to warning-400 (amber). */
  color?: string;
}

export function RatingStars({ rating, onChange, size = 20, color = "rgb(245, 158, 11)" }: RatingStarsProps) {
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
              color={filled ? color : "rgb(221, 220, 219)"}
              fill={filled ? color : "transparent"}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

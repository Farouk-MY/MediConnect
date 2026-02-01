import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingStarsProps {
    rating: number;
    size?: number;
    showValue?: boolean;
}

export default function RatingStars({ rating, size = 14, showValue = false }: RatingStarsProps) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(
                <Ionicons key={i} name="star" size={size} color="#FBBF24" />
            );
        } else if (i === fullStars && hasHalfStar) {
            stars.push(
                <Ionicons key={i} name="star-half" size={size} color="#FBBF24" />
            );
        } else {
            stars.push(
                <Ionicons key={i} name="star-outline" size={size} color="#D1D5DB" />
            );
        }
    }

    return (
        <View className="flex-row items-center gap-0.5">
            {stars}
        </View>
    );
}

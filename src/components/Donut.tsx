import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function Donut({
  data,
  size = 120,
  strokeWidth = 16,
}: {
  data: { value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {data.map((d, i) => {
          const fraction = total > 0 ? d.value / total : 0;
          const dash = fraction * circumference;
          const circle = (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              fill="none"
              rotation={-90}
              origin={`${size / 2}, ${size / 2}`}
            />
          );
          offset += dash;
          return circle;
        })}
      </Svg>
    </View>
  );
}

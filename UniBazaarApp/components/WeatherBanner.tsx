// components/WeatherBanner.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WeatherBanner() {
  // 如果你以后接入真实天气，就把 1.5 和 "near you" 换成 props 或 state
  const temp = 1.5;
  const label = "near you";

  return (
    <View style={styles.container}>
      <Ionicons
        name="partly-sunny-outline"
        size={18}
        color="#FE8A0D"
        style={{ marginRight: 6 }}
      />
      <View>
        <Text style={styles.tempText}>{temp}°C</Text>
        <Text style={styles.subText}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 999,             
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  tempText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    lineHeight: 18,
  },
  subText: {
    fontSize: 11,
    color: "#888",
    lineHeight: 14,
  },
});

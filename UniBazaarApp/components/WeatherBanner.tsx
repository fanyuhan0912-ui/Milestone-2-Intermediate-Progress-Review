// components/WeatherBanner.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import * as Location from "expo-location";

export default function WeatherBanner() {
  const [text, setText] = useState<string>("Fetching weather…");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setText("Location denied. Showing Vancouver.");
          // Vancouver
          const lat = 49.2827, lon = -123.1207;
          const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
          const j = await r.json();
          setText(`Vancouver · ${j.current_weather?.temperature ?? "--"}°C`);
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const lat = loc.coords.latitude;
        const lon = loc.coords.longitude;
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const j = await r.json();
        setText(`${j.current_weather?.temperature ?? "--"}°C near you`);
        setLoading(false);
      } catch (e) {
        setText("Weather unavailable");
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#f5f7fb", borderBottomWidth: 1, borderColor: "#eee" }}>
      {loading ? <ActivityIndicator /> : <Text style={{ fontWeight: "600" }}>{text}</Text>}
    </View>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Alert, ActivityIndicator, Platform } from "react-native";
import MapView, { Marker, Circle, Region } from "react-native-maps";
import * as Location from "expo-location";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, setDoc, onSnapshot, collection } from "firebase/firestore";

type Presence = {
  uid: string;
  displayName?: string;
  email?: string;
  lat: number;
  lon: number;
  lastActive: number;
};

const ONLINE_WINDOW_MS = 5 * 60 * 1000;
const HEARTBEAT_MS = 30 * 1000;

export default function NearMeScreen() {
  const [permChecked, setPermChecked] = useState(false);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [me, setMe] = useState<{ lat: number; lon: number; accuracy?: number } | null>(null);
  const [peers, setPeers] = useState<Presence[]>([]);

  const watchSub = useRef<Location.LocationSubscription | null>(null);
  const heartbeatTimer = useRef<NodeJS.Timer | null>(null);


  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setDenied(true);
        setPermChecked(true);
        setLoading(false);
        return;
      }
      setPermChecked(true);


      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = loc.coords.latitude;
      const lon = loc.coords.longitude;
      const acc = loc.coords.accuracy;
      setMe({ lat, lon, accuracy: acc });
      setRegion({
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLoading(false);


      watchSub.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 15,
        },
        (update) => {
          const nlat = update.coords.latitude;
          const nlon = update.coords.longitude;
          const nacc = update.coords.accuracy;
          setMe({ lat: nlat, lon: nlon, accuracy: nacc });
        }
      );
    })();

    return () => {
      watchSub.current?.remove();
    };
  }, []);


  useEffect(() => {
    if (!me) return;
    const user = auth.currentUser;
    if (!user) return;

    const pushPresence = async () => {
      try {
        await setDoc(
          doc(db, "presence", user.uid),
          {
            uid: user.uid,
            displayName: user.displayName ?? "",
            email: user.email ?? "",
            lat: me.lat,
            lon: me.lon,
            lastActive: Date.now(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn("presence write failed:", e);
      }
    };


    pushPresence();


    heartbeatTimer.current = setInterval(pushPresence, HEARTBEAT_MS);
    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    };
  }, [me?.lat, me?.lon]);


  useEffect(() => {
    const unsub = onSnapshot(collection(db, "presence"), (snap) => {
      const now = Date.now();
      const rows: Presence[] = snap.docs
        .map((d) => d.data() as Presence)
        .filter((p) => typeof p.lat === "number" && typeof p.lon === "number")
        .filter((p) => now - (p.lastActive ?? 0) <= ONLINE_WINDOW_MS);
      setPeers(rows);
    }, (err) => {
      console.error("presence onSnapshot error:", err);
    });
    return () => unsub();
  }, []);

  const myRegion = useMemo(() => region ?? {
    latitude: 49.2827, longitude: -123.1207, latitudeDelta: 0.05, longitudeDelta: 0.05
  }, [region]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Locating…</Text>
      </View>
    );
  }

  if (permChecked && denied) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#fff" }}>
        <Text style={{ fontSize: 16, fontWeight: "600", textAlign: "center" }}>
          Location permission denied.
        </Text>
        <Text style={{ marginTop: 8, color: "#555", textAlign: "center" }}>
          Enable location to see nearby users on the map.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={myRegion}
        region={myRegion}
        onRegionChangeComplete={(r) => setRegion(r)}
        showsUserLocation={false}
        showsMyLocationButton={Platform.OS === "android"}
      >
        {/* my position*/}
        {me && (
          <>
            <Marker
              coordinate={{ latitude: me.lat, longitude: me.lon }}
              title="You are here"
              description="Your current location"
              pinColor="#2f6fed"
            />
            {typeof me.accuracy === "number" && me.accuracy < 500 && (
              <Circle
                center={{ latitude: me.lat, longitude: me.lon }}
                radius={me.accuracy}
                strokeColor="rgba(47,111,237,0.4)"
                fillColor="rgba(47,111,237,0.1)"
              />
            )}
          </>
        )}

        {/* online user */}
        {peers
          .filter((p) => !auth.currentUser || p.uid !== auth.currentUser.uid)
          .map((p) => (
            <Marker
              key={p.uid}
              coordinate={{ latitude: p.lat, longitude: p.lon }}
              title={p.displayName || p.email || "Student"}
              description={`Last active: ${new Date(p.lastActive).toLocaleTimeString()}`}
            />
          ))}
      </MapView>

      {/* how many user online */}
      <View
        style={{
          position: "absolute",
          top: 50,
          alignSelf: "center",
          backgroundColor: "rgba(255,255,255,0.95)",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#eee",
        }}
      >
        <Text style={{ fontWeight: "600" }}>Online nearby: {peers.length}</Text>
      </View>
    </View>
  );
}

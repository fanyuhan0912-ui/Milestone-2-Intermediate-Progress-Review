import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Circle, Region } from "react-native-maps";
import * as Location from "expo-location";
import { router } from "expo-router";
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

type Item = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  sellerId: string;
  lat: number;
  lon: number;
  title?: string; 
};


const ONLINE_WINDOW_MS = 5 * 60 * 1000;
const HEARTBEAT_MS = 30 * 1000;

export default function NearMeScreen() {
  const [permChecked, setPermChecked] = useState(false);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
const [me, setMe] = useState<{
  lat: number;
  lon: number;
  accuracy: number | null;
} | null>(null);

  const [peers, setPeers] = useState<Presence[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);


  const [items, setItems] = useState<Item[]>([]);

  const [showList, setShowList] = useState(false);

  const watchSub = useRef<Location.LocationSubscription | null>(null);
 const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [selectedUser, setSelectedUser] = useState<Presence | null>(null);
  const [selectedUserItems, setSelectedUserItems] = useState<Item[]>([]);
  const [showUserCard, setShowUserCard] = useState(false);



  // location allow
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

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

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

      // watch location
      watchSub.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 15,
        },
        (update) => {
          setMe({
            lat: update.coords.latitude,
            lon: update.coords.longitude,
            accuracy: update.coords.accuracy,
          });
        }
      );
    })();

    return () => {
      watchSub.current?.remove();
    };
  }, []);


  // Firebase item
useEffect(() => {
  const unsub = onSnapshot(collection(db, "items"), (snap) => {
   const fetched: Item[] = snap.docs.map((d) => {
  const data = d.data() as Omit<Item, "id">;
  return { id: d.id, ...data };
});

    setItems(fetched);
  });

  return () => unsub();
}, []);


  // Online presence
  useEffect(() => {
    if (!me) return;
    if (!auth.currentUser) return;

    const user = auth.currentUser;

    const pushPresence = async () => {
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
    };

    pushPresence();
    heartbeatTimer.current = setInterval(pushPresence, HEARTBEAT_MS);

    return () => {
      clearInterval(heartbeatTimer.current!);
    };
  }, [me?.lat, me?.lon]);


  // Listen online users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "presence"), (snap) => {
      const now = Date.now();
      const active = snap.docs
        .map((d) => d.data() as Presence)
        .filter((p) => now - (p.lastActive ?? 0) < ONLINE_WINDOW_MS);
      setPeers(active);
    });

    return () => unsub();
  }, []);

  const myRegion = useMemo(
    () =>
      region ?? {
        latitude: 49.2827,
        longitude: -123.1207,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
    [region]
  );

  // Loading
  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Locating…</Text>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      {/* two button*/}
      <View
      pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 50,
          left: 20,
          right: 20,
          zIndex:10,

          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        {/* Map button */}
        <TouchableOpacity
          onPress={() => setShowList(false)}
          style={{
            backgroundColor: showList ? "#e8f0ff" : "#4F81FF",
            padding: 10,
            borderRadius: 12,
            marginRight: 10,
          }}
        >
          <Text style={{ color: showList ? "#4F81FF" : "white" }}>🗺️</Text>
        </TouchableOpacity>

        {/* List button */}
        <TouchableOpacity
          onPress={() => setShowList(true)}
          style={{
            backgroundColor: showList ? "#4F81FF" : "#e8f0ff",
            padding: 10,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: showList ? "white" : "#4F81FF" }}>📋</Text>
        </TouchableOpacity>
      </View>

      {/* onRegionChangeComplete */}
      {showList ? (
        <ItemsList items={items} />
      ) : (
        <MapView
          style={{ flex: 1 }}
          initialRegion={myRegion}
          region={myRegion}
          onRegionChangeComplete={setRegion}
          onPress={() => {
            // click outside close
            setShowUserCard(false);
            setSelectedItem(null);
          }}
        >




          {/* My position */}
          {me && (
    <>
              <Marker
                coordinate={{ latitude: me.lat, longitude: me.lon }}
                pinColor="#2f6fed"
                title="You"
              />

              {me.accuracy !== null && me.accuracy < 500 && (
                <Circle
                  center={{ latitude: me.lat, longitude: me.lon }}
                  radius={me.accuracy}
                  fillColor="rgba(0,120,255,0.1)"
                  strokeColor="rgba(0,120,255,0.4)"
                />
              )}
            </>
          )}


          {/* Online peers */}
          {peers
            .filter((p) => p.uid !== auth.currentUser?.uid)
            .map((p) => (
              <Marker
                key={p.uid}
                coordinate={{ latitude: p.lat, longitude: p.lon }}
                title={p.displayName || p.email}
                onPress={(e) => {
                  e.stopPropagation();
                  console.log("PEER ICON PRESSED:", p.uid);
                  setSelectedUser(p);
                  const userItems = items.filter((item) => item.sellerId === p.uid);
                  setSelectedItem(null);
                  setSelectedUserItems(userItems);
                  setShowUserCard(true);
                }}
              />

            ))}
        </MapView>
      )}

  {/* user card */}
  {showUserCard && selectedUser && (
  <View
    style={{
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: "white",
      padding: 12,
      borderRadius: 12,
      maxHeight: 180, // Increased height to prevent clipping
    }}
  >
    <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 10 }}>
      Items from {selectedUser?.displayName || "User"}:
    </Text>

    <FlatList
      horizontal
      data={selectedUserItems}
      keyExtractor={(it) => it.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{
            marginRight: 12,
            backgroundColor: "#fff",
            padding: 8,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            width: 120,
          }}
          onPress={() => {
            setSelectedItem(item);
            setShowUserCard(false);
          }}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: "100%", height: 70, borderRadius: 8 }}
          />

          <Text
            numberOfLines={1}
            style={{ marginTop: 5, fontWeight: "600", fontSize: 14 }}
          >
            {item.title || item.name}
          </Text>

          <Text style={{ fontWeight: "700", color: "#ff7e3e", marginTop: 4 }}>
            ${item.price}
          </Text>
        </TouchableOpacity>
      )}
    />
  </View>
)}


      {!showList && selectedItem && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: "white",
            padding: 12,
            borderRadius: 15,
            flexDirection: "row",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 5,
          }}
        >
          <Image
            source={{ uri: selectedItem.imageUrl }}
            style={{ width: 70, height: 70, borderRadius: 10, marginRight: 10 }}
          />

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              {selectedItem.title}
            </Text>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginTop: 4 }}>
              ${selectedItem.price}
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/item/[id]",
                  params: { id: selectedItem.id },
                })
              }
            >
              <Text style={{ color: "#2f6fed", marginTop: 8 }}>
                View Details →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

     
      <View
      pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 60,
          alignSelf: "center",
          backgroundColor: "white",
          padding: 10,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#eee",
        }}
      >
        <Text>Online nearby: {peers.length}</Text>
      </View>
    </View>
  );
}


/* ui*/
const ItemsList = ({ items }: { items: Item[] }) => (
  <FlatList
    data={items}
    keyExtractor={(item) => item.id}
    style={{ marginTop: 120 }}
    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          padding: 12,
          marginBottom: 15,
          backgroundColor: "#fff",
          borderRadius: 12,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 5,
          elevation: 2,
        }}
        onPress={() =>
          router.push({
            pathname: "/item/[id]",
            params: { id: item.id },
          })
        }
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: 80, height: 80, borderRadius: 8, marginRight: 12 }}
        />
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "600" }} numberOfLines={2}>
            {item.title}
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#FF7E3E",
              marginTop: 8,
            }}

          >
            ${item.price}
          </Text>
        </View>
      </TouchableOpacity>
    )}
    ListEmptyComponent={
      <Text
        style={{
          textAlign: "center",
          marginTop: 50,
          color: "#888",
        }}
      >
        No items found nearby.
      </Text>
    }
  />
);

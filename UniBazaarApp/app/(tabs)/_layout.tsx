import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF7E3E",
        tabBarInactiveTintColor: "#FF7E3E",
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => ( // 添加 focused 参数
            <Ionicons
              name={focused ? "home" : "home-outline"} // 根据 focused 状态切换图标
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* Near Me */}
      <Tabs.Screen
        name="nearme"
        options={{
          title: "Near Me",
          tabBarIcon: ({ color, size, focused }) => ( // 添加 focused 参数
            <Ionicons
              name={focused ? "location" : "location-outline"} // 根据 focused 状态切换图标
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/*Add */}
      <Tabs.Screen
        name="add"
        options={{
          tabBarButton: (props: any) => (
            <TouchableOpacity
              {...props}
              style={{
                top: -15,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: "#FF7E3E",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.3,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                }}
              >
                <Ionicons name="add" size={36} color="white" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Chat */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size, focused }) => ( // 添加 focused 参数
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"} // 使用复数形式通常更好看
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* Me (Profile) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarIcon: ({ color, size, focused }) => ( // 添加 focused 参数
            <Ionicons
              name={focused ? "person" : "person-outline"} // 根据 focused 状态切换图标
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}

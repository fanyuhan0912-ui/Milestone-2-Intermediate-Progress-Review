import React from 'react';
import { Stack } from 'expo-router';

export default function ProfilePagesLayout() {
  return (
    <Stack>
      <Stack.Screen name="favourite" options={{ headerShown: false }} />
      <Stack.Screen name="listed" options={{ headerShown: false }} />
      <Stack.Screen name="purchased" options={{ headerShown: false }} />
      <Stack.Screen name="sold" options={{ headerShown: false }} />
      <Stack.Screen name="toReview" options={{ headerShown: false }} />
      <Stack.Screen name="userHomepage" options={{ headerShown: false }} />
      <Stack.Screen name="viewMore" options={{ headerShown: false }} />
    </Stack>
  );
}

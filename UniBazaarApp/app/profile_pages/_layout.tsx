import React from 'react';
import { Stack } from 'expo-router';

export default function ProfilePagesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="listed"
        options={{ headerShown: true, title: 'Listed Items' }} 
      />
      <Stack.Screen
        name="favourite"
        options={{ headerShown: true, title: 'Favourite' }} 
      />
      <Stack.Screen
        name="purchased"
        options={{ headerShown: true, title: 'Purchased' }} 
      />
      <Stack.Screen
        name="sold"
        options={{ headerShown: true, title: 'Sold' }} 
      />
      <Stack.Screen
        name="toReview"
        options={{ headerShown: true, title: 'ToReview' }} 
      />
      <Stack.Screen
        name="userHomepage"
        options={{ headerShown: true, title: 'User Info' }} 
      />
      <Stack.Screen
        name="viewMore"
        options={{ headerShown: true, title: 'View More' }} 
      />
    </Stack>
  );
}

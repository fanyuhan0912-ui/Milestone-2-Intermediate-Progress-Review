import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { FavoritesProvider } from './FavoritesContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';  

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>   
      <FavoritesProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="profile_pages" options={{ headerShown: false }} />
            <Stack.Screen
              name="item/[id]"            
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="chat/[id]"            
              options={{ headerShown: false }}
            />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>

          <StatusBar style="auto" />
        </ThemeProvider>
      </FavoritesProvider>
    </GestureHandlerRootView>
  );
}

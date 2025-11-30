import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. 定义商品数据类型 (与 home.tsx 一致)
type Item = {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  sellerId?: string;
  createdAt?: number;
  distanceKm?: number;
  category?: string;
};

// 2. 定义 Context 提供的数据和方法
interface FavoritesContextType {
  favorites: Item[];
  toggleFavorite: (item: Item) => void;
  isFavorite: (itemId: string) => boolean;
}

// 3. 创建 Context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// 4. 创建一个自定义 Hook，方便子组件使用
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

// 5. 创建 Provider 组件
export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Item[]>([]);

  const toggleFavorite = (item: Item) => {
    setFavorites((prevFavorites) => {
      const isAlreadyFavorite = prevFavorites.some((fav) => fav.id === item.id);
      if (isAlreadyFavorite) {
        return prevFavorites.filter((fav) => fav.id !== item.id);
      } else {
        return [...prevFavorites, item];
      }
    });
  };

  const isFavorite = (itemId: string) => {
    return favorites.some((fav) => fav.id === itemId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

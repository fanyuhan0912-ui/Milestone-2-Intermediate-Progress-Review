import React, { createContext, useContext, useState, ReactNode } from 'react';


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


interface FavoritesContextType {
  favorites: Item[];
  toggleFavorite: (item: Item) => void;
  isFavorite: (itemId: string) => boolean;
}


const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);


export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};


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

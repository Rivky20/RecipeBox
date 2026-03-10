import api from './axios';
import { Recipe } from '../types';

export const favoriteService = {
  getFavorites: (userId: string) =>
    api.get<Recipe[]>(`/api/users/${userId}/favorites`).then((r) => r.data),

  addFavorite: (userId: string, recipeId: number) =>
    api.post(`/api/users/${userId}/favorites`, { recipeId }),

  removeFavorite: (userId: string, recipeId: number) =>
    api.delete(`/api/users/${userId}/favorites/${recipeId}`),
};

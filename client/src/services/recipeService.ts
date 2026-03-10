import api from './axios';
import { Recipe, RecipeQuery, CreateRecipeRequest, UpdateRecipeRequest } from '../types';

export const recipeService = {
  getRecipes: (params?: RecipeQuery) =>
    api.get<Recipe[]>('/api/recipes', { params }).then((r) => r.data),

  getRecipe: (id: number) =>
    api.get<Recipe>(`/api/recipes/${id}`).then((r) => r.data),

  getRecipesByAlbum: (albumId: number) =>
    api.get<Recipe[]>(`/api/recipes/album/${albumId}`).then((r) => r.data),

  createRecipe: (data: CreateRecipeRequest) =>
    api.post<Recipe>('/api/recipes', data).then((r) => r.data),

  updateRecipe: (id: number, data: UpdateRecipeRequest) =>
    api.put<Recipe>(`/api/recipes/${id}`, data).then((r) => r.data),

  deleteRecipe: (id: number) =>
    api.delete(`/api/recipes/${id}`),
};

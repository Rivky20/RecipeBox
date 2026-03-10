// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = 'User' | 'Admin';

export interface AuthUser {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  role: UserRole;
}

// ─── Albums ──────────────────────────────────────────────────────────────────

export interface Album {
  id: number;
  name: string;
  description: string;
  recipeCount: number;
}

export interface CreateAlbumRequest {
  name: string;
  description: string;
}

export interface UpdateAlbumRequest {
  name: string;
  description: string;
}

// ─── Recipes ─────────────────────────────────────────────────────────────────

export type RecipeType = 'Link' | 'Text';

export interface Recipe {
  id: number;
  name: string;
  description: string;
  imagePath: string | null;
  albumId: number;
  userId: string;
  createdAt: string;
  recipeType: RecipeType;
  // Link type
  link?: string | null;
  // Text type
  ingredients?: string | null;
  instructions?: string | null;
  // Computed by backend
  isFavorite?: boolean;
  isOwner?: boolean;
  albumName?: string;
  userEmail?: string;
}

export interface RecipeQuery {
  search?: string;
  albumId?: number;
  sortBy?: 'name' | 'date';
}

export interface CreateRecipeRequest {
  name: string;
  description: string;
  recipeType: RecipeType;
  albumId: number;
  imagePath?: string | null;
  // Link
  link?: string | null;
  // Text
  ingredients?: string | null;
  instructions?: string | null;
}

export type UpdateRecipeRequest = CreateRecipeRequest;

// ─── Favorites ───────────────────────────────────────────────────────────────

export interface Favorite {
  recipeId: number;
  recipeName: string;
  addedAt: string;
}

// ─── Users (Admin) ───────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  recipeCount: number;
}

export interface SystemStats {
  totalUsers: number;
  totalRecipes: number;
  totalAlbums: number;
  blockedUsers: number;
  recentRecipes: Recipe[];
}

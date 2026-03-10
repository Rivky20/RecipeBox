import api from './axios';
import { Album, CreateAlbumRequest, UpdateAlbumRequest } from '../types';

export const albumService = {
  getAlbums: () =>
    api.get<Album[]>('/api/albums').then((r) => r.data),

  getAlbum: (id: number) =>
    api.get<Album>(`/api/albums/${id}`).then((r) => r.data),

  createAlbum: (data: CreateAlbumRequest) =>
    api.post<Album>('/api/albums', data).then((r) => r.data),

  updateAlbum: (id: number, data: UpdateAlbumRequest) =>
    api.put<Album>(`/api/albums/${id}`, data).then((r) => r.data),

  deleteAlbum: (id: number) =>
    api.delete(`/api/albums/${id}`),
};

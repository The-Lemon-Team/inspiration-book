import { apiUrl } from './config';
import { authHeaders, clearToken, refreshAccessToken } from './http';

export interface UploadResult {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  async function doUpload(retried = false): Promise<UploadResult> {
    const response = await fetch(apiUrl('/api/uploads'), {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });

    if (response.status === 401 && !retried) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return doUpload(true);
      }
      await clearToken();
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Не удалось загрузить изображение');
    }

    return response.json() as Promise<UploadResult>;
  }

  return doUpload();
}

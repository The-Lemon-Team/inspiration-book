export interface UploadResult {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('accessToken');
  const response = await fetch('/api/uploads', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Не удалось загрузить изображение');
  }

  return response.json() as Promise<UploadResult>;
}

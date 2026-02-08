export const loadImageAsBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

export const loadImagesAsBase64 = async (files: File[]): Promise<string[]> => {
  return Promise.all(files.map((file) => loadImageAsBase64(file)));
};

export const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
};

export const validatePDFFile = (file: File): boolean => {
  return file.type === 'application/pdf';
};

export const validateDocumentFile = (file: File): boolean => {
  return validateImageFile(file) || validatePDFFile(file);
};

export const getDocumentType = (file: File): 'pdf' | 'image' | 'unsupported' => {
  if (validatePDFFile(file)) return 'pdf';
  if (validateImageFile(file)) return 'image';
  return 'unsupported';
};

export const validateFileSize = (file: File, maxSizeMB: number = 50): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

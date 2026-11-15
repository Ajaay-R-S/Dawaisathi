export interface CompressedImageResult {
  base64: string;
  mimeType: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  blob: Blob;
}

/**
 * Compresses an image file/blob client-side using an HTML5 Canvas.
 * Reduces image dimensions (max 1600px) and quality (0.82) to optimize
 * for fast upload over 2G/3G mobile networks.
 */
export async function compressImage(
  fileOrBlob: File | Blob,
  maxDimension = 1600,
  quality = 0.82
): Promise<CompressedImageResult> {
  const originalSizeKB = Math.round(fileOrBlob.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down if dimension exceeds max
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available for compression'));
          return;
        }

        // Draw image onto canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create compressed blob'));
              return;
            }
            const compressedSizeKB = Math.round(blob.size / 1024);
            resolve({
              base64: dataUrl,
              mimeType,
              originalSizeKB,
              compressedSizeKB,
              blob,
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(fileOrBlob);
  });
}

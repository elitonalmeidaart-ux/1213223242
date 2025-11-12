/**
 * Converts a string aspect ratio (e.g., "16:9") to a numerical value.
 * @param ratioStr The aspect ratio string.
 * @returns The numerical ratio (width / height).
 */
const parseAspectRatio = (ratioStr: string): number => {
  const [width, height] = ratioStr.split(':').map(Number);
  if (!width || !height) return 1;
  return width / height;
};

/**
 * Pre-processes an image file to fit a target aspect ratio by performing a center-crop.
 * This ensures the reference image sent to the model has the correct dimensions without
 * adding visual artifacts like blurred borders.
 * @param imageFile The image file to process.
 * @param targetAspectRatio The desired aspect ratio string (e.g., "16:9").
 * @returns A promise that resolves with the base64 data URL of the processed image.
 */
export const maskImageToAspectRatio = (
  imageFile: File,
  targetAspectRatio: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = (e) => {
      const img = new Image();
      if (!e.target?.result || typeof e.target.result !== 'string') {
        return reject(new Error('Failed to read image file.'));
      }
      img.src = e.target.result;
      img.onload = () => {
        const targetRatio = parseAspectRatio(targetAspectRatio);
        const imgRatio = img.width / img.height;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }

        if (Math.abs(imgRatio - targetRatio) < 0.01) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          return resolve(canvas.toDataURL('image/jpeg'));
        }

        let srcX = 0, srcY = 0, srcWidth = img.width, srcHeight = img.height;

        if (imgRatio > targetRatio) {
          srcWidth = img.height * targetRatio;
          srcX = (img.width - srcWidth) / 2;
        } else {
          srcHeight = img.width / targetRatio;
          srcY = (img.height - srcHeight) / 2;
        }

        canvas.width = srcWidth;
        canvas.height = srcHeight;
        ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
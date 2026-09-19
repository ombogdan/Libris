import { t } from 'shared/localization/i18n';
import { readFile } from '@dr.pogodin/react-native-fs';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../supabase';

const BUCKET = 'book-images';

export type LocalBookImage = {
  uri: string;
  type: string;
  fileName: string;
};

export function getBookImagePath(publicUrl: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex < 0) {
    return null;
  }

  const encodedPath = publicUrl
    .slice(markerIndex + marker.length)
    .split('?')[0];

  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return encodedPath;
  }
}

function filePath(uri: string) {
  return decodeURIComponent(uri.replace(/^file:\/\//, ''));
}

type SupportedImageFormat = {
  extension: 'jpg' | 'png' | 'webp';
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
};

function detectImageFormat(buffer: ArrayBuffer): SupportedImageFormat | null {
  const bytes = new Uint8Array(buffer);

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return { extension: 'jpg', mimeType: 'image/jpeg' };
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { extension: 'png', mimeType: 'image/png' };
  }

  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  ) {
    return { extension: 'webp', mimeType: 'image/webp' };
  }

  return null;
}

export async function uploadBookImages(
  userId: string,
  listingId: string,
  images: LocalBookImage[],
) {
  const uploadedPaths: string[] = [];
  const urls: string[] = [];
  const uploadId = `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  try {
    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      const base64 = await readFile(filePath(image.uri), 'base64');
      const imageBuffer = decode(base64);
      const format = detectImageFormat(imageBuffer);
      if (!format) {
        throw new Error(
          t('images.unsupported'),
        );
      }

      const path = `${userId}/${listingId}/${uploadId}-${index + 1}.${
        format.extension
      }`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, imageBuffer, {
          contentType: format.mimeType,
          cacheControl: '31536000',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      uploadedPaths.push(path);
      urls.push(
        supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
      );
    }

    return { urls, paths: uploadedPaths };
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from(BUCKET).remove(uploadedPaths);
    }
    throw error;
  }
}

export async function removeBookImages(paths: string[]) {
  if (paths.length) {
    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) {
      throw error;
    }
  }
}

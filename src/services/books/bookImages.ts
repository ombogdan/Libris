import { readFile } from '@dr.pogodin/react-native-fs';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../supabase';

const BUCKET = 'book-images';

export type LocalBookImage = {
  uri: string;
  type: string;
  fileName: string;
};

function filePath(uri: string) {
  return decodeURIComponent(uri.replace(/^file:\/\//, ''));
}

function extension(image: LocalBookImage) {
  const fromName = image.fileName.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName === 'heic' || fromName === 'heif' ? 'jpg' : fromName;
  }
  return image.type.split('/')[1] || 'jpg';
}

export async function uploadBookImages(
  userId: string,
  listingId: string,
  images: LocalBookImage[],
) {
  const uploadedPaths: string[] = [];
  const urls: string[] = [];

  try {
    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      const path = `${userId}/${listingId}/${index + 1}.${extension(image)}`;
      const base64 = await readFile(filePath(image.uri), 'base64');
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, decode(base64), {
          contentType: image.type,
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
    await supabase.storage.from(BUCKET).remove(paths);
  }
}

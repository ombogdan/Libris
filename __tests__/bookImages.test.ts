import { readFile } from '@dr.pogodin/react-native-fs';
import { supabase } from 'services/supabase';
import { uploadBookImages } from 'services/books';

jest.mock('@dr.pogodin/react-native-fs', () => ({
  readFile: jest.fn(),
}));

jest.mock('services/supabase', () => ({
  supabase: { storage: { from: jest.fn() } },
}));

const upload = jest.fn();
const remove = jest.fn();
const getPublicUrl = jest.fn((path: string) => ({
  data: { publicUrl: `https://images.test/${path}` },
}));
const jpegBase64 = '/9j/2Q==';
const pngBase64 = 'iVBORw0KGgo=';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(readFile).mockResolvedValue(jpegBase64);
  jest.mocked(supabase.storage.from).mockReturnValue({
    upload,
    remove,
    getPublicUrl,
  } as unknown as ReturnType<typeof supabase.storage.from>);
  upload.mockResolvedValue({ error: null });
  remove.mockResolvedValue({ error: null });
});

test('uploads selected images into the listing folder', async () => {
  jest
    .mocked(readFile)
    .mockResolvedValueOnce(jpegBase64)
    .mockResolvedValueOnce(pngBase64);

  const result = await uploadBookImages('user-1', 'listing-1', [
    { uri: 'file:///cover.jpg', type: 'image/jpeg', fileName: 'cover.jpg' },
    { uri: 'file:///back.png', type: 'image/png', fileName: 'back.png' },
  ]);

  expect(upload).toHaveBeenCalledTimes(2);
  expect(upload.mock.calls.map(call => call[0])).toEqual([
    'user-1/listing-1/1.jpg',
    'user-1/listing-1/2.png',
  ]);
  expect(result.urls).toEqual([
    'https://images.test/user-1/listing-1/1.jpg',
    'https://images.test/user-1/listing-1/2.png',
  ]);
  expect(upload.mock.calls.map(call => call[2]?.contentType)).toEqual([
    'image/jpeg',
    'image/png',
  ]);
});

test('uses the actual file bytes when picker metadata still says HEIC', async () => {
  await uploadBookImages('user-1', 'listing-1', [
    {
      uri: 'file:///converted.heic',
      type: 'image/heic',
      fileName: 'converted.heic',
    },
  ]);

  expect(upload).toHaveBeenCalledWith(
    'user-1/listing-1/1.jpg',
    expect.any(ArrayBuffer),
    expect.objectContaining({ contentType: 'image/jpeg' }),
  );
});

test('rejects unsupported image bytes before upload', async () => {
  jest.mocked(readFile).mockResolvedValueOnce('aGVsbG8=');

  await expect(
    uploadBookImages('user-1', 'listing-1', [
      {
        uri: 'file:///not-an-image.gif',
        type: 'image/gif',
        fileName: 'not-an-image.gif',
      },
    ]),
  ).rejects.toThrow('Формат фото не підтримується');

  expect(upload).not.toHaveBeenCalled();
});

test('removes uploaded files when a later upload fails', async () => {
  upload
    .mockResolvedValueOnce({ error: null })
    .mockResolvedValueOnce({ error: new Error('Upload failed') });

  await expect(
    uploadBookImages('user-1', 'listing-1', [
      { uri: 'file:///one.jpg', type: 'image/jpeg', fileName: 'one.jpg' },
      { uri: 'file:///two.jpg', type: 'image/jpeg', fileName: 'two.jpg' },
    ]),
  ).rejects.toThrow('Upload failed');

  expect(remove).toHaveBeenCalledWith(['user-1/listing-1/1.jpg']);
});

const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const photoAccept = imageTypes.join(',');

export function validateUpload(file, kind = 'print') {
  const limit = { print: 15, preview: 15, support: 10, qr: 5, catalog: 15 }[kind] ?? 15;
  if (!file || !imageTypes.includes(file.type) || /\.svgz?$/i.test(file.name)) {
    throw new Error('Chọn ảnh PNG, JPEG hoặc WebP.');
  }
  if (!file.size || file.size > limit * 1024 * 1024) throw new Error('Dung lượng tối đa ' + limit + ' MB mỗi ảnh.');
}

export function readPhoto(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    const finish = () => URL.revokeObjectURL(url);
    image.onload = () => {
      finish();
      if (!image.naturalWidth || !image.naturalHeight) return reject(new Error('Không đọc được kích thước ảnh.'));
      resolve({ widthPx: image.naturalWidth, heightPx: image.naturalHeight });
    };
    image.onerror = () => {
      finish();
      reject(new Error('Không đọc được ảnh. Vui lòng kiểm tra định dạng.'));
    };
    image.src = url;
  });
}

export async function uploadPhotoBatch(items, upload, { signal, onProgress } = {}) {
  let cursor = 0;
  let completed = 0;
  let failure;
  const results = new Array(items.length);
  async function run() {
    while (!failure && cursor < items.length) {
      const index = cursor++;
      try {
        let result;
        for (let attempt = 0; attempt < 2; attempt++) {
          signal?.throwIfAborted();
          try {
            result = await upload(items[index], signal);
            break;
          } catch (error) {
            if (attempt || error.code === 'ERR_CANCELED' || (error.status && error.status < 500 && error.status !== 429)) throw error;
          }
        }
        results[index] = result;
        onProgress?.(++completed, items.length, result, items[index]);
      } catch (error) { failure ??= error; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, items.length) }, run));
  if (failure) throw failure;
  return results;
}

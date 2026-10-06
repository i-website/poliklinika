// Префикс для файлов из public/, которые подключаются вручную (img, canvas):
// next сам добавляет basePath только к ссылкам и роутеру.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const asset = (path) => `${BASE_PATH}${path}`;

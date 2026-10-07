import { asset } from '../lib/basePath';

// Фото — стоковые снимки врачей в халатах (Unsplash). Лежат в public/doctors, а не подключаются по ссылке:
// внешний хост у части пользователей не открывается.
const photo = (id) => asset(`/doctors/${id}.jpg`);

export const DOCTORS = [
    {
        id: 'ivanov',
        firstName: 'Сергей',
        lastName: 'Иванов',
        specialty: 'Терапевт',
        cabinet: 107,
        photo: photo('ivanov'),
    },
    {
        id: 'smirnova',
        firstName: 'Елена',
        lastName: 'Смирнова',
        specialty: 'Кардиолог',
        cabinet: 114,
        photo: photo('smirnova'),
    },
    {
        id: 'kuznetsov',
        firstName: 'Андрей',
        lastName: 'Кузнецов',
        specialty: 'Невролог',
        cabinet: 121,
        photo: photo('kuznetsov'),
    },
    {
        id: 'popova',
        firstName: 'Ольга',
        lastName: 'Попова',
        specialty: 'Офтальмолог',
        cabinet: 128,
        photo: photo('popova'),
    },
    {
        id: 'sokolov',
        firstName: 'Михаил',
        lastName: 'Соколов',
        specialty: 'Хирург',
        cabinet: 135,
        photo: photo('sokolov'),
    },
    {
        id: 'lebedeva',
        firstName: 'Наталья',
        lastName: 'Лебедева',
        specialty: 'Педиатр',
        cabinet: 142,
        photo: photo('lebedeva'),
    },
    {
        id: 'morozov',
        firstName: 'Игорь',
        lastName: 'Морозов',
        specialty: 'Отоларинголог',
        cabinet: 149,
        photo: photo('morozov'),
    },
    {
        id: 'volkova',
        firstName: 'Марина',
        lastName: 'Волкова',
        specialty: 'Дерматолог',
        cabinet: 156,
        photo: photo('volkova'),
    },
    {
        id: 'orlova',
        firstName: 'Татьяна',
        lastName: 'Орлова',
        specialty: 'Эндокринолог',
        cabinet: 163,
        photo: photo('orlova'),
    },
];

export const doctorFullName = (d) => `${d.lastName} ${d.firstName}`;

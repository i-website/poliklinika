// Фото — стоковые снимки реальных врачей в халатах с Unsplash (подключаются по ссылке).
const photo = (id) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=faces&w=400&h=400&q=80`;

export const DOCTORS = [
    {
        id: 'ivanov',
        firstName: 'Сергей',
        lastName: 'Иванов',
        specialty: 'Терапевт',
        cabinet: 107,
        photo: photo('1758691463384-771db2f192b3'),
    },
    {
        id: 'smirnova',
        firstName: 'Елена',
        lastName: 'Смирнова',
        specialty: 'Кардиолог',
        cabinet: 114,
        photo: photo('1758691462651-611d730c5272'),
    },
    {
        id: 'kuznetsov',
        firstName: 'Андрей',
        lastName: 'Кузнецов',
        specialty: 'Невролог',
        cabinet: 121,
        photo: photo('1659353885824-1199aeeebfc6'),
    },
    {
        id: 'popova',
        firstName: 'Ольга',
        lastName: 'Попова',
        specialty: 'Офтальмолог',
        cabinet: 128,
        photo: photo('1757125736482-328a3cdd9743'),
    },
    {
        id: 'sokolov',
        firstName: 'Михаил',
        lastName: 'Соколов',
        specialty: 'Хирург',
        cabinet: 135,
        photo: photo('1758691461513-88a0aef72160'),
    },
    {
        id: 'lebedeva',
        firstName: 'Наталья',
        lastName: 'Лебедева',
        specialty: 'Педиатр',
        cabinet: 142,
        photo: photo('1623854767648-e7bb8009f0db'),
    },
    {
        id: 'morozov',
        firstName: 'Игорь',
        lastName: 'Морозов',
        specialty: 'Отоларинголог',
        cabinet: 149,
        photo: photo('1666887360445-e3b7bba7917c'),
    },
    {
        id: 'volkova',
        firstName: 'Марина',
        lastName: 'Волкова',
        specialty: 'Дерматолог',
        cabinet: 156,
        photo: photo('1673865641073-4479f93a7776'),
    },
    {
        id: 'orlova',
        firstName: 'Татьяна',
        lastName: 'Орлова',
        specialty: 'Эндокринолог',
        cabinet: 163,
        photo: photo('1631217868264-e5b90bb7e133'),
    },
];

export const doctorFullName = (d) => `${d.lastName} ${d.firstName}`;

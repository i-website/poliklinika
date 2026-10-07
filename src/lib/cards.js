import { MAX_VISITS, MIN_VISITS, VISIT_TEMPLATES } from '../constants/visits';
import { isWorkingDay } from './workingHours';
import { PATIENT } from '../constants/patient';

export const CARDS_PER_DRAWER = 50;

// Мужские фамилии; женские получаем окончанием (-ов → -ова, -ский → -ская и т. д.)
const SURNAMES = [
    'Абрамов', 'Агафонов', 'Алексеев', 'Андреев', 'Антонов', 'Баранов', 'Белов', 'Беляев', 'Блинов', 'Бобров',
    'Богданов', 'Борисов', 'Быков', 'Васильев', 'Вересаев', 'Виноградов', 'Власов', 'Волков', 'Воробьев', 'Гаврилов',
    'Герасимов', 'Голубев', 'Горбунов', 'Григорьев', 'Гусев', 'Данилов', 'Денисов', 'Дмитриев', 'Егоров', 'Ермаков',
    'Ефимов', 'Жуков', 'Зайцев', 'Захаров', 'Зимин', 'Иванов', 'Игнатьев', 'Ильин', 'Исаев', 'Кабанов',
    'Калинин', 'Карпов', 'Киселев', 'Клименко', 'Козлов', 'Комаров', 'Кондратьев', 'Короткий', 'Крылов', 'Кузнецов',
    'Кузьмин', 'Лазарев', 'Лебедев', 'Леонов', 'Лисицын', 'Логинов', 'Макаров', 'Максимов', 'Марков', 'Медведев',
    'Мельников', 'Мещеряков', 'Миронов', 'Михайлов', 'Морозов', 'Муравьев', 'Назаров', 'Некрасов', 'Никитин', 'Новиков',
    'Орлов', 'Осипов', 'Павлов', 'Пестов', 'Петров', 'Платонов', 'Поляков', 'Попов', 'Рогов', 'Романов',
    'Рябов', 'Савельев', 'Семенов', 'Сергеев', 'Смирнов', 'Соколов', 'Соловьев', 'Степанов', 'Сухов', 'Тарасов',
    'Титов', 'Тихонов', 'Ушаков', 'Фадеев', 'Федоров', 'Филиппов', 'Фролов', 'Хохлов', 'Цветков', 'Чернов',
    'Шаповалов', 'Широков', 'Шубин', 'Щербаков', 'Юдин', 'Яковлев', 'Яшин',
];

const MALE_NAMES = ['Александр', 'Алексей', 'Андрей', 'Антон', 'Борис', 'Виктор', 'Владимир', 'Георгий', 'Дмитрий', 'Евгений', 'Игорь', 'Иван', 'Константин', 'Максим', 'Михаил', 'Николай', 'Олег', 'Павел', 'Сергей', 'Юрий'];
const FEMALE_NAMES = ['Александра', 'Анастасия', 'Анна', 'Валентина', 'Вера', 'Галина', 'Дарья', 'Евгения', 'Екатерина', 'Елена', 'Зоя', 'Инна', 'Ирина', 'Лариса', 'Людмила', 'Мария', 'Надежда', 'Наталья', 'Ольга', 'Татьяна'];
const MALE_PATRONYMICS = ['Александрович', 'Алексеевич', 'Андреевич', 'Борисович', 'Викторович', 'Владимирович', 'Дмитриевич', 'Евгеньевич', 'Иванович', 'Игоревич', 'Михайлович', 'Николаевич', 'Олегович', 'Павлович', 'Петрович', 'Сергеевич', 'Юрьевич'];
const FEMALE_PATRONYMICS = ['Александровна', 'Алексеевна', 'Андреевна', 'Борисовна', 'Викторовна', 'Владимировна', 'Дмитриевна', 'Евгеньевна', 'Ивановна', 'Игоревна', 'Михайловна', 'Николаевна', 'Олеговна', 'Павловна', 'Петровна', 'Сергеевна', 'Юрьевна'];

const CARDS_PER_SURNAME = 10;

const hashOf = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
    return h;
};

const femaleSurname = (s) => {
    if (s.endsWith('ий')) return s.slice(0, -2) + 'ая';
    if (/(ов|ев|ин)$/.test(s)) return s + 'а';
    return null; // фамилии на -ко не склоняются
};

const birthOf = (seed) => {
    const h = hashOf(seed);
    const year = 1945 + (h % 65);
    const month = 1 + ((h >>> 8) % 12);
    const day = 1 + ((h >>> 16) % 28);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const fullName = (c) => `${c.lastName} ${c.firstName} ${c.patronymic}`;

function buildCards() {
    const cards = [];
    const seen = new Set([fullName(PATIENT)]);

    const add = (lastName, names, patronymics) => {
        for (let k = 0; k < CARDS_PER_SURNAME; k++) {
            const h = hashOf(`${lastName}${k}`);
            const card = {
                lastName,
                firstName: names[h % names.length],
                patronymic: patronymics[(h >>> 8) % patronymics.length],
            };
            const key = fullName(card);
            if (seen.has(key)) continue;
            seen.add(key);
            cards.push({ ...card, birth: birthOf(key) });
        }
    };

    for (const surname of SURNAMES) {
        add(surname, MALE_NAMES, MALE_PATRONYMICS);
        const female = femaleSurname(surname);
        if (female) add(female, FEMALE_NAMES, FEMALE_PATRONYMICS);
    }

    cards.push({ ...PATIENT });
    cards.sort((a, b) => fullName(a).localeCompare(fullName(b), 'ru'));

    // В каждом ящике ровно по CARDS_PER_DRAWER карточек — лишние с конца алфавита убираем
    cards.length -= cards.length % CARDS_PER_DRAWER;

    // Номер карточки — по порядку в картотеке, это номер амбулаторной карты
    return cards.map((c, i) => ({
        ...c,
        id: i,
        number: String(100000 + i * 7 + (hashOf(fullName(c)) % 7)),
        isMine: fullName(c) === fullName(PATIENT),
    }));
}

const prefix = (c) => c.lastName.slice(0, 3);

// Ящики по алфавиту, в каждом не больше CARDS_PER_DRAWER карточек
export function buildDrawers() {
    const cards = buildCards();
    const drawers = [];
    for (let i = 0; i < cards.length; i += CARDS_PER_DRAWER) {
        const slice = cards.slice(i, i + CARDS_PER_DRAWER);
        drawers.push({
            id: drawers.length,
            label: `${prefix(slice[0])} — ${prefix(slice[slice.length - 1])}`,
            cards: slice,
        });
    }
    return drawers;
}

// Детерминированный генератор случайных чисел (mulberry32), чтобы история карточки не менялась
const seeded = (seed) => () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const HISTORY_YEARS = 12;

// История приёмов: от MIN_VISITS до MAX_VISITS записей за последние годы, свежие сверху
export function visitsFor(card) {
    const rand = seeded(hashOf(`${fullName(card)}${card.number}`));
    const count = MIN_VISITS + Math.floor(rand() * (MAX_VISITS - MIN_VISITS + 1));

    const now = new Date();
    const earliest = Math.max(new Date(card.birth).getTime() + 365 * 86400000, now.getTime() - HISTORY_YEARS * 365 * 86400000);
    const latest = now.getTime() - 86400000;

    return Array.from({ length: count }, () => {
        // приёмы только в будни: выходные сдвигаем назад, чтобы не уйти в будущее
        const date = new Date(earliest + rand() * (latest - earliest));
        while (!isWorkingDay(date)) date.setDate(date.getDate() - 1);
        const template = VISIT_TEMPLATES[Math.floor(rand() * VISIT_TEMPLATES.length)];
        return { date: date.toISOString(), ...template };
    })
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((v, i) => ({ ...v, id: i }));
}

import { nextWorkingDay } from './workingHours';

const KEY = 'poliklinika:appointments';
// Раньше у пациента была одна запись, она лежала под этим ключом
const LEGACY_KEY = 'poliklinika:appointment';

// Запись, которая уже есть у пациента, пока он её не отменил
const defaultAppointment = () => {
    const today = new Date();
    const date = nextWorkingDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 45));
    return {
        id: 'default',
        doctorId: 'ivanov',
        date: date.toISOString(),
        time: '10:30',
        complaint: 'Кашель и температура держатся уже третий день, слабость',
    };
};

// Записей может быть несколько: [{ id, doctorId, date (ISO), time, complaint, cancelled? }]
// Отмена ничего не удаляет из localStorage — запись только помечается cancelled и её можно восстановить.
export const loadAppointments = () => {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw !== null) return JSON.parse(raw);

        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy === null) return [defaultAppointment()];
        // 'null' — так раньше хранилась отмена, стартовую запись возвращаем как отменённую
        const parsed = JSON.parse(legacy);
        return [parsed ? { id: 'legacy', ...parsed } : { ...defaultAppointment(), cancelled: true }];
    } catch {
        return [defaultAppointment()];
    }
};

const store = (list) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(list));
    } catch {}
    return list;
};

export const addAppointment = (appointment) =>
    store([...loadAppointments(), { id: String(Date.now()), ...appointment }]);

export const setCancelled = (id, cancelled) =>
    store(loadAppointments().map((a) => (a.id === id ? { ...a, cancelled } : a)));

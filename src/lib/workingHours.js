export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 20;

export function isClinicOpen(date = new Date()) {
    const hour = date.getHours();
    return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

// Запись только в будние дни (пн–пт)
export const isWorkingDay = (date) => date.getDay() !== 0 && date.getDay() !== 6;

// Ближайший рабочий день, начиная с самой даты (возвращает новую дату)
export const nextWorkingDay = (date) => {
    const result = new Date(date);
    while (!isWorkingDay(result)) result.setDate(result.getDate() + 1);
    return result;
};

// Время приёма — каждые 30 минут в часы работы поликлиники
export const TIME_SLOTS = Array.from({ length: (CLOSE_HOUR - OPEN_HOUR) * 2 }, (_, i) => {
    const hour = OPEN_HOUR + Math.floor(i / 2);
    return `${String(hour).padStart(2, '0')}:${i % 2 ? '30' : '00'}`;
});

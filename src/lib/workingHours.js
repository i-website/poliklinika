export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 20;

export function isClinicOpen(date = new Date()) {
    const hour = date.getHours();
    return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

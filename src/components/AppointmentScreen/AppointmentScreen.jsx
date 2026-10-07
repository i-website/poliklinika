'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DOCTORS, doctorFullName } from '../../constants/doctors';
import { addAppointment } from '../../lib/appointments';
import { isWorkingDay, nextWorkingDay, TIME_SLOTS } from '../../lib/workingHours';
import Header from '../Header/Header';
import styles from './AppointmentScreen.module.scss';

const MAX_MONTHS_AHEAD = 3;
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const MONTH_YEAR = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
const DAY_MONTH = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
const FULL_DATE = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

const hashOf = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
};

const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Все окна заняты — свободна только ближайшая запись через 1–2 месяца (в будний день, в часы работы)
const nearestAppointment = (doctorId) => {
    const h = hashOf(doctorId);
    const today = new Date();
    const date = nextWorkingDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30 + (h % 31)));
    return { date, time: TIME_SLOTS[h % TIME_SLOTS.length] };
};

// Дни месяца с пустыми ячейками в начале, чтобы неделя начиналась с понедельника
const buildMonth = (year, month) => {
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(year, month, i + 1))];
};

export default function AppointmentScreen() {
    const [doctor, setDoctor] = useState(null);
    const [monthShift, setMonthShift] = useState(0);
    const [done, setDone] = useState(false);
    const [complaint, setComplaint] = useState('');

    const today = useMemo(() => new Date(), []);
    const nearest = useMemo(() => (doctor ? nearestAppointment(doctor.id) : null), [doctor]);

    const view = new Date(today.getFullYear(), today.getMonth() + monthShift, 1);
    const cells = buildMonth(view.getFullYear(), view.getMonth());

    const pickDoctor = (d) => {
        setDoctor(d);
        setMonthShift(0);
    };

    const back = () => setDoctor(null);

    const reset = () => {
        back();
        setDone(false);
        setComplaint('');
    };

    const book = () => {
        addAppointment({
            doctorId: doctor.id,
            date: nearest.date.toISOString(),
            time: nearest.time,
            complaint: complaint.trim(),
        });
        setDone(true);
    };

    let content;
    if (done) {
        content = (
            <div className={styles.done}>
                <div className={styles.check}>✓</div>
                <h1 className={styles.title}>Вы записаны</h1>
                <p className={styles.doneText}>
                    {doctorFullName(doctor)}, {doctor.specialty.toLowerCase()}
                    <br />
                    {DAY_MONTH.format(nearest.date)}, {nearest.time}
                </p>
                <Link href="/my-appointments" className={styles.primary}>Мои записи</Link>
                <button type="button" className={styles.secondary} onClick={reset}>
                    Записаться ещё
                </button>
            </div>
        );
    } else if (!doctor) {
        content = (
            <>
                <h1 className={styles.title}>Выберите врача</h1>
                <div className={styles.doctors}>
                    {DOCTORS.map((d) => (
                        <button key={d.id} type="button" className={styles.doctor} onClick={() => pickDoctor(d)}>
                            <img src={d.photo} alt="" className={styles.photo} loading="lazy" />
                            <span className={styles.docName}>{doctorFullName(d)}</span>
                            <span className={styles.docSpec}>{d.specialty}</span>
                        </button>
                    ))}
                </div>
            </>
        );
    } else {
        content = (
            <>
                <button type="button" className={styles.backBtn} onClick={back}>← Другой врач</button>
                <div className={styles.selected}>
                    <img src={doctor.photo} alt="" className={styles.photoSmall} />
                    <div>
                        <div className={styles.docName}>{doctorFullName(doctor)}</div>
                        <div className={styles.docSpec}>{doctor.specialty}</div>
                    </div>
                </div>

                <div className={styles.calendar}>
                    <div className={styles.calHead}>
                        <button
                            type="button"
                            className={styles.navBtn}
                            disabled={monthShift === 0}
                            onClick={() => setMonthShift((m) => m - 1)}
                            aria-label="Предыдущий месяц"
                        >
                            ‹
                        </button>
                        <span className={styles.calTitle}>{MONTH_YEAR.format(view)}</span>
                        <button
                            type="button"
                            className={styles.navBtn}
                            disabled={monthShift === MAX_MONTHS_AHEAD}
                            onClick={() => setMonthShift((m) => m + 1)}
                            aria-label="Следующий месяц"
                        >
                            ›
                        </button>
                    </div>
                    <div className={styles.grid}>
                        {WEEKDAYS.map((w) => (
                            <span key={w} className={styles.weekday}>{w}</span>
                        ))}
                        {cells.map((d, i) =>
                            d ? (
                                <span
                                    key={i}
                                    className={[
                                        styles.cell,
                                        !isWorkingDay(d) && styles.weekend,
                                        sameDay(d, nearest.date) && styles.nearest,
                                        sameDay(d, today) && styles.today,
                                    ].filter(Boolean).join(' ')}
                                >
                                    {d.getDate()}
                                </span>
                            ) : (
                                <span key={i} />
                            )
                        )}
                    </div>
                    <p className={styles.legend}>
                        Свободных окон нет — все даты заняты.
                        <br />
                        Приём по будням, с 8:00 до 20:00
                    </p>
                </div>

                <div className={styles.nearestCard}>
                    <div className={styles.nearestLabel}>Ближайшая запись</div>
                    <div className={styles.nearestDate}>{FULL_DATE.format(nearest.date)}</div>
                    <div className={styles.nearestTime}>{nearest.time}</div>
                </div>

                <label className={styles.complaint}>
                    Жалоба (обязательно)
                    <textarea
                        rows={3}
                        maxLength={500}
                        placeholder="Опишите, что вас беспокоит"
                        value={complaint}
                        onChange={(e) => setComplaint(e.target.value)}
                    />
                </label>

                <Link href={`/auction?doctor=${doctor.id}`} className={styles.auction}>
                    Участвовать в аукционе
                </Link>

                <button type="button" className={`${styles.primary} ${styles.primaryAfter}`} disabled={!complaint.trim()} onClick={book}>
                    Записаться на {DAY_MONTH.format(nearest.date)}
                </button>
            </>
        );
    }

    return (
        <div className={styles.screen}>
            <Header />
            <div className={styles.scroll}>
                <div className={styles.content}>{content}</div>
            </div>
        </div>
    );
}

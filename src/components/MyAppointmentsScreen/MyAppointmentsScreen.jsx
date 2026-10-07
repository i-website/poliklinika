'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DOCTORS, doctorFullName } from '../../constants/doctors';
import { loadAppointments, setCancelled } from '../../lib/appointments';
import Header from '../Header/Header';
import styles from './MyAppointmentsScreen.module.scss';

const WEEKDAY = new Intl.DateTimeFormat('ru-RU', { weekday: 'long' });
const MONTH = new Intl.DateTimeFormat('ru-RU', { month: 'long' });
const YEAR = new Intl.DateTimeFormat('ru-RU', { year: 'numeric' });

function AppointmentCard({ appointment, doctor, onCancel, onRestore }) {
    const date = new Date(appointment.date);
    const cancelled = appointment.cancelled;

    return (
        <div className={`${styles.card} ${cancelled ? styles.cancelled : ''}`}>
            <div className={styles.head}>
                <img src={doctor.photo} alt="" className={styles.photo} />
                <div className={styles.headText}>
                    <div className={styles.docName}>{doctorFullName(doctor)}</div>
                    <div className={styles.docSpec}>{doctor.specialty}</div>
                </div>
                <span className={`${styles.status} ${cancelled ? styles.statusOff : ''}`}>
                    {cancelled ? 'Отменена' : 'Подтверждена'}
                </span>
            </div>

            <div className={styles.body}>
                <div className={styles.when}>
                    <div className={styles.tile}>
                        <span className={styles.tileMonth}>{MONTH.format(date)}</span>
                        <span className={styles.tileDay}>{date.getDate()}</span>
                    </div>
                    <div>
                        <div className={styles.weekday}>{WEEKDAY.format(date)}</div>
                        <div className={styles.time}>{appointment.time}</div>
                        <div className={styles.year}>{YEAR.format(date)} год</div>
                    </div>
                </div>

                <div className={styles.complaintBox}>
                    <div className={styles.label}>Жалоба</div>
                    <div className={styles.complaint}>{appointment.complaint}</div>
                </div>

                {cancelled ? (
                    <button type="button" className={styles.restore} onClick={onRestore}>
                        Восстановить запись
                    </button>
                ) : (
                    <button type="button" className={styles.cancel} onClick={onCancel}>
                        Отменить запись
                    </button>
                )}
            </div>
        </div>
    );
}

export default function MyAppointmentsScreen() {
    // null — ещё не прочитали localStorage (на сервере его нет)
    const [list, setList] = useState(null);

    useEffect(() => {
        setList(loadAppointments());
    }, []);

    const cancel = (id) => {
        if (window.confirm('Отменить запись?')) setList(setCancelled(id, true));
    };

    const restore = (id) => setList(setCancelled(id, false));

    const sorted = (list || []).slice().sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div className={styles.screen}>
            <Header />
            <div className={styles.scroll}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Мои записи</h1>

                    {list && sorted.length === 0 && <p className={styles.empty}>У вас пока нет записей</p>}

                    {sorted.map((a) => {
                        const doctor = DOCTORS.find((d) => d.id === a.doctorId);
                        return doctor ? (
                            <AppointmentCard
                                key={a.id}
                                appointment={a}
                                doctor={doctor}
                                onCancel={() => cancel(a.id)}
                                onRestore={() => restore(a.id)}
                            />
                        ) : null;
                    })}

                    {list && (
                        <Link href="/appointment" className={styles.primary}>Записаться ещё</Link>
                    )}
                </div>
            </div>
        </div>
    );
}

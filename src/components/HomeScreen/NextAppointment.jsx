'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DOCTORS, doctorFullName } from '../../constants/doctors';
import { loadAppointments } from '../../lib/appointments';
import styles from './HomeScreen.module.scss';

const FULL_DATE = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });

// Ближайшая неотменённая запись пациента
export default function NextAppointment() {
    // undefined — ещё не прочитали localStorage (на сервере его нет)
    const [next, setNext] = useState(undefined);

    useEffect(() => {
        const upcoming = loadAppointments()
            .filter((a) => !a.cancelled)
            .sort((a, b) => a.date.localeCompare(b.date))[0];
        setNext(upcoming || null);
    }, []);

    if (next === undefined) return null;

    const doctor = next && DOCTORS.find((d) => d.id === next.doctorId);

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Ближайшая запись</h2>
            {doctor ? (
                <Link href="/my-appointments" className={styles.next}>
                    <img src={doctor.photo} alt="" className={styles.nextPhoto} />
                    <div className={styles.nextText}>
                        <div className={styles.nextDoctor}>{doctorFullName(doctor)}</div>
                        <div className={styles.nextSpec}>{doctor.specialty}, кабинет {doctor.cabinet}</div>
                        <div className={styles.nextDate}>
                            {FULL_DATE.format(new Date(next.date))}, {next.time}
                        </div>
                    </div>
                </Link>
            ) : (
                <div className={styles.empty}>
                    Записей пока нет.{' '}
                    <Link href="/appointment" className={styles.emptyLink}>Записаться на приём</Link>
                </div>
            )}
        </section>
    );
}

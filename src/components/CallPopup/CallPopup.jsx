'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_CALL } from '../../constants/call';
import { DOCTORS } from '../../constants/doctors';
import { loadAppointments } from '../../lib/appointments';
import styles from './CallPopup.module.scss';

const CALL_DELAY_MS = 5000;
const FALLBACK_COMPLAINT = 'Жалоба не указана';

// Без аргумента — вызов по умолчанию, с id врача — этот врач и жалоба из его активной записи
const pickCall = (doctorId) => {
    const doctor = DOCTORS.find((d) => d.id === doctorId);
    if (!doctor) return DEFAULT_CALL;

    const appointment = loadAppointments().find((a) => !a.cancelled && a.doctorId === doctor.id);
    return {
        specialty: doctor.specialty,
        surname: doctor.lastName,
        cabinet: doctor.cabinet,
        complaint: appointment?.complaint || FALLBACK_COMPLAINT,
    };
};

export default function CallPopup() {
    const [call, setCall] = useState(null);

    // Консольные команды:
    //   callPatient() или callPatient('smirnova') — попап появится через 5 секунд
    //   endCall() — закрыть попап (сам он не закрывается)
    useEffect(() => {
        let timer;
        window.callPatient = (doctorId) => {
            clearTimeout(timer);
            timer = setTimeout(() => setCall(pickCall(doctorId)), CALL_DELAY_MS);
            console.log(`Вызов пациента через ${CALL_DELAY_MS / 1000} секунд`);
        };
        window.endCall = () => {
            clearTimeout(timer);
            setCall(null);
        };
        return () => {
            clearTimeout(timer);
            delete window.callPatient;
            delete window.endCall;
        };
    }, []);

    if (!call) return null;
    const { specialty, surname, cabinet, complaint } = call;

    return (
        <div className={styles.overlay} role="alertdialog" aria-live="assertive">
            <div className={styles.rings} aria-hidden="true">
                <span />
                <span />
                <span />
            </div>

            <div className={styles.content}>
                <div className={styles.kicker}>Вас вызывает</div>
                <div className={styles.specialty}>{specialty}</div>
                <div className={styles.surname}>{surname}</div>
                <div className={styles.complaint}>
                    <span>Жалоба</span>
                    {complaint}
                </div>
                <div className={styles.cabinet}>Кабинет {cabinet}</div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ClosedScreen from '../ClosedScreen/ClosedScreen';
import { isClinicOpen } from '../../lib/workingHours';
import styles from './LoginScreen.module.scss';

export default function LoginScreen() {
    const router = useRouter();
    const [closed, setClosed] = useState(false);

    function handleLogin() {
        // if (!isClinicOpen()) {
        //     setClosed(true);
        //     return;
        // }

        router.push('/max');
    }

    if (closed) return <ClosedScreen />;

    return (
        <div className={styles.login}>
            <div className={styles.card}>
                <img className={styles.entrance} src="/enter.png" alt="Logo" />
                <h1 className={styles.title}>Добро пожаловать</h1>
                <button onClick={handleLogin} className={styles.max}>Войти через MAX</button>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataPopup from '../DataPopup/DataPopup';
import styles from './MaxCodeScreen.module.scss';

const CODE_LENGTH = 6;
const FILL_DELAY = 3000;
const REDIRECT_DELAY = 5000;

function generateCode() {
    return Array.from({ length: CODE_LENGTH }, () => Math.floor(Math.random() * 10));
}

export default function MaxCodeScreen() {
    const router = useRouter();
    const [digits, setDigits] = useState([]);
    const filled = digits.length === CODE_LENGTH;

    useEffect(() => {
        const timer = setTimeout(() => setDigits(generateCode()), FILL_DELAY);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!filled) return;
        const timer = setTimeout(() => router.push('/home'), REDIRECT_DELAY);
        return () => clearTimeout(timer);
    }, [filled, router]);

    return (
        <div className={styles.screen}>
            {filled && <DataPopup />}
            <div className={styles.card}>
                <h1 className={styles.title}>Подтвердите вход</h1>
                <p className={styles.text}>Введите код из 6 цифр, отправленный в MAX</p>
                <div className={styles.code}>
                    {Array.from({ length: CODE_LENGTH }, (_, i) => (
                        <div key={i} className={`${styles.cell} ${filled ? styles.disabled : ''}`}>
                            {digits[i]}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

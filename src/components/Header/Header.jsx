'use client';

import { useEffect, useState } from 'react';
import styles from './Header.module.scss';

const MENU_ITEMS = [
    { label: 'Главная', href: '/home' },
    { label: 'Записаться на приём', href: '#' },
    { label: 'Мои записи', href: '#' },
    { label: 'Врачи', href: '#' },
    { label: 'Контакты', href: '#' },
    { label: 'Пока вы ждёте', href: '/wait' },
];

export default function Header() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open]);

    return (
        <>
            <header className={styles.header}>
                <button
                    type="button"
                    className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
                    aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                >
                    <span />
                    <span />
                    <span />
                </button>
                <div className={styles.title}>
                    <span className={styles.org}>ОГБУЗ</span>
                    <span className={styles.name}>«Городская клиническая больница № 1»</span>
                </div>
            </header>

            <div
                className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}
                onClick={() => setOpen(false)}
            />
            <nav className={`${styles.menu} ${open ? styles.menuOpen : ''}`} aria-hidden={!open}>
                {MENU_ITEMS.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className={styles.link}
                        tabIndex={open ? 0 : -1}
                        onClick={() => setOpen(false)}
                    >
                        {item.label}
                    </a>
                ))}
            </nav>
        </>
    );
}

'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PATIENT } from '../../constants/patient';
import { buildDrawers, CARDS_PER_DRAWER, visitsFor } from '../../lib/cards';
import Header from '../Header/Header';
import styles from './MyCardScreen.module.scss';

const BIRTH = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const SWIPE_PX = 40;
const VISIT_DATE = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

// Открытая карточка: данные пациента и история приёмов
function CardDetails({ card }) {
    const visits = useMemo(() => visitsFor(card), [card]);

    return (
        <>
            <div className={styles.relativeCard}>
                <div className={styles.faceNumber}>Карта № {card.number}</div>
                <div className={styles.faceName}>
                    {card.lastName} {card.firstName} {card.patronymic}
                </div>
                <div className={styles.faceBirth}>Дата рождения: {BIRTH.format(new Date(card.birth))}</div>
            </div>

            <div className={styles.visitsTitle}>История приёмов · {visits.length}</div>
            <ol className={styles.visits}>
                {visits.map((v) => (
                    <li key={v.id} className={styles.visit}>
                        <div className={styles.visitHead}>
                            <span>{VISIT_DATE.format(new Date(v.date))}</span>
                            <span className={styles.visitDoctor}>{v.specialty}</span>
                        </div>
                        <div className={styles.visitRow}><b>Жалоба:</b> {v.complaint}</div>
                        <div className={styles.visitRow}><b>Диагноз:</b> {v.diagnosis}</div>
                    </li>
                ))}
            </ol>
        </>
    );
}

function CardFace({ card }) {
    return (
        <div className={styles.face}>
            <span className={styles.tab}>{card.lastName}</span>
            <div className={styles.faceBody}>
                <div className={styles.faceNumber}>Карта № {card.number}</div>
                <div className={styles.faceName}>
                    {card.lastName}
                    <br />
                    {card.firstName} {card.patronymic}
                </div>
                <div className={styles.faceBirth}>Дата рождения: {BIRTH.format(new Date(card.birth))}</div>
            </div>
        </div>
    );
}

// Ящик: карточки листаются по одной, как в настоящей картотеке
function Drawer({ drawer, onBack }) {
    const [index, setIndex] = useState(0);
    // Карточка, которая как раз перелистывается (уходит с экрана)
    const [leaving, setLeaving] = useState(null);
    // Какое окно открыто: found — своя карточка, denied — чужая (запрет), relative — чужая, открытая «как родственник»
    const [modal, setModal] = useState(null);
    const touchX = useRef(null);

    const card = drawer.cards[index];

    const flip = useCallback(
        (dir) => {
            const next = index + dir;
            if (next < 0 || next >= drawer.cards.length || modal) return;
            setLeaving({ card: drawer.cards[index], dir });
            setIndex(next);
        },
        [index, drawer, modal]
    );

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') flip(1);
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') flip(-1);
            if (e.key === 'Escape') setModal(null);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [flip]);

    const onTouchEnd = (e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (dx < -SWIPE_PX) flip(1);
        if (dx > SWIPE_PX) flip(-1);
    };

    const pick = () => setModal(card.isMine ? 'found' : 'denied');

    return (
        <>
            <button type="button" className={styles.back} onClick={onBack}>← К ящикам</button>
            <h1 className={styles.title}>
                Ящик <span className={styles.titlePlate}>{drawer.label}</span>
            </h1>

            <div className={styles.search}>
                Ищем: <b>{PATIENT.lastName} {PATIENT.firstName} {PATIENT.patronymic}</b>,{' '}
                {BIRTH.format(new Date(PATIENT.birth))}
            </div>

            <div
                className={styles.stack}
                onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
                onTouchEnd={onTouchEnd}
            >
                {/* края карточек, лежащих ниже */}
                <div className={`${styles.edge} ${styles.edge2}`} />
                <div className={`${styles.edge} ${styles.edge1}`} />

                <div className={styles.current}>
                    <CardFace card={card} />
                </div>

                {leaving && (
                    <div
                        key={leaving.card.id}
                        className={`${styles.leaving} ${leaving.dir < 0 ? styles.flipPrev : ''}`}
                        onAnimationEnd={() => setLeaving(null)}
                    >
                        <CardFace card={leaving.card} />
                    </div>
                )}
            </div>

            <div className={styles.counter}>Карточка {index + 1} из {CARDS_PER_DRAWER}</div>

            <div className={styles.controls}>
                <button type="button" className={styles.flipBtn} disabled={index === 0} onClick={() => flip(-1)}>
                    ← Назад
                </button>
                <button
                    type="button"
                    className={styles.flipBtn}
                    disabled={index === drawer.cards.length - 1}
                    onClick={() => flip(1)}
                >
                    Дальше →
                </button>
            </div>

            <button type="button" className={styles.pick} onClick={pick}>
                Это моя карточка
            </button>

            {modal && (
                <div className={styles.overlay} onClick={() => setModal(null)}>
                    <div className={styles.modal} role="dialog" onClick={(e) => e.stopPropagation()}>
                        {modal === 'found' && (
                            <>
                                <div className={styles.check}>✓</div>
                                <div className={styles.modalTitle}>Вы нашли свою карточку!</div>
                                <CardDetails card={card} />
                                <Link href="/my-appointments" className={styles.modalLink}>Мои записи</Link>
                                <button type="button" className={styles.close} onClick={() => setModal(null)}>
                                    Закрыть
                                </button>
                            </>
                        )}

                        {modal === 'denied' && (
                            <>
                                <div className={`${styles.check} ${styles.denied}`}>!</div>
                                <div className={styles.modalTitle}>Выбор карточки запрещён</div>
                                <div className={styles.modalText}>
                                    Это карточка другого пациента. Медицинские данные закрыты — просматривать чужую
                                    карточку без разрешения нельзя.
                                </div>
                                <button type="button" className={styles.close} onClick={() => setModal('relative')}>
                                    Я родственник
                                </button>
                                <button type="button" className={styles.secondary} onClick={() => setModal(null)}>
                                    Положить на место
                                </button>
                            </>
                        )}

                        {modal === 'relative' && (
                            <>
                                <div className={styles.modalTitle}>Карточка открыта</div>
                                <div className={styles.modalText}>Доступ открыт как родственнику пациента.</div>
                                <CardDetails card={card} />
                                <button type="button" className={styles.close} onClick={() => setModal(null)}>
                                    Закрыть
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default function MyCardScreen() {
    const drawers = useMemo(buildDrawers, []);
    const [drawer, setDrawer] = useState(null);

    return (
        <div className={styles.screen}>
            <Header />
            <div className={styles.scroll}>
                <div className={styles.content}>
                    {!drawer ? (
                        <>
                            <h1 className={styles.title}>Моя карточка</h1>
                            <p className={styles.hint}>
                                Картотека стоит по алфавиту: в каждом ящике {CARDS_PER_DRAWER} карточек.
                                Откройте нужный ящик и перелистайте карточки, пока не найдёте свою.
                            </p>
                            <div className={styles.search}>
                                Ищем: <b>{PATIENT.lastName} {PATIENT.firstName} {PATIENT.patronymic}</b>,{' '}
                                {BIRTH.format(new Date(PATIENT.birth))}
                            </div>
                            <div className={styles.drawers}>
                                {drawers.map((d) => (
                                    <button key={d.id} type="button" className={styles.drawer} onClick={() => setDrawer(d)}>
                                        <span className={styles.plate}>{d.label}</span>
                                        <span className={styles.handle} />
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <Drawer drawer={drawer} onBack={() => setDrawer(null)} />
                    )}
                </div>
            </div>
        </div>
    );
}

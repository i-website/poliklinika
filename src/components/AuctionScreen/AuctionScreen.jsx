'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BID_STEP, BIDDERS, CARD_ERRORS } from '../../constants/bidders';
import { DOCTORS, doctorFullName } from '../../constants/doctors';
import { isWorkingDay } from '../../lib/workingHours';
import Header from '../Header/Header';
import styles from './AuctionScreen.module.scss';

const LOTS_COUNT = 6;

const WEEKDAY = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
const DAY_MONTH = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
const FULL_DATE = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
const MONEY = new Intl.NumberFormat('ru-RU');

const hashOf = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
};

const toKey = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// Лоты — ближайшие рабочие дни, все окна на них заняты, поэтому запись достаётся тому, кто дороже заплатит
const buildLots = (doctorId) => {
    const today = new Date();
    const lots = [];
    for (let i = 1; lots.length < LOTS_COUNT; i++) {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
        if (!isWorkingDay(date)) continue;
        const h = hashOf(`${doctorId}${toKey(date)}`);
        lots.push({
            key: toKey(date),
            date,
            bidder: BIDDERS[h % BIDDERS.length],
            bid: 3000 + (h % 90) * 100,
        });
    }
    return lots;
};

const digits = (v, max) => v.replace(/\D/g, '').slice(0, max);
const formatCard = (v) => digits(v, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
const formatExpiry = (v) => digits(v, 4).replace(/(\d{2})(?=\d)/, '$1/');

const EMPTY_CARD = { number: '', expiry: '', cvc: '', holder: '' };

export default function AuctionScreen() {
    const doctorId = useSearchParams().get('doctor');
    const doctor = DOCTORS.find((d) => d.id === doctorId);

    const initialLots = useMemo(() => (doctor ? buildLots(doctor.id) : []), [doctor]);
    const [selected, setSelected] = useState(0);
    const [cardOpen, setCardOpen] = useState(false);
    const [card, setCard] = useState(EMPTY_CARD);
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [error, setError] = useState('');

    const lots = initialLots;
    const lot = lots[selected];

    const closeCard = () => {
        setCardOpen(false);
        setCard(EMPTY_CARD);
        setError('');
        setLoading(false);
    };

    useEffect(() => {
        if (!cardOpen) return;
        const onKeyDown = (e) => e.key === 'Escape' && closeCard();
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [cardOpen]);

    const setField = (name, format) => (e) => {
        setError('');
        setCard((c) => ({ ...c, [name]: format(e.target.value) }));
    };

    // Данные карты никуда не отправляются и не сохраняются — привязка всегда заканчивается ошибкой
    const submitCard = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTimeout(() => {
            setLoading(false);
            setError(CARD_ERRORS[attempts % CARD_ERRORS.length]);
            setAttempts((n) => n + 1);
        }, 1400);
    };

    const cardValid =
        card.number.length === 19 && card.expiry.length === 5 && card.cvc.length === 3 && card.holder.trim();

    let content;
    if (!doctor) {
        content = (
            <>
                <h1 className={styles.title}>Врач не выбран</h1>
                <Link href="/appointment" className={styles.back}>← Выбрать врача</Link>
            </>
        );
    } else {
        content = (
            <>
                <Link href="/appointment" className={styles.back}>← Назад</Link>
                <h1 className={styles.title}>Аукцион записей</h1>

                <div className={styles.doctor}>
                    <img src={doctor.photo} alt="" className={styles.photo} />
                    <div>
                        <div className={styles.docName}>{doctorFullName(doctor)}</div>
                        <div className={styles.docSpec}>{doctor.specialty}</div>
                    </div>
                </div>

                <h2 className={styles.subtitle}>Дата приёма</h2>
                <div className={styles.lots}>
                    {lots.map((l, i) => (
                        <button
                            key={l.key}
                            type="button"
                            className={`${styles.lotBtn} ${i === selected ? styles.active : ''}`}
                            onClick={() => setSelected(i)}
                        >
                            <span className={styles.lotWeek}>{WEEKDAY.format(l.date)}</span>
                            <span className={styles.lotDate}>{DAY_MONTH.format(l.date)}</span>
                            <span className={styles.lotBid}>{MONEY.format(l.bid)} ₽</span>
                        </button>
                    ))}
                </div>

                <div className={styles.leader}>
                    <div className={styles.leaderLabel}>Максимальная ставка на {FULL_DATE.format(lot.date)}</div>
                    <div className={styles.leaderRow}>
                        <span className={styles.leaderName}>{lot.bidder}</span>
                        <span className={styles.leaderBid}>{MONEY.format(lot.bid)} ₽</span>
                    </div>
                </div>

                <button type="button" className={styles.outbid} onClick={() => setCardOpen(true)}>
                    Перебить · {MONEY.format(lot.bid + BID_STEP)} ₽
                </button>

                {cardOpen && (
                    <div className={styles.modalOverlay} onClick={closeCard}>
                        <form className={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={submitCard}>
                            <h2 className={styles.modalTitle}>Добавьте карту</h2>
                            <p className={styles.modalText}>
                                Чтобы сделать ставку {MONEY.format(lot.bid + BID_STEP)} ₽, привяжите банковскую карту
                            </p>

                            <label className={styles.field}>
                                Номер карты
                                <input
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="0000 0000 0000 0000"
                                    value={card.number}
                                    onChange={setField('number', formatCard)}
                                />
                            </label>
                            <div className={styles.fieldRow}>
                                <label className={styles.field}>
                                    Срок
                                    <input
                                        inputMode="numeric"
                                        autoComplete="off"
                                        placeholder="ММ/ГГ"
                                        value={card.expiry}
                                        onChange={setField('expiry', formatExpiry)}
                                    />
                                </label>
                                <label className={styles.field}>
                                    CVC
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        placeholder="•••"
                                        value={card.cvc}
                                        onChange={setField('cvc', (v) => digits(v, 3))}
                                    />
                                </label>
                            </div>
                            <label className={styles.field}>
                                Имя владельца
                                <input
                                    autoComplete="off"
                                    placeholder="IVAN IVANOV"
                                    value={card.holder}
                                    onChange={setField('holder', (v) => v.toUpperCase())}
                                />
                            </label>

                            {error && <div className={styles.error}>{error}</div>}

                            <button type="submit" className={styles.submit} disabled={!cardValid || loading}>
                                {loading ? 'Проверяем…' : 'Добавить карту'}
                            </button>
                            <button type="button" className={styles.cancel} onClick={closeCard}>
                                Отмена
                            </button>
                        </form>
                    </div>
                )}
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

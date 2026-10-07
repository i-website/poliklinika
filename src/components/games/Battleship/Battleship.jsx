'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import styles from './Battleship.module.scss';

const SIZE = 10;
const LETTERS = 'АБВГДЕЖЗИК'.split('');
// Классический флот: 1×4, 2×3, 3×2, 4×1
const FLEET = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
const SIZES = [4, 3, 2, 1];
const TOTAL_DECKS = FLEET.reduce((a, b) => a + b, 0);
const STORAGE_KEY = 'battleship:v1';

const idx = (r, c) => r * SIZE + c;
const cellName = (i) => `${LETTERS[i % SIZE]}${Math.floor(i / SIZE) + 1}`;

// Клетки корабля от начальной клетки вправо или вниз (null — не помещается в поле)
const shipCells = (i, size, horizontal) => {
    const r = Math.floor(i / SIZE);
    const c = i % SIZE;
    const cells = [];
    for (let k = 0; k < size; k++) {
        const rr = r + (horizontal ? 0 : k);
        const cc = c + (horizontal ? k : 0);
        if (rr >= SIZE || cc >= SIZE) return null;
        cells.push(idx(rr, cc));
    }
    return cells;
};

// Корабли не могут касаться друг друга, даже по диагонали
const fits = (cells, ships) => {
    const occupied = new Set(ships.flat());
    return cells.every((i) => {
        const r = Math.floor(i / SIZE);
        const c = i % SIZE;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const rr = r + dr;
                const cc = c + dc;
                if (rr < 0 || cc < 0 || rr >= SIZE || cc >= SIZE) continue;
                if (occupied.has(idx(rr, cc))) return false;
            }
        }
        return true;
    });
};

const randomFleet = () => {
    for (let attempt = 0; attempt < 100; attempt++) {
        const ships = [];
        let ok = true;
        for (const size of FLEET) {
            let placed = false;
            for (let tries = 0; tries < 200 && !placed; tries++) {
                const cells = shipCells(Math.floor(Math.random() * SIZE * SIZE), size, Math.random() < 0.5);
                if (cells && fits(cells, ships)) {
                    ships.push(cells);
                    placed = true;
                }
            }
            if (!placed) {
                ok = false;
                break;
            }
        }
        if (ok) return ships;
    }
    return [];
};

const loadState = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
        return null;
    }
};

function Grid({ renderCell, onCell, disabled }) {
    return (
        <div className={`${styles.grid} ${disabled ? styles.gridOff : ''}`}>
            <span />
            {LETTERS.map((l) => (
                <span key={l} className={styles.axis}>{l}</span>
            ))}
            {Array.from({ length: SIZE }, (_, r) => (
                <Fragment key={r}>
                    <span className={styles.axis}>{r + 1}</span>
                    {Array.from({ length: SIZE }, (_, c) => {
                        const i = idx(r, c);
                        const { className = '', content = '' } = renderCell(i);
                        return (
                            <button
                                key={c}
                                type="button"
                                className={`${styles.cell} ${className}`}
                                disabled={disabled}
                                aria-label={cellName(i)}
                                onClick={() => onCell(i)}
                            >
                                {content}
                            </button>
                        );
                    })}
                </Fragment>
            ))}
        </div>
    );
}

// Телефон вместо бумаги: ничего не проверяется и не передаётся сопернику, всё отмечают игроки сами
export default function Battleship() {
    const [loaded, setLoaded] = useState(false);
    const [ships, setShips] = useState([]);
    const [phase, setPhase] = useState('setup');
    const [theirMarks, setTheirMarks] = useState({});
    const [myShots, setMyShots] = useState([]);
    const [size, setSize] = useState(4);
    const [horizontal, setHorizontal] = useState(true);
    const [say, setSay] = useState(null);
    const [hint, setHint] = useState('');

    useEffect(() => {
        const saved = loadState();
        if (saved) {
            setShips(saved.ships || []);
            setPhase(saved.phase || 'setup');
            setTheirMarks(saved.theirMarks || {});
            setMyShots(saved.myShots || []);
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (!loaded) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ships, phase, theirMarks, myShots }));
        } catch {}
    }, [loaded, ships, phase, theirMarks, myShots]);

    const shipOf = useMemo(() => {
        const map = new Map();
        ships.forEach((cells, n) => cells.forEach((i) => map.set(i, n)));
        return map;
    }, [ships]);

    const shots = useMemo(() => new Set(myShots), [myShots]);
    const sunk = useMemo(() => new Set(ships.map((cells, n) => (cells.every((i) => shots.has(i)) ? n : -1))), [ships, shots]);

    const remaining = (s) => FLEET.filter((x) => x === s).length - ships.filter((c) => c.length === s).length;
    const theirHits = Object.values(theirMarks).filter((m) => m === 'hit').length;
    const lost = phase === 'play' && ships.length > 0 && ships.every((_, n) => sunk.has(n));
    const won = phase === 'play' && theirHits === TOTAL_DECKS;

    // Выбранный размер сохраняется; переключаемся на другой, только когда кораблей такого размера не осталось
    const keepSize = (nextShips) => {
        const left = (s) => FLEET.filter((x) => x === s).length - nextShips.filter((c) => c.length === s).length;
        if (left(size) > 0) return;
        const next = SIZES.find((s) => left(s) > 0);
        if (next) setSize(next);
    };

    const placeShip = (i) => {
        setHint('');
        const n = shipOf.get(i);
        if (n !== undefined) {
            const next = ships.filter((_, k) => k !== n);
            setShips(next);
            setSize((current) => (FLEET.filter((x) => x === current).length - next.filter((c) => c.length === current).length > 0 ? current : ships[n].length));
            return;
        }
        if (remaining(size) <= 0) {
            setHint('Корабли такого размера уже расставлены. Выберите другой.');
            return;
        }
        const cells = shipCells(i, size, horizontal);
        if (!cells || !fits(cells, ships)) {
            setHint('Сюда не поставить: корабль не помещается или касается другого.');
            return;
        }
        const next = [...ships, cells];
        setShips(next);
        keepSize(next);
    };

    const randomize = () => {
        setShips(randomFleet());
        setHint('');
    };

    const clearShips = () => {
        setShips([]);
        setSize(4);
        setHint('');
    };

    // Выстрел соперника: игрок сам отмечает клетку, а телефон подсказывает, что ответить
    const toggleShot = (i) => {
        if (shots.has(i)) {
            setMyShots((s) => s.filter((x) => x !== i));
            setSay(null);
            return;
        }
        setMyShots((s) => [...s, i]);
        const n = shipOf.get(i);
        if (n === undefined) {
            setSay({ text: 'Мимо', tone: 'miss', cell: cellName(i) });
        } else {
            const killed = ships[n].every((x) => x === i || shots.has(x));
            setSay({ text: killed ? 'Убил' : 'Ранил', tone: 'hit', cell: cellName(i) });
        }
    };

    const cycleTheirMark = (i) => {
        setTheirMarks((marks) => {
            const next = { ...marks };
            if (!marks[i]) next[i] = 'miss';
            else if (marks[i] === 'miss') next[i] = 'hit';
            else delete next[i];
            return next;
        });
    };

    const newGame = () => {
        if (!window.confirm('Начать новую игру? Поля будут очищены.')) return;
        setShips([]);
        setPhase('setup');
        setTheirMarks({});
        setMyShots([]);
        setSize(4);
        setSay(null);
        setHint('');
    };

    const renderTheirCell = (i) => {
        const mark = theirMarks[i];
        if (mark === 'miss') return { className: styles.miss, content: '•' };
        if (mark === 'hit') return { className: styles.theirHit, content: '✕' };
        return {};
    };

    const renderMyCell = (i) => {
        const n = shipOf.get(i);
        const shot = shots.has(i);
        if (n === undefined) return shot ? { className: styles.miss, content: '•' } : {};
        if (!shot) return { className: styles.ship };
        return { className: sunk.has(n) ? styles.sunk : styles.shipHit, content: '✕' };
    };

    if (!loaded) return null;

    return (
        <div className={styles.game}>
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Моё поле</h2>
                <Grid renderCell={renderMyCell} onCell={phase === 'setup' ? placeShip : toggleShot} />

                {phase === 'setup' && (
                    <div className={styles.controls}>
                        <div className={styles.sizes}>
                            {SIZES.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className={`${styles.chip} ${size === s ? styles.chipActive : ''}`}
                                    disabled={remaining(s) <= 0}
                                    onClick={() => setSize(s)}
                                >
                                    {'▪'.repeat(s)} <b>×{Math.max(remaining(s), 0)}</b>
                                </button>
                            ))}
                        </div>
                        <button type="button" className={styles.secondary} onClick={() => setHorizontal((h) => !h)}>
                            Направление: {horizontal ? 'вправо →' : 'вниз ↓'}
                        </button>
                        <div className={styles.row}>
                            <button type="button" className={styles.secondary} onClick={randomize}>Случайно</button>
                            <button type="button" className={styles.secondary} onClick={clearShips}>Очистить</button>
                        </div>
                        {hint && <div className={styles.hint}>{hint}</div>}
                        <button
                            type="button"
                            className={styles.primary}
                            disabled={ships.length !== FLEET.length}
                            onClick={() => setPhase('play')}
                        >
                            {ships.length === FLEET.length ? 'Начать игру' : `Расставлено ${ships.length} из ${FLEET.length}`}
                        </button>
                    </div>
                )}

                {phase === 'play' && (
                    <div className={styles.controls}>
                        {say && (
                            <div className={`${styles.say} ${styles[say.tone]}`}>
                                {say.cell}: скажите «{say.text}»
                            </div>
                        )}
                        {lost && <div className={`${styles.say} ${styles.hit}`}>Все ваши корабли потоплены. Вы проиграли.</div>}
                        {won && <div className={`${styles.say} ${styles.win}`}>Все корабли соперника потоплены. Вы победили!</div>}
                    </div>
                )}
            </section>

            {phase === 'play' && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Поле соперника</h2>
                    <Grid renderCell={renderTheirCell} onCell={cycleTheirMark} />
                    <div className={styles.score}>Попаданий по сопернику: {theirHits} из {TOTAL_DECKS}</div>
                </section>
            )}

            {/* только пока игра идёт (после «Начать игру») */}
            {phase === 'play' && (
                <button type="button" className={styles.newGame} onClick={newGame}>Новая игра</button>
            )}
        </div>
    );
}

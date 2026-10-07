'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CANVAS_H, CANVAS_W, CELL, COLS, FLOOR_RADIUS, PAD_BOTTOM, PAD_TOP, PAD_X, DIRS, FOOTPRINT_FILES, ROWS, draw, loadAssets } from './drawing';
import styles from './CleanerSnake.module.scss';

const BEST_KEY = 'cleanerSnakeBest';

const KEY_TO_DIR = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    ц: 'up', ы: 'down', ф: 'left', в: 'right',
};

const isOpposite = (a, b) => DIRS[a].x + DIRS[b].x === 0 && DIRS[a].y + DIRS[b].y === 0;

function spawnDirt(snake, dirts) {
    const taken = new Set([...snake, ...dirts].map((c) => `${c.x},${c.y}`));
    const free = [];
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (!taken.has(`${x},${y}`)) free.push({ x, y });
        }
    }
    if (!free.length) return null;
    const cell = free[Math.floor(Math.random() * free.length)];
    return {
        ...cell,
        variant: Math.floor(Math.random() * FOOTPRINT_FILES.length),
        angle: Math.random() * Math.PI * 2,
    };
}

// на полу всегда должен быть хотя бы один след
function ensureDirt(board) {
    if (board.dirts.length) return;
    const fresh = spawnDirt(board.snake, board.sink ? [board.sink] : []);
    if (fresh) board.dirts.push(fresh);
}

function createBoard() {
    const snake = [
        { x: 4, y: 4 },
        { x: 3, y: 4 },
        { x: 2, y: 4 },
    ];
    return {
        snake,
        dir: 'right',
        facing: 1,
        queue: [],
        dirts: [spawnDirt(snake, [])],
        patient: null,
        bahily: null,
        popups: [],
        bubbles: [],
        sink: null,
        drain: null,
        shield: 0,
        tick: 0,
        prevSnake: null,
        moving: false,
        lastTick: 0,
        delay: 280,
    };
}

const PATIENTS = [ '👵', '👴', '🧔', '👩‍🦳', '👨‍🦲', '🤰', ];
const PATIENT_EVERY = 3; // пациент делает шаг раз в несколько тиков
const PATIENT_CHANCE = 0.02; // шанс появления на каждом тике
const MAX_DIRTS = 14;
const PATIENT_REWARD = 2; // очков за каждый след, который пациент не успел оставить
const SHIELD_TICKS = 36; // сколько шагов действует неуязвимость
const BAHILY_CHANCE = 0.012; // шанс появления бахил на каждом тике
const BAHILY_TTL = 45; // сколько шагов бахилы лежат на полу

// всплывающие над полем очки
function addPopup(board, x, y, text, big = false) {
    board.popups.push({ x, y, text, big, start: performance.now() });
}

const PATIENT_PHRASES = ['Где бахилы?', 'Опять натоптал'];

// облачко с репликой над пойманным пациентом
function addBubble(board, x, y) {
    const text = PATIENT_PHRASES[Math.floor(Math.random() * PATIENT_PHRASES.length)];
    board.bubbles.push({ x, y, text, start: performance.now() });
}

const SINK_CHANCE =0.01; // шанс появления раковины на каждом тике
const SINK_TTL = 55; // сколько шагов раковина ждёт
const SINK_MIN_BUCKETS = 3; // раковина появляется, когда есть что сливать
const DRAIN_MS = 2400; // длительность слива и баннера

function updateSink(board) {
    if (board.sink) {
        board.sink.ttl -= 1;
        if (board.sink.ttl <= 0) board.sink = null;
    } else if (board.snake.length > SINK_MIN_BUCKETS && Math.random() < SINK_CHANCE) {
        const cell = spawnDirt(board.snake, [...board.dirts, ...(board.bahily ? [board.bahily] : [])]);
        if (cell) board.sink = { x: cell.x, y: cell.y, ttl: SINK_TTL };
    }
}

function updateBahily(board) {
    if (board.shield > 0) board.shield -= 1;
    if (board.bahily) {
        board.bahily.ttl -= 1;
        if (board.bahily.ttl <= 0) board.bahily = null;
    } else if (!board.shield && Math.random() < BAHILY_CHANCE) {
        const cell = spawnDirt(board.snake, [...board.dirts, ...(board.sink ? [board.sink] : [])]);
        if (cell) board.bahily = { x: cell.x, y: cell.y, ttl: BAHILY_TTL };
    }
}
// подошвы (не размазни), у них носок смотрит вверх
const SOLE_VARIANTS = [0, 1, 2, 3, 4];

function spawnPatient() {
    const horizontal = Math.random() < 0.5;
    const forward = Math.random() < 0.5;
    const d = forward ? 1 : -1;
    const lane = Math.floor(Math.random() * (horizontal ? ROWS : COLS));
    return {
        x: horizontal ? (forward ? -1 : COLS) : lane,
        y: horizontal ? lane : (forward ? -1 : ROWS),
        dx: horizontal ? d : 0,
        dy: horizontal ? 0 : d,
        facing: horizontal ? d : 1,
        emoji: PATIENTS[Math.floor(Math.random() * PATIENTS.length)],
        steps: 0,
        since: PATIENT_EVERY - 1,
    };
}

// пациент идёт через комнату и оставляет следы
function updatePatient(board) {
    board.tick += 1;
    if (!board.patient) {
        if (Math.random() < PATIENT_CHANCE) board.patient = spawnPatient();
        return;
    }
    const p = board.patient;
    p.since += 1;
    if (p.since < PATIENT_EVERY) return;
    p.since = 0;

    const inside = p.x >= 0 && p.y >= 0 && p.x < COLS && p.y < ROWS;
    if (!inside && p.steps > 0) {
        board.patient = null; // дошёл до выхода
        return;
    }

    if (inside) {
        const busy =
            board.snake.some((c) => c.x === p.x && c.y === p.y) ||
            board.dirts.some((d) => d.x === p.x && d.y === p.y);
        if (!busy && board.dirts.length < MAX_DIRTS) {
            // носок следа смотрит по ходу пациента
            const base = p.dx > 0 ? Math.PI / 2 : p.dx < 0 ? -Math.PI / 2 : p.dy > 0 ? Math.PI : 0;
            board.dirts.push({
                x: p.x,
                y: p.y,
                variant: SOLE_VARIANTS[Math.floor(Math.random() * SOLE_VARIANTS.length)],
                angle: base + (Math.random() - 0.5) * 0.4,
            });
        }
    }

    p.px = p.x;
    p.py = p.y;
    p.x += p.dx;
    p.y += p.dy;
    p.steps += 1;
}

// уборщица поймала пациента: он исчезает
function catchPatient(board) {
    const p = board.patient;
    if (!p) return 0;
    const k = Math.min(1, p.since / PATIENT_EVERY);
    const px = p.px === undefined ? p.x : p.px + (p.x - p.px) * k;
    const py = p.py === undefined ? p.y : p.py + (p.y - p.py) * k;
    const head = board.snake[0];
    if (Math.hypot(head.x - px, head.y - py) >= 0.75) return 0;

    // сколько клеток он ещё прошёл бы по полю, оставляя следы
    const lane = p.dx ? COLS : ROWS;
    let left;
    if (p.dx > 0) left = COLS - p.x;
    else if (p.dx < 0) left = p.x + 1;
    else if (p.dy > 0) left = ROWS - p.y;
    else left = p.y + 1;
    const missed = Math.max(0, Math.min(lane, left));
    const reward = missed * PATIENT_REWARD;

    if (reward) addPopup(board, px, py, `+${reward}`, true);
    addBubble(board, px, py);
    board.patient = null;
    return reward;
}

// оверлей экранов закрывает только пол, а не прозрачные поля холста
const floorStyle = {
    left: `${(PAD_X / CANVAS_W) * 100}%`,
    right: `${(PAD_X / CANVAS_W) * 100}%`,
    top: `${(PAD_TOP / CANVAS_H) * 100}%`,
    bottom: `${(PAD_BOTTOM / CANVAS_H) * 100}%`,
    // радиус пола на холсте масштабируется вместе с ним, поэтому задаём в процентах
    borderRadius: `${(FLOOR_RADIUS / (COLS * CELL)) * 100}%`,
};

export default function CleanerSnake() {
    const canvasRef = useRef(null);
    const boardRef = useRef(createBoard());
    const touchRef = useRef(null);

    const [status, setStatus] = useState('idle'); // idle | run | pause | over | win
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [shield, setShield] = useState(0);

    const render = useCallback(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const board = boardRef.current;
        const t = board.moving || board.drain ? Math.min(1, (performance.now() - board.lastTick) / board.delay) : 1;
        draw(ctx, board, t);
    }, []);

    const endDrain = useCallback(() => {
        const board = boardRef.current;
        const bonus = board.drain ? board.drain.bonus : 0;
        board.snake = [board.snake[0]];
        board.prevSnake = null;
        board.drain = null;
        ensureDirt(board);
        setScore((v) => v + bonus);
        setStatus('run');
    }, []);

    // между шагами игры кадры рисуются плавно; слив в раковину — отдельная анимация
    useEffect(() => {
        const board = boardRef.current;
        board.moving = status === 'run';
        if (status !== 'run' && status !== 'drain') {
            render();
            return;
        }
        if (status === 'run') board.lastTick = performance.now();
        let raf;
        const loop = () => {
            render();
            if (board.drain && performance.now() - board.drain.start >= board.drain.duration) {
                endDrain();
                return;
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [status, render, endDrain]);

    useEffect(() => {
        try {
            setBest(Number(localStorage.getItem(BEST_KEY)) || 0);
        } catch {}
        render();
        loadAssets().then(render);
    }, [render]);

    const finish = useCallback((result, finalScore) => {
        setStatus(result);
        setBest((prev) => {
            if (finalScore <= prev) return prev;
            try {
                localStorage.setItem(BEST_KEY, String(finalScore));
            } catch {}
            return finalScore;
        });
    }, []);

    const start = useCallback(() => {
        boardRef.current = createBoard();
        setScore(0);
        setShield(0);
        setStatus('run');
        render();
    }, [render]);

    const turn = useCallback((name) => {
        const board = boardRef.current;
        const last = board.queue.length ? board.queue[board.queue.length - 1] : board.dir;
        if (name === last || isOpposite(name, last) || board.queue.length >= 2) return;
        board.queue.push(name);
    }, []);

    const togglePause = useCallback(() => {
        setStatus((s) => (s === 'run' ? 'pause' : s === 'pause' ? 'run' : s));
    }, []);

    // игровой цикл: чем больше убрано, тем быстрее
    useEffect(() => {
        if (status !== 'run') return;
        const delay = Math.max(150, 280 - score * 4);
        boardRef.current.delay = delay;

        const id = setInterval(() => {
            const board = boardRef.current;
            if (board.queue.length) board.dir = board.queue.shift();
            if (board.dir === 'left') board.facing = -1;
            else if (board.dir === 'right') board.facing = 1;
            const { snake, dir } = board;
            board.prevSnake = snake.map((c) => ({ x: c.x, y: c.y }));
            board.lastTick = performance.now();
            board.delay = delay;
            // борта не убивают: выходим с другой стороны
            const head = {
                x: (snake[0].x + DIRS[dir].x + COLS) % COLS,
                y: (snake[0].y + DIRS[dir].y + ROWS) % ROWS,
            };
            const dirtIndex = board.dirts.findIndex((d) => d.x === head.x && d.y === head.y);
            const eat = dirtIndex >= 0;

            const body = eat ? snake : snake.slice(0, -1);
            const hit = body.some((c) => c.x === head.x && c.y === head.y);

            if (hit && !board.shield) {
                finish('over', score);
                return;
            }

            // в бахилах не поскользнуться: ведро не убивает, но и не пускает — надо свернуть
            if (hit) {
                updatePatient(board);
                updateBahily(board);
                ensureDirt(board);
                setShield(board.shield);
                render();
                return;
            }

            snake.unshift(head);
            if (board.bahily && head.x === board.bahily.x && head.y === board.bahily.y) {
                board.bahily = null;
                board.shield = SHIELD_TICKS + 1;
            }
            if (eat) {
                board.dirts.splice(dirtIndex, 1);
                addPopup(board, head.x, head.y, '+1');
                const next = score + 1;
                setScore(next);
                if (!board.dirts.length) {
                    const fresh = spawnDirt(snake, board.dirts);
                    if (!fresh) {
                        render();
                        finish('win', next);
                        return;
                    }
                    board.dirts.push(fresh);
                }
            } else {
                snake.pop();
            }
            if (board.sink && head.x === board.sink.x && head.y === board.sink.y) {
                // супер бонус: все ведра сливаются в раковину, игра на паузе
                board.drain = {
                    start: performance.now(),
                    duration: DRAIN_MS,
                    sink: { x: board.sink.x, y: board.sink.y },
                    bonus: snake.length - 1,
                };
                board.sink = null;
                ensureDirt(board);
                board.moving = false;
                setStatus('drain');
                render();
                return;
            }

            updatePatient(board);
            const reward = catchPatient(board);
            if (reward) setScore((v) => v + reward);
            updateSink(board);
            updateBahily(board);
            ensureDirt(board);
            setShield(board.shield);
            render();
        }, delay);

        return () => clearInterval(id);
    }, [status, score, render, finish]);

    useEffect(() => {
        const onKeyDown = (e) => {
            const name = KEY_TO_DIR[e.key] || KEY_TO_DIR[e.key.toLowerCase?.()];
            if (name) {
                e.preventDefault();
                if (status === 'idle') start();
                turn(name);
            } else if (e.key === ' ') {
                e.preventDefault();
                if (status === 'drain') return;
                if (status === 'run' || status === 'pause') togglePause();
                else start();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [status, start, turn, togglePause]);

    const onTouchStart = (e) => {
        const t = e.touches[0];
        touchRef.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchEnd = (e) => {
        const from = touchRef.current;
        touchRef.current = null;
        if (!from) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - from.x;
        const dy = t.clientY - from.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        const name = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        if (status === 'idle') start();
        turn(name);
    };

    const pad = (name) => () => {
        if (status === 'idle') start();
        turn(name);
    };

    return (
        <div className={styles.game}>
            <div className={styles.stats}>
                <span className={styles.stat}>Убрано<b>{score}</b></span>
                <span className={styles.stat}>Рекорд<b>{best}</b></span>
                {shield > 0 && (
                    <span className={styles.shield}>
                        Бахилы
                        <i style={{ width: `${(shield / SHIELD_TICKS) * 100}%` }} />
                    </span>
                )}
                {(status === 'run' || status === 'pause') && (
                    <button type="button" className={styles.pause} onClick={togglePause}>
                        {status === 'run' ? 'Пауза' : 'Продолжить'}
                    </button>
                )}
            </div>

            <div
                className={styles.field}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <canvas ref={canvasRef} className={styles.canvas} width={CANVAS_W} height={CANVAS_H} />

                {status !== 'run' && status !== 'drain' && (
                    <div className={styles.overlay} style={floorStyle}>
                        {status === 'idle' && (
                            <>
                                <h3>Уборщица на смене</h3>
                                <p>Собирайте следы грязи. С каждым пятном за вами тянется ещё одно ведро — не врежьтесь в них.</p>
                            </>
                        )}
                        {status === 'pause' && <h3>Пауза</h3>}
                        {status === 'over' && (
                            <>
                                <h3>Поскользнулись!</h3>
                                <p>Убрано пятен: {score}</p>
                            </>
                        )}
                        {status === 'win' && (
                            <>
                                <h3>Всё блестит!</h3>
                                <p>Пол чистый целиком: {score} пятен.</p>
                            </>
                        )}
                        <button
                            type="button"
                            className={styles.primary}
                            onClick={status === 'pause' ? togglePause : start}
                        >
                            {status === 'idle' ? 'Начать смену' : status === 'pause' ? 'Продолжить' : 'Ещё раз'}
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.pad}>
                <button type="button" className={styles.up} aria-label="Вверх" onClick={pad('up')}>▲</button>
                <button type="button" className={styles.left} aria-label="Влево" onClick={pad('left')}>◀</button>
                <button type="button" className={styles.down} aria-label="Вниз" onClick={pad('down')}>▼</button>
                <button type="button" className={styles.right} aria-label="Вправо" onClick={pad('right')}>▶</button>
            </div>
        </div>
    );
}

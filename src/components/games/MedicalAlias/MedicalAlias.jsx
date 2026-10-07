'use client';

import { useEffect, useRef, useState } from 'react';
import { ALIAS_TERMS, PLAYERS, ROUND_SECONDS, WIN_SCORE } from '../../../constants/aliasTerms';
import styles from './MedicalAlias.module.scss';

const shuffle = (list) => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// Один телефон на двоих: объясняет тот, у кого в руках телефон, а второй угадывает
export default function MedicalAlias() {
    // menu — перед ходом, turn — идёт ход, result — итог хода, over — игра окончена
    const [screen, setScreen] = useState('menu');
    const [player, setPlayer] = useState(0);
    const [scores, setScores] = useState([0, 0]);
    const [seconds, setSeconds] = useState(ROUND_SECONDS);
    const [word, setWord] = useState('');
    const [log, setLog] = useState([]);
    const deck = useRef([]);
    const logRef = useRef([]);

    const nextWord = () => {
        if (!deck.current.length) deck.current = shuffle(ALIAS_TERMS);
        setWord(deck.current.pop());
    };

    const startTurn = () => {
        logRef.current = [];
        setLog([]);
        setSeconds(ROUND_SECONDS);
        nextWord();
        setScreen('turn');
    };

    useEffect(() => {
        if (screen !== 'turn') return;
        const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
        return () => clearInterval(timer);
    }, [screen]);

    const finishTurn = () => {
        setLog([...logRef.current]);
        setScreen('result');
    };

    useEffect(() => {
        if (screen === 'turn' && seconds <= 0) finishTurn();
    }, [screen, seconds]);

    const answer = (guessed) => {
        logRef.current.push({ word, guessed });
        nextWord();
    };

    const turnPoints = log.reduce((sum, e) => sum + (e.guessed ? 1 : -1), 0);

    const confirmResult = () => {
        const next = [...scores];
        next[player] += turnPoints;
        setScores(next);

        // Играют поровну ходов: победителя определяем после хода второго игрока
        if (player === PLAYERS.length - 1 && Math.max(...next) >= WIN_SCORE && next[0] !== next[1]) {
            setScreen('over');
            return;
        }
        setPlayer((p) => (p + 1) % PLAYERS.length);
        setScreen('menu');
    };

    const restart = () => {
        setScores([0, 0]);
        setPlayer(0);
        deck.current = [];
        setScreen('menu');
    };

    const scoreboard = (
        <div className={styles.scores}>
            {PLAYERS.map((name, i) => (
                <div key={name} className={`${styles.score} ${screen === 'menu' && i === player ? styles.scoreActive : ''}`}>
                    <span className={styles.scoreName}>{name}</span>
                    <span className={styles.scoreValue}>{scores[i]}</span>
                </div>
            ))}
        </div>
    );

    if (screen === 'turn') {
        return (
            <div className={styles.game}>
                <div className={styles.turnHead}>
                    <span>Объясняет: <b>{PLAYERS[player]}</b></span>
                    <span className={`${styles.timer} ${seconds <= 10 ? styles.timerLow : ''}`}>{Math.max(seconds, 0)}</span>
                </div>
                <div className={styles.word}>{word}</div>
                <div className={styles.buttons}>
                    <button type="button" className={styles.skip} onClick={() => answer(false)}>Пропустить −1</button>
                    <button type="button" className={styles.ok} onClick={() => answer(true)}>Угадали +1</button>
                </div>
            </div>
        );
    }

    if (screen === 'result') {
        return (
            <div className={styles.game}>
                <h2 className={styles.heading}>Время вышло</h2>
                <div className={styles.points}>{turnPoints > 0 ? `+${turnPoints}` : turnPoints}</div>
                {log.length === 0 ? (
                    <p className={styles.note}>Ни одного слова. Бывает.</p>
                ) : (
                    <ul className={styles.words}>
                        {log.map((e, i) => (
                            <li key={i} className={e.guessed ? styles.guessed : styles.skipped}>
                                <span>{e.guessed ? '✓' : '✕'}</span> {e.word}
                            </li>
                        ))}
                    </ul>
                )}
                <button type="button" className={styles.primary} onClick={confirmResult}>Дальше</button>
            </div>
        );
    }

    if (screen === 'over') {
        const winner = scores[0] > scores[1] ? 0 : 1;
        return (
            <div className={styles.game}>
                {scoreboard}
                <h2 className={styles.heading}>Победил: {PLAYERS[winner]}</h2>
                <p className={styles.note}>
                    Вы оба теперь можете смело говорить «ангиоэдема» и не знать, что это такое.
                </p>
                <button type="button" className={styles.primary} onClick={restart}>Сыграть ещё</button>
            </div>
        );
    }

    return (
        <div className={styles.game}>
            {scoreboard}
            <p className={styles.note}>
                Объясните слово так, чтобы второй игрок его назвал. Нельзя говорить само слово и однокоренные.
                Минута на ход, играем до {WIN_SCORE} очков.
            </p>
            <div className={styles.turnLabel}>Ход: <b>{PLAYERS[player]}</b></div>
            <button type="button" className={styles.primary} onClick={startTurn}>Начать ход</button>
        </div>
    );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { GREETING, REPLIES, THINK_MAX_MS, THINK_MIN_MS } from '../../constants/aibolit';
import AibolitFace from './AibolitFace';
import styles from './AiBolit.module.scss';

const randomBetween = (min, max) => min + Math.random() * (max - min);

export default function AiBolit() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([{ id: 0, from: 'bot', text: GREETING }]);
    const [text, setText] = useState('');
    const [thinking, setThinking] = useState(false);
    const lastReply = useRef(-1);
    const timer = useRef();
    const listRef = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open]);

    useEffect(() => {
        const list = listRef.current;
        if (list) list.scrollTop = list.scrollHeight;
    }, [messages, thinking, open]);

    // Случайная фраза, не повторяющая предыдущую
    const pickReply = () => {
        let i;
        do {
            i = Math.floor(Math.random() * REPLIES.length);
        } while (i === lastReply.current);
        lastReply.current = i;
        return REPLIES[i];
    };

    const send = (e) => {
        e.preventDefault();
        const value = text.trim();
        if (!value || thinking) return;

        setMessages((m) => [...m, { id: Date.now(), from: 'user', text: value }]);
        setText('');
        setThinking(true);
        timer.current = setTimeout(() => {
            setMessages((m) => [...m, { id: Date.now() + 1, from: 'bot', text: pickReply() }]);
            setThinking(false);
        }, randomBetween(THINK_MIN_MS, THINK_MAX_MS));
    };

    return (
        <>
            <button type="button" className={styles.fab} onClick={() => setOpen(true)}>
                <AibolitFace size={36} />
                AI-Болит
            </button>

            {open && (
                <div className={styles.overlay} onClick={() => setOpen(false)}>
                    <div className={styles.modal} role="dialog" aria-label="AI-Болит" onClick={(e) => e.stopPropagation()}>
                        <div className={styles.header}>
                            <AibolitFace size={44} />
                            <div className={styles.headerText}>
                                <div className={styles.name}>AI-Болит</div>
                                <div className={styles.status}>{thinking ? 'думает…' : 'онлайн'}</div>
                            </div>
                            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Закрыть">
                                ×
                            </button>
                        </div>

                        <div className={styles.list} ref={listRef}>
                            {messages.map((m) => (
                                <div key={m.id} className={`${styles.message} ${m.from === 'user' ? styles.user : styles.bot}`}>
                                    {m.text}
                                </div>
                            ))}
                            {thinking && (
                                <div className={`${styles.message} ${styles.bot} ${styles.dots}`} aria-label="Печатает">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            )}
                        </div>

                        <form className={styles.form} onSubmit={send}>
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Опишите, что болит"
                                autoComplete="off"
                                maxLength={300}
                            />
                            <button type="submit" disabled={!text.trim() || thinking}>
                                Отправить
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

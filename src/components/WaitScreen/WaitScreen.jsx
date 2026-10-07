'use client';

import { useState } from 'react';
import Header from '../Header/Header';
import Battleship from '../games/Battleship/Battleship';
import CleanerSnake from '../games/CleanerSnake/CleanerSnake';
import styles from './WaitScreen.module.scss';

const CATEGORIES = [
    { id: 'solo', title: 'Одиночные' },
    { id: 'neighbor', title: 'Играй с соседом' },
];

const GAMES = [
    {
        id: 'cleaner-snake',
        category: 'solo',
        icon: '🧹',
        title: 'Уборка',
        description: 'Змейка по-больничному: собирайте следы грязи.',
        Component: CleanerSnake,
    },
    {
        id: 'battleship',
        category: 'neighbor',
        icon: '🚢',
        title: 'Морской бой',
        description: 'Играйте вдвоём: телефоны заменяют бумагу.',
        Component: Battleship,
    },
];

export default function WaitScreen() {
    const [activeId, setActiveId] = useState(null);
    const active = GAMES.find((g) => g.id === activeId);

    return (
        <div className={styles.wait}>
            <Header />
            <main className={styles.content}>
                {active ? (
                    <>
                        <button type="button" className={styles.back} onClick={() => setActiveId(null)}>
                            ← Все игры
                        </button>
                        <h1 className={styles.title}>{active.title}</h1>
                        <active.Component />
                    </>
                ) : (
                    <>
                        <h1 className={styles.title}>Пока вы ждёте</h1>
                        <p className={styles.subtitle}>Выберите игру, чтобы скоротать время до приёма.</p>
                        {CATEGORIES.map((category) => (
                            <section key={category.id} className={styles.category}>
                                <h2 className={styles.categoryTitle}>{category.title}</h2>
                                <div className={styles.list}>
                                    {GAMES.filter((g) => g.category === category.id).map((game) => (
                                        <button
                                            key={game.id}
                                            type="button"
                                            className={styles.card}
                                            onClick={() => setActiveId(game.id)}
                                        >
                                            <span className={styles.icon}>{game.icon}</span>
                                            <span className={styles.text}>
                                                <span className={styles.cardTitle}>{game.title}</span>
                                                <span className={styles.cardDesc}>{game.description}</span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </>
                )}
            </main>
        </div>
    );
}

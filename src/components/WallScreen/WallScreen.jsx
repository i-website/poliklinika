'use client';

import { useEffect, useRef, useState } from 'react';
import { POSTER_GAP, POSTER_HEIGHT, POSTER_TOP, POSTERS, WALL_PADDING } from '../../constants/posters';
import { asset } from '../../lib/basePath';
import Header from '../Header/Header';
import styles from './WallScreen.module.scss';

const DRAG_THRESHOLD = 5;

function Poster({ poster, big = false }) {
    return (
        <div className={`${styles.poster} ${big ? styles.posterBig : ''}`} style={{ '--aspect': poster.aspect }}>
            <img
                className={styles.image}
                src={asset(`/posters/${poster.file}`)}
                alt={poster.title}
                draggable={false}
            />
        </div>
    );
}

export default function WallScreen() {
    const [open, setOpen] = useState(null);
    const viewport = useRef(null);
    const drag = useRef(null);
    // Размер окна просмотра: стена всегда не меньше экрана, а её высота равна высоте экрана
    const [size, setSize] = useState(null);

    useEffect(() => {
        const el = viewport.current;
        const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Плакаты висят в один ряд: все размеры — доли высоты стены, ширина ряда зависит от самих плакатов
    const layout = (() => {
        if (!size) return null;
        const H = size.h;
        let x = WALL_PADDING * H;
        const items = POSTERS.map((poster) => {
            const width = POSTER_HEIGHT * H * poster.aspect;
            const item = { poster, left: x, width, top: POSTER_TOP * H };
            x += width + POSTER_GAP * H;
            return item;
        });
        const contentWidth = x - POSTER_GAP * H + WALL_PADDING * H;
        // стена не уже экрана: если ряд короче, свободное место делится по краям
        const wallWidth = Math.max(contentWidth, size.w);
        const offsetX = (wallWidth - contentWidth) / 2;
        return { items, wallWidth, offsetX };
    })();

    const onMouseDown = (e) => {
        drag.current = { x: e.clientX, y: e.clientY, left: viewport.current.scrollLeft, top: viewport.current.scrollTop, moved: false };
    };

    useEffect(() => {
        const onMove = (e) => {
            const d = drag.current;
            if (!d) return;
            const dx = e.clientX - d.x;
            const dy = e.clientY - d.y;
            if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) d.moved = true;
            viewport.current.scrollLeft = d.left - dx;
            viewport.current.scrollTop = d.top - dy;
        };
        const onUp = () => {
            // moved остаётся true до ближайшего клика, чтобы перетаскивание не открыло плакат
            setTimeout(() => (drag.current = null), 0);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, []);

    // Вертикальной прокрутки нет, поэтому колесо мыши листает стену в стороны
    const onWheel = (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) viewport.current.scrollLeft += e.deltaY;
    };

    const openPoster = (poster) => {
        if (drag.current?.moved) return;
        setOpen(poster);
    };

    return (
        <div className={styles.screen}>
            <Header />
            <div className={styles.viewport} ref={viewport} onMouseDown={onMouseDown} onWheel={onWheel}>
                {layout && (
                    <div className={styles.wall} style={{ width: layout.wallWidth, height: size.h }}>
                        {layout.items.map(({ poster, left, top, width }) => (
                            <button
                                key={poster.id}
                                type="button"
                                className={styles.slot}
                                style={{ left: layout.offsetX + left, top, width }}
                                onClick={() => openPoster(poster)}
                            >
                                <Poster poster={poster} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {open && (
                <div className={styles.overlay} onClick={() => setOpen(null)}>
                    <div className={styles.zoom} role="dialog" onClick={(e) => e.stopPropagation()}>
                        <Poster poster={open} big />
                        <button type="button" className={styles.close} onClick={() => setOpen(null)}>Закрыть</button>
                    </div>
                </div>
            )}
        </div>
    );
}

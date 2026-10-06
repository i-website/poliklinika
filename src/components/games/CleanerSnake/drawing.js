export const COLS = 8;
export const ROWS = 8;
export const CELL = 60;
export const PAD_X = 26; // швабра торчит вперёд
export const PAD_TOP = 28; // голова уборщицы в верхнем ряду
export const PAD_BOTTOM = 8;
export const FLOOR_RADIUS = 16;
export const CANVAS_W = COLS * CELL + PAD_X * 2;
export const CANVAS_H = ROWS * CELL + PAD_TOP + PAD_BOTTOM;

export const DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
};

// заливка всего пола с теми же скруглёнными углами
function fillFloorRect(ctx) {
    ctx.beginPath();
    ctx.roundRect(0, 0, COLS * CELL, ROWS * CELL, FLOOR_RADIUS);
    ctx.fill();
}

function drawFloor(ctx) {
    const tile = CELL;
    const grout = 3;
    ctx.fillStyle = '#b8c4d4';
    fillFloorRect(ctx);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const px = x * tile + grout / 2;
            const py = y * tile + grout / 2;
            const w = tile - grout;
            ctx.fillStyle = (x + y) % 2 ? '#e3ecf6' : '#f7fafd';
            ctx.fillRect(px, py, w, w);
            // блик и тень по краям плитки
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(px, py, w, 1.5);
            ctx.fillRect(px, py, 1.5, w);
            ctx.fillStyle = 'rgba(90, 110, 140, 0.18)';
            ctx.fillRect(px, py + w - 1.5, w, 1.5);
            ctx.fillRect(px + w - 1.5, py, 1.5, w);
        }
    }
}

export const FOOTPRINT_FILES = [
    'sole-1', 'sole-2', 'sole-3', 'sole-4', 'sole-5',
    'smear-1', 'smear-2', 'shoe-1', 'shoe-2', 'shoe-3',
];

const footprints = [];
let cleanerImg = null;

function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

export function loadAssets() {
    return Promise.all([
        loadImage('/cleaner.png'),
        ...FOOTPRINT_FILES.map((name) => loadImage(`/footprints/${name}.png`)),
    ]).then(([cleaner, ...prints]) => {
        cleanerImg = cleaner;
        footprints.length = 0;
        footprints.push(...prints);
    });
}

function drawDirt(ctx, dirt) {
    const img = footprints[dirt.variant % FOOTPRINT_FILES.length];
    if (!img) return;
    const size = CELL * 0.92;
    const scale = size / Math.max(img.width, img.height);
    ctx.save();
    ctx.translate(dirt.x * CELL + CELL / 2, dirt.y * CELL + CELL / 2);
    ctx.rotate(dirt.angle);
    ctx.drawImage(img, (-img.width * scale) / 2, (-img.height * scale) / 2, img.width * scale, img.height * scale);
    ctx.restore();
}

function drawPatient(ctx, p) {
    if (p.x < -1 || p.y < -1 || p.x > COLS || p.y > ROWS) return;
    ctx.save();
    ctx.translate(p.x * CELL + CELL / 2, p.y * CELL + CELL / 2);

    // тень
    ctx.fillStyle = 'rgba(40, 60, 90, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 22, 15, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // переваливается при ходьбе
    ctx.rotate(Math.sin(p.steps * Math.PI + p.sway) * 0.08);
    ctx.font = `${Math.round(CELL * 0.75)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000'; // полупрозрачный fillStyle делает цветные эмодзи прозрачными
    ctx.fillText(p.emoji, 0, 0);
    ctx.restore();
}

function drawBahily(ctx, b) {
    if (b.ttl < 14 && b.ttl % 2) return; // мигают перед исчезновением
    ctx.save();
    ctx.translate(b.x * CELL + CELL / 2, b.y * CELL + CELL / 2);
    ctx.scale(CELL / 60, CELL / 60);

    ctx.fillStyle = 'rgba(125, 211, 252, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    for (const [x, rot] of [[-9, -0.12], [9, 0.12]]) {
        ctx.save();
        ctx.translate(x, 2);
        ctx.rotate(rot);
        ctx.fillStyle = '#bae6fd';
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8.5, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // резинка и блик
        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.ellipse(0, -9, 6.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.ellipse(-3, 3, 1.8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // искорка
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(2, -19);
    ctx.lineTo(7, -17);
    ctx.lineTo(2, -15);
    ctx.lineTo(0, -10);
    ctx.lineTo(-2, -15);
    ctx.lineTo(-7, -17);
    ctx.lineTo(-2, -19);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawShield(ctx, cell) {
    ctx.save();
    ctx.translate(cell.x * CELL + CELL / 2, cell.y * CELL + CELL / 2 - 12);
    ctx.fillStyle = 'rgba(125, 211, 252, 0.28)';
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, CELL * 0.62, CELL * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function drawBucket(ctx, cell, scale = 1, rot = 0, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cell.x * CELL + CELL / 2, cell.y * CELL + CELL / 2);
    ctx.rotate(rot);
    ctx.scale((CELL / 60) * scale, (CELL / 60) * scale);

    // тень на полу
    ctx.fillStyle = 'rgba(40, 60, 90, 0.22)';
    ctx.beginPath();
    ctx.ellipse(2, 20, 17, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // дужка
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -8, 17, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();

    // корпус
    ctx.fillStyle = '#4fb8ac';
    ctx.beginPath();
    ctx.moveTo(-18, -10);
    ctx.lineTo(18, -10);
    ctx.lineTo(13, 19);
    ctx.quadraticCurveTo(0, 23, -13, 19);
    ctx.closePath();
    ctx.fill();

    // блик и рёбра жёсткости
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.lineTo(-9, -6);
    ctx.lineTo(-7, 16);
    ctx.lineTo(-10, 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(10, 70, 65, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.lineTo(16, 2);
    ctx.moveTo(-14.5, 11);
    ctx.lineTo(14.5, 11);
    ctx.stroke();

    // горловина с водой
    ctx.fillStyle = '#2c7a73';
    ctx.beginPath();
    ctx.ellipse(0, -10, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a5e3dc';
    ctx.beginPath();
    ctx.ellipse(0, -9.5, 15, 3.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7cd0c6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -10, 18, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

function drawCleaner(ctx, cell, facing) {
    if (cleanerImg) {
        const h = CELL * 1.4;
        const w = (cleanerImg.width / cleanerImg.height) * h;
        ctx.save();
        ctx.translate(cell.x * CELL + CELL / 2, cell.y * CELL + CELL / 2);
        ctx.scale(facing, 1);
        ctx.drawImage(cleanerImg, -w / 2, CELL / 2 - h + 4, w, h);
        ctx.restore();
        return;
    }
    ctx.save();
    ctx.translate(cell.x * CELL + CELL / 2, cell.y * CELL + CELL / 2);
    ctx.scale((CELL / 60) * facing, CELL / 60);

    const SKIN = '#f6cfa8';
    ctx.lineCap = 'round';

    // тень
    ctx.fillStyle = 'rgba(40, 60, 90, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 28, 15, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // дальняя рука
    ctx.strokeStyle = SKIN;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-9, -6);
    ctx.lineTo(-12, 7);
    ctx.stroke();

    // ноги и обувь
    ctx.fillStyle = '#334155';
    ctx.fillRect(-7, 12, 5.5, 14);
    ctx.fillRect(1.5, 12, 5.5, 14);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(-3, 27, 5.5, 2.6, 0, 0, Math.PI * 2);
    ctx.ellipse(6, 27, 5.5, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // халат
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-8, -9);
    ctx.lineTo(8, -9);
    ctx.lineTo(12, 15);
    ctx.lineTo(-12, 15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(-0.8, -8, 1.6, 22);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-5, -9);
    ctx.lineTo(0, -4);
    ctx.lineTo(5, -9);
    ctx.closePath();
    ctx.fill();

    // шея и голова
    ctx.fillStyle = SKIN;
    ctx.fillRect(-2, -12, 4, 4);
    ctx.beginPath();
    ctx.arc(0, -18, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // косынка
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, -19, 8, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(-8, -20, 16, 2);

    // глаз и щека
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(3, -17, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(244, 114, 94, 0.5)';
    ctx.beginPath();
    ctx.arc(4, -14.5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // швабра: черенок, держатель и ворс на полу
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(19, -14);
    ctx.lineTo(19, 24);
    ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.fillRect(13, 23, 12, 3);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
        const x = 14 + i * 2;
        ctx.beginPath();
        ctx.moveTo(x, 26);
        ctx.lineTo(x + (i - 2.5) * 0.8, 31);
        ctx.stroke();
    }

    // ближняя рука держит швабру
    ctx.strokeStyle = SKIN;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(9, -6);
    ctx.lineTo(18, 1);
    ctx.stroke();

    ctx.restore();
}

// положение между прошлым и текущим шагом; при переходе через борт не скользим
function lerpCell(cur, prev, t) {
    if (!prev || Math.abs(cur.x - prev.x) > 1 || Math.abs(cur.y - prev.y) > 1) return cur;
    return { x: prev.x + (cur.x - prev.x) * t, y: prev.y + (cur.y - prev.y) * t };
}

function drawSink(ctx, cell, scale = 1) {
    ctx.save();
    ctx.translate(cell.x * CELL + CELL / 2, cell.y * CELL + CELL / 2 + 2);
    ctx.scale((CELL / 60) * scale, (CELL / 60) * scale);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // тень
    ctx.fillStyle = 'rgba(40, 60, 90, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 25, 20, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // чаша
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-23, 0);
    ctx.quadraticCurveTo(-21, 24, 0, 25);
    ctx.quadraticCurveTo(21, 24, 23, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // борт и вода
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(0, 0, 23, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.ellipse(0, 1, 16, 4.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // кран
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(0, -22);
    ctx.quadraticCurveTo(0, -27, 6, -27);
    ctx.lineTo(9, -27);
    ctx.lineTo(9, -22);
    ctx.stroke();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-1, -6);
    ctx.lineTo(-1, -21);
    ctx.stroke();
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-4, -32, 8, 4);
    ctx.fillRect(-1.5, -29, 3, 4);

    // капля
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(9, -17 + ((performance.now() / 80) % 12), 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const DRAIN_STAGGER = 0.5; // доля времени, за которую уходят все ведра
const DRAIN_FLIGHT = 0.35; // доля времени на полёт одного ведра

function drawSplash(ctx, sink, age) {
    const cx = sink.x * CELL + CELL / 2;
    const cy = sink.y * CELL + CELL / 2 - 4;
    ctx.save();
    ctx.fillStyle = `rgba(56, 189, 248, ${1 - age})`;
    for (let n = 0; n < 7; n++) {
        const angle = -Math.PI / 2 + (n - 3) * 0.42;
        const r = age * CELL * 0.6;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r + age * age * CELL * 0.35, CELL * 0.07 * (1 - age) + 1, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.strokeStyle = `rgba(125, 211, 252, ${1 - age})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, CELL * (0.3 + age * 0.4), CELL * (0.1 + age * 0.12), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

function drawStar(ctx, x, y, r) {
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
        const rad = k % 2 ? r * 0.4 : r;
        const a = (k * Math.PI) / 4 - Math.PI / 2;
        ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
}

// все ведра сливаются в раковину + баннер «супер бонус»
function drawDrain(ctx, board, dp, pos) {
    const { drain, snake } = board;
    const { sink } = drain;
    const cx = sink.x * CELL + CELL / 2;
    const cy = sink.y * CELL + CELL / 2;

    // затемнение и свечение вокруг раковины
    const appear = clamp01(dp / 0.12); // плавное появление без скачков
    ctx.fillStyle = `rgba(15, 23, 42, ${0.35 * appear})`;
    fillFloorRect(ctx);
    const pulse = Math.sin(performance.now() / 110) * appear;
    ctx.fillStyle = `rgba(125, 211, 252, ${0.35 * appear})`;
    ctx.beginPath();
    ctx.arc(cx, cy, CELL * (0.6 + 0.4 * appear + 0.12 * pulse), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(224, 242, 254, ${0.5 * appear})`;
    ctx.beginPath();
    ctx.arc(cx, cy, CELL * (0.65 + 0.08 * pulse), 0, Math.PI * 2);
    ctx.fill();

    drawSink(ctx, sink, 1 + 0.15 * appear + 0.06 * pulse);

    // ведра по очереди улетают в раковину
    const n = snake.length - 1;
    for (let j = 0; j < n; j++) {
        const cell = pos[j + 1];
        const startAt = (j / Math.max(1, n)) * DRAIN_STAGGER;
        const u = clamp01((dp - startAt) / DRAIN_FLIGHT);
        if (u <= 0) {
            drawBucket(ctx, cell);
        } else if (u < 1) {
            const e = u * u * (3 - 2 * u);
            drawBucket(
                ctx,
                {
                    x: cell.x + (sink.x - cell.x) * e,
                    y: cell.y + (sink.y - cell.y) * e - Math.sin(Math.PI * e) * 1.3,
                },
                1 - 0.7 * e,
                e * 4,
                1 - 0.4 * e
            );
        } else {
            const age = (dp - startAt - DRAIN_FLIGHT) / 0.2;
            if (age < 1) drawSplash(ctx, sink, age);
        }
    }

    // конфетти-звёзды
    ctx.save();
    const colors = ['#fde047', '#38bdf8', '#fb7185', '#a3e635'];
    for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2 + k;
        const life = clamp01(dp * 1.4 - (k % 4) * 0.05);
        const r = life * CELL * (2 + (k % 3) * 0.8);
        ctx.fillStyle = colors[k % colors.length];
        ctx.globalAlpha = 1 - life;
        drawStar(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r - life * CELL * 0.5, CELL * 0.12 * (1 - life * 0.4));
    }
    ctx.restore();

    // вспышка в начале
    if (dp < 0.15) {
        ctx.fillStyle = `rgba(255, 255, 255, ${((0.15 - dp) / 0.15) * 0.55})`;
        fillFloorRect(ctx);
    }

    // баннер
    const pop = clamp01((dp - 0.05) / 0.2);
    const back = 1 + 2.70158 * Math.pow(pop - 1, 3) + 1.70158 * Math.pow(pop - 1, 2);
    const fade = dp > 0.85 ? 1 - (dp - 0.85) / 0.15 : 1;
    if (pop > 0) {
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate((COLS * CELL) / 2, ROWS * CELL * 0.38);
        ctx.rotate(-0.06);
        ctx.scale(back, back);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        ctx.font = `900 ${Math.round(CELL * 0.85)}px sans-serif`;
        ctx.lineWidth = CELL * 0.2;
        ctx.strokeStyle = '#1e3a8a';
        ctx.strokeText('СУПЕР БОНУС!', 0, 0);
        ctx.fillStyle = '#fde047';
        ctx.fillText('СУПЕР БОНУС!', 0, 0);
        ctx.font = `800 ${Math.round(CELL * 0.5)}px sans-serif`;
        ctx.lineWidth = CELL * 0.12;
        ctx.strokeText(`ведра слиты: +${drain.bonus}`, 0, CELL * 0.8);
        ctx.fillStyle = '#fff';
        ctx.fillText(`ведра слиты: +${drain.bonus}`, 0, CELL * 0.8);
        ctx.restore();
    }
}

const POPUP_MS = 1000;

function drawPopups(ctx, board) {
    const now = performance.now();
    board.popups = board.popups.filter((p) => now - p.start < POPUP_MS);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const p of board.popups) {
        const age = (now - p.start) / POPUP_MS;
        const pop = age < 0.15 ? 0.6 + (age / 0.15) * 0.6 : 1.2 - Math.min(0.2, (age - 0.15) * 0.4);
        const size = Math.round(CELL * (p.big ? 0.62 : 0.45) * pop);
        ctx.globalAlpha = age > 0.6 ? 1 - (age - 0.6) / 0.4 : 1;
        ctx.font = `900 ${size}px sans-serif`;
        const x = p.x * CELL + CELL / 2;
        const y = p.y * CELL + CELL * 0.1 - age * CELL * 0.9;
        ctx.lineWidth = size * 0.28;
        ctx.strokeStyle = '#1e3a8a';
        ctx.strokeText(p.text, x, y);
        ctx.fillStyle = p.big ? '#fde047' : '#ffffff';
        ctx.fillText(p.text, x, y);
    }
    ctx.restore();
}

export function draw(ctx, board, t = 1) {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.save();
    ctx.translate(PAD_X, PAD_TOP);

    // пол со скруглёнными углами; сущности рисуются поверх и не обрезаются
    ctx.save();
    ctx.shadowColor = 'rgba(29, 78, 216, 0.18)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#b8c4d4';
    ctx.beginPath();
    ctx.roundRect(0, 0, COLS * CELL, ROWS * CELL, FLOOR_RADIUS);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, COLS * CELL, ROWS * CELL, FLOOR_RADIUS);
    ctx.clip();
    drawFloor(ctx);
    ctx.restore();
    board.dirts.forEach((dirt) => drawDirt(ctx, dirt));

    const { snake, facing, prevSnake, patient } = board;
    const draining = board.drain;
    const pos = snake.map((c, i) => lerpCell(c, prevSnake && prevSnake[Math.min(i, prevSnake.length - 1)], t));

    if (!draining) for (let i = snake.length - 1; i > 0; i--) drawBucket(ctx, pos[i]);
    if (board.sink && !(board.sink.ttl < 14 && board.sink.ttl % 2)) drawSink(ctx, board.sink);
    if (board.bahily) drawBahily(ctx, board.bahily);
    if (patient) {
        const k = Math.min(1, (patient.since + t) / 3);
        const at = patient.px === undefined ? patient : lerpCell(patient, { x: patient.px, y: patient.py }, k);
        // пациент появляется и пропадает на краю игрового поля, а не на краю холста
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, COLS * CELL, ROWS * CELL);
        ctx.clip();
        drawPatient(ctx, { ...patient, x: at.x, y: at.y, sway: k * Math.PI });
        ctx.restore();
    }
    if (board.shield > 0 && (board.shield > 10 || board.shield % 2)) drawShield(ctx, pos[0]);
    // лёгкое покачивание при ходьбе
    const bob = board.moving ? Math.abs(Math.sin((board.tick + t) * Math.PI)) * 3 : 0;
    drawCleaner(ctx, { x: pos[0].x, y: pos[0].y - bob / CELL }, facing);
    drawPopups(ctx, board);
    if (draining) drawDrain(ctx, board, clamp01((performance.now() - draining.start) / draining.duration), pos);
    ctx.restore();
}

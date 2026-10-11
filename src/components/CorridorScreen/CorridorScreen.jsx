'use client';

import styles from './CorridorScreen.module.scss';

const SEAT_Y = 1200;

const SKIN = '#dbeafe';
const SITTERS = [
  { x: 520, coat: '#1e3a8a', hair: '#0b1e4a', idle: styles.idleA },
  { x: 665, coat: '#ffffff', hair: '#0b1e4a', idle: styles.idleB, ringing: true },
  { x: 810, coat: '#2563eb', hair: '#1e3a8a', idle: styles.idleC },
];

function Sitter({ x, coat, hair, idle, ringing }) {
  return (
    <g transform={`translate(${x},${SEAT_Y})`} className={idle}>
      {/* голени и обувь */}
      <rect x="-30" y="0" width="22" height="130" rx="9" fill="#172554" />
      <rect x="8" y="0" width="22" height="130" rx="9" fill="#172554" />
      <rect x="-36" y="120" width="34" height="12" rx="6" fill="#0f172a" />
      <rect x="2" y="120" width="34" height="12" rx="6" fill="#0f172a" />
      {/* бёдра */}
      <rect x="-34" y="-26" width="68" height="34" rx="14" fill="#172554" />
      {/* туловище и руки */}
      <g className={styles.breath}>
        <rect x="-38" y="-170" width="76" height="158" rx="26" fill={coat} />
        <g className={ringing ? `${styles.limb} ${styles.sitterWave}` : undefined}>
          <rect x="-50" y="-160" width="16" height="110" rx="8" fill={coat} opacity="0.85" />
        </g>
        <rect x="34" y="-160" width="16" height="110" rx="8" fill={coat} opacity="0.85" />
        <rect x="-10" y="-188" width="20" height="22" fill={SKIN} />
        <circle cx="0" cy="-215" r="30" fill={SKIN} />
        <path d="M-31,-218 A31,31 0 0 1 31,-218 Q0,-236 -31,-218 Z" fill={hair} />
        <circle cx="-10" cy="-212" r="2.6" fill="#1e3a8a" />
        <circle cx="10" cy="-212" r="2.6" fill="#1e3a8a" />
        {ringing && <path className={styles.smile} d="M-9,-200 Q0,-190 9,-200" />}
      </g>
      {ringing && (
        <g transform="translate(20,-52)">
          <g className={styles.ringPhone}>
            <g className={styles.ringing}>
              <rect x="-9" y="-14" width="18" height="34" rx="4" fill="#0b1e4a" />
              <rect x="-6.5" y="-12" width="13" height="6" rx="2" fill="#bfdbfe" className={styles.screenGlow} />
            </g>
            <rect x="-14" y="-6" width="28" height="30" rx="5" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
          </g>
          <g className={styles.ringing}>
            <path className={styles.waveA} d="M-16,-22 Q0,-32 16,-22" />
            <path className={styles.waveB} d="M-26,-30 Q0,-48 26,-30" />
            <path className={styles.waveC} d="M-36,-38 Q0,-64 36,-38" />
          </g>
        </g>
      )}
    </g>
  );
}

export default function CorridorScreen() {
  return (
    <main className={styles.screen}>
      <div className={styles.frame}>
        <svg className={styles.scene} viewBox="0 0 900 1600">
          <g transform="translate(0,-387)">
          {/* стена, панель, пол */}
          <rect y="-600" width="900" height="3000" fill="#f8fbff" />
          <rect y="820" width="900" height="380" fill="#8fb4ea" />
          <rect y="814" width="900" height="12" fill="#f8fbff" />
          <rect y="1200" width="900" height="900" fill="#c9dbf5" />
          <rect y="1180" width="900" height="26" fill="#5b8fe0" />
          {[...Array(7)].map((_, i) => (
            <rect key={i} x={i * 160 - 20} y="1206" width="4" height="700" fill="#c3d6ef" />
          ))}

          {/* лампы */}
          {[170, 700].map((x) => (
            <g key={x}>
              <rect x={x - 100} y="470" width="200" height="22" rx="10" fill="#ffffff" className={styles.lamp} />
              <rect x={x - 100} y="492" width="200" height="6" fill="#bfd6f5" />
            </g>
          ))}

          {/* дверь кабинета */}
          <rect x="50" y="780" width="220" height="420" fill="#3b82f6" />
          <rect x="70" y="800" width="180" height="170" rx="4" fill="#2f6fdc" />
          <rect x="70" y="990" width="180" height="190" rx="4" fill="#2f6fdc" />
          <circle cx="232" cy="1000" r="9" fill="#f8fbff" />
          <rect x="95" y="695" width="130" height="60" rx="8" fill="#1e3a8a" />
          <text x="160" y="737" textAnchor="middle" fontSize="40" fontWeight="700" fill="#fff">
            204
          </text>

          {/* плакат над скамейкой */}
          <rect x="520" y="560" width="300" height="400" rx="6" fill="#e3eefc" stroke="#93b6e6" strokeWidth="6" />
          <rect x="548" y="590" width="244" height="150" fill="#bfdbfe" />
          <rect x="658" y="610" width="22" height="110" fill="#fff" />
          <rect x="614" y="654" width="110" height="22" fill="#fff" />
          <rect x="548" y="770" width="244" height="22" rx="6" fill="#2563eb" />
          <rect x="548" y="810" width="190" height="14" rx="6" fill="#93b6e6" />
          <rect x="548" y="840" width="220" height="14" rx="6" fill="#93b6e6" />
          <rect x="548" y="870" width="150" height="14" rx="6" fill="#93b6e6" />

          {/* скамейка у стены */}
          <rect x="440" y="1196" width="440" height="22" rx="8" fill="#3b82f6" />
          <rect x="440" y="1210" width="440" height="40" fill="#2563eb" />
          <rect x="464" y="1250" width="24" height="80" fill="#1e3a8a" />
          <rect x="832" y="1250" width="24" height="80" fill="#1e3a8a" />

          {SITTERS.map((s) => (
            <Sitter key={s.x} {...s} />
          ))}

          {/* тот, кто заходит слева: вид сбоку, смотрит вправо */}
          <g className={styles.walker}>
            <g className={styles.bob}>
              <g className={`${styles.limb} ${styles.legBack}`}>
                <rect x="-11" y="-190" width="22" height="190" rx="10" fill="#172554" />
                <rect x="-11" y="-12" width="36" height="12" rx="6" fill="#0f172a" />
              </g>
              <g className={`${styles.limb} ${styles.armBack}`}>
                <rect x="-9" y="-330" width="18" height="125" rx="9" fill="#bfdbfe" />
              </g>
              <rect x="-27" y="-345" width="54" height="170" rx="22" fill="#ffffff" />
              <g className={`${styles.limb} ${styles.legFront}`}>
                <rect x="-11" y="-190" width="22" height="190" rx="10" fill="#1e3a8a" />
                <rect x="-11" y="-12" width="36" height="12" rx="6" fill="#0f172a" />
              </g>
              <g className={`${styles.limb} ${styles.armFront}`}>
                <rect x="-9" y="-335" width="18" height="66" rx="9" fill="#dbeafe" />
                <g className={styles.forearm}>
                  <rect x="-8" y="-275" width="16" height="66" rx="8" fill="#dbeafe" />
                  <g className={styles.phone}>
                    <rect x="-5" y="-222" width="10" height="44" rx="3" fill="#0b1e4a" />
                    <rect x="2" y="-219" width="2.5" height="38" rx="1.2" fill="#93c5fd" className={styles.screenGlow} />
                  </g>
                  <circle cx="0" cy="-209" r="9" fill={SKIN} />
                </g>
              </g>
              <rect x="-8" y="-372" width="16" height="30" fill={SKIN} />
              <g className={styles.head}>
                <circle cx="0" cy="-402" r="32" fill={SKIN} />
                <path d="M-33,-402 A33,33 0 0 1 33,-402 L8,-408 Q-10,-420 -33,-402 Z" fill="#172554" />
                <circle cx="17" cy="-398" r="3" fill="#172554" />
                <path className={styles.smile} d="M12,-389 Q20,-381 28,-391" />
              </g>
            </g>
          </g>
          </g>
        </svg>

      </div>
    </main>
  );
}

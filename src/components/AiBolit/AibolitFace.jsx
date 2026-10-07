// Нарисованное лицо доброго доктора: белая шапочка с крестом, очки, седая борода
export default function AibolitFace({ size = 44 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="50" fill="#dbeafe" />
            {/* борода */}
            <path d="M22 52 C22 82 36 92 50 92 C64 92 78 82 78 52 Z" fill="#e5e7eb" />
            {/* лицо */}
            <ellipse cx="50" cy="48" rx="25" ry="27" fill="#fcd9b6" />
            {/* уши */}
            <circle cx="25" cy="50" r="5" fill="#f5c79c" />
            <circle cx="75" cy="50" r="5" fill="#f5c79c" />
            {/* усы и борода поверх лица */}
            <path d="M30 60 C38 56 46 60 50 62 C54 60 62 56 70 60 C68 72 60 78 50 78 C40 78 32 72 30 60 Z" fill="#e5e7eb" />
            {/* улыбка */}
            <path d="M42 68 Q50 74 58 68" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* нос */}
            <ellipse cx="50" cy="55" rx="4.5" ry="3.5" fill="#f0b98a" />
            {/* очки */}
            <circle cx="39" cy="45" r="8" fill="#fff" fillOpacity="0.6" stroke="#374151" strokeWidth="2" />
            <circle cx="61" cy="45" r="8" fill="#fff" fillOpacity="0.6" stroke="#374151" strokeWidth="2" />
            <path d="M47 45 H53" stroke="#374151" strokeWidth="2" />
            <circle cx="39" cy="46" r="2.2" fill="#1f2937" />
            <circle cx="61" cy="46" r="2.2" fill="#1f2937" />
            {/* брови */}
            <path d="M31 35 Q39 31 46 35 M54 35 Q61 31 69 35" stroke="#9ca3af" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* шапочка */}
            <path d="M24 32 C24 12 76 12 76 32 Z" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5" />
            <rect x="22" y="29" width="56" height="7" rx="3" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5" />
            {/* крест */}
            <rect x="47" y="14" width="6" height="14" rx="1" fill="#dc2626" />
            <rect x="43" y="18" width="14" height="6" rx="1" fill="#dc2626" />
        </svg>
    );
}

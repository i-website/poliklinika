// Плакаты на стене поликлиники висят в один ряд, картинки лежат в public/posters.
// Все размеры раскладки — доли высоты стены (она равна высоте экрана), поэтому ряд подстраивается под экран.
export const POSTER_HEIGHT = 0.5; // высота каждого плаката
export const POSTER_TOP = 0.2; // отступ ряда сверху
export const POSTER_GAP = 0.07; // промежуток между плакатами
export const WALL_PADDING = 0.08; // поле стены слева и справа от ряда

// aspect — отношение ширины к высоте (у плакатов с белыми полями в файле оно меньше натурального —
// лишнее обрезается). Висят ровно, на одной линии.
export const POSTERS = [
    { id: 'healthy-life', title: 'Здоровый образ жизни', file: 'healthy-life.png', aspect: 0.706 },
    { id: 'pediculosis', title: 'Педикулёз', file: 'pediculosis.png', aspect: 1.437 },
    { id: 'vaccination', title: 'Вакцинация', file: 'vaccination.png', aspect: 0.75 },
    { id: 'heart-day', title: 'Всемирный день сердца', file: 'heart-day.png', aspect: 0.702 },
    { id: 'doctor-portrait', title: 'Портрет врача', file: 'doctor-portrait.png', aspect: 1 },
    { id: 'checkup-organization', title: 'Организация диспансеризации', file: 'checkup-organization.png', aspect: 0.722 },
    { id: 'posture', title: 'Правильная осанка', file: 'posture.png', aspect: 1.4 },
    { id: 'checkup-dacha', title: 'Диспансеризация: чтобы сил хватило', file: 'checkup-dacha.png', aspect: 0.8 },
    { id: 'everyone-must', title: 'Это должен сделать каждый', file: 'everyone-must.png', aspect: 0.704 },
    { id: 'patient-memo', title: 'Памятка пациентам', file: 'patient-memo.png', aspect: 0.706 },
    { id: 'teeth', title: 'Чистим зубы', file: 'teeth.png', aspect: 1.333 },
    { id: 'safety', title: 'Антитеррористическая безопасность', file: 'safety.png', aspect: 1.4 },
    { id: 'two-clicks', title: 'Два клика, чтобы быть услышанными', file: 'two-clicks.png', aspect: 0.707 },
];

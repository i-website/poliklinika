import Link from 'next/link';
import { DOCTORS } from '../../constants/doctors';
import { CLOSE_HOUR, OPEN_HOUR } from '../../lib/workingHours';
import Header from '../Header/Header';
import styles from './HomeScreen.module.scss';
import NextAppointment from './NextAppointment';

const ACTIONS = [
    { icon: '📅', title: 'Записаться на приём', text: 'Выберите врача и дату', href: '/appointment' },
    { icon: '📋', title: 'Мои записи', text: 'Дата, врач и жалоба', href: '/my-appointments' },
    { icon: '🎮', title: 'Пока вы ждёте', text: 'Игры в очереди', href: '/wait' },
];

export default function HomeScreen() {
    return (
        <div className={styles.home}>
            <Header />
            <div className={styles.scroll}>
                <div className={styles.content}>
                    <section className={styles.hero}>
                        <h1 className={styles.heroTitle}>Здравствуйте!</h1>
                        <p className={styles.heroText}>
                            Запишитесь к врачу онлайн и не стойте в очереди в регистратуре
                        </p>
                        <div className={styles.hours}>
                            Приём по будням, {OPEN_HOUR}:00–{CLOSE_HOUR}:00
                        </div>
                    </section>

                    <div className={styles.actions}>
                        {ACTIONS.map((a) => (
                            <Link key={a.href} href={a.href} className={styles.action}>
                                <span className={styles.actionIcon}>{a.icon}</span>
                                <span className={styles.actionTitle}>{a.title}</span>
                                <span className={styles.actionText}>{a.text}</span>
                            </Link>
                        ))}
                    </div>

                    <NextAppointment />

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Наши врачи</h2>
                        <div className={styles.doctors}>
                            {DOCTORS.map((d) => (
                                <div key={d.id} className={styles.doctor}>
                                    <img src={d.photo} alt="" className={styles.photo} loading="lazy" />
                                    <span className={styles.docName}>{d.lastName}</span>
                                    <span className={styles.docSpec}>{d.specialty}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

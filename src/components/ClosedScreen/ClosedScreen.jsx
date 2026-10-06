import { OPEN_HOUR, CLOSE_HOUR } from '../../lib/workingHours';
import styles from './ClosedScreen.module.scss';

const pad = (h) => String(h).padStart(2, '0');

export default function ClosedScreen() {
    return (
        <div className={styles.closed}>
            <div className={styles.icon}>🏥</div>
            <h1 className={styles.title}>Поликлиника закрыта</h1>
            <p className={styles.text}>Мы работаем</p>
            <div className={styles.hours}>
                с <span>{pad(OPEN_HOUR)}:00</span> до <span>{pad(CLOSE_HOUR)}:00</span>
            </div>
            <p className={styles.hint}>Возвращайтесь в рабочее время</p>
        </div>
    );
}

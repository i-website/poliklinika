import styles from './DataPopup.module.scss';

export default function DataPopup() {
    return (
        <div className={styles.popup}>
            <div className={styles.spinner} />
            Собираем данные. Подождите
        </div>
    );
}

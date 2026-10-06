import Header from '../Header/Header';
import styles from './HomeScreen.module.scss';

export default function HomeScreen() {
    return (
        <div className={styles.home}>
            <Header />
        </div>
    );
}

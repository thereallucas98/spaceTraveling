import { FiCalendar, FiUser } from 'react-icons/fi';
import styles from './styles.module.scss';

export default function HomePost() {
  return (
    <div className={styles.container}>
      <header className={styles.headerTitle}>
        <p>Como utilizar Hooks</p>
      </header>

      <main className={styles.contentResume}>
        <p>
          Tudo sobre como criar a sua primeira aplicação utilizando Create React
          App
        </p>
      </main>

      <footer className={styles.footerInfo}>
        <time>
          <FiCalendar />
          15 Mar 2021
        </time>
        <span>
          <FiUser />
          Joseph Oliveira
        </span>
      </footer>
    </div>
  );
}

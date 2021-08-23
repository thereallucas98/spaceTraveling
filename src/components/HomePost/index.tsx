import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import styles from './styles.module.scss';

interface IHomePostProps {
  slug: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

export default function HomePost({
  slug,
  first_publication_date,
  data,
}: IHomePostProps) {
  return (
    <div className={styles.container}>
      <Link href={`post/${slug}`}>
        <header className={styles.headerTitle}>
          <p>{data.title}</p>
        </header>
      </Link>

      <main className={styles.contentResume}>
        <p>{data.subtitle}</p>
      </main>

      <footer className={styles.footerInfo}>
        <time>
          <FiCalendar />
          {first_publication_date}
        </time>
        <span>
          <FiUser />
          {data.author}
        </span>
      </footer>
    </div>
  );
}

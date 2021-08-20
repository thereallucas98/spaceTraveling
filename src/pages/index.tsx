import { GetStaticProps } from 'next';
import HomePost from '../components/HomePost';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.containerHeader}>
        <header className={styles.homeHeader}>
          <img src="/images/logo.svg" alt="logo" />
        </header>
      </div>

      <main className={styles.content}>
        <HomePost />
        <HomePost />
        <HomePost />
      </main>
    </div>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };

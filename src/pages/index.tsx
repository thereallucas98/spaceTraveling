import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getPrismicClient } from '../services/prismic';

import HomePost from '../components/HomePost';
import Header from '../components/Header';

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
  // preview: boolean;
}

export default function Home({ postsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(
    postsPagination.results.map(post => {
      return {
        ...post,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
      };
    })
  );

  function handleLoadMorePosts(): void {
    fetch(nextPage).then(response => {
      response.json().then(responsePrismic => {
        setNextPage(responsePrismic.next_page);

        const morePosts = responsePrismic.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setPosts([...posts, ...morePosts]);
      });
    });
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <div className={commonStyles.container}>
        <div className={commonStyles.containerHeader}>
          <Header />
        </div>

        <main>
          {posts.map(post => (
            <HomePost
              key={post.uid}
              slug={post.uid}
              data={post.data}
              first_publication_date={post.first_publication_date}
            />
          ))}
        </main>

        {nextPage !== null && (
          <footer className={styles.footerHasButton}>
            <button type="button" onClick={handleLoadMorePosts}>
              Carregar mais posts
            </button>
          </footer>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[document.last_publication_date desc]',
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
      // preview,
    },
    revalidate: 60 * 60 * 24, // 24 horas
  };
};

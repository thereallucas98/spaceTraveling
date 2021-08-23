/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const readTime = post.data.content.reduce((sumTotal, content) => {
    const textTime = RichText.asText(content.body).split(' ').length;
    return Math.ceil(sumTotal + textTime / 200);
  }, 0);

  if (router.isFallback) {
    return (
      <div className={styles.loadingContainer}>
        <h1>Carregando...</h1>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={commonStyles.containerHeader}>
        <Header />

        <main>
          <img
            className={styles.banner}
            src={post.data.banner.url}
            alt={post.data.title}
          />

          <div className={styles.post}>
            <section className={styles.postHeader}>
              <h1>{post.data.title}</h1>

              <div>
                <time>
                  <FiCalendar />
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <span>
                  <FiUser />
                  {post.data.author}
                </span>
                <span>
                  <FiClock />
                  {readTime} min
                </span>
              </div>
            </section>

            {post.data.content.map(content => {
              return (
                <article key={content.heading} className={styles.postContent}>
                  <h2>{content.heading}</h2>
                  <div
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
    }
  );

  const slugs = postsResponse.results.map(slug => slug.uid);

  return {
    paths: slugs.map(slug => {
      return {
        params: { slug },
      };
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24, // 24 horas
  };
};

/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

// import { Comments } from '../../components/Comments';
import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  navigation: {
    previousPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
    nextPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
  };
  preview: boolean;
}

export default function Post({ post, navigation, preview }: PostProps) {
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

  const isPostEdited =
    post.first_publication_date !== post.last_publication_date;

  let formatedUpdatedDate;
  if (isPostEdited) {
    formatedUpdatedDate = format(
      new Date(post.last_publication_date),
      "'* editado em' dd MMM yyyy', às' HH':'mm",
      {
        locale: ptBR,
      }
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

            <span>{isPostEdited && formatedUpdatedDate}</span>

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

            <section
              className={`${styles.navigationContainer} ${commonStyles.container}`}
            >
              {navigation?.previousPost.length > 0 && (
                <div>
                  <h3>{navigation.previousPost[0].data.title}</h3>
                  <Link href={`/post/${navigation.previousPost[0].uid}`}>
                    <a>Post anterior</a>
                  </Link>
                </div>
              )}

              {navigation?.nextPost.length > 0 && (
                <div>
                  <h3>{navigation.nextPost[0].data.title}</h3>
                  <Link href={`/post/${navigation.nextPost[0].uid}`}>
                    <a>Próximo post</a>
                  </Link>
                </div>
              )}
            </section>

            {/* <Comments /> */}

            {preview && (
              <aside className={styles.previewContainer}>
                <Link href="/api/exit-preview">
                  <a className={commonStyles.preview}>Sair do modo Preview</a>
                </Link>
              </aside>
            )}
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const { slug } = params;

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref || null,
  });

  const previousPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date desc]',
    }
  );

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
      navigation: {
        previousPost: previousPost?.results,
        nextPost: nextPost?.results,
      },
      preview,
    },
    revalidate: 60 * 60 * 24, // 24 horas
  };
};

import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import axios from 'axios';
import AnchorLink from '@/components/AnchorLink';
import Seo from '@/components/Seo';
import { images } from '@/images';
import { Article } from '@/types';
import styled from '@emotion/styled';
import styles from '@/styles/article.module.sass';

interface Metadata {
  ogTitle: string;
  ogUrl: string;
  ogImage: string;
  ogDescription: string;
  ogCreator: string;
  datestampTimeContent: any;
  datestampTimeAttribute: any;
}

type MetaDataMap = { [key: string]: Metadata };

const BackButton = styled.i({
  display: 'block',
  'body &, body[data-theme="dark"] &': {
    background: `url(${images.arrow.backLight}) no-repeat 50% 50%/contain`,
  },
  'body[data-theme="light"] &': {
    background: `url(${images.arrow.backDark}) no-repeat 50% 50%/contain`,
  },
});

export default function ArticleDetail({ article, metaData }: { article: Article | null; metaData: any }) {
  return (
    <main className={styles.article}>
      <div className={styles['top-link']}>
        <AnchorLink href="/articles">
          <BackButton />
          <span>뒤로가기</span>
        </AnchorLink>
      </div>
      <article>
        <Seo
          pageTitle={`${article?.subject}`}
          pageDescription={`${article?.description}`}
          pageImg={`https://drive.google.com/uc?id=${article?.thumbnail}`}
          pageOgType="article"
        />
        <header>
          <h1>{article?.subject}</h1>
        </header>
        {article ? (
          <>
            <div className={styles.description}>
              <p>{`${article?.description}`}</p>
              <Image
                src={`https://drive.google.com/uc?id=${article?.thumbnail}`}
                width={640}
                height={480}
                unoptimized
                priority
                alt=""
              />
            </div>
            {metaData ? (
              <AnchorLink href={`https://n.news.naver.com/article/${article?.oid}/${article?.aid}`}>
                <img
                  src={metaData[`https://n.news.naver.com/article/${article?.oid}/${article?.aid}`]?.ogImage}
                  alt=""
                />
                <div className={styles['og-info']}>
                  <div className={styles.created}>
                    <cite>
                      {metaData[`https://n.news.naver.com/article/${article?.oid}/${article?.aid}`]?.ogCreator}
                    </cite>
                    <time
                      dateTime={
                        metaData[`https://n.news.naver.com/article/${article?.oid}/${article?.aid}`]
                          ?.datestampTimeAttribute
                      }
                    >
                      {
                        metaData[`https://n.news.naver.com/article/${article?.oid}/${article?.aid}`]
                          ?.datestampTimeContent
                      }
                    </time>
                  </div>
                  <div className={styles.summary}>
                    <strong>
                      {metaData[`https://n.news.naver.com/article/${article?.oid}/${article?.aid}`]?.ogTitle}
                    </strong>
                    <div className={styles.description}>
                      {metaData[`https://n.news.naver.com/article/${article?.oid}/${article?.aid}`]?.ogDescription}
                    </div>
                  </div>
                </div>
              </AnchorLink>
            ) : (
              <p className={styles.loading}>기사 불러오는 중...</p>
            )}
          </>
        ) : (
          <p className={styles.loading}>본문 불러오는 중</p>
        )}
      </article>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const articleId = context.params?.articleId;
  let articleData = null;
  let metaData: MetaDataMap = {};

  if (articleId) {
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/articles?id=${articleId}`);
      articleData = data;

      const metadataUrl = `https://n.news.naver.com/article/${data.oid}/${data.aid}`;
      const metadataResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/naverScraping?url=${metadataUrl}`,
      );
      metaData[metadataUrl] = metadataResponse.data;
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }

  return {
    props: {
      article: articleData,
      metaData,
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};
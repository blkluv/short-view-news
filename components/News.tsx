import { useRouter } from 'next/router';
import YouTubeController from './YouTubeController';
import styles from '@/styles/news.module.sass';
import styled from '@emotion/styled';
import { rem } from '@/styles/designSystem';
import { images } from '@/images';
import { useEffect } from 'react';

type ShortData = {
  idx: string;
  video_id: string;
  subject: string;
  summary: string;
  blockquote: string;
  created: string;
};

interface NewsProps {
  newsItem: ShortData | undefined;
}

const CrossButton = styled.i({
  display: 'block',
  'body &, body[data-theme="dark"] &': {
    background: `url(${images.arrow.crossLight}) no-repeat 50% 50%/contain`,
  },
  'body[data-theme="light"] &': {
    background: `url(${images.arrow.crossDark}) no-repeat 50% 50%/contain`,
  },
});

const NewsDetail: React.FC<NewsProps> = ({ newsItem }) => {
  const router = useRouter();
  const handleCloseModal = () => {
    router.push('/');
  };

  if (!newsItem) return <p>뉴스 불러오는 중...</p>;

  return (
    <div className={styles.news}>
      <article>
        <header>
          <button className="close-btn" onClick={handleCloseModal}>
            <CrossButton />
            <span>닫기</span>
          </button>
          <h1>{newsItem.subject}</h1>
          <time>{newsItem.created}</time>
        </header>
        <YouTubeController
          videoId={newsItem.video_id}
          thumbnailUrl={`https://i.ytimg.com/vi/${newsItem.video_id}/maxresdefault.jpg`}
        />
        <div className={styles.description}>
          <p dangerouslySetInnerHTML={{ __html: newsItem.summary }} />
          <p>{newsItem.blockquote}</p>
        </div>
      </article>
    </div>
  );
};

export default NewsDetail;

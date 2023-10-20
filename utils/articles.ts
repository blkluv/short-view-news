import axios from 'axios';

interface RowData {
  idx: string;
  title: string;
  description: string;
  oid: string;
  aid: string;
  thumbnail: string;
}

export async function getArticleData(start?: number, count?: number) {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/naver`, {
    params: {
      start,
      count,
    },
  });
  const filesData = response.data;

  const rowsData: RowData[] = filesData.map((data: any) => ({
    idx: data.attributes.created,
    title: data.attributes.title,
    description: data.attributes.description,
    oid: data.attributes.oid,
    aid: data.attributes.aid,
    thumbnail: data.attributes.thumbnail,
  }));

  const sortedRowsData = rowsData.sort((a: RowData, b: RowData) => b.idx.localeCompare(a.idx));

  console.log('sortedRowsData: ', sortedRowsData);

  const fullData = await Promise.all(
    sortedRowsData.map(async (article) => {
      const url = `https://n.news.naver.com/article/${article.oid}/${article.aid}`;
      const metaData = await fetchArticleMetadata(url);
      return {
        ...article,
        metaData,
      };
    }),
  );

  console.log('fullData: ', fullData);

  return fullData;
}

async function fetchArticleMetadata(url: string) {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/naverScraping?url=${url}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch article metadata', error);
    return {};
  }
}

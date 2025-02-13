import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import getGithubToken from '@/utils/github';

export default async (req: VercelRequest, res: VercelResponse) => {
  let token = await getGithubToken();

  if (token) {
    const decodedToken: any = jwt.decode(token);
    if (decodedToken && decodedToken.exp * 1000 < Date.now()) {
      token = await getGithubToken();
    }
  }

  try {
    const commitResponse = await axios.get(
      `https://api.github.com/repos/naninyang/short-view-news-db/git/ref/heads/main`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const latestCommitSha = commitResponse.data.object.sha;

    const treeResponse = await axios.get(
      `https://api.github.com/repos/naninyang/short-view-news-db/git/trees/${latestCommitSha}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const youtubeCount = treeResponse.data.tree.filter(
      (file: any) => file.path.startsWith(`src/pages/youtube-${process.env.NODE_ENV}`) && file.path.endsWith('.md'),
    ).length;

    const naverCount = treeResponse.data.tree.filter(
      (file: any) => file.path.startsWith(`src/pages/naver-${process.env.NODE_ENV}`) && file.path.endsWith('.md'),
    ).length;

    const twitterCount = treeResponse.data.tree.filter(
      (file: any) => file.path.startsWith(`src/pages/twitter-${process.env.NODE_ENV}`) && file.path.endsWith('.md'),
    ).length;

    res.status(200).send({ youtube: youtubeCount, naver: naverCount, twitter: twitterCount });
  } catch (error) {
    res.status(500).send('Failed to fetch data from GitHub');
  }
};

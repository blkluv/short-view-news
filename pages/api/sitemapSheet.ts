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

    const mdFiles = treeResponse.data.tree
      .filter(
        (file: any) => file.path.startsWith(`src/pages/youtube-${process.env.NODE_ENV}`) && file.path.endsWith('.md'),
      )
      .map((file: any) => {
        const filename = file.path.split('/').pop().replace('.md', '');
        return {
          idx: filename,
          created: filename.split('-').slice(0, 3).join('-'),
        };
      });

    res.status(200).send(mdFiles);
  } catch (error) {
    res.status(500).send('Failed to fetch filenames from GitHub');
  }
};

import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import {Octokit} from 'octokit';
import {generateCard} from '@helpers/seo/create-card-bounty'
import IpfsStorage from '@services/ipfs-service';

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {ids: [repoId, ghId]} = req.query;
  const issueId = [repoId, ghId].join(`/`);

  const include = [
    { association: 'developers' },
    { association: 'pullrequests' },
    { association: 'merges' },
    { association: 'repository' },
  ]

  const issue = await models.issue.findOne({
    where: {issueId},
    include
  })

  if (!issue)
    return res.status(404).json(null);

  const octokit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN});
  const [owner, repo] = issue.repository.githubPath.split(`/`);
  const {data} = await octokit.rest.issues.get({ owner, repo, issue_number: issue.githubId })

  if (!data)
    return res.status(404).json(null);

  const card = await generateCard({
    state: issue.state,
    issueId: ghId,
    title: data.title,
    repo,
    ammount: issue.amount,
    working: issue.working.length,
    pr: issue.working.length,
    proposal: issue.merges.length,
  })

  const storage = new IpfsStorage()
  var img = Buffer.from(card.buffer, 'base64');

  const {path} = await storage.add({data: img})
  const url = `${process.env.NEXT_PUBLIC_IPFS_BASE}/${path}`

  await issue.update({
    seoImage: url,
  })

  return res.status(200).json(issue);
}

export default async function GetIssues(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res);
      break;

    default:
      res.status(405).json(`Method not allowed`);
  }

  res.end();
}

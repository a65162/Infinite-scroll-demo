import { Octokit } from 'octokit'

export default defineEventHandler((event) => {
  const { githubPersonalToken } = useRuntimeConfig(event)
  const octokit = new Octokit({
    auth: githubPersonalToken,
  })
  const username = getRouterParam(event, 'username') ?? 'vuejs'
  const { page, per_page } = getQuery(event)

  return octokit.request('GET /users/{username}/repos', {
    username,
    page: Number(page) || 1,
    per_page: Number(per_page) || 30,
    sort: 'updated',
  })
})

import { Octokit } from 'octokit'
import type { RepoSort, RepoDirection } from '@/types/githubRepository'

function isRepoSort(value: unknown): value is RepoSort {
  return ['created', 'updated', 'pushed', 'full_name'].includes(value as string)
}

function isRepoDirection(value: unknown): value is RepoDirection {
  return ['asc', 'desc'].includes(value as string)
}

export default defineEventHandler((event) => {
  const { githubPersonalToken } = useRuntimeConfig(event)
  const octokit = new Octokit({
    auth: githubPersonalToken,
  })
  const username = getRouterParam(event, 'username') ?? 'vuejs'
  const { page, per_page, ...query } = getQuery(event)
  const sort: RepoSort = isRepoSort(query.sort) ? query.sort : 'updated'
  const direction: RepoDirection = isRepoDirection(query.direction)
    ? query.direction
    : 'desc'

  return octokit.request('GET /users/{username}/repos', {
    username,
    page: Number(page) || 1,
    per_page: Number(per_page) || 30,
    sort,
    direction,
  })
})

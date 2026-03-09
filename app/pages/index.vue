<template>
  <BContainer style="max-width: 650px;">
    <h1 class="my-4">
      The owner of Repositories is vuejs.
    </h1>
    <BRow>
      <BCol
        v-for="repo in gitHubRepositories"
        :key="repo.id"
        cols="12"
        class="mb-4"
      >
        <BLink
          :href="repo.html_url"
          target="_blank"
          rel="noopener"
          underline-opacity="0"
        >
          <BCard
            :title="repo.name"
            tag="article"
          >
            <BCardText>
              {{ repo.description }}
            </BCardText>
            <BCardText>
              Last Updated: {{ $dayjs(repo.updated_at).format('YYYY/MM/DD') }}
            </BCardText>
          </BCard>
        </BLink>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script lang="ts" setup>
import type { GitHubRepository } from '@/types/githubRepository'

const gitHubRepositories = ref<GitHubRepository[]>([])
const page = ref(1)
const getRepositories = async ({ username, page, per_page }: { username: string, page: number, per_page?: number }) => {
  try {
    const { data } = await fetch(`/api/users/${username}/repos?page=${page}&per_page=${per_page}`).then(response => response.json())

    return data
  }
  catch {
    // TODO: Collect errors
    return []
  }
}

onMounted(async () => {
  gitHubRepositories.value = await getRepositories({ username: 'vuejs', page: page.value })
})
</script>

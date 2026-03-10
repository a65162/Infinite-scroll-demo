<template>
  <BContainer class="page-container">
    <div class="page-header">
      <h1 class="page-header__title">
        Vue.js Repositories
      </h1>
      <p class="page-header__subtitle">
        Explore public repositories from the vuejs organization
      </p>
    </div>
    <div
      v-bind="containerProps"
      class="repo-container"
    >
      <div v-bind="wrapperProps">
        <div
          v-for="{ data: repo } in list"
          :key="repo.id"
          class="repo-row"
        >
          <BLink
            :href="repo.html_url"
            target="_blank"
            underline-opacity="0"
            class="repo-link"
          >
            <BCard
              :title="repo.name"
              class="repo-card"
            >
              <BCardText class="repo-description">
                {{ repo.description || 'No description provided.' }}
              </BCardText>

              <BCardText class="repo-meta">
                Updated {{ $dayjs(repo.updated_at).format('YYYY/MM/DD') }}
              </BCardText>
            </BCard>
          </BLink>
        </div>
      </div>
    </div>
    <div
      v-if="isInitialzing || isLoadingMore"
      class="loading-area"
    >
      <BSpinner />
    </div>
  </BContainer>
</template>

<script lang="ts" setup>
import type { GitHubRepository } from '@/types/githubRepository'

// Fetch data function
const gitHubRepositories = ref<GitHubRepository[] | null>(null)
const isInitialzing = computed(() => !gitHubRepositories.value)
const initialPerPage = 30
const infinitePerPage = 10
const apiParams = {
  page: 1,
  perPage: initialPerPage,
}
const getRepositories: ({ username, page, perPage }: {
  username: string
  page: number
  perPage?: number
}) => Promise<GitHubRepository[]> = async ({ username, page, perPage }) => {
  try {
    const { data } = await fetch(`/api/users/${username}/repos?page=${page}&per_page=${perPage}`).then(response => response.json())

    return data
  }
  catch {
    // TODO: Send error messages to Sentry or other log servers
    return []
  }
}

// Virtual list function
const isFetchingCompletely = ref(false)
const containerHeight = computed(() => gitHubRepositories.value ? 'calc(100vh - 160px)' : 'auto')
const cardHeight = 134
const finalList = computed(() => isInitialzing.value ? [] : gitHubRepositories.value as GitHubRepository[])
const { list, containerProps, wrapperProps } = useVirtualList(
  finalList,
  {
    itemHeight: cardHeight,
  },
)

// Infinite load more function
const { isLoading: isLoadingMore } = useInfiniteScroll(containerProps.ref, async (state) => {
  if (!state.arrivedState.bottom) return

  const isExecutingLoadMoreFirst = apiParams.perPage === initialPerPage
  const duplicatedCount = isExecutingLoadMoreFirst ? initialPerPage % infinitePerPage : 0

  if (isExecutingLoadMoreFirst) apiParams.page += Math.floor(initialPerPage / infinitePerPage)
  else apiParams.page++
  if (apiParams.perPage !== infinitePerPage) apiParams.perPage = infinitePerPage

  const { page, perPage } = apiParams
  const newData = await getRepositories({ username: 'vuejs', page, perPage })

  if (duplicatedCount) newData.splice(0, duplicatedCount)

  isFetchingCompletely.value = !newData.length
  gitHubRepositories.value = gitHubRepositories.value?.concat(newData) ?? []
}, {
  canLoadMore: () => !!gitHubRepositories.value && !isFetchingCompletely.value,
})

// Initialization
onMounted(async () => {
  const { page, perPage } = apiParams
  gitHubRepositories.value = await getRepositories({ username: 'vuejs', page, perPage })
})
</script>

<style scoped lang="scss">
.page-container {
  position: relative;
  max-width: 900px;
  padding: 24px 0;
}

.page-header {
  margin-bottom: 16px;

  &__title {
    margin-bottom: 4px;
    font-weight: 600;
  }

  &__subtitle {
    font-size: 14px;
    color: #6c757d;
  }
}

.repo-container {
  height: v-bind('containerHeight');
  overflow: auto;
}

.repo-row {
  display: flex;
  align-items: flex-start;
  height: v-bind('cardHeight');
  padding: 6px 0;
}

.repo-link {
  width: 100%;
}

.repo-card {
  width: 100%;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  transition: all 0.15s ease;

  &:hover {
    box-shadow: 0 6px 16px rgb(0 0 0 / 8%);
    transform: translateY(-2px);
  }
}

.repo-title {
  font-size: 16px;
  font-weight: 600;
}

.repo-description {
  margin-top: 4px;
  font-size: 14px;
  color: #495057;
}

.repo-meta {
  margin-top: 6px;
  font-size: 12px;
  color: #868e96;
}

.loading-area {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 0);
}
</style>

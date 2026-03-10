<template>
  <BContainer class="page-container">
    <div class="page-header">
      <BRow>
        <BCol cols="6">
          <h1 class="page-header__title">
            Vue.js Repositories
          </h1>
          <p class="page-header__subtitle">
            Explore public repositories from the vuejs organization
          </p>
        </BCol>
        <BCol cols="6">
          <BRow
            align-v="center"
            class="mb-3"
          >
            <BCol cols="auto">
              Sort:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </BCol>
            <BCol col>
              <BFormSelect
                v-model="apiParams.sort"
                :disabled="isInitialzing"
                :options="sortOptions"
              />
            </BCol>
          </BRow>
          <BRow align-v="center">
            <BCol cols="auto">
              Direction:
            </BCol>
            <BCol col>
              <BFormSelect
                v-model="apiParams.direction"
                :disabled="isInitialzing"
                :options="directionOptions"
              />
            </BCol>
          </BRow>
        </BCol>
      </BRow>
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
import type { GitHubRepository, RepoSort, RepoDirection } from '@/types/githubRepository'

// Fetch data function
const gitHubRepositories = ref<GitHubRepository[] | null>(null)
const isInitialzing = computed(() => !gitHubRepositories.value)
const initialPerPage = 30
const infinitePerPage = 10
const apiParams = ref({
  page: 1,
  perPage: initialPerPage,
  sort: 'updated' as RepoSort,
  direction: 'desc' as RepoDirection,
})
const sortOptions = [
  { value: 'created', text: 'Created' },
  { value: 'updated', text: 'Updated' },
  { value: 'pushed', text: 'Pushed' },
  { value: 'full_name', text: 'Full Name' },
]
const directionOptions = [
  { value: 'asc', text: 'Asc' },
  { value: 'desc', text: 'Desc' },
]
const getRepositories: ({ username, page, perPage }: {
  username: string
  page: number
  perPage?: number
  sort?: RepoSort
  direction?: RepoDirection
}) => Promise<GitHubRepository[]> = async ({ username, page, perPage, sort, direction }) => {
  try {
    const { data } = await fetch(`/api/users/${username}/repos?page=${page}&per_page=${perPage}&sort=${sort}&direction=${direction}`).then(response => response.json())

    return data
  }
  catch {
    // TODO: Send error messages to Sentry or other log servers
    return []
  }
}
watch([() => apiParams.value.direction, () => apiParams.value.sort], async ([newDirection, newSort]) => {
  gitHubRepositories.value = null
  apiParams.value = {
    page: 1,
    perPage: initialPerPage,
    direction: newDirection,
    sort: newSort,
  }
  isFetchingCompletely.value = false
  const { page, perPage, direction, sort } = apiParams.value
  gitHubRepositories.value = await getRepositories({ username: 'vuejs', page, perPage, direction, sort })
})

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

  const isExecutingLoadMoreFirst = apiParams.value.perPage === initialPerPage
  const duplicatedCount = isExecutingLoadMoreFirst ? initialPerPage % infinitePerPage : 0

  if (isExecutingLoadMoreFirst) apiParams.value.page += Math.floor(initialPerPage / infinitePerPage)
  else apiParams.value.page++
  if (apiParams.value.perPage !== infinitePerPage) apiParams.value.perPage = infinitePerPage

  const { page, perPage, sort, direction } = apiParams.value
  const newData = await getRepositories({ username: 'vuejs', page, perPage, sort, direction })

  if (duplicatedCount) newData.splice(0, duplicatedCount)

  isFetchingCompletely.value = !newData.length
  gitHubRepositories.value = gitHubRepositories.value?.concat(newData) ?? []
}, {
  canLoadMore: () => !!gitHubRepositories.value && !isFetchingCompletely.value,
})

// Initialization
onMounted(async () => {
  const { page, perPage, sort, direction } = apiParams.value
  gitHubRepositories.value = await getRepositories({ username: 'vuejs', page, perPage, sort, direction })
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

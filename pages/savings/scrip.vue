<template>
  <div>
    <PageTitle title="Scrip Program" />

    <AppTypography
      >Here at PriceCo Foods we believe in supporting our local community. We
      offer a scrip program to many schools and churches in the surrounding
      neighborhoods, which encourages students, parents, teachers and their
      friends to do their shopping with us. In exchange, we donate a percentage
      of their sales back to the school or church! So, help out your community
      by shopping with PriceCo Foods.
    </AppTypography>

    <AppTypography
      >Next time you shop with us, give your checker your church or school's
      scrip code. It's that easy!
    </AppTypography>

    <InputText
      v-model="search"
      class="mb-4"
      label="Search"
      name="search"
      placeholder="Search for your school or church..."
      type="search"
    />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <section>
        <h2 class="text-lg text-brand-blue font-semibold mb-2">Schools</h2>
        <span
          v-if="!filterBySearch(schools).length && search"
          class="text-slate-500 opacity-60 text-sm"
          >None matching search</span
        >
        <ul v-else class="flex flex-col gap-2">
          <li
            v-for="(school, index) in filterBySearch(schools)"
            :key="index"
            class="flex gap-4"
          >
            <span class="flex-1">{{ school.name }}</span>
            <span>{{ school.code }}</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg text-brand-blue font-semibold mb-2">Churches</h2>
        <span
          v-if="!filterBySearch(churches).length && search"
          class="text-slate-500 opacity-60 text-sm"
          >None matching search</span
        >
        <ul v-else class="flex flex-col gap-2">
          <li
            v-for="(church, index) in filterBySearch(churches)"
            :key="index"
            class="flex gap-4"
          >
            <span class="flex-1">{{ church.name }}</span>
            <span>{{ church.code }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import scripData from '~/assets/data/scrip.json'

scripData.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0))
const schools = scripData.filter(({ type }) => type === 'school')
const churches = scripData.filter(({ type }) => type === 'church')

const search = ref('')

const filterBySearch = (items) => {
  if (!search.value) return items
  return items.filter((item) =>
    item.name.toLowerCase().includes(search.value.toLowerCase())
  )
}
</script>

<template>
    <div class="container">
        <PageTitle title="Scrip Program" />

        <AppTypography
            >Here at PriceCo Foods we believe in supporting our local
            community. We offer a scrip program to many schools and
            churches in the surrounding neighborhoods, which
            encourages students, parents, teachers and their friends
            to do their shopping with us. In exchange, we donate a
            percentage of their sales back to the school or church!
            So, help out your community by shopping with PriceCo
            Foods.
        </AppTypography>

        <AppTypography
            >Next time you shop with us, give your checker your church
            or school's scrip code. It's that easy!
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
                <h2
                    class="text-lg text-brand-blue font-semibold mb-2"
                >
                    Schools
                </h2>
                <span
                    v-if="!schools.length"
                    class="text-slate-500 opacity-60 text-sm"
                    >No codes found</span
                >
                <span
                    v-if="!filteredSchools.length && search"
                    class="text-slate-500 opacity-60 text-sm"
                    >None matching search</span
                >
                <ul v-else class="flex flex-col gap-2">
                    <li
                        v-for="school in filteredSchools"
                        :key="school.id"
                        class="flex gap-4"
                    >
                        <span class="flex-1">{{
                            school.attributes.name
                        }}</span>
                        <span>{{ school.attributes.code }}</span>
                    </li>
                </ul>
            </section>

            <section>
                <h2
                    class="text-lg text-brand-blue font-semibold mb-2"
                >
                    Churches
                </h2>
                <span
                    v-if="!churches.length"
                    class="text-slate-500 opacity-60 text-sm"
                    >No codes found</span
                >
                <span
                    v-if="!filteredChurches.length && search"
                    class="text-slate-500 opacity-60 text-sm"
                    >None matching search</span
                >
                <ul v-else class="flex flex-col gap-2">
                    <li
                        v-for="church in filteredChurches"
                        :key="church.id"
                        class="flex gap-4"
                    >
                        <span class="flex-1">{{
                            church.attributes.name
                        }}</span>
                        <span>{{ church.attributes.code }}</span>
                    </li>
                </ul>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
const search = ref('')

const { data } = await useAsyncData(
    'scrip',
    () =>
        useStrapi().find('scrip-providers', {
            sort: ['name:asc'],
            fields: ['name', 'code', 'type'],
        }),
    {
        pick: ['data'],
    },
)

const schools = computed(
    () =>
        data.value?.filter(
            ({ attributes }) => attributes.type === 'school',
        ) || [],
)

const churches = computed(
    () =>
        data.value?.filter(
            ({ attributes }) => attributes.type === 'church',
        ) || [],
)

const filteredSchools = computed(() =>
    schools.value.filter(({ attributes }) =>
        attributes.name
            .toLowerCase()
            .includes(search.value.toLowerCase()),
    ),
)
const filteredChurches = computed(() =>
    churches.value.filter(({ attributes }) =>
        attributes.name
            .toLowerCase()
            .includes(search.value.toLowerCase()),
    ),
)
</script>

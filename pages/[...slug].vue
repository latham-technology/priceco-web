<template>
    <ContentDoc>
        <template #default="{ doc }">
            <main class="prose">
                <ContentRendererMarkdown
                    :data="{ company }"
                    :value="doc"
                />
            </main>
        </template>

        <template #not-found>
            <div class="h-full flex flex-col justify-center">
                <div class="text-center">
                    <PageTitle
                        class="!text-brand-blue"
                        title="Sorry! That page was not found."
                    />
                    <NuxtLink to="/">
                        <Button>Go Home</Button>
                    </NuxtLink>
                </div>
            </div>
        </template>
    </ContentDoc>
</template>

<script setup>
const company = useCompany()
</script>

<template>
    <main class="prose">
        <ContentDoc>
            <template #default="{ doc }">
                <ContentRendererMarkdown
                    :data="{ company }"
                    :value="doc"
                />
            </template>
        </ContentDoc>
    </main>
</template>

<script setup>
const company = useCompany()
</script>

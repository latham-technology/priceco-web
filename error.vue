<template>
    <NuxtLayout>
        <div class="h-full flex flex-col justify-center">
            <div class="text-center">
                <PageTitle title="Oops! There was a problem." />
                <AppTypography>
                    Our support team has been notified. Please try
                    again later.
                </AppTypography>
                <NuxtLink to="/">
                    <Button>Go Home</Button>
                </NuxtLink>
            </div>
        </div>
    </NuxtLayout>
</template>

<script setup>
const error = useError()

useNuxtApp().$sentry.captureException(error.value)
</script>

<style lang="scss" scoped></style>

<template>
    <PrimeFieldSet
        v-bind="$attrs"
        :pt="{
            legend: {
                style: {
                    paddingLeft: 0,
                },
            },
        }"
    >
        <slot />
    </PrimeFieldSet>
</template>

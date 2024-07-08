<template>
    <div class="flex flex-col-reverse md:flex-row gap-6 md:gap-10">
        <slot name="sidebar" />

        <div>
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts"></script>

<style></style>

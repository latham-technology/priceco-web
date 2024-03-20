<template>
    <div>
        <PageTitle
            :images="[
                '/img/etc/esp/espLg01.png',
                '/img/etc/esp/espSm01.png',
                '/img/etc/esp/espSm02.png',
            ]"
            title="Email Savings Program"
        />

        <AppTypography>
            Sign up to receive exclusive savings and other offers via email.
            Start saving now!
        </AppTypography>

        <EspForm />
    </div>
</template>

<script setup lang="ts"></script>

<template>
    <div>
        <PageTitle
            :images="[
                {
                    src: '/img/etc/itemrequest/itemReqLg01.png',
                    alt: '',
                },
                {
                    src: '/img/etc/itemrequest/itemReqSm01.png',
                    alt: '',
                },
                {
                    src: '/img/etc/itemrequest/itemReqSm02.png',
                    alt: '',
                },
            ]"
            title="New Item Request"
        />

        <AppTypography>
            Want an item seen elsewhere? Fill out the form below and
            we will do our very best to provide it for you. Please
            allow for up to 10 days for delivery to the store, if
            available.
        </AppTypography>

        <AppTypography>
            We will contact you by phone regarding the status of your
            order. Thank you!
        </AppTypography>

        <ProductRequestForm />
    </div>
</template>

<script setup lang="ts"></script>

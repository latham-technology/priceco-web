<template>
    <div>
        <PageTitle
            :images="[
                {
                    src: '/img/bakery/bakeryLg01.png',
                    alt: 'Fresh bread displayed on rack',
                },
                {
                    src: '/img/bakery/bakerySm01.png',
                    alt: 'Delicious cakes displayed in case',
                },
                {
                    src: '/img/bakery/bakerySm02.png',
                    alt: 'Birthday cake intricately decorated with a beach theme',
                },
            ]"
            title="Bakery Department"
        />

        <PageContent>
            <AppTypography>
                In our scratch-baked bakery we offer a plethora of
                baked breads, muffins, doughnuts, and loaf cakes! And
                if it’s a sweet tooth you’ve got, we keep in stock a
                wide variety of fresh-baked pies and mouth-watering
                gourmet cakes.
            </AppTypography>
            <AppTypography>
                Let us help make that birthday or special event a
                spectacular event with our custom-made sheet cakes.
                Ranging from ¼ sheets to full sheets, we can decorate
                your cake in almost any way imaginable.
            </AppTypography>
        </PageContent>
    </div>
</template>

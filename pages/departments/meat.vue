<template>
    <div class="container">
        <PageTitle
            :images="[
                {
                    src: '/img/meat/meatLg01.png',
                    alt: 'Packaged meat on display',
                },
                {
                    src: '/img/meat/meatSm01.png',
                    alt: 'Fresh cuts of meat including prime rib, pork chops, and ground beef',
                },
                {
                    src: '/img/meat/meatSm02.png',
                    alt: 'Marinated tritips on display',
                },
            ]"
            title="Meat Department"
        />

        <PageContent>
            <template #sidebar>
                <MoreInformation
                    :links="[
                        {
                            text: 'Creekstone Farms',
                            to: 'https://creekstonefarms.com',
                            target: '_blank',
                        },
                    ]"
                />
            </template>

            <AppTypography>
                Do you have to pay more for service? Absolutely not!
                PriceCo Foods offers a truly special butcher shop
                experience. At the skilled hands of our meat cutters,
                our meat department offers the best cuts of meat in
                town.
            </AppTypography>
            <AppTypography>
                From prime rib to pork chops to fresh ground beef, you
                are sure to find the type and cut of meat for which
                you are shopping for. Throughout the day, our butchers
                are busy cutting, trimming and wrapping steaks, roasts
                and other favorite cuts.
            </AppTypography>
            <AppTypography>
                Along with a friendly smile, our knowledgeable meat
                clerks can assist you in picking out the right
                selection, as well as offering some great recipes and
                cooking directions for your meal. We have a wide
                variety of ready to cook meals that our butchers
                prepare for you. All you have to do is cook and serve.
            </AppTypography>
            <AppTypography>
                We take pride in delivering the finest quality meats
                to your table, and now, we're thrilled to offer you
                the excellence of
                <a
                    href="https://creekstonefarms.com/products/premium-black-angus-beef/"
                    target="_blank"
                    >Creekstone Farms Premium Black Angus Beef</a
                >.
            </AppTypography>
        </PageContent>
    </div>
</template>

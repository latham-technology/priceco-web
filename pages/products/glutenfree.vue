<template>
    <div>
        <PageTitle
            title="Gluten-Free Products"
            :images="[
                '/img/grocery/glutenfree/gfLg01.png',
                '/img/grocery/glutenfree/gfSm01.png',
                '/img/grocery/glutenfree/gfSm02.png',
            ]"
        />

        <PageContent>
            <template #sidebar>
                <MoreInformation
                    :links="[
                        {
                            text: 'Gluten Free Diet',
                            href: 'http://www.mayoclinic.com/health/gluten-free-diet/my01140',
                            target: '_blank',
                        },
                        {
                            text: 'Udi\'s Food',
                            href: 'https://www.udisglutenfree.com/',
                            target: '_blank',
                        },
                    ]"
                />
            </template>

            <AppTypography>
                We have expanded our Gluten Free sections to four doors of
                frozen located on the back left side of aisle 1. We carry Udi’s
                brand breads, tortillas and muffins as well as many desserts,
                chicken nuggets and hot dogs.
            </AppTypography>
            <AppTypography>
                In the dry section on aisle 10 we have 20 feet of all the gluten
                free items we can find. If you are getting different items at a
                health food store or elsewhere let us know and we will try to
                find it.
            </AppTypography>
        </PageContent>
    </div>
</template>

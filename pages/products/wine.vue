<template>
  <div>
    <PageTitle
      title="Gourmet Wine"
      :images="[
        '/img/grocery/wine/wineLg01.png',
        '/img/grocery/wine/wineSm01.png',
        '/img/grocery/wine/wineSm02.png',
      ]"
    />

    <PageContent>
      <template #sidebar>
        <MoreInformation :links="links" />
      </template>

      <AppTypography>
        Here at PriceCo Foods, we carry many of your favorite wines, including several famous local wines, all at great prices! Choose from many of your favorites like Woodbridge, Sutter Home, Gallo Family Wines, Van-Ruiten, Barefoot and many many more!
      </AppTypography>
      <AppTypography>
        From our local vineyards, choose from wines like Ironstone, the area's premier winery. Also Hatcher, Gianelli, Mount Brow, Milliaire, Chatom, Rombauer, Stevenot and Hovey, just to name a few.
      </AppTypography>
      <AppTypography>
        We are constantly trying to add new wines to our selection, to give our customers something new and exciting to choose from.
      </AppTypography>
    </PageContent>
  </div>
</template>

<script setup lang="ts">
const links = [
  // {
  //   text: 'Mt. Brow Winery',
  //   href: 'http://www.mtbrowwinery.com/'
  // },
  {
    text: 'Hovey Wines',
    href: 'http://www.hoveywine.com/'
  },
  {
    text: 'Stevenot Winery',
    href: 'http://www.stevenotwinery.com/'
  },
  {
    text: 'Ironstone Winery',
    href: 'http://www.ironstonevineyards.com/'
  },
  {
    text: 'Irish Vineyards',
    href: 'http://www.irishvineyard.com/'
  }
].map(link => ({
  ...link,
  target: '_blank'
}))
</script>

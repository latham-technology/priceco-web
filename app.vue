<template>
  <div class="flex flex-col h-full gap-8">
    <AppHeader />
    <main class="flex-1 container">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'PriceCo Foods',
  link: [
    { rel: 'stylesheet', type: 'text/css', href: '/css/styles.css' },
    { rel: 'stylesheet', type: 'text/css', href: '/css/forms-interim.css' },
    { rel: 'stylesheet', type: 'text/css', href: '/css/forms.css' },
    {
      rel: 'stylesheet',
      media: 'screen',
      type: 'text/css',
      href: '/css/ui-lightness/jquery-ui-1.8.21.custom.css',
    },
    {
      rel: 'stylesheet',
      type: 'text/css',
      href: 'https://fonts.googleapis.com/css?family=Droid+Serif:400,700|Droid+Sans:400,700',
    },
  ],
  script: [
    { src: '/js/jquery-ui/js/jquery-1.10.2.js' },
    {
      src: 'https://ajax.aspnetcdn.com/ajax/jquery.validate/1.11.1/jquery.validate.min.js',
    },
    { src: '/js/jquery-ui/js/jquery-ui-1.10.4.custom.min.js' },
  ],
})
</script>

<style lang="scss">
body {
  @apply font-sans;
}

#__nuxt {
  height: 100%;
}

a.text-link {
  @apply text-[#355974] hover:text-[#745035];
}

form {
  section {
    @apply py-8;

    h1 {
      @apply py-2 text-brand-blue;
      @apply text-2xl font-semibold;
    }

    h2 {
      @apply py-2;
      @apply text-lg font-semibold;
    }
  }
}
</style>

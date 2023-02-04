<template>
  <div>
    <div class="relative">
      <div id="documentViewer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: '/flowpaper/css/flowpaper.css',
    },
  ],
  script: [
    { key: 'jquery.min.js', src: '/flowpaper/js/jquery.min.js' },
    {
      key: 'jquery.extensions.min.js',
      src: '/flowpaper/js/jquery.extensions.min.js',
    },
    { key: 'three.min.js', src: '/flowpaper/js/three.min.js' },
    { key: 'flowpaper.js', src: '/flowpaper/js/flowpaper.js' },
    {
      key: 'flowpaper_handlers.js',
      src: '/flowpaper/js/flowpaper_handlers.js',
    },
  ],
})

onMounted(() => {
  function doTheThing() {
    console.log(window.jQuery)
    window.jQuery('#documentViewer').FlowPaperViewer({
      config: {
        jsDirectory: '/flowpaper/js/',
        cssDirectory: '/flowpaper/css/',
        localeDirectory: '/flowpaper/locale/',
        PDFFile: '/flowpaper/pdf/Binder1.pdf',
        EnableWebGL: true,
        UIConfig: '/flowpaper/UI_Zine.xml',
        FitPageOnLoad: true,
        FitWidthOnLoad: true,
        ProgressiveLoading: false,
      },
    })
  }

  if (window.jQuery) {
    doTheThing()
  } else {
    window.addEventListener('load', () => {
      doTheThing()
    })
  }
})
</script>

<style scoped lang="scss">
.pdf-viewer {
  @apply h-full w-full min-h-[400px];
}
</style>

$(function () {
  $('.simpleSlide img:gt(0)').hide()
  setInterval(function () {
    $('.simpleSlide :first-child')
      .fadeOut()
      .next('img')
      .fadeIn()
      .end()
      .appendTo('.simpleSlide')
  }, 5000)
})

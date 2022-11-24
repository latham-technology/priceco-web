$(document).ready(function () {
  //we want to highlight the row only if the item focused on is a textbox,
  //password or select list. Buttons should be ignored...
  $(':input')
    .not(':button')
    .focus(function () {
      //highlight the containing table row...
      $(this).parents('li').css({ background: '#14BDF4' })
    })
    .blur(function () {
      //remove the background attribute from the inline style...
      $(this).parents('li').css({ background: '' })
    })
})

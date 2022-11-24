$(document).ready(function () {
  // Hide honeypot fields
  $('.hp').hide()
  // Input masks and tooltips
  $('abbr.required').tooltip({
    items: 'abbr[name]',
  })
  $(':input').inputmask()
  $('input.datepicker').datepicker()

  // Cake Order functions
  $('#cake-flavor').change(function () {
    if ($(this).find('option:selected').text() == 'Carrot') {
      $('#cake-fill').prop('disabled', true)
    } else {
      $('#cake-fill').prop('disabled', false)
    }
  })
  // ///////// Validation /////////
  jQuery.validator.addClassRules({
    'validate-email': {
      required: true,
      email: true,
    },
    'validate-required': {
      required: true,
    },
    'validate-name': {
      minlength: 2,
    },
  })
  // @TODO Submit click handler
  $('.webform').validate({
    // ignore: "",
    errorPlacement: function (error, element) {
      return true
    },
    highlight: function (element, errorClass) {
      $(element)
        .parent('p#' + element.id + '-field')
        .addClass(errorClass)
    },
    unhighlight: function (element, errorClass) {
      $(element)
        .parent('p#' + element.id + '-field')
        .removeClass(errorClass)
    },
    submitHandler: function (form) {
      $.ajax({
        type: 'POST',
        url: '/includes/process-interim.php',
        data: $('form').serialize(),
        success: function (data, status, xhr) {
          // ERROR_NO:
          // 1: Mail Error
          // 2: DB Error, phone number exists
          // 3: Invalid email
          // 9: Honeypot fail
          if (xhr.getResponseHeader('ERROR_NO') == 1) {
            $('input#submit').prop('value', 'Oops! Please try again')
            $('input#submit').css({
              'background-color': 'red',
              transition: 'all 0.5s',
            })
          } else if (xhr.getResponseHeader('ERROR_NO') == 2) {
            $('input#submit').prop(
              'value',
              'Oops! Phone number is already registered!'
            )
            $('input#submit').css({
              'background-color': 'red',
              transition: 'all 0.5s',
            })
          } else if (xhr.getResponseHeader('ERROR_NO') == 3) {
            $('input#submit').prop('value', 'Oops! Email is invalid!')
            $('input#submit').css({
              'background-color': 'red',
              transition: 'all 0.5s',
            })
            $('p#email-field').addClass(errorClass)
          } else if (xhr.getResponseHeader('ERROR_NO') == 9) {
            $('input#submit').prop('value', 'Oops! Seems you are a bot')
            $('input#submit').css({
              'background-color': 'red',
              transition: 'all 0.5s',
            })
          } else {
            $('.webform :input').prop('disabled', true)
            $('input#submit').prop('value', 'Sent!')
            $('input#submit').css({
              width: '33%',
              'background-color': 'green',
              opacity: '1',
              transition: 'all 0.5s',
            })
          }
        },
        error: function () {
          $('input#submit').prop('value', 'Oops! Please try again later')
          $('input#submit').css({
            width: '33%',
            'background-color': 'red',
            transition: 'all 0.5s',
          })
        },
      })
      return false
    },
  })
  var Validator = $('.webform').validate()

  // ///////// jQ-ui tabs /////////
  var currentTab = 0
  $('.tabs').tabs({
    active: function (e, i) {
      currentTab = i.index
    },
    /*
		beforeActivate: function(event, ui){
			var valid = true;
			var $inputs = $(".tabs").find(".validate-required:visible");
			$inputs.each(function(){
				if (!Validator.element(this) && valid) {
					$(this).closest("p").addClass("error");
					event.preventDefault();
					valid = false;
				}
			});
		}
		*/
  })

  $('#next').click(function () {
    // Validate tab first
    var valid = true
    var $inputs = $('.tabs').find('.validate-required:visible')
    $inputs.each(function () {
      if (!Validator.element(this) && valid) {
        $(this).closest('p').addClass('error')
        valid = false
      }
    })
    if (valid) {
      // Get number of tabs
      var c = $('.tabs > ul > li').size()
      currentTab = currentTab == c - 1 ? currentTab : currentTab + 1
      $('.tabs').tabs('option', 'active', currentTab)
      $('#prev').show()
      if (currentTab == c - 1) {
        $('#next').hide()
        $('#submit').show()
      } else {
        $('#next').show()
      }
    }
  })
  $('#prev').click(function () {
    var c = $('.tabs > ul > li').size()
    currentTab = currentTab === 0 ? currentTab : currentTab - 1
    $('.tabs').tabs('option', 'active', currentTab)
    if (currentTab === 0) {
      $('#next').show()
      $('#prev').hide()
    }
    if (currentTab < c - 1) {
      $('#submit').hide()
      $('#next').show()
    }
  })
  /* Pickers
$("input#datetime").datetimepicker({
timeFormat: 'hh:mm tt',
stepMinute: 10,
hourMin: 8,
hourMax: 19
});
*/
})

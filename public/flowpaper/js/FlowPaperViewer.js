var Mouse = {
  x: 0,
  y: 0,
  refresh: function (e) {
    if (e && !this.down && !jQuery(e.target).hasClass('flowpaper_zoomSlider')) {
      return
    }
    var posx = 0,
      posy = 0
    if (!e) {
      e = window.event
    }
    if (e.pageX || e.pageY) {
      posx = e.pageX
      posy = e.pageY
    } else {
      if (e.clientX || e.clientY) {
        posx =
          e.clientX +
          document.body.scrollLeft +
          document.documentElement.scrollLeft
        posy =
          e.clientY +
          document.body.scrollTop +
          document.documentElement.scrollTop
      }
    }
    this.x = posx
    this.y = posy
  },
}
var mouseMoveHandler = document.onmousemove || function () {}
document.onmousemove = function (e) {
  if (!e) {
    e = window.event
  }
  if (e && e.which == 1) {
    Mouse.down = true
  }
  Mouse.refresh(e)
}
var MPosition = {
  get: function (obj) {
    var curleft = (curtop = 0)
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft
        curtop += obj.offsetTop
      } while ((obj = obj.offsetParent))
    }
    return [curleft, curtop]
  },
}
var Slider = function (wrapper, options) {
  if (typeof wrapper == 'string') {
    wrapper = document.getElementById(wrapper)
  }
  if (!wrapper) {
    return
  }
  var handle = wrapper.getElementsByTagName('div')[0]
  if (
    !handle ||
    handle.className.search(/(^|\s)flowpaper_handle(\s|$)/) == -1
  ) {
    return
  }
  this.init(wrapper, handle, options || {})
  this.setup()
}
Slider.prototype = {
  init: function (wrapper, handle, options) {
    this.wrapper = wrapper
    this.handle = handle
    this.options = options
    this.value = {
      current: options.value || 0,
      target: options.value || 0,
      prev: -1,
    }
    this.disabled = options.disabled || false
    this.steps = options.steps || 0
    this.snapping = options.snapping || false
    this.speed = options.speed || 5
    this.callback = options.callback || null
    this.animation_callback = options.animation_callback || null
    this.bounds = {
      pleft: options.pleft || 0,
      left: 0,
      pright: -(options.pright || 0),
      right: 0,
      width: 0,
      diff: 0,
    }
    this.offset = { wrapper: 0, mouse: 0, target: 0, current: 0, prev: -9999 }
    this.dragging = false
    this.tapping = false
  },
  setup: function () {
    var self = this
    this.wrapper.onselectstart = function () {
      return false
    }
    this.handle.onmousedown = function (e) {
      self.preventDefaults(e, true)
      this.focus()
      self.handleMouseDownHandler(e)
    }
    this.wrapper.onmousedown = function (e) {
      self.preventDefaults(e)
      self.wrapperMouseDownHandler(e)
    }
    var mouseUpHandler = document.onmouseup || function () {}
    if (document.addEventListener) {
      document.addEventListener('mouseup', function (e) {
        if (self.dragging) {
          mouseUpHandler(e)
          self.preventDefaults(e)
          self.documentMouseUpHandler(e)
        }
      })
    } else {
      document.onmouseup = function (e) {
        if (self.dragging) {
          mouseUpHandler(e)
          self.preventDefaults(e)
          self.documentMouseUpHandler(e)
        }
      }
    }
    var resizeHandler = document.onresize || function () {}
    window.onresize = function (e) {
      resizeHandler(e)
      self.setWrapperOffset()
      self.setBounds()
    }
    this.setWrapperOffset()
    if (!this.bounds.pleft && !this.bounds.pright) {
      this.bounds.pleft = MPosition.get(this.handle)[0] - this.offset.wrapper
      this.bounds.pright = -this.bounds.pleft
    }
    this.setBounds()
    this.setSteps()
    this.interval = setInterval(function () {
      self.animate()
    }, 100)
    self.animate(false, true)
  },
  setWrapperOffset: function () {
    this.offset.wrapper = MPosition.get(this.wrapper)[0]
  },
  setBounds: function () {
    this.bounds.left = this.bounds.pleft
    this.bounds.right = this.bounds.pright + this.wrapper.offsetWidth
    this.bounds.width = this.bounds.right - this.bounds.left
    this.bounds.diff = this.bounds.width - this.handle.offsetWidth
  },
  setSteps: function () {
    if (this.steps > 1) {
      this.stepsRatio = []
      for (var i = 0; i <= this.steps - 1; i++) {
        this.stepsRatio[i] = i / (this.steps - 1)
      }
    }
  },
  disable: function () {
    this.disabled = true
    this.handle.className += ' disabled'
  },
  enable: function () {
    this.disabled = false
    this.handle.className = this.handle.className.replace(/\s?disabled/g, '')
  },
  handleMouseDownHandler: function (e) {
    if (Mouse) {
      Mouse.down = true
      Mouse.refresh(e)
    }
    var self = this
    this.startDrag(e)
    this.cancelEvent(e)
  },
  wrapperMouseDownHandler: function (e) {
    this.startTap()
  },
  documentMouseUpHandler: function (e) {
    this.stopDrag()
    this.stopTap()
    if (Mouse) {
      Mouse.down = false
    }
  },
  startTap: function (target) {
    if (this.disabled) {
      return
    }
    if (target === undefined) {
      target = Mouse.x - this.offset.wrapper - this.handle.offsetWidth / 2
    }
    this.setOffsetTarget(target)
    this.tapping = true
  },
  stopTap: function () {
    if (this.disabled || !this.tapping) {
      return
    }
    this.setOffsetTarget(this.offset.current)
    this.tapping = false
    this.result()
  },
  startDrag: function (e) {
    if (!e) {
      e = window.event
    }
    if (this.disabled) {
      return
    }
    this.offset.mouse = Mouse.x - MPosition.get(this.handle)[0]
    this.dragging = true
    if (e.preventDefault) {
      e.preventDefault()
    }
  },
  stopDrag: function () {
    if (this.disabled || !this.dragging) {
      return
    }
    this.dragging = false
    this.result()
  },
  feedback: function () {
    var value = this.value.current
    if (this.steps > 1 && this.snapping) {
      value = this.getClosestStep(value)
    }
    if (value != this.value.prev) {
      if (typeof this.animation_callback == 'function') {
        this.animation_callback(value)
      }
      this.value.prev = value
    }
  },
  result: function () {
    var value = this.value.target
    if (this.steps > 1) {
      value = this.getClosestStep(value)
    }
    if (typeof this.callback == 'function') {
      this.callback(value)
    }
  },
  animate: function (onMove, first) {
    if (onMove && !this.dragging) {
      return
    }
    if (this.dragging) {
      this.setOffsetTarget(Mouse.x - this.offset.mouse - this.offset.wrapper)
    }
    this.value.target = Math.max(this.value.target, 0)
    this.value.target = Math.min(this.value.target, 1)
    this.offset.target = this.getOffsetByRatio(this.value.target)
    if ((!this.dragging && !this.tapping) || this.snapping) {
      if (this.steps > 1) {
        this.setValueTarget(this.getClosestStep(this.value.target))
      }
    }
    if (this.dragging || first) {
      this.value.current = this.value.target
    }
    this.slide()
    this.show()
    this.feedback()
  },
  slide: function () {
    if (this.value.target > this.value.current) {
      this.value.current += Math.min(
        this.value.target - this.value.current,
        this.speed / 100
      )
    } else {
      if (this.value.target < this.value.current) {
        this.value.current -= Math.min(
          this.value.current - this.value.target,
          this.speed / 100
        )
      }
    }
    if (!this.snapping) {
      this.offset.current = this.getOffsetByRatio(this.value.current)
    } else {
      this.offset.current = this.getOffsetByRatio(
        this.getClosestStep(this.value.current)
      )
    }
  },
  show: function () {
    if (this.offset.current != this.offset.prev) {
      this.handle.style.left = String(this.offset.current) + 'px'
      this.offset.prev = this.offset.current
    }
  },
  setValue: function (value, snap) {
    this.setValueTarget(value)
    if (snap) {
      this.value.current = this.value.target
    }
  },
  setValueTarget: function (value) {
    this.value.target = value
    this.offset.target = this.getOffsetByRatio(value)
  },
  setOffsetTarget: function (value) {
    this.offset.target = value
    this.value.target = this.getRatioByOffset(value)
  },
  getRatioByOffset: function (offset) {
    return (offset - this.bounds.left) / this.bounds.diff
  },
  getOffsetByRatio: function (ratio) {
    return Math.round(ratio * this.bounds.diff) + this.bounds.left
  },
  getClosestStep: function (value) {
    var k = 0
    var min = 1
    for (var i = 0; i <= this.steps - 1; i++) {
      if (Math.abs(this.stepsRatio[i] - value) < min) {
        min = Math.abs(this.stepsRatio[i] - value)
        k = i
      }
    }
    return this.stepsRatio[k]
  },
  preventDefaults: function (e, selection) {
    if (!e) {
      e = window.event
    }
    if (e.preventDefault) {
      e.preventDefault()
    }
    if (selection && document.selection) {
      document.selection.empty()
    }
  },
  cancelEvent: function (e) {
    if (!e) {
      e = window.event
    }
    if (e.stopPropagation) {
      e.stopPropagation()
    } else {
      e.cancelBubble = true
    }
  },
}
var H,
  FLOWPAPER = window.FLOWPAPER ? window.FLOWPAPER : (window.FLOWPAPER = {})
FLOWPAPER.Jk = (function () {
  var f = []
  return {
    us: function (c) {
      f.push(c)
    },
    notify: function (c, d) {
      for (var e = 0, g = f.length; e < g; e++) {
        var h = f[e]
        if (h[c]) {
          h[c](d)
        }
      }
    },
  }
})()
function aa(f) {
  FLOWPAPER.Jk.notify('warn', f)
}
function N(f, c, d, e) {
  try {
    throw Error()
  } catch (g) {}
  FLOWPAPER.Jk.notify('error', f)
  d && c && (e ? jQuery('#' + d).trigger(c, e) : jQuery('#' + d).trigger(c))
  throw Error(f)
}
FLOWPAPER.Ql = {
  init: function () {
    ;('undefined' != typeof eb && eb) || (eb = {})
    var f = navigator.userAgent.toLowerCase(),
      c = location.hash.substr(1),
      d = !1,
      e = ''
    0 <= c.indexOf('mobilepreview=') &&
      ((d = !0),
      (e = c.substr(c.indexOf('mobilepreview=')).split('&')[0].split('=')[1]))
    var g
    try {
      g = 'ontouchstart' in document.documentElement
    } catch (n) {
      g = !1
    }
    !g &&
      (f.match(/iphone/i) || f.match(/ipod/i) || f.match(/ipad/i)) &&
      (d = !0)
    c = eb
    g = /win/.test(f)
    var h = /mac/.test(f),
      l
    if (!(l = d)) {
      try {
        l = 'ontouchstart' in document.documentElement
      } catch (n) {
        l = !1
      }
    }
    c.platform = {
      win: g,
      mac: h,
      touchdevice:
        l || f.match(/touch/i) || navigator.Sb || navigator.msPointerEnabled,
      ios:
        (d && ('ipad' == e || 'iphone' == e)) ||
        f.match(/iphone/i) ||
        f.match(/ipod/i) ||
        f.match(/ipad/i),
      android: (d && 'android' == e) || -1 < f.indexOf('android'),
      ge:
        (d && ('ipad' == e || 'iphone' == e)) ||
        navigator.userAgent.match(/(iPad|iPhone);.*CPU.*OS 6_\d/i),
      iphone: (d && 'iphone' == e) || f.match(/iphone/i) || f.match(/ipod/i),
      ipad: (d && 'ipad' == e) || f.match(/ipad/i),
      winphone:
        f.match(/Windows Phone/i) ||
        f.match(/iemobile/i) ||
        f.match(/WPDesktop/i),
      Ar: f.match(/Windows NT/i) && f.match(/ARM/i) && f.match(/touch/i),
      nn: navigator.Sb || navigator.msPointerEnabled,
      blackberry: f.match(/BlackBerry/i) || f.match(/BB10/i),
      webos: f.match(/webOS/i),
      po:
        -1 < f.indexOf('android') &&
        !(jQuery(window).height() < jQuery(window).width()),
      mobilepreview: d,
      Za: window.devicePixelRatio ? window.devicePixelRatio : 1,
      hp: 'undefined' !== typeof document && !!document.fonts,
    }
    1 < eb.platform.Za && 2 > eb.platform.Za && (eb.platform.Za = 2)
    d = eb
    if (
      (e = location.hash && 0 <= location.hash.substr(1).indexOf('inpublisher'))
    ) {
      ;(e = window.location.href.toString()),
        0 == e.length && (e = document.URL.toString()),
        (c =
          window.navigator.standalone ||
          (window.matchMedia &&
            window.matchMedia('(display-mode: standalone)').matches)),
        (g =
          -1 === document.URL.indexOf('http://') &&
          -1 === document.URL.indexOf('https://')),
        (e =
          c || g
            ? !1
            : 0 == e.indexOf('http://localhost/') ||
              0 == e.indexOf('http://localhost:') ||
              0 == e.indexOf('http://localhost:') ||
              0 == e.indexOf('http://192.168.') ||
              0 == e.indexOf('http://10.1.1.') ||
              0 == e.indexOf('file://') ||
              0 == e.indexOf('http://127.0.0.1')
            ? !0
            : 0 == e.indexOf('http://')
            ? !1
            : 0 == e.indexOf('/') ||
              0 == e.indexOf('https://online.flowpaper.com') ||
              0 == e.indexOf('http://online.flowpaper.com') ||
              0 == e.indexOf('https://test-online.flowpaper.com') ||
              0 == e.indexOf('http://test-online.flowpaper.com')
            ? !0
            : !1)
    }
    d.ht = e || -1 < FLOWPAPER.getHostName().indexOf('.flowpaper.') ? !0 : !1
    d = eb
    e = document.createElement('div')
    e.innerHTML = '000102030405060708090a0b0c0d0e0f'
    d.Be = e
    eb.platform.ios &&
      ((d = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/)),
      null != d && 1 < d.length
        ? ((eb.platform.iosversion = parseInt(d[1], 10)),
          (eb.platform.ge = 6 <= eb.platform.iosversion))
        : (eb.platform.ge = !0))
    eb.browser = {
      version: (f.match(/.+?(?:rv|it|ra|ie)[\/: ]([\d.]+)(?!.+opera)/) ||
        [])[1],
      Zb: (f.match(
        /.+?(?:version|chrome|firefox|opera|msie|OPR)[\/: ]([\d.]+)(?!.+opera)/
      ) || [])[1],
      safari: (/webkit/.test(f) || /applewebkit/.test(f)) && !/chrome/.test(f),
      opera: /opera/.test(f),
      msie: /msie/.test(f) && !/opera/.test(f) && !/applewebkit/.test(f),
      wg:
        (('Netscape' == navigator.appName &&
          null !=
            /Trident\/.*rv:([0-9]{1,}[.0-9]{0,})/.exec(navigator.userAgent)) ||
          0 < f.indexOf('edge/')) &&
        !/opera/.test(f),
      mozilla: /mozilla/.test(f) && !/(compatible|webkit)/.test(f),
      chrome: /chrome/.test(f),
      Zl: window.innerHeight > window.innerWidth,
    }
    eb.browser.safari && eb.platform.touchdevice && (eb.platform.ios = !0)
    eb.platform.touchonlydevice =
      (eb.platform.touchdevice &&
        (eb.platform.android ||
          eb.platform.ios ||
          eb.platform.blackberry ||
          eb.platform.webos)) ||
      eb.platform.winphone ||
      eb.platform.Ar
    eb.platform.Fb =
      eb.platform.touchonlydevice &&
      (eb.platform.iphone || eb.platform.po || eb.platform.blackberry)
    eb.browser.detected =
      eb.browser.safari ||
      eb.browser.opera ||
      eb.browser.msie ||
      eb.browser.mozilla ||
      eb.browser.seamonkey ||
      eb.browser.chrome ||
      eb.browser.wg
    ;(eb.browser.detected && eb.browser.version) ||
      ((eb.browser.chrome = !0), (eb.browser.version = '500.00'))
    if (eb.browser.msie) {
      var f = eb.browser,
        k
      try {
        k = !!new ActiveXObject('htmlfile')
      } catch (n) {
        k = !1
      }
      f.it =
        k &&
        'Win64' == navigator.platform &&
        document.documentElement.clientWidth == screen.width
    }
    eb.browser.version &&
      -1 < (eb.browser.version + '').indexOf('.') &&
      (eb.browser.version = eb.browser.version.substr(
        0,
        eb.browser.version.indexOf('.', eb.browser.version.indexOf('.'))
      ))
    eb.browser.Zb &&
      -1 < (eb.browser.Zb + '').indexOf('.') &&
      (eb.browser.Zb = eb.browser.Zb.substr(
        0,
        eb.browser.Zb.indexOf('.', eb.browser.Zb.indexOf('.'))
      ))
    k = eb.browser
    var f =
        !eb.platform.touchonlydevice ||
        (eb.platform.android && !window.annotations) ||
        (eb.platform.ge && !window.annotations) ||
        (eb.platform.ios &&
          6.99 <= eb.platform.iosversion &&
          !window.annotations),
      d =
        (eb.browser.mozilla && 4 <= eb.browser.version.split('.')[0]) ||
        (eb.browser.chrome && 535 <= eb.browser.version.split('.')[0]) ||
        (eb.browser.msie && 10 <= eb.browser.version.split('.')[0]) ||
        (eb.browser.safari && 534 <= eb.browser.version.split('.')[0]),
      e =
        document.documentElement.requestFullScreen ||
        document.documentElement.mozRequestFullScreen ||
        document.documentElement.webkitRequestFullScreen,
      m
    try {
      m =
        !!window.WebGLRenderingContext &&
        !!document.createElement('canvas').getContext('experimental-webgl')
    } catch (n) {
      m = !1
    }
    k.capabilities = { Pb: f, zr: d, Gr: e, Rr: m }
    if (eb.browser.msie) {
      m = eb.browser
      var p
      try {
        null != /MSIE ([0-9]{1,}[.0-9]{0,})/.exec(navigator.userAgent) &&
          (rv = parseFloat(RegExp.$1)),
          (p = rv)
      } catch (n) {
        p = -1
      }
      m.version = p
    }
  },
}
function ba(f) {
  var c = document.createElement('a')
  c.href = f
  return c.protocol + '//' + c.host + c.pathname
}
function ca(f) {
  f.getContext('2d').clearRect(0, 0, f.width, f.height)
}
function O() {
  for (
    var f = eb.Sg.innerHTML, c = [], d = 0;
    '\n' != f.charAt(d) && d < f.length;

  ) {
    for (var e = 0, g = 6; 0 <= g; g--) {
      ' ' == f.charAt(d) && (e |= Math.pow(2, g)), d++
    }
    c.push(String.fromCharCode(e))
  }
  return c.join('')
}
function da(f, c, d) {
  this.H = f
  this.be = c
  this.containerId = d
  this.scroll = function () {
    var c = this
    jQuery(this.be).bind('mousedown', function (d) {
      if (
        c.H.xd ||
        (f.bj && f.bj()) ||
        jQuery('*:focus').hasClass('flowpaper_textarea_contenteditable') ||
        jQuery('*:focus').hasClass('flowpaper_note_textarea')
      ) {
        return (d.returnValue = !1), !0
      }
      if (c.H.Dc) {
        return !0
      }
      c.er(c.be)
      c.kk = d.pageY
      c.jk = d.pageX
      return !1
    })
    jQuery(this.be).bind('mousemove', function (d) {
      return c.So(d)
    })
    this.H.En ||
      (jQuery(this.containerId).bind('mouseout', function (d) {
        c.xp(d)
      }),
      jQuery(this.containerId).bind('mouseup', function () {
        c.Wm()
      }),
      (this.H.En = !0))
  }
  this.So = function (c) {
    if (!this.H.Gj) {
      return !0
    }
    this.H.wl != this.be &&
      ((this.kk = c.pageY), (this.jk = c.pageX), (this.H.wl = this.be))
    this.scrollTo(this.jk - c.pageX, this.kk - c.pageY)
    this.kk = c.pageY
    this.jk = c.pageX
    return !1
  }
  this.er = function (c) {
    this.H.Gj = !0
    this.H.wl = c
    jQuery(this.be).removeClass('flowpaper_grab')
    jQuery(this.be).addClass('flowpaper_grabbing')
  }
  this.xp = function (c) {
    0 == jQuery(this.H.N).has(c.target).length && this.Wm()
  }
  this.Wm = function () {
    this.H.Gj = !1
    jQuery(this.be).removeClass('flowpaper_grabbing')
    jQuery(this.be).addClass('flowpaper_grab')
  }
  this.scrollTo = function (c, d) {
    var h = jQuery(this.containerId).scrollLeft() + c,
      f = jQuery(this.containerId).scrollTop() + d
    jQuery(this.containerId).scrollLeft(h)
    jQuery(this.containerId).scrollTop(f)
  }
}
function ea(f) {
  f = f.split(',').map(function (c) {
    a: if (/^-?\d+$/.test(c)) {
      c = parseInt(c, 10)
    } else {
      var d
      if ((d = c.match(/^(-?\d+)(-|\.\.\.?|\u2025|\u2026|\u22EF)(-?\d+)$/))) {
        c = d[1]
        var e = d[2]
        d = d[3]
        if (c && d) {
          c = parseInt(c)
          d = parseInt(d)
          var g = [],
            h = c < d ? 1 : -1
          if ('-' == e || '..' == e || '\u2025' == e) {
            d += h
          }
          for (; c != d; c += h) {
            g.push(c)
          }
          c = g
          break a
        }
      }
      c = []
    }
    return c
  })
  return 0 === f.length
    ? []
    : 1 === f.length
    ? Array.isArray(f[0])
      ? f[0]
      : f
    : f.reduce(function (c, d) {
        Array.isArray(c) || (c = [c])
        Array.isArray(d) || (d = [d])
        return c.concat(d)
      })
}
function fa(f, c, d, e) {
  var g = f.createElement('node')
  g.setAttribute('pageNumber', ha(c, e))
  g.setAttribute('title', ia(c.title))
  d.appendChild(g)
  if (c.items && c.items.length) {
    for (d = 0; d < c.items.length; d++) {
      fa(f, c.items[d], g, e)
    }
  }
}
function ha(f, c) {
  destRef =
    'string' === typeof f.dest
      ? c.Yi[f.dest][0]
      : null != f && null != f.dest
      ? f.dest[0]
      : null
  return destRef instanceof Object
    ? c.gh[destRef.num + ' ' + destRef.gen + ' R'] + 1
    : destRef + 1
}
function ja(f, c) {
  if (eb.platform.hp) {
    var d = new FontFace(f, 'url(data:' + c + ')', {})
    document.fonts.add(d)
  } else {
    d = '@font-face { font-family:"' + f + '";src:' + ('url(' + c + ');') + '}'
    if (window.styleElement) {
      e = window.styleElement
    } else {
      var e = (window.styleElement = document.createElement('style'))
      e.id = 'FLOWPAPER_FONT_STYLE_TAG'
      document.documentElement.getElementsByTagName('head')[0].appendChild(e)
    }
    e = e.sheet
    e.insertRule(d, e.cssRules.length)
  }
}
function ka(f) {
  function c(d) {
    if (!(d >= f.length)) {
      var e = document.createElement('a')
      e.href = f[d].download
      e.target = '_parent'
      'download' in e && (e.download = f[d].filename)
      ;(document.body || document.documentElement).appendChild(e)
      e.click ? e.click() : $(e).click()
      e.parentNode.removeChild(e)
      setTimeout(function () {
        c(d + 1)
      }, 500)
    }
  }
  c(0)
}
function la(f, c) {
  var d = new XMLHttpRequest()
  d.onreadystatechange = function () {
    if (4 == d.readyState && 200 == d.status) {
      var e = URL.createObjectURL(this.response)
      new Image()
      c(e)
    }
  }
  d.open('GET', f, !0)
  d.responseType = 'blob'
  d.send()
}
function P(f) {
  return new Response(f).json()
}
function Q(f) {
  function c(c, d) {
    var e, g, h, f, l
    h = c & 2147483648
    f = d & 2147483648
    e = c & 1073741824
    g = d & 1073741824
    l = (c & 1073741823) + (d & 1073741823)
    return e & g
      ? l ^ 2147483648 ^ h ^ f
      : e | g
      ? l & 1073741824
        ? l ^ 3221225472 ^ h ^ f
        : l ^ 1073741824 ^ h ^ f
      : l ^ h ^ f
  }
  function d(d, e, g, h, f, l, k) {
    d = c(d, c(c((e & g) | (~e & h), f), k))
    return c((d << l) | (d >>> (32 - l)), e)
  }
  function e(d, e, g, h, f, l, k) {
    d = c(d, c(c((e & h) | (g & ~h), f), k))
    return c((d << l) | (d >>> (32 - l)), e)
  }
  function g(d, e, g, h, f, l, k) {
    d = c(d, c(c(e ^ g ^ h, f), k))
    return c((d << l) | (d >>> (32 - l)), e)
  }
  function h(d, e, g, h, f, l, k) {
    d = c(d, c(c(g ^ (e | ~h), f), k))
    return c((d << l) | (d >>> (32 - l)), e)
  }
  function l(c) {
    var d = '',
      e = '',
      g
    for (g = 0; 3 >= g; g++) {
      ;(e = (c >>> (8 * g)) & 255),
        (e = '0' + e.toString(16)),
        (d += e.substr(e.length - 2, 2))
    }
    return d
  }
  var k = [],
    m,
    p,
    n,
    t,
    q,
    r,
    u,
    v
  f = (function (c) {
    c = c.replace(/\r\n/g, '\n')
    for (var d = '', e = 0; e < c.length; e++) {
      var g = c.charCodeAt(e)
      128 > g
        ? (d += String.fromCharCode(g))
        : (127 < g && 2048 > g
            ? (d += String.fromCharCode((g >> 6) | 192))
            : ((d += String.fromCharCode((g >> 12) | 224)),
              (d += String.fromCharCode(((g >> 6) & 63) | 128))),
          (d += String.fromCharCode((g & 63) | 128)))
    }
    return d
  })(f)
  k = (function (c) {
    var d,
      e = c.length
    d = e + 8
    for (
      var g = 16 * ((d - (d % 64)) / 64 + 1), h = Array(g - 1), f = 0, l = 0;
      l < e;

    ) {
      ;(d = (l - (l % 4)) / 4),
        (f = (l % 4) * 8),
        (h[d] |= c.charCodeAt(l) << f),
        l++
    }
    d = (l - (l % 4)) / 4
    h[d] |= 128 << ((l % 4) * 8)
    h[g - 2] = e << 3
    h[g - 1] = e >>> 29
    return h
  })(f)
  q = 1732584193
  r = 4023233417
  u = 2562383102
  v = 271733878
  for (f = 0; f < k.length; f += 16) {
    ;(m = q),
      (p = r),
      (n = u),
      (t = v),
      (q = d(q, r, u, v, k[f + 0], 7, 3614090360)),
      (v = d(v, q, r, u, k[f + 1], 12, 3905402710)),
      (u = d(u, v, q, r, k[f + 2], 17, 606105819)),
      (r = d(r, u, v, q, k[f + 3], 22, 3250441966)),
      (q = d(q, r, u, v, k[f + 4], 7, 4118548399)),
      (v = d(v, q, r, u, k[f + 5], 12, 1200080426)),
      (u = d(u, v, q, r, k[f + 6], 17, 2821735955)),
      (r = d(r, u, v, q, k[f + 7], 22, 4249261313)),
      (q = d(q, r, u, v, k[f + 8], 7, 1770035416)),
      (v = d(v, q, r, u, k[f + 9], 12, 2336552879)),
      (u = d(u, v, q, r, k[f + 10], 17, 4294925233)),
      (r = d(r, u, v, q, k[f + 11], 22, 2304563134)),
      (q = d(q, r, u, v, k[f + 12], 7, 1804603682)),
      (v = d(v, q, r, u, k[f + 13], 12, 4254626195)),
      (u = d(u, v, q, r, k[f + 14], 17, 2792965006)),
      (r = d(r, u, v, q, k[f + 15], 22, 1236535329)),
      (q = e(q, r, u, v, k[f + 1], 5, 4129170786)),
      (v = e(v, q, r, u, k[f + 6], 9, 3225465664)),
      (u = e(u, v, q, r, k[f + 11], 14, 643717713)),
      (r = e(r, u, v, q, k[f + 0], 20, 3921069994)),
      (q = e(q, r, u, v, k[f + 5], 5, 3593408605)),
      (v = e(v, q, r, u, k[f + 10], 9, 38016083)),
      (u = e(u, v, q, r, k[f + 15], 14, 3634488961)),
      (r = e(r, u, v, q, k[f + 4], 20, 3889429448)),
      (q = e(q, r, u, v, k[f + 9], 5, 568446438)),
      (v = e(v, q, r, u, k[f + 14], 9, 3275163606)),
      (u = e(u, v, q, r, k[f + 3], 14, 4107603335)),
      (r = e(r, u, v, q, k[f + 8], 20, 1163531501)),
      (q = e(q, r, u, v, k[f + 13], 5, 2850285829)),
      (v = e(v, q, r, u, k[f + 2], 9, 4243563512)),
      (u = e(u, v, q, r, k[f + 7], 14, 1735328473)),
      (r = e(r, u, v, q, k[f + 12], 20, 2368359562)),
      (q = g(q, r, u, v, k[f + 5], 4, 4294588738)),
      (v = g(v, q, r, u, k[f + 8], 11, 2272392833)),
      (u = g(u, v, q, r, k[f + 11], 16, 1839030562)),
      (r = g(r, u, v, q, k[f + 14], 23, 4259657740)),
      (q = g(q, r, u, v, k[f + 1], 4, 2763975236)),
      (v = g(v, q, r, u, k[f + 4], 11, 1272893353)),
      (u = g(u, v, q, r, k[f + 7], 16, 4139469664)),
      (r = g(r, u, v, q, k[f + 10], 23, 3200236656)),
      (q = g(q, r, u, v, k[f + 13], 4, 681279174)),
      (v = g(v, q, r, u, k[f + 0], 11, 3936430074)),
      (u = g(u, v, q, r, k[f + 3], 16, 3572445317)),
      (r = g(r, u, v, q, k[f + 6], 23, 76029189)),
      (q = g(q, r, u, v, k[f + 9], 4, 3654602809)),
      (v = g(v, q, r, u, k[f + 12], 11, 3873151461)),
      (u = g(u, v, q, r, k[f + 15], 16, 530742520)),
      (r = g(r, u, v, q, k[f + 2], 23, 3299628645)),
      (q = h(q, r, u, v, k[f + 0], 6, 4096336452)),
      (v = h(v, q, r, u, k[f + 7], 10, 1126891415)),
      (u = h(u, v, q, r, k[f + 14], 15, 2878612391)),
      (r = h(r, u, v, q, k[f + 5], 21, 4237533241)),
      (q = h(q, r, u, v, k[f + 12], 6, 1700485571)),
      (v = h(v, q, r, u, k[f + 3], 10, 2399980690)),
      (u = h(u, v, q, r, k[f + 10], 15, 4293915773)),
      (r = h(r, u, v, q, k[f + 1], 21, 2240044497)),
      (q = h(q, r, u, v, k[f + 8], 6, 1873313359)),
      (v = h(v, q, r, u, k[f + 15], 10, 4264355552)),
      (u = h(u, v, q, r, k[f + 6], 15, 2734768916)),
      (r = h(r, u, v, q, k[f + 13], 21, 1309151649)),
      (q = h(q, r, u, v, k[f + 4], 6, 4149444226)),
      (v = h(v, q, r, u, k[f + 11], 10, 3174756917)),
      (u = h(u, v, q, r, k[f + 2], 15, 718787259)),
      (r = h(r, u, v, q, k[f + 9], 21, 3951481745)),
      (q = c(q, m)),
      (r = c(r, p)),
      (u = c(u, n)),
      (v = c(v, t))
  }
  return (l(q) + l(r) + l(u) + l(v)).toLowerCase()
}
String.format = function () {
  for (var f = arguments[0], c = 0; c < arguments.length - 1; c++) {
    f = f.replace(new RegExp('\\{' + c + '\\}', 'gm'), arguments[c + 1])
  }
  return f
}
function ma(f, c, d) {
  return f > c && f < d
}
String.prototype.endsWith = function (f) {
  return this.substr(this.length - f.length) === f
}
String.prototype.startsWith = function (f) {
  return this.substr(0, f.length) === f
}
jQuery.fn.Ns = function (f, c) {
  return this.each(function () {
    jQuery(this).fadeIn(f, function () {
      eb.browser.msie ? jQuery(this).get(0).style.removeAttribute('filter') : ''
      'function' == typeof eval(c) ? eval(c)() : ''
    })
  })
}
jQuery.fn.Yo = function (f) {
  this.each(function () {
    eb.browser.msie
      ? eval(f)()
      : jQuery(this).fadeOut(400, function () {
          eb.browser.msie
            ? jQuery(this).get(0).style.removeAttribute('filter')
            : ''
          'function' == typeof eval(f) ? eval(f)() : ''
        })
  })
}
jQuery.fn.Cg = function (f) {
  this.each(function () {
    jQuery(this).data('retry')
      ? jQuery(this).data('retry', parseInt(jQuery(this).data('retry')) + 1)
      : jQuery(this).data('retry', 1)
    3 >= jQuery(this).data('retry')
      ? (this.src =
          this.src +
          (-1 < this.src.indexOf('?') ? '&' : '?') +
          't=' +
          new Date().getTime())
      : f()
  })
}
jQuery.fn.mt = function (f, c) {
  if (0 <= jQuery.fn.jquery.indexOf('1.8')) {
    try {
      if (void 0 === jQuery._data(this[0], 'events')) {
        return !1
      }
    } catch (g) {
      return !1
    }
    var d = jQuery._data(this[0], 'events')[f]
    if (void 0 === d || 0 === d.length) {
      return !1
    }
    var e = 0
  } else {
    if (void 0 === this.data('events')) {
      return !1
    }
    d = this.data('events')[f]
    if (void 0 === d || 0 === d.length) {
      return !1
    }
    e = 0
  }
  for (; e < d.length; e++) {
    if (d[e].handler == c) {
      return !0
    }
  }
  return !1
}
jQuery.fn.St = function (f) {
  if (void 0 === this.data('events')) {
    return !1
  }
  var c = this.data('events')[f]
  if (void 0 === c || 0 === c.length) {
    return !1
  }
  for (var d = 0; d < c.length; d++) {
    jQuery(this).unbind(f, c[d].handler)
  }
  return !1
}
jQuery.fn.xt = function () {
  eb.browser.capabilities.Pb
    ? this.scrollTo(ce, 0, { axis: 'xy', offset: -30 })
    : this.data('jsp').scrollToElement(ce, !1)
}
function na(f, c) {
  if (window.localStorage) {
    try {
      window.localStorage.setItem(f, c)
    } catch (d) {
      document.cookie = f + '=' + (c || '') + '; path=/'
    }
  } else {
    document.cookie = f + '=' + (c || '') + '; path=/'
  }
}
function oa(f) {
  if (window.localStorage) {
    try {
      return window.localStorage.getItem(f)
    } catch (g) {}
  }
  f = f + '='
  for (var c = document.cookie.split(';'), d = 0; d < c.length; d++) {
    for (var e = c[d]; ' ' == e.charAt(0); ) {
      e = e.substring(1, e.length)
    }
    if (0 == e.indexOf(f)) {
      return e.substring(f.length, e.length)
    }
  }
  return null
}
function ia(f) {
  return f
    .split('')
    .map(function (c) {
      var d = c.charCodeAt(0)
      if (127 < d) {
        return (c = d.toString(16)), '\\u' + (Array(5 - c.length).join('0') + c)
      }
      31 >= d && (c = '')
      '\n' == c && (c = '')
      '\r' == c && (c = '')
      '\b' == c && (c = '')
      '\t' == c && (c = '')
      '\f' == c && (c = '')
      '\b' == c && (c = '')
      return c
    })
    .join('')
}
function pa(f) {
  return f.split('').reverse().join('')
}
jQuery.fn.We = function (f, c) {
  this.css({
    width: 0,
    height: 0,
    'border-bottom': String.format('{0}px solid transparent', f),
    'border-top': String.format('{0}px solid transparent', f),
    'border-right': String.format('{0}px solid {1}', f, c),
    'font-size': '0px',
    'line-height': '0px',
    cursor: 'pointer',
  })
  this.unbind('mouseover')
  this.unbind('mouseout')
  eb.platform.touchonlydevice ||
    (this.on('mouseover', function (c) {
      jQuery(c.target).css({
        'border-right': String.format('{0}px solid {1}', f, '#DEDEDE'),
      })
    }),
    this.on('mouseout', function (d) {
      jQuery(d.target).css({
        'border-right': String.format('{0}px solid {1}', f, c),
      })
    }))
}
jQuery.fn.$j = function (f, c, d) {
  this.css({
    width: 0,
    height: 0,
    'border-bottom': String.format('{0}px solid {1}', f, c),
    'border-top': String.format('{0}px solid {1}', f, c),
    'border-left': String.format('1px solid {1}', f, c),
    'font-size': '0px',
    'line-height': '0px',
    cursor: 'pointer',
  })
  this.on('mouseover', function (c) {
    jQuery(d).trigger('mouseover')
    jQuery(c.target).css({
      'border-left': String.format('1px solid {1}', f, '#DEDEDE'),
      'border-bottom': String.format('{0}px solid {1}', f, '#DEDEDE'),
      'border-top': String.format('{0}px solid {1}', f, '#DEDEDE'),
    })
  })
  this.on('mouseout', function (e) {
    jQuery(d).trigger('mouseout')
    jQuery(e.target).css({
      'border-left': String.format('1px solid {1}', f, c),
      'border-bottom': String.format('{0}px solid {1}', f, c),
      'border-top': String.format('{0}px solid {1}', f, c),
    })
  })
}
jQuery.fn.Rd = function (f, c, d) {
  this.css({
    width: 0,
    height: 0,
    'border-bottom': String.format('{0}px solid transparent', f),
    'border-top': String.format('{0}px solid transparent', f),
    'border-left': String.format('{0}px solid {1}', f, c),
    'font-size': '0px',
    'line-height': '0px',
    cursor: 'pointer',
  })
  d && this.css({ opacity: 0.5 })
  this.unbind('mouseover')
  this.unbind('mouseout')
  this.on('mouseover', function (c) {
    d
      ? jQuery(c.target).css({
          'border-left': String.format('{0}px solid {1}', f, '#FFFFFF'),
          opacity: 0.85,
        })
      : jQuery(c.target).css({
          'border-left': String.format('{0}px solid {1}', f, '#DEDEDE'),
        })
  })
  this.on('mouseout', function (e) {
    jQuery(e.target).css({
      'border-left': String.format('{0}px solid {1}', f, c),
    })
    d && jQuery(e.target).css({ opacity: 0.5 })
  })
}
jQuery.fn.ak = function (f, c, d) {
  this.css({
    width: 0,
    height: 0,
    'border-bottom': String.format('{0}px solid {1}', f, c),
    'border-top': String.format('{0}px solid {1}', f, c),
    'border-right': String.format('1px solid {1}', f, c),
    'font-size': '0px',
    'line-height': '0px',
    cursor: 'pointer',
  })
  this.on('mouseover', function (c) {
    jQuery(d).trigger('mouseover')
    jQuery(c.target).css({
      'border-right': String.format('1px solid {1}', f, '#DEDEDE'),
      'border-top': String.format('{0}px solid {1}', f, '#DEDEDE'),
      'border-bottom': String.format('{0}px solid {1}', f, '#DEDEDE'),
    })
  })
  this.on('mouseout', function (e) {
    jQuery(d).trigger('mouseout')
    jQuery(e.target).css({
      'border-right': String.format('1px solid {1}', f, c),
      'border-top': String.format('{0}px solid {1}', f, c),
      'border-bottom': String.format('{0}px solid {1}', f, c),
    })
  })
}
jQuery.fn.addClass5 = function (f) {
  return this[0].classList ? (this[0].classList.add(f), this) : this.addClass(f)
}
jQuery.fn.removeClass5 = function (f) {
  return this[0].classList
    ? (this[0].classList.remove(f), this)
    : this.addClass(f)
}
jQuery.fn.Yb = function () {
  this.css({ display: 'none' })
}
jQuery.fn.Pc = function () {
  this.css({ display: 'block' })
}
window.requestAnim =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (f) {
    window.setTimeout(f, 1000 / 60)
  }
jQuery.fn.og = function () {
  var f = this.css('transform')
  return !f ||
    'none' == f ||
    ('0px,0px' == f.translate && 1 == parseFloat(f.scale))
    ? !1
    : !0
}
function qa(f, c) {
  var d = '0',
    e = (f = f + '')
  if (null == d || 1 > d.length) {
    d = ' '
  }
  if (f.length < c) {
    for (var e = '', g = 0; g < c - f.length; g++) {
      e += d
    }
    e += f
  }
  return e
}
jQuery.fn.spin = function (f) {
  this.each(function () {
    var c = jQuery(this),
      d = c.data()
    d.qk && (d.qk.stop(), delete d.qk)
    !1 !== f &&
      (d.qk = new Spinner(jQuery.extend({ color: c.css('color') }, f)).spin(
        this
      ))
  })
  return this
}
jQuery.fn.Kp = function () {
  var f = jQuery.extend(
    { vl: 'cur', pm: !1, speed: 300 },
    { pm: !1, speed: 100 }
  )
  this.each(function () {
    var c = jQuery(this).addClass('harmonica'),
      d = jQuery('ul', c).prev('a')
    c.children(':last').addClass('last')
    jQuery('ul', c).each(function () {
      jQuery(this).children(':last').addClass('last')
    })
    jQuery('ul', c).prev('a').addClass('harFull')
    c.find('.' + f.vl)
      .parents('ul')
      .show()
      .prev('a')
      .addClass(f.vl)
      .addClass('harOpen')
    d.on('click', function () {
      jQuery(this).next('ul').is(':hidden')
        ? jQuery(this).addClass('harOpen')
        : jQuery(this).removeClass('harOpen')
      f.pm
        ? (jQuery(this)
            .closest('ul')
            .closest('ul')
            .find('ul')
            .not(jQuery(this).next('ul'))
            .slideUp(f.speed)
            .prev('a')
            .removeClass('harOpen'),
          jQuery(this).next('ul').slideToggle(f.speed))
        : jQuery(this).next('ul').stop(!0).slideToggle(f.speed)
      return !1
    })
  })
}
function ra(f) {
  if (f && (!f || f.length)) {
    return (
      (f = f.replace(/\\u([\d\w]{4})/gi, function (c, d) {
        return String.fromCharCode(parseInt(d, 16))
      })),
      (f = unescape(f))
    )
  }
}
function sa(f, c) {
  var d = jQuery('<ul>')
  jQuery.each(c, function (c, g) {
    var h = jQuery('<li>').appendTo(d),
      l = jQuery(g).children('node')
    jQuery(
      '<a style="' +
        (eb.platform.touchonlydevice
          ? 'font-size:0.8em;line-height:1.2em;'
          : '') +
        '" class="flowpaper_accordionLabel flowpaper-tocitem" data-pageNumber="' +
        g.getAttribute('pageNumber') +
        '">'
    )
      .text(ra(g.getAttribute('title')))
      .appendTo(h)
    0 < l.length && sa(f, l).appendTo(h)
  })
  return d
}
function R(f) {
  f = parseInt(0 == f.indexOf('#') ? f.substr(1) : f, 16)
  return { r: f >> 16, g: (f >> 8) & 255, b: f & 255 }
}
jQuery.ng = function (f, c, d) {
  f = f.offset()
  return { x: Math.floor(c - f.left), y: Math.floor(d - f.top) }
}
jQuery.fn.ng = function (f, c) {
  return jQuery.ng(this.first(), f, c)
}
;(function (f) {
  f.fn.moveTo = function (c) {
    return this.each(function () {
      var d = f(this).clone()
      f(d).appendTo(c)
      f(this).remove()
    })
  }
})(jQuery)
function ta(f) {
  return f.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ')
}
function S(f) {
  window.vi || (window.vi = 1)
  if (!window.Cl) {
    var c = window,
      d = document.createElement('div')
    document.body.appendChild(d)
    d.style.position = 'absolute'
    d.style.width = '1in'
    var e = d.offsetWidth
    d.style.display = 'none'
    c.Cl = e
  }
  return (f / (72 / window.Cl)) * window.vi
}
function T(f) {
  f = f.replace(/-/g, '-\x00').split(/(?=-| )|\0/)
  for (var c = [], d = 0; d < f.length; d++) {
    '-' == f[d] && d + 1 <= f.length
      ? ((c[c.length] = -1 * parseFloat(ta(f[d + 1].toString()))), d++)
      : (c[c.length] = parseFloat(ta(f[d].toString())))
  }
  return c
}
function ua(f) {
  this.source = f
  this.volume = 100
  this.loop = !1
  this.re = void 0
  this.finish = !1
  this.stop = function () {
    document.body.removeChild(this.re)
  }
  this.start = function () {
    if (this.finish) {
      return !1
    }
    this.re = new window.Audio()
    this.re.setAttribute('src', this.source)
    this.re.setAttribute('hidden', 'true')
    this.re.setAttribute('volume', this.volume)
    this.re.setAttribute('autostart', 'true')
    this.re.setAttribute('autoplay', 'true')
    document.body.appendChild(this.re)
  }
  this.remove = function () {
    document.body.removeChild(this.re)
    this.finish = !0
  }
  this.init = function (c, d) {
    this.finish = !1
    this.volume = c
    this.loop = d
  }
}
function va(f, c) {
  jQuery('#' + f).hasClass('activeElement') ||
    (jQuery('.activeElement:not(#' + f + ')')
      .removeClass('activeElement')
      .find('.activeElement-label')
      .remove(),
    jQuery('#' + f).hasClass('activeElement') ||
      (jQuery('#' + f)
        .addClass('activeElement')
        .prepend(
          '<span contenteditable="false" class="activeElement-label"><i class="activeElement-drag fa fa-arrows"></i><span class="activeElement-labeltext">Click to Zoom in and out. Double click to edit this page.</span><i style="margin-left:5px;" class="fa fa-cog activeElement-label-settingsCog"></i></span>'
        ),
      jQuery('#' + f).data('hint-pageNumber', c)))
}
FLOWPAPER.yk = function (f, c) {
  if (0 < f.indexOf('[*,2]') || 0 < f.indexOf('[*,1]')) {
    var d = f.substr(f.indexOf('[*,'), f.indexOf(']') - f.indexOf('[*,') + 1)
    return f.replace(
      d,
      qa(c, parseInt(d.substr(d.indexOf(',') + 1, d.indexOf(']') - 2)))
    )
  }
  return 0 < f.indexOf('[*,2,true]')
    ? f.replace('_[*,2,true]', '')
    : 0 < f.indexOf('[*,1,true]')
    ? f.replace('_[*,1,true]', '')
    : 0 < f.indexOf('[*,0,true]')
    ? f.replace('_[*,0,true]', '')
    : f
}
FLOWPAPER.jp = function () {
  for (var f = '', c = 0; 10 > c; c++) {
    f +=
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(
        Math.floor(62 * Math.random())
      )
  }
  return f
}
FLOWPAPER.nt = function (f) {
  return (
    '#' != f.charAt(0) &&
    '/' != f.charAt(0) &&
    (-1 == f.indexOf('//') ||
      f.indexOf('//') > f.indexOf('#') ||
      f.indexOf('//') > f.indexOf('?'))
  )
}
FLOWPAPER.As = function (f, c, d, e, g, h, l) {
  if (e < c) {
    var k = c
    c = e
    e = k
    k = d
    d = g
    g = k
  }
  k = document.createElement('div')
  k.id = f + '_line'
  k.className =
    'flowpaper_cssline flowpaper_annotation_' +
    l +
    ' flowpaper_interactiveobject_' +
    l
  f = Math.sqrt((c - e) * (c - e) + (d - g) * (d - g))
  k.style.width = f + 'px'
  k.style.marginLeft = h
  e = Math.atan((g - d) / (e - c))
  k.style.top = d + 0.5 * f * Math.sin(e) + 'px'
  k.style.left = c - 0.5 * f * (1 - Math.cos(e)) + 'px'
  k.style.MozTransform =
    k.style.WebkitTransform =
    k.style.msTransform =
    k.style.Sb =
      'rotate(' + e + 'rad)'
  return k
}
FLOWPAPER.Gt = function (f, c, d, e, g, h) {
  if (e < c) {
    var l = c
    c = e
    e = l
    l = d
    d = g
    g = l
  }
  f = jQuery('#' + f + '_line')
  l = Math.sqrt((c - e) * (c - e) + (d - g) * (d - g))
  f.css('width', l + 'px')
  e = Math.atan((g - d) / (e - c))
  f.css('top', d + 0.5 * l * Math.sin(e) + 'px')
  f.css('left', c - 0.5 * l * (1 - Math.cos(e)) + 'px')
  f.css('margin-left', h)
  f.css('-moz-transform', 'rotate(' + e + 'rad)')
  f.css('-webkit-transform', 'rotate(' + e + 'rad)')
  f.css('-o-transform', 'rotate(' + e + 'rad)')
  f.css('-ms-transform', 'rotate(' + e + 'rad)')
}
FLOWPAPER.Ks = function () {
  eb.browser.mozilla
    ? jQuery('.flowpaper_interactive_canvas').addClass(
        'flowpaper_interactive_canvas_drawing_moz'
      )
    : eb.browser.msie || eb.browser.wg
    ? jQuery('.flowpaper_interactive_canvas').addClass(
        'flowpaper_interactive_canvas_drawing_ie'
      )
    : jQuery('.flowpaper_interactive_canvas').addClass(
        'flowpaper_interactive_canvas_drawing'
      )
}
FLOWPAPER.Es = function () {
  jQuery('.flowpaper_interactive_canvas').removeClass(
    'flowpaper_interactive_canvas_drawing'
  )
  jQuery('.flowpaper_interactive_canvas').removeClass(
    'flowpaper_interactive_canvas_drawing_moz'
  )
  jQuery('.flowpaper_interactive_canvas').removeClass(
    'flowpaper_interactive_canvas_drawing_ie'
  )
}
;('use strict')
function wa() {
  try {
    return new window.XMLHttpRequest()
  } catch (f) {}
}
var xa =
  'undefined' !== typeof window && window.ActiveXObject
    ? function () {
        var f
        if (!(f = wa())) {
          a: {
            try {
              f = new window.ActiveXObject('Microsoft.XMLHTTP')
              break a
            } catch (c) {}
            f = void 0
          }
        }
        return f
      }
    : wa
function ya(f, c) {
  try {
    var d = xa()
    d.open('GET', f, !0)
    'responseType' in d && (d.responseType = 'arraybuffer')
    d.overrideMimeType &&
      d.overrideMimeType('text/plain; charset=x-user-defined')
    d.onreadystatechange = function () {
      var e, g
      if (4 === d.readyState) {
        if (200 === d.status || 0 === d.status) {
          g = e = null
          try {
            e = d.response || d.responseText
          } catch (h) {
            g = Error(h)
          }
          c(g, e)
        } else {
          c(
            Error(
              'Ajax error for ' +
                f +
                ' : ' +
                this.status +
                ' ' +
                this.statusText
            ),
            null
          )
        }
      }
    }
    d.send()
  } catch (e) {
    c(Error(e), null)
  }
}
var za = {
    borderColor: '#8ebbc4',
    rq: '#ffffff',
    backgroundColor: 'rgba(142,187,196,.2)',
    Aj: '#ffffff',
    borderWidth: 2,
    size: 48,
    className: 'flowpaper-circle-audio-player',
    hl: !0,
    $g: !1,
  },
  U = Math.PI,
  Aa = 2 * U,
  Ba = -U / 2
function Ca(f) {
  f = f || {}
  for (var c in za) {
    this[c] = f[c] || za[c]
  }
  this._canvas = document.createElement('canvas')
  this._canvas.setAttribute('class', this.className + ' is-loading')
  this.$g && (this._canvas.style.filter = 'invert(1) hue-rotate(190deg)')
  var d
  try {
    d = 'ontouchstart' in document.documentElement
  } catch (e) {
    d = !1
  }
  d ||
    this._canvas.addEventListener(
      'mousedown',
      function () {
        this.hh ? this.pause() : this.play()
      }.bind(this)
    )
  d &&
    this._canvas.addEventListener(
      'touchend',
      function () {
        this.hh ? this.pause() : this.play()
      }.bind(this)
    )
  this.ib = this._canvas.getContext('2d')
  Da(this, f.audio)
  this.setSize(this.size)
  ;(function g(c) {
    if (this.animating) {
      this.xc.Ci = this.xc.Ci || c
      var d = c - this.xc.Ci
      c = 1 - Math.cos(((d / 200) * U) / 2)
      if (200 <= d) {
        ;(this.animating = !1),
          (this.xc.current = this.Lg[this.xc.to].slice()),
          (this.Kg = !0)
      } else {
        for (var d = this.Lg[this.xc.from], e = [], f = 0; f < d.length; f++) {
          e.push([])
          for (var p = 0; p < d[f].length; p++) {
            e[f].push([])
            var n = this.Lg[this.xc.to][f][p]
            e[f][p][0] = d[f][p][0] + (n[0] - d[f][p][0]) * c
            e[f][p][1] = d[f][p][1] + (n[1] - d[f][p][1]) * c
          }
        }
        this.xc.current = e
      }
    }
    if (this.Kg || this.hh || this.animating || this.loading) {
      var t
      isNaN(t) && (t = this.audio.currentTime / this.audio.duration || 0)
      this.ib.clearRect(0, 0, this.size, this.size)
      this.ib.beginPath()
      this.ib.arc(this.jb, this.jb, this.jb - this.borderWidth / 2, 0, Aa)
      this.ib.closePath()
      this.ib.fillStyle = this.backgroundColor
      this.ib.fill()
      this.ib.lineWidth = this.borderWidth
      this.ib.strokeStyle = this.borderColor
      this.ib.stroke()
      0 < t &&
        (this.ib.beginPath(),
        this.ib.arc(
          this.jb,
          this.jb,
          this.jb - this.borderWidth / 2,
          Ba,
          Ba + Aa * t
        ),
        (this.ib.strokeStyle = this.rq),
        this.ib.stroke())
      this.ib.fillStyle = this.Aj
      if (this.loading) {
        ;(t =
          -Math.cos(((new Date().getTime() % 1800) / 1800) * U) * Aa -
          U / 3 -
          U / 2),
          this.ib.beginPath(),
          this.ib.arc(this.jb, this.jb, this.jb / 3, t, t + (U / 3) * 2),
          (this.ib.strokeStyle = this.Aj)
      } else {
        this.ib.beginPath()
        t = (this.xc && this.xc.current) || this.Lg.play
        for (c = 0; c < t.length; c++) {
          for (
            this.ib.moveTo(t[c][0][0], t[c][0][1]), d = 1;
            d < t[c].length;
            d++
          ) {
            this.ib.lineTo(t[c][d][0], t[c][d][1])
          }
        }
        this.ib.fill()
        this.ib.strokeStyle = this.Aj
        this.ib.lineWidth = 2
        this.ib.lineJoin = 'miter'
      }
      this.ib.stroke()
      this.Kg = !1
    }
    requestAnimationFrame(g.bind(this))
  }).call(this, new Date().getTime())
}
Ca.prototype = {
  setSize: function (f) {
    this.size = f
    this.jb = f / 2
    this._canvas.width = f
    this._canvas.height = f
    this._canvas.style.width = f / 2 + 'px'
    this._canvas.style.height = f / 2 + 'px'
    var c = this.size / 2
    f = c / 10
    var d = (c / 2) * Math.cos((U / 3) * 2) + this.jb,
      e = c / 2 + this.jb,
      g = (e - d) / 2 + d,
      h = this.jb - (c / 2) * Math.sin((U / 3) * 2),
      l = this.size - h,
      c = this.jb - c / 3,
      k = this.size - c
    this.Lg = {
      play: [
        [
          [d, h],
          [g, (this.jb - h) / 2 + h],
          [g, (this.jb - h) / 2 + this.jb],
          [d, l],
        ],
        [
          [g, (this.jb - h) / 2 + h],
          [e, this.jb],
          [e, this.jb],
          [g, (this.jb - h) / 2 + this.jb],
        ],
      ],
      pause: [
        [
          [c, h + f],
          [this.jb - f, h + f],
          [this.jb - f, l - f],
          [c, l - f],
        ],
        [
          [this.jb + f, h + f],
          [k, h + f],
          [k, l - f],
          [this.jb + f, l - f],
        ],
      ],
    }
    this.xc && this.xc.current && Ea(this, this.xc.to)
    this.hh || (this.Kg = !0)
  },
  appendTo: function (f) {
    f.appendChild(this._canvas)
    this._canvas.ag = this
  },
  play: function () {
    this.audio.play()
  },
  pause: function () {
    this.audio.pause()
  },
}
function Da(f, c) {
  f.audio = new Audio(c)
  f.audio.loop = !1
  Fa(f, 'loading')
  f.audio.addEventListener(
    'canplaythrough',
    function () {
      this.loop = !1
      this.hl ? this.play() : Fa(this, 'paused')
      this.hl = !1
    }.bind(f)
  )
  f.audio.addEventListener(
    'play',
    function () {
      Fa(this, 'playing')
    }.bind(f)
  )
  f.audio.addEventListener(
    'pause',
    function () {
      this.audio.currentTime === this.audio.duration &&
        (this.audio.currentTime = 0)
      Fa(this, 'paused')
    }.bind(f)
  )
  f.audio.load()
}
function Fa(f, c) {
  f.hh = !1
  f.loading = !1
  'playing' === c
    ? ((f.hh = !0), Ea(f, 'pause', 'play'))
    : 'loading' === c
    ? (f.loading = !0)
    : 'loading' !== f.state
    ? Ea(f, 'play', 'pause')
    : Ea(f, 'play', null)
  f.state = c
  f._canvas.setAttribute('class', f.className + ' is-' + c)
  f.Kg = !0
}
function Ea(f, c, d) {
  f.xc = { Ci: null, from: d, to: c }
  d ? (f.animating = !0) : ((f.xc.current = f.Lg[c].slice()), (f.Kg = !0))
}
var Ga = (function () {
    function f() {}
    f.prototype = {
      then: function (c) {
        c()
      },
      resolve: function () {},
    }
    return f
  })(),
  ImagePageRenderer = (window.ImagePageRenderer = (function () {
    function f(c, d, e) {
      this.aa = c
      this.config = d
      this.he = d.jsonfile
      this.jsDirectory = e
      this.pageImagePattern = d.pageImagePattern
      this.pageThumbImagePattern = d.pageThumbImagePattern
      this.pageSVGImagePattern = d.pageSVGImagePattern
      this.Sj = d.pageHighResImagePattern
      this.sf = d.DisableOverflow
      this.JSONPageDataFormat = this.Da = this.dimensions = null
      this.Oa = null != d.compressedJSONFormat ? d.compressedJSONFormat : !0
      this.ca = null
      this.tc = 'pageLoader_[pageNumber]'
      this.oa =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      this.qf = -1
      this.Ka = null
      this.pg = !1
      this.Ge = this.Bb = !0
      this.Qb = d.SVGMode
    }
    f.prototype = {
      Af: function () {
        return 'ImagePageRenderer'
      },
      Ra: function (c) {
        return c.H.J ? c.H.J.ia : ''
      },
      Ib: function (c) {
        return c.H.J.Bp
      },
      dispose: function () {
        jQuery(this.Ka).unbind()
        this.Ka.dispose()
        delete this.Ic
        this.Ic = null
        delete this.dimensions
        this.dimensions = null
        delete this.Ka
        this.Ka = null
        delete this.ca
        this.ca = null
      },
      initialize: function (c) {
        var d = this
        d.Ic = c
        d.Za = eb.platform.Za
        d.Oa
          ? (d.JSONPageDataFormat = {
              yg: 'width',
              xg: 'height',
              Tf: 'text',
              Nb: 'd',
              ji: 'f',
              Rc: 'l',
              $b: 't',
              ue: 'w',
              te: 'h',
            })
          : (d.JSONPageDataFormat = {
              yg: d.config.JSONPageDataFormat.pageWidth,
              xg: d.config.JSONPageDataFormat.pageHeight,
              Tf: d.config.JSONPageDataFormat.textCollection,
              Nb: d.config.JSONPageDataFormat.textFragment,
              ji: d.config.JSONPageDataFormat.textFont,
              Rc: d.config.JSONPageDataFormat.textLeft,
              $b: d.config.JSONPageDataFormat.textTop,
              ue: d.config.JSONPageDataFormat.textWidth,
              te: d.config.JSONPageDataFormat.textHeight,
            })
        d.Ka = new Ha(d.aa, d.Oa, d.JSONPageDataFormat, !0)
        jQuery.ajaxPrefilter(function (c, d, e) {
          if (c.onreadystatechange) {
            var f = c.xhr
            c.xhr = function () {
              function d() {
                c.onreadystatechange(h, e)
              }
              var h = f.apply(this, arguments)
              h.addEventListener
                ? h.addEventListener('readystatechange', d, !1)
                : setTimeout(function () {
                    var c = h.onreadystatechange
                    c &&
                      (h.onreadystatechange = function () {
                        d()
                        c.apply(this, arguments)
                      })
                  }, 0)
              return h
            }
          }
        })
        if (!eb.browser.msie && !eb.browser.safari && 6 > eb.browser.Zb) {
          var e = jQuery.ajaxSettings.xhr
          jQuery.ajaxSettings.xhr = function () {
            var c = e()
            c instanceof window.XMLHttpRequest &&
              c.addEventListener(
                'progress',
                function (c) {
                  c.lengthComputable &&
                    ((c = c.loaded / c.total),
                    jQuery('#toolbar').trigger('onProgressChanged', c))
                },
                !1
              )
            return c
          }
        }
        jQuery('#' + d.aa).trigger('onDocumentLoading')
        c = document.createElement('a')
        c.href = d.he
        c.search += 0 < c.search.length ? '&' : '?'
        c.search += 'callback=?'
        d.xs = !1
        jQuery(d).trigger('loadingProgress', { aa: d.aa, progress: 0.3 })
        0 < d.he.indexOf('{page}')
          ? ((d.Ba = !0),
            d.vf({
              url: d.fg(
                null != FLOWPAPER.CHUNK_SIZE ? FLOWPAPER.CHUNK_SIZE : 10
              ),
              dataType: d.config.JSONDataType,
              success: function (c) {
                var e
                jQuery(d).trigger('loadingProgress', {
                  aa: d.aa,
                  progress: 0.9,
                })
                if (c.e) {
                  var f = CryptoJS.ff.decrypt(
                    c.e,
                    CryptoJS.Hc.ef.parse(eb.Sg ? O() : eb.Be.innerHTML)
                  )
                  c = jQuery.parseJSON(f.toString(CryptoJS.Hc.Hg))
                  d.Xf = !0
                }
                if (0 < c.length) {
                  d.ca = Array(c[0].pages)
                  d.ua = c[0].detailed
                  for (f = 0; f < c.length; f++) {
                    ;(d.ca[f] = c[f]), (d.ca[f].loaded = !0)
                  }
                  for (f = 0; f < d.ca.length; f++) {
                    null == d.ca[f] && ((d.ca[f] = []), (d.ca[f].loaded = !1))
                  }
                  0 < d.ca.length &&
                    ((d.cb = d.ca[0].twofold), d.cb && (d.Za = 1))
                  if (d.ua) {
                    d.fd || (d.fd = {})
                    f = 5 > c.length ? c.length : 5
                    d.Of = []
                    for (var k = 0; k < f; k++) {
                      if (c[k].fonts && 0 < c[k].fonts.length) {
                        for (e = 0; e < c[k].fonts.length; e++) {
                          d.fd[c[k].fonts[e].name] ||
                            (ja(c[k].fonts[e].name, c[k].fonts[e].data),
                            d.Of.push(c[k].fonts[e].name))
                        }
                      } else {
                        var m = c[k].text
                        if (m && 0 < m.length) {
                          for (e = 0; e < m.length; e++) {
                            m[e][7] &&
                              !d.fd[m[e][7]] &&
                              -1 == d.Of.indexOf(m[e][7]) &&
                              0 == m[e][7].indexOf('g_font') &&
                              m[e][7] &&
                              d.Of.push(m[e][7])
                          }
                        }
                      }
                    }
                    d.Qh = 0
                    0 < d.Of.length
                      ? WebFont.load({
                          custom: { families: d.Of },
                          fontactive: function (c) {
                            d.Qh++
                            d.fd[c] = 'loaded'
                            jQuery(d).trigger('loadingProgress', {
                              aa: d.aa,
                              progress: d.Qh / d.Of.length,
                            })
                          },
                          fontinactive: function (c) {
                            d.Qh++
                            d.fd[c] = 'loaded'
                            jQuery(d).trigger('loadingProgress', {
                              aa: d.aa,
                              progress: d.Qh / d.Of.length,
                            })
                          },
                          inactive: function () {
                            d.Ic()
                            d.Ka.ld(c)
                          },
                          active: function () {
                            d.Ic()
                            d.Ka.ld(c)
                          },
                          timeout: 5000,
                        })
                      : (d.Ic(), d.Ka.ld(c))
                  } else {
                    d.Ic(), d.Ka.ld(c)
                  }
                }
              },
              error: function (c, e, f) {
                N(
                  'Error loading JSON file (' +
                    c.statusText +
                    ',' +
                    f +
                    '). Please check your configuration.',
                  'onDocumentLoadedError',
                  d.aa,
                  null != c.responseText &&
                    0 == c.responseText.indexOf('Error:')
                    ? c.responseText.substr(6)
                    : ''
                )
              },
            }))
          : d.vf({
              url: d.he,
              dataType: d.config.JSONDataType,
              success: function (c) {
                jQuery(d).trigger('loadingProgress', {
                  aa: d.aa,
                  progress: 0.9,
                })
                c.e &&
                  ((c = CryptoJS.ff.decrypt(
                    c.e,
                    CryptoJS.Hc.ef.parse(eb.Sg ? O() : eb.Be.innerHTML)
                  )),
                  (c = jQuery.parseJSON(c.toString(CryptoJS.Hc.Hg))),
                  (d.Xf = !0))
                d.ca = c
                for (var e = 0; e < c.length; e++) {
                  c[e].loaded = !0
                }
                d.Ic()
                d.Ka.ld(c)
              },
              onreadystatechange: function () {},
              error: function (c, e, f) {
                N(
                  'Error loading JSON file (' +
                    c.statusText +
                    ',' +
                    f +
                    '). Please check your configuration.',
                  'onDocumentLoadedError',
                  d.aa,
                  null != c.responseText &&
                    0 == c.responseText.indexOf('Error:')
                    ? c.responseText.substr(6)
                    : ''
                )
              },
            })
      },
      getDimensions: function (c, d) {
        var e = this.ca.length,
          e = 10 > this.ca.length ? this.ca.length : 10
        null == c && (c = 0)
        null == d && (d = e)
        if (null == this.dimensions || (d && c)) {
          for (
            null == this.dimensions && ((this.dimensions = []), (this.Da = [])),
              e = c;
            e < d;
            e++
          ) {
            this.ca[e].loaded
              ? ((this.dimensions[e] = []),
                this.Fm(e),
                null == this.Gc && (this.Gc = this.dimensions[e]))
              : null != this.Gc &&
                ((this.dimensions[e] = []),
                (this.dimensions[e].page = e),
                (this.dimensions[e].loaded = !1),
                (this.dimensions[e].width = this.Gc.width),
                (this.dimensions[e].height = this.Gc.height),
                (this.dimensions[e].xa = this.Gc.xa),
                (this.dimensions[e].Ga = this.Gc.Ga))
          }
        }
        return this.dimensions
      },
      Fm: function (c) {
        if (this.dimensions[c]) {
          this.dimensions[c].page = c
          this.dimensions[c].loaded = !0
          this.dimensions[c].width = this.ca[c][this.JSONPageDataFormat.yg]
          this.dimensions[c].height = this.ca[c][this.JSONPageDataFormat.xg]
          this.dimensions[c].xa = this.dimensions[c].width
          this.dimensions[c].Ga = this.dimensions[c].height
          this.Da[c] = []
          this.Da[c] = ''
          900 < this.dimensions[c].width &&
            ((this.dimensions[c].width = 918),
            (this.dimensions[c].height = 1188))
          for (
            var d = null, e = 0, g;
            (g = this.ca[c][this.JSONPageDataFormat.Tf][e++]);

          ) {
            this.Oa
              ? !isNaN(g[0].toString()) &&
                0 <= Number(g[0].toString()) &&
                !isNaN(g[1].toString()) &&
                0 <= Number(g[1].toString()) &&
                !isNaN(g[2].toString()) &&
                0 < Number(g[2].toString()) &&
                !isNaN(g[3].toString()) &&
                0 < Number(g[3].toString()) &&
                (d &&
                  Math.round(d[0]) != Math.round(g[0]) &&
                  Math.round(d[1]) == Math.round(g[1]) &&
                  (this.Da[c] += ' '),
                d &&
                  Math.round(d[0]) != Math.round(g[0]) &&
                  !this.Da[c].endsWith(' ') &&
                  (this.Da[c] += ' '),
                (d = /\\u([\d\w]{4})/gi),
                (d = (g[5] + '').replace(d, function (c, d) {
                  return String.fromCharCode(parseInt(d, 16))
                })),
                this.config.RTLMode || (this.Da[c] += d),
                this.config.RTLMode && (this.Da[c] += pa(d)))
              : !isNaN(g[this.JSONPageDataFormat.Rc].toString()) &&
                0 <= Number(g[this.JSONPageDataFormat.Rc].toString()) &&
                !isNaN(g[this.JSONPageDataFormat.$b].toString()) &&
                0 <= Number(g[this.JSONPageDataFormat.$b].toString()) &&
                !isNaN(g[this.JSONPageDataFormat.ue].toString()) &&
                0 < Number(g[this.JSONPageDataFormat.ue].toString()) &&
                !isNaN(g[this.JSONPageDataFormat.te].toString()) &&
                0 < Number(g[this.JSONPageDataFormat.te].toString()) &&
                (d &&
                  Math.round(d[this.JSONPageDataFormat.$b]) !=
                    Math.round(g[this.JSONPageDataFormat.$b]) &&
                  Math.round(d[this.JSONPageDataFormat.Rc]) ==
                    Math.round(prev[this.JSONPageDataFormat.Rc]) &&
                  (this.Da[c] += ' '),
                d &&
                  Math.round(d[this.JSONPageDataFormat.$b]) !=
                    Math.round(g[this.JSONPageDataFormat.$b]) &&
                  !this.Da[c].endsWith(' ') &&
                  (this.Da[c] += ' '),
                (d = /\\u([\d\w]{4})/gi),
                (d = (g[this.JSONPageDataFormat.Nb] + '').replace(
                  d,
                  function (c, d) {
                    return String.fromCharCode(parseInt(d, 16))
                  }
                )),
                this.config.RTLMode || (this.Da[c] += d),
                this.config.RTLMode && (this.Da[c] += pa(d))),
              (d = g)
          }
          this.Da[c] = this.Da[c].toLowerCase()
        }
      },
      fe: function (c) {
        this.yb = !1
        if ('Portrait' == c.I || 'SinglePage' == c.I) {
          'Portrait' == c.I && c.V(c.da).addClass('flowpaper_hidden'),
            this.Qb
              ? c
                  .V(c.Ea)
                  .append(
                    "<object data='" +
                      this.oa +
                      "' type='image/svg+xml' id='" +
                      c.page +
                      "' class='flowpaper_interactivearea " +
                      (this.config.DisableShadows ? '' : 'flowpaper_border') +
                      " flowpaper_grab flowpaper_hidden flowpaper_rescale' style='" +
                      c.getDimensions() +
                      "' /></div>"
                  )
              : this.ua
              ? c
                  .V(c.Ea)
                  .append(
                    "<canvas id='" +
                      c.page +
                      "' class='flowpaper_interactivearea " +
                      (this.config.DisableShadows ? '' : 'flowpaper_border') +
                      " flowpaper_grab flowpaper_hidden flowpaper_rescale' style='" +
                      c.getDimensions() +
                      ";background-size:cover;' />"
                  )
              : c
                  .V(c.Ea)
                  .append(
                    "<img alt='' src='" +
                      this.oa +
                      "' id='" +
                      c.page +
                      "' class='flowpaper_interactivearea " +
                      (this.config.DisableShadows ? '' : 'flowpaper_border') +
                      " flowpaper_grab flowpaper_hidden flowpaper_rescale' style='" +
                      c.getDimensions() +
                      ";background-size:cover;' />"
                  ),
            'SinglePage' == c.I && 0 == c.pageNumber && this.Uh(c, c.da)
        }
        'ThumbView' == c.I &&
          jQuery(c.da).append(
            "<img src='" +
              this.oa +
              "' alt='" +
              this.pa(c.pageNumber + 1) +
              "'  id='" +
              c.page +
              "' class='flowpaper_hidden' style='" +
              c.getDimensions() +
              "'/>"
          )
        c.I == this.Ra(c) && this.Ib(c).fe(this, c)
        if ('TwoPage' == c.I || 'BookView' == c.I) {
          0 == c.pageNumber &&
            (jQuery(c.da + '_1').append(
              "<img id='" +
                c.tc +
                "_1' class='flowpaper_pageLoader' src='" +
                c.H.Ce +
                "' style='position:absolute;left:50%;top:" +
                c.Pa() / 4 +
                "px;margin-left:-32px;' />"
            ),
            jQuery(c.da + '_1').append(
              "<img src='" +
                this.oa +
                "' alt='" +
                this.pa(c.pageNumber + 1) +
                "'  id='" +
                c.page +
                "' class='flowpaper_interactivearea flowpaper_grab flowpaper_hidden flowpaper_load_on_demand' style='" +
                c.getDimensions() +
                ";position:absolute;background-size:cover;'/>"
            ),
            jQuery(c.da + '_1').append(
              "<div id='" +
                c.ja +
                "_1_textoverlay' style='position:relative;left:0px;top:0px;width:100%;height:100%;'></div>"
            )),
            1 == c.pageNumber &&
              (jQuery(c.da + '_2').append(
                "<img id='" +
                  c.tc +
                  "_2' class='flowpaper_pageLoader' src='" +
                  c.H.Ce +
                  "' style='position:absolute;left:50%;top:" +
                  c.Pa() / 4 +
                  "px;margin-left:-32px;' />"
              ),
              jQuery(c.da + '_2').append(
                "<img src='" +
                  this.oa +
                  "' alt='" +
                  this.pa(c.pageNumber + 1) +
                  "'  id='" +
                  c.page +
                  "' class='flowpaper_interactivearea flowpaper_grab flowpaper_hidden flowpaper_load_on_demand' style='" +
                  c.getDimensions() +
                  ";position:absolute;left:0px;top:0px;background-size:cover;'/>"
              ),
              jQuery(c.da + '_2').append(
                "<div id='" +
                  c.ja +
                  "_2_textoverlay' style='position:absolute;left:0px;top:0px;width:100%;height:100%;'></div>"
              ))
        }
      },
      vf: function (c) {
        var d = this
        if (d.config.FilesBlobURI) {
          fetch(d.config.FilesBlobURI(c.url)).then(function (d) {
            d.arrayBuffer().then(function (d) {
              d = new Uint8Array(d)
              d = pako.inflate(d, { to: 'string' })
              'undefined' !== typeof Response
                ? P(d).then(function (d) {
                    c.success(d)
                  })
                : c.success(JSON.parse(d))
            })
          })
        } else {
          if (!d.config.FilesBlobURI && 'lz' == d.config.JSONDataType) {
            if (
              'undefined' === typeof Worker ||
              (eb.browser.msie && 11 > eb.browser.version)
            ) {
              ya(c.url, function (d, e) {
                requestAnim(function () {
                  var d =
                      'undefined' != typeof Uint8Array ? new Uint8Array(e) : e,
                    d = pako.inflate(d, { to: 'string' })
                  'undefined' !== typeof Response
                    ? P(d).then(function (d) {
                        c.success(d)
                      })
                    : c.success(JSON.parse(d))
                }, 10)
              })
            } else {
              var e = document.location.href.substr(
                0,
                document.location.href.lastIndexOf('/') + 1
              )
              ;-1 == c.url.indexOf('http') && (c.url = e + c.url)
              d.Jb || (d.Jb = {})
              d.Jb[c.url] = c
              if (!d.Hf) {
                try {
                  var g =
                    ('undefined' != d.jsDirectory && null != d.jsDirectory
                      ? d.jsDirectory
                      : 'js/') + 'flowpaper.worker.js'
                  if (
                    'undefined' != d.jsDirectory &&
                    0 == d.jsDirectory.indexOf('http')
                  ) {
                    var h = new Blob(
                        [
                          'importScripts(' +
                            JSON.stringify(
                              ('undefined' != d.jsDirectory &&
                              null != d.jsDirectory
                                ? d.jsDirectory
                                : 'js/') + 'flowpaper.worker.js'
                            ) +
                            ')',
                        ],
                        { type: 'application/javascript' }
                      ),
                      g = window.URL.createObjectURL(h)
                  }
                  d.Hf = new Worker(g)
                } catch (f) {
                  ya(c.url, function (d, e) {
                    requestAnim(function () {
                      var d =
                          'undefined' != typeof Uint8Array
                            ? new Uint8Array(e)
                            : e,
                        d = pako.inflate(d, { to: 'string' })
                      'undefined' !== typeof Response
                        ? P(d).then(function (d) {
                            c.success(d)
                          })
                        : c.success(JSON.parse(d))
                    }, 10)
                  })
                }
                d.Hf.addEventListener(
                  'message',
                  function (c) {
                    d.Jb[c.data.url] &&
                      ('undefined' !== typeof Response
                        ? P(c.data.JSON).then(function (e) {
                            d.Jb[c.data.url] &&
                              (d.Jb[c.data.url].success(e),
                              (d.Jb[c.data.url] = null))
                          })
                        : d.Jb[c.data.url] &&
                          (d.Jb[c.data.url].success(JSON.parse(c.data.JSON)),
                          (d.Jb[c.data.url] = null)))
                  },
                  !1
                )
              }
              d.Hf.postMessage(c.url)
            }
          } else {
            if (!d.config.FilesBlobURI) {
              return jQuery.ajax(c)
            }
          }
        }
      },
      fg: function (c) {
        return this.he.replace('{page}', c)
      },
      pa: function (c, d, e) {
        this.config.RTLMode &&
          this.ca &&
          this.ca.length &&
          (c = this.ca.length - c + 1)
        this.config.PageIndexAdjustment &&
          (c += this.config.PageIndexAdjustment)
        this.Xf &&
          (c = CryptoJS.ff
            .encrypt(
              c.toString(),
              CryptoJS.Hc.ef.parse(eb.Sg ? O() : eb.Be.innerHTML)
            )
            .toString())
        return !e || (e && !this.pageSVGImagePattern)
          ? d
            ? null != this.pageThumbImagePattern &&
              0 < this.pageThumbImagePattern.length
              ? 0 < this.pageThumbImagePattern.indexOf('?')
                ? this.config.FilesBlobURI
                  ? this.config.FilesBlobURI(
                      this.pageThumbImagePattern.replace('{page}', c) +
                        '&resolution=' +
                        d
                    )
                  : this.pageThumbImagePattern.replace('{page}', c) +
                    '&resolution=' +
                    d
                : this.config.FilesBlobURI
                ? this.config.FilesBlobURI(
                    this.pageThumbImagePattern.replace('{page}', c) +
                      '?resolution=' +
                      d
                  )
                : this.pageThumbImagePattern.replace('{page}', c) +
                  '?resolution=' +
                  d
              : 0 < this.pageImagePattern.ThumbIMGFiles('?')
              ? this.config.FilesBlobURI
                ? this.config.FilesBlobURI(
                    this.pageImagePattern.replace('{page}', c) +
                      '&resolution=' +
                      d
                  )
                : this.pageImagePattern.replace('{page}', c) +
                  '&resolution=' +
                  d
              : this.config.FilesBlobURI
              ? this.config.FilesBlobURI(
                  this.pageImagePattern.replace('{page}', c) +
                    '?resolution=' +
                    d
                )
              : this.pageImagePattern.replace('{page}', c) + '?resolution=' + d
            : this.config.FilesBlobURI
            ? this.config.FilesBlobURI(
                this.pageImagePattern.replace('{page}', c)
              )
            : this.pageImagePattern.replace('{page}', c)
          : d
          ? null != this.pageThumbImagePattern &&
            0 < this.pageThumbImagePattern.length
            ? this.pageThumbImagePattern.replace('{page}', c)
            : 0 < this.pageSVGImagePattern.indexOf('?')
            ? this.pageSVGImagePattern.replace('{page}', c) + '&resolution=' + d
            : this.pageSVGImagePattern.replace('{page}', c) + '?resolution=' + d
          : this.pageSVGImagePattern.replace('{page}', c)
      },
      bc: function (c, d) {
        return this.Sj.replace('{page}', c).replace('{sector}', d)
      },
      lg: function (c) {
        var d = null != FLOWPAPER.CHUNK_SIZE ? FLOWPAPER.CHUNK_SIZE : 10
        this.config.RTLMode &&
          this.ca &&
          this.ca.length &&
          (c = this.ca.length - c)
        return 0 === d ? c : c + (d - (c % d))
      },
      Kc: function (c, d, e) {
        var g = this
        g.Jd != g.lg(c) &&
          ((g.Jd = g.lg(c)),
          g.vf({
            url: g.fg(g.Jd),
            dataType: g.config.JSONDataType,
            async: d,
            success: function (c) {
              c.e &&
                ((c = CryptoJS.ff.decrypt(
                  c.e,
                  CryptoJS.Hc.ef.parse(eb.Sg ? O() : eb.Be.innerHTML)
                )),
                (c = jQuery.parseJSON(c.toString(CryptoJS.Hc.Hg))),
                (g.Xf = !0))
              if (0 < c.length) {
                for (var d = 0; d < c.length; d++) {
                  var f = parseInt(c[d].number) - 1
                  g.ca[f] = c[d]
                  g.ca[f].loaded = !0
                  g.Fm(f)
                }
                g.Ka.ld(g.ca)
                jQuery(g).trigger('onTextDataUpdated', c[0].number)
                null != e && e()
              }
              g.Jd = null
            },
            error: function (c) {
              N(
                'Error loading JSON file (' +
                  c.statusText +
                  '). Please check your configuration.',
                'onDocumentLoadedError',
                g.aa
              )
              g.Jd = null
            },
          }))
      },
      Ia: function (c) {
        return c.qf
      },
      Qa: function (c, d) {
        c.qf = d
      },
      ic: function (c, d, e) {
        var g = this
        if (c.I != g.Ra(c) && -1 < g.Ia(c)) {
          window.clearTimeout(c.Cc),
            (c.Cc = setTimeout(function () {
              g.ic(c, d, e)
            }, 250))
        } else {
          if (
            g.ua &&
            c.I != g.Ra(c) &&
            ((!g.sf && c.Rl != c.scale) ||
              (g.sf && !c.Sl) ||
              'SinglePage' == c.I) &&
            ('Portrait' == c.I || 'SinglePage' == c.I)
          ) {
            'SinglePage' != c.I
              ? g.Qa(c, c.pageNumber)
              : 0 <= g.Ia(c) &&
                jQuery(c.Aa).css(
                  'background-image',
                  "url('" + g.pa(c.pages.Z + 1) + "')"
                )
            var h = jQuery(c.Aa).get(0),
              f = 1.5 < g.Za ? g.Za : 1.5
            g.sf && (f = 2)
            h.width = jQuery(h).width() * f
            h.height = jQuery(h).height() * f
            c.Rl = c.scale
            jQuery(h).data('needs-overlay', 1)
            c.Sl || (c.Sl = !0)
            g.sf
              ? ((c.ga = new Image()),
                jQuery(c.ga).bind('load', function () {
                  var d = jQuery(c.Aa).get(0)
                  d.getContext('2d').drawImage(c.ga, 0, 0, d.width, d.height)
                  c.Qd(d).then(
                    function () {
                      jQuery('#' + g.aa).trigger(
                        'onPageLoaded',
                        c.pageNumber + 1
                      )
                    },
                    function () {}
                  )
                }),
                jQuery(c.ga).attr(
                  'src',
                  g.pa(c.pageNumber + 1, 'ThumbView' == c.I ? 200 : null)
                ))
              : c.Qd(h).then(
                  function () {},
                  function () {}
                )
          }
          if (!c.va || c.I == g.Ra(c)) {
            f = c.fh
            if (
              'Portrait' == c.I ||
              'SinglePage' == c.I ||
              'TwoPage' == c.I ||
              'BookView' == c.I ||
              c.I == g.Ra(c)
            ) {
              var k = c.Fa(),
                m = c.Pa(),
                h = c.qc()
              0 == jQuery('#' + f).length
                ? ((f =
                    "<div id='" +
                    f +
                    "' class='flowpaper_textLayer' style='width:" +
                    k +
                    'px;height:' +
                    m +
                    'px;margin-left:' +
                    h +
                    "px;'></div>"),
                  'Portrait' == c.I || g.Ra(c) || 'SinglePage' == c.I
                    ? jQuery(c.Ea).append(f)
                    : ('TwoPage' != c.I && 'BookView' != c.I) ||
                      jQuery(c.Ea + '_' + ((c.pageNumber % 2) + 1)).append(f))
                : jQuery('#' + f).css({ width: k, height: m, 'margin-left': h })
              if (90 == c.rotation || 270 == c.rotation || 180 == c.rotation) {
                jQuery(c.Mb).css({ 'z-index': 11, 'margin-left': h }),
                  jQuery(c.Mb).transition(
                    { rotate: c.rotation, translate: '-' + h + 'px, 0px' },
                    0
                  )
              }
            }
            if ('Portrait' == c.I || 'ThumbView' == c.I) {
              c.va ||
                (jQuery(c.Aa).attr('src') != g.oa && !g.Qb && !g.ua) ||
                c.Bf ||
                (g.Qa(c, c.pageNumber),
                c.dimensions.loaded ||
                  g.Kc(c.pageNumber + 1, !0, function () {
                    g.Wc(c)
                  }),
                c.md(),
                (g.ga = new Image()),
                jQuery(g.ga)
                  .bind('load', function () {
                    c.Bf = !0
                    c.Ef = this.height
                    c.Ff = this.width
                    g.kd(c)
                    c.dimensions.xa > c.dimensions.width &&
                      ((c.dimensions.width = c.dimensions.xa),
                      (c.dimensions.height = c.dimensions.Ga),
                      ('Portrait' != c.I && 'SinglePage' != c.I) || c.Ya())
                  })
                  .bind('error', function () {
                    N(
                      'Error loading image (' + this.src + ')',
                      'onErrorLoadingPage',
                      g.aa,
                      c.pageNumber
                    )
                  }),
                jQuery(g.ga).bind('error', function () {
                  g.Qa(c, -1)
                }),
                jQuery(g.ga).attr(
                  'src',
                  g.pa(c.pageNumber + 1, 'ThumbView' == c.I ? 200 : null)
                )),
                !c.va && jQuery(c.Aa).attr('src') == g.oa && c.Bf && g.kd(c),
                null != e && e()
            }
            c.I == g.Ra(c) &&
              ((h = g.config.RTLMode
                ? g.ca.length - c.pageNumber
                : c.pageNumber),
              ((!c.dimensions.loaded &&
                (!g.dimensions[h - 1].loaded ||
                  (g.getNumPages() == c.pageNumber + 1 &&
                    0 == g.getNumPages() % 2))) ||
                (g.config.RTLMode && !g.dimensions[h - 1].loaded)) &&
                g.Kc(c.pageNumber + 1, !0, function () {
                  g.Wc(c)
                }),
              g.Ib(c).ic(g, c, d, e))
            'SinglePage' == c.I &&
              (c.Lc || (c.md(), (c.Lc = !0)),
              0 == c.pageNumber &&
                (g.Qa(c, c.pages.Z),
                g.getDimensions()[g.Ia(c)].loaded ||
                  g.Kc(g.Ia(c) + 1, !0, function () {
                    g.Wc(c)
                  }),
                (g.ga = new Image()),
                jQuery(g.ga).bind('load', function () {
                  c.Bf = !0
                  c.Ef = this.height
                  c.Ff = this.width
                  c.ec()
                  g.kd(c)
                  c.dimensions.xa > c.dimensions.width &&
                    ((c.dimensions.width = c.dimensions.xa),
                    (c.dimensions.height = c.dimensions.Ga),
                    c.Ya())
                  c.va ||
                    jQuery('#' + g.aa).trigger('onPageLoaded', c.pageNumber + 1)
                  c.va = !0
                  g.Qa(c, -1)
                }),
                jQuery(g.ga).bind('error', function () {
                  c.ec()
                  g.Qa(c, -1)
                }),
                jQuery(g.ga).attr('src', g.pa(c.pages.Z + 1)),
                jQuery(c.da + '_1').removeClass('flowpaper_load_on_demand'),
                null != e && e()))
            if ('TwoPage' == c.I || 'BookView' == c.I) {
              c.Lc || (c.md(), (c.Lc = !0)),
                0 == c.pageNumber
                  ? (jQuery(c.Aa),
                    'BookView' == c.I
                      ? g.Qa(c, 0 != c.pages.Z ? c.pages.Z : c.pages.Z + 1)
                      : 'TwoPage' == c.I && g.Qa(c, c.pages.Z),
                    g.getDimensions()[g.Ia(c) - 1] &&
                      !g.getDimensions()[g.Ia(c) - 1].loaded &&
                      g.Kc(g.Ia(c) + 1, !0, function () {
                        g.Wc(c)
                      }),
                    (g.ga = new Image()),
                    jQuery(g.ga).bind('load', function () {
                      c.Bf = !0
                      c.Ef = this.height
                      c.Ff = this.width
                      c.ec()
                      g.kd(c)
                      c.dimensions.xa > c.dimensions.width &&
                        ((c.dimensions.width = c.dimensions.xa),
                        (c.dimensions.height = c.dimensions.Ga),
                        c.Ya())
                      c.va ||
                        jQuery('#' + g.aa).trigger(
                          'onPageLoaded',
                          c.pageNumber + 1
                        )
                      c.va = !0
                      g.Qa(c, -1)
                    }),
                    jQuery(g.ga).bind('error', function () {
                      c.ec()
                      g.Qa(c, -1)
                    }),
                    'BookView' == c.I &&
                      jQuery(g.ga).attr(
                        'src',
                        g.pa(0 != c.pages.Z ? c.pages.Z : c.pages.Z + 1)
                      ),
                    'TwoPage' == c.I &&
                      jQuery(g.ga).attr('src', g.pa(c.pages.Z + 1)),
                    jQuery(c.da + '_1').removeClass('flowpaper_load_on_demand'),
                    null != e && e())
                  : 1 == c.pageNumber &&
                    ((h = jQuery(c.Aa)),
                    c.pages.Z + 1 > c.pages.getTotalPages()
                      ? h.attr('src', '')
                      : (0 != c.pages.Z || 'TwoPage' == c.I
                          ? (g.Qa(c, c.pages.Z + 1),
                            (g.ga = new Image()),
                            jQuery(g.ga).bind('load', function () {
                              c.ec()
                              g.kd(c)
                              c.dimensions.xa > c.dimensions.width &&
                                ((c.dimensions.width = c.dimensions.xa),
                                (c.dimensions.height = c.dimensions.Ga))
                              c.va ||
                                jQuery('#' + g.aa).trigger(
                                  'onPageLoaded',
                                  c.pageNumber + 1
                                )
                              c.va = !0
                              g.Qa(c, -1)
                            }),
                            jQuery(g.ga).bind('error', function () {
                              g.Qa(c, -1)
                              c.ec()
                            }))
                          : c.ec(),
                        'BookView' == c.I &&
                          jQuery(g.ga).attr('src', g.pa(c.pages.Z + 1)),
                        'TwoPage' == c.I &&
                          jQuery(g.ga).attr('src', g.pa(c.pages.Z + 2)),
                        1 < c.pages.Z &&
                          jQuery(c.da + '_2').removeClass('flowpaper_hidden'),
                        jQuery(c.da + '_2').removeClass(
                          'flowpaper_load_on_demand'
                        )),
                    null != e && e())
            }
          }
        }
      },
      kd: function (c) {
        if (
          'Portrait' != c.I ||
          (Math.round((c.Ff / c.Ef) * 100) ==
            Math.round((c.dimensions.width / c.dimensions.height) * 100) &&
            !this.Qb) ||
          (eb.browser.msie && 9 > eb.browser.version)
        ) {
          c.I == this.Ra(c)
            ? this.Ib(c).kd(this, c)
            : 'TwoPage' == c.I || 'BookView' == c.I
            ? (0 == c.pageNumber &&
                ((d =
                  'BookView' == c.I
                    ? 0 != c.pages.Z
                      ? c.pages.Z
                      : c.pages.Z + 1
                    : c.pages.Z + 1),
                c.di != d &&
                  (eb.browser.msie || (eb.browser.safari && 5 > eb.browser.Zb)
                    ? jQuery(c.Aa).attr('src', this.pa(d))
                    : jQuery(c.Aa).css(
                        'background-image',
                        "url('" + this.pa(d) + "')"
                      ),
                  jQuery(c.da + '_1').removeClass('flowpaper_hidden'),
                  (c.di = d)),
                jQuery(c.Aa).removeClass('flowpaper_hidden')),
              1 == c.pageNumber &&
                ((d = 'BookView' == c.I ? c.pages.Z + 1 : c.pages.Z + 2),
                c.di != d &&
                  (eb.browser.msie || (eb.browser.safari && 5 > eb.browser.Zb)
                    ? jQuery(c.Aa).attr('src', this.pa(d))
                    : jQuery(c.Aa).css(
                        'background-image',
                        "url('" + this.pa(d) + "')"
                      ),
                  (c.di = d),
                  'TwoPage' == c.I &&
                    jQuery(c.da + '_2').removeClass('flowpaper_hidden')),
                jQuery(c.Aa).removeClass('flowpaper_hidden')),
              c.va ||
                jQuery('#' + this.aa).trigger('onPageLoaded', c.pageNumber + 1),
              (c.va = !0))
            : 'SinglePage' == c.I
            ? (this.ua
                ? jQuery(c.Aa).css(
                    'background-image',
                    "url('" + this.pa(this.Ia(c) + 1) + "')"
                  )
                : jQuery(c.Aa).attr('src', this.pa(this.Ia(c) + 1)),
              jQuery('#' + c.tc).hide(),
              c.va ||
                jQuery('#' + this.aa).trigger('onPageLoaded', c.pageNumber + 1),
              (c.va = !0))
            : this.sf
            ? this.sf &&
              (jQuery('#' + c.tc).hide(),
              c.va ||
                jQuery('#' + this.aa).trigger('onPageLoaded', c.pageNumber + 1),
              (c.va = !0))
            : (this.Qb
                ? (jQuery(c.Aa).attr(
                    'data',
                    this.pa(c.pageNumber + 1, null, !0)
                  ),
                  jQuery(c.da).removeClass('flowpaper_load_on_demand'))
                : this.ua
                ? jQuery(c.Aa).css(
                    'background-image',
                    "url('" + this.pa(c.pageNumber + 1) + "')"
                  )
                : jQuery(c.Aa).attr(
                    'src',
                    this.pa(c.pageNumber + 1),
                    'ThumbView' == c.I ? 200 : null
                  ),
              jQuery('#' + c.tc).hide(),
              c.va ||
                jQuery('#' + this.aa).trigger('onPageLoaded', c.pageNumber + 1),
              (c.va = !0))
        } else {
          if (this.Qb) {
            jQuery(c.Aa).attr('data', this.pa(c.pageNumber + 1, null, !0)),
              jQuery(c.da).removeClass('flowpaper_load_on_demand'),
              jQuery(c.Aa).css('width', jQuery(c.Aa).css('width'))
          } else {
            if (this.sf && this.ua) {
              var d = jQuery(c.Aa).css('background-image')
              0 < d.length && 'none' != d
                ? (jQuery(c.Aa).css(
                    'background-image',
                    d + ",url('" + this.pa(c.pageNumber + 1) + "')"
                  ),
                  jQuery('#' + this.aa).trigger(
                    'onPageLoaded',
                    c.pageNumber + 1
                  ),
                  ca(jQuery(c.Aa).get(0)))
                : jQuery(c.Aa).css(
                    'background-image',
                    "url('" + this.pa(c.pageNumber + 1) + "')"
                  )
            } else {
              jQuery(c.Aa).css(
                'background-image',
                "url('" + this.pa(c.pageNumber + 1) + "')"
              ),
                jQuery(c.Aa).attr('src', this.oa)
            }
          }
          jQuery('#' + c.tc).hide()
          c.va ||
            this.ua ||
            jQuery('#' + this.aa).trigger('onPageLoaded', c.pageNumber + 1)
          c.va = !0
        }
        this.Qa(c, -1)
        this.pg || ((this.pg = !0), c.H.bi())
      },
      xm: function (c) {
        'TwoPage' == c.I || 'BookView' == c.I
          ? (0 == c.pageNumber &&
              jQuery(c.ra).css('background-image', 'url(' + this.oa + ')'),
            1 == c.pageNumber &&
              jQuery(c.ra).css('background-image', 'url(' + this.oa + ')'))
          : jQuery(c.ra).css('background-image', 'url(' + this.oa + ')')
      },
      Gb: function (c) {
        jQuery(c.da).addClass('flowpaper_load_on_demand')
        var d = null
        if ('Portrait' == c.I || 'ThumbView' == c.I || 'SinglePage' == c.I) {
          d = jQuery(c.Aa)
        }
        if ('TwoPage' == c.I || 'BookView' == c.I) {
          ;(d = jQuery(c.Aa)), jQuery(c.Aa).addClass('flowpaper_hidden')
        }
        c.I == this.Ra(c) && this.Ib(c).Gb(this, c)
        null != d &&
          0 < d.length &&
          (d.attr('alt', d.attr('src')),
          d.attr(
            'src',
            'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
          ))
        c.Lc = !1
        c.di = -1
        jQuery(
          '.flowpaper_pageword_' +
            this.aa +
            '_page_' +
            c.pageNumber +
            ':not(.flowpaper_selected_searchmatch, .flowpaper_annotation_' +
            this.aa +
            ')'
        ).remove()
        c.Xj && c.Xj()
        jQuery(
          '.flowpaper_annotation_' + this.aa + '_page_' + c.pageNumber
        ).remove()
        c.ph && c.ph()
      },
      getNumPages: function () {
        return 10 > this.ca.length ? this.ca.length : 10
      },
      Wc: function (c, d, e, g) {
        this.Ka.Wc(c, d, e, g)
      },
      Vc: function (c, d, e, g) {
        this.Ka.Vc(c, d, e, g)
      },
      gf: function (c, d, e, g) {
        this.Ka.gf(c, d, e, g)
      },
      Na: function (c, d, e) {
        this.Ka.Na(c, e)
      },
      Uh: function (c, d) {
        if (this.yb) {
          if (c.scale < c.Wg()) {
            ;(c.Sm = d), (c.Tm = !1)
          } else {
            !d && c.Sm && (d = c.Sm)
            var e = 0.25 * Math.round(c.sj()),
              g = 0.25 * Math.round(c.rj())
            jQuery(
              '.flowpaper_flipview_canvas_highres_' + c.pageNumber
            ).remove()
            null == d && (d = c.da)
            var h =
              eb.platform.ge || eb.platform.android
                ? 'flowpaper_flipview_canvas_highres'
                : c.ja + '_canvas_highres'
            jQuery(d).append(
              String.format(
                "<div id='" +
                  c.ja +
                  "_canvas_highres_l1t1' class='{4}' style='z-index:11;position:relative;float:left;background-repeat:no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;clear:both;'></div>",
                0,
                0,
                e,
                g,
                h
              ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_l2t1' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;'></div>",
                  e + 0 + 0,
                  0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_r1t1' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;'></div>",
                  2 * e + 0,
                  0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_r2t1' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;'></div>",
                  3 * e + 0,
                  0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_l1t2' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;clear:both;'></div>",
                  0,
                  g + 0 + 0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_l2t2' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;'></div>",
                  e + 0 + 0,
                  g + 0 + 0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_r1t2' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;'></div>",
                  2 * e + 0,
                  g + 0 + 0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_r2t2' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;'></div>",
                  3 * e + 0,
                  g + 0 + 0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_l1b1' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;clear:both;'></div>",
                  0,
                  2 * g + 0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_l2b1' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;'></div>",
                  e + 0 + 0,
                  2 * g + 0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_r1b1' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;'></div>",
                  2 * e + 0,
                  2 * g + 0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_r2b1' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;'></div>",
                  3 * e + 0,
                  2 * g + 0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_l1b2' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;clear:both;'></div>",
                  0,
                  3 * g + 0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_l2b2' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;'></div>",
                  e + 0 + 0,
                  3 * g + 0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_r1b2' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;'></div>",
                  2 * e + 0,
                  3 * g + 0,
                  e,
                  g,
                  h
                ) +
                String.format(
                  "<div id='" +
                    c.ja +
                    "_canvas_highres_r2b2' class='{4}' style='z-index:11;position:relative;float:left;background-repeat-no-repeat;background-size:100% 100%;width:{2}px;height:{3}px;'></div>",
                  3 * e + 0,
                  3 * g + 0,
                  e,
                  g,
                  h
                ) +
                ''
            )
            c.Tm = !0
          }
        }
      },
      hd: function (c) {
        if (!(c.scale < c.Wg())) {
          !c.Tm && this.yb && this.Uh(c)
          if (this.yb) {
            var d = document.getElementById(c.ja + '_canvas_highres_l1t1'),
              e = document.getElementById(c.ja + '_canvas_highres_l2t1'),
              g = document.getElementById(c.ja + '_canvas_highres_l1t2'),
              h = document.getElementById(c.ja + '_canvas_highres_l2t2'),
              f = document.getElementById(c.ja + '_canvas_highres_r1t1'),
              k = document.getElementById(c.ja + '_canvas_highres_r2t1'),
              m = document.getElementById(c.ja + '_canvas_highres_r1t2'),
              p = document.getElementById(c.ja + '_canvas_highres_r2t2'),
              n = document.getElementById(c.ja + '_canvas_highres_l1b1'),
              t = document.getElementById(c.ja + '_canvas_highres_l2b1'),
              q = document.getElementById(c.ja + '_canvas_highres_l1b2'),
              r = document.getElementById(c.ja + '_canvas_highres_l2b2'),
              u = document.getElementById(c.ja + '_canvas_highres_r1b1'),
              v = document.getElementById(c.ja + '_canvas_highres_r2b1'),
              A = document.getElementById(c.ja + '_canvas_highres_r1b2'),
              x = document.getElementById(c.ja + '_canvas_highres_r2b2')
            if (
              (1 == c.pageNumber && 1 == c.pages.Z) ||
              c.pageNumber == c.pages.Z - 1 ||
              c.pageNumber == c.pages.Z - 2
            ) {
              var w = c.I == this.Ra(c) ? c.pages.L : null,
                B = c.I == this.Ra(c) ? c.pageNumber + 1 : c.pages.Z + 1
              jQuery(d).visible(!0, w) &&
                'none' === jQuery(d).css('background-image') &&
                jQuery(d).css(
                  'background-image',
                  "url('" + this.bc(B, 'l1t1') + "')"
                )
              jQuery(e).visible(!0, w) &&
                'none' === jQuery(e).css('background-image') &&
                jQuery(e).css(
                  'background-image',
                  "url('" + this.bc(B, 'l2t1') + "')"
                )
              jQuery(g).visible(!0, w) &&
                'none' === jQuery(g).css('background-image') &&
                jQuery(g).css(
                  'background-image',
                  "url('" + this.bc(B, 'l1t2') + "')"
                )
              jQuery(h).visible(!0, w) &&
                'none' === jQuery(h).css('background-image') &&
                jQuery(h).css(
                  'background-image',
                  "url('" + this.bc(B, 'l2t2') + "')"
                )
              jQuery(f).visible(!0, w) &&
                'none' === jQuery(f).css('background-image') &&
                jQuery(f).css(
                  'background-image',
                  "url('" + this.bc(B, 'r1t1') + "')"
                )
              jQuery(k).visible(!0, w) &&
                'none' === jQuery(k).css('background-image') &&
                jQuery(k).css(
                  'background-image',
                  "url('" + this.bc(B, 'r2t1') + "')"
                )
              jQuery(m).visible(!0, w) &&
                'none' === jQuery(m).css('background-image') &&
                jQuery(m).css(
                  'background-image',
                  "url('" + this.bc(B, 'r1t2') + "')"
                )
              jQuery(p).visible(!0, w) &&
                'none' === jQuery(p).css('background-image') &&
                jQuery(p).css(
                  'background-image',
                  "url('" + this.bc(B, 'r2t2') + "')"
                )
              jQuery(n).visible(!0, w) &&
                'none' === jQuery(n).css('background-image') &&
                jQuery(n).css(
                  'background-image',
                  "url('" + this.bc(B, 'l1b1') + "')"
                )
              jQuery(t).visible(!0, w) &&
                'none' === jQuery(t).css('background-image') &&
                jQuery(t).css(
                  'background-image',
                  "url('" + this.bc(B, 'l2b1') + "')"
                )
              jQuery(q).visible(!0, w) &&
                'none' === jQuery(q).css('background-image') &&
                jQuery(q).css(
                  'background-image',
                  "url('" + this.bc(B, 'l1b2') + "')"
                )
              jQuery(r).visible(!0, w) &&
                'none' === jQuery(r).css('background-image') &&
                jQuery(r).css(
                  'background-image',
                  "url('" + this.bc(B, 'l2b2') + "')"
                )
              jQuery(u).visible(!0, w) &&
                'none' === jQuery(u).css('background-image') &&
                jQuery(u).css(
                  'background-image',
                  "url('" + this.bc(B, 'r1b1') + "')"
                )
              jQuery(v).visible(!0, w) &&
                'none' === jQuery(v).css('background-image') &&
                jQuery(v).css(
                  'background-image',
                  "url('" + this.bc(B, 'r2b1') + "')"
                )
              jQuery(A).visible(!0, w) &&
                'none' === jQuery(A).css('background-image') &&
                jQuery(A).css(
                  'background-image',
                  "url('" + this.bc(B, 'r1b2') + "')"
                )
              jQuery(x).visible(!0, w) &&
                'none' === jQuery(x).css('background-image') &&
                jQuery(x).css(
                  'background-image',
                  "url('" + this.bc(B, 'r2b2') + "')"
                )
            }
          }
          c.vm = !0
        }
      },
      Yc: function (c) {
        if (this.yb) {
          var d =
            eb.platform.ge || eb.platform.android
              ? 'flowpaper_flipview_canvas_highres'
              : c.ja + '_canvas_highres'
          c.vm &&
            0 < jQuery('.' + d).length &&
            (jQuery('.' + d).css('background-image', ''), (c.vm = !1))
        }
      },
    }
    return f
  })()),
  CanvasPageRenderer = (window.CanvasPageRenderer = (function () {
    function f(c, d, e, g) {
      this.aa = c
      this.file = d
      this.jsDirectory = e
      this.initialized = !1
      this.JSONPageDataFormat = this.Ja = this.dimensions = null
      this.pageThumbImagePattern = g.pageThumbImagePattern
      this.pageImagePattern = g.pageImagePattern
      this.config = g
      this.Kh = this.aa + '_dummyPageCanvas_[pageNumber]'
      this.cj = '#' + this.Kh
      this.Lh = this.aa + 'dummyPageCanvas2_[pageNumber]'
      this.dj = '#' + this.Lh
      this.wb = []
      this.context = this.ra = null
      this.ab = []
      this.ii = []
      this.Bb = this.pg = !1
      this.oa =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      this.$h = 1
      this.Da = []
      this.gh = {}
      this.JSONPageDataFormat = null
      this.Ge = !0
      this.Oa = null != g.compressedJSONFormat ? g.compressedJSONFormat : !0
      this.Ri = []
    }
    f.prototype = {
      Af: function () {
        return 'CanvasPageRenderer'
      },
      Ra: function (c) {
        return c.H ? (c.H.J ? c.H.J.ia : '') : !1
      },
      Ib: function (c) {
        return c.H.J.Go
      },
      dispose: function () {
        jQuery(this.Ka).unbind()
        this.Ka.dispose()
        delete this.Ic
        this.Ic = null
        delete this.dimensions
        this.dimensions = null
        delete this.Ka
        this.Ka = null
        delete this.ab
        this.ab = null
        delete this.ii
        this.ii = null
      },
      initialize: function (c, d) {
        var e = this
        e.Ic = c
        e.Za = eb.platform.Za
        1 < e.Za && eb.platform.touchonlydevice && (e.Za = 1)
        e.config.MixedMode &&
          (eb.browser.wg || eb.browser.msie) &&
          0 == e.file.indexOf('http') &&
          (e.config.MixedMode = !1)
        e.oq =
          ('undefined' != e.jsDirectory && null != e.jsDirectory
            ? e.jsDirectory
            : 'js/') + 'pdf.min.js'
        e.Oa
          ? (e.JSONPageDataFormat = {
              yg: 'width',
              xg: 'height',
              Tf: 'text',
              Nb: 'd',
              ji: 'f',
              Rc: 'l',
              $b: 't',
              ue: 'w',
              te: 'h',
            })
          : (e.JSONPageDataFormat = {
              yg: e.config.JSONPageDataFormat.pageWidth,
              xg: e.config.JSONPageDataFormat.pageHeight,
              Tf: e.config.JSONPageDataFormat.textCollection,
              Nb: e.config.JSONPageDataFormat.textFragment,
              ji: e.config.JSONPageDataFormat.textFont,
              Rc: e.config.JSONPageDataFormat.textLeft,
              $b: e.config.JSONPageDataFormat.textTop,
              ue: e.config.JSONPageDataFormat.textWidth,
              te: e.config.JSONPageDataFormat.textHeight,
            })
        e.Ba =
          e.file.indexOf &&
          0 <= e.file.indexOf('[*,') &&
          e.config &&
          null != e.config.jsonfile &&
          !d.Il
        e.Ka = new Ha(e.aa, e.Ba, e.JSONPageDataFormat, !0)
        e.Ba &&
          ((e.cr = e.file.substr(
            e.file.indexOf('[*,'),
            e.file.indexOf(']') - e.file.indexOf('[*,')
          )),
          (e.Dl = e.Dl = !1))
        PDFJS.workerSrc =
          ('undefined' != e.jsDirectory && null != e.jsDirectory
            ? e.jsDirectory
            : 'js/') + 'pdf.worker.min.js'
        jQuery
          .getScript(e.oq, function () {
            !PDFJS.getDocument &&
              window.pdfjsLib &&
              ((window.PDFJS = window.si = window.pdfjsLib),
              (window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                ('undefined' != e.jsDirectory && null != e.jsDirectory
                  ? e.jsDirectory
                  : 'js/') + 'pdf.worker.min.js'),
              (window.si.VERBOSITY_LEVELS = {
                errors: 0,
                warnings: 1,
                infos: 5,
              }))
            if (e.Dl) {
              var g = new XMLHttpRequest()
              g.open('HEAD', e.Xi(1), !1)
              g.overrideMimeType('application/pdf')
              g.onreadystatechange = function () {
                if (200 == g.status) {
                  var c = g.getAllResponseHeaders(),
                    d = {}
                  if (c) {
                    for (var c = c.split('\r\n'), h = 0; h < c.length; h++) {
                      var f = c[h],
                        l = f.indexOf(': ')
                      0 < l && (d[f.substring(0, l)] = f.substring(l + 2))
                    }
                  }
                  e.Qk = 'bytes' === d['Accept-Ranges']
                  e.Ko =
                    'identity' === d['Content-Encoding'] ||
                    null === d['Content-Encoding'] ||
                    !d['Content-Encoding']
                  e.Qk &&
                    e.Ko &&
                    !eb.platform.ios &&
                    !eb.browser.safari &&
                    ((e.file =
                      e.file.substr(0, e.file.indexOf(e.cr) - 1) + '.pdf'),
                    (e.Ba = !1))
                }
                g.abort()
              }
              try {
                g.send(null)
              } catch (f) {}
            }
            window['wordPageList_' + e.aa] = e.Ka.ab
            jQuery('#' + e.aa).trigger('onDocumentLoading')
            FLOWPAPER.RANGE_CHUNK_SIZE &&
              (PDFJS.RANGE_CHUNK_SIZE = FLOWPAPER.RANGE_CHUNK_SIZE)
            PDFJS.VERBOSITY_LEVELS ||
              (PDFJS.VERBOSITY_LEVELS = { errors: 0, warnings: 1, infos: 5 })
            PDFJS.aj = e.Ba || e.config.MixedMode
            PDFJS.disableRange = e.Ba
            PDFJS.disableAutoFetch = e.Ba || !1
            PDFJS.disableStream = e.Ba || !1
            PDFJS.pushTextGeometries = !e.Ba
            PDFJS.verbosity = PDFJS.VERBOSITY_LEVELS.errors
            PDFJS.Ls = !1
            PDFJS.Fs = !0
            PDFJS.Gs = !0
            if (e.Ba) {
              e.Ba &&
                e.config &&
                null != e.config.jsonfile &&
                ((e.Ba = !0),
                (e.he = e.config.jsonfile),
                (e.zt = new Promise(function () {})),
                (l = null != FLOWPAPER.CHUNK_SIZE ? FLOWPAPER.CHUNK_SIZE : 10),
                e.vf({
                  url: e.fg(l),
                  dataType: e.config.JSONDataType,
                  success: function (c) {
                    c.e &&
                      ((c = CryptoJS.ff.decrypt(
                        c.e,
                        CryptoJS.Hc.ef.parse(eb.Sg ? O() : eb.Be.innerHTML)
                      )),
                      (c = jQuery.parseJSON(c.toString(CryptoJS.Hc.Hg))),
                      (e.Xf = !0))
                    jQuery(e).trigger('loadingProgress', {
                      aa: e.aa,
                      progress: 0.1,
                    })
                    if (0 < c.length) {
                      e.ca = Array(c[0].pages)
                      for (var d = 0; d < c.length; d++) {
                        ;(e.ca[d] = c[d]), (e.ca[d].loaded = !0), e.gi(d)
                      }
                      0 < e.ca.length &&
                        ((e.cb = e.ca[0].twofold), e.cb && (e.Za = 1))
                      for (d = 0; d < e.ca.length; d++) {
                        null == e.ca[d] &&
                          ((e.ca[d] = []), (e.ca[d].loaded = !1))
                      }
                      e.Ka && e.Ka.ld && e.Ka.ld(e.ca)
                    }
                    e.nf = 1
                    e.Ja = Array(c[0].pages)
                    e.wb = Array(c[0].pages)
                    e.Ij(
                      e.nf,
                      function () {
                        jQuery(e).trigger('loadingProgress', {
                          aa: e.aa,
                          progress: 1,
                        })
                        e.Ic()
                      },
                      null,
                      function (c) {
                        c = 0.1 + c
                        1 < c && (c = 1)
                        jQuery(e).trigger('loadingProgress', {
                          aa: e.aa,
                          progress: c,
                        })
                      }
                    )
                  },
                  error: function (g, h, f) {
                    h =
                      null != g.responseText &&
                      0 == g.responseText.indexOf('Error:')
                        ? g.responseText.substr(6)
                        : ''
                    this.url.indexOf('view.php') ||
                    this.url.indexOf('view.ashx')
                      ? (console.log(
                          'Warning: Could not load JSON file. Switching to single file mode.'
                        ),
                        (d.Il = !0),
                        (e.Ba = !1),
                        e.initialize(c, d),
                        (e.pageThumbImagePattern = null))
                      : N(
                          'Error loading JSON file (' +
                            g.statusText +
                            ',' +
                            f +
                            '). Please check your configuration.',
                          'onDocumentLoadedError',
                          e.aa,
                          h
                        )
                  },
                }))
            } else {
              e.he = e.config.jsonfile
              var h = new jQuery.Deferred(),
                l = null != FLOWPAPER.CHUNK_SIZE ? FLOWPAPER.CHUNK_SIZE : 10
              e.he && 0 < e.he.length
                ? e.vf({
                    url: e.fg(l),
                    dataType: e.config.JSONDataType,
                    success: function (c) {
                      c.e &&
                        ((c = CryptoJS.ff.decrypt(
                          c.e,
                          CryptoJS.Hc.ef.parse(eb.Sg ? O() : eb.Be.innerHTML)
                        )),
                        (c = jQuery.parseJSON(c.toString(CryptoJS.Hc.Hg))),
                        (e.Xf = !0))
                      if (0 < c.length) {
                        e.ca = Array(c[0].pages)
                        for (var d = 0; d < c.length; d++) {
                          ;(e.ca[d] = c[d]), (e.ca[d].loaded = !0), e.gi(d)
                        }
                        for (d = 0; d < e.ca.length; d++) {
                          null == e.ca[d] &&
                            ((e.ca[d] = []), (e.ca[d].loaded = !1))
                        }
                        e.Ka && e.Ka.ld && e.Ka.ld(e.ca)
                        0 < e.ca.length &&
                          ((e.cb = e.ca[0].twofold), e.cb && (e.Za = 1))
                      }
                      h.resolve()
                    },
                  })
                : h.resolve()
              h.then(function () {
                var c = {},
                  g = e.file
                d &&
                  d.Il &&
                  g.match(/(page=\d)/gi) &&
                  (g = g.replace(/(page=\d)/gi, ''))
                !e.file.indexOf ||
                e.file instanceof Uint8Array ||
                (e.file.indexOf && 0 == e.file.indexOf('blob:'))
                  ? (c = g)
                  : (c.url = g)
                e.wm() &&
                  (c.password =
                    e.config.signature + 'e0737b87e9be157a2f73ae6ba1352a65')
                var h = 0
                c.rangeChunkSize = FLOWPAPER.RANGE_CHUNK_SIZE
                e.config.FilesBlobURI && (c.url = e.config.FilesBlobURI(c.url))
                c = PDFJS.getDocument(c)
                c.onPassword = function (c, d) {
                  jQuery('#' + e.aa).trigger('onPasswordNeeded', c, d)
                }
                c.onProgress = function (c) {
                  h = c.loaded / c.total
                  1 < h && (h = 1)
                  jQuery(e).trigger('loadingProgress', {
                    aa: e.aa,
                    progress: h,
                  })
                }
                c.then(
                  function (c) {
                    0.5 > h &&
                      jQuery(e).trigger('loadingProgress', {
                        aa: e.aa,
                        progress: 0.5,
                      })
                    e.pdf = e.Ja = c
                    e.Ja.getPageLabels().then(function (c) {
                      jQuery(e).trigger('labelsLoaded', { cm: c })
                    })
                    e.initialized = !0
                    e.dimensions = null
                    e.wb = Array(e.cb ? e.ca.length : e.Ja.numPages)
                    e.dimensions = []
                    ;(e.Oo = e.Ja.getDestinations()).then(function (c) {
                      e.Yi = c
                    })
                    ;(e.kq = e.Ja.getOutline()).then(function (c) {
                      e.outline = c || []
                    })
                    var g = d && d.StartAtPage ? parseInt(d.StartAtPage) : 1
                    e.Ja.getPage(g).then(function (c) {
                      c = c.getViewport(1)
                      var d = e.Ja.numPages
                      !e.Ba && e.cb && (d = e.ca.length)
                      for (i = 1; i <= d; i++) {
                        ;(e.dimensions[i - 1] = []),
                          (e.dimensions[i - 1].page = i - 1),
                          (e.dimensions[i - 1].width = c.width),
                          (e.dimensions[i - 1].height = c.height),
                          (e.dimensions[i - 1].xa = c.width),
                          (e.dimensions[i - 1].Ga = c.height)
                      }
                      e.Zi = !0
                      jQuery(e).trigger('loadingProgress', {
                        aa: e.aa,
                        progress: 1,
                      })
                      1 == g && 1 < d && window.zine
                        ? e.Ja.getPage(2).then(function (c) {
                            c = c.getViewport(1)
                            e.cb =
                              2 * Math.round(e.dimensions[0].width) >=
                                Math.round(c.width) - 1 &&
                              2 * Math.round(e.dimensions[0].width) <=
                                Math.round(c.width) + 1
                            if (e.cb) {
                              e.ca = Array(2 * (d - 1))
                              for (var g = 0; g < e.ca.length; g++) {
                                ;(e.ca[g] = {}),
                                  (e.ca[g].text = []),
                                  (e.ca[g].pages = d),
                                  (e.ca[g].cb = !0),
                                  (e.ca[g].width =
                                    0 == g ? e.dimensions[0].width : c.width),
                                  (e.ca[g].height =
                                    0 == g ? e.dimensions[0].height : c.height),
                                  e.gi(g)
                              }
                            }
                            e.Ic()
                          })
                        : e.Ic()
                    })
                    ;(null == e.config.jsonfile ||
                      (null != e.config.jsonfile &&
                        0 == e.config.jsonfile.length) ||
                      !e.Ba) &&
                      e.Um(e.Ja)
                  },
                  function (c) {
                    N(
                      'Cannot load PDF file (' + c + ')',
                      'onDocumentLoadedError',
                      e.aa,
                      'Cannot load PDF file (' + c + ')'
                    )
                    jQuery(e).trigger('loadingProgress', {
                      aa: e.aa,
                      progress: 'Error',
                    })
                  },
                  function () {},
                  function (c) {
                    jQuery(e).trigger('loadingProgress', {
                      aa: e.aa,
                      progress: c.loaded / c.total,
                    })
                  }
                )
              })
            }
          })
          .fail(function () {})
        e.JSONPageDataFormat = {
          yg: 'width',
          xg: 'height',
          Tf: 'text',
          Nb: 'd',
          ji: 'f',
          Rc: 'l',
          $b: 't',
          ue: 'w',
          te: 'h',
        }
      },
      Ij: function (c, d, e) {
        var g = this,
          h = {},
          f = c
        g.config.RTLMode && (f = g.ca.length - f + 1)
        h.url = g.Xi(f)
        g.wm() &&
          (h.password = g.config.signature + 'e0737b87e9be157a2f73ae6ba1352a65')
        h.rangeChunkSize = FLOWPAPER.RANGE_CHUNK_SIZE
        g.du = PDFJS.getDocument(h).then(
          function (h) {
            g.Ja[c - 1] = h
            g.initialized = !0
            g.dimensions || (g.dimensions = [])
            g.Ja[c - 1].getDestinations().then(function (c) {
              g.Yi = c
            })
            g.Ja[c - 1].getPage(1).then(function (h) {
              g.wb[c - 1] = h
              var f = h.getViewport(g.cb ? 1 : 1.5),
                l =
                  g.dimensions && g.dimensions[c - 1]
                    ? g.dimensions[c - 1]
                    : [],
                k = Math.floor(f.width),
                f = Math.floor(f.height),
                q = l && l.width && !(k > l.width - 1 && k < l.width + 1),
                r = l && l.height && !(f > l.height - 1 && f < l.height + 1)
              g.dimensions[c - 1] = []
              g.dimensions[c - 1].loaded = !0
              g.dimensions[c - 1].page = c - 1
              g.dimensions[c - 1].width = k
              1 < c &&
              g.cb &&
              (c < g.Ja[c - 1].numPages || 0 != g.Ja[c - 1].numPages % 2)
                ? ((g.dimensions[c - 1].width = g.dimensions[c - 1].width / 2),
                  (g.dimensions[c - 1].xa = k / 2))
                : (g.dimensions[c - 1].xa = k)
              l.width &&
                !ma(g.dimensions[c - 1].width, l.width - 1, l.width + 1) &&
                e &&
                !g.cb &&
                ((e.dimensions.xa = k), (e.dimensions.Ga = f), e.Ya())
              if (q || !g.dimensions[c - 1].xa) {
                g.dimensions[c - 1].xa = k
              }
              if (r || !g.dimensions[c - 1].Ga) {
                g.dimensions[c - 1].Ga = f
              }
              g.dimensions[c - 1].height = f
              1 < c &&
                g.cb &&
                (c < g.Ja[c - 1].numPages || 0 != g.Ja[c - 1].numPages % 2) &&
                (g.dimensions[c - 1].xa = g.dimensions[c - 1].xa / 2)
              null != g.La[c - 1] &&
                g.La.length > c &&
                ((g.dimensions[c - 1].od = g.La[c].od),
                (g.dimensions[c - 1].nd = g.La[c].nd),
                (g.dimensions[c - 1].zb = g.La[c].zb),
                (g.dimensions[c - 1].Dd = g.La[c].Dd))
              g.gh[c - 1 + ' ' + h.ref.gen + ' R'] = c - 1
              g.Zi = !0
              g.nf = -1
              d && d()
            })
            g.nf = -1
          },
          function (c) {
            N('Cannot load PDF file (' + c + ')', 'onDocumentLoadedError', g.aa)
            jQuery(g).trigger('loadingProgress', {
              aa: g.aa,
              progress: 'Error',
            })
            g.nf = -1
          }
        )
      },
      vf: function (c) {
        var d = this
        if (d.config.FilesBlobURI) {
          fetch(d.config.FilesBlobURI(c.url)).then(function (d) {
            d.arrayBuffer().then(function (d) {
              d = new Uint8Array(d)
              d = pako.inflate(d, { to: 'string' })
              'undefined' !== typeof Response
                ? P(d).then(function (d) {
                    c.success(d)
                  })
                : c.success(JSON.parse(d))
            })
          })
        } else {
          if (!d.config.FilesBlobURI && 'lz' == d.config.JSONDataType) {
            if (
              'undefined' === typeof Worker ||
              (eb.browser.msie && 11 > eb.browser.version)
            ) {
              ya(c.url, function (d, e) {
                requestAnim(function () {
                  var d =
                      'undefined' != typeof Uint8Array ? new Uint8Array(e) : e,
                    d = pako.inflate(d, { to: 'string' })
                  'undefined' !== typeof Response
                    ? P(d).then(function (d) {
                        c.success(d)
                      })
                    : c.success(JSON.parse(d))
                }, 10)
              })
            } else {
              var e = document.location.href.substr(
                0,
                document.location.href.lastIndexOf('/') + 1
              )
              ;-1 == c.url.indexOf('http') && (c.url = e + c.url)
              d.Jb || (d.Jb = {})
              d.Jb[c.url] = c
              if (!d.Hf) {
                try {
                  var g =
                    ('undefined' != d.jsDirectory && null != d.jsDirectory
                      ? d.jsDirectory
                      : 'js/') + 'flowpaper.worker.js'
                  if (
                    'undefined' != d.jsDirectory &&
                    0 == d.jsDirectory.indexOf('http')
                  ) {
                    var h = new Blob(
                        [
                          'importScripts(' +
                            JSON.stringify(
                              ('undefined' != d.jsDirectory &&
                              null != d.jsDirectory
                                ? d.jsDirectory
                                : 'js/') + 'flowpaper.worker.js'
                            ) +
                            ')',
                        ],
                        { type: 'application/javascript' }
                      ),
                      g = window.URL.createObjectURL(h)
                  }
                  d.Hf = new Worker(g)
                } catch (f) {
                  ya(c.url, function (d, e) {
                    requestAnim(function () {
                      var d =
                          'undefined' != typeof Uint8Array
                            ? new Uint8Array(e)
                            : e,
                        d = pako.inflate(d, { to: 'string' })
                      'undefined' !== typeof Response
                        ? P(d).then(function (d) {
                            c.success(d)
                          })
                        : c.success(JSON.parse(d))
                    }, 10)
                  })
                }
                d.Hf.addEventListener(
                  'message',
                  function (c) {
                    d.Jb[c.data.url] &&
                      ('undefined' !== typeof Response
                        ? P(c.data.JSON).then(function (e) {
                            d.Jb[c.data.url] &&
                              (d.Jb[c.data.url].success(e),
                              (d.Jb[c.data.url] = null))
                          })
                        : d.Jb[c.data.url] &&
                          (d.Jb[c.data.url].success(JSON.parse(c.data.JSON)),
                          (d.Jb[c.data.url] = null)))
                  },
                  !1
                )
              }
              d.Hf.postMessage(c.url)
            }
          } else {
            if (!d.config.FilesBlobURI) {
              return jQuery.ajax(c)
            }
          }
        }
      },
      fg: function (c) {
        return this.he.replace('{page}', c)
      },
      Nh: function (c) {
        var d = 1
        if (1 < c) {
          for (var e = 0; e < c; e++) {
            ;(0 != e % 2 || (0 == e % 2 && 0 == c % 2 && e == c - 1)) && d++
          }
          return d
        }
        return 1
      },
      wm: function () {
        return null != this.config.signature && 0 < this.config.signature.length
      },
      Xi: function (c) {
        this.config.PageIndexAdjustment &&
          (c += this.config.PageIndexAdjustment)
        this.cb && 1 < c && (c = this.Nh(c))
        if (0 <= this.file.indexOf('{page}')) {
          return this.config.FilesBlobURI
            ? this.config.FilesBlobURI(this.file.replace('{page}', c))
            : this.file.replace('{page}', c)
        }
        if (0 <= this.file.indexOf('[*,')) {
          var d = this.file.substr(
              this.file.indexOf('[*,'),
              this.file.indexOf(']') - this.file.indexOf('[*,') + 1
            ),
            e = parseInt(d.substr(d.indexOf(',') + 1, d.indexOf(']') - 2))
          return this.config.FilesBlobURI
            ? this.config.FilesBlobURI(this.file.replace(d, qa(c, e)))
            : this.file.replace(d, qa(c, e))
        }
      },
      lg: function (c) {
        var d = null != FLOWPAPER.CHUNK_SIZE ? FLOWPAPER.CHUNK_SIZE : 10
        return 0 === d ? c : c + (d - (c % d))
      },
      Kc: function (c, d, e, g, h) {
        var f = this
        f.Jd == f.lg(c)
          ? (window.clearTimeout(h.Rp),
            (h.Rp = setTimeout(function () {
              h.dimensions.loaded || f.Kc(c, d, e, g, h)
            }, 100)))
          : ((f.Jd = f.lg(c)),
            f.vf({
              url: f.fg(f.Jd),
              dataType: f.config.JSONDataType,
              async: d,
              success: function (c) {
                c.e &&
                  ((c = CryptoJS.ff.decrypt(
                    c.e,
                    CryptoJS.Hc.ef.parse(eb.Sg ? O() : eb.Be.innerHTML)
                  )),
                  (c = jQuery.parseJSON(c.toString(CryptoJS.Hc.Hg))),
                  (f.Xf = !0))
                if (0 < c.length) {
                  for (var d = 0; d < c.length; d++) {
                    var g = parseInt(c[d].number) - 1
                    f.ca[g] = c[d]
                    f.ca[g].loaded = !0
                    f.Wp(g)
                    f.gi(g, h)
                  }
                  f.Ka.ld && f.Ka.ld(f.ca)
                  jQuery(f).trigger('onTextDataUpdated')
                  null != e && e()
                }
                f.Jd = null
              },
              error: function (c) {
                N(
                  'Error loading JSON file (' +
                    c.statusText +
                    '). Please check your configuration.',
                  'onDocumentLoadedError',
                  f.aa
                )
                f.Jd = null
              },
            }))
      },
      gi: function (c) {
        this.La || (this.La = [])
        this.La[c] || (this.La[c] = [])
        this.La[c].od = this.ca[c][this.JSONPageDataFormat.yg]
        this.La[c].nd = this.ca[c][this.JSONPageDataFormat.xg]
        this.La[c].zb = this.La[c].od
        this.La[c].Dd = this.La[c].nd
        c = this.La[c]
        for (var d = 0; d < this.getNumPages(); d++) {
          null == this.La[d] &&
            ((this.La[d] = []),
            (this.La[d].od = c.od),
            (this.La[d].nd = c.nd),
            (this.La[d].zb = c.zb),
            (this.La[d].Dd = c.Dd))
        }
      },
      getDimensions: function () {
        var c = this
        if (
          null == c.dimensions ||
          c.Zi ||
          (null != c.dimensions && 0 == c.dimensions.length)
        ) {
          null == c.dimensions && (c.dimensions = [])
          var d = c.Ja.numPages
          !c.Ba && c.cb && (d = c.ca.length)
          d = 10 > c.Ja.numPages ? c.Ja.numPages : 10
          if (c.Ba) {
            for (var e = 0; e < c.getNumPages(); e++) {
              null != c.dimensions[e] ||
              (null != c.dimensions[e] && !c.dimensions[e].loaded)
                ? (null == c.Gc && (c.Gc = c.dimensions[e]),
                  c.dimensions[e].zb ||
                    null == c.La[e] ||
                    ((c.dimensions[e].zb = c.La[e].zb),
                    (c.dimensions[e].Dd = c.La[e].Dd)))
                : null != c.Gc &&
                  ((c.dimensions[e] = []),
                  (c.dimensions[e].page = e),
                  (c.dimensions[e].loaded = !1),
                  (c.dimensions[e].width = c.Gc.width),
                  (c.dimensions[e].height = c.Gc.height),
                  (c.dimensions[e].xa = c.Gc.xa),
                  (c.dimensions[e].Ga = c.Gc.Ga),
                  null != c.La[e] &&
                    ((c.dimensions[e].width = c.La[e].od),
                    (c.dimensions[e].height = c.La[e].nd),
                    (c.dimensions[e].xa = c.La[e].zb),
                    (c.dimensions[e].Ga = c.La[e].Dd)),
                  null != c.La[e - 1] &&
                    ((c.dimensions[e - 1].od = c.La[e].od),
                    (c.dimensions[e - 1].nd = c.La[e].nd),
                    (c.dimensions[e - 1].zb = c.La[e].zb),
                    (c.dimensions[e - 1].Dd = c.La[e].Dd)),
                  e == c.getNumPages() - 1 &&
                    ((c.dimensions[e].od = c.La[e].od),
                    (c.dimensions[e].nd = c.La[e].nd),
                    (c.dimensions[e].zb = c.La[e].zb),
                    (c.dimensions[e].Dd = c.La[e].Dd)),
                  (c.gh[e + ' 0 R'] = e))
            }
          } else {
            c.Jl = []
            for (e = 1; e <= d; e++) {
              var g = e
              c.cb && (g = c.Nh(e))
              c.Jl.push(
                c.Ja.getPage(g).then(function (d) {
                  var e = d.getViewport(1)
                  c.dimensions[d.pageIndex] = []
                  c.dimensions[d.pageIndex].page = d.pageIndex
                  c.dimensions[d.pageIndex].width = e.width
                  c.dimensions[d.pageIndex].height = e.height
                  c.dimensions[d.pageIndex].xa = e.width
                  c.dimensions[d.pageIndex].Ga = e.height
                  e = d.ref
                  c.gh[e.num + ' ' + e.gen + ' R'] = d.pageIndex
                })
              )
            }
            if (Promise.all) {
              if (c.cb) {
                for (e = 1; e <= d; e++) {
                  c.dimensions[e] ||
                    ((c.dimensions[e] = []),
                    (c.dimensions[e].page = e + 1),
                    (c.dimensions[e].width = c.dimensions[0].width),
                    (c.dimensions[e].height = c.dimensions[0].height),
                    (c.dimensions[e].xa = c.dimensions[0].xa),
                    (c.dimensions[e].Ga = c.dimensions[0].Ga))
                }
              }
              Promise.all(c.Jl.concat(c.Oo).concat(c.kq)).then(function () {
                jQuery(c).trigger('outlineAdded', { aa: c.aa })
              })
            }
          }
          c.Zi = !1
        }
        return c.dimensions
      },
      Wp: function (c) {
        if (this.dimensions[c]) {
          this.dimensions[c].page = c
          this.dimensions[c].loaded = !0
          this.Da[c] = []
          this.Da[c] = ''
          for (
            var d = null, e = 0, g;
            (g = this.ca[c][this.JSONPageDataFormat.Tf][e++]);

          ) {
            this.Oa
              ? !isNaN(g[0].toString()) &&
                0 <= Number(g[0].toString()) &&
                !isNaN(g[1].toString()) &&
                0 <= Number(g[1].toString()) &&
                !isNaN(g[2].toString()) &&
                0 <= Number(g[2].toString()) &&
                !isNaN(g[3].toString()) &&
                0 <= Number(g[3].toString()) &&
                (d &&
                  Math.round(d[0]) != Math.round(g[0]) &&
                  Math.round(d[1]) == Math.round(g[1]) &&
                  (this.Da[c] += ' '),
                d &&
                  Math.round(d[0]) != Math.round(g[0]) &&
                  !this.Da[c].endsWith(' ') &&
                  (this.Da[c] += ' '),
                (d = /\\u([\d\w]{4})/gi),
                (d = (g[5] + '').replace(d, function (c, d) {
                  return String.fromCharCode(parseInt(d, 16))
                })),
                this.config.RTLMode || (this.Da[c] += d),
                this.config.RTLMode && (this.Da[c] += pa(d)))
              : !isNaN(g[this.JSONPageDataFormat.Rc].toString()) &&
                0 <= Number(g[this.JSONPageDataFormat.Rc].toString()) &&
                !isNaN(g[this.JSONPageDataFormat.$b].toString()) &&
                0 <= Number(g[this.JSONPageDataFormat.$b].toString()) &&
                !isNaN(g[this.JSONPageDataFormat.ue].toString()) &&
                0 < Number(g[this.JSONPageDataFormat.ue].toString()) &&
                !isNaN(g[this.JSONPageDataFormat.te].toString()) &&
                0 < Number(g[this.JSONPageDataFormat.te].toString()) &&
                (d &&
                  Math.round(d[this.JSONPageDataFormat.$b]) !=
                    Math.round(g[this.JSONPageDataFormat.$b]) &&
                  Math.round(d[this.JSONPageDataFormat.Rc]) ==
                    Math.round(prev[this.JSONPageDataFormat.Rc]) &&
                  (this.Da[c] += ' '),
                d &&
                  Math.round(d[this.JSONPageDataFormat.$b]) !=
                    Math.round(g[this.JSONPageDataFormat.$b]) &&
                  !this.Da[c].endsWith(' ') &&
                  (this.Da[c] += ' '),
                (d = /\\u([\d\w]{4})/gi),
                (d = (g[this.JSONPageDataFormat.Nb] + '').replace(
                  d,
                  function (c, d) {
                    return String.fromCharCode(parseInt(d, 16))
                  }
                )),
                this.config.RTLMode || (this.Da[c] += d),
                this.config.RTLMode && (this.Da[c] += pa(d))),
              (d = g)
          }
          this.Da[c] = this.Da[c].toLowerCase()
        }
      },
      getNumPages: function () {
        return this.Ba
          ? 10 > this.ca.length
            ? this.ca.length
            : 10
          : this.ca && !this.Ja
          ? 10 > this.ca.length
            ? this.ca.length
            : 10
          : 10 > this.Ja.numPages
          ? this.Ja.numPages
          : 10
      },
      getPage: function (c) {
        this.Ja.getPage(c).then(function (c) {
          return c
        })
        return null
      },
      kd: function (c) {
        var d = this
        'TwoPage' == c.I || 'BookView' == c.I
          ? (0 == c.pageNumber &&
              jQuery(c.ra).css(
                'background-image',
                "url('" + d.pa(c.pages.Z + 1) + "')"
              ),
            1 == c.pageNumber &&
              jQuery(c.ra).css(
                'background-image',
                "url('" + d.pa(c.pages.Z + 2) + "')"
              ))
          : 'ThumbView' == c.I
          ? jQuery(c.ra).css(
              'background-image',
              "url('" + d.pa(c.pageNumber + 1, 200) + "')"
            )
          : 'SinglePage' == c.I
          ? jQuery(c.ra).css(
              'background-image',
              "url('" + d.pa(d.Ia(c) + 1) + "')"
            )
          : jQuery(c.ra).css(
              'background-image',
              "url('" + d.pa(c.pageNumber + 1) + "')"
            )
        c.ga = new Image()
        jQuery(c.ga).bind('load', function () {
          var e = Math.round((c.ga.width / c.ga.height) * 100),
            g = Math.round((c.dimensions.width / c.dimensions.height) * 100)
          if ('SinglePage' == c.I) {
            var e = d.La[c.pages.Z],
              h = Math.round((e.od / e.nd) * 100),
              g = Math.round((c.dimensions.xa / c.dimensions.Ga) * 100)
            h != g &&
              ((c.dimensions.xa = e.od),
              (c.dimensions.Ga = e.nd),
              c.Ya(),
              (c.vk = -1),
              d.Na(c, !0, null))
          } else {
            e != g &&
              ((c.dimensions.xa = c.ga.width),
              (c.dimensions.Ga = c.ga.height),
              c.Ya(),
              (c.vk = -1),
              d.Na(c, !0, null))
          }
        })
        jQuery(c.ga).attr('src', d.pa(c.pageNumber + 1))
      },
      xm: function (c) {
        'TwoPage' == c.I || 'BookView' == c.I
          ? (0 == c.pageNumber &&
              jQuery(c.ra).css('background-image', 'url(' + this.oa + ')'),
            1 == c.pageNumber &&
              jQuery(c.ra).css('background-image', 'url(' + this.oa + ')'))
          : jQuery(c.ra).css('background-image', 'url(' + this.oa + ')')
      },
      fe: function (c) {
        this.Hb = c.Hb = this.Ba && this.config.MixedMode
        ;('Portrait' != c.I && 'SinglePage' != c.I) ||
          jQuery(c.da).append(
            "<canvas id='" +
              this.Ta(1, c) +
              "' style='position:relative;left:0px;top:0px;width:100%;height:100%;display:none;background-repeat:no-repeat;background-size:" +
              ((eb.browser.mozilla || eb.browser.safari) && eb.platform.mac
                ? '100% 100%'
                : 'cover') +
              ";background-color:#ffffff;' class='" +
              (this.config.DisableShadows ? '' : 'flowpaper_border') +
              " flowpaper_interactivearea flowpaper_grab flowpaper_hidden flowpaper_rescale'></canvas><canvas id='" +
              this.Ta(2, c) +
              "' style='position:relative;left:0px;top:0px;width:100%;height:100%;display:block;background-repeat:no-repeat;background-size:" +
              ((eb.browser.mozilla || eb.browser.safari) && eb.platform.mac
                ? '100% 100%'
                : 'cover') +
              ";background-color:#ffffff;' class='" +
              (this.config.DisableShadows ? '' : 'flowpaper_border') +
              " flowpaper_interactivearea flowpaper_grab flowpaper_hidden flowpaper_rescale'></canvas>"
          )
        c.I == this.Ra(c) && this.Ib(c).fe(this, c)
        'ThumbView' == c.I &&
          jQuery(c.da).append(
            "<canvas id='" +
              this.Ta(1, c) +
              "' style='" +
              c.getDimensions() +
              ';background-repeat:no-repeat;background-size:' +
              ((eb.browser.mozilla || eb.browser.safari) && eb.platform.mac
                ? '100% 100%'
                : 'cover') +
              ";background-color:#ffffff;' class='flowpaper_interactivearea flowpaper_grab flowpaper_hidden' ></canvas>"
          )
        if ('TwoPage' == c.I || 'BookView' == c.I) {
          0 == c.pageNumber &&
            (jQuery(c.da + '_1').append(
              "<img id='" +
                c.tc +
                "_1' src='" +
                c.H.Ce +
                "' style='position:absolute;left:" +
                (c.Fa() - 30) +
                'px;top:' +
                c.Pa() / 2 +
                "px;' />"
            ),
            jQuery(c.da + '_1').append(
              "<canvas id='" +
                this.Ta(1, c) +
                "' style='position:absolute;width:100%;height:100%;background-repeat:no-repeat;background-size:" +
                ((eb.browser.mozilla || eb.browser.safari) && eb.platform.mac
                  ? '100% 100%'
                  : 'cover') +
                ";background-color:#ffffff;' class='flowpaper_interactivearea flowpaper_grab flowpaper_hidden'/></canvas>"
            ),
            jQuery(c.da + '_1').append(
              "<div id='" +
                c.ja +
                "_1_textoverlay' style='position:relative;left:0px;top:0px;width:100%;height:100%;z-index:10'></div>"
            )),
            1 == c.pageNumber &&
              (jQuery(c.da + '_2').append(
                "<img id='" +
                  c.tc +
                  "_2' src='" +
                  c.H.Ce +
                  "' style='position:absolute;left:" +
                  (c.Fa() / 2 - 10) +
                  'px;top:' +
                  c.Pa() / 2 +
                  "px;' />"
              ),
              jQuery(c.da + '_2').append(
                "<canvas id='" +
                  this.Ta(2, c) +
                  "' style='position:absolute;width:100%;height:100%;background-repeat:no-repeat;background-size:" +
                  ((eb.browser.mozilla || eb.browser.safari) && eb.platform.mac
                    ? '100% 100%'
                    : 'cover') +
                  ";background-color:#ffffff;' class='flowpaper_interactivearea flowpaper_grab flowpaper_hidden'/></canvas>"
              ),
              jQuery(c.da + '_2').append(
                "<div id='" +
                  c.ja +
                  "_2_textoverlay' style='position:absolute;left:0px;top:0px;width:100%;height:100%;z-index:10'></div>"
              ))
        }
      },
      Ta: function (c, d) {
        var e = d.pageNumber
        if (('TwoPage' == d.I || 'BookView' == d.I) && 0 == d.pageNumber % 2) {
          return this.aa + '_dummyCanvas1'
        }
        if (('TwoPage' == d.I || 'BookView' == d.I) && 0 != d.pageNumber % 2) {
          return this.aa + '_dummyCanvas2'
        }
        if (1 == c) {
          return this.Kh.replace('[pageNumber]', e)
        }
        if (2 == c) {
          return this.Lh.replace('[pageNumber]', e)
        }
      },
      pp: function (c, d) {
        if (('TwoPage' == d.I || 'BookView' == d.I) && 0 == d.pageNumber % 2) {
          return '#' + this.aa + '_dummyCanvas1'
        }
        if (('TwoPage' == d.I || 'BookView' == d.I) && 0 != d.pageNumber % 2) {
          return '#' + this.aa + '_dummyCanvas2'
        }
        if (1 == c) {
          return this.cj.replace('[pageNumber]', d.pageNumber)
        }
        if (2 == c) {
          return this.dj.replace('[pageNumber]', d.pageNumber)
        }
      },
      ic: function (c, d, e) {
        var g = this
        g.fj = !0
        if (c.I != g.Ra(c) || g.Ib(c).Uq(g, c, d, e)) {
          if (
            (('Portrait' != c.I && 'TwoPage' != c.I && 'BookView' != c.I) ||
              null != c.context ||
              c.Lc ||
              (c.md(), (c.Lc = !0)),
            1 == g.Aq && 1 < c.scale && c.Hb && g.Qa(c, -1),
            -1 < g.Ia(c) || (g.Ba && null != g.Ag))
          ) {
            window.clearTimeout(c.Cc),
              (c.Cc = setTimeout(function () {
                setTimeout(function () {
                  g.ic(c, d, e)
                })
              }, 50))
          } else {
            g.em = c
            g.Aq = c.scale
            if ('TwoPage' == c.I || 'BookView' == c.I) {
              if (0 == c.pageNumber) {
                'BookView' == c.I
                  ? g.Qa(c, 0 == c.pages.Z ? c.pages.Z : c.pages.Z - 1)
                  : 'TwoPage' == c.I && g.Qa(c, c.pages.Z),
                  (g.xl = c),
                  c.ec()
              } else {
                if (1 == c.pageNumber) {
                  'BookView' == c.I
                    ? g.Qa(c, c.pages.Z)
                    : 'TwoPage' == c.I && g.Qa(c, c.pages.Z + 1),
                    (g.xl = c),
                    jQuery(c.da + '_2').removeClass('flowpaper_hidden'),
                    jQuery(c.da + '_2').removeClass('flowpaper_load_on_demand'),
                    c.ec()
                } else {
                  return
                }
              }
            } else {
              'SinglePage' == c.I
                ? g.Qa(c, c.pages.Z)
                : (g.Qa(c, c.pageNumber), (g.xl = c))
            }
            g.lk(c)
            if ((c.Hb || g.Ba) && !c.dimensions.loaded) {
              var h = c.pageNumber + 1
              'SinglePage' == c.I && (h = g.Ia(c) + 1)
              g.Kc(
                h,
                !0,
                function () {
                  c.dimensions.loaded = !1
                  g.Wc(c)
                },
                !0,
                c
              )
            }
            var h = !1,
              f = c.fh
            if (
              'Portrait' == c.I ||
              'SinglePage' == c.I ||
              'TwoPage' == c.I ||
              'BookView' == c.I ||
              (c.I == g.Ra(c) && g.Ib(c).Mr(g, c))
            ) {
              var h = !0,
                k = c.qc(),
                m = c.Fa(),
                p = c.Pa()
              0 == jQuery('#' + f).length
                ? ((f =
                    "<div id='" +
                    f +
                    "' class='flowpaper_textLayer' style='width:" +
                    m +
                    'px;height:' +
                    p +
                    'px;backface-visibility:hidden;margin-left:' +
                    k +
                    "px;'></div>"),
                  'Portrait' == c.I || g.Ra(c) || 'SinglePage' == c.I
                    ? jQuery(c.Ea).append(f)
                    : ('TwoPage' != c.I && 'BookView' != c.I) ||
                      jQuery(c.Ea + '_' + ((c.pageNumber % 2) + 1)).append(f))
                : jQuery('#' + f).css({ width: m, height: p, 'margin-left': k })
              if (90 == c.rotation || 270 == c.rotation || 180 == c.rotation) {
                jQuery(c.Mb).css({ 'z-index': 11, 'margin-left': k }),
                  jQuery(c.Mb).transition(
                    { rotate: c.rotation, translate: '-' + k + 'px, 0px' },
                    0
                  )
              }
            }
            if (c.Hb && c.scale <= g.Zh(c) && !c.$i) {
              ;-1 < g.Ia(c) && window.clearTimeout(c.Cc),
                jQuery(c.da).removeClass('flowpaper_load_on_demand'),
                g.Ba && c.H.initialized && !c.Fo
                  ? g.Ri.push(function () {
                      var d = new XMLHttpRequest()
                      d.open('GET', g.Xi(c.pageNumber + 1), !0)
                      d.overrideMimeType('text/plain; charset=x-user-defined')
                      d.addEventListener('load', function () {
                        g.$d()
                      })
                      d.addEventListener('error', function () {
                        g.$d()
                      })
                      d.send(null)
                      c.Fo = !0
                    })
                  : g.Qk &&
                    null == g.wb[g.Ia(c)] &&
                    ((k = g.Ia(c) + 1),
                    g.Ja &&
                      g.Ja.getPage &&
                      g.Ja.getPage(k).then(function (d) {
                        g.wb[g.Ia(c)] = d
                      })),
                c.I == g.Ra(c) ? g.Ib(c).ic(g, c, d, e) : (g.kd(c), g.wf(c, e)),
                (c.va = !0)
            } else {
              if (
                (c.Hb && c.scale > g.Zh(c) && !c.$i
                  ? c.I != g.Ra(c) && g.kd(c)
                  : c.Hb ||
                    !c.ed ||
                    c.I != g.Ra(c) ||
                    1 != c.scale ||
                    g.Ih ||
                    g.Wj(c),
                null != g.wb[g.Ia(c)] ||
                  g.Ba ||
                  ((k = g.Ia(c) + 1),
                  g.cb && (k = g.Nh(k)),
                  g.Ja &&
                    g.Ja.getPage &&
                    g.Ja.getPage(k).then(function (h) {
                      g.wb[g.Ia(c)] = h
                      window.clearTimeout(c.Cc)
                      g.Qa(c, -1)
                      g.ic(c, d, e)
                    })),
                c.ra)
              ) {
                if (
                  100 == c.ra.width ||
                  1 != c.scale ||
                  c.I != g.Ra(c) ||
                  c.Am
                ) {
                  if (
                    ((k = !0),
                    null == g.wb[g.Ia(c)] &&
                      g.Ba &&
                      (c.I == g.Ra(c) && (k = g.Ib(c).Tq(g, c)),
                      null == g.Ja[g.Ia(c)] &&
                        -1 == g.nf &&
                        k &&
                        null == g.Ag &&
                        ((g.nf = g.Ia(c) + 1),
                        g.Ij(
                          g.nf,
                          function () {
                            window.clearTimeout(c.Cc)
                            g.Qa(c, -1)
                            g.ic(c, d, e)
                          },
                          c
                        ))),
                    null != g.wb[g.Ia(c)] || !k)
                  ) {
                    if (
                      (c.I == g.Ra(c)
                        ? g.Ib(c).ic(g, c, d, e)
                        : ((c.ra.width = c.Fa()), (c.ra.height = c.Pa())),
                      g.cb &&
                        0 < c.Vb.indexOf('cropCanvas') &&
                        (c.ra.width = 2 * c.ra.width),
                      null != g.wb[g.Ia(c)] || !k)
                    ) {
                      if (g.fj) {
                        k = c.ra.height / g.getDimensions()[c.pageNumber].height
                        c.I != g.Ra(c) && ((k *= g.Za), g.Ba && (k *= 1.5))
                        g.Hr = k
                        1.5 > k && (k = 1.5)
                        g.At = k
                        var n = g.wb[g.Ia(c)].getViewport(k)
                        g.cb ||
                          ((c.ra.width = n.width), (c.ra.height = n.height))
                        var t = (c.zq = {
                          canvasContext: c.context,
                          viewport: n,
                          pageNumber: c.pageNumber,
                          ki: h && !g.Ba ? new Ia() : null,
                        })
                        g.wb[g.Ia(c)].objs.pushTextGeometries = !g.Ba
                        g.wb[g.Ia(c)].objs.geometryTextList = []
                        window.requestAnim(function () {
                          c.ra.style.display = 'none'
                          c.ra.redraw = c.ra.offsetHeight
                          c.ra.style.display = ''
                          g.Ag = g.wb[g.Ia(c)].render(t)
                          g.Ag.onContinue = function (c) {
                            c()
                          }
                          g.Ag.promise.then(
                            function () {
                              g.Ag = null
                              if (null != g.wb[g.Ia(c)]) {
                                if (
                                  g.Ba ||
                                  (c.Hb && c.scale <= g.Zh(c)) ||
                                  !c.ra
                                ) {
                                  g.Ba || g.Nm(g.wb[g.Ia(c)], c, n, g.Ba),
                                    g.wf(c, e)
                                } else {
                                  var d =
                                      c.ra.height /
                                      g.getDimensions()[c.pageNumber].height,
                                    h = g.wb[g.Ia(c)].objs.geometryTextList
                                  if (h) {
                                    for (var f = 0; f < h.length; f++) {
                                      h[f].Kq != d &&
                                        ((h[f].h = h[f].metrics.height / d),
                                        (h[f].l = h[f].metrics.left / d),
                                        (h[f].t = h[f].metrics.top / d),
                                        (h[f].w =
                                          h[f].textMetrics.geometryWidth / d),
                                        (h[f].d = h[f].unicode),
                                        (h[f].f = h[f].fontFamily),
                                        (h[f].Kq = d))
                                    }
                                    'SinglePage' == c.I ||
                                    'TwoPage' == c.I ||
                                    'BookView' == c.I
                                      ? g.Ka.Hm(h, g.Ia(c), g.getNumPages())
                                      : g.Ka.Hm(
                                          h,
                                          c.pageNumber,
                                          g.getNumPages()
                                        )
                                  }
                                  g.Nm(g.wb[g.Ia(c)], c, n, g.Ba)
                                  g.wf(c, e)
                                  g.Na(c, !0, e)
                                }
                              } else {
                                g.wf(c, e),
                                  aa(
                                    c.pageNumber +
                                      '  is missing its pdf page (' +
                                      g.Ia(c) +
                                      ')'
                                  )
                              }
                            },
                            function (c) {
                              N(c.toString(), 'onDocumentLoadedError', g.aa)
                              g.Ag = null
                            }
                          )
                        }, 50)
                      } else {
                        g.Qa(c, -1)
                      }
                      jQuery(c.da).removeClass('flowpaper_load_on_demand')
                    }
                  }
                } else {
                  jQuery('#' + g.Ta(1, c)).Pc(),
                    jQuery('#' + g.Ta(2, c)).Yb(),
                    1 == c.scale && eb.browser.safari
                      ? (jQuery('#' + g.Ta(1, c)).css(
                          '-webkit-backface-visibility',
                          'hidden'
                        ),
                        jQuery('#' + g.Ta(2, c)).css(
                          '-webkit-backface-visibility',
                          'hidden'
                        ),
                        jQuery('#' + c.ja + '_textoverlay').css(
                          '-webkit-backface-visibility',
                          'hidden'
                        ))
                      : eb.browser.safari &&
                        (jQuery('#' + g.Ta(1, c)).css(
                          '-webkit-backface-visibility',
                          'visible'
                        ),
                        jQuery('#' + g.Ta(2, c)).css(
                          '-webkit-backface-visibility',
                          'visible'
                        ),
                        jQuery('#' + c.ja + '_textoverlay').css(
                          '-webkit-backface-visibility',
                          'visible'
                        )),
                    g.Qa(c, -1),
                    c.va ||
                      jQuery('#' + g.aa).trigger(
                        'onPageLoaded',
                        c.pageNumber + 1
                      ),
                    (c.va = !0),
                    g.Na(c, !0, e)
                }
              } else {
                window.clearTimeout(c.Cc)
              }
            }
          }
        }
      },
      Wj: function (c) {
        var d = this,
          e = null,
          g = null
        0 != c.pageNumber % 2
          ? ((e = c), (g = c.H.pages.pages[c.pageNumber - 1]))
          : ((g = c), (e = c.H.pages.pages[c.pageNumber + 1]))
        if (
          c.I == d.Ra(c) &&
          !c.Hb &&
          c.ed &&
          e &&
          e.hb &&
          g.hb &&
          g &&
          (!e.rc || !g.rc) &&
          !d.Ih
        ) {
          var h = g.ra,
            f = e.ra
          h && f && !c.rc && 100 != h.width && 100 != f.width && g.va && e.va
            ? g.ed(h, f)
            : !h ||
              !f ||
              c.rc ||
              (g.va && e.va) ||
              (window.clearTimeout(c.xq),
              (c.xq = setTimeout(function () {
                d.Wj(c)
              }, 100)))
        }
      },
      Zh: function () {
        return 1.1
      },
      Ia: function (c) {
        return this.Ba || PDFJS.aj || null == c ? this.qf : c.qf
      },
      Qa: function (c, d) {
        ;(!this.Ba || (c && c.Hb && 1 == c.scale)) && c && (c.qf = d)
        this.qf = d
      },
      lk: function (c) {
        'Portrait' == c.I || 'SinglePage' == c.I
          ? jQuery(this.pp(1, c)).is(':visible')
            ? ((c.Vb = this.Ta(2, c)), (c.sg = this.Ta(1, c)))
            : ((c.Vb = this.Ta(1, c)), (c.sg = this.Ta(2, c)))
          : c.I == this.Ra(c)
          ? this.Ib(c).lk(this, c)
          : ((c.Vb = this.Ta(1, c)), (c.sg = null))
        this.cb &&
        0 < c.pageNumber &&
        0 == c.pageNumber % 2 &&
        (1 < c.scale || !this.config.MixedMode)
          ? ((c.ra = document.createElement('canvas')),
            (c.ra.width = c.ra.height = 100),
            (c.ra.id = c.Vb + '_cropCanvas'),
            (c.Vb = c.Vb + '_cropCanvas'))
          : (c.ra = document.getElementById(c.Vb))
        null != c.Dp && (c.Dp = document.getElementById(c.sg))
        c.ra &&
          c.ra.getContext &&
          ((c.context = c.ra.getContext('2d')),
          (c.context.Gg =
            c.context.mozImageSmoothingEnabled =
            c.context.imageSmoothingEnabled =
              !1))
      },
      Lo: function (c, d, e, g) {
        if (g) {
          c = g.zs(d.rect)
          c = PDFJS.Util.normalizeRect(c)
          d = e.qc()
          g = document.createElement('a')
          var h = e.I == this.Ra(e) ? 1 : this.Za
          g.style.position = 'absolute'
          g.style.left = Math.floor(c[0]) / h + d + 'px'
          g.style.top = Math.floor(c[1]) / h + 'px'
          g.style.width = Math.ceil(c[2] - c[0]) / h + 'px'
          g.style.height = Math.ceil(c[3] - c[1]) / h + 'px'
          g.style['z-index'] = 20
          g.style.cursor = 'pointer'
          g.className =
            'pdfPageLink_' +
            e.pageNumber +
            ' flowpaper_interactiveobject_' +
            this.aa
          return g
        }
      },
      Nm: function (c, d, e, g) {
        var h = this
        if (1 == d.scale || d.I != h.Ra(d)) {
          jQuery('.pdfPageLink_' + d.pageNumber).remove(),
            c.getAnnotations().then(function (e) {
              for (var f = 0; f < e.length; f++) {
                var m = e[f]
                switch (m.subtype) {
                  case 'Link':
                    var p = h.Lo('a', m, d, c.getViewport(h.Hr), c.view)
                    p.style.position = 'absolute'
                    p.href = m.url || ''
                    eb.platform.touchonlydevice ||
                      (jQuery(p).on('mouseover', function () {
                        jQuery(this).stop(!0, !0)
                        jQuery(this).css('background', d.H.linkColor)
                        jQuery(this).css({ opacity: d.H.dd })
                      }),
                      jQuery(p).on('mouseout', function () {
                        jQuery(this).css('background', '')
                        jQuery(this).css({ opacity: 0 })
                      }))
                    m.url || g
                      ? null != p.href &&
                        '' != p.href &&
                        m.url &&
                        (jQuery(p).on('click touchstart', function () {
                          jQuery(d.N).trigger(
                            'onExternalLinkClicked',
                            this.href
                          )
                        }),
                        jQuery(d.Ea).append(p))
                      : ((m =
                          'string' === typeof m.dest
                            ? h.Yi[m.dest][0]
                            : null != m && null != m.dest
                            ? m.dest[0]
                            : null),
                        (m =
                          m instanceof Object
                            ? h.gh[m.num + ' ' + m.gen + ' R']
                            : m + 1),
                        jQuery(p).data('gotoPage', m + 1),
                        jQuery(p).on('click touchstart', function () {
                          d.H.gotoPage(parseInt(jQuery(this).data('gotoPage')))
                          return !1
                        }),
                        jQuery(d.Ea).append(p))
                }
              }
            })
        }
      },
      wf: function (c, d) {
        this.Na(c, !0, d)
        jQuery('#' + c.Vb).Pc()
        this.Ul(c)
        ;('Portrait' != c.I && 'SinglePage' != c.I) || jQuery(c.gc).remove()
        c.I == this.Ra(c) && this.Ib(c).wf(this, c, d)
        if (c.Vb && 0 < c.Vb.indexOf('cropCanvas')) {
          var e = c.ra
          c.Vb = c.Vb.substr(0, c.Vb.length - 11)
          c.ra = jQuery('#' + c.Vb).get(0)
          c.ra.width = e.width / 2
          c.ra.height = e.height
          c.ra
            .getContext('2d')
            .drawImage(
              e,
              e.width / 2,
              0,
              c.ra.width,
              c.ra.height,
              0,
              0,
              e.width / 2,
              e.height
            )
          jQuery(c.ra).Pc()
        }
        c.Hb || !c.ed || c.rc || !c.ra || this.Ih || this.Wj(c)
        c.Pr && 1 == c.scale && !this.Ih && requestAnim(function () {})
        if ('TwoPage' == c.I || 'BookView' == c.I) {
          0 == c.pageNumber &&
            (jQuery(c.Aa).removeClass('flowpaper_hidden'),
            jQuery(c.da + '_1').removeClass('flowpaper_hidden')),
            1 == c.pageNumber && jQuery(c.Aa).removeClass('flowpaper_hidden')
        }
        c.va || jQuery('#' + this.aa).trigger('onPageLoaded', c.pageNumber + 1)
        c.va = !0
        c.Am = !1
        c.ot = !1
        this.pg || ((this.pg = !0), c.H.bi())
        null != d && d()
        this.$d()
      },
      $d: function () {
        0 < this.Ri.length &&
          -1 == this.Ia() &&
          this.em.va &&
          !this.em.Kb &&
          this.Ri.shift()()
      },
      Ul: function (c) {
        'TwoPage' == c.I ||
          'BookView' == c.I ||
          (c.I == this.Ra(c) && !eb.browser.safari) ||
          jQuery('#' + c.sg).Yb()
        this.Qa(c, -1)
      },
      pa: function (c, d) {
        this.config.RTLMode &&
          this.ca &&
          this.ca.length &&
          (c = this.ca.length - c + 1)
        this.Xf &&
          (c = CryptoJS.ff
            .encrypt(
              c.toString(),
              CryptoJS.Hc.ef.parse(eb.Sg ? O() : eb.Be.innerHTML)
            )
            .toString())
        this.config.PageIndexAdjustment &&
          (c += this.config.PageIndexAdjustment)
        if (!d) {
          return this.pageSVGImagePattern
            ? this.config.FilesBlobURI
              ? this.config.FilesBlobURI(
                  this.pageSVGImagePattern.replace('{page}', c)
                )
              : this.pageSVGImagePattern.replace('{page}', c)
            : this.config.FilesBlobURI
            ? this.config.FilesBlobURI(
                this.pageImagePattern.replace('{page}', c)
              )
            : this.pageImagePattern.replace('{page}', c)
        }
        if (
          null != this.pageThumbImagePattern &&
          0 < this.pageThumbImagePattern.length
        ) {
          var e =
            this.pageThumbImagePattern.replace('{page}', c) +
            (0 < this.pageThumbImagePattern.indexOf('?') ? '&' : '?') +
            'resolution=' +
            d
          return this.config.FilesBlobURI ? this.config.FilesBlobURI(e) : e
        }
      },
      Gb: function (c) {
        jQuery(
          '.flowpaper_pageword_' +
            this.aa +
            '_page_' +
            c.pageNumber +
            ':not(.flowpaper_selected_searchmatch, .flowpaper_annotation_' +
            this.aa +
            ')'
        ).remove()
        c.I != this.Ra(c) && this.xm(c)
        c.Hb &&
          (jQuery(c.ra).css('background-image', 'url(' + this.oa + ')'),
          (c.ga = null))
        null != c.context &&
          null != c.ra &&
          100 != c.ra.width &&
          ((this.context = this.ra = c.zq = null),
          c.Xj && c.Xj(),
          jQuery(
            '.flowpaper_annotation_' + this.aa + '_page_' + c.pageNumber
          ).remove())
        this.Ba &&
          (this.wb[c.pageNumber] && this.wb[c.pageNumber].cleanup(),
          (this.Ja[c.pageNumber] = null),
          (this.wb[c.pageNumber] = null))
        c.ph && c.ph()
      },
      Um: function (c) {
        var d = this
        d.Ja &&
          d.Ja.getPage(d.$h).then(function (e) {
            e.getTextContent().then(function (e) {
              var h = ''
              if (e) {
                for (var f = 0; f < e.items.length; f++) {
                  h += e.items[f].str
                }
              }
              d.Da[d.$h - 1] = h.toLowerCase()
              e = d.getNumPages()
              !d.Ba && d.cb && (e = d.Ja.numPages)
              d.$h + 1 < e + 1 && (d.$h++, d.Um(c))
            })
          })
      },
      Wc: function (c, d, e, g) {
        this.Ka.Wc(c, d, e, g)
      },
      Vc: function (c, d, e, g) {
        this.Ka.Vc(c, d, e, g)
      },
      gf: function (c, d, e, g) {
        this.Ka.gf(c, d, e, g)
      },
      Na: function (c, d, e) {
        var g =
          null != this.ca &&
          this.ca[c.pageNumber] &&
          this.ca[c.pageNumber].text &&
          0 < this.ca[c.pageNumber].text.length &&
          this.Ba
        if (c.va || d || g) {
          c.vk != c.scale &&
            (jQuery(
              '.flowpaper_pageword_' + this.aa + '_page_' + c.pageNumber
            ).remove(),
            (c.vk = c.scale)),
            (d = null != this.Eg ? this.Eg : e),
            (this.Eg = null),
            this.Ka && this.Ka.Na && this.Ka.Na(c, d)
        } else {
          if (null != e) {
            if (null != this.Eg) {
              var h = this.Eg
              this.Eg = function () {
                h()
                e()
              }
            } else {
              this.Eg = e
            }
          }
        }
      },
    }
    return f
  })())
function Ia() {
  this.beginLayout = function () {
    this.textDivs = []
    this.ii = []
  }
  this.endLayout = function () {}
}
var Ha = (window.TextOverlay = (function () {
  function f(c, d, e, g) {
    this.aa = c
    this.JSONPageDataFormat = e
    this.ca = []
    this.Wa = null
    this.ab = []
    this.Oa = this.Lr = d
    this.Bb = g
    this.state = {}
    this.oa =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  }
  f.prototype = {
    dispose: function () {
      delete this.aa
      this.aa = null
      delete this.ca
      this.ca = null
      delete this.JSONPageDataFormat
      this.JSONPageDataFormat = null
      delete this.Wa
      this.Wa = null
      delete this.ab
      this.ab = null
      delete this.state
      this.state = null
      delete this.oa
      this.oa = null
      delete this.Bb
      this.Bb = null
    },
    Jq: function () {
      this.state[this.Oa] ||
        ((this.state[this.Oa] = []),
        (this.state[this.Oa].ca = this.ca),
        (this.state[this.Oa].Wa = this.Wa),
        (this.state[this.Oa].ab = this.ab),
        (window['wordPageList_' + this.aa] = null))
      this.ca = []
      this.Wa = null
      this.ab = []
      this.Oa = this.Lr
    },
    Ra: function (c) {
      return c.H.J ? c.H.J.ia : ''
    },
    Ib: function (c) {
      return c.H.J.Dr
    },
    dl: function (c) {
      return c.H.document.AutoDetectLinks
    },
    ld: function (c) {
      this.ca = c
      null == this.Wa && (this.Wa = Array(c.length))
      window['wordPageList_' + this.aa] = this.ab
    },
    Hm: function (c, d, e) {
      null == this.Wa && (this.Wa = Array(e))
      this.ca[d] = []
      this.ca[d].text = c
      window['wordPageList_' + this.aa] = this.ab
    },
    Wc: function (c, d, e, g) {
      var h = c.pageNumber,
        f = !1,
        k = !1
      if (!this.Wa) {
        if ((c.Hb && (this.Oa = !0), this.state[this.Oa])) {
          if (
            ((this.ca = this.state[this.Oa].ca),
            (this.Wa = this.state[this.Oa].Wa),
            (this.ab = this.state[this.Oa].ab),
            (window['wordPageList_' + this.aa] = this.ab),
            !this.Wa)
          ) {
            return
          }
        } else {
          return
        }
      }
      if (window.annotations || !eb.touchdevice || g) {
        if (
          (window.annotations || c.H.Dc || g || c.H.Wl || (f = !0),
          (k = null != this.Pd && null != this.Pd[c.pageNumber]),
          'ThumbView' != c.I)
        ) {
          if (
            'BookView' == c.I &&
            (0 == c.pageNumber &&
              (h = 0 != c.pages.Z ? c.pages.Z - 1 : c.pages.Z),
            1 == c.pageNumber && (h = c.pages.Z),
            0 == c.pages.getTotalPages() % 2 &&
              h == c.pages.getTotalPages() &&
              (h = h - 1),
            0 == c.pages.Z % 2 && c.pages.Z > c.pages.getTotalPages())
          ) {
            return
          }
          'SinglePage' == c.I && (h = c.pages.Z)
          if (
            'TwoPage' == c.I &&
            (0 == c.pageNumber && (h = c.pages.Z),
            1 == c.pageNumber && (h = c.pages.Z + 1),
            1 == c.pageNumber &&
              h >= c.pages.getTotalPages() &&
              0 != c.pages.getTotalPages() % 2)
          ) {
            return
          }
          d = c.hb || !d
          c.I == this.Ra(c) && (isvisble = this.Ib(c).ad(this, c))
          g = jQuery(
            '.flowpaper_pageword_' +
              this.aa +
              '_page_' +
              h +
              ':not(.flowpaper_annotation_' +
              this.aa +
              ')' +
              (g ? ':not(.pdfPageLink_' + h + ')' : '')
          ).length
          var m = null != c.dimensions.zb ? c.dimensions.zb : c.dimensions.xa,
            m = this.Bb ? c.Fa() / m : 1
          if (d && 0 == g) {
            var p = (g = ''),
              n = 0,
              t = h
            c.H.config.document.RTLMode && (t = c.pages.getTotalPages() - h - 1)
            if (null == this.Wa[t] || !this.Bb) {
              if (null == this.ca[t]) {
                return
              }
              this.Wa[t] = this.ca[t][this.JSONPageDataFormat.Tf]
            }
            if (null != this.Wa[t]) {
              c.Hb && (this.Oa = !0)
              var q = new WordPage(this.aa, h),
                h = c.qc(),
                r = [],
                u = c.$c(),
                v = c.kg(),
                A = !1,
                x = -1,
                w = -1,
                B = 0,
                C = -1,
                M = -1,
                E = !1
              this.ab[t] = q
              c.I == this.Ra(c) && (m = this.Ib(c).kp(this, c, m))
              c.Ot = m
              for (var J = 0, F; (F = this.Wa[t][J++]); ) {
                var D = J - 1,
                  y = this.Oa ? F[5] : F[this.JSONPageDataFormat.Nb],
                  z = J,
                  G = J + 1,
                  K = J < this.Wa[t].length ? this.Wa[t][J] : null,
                  L = J + 1 < this.Wa[t].length ? this.Wa[t][J + 1] : null,
                  A = K ? (this.Oa ? K[5] : K[this.JSONPageDataFormat.Nb]) : '',
                  I = L ? (this.Oa ? L[5] : L[this.JSONPageDataFormat.Nb]) : ''
                ' ' == A &&
                  ((z = J + 1),
                  (G = J + 2),
                  (A = (K = z < this.Wa[t].length ? this.Wa[t][z] : null)
                    ? this.Oa
                      ? K[5]
                      : K[this.JSONPageDataFormat.Nb]
                    : ''),
                  (I = (L = G < this.Wa[t].length ? this.Wa[t][G] : null)
                    ? this.Oa
                      ? L[5]
                      : L[this.JSONPageDataFormat.Nb]
                    : ''))
                K = L = null
                if (null == y) {
                  aa('word not found in node')
                  e && e()
                  return
                }
                0 == y.length && (y = ' ')
                E = null
                ;-1 == y.indexOf('actionGoToR') &&
                  -1 == y.indexOf('actionGoTo') &&
                  -1 == y.indexOf('actionURI') &&
                  this.dl(c) &&
                  ((E = y.match(
                    /\b((?:(https?|ftp):(?:\/{1,3}|[0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?\u00ab\u00bb\u201c\u201d\u2018\u2019]))/gi
                  )),
                  'Generous' == this.dl(c) &&
                    (E = y.match(
                      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi
                    )),
                  E &&
                    ((y = 'actionURI(' + E[0] + '):' + E[0]),
                    (this.Wa[t][D][this.Oa ? 5 : this.JSONPageDataFormat.Nb] =
                      y)),
                  !E && -1 < y.indexOf('@')) &&
                  ((E = y
                    .trim()
                    .match(
                      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
                    )),
                  !E &&
                    (E = (y.trim() + A.trim()).match(
                      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
                    )) &&
                    ((A = 'actionURI(mailto:' + E[0] + '):' + E[0]),
                    (this.Wa[t][z][this.Oa ? 5 : this.JSONPageDataFormat.Nb] =
                      A)),
                  !E &&
                    (E = (y.trim() + A.trim() + I.trim()).match(
                      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
                    )) &&
                    ((A = 'actionURI(mailto:' + E[0] + '):' + E[0]),
                    (this.Wa[t][z][this.Oa ? 5 : this.JSONPageDataFormat.Nb] =
                      A),
                    (I = 'actionURI(mailto:' + E[0] + '):' + E[0]),
                    (this.Wa[t][G][this.Oa ? 5 : this.JSONPageDataFormat.Nb] =
                      I)),
                  E &&
                    ((y = E[0]),
                    y.endsWith('.') && (y = y.substr(0, y.length - 1)),
                    (y = 'actionURI(mailto:' + y + '):' + y),
                    (this.Wa[t][D][this.Oa ? 5 : this.JSONPageDataFormat.Nb] =
                      y)))
                if (0 <= y.indexOf('actionGoToR')) {
                  ;(L = y.substring(
                    y.indexOf('actionGoToR') + 12,
                    y.indexOf(',', y.indexOf('actionGoToR') + 13)
                  )),
                    (y = y.substring(y.indexOf(',') + 1))
                } else {
                  if (0 <= y.indexOf('actionGoTo')) {
                    ;(L = y.substring(
                      y.indexOf('actionGoTo') + 11,
                      y.indexOf(',', y.indexOf('actionGoTo') + 12)
                    )),
                      (y = y.substring(y.indexOf(',') + 1))
                  } else {
                    if (0 <= y.indexOf('actionURI') || E) {
                      if (
                        (0 <= y.indexOf('actionURI(') && 0 < y.indexOf('):')
                          ? ((K = y.substring(
                              y.indexOf('actionURI(') + 10,
                              y.lastIndexOf('):')
                            )),
                            (y = y.substring(y.indexOf('):') + 2)))
                          : ((K = y.substring(y.indexOf('actionURI') + 10)),
                            (y = y.substring(y.indexOf('actionURI') + 10))),
                        -1 == K.indexOf('http') &&
                          -1 == K.indexOf('mailto') &&
                          0 != K.indexOf('/'))
                      ) {
                        K = 'http://' + K
                      } else {
                        if (!E) {
                          for (
                            D = J,
                              z = this.Oa
                                ? F[5]
                                : F[this.JSONPageDataFormat.Nb],
                              G = 1;
                            2 >= G;
                            G++
                          ) {
                            for (
                              D = J;
                              D < this.Wa[t].length &&
                              0 <=
                                this.Wa[t][D].toString().indexOf('actionURI') &&
                              -1 ==
                                this.Wa[t][D].toString().indexOf('actionURI(');

                            ) {
                              ;(A = this.Wa[t][D]),
                                (E = this.Oa
                                  ? A[5]
                                  : A[this.JSONPageDataFormat.Nb]),
                                1 == G
                                  ? 0 <= E.indexOf('actionURI') &&
                                    11 < E.length &&
                                    -1 == E.indexOf('http://') &&
                                    -1 == E.indexOf('https://') &&
                                    -1 == E.indexOf('mailto') &&
                                    (z += E.substring(
                                      E.indexOf('actionURI') + 10
                                    ))
                                  : this.Oa
                                  ? (A[5] = z)
                                  : A[this.JSONPageDataFormat.Nb],
                                D++
                            }
                            2 == G &&
                              -1 == z.indexOf('actionURI(') &&
                              ((y = z),
                              (K = y.substring(y.indexOf('actionURI') + 10)),
                              (y = y.substring(y.indexOf('actionURI') + 10)))
                          }
                        }
                      }
                    }
                  }
                }
                if (L || K || !f || k) {
                  z = (this.Oa ? F[0] : F[this.JSONPageDataFormat.$b]) * m + 0
                  G = (this.Oa ? F[1] : F[this.JSONPageDataFormat.Rc]) * m + 0
                  D = (this.Oa ? F[2] : F[this.JSONPageDataFormat.ue]) * m
                  F = (this.Oa ? F[3] : F[this.JSONPageDataFormat.te]) * m
                  q.Rq(n, y)
                  A = -1 != x && x != z
                  E = J == this.Wa[t].length
                  G + D > u && (D = u - G)
                  z + F > v && (F = v - z)
                  r[n] = {}
                  r[n].left = G
                  r[n].right = G + D
                  r[n].top = z
                  r[n].bottom = z + F
                  r[n].el = '#' + this.aa + 'page_' + t + '_word_' + n
                  r[n].i = n
                  r[n].rm = L
                  r[n].mn = K
                  g +=
                    "<span id='" +
                    this.aa +
                    'page_' +
                    t +
                    '_word_' +
                    n +
                    "' class='flowpaper_pageword flowpaper_pageword_" +
                    this.aa +
                    '_page_' +
                    t +
                    ' flowpaper_pageword_' +
                    this.aa +
                    (null != L || null != K
                      ? ' pdfPageLink_' + c.pageNumber
                      : '') +
                    "' style='left:" +
                    G +
                    'px;top:' +
                    z +
                    'px;width:' +
                    D +
                    'px;height:' +
                    F +
                    'px;margin-left:0px;' +
                    (r[n].rm || r[n].mn ? 'cursor:hand;' : '') +
                    ';' +
                    (eb.browser.msie
                      ? 'background-image:url(' +
                        this.oa +
                        ');color:transparent;'
                      : '') +
                    "'>" +
                    (c.H.Wl ? y : '') +
                    '</span>'
                  if (null != L || null != K) {
                    I = document.createElement('a')
                    I.style.position = 'absolute'
                    I.style.left = Math.floor(G) + h + 'px'
                    I.style.top = Math.floor(z) + 'px'
                    I.style.width = Math.ceil(D) + 'px'
                    I.style.height = Math.ceil(F) + 'px'
                    I.style['margin-left'] = h
                    I.style.cursor = 'pointer'
                    I.setAttribute('data-href', null != K ? K : '')
                    I.setAttribute('rel', 'nofollow noopener')
                    jQuery(I).css('z-index', '99')
                    I.className =
                      'pdfPageLink_' +
                      c.pageNumber +
                      ' flowpaper_interactiveobject_' +
                      this.aa +
                      ' flowpaper_pageword_' +
                      this.aa +
                      '_page_' +
                      t +
                      ' gotoPage_' +
                      L +
                      ' flowpaper_pageword_' +
                      this.aa
                    eb.platform.touchonlydevice &&
                      ((I.style.background = c.H.linkColor),
                      (I.style.opacity = c.H.dd))
                    null != L &&
                      (jQuery(I).data('gotoPage', L),
                      jQuery(I).on('click touchstart', function () {
                        c.H.gotoPage(parseInt(jQuery(this).data('gotoPage')))
                        return !1
                      }))
                    if (null != K) {
                      jQuery(I).on('click touchstart', function (d) {
                        jQuery(c.N).trigger(
                          'onExternalLinkClicked',
                          this.getAttribute('data-href')
                        )
                        d.stopImmediatePropagation()
                        d.preventDefault()
                        return !1
                      })
                    }
                    eb.platform.touchonlydevice ||
                      (jQuery(I).on('mouseover', function () {
                        jQuery(this).stop(!0, !0)
                        jQuery(this).css('background', c.H.linkColor)
                        jQuery(this).css({ opacity: c.H.dd })
                      }),
                      jQuery(I).on('mouseout', function () {
                        jQuery(this).css('background', '')
                        jQuery(this).css({ opacity: 0 })
                      }))
                    'TwoPage' == c.I || 'BookView' == c.I
                      ? (0 == c.pageNumber &&
                          jQuery(c.da + '_1_textoverlay').append(I),
                        1 == c.pageNumber &&
                          jQuery(c.da + '_2_textoverlay').append(I))
                      : jQuery(c.Ea).append(I)
                  }
                  eb.platform.touchdevice &&
                    'Portrait' == c.I &&
                    (A || E
                      ? (E &&
                          ((B += D),
                          (p =
                            p +
                            "<div style='float:left;width:" +
                            D +
                            "px'>" +
                            (' ' == y ? '&nbsp;' : y) +
                            '</div>')),
                        (p =
                          "<div id='" +
                          this.aa +
                          'page_' +
                          t +
                          '_word_' +
                          n +
                          "_wordspan' class='flowpaper_pageword flowpaper_pageword_" +
                          this.aa +
                          '_page_' +
                          t +
                          ' flowpaper_pageword_' +
                          this.aa +
                          "' style='color:transparent;left:" +
                          C +
                          'px;top:' +
                          x +
                          'px;width:' +
                          B +
                          'px;height:' +
                          w +
                          'px;margin-left:' +
                          M +
                          'px;font-size:' +
                          w +
                          'px' +
                          (r[n].rm || r[n].mn ? 'cursor:hand;' : '') +
                          "'>" +
                          p +
                          '</div>'),
                        jQuery(c.Qj).append(p),
                        (x = z),
                        (w = F),
                        (B = D),
                        (C = G),
                        (M = h),
                        (p =
                          "<div style='background-colorfloat:left;width:" +
                          D +
                          "px'>" +
                          (' ' == y ? '&nbsp;' : y) +
                          '</div>'))
                      : (-1 == C && (C = G),
                        -1 == M && (M = h),
                        -1 == x && (x = z),
                        -1 == w && (w = F),
                        (p =
                          p +
                          "<div style='float:left;width:" +
                          D +
                          "px'>" +
                          (' ' == y ? '&nbsp;' : y) +
                          '</div>'),
                        (B += D),
                        (w = F)))
                }
                n++
              }
              q.Oq(r)
              'Portrait' == c.I &&
                (0 == jQuery(c.Mb).length &&
                  ((f = c.fh),
                  (D = c.Fa()),
                  (F = c.Pa()),
                  (h = c.qc()),
                  (f =
                    "<div id='" +
                    f +
                    "' class='flowpaper_textLayer' style='width:" +
                    D +
                    'px;height:' +
                    F +
                    'px;margin-left:' +
                    h +
                    "px;'></div>"),
                  jQuery(c.Ea).append(f)),
                jQuery(c.Mb).append(g))
              'SinglePage' == c.I &&
                (0 == jQuery(c.Mb).length &&
                  ((f = c.fh),
                  (D = c.Fa()),
                  (F = c.Pa()),
                  (h = c.qc()),
                  (f =
                    "<div id='" +
                    f +
                    "' class='flowpaper_textLayer' style='width:" +
                    D +
                    'px;height:' +
                    F +
                    'px;margin-left:' +
                    h +
                    "px;'></div>"),
                  jQuery(c.Ea).append(f)),
                jQuery(c.Mb).append(g))
              c.I == this.Ra(c) &&
                (0 == jQuery(c.Mb).length &&
                  ((f = c.Od + '_textLayer'),
                  (D = c.Fa()),
                  (F = c.Pa()),
                  (h = c.qc()),
                  (f =
                    "<div id='" +
                    f +
                    "' class='flowpaper_textLayer' style='width:" +
                    D +
                    'px;height:' +
                    F +
                    'px;margin-left:' +
                    h +
                    "px;'></div>"),
                  jQuery(c.Ea).append(f)),
                this.Ib(c).qo(this, c, g))
              if ('TwoPage' == c.I || 'BookView' == c.I) {
                0 == c.pageNumber && jQuery(c.da + '_1_textoverlay').append(g),
                  1 == c.pageNumber && jQuery(c.da + '_2_textoverlay').append(g)
              }
              d && jQuery(c).trigger('onAddedTextOverlay', c.pageNumber)
              if (k) {
                for (k = 0; k < this.Pd[c.pageNumber].length; k++) {
                  this.io(
                    c,
                    this.Pd[c.pageNumber][k].fr,
                    this.Pd[c.pageNumber][k].Er
                  )
                }
              }
            }
          }
          null != e && e()
        }
      } else {
        e && e()
      }
    },
    Vc: function (c, d, e, g, h) {
      var f = this
      window.annotations || jQuery(c).unbind('onAddedTextOverlay')
      var k =
        'TwoPage' == c.I || 'BookView' == c.I
          ? c.pages.Z + c.pageNumber
          : c.pageNumber
      'BookView' == c.I && 0 < c.pages.Z && 1 == c.pageNumber && (k = k - 2)
      'SinglePage' == c.I && (k = c.pages.Z)
      if ((c.hb || !e) && c.H.fb - 1 == k) {
        jQuery('.flowpaper_selected').removeClass('flowpaper_selected')
        jQuery('.flowpaper_selected_searchmatch').removeClass(
          'flowpaper_selected_searchmatch'
        )
        jQuery('.flowpaper_selected_default').removeClass(
          'flowpaper_selected_default'
        )
        jQuery('.flowpaper_tmpselection').remove()
        var m = jQuery(
          '.flowpaper_pageword_' +
            f.aa +
            '_page_' +
            c.pageNumber +
            ':not(.flowpaper_annotation_' +
            f.aa +
            '):not(.pdfPageLink_' +
            c.pageNumber +
            ')'
        ).length
        h &&
          (m = jQuery(
            '.flowpaper_pageword_' +
              f.aa +
              '_page_' +
              c.pageNumber +
              ':not(.flowpaper_annotation_' +
              f.aa +
              ')'
          ).length)
        if (f.ab[k] && 0 != m) {
          h = f.ab[k].pi
          for (
            var m = '',
              p = 0,
              n = 0,
              t = -1,
              q = -1,
              r = d.split(' '),
              u = 0,
              v = 0,
              A = 0;
            A < h.length;
            A++
          ) {
            var x = ra((h[A] + '').toLowerCase()),
              u = u + x.length
            u > g && u - d.length <= g + v && (v += d.length)
            x ||
              (jQuery.trim(x) != d && jQuery.trim(m + x) != d) ||
              (x = jQuery.trim(x))
            if (
              0 == d.indexOf(m + x) &&
              (m + x).length <= d.length &&
              ' ' != m + x
            ) {
              if (
                ((m += x),
                -1 == t && ((t = p), (q = p + 1)),
                d.length == x.length && (t = p),
                m.length == d.length)
              ) {
                if ((n++, c.H.Ue == n)) {
                  if ('Portrait' == c.I || 'SinglePage' == c.I) {
                    eb.browser.capabilities.Pb
                      ? jQuery('#pagesContainer_' + f.aa).scrollTo(
                          jQuery(f.ab[k].lb[t].el),
                          0,
                          { axis: 'xy', offset: -30 }
                        )
                      : jQuery('#pagesContainer_' + f.aa)
                          .data('jsp')
                          .scrollToElement(jQuery(f.ab[k].lb[t].el), !1)
                  }
                  for (var w = t; w < p + 1; w++) {
                    c.I == f.Ra(c)
                      ? ((x = jQuery(f.ab[k].lb[w].el).clone()),
                        f.Ib(c).cl(f, c, x, d, !0, w == t, w == p))
                      : (jQuery(f.ab[k].lb[w].el).addClass(
                          'flowpaper_selected'
                        ),
                        jQuery(f.ab[k].lb[w].el).addClass(
                          'flowpaper_selected_default'
                        ),
                        jQuery(f.ab[k].lb[w].el).addClass(
                          'flowpaper_selected_searchmatch'
                        ))
                  }
                } else {
                  ;(m = ''), (t = -1)
                }
              }
            } else {
              if (0 <= (m + x).indexOf(r[0])) {
                ;-1 == t && ((t = p), (q = p + 1))
                m += x
                if (1 < r.length) {
                  for (x = 0; x < r.length - 1; x++) {
                    0 < r[x].length &&
                    h.length > p + 1 + x &&
                    0 <= (m + h[p + 1 + x]).toLowerCase().indexOf(r[x])
                      ? ((m += h[p + 1 + x].toLowerCase()), (q = p + 1 + x + 1))
                      : ((m = ''), (q = t = -1))
                  }
                }
                ;-1 == m.indexOf(d) && ((m = ''), (q = t = -1))
                w = (
                  m.match(
                    new RegExp(
                      d.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
                      'g'
                    )
                  ) || []
                ).length
                if (0 < m.length) {
                  for (var B = 0; B < w; B++) {
                    if ((-1 < m.indexOf(d) && n++, c.H.Ue == n)) {
                      for (
                        var C = jQuery(f.ab[k].lb[t].el),
                          M =
                            parseFloat(
                              C.css('left').substring(
                                0,
                                C.css('left').length - 2
                              )
                            ) - (c.I == f.Ra(c) ? c.qc() : 0),
                          x = C.clone(),
                          E = 0,
                          J = 0,
                          F = 0;
                        t < q;
                        t++
                      ) {
                        E += parseFloat(
                          jQuery(f.ab[k].lb[t].el)
                            .css('width')
                            .substring(0, C.css('width').length - 2)
                        )
                      }
                      J = 1 - (m.length - d.length) / m.length
                      q = -1
                      for (t = 0; t < B + 1; t++) {
                        ;(q = m.indexOf(d, q + 1)), (F = q / m.length)
                      }
                      x.addClass('flowpaper_tmpselection')
                      x.attr('id', x.attr('id') + 'tmp')
                      x.addClass('flowpaper_selected')
                      x.addClass('flowpaper_selected_searchmatch')
                      x.addClass('flowpaper_selected_default')
                      x.css('width', E * J + 'px')
                      x.css('left', M + E * F + 'px')
                      if ('Portrait' == c.I || 'SinglePage' == c.I) {
                        jQuery(c.Mb).append(x),
                          eb.browser.capabilities.Pb
                            ? jQuery('#pagesContainer_' + f.aa).scrollTo(x, 0, {
                                axis: 'xy',
                                offset: -30,
                              })
                            : jQuery('#pagesContainer_' + f.aa)
                                .data('jsp')
                                .scrollToElement(x, !1)
                      }
                      c.I == f.Ra(c) && f.Ib(c).cl(f, c, x, d)
                      'BookView' == c.I &&
                        (0 == k
                          ? jQuery(
                              '#dummyPage_0_' + f.aa + '_1_textoverlay'
                            ).append(x)
                          : jQuery(
                              '#dummyPage_' +
                                ((k - 1) % 2) +
                                '_' +
                                f.aa +
                                '_' +
                                (((k - 1) % 2) + 1) +
                                '_textoverlay'
                            ).append(x))
                      'TwoPage' == c.I &&
                        jQuery(
                          '#dummyPage_' +
                            (k % 2) +
                            '_' +
                            f.aa +
                            '_' +
                            ((k % 2) + 1) +
                            '_textoverlay'
                        ).append(x)
                      q = t = -1
                    } else {
                      B == w - 1 && ((m = ''), (q = t = -1))
                    }
                  }
                }
              } else {
                0 < m.length && ((m = ''), (t = -1))
              }
            }
            p++
          }
        } else {
          jQuery(c).bind('onAddedTextOverlay', function () {
            f.Vc(c, d, e, g, !0)
          }),
            f.Wc(c, e, null, !0)
        }
      }
    },
    gf: function (c, d, e) {
      null == this.Pd && (this.Pd = Array(this.Wa.length))
      null == this.Pd[c.pageNumber] && (this.Pd[c.pageNumber] = [])
      var g = {}
      g.fr = d
      g.Er = e
      this.Pd[c.pageNumber][this.Pd[c.pageNumber].length] = g
    },
    io: function (c, d, e) {
      jQuery(c).unbind('onAddedTextOverlay')
      var g =
        'TwoPage' == c.I || 'BookView' == c.I
          ? c.pages.Z + c.pageNumber
          : c.pageNumber
      'BookView' == c.I && 0 < c.pages.Z && 1 == c.pageNumber && (g = g - 2)
      'SinglePage' == c.I && (g = c.pages.Z)
      for (
        var h = this.ab[g].pi, f = -1, k = -1, m = 0, p = 0;
        p < h.length;
        p++
      ) {
        var n = h[p] + ''
        m >= d && -1 == f && (f = p)
        if (m + n.length >= d + e && -1 == k && ((k = p), -1 != f)) {
          break
        }
        m += n.length
      }
      for (d = f; d < k + 1; d++) {
        c.I == this.Ra(c)
          ? jQuery(this.ab[g].lb[d].el).clone()
          : (jQuery(this.ab[g].lb[d].el).addClass('flowpaper_selected'),
            jQuery(this.ab[g].lb[d].el).addClass('flowpaper_selected_yellow'),
            jQuery(this.ab[g].lb[d].el).addClass(
              'flowpaper_selected_searchmatch'
            ))
      }
    },
    Na: function (c, d) {
      this.Wc(c, null == d, d)
    },
  }
  return f
})())
window.WordPage = function (f, c) {
  this.aa = f
  this.pageNumber = c
  this.pi = []
  this.lb = null
  this.Rq = function (c, e) {
    this.pi[c] = e
  }
  this.Oq = function (c) {
    this.lb = c
  }
  this.match = function (c, e) {
    var g,
      h = null
    g = '#page_' + this.pageNumber + '_' + this.aa
    0 == jQuery(g).length &&
      (g = '#dummyPage_' + this.pageNumber + '_' + this.aa)
    g = jQuery(g).offset()
    'SinglePage' == window.$FlowPaper(this.aa).I &&
      ((g = '#dummyPage_0_' + this.aa), (g = jQuery(g).offset()))
    if (
      'TwoPage' == window.$FlowPaper(this.aa).I ||
      'BookView' == window.$FlowPaper(this.aa).I
    ) {
      g =
        0 == this.pageNumber || 'TwoPage' == window.$FlowPaper(this.aa).I
          ? jQuery(
              '#dummyPage_' +
                (this.pageNumber % 2) +
                '_' +
                this.aa +
                '_' +
                ((this.pageNumber % 2) + 1) +
                '_textoverlay'
            ).offset()
          : jQuery(
              '#dummyPage_' +
                ((this.pageNumber - 1) % 2) +
                '_' +
                this.aa +
                '_' +
                (((this.pageNumber - 1) % 2) + 1) +
                '_textoverlay'
            ).offset()
    }
    c.top = c.top - g.top
    c.left = c.left - g.left
    for (g = 0; g < this.lb.length; g++) {
      this.Cp(c, this.lb[g], e) &&
        (null == h ||
          (null != h && h.top < this.lb[g].top) ||
          (null != h &&
            h.top <= this.lb[g].top &&
            null != h &&
            h.left < this.lb[g].left)) &&
        ((h = this.lb[g]), (h.pageNumber = this.pageNumber))
    }
    return h
  }
  this.lm = function (c) {
    for (var e = 0; e < this.lb.length; e++) {
      if (this.lb[e] && this.lb[e].el == '#' + c) {
        return this.lb[e]
      }
    }
    return null
  }
  this.Cp = function (c, e, g) {
    return e
      ? g
        ? c.left + 3 >= e.left &&
          c.left - 3 <= e.right &&
          c.top + 3 >= e.top &&
          c.top - 3 <= e.bottom
        : c.left + 3 >= e.left && c.top + 3 >= e.top
      : !1
  }
  this.gg = function (c, e) {
    var g = window.a,
      h = window.b,
      f = new Ja(),
      k,
      m,
      p = 0,
      n = -1
    if (null == g) {
      return f
    }
    if (g && h) {
      var t = [],
        q
      g.top > h.top ? ((k = h), (m = g)) : ((k = g), (m = h))
      for (k = k.i; k <= m.i; k++) {
        if (this.lb[k]) {
          var r = jQuery(this.lb[k].el)
          0 != r.length &&
            ((q = parseInt(
              r.attr('id').substring(r.attr('id').indexOf('word_') + 5)
            )),
            (n =
              parseInt(
                r
                  .attr('id')
                  .substring(
                    r.attr('id').indexOf('page_') + 5,
                    r.attr('id').indexOf('word_') - 1
                  )
              ) + 1),
            0 <= q && t.push(this.pi[q]),
            p++,
            c &&
              (r.addClass('flowpaper_selected'),
              r.addClass(e),
              'flowpaper_selected_strikeout' != e ||
                r.data('adjusted') ||
                ((q = r.height()),
                r.css('margin-top', q / 2 - q / 3 / 1.5),
                r.height(q / 2.3),
                r.data('adjusted', !0))))
        }
      }
      eb.platform.touchonlydevice ||
        jQuery('.flowpaper_selector').val(t.join('')).select()
    } else {
      eb.platform.touchdevice || jQuery('#selector').val('')
    }
    f.ft = p
    f.au = g.left
    f.bu = g.right
    f.cu = g.top
    f.$t = g.bottom
    f.Xt = g.left
    f.Yt = g.right
    f.Zt = g.top
    f.Wt = g.bottom
    f.$o = null != t && 0 < t.length ? t[0] : null
    f.qt = null != t && 0 < t.length ? t[t.length - 1] : f.$o
    f.ap = null != g ? g.i : -1
    f.st = null != h ? h.i : f.ap
    f.text = null != t ? t.join('') : ''
    f.page = n
    f.Vt = this
    return f
  }
}
function Ja() {}
function Ka(f) {
  var c = hoverPage
  if ((f = window['wordPageList_' + f])) {
    return f.length >= c ? f[c] : null
  }
}
var W = (function () {
    function f(c, d, e, g) {
      this.H = d
      this.N = c
      this.pages = {}
      this.selectors = {}
      this.container = 'pagesContainer_' + e
      this.L = '#' + this.container
      this.Z = null == g ? 0 : g - 1
      this.Ye = g
      this.ne = this.Dg = null
      this.cd = this.bd = -1
      this.Te = this.zd = 0
      this.initialized = !1
      this.qa = eb.platform.touchonlydevice && !eb.platform.Fb ? 30 : 22
      this.aa = this.H.aa
      this.document = this.H.document
    }
    f.prototype = {
      V: function (c) {
        if (0 < c.indexOf('undefined')) {
          return jQuery(null)
        }
        this.selectors || (this.selectors = {})
        this.selectors[c] || (this.selectors[c] = jQuery(c))
        return this.selectors[c]
      },
      Pj: function () {
        null != this.ej && (window.clearTimeout(this.ej), (this.ej = null))
        this.H.J && this.H.I == this.H.J.ia && this.H.J.vb.Pj(this)
      },
      kc: function () {
        return (
          (this.H.J && this.H.I == this.H.J.ia && this.H.J.vb.kc(this)) ||
          'SinglePage' == this.H.I
        )
      },
      Cq: function () {
        return !(this.H.J && this.H.J.vb.kc(this))
      },
      Ya: function (c, d, e) {
        var g = this.H.scale
        this.H.scale = c
        if ('TwoPage' == this.H.I || 'BookView' == this.H.I) {
          var h = 100 * c + '%'
          eb.platform.touchdevice ||
            this.V(this.L).css({ width: h, 'margin-left': this.mg() })
        }
        this.pages[0] && (this.pages[0].scale = c)
        if ('Portrait' == this.H.I || 'SinglePage' == this.H.I) {
          for (h = this.ah = 0; h < this.document.numPages; h++) {
            if (this.$a(h)) {
              var f = this.pages[h].Fa(c)
              f > this.ah && (this.ah = f)
            }
          }
        }
        for (h = 0; h < this.document.numPages; h++) {
          this.$a(h) && ((this.pages[h].scale = c), this.pages[h].Ya())
        }
        this.H.J && this.H.I == this.H.J.ia && this.H.J.vb.Ya(this, g, c, d, e)
      },
      dispose: function () {
        for (var c = 0; c < this.document.numPages; c++) {
          this.pages[c].dispose(), delete this.pages[c]
        }
        this.selectors = this.pages = this.N = this.H = null
      },
      resize: function (c, d, e) {
        if ('Portrait' == this.H.I || 'SinglePage' == this.H.I) {
          ;(d += eb.browser.capabilities.Pb ? 0 : 14),
            (c = c - (eb.browser.msie ? 0 : 2))
        }
        'ThumbView' == this.H.I && (d = d - 10)
        this.V(this.L).css({ width: c, height: d })
        'TwoPage' == this.H.I &&
          ((this.H.Ak = this.N.height() - (eb.platform.touchdevice ? 0 : 27)),
          (this.H.oh = c / 2 - 2),
          this.V(this.L).height(this.H.Ak),
          this.V('#' + this.container + '_2').css(
            'left',
            this.V('#' + this.container).width() / 2
          ),
          eb.platform.touchdevice ||
            (this.V(this.L + '_1').width(this.H.oh),
            this.V(this.L + '_2').width(this.H.oh)))
        if (this.H.J && this.H.I == this.H.J.ia) {
          this.H.J.vb.resize(this, c, d, e)
        } else {
          for (this.Cd(), c = 0; c < this.document.numPages; c++) {
            this.$a(c) &&
              (this.pages[c].Ya(),
              this.H.renderer.Bb ||
                this.H.renderer.Ba ||
                (this.pages[c].va = !1))
          }
        }
        this.Ck = null
        null != this.jScrollPane &&
          (this.jScrollPane.data('jsp').reinitialise(this.yd),
          this.jScrollPane.data('jsp').scrollTo(this.bd, this.cd, !1))
      },
      Me: function (c, d) {
        var e = this
        if (!e.ka) {
          var g = !1
          'function' === typeof e.vj && e.bt()
          jQuery('.flowpaper_pageword').each(function () {
            jQuery(this).hasClass('flowpaper_selected_default') && (g = !0)
          })
          null != e.touchwipe && (e.touchwipe.config.preventDefaultEvents = !1)
          e.kc() ||
            (jQuery('.flowpaper_pageword_' + e.aa).remove(),
            setTimeout(function () {
              ;('TwoPage' != e.H.I && 'BookView' != e.H.I) || e.vc()
              e.Na()
              g && e.getPage(e.H.fb - 1).Vc(e.H.oe, !1)
            }, 500))
          e.H.J && e.H.I == e.H.J.ia ? e.H.J.vb.Me(e, c, d) : e.Ya(1)
          null != e.jScrollPane
            ? (e.jScrollPane.data('jsp').reinitialise(e.yd),
              e.jScrollPane.data('jsp').scrollTo(e.bd, e.cd, !1))
            : ('TwoPage' != e.H.I && 'BookView' != e.H.I) ||
              e
                .V(e.L)
                .parent()
                .scrollTo({ left: e.bd + 'px', top: e.cd + 'px' }, 0, {
                  axis: 'xy',
                })
        }
      },
      Id: function (c) {
        var d = this
        if (!d.ka) {
          var e = !1
          null != d.touchwipe && (d.touchwipe.config.preventDefaultEvents = !0)
          'function' === typeof d.vj && d.dt()
          jQuery('.flowpaper_pageword').each(function () {
            jQuery(this).hasClass('flowpaper_selected_default') && (e = !0)
          })
          d.kc() || jQuery('.flowpaper_pageword_' + d.aa).remove()
          d.H.J && d.H.I == d.H.J.ia
            ? d.H.J.vb.Id(d, c)
            : d.Ya(window.FitHeightScale)
          setTimeout(function () {
            d.Na()
            e && d.getPage(d.H.fb - 1).Vc(d.H.oe, !1)
          }, 500)
          d.Na()
          null != d.jScrollPane
            ? (d.jScrollPane.data('jsp').scrollTo(0, 0, !1),
              d.jScrollPane.data('jsp').reinitialise(d.yd))
            : d.V(d.L).parent().scrollTo({ left: 0, top: 0 }, 0, { axis: 'xy' })
        }
      },
      Oj: function () {
        var c = this
        c.kf()
        if (c.H.J && c.H.I == c.H.J.ia) {
          c.H.J.vb.Oj(c)
        } else {
          if (
            'SinglePage' == c.H.I ||
            'TwoPage' == c.H.I ||
            'BookView' == c.H.I
          ) {
            c.touchwipe = c.V(c.L).touchwipe({
              wipeLeft: function () {
                if (
                  !c.H.xd &&
                  !window.Sb &&
                  null == c.ka &&
                  (('TwoPage' != c.H.I && 'BookView' != c.H.I) ||
                    1 == c.H.scale ||
                    c.next(),
                  'SinglePage' == c.H.I)
                ) {
                  var d = jQuery(c.L).width() - 5,
                    g = 1 < c.H.getTotalPages() ? c.H.ma - 1 : 0
                  0 > g && (g = 0)
                  var h =
                      c.getPage(g).dimensions.xa / c.getPage(g).dimensions.Ga,
                    d = Math.round(100 * (d / (c.getPage(g).Ha * h) - 0.03))
                  100 * c.H.scale < 1.2 * d && c.next()
                }
              },
              wipeRight: function () {
                if (
                  !c.H.xd &&
                  !window.Sb &&
                  null == c.ka &&
                  (('TwoPage' != c.H.I && 'BookView' != c.H.I) ||
                    1 == c.H.scale ||
                    c.previous(),
                  'SinglePage' == c.H.I)
                ) {
                  var d = jQuery(c.L).width() - 15,
                    g = 1 < c.H.getTotalPages() ? c.H.ma - 1 : 0
                  0 > g && (g = 0)
                  var h =
                      c.getPage(g).dimensions.xa / c.getPage(g).dimensions.Ga,
                    d = Math.round(100 * (d / (c.getPage(g).Ha * h) - 0.03))
                  100 * c.H.scale < 1.2 * d && c.previous()
                }
              },
              preventDefaultEvents:
                'TwoPage' == c.H.I ||
                'BookView' == c.H.I ||
                'SinglePage' == c.H.I,
              min_move_x: eb.platform.Fb ? 150 : 200,
              min_move_y: 500,
            })
          }
        }
        if (eb.platform.mobilepreview) {
          c.V(c.L).on('mousedown', function (d) {
            c.bd = d.pageX
            c.cd = d.pageY
          })
        }
        c.V(c.L).on('touchstart', function (d) {
          c.bd = d.originalEvent.touches[0].pageX
          c.cd = d.originalEvent.touches[0].pageY
        })
        c.V(c.L).on(
          eb.platform.mobilepreview ? 'mouseup' : 'touchend',
          function () {
            null != c.H.pages.jScrollPane &&
              c.H.pages.jScrollPane.data('jsp').enable &&
              c.H.pages.jScrollPane.data('jsp').enable()
            if (null != c.ob && 'SinglePage' == c.H.I) {
              for (var d = 0; d < c.document.numPages; d++) {
                c.$a(d) &&
                  c
                    .V(c.pages[d].Aa)
                    .transition({ y: 0, scale: 1 }, 0, 'ease', function () {
                      c.ka > c.H.scale &&
                        c.ka - c.H.scale < c.H.document.ZoomInterval &&
                        (c.ka += c.H.document.ZoomInterval)
                      0 < c.rd - c.De &&
                        c.ka < c.H.scale &&
                        (c.ka = c.H.scale + c.H.document.ZoomInterval)
                      c.H.sb(c.ka, { Pg: !0 })
                      c.ka = null
                    })
              }
              c.pages[0] && c.pages[0].kf()
              c.V(c.L).addClass('flowpaper_pages_border')
              c.Tj = c.ob < c.ka
              c.ob = null
              c.Qf = null
              c.ka = null
              c.Lb = null
              c.Jc = null
            }
          }
        )
        if (c.H.J && c.H.I == c.H.J.ia) {
          c.H.J.vb.jl(c)
        } else {
          if (eb.platform.touchdevice) {
            var d = c.V(c.L)
            d.doubletap(
              function (d) {
                if ('TwoPage' == c.H.I || 'BookView' == c.H.I) {
                  ;('TwoPage' != c.H.I && 'BookView' != c.H.I) || 1 == c.H.scale
                    ? ('TwoPage' != c.H.I && 'BookView' != c.H.I) ||
                      1 != c.H.scale ||
                      c.Id()
                    : c.Me(d.target),
                    d.preventDefault()
                }
              },
              null,
              300
            )
          } else {
            c.H.Eb &&
              ((d = c.V(c.L)),
              d.doubletap(
                function (d) {
                  var g = jQuery('.activeElement').data('hint-pageNumber')
                  window.parent.postMessage('EditPage:' + g, '*')
                  window.clearTimeout(c.Dj)
                  d.preventDefault()
                  d.stopImmediatePropagation()
                },
                null,
                300
              ))
          }
        }
        c.V(c.L).on('scroll gesturechange', function () {
          'SinglePage' == c.H.I
            ? c.H.renderer.yb && !c.ka && c.H.renderer.hd(c.pages[0])
            : (c.H.J && c.H.I == c.H.J.ia) ||
              (eb.platform.ios && c.ek(-1 * c.V(c.L).scrollTop()),
              eb.platform.ios
                ? (setTimeout(function () {
                    c.qh()
                    c.Ad()
                  }, 1000),
                  setTimeout(function () {
                    c.qh()
                    c.Ad()
                  }, 2000),
                  setTimeout(function () {
                    c.qh()
                    c.Ad()
                  }, 3000))
                : c.qh(),
              c.Ad(),
              c.Na(),
              null != c.Dg && (window.clearTimeout(c.Dg), (c.Dg = null)),
              (c.Dg = setTimeout(function () {
                c.Tl()
                window.clearTimeout(c.Dg)
                c.Dg = null
              }, 100)),
              (c.Bt = !0))
        })
        this.Tl()
      },
      jl: function () {},
      ek: function (c) {
        for (var d = 0; d < this.document.numPages; d++) {
          this.$a(d) && this.pages[d].ek(c)
        }
      },
      an: function () {
        var c = this.V(this.L).css('transform') + ''
        null != c &&
          ((c = c.replace('translate', '')),
          (c = c.replace('(', '')),
          (c = c.replace(')', '')),
          (c = c.replace('px', '')),
          (c = c.split(',')),
          (this.zd = parseFloat(c[0])),
          (this.Te = parseFloat(c[1])),
          isNaN(this.zd) && (this.Te = this.zd = 0))
      },
      ql: function (c, d) {
        this.V(this.L).transition(
          {
            x: this.zd + (c - this.Lb) / this.H.scale,
            y: this.Te + (d - this.Jc) / this.H.scale,
          },
          0
        )
      },
      Fh: function (c, d) {
        this.H.J && this.H.J.vb.Fh(this, c, d)
      },
      mp: function (c, d) {
        var e = this.N.width()
        return c / d - (this.Ud / e / d) * e
      },
      np: function (c) {
        var d = this.N.height()
        return c / this.H.scale - (this.Vd / d / this.H.scale) * d
      },
      kf: function () {
        this.H.J && this.H.J.vb.kf(this)
      },
      tj: function () {
        if (this.H.J) {
          return this.H.J.vb.tj(this)
        }
      },
      getTotalPages: function () {
        return this.document.numPages
      },
      Wi: function (c) {
        var d = this
        c.empty()
        jQuery(d.H.renderer).on('onTextDataUpdated', function () {
          d.Na(d)
        })
        null != d.H.ne ||
          d.H.document.DisableOverflow ||
          d.H.nb ||
          ((d.H.ne = d.N.height()),
          eb.platform.touchonlydevice
            ? d.H.oc || d.N.height(d.H.ne - 10)
            : d.N.height(d.H.ne - 27))
        var e =
          d.H.J && d.H.J.backgroundColor
            ? 'background-color:' + d.H.J.backgroundColor + ';'
            : ''
        d.H.J && d.H.J.backgroundImage && (e = 'background-color:transparent;')
        if ('Portrait' == d.H.I || 'SinglePage' == d.H.I) {
          eb.platform.touchonlydevice &&
            'SinglePage' == d.H.I &&
            (eb.browser.capabilities.Pb = !1)
          var g =
              jQuery(d.H.M).height() +
              (window.zine && 'Portrait' == d.H.Db ? 20 : 0),
            h = eb.platform.touchonlydevice ? 31 : 26
          window.zine &&
            'Portrait' != d.H.Db &&
            (h = eb.platform.touchonlydevice ? 41 : 36)
          var g =
              d.N.height() +
              (eb.browser.capabilities.Pb
                ? window.annotations
                  ? 0
                  : h - g
                : -5),
            h = d.N.width() - 2,
            f = 1 < d.Ye ? 'visibility:hidden;' : '',
            k =
              eb.browser.msie && 9 > eb.browser.version
                ? 'position:relative;'
                : ''
          d.H.document.DisableOverflow
            ? c.append(
                "<div id='" +
                  d.container +
                  "' class='flowpaper_pages' style='overflow:hidden;padding:0;margin:0;'></div>"
              )
            : c.append(
                "<div id='" +
                  d.container +
                  "' class='flowpaper_pages " +
                  (window.annotations ? '' : 'flowpaper_pages_border') +
                  "' style='" +
                  (eb.platform.nn ? 'touch-action: none;' : '') +
                  '-moz-user-select:none;-webkit-user-select:none;' +
                  k +
                  ';' +
                  f +
                  'height:' +
                  g +
                  'px;width:' +
                  h +
                  'px;overflow-y: auto;overflow-x: auto;;-webkit-overflow-scrolling: touch;-webkit-backface-visibility: hidden;-webkit-perspective: 1000;' +
                  e +
                  ";'></div>"
              )
          d.H.document.DisableOverflow ||
            (eb.browser.capabilities.Pb
              ? eb.platform.touchonlydevice
                ? (jQuery(c).css('overflow-y', 'auto'),
                  jQuery(c).css('overflow-x', 'auto'),
                  jQuery(c).css('-webkit-overflow-scrolling', 'touch'))
                : (jQuery(c).css('overflow-y', 'visible'),
                  jQuery(c).css('overflow-x', 'visible'),
                  jQuery(c).css('-webkit-overflow-scrolling', 'visible'))
              : jQuery(c).css('-webkit-overflow-scrolling', 'hidden'))
          eb.platform.touchdevice &&
            (eb.platform.ipad ||
              eb.platform.iphone ||
              eb.platform.android ||
              eb.platform.nn) &&
            (jQuery(d.L).on('touchmove', function (c) {
              if (
                !eb.platform.ios &&
                2 == c.originalEvent.touches.length &&
                (d.H.pages.jScrollPane &&
                  d.H.pages.jScrollPane.data('jsp').disable(),
                1 != d.bj)
              ) {
                c.preventDefault && c.preventDefault()
                c.returnValue = !1
                c = Math.sqrt(
                  (c.originalEvent.touches[0].pageX -
                    c.originalEvent.touches[1].pageX) *
                    (c.originalEvent.touches[0].pageX -
                      c.originalEvent.touches[1].pageX) +
                    (c.originalEvent.touches[0].pageY -
                      c.originalEvent.touches[1].pageY) *
                      (c.originalEvent.touches[0].pageY -
                        c.originalEvent.touches[1].pageY)
                )
                c *= 2
                null == d.ka &&
                  (d.V(d.L).removeClass('flowpaper_pages_border'),
                  (d.ob = 1),
                  (d.Qf = c))
                null == d.ka &&
                  ((d.ob = 1),
                  (d.De =
                    1 +
                    (jQuery(d.pages[0].Aa).width() - d.N.width()) /
                      d.N.width()))
                var e = (c =
                  (d.ob + (c - d.Qf) / jQuery(d.L).width() - d.ob) / d.ob)
                d.kc() ||
                  (1 < e && (e = 1),
                  -0.3 > e && (e = -0.3),
                  0 < c && (c *= 0.7))
                d.rd = d.De + d.De * c
                d.rd < d.H.document.MinZoomSize &&
                  (d.rd = d.H.document.MinZoomSize)
                d.rd > d.H.document.MaxZoomSize &&
                  (d.rd = d.H.document.MaxZoomSize)
                d.Tc = 1 + (d.rd - d.De)
                d.ka = d.pages[0].Kl(jQuery(d.pages[0].Aa).width() * d.Tc)
                d.ka < d.H.document.MinZoomSize &&
                  (d.ka = d.H.document.MinZoomSize)
                d.ka > d.H.document.MaxZoomSize &&
                  (d.ka = d.H.document.MaxZoomSize)
                jQuery(d.pages[0].Aa).width() > jQuery(d.pages[0].Aa).height()
                  ? d.ka < d.H.Rh() && ((d.Tc = d.dh), (d.ka = d.H.Rh()))
                  : d.ka < d.H.yf() && ((d.Tc = d.dh), (d.ka = d.H.yf()))
                d.dh = d.Tc
                if (d.kc() && 0 < d.Tc) {
                  for (
                    jQuery('.flowpaper_annotation_' + d.aa).hide(), c = 0;
                    c < d.document.numPages;
                    c++
                  ) {
                    d.$a(c) &&
                      jQuery(d.pages[c].Aa).transition(
                        { transformOrigin: '50% 50%', scale: d.Tc },
                        0,
                        'ease',
                        function () {}
                      )
                  }
                }
              }
            }),
            jQuery(d.L).on('touchstart', function () {}),
            jQuery(d.L).on('gesturechange', function (c) {
              if (1 != d.Br && 1 != d.bj) {
                d.H.renderer.yb &&
                  jQuery('.flowpaper_flipview_canvas_highres').hide()
                null == d.ka &&
                  ((d.ob = 1),
                  (d.De =
                    1 +
                    (jQuery(d.pages[0].Aa).width() - d.N.width()) /
                      d.N.width()))
                var e,
                  g = (e = (c.originalEvent.scale - d.ob) / d.ob)
                d.kc() ||
                  (1 < g && (g = 1),
                  -0.3 > g && (g = -0.3),
                  0 < e && (e *= 0.7))
                d.rd = d.De + d.De * e
                d.rd < d.H.document.MinZoomSize &&
                  (d.rd = d.H.document.MinZoomSize)
                d.rd > d.H.document.MaxZoomSize &&
                  (d.rd = d.H.document.MaxZoomSize)
                d.Tc = 1 + (d.rd - d.De)
                d.ka = d.pages[0].Kl(jQuery(d.pages[0].Aa).width() * d.Tc)
                jQuery(d.pages[0].Aa).width() > jQuery(d.pages[0].Aa).height()
                  ? d.ka < d.H.Rh() && ((d.Tc = d.dh), (d.ka = d.H.Rh()))
                  : d.ka < d.H.yf() && ((d.Tc = d.dh), (d.ka = d.H.yf()))
                d.ka < d.H.document.MinZoomSize &&
                  (d.ka = d.H.document.MinZoomSize)
                d.ka > d.H.document.MaxZoomSize &&
                  (d.ka = d.H.document.MaxZoomSize)
                c.preventDefault && c.preventDefault()
                d.dh = d.Tc
                if (d.kc() && 0 < d.Tc) {
                  for (
                    jQuery('.flowpaper_annotation_' + d.aa).hide(), c = 0;
                    c < d.document.numPages;
                    c++
                  ) {
                    d.$a(c) &&
                      jQuery(d.pages[c].Aa).transition(
                        { transformOrigin: '50% 50%', scale: d.Tc },
                        0,
                        'ease',
                        function () {}
                      )
                  }
                }
                !d.kc() &&
                  (0.7 <= g || -0.3 >= g) &&
                  ((d.Br = !0),
                  d.ka > d.H.scale &&
                    d.ka - d.H.scale < d.H.document.ZoomInterval &&
                    (d.ka += d.H.document.ZoomInterval),
                  d.H.sb(d.ka),
                  (d.ka = null))
              }
            }),
            jQuery(d.L).on('gestureend', function () {}))
          d.H.renderer.ua &&
            jQuery(d.H.renderer).bind('onTextDataUpdated', function (c, e) {
              for (var g = e + 12, h = e - 2; h < g; h++) {
                var f = d.getPage(h)
                if (f) {
                  var l = jQuery(f.Aa).get(0)
                  if (l) {
                    var k = f.Fa(),
                      v = f.Pa(),
                      A = 1.5 < d.H.renderer.Za ? d.H.renderer.Za : 1.5
                    l.width != k * A &&
                      (jQuery(l).data('needs-overlay', 1),
                      d.H.document.DisableOverflow && (A = 2),
                      (l.width = k * A),
                      (l.height = v * A),
                      f.Qd(l).then(function (c) {
                        if (d.H.document.DisableOverflow) {
                          var e = jQuery(c).css('background-image')
                          0 < e.length && 'none' != e
                            ? (jQuery(c).css(
                                'background-image',
                                "url('" + c.toDataURL() + "')," + e
                              ),
                              (e = jQuery(c)
                                .attr('id')
                                .substr(
                                  5,
                                  jQuery(c).attr('id').lastIndexOf('_') - 5
                                )),
                              jQuery('#' + d.aa).trigger(
                                'onPageLoaded',
                                parseInt(e) + 1
                              ),
                              ca(c))
                            : jQuery(c).css(
                                'background-image',
                                "url('" + c.toDataURL() + "')"
                              )
                        }
                      }))
                  }
                }
              }
            })
        }
        if ('TwoPage' == d.H.I || 'BookView' == d.H.I) {
          ;(g = d.N.height() - (eb.browser.msie ? 37 : 0)),
            (h = d.N.width() - (eb.browser.msie ? 0 : 20)),
            (e = 0),
            1 == d.H.ma && 'BookView' == d.H.I && ((e = h / 3), (h -= e)),
            eb.platform.touchdevice
              ? eb.browser.capabilities.Pb
                ? (c.append(
                    "<div id='" +
                      d.container +
                      "' style='-moz-user-select:none;-webkit-user-select:none;margin-left:" +
                      e +
                      "px;position:relative;width:100%;' class='flowpaper_twopage_container'><div id='" +
                      d.container +
                      "_1' class='flowpaper_pages' style='position:absolute;top:0px;height:99%;margin-top:20px;'></div><div id='" +
                      d.container +
                      "_2' class='flowpaper_pages' style='position:absolute;top:0px;height:99%;margin-top:20px;'></div></div>"
                  ),
                  jQuery(c).css('overflow-y', 'scroll'),
                  jQuery(c).css('overflow-x', 'scroll'),
                  jQuery(c).css('-webkit-overflow-scrolling', 'touch'))
                : (c.append(
                    "<div id='" +
                      d.container +
                      "_jpane' style='-moz-user-select:none;-webkit-user-select:none;height:" +
                      g +
                      'px;width:100%;' +
                      (window.eb.browser.msie || eb.platform.android
                        ? 'overflow-y: scroll;overflow-x: scroll;'
                        : 'overflow-y: auto;overflow-x: auto;') +
                      ";-webkit-overflow-scrolling: touch;'><div id='" +
                      d.container +
                      "' style='margin-left:" +
                      e +
                      "px;position:relative;height:100%;width:100%' class='flowpaper_twopage_container'><div id='" +
                      d.container +
                      "_1' class='flowpaper_pages' style='position:absolute;top:0px;height:99%;margin-top:20px;'></div><div id='" +
                      d.container +
                      "_2' class='flowpaper_pages' style='position:absolute;top:0px;height:99%;margin-top:20px;'></div></div></div>"
                  ),
                  jQuery(c).css('overflow-y', 'visible'),
                  jQuery(c).css('overflow-x', 'visible'),
                  jQuery(c).css('-webkit-overflow-scrolling', 'visible'))
              : (c.append(
                  "<div id='" +
                    d.container +
                    "' style='-moz-user-select:none;-webkit-user-select:none;margin-left:" +
                    e +
                    "px;position:relative;' class='flowpaper_twopage_container'><div id='" +
                    d.container +
                    "_1' class='flowpaper_pages' style='position:absolute;top:0px;height:99%;margin-top:" +
                    (eb.browser.msie ? 10 : 20) +
                    "px;'></div><div id='" +
                    d.container +
                    "_2' class='flowpaper_pages " +
                    ('BookView' == d.H.I && 2 > d.Ye
                      ? 'flowpaper_hidden'
                      : '') +
                    "' style='position:absolute;top:0px;height:99%;margin-top:" +
                    (eb.browser.msie ? 10 : 20) +
                    "px;'></div></div>"
                ),
                jQuery(c).css('overflow-y', 'auto'),
                jQuery(c).css('overflow-x', 'auto'),
                jQuery(c).css('-webkit-overflow-scrolling', 'touch')),
            null == d.H.Ak &&
              ((d.H.Ak = d.N.height() - (eb.platform.touchdevice ? 0 : 27)),
              (d.H.oh = d.V(d.L).width() / 2 - 2)),
            d.V(d.L).css({ height: '90%' }),
            d
              .V('#' + this.container + '_2')
              .css('left', d.V('#' + d.container).width() / 2),
            eb.platform.touchdevice ||
              (d.V(d.L + '_1').width(d.H.oh), d.V(d.L + '_2').width(d.H.oh))
        }
        'ThumbView' == d.H.I &&
          (jQuery(c).css('overflow-y', 'visible'),
          jQuery(c).css('overflow-x', 'visible'),
          jQuery(c).css('-webkit-overflow-scrolling', 'visible'),
          (k =
            eb.browser.msie && 9 > eb.browser.version
              ? 'position:relative;'
              : ''),
          c.append(
            "<div id='" +
              this.container +
              "' class='flowpaper_pages' style='" +
              k +
              ';' +
              (eb.platform.touchdevice ? 'padding-left:10px;' : '') +
              (eb.browser.msie
                ? 'overflow-y: scroll;overflow-x: hidden;'
                : 'overflow-y: auto;overflow-x: hidden;-webkit-overflow-scrolling: touch;') +
              "'></div>"
          ),
          jQuery('.flowpaper_pages').height(d.N.height() - 0))
        d.H.J && d.H.J.vb.Wi(d, c)
        d.N.trigger('onPagesContainerCreated')
        jQuery(d).bind('onScaleChanged', d.Pj)
      },
      create: function (c) {
        var d = this
        d.Wi(c)
        eb.browser.capabilities.Pb ||
          'ThumbView' == d.H.I ||
          ((d.yd = {}), 'TwoPage' != d.H.I && 'BookView' != d.H.I) ||
          (d.jScrollPane = d.V(d.L + '_jpane').jScrollPane(d.yd))
        for (c = 0; c < this.document.numPages; c++) {
          d.$a(c) && this.addPage(c)
        }
        d.Oj()
        if (!eb.browser.capabilities.Pb) {
          if ('Portrait' == d.H.I || 'SinglePage' == d.H.I) {
            d.jScrollPane = d.V(this.L).jScrollPane(d.yd)
          }
          !window.zine ||
            (d.H.J && d.H.J.ia == d.H.I) ||
            jQuery(d.V(this.L))
              .bind('jsp-initialised', function () {
                jQuery(this).find('.jspHorizontalBar, .jspVerticalBar').hide()
              })
              .jScrollPane()
              .hover(
                function () {
                  jQuery(this)
                    .find('.jspHorizontalBar, .jspVerticalBar')
                    .stop()
                    .fadeTo('fast', 0.9)
                },
                function () {
                  jQuery(this)
                    .find('.jspHorizontalBar, .jspVerticalBar')
                    .stop()
                    .fadeTo('fast', 0)
                }
              )
        }
        eb.browser.capabilities.Pb ||
          'ThumbView' != d.H.I ||
          (d.jScrollPane = d.V(d.L).jScrollPane(d.yd))
        1 < d.Ye &&
          'Portrait' == d.H.I &&
          setTimeout(function () {
            d.scrollTo(d.Ye, !0)
            d.Ye = -1
            jQuery(d.L).css('visibility', 'visible')
          }, 500)
        d.Ye &&
          'SinglePage' == d.H.I &&
          jQuery(d.L).css('visibility', 'visible')
      },
      getPage: function (c) {
        if ('TwoPage' == this.H.I || 'BookView' == this.H.I) {
          if (0 != c % 2) {
            return this.pages[1]
          }
          if (0 == c % 2) {
            return this.pages[0]
          }
        } else {
          return 'SinglePage' == this.H.I ? this.pages[0] : this.pages[c]
        }
      },
      $a: function (c) {
        return this.H.DisplayRange
          ? -1 < this.H.DisplayRange.indexOf(c + 1)
          : (('TwoPage' == this.H.I || 'BookView' == this.H.I) &&
              (0 == c || 1 == c)) ||
              ('TwoPage' != this.H.I && 'BookView' != this.H.I)
      },
      addPage: function (c) {
        this.pages[c] = new V(this.aa, c, this, this.N, this.H, this.Sh(c))
        this.pages[c].create(this.V(this.L))
        jQuery(this.H.N).trigger('onPageCreated', c)
      },
      Sh: function (c) {
        for (var d = 0; d < this.document.dimensions.length; d++) {
          if (this.document.dimensions[d].page == c) {
            return this.document.dimensions[d]
          }
        }
        return { width: -1, height: -1 }
      },
      scrollTo: function (c, d) {
        if (this.Z + 1 != c || d) {
          !eb.browser.capabilities.Pb && this.jScrollPane
            ? this.jScrollPane
                .data('jsp')
                .scrollToElement(
                  this.pages[c - 1].V(this.pages[c - 1].Ea),
                  !0,
                  !1
                )
            : jQuery(this.L).scrollTo &&
              jQuery(this.L).scrollTo(
                this.pages[c - 1].V(this.pages[c - 1].Ea),
                0
              )
        }
        this.Na()
      },
      Eq: function () {
        for (var c = 0; c < this.getTotalPages(); c++) {
          this.$a(c) &&
            this.pages[c] &&
            this.pages[c].Cc &&
            window.clearTimeout(this.pages[c].Cc)
        }
      },
      Tl: function () {
        this.Cd()
      },
      Cd: function () {
        var c = this
        null != c.pe && (window.clearTimeout(c.pe), (c.pe = null))
        c.pe = setTimeout(function () {
          c.vc()
        }, 200)
      },
      uk: function () {
        if (null != this.jScrollPane) {
          try {
            this.jScrollPane.data('jsp').reinitialise(this.yd)
          } catch (c) {}
        }
      },
      vc: function (c) {
        var d = this
        if (d.H) {
          if (d.H.J && d.H.I == d.H.J.ia) {
            d.H.J.vb.vc(d, c)
          } else {
            null != d.pe && (window.clearTimeout(d.pe), (d.pe = null))
            c = d.V(this.L).scrollTop()
            for (var e = 0; e < this.document.numPages; e++) {
              if (this.pages[e] && d.$a(e)) {
                var g = !d.pages[e].hb
                this.pages[e].ad(c, d.V(this.L).height(), !0)
                  ? (g && d.N.trigger('onVisibilityChanged', e + 1),
                    (this.pages[e].hb = !0),
                    this.pages[e].load(function () {
                      if ('TwoPage' == d.H.I || 'BookView' == d.H.I) {
                        d.V(d.L).is(':animated') ||
                          1 == d.H.scale ||
                          (d.V(d.L).css('margin-left', d.mg()),
                          d
                            .V('#' + this.container + '_2')
                            .css('left', d.V('#' + d.container).width() / 2)),
                          d.initialized ||
                            null == d.jScrollPane ||
                            (d.jScrollPane.data('jsp').reinitialise(d.yd),
                            (d.initialized = !0))
                      }
                    }),
                    this.pages[e].Pp(),
                    this.pages[e].Na())
                  : 'TwoPage' != d.H.I &&
                    'BookView' != d.H.I &&
                    this.pages[e].Gb()
              }
            }
          }
        }
      },
      Ad: function () {
        this.H.I != this.H.ia() ? this.H.Fc(this.Z + 1) : this.H.Fc(this.Z)
      },
      Na: function (c) {
        c = c ? c : this
        for (var d = 0; d < c.document.numPages; d++) {
          c.$a(d) && c.pages[d] && c.pages[d].hb && c.pages[d].Na()
        }
      },
      qh: function () {
        for (
          var c = this.Z, d = this.V(this.L).scrollTop(), e = 0;
          e < this.document.numPages;
          e++
        ) {
          if (this.$a(e) && 'SinglePage' != this.H.I) {
            var g = !this.pages[e].hb
            if (this.pages[e].ad(d, this.V(this.L).height(), !1)) {
              c = e
              g && this.N.trigger('onVisibilityChanged', e + 1)
              break
            }
          }
        }
        this.Z != c &&
          this.N.trigger(
            'onCurrentPageChanged',
            this.H.config &&
              this.H.config.document &&
              this.H.config.document.RTLMode
              ? this.H.getTotalPages() - (c + 1) + 1
              : c + 1
          )
        this.Z = c
      },
      setCurrentCursor: function (c) {
        for (var d = 0; d < this.document.numPages; d++) {
          this.$a(d) &&
            ('TextSelectorCursor' == c
              ? jQuery(this.pages[d].da).addClass('flowpaper_nograb')
              : jQuery(this.pages[d].da).removeClass('flowpaper_nograb'))
        }
      },
      gotoPage: function (c) {
        this.H.gotoPage(c)
      },
      Xg: function (c, d) {
        c = parseInt(c)
        var e = this
        e.H.renderer.Yc && e.H.renderer.Yc(e.pages[0])
        jQuery('.flowpaper_pageword').remove()
        jQuery('.flowpaper_interactiveobject_' + e.aa).remove()
        e.pages[0].Gb()
        e.pages[0].visible = !0
        var g = e.V(e.L).scrollTop()
        e.H.Fc(c)
        e.N.trigger(
          'onCurrentPageChanged',
          e.H.config && e.H.config.document && e.H.config.document.RTLMode
            ? e.H.getTotalPages() - newPageIndex + 1
            : c
        )
        e.pages[0].ad(g, e.V(this.L).height(), !0) &&
          (e.N.trigger('onVisibilityChanged', c + 1),
          e.pages[0].load(function () {
            null != d && d()
            e.Cd()
            null != e.jScrollPane &&
              e.jScrollPane.data('jsp').reinitialise(e.yd)
          }))
      },
      Yg: function (c, d) {
        c = parseInt(c)
        var e = this
        0 == c % 2 &&
          0 < c &&
          'BookView' == e.H.I &&
          c != e.getTotalPages() &&
          (c += 1)
        c == e.getTotalPages() &&
          'TwoPage' == e.H.I &&
          0 == e.getTotalPages() % 2 &&
          (c = e.getTotalPages() - 1)
        0 == c % 2 && 'TwoPage' == e.H.I && --c
        c > e.getTotalPages() && (c = e.getTotalPages())
        jQuery('.flowpaper_pageword').remove()
        jQuery('.flowpaper_interactiveobject_' + e.aa).remove()
        if (c <= e.getTotalPages() && 0 < c) {
          e.H.Fc(c)
          e.Z != c &&
            e.N.trigger(
              'onCurrentPageChanged',
              e.H.config && e.H.config.document && e.H.config.document.RTLMode
                ? e.H.getTotalPages() - newPageIndex + 1
                : c
            )
          e.pages[0].Gb()
          e.pages[0].load(function () {
            if ('TwoPage' == e.H.I || 'BookView' == e.H.I) {
              e.V(e.L).animate({ 'margin-left': e.mg() }, { duration: 250 }),
                e
                  .V('#' + this.container + '_2')
                  .css('left', e.V('#' + e.container).width() / 2),
                e.Ya(e.H.scale)
            }
          })
          1 < e.H.ma
            ? (e.V(e.pages[1].da + '_2').removeClass('flowpaper_hidden'),
              e.V(e.L + '_2').removeClass('flowpaper_hidden'))
            : 'BookView' == e.H.I &&
              1 == e.H.ma &&
              (e.V(e.pages[1].da + '_2').addClass('flowpaper_hidden'),
              e.V(e.L + '_2').addClass('flowpaper_hidden'))
          0 != e.getTotalPages() % 2 &&
            'TwoPage' == e.H.I &&
            c >= e.getTotalPages() &&
            e.V(e.pages[1].da + '_2').addClass('flowpaper_hidden')
          0 == e.getTotalPages() % 2 &&
            'BookView' == e.H.I &&
            c >= e.getTotalPages() &&
            e.V(e.pages[1].da + '_2').addClass('flowpaper_hidden')
          var g = e.V(this.L).scrollTop()
          e.pages[1].Gb()
          e.pages[1].visible = !0
          !e.V(e.pages[1].da + '_2').hasClass('flowpaper_hidden') &&
            e.pages[1].ad(g, e.V(this.L).height(), !0) &&
            (e.N.trigger('onVisibilityChanged', c + 1),
            e.pages[1].load(function () {
              null != d && d()
              e.V(e.L).animate({ 'margin-left': e.mg() }, { duration: 250 })
              e.V('#' + this.container + '_2').css(
                'left',
                e.V('#' + e.container).width() / 2
              )
              e.Cd()
              null != e.jScrollPane &&
                e.jScrollPane.data('jsp').reinitialise(e.yd)
            }))
        }
      },
      rotate: function (c) {
        this.pages[c].rotate()
      },
      mg: function (c) {
        this.N.width()
        var d = 0
        1 != this.H.ma || c || 'BookView' != this.H.I
          ? ((c = jQuery(this.L + '_2').width()),
            0 == c && (c = this.V(this.L + '_1').width()),
            (d = (this.N.width() - (this.V(this.L + '_1').width() + c)) / 2))
          : (d =
              (this.N.width() / 2 - this.V(this.L + '_1').width() / 2) *
              (this.H.scale + 0.7))
        10 > d && (d = 0)
        return d
      },
      previous: function () {
        var c = this
        if ('Portrait' == c.H.I) {
          var d = c.V(c.L).scrollTop() - c.pages[0].height - 14
          0 > d && (d = 1)
          eb.browser.capabilities.Pb
            ? c.V(c.L).scrollTo(d, { axis: 'y', duration: 500 })
            : c.jScrollPane
                .data('jsp')
                .scrollToElement(
                  this.pages[c.H.ma - 2].V(this.pages[c.H.ma - 2].Ea),
                  !0,
                  !0
                )
        }
        'SinglePage' == c.H.I &&
          0 < c.H.ma - 1 &&
          (eb.platform.touchdevice && 1 != this.H.scale
            ? ((c.H.xd = !0),
              c.V(c.L).removeClass('flowpaper_pages_border'),
              c.V(c.L).transition({ x: 1000 }, 350, function () {
                c.pages[0].Gb()
                c.V(c.L).transition({ x: -800 }, 0)
                c.jScrollPane
                  ? c.jScrollPane.data('jsp').scrollTo(0, 0, !1)
                  : c.V(c.L).scrollTo(0, { axis: 'y', duration: 0 })
                c.Xg(c.H.ma - 1, function () {})
                c.V(c.L).transition({ x: 0 }, 350, function () {
                  c.H.xd = !1
                  window.annotations ||
                    c.V(c.L).addClass('flowpaper_pages_border')
                })
              }))
            : c.Xg(c.H.ma - 1))
        c.H.J && c.H.I == c.H.J.ia && c.H.J.vb.previous(c)
        ;('TwoPage' != c.H.I && 'BookView' != c.H.I) ||
          1 > c.H.ma - 2 ||
          (eb.platform.touchdevice && 1 != this.H.scale
            ? ((c.Z = c.H.ma - 2),
              (c.H.xd = !0),
              c.V(c.L).animate(
                { 'margin-left': 1000 },
                {
                  duration: 350,
                  complete: function () {
                    jQuery('.flowpaper_interactiveobject_' + c.aa).remove()
                    1 == c.H.ma - 2 &&
                      'BookView' == c.H.I &&
                      c.pages[1]
                        .V(c.pages[1].da + '_2')
                        .addClass('flowpaper_hidden')
                    setTimeout(function () {
                      c.V(c.L).css('margin-left', -800)
                      c.pages[0].Gb()
                      c.pages[1].Gb()
                      c.V(c.L).animate(
                        { 'margin-left': c.mg() },
                        {
                          duration: 350,
                          complete: function () {
                            setTimeout(function () {
                              c.H.xd = !1
                              c.Yg(c.H.ma - 2)
                            }, 500)
                          },
                        }
                      )
                    }, 500)
                  },
                }
              ))
            : c.Yg(c.H.ma - 2))
      },
      next: function () {
        var c = this
        if ('Portrait' == c.H.I) {
          0 == c.H.ma && (c.H.ma = 1)
          var d = c.H.ma - 1
          100 <
          this.pages[c.H.ma - 1].V(this.pages[c.H.ma - 1].Ea).offset().top -
            c.N.offset().top
            ? (d = c.H.ma - 1)
            : (d = c.H.ma)
          eb.browser.capabilities.Pb
            ? this.pages[d] &&
              c.V(c.L).scrollTo(this.pages[d].V(this.pages[d].Ea), {
                axis: 'y',
                duration: 500,
              })
            : c.jScrollPane
                .data('jsp')
                .scrollToElement(
                  this.pages[c.H.ma].V(this.pages[c.H.ma].Ea),
                  !0,
                  !0
                )
        }
        'SinglePage' == c.H.I &&
          c.H.ma < c.getTotalPages() &&
          (eb.platform.touchdevice && 1 != c.H.scale
            ? ((c.H.xd = !0),
              c.V(c.L).removeClass('flowpaper_pages_border'),
              c.V(c.L).transition({ x: -1000 }, 350, 'ease', function () {
                c.pages[0].Gb()
                c.V(c.L).transition({ x: 1200 }, 0)
                c.jScrollPane
                  ? c.jScrollPane.data('jsp').scrollTo(0, 0, !1)
                  : c.V(c.L).scrollTo(0, { axis: 'y', duration: 0 })
                c.Xg(c.H.ma + 1, function () {})
                c.V(c.L).transition({ x: 0 }, 350, 'ease', function () {
                  window.annotations ||
                    c.V(c.L).addClass('flowpaper_pages_border')
                  c.H.xd = !1
                })
              }))
            : c.Xg(c.H.ma + 1))
        c.H.J && c.H.I == c.H.J.ia && c.H.J.vb.next(c)
        if ('TwoPage' == c.H.I || 'BookView' == c.H.I) {
          if ('TwoPage' == c.H.I && c.H.ma + 2 > c.getTotalPages()) {
            return !1
          }
          eb.platform.touchdevice && 1 != this.H.scale
            ? ((c.Z = c.H.ma + 2),
              (c.H.xd = !0),
              c.V(c.L).animate(
                { 'margin-left': -1000 },
                {
                  duration: 350,
                  complete: function () {
                    jQuery('.flowpaper_interactiveobject_' + c.aa).remove()
                    c.H.ma + 2 <= c.getTotalPages() &&
                      0 < c.H.ma + 2 &&
                      c.pages[1]
                        .V(c.pages[1].da + '_2')
                        .removeClass('flowpaper_hidden')
                    setTimeout(function () {
                      c.V(c.L).css('margin-left', 800)
                      c.pages[0].Gb()
                      c.pages[1].Gb()
                      c.pages[0].hb = !0
                      c.pages[1].hb = !0
                      c.N.trigger('onVisibilityChanged', c.Z)
                      c.V(c.L).animate(
                        { 'margin-left': c.mg(!0) },
                        {
                          duration: 350,
                          complete: function () {
                            setTimeout(function () {
                              c.H.xd = !1
                              c.Yg(c.H.ma + 2)
                            }, 500)
                          },
                        }
                      )
                    }, 500)
                  },
                }
              ))
            : c.Yg(c.H.ma + 2)
        }
      },
      Gf: function (c) {
        this.H.J && this.H.I == this.H.J.ia && this.H.J.vb.Gf(this, c)
      },
    }
    return f
  })(),
  V = (function () {
    function f(c, d, e, g, h, f) {
      this.N = g
      this.H = h
      this.pages = e
      this.Ha = 1000
      this.va = this.hb = !1
      this.aa = c
      this.pageNumber = d
      this.dimensions = f
      this.selectors = {}
      this.ja = 'dummyPage_' + this.pageNumber + '_' + this.aa
      this.page = 'page_' + this.pageNumber + '_' + this.aa
      this.Od = 'pageContainer_' + this.pageNumber + '_' + this.aa
      this.fh = this.Od + '_textLayer'
      this.Kh = 'dummyPageCanvas_' + this.pageNumber + '_' + this.aa
      this.Lh = 'dummyPageCanvas2_' + this.pageNumber + '_' + this.aa
      this.Si = this.page + '_canvasOverlay'
      this.tc = 'pageLoader_' + this.pageNumber + '_' + this.aa
      this.qm = this.Od + '_textoverlay'
      this.I = this.H.I
      this.ia = this.H.J ? this.H.J.ia : ''
      this.renderer = this.H.renderer
      c = this.H.scale
      this.scale = c
      this.da = '#' + this.ja
      this.Aa = '#' + this.page
      this.Ea = '#' + this.Od
      this.Mb = '#' + this.fh
      this.cj = '#' + this.Kh
      this.dj = '#' + this.Lh
      this.gc = '#' + this.tc
      this.Qj = '#' + this.qm
      this.za = { bottom: 3, top: 2, right: 0, left: 1, gb: 4, back: 5 }
      this.bb = []
      this.duration = 1.3
      this.lq = 16777215
      this.offset = this.force = 0
    }
    f.prototype = {
      V: function (c) {
        if (0 < c.indexOf('undefined')) {
          return jQuery(null)
        }
        this.selectors || (this.selectors = {})
        this.selectors[c] || (this.selectors[c] = jQuery(c))
        return this.selectors[c]
      },
      show: function () {
        'TwoPage' != this.H.I &&
          'BookView' != this.H.I &&
          this.V(this.Aa).removeClass('flowpaper_hidden')
      },
      kf: function () {
        this.pages.jScrollPane &&
          (!eb.browser.capabilities.Pb && this.pages.jScrollPane
            ? 'SinglePage' == this.H.I
              ? 0 > this.V(this.pages.L).width() - this.V(this.Ea).width()
                ? (this.pages.jScrollPane.data('jsp').scrollToPercentX(0.5, !1),
                  this.pages.jScrollPane.data('jsp').scrollToPercentY(0.5, !1))
                : (this.pages.jScrollPane.data('jsp').scrollToPercentX(0, !1),
                  this.pages.jScrollPane.data('jsp').scrollToPercentY(0, !1))
              : this.pages.jScrollPane.data('jsp').scrollToPercentX(0, !1)
            : this.V(this.Ea).parent().scrollTo &&
              this.V(this.Ea)
                .parent()
                .scrollTo({ left: '50%' }, 0, { axis: 'x' }))
      },
      create: function (c) {
        var d = this
        if ('Portrait' == d.H.I) {
          c.append(
            "<div class='flowpaper_page " +
              (d.H.document.DisableOverflow ? 'flowpaper_ppage' : '') +
              ' ' +
              (d.H.document.DisableOverflow &&
              d.pageNumber < d.H.renderer.getNumPages() - 1
                ? 'ppage_break'
                : 'ppage_none') +
              "' id='" +
              d.Od +
              "' style='position:relative;" +
              (d.H.document.DisableOverflow
                ? 'margin:0;padding:0;overflow:hidden;'
                : '') +
              "'><div id='" +
              d.ja +
              "' class='' style='z-index:11;" +
              d.getDimensions() +
              ";'></div></div>"
          )
          if (0 < jQuery(d.H.Dk).length) {
            var e = this.Ha * this.scale
            jQuery(d.H.Dk).append(
              "<div id='" +
                d.qm +
                "' class='flowpaper_page' style='position:relative;height:" +
                e +
                "px;width:100%;overflow:hidden;'></div>"
            )
          }
          d.Xl()
        }
        'SinglePage' == d.H.I &&
          0 == d.pageNumber &&
          c.append(
            "<div class='flowpaper_page' id='" +
              d.Od +
              "' class='flowpaper_rescale' style='position:relative;'><div id='" +
              d.ja +
              "' class='' style='position:absolute;z-index:11;" +
              d.getDimensions() +
              "'></div></div>"
          )
        if ('TwoPage' == d.H.I || 'BookView' == d.H.I) {
          0 == d.pageNumber &&
            jQuery(c.children().get(0)).append(
              "<div class='flowpaper_page' id='" +
                d.Od +
                "_1' style='z-index:2;float:right;position:relative;'><div id='" +
                d.ja +
                "_1' class='flowpaper_hidden flowpaper_border' style='" +
                d.getDimensions() +
                ";float:right;'></div></div>"
            ),
            1 == d.pageNumber &&
              jQuery(c.children().get(1)).append(
                "<div class='flowpaper_page' id='" +
                  d.Od +
                  "_2' style='position:relative;z-index:1;float:left;'><div id='" +
                  d.ja +
                  "_2' class='flowpaper_hidden flowpaper_border' style='" +
                  d.getDimensions() +
                  ";float:left'></div></div>"
              )
        }
        'ThumbView' == d.H.I &&
          (c.append(
            "<div class='flowpaper_page' id='" +
              d.Od +
              "' style='position:relative;" +
              (eb.browser.msie
                ? 'clear:none;float:left;'
                : 'display:inline-block;') +
              '\'><div id="' +
              d.ja +
              '" class="flowpaper_page flowpaper_thumb flowpaper_border flowpaper_load_on_demand" style="margin-left:10px;' +
              d.getDimensions() +
              '"></div></div>'
          ),
          jQuery(d.Ea).on('mousedown touchstart', function () {
            d.H.gotoPage(d.pageNumber + 1)
          }))
        d.H.I == d.ia
          ? d.H.J.Uc.create(d, c)
          : (d.H.renderer.fe(d),
            d.show(),
            (d.height = d.V(d.Ea).height()),
            d.Om())
        jQuery(d.Ea).on('mousedown', function (c) {
          var e = $(this),
            f = c.pageX - e.offset().left
          c = c.pageY - e.offset().top
          var k = e.width(),
            e = e.height(),
            f = ((d.Ha * d.ae()) / k) * f
          c *= d.Ha / e
          jQuery(d.N).trigger('onPageClicked', {
            pageNumber: d.pageNumber + 1,
            left: f,
            top: c,
          })
        })
      },
      Xl: function () {
        var c = this
        if (c.H.Eb) {
          jQuery(c.Ea).on('mouseover, mousemove', function () {
            'Portrait' == c.H.I
              ? va(
                  'pageContainer_' + c.pageNumber + '_documentViewer_textLayer',
                  c.pageNumber + 1
                )
              : va('turn-page-wrapper-' + (c.pageNumber + 1), c.pageNumber + 1)
          })
        }
      },
      lp: function () {
        if ('Portrait' == this.H.I || 'SinglePage' == this.H.I) {
          return this.Si
        }
        if ('TwoPage' == this.H.I || 'BookView' == this.H.I) {
          if (0 == this.pageNumber) {
            return this.Si + '_1'
          }
          if (1 == this.pageNumber) {
            return this.Si + '_2'
          }
        }
      },
      ek: function (c) {
        this.V(this.Qj).css({ top: c })
      },
      ec: function () {
        ;('Portrait' != this.H.I &&
          'SinglePage' != this.H.I &&
          this.H.I != this.ia) ||
          jQuery('#' + this.tc).remove()
        if ('TwoPage' == this.H.I || 'BookView' == this.H.I) {
          0 == this.pageNumber && this.V(this.gc + '_1').hide(),
            1 == this.pageNumber && this.V(this.gc + '_2').hide()
        }
      },
      md: function () {
        if (!this.H.document.DisableOverflow) {
          if (
            'Portrait' == this.H.I ||
            'SinglePage' == this.H.I ||
            this.H.I == this.ia
          ) {
            this.Ha = 1000
            if (0 < this.V(this.gc).length) {
              return
            }
            var c = 0 < jQuery(this.Ea).length ? jQuery(this.Ea) : this.Oc
            c && c.find && 0 != c.length
              ? 0 == c.find('#' + this.tc).length &&
                c.append(
                  "<img id='" +
                    this.tc +
                    "' src='" +
                    this.H.Ce +
                    "' class='flowpaper_pageLoader'  style='position:absolute;left:50%;top:50%;height:8px;margin-left:" +
                    (this.qc() - 10) +
                    "px;' />"
                )
              : aa(
                  "can't show loader, missing container for page " +
                    this.pageNumber
                )
          }
          if ('TwoPage' == this.H.I || 'BookView' == this.H.I) {
            if (0 == this.pageNumber) {
              if (0 < this.V(this.gc + '_1').length) {
                this.V(this.gc + '_1').show()
                return
              }
              this.V(this.da + '_1').append(
                "<img id='" +
                  this.tc +
                  "_1' src='" +
                  this.H.Ce +
                  "' style='position:absolute;left:" +
                  (this.Fa() - 30) +
                  'px;top:' +
                  this.Pa() / 2 +
                  "px;' />"
              )
              this.V(this.gc + '_1').show()
            }
            1 == this.pageNumber &&
              (0 < this.V(this.gc + '_2').length ||
                this.V(this.da + '_2').append(
                  "<img id='" +
                    this.tc +
                    "_2' src='" +
                    this.H.Ce +
                    "' style='position:absolute;left:" +
                    (this.Fa() / 2 - 10) +
                    'px;top:' +
                    this.Pa() / 2 +
                    "px;' />"
                ),
              this.V(this.gc + '_2').show())
          }
        }
      },
      Ya: function () {
        var c, d
        d = this.Fa()
        c = this.Pa()
        var e = this.qc()
        this.H.document.DisableOverflow &&
          ((c = Math.floor(c)), (d = Math.floor(d)))
        if ('Portrait' == this.H.I || 'SinglePage' == this.H.I) {
          this.V(this.Ea).css({
            height: c,
            width: d,
            'margin-left': e,
            'margin-top': 0,
          }),
            this.V(this.da).css({ height: c, width: d, 'margin-left': e }),
            this.V(this.Aa).css({ height: c, width: d, 'margin-left': e }),
            this.V(this.cj).css({ height: c, width: d }),
            this.V(this.dj).css({ height: c, width: d }),
            this.V(this.Qj).css({ height: c, width: d }),
            this.V(this.gc).css({ 'margin-left': e }),
            jQuery(this.Mb).css({ height: c, width: d, 'margin-left': e }),
            this.H.renderer.yb &&
              (jQuery('.flowpaper_flipview_canvas_highres')
                .css({ width: 0.25 * d, height: 0.25 * c })
                .show(),
              this.scale < this.Wg()
                ? this.H.renderer.Yc(this)
                : this.H.renderer.hd(this)),
            this.tg(this.scale, e)
        }
        if ('TwoPage' == this.H.I || 'BookView' == this.H.I) {
          this.V(this.da + '_1').css({ height: c, width: d }),
            this.V(this.da + '_2').css({ height: c, width: d }),
            this.V(this.da + '_1_textoverlay').css({ height: c, width: d }),
            this.V(this.da + '_2_textoverlay').css({ height: c, width: d }),
            this.V(this.Aa).css({ height: c, width: d }),
            eb.browser.capabilities.Pb ||
              (0 == this.pages.Z
                ? this.pages.V(this.pages.L).css({ height: c, width: d })
                : this.pages.V(this.pages.L).css({ height: c, width: 2 * d }),
              'TwoPage' == this.H.I &&
                this.pages.V(this.pages.L).css({ width: '100%' })),
            eb.platform.touchdevice &&
              1 <= this.scale &&
              this.pages.V(this.pages.L).css({ width: 2 * d }),
            eb.platform.touchdevice &&
              ('TwoPage' == this.H.I &&
                this.pages
                  .V(this.pages.L + '_2')
                  .css(
                    'left',
                    this.pages.V(this.pages.L + '_1').width() + e + 2
                  ),
              'BookView' == this.H.I &&
                this.pages
                  .V(this.pages.L + '_2')
                  .css(
                    'left',
                    this.pages.V(this.pages.L + '_1').width() + e + 2
                  ))
        }
        if (this.H.I == this.ia) {
          var g = this.ae() * this.Ha,
            h = this.Fa() / g
          null != this.dimensions.zb &&
            this.Bb &&
            this.H.renderer.Ba &&
            (h = this.pages.ud / 2 / g)
          this.H.I == this.ia ? 1 == this.scale && this.tg(h, e) : this.tg(h, e)
        }
        this.height = c
        this.width = d
      },
      Wg: function () {
        return 1
      },
      kc: function () {
        return 'SinglePage' == this.H.I
      },
      resize: function () {},
      ae: function () {
        return this.dimensions.xa / this.dimensions.Ga
      },
      $c: function () {
        return this.H.I == this.ia
          ? this.H.J.Uc.$c(this)
          : (this.dimensions.xa / this.dimensions.Ga) * this.scale * this.Ha
      },
      kg: function () {
        return this.H.I == this.ia ? this.H.J.Uc.kg(this) : this.Ha * this.scale
      },
      getDimensions: function () {
        var c = this.Ke(),
          d = this.H.$c()
        if (this.H.document.DisableOverflow) {
          var e = this.Ha * this.scale
          return 'height:' + e + 'px;width:' + e * c + 'px'
        }
        if ('Portrait' == this.H.I || 'SinglePage' == this.H.I) {
          return (
            (e = this.Ha * this.scale),
            'height:' +
              e +
              'px;width:' +
              e * c +
              'px;margin-left:' +
              (d - e * c) / 2 +
              'px;'
          )
        }
        if (this.H.I == this.ia) {
          return this.H.J.Uc.getDimensions(this, c)
        }
        if ('TwoPage' == this.H.I || 'BookView' == this.H.I) {
          return (
            (e = (this.N.width() / 2) * this.scale),
            (0 == this.pageNumber ? 'margin-left:0px;' : '') +
              'height:' +
              e +
              'px;width:' +
              e * c +
              'px'
          )
        }
        if ('ThumbView' == this.H.I) {
          return (
            (e = (this.Ha * ((this.N.height() - 100) / this.Ha)) / 2.7),
            'height:' + e + 'px;width:' + e * c + 'px'
          )
        }
      },
      Ke: function () {
        return this.dimensions.xa / this.dimensions.Ga
      },
      Fa: function (c) {
        return this.H.I == this.ia
          ? this.H.J.Uc.Fa(this)
          : this.Ha * this.Ke() * (c ? c : this.scale)
      },
      sj: function () {
        return this.H.I == this.ia
          ? this.H.J.Uc.sj(this)
          : this.Ha * this.Ke() * this.scale
      },
      Kl: function (c) {
        return c / (this.Ha * this.Ke())
      },
      uj: function () {
        return this.H.I == this.ia ? this.H.J.Uc.uj(this) : this.Ha * this.Ke()
      },
      Pa: function () {
        return this.H.I == this.ia ? this.H.J.Uc.Pa(this) : this.Ha * this.scale
      },
      rj: function () {
        return this.H.I == this.ia ? this.H.J.Uc.rj(this) : this.Ha * this.scale
      },
      qc: function () {
        var c = this.H.$c(),
          d = 0
        if (this.H.document.DisableOverflow) {
          return 0
        }
        if ('Portrait' == this.H.I || 'SinglePage' == this.H.I) {
          return (
            this.pages.ah && this.pages.ah > c && (c = this.pages.ah),
            (d = (c - this.Fa()) / 2 / 2 - 4),
            0 < d ? d : 0
          )
        }
        if ('TwoPage' == this.H.I || 'BookView' == this.H.I) {
          return 0
        }
        if (this.H.I == this.ia) {
          return this.H.J.Uc.qc(this)
        }
      },
      ad: function (c, d, e) {
        var g = !1
        if ('Portrait' == this.H.I || 'ThumbView' == this.H.I) {
          if ((this.offset = this.V(this.Ea).offset())) {
            this.pages.Ck || (this.pages.Ck = this.H.T.offset().top)
            var g = this.offset.top - this.pages.Ck + c,
              h = this.offset.top + this.height
            d = c + d
            g =
              e || (eb.platform.touchdevice && !eb.browser.capabilities.Pb)
                ? (this.hb =
                    (c - this.height <= g && d >= g) ||
                    (g - this.height <= c && h >= d))
                : (c <= g && d >= g) || (g <= c && h >= d)
          } else {
            g = !1
          }
        }
        'SinglePage' == this.H.I && (g = this.hb = 0 == this.pageNumber)
        this.H.I == this.ia && (g = this.hb = this.H.J.Uc.ad(this))
        if ('BookView' == this.H.I) {
          if (
            0 == this.pages.getTotalPages() % 2 &&
            this.pages.Z >= this.pages.getTotalPages() &&
            1 == this.pageNumber
          ) {
            return !1
          }
          g = this.hb =
            0 == this.pageNumber || (0 != this.pages.Z && 1 == this.pageNumber)
        }
        if ('TwoPage' == this.H.I) {
          if (
            0 != this.pages.getTotalPages() % 2 &&
            this.pages.Z >= this.pages.getTotalPages() &&
            1 == this.pageNumber
          ) {
            return !1
          }
          g = this.hb = 0 == this.pageNumber || 1 == this.pageNumber
        }
        return g
      },
      Pp: function () {
        this.va || this.load()
      },
      load: function (c) {
        this.Na(c)
        if (!this.va) {
          'TwoPage' == this.H.I &&
            ((c = this.H.renderer.getDimensions(
              this.pageNumber - 1,
              this.pageNumber - 1
            )[this.pages.Z + this.pageNumber]),
            c.width != this.dimensions.width ||
              c.height != this.dimensions.height) &&
            ((this.dimensions = c), this.Ya())
          'BookView' == this.H.I &&
            ((c = this.H.renderer.getDimensions(
              this.pageNumber - 1,
              this.pageNumber - 1
            )[this.pages.Z - (0 < this.pages.Z ? 1 : 0) + this.pageNumber]),
            c.width != this.dimensions.width ||
              c.height != this.dimensions.height) &&
            ((this.dimensions = c), this.Ya())
          if ('SinglePage' == this.H.I) {
            c = this.H.renderer.getDimensions(
              this.pageNumber - 1,
              this.pageNumber - 1
            )[this.pages.Z]
            if (
              c.width != this.dimensions.width ||
              c.height != this.dimensions.height
            ) {
              ;(this.dimensions = c),
                this.Ya(),
                jQuery('.flowpaper_pageword_' + this.aa).remove(),
                this.Na()
            }
            this.dimensions.loaded = !1
          }
          'Portrait' == this.H.I &&
            ((c = this.H.renderer.getDimensions(
              this.pageNumber - 1,
              this.pageNumber - 1
            )[this.pageNumber]),
            c.width != this.dimensions.width ||
              c.height != this.dimensions.height) &&
            ((this.dimensions = c),
            this.Ya(),
            jQuery('.flowpaper_pageword_' + this.aa).remove(),
            this.Na())
          this.H.renderer.ic(this, !1)
          'function' === typeof this.vj && this.loadOverlay()
        }
      },
      Gb: function () {
        if (
          this.va ||
          'TwoPage' == this.H.I ||
          'BookView' == this.H.I ||
          this.H.I == this.ia
        ) {
          delete this.selectors,
            (this.selectors = {}),
            jQuery(this.ga).unbind(),
            delete this.ga,
            (this.ga = null),
            (this.va = !1),
            this.H.renderer.Gb(this),
            jQuery(this.gc).remove(),
            this.Hk && (delete this.Hk, (this.Hk = null)),
            this.H.I == this.ia && this.H.J.Uc.Gb(this),
            'TwoPage' != this.H.I &&
              'BookView' != this.H.I &&
              this.V('#' + this.lp()).remove(),
            'function' === typeof this.vj && this.Tt()
        }
      },
      Na: function (c) {
        'ThumbView' == this.H.I ||
          (!this.hb && null == c) ||
          this.pages.animating ||
          this.H.renderer.Na(this, !1, c)
      },
      Vc: function (c, d, e) {
        this.H.renderer.Vc(this, c, d, e)
      },
      gf: function (c, d, e) {
        this.H.renderer.gf(this, c, d, e)
      },
      Om: function () {
        if ('Portrait' == this.H.I || 'SinglePage' == this.H.I) {
          ;(eb.browser.msie && 9 > eb.browser.version) ||
            eb.platform.ios ||
            new da(
              this.H,
              'CanvasPageRenderer' == this.renderer.Af() ? this.da : this.Aa,
              this.V(this.Ea).parent()
            ).scroll()
        }
      },
      tg: function (c, d) {
        var e = this
        if (e.H.ba[e.pageNumber]) {
          for (var g = 0; g < e.H.ba[e.pageNumber].length; g++) {
            if ('link' == e.H.ba[e.pageNumber][g].type) {
              var h = e.H.ba[e.pageNumber][g].Mp * c,
                f = e.H.ba[e.pageNumber][g].Np * c,
                k = e.H.ba[e.pageNumber][g].width * c,
                m = e.H.ba[e.pageNumber][g].height * c,
                p = e.H.ba[e.pageNumber][g].Vq,
                n = e.H.ba[e.pageNumber][g].Wq,
                t = e.H.ba[e.pageNumber][g].$p
              if (
                0 ==
                jQuery('#flowpaper_mark_link_' + e.pageNumber + '_' + g).length
              ) {
                var q = jQuery(
                    String.format(
                      "<div id='flowpaper_mark_link_{4}_{5}' class='flowpaper_mark_link flowpaper_mark' style='left:{0}px;top:{1}px;width:{2}px;height:{3}px;box-shadow: 0px 0px 0px 0px;'></div>",
                      h,
                      f,
                      k,
                      m,
                      e.pageNumber,
                      g
                    )
                  ),
                  r = e.Ea
                0 == jQuery(r).length && (r = e.Oc)
                if (p) {
                  p = 'flowpaper-linkicon-url'
                  e.H.ba[e.pageNumber][g].href &&
                    -1 < e.H.ba[e.pageNumber][g].href.indexOf('mailto:') &&
                    (p = 'flowpaper-linkicon-email')
                  e.H.ba[e.pageNumber][g].href &&
                    -1 < e.H.ba[e.pageNumber][g].href.indexOf('tel:') &&
                    (p = 'flowpaper-linkicon-phone')
                  e.H.ba[e.pageNumber][g].href &&
                    -1 < e.H.ba[e.pageNumber][g].href.indexOf('actionGoTo:') &&
                    (p = 'flowpaper-linkicon-bookmark')
                  var u = jQuery(
                    String.format(
                      "<div id='flowpaper_mark_link_{4}_{5}_icon' class='flowpaper_mark flowpaper-linkicon flowpaper-linkicon-roundbg' style='left:{0}px;top:{1}px;width:{2}px;height:{3}px;pointer-events:none;'></div>'",
                      h,
                      f,
                      k,
                      m,
                      e.pageNumber,
                      g
                    )
                  )
                  jQuery(r).append(u)
                  h = jQuery(
                    String.format(
                      "<div id='flowpaper_mark_link_{4}_{5}_icon' class='flowpaper_mark flowpaper-linkicon {6}' style='left:{0}px;top:{1}px;width:{2}px;height:{3}px;pointer-events:none;'></div>'",
                      h,
                      f,
                      k,
                      m,
                      e.pageNumber,
                      g,
                      p
                    )
                  )
                  jQuery(r).append(h)
                }
                r = jQuery(r)
                  .append(q)
                  .find('#flowpaper_mark_link_' + e.pageNumber + '_' + g)
                n &&
                  (r.data('mouseOverText', t),
                  r.bind('mouseover', function (c) {
                    for (
                      var d = document.querySelectorAll('.popover'), g = 0;
                      g < d.length;
                      g++
                    ) {
                      d[g].remove()
                    }
                    !jQuery(this).data('mouseOverText') ||
                      (jQuery(this).data('mouseOverText') &&
                        0 == jQuery(this).data('mouseOverText').length) ||
                      ((c = new Popover({ position: 'top', button: c.target })),
                      c.setContent(
                        '<span style="font-family:Arial;font-size:0.8em;">' +
                          jQuery(this).data('mouseOverText') +
                          '</span>'
                      ),
                      c.render('open', e.H.T.get(0)))
                  }),
                  r.bind('mouseout', function () {
                    for (
                      var c = document.querySelectorAll('.popover'), d = 0;
                      d < c.length;
                      d++
                    ) {
                      c[d].remove()
                    }
                  }))
                r.data('link', e.H.ba[e.pageNumber][g].href)
                r.bind('mousedown touchstart', function (c) {
                  if (e.pages.af || e.pages.animating) {
                    return !1
                  }
                  if (0 == jQuery(this).data('link').indexOf('actionGoTo:')) {
                    e.H.gotoPage(jQuery(this).data('link').substr(11))
                  } else {
                    if (0 == jQuery(this).data('link').indexOf('javascript')) {
                      var d = unescape(jQuery(this).data('link')),
                        g = Object.create(null),
                        h = d.substring(11),
                        f = { window: {}, document: {} },
                        k = [],
                        d = [],
                        l
                      for (l in f) {
                        f.hasOwnProperty(l) && (d.push(f[l]), k.push(l))
                      }
                      l = Array.prototype.concat.call(g, k, h)
                      h = new (Function.prototype.bind.apply(Function, l))()
                      l = Array.prototype.concat.call(g, d)
                      Function.prototype.bind.apply(h, l)()
                    } else {
                      jQuery(e.N).trigger(
                        'onExternalLinkClicked',
                        jQuery(this).data('link')
                      )
                    }
                  }
                  e.H.Nd = 'up'
                  c.preventDefault()
                  c.stopImmediatePropagation()
                  return !1
                })
                eb.platform.touchonlydevice ||
                  (jQuery(r).on('mouseover', function () {
                    jQuery(this).stop(!0, !0)
                    jQuery(this).css('background', e.H.linkColor)
                    jQuery(this).css({ opacity: e.H.dd })
                  }),
                  jQuery(r).on('mouseout', function () {
                    jQuery(this).css('background', '')
                    jQuery(this).css({ opacity: 0 })
                  }))
              } else {
                ;(q = jQuery('#flowpaper_mark_link_' + e.pageNumber + '_' + g)),
                  q.css({
                    left: h + 'px',
                    top: f + 'px',
                    width: k + 'px',
                    height: m + 'px',
                    'margin-left': d + 'px',
                  })
              }
            }
            if ('audio' == e.H.ba[e.pageNumber][g].type) {
              var t = e.H.ba[e.pageNumber][g].ro * c,
                q = e.H.ba[e.pageNumber][g].so * c,
                r = e.H.ba[e.pageNumber][g].width * c,
                n = e.H.ba[e.pageNumber][g].height * c,
                h = e.H.ba[e.pageNumber][g].src,
                v =
                  e.H.ba[e.pageNumber][g].autoplay &&
                  !eb.platform.touchonlydevice,
                f = e.H.ba[e.pageNumber][g].url,
                k = e.H.ba[e.pageNumber][g].zp && !eb.platform.touchonlydevice,
                m = e.H.ba[e.pageNumber][g].$g,
                p = e.H.ba[e.pageNumber][g].Jp
              FLOWPAPER.authenticated &&
                -1 == h.indexOf('base64,') &&
                (h = FLOWPAPER.appendUrlParameter(
                  h,
                  FLOWPAPER.authenticated.getParams()
                ))
              FLOWPAPER.authenticated &&
                (f = FLOWPAPER.appendUrlParameter(
                  f,
                  FLOWPAPER.authenticated.getParams()
                ))
              0 ==
              jQuery('#flowpaper_mark_audio_' + e.pageNumber + '_' + g).length
                ? ((h = jQuery(
                    String.format(
                      "<div id='flowpaper_mark_audio_{4}_{5}' data-autoplay='{8}' data-audio='{10}' data-invertplayer='{13}' data-keepplaying='{14}' class='flowpaper_mark_audio flowpaper_mark_audio_{4} flowpaper_mark' style='left:{0}px;top:{1}px;width:{2}px;height:{3}px;margin-left:{7}px;display:{11}'><img src='{6}' style='position:absolute;width:{2}px;height:{3}px;{12}' class='flowpaper_mark'/></div>",
                      t,
                      q,
                      r,
                      n,
                      e.pageNumber,
                      g,
                      h,
                      d,
                      v,
                      'flowpaper_mark_audio_' +
                        e.pageNumber +
                        '_' +
                        g +
                        '_audio',
                      f,
                      k ? 'none' : 'block',
                      m ? 'filter:invert(1) hue-rotate(190deg);' : '',
                      m,
                      p
                    )
                  )),
                  (r = jQuery(e.Ea).append(h)),
                  jQuery(
                    '#flowpaper_mark_audio_' + e.pageNumber + '_' + g
                  ).bind('mousedown touchstart', function (c) {
                    var d = this
                    0 <
                      jQuery('.flowpaper_mark_audio').find(
                        '.flowpaper-circle-audio-player'
                      ).length &&
                      jQuery('.flowpaper_mark_audio')
                        .find('.flowpaper-circle-audio-player')
                        .each(function () {
                          jQuery(this).parent().attr('id') !=
                            jQuery(d).attr('id') && jQuery(this)[0].ag.pause()
                        })
                    0 ==
                      jQuery(this).find('.flowpaper-circle-audio-player')
                        .length &&
                      (jQuery(this).find('.flowpaper_mark').hide(),
                      new Ca({
                        audio: $(this).data('audio'),
                        size: 2 * $(this).width(),
                        borderWidth: 10,
                        $g: $(this).data('invertplayer'),
                      }).appendTo(this))
                    jQuery(e.N).trigger('onAudioStarted', {
                      AudioUrl: jQuery(this).data('data-audio'),
                      PageNumber: e.pageNumber + 1,
                    })
                    e.H.Nd = 'up'
                    c.preventDefault()
                    c.stopImmediatePropagation()
                  }))
                : ((h = jQuery(
                    '#flowpaper_mark_audio_' + e.pageNumber + '_' + g
                  )),
                  h
                    .css({
                      left: t + 'px',
                      top: q + 'px',
                      width: r + 'px',
                      height: n + 'px',
                      'margin-left': d + 'px',
                    })
                    .find('.flowpaper_mark')
                    .css({ width: r + 'px', height: n + 'px' }),
                  (q = h.find('iframe')),
                  0 < q.length && (q.attr('width', r), q.attr('height', n)))
            }
            'video' == e.H.ba[e.pageNumber][g].type &&
              ((t = e.H.ba[e.pageNumber][g].ni * c),
              (q = e.H.ba[e.pageNumber][g].oi * c),
              (r = e.H.ba[e.pageNumber][g].width * c),
              (n = e.H.ba[e.pageNumber][g].height * c),
              (h = e.H.ba[e.pageNumber][g].src),
              (v = e.H.ba[e.pageNumber][g].autoplay),
              FLOWPAPER.authenticated &&
                -1 == h.indexOf('base64,') &&
                (h = FLOWPAPER.appendUrlParameter(
                  h,
                  FLOWPAPER.authenticated.getParams()
                )),
              0 ==
              jQuery('#flowpaper_mark_video_' + e.pageNumber + '_' + g).length
                ? ((h = jQuery(
                    String.format(
                      "<div id='flowpaper_mark_video_{4}_{5}' data-autoplay='{8}' class='flowpaper_mark_video flowpaper_mark_video_{4} flowpaper_mark' style='left:{0}px;top:{1}px;width:{2}px;height:{3}px;margin-left:{7}px'><img src='{6}' style='position:absolute;width:{2}px;height:{3}px;' class='flowpaper_mark'/></div>",
                      t,
                      q,
                      r,
                      n,
                      e.pageNumber,
                      g,
                      h,
                      d,
                      v
                    )
                  )),
                  (r = e.Ea),
                  0 == jQuery(r).length && (r = e.Oc),
                  (r = jQuery(r)
                    .append(h)
                    .find('#flowpaper_mark_video_' + e.pageNumber + '_' + g)),
                  r.data('video', e.H.ba[e.pageNumber][g].url),
                  r.data('maximizevideo', e.H.ba[e.pageNumber][g].Yp),
                  r.bind('mousedown touchstart', function (c) {
                    jQuery(e.N).trigger('onVideoStarted', {
                      VideoUrl: jQuery(this).data('video'),
                      PageNumber: e.pageNumber + 1,
                    })
                    if (e.pages.af || e.pages.animating) {
                      return !1
                    }
                    var d = jQuery(this).data('video'),
                      g = 'true' == jQuery(this).data('maximizevideo')
                    if (d && 0 <= d.toLowerCase().indexOf('youtube')) {
                      for (
                        var h = d.substr(d.indexOf('?') + 1).split('&'),
                          f = '',
                          k = 0;
                        k < h.length;
                        k++
                      ) {
                        0 == h[k].indexOf('v=') && (f = h[k].substr(2))
                      }
                      if (g) {
                        e.H.Mc = jQuery(
                          String.format(
                            '<div class="flowpaper_mark_video_maximized flowpaper_mark" style="position:absolute;z-index:99999;left:2.5%;top:2.5%;width:95%;height:95%"></div>'
                          )
                        )
                        e.H.T.append(e.H.Mc)
                        jQuery(e.H.Mc).html(
                          String.format(
                            "<iframe class='flowpaper_videoframe' width='{0}' height='{1}' src='{3}://www.youtube.com/embed/{2}?rel=0&autoplay={4}&enablejsapi=1&mute={5}' frameborder='0' allowfullscreen allow='autoplay'></iframe>",
                            0.95 * e.H.T.width(),
                            0.95 * e.H.T.height(),
                            f,
                            -1 < location.href.indexOf('https:')
                              ? 'https'
                              : 'http',
                            !e.H.Eb || v ? '1' : '0',
                            '0'
                          )
                        )
                        var l = jQuery(
                          String.format(
                            '<img class="flowpaper_mark_video_maximized_closebutton" src="{0}" style="position:absolute;right:3px;top:1%;z-index:999999;cursor:pointer;">',
                            e.H.Jg
                          )
                        )
                        e.H.T.append(l)
                        jQuery(l).bind('mousedown touchstart', function (c) {
                          jQuery('.flowpaper_mark_video_maximized').remove()
                          jQuery(
                            '.flowpaper_mark_video_maximized_closebutton'
                          ).remove()
                          c.preventDefault()
                          c.stopImmediatePropagation()
                        })
                      } else {
                        jQuery(this).html(
                          String.format(
                            "<iframe class='flowpaper_videoframe' width='{0}' height='{1}' src='{3}://www.youtube.com/embed/{2}?rel=0&autoplay={4}&enablejsapi=1&mute={5}' frameborder='0' allowfullscreen allow='autoplay'></iframe>",
                            jQuery(this).width(),
                            jQuery(this).height(),
                            f,
                            -1 < location.href.indexOf('https:')
                              ? 'https'
                              : 'http',
                            !e.H.Eb || v ? '1' : '0',
                            !e.H.Eb || v ? '1' : '0'
                          )
                        )
                      }
                    }
                    d &&
                      0 <= d.toLowerCase().indexOf('vimeo') &&
                      ((f = d.substr(d.lastIndexOf('/') + 1)),
                      g
                        ? ((e.H.Mc = jQuery(
                            String.format(
                              '<div class="flowpaper_mark_video_maximized flowpaper_mark" style="position:absolute;z-index:99999;left:2.5%;top:2.5%;width:95%;height:95%"></div>'
                            )
                          )),
                          e.H.T.append(e.H.Mc),
                          jQuery(e.H.Mc).html(
                            String.format(
                              "<iframe class='flowpaper_videoframe' src='//player.vimeo.com/video/{2}?autoplay=0' width='{0}' height='{1}' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen allow='autoplay'></iframe>",
                              0.95 * e.H.T.width(),
                              0.95 * e.H.T.height(),
                              f
                            )
                          ),
                          (l = jQuery(
                            String.format(
                              '<img class="flowpaper_mark_video_maximized_closebutton" src="{0}" style="position:absolute;right:3px;top:1%;z-index:999999;cursor:pointer;">',
                              e.H.Jg
                            )
                          )),
                          e.H.T.append(l),
                          jQuery(l).bind('mouseup touchend', function (c) {
                            jQuery('.flowpaper_mark_video_maximized').remove()
                            jQuery(
                              '.flowpaper_mark_video_maximized_closebutton'
                            ).remove()
                            c.preventDefault()
                            c.stopImmediatePropagation()
                          }))
                        : jQuery(this).html(
                            String.format(
                              "<iframe class='flowpaper_videoframe' src='//player.vimeo.com/video/{2}?autoplay=1' width='{0}' height='{1}' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen allow='autoplay'></iframe>",
                              jQuery(this).width(),
                              jQuery(this).height(),
                              f
                            )
                          ))
                    d &&
                      0 <= d.toLowerCase().indexOf('wistia') &&
                      ((f = d.substr(d.lastIndexOf('/') + 1)),
                      g
                        ? ((e.H.Mc = jQuery(
                            String.format(
                              '<div class="flowpaper_mark_video_maximized flowpaper_mark" style="position:absolute;z-index:99999;left:2.5%;top:2.5%;width:95%;height:95%"></div>'
                            )
                          )),
                          e.H.T.append(e.H.Mc),
                          jQuery(e.H.Mc).html(
                            String.format(
                              "<iframe class='flowpaper_videoframe' src='//fast.wistia.net/embed/iframe/{2}?autoplay=false' width='{0}' height='{1}' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen allow='autoplay'></iframe>",
                              0.95 * e.H.T.width(),
                              0.95 * e.H.T.height(),
                              f
                            )
                          ),
                          (l = jQuery(
                            String.format(
                              '<img class="flowpaper_mark_video_maximized_closebutton" src="{0}" style="position:absolute;right:3px;top:1%;z-index:999999;cursor:pointer;">',
                              e.H.Jg
                            )
                          )),
                          e.H.T.append(l),
                          jQuery(l).bind('mouseup touchend', function (c) {
                            jQuery('.flowpaper_mark_video_maximized').remove()
                            jQuery(
                              '.flowpaper_mark_video_maximized_closebutton'
                            ).remove()
                            c.preventDefault()
                            c.stopImmediatePropagation()
                          }))
                        : jQuery(this).html(
                            String.format(
                              "<iframe class='flowpaper_videoframe' src='//fast.wistia.net/embed/iframe/{2}?autoplay=true' width='{0}' height='{1}' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen allow='autoplay'></iframe>",
                              jQuery(this).width(),
                              jQuery(this).height(),
                              f
                            )
                          ))
                    if (d && -1 < d.indexOf('{')) {
                      try {
                        var m = JSON.parse(d),
                          n = FLOWPAPER.appendUrlParameter(
                            m.mp4,
                            FLOWPAPER.authenticated &&
                              -1 == m.mp4.indexOf('base64,')
                              ? FLOWPAPER.authenticated.getParams()
                              : ''
                          ),
                          t = FLOWPAPER.appendUrlParameter(
                            m.webm,
                            FLOWPAPER.authenticated &&
                              -1 == m.webm.indexOf('base64,')
                              ? FLOWPAPER.authenticated.getParams()
                              : ''
                          )
                        e.H.config.document.URLAlias &&
                          ((n = e.H.config.document.URLAlias + n),
                          (t = e.H.config.document.URLAlias + t))
                        var q = 'vimeoframe_' + FLOWPAPER.jp()
                        if (g) {
                          ;(e.H.Mc = jQuery(
                            String.format(
                              '<div class="flowpaper_mark_video_maximized flowpaper_mark" style="position:absolute;z-index:99999;left:2.5%;top:2.5%;width:95%;height:95%"></div>'
                            )
                          )),
                            e.H.T.append(e.H.Mc),
                            jQuery(e.H.Mc).html(
                              jQuery(
                                String.format(
                                  '<video id="{2}" style="width:{3}px;height:{4}px;" class="videoframe flowpaper_mark video-js vjs-default-skin" controls controlsList="nodownload" preload="auto" width="{3}" height="{4}" {5} {6} data-setup=\'{"example_option":true}\'><source src="{0}" type="video/mp4" /><source src="{1}" type="video/webm" /></video>',
                                  n,
                                  t,
                                  q,
                                  0.95 * e.H.T.width(),
                                  0.95 * e.H.T.height(),
                                  v ? 'autoplay' : '',
                                  ''
                                )
                              )
                            ),
                            (l = jQuery(
                              String.format(
                                '<img class="flowpaper_mark_video_maximized_closebutton" src="{0}" style="position:absolute;right:3px;top:1%;z-index:999999;cursor:pointer;">',
                                e.H.Jg
                              )
                            )),
                            e.H.T.append(l),
                            jQuery(l).bind('mouseup touchend', function (c) {
                              jQuery('.flowpaper_mark_video_maximized').remove()
                              jQuery(
                                '.flowpaper_mark_video_maximized_closebutton'
                              ).remove()
                              c.preventDefault()
                              c.stopImmediatePropagation()
                            })
                        } else {
                          if (0 == jQuery(this).find('video').length) {
                            jQuery(this).html(
                              jQuery(
                                String.format(
                                  '<video id="{2}" class="videoframe flowpaper_mark video-js vjs-default-skin" controls {5} {6} controlsList="nodownload" preload="auto" width="{3}" height="{4}" data-setup=\'{"example_option":true}\'><source src="{0}" type="video/mp4" /><source src="{1}" type="video/webm" /></video>',
                                  n,
                                  t,
                                  q,
                                  jQuery(this).width(),
                                  jQuery(this).height(),
                                  v ? 'autoplay' : '',
                                  v ? 'muted' : ''
                                )
                              )
                            ),
                              videojs(q)
                          } else {
                            return !0
                          }
                        }
                      } catch (r) {}
                    }
                    e.H.Nd = 'up'
                    c.preventDefault()
                    c.stopImmediatePropagation()
                    return !1
                  }))
                : ((h = jQuery(
                    '#flowpaper_mark_video_' + e.pageNumber + '_' + g
                  )),
                  h
                    .css({
                      left: t + 'px',
                      top: q + 'px',
                      width: r + 'px',
                      height: n + 'px',
                      'margin-left': d + 'px',
                    })
                    .find('.flowpaper_mark')
                    .css({ width: r + 'px', height: n + 'px' }),
                  (q = h.find('iframe')),
                  0 < q.length && (q.attr('width', r), q.attr('height', n))))
            if ('image' == e.H.ba[e.pageNumber][g].type) {
              var r = e.H.ba[e.pageNumber][g].Cf * c,
                h = e.H.ba[e.pageNumber][g].Df * c,
                f = e.H.ba[e.pageNumber][g].width * c,
                k = e.H.ba[e.pageNumber][g].height * c,
                A = e.H.ba[e.pageNumber][g].src,
                n = e.H.ba[e.pageNumber][g].href,
                t = e.H.ba[e.pageNumber][g].Zg,
                x = e.H.ba[e.pageNumber][g].ih
              ;(m = e.H.ba[e.pageNumber][g].rk) &&
                'true' == m &&
                ((f = Math.round(25 * c)), (k = Math.round(25 * c)))
              FLOWPAPER.authenticated &&
                -1 == A.indexOf('base64,') &&
                (A = FLOWPAPER.appendUrlParameter(
                  A,
                  FLOWPAPER.authenticated.getParams()
                ))
              FLOWPAPER.authenticated &&
                -1 == t.indexOf('base64,') &&
                (t = FLOWPAPER.appendUrlParameter(
                  t,
                  FLOWPAPER.authenticated.getParams()
                ))
              0 ==
              jQuery('#flowpaper_mark_image_' + e.pageNumber + '_' + g).length
                ? ((q = ''),
                  !m || (m && 'true' != m)
                    ? (q = jQuery(
                        String.format(
                          "<div id='flowpaper_mark_image_{4}_{5}' class='flowpaper_mark_image flowpaper_mark' style='left:{0}px;top:{1}px;width:{2}px;height:{3}px;'><img src='{6}' style='position:absolute;width:{2}px;height:{3}px;' class='flowpaper_mark'/></div>",
                          r,
                          h,
                          f,
                          k,
                          e.pageNumber,
                          g,
                          A
                        )
                      ))
                    : ((q = jQuery(
                        String.format(
                          "<div id='flowpaper_mark_image_{4}_{5}' class='flowpaper_mark_image flowpaper_mark' style='left:{0}px;top:{1}px;width:{2}px;height:{3}px;'><button style='position:absolute;width:{2}px;height:{3}px;' class='flowpaper_mark flowpaper-spotlight-button'/></div>",
                          r,
                          h,
                          f,
                          k,
                          e.pageNumber,
                          g
                        )
                      )),
                      (x = A)),
                  (r = e.Ea),
                  0 == jQuery(r).length && (r = e.Oc),
                  (r = jQuery(r)
                    .append(q)
                    .find('#flowpaper_mark_image_' + e.pageNumber + '_' + g)),
                  r.data('image', e.H.ba[e.pageNumber][g].url),
                  x && x.length && r.data('popover', x),
                  null != n && 0 < n.length
                    ? (r.data('link', n),
                      r.bind('mousedown touchstart', function (c) {
                        if (e.pages.af || e.pages.animating) {
                          return !1
                        }
                        0 == jQuery(this).data('link').indexOf('actionGoTo:')
                          ? e.H.gotoPage(jQuery(this).data('link').substr(11))
                          : jQuery(e.N).trigger(
                              'onExternalLinkClicked',
                              jQuery(this).data('link')
                            )
                        e.H.Nd = 'up'
                        c.preventDefault()
                        c.stopImmediatePropagation()
                        return !1
                      }))
                    : null != t && 0 < t.length
                    ? (r.data('hoversrc', t),
                      r.data('imagesrc', A),
                      r.bind('mouseover', function () {
                        jQuery(this)
                          .find('.flowpaper_mark')
                          .attr('src', jQuery(this).data('hoversrc'))
                      }),
                      r.bind('mouseout', function () {
                        jQuery(this)
                          .find('.flowpaper_mark')
                          .attr('src', jQuery(this).data('imagesrc'))
                      }),
                      e.H.Eb || q.css({ 'pointer-events': 'auto' }))
                    : x && x.length
                    ? r.bind('mousedown touchstart', function (c) {
                        var d = new Image()
                        d.onload = function () {
                          var c = this.height,
                            d = this.width
                          c > window.innerHeight &&
                            ((d = (d / c) * window.innerHeight),
                            (c = window.innerHeight))
                          d > window.innerWidth &&
                            ((c = (c / d) * window.innerWidth),
                            (d = window.innerWidth))
                          jQuery('#modal_image_' + Q(x)).length
                            ? jQuery('#modal_image_' + Q(this.src)).smodal({
                                minHeight: c,
                                minWidth: d,
                              })
                            : (e.H.T.prepend(
                                "<div id='modal_image_" +
                                  Q(this.src) +
                                  "' class='modal-content flowpaper-mark-image-popover' style='overflow:hidden;'><div style='overflow:hidden;'><img src='" +
                                  this.src +
                                  "' style='width:100%;height:auto;'/></div></div>"
                              ),
                              jQuery('#modal_image_' + Q(this.src)).smodal({
                                minHeight: c,
                                minWidth: d,
                                appendTo: e.H.T,
                                escClose: !0,
                                overlayClose: !0,
                                closeClass: 'close-popover',
                              }))
                        }
                        d.src = jQuery(c.target)
                          .parent('.flowpaper_mark_image')
                          .data('popover')
                      })
                    : q.css({ 'pointer-events': 'none' }))
                : ((q = jQuery(
                    '#flowpaper_mark_image_' + e.pageNumber + '_' + g
                  )),
                  q
                    .css({
                      left: r + 'px',
                      top: h + 'px',
                      width: f + 'px',
                      height: k + 'px',
                      'margin-left': d + 'px',
                    })
                    .find('.flowpaper_mark')
                    .css({ width: f + 'px', height: k + 'px' }))
            }
            'slideshow' == e.H.ba[e.pageNumber][g].type &&
              ((r = e.H.ba[e.pageNumber][g].Cf * c),
              (n = e.H.ba[e.pageNumber][g].Df * c),
              (t = e.H.ba[e.pageNumber][g].width * c),
              (q = e.H.ba[e.pageNumber][g].height * c),
              (A = e.H.ba[e.pageNumber][g].src),
              FLOWPAPER.authenticated &&
                -1 == A.indexOf('base64,') &&
                (A = FLOWPAPER.appendUrlParameter(
                  A,
                  FLOWPAPER.authenticated.getParams()
                )),
              0 ==
                jQuery('#flowpaper_mark_slide_' + e.pageNumber + '_' + g)
                  .length &&
                ((n = jQuery(
                  String.format(
                    "<div id='flowpaper_mark_slide_{4}_{5}' data-mark-id='{5}' class='flowpaper_mark_frame flowpaper_mark flowpaper_mark_slideshow' style='left:{0}px;top:{1}px;width:{2}px;height:{3}px;margin-left:{6}px'><img src='{7}' style='position:absolute;width:{2}px;height:{3}px;' class='flowpaper_mark'/></div>",
                    r,
                    n,
                    t,
                    q,
                    e.pageNumber,
                    g,
                    d,
                    A
                  )
                )),
                (r = e.Ea),
                0 == jQuery(r).length && (r = e.Oc),
                (r = jQuery(r)
                  .append(n)
                  .find('#flowpaper_mark_slide_' + e.pageNumber + '_' + g)),
                jQuery('#flowpaper_mark_slide_' + e.pageNumber + '_' + g).bind(
                  'mouseup touchend',
                  function (c) {
                    e.H.T.append(
                      '<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">\n    <div class="pswp__bg"></div>\n    <div class="pswp__scroll-wrap">\n        <div class="pswp__container">\n            <div class="pswp__item"></div>\n            <div class="pswp__item"></div>\n            <div class="pswp__item"></div>\n        </div>\n        <div class="pswp__ui pswp__ui--hidden">\n            <div class="pswp__top-bar">\n                <div class="pswp__counter"></div>\n                <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>\n                <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>\n                <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>\n                <div class="pswp__preloader">\n                    <div class="pswp__preloader__icn">\n                      <div class="pswp__preloader__cut">\n                        <div class="pswp__preloader__donut"></div>\n                      </div>\n                    </div>\n                </div>\n            </div>\n            <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">\n                <div class="pswp__share-tooltip"></div> \n            </div>\n            <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">\n            </button>\n            <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">\n            </button>\n            <div class="pswp__caption">\n                <div class="pswp__caption__center"></div>\n            </div>\n        </div>\n    </div>\n</div>'
                    )
                    for (
                      var d = parseInt(jQuery(this).data('mark-id')),
                        g = document.querySelectorAll('.pswp')[0],
                        d = e.H.ba[e.pageNumber][d],
                        h = [],
                        f = 0;
                      f < d.images.length;
                      f++
                    ) {
                      h.push({
                        src:
                          FLOWPAPER.authenticated && -1 == A.indexOf('base64,')
                            ? FLOWPAPER.appendUrlParameter(
                                d.images[f].src,
                                FLOWPAPER.authenticated.getParams()
                              )
                            : d.images[f].src,
                        w: d.images[f].width,
                        h: d.images[f].height,
                      })
                    }
                    new PhotoSwipe(g, PhotoSwipeUI_Default, h, {
                      index: 0,
                    }).init()
                    c.preventDefault()
                    c.stopImmediatePropagation()
                  }
                )))
            'iframe' == e.H.ba[e.pageNumber][g].type &&
              ((q = e.H.ba[e.pageNumber][g].nj * c),
              (h = e.H.ba[e.pageNumber][g].oj * c),
              (r = e.H.ba[e.pageNumber][g].width * c),
              (t = e.H.ba[e.pageNumber][g].height * c),
              (f = e.H.ba[e.pageNumber][g].src),
              FLOWPAPER.authenticated &&
                -1 == f.indexOf('base64,') &&
                (f = FLOWPAPER.appendUrlParameter(
                  f,
                  FLOWPAPER.authenticated.getParams()
                )),
              0 ==
              jQuery('#flowpaper_mark_frame_' + e.pageNumber + '_' + g).length
                ? ((n = r - 10),
                  50 < n && (n = 50),
                  50 > r && (n = r - 10),
                  50 > t && (n = t - 10),
                  (f = jQuery(
                    String.format(
                      "<div id='flowpaper_mark_frame_{4}_{5}' class='flowpaper_mark_frame flowpaper_mark' style='left:{0}px;top:{1}px;width:{2}px;height:{3}px;margin-left:{7}px'><img src='{6}' style='position:absolute;width:{2}px;height:{3}px;' class='flowpaper_mark'/><div id='flowpaper_mark_frame_{4}_{5}_play' style='position:absolute;top:{9}px;left:{8}px;'></div></div>",
                      q,
                      h,
                      r,
                      t,
                      e.pageNumber,
                      g,
                      f,
                      d,
                      r / 2 - n / 3,
                      t / 2 - n
                    )
                  )),
                  (r = e.Ea),
                  0 == jQuery(r).length && (r = e.Oc),
                  (r = jQuery(r)
                    .append(f)
                    .find('#flowpaper_mark_frame_' + e.pageNumber + '_' + g)),
                  jQuery(
                    '#flowpaper_mark_frame_' + e.pageNumber + '_' + g + '_play'
                  ).Rd(n, '#AAAAAA', !0),
                  r.data('url', e.H.ba[e.pageNumber][g].url),
                  r.data('maximizeframe', e.H.ba[e.pageNumber][g].Xp),
                  jQuery(
                    '#flowpaper_mark_frame_' + e.pageNumber + '_' + g + '_play'
                  ).bind('mouseup touchend', function (c) {
                    if (e.pages.af || e.pages.animating) {
                      return !1
                    }
                    var d = jQuery(this).parent().data('url'),
                      g = 'true' == jQuery(this).parent().data('maximizeframe')
                    ;-1 < d.indexOf('http') &&
                      (d = d.substr(d.indexOf('//') + 2))
                    g
                      ? ((e.H.mm = jQuery(
                          String.format(
                            '<div class="flowpaper_mark_frame_maximized flowpaper_mark" style="position:absolute;z-index:99999;left:2.5%;top:2.5%;width:95%;height:95%"></div>'
                          )
                        )),
                        e.H.T.append(e.H.mm),
                        jQuery(e.H.mm).html(
                          String.format(
                            "<iframe sandbox='allow-forms allow-same-origin allow-scripts' width='{0}' height='{1}' src='{3}://{2}' frameborder='0' allowfullscreen ></iframe>",
                            0.95 * e.H.T.width(),
                            0.95 * e.H.T.height(),
                            d,
                            -1 < location.href.indexOf('https:')
                              ? 'https'
                              : 'http'
                          )
                        ),
                        (d = jQuery(
                          String.format(
                            '<img class="flowpaper_mark_frame_maximized_closebutton" src="{0}" style="position:absolute;right:3px;top:1%;z-index:999999;cursor:pointer;">',
                            e.H.Jg
                          )
                        )),
                        e.H.T.append(d),
                        jQuery(d).bind('mouseup touchend', function (c) {
                          jQuery('.flowpaper_mark_frame_maximized').remove()
                          jQuery(
                            '.flowpaper_mark_frame_maximized_closebutton'
                          ).remove()
                          c.preventDefault()
                          c.stopImmediatePropagation()
                        }))
                      : jQuery(this)
                          .parent()
                          .html(
                            String.format(
                              "<iframe sandbox='allow-forms allow-same-origin allow-scripts' width='{0}' height='{1}' src='{3}://{2}' frameborder='0' allowfullscreen ></iframe>",
                              jQuery(this).parent().width(),
                              jQuery(this).parent().height(),
                              d,
                              -1 < location.href.indexOf('https:')
                                ? 'https'
                                : 'http'
                            )
                          )
                    e.H.Nd = 'up'
                    c.preventDefault()
                    c.stopImmediatePropagation()
                    return !1
                  }))
                : ((f = jQuery(
                    '#flowpaper_mark_frame_' + e.pageNumber + '_' + g
                  )),
                  f
                    .css({
                      left: q + 'px',
                      top: h + 'px',
                      width: r + 'px',
                      height: t + 'px',
                      'margin-left': d + 'px',
                    })
                    .find('.flowpaper_mark')
                    .css({ width: r + 'px', height: t + 'px' }),
                  (q = f.find('iframe')),
                  0 < q.length && (q.attr('width', r), q.attr('height', t))))
          }
        }
      },
      dispose: function () {
        jQuery(this.Ea).find('*').unbind()
        jQuery(this).unbind()
        jQuery(this.ga).unbind()
        delete this.ga
        this.ga = null
        jQuery(this.Ea).find('*').remove()
        this.selectors = this.pages = this.H = this.N = null
      },
      rotate: function () {
        ;(this.rotation && 360 != this.rotation) || (this.rotation = 0)
        this.rotation = this.rotation + 90
        360 == this.rotation && (this.rotation = 0)
        var c = this.qc()
        if ('Portrait' == this.H.I || 'SinglePage' == this.H.I) {
          this.Ya(),
            90 == this.rotation
              ? (this.V(this.da).transition({ rotate: this.rotation }, 0),
                jQuery(this.Aa).transition(
                  { rotate: this.rotation, translate: '-' + c + 'px, 0px' },
                  0
                ),
                jQuery(this.Mb).css({ 'z-index': 11, 'margin-left': c }),
                jQuery(this.Mb).transition(
                  { rotate: this.rotation, translate: '-' + c + 'px, 0px' },
                  0
                ))
              : 270 == this.rotation
              ? (jQuery(this.Aa).transition(
                  { rotate: this.rotation, translate: '-' + c + 'px, 0px' },
                  0
                ),
                jQuery(this.Mb).css({ 'z-index': 11, 'margin-left': c }),
                this.V(this.da).transition({ rotate: this.rotation }, 0),
                jQuery(this.Mb).transition(
                  { rotate: this.rotation, translate: '-' + c + 'px, 0px' },
                  0
                ))
              : 180 == this.rotation
              ? (jQuery(this.Aa).transition(
                  { rotate: this.rotation, translate: '-' + c + 'px, 0px' },
                  0
                ),
                jQuery(this.Mb).css({ 'z-index': 11, 'margin-left': c }),
                this.V(this.da).transition({ rotate: this.rotation }, 0),
                jQuery(this.Mb).transition(
                  { rotate: this.rotation, translate: '-' + c + 'px, 0px' },
                  0
                ))
              : (jQuery(this.Aa).css('transform', ''),
                jQuery(this.Mb).css({ 'z-index': '', 'margin-left': 0 }),
                this.V(this.da).css('transform', ''),
                jQuery(this.Mb).css('transform', ''))
        }
      },
      Qd: function (c, d, e, g, h, f, k, m, p) {
        var n = this,
          t = n.pageNumber + (d ? d : 0),
          q = new jQuery.Deferred()
        if (!n.H.renderer.ua) {
          return q.resolve(), q
        }
        n.pages.animating &&
          (window.clearTimeout(n.Zj),
          (n.Zj = setTimeout(function () {
            n.Qd(c, d, e, g, h, f, k, !1, p)
          }, 50)))
        k || n.md()
        var r = n.H.renderer
        'SinglePage' == n.I && (t = n.pages.Z)
        n.H.config.document.RTLMode && (t = n.pages.getTotalPages() - t - 1)
        r.ca[t] && r.ca[t].loaded && (1 == jQuery(c).data('needs-overlay') || f)
          ? (jQuery(c).data(
              'needs-overlay',
              jQuery(c).data('needs-overlay') - 1
            ),
            n.Qp(d, function () {
              n.Sp = !0
              var d = r.ca[t].text,
                f = c.getContext('2d'),
                k =
                  (e ? e : c.width) / (r.ca[0] ? r.ca[0].width : r.ca[t].width),
                l = !0
              g || ((g = 0), (l = !1))
              h || ((h = 0), (l = !1))
              f.setTransform(1, 0, 0, 1, g, h)
              f.save()
              if (p) {
                var m = eb.platform.Za
                f.clearRect(0, 0, p.width * m, p.height * m)
              }
              f.scale(k, k)
              for (m = 0; m < d.length; m++) {
                var B = d[m],
                  C = B[1],
                  M = B[0] + B[10] * B[3],
                  E = B[9],
                  J = B[2],
                  F = B[3],
                  D = B[7],
                  y = B[8],
                  z = B[6],
                  G = B[11],
                  B = B[12],
                  K = D && 0 == D.indexOf('(bold)'),
                  L = D && 0 == D.indexOf('(italic)')
                D &&
                  ((D = D.replace('(bold) ', '')),
                  (D = D.replace('(italic) ', '')),
                  (f.font =
                    (L ? 'italic ' : '') +
                    (K ? 'bold ' : '') +
                    Math.abs(F) +
                    'px ' +
                    D +
                    ', ' +
                    y))
                if ('object' == typeof z && z.length && 6 == z.length) {
                  var I,
                    D = z[1],
                    y = z[2],
                    K = z[3],
                    L = z[4],
                    F = z[5]
                  'axial' === z[0]
                    ? (I = f.createLinearGradient(D[0], D[1], y[0], y[1]))
                    : 'radial' === z[0] &&
                      (I = f.createRadialGradient(D[0], D[1], K, y[0], y[1], L))
                  z = 0
                  for (D = F.length; z < D; ++z) {
                    ;(y = F[z]), I.addColorStop(y[0], y[1])
                  }
                  f.fillStyle = I
                } else {
                  f.fillStyle = z
                }
                0 != G && (f.save(), f.translate(C, M), f.rotate(G))
                if (B) {
                  for (z = 0; z < B.length; z++) {
                    ;(F = B[z]),
                      0 == G
                        ? (l &&
                            (0 > g + (C + F[0] * E + J) * k ||
                              g + (C + F[0] * E) * k > c.width)) ||
                          f.fillText(F[1], C + F[0] * E, M)
                        : f.fillText(F[1], F[0] * Math.abs(E), 0)
                  }
                }
                0 != G && f.restore()
              }
              f.restore()
              if (
                $(c).hasClass('flowpaper_glyphcanvas') &&
                ((d = n.pageNumber), n.H.ba[d])
              ) {
                f.save()
                f.globalCompositeOperation = 'destination-out'
                f.beginPath()
                m = eb.platform.Za
                l =
                  (jQuery(n.da).get(0).getBoundingClientRect().width /
                    (n.ae() * n.Ha)) *
                  m
                for (z = 0; z < n.H.ba[d].length; z++) {
                  ;('video' != n.H.ba[d][z].type &&
                    'audio' != n.H.ba[d][z].type) ||
                    f.rect(
                      n.H.ba[d][z].ni * l,
                      n.H.ba[d][z].oi * l,
                      n.H.ba[d][z].width * l,
                      n.H.ba[d][z].height * l
                    ),
                    'image' == n.H.ba[d][z].type &&
                      f.rect(
                        n.H.ba[d][z].Cf * l,
                        n.H.ba[d][z].Df * l,
                        n.H.ba[d][z].width * l,
                        n.H.ba[d][z].height * l
                      ),
                    'slideshow' == n.H.ba[d][z].type &&
                      f.rect(
                        n.H.ba[d][z].Cf * l,
                        n.H.ba[d][z].Df * l,
                        n.H.ba[d][z].width * l,
                        n.H.ba[d][z].height * l
                      )
                }
                f.closePath()
                f.fill()
                f.restore()
              }
              jQuery(c).data('overlay-scale', k)
              q.resolve(c, n)
              n.ec()
            }))
          : (r.ca[t].loaded
              ? q.resolve(c, n)
              : ((n.Sp = !1), (c.width = 100), q.reject()),
            n.ec())
        return q
      },
      Qp: function (c, d) {
        var e = new jQuery.Deferred(),
          g = this.H.renderer
        g.Ph || (g.Ph = {})
        g.fd || (g.fd = {})
        g.jm || (g.jm = [])
        var h = [],
          f = !1,
          k = this.pageNumber
        this.H.config.document.RTLMode &&
          (k = this.pages.getTotalPages() - k - 1)
        k = g.lg(k)
        if (-1 < g.jm.indexOf(k)) {
          e.resolve(), d && d()
        } else {
          for (var m = k - 10; m < k; m++) {
            var p = this.H.config.document.RTLMode
              ? this.pages.getTotalPages() - m - 1
              : m
            g.ca[p] && g.ca[p].fonts && 0 < g.ca[p].fonts.length && (f = !0)
          }
          if ((!eb.browser.msie && !eb.browser.wg) || f) {
            if (
              ((m = this.pageNumber + (c ? c : 0)),
              this.H.config.document.RTLMode &&
                (m = this.pages.getTotalPages() - m - 1),
              (p = g.ca[m].text),
              f)
            ) {
              for (m = k - (10 < k ? 11 : 10); m < k; m++) {
                if (
                  ((p = this.H.config.document.RTLMode
                    ? this.pages.getTotalPages() - m - 1
                    : m),
                  g.ca[p] && g.ca[p].fonts && 0 < g.ca[p].fonts.length)
                ) {
                  for (f = 0; f < g.ca[p].fonts.length; f++) {
                    g.fd[g.ca[p].fonts[f].name] ||
                      (ja(g.ca[p].fonts[f].name, g.ca[p].fonts[f].data),
                      h.push(g.ca[p].fonts[f].name))
                  }
                }
              }
            } else {
              if (p && 0 < p.length) {
                for (k = 0; k < p.length; k++) {
                  p[k][7] &&
                    !g.fd[p[k][7]] &&
                    -1 == h.indexOf(p[k][7]) &&
                    0 == p[k][7].indexOf('g_font') &&
                    p[k][7] &&
                    h.push(p[k][7])
                }
              }
            }
          } else {
            for (f = this.pages.getTotalPages(), m = 0; m < f; m++) {
              if (((k = g.ca[m]), k.loaded)) {
                for (p = k.text, k = 0; k < p.length; k++) {
                  p[k][7] &&
                    !g.fd[p[k][7]] &&
                    -1 == h.indexOf(p[k][7]) &&
                    0 == p[k][7].indexOf('g_font') &&
                    p[k][7] &&
                    h.push(p[k][7])
                }
              }
            }
          }
          0 < h.length
            ? ((f = h.join(' ')),
              g.Ph[f]
                ? g.Ph[f].then(function () {
                    e.resolve()
                  })
                : ((g.Ph[f] = e),
                  WebFont.load({
                    custom: { families: h },
                    inactive: function () {
                      e.resolve()
                    },
                    fontactive: function (c) {
                      g.fd[c] = 'loaded'
                    },
                    fontinactive: function (c) {
                      g.fd[c] = 'inactive'
                    },
                    active: function () {
                      e.resolve()
                    },
                    timeout: eb.browser.msie || eb.browser.wg ? 5000 : 25000,
                  })),
              e.then(function () {
                d && d()
              }))
            : (e.resolve(), d && d())
          return e
        }
      },
    }
    return f
  })()
function La(f, c) {
  this.H = this.O = f
  this.N = this.H.N
  this.resources = this.H.resources
  this.aa = this.H.aa
  this.document = c
  this.Zf = null
  this.Ma = 'toolbar_' + this.H.aa
  this.M = '#' + this.Ma
  this.nl = this.Ma + '_bttnPrintdialogPrint'
  this.Mi = this.Ma + '_bttnPrintdialogCancel'
  this.kl = this.Ma + '_bttnPrintDialog_RangeAll'
  this.ll = this.Ma + '_bttnPrintDialog_RangeCurrent'
  this.ml = this.Ma + '_bttnPrintDialog_RangeSpecific'
  this.Ji = this.Ma + '_bttnPrintDialogRangeText'
  this.dm = this.Ma + '_labelPrintProgress'
  this.Rg = null
  this.create = function () {
    var c = this
    c.Rm = ''
    if (eb.platform.touchonlydevice || c.Rg) {
      c.Rg ||
        ((e = c.resources.na.wn),
        jQuery(c.M).html(
          (eb.platform.touchonlydevice
            ? ''
            : String.format(
                "<img src='{0}' class='flowpaper_tbbutton_large flowpaper_print flowpaper_bttnPrint' style='margin-left:5px;'/>",
                c.resources.na.Qn
              )) +
            (c.H.config.document.ViewModeToolsVisible
              ? (eb.platform.Fb
                  ? ''
                  : String.format(
                      "<img src='{0}' class='flowpaper_tbbutton_large flowpaper_viewmode flowpaper_singlepage {1} flowpaper_bttnSinglePage' style='margin-left:15px;'>",
                      c.resources.na.Tn,
                      'Portrait' == c.H.Db ? 'flowpaper_tbbutton_pressed' : ''
                    )) +
                (eb.platform.Fb
                  ? ''
                  : String.format(
                      "<img src='{0}' style='margin-left:-1px;' class='flowpaper_tbbutton_large flowpaper_viewmode  flowpaper_twopage {1} flowpaper_bttnTwoPage'>",
                      c.resources.na.$n,
                      'TwoPage' == c.H.Db ? 'flowpaper_tbbutton_pressed' : ''
                    )) +
                (eb.platform.Fb
                  ? ''
                  : String.format(
                      "<img src='{0}' style='margin-left:-1px;' class='flowpaper_tbbutton_large flowpaper_viewmode flowpaper_thumbview flowpaper_bttnThumbView'>",
                      c.resources.na.Yn
                    )) +
                (eb.platform.Fb
                  ? ''
                  : String.format(
                      "<img src='{0}' style='margin-left:-1px;' class='flowpaper_tbbutton_large flowpaper_fitmode flowpaper_fitwidth flowpaper_bttnFitWidth'>",
                      c.resources.na.Bn
                    )) +
                (eb.platform.Fb
                  ? ''
                  : String.format(
                      "<img src='{0}' style='margin-left:-1px;' class='flowpaper_tbbutton_large flowpaper_fitmode fitheight flowpaper_bttnFitHeight'>",
                      c.resources.na.On
                    )) +
                ''
              : '') +
            (c.H.config.document.ZoomToolsVisible
              ? String.format(
                  "<img class='flowpaper_tbbutton_large flowpaper_bttnZoomIn' src='{0}' style='margin-left:5px;' />",
                  c.resources.na.ao
                ) +
                String.format(
                  "<img class='flowpaper_tbbutton_large flowpaper_bttnZoomOut' src='{0}' style='margin-left:-1px;' />",
                  c.resources.na.bo
                ) +
                (eb.platform.Fb
                  ? ''
                  : String.format(
                      "<img class='flowpaper_tbbutton_large flowpaper_bttnFullScreen' src='{0}' style='margin-left:-1px;' />",
                      c.resources.na.Dn
                    )) +
                ''
              : '') +
            (c.H.config.document.NavToolsVisible
              ? String.format(
                  "<img src='{0}' class='flowpaper_tbbutton_large flowpaper_previous flowpaper_bttnPrevPage' style='margin-left:15px;'/>",
                  c.resources.na.rn
                ) +
                String.format(
                  "<input type='text' class='flowpaper_tbtextinput_large flowpaper_currPageNum flowpaper_txtPageNumber' value='1' style='width:70px;text-align:right;' />"
                ) +
                String.format(
                  "<div class='flowpaper_tblabel_large flowpaper_numberOfPages flowpaper_lblTotalPages'> / </div>"
                ) +
                String.format(
                  "<img src='{0}'  class='flowpaper_tbbutton_large flowpaper_next flowpaper_bttnPrevNext'/>",
                  c.resources.na.tn
                ) +
                ''
              : '') +
            (c.H.config.document.SearchToolsVisible
              ? String.format(
                  "<input type='text' class='flowpaper_tbtextinput_large flowpaper_txtSearch' style='margin-left:15px;width:130px;' />"
                ) +
                String.format(
                  "<img src='{0}' class='flowpaper_find flowpaper_tbbutton_large flowpaper_bttnFind' style=''/>",
                  c.resources.na.An
                ) +
                ''
              : '')
        ),
        jQuery(c.M).addClass('flowpaper_toolbarios'))
    } else {
      var e = c.resources.na.vn,
        g = String.format(
          "<div class='flowpaper_floatright flowpaper_bttnPercent' sbttnPrintIdtyle='text-align:center;padding-top:5px;background-repeat:no-repeat;width:20px;height:20px;font-size:9px;font-family:Arial;background-image:url({0})'><div id='lblPercent'></div></div>",
          c.resources.na.Vn
        )
      eb.browser.msie && addCSSRule('.flowpaper_tbtextinput', 'height', '18px')
      jQuery(c.M).html(
        String.format(
          "<img src='{0}' class='flowpaper_tbbutton print flowpaper_bttnPrint'/>",
          c.resources.na.Pn
        ) +
          String.format("<img src='{0}' class='flowpaper_tbseparator' />", e) +
          (c.H.config.document.ViewModeToolsVisible
            ? String.format(
                "<img src='{1}' class='flowpaper_bttnSinglePage flowpaper_tbbutton flowpaper_viewmode flowpaper_singlepage {0}' />",
                'Portrait' == c.H.Db ? 'flowpaper_tbbutton_pressed' : '',
                c.resources.na.Un
              ) +
              String.format(
                "<img src='{1}' class='flowpaper_bttnTwoPage flowpaper_tbbutton flowpaper_viewmode flowpaper_twopage {0}' />",
                'TwoPage' == c.H.Db ? 'flowpaper_tbbutton_pressed' : '',
                c.resources.na.Zn
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_tbbutton flowpaper_thumbview flowpaper_viewmode flowpaper_bttnThumbView' />",
                c.resources.na.Xn
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_tbbutton flowpaper_fitmode flowpaper_fitwidth flowpaper_bttnFitWidth' />",
                c.resources.na.Nn
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_tbbutton flowpaper_fitmode flowpaper_fitheight flowpaper_bttnFitHeight'/>",
                c.resources.na.Mn
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_tbbutton flowpaper_bttnRotate'/>",
                c.resources.na.Sn
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_tbseparator' />",
                e
              )
            : '') +
          (c.H.config.document.ZoomToolsVisible
            ? String.format(
                "<div class='flowpaper_slider flowpaper_zoomSlider' style='{0}'><div class='flowpaper_handle' style='{0}'></div></div>",
                eb.browser.msie && 9 > eb.browser.version ? c.Rm : ''
              ) +
              String.format(
                "<input type='text' class='flowpaper_tbtextinput flowpaper_txtZoomFactor' style='width:40px;' />"
              ) +
              String.format(
                "<img class='flowpaper_tbbutton flowpaper_bttnFullScreen' src='{0}' />",
                c.resources.na.Cn
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_tbseparator' style='margin-left:5px' />",
                e
              )
            : '') +
          (c.H.config.document.NavToolsVisible
            ? String.format(
                "<img src='{0}' class='flowpaper_tbbutton flowpaper_previous flowpaper_bttnPrevPage'/>",
                c.resources.na.qn
              ) +
              String.format(
                "<input type='text' class='flowpaper_tbtextinput flowpaper_currPageNum flowpaper_txtPageNumber' value='1' style='width:50px;text-align:right;' />"
              ) +
              String.format(
                "<div class='flowpaper_tblabel flowpaper_numberOfPages flowpaper_lblTotalPages'> / </div>"
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_tbbutton flowpaper_next flowpaper_bttnPrevNext'/>",
                c.resources.na.sn
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_tbseparator' />",
                e
              )
            : '') +
          (c.H.config.document.CursorToolsVisible
            ? String.format(
                "<img src='{0}' class='flowpaper_tbbutton flowpaper_bttnTextSelect'/>",
                c.resources.na.Wn
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_tbbutton flowpaper_tbbutton_pressed flowpaper_bttnHand'/>",
                c.resources.na.Fn
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_tbseparator' />",
                e
              )
            : '') +
          (c.H.config.document.SearchToolsVisible
            ? String.format(
                "<input type='text' class='flowpaper_tbtextinput flowpaper_txtSearch' style='width:70px;margin-left:4px' />"
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_find flowpaper_tbbutton flowpaper_bttnFind' />",
                c.resources.na.zn
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_tbseparator' />",
                e
              )
            : '') +
          g
      )
      jQuery(c.M).addClass('flowpaper_toolbarstd')
    }
    jQuery(c.N).bind('onDocumentLoaded', function () {
      jQuery(c.M).find('.flowpaper_bttnPercent').hide()
    })
  }
  this.hm = function (c) {
    c = this.Ua = c.split('\n')
    jQuery(this.M)
      .find('.flowpaper_bttnPrint')
      .attr('title', this.wa(c, 'Print'))
    jQuery(this.M)
      .find('.flowpaper_bttnSinglePage')
      .attr('title', this.wa(c, 'SinglePage'))
    jQuery(this.M)
      .find('.flowpaper_bttnTwoPage, .flowpaper_bttnBookView')
      .attr('title', this.wa(c, 'TwoPage'))
    jQuery(this.M)
      .find('.flowpaper_bttnThumbView')
      .attr('title', this.wa(c, 'ThumbView'))
    jQuery(this.M)
      .find('.flowpaper_bttnFitWidth')
      .attr('title', this.wa(c, 'FitWidth'))
    jQuery(this.M)
      .find('.flowpaper_bttnFitHeight')
      .attr('title', this.wa(c, 'FitHeight'))
    jQuery(this.M)
      .find('.flowpaper_bttnFitHeight')
      .attr('title', this.wa(c, 'FitPage'))
    jQuery(this.M)
      .find('.flowpaper_zoomSlider')
      .attr('title', this.wa(c, 'Scale'))
    jQuery(this.M)
      .find('.flowpaper_txtZoomFactor')
      .attr('title', this.wa(c, 'Scale'))
    jQuery(this.M)
      .find('.flowpaper_bttnFullScreen, .flowpaper_bttnFullscreen')
      .attr('title', this.wa(c, 'Fullscreen'))
    jQuery(this.M)
      .find('.flowpaper_bttnPrevPage')
      .attr('title', this.wa(c, 'PreviousPage'))
    jQuery(this.M)
      .find('.flowpaper_txtPageNumber')
      .attr('title', this.wa(c, 'CurrentPage'))
    jQuery(this.M)
      .find('.flowpaper_bttnPrevNext')
      .attr('title', this.wa(c, 'NextPage'))
    jQuery(this.M)
      .find('.flowpaper_bttnDownload')
      .attr('title', this.wa(c, 'Download'))
    jQuery(this.M)
      .find('.flowpaper_txtSearch, .flowpaper_bttnTextSearch')
      .attr('title', this.wa(c, 'Search'))
    jQuery(this.M)
      .find('.flowpaper_bttnFind')
      .attr('title', this.wa(c, 'Search'))
    var e = this.H.Gk && 0 < this.H.Gk.length ? this.H.Gk : this.H.T
    e.find('.flowpaper_bttnHighlight')
      .find('.flowpaper_tbtextbutton')
      .html(this.wa(c, 'Highlight', 'Highlight'))
    e.find('.flowpaper_bttnComment')
      .find('.flowpaper_tbtextbutton')
      .html(this.wa(c, 'Comment', 'Comment'))
    e.find('.flowpaper_bttnStrikeout')
      .find('.flowpaper_tbtextbutton')
      .html(this.wa(c, 'Strikeout', 'Strikeout'))
    e.find('.flowpaper_bttnDraw')
      .find('.flowpaper_tbtextbutton')
      .html(this.wa(c, 'Draw', 'Draw'))
    e.find('.flowpaper_bttnDelete')
      .find('.flowpaper_tbtextbutton')
      .html(this.wa(c, 'Delete', 'Delete'))
    e.find('.flowpaper_bttnShowHide')
      .find('.flowpaper_tbtextbutton')
      .html(this.wa(c, 'ShowAnnotations', 'Show Annotations'))
  }
  this.wa = function (c, e, g) {
    if (c) {
      for (var h = 0; h < c.length; h++) {
        var f = c[h].split('=')
        if (f[0] == e) {
          return f[1]
        }
      }
    }
    return g ? g : null
  }
  this.bindEvents = function () {
    var c = this
    jQuery(c.M)
      .find('.flowpaper_tbbutton_large, .flowpaper_tbbutton')
      .each(function () {
        jQuery(this).data('minscreenwidth') &&
          parseInt(jQuery(this).data('minscreenwidth')) > window.innerWidth &&
          jQuery(this).hide()
      })
    if (0 == c.H.T.find('.flowpaper_printdialog').length) {
      var e = c.wa(
        c.Ua,
        'Enterpagenumbers',
        'Enter page numbers and/or page ranges separated by commas. For example 1,3,5-12'
      )
      c.H.Eb
        ? c.H.T.prepend(
            "<div id='modal-print' class='modal-content flowpaper_printdialog' style='overflow:hidden;;'><div style='background-color:#fff;color:#000;padding:10px 10px 10px 10px;height:205px;padding-bottom:20px;'>It's not possible to print from within the Desktop Publisher. <br/><br/>You can try this feature by clicking on 'Publish' and then 'View in Browser'.<br/><br/><a class='flowpaper_printdialog_button' id='" +
              c.Mi +
              "'>OK</a></div></div>"
          )
        : c.H.T.prepend(
            "<div id='modal-print' class='modal-content flowpaper_printdialog' style='overflow:hidden;'><font style='color:#000000;font-size:11px'><b>" +
              c.wa(c.Ua, 'Selectprintrange', 'Select print range') +
              "</b></font><div style='width:98%;padding-top:5px;padding-left:5px;background-color:#ffffff;'><table border='0' style='margin-bottom:10px;'><tr><td><input type='radio' name='PrintRange' checked='checked' id='" +
              c.kl +
              "'/></td><td>" +
              c.wa(c.Ua, 'All', 'All') +
              "</td></tr><tr><td><input type='radio' name='PrintRange' id='" +
              c.ll +
              "'/></td><td>" +
              c.wa(c.Ua, 'CurrentPage', 'Current Page') +
              "</td></tr><tr><td><input type='radio' name='PrintRange' id='" +
              c.ml +
              "'/></td><td>" +
              c.wa(c.Ua, 'Pages', 'Pages') +
              "</td><td><input type='text' style='width:120px' id='" +
              c.Ji +
              "' /><td></tr><tr><td colspan='3'>" +
              e +
              "</td></tr></table><a id='" +
              c.nl +
              "' class='flowpaper_printdialog_button'>" +
              c.wa(c.Ua, 'Print', 'Print') +
              "</a>&nbsp;&nbsp;<a class='flowpaper_printdialog_button' id='" +
              c.Mi +
              "'>" +
              c.wa(c.Ua, 'Cancel', 'Cancel') +
              "</a><span id='" +
              c.dm +
              "' style='padding-left:5px;'></span><div style='height:5px;display:block;margin-top:5px;'>&nbsp;</div></div></div>"
          )
    }
    jQuery('input:radio[name=PrintRange]:nth(0)').attr('checked', !0)
    c.H.config.Toolbar
      ? (jQuery(c.M)
          .find('.flowpaper_txtZoomFactor')
          .bind('click touchstart', function () {
            if (!jQuery(this).hasClass('flowpaper_tbbutton_disabled')) {
              return !1
            }
          }),
        jQuery(c.M)
          .find('.flowpaper_currPageNum')
          .bind('click touchstart', function () {
            jQuery(c.M).find('.flowpaper_currPageNum').focus()
          }),
        jQuery(c.M)
          .find('.flowpaper_txtSearch')
          .bind('click touchstart', function () {
            jQuery(c.M).find('.flowpaper_txtSearch').focus()
            return !1
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnFind')
          .bind('click touchstart', function () {
            c.searchText(jQuery(c.M).find('.flowpaper_txtSearch').val())
            jQuery(c.M).find('.flowpaper_bttnFind').focus()
            return !1
          }))
      : (jQuery(c.M)
          .find('.flowpaper_bttnFitWidth')
          .bind('click touchstart', function () {
            jQuery(this).hasClass('flowpaper_tbbutton_disabled') ||
              (c.H.fitwidth(),
              jQuery('#toolbar').trigger('onFitModeChanged', 'Fit Width'))
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnFitHeight')
          .bind('click touchstart', function () {
            jQuery(this).hasClass('flowpaper_tbbutton_disabled') ||
              (c.H.fitheight(),
              jQuery('#toolbar').trigger('onFitModeChanged', 'Fit Height'))
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnTwoPage')
          .bind('click touchstart', function () {
            jQuery(this).hasClass('flowpaper_tbbutton_disabled') ||
              ('BookView' == c.H.Db
                ? c.H.switchMode('BookView')
                : c.H.switchMode('TwoPage'))
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnSinglePage')
          .bind('click touchstart', function () {
            ;(c.H.config.document.TouchInitViewMode &&
              'SinglePage' != !c.H.config.document.TouchInitViewMode) ||
            !eb.platform.touchonlydevice
              ? c.H.switchMode('Portrait', c.H.getCurrPage() - 1)
              : c.H.switchMode('SinglePage', c.H.getCurrPage())
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnThumbView')
          .bind('click touchstart', function () {
            c.H.switchMode('Tile')
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnPrint')
          .bind('click touchstart', function () {
            eb.platform.touchonlydevice
              ? c.H.printPaper('current')
              : (jQuery('#modal-print').css('background-color', '#dedede'),
                (c.H.Vj = jQuery('#modal-print').smodal({
                  minHeight: 255,
                  appendTo: c.H.T,
                })),
                jQuery('#modal-print')
                  .parent()
                  .css('background-color', '#dedede'))
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnDownload')
          .bind('click touchstart', function () {
            if (window.zine) {
              var e = FLOWPAPER.yk(c.document.PDFFile, c.H.getCurrPage())
              FLOWPAPER.authenticated &&
                (e = FLOWPAPER.appendUrlParameter(
                  e,
                  FLOWPAPER.authenticated.getParams()
                ))
              var h = [],
                f = e.split('?')[0]
              h.push({ download: e, filename: f.split('/').pop() })
              0 < c.document.PDFFile.indexOf('[*,') &&
                -1 == c.document.PDFFile.indexOf('[*,2,true]') &&
                1 < c.H.getTotalPages() &&
                1 < c.H.getCurrPage() &&
                ((e = FLOWPAPER.yk(c.document.PDFFile, c.H.getCurrPage() - 1)),
                (f = e.split('?')[0]),
                h.push({ download: f, filename: f.split('/').pop() }))
              ka(h)
              jQuery(c.H).trigger('onDownloadDocument', e)
            } else {
              ;(e = FLOWPAPER.yk(c.document.PDFFile, c.H.getCurrPage())),
                FLOWPAPER.authenticated &&
                  (e = FLOWPAPER.appendUrlParameter(
                    e,
                    FLOWPAPER.authenticated.getParams()
                  )),
                window.open(e, 'windowname4', null)
            }
            return !1
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnOutline')
          .bind('click touchstart', function () {
            c.H.expandOutline()
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnPrevPage')
          .bind('click touchstart', function () {
            c.H.previous()
            return !1
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnPrevNext')
          .bind('click touchstart', function () {
            c.H.next()
            return !1
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnZoomIn')
          .bind('click touchstart', function () {
            'TwoPage' == c.H.I || 'BookView' == c.H.I
              ? c.H.pages.Me()
              : ('Portrait' != c.H.I && 'SinglePage' != c.H.I) || c.H.ZoomIn()
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnZoomOut')
          .bind('click touchstart', function () {
            'TwoPage' == c.H.I || 'BookView' == c.H.I
              ? c.H.pages.Id()
              : ('Portrait' != c.H.I && 'SinglePage' != c.H.I) || c.H.ZoomOut()
          }),
        jQuery(c.M)
          .find('.flowpaper_txtZoomFactor')
          .bind('click touchstart', function () {
            if (!jQuery(this).hasClass('flowpaper_tbbutton_disabled')) {
              return jQuery(c.M).find('.flowpaper_txtZoomFactor').focus(), !1
            }
          }),
        jQuery(c.M)
          .find('.flowpaper_currPageNum')
          .bind('click touchstart', function () {
            jQuery(c.M).find('.flowpaper_currPageNum').focus()
          }),
        jQuery(c.M)
          .find('.flowpaper_txtSearch')
          .bind('click touchstart', function () {
            jQuery(c.M).find('.flowpaper_txtSearch').focus()
            return !1
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnFullScreen, .flowpaper_bttnFullscreen')
          .bind('click touchstart', function () {
            c.H.openFullScreen()
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnFind')
          .bind('click touchstart', function () {
            c.searchText(jQuery(c.M).find('.flowpaper_txtSearch').val())
            jQuery(c.M).find('.flowpaper_bttnFind').focus()
            return !1
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnTextSelect')
          .bind('click touchstart', function () {
            c.H.Xe = 'flowpaper_selected_default'
            jQuery(c.M)
              .find('.flowpaper_bttnTextSelect')
              .addClass('flowpaper_tbbutton_pressed')
            jQuery(c.M)
              .find('.flowpaper_bttnHand')
              .removeClass('flowpaper_tbbutton_pressed')
            c.H.setCurrentCursor('TextSelectorCursor')
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnHand')
          .bind('click touchstart', function () {
            jQuery(c.M)
              .find('.flowpaper_bttnHand')
              .addClass('flowpaper_tbbutton_pressed')
            jQuery(c.M)
              .find('.flowpaper_bttnTextSelect')
              .removeClass('flowpaper_tbbutton_pressed')
            c.H.setCurrentCursor('ArrowCursor')
          }),
        jQuery(c.M)
          .find('.flowpaper_bttnRotate')
          .bind('click touchstart', function () {
            c.H.rotate()
          }))
    jQuery('#' + c.Ji).bind('keydown', function () {
      jQuery(this).focus()
    })
    jQuery(c.M)
      .find('.flowpaper_currPageNum, .flowpaper_txtPageNumber')
      .bind('keydown', function (e) {
        if (!jQuery(this).hasClass('flowpaper_tbbutton_disabled')) {
          if ('13' != e.keyCode) {
            return
          }
          c.gotoPage(this)
        }
        return !1
      })
    c.H.T.find('.flowpaper_txtSearch').bind('keydown', function (e) {
      if ('13' == e.keyCode) {
        return c.searchText(c.H.T.find('.flowpaper_txtSearch').val()), !1
      }
    })
    jQuery(c.M).bind('onZoomFactorChanged', function (e, h) {
      var f =
        Math.round(
          (h.hg / c.H.document.MaxZoomSize) * 100 * c.H.document.MaxZoomSize
        ) + '%'
      jQuery(c.M).find('.flowpaper_txtZoomFactor').val(f)
      c.hg != h.hg &&
        ((c.hg = h.hg), jQuery(c.H).trigger('onScaleChanged', h.hg))
    })
    jQuery(c.N).bind('onDocumentLoaded', function (e, h) {
      2 > h
        ? jQuery(c.M)
            .find('.flowpaper_bttnTwoPage')
            .addClass('flowpaper_tbbutton_disabled')
        : jQuery(c.M)
            .find('.flowpaper_bttnTwoPage')
            .removeClass('flowpaper_tbbutton_disabled')
    })
    jQuery(c.M).bind('onCursorChanged', function (e, h) {
      'TextSelectorCursor' == h &&
        (jQuery(c.M)
          .find('.flowpaper_bttnTextSelect')
          .addClass('flowpaper_tbbutton_pressed'),
        jQuery(c.M)
          .find('.flowpaper_bttnHand')
          .removeClass('flowpaper_tbbutton_pressed'))
      'ArrowCursor' == h &&
        (jQuery(c.M)
          .find('.flowpaper_bttnHand')
          .addClass('flowpaper_tbbutton_pressed'),
        jQuery(c.M)
          .find('.flowpaper_bttnTextSelect')
          .removeClass('flowpaper_tbbutton_pressed'))
    })
    jQuery(c.M).bind('onFitModeChanged', function (e, h) {
      jQuery('.flowpaper_fitmode').each(function () {
        jQuery(this).removeClass('flowpaper_tbbutton_pressed')
      })
      'FitHeight' == h &&
        jQuery(c.M)
          .find('.flowpaper_bttnFitHeight')
          .addClass('flowpaper_tbbutton_pressed')
      'FitWidth' == h &&
        jQuery(c.M)
          .find('.flowpaper_bttnFitWidth')
          .addClass('flowpaper_tbbutton_pressed')
    })
    jQuery(c.M).bind('onProgressChanged', function (e, h) {
      jQuery('#lblPercent').html(100 * h)
      1 == h && jQuery(c.M).find('.flowpaper_bttnPercent').hide()
    })
    jQuery(c.M).bind('onViewModeChanged', function (e, h) {
      jQuery(c.N).trigger('onViewModeChanged', h)
      jQuery('.flowpaper_viewmode').each(function () {
        jQuery(this).removeClass('flowpaper_tbbutton_pressed')
      })
      if ('Portrait' == c.H.I || 'SinglePage' == c.H.I) {
        jQuery(c.M)
          .find('.flowpaper_bttnSinglePage')
          .addClass('flowpaper_tbbutton_pressed'),
          jQuery(c.M)
            .find('.flowpaper_bttnFitWidth')
            .removeClass('flowpaper_tbbutton_disabled'),
          jQuery(c.M)
            .find('.flowpaper_bttnFitHeight')
            .removeClass('flowpaper_tbbutton_disabled'),
          jQuery(c.M)
            .find('.flowpaper_bttnPrevPage')
            .removeClass('flowpaper_tbbutton_disabled'),
          jQuery(c.M)
            .find('.flowpaper_bttnPrevNext')
            .removeClass('flowpaper_tbbutton_disabled'),
          jQuery(c.M)
            .find('.flowpaper_bttnTextSelect')
            .removeClass('flowpaper_tbbutton_disabled'),
          jQuery(c.M)
            .find('.flowpaper_zoomSlider')
            .removeClass('flowpaper_tbbutton_disabled'),
          jQuery(c.M)
            .find('.flowpaper_txtZoomFactor')
            .removeClass('flowpaper_tbbutton_disabled'),
          c.H.toolbar && c.H.toolbar.Qc && c.H.toolbar.Qc.enable()
      }
      if ('TwoPage' == c.H.I || 'BookView' == c.H.I || 'FlipView' == c.H.I) {
        jQuery(c.M)
          .find('.flowpaper_bttnBookView')
          .addClass('flowpaper_tbbutton_pressed'),
          jQuery(c.M)
            .find('.flowpaper_bttnTwoPage')
            .addClass('flowpaper_tbbutton_pressed'),
          jQuery(c.M)
            .find('.flowpaper_bttnFitWidth')
            .addClass('flowpaper_tbbutton_disabled'),
          jQuery(c.M)
            .find('.flowpaper_bttnFitHeight')
            .addClass('flowpaper_tbbutton_disabled'),
          jQuery(c.M)
            .find('.flowpaper_bttnPrevPage')
            .removeClass('flowpaper_tbbutton_disabled'),
          jQuery(c.M)
            .find('.flowpaper_bttnPrevNext')
            .removeClass('flowpaper_tbbutton_disabled'),
          jQuery(c.M)
            .find('.flowpaper_bttnTextSelect')
            .removeClass('flowpaper_tbbutton_disabled'),
          eb.platform.touchdevice &&
            (jQuery(c.M)
              .find('.flowpaper_zoomSlider')
              .addClass('flowpaper_tbbutton_disabled'),
            jQuery(c.M)
              .find('.flowpaper_txtZoomFactor')
              .addClass('flowpaper_tbbutton_disabled'),
            c.H.toolbar.Qc && c.H.toolbar.Qc.disable()),
          eb.platform.touchdevice ||
            eb.browser.msie ||
            (jQuery(c.M)
              .find('.flowpaper_zoomSlider')
              .removeClass('flowpaper_tbbutton_disabled'),
            jQuery(c.M)
              .find('.flowpaper_txtZoomFactor')
              .removeClass('flowpaper_tbbutton_disabled'),
            c.H.toolbar.Qc && c.H.toolbar.Qc.enable())
      }
      'ThumbView' == c.H.I &&
        (jQuery(c.M)
          .find('.flowpaper_bttnThumbView')
          .addClass('flowpaper_tbbutton_pressed'),
        jQuery(c.M)
          .find('.flowpaper_bttnFitWidth')
          .addClass('flowpaper_tbbutton_disabled'),
        jQuery(c.M)
          .find('.flowpaper_bttnFitHeight')
          .addClass('flowpaper_tbbutton_disabled'),
        jQuery(c.M)
          .find('.flowpaper_bttnPrevPage')
          .addClass('flowpaper_tbbutton_disabled'),
        jQuery(c.M)
          .find('.flowpaper_bttnPrevNext')
          .addClass('flowpaper_tbbutton_disabled'),
        jQuery(c.M)
          .find('.flowpaper_bttnTextSelect')
          .addClass('flowpaper_tbbutton_disabled'),
        jQuery(c.M)
          .find('.flowpaper_zoomSlider')
          .addClass('flowpaper_tbbutton_disabled'),
        jQuery(c.M)
          .find('.flowpaper_txtZoomFactor')
          .addClass('flowpaper_tbbutton_disabled'),
        c.H.toolbar && c.H.toolbar.Qc && c.H.toolbar.Qc.disable())
    })
    jQuery(c.M).bind('onFullscreenChanged', function (e, h) {
      h
        ? jQuery(c.M)
            .find('.flowpaper_bttnFullscreen')
            .addClass('flowpaper_tbbutton_disabled')
        : jQuery(c.M)
            .find('.flowpaper_bttnFullscreen')
            .removeClass('flowpaper_tbbutton_disabled')
    })
    jQuery(c.M).bind('onScaleChanged', function (e, h) {
      jQuery(c.N).trigger('onScaleChanged', h)
      c.Qc && c.Qc.setValue(h, !0)
    })
    jQuery('#' + c.Mi).bind('click touchstart', function (e) {
      jQuery.smodal.close()
      e.stopImmediatePropagation()
      c.H.Vj = null
      return !1
    })
    jQuery('#' + c.nl).bind('click touchstart', function () {
      var e = ''
      jQuery('#' + c.kl).is(':checked') &&
        (c.H.printPaper('all'), (e = '1-' + c.H.renderer.getNumPages()))
      jQuery('#' + c.ll).is(':checked') &&
        (c.H.printPaper('current'),
        (e = jQuery(c.M).find('.flowpaper_txtPageNumber').val()))
      jQuery('#' + c.ml).is(':checked') &&
        ((e = jQuery('#' + c.Ji).val()), c.H.printPaper(e))
      jQuery(this).html('Please wait')
      window.onPrintRenderingProgress = function (e) {
        jQuery('#' + c.dm).html('Processing page:' + e)
      }
      window.onPrintRenderingCompleted = function () {
        jQuery.smodal.close()
        c.H.Vj = null
        c.N.trigger('onDocumentPrinted', e)
      }
      return !1
    })
    c.Jr()
  }
  this.Wk = function (c, e) {
    var g = this
    if (0 != jQuery(g.M).find('.flowpaper_zoomSlider').length && null == g.Qc) {
      g = this
      this.vg = c
      this.ug = e
      if (window.zine) {
        var h = { df: 0, lc: g.H.N.width() / 2, Ec: g.H.N.height() / 2 }
        g.Qc = new Slider(jQuery(g.M).find('.flowpaper_zoomSlider').get(0), {
          callback: function (c) {
            c * g.H.document.MaxZoomSize >= g.H.document.MinZoomSize &&
            c <= g.H.document.MaxZoomSize
              ? g.H.sb(g.H.document.MaxZoomSize * c, h)
              : c * g.H.document.MaxZoomSize < g.H.document.MinZoomSize
              ? g.H.sb(g.H.document.MinZoomSize, h)
              : c > g.H.document.MaxZoomSize &&
                g.H.sb(g.H.document.MaxZoomSize, h)
          },
          animation_callback: function (c) {
            c * g.H.document.MaxZoomSize >= g.H.document.MinZoomSize &&
            c <= g.H.document.MaxZoomSize
              ? g.H.sb(g.H.document.MaxZoomSize * c, h)
              : c * g.H.document.MaxZoomSize < g.H.document.MinZoomSize
              ? g.H.sb(g.H.document.MinZoomSize, h)
              : c > g.H.document.MaxZoomSize &&
                g.H.sb(g.H.document.MaxZoomSize, h)
          },
          snapping: !1,
        })
      } else {
        jQuery(g.M)
          .find('.flowpaper_zoomSlider > *')
          .bind('mousedown', function () {
            jQuery(g.M)
              .find('.flowpaper_bttnFitWidth')
              .removeClass('flowpaper_tbbutton_pressed')
            jQuery(g.M)
              .find('.flowpaper_bttnFitHeight')
              .removeClass('flowpaper_tbbutton_pressed')
          }),
          (g.Qc = new Slider(jQuery(g.M).find('.flowpaper_zoomSlider').get(0), {
            callback: function (c) {
              ;(jQuery(g.M)
                .find('.flowpaper_bttnFitWidth, .flowpaper_bttnFitHeight')
                .hasClass('flowpaper_tbbutton_pressed') &&
                'up' === g.H.Nd) ||
                (c * g.H.document.MaxZoomSize >= g.vg && c <= g.ug
                  ? g.H.sb(g.H.document.MaxZoomSize * c)
                  : c * g.H.document.MaxZoomSize < g.vg
                  ? g.H.sb(g.vg)
                  : c > g.ug && g.H.sb(g.ug))
            },
            animation_callback: function (c) {
              ;(jQuery(g.M)
                .find('.flowpaper_bttnFitWidth, .flowpaper_bttnFitHeight')
                .hasClass('flowpaper_tbbutton_pressed') &&
                'up' === g.H.Nd) ||
                (c * g.H.document.MaxZoomSize >= g.vg && c <= g.ug
                  ? g.H.sb(g.H.document.MaxZoomSize * c)
                  : c * g.H.document.MaxZoomSize < g.vg
                  ? g.H.sb(g.vg)
                  : c > g.ug && g.H.sb(g.ug))
            },
            snapping: !1,
          }))
      }
      jQuery(g.M)
        .find('.flowpaper_txtZoomFactor')
        .bind('keypress', function (c) {
          if (
            !jQuery(this).hasClass('flowpaper_tbbutton_disabled') &&
            13 == c.keyCode
          ) {
            try {
              var e = { df: 0, lc: g.H.N.width() / 2, Ec: g.H.N.height() / 2 },
                d =
                  jQuery(g.M)
                    .find('.flowpaper_txtZoomFactor')
                    .val()
                    .replace('%', '') / 100
              g.H.Zoom(d, e)
            } catch (h) {}
            return !1
          }
        })
    }
  }
  this.Kr = function (c) {
    jQuery(c).val() > this.document.numPages &&
      jQuery(c).val(this.document.numPages)
    ;(1 > jQuery(c).val() || isNaN(jQuery(c).val())) && jQuery(c).val(1)
  }
  this.Ir = function (c) {
    this.document.RTLMode
      ? ((c = this.O.getTotalPages() - c + 1),
        1 > c && (c = 1),
        'TwoPage' == this.H.I
          ? '1' == c
            ? jQuery(this.M).find('.flowpaper_txtPageNumber').val('1-2')
            : (parseInt(c) <= this.document.numPages &&
                0 == this.document.numPages % 2) ||
              (parseInt(c) < this.document.numPages &&
                0 != this.document.numPages % 2)
            ? jQuery(this.M)
                .find('.flowpaper_txtPageNumber')
                .val(c + 1 + '-' + c)
            : jQuery(this.M)
                .find('.flowpaper_txtPageNumber')
                .val(this.document.numPages)
          : 'BookView' == this.H.I || 'FlipView' == this.H.I
          ? '1' != c || eb.platform.iphone
            ? !(parseInt(c) + 1 <= this.document.numPages) ||
              (this.H.J && this.H.J.fa)
              ? jQuery(this.M)
                  .find('.flowpaper_txtPageNumber')
                  .val(this.Td(c, c))
              : (0 != parseInt(c) % 2 && 1 < parseInt(c) && --c,
                jQuery(this.M)
                  .find('.flowpaper_txtPageNumber')
                  .val(this.Td(c, 1 < parseInt(c) ? c + 1 + '-' + c : c)))
            : jQuery(this.M)
                .find('.flowpaper_txtPageNumber')
                .val(this.Td(1, '1'))
          : '0' != c &&
            jQuery(this.M).find('.flowpaper_txtPageNumber').val(this.Td(c, c)))
      : 'TwoPage' == this.H.I
      ? '1' == c
        ? jQuery(this.M).find('.flowpaper_txtPageNumber').val('1-2')
        : (parseInt(c) <= this.document.numPages &&
            0 == this.document.numPages % 2) ||
          (parseInt(c) < this.document.numPages &&
            0 != this.document.numPages % 2)
        ? jQuery(this.M)
            .find('.flowpaper_txtPageNumber')
            .val(c + '-' + (c + 1))
        : jQuery(this.M)
            .find('.flowpaper_txtPageNumber')
            .val(this.document.numPages)
      : 'BookView' == this.H.I || 'FlipView' == this.H.I
      ? '1' != c || eb.platform.iphone
        ? !(parseInt(c) + 1 <= this.document.numPages) ||
          (this.H.J && this.H.J.fa)
          ? jQuery(this.M).find('.flowpaper_txtPageNumber').val(this.Td(c, c))
          : (0 != parseInt(c) % 2 && 1 < parseInt(c) && (c = c - 1),
            jQuery(this.M)
              .find('.flowpaper_txtPageNumber')
              .val(this.Td(c, 1 < parseInt(c) ? c + '-' + (c + 1) : c)))
        : jQuery(this.M).find('.flowpaper_txtPageNumber').val(this.Td(1, '1'))
      : '0' != c &&
        jQuery(this.M).find('.flowpaper_txtPageNumber').val(this.Td(c, c))
  }
  this.Gq = function (c) {
    if (this.H.labels) {
      for (var e = this.H.labels.children(), g = 0; g < e.length; g++) {
        if (e[g].getAttribute('title') == c) {
          return parseInt(e[g].getAttribute('pageNumber'))
        }
      }
    }
    return null
  }
  this.Td = function (c, e, g) {
    0 == c && (c = 1)
    if (this.H.labels) {
      var h = this.H.labels.children()
      h.length > parseInt(c) - 1 &&
        ((e = h[parseInt(c - 1)].getAttribute('title')) && e.length
          ? (e = ra(h[parseInt(c) - 1].getAttribute('title')))
          : !(
              'FlipView' == this.H.I &&
              1 < parseInt(e) &&
              parseInt(e) + 1 <= this.document.numPages
            ) ||
            (this.H.J && this.H.J.fa) ||
            g ||
            (0 != parseInt(e) % 2 && (e = parseInt(e) - 1),
            (e = e + '-' + (parseInt(e) + 1))))
    }
    return e
  }
  this.Jr = function () {
    this.Rg
      ? jQuery(this.Rg.Va)
          .find('.flowpaper_lblTotalPages')
          .html(' / ' + this.document.numPages)
      : jQuery(this.M)
          .find('.flowpaper_lblTotalPages')
          .html(' / ' + this.document.numPages)
  }
  this.gotoPage = function (c) {
    var e = this.Gq(jQuery(c).val())
    e
      ? this.H.gotoPage(e)
      : 0 <= jQuery(c).val().indexOf('-') && 'TwoPage' == this.H.I
      ? ((c = jQuery(c).val().split('-')),
        isNaN(c[0]) ||
          isNaN(c[1]) ||
          (0 == parseInt(c[0]) % 2
            ? this.H.gotoPage(parseInt(c[0]) - 1)
            : this.H.gotoPage(parseInt(c[0]))))
      : isNaN(jQuery(c).val()) || (this.Kr(c), this.H.gotoPage(jQuery(c).val()))
  }
  this.searchText = function (c) {
    this.H.searchText(c)
  }
}
window.addCSSRule = function (f, c, d) {
  for (var e = null, g = 0; g < document.styleSheets.length; g++) {
    try {
      var h = document.styleSheets[g],
        l = h.cssRules || h.rules,
        k = f.toLowerCase()
      if (null != l) {
        null == e && (e = document.styleSheets[g])
        for (var m = 0, p = l.length; m < p; m++) {
          if (l[m].selectorText && l[m].selectorText.toLowerCase() == k) {
            if (null != d) {
              l[m].style[c] = d
              return
            }
            h.deleteRule
              ? h.deleteRule(m)
              : h.removeRule
              ? h.removeRule(m)
              : (l[m].style.cssText = '')
          }
        }
      }
    } catch (n) {}
  }
  h = e || {}
  h.insertRule
    ? ((l = h.cssRules || h.rules),
      h.insertRule(f + '{ ' + c + ':' + d + '; }', l.length))
    : h.addRule && h.addRule(f, c + ':' + d + ';', 0)
}
window.FlowPaperViewer_Zine = function (f, c, d) {
  this.H = c
  this.N = d
  this.toolbar = f
  this.ia = 'FlipView'
  this.wo = this.toolbar.Ma + '_barPrint'
  this.yo = this.toolbar.Ma + '_barViewMode'
  this.vo = this.toolbar.Ma + '_barNavTools'
  this.uo = this.toolbar.Ma + '_barCursorTools'
  this.xo = this.toolbar.Ma + '_barSearchTools'
  this.Do = this.toolbar.Ma + '_bttnMoreTools'
  this.oa =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  this.Ki =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGgchEmOlRoEAAAFUSURBVDjLrZS9SgNREIW/m531JyGbQFAQJE+w4EuYWvQd7C0sAjYpfQcfwsJSXyJgbZFKEhTUuIZkd8Yimx/Dboyytzz345yZuZdxF2x0SpthiBbsZ3/gXnofuYBXbjZSrtevHeRycfQ0bIIo76+HlZ08zDSoPgcBYgz2Ai/t+mYZOQfAbXnJoIoYVFzmcGaiq0SGKL6XPcO56vmKGNgvnGFTztZzTDlNsltdyGqIEec88UKODdEfATm5irBJLoihClTaIaerfrc8Xn/O60OBdgjKyapn2L6a95soEJJdZ6hAYkjMyE+1u6wqv4BRXPB/to25onP/43e8evmw5Jd+vm6Oz1Q3ExAHdDpHOO6XkRbQ7ThAQIxdczC8zDBrpallw53h9731PST7E0pmWsetoRx1NRNjUi6/jfL3i1+zCASI/MZ2LqeTaDKb33hc2J4sep9+A+KGjvNJJ1I+AAAAAElFTkSuQmCC'
  this.Li =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGggFBG3FVUsAAAFTSURBVDjLrZQxSwNBEIXfbuaSUxKUNDYKRmJhZXMIgv/FIm0K/0kau/wdqxQeaGEQksJW0CJ4SC6ZZ5G9eIZbc8pdOfftm/d2ljE3KPXZchhEK9bjH7jX+8TfsH7addzLRA683HI+ZhcQxdukUQ+8nIbhdL8NIR6D0DqXd3niCgBgxOr4EkKwYQrDZEXTmBGiqBVjaw6mpqu8xXet+SPC3EGPnuO4lSMhhHpG/F1WQrRMX4UA3KpHwJJKks1hHG8YJeN42CRJJbO8gwggzjc1o0HvZ94IxT4jurwLpDVXeyhymQJIFxW/Z5bmqu77H72zzZ9POT03rJFHZ+RGKG4l9G8v8gKZ/KjvloYQO0sAs+sCscxISAhw8my8DlddO4Alw441vyQ1ONwlhUjbremHf7/I0V4CCIAkOG6teyxSAlYCAAgMkHyaJLu/Od6r2pNV79MvlFCWQTKpHw8AAAAASUVORK5CYII%3D'
  this.Ei =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGgcmKZ3vOWIAAAG3SURBVDjLrZS9bhNBFIW/uzOLwVacSIYCCUVCyivwAkgGJ31cpMwT8A6UlKnSpKTgARBPkCK8QZCIlAqRBPGXxbF37qFYO8aWNk6QVyvNnNlP52juzlx7xa2e7HYY0ZfspztwF6e/aoHQXO+MudOvq49rubL4/HsdovPz25PW/TpM3l750m4Txdmjdqjftd0L6WyFKGjZjcWxViGikwcHE/0eMmHsHiBMxod3mCDkTiYhdyXf7h0PDYDK3YbHvW1PchfSmEve3zzfvwQz8Gq43D/f7Hu65jyllHa2OLpqgASpGhpXR2ztpJSSS1GUDrvPP318nyJYlWtAvHj7/Vk3HEApMnfcvXuydxg3AkjIhQRhIx7unXTdHfcInoCnb/IMZIAlA1B4jY8iCRyicAeFMC3YtJpZAzm4iKrWZTI0w8mQqfpKFGn+b/i8SiKWDPI57s+8GpRLPs+acPbPO9XYWOuuuZN000SZZnKv/QyrMmxm9p/7WMxBNHg5cyFezCiIEMUD2QK3psjg4aJW5B3IJF/jJkNjrTr3o2bzx6C+v+SrKiACRd5p1IeOitGkfsPh0vrksvvpX4Z15Dxt627DAAAAAElFTkSuQmCC'
  this.wh =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGggfBarvnwYAAAG+SURBVDjLrZQ/axRRFMV/9+2bnUkgKGlsFIxEECWfwMaPIJhqk0+QbUxlkyqdrWBrp/gZ0sTGVgJptkkKmyASLRaHdWf2Hou3f9yVzSaylwf33XmHe+47vDn2kmtFuB6M6Evupxvgvn8p5xM2H24OcV/P4p25uEG/o02Izo+zvJnNxXlRnN9eJ0inWRE1NywWqx0pCuV25WUs74roNEwQnHYLD8J4+hlhHvjwluBgDSdI4E7te62TXlIzSR96J609r3EHKUhIGqi9c3HYBTNQSt3Di522BpISTpK0v8txvwAJlFLRP2Z3f3gehTu8en766f2gCZZ4DWh+e3P57EXjNbgI7kja7hwc5VsR0hhIELfyo4POtiTcI8iBRx/zADLA3ADUeIf/znAQROECxTgRbKJmWEECFzHNjUw2AoySIVM6JaZZpkKzlUSsqRozuGq2quolv2eNcPbXmtTYsNZNeUfs6SVqvBvzjvsZljhsavef91iMS5bwZOrz439NI0grC9sVUoAHi6i1AUEqNoJd9Vtyd1WKolpfO/8131/ivVslRKDM7q+NOepKEGIGkBmUPStH+vX5uSyfXLaf/gE6n/uTJg/UHAAAAABJRU5ErkJggg%3D%3D'
  this.Bh =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGgcnEaz2sL0AAAGlSURBVDjLrZRNjtNAEIW/ssvDkGgyIwUWSGhWHIEj8Cf2bDgFV+AMLGHBCgmJA3ABdpyBkWaFmAHxGyLHrsfC7dgmsQhSvLG763O/qtddbU/Y6cl2w/DY83r6D+7z+Y9RIJ+czhN3/un4xihXLT78PAUPvn+5OT0cwxSzo4+zGS4urs/y8artIK8vjnDB1BrsBZaqMr190w2mC+FB0a5mIgXLswf2eg3mRZBJKJpHhgkz49fzy/uPom7nkfockkASB+V7e/g4epyLqLukaaSKy1dfb9+xl2k6RCZV7X+gBrP8lr97dna3DVSSB3SmmExgkT+1KIsuEDh93eQtQHbYBQJcRPQI9d4WXX6uTnftX+OPOl3hou7nN/hqA7XwimWxsfkYgH6n8bIanGe1NZhpDW87z4YhawgbCgw4WapUqZCOG/aREia03pzUbxoKN3qG0ZeWtval7diXsg2jtnK2aaiD21++oJRnG3BwcbWVuTfWmxORwbV/XUUxh0yKk20F9pI9CcnFajL5thy/X4pjLcCBRTG/Mi66Wqxa/8pyb/fkvu/TP0a/9eMEsgteAAAAAElFTkSuQmCC'
  this.Ni =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGggfGb7uw0kAAAGtSURBVDjLrZS/bhNBEIe/Wc/5DksRKA0NSASFBvEQvAM0IJ4gFfRUtJSJ0tHyEFQU1DQ0bpKCBgkEFBEny2fvj+LW98f2gSN5pdPt7nya2flpZuwlO62wG4bHPfvTNbgfn8vhgOMHx4n7euG3B7nlfKpj8Mivi3ycDXKxKC5vHRKkL1nhGlzmxWQquVBudTKfSBsFvT8nJMksvxIeGSUrpvrDZtPndrZswFEkSBDrJcOEmXH15tuzk7hI9yAFidVTkASSyOcf7cUrdQwu1Ept1Pv8++nPx0/C23QtEaQYO/5r3B+NP7yePm0skkfo+JMJLI7eWZyNW0PEQeslI4AwIcb2wkVUh1Dnv9KLKFxt3FY/TJjauGItX/V2avP1BdWIjQcagKp0rha9em5cmKmBt9WzYchqwvoBepwsZaqUSMv1+0gJE6KbH3W9dALX8QyjG1ra2pe2Y1/KNoTaytmmoN4dCUkXtKZLABc3lun4cKg3CxHg/v9Gh44gSMVRsH9Qxp2J5KI6PLj8Mzxf/O7NEhwos3sHTYxFJQieAWQG5czKlX5zfu9rTu57nv4FFIsPySkiwzoAAAAASUVORK5CYII%3D'
  this.Ch =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGgcoGry8dfoAAAFASURBVDjLrZRNSgNBEEZfJzUqCZkERhdCCB7GC+jCrXgDb+QRvIBnEQkuxKAQI2NIeqpcTCI9Mp3JQHrzaPj6q5/uLnfPXquznwzRA/tZC93HdBEVdHuTbKObvg/PozqfP39PQJSvz3H/JCYzTQdvaYoYs7O0G6/aHXWL2QAx6LudzXH93BAlKd0eALiroiwlUcTAAjutgWGlbtNDj6D/sVGKoUWQTFEHNcTw21NSRqoCwBuif7tofqC4W16HTZc7HyOGlqceAbiqIsxvj7iGGMV2F+1LYYhnmQR+P3VYeiR8i3Vo9Z4Nd8PLoEm2uAjcnwC4rKJ13PBfel+Dln6hLt4XQ0Bc+BnqIOCumeMaorqUDpw2jSLNoGOmo52GjpGaibHu9ebL+HxJhpaXVeVJdhwPus7X2/6tVgebk4eep79dEZnAuEZ32QAAAABJRU5ErkJggg%3D%3D'
  this.Oi =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGgggAxtSEA8AAAE0SURBVDjLrZQxT8MwEIW/uJc2VKpAXVhAoqgMbLDyq/iVjAiJgS7twIoEAyJCTerHYNokyGlTVC+fJT/fuzvZl9zTabluMswfOJ720L095u2G/avpr+51bqetutVypimY530+6KetOp9li5MxTnpOM1PrSiwbziQTGiRbi0kGn8I8vSB7AOCuiSDs+VBvrdc+BoQJ1q4lhv6i0qmenaIQJvw6ugWnJgC8MF/5tsbDY6Bw65YINnITPtx6AuCmicpXXXyb9bb2RcJKil4tXhFFidXfYgx7vWfVdNcxVLrN/iWcN7G3b/1flmUE/65jW1+E6zISHJg4Wu3qSyYcXO5KURNwUjZxybZvydlQMlGMR4uv9tzs/DgPVeXpxWjjURYCZylAmkD+neTr/i35ONScPPQ8/QFgdrQzzjNS3QAAAABJRU5ErkJggg%3D%3D'
  this.Dh =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAQAAAAmqpm+AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfdBRUTLyj0mgAyAAAC8ElEQVRIx83Wz2ucZRAH8M+72c2mu91NmibFSEgaGy1SrRdFFFIJ9uDBk6KCN6EHD0qLB8GDFwXrQUEK7UnQP0DwUD23RVS8WG2EKrShDSpNYhLaNJtNNvs+HnbzY7fvLmmo2BneyzPzft+Z9zvPzEQngnsoKfdU0rH7Obrw38DNmbK4A4AOOUP2NsJNmdFtYAdwa0om3Ta0ScUt8wbldd01WBArKrihqLge3ax+RR12wnKkU4eqWYXNZPMiOy+ZSF5JWE82kxhZSqfH7Ddg0YwJ01bbEJIRb0YX7oDLOuo5nZg34HFHXXHeby3/Ye3ZgAtNX3vTiAVfm1SWlnPEU4ad800bWupwsWqT6W0j/vC52KCqorIv/eC4cVdbRBgLSAXBmrhBn/GwaaeMeNaoT72oYtjvPpPxsnSTd03XBEEqFtNgyHgSpzyCX2TRbcpVscvO2ufRRLgaRko92U1NO+hn01ZVZC3h9obtopKxBu91jTcvWdzAa0HkV3s8pMuKI9jtBbuUfWvOPw4lVmi8ldmtDg/gusixDcZGjYKzyspN3gnMVhscFgT9/vajPUqWjPlOTt6CuN4gk+CqNbg1lGW2GK6JjDrvKxNirxtTdFwa9Or1p+UEuLK15G5cNul5ObFRrCCug3FYr3PtmnvzfWDZBWlvmbRbpIeN5ljwGr5veSuC6NXANYUGQ94HBl1wpuG0x0f6RGa9o3wH2KL9rUbPktNWjHvfkF2ysorGndGPoM/Hulu1qlcC15uigwe94QmRvyzggC6RgEgQuewTt5qiG24HR9ZBTzskI+WGn8x5F0GEYMKHCXBtBuOKSy41nLznpKjefw8nlnECs63lipOW6y+uJDKbgrRom3rRaRWR4IsmS60yo5cCN6knsR0pKCqbb8gqiGqDEfrM6Ng23GLCthDbp7L+72I9dxVf81ikRywINWYrcnJuJtT6dnaUjG5BqdY+a4clGXtldwAXqyipNG9Qq22G8v+2Lt7f2+e/O1kvzGyGcjEAAAAASUVORK5CYII%3D'
  this.Pi =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAQAAAAmqpm+AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfdBRUTOjTXLrppAAAC50lEQVRIx83WT2hcVRTH8c+bvMnMxMSkKU2Fqv1DhQ7aItJWRZEgiAUrKqJuXAZRN2ahRRfd+A+6EtFFF4roTrC4K0pBFDQRIsVakSht1FoUUtoG2oyTTPKui3kmmcmbIQ4Vcu/unvu+75z7O/fcE40G13DkXNMRJ9azd+H/wV1wUqWj8LrdYmcj7pyzYps7wC2aNymkwDjBJWcVdMt3gEsUFU0ZMIhcEJyWVxQLHcxIrKjHpCDUgw0KIp2LEim4IvwbbFcmLKfoLmXbzPjDuHPm2gC7JCuVbU7nkic9poBpW93tKT/41LdtfAzLuGbfYm8om/axH1Xk9XnE/XY55sO2uFz2Ab+p7HvP+UKvoiGJIw7p9rh9bYXJBUHSNA/Y47zD9jhg2CeeUXOb0w7p9qz8qv31GQS5RELDHwqG8bJbLRpTQL8zTqk56SNb7M30i0RSLwGN/hXc7mt/mjOvxyyuLtm+cdXBFr4tXbKkQYoBkTGb3Ktozn3o9bySqndN+8vezAxNWim7FWd0GVlSbGd6I9/xt2pGHjQlSmjYcFGwxe/GbVBx0QNOGHSdy4KcXAtcnREvoKZrhWFKZLfPHfWdxEsY8rQF0G/Ir2oZuJqF7Gpc9bOH9UqUMYckhbHfJsfbVb+wyvVZx+UdNul6kQFsTC39RnCi5a0IWTg+M+UeLxgXvKrsQbDRB3pxVKk1LstwxeuqHvK2HXqUlAw46JgbEGz2vg2tKssTgQnFVYabjbpT5DeXsEspLWKRIHLKK2aaTnxfOxxFuw27Q7ec87407QiCCMGE0Qxcm4exasJEw8qI90RpudzfukCtdfzkRZX0w2prKdbeCox5zbxI8FZmOxEHlCyuGfiVRw2ouLDqpANi2OGX9EzWMmaaNK0Hun35VhRtl/sPwOZXjBv1LL+zNYP6TJntqEeJ3aQ/7W/i+mJF3jZ9GUEsqKXa58Qr2o58Gk1FVbTULC3l3Twur7d2cX13n/8ANgFb4QoS+/QAAAAASUVORK5CYII%3D'
  this.Eh =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAQAAAAmqpm+AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfdBRUTMCbeeCOrAAAC4ElEQVRIx83Wz2tcVRQH8M+bzGTixJmkaSNGSmpqtUi1LlREQSXYrRtFXIrgogtFV4ILV11UwYUU6krQP0BwUV23Xai4abQRqlCDDVqa1CS00cmbzMy7LuZHZqZvxnao2Ht4MLxz5vu+937PPedE7wS3cWXc1pVN3Mnswn8Dt2bZ5hAAIwpm7e6GW7ZqwswQcDVlS/4yuyPFdev2Gjd2y2BBoqToipJSi91V00pGDKNyZNSIuquKO5sdFxk+ZSLjykJrs7lUZhmjHnG/GZtWLVqxPUCQnGSHXbgBLu+I541i3YxHHXHRGT/1PcPG04YLPV87as6GLy2JZRU850n7nPbVAFmacIl6j+stc37xqcRedSWxz33rbfN+7cMwEZAJgpqky572oBUnzHlG1oQpVfv97GM5L8v2RDesJgitEpB0ndoTOOEh/KCo4rJ1cMEpL3rYQh9+zRKQqHdY1kHnrNhWlbeprNr2LSh7tiu6ZcnOJUu62BVFfrTLfmMqHZxjX1vzp0OpGZp0KtsZcC8uibzRVixq/jolFvdEpyhb7wrYEEy77Du7mrlOomijfTppcPUGXA2xXIfjN5EDzvjCokRO1ai4WWenTPndVgpcrJZejWNLXlCQONBkst0OO2zK6UHFvfc+sOWsrDctuVskkmmfXdGr+KbvrQhpcJy17HGvOddM8UbEpA8VcKxPXQxCeuv520kV89436y55eSXzPjGNYI8PTPQrVa8ELine4LjP6x4T+cMGHjAmEhAJIhd85HpX/KZ9g+DIO+gph+RkXPG9Ne+2szBYdCwFbkBjrDjvfNeb9xxvyhI5nJrGqVL0Wxcdt9X8Y6W/FFnRTdqCk6oiwWc9nmyD9UuBa7Rz699XUUlsvWtXQdRojLDHqpGbhttMmRYS96i2zi4xeUv8etsik5JGNQ6oKii4Jh5qRsmZEJQb5bPxsixnt/wQcImqsmrvBLU9oCn/b+PinT19/gPF4yPjYMxK2QAAAABJRU5ErkJggg%3D%3D'
  this.Qi =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAQAAAAmqpm+AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfdBRUUAAI4cucMAAAC30lEQVRIx83WT2hcVRTH8c97eTN5E5M2TWkq+Kd/UGjQFpG2KroorgpWVETducpCV2YhRRdd+Qe6EtFFF4rozkVxVxRBFGoiRIpakfinUWtRSGkbrB2nM5l3XeR1kkzejHGokHM3j3fe+3LOPb977okmgutosetqSWY9Rxf+H9x5p1R7Sq/sdretxJ11RmJrD7imuhkhByYZLjqjX1mpB1wmlZo1bARxEJxWkkqEHlYkkRowIwiLyQb9Ir0XJdLvsnAt2b5CWCx1rzHbzfvNlLOudgH2yZZXtl3OFU96TD/mbHOfp3zjA190iTEs4dpjS7xizJz3fauqZMgjHrTLce92xcXFG/yqMV951icGpUZljjqs7HH7uhYmDoKsbR20xzlH7HEQIwY03Om0w8qeUVr1/eIKwrUWsDzZ1AG84A5NkzJ/qmmCU97ztL1OdlBg3gJWxtfvLif97qq6AU1NCy3f5/5yqENsrUOWrYhuWGTSFg9IW9L40Qaj3jTnD3sLFZp1quw2/KTPeKtiUf70hr/VCnTQJpSw4oMLgpv8asomVRdsRnCDS4JY3AG3yEgW0NC3zDErsttHjvlSJlUXW8h9G436WaMA17BQ3I1rvvewQZkx1GQtGPttcaJb9wurQr/ihJIjZmwQicXKrdjG8XHHUxGKcHxo1v2eM5VLqA42e8cgjql0xhU5LntZzUNet9OAiophhxx3I4Kt3rapU2d5IjAtXeW41YR7RH5xEbtU8iYWCSJfe9F8247v64YjtdsBdyuLnfOpOUdbKgymTRTgulyMNdOmV7wZ91Yu6cj+zg1qrfad51XzH2udS7H2UWDSS+oiwWuF40QSUMkb0FrsM48aVnV+1U4HJLDTD61j/u8231bTxUR3LJ2K1A7xfwC232LcbGDpnm0YMWTWlZ5mlMQtNubzTbL4sqpku6GCJBY08trHkmVjRynPpqomag1LLd3VcWm9jYvre/r8BzXJTgadvkYEAAAAAElFTkSuQmCC'
  this.yh =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGgcqC+Q6N4oAAAF8SURBVDjLrZRBThRREIa/mq5WmJGBZJgFRjFx4cJ4AY/hhgvIAUyUW8DGtV6AAxjvoSsXJqILI2qiSDOZ6a7fxYOB0N1Om8zbvaov/19VqZQ9o9PrdcPwWLKe/oP7cXTSCmT97dE5d/RtfauVK4uPf7bBg98/7wxW2jDFcO3rcIiL4/Ewa+/abmTV8RouGFjAg6ebdej76w9gg0J4kGcB7K6807Uhhd3ffQFkeeACBTB6v1/X23sUgFDi0gwba0xB4SKqFKqauAoghIsyWKBXCo+5dgOn81zgdPEFF7FQL9XXwVe4qBb2UQkvmeQpctZEnQFMyiXvs65w04b89JKbx8YPM7+2ytW47nu487JB8LCm9+rL3VJQygBkDuaf39b04k3HPswg/Pm9U4DBp4OyN9/M5Ot28cHs8a30uW0mIKUcXKzKLlt80uTaFz3YXHSKYgQ9KTawf1DGRkguZv3+r0n7fcnXVYADRT662W46K2YX85tOl3Ynl31P/wJHQa4shXXBLAAAAABJRU5ErkJggg%3D%3D'
  this.Gi =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGgghCwySqXwAAAGGSURBVDjLrZS/ThRRFMZ/d+YMO26yamgWEzdxFRsbqaTlGXgEnoAHwG20puABaC1MfA5jYWJsaBaNjQUJFIQJ2TtzP4sZdgh7B5dkb3XvmV++b86fHLfPUidZDsPCivX0AO7se9FtuPZ6s+H+TG3YyVWzE22CBc6nvbWskwt5fvp0nUT6meWmzuMs759IJtRzgrfvny2K/f3wA1zvUlggdQIm/a+6U6Tg3kx2AZeGOt8AbHyLdPDoXd0GYYKmhNFKquVU312EczUnYSI02iGmFgCCsLCMb8BaoejkhAY2EZp/VUxNN74PzvceTsJKfFpHfIzyAL5c8TzrFjeLfJ+13Dw23ErvTKuvhou+x3ufIoLHC3qHv8deUAYHoMTAZb++LOhVn5fMI3FQZR9fXQIMpgc+bVsvbL4S6o7vPK5fI1HdXhomHrUByu2YbS4SePm/UmsMiZSPE3cP5Xjel0z49cHpVfd+sdGTAgwosheDuUfpBYllAJmD4toVN/WbcbGqPbnqffoPyHTE/GI3wZEAAAAASUVORK5CYII%3D'
  this.Ah =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGgcqK99UF0IAAAGmSURBVDjLrZTNahRREIW/un3bnx4zCYwuBAk+hb2ZbV7BB3AhZlAQRN9EEBGXQQJBfArXvoCLWYnBgEbGIdNdx0WmTd/uGY0wtbunT9epOrfq2lMuFeFyNKJvOJ/+g/dterqWkBW7oyVv+nX79lpeNfv8cxei8+PkzuBa8s0uipEPt74Mh0RxfGuYdbu+O20Qu5LVx1sEiYF5J/b2WwcbIEUn72Ur759U7VZyJwrkaW3lI07bkNA5r+WhOeUEQiohovA6yTae4KGNgYsoquTf8QQFSLBKRE+x8jFClvJwIolu+QxhoFQXovA/lureCzz0853X12BZPX5OnS2vq99vvcSC3wCTNVIXUYtYMc8b3aPqSXAD8F9t3rzqzPOHl4Rlwr/Ms+B92LcVEy5C+9Iwjt5g9DJKqa6Md28x/+ceyXTAg7BCt4sYB687tqzcS5kOeVjQ97mnweFoL+1aRIjd9kyvPsX24EeI4nrXWZk+JudCBLjpfeksGZcRBMl3+sa2V4Edl6JYFMX3+fr3Jd/WDCIwy0dX1/J8MVs0/p2dbeyd3PR7+hsfn9edOMpPUgAAAABJRU5ErkJggg%3D%3D'
  this.Ii =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGgghLkeWfTsAAAGuSURBVDjLrZQ/axRRFMV/983b7BiMSgptFIxE8GOILkgaaz+Eha2FRfwL8Q9pg2ih6Mewt7FJkyYp7EQwpHCQnZl7LOIu897Okgj7qnl3zpxzz713rj3gVCecDkb0BfPpP3A/v1XzBZeur//Dfd+Pl+bi2vGe1iE6v/aHS4PknXWS8bI8uLBKkHYHZVRyXDfC5NliubwnBUlDU3buPetcbDiWolNY7nl0/0fTTaPwY7+e5jZ6zFFafhEFXbrgjJ5C0CxOnZi1bGziQQlOIgpPNDY28YCSmIvoqe7tJ7jJSHWdSPLtrS3cLLOGIArX1MPN13gQOZ8nfov2zhZNnGQ+36/OQZBNpFK/DXVxfKvtkx6FtgBQ3cXVTTbPn59TuJ00z4KP9jD0AEVaeePDm2mKSYKproy324S2Z/yzTgZ2tilO4gMP7LzM2tHDB268f8XZnG/2/xW8u3g3ZA2OPSvB9OJr4enSiOJMbk+mL0mgFAGu9UgnjrUGQSrXwkxh227tLy9LUdSrKwe/5++XeOV8BRGoBldXphpNLQhxADAwqP5YNZmDMYeL2pOL3qd/AZpy8NOvjvTnAAAAAElFTkSuQmCC'
  this.zh =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGgcrBRqZK8wAAAE8SURBVDjLrZTNSsRAEIRrfuJPwmYXogdB9mmy7+P7iIgIIoKIL+RhT+Ki4A8hbJIuD+qaSWbWCKnTUPmopjM9rU4wSHoYBisj5/Ef3PPyPQiYeJ59c8un6VGQq4uHjzlgBW8vx8leCKOkk8c0hSVWh6kJd612TLOaQJNIlPzqVLpSCUgtEpm2i7MeaCIRTYIOh/MuR5AeDhd+Tpq2AOCycSWkJmvp5AFXbmBNahH0OVy7nogG+nUB3Dh1AU2KJw+4dTqhJuHlcNfySE02fg73G68hbY0y8t9svjmV9ZZ5zofNs4MxyLlpDNXNh72jLhbIy4e9yz7m7cOTRljAKsdbqH5RwBL7bH9ZeNJiQgMHf60iyb7maga1hVKYCWmJKo5fy/B+iaYsAAugiLLdcNGqqH7+33o92p4ce59+Av+enpsD10kAAAAAAElFTkSuQmCC'
  this.Hi =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGggiBLcA5y4AAAE5SURBVDjLrZS7TsNAEEWPN+vERIpAaWhAIigU7vkwPhIQRDxFkyYpaJGgwkJxmEsRiPzaxEi5lTU6vuNZz97oglZy7TC87dhP/+DeHrJww+7Z+Jd7nfnDIPe9mGoM3nif9bpxkLMkmR8McdJLnHgFFfmkP5WcpF5UqF/Wyd5CcmadIiau6mDHzElgBcG1VQSSkyi9DNxUDVecqhy39XG8sPovnpyXz0Y4s1pf4K5cM3OgykcDcF+sCZxkDX7wWKhZ87wrPW2fd6Xn0rxL8k7zBqTrp3y5YZ/TdvtcwhTkym4K9U3b3aMqFvBL293LOtY4R4ObcLVISBtDw0l72zASycHptujQCJyUjFy0gYo46kte5MPB/DOcL/54PwMPZPHJYN1jmQucjwHiCLKvKPs7vwUfu8rJXefpD93iniqiS4VUAAAAAElFTkSuQmCC'
  this.xh =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAAAAACpyA7pAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGgcrJ8/5aigAAAJ5SURBVDjLrZTfSxRRFMe/d+aOq2v7I9fV/JEEYWVaGZrgQ2DYQ0HQW73ZSw+BPgRBUA9FPvUiRC+Bf0AQRBGR1ENEoWgERmhgij/a1owkdXSb3WZnzulhZnZHc8vA83bnfO73fO+dc4+4jC2FsjUMkrZZj/+D+5FYKwiowbqYyyW+R6oKcpYxk6oDJGF1qba0uBDGFA59C4chGYvxsFr41KJItRdDkAyUCgcTjHjTgZpUYvzTLz9ZajAkQcupBc6eBi9V13d+fjjuP4pGkAwwOWqip0l/MqWrFR3tV+6/8HkEQz2KVDE70dM8evvr3ob65YHJ9iOJefYCmR2QDLKdbZ1tk30nLmhiNpr60He1a0LPCRJDMizHXuA47rZdxNSDjwBGn5459CZ/hwyFCERERPH64XQXZm6NkWCiYdFOuQCRhFe3TLyL76Q7GcAGkEg02/m6gGSQU7cCC5oYTLopw2Da4A/OhxVEl3nMS6pSIf/NKMy2Y2Kem5LC8ixV1c7m/dnM0kJGAwDMfTnV/2hX2lVoKX6ezsllLF8/rw2o3ffeB5xF9XkeXd+GjVhxc3Otx4qeOYeM91aKfa+zwoXMqI8T2bGO1sbln4pWefJ6FYvylsFMnhPnMBfyxHd3t4iFJWW/wmABTF1zf93aHqgHoQc8bvXltFldFpp+/KpNQlC8wW0aMwK5vsuHhkoETAt6r2JJPux7v7zhYaYNwwJGbtiqLfL7+Q/OjZGbpsL9eU4CUmwGvr1Uo0+4GQlIRglvCiaTObUgQwHK/zWKKAYozBSF+AslECVmycgGg3qm8HzRImwAEoChxQKFi2aNrDevTHPb5uR2z9PfLQs68f4FXIYAAAAASUVORK5CYII%3D'
  this.Fi =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAQAAAAmqpm+AAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGggiGzoI6tsAAALsSURBVEjHzdZNaBxlGAfw3+xOspvFYK2WSlvTpih40IJgP9RDIQcFEQLB6kFykUIvUj9zCR4KiiCItCB6UqEXDyqePAgpRhCtaSmYYonFJsGepHXrRzfE7mZeDztJZzezoV0r5HlPM++8//n/n6/3iV4KbqEV3FKLE+uZXfh/4C45Y6Ereb3uc28r3K8uiG3uAm7JNTNCChgnqLqgpFdPF3CJsrJZG2xEIQjO6lEWC12sSKysYkYQmmKDkkg2KM2nLfZ5yE5/Oe8HZyx2YBgp+VtYFltsAyPo87znEPzmTrs87bz3TXUELEqykU1amBW8Za/ffWRaVWyrYU846phPOnoxLPtOizcSwZv2+MazTtjhKSNKjjhsyYv2d/ChrO9apY4YMm3MsNf0iszY5KqTXnXUmB9Vc7mFZbGJbOX2eRLjhozjrA+cSne+ddyovb7MTZiAQhMqS3uLB01Y8ArOOWRKUEi/mRB5vIPYRCJuEs2y2ywyaZtNlryeJsfy/qxfPCLpEIgVsVnfbcVFJZGvzLUdqqmtHM0TmyZK9oMruMtlwelVB4tiBWHtRGld84Ld5kUaq/YGDPp5jZKLG6grZv4yb9YB7zpuQL2NwX4VX6x6C3WN/G78p88UjXvbSeWWnQEHBd+v1f1Cjic+dc6wl33XUvR3O+Y2kTf0I8pN5By4gpoxVQd96FEbVFRsN+pz9wvY5WN35JAIguiZwFSbKBg07jGRiy4reiCNZ0hZ/eRQW6kt2oPoQOBUDhwFQ4bsU8KcE/5wRK8g0hA7bbQNbjfNqujUtidMqIhEFjVwxXuKGmKJh288FFlbUHNVA0x6QUNRI/d67hCKtWzSYf8oCt7JhYtvdhT42ojtqqZzx4k4oM/STQDOrWoMUG7WLOz0X0eLYPB6KMoGFXLy/MYswjaV63dF3Ub9ZtW6mlFi97g9nW/i5XTosUN/joiGeuqKgjgzdvSkahYsilaGpZV79lraONfVuLi+p89/AdAUWQEn4HTQAAAAAElFTkSuQmCC'
  this.Eo =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAXlJREFUeNrsmT1Ow0AYRG1ER8glkCioyQk4ARIF9OEA3IeeBnEDJH4qkh4JRXAB6AgtZgxLg2SPKSx7d9+TRoqcr7BeNt7spKyqqoBmNlCAIAQhCEEIQhCCEAQIQlCagibKmXKvvCmvyl24tjX0zZUDH1Z3lAtl1vD+QjlRXnIUNFWulX0zt1QOlPfcvmLzDnKKsLrmOT6DjnqaTUbQbk+zyQiKosocUtDqH7NPOQq67Gk2mW1+O2zzMzO3CNv8OrcVVP+uOQ4CmngIM+scV9Av9XHiVDlU9sK1R+VKOVc+cj5q/F3Nk/C6XjGfY7ipkj8Ox3+aRxCCEmZzZB/W6B7SY2oUb4ufYuxZuSloFL+hUWyBRtFAo2igUTTQKBpoFA00igYaRQONooFGsSM0ijEfVmkUIzjNIwhBCUOjGMEKolFsgUaxBRpFA42igUbRQKNooFE00CgaaBQNNIoGGsWO0CjGDHUHghCEIAQhCEEIQhAgCEE98CXAAHw9kRr/el3HAAAAAElFTkSuQmCC'
  this.Co =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAbtJREFUeNrs20tKxEAQgOFEZyu6EA/gEbyYex+kwMfei3kEDyAudB+J3Rg3wmBM18vxLyiyGSbVH10d0k36aZo6YnvsQQAQQAABBBBAAP3T2Dje66jk43xtideSZ/N1p4D6ksclDxRq7ne1xcYk/8EaBBBAAAEEEEAEQAABBBBAAAHk/Rbu9kbfuh90Mhe75Hi2bpRp7ON87SttFv62/u559c0aj57PS96UfF+AVIs9VECq93lbeL/9ktclH6KAatyWvEy6hNyVvIpeg2oBkhBHWnE+52uZQUopU54QrXFpAmVBEs0xaQPVHAJxBu3xWABFzSSxGIsVkDeSWI3DEsir3QbLMVgDWc8ksa7fA8gKSTxq9wLSbrfBq25PIK2ZJJ41ewO1Iol3vRFAa9ttiKg1Cui3M0mi6owEWookkTVGA/3UbkN0fRmAts0kyVBbFqDvSJKlLo0tV824n68XWQrKBsTBIUAAAUQoHj1rHSdbRn0Krf6uo/Up9tS1f5xiHRXnNGoGaXyckrpLWtegscsfYyQQTzHjFk3fYq0DfPkDbdb0ZSLvYqxBAAEEEEAAAQQQARBAAPnHhwADADsGwOIWz5onAAAAAElFTkSuQmCC'
  this.Mg =
    'data:image/gif;base64,R0lGODlhAwAVAIABAJmZmf///yH5BAEKAAEALAAAAAADABUAAAINRBynaaje0pORrWnhKQA7'
  this.ir =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH3QkaAjcFsynwDgAAAMxJREFUKM+9kLEuRQEQRGeuV5FIJApBQZ5EReFP/IBCBIVvpFT4BR9AR+29cxTukyvRaEyzmd3Jzu4kI4Ad9d4JANVLdS1JhvwB/yBuu0jiL5pl22WSzNRBPVE3225MVW2TZA84bfsWYFDvgNX30zQY6wtwmCRRo96qy9V8Et2zevDjMKDqFfA+2fykzr9F6o16vnIALtRX4AE4GvtbwHVGq8epi3qm7k74HFjMRrINnLdd/6KS5FgdkpBkv206DkzykaSTbWkbdUyxs094zOEo59nhUAAAAABJRU5ErkJggg%3D%3D'
  this.nr =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAANCAYAAACZ3F9/AAAAAXNSR0IArs4c6QAAAAZiS0dEAFEAUQBRjSJ44QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wCCgAwB/13ZqAAAADXSURBVCjPhZIxTkMxEETf2F9I0EaCI9DRUZEL0XINbpMzQJ2eG1DQpvszNDbyN4kylde7O+PxLgxIckgS2+mw3ePDWFumxrPnc/GmURKXMOfKXDAzX8LcWEfmTtLu6li42O4SD8ARuAHW6RVV0tH2PfANsAyMT8A7cJo9JSHJHfAsiSSoKa6S6jWfjWxNUrtiAbKtUQaSLh+gSEppSf3/3I1qBmIl0ejxC3BnHz02X2lTeASgr5ft3bXZ2d71NVyA1yS3pZSfJB/AS5I/xWGWn5L2tt+A0y9ldpXCCID4IwAAAABJRU5ErkJggg%3D%3D'
  this.Vm =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gIDABU3A51oagAAAIpJREFUOMulk9ENgCAMRKkTOAqjMIKj6CSOghs4gm7gCM+fGgmCsXJJP0i4cj16zhkBjNwYreSeDJ1rhLVByM6TRf6gqgf3w7g6GTi0fGJUTHxaX19W8oVNK8f6RaYHZiqo8aTQqHhZROTrNy4VhcGybamJMRltBvpfGwcENXxryYJvzcLemp1HnE/SdAV9Q8z4YgAAAABJRU5ErkJggg%3D%3D'
  this.hr =
    'data:image/png;base64,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%3D%3D'
  this.xr =
    'data:image/png;base64,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%3D%3D'
  this.kr =
    'data:image/gif;base64,R0lGODlhEAAPAKECAGZmZv///1FRUVFRUSH5BAEKAAIALAAAAAAQAA8AAAIrlI+pB7DYQAjtSTplTbdjB2Wixk3myDTnCnqr2b4vKFxyBtnsouP8/AgaCgA7'
  this.mr =
    'data:image/gif;base64,R0lGODlhDQANAIABAP///1FRUSH5BAEHAAEALAAAAAANAA0AAAIXjG+Am8oH4mvyxWtvZdrl/U2QJ5Li+RQAOw%3D%3D'
  this.pr =
    'data:image/gif;base64,R0lGODlhDQANAIABAP///1FRUSH5BAEHAAEALAAAAAANAA0AAAIYjAOnC7ncnmpRIuoerpBabF2ZxH3hiSoFADs%3D'
  this.yr =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAAAXNSR0IArs4c6QAAAAZiS0dEAFEAUQBRjSJ44QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wCCgEMO6ApCe8AAAFISURBVCjPfZJBi49hFMV/521MUYxEsSGWDDWkFKbkA/gAajaytPIFLKx8BVkodjP5AINGU0xZKAslC3Ys2NjP+VnM++rfPzmb23065z6de27aDsMwVD0C3AfOAYeB38BP9fEwDO/aMgwDAAFQDwKbwC9gZxScUM8Al5M8SPJ0Eu5JYV0FeAZcBFaAxSSPkjwHnrQ9Pf1E22XVsX5s+1m9o54cB9J2q+361KM+VN+ot9uqrjIH9VJbpz7qOvAeuAIcSnJzThA1SXaTBGAAvgCrwEvg0yxRXUhikrOjZ1RQz7uHFfUu/4C60fb16G9hetxq+1a9Pkdears2Dt1Rj87mdAx4BfwAttWvSQ4AV9W1aYlJtoFbmQJTjwP3gAvAIlDgG7CsXvu7uWQzs+cxmj0F7Fd3k3wfuRvqDWAfM+HxP6hL6oe2tn3xB7408HFbpc41AAAAAElFTkSuQmCC'
  this.jr =
    'data:image/png;base64,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%3D%3D'
  this.wr =
    'data:image/gif;base64,R0lGODlhEAAPAIABAP///1FRUSH5BAEKAAEALAAAAAAQAA8AAAIkjI+pi+DhgJGMnrfsxEnDqHgRN3WjJp5Wel6mVzbsR8HMjScFADs%3D'
  this.O = f.O
  this.H.tb = -1
  this.Mf = !0
  this.vb = new Ma()
  this.Uc = new Na()
  this.Bp = new Oa()
  this.Go = new Pa()
  this.Dr = new Qa()
  this.Ho = function () {}
  this.Mo = function (c) {
    var d = this
    d.Ma = c
    d.O.nb = 'FlipView' == d.H.I
    if (!d.O.document.DisableOverflow) {
      d.Va = d.H.oc
        ? jQuery('#' + d.Ma)
            .wrap(
              "<div id='" +
                d.Ma +
                "_wrap' style='" +
                (d.O.nb ? 'position:absolute;z-index:50;' : '') +
                "opacity:0;text-align:center;width:100%;position:absolute;z-index:100;top:-70px'></div>"
            )
            .parent()
        : jQuery('#' + d.Ma)
            .wrap(
              "<div id='" +
                d.Ma +
                "_wrap' style='" +
                (d.O.nb ? 'position:absolute;z-index:50;' : '') +
                "opacity:0;text-align:center;width:100%;'></div>"
            )
            .parent()
      jQuery('#' + d.Ma).css('visibility', 'hidden')
      c = d.O
      var h
      if (!(h = d.O.config.document.PreviewMode)) {
        var f
        try {
          f = window.self !== window.top
        } catch (k) {
          f = !0
        }
        h =
          f &&
          d.O.$c() &&
          600 > d.O.$c() &&
          !d.O.Eb &&
          !FLOWPAPER.getLocationHashParameter('DisablePreview')
      }
      c.PreviewMode = h
      d.O.Fd = Number(FLOWPAPER.getLocationHashParameter('AutoNavigatePages'))
      d.O.fl = unescape(
        FLOWPAPER.getLocationHashParameter('AutoNavigatePageText')
      )
      d.O.PreviewMode = d.O.Fd ? 'Miniature' : d.O.PreviewMode
      d.H.document.StartAtPage != d.H.document.DefaultStartAtPage &&
        (d.O.PreviewMode = !1)
      d.O.config.document.URLAlias &&
        null != d.O.config.document.UIConfig &&
        (d.O.config.document.UIConfig =
          d.O.config.document.URLAlias + d.O.config.document.UIConfig)
      null != d.O.config.document.UIConfig
        ? d.im(
            null != d.O.config.document.UIConfig
              ? d.O.config.document.UIConfig
              : 'UI_Zine.xml',
            function () {
              d.uh = !0
              d.H.Hh && d.H.Hh()
            }
          )
        : d.Rk()
      d.O.PreviewMode && (d.Vl(), d.Th())
      eb.platform.touchonlydevice &&
        d.Va.append(
          String.format(
            '<div class="flowpaper_toolbarios toolbarMore" style="visibility:hidden;z-index: 200;overflow: hidden;padding-top: 4px;padding-bottom: 3px;height: 38px;margin-right: 100px;display: block;margin-top: -6px;background-color: rgb(85, 85, 85);"></div>'
          )
        )
    }
  }
  this.im = function (c, d) {
    var h = this
    jQuery.ajax({
      type: 'GET',
      url: h.O.document.FilesBlobURI ? h.O.document.FilesBlobURI(c) : c,
      dataType: 'xml',
      error: function () {
        h.Rk()
      },
      success: function (c) {
        h.nc = c
        c = eb.platform.touchonlydevice ? 'mobile' : 'desktop'
        var e = FLOWPAPER.getHostName ? FLOWPAPER.getHostName() : ''
        !eb.platform.Fb &&
          eb.platform.touchonlydevice &&
          0 < jQuery(h.nc).find('tablet').length &&
          (c = 'tablet')
        toolbar_el = jQuery(h.nc).find(c).find('toolbar')
        var f = jQuery(h.nc).find(c).find('general')
        h.readOnly = 'true' == jQuery(f).attr('ReadOnly')
        h.backgroundColor = jQuery(f).attr('backgroundColor')
        h.linkColor =
          null != jQuery(f).attr('linkColor')
            ? jQuery(f).attr('linkColor')
            : '#72e6ff'
        h.O.linkColor = h.linkColor
        h.dd =
          null != jQuery(f).attr('linkAlpha')
            ? jQuery(f).attr('linkAlpha')
            : 0.4
        h.O.dd = h.dd
        h.eg =
          null != jQuery(f).attr('arrowSize')
            ? parseFloat(jQuery(f).attr('arrowSize'))
            : 22
        h.O.eg = h.eg
        h.backgroundImage = jQuery(f).attr('backgroundImage')
        h.sk =
          null == jQuery(f).attr('stretchBackgroundImage') ||
          (null != jQuery(f).attr('stretchBackgroundImage') &&
            'true' == jQuery(f).attr('stretchBackgroundImage'))
        h.H.vd =
          null == jQuery(f).attr('enablePageShadows') ||
          (null != jQuery(f).attr('enablePageShadows') &&
            'true' == jQuery(f).attr('enablePageShadows'))
        h.H.Pf =
          null != jQuery(f).attr('shadowAlpha')
            ? parseFloat(jQuery(f).attr('shadowAlpha'))
            : 0.3
        h.fa =
          'true' == jQuery(f).attr('forceSinglePage') ||
          ((eb.platform.Fb || eb.platform.ios || eb.platform.android) &&
            eb.browser.Zl) ||
          h.H.xf ||
          h.$r
        h.rb = jQuery(f).attr('panelColor')
        h.Cb =
          null != jQuery(f).attr('arrowColor')
            ? jQuery(f).attr('arrowColor')
            : '#AAAAAA'
        h.jf = jQuery(f).attr('backgroundAlpha')
        h.Lf = jQuery(f).attr('navPanelBackgroundAlpha')
        h.Bj =
          -1 < e.indexOf('.flowpaper.') &&
          16 < e.length &&
          !h.O.document.FilesBlobURI
            ? 'https://cdn-online.flowpaper.com' + jQuery(f).attr('imageAssets')
            : jQuery(f).attr('imageAssets')
        h.qb =
          !eb.platform.touchonlydevice &&
          (null == jQuery(f).attr('enableFisheyeThumbnails') ||
            (jQuery(f).attr('enableFisheyeThumbnails') &&
              'false' != jQuery(f).attr('enableFisheyeThumbnails'))) &&
          (!h.fa || h.H.xf) &&
          !h.H.config.document.RTLMode
        h.Mf = 'false' != jQuery(f).attr('navPanelsVisible')
        h.Tg = 'false' != jQuery(f).attr('firstLastButtonsVisible')
        h.gr =
          null != jQuery(f).attr('startWithTOCOpen') &&
          'false' != jQuery(f).attr('startWithTOCOpen')
        h.Yf =
          null != jQuery(f).attr('zoomDragMode') &&
          'false' != jQuery(f).attr('zoomDragMode')
        h.et =
          null != jQuery(f).attr('hideNavPanels') &&
          'false' != jQuery(f).attr('hideNavPanels')
        h.Po =
          null != jQuery(f).attr('disableMouseWheel') &&
          'false' != jQuery(f).attr('disableMouseWheel')
        h.tf =
          null != jQuery(f).attr('disableZoom') &&
          'false' != jQuery(f).attr('disableZoom')
        h.yl =
          null != jQuery(f).attr('disableSharingURL') &&
          'false' != jQuery(f).attr('disableSharingURL')
        h.ve =
          null != jQuery(f).attr('flipAnimation')
            ? jQuery(f).attr('flipAnimation')
            : '3D, Soft'
        h.qd =
          null != jQuery(f).attr('flipSpeed')
            ? jQuery(f).attr('flipSpeed').toLowerCase()
            : 'medium'
        h.Bo =
          null != jQuery(f).attr('bindBindNavigationKeys') &&
          'false' != jQuery(f).attr('bindBindNavigationKeys')
        h.mj =
          null != jQuery(f).attr('flipSound')
            ? jQuery(f).attr('flipSound')
            : null
        h.Ao =
          null != jQuery(f).attr('bindBrowserNavKeys') &&
          'false' != jQuery(f).attr('bindBrowserNavKeys')
        h.enableWebGL && h.fa && (h.H.vd = !1)
        h.O.config.document.URLAlias &&
          h.backgroundImage &&
          h.backgroundImage.length &&
          (h.backgroundImage = h.O.config.document.URLAlias + h.backgroundImage)
        jQuery(h.toolbar.M).css('visibility', 'hidden')
        if (h.backgroundImage) {
          h.H.document.FilesBlobURI &&
            (h.backgroundImage = h.H.document.FilesBlobURI(h.backgroundImage)),
            FLOWPAPER.authenticated &&
              (h.backgroundImage = FLOWPAPER.appendUrlParameter(
                h.backgroundImage,
                FLOWPAPER.authenticated.getParams()
              )),
            h.sk
              ? (jQuery(h.O.N).css('background-color', ''),
                jQuery(h.O.N).css('background', ''),
                jQuery(h.O.T).css({
                  background: "url('" + h.backgroundImage + "')",
                  'background-size': 'cover',
                }),
                jQuery(h.O.N).css('background-size', 'cover'))
              : (jQuery(h.O.N).css('background', ''),
                jQuery(h.O.T).css({
                  background: "url('" + h.backgroundImage + "')",
                  'background-color': h.backgroundColor,
                }),
                jQuery(h.O.N).css('background-size', ''),
                jQuery(h.O.N).css('background-position', 'center'),
                jQuery(h.O.T).css('background-position', 'center'),
                jQuery(h.O.N).css('background-repeat', 'no-repeat'),
                jQuery(h.O.T).css('background-repeat', 'no-repeat'))
        } else {
          if (h.backgroundColor && -1 == h.backgroundColor.indexOf('[')) {
            ;(e = R(h.backgroundColor)),
              (e =
                'rgba(' +
                e.r +
                ',' +
                e.g +
                ',' +
                e.b +
                ',' +
                (null != h.jf ? parseFloat(h.jf) : 1) +
                ')'),
              jQuery(h.O.N).css('background', e),
              jQuery(h.O.T).css('background', e),
              h.O.nb || jQuery(h.Va).css('background', e)
          } else {
            if (h.backgroundColor && 0 <= h.backgroundColor.indexOf('[')) {
              var p = h.backgroundColor.split(',')
              p[0] = p[0].toString().replace('[', '')
              p[0] = p[0].toString().replace(']', '')
              p[0] = p[0].toString().replace(' ', '')
              p[1] = p[1].toString().replace('[', '')
              p[1] = p[1].toString().replace(']', '')
              p[1] = p[1].toString().replace(' ', '')
              e = p[0].toString().substring(0, p[0].toString().length)
              p = p[1].toString().substring(0, p[1].toString().length)
              jQuery(h.O.N).css('background', '')
              jQuery(h.O.T).css({
                background: 'linear-gradient(' + e + ', ' + p + ')',
              })
              jQuery(h.O.T).css({
                background: '-webkit-linear-gradient(' + e + ', ' + p + ')',
              })
              eb.browser.msie &&
                10 > eb.browser.version &&
                (jQuery(h.O.N).css(
                  'filter',
                  "progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorStr='" +
                    e +
                    "', endColorStr='" +
                    p +
                    "');"
                ),
                jQuery(h.O.T).css(
                  'filter',
                  "progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorStr='" +
                    e +
                    "', endColorStr='" +
                    p +
                    "');"
                ))
            } else {
              jQuery(h.O.T).css('background-color', '#222222')
            }
          }
        }
        h.Uk()
        jQuery(h.toolbar.M).children().css('display', 'none')
        h.Ki = h.oa
        h.Li = h.oa
        h.Ei = h.oa
        h.wh = h.oa
        h.Bh = h.oa
        h.Ni = h.oa
        h.Ch = h.oa
        h.Oi = h.oa
        h.Dh = h.oa
        h.Pi = h.oa
        h.Eh = h.oa
        h.Qi = h.oa
        h.yh = h.oa
        h.Gi = h.oa
        h.Ah = h.oa
        h.Ii = h.oa
        h.zh = h.oa
        h.Hi = h.oa
        h.xh = h.oa
        h.Fi = h.oa
        var n = '',
          t = null,
          e = 0
        jQuery(toolbar_el).attr('visible') &&
        'false' == jQuery(toolbar_el).attr('visible')
          ? (h.Wf = !1)
          : (h.Wf = !0)
        !jQuery(toolbar_el).attr('width') ||
        (null != jQuery(toolbar_el).attr('width') &&
          0 <= jQuery(toolbar_el).attr('width').indexOf('%'))
          ? jQuery(h.toolbar.M).css('width', null)
          : jQuery(toolbar_el).attr('width') &&
            jQuery(h.toolbar.M).css(
              'width',
              parseInt(jQuery(toolbar_el).attr('width')) + 60 + 'px'
            )
        jQuery(toolbar_el).attr('backgroundColor') &&
          (jQuery(h.toolbar.M).css(
            'background-color',
            jQuery(toolbar_el).attr('backgroundColor')
          ),
          jQuery('.toolbarMore').css(
            'background-color',
            jQuery(toolbar_el).attr('backgroundColor')
          ))
        jQuery(toolbar_el).attr('borderColor') &&
          jQuery(h.toolbar.M).css('border-color', h.rb)
        jQuery(toolbar_el).attr('borderStyle') &&
          jQuery(h.toolbar.M).css(
            'border-style',
            jQuery(toolbar_el).attr('borderStyle')
          )
        jQuery(toolbar_el).attr('borderThickness') &&
          jQuery(h.toolbar.M).css(
            'border-width',
            jQuery(toolbar_el).attr('borderThickness')
          )
        jQuery(toolbar_el).attr('paddingTop') &&
          (jQuery(h.toolbar.M).css(
            'padding-top',
            jQuery(toolbar_el).attr('paddingTop') + 'px'
          ),
          (e += parseFloat(jQuery(toolbar_el).attr('paddingTop'))))
        jQuery(toolbar_el).attr('paddingLeft') &&
          jQuery(h.toolbar.M).css(
            'padding-left',
            jQuery(toolbar_el).attr('paddingLeft') + 'px'
          )
        jQuery(toolbar_el).attr('paddingRight') &&
          jQuery(h.toolbar.M).css(
            'padding-right',
            jQuery(toolbar_el).attr('paddingRight') + 'px'
          )
        jQuery(toolbar_el).attr('paddingBottom') &&
          (jQuery(h.toolbar.M).css(
            'padding-bottom',
            jQuery(toolbar_el).attr('paddingBottom') + 'px'
          ),
          (e += parseFloat(jQuery(toolbar_el).attr('paddingTop'))))
        jQuery(toolbar_el).attr('cornerRadius') &&
          jQuery(h.toolbar.M).css({
            'border-radius': jQuery(toolbar_el).attr('cornerRadius') + 'px',
            '-moz-border-radius':
              jQuery(toolbar_el).attr('cornerRadius') + 'px',
          })
        jQuery(toolbar_el).attr('height') &&
          jQuery(h.toolbar.M).css(
            'height',
            parseFloat(jQuery(toolbar_el).attr('height')) - e + 'px'
          )
        jQuery(toolbar_el).attr('location') &&
        'float' == jQuery(toolbar_el).attr('location')
          ? (h.mh = !0)
          : (h.mh = !1)
        jQuery(toolbar_el).attr('location') &&
          'bottom' == jQuery(toolbar_el).attr('location') &&
          ((h.$e = !0),
          jQuery(h.toolbar.M).parent().detach().insertAfter(h.N),
          jQuery(h.toolbar.M).css('margin-top', '0px'),
          jQuery(h.toolbar.M).css('margin-bottom', '-5px'),
          jQuery(h.toolbar.M + '_wrap').css('bottom', '0px'),
          jQuery(h.toolbar.M + '_wrap').css('background-color', h.rb),
          jQuery(
            jQuery(h.H.N).css('height', jQuery(h.H.N).height() - 40 + 'px')
          ))
        var q = 1 < eb.platform.Za && !eb.platform.touchonlydevice ? '@2x' : ''
        jQuery(jQuery(h.nc).find(c))
          .find('toolbar')
          .find('element')
          .each(function () {
            ;('bttnPrint' != jQuery(this).attr('id') &&
              'bttnDownload' != jQuery(this).attr('id') &&
              'bttnTextSelect' != jQuery(this).attr('id') &&
              'bttnHand' != jQuery(this).attr('id') &&
              'barCursorTools' != jQuery(this).attr('id')) ||
              !h.readOnly ||
              jQuery(this).attr('visible', !1)
            'bttnDownload' != jQuery(this).attr('id') ||
              h.H.document.PDFFile ||
              jQuery(this).attr('visible', !1)
            'bttnDownload' == jQuery(this).attr('id') &&
              h.O.renderer.config.signature &&
              0 < h.O.renderer.config.signature.length &&
              jQuery(this).attr('visible', !1)
            switch (jQuery(this).attr('type')) {
              case 'button':
                n = '.flowpaper_' + jQuery(this).attr('id')
                if (
                  0 == jQuery(n).length &&
                  (jQuery(h.toolbar.M).append(
                    String.format(
                      "<img id='{0}' class='{1} flowpaper_tbbutton'/>",
                      jQuery(this).attr('id'),
                      'flowpaper_' + jQuery(this).attr('id')
                    )
                  ),
                  jQuery(this).attr('onclick'))
                ) {
                  var c = jQuery(this).attr('onclick')
                  jQuery(n).bind('mousedown', function () {
                    eval(c)
                  })
                }
                jQuery(this).attr('paddingLeft') &&
                  jQuery(n).css(
                    'padding-left',
                    jQuery(this).attr('paddingLeft') - 6 + 'px'
                  )
                if (jQuery(this).attr('fa-class')) {
                  jQuery(n).replaceWith(
                    String.format(
                      '<span id="{0}" style="cursor:pointer;color:#ffffff" class="fa {1} {2}"></span>',
                      jQuery(this).attr('id'),
                      jQuery(this).attr('fa-class'),
                      jQuery(n).get(0).className
                    )
                  )
                } else {
                  var e = jQuery(this).attr('id')
                  jQuery(this).attr('src') && (e = jQuery(this).attr('src'))
                }
                jQuery(n).css(
                  'display',
                  'false' == jQuery(this).attr('visible') ? 'none' : 'block'
                )
                jQuery(n).attr('src', h.Bj + e + q + '.png')
                jQuery(this).attr('icon_width') &&
                  jQuery(n).css('width', jQuery(this).attr('icon_width') + 'px')
                jQuery(this).attr('icon_height') &&
                  jQuery(n).css(
                    'height',
                    jQuery(this).attr('icon_height') + 'px'
                  )
                jQuery(this).attr('fa-class') &&
                  jQuery(n).css(
                    'font-size',
                    jQuery(this).attr('icon_height') + 'px'
                  )
                jQuery(this).attr('paddingRight') &&
                  jQuery(n).css(
                    'padding-right',
                    jQuery(this).attr('paddingRight') - 6 + 'px'
                  )
                jQuery(this).attr('paddingTop') &&
                  jQuery(n).css(
                    'padding-top',
                    jQuery(this).attr('paddingTop') + 'px'
                  )
                h.mh
                  ? jQuery(n).css('margin-top', '0px')
                  : jQuery(n).css('margin-top', '2px')
                null != t && jQuery(n).insertAfter(t)
                t = jQuery(n)
                break
              case 'textbutton':
                n = '#' + h.toolbar.Ma + '_' + jQuery(this).attr('id')
                0 == jQuery(h.toolbar.M).find(n).length
                  ? ((e = jQuery(
                      String.format(
                        '<span id="{0}" hook="{1}" class="flowpaper_tbbutton" style="font-family: Lato;color: #fff;font-size: 11px;margin-top: 3px;">{2}</span>',
                        jQuery(this).attr('id'),
                        'flowpaper_' + jQuery(this).attr('hook'),
                        jQuery(this).text()
                      )
                    )),
                    null != t
                      ? e.insertAfter(t)
                      : jQuery(h.toolbar.M).append(e),
                    jQuery(this).attr('onclick') &&
                      ((c = jQuery(this).attr('onclick')),
                      jQuery(e).bind('mousedown touchstart', function () {
                        eval(c)
                      })))
                  : null != t && jQuery(n).insertAfter(t)
                t = jQuery(n)
                break
              case 'separator':
                n = '#' + h.toolbar.Ma + '_' + jQuery(this).attr('id')
                jQuery(n).css(
                  'display',
                  'false' == jQuery(this).attr('visible') ? 'none' : 'block'
                )
                jQuery(n).attr('src', h.Bj + 'bar' + q + '.png')
                jQuery(this).attr('width') &&
                  jQuery(n).css('width', jQuery(this).attr('width') + 'px')
                jQuery(this).attr('height') &&
                  jQuery(n).css('height', jQuery(this).attr('height') + 'px')
                jQuery(this).attr('paddingLeft') &&
                  jQuery(n).css(
                    'padding-left',
                    +jQuery(this).attr('paddingLeft')
                  )
                jQuery(this).attr('paddingRight') &&
                  jQuery(n).css(
                    'padding-right',
                    +jQuery(this).attr('paddingRight')
                  )
                jQuery(this).attr('paddingTop') &&
                  jQuery(n).css('padding-top', +jQuery(this).attr('paddingTop'))
                jQuery(n).css('margin-top', '0px')
                null != t && jQuery(n).insertAfter(t)
                t = jQuery(n)
                break
              case 'slider':
                n = '.flowpaper_' + jQuery(this).attr('id')
                jQuery(n).css(
                  'display',
                  'false' == jQuery(this).attr('visible') ? 'none' : 'block'
                )
                jQuery(this).attr('width') &&
                  jQuery(n).css('width : ' + jQuery(this).attr('width'))
                jQuery(this).attr('height') &&
                  jQuery(n).css('height : ' + jQuery(this).attr('height'))
                jQuery(this).attr('paddingLeft') &&
                  jQuery(n).css(
                    'padding-left : ' + jQuery(this).attr('paddingLeft')
                  )
                jQuery(this).attr('paddingRight') &&
                  jQuery(n).css(
                    'padding-right : ' + jQuery(this).attr('paddingRight')
                  )
                jQuery(this).attr('paddingTop') &&
                  jQuery(n).css(
                    'padding-top : ' + jQuery(this).attr('paddingTop')
                  )
                h.mh
                  ? jQuery(n).css('margin-top', '-5px')
                  : jQuery(n).css('margin-top', '-3px')
                null != t && jQuery(n).insertAfter(t)
                t = jQuery(n)
                break
              case 'textinput':
                n = '.flowpaper_' + jQuery(this).attr('id')
                jQuery(n).css(
                  'display',
                  'false' == jQuery(this).attr('visible') ? 'none' : 'block'
                )
                jQuery(this).attr('width') &&
                  jQuery(n).css('width : ' + jQuery(this).attr('width'))
                jQuery(this).attr('height') &&
                  jQuery(n).css('height : ' + jQuery(this).attr('height'))
                jQuery(this).attr('paddingLeft') &&
                  jQuery(n).css(
                    'padding-left : ' + jQuery(this).attr('paddingLeft')
                  )
                jQuery(this).attr('paddingRight') &&
                  jQuery(n).css(
                    'padding-right : ' + jQuery(this).attr('paddingRight')
                  )
                jQuery(this).attr('paddingTop') &&
                  jQuery(n).css(
                    'padding-top : ' + jQuery(this).attr('paddingTop')
                  )
                jQuery(this).attr('readonly') &&
                  'true' == jQuery(this).attr('readonly') &&
                  jQuery(n).attr('disabled', 'disabled')
                null != t && jQuery(n).insertAfter(t)
                eb.platform.touchonlydevice
                  ? jQuery(n).css(
                      'margin-top',
                      jQuery(this).attr('marginTop')
                        ? jQuery(this).attr('marginTop') + 'px'
                        : '7px'
                    )
                  : h.mh
                  ? jQuery(n).css('margin-top', '-2px')
                  : jQuery(n).css('margin-top', '0px')
                t = jQuery(n)
                break
              case 'label':
                ;(n = '.flowpaper_' + jQuery(this).attr('id')),
                  jQuery(n).css(
                    'display',
                    'false' == jQuery(this).attr('visible') ? 'none' : 'block'
                  ),
                  jQuery(this).attr('width') &&
                    jQuery(n).css('width : ' + jQuery(this).attr('width')),
                  jQuery(this).attr('height') &&
                    jQuery(n).css('height : ' + jQuery(this).attr('height')),
                  jQuery(this).attr('paddingLeft') &&
                    jQuery(n).css(
                      'padding-left : ' + jQuery(this).attr('paddingLeft')
                    ),
                  jQuery(this).attr('paddingRight') &&
                    jQuery(n).css(
                      'padding-right : ' + jQuery(this).attr('paddingRight')
                    ),
                  jQuery(this).attr('paddingTop') &&
                    jQuery(n).css(
                      'padding-top : ' + jQuery(this).attr('paddingTop')
                    ),
                  null != t && jQuery(n).insertAfter(t),
                  eb.platform.touchonlydevice
                    ? jQuery(n).css(
                        'margin-top',
                        jQuery(this).attr('marginTop')
                          ? jQuery(this).attr('marginTop') + 'px'
                          : '9px'
                      )
                    : h.mh
                    ? jQuery(n).css('margin-top', '1px')
                    : jQuery(n).css('margin-top', '3px'),
                  (t = jQuery(n))
            }
          })
        h.O.outline = jQuery(jQuery(h.nc).find('outline'))
        h.O.labels = jQuery(jQuery(h.nc).find('labels'))
        jQuery(h.toolbar.M).css({
          'margin-left': 'auto',
          'margin-right': 'auto',
        })
        jQuery(toolbar_el).attr('location') &&
          jQuery(toolbar_el).attr('location')
        350 > jQuery(h.toolbar.M).width() &&
          jQuery('.flowpaper_txtSearch').css('width', '40px')
        jQuery(f).attr('glow') &&
          'true' == jQuery(f).attr('glow') &&
          ((h.es = !0),
          jQuery(h.toolbar.M).css({
            'box-shadow': '0 0 35px rgba(22, 22, 22, 1)',
            '-webkit-box-shadow': '0 0 35px rgba(22, 22, 22, 1)',
            '-moz-box-shadow': '0 0 35px rgba(22, 22, 22, 1)',
          }))
        h.rb
          ? jQuery(h.toolbar.M).css('background-color', h.rb)
          : eb.platform.touchonlydevice
          ? !jQuery(toolbar_el).attr('gradients') ||
            (jQuery(toolbar_el).attr('gradients') &&
              'true' == jQuery(toolbar_el).attr('gradients'))
            ? jQuery(h.toolbar.M).addClass('flowpaper_toolbarios_gradients')
            : jQuery(h.toolbar.M).css('background-color', '#555555')
          : jQuery(h.toolbar.M).css('background-color', '#555555')
        h.Wf
          ? jQuery(h.toolbar.M).css('visibility', 'visible')
          : jQuery(h.toolbar.M).hide()
        h.Bo &&
          jQuery(window).bind('keydown', function (c) {
            !c ||
              jQuery(c.target).hasClass('flowpaper_zoomSlider') ||
              'INPUT' == jQuery(c.target).get(0).tagName ||
              h.H.pages.animating ||
              ((h.O.pages.Zd() || (h.O.pages && h.O.pages.animating)) &&
                !h.Mh) ||
              ('37' == c.keyCode
                ? h.O.previous()
                : '39' == c.keyCode && h.O.next())
          })
        d && d()
      },
    })
  }
  this.Th = function () {
    this.H.T.find('.flowpaper_fisheye').hide()
  }
  this.nk = function () {
    this.ul()
  }
  this.Vl = function () {
    this.H.PreviewMode || jQuery(this.O.N).css('padding-top', '20px')
    jQuery('#' + this.Ma).hide()
  }
  this.Yq = function () {
    jQuery(this.O.N).css('padding-top', '0px')
    jQuery('#' + this.Ma).show()
    jQuery('#' + this.Ma)
      .find('.flowpaper_tbbutton')
      .is(':visible') || jQuery('#' + this.Ma).hide()
  }
  this.Rk = function () {
    this.fa = eb.platform.Fb
    this.Yf = !0
    this.qb = !eb.platform.touchonlydevice
    this.Lf = 1
    this.H.vd = !0
    jQuery(this.toolbar.M).css({
      'border-radius': '3px',
      '-moz-border-radius': '3px',
    })
    jQuery(this.toolbar.M).css({
      'margin-left': 'auto',
      'margin-right': 'auto',
    })
    this.O.config.document.PanelColor &&
      (this.rb = this.O.config.document.PanelColor)
    this.O.config.document.BackgroundColor
      ? (this.backgroundColor = this.O.config.document.BackgroundColor)
      : (this.backgroundColor = '#222222')
    this.backgroundImage ||
      jQuery(this.O.T).css('background-color', this.backgroundColor)
    this.rb
      ? jQuery(this.toolbar.M).css('background-color', this.rb)
      : eb.platform.touchonlydevice
      ? jQuery(this.toolbar.M).addClass('flowpaper_toolbarios_gradients')
      : jQuery(this.toolbar.M).css('background-color', '#555555')
    this.Uk()
    this.uh = !0
    this.H.Hh && this.H.Hh()
  }
  this.Uk = function () {
    if (eb.platform.touchonlydevice) {
      var c = eb.platform.Fb ? -5 : -1,
        d = eb.platform.Fb ? 7 : 15,
        h = eb.platform.Fb ? 40 : 60
      jQuery(this.toolbar.M).html(
        String.format(
          "<img src='{0}' class='flowpaper_tbbutton_large flowpaper_bttnDownload' style='margin-left:{1}px;'/>",
          this.Co,
          d
        ) +
          (this.toolbar.O.config.document.ViewModeToolsVisible
            ? String.format(
                "<img src='{0}' style='margin-left:{1}px' class='flowpaper_tbbutton_large flowpaper_twopage flowpaper_tbbutton_pressed flowpaper_bttnBookView flowpaper_viewmode'>",
                this.Ei,
                d
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_bttnSinglePage flowpaper_tbbutton_large flowpaper_singlepage flowpaper_viewmode' style='margin-left:{1}px;'>",
                this.Bh,
                c
              ) +
              String.format(
                "<img src='{0}' style='margin-left:{1}px;' class='flowpaper_tbbutton_large flowpaper_thumbview flowpaper_bttnThumbView flowpaper_viewmode' >",
                this.Ch,
                c
              ) +
              ''
            : '') +
          (this.toolbar.O.config.document.ZoomToolsVisible
            ? String.format(
                "<img class='flowpaper_tbbutton_large flowpaper_bttnZoomIn' src='{0}' style='margin-left:{1}px;' />",
                this.Dh,
                d
              ) +
              String.format(
                "<img class='flowpaper_tbbutton_large flowpaper_bttnZoomOut' src='{0}' style='margin-left:{1}px;' />",
                this.Eh,
                c
              ) +
              String.format(
                "<img class='flowpaper_tbbutton_large flowpaper_bttnFullscreen' src='{0}' style='margin-left:{1}px;' />",
                this.yh,
                c
              ) +
              ''
            : '') +
          (this.toolbar.O.config.document.NavToolsVisible
            ? String.format(
                "<img src='{0}' class='flowpaper_tbbutton_large flowpaper_previous flowpaper_bttnPrevPage' style='margin-left:{0}px;'/>",
                this.Ah,
                d
              ) +
              String.format(
                "<input type='text' class='flowpaper_tbtextinput_large flowpaper_currPageNum flowpaper_txtPageNumber' value='1' style='width:{0}px;' />",
                h
              ) +
              String.format(
                "<div class='flowpaper_lblTotalPages flowpaper_tblabel_large flowpaper_numberOfPages'> / </div>"
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_bttnPrevNext flowpaper_tbbutton_large flowpaper_next'/>",
                this.zh
              ) +
              ''
            : '') +
          (this.toolbar.O.config.document.SearchToolsVisible
            ? String.format(
                "<input type='txtSearch' class='flowpaper_txtSearch flowpaper_tbtextinput_large' style='margin-left:{0}px;width:{1}px;text-align:right' value='{2}' />",
                d,
                eb.platform.Fb ? 70 : 130,
                eb.platform.Fb ? '&#x1F50D' : ''
              ) +
              String.format(
                "<img src='{0}' class='flowpaper_bttnFind flowpaper_find flowpaper_tbbutton_large'  style=''/>",
                this.xh
              ) +
              ''
            : '') +
          String.format(
            "<img src='{0}' id='{1}' class='flowpaper_bttnMore flowpaper_tbbutton_large' style='display:none' />",
            this.Eo,
            this.Do
          )
      )
      jQuery(this.toolbar.M).removeClass('flowpaper_toolbarstd')
      jQuery(this.toolbar.M).addClass('flowpaper_toolbarios')
      jQuery(this.toolbar.M)
        .parent()
        .parent()
        .css({ 'background-color': this.backgroundColor })
    } else {
      jQuery(this.toolbar.M).css('margin-top', '15px'),
        (c =
          this.O.renderer.config.signature &&
          0 < this.O.renderer.config.signature.length),
        jQuery(this.toolbar.M).html(
          String.format(
            "<img style='margin-left:10px;' src='{0}' class='flowpaper_bttnPrint flowpaper_tbbutton print'/>",
            this.nr
          ) +
            (this.H.document.PDFFile && 0 < this.H.document.PDFFile.length && !c
              ? String.format(
                  "<img src='{0}' class='flowpaper_bttnDownload flowpaper_tbbutton download'/>",
                  this.ir
                )
              : '') +
            String.format(
              "<img src='{0}' id='{1}' class='flowpaper_tbseparator' />",
              this.Mg,
              this.wo
            ) +
            (this.O.config.document.ViewModeToolsVisible
              ? String.format(
                  "<img style='margin-left:10px;' src='{1}' class='flowpaper_tbbutton {0} flowpaper_bttnBookView flowpaper_twopage flowpaper_tbbuttonviewmode flowpaper_viewmode' />",
                  'FlipView' == this.O.Db ? 'flowpaper_tbbutton_pressed' : '',
                  this.xr
                ) +
                String.format(
                  "<img src='{1}' class='flowpaper_tbbutton {0} flowpaper_bttnSinglePage flowpaper_singlepage flowpaper_tbbuttonviewmode flowpaper_viewmode' />",
                  'Portrait' == this.O.Db ? 'flowpaper_tbbutton_pressed' : '',
                  this.hr
                ) +
                String.format(
                  "<img src='{0}' id='{1}' class='flowpaper_tbseparator' />",
                  this.Mg,
                  this.yo
                )
              : '') +
            (this.O.config.document.ZoomToolsVisible
              ? String.format(
                  "<div class='flowpaper_zoomSlider flowpaper_slider' style='background-image:url({1})'><div class='flowpaper_handle' style='{0}'></div></div>",
                  eb.browser.msie && 9 > eb.browser.version
                    ? this.H.toolbar.Rm
                    : '',
                  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTIiPjxsaW5lIHgxPSIwIiB5MT0iNiIgeDI9Ijk1IiB5Mj0iNiIgc3R5bGU9InN0cm9rZTojQUFBQUFBO3N0cm9rZS13aWR0aDoxIiAvPjwvc3ZnPg=='
                ) +
                String.format(
                  "<input type='text' class='flowpaper_tbtextinput flowpaper_txtZoomFactor' style='width:40px;' />"
                ) +
                String.format(
                  "<img style='margin-left:10px;' class='flowpaper_tbbutton flowpaper_bttnFullscreen' src='{0}' />",
                  this.jr
                )
              : '') +
            (this.O.config.document.NavToolsVisible
              ? String.format(
                  "<img src='{0}' class='flowpaper_tbbutton flowpaper_previous flowpaper_bttnPrevPage'/>",
                  this.mr
                ) +
                String.format(
                  "<input type='text' class='flowpaper_txtPageNumber flowpaper_tbtextinput flowpaper_currPageNum' value='1' style='width:50px;text-align:right;' />"
                ) +
                String.format(
                  "<div class='flowpaper_lblTotalPages flowpaper_tblabel flowpaper_numberOfPages'> / </div>"
                ) +
                String.format(
                  "<img src='{0}' class='flowpaper_bttnPrevNext flowpaper_tbbutton flowpaper_next'/>",
                  this.pr
                ) +
                String.format(
                  "<img src='{0}' id='{1}' class='flowpaper_tbseparator' />",
                  this.Mg,
                  this.vo
                )
              : '') +
            (this.O.config.document.CursorToolsVisible
              ? String.format(
                  "<img style='margin-top:5px;margin-left:6px;' src='{0}' class='flowpaper_tbbutton flowpaper_bttnTextSelect'/>",
                  this.wr
                ) +
                String.format(
                  "<img style='margin-top:4px;' src='{0}' class='flowpaper_tbbutton flowpaper_tbbutton_pressed flowpaper_bttnHand'/>",
                  this.kr
                ) +
                String.format(
                  "<img src='{0}' id='{1}' class='flowpaper_tbseparator' />",
                  this.Mg,
                  this.uo
                )
              : '') +
            (this.O.config.document.SearchToolsVisible
              ? String.format(
                  "<input id='{0}' type='text' class='flowpaper_tbtextinput flowpaper_txtSearch' style='width:40px;margin-left:4px' />"
                ) +
                String.format(
                  "<img src='{0}' class='flowpaper_find flowpaper_tbbutton flowpaper_bttnFind' />",
                  this.yr
                )
              : '') +
            String.format(
              "<img src='{0}' id='{1}' class='flowpaper_tbseparator' />",
              this.Mg,
              this.xo
            )
        )
    }
  }
  this.sl = function () {
    var c = this
    if (0 < jQuery(c.Va).find('.toolbarMore').length) {
      var d = jQuery(c.Va).find('.toolbarMore').children(),
        h = jQuery(c.toolbar.M),
        f = jQuery(c.Va).find('.flowpaper_bttnMore'),
        k = jQuery(c.Va).find('.toolbarMore'),
        m = (jQuery(c.Va).width() - jQuery(c.toolbar.M).width()) / 2 - 5,
        p = jQuery(c.Va).find('.flowpaper_bttnZoomIn').offset().top,
        n = !1,
        t = jQuery(c.toolbar.M).children()
      jQuery(c.toolbar.M).last()
      jQuery(c.Va)
        .find('.toolbarMore')
        .css({ 'margin-right': m + 'px', 'margin-left': m + 'px' })
      t.each(function () {
        jQuery(this).is(':visible') &&
          (n = n || 20 < jQuery(this).offset().top - h.offset().top)
      })
      n = n || 0 < jQuery(c.Va).find('.toolbarMore').children().length
      d.each(function () {
        jQuery(this).insertBefore(f)
      })
      n &&
        (k.show(),
        k.css('background-color', jQuery(c.toolbar.M).css('background-color')))
      n
        ? (f.show(),
          t.each(function () {
            !jQuery(this).hasClass('flowpaper_bttnMore') &&
              jQuery(this).is(':visible') &&
              35 < jQuery(this).offset().top - p &&
              k.append(this)
          }),
          requestAnim(function () {
            20 < f.offset().top - p &&
              k.prepend(jQuery(c.Va).find('.flowpaper_bttnMore').prev())
          }, 50),
          k.prepend(jQuery(c.Va).find('.flowpaper_bttnMore').prev()))
        : (f.hide(), k.css('visibility', 'hidden'))
    }
  }
  this.bindEvents = function () {
    var c = this
    eb.platform.touchonlydevice
      ? (jQuery(c.Va)
          .find('.flowpaper_txtSearch')
          .on('touchstart', function () {
            !jQuery('.flowpaper_bttnFind').is(':visible') &&
            0 < jQuery(this).val().length &&
            55357 == jQuery(this).val().charCodeAt(0)
              ? (jQuery(this).css('text-align', 'left'),
                jQuery(this).val(''),
                jQuery(this).data('original-width', jQuery(this).css('width')),
                0 < jQuery(c.toolbar.M).find('.flowpaper_txtSearch').length
                  ? (jQuery(c.toolbar.M)
                      .find('*:visible:not(.flowpaper_txtSearch)')
                      .data('search-hide', !0),
                    jQuery(c.toolbar.M)
                      .find('*:visible:not(.flowpaper_txtSearch)')
                      .hide(),
                    jQuery(this).css({ width: '100%' }))
                  : jQuery(this).css({
                      width:
                        jQuery(this).parent().width() -
                        jQuery(this).offset().left +
                        'px',
                    }))
              : jQuery('.flowpaper_bttnFind').is(':visible') ||
                '100%' == jQuery(this).width ||
                (0 < jQuery(c.toolbar.M).find('.flowpaper_txtSearch').length
                  ? (jQuery(c.toolbar.M)
                      .find('*:visible:not(.flowpaper_txtSearch)')
                      .data('search-hide', !0),
                    jQuery(c.toolbar.M)
                      .find('*:visible:not(.flowpaper_txtSearch)')
                      .hide(),
                    jQuery(this).css({ width: '100%' }))
                  : jQuery(this).css({
                      width:
                        jQuery(this).parent().width() -
                        jQuery(this).offset().left +
                        'px',
                    }))
            jQuery(this).focus()
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_txtSearch')
          .on('blur', function () {
            jQuery('.flowpaper_bttnFind').is(':visible') ||
              0 != jQuery(this).val().length ||
              (jQuery(this).css('text-align', 'right'),
              jQuery(this).val(
                String.fromCharCode(55357) + String.fromCharCode(56589)
              ))
            jQuery(this).data('original-width') &&
              jQuery(this).animate(
                { width: jQuery(this).data('original-width') },
                {
                  duration: 300,
                  always: function () {
                    for (
                      var d = jQuery(c.toolbar.M).children(), h = 0;
                      h < d.length;
                      h++
                    ) {
                      jQuery(d[h]).data('search-hide') && jQuery(d[h]).show()
                    }
                  },
                }
              )
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnPrint')
          .on('mousedown touchstart', function () {
            c.Li != c.oa && jQuery(this).attr('src', c.Li)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnPrint')
          .on('mouseup touchend', function () {
            c.Ki != c.oa && jQuery(this).attr('src', c.Ki)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnBookView')
          .on('mousedown touchstart', function () {
            c.wh != c.oa && jQuery(this).attr('src', c.wh)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnBookView')
          .on('mouseup touchend', function () {
            c.wh != c.oa && jQuery(this).attr('src', c.Ei)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnSinglePage')
          .on('mousedown touchstart', function () {
            c.Ni != c.oa && jQuery(this).attr('src', c.Ni)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnSinglePage')
          .on('mouseup touchend', function () {
            c.Bh != c.oa && jQuery(this).attr('src', c.Bh)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnThumbView')
          .on('mousedown touchstart', function () {
            c.Oi != c.oa && jQuery(this).attr('src', c.Oi)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnThumbView')
          .on('mouseup touchend', function () {
            c.Ch != c.oa && jQuery(this).attr('src', c.Ch)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnZoomIn')
          .on('mousedown touchstart', function () {
            c.Pi != c.oa && jQuery(this).attr('src', c.Pi)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnZoomIn')
          .on('mouseup touchend', function () {
            c.Dh != c.oa && jQuery(this).attr('src', c.Dh)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnZoomOut')
          .on('mousedown touchstart', function () {
            c.Qi != c.oa && jQuery(this).attr('src', c.Qi)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnZoomOut')
          .on('mouseup touchend', function () {
            c.Eh != c.oa && jQuery(this).attr('src', c.Eh)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnFullscreen')
          .on('mousedown touchstart', function () {
            c.Gi != c.oa && jQuery(this).attr('src', c.Gi)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnFullscreen')
          .on('mouseup touchend', function () {
            c.yh != c.oa && jQuery(this).attr('src', c.yh)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnPrevPage')
          .on('mousedown touchstart', function () {
            c.Ii != c.oa && jQuery(this).attr('src', c.Ii)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnPrevPage')
          .on('mouseup touchend', function () {
            c.Ah != c.oa && jQuery(this).attr('src', c.Ah)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnNextPage')
          .on('mousedown touchstart', function () {
            c.Hi != c.oa && jQuery(this).attr('src', c.Hi)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnNextPage')
          .on('mouseup touchend', function () {
            c.zh != c.oa && jQuery(this).attr('src', c.zh)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnFind')
          .on('mousedown touchstart', function () {
            c.Fi != c.oa && jQuery(this).attr('src', c.Fi)
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnFind')
          .on('mouseup touchend', function () {
            c.xh != c.oa && jQuery(this).attr('src', c.xh)
          }))
      : (jQuery(c.toolbar.M)
          .find('.flowpaper_txtSearch')
          .on('focus', function () {
            40 >= jQuery(this).width() &&
              (jQuery(c.toolbar.M).animate(
                { width: jQuery(c.toolbar.M).width() + 60 },
                100
              ),
              jQuery(this).animate({ width: jQuery(this).width() + 60 }, 100))
          }),
        jQuery(c.toolbar.M)
          .find('.flowpaper_txtSearch')
          .on('blur', function () {
            40 < jQuery(this).width() &&
              (jQuery(c.toolbar.M).animate(
                { width: jQuery(c.toolbar.M).width() - 60 },
                100
              ),
              jQuery(this).animate({ width: 40 }, 100))
          }))
    jQuery(c.toolbar.M)
      .find('.flowpaper_bttnPlay')
      .bind('click touchstart', function () {
        0 ==
        jQuery('.flowpaper_mark_video_' + (c.O.getCurrPage() - 1)).find(
          '.flowpaper-circle-audio-player'
        ).length
          ? (jQuery('.flowpaper_mark_video_' + (c.O.getCurrPage() - 1)).trigger(
              'mousedown'
            ),
            jQuery(c.toolbar.M)
              .find('.flowpaper_bttnPlay')
              .attr(
                'src',
                jQuery(c.toolbar.M)
                  .find('.flowpaper_bttnPlay')
                  .attr('src')
                  .replace('Play', 'Pause')
              ))
          : 'playing' ==
            jQuery('.flowpaper_mark_video_' + (c.O.getCurrPage() - 1))
              .find('.flowpaper-circle-audio-player')
              .get(0).ag.state
          ? (jQuery('.flowpaper_mark_video_' + (c.O.getCurrPage() - 1))
              .find('.flowpaper-circle-audio-player')
              .get(0)
              .ag.pause(),
            jQuery(c.toolbar.M)
              .find('.flowpaper_bttnPlay')
              .attr(
                'src',
                jQuery(c.toolbar.M)
                  .find('.flowpaper_bttnPlay')
                  .attr('src')
                  .replace('Pause', 'Play')
              ))
          : (jQuery('.flowpaper_mark_video_' + (c.O.getCurrPage() - 1))
              .find('.flowpaper-circle-audio-player')
              .get(0)
              .ag.play(),
            jQuery(c.toolbar.M)
              .find('.flowpaper_bttnPlay')
              .attr(
                'src',
                jQuery(c.toolbar.M)
                  .find('.flowpaper_bttnPlay')
                  .attr('src')
                  .replace('Play', 'Pause')
              ))
      })
    jQuery(c.toolbar.M)
      .find('.flowpaper_bttnZoomIn')
      .bind('click touchstart', function () {
        c.O.pages.Me(!0)
      })
    jQuery(c.toolbar.M)
      .find('.flowpaper_bttnZoomOut')
      .bind('click touchstart', function () {
        c.O.pages.Id()
      })
    0 == c.H.T.find('.flowpaper_socialsharedialog').length &&
      (c.yl
        ? c.H.T.prepend(
            String.format(
              '<div id=\'modal-socialshare\' class=\'modal-content flowpaper_socialsharedialog\' style=\'overflow:hidden;\'><font style=\'color:#000000;font-size:11px\'><img src=\'{0}\' align=\'absmiddle\' />&nbsp;<b>{15}</b></font><div style=\'width:530px;height:180px;margin-top:5px;padding-top:5px;padding-left:5px;background-color:#ffffff;box-shadow: 0px 2px 10px #aaa\'><div style=\'position:absolute;left:20px;top:42px;color:#000000;font-weight:bold;\'>{8}</div><div style=\'position:absolute;left:177px;top:47px;color:#000000;font-weight:bold;\'><hr size=\'1\' style=\'width:350px\'/></div><div style=\'position:absolute;left:20px;top:58px;color:#000000;font-size:10px;\'>{9}</div><div style=\'position:absolute;left:20px;top:88px;color:#000000;font-weight:bold;\'><input type=\'text\' style=\'width:139px;\' value=\'&lt;{10}&gt;\' class=\'flowpaper_txtPublicationTitle\' /></div><div style=\'position:absolute;left:185px;top:80px;color:#000000;\'><div class=\'flowpaper_socialshare_twitter\' style=\'cursor:pointer;background:rgb(29, 161, 242);border-radius:50%;width:36px;height:36px;display:flex;justify-content:center;align-items:center;-webkit-box-pack:center;-webkit-box-align:center;\'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg></div></div><div style=\'position:absolute;left:230px;top:80px;color:#000000;\'><div class=\'flowpaper_socialshare_facebook\' style=\'cursor:pointer;background:rgb(59, 89, 152);border-radius:50%;width:36px;height:36px;display:flex;justify-content:center;align-items:center;-webkit-box-pack:center;-webkit-box-align:center;\'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></div></div><div style=\'position:absolute;left:275px;top:80px;color:#000000;\'><div class=\'flowpaper_socialshare_linkedin\' style=\'cursor:pointer;\'><svg height="36px" viewBox="0 0 36 36" width="36px" class="sel-share-linkedin"><g fill="none" fill-rule="evenodd" id="Linkedin_logo" stroke="none" stroke-width="1"><circle cx="18" cy="18" fill="#0174B0" id="Oval" r="18"></circle><g fill="#FFFFFF" fill-rule="nonzero" id="layer1_1_" transform="translate(9.000000, 7.000000)"><g id="g3019" transform="translate(10.000000, 10.000000) scale(-1, 1) rotate(-180.000000) translate(-10.000000, -10.000000) translate(0.000000, -0.000000)"><path d="M4.6006135,0.0291612903 L4.6006135,13.488129 L0.346993865,13.488129 L0.346993865,0.0291612903 L4.6006135,0.0291612903 Z M2.47460123,15.3258065 C3.95693252,15.3258065 4.8809816,16.3593548 4.8809816,17.6510968 C4.85349693,18.9714839 3.95693252,19.9763871 2.50245399,19.9763871 C1.04674847,19.9763871 0.0957055215,18.9714839 0.0957055215,17.6510968 C0.0957055215,16.3593548 1.01852761,15.3258065 2.44650307,15.3258065 L2.47460123,15.3258065 L2.47460123,15.3258065 Z" id="path28_1_"></path><path d="M6.95472393,0.0291612903 L11.2090798,0.0291612903 L11.2090798,7.54516129 C11.2090798,7.9476129 11.2368098,8.34967742 11.3493252,8.63703226 C11.6560736,9.44116129 12.3565644,10.2732903 13.531411,10.2732903 C15.0709202,10.2732903 15.6862577,9.03870968 15.6862577,7.22967742 L15.6862577,0.0291612903 L19.9397546,0.0291612903 L19.9397546,7.74658065 C19.9397546,11.8806452 17.8415951,13.804129 15.042454,13.804129 C12.7478528,13.804129 11.74,12.4557419 11.1803681,11.5369032 L11.2090798,11.5369032 L11.2090798,13.488129 L6.95472393,13.488129 C7.01116564,12.2254194 6.95472393,0.0291612903 6.95472393,0.0291612903 L6.95472393,0.0291612903 Z" id="path30_1_"></path></g></g></g></svg></div></div><div style=\'position:absolute;left:360px;top:315px;color:#000000;font-size:10px;\'><a href=\'https://flowpaper.com/\' target=\'_new\'>Powered by FlowPaper PDF viewer</a></div></div></div>',
              c.Vm,
              c.vr,
              c.qr,
              c.rr,
              c.ur,
              c.sr,
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'CopyUrlToPublication',
                'Copy URL to publication'
              ),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'DefaultStartPage',
                'Default start page'
              ),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'ShareOnSocialNetwork',
                'Share on Social Network'
              ),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'ShareOnSocialNetworkDesc',
                'You can easily share this publication to social networks. Just click on the appropriate button below.'
              ),
              c.H.toolbar.wa(c.H.toolbar.Ua, 'SharingTitle', 'Sharing Title'),
              c.H.toolbar.wa(c.H.toolbar.Ua, 'EmbedOnSite', 'Embed on Site'),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'EmbedOnSiteDesc',
                'Use the code below to embed this publication to your website.'
              ),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'EmbedOnSiteMiniature',
                'Linkable Miniature'
              ),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'EmbedOnSiteFull',
                'Full Publication'
              ),
              c.H.toolbar.wa(c.H.toolbar.Ua, 'Share', 'Share'),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'StartOnCurrentPage',
                'Start on current page'
              )
            )
          )
        : c.H.T.prepend(
            String.format(
              "<div id='modal-socialshare' class='modal-content flowpaper_socialsharedialog' style='overflow:hidden;'><font style='color:#000000;font-size:11px'><img src='{0}' align='absmiddle' />&nbsp;<b>{15}</b></font><div style='width:530px;height:307px;margin-top:5px;padding-top:5px;padding-left:5px;background-color:#ffffff;box-shadow: 0px 2px 10px #aaa'><div style='position:absolute;left:20px;top:42px;color:#000000;font-weight:bold;'>{6}</div><div style='position:absolute;left:177px;top:42px;color:#000000;font-weight:bold;'><hr size='1' style='width:350px'/></div><div style='position:absolute;left:20px;top:62px;color:#000000;font-weight:bold;'><select class='flowpaper_ddlSharingOptions'><option>{7}</option><option>{16}</option></select></div><div style='position:absolute;left:175px;top:62px;color:#000000;font-weight:bold;'><input type='text' readonly style='width:355px;' class='flowpaper_socialsharing_txtUrl' /></div><div style='position:absolute;left:20px;top:102px;color:#000000;font-weight:bold;'>{8}</div><div style='position:absolute;left:177px;top:107px;color:#000000;font-weight:bold;'><hr size='1' style='width:350px'/></div><div style='position:absolute;left:20px;top:118px;color:#000000;font-size:10px;'>{9}</div><div style='position:absolute;left:20px;top:148px;color:#000000;font-weight:bold;'><input type='text' style='width:139px;' value='&lt;{10}&gt;' class='flowpaper_txtPublicationTitle' /></div><div style='position:absolute;left:185px;top:146px;color:#000000;'><div class='flowpaper_socialshare_twitter' style='cursor:pointer;background:rgb(29, 161, 242);border-radius:50%;width:36px;height:36px;display:flex;justify-content:center;align-items:center;-webkit-box-pack:center;-webkit-box-align:center;'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"white\" stroke=\"none\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z\"></path></svg></div></div><div style='position:absolute;left:230px;top:146px;color:#000000;'><div class='flowpaper_socialshare_facebook' style='cursor:pointer;background:rgb(59, 89, 152);border-radius:50%;width:36px;height:36px;display:flex;justify-content:center;align-items:center;-webkit-box-pack:center;-webkit-box-align:center;'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"white\" stroke=\"none\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z\"></path></svg></div></div><div style='position:absolute;left:275px;top:146px;color:#000000;'><div class='flowpaper_socialshare_linkedin' style='cursor:pointer;'><svg height=\"36px\" viewBox=\"0 0 36 36\" width=\"36px\" class=\"sel-share-linkedin\"><g fill=\"none\" fill-rule=\"evenodd\" id=\"Linkedin_logo\" stroke=\"none\" stroke-width=\"1\"><circle cx=\"18\" cy=\"18\" fill=\"#0174B0\" id=\"Oval\" r=\"18\"></circle><g fill=\"#FFFFFF\" fill-rule=\"nonzero\" id=\"layer1_1_\" transform=\"translate(9.000000, 7.000000)\"><g id=\"g3019\" transform=\"translate(10.000000, 10.000000) scale(-1, 1) rotate(-180.000000) translate(-10.000000, -10.000000) translate(0.000000, -0.000000)\"><path d=\"M4.6006135,0.0291612903 L4.6006135,13.488129 L0.346993865,13.488129 L0.346993865,0.0291612903 L4.6006135,0.0291612903 Z M2.47460123,15.3258065 C3.95693252,15.3258065 4.8809816,16.3593548 4.8809816,17.6510968 C4.85349693,18.9714839 3.95693252,19.9763871 2.50245399,19.9763871 C1.04674847,19.9763871 0.0957055215,18.9714839 0.0957055215,17.6510968 C0.0957055215,16.3593548 1.01852761,15.3258065 2.44650307,15.3258065 L2.47460123,15.3258065 L2.47460123,15.3258065 Z\" id=\"path28_1_\"></path><path d=\"M6.95472393,0.0291612903 L11.2090798,0.0291612903 L11.2090798,7.54516129 C11.2090798,7.9476129 11.2368098,8.34967742 11.3493252,8.63703226 C11.6560736,9.44116129 12.3565644,10.2732903 13.531411,10.2732903 C15.0709202,10.2732903 15.6862577,9.03870968 15.6862577,7.22967742 L15.6862577,0.0291612903 L19.9397546,0.0291612903 L19.9397546,7.74658065 C19.9397546,11.8806452 17.8415951,13.804129 15.042454,13.804129 C12.7478528,13.804129 11.74,12.4557419 11.1803681,11.5369032 L11.2090798,11.5369032 L11.2090798,13.488129 L6.95472393,13.488129 C7.01116564,12.2254194 6.95472393,0.0291612903 6.95472393,0.0291612903 L6.95472393,0.0291612903 Z\" id=\"path30_1_\"></path></g></g></g></svg></div></div><div style='position:absolute;left:20px;top:192px;color:#000000;font-weight:bold;'>{11}</div><div style='position:absolute;left:20px;top:208px;color:#000000;font-size:10px;'>{12}</div><div style='position:absolute;left:20px;top:228px;color:#000000;font-size:10px;'><input type='radio' name='InsertCode' class='flowpaper_radio_miniature' checked />&nbsp;{13}&nbsp;&nbsp;&nbsp;&nbsp;<input type='radio' name='InsertCode' class='flowpaper_radio_fullembed' />&nbsp;{14}</div><div style='position:absolute;left:20px;top:251px;color:#000000;font-size:10px;'><textarea class='flowpaper_txtEmbedCode' readonly style='width:507px;height:52px'></textarea></div><div style='position:absolute;left:360px;top:315px;color:#000000;font-size:10px;'><a href='https://flowpaper.com/' target='_new'>Powered by FlowPaper PDF viewer</a></div></div></div>",
              c.Vm,
              c.vr,
              c.qr,
              c.rr,
              c.ur,
              c.sr,
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'CopyUrlToPublication',
                'Copy URL to publication'
              ),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'DefaultStartPage',
                'Default start page'
              ),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'ShareOnSocialNetwork',
                'Share on Social Network'
              ),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'ShareOnSocialNetworkDesc',
                'You can easily share this flipbook to social networks. Just click on the appropriate button below.'
              ),
              c.H.toolbar.wa(c.H.toolbar.Ua, 'SharingTitle', 'Sharing Title'),
              c.H.toolbar.wa(c.H.toolbar.Ua, 'EmbedOnSite', 'Embed on Site'),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'EmbedOnSiteDesc',
                'Use the code below to embed this flipbook to your website.'
              ),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'EmbedOnSiteMiniature',
                'Linkable Miniature'
              ),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'EmbedOnSiteFull',
                'Full Publication'
              ),
              c.H.toolbar.wa(c.H.toolbar.Ua, 'Share', 'Share'),
              c.H.toolbar.wa(
                c.H.toolbar.Ua,
                'StartOnCurrentPage',
                'Start on current page'
              )
            )
          ))
    c.H.T.find(
      '.flowpaper_radio_miniature, .flowpaper_radio_fullembed, .flowpaper_ddlSharingOptions'
    ).on('change', function () {
      c.mi()
    })
    c.H.T.find('.flowpaper_txtPublicationTitle').on('focus', function (c) {
      ;-1 != jQuery(c.target).val().indexOf('Sharing Title') &&
        jQuery(c.target).val('')
    })
    c.H.T.find('.flowpaper_txtPublicationTitle').on('blur', function (c) {
      0 == jQuery(c.target).val().length &&
        jQuery(c.target).val('<Sharing Title>')
    })
    c.H.T.find('.flowpaper_txtPublicationTitle').on('keydown', function () {
      c.mi()
    })
    c.mi()
    jQuery(c.toolbar.M)
      .find('.flowpaper_bttnSocialShare')
      .bind('click touchstart', function () {
        c.mi()
        jQuery('#modal-socialshare').css('background-color', '#dedede')
        jQuery('#modal-socialshare').smodal({
          minHeight: c.yl ? 90 : 350,
          minWidth: 550,
          appendTo: c.H.T,
        })
        jQuery('#modal-socialshare').parent().css('background-color', '#dedede')
      })
    jQuery(c.toolbar.M)
      .find('.flowpaper_bttnBookView')
      .bind('click touchstart', function () {
        eb.browser.msie && 8 >= eb.browser.version
          ? c.O.switchMode('BookView', c.O.getCurrPage())
          : c.O.switchMode('FlipView', c.O.getCurrPage() + 1)
        jQuery(this).addClass('flowpaper_tbbutton_pressed')
      })
    jQuery(c.toolbar.M)
      .find('.flowpaper_bttnMore')
      .bind('click touchstart', function () {
        var d = (jQuery(c.Va).width() - jQuery(c.toolbar.M).width()) / 2 - 5
        'hidden' == jQuery(c.Va).find('.toolbarMore').css('visibility')
          ? jQuery(c.Va)
              .find('.toolbarMore')
              .css({
                'margin-right': d + 'px',
                'margin-left': d + 'px',
                visibility: 'visible',
              })
          : jQuery(c.Va)
              .find('.toolbarMore')
              .css({
                'margin-right': d + 'px',
                'margin-left': d + 'px',
                visibility: 'hidden',
              })
      })
    c.H.T.find('.flowpaper_socialsharing_txtUrl, .flowpaper_txtEmbedCode').bind(
      'focus',
      function () {
        jQuery(this).select()
      }
    )
    c.H.T.find('.flowpaper_socialsharing_txtUrl, .flowpaper_txtEmbedCode').bind(
      'mouseup',
      function () {
        return !1
      }
    )
    c.H.T.find('.flowpaper_socialshare_twitter').bind('mousedown', function () {
      window.open(
        'https://twitter.com/intent/tweet?url=' +
          escape(c.jg(!1)) +
          '&text=' +
          escape(c.qj()),
        '_flowpaper_exturl'
      )
      c.H.N.trigger('onSocialMediaShareClicked', 'Twitter')
    })
    c.H.T.find('.flowpaper_socialshare_facebook').bind(
      'mousedown',
      function () {
        window.open(
          'http://www.facebook.com/sharer.php?u=' +
            escape(c.jg(!1), '_flowpaper_exturl')
        )
        c.H.N.trigger('onSocialMediaShareClicked', 'Facebook')
      }
    )
    c.H.T.find('.flowpaper_socialshare_linkedin').bind(
      'mousedown',
      function () {
        window.open(
          'http://www.linkedin.com/shareArticle?mini=true&url=' +
            escape(c.jg(!1)) +
            '&title=' +
            escape(c.qj()),
          '_flowpaper_exturl'
        )
        c.H.N.trigger('onSocialMediaShareClicked', 'LinkedIn')
      }
    )
  }
  this.mi = function () {
    this.H.T.find('.flowpaper_txtEmbedCode').val(
      '<iframe frameborder="0"  width="400" height="300"  title="' +
        this.qj() +
        '" src="' +
        this.jg() +
        '" type="text/html" scrolling="no" marginwidth="0" marginheight="0" allowFullScreen></iframe>'
    )
    this.H.T.find('.flowpaper_socialsharing_txtUrl').val(this.jg(!1))
  }
  this.qj = function () {
    return this.H.T.find('.flowpaper_txtPublicationTitle').length &&
      -1 ==
        this.H.T.find('.flowpaper_txtPublicationTitle')
          .val()
          .indexOf('Sharing Title')
      ? this.H.T.find('.flowpaper_txtPublicationTitle').val()
      : ''
  }
  this.jg = function (c) {
    0 == arguments.length && (c = !0)
    var d = this.H.T.find('.flowpaper_ddlSharingOptions').prop('selectedIndex'),
      h = this.H.T.find('.flowpaper_radio_miniature').is(':checked'),
      f =
        location.protocol +
        '//' +
        location.host +
        location.pathname +
        (location.search ? location.search : '')
    this.H.document.SharingUrl && (f = this.H.document.SharingUrl)
    return (
      f.substring(0) +
      (0 < d ? '#page=' + this.H.getCurrPage() : '') +
      (0 < d && h && c ? '&' : h && c ? '#' : '') +
      (h && c ? 'PreviewMode=Miniature' : '')
    )
  }
  this.initialize = function () {
    var c = this.H
    c.J.enableWebGL = c.J.Ui()
    c.J.Mh = !1
    c.J.enableWebGL || (c.renderer.Ih = !0)
    eb.platform.ios && 8 > eb.platform.iosversion && (c.J.enableWebGL = !1)
    if (
      !c.config.document.InitViewMode ||
      (c.config.document.InitViewMode &&
        'Zine' == c.config.document.InitViewMode) ||
      'TwoPage' == c.config.document.InitViewMode ||
      'Flip-SinglePage' == c.config.document.InitViewMode
    ) {
      c.N && 0.7 > c.N.width() / c.N.height() && (c.xf = !0),
        'Flip-SinglePage' != c.config.document.InitViewMode ||
          ((eb.platform.Fb || eb.platform.ios || eb.platform.android) &&
            eb.browser.Zl) ||
          (c.xf = !0),
        (c.Db = 'FlipView'),
        (c.config.document.MinZoomSize = 1),
        (c.I = c.Db),
        'TwoPage' == c.I && (c.I = 'FlipView'),
        (c.scale = 1)
    }
    c.config.document.nm = c.config.document.MinZoomSize
    null === c.T &&
      ((c.T = jQuery(
        "<div style='" +
          c.N.attr('style') +
          ";overflow-x: hidden;overflow-y: hidden;' class='flowpaper_viewer_container'/>"
      )),
      (c.T = c.N.wrap(c.T).parent()),
      c.N.css({
        left: '0px',
        top: '0px',
        position: 'relative',
        width: '100%',
        height: '100%',
      }).addClass('flowpaper_viewer'),
      eb.browser.safari && c.N.css('-webkit-transform', 'translateZ(0)'))
    jQuery(c.N).bind('onCurrentPageChanged', function (d, h) {
      c.Eb &&
        (jQuery('.activeElement-label').remove(),
        jQuery('.activeElement').removeClass('activeElement'))
      c.Fd &&
        (c.Gh ? c.Gh++ : (c.Gh = 1),
        c.Gh <= c.Fd &&
          window.setTimeout(function () {
            c.next()
            c.Gh == c.Fd &&
              window.setTimeout(function () {
                jQuery(c.N).fadeTo(700, 0.1)
                jQuery('#' + c.pages.Ab).fadeTo(700, 0.1, function () {
                  jQuery(c.T).append(
                    String.format(
                      '<div class="flowpaper-promoLabel" style="display: flex; justify-content: center; align-items: center; margin-top: 50%; font-family: \'Lato\'; color: #fff; font-size: 2em;position:absolute;width:95%;top:-50%;padding-left:2.5%;text-align:center;opacity:0;">{0}</div>',
                      c.fl ? c.fl : 'Read now'
                    )
                  )
                  window.setTimeout(function () {
                    jQuery('.flowpaper-promoLabel').animate({ opacity: 1 }, 250)
                  }, 150)
                })
              }, 1500)
          }, 2000))
      var f = location.protocol + '//' + location.host + location.pathname
      !c.Eb &&
        c.wd &&
        (oa('GDPRFORM-' + Q(f)) ||
          c.ho ||
          c.N.append(
            '<div class="flowpaper-leadform" style="' +
              (c.PreviewMode ? 'display:none' : '') +
              '">\n\t<div class="flowpaper-leadform-structor">\n\t\t<div class="signup">\n\t\t\t<h2 class="flowpaper-leadform-title" id="signup">' +
              c.wd.title +
              '</h2>\n\t\t\t<div style="color:#ffffff;">\n\t\t\t<p style="line-height:1.5em;">' +
              c.wd.description +
              (c.wd.link
                ? '<a id="bttnPrivPolicyLink" href="' +
                  c.wd.link +
                  '">' +
                  (c.wd.gm ? c.wd.gm : c.wd.link) +
                  '</a>'
                : '') +
              '</p>\n\t\t\t<button id="bttnGDPRFormAccept" class="submit-btn">' +
              (c.wd.Pk ? c.wd.Pk : 'ACCEPT') +
              '</button>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>'
          ),
        c.N.find('#bttnPrivPolicyLink').on('mouseup touchend', function () {
          jQuery(c.N).trigger('onExternalLinkClicked', $(this).attr('href'))
        }),
        c.N.find('#bttnGDPRFormAccept').on('mouseup touchend', function () {
          na('GDPRFORM-' + Q(f), 'ACCEPT')
          c.ho = !0
          c.wd = !0
          c.N.find('.flowpaper-leadform').remove()
        }))
      if (
        !c.Eb &&
        c.Ob &&
        h >= c.Ob.Xq &&
        0 == c.N.find('.flowpaper-leadform').length
      ) {
        if (oa('LEADFORM-' + Q(f))) {
          var k = JSON.parse(oa('LEADFORM-' + Q(f)))
          jQuery.post(
            'https://test-online.flowpaper.com/api/forms/lead',
            {
              visitorName: k.visitorName,
              visitorEmail: k.visitorEmail,
              visitorLocation: c.config.document.URLAlias
                ? c.config.document.URLAlias
                : location.protocol + '//' + location.host + location.pathname,
            },
            function () {}
          )
        } else {
          c.N.append(
            '<div class="flowpaper-leadform" style="' +
              (c.PreviewMode ? 'display:none' : '') +
              '">\n\t<div class="flowpaper-leadform-structor">\n\t\t<div class="signup">\n\t\t\t<h2 class="flowpaper-leadform-title" id="signup">' +
              c.Ob.title +
              '</h2>\n\t\t\t<div class="flowpaper-leadform-holder">\n' +
              (c.Ob.$q
                ? '\t\t\t\t<input type="text" class="input" id="txtLeadCaptureName" placeholder="Name" />\n'
                : '') +
              (c.Ob.Zq
                ? '\t\t\t\t<input type="email" class="input" id="txtLeadCaptureEmail" placeholder="Email" />\n'
                : '') +
              '\t\t\t</div>\n\t\t\t<button id="bttnLeadFormView" class="submit-btn">View</button>\n\t\t\t<div class="flowpaper-skip-privacy">By clicking View, you confirm that you agree to our <span onclick="window.open(\'https://flowpaper.com/privacy-policy/\',\'privpol\')" target="_new" style="color:#ffffff;cursor:pointer;text-decoration:underline;">Privacy Policy</span>.</div>\n\t\t</div>\n' +
              (c.Ob.Zk
                ? '\t\t<div class="flowpaper-skip slide-up">\n\t\t\t<div class="center">\n\t\t\t\t<h2 class="flowpaper-leadform-title" id="skip"><span>or</span>Skip ></h2>\n\t\t\t</div>\n\t\t</div>\n'
                : '') +
              '\t</div>\n</div>'
          )
          if (c.Ob.Zk) {
            c.N.find('.flowpaper-leadform')
              .find('#skip')
              .on('mouseup touchend', function (d) {
                c.Ob = null
                c.N.find('.flowpaper-leadform').remove()
                d.preventDefault && d.preventDefault()
                d.stopImmediatePropagation()
                d.returnValue = !1
                d = c.J.jg()
                na(
                  'LEADFORM-' + Q(d),
                  JSON.stringify({ ks: new Date().toDateString() })
                )
              })
          }
          c.N.find('#bttnLeadFormView').on('mouseup touchend', function () {
            var h = c.config.document.URLAlias
              ? c.config.document.URLAlias
              : location.protocol + '//' + location.host + location.pathname
            jQuery.post(
              'https://test-online.flowpaper.com/api/forms/lead',
              {
                visitorName: c.N.find('#txtLeadCaptureName').val(),
                visitorEmail: c.N.find('#txtLeadCaptureEmail').val(),
                visitorLocation: h,
              },
              function (d) {
                d && 'ACCEPT' == d.result
                  ? ((c.Ob = null),
                    na(
                      'LEADFORM-' + Q(h),
                      JSON.stringify({
                        visitorName: c.N.find('#txtLeadCaptureName').val(),
                        visitorEmail: c.N.find('#txtLeadCaptureEmail').val(),
                        visitorLocation: h,
                      })
                    ),
                    c.N.find('.flowpaper-leadform').remove())
                  : d &&
                    'DENY' == d.result &&
                    (FLOWPAPER.animateDenyEffect(
                      '.flowpaper-leadform',
                      25,
                      500,
                      7,
                      'hor'
                    ),
                    c.N.find('#txtLeadCaptureEmail').css('color', '#ff0000'))
              }
            )
            d.preventDefault && d.preventDefault()
            d.stopImmediatePropagation()
            d.returnValue = !1
          })
          c.Ob.active = !0
        }
      }
      c.ea && c.Io()
      var k = window.location.search ? window.location.search : '',
        m = eb.platform.mobilepreview
          ? ',mobilepreview=' +
            FLOWPAPER.getLocationHashParameter('mobilepreview')
          : ''
      c.config.document.RTLMode &&
        (h = c.getTotalPages() - h + (0 == c.getTotalPages() % 2 ? 1 : 0))
      !window.history.replaceState ||
        c.Eb ||
        (!c.renderer.Ba && c.renderer.cb) ||
        (c.J.Ao
          ? window.history.pushState(null, null, k + '#page=' + h + m)
          : window.history.replaceState(null, null, k + '#page=' + h + m))
      if (window.createTimeSpent && !c.Eb) {
        f =
          (-1 < document.location.pathname.indexOf('.html')
            ? document.location.pathname.substr(
                0,
                document.location.pathname.lastIndexOf('.html')
              ) + '/'
            : document.location.pathname) +
          '#page=' +
          h
        window.sessionId = window.sessionId
          ? window.sessionId
          : Q(Date.now().toString())
        FLOWPAPER.hc || (FLOWPAPER.hc = [])
        for (var p in FLOWPAPER.hc) {
          FLOWPAPER.hc[p] &&
            (FLOWPAPER.hc[p].end(),
            c.N.trigger('onTimeSpent', {
              sessionId: window.sessionId,
              page: parseInt(p.substr(p.indexOf('#page=') + 6)),
              time: FLOWPAPER.hc[p].time(),
            }),
            (FLOWPAPER.hc[p] = null))
        }
        FLOWPAPER.hc[f] ||
          ((FLOWPAPER.hc[f] = createTimeSpent()),
          FLOWPAPER.hc[f].init({
            location: f,
            gaTracker: 'FlowPaperEventTracker',
          }))
      }
      p = 0 != h % 2 || c.J.fa ? -1 : h + 1
      try {
        if (c.ba[h - 1]) {
          for (var n = 0; n < c.ba[h - 1].length; n++) {
            'audio' == c.ba[h - 1][n].type &&
              c.ba[h - 1][n].autoplay &&
              jQuery('#flowpaper_mark_audio_' + (h - 1) + '_' + n).length &&
              jQuery('#flowpaper_mark_audio_' + (h - 1) + '_' + n).mousedown()
          }
        }
        if (-1 < p && c.ba[p - 1]) {
          for (n = 0; n < c.ba[p - 1].length; n++) {
            'audio' == c.ba[p - 1][n].type &&
              c.ba[p - 1][n].autoplay &&
              jQuery('#flowpaper_mark_audio_' + (p - 1) + '_' + n).length &&
              jQuery('#flowpaper_mark_audio_' + (p - 1) + '_' + n).mousedown()
          }
        }
      } catch (t) {}
    })
    jQuery(c.N).bind('onAudioStarted', function () {
      jQuery(c.toolbar.M).find('.flowpaper_bttnPlay').length &&
        jQuery(c.toolbar.M)
          .find('.flowpaper_bttnPlay')
          .attr(
            'src',
            jQuery(c.toolbar.M)
              .find('.flowpaper_bttnPlay')
              .attr('src')
              .replace('Play', 'Pause')
          )
    })
    window.addEventListener('beforeunload', function () {
      FLOWPAPER.hc || (FLOWPAPER.hc = [])
      window.sessionId = window.sessionId
        ? window.sessionId
        : Q(Date.now().toString())
      for (var d in FLOWPAPER.hc) {
        FLOWPAPER.hc[d] &&
          (FLOWPAPER.hc[d].end(),
          c.N.trigger('onTimeSpent', {
            sessionId: window.sessionId,
            page: parseInt(d.substr(d.indexOf('#page=') + 6)),
            time: FLOWPAPER.hc[d].time(),
          }),
          (FLOWPAPER.hc[d] = null))
      }
    })
  }
  this.Cr = function (d) {
    eb.platform.touchonlydevice
      ? c.switchMode('SinglePage', d)
      : c.switchMode('Portrait', d)
  }
  FlowPaperViewer_HTML.prototype.bk = function (c) {
    var d = this
    if (d.tb != c) {
      var h = (c - 20 + 1) / 2,
        f = h + 9 + 1,
        k = 1,
        m = null != d.J.rb ? d.J.rb : '#555555'
      d.ea.find('.flowpaper_fisheye_item').parent().parent().remove()
      0 > d.getTotalPages() - c &&
        !d.J.fa &&
        (f = f + (d.getTotalPages() - c) / 2 + ((c - d.getTotalPages()) % 2))
      19 > d.getTotalPages() && !d.J.fa && (f = d.getTotalPages() / 2 + 1)
      9 > d.getTotalPages() && d.J.fa && (f = d.getTotalPages() / 2 + 1)
      19 < c
        ? d.ea.find('.flowpaper_fisheye_panelLeft').animate({ opacity: 1 }, 150)
        : d.ea.find('.flowpaper_fisheye_panelLeft').animate({ opacity: 0 }, 150)
      ;(!d.J.fa && c < d.getTotalPages()) ||
      (d.J.fa && c < 2 * d.getTotalPages())
        ? d.ea
            .find('.flowpaper_fisheye_panelRight')
            .animate({ opacity: 1 }, 150)
        : d.ea
            .find('.flowpaper_fisheye_panelRight')
            .animate({ opacity: 0 }, 150)
      for (i = h; i < f; i++) {
        d.J.fa ? d.Xk(i + 1, k) : d.Xk(0 == i ? 1 : 2 * i + 1, k), k++
      }
      d.ea
        .find(
          '.flowpaper_fisheye_item, .flowpaper_fisheye_panelLeft, .flowpaper_fisheye_panelRight'
        )
        .bind('mouseover', function () {
          if (!d.pages.animating && 0 != d.ea.css('opacity')) {
            var c = (1 - Math.min(1, Math.max(0, 1 / d.Hl))) * d.Fl + d.cc
            d.ea.css({ 'z-index': 12, 'pointer-events': 'auto' })
            jQuery(this)
              .parent()
              .parent()
              .parent()
              .find('span')
              .css({ display: 'none' })
            jQuery(this).parent().find('span').css({ display: 'inline-block' })
            jQuery(this).parent().parent().parent().find('p').remove()
            var e =
              1 == jQuery(this).data('pageindex')
                ? d.ig / 2
                : d.J.fa
                ? d.ig / 4
                : 0
            jQuery(this)
              .parent()
              .find('span')
              .after(
                String.format(
                  "<p style='width: 0;height: 0;border-left: 7px solid transparent;border-right: 7px solid transparent;border-top: 7px solid {0};margin-top:-35px;margin-left:{1}px;'></p>",
                  m,
                  c / 2 - 20 + e
                )
              )
          }
        })
      d.ea.find('.flowpaper_fisheye_item').bind('mouseout', function (c) {
        d.pages.animating ||
          0 == d.ea.css('opacity') ||
          ((d.ij = c.pageX),
          (d.jj = c.pageY),
          (d.Je = c.target),
          jQuery(d.Je).get(0),
          d.Qm(),
          d.ea.css({ 'z-index': 9, 'pointer-events': 'none' }),
          jQuery(this).parent().find('span').css({ display: 'none' }),
          jQuery(this).parent().find('p').remove())
      })
      d.ea.find('li').each(function () {
        jQuery(this).bind('mousemove', function (c) {
          d.pages.animating ||
            0 < c.buttons ||
            !d.ea.is(':visible') ||
            ((d.Je = c.target),
            (d.ij = c.pageX),
            (d.jj = c.pageY),
            jQuery(d.Je).get(0),
            (d.kj = !0),
            d.um())
        })
      })
      jQuery(d.ea).bind('mouseleave', function () {
        d.ea.find('li').each(function () {
          var c = this
          requestAnim(function () {
            jQuery(c)
              .find('a')
              .css({ width: d.cc, top: d.cc / 3 })
          }, 10)
        })
      })
      jQuery(d.pages.L + ', ' + d.pages.L + '_parent, #' + d.aa).bind(
        'mouseover',
        function () {
          if (
            d.ea &&
            (d.ea.css({ 'z-index': 9, 'pointer-events': 'none' }),
            jQuery('.flowpaper_fisheye_item')
              .parent()
              .find('span')
              .css({ display: 'none' }),
            jQuery('.flowpaper_fisheye_item').parent().find('p').remove(),
            (eb.browser.msie || (eb.browser.safari && 5 > eb.browser.Zb)) &&
              d.Je)
          ) {
            d.Je = null
            var c = d.ea.find('a').find('canvas').data('origwidth'),
              e = d.ea.find('a').find('canvas').data('origheight')
            d.ea.find('li').each(function () {
              jQuery(this)
                .find('a')
                .css({ height: e, width: c, top: d.cc / 3 })
              jQuery(this)
                .find('a')
                .find('canvas')
                .css({ height: e, width: c, top: d.cc / 3 })
            })
          }
        }
      )
    }
    d.tb = c
  }
  FlowPaperViewer_HTML.prototype.Io = function () {
    var c = this
    if (!c.J.fa && (c.ma > c.tb || c.ma <= c.tb - 20) && -1 != c.tb) {
      var d = c.ma > c.tb ? 20 : -20
      ma(c.ma, c.tb - 20, c.tb + 20)
        ? c.Vh(d)
        : (c.bk(c.ma - (c.ma % 20) - 1 + 20),
          window.setTimeout(function () {
            c.Sc = (c.tb - 20 + 1) / 2 + 1
            c.Ze = c.Sc + 9
            0 > c.getTotalPages() - c.tb &&
              (c.Ze =
                c.Ze +
                (c.getTotalPages() - c.tb) / 2 +
                ((c.tb - c.getTotalPages()) % 2))
            c.Sc <= c.getTotalPages() && c.renderer.He(c, c.Sc, 2 * c.ce)
          }, 300))
    }
  }
  FlowPaperViewer_HTML.prototype.Vh = function (c) {
    var d = this
    0 != c && d.bk(d.tb + c)
    window.setTimeout(function () {
      d.Sc = (d.tb - 20 + 1) / 2 + 1
      d.Ze = d.Sc + 9
      0 > d.getTotalPages() - d.tb &&
        !(d.J.fa && 19 > d.getTotalPages()) &&
        (d.Ze =
          d.Ze +
          (d.getTotalPages() - d.tb) / 2 +
          ((d.tb - d.getTotalPages()) % 2))
      d.J.fa && 20 < d.tb && (d.Ze *= 2)
      d.Sc <= d.getTotalPages() && d.renderer.He(d, d.Sc, 2 * d.ce)
    }, 300)
  }
  FlowPaperViewer_HTML.prototype.Xk = function (c, d) {
    var h = this
    if (h.ea) {
      var f = null != h.J.rb ? h.J.rb : '#555555',
        k = ''
      h.config.document.RTLMode && (c = h.getTotalPages() - parseInt(c) + 1)
      1 != c || h.config.document.RTLMode
        ? (1 == c && h.config.document.RTLMode) || h.J.fa
          ? (k = '&nbsp;&nbsp;' + c + '&nbsp;&nbsp;')
          : c == h.getTotalPages() && 0 == h.getTotalPages() % 2
          ? (k = (c - 1).toString())
          : c > h.getTotalPages()
          ? (k = (c - 1).toString())
          : (k = c - 1 + '-' + c)
        : (k = '&nbsp;&nbsp;' + d + '&nbsp;&nbsp;')
      k = h.toolbar.Td(c, k)
      f = jQuery(
        String.format(
          "<li><a style='height:{2}px;width:{7}px;top:{9}px;' class='flowpaper_thumbitem'><span style='margin-left:{8}px;background-color:{0}'>{4}</span><canvas data-pageIndex='{5}' data-ThumbIndex='{6}' class='flowpaper_fisheye_item' style='pointer-events: auto;' /></a></li>",
          f,
          h.Hd,
          0.8 * h.ce,
          h.ig,
          k,
          c,
          d,
          h.cc,
          1 == c ? h.ig : h.J.fa ? h.ig / 1.5 : 0,
          h.cc / 3
        )
      )
      f.insertBefore(h.ea.find('.flowpaper_fisheye_panelRight').parent())
      f.find('.flowpaper_fisheye_item').css({ opacity: 0 })
      jQuery(f).bind('mousedown', function () {
        1 != !h.scale &&
          (h.ea && h.ea.css({ 'z-index': 9, 'pointer-events': 'none' }),
          c > h.getTotalPages() && (c = h.getTotalPages()),
          h.gotoPage(c))
      })
    }
  }
  this.ul = function () {
    var c = this.H
    if ('FlipView' == c.I) {
      0 < c.T.find('.flowpaper_fisheye').length &&
        c.T.find('.flowpaper_fisheye').remove()
      c.tb = -1
      var d = 0
      0 < c.getDimensions(0).length &&
        (d = c.getDimensions(0)[0].xa / c.getDimensions(0)[0].Ga - 0.3)
      c.Qs = 25
      c.ce = 0.25 * c.N.height()
      c.ig = 0.41 * c.ce
      c.cc = c.ce / (3.5 - d)
      c.hj = 2.5 * c.cc
      c.Hd =
        jQuery(c.N).offset().top +
        jQuery(c.pages.L).height() -
        c.T.offset().top +
        c.jc
      c.Hl = 1.25 * c.ce
      c.ep = -(c.cc / 3)
      c.Hd + 0.95 * c.hj > screen.height &&
        (c.Hd = c.Hd - (c.Hd + 0.98 * c.hj - screen.height))
      d = null != c.J.rb ? c.J.rb : '#555555'
      c.J.Lf &&
        ((d = R(d)),
        (d = 'rgba(' + d.r + ',' + d.g + ',' + d.b + ',' + c.J.Lf + ')'))
      c.T.append(
        jQuery(
          String.format(
            "<div class='flowpaper_fisheye' style='position:absolute;pointer-events: none;top:{1}px;z-index:12;left:{4}px;" +
              (c.J.$e || !c.J.Wf ? 'margin-top:2.5%;' : '') +
              "'><ul><li><div class='flowpaper_fisheye_panelLeft' style='pointer-events: auto;position:relative;-moz-border-radius-topleft: 10px;border-top-left-radius: 10px;-moz-border-radius-bottomleft: 10px;border-bottom-left-radius: 10px;background-color:{0};left:0px;width:22px;'><div style='position:absolute;height:100px;width:100px;left:0px;top:-40px;'></div><div class='flowpaper_fisheye_leftArrow' style='position:absolute;top:20%;left:3px'></div></div></li><li><div class='flowpaper_fisheye_panelRight' style='pointer-events: auto;position:relative;-moz-border-radius-topright: 10px;border-top-right-radius: 10px;-moz-border-radius-bottomright: 10px;border-bottom-right-radius: 10px;background-color:{0};left:{5}px;width:22px;" +
              ((!c.J.fa && 19 >= c.getTotalPages()) ||
              (c.J.fa && 9.5 >= c.getTotalPages())
                ? 'display:none'
                : '') +
              "'><div style='position:absolute;height:100px;width:100px;left:0px;top:-40px;'></div><div class='flowpaper_fisheye_rightArrow' style='position:absolute;top:20%;left:3px;'></div></div></li></ul></div>",
            d,
            c.Hd,
            0.8 * c.ce,
            c.ig,
            c.ep,
            c.J.fa ? '30' : '0'
          )
        )
      )
      c.ea = c.T.find('.flowpaper_fisheye')
      c.ea.css({
        top:
          c.Hd -
          (c.ea.find('.flowpaper_fisheye_panelLeft').offset().top -
            jQuery(c.ea).offset().top) +
          c.ea.find('.flowpaper_fisheye_panelLeft').height() / 2 +
          (c.pages.pb ? c.pages.pb : 0),
      })
      c.Fl = c.hj - c.cc
      c.ij = -1
      c.jj = -1
      c.gj = !1
      c.kj = !1
      c.Ug = c.cc - 0.4 * c.cc
      c.Ps = c.Ug / c.cc
      c.ea.find('.flowpaper_fisheye_panelLeft').bind('mousedown', function () {
        c.Vh(-20)
      })
      c.ea.find('.flowpaper_fisheye_panelRight').bind('mousedown', function () {
        c.Vh(20)
      })
      36 < c.Ug && (c.Ug = 36)
      c.ea
        .find('.flowpaper_fisheye_panelLeft')
        .css({ opacity: 0, height: c.Ug + 'px', top: '-10px' })
      c.ea
        .find('.flowpaper_fisheye_panelRight')
        .css({ height: c.Ug + 'px', top: '-10px' })
      c.ea.css({
        top:
          c.Hd -
          (c.ea.find('.flowpaper_fisheye_panelLeft').offset().top -
            jQuery(c.ea).offset().top) +
          c.ea.find('.flowpaper_fisheye_panelLeft').height() / 3 +
          (c.pages.pb ? c.pages.pb : 0),
      })
      c.Oh =
        30 < c.ea.find('.flowpaper_fisheye_panelLeft').height()
          ? 11
          : 0.35 * c.ea.find('.flowpaper_fisheye_panelLeft').height()
      c.ea
        .find('.flowpaper_fisheye_leftArrow')
        .We(c.Oh, c.J.Cb ? c.J.Cb : '#AAAAAA')
      c.ea
        .find('.flowpaper_fisheye_rightArrow')
        .Rd(c.Oh, c.J.Cb ? c.J.Cb : '#AAAAAA')
      jQuery(c).unbind('onThumbPanelThumbAdded')
      jQuery(c).bind('onThumbPanelThumbAdded', function (d, g) {
        var f = c.ea.find(String.format('*[data-thumbIndex="{0}"]', g.Uf))
        f.data('pageIndex')
        var m = (g.Uf - 1) % 10
        f && f.animate({ opacity: 1 }, 300)
        c.Sc < c.Ze &&
          (c.tb - 20 + 1) / 2 + m + 2 > c.Sc &&
          (c.Fr ? (c.Sc++, (c.Fr = !1)) : (c.Sc = (c.tb - 20 + 1) / 2 + m + 2),
          c.Sc <= c.getTotalPages() && c.renderer.He(c, c.Sc, 2 * c.ce))
        0 == m &&
          f.height() - 10 <
            c.ea.find('.flowpaper_fisheye_panelRight').height() &&
          (c.ea
            .find('.flowpaper_fisheye_panelLeft')
            .css(
              'top',
              c.ea.find('.flowpaper_fisheye_panelLeft').height() -
                f.height() +
                5 +
                'px'
            ),
          c.ea
            .find('.flowpaper_fisheye_panelLeft')
            .height(c.ea.find('.flowpaper_fisheye_panelLeft').height() - 3),
          c.ea
            .find('.flowpaper_fisheye_panelRight')
            .css(
              'top',
              c.ea.find('.flowpaper_fisheye_panelRight').height() -
                f.height() +
                5 +
                'px'
            ),
          c.ea
            .find('.flowpaper_fisheye_panelRight')
            .height(c.ea.find('.flowpaper_fisheye_panelRight').height() - 3))
      })
      c.bk(19)
      c.PreviewMode || c.Vh(0)
      1 != c.scale && c.ea.animate({ opacity: 0 }, 0)
      c.Xa && c.J.hi()
      c.mb && c.J.Pm()
    }
  }
  this.bi = function () {
    if (
      jQuery(jQuery(c.J.nc).find('leadform')).length &&
      !c.document.DisableOverflow
    ) {
      var d = jQuery(jQuery(c.J.nc).find('leadform'))
      c.Ob = {
        Zk: 'true' == d.attr('allowToSkip'),
        Xq: parseInt(d.attr('showOnPage')),
        title:
          d.attr('title') && d.attr('title').length
            ? d.attr('title')
            : 'Enter your details to read this ebook',
      }
      d.find('element').each(function () {
        var d = jQuery(this)
        'visitorName' == d.attr('id') && (c.Ob.$q = 'true' == d.attr('visible'))
        'visitorEmail' == d.attr('id') &&
          (c.Ob.Zq = 'true' == d.attr('visible'))
      })
    }
    jQuery(jQuery(c.J.nc).find('gdprform')).length &&
      !c.document.DisableOverflow &&
      ((d = jQuery(jQuery(c.J.nc).find('gdprform'))),
      (c.wd = {
        title: d.attr('title'),
        description: d.attr('description'),
        link: d.attr('link'),
        gm: d.attr('linkLabel'),
        Pk: d.attr('acceptLabel'),
      }))
    jQuery(jQuery(c.J.nc).find('content'))
      .find('page')
      .each(function () {
        var d = jQuery(this)
        jQuery(this)
          .find('link')
          .each(function () {
            c.addLink(
              jQuery(d).attr('number'),
              jQuery(this).attr('href'),
              jQuery(this).attr('x'),
              jQuery(this).attr('y'),
              jQuery(this).attr('width'),
              jQuery(this).attr('height'),
              jQuery(this).attr('showLinkIcon')
                ? 'true' == jQuery(this).attr('showLinkIcon')
                : !1,
              jQuery(this).attr('showMouseOverText')
                ? 'true' == jQuery(this).attr('showMouseOverText')
                : !1,
              jQuery(this).attr('mouseOverText')
            )
          })
        jQuery(this)
          .find('video')
          .each(function () {
            var e = jQuery(this).attr('url')
            if (e && -1 < e.indexOf('{') && c.document.FilesBlobURI) {
              var g = JSON.parse(e),
                e = g.mp4 ? c.document.FilesBlobURI(g.mp4) : '',
                g = g.webm ? c.document.FilesBlobURI(g.webm) : '',
                e = JSON.stringify({ ut: e, Ut: g })
            }
            c.addVideo(
              jQuery(d).attr('number'),
              c.document.FilesBlobURI
                ? c.document.FilesBlobURI(jQuery(this).attr('src'))
                : jQuery(this).attr('src'),
              e,
              jQuery(this).attr('x'),
              jQuery(this).attr('y'),
              jQuery(this).attr('width'),
              jQuery(this).attr('height'),
              jQuery(this).attr('maximizevideo'),
              jQuery(this).attr('autoplay')
            )
          })
        jQuery(this)
          .find('audio')
          .each(function () {
            c.jo(
              jQuery(d).attr('number'),
              c.document.FilesBlobURI
                ? c.document.FilesBlobURI(jQuery(this).attr('src'))
                : jQuery(this).attr('src'),
              c.document.FilesBlobURI
                ? c.document.FilesBlobURI(jQuery(this).attr('url'))
                : jQuery(this).attr('url'),
              jQuery(this).attr('x'),
              jQuery(this).attr('y'),
              jQuery(this).attr('width'),
              jQuery(this).attr('height'),
              jQuery(this).attr('autoPlayOnPageVisit'),
              jQuery(this).attr('playViaToolbar'),
              jQuery(this).attr('hidePlayer'),
              jQuery(this).attr('invertPlayer'),
              jQuery(this).attr('keepPlaying')
            )
            'true' == jQuery(this).attr('playViaToolbar') &&
              jQuery('.flowpaper_bttnPlay').show()
          })
        jQuery(this)
          .find('iframe')
          .each(function () {
            c.Tk(
              jQuery(d).attr('number'),
              c.document.FilesBlobURI
                ? c.document.FilesBlobURI(jQuery(this).attr('src'))
                : jQuery(this).attr('src'),
              jQuery(this).attr('url'),
              jQuery(this).attr('x'),
              jQuery(this).attr('y'),
              jQuery(this).attr('width'),
              jQuery(this).attr('height'),
              jQuery(this).attr('maximizeframe')
            )
          })
        jQuery(this)
          .find('image')
          .each(function () {
            c.addImage(
              jQuery(d).attr('number'),
              c.document.FilesBlobURI
                ? c.document.FilesBlobURI(jQuery(this).attr('src'))
                : jQuery(this).attr('src'),
              jQuery(this).attr('x'),
              jQuery(this).attr('y'),
              jQuery(this).attr('width'),
              jQuery(this).attr('height'),
              jQuery(this).attr('href'),
              c.document.FilesBlobURI
                ? c.document.FilesBlobURI(jQuery(this).attr('hoversrc'))
                : jQuery(this).attr('hoversrc'),
              c.document.FilesBlobURI
                ? c.document.FilesBlobURI(jQuery(this).attr('popoversrc'))
                : jQuery(this).attr('popoversrc'),
              jQuery(this).attr('spotlight')
            )
          })
        jQuery(this)
          .find('slideshow')
          .each(function () {
            c.mo(
              jQuery(d).attr('number'),
              jQuery(this).attr('x'),
              jQuery(this).attr('y'),
              jQuery(this).attr('width'),
              jQuery(this).attr('height'),
              jQuery(this).children()
            )
          })
      })
    c.J.sl()
    'FlipView' == c.I &&
      window.zine &&
      ((c.jc = c.nb && !c.J.$e ? c.J.Va.height() : 0),
      c.oc && c.nb && (c.jc = 5),
      c.document.StartAtPage &&
        !c.sh &&
        (c.sh =
          0 == c.document.StartAtPage % 2 || c.J.fa
            ? c.document.StartAtPage
            : c.document.StartAtPage - 1),
      (c.we = !1),
      (d = 1400),
      'very fast' == c.J.qd && (d = 300),
      'fast' == c.J.qd && (d = 700),
      'slow' == c.J.qd && (d = 2300),
      'very slow' == c.J.qd && (d = 6300),
      (c.zk = 600),
      (c.Ca = jQuery(c.pages.L).turn({
        gradients: !eb.platform.android,
        acceleration: !0,
        shadows: c.vd && !c.Fd,
        elevation: 50,
        duration: d,
        page: c.sh ? c.sh : 1,
        display: c.J.fa ? 'single' : 'double',
        pages: c.getTotalPages(),
        cornerDragging:
          c.document.EnableCornerDragging && !(c.J.fa && c.J.enableWebGL),
        disableCornerNavigation: c.J.enableWebGL,
        disableMouseEvents: c.J.enableWebGL,
        when: {
          turning: function (d, e) {
            c.J.mj &&
              'None' != c.J.mj &&
              c.we &&
              (c.Rj && c.Rj.remove(),
              window.setTimeout(function () {
                var d = c.J.Bj
                ;-1 < d.indexOf('/mobile/') && (d = d.replace('/mobile/', '/'))
                c.Rj = new ua(d + '../sounds/' + c.J.mj + '.mp3')
                c.Rj.start()
              }, 200))
            c.pages.animating = !0
            c.pages.Bg = null
            c.pages.Z = 0 != e % 2 || c.J.fa ? e : e + 1
            c.pages.Z > c.getTotalPages() && (c.pages.Z = c.pages.Z - 1)
            if (1 != e || c.J.fa) {
              c.J.fa || e != c.getTotalPages() || 0 != c.getTotalPages() % 2
                ? c.J.fa
                  ? c.J.fa &&
                    c.jc &&
                    jQuery(c.pages.L + '_parent').transition(
                      { x: 0, y: c.jc },
                      0
                    )
                  : jQuery(c.pages.L + '_parent').transition(
                      { x: 0, y: c.jc },
                      c.zk,
                      'ease',
                      function () {}
                    )
                : ((g = c.we ? c.zk : 0),
                  jQuery(c.pages.L + '_parent').transition(
                    { x: +(c.pages.Zc() / 4), y: c.jc },
                    g,
                    'ease',
                    function () {}
                  ))
            } else {
              var g = c.we ? c.zk : 0
              jQuery(c.pages.L + '_parent').transition(
                { x: -(c.pages.Zc() / 4), y: c.jc },
                g,
                'ease',
                function () {}
              )
            }
            c.ma = 1 < e ? c.pages.Z : e
            c.renderer.Ge && c.we && c.pages.Gf(e - 1)
            c.renderer.Ge && c.we && c.pages.Gf(e)
            'FlipView' == c.I &&
              (!c.pages.pages[e - 1] ||
                c.pages.pages[e - 1].Lc ||
                c.pages.pages[e - 1].va ||
                ((c.pages.pages[e - 1].Lc = !0), c.pages.pages[e - 1].md()),
              e < c.getTotalPages() &&
                c.pages.pages[e] &&
                !c.pages.pages[e].Lc &&
                !c.pages.pages[e].va &&
                ((c.pages.pages[e].Lc = !0), c.pages.pages[e].md()))
          },
          turned: function (d, e) {
            c.J.enableWebGL && c.Ca && !c.Nf
              ? c.pages.Zd() ||
                (c.Ca.css({ opacity: 1 }),
                c.Nf
                  ? ((c.we = !0),
                    (c.pages.animating = !1),
                    c.Fc(e),
                    c.pages.vc(),
                    c.N.trigger(
                      'onCurrentPageChanged',
                      c.config && c.config.document && c.config.document.RTLMode
                        ? c.getTotalPages() - e + 1
                        : e
                    ),
                    null != c.pd && (c.pd(), (c.pd = null)))
                  : (c.Fd ||
                      jQuery('#' + c.pages.Ab).animate(
                        { opacity: 0.5 },
                        {
                          duration: 50,
                          always: function () {
                            jQuery('#' + c.pages.Ab).animate(
                              { opacity: 0 },
                              {
                                duration: 50,
                                always: function () {
                                  jQuery('#' + c.pages.Ab).css('z-index', -1)
                                  c.we = !0
                                  c.pages.animating = !1
                                  c.Fc(e)
                                  c.pages.vc()
                                  c.N.trigger(
                                    'onCurrentPageChanged',
                                    c.config &&
                                      c.config.document &&
                                      c.config.document.RTLMode
                                      ? c.getTotalPages() - e + 1
                                      : e
                                  )
                                  null != c.pd && (c.pd(), (c.pd = null))
                                },
                              }
                            )
                          },
                        }
                      ),
                    c.Fd &&
                      ((c.we = !0),
                      (c.pages.animating = !1),
                      c.Fc(e),
                      c.pages.vc(),
                      c.N.trigger(
                        'onCurrentPageChanged',
                        c.config &&
                          c.config.document &&
                          c.config.document.RTLMode
                          ? c.getTotalPages() - e + 1
                          : e
                      ),
                      null != c.pd && (c.pd(), (c.pd = null)))))
              : ((c.we = !0),
                (c.pages.animating = !1),
                c.Fc(e),
                c.pages.vc(),
                c.N.trigger(
                  'onCurrentPageChanged',
                  c.config && c.config.document && c.config.document.RTLMode
                    ? c.getTotalPages() - e + 1
                    : e
                ),
                null != c.pd && (c.pd(), (c.pd = null)))
          },
          pageAdded: function (d, e) {
            var g = c.pages.getPage(e - 1)
            g.Xl()
            c.J.Uc.Ep(g)
          },
          foldedPageClicked: function (d, e) {
            0 < c.T.find('.simplemodal-container').length ||
              c.Vj ||
              ((c.pages.Zd() || c.pages.animating) && !c.J.Mh) ||
              c.Xa ||
              c.mb ||
              requestAnim(function () {
                window.clearTimeout(c.Nf)
                c.Nf = null
                e >= c.pages.Z && e < c.getTotalPages()
                  ? c.pages.Fg('next')
                  : c.pages.Fg('previous')
              })
          },
          destroyed: function () {
            c.Ro && c.N.parent().remove()
          },
        },
      })),
      jQuery(c.Ca).bind('cornerActivated', function () {
        c.ea && c.ea.css({ 'z-index': 9, 'pointer-events': 'none' })
      }),
      jQuery(c.M).trigger('onScaleChanged', 1 / c.document.MaxZoomSize))
    if (
      c.backgroundColor &&
      -1 == c.backgroundColor.indexOf('[') &&
      !this.backgroundImage
    ) {
      ;(d = R(this.backgroundColor)),
        (d =
          'rgba(' +
          d.r +
          ',' +
          d.g +
          ',' +
          d.b +
          ',' +
          (null != this.jf ? parseFloat(this.jf) : 1) +
          ')'),
        jQuery(this.O.N).css('background', d),
        this.O.nb || jQuery(this.Va).css('background', d)
    } else {
      if (
        c.backgroundColor &&
        0 <= c.backgroundColor.indexOf('[') &&
        !this.backgroundImage
      ) {
        var g = c.backgroundColor.split(',')
        g[0] = g[0].toString().replace('[', '')
        g[0] = g[0].toString().replace(']', '')
        g[0] = g[0].toString().replace(' ', '')
        g[1] = g[1].toString().replace('[', '')
        g[1] = g[1].toString().replace(']', '')
        g[1] = g[1].toString().replace(' ', '')
        d = g[0].toString().substring(0, g[0].toString().length)
        g = g[1].toString().substring(0, g[1].toString().length)
        jQuery(c.O.N).css(
          'backgroundImage',
          'linear-gradient(top, ' + d + ', ' + g + ')'
        )
      }
    }
    'FlipView' == c.I && !eb.platform.touchonlydevice && c.J.nk && c.J.qb
      ? (c.J.ul(), c.PreviewMode && c.J.Th())
      : (c.ea && (c.ea.remove(), (c.ea = null)), (c.tb = -1))
    FlowPaperViewer_HTML.prototype.distance = function (c, d, e, g) {
      c = e - c
      d = g - d
      return Math.sqrt(c * c + d * d)
    }
    FlowPaperViewer_HTML.prototype.turn = function (c) {
      var d = this,
        e = arguments[0],
        g = 2 == arguments.length ? arguments[1] : null
      !d.J.enableWebGL || ('next' != e && 'previous' != e) || d.Xa || d.mb
        ? (jQuery('#' + d.pages.Ab).css('z-index', -1),
          d.Ca &&
            (1 == arguments.length && d.Ca.turn(arguments[0]),
            2 == arguments.length && d.Ca.turn(arguments[0], arguments[1])))
        : (!d.pages.Zd() && !d.pages.animating) || d.J.Mh
        ? requestAnim(function () {
            window.clearTimeout(d.Nf)
            d.Nf = null
            d.pages.Fg(e, g)
          })
        : (window.clearTimeout(d.Nf),
          (d.Nf = window.setTimeout(function () {
            d.turn(e, g)
          }, 100)))
    }
    FlowPaperViewer_HTML.prototype.um = function () {
      var c = this
      c.gj ||
        ((c.gj = !0),
        c.El && window.clearTimeout(c.El),
        (c.El = requestAnim(function () {
          c.cp(c)
        }, 40)))
    }
    FlowPaperViewer_HTML.prototype.cp = function (c) {
      c.Qm()
      c.gj = !1
      c.kj && ((c.kj = !1), c.um())
    }
    FlowPaperViewer_HTML.prototype.Qm = function () {
      var c = this
      c.ea.find('li').each(function () {
        var d = c.Je
        if (
          !(eb.browser.msie || (eb.browser.safari && 5 > eb.browser.Zb)) ||
          c.Je
        ) {
          if (
            d &&
            jQuery(d).get(0).tagName &&
            'IMG' != jQuery(d).get(0).tagName &&
            'LI' != jQuery(d).get(0).tagName &&
            'DIV' != jQuery(d).get(0).tagName &&
            'CANVAS' != jQuery(d).get(0).tagName
          ) {
            c.ea.find('li').each(function () {
              jQuery(this)
                .find('a')
                .css({ width: c.cc, top: c.cc / 3 })
            })
          } else {
            var d = jQuery(this).offset().left + jQuery(this).outerWidth() / 2,
              e = jQuery(this).offset().top + jQuery(this).outerHeight() / 2,
              d = c.distance(d, e, c.ij, c.jj),
              d = (1 - Math.min(1, Math.max(0, d / c.Hl))) * c.Fl + c.cc,
              e = jQuery(this).find('a').find('canvas').data('origwidth'),
              g = jQuery(this).find('a').find('canvas').data('origheight'),
              f = d / e
            e &&
              g &&
              (eb.browser.msie || (eb.browser.safari && 5 > eb.browser.Zb)
                ? (jQuery(this)
                    .find('a')
                    .animate({ height: g * f, width: d, top: d / 3 }, 0),
                  jQuery(this)
                    .find('a')
                    .find('canvas')
                    .css({ height: g * f, width: d, top: d / 3 }),
                  (c.pt = c.Je))
                : jQuery(this)
                    .find('a')
                    .css({ width: d, top: d / 3 }))
          }
        }
      })
    }
    jQuery(c.toolbar.M).css('visibility', 'visible')
    c.ea && c.ea.css({ 'z-index': 9, 'pointer-events': 'none' })
    c.J.Va.animate({ opacity: 1 }, 300)
    c.J.gr && c.expandOutline()
  }
  this.dispose = function () {
    c.Ca.turn('destroy')
    delete c.Ca
  }
  this.kh = function () {
    c.Ca = null
  }
  this.switchMode = function (d, g) {
    c.Ca && c.Ca.turn('destroy')
    c.Ca = null
    'Portrait' == d || 'SinglePage' == d
      ? ((c.ne = c.N.height()),
        (c.ne = c.ne - jQuery(c.M).outerHeight() + 20),
        c.N.height(c.ne))
      : ((c.sh = 0 != g % 2 ? g - 1 : g),
        (c.ne = null),
        c.N.css({
          left: '0px',
          top: '0px',
          position: 'relative',
          width: c.N.parent().width() + 'px',
          height: c.N.parent().height() + 'px',
        }),
        c.Yk())
    'FlipView' == c.I &&
      'FlipView' != d &&
      ((c.config.document.MinZoomSize = 1),
      jQuery(c.pages.L).turn('destroy'),
      c.ea && c.ea.remove())
    c.pages.ye && c.pages.Gd && c.pages.Gd()
    'FlipView' != d &&
      c.config.document.nm &&
      (c.config.document.MinZoomSize = c.config.document.nm)
    'FlipView' == d &&
      ((c.scale = 1), (c.I = 'FlipView'), (c.J.enableWebGL = c.J.Ui()))
  }
  this.Ui = function () {
    return (
      c.config.document.EnableWebGL &&
      eb.browser.capabilities.Rr &&
      'Flip-SinglePage' != c.config.document.InitViewMode &&
      null != window.THREE
    )
  }
  this.gotoPage = function (d, g) {
    'FlipView' == c.I && c.pages.vp(d, g)
  }
  this.Fc = function (d) {
    if ('FlipView' == c.I) {
      1 < c.pages.Z && 1 == c.scale
        ? jQuery(c.pages.L + '_panelLeft').animate({ opacity: 1 }, 100)
        : 1 == c.pages.Z &&
          jQuery(c.pages.L + '_panelLeft').animate({ opacity: 0 }, 100)
      if (c.pages.Z < c.getTotalPages() && 1.1 >= c.scale) {
        1 < c.getTotalPages() &&
          jQuery(c.pages.L + '_panelRight').animate({ opacity: 1 }, 100),
          c.ea &&
            '1' != c.ea.css('opacity') &&
            window.setTimeout(function () {
              1.1 >= c.scale && (c.ea.show(), c.ea.animate({ opacity: 1 }, 100))
            }, 700)
      } else {
        if (
          1.1 < c.scale ||
          c.pages.Z + 2 >= c.getTotalPages() ||
          (0 != c.getTotalPages() % 2 && c.pages.Z + 1 >= c.getTotalPages())
        ) {
          jQuery(c.pages.L + '_panelRight').animate({ opacity: 0 }, 100),
            1 == c.scale &&
            0 == c.getTotalPages() % 2 &&
            c.pages.Z - 1 <= c.getTotalPages()
              ? c.ea && (c.ea.show(), c.ea.animate({ opacity: 1 }, 100))
              : c.ea &&
                c.ea.animate({ opacity: 0 }, 0, function () {
                  c.ea.hide()
                })
        }
      }
      eb.platform.touchonlydevice ||
        (window.clearTimeout(c.Lp),
        (c.Lp = setTimeout(function () {
          0 != parseInt(d) % 2 && (d = d - 1)
          var g = [d - 1]
          1 < d && parseInt(d) + 1 <= c.document.numPages && !c.fa && g.push(d)
          for (var f = 0; f < g.length; f++) {
            jQuery('.flowpaper_mark_link, .pdfPageLink_' + g[f]).stop(),
              jQuery('.flowpaper_mark_link, .pdfPageLink_' + g[f]).css({
                background: c.linkColor,
                opacity: c.dd,
              }),
              jQuery('.flowpaper_mark_link, .pdfPageLink_' + g[f]).animate(
                { opacity: 0 },
                { duration: 1700, complete: function () {} }
              )
          }
        }, 100)))
    }
  }
  this.hi = function () {
    this.H.ea &&
      ((this.Gl = this.H.ea.css('margin-left')),
      this.H.ea.animate(
        {
          'margin-left':
            parseFloat(this.H.ea.css('margin-left')) +
            0.5 * this.H.Xa.width() +
            'px',
        },
        200
      ))
  }
  this.Pm = function () {
    this.H.ea &&
      ((this.Gl = this.H.ea.css('margin-left')),
      this.H.ea.animate(
        {
          'margin-left':
            parseFloat(this.H.ea.css('margin-left')) +
            0.5 * this.H.mb.width() +
            'px',
        },
        200
      ))
  }
  this.qg = function () {
    this.H.ea &&
      this.H.ea.animate({ 'margin-left': parseFloat(this.Gl) + 'px' }, 200)
  }
  this.resize = function (d, g, f, l) {
    if (!$('.flowpaper_videoframe').length || !eb.platform.ios) {
      if (
        ((c.jc = c.nb && !c.J.$e ? c.J.Va.height() : 0),
        c.J.sl(),
        'FlipView' == c.I && c.pages)
      ) {
        var k = -1 < c.N.get(0).style.width.indexOf('%'),
          m = -1 < c.N.get(0).style.height.indexOf('%')
        k &&
          (c.Xa || c.mb) &&
          (c.N.data('pct-width', c.N.get(0).style.width), (k = !1))
        m &&
          (c.Xa || c.mb) &&
          (c.N.data('pct-height', c.N.get(0).style.height), (m = !1))
        k ||
          !c.N.data('pct-width') ||
          c.Xa ||
          c.mb ||
          (c.N.css('width', c.N.data('pct-width')), (k = !0))
        m ||
          !c.N.data('pct-height') ||
          c.Xa ||
          c.mb ||
          (c.N.css('height', c.N.data('pct-height')), (m = !0))
        c.N.css({
          width: k
            ? c.N.get(0).style.width
            : d - (c.Xa ? c.Xa.width() : 0) - (c.mb ? c.mb.width() : 0),
          height: m ? c.N.get(0).style.height : g - 35,
        })
        d = c.N.width()
        g = c.N.height()
        ;(k && m) ||
          (d - 5 < jQuery(document.body).width() &&
          d + 5 > jQuery(document.body).width() &&
          g + 37 - 5 < jQuery(document.body).height() &&
          g + 37 + 5 > jQuery(document.body).height()
            ? (c.T.css({ width: '100%', height: '100%' }),
              c.J.$e &&
                jQuery(jQuery(c.N).css('height', jQuery(c.N).height() + 'px')))
            : (null != f && 1 != f) ||
              c.T.css({
                width:
                  d + (c.Xa ? c.Xa.width() : 0) + (c.mb ? c.mb.width() : 0),
                height: g + 37,
              }))
        c.pages.resize(d, g, l)
        c.ea &&
          c.N &&
          ((c.Hd =
            jQuery(c.N).offset().top +
            jQuery(c.pages.L).height() -
            jQuery(c.T).offset().top +
            c.jc +
            (c.pages.pb ? c.pages.pb : 0)),
          c.ea.css({
            top:
              c.Hd -
              (c.ea.find('.flowpaper_fisheye_panelLeft').offset().top -
                jQuery(c.ea).offset().top) +
              c.ea.find('.flowpaper_fisheye_panelLeft').height() / 2,
          }),
          (c.ce = 0.25 * c.N.height()))
        for (d = 0; d < c.document.numPages; d++) {
          c.pages.$a(d) &&
            ((c.pages.pages[d].Am = !0), (c.pages.pages[d].va = !1))
        }
        window.clearTimeout(c.Sr)
        c.Sr = setTimeout(function () {
          c.vc()
          c.pages.Na()
        }, 350)
      }
    }
  }
  this.setCurrentCursor = function () {}
  this.Qq = function (c, d) {
    var f = this.J,
      l = new jQuery.Deferred()
    !f.H.document.FilesBlobURI ||
    ('backgroundImage' != c && 'brandingLogo' != c)
      ? l.resolve()
      : 'backgroundImage' == c || 'brandingLogo' == c
      ? f.H.document.FilesBlobURI(d, !0).then(function () {
          l.resolve()
        })
      : l.resolve()
    l.then(function () {
      'brandingUrl' == c && (f.O.config.document.BrandingUrl = d)
      if ('brandingLogo' == c) {
        if ((f.O.config.document.BrandingLogo = d) && 0 < d.length) {
          var k = new Image()
          jQuery(k).bind('load', function () {
            var c = 150 < this.width ? 150 : this.width
            f.O.T.append(
              String.format(
                "<div class='flowpaper_custom_logo'><a href='#' data-brandingUrl='{1}'><img src='{0}' border='0' width='{2}'></a></div>",
                f.H.document.FilesBlobURI
                  ? f.H.document.FilesBlobURI(f.O.config.document.BrandingLogo)
                  : f.O.config.document.BrandingLogo,
                f.O.config.document.BrandingUrl
                  ? f.O.config.document.BrandingUrl
                  : '#',
                c
              )
            )
            f.O.T.find('.flowpaper_custom_logo').bind(
              'click touchstart',
              function (c) {
                jQuery(f.O.N).trigger(
                  'onExternalLinkClicked',
                  $(this).find('a').attr('data-brandingUrl')
                )
                c.preventDefault && c.preventDefault()
                c.stopImmediatePropagation()
                c.returnValue = !1
              }
            )
          })
          jQuery(k).attr(
            'src',
            f.H.document.FilesBlobURI
              ? f.H.document.FilesBlobURI(f.O.config.document.BrandingLogo)
              : f.O.config.document.BrandingLogo
          )
        } else {
          f.O.T.find('.flowpaper_custom_logo').remove()
        }
      }
      if (
        'backgroundColor' == c ||
        'backgroundAlpha' == c ||
        'stretchBackground' == c ||
        'backgroundImage' == c
      ) {
        if (
          ('backgroundColor' == c && (f.backgroundColor = d),
          'backgroundAlpha' == c && (f.jf = d),
          'stretchBackground' == c && (f.sk = d),
          'backgroundImage' == c &&
            (f.backgroundImage = f.H.document.FilesBlobURI
              ? f.H.document.FilesBlobURI(d)
              : d),
          f.backgroundImage)
        ) {
          FLOWPAPER.authenticated &&
            (f.backgroundImage = FLOWPAPER.appendUrlParameter(
              f.backgroundImage,
              FLOWPAPER.authenticated.getParams()
            )),
            f.sk
              ? (jQuery(f.O.N).css('background-color', ''),
                jQuery(f.O.N).css('background', ''),
                jQuery(f.O.T).css({
                  background: "url('" + f.backgroundImage + "')",
                  'background-size': 'cover',
                }),
                jQuery(f.O.N).css('background-size', 'cover'))
              : (jQuery(f.O.N).css('background', ''),
                jQuery(f.O.T).css({
                  background: "url('" + f.backgroundImage + "')",
                  'background-color': f.backgroundColor,
                }),
                jQuery(f.O.N).css('background-size', ''),
                jQuery(f.O.N).css('background-position', 'center'),
                jQuery(f.O.T).css('background-position', 'center'),
                jQuery(f.O.N).css('background-repeat', 'no-repeat'),
                jQuery(f.O.T).css('background-repeat', 'no-repeat'))
        } else {
          if (f.backgroundColor && -1 == f.backgroundColor.indexOf('[')) {
            ;(k = R(f.backgroundColor)),
              (k =
                'rgba(' +
                k.r +
                ',' +
                k.g +
                ',' +
                k.b +
                ',' +
                (null != f.jf ? parseFloat(f.jf) : 1) +
                ')'),
              jQuery(f.O.N).css('background', k),
              jQuery(f.O.T).css('background', k),
              f.O.nb || jQuery(f.Va).css('background', k)
          } else {
            if (f.backgroundColor && 0 <= f.backgroundColor.indexOf('[')) {
              var l = f.backgroundColor.split(',')
              l[0] = l[0].toString().replace('[', '')
              l[0] = l[0].toString().replace(']', '')
              l[0] = l[0].toString().replace(' ', '')
              l[1] = l[1].toString().replace('[', '')
              l[1] = l[1].toString().replace(']', '')
              l[1] = l[1].toString().replace(' ', '')
              k = l[0].toString().substring(0, l[0].toString().length)
              l = l[1].toString().substring(0, l[1].toString().length)
              jQuery(f.O.N).css('background', '')
              jQuery(f.O.T).css({
                background: 'linear-gradient(' + k + ', ' + l + ')',
              })
              jQuery(f.O.T).css({
                background: '-webkit-linear-gradient(' + k + ', ' + l + ')',
              })
              eb.browser.msie &&
                10 > eb.browser.version &&
                (jQuery(f.O.N).css(
                  'filter',
                  "progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorStr='" +
                    k +
                    "', endColorStr='" +
                    l +
                    "');"
                ),
                jQuery(f.O.T).css(
                  'filter',
                  "progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorStr='" +
                    k +
                    "', endColorStr='" +
                    l +
                    "');"
                ))
            } else {
              jQuery(f.O.T).css('background-color', '#222222')
            }
          }
        }
      }
      'shadowAlpha' == c &&
        ((f.Pf = f.H.Pf = d),
        jQuery('.flowpaper_zine_page_left').css(
          'background-image',
          '-webkit-gradient(linear,left bottom,right bottom,color-stop(0.93, rgba(255,255,255,0)),color-stop(1, rgba(125,124,125,' +
            f.Pf +
            ')))'
        ),
        jQuery('.flowpaper_zine_page_right').css(
          'background-image',
          '-webkit-gradient(linear,right bottom,left bottom,color-stop(0.93, rgba(255,255,255,0)),color-stop(1, rgba(125,124,125,' +
            f.Pf +
            ')))'
        ),
        f.J.enableWebGL && f.H.pages.Gd())
      if ('panelColor' == c || 'navPanelBackgroundAlpha' == c) {
        'panelColor' == c && (f.rb = d),
          'navPanelBackgroundAlpha' == c && (f.Lf = d),
          f.rb
            ? (jQuery(f.toolbar.M).css('background-color', f.rb),
              jQuery(f.toolbar.M).css('border-color', f.rb),
              f.$e &&
                jQuery(f.toolbar.M + '_wrap').css('background-color', f.rb))
            : eb.platform.touchonlydevice
            ? !jQuery(toolbar_el).attr('gradients') ||
              (jQuery(toolbar_el).attr('gradients') &&
                'true' == jQuery(toolbar_el).attr('gradients'))
              ? jQuery(f.toolbar.M).addClass('flowpaper_toolbarios_gradients')
              : jQuery(f.toolbar.M).css('background-color', '#555555')
            : jQuery(f.toolbar.M).css('background-color', '#555555'),
          (k = R(f.rb)),
          jQuery(f.H.pages.L + '_panelLeft').css(
            'background-color',
            'rgba(' + k.r + ',' + k.g + ',' + k.b + ',' + f.Lf + ')'
          ),
          jQuery(f.H.pages.L + '_panelRight').css(
            'background-color',
            'rgba(' + k.r + ',' + k.g + ',' + k.b + ',' + f.Lf + ')'
          )
      }
      'linkColor' == c &&
        ((f.linkColor = d),
        (f.O.linkColor = f.linkColor),
        jQuery('a.flowpaper_interactiveobject_documentViewer').css(
          'background-color',
          f.linkColor
        ),
        f.Fc(f.O.getCurrPage()))
      'linkAlpha' == c &&
        ((f.dd = d),
        (f.O.dd = f.dd),
        jQuery('a.flowpaper_interactiveobject_documentViewer').css(
          'opacity',
          f.dd
        ),
        f.Fc(f.O.getCurrPage()))
      'arrowColor' == c &&
        ((f.O.Cb = d),
        (f.O.J.Cb = d),
        f.O.ea
          .find('.flowpaper_fisheye_leftArrow')
          .We(f.O.Oh, f.O.J.Cb ? f.O.J.Cb : '#AAAAAA'),
        f.O.ea
          .find('.flowpaper_fisheye_rightArrow')
          .Rd(f.O.Oh, f.O.J.Cb ? f.O.J.Cb : '#AAAAAA'),
        (k = jQuery(f.O.pages.L + '_arrowleft').css('border-bottom')),
        (k = parseInt(k.substr(0, k.indexOf('px')))),
        jQuery(f.O.pages.L + '_arrowleft').We(k, f.O.Cb),
        jQuery(f.O.pages.L + '_arrowright').Rd(k, f.O.Cb),
        f.O.J.Tg &&
          ((k = jQuery(f.O.pages.L + '_arrowleftbottom').css('border-bottom')),
          (k = k.substr(0, k.indexOf('px'))),
          jQuery(f.O.pages.L + '_arrowleftbottom').We(k, f.O.Cb),
          jQuery(f.O.pages.L + '_arrowleftbottommarker').$j(
            k,
            f.O.Cb,
            jQuery(f.O.pages.L + '_arrowleftbottom')
          ),
          jQuery(f.O.pages.L + '_arrowrightbottom').Rd(k, f.O.Cb),
          jQuery(f.O.pages.L + '_arrowrightbottommarker').ak(
            k,
            f.O.Cb,
            jQuery(f.O.pages.L + '_arrowrightbottom')
          )))
      'enablePageShadows' == c &&
        ((f.O.vd = d),
        f.O.vd
          ? (jQuery('.flowpaper_zine_page_left_noshadow')
              .addClass('flowpaper_zine_page_left')
              .removeClass('flowpaper_zine_page_left_noshadow'),
            jQuery('.flowpaper_zine_page_right_noshadow')
              .addClass('flowpaper_zine_page_right')
              .removeClass('flowpaper_zine_page_right_noshadow'))
          : (jQuery('.flowpaper_zine_page_left')
              .addClass('flowpaper_zine_page_left_noshadow')
              .removeClass('flowpaper_zine_page_left'),
            jQuery('.flowpaper_zine_page_right')
              .addClass('flowpaper_zine_page_right_noshadow')
              .removeClass('flowpaper_zine_page_right')),
        f.O.vd
          ? jQuery('.flowpaper_shadow_disabled')
              .removeClass('flowpaper_shadow_disabled')
              .addClass('flowpaper_shadow')
          : jQuery('.flowpaper_shadow')
              .removeClass('flowpaper_shadow')
              .addClass('flowpaper_shadow_disabled'),
        jQuery(window).trigger('resize'))
      if ('arrowSize' == c) {
        f.O.J.eg = f.O.pages.qa = f.O.eg = d
        jQuery(window).trigger('resize')
        var k = f.O.pages,
          l = f.O.J.Cb ? f.O.J.Cb : '#AAAAAA',
          p = k.zf()
        jQuery(k.L + '_arrowleft').We(k.qa - 0.4 * k.qa, l)
        jQuery(k.L + '_arrowright').Rd(k.qa - 0.4 * k.qa, l)
        jQuery(k.L + '_arrowleft').css({
          left: (k.qa - (k.qa - 0.4 * k.qa)) / 2 + 'px',
          top: p / 2 - k.qa + 'px',
        })
        jQuery(k.L + '_arrowright').css({
          left: (k.qa - (k.qa - 0.4 * k.qa)) / 2 + 'px',
          top: p / 2 - k.qa + 'px',
        })
      }
    })
  }
  this.Xo = function (c, d) {
    var f = this.J
    d ? jQuery('.flowpaper_' + c).show() : jQuery('.flowpaper_' + c).hide()
    'txtPageNumber' == c &&
      (d
        ? jQuery('.flowpaper_lblTotalPages').show()
        : jQuery('.flowpaper_lblTotalPages').hide())
    'txtSearch' == c &&
      (d
        ? jQuery('.flowpaper_bttnFind').show()
        : jQuery('.flowpaper_bttnFind').hide())
    'firstLastButton' == c &&
      ((f.O.J.Tg = d),
      f.O.J.Tg
        ? (jQuery(f.O.pages.L + '_arrowleftbottom').css('opacity', 1),
          jQuery(f.O.pages.L + '_arrowleftbottommarker').css('opacity', 1),
          jQuery(f.O.pages.L + '_arrowrightbottom').css('opacity', 1),
          jQuery(f.O.pages.L + '_arrowrightbottommarker').css('opacity', 1))
        : (jQuery(f.O.pages.L + '_arrowleftbottom').css('opacity', 0),
          jQuery(f.O.pages.L + '_arrowleftbottommarker').css('opacity', 0),
          jQuery(f.O.pages.L + '_arrowrightbottom').css('opacity', 0),
          jQuery(f.O.pages.L + '_arrowrightbottommarker').css('opacity', 0)))
    if ('toolbarstd' == c) {
      var l = f.O.pages.zf(),
        k = f.O.J.Va.height()
      jQuery(f.O.pages.L + '_parent').css('padding-top', '')
      jQuery(f.O.pages.L + '_parent').css('margin-top', '')
      f.Wf = d
      f.O.pages.pb =
        (f.O.oc && !f.O.J.qb) || 0 == k ? (f.N.height() - l) / 2 : 0
      f.O.pages.pb =
        0 == f.O.pages.pb && f.O.nb && !f.O.oc && 0 < k && !f.O.J.qb
          ? (f.N.height() - l) / 2 - k
          : f.O.pages.pb
      f.O.nb || f.O.J.qb
        ? 0 < f.O.pages.pb &&
          !f.O.J.qb &&
          jQuery(f.O.pages.L + '_parent').css(
            'padding-top',
            f.O.pages.pb + 'px'
          )
        : jQuery(f.O.pages.L + '_parent').css('margin-top', '2.5%')
      jQuery(window).trigger('resize')
    }
    'navPanelsVisible' == c &&
      ((f.Mf = d),
      f.Mf
        ? (jQuery(f.O.pages.L + '_panelLeft').css('opacity', 1),
          jQuery(f.O.pages.L + '_panelRight').css('opacity', 1))
        : (jQuery(f.O.pages.L + '_panelLeft').css('opacity', 0),
          jQuery(f.O.pages.L + '_panelRight').css('opacity', 0)))
    'fisheye' == c &&
      ((f.qb = d),
      (l = f.O.pages.zf()),
      (k = f.O.J.Va.height()),
      jQuery(f.O.pages.L + '_parent').css('padding-top', ''),
      jQuery(f.O.pages.L + '_parent').css('margin-top', ''),
      (f.O.pages.pb =
        (f.O.oc && !f.O.J.qb) || 0 == k ? (f.N.height() - l) / 2 : 0),
      (f.O.pages.pb =
        0 == f.O.pages.pb && f.O.nb && !f.O.oc && 0 < k && !f.O.J.qb
          ? (f.N.height() - l) / 2 - k
          : f.O.pages.pb),
      f.O.nb || f.O.J.qb
        ? 0 < f.O.pages.pb && !f.O.J.qb
          ? (jQuery(f.O.pages.L + '_parent').css('margin-top', ''),
            jQuery(f.O.pages.L + '_parent').css(
              'padding-top',
              f.O.pages.pb + 'px'
            ))
          : jQuery(f.O.pages.L + '_parent').css('padding-top', '')
        : (jQuery(f.O.pages.L + '_parent').css('padding-top', ''),
          jQuery(f.O.pages.L + '_parent').css('margin-top', '2.5%')),
      f.qb
        ? jQuery('.flowpaper_fisheye').css('visibility', '')
        : jQuery('.flowpaper_fisheye').css('visibility', 'hidden'),
      jQuery(window).trigger('resize'))
  }
  window[this.O.Oe].setStyleSetting = this.Qq
  FLOWPAPER.setStyleSetting = function (c, d) {
    $FlowPaper('documentViewer').setStyleSetting(c, d)
  }
  window[this.O.Oe].enableDisableUIControl = this.Xo
  FLOWPAPER.enableDisableUIControl = function (c, d) {
    $FlowPaper('documentViewer').enableDisableUIControl(c, d)
  }
  window[this.O.Oe].changeConfigSetting = this.Ho
  window[this.O.Oe].loadUIConfig = function (c) {
    var d = this
    jQuery('#' + d.Ma + '_wrap').remove()
    d.Toolbar = d.T.prepend(
      "<div id='" +
        d.Ma +
        "' class='flowpaper_toolbarstd' style='z-index:200;overflow-y:hidden;overflow-x:hidden;'></div>"
    ).parent()
    d.J.Va = d.oc
      ? jQuery('#' + d.Ma)
          .wrap(
            "<div id='" +
              d.Ma +
              "_wrap' style='" +
              (d.nb ? 'position:absolute;z-index:50;' : '') +
              "text-align:center;width:100%;position:absolute;z-index:100;top:-70px'></div>"
          )
          .parent()
      : jQuery('#' + d.Ma)
          .wrap(
            "<div id='" +
              d.Ma +
              "_wrap' style='" +
              (d.nb ? 'position:absolute;z-index:50;' : '') +
              "text-align:center;width:100%;'></div>"
          )
          .parent()
    d.J.im(c, function () {
      d.toolbar.bindEvents(d.N)
      d.toolbar.Qc = null
      d.toolbar.Wk(d.config.document.MinZoomSize, d.config.document.MaxZoomSize)
    })
  }
}
window.FlowPaper_Resources = function (f) {
  this.H = f
  this.N = this.H.N
  this.na = {}
  this.na.pn = ''
  this.na.Vn = ''
  this.na.Pn = ''
  this.na.vn = ''
  this.na.Un = ''
  this.na.Zn = ''
  this.na.Xn = ''
  this.na.Nn = ''
  this.na.Mn = ''
  this.na.Cn = ''
  this.na.qn = ''
  this.na.sn = ''
  this.na.Wn = ''
  this.na.Fn = ''
  this.na.zn = ''
  this.na.Sn = ''
  this.il =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL4AAABTCAMAAAAWcE3zAAAC7lBMVEUAAAD////////////////////////qdiT/////////////////////////////+uz////////////////////RtGz////////////////////q3mD////////////XTy/////aPBn+01r////////////////////PQg3////9qzP9yUj9zlP////tdVLLJgP6kS3////JLQX6exj4xnTgNQT5mkA6iq3UtKbWmp41gZ7ir3pmjHO9v3HekWeUi2SdrGHTUF6qWFq9JVrDNVhgLVHviUb+1l/yJAB4SIHqa0P+5F/+hwn9bgv////9zT/////8w023EgDAQySqGQDIOgb+1mH9mjP3zlHILwX+pQ7ENQb+oyrNRRD7fxzefGH90DzJUBnvGgD+21/0jETuZzrbYCvocDf+01T1RQPYNAL8yWfpQizKURn+kiHdVSDqbyzqi1L4UBL90T/aaC3+3mH7SgDJPAG0HQD8TAHHTiTVNSDfGwD2GQDZqadHiJXGOVr+oTL4sF7lFQD6UAXcf1XuFQDLTQqttmifcl/hrbP8vF/fTR9hLVH////sdQD2FwDACgDqRDD+2Vz8uVb1HQDfJwD9kS/XUzHaNwHHNgDiIQDYNgzbc1PbZDT8bQHmJgDfHQD8vFnYSADaXwDaPwL7XgH5VwDBEwDspTb8hxPWHgDTFADbXinbRhj7ZQHGLQD90WjgZUXTYzfGJgDVbELcUSP7ehDqbgXpXwP7TgHbZCv8dAPCHQD5mTnraDnCURbIQQHZMAHIGwDdbU/SYi3rmSnlGwD8zlHQXSfss1b7klD7ozn4bi3ukyH7jx/aYBvKSQD8wWP7qEncbCvQVjr5eDHWKwXpFgD8oEfVZjvsozHrYTH7mSvpPCPpNA3wq0HTVxnuRgT7iwHDTir6fAHRHQDrsGHjWjnuijfPPAPhrbP8qlLwnEbNSzDvulz2fz/0kzXlcSjiUwD/PQD7s0/9NADRWUjtfyrhRQRjg2wtAAAAjnRSTlMA3Aqk+u0lCdX1fhvks3IFZBWvLhATzbt5XZT+i041FTwd/sWFq51HMiA/HGNU/q5gaEclmnVO/v7+/v7+/v7+/v7+/v7+/tVeO/z5jXlsU0Ms/v39zLGspIp2bGhcQ/63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'
  this.zo =
    'data:image/png;base64,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'
  this.sq = function () {
    var c = this.H,
      d = this
    jQuery('.flowpaper_tbloader').hide()
    jQuery('.flowpaper_floatright').show()
    eb.platform.touchdevice ||
      (2 == jQuery('.flowpaper_floatright').length &&
        jQuery('.flowpaper_floatright').is(':visible') &&
        jQuery('.flowpaper_bttnI').children(0).attr('src'))
    c.Jj = new Image()
    jQuery(c.Jj).bind('load', function () {
      jQuery(d).trigger('onPostinitialized')
    })
    c.Jj.src = c.Ce
  }
  this.initialize = function () {
    var c = this.H,
      d = this
    c.T.prepend(
      String.format(
        "<div id='modal-I' class='modal-content'><p><a href='https://flowpaper.com/?ref=FlowPaper' target='_new'><img src='{0}' style='display:block;width:100px;heigh:auto;padding-bottom:10px;' border='0' /></a></p>FlowPaper  3.6.1. Published using the <a href='https://flowpaper.com/flipbook-maker/'>FlowPaper Flipbook Maker</a>. Developed by Devaldi Ltd.<br/><br/><a href='https://flowpaper.com/flipbook-maker/' target='_new'>Click here for more information about this PDF flipbook</a></div>",
        'data:image/png;base64,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'
      )
    )
    var e = String.format(
      "<div class='flowpaper_floatright flowpaper_bttnI' style='display:none'><img src='{0}' /></div>",
      c.resources.na.pn
    )
    c.about = FLOWPAPER.about = function () {
      jQuery('#modal-I').smodal()
    }
    eb.platform.touchdevice || jQuery(c.toolbar.M).append(e)
    jQuery(c.toolbar.M)
      .find('.flowpaper_bttnI')
      .bind('click', function () {
        jQuery('#modal-I').smodal()
      })
    jQuery(c.toolbar.M).bind('onProgressChanged', function (d, e) {
      1 == e && jQuery(c.M).find('.flowpaper_bttnI').show()
    })
  }
  this.na.Qn =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAdCAYAAAAgqdWEAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wDCAAZMw/s7MUAAAPsSURBVEjHvVffTyJXFP4Ogq4D4ccMlAimqxiXl5I0G6P/wJZmq131tfvcTbr/QbP/zbbvW7fafehu9RXTNiHUiE9gJQQVVkdWhDhzTx/44cAMA+xqTzK5cOfm3O9+5zvn3CEYLJvNcrVaRa1WgxACd2UulwterxeKokCSJAQCAQIAai9IpVI8Pj4OWZYxNTWFu7ZcLodisYhoNIpgMAhZlskJANvb2+zz+RCbm+MWQDYC7WPcGsnmP/WMnfezsRhkWUY2mwVz8xVls1lWVRXxeBxutwc9QPqBGwbsMMZnZ+/p4OAAsdkYnKqqIhqNYlKSWLCw3WxzcxO/vHqFYYGsra9jZWXFkpm2+fx+DoVCVHlfgaPRaCAYDjMTYdDzUUcfwu/M3ByrqgqnruuA6HtS6hp5VCQw+iYb/9A0DU4AoLaCzPoYRdDWp2EeBLfj19mkUvRmCFtkycjUMAQbfPdjpUNEE8wNOCsWOuLj0XkhHkxoNzOGXSyY+cQsZthmk4kZiKGAQ7vWRsKhXWsDfHdbSzNsCtPFxQXevPmN/slksLi4RN8+eYKJexMjgZm4NwEmpl9fv8buboq+SCTw+PE38Hq9/cPEbIb/808vkU6nAQBHhSMwCySTSSwsLGBsbGxg7HRdhyzLYBY4Khzh5OQEf7x7h0q5jB+eP+/PDJhMmkmn051JoQt8qF7C6XTC7wu0wdv2JiIH168apGkaC110fKXTaeN+VtnEdtmEvb09vHjxo7WQ+s91it11j9a4Oy+7w0Q22UREEEJHo6F/UkckopvuzDbZxMRWFbc5wYzbMKMfi4QxCrhvO7gTMwBji6JHNEAPt4yGLPdyDirzxljflmbYrujZdG0wM2ZmZvHVo0cAEcYcDojmelsGHUTQhQCY8fvbt8jnc1ad3Kprm7NJURSqVCoAgIAcwJcPH370HfjPv/+iNhhFUXrKjLnOmE753dOn2NjYwL+Hh02KwdhNpbC1tQW3JBHMNz/DkRiXtRotLy9jcWmJqLX28/v3sbq62lvXOp8vTpfLhdPjYwRDn3V5fvAgjmffP8OHy0tIkgQWjFKphEq5jMqQOimVSmDBWFtbRzL5NTxuN3x+P1h0q+Ywn4PX6wVlMhmu1+sIhUII+BXTFcxUeCw+E/rFys5He81p+RiFQgHz8/NwJBIJqtfrOD8/x9l5BUzMzaLEYGI2ju2nvYbBzXJKDG49aM1x72h4h9bvk9MSisUiIpEIotHoTeB3dnbY4/FgcnIS09PTDAaBDIcyXtmo6zpGXXPG/20fN2OHxPxhHqqqIhwOIx6Pk6no7O/vc7VaxdXV1f/yrR0MBhGJRDoY/gMkxwIzT9ZCwQAAAABJRU5ErkJggg%3D%3D'
  this.na.wn =
    'data:image/gif;base64,R0lGODlhBgAqAKEBAJmZmf///////////yH+GkNyZWF0ZWQgd2l0aCBHSU1QIG9uIGEgTWFjACH5BAEKAAIALAAAAAAGACoAAAIkBBJmuOjPTlIR2hlbu05TzHWSMkohSFYn+m2h561svMKlbEcFADs%3D'
  this.na.Tn =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAdCAYAAAAgqdWEAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wDCAAYCdD7BDYAAAMVSURBVEjHvVfdSuNQEP6mJEJjaG2aUtsorC3SKxHfwYfwB8HFfYPFB/ERll3cl7AoiBfe2gXjjbogZV1XbShoLWlmL5rEY9qkUVMHhsn5yZw53/yccwgCmabJ7XYbDw8PcBwH4yJZlpHJZJDP56EoCnK5HAEAeROOj495YmICmqahVCph3HRxcYFmswnDMKDrOjRNIwkA9vf3OZvNolKtsmsgi4aGELuSItoUkP74XKUCTdNgmiaY+0NkmiZbloVarYbJSRUBQ8KMi2NsHOL7+zs6OztDZa4CybIsGIaBtKKww87Qxb5sbQUXHjCEiPwdLi8vY2V1NRIZj7JTU1woFOj27happ6cn6MUiMxHCONYWmSHLMr5ub2Nvbw8/d3cpSqfIn6pVtiwLUq/XA5xQyF/lCkVRoCoKNE1DvV4HAKysrlOELr/Ptm2kAICY2WUI0v+OS91uF5IkYXFxEQBQr9fx4/s3CPqC7K8FABIAMDnBDBkWxCPJtm1Ml6axtr7GqqrSyckJDg8PYds2Nj9vcggqfiyl+i3ymAISDIrtql6vh1+NX2AQLS0tYWNjA7Ozszg6OvJ0iiyuST4yYEQgE99NjuNgZ2fHzy5ZlmHbtqeGQ2LH7+8bE1n531ZOmBndblewdPQ/bsywuHJSBe2lccQjM7ZvDDtjP4virOHGDEVlU2LQxIqZ59gao5sQ000UmU3JEMXNJiG4Ig+1ZLw0gAoHApg5xE2JIcQ81E084KbA0UzvLjLDoRlZxKTX1dj3BHDMokcf4KaQ03/QTQKCY8smJsSuM4lcrt5QZ0h8vqRkWcbN9TXY4VBOxJgI/Zfn58hkMqBGo8GdTgeFQgG5qfyAM4OFB0OeCWHvlSgd3pybf9e4urrC/Pw8UgsLC9TpdNBqtXDfuoV7/3SBZRalx94cBvfLNzHYZbh9HJTCGNzvvzd/0Gw2US6XYRjGc305ODhgVVWRTqcxMzPDYBBI2BQLgNCL6xi96BPbno5n6YN4+fsSlmWhWCyiVqvRQICenp5yu93G4+Pjh7y1dV1HuVz2bfgP5BfYXgA24coAAAAASUVORK5CYII%3D'
  this.na.$n =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAdCAYAAAAgqdWEAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wDCAAUJ6CYRvUAAAPBSURBVEjHxZfNThtXFMd/Z/wh4VAbPKYIG1mNkeUVUkpC+gY067as0k0CPEfUXdRnaHbNl8kD2Nl4JFasmqgLjJIIwsJqQsGMLAEGz5wu7DFjYzupXZorXZ25H+fec8/5/8+9I/hKuVzWWq3G8fExrutyVSUUChGNRjFNk0gkwuTkpACIN2Fzc1PD4TDxeJyZmRmuuuzs7FCpVEilUiQSCeLxuAQBSqWSxmIxMnNz2jJQ/Yb2KdqSMqAtXbI9fj2TIR6PUy6XUW0OSblcVtu2yeVyXLs2Tpch/Yz7HGM/p2i1eijb29tkrmcI2rZNKpViLBJRV5s4cV1XDcMQgPX1dYqFQjOmIt4pOgz57dEjVldWLu3km8/3d+6wvLysgLiui2EYAMQmJnRqakoODg8w6vU6ielpVRFUBEcVCQRQEfL5vBQLBbLZLOFwuL3wpeNJbyepKuFwmGw2S7FQIJ/Pi4oggQCOKt6e38zNqW3bGI7jgIt41cAQXOTF8zwvi0VM0+Te/VUikUh/Zw8gXiQS4d79VUzT5GWxyIvneXDBwOjYt9FoYACIqrYqoqrPnj6hWCwAsLBwk1AgoPV6ve+G0sdjAPV6nVAgwMLCTQCKxQLPnj7B26slAQg23dw+mj7+/bFsbGyQyWS48e0NXVpaIhAI0Gg0+qNQ3L6AbjQaTMRj+uNPP/BVdJxXf7wSyyrhOA3u/ny3g4VGsyVeFcuySKfTrKytsbh4m/rZubx5+w7HcQZwXPoyy3Ec3rx9J/Wzc1m8/Z2srK2RTqexLKu9p6cf7MgQLcru7e3xy4MHnJ+fSy/29M04veDkuvz68GGbXaFQ6OJg2pmfgr0A6DjOQE/8GwB3s+vs7KyvXgsz7aMNlch8+sPoSacxOtqlOKx+t14LMzJamtchb4amXidmlBHDxJBhokeYREe7AIeEjKfX5RlR+TRJrwTA/qeFB2DVkcKkQxrTVJRuAI/2NhkewHI5z4z6QvqP9ILerT1KmGTIMEmvMPm8PBSbRkszF2ySUqmkC7du8aXLn69fEwyFQux/+EBi6usvZsj73R2i0ShGLBajWq1yVD1EVNqVHhJfW7r6e7UHreH1/b3/kWq1immaGPPz83J6esrR0RHVowNa789mshZVv/SqN0fRZhoVRVuVVp92S98Yre+P+39RqVRIJpOkUqkLnluWpePj44yNjTE7O6sogvj+m9QHbOl4jklHn7/trXEh24zdfb+LbdtMT0+Ty+XkEpW3tra0VqtxcnLyv/xrJxIJkslk24Z/AJjcAKCwx1DkAAAAAElFTkSuQmCC'
  this.na.Yn =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAdCAYAAAAgqdWEAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wDCAAWLXJ7zWkAAAL7SURBVEjHzVdRTxpBEP7G3JGABOTuCJHzoUIMT77VtOkP8keYCpEafoR/5nxqJPbNB88XtYkhtRblQgKY6E0fuDsW2Fs51KaTbJa9b3Z3dma+2YUgiOu63O/3MRgM4Ps+3kt0XUcul4NpmshkMigUCgQAFCq0221OpVIwDAPr6+t4b7m6ukKn04Ft27AsC4ZhkAYAjuNwPp9HpVrlwEAWDY0RDnpSjGmmj/DNSgWGYcB1XTCPIXJdlz3PQ61Ww+pqFjOGxBm3iLGLCD883NPFxQUqmxVonufBtm2kMxn22U+y2as8E0p+bY2LxSJ177vQHh8fYZVKzJLdDup1AoBut0sAYJomAKDRbIoYAowEDAAowCiYR41mU7YNPlSrfHpyQtrz8zPgJ3S5St9PNC8aPz09QQMAYhZdGIUoPPXu7i4A4OjoCKF+6C0JpponC3VkkAYATP5sHihzRtBPirHEK5EjxsZM9p3yTCqVmjpZOGbQspjsgNOeASORZ8AqjrGKf7J1I8+Q4zj8+dMXjrFYVWfwBtSO1jlpfw/CRCwN07fmgZTa+/WGiE1RO8Ck1N6vN/BimJiTXYoq/WUxIWdImjNxFAUTlsSUOaNN8mo+TOo8XAp7mU0Uw6Y4ihLH0/4FbAHPEMsYoCherCiIjATY1F7kOA5/3NnhmDC9+xMiXOfH6WmUwCSLYat1KKX23t5XarUOMUPtEIMKi8uXCbWXOM5bY0IC/1e3drK7iUmV3EpsoTojXSL+9mVSYMp5cTmj6zpWdF3H3e0t2Oe5FnvCV2Cydn15iVwuBzo7O+PRaIRisYjCmjkXTFnhoQVf5ao1Qp27P7e4ubnB1tYWVra3t2k0GqHX6+Gh1wUT87g4MZiYxT5soQ6DxyWXGBw0BN94thcwBL9/3/1Cp9NBuVyGbduT+nJ8fMzZbBbpdBobGxsMBoGEQwnPweA7ID4Tw2/iOFxj0kdOvP55Dc/zUCqVUKvVaK7onJ+fc7/fx3A4/Cf/tS3LQrlcjmz4C6V4EUpXdwN6AAAAAElFTkSuQmCC'
  this.na.Bn =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAdCAYAAAAgqdWEAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wDCAAWE7Ma0MIAAAM+SURBVEjHxVdNT9tAEH0TESQCSsBxGhFzKOGQE5eKHxbshL8Q2/yocOWIesCcgEtUSsGxIvEhgaeHeDfrzTpJW1FGenrrnTe7Y3u86yUoFkURTyYTPD09IU1TfJSVy2VUq1XU63VUKhXs7OwQAJAQnJ+f8/r6OizLwu7uLj7arq+vMRqN4DgObNuGZVm0BgDD4ZBrtRraBwecJchqogXGGdOCa9JY+vfbbViWhSiKwDx1URRFnCQJOp0ONje3oCVSlNwqya5iHMePdHV1hfZ+G2tJksBxHGxUKpxy+ieT/dOTEVbb3uZGo0EPjw8ovb6+wm42mYnwWfh6cMBJkqD0/v4OpCADYGAB8rpd0vop60dBLJnGEXh7e0MJAIiZM0BhFPTBc7vI4uYAAJ7bNfoMYDWuBABMqQBrrLfhesezopn6chA+1zs2+hWo4/MsGZAAaZxre66nVTCRDtXvuR6ZNIbxSSYDlmCNAWaAgZ7rmr4nFv4shnVJz3Xzfs7Nl4ubJpMuAqHnuebPPPPn9Abree6SOaDWDAuQxuj13eKFRtFl7cK1qdd3SdPPxU2T4dSIfs9buPCZYhZZv+cVzqXUDAmw4JN+f4XFXOpnj3eJnfT76ny5uBJytcUkOAhPl+cy04v20v0qCE/V+XJx2aInwSqHwenCO1X0or1QHwanqn4urqQU4lzxMjEFYbjkLeVR/ERCLiheGZcVsDRSWPTDDwI2F7DUibbxNflBgNmOI/VQ5lIXPbmFQmG1Tb4fmh7NPPRE/NCs0+eaFfBqGGgJmTSqDfxw5bGVAl591/YHgVLA5l0bAPxB8Le7tgRrbMTAn9aQpmOm6U0O/MA0FheMK+NoOBzyt6MjfLZ9v7jAWrlcxv3dHezGl09L5PbmGtVqFaVarYY4jjGOH0FMEjAwlGvS+k3Xi8YQfb/ufyKOY9TrdZQODw/p5eUF4/EY8fgBWSWLxZ5Vlj8gmYahLaNZHBSfZMWHrP3z/gdGoxFarRYcx5n9mZ2dnfHW1hY2Njawt7fHYBBIOWawcsQg5SsW/aJPvRZjzFgeVW5ub5AkCZrNJjqdDs2dYS4vL3kymeD5+fm/nLVt20ar1ZI5/AZC6tu9dBzKcQAAAABJRU5ErkJggg%3D%3D'
  this.na.On =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAdCAYAAAAgqdWEAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wDCAAVHAiInpAAAAMSSURBVEjHzVfbTuJQFF2bUBOJcimMoPgwI4n8XmmJ8wXQwlz8JE184gvsEzjJjEaYDENINBrtnof2HA71lJtx4iGLda6rq7uHfShBKb7v83Q6xd3dHYIgwFsVwzCQzWZRLBaRyWRQKBQIAEhM6PV6vLW1BdM0sb+/j7cug8EA19fXqFarKJVKME2T0gBwdnbGuVwOR7UaRwZZNZpQOGJa0KYYy/FPR0cwTRO+74M5HEr5vs+ZTAaVSgUEIgJxxIjqKkNpk5jXsCyo7ehDGlbHkc8XuF6vYzgc4tfPX0y9Xo+r1So+7O1x7M5Jc3fxqMBuNGT/99NTXjUyqs6g36fHx0ekHh4eUCqXmYmwLlQjwtgmOh9rNZ5MJkg9Pz8DAUgDaFiAHMvS7inHspCwlnQ6Ak9PT0gBADFzBCiMhD44trVwZzu2BXX+AkhdAKEZpkCAYxyvw3YaK/10bach1iZB1eeZGZAAxXiu7tjOWrnEsR2K1uug6pM0A5bgGAPMAANN294ouTVtW9VWdDHfL80Ei0BoOja9Jts2HXvJNcJ56XDPsC63yPLl6zddnlnLIIOT5sv+0AwHeA8lHdqmeGZ987NJp5OOQrjwMS0L75I2JYzrH9Nsy7yHyBDrBOTCzycny6KwNDKdbjcpKjIUYdKbFVJY9MPrdPg1G9PrdDA7cRgKxLXUpCePUCis1snzupsZ8bpQ9OKYXWt2HKwGd01DrtddWVuaWefU9tzOahFxO5ue2hIcYy1cb/Eecr2OTosTdJkJ6qnNpAE0LD7U9jytkbbnIWEt6XQEDMNAyjAMjG5vwQGvjVbbnTPSarsb6Vz1+8hms0jlcjmMx2P8Hf8J//NHgIahtAVarTBC7ZY3N2+Zhuj7PRpiPB6jWCyGCeni4oJ3d3eRz+eRL5hh4hPfDJI8S1XqnJf5NOm9IlYfjW5xc3ODSqWC4+NjklLn5+e8s7OD7e1tHB4ezkwIyZdmhCjN9alt9UZIHoEEAFc/rjCZTFAul1Gv1+lFCr+8vOTpdIr7+/v/8q5dKpVwcHAgPfwDmoUpP5Jd2SsAAAAASUVORK5CYII%3D'
  this.na.ao =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAdCAYAAAAgqdWEAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wEAwEtNTlGiyEAAAOcSURBVEjHxZfNbttGEMd/Q0ty5MhULFF1LPkQy0B1MuDXiN+hybXIpS1a9yGaB2lO6SPYQHPxJTmazsXOoURiVaYIAZZUWJweRFKstKTktmkXWCx3ZjmcnfnPB4XUcF1XB4MBt7e3hGHI5xrFYhHbtqnX62xsbLC1tSUAEh84OzvTUqlErVZjZ2eHzz0uLy/xPI9Wq4XjONRqNSkAnJycaLVapb2/r5GCmlY0Y2i0Ss5e5taEv9duU6vVcF0X1SlLXNfVIAjodDo8fFhhTpEs5ZJ9GIaoKqqKiGBZFiKyqoHU92/k4uKC9l6bQhAEtFotyhsbGmq48LGllhFERBBEp0SV6Ka5lolH9dEjbTQa0rvpYY3HY5ztbVUR/q/5ZH9fgyCgMJlMIMy0gphuk2E1WfJu7jt3d3cUAGK7GvCxFDNv3vzK619eA3B4eMizr54nhyaTCWtra8tcncgtAKiE8xGihigxYsb76EkqT8WyFCBkgpUN5oUonCozU85kBclQSABsu5oQHMeJZQnAWqGYeROTqwpzdzdYRrNSiQKUSqVEWKm0Dqpp/tJoWrAM4UqKGzE4CAbJ82g0glD+dlaOMKN5bsrV0n3vJgTP+21e1rJoWnSTqtk06Wj48fh4WWgDcPzD90b6Ty9frmYZVIyY0RCw5N+pjDOT5WNGyXCTzHhP9vawbZv3FxfU63VK6+uMRyN832c4HCaSm80m6w8e8Md4TK/X48tOh7hMrOQmyYimNbES3ouvX5huw6tXP8vbd28BaDQafPvNdxgTpq4YTSpqyrggSFQ8Za4SJ2ce7zyGd1NipVJJA3jRU1Flz8phEYCzy4Gq5pYDUsJFhJmoxWhK8bLLASpZyUQkzqhq9nP3upsKbQ8TNMIwnPY5UxBmRmUhr/isMsrlcvK8ublprhuWtdI3/nHVXviw3utqpqqdV5vyO72nR0fy9Ogo2euKPXBenrl3cxXjwOT/yNBxBK7UXBWLRQrFYpHup084jS/uhRVB0DDfJbqiyz5cXWLbNla1WsX3ffr+DaKSTAwrqb3M0U37PBkx7ffuNb7vU6/XsQ4ODmQ0GtHv9/H7vWlvL5r0+ek1nvEZRafpWxSNJhFN59cUj+j5uvsRz/NoNpu0Wq1Zfjk9PdVKpUK5XGZ3d1fRqScS8KXawb9kHU3qmC7sYxmzNcHJ1YcrgiBge3ubTqcjC6A6Pz/XwWDAcDj8T/61Hceh2WwmOvwJjz3t/SbNLJ0AAAAASUVORK5CYII%3D'
  this.na.bo =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAdCAYAAAAgqdWEAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wEAwEuF8cLmQYAAALYSURBVEjHzVfNbtpAEP7G2CQQZCe2KYqdQwCpPuW9qtzTh2geCq55gpheSC6oSUqMhRSgCjs9+AcHvMbkp+lIq/Xs2rOz334zsyZkxPd9nk6neHp6ghACHyWapkHXdViWhXq9jqOjIwIASl64urriarUK0zRxfHyMj5bhcIjRaATXdWHbNkzTJBUAer0eG4aBTrfLsYOcdVQiHPdUoNNan863Ox2Ypgnf98EcTZHv+xyGITzPw8FBA2uOyJxLdSEEmBnMDCKCoiggorIAcRA80mAwQKfdgRqGIVzXRa1eZ8FiY7GtyBCIiEAgjgaZ4p0WIpOIcXjIzWaTxo9jKIvFAnarxUyEz2qn3S6HYQh1uVwCQooC5e1Gghpt+bbwm+fnZ6gAkOCaw4+tnHmjvLCjAgCTWI8QzokSWTTl7ZZLOLIRhZEzK+fyUJAZpxILYQenImQyS+Ugw7JUEitMBfrWaNpABgIlN7kLb3eXmDNcdExlj+I10bR5TMz50CyXS1QqFQDA94uLN23/x+VlOWTAlMsZFgCU94jgF/AXc4YhOSZazZ2229B1HT8HA1iWhereHhbzOYIgwGw2Sy07joO9/X38WSwwHo/x1fOQlIlSx0SSaKqQks6dfzuX5ZhyVZtLRhMT5xlAVP1YRk7e+aTiyi6zExP4XcrB1mhaLVNQDsBEWxLLm5KJECK650QklNpR8Rq8dxRSlFJr/I9Vu6g2fcwduCjPfPrlStM0qJqm4eHuDnbzCz5Lbm+G0HUdimEYCIIAk+ARxJQ25PTI6LQ2nqcX2UjGfj/cIwgCWJYF5ezsjObzOSaTCYLJOLrbE6f3/GyftOQdBkfpmxgcN8RjvN5n5hA/3z/8wmg0guM4cF13lV/6/T43Gg3UajWcnJwwGATKkC9zHYzHE/rRi7GsnthY9SlPbm5vEIYhWq0WPM+jDVJdX1/zdDrFbDb7J//atm3DcZzUh7/MEqJMe2pkgAAAAABJRU5ErkJggg%3D%3D'
  this.na.Dn =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAdCAYAAAAgqdWEAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wDCAAUOVqXe5YAAAPASURBVEjHvVfLbttGFD1HpIxIMWRboqxY9EYKBMELbws4yKZ110m2ydIfEHQXoB9QIIsa7Q80u/Qn2trwKkaXTiE5BSoHMAQ/ZD0gwNRC4u2CIsXHkJILpwMIw+Ednrlz77kPEb7RbDZlOBzi9vYWtm3jS410Oo1cLodCoYBsNou1tTUCAN0Nx8fHsrS0hHw+j42NDXzp0Wq10G63YZomDMNAPp+nDgAHBweysrKC6uPHMlVQ/IrGDJnOTFgzNHvySrWKfD6PZrMJEUfEZrMpg8EA9XodDx8uI6RInHKLKLvIkF6vy9PTU1QrVeiDwQCmaSKTzYotHk/k70+f+Mu7d7zpdECSIgLSO//OiogICoaBvb091Go17/3K6qoUi0XedG/Ao6Mj+WpnR8Iff//mDa3RCJVKxQPzKRM4BIBSFv6u1Woh8+ABfnj7Nuxq/PnhA/XJZALY0Zt2u11sbW3h9evv7o20P/+0j0ajAcwC1Tt3PB5DBwC611Pwg47oXjlD77ggjg4AQjtsNgFA27YhtGVONEXOipPZtk0RcTEjUegoA0JpGRICxoEnWUYtI8EZZmSvHrpjwDIQACJxqWS6ECasg3lGpowQdb5ylEnK/DbnXJh3MJiLqX495Ywo3eT4VxZ1RdyaM946YR7CDBFY7DgXx8r+UxRxesEYTN1zs4ozQdl91CaSDGOGoynBTbhfNykwg25iTDQRRDxl7m4ZgiQjmCHLUFQAEHrk5qKJLbFYMhIUAZwpgdXlQNc0txAuUg7muknXNCeaksoBRJ0R+/0+Wv+0MJnYnEwmd0wms6FpGlKpFHq9vqOIqFsRPa7IfP3NLv74/Tfs7/84t09xbxvXRvhbjd3db2P9G1u1Xzx7jlKxKFdXV9R0PXANzTU3puUirIQIXEuKr0Uora9jZ+fJvKodjSZqKT55+jSOI6Jw2cI9sACJeYZxJd9/QCqVwng8xq/v3/Py4gKZTMZPRpKEZVkoPXqEl69eUdd1JYaKe+l0Gno6ncb15SWM4roiqwV1FNupuH99/AjLsmL50el0AHH2KzFC4/NZC7lcDjw5OZHRaIRisYi11UIkdkWRVLhg5kvCcPdcdy5xfn6OWq2G1Pb2NkejEfr9Pnr9GwhFnKQkEDrNhzu7P3ePQBwG0Elk7nfwybzZJ8P0+er6Au12G+VyGaZpzsLg8PBQlpeXkclksLm5KXAsHGiMfFfyFxAG3vnXLsZs9ox49vkMg8EApVIJ9XqdkaTTaDRkOBzCsqz/5b+2YRgol8ueDv8CmAsGVvaUUeAAAAAASUVORK5CYII%3D'
  this.na.rn =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAdCAYAAAAgqdWEAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wDCAARF/s2ghwAAAMOSURBVEjHvVfRTuJAFD2XUBOQgJQSIvVhhRie/LbVAv7BSmE/Sl999sH6om5iyLouSkOimGjvPrSdDmVaCsadyc3pTKenZ+7cuZ0SpOI4Ds9mM7y8vMDzPHxV0TQN5XIZtVoNxWIR1WqVAIDCARcXF7y1tQVd17G7u4uvLre3txiPxzBNE4ZhQNd1ygPA2dkZVyoVtNptDgSyLDShcICU0qYYivv7rRZ0XYfjOGD2b5HjOOy6LjqdDra3S4gJSRKXRWyWws/PT3R9fY3Wfgs513VhmiYKxSJ7foWEacaxceyxx0dH3xHj4ITx8NhDZWeH6/U6Jk8T5N7e3mA0GsxE+KxZx8cEYO3nvrXb7Lou8h8fH4CX6HKKIRLa6FpHUZ+nfJZS+PH+/o48AFAYQcvxkSlmrO7x4hsE3eqYkXnyvlu9+A5hxS5R7qau1V2aMZOXRc3SLvTFROJUXqAEQdSzrASVtM5OW/SM9CqFZ1iZSnpda1UGSs0zqnyVlwJulXBx3etb6TPf8EsSxAynLdNC6fe6q6PS58uym5aXiTnbVE76/WxbhL3NPQOmtN3kCznprZHkaaOYyfktUSmGog5HP7NrUXORijfsB4Ccn6SEcQwXbDTMJiiBixN4fYWhGCZRISFUfcPRKFMAZzTBG4mJCkkY9ssIZoY9HHJ6ADMkDhlJ5pHeFS2T9AmFhEjoA5jItkfpAZzNIl7hmQ1tkCBoEy4pgIUPISES+hba9mCoCGDOaoJHCmBhHMM043DcwB6qVokVyEk80jIpYz0t78TH4dS2N8kzgkfTNOQ0TcPjwwPY40/bj9OBL2bN5+5ublAul0GXl5c8n89Rr9dR3aktHcFYcaChjP8raRzhmMe/D7i/v8fBwQFyh4eHNJ/PMZ1O8TydIIjkcPFYxtDCMYxYGg2eg3RPoHQPwfWfx98Yj8doNpswTTM6kZ2fn3OpVEKhUMDe3h6DQSBpUtJxMOgXx7qFPrkdckQonHj36w6u66LRaKDT6dDSF/Tq6opnsxleX1//y7+2YRhoNptCwz/m1JcKyxmy4QAAAABJRU5ErkJggg%3D%3D'
  this.na.tn =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAdCAYAAAAgqdWEAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wDCAATL+ECWAAAAAMHSURBVEjHvVdRT+JAEP6GFBOQgJRyROrDCTE8+dvEAvcPTgr+KH312QfrE5oYcp6n0pAoJtq5B7btsm2BHnpDvsxud/djdmc6syVI4jgOT6dTvLy8wPM8fJVks1kUi0VUKhXk83mUy2UCAPInXFxc8NbWFnRdx+7uLr5aRqMRxuMxTNOEYRjQdZ00ADg7O+NSqYRGs8nCQJYNTRAWmpb0SdHB+H6jAV3X4TgOmOdD5DgOu66LVquF7e0CFEOSjFvH2HWEn5+f6Pr6Go39BjKu68I0TeTyefbmP0g6Ee32kTqPY/qqjvCWdna4Wq3i8ekRmbe3Nxi1GjMR0gAArONjSrsuDt+bTXZdF5mPjw/AA8UAMRpBX0in3YY0hxbmRHWUR+D9/R0ZACBmFoCkkfAM5Eecb5DVhjK+LgJeAHNjmDwfrGi1HUAVq3Osrl8FmZ9DY0A+SNFqO0CcdKyOvH4VZH4KjAEHYEUDzFhsc5gxYqRrWUlcvMi78J/hyShBpYCUtugvkW7HWsEZgzBm2AcpOhGrpNuzKIYzjpeYOHQTs5ca60iv20nFJ2KGfLCik7Gm/Oj1ZO443uCoNYgYkorYZ9UdAMBgeOrzJ3EGz7V50otU4k8xaDg49XdKMVU9Uv01EcBxVVpeSEm7ST6RIfNqf8r/JdwUpnf6jCuEPRiAmWnFhiI8mghgSth16pOx7eHSpLiMR5Odtqn07eFGXJpftTd1k90fzEtFyptexE1SmP3T29S3B+CUd+Dktyk56lfGzIltJ+WRdQKY5M8XLZvN4uH+Hkb1W2of/zzpg73NI+72ZoRisQi6vLzk2WyGarWK8k4l4kz1jBETPEnfK8s4/DkPf+5xd3eHg4MDZA4PD2k2m2EymeB58ghx/xTOm19efB1cQMQcBs/T90I1F31VS2MQ7d8PvzAej1Gv12GaZphfzs/PuVAoIJfLYW9vj8EgkLQp+XpHkAsILTyT+z5HqINDvLm9geu6qNVqaLVaFAmqq6srnk6neH19/S/f2oZhoF6vBzb8BbU1MGBi7Vj6AAAAAElFTkSuQmCC'
  this.na.An =
    'data:image/png;base64,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'
  this.na.as = ''
  this.na.bs = ''
  this.na.ds = ''
  this.na.js = ''
  this.na.gs = ''
  this.na.ms = ''
  this.na.ns = ''
  this.na.ps = ''
  this.na.ls = ''
  this.na.qs = ''
}
window.dlInfoBox = function () {
  jQuery('#modal-I').smodal()
}
var Pa = (function () {
    function f() {}
    f.prototype = {
      fe: function (c, d) {
        if (d.hb && (d.Fj || d.create(d.pages.L), !d.initialized)) {
          c.Hb = d.Hb = c.config.MixedMode
          c.cn = !1
          c.dn = !1
          var e = d.da
          0 == jQuery(e).length && (e = jQuery(d.Oc).find(d.da))
          if ('FlipView' == d.I) {
            var f =
              0 != d.pageNumber % 2
                ? 'flowpaper_zine_page_left'
                : 'flowpaper_zine_page_right'
            0 == d.pageNumber && (f = 'flowpaper_zine_page_left_noshadow')
            d.H.vd ||
              (f =
                0 != d.pageNumber % 2
                  ? 'flowpaper_zine_page_left_noshadow'
                  : 'flowpaper_zine_page_right_noshadow')
            jQuery(e).append(
              "<div id='" +
                d.ja +
                "_canvascontainer' style='height:100%;width:100%;position:relative;'><canvas id='" +
                c.Ta(1, d) +
                "' style='position:relative;left:0px;top:0px;height:100%;width:100%;" +
                (c.cn
                  ? ''
                  : 'background-repeat:no-repeat;background-size:100% 100%;background-color:#ffffff;') +
                "display:none;' class='flowpaper_interactivearea flowpaper_grab flowpaper_hidden flowpaper_flipview_canvas flowpaper_flipview_page' width='100%' height='100%' ></canvas><canvas id='" +
                c.Ta(2, d) +
                "' style='position:relative;left:0px;top:0px;width:100%;height:100%;display:block;background-repeat:no-repeat;background-size:100% 100%;background-color:#ffffff;display:none;' class='flowpaper_border flowpaper_interactivearea flowpaper_grab flowpaper_rescale flowpaper_flipview_canvas_highres flowpaper_flipview_page' width='100%' height='100%'></canvas><div id='" +
                d.ja +
                "_textoverlay' style='position:absolute;z-index:11;left:0px;top:0px;width:100%;height:100%;' class='" +
                f +
                "'></div></div>"
            )
            if (eb.browser.chrome || eb.browser.safari) {
              eb.browser.safari &&
                (jQuery('#' + c.Ta(1, d)).css(
                  '-webkit-backface-visibility',
                  'hidden'
                ),
                jQuery('#' + c.Ta(2, d)).css(
                  '-webkit-backface-visibility',
                  'hidden'
                )),
                jQuery('#' + d.ja + '_textoverlay').css(
                  '-webkit-backface-visibility',
                  'hidden'
                )
            }
            eb.browser.mozilla &&
              (jQuery('#' + c.Ta(1, d)).css('backface-visibility', 'hidden'),
              jQuery('#' + c.Ta(2, d)).css('backface-visibility', 'hidden'),
              jQuery('#' + d.ja + '_textoverlay').css(
                'backface-visibility',
                'hidden'
              ))
          }
          d.initialized = !0
        }
      },
      Uq: function (c, d) {
        if (
          ('FlipView' == d.I && 0 == jQuery('#' + c.Ta(1, d)).length) ||
          ('FlipView' == d.I && d.va)
        ) {
          return !1
        }
        'FlipView' != d.I ||
          null != d.context ||
          d.Lc ||
          d.va ||
          (d.md(), (d.Lc = !0))
        return !0
      },
      Tq: function (c, d) {
        return (
          1 == d.scale ||
          (1 < d.scale && d.pageNumber == d.pages.Z - 1) ||
          d.pageNumber == d.pages.Z - 2
        )
      },
      ic: function (c, d, e, f) {
        1 == d.scale && eb.browser.safari
          ? (jQuery('#' + c.Ta(1, d)).css(
              '-webkit-backface-visibility',
              'hidden'
            ),
            jQuery('#' + c.Ta(2, d)).css(
              '-webkit-backface-visibility',
              'hidden'
            ),
            jQuery('#' + d.ja + '_textoverlay').css(
              '-webkit-backface-visibility',
              'hidden'
            ))
          : eb.browser.safari &&
            (jQuery('#' + c.Ta(1, d)).css(
              '-webkit-backface-visibility',
              'visible'
            ),
            jQuery('#' + c.Ta(2, d)).css(
              '-webkit-backface-visibility',
              'visible'
            ),
            jQuery('#' + d.ja + '_textoverlay').css(
              '-webkit-backface-visibility',
              'visible'
            ))
        if ('FlipView' != d.I || 0 != jQuery('#' + c.Ta(1, d)).length) {
          if ('FlipView' != d.I || !d.va) {
            if ('FlipView' == d.I && 1 < d.scale) {
              if (
                d.pageNumber == d.pages.Z - 1 ||
                d.pageNumber == d.pages.Z - 2
              ) {
                PDFJS.aj &&
                  jQuery(c).trigger('UIBlockingRenderingOperation', {
                    aa: c.aa,
                    pq: !0,
                  })
                var h = 2236
                3 < d.scale && (h = 3236)
                4 < d.scale && (h = 4236)
                5 < d.scale && (h = 5236)
                6 < d.scale && (h = 6236)
                7 < d.scale && (h = 7236)
                magnifier = h * Math.sqrt(1 / (d.Fa() * d.Pa()))
                d.ra.width = d.Fa() * magnifier
                d.ra.height = d.Pa() * magnifier
              } else {
                ;(c.fj = !1),
                  (d.ra.width = 2 * d.Fa()),
                  (d.ra.height = 2 * d.Pa()),
                  (d.va = !0),
                  jQuery('#' + d.Vb).Pc(),
                  c.Ul(d),
                  eb.platform.touchdevice &&
                    (null != c.zj && window.clearTimeout(c.zj),
                    (c.zj = setTimeout(function () {}, 1500))),
                  null != f && f()
              }
            } else {
              d.Hb && c.pageImagePattern && !d.$i
                ? (d.ed && d.ed(c.pa(d.pageNumber + 1), c.pa(d.pageNumber + 2)),
                  d.dimensions.loaded ||
                    c.Kc(
                      d.pageNumber + 1,
                      !0,
                      function () {
                        c.Wc(d)
                      },
                      !0,
                      d
                    ),
                  (d.fo = !0),
                  c.cn
                    ? ((d.ga = new Image()),
                      jQuery(d.ga).bind('load', function () {
                        d.jt = !0
                        d.Bf = !0
                        d.Ef = this.height
                        d.Ff = this.width
                        c.Sq(d)
                        d.dimensions.xa > d.dimensions.width &&
                          ((d.dimensions.width = d.dimensions.xa),
                          (d.dimensions.height = d.dimensions.Ga))
                        d.Kb = !1
                        c.$d()
                      }),
                      jQuery(d.ga).attr('src', c.pa(d.pageNumber + 1)))
                    : null == d.ga
                    ? ((d.Kb = !0),
                      (d.ga = new Image()),
                      jQuery(d.ga).bind('load', function () {
                        window.clearTimeout(d.Ne)
                        jQuery(d.gc).remove()
                        jQuery(d.ra).css(
                          'background-image',
                          "url('" + c.pa(d.pageNumber + 1) + "')"
                        )
                        d.Kb = !1
                        c.$d()
                      }),
                      jQuery(d.ga).bind('error', function () {
                        jQuery.ajax({
                          url: this.src,
                          type: 'HEAD',
                          error: function (h) {
                            if (404 == h.status || 500 <= h.status) {
                              ;(d.$i = !0),
                                (d.Kb = !1),
                                (d.fo = !0),
                                (d.va = !1),
                                1 == d.pageNumber &&
                                  d.H.pages.Gd &&
                                  d.H.pages.Gd(),
                                c.ic(d, e, f)
                            }
                          },
                          success: function () {},
                        })
                      }),
                      jQuery(d.ga).bind('error', function () {
                        window.clearTimeout(d.Ne)
                        jQuery(d.gc).remove()
                        jQuery(d.ra).css(
                          'background-image',
                          "url('" + c.pa(d.pageNumber + 1) + "')"
                        )
                        d.Kb = !1
                        c.$d()
                      }),
                      jQuery(d.ga).attr('src', c.pa(d.pageNumber + 1)),
                      (d.Ne = setTimeout(function () {
                        d.va ||
                          (jQuery(d.gc).remove(),
                          jQuery(d.ra).css(
                            'background-image',
                            "url('" + c.pa(d.pageNumber + 1) + "')"
                          ),
                          (d.Kb = !1),
                          c.$d())
                      }, 3000)),
                      (c.zj = setTimeout(function () {
                        d.Kb &&
                          ('none' == jQuery(d.ra).css('background-image') &&
                            jQuery(d.ra).css(
                              'background-image',
                              "url('" + c.pa(d.pageNumber + 1) + "')"
                            ),
                          (d.Kb = !1),
                          c.$d())
                      }, 6000)))
                    : d.Kb ||
                      ('none' == jQuery(d.ra).css('background-image') &&
                        jQuery(d.ra).css(
                          'background-image',
                          "url('" + c.pa(d.pageNumber + 1) + "')"
                        )),
                  c.wf(d, f))
                : !c.Ba && c.cb
                ? ((magnifier = 1236 * Math.sqrt(1 / (d.Fa() * d.Pa()))),
                  (d.ra.width = d.Fa() * magnifier),
                  (d.ra.height = d.Pa() * magnifier))
                : ((d.ra.width = 1 * d.Fa()), (d.ra.height = 1 * d.Pa()))
            }
          }
        }
      },
      Mr: function (c, d) {
        return 'FlipView' == d.I
      },
      lk: function (c, d) {
        'FlipView' == d.I &&
          (1 < d.scale
            ? ((d.Vb = c.Ta(2, d)), (d.sg = c.Ta(1, d)))
            : ((d.Vb = c.Ta(1, d)), (d.sg = c.Ta(2, d))))
      },
      wf: function (c, d) {
        'FlipView' == d.I &&
          (1 < d.scale
            ? requestAnim(function () {
                var e = jQuery('#' + c.Ta(2, d)).get(0)
                eb.browser.safari &&
                  c.dn &&
                  (jQuery(e).css(
                    'background-image',
                    "url('" + e.toDataURL() + "')"
                  ),
                  (e.width = 100),
                  (e.height = 100))
                jQuery('#' + c.Ta(1, d)).Yb()
              })
            : (jQuery('#' + c.Ta(1, d)).Pc(),
              jQuery('#' + c.Ta(2, d)).Yb(),
              eb.browser.safari &&
                c.dn &&
                jQuery('#' + c.Ta(2, d)).css('background-image', '')),
          (d.Hb && c.pageImagePattern && 1 == d.scale) || jQuery(d.gc).remove())
        PDFJS.aj &&
          jQuery(c).trigger('UIBlockingRenderingOperationCompleted', {
            aa: c.aa,
          })
        c.$d()
      },
    }
    CanvasPageRenderer.prototype.Zh = function (c) {
      return 'FlipView' == c.I ? 1 : 1.4
    }
    CanvasPageRenderer.prototype.Sq = function (c) {
      var d = c.ra
      if (
        1 == c.scale &&
        d &&
        (100 == d.width || jQuery(d).hasClass('flowpaper_redraw')) &&
        d
      ) {
        d.width = c.Fa()
        d.height = c.Pa()
        var e = d.getContext('2d'),
          f = document.createElement('canvas'),
          h = f.getContext('2d')
        f.width = c.ga.width
        f.height = c.ga.height
        h.drawImage(c.ga, 0, 0, f.width, f.height)
        h.drawImage(f, 0, 0, 0.5 * f.width, 0.5 * f.height)
        e.drawImage(
          f,
          0,
          0,
          0.5 * f.width,
          0.5 * f.height,
          0,
          0,
          d.width,
          d.height
        )
        jQuery(d).removeClass('flowpaper_redraw')
        1 == c.scale &&
          (jQuery(c.da + '_canvas').Pc(), jQuery(c.da + '_canvas_highres').Yb())
        1 < c.pageNumber &&
          jQuery(c.da + '_pixel').css({ width: 2 * c.Fa(), height: 2 * c.Pa() })
      }
      jQuery(c.gc).remove()
    }
    CanvasPageRenderer.prototype.He = function (c, d, e) {
      var f = this
      if (
        null != f.pageThumbImagePattern &&
        0 < f.pageThumbImagePattern.length
      ) {
        for (
          var h = 0,
            l = null,
            k = c.getDimensions(0)[0].width / c.getDimensions(0)[0].height,
            m = c.J.fa,
            p = 1;
          p < d;
          p++
        ) {
          h += m ? 1 : 2
        }
        0.5 > k &&
          f.config.JSONDataType &&
          c.getDimensions(0)[0].xa < c.getDimensions(0)[0].Ga &&
          (k = 0.7)
        var n = 1 == d || m ? h + 1 : h,
          t = new Image()
        jQuery(t).bind('load', function () {
          var l = d % 10
          0 == l && (l = 10)
          var q = c.T.find('.flowpaper_fisheye')
            .find(String.format('*[data-thumbIndex="{0}"]', l))
            .get(0)
          q.width = e * k - 2
          q.height = e / k / 2 - 2
          var r = jQuery(q).parent().width() / q.width
          q.getContext('2d').fillStyle = '#999999'
          var p = (q.height - q.height * k) / 2,
            w = q.height * k
          0 > p && ((q.height += q.width - w), (p += (q.width - w) / 2))
          eb.browser.msie &&
            jQuery(q).css({
              width: q.width * r + 'px',
              height: q.height * r + 'px',
            })
          jQuery(q).data('origwidth', q.width * r)
          jQuery(q).data('origheight', q.height * r)
          m
            ? (q
                .getContext('2d')
                .fillRect(
                  q.width / 3,
                  p,
                  n == c.getTotalPages() ? q.width / 2 + 2 : q.width + 2,
                  w + 2
                ),
              q
                .getContext('2d')
                .drawImage(
                  t,
                  q.width / 3 + 1,
                  p + 1,
                  q.width / 1.5,
                  q.width / 1.5 / k
                ))
            : (q
                .getContext('2d')
                .fillRect(
                  1 == d ? q.width / 2 : 0,
                  p,
                  n == c.getTotalPages() ? q.width / 2 + 2 : q.width + 2,
                  w + 2
                ),
              q
                .getContext('2d')
                .drawImage(
                  t,
                  1 == d ? q.width / 2 + 1 : 1,
                  p + 1,
                  q.width / 2,
                  w
                ))
          if (
            1 < d &&
            !m &&
            h + 1 <= c.getTotalPages() &&
            n + 1 <= c.getTotalPages()
          ) {
            var B = new Image()
            jQuery(B).bind('load', function () {
              q.getContext('2d').drawImage(
                B,
                q.width / 2 + 1,
                p + 1,
                q.width / 2,
                w
              )
              q.getContext('2d').strokeStyle = '#999999'
              q.getContext('2d').moveTo(q.width - 1, p)
              q.getContext('2d').lineTo(q.width - 1, w + 1)
              q.getContext('2d').stroke()
              jQuery(c).trigger('onThumbPanelThumbAdded', {
                Uf: l,
                thumbData: q,
              })
            })
            jQuery(B).attr('src', f.pa(n + 1, 200))
          } else {
            jQuery(c).trigger('onThumbPanelThumbAdded', { Uf: l, thumbData: q })
          }
        })
        n <= c.getTotalPages() && jQuery(t).attr('src', f.pa(n, 200))
      } else {
        if (-1 < f.Ia(null) || 1 != c.scale) {
          window.clearTimeout(f.Vf),
            (f.Vf = setTimeout(function () {
              f.He(c, d, e)
            }, 50))
        } else {
          h = 0
          l = null
          k = c.getDimensions(0)[0].width / c.getDimensions(0)[0].height
          for (p = 1; p < d; p++) {
            h += 2
          }
          n = 1 == d ? h + 1 : h
          if (!f.Ba && f.cb && ((n = f.Nh(n)), n > f.Ja.numPages)) {
            return
          }
          if (!(n > f.getNumPages())) {
            var t = new Image(),
              q = d % 10
            0 == q && (q = 10)
            l = c.T.find('.flowpaper_fisheye')
              .find(String.format('*[data-thumbIndex="{0}"]', q))
              .get(0)
            l.width = e * k
            l.height = e / k / 2
            p = jQuery(l).parent().width() / l.width
            eb.browser.msie &&
              jQuery(l).css({
                width: l.width * p + 'px',
                height: l.height * p + 'px',
              })
            jQuery(l).data('origwidth', l.width * p)
            jQuery(l).data('origheight', l.height * p)
            var r = l.height / f.getDimensions()[n - 1].height
            f.Qa(null, 'thumb_' + n)
            f.Ja.getPage(n).then(function (m) {
              var t = m.getViewport(r),
                p = l.getContext('2d'),
                x = document.createElement('canvas')
              x.height = l.height
              x.width = x.height * k
              var w = {
                canvasContext: x.getContext('2d'),
                viewport: t,
                ki: null,
                pageNumber: n,
                Vi: function (h) {
                  1 != c.scale
                    ? (window.clearTimeout(f.Vf),
                      (f.Vf = setTimeout(function () {
                        f.He(c, d, e)
                      }, 50)))
                    : h()
                },
              }
              m.render(w).promise.then(
                function () {
                  var m = (l.height - l.height * k) / 2,
                    u = l.height * k
                  0 > m && ((l.height += l.width - u), (m += (l.width - u) / 2))
                  f.Qa(null, -1, 'thumb_' + n)
                  1 < d &&
                  h + 1 <= c.getTotalPages() &&
                  n + 1 <= c.getTotalPages()
                    ? -1 < f.Ia(null) || 1 != c.scale
                      ? (window.clearTimeout(f.Vf),
                        (f.Vf = setTimeout(function () {
                          f.He(c, d, e)
                        }, 50)))
                      : (!f.Ba && f.cb && (n = n - 1),
                        f.Qa(null, 'thumb_' + (n + 1)),
                        f.Ja.getPage(n + 1).then(function (h) {
                          t = h.getViewport(r)
                          var k = document.createElement('canvas')
                          k.width = x.width * (!f.Ba && f.cb ? 2 : 1)
                          k.height = x.height
                          w = {
                            canvasContext: k.getContext('2d'),
                            viewport: t,
                            ki: null,
                            pageNumber: n + 1,
                            Vi: function (h) {
                              1 != c.scale
                                ? (window.clearTimeout(f.Vf),
                                  (f.Vf = setTimeout(function () {
                                    f.He(c, d, e)
                                  }, 50)))
                                : h()
                            },
                          }
                          h.render(w).promise.then(
                            function () {
                              f.Qa(null, -1)
                              p.fillStyle = '#ffffff'
                              p.fillRect(
                                1 == d ? l.width / 2 : 0,
                                m,
                                l.width / 2,
                                u
                              )
                              1 != d &&
                                p.fillRect(l.width / 2, m, l.width / 2, u)
                              p.drawImage(
                                x,
                                1 == d ? l.width / 2 : 0,
                                m,
                                l.width / 2,
                                u
                              )
                              !f.Ba && f.cb
                                ? 1 != d &&
                                  p.drawImage(
                                    k,
                                    k.width / 2,
                                    0,
                                    k.width,
                                    k.height,
                                    l.width / 2,
                                    m,
                                    l.width,
                                    u
                                  )
                                : 1 != d &&
                                  p.drawImage(k, l.width / 2, m, l.width / 2, u)
                              jQuery(c).trigger('onThumbPanelThumbAdded', {
                                Uf: q,
                                thumbData: l,
                              })
                            },
                            function () {
                              f.Qa(null, -1, 'thumb_' + (n + 1))
                            }
                          )
                        }))
                    : ((p.fillStyle = '#ffffff'),
                      p.fillRect(1 == d ? l.width / 2 : 0, m, l.width / 2, u),
                      1 != d && p.fillRect(l.width / 2, m, l.width / 2, u),
                      p.drawImage(
                        x,
                        1 == d ? l.width / 2 : 0,
                        m,
                        l.width / 2,
                        u
                      ),
                      jQuery(c).trigger('onThumbPanelThumbAdded', {
                        Uf: q,
                        thumbData: l,
                      }))
                },
                function () {
                  f.Qa(null, -1)
                }
              )
            })
          }
        }
      }
    }
    return f
  })(),
  Oa = (function () {
    function f() {}
    f.prototype = {
      fe: function (c, d) {
        if (d.hb && (d.Fj || d.create(d.pages.L), !d.initialized)) {
          c.yb =
            !c.ua &&
            null != c.Sj &&
            0 < c.Sj.length &&
            eb.platform.touchonlydevice &&
            !eb.platform.mobilepreview
          if ('FlipView' == d.I) {
            var e =
              0 != d.pageNumber % 2
                ? 'flowpaper_zine_page_left'
                : 'flowpaper_zine_page_right'
            0 == d.pageNumber && (e = 'flowpaper_zine_page_left_noshadow')
            d.H.vd ||
              (e =
                0 != d.pageNumber % 2
                  ? 'flowpaper_zine_page_left_noshadow'
                  : 'flowpaper_zine_page_right_noshadow')
            var f = d.da
            0 == jQuery(f).length && (f = jQuery(d.Oc).find(d.da))
            c.Uh(d, f)
            c.ua && c.xe(c, d)
              ? (jQuery(f).append(
                  "<canvas id='" +
                    d.ja +
                    "_canvas' class='flowpaper_flipview_page' height='100%' width='100%' style='z-index:10;position:absolute;left:0px;top:0px;width:100%;height:100%;'></canvas><div id='" +
                    d.ja +
                    "_textoverlay' style='z-index:11;position:absolute;left:0px;top:0px;width:100%;height:100%;' class='" +
                    e +
                    "'></div>"
                ),
                (c.qq = new Image()),
                jQuery(c.qq).attr('src', c.oa))
              : c.Qb
              ? jQuery(f).append(
                  "<canvas id='" +
                    d.ja +
                    "_canvas' class='flowpaper_flipview_page' height='100%' width='100%' style='z-index:10;position:absolute;left:0px;top:0px;width:100%;height:100%;'></canvas><canvas id='" +
                    d.ja +
                    "_canvas_highres' class='flowpaper_flipview_page' height='100%' width='100%' style='display:none;z-index:10;position:absolute;left:0px;top:0px;width:100%;height:100%;background-color:#ffffff;'></canvas><div id='" +
                    d.ja +
                    "_textoverlay' style='z-index:11;position:absolute;left:0px;top:0px;width:100%;height:100%;' class='" +
                    e +
                    "'></div>"
                )
              : jQuery(f).append(
                  "<canvas id='" +
                    d.ja +
                    "_canvas' class='flowpaper_flipview_page' height='100%' width='100%' style='z-index:10;position:absolute;left:0px;top:0px;width:100%;height:100%;'></canvas><canvas id='" +
                    d.ja +
                    "_canvas_highres' class='flowpaper_flipview_page' height='100%' width='100%' style='image-rendering:-webkit-optimize-contrast;display:none;z-index:10;position:absolute;left:0px;top:0px;width:100%;height:100%;'></canvas><div id='" +
                    d.ja +
                    "_textoverlay' style='z-index:11;position:absolute;left:0px;top:0px;width:100%;height:100%;' class='" +
                    e +
                    "'></div>"
                )
            if (eb.browser.chrome || eb.browser.safari) {
              eb.browser.safari &&
                (jQuery('#' + d.ja + '_canvas').css(
                  '-webkit-backface-visibility',
                  'hidden'
                ),
                jQuery('#' + d.ja + '_canvas_highres').css(
                  '-webkit-backface-visibility',
                  'hidden'
                )),
                jQuery('#' + d.ja + '_textoverlay').css(
                  '-webkit-backface-visibility',
                  'hidden'
                )
            }
          }
          d.initialized = !0
        }
      },
      ic: function (c, d, e, f) {
        d.initialized || c.fe(d)
        if (!d.va && 'FlipView' == d.I) {
          if (
            -1 < c.Ia(d) &&
            c.Ia(d) != d.pageNumber &&
            d.pageNumber != d.pages.Z &&
            d.pageNumber != d.pages.Z - 2 &&
            d.pageNumber != d.pages.Z - 1
          ) {
            if (
              (window.clearTimeout(d.Cc),
              d.pageNumber == d.pages.Z ||
                d.pageNumber == d.pages.Z - 2 ||
                d.pageNumber == d.pages.Z - 1)
            ) {
              d.Cc = setTimeout(function () {
                c.ic(d, e, f)
              }, 250)
            }
          } else {
            1 == d.scale &&
              d.ed &&
              !c.ua &&
              d.ed(c.pa(d.pageNumber + 1), c.pa(d.pageNumber + 2))
            if (!d.va) {
              c.Cs = d.scale
              c.Qa(d, d.pageNumber)
              1 == d.scale && d.md()
              d.Kb = !0
              if (
                !d.ga ||
                d.Ip != d.scale ||
                c.xe(c, d) ||
                (!c.xe(c, d) && c.ua)
              ) {
                ;(d.Ip = d.scale),
                  (d.ga = new Image()),
                  jQuery(d.ga).data('pageNumber', d.pageNumber),
                  jQuery(d.ga).bind('load', function () {
                    d.Hp = !0
                    d.Kb = !1
                    d.Bf = !0
                    d.Ef = this.height
                    d.Ff = this.width
                    d.ec()
                    window.clearTimeout(d.Ne)
                    ;-1 < c.pageImagePattern.indexOf('.webp') &&
                      jQuery(this).attr('src').indexOf('.webp') &&
                      (c.Tp = !0)
                    c.kd(d)
                    d.dimensions.xa > d.dimensions.width &&
                      ((d.dimensions.width = d.dimensions.xa),
                      (d.dimensions.height = d.dimensions.Ga))
                  }),
                  jQuery(d.ga).bind('abort', function () {
                    window.clearTimeout(d.Ne)
                    jQuery(this).Cg(function () {
                      d.Kb = !1
                      c.Qa(d, -1)
                    })
                  }),
                  jQuery(d.ga).bind('error', function () {
                    ;(-1 < c.pageImagePattern.indexOf('.webp') || c.Zo) &&
                      !c.Tp &&
                      ((c.pageImagePattern = c.pageImagePattern.replace(
                        '.webp',
                        '.jpg'
                      )),
                      jQuery(this).attr(
                        'src',
                        jQuery(this).attr('src').replace('.webp', '.jpg')
                      ),
                      (c.Zo = !0))
                    window.clearTimeout(d.Ne)
                    jQuery(this).Cg(function () {
                      d.Kb = !1
                      c.Qa(d, -1)
                    })
                  })
              }
              1 >= d.scale
                ? jQuery(d.ga).attr('src', c.pa(d.pageNumber + 1, null, c.Qb))
                : c.yb && 1 < d.scale
                ? d.pageNumber == d.pages.Z - 1 || d.pageNumber == d.pages.Z - 2
                  ? jQuery(d.ga).attr('src', c.pa(d.pageNumber + 1, null, c.Qb))
                  : c.ua || jQuery(d.ga).attr('src', c.oa)
                : d.pageNumber == d.pages.Z - 1 || d.pageNumber == d.pages.Z - 2
                ? (!c.Qb ||
                  (-1 != jQuery(d.ga).attr('src').indexOf('.svg') &&
                    d.Up == d.scale) ||
                  c.Ia(d) != d.pageNumber ||
                  (d.pageNumber != d.pages.Z - 1 &&
                    d.pageNumber != d.pages.Z - 2)
                    ? d.tk == d.scale &&
                      (jQuery(d.da + '_canvas_highres').show(),
                      jQuery(d.da + '_canvas').hide())
                    : (jQuery(c).trigger('UIBlockingRenderingOperation', c.aa),
                      (d.Up = d.scale),
                      jQuery(d.ga).attr(
                        'src',
                        c.pa(d.pageNumber + 1, null, c.Qb)
                      )),
                  c.Qb ||
                    jQuery(d.ga).attr(
                      'src',
                      c.pa(d.pageNumber + 1, null, c.Qb)
                    ))
                : c.ua || jQuery(d.ga).attr('src', c.oa)
              d.Ne = setTimeout(function () {
                d.Hp ||
                  jQuery(d.ga).Cg(function () {
                    d.Kb = !1
                    c.Qa(d, -1)
                  })
              }, 3000)
            }
            jQuery(d.da).removeClass('flowpaper_load_on_demand')
            jQuery(d.Aa).attr('src') == c.oa && d.Bf && c.kd(d)
            null != f && f()
          }
        }
      },
      kd: function (c, d) {
        if ('FlipView' == d.I) {
          jQuery(d.da).removeClass('flowpaper_hidden')
          1 == d.scale && eb.browser.safari
            ? (jQuery('#' + d.ja + '_canvas').css(
                '-webkit-backface-visibility',
                'hidden'
              ),
              jQuery('#' + d.ja + '_canvas_highres').css(
                '-webkit-backface-visibility',
                'hidden'
              ),
              jQuery('#' + d.ja + '_textoverlay').css(
                '-webkit-backface-visibility',
                'hidden'
              ))
            : eb.browser.safari &&
              (jQuery('#' + d.ja + '_canvas').css(
                '-webkit-backface-visibility',
                'visible'
              ),
              jQuery('#' + d.ja + '_canvas_highres').css(
                '-webkit-backface-visibility',
                'visible'
              ),
              jQuery('#' + d.ja + '_textoverlay').css(
                '-webkit-backface-visibility',
                'visible'
              ))
          if (c.xe(c, d)) {
            1 == d.scale
              ? (jQuery(d.Ea).css(
                  'background-image',
                  "url('" + c.pa(d.pageNumber + 1, null, c.Qb) + "')"
                ),
                jQuery('#' + d.ja + '_textoverlay').css(
                  '-webkit-backface-visibility',
                  'visible'
                ),
                jQuery('#' + d.ja + '_textoverlay').css(
                  'backface-visibility',
                  'visible'
                ),
                c.Yc(d))
              : (d.pageNumber == d.pages.Z - 1 || d.pageNumber == d.pages.Z - 2
                  ? jQuery(d.Ea).css(
                      'background-image',
                      "url('" + c.pa(d.pageNumber + 1) + "')"
                    )
                  : jQuery(d.Ea).css('background-image', 'url(' + c.oa + ')'),
                jQuery('#' + d.ja + '_textoverlay').css(
                  '-webkit-backface-visibility',
                  'visible'
                ),
                jQuery('#' + d.ja + '_textoverlay').css(
                  'backface-visibility',
                  'visible'
                ),
                jQuery(d.da + '_canvas').hide(),
                c.yb &&
                  d.scale > d.Wg() &&
                  (d.Cc = setTimeout(function () {
                    c.hd(d)
                    jQuery('.flowpaper_flipview_canvas_highres').show()
                    jQuery('.flowpaper_flipview_canvas').hide()
                  }, 500)))
          } else {
            var e = document.getElementById(d.ja + '_canvas')
            c.ua
              ? (jQuery(d.Ea).css(
                  'background-image',
                  "url('" + c.pa(d.pageNumber + 1, null, c.Qb) + "')"
                ),
                jQuery('#' + d.ja + '_textoverlay').css(
                  '-webkit-backface-visibility',
                  'visible'
                ),
                jQuery('#' + d.ja + '_textoverlay').css(
                  'backface-visibility',
                  'visible'
                ))
              : jQuery(d.Ea).css('background-image', 'url(' + c.oa + ')')
            if (
              1 == d.scale &&
              e &&
              (100 == e.width || jQuery(e).hasClass('flowpaper_redraw'))
            ) {
              var f = e
              if (f) {
                var h = d.Fa(),
                  l = d.Pa()
                f.width = 2 * h
                f.height = 2 * l
                h = f.getContext('2d')
                h.Gg = h.mozImageSmoothingEnabled = h.imageSmoothingEnabled = !0
                h.drawImage(d.ga, 0, 0, f.width, f.height)
                jQuery(f).data('needs-overlay', 1)
                jQuery(e).removeClass('flowpaper_redraw')
                1 == d.scale &&
                  (jQuery(d.da + '_canvas').show(),
                  jQuery(d.da + '_canvas_highres').hide())
                1 < d.pageNumber &&
                  jQuery(d.da + '_pixel').css({
                    width: 2 * d.Fa(),
                    height: 2 * d.Pa(),
                  })
                jQuery(f).data('needs-overlay', 1)
                c.Yc(d)
              }
            } else {
              1 == d.scale &&
                e &&
                100 != e.width &&
                (jQuery(d.da + '_canvas').show(),
                jQuery(d.da + '_canvas_highres').hide(),
                c.Yc(d))
            }
            if (1 < d.scale && !c.ua) {
              if ((f = document.getElementById(d.ja + '_canvas_highres'))) {
                !(
                  (c.Qb && d.tk != d.scale) ||
                  (c.ua && d.tk != d.scale) ||
                  100 == f.width ||
                  jQuery(f).hasClass('flowpaper_redraw')
                ) ||
                (d.pageNumber != d.pages.Z - 1 && d.pageNumber != d.pages.Z - 2)
                  ? (jQuery(d.da + '_pixel').css({
                      width: 2 * d.Fa(),
                      height: 2 * d.Pa(),
                    }),
                    jQuery(d.da + '_canvas_highres').show(),
                    jQuery(d.da + '_canvas').hide(),
                    c.yb &&
                      jQuery(d.da + '_canvas_highres').css('z-index', '-1'))
                  : ((d.tk = d.scale),
                    (e = 1000 < d.N.width() || 1000 < d.N.height() ? 1 : 2),
                    (h = (d.N.width() - 30) * d.scale),
                    c.ua && 1 == e && (e = c.Za),
                    eb.platform.ios &&
                      (1500 < h * d.Ke() || 535 < d.kg()) &&
                      (e = 2236 * Math.sqrt(1 / (d.Fa() * d.Pa()))),
                    eb.browser.safari &&
                      !eb.platform.touchdevice &&
                      3 > e &&
                      (e = 3),
                    (h = f.getContext('2d')),
                    h.Gg ||
                    h.mozImageSmoothingEnabled ||
                    h.imageSmoothingEnabled
                      ? ((h.Gg =
                          h.mozImageSmoothingEnabled =
                          h.imageSmoothingEnabled =
                            !1),
                        c.Qb || c.ua
                          ? ((f.width = d.Fa() * e),
                            (f.height = d.Pa() * e),
                            h.drawImage(d.ga, 0, 0, d.Fa() * e, d.Pa() * e))
                          : ((f.width = d.ga.width),
                            (f.height = d.ga.height),
                            h.drawImage(d.ga, 0, 0)))
                      : ((f.width = d.Fa() * e),
                        (f.height = d.Pa() * e),
                        h.drawImage(d.ga, 0, 0, d.Fa() * e, d.Pa() * e)),
                    c.Qb
                      ? c.Op(d, f.width / d.ga.width, function () {
                          jQuery(f).removeClass('flowpaper_redraw')
                          jQuery(d.da + '_canvas_highres').show()
                          jQuery(d.da + '_canvas').hide()
                          jQuery(d.da + '_canvas_highres').addClass(
                            'flowpaper_flipview_canvas_highres'
                          )
                          jQuery(d.da + '_canvas').addClass(
                            'flowpaper_flipview_canvas'
                          )
                          c.Qa(d, -1)
                        })
                      : (jQuery(f).removeClass('flowpaper_redraw'),
                        c.ua ||
                          (jQuery(d.da + '_canvas_highres').show(),
                          jQuery(d.da + '_canvas').hide(),
                          jQuery(d.da + '_canvas_highres').addClass(
                            'flowpaper_flipview_canvas_highres'
                          ),
                          jQuery(d.da + '_canvas').addClass(
                            'flowpaper_flipview_canvas'
                          )),
                        c.yb &&
                          jQuery(d.da + '_canvas_highres').css(
                            'z-index',
                            '-1'
                          )))
              }
              d.Cc = setTimeout(function () {
                c.hd(d)
              }, 500)
            }
          }
          c.ua &&
            1 == d.scale &&
            (jQuery(d.da + '_canvas').addClass('flowpaper_flipview_canvas'),
            jQuery(d.da + '_canvas').show(),
            (f = document.getElementById(d.ja + '_canvas')),
            (h = d.Fa()),
            (l = d.Pa()),
            (e = 1.5 < c.Za ? c.Za : 1),
            f.width != h * e && c.xe(c, d)
              ? (d.va || (f.width = 100),
                f.width != h * e &&
                  c.xe(c, d) &&
                  ((f.width = h * e), (f.height = l * e)),
                jQuery(f).css({
                  width: f.width / e + 'px',
                  height: f.height / e + 'px',
                }),
                (c.Dm = !0),
                jQuery(f).data('needs-overlay', 1),
                d.Qd(f).then(function () {
                  d.ed(c.pa(d.pageNumber + 1), c.pa(d.pageNumber + 2), !0)
                }))
              : c.xe(c, d) || 1 != jQuery(f).data('needs-overlay')
              ? d.va || d.ed(c.pa(d.pageNumber + 1), c.pa(d.pageNumber + 2), !0)
              : d.Qd(f).then(function () {
                  d.ed(c.pa(d.pageNumber + 1), c.pa(d.pageNumber + 2), !0)
                }))
          d.va =
            0 < jQuery(d.Ea).length &&
            ((c.xe(c, d) &&
              -1 < jQuery(d.Ea).css('background-image').indexOf('http')) ||
              !c.xe(c, d))
        }
      },
      Gb: function (c, d) {
        d.ga = null
        jQuery(d.Ea).css('background-image', 'url(' + c.oa + ')')
        var e = document.getElementById(d.ja + '_canvas')
        e && ((e.width = 100), (e.height = 100))
        if ((e = document.getElementById(d.ja + '_canvas_highres'))) {
          ;(e.width = 100), (e.height = 100)
        }
      },
    }
    ImagePageRenderer.prototype.xe = function (c, d) {
      return c.ua &&
        (eb.platform.ios || (eb.browser.mozilla && 57 > eb.browser.version))
        ? !1
        : c.ua
        ? !0
        : (eb.platform.touchdevice &&
            (eb.platform.ge ||
              (d && d.Ff && d.Ef && 5000000 < d.Ff * d.Ef) ||
              eb.platform.android) &&
            (eb.platform.ge || eb.platform.android)) ||
          eb.browser.chrome ||
          eb.browser.mozilla ||
          c.ua ||
          (eb.browser.safari && !eb.platform.touchdevice)
    }
    ImagePageRenderer.prototype.resize = function (c, d) {
      this.Uh(d)
    }
    ImagePageRenderer.prototype.Op = function (c, d, e) {
      var f = this
      window.vi = d
      jQuery.ajax({
        type: 'GET',
        url: f.pa(c.pageNumber + 1, null, f.Qb),
        cache: !0,
        dataType: 'xml',
        success: function (h) {
          var l = new Image()
          jQuery(l).bind('load', function () {
            var f = document.getElementById(c.ja + '_canvas'),
              g = document
                .getElementById(c.ja + '_canvas_highres')
                .getContext('2d')
            g.Gg = g.mozImageSmoothingEnabled = g.imageSmoothingEnabled = !1
            var p = f.getContext('2d')
            p.Gg = p.mozImageSmoothingEnabled = p.imageSmoothingEnabled = !1
            f.width = c.ga.width * d
            f.height = c.ga.height * d
            p.drawImage(l, 0, 0, c.ga.width * d, c.ga.height * d)
            if (c.Xm) {
              n = c.Xm
            } else {
              var n = []
              jQuery(h)
                .find('image')
                .each(function () {
                  var c = {}
                  c.id = jQuery(this).attr('id')
                  c.width = S(jQuery(this).attr('width'))
                  c.height = S(jQuery(this).attr('height'))
                  c.data = jQuery(this).attr('xlink:href')
                  c.dataType = 0 < c.data.length ? c.data.substr(0, 15) : ''
                  n[n.length] = c
                  jQuery(h)
                    .find("use[xlink\\:href='#" + c.id + "']")
                    .each(function () {
                      if (
                        jQuery(this).attr('transform') &&
                        ((c.transform = jQuery(this).attr('transform')),
                        (c.transform = c.transform.substr(
                          7,
                          c.transform.length - 8
                        )),
                        (c.li = c.transform.split(' ')),
                        (c.x = S(c.li[c.li.length - 2])),
                        (c.y = S(c.li[c.li.length - 1])),
                        'g' == jQuery(this).parent()[0].nodeName &&
                          null != jQuery(this).parent().attr('clip-path'))
                      ) {
                        var d = jQuery(this).parent().attr('clip-path'),
                          d = d.substr(5, d.length - 6)
                        jQuery(h)
                          .find("*[id='" + d + "']")
                          .each(function () {
                            c.Og = []
                            jQuery(this)
                              .find('path')
                              .each(function () {
                                var d = {}
                                d.d = jQuery(this).attr('d')
                                c.Og[c.Og.length] = d
                              })
                          })
                      }
                    })
                })
              c.Xm = n
            }
            for (p = 0; p < n.length; p++) {
              if (n[p].Og) {
                for (var t = 0; t < n[p].Og.length; t++) {
                  for (
                    var q = n[p].Og[t].d
                        .replace(/M/g, 'M\x00')
                        .replace(/m/g, 'm\x00')
                        .replace(/v/g, 'v\x00')
                        .replace(/l/g, 'l\x00')
                        .replace(/h/g, 'h\x00')
                        .replace(/c/g, 'c\x00')
                        .replace(/s/g, 's\x00')
                        .replace(/z/g, 'z\x00')
                        .split(/(?=M|m|v|h|s|c|l|z)|\0/),
                      r = 0,
                      u = 0,
                      v = 0,
                      A = 0,
                      x = !1,
                      w,
                      B = !0,
                      C = 0;
                    C < q.length;
                    C += 2
                  ) {
                    if (
                      ('M' == q[C] &&
                        q.length > C + 1 &&
                        ((w = T(q[C + 1])),
                        (v = r = S(w[0])),
                        (A = u = S(w[1])),
                        B && (x = !0)),
                      'm' == q[C] &&
                        q.length > C + 1 &&
                        ((w = T(q[C + 1])),
                        (v = r += S(w[0])),
                        (A = u += S(w[1])),
                        B && (x = !0)),
                      'l' == q[C] &&
                        q.length > C + 1 &&
                        ((w = T(q[C + 1])), (r += S(w[0])), (u += S(w[1]))),
                      'h' == q[C] &&
                        q.length > C + 1 &&
                        ((w = T(q[C + 1])), (r += S(w[0]))),
                      'v' == q[C] &&
                        q.length > C + 1 &&
                        ((w = T(q[C + 1])), (u += S(w[0]))),
                      's' == q[C] && q.length > C + 1 && (w = T(q[C + 1])),
                      'c' == q[C] && q.length > C + 1 && (w = T(q[C + 1])),
                      'z' == q[C] &&
                        q.length > C + 1 &&
                        ((r = v), (u = A), (w = null)),
                      x && (g.save(), g.beginPath(), (B = x = !1)),
                      'M' == q[C] || 'm' == q[C])
                    ) {
                      g.moveTo(r, u)
                    } else {
                      if ('c' == q[C] && null != w) {
                        for (var M = 0; M < w.length; M += 6) {
                          var E = r + S(w[M + 0]),
                            J = u + S(w[M + 1]),
                            F = r + S(w[M + 2]),
                            D = u + S(w[M + 3]),
                            y = r + S(w[M + 4]),
                            z = u + S(w[M + 5])
                          g.bezierCurveTo(E, J, F, D, y, z)
                          r = y
                          u = z
                        }
                      } else {
                        's' == q[C] && null != w
                          ? ((F = r + S(w[0])),
                            (D = u + S(w[1])),
                            (y = r + S(w[2])),
                            (z = u + S(w[3])),
                            g.bezierCurveTo(r, u, F, D, y, z),
                            (r = y),
                            (u = z))
                          : 'z' == q[C]
                          ? (g.lineTo(r, u),
                            g.closePath(),
                            g.clip(),
                            g.drawImage(f, 0, 0),
                            g.restore(),
                            (B = !0),
                            C--)
                          : g.lineTo(r, u)
                      }
                    }
                  }
                }
              } else {
                aa('no clip path for image!')
              }
            }
            e && e()
          })
          l.src = f.pa(c.pageNumber + 1)
        },
      })
    }
    ImagePageRenderer.prototype.He = function (c, d, e) {
      var f = this,
        h = 0,
        l = c.J.fa,
        k =
          Math.floor(c.getDimensions(d)[d - 1].xa) /
          Math.floor(c.getDimensions(d)[d - 1].Ga)
      f.cb && 1 < d && (k = c.getDimensions(1)[0].xa / c.getDimensions(1)[0].Ga)
      0.5 > k &&
        f.config.JSONDataType &&
        c.getDimensions(0)[0].xa < c.getDimensions(0)[0].Ga &&
        (k = 0.7)
      for (var m = 1; m < d; m++) {
        h += l ? 1 : 2
      }
      var p = 1 == d || l ? h + 1 : h,
        n = new Image()
      jQuery(n).bind('load', function () {
        var m = d % 10
        0 == m && (m = 10)
        var q = jQuery('.flowpaper_fisheye')
          .find(String.format('*[data-thumbIndex="{0}"]', m))
          .get(0)
        q.width = e * k - 2
        q.height = e / k / 2 - 2
        var r = jQuery(q).parent().width() / q.width
        q.getContext('2d').fillStyle = '#999999'
        var u = (q.height - q.height * k) / 2,
          v = q.height * k
        0 > u && ((q.height += q.width - v), (u += (q.width - v) / 2))
        jQuery(q).data('origwidth', q.width * r)
        jQuery(q).data('origheight', q.height * r)
        ;(eb.browser.msie || (eb.browser.safari && 5 > eb.browser.Zb)) &&
          jQuery(q).css({
            width: q.width * r + 'px',
            height: q.height * r + 'px',
          })
        l
          ? (q
              .getContext('2d')
              .fillRect(
                q.width / 3,
                u,
                p == c.getTotalPages() ? q.width / 2 + 2 : q.width + 2,
                v + 2
              ),
            q
              .getContext('2d')
              .drawImage(
                n,
                q.width / 3 + 1,
                u + 1,
                q.width / 1.5,
                q.width / 1.5 / k
              ))
          : (q
              .getContext('2d')
              .fillRect(
                1 == d ? q.width / 2 : 0,
                u,
                p == c.getTotalPages() ? q.width / 2 + 2 : q.width + 2,
                v + 2
              ),
            q
              .getContext('2d')
              .drawImage(
                n,
                1 == d ? q.width / 2 + 1 : 1,
                u + 1,
                q.width / 2,
                v
              ))
        if (
          1 < d &&
          !l &&
          h + 1 <= c.getTotalPages() &&
          p + 1 <= c.getTotalPages()
        ) {
          var A = new Image()
          jQuery(A).bind('load', function () {
            q.getContext('2d').drawImage(
              A,
              q.width / 2 + 1,
              u + 1,
              q.width / 2,
              v
            )
            q.getContext('2d').strokeStyle = '#999999'
            q.getContext('2d').moveTo(q.width - 1, u)
            q.getContext('2d').lineTo(q.width - 1, v + 1)
            q.getContext('2d').stroke()
            jQuery(c).trigger('onThumbPanelThumbAdded', { Uf: m, thumbData: q })
          })
          jQuery(A).attr('src', f.pa(p + 1, 200))
        } else {
          jQuery(c).trigger('onThumbPanelThumbAdded', { Uf: m, thumbData: q })
        }
      })
      p <= c.getTotalPages() && jQuery(n).attr('src', f.pa(p, 200))
    }
    return f
  })(),
  Ma = (function () {
    function f() {}
    W.prototype.zf = function () {
      var c = this.H.J.Mf,
        d = this.Sh(0),
        d = d.xa / d.Ga,
        e = Math.round(this.N.height() - 10)
      this.H.T.find('.flowpaper_fisheye')
      var f = eb.platform.touchdevice
          ? 90 == window.orientation ||
            -90 == window.orientation ||
            jQuery(window).width() > jQuery(window).height()
          : !1,
        h = this.H.J.Wf ? this.H.J.Va.height() : 0
      if (this.H.J.qb && !this.H.PreviewMode) {
        e -= eb.platform.touchonlydevice
          ? this.H.nb
            ? h
            : 0
          : this.N.height() * (this.H.nb ? (0.8 < d ? 0.3 : 0.2) : 0.15)
      } else {
        if (this.H.PreviewMode) {
          this.H.PreviewMode &&
            ((e = this.H.T.height() - 15),
            (e -= eb.platform.touchonlydevice
              ? this.H.nb
                ? h + 30
                : 0
              : this.N.height() * (f ? 0.5 : 0.09)))
        } else {
          var l = 0.07
          this.H.J.qb || (l = 0.07)
          eb.platform.touchonlydevice
            ? (e = this.H.oc
                ? e - (this.H.nb ? 5 : 0)
                : e - (this.H.nb ? h : 0))
            : ((h = this.H.J.Wf ? jQuery(this.H.M).parent().height() || 0 : 0),
              0 == h && this.H.J.Wf && (h = this.N.height() * l),
              (e -=
                this.H.nb && !this.H.J.$e
                  ? h
                  : this.N.height() * (f ? 0.5 : l)))
        }
      }
      f = this.N.width()
      2 * e * d > f - (c ? 2.4 * this.qa : 0) &&
        !this.H.J.fa &&
        (e = f / 2 / d - +(c ? 1.5 * this.qa : 75))
      if (e * d > f - (c ? 2.4 * this.qa : 0) && this.H.J.fa) {
        for (l = 10; e * d > f - (c ? 2.4 * this.qa : 0) && 1000 > l; ) {
          ;(e = f / d - l + (c ? 0 : 50)), (l += 10)
        }
      }
      if (!eb.browser.Os) {
        for (
          c = 2.5 * Math.floor(e * (this.H.J.fa ? 1 : 2) * d), f = 0;
          0 != c % 4 && 20 > f;

        ) {
          ;(e += 0.5),
            (c = 2.5 * Math.floor(e * (this.H.J.fa ? 1 : 2) * d)),
            f++
        }
      }
      return e
    }
    W.prototype.Wd = function (c) {
      var d = this,
        e = c ? c : d.H.scale
      if (1 == e && 1 == d.ka) {
        jQuery(d.L + '_glyphcanvas')
          .css('z-index', -1)
          .Yb()
        jQuery('.flowpaper_flipview_canvas').Pc()
        if (d.H.J.fa && d.H.renderer.ua) {
          for (var f = 0; f < d.document.numPages; f++) {
            var h = jQuery(d.pages[f].da)
            h.Pc()
          }
        }
        d.Ad()
      } else {
        if (d.H.renderer.ua && d.H.J.ia == d.H.I) {
          if (
            ((h = jQuery(d.L + '_glyphcanvas').get(0)),
            void 0 == d.ol && (d.ol = jQuery(h).offset().left),
            void 0 == d.pl && (d.pl = jQuery(h).offset().top),
            void 0 == d.hn && (d.hn = jQuery(d.H.T).position().left),
            void 0 == d.jn && (d.jn = jQuery(d.H.T).position().top),
            1 < e)
          ) {
            if (d.dk) {
              window.clearTimeout(d.Zj),
                (d.Zj = setTimeout(function () {
                  d.Wd(c)
                }, 100))
            } else {
              d.dk = !0
              var l = h.getContext('2d'),
                k =
                  1 < d.Z
                    ? d.Z -
                      (d.H.J.fa ||
                      0 == d.Z % 2 ||
                      d.Z + (0 == d.Z % 2 ? 1 : 0) > d.H.getTotalPages()
                        ? 1
                        : 2)
                    : 0,
                m = d.H.J.fa || 0 == k || null == d.pages[k + 1] ? 1 : 2,
                p = 0,
                n = eb.platform.Za,
                t = 0,
                q = d.ol - d.hn,
                r = d.pl - d.jn
              d.H.Xa && (t = parseFloat(d.N.css('left')))
              d.H.mb && (t = parseFloat(d.N.css('left')))
              if (!n || 1 > n) {
                n = 1
              }
              for (f = 0; f < m; f++) {
                var u = jQuery(d.pages[k + f].da),
                  u = u.get(0).getBoundingClientRect(),
                  v =
                    u.right < d.N.width()
                      ? u.right - (0 < u.left ? u.left : 0)
                      : d.N.width() - (0 < u.left ? u.left : 0),
                  p = p + (0 < v ? v : 0)
              }
              for (f = 0; f < m; f++) {
                var k = k + f,
                  u = jQuery(d.pages[k].da),
                  u = u.get(0).getBoundingClientRect(),
                  A = 0 < u.left ? u.left : 0 + q,
                  x = 0 < u.top ? u.top : 0 + r,
                  v = p,
                  w =
                    u.bottom < d.N.height()
                      ? u.bottom - (0 < u.top ? u.top : 0)
                      : d.N.height() - (0 < u.top ? u.top : 0),
                  B = d.getPage(k)
                jQuery(h).data('needs-overlay', m)
                0 == f &&
                  (jQuery(h).css({
                    left: A + 'px',
                    top: x + 'px',
                    'z-index': 49,
                    display: 'block',
                  }),
                  l.clearRect(0, 0, h.width, h.height),
                  (h.width = v + t),
                  (h.height = w),
                  1 < n &&
                    ((h.width = (v + t) * n),
                    (h.height = w * n),
                    jQuery(h).css({
                      width: h.width / n + 'px',
                      height: h.height / n + 'px',
                    })))
                v = 0 > u.left ? u.left * n : 0
                A = 0 > u.top ? u.top * n : 0
                1 < m &&
                  0 < f &&
                  0 < u.left &&
                  ((v += u.left * n),
                  (x = jQuery(d.pages[k - 1].da)),
                  0 < x.length &&
                    ((x = x.get(0).getBoundingClientRect()),
                    0 < x.left && (v -= x.left * n)))
                var C = m
                B.Qd(h, 0, u.width * n, v, A, !0, !0, !1, u).then(function () {
                  B.Rl = e
                  C = C - 1
                  if (d.H.J.fa) {
                    for (var c = 0; c < d.document.numPages; c++) {
                      d.$a(c) && d.pages[c] != B && jQuery(d.pages[c].da).Yb()
                    }
                  }
                  1 > C &&
                    requestAnim(function () {
                      1 < d.H.scale &&
                        ((d.dk = !1),
                        jQuery('.flowpaper_flipview_canvas').Yb(),
                        (d.rg = !0))
                    }, 50)
                })
              }
            }
          } else {
            if (((d.dk = !1), d.H.J.fa)) {
              for (f = 0; f < d.document.numPages; f++) {
                ;(h = jQuery(d.pages[f].da)), h.Pc()
              }
            }
          }
        }
      }
    }
    W.prototype.Qg = function (c, d, e) {
      if ((c = jQuery(c).closest('.flowpaper_page')) && c.length) {
        window.sessionId = window.sessionId
          ? window.sessionId
          : Q(Date.now().toString())
        c = parseInt(c.attr('id').substr(14, c.attr('id').length - 29))
        var f = jQuery(this.pages[c].da).get(0).getBoundingClientRect(),
          h = this.pages[c].Ha / f.height,
          l = (this.pages[c].Ha * this.pages[c].ae()) / f.width,
          f = 0 == c ? f.right - f.left : 0 != c % 2 ? 0 : f.width
        this.H.J.fa && (f = 0)
        jQuery(this.N).trigger('onPageZoomed', {
          sessionId: window.sessionId,
          pageNumber: c + 1,
          x: Math.round((d - f) * l),
          y: Math.round(e * h),
          value: 200,
          radius: Math.round(50),
        })
      } else {
        ;(c =
          1 < this.Z
            ? this.Z -
              (this.H.J.fa ||
              0 == this.Z % 2 ||
              this.Z + (0 == this.Z % 2 ? 1 : 0) > this.H.getTotalPages()
                ? 1
                : 2)
            : 0),
          jQuery(this.N).trigger('onPageZoomed', {
            sessionId: window.sessionId,
            pageNumber: c + 1,
            x: Math.round((d - f) * l),
            y: Math.round(e * h),
            value: 200,
            radius: Math.round(50),
          })
      }
    }
    W.prototype.bq = function () {
      for (
        var c =
            1 < this.Z
              ? this.Z -
                (this.H.J.fa ||
                0 == this.Z % 2 ||
                this.Z + (0 == this.Z % 2 ? 1 : 0) > this.H.getTotalPages()
                  ? 1
                  : 2)
              : 0,
          d = this.H.J.fa || 0 == c || null == this.pages[c + 1] ? 1 : 2,
          e = 0;
        e < d;
        e++
      ) {
        var c = c + e,
          f = jQuery(this.pages[c].da).get(0).getBoundingClientRect()
        this.zl(f, c)
      }
    }
    W.prototype.zl = function (c, d) {
      var e = this
      window.sessionId = window.sessionId
        ? window.sessionId
        : Q(Date.now().toString())
      var f = e.pages[d].Ha / c.height,
        h = (e.pages[d].Ha * e.pages[d].ae()) / c.width,
        l = c.height,
        k = c.width,
        m = -c.left * h,
        p = -c.top * f
      0 > m && (m = 0)
      0 > p && (p = 0)
      0 > window.innerWidth - c.right && (k += window.innerWidth - c.right)
      0 > c.left && (k += c.left)
      0 > window.innerHeight - c.bottom && (l += window.innerHeight - c.bottom)
      0 > c.top && (l += c.top)
      k = k * h
      l = l * f
      0 > k ||
        0 > l ||
        (e.If &&
          e.om &&
          ((e.If.value = Math.round(
            10 * Math.exp((new Date().getTime() - e.cq) / 1000)
          )),
          jQuery(e.N).trigger('onPagePanned', e.If),
          (e.If = null),
          window.clearTimeout(e.om)),
        (e.If = {
          sessionId: window.sessionId,
          pageNumber: d + 1,
          x: Math.round(m + k / 2),
          y: Math.round(p + l / 2),
          value: 15,
          radius: Math.round(k / 2),
        }),
        (e.cq = new Date().getTime()),
        (e.om = setTimeout(function () {
          e.If.value = Math.exp(4)
          jQuery(e.N).trigger('onPagePanned', e.If)
          e.If = null
        }, 4000)))
    }
    W.prototype.vp = function (c, d) {
      var e = this
      c = parseInt(c)
      e.H.pd = d
      e.H.renderer.Ge && e.Gf(c)
      1 != this.H.scale
        ? e.Ya(1, !0, function () {
            e.H.turn('page', c)
          })
        : e.H.turn('page', c)
    }
    W.prototype.pj = function () {
      return (this.N.width() - this.Zc()) / 2
    }
    W.prototype.Zc = function () {
      var c = this.Sh(0),
        c = c.xa / c.Ga
      return Math.floor(this.zf() * (this.H.J.fa ? 1 : 2) * c)
    }
    W.prototype.$c = function () {
      if ('FlipView' == this.H.I) {
        return 0 < this.width
          ? this.width
          : (this.width = this.V(this.L).width())
      }
    }
    W.prototype.kg = function () {
      if ('FlipView' == this.H.I) {
        return 0 < this.height
          ? this.height
          : (this.height = this.V(this.L).height())
      }
    }
    f.prototype = {
      Gf: function (c, d) {
        for (var e = d - 10; e < d + 10; e++) {
          0 < e &&
            e + 1 < c.H.getTotalPages() + 1 &&
            !c.getPage(e).initialized &&
            ((c.getPage(e).hb = !0),
            c.H.renderer.fe(c.getPage(e)),
            (c.getPage(e).hb = !1))
        }
      },
      vc: function (c) {
        null != c.pe && (window.clearTimeout(c.pe), (c.pe = null))
        var d = 1 < c.Z ? c.Z - 1 : c.Z
        if (!c.H.renderer.Bb || (c.H.renderer.Hb && 1 == c.H.scale)) {
          1 <= c.Z
            ? (c.pages[d - 1].load(function () {
                1 < c.Z &&
                  c.pages[d] &&
                  c.pages[d].load(function () {
                    c.pages[d].Na()
                    for (
                      var e = c.V(c.L).scrollTop(),
                        f = c.V(c.L).height(),
                        g = 0;
                      g < c.document.numPages;
                      g++
                    ) {
                      c.$a(g) &&
                        (c.pages[g].ad(e, f, !0)
                          ? ((c.pages[g].hb = !0),
                            c.pages[g].load(function () {}),
                            c.pages[g].Na())
                          : c.pages[g].Gb())
                    }
                  })
              }),
              c.pages[d - 1].Na())
            : c.pages[d] &&
              c.pages[d].load(function () {
                c.pages[d].Na()
                for (
                  var e = c.V(c.L).scrollTop(), f = c.V(c.L).height(), g = 0;
                  g < c.document.numPages;
                  g++
                ) {
                  c.$a(g) &&
                    (c.pages[g].ad(e, f, !0)
                      ? ((c.pages[g].hb = !0),
                        c.pages[g].load(function () {}),
                        c.pages[g].Na())
                      : c.pages[g].Gb())
                }
              })
        } else {
          1 < c.Z
            ? (c.pages[d - 1] && c.pages[d - 1].load(function () {}),
              c.pages[d - 0] && c.pages[d - 0].load(function () {}))
            : c.pages[d] && c.pages[d].load(function () {})
          for (
            var e = c.V(c.L).scrollTop(), f = c.V(c.L).height(), h = 0;
            h < c.document.numPages;
            h++
          ) {
            c.$a(h) &&
              (c.pages[h].ad(e, f, !0)
                ? ((c.pages[h].hb = !0),
                  c.pages[h].load(function () {}),
                  c.pages[h].Na())
                : c.pages[h].Gb())
          }
        }
      },
      Pj: function (c) {
        1.1 < c.H.scale && c.H.Ca && (c.H.Ca.data().opts.cornerDragging = !1)
        c.ej = setTimeout(function () {
          c.H.pages &&
            'FlipView' == c.H.I &&
            (1.1 < c.H.scale ||
              !c.H.Ca ||
              !c.H.Ca.data().opts ||
              (c.H.Ca.data().opts.cornerDragging = !0),
            (c.ai = !1))
        }, 1000)
      },
      kc: function (c) {
        return 'FlipView' == c.H.I
      },
      Ya: function (c, d, e, f, h) {
        jQuery(c).trigger('onScaleChanged')
        1 < e &&
          0 < jQuery('#' + c.Ab).length &&
          jQuery('#' + c.Ab).css('z-index', -1)
        1 < e && (jQuery('.flowpaper_shadow').hide(), c.H.ea && c.H.ea.hide())
        if (
          'FlipView' == c.H.I &&
          (c.H.J.tf ||
            (e >= 1 + c.H.document.ZoomInterval
              ? jQuery('.flowpaper_page, ' + c.L)
                  .removeClass('flowpaper_page_zoomIn')
                  .addClass('flowpaper_page_zoomOut')
              : jQuery('.flowpaper_page, ' + c.L)
                  .removeClass('flowpaper_page_zoomOut')
                  .addClass('flowpaper_page_zoomIn')),
          jQuery(c.L).data().totalPages)
        ) {
          var l = c.Sh(0),
            k = l.xa / l.Ga,
            l = c.zf() * e,
            k = 2 * l * k
          c.H.renderer.ua &&
            0 == f.df &&
            setTimeout(function () {
              c.animating = !1
            }, 50)
          if (!f || !c.kc() || (1 < d && !c.V(c.L + '_parent').og())) {
            if (
              (c.V(c.L + '_parent').og() &&
                e >= 1 + c.H.document.ZoomInterval &&
                ((d = c.tj())
                  ? (c
                      .V(c.L + '_parent')
                      .transition({ transformOrigin: '0px 0px' }, 0),
                    c
                      .V(c.L + '_parent')
                      .transition({ x: 0, y: 0, scale: 1 }, 0),
                    (f.lc = d.left),
                    (f.Ec = d.top),
                    (f.sd = !0))
                  : ((m = 1 != c.H.ma || c.H.J.fa ? 0 : -(c.Zc() / 4)),
                    c
                      .V(c.L + '_parent')
                      .transition({ x: m, y: c.H.jc, scale: 1 }, 0))),
              c.V(c.L).og() && c.V(c.L).transition({ x: 0, y: 0, scale: 1 }, 0),
              !c.animating)
            ) {
              c.ci || ((c.ci = c.H.Ca.width()), (c.tq = c.H.Ca.height()))
              1 == e && c.ci
                ? ((turnwidth = c.ci), (turnheight = c.tq))
                : ((turnwidth =
                    k -
                    (c.V(c.L + '_panelLeft').width() +
                      c.V(c.L + '_panelRight').width() +
                      40)),
                  (turnheight = l))
              c.V(c.L).css({ width: k, height: l })
              c.H.Ca.turn('size', turnwidth, turnheight, !1)
              e >= 1 + c.H.document.ZoomInterval
                ? (f.sd || eb.platform.touchonlydevice) &&
                  requestAnim(function () {
                    c.N.scrollTo({
                      left: jQuery(c.N).scrollLeft() + f.lc / e + 'px',
                      top: jQuery(c.N).scrollTop() + f.Ec / e + 'px',
                    })
                  }, 500)
                : c.kf()
              for (k = 0; k < c.document.numPages; k++) {
                c.$a(k) && (c.pages[k].va = !1)
              }
              1 < e
                ? c.H.Ca.turn('setCornerDragging', !1)
                : (c.V(c.L + '_panelLeft').show(),
                  c.V(c.L + '_panelRight').show(),
                  c.H.Ca.turn('setCornerDragging', !0),
                  jQuery('.flowpaper_shadow').show())
              c.Cd()
              c.Ad()
              setTimeout(function () {
                null != h && h()
              }, 200)
            }
          } else {
            if (!c.animating || !c.al) {
              c.animating = !0
              c.al = f.sd
              ;(c.H.renderer.ua && 0 == f.df && 1 != e) ||
                (jQuery('.flowpaper_flipview_canvas').Pc(),
                jQuery('.flowpaper_flipview_canvas_highres').Yb(),
                c.H.renderer.ua &&
                  jQuery(c.L + '_glyphcanvas')
                    .css('z-index', -1)
                    .Yb())
              jQuery('#' + c.Ab).css('z-index', -1)
              jQuery(c).trigger('onScaleChanged')
              l = 400
              d = 'snap'
              c.H.document.ZoomTime &&
                (l = 1000 * parseFloat(c.H.document.ZoomTime))
              c.H.document.ZoomTransition &&
                ('easeOut' == c.H.document.ZoomTransition && (d = 'snap'),
                'easeIn' == c.H.document.ZoomTransition &&
                  ((d = 'ease-in'), (l /= 2)))
              f && f.lc && f.Ec
                ? (f.sd && (f.lc = f.lc + c.pj()),
                  f.sd || eb.platform.touchonlydevice
                    ? ((c.Ud = f.lc), (c.Vd = f.Ec))
                    : ((k = c
                        .V(c.L + '_parent')
                        .css('transformOrigin')
                        .split(' ')),
                      2 == k.length
                        ? ((k[0] = k[0].replace('px', '')),
                          (k[1] = k[1].replace('px', '')),
                          (c.Ud = parseFloat(k[0])),
                          (c.Vd = parseFloat(k[1])))
                        : ((c.Ud = f.lc), (c.Vd = f.Ec)),
                      (c.Cm = !0)),
                  f.df && (l = f.df))
                : ((c.Ud = 0), (c.Vd = 0))
              c.H.renderer.Bb &&
                c.H.renderer.yb &&
                1 == e &&
                ((k = 1 < c.Z ? c.Z - 1 : c.Z),
                1 < c.Z && c.H.renderer.Yc(c.pages[k - 1]),
                c.H.renderer.Yc(c.pages[k]))
              if (c.H.J.fa && c.H.renderer.ua && 1 < e) {
                for (k = 0; k < c.document.numPages; k++) {
                  c.$a(k) && k != c.Z - 1 && jQuery(c.pages[k].da).Yb()
                }
              }
              'undefined' != f.df && (l = f.df)
              e >= 1 + c.H.document.ZoomInterval
                ? ('preserve-3d' ==
                    c.V(c.L + '_parent').css('transform-style') && (l = 0),
                  (f.sd || eb.platform.touchonlydevice) &&
                    c
                      .V(c.L + '_parent')
                      .css({ transformOrigin: c.Ud + 'px ' + c.Vd + 'px' }),
                  c.H.Ca.turn('setCornerDragging', !1))
                : (c.V(c.L).transition({ x: 0, y: 0 }, 0),
                  c.H.Ca.turn('setCornerDragging', !0))
              var m = 1 != c.H.ma || c.H.J.fa ? 0 : -(c.Zc() / 4)
              c.H.ma == c.H.getTotalPages() &&
                0 == c.H.getTotalPages() % 2 &&
                (m = c.H.J.fa ? 0 : +(c.Zc() / 4))
              c.V(c.L + '_parent').transition(
                { x: m, y: c.H.jc, scale: e },
                l,
                d,
                function () {
                  c.V(c.L + '_parent').css('will-change', '')
                  c.Wd()
                  c.Ad()
                  null != c.Ve && (window.clearTimeout(c.Ve), (c.Ve = null))
                  c.Ve = setTimeout(function () {
                    if (!c.H.renderer.ua) {
                      for (var d = 0; d < c.document.numPages; d++) {
                        c.pages[d].va = !1
                      }
                    }
                    c.zd = 0
                    c.Te = 0
                    c.Cd()
                    c.animating = !1
                    c.al = !1
                  }, 50)
                  1 == e &&
                    c.V(c.L + '_parent').css('-webkit-transform-origin:', '')
                  1 == e &&
                    (jQuery('.flowpaper_shadow').show(),
                    jQuery('.flowpaper_zine_page_left').fadeIn(),
                    jQuery('.flowpaper_zine_page_right').fadeIn())
                  null != h && h()
                }
              )
            }
          }
        }
      },
      resize: function (c, d, e, f) {
        c.width = -1
        c.height = -1
        jQuery(
          '.flowpaper_pageword_' +
            c.aa +
            ', .flowpaper_interactiveobject_' +
            c.aa
        ).remove()
        if ('FlipView' == c.H.I) {
          c.H.renderer.ua &&
            c.H.renderer.Dm &&
            (jQuery('.flowpaper_flipview_page').css({
              height: '100%',
              width: '100%',
            }),
            (c.H.renderer.Dm = !1))
          1 != c.H.ma || c.H.J.fa
            ? c.H.J.fa
              ? c.H.J.fa &&
                jQuery(c.L + '_parent').transition(
                  { x: 0, y: c.H.jc },
                  0,
                  'snap',
                  function () {}
                )
              : jQuery(c.L + '_parent').transition(
                  { x: 0, y: c.H.jc },
                  0,
                  'snap',
                  function () {}
                )
            : jQuery(c.L + '_parent').transition(
                { x: -(c.Zc() / 4), y: c.H.jc },
                0,
                'snap',
                function () {}
              )
          var h = c.zf(),
            l = c.Zc()
          c.H.J.Va.height()
          c.V(c.L + '_parent').css({ width: d, height: h })
          c.ud = l
          c.vh = h
          d = c.pj()
          c.H.Ca && c.H.Ca.turn('size', l, h, !1)
          c.V(c.L + '_panelLeft').css({
            'margin-left': d - c.qa,
            width: c.qa,
            height: h - 30,
          })
          c.V(c.L + '_arrowleft').css({ top: (h - 30) / 2 + 'px' })
          c.V(c.L + '_arrowright').css({ top: (h - 30) / 2 + 'px' })
          c.V(c.L + '_panelRight').css({ width: c.qa, height: h - 30 })
          c.H.PreviewMode
            ? (jQuery(c.L + '_arrowleftbottom').hide(),
              jQuery(c.L + '_arrowleftbottommarker').hide(),
              jQuery(c.L + '_arrowrightbottom').hide(),
              jQuery(c.L + '_arrowrightbottommarker').hide())
            : (jQuery(c.L + '_arrowleftbottom').show(),
              jQuery(c.L + '_arrowleftbottommarker').show(),
              jQuery(c.L + '_arrowrightbottom').show(),
              jQuery(c.L + '_arrowrightbottommarker').show())
          c.ci = null
          c.Et = null
          c.Wd()
        }
        jQuery('.flowpaper_flipview_page').addClass('flowpaper_redraw')
        for (d = 0; d < c.document.numPages; d++) {
          c.$a(d) && c.pages[d].Ya()
        }
        'FlipView' == c.H.I
          ? (window.clearTimeout(c.Fq),
            (c.Fq = setTimeout(function () {
              c.zm && c.zm()
              for (var d = 0; d < c.document.numPages; d++) {
                c.$a(d) &&
                  ((c.pages[d].va = !1),
                  null != c.H.renderer.resize &&
                    c.H.renderer.resize(c.H.renderer, c.pages[d]))
              }
              c.Cd()
              jQuery(c.H).trigger('onResizeCompleted')
              c.H.J.enableWebGL &&
                jQuery('#' + c.pages.container + '_webglcanvas').css({
                  width: l,
                  height: h,
                })
              f && f()
            }, 300)))
          : f && f()
      },
      Me: function (c, d, e) {
        if (c.H.PreviewMode) {
          c.H.openFullScreen()
        } else {
          if (!c.Zd()) {
            var f = c.document.TouchZoomInterval
              ? c.H.scale + c.document.TouchZoomInterval
              : 2.5
            if ('FlipView' == c.H.I) {
              if (d) {
                d = jQuery(c.L + '_parent').width() / 2
                var h = jQuery(c.L + '_parent').height() / 2
                c.Ya(f, { lc: d, Ec: h })
                c.Qg(e, d, h)
              } else {
                c.Ya(f, { lc: c.bd, Ec: c.cd }), c.Qg(e, c.bd, c.cd)
              }
            } else {
              c.Ya(1)
            }
            c.Ad()
          }
        }
      },
      Id: function (c, d) {
        'FlipView' == c.H.I ? c.Ya(1, !0, d) : c.Ya(window.FitHeightScale)
        c.Ad()
      },
      Oj: function (c) {
        'FlipView' == c.H.I &&
          (this.touchwipe = c.V(c.L).touchwipe({
            wipeLeft: function () {
              c.af = !0
              setTimeout(function () {
                c.af = !1
              }, 3800)
              c.Sf = null
              null == c.ka &&
                (c.H.Ca.turn('cornerActivated') ||
                  c.animating ||
                  1 != c.H.scale ||
                  c.Ie ||
                  c.next())
            },
            wipeRight: function () {
              c.af = !0
              setTimeout(function () {
                c.af = !1
              }, 3800)
              c.Sf = null
              c.H.Ca.turn('cornerActivated') ||
                c.animating ||
                (null == c.ka && (1 != c.H.scale || c.Ie || c.previous()))
            },
            wipeMove: function (d, e, f) {
              c.H.J.fa &&
                c.H.J.enableWebGL &&
                !c.animating &&
                1 == c.H.scale &&
                ((d = d / c.ud),
                (0 > f && 1 == c.Z) ||
                  (0 < f && c.Z >= c.H.getTotalPages()) ||
                  (c.Wb || c.Zd() || (c.Wb = 0 < f ? 'next' : 'previous'),
                  c.Wb &&
                    ((c.Ie = d),
                    c.Fg('next', null, 0 < 1 - c.Ie ? 1 - c.Ie : 0))))
            },
            wipeEnd: function (d, e) {
              if (c.Wb && 1 == c.H.scale && c.pages[c.ta]) {
                var f = 0.5
                250 > e && (f = 0.3)
                if (
                  'next' == c.Wb ? 1 - c.Ie > f && 50 < d : c.Ie > f && 50 > d
                ) {
                  var f = 1 - c.Ie,
                    h = 'next' == c.Wb ? 1 : 0
                  jQuery({ uf: f }).animate(
                    { uf: h },
                    {
                      duration: 250,
                      step: function () {
                        c.Fg(c.Wb, null, 0 <= this.uf ? this.uf : 0)
                      },
                      complete: function () {
                        c.pages[c.ta].lj()
                        c.Wb = !1
                      },
                    }
                  )
                } else {
                  ;(f = 1 - c.Ie),
                    (h = 'next' == c.Wb ? 0 : 1),
                    jQuery({ uf: f }).animate(
                      { uf: h },
                      {
                        duration: 150,
                        step: function () {
                          c.Fg(c.Wb, null, 0 <= this.uf ? this.uf : 0)
                        },
                        complete: function () {
                          c.Wb = !1
                          c.animating = !1
                          c.dg = !1
                          setTimeout(function () {
                            jQuery('#' + c.Ab).css({ opacity: 0 })
                            jQuery('#' + c.Ab).css('z-index', -1)
                            for (var d = 0; d < c.document.numPages; d++) {
                              ;(c.pages[d].dc = !1), (c.pages[d].Xb = !1)
                            }
                          }, 50)
                        },
                      }
                    )
                }
              }
            },
            triggerAtEnd: c.H.J.fa,
            preventDefaultEvents: !0,
            min_move_x: 50,
            min_move_y: 50,
          }))
      },
      jl: function (c) {
        if (c.H.Eb || !eb.platform.touchdevice || c.H.J.tf) {
          c.H.Eb
            ? ((d = c.V(c.L)),
              d.doubletap(
                function (d) {
                  var f = jQuery('.activeElement').data('hint-pageNumber')
                  window.parent.postMessage('EditPage:' + f, '*')
                  window.clearTimeout(c.Dj)
                  d.preventDefault()
                  d.stopImmediatePropagation()
                },
                null,
                300,
                !0
              ))
            : ((d = c.V(c.L)),
              d.doubletap(
                function (c) {
                  c.preventDefault()
                },
                null,
                300
              ))
        } else {
          var d = c.V(c.L)
          d.doubletap(
            function (d) {
              c.Sf = null
              if (
                'TwoPage' == c.H.I ||
                'BookView' == c.H.I ||
                'FlipView' == c.H.I
              ) {
                ;('TwoPage' != c.H.I && 'BookView' != c.H.I) || 1 == c.H.scale
                  ? 1 != c.H.scale || 'FlipView' != c.H.I || c.ai
                    ? 'FlipView' == c.H.I && 1 <= c.H.scale && !c.Tj
                      ? c.Id()
                      : 'TwoPage' == c.H.I && 1 == c.H.scale && c.Id()
                    : c.Me(!1, d.target)
                  : c.Me(!1, d.target),
                  d.preventDefault(),
                  (c.Tj = !1),
                  (c.ai = !1)
              }
            },
            null,
            300
          )
        }
      },
      Wi: function (c, d) {
        if ('FlipView' == c.H.I) {
          c.H.J.eg && (c.qa = c.H.J.eg)
          var e = c.zf(),
            f = c.Zc(),
            h = c.pj(),
            l = c.H.J.Mf && (430 < f || c.H.PreviewMode || c.H.J.fa) && !c.H.Fd,
            k = l ? 0 : h,
            h = h - c.qa,
            m = c.H.J.rb ? c.H.J.rb : '#555555',
            p = c.H.J.Cb ? c.H.J.Cb : '#AAAAAA',
            n = c.H.J.Va.height()
          c.pb =
            (c.H.oc && !c.H.J.qb) || 0 == n || c.H.PreviewMode
              ? (c.N.height() - e) / 2
              : 200 < c.N.height() - e
              ? (c.N.height() - e) / 4
              : 0
          c.pb =
            0 == c.pb && c.H.nb && !c.H.oc && 0 < n && !c.H.J.qb
              ? (c.N.height() - e) / 2 - n
              : c.pb
          c.ud = f
          c.vh = e
          c.H.J.fa && ((m = 'transparent'), (k = c.qa + h))
          d.append(
            "<div id='" +
              c.container +
              "_parent' style='white-space:nowrap;width:100%;height:" +
              e +
              'px;' +
              ((!c.H.nb && !c.H.J.qb) || c.H.J.$e
                ? 'margin-top:2.5%;'
                : 0 < c.pb
                ? 'padding-top:' + c.pb + 'px;'
                : '') +
              'z-index:10' +
              (!eb.browser.mozilla ||
              !eb.platform.mac ||
              (eb.platform.mac &&
                (18 > parseFloat(eb.browser.version) ||
                  33 < parseFloat(eb.browser.version)))
                ? ''
                : ';transform-style:preserve-3d;') +
              "'>" +
              (l
                ? "<div id='" +
                  c.container +
                  "_panelLeft' class='flowpaper_arrow' style='cursor:pointer;opacity: 0;margin-top:15px;-moz-border-radius-topleft: 10px;border-top-left-radius: 10px;-moz-border-radius-bottomleft: 10px;border-bottom-left-radius: 10px;position:" +
                  (c.H.J.fa ? 'absolute' : 'relative') +
                  ';float:left;background-color:' +
                  m +
                  ';left:0px;top:' +
                  (c.H.J.fa ? 'auto' : '0px') +
                  ';height:' +
                  (e - 30) +
                  'px;width:' +
                  c.qa +
                  'px;margin-left:' +
                  (c.H.J.fa ? 0 : h) +
                  'px;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;user-select: none;' +
                  (c.H.J.fa ? 'padding-right:20px;z-index:999;' : '') +
                  "'><div style='position:relative;left:" +
                  (c.qa - (c.qa - 0.4 * c.qa)) / 2 +
                  'px;top:' +
                  (e / 2 - c.qa) +
                  "px' id='" +
                  c.container +
                  "_arrowleft' class='flowpaper_arrow'></div><div style='position:absolute;left:" +
                  (c.qa - (c.qa - 0.55 * c.qa)) / 2 +
                  "px;bottom:0px;margin-bottom:10px;' id='" +
                  c.container +
                  "_arrowleftbottom' class='flowpaper_arrow flowpaper_arrow_start'></div><div style='position:absolute;left:" +
                  (c.qa - 0.8 * c.qa) +
                  "px;bottom:0px;width:2px;margin-bottom:10px;' id='" +
                  c.container +
                  "_arrowleftbottommarker' class='flowpaper_arrow flowpaper_arrow_start'></div></div>"
                : '') +
              "<div id='" +
              c.container +
              "' style='float:left;position:relative;height:" +
              e +
              'px;width:' +
              f +
              'px;margin-left:' +
              k +
              "px;z-index:10;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;user-select: none;' class='flowpaper_twopage_container flowpaper_hidden'></div>" +
              (l
                ? "<div id='" +
                  c.container +
                  "_panelRight' class='flowpaper_arrow' style='cursor:pointer;opacity: 0;margin-top:15px;-moz-border-radius-topright: 10px;border-top-right-radius: 10px;-moz-border-radius-bottomright: 10px;border-bottom-right-radius: 10px;position:" +
                  (c.H.J.fa ? 'absolute' : 'relative') +
                  ';display:inline-block;background-color:' +
                  m +
                  ';' +
                  (c.H.J.fa ? 'right' : 'left') +
                  ':0px;top:' +
                  (c.H.J.fa ? 'auto' : '0px') +
                  ';height:' +
                  (e - 30) +
                  'px;width:' +
                  c.qa +
                  'px;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;user-select: none;' +
                  (c.H.J.fa ? 'padding-left:20px;z-index:999;' : '') +
                  "'><div style='position:relative;left:" +
                  (c.qa - (c.qa - 0.4 * c.qa)) / 2 +
                  'px;top:' +
                  (e / 2 - c.qa) +
                  "px' id='" +
                  c.container +
                  "_arrowright' class='flowpaper_arrow'></div><div style='position:absolute;left:" +
                  (c.qa - (c.qa - 0.55 * c.qa)) / 2 +
                  "px;bottom:0px;margin-bottom:10px;' id='" +
                  c.container +
                  "_arrowrightbottom' class='flowpaper_arrow flowpaper_arrow_end'></div><div style='position:absolute;left:" +
                  ((c.qa - (c.qa - 0.55 * c.qa)) / 2 + c.qa - 0.55 * c.qa) +
                  "px;bottom:0px;width:2px;margin-bottom:10px;' id='" +
                  c.container +
                  "_arrowrightbottommarker' class='flowpaper_arrow flowpaper_arrow_end'></div></div>"
                : '') +
              '</div>'
          )
          f = R(m)
          c.H.renderer.ua &&
            (c.H.T.append(
              "<canvas id='" +
                c.container +
                "_glyphcanvas' style='pointer-events:none;position:absolute;left:0px;top:0px;z-index:-1;' class='flowpaper_glyphcanvas'></canvas>"
            ),
            eb.browser.msie &&
              11 > eb.browser.version &&
              PointerEventsPolyfill.initialize({
                selector: '#' + c.container + '_glyphcanvas',
                mouseEvents: [
                  'click',
                  'dblclick',
                  'mousedown',
                  'mouseup',
                  'mousemove',
                ],
              }),
            jQuery(c.H.renderer).bind('onTextDataUpdated', function (d, e) {
              for (var f = e + 12, g = e - 2; g < f; g++) {
                var h = c.getPage(g)
                if (h) {
                  var k = h ? document.getElementById(h.ja + '_canvas') : null
                  if (k) {
                    var l = h.Fa(),
                      m = h.Pa(),
                      n = 1.5 < c.H.renderer.Za ? c.H.renderer.Za : 1.5
                    k.width != l * n &&
                      (jQuery(k).data('needs-overlay', 1),
                      (k.width = l * n),
                      (k.height = m * n),
                      h.Qd(k).then(function (d, e) {
                        e && e.hb && c.H.renderer.ic(e, !0)
                      }))
                  }
                }
              }
            }))
          h = c.H.J.Lf
          c.H.J.fa && (h = 0)
          jQuery(c.L + '_panelLeft').css(
            'background-color',
            'rgba(' + f.r + ',' + f.g + ',' + f.b + ',' + h + ')'
          )
          jQuery(c.L + '_panelRight').css(
            'background-color',
            'rgba(' + f.r + ',' + f.g + ',' + f.b + ',' + h + ')'
          )
          jQuery(c.L + '_arrowleft').We(c.qa - 0.4 * c.qa, p)
          jQuery(c.L + '_arrowright').Rd(c.qa - 0.4 * c.qa, p)
          !c.H.J.Tg ||
            c.H.Eb ||
            c.H.J.fa ||
            (jQuery(c.L + '_arrowleftbottom').We(c.qa - 0.55 * c.qa, p),
            jQuery(c.L + '_arrowleftbottommarker').$j(
              c.qa - 0.55 * c.qa,
              p,
              jQuery(c.L + '_arrowleftbottom')
            ),
            jQuery(c.L + '_arrowrightbottom').Rd(c.qa - 0.55 * c.qa, p),
            jQuery(c.L + '_arrowrightbottommarker').ak(
              c.qa - 0.55 * c.qa,
              p,
              jQuery(c.L + '_arrowrightbottom')
            ))
          c.H.Eb &&
            !c.H.J.fa &&
            (jQuery(c.L + '_arrowleftbottom').We(c.qa - 0.55 * c.qa, p),
            jQuery(c.L + '_arrowleftbottommarker').$j(
              c.qa - 0.55 * c.qa,
              p,
              jQuery(c.L + '_arrowleftbottom')
            ),
            jQuery(c.L + '_arrowrightbottom').Rd(c.qa - 0.55 * c.qa, p),
            jQuery(c.L + '_arrowrightbottommarker').ak(
              c.qa - 0.55 * c.qa,
              p,
              jQuery(c.L + '_arrowrightbottom')
            ),
            c.H.J.Tg ||
              (jQuery(c.L + '_arrowleftbottom').css('opacity', 0),
              jQuery(c.L + '_arrowleftbottommarker').css('opacity', 0),
              jQuery(c.L + '_arrowrightbottom').css('opacity', 0),
              jQuery(c.L + '_arrowrightbottommarker').css('opacity', 0)))
          !c.H.J.fa ||
            c.H.xf ||
            c.H.nb ||
            d.css('top', (d.height() - e) / 2.1 + 'px')
          c.H.J.Mf ||
            (jQuery(c.L + '_panelLeft')
              .attr('id', c.L + '_panelLeft_disabled')
              .css('visibility', 'none'),
            jQuery(c.L + '_panelRight')
              .attr('id', c.L + '_panelRight_disabled')
              .css('visibility', 'none'))
          c.H.PreviewMode &&
            (jQuery(c.L + '_arrowleftbottom').hide(),
            jQuery(c.L + '_arrowleftbottommarker').hide(),
            jQuery(c.L + '_arrowrightbottom').hide(),
            jQuery(c.L + '_arrowrightbottommarker').hide())
          document.addEventListener(
            'touchstart',
            function (d) {
              c.Sf = new Date().getTime()
              eb.platform.ios &&
                eb.browser.capabilities.Gr &&
                c.T.has(d.target).length &&
                (c.H.T.has(d.target).length || d.preventDefault())
            },
            { passive: !1 }
          )
          jQuery(c.L).on(c.H.J.Yf ? 'mouseup' : 'mousedown', function (d) {
            if (
              jQuery(d.target).hasClass('flowpaper_mark') ||
              jQuery(d.target).parents('.flowpaper_mark').length
            ) {
              return !1
            }
            var e = !0
            c.H.J.Yf &&
              (c.an(),
              null == c.Lb ||
                (d.pageX &&
                  d.pageY &&
                  d.pageX <= c.Lb + 2 &&
                  d.pageX >= c.Lb - 2 &&
                  d.pageY <= c.Jc + 2 &&
                  d.pageY >= c.Jc - 2) ||
                (e = !1),
              (c.Lb = null),
              (c.Jc = null),
              c.rg && (eb.browser.safari || c.H.renderer.ua) && (c.rg = !1),
              c.Wd())
            if (!e && 1 < c.H.scale) {
              for (
                var f =
                    1 < c.Z
                      ? c.Z -
                        (c.H.J.fa ||
                        0 == c.Z % 2 ||
                        c.Z + (0 == c.Z % 2 ? 1 : 0) > c.H.getTotalPages()
                          ? 1
                          : 2)
                      : 0,
                  g = c.H.J.fa || 0 == f || null == c.pages[f + 1] ? 1 : 2,
                  h = 0;
                h < g;
                h++
              ) {
                var f = f + h,
                  k = jQuery(c.pages[f].da).get(0).getBoundingClientRect()
                c.zl(k, f)
              }
            }
            if ((!c.H.J.Yf || e) && !c.H.J.tf) {
              var l = !1,
                e =
                  0 <
                  jQuery(d.target)
                    .parents('.flowpaper_page')
                    .children()
                    .find(
                      '.flowpaper_zine_page_left, .flowpaper_zine_page_left_noshadow'
                    ).length
              c.Bg = e ? c.H.ma - 2 : c.H.ma - 1
              jQuery(d.target).hasClass(
                'flowpaper_interactiveobject_' + c.aa
              ) && (l = !0)
              if (
                jQuery('.flowpaper_mark_video_maximized').length ||
                c.H.Ca.turn('cornerActivated') ||
                c.animating ||
                jQuery(d.target).hasClass('turn-page-wrapper') ||
                (jQuery(d.target).hasClass('flowpaper_shadow') &&
                  jQuery(d.target).og())
              ) {
                return
              }
              if (c.H.PreviewMode && 'A' != d.target.tagName) {
                c.H.openFullScreen()
                return
              }
              eb.platform.mobilepreview ||
                c.Zd() ||
                'transform' == c.V(c.L + '_parent').css('will-change') ||
                (c.H.Eb
                  ? (clearTimeout(c.Dj),
                    (c.Dj = setTimeout(function () {
                      c.kc() &&
                        c.V(c.L + '_parent').css('will-change', 'transform')
                      var e = jQuery(c.L).ng(d.pageX, d.pageY)
                      l || c.H.Dc || 1 != c.H.scale
                        ? !l && !c.H.Dc && 1 < c.H.scale
                          ? c.H.Zoom(1, { sd: !0, lc: e.x, Ec: e.y })
                          : l && c.V(c.L + '_parent').css('will-change', '')
                        : (c.H.Zoom(2.5, { sd: !0, lc: e.x, Ec: e.y }),
                          c.Qg(d.target, e.x, e.y))
                    }, 350)))
                  : (c.kc() &&
                      c.V(c.L + '_parent').css('will-change', 'transform'),
                    requestAnim(function () {
                      var e = jQuery(c.L).ng(d.pageX, d.pageY)
                      l || c.H.Dc || 1 != c.H.scale
                        ? !l && !c.H.Dc && 1 < c.H.scale
                          ? c.H.Zoom(1, { sd: !0, lc: e.x, Ec: e.y })
                          : l && c.V(c.L + '_parent').css('will-change', '')
                        : (c.H.Zoom(2.5, { sd: !0, lc: e.x, Ec: e.y }),
                          c.Qg(d.target, e.x, e.y))
                    }, 50)))
              var m = {}
              jQuery((jQuery(d.target).attr('class') + '').split(' ')).each(
                function () {
                  '' !== this && (m[this] = this)
                }
              )
              for (class_name in m) {
                0 == class_name.indexOf('gotoPage') &&
                  c.gotoPage(
                    parseInt(class_name.substr(class_name.indexOf('_') + 1))
                  )
              }
            }
            if (c.H.renderer.Bb && c.H.renderer.yb && 1 < c.H.scale) {
              var n = 1 < c.Z ? c.Z - 1 : c.Z
              setTimeout(function () {
                1 < c.H.scale
                  ? (1 < c.Z && c.H.renderer.hd(c.pages[n - 1]),
                    c.H.renderer.hd(c.pages[n]))
                  : (1 < c.Z && c.H.renderer.Yc(c.pages[n - 1]),
                    c.H.renderer.Yc(c.pages[n]))
              }, 500)
            }
          })
          jQuery(c.L + '_parent').on('mousemove', function (d) {
            if (1 < c.H.scale && !c.H.Dc) {
              if (c.H.J.Yf && 'down' == c.H.Nd) {
                c.Lb || ((c.Lb = d.pageX), (c.Jc = d.pageY))
                if (eb.browser.safari || c.H.renderer.ua) {
                  jQuery('.flowpaper_flipview_canvas').show(),
                    jQuery('.flowpaper_flipview_canvas_highres').hide(),
                    jQuery(c.L + '_glyphcanvas')
                      .css('z-index', -1)
                      .Yb(),
                    (c.rg = !0),
                    setTimeout(function () {
                      'down' == c.H.Nd &&
                        (jQuery('.flowpaper_flipview_canvas').show(),
                        jQuery('.flowpaper_flipview_canvas_highres').hide())
                    }, 200)
                }
                eb.platform.touchdevice || c.V(c.L + '_parent').og()
                  ? (c.Cm && (c.an(), (c.Cm = !1)), c.ql(d.pageX, d.pageY))
                  : (c.N.scrollTo(
                      {
                        left:
                          jQuery(c.N).scrollLeft() + (c.Lb - d.pageX) + 'px',
                        top: jQuery(c.N).scrollTop() + (c.Jc - d.pageY) + 'px',
                      },
                      0,
                      { axis: 'xy' }
                    ),
                    (c.Lb = d.pageX + 3),
                    (c.Jc = d.pageY + 3))
              } else {
                if (!c.H.J.Yf) {
                  var e = c.N.ng(d.pageX, d.pageY)
                  eb.platform.touchdevice ||
                    c.V(c.L + '_parent').og() ||
                    c.N.scrollTo(
                      { left: d.pageX + 'px', top: d.pageY + 'px' },
                      0,
                      { axis: 'xy' }
                    )
                  d = e.x / jQuery(c.L + '_parent').width()
                  e = e.y / jQuery(c.L + '_parent').height()
                  requestAnim(function () {
                    c.Wd()
                  }, 10)
                  c.Fh(
                    (jQuery(c.N).width() + 150) * d - 20,
                    (jQuery(c.N).height() + 150) * e - 250
                  )
                }
              }
              c.H.renderer.Bb &&
                c.H.renderer.yb &&
                !c.H.J.Yf &&
                ((e = 1 < c.Z ? c.Z - 1 : c.Z),
                1 < c.H.scale
                  ? (1 < c.Z && c.H.renderer.hd(c.pages[e - 1]),
                    c.H.renderer.hd(c.pages[e]))
                  : (1 < c.Z && c.H.renderer.Yc(c.pages[e - 1]),
                    c.H.renderer.Yc(c.pages[e])))
            }
          })
          jQuery(c.L + '_parent').on('touchmove', function (d) {
            var e = !1
            if (!c.Wb) {
              if (!eb.platform.ios && 2 == d.originalEvent.touches.length) {
                d.preventDefault && d.preventDefault()
                d.returnValue = !1
                if (c.$l) {
                  return !1
                }
                var f = Math.sqrt(
                    (d.originalEvent.touches[0].pageX -
                      d.originalEvent.touches[1].pageX) *
                      (d.originalEvent.touches[0].pageX -
                        d.originalEvent.touches[1].pageX) +
                      (d.originalEvent.touches[0].pageY -
                        d.originalEvent.touches[1].pageY) *
                        (d.originalEvent.touches[0].pageY -
                          d.originalEvent.touches[1].pageY)
                  ),
                  f = 2 * f
                if (null == c.ka) {
                  if (c.H.J.fa && c.H.renderer.ua) {
                    for (var g = 0; g < c.document.numPages; g++) {
                      c.$a(g) && g != c.Z - 1 && jQuery(c.pages[g].da).Yb()
                    }
                  }
                  c.V(c.L + '_parent').css('will-change', 'transform')
                  c.ob = c.H.scale
                  c.Qf = f
                } else {
                  c.ka == c.ob && c.H.Ca.turn('setCornerDragging', !1)
                  if (null == c.ob || null == c.Qf) {
                    return
                  }
                  1 > c.ka && (c.ka = 1)
                  3 < c.ka && !eb.platform.ge && !c.H.renderer.ua && (c.ka = 3)
                  c.H.renderer.yb &&
                    4 < c.ka &&
                    eb.platform.ipad &&
                    !c.H.renderer.ua &&
                    (c.ka = 4)
                  !c.H.renderer.yb &&
                    3 < c.ka &&
                    eb.platform.ipad &&
                    !c.H.renderer.ua &&
                    (c.ka = 3)
                  g = 0
                  1 != c.H.ma || c.H.J.fa || (g = -(c.Zc() / 4))
                  var h = c.ob + (f - c.Qf) / jQuery(c.L + '_parent').width()
                  0.01 < Math.abs(c.ka - h)
                    ? ((c.$l = !0),
                      c
                        .V(c.L + '_parent')
                        .transition(
                          { x: g, y: c.H.jc, scale: c.ka },
                          0,
                          'none',
                          function () {
                            c.$l = !1
                          }
                        ))
                    : (e = !0)
                }
                e ||
                  (c.ka = c.ob + (f - c.Qf) / jQuery(c.L + '_parent').width())
              }
              ;(1 < c.H.scale || (null != c.ka && 1 < c.ka)) &&
                !e &&
                ((e =
                  d.originalEvent.touches[0] ||
                  d.originalEvent.changedTouches[0]),
                eb.platform.ios || 2 != d.originalEvent.touches.length
                  ? c.Lb || ((c.Lb = e.pageX), (c.Jc = e.pageY))
                  : c.Lb ||
                    ((f =
                      d.originalEvent.touches[1] ||
                      d.originalEvent.changedTouches[1]),
                    f.pageX > e.pageX
                      ? ((c.Lb = e.pageX + (f.pageX - e.pageX) / 2),
                        (c.Jc = e.pageY + (f.pageY - e.pageY) / 2))
                      : ((c.Lb = f.pageX + (e.pageX - f.pageX) / 2),
                        (c.Jc = f.pageY + (e.pageY - f.pageY) / 2))),
                c.rg ||
                  c.H.renderer.ua ||
                  (jQuery('.flowpaper_flipview_canvas').show(),
                  jQuery('.flowpaper_flipview_canvas_highres').hide(),
                  (c.rg = !0)),
                (1 == d.originalEvent.touches.length || eb.platform.ios) &&
                  c.ql(e.pageX, e.pageY),
                jQuery('.flowpaper_flipview_canvas').Pc(),
                jQuery(c.L + '_glyphcanvas')
                  .css('z-index', -1)
                  .Yb(),
                d.preventDefault())
            }
          })
          jQuery(c.L + '_parent, ' + c.L).on(
            !eb.platform.touchonlydevice || eb.platform.mobilepreview
              ? 'mousedown'
              : 'touchstart',
            function () {
              c.Sf = new Date().getTime()
            }
          )
          jQuery(c.L + '_parent').on('mouseup touchend', function (d) {
            !c.H.oc ||
            null != c.ka ||
            c.af ||
            c.H.Ca.turn('cornerActivated') ||
            c.animating ||
            c.Wb
              ? c.H.oc &&
                0 == c.H.J.Va.position().top &&
                c.H.J.Va.animate(
                  { opacity: 0, top: '-' + c.H.J.Va.height() + 'px' },
                  300
                )
              : setTimeout(function () {
                  !jQuery(d.target).hasClass('flowpaper_arrow') &&
                  1 == c.H.scale &&
                  c.Sf &&
                  c.Sf > new Date().getTime() - 1000
                    ? (jQuery(c.H.J.Va)
                        .find('.flowpaper_txtSearch')
                        .trigger('blur'),
                      0 == c.H.J.Va.position().top
                        ? c.H.J.Va.animate(
                            { opacity: 0, top: '-' + c.H.J.Va.height() + 'px' },
                            300
                          )
                        : c.H.J.Va.animate({ opacity: 1, top: '0px' }, 300))
                    : (c.Sf = null)
                }, 600)
            if (null != c.ob) {
              c.Tj = c.ob < c.ka
              c.ob = null
              c.Qf = null
              c.Lb = null
              c.Jc = null
              1.1 > c.ka && (c.ka = 1)
              c.H.scale = c.ka
              for (var e = 0; e < c.document.numPages; e++) {
                c.$a(e) && ((c.pages[e].scale = c.H.scale), c.pages[e].Ya())
              }
              c.Wd()
              setTimeout(function () {
                1 == c.H.scale &&
                  (c.V(c.L).transition({ x: 0, y: 0 }, 0),
                  c.H.Ca.turn('setCornerDragging', !0),
                  c.H.J.qb &&
                    (c.H.ea.show(), c.H.ea.animate({ opacity: 1 }, 100)))
                1 < c.H.scale &&
                  c.H.J.qb &&
                  c.H.ea.animate({ opacity: 0 }, 0, function () {
                    c.H.ea.hide()
                  })
                for (var d = 0; d < c.document.numPages; d++) {
                  c.$a(d) && (c.pages[d].va = !1)
                }
                c.V(c.L + '_parent').css('will-change', '')
                c.Cd()
                jQuery(c).trigger('onScaleChanged')
                c.ka = null
              }, 500)
            }
            1 < c.H.scale
              ? ((e = c.V(c.L).css('transform') + ''),
                null != e &&
                  ((e = e.replace('translate', '')),
                  (e = e.replace('(', '')),
                  (e = e.replace(')', '')),
                  (e = e.replace('px', '')),
                  (e = e.split(',')),
                  (c.zd = parseFloat(e[0])),
                  (c.Te = parseFloat(e[1])),
                  isNaN(c.zd) && ((c.zd = 0), (c.Te = 0))),
                c.Lb &&
                  1.9 < c.H.scale &&
                  (jQuery('.flowpaper_flipview_canvas_highres').show(),
                  jQuery('.flowpaper_flipview_canvas').hide()),
                c.H.renderer.Bb &&
                  c.H.renderer.yb &&
                  1.9 < c.H.scale &&
                  ((e = 1 < c.Z ? c.Z - 1 : c.Z),
                  1 < c.Z && c.H.renderer.hd(c.pages[e - 1]),
                  c.H.renderer.hd(c.pages[e])),
                null != c.Lb && c.Wd(null != c.ka ? c.ka : c.H.scale),
                0 != c.zd && c.bq())
              : ((c.zd = 0), (c.Te = 0))
            c.rg = !1
            c.Lb = null
            c.Jc = null
          })
          jQuery(c.L + '_parent').on('gesturechange', function (d) {
            d.preventDefault()
            if (!c.H.J.tf) {
              null == c.ob && (c.ob = d.originalEvent.scale)
              c.H.Ca.turn('setCornerDragging', !1)
              c.ka =
                c.H.scale +
                (c.ob > c.H.scale
                  ? (d.originalEvent.scale - c.ob) / 2
                  : 4 * (d.originalEvent.scale - c.ob))
              1 > c.ka && (c.ka = 1)
              3 < c.ka && !eb.platform.ge && !c.H.renderer.ua && (c.ka = 3)
              c.H.renderer.yb &&
                4 < c.ka &&
                eb.platform.ipad &&
                !c.H.renderer.ua &&
                (c.ka = 4)
              !c.H.renderer.yb &&
                3 < c.ka &&
                (eb.platform.ipad || eb.platform.iphone) &&
                !c.H.renderer.ua &&
                (c.ka = 3)
              d = 1 != c.H.ma || c.H.J.fa ? 0 : -(c.Zc() / 4)
              if (1 == c.ob && c.H.J.fa && c.H.renderer.ua) {
                for (var e = 0; e < c.document.numPages; e++) {
                  c.$a(e) && e != c.Z - 1 && jQuery(c.pages[e].da).Yb()
                }
              }
              c.V(c.L + '_parent').transition(
                { x: d, y: c.H.jc, scale: c.ka },
                0,
                'ease',
                function () {}
              )
            }
          })
          jQuery(c.L + '_parent').on('gestureend', function (d) {
            d.preventDefault()
            if (!c.H.J.tf) {
              c.ai = c.ka < c.H.scale || c.ai
              c.H.scale = c.ka
              for (d = 0; d < c.document.numPages; d++) {
                c.$a(d) && ((c.pages[d].scale = c.H.scale), c.pages[d].Ya())
              }
              c.Wd()
              setTimeout(function () {
                1 == c.H.scale &&
                  (c.V(c.L).transition({ x: 0, y: 0 }, 0),
                  c.H.Ca.turn('setCornerDragging', !0))
                for (var d = 0; d < c.document.numPages; d++) {
                  c.$a(d) && (c.pages[d].va = !1)
                }
                c.Cd()
                jQuery(c).trigger('onScaleChanged')
                c.ka = null
              }, 500)
            }
          })
          jQuery(c.L + '_parent').on('mousewheel', function (d) {
            if (
              !(
                c.Zd() ||
                c.H.PreviewMode ||
                (c.H.Ca.turn('cornerActivated') && c.H.Ca.turn('stop'),
                c.H.J.tf || c.H.J.Po)
              )
            ) {
              d.preventDefault && d.preventDefault()
              d.returnValue = !1
              c.Yd || (c.Yd = 0)
              0 < d.deltaY
                ? c.H.scale + c.Yd + 2 * c.H.document.ZoomInterval <
                    c.H.document.MaxZoomSize &&
                  (c.Yd = c.Yd + 2 * c.H.document.ZoomInterval)
                : (c.Yd =
                    1.2 < c.H.scale + c.Yd - 3 * c.H.document.ZoomInterval
                      ? c.Yd - 3 * c.H.document.ZoomInterval
                      : -(c.H.scale - 1))
              null != c.Ve && (window.clearTimeout(c.Ve), (c.Ve = null))
              1.1 <= c.H.scale + c.Yd
                ? (c.H.J.qb &&
                    c.H.ea.animate({ opacity: 0 }, 0, function () {
                      c.H.ea.hide()
                    }),
                  c.V(c.L + '_panelLeft').finish(),
                  c.V(c.L + '_panelRight').finish(),
                  c.V(c.L + '_panelLeft').fadeTo('fast', 0),
                  c.V(c.L + '_panelRight').fadeTo('fast', 0),
                  c.H.Ca.turn('setCornerDragging', !1))
                : (c.V(c.L + '_panelLeft').finish(),
                  c.V(c.L + '_panelRight').finish(),
                  1 < c.Z
                    ? c.V(c.L + '_panelLeft').fadeTo('fast', 1)
                    : c.V(c.L + '_panelLeft').fadeTo('fast', 0),
                  c.H.ma < c.H.getTotalPages() &&
                    c.V(c.L + '_panelRight').fadeTo('fast', 1),
                  c.V(c.L).transition({ x: 0, y: 0 }, 0),
                  c.H.J.qb &&
                    (c.H.ea.show(), c.H.ea.animate({ opacity: 1 }, 100)),
                  (c.Lb = null),
                  (c.Jc = null),
                  (c.zd = 0),
                  (c.Te = 0))
              1 != c.H.scale || c.gd || c.Qg(d.target, d.pageX, d.pageY)
              c.gd = c.H.scale + c.Yd
              1 > c.gd && (c.gd = 1)
              if (
                !(eb.browser.mozilla && 30 > eb.browser.version) &&
                0 < jQuery(c.L).find(d.target).length
              ) {
                if (1 == c.gd) {
                  if (c.H.J.fa && c.H.renderer.ua) {
                    for (d = 0; d < c.document.numPages; d++) {
                      jQuery(c.pages[d].da).Pc()
                    }
                  }
                  c.V(c.L + '_parent').transition(
                    { transformOrigin: '0px 0px' },
                    0
                  )
                } else {
                  if (
                    (1 == c.H.scale &&
                      c
                        .V(c.L + '_parent')
                        .transition({ transformOrigin: '0px 0px' }, 0),
                    c.H.Ca.turn('setCornerDragging', !1),
                    0 < jQuery(c.L).has(d.target).length)
                  ) {
                    d = jQuery(c.L + '_parent').ng(d.pageX, d.pageY)
                    var e = c
                      .V(c.L + '_parent')
                      .css('transformOrigin')
                      .split(' ')
                    2 <= e.length
                      ? ((e[0] = e[0].replace('px', '')),
                        (e[1] = e[1].replace('px', '')),
                        (c.Ud = parseFloat(e[0])),
                        (c.Vd = parseFloat(e[1])),
                        0 == c.Ud && (c.Ud = d.x),
                        0 == c.Vd && (c.Vd = d.y))
                      : ((c.Ud = d.x), (c.Vd = d.y))
                    c.V(c.L + '_parent').transition(
                      { transformOrigin: c.Ud + 'px ' + c.Vd + 'px' },
                      0,
                      null,
                      function () {
                        if (eb.platform.touchonlydevice) {
                          c.H.scale = c.gd
                          for (var d = 0; d < c.document.numPages; d++) {
                            c.$a(d) &&
                              ((c.pages[d].scale = c.gd), c.pages[d].Ya())
                          }
                          c.Wd()
                        }
                      }
                    )
                  }
                }
              }
              jQuery('.flowpaper_flipview_canvas').Pc()
              jQuery('.flowpaper_flipview_canvas_highres').Yb()
              jQuery(c.L + '_glyphcanvas')
                .css('z-index', -1)
                .Yb()
              c.H.Ca.turn('setCornerDragging', !1)
              c.V(c.L + '_parent').transition(
                { scale: c.gd },
                0,
                'ease',
                function () {
                  window.clearTimeout(c.Ve)
                  c.Ve = setTimeout(function () {
                    c.H.scale == c.gd && c.Wd()
                    c.H.scale = c.gd
                    for (var d = (c.Yd = 0); d < c.document.numPages; d++) {
                      c.$a(d) &&
                        ((c.pages[d].scale = c.H.scale), c.pages[d].Ya())
                    }
                    1 == c.H.scale &&
                      (c.V(c.L).transition({ x: 0, y: 0 }, 0),
                      c.H.Ca.turn('setCornerDragging', !0))
                    for (d = 0; d < c.document.numPages; d++) {
                      c.$a(d) && (c.pages[d].va = !1)
                    }
                    c.Cd()
                    c.gd = null
                    jQuery(c).trigger('onScaleChanged')
                    jQuery(c.H.M).trigger(
                      'onScaleChanged',
                      c.H.scale / c.H.document.MaxZoomSize
                    )
                  }, 150)
                }
              )
            }
          })
          jQuery(c.L + '_arrowleft, ' + c.L + '_panelLeft').on(
            !eb.platform.touchonlydevice || eb.platform.mobilepreview
              ? 'mouseup'
              : 'touchend',
            function (d) {
              if (c.H.J.Mf) {
                return (
                  jQuery(d.target).hasClass('flowpaper_arrow_start')
                    ? c.H.document.RTLMode
                      ? c.gotoPage(c.H.getTotalPages())
                      : c.gotoPage(1)
                    : c.previous(),
                  !1
                )
              }
            }
          )
          jQuery(c.L + '_arrowright, ' + c.L + '_panelRight').on(
            !eb.platform.touchonlydevice || eb.platform.mobilepreview
              ? 'mouseup'
              : 'touchend',
            function (d) {
              jQuery(d.target).hasClass('flowpaper_arrow_end')
                ? c.H.document.RTLMode
                  ? c.gotoPage(1)
                  : c.gotoPage(c.H.getTotalPages())
                : c.next()
              return !1
            }
          )
          jQuery(d).css('overflow-y', 'hidden')
          jQuery(d).css('overflow-x', 'hidden')
          jQuery(d).css('-webkit-overflow-scrolling', 'hidden')
        }
      },
      Di: function (c, d) {
        c.H.Fd ||
          ((c.tm = d.append(
            "<div id='" +
              c.container +
              "_play' onclick='$FlowPaper(\"" +
              c.aa +
              "\").openFullScreen()' class='abc' style='position:absolute;left:" +
              (d.width() / 2 - 20) +
              'px;top:' +
              (d.height() / 2 - 50) +
              'px;width:' +
              c.ud +
              'px;height:' +
              c.vh +
              "px;z-index:100;'></div>"
          )),
          jQuery('#' + c.container + '_play').Rd(50, '#AAAAAA', !0),
          jQuery('.flowpaper_viewer_container').bind(
            'mousedown.flowpaper',
            c.H.fq
          ))
      },
      yq: function (c, d) {
        d.find('#' + c.container + '_play').remove()
        c.tm = null
      },
      previous: function (c) {
        if ('FlipView' == c.H.I) {
          var d = c.Z - 1
          c.H.renderer.Ge && c.Gf(d)
          1 != c.H.scale
            ? c.Ya(1, !0, function () {
                jQuery(c.H.M).trigger(
                  'onScaleChanged',
                  1 / c.H.document.MaxZoomSize
                )
                c.H.turn('previous')
              })
            : c.H.turn('previous')
        }
      },
      next: function (c) {
        if ('FlipView' == c.H.I) {
          var d = c.Z
          if (
            d < c.H.getTotalPages() ||
            (d == c.H.getTotalPages() && c.H.J.fa && !c.H.J.enableWebGL)
          ) {
            d++,
              c.H.renderer.Ge && c.Gf(d),
              1 != c.H.scale
                ? c.Ya(1, !0, function () {
                    jQuery(c.H.M).trigger(
                      'onScaleChanged',
                      1 / c.H.document.MaxZoomSize
                    )
                    c.H.turn('next')
                  })
                : c.H.turn('next')
          }
        }
      },
      Fh: function (c, d, e) {
        if (!c.animating) {
          var f = c.N.width(),
            h = c.N.height(),
            l = null == c.gd ? c.H.scale : c.gd
          'FlipView' == c.H.I && 1 < l && !eb.browser.safari
            ? c.V(c.L).transition({ x: -c.mp(d, c.H.scale), y: -c.np(e) }, 0)
            : 'FlipView' == c.H.I &&
              1 < l &&
              eb.browser.safari &&
              jQuery('.flowpaper_viewer').scrollTo(
                { top: ((0.9 * e) / h) * 100 + '%', left: (d / f) * 100 + '%' },
                0,
                { axis: 'xy' }
              )
        }
      },
      tj: function (c) {
        c = c.V(c.L + '_parent').css('transformOrigin') + ''
        return null != c
          ? ((c = c.replace('translate', '')),
            (c = c.replace('(', '')),
            (c = c.replace(')', '')),
            (c = c.split(' ')),
            1 < c.length
              ? {
                  left: parseFloat(c[0].replace('px', '')),
                  top: parseFloat(c[1].replace('px', '')),
                }
              : null)
          : null
      },
      kf: function (c) {
        !eb.platform.touchdevice && 'FlipView' == c.H.I && 1 < c.H.scale
          ? jQuery('.flowpaper_viewer').scrollTo({ left: '50%' }, 0, {
              axis: 'x',
            })
          : eb.platform.touchdevice ||
            'FlipView' != c.H.I ||
            1 != c.H.scale ||
            c.kc() ||
            jQuery('.flowpaper_viewer').scrollTo({ left: '0%', top: '0%' }, 0, {
              axis: 'xy',
            })
      },
    }
    return f
  })(),
  X = (window.hs = X || {}),
  Y = X
Y.ri = {
  PI: Math.PI,
  kt: 1 / Math.PI,
  wp: 0.5 * Math.PI,
  Wo: 2 * Math.PI,
  Qt: Math.PI / 180,
  Pt: 180 / Math.PI,
}
Y.Ae = { NONE: 0, LEFT: -1, RIGHT: 1, X: 1, Y: 2, zi: 4, rs: 0, ss: 1, ts: 2 }
Y.un = 'undefined' !== typeof Float32Array ? Float32Array : Array
Y.Xr = 'undefined' !== typeof Float64Array ? Float64Array : Array
Y.Yr = 'undefined' !== typeof Int8Array ? Int8Array : Array
Y.Tr = 'undefined' !== typeof Int16Array ? Int16Array : Array
Y.Vr = 'undefined' !== typeof Int32Array ? Int32Array : Array
Y.Zr = 'undefined' !== typeof Uint8Array ? Uint8Array : Array
Y.Ur = 'undefined' !== typeof Uint16Array ? Uint16Array : Array
Y.Wr = 'undefined' !== typeof Uint32Array ? Uint32Array : Array
Y.yi = Y.un
!0
!(function (f, c) {
  var d = (f.Mk = ring.create({
    constructor: function (d, f) {
      this.x = d === c ? 0 : d
      this.y = f === c ? 0 : f
    },
    x: 0,
    y: 0,
    dispose: function () {
      this.y = this.x = null
      return this
    },
    serialize: function () {
      return { name: this.name, x: this.x, y: this.y }
    },
    Rb: function (c) {
      c && this.name === c.name && ((this.x = c.x), (this.y = c.y))
      return this
    },
    clone: function () {
      return new d(this.x, this.y)
    },
  }))
})(X)
!(function (f, c) {
  var d = Math.sin,
    e = Math.cos,
    g = f.Mk,
    h = (f.Hn = ring.create({
      constructor: function (d, e, f, g) {
        this.m11 = d === c ? 1 : d
        this.m12 = e === c ? 0 : e
        this.m21 = f === c ? 0 : f
        this.m22 = g === c ? 1 : g
      },
      m11: 1,
      m12: 0,
      m21: 0,
      m22: 1,
      dispose: function () {
        this.m22 = this.m21 = this.m12 = this.m11 = null
        return this
      },
      serialize: function () {
        return {
          name: this.name,
          m11: this.m11,
          m12: this.m12,
          m21: this.m21,
          m22: this.m22,
        }
      },
      Rb: function (c) {
        c &&
          this.name === c.name &&
          ((this.m11 = c.m11),
          (this.m12 = c.m12),
          (this.m21 = c.m21),
          (this.m22 = c.m22))
        return this
      },
      reset: function () {
        this.m11 = 1
        this.m21 = this.m12 = 0
        this.m22 = 1
        return this
      },
      rotate: function (c) {
        var f = e(c)
        c = d(c)
        this.m11 = f
        this.m12 = -c
        this.m21 = c
        this.m22 = f
        return this
      },
      scale: function (d, e) {
        this.m21 = this.m12 = 0
        this.m22 = this.m11 = 1
        d !== c && (this.m22 = this.m11 = d)
        e !== c && (this.m22 = e)
        return this
      },
      multiply: function (c) {
        var d = this.m11,
          e = this.m12,
          f = this.m21,
          g = this.m22,
          h = c.m11,
          q = c.m12,
          r = c.m21
        c = c.m22
        this.m11 = d * h + e * r
        this.m12 = d * q + e * c
        this.m21 = f * h + g * r
        this.m22 = f * q + g * c
        return this
      },
      Rt: function (c) {
        var d = c.x
        c = c.y
        return new g(this.m11 * d + this.m12 * c, this.m21 * d + this.m22 * c)
      },
      Ym: function (c) {
        var d = c.x,
          e = c.y
        c.x = this.m11 * d + this.m12 * e
        c.y = this.m21 * d + this.m22 * e
        return c
      },
      clone: function () {
        return new h(this.m11, this.m12, this.m21, this.m22)
      },
    }))
})(X)
!(function (f, c) {
  var d = Math.sqrt,
    e = f.yi,
    g = (f.Vector3 = ring.create({
      constructor: function (d, f, g) {
        d && d.length
          ? (this.la = new e([d[0], d[1], d[2]]))
          : ((d = d === c ? 0 : d),
            (f = f === c ? 0 : f),
            (g = g === c ? 0 : g),
            (this.la = new e([d, f, g])))
      },
      la: null,
      dispose: function () {
        this.la = null
        return this
      },
      serialize: function () {
        return { name: this.name, la: this.la }
      },
      Rb: function (c) {
        c && this.name === c.name && (this.la = c.la)
        return this
      },
      ee: function () {
        return new e(this.la)
      },
      Pl: function () {
        return this.la
      },
      setXYZ: function (c) {
        this.la = new e(c)
        return this
      },
      Mm: function (c) {
        this.la = c
        return this
      },
      clone: function () {
        return new g(this.la)
      },
      Ms: function (c) {
        var d = this.la
        c = c.la
        return d[0] == c[0] && d[1] == c[1] && d[2] == c[2]
      },
      eu: function () {
        this.la[0] = 0
        this.la[1] = 0
        this.la[2] = 0
        return this
      },
      negate: function () {
        var c = this.la
        return new g([-c[0], -c[1], -c[2]])
      },
      yt: function () {
        var c = this.la
        c[0] = -c[0]
        c[1] = -c[1]
        c[2] = -c[2]
        return this
      },
      add: function (c) {
        var d = this.la
        c = c.la
        return new g([d[0] + c[0], d[1] + c[1], d[2] + c[2]])
      },
      lo: function (c) {
        var d = this.la
        c = c.la
        d[0] += c[0]
        d[1] += c[1]
        d[2] += c[2]
        return this
      },
      Lt: function (c) {
        var d = this.la
        c = c.la
        return new g([d[0] - c[0], d[1] - c[1], d[2] - c[2]])
      },
      Mt: function (c) {
        var d = this.la
        c = c.la
        d[0] -= c[0]
        d[1] -= c[1]
        d[2] -= c[2]
        return this
      },
      multiplyScalar: function (c) {
        var d = this.la
        return new g([d[0] * c, d[1] * c, d[2] * c])
      },
      vt: function (c) {
        var d = this.la
        d[0] *= c
        d[1] *= c
        d[2] *= c
        return this
      },
      multiply: function (c) {
        var d = this.la
        c = c.la
        return new g([d[0] * c[0], d[1] * c[1], d[2] * c[2]])
      },
      wt: function (c) {
        var d = this.la
        c = c.la
        d[0] *= c[0]
        d[1] *= c[1]
        d[2] *= c[2]
        return this
      },
      divide: function (c) {
        c = 1 / c
        var d = this.la
        return new g([d[0] * c, d[1] * c, d[2] * c])
      },
      Is: function (c) {
        c = 1 / c
        var d = this.la
        d[0] *= c
        d[1] *= c
        d[2] *= c
        return this
      },
      normalize: function () {
        var c = this.la,
          e = c[0],
          f = c[1],
          c = c[2],
          m = e * e + f * f + c * c
        0 < m && ((m = 1 / d(m)), (e *= m), (f *= m), (c *= m))
        return new g([e, f, c])
      },
      aq: function () {
        var c = this.la,
          e = c[0],
          f = c[1],
          g = c[2],
          p = e * e + f * f + g * g
        0 < p && ((p = 1 / d(p)), (e *= p), (f *= p), (g *= p))
        c[0] = e
        c[1] = f
        c[2] = g
        return this
      },
      Ts: function () {
        var c = this.la,
          e = c[0],
          f = c[1],
          c = c[2]
        return d(e * e + f * f + c * c)
      },
      It: function (c) {
        this.aq()
        var d = this.la
        d[0] *= c
        d[1] *= c
        d[2] *= c
        return this
      },
      Js: function (c) {
        var d = this.la
        c = c.la
        return d[0] * c[0] + d[1] * c[1] + d[2] * c[2]
      },
      Bs: function (c) {
        var d = this.la,
          e = c.la
        c = d[0]
        var f = d[1],
          g = d[2],
          n = e[0],
          t = e[1],
          e = e[2]
        d[0] = f * e - g * t
        d[1] = g * n - c * e
        d[2] = c * t - f * n
        return this
      },
      Hs: function (c) {
        var e = this.la,
          f = c.la
        c = e[0] - f[0]
        var g = e[1] - f[1],
          e = e[2] - f[2]
        return d(c * c + g * g + e * e)
      },
      toString: function () {
        return '[' + this.la[0] + ' , ' + this.la[1] + ' , ' + this.la[2] + ']'
      },
    }))
  f.Vector3.ZERO = function () {
    return new g([0, 0, 0])
  }
  f.Vector3.dot = function (c, d) {
    var e = c.la,
      f = d.la
    return e[0] * f[0] + e[1] * f[1] + e[2] * f[2]
  }
  f.Vector3.equals = function (c, d) {
    var e = c.la,
      f = d.la
    return e[0] == f[0] && e[1] == f[1] && e[2] == f[2]
  }
  f.Vector3.cross = function (c, d) {
    var e = c.la,
      f = d.la,
      p = e[0],
      n = e[1],
      e = e[2],
      t = f[0],
      q = f[1],
      f = f[2]
    return new g([n * f - e * q, e * t - p * f, p * q - n * t])
  }
  f.Vector3.distance = function (c, e) {
    var f = c.la,
      g = e.la,
      p = f[0] - g[0],
      n = f[1] - g[1],
      f = f[2] - g[2]
    return d(p * p + n * n + f * f)
  }
  f.Vector3.Nt = function (c, d) {
    var e = c.la,
      f = d.la
    return new g([e[0] + f[0], e[1] + f[1], e[2] + f[2]])
  }
})(X)
!(function (f, c) {
  var d = f.Ae,
    e = d.X,
    g = d.Y,
    h = d.zi,
    l = f.Vector3,
    k = f.yi
  f.Ig = ring.create({
    constructor: function (d) {
      this.la = new k([0, 0, 0])
      this.fc = new k([0, 0, 0])
      this.ratio = new k([0, 0, 0])
      c !== d && null !== d && !1 !== d && this.Lm(d)
    },
    ub: null,
    la: null,
    fc: null,
    ratio: null,
    dispose: function () {
      this.ratio = this.fc = this.la = this.ub = null
      return this
    },
    serialize: function () {
      return { ub: this.name, la: this.ee(), fc: this.fc, ratio: this.ratio }
    },
    Rb: function (c) {
      c && (this.setXYZ(c.la), (this.fc = c.fc), (this.ratio = c.ratio))
      return this
    },
    Lm: function (c) {
      this.ub = c
      return this
    },
    Zs: function () {
      return new l(this.ratio)
    },
    Ys: function (c) {
      switch (c) {
        case e:
          return this.ratio[0]
        case g:
          return this.ratio[1]
        case h:
          return this.ratio[2]
      }
      return -1
    },
    Xs: function (c) {
      switch (c) {
        case e:
          return this.fc[0]
        case g:
          return this.fc[1]
        case h:
          return this.fc[2]
      }
      return 0
    },
    Pq: function (d, e, f) {
      d = d === c ? 0 : d
      e = e === c ? 0 : e
      f = f === c ? 0 : f
      this.ratio = new k([d, e, f])
      return this
    },
    Nq: function (d, e, f) {
      d = d === c ? 0 : d
      e = e === c ? 0 : e
      f = f === c ? 0 : f
      this.fc = new k([d, e, f])
      return this
    },
    ee: function () {
      return new k(this.la)
    },
    Pl: function () {
      return this.la
    },
    getX: function () {
      return this.la[0]
    },
    getY: function () {
      return this.la[1]
    },
    getZ: function () {
      return this.la[2]
    },
    setXYZ: function (c) {
      this.la = new k(c)
      return this
    },
    Mm: function (c) {
      this.la = c
      return this
    },
    setX: function (c) {
      this.la[0] = c
      return this
    },
    setY: function (c) {
      this.la[1] = c
      return this
    },
    setZ: function (c) {
      this.la[2] = c
      return this
    },
    getValue: function (c) {
      switch (c) {
        case e:
          return this.getX()
        case g:
          return this.getY()
        case h:
          return this.getZ()
      }
      return 0
    },
    setValue: function (c, d) {
      switch (c) {
        case e:
          this.setX(d)
          break
        case g:
          this.setY(d)
          break
        case h:
          this.setZ(d)
      }
      return this
    },
    reset: function () {
      this.setXYZ(this.fc)
      return this
    },
    collapse: function () {
      this.fc = this.ee()
      return this
    },
    Ll: function () {
      return new l(this.ee())
    },
    Km: function (c) {
      this.setXYZ(c.la)
    },
  })
})(X)
!(function (f, c) {
  var d = f.Ae,
    e = d.X,
    g = d.Y,
    h = d.zi,
    l = Math.min,
    k = Math.max,
    m,
    p
  m = function (c) {
    return c ? c.serialize() : c
  }
  p = f.am
    ? function (c) {
        return c && c.ub ? new f.Ig().Rb(c) : c
      }
    : function (c, d) {
        return c && c.ub ? this.vertices[d].Rb(c) : c
      }
  f.rh = ring.create({
    constructor: function (d) {
      this.depth =
        this.height =
        this.width =
        this.Nc =
        this.Bc =
        this.Ac =
        this.le =
        this.ke =
        this.je =
        this.Se =
        this.Re =
        this.Qe =
          null
      this.vertices = []
      this.faces = []
      this.sa = null
      c !== d && this.mk(d)
    },
    Qe: null,
    Re: null,
    Se: null,
    je: null,
    ke: null,
    le: null,
    Ac: null,
    Bc: null,
    Nc: null,
    width: null,
    height: null,
    depth: null,
    vertices: null,
    faces: null,
    sa: null,
    dispose: function () {
      this.depth =
        this.height =
        this.width =
        this.Nc =
        this.Bc =
        this.Ac =
        this.le =
        this.ke =
        this.je =
        this.Se =
        this.Re =
        this.Qe =
          null
      this.Al()
      this.Bl()
      this.sa = null
      return this
    },
    Bl: function () {
      var c, d
      if (this.vertices) {
        for (d = this.vertices.length, c = 0; c < d; c++) {
          this.vertices[c].dispose()
        }
      }
      this.vertices = null
      return this
    },
    Al: function () {
      var c, d
      if (this.faces) {
        for (d = this.faces.length, c = 0; c < d; c++) {
          this.faces[c].dispose()
        }
      }
      this.faces = null
      return this
    },
    serialize: function () {
      return {
        sa: this.name,
        Qe: this.Qe,
        Re: this.Re,
        Se: this.Se,
        je: this.je,
        ke: this.ke,
        le: this.le,
        Ac: this.Ac,
        Bc: this.Bc,
        Nc: this.Nc,
        width: this.width,
        height: this.height,
        depth: this.depth,
        vertices: this.vertices ? this.vertices.map(m) : null,
        faces: null,
      }
    },
    Rb: function (c) {
      c &&
        (f.am && (this.Al(), this.Bl()),
        (this.Qe = c.Qe),
        (this.Re = c.Re),
        (this.Se = c.Se),
        (this.je = c.je),
        (this.ke = c.ke),
        (this.le = c.le),
        (this.Ac = c.Ac),
        (this.Bc = c.Bc),
        (this.Nc = c.Nc),
        (this.width = c.width),
        (this.height = c.height),
        (this.depth = c.depth),
        (this.vertices = (c.vertices || []).map(p, this)),
        (this.faces = null))
      return this
    },
    mk: function (c) {
      this.sa = c
      this.vertices = []
      return this
    },
    Ml: function () {
      return this.vertices
    },
    Rs: function () {
      return this.faces
    },
    $k: function () {
      var c = this.vertices,
        d = c.length,
        f = d,
        m,
        p,
        v,
        A,
        x,
        w,
        B,
        C,
        M,
        E,
        J
      for (
        d &&
        ((m = c[0]),
        (p = m.ee()),
        (v = p[0]),
        (A = p[1]),
        (p = p[2]),
        (x = w = v),
        (B = C = A),
        (M = E = p));
        0 <= --f;

      ) {
        ;(m = c[f]),
          (p = m.ee()),
          (v = p[0]),
          (A = p[1]),
          (p = p[2]),
          m.Nq(v, A, p),
          (x = l(x, v)),
          (B = l(B, A)),
          (M = l(M, p)),
          (w = k(w, v)),
          (C = k(C, A)),
          (E = k(E, p))
      }
      v = w - x
      A = C - B
      J = E - M
      this.width = v
      this.height = A
      this.depth = J
      this.je = x
      this.Qe = w
      this.ke = B
      this.Re = C
      this.le = M
      this.Se = E
      f = k(v, A, J)
      m = l(v, A, J)
      f == v && m == A
        ? ((this.Nc = g), (this.Bc = h), (this.Ac = e))
        : f == v && m == J
        ? ((this.Nc = h), (this.Bc = g), (this.Ac = e))
        : f == A && m == v
        ? ((this.Nc = e), (this.Bc = h), (this.Ac = g))
        : f == A && m == J
        ? ((this.Nc = h), (this.Bc = e), (this.Ac = g))
        : f == J && m == v
        ? ((this.Nc = e), (this.Bc = g), (this.Ac = h))
        : f == J && m == A && ((this.Nc = g), (this.Bc = e), (this.Ac = h))
      for (f = d; 0 <= --f; ) {
        ;(m = c[f]),
          (p = m.ee()),
          m.Pq((p[0] - x) / v, (p[1] - B) / A, (p[2] - M) / J)
      }
      return this
    },
    Dq: function () {
      for (var c = this.vertices, d = c.length; 0 <= --d; ) {
        c[d].reset()
      }
      this.update()
      return this
    },
    Jo: function () {
      for (var c = this.vertices, d = c.length; 0 <= --d; ) {
        c[d].collapse()
      }
      this.update()
      this.$k()
      return this
    },
    sp: function (c) {
      switch (c) {
        case e:
          return this.je
        case g:
          return this.ke
        case h:
          return this.le
      }
      return -1
    },
    Us: function (c) {
      switch (c) {
        case e:
          return this.Qe
        case g:
          return this.Re
        case h:
          return this.Se
      }
      return -1
    },
    getSize: function (c) {
      switch (c) {
        case e:
          return this.width
        case g:
          return this.height
        case h:
          return this.depth
      }
      return -1
    },
    update: function () {
      return this
    },
    Dt: function () {
      return this
    },
    $m: function () {
      return this
    },
  })
})(X)
!(function (f) {
  var c = 0,
    d = f.Ae.NONE
  f.Lk = ring.create({
    constructor: function (e) {
      this.id = ++c
      this.ya = e || null
      this.yc = this.hf = d
      this.enabled = !0
    },
    id: null,
    ya: null,
    hf: null,
    yc: null,
    enabled: !0,
    dispose: function (c) {
      !0 === c && this.ya && this.ya.dispose()
      this.yc = this.hf = this.name = this.ya = null
      return this
    },
    serialize: function () {
      return {
        Md: this.name,
        params: { hf: this.hf, yc: this.yc, enabled: !!this.enabled },
      }
    },
    Rb: function (c) {
      c &&
        this.name === c.Md &&
        ((c = c.params),
        (this.hf = c.hf),
        (this.yc = c.yc),
        (this.enabled = c.enabled))
      return this
    },
    enable: function (c) {
      return arguments.length ? ((this.enabled = !!c), this) : this.enabled
    },
    ys: function (c) {
      this.hf = c || d
      return this
    },
    Ht: function (c) {
      this.yc = c || d
      return this
    },
    fi: function (c) {
      this.ya = c
      return this
    },
    Ml: function () {
      return this.ya ? this.ya.Ml() : null
    },
    cg: function () {
      return this
    },
    apply: function (c) {
      var d = this
      d._worker
        ? d
            .bind('apply', function (f) {
              d.unbind('apply')
              f && f.eh && (d.ya.Rb(f.eh), d.ya.update())
              c && c.call(d)
            })
            .send('apply', { params: d.serialize(), eh: d.ya.serialize() })
        : (d.cg(), c && c.call(d))
      return d
    },
    toString: function () {
      return '[Modifier ' + this.name + ']'
    },
  })
})(X)
!(function (f) {
  f.wi = ring.create({
    constructor: function () {
      this.Mj = f.rh
      this.gn = f.Ig
    },
    Mj: null,
    gn: null,
  })
  var c = ring.create({
    rp: function (c) {
      if (arguments.length) {
        var e = c.Mj
        return e ? new e() : null
      }
      return null
    },
    tp: function (c) {
      return c && c.Md && f[c.Md] ? new f[c.Md]() : null
    },
    Ss: function (c) {
      return c && c.fm && f[c.fm] ? new f[c.fm]() : new f.wi()
    },
    Vs: function (c) {
      return c && c.sa && f[c.sa] ? new f.rh().Rb(c) : new f.rh()
    },
    $s: function (c) {
      return c && c.ub && f[c.ub] ? new f.Ig().Rb(c) : new f.Ig()
    },
  })
  f.Ik = new c()
})(X)
!(function (f) {
  function c(c) {
    return c ? c.serialize() : c
  }
  var d = f.Ik.rp,
    e = (f.Kn = ring.create({
      constructor: function (c, e) {
        this.ya = null
        this.stack = []
        this.Hj = f.am ? new f.wi() : c
        this.ya = d(this.Hj)
        e && (this.ya.mk(e), this.ya.$k())
      },
      Hj: null,
      ya: null,
      stack: null,
      dispose: function (c) {
        this.Hj = null
        if (c && this.stack) {
          for (; this.stack.length; ) {
            this.stack.pop().dispose()
          }
        }
        this.stack = null
        this.ya && this.ya.dispose()
        this.ya = null
        return this
      },
      serialize: function () {
        return { Md: this.name, params: { Zp: this.stack.map(c) } }
      },
      Rb: function (c) {
        if (c && this.name === c.Md) {
          c = c.params.Zp
          var d = this.stack,
            e
          if (c.length !== d.length) {
            for (e = d.length = 0; e < c.length; e++) {
              d.push(f.Ik.tp(c[e]))
            }
          }
          for (e = 0; e < d.length; e++) {
            d[e] = d[e].Rb(c[e]).fi(this.ya)
          }
          this.stack = d
        }
        return this
      },
      fi: function (c) {
        this.ya = c
        return this
      },
      add: function (c) {
        c && (c.fi(this.ya), this.stack.push(c))
        return this
      },
      cg: function () {
        if (this.ya && this.stack && this.stack.length) {
          var c = this.stack,
            d = c.length,
            e = this.ya,
            f = 0
          for (e.Dq(); f < d; ) {
            c[f].enabled && c[f].cg(), f++
          }
          e.update()
        }
        return this
      },
      apply: function (c) {
        var d = this
        d._worker
          ? d
              .bind('apply', function (e) {
                d.unbind('apply')
                e && e.eh && (d.ya.Rb(e.eh), d.ya.update())
                c && c.call(d)
              })
              .send('apply', { params: d.serialize(), eh: d.ya.serialize() })
          : (d.cg(), c && c.call(d))
        return d
      },
      collapse: function () {
        this.ya &&
          this.stack &&
          this.stack.length &&
          (this.apply(), this.ya.Jo(), (this.stack.length = 0))
        return this
      },
      clear: function () {
        this.stack && (this.stack.length = 0)
        return this
      },
      Ws: function () {
        return this.ya
      },
    }))
  e.prototype.Vk = e.prototype.add
})(X)
!(function (f) {
  var c = f.Vector3
  f.Rn = ring.create([f.Lk], {
    constructor: function (d, e, f) {
      this.$super()
      this.uc = new c([d || 0, e || 0, f || 0])
    },
    uc: null,
    dispose: function () {
      this.uc.dispose()
      this.uc = null
      this.$super()
      return this
    },
    serialize: function () {
      return {
        Md: this.name,
        params: { uc: this.uc.serialize(), enabled: !!this.enabled },
      }
    },
    Rb: function (c) {
      c &&
        this.name === c.Md &&
        ((c = c.params), this.uc.Rb(c.uc), (this.enabled = !!c.enabled))
      return this
    },
    Jt: function () {
      var d = this.ya
      this.uc = new c(
        -(d.je + 0.5 * d.width),
        -(d.ke + 0.5 * d.height),
        -(d.le + 0.5 * d.depth)
      )
      return this
    },
    cg: function () {
      for (var c = this.ya.vertices, e = c.length, f = this.uc, h; 0 <= --e; ) {
        ;(h = c[e]), h.Km(h.Ll().lo(f))
      }
      this.ya.$m(f.negate())
      return this
    },
  })
})(X)
!(function (f, c) {
  var d = f.Ae.NONE,
    e = f.Ae.LEFT,
    g = f.Ae.RIGHT,
    h = f.Hn,
    l = Math.atan,
    k = Math.sin,
    m = Math.cos,
    p = f.ri.PI,
    n = f.ri.wp,
    t = f.ri.Wo,
    q = f.Mk
  f.xn = ring.create([f.Lk], {
    constructor: function (e, f, g) {
      this.$super()
      this.yc = d
      this.origin = this.height = this.width = this.ie = this.min = this.max = 0
      this.Ld = this.Kd = null
      this.rf = 0
      this.se = !1
      this.force = e !== c ? e : 0
      this.offset = f !== c ? f : 0
      g !== c ? this.lh(g) : this.lh(0)
    },
    force: 0,
    offset: 0,
    angle: 0,
    rf: 0,
    max: 0,
    min: 0,
    ie: 0,
    width: 0,
    height: 0,
    origin: 0,
    Kd: null,
    Ld: null,
    se: !1,
    dispose: function () {
      this.origin =
        this.height =
        this.width =
        this.ie =
        this.min =
        this.max =
        this.rf =
        this.angle =
        this.offset =
        this.force =
          null
      this.Kd && this.Kd.dispose()
      this.Ld && this.Ld.dispose()
      this.se = this.Ld = this.Kd = null
      this.$super()
      return this
    },
    serialize: function () {
      return {
        Md: this.name,
        params: {
          force: this.force,
          offset: this.offset,
          angle: this.angle,
          rf: this.rf,
          max: this.max,
          min: this.min,
          ie: this.ie,
          width: this.width,
          height: this.height,
          origin: this.origin,
          Kd: this.Kd.serialize(),
          Ld: this.Ld.serialize(),
          se: this.se,
          yc: this.yc,
          enabled: !!this.enabled,
        },
      }
    },
    Rb: function (c) {
      c &&
        this.name === c.Md &&
        ((c = c.params),
        (this.force = c.force),
        (this.offset = c.offset),
        (this.angle = c.angle),
        (this.rf = c.rf),
        (this.max = c.max),
        (this.min = c.min),
        (this.ie = c.ie),
        (this.width = c.width),
        (this.height = c.height),
        (this.origin = c.origin),
        this.Kd.Rb(c.Kd),
        this.Ld.Rb(c.Ld),
        (this.se = c.se),
        (this.yc = c.yc),
        (this.enabled = !!c.enabled))
      return this
    },
    lh: function (c) {
      this.angle = c
      this.Kd = new h().rotate(c)
      this.Ld = new h().rotate(-c)
      return this
    },
    fi: function (c) {
      this.$super(c)
      this.max = this.se ? this.ya.Bc : this.ya.Ac
      this.min = this.ya.Nc
      this.ie = this.se ? this.ya.Ac : this.ya.Bc
      this.width = this.ya.getSize(this.max)
      this.height = this.ya.getSize(this.ie)
      this.origin = this.ya.sp(this.max)
      this.rf = l(this.width / this.height)
      return this
    },
    cg: function () {
      if (!this.force) {
        return this
      }
      for (
        var c = this.ya.vertices,
          d = c.length,
          f = this.yc,
          h = this.width,
          l = this.offset,
          w = this.origin,
          B = this.max,
          C = this.min,
          M = this.ie,
          E = this.Kd,
          J = this.Ld,
          F = w + h * l,
          D = h / p / this.force,
          y = (h / (D * t)) * t,
          z,
          G,
          K,
          L,
          I = 1 / h;
        0 <= --d;

      ) {
        ;(h = c[d]),
          (z = h.getValue(B)),
          (G = h.getValue(M)),
          (K = h.getValue(C)),
          (G = E.Ym(new q(z, G))),
          (z = G.x),
          (G = G.y),
          (L = (z - w) * I),
          (e === f && L <= l) ||
            (g === f && L >= l) ||
            ((L = n - y * l + y * L),
            (z = k(L) * (D + K)),
            (L = m(L) * (D + K)),
            (K = z - D),
            (z = F - L)),
          (G = J.Ym(new q(z, G))),
          (z = G.x),
          (G = G.y),
          h.setValue(B, z),
          h.setValue(M, G),
          h.setValue(C, K)
      }
      return this
    },
  })
})(X)
!(function (f) {
  var c = f.Ae,
    d = c.X,
    e = c.Y,
    g = c.zi,
    h = f.Vector3,
    l = f.yi,
    c = (f.Nk = ring.create([f.Ig], {
      constructor: function (c, d) {
        this.sa = c
        this.$super(d)
      },
      sa: null,
      dispose: function () {
        this.sa = null
        this.$super()
        return this
      },
      Lm: function (c) {
        this.ub = c
        this.fc = new l([c.x, c.y, c.z])
        this.la = new l(this.fc)
        return this
      },
      ee: function () {
        var c = this.ub
        return new l([c.x, c.y, c.z])
      },
      getX: function () {
        return this.ub.x
      },
      getY: function () {
        return this.ub.y
      },
      getZ: function () {
        return this.ub.z
      },
      setXYZ: function (c) {
        var d = this.ub
        d.x = c[0]
        d.y = c[1]
        d.z = c[2]
        return this
      },
      setX: function (c) {
        this.ub.x = c
        return this
      },
      setY: function (c) {
        this.ub.y = c
        return this
      },
      setZ: function (c) {
        this.ub.z = c
        return this
      },
      reset: function () {
        var c = this.ub,
          d = this.fc
        c.x = d[0]
        c.y = d[1]
        c.z = d[2]
        return this
      },
      collapse: function () {
        var c = this.ub
        this.fc = new l([c.x, c.y, c.z])
        return this
      },
      getValue: function (c) {
        var f = this.ub
        switch (c) {
          case d:
            return f.x
          case e:
            return f.y
          case g:
            return f.z
        }
        return 0
      },
      setValue: function (c, f) {
        var h = this.ub
        switch (c) {
          case d:
            h.x = f
            break
          case e:
            h.y = f
            break
          case g:
            h.z = f
        }
        return this
      },
      Km: function (c) {
        var d = this.ub
        c = c.la
        d.x = c[0]
        d.y = c[1]
        d.z = c[2]
        return this
      },
      Ll: function () {
        var c = this.ub
        return new h([c.x, c.y, c.z])
      },
    }))
  c.prototype.Pl = c.prototype.ee
  c.prototype.Mm = c.prototype.setXYZ
})(X)
!(function (f) {
  var c = f.Nk
  f.Jn = ring.create([f.rh], {
    constructor: function (c) {
      this.$super(c)
    },
    mk: function (d) {
      this.$super(d)
      var e = 0
      d = this.sa
      for (
        var f = this.vertices, h = d.geometry.vertices, l = h.length, k, e = 0;
        e < l;

      ) {
        ;(k = new c(d, h[e])), f.push(k), e++
      }
      this.faces = null
      return this
    },
    update: function () {
      var c = this.sa.geometry
      c.verticesNeedUpdate = !0
      c.normalsNeedUpdate = !0
      c.ws = !0
      c.dynamic = !0
      return this
    },
    $m: function (c) {
      var e = this.sa.position
      c = c.la
      e.x += c[0]
      e.y += c[1]
      e.z += c[2]
      return this
    },
  })
})(X)
!(function (f) {
  var c = ring.create([f.wi], {
    constructor: function () {
      this.Mj = f.Jn
      this.gn = f.Nk
    },
  })
  f.Gn = new c()
})(X)
H = W.prototype
H.Yl = function () {
  var f = this
  if (f.H.I && (!f.H.I || 0 != f.H.I.length) && f.H.J.enableWebGL && !f.Ej) {
    f.Ej = !0
    f.Ab = f.container + '_webglcanvas'
    f.xb = f.H.J.fa
    var c = jQuery(f.L).offset(),
      d = (f.w = f.H.T.width()),
      e = (f.h = f.H.T.height()),
      g = c.left,
      c = c.top
    f.mc = new THREE.Scene()
    f.ye = jQuery(
      String.format(
        "<canvas id='{0}' style='opacity:0;pointer-events:none;position:absolute;left:0px;top:0px;z-index:-1;width:100%;height:100%;'></canvas>",
        f.Ab,
        g,
        c
      )
    )
    f.ye.get(0).addEventListener(
      'webglcontextlost',
      function (c) {
        f.Gd()
        c.preventDefault && c.preventDefault()
        f.ye.remove()
        return !1
      },
      !1
    )
    f.Xd = new THREE.WebGLRenderer({
      alpha: !0,
      antialias: !0,
      canvas: f.ye.get(0),
    })
    f.Xd.setPixelRatio(eb.platform.Za)
    f.Xd.shadowMap.type = THREE.PCFShadowMap
    f.Xd.shadowMap.enabled = !0
    f.ac = new THREE.PerspectiveCamera(
      (180 / Math.PI) * Math.atan(e / 1398) * 2,
      d / e,
      1,
      1000
    )
    f.ac.position.z = 700
    f.mc.add(f.ac)
    g = new THREE.PlaneGeometry(d, 1.3 * e)
    c = new THREE.MeshPhongMaterial({ color: f.H.J.backgroundColor })
    g = new THREE.Mesh(g, c)
    g.receiveShadow = !0
    g.position.x = 0
    g.position.y = 0
    g.position.z = -3
    c = new THREE.ShadowMaterial()
    c.opacity = 0.15
    g.material = c
    f.mc.add(g)
    f.Xd.setSize(d, e)
    0 == f.Xd.context.getError()
      ? (jQuery(f.H.T).append(f.Xd.domElement),
        (f.WebGLObject = new THREE.Object3D()),
        f.WebGLObject.scale.set(1, 1, 0.35),
        (f.Tb = new THREE.Object3D()),
        f.WebGLObject.add(f.Tb),
        f.mc.add(f.WebGLObject),
        (f.kb = new THREE.DirectionalLight(16777215, 0.2)),
        f.kb.position.set(500, 0, 800),
        (f.kb.intensity = 0.37),
        (f.kb.shadow = new THREE.LightShadow(
          new THREE.PerspectiveCamera(70, 1, 5, 2000)
        )),
        (f.kb.castShadow = !0),
        (f.kb.shadow.bias = -0.000222),
        (f.kb.shadow.mapSize.height = 1024),
        (f.kb.shadow.mapSize.width = 1024),
        f.mc.add(f.kb),
        (d = f.Kt = new THREE.CameraHelper(f.kb.shadow.camera)),
        (d.visible = !1),
        f.mc.add(d),
        (f.Ub = new THREE.AmbientLight(16777215)),
        (f.Ub.intensity = 0.75),
        (f.Ub.visible = !0),
        f.mc.add(f.Ub),
        f.ac.lookAt(f.mc.position),
        f.Lj(),
        f.H.renderer.ua &&
          jQuery(f.H.renderer).bind('onTextDataUpdated', function (c, d) {
            for (
              var e = f.V(f.L).scrollTop(),
                g = d - 2,
                p = d + 12,
                n = f.V(f.L).height();
              g < p;
              g++
            ) {
              var t = f.getPage(g)
              if (t && t.ad(e, n) && (0 == t.pageNumber % 2 || f.xb)) {
                var q = f.pages.length > g + 1 ? f.pages[g] : null
                f.H.renderer.ca[t.pageNumber].loaded
                  ? q &&
                    !f.H.renderer.ca[q.pageNumber].loaded &&
                    f.H.renderer.Kc(q.pageNumber + 1, !0, function () {})
                  : f.H.renderer.Kc(t.pageNumber + 1, !0, function () {
                      q &&
                        !f.H.renderer.ca[q.pageNumber].loaded &&
                        f.H.renderer.Kc(q.pageNumber + 1, !0, function () {})
                    })
                t.ed(
                  f.H.renderer.pa(t.pageNumber + 1),
                  f.H.renderer.pa(t.pageNumber + 2),
                  !0
                )
              }
            }
          }))
      : f.Gd()
    f.Ej = !1
  }
}
H.Gd = function () {
  this.H.J.enableWebGL = !1
  for (var f = 0; f < this.document.numPages; f++) {
    this.pages[f] && this.pages[f].sa && this.pages[f].Qo()
  }
  this.mc &&
    (this.WebGLObject && this.mc.remove(this.WebGLObject),
    this.ac && this.mc.remove(this.ac),
    this.Ub && this.mc.remove(this.Ub),
    this.kb && this.mc.remove(this.kb),
    this.ye.remove())
  this.H.Ca &&
    (this.H.Ca.turn('setEnableDisableMouseEvents', !0),
    this.H.Ca.turn('setCornerDragging', !0))
  this.Ab = null
}
H.zm = function () {
  if (this.H.J.enableWebGL) {
    if (((this.Le = []), this.ye)) {
      for (var f = 0; f < this.document.numPages; f++) {
        this.pages[f].sa && this.pages[f].ph(!0)
      }
      var f = this.H.T.width(),
        c = this.H.T.height(),
        d = (180 / Math.PI) * Math.atan(c / 1398) * 2
      this.Xd.setSize(f, c)
      this.ac.fov = d
      this.ac.aspect = f / c
      this.ac.position.z = 700
      this.ac.position.x = 0
      this.ac.position.y = 0
      this.ac.updateProjectionMatrix()
      jQuery('#' + this.Ab).css('opacity', '0')
    } else {
      this.Yl()
    }
  }
}
H.ar = function () {
  var f = jQuery(this.L).offset()
  jQuery(this.L).width()
  var c = jQuery(this.L).height()
  this.ac.position.y =
    -1 * ((this.ye.height() - c) / 2 - f.top) - this.H.T.offset().top
  this.ac.position.x = 0
  this.yp = !0
}
H.Zd = function () {
  if (!this.H.J.enableWebGL) {
    return !1
  }
  for (var f = this.dg, c = 0; c < this.document.numPages; c++) {
    if (this.pages[c].dc || this.pages[c].Xb) {
      f = !0
    }
  }
  return f
}
H.qp = function (f) {
  if (!this.xb) {
    return f == this.ta ? 2 : f == this.ta - 2 ? 1 : f == this.ta + 2 ? 1 : 0
  }
  if (this.xb) {
    return f == this.ta ? 2 : f == this.ta - 1 ? 1 : f == this.ta + 1 ? 1 : 0
  }
}
H.no = function () {
  for (var f = jQuery(this.L).width(), c = 0; c < this.document.numPages; c++) {
    this.pages[c].sa &&
      (c + 1 < this.Z
        ? this.pages[c].dc ||
          this.pages[c].Xb ||
          this.pages[c].sa.rotation.y == -Math.PI ||
          this.pages[c].Fp()
        : this.pages[c].dc ||
          this.pages[c].Xb ||
          0 == this.pages[c].sa.rotation.y ||
          this.pages[c].Gp(),
      (this.pages[c].sa.position.x = 800 < f ? 0.5 : 0),
      (this.pages[c].sa.position.y = 0),
      this.pages[c].dc ||
        this.pages[c].Xb ||
        (this.pages[c].sa.position.z = this.qp(c)),
      (this.pages[c].sa.visible = 0 == this.pages[c].sa.position.z ? !1 : !0))
  }
}
H.Fg = function (f, c, d) {
  var e = this
  e.xj = !1
  var g = e.H.getTotalPages()
  e.dg = !0
  e.Ek = f
  e.Qr = c
  if (1 == e.H.scale) {
    e.Wb && (f = e.Wb)
    if ('next' == f) {
      e.ta ? (e.ta = e.ta + 2) : (e.ta = e.Z - 1)
      0 == g % 2 && e.ta == g - 2 && (e.xj = !0)
      0 != e.ta % 2 && (e.ta = e.ta - 1)
      if (e.ta >= g - 1 && 0 != g % 2) {
        e.dg = !1
        return
      }
      e.xb && (e.ta = e.Z - 1)
    }
    'previous' == f &&
      ((e.ta = e.ta ? e.ta - 2 : e.Z - 3),
      0 != e.ta % 2 && (e.ta += 1),
      e.ta >= g && (e.ta = g - 3),
      e.xb && (e.ta = e.Z - 2))
    'page' != f ||
      e.Wb ||
      ((e.ta = c - 3), (f = e.ta >= e.Z - 1 ? 'next' : 'previous'))
    e.pages[e.ta] && !e.pages[e.ta].sa && e.pages[e.ta].mf()
    e.pages[e.ta - 2] && !e.pages[e.ta - 2].sa && e.pages[e.ta - 2].mf()
    e.pages[e.ta + 2] && !e.pages[e.ta + 2].sa && e.pages[e.ta + 2].mf()
    var h = e.pages[e.ta] && (e.pages[e.ta].dc || e.pages[e.ta].Xb)
    h || e.ar()
    '0' == jQuery('#' + e.Ab).css('opacity') &&
      (d
        ? h || jQuery('#' + e.Ab).css('opacity', 1)
        : jQuery('#' + e.Ab).animate({ opacity: 1 }, 50, function () {}))
    var l = d ? new Ga() : new jQuery.Deferred()
    l.then(function () {
      h || (e.no(), jQuery('#' + e.Ab).css('z-index', 99), (e.dg = !1))
      if (null != e.ta) {
        if ('next' == f || e.Wb) {
          if (!h || d) {
            if (!h) {
              if (e.xb) {
                ;(e.Tb.position.x = (e.pages[e.ta].sc / 2) * -1),
                  jQuery(e.L + '_parent').transition(
                    { x: 0 },
                    0,
                    'ease',
                    function () {}
                  )
              } else {
                if (0 == e.ta || e.xj) {
                  e.H.Ca.css({ opacity: 0 }),
                    (e.Tb.position.x = (e.pages[e.ta].sc / 2) * -1),
                    jQuery(e.L + '_parent').transition(
                      { x: 0 },
                      0,
                      'ease',
                      function () {}
                    )
                }
              }
              0 < e.ta && !e.xb && (e.Tb.position.x = 0)
              jQuery('#' + e.Ab).css('z-index', 99)
              e.ze || ((e.ze = !0), e.ck())
              e.kb.position.set(300, e.h / 2, 400)
              e.kb.intensity = 0
              e.Ub.color.setRGB(1, 1, 1)
              var c = null != d ? 0 : e.Ol()
              d
                ? ((e.kb.intensity = 0.1 * Math.exp(1 - d)),
                  (e.Ub.intensity = 1 - e.kb.intensity),
                  e.Ub.color.setRGB(1, 1, 1))
                : new TWEEN.Tween({ intensity: e.kb.intensity })
                    .to({ intensity: 0.37 }, c / 2)
                    .easing(TWEEN.Easing.Sinusoidal.InOut)
                    .onUpdate(function () {
                      e.kb.intensity = this.intensity
                      e.Ub.intensity = 1 - this.intensity
                      e.Ub.color.setRGB(
                        1 - this.intensity / 6,
                        1 - this.intensity / 6,
                        1 - this.intensity / 6
                      )
                    })
                    .onComplete(function () {
                      new TWEEN.Tween({ intensity: e.kb.intensity })
                        .to({ intensity: 0 }, c / 2)
                        .easing(TWEEN.Easing.Sinusoidal.InOut)
                        .onUpdate(function () {
                          e.kb.intensity = this.intensity
                          e.Ub.intensity = 1 - this.intensity
                          e.Ub.color.setRGB(
                            1 - this.intensity / 6,
                            1 - this.intensity / 6,
                            1 - this.intensity / 6
                          )
                        })
                        .start()
                    })
                    .start()
            }
            e.pages[e.ta].fp(null != d ? d : e.Nl(), d)
          }
        }
        'previous' != f ||
          e.Wb ||
          ((e.dg = !1),
          !e.pages[e.ta] ||
            e.pages[e.ta].Xb ||
            e.pages[e.ta].dc ||
            (e.xb
              ? (e.Tb.position.x = (e.pages[e.ta].sc / 2) * -1)
              : (0 == e.ta &&
                  (e.H.Ca.css({ opacity: 0 }),
                  jQuery(e.L + '_parent').transition(
                    { x: -(e.Zc() / 4) },
                    0,
                    'ease',
                    function () {}
                  ),
                  (e.Tb.position.x = 0)),
                e.H.ma == e.H.getTotalPages() && 0 == e.H.getTotalPages() % 2
                  ? (e.H.Ca.css({ opacity: 0 }),
                    (e.Tb.position.x = e.pages[e.ta].sc / 2),
                    jQuery(e.L + '_parent').transition(
                      { x: 0 },
                      0,
                      'ease',
                      function () {}
                    ))
                  : 0 < e.ta && (e.Tb.position.x = 0)),
            jQuery('#' + e.Ab).css('z-index', 99),
            e.ze || ((e.ze = !0), e.ck()),
            e.kb.position.set(-300, e.h / 2, 400),
            (e.kb.intensity = 0),
            e.Ub.color.setRGB(1, 1, 1),
            (c = e.Ol()),
            new TWEEN.Tween({ intensity: e.kb.intensity })
              .to({ intensity: 0.37 }, c / 2)
              .easing(TWEEN.Easing.Sinusoidal.InOut)
              .onUpdate(function () {
                e.kb.intensity = this.intensity
                e.Ub.intensity = 1 - this.intensity
                e.Ub.color.setRGB(
                  1 - this.intensity / 6,
                  1 - this.intensity / 6,
                  1 - this.intensity / 6
                )
              })
              .onComplete(function () {
                new TWEEN.Tween({ intensity: e.kb.intensity })
                  .to({ intensity: 0 }, c / 2)
                  .easing(TWEEN.Easing.Sinusoidal.InOut)
                  .onUpdate(function () {
                    e.kb.intensity = this.intensity
                    e.Ub.intensity = 1 - this.intensity
                    e.Ub.color.setRGB(
                      1 - this.intensity / 6,
                      1 - this.intensity / 6,
                      1 - this.intensity / 6
                    )
                  })
                  .start()
              })
              .start(),
            e.pages[e.ta].gp(e.Nl())))
      }
    })
    ;(0 != e.ta && !e.xj) || d
      ? d || l.resolve()
      : jQuery('#' + e.Ab).animate(
          { opacity: 1 },
          {
            duration: 60,
            always: function () {
              l.resolve()
            },
          }
        )
  }
}
H.Ol = function () {
  var f = 500
  'very fast' == this.H.J.qd && (f = 200)
  'fast' == this.H.J.qd && (f = 300)
  'slow' == this.H.J.qd && (f = 1700)
  'very slow' == this.H.J.qd && (f = 2700)
  this.xb && (f /= 1.1)
  return f
}
H.Nl = function () {
  var f = 1.1
  'very fast' == this.H.J.qd && (f = 0.4)
  'fast' == this.H.J.qd && (f = 0.7)
  'slow' == this.H.J.qd && (f = 2.3)
  'very slow' == this.H.J.qd && (f = 3.7)
  this.xb && (f /= 1.1)
  return f
}
H.Ap = function () {
  this.H.J.Mh
    ? ('next' == this.Ek && this.H.Ca.turn('page', this.ta + 2, 'instant'),
      'previous' == this.Ek && this.H.Ca.turn('page', this.ta, 'instant'))
    : this.H.Ca.turn(this.Ek, this.Qr, 'instant')
  this.ta = null
}
H.ck = function () {
  var f,
    c = this
  c.zc || (c.zc = [])
  3 > c.zc.length && !c.Vg && (f = !0)
  if ((c.H.J.enableWebGL || c.ze) && (c.ze || f)) {
    if (
      (c.de || ((c.de = 0), (c.bh = new Date().getTime()), (c.elapsedTime = 0)),
      (f = new Date().getTime()),
      requestAnim(function () {
        c.ck()
      }),
      TWEEN.update(),
      c.Xd.render(c.mc, c.ac),
      c.de++,
      (c.elapsedTime += f - c.bh),
      (c.bh = f),
      (f =
        c.H.Fd ||
        ('CanvasPageRenderer' == c.H.renderer.Af() && !c.H.renderer.Ba)),
      1000 <= c.elapsedTime && 4 > c.zc.length && !f)
    ) {
      if (
        ((f = c.de),
        (c.de = 0),
        (c.elapsedTime -= 1000),
        c.zc.push(f),
        3 == c.zc.length && !c.Vg)
      ) {
        c.Vg = !0
        for (var d = (f = 0); 3 > d; d++) {
          f += c.zc[d]
        }
        5 > f / 3 && c.Gd()
      }
    } else {
      c.Vg = !0
    }
  }
}
H.zg = function (f) {
  var c = this
  if (f && !c.Bd) {
    c.Bd = f
  } else {
    if (f && c.Bd && 10 > c.Bd + f) {
      c.Bd = c.Bd + f
      return
    }
  }
  c.Xd && c.mc && c.ac && c.yp
    ? c.animating
      ? setTimeout(function () {
          c.zg()
        }, 500)
      : (0 < c.Bd
          ? ((c.Bd = c.Bd - 1),
            requestAnim(function () {
              c.zg()
            }))
          : (c.Bd = null),
        !c.ze && 0 < c.Bd && c.Xd.render(c.mc, c.ac))
    : (c.Bd = null)
}
H.Lj = function () {
  var f = this
  if (!f.H.initialized) {
    setTimeout(function () {
      f.Lj()
    }, 1000)
  } else {
    if (
      !eb.platform.ios &&
      (f.zc || (f.zc = []),
      f.ye && f.H.J.enableWebGL && !f.ze && 4 > f.zc.length)
    ) {
      f.de || ((f.de = 0), (f.bh = new Date().getTime()), (f.elapsedTime = 0))
      var c = new Date().getTime()
      requestAnim(function () {
        f.Lj()
      })
      f.de++
      f.elapsedTime += c - f.bh
      f.bh = c
      c = f.ye.get(0)
      if ((c = c.getContext('webgl') || c.getContext('experimental-webgl'))) {
        if (
          (c.clearColor(0, 0, 0, 0),
          c.enable(c.DEPTH_TEST),
          c.depthFunc(c.LEQUAL),
          c.clear(c.COLOR_BUFFER_BIT | c.DEPTH_BUFFER_BIT),
          1000 <= f.elapsedTime &&
            4 > f.zc.length &&
            ((c = f.de),
            (f.de = 0),
            (f.elapsedTime -= 1000),
            f.zc.push(c),
            4 == f.zc.length && !f.Vg))
        ) {
          f.Vg = !0
          for (var d = (c = 0); 3 > d; d++) {
            c += f.zc[d]
          }
          25 > c / 3 && f.Gd()
        }
      } else {
        f.Gd()
      }
    }
  }
}
H.mq = function () {
  for (var f = this, c = !1, d = 0; d < f.document.numPages; d++) {
    if (f.pages[d].dc || f.pages[d].Xb) {
      c = !0
    }
  }
  c ||
    ((f.dg = !1),
    3 > f.zc
      ? setTimeout(function () {
          f.Zd() || (f.ze = !1)
        }, 3000)
      : (f.ze = !1),
    f.Ap())
}
var Qa = (function () {
    function f() {}
    f.prototype = {
      ad: function (c, d) {
        return d.pages.Z == d.pageNumber || d.Z == d.pageNumber + 1
      },
      kp: function (c, d, e) {
        var f = null != d.dimensions.zb ? d.dimensions.zb : d.dimensions.xa
        return !d.pages.kc() &&
          c.Bb &&
          (!eb.browser.safari ||
            eb.platform.touchdevice ||
            (eb.browser.safari && 7.1 > eb.browser.Zb))
          ? e
          : null != d.dimensions.zb && c.Bb && d.H.renderer.Ba
          ? d.pages.ud / (d.H.xf ? 1 : 2) / f
          : d.Hb && !d.H.renderer.Ba
          ? d.pages.ud / 2 / d.H.renderer.La[d.pageNumber].zb
          : c.Bb && !d.Hb && !d.H.renderer.Ba && 1 < d.scale
          ? d.uj() / f
          : e
      },
      qo: function (c, d, e) {
        jQuery(d.da + '_textoverlay').append(e)
      },
      cl: function (c, d, e, f, h, l, k) {
        var m = c.uq == f && !d.H.renderer.Bb
        e &&
          ((c.uq = f),
          (c.Ft = e.attr('id')),
          c.vq != e.css('top') || h || c.wq != d.pageNumber
            ? (null == c.Sd || h || c.Sd.remove(),
              (c.vq = e.css('top')),
              (c.Sd = h
                ? l
                  ? e
                      .wrap(
                        jQuery(
                          String.format(
                            "<div class='flowpaper_pageword flowpaper_pageword_" +
                              c.aa +
                              "' style='{0};border-top-width: 3px;border-left-width: 3px;border-style:dotted;border-color: #ee0000;'></div>",
                            e.attr('style')
                          )
                        )
                      )
                      .parent()
                  : k
                  ? e
                      .wrap(
                        jQuery(
                          String.format(
                            "<div class='flowpaper_pageword flowpaper_pageword_" +
                              c.aa +
                              "' style='{0};border-top-width: 3px;border-right-width: 3px;border-style:dotted;border-color: #ee0000;'></div>",
                            e.attr('style')
                          )
                        )
                      )
                      .parent()
                  : e
                      .wrap(
                        jQuery(
                          String.format(
                            "<div class='flowpaper_pageword flowpaper_pageword_" +
                              c.aa +
                              "' style='{0};border-top-width: 3px;border-right-width: 3px;border-style:dotted;border-color: transparent;'></div>",
                            e.attr('style')
                          )
                        )
                      )
                      .parent()
                : e
                    .wrap(
                      jQuery(
                        String.format(
                          "<div class='flowpaper_pageword flowpaper_pageword_" +
                            c.aa +
                            "' style='{0};border-width: 3px;border-style:dotted;border-color: #ee0000;'></div>",
                          e.attr('style')
                        )
                      )
                    )
                    .parent()),
              c.Sd.css({
                'margin-left': '-3px',
                'margin-top': '-4px',
                'z-index': '11',
              }),
              jQuery(d.Ea).append(c.Sd))
            : m
            ? (c.Sd.css('width', c.Sd.width() + e.width()),
              jQuery(c.Sd.children()[0]).width(c.Sd.width()))
            : (c.Sd.css('left', e.css('left')), c.Sd.append(e)),
          e.css({ left: '0px', top: '0px' }),
          e.addClass('flowpaper_selected'),
          e.addClass('flowpaper_selected_default'),
          e.addClass('flowpaper_selected_searchmatch'),
          (c.wq = d.pageNumber))
      },
    }
    return f
  })(),
  Na = (function () {
    function f() {}
    f.prototype = {
      create: function (c, d) {
        if (
          'FlipView' == c.H.I &&
          ((c.No = 10 < c.pages.Ye ? c.pages.Ye : 10),
          !(c.Fj || (c.H.renderer.Ge && !c.hb && c.pageNumber > c.No + 6)))
        ) {
          c.Oc = jQuery(
            "<div class='flowpaper_page " +
              (c.H.J.tf ? '' : 'flowpaper_page_zoomIn') +
              "' id='" +
              c.Od +
              "' style='" +
              c.getDimensions() +
              ";z-index:2;background-size:100% 100%;background-color:#ffffff;margin-bottom:0px;backface-visibility:hidden;'><div id='" +
              c.ja +
              "' style='height:100%;width:100%;'></div></div>"
          )
          c.pages.H.Ca && c.H.renderer.Ge
            ? c.pages.H.Ca.turn('addPage', c.Oc, c.pageNumber + 1)
            : jQuery(d).append(c.Oc)
          var e = c.ae() * c.Ha,
            f = c.Fa() / e
          null != c.dimensions.zb &&
            c.Bb &&
            c.H.renderer.Ba &&
            (f = c.pages.ud / 2 / e)
          c.Kj = f
          c.tg(f)
          c.Fj = !0
          c.hb = !0
          c.H.renderer.fe(c)
          c.Om()
          c.mf && c.mf()
        }
      },
      Ep: function (c) {
        var d = c.ae() * c.Ha,
          e = c.Fa() / d
        null != c.dimensions.zb &&
          c.Bb &&
          c.H.renderer.Ba &&
          (e = c.pages.ud / 2 / d)
        c.Kj = e
        c.tg(e)
      },
      $c: function (c) {
        return c.pages.$c() / (c.H.J.fa ? 1 : 2)
      },
      kg: function (c) {
        return c.pages.kg()
      },
      getDimensions: function (c) {
        if ('FlipView' == c.H.I) {
          return (
            c.N.width(),
            'position:absolute;left:0px;top:0px;width:' +
              c.Fa(c) +
              ';height:' +
              c.Pa(c)
          )
        }
      },
      Fa: function (c) {
        if ('FlipView' == c.H.I) {
          return (c.pages.ud / (c.H.J.fa ? 1 : 2)) * c.scale
        }
      },
      sj: function (c) {
        if ('FlipView' == c.H.I) {
          return (c.pages.ud / (c.H.J.fa ? 1 : 2)) * 1
        }
      },
      uj: function (c) {
        if ('FlipView' == c.H.I) {
          return c.pages.ud / (c.H.J.fa ? 1 : 2)
        }
      },
      Pa: function (c) {
        if ('FlipView' == c.H.I) {
          return c.pages.vh * c.scale
        }
      },
      rj: function (c) {
        if ('FlipView' == c.H.I) {
          return 1 * c.pages.vh
        }
      },
      qc: function () {
        return 0
      },
      ad: function (c) {
        var d = c.H.J.enableWebGL
        if ('FlipView' == c.H.I) {
          return (
            c.pages.Z >= c.pageNumber - (d ? 3 : 2) &&
            c.pages.Z <= c.pageNumber + (d ? 5 : 4)
          )
        }
      },
      Gb: function (c) {
        var d = c.da
        0 == jQuery(d).length && (d = jQuery(c.Oc).find(c.da))
        ;(c.pageNumber < c.pages.Z - 15 || c.pageNumber > c.pages.Z + 15) &&
          c.Oc &&
          !c.Oc.parent().hasClass('turn-page-wrapper') &&
          !c.Kb &&
          0 != c.pageNumber &&
          (jQuery(d).find('*').unbind(),
          jQuery(d).find('*').remove(),
          (c.initialized = !1),
          (c.Lc = !1))
      },
    }
    V.prototype.Wg = function () {
      return eb.platform.touchdevice
        ? 'FlipView' == this.H.I
          ? !this.H.J.fa &&
            window.devicePixelRatio &&
            1 < window.devicePixelRatio
            ? 1.9
            : 2.6
          : 1
        : 'FlipView' == this.H.I
        ? 2
        : 1
    }
    return f
  })()
H = V.prototype
H.mf = function () {
  var f = this
  if (
    (0 == f.pageNumber % 2 || f.pages.xb) &&
    1 == f.scale &&
    f.H.J.enableWebGL
  ) {
    if (
      (f.sa && f.pages.Tb.remove(f.sa), f.pages.Ab || f.pages.Yl(), f.pages.Ej)
    ) {
      setTimeout(function () {
        f.mf()
      }, 200)
    } else {
      f.sc = f.Fa(f)
      f.me = f.Pa(f)
      f.angle = (0.25 * Math.PI * this.sc) / this.me
      f.Bk = !eb.platform.touchonlydevice
      for (var c = 0; 6 > c; c++) {
        c != f.za.gb || f.bb[f.za.gb]
          ? c != f.za.back || f.bb[f.za.back]
            ? f.bb[c] ||
              c == f.za.back ||
              c == f.za.gb ||
              ((f.bb[c] = new THREE.MeshPhongMaterial({ color: f.lq })),
              (f.bb[c].name = 'edge'))
            : ((f.bb[f.za.back] = new THREE.MeshPhongMaterial({
                map: null,
                overdraw: !0,
                shininess: 15,
                transparent: f.pages.xb,
                opacity: f.pages.xb ? 0 : 1,
              })),
              (f.bb[f.za.back].name = 'back'),
              f.pages.xb ||
                f.Sk(f.pageNumber, f.sc, f.me, f.za.back, function (c) {
                  f.rc ||
                    ((f.xk = new THREE.TextureLoader()),
                    f.xk.load(c, function (c) {
                      c.minFilter = THREE.LinearFilter
                      f.bb[f.za.back].map = c
                    }))
                }))
          : ((f.bb[f.za.gb] = new THREE.MeshPhongMaterial({
              map: null,
              overdraw: !0,
              shininess: 15,
            })),
            (f.bb[f.za.gb].name = 'front'),
            f.Sk(f.pageNumber, f.sc, f.me, f.za.gb, function (c) {
              f.rc ||
                ((f.wk = new THREE.TextureLoader()),
                f.wk.load(c, function (c) {
                  c.minFilter = THREE.LinearFilter
                  f.bb[f.za.gb].map = c
                }))
            }))
      }
      f.sa = new THREE.Mesh(
        new THREE.BoxGeometry(f.sc, f.me, 0.1, 10, 10, 1),
        new THREE.MeshFaceMaterial(f.bb)
      )
      f.sa.receiveShadow = f.Bk
      f.sa.overdraw = !0
      f.ya = new X.Kn(X.Gn, f.sa)
      f.uc = new X.Rn(f.sc / 2, 0, 0)
      f.ya.Vk(f.uc)
      f.ya.collapse()
      f.pc = new X.xn(0, 0, 0)
      f.pc.yc = X.Ae.LEFT
      f.me > f.sc && (f.pc.se = !0)
      f.ya.Vk(f.pc)
      f.pages.Tb.add(f.sa)
      f.sa.position.x = 0
      f.sa.position.z = -1
      f.Wh && (f.sa.rotation.y = -Math.PI)
      f.Xh && (f.sa.rotation.y = 0)
    }
  }
}
H.Sk = function (f, c, d, e, g) {
  var h = 'image/jpeg',
    l = 0.95,
    k,
    m
  this.pages.Le || (this.pages.Le = [])
  if (e == this.za.back && this.pages.xb) {
    h = 'image/png'
    k = document.createElement('canvas')
    k.width = 0
    k.height = 0
    m = k.getContext('2d')
    m.fillStyle = 'transparent'
    m.fillRect(0, 0, k.width, k.height)
    var p = k.toDataURL(h, l)
    g(p)
  } else {
    ;(h = 'image/jpeg'),
      (l = l || 0.92),
      e == this.za.gb && this.pages.Le[this.za.gb]
        ? g(this.pages.Le[this.za.gb])
        : e == this.za.back && this.pages.Le[this.za.back]
        ? g(this.pages.Le[this.za.back])
        : ((k = document.createElement('canvas')),
          (k.width = c),
          (k.height = d),
          (m = k.getContext('2d')),
          (m.Gg = m.mozImageSmoothingEnabled = m.imageSmoothingEnabled = !0),
          (m.fillStyle = 'white'),
          m.fillRect(0, 0, k.width, k.height),
          (this.pages.xb && e != this.za.gb) ||
            m.drawImage(
              this.H.Jj,
              k.width / 2 + (this.qc() - 10),
              k.height / 2,
              24,
              8
            ),
          this.H.vd &&
            (e != this.za.back ||
              this.pages.xb ||
              (m.beginPath(),
              (m.strokeStyle = 'transparent'),
              m.rect(0.65 * c, 0, 0.35 * c, d),
              (p = m.createLinearGradient(0, 0, c, 0)),
              p.addColorStop(0.93, 'rgba(255, 255, 255, 0)'),
              p.addColorStop(0.96, 'rgba(170, 170, 170, 0.05)'),
              p.addColorStop(1, 'rgba(125, 124, 125, ' + this.H.Pf + ')'),
              (m.fillStyle = p),
              m.fill(),
              m.stroke(),
              m.closePath(),
              (p = k.toDataURL(h, l)),
              (this.pages.Le[this.za.back] = p),
              g(p)),
            e == this.za.gb &&
              0 != f &&
              (m.beginPath(),
              (m.strokeStyle = 'transparent'),
              m.rect(0, 0, 0.35 * c, d),
              (p = m.createLinearGradient(0, 0, 0.07 * c, 0)),
              p.addColorStop(0.07, 'rgba(125, 124, 125, ' + this.H.Pf + ')'),
              p.addColorStop(0.93, 'rgba(255, 255, 255, 0)'),
              (m.fillStyle = p),
              m.fill(),
              m.stroke(),
              m.closePath(),
              (p = k.toDataURL(h, l)),
              (this.pages.Le[this.za.gb] = p),
              g(p))))
  }
}
H.ph = function (f) {
  if ((this.sa && this.rc) || f) {
    this.Zm(),
      this.ya.dispose(),
      this.uc.dispose(),
      (this.ya = this.sa = this.uc = null),
      (this.bb = []),
      (this.Pr = this.resources = null),
      this.mf(),
      (this.rc = !1)
  }
}
H.Qo = function () {
  this.sa &&
    this.rc &&
    (this.Zm(),
    this.ya.dispose(),
    this.uc.dispose(),
    (this.ya = this.sa = this.uc = null),
    (this.bb = []),
    (this.resources = null),
    (this.rc = !1))
}
H.Zm = function () {
  var f = this.sa
  if (f) {
    for (var c = 0; c < f.material.materials.length; c++) {
      f.material.materials[c].map && f.material.materials[c].map.dispose(),
        f.material.materials[c].dispose()
    }
    f.geometry.dispose()
    this.pages.Tb.remove(f)
  }
}
H.ed = function (f, c, d) {
  var e = this
  if (
    e.H.J.enableWebGL &&
    !((e.rc && !d) || (0 != e.pageNumber % 2 && !e.pages.xb)) &&
    1 == e.H.scale &&
    1 == e.scale
  ) {
    for (
      e.rc = !0,
        e.Yh = !0,
        e.sc = e.Fa(e),
        e.me = e.Pa(e),
        e.angle = (0.25 * Math.PI * this.sc) / this.me,
        d = 0;
      6 > d;
      d++
    ) {
      d == e.za.gb
        ? e.loadResources(e.pageNumber, function () {
            e.fk(
              e.pageNumber,
              e.za.gb,
              f,
              'image/jpeg',
              0.95,
              e.sc,
              e.me,
              function (c) {
                e.bb[e.za.gb] && (e.bb[e.za.gb].map = null)
                e.pages.zg(2)
                e.wk = new THREE.TextureLoader()
                e.wk.load(c, function (c) {
                  c.minFilter = THREE.LinearFilter
                  e.bb[e.za.gb] = new THREE.MeshPhongMaterial({
                    map: c,
                    overdraw: !0,
                  })
                  e.sa &&
                    e.sa.material.materials &&
                    e.sa.material.materials &&
                    (e.sa.material.materials[e.za.gb] = e.bb[e.za.gb])
                  e.Yh &&
                    e.bb[e.za.gb] &&
                    e.bb[e.za.gb].map &&
                    e.bb[e.za.back] &&
                    e.bb[e.za.back].map &&
                    ((e.Yh = !1), e.pages.zg(2))
                })
              }
            )
          })
        : d != e.za.back ||
          e.pages.xb ||
          e.loadResources(e.pageNumber + 1, function () {
            e.fk(
              e.pageNumber + 1,
              e.za.back,
              c,
              'image/jpeg',
              0.95,
              e.sc,
              e.me,
              function (c) {
                e.bb[e.za.back] && (e.bb[e.za.back].map = null)
                e.pages.zg(2)
                e.xk = new THREE.TextureLoader()
                e.xk.load(c, function (c) {
                  c.minFilter = THREE.LinearFilter
                  e.bb[e.za.back] = new THREE.MeshPhongMaterial({
                    map: c,
                    overdraw: !0,
                  })
                  e.sa &&
                    e.sa.material.materials &&
                    e.sa.material.materials &&
                    (e.sa.material.materials[e.za.back] = e.bb[e.za.back])
                  e.Yh &&
                    e.bb[e.za.gb] &&
                    e.bb[e.za.gb].map &&
                    e.bb[e.za.back] &&
                    e.bb[e.za.back].map &&
                    ((e.Yh = !1), e.pages.zg(2))
                })
              }
            )
          })
    }
  }
}
H.loadResources = function (f, c) {
  var d = this,
    e = d.pages.getPage(f)
  if (e) {
    if (null == e.resources && ((e.resources = []), d.H.ba[f])) {
      for (var g = 0; g < d.H.ba[f].length; g++) {
        if (
          'image' == d.H.ba[f][g].type ||
          'video' == d.H.ba[f][g].type ||
          'audio' == d.H.ba[f][g].type ||
          'iframe' == d.H.ba[f][g].type ||
          'slideshow' == d.H.ba[f][g].type
        ) {
          var h = d.H.ba[f][g].src
          FLOWPAPER.authenticated &&
            -1 == h.indexOf('base64,') &&
            (h = FLOWPAPER.appendUrlParameter(
              h,
              FLOWPAPER.authenticated.getParams()
            ))
          var l = new Image()
          l.loaded = !1
          l.setAttribute('crossOrigin', 'anonymous')
          l.setAttribute(
            'data-x',
            d.H.ba[f][g].Cf ? d.H.ba[f][g].Cf : d.H.ba[f][g].ni
          )
          l.setAttribute(
            'data-y',
            d.H.ba[f][g].Df ? d.H.ba[f][g].Df : d.H.ba[f][g].oi
          )
          l.setAttribute('data-invertplayer', d.H.ba[f][g].$g)
          d.H.ba[f][g].nj && l.setAttribute('data-x', d.H.ba[f][g].nj)
          d.H.ba[f][g].oj && l.setAttribute('data-y', d.H.ba[f][g].oj)
          l.setAttribute('data-width', d.H.ba[f][g].width)
          l.setAttribute('data-height', d.H.ba[f][g].height)
          jQuery(l).bind('load', function () {
            this.loaded = !0
            d.Bm(f) && c()
          })
          l.src = h
          e.resources.push(l)
        }
      }
    }
    d.Bm(f) && c()
  }
}
H.Bm = function (f) {
  var c = !0
  f = this.pages.getPage(f)
  if (!f.resources) {
    return !1
  }
  for (var d = 0; d > f.resources.length; d++) {
    f.resources[d].loaded || (c = !1)
  }
  return c
}
H.Fp = function () {
  this.sa.rotation.y = -Math.PI
  this.page.dc = !1
  this.page.Wh = !0
  this.page.Xb = !1
  this.page.Xh = !1
}
H.Gp = function () {
  this.sa.rotation.y = 0
  this.page.dc = !1
  this.page.Xh = !0
  this.page.Xb = !1
  this.page.Wh = !1
}
H.fk = function (f, c, d, e, g, h, l, k) {
  var m = this
  if ('object' == typeof d) {
    m.Bq(f, c, d, e, g, h, l, k)
  } else {
    var p = new Image(),
      n,
      t,
      q,
      r,
      u = new jQuery.Deferred()
    u.then(function () {
      q =
        m.renderer.ua && m.renderer.ca[0]
          ? m.renderer.ca[0].width
          : p.naturalWidth
      r =
        m.renderer.ua && m.renderer.ca[0]
          ? m.renderer.ca[0].height
          : p.naturalHeight
      if (m.renderer.ua) {
        var u = 1.5 < m.renderer.Za ? m.renderer.Za : 1
        q = m.Fa() * u
        r = m.Pa() * u
      }
      n = document.createElement('canvas')
      t = n.getContext('2d')
      if (q < h || r < l) {
        ;(q = h), (r = l)
      }
      q < d.width && (q = d.width)
      r < d.height && (r = d.height)
      n.width = q
      n.height = r
      t.clearRect(0, 0, n.width, n.height)
      t.fillStyle = 'rgba(255, 255, 255, 1)'
      t.fillRect(0, 0, q, r)
      t.drawImage(p, 0, 0, q, r)
      jQuery(n).data('needs-overlay', 1)
      m.Qd(n, c == m.za.gb ? 0 : 1).then(function () {
        m.jh ? m.jh++ : (m.jh = 1)
        var p = q / (m.ae() * m.Ha),
          u = m.pages.getPage(f).resources
        if (u) {
          for (var v = 0; v < u.length; v++) {
            'true' == u[v].getAttribute('data-invertPlayer') &&
              (t.filter = 'invert(1) hue-rotate(190deg)'),
              t.drawImage(
                u[v],
                parseFloat(u[v].getAttribute('data-x')) * p,
                parseFloat(u[v].getAttribute('data-y')) * p,
                parseFloat(u[v].getAttribute('data-width')) * p,
                parseFloat(u[v].getAttribute('data-height')) * p
              )
          }
        }
        m.H.vd &&
          (c == m.za.back &&
            (t.beginPath(),
            (t.strokeStyle = 'transparent'),
            t.rect(0.65 * q, 0, 0.35 * q, r),
            (p = t.createLinearGradient(0, 0, q, 0)),
            p.addColorStop(0.93, 'rgba(255, 255, 255, 0)'),
            p.addColorStop(0.96, 'rgba(170, 170, 170, 0.05)'),
            p.addColorStop(1, 'rgba(125, 124, 125, 0.3)'),
            (t.fillStyle = p),
            t.fill(),
            t.stroke(),
            t.closePath()),
          c == m.za.gb &&
            0 != f &&
            (t.beginPath(),
            (t.strokeStyle = 'transparent'),
            t.rect(0, 0, 0.35 * q, r),
            (p = t.createLinearGradient(0, 0, 0.07 * q, 0)),
            p.addColorStop(0.07, 'rgba(125, 124, 125, 0.3)'),
            p.addColorStop(0.93, 'rgba(255, 255, 255, 0)'),
            (t.fillStyle = p),
            t.fill(),
            t.stroke(),
            t.closePath()))
        try {
          var B = n.toDataURL(e, g)
          k(B)
        } catch (C) {
          if (this.src && this.src.indexOf('blob:')) {
            throw C
          }
          la(d, function (d) {
            m.fk(f, c, d, e, g, h, l, k)
          })
        }
      })
    })
    e = 0 == d.indexOf('data:image/png') ? 'image/png' : 'image/jpeg'
    g = g || 0.92
    m.ga && !m.Kb && 0 != m.ga.naturalWidth && m.ga.getAttribute('src') == d
      ? ((p = m.ga), u.resolve())
      : m.pages.pages[f] &&
        !m.pages.pages[f].Kb &&
        m.pages.pages[f].ga &&
        0 != m.pages.pages[f].ga.naturalWidth &&
        m.pages.pages[f].ga.getAttribute('src') == d
      ? ((p = m.pages.pages[f].ga), u.resolve())
      : m.pages.pages[f - 1] &&
        !m.pages.pages[f - 1].Kb &&
        m.pages.pages[f - 1].ga &&
        0 != m.pages.pages[f - 1].ga.naturalWidth &&
        m.pages.pages[f - 1].ga.getAttribute('src') == d
      ? ((p = m.pages.pages[f - 1].ga), u.resolve())
      : m.pages.pages[f + 1] &&
        !m.pages.pages[f + 1].Kb &&
        m.pages.pages[f + 1].ga &&
        0 != m.pages.pages[f + 1].ga.naturalWidth &&
        m.pages.pages[f + 1].ga.getAttribute('src') == d
      ? ((p = m.pages.pages[f + 1].ga), u.resolve())
      : (m.pages.pages[f] && m.pages.pages[f].ga && (p = m.pages.pages[f].ga),
        m.pages.pages[f - 1] &&
          m.pages.pages[f - 1].ga &&
          m.pages.pages[f - 1].ga.getAttribute('src') == d &&
          (p = m.pages.pages[f - 1].ga),
        m.pages.pages[f + 1] &&
          m.pages.pages[f + 1].ga &&
          m.pages.pages[f + 1].ga.getAttribute('src') == d &&
          (p = m.pages.pages[f + 1].ga),
        jQuery(p).bind('error', function () {
          jQuery(this).Cg(function () {})
        }),
        jQuery(p).bind('abort', function () {
          jQuery(this).Cg(function () {})
        }),
        p.setAttribute('crossOrigin', 'anonymous'),
        (p.src = d),
        jQuery(p)
          .one('load', function () {
            window.clearTimeout(m.Ne)
            m.ln = !0
            u.resolve()
          })
          .each(function () {
            jQuery(this).get(0).complete && ((m.ln = !0), u.resolve())
          }),
        (m.Ne = setTimeout(function () {
          m.ln || jQuery(p).Cg(function () {})
        }, 3000)))
  }
}
H.Bq = function (f, c, d, e, g, h, l, k) {
  var m = this,
    p,
    n,
    t,
    q
  t = m.renderer.ua && m.renderer.ca[0] ? m.renderer.ca[0].width : d.width
  q = m.renderer.ua && m.renderer.ca[0] ? m.renderer.ca[0].height : d.height
  if (m.renderer.ua) {
    var r = 1.5 < m.renderer.Za ? m.renderer.Za : 1
    t = m.Fa() * r
    q = m.Pa() * r
  }
  p = document.createElement('canvas')
  n = p.getContext('2d')
  if (t < h || q < l) {
    ;(t = h), (q = l)
  }
  t < d.width && (t = d.width)
  q < d.height && (q = d.height)
  p.width = t
  p.height = q
  n.clearRect(0, 0, p.width, p.height)
  n.fillStyle = 'rgba(255, 255, 255, 1)'
  n.fillRect(0, 0, t, q)
  n.drawImage(d, 0, 0, t, q)
  jQuery(p).data('needs-overlay', 1)
  m.Qd(p, c == m.za.gb ? 0 : 1).then(function () {
    m.jh ? m.jh++ : (m.jh = 1)
    var d = t / (m.ae() * m.Ha),
      h = m.pages.getPage(f).resources
    if (h) {
      for (var l = 0; l < h.length; l++) {
        'true' == h[l].getAttribute('data-invertPlayer') &&
          (n.filter = 'invert(1) hue-rotate(190deg)'),
          n.drawImage(
            h[l],
            parseFloat(h[l].getAttribute('data-x')) * d,
            parseFloat(h[l].getAttribute('data-y')) * d,
            parseFloat(h[l].getAttribute('data-width')) * d,
            parseFloat(h[l].getAttribute('data-height')) * d
          )
      }
    }
    m.H.vd &&
      (c == m.za.back &&
        (n.beginPath(),
        (n.strokeStyle = 'transparent'),
        n.rect(0.65 * t, 0, 0.35 * t, q),
        (d = n.createLinearGradient(0, 0, t, 0)),
        d.addColorStop(0.93, 'rgba(255, 255, 255, 0)'),
        d.addColorStop(0.96, 'rgba(170, 170, 170, 0.05)'),
        d.addColorStop(1, 'rgba(125, 124, 125, 0.3)'),
        (n.fillStyle = d),
        n.fill(),
        n.stroke(),
        n.closePath()),
      c == m.za.gb &&
        0 != f &&
        (n.beginPath(),
        (n.strokeStyle = 'transparent'),
        n.rect(0, 0, 0.35 * t, q),
        (d = n.createLinearGradient(0, 0, 0.07 * t, 0)),
        d.addColorStop(0.07, 'rgba(125, 124, 125, 0.3)'),
        d.addColorStop(0.93, 'rgba(255, 255, 255, 0)'),
        (n.fillStyle = d),
        n.fill(),
        n.stroke(),
        n.closePath()))
    d = p.toDataURL(e, g)
    k(d)
  })
}
H.nearestPowerOfTwo = function (f) {
  return Math.pow(2, Math.round(Math.log(f) / Math.LN2))
}
H.fp = function (f, c) {
  var d = this
  null != f && (d.duration = f)
  var e = 0.8,
    g = 0.1,
    h = 0,
    l = 415 * d.duration,
    k = 315 * d.duration,
    m = 415 * d.duration
  '3D, Curled' != d.H.J.ve ||
    c ||
    ((e = 0.6), (g = 0.1), (h = -0.15), (m = 210 * d.duration))
  if ('3D, Soft' == d.H.J.ve || c) {
    ;(e = 0.8), (g = 0.1), (h = 0), (m = 415 * d.duration)
  }
  '3D, Hard' != d.H.J.ve || c || ((e = 0), (g = 0.1), (h = 0))
  '3D, Bend' != d.H.J.ve ||
    c ||
    ((e = -0.3),
    (g = 0.2),
    (h = -0.4),
    (l = 515 * d.duration),
    (k = 215 * d.duration),
    (m = 372 * d.duration))
  c && ((e *= c), (g *= c), (h = c * g), (m = k = l = 0))
  if ((!d.dc && !d.Xb) || c) {
    ;(d.dc = !0),
      d.pc.lh(h),
      (d.sa.castShadow = d.Bk),
      (d.pc.force = 0),
      (d.pc.offset = 0),
      d.ya.apply(),
      (d.to = {
        angle: d.sa.rotation.y,
        t: -1,
        bf: 0,
        page: d,
        force: d.force,
        offset: d.offset,
      }),
      c
        ? ((d.bf = 1),
          (d.angle = c * -Math.PI),
          (d.t = 1),
          (d.force = e),
          (d.offset = g),
          d.Kf(),
          (d.sa.position.z = 2),
          d.Yj())
        : (new TWEEN.Tween(d.to)
            .to({ angle: null != c ? c * -Math.PI : -Math.PI, bf: 1, t: 1 }, l)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(d.Yj)
            .start(),
          new TWEEN.Tween(d.to)
            .to({ force: e }, k)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(d.Kf)
            .onComplete(function () {
              c ||
                new TWEEN.Tween(d.to)
                  .to({ force: 0, offset: 1 }, m)
                  .easing(TWEEN.Easing.Sinusoidal.Out)
                  .onUpdate(d.Kf)
                  .onComplete(d.lj)
                  .start()
            })
            .start(),
          new TWEEN.Tween(d.to)
            .to({ offset: g }, k)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(d.Kf)
            .start(),
          (d.sa.position.z = 2))
  }
}
H.gp = function (f) {
  var c = this
  f && (c.duration = f)
  f = -0.8
  var d = 0.1,
    e = 0,
    g = 415 * c.duration,
    h = 315 * c.duration,
    l = 415 * c.duration
  '3D, Curled' == c.H.J.ve &&
    ((f = -0.6), (d = 0.1), (e = -0.15), (l = 210 * c.duration))
  '3D, Soft' == c.H.J.ve &&
    ((f = -0.8), (d = 0.1), (e = 0), (l = 415 * c.duration))
  '3D, Hard' == c.H.J.ve && ((f = 0), (d = 0.1), (e = 0))
  if ('3D, Bend' == c.H.J.ve || ('3D, Soft' == c.H.J.ve && c.pages.xb)) {
    ;(f = 0.3),
      (d = 0.2),
      (e = -0.4),
      (g = 515 * c.duration),
      (h = 215 * c.duration),
      (l = 372 * c.duration)
  }
  c.Xb ||
    c.dc ||
    ((c.Xb = !0),
    (c.sa.castShadow = c.Bk),
    c.pc.lh(e),
    (c.pc.force = 0),
    (c.pc.offset = 0),
    c.ya.apply(),
    (c.to = {
      angle: c.sa.rotation.y,
      t: -1,
      bf: 0,
      page: c,
      force: c.force,
      offset: c.offset,
    }),
    new TWEEN.Tween(c.to)
      .to({ angle: 0, bf: 1, t: 1 }, g)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .onUpdate(c.Yj)
      .start(),
    new TWEEN.Tween(c.to)
      .to({ force: f }, h)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(c.Kf)
      .onComplete(function () {
        new TWEEN.Tween(c.to)
          .to({ force: 0, offset: 1 }, l)
          .easing(TWEEN.Easing.Sinusoidal.Out)
          .onUpdate(c.Kf)
          .onComplete(c.lj)
          .start()
      })
      .start(),
    new TWEEN.Tween(c.to)
      .to({ offset: d }, h)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(c.Kf)
      .start(),
    (c.sa.position.z = 2))
}
H.Yj = function () {
  var f = this instanceof V ? this : this.page
  f.sa &&
    (f.sa.rotation && (f.sa.rotation.y = this.angle),
    f.pages.xb ||
      (!f.dc ||
        (0 != f.pageNumber && f.pageNumber + 1 != f.H.getTotalPages()) ||
        (f.pages.Tb.position.x = (1 - this.bf) * f.pages.Tb.position.x),
      f.Xb &&
        0 == f.pageNumber &&
        (f.pages.Tb.position.x =
          (1 - this.bf) * f.pages.Tb.position.x - this.bf * f.sc * 0.5),
      f.Xb &&
        f.H.ma == f.H.getTotalPages() &&
        0 == f.H.getTotalPages() % 2 &&
        (f.pages.Tb.position.x = (1 - this.bf) * f.pages.Tb.position.x)))
}
H.Kf = function () {
  var f = this instanceof V ? this : this.page
  f.pc && ((f.pc.force = this.force), (f.pc.offset = this.offset))
  f.ya && f.ya.apply()
}
H.lj = function () {
  var f = this instanceof V ? this : this.page
  f.dc
    ? ((f.dc = !1),
      (f.Wh = !0),
      (f.Xb = !1),
      (f.Xh = !1),
      f.rc && (f.sa.position.z = 2))
    : f.Xb &&
      ((f.dc = !1),
      (f.Xh = !0),
      (f.Xb = !1),
      (f.Wh = !1),
      f.rc && (f.sa.position.z = 2))
  f.rc &&
    ((f.pc.force = 0),
    f.pc.lh(0),
    (f.pc.offset = 0),
    f.ya.apply(),
    (f.sa.castShadow = !1))
  f.pages.mq()
}
var Ra = 'undefined' == typeof window
Ra && (window = [])
var FlowPaperViewer_HTML = (window.FlowPaperViewer_HTML = (function () {
  function f(c) {
    window.zine = !0
    this.config = c
    this.Oe = this.config.instanceid
    this.document = this.config.document
    this.aa = this.config.rootid
    this.N = {}
    this.Ed = this.T = null
    this.selectors = {}
    this.I = 'Portrait'
    this.Db =
      null != c.document.InitViewMode &&
      'undefined' != c.document.InitViewMode &&
      '' != c.document.InitViewMode
        ? c.document.InitViewMode
        : window.zine
        ? 'FlipView'
        : 'Portrait'
    this.initialized = !1
    this.Xe = 'flowpaper_selected_default'
    this.Sa = {}
    this.ba = []
    this.co =
      'data:image/gif;base64,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%3D'
    this.Ok =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAAAXNSR0IArs4c6QAAAAZiS0dEAFEAUQBRjSJ44QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wCCgEMO6ApCe8AAAFISURBVCjPfZJBi49hFMV/521MUYxEsSGWDDWkFKbkA/gAajaytPIFLKx8BVkodjP5AINGU0xZKAslC3Ys2NjP+VnM++rfPzmb23065z6de27aDsMwVD0C3AfOAYeB38BP9fEwDO/aMgwDAAFQDwKbwC9gZxScUM8Al5M8SPJ0Eu5JYV0FeAZcBFaAxSSPkjwHnrQ9Pf1E22XVsX5s+1m9o54cB9J2q+361KM+VN+ot9uqrjIH9VJbpz7qOvAeuAIcSnJzThA1SXaTBGAAvgCrwEvg0yxRXUhikrOjZ1RQz7uHFfUu/4C60fb16G9hetxq+1a9Pkdears2Dt1Rj87mdAx4BfwAttWvSQ4AV9W1aYlJtoFbmQJTjwP3gAvAIlDgG7CsXvu7uWQzs+cxmj0F7Fd3k3wfuRvqDWAfM+HxP6hL6oe2tn3xB7408HFbpc41AAAAAElFTkSuQmCC'
    this.Ai =
      'data:image/png;base64,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%3D'
    this.eo =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAMAAADzN3VRAAAARVBMVEX///////////////////////////////////////////////////////////////////////////////////////////+QFj7cAAAAFnRSTlMAHDE8PkJmcXR4eY+Vs8fL09Xc5vT5J4/h6AAAAFtJREFUeNqt0kkOgDAMQ9EPZSgztMX3PyoHiMKi6ttHkZ1QI+UDpmwkXl0QZbwUnTDLKEg3LLIIQw/dYATa2vYI425sSA+ssvw8/szPnrb83vyu/Tz+Tf0/qPABFzEW/E1C02AAAAAASUVORK5CYII='
    this.Ce =
      'data:image/gif;base64,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%3D'
    this.Jg =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAdCAYAAABWk2cPAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAVVSURBVHjaxFdbSFxHGJ7djfdb1HgNpsV7iwQrYhWN5EmReHlqUEGqUcGHohBCMSqhqEgU8aWiqH0QBDGkAe2bF1ARMduKldqqsURFrVqtBo1uvOzu9P+n/znMWVfNWwc+zp455/zf/LdvZnXs8qGTrrbAwe2ASddrDdvOIfSEGwADQW9DagVYCGa6t9os4kpS5bdCgGSOCpqamj5PSUm5d+fOnS98fHyiHB0dg3U6HT8/P//r6Ojoj729PePy8vJIRkbGnLQQdh25johcADcBQYDQ4uLitNevX3eB4Q2r1coVbG1t8ZWVFS7PnZ6ewtTK856eniiypbskmuoDB4ArwBfwCSCmvr7+GzBiJIO8s7OTP3jwgLu6umqQnJzMW1pauMlkEuTg9eDo6Gg62bRLrHiIhLfQO0B8VVXVk83NzUU0Mjg4yKOioi6Q2eLu3bt8enpaEJ+cnBiHh4fTJY81QwmpLxEmpKWlPVpYWJjFj7u7u7mHh8e1hC4uLgLu7u68oaFBEIPng11dXdH2iJ0ohxjSeEDmy5cvf1I8vIpQIbKHtrY2Qfz27dvnxKGXSd2oaGIAaVB9Nbu7u3tQODw8PFxDkpiYyO/fv3+BICQkhJeWlnJfX191zsvLi6+vr4vigsKKt/XWm8KaDMiFghjAFba2tmoI4+Li1Cqtra1VjUdHR/ONjQ0x39HRoc47OzvzsrIyMT8zM1NJrSdI9XSDReSJC4iNjY3ABy9evNAk/vj4mEFxiN81NTXs6dOnLDQ0lI2MjLDg4GAx//79e8Y5F8AxMDDAgJRBxL609TQEiwfwFeBbWPXewcGB3fzl5OSobYHA95Tfr1694m5ubsJDGbOzs1jJS2Dbg0RHeOpAiUZvXSEvntvb2xovlZUPDQ2x3NxcdnZ2Ju6hyMS1v7+fFRUV/SdnBoMGkFfm4OBwmwjV8Cpy50RgIG0XCJUBYiHCKI/5+XlmsVjsSh3Ogw2drNt6W2Hf2dk5DgwMtGsAciO8hWiIe8wXDhASVllZafcbzDdEZlNWJr3tS4uLi+9A0MXLspcYSiQMCAhQQ/rw4UO1uKqrq1lJSYnGFoY3MjKSQfu9kef10naEW5NlfHx8Bx9kZWVpDODHMmFhYSED8WD5+fkqMWiw5pvU1FTm6enJlpaWfrXd7rBH7wG+BnwXExPzI1TwEe4icrMjsO8qKio4GBKVqgC2PF5XV8cjIiI08xMTExx3J2ivdFK9G3ZbBvB9Y2Pj79gGzc3NGlJsAdnoVYBQi1YyGo1dxKG2jIHE3pGu2DYukFcrSJ4P5Mx9dXWVzc3NqfnV6/XXnUZYQkIC6+vrY7BL/fzs2bNW2DywkE4ohdxAhPIpwenw8BALCj++CSt2MZvNbHJy8qNIsbh6e3vZ/v7+m/b29h9AGo0oaIBT6TShFXzAI1Q6DHNSUtIwkG1hmGC1PC8vj/v5+dkNZ2ZmJocThggpFM7s48ePn5DNIOJQZVBHgoCh9QL4AQLpRSzVW0FBQbfLy8s/Kygo+BTayA12DaxGBiIuVgyFx6CARJXCiWF/bGxsEmqhH3L5GzzeBRwAPqDmUJeopwblqOJFpwd/wi3ahdzh5BCUnZ0dAluff1hYmLe/vz+uHokO19bW/p6amvoTWukXqNhZmMa2+4cITURoUVpGUQmDzW7jI8GbKs+VomJQFI7yhEZRF98B9iUc0rMzmZBJfWOh1ZjooYWq7ZhW6y6RKt+YJdIjIjmgBRxJIbXYOx9x8tYsqYaFVmgiQwqhoySdVnpHITYR0QeaO7/s7PvRh23K+w0bUjMZP5Ngvu6w/b/8rfhXgAEAmJkyLSnsNQEAAAAASUVORK5CYII='
    this.Nr = this.aa + '_textoverlay'
    this.Dk = '#' + this.Nr
    this.ma = 1
    this.renderer = this.config.renderer
    this.Ma = 'toolbar_' + this.aa
    this.M = '#' + this.Ma
    this.Dc = !1
    this.scale = this.config.document.Scale
    this.resources = new FlowPaper_Resources(this)
    this.oc = !1
    this.Ng = 0
    this.linkColor = '#72e6ff'
    this.dd = 0.4
    this.Pf = 0.3
  }
  f.prototype = {
    V: function (c) {
      if (0 < c.indexOf('undefined')) {
        return jQuery(null)
      }
      this.selectors || (this.selectors = {})
      this.selectors[c] || (this.selectors[c] = jQuery(c))
      return this.selectors[c]
    },
    ia: function () {
      return this.J ? this.J.ia : ''
    },
    loadFromUrl: function (c) {
      var d = this
      d.kh()
      var e
      window.annotations && d.plugin && d.plugin.clearMarks()
      if (d.pages) {
        for (var f = 0; f < d.document.numPages; f++) {
          d.pages.pages[f] && delete d.pages.pages[f]
        }
      }
      var h = (f = !1)
      c.RenderingOrder &&
        ((h = c.RenderingOrder.split(',')),
        (f = 0 < h.length && 'html5' == h[0]),
        (h = 0 < h.length && 'html' == h[0]))
      c.DOC &&
        ((c.PDFFile = FLOWPAPER.translateUrlByFormat(unescape(c.DOC), 'pdf')),
        (c.SWFFile = FLOWPAPER.translateUrlByFormat(unescape(c.DOC), 'swf')),
        (c.JSONFile = FLOWPAPER.translateUrlByFormat(unescape(c.DOC), 'jsonp')),
        (c.IMGFiles = FLOWPAPER.translateUrlByFormat(unescape(c.DOC), 'jpg')))
      c.FitPageOnLoad &&
        ((d.config.document.FitPageOnLoad = !0),
        (d.config.document.FitWidthOnLoad = !1))
      c.FitWidthOnLoad &&
        ((d.config.document.FitWidthOnLoad = !0),
        (d.config.document.FitPageOnLoad = !1))
      ;((eb.browser.capabilities.zr && c.PDFFile) || f) && !h
        ? (e = new CanvasPageRenderer(
            this.aa,
            c.PDFFile,
            d.config.jsDirectory,
            {
              jsonfile: c.JSONFile,
              pageImagePattern: c.pageImagePattern,
              JSONDataType: d.renderer.config.JSONDataType,
              signature: d.renderer.config.signature,
            }
          ))
        : ((c.JSONFile && c.IMGFiles) || h) &&
          !f &&
          (e = new ImagePageRenderer(
            this.aa,
            {
              jsonfile: c.JSONFile,
              pageImagePattern: c.IMGFiles,
              JSONDataType: d.renderer.config.JSONDataType,
              signature: d.renderer.config.signature,
            },
            d.config.jsDirectory
          ))
      d.renderer = e
      jQuery(d.renderer).bind('loadingProgress', function (c, e) {
        d.Im(c, e)
      })
      jQuery(d.renderer).bind('labelsLoaded', function (c, e) {
        d.Gm(c, e)
      })
      jQuery(d.renderer).bind('loadingProgressStatusChanged', function (c, e) {
        d.Jm(c, e)
      })
      jQuery(d.renderer).bind('UIBlockingRenderingOperation', function (c, e) {
        d.md(c, e)
      })
      jQuery(d.renderer).bind(
        'UIBlockingRenderingOperationCompleted',
        function () {
          d.ec()
        }
      )
      jQuery(d.renderer).bind('outlineAdded', function (c, e) {
        d.sm(c, e)
      })
      e &&
        ((d.Pe = ''),
        d.pk(),
        (d.renderer = e),
        e.initialize(function () {
          d.document.numPages = e.getNumPages()
          d.document.dimensions = e.getDimensions()
          d.document.StartAtPage = c.StartAtPage
          d.loadDoc(e, e.getNumPages())
        }, {}))
    },
    loadDoc: function (c, d) {
      this.initialized = !1
      this.document.numPages = d
      this.renderer = c
      this.show()
    },
    getDimensions: function (c) {
      return this.renderer.getDimensions(c)
    },
    Uo: function (c) {
      if (
        jQuery(c.target).hasClass('flowpaper_note_container') &&
        eb.platform.touchdevice
      ) {
        return (window.Sb = !1), !0
      }
      var d =
          eb.platform.touchdevice &&
          'undefined' !== typeof c.originalEvent.touches
            ? c.originalEvent.touches[0].pageX
            : c.pageX,
        e =
          eb.platform.touchdevice &&
          'undefined' !== typeof c.originalEvent.touches
            ? c.originalEvent.touches[0].pageY
            : c.pageY
      if (this.Dc || eb.platform.touchdevice) {
        c.target &&
          c.target.id &&
          0 <= c.target.id.indexOf('page') &&
          0 <= c.target.id.indexOf('word') &&
          ((hoverPage = parseInt(
            c.target.id.substring(c.target.id.indexOf('_') + 1)
          )),
          (hoverPageObject = Ka(this.aa)))
        if ((!hoverPageObject && !window.Sb) || !window.Sb) {
          return !0
        }
        eb.platform.touchdevice &&
          (c.preventDefault && c.preventDefault(),
          c.stopPropagation && c.stopPropagation(),
          this.pages.jScrollPane &&
            this.pages.jScrollPane.data('jsp').disable())
        this.I == this.ia() && 1 < this.scale
          ? (window.b = hoverPageObject.lm(c.target.id))
          : (window.b = hoverPageObject.match({ left: d, top: e }, !1))
        null != window.b &&
          null != window.a &&
          window.a.pageNumber != window.b.pageNumber &&
          (window.a = hoverPageObject.match({ left: d - 1, top: e - 1 }, !1))
        this.lf(!0)
        this.Fe = hoverPageObject.gg(!0, this.Xe)
      } else {
        if (
          (c.target &&
            c.target.id &&
            0 <= c.target.id.indexOf('page') &&
            ((hoverPage = parseInt(
              c.target.id.substring(c.target.id.indexOf('_') + 1)
            )),
            (hoverPageObject = Ka(this.aa))),
          hoverPageObject && hoverPageObject.match({ left: d, top: e }, !0),
          !hoverPageObject && !window.Sb)
        ) {
          return !0
        }
      }
    },
    lf: function (c) {
      eb.platform.touchdevice || (this.Fe = null)
      this.Dc &&
        (jQuery('.flowpaper_pageword_' + this.aa).removeClass(
          'flowpaper_selected'
        ),
        jQuery('.flowpaper_pageword_' + this.aa).removeClass(
          'flowpaper_selected_default'
        ))
      c &&
        jQuery('.flowpaper_pageword_' + this.aa).each(function () {
          jQuery(this).hasClass('flowpaper_selected_yellow') &&
            !jQuery(this).data('isMark') &&
            jQuery(this).removeClass('flowpaper_selected_yellow')
          jQuery(this).hasClass('flowpaper_selected_orange') &&
            !jQuery(this).data('isMark') &&
            jQuery(this).removeClass('flowpaper_selected_orange')
          jQuery(this).hasClass('flowpaper_selected_green') &&
            !jQuery(this).data('isMark') &&
            jQuery(this).removeClass('flowpaper_selected_green')
          jQuery(this).hasClass('flowpaper_selected_blue') &&
            !jQuery(this).data('isMark') &&
            jQuery(this).removeClass('flowpaper_selected_blue')
          jQuery(this).hasClass('flowpaper_selected_strikeout') &&
            !jQuery(this).data('isMark') &&
            jQuery(this).removeClass('flowpaper_selected_strikeout')
        })
    },
    Vo: function (c) {
      this.Nd = 'up'
      this.xd = this.Gj = !1
      this.km = null
      if (!this.pages || !this.pages.animating) {
        if (
          jQuery(c.target).hasClass('flowpaper_searchabstract_result') ||
          jQuery(c.target)
            .parent()
            .hasClass('flowpaper_searchabstract_result') ||
          jQuery(c.target).hasClass('flowpaper_note_container') ||
          'TEXTAREA' == c.target.tagName ||
          jQuery(c.target).hasClass('flowpaper_textarea_contenteditable') ||
          jQuery(c.target)
            .parent()
            .hasClass('flowpaper_textarea_contenteditable')
        ) {
          return !0
        }
        if (this.Dc || eb.platform.touchdevice) {
          if (hoverPageObject) {
            if (eb.platform.touchdevice) {
              var d = null
              'undefined' != typeof c.originalEvent.touches &&
                (d =
                  c.originalEvent.touches[0] ||
                  c.originalEvent.changedTouches[0])
              null != d &&
                this.bd == d.pageX &&
                this.cd == d.pageY &&
                (this.lf(), (this.Fe = hoverPageObject.gg(window.Sb, this.Xe)))
              null != d && ((this.bd = d.pageX), (this.cd = d.pageY))
              this.pages.jScrollPane &&
                this.pages.jScrollPane.data('jsp').enable()
            } else {
              window.b = hoverPageObject.match(
                { left: c.pageX, top: c.pageY },
                !1
              )
            }
            null != this.Fe &&
              this.N.trigger('onSelectionCreated', this.Fe.text)
            window.Sb = !1
            window.a = null
            window.b = null
          }
        } else {
          hoverPageObject &&
            ((window.b = hoverPageObject.match(
              { left: c.pageX, top: c.pageY },
              !1
            )),
            (window.Sb = !1),
            this.lf(),
            (this.Fe = hoverPageObject.gg(!1, this.Xe)))
        }
      }
    },
    To: function (c) {
      var d = this
      d.Nd = 'down'
      if (
        jQuery(c.target).hasClass('flowpaper_note_textarea') ||
        'INPUT' == jQuery(c.target).get(0).tagName
      ) {
        ;(window.b = null), (window.a = null)
      } else {
        if (!d.pages.animating) {
          var e =
              eb.platform.touchdevice &&
              'undefined' !== typeof c.originalEvent.touches
                ? c.originalEvent.touches[0].pageX
                : c.pageX,
            f =
              eb.platform.touchdevice &&
              'undefined' !== typeof c.originalEvent.touches
                ? c.originalEvent.touches[0].pageY
                : c.pageY
          d.bd = e
          d.cd = f
          eb.platform.touchdevice &&
            (eb.platform.touchonlydevice &&
              window.annotations &&
              ((d.Dc = !0), d.lf(!0)),
            window.clearTimeout(d.Vp),
            (d.km = new Date().getTime()),
            document.activeElement &&
              jQuery(document.activeElement).hasClass(
                'flowpaper_note_textarea'
              ) &&
              document.activeElement.blur(),
            (d.Vp = setTimeout(function () {
              if (
                null != d.km &&
                c.originalEvent.touches &&
                0 < c.originalEvent.touches.length
              ) {
                var e =
                    eb.platform.touchdevice &&
                    'undefined' !== typeof c.originalEvent.touches
                      ? c.originalEvent.touches[0].pageX
                      : c.pageX,
                  f =
                    eb.platform.touchdevice &&
                    'undefined' !== typeof c.originalEvent.touches
                      ? c.originalEvent.touches[0].pageY
                      : c.pageY
                d.bd + 20 > e &&
                  d.bd - 20 < e &&
                  d.cd + 20 > f &&
                  d.cd - 20 < f &&
                  ((hoverPage = parseInt(
                    c.target.id.substring(c.target.id.indexOf('_') + 1)
                  )),
                  (hoverPageObject = Ka(d.aa)),
                  null != hoverPageObject &&
                    (null != d.pages.jScrollPane &&
                      d.pages.jScrollPane.data('jsp').disable(),
                    (window.Sb = !0),
                    d.lf(!0),
                    (window.b = hoverPageObject.match({ left: e, top: f }, !1)),
                    (window.a = hoverPageObject.match(
                      { left: e - 1, top: f - 1 },
                      !1
                    )),
                    (d.Fe = hoverPageObject.gg(!0, d.Xe))))
              }
            }, 800)))
          if (d.Dc || eb.platform.touchdevice) {
            if (!hoverPageObject) {
              if (eb.platform.touchdevice) {
                if (
                  (c.target &&
                    c.target.id &&
                    0 <= c.target.id.indexOf('page') &&
                    0 <= c.target.id.indexOf('word') &&
                    ((hoverPage = parseInt(
                      c.target.id.substring(c.target.id.indexOf('_') + 1)
                    )),
                    (hoverPageObject = Ka(d.aa))),
                  !hoverPageObject)
                ) {
                  window.a = null
                  return
                }
              } else {
                window.a = null
                return
              }
            }
            d.I == d.ia() && 1 < d.scale
              ? (window.a = hoverPageObject.lm(c.target.id))
              : (window.a = hoverPageObject.match({ left: e, top: f }, !0))
            if (window.a) {
              return (
                (window.Sb = !0),
                d.lf(),
                (d.Fe = hoverPageObject.gg(!1, d.Xe)),
                !1
              )
            }
            jQuery(c.target).hasClass('flowpaper_tblabelbutton') ||
              jQuery(c.target).hasClass('flowpaper_tbtextbutton') ||
              jQuery(c.target).hasClass('flowpaper_colorselector') ||
              jQuery(c.target).hasClass('flowpaper_tbbutton') ||
              eb.platform.touchdevice ||
              (d.lf(), (d.Fe = hoverPageObject.gg(!1, d.Xe)))
            window.Sb = !1
            return !0
          }
          window.a = hoverPageObject
            ? hoverPageObject.match({ left: e, top: f }, !0)
            : null
        }
      }
    },
    $c: function () {
      this.width || (this.width = this.T.width())
      return this.width
    },
    yn: function () {
      return null != this.pages
        ? this.I != this.ia()
          ? this.pages.Z + 1
          : this.pages.Z
        : 1
    },
    bindEvents: function () {
      var c = this
      hoverPage = 0
      hoverPageObject = null
      c.T.bind('mousemove', function (d) {
        return c.Uo(d)
      })
      c.T.bind('mousedown', function (d) {
        return c.To(d)
      })
      c.T.bind('mouseup', function (d) {
        return c.Vo(d)
      })
      var d = jQuery._data(jQuery(window)[0], 'events')
      eb.platform.android
        ? jQuery(window).bind('orientationchange', function (d) {
            c.Fk(d)
          })
        : jQuery(window).bind('resize', function (d) {
            c.Fk(d)
          })
      jQuery(window).bind('orientationchange', function (d) {
        c.hq(d)
      })
      d && d.resize && (c.ym = d.resize[d.resize.length - 1])
      if (!c.document.DisableOverflow) {
        try {
          jQuery
            .get(
              c.config.localeDirectory +
                c.document.localeChain +
                '/FlowPaper.txt',
              function (d) {
                c.toolbar.hm(d)
                c.pk()
              }
            )
            .error(function () {
              c.pk()
              N(
                'Failed loading supplied locale (' +
                  c.document.localeChain +
                  ')'
              )
            }),
            c.toolbar.hm('')
        } catch (e) {}
      }
      c.Pe || (c.Pe = '')
    },
    hq: function (c) {
      var d = this
      d.Ti = !0
      if (window.zine && d.I == d.ia()) {
        var e =
          window.screen && window.screen.orientation
            ? window.screen.orientation.angle
            : window.orientation
        if ('Flip-SinglePage' != d.document.InitViewMode) {
          switch (e) {
            case 270:
            case -90:
            case 90:
              d.J.fa =
                'Flip-SinglePage' != d.config.document.TouchInitViewMode
                  ? !1
                  : !0
              break
            default:
              d.J.fa = !0
          }
        }
        d.J.enableWebGL = d.J.Ui()
        setTimeout(function () {
          d.I = ''
          d.switchMode(d.ia(), d.getCurrPage() - 1)
          d.Ti = !1
          window.scrollTo(0, 0)
        }, 500)
        jQuery('.flowpaper_glyphcanvas').css('z-index', -1)
      }
      if ('Portrait' == d.I || 'SinglePage' == d.I) {
        d.config.document.FitPageOnLoad && d.fitheight(),
          d.config.document.FitWidthOnLoad && d.fitwidth(),
          d.T.height('auto'),
          setTimeout(function () {
            requestAnim(function () {
              d.Fk(c)
              d.T.height('auto')
              d.Ti = !1
            })
          }, 1000)
      }
    },
    Fk: function (c) {
      if (
        !this.document.DisableOverflow &&
        !this.Ti &&
        !jQuery(c.target).hasClass('flowpaper_note')
      ) {
        c = this.T.width()
        var d = this.T.height(),
          e = !1,
          f = -1
        this.ik
          ? (f = this.ik)
          : 0 < this.T[0].style.width.indexOf('%') &&
            (this.ik = f =
              parseFloat(
                this.T[0].style.width.substr(
                  0,
                  this.T[0].style.width.length - 1
                ) / 100
              ))
        0 < f &&
          ((c =
            0 == this.T.parent().width()
              ? jQuery(document).width() * f
              : this.T.parent().width() * f),
          (e = !0))
        f = -1
        this.hk
          ? (f = this.hk)
          : 0 < this.T[0].style.height.indexOf('%') &&
            (this.hk = f =
              parseFloat(
                this.T[0].style.height.substr(
                  0,
                  this.T[0].style.height.length - 1
                ) / 100
              ))
        0 < f &&
          ((d =
            0 == this.T.parent().height()
              ? jQuery(window).height() * f
              : this.T.parent().height() * f),
          (e = !0))
        f =
          document.Sb ||
          document.mozFullScreen ||
          document.webkitIsFullScreen ||
          window.Ln ||
          window.Kk
        e && !f && this.resize(c, d)
      }
    },
    pk: function () {
      var c = this
      if (!c.document.DisableOverflow) {
        if (
          (c.Jf ||
            (c.Jf =
              null != c.toolbar && null != c.toolbar.Ua
                ? c.toolbar.wa(c.toolbar.Ua, 'LoadingPublication')
                : 'Loading Publication'),
          null == c.Jf && (c.Jf = 'Loading Publication'),
          (c.en =
            window.zine &&
            ((c.renderer.config.pageThumbImagePattern &&
              0 < c.renderer.config.pageThumbImagePattern.length) ||
              c.config.document.LoaderImage)),
          (c.bn = !1),
          c.bn)
        ) {
          ;(c.Sa = jQuery(
            String.format(
              '<div class="flowpaper-circleprogress">\n  <div class="flowpaper-circleprogress-inner" style="background-image:url({1});background-size:cover;"></div>\n  <div class="flowpaper-circleprogress-left" style="--bgcolor: {0}"></div>\n  <div class="flowpaper-circleprogress-right" style="--bgcolor: {0}"></div>\n</div>',
              c.J.backgroundColor,
              c.renderer.pa(1, 200)
            )
          )),
            c.T.append(c.Sa)
        } else {
          if (c.en) {
            var d = new Image()
            jQuery(d).bind('load', function () {
              if (!c.initialized && (!c.Sa || (c.Sa && !c.Sa.jquery))) {
                var d = this.width / 1.5,
                  f = this.height / 1.5
                this.width = d
                this.height = f
                110 < d &&
                  ((f = this.width / this.height), (d = 110), (f = d / f))
                c.Sa = jQuery(
                  String.format(
                    "<div class='flowpaper_loader' style='position:{1};z-index:100;top:50%;left:50%;color:#ffffff;width:{5}px;margin-left:-{10}px;margin-top:-{11}px;'><div style='position:relative;'><div class='flowpaper_titleloader_image flowpaper_titleloader_image-paper' style='position:absolute;left:0px;--bgimage:url({4})'></div><div class='flowpaper_titleloader_progress' style='position:absolute;left:{7}px;width:{8}px;height:{6}px;background-color:#000000;opacity:0.3;'></div></div></div>",
                    c.aa,
                    'static' == c.T.css('position') ? 'relative' : 'fixed',
                    c.J.fa && !c.xf ? '35%' : '47%',
                    c.J.rb,
                    ba(c.renderer.pa(2, 200)),
                    d,
                    f,
                    0,
                    d,
                    c.J.fa && !c.xf ? '30%' : '40%',
                    d / 2,
                    f / 2
                  )
                )
                c.T.append(c.Sa)
                jQuery(this).css({ width: d + 'px', height: f + 'px' })
                c.Sa.find('.flowpaper_titleloader_image').append(this)
              }
            })
            c.config.document.LoaderImage
              ? (d.src = c.config.document.LoaderImage)
              : (d.src = c.renderer.pa(1, 200))
          } else {
            !window.zine || (eb.browser.msie && 10 > eb.browser.version)
              ? ((c.Sa = jQuery(
                  String.format(
                    "<div class='flowpaper_loader flowpaper_initloader' style='position:{2};z-index:100;'><div class='flowpaper_initloader_panel' style='{1};background-color:#ffffff;'><img src='{0}' style='vertical-align:middle;margin-top:7px;margin-left:5px;'><div style='float:right;margin-right:25px;margin-top:19px;' class='flowpaper_notifylabel'>" +
                      c.Jf +
                      "<br/><div style='margin-left:30px;' class='flowpaper_notifystatus'>" +
                      c.Pe +
                      '</div></div></div></div>',
                    c.co,
                    'margin: 0px auto;',
                    'static' == c.T.css('position') ? 'relative' : 'absolute'
                  )
                )),
                c.T.append(c.Sa))
              : ((c.Sa = jQuery(
                  String.format(
                    "<div id='flowpaper_initloader_{0}' class='flowpaper_loader flowpaper_initloader' style='position:{1};margin: 0px auto;z-index:100;top:40%;left:{2}'></div>",
                    c.aa,
                    'static' == c.T.css('position') ? 'relative' : 'absolute',
                    eb.platform.iphone ? '40%' : '50%'
                  )
                )),
                c.T.append(c.Sa),
                (c.Xc = new CanvasLoader('flowpaper_initloader_' + c.aa)),
                c.Xc.setColor('#555555'),
                c.Xc.setShape('square'),
                c.Xc.setDiameter(70),
                c.Xc.setDensity(151),
                c.Xc.setRange(0.8),
                c.Xc.setSpeed(2),
                c.Xc.setFPS(42),
                c.Xc.show())
          }
        }
      }
    },
    initialize: function () {
      var c = this
      FLOWPAPER.Ql.init()
      c.Mq()
      c.Lq()
      FLOWPAPER.getLocationHashParameter('MaximizeViewer') &&
        $(document.body).children().not('.flowpaper_viewer').remove()
      FLOWPAPER.getLocationHashParameter('DisableOverflow') &&
        ((c.document.DisableOverflow = !0), (c.Db = 'Portrait'))
      FLOWPAPER.getLocationHashParameter('DisplayRange') &&
        (c.document.DisplayRange =
          FLOWPAPER.getLocationHashParameter('DisplayRange'))
      FLOWPAPER.getLocationHashParameter('PrintWidth') &&
        ((window.printWidth = FLOWPAPER.getLocationHashParameter('PrintWidth')),
        (window.printHeight = '1000px'))
      c.Eb =
        location.hash && 0 <= location.hash.substr(1).indexOf('inpublisher')
          ? !0
          : !1
      c.N = jQuery('#' + c.aa)
      c.toolbar = new La(this, this.document)
      c.Wl = c.document.ImprovedAccessibility
      !eb.platform.iphone ||
        c.config.document.InitViewMode ||
        window.zine ||
        (c.Db = 'Portrait')
      'BookView' == c.config.document.InitViewMode &&
        0 == c.document.StartAtPage % 2 &&
        (c.document.StartAtPage += 1)
      c.config.document.TouchInitViewMode &&
        c.config.document.TouchInitViewMode != c.Db &&
        eb.platform.touchonlydevice &&
        (c.Db = c.config.document.TouchInitViewMode)
      c.config.document.TouchInitViewMode ||
        !eb.platform.touchonlydevice ||
        window.zine ||
        (c.Db = 'SinglePage')
      window.zine && !c.document.DisableOverflow
        ? ((c.J = c.toolbar.Rg =
            new FlowPaperViewer_Zine(c.toolbar, this, c.N)),
          ('Portrait' != c.Db &&
            'Portrait' != c.config.document.TouchInitViewMode) ||
            !eb.platform.touchonlydevice ||
            (c.config.document.TouchInitViewMode =
              c.config.document.InitViewMode =
              c.I =
                'Flip-SinglePage'),
          c.J.initialize(),
          c.I != c.ia() && (c.I = c.Db))
        : (c.I = c.Db)
      'CADView' == c.I && (c.I = 'SinglePage')
      window.zine &&
        ((eb.browser.msie && 9 > eb.browser.version) ||
          (eb.browser.safari && 5 > eb.browser.Zb)) &&
        !eb.platform.touchonlydevice &&
        ((c.document.MinZoomSize = c.MinZoomSize = 0.3), (c.I = 'BookView'))
      '0px' == c.N.css('width') && c.N.css('width', '1024px')
      '0px' == c.N.css('height') && c.N.css('height', '600px')
      FLOWPAPER.getLocationHashParameter('MaximizeViewer') &&
        (c.N.css('position', 'absolute'),
        c.N.css('left', '0'),
        c.N.css('top', '0'),
        c.N.css('width', '100%'),
        c.N.css('height', '100%'))
      c.oc = c.I == c.ia() && (eb.platform.iphone || eb.platform.Fb)
      null !== c.T ||
        c.J ||
        (0 < c.N.css('width').indexOf('%') &&
          (c.ik = parseFloat(
            c.N[0].style.width.substr(0, c.N[0].style.width.length - 1) / 100
          )),
        0 < c.N.css('height').indexOf('%') &&
          (c.hk = parseFloat(
            c.N[0].style.height.substr(0, c.N[0].style.height.length - 1) / 100
          )),
        c.document.DisableOverflow
          ? ((c.config.document.FitPageOnLoad = !1),
            (c.config.document.FitWidthOnLoad = !0),
            (c.T = jQuery(
              "<div style='left:0px;top:0px;position:absolute;width:" +
                (window.printWidth ? window.printWidth : '210mm') +
                ';height:' +
                (window.printHeight ? window.printHeight : '297mm') +
                ";' class='flowpaper_viewer_container'/>"
            )))
          : ((c.T = jQuery(
              "<div style='" +
                c.N.attr('style') +
                ";' class='flowpaper_viewer_wrap flowpaper_viewer_container'/>"
            )),
            ('' != c.T.css('position') && 'static' != c.T.css('position')) ||
              c.T.css({ position: 'relative' })),
        (c.T = c.N.wrap(c.T).parent()),
        c.document.DisableOverflow
          ? c.N.css({
              left: '0px',
              top: '0px',
              position: 'relative',
              width: '100%',
              height: '100%',
              'max-width': window.printWidth ? window.printWidth : '210mm',
              'max-height': window.printHeight ? window.printHeight : '297mm',
            }).addClass('flowpaper_viewer')
          : c.N.css({
              left: '0px',
              top: '0px',
              position: 'relative',
              width: '100%',
              height: '100%',
            })
              .addClass('flowpaper_viewer')
              .addClass('flowpaper_viewer_gradient'),
        window.annotations &&
        c.config.document.AnnotationToolsVisible &&
        !c.document.DisableOverflow
          ? ((c.Ng = eb.platform.touchdevice ? 15 : 22),
            c.N.height(c.N.height() - c.Ng))
          : (c.Ng = 0))
      c.Or = c.T.html()
      eb.browser.msie &&
        jQuery('.flowpaper_initloader_panel').css('left', c.N.width() - 500)
      c.document.DisableOverflow ||
        (null == c.config.Toolbar && 0 == jQuery('#' + c.Ma).length
          ? ((c.Toolbar = c.T.prepend(
              "<div id='" +
                c.Ma +
                "' class='flowpaper_toolbarstd' style='z-index:200;overflow-y:hidden;overflow-x:hidden;'></div>"
            ).parent()),
            c.toolbar.create(c.Ma))
          : null == c.config.Toolbar ||
            c.Toolbar instanceof jQuery ||
            ((c.config.Toolbar = unescape(c.config.Toolbar)),
            (c.Toolbar = jQuery(c.config.Toolbar)),
            c.Toolbar.attr('id', c.Ma),
            c.T.prepend(c.Toolbar)))
      c.Yk()
      c.document.DisableOverflow || c.resources.initialize()
      c.document.DisplayRange && (c.DisplayRange = ea(c.document.DisplayRange))
      hoverPage = 0
      hoverPageObject = null
      null != c.J
        ? c.J.Mo(c.Ma)
        : window.annotations &&
          ((c.plugin = new FlowPaperViewerAnnotations_Plugin(
            this,
            this.document,
            c.Ma + '_annotations'
          )),
          c.plugin.create(c.Ma + '_annotations'),
          c.plugin.bindEvents(c.H))
      c.document.DisableOverflow ||
        (eb.platform.touchonlydevice ||
          c.T.append(
            "<textarea id='selector' class='flowpaper_selector' rows='0' cols='0'></textarea>"
          ),
        0 == jQuery('#printFrame_' + c.aa).length &&
          c.T.append(
            "<iframe id='printFrame_" +
              c.aa +
              "' name='printFrame_" +
              c.aa +
              "' class='flowpaper_printFrame'>"
          ))
      jQuery(c.renderer).bind('loadingProgress', function (d, e) {
        c.Im(d, e)
      })
      jQuery(c.renderer).bind('labelsLoaded', function (d, e) {
        c.Gm(d, e)
      })
      jQuery(c.renderer).bind('loadingProgressStatusChanged', function (d, e) {
        c.Jm(d, e)
      })
      jQuery(c.renderer).bind('UIBlockingRenderingOperation', function (d, e) {
        c.md(d, e)
      })
      jQuery(c.renderer).bind(
        'UIBlockingRenderingOperationCompleted',
        function () {
          c.ec()
        }
      )
      jQuery(c.renderer).bind('outlineAdded', function (d, e) {
        c.sm(d, e)
      })
      $FlowPaper(c.aa).dispose = c.dispose
      $FlowPaper(c.aa).highlight = c.highlight
      $FlowPaper(c.aa).rotate = c.rotate
      $FlowPaper(c.aa).getCurrentRenderingMode = c.getCurrentRenderingMode
    },
    Yk: function () {
      this.oo ||
        this.document.DisableOverflow ||
        (eb.platform.touchonlydevice && !this.oc
          ? eb.platform.touchonlydevice
            ? (window.zine
                ? this.N.height(
                    this.N.height() - (this.config.BottomToolbar ? 65 : 0)
                  )
                : window.annotations
                ? this.N.height(
                    this.N.height() - (this.config.BottomToolbar ? 65 : 47)
                  )
                : this.N.height(
                    this.N.height() - (this.config.BottomToolbar ? 65 : 25)
                  ),
              this.config.BottomToolbar &&
                this.T.height(this.T.height() - (eb.platform.Fb ? 7 : 18)))
            : this.N.height(this.N.height() - 25)
          : (window.zine && 'Portrait' != this.I) ||
            (this.config.BottomToolbar
              ? this.N.height(this.N.height() - jQuery(this.M).height() + 11)
              : this.N.height(this.N.height() - 23)),
        (this.oo = !0))
    },
    Gm: function (c, d) {
      if (window.zine && this.J && this.J.nc) {
        var e = this.J.nc.createElement('labels')
        this.J.nc.childNodes[0].appendChild(e)
        try {
          for (var f = 0; f < d.cm.length; f++) {
            var h = d.cm[f],
              l = e,
              k = this.J.nc.createElement('node')
            k.setAttribute('pageNumber', f + 1)
            k.setAttribute('title', escape(h))
            l.appendChild(k)
          }
        } catch (m) {}
        this.labels = jQuery(e)
      }
    },
    Im: function (c, d) {
      var e = this
      e.Pe = Math.round(100 * d.progress) + '%'
      e.Sa &&
        e.Sa.find &&
        0 < e.Sa.find('.flowpaper_notifystatus').length &&
        e.Sa.find('.flowpaper_notifystatus').html(e.Pe)
      if (e.bn && e.Sa && e.Sa.find) {
        0 <= d.progress &&
          0.25 >= d.progress &&
          0 == jQuery('flowpaper-circleprogress-50pct').length &&
          e.Sa.find('.flowpaper-circleprogress-right').addClass(
            'flowpaper-circleprogress-25pct'
          ),
          0.25 < d.progress &&
            0.5 >= d.progress &&
            0 == jQuery('flowpaper-circleprogress-75pct').length &&
            e.Sa.find('.flowpaper-circleprogress-right').addClass(
              'flowpaper-circleprogress-50pct'
            ),
          0.5 < d.progress &&
            0.95 > d.progress &&
            0 == jQuery('flowpaper-circleprogress-100pct').length &&
            (e.Sa.find('.flowpaper-circleprogress-right').removeClass(
              'flowpaper-circleprogress-50pct'
            ),
            e.Sa.find('.flowpaper-circleprogress-right').removeClass(
              'flowpaper-circleprogress-25pct'
            ),
            e.Sa.find('.flowpaper-circleprogress-right').addClass(
              'flowpaper-circleprogress-50pct-noanimation'
            ),
            e.Sa.find('.flowpaper-circleprogress-left').addClass(
              'flowpaper-circleprogress-75pct'
            )),
          0.95 < d.progress &&
            (e.Sa.find('.flowpaper-circleprogress-right').addClass(
              'flowpaper-circleprogress-50pct-noanimation'
            ),
            e.Sa.find('.flowpaper-circleprogress-left').addClass(
              'flowpaper-circleprogress-100pct'
            ))
      } else {
        if (e.en && e.Sa && e.Sa.find) {
          var f = e.Sa.find('.flowpaper_titleloader_progress')
          if (f) {
            var h = e.Sa.find('.flowpaper_titleloader_image')
            if (0 < h.length) {
              var l = h.css('width'),
                l = parseFloat(l.replace('px', ''))
              requestAnim(function () {
                if (
                  isNaN(e.Pe) ||
                  parseFloat(e.Pe) < Math.round(100 * d.progress)
                ) {
                  f.clearQueue().finish(),
                    f.animate(
                      {
                        left: l * d.progress + 'px',
                        width: l * (1 - d.progress) + 'px',
                      },
                      100
                    )
                }
              })
            }
          }
        }
      }
    },
    Jm: function (c, d) {
      this.Jf = d.label
      this.Sa.find('.flowpaper_notifylabel').html(d.label)
    },
    md: function (c, d) {
      var e = this
      e.document.DisableOverflow ||
        null !== e.Ed ||
        ((e.Ed = jQuery(
          "<div style='position:absolute;left:50%;top:50%;'></div>"
        )),
        e.T.append(e.Ed),
        e.Ed.spin({ color: '#777' }),
        null != e.wj && (window.clearTimeout(e.wj), (e.wj = null)),
        d.pq ||
          (e.wj = setTimeout(function () {
            e.Ed && (e.Ed.remove(), (e.Ed = null))
          }, 1000)))
    },
    ec: function () {
      this.Ed && (this.Ed.remove(), (this.Ed = null))
    },
    show: function () {
      var c = this
      jQuery(c.resources).bind('onPostinitialized', function () {
        setTimeout(function () {
          c.kh()
          c.config.document.RTLMode &&
            c.renderer.ca &&
            c.renderer.ca.length &&
            (c.document.StartAtPage =
              c.renderer.ca.length -
              c.document.StartAtPage +
              (0 == c.renderer.ca.length % 2 ? 1 : 0))
          c.document.DisableOverflow || null != c.J
            ? null != c.J && c.J.uh && c.toolbar.bindEvents(c.N)
            : c.toolbar.bindEvents(c.N)
          c.J &&
            c.J.uh &&
            null != c.J &&
            !c.document.DisableOverflow &&
            c.J.bindEvents(c.N)
          c.J && !c.J.uh
            ? (c.Hh = function () {
                c.toolbar.bindEvents(c.N)
                c.J.bindEvents(c.N)
                c.Bi(c.document.StartAtPage)
                jQuery(c.N).trigger(
                  'onDocumentLoaded',
                  c.renderer.getNumPages()
                )
              })
            : (c.Bi(c.document.StartAtPage),
              jQuery(c.N).trigger('onDocumentLoaded', c.renderer.getNumPages()))
        }, 50)
        jQuery(c.resources).unbind('onPostinitialized')
      })
      c.resources.sq()
    },
    dispose: function () {
      this.Ro = !0
      this.N.unbind()
      this.N.find('*').unbind()
      this.T.find('*').unbind()
      this.T.find('*').remove()
      this.N.empty()
      this.T.empty()
      jQuery(this).unbind()
      0 == jQuery('.flowpaper_viewer_container').length &&
        window.si &&
        delete window.si
      this.plugin &&
        (jQuery(this.plugin).unbind(),
        this.plugin.dispose(),
        delete this.plugin,
        (this.plugin = null))
      jQuery(this.renderer).unbind()
      this.renderer.dispose()
      delete this.renderer
      delete this.config
      jQuery(this.pages).unbind()
      this.pages.dispose()
      delete this.pages
      delete window['wordPageList_' + this.aa]
      window['wordPageList_' + this.aa] = null
      this.T.unbind('mousemove')
      this.T.unbind('mousedown')
      this.T.unbind('mouseup')
      jQuery(window).unbind('resize', this.ym)
      delete this.ym
      jQuery(this.renderer).unbind('loadingProgress')
      jQuery(this.renderer).unbind('labelsLoaded')
      jQuery(this.renderer).unbind('loadingProgressStatusChanged')
      jQuery(this.renderer).unbind('UIBlockingRenderingOperation')
      jQuery(this.renderer).unbind('UIBlockingRenderingOperationCompleted')
      this.J ? this.J.dispose() : this.N.parent().remove()
      var c = this.T.parent(),
        d = this.T.attr('style')
      this.T.remove()
      delete this.T
      delete this.N
      this.renderer &&
        (delete this.renderer.Ka,
        delete this.renderer.ca,
        delete this.renderer.ab,
        delete this.renderer.ii,
        delete this.renderer.Da)
      delete this.renderer
      var e = jQuery(this.Or)
      e.attr('style', d)
      e.attr('class', 'flowpaper_viewer')
      c.append(e)
      this.plugin && delete this.plugin
    },
    bi: function () {
      var c = this
      eb.platform.touchonlydevice
        ? ((c.initialized = !0),
          ((!c.J &&
            c.config.document.FitWidthOnLoad &&
            'TwoPage' != c.I &&
            'BookView' != c.I) ||
            'Portrait' == c.I ||
            'SinglePage' == c.I) &&
            c.fitwidth(),
          (c.config.document.FitPageOnLoad ||
            'TwoPage' == c.I ||
            'BookView' == c.I ||
            c.J) &&
            c.fitheight(),
          c.pages.qh(),
          c.pages.Ad())
        : ((c.initialized = !0),
          c.Ds ||
            c.toolbar.Wk(
              c.config.document.MinZoomSize,
              c.config.document.MaxZoomSize
            ),
          c.document.DisableOverflow
            ? c.fitwidth()
            : c.config.document.FitPageOnLoad ||
              'TwoPage' == c.I ||
              'BookView' == c.I
            ? c.fitheight()
            : c.config.document.FitWidthOnLoad &&
              'TwoPage' != c.I &&
              'BookView' != c.I
            ? c.fitwidth()
            : c.Zoom(c.config.document.Scale))
      ;(c.document.StartAtPage && 1 != c.document.StartAtPage) ||
        c.I == c.ia() ||
        c.N.trigger(
          'onCurrentPageChanged',
          c.config && c.config.document && c.config.document.RTLMode
            ? c.getTotalPages() - (c.pages.Z + 1) + 1
            : c.pages.Z + 1
        )
      c.document.StartAtPage &&
        1 != c.document.StartAtPage &&
        c.pages.scrollTo(c.document.StartAtPage)
      c.J && c.J.bi()
      c.Sa && c.Sa.fadeOut
        ? c.Sa.fadeOut(300, function () {
            c.Sa &&
              (c.Sa.remove(),
              c.T.find('.flowpaper_loader').remove(),
              c.Xc && (c.Xc.kill(), delete c.Xc),
              delete c.Sa,
              (c.Xc = null),
              jQuery(c.pages.L).fadeIn(300, function () {}),
              c.PreviewMode && c.J.vb.Di(c.pages, c.N))
          })
        : (c.T.find('.flowpaper_loader').remove(),
          jQuery(c.pages.L).fadeIn(300, function () {}),
          c.PreviewMode && c.J.vb.Di(c.pages, c.N))
      c.N.trigger('onInitializationComplete')
    },
    kh: function () {
      this.renderer.fj = !1
      if (this.pages) {
        for (var c = 0; c < this.document.numPages; c++) {
          this.pages.pages[c] && window.clearTimeout(this.pages.pages[c].Cc)
        }
      }
      this.ma = 1
      this.N.find('*').unbind()
      this.N.find('*').remove()
      this.N.empty()
      this.Pe = 0
      this.renderer.pg = !1
      jQuery('.flowpaper_glyphcanvas').css('z-index', -1)
      jQuery(this.Dk).remove()
      this.J && this.J.kh()
    },
    Bi: function (c) {
      this.pages = new W(this.N, this, this.aa, c)
      this.pages.create(this.N)
    },
    previous: function () {
      var c = this
      ;(c.Ob && c.Ob.active) ||
        (c.Uj || c.I == c.ia()
          ? c.I == c.ia() && c.pages.previous()
          : ((c.Uj = setTimeout(function () {
              window.clearTimeout(c.Uj)
              c.Uj = null
            }, 700)),
            c.pages.previous()))
    },
    sm: function () {
      for (
        var c = jQuery.parseXML('<UIConfig></UIConfig>'),
          d = c.createElement('outline'),
          e = 0;
        e < this.renderer.outline.length;
        e++
      ) {
        fa(c, this.renderer.outline[e], d, this.renderer)
      }
      this.outline = jQuery(d)
    },
    expandOutline: function () {
      var c = this
      c.Xa && c.qg()
      if (!c.mb && c.outline && (!c.outline || 0 != c.outline.length)) {
        c.xa = c.N.width()
        c.Ga = c.N.height()
        var d = (c.Jf =
            null != c.toolbar && null != c.toolbar.Ua
              ? c.toolbar.wa(c.toolbar.Ua, 'TOC', 'Table of Contents')
              : 'Table of Contents'),
          e = window.zine ? jQuery(c.M).css('background-color') : 'transparent',
          f = window.zine ? 'transparent' : '#c8c8c8',
          h = c.I == c.ia() ? '40px' : jQuery(c.M).height() + 2
        c.ia()
        var l = c.I == c.ia() ? 30 : 40,
          k = c.I == c.ia() ? 0 : 41,
          m =
            c.J && !c.J.$e
              ? jQuery(c.M).offset().top + jQuery(c.M).outerHeight()
              : 0,
          p =
            c.I == c.ia()
              ? c.T.height()
              : parseFloat(jQuery(c.pages.L).css('height')) - 10,
          n = c.I == c.ia() && eb.platform.touchonlydevice
        c.nh = c.T.find(c.M).css('margin-left')
        'rgba(0, 0, 0, 0)' == e.toString() && (e = '#555')
        c.T.append(
          jQuery(
            String.format(
              "<div class='flowpaper_toc' style='position:absolute;left:0px;top:0px;height:{5}px;width:{2};min-width:{3};opacity: 0;z-index:150;background:{9}'><div style='padding: 10px 10px 10px 10px;background-color:{6};height:{7}px'><div style='height:25px;width:100%'><div class='flowpaper_tblabel' style='margin-left:10px; width: 100%;height:25px;'><img src='{1}' style='vertical-align: middle;width:14px;height:auto;'><span style='margin-left:10px;vertical-align: middle;{10}'>{0}</span><img src='{4}' style='float:right;margin-right:5px;cursor:pointer;' class='flowpaper_toc_close' /></div><hr size='1' color='#ffffff' /></div></div>" +
                (window.zine
                  ? ''
                  : "<div class='flowpaper_bottom_fade'></div></div>"),
              d,
              c.eo,
              '20%',
              '250px',
              c.Ai,
              p,
              e,
              p - 20,
              m,
              f,
              n ? 'font-size:1.4em;' : ''
            )
          )
        )
        c.mb = c.T.find('.flowpaper_toc')
        jQuery(c.mb.children()[0]).css({
          'border-radius': '3px',
          '-moz-border-radius': '3px',
        })
        jQuery(c.mb.children()[0]).append(
          "<div class='flowpaper_toc_content' style='display:block;position:relative;height:" +
            (jQuery(c.mb.children()[0]).height() - l) +
            "px;margin-bottom:50px;width:100%;overflow-y: auto;overflow-x: hidden;'><ul class='flowpaper_accordionSkinClear'>" +
            sa(c, c.outline.children()).html() +
            '</ul></div>'
        )
        d = jQuery('.flowpaper_accordionSkinClear').children()
        0 < d.children().length &&
          ((d = jQuery(d.get(0)).children()),
          0 < d.children().length &&
            jQuery(d.find('li').get(0)).addClass('cur'))
        window.zine
          ? (jQuery(c.M).css('opacity', 0.7),
            600 < c.$c() &&
              c.resize(c.N.width(), c.N.height() + k, !1, function () {}))
          : 'TwoPage' != c.I &&
            c.I != c.ia() &&
            c.resize(c.N.width(), c.T.height() + 1, !1, function () {})
        jQuery('.flowpaper_accordionSkinClear').Kp()
        jQuery('.flowpaper-tocitem').bind('mouseup', function (d) {
          c.gotoPage(jQuery(this).data('pagenumber'))
          500 > window.innerWidth && c.yj()
          d.preventDefault && d.preventDefault()
          d.stopImmediatePropagation()
          d.returnValue = !1
        })
        c.I == c.ia()
          ? ((k = c.T.width() - c.N.width()),
            c.N.animate({ left: Math.abs(k) + 'px' }, 0))
          : c.N.animate({ left: c.mb.width() + 'px' }, 0)
        k = 0.5 * c.mb.width()
        jQuery(c.M).width() + k > c.T.width() && (k = 0)
        jQuery(c.M).animate(
          { 'margin-left': parseFloat(c.nh) + k + 'px' },
          200,
          function () {
            if (window.onresize) {
              window.onresize()
            }
          }
        )
        0 == k && c.mb.css({ top: h, height: c.N.height() - 40 + 'px' })
        c.I == c.ia() && c.J.Pm()
        c.mb.fadeTo('fast', 1)
        c.T.find('.flowpaper_toc_close').bind('mousedown', function () {
          c.yj()
        })
      }
    },
    yj: function () {
      this.mb.hide()
      this.T.find('.flowpaper_tocitem, .flowpaper_tocitem_separator').remove()
      this.mb.remove()
      this.mb = null
      window.zine &&
        (jQuery(this.M).css('opacity', 1),
        600 < this.$c() && this.resize(this.xa, this.Ga + 33, !1))
      this.N.css({ left: '0px' })
      jQuery(this.M).animate({ 'margin-left': parseFloat(this.nh) + 'px' }, 200)
      this.I == this.ia() && this.J.qg()
    },
    setCurrentCursor: function (c) {
      'ArrowCursor' == c &&
        ((this.Dc = !1),
        addCSSRule('.flowpaper_pageword', 'cursor', 'default'),
        window.annotations || jQuery('.flowpaper_pageword_' + this.aa).remove())
      'TextSelectorCursor' == c &&
        ((this.Dc = !0),
        (this.Xe = 'flowpaper_selected_default'),
        addCSSRule('.flowpaper_pageword', 'cursor', 'text'),
        window.annotations ||
          (this.pages.getPage(this.pages.Z - 1),
          this.pages.getPage(this.pages.Z - 2),
          jQuery('.flowpaper_pageword_' + this.aa).remove(),
          this.pages.Na()))
      this.J && this.J.setCurrentCursor(c)
      this.pages.setCurrentCursor(c)
      jQuery(this.M).trigger('onCursorChanged', c)
    },
    highlight: function (c) {
      var d = this
      jQuery.ajax({
        type: 'GET',
        url: c,
        dataType: 'xml',
        error: function () {},
        success: function (c) {
          jQuery(c).find('Body').attr('color')
          c = jQuery(c).find('Highlight')
          var f = 0,
            h = -1,
            l = -1
          jQuery(c)
            .find('loc')
            .each(function () {
              f = parseInt(jQuery(this).attr('pg'))
              h = parseInt(jQuery(this).attr('pos'))
              l = parseInt(jQuery(this).attr('len'))
              d.pages.getPage(f).gf(h, l, !1)
            })
          d.pages.Na()
        },
      })
    },
    printPaper: function (c) {
      if (this.document.PrintFn) {
        this.document.PrintFn()
      } else {
        if (eb.platform.touchonlydevice) {
          c = 'current'
        } else {
          if (!c) {
            jQuery('#modal-print').css('background-color', '#dedede')
            jQuery('#modal-print').smodal({ minHeight: 255, appendTo: this.T })
            jQuery('#modal-print').parent().css('background-color', '#dedede')
            return
          }
        }
        'current' == c &&
          0 <
            jQuery(this.M)
              .find('.flowpaper_txtPageNumber')
              .val()
              .indexOf('-') &&
          (c = this.getCurrPage() - 1 + '-' + this.getCurrPage())
        var d = null,
          e = 'ImagePageRenderer'
        if (
          'ImagePageRenderer' == this.renderer.Af() ||
          this.document.MixedMode ||
          (this.renderer.config.pageImagePattern &&
            this.renderer.config.jsonfile)
        ) {
          ;(e = 'ImagePageRenderer'),
            (d =
              "{key : '" +
              this.config.key +
              "',jsonfile : '" +
              this.renderer.config.jsonfile +
              "',compressedJsonFormat : " +
              (this.renderer.Oa ? this.renderer.Oa : !1) +
              ",pageImagePattern : '" +
              this.renderer.config.pageImagePattern +
              "',JSONDataType : '" +
              this.renderer.config.JSONDataType +
              "',signature : '" +
              this.renderer.config.signature +
              "',UserCollaboration : " +
              this.config.UserCollaboration +
              '}')
        }
        'CanvasPageRenderer' == this.renderer.Af() &&
          ((e = 'CanvasPageRenderer'),
          (d =
            "{key : '" +
            this.config.key +
            "',jsonfile : '" +
            this.renderer.config.jsonfile +
            "',PdfFile : '" +
            this.renderer.file +
            "',compressedJsonFormat : " +
            (this.renderer.Oa ? this.renderer.Oa : !1) +
            ",pageThumbImagePattern : '" +
            this.renderer.config.pageThumbImagePattern +
            "',pageImagePattern : '" +
            this.renderer.config.pageImagePattern +
            "',JSONDataType : '" +
            this.renderer.config.JSONDataType +
            "',signature : '" +
            this.renderer.config.signature +
            "',UserCollaboration : " +
            this.config.UserCollaboration +
            '}'))
        if (0 < jQuery('#printFrame_' + this.aa).length) {
          var f = (window.printFrame =
              eb.browser.msie || eb.browser.wg
                ? window.open().document
                : jQuery('#printFrame_' + this.aa)[0].contentWindow.document ||
                  jQuery('#printFrame_' + this.aa)[0].contentDocument),
            h = '',
            l = Math.floor(this.renderer.getDimensions()[0].width),
            k = Math.floor(this.renderer.getDimensions()[0].height)
          jQuery('#printFrame_' + this.aa).css({
            width: S(l) + 'px',
            height: S(k) + 'px',
          })
          f.open()
          h += '<!doctype html><html>'
          h += '<head>'
          h +=
            "<script type='text/javascript' src='" +
            this.config.jsDirectory +
            "jquery.min.js'>\x3c/script>"
          h +=
            "<script type='text/javascript' src='" +
            this.config.jsDirectory +
            "jquery.extensions.min.js'>\x3c/script>"
          h +=
            '<script type="text/javascript" src="' +
            this.config.jsDirectory +
            'flowpaper.js">\x3c/script>'
          h +=
            '<script type="text/javascript" src="' +
            this.config.jsDirectory +
            'flowpaper_handlers.js">\x3c/script>'
          h +=
            "<script type='text/javascript' src='" +
            this.config.jsDirectory +
            "FlowPaperViewer.js'>\x3c/script>"
          eb.browser.safari ||
            this.renderer.ua ||
            (h +=
              "<script type='text/javascript'>window.printWidth = '" +
              l +
              "pt';window.printHeight = '" +
              k +
              "pt';\x3c/script>")
          h +=
            "<style type='text/css' media='print'>html, body { height:100%; } body { margin:0; padding:0; } .flowpaper_ppage { clear:both;display:block;max-width:" +
            l +
            'pt !important;max-height:' +
            k +
            'pt !important;margin-top:0px;} .ppage_break { page-break-after : always; } .ppage_none { page-break-after : avoid; }</style>'
          this.renderer.ua
            ? this.renderer.ua &&
              (h +=
                "<style type='text/css' media='print'>@page { size: auto; margin: 0mm; }</style>")
            : (h +=
                "<style type='text/css' media='print'>@supports ((size:A4) and (size:1pt 1pt)) {@page { margin: 0mm 0mm 0mm 0mm; size: " +
                l +
                'pt ' +
                k +
                'pt;}}</style>')
          h +=
            "<link rel='stylesheet' type='text/css' href='" +
            this.config.cssDirectory +
            "flowpaper.css' />"
          h += '</head>'
          h += '<body>'
          h += '<script type="text/javascript">'
          h += 'function waitForLoad(){'
          h +=
            'if(window.jQuery && window.$FlowPaper && window.print_flowpaper_Document ){'
          h += 'window.focus();'
          h +=
            "window.print_flowpaper_Document('" +
            e +
            "'," +
            d +
            ",'" +
            c +
            "', " +
            this.yn() +
            ', ' +
            this.getTotalPages() +
            ", '" +
            this.config.jsDirectory +
            "');"
          h += '}else{setTimeout(function(){waitForLoad();},1000);}'
          h += '}'
          h += 'waitForLoad();'
          h += '\x3c/script>'
          h += '</body></html>'
          f.write(h)
          eb.browser.msie || setTimeout("window['printFrame'].close();", 3000)
          eb.browser.msie && 9 <= eb.browser.version && f.close()
        }
      }
    },
    switchMode: function (c, d) {
      var e = this
      e.I == c ||
        (('TwoPage' == c || 'BookView' == c) && 2 > e.getTotalPages()) ||
        (d > e.getTotalPages() && (d = e.getTotalPages()),
        e.Xa && e.qg(),
        jQuery(e.pages.L).Yo(function () {
          e.J && e.J.switchMode(c, d)
          'Tile' == c && (e.I = 'ThumbView')
          'Portrait' == c &&
            (e.I = 'SinglePage' == e.Db ? 'SinglePage' : 'Portrait')
          'SinglePage' == c && (e.I = 'SinglePage')
          'TwoPage' == c && (e.I = 'TwoPage')
          'BookView' == c && (e.I = 'BookView')
          e.kh()
          e.pages.Eq()
          e.renderer.qf = -1
          e.renderer.Ka && e.renderer.Ka.Jq()
          'TwoPage' != c &&
            'BookView' != c &&
            (null != d ? (e.pages.Z = d - 1) : (d = 1))
          e.Bi(d)
          jQuery(e.M).trigger('onViewModeChanged', c)
          setTimeout(function () {
            !eb.platform.touchdevice ||
            (eb.platform.touchdevice && ('SinglePage' == c || 'Portrait' == c))
              ? e.fitheight()
              : 'TwoPage' != c && 'BookView' != c && c != e.ia() && e.fitwidth()
            'TwoPage' != c && 'BookView' != c && e.Fc(d)
          }, 100)
        }))
    },
    fitwidth: function () {
      if (
        'TwoPage' != this.I &&
        'BookView' != this.I &&
        'ThumbView' != this.I
      ) {
        var c =
          jQuery(this.pages.L).width() -
          (this.document.DisableOverflow ? 0 : 15)
        this.Xa && (c -= 100)
        var d = 1 < this.getTotalPages() ? this.ma - 1 : 0
        0 > d && (d = 0)
        this.DisplayRange && (d = this.DisplayRange[0] - 1)
        var e =
          this.pages.getPage(d).dimensions.xa /
          this.pages.getPage(d).dimensions.Ga
        if (eb.platform.touchonlydevice) {
          ;(f =
            c / (this.pages.getPage(d).Ha * e) -
            (this.document.DisableOverflow ? 0 : 0.03)),
            (window.FitWidthScale = f),
            this.sb(f),
            this.pages.uk()
        } else {
          var f =
            c / (this.pages.getPage(d).Ha * this.document.MaxZoomSize * e) -
            (this.document.DisableOverflow ? 0 : 0.012)
          if (
            90 == this.pages.getPage(d).rotation ||
            270 == this.pages.getPage(d).rotation
          ) {
            f = this.yf()
          }
          window.FitWidthScale = f
          jQuery(this.M).trigger(
            'onScaleChanged',
            f / this.document.MaxZoomSize
          )
          if (this.document.DisableOverflow) {
            for (
              var h = S(parseFloat(window.printHeight)) - 0,
                l = this.pages.getPage(d).Ha * this.document.MaxZoomSize * f,
                k =
                  this.pages.getPage(d).Ha *
                  this.pages.getPage(d).Ke() *
                  this.document.MaxZoomSize *
                  f,
                m = 0;
              l > h;

            ) {
              ;(f =
                c / (this.pages.getPage(d).Ha * this.document.MaxZoomSize * e) +
                m),
                (l = this.pages.getPage(d).Ha * this.document.MaxZoomSize * f),
                (k =
                  this.pages.getPage(d).Ha *
                  this.pages.getPage(d).Ke() *
                  this.document.MaxZoomSize *
                  f),
                (m -= 0.0001)
            }
            this.T.css('width', Math.floor(k) + 'px')
            this.T.css('height', Math.floor(l) + 'px')
          }
          f * this.document.MaxZoomSize >= this.document.MinZoomSize &&
            f <= this.document.MaxZoomSize &&
            ('Portrait' == this.I
              ? this.sb(this.document.MaxZoomSize * f, { Pg: !0 })
              : this.sb(this.document.MaxZoomSize * f))
        }
      }
    },
    getCurrentRenderingMode: function () {
      return this.renderer instanceof CanvasPageRenderer ? 'html5' : 'html'
    },
    sb: function (c, d) {
      var e = this
      if (e.initialized && e.pages) {
        e.I == e.ia() && 1 == c && ((d = d || {}), (d.Pg = !0))
        if (!d || (d && !d.Pg)) {
          var f = 100 / (100 * e.document.ZoomInterval)
          c = Math.round(c * f) / f
        }
        e.I == e.ia() && 1 > c && (c = 1)
        jQuery(e.M).trigger('onScaleChanged', c / e.document.MaxZoomSize)
        var f = jQuery(e.pages.L).prop('scrollHeight'),
          h = jQuery(e.pages.L).scrollTop(),
          f = 0 < h ? h / f : 0
        null != e.Zf && (window.clearTimeout(e.Zf), (e.Zf = null))
        e.pages.Cq() &&
          e.scale != c &&
          (jQuery('.flowpaper_annotation_' + e.aa).remove(),
          jQuery('.flowpaper_pageword_' + e.aa).remove())
        e.Zf = setTimeout(function () {
          e.vc()
          e.pages && e.pages.Na()
        }, 500)
        if (0 < c) {
          c < e.config.document.MinZoomSize &&
            (c = this.config.document.MinZoomSize)
          c > e.config.document.MaxZoomSize &&
            (c = this.config.document.MaxZoomSize)
          e.pages.Ya(c, d)
          e.scale = c
          !d || (d && !d.sd)
            ? e.pages.pages[0] && e.pages.pages[0].kf()
            : e.pages.Fh(d.lc, d.Ec)
          jQuery(e.M).trigger('onZoomFactorChanged', { hg: c, H: e })
          if (
            'undefined' != window.FitWidthScale &&
            Math.round(100 * window.FitWidthScale) ==
              Math.round((c / e.document.MaxZoomSize) * 100)
          ) {
            if (
              (jQuery(e.M).trigger('onFitModeChanged', 'FitWidth'),
              window.onFitModeChanged)
            ) {
              window.onFitModeChanged('Fit Width')
            }
          } else {
            if (
              'undefined' != window.FitHeightScale &&
              Math.round(100 * window.FitHeightScale) ==
                Math.round((c / e.document.MaxZoomSize) * 100)
            ) {
              if (
                (jQuery(e.M).trigger('onFitModeChanged', 'FitHeight'),
                window.onFitModeChanged)
              ) {
                window.onFitModeChanged('Fit Height')
              }
            } else {
              if (
                (jQuery(e.M).trigger('onFitModeChanged', 'FitNone'),
                window.onFitModeChanged)
              ) {
                window.onFitModeChanged('Fit None')
              }
            }
          }
          e.I != e.ia() &&
            (e.pages.Ad(),
            e.pages.Cd(),
            e.pages.uk(),
            (h = jQuery(e.pages.L).prop('scrollHeight')),
            eb.browser.capabilities.Pb &&
              (!d || (d && !d.sd)
                ? jQuery(e.pages.L).scrollTo(
                    { left: '50%', top: h * f + 'px' },
                    0,
                    { axis: 'xy' }
                  )
                : jQuery(e.pages.L).scrollTo({ top: h * f + 'px' }, 0, {
                    axis: 'y',
                  })))
        }
      }
    },
    vc: function () {
      if (this.renderer) {
        null != this.Zf && (window.clearTimeout(this.Zf), (this.Zf = null))
        'CanvasPageRenderer' == this.renderer.Af() &&
          (jQuery(
            '.flowpaper_pageword_' +
              this.aa +
              ':not(.flowpaper_selected_searchmatch)'
          ).remove(),
          window.annotations && this.pages.Na())
        this.pages.Bg &&
          0 <= this.pages.Bg &&
          this.pages.pages[this.pages.Bg].hb &&
          this.renderer.ic(this.pages.pages[this.pages.Bg], !0)
        for (var c = 0; c < this.document.numPages; c++) {
          this.pages.$a(c) &&
            c != this.pages.Bg &&
            this.pages.pages[c] &&
            (this.pages.pages[c].hb
              ? this.renderer.ic(this.pages.pages[c], !0)
              : (this.pages.pages[c].va = !1))
        }
      }
    },
    Zoom: function (c, d) {
      !eb.platform.touchonlydevice ||
      ('TwoPage' != this.I && 'BookView' != this.I)
        ? (c > this.document.MaxZoomSize && (c = this.document.MaxZoomSize),
          (c = c / this.document.MaxZoomSize),
          jQuery(this.M).trigger('onScaleChanged', c),
          c * this.document.MaxZoomSize >= this.document.MinZoomSize &&
            c <= this.document.MaxZoomSize &&
            this.sb(this.document.MaxZoomSize * c, d))
        : 1 < c
        ? 'TwoPage' == this.I || 'BookView' == this.I
          ? this.pages.Me()
          : ('Portrait' != this.I && 'SinglePage' != this.I) || this.fitwidth()
        : 'TwoPage' == this.I || 'BookView' == this.I
        ? this.pages.Id()
        : ('Portrait' != this.I && 'SinglePage' != this.I) || this.fitheight()
    },
    ZoomIn: function () {
      this.Zoom(this.scale + 3 * this.document.ZoomInterval)
    },
    ZoomOut: function () {
      if ('Portrait' == this.I || 'SinglePage' == this.I) {
        null != this.pages.jScrollPane
          ? (this.pages.jScrollPane.data('jsp').scrollTo(0, 0, !1),
            this.pages.jScrollPane.data('jsp').reinitialise(this.yd))
          : this.pages
              .V(this.pages.L)
              .parent()
              .scrollTo({ left: 0, top: 0 }, 0, { axis: 'xy' })
      }
      this.Zoom(this.scale - 3 * this.document.ZoomInterval)
    },
    sliderChange: function (c) {
      c > this.document.MaxZoomSize ||
        ((c = c / this.document.MaxZoomSize),
        c * this.document.MaxZoomSize >= this.document.MinZoomSize &&
          c <= this.document.MaxZoomSize &&
          this.sb(this.document.MaxZoomSize * c))
    },
    hi: function () {
      var c = this
      if (
        !eb.platform.mobilepreview &&
        !eb.platform.Fb &&
        (c.mb && c.yj(), !c.Xa)
      ) {
        c.T.find(
          '.flowpaper_searchabstract_result, .flowpaper_searchabstract_result_separator'
        ).remove()
        var d = (c.Jf =
            null != c.toolbar && null != c.toolbar.Ua
              ? c.toolbar.wa(c.toolbar.Ua, 'Search')
              : 'Search'),
          e =
            c.I == c.ia()
              ? c.T.height() - 0
              : parseFloat(jQuery(c.pages.L).css('height')) - 10,
          f = c.I == c.ia() ? jQuery(c.M).css('background-color') : '#c8c8c8',
          h = c.I == c.ia() ? '40px' : jQuery(c.M).height() + 2,
          l = c.I == c.ia() ? 'color:#ededed' : 'color:#555555;',
          k = (c.ia(), 40),
          m = c.I == c.ia() ? 0 : 41
        'rgba(0, 0, 0, 0)' == f.toString() && (f = '#555')
        c.nh = c.T.find(c.M).css('margin-left')
        c.I != c.ia() || c.Xa
          ? c.Xa ||
            (c.T.append(
              jQuery(
                String.format(
                  "<div class='flowpaper_searchabstracts' style='position:absolute;left:0px;top:0px;height:{5}px;width:{2};min-width:{3};opacity: 0;z-index:13;overflow:hidden;'><div style='margin: 0px 0px 0px 0px;padding: 10px 7px 10px 10px;background-color:{6};height:{7}px'><div style='height:25px;width:100%' <div class='flowpaper_tblabel' style='margin-left:10px; width: 100%;height:25px;'><img src='{1}' style='vertical-align: middle'><span style='margin-left:10px;vertical-align: middle'>{0}</span><img src='{4}' style='float:right;margin-right:5px;cursor:pointer;' class='flowpaper_searchabstracts_close' /></div><div class='flowpaper_bottom_fade'></div></div></div>",
                  d,
                  c.Ok,
                  '20%',
                  '250px',
                  c.Ai,
                  parseFloat(jQuery(c.pages.L).css('height')) + 10,
                  f,
                  c.T.height() - 58
                )
              )
            ),
            (c.Xa = c.T.find('.flowpaper_searchabstracts')),
            jQuery(c.Xa.children()[0]).append(
              "<div class='flowpaper_searchabstracts_content' style='display:block;position:relative;height:" +
                e +
                "px;margin-bottom:50px;width:100%;overflow-y: auto;overflow-x: hidden;'></div>"
            ),
            'TwoPage' != c.I &&
              c.I != c.ia() &&
              c.resize(c.N.width(), c.T.height() + 1, !1, function () {}),
            c.N.animate({ left: c.Xa.width() / 2 + 'px' }, 0),
            c.document.FitWidthOnLoad ? c.fitwidth() : c.fitheight())
          : (jQuery(c.M).css('opacity', 0.7),
            c.T.append(
              jQuery(
                String.format(
                  "<div class='flowpaper_searchabstracts' style='position:absolute;left:0px;top:{8}px;height:{5}px;width:{2};min-width:{3};opacity: 0;z-index:50;{9}'><div style='padding: 10px 10px 10px 10px;background-color:{6};height:{7}px'><div style='height:25px;width:100%'><div class='flowpaper_tblabel' style='margin-left:10px; width: 100%;height:25px;'><img src='{1}' style='vertical-align: middle'><span style='margin-left:10px;vertical-align: middle'>{0}</span><img src='{4}' style='float:right;margin-right:5px;cursor:pointer;' class='flowpaper_searchabstracts_close' /></div><hr size='1' color='#ffffff' /></div></div>",
                  d,
                  c.Ok,
                  '20%',
                  '250px',
                  c.Ai,
                  e,
                  f,
                  e - 20,
                  0,
                  c.J.backgroundImage
                    ? ''
                    : 'background-color:' + c.J.backgroundColor
                )
              )
            ),
            (c.Xa = c.T.find('.flowpaper_searchabstracts')),
            jQuery(c.Xa.children()[0]).css({
              'border-radius': '0 3px 3px 0px',
              '-moz-border-radius': '3px',
            }),
            jQuery(c.Xa.children()[0]).append(
              "<div class='flowpaper_searchabstracts_content' style='display:block;position:relative;height:" +
                (jQuery(c.Xa.children()[0]).height() - k) +
                "px;margin-bottom:50px;width:100%;overflow-y: auto;overflow-x: hidden;'></div>"
            ),
            c.resize(c.N.width(), c.N.height() + m, !1, function () {}),
            (d = c.T.width() - c.N.width()),
            c.N.animate({ left: Math.abs(d) + 'px' }, 0))
        d = 0.5 * c.Xa.width()
        jQuery(c.M).width() + d > c.T.width() && (d = 0)
        jQuery(c.M).animate(
          { 'margin-left': parseFloat(c.nh) + d + 'px' },
          200,
          function () {
            if (window.onresize) {
              window.onresize()
            }
          }
        )
        0 == d &&
          c.Xa.css({
            top: h,
            height: parseFloat(jQuery(c.pages.L).css('height')) + 10 + 'px',
          })
        c.I == c.ia() && c.J.hi()
        c.Xa.fadeTo('fast', 1)
        var p = c.T.find('.flowpaper_searchabstracts_content')
        jQuery(c).bind('onSearchAbstractAdded', function (d, e) {
          var f = e.Ee.ip
          100 < f.length && (f = f.substr(0, 100) + '...')
          f = f.replace(
            new RegExp(c.oe, 'g'),
            "<font style='color:#ffffff'>[" + c.oe + ']</font>'
          )
          f =
            '<b>p.' +
            c.toolbar.Td(e.Ee.pageIndex + 1, e.Ee.pageIndex + 1, !0) +
            '</b> : ' +
            f
          p.append(
            jQuery(
              String.format(
                "<div id='flowpaper_searchabstract_item_{1}' style='{2}' class='flowpaper_searchabstract_result'>{0}</div><hr size=1 color='#777777' style='margin-top:8px;' class='flowpaper_searchabstract_result_separator' />",
                f,
                e.Ee.id,
                l
              )
            )
          )
          jQuery('#flowpaper_searchabstract_item_' + e.Ee.id).bind(
            'mousedown',
            function (d) {
              c.fb = e.Ee.pageIndex + 1
              c.Ue = e.Ee.Hq
              c.wc = -1
              c.searchText(c.oe, !1)
              d.preventDefault && d.preventDefault()
              d.returnValue = !1
            }
          )
          jQuery('#flowpaper_searchabstract_item_' + e.Ee.id).bind(
            'mouseup',
            function (c) {
              c.preventDefault && c.preventDefault()
              c.returnValue = !1
            }
          )
        })
        c.T.find('.flowpaper_searchabstracts_close').bind(
          'mousedown',
          function () {
            c.qg()
          }
        )
      }
    },
    qg: function () {
      this.Xa &&
        (this.N.css({ left: '0px' }),
        this.Xa.remove(),
        (this.Xa = null),
        this.T.find(
          '.flowpaper_searchabstract_result, .flowpaper_searchabstract_result_separator'
        ).remove(),
        this.I == this.ia()
          ? (jQuery(this.M).css('opacity', 1),
            this.resize(this.T.width(), this.N.height(), !1))
          : 'TwoPage' == this.I
          ? (this.N.css({ left: '0px', width: '100%' }), this.fitheight())
          : this.resize(this.T.width(), this.T.height() + 1, !1),
        jQuery(this.M).animate(
          { 'margin-left': parseFloat(this.nh) + 'px' },
          200
        ),
        this.I == this.ia() && this.J.qg())
      jQuery(this).unbind('onSearchAbstractAdded')
    },
    bm: function (c, d) {
      jQuery('.flowpaper_searchabstract_blockspan').remove()
      var e = this.renderer.getNumPages()
      d || (d = 0)
      for (var f = d; f < e; f++) {
        this.ko(f, c)
      }
      this.I != this.ia() &&
        this.T.find('.flowpaper_searchabstracts_content').append(
          jQuery(
            "<div class='flowpaper_searchabstract_blockspan' style='display:block;clear:both;height:200px'></div>"
          )
        )
    },
    ko: function (c, d) {
      var e = this.renderer.Da
      if (null != e[c]) {
        ;-1 < e[c].toLowerCase().indexOf('actionuri') &&
          (e[c] = e[c].replace(/actionuri(.*?)\):/gi, ''))
        ;-1 < e[c].toLowerCase().indexOf('actiongotor') &&
          (e[c] = e[c].replace(/actiongotor(.*?)\):/gi, ''))
        ;-1 < e[c].toLowerCase().indexOf('actiongoto') &&
          (e[c] = e[c].replace(/actiongoto(.*?)\):/gi, ''))
        for (var f = e[c].toLowerCase().indexOf(d), h = 0; 0 <= f; ) {
          var l = 0 < f - 50 ? f - 50 : 0,
            k = f + 75 < e[c].length ? f + 75 : e[c].length,
            m = this.jd.length
          this.jd.Rf[m] = []
          this.jd.Rf[m].pageIndex = c
          this.jd.Rf[m].Hq = h
          this.jd.Rf[m].id = this.aa + '_' + c + '_' + h
          this.jd.Rf[m].ip = e[c].substr(l, k - l)
          f = e[c].toLowerCase().indexOf(d, f + 1)
          jQuery(this).trigger('onSearchAbstractAdded', { Ee: this.jd.Rf[m] })
          h++
        }
        e = this.T.find('.flowpaper_searchabstracts_content')
        e.find('.flowpaper-loader').remove()
      } else {
        null == this.Em &&
          ((e = this.T.find('.flowpaper_searchabstracts_content')),
          e.find('.flowpaper-loader').remove(),
          e.append(
            jQuery(
              '<div class="flowpaper-loader" style="display:table-cell"></div>'
            )
          ),
          this.kn(d, c))
      }
    },
    kn: function (c, d) {
      var e = this
      e.Em = setTimeout(function () {
        null == e.renderer.Jd
          ? e.renderer.Kc(d + 1, !1, function () {
              e.Em = null
              e.bm(c, d)
            })
          : e.kn(c, d)
      }, 100)
    },
    searchText: function (c, d) {
      var e = this
      if (null != c && (null == c || 0 != c.length)) {
        if (
          (void 0 !== d ||
            ('Portrait' != e.I &&
              'SinglePage' != e.I &&
              'TwoPage' != e.I &&
              e.I != e.ia()) ||
            !e.document.EnableSearchAbstracts ||
            eb.platform.mobilepreview ||
            (d = !0),
          d &&
            e.I == e.ia() &&
            1 < e.scale &&
            (e.renderer.yb && e.renderer.hd && e.renderer.hd(), e.Zoom(1)),
          jQuery(e.M).find('.flowpaper_txtSearch').val() != c &&
            jQuery(e.M).find('.flowpaper_txtSearch').val(c),
          'ThumbView' == e.I)
        ) {
          e.switchMode('Portrait'),
            setTimeout(function () {
              e.searchText(c)
            }, 1000)
        } else {
          var f = e.renderer.Da,
            h = e.renderer.getNumPages()
          e.ei || (e.ei = 0)
          if (0 == e.renderer.Ka.ab.length && 10 > e.ei) {
            window.clearTimeout(e.Iq),
              (e.Iq = setTimeout(function () {
                e.searchText(c, d)
              }, 500)),
              e.ei++
          } else {
            e.ei = 0
            e.Ue || (e.Ue = 0)
            e.fb || (e.fb = -1)
            null != c && 0 < c.length && (c = c.toLowerCase())
            e.oe != c &&
              ((e.wc = -1),
              (e.oe = c),
              (e.Ue = 0),
              (e.fb = -1),
              (e.jd = []),
              (e.jd.Rf = []))
            ;-1 == e.fb
              ? ((e.fb = parseInt(e.ma)),
                e.config.document.RTLMode && (e.fb = parseInt(e.ma) - h + 1))
              : (e.wc = e.wc + c.length)
            0 == e.jd.Rf.length &&
              e.jd.searchText != c &&
              d &&
              (e.jd.searchText != c &&
                e.T.find(
                  '.flowpaper_searchabstract_result, .flowpaper_searchabstract_result_separator'
                ).remove(),
              (e.jd.searchText = c),
              e.hi(),
              e.bm(c))
            1 > e.fb && (e.fb = 1)
            for (; e.fb - 1 < h; ) {
              var l = f[e.fb - 1]
              if (e.renderer.Ba && null == l) {
                jQuery(e.renderer).trigger('UIBlockingRenderingOperation', e.aa)
                e.dr = e.fb
                e.renderer.Kc(e.fb, !1, function () {
                  l = f[e.fb - 1]
                  e.dr = null
                })
                return
              }
              e.wc = l.indexOf(c, -1 == e.wc ? 0 : e.wc)
              if (0 <= e.wc) {
                e.ma == e.fb ||
                !(
                  (e.I == e.ia() && e.ma != e.fb + 1) ||
                  ('BookView' == e.I && e.ma != e.fb + 1) ||
                  ('TwoPage' == e.I && e.ma != e.fb - 1) ||
                  ('SinglePage' == e.I && e.ma != e.fb)
                ) ||
                ('TwoPage' != e.I &&
                  'BookView' != e.I &&
                  'SinglePage' != e.I &&
                  e.I != e.ia())
                  ? (e.Ue++,
                    e.renderer.Bb
                      ? this.pages.getPage(e.fb - 1).load(function () {
                          e.pages.getPage(e.fb - 1).Vc(e.oe, !1, e.wc)
                        })
                      : ('Portrait' == e.I &&
                          this.pages.getPage(e.fb - 1).load(function () {
                            e.pages.getPage(e.fb - 1).Vc(e.oe, !1, e.wc)
                          }),
                        ('TwoPage' != e.I &&
                          'SinglePage' != e.I &&
                          e.I != e.ia()) ||
                          this.pages.getPage(e.fb - 1).Vc(e.oe, !1, e.wc)))
                  : e.gotoPage(e.fb, function () {
                      e.wc = e.wc - c.length
                      e.searchText(c)
                    })
                break
              }
              e.fb++
              e.wc = -1
              e.Ue = 0
            }
            ;-1 == e.wc &&
              ((e.wc = -1),
              (e.Ue = 0),
              (e.fb = -1),
              e.ec(),
              alert(
                null != e.toolbar && null != e.toolbar.Ua
                  ? e.toolbar.wa(e.toolbar.Ua, 'Finishedsearching')
                  : 'No more search matches.'
              ),
              e.gotoPage(1))
          }
        }
      }
    },
    fitheight: function () {
      if (this.I != this.ia()) {
        try {
          if (eb.platform.touchdevice) {
            if ((c = this.yf())) {
              ;(window.FitHeightScale = c),
                this.sb(c, { Pg: !0 }),
                this.pages.uk()
            }
          } else {
            var c = this.yf()
            window.FitHeightScale = c
            jQuery(this.M).trigger(
              'onScaleChanged',
              c / this.document.MaxZoomSize
            )
            c * this.document.MaxZoomSize >= this.document.MinZoomSize &&
              c <= this.document.MaxZoomSize &&
              ('Portrait' == this.I
                ? this.sb(this.document.MaxZoomSize * c, { Pg: !0 })
                : this.sb(this.document.MaxZoomSize * c))
          }
        } catch (d) {}
      }
    },
    Rh: function () {
      var c = jQuery(this.pages.L).width() - 15,
        d = 1 < this.getTotalPages() ? this.ma - 1 : 0
      0 > d && (d = 0)
      this.DisplayRange && (d = this.DisplayRange[0] - 1)
      var e =
        this.pages.getPage(d).dimensions.xa /
        this.pages.getPage(d).dimensions.Ga
      return eb.platform.touchdevice
        ? c / (this.pages.getPage(d).Ha * e) -
            ('SinglePage' == this.I ? 0.1 : 0.03)
        : c / (this.pages.getPage(d).Ha * this.document.MaxZoomSize * e) - 0.012
    },
    yf: function () {
      this.ma - 1 && (this.ma = 1)
      if (
        'Portrait' == this.I ||
        'SinglePage' == this.I ||
        'TwoPage' == this.I ||
        'BookView' == this.I
      ) {
        var c =
          this.pages.getPage(this.ma - 1).dimensions.width /
          this.pages.getPage(this.ma - 1).dimensions.height
        if (eb.platform.touchdevice) {
          ;(d =
            jQuery(this.N).height() -
            ('TwoPage' == this.I || 'BookView' == this.I ? 40 : 0)),
            'SinglePage' == this.I && (d -= 25),
            (d /= this.pages.getPage(this.ma - 1).Ha),
            (e = this.pages.getPage(this.ma - 1)),
            (e = (e.dimensions.xa / e.dimensions.Ga) * e.Ha * d),
            ('TwoPage' == this.I || 'BookView' == this.I) &&
              2 * e > this.N.width() &&
              ((d = this.N.width() - 0),
              (d /= 4 * this.pages.getPage(this.ma - 1).Ha))
        } else {
          var d =
            jQuery(this.pages.L).height() -
            ('TwoPage' == this.I || 'BookView' == this.I ? 25 : 0)
          this.document.DisableOverflow &&
            (d = S(parseFloat(window.printHeight)))
          var d =
              d /
              (this.pages.getPage(this.ma - 1).Ha * this.document.MaxZoomSize),
            e = this.pages.getPage(this.ma - 1),
            e =
              (e.dimensions.xa / e.dimensions.Ga) *
              e.Ha *
              this.document.MaxZoomSize *
              d
          ;('TwoPage' == this.I || 'BookView' == this.I) &&
            2 * e > this.N.width() &&
            !this.document.DisableOverflow &&
            ((d =
              (jQuery(this.N).width() -
                ('TwoPage' == this.I || 'BookView' == this.I ? 40 : 0)) /
              1.48),
            (d =
              d /
              1.6 /
              (this.pages.getPage(this.ma - 1).Ha *
                this.document.MaxZoomSize *
                c)))
        }
        return (window.FitHeightScale = d)
      }
      if (this.I == this.ia()) {
        return (d = 1), (window.FitHeightScale = d)
      }
    },
    next: function () {
      var c = this
      ;(c.Ob && c.Ob.active) ||
        (c.Nj || c.I == c.ia()
          ? c.I == c.ia() && c.pages.next()
          : ((c.Nj = setTimeout(function () {
              window.clearTimeout(c.Nj)
              c.Nj = null
            }, 700)),
            c.pages.next()))
    },
    gotoPage: function (c, d) {
      var e = this
      ;(e.Ob && e.Ob.active) ||
        !e.pages ||
        (e.config.document.RTLMode && (c = e.renderer.ca.length - c + 1),
        'ThumbView' == e.I
          ? eb.platform.ios
            ? e.J
              ? e.J.Cr(c)
              : e.switchMode('Portrait', c)
            : e.switchMode('Portrait', c)
          : ('Portrait' == e.I && e.pages.scrollTo(c),
            'SinglePage' == e.I &&
              setTimeout(function () {
                e.pages.Xg(c, d)
              }, 300),
            ('TwoPage' != e.I && 'BookView' != e.I) ||
              setTimeout(function () {
                e.pages.Yg(c, d)
              }, 300),
            e.J && e.J.gotoPage(c, d)))
    },
    getLabel: function (c) {
      for (var d = this.labels.children(), e = 0; e < d.length; e++) {
        if (d[e].getAttribute('title') == c) {
          return { pageNumber: d[e].getAttribute('pageNumber') }
        }
      }
    },
    rotate: function () {
      var c = this.getCurrPage() - 1
      ;-1 == c && (c = 0)
      this.pages.rotate(c)
      window.annotations &&
        (jQuery('.flowpaper_pageword_' + this.aa).remove(),
        this.vc(),
        this.pages.Na())
    },
    getCurrPage: function () {
      return null != this.pages
        ? this.I != this.ia()
          ? this.pages.Z + 1
          : this.pages.Z
        : 1
    },
    getSessionId: function () {
      window.sessionId = window.sessionId
        ? window.sessionId
        : Q(Date.now().toString())
      return window.sessionId
    },
    Mq: function () {
      this.version = '3.6.1'
    },
    Lq: function () {
      this.build = '12-September-2022'
    },
    getTotalPages: function () {
      return this.pages.getTotalPages()
    },
    Fc: function (c) {
      var d = this
      d.I != d.ia() && ((this.ma = c), (this.pages.Z = this.ma - 1))
      c > d.getTotalPages() && ((c = c - 1), (this.pages.Z = c))
      ;('TwoPage' != this.I && 'BookView' != this.I) ||
        this.pages.Z != this.pages.getTotalPages() - 1 ||
        0 == this.pages.Z % 2 ||
        (this.pages.Z = this.pages.Z + 1)
      d.J && (0 == c && (c++, (this.ma = c)), d.J.Fc(c))
      d.Mc &&
        (jQuery('.flowpaper_mark_video_maximized').remove(),
        jQuery('.flowpaper_mark_video_maximized_closebutton').remove(),
        (d.Mc = null))
      var e = jQuery(
        '.flowpaper_mark_video_' + (c - 1) + '[data-autoplay="true"]'
      )
      if (e.length) {
        for (var f = 0; f < e.length; f++) {
          ;-1 < jQuery(e[f]).attr('id').indexOf('video') &&
            jQuery(e[f]).trigger('mouseup')
        }
      }
      0 <
        jQuery('.flowpaper_mark_video').find('.flowpaper-circle-audio-player')
          .length &&
        jQuery('.flowpaper_mark_video')
          .find('.flowpaper-circle-audio-player')
          .each(function () {
            try {
              var c = jQuery(this).closest('.flowpaper_page').attr('id'),
                e = parseInt(c.substr(14, c.lastIndexOf('_') - 14))
              ;(0 == e && 0 != d.pages.Z - 1) ||
              (!d.J.fa && 0 < e && e != d.pages.Z - 1 && e != d.pages.Z - 2) ||
              (d.J.fa && e != d.pages.Z - 1)
                ? 'true' !=
                    jQuery(this)
                      .parents('.flowpaper_mark_video')
                      .attr('data-keepplaying') &&
                  (jQuery(this)[0].ag.pause(),
                  jQuery(d.M)
                    .find('.flowpaper_bttnPlay')
                    .attr(
                      'src',
                      jQuery(d.M)
                        .find('.flowpaper_bttnPlay')
                        .attr('src')
                        .replace('Pause', 'Play')
                    ))
                : jQuery(this)[0].paused &&
                  0 == jQuery(this)[0].currentTime &&
                  'true' ==
                    jQuery(this)
                      .parents('.flowpaper_mark_video')
                      .attr('data-autoplay') &&
                  (jQuery(this)[0].ag.play(),
                  jQuery(d.M)
                    .find('.flowpaper_bttnPlay')
                    .attr(
                      'src',
                      jQuery(d.M)
                        .find('.flowpaper_bttnPlay')
                        .attr('src')
                        .replace('Play', 'Pause')
                    ))
            } catch (f) {}
          })
      0 < jQuery('.flowpaper_mark_video').find('iframe,video').length &&
        jQuery('.flowpaper_mark_video')
          .find('iframe,video')
          .each(function () {
            try {
              var c = jQuery(this).closest('.flowpaper_page').attr('id'),
                e = parseInt(c.substr(14, c.lastIndexOf('_') - 14))
              if (
                (0 == e && 0 != d.pages.Z - 1) ||
                (!d.J.fa &&
                  0 < e &&
                  e != d.pages.Z - 1 &&
                  e != d.pages.Z - 2) ||
                (d.J.fa && e != d.pages.Z - 1)
              ) {
                jQuery(this).parent().remove()
                var f = d.pages.pages[e]
                f.tg(f.Kj ? f.Kj : f.scale, f.qc())
              }
            } catch (g) {}
          })
      jQuery('.flowpaper_mark_video').each(function () {
        var c = jQuery(this).closest('.flowpaper_page').attr('id'),
          c = parseInt(c.substr(14, c.lastIndexOf('_') - 14))
        'true' != jQuery(this).data('maximizevideo') &&
          ('true' == jQuery(this).data('autoplay') ||
            1 == jQuery(this).data('autoplay') ||
            (eb.browser.chrome && 85 < parseInt(eb.browser.Zb) && d.Eb)) &&
          (1 < d.pages.Z && !d.J.fa
            ? (c + 1 != d.pages.Z && c + 2 != d.pages.Z) ||
              jQuery(this).trigger('mousedown')
            : c + 1 == d.pages.Z && jQuery(this).trigger('mousedown'))
      })
      this.toolbar.Ir(c)
      null != d.plugin &&
        ('TwoPage' == this.I
          ? (d.plugin.Jh(this.pages.Z + 1), d.plugin.Jh(this.pages.Z + 2))
          : 'BookView' == this.I
          ? (1 != c && d.plugin.Jh(this.pages.Z), d.plugin.Jh(this.pages.Z + 1))
          : d.plugin.Jh(this.ma))
    },
    addLink: function (c, d, e, f, h, l, k, m, p) {
      window[this.Oe].addLink = this.addLink
      c = parseInt(c)
      this.document.RTLMode && (c = this.getTotalPages() - c + 1)
      null == this.ba[c - 1] && (this.ba[c - 1] = [])
      var n = { type: 'link' }
      n.href = d
      n.Mp = e
      n.Np = f
      n.width = h
      n.height = l
      n.Vq = k
      n.Wq = m
      n.$p = p
      this.ba[c - 1][this.ba[c - 1].length] = n
    },
    addVideo: function (c, d, e, f, h, l, k, m, p) {
      window[this.Oe].addVideo = this.addVideo
      c = parseInt(c)
      this.document.RTLMode && (c = this.getTotalPages() - c + 1)
      null == this.ba[c - 1] && (this.ba[c - 1] = [])
      var n = { type: 'video' }
      n.src = d
      n.url = e
      n.ni = f
      n.oi = h
      n.width = l
      n.height = k
      n.Yp = m
      n.autoplay = 'true' == p + ''
      this.config.document.URLAlias &&
        n.src &&
        -1 == n.src.indexOf('base64') &&
        (n.src = this.config.document.URLAlias + n.src)
      this.ba[c - 1][this.ba[c - 1].length] = n
    },
    jo: function (c, d, e, f, h, l, k, m, p, n, t, q) {
      window[this.Oe].addaudio = this.vs
      c = parseInt(c)
      this.document.RTLMode && (c = this.getTotalPages() - c + 1)
      null == this.ba[c - 1] && (this.ba[c - 1] = [])
      var r = { type: 'audio' }
      r.src = d
      r.url = e
      r.ro = r.ni = f
      r.so = r.oi = h
      r.width = l
      r.height = k
      r.autoplay = 'true' == m + ''
      r.Ct = 'true' == p
      r.zp = 'true' == n
      r.$g = 'true' == t
      r.Jp = 'true' == q
      this.config.document.URLAlias &&
        (r.src &&
          -1 == r.src.indexOf('base64') &&
          (r.src = this.config.document.URLAlias + r.src),
        r.url && (r.url = this.config.document.URLAlias + r.url))
      this.ba[c - 1][this.ba[c - 1].length] = r
    },
    Tk: function (c, d, e, f, h, l, k, m) {
      window[this.Oe].addIFrame = this.Tk
      c = parseInt(c)
      this.document.RTLMode && (c = this.getTotalPages() - c + 1)
      null == this.ba[c - 1] && (this.ba[c - 1] = [])
      var p = { type: 'iframe' }
      p.src = d
      p.url = e
      p.nj = f
      p.oj = h
      p.width = l
      p.height = k
      p.Xp = m
      this.config.document.URLAlias &&
        p.src &&
        -1 == p.src.indexOf('base64') &&
        (p.src = this.config.document.URLAlias + p.src)
      this.ba[c - 1][this.ba[c - 1].length] = p
    },
    addImage: function (c, d, e, f, h, l, k, m, p, n) {
      c = parseInt(c)
      this.document.RTLMode && (c = this.getTotalPages() - c + 1)
      null == this.ba[c - 1] && (this.ba[c - 1] = [])
      var t = { type: 'image' }
      t.src = d
      t.Cf = e
      t.Df = f
      t.width = h
      t.height = l
      t.href = k
      t.Zg = m
      t.ih = p
      t.rk = n
      this.config.document.URLAlias &&
        (t.src &&
          -1 == t.src.indexOf('base64') &&
          (t.src = this.config.document.URLAlias + t.src),
        t.Zg &&
          -1 == t.Zg.indexOf('base64') &&
          (t.Zg = this.config.document.URLAlias + t.Zg),
        t.ih &&
          -1 == t.ih.indexOf('base64') &&
          (t.ih = this.config.document.URLAlias + t.ih))
      t.rk && 'true' == t.rk && ((t.width = 35), (t.height = 35))
      this.ba[c - 1][this.ba[c - 1].length] = t
    },
    mo: function (c, d, e, f, h, l) {
      c = parseInt(c)
      this.document.RTLMode && (c = this.getTotalPages() - c + 1)
      null == this.ba[c - 1] && (this.ba[c - 1] = [])
      var k = { type: 'slideshow' }
      k.Cf = d
      k.Df = e
      k.width = f
      k.height = h
      k.images = []
      k.src = this.document.FilesBlobURI
        ? this.document.FilesBlobURI(l[0].getAttribute('src'))
        : l[0].getAttribute('src')
      for (d = 0; d < l.length; d++) {
        ;(e = {
          src: this.document.FilesBlobURI
            ? this.document.FilesBlobURI(l[d].getAttribute('src'))
            : l[d].getAttribute('src'),
          width: l[d].getAttribute('width'),
          height: l[d].getAttribute('height'),
        }),
          k.images.push(e)
      }
      this.ba[c - 1][this.ba[c - 1].length] = k
    },
    fq: function () {
      jQuery('.flowpaper_viewer_container').unbind('mousedown.flowpaper')
      $FlowPaper('documentViewer').openFullScreen()
    },
    openFullScreen: function () {
      var c = this
      FLOWPAPER.getParameterByName('autoplay')
      c.N.find('.flowpaper-leadform').length &&
        c.N.find('.flowpaper-leadform').css('display', 'block')
      if (c.Eb) {
        c.T.prepend(
          "<div id='modal-maximize' class='modal-content flowpaper_printdialog' style='overflow:hidden;;'><div style='background-color:#fff;color:#000;padding:10px 10px 10px 10px;height:155px;padding-bottom:20px;'>It's not possible to maximize the viewer from within the Desktop Publisher. <br/><br/>You can try this feature by clicking on 'Publish' and then 'View in Browser'.<br/><br/><a class='flowpaper_printdialog_button' id='bttnMaximizeDisabledOK'>OK</a></div></div>"
        ),
          (c.tt = jQuery('#modal-maximize').smodal({
            minHeight: 155,
            appendTo: c.T,
          })),
          jQuery('#bttnMaximizeDisabledOK').bind('click', function (c) {
            jQuery.smodal.close()
            c.stopImmediatePropagation()
            jQuery('#modal-maximize').remove()
            return !1
          })
      } else {
        var d =
            document.Sb ||
            document.mozFullScreen ||
            document.webkitIsFullScreen ||
            window.Ln ||
            window.Kk ||
            document.fullscreenElement ||
            document.msFullscreenElement,
          e = c.T.get(0)
        if (d) {
          return (
            document.exitFullscreen
              ? document.exitFullscreen()
              : document.mozCancelFullScreen
              ? document.mozCancelFullScreen()
              : document.webkitExitFullscreen
              ? document.webkitExitFullscreen()
              : document.msExitFullscreen && document.msExitFullscreen(),
            window.Kk && window.close(),
            jQuery(document.body).toggleClass('flowpaper_fullscreen', !1),
            !1
          )
        }
        jQuery(document.body).toggleClass('flowpaper_fullscreen', !0)
        '0' != c.T.css('top') && (c.jq = c.T.css('top'))
        '0' != c.T.css('left') && (c.iq = c.T.css('left'))
        c.I == c.ia() &&
          1 < c.scale &&
          (c.pages.Id(), c.ea.show(), c.ea.animate({ opacity: 1 }, 100))
        c.xa = c.T.width()
        c.Ga = c.T.height()
        c.PreviewMode &&
          c.pages.tm &&
          ((c.PreviewMode = !1), (c.xi = !0), c.J.vb.yq(c.pages, c.N), c.J.Yq())
        c.T.css({ visibility: 'hidden' })
        jQuery(document).bind(
          'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange',
          function () {
            setTimeout(function () {
              if (
                window.navigator.standalone ||
                (document.fullScreenElement &&
                  null != document.fullScreenElement) ||
                document.mozFullScreen ||
                document.webkitIsFullScreen
              ) {
                eb.browser.safari
                  ? window.zine
                    ? ((eb.platform.touchonlydevice &&
                        window.innerHeight > window.innerWidth) ||
                      'Flip-SinglePage' == c.document.InitViewMode
                        ? ((c.J.fa = !0),
                          (c.I = ''),
                          c.switchMode(c.ia(), c.getCurrPage() - 1))
                        : c.J.fa &&
                          'Flip-SinglePage' != c.document.InitViewMode &&
                          ((c.J.fa = !1),
                          (c.I = ''),
                          c.switchMode(c.ia(), c.getCurrPage() - 1)),
                      c.resize(screen.width, screen.height))
                    : c.config.BottomToolbar
                    ? c.resize(
                        screen.width,
                        screen.height - jQuery(c.M).height() - 70
                      )
                    : c.resize(
                        screen.width,
                        screen.height - jQuery(c.M).height()
                      )
                  : window.zine
                  ? ((eb.platform.touchonlydevice &&
                      window.innerHeight > window.innerWidth) ||
                    'Flip-SinglePage' == c.document.InitViewMode
                      ? ((c.J.fa = !0),
                        (c.I = ''),
                        c.switchMode(c.ia(), c.getCurrPage() - 1))
                      : c.J.fa &&
                        'Flip-SinglePage' != c.document.InitViewMode &&
                        ((c.J.fa = !1),
                        (c.I = ''),
                        c.switchMode(c.ia(), c.getCurrPage() - 1)),
                    c.resize(
                      jQuery(document).width(),
                      jQuery(document).height()
                    ))
                  : c.resize(window.innerWidth, window.innerHeight)
              }
              window.annotations &&
                (jQuery('.flowpaper_pageword_' + c.aa).remove(),
                c.vc(),
                c.pages.Na())
              c.T.css({ visibility: 'visible' })
            }, 500)
            jQuery(document).bind(
              'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange',
              function () {
                jQuery(document.body).toggleClass('flowpaper_fullscreen', !1)
                jQuery(document).unbind(
                  'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange'
                )
                c.Cj = !1
                c.T.css({ top: c.jq, left: c.iq })
                c.xi &&
                  ((c.PreviewMode = !0),
                  c.J.Vl(),
                  c.J.Th(),
                  setTimeout(function () {
                    c.PreviewMode && c.J.Th()
                  }, 1000))
                0.7 > c.N.width() / c.N.height() &&
                  ((c.J.fa = !0),
                  (c.I = ''),
                  c.switchMode(c.ia(), c.getCurrPage() - 1))
                c.I == c.ia() && 1 < c.scale
                  ? c.pages.Id(function () {
                      c.ea.show()
                      c.ea.animate({ opacity: 1 }, 100)
                      c.resize(c.xa, c.Ga - 2)
                      jQuery(c.M).trigger('onFullscreenChanged', !1)
                    })
                  : (c.resize(c.xa, c.Ga - 2),
                    jQuery(c.M).trigger('onFullscreenChanged', !1))
                jQuery(document).unbind(
                  'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange'
                )
                c.xi && ((c.xi = !1), c.J.vb.Di(c.pages, c.N))
                window.annotations &&
                  (jQuery('.flowpaper_pageword_' + c.aa).remove(),
                  c.vc(),
                  c.pages.Na())
              }
            )
            window.clearTimeout(c.gk)
            c.gk = setTimeout(function () {
              !c.PreviewMode && c.J && c.J.qb && c.J.nk()
            }, 1000)
          }
        )
        d =
          (eb.platform.android && !e.webkitRequestFullScreen) ||
          (eb.platform.ios && !e.webkitRequestFullScreen)
        c.document.FullScreenAsMaxWindow ||
        !document.documentElement.requestFullScreen ||
        d
          ? c.document.FullScreenAsMaxWindow ||
            !document.documentElement.mozRequestFullScreen ||
            d
            ? c.document.FullScreenAsMaxWindow ||
              !document.documentElement.webkitRequestFullScreen ||
              d
              ? !c.document.FullScreenAsMaxWindow &&
                document.documentElement.msRequestFullscreen
                ? (c.T.css({ visibility: 'hidden' }),
                  c.Cj
                    ? ((c.Cj = !1), window.document.msExitFullscreen())
                    : ((c.Cj = !0), e.msRequestFullscreen()),
                  setTimeout(function () {
                    c.T.css({ visibility: 'visible' })
                    c.resize(window.outerWidth, window.outerHeight)
                    window.annotations &&
                      (jQuery('.flowpaper_pageword_' + c.aa).remove(),
                      c.vc(),
                      c.pages.Na())
                  }, 500))
                : (c.gq(),
                  setTimeout(function () {
                    c.T.css({ visibility: 'visible' })
                  }, 500))
              : (c.T.css({ visibility: 'hidden' }),
                e.webkitRequestFullScreen(
                  eb.browser.safari && 10 > eb.browser.Zb ? 0 : {}
                ),
                c.T.css({ left: '0px', top: '0px' }))
            : (c.T.css({ visibility: 'hidden' }),
              e.mozRequestFullScreen(),
              c.T.css({ left: '0px', top: '0px' }))
          : (c.T.css({ visibility: 'hidden' }),
            e.requestFullScreen(),
            c.T.css({ left: '0px', top: '0px' }))
        jQuery(c.M).trigger('onFullscreenChanged', !0)
      }
    },
    gq: function () {
      var c = '',
        c = 'toolbar=no, location=no, scrollbars=no, width=' + screen.width,
        c = c + (', height=' + screen.height),
        c = c + ', top=0, left=0, fullscreen=yes'
      nw = window.open(
        location.protocol +
          '//' +
          location.host +
          location.pathname +
          '#MaximizeViewer=true',
        'windowname4',
        c
      )
      return !1
    },
    resize: function (c, d, e, f) {
      var h = this
      if (h.initialized) {
        h.width = null
        if (h.I == h.ia()) {
          h.J.resize(c, d, e, f)
        } else {
          h.Xa &&
            ((c = c - h.Xa.width() / 2),
            h.N.animate({ left: h.Xa.width() / 2 + 'px' }, 0))
          var l = jQuery(h.M).height() + 1 + 14,
            k = 0 < h.Ng ? h.Ng + 1 : 0
          h.J && (k = 37)
          h.N.css({ width: c, height: d - l - k })
          ;(null != e && 1 != e) || this.T.css({ width: c, height: d })
          h.pages.resize(c, d - l - k, f)
          jQuery(
            '.flowpaper_interactiveobject_' +
              h.aa +
              ':not(.flowpaper_selected_searchmatch)'
          ).remove()
          jQuery('.flowpaper_pageword_' + h.aa).remove()
          ;('TwoPage' != h.I && 'BookView' != h.I) || h.fitheight()
          window.clearTimeout(h.nq)
          h.nq = setTimeout(function () {
            h.pages.Na()
          }, 700)
        }
        h.J &&
          h.J.qb &&
          (window.clearTimeout(h.gk),
          (h.gk = setTimeout(function () {
            h.PreviewMode || h.J.nk()
          }, 2500)))
      }
    },
  }
  f.loadFromUrl = f.loadFromUrl
  return f
})())
window.print_flowpaper_Document = function (f, c, d, e, g) {
  FLOWPAPER.Ql.init()
  var h = Array(g + 1),
    l = 0
  if ('all' == d) {
    for (var k = 1; k < g + 1; k++) {
      h[k] = !0
    }
    l = g
  } else {
    if ('current' == d) {
      ;(h[e] = !0), (l = 1)
    } else {
      if (-1 == d.indexOf(',') && -1 < d.indexOf('-')) {
        for (
          var m = parseInt(d.substr(0, d.toString().indexOf('-'))),
            p = parseInt(d.substr(d.toString().indexOf('-') + 1));
          m < p + 1;
          m++
        ) {
          ;(h[m] = !0), l++
        }
      } else {
        if (0 < d.indexOf(',')) {
          for (var n = d.split(','), k = 0; k < n.length; k++) {
            if (-1 < n[k].indexOf('-')) {
              for (
                m = parseInt(n[k].substr(0, n[k].toString().indexOf('-'))),
                  p = parseInt(n[k].substr(n[k].toString().indexOf('-') + 1));
                m < p + 1;
                m++
              ) {
                ;(h[m] = !0), l++
              }
            } else {
              ;(h[parseInt(n[k].toString())] = !0), l++
            }
          }
        } else {
          isNaN(d) || ((h[parseInt(d)] = !0), (l = 1))
        }
      }
    }
  }
  jQuery(document.body).append(
    "<div id='documentViewer' style='position:absolute;width:100%;height:100%'></div>"
  )
  h = '1-' + g
  window.ti = 0
  'current' == d ? (h = e + '-' + e) : 'all' == d ? (h = '1-' + g) : (h = d)
  jQuery('#documentViewer').FlowPaperViewer({
    config: {
      IMGFiles: c.pageImagePattern,
      JSONFile: c.jsonfile && 'undefined' != c.jsonfile ? c.jsonfile : null,
      PDFFile: c.PdfFile,
      JSONDataType: c.JSONDataType,
      Scale: 1,
      RenderingOrder: 'ImagePageRenderer' == f ? 'html,html' : 'html5,html',
      key: c.key,
      UserCollaboration: c.UserCollaboration,
      InitViewMode: 'Portrait',
      DisableOverflow: !0,
      DisplayRange: h,
    },
  })
  jQuery('#documentViewer').bind('onPageLoaded', function () {
    window.ti == l - 1 &&
      setTimeout(function () {
        if (window.parent.onPrintRenderingCompleted) {
          window.parent.onPrintRenderingCompleted()
        }
        window.focus && window.focus()
        window.print()
        window.close && window.close()
      }, 2000)
    window.ti++
    if (window.parent.onPrintRenderingProgress) {
      window.parent.onPrintRenderingProgress(window.ti)
    }
  })
}
window.renderPrintPage = function Z(c, d) {
  'CanvasPageRenderer' == c.Af() &&
    (d < c.getNumPages()
      ? c.Ba
        ? document.getElementById('ppage_' + d)
          ? c.Ij(d + 1, function () {
              if (parent.onPrintRenderingProgress) {
                parent.onPrintRenderingProgress(d + 1)
              }
              document.getElementById('ppage_' + d)
                ? c.Ja[d].getPage(1).then(function (e) {
                    var g = document.getElementById('ppage_' + d)
                    if (g) {
                      var h = g.getContext('2d'),
                        l = e.getViewport(4),
                        h = {
                          canvasContext: h,
                          viewport: l,
                          ki: null,
                          Vi: function (c) {
                            c()
                          },
                        }
                      g.width = l.width
                      g.height = l.height
                      e.render(h).promise.then(
                        function () {
                          e.destroy()
                          Z(c, d + 1)
                        },
                        function (c) {
                          console.log(c)
                        }
                      )
                    } else {
                      Z(c, d + 1)
                    }
                  })
                : Z(c, d + 1)
            })
          : Z(c, d + 1)
        : document.getElementById('ppage_' + d)
        ? c.Ja.getPage(d + 1).then(function (e) {
            if (parent.onPrintRenderingProgress) {
              parent.onPrintRenderingProgress(d + 1)
            }
            var g = document.getElementById('ppage_' + d)
            if (g) {
              var h = g.getContext('2d'),
                l = e.getViewport(4),
                h = {
                  canvasContext: h,
                  viewport: l,
                  ki: null,
                  Vi: function (c) {
                    c()
                  },
                }
              g.width = l.width
              g.height = l.height
              e.render(h).promise.then(
                function () {
                  Z(c, d + 1)
                  e.destroy()
                },
                function (c) {
                  console.log(c)
                }
              )
            } else {
              Z(c, d + 1)
            }
          })
        : Z(c, d + 1)
      : (parent.onPrintRenderingCompleted(), window.print()))
}
Ra &&
  self.addEventListener(
    'message',
    function (f) {
      f = f.data
      if ('undefined' !== f.cmd) {
        switch (f.cmd) {
          case 'loadImageResource':
            var c = new XMLHttpRequest()
            c.open('GET', '../../' + f.src)
            c.Sb = c.responseType = 'arraybuffer'
            c.onreadystatechange = function () {
              if (4 == c.readyState && 200 == c.status) {
                for (
                  var d = new Uint8Array(this.response),
                    e = d.length,
                    f = Array(e);
                  e--;

                ) {
                  f[e] = String.fromCharCode(d[e])
                }
                self.postMessage({
                  status: 'ImageResourceLoaded',
                  blob: f.join(''),
                })
                self.close()
              }
            }
            c.send(null)
        }
      }
    },
    !1
  )

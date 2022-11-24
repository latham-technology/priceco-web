;(function (e) {
  if (e.fn.inputmask === undefined) {
    function t(e) {
      var t = document.createElement('input'),
        e = 'on' + e,
        n = e in t
      if (!n) {
        t.setAttribute(e, 'return;')
        n = typeof t[e] == 'function'
      }
      t = null
      return n
    }
    function n(t, r, i) {
      var s = i.aliases[t]
      if (s) {
        if (s.alias) n(s.alias, undefined, i)
        e.extend(true, i, s)
        e.extend(true, i, r)
        return true
      }
      return false
    }
    function r(t) {
      function i(n) {
        if (t.numericInput) {
          n = n.split('').reverse().join('')
        }
        var r = false,
          i = 0,
          s = t.greedy,
          o = t.repeat
        if (o == '*') s = false
        if (n.length == 1 && s == false && o != 0) {
          t.placeholder = ''
        }
        var u = e.map(n.split(''), function (e, n) {
          var s = []
          if (e == t.escapeChar) {
            r = true
          } else if (
            (e != t.optionalmarker.start && e != t.optionalmarker.end) ||
            r
          ) {
            var o = t.definitions[e]
            if (o && !r) {
              for (var u = 0; u < o.cardinality; u++) {
                s.push(t.placeholder.charAt((i + u) % t.placeholder.length))
              }
            } else {
              s.push(e)
              r = false
            }
            i += s.length
            return s
          }
        })
        var a = u.slice()
        for (var f = 1; f < o && s; f++) {
          a = a.concat(u.slice())
        }
        return { mask: a, repeat: o, greedy: s }
      }
      function s(n) {
        if (t.numericInput) {
          n = n.split('').reverse().join('')
        }
        var r = false,
          i = false
        var s = false
        return e.map(n.split(''), function (e, n) {
          var o = []
          if (e == t.escapeChar) {
            i = true
          } else if (e == t.optionalmarker.start && !i) {
            r = true
            s = true
          } else if (e == t.optionalmarker.end && !i) {
            r = false
            s = true
          } else {
            var u = t.definitions[e]
            if (u && !i) {
              var a = u['prevalidator'],
                f = a ? a.length : 0
              for (var l = 1; l < u.cardinality; l++) {
                var c = f >= l ? a[l - 1] : [],
                  h = c['validator'],
                  p = c['cardinality']
                o.push({
                  fn: h
                    ? typeof h == 'string'
                      ? new RegExp(h)
                      : new (function () {
                          this.test = h
                        })()
                    : new RegExp('.'),
                  cardinality: p ? p : 1,
                  optionality: r,
                  newBlockMarker: r == true ? s : false,
                  offset: 0,
                  casing: u['casing'],
                  def: u['definitionSymbol'] || e,
                })
                if (r == true) s = false
              }
              o.push({
                fn: u.validator
                  ? typeof u.validator == 'string'
                    ? new RegExp(u.validator)
                    : new (function () {
                        this.test = u.validator
                      })()
                  : new RegExp('.'),
                cardinality: u.cardinality,
                optionality: r,
                newBlockMarker: s,
                offset: 0,
                casing: u['casing'],
                def: u['definitionSymbol'] || e,
              })
            } else {
              o.push({
                fn: null,
                cardinality: 0,
                optionality: r,
                newBlockMarker: s,
                offset: 0,
                casing: null,
                def: e,
              })
              i = false
            }
            s = false
            return o
          }
        })
      }
      function o(e) {
        return t.optionalmarker.start + e + t.optionalmarker.end
      }
      function u(e) {
        var n = 0,
          r = 0,
          i = e.length
        for (var s = 0; s < i; s++) {
          if (e.charAt(s) == t.optionalmarker.start) {
            n++
          }
          if (e.charAt(s) == t.optionalmarker.end) {
            r++
          }
          if (n > 0 && n == r) break
        }
        var o = [e.substring(0, s)]
        if (s < i) {
          o.push(e.substring(s + 1, i))
        }
        return o
      }
      function a(e) {
        var n = e.length
        for (var r = 0; r < n; r++) {
          if (e.charAt(r) == t.optionalmarker.start) {
            break
          }
        }
        var i = [e.substring(0, r)]
        if (r < n) {
          i.push(e.substring(r + 1, n))
        }
        return i
      }
      function f(t, l, c) {
        var h = u(l)
        var p, d
        var v = a(h[0])
        if (v.length > 1) {
          p = t + v[0] + o(v[1]) + (h.length > 1 ? h[1] : '')
          if (e.inArray(p, r) == -1 && p != '') {
            r.push(p)
            d = i(p)
            n.push({
              mask: p,
              _buffer: d['mask'],
              buffer: d['mask'].slice(),
              tests: s(p),
              lastValidPosition: -1,
              greedy: d['greedy'],
              repeat: d['repeat'],
              metadata: c,
            })
          }
          p = t + v[0] + (h.length > 1 ? h[1] : '')
          if (e.inArray(p, r) == -1 && p != '') {
            r.push(p)
            d = i(p)
            n.push({
              mask: p,
              _buffer: d['mask'],
              buffer: d['mask'].slice(),
              tests: s(p),
              lastValidPosition: -1,
              greedy: d['greedy'],
              repeat: d['repeat'],
              metadata: c,
            })
          }
          if (a(v[1]).length > 1) {
            f(t + v[0], v[1] + h[1], c)
          }
          if (h.length > 1 && a(h[1]).length > 1) {
            f(t + v[0] + o(v[1]), h[1], c)
            f(t + v[0], h[1], c)
          }
        } else {
          p = t + h
          if (e.inArray(p, r) == -1 && p != '') {
            r.push(p)
            d = i(p)
            n.push({
              mask: p,
              _buffer: d['mask'],
              buffer: d['mask'].slice(),
              tests: s(p),
              lastValidPosition: -1,
              greedy: d['greedy'],
              repeat: d['repeat'],
              metadata: c,
            })
          }
        }
      }
      var n = []
      var r = []
      if (e.isFunction(t.mask)) {
        t.mask = t.mask.call(this, t)
      }
      if (e.isArray(t.mask)) {
        e.each(t.mask, function (e, t) {
          if (t['mask'] != undefined) {
            f('', t['mask'].toString(), t)
          } else f('', t.toString())
        })
      } else f('', t.mask.toString())
      return t.greedy
        ? n
        : n.sort(function (e, t) {
            return e['mask'].length - t['mask'].length
          })
    }
    var i =
        typeof ScriptEngineMajorVersion === 'function'
          ? ScriptEngineMajorVersion()
          : new Function('/*@cc_on return @_jscript_version; @*/')() >= 10,
      s = navigator.userAgent,
      o = s.match(new RegExp('iphone', 'i')) !== null,
      u = s.match(new RegExp('android.*safari.*', 'i')) !== null,
      a = s.match(new RegExp('android.*chrome.*', 'i')) !== null,
      f = s.match(new RegExp('android.*firefox.*', 'i')) !== null,
      l =
        /Kindle/i.test(s) ||
        /Silk/i.test(s) ||
        /KFTT/i.test(s) ||
        /KFOT/i.test(s) ||
        /KFJWA/i.test(s) ||
        /KFJWI/i.test(s) ||
        /KFSOWI/i.test(s) ||
        /KFTHWA/i.test(s) ||
        /KFTHWI/i.test(s) ||
        /KFAPWA/i.test(s) ||
        /KFAPWI/i.test(s),
      c = t('paste') ? 'paste' : t('input') ? 'input' : 'propertychange'
    function h(t, n, r, s) {
      function y() {
        return t[n]
      }
      function b() {
        return y()['tests']
      }
      function w() {
        return y()['_buffer']
      }
      function E() {
        return y()['buffer']
      }
      function S(i, s, o) {
        function u(e, t, n, i) {
          var s = N(e),
            o = n ? 1 : 0,
            u = '',
            a = t['buffer']
          for (var f = t['tests'][s].cardinality; f > o; f--) {
            u += O(a, s - (f - 1))
          }
          if (n) {
            u += n
          }
          return t['tests'][s].fn != null
            ? t['tests'][s].fn.test(u, a, e, i, r)
            : n == O(t['_buffer'].slice(), e, true) ||
              n == r.skipOptionalPartCharacter
            ? { refresh: true, c: O(t['_buffer'].slice(), e, true), pos: e }
            : false
        }
        function a(n, r) {
          var o = false
          e.each(r, function (t, r) {
            o =
              e.inArray(r['activeMasksetIndex'], n) == -1 &&
              r['result'] !== false
            if (o) return false
          })
          if (o) {
            r = e.map(r, function (r, i) {
              if (e.inArray(r['activeMasksetIndex'], n) == -1) {
                return r
              } else {
                t[r['activeMasksetIndex']]['lastValidPosition'] = p
              }
            })
          } else {
            var a = -1,
              f = -1,
              l
            e.each(r, function (t, r) {
              if (
                e.inArray(r['activeMasksetIndex'], n) != -1 &&
                (r['result'] !== false) & (a == -1 || a > r['result']['pos'])
              ) {
                a = r['result']['pos']
                f = r['activeMasksetIndex']
              }
            })
            r = e.map(r, function (r, o) {
              if (e.inArray(r['activeMasksetIndex'], n) != -1) {
                if (r['result']['pos'] == a) {
                  return r
                } else if (r['result'] !== false) {
                  for (var c = i; c < a; c++) {
                    l = u(
                      c,
                      t[r['activeMasksetIndex']],
                      t[f]['buffer'][c],
                      true
                    )
                    if (l === false) {
                      t[r['activeMasksetIndex']]['lastValidPosition'] = a - 1
                      break
                    } else {
                      A(
                        t[r['activeMasksetIndex']]['buffer'],
                        c,
                        t[f]['buffer'][c],
                        true
                      )
                      t[r['activeMasksetIndex']]['lastValidPosition'] = c
                    }
                  }
                  l = u(a, t[r['activeMasksetIndex']], s, true)
                  if (l !== false) {
                    A(t[r['activeMasksetIndex']]['buffer'], a, s, true)
                    t[r['activeMasksetIndex']]['lastValidPosition'] = a
                  }
                  return r
                }
              }
            })
          }
          return r
        }
        o = o === true
        if (o) {
          var f = u(i, y(), s, o)
          if (f === true) {
            f = { pos: i }
          }
          return f
        }
        var l = [],
          f = false,
          c = n,
          h = E().slice(),
          p = y()['lastValidPosition'],
          d = L(i),
          v = []
        e.each(t, function (e, t) {
          if (typeof t == 'object') {
            n = e
            var r = i
            var a = y()['lastValidPosition'],
              d
            if (a == p) {
              if (r - p > 1) {
                for (var m = a == -1 ? 0 : a; m < r; m++) {
                  d = u(m, y(), h[m], true)
                  if (d === false) {
                    break
                  } else {
                    A(E(), m, h[m], true)
                    if (d === true) {
                      d = { pos: m }
                    }
                    var g = d.pos || m
                    if (y()['lastValidPosition'] < g)
                      y()['lastValidPosition'] = g
                  }
                }
              }
              if (!T(r) && !u(r, y(), s, o)) {
                var b = k(r) - r
                for (var w = 0; w < b; w++) {
                  if (u(++r, y(), s, o) !== false) break
                }
                v.push(n)
              }
            }
            if (y()['lastValidPosition'] >= p || n == c) {
              if (r >= 0 && r < C()) {
                f = u(r, y(), s, o)
                if (f !== false) {
                  if (f === true) {
                    f = { pos: r }
                  }
                  var g = f.pos || r
                  if (y()['lastValidPosition'] < g) y()['lastValidPosition'] = g
                }
                l.push({ activeMasksetIndex: e, result: f })
              }
            }
          }
        })
        n = c
        return a(v, l)
      }
      function x() {
        var r = n,
          i = { activeMasksetIndex: 0, lastValidPosition: -1, next: -1 }
        e.each(t, function (e, t) {
          if (typeof t == 'object') {
            n = e
            if (y()['lastValidPosition'] > i['lastValidPosition']) {
              i['activeMasksetIndex'] = e
              i['lastValidPosition'] = y()['lastValidPosition']
              i['next'] = k(y()['lastValidPosition'])
            } else if (
              y()['lastValidPosition'] == i['lastValidPosition'] &&
              (i['next'] == -1 || i['next'] > k(y()['lastValidPosition']))
            ) {
              i['activeMasksetIndex'] = e
              i['lastValidPosition'] = y()['lastValidPosition']
              i['next'] = k(y()['lastValidPosition'])
            }
          }
        })
        n =
          i['lastValidPosition'] != -1 &&
          t[r]['lastValidPosition'] == i['lastValidPosition']
            ? r
            : i['activeMasksetIndex']
        if (r != n) {
          D(E(), k(i['lastValidPosition']), C())
          y()['writeOutBuffer'] = true
        }
        d.data('_inputmask')['activeMasksetIndex'] = n
      }
      function T(e) {
        var t = N(e)
        var n = b()[t]
        return n != undefined ? n.fn : false
      }
      function N(e) {
        return e % b().length
      }
      function C() {
        var t = w(),
          n = y()['greedy'],
          i = y()['repeat'],
          s = E()
        if (e.isFunction(r.getMaskLength)) return r.getMaskLength(t, n, i, s, r)
        var o = t.length
        if (!n) {
          if (i == '*') {
            o = s.length + 1
          } else if (i > 1) {
            o += t.length * (i - 1)
          }
        }
        return o
      }
      function k(e) {
        var t = C()
        if (e >= t) return t
        var n = e
        while (++n < t && !T(n)) {}
        return n
      }
      function L(e) {
        var t = e
        if (t <= 0) return 0
        while (--t > 0 && !T(t)) {}
        return t
      }
      function A(e, t, n, r) {
        if (r) t = M(e, t)
        var i = b()[N(t)]
        var s = n
        if (s != undefined && i != undefined) {
          switch (i.casing) {
            case 'upper':
              s = n.toUpperCase()
              break
            case 'lower':
              s = n.toLowerCase()
              break
          }
        }
        e[t] = s
      }
      function O(e, t, n) {
        if (n) t = M(e, t)
        return e[t]
      }
      function M(e, t) {
        var n
        while (e[t] == undefined && e.length < C()) {
          n = 0
          while (w()[n] !== undefined) {
            e.push(w()[n++])
          }
        }
        return t
      }
      function _(e, t, n) {
        e._valueSet(t.join(''))
        if (n != undefined) {
          U(e, n)
        }
      }
      function D(e, t, n, r) {
        for (var i = t, s = C(); i < n && i < s; i++) {
          if (r === true) {
            if (!T(i)) A(e, i, '')
          } else A(e, i, O(w().slice(), i, true))
        }
      }
      function P(e, t) {
        var n = N(t)
        A(e, t, O(w(), n))
      }
      function H(e) {
        return r.placeholder.charAt(e % r.placeholder.length)
      }
      function B(r, i, s, o, u) {
        var a = o != undefined ? o.slice() : F(r._valueGet()).split('')
        e.each(t, function (e, t) {
          if (typeof t == 'object') {
            t['buffer'] = t['_buffer'].slice()
            t['lastValidPosition'] = -1
            t['p'] = -1
          }
        })
        if (s !== true) n = 0
        if (i) r._valueSet('')
        var f = C()
        e.each(a, function (t, n) {
          if (u === true) {
            var o = y()['p'],
              a = o == -1 ? o : L(o),
              f = a == -1 ? t : k(a)
            if (e.inArray(n, w().slice(a + 1, f)) == -1) {
              Y.call(r, undefined, true, n.charCodeAt(0), i, s, t)
            }
          } else {
            Y.call(r, undefined, true, n.charCodeAt(0), i, s, t)
            s = s || (t > 0 && t > y()['p'])
          }
        })
        if (s === true && y()['p'] != -1) {
          y()['lastValidPosition'] = L(y()['p'])
        }
      }
      function j(t) {
        return e.inputmask.escapeRegex.call(this, t)
      }
      function F(e) {
        return e.replace(new RegExp('(' + j(w().join('')) + ')*$'), '')
      }
      function I(e) {
        var t = E(),
          n = t.slice(),
          r,
          i
        for (var i = n.length - 1; i >= 0; i--) {
          var r = N(i)
          if (b()[r].optionality) {
            if (!T(i) || !S(i, t[i], true)) n.pop()
            else break
          } else break
        }
        _(e, n)
      }
      function q(t, n) {
        if (b() && (n === true || !t.hasClass('hasDatepicker'))) {
          var i = e.map(E(), function (e, t) {
            return T(t) && S(t, e, true) ? e : null
          })
          var s = (h ? i.reverse() : i).join('')
          return e.isFunction(r.onUnMask)
            ? r.onUnMask.call(t, E().join(''), s, r)
            : s
        } else {
          return t[0]._valueGet()
        }
      }
      function R(e) {
        if (h && typeof e == 'number' && (!r.greedy || r.placeholder != '')) {
          var t = E().length
          e = t - e
        }
        return e
      }
      function U(t, n, i) {
        var s = t.jquery && t.length > 0 ? t[0] : t,
          o
        if (typeof n == 'number') {
          n = R(n)
          i = R(i)
          if (!e(s).is(':visible')) {
            return
          }
          i = typeof i == 'number' ? i : n
          s.scrollLeft = s.scrollWidth
          if (r.insertMode == false && n == i) i++
          if (s.setSelectionRange) {
            s.selectionStart = n
            s.selectionEnd = i
          } else if (s.createTextRange) {
            o = s.createTextRange()
            o.collapse(true)
            o.moveEnd('character', i)
            o.moveStart('character', n)
            o.select()
          }
        } else {
          if (!e(t).is(':visible')) {
            return { begin: 0, end: 0 }
          }
          if (s.setSelectionRange) {
            n = s.selectionStart
            i = s.selectionEnd
          } else if (document.selection && document.selection.createRange) {
            o = document.selection.createRange()
            n = 0 - o.duplicate().moveStart('character', -1e5)
            i = n + o.text.length
          }
          n = R(n)
          i = R(i)
          return { begin: n, end: i }
        }
      }
      function z(i) {
        if (e.isFunction(r.isComplete)) return r.isComplete.call(d, i, r)
        if (r.repeat == '*') return undefined
        var s = false,
          o = 0,
          u = n
        e.each(t, function (e, t) {
          if (typeof t == 'object') {
            n = e
            var r = L(C())
            if (t['lastValidPosition'] >= o && t['lastValidPosition'] == r) {
              var u = true
              for (var a = 0; a <= r; a++) {
                var f = T(a),
                  l = N(a)
                if (
                  (f && (i[a] == undefined || i[a] == H(a))) ||
                  (!f && i[a] != w()[l])
                ) {
                  u = false
                  break
                }
              }
              s = s || u
              if (s) return false
            }
            o = t['lastValidPosition']
          }
        })
        n = u
        return s
      }
      function W(e, t) {
        return h
          ? e - t > 1 || (e - t == 1 && r.insertMode)
          : t - e > 1 || (t - e == 1 && r.insertMode)
      }
      function X(t) {
        var n = e._data(t).events
        e.each(n, function (t, n) {
          e.each(n, function (e, t) {
            if (t.namespace == 'inputmask') {
              if (t.type != 'setvalue') {
                var n = t.handler
                t.handler = function (e) {
                  if (this.readOnly || this.disabled) e.preventDefault
                  else return n.apply(this, arguments)
                }
              }
            }
          })
        })
      }
      function V(t) {
        function n(t) {
          if (
            e.valHooks[t] == undefined ||
            e.valHooks[t].inputmaskpatch != true
          ) {
            var n =
              e.valHooks[t] && e.valHooks[t].get
                ? e.valHooks[t].get
                : function (e) {
                    return e.value
                  }
            var r =
              e.valHooks[t] && e.valHooks[t].set
                ? e.valHooks[t].set
                : function (e, t) {
                    e.value = t
                    return e
                  }
            e.valHooks[t] = {
              get: function (t) {
                var r = e(t)
                if (r.data('_inputmask')) {
                  if (r.data('_inputmask')['opts'].autoUnmask)
                    return r.inputmask('unmaskedvalue')
                  else {
                    var i = n(t),
                      s = r.data('_inputmask'),
                      o = s['masksets'],
                      u = s['activeMasksetIndex']
                    return i != o[u]['_buffer'].join('') ? i : ''
                  }
                } else return n(t)
              },
              set: function (t, n) {
                var i = e(t)
                var s = r(t, n)
                if (i.data('_inputmask')) i.triggerHandler('setvalue.inputmask')
                return s
              },
              inputmaskpatch: true,
            }
          }
        }
        var r
        if (Object.getOwnPropertyDescriptor)
          r = Object.getOwnPropertyDescriptor(t, 'value')
        if (r && r.get) {
          if (!t._valueGet) {
            var i = r.get
            var s = r.set
            t._valueGet = function () {
              return h
                ? i.call(this).split('').reverse().join('')
                : i.call(this)
            }
            t._valueSet = function (e) {
              s.call(this, h ? e.split('').reverse().join('') : e)
            }
            Object.defineProperty(t, 'value', {
              get: function () {
                var t = e(this),
                  n = e(this).data('_inputmask'),
                  r = n['masksets'],
                  s = n['activeMasksetIndex']
                return n && n['opts'].autoUnmask
                  ? t.inputmask('unmaskedvalue')
                  : i.call(this) != r[s]['_buffer'].join('')
                  ? i.call(this)
                  : ''
              },
              set: function (t) {
                s.call(this, t)
                e(this).triggerHandler('setvalue.inputmask')
              },
            })
          }
        } else if (document.__lookupGetter__ && t.__lookupGetter__('value')) {
          if (!t._valueGet) {
            var i = t.__lookupGetter__('value')
            var s = t.__lookupSetter__('value')
            t._valueGet = function () {
              return h
                ? i.call(this).split('').reverse().join('')
                : i.call(this)
            }
            t._valueSet = function (e) {
              s.call(this, h ? e.split('').reverse().join('') : e)
            }
            t.__defineGetter__('value', function () {
              var t = e(this),
                n = e(this).data('_inputmask'),
                r = n['masksets'],
                s = n['activeMasksetIndex']
              return n && n['opts'].autoUnmask
                ? t.inputmask('unmaskedvalue')
                : i.call(this) != r[s]['_buffer'].join('')
                ? i.call(this)
                : ''
            })
            t.__defineSetter__('value', function (t) {
              s.call(this, t)
              e(this).triggerHandler('setvalue.inputmask')
            })
          }
        } else {
          if (!t._valueGet) {
            t._valueGet = function () {
              return h ? this.value.split('').reverse().join('') : this.value
            }
            t._valueSet = function (e) {
              this.value = h ? e.split('').reverse().join('') : e
            }
          }
          n(t.type)
        }
      }
      function J(e, t, n, r) {
        var i = E()
        if (r !== false) while (!T(e) && e - 1 >= 0) e--
        for (var s = e; s < t && s < C(); s++) {
          if (T(s)) {
            P(i, s)
            var o = k(s)
            var u = O(i, o)
            if (u != H(o)) {
              if (
                o < C() &&
                S(s, u, true) !== false &&
                b()[N(s)].def == b()[N(o)].def
              ) {
                A(i, s, u, true)
              } else {
                if (T(s)) break
              }
            }
          } else {
            P(i, s)
          }
        }
        if (n != undefined) A(i, L(t), n)
        if (y()['greedy'] == false) {
          var a = F(i.join('')).split('')
          i.length = a.length
          for (var s = 0, f = i.length; s < f; s++) {
            i[s] = a[s]
          }
          if (i.length == 0) y()['buffer'] = w().slice()
        }
        return e
      }
      function K(e, t, n) {
        var r = E()
        if (O(r, e, true) != H(e)) {
          for (var i = L(t); i > e && i >= 0; i--) {
            if (T(i)) {
              var s = L(i)
              var o = O(r, s)
              if (o != H(s)) {
                if (S(i, o, true) !== false && b()[N(i)].def == b()[N(s)].def) {
                  A(r, i, o, true)
                  P(r, s)
                }
              }
            } else P(r, i)
          }
        }
        if (n != undefined && O(r, e) == H(e)) A(r, e, n)
        var u = r.length
        if (y()['greedy'] == false) {
          var a = F(r.join('')).split('')
          r.length = a.length
          for (var i = 0, f = r.length; i < f; i++) {
            r[i] = a[i]
          }
          if (r.length == 0) y()['buffer'] = w().slice()
        }
        return t - (u - r.length)
      }
      function Q(e, t, n) {
        if (r.numericInput || h) {
          switch (t) {
            case r.keyCode.BACKSPACE:
              t = r.keyCode.DELETE
              break
            case r.keyCode.DELETE:
              t = r.keyCode.BACKSPACE
              break
          }
          if (h) {
            var i = n.end
            n.end = n.begin
            n.begin = i
          }
        }
        var s = true
        if (n.begin == n.end) {
          var o = t == r.keyCode.BACKSPACE ? n.begin - 1 : n.begin
          if (r.isNumeric && r.radixPoint != '' && E()[o] == r.radixPoint) {
            n.begin =
              E().length - 1 == o
                ? n.begin
                : t == r.keyCode.BACKSPACE
                ? o
                : k(o)
            n.end = n.begin
          }
          s = false
          if (t == r.keyCode.BACKSPACE) n.begin--
          else if (t == r.keyCode.DELETE) n.end++
        } else if (n.end - n.begin == 1 && !r.insertMode) {
          s = false
          if (t == r.keyCode.BACKSPACE) n.begin--
        }
        D(E(), n.begin, n.end)
        var u = C()
        if (r.greedy == false && (isNaN(r.repeat) || r.repeat > 0)) {
          J(n.begin, u, undefined, !h && t == r.keyCode.BACKSPACE && !s)
        } else {
          var a = n.begin
          for (var f = n.begin; f < n.end; f++) {
            if (T(f) || !s)
              a = J(n.begin, u, undefined, !h && t == r.keyCode.BACKSPACE && !s)
          }
          if (!s) n.begin = a
        }
        var l = k(-1)
        D(E(), n.begin, n.end, true)
        B(e, false, false, E())
        if (y()['lastValidPosition'] < l) {
          y()['lastValidPosition'] = -1
          y()['p'] = l
        } else {
          y()['p'] = n.begin
        }
      }
      function G(t) {
        v = false
        var n = this,
          i = e(n),
          s = t.keyCode,
          u = U(n)
        if (
          s == r.keyCode.BACKSPACE ||
          s == r.keyCode.DELETE ||
          (o && s == 127) ||
          (t.ctrlKey && s == 88)
        ) {
          t.preventDefault()
          if (s == 88) p = E().join('')
          Q(n, s, u)
          x()
          _(n, E(), y()['p'])
          if (n._valueGet() == w().join('')) i.trigger('cleared')
          if (r.showTooltip) {
            i.prop('title', y()['mask'])
          }
        } else if (s == r.keyCode.END || s == r.keyCode.PAGE_DOWN) {
          setTimeout(function () {
            var e = k(y()['lastValidPosition'])
            if (!r.insertMode && e == C() && !t.shiftKey) e--
            U(n, t.shiftKey ? u.begin : e, e)
          }, 0)
        } else if (
          (s == r.keyCode.HOME && !t.shiftKey) ||
          s == r.keyCode.PAGE_UP
        ) {
          U(n, 0, t.shiftKey ? u.begin : 0)
        } else if (s == r.keyCode.ESCAPE || (s == 90 && t.ctrlKey)) {
          B(n, true, false, p.split(''))
          i.click()
        } else if (s == r.keyCode.INSERT && !(t.shiftKey || t.ctrlKey)) {
          r.insertMode = !r.insertMode
          U(n, !r.insertMode && u.begin == C() ? u.begin - 1 : u.begin)
        } else if (r.insertMode == false && !t.shiftKey) {
          if (s == r.keyCode.RIGHT) {
            setTimeout(function () {
              var e = U(n)
              U(n, e.begin)
            }, 0)
          } else if (s == r.keyCode.LEFT) {
            setTimeout(function () {
              var e = U(n)
              U(n, e.begin - 1)
            }, 0)
          }
        }
        var a = U(n)
        if (r.onKeyDown.call(this, t, E(), r) === true) U(n, a.begin, a.end)
        g = e.inArray(s, r.ignorables) != -1
      }
      function Y(i, s, o, u, a, f) {
        if (o == undefined && v) return false
        v = true
        var l = this,
          c = e(l)
        i = i || window.event
        var o = s ? o : i.which || i.charCode || i.keyCode
        if (
          s !== true &&
          !(i.ctrlKey && i.altKey) &&
          (i.ctrlKey || i.metaKey || g)
        ) {
          return true
        } else {
          if (o) {
            if (
              s !== true &&
              o == 46 &&
              i.shiftKey == false &&
              r.radixPoint == ','
            )
              o = 44
            var h,
              p,
              d,
              b = String.fromCharCode(o)
            if (s) {
              var w = a ? f : y()['lastValidPosition'] + 1
              h = { begin: w, end: w }
            } else {
              h = U(l)
            }
            var T = W(h.begin, h.end),
              N = n
            if (T) {
              e.each(t, function (e, t) {
                if (typeof t == 'object') {
                  n = e
                  y()['undoBuffer'] = E().join('')
                }
              })
              n = N
              Q(l, r.keyCode.DELETE, h)
              if (!r.insertMode) {
                e.each(t, function (e, t) {
                  if (typeof t == 'object') {
                    n = e
                    K(h.begin, C())
                    y()['lastValidPosition'] = k(y()['lastValidPosition'])
                  }
                })
              }
              n = N
            }
            var M = E().join('').indexOf(r.radixPoint)
            if (r.isNumeric && s !== true && M != -1) {
              if (r.greedy && h.begin <= M) {
                h.begin = L(h.begin)
                h.end = h.begin
              } else if (b == r.radixPoint) {
                h.begin = M
                h.end = h.begin
              }
            }
            var D = h.begin
            p = S(D, b, a)
            if (a === true) p = [{ activeMasksetIndex: n, result: p }]
            var P = -1
            e.each(p, function (e, t) {
              n = t['activeMasksetIndex']
              y()['writeOutBuffer'] = true
              var i = t['result']
              if (i !== false) {
                var s = false,
                  o = E()
                if (i !== true) {
                  s = i['refresh']
                  D = i.pos != undefined ? i.pos : D
                  b = i.c != undefined ? i.c : b
                }
                if (s !== true) {
                  if (r.insertMode == true) {
                    var u = C()
                    var f = o.slice()
                    while (O(f, u, true) != H(u) && u >= D) {
                      u = u == 0 ? -1 : L(u)
                    }
                    if (u >= D) {
                      K(D, C(), b)
                      var l = y()['lastValidPosition'],
                        c = k(l)
                      if (
                        c != C() &&
                        l >= D &&
                        O(E().slice(), c, true) != H(c)
                      ) {
                        y()['lastValidPosition'] = c
                      }
                    } else y()['writeOutBuffer'] = false
                  } else A(o, D, b, true)
                  if (P == -1 || P > k(D)) {
                    P = k(D)
                  }
                } else if (!a) {
                  var h = D < C() ? D + 1 : D
                  if (P == -1 || P > h) {
                    P = h
                  }
                }
                if (P > y()['p']) y()['p'] = P
              }
            })
            if (a !== true) {
              n = N
              x()
            }
            if (u !== false) {
              e.each(p, function (e, t) {
                if (t['activeMasksetIndex'] == n) {
                  d = t
                  return false
                }
              })
              if (d != undefined) {
                var B = this
                setTimeout(function () {
                  r.onKeyValidation.call(B, d['result'], r)
                }, 0)
                if (y()['writeOutBuffer'] && d['result'] !== false) {
                  var j = E()
                  var F
                  if (s) {
                    F = undefined
                  } else if (r.numericInput) {
                    if (D > M) {
                      F = L(P)
                    } else if (b == r.radixPoint) {
                      F = P - 1
                    } else F = L(P - 1)
                  } else {
                    F = P
                  }
                  _(l, j, F)
                  if (s !== true) {
                    setTimeout(function () {
                      if (z(j) === true) c.trigger('complete')
                      m = true
                      c.trigger('input')
                    }, 0)
                  }
                } else if (T) {
                  y()['buffer'] = y()['undoBuffer'].split('')
                }
              } else if (T) {
                y()['buffer'] = y()['undoBuffer'].split('')
              }
            }
            if (r.showTooltip) {
              c.prop('title', y()['mask'])
            }
            if (i)
              i.preventDefault ? i.preventDefault() : (i.returnValue = false)
          }
        }
      }
      function Z(t) {
        var n = e(this),
          i = this,
          s = t.keyCode,
          o = E()
        r.onKeyUp.call(this, t, o, r)
        if (s == r.keyCode.TAB && r.showMaskOnFocus) {
          if (n.hasClass('focus.inputmask') && i._valueGet().length == 0) {
            o = w().slice()
            _(i, o)
            U(i, 0)
            p = E().join('')
          } else {
            _(i, o)
            if (
              o.join('') == w().join('') &&
              e.inArray(r.radixPoint, o) != -1
            ) {
              U(i, R(0))
              n.click()
            } else U(i, R(0), R(C()))
          }
        }
      }
      function et(t) {
        if (m === true && t.type == 'input') {
          m = false
          return true
        }
        var n = this,
          i = e(n)
        if (t.type == 'propertychange' && n._valueGet().length <= C()) {
          return true
        }
        setTimeout(function () {
          var t = e.isFunction(r.onBeforePaste)
            ? r.onBeforePaste.call(n, n._valueGet(), r)
            : n._valueGet()
          B(n, false, false, t.split(''), true)
          _(n, E())
          if (z(E()) === true) i.trigger('complete')
          i.click()
        }, 0)
      }
      function tt(t) {
        var n = this,
          i = e(n)
        var s = U(n),
          o = n._valueGet()
        o = o.replace(new RegExp('(' + j(w().join('')) + ')*'), '')
        if (s.begin > o.length) {
          U(n, o.length)
          s = U(n)
        }
        if (
          E().length - o.length == 1 &&
          o.charAt(s.begin) != E()[s.begin] &&
          o.charAt(s.begin + 1) != E()[s.begin] &&
          !T(s.begin)
        ) {
          t.keyCode = r.keyCode.BACKSPACE
          G.call(n, t)
        } else {
          B(n, false, false, o.split(''))
          _(n, E())
          if (z(E()) === true) i.trigger('complete')
          i.click()
        }
        t.preventDefault()
      }
      function nt(s) {
        d = e(s)
        if (d.is(':input')) {
          d.data('_inputmask', {
            masksets: t,
            activeMasksetIndex: n,
            opts: r,
            isRTL: false,
          })
          if (r.showTooltip) {
            d.prop('title', y()['mask'])
          }
          y()['greedy'] = y()['greedy'] ? y()['greedy'] : y()['repeat'] == 0
          if (d.attr('maxLength') != null) {
            var o = d.prop('maxLength')
            if (o > -1) {
              e.each(t, function (e, t) {
                if (typeof t == 'object') {
                  if (t['repeat'] == '*') {
                    t['repeat'] = o
                  }
                }
              })
            }
            if (C() >= o && o > -1) {
              if (o < w().length) w().length = o
              if (y()['greedy'] == false) {
                y()['repeat'] = Math.round(o / w().length)
              }
              d.prop('maxLength', C() * 2)
            }
          }
          V(s)
          if (r.numericInput) r.isNumeric = r.numericInput
          if (
            s.dir == 'rtl' ||
            (r.numericInput && r.rightAlignNumerics) ||
            (r.isNumeric && r.rightAlignNumerics)
          )
            d.css('text-align', 'right')
          if (s.dir == 'rtl' || r.numericInput) {
            s.dir = 'ltr'
            d.removeAttr('dir')
            var v = d.data('_inputmask')
            v['isRTL'] = true
            d.data('_inputmask', v)
            h = true
          }
          d.unbind('.inputmask')
          d.removeClass('focus.inputmask')
          d.closest('form')
            .bind('submit', function () {
              if (p != E().join('')) {
                d.change()
              }
            })
            .bind('reset', function () {
              setTimeout(function () {
                d.trigger('setvalue')
              }, 0)
            })
          d.bind('mouseenter.inputmask', function () {
            var t = e(this),
              n = this
            if (!t.hasClass('focus.inputmask') && r.showMaskOnHover) {
              if (n._valueGet() != E().join('')) {
                _(n, E())
              }
            }
          })
            .bind('blur.inputmask', function () {
              var i = e(this),
                s = this,
                o = s._valueGet(),
                u = E()
              i.removeClass('focus.inputmask')
              if (p != E().join('')) {
                i.change()
              }
              if (r.clearMaskOnLostFocus && o != '') {
                if (o == w().join('')) s._valueSet('')
                else {
                  I(s)
                }
              }
              if (z(u) === false) {
                i.trigger('incomplete')
                if (r.clearIncomplete) {
                  e.each(t, function (e, t) {
                    if (typeof t == 'object') {
                      t['buffer'] = t['_buffer'].slice()
                      t['lastValidPosition'] = -1
                    }
                  })
                  n = 0
                  if (r.clearMaskOnLostFocus) s._valueSet('')
                  else {
                    u = w().slice()
                    _(s, u)
                  }
                }
              }
            })
            .bind('focus.inputmask', function () {
              var t = e(this),
                n = this,
                i = n._valueGet()
              if (
                r.showMaskOnFocus &&
                !t.hasClass('focus.inputmask') &&
                (!r.showMaskOnHover || (r.showMaskOnHover && i == ''))
              ) {
                if (n._valueGet() != E().join('')) {
                  _(n, E(), k(y()['lastValidPosition']))
                }
              }
              t.addClass('focus.inputmask')
              p = E().join('')
            })
            .bind('mouseleave.inputmask', function () {
              var t = e(this),
                n = this
              if (r.clearMaskOnLostFocus) {
                if (
                  !t.hasClass('focus.inputmask') &&
                  n._valueGet() != t.attr('placeholder')
                ) {
                  if (n._valueGet() == w().join('') || n._valueGet() == '')
                    n._valueSet('')
                  else {
                    I(n)
                  }
                }
              }
            })
            .bind('click.inputmask', function () {
              var t = this
              setTimeout(function () {
                var n = U(t),
                  i = E()
                if (n.begin == n.end) {
                  var s = h ? R(n.begin) : n.begin,
                    o = y()['lastValidPosition'],
                    u
                  if (r.isNumeric) {
                    u =
                      r.skipRadixDance === false &&
                      r.radixPoint != '' &&
                      e.inArray(r.radixPoint, i) != -1
                        ? r.numericInput
                          ? k(e.inArray(r.radixPoint, i))
                          : e.inArray(r.radixPoint, i)
                        : k(o)
                  } else {
                    u = k(o)
                  }
                  if (s < u) {
                    if (T(s)) U(t, s)
                    else U(t, k(s))
                  } else U(t, u)
                }
              }, 0)
            })
            .bind('dblclick.inputmask', function () {
              var e = this
              setTimeout(function () {
                U(e, 0, k(y()['lastValidPosition']))
              }, 0)
            })
            .bind(c + '.inputmask dragdrop.inputmask drop.inputmask', et)
            .bind('setvalue.inputmask', function () {
              var e = this
              B(e, true)
              p = E().join('')
              if (e._valueGet() == w().join('')) e._valueSet('')
            })
            .bind('complete.inputmask', r.oncomplete)
            .bind('incomplete.inputmask', r.onincomplete)
            .bind('cleared.inputmask', r.oncleared)
          d.bind('keydown.inputmask', G)
            .bind('keypress.inputmask', Y)
            .bind('keyup.inputmask', Z)
          if (u || f || a || l) {
            d.attr('autocomplete', 'off')
              .attr('autocorrect', 'off')
              .attr('autocapitalize', 'off')
              .attr('spellcheck', false)
            if (f || l) {
              d.unbind('keydown.inputmask', G)
                .unbind('keypress.inputmask', Y)
                .unbind('keyup.inputmask', Z)
              if (c == 'input') {
                d.unbind(c + '.inputmask')
              }
              d.bind('input.inputmask', tt)
            }
          }
          if (i) d.bind('input.inputmask', et)
          var m = e.isFunction(r.onBeforeMask)
            ? r.onBeforeMask.call(s, s._valueGet(), r)
            : s._valueGet()
          B(s, true, false, m.split(''))
          p = E().join('')
          var g
          try {
            g = document.activeElement
          } catch (b) {}
          if (g === s) {
            d.addClass('focus.inputmask')
            U(s, k(y()['lastValidPosition']))
          } else if (r.clearMaskOnLostFocus) {
            if (E().join('') == w().join('')) {
              s._valueSet('')
            } else {
              I(s)
            }
          } else {
            _(s, E())
          }
          X(s)
        }
      }
      var h = false,
        p = E().join(''),
        d,
        v = false,
        m = false,
        g = false
      if (s != undefined) {
        switch (s['action']) {
          case 'isComplete':
            return z(s['buffer'])
          case 'unmaskedvalue':
            h = s['$input'].data('_inputmask')['isRTL']
            return q(s['$input'], s['skipDatepickerCheck'])
          case 'mask':
            nt(s['el'])
            break
          case 'format':
            d = e({})
            d.data('_inputmask', {
              masksets: t,
              activeMasksetIndex: n,
              opts: r,
              isRTL: r.numericInput,
            })
            if (r.numericInput) {
              r.isNumeric = r.numericInput
              h = true
            }
            B(d, false, false, s['value'].split(''), true)
            return E().join('')
          case 'isValid':
            d = e({})
            d.data('_inputmask', {
              masksets: t,
              activeMasksetIndex: n,
              opts: r,
              isRTL: r.numericInput,
            })
            if (r.numericInput) {
              r.isNumeric = r.numericInput
              h = true
            }
            B(d, false, true, s['value'].split(''))
            return z(E())
        }
      }
    }
    e.inputmask = {
      defaults: {
        placeholder: '_',
        optionalmarker: { start: '[', end: ']' },
        quantifiermarker: { start: '{', end: '}' },
        groupmarker: { start: '(', end: ')' },
        escapeChar: '\\',
        mask: null,
        oncomplete: e.noop,
        onincomplete: e.noop,
        oncleared: e.noop,
        repeat: 0,
        greedy: true,
        autoUnmask: false,
        clearMaskOnLostFocus: true,
        insertMode: true,
        clearIncomplete: false,
        aliases: {},
        onKeyUp: e.noop,
        onKeyDown: e.noop,
        onBeforeMask: undefined,
        onBeforePaste: undefined,
        onUnMask: undefined,
        showMaskOnFocus: true,
        showMaskOnHover: true,
        onKeyValidation: e.noop,
        skipOptionalPartCharacter: ' ',
        showTooltip: false,
        numericInput: false,
        isNumeric: false,
        radixPoint: '',
        skipRadixDance: false,
        rightAlignNumerics: true,
        definitions: {
          9: { validator: '[0-9]', cardinality: 1, definitionSymbol: '*' },
          a: {
            validator: '[A-Za-zА-яЁё]',
            cardinality: 1,
            definitionSymbol: '*',
          },
          '*': { validator: '[A-Za-zА-яЁё0-9]', cardinality: 1 },
        },
        keyCode: {
          ALT: 18,
          BACKSPACE: 8,
          CAPS_LOCK: 20,
          COMMA: 188,
          COMMAND: 91,
          COMMAND_LEFT: 91,
          COMMAND_RIGHT: 93,
          CONTROL: 17,
          DELETE: 46,
          DOWN: 40,
          END: 35,
          ENTER: 13,
          ESCAPE: 27,
          HOME: 36,
          INSERT: 45,
          LEFT: 37,
          MENU: 93,
          NUMPAD_ADD: 107,
          NUMPAD_DECIMAL: 110,
          NUMPAD_DIVIDE: 111,
          NUMPAD_ENTER: 108,
          NUMPAD_MULTIPLY: 106,
          NUMPAD_SUBTRACT: 109,
          PAGE_DOWN: 34,
          PAGE_UP: 33,
          PERIOD: 190,
          RIGHT: 39,
          SHIFT: 16,
          SPACE: 32,
          TAB: 9,
          UP: 38,
          WINDOWS: 91,
        },
        ignorables: [
          8, 9, 13, 19, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 93, 112,
          113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123,
        ],
        getMaskLength: undefined,
        isComplete: undefined,
      },
      escapeRegex: function (e) {
        var t = [
          '/',
          '.',
          '*',
          '+',
          '?',
          '|',
          '(',
          ')',
          '[',
          ']',
          '{',
          '}',
          '\\',
        ]
        return e.replace(new RegExp('(\\' + t.join('|\\') + ')', 'gim'), '\\$1')
      },
      format: function (t, i) {
        var s = e.extend(true, {}, e.inputmask.defaults, i)
        n(s.alias, i, s)
        return h(r(s), 0, s, { action: 'format', value: t })
      },
      isValid: function (t, i) {
        var s = e.extend(true, {}, e.inputmask.defaults, i)
        n(s.alias, i, s)
        return h(r(s), 0, s, { action: 'isValid', value: t })
      },
    }
    e.fn.inputmask = function (t, i) {
      var s = e.extend(true, {}, e.inputmask.defaults, i),
        o,
        u = 0
      if (typeof t === 'string') {
        switch (t) {
          case 'mask':
            n(s.alias, i, s)
            o = r(s)
            if (o.length == 0) {
              return this
            }
            return this.each(function () {
              h(e.extend(true, {}, o), 0, s, { action: 'mask', el: this })
            })
          case 'unmaskedvalue':
            var a = e(this),
              f = this
            if (a.data('_inputmask')) {
              o = a.data('_inputmask')['masksets']
              u = a.data('_inputmask')['activeMasksetIndex']
              s = a.data('_inputmask')['opts']
              return h(o, u, s, { action: 'unmaskedvalue', $input: a })
            } else return a.val()
          case 'remove':
            return this.each(function () {
              var t = e(this),
                n = this
              if (t.data('_inputmask')) {
                o = t.data('_inputmask')['masksets']
                u = t.data('_inputmask')['activeMasksetIndex']
                s = t.data('_inputmask')['opts']
                n._valueSet(
                  h(o, u, s, {
                    action: 'unmaskedvalue',
                    $input: t,
                    skipDatepickerCheck: true,
                  })
                )
                t.removeData('_inputmask')
                t.unbind('.inputmask')
                t.removeClass('focus.inputmask')
                var r
                if (Object.getOwnPropertyDescriptor)
                  r = Object.getOwnPropertyDescriptor(n, 'value')
                if (r && r.get) {
                  if (n._valueGet) {
                    Object.defineProperty(n, 'value', {
                      get: n._valueGet,
                      set: n._valueSet,
                    })
                  }
                } else if (
                  document.__lookupGetter__ &&
                  n.__lookupGetter__('value')
                ) {
                  if (n._valueGet) {
                    n.__defineGetter__('value', n._valueGet)
                    n.__defineSetter__('value', n._valueSet)
                  }
                }
                try {
                  delete n._valueGet
                  delete n._valueSet
                } catch (i) {
                  n._valueGet = undefined
                  n._valueSet = undefined
                }
              }
            })
            break
          case 'getemptymask':
            if (this.data('_inputmask')) {
              o = this.data('_inputmask')['masksets']
              u = this.data('_inputmask')['activeMasksetIndex']
              return o[u]['_buffer'].join('')
            } else return ''
          case 'hasMaskedValue':
            return this.data('_inputmask')
              ? !this.data('_inputmask')['opts'].autoUnmask
              : false
          case 'isComplete':
            o = this.data('_inputmask')['masksets']
            u = this.data('_inputmask')['activeMasksetIndex']
            s = this.data('_inputmask')['opts']
            return h(o, u, s, {
              action: 'isComplete',
              buffer: this[0]._valueGet().split(''),
            })
          case 'getmetadata':
            if (this.data('_inputmask')) {
              o = this.data('_inputmask')['masksets']
              u = this.data('_inputmask')['activeMasksetIndex']
              return o[u]['metadata']
            } else return undefined
          default:
            if (!n(t, i, s)) {
              s.mask = t
            }
            o = r(s)
            if (o.length == 0) {
              return this
            }
            return this.each(function () {
              h(e.extend(true, {}, o), u, s, { action: 'mask', el: this })
            })
            break
        }
      } else if (typeof t == 'object') {
        s = e.extend(true, {}, e.inputmask.defaults, t)
        n(s.alias, t, s)
        o = r(s)
        if (o.length == 0) {
          return this
        }
        return this.each(function () {
          h(e.extend(true, {}, o), u, s, { action: 'mask', el: this })
        })
      } else if (t == undefined) {
        return this.each(function () {
          var t = e(this).attr('data-inputmask')
          if (t && t != '') {
            try {
              t = t.replace(new RegExp("'", 'g'), '"')
              var r = e.parseJSON('{' + t + '}')
              e.extend(true, r, i)
              s = e.extend(true, {}, e.inputmask.defaults, r)
              n(s.alias, r, s)
              s.alias = undefined
              e(this).inputmask(s)
            } catch (o) {}
          }
        })
      }
    }
  }
})(jQuery)

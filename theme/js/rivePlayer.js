;(function () {
	const ht = document.createElement('link').relList
	if (ht && ht.supports && ht.supports('modulepreload')) return
	for (const D of document.querySelectorAll('link[rel="modulepreload"]')) Qe(D)
	new MutationObserver(D => {
		for (const Z of D) if (Z.type === 'childList') for (const W of Z.addedNodes) W.tagName === 'LINK' && W.rel === 'modulepreload' && Qe(W)
	}).observe(document, { childList: !0, subtree: !0 })
	function dt(D) {
		const Z = {}
		return (
			D.integrity && (Z.integrity = D.integrity),
			D.referrerPolicy && (Z.referrerPolicy = D.referrerPolicy),
			D.crossOrigin === 'use-credentials' ? (Z.credentials = 'include') : D.crossOrigin === 'anonymous' ? (Z.credentials = 'omit') : (Z.credentials = 'same-origin'),
			Z
		)
	}
	function Qe(D) {
		if (D.ep) return
		D.ep = !0
		const Z = dt(D)
		fetch(D.href, Z)
	}
})()
var ti = typeof globalThis < 'u' ? globalThis : typeof window < 'u' ? window : typeof global < 'u' ? global : typeof self < 'u' ? self : {},
	Rr = { exports: {} }
;(function (_t, ht) {
	;(function (Qe, D) {
		_t.exports = D()
	})(ti, () =>
		(() => {
			var dt = [
					,
					(W, $, z) => {
						z.r($), z.d($, { default: () => ae })
						var oe = (() => {
							var Q = typeof document < 'u' && document.currentScript ? document.currentScript.src : void 0
							return function (S = {}) {
								var l = S,
									Ae,
									q
								l.ready = new Promise((e, t) => {
									;(Ae = e), (q = t)
								})
								function se() {
									function e(c) {
										const p = i
										;(n = t = 0),
											(i = new Map()),
											p.forEach(v => {
												try {
													v(c)
												} catch (h) {
													console.error(h)
												}
											}),
											this.ob(),
											o && o.Tb()
									}
									let t = 0,
										n = 0,
										i = new Map(),
										o = null,
										s = null
									;(this.requestAnimationFrame = function (c) {
										t || (t = requestAnimationFrame(e.bind(this)))
										const p = ++n
										return i.set(p, c), p
									}),
										(this.cancelAnimationFrame = function (c) {
											i.delete(c), t && i.size == 0 && (cancelAnimationFrame(t), (t = 0))
										}),
										(this.Rb = function (c) {
											s && (document.body.remove(s), (s = null)),
												c ||
													((s = document.createElement('div')),
													(s.style.backgroundColor = 'black'),
													(s.style.position = 'fixed'),
													(s.style.right = 0),
													(s.style.top = 0),
													(s.style.color = 'white'),
													(s.style.padding = '4px'),
													(s.innerHTML = 'RIVE FPS'),
													(c = function (p) {
														s.innerHTML = 'RIVE FPS ' + p.toFixed(1)
													}),
													document.body.appendChild(s)),
												(o = new (function () {
													let p = 0,
														v = 0
													this.Tb = function () {
														var h = performance.now()
														v ? (++p, (h -= v), 1e3 < h && (c((1e3 * p) / h), (p = v = 0))) : ((v = h), (p = 0))
													}
												})())
										}),
										(this.Ob = function () {
											s && (document.body.remove(s), (s = null)), (o = null)
										}),
										(this.ob = function () {})
								}
								function Oe(e) {
									console.assert(!0)
									const t = new Map()
									let n = -1 / 0
									this.push = function (i) {
										return (
											(i = (i + ((1 << e) - 1)) >> e),
											t.has(i) && clearTimeout(t.get(i)),
											t.set(
												i,
												setTimeout(function () {
													t.delete(i), t.length == 0 ? (n = -1 / 0) : i == n && ((n = Math.max(...t.keys())), console.assert(n < i))
												}, 1e3)
											),
											(n = Math.max(i, n)),
											n << e
										)
									}
								}
								const ye = l.onRuntimeInitialized
								l.onRuntimeInitialized = function () {
									ye && ye()
									let e = l.decodeAudio
									l.decodeAudio = function (o, s) {
										;(o = e(o)), s(o)
									}
									let t = l.decodeFont
									l.decodeFont = function (o, s) {
										;(o = t(o)), s(o)
									}
									const n = l.FileAssetLoader
									;(l.ptrToAsset = o => {
										let s = l.ptrToFileAsset(o)
										return s.isImage ? l.ptrToImageAsset(o) : s.isFont ? l.ptrToFontAsset(o) : s.isAudio ? l.ptrToAudioAsset(o) : s
									}),
										(l.CustomFileAssetLoader = n.extend('CustomFileAssetLoader', {
											__construct: function ({ loadContents: o }) {
												this.__parent.__construct.call(this), (this.Gb = o)
											},
											loadContents: function (o, s) {
												return (o = l.ptrToAsset(o)), this.Gb(o, s)
											},
										})),
										(l.CDNFileAssetLoader = n.extend('CDNFileAssetLoader', {
											__construct: function () {
												this.__parent.__construct.call(this)
											},
											loadContents: function (o) {
												let s = l.ptrToAsset(o)
												return (
													(o = s.cdnUuid),
													o === ''
														? !1
														: ((function (c, p) {
																var v = new XMLHttpRequest()
																;(v.responseType = 'arraybuffer'),
																	(v.onreadystatechange = function () {
																		v.readyState == 4 && v.status == 200 && p(v)
																	}),
																	v.open('GET', c, !0),
																	v.send(null)
															})(s.cdnBaseUrl + '/' + o, c => {
																s.decode(new Uint8Array(c.response))
															}),
															!0)
												)
											},
										})),
										(l.FallbackFileAssetLoader = n.extend('FallbackFileAssetLoader', {
											__construct: function () {
												this.__parent.__construct.call(this), (this.kb = [])
											},
											addLoader: function (o) {
												this.kb.push(o)
											},
											loadContents: function (o, s) {
												for (let c of this.kb) if (c.loadContents(o, s)) return !0
												return !1
											},
										}))
									let i = l.computeAlignment
									l.computeAlignment = function (o, s, c, p, v = 1) {
										return i.call(this, o, s, c, p, v)
									}
								}
								const ce =
										'createConicGradient createImageData createLinearGradient createPattern createRadialGradient getContextAttributes getImageData getLineDash getTransform isContextLost isPointInPath isPointInStroke measureText'.split(
											' '
										),
									le = new (function () {
										function e() {
											if (!t) {
												let K = function (C, V, re) {
													if (((V = R.createShader(V)), R.shaderSource(V, re), R.compileShader(V), (re = R.getShaderInfoLog(V)), 0 < (re || '').length)) throw re
													R.attachShader(C, V)
												}
												var L = K,
													f = document.createElement('canvas'),
													b = {
														alpha: 1,
														depth: 0,
														stencil: 0,
														antialias: 0,
														premultipliedAlpha: 1,
														preserveDrawingBuffer: 0,
														powerPreference: 'high-performance',
														failIfMajorPerformanceCaveat: 0,
														enableExtensionsByDefault: 1,
														explicitSwapControl: 1,
														renderViaOffscreenBackBuffer: 1,
													}
												let R
												if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
													if (((R = f.getContext('webgl', b)), (n = 1), !R)) return console.log('No WebGL support. Image mesh will not be drawn.'), !1
												} else if ((R = f.getContext('webgl2', b))) n = 2
												else if ((R = f.getContext('webgl', b))) n = 1
												else return console.log('No WebGL support. Image mesh will not be drawn.'), !1
												if (
													((R = new Proxy(R, {
														get(C, V) {
															if (C.isContextLost()) {
																if ((v || (console.error('Cannot render the mesh because the GL Context was lost. Tried to invoke ', V), (v = !0)), typeof C[V] == 'function')) return function () {}
															} else
																return typeof C[V] == 'function'
																	? function (...re) {
																			return C[V].apply(C, re)
																		}
																	: C[V]
														},
														set(C, V, re) {
															if (C.isContextLost()) v || (console.error('Cannot render the mesh because the GL Context was lost. Tried to set property ' + V), (v = !0))
															else return (C[V] = re), !0
														},
													})),
													(i = Math.min(R.getParameter(R.MAX_RENDERBUFFER_SIZE), R.getParameter(R.MAX_TEXTURE_SIZE))),
													(f = R.createProgram()),
													K(
														f,
														R.VERTEX_SHADER,
														`attribute vec2 vertex;
                attribute vec2 uv;
                uniform vec4 mat;
                uniform vec2 translate;
                varying vec2 st;
                void main() {
                    st = uv;
                    gl_Position = vec4(mat2(mat) * vertex + translate, 0, 1);
                }`
													),
													K(
														f,
														R.FRAGMENT_SHADER,
														`precision highp float;
                uniform sampler2D image;
                varying vec2 st;
                void main() {
                    gl_FragColor = texture2D(image, st);
                }`
													),
													R.bindAttribLocation(f, 0, 'vertex'),
													R.bindAttribLocation(f, 1, 'uv'),
													R.linkProgram(f),
													(b = R.getProgramInfoLog(f)),
													0 < (b || '').trim().length)
												)
													throw b
												;(o = R.getUniformLocation(f, 'mat')),
													(s = R.getUniformLocation(f, 'translate')),
													R.useProgram(f),
													R.bindBuffer(R.ARRAY_BUFFER, R.createBuffer()),
													R.enableVertexAttribArray(0),
													R.enableVertexAttribArray(1),
													R.bindBuffer(R.ELEMENT_ARRAY_BUFFER, R.createBuffer()),
													R.uniform1i(R.getUniformLocation(f, 'image'), 0),
													R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0),
													(t = R)
											}
											return !0
										}
										let t = null,
											n = 0,
											i = 0,
											o = null,
											s = null,
											c = 0,
											p = 0,
											v = !1
										e(),
											(this.hc = function () {
												return e(), i
											}),
											(this.Mb = function (f) {
												t.deleteTexture && t.deleteTexture(f)
											}),
											(this.Lb = function (f) {
												if (!e()) return null
												const b = t.createTexture()
												return b
													? (t.bindTexture(t.TEXTURE_2D, b),
														t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, t.RGBA, t.UNSIGNED_BYTE, f),
														t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE),
														t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE),
														t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR),
														n == 2
															? (t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR_MIPMAP_LINEAR), t.generateMipmap(t.TEXTURE_2D))
															: t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR),
														b)
													: null
											})
										const h = new Oe(8),
											_ = new Oe(8),
											A = new Oe(10),
											E = new Oe(10)
										;(this.Qb = function (f, b, L, R, K) {
											if (e()) {
												var C = h.push(f),
													V = _.push(b)
												if (t.canvas) {
													;(t.canvas.width != C || t.canvas.height != V) && ((t.canvas.width = C), (t.canvas.height = V)),
														t.viewport(0, V - b, f, b),
														t.disable(t.SCISSOR_TEST),
														t.clearColor(0, 0, 0, 0),
														t.clear(t.COLOR_BUFFER_BIT),
														t.enable(t.SCISSOR_TEST),
														L.sort((H, Ye) => Ye.wb - H.wb),
														(C = A.push(R)),
														c != C && (t.bufferData(t.ARRAY_BUFFER, 8 * C, t.DYNAMIC_DRAW), (c = C)),
														(C = 0)
													for (var re of L) t.bufferSubData(t.ARRAY_BUFFER, C, re.Ta), (C += 4 * re.Ta.length)
													console.assert(C == 4 * R)
													for (var $e of L) t.bufferSubData(t.ARRAY_BUFFER, C, $e.Db), (C += 4 * $e.Db.length)
													console.assert(C == 8 * R), (C = E.push(K)), p != C && (t.bufferData(t.ELEMENT_ARRAY_BUFFER, 2 * C, t.DYNAMIC_DRAW), (p = C)), (re = 0)
													for (var ct of L) t.bufferSubData(t.ELEMENT_ARRAY_BUFFER, re, ct.indices), (re += 2 * ct.indices.length)
													console.assert(re == 2 * K), (ct = 0), ($e = !0), (C = re = 0)
													for (const H of L) {
														H.image.Ka != ct && (t.bindTexture(t.TEXTURE_2D, H.image.Ja || null), (ct = H.image.Ka)),
															H.mc ? (t.scissor(H.Ya, V - H.Za - H.jb, H.Ac, H.jb), ($e = !0)) : $e && (t.scissor(0, V - b, f, b), ($e = !1)),
															(L = 2 / f)
														const Ye = -2 / b
														t.uniform4f(o, H.ha[0] * L * H.Ba, H.ha[1] * Ye * H.Ca, H.ha[2] * L * H.Ba, H.ha[3] * Ye * H.Ca),
															t.uniform2f(s, H.ha[4] * L * H.Ba + L * (H.Ya - H.ic * H.Ba) - 1, H.ha[5] * Ye * H.Ca + Ye * (H.Za - H.jc * H.Ca) + 1),
															t.vertexAttribPointer(0, 2, t.FLOAT, !1, 0, C),
															t.vertexAttribPointer(1, 2, t.FLOAT, !1, 0, C + 4 * R),
															t.drawElements(t.TRIANGLES, H.indices.length, t.UNSIGNED_SHORT, re),
															(C += 4 * H.Ta.length),
															(re += 2 * H.indices.length)
													}
													console.assert(C == 4 * R), console.assert(re == 2 * K)
												}
											}
										}),
											(this.canvas = function () {
												return e() && t.canvas
											})
									})(),
									Re = l.onRuntimeInitialized
								l.onRuntimeInitialized = function () {
									function e(y) {
										switch (y) {
											case h.srcOver:
												return 'source-over'
											case h.screen:
												return 'screen'
											case h.overlay:
												return 'overlay'
											case h.darken:
												return 'darken'
											case h.lighten:
												return 'lighten'
											case h.colorDodge:
												return 'color-dodge'
											case h.colorBurn:
												return 'color-burn'
											case h.hardLight:
												return 'hard-light'
											case h.softLight:
												return 'soft-light'
											case h.difference:
												return 'difference'
											case h.exclusion:
												return 'exclusion'
											case h.multiply:
												return 'multiply'
											case h.hue:
												return 'hue'
											case h.saturation:
												return 'saturation'
											case h.color:
												return 'color'
											case h.luminosity:
												return 'luminosity'
										}
									}
									function t(y) {
										return 'rgba(' + ((16711680 & y) >>> 16) + ',' + ((65280 & y) >>> 8) + ',' + ((255 & y) >>> 0) + ',' + ((4278190080 & y) >>> 24) / 255 + ')'
									}
									function n() {
										0 < V.length && (le.Qb(C.drawWidth(), C.drawHeight(), V, re, $e), (V = []), ($e = re = 0), C.reset(512, 512))
										for (const y of K) {
											for (const P of y.H) P()
											y.H = []
										}
										K.clear()
									}
									Re && Re()
									var i = l.RenderPaintStyle
									const o = l.RenderPath,
										s = l.RenderPaint,
										c = l.Renderer,
										p = l.StrokeCap,
										v = l.StrokeJoin,
										h = l.BlendMode,
										_ = i.fill,
										A = i.stroke,
										E = l.FillRule.evenOdd
									let f = 1
									var b = l.RenderImage.extend('CanvasRenderImage', {
											__construct: function ({ la: y, xa: P } = {}) {
												this.__parent.__construct.call(this), (this.Ka = f), (f = (f + 1) & 2147483647 || 1), (this.la = y), (this.xa = P)
											},
											__destruct: function () {
												this.Ja && (le.Mb(this.Ja), URL.revokeObjectURL(this.Wa)), this.__parent.__destruct.call(this)
											},
											decode: function (y) {
												var P = this
												P.xa && P.xa(P)
												var B = new Image()
												;(P.Wa = URL.createObjectURL(new Blob([y], { type: 'image/png' }))),
													(B.onload = function () {
														;(P.Fb = B), (P.Ja = le.Lb(B)), P.size(B.width, B.height), P.la && P.la(P)
													}),
													(B.src = P.Wa)
											},
										}),
										L = o.extend('CanvasRenderPath', {
											__construct: function () {
												this.__parent.__construct.call(this), (this.T = new Path2D())
											},
											rewind: function () {
												this.T = new Path2D()
											},
											addPath: function (y, P, B, N, j, X, k) {
												var J = this.T,
													Se = J.addPath
												y = y.T
												const ve = new DOMMatrix()
												;(ve.a = P), (ve.b = B), (ve.c = N), (ve.d = j), (ve.e = X), (ve.f = k), Se.call(J, y, ve)
											},
											fillRule: function (y) {
												this.Va = y
											},
											moveTo: function (y, P) {
												this.T.moveTo(y, P)
											},
											lineTo: function (y, P) {
												this.T.lineTo(y, P)
											},
											cubicTo: function (y, P, B, N, j, X) {
												this.T.bezierCurveTo(y, P, B, N, j, X)
											},
											close: function () {
												this.T.closePath()
											},
										}),
										R = s.extend('CanvasRenderPaint', {
											color: function (y) {
												this.Xa = t(y)
											},
											thickness: function (y) {
												this.Ib = y
											},
											join: function (y) {
												switch (y) {
													case v.miter:
														this.Ia = 'miter'
														break
													case v.round:
														this.Ia = 'round'
														break
													case v.bevel:
														this.Ia = 'bevel'
												}
											},
											cap: function (y) {
												switch (y) {
													case p.butt:
														this.Ha = 'butt'
														break
													case p.round:
														this.Ha = 'round'
														break
													case p.square:
														this.Ha = 'square'
												}
											},
											style: function (y) {
												this.Hb = y
											},
											blendMode: function (y) {
												this.Eb = e(y)
											},
											clearGradient: function () {
												this.ja = null
											},
											linearGradient: function (y, P, B, N) {
												this.ja = { yb: y, zb: P, bb: B, cb: N, Ra: [] }
											},
											radialGradient: function (y, P, B, N) {
												this.ja = { yb: y, zb: P, bb: B, cb: N, Ra: [], ec: !0 }
											},
											addStop: function (y, P) {
												this.ja.Ra.push({ color: y, stop: P })
											},
											completeGradient: function () {},
											draw: function (y, P, B) {
												let N = this.Hb
												var j = this.Xa,
													X = this.ja
												if (((y.globalCompositeOperation = this.Eb), X != null)) {
													j = X.yb
													var k = X.zb
													const Se = X.bb
													var J = X.cb
													const ve = X.Ra
													X.ec ? ((X = Se - j), (J -= k), (j = y.createRadialGradient(j, k, 0, j, k, Math.sqrt(X * X + J * J)))) : (j = y.createLinearGradient(j, k, Se, J))
													for (let ze = 0, ge = ve.length; ze < ge; ze++) (k = ve[ze]), j.addColorStop(k.stop, t(k.color))
													;(this.Xa = j), (this.ja = null)
												}
												switch (N) {
													case A:
														;(y.strokeStyle = j), (y.lineWidth = this.Ib), (y.lineCap = this.Ha), (y.lineJoin = this.Ia), y.stroke(P)
														break
													case _:
														;(y.fillStyle = j), y.fill(P, B)
												}
											},
										})
									const K = new Set()
									let C = null,
										V = [],
										re = 0,
										$e = 0
									var ct = (l.CanvasRenderer = c.extend('Renderer', {
										__construct: function (y) {
											this.__parent.__construct.call(this), (this.S = [1, 0, 0, 1, 0, 0]), (this.C = y.getContext('2d')), (this.Ua = y), (this.H = [])
										},
										save: function () {
											this.S.push(...this.S.slice(this.S.length - 6)), this.H.push(this.C.save.bind(this.C))
										},
										restore: function () {
											const y = this.S.length - 6
											if (6 > y) throw 'restore() called without matching save().'
											this.S.splice(y), this.H.push(this.C.restore.bind(this.C))
										},
										transform: function (y, P, B, N, j, X) {
											const k = this.S,
												J = k.length - 6
											k.splice(
												J,
												6,
												k[J] * y + k[J + 2] * P,
												k[J + 1] * y + k[J + 3] * P,
												k[J] * B + k[J + 2] * N,
												k[J + 1] * B + k[J + 3] * N,
												k[J] * j + k[J + 2] * X + k[J + 4],
												k[J + 1] * j + k[J + 3] * X + k[J + 5]
											),
												this.H.push(this.C.transform.bind(this.C, y, P, B, N, j, X))
										},
										rotate: function (y) {
											const P = Math.sin(y)
											;(y = Math.cos(y)), this.transform(y, P, -P, y, 0, 0)
										},
										_drawPath: function (y, P) {
											this.H.push(P.draw.bind(P, this.C, y.T, y.Va === E ? 'evenodd' : 'nonzero'))
										},
										_drawRiveImage: function (y, P, B) {
											var N = y.Fb
											if (N) {
												var j = this.C,
													X = e(P)
												this.H.push(function () {
													;(j.globalCompositeOperation = X), (j.globalAlpha = B), j.drawImage(N, 0, 0), (j.globalAlpha = 1)
												})
											}
										},
										_getMatrix: function (y) {
											const P = this.S,
												B = P.length - 6
											for (let N = 0; 6 > N; ++N) y[N] = P[B + N]
										},
										_drawImageMesh: function (y, P, B, N, j, X, k, J, Se, ve) {
											var ze = this.C.canvas.width,
												ge = this.C.canvas.height
											const yr = Se - k,
												wr = ve - J
											;(k = Math.max(k, 0)), (J = Math.max(J, 0)), (Se = Math.min(Se, ze)), (ve = Math.min(ve, ge))
											const Ot = Se - k,
												jt = ve - J
											if ((console.assert(Ot <= Math.min(yr, ze)), console.assert(jt <= Math.min(wr, ge)), !(0 >= Ot || 0 >= jt))) {
												;(Se = Ot < yr || jt < wr), (ze = ve = 1)
												var lt = Math.ceil(Ot * ve),
													ft = Math.ceil(jt * ze)
												;(ge = le.hc()),
													lt > ge && ((ve *= ge / lt), (lt = ge)),
													ft > ge && ((ze *= ge / ft), (ft = ge)),
													C || ((C = new l.DynamicRectanizer(ge)), C.reset(512, 512)),
													(ge = C.addRect(lt, ft)),
													0 > ge && (n(), K.add(this), (ge = C.addRect(lt, ft)), console.assert(0 <= ge))
												var br = ge & 65535,
													_r = ge >> 16
												V.push({
													ha: this.S.slice(this.S.length - 6),
													image: y,
													Ya: br,
													Za: _r,
													ic: k,
													jc: J,
													Ac: lt,
													jb: ft,
													Ba: ve,
													Ca: ze,
													Ta: new Float32Array(N),
													Db: new Float32Array(j),
													indices: new Uint16Array(X),
													mc: Se,
													wb: (y.Ka << 1) | (Se ? 1 : 0),
												}),
													(re += N.length),
													($e += X.length)
												var bt = this.C,
													ei = e(P)
												this.H.push(function () {
													bt.save(), bt.resetTransform(), (bt.globalCompositeOperation = ei), (bt.globalAlpha = B)
													const Ar = le.canvas()
													Ar && bt.drawImage(Ar, br, _r, lt, ft, k, J, Ot, jt), bt.restore()
												})
											}
										},
										_clipPath: function (y) {
											this.H.push(this.C.clip.bind(this.C, y.T, y.Va === E ? 'evenodd' : 'nonzero'))
										},
										clear: function () {
											K.add(this), this.H.push(this.C.clearRect.bind(this.C, 0, 0, this.Ua.width, this.Ua.height))
										},
										flush: function () {},
										translate: function (y, P) {
											this.transform(1, 0, 0, 1, y, P)
										},
									}))
									;(l.makeRenderer = function (y) {
										const P = new ct(y),
											B = P.C
										return new Proxy(P, {
											get(N, j) {
												if (typeof N[j] == 'function')
													return function (...X) {
														return N[j].apply(N, X)
													}
												if (typeof B[j] == 'function') {
													if (-1 < ce.indexOf(j))
														throw Error(
															"RiveException: Method call to '" +
																j +
																"()' is not allowed, as the renderer cannot immediately pass through the return                 values of any canvas 2d context methods."
														)
													return function (...X) {
														P.H.push(B[j].bind(B, ...X))
													}
												}
												return N[j]
											},
											set(N, j, X) {
												if (j in B)
													return (
														P.H.push(() => {
															B[j] = X
														}),
														!0
													)
											},
										})
									}),
										(l.decodeImage = function (y, P) {
											new b({ la: P }).decode(y)
										}),
										(l.renderFactory = {
											makeRenderPaint: function () {
												return new R()
											},
											makeRenderPath: function () {
												return new L()
											},
											makeRenderImage: function () {
												let y = Ye
												return new b({
													xa: () => {
														y.total++
													},
													la: () => {
														if ((y.loaded++, y.loaded === y.total)) {
															const P = y.ready
															P && (P(), (y.ready = null))
														}
													},
												})
											},
										})
									let H = l.load,
										Ye = null
									l.load = function (y, P, B = !0) {
										const N = new l.FallbackFileAssetLoader()
										return (
											P !== void 0 && N.addLoader(P),
											B && ((P = new l.CDNFileAssetLoader()), N.addLoader(P)),
											new Promise(function (j) {
												let X = null
												;(Ye = {
													total: 0,
													loaded: 0,
													ready: function () {
														j(X)
													},
												}),
													(X = H(y, N)),
													Ye.total == 0 && j(X)
											})
										)
									}
									let qr = l.RendererWrapper.prototype.align
									;(l.RendererWrapper.prototype.align = function (y, P, B, N, j = 1) {
										qr.call(this, y, P, B, N, j)
									}),
										(i = new se()),
										(l.requestAnimationFrame = i.requestAnimationFrame.bind(i)),
										(l.cancelAnimationFrame = i.cancelAnimationFrame.bind(i)),
										(l.enableFPSCounter = i.Rb.bind(i)),
										(l.disableFPSCounter = i.Ob),
										(i.ob = n),
										(l.resolveAnimationFrame = n),
										(l.cleanup = function () {
											C && C.delete()
										})
								}
								var Ce = Object.assign({}, l),
									it = './this.program',
									O = typeof window == 'object',
									Pe = typeof importScripts == 'function',
									fe = '',
									qe,
									ee
								;(O || Pe) &&
									(Pe ? (fe = self.location.href) : typeof document < 'u' && document.currentScript && (fe = document.currentScript.src),
									Q && (fe = Q),
									fe.indexOf('blob:') !== 0 ? (fe = fe.substr(0, fe.replace(/[?#].*/, '').lastIndexOf('/') + 1)) : (fe = ''),
									Pe &&
										(ee = e => {
											var t = new XMLHttpRequest()
											return t.open('GET', e, !1), (t.responseType = 'arraybuffer'), t.send(null), new Uint8Array(t.response)
										}),
									(qe = (e, t, n) => {
										var i = new XMLHttpRequest()
										i.open('GET', e, !0),
											(i.responseType = 'arraybuffer'),
											(i.onload = () => {
												i.status == 200 || (i.status == 0 && i.response) ? t(i.response) : n()
											}),
											(i.onerror = n),
											i.send(null)
									}))
								var Le = l.print || console.log.bind(console),
									he = l.printErr || console.error.bind(console)
								Object.assign(l, Ce), (Ce = null), l.thisProgram && (it = l.thisProgram)
								var Ue
								l.wasmBinary && (Ue = l.wasmBinary), l.noExitRuntime, typeof WebAssembly != 'object' && I('no native wasm support detected')
								var He,
									ne,
									ot = !1,
									de,
									ie,
									be,
									pe,
									Y,
									te,
									We,
									Xe
								function u() {
									var e = He.buffer
									;(l.HEAP8 = de = new Int8Array(e)),
										(l.HEAP16 = be = new Int16Array(e)),
										(l.HEAP32 = Y = new Int32Array(e)),
										(l.HEAPU8 = ie = new Uint8Array(e)),
										(l.HEAPU16 = pe = new Uint16Array(e)),
										(l.HEAPU32 = te = new Uint32Array(e)),
										(l.HEAPF32 = We = new Float32Array(e)),
										(l.HEAPF64 = Xe = new Float64Array(e))
								}
								var r,
									a = [],
									d = [],
									m = []
								function g() {
									var e = l.preRun.shift()
									a.unshift(e)
								}
								var w = 0,
									M = null
								function I(e) {
									throw (l.onAbort && l.onAbort(e), (e = 'Aborted(' + e + ')'), he(e), (ot = !0), (e = new WebAssembly.RuntimeError(e + '. Build with -sASSERTIONS for more info.')), q(e), e)
								}
								function F(e) {
									return e.startsWith('data:application/octet-stream;base64,')
								}
								var G
								if (((G = 'canvas_advanced.wasm'), !F(G))) {
									var me = G
									G = l.locateFile ? l.locateFile(me, fe) : fe + me
								}
								function Ee(e) {
									if (e == G && Ue) return new Uint8Array(Ue)
									if (ee) return ee(e)
									throw 'both async and sync fetching of the wasm failed'
								}
								function we(e) {
									if (!Ue && (O || Pe)) {
										if (typeof fetch == 'function' && !e.startsWith('file://'))
											return fetch(e, { credentials: 'same-origin' })
												.then(t => {
													if (!t.ok) throw "failed to load wasm binary file at '" + e + "'"
													return t.arrayBuffer()
												})
												.catch(() => Ee(e))
										if (qe)
											return new Promise((t, n) => {
												qe(e, i => t(new Uint8Array(i)), n)
											})
									}
									return Promise.resolve().then(() => Ee(e))
								}
								function et(e, t, n) {
									return we(e)
										.then(i => WebAssembly.instantiate(i, t))
										.then(i => i)
										.then(n, i => {
											he('failed to asynchronously prepare wasm: ' + i), I(i)
										})
								}
								function je(e, t) {
									var n = G
									return Ue || typeof WebAssembly.instantiateStreaming != 'function' || F(n) || n.startsWith('file://') || typeof fetch != 'function'
										? et(n, e, t)
										: fetch(n, { credentials: 'same-origin' }).then(i =>
												WebAssembly.instantiateStreaming(i, e).then(t, function (o) {
													return he('wasm streaming compile failed: ' + o), he('falling back to ArrayBuffer instantiation'), et(n, e, t)
												})
											)
								}
								var Me,
									pt,
									xt = {
										447260: (e, t, n, i, o) => {
											if (typeof window > 'u' || (window.AudioContext || window.webkitAudioContext) === void 0) return 0
											if (typeof window.h > 'u') {
												;(window.h = { Aa: 0 }),
													(window.h.I = {}),
													(window.h.I.ya = e),
													(window.h.I.capture = t),
													(window.h.I.La = n),
													(window.h.ga = {}),
													(window.h.ga.stopped = i),
													(window.h.ga.xb = o)
												let s = window.h
												;(s.D = []),
													(s.yc = function (c) {
														for (var p = 0; p < s.D.length; ++p) if (s.D[p] == null) return (s.D[p] = c), p
														return s.D.push(c), s.D.length - 1
													}),
													(s.Cb = function (c) {
														for (s.D[c] = null; 0 < s.D.length && s.D[s.D.length - 1] == null; ) s.D.pop()
													}),
													(s.Sc = function (c) {
														for (var p = 0; p < s.D.length; ++p) if (s.D[p] == c) return s.Cb(p)
													}),
													(s.ra = function (c) {
														return s.D[c]
													}),
													(s.Bb = ['touchend', 'click']),
													(s.unlock = function () {
														for (var c = 0; c < s.D.length; ++c) {
															var p = s.D[c]
															p != null &&
																p.J != null &&
																p.state === s.ga.xb &&
																p.J.resume().then(
																	() => {
																		hr(p.pb)
																	},
																	v => {
																		console.error('Failed to resume audiocontext', v)
																	}
																)
														}
														s.Bb.map(function (v) {
															document.removeEventListener(v, s.unlock, !0)
														})
													}),
													s.Bb.map(function (c) {
														document.addEventListener(c, s.unlock, !0)
													})
											}
											return (window.h.Aa += 1), 1
										},
										449438: () => {
											typeof window.h < 'u' && (--window.h.Aa, window.h.Aa === 0 && delete window.h)
										},
										449602: () => navigator.mediaDevices !== void 0 && navigator.mediaDevices.getUserMedia !== void 0,
										449706: () => {
											try {
												var e = new (window.AudioContext || window.webkitAudioContext)(),
													t = e.sampleRate
												return e.close(), t
											} catch {
												return 0
											}
										},
										449877: (e, t, n, i, o, s) => {
											if (typeof window.h > 'u') return -1
											var c = {},
												p = {}
											return (
												e == window.h.I.ya && n != 0 && (p.sampleRate = n),
												(c.J = new (window.AudioContext || window.webkitAudioContext)(p)),
												c.J.suspend(),
												(c.state = window.h.ga.stopped),
												(n = 0),
												e != window.h.I.ya && (n = t),
												(c.Z = c.J.createScriptProcessor(i, n, t)),
												(c.Z.onaudioprocess = function (v) {
													if (((c.sa == null || c.sa.length == 0) && (c.sa = new Float32Array(We.buffer, o, i * t)), e == window.h.I.capture || e == window.h.I.La)) {
														for (var h = 0; h < t; h += 1) for (var _ = v.inputBuffer.getChannelData(h), A = c.sa, E = 0; E < i; E += 1) A[E * t + h] = _[E]
														dr(s, i, o)
													}
													if (e == window.h.I.ya || e == window.h.I.La)
														for (pr(s, i, o), h = 0; h < v.outputBuffer.numberOfChannels; ++h) for (_ = v.outputBuffer.getChannelData(h), A = c.sa, E = 0; E < i; E += 1) _[E] = A[E * t + h]
													else for (h = 0; h < v.outputBuffer.numberOfChannels; ++h) v.outputBuffer.getChannelData(h).fill(0)
												}),
												(e != window.h.I.capture && e != window.h.I.La) ||
													navigator.mediaDevices
														.getUserMedia({ audio: !0, video: !1 })
														.then(function (v) {
															;(c.Da = c.J.createMediaStreamSource(v)), c.Da.connect(c.Z), c.Z.connect(c.J.destination)
														})
														.catch(function (v) {
															console.log('Failed to get user media: ' + v)
														}),
												e == window.h.I.ya && c.Z.connect(c.J.destination),
												(c.pb = s),
												window.h.yc(c)
											)
										},
										452754: e => window.h.ra(e).J.sampleRate,
										452827: e => {
											;(e = window.h.ra(e)),
												e.Z !== void 0 && ((e.Z.onaudioprocess = function () {}), e.Z.disconnect(), (e.Z = void 0)),
												e.Da !== void 0 && (e.Da.disconnect(), (e.Da = void 0)),
												e.J.close(),
												(e.J = void 0),
												(e.pb = void 0)
										},
										453227: e => {
											window.h.Cb(e)
										},
										453277: e => {
											;(e = window.h.ra(e)), e.J.resume(), (e.state = window.h.ga.xb)
										},
										453416: e => {
											;(e = window.h.ra(e)), e.J.suspend(), (e.state = window.h.ga.stopped)
										},
									},
									vt = e => {
										for (; 0 < e.length; ) e.shift()(l)
									},
									mt = (e, t) => {
										for (var n = 0, i = e.length - 1; 0 <= i; i--) {
											var o = e[i]
											o === '.' ? e.splice(i, 1) : o === '..' ? (e.splice(i, 1), n++) : n && (e.splice(i, 1), n--)
										}
										if (t) for (; n; n--) e.unshift('..')
										return e
									},
									xe = e => {
										var t = e.charAt(0) === '/',
											n = e.substr(-1) === '/'
										return (
											(e = mt(
												e.split('/').filter(i => !!i),
												!t
											).join('/')) ||
												t ||
												(e = '.'),
											e && n && (e += '/'),
											(t ? '/' : '') + e
										)
									},
									At = e => {
										var t = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(e).slice(1)
										return (e = t[0]), (t = t[1]), !e && !t ? '.' : (t && (t = t.substr(0, t.length - 1)), e + t)
									},
									ke = e => {
										if (e === '/') return '/'
										;(e = xe(e)), (e = e.replace(/\/$/, ''))
										var t = e.lastIndexOf('/')
										return t === -1 ? e : e.substr(t + 1)
									},
									Cr = () => {
										if (typeof crypto == 'object' && typeof crypto.getRandomValues == 'function') return e => crypto.getRandomValues(e)
										I('initRandomDevice')
									},
									Cn = e => (Cn = Cr())(e)
								function It() {
									for (var e = '', t = !1, n = arguments.length - 1; -1 <= n && !t; n--) {
										if (((t = 0 <= n ? arguments[n] : '/'), typeof t != 'string')) throw new TypeError('Arguments to path.resolve must be strings')
										if (!t) return ''
										;(e = t + '/' + e), (t = t.charAt(0) === '/')
									}
									return (
										(e = mt(
											e.split('/').filter(i => !!i),
											!t
										).join('/')),
										(t ? '/' : '') + e || '.'
									)
								}
								var En = typeof TextDecoder < 'u' ? new TextDecoder('utf8') : void 0,
									tt = (e, t, n) => {
										var i = t + n
										for (n = t; e[n] && !(n >= i); ) ++n
										if (16 < n - t && e.buffer && En) return En.decode(e.subarray(t, n))
										for (i = ''; t < n; ) {
											var o = e[t++]
											if (o & 128) {
												var s = e[t++] & 63
												if ((o & 224) == 192) i += String.fromCharCode(((o & 31) << 6) | s)
												else {
													var c = e[t++] & 63
													;(o = (o & 240) == 224 ? ((o & 15) << 12) | (s << 6) | c : ((o & 7) << 18) | (s << 12) | (c << 6) | (e[t++] & 63)),
														65536 > o ? (i += String.fromCharCode(o)) : ((o -= 65536), (i += String.fromCharCode(55296 | (o >> 10), 56320 | (o & 1023))))
												}
											} else i += String.fromCharCode(o)
										}
										return i
									},
									an = [],
									Pn = e => {
										for (var t = 0, n = 0; n < e.length; ++n) {
											var i = e.charCodeAt(n)
											127 >= i ? t++ : 2047 >= i ? (t += 2) : 55296 <= i && 57343 >= i ? ((t += 4), ++n) : (t += 3)
										}
										return t
									},
									Tn = (e, t, n, i) => {
										if (!(0 < i)) return 0
										var o = n
										i = n + i - 1
										for (var s = 0; s < e.length; ++s) {
											var c = e.charCodeAt(s)
											if (55296 <= c && 57343 >= c) {
												var p = e.charCodeAt(++s)
												c = (65536 + ((c & 1023) << 10)) | (p & 1023)
											}
											if (127 >= c) {
												if (n >= i) break
												t[n++] = c
											} else {
												if (2047 >= c) {
													if (n + 1 >= i) break
													t[n++] = 192 | (c >> 6)
												} else {
													if (65535 >= c) {
														if (n + 2 >= i) break
														t[n++] = 224 | (c >> 12)
													} else {
														if (n + 3 >= i) break
														;(t[n++] = 240 | (c >> 18)), (t[n++] = 128 | ((c >> 12) & 63))
													}
													t[n++] = 128 | ((c >> 6) & 63)
												}
												t[n++] = 128 | (c & 63)
											}
										}
										return (t[n] = 0), n - o
									}
								function Ln(e, t) {
									var n = Array(Pn(e) + 1)
									return (e = Tn(e, n, 0, n.length)), t && (n.length = e), n
								}
								var Mn = []
								function Fn(e, t) {
									;(Mn[e] = { input: [], F: [], V: t }), cn(e, Er)
								}
								var Er = {
										open: function (e) {
											var t = Mn[e.node.za]
											if (!t) throw new T(43)
											;(e.s = t), (e.seekable = !1)
										},
										close: function (e) {
											e.s.V.qa(e.s)
										},
										qa: function (e) {
											e.s.V.qa(e.s)
										},
										read: function (e, t, n, i) {
											if (!e.s || !e.s.V.ib) throw new T(60)
											for (var o = 0, s = 0; s < i; s++) {
												try {
													var c = e.s.V.ib(e.s)
												} catch {
													throw new T(29)
												}
												if (c === void 0 && o === 0) throw new T(6)
												if (c == null) break
												o++, (t[n + s] = c)
											}
											return o && (e.node.timestamp = Date.now()), o
										},
										write: function (e, t, n, i) {
											if (!e.s || !e.s.V.Oa) throw new T(60)
											try {
												for (var o = 0; o < i; o++) e.s.V.Oa(e.s, t[n + o])
											} catch {
												throw new T(29)
											}
											return i && (e.node.timestamp = Date.now()), o
										},
									},
									Pr = {
										ib: function () {
											e: {
												if (!an.length) {
													var e = null
													if (
														(typeof window < 'u' && typeof window.prompt == 'function'
															? ((e = window.prompt('Input: ')),
																e !== null &&
																	(e += `
`))
															: typeof readline == 'function' &&
																((e = readline()),
																e !== null &&
																	(e += `
`)),
														!e)
													) {
														e = null
														break e
													}
													an = Ln(e, !0)
												}
												e = an.shift()
											}
											return e
										},
										Oa: function (e, t) {
											t === null || t === 10 ? (Le(tt(e.F, 0)), (e.F = [])) : t != 0 && e.F.push(t)
										},
										qa: function (e) {
											e.F && 0 < e.F.length && (Le(tt(e.F, 0)), (e.F = []))
										},
										bc: function () {
											return { Fc: 25856, Hc: 5, Ec: 191, Gc: 35387, Dc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
										},
										cc: function () {
											return 0
										},
										dc: function () {
											return [24, 80]
										},
									},
									Tr = {
										Oa: function (e, t) {
											t === null || t === 10 ? (he(tt(e.F, 0)), (e.F = [])) : t != 0 && e.F.push(t)
										},
										qa: function (e) {
											e.F && 0 < e.F.length && (he(tt(e.F, 0)), (e.F = []))
										},
									}
								function Sn(e, t) {
									var n = e.j ? e.j.length : 0
									n >= t ||
										((t = Math.max(t, (n * (1048576 > n ? 2 : 1.125)) >>> 0)), n != 0 && (t = Math.max(t, 256)), (n = e.j), (e.j = new Uint8Array(t)), 0 < e.v && e.j.set(n.subarray(0, e.v), 0))
								}
								var U = {
									O: null,
									U() {
										return U.createNode(null, '/', 16895, 0)
									},
									createNode(e, t, n, i) {
										if ((n & 61440) === 24576 || (n & 61440) === 4096) throw new T(63)
										return (
											U.O ||
												(U.O = {
													dir: { node: { Y: U.l.Y, P: U.l.P, ka: U.l.ka, va: U.l.va, ub: U.l.ub, Ab: U.l.Ab, vb: U.l.vb, sb: U.l.sb, Ea: U.l.Ea }, stream: { ba: U.m.ba } },
													file: { node: { Y: U.l.Y, P: U.l.P }, stream: { ba: U.m.ba, read: U.m.read, write: U.m.write, pa: U.m.pa, lb: U.m.lb, nb: U.m.nb } },
													link: { node: { Y: U.l.Y, P: U.l.P, ma: U.l.ma }, stream: {} },
													$a: { node: { Y: U.l.Y, P: U.l.P }, stream: Sr },
												}),
											(n = Dn(e, t, n, i)),
											(n.mode & 61440) === 16384
												? ((n.l = U.O.dir.node), (n.m = U.O.dir.stream), (n.j = {}))
												: (n.mode & 61440) === 32768
													? ((n.l = U.O.file.node), (n.m = U.O.file.stream), (n.v = 0), (n.j = null))
													: (n.mode & 61440) === 40960
														? ((n.l = U.O.link.node), (n.m = U.O.link.stream))
														: (n.mode & 61440) === 8192 && ((n.l = U.O.$a.node), (n.m = U.O.$a.stream)),
											(n.timestamp = Date.now()),
											e && ((e.j[t] = n), (e.timestamp = n.timestamp)),
											n
										)
									},
									Kc(e) {
										return e.j ? (e.j.subarray ? e.j.subarray(0, e.v) : new Uint8Array(e.j)) : new Uint8Array(0)
									},
									l: {
										Y(e) {
											var t = {}
											return (
												(t.Jc = (e.mode & 61440) === 8192 ? e.id : 1),
												(t.Mc = e.id),
												(t.mode = e.mode),
												(t.Oc = 1),
												(t.uid = 0),
												(t.Lc = 0),
												(t.za = e.za),
												(e.mode & 61440) === 16384 ? (t.size = 4096) : (e.mode & 61440) === 32768 ? (t.size = e.v) : (e.mode & 61440) === 40960 ? (t.size = e.link.length) : (t.size = 0),
												(t.Bc = new Date(e.timestamp)),
												(t.Nc = new Date(e.timestamp)),
												(t.Ic = new Date(e.timestamp)),
												(t.Jb = 4096),
												(t.Cc = Math.ceil(t.size / t.Jb)),
												t
											)
										},
										P(e, t) {
											if ((t.mode !== void 0 && (e.mode = t.mode), t.timestamp !== void 0 && (e.timestamp = t.timestamp), t.size !== void 0 && ((t = t.size), e.v != t)))
												if (t == 0) (e.j = null), (e.v = 0)
												else {
													var n = e.j
													;(e.j = new Uint8Array(t)), n && e.j.set(n.subarray(0, Math.min(t, e.v))), (e.v = t)
												}
										},
										ka() {
											throw un[44]
										},
										va(e, t, n, i) {
											return U.createNode(e, t, n, i)
										},
										ub(e, t, n) {
											if ((e.mode & 61440) === 16384) {
												try {
													var i = Ut(t, n)
												} catch {}
												if (i) for (var o in i.j) throw new T(55)
											}
											delete e.parent.j[e.name], (e.parent.timestamp = Date.now()), (e.name = n), (t.j[n] = e), (t.timestamp = e.parent.timestamp), (e.parent = t)
										},
										Ab(e, t) {
											delete e.j[t], (e.timestamp = Date.now())
										},
										vb(e, t) {
											var n = Ut(e, t),
												i
											for (i in n.j) throw new T(55)
											delete e.j[t], (e.timestamp = Date.now())
										},
										sb(e) {
											var t = ['.', '..'],
												n
											for (n in e.j) e.j.hasOwnProperty(n) && t.push(n)
											return t
										},
										Ea(e, t, n) {
											return (e = U.createNode(e, t, 41471, 0)), (e.link = n), e
										},
										ma(e) {
											if ((e.mode & 61440) !== 40960) throw new T(28)
											return e.link
										},
									},
									m: {
										read(e, t, n, i, o) {
											var s = e.node.j
											if (o >= e.node.v) return 0
											if (((e = Math.min(e.node.v - o, i)), 8 < e && s.subarray)) t.set(s.subarray(o, o + e), n)
											else for (i = 0; i < e; i++) t[n + i] = s[o + i]
											return e
										},
										write(e, t, n, i, o, s) {
											if ((t.buffer === de.buffer && (s = !1), !i)) return 0
											if (((e = e.node), (e.timestamp = Date.now()), t.subarray && (!e.j || e.j.subarray))) {
												if (s) return (e.j = t.subarray(n, n + i)), (e.v = i)
												if (e.v === 0 && o === 0) return (e.j = t.slice(n, n + i)), (e.v = i)
												if (o + i <= e.v) return e.j.set(t.subarray(n, n + i), o), i
											}
											if ((Sn(e, o + i), e.j.subarray && t.subarray)) e.j.set(t.subarray(n, n + i), o)
											else for (s = 0; s < i; s++) e.j[o + s] = t[n + s]
											return (e.v = Math.max(e.v, o + i)), i
										},
										ba(e, t, n) {
											if ((n === 1 ? (t += e.position) : n === 2 && (e.node.mode & 61440) === 32768 && (t += e.node.v), 0 > t)) throw new T(28)
											return t
										},
										pa(e, t, n) {
											Sn(e.node, t + n), (e.node.v = Math.max(e.node.v, t + n))
										},
										lb(e, t, n, i, o) {
											if ((e.node.mode & 61440) !== 32768) throw new T(43)
											if (((e = e.node.j), o & 2 || e.buffer !== de.buffer)) {
												if (((0 < n || n + t < e.length) && (e.subarray ? (e = e.subarray(n, n + t)) : (e = Array.prototype.slice.call(e, n, n + t))), (n = !0), I(), (t = void 0), !t)) throw new T(48)
												de.set(e, t)
											} else (n = !1), (t = e.byteOffset)
											return { o: t, M: n }
										},
										nb(e, t, n, i) {
											return U.m.write(e, t, 0, i, n, !1), 0
										},
									},
								}
								function Lr(e, t) {
									var n = 0
									return e && (n |= 365), t && (n |= 146), n
								}
								var sn = null,
									On = {},
									Dt = [],
									Mr = 1,
									Rt = null,
									jn = !0,
									T = null,
									un = {},
									at = (e, t = {}) => {
										if (((e = It(e)), !e)) return { path: '', node: null }
										if (((t = Object.assign({ gb: !0, Qa: 0 }, t)), 8 < t.Qa)) throw new T(32)
										e = e.split('/').filter(c => !!c)
										for (var n = sn, i = '/', o = 0; o < e.length; o++) {
											var s = o === e.length - 1
											if (s && t.parent) break
											if (((n = Ut(n, e[o])), (i = xe(i + '/' + e[o])), n.wa && (!s || (s && t.gb)) && (n = n.wa.root), !s || t.fb)) {
												for (s = 0; (n.mode & 61440) === 40960; ) if (((n = Or(i)), (i = It(At(i), n)), (n = at(i, { Qa: t.Qa + 1 }).node), 40 < s++)) throw new T(32)
											}
										}
										return { path: i, node: n }
									},
									xn = e => {
										for (var t; ; ) {
											if (e === e.parent) return (e = e.U.mb), t ? (e[e.length - 1] !== '/' ? `${e}/${t}` : e + t) : e
											;(t = t ? `${e.name}/${t}` : e.name), (e = e.parent)
										}
									},
									In = (e, t) => {
										for (var n = 0, i = 0; i < t.length; i++) n = ((n << 5) - n + t.charCodeAt(i)) | 0
										return ((e + n) >>> 0) % Rt.length
									},
									Ut = (e, t) => {
										var n
										if ((n = (n = Wt(e, 'x')) ? n : e.l.ka ? 0 : 2)) throw new T(n, e)
										for (n = Rt[In(e.id, t)]; n; n = n.lc) {
											var i = n.name
											if (n.parent.id === e.id && i === t) return n
										}
										return e.l.ka(e, t)
									},
									Dn = (e, t, n, i) => ((e = new cr(e, t, n, i)), (t = In(e.parent.id, e.name)), (e.lc = Rt[t]), (Rt[t] = e)),
									Un = e => {
										var t = ['r', 'w', 'rw'][e & 3]
										return e & 512 && (t += 'w'), t
									},
									Wt = (e, t) => {
										if (jn) return 0
										if (!t.includes('r') || e.mode & 292) {
											if ((t.includes('w') && !(e.mode & 146)) || (t.includes('x') && !(e.mode & 73))) return 2
										} else return 2
										return 0
									},
									Wn = (e, t) => {
										try {
											return Ut(e, t), 20
										} catch {}
										return Wt(e, 'wx')
									},
									Fr = () => {
										for (var e = 0; 4096 >= e; e++) if (!Dt[e]) return e
										throw new T(33)
									},
									nt = e => {
										if (((e = Dt[e]), !e)) throw new T(8)
										return e
									},
									Bn = (e, t = -1) => (
										Et ||
											((Et = function () {
												this.h = {}
											}),
											(Et.prototype = {}),
											Object.defineProperties(Et.prototype, {
												object: {
													get() {
														return this.node
													},
													set(n) {
														this.node = n
													},
												},
												flags: {
													get() {
														return this.h.flags
													},
													set(n) {
														this.h.flags = n
													},
												},
												position: {
													get() {
														return this.h.position
													},
													set(n) {
														this.h.position = n
													},
												},
											})),
										(e = Object.assign(new Et(), e)),
										t == -1 && (t = Fr()),
										(e.X = t),
										(Dt[t] = e)
									),
									Sr = {
										open: e => {
											;(e.m = On[e.node.za].m), e.m.open && e.m.open(e)
										},
										ba: () => {
											throw new T(70)
										},
									},
									cn = (e, t) => {
										On[e] = { m: t }
									},
									Nn = (e, t) => {
										var n = t === '/',
											i = !t
										if (n && sn) throw new T(10)
										if (!n && !i) {
											var o = at(t, { gb: !1 })
											if (((t = o.path), (o = o.node), o.wa)) throw new T(10)
											if ((o.mode & 61440) !== 16384) throw new T(54)
										}
										;(t = { type: e, Qc: {}, mb: t, kc: [] }), (e = e.U(t)), (e.U = t), (t.root = e), n ? (sn = e) : o && ((o.wa = t), o.U && o.U.kc.push(t))
									},
									Ie = (e, t, n) => {
										var i = at(e, { parent: !0 }).node
										if (((e = ke(e)), !e || e === '.' || e === '..')) throw new T(28)
										var o = Wn(i, e)
										if (o) throw new T(o)
										if (!i.l.va) throw new T(63)
										return i.l.va(i, e, t, n)
									},
									Bt = (e, t, n) => {
										typeof n > 'u' && ((n = t), (t = 438)), Ie(e, t | 8192, n)
									},
									ln = (e, t) => {
										if (!It(e)) throw new T(44)
										var n = at(t, { parent: !0 }).node
										if (!n) throw new T(44)
										t = ke(t)
										var i = Wn(n, t)
										if (i) throw new T(i)
										if (!n.l.Ea) throw new T(63)
										n.l.Ea(n, t, e)
									},
									Or = e => {
										if (((e = at(e).node), !e)) throw new T(44)
										if (!e.l.ma) throw new T(28)
										return It(xn(e.parent), e.l.ma(e))
									},
									Nt = (e, t, n) => {
										if (e === '') throw new T(44)
										if (typeof t == 'string') {
											var i = { r: 0, 'r+': 2, w: 577, 'w+': 578, a: 1089, 'a+': 1090 }[t]
											if (typeof i > 'u') throw Error(`Unknown file open mode: ${t}`)
											t = i
										}
										if (((n = t & 64 ? ((typeof n > 'u' ? 438 : n) & 4095) | 32768 : 0), typeof e == 'object')) var o = e
										else {
											e = xe(e)
											try {
												o = at(e, { fb: !(t & 131072) }).node
											} catch {}
										}
										if (((i = !1), t & 64))
											if (o) {
												if (t & 128) throw new T(20)
											} else (o = Ie(e, n, 0)), (i = !0)
										if (!o) throw new T(44)
										if (((o.mode & 61440) === 8192 && (t &= -513), t & 65536 && (o.mode & 61440) !== 16384)) throw new T(54)
										if (!i && (n = o ? ((o.mode & 61440) === 40960 ? 32 : (o.mode & 61440) === 16384 && (Un(t) !== 'r' || t & 512) ? 31 : Wt(o, Un(t))) : 44)) throw new T(n)
										if (t & 512 && !i) {
											if (((n = o), (n = typeof n == 'string' ? at(n, { fb: !0 }).node : n), !n.l.P)) throw new T(63)
											if ((n.mode & 61440) === 16384) throw new T(31)
											if ((n.mode & 61440) !== 32768) throw new T(28)
											if ((i = Wt(n, 'w'))) throw new T(i)
											n.l.P(n, { size: 0, timestamp: Date.now() })
										}
										return (
											(t &= -131713),
											(o = Bn({ node: o, path: xn(o), flags: t, seekable: !0, position: 0, m: o.m, zc: [], error: !1 })),
											o.m.open && o.m.open(o),
											!l.logReadFiles || t & 1 || ($t || ($t = {}), e in $t || ($t[e] = 1)),
											o
										)
									},
									$n = (e, t, n) => {
										if (e.X === null) throw new T(8)
										if (!e.seekable || !e.m.ba) throw new T(70)
										if (n != 0 && n != 1 && n != 2) throw new T(28)
										;(e.position = e.m.ba(e, t, n)), (e.zc = [])
									},
									Yn = () => {
										T ||
											((T = function (e, t) {
												;(this.name = 'ErrnoError'),
													(this.node = t),
													(this.pc = function (n) {
														this.aa = n
													}),
													this.pc(e),
													(this.message = 'FS error')
											}),
											(T.prototype = Error()),
											(T.prototype.constructor = T),
											[44].forEach(e => {
												;(un[e] = new T(e)), (un[e].stack = '<generic error, no stack>')
											}))
									},
									zn,
									Ct = (e, t, n) => {
										e = xe('/dev/' + e)
										var i = Lr(!!t, !!n)
										fn || (fn = 64)
										var o = (fn++ << 8) | 0
										cn(o, {
											open: s => {
												s.seekable = !1
											},
											close: () => {
												n && n.buffer && n.buffer.length && n(10)
											},
											read: (s, c, p, v) => {
												for (var h = 0, _ = 0; _ < v; _++) {
													try {
														var A = t()
													} catch {
														throw new T(29)
													}
													if (A === void 0 && h === 0) throw new T(6)
													if (A == null) break
													h++, (c[p + _] = A)
												}
												return h && (s.node.timestamp = Date.now()), h
											},
											write: (s, c, p, v) => {
												for (var h = 0; h < v; h++)
													try {
														n(c[p + h])
													} catch {
														throw new T(29)
													}
												return v && (s.node.timestamp = Date.now()), h
											},
										}),
											Bt(e, i, o)
									},
									fn,
									st = {},
									Et,
									$t,
									Pt = void 0
								function Ve() {
									return (Pt += 4), Y[(Pt - 4) >> 2]
								}
								function Hn(e) {
									if (e === void 0) return '_unknown'
									e = e.replace(/[^a-zA-Z0-9_]/g, '$')
									var t = e.charCodeAt(0)
									return 48 <= t && 57 >= t ? `_${e}` : e
								}
								function Yt(e, t) {
									return (
										(e = Hn(e)),
										{
											[e]: function () {
												return t.apply(this, arguments)
											},
										}[e]
									)
								}
								function Xn() {
									;(this.M = [void 0]), (this.hb = [])
								}
								var Fe = new Xn(),
									gt = void 0
								function x(e) {
									throw new gt(e)
								}
								var De = e => (e || x('Cannot use deleted val. handle = ' + e), Fe.get(e).value),
									Be = e => {
										switch (e) {
											case void 0:
												return 1
											case null:
												return 2
											case !0:
												return 3
											case !1:
												return 4
											default:
												return Fe.pa({ tb: 1, value: e })
										}
									}
								function kn(e) {
									var t = Error,
										n = Yt(e, function (i) {
											;(this.name = e),
												(this.message = i),
												(i = Error(i).stack),
												i !== void 0 &&
													(this.stack =
														this.toString() +
														`
` +
														i.replace(/^Error(:[^\n]*)?\n/, ''))
										})
									return (
										(n.prototype = Object.create(t.prototype)),
										(n.prototype.constructor = n),
										(n.prototype.toString = function () {
											return this.message === void 0 ? this.name : `${this.name}: ${this.message}`
										}),
										n
									)
								}
								var Vn = void 0,
									Gn = void 0
								function ue(e) {
									for (var t = ''; ie[e]; ) t += Gn[ie[e++]]
									return t
								}
								var Tt = []
								function hn() {
									for (; Tt.length; ) {
										var e = Tt.pop()
										;(e.g.fa = !1), e.delete()
									}
								}
								var Lt = void 0,
									Ge = {}
								function dn(e, t) {
									for (t === void 0 && x('ptr should not be undefined'); e.A; ) (t = e.na(t)), (e = e.A)
									return t
								}
								var ut = {}
								function Kn(e) {
									e = mr(e)
									var t = ue(e)
									return Je(e), t
								}
								function Mt(e, t) {
									var n = ut[e]
									return n === void 0 && x(t + ' has unknown type ' + Kn(e)), n
								}
								function zt() {}
								var pn = !1
								function Zn(e) {
									--e.count.value, e.count.value === 0 && (e.G ? e.L.W(e.G) : e.u.i.W(e.o))
								}
								function Jn(e, t, n) {
									return t === n ? e : n.A === void 0 ? null : ((e = Jn(e, t, n.A)), e === null ? null : n.Pb(e))
								}
								var Qn = {}
								function jr(e, t) {
									return (t = dn(e, t)), Ge[t]
								}
								var qn = void 0
								function Ht(e) {
									throw new qn(e)
								}
								function Xt(e, t) {
									return (
										(t.u && t.o) || Ht('makeClassHandle requires ptr and ptrType'),
										!!t.L != !!t.G && Ht('Both smartPtrType and smartPtr must be specified'),
										(t.count = { value: 1 }),
										yt(Object.create(e, { g: { value: t } }))
									)
								}
								function yt(e) {
									return typeof FinalizationRegistry > 'u'
										? ((yt = t => t), e)
										: ((pn = new FinalizationRegistry(t => {
												Zn(t.g)
											})),
											(yt = t => {
												var n = t.g
												return n.G && pn.register(t, { g: n }, t), t
											}),
											(zt = t => {
												pn.unregister(t)
											}),
											yt(e))
								}
								var kt = {}
								function Ft(e) {
									for (; e.length; ) {
										var t = e.pop()
										e.pop()(t)
									}
								}
								function St(e) {
									return this.fromWireType(Y[e >> 2])
								}
								var wt = {},
									Vt = {}
								function Te(e, t, n) {
									function i(p) {
										;(p = n(p)), p.length !== e.length && Ht('Mismatched type converter count')
										for (var v = 0; v < e.length; ++v) Ne(e[v], p[v])
									}
									e.forEach(function (p) {
										Vt[p] = t
									})
									var o = Array(t.length),
										s = [],
										c = 0
									t.forEach((p, v) => {
										ut.hasOwnProperty(p)
											? (o[v] = ut[p])
											: (s.push(p),
												wt.hasOwnProperty(p) || (wt[p] = []),
												wt[p].push(() => {
													;(o[v] = ut[p]), ++c, c === s.length && i(o)
												}))
									}),
										s.length === 0 && i(o)
								}
								function Gt(e) {
									switch (e) {
										case 1:
											return 0
										case 2:
											return 1
										case 4:
											return 2
										case 8:
											return 3
										default:
											throw new TypeError(`Unknown type size: ${e}`)
									}
								}
								function xr(e, t, n = {}) {
									var i = t.name
									if ((e || x(`type "${i}" must have a positive integer typeid pointer`), ut.hasOwnProperty(e))) {
										if (n.$b) return
										x(`Cannot register type '${i}' twice`)
									}
									;(ut[e] = t), delete Vt[e], wt.hasOwnProperty(e) && ((t = wt[e]), delete wt[e], t.forEach(o => o()))
								}
								function Ne(e, t, n = {}) {
									if (!('argPackAdvance' in t)) throw new TypeError('registerType registeredInstance requires argPackAdvance')
									xr(e, t, n)
								}
								function vn(e) {
									x(e.g.u.i.name + ' instance already deleted')
								}
								function rt() {}
								function mn(e, t, n) {
									if (e[t].B === void 0) {
										var i = e[t]
										;(e[t] = function () {
											return (
												e[t].B.hasOwnProperty(arguments.length) || x(`Function '${n}' called with an invalid number of arguments (${arguments.length}) - expects one of (${e[t].B})!`),
												e[t].B[arguments.length].apply(this, arguments)
											)
										}),
											(e[t].B = []),
											(e[t].B[i.ea] = i)
									}
								}
								function gn(e, t, n) {
									l.hasOwnProperty(e)
										? ((n === void 0 || (l[e].B !== void 0 && l[e].B[n] !== void 0)) && x(`Cannot register public name '${e}' twice`),
											mn(l, e, e),
											l.hasOwnProperty(n) && x(`Cannot register multiple overloads of a function with the same number of arguments (${n})!`),
											(l[e].B[n] = t))
										: ((l[e] = t), n !== void 0 && (l[e].Pc = n))
								}
								function Ir(e, t, n, i, o, s, c, p) {
									;(this.name = e), (this.constructor = t), (this.N = n), (this.W = i), (this.A = o), (this.Ub = s), (this.na = c), (this.Pb = p), (this.qb = [])
								}
								function Kt(e, t, n) {
									for (; t !== n; ) t.na || x(`Expected null or instance of ${n.name}, got an instance of ${t.name}`), (e = t.na(e)), (t = t.A)
									return e
								}
								function Dr(e, t) {
									return t === null
										? (this.Na && x(`null is not a valid ${this.name}`), 0)
										: (t.g || x(`Cannot pass "${wn(t)}" as a ${this.name}`), t.g.o || x(`Cannot pass deleted object as a pointer of type ${this.name}`), Kt(t.g.o, t.g.u.i, this.i))
								}
								function Ur(e, t) {
									if (t === null) {
										if ((this.Na && x(`null is not a valid ${this.name}`), this.ua)) {
											var n = this.Pa()
											return e !== null && e.push(this.W, n), n
										}
										return 0
									}
									if (
										(t.g || x(`Cannot pass "${wn(t)}" as a ${this.name}`),
										t.g.o || x(`Cannot pass deleted object as a pointer of type ${this.name}`),
										!this.ta && t.g.u.ta && x(`Cannot convert argument of type ${t.g.L ? t.g.L.name : t.g.u.name} to parameter type ${this.name}`),
										(n = Kt(t.g.o, t.g.u.i, this.i)),
										this.ua)
									)
										switch ((t.g.G === void 0 && x('Passing raw pointer to smart pointer is illegal'), this.tc)) {
											case 0:
												t.g.L === this ? (n = t.g.G) : x(`Cannot convert argument of type ${t.g.L ? t.g.L.name : t.g.u.name} to parameter type ${this.name}`)
												break
											case 1:
												n = t.g.G
												break
											case 2:
												if (t.g.L === this) n = t.g.G
												else {
													var i = t.clone()
													;(n = this.oc(
														n,
														Be(function () {
															i.delete()
														})
													)),
														e !== null && e.push(this.W, n)
												}
												break
											default:
												x('Unsupporting sharing policy')
										}
									return n
								}
								function Wr(e, t) {
									return t === null
										? (this.Na && x(`null is not a valid ${this.name}`), 0)
										: (t.g || x(`Cannot pass "${wn(t)}" as a ${this.name}`),
											t.g.o || x(`Cannot pass deleted object as a pointer of type ${this.name}`),
											t.g.u.ta && x(`Cannot convert argument of type ${t.g.u.name} to parameter type ${this.name}`),
											Kt(t.g.o, t.g.u.i, this.i))
								}
								function Ke(e, t, n, i) {
									;(this.name = e),
										(this.i = t),
										(this.Na = n),
										(this.ta = i),
										(this.ua = !1),
										(this.W = this.oc = this.Pa = this.rb = this.tc = this.nc = void 0),
										t.A !== void 0 ? (this.toWireType = Ur) : ((this.toWireType = i ? Dr : Wr), (this.K = null))
								}
								function er(e, t, n) {
									l.hasOwnProperty(e) || Ht('Replacing nonexistant public symbol'), l[e].B !== void 0 && n !== void 0 ? (l[e].B[n] = t) : ((l[e] = t), (l[e].ea = n))
								}
								var Zt = [],
									tr = e => {
										var t = Zt[e]
										return t || (e >= Zt.length && (Zt.length = e + 1), (Zt[e] = t = r.get(e))), t
									},
									Br = (e, t) => {
										var n = []
										return function () {
											if (((n.length = 0), Object.assign(n, arguments), e.includes('j'))) {
												var i = l['dynCall_' + e]
												i = n && n.length ? i.apply(null, [t].concat(n)) : i.call(null, t)
											} else i = tr(t).apply(null, n)
											return i
										}
									}
								function _e(e, t) {
									e = ue(e)
									var n = e.includes('j') ? Br(e, t) : tr(t)
									return typeof n != 'function' && x(`unknown function pointer with signature ${e}: ${t}`), n
								}
								var nr = void 0
								function Ze(e, t) {
									function n(s) {
										o[s] || ut[s] || (Vt[s] ? Vt[s].forEach(n) : (i.push(s), (o[s] = !0)))
									}
									var i = [],
										o = {}
									throw (t.forEach(n), new nr(`${e}: ` + i.map(Kn).join([', '])))
								}
								function Jt(e, t, n, i, o) {
									var s = t.length
									2 > s && x("argTypes array size mismatch! Must at least get return value and 'this' types!")
									var c = t[1] !== null && n !== null,
										p = !1
									for (n = 1; n < t.length; ++n)
										if (t[n] !== null && t[n].K === void 0) {
											p = !0
											break
										}
									var v = t[0].name !== 'void',
										h = s - 2,
										_ = Array(h),
										A = [],
										E = []
									return function () {
										if ((arguments.length !== h && x(`function ${e} called with ${arguments.length} arguments, expected ${h} args!`), (E.length = 0), (A.length = c ? 2 : 1), (A[0] = o), c)) {
											var f = t[1].toWireType(E, this)
											A[1] = f
										}
										for (var b = 0; b < h; ++b) (_[b] = t[b + 2].toWireType(E, arguments[b])), A.push(_[b])
										if (((b = i.apply(null, A)), p)) Ft(E)
										else
											for (var L = c ? 1 : 2; L < t.length; L++) {
												var R = L === 1 ? f : _[L - 2]
												t[L].K !== null && t[L].K(R)
											}
										return (f = v ? t[0].fromWireType(b) : void 0), f
									}
								}
								function Qt(e, t) {
									for (var n = [], i = 0; i < e; i++) n.push(te[(t + 4 * i) >> 2])
									return n
								}
								function rr(e, t, n) {
									return (
										e instanceof Object || x(`${n} with invalid "this": ${e}`),
										e instanceof t.i.constructor || x(`${n} incompatible with "this" of type ${e.constructor.name}`),
										e.g.o || x(`cannot call emscripten binding method ${n} on deleted object`),
										Kt(e.g.o, e.g.u.i, t.i)
									)
								}
								function yn(e) {
									e >= Fe.h && --Fe.get(e).tb === 0 && Fe.Zb(e)
								}
								function Nr(e, t, n) {
									switch (t) {
										case 0:
											return function (i) {
												return this.fromWireType((n ? de : ie)[i])
											}
										case 1:
											return function (i) {
												return this.fromWireType((n ? be : pe)[i >> 1])
											}
										case 2:
											return function (i) {
												return this.fromWireType((n ? Y : te)[i >> 2])
											}
										default:
											throw new TypeError('Unknown integer type: ' + e)
									}
								}
								function wn(e) {
									if (e === null) return 'null'
									var t = typeof e
									return t === 'object' || t === 'array' || t === 'function' ? e.toString() : '' + e
								}
								function $r(e, t) {
									switch (t) {
										case 2:
											return function (n) {
												return this.fromWireType(We[n >> 2])
											}
										case 3:
											return function (n) {
												return this.fromWireType(Xe[n >> 3])
											}
										default:
											throw new TypeError('Unknown float type: ' + e)
									}
								}
								function Yr(e, t, n) {
									switch (t) {
										case 0:
											return n
												? function (i) {
														return de[i]
													}
												: function (i) {
														return ie[i]
													}
										case 1:
											return n
												? function (i) {
														return be[i >> 1]
													}
												: function (i) {
														return pe[i >> 1]
													}
										case 2:
											return n
												? function (i) {
														return Y[i >> 2]
													}
												: function (i) {
														return te[i >> 2]
													}
										default:
											throw new TypeError('Unknown integer type: ' + e)
									}
								}
								var ir = typeof TextDecoder < 'u' ? new TextDecoder('utf-16le') : void 0,
									zr = (e, t) => {
										for (var n = e >> 1, i = n + t / 2; !(n >= i) && pe[n]; ) ++n
										if (((n <<= 1), 32 < n - e && ir)) return ir.decode(ie.subarray(e, n))
										for (n = '', i = 0; !(i >= t / 2); ++i) {
											var o = be[(e + 2 * i) >> 1]
											if (o == 0) break
											n += String.fromCharCode(o)
										}
										return n
									},
									Hr = (e, t, n) => {
										if ((n === void 0 && (n = 2147483647), 2 > n)) return 0
										n -= 2
										var i = t
										n = n < 2 * e.length ? n / 2 : e.length
										for (var o = 0; o < n; ++o) (be[t >> 1] = e.charCodeAt(o)), (t += 2)
										return (be[t >> 1] = 0), t - i
									},
									Xr = e => 2 * e.length,
									kr = (e, t) => {
										for (var n = 0, i = ''; !(n >= t / 4); ) {
											var o = Y[(e + 4 * n) >> 2]
											if (o == 0) break
											++n, 65536 <= o ? ((o -= 65536), (i += String.fromCharCode(55296 | (o >> 10), 56320 | (o & 1023)))) : (i += String.fromCharCode(o))
										}
										return i
									},
									Vr = (e, t, n) => {
										if ((n === void 0 && (n = 2147483647), 4 > n)) return 0
										var i = t
										n = i + n - 4
										for (var o = 0; o < e.length; ++o) {
											var s = e.charCodeAt(o)
											if (55296 <= s && 57343 >= s) {
												var c = e.charCodeAt(++o)
												s = (65536 + ((s & 1023) << 10)) | (c & 1023)
											}
											if (((Y[t >> 2] = s), (t += 4), t + 4 > n)) break
										}
										return (Y[t >> 2] = 0), t - i
									},
									Gr = e => {
										for (var t = 0, n = 0; n < e.length; ++n) {
											var i = e.charCodeAt(n)
											55296 <= i && 57343 >= i && ++n, (t += 4)
										}
										return t
									},
									Kr = {}
								function qt(e) {
									var t = Kr[e]
									return t === void 0 ? ue(e) : t
								}
								var en = []
								function Zr(e) {
									var t = en.length
									return en.push(e), t
								}
								function Jr(e, t) {
									for (var n = Array(e), i = 0; i < e; ++i) n[i] = Mt(te[(t + 4 * i) >> 2], 'parameter ' + i)
									return n
								}
								var or = [],
									bn = [],
									_n = {},
									ar = () => {
										if (!An) {
											var e = {
													USER: 'web_user',
													LOGNAME: 'web_user',
													PATH: '/',
													PWD: '/',
													HOME: '/home/web_user',
													LANG: ((typeof navigator == 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') + '.UTF-8',
													_: it || './this.program',
												},
												t
											for (t in _n) _n[t] === void 0 ? delete e[t] : (e[t] = _n[t])
											var n = []
											for (t in e) n.push(`${t}=${e[t]}`)
											An = n
										}
										return An
									},
									An,
									tn = e => e % 4 === 0 && (e % 100 !== 0 || e % 400 === 0),
									sr = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
									ur = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
									Qr = (e, t, n, i) => {
										function o(f, b, L) {
											for (f = typeof f == 'number' ? f.toString() : f || ''; f.length < b; ) f = L[0] + f
											return f
										}
										function s(f, b) {
											return o(f, b, '0')
										}
										function c(f, b) {
											function L(K) {
												return 0 > K ? -1 : 0 < K ? 1 : 0
											}
											var R
											return (R = L(f.getFullYear() - b.getFullYear())) === 0 && (R = L(f.getMonth() - b.getMonth())) === 0 && (R = L(f.getDate() - b.getDate())), R
										}
										function p(f) {
											switch (f.getDay()) {
												case 0:
													return new Date(f.getFullYear() - 1, 11, 29)
												case 1:
													return f
												case 2:
													return new Date(f.getFullYear(), 0, 3)
												case 3:
													return new Date(f.getFullYear(), 0, 2)
												case 4:
													return new Date(f.getFullYear(), 0, 1)
												case 5:
													return new Date(f.getFullYear() - 1, 11, 31)
												case 6:
													return new Date(f.getFullYear() - 1, 11, 30)
											}
										}
										function v(f) {
											var b = f.ca
											for (f = new Date(new Date(f.da + 1900, 0, 1).getTime()); 0 < b; ) {
												var L = f.getMonth(),
													R = (tn(f.getFullYear()) ? sr : ur)[L]
												if (b > R - f.getDate()) (b -= R - f.getDate() + 1), f.setDate(1), 11 > L ? f.setMonth(L + 1) : (f.setMonth(0), f.setFullYear(f.getFullYear() + 1))
												else {
													f.setDate(f.getDate() + b)
													break
												}
											}
											return (
												(L = new Date(f.getFullYear() + 1, 0, 4)),
												(b = p(new Date(f.getFullYear(), 0, 4))),
												(L = p(L)),
												0 >= c(b, f) ? (0 >= c(L, f) ? f.getFullYear() + 1 : f.getFullYear()) : f.getFullYear() - 1
											)
										}
										var h = Y[(i + 40) >> 2]
										;(i = {
											wc: Y[i >> 2],
											vc: Y[(i + 4) >> 2],
											Fa: Y[(i + 8) >> 2],
											Sa: Y[(i + 12) >> 2],
											Ga: Y[(i + 16) >> 2],
											da: Y[(i + 20) >> 2],
											R: Y[(i + 24) >> 2],
											ca: Y[(i + 28) >> 2],
											Rc: Y[(i + 32) >> 2],
											uc: Y[(i + 36) >> 2],
											xc: h && h ? tt(ie, h) : '',
										}),
											(n = n ? tt(ie, n) : ''),
											(h = {
												'%c': '%a %b %d %H:%M:%S %Y',
												'%D': '%m/%d/%y',
												'%F': '%Y-%m-%d',
												'%h': '%b',
												'%r': '%I:%M:%S %p',
												'%R': '%H:%M',
												'%T': '%H:%M:%S',
												'%x': '%m/%d/%y',
												'%X': '%H:%M:%S',
												'%Ec': '%c',
												'%EC': '%C',
												'%Ex': '%m/%d/%y',
												'%EX': '%H:%M:%S',
												'%Ey': '%y',
												'%EY': '%Y',
												'%Od': '%d',
												'%Oe': '%e',
												'%OH': '%H',
												'%OI': '%I',
												'%Om': '%m',
												'%OM': '%M',
												'%OS': '%S',
												'%Ou': '%u',
												'%OU': '%U',
												'%OV': '%V',
												'%Ow': '%w',
												'%OW': '%W',
												'%Oy': '%y',
											})
										for (var _ in h) n = n.replace(new RegExp(_, 'g'), h[_])
										var A = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
											E = 'January February March April May June July August September October November December'.split(' ')
										;(h = {
											'%a': f => A[f.R].substring(0, 3),
											'%A': f => A[f.R],
											'%b': f => E[f.Ga].substring(0, 3),
											'%B': f => E[f.Ga],
											'%C': f => s(((f.da + 1900) / 100) | 0, 2),
											'%d': f => s(f.Sa, 2),
											'%e': f => o(f.Sa, 2, ' '),
											'%g': f => v(f).toString().substring(2),
											'%G': f => v(f),
											'%H': f => s(f.Fa, 2),
											'%I': f => ((f = f.Fa), f == 0 ? (f = 12) : 12 < f && (f -= 12), s(f, 2)),
											'%j': f => {
												for (var b = 0, L = 0; L <= f.Ga - 1; b += (tn(f.da + 1900) ? sr : ur)[L++]);
												return s(f.Sa + b, 3)
											},
											'%m': f => s(f.Ga + 1, 2),
											'%M': f => s(f.vc, 2),
											'%n': () => `
`,
											'%p': f => (0 <= f.Fa && 12 > f.Fa ? 'AM' : 'PM'),
											'%S': f => s(f.wc, 2),
											'%t': () => '	',
											'%u': f => f.R || 7,
											'%U': f => s(Math.floor((f.ca + 7 - f.R) / 7), 2),
											'%V': f => {
												var b = Math.floor((f.ca + 7 - ((f.R + 6) % 7)) / 7)
												if ((2 >= (f.R + 371 - f.ca - 2) % 7 && b++, b)) b == 53 && ((L = (f.R + 371 - f.ca) % 7), L == 4 || (L == 3 && tn(f.da)) || (b = 1))
												else {
													b = 52
													var L = (f.R + 7 - f.ca - 1) % 7
													;(L == 4 || (L == 5 && tn((f.da % 400) - 1))) && b++
												}
												return s(b, 2)
											},
											'%w': f => f.R,
											'%W': f => s(Math.floor((f.ca + 7 - ((f.R + 6) % 7)) / 7), 2),
											'%y': f => (f.da + 1900).toString().substring(2),
											'%Y': f => f.da + 1900,
											'%z': f => {
												f = f.uc
												var b = 0 <= f
												return (f = Math.abs(f) / 60), (b ? '+' : '-') + ('0000' + ((f / 60) * 100 + (f % 60))).slice(-4)
											},
											'%Z': f => f.xc,
											'%%': () => '%',
										}),
											(n = n.replace(/%%/g, '\0\0'))
										for (_ in h) n.includes(_) && (n = n.replace(new RegExp(_, 'g'), h[_](i)))
										return (n = n.replace(/\0\0/g, '%')), (_ = Ln(n, !1)), _.length > t ? 0 : (de.set(_, e), _.length - 1)
									}
								function cr(e, t, n, i) {
									e || (e = this), (this.parent = e), (this.U = e.U), (this.wa = null), (this.id = Mr++), (this.name = t), (this.mode = n), (this.l = {}), (this.m = {}), (this.za = i)
								}
								Object.defineProperties(cr.prototype, {
									read: {
										get: function () {
											return (this.mode & 365) === 365
										},
										set: function (e) {
											e ? (this.mode |= 365) : (this.mode &= -366)
										},
									},
									write: {
										get: function () {
											return (this.mode & 146) === 146
										},
										set: function (e) {
											e ? (this.mode |= 146) : (this.mode &= -147)
										},
									},
								}),
									Yn(),
									(Rt = Array(4096)),
									Nn(U, '/'),
									Ie('/tmp', 16895, 0),
									Ie('/home', 16895, 0),
									Ie('/home/web_user', 16895, 0),
									(() => {
										Ie('/dev', 16895, 0), cn(259, { read: () => 0, write: (i, o, s, c) => c }), Bt('/dev/null', 259), Fn(1280, Pr), Fn(1536, Tr), Bt('/dev/tty', 1280), Bt('/dev/tty1', 1536)
										var e = new Uint8Array(1024),
											t = 0,
											n = () => (t === 0 && (t = Cn(e).byteLength), e[--t])
										Ct('random', n), Ct('urandom', n), Ie('/dev/shm', 16895, 0), Ie('/dev/shm/tmp', 16895, 0)
									})(),
									(() => {
										Ie('/proc', 16895, 0)
										var e = Ie('/proc/self', 16895, 0)
										Ie('/proc/self/fd', 16895, 0),
											Nn(
												{
													U: () => {
														var t = Dn(e, 'fd', 16895, 73)
														return (
															(t.l = {
																ka: (n, i) => {
																	var o = nt(+i)
																	return (n = { parent: null, U: { mb: 'fake' }, l: { ma: () => o.path } }), (n.parent = n)
																},
															}),
															t
														)
													},
												},
												'/proc/self/fd'
											)
									})(),
									Object.assign(Xn.prototype, {
										get(e) {
											return this.M[e]
										},
										has(e) {
											return this.M[e] !== void 0
										},
										pa(e) {
											var t = this.hb.pop() || this.M.length
											return (this.M[t] = e), t
										},
										Zb(e) {
											;(this.M[e] = void 0), this.hb.push(e)
										},
									}),
									(gt = l.BindingError =
										class extends Error {
											constructor(e) {
												super(e), (this.name = 'BindingError')
											}
										}),
									Fe.M.push({ value: void 0 }, { value: null }, { value: !0 }, { value: !1 }),
									(Fe.h = Fe.M.length),
									(l.count_emval_handles = function () {
										for (var e = 0, t = Fe.h; t < Fe.M.length; ++t) Fe.M[t] !== void 0 && ++e
										return e
									}),
									(Vn = l.PureVirtualError = kn('PureVirtualError'))
								for (var lr = Array(256), nn = 0; 256 > nn; ++nn) lr[nn] = String.fromCharCode(nn)
								;(Gn = lr),
									(l.getInheritedInstanceCount = function () {
										return Object.keys(Ge).length
									}),
									(l.getLiveInheritedInstances = function () {
										var e = [],
											t
										for (t in Ge) Ge.hasOwnProperty(t) && e.push(Ge[t])
										return e
									}),
									(l.flushPendingDeletes = hn),
									(l.setDelayFunction = function (e) {
										;(Lt = e), Tt.length && Lt && Lt(hn)
									}),
									(qn = l.InternalError =
										class extends Error {
											constructor(e) {
												super(e), (this.name = 'InternalError')
											}
										}),
									(rt.prototype.isAliasOf = function (e) {
										if (!(this instanceof rt && e instanceof rt)) return !1
										var t = this.g.u.i,
											n = this.g.o,
											i = e.g.u.i
										for (e = e.g.o; t.A; ) (n = t.na(n)), (t = t.A)
										for (; i.A; ) (e = i.na(e)), (i = i.A)
										return t === i && n === e
									}),
									(rt.prototype.clone = function () {
										if ((this.g.o || vn(this), this.g.ia)) return (this.g.count.value += 1), this
										var e = yt,
											t = Object,
											n = t.create,
											i = Object.getPrototypeOf(this),
											o = this.g
										return (e = e(n.call(t, i, { g: { value: { count: o.count, fa: o.fa, ia: o.ia, o: o.o, u: o.u, G: o.G, L: o.L } } }))), (e.g.count.value += 1), (e.g.fa = !1), e
									}),
									(rt.prototype.delete = function () {
										this.g.o || vn(this), this.g.fa && !this.g.ia && x('Object already scheduled for deletion'), zt(this), Zn(this.g), this.g.ia || ((this.g.G = void 0), (this.g.o = void 0))
									}),
									(rt.prototype.isDeleted = function () {
										return !this.g.o
									}),
									(rt.prototype.deleteLater = function () {
										return this.g.o || vn(this), this.g.fa && !this.g.ia && x('Object already scheduled for deletion'), Tt.push(this), Tt.length === 1 && Lt && Lt(hn), (this.g.fa = !0), this
									}),
									(Ke.prototype.Vb = function (e) {
										return this.rb && (e = this.rb(e)), e
									}),
									(Ke.prototype.ab = function (e) {
										this.W && this.W(e)
									}),
									(Ke.prototype.argPackAdvance = 8),
									(Ke.prototype.readValueFromPointer = St),
									(Ke.prototype.deleteObject = function (e) {
										e !== null && e.delete()
									}),
									(Ke.prototype.fromWireType = function (e) {
										function t() {
											return this.ua ? Xt(this.i.N, { u: this.nc, o: n, L: this, G: e }) : Xt(this.i.N, { u: this, o: e })
										}
										var n = this.Vb(e)
										if (!n) return this.ab(e), null
										var i = jr(this.i, n)
										if (i !== void 0) return i.g.count.value === 0 ? ((i.g.o = n), (i.g.G = e), i.clone()) : ((i = i.clone()), this.ab(e), i)
										if (((i = this.i.Ub(n)), (i = Qn[i]), !i)) return t.call(this)
										i = this.ta ? i.Kb : i.pointerType
										var o = Jn(n, this.i, i.i)
										return o === null ? t.call(this) : this.ua ? Xt(i.i.N, { u: i, o, L: this, G: e }) : Xt(i.i.N, { u: i, o })
									}),
									(nr = l.UnboundTypeError = kn('UnboundTypeError'))
								var fr = {
									__syscall_fcntl64: function (e, t, n) {
										Pt = n
										try {
											var i = nt(e)
											switch (t) {
												case 0:
													var o = Ve()
													return 0 > o ? -28 : Bn(i, o).X
												case 1:
												case 2:
													return 0
												case 3:
													return i.flags
												case 4:
													return (o = Ve()), (i.flags |= o), 0
												case 5:
													return (o = Ve()), (be[(o + 0) >> 1] = 2), 0
												case 6:
												case 7:
													return 0
												case 16:
												case 8:
													return -28
												case 9:
													return (Y[vr() >> 2] = 28), -1
												default:
													return -28
											}
										} catch (s) {
											if (typeof st > 'u' || s.name !== 'ErrnoError') throw s
											return -s.aa
										}
									},
									__syscall_ioctl: function (e, t, n) {
										Pt = n
										try {
											var i = nt(e)
											switch (t) {
												case 21509:
													return i.s ? 0 : -59
												case 21505:
													if (!i.s) return -59
													if (i.s.V.bc) {
														t = [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
														var o = Ve()
														;(Y[o >> 2] = 25856), (Y[(o + 4) >> 2] = 5), (Y[(o + 8) >> 2] = 191), (Y[(o + 12) >> 2] = 35387)
														for (var s = 0; 32 > s; s++) de[(o + s + 17) >> 0] = t[s] || 0
													}
													return 0
												case 21510:
												case 21511:
												case 21512:
													return i.s ? 0 : -59
												case 21506:
												case 21507:
												case 21508:
													if (!i.s) return -59
													if (i.s.V.cc) for (o = Ve(), t = [], s = 0; 32 > s; s++) t.push(de[(o + s + 17) >> 0])
													return 0
												case 21519:
													return i.s ? ((o = Ve()), (Y[o >> 2] = 0)) : -59
												case 21520:
													return i.s ? -28 : -59
												case 21531:
													if (((o = Ve()), !i.m.ac)) throw new T(59)
													return i.m.ac(i, t, o)
												case 21523:
													return i.s ? (i.s.V.dc && ((s = [24, 80]), (o = Ve()), (be[o >> 1] = s[0]), (be[(o + 2) >> 1] = s[1])), 0) : -59
												case 21524:
													return i.s ? 0 : -59
												case 21515:
													return i.s ? 0 : -59
												default:
													return -28
											}
										} catch (c) {
											if (typeof st > 'u' || c.name !== 'ErrnoError') throw c
											return -c.aa
										}
									},
									__syscall_openat: function (e, t, n, i) {
										Pt = i
										try {
											t = t ? tt(ie, t) : ''
											var o = t
											if (o.charAt(0) === '/') t = o
											else {
												var s = e === -100 ? '/' : nt(e).path
												if (o.length == 0) throw new T(44)
												t = xe(s + '/' + o)
											}
											var c = i ? Ve() : 0
											return Nt(t, n, c).X
										} catch (p) {
											if (typeof st > 'u' || p.name !== 'ErrnoError') throw p
											return -p.aa
										}
									},
									_embind_create_inheriting_constructor: function (e, t, n) {
										;(e = ue(e)), (t = Mt(t, 'wrapper')), (n = De(n))
										var i = [].slice,
											o = t.i,
											s = o.N,
											c = o.A.N,
											p = o.A.constructor
										;(e = Yt(e, function () {
											o.A.qb.forEach(
												function (h) {
													if (this[h] === c[h]) throw new Vn(`Pure virtual function ${h} must be implemented in JavaScript`)
												}.bind(this)
											),
												Object.defineProperty(this, '__parent', { value: s }),
												this.__construct.apply(this, i.call(arguments))
										})),
											(s.__construct = function () {
												this === s && x("Pass correct 'this' to __construct")
												var h = p.implement.apply(void 0, [this].concat(i.call(arguments)))
												zt(h)
												var _ = h.g
												h.notifyOnDestruction(),
													(_.ia = !0),
													Object.defineProperties(this, { g: { value: _ } }),
													yt(this),
													(h = _.o),
													(h = dn(o, h)),
													Ge.hasOwnProperty(h) ? x(`Tried to register registered instance: ${h}`) : (Ge[h] = this)
											}),
											(s.__destruct = function () {
												this === s && x("Pass correct 'this' to __destruct"), zt(this)
												var h = this.g.o
												;(h = dn(o, h)), Ge.hasOwnProperty(h) ? delete Ge[h] : x(`Tried to unregister unregistered instance: ${h}`)
											}),
											(e.prototype = Object.create(s))
										for (var v in n) e.prototype[v] = n[v]
										return Be(e)
									},
									_embind_finalize_value_object: function (e) {
										var t = kt[e]
										delete kt[e]
										var n = t.Pa,
											i = t.W,
											o = t.eb,
											s = o.map(c => c.Yb).concat(o.map(c => c.rc))
										Te([e], s, c => {
											var p = {}
											return (
												o.forEach((v, h) => {
													var _ = c[h],
														A = v.Wb,
														E = v.Xb,
														f = c[h + o.length],
														b = v.qc,
														L = v.sc
													p[v.Sb] = {
														read: R => _.fromWireType(A(E, R)),
														write: (R, K) => {
															var C = []
															b(L, R, f.toWireType(C, K)), Ft(C)
														},
													}
												}),
												[
													{
														name: t.name,
														fromWireType: function (v) {
															var h = {},
																_
															for (_ in p) h[_] = p[_].read(v)
															return i(v), h
														},
														toWireType: function (v, h) {
															for (var _ in p) if (!(_ in h)) throw new TypeError(`Missing field: "${_}"`)
															var A = n()
															for (_ in p) p[_].write(A, h[_])
															return v !== null && v.push(i, A), A
														},
														argPackAdvance: 8,
														readValueFromPointer: St,
														K: i,
													},
												]
											)
										})
									},
									_embind_register_bigint: function () {},
									_embind_register_bool: function (e, t, n, i, o) {
										var s = Gt(n)
										;(t = ue(t)),
											Ne(e, {
												name: t,
												fromWireType: function (c) {
													return !!c
												},
												toWireType: function (c, p) {
													return p ? i : o
												},
												argPackAdvance: 8,
												readValueFromPointer: function (c) {
													if (n === 1) var p = de
													else if (n === 2) p = be
													else if (n === 4) p = Y
													else throw new TypeError('Unknown boolean type size: ' + t)
													return this.fromWireType(p[c >> s])
												},
												K: null,
											})
									},
									_embind_register_class: function (e, t, n, i, o, s, c, p, v, h, _, A, E) {
										;(_ = ue(_)), (s = _e(o, s)), p && (p = _e(c, p)), h && (h = _e(v, h)), (E = _e(A, E))
										var f = Hn(_)
										gn(f, function () {
											Ze(`Cannot construct ${_} due to unbound types`, [i])
										}),
											Te([e, t, n], i ? [i] : [], function (b) {
												if (((b = b[0]), i))
													var L = b.i,
														R = L.N
												else R = rt.prototype
												b = Yt(f, function () {
													if (Object.getPrototypeOf(this) !== K) throw new gt("Use 'new' to construct " + _)
													if (C.$ === void 0) throw new gt(_ + ' has no accessible constructor')
													var re = C.$[arguments.length]
													if (re === void 0)
														throw new gt(`Tried to invoke ctor of ${_} with invalid number of parameters (${arguments.length}) - expected (${Object.keys(C.$).toString()}) parameters instead!`)
													return re.apply(this, arguments)
												})
												var K = Object.create(R, { constructor: { value: b } })
												b.prototype = K
												var C = new Ir(_, b, K, E, L, s, p, h)
												C.A && (C.A.oa === void 0 && (C.A.oa = []), C.A.oa.push(C)), (L = new Ke(_, C, !0, !1)), (R = new Ke(_ + '*', C, !1, !1))
												var V = new Ke(_ + ' const*', C, !1, !0)
												return (Qn[e] = { pointerType: R, Kb: V }), er(f, b), [L, R, V]
											})
									},
									_embind_register_class_class_function: function (e, t, n, i, o, s, c) {
										var p = Qt(n, i)
										;(t = ue(t)),
											(s = _e(o, s)),
											Te([], [e], function (v) {
												function h() {
													Ze(`Cannot call ${_} due to unbound types`, p)
												}
												v = v[0]
												var _ = `${v.name}.${t}`
												t.startsWith('@@') && (t = Symbol[t.substring(2)])
												var A = v.i.constructor
												return (
													A[t] === void 0 ? ((h.ea = n - 1), (A[t] = h)) : (mn(A, t, _), (A[t].B[n - 1] = h)),
													Te([], p, function (E) {
														if (((E = Jt(_, [E[0], null].concat(E.slice(1)), null, s, c)), A[t].B === void 0 ? ((E.ea = n - 1), (A[t] = E)) : (A[t].B[n - 1] = E), v.i.oa))
															for (const f of v.i.oa) f.constructor.hasOwnProperty(t) || (f.constructor[t] = E)
														return []
													}),
													[]
												)
											})
									},
									_embind_register_class_class_property: function (e, t, n, i, o, s, c, p) {
										;(t = ue(t)),
											(s = _e(o, s)),
											Te([], [e], function (v) {
												v = v[0]
												var h = `${v.name}.${t}`,
													_ = {
														get() {
															Ze(`Cannot access ${h} due to unbound types`, [n])
														},
														enumerable: !0,
														configurable: !0,
													}
												return (
													(_.set = p
														? () => {
																Ze(`Cannot access ${h} due to unbound types`, [n])
															}
														: () => {
																x(`${h} is a read-only property`)
															}),
													Object.defineProperty(v.i.constructor, t, _),
													Te([], [n], function (A) {
														A = A[0]
														var E = {
															get() {
																return A.fromWireType(s(i))
															},
															enumerable: !0,
														}
														return (
															p &&
																((p = _e(c, p)),
																(E.set = f => {
																	var b = []
																	p(i, A.toWireType(b, f)), Ft(b)
																})),
															Object.defineProperty(v.i.constructor, t, E),
															[]
														)
													}),
													[]
												)
											})
									},
									_embind_register_class_constructor: function (e, t, n, i, o, s) {
										var c = Qt(t, n)
										;(o = _e(i, o)),
											Te([], [e], function (p) {
												p = p[0]
												var v = `constructor ${p.name}`
												if ((p.i.$ === void 0 && (p.i.$ = []), p.i.$[t - 1] !== void 0))
													throw new gt(
														`Cannot register multiple constructors with identical number of parameters (${t - 1}) for class '${p.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`
													)
												return (
													(p.i.$[t - 1] = () => {
														Ze(`Cannot construct ${p.name} due to unbound types`, c)
													}),
													Te([], c, function (h) {
														return h.splice(1, 0, null), (p.i.$[t - 1] = Jt(v, h, null, o, s)), []
													}),
													[]
												)
											})
									},
									_embind_register_class_function: function (e, t, n, i, o, s, c, p) {
										var v = Qt(n, i)
										;(t = ue(t)),
											(s = _e(o, s)),
											Te([], [e], function (h) {
												function _() {
													Ze(`Cannot call ${A} due to unbound types`, v)
												}
												h = h[0]
												var A = `${h.name}.${t}`
												t.startsWith('@@') && (t = Symbol[t.substring(2)]), p && h.i.qb.push(t)
												var E = h.i.N,
													f = E[t]
												return (
													f === void 0 || (f.B === void 0 && f.className !== h.name && f.ea === n - 2) ? ((_.ea = n - 2), (_.className = h.name), (E[t] = _)) : (mn(E, t, A), (E[t].B[n - 2] = _)),
													Te([], v, function (b) {
														return (b = Jt(A, b, h, s, c)), E[t].B === void 0 ? ((b.ea = n - 2), (E[t] = b)) : (E[t].B[n - 2] = b), []
													}),
													[]
												)
											})
									},
									_embind_register_class_property: function (e, t, n, i, o, s, c, p, v, h) {
										;(t = ue(t)),
											(o = _e(i, o)),
											Te([], [e], function (_) {
												_ = _[0]
												var A = `${_.name}.${t}`,
													E = {
														get() {
															Ze(`Cannot access ${A} due to unbound types`, [n, c])
														},
														enumerable: !0,
														configurable: !0,
													}
												return (
													(E.set = v
														? () => {
																Ze(`Cannot access ${A} due to unbound types`, [n, c])
															}
														: () => {
																x(A + ' is a read-only property')
															}),
													Object.defineProperty(_.i.N, t, E),
													Te([], v ? [n, c] : [n], function (f) {
														var b = f[0],
															L = {
																get() {
																	var K = rr(this, _, A + ' getter')
																	return b.fromWireType(o(s, K))
																},
																enumerable: !0,
															}
														if (v) {
															v = _e(p, v)
															var R = f[1]
															L.set = function (K) {
																var C = rr(this, _, A + ' setter'),
																	V = []
																v(h, C, R.toWireType(V, K)), Ft(V)
															}
														}
														return Object.defineProperty(_.i.N, t, L), []
													}),
													[]
												)
											})
									},
									_embind_register_emval: function (e, t) {
										;(t = ue(t)),
											Ne(e, {
												name: t,
												fromWireType: function (n) {
													var i = De(n)
													return yn(n), i
												},
												toWireType: function (n, i) {
													return Be(i)
												},
												argPackAdvance: 8,
												readValueFromPointer: St,
												K: null,
											})
									},
									_embind_register_enum: function (e, t, n, i) {
										function o() {}
										;(n = Gt(n)),
											(t = ue(t)),
											(o.values = {}),
											Ne(e, {
												name: t,
												constructor: o,
												fromWireType: function (s) {
													return this.constructor.values[s]
												},
												toWireType: function (s, c) {
													return c.value
												},
												argPackAdvance: 8,
												readValueFromPointer: Nr(t, n, i),
												K: null,
											}),
											gn(t, o)
									},
									_embind_register_enum_value: function (e, t, n) {
										var i = Mt(e, 'enum')
										;(t = ue(t)),
											(e = i.constructor),
											(i = Object.create(i.constructor.prototype, { value: { value: n }, constructor: { value: Yt(`${i.name}_${t}`, function () {}) } })),
											(e.values[n] = i),
											(e[t] = i)
									},
									_embind_register_float: function (e, t, n) {
										;(n = Gt(n)),
											(t = ue(t)),
											Ne(e, {
												name: t,
												fromWireType: function (i) {
													return i
												},
												toWireType: function (i, o) {
													return o
												},
												argPackAdvance: 8,
												readValueFromPointer: $r(t, n),
												K: null,
											})
									},
									_embind_register_function: function (e, t, n, i, o, s) {
										var c = Qt(t, n)
										;(e = ue(e)),
											(o = _e(i, o)),
											gn(
												e,
												function () {
													Ze(`Cannot call ${e} due to unbound types`, c)
												},
												t - 1
											),
											Te([], c, function (p) {
												return er(e, Jt(e, [p[0], null].concat(p.slice(1)), null, o, s), t - 1), []
											})
									},
									_embind_register_integer: function (e, t, n, i, o) {
										;(t = ue(t)), o === -1 && (o = 4294967295), (o = Gt(n))
										var s = p => p
										if (i === 0) {
											var c = 32 - 8 * n
											s = p => (p << c) >>> c
										}
										;(n = t.includes('unsigned')
											? function (p, v) {
													return v >>> 0
												}
											: function (p, v) {
													return v
												}),
											Ne(e, { name: t, fromWireType: s, toWireType: n, argPackAdvance: 8, readValueFromPointer: Yr(t, o, i !== 0), K: null })
									},
									_embind_register_memory_view: function (e, t, n) {
										function i(s) {
											s >>= 2
											var c = te
											return new o(c.buffer, c[s + 1], c[s])
										}
										var o = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][t]
										;(n = ue(n)), Ne(e, { name: n, fromWireType: i, argPackAdvance: 8, readValueFromPointer: i }, { $b: !0 })
									},
									_embind_register_std_string: function (e, t) {
										t = ue(t)
										var n = t === 'std::string'
										Ne(e, {
											name: t,
											fromWireType: function (i) {
												var o = te[i >> 2],
													s = i + 4
												if (n)
													for (var c = s, p = 0; p <= o; ++p) {
														var v = s + p
														if (p == o || ie[v] == 0) {
															if (((c = c ? tt(ie, c, v - c) : ''), h === void 0)) var h = c
															else (h += '\0'), (h += c)
															c = v + 1
														}
													}
												else {
													for (h = Array(o), p = 0; p < o; ++p) h[p] = String.fromCharCode(ie[s + p])
													h = h.join('')
												}
												return Je(i), h
											},
											toWireType: function (i, o) {
												o instanceof ArrayBuffer && (o = new Uint8Array(o))
												var s = typeof o == 'string'
												s || o instanceof Uint8Array || o instanceof Uint8ClampedArray || o instanceof Int8Array || x('Cannot pass non-string to std::string')
												var c = n && s ? Pn(o) : o.length,
													p = Rn(4 + c + 1),
													v = p + 4
												if (((te[p >> 2] = c), n && s)) Tn(o, ie, v, c + 1)
												else if (s)
													for (s = 0; s < c; ++s) {
														var h = o.charCodeAt(s)
														255 < h && (Je(v), x('String has UTF-16 code units that do not fit in 8 bits')), (ie[v + s] = h)
													}
												else for (s = 0; s < c; ++s) ie[v + s] = o[s]
												return i !== null && i.push(Je, p), p
											},
											argPackAdvance: 8,
											readValueFromPointer: St,
											K: function (i) {
												Je(i)
											},
										})
									},
									_embind_register_std_wstring: function (e, t, n) {
										if (((n = ue(n)), t === 2))
											var i = zr,
												o = Hr,
												s = Xr,
												c = () => pe,
												p = 1
										else t === 4 && ((i = kr), (o = Vr), (s = Gr), (c = () => te), (p = 2))
										Ne(e, {
											name: n,
											fromWireType: function (v) {
												for (var h = te[v >> 2], _ = c(), A, E = v + 4, f = 0; f <= h; ++f) {
													var b = v + 4 + f * t
													;(f == h || _[b >> p] == 0) && ((E = i(E, b - E)), A === void 0 ? (A = E) : ((A += '\0'), (A += E)), (E = b + t))
												}
												return Je(v), A
											},
											toWireType: function (v, h) {
												typeof h != 'string' && x(`Cannot pass non-string to C++ string type ${n}`)
												var _ = s(h),
													A = Rn(4 + _ + t)
												return (te[A >> 2] = _ >> p), o(h, A + 4, _ + t), v !== null && v.push(Je, A), A
											},
											argPackAdvance: 8,
											readValueFromPointer: St,
											K: function (v) {
												Je(v)
											},
										})
									},
									_embind_register_value_object: function (e, t, n, i, o, s) {
										kt[e] = { name: ue(t), Pa: _e(n, i), W: _e(o, s), eb: [] }
									},
									_embind_register_value_object_field: function (e, t, n, i, o, s, c, p, v, h) {
										kt[e].eb.push({ Sb: ue(t), Yb: n, Wb: _e(i, o), Xb: s, rc: c, qc: _e(p, v), sc: h })
									},
									_embind_register_void: function (e, t) {
										;(t = ue(t)), Ne(e, { fc: !0, name: t, argPackAdvance: 0, fromWireType: function () {}, toWireType: function () {} })
									},
									_emscripten_get_now_is_monotonic: () => !0,
									_emval_as: function (e, t, n) {
										;(e = De(e)), (t = Mt(t, 'emval::as'))
										var i = [],
											o = Be(i)
										return (te[n >> 2] = o), t.toWireType(i, e)
									},
									_emval_call_method: function (e, t, n, i, o) {
										;(e = en[e]), (t = De(t)), (n = qt(n))
										var s = []
										return (te[i >> 2] = Be(s)), e(t, n, s, o)
									},
									_emval_call_void_method: function (e, t, n, i) {
										;(e = en[e]), (t = De(t)), (n = qt(n)), e(t, n, null, i)
									},
									_emval_decref: yn,
									_emval_get_method_caller: function (e, t) {
										var n = Jr(e, t),
											i = n[0]
										t =
											i.name +
											'_$' +
											n
												.slice(1)
												.map(function (c) {
													return c.name
												})
												.join('_') +
											'$'
										var o = or[t]
										if (o !== void 0) return o
										var s = Array(e - 1)
										return (
											(o = Zr((c, p, v, h) => {
												for (var _ = 0, A = 0; A < e - 1; ++A) (s[A] = n[A + 1].readValueFromPointer(h + _)), (_ += n[A + 1].argPackAdvance)
												for (c = c[p].apply(c, s), A = 0; A < e - 1; ++A) n[A + 1].Nb && n[A + 1].Nb(s[A])
												if (!i.fc) return i.toWireType(v, c)
											})),
											(or[t] = o)
										)
									},
									_emval_get_module_property: function (e) {
										return (e = qt(e)), Be(l[e])
									},
									_emval_get_property: function (e, t) {
										return (e = De(e)), (t = De(t)), Be(e[t])
									},
									_emval_incref: function (e) {
										4 < e && (Fe.get(e).tb += 1)
									},
									_emval_new_cstring: function (e) {
										return Be(qt(e))
									},
									_emval_new_object: function () {
										return Be({})
									},
									_emval_run_destructors: function (e) {
										var t = De(e)
										Ft(t), yn(e)
									},
									_emval_set_property: function (e, t, n) {
										;(e = De(e)), (t = De(t)), (n = De(n)), (e[t] = n)
									},
									_emval_take_value: function (e, t) {
										return (e = Mt(e, '_emval_take_value')), (e = e.readValueFromPointer(t)), Be(e)
									},
									abort: () => {
										I('')
									},
									emscripten_asm_const_int: (e, t, n) => {
										bn.length = 0
										var i
										for (n >>= 2; (i = ie[t++]); ) (n += (i != 105) & n), bn.push(i == 105 ? Y[n] : Xe[n++ >> 1]), ++n
										return xt[e].apply(null, bn)
									},
									emscripten_date_now: function () {
										return Date.now()
									},
									emscripten_get_now: () => performance.now(),
									emscripten_memcpy_big: (e, t, n) => ie.copyWithin(e, t, t + n),
									emscripten_resize_heap: e => {
										var t = ie.length
										if (((e >>>= 0), 2147483648 < e)) return !1
										for (var n = 1; 4 >= n; n *= 2) {
											var i = t * (1 + 0.2 / n)
											i = Math.min(i, e + 100663296)
											var o = Math
											i = Math.max(e, i)
											e: {
												o = (o.min.call(o, 2147483648, i + ((65536 - (i % 65536)) % 65536)) - He.buffer.byteLength + 65535) >>> 16
												try {
													He.grow(o), u()
													var s = 1
													break e
												} catch {}
												s = void 0
											}
											if (s) return !0
										}
										return !1
									},
									environ_get: (e, t) => {
										var n = 0
										return (
											ar().forEach(function (i, o) {
												var s = t + n
												for (o = te[(e + 4 * o) >> 2] = s, s = 0; s < i.length; ++s) de[o++ >> 0] = i.charCodeAt(s)
												;(de[o >> 0] = 0), (n += i.length + 1)
											}),
											0
										)
									},
									environ_sizes_get: (e, t) => {
										var n = ar()
										te[e >> 2] = n.length
										var i = 0
										return (
											n.forEach(function (o) {
												i += o.length + 1
											}),
											(te[t >> 2] = i),
											0
										)
									},
									fd_close: function (e) {
										try {
											var t = nt(e)
											if (t.X === null) throw new T(8)
											t.Ma && (t.Ma = null)
											try {
												t.m.close && t.m.close(t)
											} catch (n) {
												throw n
											} finally {
												Dt[t.X] = null
											}
											return (t.X = null), 0
										} catch (n) {
											if (typeof st > 'u' || n.name !== 'ErrnoError') throw n
											return n.aa
										}
									},
									fd_read: function (e, t, n, i) {
										try {
											e: {
												var o = nt(e)
												e = t
												for (var s, c = (t = 0); c < n; c++) {
													var p = te[e >> 2],
														v = te[(e + 4) >> 2]
													e += 8
													var h = o,
														_ = p,
														A = v,
														E = s,
														f = de
													if (0 > A || 0 > E) throw new T(28)
													if (h.X === null) throw new T(8)
													if ((h.flags & 2097155) === 1) throw new T(8)
													if ((h.node.mode & 61440) === 16384) throw new T(31)
													if (!h.m.read) throw new T(28)
													var b = typeof E < 'u'
													if (!b) E = h.position
													else if (!h.seekable) throw new T(70)
													var L = h.m.read(h, f, _, A, E)
													b || (h.position += L)
													var R = L
													if (0 > R) {
														var K = -1
														break e
													}
													if (((t += R), R < v)) break
													typeof s < 'u' && (s += R)
												}
												K = t
											}
											return (te[i >> 2] = K), 0
										} catch (C) {
											if (typeof st > 'u' || C.name !== 'ErrnoError') throw C
											return C.aa
										}
									},
									fd_seek: function (e, t, n, i, o) {
										t = (n + 2097152) >>> 0 < 4194305 - !!t ? (t >>> 0) + 4294967296 * n : NaN
										try {
											if (isNaN(t)) return 61
											var s = nt(e)
											return (
												$n(s, t, i),
												(pt = [s.position >>> 0, ((Me = s.position), 1 <= +Math.abs(Me) ? (0 < Me ? +Math.floor(Me / 4294967296) >>> 0 : ~~+Math.ceil((Me - +(~~Me >>> 0)) / 4294967296) >>> 0) : 0)]),
												(Y[o >> 2] = pt[0]),
												(Y[(o + 4) >> 2] = pt[1]),
												s.Ma && t === 0 && i === 0 && (s.Ma = null),
												0
											)
										} catch (c) {
											if (typeof st > 'u' || c.name !== 'ErrnoError') throw c
											return c.aa
										}
									},
									fd_write: function (e, t, n, i) {
										try {
											e: {
												var o = nt(e)
												e = t
												for (var s, c = (t = 0); c < n; c++) {
													var p = te[e >> 2],
														v = te[(e + 4) >> 2]
													e += 8
													var h = o,
														_ = p,
														A = v,
														E = s,
														f = de
													if (0 > A || 0 > E) throw new T(28)
													if (h.X === null) throw new T(8)
													if (!(h.flags & 2097155)) throw new T(8)
													if ((h.node.mode & 61440) === 16384) throw new T(31)
													if (!h.m.write) throw new T(28)
													h.seekable && h.flags & 1024 && $n(h, 0, 2)
													var b = typeof E < 'u'
													if (!b) E = h.position
													else if (!h.seekable) throw new T(70)
													var L = h.m.write(h, f, _, A, E, void 0)
													b || (h.position += L)
													var R = L
													if (0 > R) {
														var K = -1
														break e
													}
													;(t += R), typeof s < 'u' && (s += R)
												}
												K = t
											}
											return (te[i >> 2] = K), 0
										} catch (C) {
											if (typeof st > 'u' || C.name !== 'ErrnoError') throw C
											return C.aa
										}
									},
									strftime_l: (e, t, n, i) => Qr(e, t, n, i),
								}
								;(function () {
									function e(n) {
										if (
											((ne = n = n.exports),
											(He = ne.memory),
											u(),
											(r = ne.__indirect_function_table),
											d.unshift(ne.__wasm_call_ctors),
											w--,
											l.monitorRunDependencies && l.monitorRunDependencies(w),
											w == 0 && M)
										) {
											var i = M
											;(M = null), i()
										}
										return n
									}
									var t = { env: fr, wasi_snapshot_preview1: fr }
									if ((w++, l.monitorRunDependencies && l.monitorRunDependencies(w), l.instantiateWasm))
										try {
											return l.instantiateWasm(t, e)
										} catch (n) {
											he('Module.instantiateWasm callback failed with error: ' + n), q(n)
										}
									return (
										je(t, function (n) {
											e(n.instance)
										}).catch(q),
										{}
									)
								})()
								var Je = e => (Je = ne.free)(e),
									Rn = e => (Rn = ne.malloc)(e),
									hr = (l._ma_device__on_notification_unlocked = e => (hr = l._ma_device__on_notification_unlocked = ne.ma_device__on_notification_unlocked)(e))
								;(l._ma_malloc_emscripten = (e, t) => (l._ma_malloc_emscripten = ne.ma_malloc_emscripten)(e, t)),
									(l._ma_free_emscripten = (e, t) => (l._ma_free_emscripten = ne.ma_free_emscripten)(e, t))
								var dr = (l._ma_device_process_pcm_frames_capture__webaudio = (e, t, n) =>
										(dr = l._ma_device_process_pcm_frames_capture__webaudio = ne.ma_device_process_pcm_frames_capture__webaudio)(e, t, n)),
									pr = (l._ma_device_process_pcm_frames_playback__webaudio = (e, t, n) =>
										(pr = l._ma_device_process_pcm_frames_playback__webaudio = ne.ma_device_process_pcm_frames_playback__webaudio)(e, t, n)),
									vr = () => (vr = ne.__errno_location)(),
									mr = e => (mr = ne.__getTypeName)(e)
								;(l.__embind_initialize_bindings = () => (l.__embind_initialize_bindings = ne._embind_initialize_bindings)()),
									(l.dynCall_iiji = (e, t, n, i, o) => (l.dynCall_iiji = ne.dynCall_iiji)(e, t, n, i, o)),
									(l.dynCall_jiji = (e, t, n, i, o) => (l.dynCall_jiji = ne.dynCall_jiji)(e, t, n, i, o)),
									(l.dynCall_iiiji = (e, t, n, i, o, s) => (l.dynCall_iiiji = ne.dynCall_iiiji)(e, t, n, i, o, s)),
									(l.dynCall_iij = (e, t, n, i) => (l.dynCall_iij = ne.dynCall_iij)(e, t, n, i)),
									(l.dynCall_jii = (e, t, n) => (l.dynCall_jii = ne.dynCall_jii)(e, t, n)),
									(l.dynCall_viijii = (e, t, n, i, o, s, c) => (l.dynCall_viijii = ne.dynCall_viijii)(e, t, n, i, o, s, c)),
									(l.dynCall_iiiiij = (e, t, n, i, o, s, c) => (l.dynCall_iiiiij = ne.dynCall_iiiiij)(e, t, n, i, o, s, c)),
									(l.dynCall_iiiiijj = (e, t, n, i, o, s, c, p, v) => (l.dynCall_iiiiijj = ne.dynCall_iiiiijj)(e, t, n, i, o, s, c, p, v)),
									(l.dynCall_iiiiiijj = (e, t, n, i, o, s, c, p, v, h) => (l.dynCall_iiiiiijj = ne.dynCall_iiiiiijj)(e, t, n, i, o, s, c, p, v, h))
								var rn
								M = function e() {
									rn || gr(), rn || (M = e)
								}
								function gr() {
									function e() {
										if (!rn && ((rn = !0), (l.calledRun = !0), !ot)) {
											if (
												(l.noFSInit ||
													zn ||
													((zn = !0),
													Yn(),
													(l.stdin = l.stdin),
													(l.stdout = l.stdout),
													(l.stderr = l.stderr),
													l.stdin ? Ct('stdin', l.stdin) : ln('/dev/tty', '/dev/stdin'),
													l.stdout ? Ct('stdout', null, l.stdout) : ln('/dev/tty', '/dev/stdout'),
													l.stderr ? Ct('stderr', null, l.stderr) : ln('/dev/tty1', '/dev/stderr'),
													Nt('/dev/stdin', 0),
													Nt('/dev/stdout', 1),
													Nt('/dev/stderr', 1)),
												(jn = !1),
												vt(d),
												Ae(l),
												l.onRuntimeInitialized && l.onRuntimeInitialized(),
												l.postRun)
											)
												for (typeof l.postRun == 'function' && (l.postRun = [l.postRun]); l.postRun.length; ) {
													var t = l.postRun.shift()
													m.unshift(t)
												}
											vt(m)
										}
									}
									if (!(0 < w)) {
										if (l.preRun) for (typeof l.preRun == 'function' && (l.preRun = [l.preRun]); l.preRun.length; ) g()
										vt(a),
											0 < w ||
												(l.setStatus
													? (l.setStatus('Running...'),
														setTimeout(function () {
															setTimeout(function () {
																l.setStatus('')
															}, 1),
																e()
														}, 1))
													: e())
									}
								}
								if (l.preInit) for (typeof l.preInit == 'function' && (l.preInit = [l.preInit]); 0 < l.preInit.length; ) l.preInit.pop()()
								return gr(), S.ready
							}
						})()
						const ae = oe
					},
					W => {
						W.exports = JSON.parse(
							`{"name":"@rive-app/canvas","version":"2.26.1","description":"Rive's canvas based web api.","main":"rive.js","homepage":"https://rive.app","repository":{"type":"git","url":"https://github.com/rive-app/rive-wasm/tree/master/js"},"keywords":["rive","animation"],"author":"Rive","contributors":["Luigi Rosso <luigi@rive.app> (https://rive.app)","Maxwell Talbot <max@rive.app> (https://rive.app)","Arthur Vivian <arthur@rive.app> (https://rive.app)","Umberto Sonnino <umberto@rive.app> (https://rive.app)","Matthew Sullivan <matt.j.sullivan@gmail.com> (mailto:matt.j.sullivan@gmail.com)"],"license":"MIT","files":["rive.js","rive.js.map","rive.wasm","rive_fallback.wasm","rive.d.ts","rive_advanced.mjs.d.ts"],"typings":"rive.d.ts","dependencies":{},"browser":{"fs":false,"path":false}}`
						)
					},
					(W, $, z) => {
						z.r($), z.d($, { Animation: () => oe.Animation })
						var oe = z(4)
					},
					(W, $, z) => {
						z.r($), z.d($, { Animation: () => oe })
						var oe = (function () {
							function ae(Q, S, l, Ae) {
								;(this.animation = Q), (this.artboard = S), (this.playing = Ae), (this.loopCount = 0), (this.scrubTo = null), (this.instance = new l.LinearAnimationInstance(Q, S))
							}
							return (
								Object.defineProperty(ae.prototype, 'name', {
									get: function () {
										return this.animation.name
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(ae.prototype, 'time', {
									get: function () {
										return this.instance.time
									},
									set: function (Q) {
										this.instance.time = Q
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(ae.prototype, 'loopValue', {
									get: function () {
										return this.animation.loopValue
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(ae.prototype, 'needsScrub', {
									get: function () {
										return this.scrubTo !== null
									},
									enumerable: !1,
									configurable: !0,
								}),
								(ae.prototype.advance = function (Q) {
									this.scrubTo === null ? this.instance.advance(Q) : ((this.instance.time = 0), this.instance.advance(this.scrubTo), (this.scrubTo = null))
								}),
								(ae.prototype.apply = function (Q) {
									this.instance.apply(Q)
								}),
								(ae.prototype.cleanup = function () {
									this.instance.delete()
								}),
								ae
							)
						})()
					},
					(W, $, z) => {
						z.r($), z.d($, { BLANK_URL: () => ae.BLANK_URL, registerTouchInteractions: () => oe.registerTouchInteractions, sanitizeUrl: () => ae.sanitizeUrl })
						var oe = z(6),
							ae = z(7)
					},
					(W, $, z) => {
						z.r($), z.d($, { registerTouchInteractions: () => Q })
						var oe = void 0,
							ae = function (S, l) {
								var Ae, q
								return ['touchstart', 'touchmove'].indexOf(S.type) > -1 && !((Ae = S.touches) === null || Ae === void 0) && Ae.length
									? (l || S.preventDefault(), { clientX: S.touches[0].clientX, clientY: S.touches[0].clientY })
									: S.type === 'touchend' && !((q = S.changedTouches) === null || q === void 0) && q.length
										? { clientX: S.changedTouches[0].clientX, clientY: S.changedTouches[0].clientY }
										: { clientX: S.clientX, clientY: S.clientY }
							},
							Q = function (S) {
								var l = S.canvas,
									Ae = S.artboard,
									q = S.stateMachines,
									se = q === void 0 ? [] : q,
									Oe = S.renderer,
									ye = S.rive,
									ce = S.fit,
									le = S.alignment,
									Re = S.isTouchScrollEnabled,
									Ce = Re === void 0 ? !1 : Re,
									it = S.layoutScaleFactor,
									O = it === void 0 ? 1 : it
								if (!l || !se.length || !Oe || !ye || !Ae || typeof window > 'u') return null
								var Pe = null,
									fe = !1,
									qe = function (Le) {
										if (fe && Le instanceof MouseEvent) {
											Le.type == 'mouseup' && (fe = !1)
											return
										}
										;(fe = Ce && Le.type === 'touchend' && Pe === 'touchstart'), (Pe = Le.type)
										var he = Le.currentTarget.getBoundingClientRect(),
											Ue = ae(Le, Ce),
											He = Ue.clientX,
											ne = Ue.clientY
										if (!(!He && !ne)) {
											var ot = He - he.left,
												de = ne - he.top,
												ie = ye.computeAlignment(ce, le, { minX: 0, minY: 0, maxX: he.width, maxY: he.height }, Ae.bounds, O),
												be = new ye.Mat2D()
											ie.invert(be)
											var pe = new ye.Vec2D(ot, de),
												Y = ye.mapXY(be, pe),
												te = Y.x(),
												We = Y.y()
											switch ((Y.delete(), be.delete(), pe.delete(), ie.delete(), Le.type)) {
												case 'mouseout':
													for (var Xe = 0, u = se; Xe < u.length; Xe++) {
														var r = u[Xe]
														r.pointerMove(te, We)
													}
													break
												case 'touchmove':
												case 'mouseover':
												case 'mousemove': {
													for (var a = 0, d = se; a < d.length; a++) {
														var r = d[a]
														r.pointerMove(te, We)
													}
													break
												}
												case 'touchstart':
												case 'mousedown': {
													for (var m = 0, g = se; m < g.length; m++) {
														var r = g[m]
														r.pointerDown(te, We)
													}
													break
												}
												case 'touchend':
												case 'mouseup': {
													for (var w = 0, M = se; w < M.length; w++) {
														var r = M[w]
														r.pointerUp(te, We)
													}
													break
												}
											}
										}
									},
									ee = qe.bind(oe)
								return (
									l.addEventListener('mouseover', ee),
									l.addEventListener('mouseout', ee),
									l.addEventListener('mousemove', ee),
									l.addEventListener('mousedown', ee),
									l.addEventListener('mouseup', ee),
									l.addEventListener('touchmove', ee, { passive: Ce }),
									l.addEventListener('touchstart', ee, { passive: Ce }),
									l.addEventListener('touchend', ee),
									function () {
										l.removeEventListener('mouseover', ee),
											l.removeEventListener('mouseout', ee),
											l.removeEventListener('mousemove', ee),
											l.removeEventListener('mousedown', ee),
											l.removeEventListener('mouseup', ee),
											l.removeEventListener('touchmove', ee),
											l.removeEventListener('touchstart', ee),
											l.removeEventListener('touchend', ee)
									}
								)
							}
					},
					(W, $, z) => {
						z.r($), z.d($, { BLANK_URL: () => q, sanitizeUrl: () => ye })
						var oe = /^([^\w]*)(javascript|data|vbscript)/im,
							ae = /&#(\w+)(^\w|;)?/g,
							Q = /&(newline|tab);/gi,
							S = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim,
							l = /^.+(:|&colon;)/gim,
							Ae = ['.', '/'],
							q = 'about:blank'
						function se(ce) {
							return Ae.indexOf(ce[0]) > -1
						}
						function Oe(ce) {
							var le = ce.replace(S, '')
							return le.replace(ae, function (Re, Ce) {
								return String.fromCharCode(Ce)
							})
						}
						function ye(ce) {
							if (!ce) return q
							var le = Oe(ce).replace(Q, '').replace(S, '').trim()
							if (!le) return q
							if (se(le)) return le
							var Re = le.match(l)
							if (!Re) return le
							var Ce = Re[0]
							return oe.test(Ce) ? q : le
						}
					},
				],
				Qe = {}
			function D(W) {
				var $ = Qe[W]
				if ($ !== void 0) return $.exports
				var z = (Qe[W] = { exports: {} })
				return dt[W](z, z.exports, D), z.exports
			}
			;(D.d = (W, $) => {
				for (var z in $) D.o($, z) && !D.o(W, z) && Object.defineProperty(W, z, { enumerable: !0, get: $[z] })
			}),
				(D.o = (W, $) => Object.prototype.hasOwnProperty.call(W, $)),
				(D.r = W => {
					typeof Symbol < 'u' && Symbol.toStringTag && Object.defineProperty(W, Symbol.toStringTag, { value: 'Module' }), Object.defineProperty(W, '__esModule', { value: !0 })
				})
			var Z = {}
			return (
				(() => {
					D.r(Z),
						D.d(Z, {
							Alignment: () => se,
							EventType: () => O,
							Fit: () => q,
							Layout: () => Oe,
							LoopType: () => Pe,
							Rive: () => ie,
							RiveEventType: () => Re,
							RiveFile: () => de,
							RuntimeLoader: () => ye,
							StateMachineInput: () => le,
							StateMachineInputType: () => ce,
							Testing: () => Y,
							decodeAudio: () => te,
							decodeFont: () => Xe,
							decodeImage: () => We,
						})
					var W = D(1),
						$ = D(2),
						z = D(3),
						oe = D(5),
						ae = (function () {
							var u = function (r, a) {
								return (
									(u =
										Object.setPrototypeOf ||
										({ __proto__: [] } instanceof Array &&
											function (d, m) {
												d.__proto__ = m
											}) ||
										function (d, m) {
											for (var g in m) Object.prototype.hasOwnProperty.call(m, g) && (d[g] = m[g])
										}),
									u(r, a)
								)
							}
							return function (r, a) {
								if (typeof a != 'function' && a !== null) throw new TypeError('Class extends value ' + String(a) + ' is not a constructor or null')
								u(r, a)
								function d() {
									this.constructor = r
								}
								r.prototype = a === null ? Object.create(a) : ((d.prototype = a.prototype), new d())
							}
						})(),
						Q = function (u, r, a, d) {
							function m(g) {
								return g instanceof a
									? g
									: new a(function (w) {
											w(g)
										})
							}
							return new (a || (a = Promise))(function (g, w) {
								function M(G) {
									try {
										F(d.next(G))
									} catch (me) {
										w(me)
									}
								}
								function I(G) {
									try {
										F(d.throw(G))
									} catch (me) {
										w(me)
									}
								}
								function F(G) {
									G.done ? g(G.value) : m(G.value).then(M, I)
								}
								F((d = d.apply(u, r || [])).next())
							})
						},
						S = function (u, r) {
							var a = {
									label: 0,
									sent: function () {
										if (g[0] & 1) throw g[1]
										return g[1]
									},
									trys: [],
									ops: [],
								},
								d,
								m,
								g,
								w = Object.create((typeof Iterator == 'function' ? Iterator : Object).prototype)
							return (
								(w.next = M(0)),
								(w.throw = M(1)),
								(w.return = M(2)),
								typeof Symbol == 'function' &&
									(w[Symbol.iterator] = function () {
										return this
									}),
								w
							)
							function M(F) {
								return function (G) {
									return I([F, G])
								}
							}
							function I(F) {
								if (d) throw new TypeError('Generator is already executing.')
								for (; w && ((w = 0), F[0] && (a = 0)), a; )
									try {
										if (((d = 1), m && (g = F[0] & 2 ? m.return : F[0] ? m.throw || ((g = m.return) && g.call(m), 0) : m.next) && !(g = g.call(m, F[1])).done)) return g
										switch (((m = 0), g && (F = [F[0] & 2, g.value]), F[0])) {
											case 0:
											case 1:
												g = F
												break
											case 4:
												return a.label++, { value: F[1], done: !1 }
											case 5:
												a.label++, (m = F[1]), (F = [0])
												continue
											case 7:
												;(F = a.ops.pop()), a.trys.pop()
												continue
											default:
												if (((g = a.trys), !(g = g.length > 0 && g[g.length - 1]) && (F[0] === 6 || F[0] === 2))) {
													a = 0
													continue
												}
												if (F[0] === 3 && (!g || (F[1] > g[0] && F[1] < g[3]))) {
													a.label = F[1]
													break
												}
												if (F[0] === 6 && a.label < g[1]) {
													;(a.label = g[1]), (g = F)
													break
												}
												if (g && a.label < g[2]) {
													;(a.label = g[2]), a.ops.push(F)
													break
												}
												g[2] && a.ops.pop(), a.trys.pop()
												continue
										}
										F = r.call(u, a)
									} catch (G) {
										;(F = [6, G]), (m = 0)
									} finally {
										d = g = 0
									}
								if (F[0] & 5) throw F[1]
								return { value: F[0] ? F[1] : void 0, done: !0 }
							}
						},
						l = (function (u) {
							ae(r, u)
							function r() {
								var a = (u !== null && u.apply(this, arguments)) || this
								return (a.isHandledError = !0), a
							}
							return r
						})(Error),
						Ae = function (u) {
							return u && u.isHandledError ? u.message : 'Problem loading file; may be corrupt!'
						},
						q
					;(function (u) {
						;(u.Cover = 'cover'),
							(u.Contain = 'contain'),
							(u.Fill = 'fill'),
							(u.FitWidth = 'fitWidth'),
							(u.FitHeight = 'fitHeight'),
							(u.None = 'none'),
							(u.ScaleDown = 'scaleDown'),
							(u.Layout = 'layout')
					})(q || (q = {}))
					var se
					;(function (u) {
						;(u.Center = 'center'),
							(u.TopLeft = 'topLeft'),
							(u.TopCenter = 'topCenter'),
							(u.TopRight = 'topRight'),
							(u.CenterLeft = 'centerLeft'),
							(u.CenterRight = 'centerRight'),
							(u.BottomLeft = 'bottomLeft'),
							(u.BottomCenter = 'bottomCenter'),
							(u.BottomRight = 'bottomRight')
					})(se || (se = {}))
					var Oe = (function () {
							function u(r) {
								var a, d, m, g, w, M, I
								;(this.fit = (a = r == null ? void 0 : r.fit) !== null && a !== void 0 ? a : q.Contain),
									(this.alignment = (d = r == null ? void 0 : r.alignment) !== null && d !== void 0 ? d : se.Center),
									(this.layoutScaleFactor = (m = r == null ? void 0 : r.layoutScaleFactor) !== null && m !== void 0 ? m : 1),
									(this.minX = (g = r == null ? void 0 : r.minX) !== null && g !== void 0 ? g : 0),
									(this.minY = (w = r == null ? void 0 : r.minY) !== null && w !== void 0 ? w : 0),
									(this.maxX = (M = r == null ? void 0 : r.maxX) !== null && M !== void 0 ? M : 0),
									(this.maxY = (I = r == null ? void 0 : r.maxY) !== null && I !== void 0 ? I : 0)
							}
							return (
								(u.new = function (r) {
									var a = r.fit,
										d = r.alignment,
										m = r.minX,
										g = r.minY,
										w = r.maxX,
										M = r.maxY
									return console.warn('This function is deprecated: please use `new Layout({})` instead'), new u({ fit: a, alignment: d, minX: m, minY: g, maxX: w, maxY: M })
								}),
								(u.prototype.copyWith = function (r) {
									var a = r.fit,
										d = r.alignment,
										m = r.layoutScaleFactor,
										g = r.minX,
										w = r.minY,
										M = r.maxX,
										I = r.maxY
									return new u({
										fit: a ?? this.fit,
										alignment: d ?? this.alignment,
										layoutScaleFactor: m ?? this.layoutScaleFactor,
										minX: g ?? this.minX,
										minY: w ?? this.minY,
										maxX: M ?? this.maxX,
										maxY: I ?? this.maxY,
									})
								}),
								(u.prototype.runtimeFit = function (r) {
									if (this.cachedRuntimeFit) return this.cachedRuntimeFit
									var a
									return (
										this.fit === q.Cover
											? (a = r.Fit.cover)
											: this.fit === q.Contain
												? (a = r.Fit.contain)
												: this.fit === q.Fill
													? (a = r.Fit.fill)
													: this.fit === q.FitWidth
														? (a = r.Fit.fitWidth)
														: this.fit === q.FitHeight
															? (a = r.Fit.fitHeight)
															: this.fit === q.ScaleDown
																? (a = r.Fit.scaleDown)
																: this.fit === q.Layout
																	? (a = r.Fit.layout)
																	: (a = r.Fit.none),
										(this.cachedRuntimeFit = a),
										a
									)
								}),
								(u.prototype.runtimeAlignment = function (r) {
									if (this.cachedRuntimeAlignment) return this.cachedRuntimeAlignment
									var a
									return (
										this.alignment === se.TopLeft
											? (a = r.Alignment.topLeft)
											: this.alignment === se.TopCenter
												? (a = r.Alignment.topCenter)
												: this.alignment === se.TopRight
													? (a = r.Alignment.topRight)
													: this.alignment === se.CenterLeft
														? (a = r.Alignment.centerLeft)
														: this.alignment === se.CenterRight
															? (a = r.Alignment.centerRight)
															: this.alignment === se.BottomLeft
																? (a = r.Alignment.bottomLeft)
																: this.alignment === se.BottomCenter
																	? (a = r.Alignment.bottomCenter)
																	: this.alignment === se.BottomRight
																		? (a = r.Alignment.bottomRight)
																		: (a = r.Alignment.center),
										(this.cachedRuntimeAlignment = a),
										a
									)
								}),
								u
							)
						})(),
						ye = (function () {
							function u() {}
							return (
								(u.loadRuntime = function () {
									W.default({
										locateFile: function () {
											return u.wasmURL
										},
									})
										.then(function (r) {
											var a
											for (u.runtime = r; u.callBackQueue.length > 0; ) (a = u.callBackQueue.shift()) === null || a === void 0 || a(u.runtime)
										})
										.catch(function (r) {
											var a = {
												message: (r == null ? void 0 : r.message) || 'Unknown error',
												type: (r == null ? void 0 : r.name) || 'Error',
												wasmError: r instanceof WebAssembly.CompileError || r instanceof WebAssembly.RuntimeError,
												originalError: r,
											}
											console.debug('Rive WASM load error details:', a)
											var d = 'https://cdn.jsdelivr.net/npm/'.concat($.name, '@').concat($.version, '/rive_fallback.wasm')
											if (u.wasmURL.toLowerCase() !== d)
												console.warn('Failed to load WASM from '.concat(u.wasmURL, ' (').concat(a.message, '), trying jsdelivr as a backup')), u.setWasmUrl(d), u.loadRuntime()
											else {
												var m = [
													'Could not load Rive WASM file from '.concat(u.wasmURL, ' or ').concat(d, '.'),
													'Possible reasons:',
													'- Network connection is down',
													'- WebAssembly is not supported in this environment',
													'- The WASM file is corrupted or incompatible',
													`
Error details:`,
													'- Type: '.concat(a.type),
													'- Message: '.concat(a.message),
													'- WebAssembly-specific error: '.concat(a.wasmError),
													`
To resolve, you may need to:`,
													'1. Check your network connection',
													'2. Set a new WASM source via RuntimeLoader.setWasmUrl()',
													'3. Call RuntimeLoader.loadRuntime() again',
												].join(`
`)
												console.error(m)
											}
										})
								}),
								(u.getInstance = function (r) {
									u.isLoading || ((u.isLoading = !0), u.loadRuntime()), u.runtime ? r(u.runtime) : u.callBackQueue.push(r)
								}),
								(u.awaitInstance = function () {
									return new Promise(function (r) {
										return u.getInstance(function (a) {
											return r(a)
										})
									})
								}),
								(u.setWasmUrl = function (r) {
									u.wasmURL = r
								}),
								(u.getWasmUrl = function () {
									return u.wasmURL
								}),
								(u.isLoading = !1),
								(u.callBackQueue = []),
								(u.wasmURL = 'https://unpkg.com/'.concat($.name, '@').concat($.version, '/rive.wasm')),
								u
							)
						})(),
						ce
					;(function (u) {
						;(u[(u.Number = 56)] = 'Number'), (u[(u.Trigger = 58)] = 'Trigger'), (u[(u.Boolean = 59)] = 'Boolean')
					})(ce || (ce = {}))
					var le = (function () {
							function u(r, a) {
								;(this.type = r), (this.runtimeInput = a)
							}
							return (
								Object.defineProperty(u.prototype, 'name', {
									get: function () {
										return this.runtimeInput.name
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'value', {
									get: function () {
										return this.runtimeInput.value
									},
									set: function (r) {
										this.runtimeInput.value = r
									},
									enumerable: !1,
									configurable: !0,
								}),
								(u.prototype.fire = function () {
									this.type === ce.Trigger && this.runtimeInput.fire()
								}),
								(u.prototype.delete = function () {
									this.runtimeInput = null
								}),
								u
							)
						})(),
						Re
					;(function (u) {
						;(u[(u.General = 128)] = 'General'), (u[(u.OpenUrl = 131)] = 'OpenUrl')
					})(Re || (Re = {}))
					var Ce = (function () {
							function u(r, a, d, m) {
								;(this.stateMachine = r), (this.playing = d), (this.artboard = m), (this.inputs = []), (this.instance = new a.StateMachineInstance(r, m)), this.initInputs(a)
							}
							return (
								Object.defineProperty(u.prototype, 'name', {
									get: function () {
										return this.stateMachine.name
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'statesChanged', {
									get: function () {
										for (var r = [], a = 0; a < this.instance.stateChangedCount(); a++) r.push(this.instance.stateChangedNameByIndex(a))
										return r
									},
									enumerable: !1,
									configurable: !0,
								}),
								(u.prototype.advance = function (r) {
									this.instance.advance(r)
								}),
								(u.prototype.advanceAndApply = function (r) {
									this.instance.advanceAndApply(r)
								}),
								(u.prototype.reportedEventCount = function () {
									return this.instance.reportedEventCount()
								}),
								(u.prototype.reportedEventAt = function (r) {
									return this.instance.reportedEventAt(r)
								}),
								(u.prototype.initInputs = function (r) {
									for (var a = 0; a < this.instance.inputCount(); a++) {
										var d = this.instance.input(a)
										this.inputs.push(this.mapRuntimeInput(d, r))
									}
								}),
								(u.prototype.mapRuntimeInput = function (r, a) {
									if (r.type === a.SMIInput.bool) return new le(ce.Boolean, r.asBool())
									if (r.type === a.SMIInput.number) return new le(ce.Number, r.asNumber())
									if (r.type === a.SMIInput.trigger) return new le(ce.Trigger, r.asTrigger())
								}),
								(u.prototype.cleanup = function () {
									this.inputs.forEach(function (r) {
										r.delete()
									}),
										(this.inputs.length = 0),
										this.instance.delete()
								}),
								u
							)
						})(),
						it = (function () {
							function u(r, a, d, m, g) {
								m === void 0 && (m = []), g === void 0 && (g = []), (this.runtime = r), (this.artboard = a), (this.eventManager = d), (this.animations = m), (this.stateMachines = g)
							}
							return (
								(u.prototype.add = function (r, a, d) {
									if ((d === void 0 && (d = !0), (r = pe(r)), r.length === 0))
										this.animations.forEach(function (we) {
											return (we.playing = a)
										}),
											this.stateMachines.forEach(function (we) {
												return (we.playing = a)
											})
									else
										for (
											var m = this.animations.map(function (we) {
													return we.name
												}),
												g = this.stateMachines.map(function (we) {
													return we.name
												}),
												w = 0;
											w < r.length;
											w++
										) {
											var M = m.indexOf(r[w]),
												I = g.indexOf(r[w])
											if (M >= 0 || I >= 0) M >= 0 ? (this.animations[M].playing = a) : (this.stateMachines[I].playing = a)
											else {
												var F = this.artboard.animationByName(r[w])
												if (F) {
													var G = new z.Animation(F, this.artboard, this.runtime, a)
													G.advance(0), G.apply(1), this.animations.push(G)
												} else {
													var me = this.artboard.stateMachineByName(r[w])
													if (me) {
														var Ee = new Ce(me, this.runtime, a, this.artboard)
														this.stateMachines.push(Ee)
													}
												}
											}
										}
									return d && (a ? this.eventManager.fire({ type: O.Play, data: this.playing }) : this.eventManager.fire({ type: O.Pause, data: this.paused })), a ? this.playing : this.paused
								}),
								(u.prototype.initLinearAnimations = function (r, a) {
									for (
										var d = this.animations.map(function (I) {
												return I.name
											}),
											m = 0;
										m < r.length;
										m++
									) {
										var g = d.indexOf(r[m])
										if (g >= 0) this.animations[g].playing = a
										else {
											var w = this.artboard.animationByName(r[m])
											if (w) {
												var M = new z.Animation(w, this.artboard, this.runtime, a)
												M.advance(0), M.apply(1), this.animations.push(M)
											}
										}
									}
								}),
								(u.prototype.initStateMachines = function (r, a) {
									for (
										var d = this.stateMachines.map(function (I) {
												return I.name
											}),
											m = 0;
										m < r.length;
										m++
									) {
										var g = d.indexOf(r[m])
										if (g >= 0) this.stateMachines[g].playing = a
										else {
											var w = this.artboard.stateMachineByName(r[m])
											if (w) {
												var M = new Ce(w, this.runtime, a, this.artboard)
												this.stateMachines.push(M)
											} else this.initLinearAnimations([r[m]], a)
										}
									}
								}),
								(u.prototype.play = function (r) {
									return this.add(r, !0)
								}),
								(u.prototype.pause = function (r) {
									return this.add(r, !1)
								}),
								(u.prototype.scrub = function (r, a) {
									var d = this.animations.filter(function (m) {
										return r.includes(m.name)
									})
									return (
										d.forEach(function (m) {
											return (m.scrubTo = a)
										}),
										d.map(function (m) {
											return m.name
										})
									)
								}),
								Object.defineProperty(u.prototype, 'playing', {
									get: function () {
										return this.animations
											.filter(function (r) {
												return r.playing
											})
											.map(function (r) {
												return r.name
											})
											.concat(
												this.stateMachines
													.filter(function (r) {
														return r.playing
													})
													.map(function (r) {
														return r.name
													})
											)
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'paused', {
									get: function () {
										return this.animations
											.filter(function (r) {
												return !r.playing
											})
											.map(function (r) {
												return r.name
											})
											.concat(
												this.stateMachines
													.filter(function (r) {
														return !r.playing
													})
													.map(function (r) {
														return r.name
													})
											)
									},
									enumerable: !1,
									configurable: !0,
								}),
								(u.prototype.stop = function (r) {
									var a = this
									r = pe(r)
									var d = []
									if (r.length === 0)
										(d = this.animations
											.map(function (w) {
												return w.name
											})
											.concat(
												this.stateMachines.map(function (w) {
													return w.name
												})
											)),
											this.animations.forEach(function (w) {
												return w.cleanup()
											}),
											this.stateMachines.forEach(function (w) {
												return w.cleanup()
											}),
											this.animations.splice(0, this.animations.length),
											this.stateMachines.splice(0, this.stateMachines.length)
									else {
										var m = this.animations.filter(function (w) {
											return r.includes(w.name)
										})
										m.forEach(function (w) {
											w.cleanup(), a.animations.splice(a.animations.indexOf(w), 1)
										})
										var g = this.stateMachines.filter(function (w) {
											return r.includes(w.name)
										})
										g.forEach(function (w) {
											w.cleanup(), a.stateMachines.splice(a.stateMachines.indexOf(w), 1)
										}),
											(d = m
												.map(function (w) {
													return w.name
												})
												.concat(
													g.map(function (w) {
														return w.name
													})
												))
									}
									return this.eventManager.fire({ type: O.Stop, data: d }), d
								}),
								Object.defineProperty(u.prototype, 'isPlaying', {
									get: function () {
										return (
											this.animations.reduce(function (r, a) {
												return r || a.playing
											}, !1) ||
											this.stateMachines.reduce(function (r, a) {
												return r || a.playing
											}, !1)
										)
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'isPaused', {
									get: function () {
										return !this.isPlaying && (this.animations.length > 0 || this.stateMachines.length > 0)
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'isStopped', {
									get: function () {
										return this.animations.length === 0 && this.stateMachines.length === 0
									},
									enumerable: !1,
									configurable: !0,
								}),
								(u.prototype.atLeastOne = function (r, a) {
									a === void 0 && (a = !0)
									var d
									return (
										this.animations.length === 0 &&
											this.stateMachines.length === 0 &&
											(this.artboard.animationCount() > 0
												? this.add([(d = this.artboard.animationByIndex(0).name)], r, a)
												: this.artboard.stateMachineCount() > 0 && this.add([(d = this.artboard.stateMachineByIndex(0).name)], r, a)),
										d
									)
								}),
								(u.prototype.handleLooping = function () {
									for (
										var r = 0,
											a = this.animations.filter(function (m) {
												return m.playing
											});
										r < a.length;
										r++
									) {
										var d = a[r]
										d.loopValue === 0 && d.loopCount
											? ((d.loopCount = 0), this.stop(d.name))
											: d.loopValue === 1 && d.loopCount
												? (this.eventManager.fire({ type: O.Loop, data: { animation: d.name, type: Pe.Loop } }), (d.loopCount = 0))
												: d.loopValue === 2 && d.loopCount > 1 && (this.eventManager.fire({ type: O.Loop, data: { animation: d.name, type: Pe.PingPong } }), (d.loopCount = 0))
									}
								}),
								(u.prototype.handleStateChanges = function () {
									for (
										var r = [],
											a = 0,
											d = this.stateMachines.filter(function (g) {
												return g.playing
											});
										a < d.length;
										a++
									) {
										var m = d[a]
										r.push.apply(r, m.statesChanged)
									}
									r.length > 0 && this.eventManager.fire({ type: O.StateChange, data: r })
								}),
								(u.prototype.handleAdvancing = function (r) {
									this.eventManager.fire({ type: O.Advance, data: r })
								}),
								u
							)
						})(),
						O
					;(function (u) {
						;(u.Load = 'load'),
							(u.LoadError = 'loaderror'),
							(u.Play = 'play'),
							(u.Pause = 'pause'),
							(u.Stop = 'stop'),
							(u.Loop = 'loop'),
							(u.Draw = 'draw'),
							(u.Advance = 'advance'),
							(u.StateChange = 'statechange'),
							(u.RiveEvent = 'riveevent'),
							(u.AudioStatusChange = 'audiostatuschange')
					})(O || (O = {}))
					var Pe
					;(function (u) {
						;(u.OneShot = 'oneshot'), (u.Loop = 'loop'), (u.PingPong = 'pingpong')
					})(Pe || (Pe = {}))
					var fe = (function () {
							function u(r) {
								r === void 0 && (r = []), (this.listeners = r)
							}
							return (
								(u.prototype.getListeners = function (r) {
									return this.listeners.filter(function (a) {
										return a.type === r
									})
								}),
								(u.prototype.add = function (r) {
									this.listeners.includes(r) || this.listeners.push(r)
								}),
								(u.prototype.remove = function (r) {
									for (var a = 0; a < this.listeners.length; a++) {
										var d = this.listeners[a]
										if (d.type === r.type && d.callback === r.callback) {
											this.listeners.splice(a, 1)
											break
										}
									}
								}),
								(u.prototype.removeAll = function (r) {
									var a = this
									r
										? this.listeners
												.filter(function (d) {
													return d.type === r
												})
												.forEach(function (d) {
													return a.remove(d)
												})
										: this.listeners.splice(0, this.listeners.length)
								}),
								(u.prototype.fire = function (r) {
									var a = this.getListeners(r.type)
									a.forEach(function (d) {
										return d.callback(r)
									})
								}),
								u
							)
						})(),
						qe = (function () {
							function u(r) {
								;(this.eventManager = r), (this.queue = [])
							}
							return (
								(u.prototype.add = function (r) {
									this.queue.push(r)
								}),
								(u.prototype.process = function () {
									for (; this.queue.length > 0; ) {
										var r = this.queue.shift()
										r != null && r.action && r.action(), r != null && r.event && this.eventManager.fire(r.event)
									}
								}),
								u
							)
						})(),
						ee
					;(function (u) {
						;(u[(u.AVAILABLE = 0)] = 'AVAILABLE'), (u[(u.UNAVAILABLE = 1)] = 'UNAVAILABLE')
					})(ee || (ee = {}))
					var Le = (function (u) {
							ae(r, u)
							function r() {
								var a = (u !== null && u.apply(this, arguments)) || this
								return (a._started = !1), (a._enabled = !1), (a._status = ee.UNAVAILABLE), a
							}
							return (
								(r.prototype.delay = function (a) {
									return Q(this, void 0, void 0, function () {
										return S(this, function (d) {
											return [
												2,
												new Promise(function (m) {
													return setTimeout(m, a)
												}),
											]
										})
									})
								}),
								(r.prototype.timeout = function () {
									return Q(this, void 0, void 0, function () {
										return S(this, function (a) {
											return [
												2,
												new Promise(function (d, m) {
													return setTimeout(m, 50)
												}),
											]
										})
									})
								}),
								(r.prototype.reportToListeners = function () {
									this.fire({ type: O.AudioStatusChange }), this.removeAll()
								}),
								(r.prototype.enableAudio = function () {
									return Q(this, void 0, void 0, function () {
										return S(this, function (a) {
											return this._enabled || ((this._enabled = !0), (this._status = ee.AVAILABLE), this.reportToListeners()), [2]
										})
									})
								}),
								(r.prototype.testAudio = function () {
									return Q(this, void 0, void 0, function () {
										return S(this, function (a) {
											switch (a.label) {
												case 0:
													if (!(this._status === ee.UNAVAILABLE && this._audioContext !== null)) return [3, 4]
													a.label = 1
												case 1:
													return a.trys.push([1, 3, , 4]), [4, Promise.race([this._audioContext.resume(), this.timeout()])]
												case 2:
													return a.sent(), this.enableAudio(), [3, 4]
												case 3:
													return a.sent(), [3, 4]
												case 4:
													return [2]
											}
										})
									})
								}),
								(r.prototype._establishAudio = function () {
									return Q(this, void 0, void 0, function () {
										return S(this, function (a) {
											switch (a.label) {
												case 0:
													return this._started ? [3, 5] : ((this._started = !0), typeof window > 'u' ? (this.enableAudio(), [3, 5]) : [3, 1])
												case 1:
													;(this._audioContext = new AudioContext()), this.listenForUserAction(), (a.label = 2)
												case 2:
													return this._status !== ee.UNAVAILABLE ? [3, 5] : [4, this.testAudio()]
												case 3:
													return a.sent(), [4, this.delay(1e3)]
												case 4:
													return a.sent(), [3, 2]
												case 5:
													return [2]
											}
										})
									})
								}),
								(r.prototype.listenForUserAction = function () {
									var a = this,
										d = function () {
											return Q(a, void 0, void 0, function () {
												return S(this, function (m) {
													return this.enableAudio(), [2]
												})
											})
										}
									document.addEventListener('pointerdown', d, { once: !0 })
								}),
								(r.prototype.establishAudio = function () {
									return Q(this, void 0, void 0, function () {
										return S(this, function (a) {
											return this._establishAudio(), [2]
										})
									})
								}),
								Object.defineProperty(r.prototype, 'systemVolume', {
									get: function () {
										return this._status === ee.UNAVAILABLE ? (this.testAudio(), 0) : 1
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(r.prototype, 'status', {
									get: function () {
										return this._status
									},
									enumerable: !1,
									configurable: !0,
								}),
								r
							)
						})(fe),
						he = new Le(),
						Ue = (function () {
							function u() {}
							return (u.prototype.observe = function () {}), (u.prototype.unobserve = function () {}), (u.prototype.disconnect = function () {}), u
						})(),
						He = globalThis.ResizeObserver || Ue,
						ne = (function () {
							function u() {
								var r = this
								;(this._elementsMap = new Map()),
									(this._onObservedEntry = function (a) {
										var d = r._elementsMap.get(a.target)
										d !== null ? d.onResize(a.target.clientWidth == 0 || a.target.clientHeight == 0) : r._resizeObserver.unobserve(a.target)
									}),
									(this._onObserved = function (a) {
										a.forEach(r._onObservedEntry)
									}),
									(this._resizeObserver = new He(this._onObserved))
							}
							return (
								(u.prototype.add = function (r, a) {
									var d = { onResize: a, element: r }
									return this._elementsMap.set(r, d), this._resizeObserver.observe(r), d
								}),
								(u.prototype.remove = function (r) {
									this._resizeObserver.unobserve(r.element), this._elementsMap.delete(r.element)
								}),
								u
							)
						})(),
						ot = new ne(),
						de = (function () {
							function u(r) {
								;(this.enableRiveAssetCDN = !0),
									(this.referenceCount = 0),
									(this.destroyed = !1),
									(this.src = r.src),
									(this.buffer = r.buffer),
									r.assetLoader && (this.assetLoader = r.assetLoader),
									(this.enableRiveAssetCDN = typeof r.enableRiveAssetCDN == 'boolean' ? r.enableRiveAssetCDN : !0),
									(this.eventManager = new fe()),
									r.onLoad && this.on(O.Load, r.onLoad),
									r.onLoadError && this.on(O.LoadError, r.onLoadError)
							}
							return (
								(u.prototype.initData = function () {
									return Q(this, void 0, void 0, function () {
										var r, a, d, m
										return S(this, function (g) {
											switch (g.label) {
												case 0:
													return this.src ? ((r = this), [4, be(this.src)]) : [3, 2]
												case 1:
													;(r.buffer = g.sent()), (g.label = 2)
												case 2:
													return this.destroyed
														? [2]
														: (this.assetLoader && (a = new this.runtime.CustomFileAssetLoader({ loadContents: this.assetLoader })),
															(d = this),
															[4, this.runtime.load(new Uint8Array(this.buffer), a, this.enableRiveAssetCDN)])
												case 3:
													if (((d.file = g.sent()), this.destroyed)) return (m = this.file) === null || m === void 0 || m.delete(), (this.file = null), [2]
													if (this.file !== null) this.eventManager.fire({ type: O.Load, data: this })
													else throw (this.eventManager.fire({ type: O.LoadError, data: null }), new Error(u.fileLoadErrorMessage))
													return [2]
											}
										})
									})
								}),
								(u.prototype.init = function () {
									return Q(this, void 0, void 0, function () {
										var r
										return S(this, function (a) {
											switch (a.label) {
												case 0:
													if (!this.src && !this.buffer) throw new Error(u.missingErrorMessage)
													return (r = this), [4, ye.awaitInstance()]
												case 1:
													return (r.runtime = a.sent()), this.destroyed ? [2] : [4, this.initData()]
												case 2:
													return a.sent(), [2]
											}
										})
									})
								}),
								(u.prototype.on = function (r, a) {
									this.eventManager.add({ type: r, callback: a })
								}),
								(u.prototype.off = function (r, a) {
									this.eventManager.remove({ type: r, callback: a })
								}),
								(u.prototype.cleanup = function () {
									var r
									;(this.referenceCount -= 1),
										this.referenceCount <= 0 && (this.removeAllRiveEventListeners(), (r = this.file) === null || r === void 0 || r.delete(), (this.file = null), (this.destroyed = !0))
								}),
								(u.prototype.removeAllRiveEventListeners = function (r) {
									this.eventManager.removeAll(r)
								}),
								(u.prototype.getInstance = function () {
									if (this.file !== null) return (this.referenceCount += 1), this.file
								}),
								(u.missingErrorMessage = 'Rive source file or data buffer required'),
								(u.fileLoadErrorMessage = 'The file failed to load'),
								u
							)
						})(),
						ie = (function () {
							function u(r) {
								var a = this,
									d
								;(this.loaded = !1),
									(this._observed = null),
									(this.readyForPlaying = !1),
									(this.artboard = null),
									(this.eventCleanup = null),
									(this.shouldDisableRiveListeners = !1),
									(this.automaticallyHandleEvents = !1),
									(this.enableRiveAssetCDN = !0),
									(this._volume = 1),
									(this._artboardWidth = void 0),
									(this._artboardHeight = void 0),
									(this._devicePixelRatioUsed = 1),
									(this._hasZeroSize = !1),
									(this._audioEventListener = null),
									(this._boundDraw = null),
									(this.durations = []),
									(this.frameTimes = []),
									(this.frameCount = 0),
									(this.isTouchScrollEnabled = !1),
									(this.onCanvasResize = function (m) {
										var g = a._hasZeroSize !== m
										;(a._hasZeroSize = m), m ? (!a._layout.maxX || !a._layout.maxY) && a.resizeToCanvas() : g && a.resizeDrawingSurfaceToCanvas()
									}),
									(this.renderSecondTimer = 0),
									(this._boundDraw = this.draw.bind(this)),
									(this.canvas = r.canvas),
									r.canvas.constructor === HTMLCanvasElement && (this._observed = ot.add(this.canvas, this.onCanvasResize)),
									(this.src = r.src),
									(this.buffer = r.buffer),
									(this.riveFile = r.riveFile),
									(this.layout = (d = r.layout) !== null && d !== void 0 ? d : new Oe()),
									(this.shouldDisableRiveListeners = !!r.shouldDisableRiveListeners),
									(this.isTouchScrollEnabled = !!r.isTouchScrollEnabled),
									(this.automaticallyHandleEvents = !!r.automaticallyHandleEvents),
									(this.enableRiveAssetCDN = r.enableRiveAssetCDN === void 0 ? !0 : r.enableRiveAssetCDN),
									(this.eventManager = new fe()),
									r.onLoad && this.on(O.Load, r.onLoad),
									r.onLoadError && this.on(O.LoadError, r.onLoadError),
									r.onPlay && this.on(O.Play, r.onPlay),
									r.onPause && this.on(O.Pause, r.onPause),
									r.onStop && this.on(O.Stop, r.onStop),
									r.onLoop && this.on(O.Loop, r.onLoop),
									r.onStateChange && this.on(O.StateChange, r.onStateChange),
									r.onAdvance && this.on(O.Advance, r.onAdvance),
									r.onload && !r.onLoad && this.on(O.Load, r.onload),
									r.onloaderror && !r.onLoadError && this.on(O.LoadError, r.onloaderror),
									r.onplay && !r.onPlay && this.on(O.Play, r.onplay),
									r.onpause && !r.onPause && this.on(O.Pause, r.onpause),
									r.onstop && !r.onStop && this.on(O.Stop, r.onstop),
									r.onloop && !r.onLoop && this.on(O.Loop, r.onloop),
									r.onstatechange && !r.onStateChange && this.on(O.StateChange, r.onstatechange),
									r.assetLoader && (this.assetLoader = r.assetLoader),
									(this.taskQueue = new qe(this.eventManager)),
									this.init({
										src: this.src,
										buffer: this.buffer,
										riveFile: this.riveFile,
										autoplay: r.autoplay,
										animations: r.animations,
										stateMachines: r.stateMachines,
										artboard: r.artboard,
										useOffscreenRenderer: r.useOffscreenRenderer,
									})
							}
							return (
								(u.new = function (r) {
									return console.warn('This function is deprecated: please use `new Rive({})` instead'), new u(r)
								}),
								(u.prototype.onSystemAudioChanged = function () {
									this.volume = this._volume
								}),
								(u.prototype.init = function (r) {
									var a = this,
										d = r.src,
										m = r.buffer,
										g = r.riveFile,
										w = r.animations,
										M = r.stateMachines,
										I = r.artboard,
										F = r.autoplay,
										G = F === void 0 ? !1 : F,
										me = r.useOffscreenRenderer,
										Ee = me === void 0 ? !1 : me
									if (((this.src = d), (this.buffer = m), (this.riveFile = g), !this.src && !this.buffer && !this.riveFile)) throw new Error(u.missingErrorMessage)
									var we = pe(w),
										et = pe(M)
									;(this.loaded = !1),
										(this.readyForPlaying = !1),
										ye
											.awaitInstance()
											.then(function (je) {
												;(a.runtime = je),
													a.removeRiveListeners(),
													a.deleteRiveRenderer(),
													(a.renderer = a.runtime.makeRenderer(a.canvas, Ee)),
													a.canvas.width || a.canvas.height || a.resizeDrawingSurfaceToCanvas(),
													a
														.initData(I, we, et, G)
														.then(function () {
															return a.setupRiveListeners()
														})
														.catch(function (Me) {
															console.error(Me)
														})
											})
											.catch(function (je) {
												console.error(je)
											})
								}),
								(u.prototype.setupRiveListeners = function (r) {
									var a = this
									if ((this.eventCleanup && this.eventCleanup(), !this.shouldDisableRiveListeners)) {
										var d = (this.animator.stateMachines || [])
												.filter(function (g) {
													return g.playing && a.runtime.hasListeners(g.instance)
												})
												.map(function (g) {
													return g.instance
												}),
											m = this.isTouchScrollEnabled
										r && 'isTouchScrollEnabled' in r && (m = r.isTouchScrollEnabled),
											(this.eventCleanup = (0, oe.registerTouchInteractions)({
												canvas: this.canvas,
												artboard: this.artboard,
												stateMachines: d,
												renderer: this.renderer,
												rive: this.runtime,
												fit: this._layout.runtimeFit(this.runtime),
												alignment: this._layout.runtimeAlignment(this.runtime),
												isTouchScrollEnabled: m,
												layoutScaleFactor: this._layout.layoutScaleFactor,
											}))
									}
								}),
								(u.prototype.removeRiveListeners = function () {
									this.eventCleanup && (this.eventCleanup(), (this.eventCleanup = null))
								}),
								(u.prototype.initializeAudio = function () {
									var r = this,
										a
									he.status == ee.UNAVAILABLE &&
										!((a = this.artboard) === null || a === void 0) &&
										a.hasAudio &&
										this._audioEventListener === null &&
										((this._audioEventListener = {
											type: O.AudioStatusChange,
											callback: function () {
												return r.onSystemAudioChanged()
											},
										}),
										he.add(this._audioEventListener),
										he.establishAudio())
								}),
								(u.prototype.initArtboardSize = function () {
									this.artboard &&
										((this._artboardWidth = this.artboard.width = this._artboardWidth || this.artboard.width),
										(this._artboardHeight = this.artboard.height = this._artboardHeight || this.artboard.height))
								}),
								(u.prototype.initData = function (r, a, d, m) {
									return Q(this, void 0, void 0, function () {
										var g, w, M
										return S(this, function (I) {
											switch (I.label) {
												case 0:
													return (
														I.trys.push([0, 3, , 4]),
														this.riveFile != null
															? [3, 2]
															: ((this.riveFile = new de({ src: this.src, buffer: this.buffer, enableRiveAssetCDN: this.enableRiveAssetCDN, assetLoader: this.assetLoader })),
																[4, this.riveFile.init()])
													)
												case 1:
													I.sent(), (I.label = 2)
												case 2:
													if (!this.riveFile) throw new l(u.cleanupErrorMessage)
													return (
														(this.file = this.riveFile.getInstance()),
														this.initArtboard(r, a, d, m),
														this.initArtboardSize(),
														this.initializeAudio(),
														(this.loaded = !0),
														this.eventManager.fire({ type: O.Load, data: (M = this.src) !== null && M !== void 0 ? M : 'buffer' }),
														(this.readyForPlaying = !0),
														this.taskQueue.process(),
														this.drawFrame(),
														[2, Promise.resolve()]
													)
												case 3:
													return (g = I.sent()), (w = Ae(g)), console.warn(w), this.eventManager.fire({ type: O.LoadError, data: w }), [2, Promise.reject(w)]
												case 4:
													return [2]
											}
										})
									})
								}),
								(u.prototype.initArtboard = function (r, a, d, m) {
									if (this.file) {
										var g = r ? this.file.artboardByName(r) : this.file.defaultArtboard()
										if (!g) {
											var w = 'Invalid artboard name or no default artboard'
											console.warn(w), this.eventManager.fire({ type: O.LoadError, data: w })
											return
										}
										if (((this.artboard = g), (g.volume = this._volume * he.systemVolume), this.artboard.animationCount() < 1)) {
											var w = 'Artboard has no animations'
											throw (this.eventManager.fire({ type: O.LoadError, data: w }), w)
										}
										this.animator = new it(this.runtime, this.artboard, this.eventManager)
										var M
										a.length > 0 || d.length > 0 ? ((M = a.concat(d)), this.animator.initLinearAnimations(a, m), this.animator.initStateMachines(d, m)) : (M = [this.animator.atLeastOne(m, !1)]),
											this.taskQueue.add({ event: { type: m ? O.Play : O.Pause, data: M } })
									}
								}),
								(u.prototype.drawFrame = function () {
									var r
									!((r = document == null ? void 0 : document.timeline) === null || r === void 0) && r.currentTime
										? this.loaded && this.artboard && !this.frameRequestId && this._boundDraw(document.timeline.currentTime)
										: this.startRendering()
								}),
								(u.prototype.draw = function (r, a) {
									this.frameRequestId = null
									var d = performance.now()
									this.lastRenderTime || (this.lastRenderTime = r),
										(this.renderSecondTimer += r - this.lastRenderTime),
										this.renderSecondTimer > 5e3 && ((this.renderSecondTimer = 0), a == null || a())
									var m = (r - this.lastRenderTime) / 1e3
									this.lastRenderTime = r
									for (
										var g = this.animator.animations
												.filter(function (ke) {
													return ke.playing || ke.needsScrub
												})
												.sort(function (ke) {
													return ke.needsScrub ? -1 : 1
												}),
											w = 0,
											M = g;
										w < M.length;
										w++
									) {
										var I = M[w]
										I.advance(m), I.instance.didLoop && (I.loopCount += 1), I.apply(1)
									}
									for (
										var F = this.animator.stateMachines.filter(function (ke) {
												return ke.playing
											}),
											G = 0,
											me = F;
										G < me.length;
										G++
									) {
										var Ee = me[G],
											we = Ee.reportedEventCount()
										if (we)
											for (var et = 0; et < we; et++) {
												var je = Ee.reportedEventAt(et)
												if (je)
													if (je.type === Re.OpenUrl) {
														if ((this.eventManager.fire({ type: O.RiveEvent, data: je }), this.automaticallyHandleEvents)) {
															var Me = document.createElement('a'),
																pt = je,
																xt = pt.url,
																vt = pt.target,
																mt = (0, oe.sanitizeUrl)(xt)
															xt && Me.setAttribute('href', mt), vt && Me.setAttribute('target', vt), mt && mt !== oe.BLANK_URL && Me.click()
														}
													} else this.eventManager.fire({ type: O.RiveEvent, data: je })
											}
										Ee.advanceAndApply(m)
									}
									this.animator.stateMachines.length == 0 && this.artboard.advance(m)
									var xe = this.renderer
									xe.clear(),
										xe.save(),
										this.alignRenderer(),
										this._hasZeroSize || this.artboard.draw(xe),
										xe.restore(),
										xe.flush(),
										this.animator.handleLooping(),
										this.animator.handleStateChanges(),
										this.animator.handleAdvancing(m),
										this.frameCount++
									var At = performance.now()
									for (this.frameTimes.push(At), this.durations.push(At - d); this.frameTimes[0] <= At - 1e3; ) this.frameTimes.shift(), this.durations.shift()
									this.animator.isPlaying ? this.startRendering() : this.animator.isPaused ? (this.lastRenderTime = 0) : this.animator.isStopped && (this.lastRenderTime = 0)
								}),
								(u.prototype.alignRenderer = function () {
									var r = this,
										a = r.renderer,
										d = r.runtime,
										m = r._layout,
										g = r.artboard
									a.align(m.runtimeFit(d), m.runtimeAlignment(d), { minX: m.minX, minY: m.minY, maxX: m.maxX, maxY: m.maxY }, g.bounds, this._devicePixelRatioUsed * m.layoutScaleFactor)
								}),
								Object.defineProperty(u.prototype, 'fps', {
									get: function () {
										return this.durations.length
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'frameTime', {
									get: function () {
										return this.durations.length === 0
											? 0
											: (
													this.durations.reduce(function (r, a) {
														return r + a
													}, 0) / this.durations.length
												).toFixed(4)
									},
									enumerable: !1,
									configurable: !0,
								}),
								(u.prototype.cleanup = function () {
									var r
									this.stopRendering(),
										this.cleanupInstances(),
										this._observed !== null && ot.remove(this._observed),
										this.removeRiveListeners(),
										(r = this.riveFile) === null || r === void 0 || r.cleanup(),
										(this.riveFile = null),
										(this.file = null),
										this.deleteRiveRenderer(),
										this._audioEventListener !== null && (he.remove(this._audioEventListener), (this._audioEventListener = null))
								}),
								(u.prototype.deleteRiveRenderer = function () {
									var r
									;(r = this.renderer) === null || r === void 0 || r.delete(), (this.renderer = null)
								}),
								(u.prototype.cleanupInstances = function () {
									this.eventCleanup !== null && this.eventCleanup(), this.stop(), this.artboard && (this.artboard.delete(), (this.artboard = null))
								}),
								(u.prototype.retrieveTextRun = function (r) {
									var a
									if (!r) {
										console.warn('No text run name provided')
										return
									}
									if (!this.artboard) {
										console.warn('Tried to access text run, but the Artboard is null')
										return
									}
									var d = this.artboard.textRun(r)
									if (!d) {
										console.warn(
											"Could not access a text run with name '"
												.concat(r, "' in the '")
												.concat(
													(a = this.artboard) === null || a === void 0 ? void 0 : a.name,
													"' Artboard. Note that you must rename a text run node in the Rive editor to make it queryable at runtime."
												)
										)
										return
									}
									return d
								}),
								(u.prototype.getTextRunValue = function (r) {
									var a = this.retrieveTextRun(r)
									return a ? a.text : void 0
								}),
								(u.prototype.setTextRunValue = function (r, a) {
									var d = this.retrieveTextRun(r)
									d && (d.text = a)
								}),
								(u.prototype.play = function (r, a) {
									var d = this
									if (((r = pe(r)), !this.readyForPlaying)) {
										this.taskQueue.add({
											action: function () {
												return d.play(r, a)
											},
										})
										return
									}
									this.animator.play(r), this.eventCleanup && this.eventCleanup(), this.setupRiveListeners(), this.startRendering()
								}),
								(u.prototype.pause = function (r) {
									var a = this
									if (((r = pe(r)), !this.readyForPlaying)) {
										this.taskQueue.add({
											action: function () {
												return a.pause(r)
											},
										})
										return
									}
									this.eventCleanup && this.eventCleanup(), this.animator.pause(r)
								}),
								(u.prototype.scrub = function (r, a) {
									var d = this
									if (((r = pe(r)), !this.readyForPlaying)) {
										this.taskQueue.add({
											action: function () {
												return d.scrub(r, a)
											},
										})
										return
									}
									this.animator.scrub(r, a || 0), this.drawFrame()
								}),
								(u.prototype.stop = function (r) {
									var a = this
									if (((r = pe(r)), !this.readyForPlaying)) {
										this.taskQueue.add({
											action: function () {
												return a.stop(r)
											},
										})
										return
									}
									this.animator && this.animator.stop(r), this.eventCleanup && this.eventCleanup()
								}),
								(u.prototype.reset = function (r) {
									var a,
										d = r == null ? void 0 : r.artboard,
										m = pe(r == null ? void 0 : r.animations),
										g = pe(r == null ? void 0 : r.stateMachines),
										w = (a = r == null ? void 0 : r.autoplay) !== null && a !== void 0 ? a : !1
									this.cleanupInstances(), this.initArtboard(d, m, g, w), this.taskQueue.process()
								}),
								(u.prototype.load = function (r) {
									;(this.file = null), this.stop(), this.init(r)
								}),
								Object.defineProperty(u.prototype, 'layout', {
									get: function () {
										return this._layout
									},
									set: function (r) {
										;(this._layout = r), (!r.maxX || !r.maxY) && this.resizeToCanvas(), this.loaded && !this.animator.isPlaying && this.drawFrame()
									},
									enumerable: !1,
									configurable: !0,
								}),
								(u.prototype.resizeToCanvas = function () {
									this._layout = this.layout.copyWith({ minX: 0, minY: 0, maxX: this.canvas.width, maxY: this.canvas.height })
								}),
								(u.prototype.resizeDrawingSurfaceToCanvas = function (r) {
									if (this.canvas instanceof HTMLCanvasElement && window) {
										var a = this.canvas.getBoundingClientRect(),
											d = a.width,
											m = a.height,
											g = r || window.devicePixelRatio || 1
										if (((this.devicePixelRatioUsed = g), (this.canvas.width = g * d), (this.canvas.height = g * m), this.resizeToCanvas(), this.drawFrame(), this.layout.fit === q.Layout)) {
											var w = this._layout.layoutScaleFactor
											;(this.artboard.width = d / w), (this.artboard.height = m / w)
										}
									}
								}),
								Object.defineProperty(u.prototype, 'source', {
									get: function () {
										return this.src
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'activeArtboard', {
									get: function () {
										return this.artboard ? this.artboard.name : ''
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'animationNames', {
									get: function () {
										if (!this.loaded || !this.artboard) return []
										for (var r = [], a = 0; a < this.artboard.animationCount(); a++) r.push(this.artboard.animationByIndex(a).name)
										return r
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'stateMachineNames', {
									get: function () {
										if (!this.loaded || !this.artboard) return []
										for (var r = [], a = 0; a < this.artboard.stateMachineCount(); a++) r.push(this.artboard.stateMachineByIndex(a).name)
										return r
									},
									enumerable: !1,
									configurable: !0,
								}),
								(u.prototype.stateMachineInputs = function (r) {
									if (this.loaded) {
										var a = this.animator.stateMachines.find(function (d) {
											return d.name === r
										})
										return a == null ? void 0 : a.inputs
									}
								}),
								(u.prototype.retrieveInputAtPath = function (r, a) {
									if (!r) {
										console.warn("No input name provided for path '".concat(a, "'"))
										return
									}
									if (!this.artboard) {
										console.warn("Tried to access input: '".concat(r, "', at path: '").concat(a, "', but the Artboard is null"))
										return
									}
									var d = this.artboard.inputByPath(r, a)
									if (!d) {
										console.warn("Could not access an input with name: '".concat(r, "', at path:'").concat(a, "'"))
										return
									}
									return d
								}),
								(u.prototype.setBooleanStateAtPath = function (r, a, d) {
									var m = this.retrieveInputAtPath(r, d)
									m && (m.type === ce.Boolean ? (m.asBool().value = a) : console.warn("Input with name: '".concat(r, "', at path:'").concat(d, "' is not a boolean")))
								}),
								(u.prototype.setNumberStateAtPath = function (r, a, d) {
									var m = this.retrieveInputAtPath(r, d)
									m && (m.type === ce.Number ? (m.asNumber().value = a) : console.warn("Input with name: '".concat(r, "', at path:'").concat(d, "' is not a number")))
								}),
								(u.prototype.fireStateAtPath = function (r, a) {
									var d = this.retrieveInputAtPath(r, a)
									d && (d.type === ce.Trigger ? d.asTrigger().fire() : console.warn("Input with name: '".concat(r, "', at path:'").concat(a, "' is not a trigger")))
								}),
								(u.prototype.retrieveTextAtPath = function (r, a) {
									if (!r) {
										console.warn("No text name provided for path '".concat(a, "'"))
										return
									}
									if (!a) {
										console.warn("No path provided for text '".concat(r, "'"))
										return
									}
									if (!this.artboard) {
										console.warn("Tried to access text: '".concat(r, "', at path: '").concat(a, "', but the Artboard is null"))
										return
									}
									var d = this.artboard.textByPath(r, a)
									if (!d) {
										console.warn("Could not access text with name: '".concat(r, "', at path:'").concat(a, "'"))
										return
									}
									return d
								}),
								(u.prototype.getTextRunValueAtPath = function (r, a) {
									var d = this.retrieveTextAtPath(r, a)
									if (!d) {
										console.warn("Could not get text with name: '".concat(r, "', at path:'").concat(a, "'"))
										return
									}
									return d.text
								}),
								(u.prototype.setTextRunValueAtPath = function (r, a, d) {
									var m = this.retrieveTextAtPath(r, d)
									if (!m) {
										console.warn("Could not set text with name: '".concat(r, "', at path:'").concat(d, "'"))
										return
									}
									m.text = a
								}),
								Object.defineProperty(u.prototype, 'playingStateMachineNames', {
									get: function () {
										return this.loaded
											? this.animator.stateMachines
													.filter(function (r) {
														return r.playing
													})
													.map(function (r) {
														return r.name
													})
											: []
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'playingAnimationNames', {
									get: function () {
										return this.loaded
											? this.animator.animations
													.filter(function (r) {
														return r.playing
													})
													.map(function (r) {
														return r.name
													})
											: []
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'pausedAnimationNames', {
									get: function () {
										return this.loaded
											? this.animator.animations
													.filter(function (r) {
														return !r.playing
													})
													.map(function (r) {
														return r.name
													})
											: []
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'pausedStateMachineNames', {
									get: function () {
										return this.loaded
											? this.animator.stateMachines
													.filter(function (r) {
														return !r.playing
													})
													.map(function (r) {
														return r.name
													})
											: []
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'isPlaying', {
									get: function () {
										return this.animator.isPlaying
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'isPaused', {
									get: function () {
										return this.animator.isPaused
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'isStopped', {
									get: function () {
										return this.animator.isStopped
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'bounds', {
									get: function () {
										return this.artboard ? this.artboard.bounds : void 0
									},
									enumerable: !1,
									configurable: !0,
								}),
								(u.prototype.on = function (r, a) {
									this.eventManager.add({ type: r, callback: a })
								}),
								(u.prototype.off = function (r, a) {
									this.eventManager.remove({ type: r, callback: a })
								}),
								(u.prototype.unsubscribe = function (r, a) {
									console.warn('This function is deprecated: please use `off()` instead.'), this.off(r, a)
								}),
								(u.prototype.removeAllRiveEventListeners = function (r) {
									this.eventManager.removeAll(r)
								}),
								(u.prototype.unsubscribeAll = function (r) {
									console.warn('This function is deprecated: please use `removeAllRiveEventListeners()` instead.'), this.removeAllRiveEventListeners(r)
								}),
								(u.prototype.stopRendering = function () {
									this.loaded &&
										this.frameRequestId &&
										(this.runtime.cancelAnimationFrame ? this.runtime.cancelAnimationFrame(this.frameRequestId) : cancelAnimationFrame(this.frameRequestId), (this.frameRequestId = null))
								}),
								(u.prototype.startRendering = function () {
									this.loaded &&
										this.artboard &&
										!this.frameRequestId &&
										(this.runtime.requestAnimationFrame ? (this.frameRequestId = this.runtime.requestAnimationFrame(this._boundDraw)) : (this.frameRequestId = requestAnimationFrame(this._boundDraw)))
								}),
								(u.prototype.enableFPSCounter = function (r) {
									this.runtime.enableFPSCounter(r)
								}),
								(u.prototype.disableFPSCounter = function () {
									this.runtime.disableFPSCounter()
								}),
								Object.defineProperty(u.prototype, 'contents', {
									get: function () {
										if (this.loaded) {
											for (var r = { artboards: [] }, a = 0; a < this.file.artboardCount(); a++) {
												for (var d = this.file.artboardByIndex(a), m = { name: d.name, animations: [], stateMachines: [] }, g = 0; g < d.animationCount(); g++) {
													var w = d.animationByIndex(g)
													m.animations.push(w.name)
												}
												for (var M = 0; M < d.stateMachineCount(); M++) {
													for (var I = d.stateMachineByIndex(M), F = I.name, G = new this.runtime.StateMachineInstance(I, d), me = [], Ee = 0; Ee < G.inputCount(); Ee++) {
														var we = G.input(Ee)
														me.push({ name: we.name, type: we.type })
													}
													m.stateMachines.push({ name: F, inputs: me })
												}
												r.artboards.push(m)
											}
											return r
										}
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'volume', {
									get: function () {
										return this.artboard && this.artboard.volume !== this._volume && (this._volume = this.artboard.volume), this._volume
									},
									set: function (r) {
										;(this._volume = r), this.artboard && (this.artboard.volume = r * he.systemVolume)
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'artboardWidth', {
									get: function () {
										var r
										return this.artboard ? this.artboard.width : (r = this._artboardWidth) !== null && r !== void 0 ? r : 0
									},
									set: function (r) {
										;(this._artboardWidth = r), this.artboard && (this.artboard.width = r)
									},
									enumerable: !1,
									configurable: !0,
								}),
								Object.defineProperty(u.prototype, 'artboardHeight', {
									get: function () {
										var r
										return this.artboard ? this.artboard.height : (r = this._artboardHeight) !== null && r !== void 0 ? r : 0
									},
									set: function (r) {
										;(this._artboardHeight = r), this.artboard && (this.artboard.height = r)
									},
									enumerable: !1,
									configurable: !0,
								}),
								(u.prototype.resetArtboardSize = function () {
									this.artboard
										? (this.artboard.resetArtboardSize(), (this._artboardWidth = this.artboard.width), (this._artboardHeight = this.artboard.height))
										: ((this._artboardWidth = void 0), (this._artboardHeight = void 0))
								}),
								Object.defineProperty(u.prototype, 'devicePixelRatioUsed', {
									get: function () {
										return this._devicePixelRatioUsed
									},
									set: function (r) {
										this._devicePixelRatioUsed = r
									},
									enumerable: !1,
									configurable: !0,
								}),
								(u.missingErrorMessage = 'Rive source file or data buffer required'),
								(u.cleanupErrorMessage = 'Attempt to use file after calling cleanup.'),
								u
							)
						})(),
						be = function (u) {
							return Q(void 0, void 0, void 0, function () {
								var r, a, d
								return S(this, function (m) {
									switch (m.label) {
										case 0:
											return (r = new Request(u)), [4, fetch(r)]
										case 1:
											return (a = m.sent()), [4, a.arrayBuffer()]
										case 2:
											return (d = m.sent()), [2, d]
									}
								})
							})
						},
						pe = function (u) {
							return typeof u == 'string' ? [u] : u instanceof Array ? u : []
						},
						Y = { EventManager: fe, TaskQueueManager: qe },
						te = function (u) {
							return new Promise(function (r) {
								return ye.getInstance(function (a) {
									a.decodeAudio(u, r)
								})
							})
						},
						We = function (u) {
							return new Promise(function (r) {
								return ye.getInstance(function (a) {
									a.decodeImage(u, r)
								})
							})
						},
						Xe = function (u) {
							return new Promise(function (r) {
								return ye.getInstance(function (a) {
									a.decodeFont(u, r)
								})
							})
						}
				})(),
				Z
			)
		})()
	)
})(Rr)
var on = Rr.exports
document.addEventListener('DOMContentLoaded', () => {
	const _t = document.querySelectorAll('canvas[data-rive]')
	if (!_t.length) return
	const ht = '/wp-content/themes/pictau/theme/js/',
		dt = '/xen_media/'
	on.RuntimeLoader.setWasmUrl(`${ht}rive.wasm`)
	class Qe {
		constructor(Z, W, $, z) {
			;(this.canvas = Z),
				(this.translations = z),
				(this.stateMachineName = 'State Machine 1'),
				(this.rive = new on.Rive({
					canvas: this.canvas,
					src: W,
					autoplay: !0,
					stateMachines: this.stateMachineName,
					fit: on.Fit.cover,
					isTouchScrollEnabled: !0,
					onLoad: () => {
						this.rive.resizeDrawingSurfaceToCanvas(), this.init()
					},
					onLoadError: oe => {
						throw new Error(`⛔️ ${oe.type.toUpperCase()} for ${W}: ${oe.data}`)
					},
					assetLoader: (oe, ae) => {
						if (oe.cdnUuid.length > 0 || ae.length > 0) return !1
						if (oe.isFont)
							return (
								fetch(`${$}`).then(async Q => {
									const S = await on.decodeFont(new Uint8Array(await Q.arrayBuffer()))
									oe.setFont(S), S.unref()
								}),
								!0
							)
					},
				})),
				(this.canvas.rive = this.rive),
				(this.canvas.obj = this)
		}
		getStateMachines() {
			return this.rive.stateMachineNames
		}
		updateTextRuns(Z) {
			Object.keys(Z).forEach(W => {
				//! Check if value is an array (path to text run like [path, value]) or a string (text run value)
				typeof Z[W] == 'string' ? this.rive.setTextRunValue(W, Z[W]) : this.rive.setTextRunValueAtPath(W, Z[W][1], Z[W][0])
			})
		}
		init() {
			if (
				((this.inputs = this.rive.stateMachineInputs(this.stateMachineName)),
				(this.inputEnter = this.inputs.find(Z => Z.name === 'enter')),
				(this.inputOut = this.inputs.find(Z => Z.name === 'out')),
				(this.i18n = window[this.translations] ?? !1),
				this.i18n)
			) {
				//! update text runs if dictionary is available
				this.updateTextRuns(this.i18n)
			}
			this.inputEnter && this.waitingToPlay && (this.inputEnter.fire(), (this.waitingToPlay = !1))
		}
		play() {
			this.inputEnter ? this.inputEnter.fire() : (this.waitingToPlay = !0)
		}
		reset() {
			this.inputOut && this.inputOut.fire()
		}
	}
	_t.forEach(D => {
		const Z = D.dataset.rive
		if (Z.length === 0) return
		const W = D.dataset.rivefont ?? !1,
			$ = D.dataset.rivei18n ?? !1
		;(D.riveController = new Qe(D, `${dt}${Z}.riv`, W, $)),
			window.addEventListener(
				'resize',
				() => {
					D.riveController.rive.resizeDrawingSurfaceToCanvas()
				},
				!1
			)
	})
}) //! Test html button to PLAY
//# sourceMappingURL=index-CVr41bEc.js.map

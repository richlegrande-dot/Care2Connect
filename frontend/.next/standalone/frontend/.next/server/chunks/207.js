"use strict";
((exports.id = 207),
  (exports.ids = [207]),
  (exports.modules = {
    38207: (t, e, i) => {
      i.d(e, { E: () => rG });
      var n = i(55459);
      let r = (0, n.createContext)({
          transformPagePoint: (t) => t,
          isStatic: !1,
          reducedMotion: "never",
        }),
        s = (0, n.createContext)({}),
        o = (0, n.createContext)(null),
        a = "undefined" != typeof document,
        l = a ? n.useLayoutEffect : n.useEffect,
        u = (0, n.createContext)({ strict: !1 }),
        h = (t) => t.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(),
        c = "data-" + h("framerAppearId");
      function d(t) {
        return (
          t &&
          "object" == typeof t &&
          Object.prototype.hasOwnProperty.call(t, "current")
        );
      }
      function p(t) {
        return "string" == typeof t || Array.isArray(t);
      }
      function m(t) {
        return (
          null !== t && "object" == typeof t && "function" == typeof t.start
        );
      }
      let f = [
          "animate",
          "whileInView",
          "whileFocus",
          "whileHover",
          "whileTap",
          "whileDrag",
          "exit",
        ],
        g = ["initial", ...f];
      function v(t) {
        return m(t.animate) || g.some((e) => p(t[e]));
      }
      function y(t) {
        return !!(v(t) || t.variants);
      }
      function x(t) {
        return Array.isArray(t) ? t.join(" ") : t;
      }
      let P = {
          animation: [
            "animate",
            "variants",
            "whileHover",
            "whileTap",
            "exit",
            "whileInView",
            "whileFocus",
            "whileDrag",
          ],
          exit: ["exit"],
          drag: ["drag", "dragControls"],
          focus: ["whileFocus"],
          hover: ["whileHover", "onHoverStart", "onHoverEnd"],
          tap: ["whileTap", "onTap", "onTapStart", "onTapCancel"],
          pan: ["onPan", "onPanStart", "onPanSessionStart", "onPanEnd"],
          inView: ["whileInView", "onViewportEnter", "onViewportLeave"],
          layout: ["layout", "layoutId"],
        },
        b = {};
      for (let t in P) b[t] = { isEnabled: (e) => P[t].some((t) => !!e[t]) };
      let T = (0, n.createContext)({}),
        w = (0, n.createContext)({}),
        A = Symbol.for("motionComponentSymbol"),
        S = [
          "animate",
          "circle",
          "defs",
          "desc",
          "ellipse",
          "g",
          "image",
          "line",
          "filter",
          "marker",
          "mask",
          "metadata",
          "path",
          "pattern",
          "polygon",
          "polyline",
          "rect",
          "stop",
          "switch",
          "symbol",
          "svg",
          "text",
          "tspan",
          "use",
          "view",
        ];
      function V(t) {
        if ("string" != typeof t || t.includes("-"));
        else if (S.indexOf(t) > -1 || /[A-Z]/.test(t)) return !0;
        return !1;
      }
      let E = {},
        C = [
          "transformPerspective",
          "x",
          "y",
          "z",
          "translateX",
          "translateY",
          "translateZ",
          "scale",
          "scaleX",
          "scaleY",
          "rotate",
          "rotateX",
          "rotateY",
          "rotateZ",
          "skew",
          "skewX",
          "skewY",
        ],
        M = new Set(C);
      function D(t, { layout: e, layoutId: i }) {
        return (
          M.has(t) ||
          t.startsWith("origin") ||
          ((e || void 0 !== i) && (!!E[t] || "opacity" === t))
        );
      }
      let k = (t) => !!(t && t.getVelocity),
        R = {
          x: "translateX",
          y: "translateY",
          z: "translateZ",
          transformPerspective: "perspective",
        },
        L = C.length,
        j = (t) => (e) => "string" == typeof e && e.startsWith(t),
        F = j("--"),
        B = j("var(--"),
        O = (t, e) => (e && "number" == typeof t ? e.transform(t) : t),
        U = (t, e, i) => Math.min(Math.max(i, t), e),
        I = {
          test: (t) => "number" == typeof t,
          parse: parseFloat,
          transform: (t) => t,
        },
        N = { ...I, transform: (t) => U(0, 1, t) },
        $ = { ...I, default: 1 },
        W = (t) => Math.round(1e5 * t) / 1e5,
        H = /(-)?([\d]*\.?[\d])+/g,
        z =
          /(#[0-9a-f]{3,8}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2}(-?[\d\.]+%?)\s*[\,\/]?\s*[\d\.]*%?\))/gi,
        Y =
          /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2}(-?[\d\.]+%?)\s*[\,\/]?\s*[\d\.]*%?\))$/i;
      function X(t) {
        return "string" == typeof t;
      }
      let G = (t) => ({
          test: (e) => X(e) && e.endsWith(t) && 1 === e.split(" ").length,
          parse: parseFloat,
          transform: (e) => `${e}${t}`,
        }),
        q = G("deg"),
        Z = G("%"),
        K = G("px"),
        _ = G("vh"),
        J = G("vw"),
        Q = {
          ...Z,
          parse: (t) => Z.parse(t) / 100,
          transform: (t) => Z.transform(100 * t),
        },
        tt = { ...I, transform: Math.round },
        te = {
          borderWidth: K,
          borderTopWidth: K,
          borderRightWidth: K,
          borderBottomWidth: K,
          borderLeftWidth: K,
          borderRadius: K,
          radius: K,
          borderTopLeftRadius: K,
          borderTopRightRadius: K,
          borderBottomRightRadius: K,
          borderBottomLeftRadius: K,
          width: K,
          maxWidth: K,
          height: K,
          maxHeight: K,
          size: K,
          top: K,
          right: K,
          bottom: K,
          left: K,
          padding: K,
          paddingTop: K,
          paddingRight: K,
          paddingBottom: K,
          paddingLeft: K,
          margin: K,
          marginTop: K,
          marginRight: K,
          marginBottom: K,
          marginLeft: K,
          rotate: q,
          rotateX: q,
          rotateY: q,
          rotateZ: q,
          scale: $,
          scaleX: $,
          scaleY: $,
          scaleZ: $,
          skew: q,
          skewX: q,
          skewY: q,
          distance: K,
          translateX: K,
          translateY: K,
          translateZ: K,
          x: K,
          y: K,
          z: K,
          perspective: K,
          transformPerspective: K,
          opacity: N,
          originX: Q,
          originY: Q,
          originZ: K,
          zIndex: tt,
          fillOpacity: N,
          strokeOpacity: N,
          numOctaves: tt,
        };
      function ti(t, e, i, n) {
        let { style: r, vars: s, transform: o, transformOrigin: a } = t,
          l = !1,
          u = !1,
          h = !0;
        for (let t in e) {
          let i = e[t];
          if (F(t)) {
            s[t] = i;
            continue;
          }
          let n = te[t],
            c = O(i, n);
          if (M.has(t)) {
            if (((l = !0), (o[t] = c), !h)) continue;
            i !== (n.default || 0) && (h = !1);
          } else t.startsWith("origin") ? ((u = !0), (a[t] = c)) : (r[t] = c);
        }
        if (
          (!e.transform &&
            (l || n
              ? (r.transform = (function (
                  t,
                  {
                    enableHardwareAcceleration: e = !0,
                    allowTransformNone: i = !0,
                  },
                  n,
                  r,
                ) {
                  let s = "";
                  for (let e = 0; e < L; e++) {
                    let i = C[e];
                    if (void 0 !== t[i]) {
                      let e = R[i] || i;
                      s += `${e}(${t[i]}) `;
                    }
                  }
                  return (
                    e && !t.z && (s += "translateZ(0)"),
                    (s = s.trim()),
                    r ? (s = r(t, n ? "" : s)) : i && n && (s = "none"),
                    s
                  );
                })(t.transform, i, h, n))
              : r.transform && (r.transform = "none")),
          u)
        ) {
          let { originX: t = "50%", originY: e = "50%", originZ: i = 0 } = a;
          r.transformOrigin = `${t} ${e} ${i}`;
        }
      }
      let tn = () => ({
        style: {},
        transform: {},
        transformOrigin: {},
        vars: {},
      });
      function tr(t, e, i) {
        for (let n in e) k(e[n]) || D(n, i) || (t[n] = e[n]);
      }
      function ts(t, e, i) {
        let r = {},
          s = (function (t, e, i) {
            let r = t.style || {},
              s = {};
            return (
              tr(s, r, t),
              Object.assign(
                s,
                (function ({ transformTemplate: t }, e, i) {
                  return (0, n.useMemo)(() => {
                    let n = tn();
                    return (
                      ti(n, e, { enableHardwareAcceleration: !i }, t),
                      Object.assign({}, n.vars, n.style)
                    );
                  }, [e]);
                })(t, e, i),
              ),
              t.transformValues ? t.transformValues(s) : s
            );
          })(t, e, i);
        return (
          t.drag &&
            !1 !== t.dragListener &&
            ((r.draggable = !1),
            (s.userSelect = s.WebkitUserSelect = s.WebkitTouchCallout = "none"),
            (s.touchAction =
              !0 === t.drag ? "none" : `pan-${"x" === t.drag ? "y" : "x"}`)),
          void 0 === t.tabIndex &&
            (t.onTap || t.onTapStart || t.whileTap) &&
            (r.tabIndex = 0),
          (r.style = s),
          r
        );
      }
      let to = new Set([
        "animate",
        "exit",
        "variants",
        "initial",
        "style",
        "values",
        "variants",
        "transition",
        "transformTemplate",
        "transformValues",
        "custom",
        "inherit",
        "onBeforeLayoutMeasure",
        "onAnimationStart",
        "onAnimationComplete",
        "onUpdate",
        "onDragStart",
        "onDrag",
        "onDragEnd",
        "onMeasureDragConstraints",
        "onDirectionLock",
        "onDragTransitionEnd",
        "_dragX",
        "_dragY",
        "onHoverStart",
        "onHoverEnd",
        "onViewportEnter",
        "onViewportLeave",
        "globalTapTarget",
        "ignoreStrict",
        "viewport",
      ]);
      function ta(t) {
        return (
          t.startsWith("while") ||
          (t.startsWith("drag") && "draggable" !== t) ||
          t.startsWith("layout") ||
          t.startsWith("onTap") ||
          t.startsWith("onPan") ||
          t.startsWith("onLayout") ||
          to.has(t)
        );
      }
      let tl = (t) => !ta(t);
      try {
        !(function (t) {
          t && (tl = (e) => (e.startsWith("on") ? !ta(e) : t(e)));
        })(require("@emotion/is-prop-valid").default);
      } catch (t) {}
      function tu(t, e, i) {
        return "string" == typeof t ? t : K.transform(e + i * t);
      }
      let th = { offset: "stroke-dashoffset", array: "stroke-dasharray" },
        tc = { offset: "strokeDashoffset", array: "strokeDasharray" };
      function td(
        t,
        {
          attrX: e,
          attrY: i,
          attrScale: n,
          originX: r,
          originY: s,
          pathLength: o,
          pathSpacing: a = 1,
          pathOffset: l = 0,
          ...u
        },
        h,
        c,
        d,
      ) {
        if ((ti(t, u, h, d), c)) {
          t.style.viewBox && (t.attrs.viewBox = t.style.viewBox);
          return;
        }
        ((t.attrs = t.style), (t.style = {}));
        let { attrs: p, style: m, dimensions: f } = t;
        (p.transform && (f && (m.transform = p.transform), delete p.transform),
          f &&
            (void 0 !== r || void 0 !== s || m.transform) &&
            (m.transformOrigin = (function (t, e, i) {
              let n = tu(e, t.x, t.width),
                r = tu(i, t.y, t.height);
              return `${n} ${r}`;
            })(f, void 0 !== r ? r : 0.5, void 0 !== s ? s : 0.5)),
          void 0 !== e && (p.x = e),
          void 0 !== i && (p.y = i),
          void 0 !== n && (p.scale = n),
          void 0 !== o &&
            (function (t, e, i = 1, n = 0, r = !0) {
              t.pathLength = 1;
              let s = r ? th : tc;
              t[s.offset] = K.transform(-n);
              let o = K.transform(e),
                a = K.transform(i);
              t[s.array] = `${o} ${a}`;
            })(p, o, a, l, !1));
      }
      let tp = () => ({ ...tn(), attrs: {} }),
        tm = (t) => "string" == typeof t && "svg" === t.toLowerCase();
      function tf(t, e, i, r) {
        let s = (0, n.useMemo)(() => {
          let i = tp();
          return (
            td(
              i,
              e,
              { enableHardwareAcceleration: !1 },
              tm(r),
              t.transformTemplate,
            ),
            { ...i.attrs, style: { ...i.style } }
          );
        }, [e]);
        if (t.style) {
          let e = {};
          (tr(e, t.style, t), (s.style = { ...e, ...s.style }));
        }
        return s;
      }
      function tg(t, { style: e, vars: i }, n, r) {
        for (let s in (Object.assign(t.style, e, r && r.getProjectionStyles(n)),
        i))
          t.style.setProperty(s, i[s]);
      }
      let tv = new Set([
        "baseFrequency",
        "diffuseConstant",
        "kernelMatrix",
        "kernelUnitLength",
        "keySplines",
        "keyTimes",
        "limitingConeAngle",
        "markerHeight",
        "markerWidth",
        "numOctaves",
        "targetX",
        "targetY",
        "surfaceScale",
        "specularConstant",
        "specularExponent",
        "stdDeviation",
        "tableValues",
        "viewBox",
        "gradientTransform",
        "pathLength",
        "startOffset",
        "textLength",
        "lengthAdjust",
      ]);
      function ty(t, e, i, n) {
        for (let i in (tg(t, e, void 0, n), e.attrs))
          t.setAttribute(tv.has(i) ? i : h(i), e.attrs[i]);
      }
      function tx(t, e) {
        let { style: i } = t,
          n = {};
        for (let r in i)
          (k(i[r]) || (e.style && k(e.style[r])) || D(r, t)) && (n[r] = i[r]);
        return n;
      }
      function tP(t, e) {
        let i = tx(t, e);
        for (let n in t)
          if (k(t[n]) || k(e[n])) {
            let e =
              -1 !== C.indexOf(n)
                ? "attr" + n.charAt(0).toUpperCase() + n.substring(1)
                : n;
            i[e] = t[n];
          }
        return i;
      }
      function tb(t, e, i, n = {}, r = {}) {
        return (
          "function" == typeof e && (e = e(void 0 !== i ? i : t.custom, n, r)),
          "string" == typeof e && (e = t.variants && t.variants[e]),
          "function" == typeof e && (e = e(void 0 !== i ? i : t.custom, n, r)),
          e
        );
      }
      let tT = (t) => Array.isArray(t),
        tw = (t) => !!(t && "object" == typeof t && t.mix && t.toValue),
        tA = (t) => (tT(t) ? t[t.length - 1] || 0 : t);
      function tS(t) {
        let e = k(t) ? t.get() : t;
        return tw(e) ? e.toValue() : e;
      }
      let tV = (t) => (e, i) => {
          let r = (0, n.useContext)(s),
            a = (0, n.useContext)(o),
            l = () =>
              (function (
                {
                  scrapeMotionValuesFromProps: t,
                  createRenderState: e,
                  onMount: i,
                },
                n,
                r,
                s,
              ) {
                let o = {
                  latestValues: (function (t, e, i, n) {
                    let r = {},
                      s = n(t, {});
                    for (let t in s) r[t] = tS(s[t]);
                    let { initial: o, animate: a } = t,
                      l = v(t),
                      u = y(t);
                    e &&
                      u &&
                      !l &&
                      !1 !== t.inherit &&
                      (void 0 === o && (o = e.initial),
                      void 0 === a && (a = e.animate));
                    let h = !!i && !1 === i.initial;
                    h = h || !1 === o;
                    let c = h ? a : o;
                    if (c && "boolean" != typeof c && !m(c)) {
                      let e = Array.isArray(c) ? c : [c];
                      e.forEach((e) => {
                        let i = tb(t, e);
                        if (!i) return;
                        let { transitionEnd: n, transition: s, ...o } = i;
                        for (let t in o) {
                          let e = o[t];
                          if (Array.isArray(e)) {
                            let t = h ? e.length - 1 : 0;
                            e = e[t];
                          }
                          null !== e && (r[t] = e);
                        }
                        for (let t in n) r[t] = n[t];
                      });
                    }
                    return r;
                  })(n, r, s, t),
                  renderState: e(),
                };
                return (i && (o.mount = (t) => i(n, t, o)), o);
              })(t, e, r, a);
          return i
            ? l()
            : (function (t) {
                let e = (0, n.useRef)(null);
                return (null === e.current && (e.current = t()), e.current);
              })(l);
        },
        tE = (t) => t;
      class tC {
        constructor() {
          ((this.order = []), (this.scheduled = new Set()));
        }
        add(t) {
          if (!this.scheduled.has(t))
            return (this.scheduled.add(t), this.order.push(t), !0);
        }
        remove(t) {
          let e = this.order.indexOf(t);
          -1 !== e && (this.order.splice(e, 1), this.scheduled.delete(t));
        }
        clear() {
          ((this.order.length = 0), this.scheduled.clear());
        }
      }
      let tM = [
          "prepare",
          "read",
          "update",
          "preRender",
          "render",
          "postRender",
        ],
        {
          schedule: tD,
          cancel: tk,
          state: tR,
          steps: tL,
        } = (function (t, e) {
          let i = !1,
            n = !0,
            r = { delta: 0, timestamp: 0, isProcessing: !1 },
            s = tM.reduce(
              (t, e) => (
                (t[e] = (function (t) {
                  let e = new tC(),
                    i = new tC(),
                    n = 0,
                    r = !1,
                    s = !1,
                    o = new WeakSet(),
                    a = {
                      schedule: (t, s = !1, a = !1) => {
                        let l = a && r,
                          u = l ? e : i;
                        return (
                          s && o.add(t),
                          u.add(t) && l && r && (n = e.order.length),
                          t
                        );
                      },
                      cancel: (t) => {
                        (i.remove(t), o.delete(t));
                      },
                      process: (l) => {
                        if (r) {
                          s = !0;
                          return;
                        }
                        if (
                          ((r = !0),
                          ([e, i] = [i, e]),
                          i.clear(),
                          (n = e.order.length))
                        )
                          for (let i = 0; i < n; i++) {
                            let n = e.order[i];
                            (n(l), o.has(n) && (a.schedule(n), t()));
                          }
                        ((r = !1), s && ((s = !1), a.process(l)));
                      },
                    };
                  return a;
                })(() => (i = !0))),
                t
              ),
              {},
            ),
            o = (t) => s[t].process(r),
            a = () => {
              let s = performance.now();
              ((i = !1),
                (r.delta = n
                  ? 1e3 / 60
                  : Math.max(Math.min(s - r.timestamp, 40), 1)),
                (r.timestamp = s),
                (r.isProcessing = !0),
                tM.forEach(o),
                (r.isProcessing = !1),
                i && e && ((n = !1), t(a)));
            },
            l = () => {
              ((i = !0), (n = !0), r.isProcessing || t(a));
            },
            u = tM.reduce((t, e) => {
              let n = s[e];
              return (
                (t[e] = (t, e = !1, r = !1) => (i || l(), n.schedule(t, e, r))),
                t
              );
            }, {});
          return {
            schedule: u,
            cancel: (t) => tM.forEach((e) => s[e].cancel(t)),
            state: r,
            steps: s,
          };
        })(
          "undefined" != typeof requestAnimationFrame
            ? requestAnimationFrame
            : tE,
          !0,
        ),
        tj = {
          useVisualState: tV({
            scrapeMotionValuesFromProps: tP,
            createRenderState: tp,
            onMount: (t, e, { renderState: i, latestValues: n }) => {
              (tD.read(() => {
                try {
                  i.dimensions =
                    "function" == typeof e.getBBox
                      ? e.getBBox()
                      : e.getBoundingClientRect();
                } catch (t) {
                  i.dimensions = { x: 0, y: 0, width: 0, height: 0 };
                }
              }),
                tD.render(() => {
                  (td(
                    i,
                    n,
                    { enableHardwareAcceleration: !1 },
                    tm(e.tagName),
                    t.transformTemplate,
                  ),
                    ty(e, i));
                }));
            },
          }),
        },
        tF = {
          useVisualState: tV({
            scrapeMotionValuesFromProps: tx,
            createRenderState: tn,
          }),
        };
      function tB(t, e, i, n = { passive: !0 }) {
        return (t.addEventListener(e, i, n), () => t.removeEventListener(e, i));
      }
      let tO = (t) =>
        "mouse" === t.pointerType
          ? "number" != typeof t.button || t.button <= 0
          : !1 !== t.isPrimary;
      function tU(t, e = "page") {
        return { point: { x: t[e + "X"], y: t[e + "Y"] } };
      }
      let tI = (t) => (e) => tO(e) && t(e, tU(e));
      function tN(t, e, i, n) {
        return tB(t, e, tI(i), n);
      }
      let t$ = (t, e) => (i) => e(t(i)),
        tW = (...t) => t.reduce(t$);
      function tH(t) {
        let e = null;
        return () =>
          null === e &&
          ((e = t),
          () => {
            e = null;
          });
      }
      let tz = tH("dragHorizontal"),
        tY = tH("dragVertical");
      function tX(t) {
        let e = !1;
        if ("y" === t) e = tY();
        else if ("x" === t) e = tz();
        else {
          let t = tz(),
            i = tY();
          t && i
            ? (e = () => {
                (t(), i());
              })
            : (t && t(), i && i());
        }
        return e;
      }
      function tG() {
        let t = tX(!0);
        return !t || (t(), !1);
      }
      class tq {
        constructor(t) {
          ((this.isMounted = !1), (this.node = t));
        }
        update() {}
      }
      function tZ(t, e) {
        let i = "onHover" + (e ? "Start" : "End");
        return tN(
          t.current,
          "pointer" + (e ? "enter" : "leave"),
          (n, r) => {
            if ("touch" === n.pointerType || tG()) return;
            let s = t.getProps();
            (t.animationState &&
              s.whileHover &&
              t.animationState.setActive("whileHover", e),
              s[i] && tD.update(() => s[i](n, r)));
          },
          { passive: !t.getProps()[i] },
        );
      }
      class tK extends tq {
        mount() {
          this.unmount = tW(tZ(this.node, !0), tZ(this.node, !1));
        }
        unmount() {}
      }
      class t_ extends tq {
        constructor() {
          (super(...arguments), (this.isActive = !1));
        }
        onFocus() {
          let t = !1;
          try {
            t = this.node.current.matches(":focus-visible");
          } catch (e) {
            t = !0;
          }
          t &&
            this.node.animationState &&
            (this.node.animationState.setActive("whileFocus", !0),
            (this.isActive = !0));
        }
        onBlur() {
          this.isActive &&
            this.node.animationState &&
            (this.node.animationState.setActive("whileFocus", !1),
            (this.isActive = !1));
        }
        mount() {
          this.unmount = tW(
            tB(this.node.current, "focus", () => this.onFocus()),
            tB(this.node.current, "blur", () => this.onBlur()),
          );
        }
        unmount() {}
      }
      let tJ = (t, e) => !!e && (t === e || tJ(t, e.parentElement));
      function tQ(t, e) {
        if (!e) return;
        let i = new PointerEvent("pointer" + t);
        e(i, tU(i));
      }
      class t0 extends tq {
        constructor() {
          (super(...arguments),
            (this.removeStartListeners = tE),
            (this.removeEndListeners = tE),
            (this.removeAccessibleListeners = tE),
            (this.startPointerPress = (t, e) => {
              if (this.isPressing) return;
              this.removeEndListeners();
              let i = this.node.getProps(),
                n = tN(
                  window,
                  "pointerup",
                  (t, e) => {
                    if (!this.checkPressEnd()) return;
                    let {
                      onTap: i,
                      onTapCancel: n,
                      globalTapTarget: r,
                    } = this.node.getProps();
                    tD.update(() => {
                      r || tJ(this.node.current, t.target)
                        ? i && i(t, e)
                        : n && n(t, e);
                    });
                  },
                  { passive: !(i.onTap || i.onPointerUp) },
                ),
                r = tN(
                  window,
                  "pointercancel",
                  (t, e) => this.cancelPress(t, e),
                  { passive: !(i.onTapCancel || i.onPointerCancel) },
                );
              ((this.removeEndListeners = tW(n, r)), this.startPress(t, e));
            }),
            (this.startAccessiblePress = () => {
              let t = tB(this.node.current, "keydown", (t) => {
                  "Enter" !== t.key ||
                    this.isPressing ||
                    (this.removeEndListeners(),
                    (this.removeEndListeners = tB(
                      this.node.current,
                      "keyup",
                      (t) => {
                        "Enter" === t.key &&
                          this.checkPressEnd() &&
                          tQ("up", (t, e) => {
                            let { onTap: i } = this.node.getProps();
                            i && tD.update(() => i(t, e));
                          });
                      },
                    )),
                    tQ("down", (t, e) => {
                      this.startPress(t, e);
                    }));
                }),
                e = tB(this.node.current, "blur", () => {
                  this.isPressing &&
                    tQ("cancel", (t, e) => this.cancelPress(t, e));
                });
              this.removeAccessibleListeners = tW(t, e);
            }));
        }
        startPress(t, e) {
          this.isPressing = !0;
          let { onTapStart: i, whileTap: n } = this.node.getProps();
          (n &&
            this.node.animationState &&
            this.node.animationState.setActive("whileTap", !0),
            i && tD.update(() => i(t, e)));
        }
        checkPressEnd() {
          (this.removeEndListeners(), (this.isPressing = !1));
          let t = this.node.getProps();
          return (
            t.whileTap &&
              this.node.animationState &&
              this.node.animationState.setActive("whileTap", !1),
            !tG()
          );
        }
        cancelPress(t, e) {
          if (!this.checkPressEnd()) return;
          let { onTapCancel: i } = this.node.getProps();
          i && tD.update(() => i(t, e));
        }
        mount() {
          let t = this.node.getProps(),
            e = tN(
              t.globalTapTarget ? window : this.node.current,
              "pointerdown",
              this.startPointerPress,
              { passive: !(t.onTapStart || t.onPointerStart) },
            ),
            i = tB(this.node.current, "focus", this.startAccessiblePress);
          this.removeStartListeners = tW(e, i);
        }
        unmount() {
          (this.removeStartListeners(),
            this.removeEndListeners(),
            this.removeAccessibleListeners());
        }
      }
      let t1 = new WeakMap(),
        t5 = new WeakMap(),
        t2 = (t) => {
          let e = t1.get(t.target);
          e && e(t);
        },
        t3 = (t) => {
          t.forEach(t2);
        },
        t9 = { some: 0, all: 1 };
      class t4 extends tq {
        constructor() {
          (super(...arguments),
            (this.hasEnteredView = !1),
            (this.isInView = !1));
        }
        startObserver() {
          this.unmount();
          let { viewport: t = {} } = this.node.getProps(),
            { root: e, margin: i, amount: n = "some", once: r } = t,
            s = {
              root: e ? e.current : void 0,
              rootMargin: i,
              threshold: "number" == typeof n ? n : t9[n],
            };
          return (function (t, e, i) {
            let n = (function ({ root: t, ...e }) {
              let i = t || document;
              t5.has(i) || t5.set(i, {});
              let n = t5.get(i),
                r = JSON.stringify(e);
              return (
                n[r] ||
                  (n[r] = new IntersectionObserver(t3, { root: t, ...e })),
                n[r]
              );
            })(e);
            return (
              t1.set(t, i),
              n.observe(t),
              () => {
                (t1.delete(t), n.unobserve(t));
              }
            );
          })(this.node.current, s, (t) => {
            let { isIntersecting: e } = t;
            if (
              this.isInView === e ||
              ((this.isInView = e), r && !e && this.hasEnteredView)
            )
              return;
            (e && (this.hasEnteredView = !0),
              this.node.animationState &&
                this.node.animationState.setActive("whileInView", e));
            let { onViewportEnter: i, onViewportLeave: n } =
                this.node.getProps(),
              s = e ? i : n;
            s && s(t);
          });
        }
        mount() {
          this.startObserver();
        }
        update() {
          if ("undefined" == typeof IntersectionObserver) return;
          let { props: t, prevProps: e } = this.node,
            i = ["amount", "margin", "root"].some(
              (function ({ viewport: t = {} }, { viewport: e = {} } = {}) {
                return (i) => t[i] !== e[i];
              })(t, e),
            );
          i && this.startObserver();
        }
        unmount() {}
      }
      function t6(t, e) {
        if (!Array.isArray(e)) return !1;
        let i = e.length;
        if (i !== t.length) return !1;
        for (let n = 0; n < i; n++) if (e[n] !== t[n]) return !1;
        return !0;
      }
      function t8(t, e, i) {
        let n = t.getProps();
        return tb(
          n,
          e,
          void 0 !== i ? i : n.custom,
          (function (t) {
            let e = {};
            return (t.values.forEach((t, i) => (e[i] = t.get())), e);
          })(t),
          (function (t) {
            let e = {};
            return (t.values.forEach((t, i) => (e[i] = t.getVelocity())), e);
          })(t),
        );
      }
      let t7 = (t) => 1e3 * t,
        et = (t) => t / 1e3,
        ee = { current: !1 },
        ei = (t) => Array.isArray(t) && "number" == typeof t[0],
        en = ([t, e, i, n]) => `cubic-bezier(${t}, ${e}, ${i}, ${n})`,
        er = {
          linear: "linear",
          ease: "ease",
          easeIn: "ease-in",
          easeOut: "ease-out",
          easeInOut: "ease-in-out",
          circIn: en([0, 0.65, 0.55, 1]),
          circOut: en([0.55, 0, 1, 0.45]),
          backIn: en([0.31, 0.01, 0.66, -0.59]),
          backOut: en([0.33, 1.53, 0.69, 0.99]),
        },
        es = (t, e, i) =>
          (((1 - 3 * i + 3 * e) * t + (3 * i - 6 * e)) * t + 3 * e) * t;
      function eo(t, e, i, n) {
        if (t === e && i === n) return tE;
        let r = (e) =>
          (function (t, e, i, n, r) {
            let s, o;
            let a = 0;
            do
              (s = es((o = e + (i - e) / 2), n, r) - t) > 0 ? (i = o) : (e = o);
            while (Math.abs(s) > 1e-7 && ++a < 12);
            return o;
          })(e, 0, 1, t, i);
        return (t) => (0 === t || 1 === t ? t : es(r(t), e, n));
      }
      let ea = eo(0.42, 0, 1, 1),
        el = eo(0, 0, 0.58, 1),
        eu = eo(0.42, 0, 0.58, 1),
        eh = (t) => Array.isArray(t) && "number" != typeof t[0],
        ec = (t) => (e) => (e <= 0.5 ? t(2 * e) / 2 : (2 - t(2 * (1 - e))) / 2),
        ed = (t) => (e) => 1 - t(1 - e),
        ep = (t) => 1 - Math.sin(Math.acos(t)),
        em = ed(ep),
        ef = ec(ep),
        eg = eo(0.33, 1.53, 0.69, 0.99),
        ev = ed(eg),
        ey = ec(ev),
        ex = {
          linear: tE,
          easeIn: ea,
          easeInOut: eu,
          easeOut: el,
          circIn: ep,
          circInOut: ef,
          circOut: em,
          backIn: ev,
          backInOut: ey,
          backOut: eg,
          anticipate: (t) =>
            (t *= 2) < 1 ? 0.5 * ev(t) : 0.5 * (2 - Math.pow(2, -10 * (t - 1))),
        },
        eP = (t) => {
          if (Array.isArray(t)) {
            tE(
              4 === t.length,
              "Cubic bezier arrays must contain four numerical values.",
            );
            let [e, i, n, r] = t;
            return eo(e, i, n, r);
          }
          return "string" == typeof t
            ? (tE(void 0 !== ex[t], `Invalid easing type '${t}'`), ex[t])
            : t;
        },
        eb = (t, e) => (i) =>
          !!(
            (X(i) && Y.test(i) && i.startsWith(t)) ||
            (e && Object.prototype.hasOwnProperty.call(i, e))
          ),
        eT = (t, e, i) => (n) => {
          if (!X(n)) return n;
          let [r, s, o, a] = n.match(H);
          return {
            [t]: parseFloat(r),
            [e]: parseFloat(s),
            [i]: parseFloat(o),
            alpha: void 0 !== a ? parseFloat(a) : 1,
          };
        },
        ew = (t) => U(0, 255, t),
        eA = { ...I, transform: (t) => Math.round(ew(t)) },
        eS = {
          test: eb("rgb", "red"),
          parse: eT("red", "green", "blue"),
          transform: ({ red: t, green: e, blue: i, alpha: n = 1 }) =>
            "rgba(" +
            eA.transform(t) +
            ", " +
            eA.transform(e) +
            ", " +
            eA.transform(i) +
            ", " +
            W(N.transform(n)) +
            ")",
        },
        eV = {
          test: eb("#"),
          parse: function (t) {
            let e = "",
              i = "",
              n = "",
              r = "";
            return (
              t.length > 5
                ? ((e = t.substring(1, 3)),
                  (i = t.substring(3, 5)),
                  (n = t.substring(5, 7)),
                  (r = t.substring(7, 9)))
                : ((e = t.substring(1, 2)),
                  (i = t.substring(2, 3)),
                  (n = t.substring(3, 4)),
                  (r = t.substring(4, 5)),
                  (e += e),
                  (i += i),
                  (n += n),
                  (r += r)),
              {
                red: parseInt(e, 16),
                green: parseInt(i, 16),
                blue: parseInt(n, 16),
                alpha: r ? parseInt(r, 16) / 255 : 1,
              }
            );
          },
          transform: eS.transform,
        },
        eE = {
          test: eb("hsl", "hue"),
          parse: eT("hue", "saturation", "lightness"),
          transform: ({ hue: t, saturation: e, lightness: i, alpha: n = 1 }) =>
            "hsla(" +
            Math.round(t) +
            ", " +
            Z.transform(W(e)) +
            ", " +
            Z.transform(W(i)) +
            ", " +
            W(N.transform(n)) +
            ")",
        },
        eC = {
          test: (t) => eS.test(t) || eV.test(t) || eE.test(t),
          parse: (t) =>
            eS.test(t) ? eS.parse(t) : eE.test(t) ? eE.parse(t) : eV.parse(t),
          transform: (t) =>
            X(t)
              ? t
              : t.hasOwnProperty("red")
                ? eS.transform(t)
                : eE.transform(t),
        },
        eM = (t, e, i) => -i * t + i * e + t;
      function eD(t, e, i) {
        return (i < 0 && (i += 1), i > 1 && (i -= 1), i < 1 / 6)
          ? t + (e - t) * 6 * i
          : i < 0.5
            ? e
            : i < 2 / 3
              ? t + (e - t) * (2 / 3 - i) * 6
              : t;
      }
      let ek = (t, e, i) => {
          let n = t * t;
          return Math.sqrt(Math.max(0, i * (e * e - n) + n));
        },
        eR = [eV, eS, eE],
        eL = (t) => eR.find((e) => e.test(t));
      function ej(t) {
        let e = eL(t);
        tE(
          !!e,
          `'${t}' is not an animatable color. Use the equivalent color code instead.`,
        );
        let i = e.parse(t);
        return (
          e === eE &&
            (i = (function ({ hue: t, saturation: e, lightness: i, alpha: n }) {
              ((t /= 360), (i /= 100));
              let r = 0,
                s = 0,
                o = 0;
              if ((e /= 100)) {
                let n = i < 0.5 ? i * (1 + e) : i + e - i * e,
                  a = 2 * i - n;
                ((r = eD(a, n, t + 1 / 3)),
                  (s = eD(a, n, t)),
                  (o = eD(a, n, t - 1 / 3)));
              } else r = s = o = i;
              return {
                red: Math.round(255 * r),
                green: Math.round(255 * s),
                blue: Math.round(255 * o),
                alpha: n,
              };
            })(i)),
          i
        );
      }
      let eF = (t, e) => {
          let i = ej(t),
            n = ej(e),
            r = { ...i };
          return (t) => (
            (r.red = ek(i.red, n.red, t)),
            (r.green = ek(i.green, n.green, t)),
            (r.blue = ek(i.blue, n.blue, t)),
            (r.alpha = eM(i.alpha, n.alpha, t)),
            eS.transform(r)
          );
        },
        eB = {
          regex:
            /var\s*\(\s*--[\w-]+(\s*,\s*(?:(?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)+)?\s*\)/g,
          countKey: "Vars",
          token: "${v}",
          parse: tE,
        },
        eO = { regex: z, countKey: "Colors", token: "${c}", parse: eC.parse },
        eU = { regex: H, countKey: "Numbers", token: "${n}", parse: I.parse };
      function eI(t, { regex: e, countKey: i, token: n, parse: r }) {
        let s = t.tokenised.match(e);
        s &&
          ((t["num" + i] = s.length),
          (t.tokenised = t.tokenised.replace(e, n)),
          t.values.push(...s.map(r)));
      }
      function eN(t) {
        let e = t.toString(),
          i = {
            value: e,
            tokenised: e,
            values: [],
            numVars: 0,
            numColors: 0,
            numNumbers: 0,
          };
        return (
          i.value.includes("var(--") && eI(i, eB),
          eI(i, eO),
          eI(i, eU),
          i
        );
      }
      function e$(t) {
        return eN(t).values;
      }
      function eW(t) {
        let { values: e, numColors: i, numVars: n, tokenised: r } = eN(t),
          s = e.length;
        return (t) => {
          let e = r;
          for (let r = 0; r < s; r++)
            e =
              r < n
                ? e.replace(eB.token, t[r])
                : r < n + i
                  ? e.replace(eO.token, eC.transform(t[r]))
                  : e.replace(eU.token, W(t[r]));
          return e;
        };
      }
      let eH = (t) => ("number" == typeof t ? 0 : t),
        ez = {
          test: function (t) {
            var e, i;
            return (
              isNaN(t) &&
              X(t) &&
              ((null === (e = t.match(H)) || void 0 === e
                ? void 0
                : e.length) || 0) +
                ((null === (i = t.match(z)) || void 0 === i
                  ? void 0
                  : i.length) || 0) >
                0
            );
          },
          parse: e$,
          createTransformer: eW,
          getAnimatableNone: function (t) {
            let e = e$(t),
              i = eW(t);
            return i(e.map(eH));
          },
        },
        eY = (t, e) => (i) => `${i > 0 ? e : t}`;
      function eX(t, e) {
        return "number" == typeof t
          ? (i) => eM(t, e, i)
          : eC.test(t)
            ? eF(t, e)
            : t.startsWith("var(")
              ? eY(t, e)
              : eZ(t, e);
      }
      let eG = (t, e) => {
          let i = [...t],
            n = i.length,
            r = t.map((t, i) => eX(t, e[i]));
          return (t) => {
            for (let e = 0; e < n; e++) i[e] = r[e](t);
            return i;
          };
        },
        eq = (t, e) => {
          let i = { ...t, ...e },
            n = {};
          for (let r in i)
            void 0 !== t[r] && void 0 !== e[r] && (n[r] = eX(t[r], e[r]));
          return (t) => {
            for (let e in n) i[e] = n[e](t);
            return i;
          };
        },
        eZ = (t, e) => {
          let i = ez.createTransformer(e),
            n = eN(t),
            r = eN(e),
            s =
              n.numVars === r.numVars &&
              n.numColors === r.numColors &&
              n.numNumbers >= r.numNumbers;
          return s
            ? tW(eG(n.values, r.values), i)
            : (tE(
                !0,
                `Complex values '${t}' and '${e}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`,
              ),
              eY(t, e));
        },
        eK = (t, e, i) => {
          let n = e - t;
          return 0 === n ? 1 : (i - t) / n;
        },
        e_ = (t, e) => (i) => eM(t, e, i);
      function eJ(t, e, { clamp: i = !0, ease: n, mixer: r } = {}) {
        let s = t.length;
        if (
          (tE(
            s === e.length,
            "Both input and output ranges must be the same length",
          ),
          1 === s)
        )
          return () => e[0];
        t[0] > t[s - 1] && ((t = [...t].reverse()), (e = [...e].reverse()));
        let o = (function (t, e, i) {
            let n = [],
              r =
                i ||
                (function (t) {
                  if ("number" == typeof t);
                  else if ("string" == typeof t) return eC.test(t) ? eF : eZ;
                  else if (Array.isArray(t)) return eG;
                  else if ("object" == typeof t) return eq;
                  return e_;
                })(t[0]),
              s = t.length - 1;
            for (let i = 0; i < s; i++) {
              let s = r(t[i], t[i + 1]);
              if (e) {
                let t = Array.isArray(e) ? e[i] || tE : e;
                s = tW(t, s);
              }
              n.push(s);
            }
            return n;
          })(e, n, r),
          a = o.length,
          l = (e) => {
            let i = 0;
            if (a > 1) for (; i < t.length - 2 && !(e < t[i + 1]); i++);
            let n = eK(t[i], t[i + 1], e);
            return o[i](n);
          };
        return i ? (e) => l(U(t[0], t[s - 1], e)) : l;
      }
      function eQ({
        duration: t = 300,
        keyframes: e,
        times: i,
        ease: n = "easeInOut",
      }) {
        let r = eh(n) ? n.map(eP) : eP(n),
          s = { done: !1, value: e[0] },
          o = (
            i && i.length === e.length
              ? i
              : (function (t) {
                  let e = [0];
                  return (
                    (function (t, e) {
                      let i = t[t.length - 1];
                      for (let n = 1; n <= e; n++) {
                        let r = eK(0, e, n);
                        t.push(eM(i, 1, r));
                      }
                    })(e, t.length - 1),
                    e
                  );
                })(e)
          ).map((e) => e * t),
          a = eJ(o, e, {
            ease: Array.isArray(r)
              ? r
              : e.map(() => r || eu).splice(0, e.length - 1),
          });
        return {
          calculatedDuration: t,
          next: (e) => ((s.value = a(e)), (s.done = e >= t), s),
        };
      }
      function e0(t, e, i) {
        var n, r;
        let s = Math.max(e - 5, 0);
        return ((n = i - t(s)), (r = e - s) ? n * (1e3 / r) : 0);
      }
      function e1(t, e) {
        return t * Math.sqrt(1 - e * e);
      }
      let e5 = ["duration", "bounce"],
        e2 = ["stiffness", "damping", "mass"];
      function e3(t, e) {
        return e.some((e) => void 0 !== t[e]);
      }
      function e9({ keyframes: t, restDelta: e, restSpeed: i, ...n }) {
        let r;
        let s = t[0],
          o = t[t.length - 1],
          a = { done: !1, value: s },
          {
            stiffness: l,
            damping: u,
            mass: h,
            duration: c,
            velocity: d,
            isResolvedFromDuration: p,
          } = (function (t) {
            let e = {
              velocity: 0,
              stiffness: 100,
              damping: 10,
              mass: 1,
              isResolvedFromDuration: !1,
              ...t,
            };
            if (!e3(t, e2) && e3(t, e5)) {
              let i = (function ({
                duration: t = 800,
                bounce: e = 0.25,
                velocity: i = 0,
                mass: n = 1,
              }) {
                let r, s;
                tE(t <= t7(10), "Spring duration must be 10 seconds or less");
                let o = 1 - e;
                ((o = U(0.05, 1, o)),
                  (t = U(0.01, 10, et(t))),
                  o < 1
                    ? ((r = (e) => {
                        let n = e * o,
                          r = n * t,
                          s = e1(e, o);
                        return 0.001 - ((n - i) / s) * Math.exp(-r);
                      }),
                      (s = (e) => {
                        let n = e * o,
                          s = n * t,
                          a = Math.pow(o, 2) * Math.pow(e, 2) * t,
                          l = e1(Math.pow(e, 2), o),
                          u = -r(e) + 0.001 > 0 ? -1 : 1;
                        return (u * ((s * i + i - a) * Math.exp(-s))) / l;
                      }))
                    : ((r = (e) => {
                        let n = Math.exp(-e * t),
                          r = (e - i) * t + 1;
                        return -0.001 + n * r;
                      }),
                      (s = (e) => {
                        let n = Math.exp(-e * t),
                          r = (i - e) * (t * t);
                        return n * r;
                      })));
                let a = 5 / t,
                  l = (function (t, e, i) {
                    let n = i;
                    for (let i = 1; i < 12; i++) n -= t(n) / e(n);
                    return n;
                  })(r, s, a);
                if (((t = t7(t)), isNaN(l)))
                  return { stiffness: 100, damping: 10, duration: t };
                {
                  let e = Math.pow(l, 2) * n;
                  return {
                    stiffness: e,
                    damping: 2 * o * Math.sqrt(n * e),
                    duration: t,
                  };
                }
              })(t);
              (e = { ...e, ...i, mass: 1 }).isResolvedFromDuration = !0;
            }
            return e;
          })({ ...n, velocity: -et(n.velocity || 0) }),
          m = d || 0,
          f = u / (2 * Math.sqrt(l * h)),
          g = o - s,
          v = et(Math.sqrt(l / h)),
          y = 5 > Math.abs(g);
        if ((i || (i = y ? 0.01 : 2), e || (e = y ? 0.005 : 0.5), f < 1)) {
          let t = e1(v, f);
          r = (e) => {
            let i = Math.exp(-f * v * e);
            return (
              o -
              i *
                (((m + f * v * g) / t) * Math.sin(t * e) + g * Math.cos(t * e))
            );
          };
        } else if (1 === f)
          r = (t) => o - Math.exp(-v * t) * (g + (m + v * g) * t);
        else {
          let t = v * Math.sqrt(f * f - 1);
          r = (e) => {
            let i = Math.exp(-f * v * e),
              n = Math.min(t * e, 300);
            return (
              o -
              (i * ((m + f * v * g) * Math.sinh(n) + t * g * Math.cosh(n))) / t
            );
          };
        }
        return {
          calculatedDuration: (p && c) || null,
          next: (t) => {
            let n = r(t);
            if (p) a.done = t >= c;
            else {
              let s = m;
              0 !== t && (s = f < 1 ? e0(r, t, n) : 0);
              let l = Math.abs(s) <= i,
                u = Math.abs(o - n) <= e;
              a.done = l && u;
            }
            return ((a.value = a.done ? o : n), a);
          },
        };
      }
      function e4({
        keyframes: t,
        velocity: e = 0,
        power: i = 0.8,
        timeConstant: n = 325,
        bounceDamping: r = 10,
        bounceStiffness: s = 500,
        modifyTarget: o,
        min: a,
        max: l,
        restDelta: u = 0.5,
        restSpeed: h,
      }) {
        let c, d;
        let p = t[0],
          m = { done: !1, value: p },
          f = (t) => (void 0 !== a && t < a) || (void 0 !== l && t > l),
          g = (t) =>
            void 0 === a
              ? l
              : void 0 === l
                ? a
                : Math.abs(a - t) < Math.abs(l - t)
                  ? a
                  : l,
          v = i * e,
          y = p + v,
          x = void 0 === o ? y : o(y);
        x !== y && (v = x - p);
        let P = (t) => -v * Math.exp(-t / n),
          b = (t) => x + P(t),
          T = (t) => {
            let e = P(t),
              i = b(t);
            ((m.done = Math.abs(e) <= u), (m.value = m.done ? x : i));
          },
          w = (t) => {
            f(m.value) &&
              ((c = t),
              (d = e9({
                keyframes: [m.value, g(m.value)],
                velocity: e0(b, t, m.value),
                damping: r,
                stiffness: s,
                restDelta: u,
                restSpeed: h,
              })));
          };
        return (
          w(0),
          {
            calculatedDuration: null,
            next: (t) => {
              let e = !1;
              return (d || void 0 !== c || ((e = !0), T(t), w(t)),
              void 0 !== c && t > c)
                ? d.next(t - c)
                : (e || T(t), m);
            },
          }
        );
      }
      let e6 = (t) => {
        let e = ({ timestamp: e }) => t(e);
        return {
          start: () => tD.update(e, !0),
          stop: () => tk(e),
          now: () => (tR.isProcessing ? tR.timestamp : performance.now()),
        };
      };
      function e8(t) {
        let e = 0,
          i = t.next(e);
        for (; !i.done && e < 2e4; ) ((e += 50), (i = t.next(e)));
        return e >= 2e4 ? 1 / 0 : e;
      }
      let e7 = { decay: e4, inertia: e4, tween: eQ, keyframes: eQ, spring: e9 };
      function it({
        autoplay: t = !0,
        delay: e = 0,
        driver: i = e6,
        keyframes: n,
        type: r = "keyframes",
        repeat: s = 0,
        repeatDelay: o = 0,
        repeatType: a = "loop",
        onPlay: l,
        onStop: u,
        onComplete: h,
        onUpdate: c,
        ...d
      }) {
        let p,
          m,
          f,
          g,
          v,
          y = 1,
          x = !1,
          P = () => {
            m = new Promise((t) => {
              p = t;
            });
          };
        P();
        let b = e7[r] || eQ;
        b !== eQ &&
          "number" != typeof n[0] &&
          ((g = eJ([0, 100], n, { clamp: !1 })), (n = [0, 100]));
        let T = b({ ...d, keyframes: n });
        "mirror" === a &&
          (v = b({
            ...d,
            keyframes: [...n].reverse(),
            velocity: -(d.velocity || 0),
          }));
        let w = "idle",
          A = null,
          S = null,
          V = null;
        null === T.calculatedDuration && s && (T.calculatedDuration = e8(T));
        let { calculatedDuration: E } = T,
          C = 1 / 0,
          M = 1 / 0;
        null !== E && (M = (C = E + o) * (s + 1) - o);
        let D = 0,
          k = (t) => {
            if (null === S) return;
            (y > 0 && (S = Math.min(S, t)),
              y < 0 && (S = Math.min(t - M / y, S)),
              (D = null !== A ? A : Math.round(t - S) * y));
            let i = D - e * (y >= 0 ? 1 : -1),
              r = y >= 0 ? i < 0 : i > M;
            ((D = Math.max(i, 0)), "finished" === w && null === A && (D = M));
            let l = D,
              u = T;
            if (s) {
              let t = Math.min(D, M) / C,
                e = Math.floor(t),
                i = t % 1;
              (!i && t >= 1 && (i = 1),
                1 === i && e--,
                (e = Math.min(e, s + 1)));
              let n = !!(e % 2);
              (n &&
                ("reverse" === a
                  ? ((i = 1 - i), o && (i -= o / C))
                  : "mirror" === a && (u = v)),
                (l = U(0, 1, i) * C));
            }
            let h = r ? { done: !1, value: n[0] } : u.next(l);
            g && (h.value = g(h.value));
            let { done: d } = h;
            r || null === E || (d = y >= 0 ? D >= M : D <= 0);
            let p = null === A && ("finished" === w || ("running" === w && d));
            return (c && c(h.value), p && j(), h);
          },
          R = () => {
            (f && f.stop(), (f = void 0));
          },
          L = () => {
            ((w = "idle"), R(), p(), P(), (S = V = null));
          },
          j = () => {
            ((w = "finished"), h && h(), R(), p());
          },
          F = () => {
            if (x) return;
            f || (f = i(k));
            let t = f.now();
            (l && l(),
              null !== A ? (S = t - A) : (S && "finished" !== w) || (S = t),
              "finished" === w && P(),
              (V = S),
              (A = null),
              (w = "running"),
              f.start());
          };
        t && F();
        let B = {
          then: (t, e) => m.then(t, e),
          get time() {
            return et(D);
          },
          set time(newTime) {
            ((D = newTime = t7(newTime)),
              null === A && f && 0 !== y
                ? (S = f.now() - newTime / y)
                : (A = newTime));
          },
          get duration() {
            let t =
              null === T.calculatedDuration ? e8(T) : T.calculatedDuration;
            return et(t);
          },
          get speed() {
            return y;
          },
          set speed(newSpeed) {
            if (newSpeed === y || !f) return;
            ((y = newSpeed), (B.time = et(D)));
          },
          get state() {
            return w;
          },
          play: F,
          pause: () => {
            ((w = "paused"), (A = D));
          },
          stop: () => {
            ((x = !0), "idle" !== w && ((w = "idle"), u && u(), L()));
          },
          cancel: () => {
            (null !== V && k(V), L());
          },
          complete: () => {
            w = "finished";
          },
          sample: (t) => ((S = 0), k(t)),
        };
        return B;
      }
      let ie = (function (t) {
          let e;
          return () => (void 0 === e && (e = t()), e);
        })(() => Object.hasOwnProperty.call(Element.prototype, "animate")),
        ii = new Set([
          "opacity",
          "clipPath",
          "filter",
          "transform",
          "backgroundColor",
        ]),
        ir = (t, e) =>
          "spring" === e.type ||
          "backgroundColor" === t ||
          !(function t(e) {
            return !!(
              !e ||
              ("string" == typeof e && er[e]) ||
              ei(e) ||
              (Array.isArray(e) && e.every(t))
            );
          })(e.ease),
        is = { type: "spring", stiffness: 500, damping: 25, restSpeed: 10 },
        io = (t) => ({
          type: "spring",
          stiffness: 550,
          damping: 0 === t ? 2 * Math.sqrt(550) : 30,
          restSpeed: 10,
        }),
        ia = { type: "keyframes", duration: 0.8 },
        il = { type: "keyframes", ease: [0.25, 0.1, 0.35, 1], duration: 0.3 },
        iu = (t, { keyframes: e }) =>
          e.length > 2
            ? ia
            : M.has(t)
              ? t.startsWith("scale")
                ? io(e[1])
                : is
              : il,
        ih = (t, e) =>
          "zIndex" !== t &&
          !!(
            "number" == typeof e ||
            Array.isArray(e) ||
            ("string" == typeof e &&
              (ez.test(e) || "0" === e) &&
              !e.startsWith("url("))
          ),
        ic = new Set(["brightness", "contrast", "saturate", "opacity"]);
      function id(t) {
        let [e, i] = t.slice(0, -1).split("(");
        if ("drop-shadow" === e) return t;
        let [n] = i.match(H) || [];
        if (!n) return t;
        let r = i.replace(n, ""),
          s = ic.has(e) ? 1 : 0;
        return (n !== i && (s *= 100), e + "(" + s + r + ")");
      }
      let ip = /([a-z-]*)\(.*?\)/g,
        im = {
          ...ez,
          getAnimatableNone: (t) => {
            let e = t.match(ip);
            return e ? e.map(id).join(" ") : t;
          },
        },
        ig = {
          ...te,
          color: eC,
          backgroundColor: eC,
          outlineColor: eC,
          fill: eC,
          stroke: eC,
          borderColor: eC,
          borderTopColor: eC,
          borderRightColor: eC,
          borderBottomColor: eC,
          borderLeftColor: eC,
          filter: im,
          WebkitFilter: im,
        },
        iv = (t) => ig[t];
      function iy(t, e) {
        let i = iv(t);
        return (
          i !== im && (i = ez),
          i.getAnimatableNone ? i.getAnimatableNone(e) : void 0
        );
      }
      let ix = (t) => /^0[^.\s]+$/.test(t);
      function iP(t, e) {
        return t[e] || t.default || t;
      }
      let ib = { skipAnimations: !1 },
        iT =
          (t, e, i, n = {}) =>
          (r) => {
            let s = iP(n, t) || {},
              o = s.delay || n.delay || 0,
              { elapsed: a = 0 } = n;
            a -= t7(o);
            let l = (function (t, e, i, n) {
                let r, s;
                let o = ih(e, i);
                r = Array.isArray(i) ? [...i] : [null, i];
                let a = void 0 !== n.from ? n.from : t.get(),
                  l = [];
                for (let t = 0; t < r.length; t++) {
                  var u;
                  (null === r[t] && (r[t] = 0 === t ? a : r[t - 1]),
                    ("number" == typeof (u = r[t])
                      ? 0 === u
                      : null !== u
                        ? "none" === u || "0" === u || ix(u)
                        : void 0) && l.push(t),
                    "string" == typeof r[t] &&
                      "none" !== r[t] &&
                      "0" !== r[t] &&
                      (s = r[t]));
                }
                if (o && l.length && s)
                  for (let t = 0; t < l.length; t++) {
                    let i = l[t];
                    r[i] = iy(e, s);
                  }
                return r;
              })(e, t, i, s),
              u = l[0],
              h = l[l.length - 1],
              c = ih(t, u),
              d = ih(t, h);
            tE(
              c === d,
              `You are trying to animate ${t} from "${u}" to "${h}". ${u} is not an animatable value - to enable this animation set ${u} to a value animatable to ${h} via the \`style\` property.`,
            );
            let p = {
              keyframes: l,
              velocity: e.getVelocity(),
              ease: "easeOut",
              ...s,
              delay: -a,
              onUpdate: (t) => {
                (e.set(t), s.onUpdate && s.onUpdate(t));
              },
              onComplete: () => {
                (r(), s.onComplete && s.onComplete());
              },
            };
            if (
              (!(function ({
                when: t,
                delay: e,
                delayChildren: i,
                staggerChildren: n,
                staggerDirection: r,
                repeat: s,
                repeatType: o,
                repeatDelay: a,
                from: l,
                elapsed: u,
                ...h
              }) {
                return !!Object.keys(h).length;
              })(s) && (p = { ...p, ...iu(t, p) }),
              p.duration && (p.duration = t7(p.duration)),
              p.repeatDelay && (p.repeatDelay = t7(p.repeatDelay)),
              !c || !d || ee.current || !1 === s.type || ib.skipAnimations)
            )
              return (function ({
                keyframes: t,
                delay: e,
                onUpdate: i,
                onComplete: n,
              }) {
                let r = () => (
                  i && i(t[t.length - 1]),
                  n && n(),
                  {
                    time: 0,
                    speed: 1,
                    duration: 0,
                    play: tE,
                    pause: tE,
                    stop: tE,
                    then: (t) => (t(), Promise.resolve()),
                    cancel: tE,
                    complete: tE,
                  }
                );
                return e
                  ? it({
                      keyframes: [0, 1],
                      duration: 0,
                      delay: e,
                      onComplete: r,
                    })
                  : r();
              })(ee.current ? { ...p, delay: 0 } : p);
            if (
              !n.isHandoff &&
              e.owner &&
              e.owner.current instanceof HTMLElement &&
              !e.owner.getProps().onUpdate
            ) {
              let i = (function (t, e, { onUpdate: i, onComplete: n, ...r }) {
                let s, o;
                let a =
                  ie() &&
                  ii.has(e) &&
                  !r.repeatDelay &&
                  "mirror" !== r.repeatType &&
                  0 !== r.damping &&
                  "inertia" !== r.type;
                if (!a) return !1;
                let l = !1,
                  u = !1,
                  h = () => {
                    o = new Promise((t) => {
                      s = t;
                    });
                  };
                h();
                let { keyframes: c, duration: d = 300, ease: p, times: m } = r;
                if (ir(e, r)) {
                  let t = it({ ...r, repeat: 0, delay: 0 }),
                    e = { done: !1, value: c[0] },
                    i = [],
                    n = 0;
                  for (; !e.done && n < 2e4; )
                    ((e = t.sample(n)), i.push(e.value), (n += 10));
                  ((m = void 0), (c = i), (d = n - 10), (p = "linear"));
                }
                let f = (function (
                    t,
                    e,
                    i,
                    {
                      delay: n = 0,
                      duration: r,
                      repeat: s = 0,
                      repeatType: o = "loop",
                      ease: a,
                      times: l,
                    } = {},
                  ) {
                    let u = { [e]: i };
                    l && (u.offset = l);
                    let h = (function t(e) {
                      if (e)
                        return ei(e)
                          ? en(e)
                          : Array.isArray(e)
                            ? e.map(t)
                            : er[e];
                    })(a);
                    return (
                      Array.isArray(h) && (u.easing = h),
                      t.animate(u, {
                        delay: n,
                        duration: r,
                        easing: Array.isArray(h) ? "linear" : h,
                        fill: "both",
                        iterations: s + 1,
                        direction: "reverse" === o ? "alternate" : "normal",
                      })
                    );
                  })(t.owner.current, e, c, {
                    ...r,
                    duration: d,
                    ease: p,
                    times: m,
                  }),
                  g = () => {
                    ((u = !1), f.cancel());
                  },
                  v = () => {
                    ((u = !0), tD.update(g), s(), h());
                  };
                return (
                  (f.onfinish = () => {
                    u ||
                      (t.set(
                        (function (t, { repeat: e, repeatType: i = "loop" }) {
                          let n =
                            e && "loop" !== i && e % 2 == 1 ? 0 : t.length - 1;
                          return t[n];
                        })(c, r),
                      ),
                      n && n(),
                      v());
                  }),
                  {
                    then: (t, e) => o.then(t, e),
                    attachTimeline: (t) => (
                      (f.timeline = t),
                      (f.onfinish = null),
                      tE
                    ),
                    get time() {
                      return et(f.currentTime || 0);
                    },
                    set time(newTime) {
                      f.currentTime = t7(newTime);
                    },
                    get speed() {
                      return f.playbackRate;
                    },
                    set speed(newSpeed) {
                      f.playbackRate = newSpeed;
                    },
                    get duration() {
                      return et(d);
                    },
                    play: () => {
                      l || (f.play(), tk(g));
                    },
                    pause: () => f.pause(),
                    stop: () => {
                      if (((l = !0), "idle" === f.playState)) return;
                      let { currentTime: e } = f;
                      if (e) {
                        let i = it({ ...r, autoplay: !1 });
                        t.setWithVelocity(
                          i.sample(e - 10).value,
                          i.sample(e).value,
                          10,
                        );
                      }
                      v();
                    },
                    complete: () => {
                      u || f.finish();
                    },
                    cancel: v,
                  }
                );
              })(e, t, p);
              if (i) return i;
            }
            return it(p);
          };
      function iw(t) {
        return !!(k(t) && t.add);
      }
      let iA = (t) => /^\-?\d*\.?\d+$/.test(t);
      function iS(t, e) {
        -1 === t.indexOf(e) && t.push(e);
      }
      function iV(t, e) {
        let i = t.indexOf(e);
        i > -1 && t.splice(i, 1);
      }
      class iE {
        constructor() {
          this.subscriptions = [];
        }
        add(t) {
          return (iS(this.subscriptions, t), () => iV(this.subscriptions, t));
        }
        notify(t, e, i) {
          let n = this.subscriptions.length;
          if (n) {
            if (1 === n) this.subscriptions[0](t, e, i);
            else
              for (let r = 0; r < n; r++) {
                let n = this.subscriptions[r];
                n && n(t, e, i);
              }
          }
        }
        getSize() {
          return this.subscriptions.length;
        }
        clear() {
          this.subscriptions.length = 0;
        }
      }
      let iC = (t) => !isNaN(parseFloat(t)),
        iM = { current: void 0 };
      class iD {
        constructor(t, e = {}) {
          ((this.version = "10.18.0"),
            (this.timeDelta = 0),
            (this.lastUpdated = 0),
            (this.canTrackVelocity = !1),
            (this.events = {}),
            (this.updateAndNotify = (t, e = !0) => {
              ((this.prev = this.current), (this.current = t));
              let { delta: i, timestamp: n } = tR;
              (this.lastUpdated !== n &&
                ((this.timeDelta = i),
                (this.lastUpdated = n),
                tD.postRender(this.scheduleVelocityCheck)),
                this.prev !== this.current &&
                  this.events.change &&
                  this.events.change.notify(this.current),
                this.events.velocityChange &&
                  this.events.velocityChange.notify(this.getVelocity()),
                e &&
                  this.events.renderRequest &&
                  this.events.renderRequest.notify(this.current));
            }),
            (this.scheduleVelocityCheck = () =>
              tD.postRender(this.velocityCheck)),
            (this.velocityCheck = ({ timestamp: t }) => {
              t !== this.lastUpdated &&
                ((this.prev = this.current),
                this.events.velocityChange &&
                  this.events.velocityChange.notify(this.getVelocity()));
            }),
            (this.hasAnimated = !1),
            (this.prev = this.current = t),
            (this.canTrackVelocity = iC(this.current)),
            (this.owner = e.owner));
        }
        onChange(t) {
          return this.on("change", t);
        }
        on(t, e) {
          this.events[t] || (this.events[t] = new iE());
          let i = this.events[t].add(e);
          return "change" === t
            ? () => {
                (i(),
                  tD.read(() => {
                    this.events.change.getSize() || this.stop();
                  }));
              }
            : i;
        }
        clearListeners() {
          for (let t in this.events) this.events[t].clear();
        }
        attach(t, e) {
          ((this.passiveEffect = t), (this.stopPassiveEffect = e));
        }
        set(t, e = !0) {
          e && this.passiveEffect
            ? this.passiveEffect(t, this.updateAndNotify)
            : this.updateAndNotify(t, e);
        }
        setWithVelocity(t, e, i) {
          (this.set(e), (this.prev = t), (this.timeDelta = i));
        }
        jump(t) {
          (this.updateAndNotify(t),
            (this.prev = t),
            this.stop(),
            this.stopPassiveEffect && this.stopPassiveEffect());
        }
        get() {
          return (iM.current && iM.current.push(this), this.current);
        }
        getPrevious() {
          return this.prev;
        }
        getVelocity() {
          var t, e;
          return this.canTrackVelocity
            ? ((t = parseFloat(this.current) - parseFloat(this.prev)),
              (e = this.timeDelta) ? t * (1e3 / e) : 0)
            : 0;
        }
        start(t) {
          return (
            this.stop(),
            new Promise((e) => {
              ((this.hasAnimated = !0),
                (this.animation = t(e)),
                this.events.animationStart &&
                  this.events.animationStart.notify());
            }).then(() => {
              (this.events.animationComplete &&
                this.events.animationComplete.notify(),
                this.clearAnimation());
            })
          );
        }
        stop() {
          (this.animation &&
            (this.animation.stop(),
            this.events.animationCancel &&
              this.events.animationCancel.notify()),
            this.clearAnimation());
        }
        isAnimating() {
          return !!this.animation;
        }
        clearAnimation() {
          delete this.animation;
        }
        destroy() {
          (this.clearListeners(),
            this.stop(),
            this.stopPassiveEffect && this.stopPassiveEffect());
        }
      }
      function ik(t, e) {
        return new iD(t, e);
      }
      let iR = (t) => (e) => e.test(t),
        iL = [I, K, Z, q, J, _, { test: (t) => "auto" === t, parse: (t) => t }],
        ij = (t) => iL.find(iR(t)),
        iF = [...iL, eC, ez],
        iB = (t) => iF.find(iR(t));
      function iO(t, e, { delay: i = 0, transitionOverride: n, type: r } = {}) {
        let {
            transition: s = t.getDefaultTransition(),
            transitionEnd: o,
            ...a
          } = t.makeTargetAnimatable(e),
          l = t.getValue("willChange");
        n && (s = n);
        let u = [],
          h = r && t.animationState && t.animationState.getState()[r];
        for (let e in a) {
          let n = t.getValue(e),
            r = a[e];
          if (
            !n ||
            void 0 === r ||
            (h &&
              (function ({ protectedKeys: t, needsAnimating: e }, i) {
                let n = t.hasOwnProperty(i) && !0 !== e[i];
                return ((e[i] = !1), n);
              })(h, e))
          )
            continue;
          let o = { delay: i, elapsed: 0, ...iP(s || {}, e) };
          if (window.HandoffAppearAnimations) {
            let i = t.getProps()[c];
            if (i) {
              let t = window.HandoffAppearAnimations(i, e, n, tD);
              null !== t && ((o.elapsed = t), (o.isHandoff = !0));
            }
          }
          let d =
            !o.isHandoff &&
            !(function (t, e) {
              let i = t.get();
              if (!Array.isArray(e)) return i !== e;
              for (let t = 0; t < e.length; t++) if (e[t] !== i) return !0;
            })(n, r);
          if (
            ("spring" === o.type && (n.getVelocity() || o.velocity) && (d = !1),
            n.animation && (d = !1),
            d)
          )
            continue;
          n.start(
            iT(e, n, r, t.shouldReduceMotion && M.has(e) ? { type: !1 } : o),
          );
          let p = n.animation;
          (iw(l) && (l.add(e), p.then(() => l.remove(e))), u.push(p));
        }
        return (
          o &&
            Promise.all(u).then(() => {
              o &&
                (function (t, e) {
                  let i = t8(t, e),
                    {
                      transitionEnd: n = {},
                      transition: r = {},
                      ...s
                    } = i ? t.makeTargetAnimatable(i, !1) : {};
                  for (let e in (s = { ...s, ...n })) {
                    let i = tA(s[e]);
                    t.hasValue(e) ? t.getValue(e).set(i) : t.addValue(e, ik(i));
                  }
                })(t, o);
            }),
          u
        );
      }
      function iU(t, e, i = {}) {
        let n = t8(t, e, i.custom),
          { transition: r = t.getDefaultTransition() || {} } = n || {};
        i.transitionOverride && (r = i.transitionOverride);
        let s = n ? () => Promise.all(iO(t, n, i)) : () => Promise.resolve(),
          o =
            t.variantChildren && t.variantChildren.size
              ? (n = 0) => {
                  let {
                    delayChildren: s = 0,
                    staggerChildren: o,
                    staggerDirection: a,
                  } = r;
                  return (function (t, e, i = 0, n = 0, r = 1, s) {
                    let o = [],
                      a = (t.variantChildren.size - 1) * n,
                      l = 1 === r ? (t = 0) => t * n : (t = 0) => a - t * n;
                    return (
                      Array.from(t.variantChildren)
                        .sort(iI)
                        .forEach((t, n) => {
                          (t.notify("AnimationStart", e),
                            o.push(
                              iU(t, e, { ...s, delay: i + l(n) }).then(() =>
                                t.notify("AnimationComplete", e),
                              ),
                            ));
                        }),
                      Promise.all(o)
                    );
                  })(t, e, s + n, o, a, i);
                }
              : () => Promise.resolve(),
          { when: a } = r;
        if (!a) return Promise.all([s(), o(i.delay)]);
        {
          let [t, e] = "beforeChildren" === a ? [s, o] : [o, s];
          return t().then(() => e());
        }
      }
      function iI(t, e) {
        return t.sortNodePosition(e);
      }
      let iN = [...f].reverse(),
        i$ = f.length;
      function iW(t = !1) {
        return {
          isActive: t,
          protectedKeys: {},
          needsAnimating: {},
          prevResolvedValues: {},
        };
      }
      class iH extends tq {
        constructor(t) {
          (super(t),
            t.animationState ||
              (t.animationState = (function (t) {
                let e = (e) =>
                    Promise.all(
                      e.map(({ animation: e, options: i }) =>
                        (function (t, e, i = {}) {
                          let n;
                          if (
                            (t.notify("AnimationStart", e), Array.isArray(e))
                          ) {
                            let r = e.map((e) => iU(t, e, i));
                            n = Promise.all(r);
                          } else if ("string" == typeof e) n = iU(t, e, i);
                          else {
                            let r =
                              "function" == typeof e ? t8(t, e, i.custom) : e;
                            n = Promise.all(iO(t, r, i));
                          }
                          return n.then(() => t.notify("AnimationComplete", e));
                        })(t, e, i),
                      ),
                    ),
                  i = {
                    animate: iW(!0),
                    whileInView: iW(),
                    whileHover: iW(),
                    whileTap: iW(),
                    whileDrag: iW(),
                    whileFocus: iW(),
                    exit: iW(),
                  },
                  n = !0,
                  r = (e, i) => {
                    let n = t8(t, i);
                    if (n) {
                      let { transition: t, transitionEnd: i, ...r } = n;
                      e = { ...e, ...r, ...i };
                    }
                    return e;
                  };
                function s(s, o) {
                  let a = t.getProps(),
                    l = t.getVariantContext(!0) || {},
                    u = [],
                    h = new Set(),
                    c = {},
                    d = 1 / 0;
                  for (let e = 0; e < i$; e++) {
                    var f;
                    let g = iN[e],
                      v = i[g],
                      y = void 0 !== a[g] ? a[g] : l[g],
                      x = p(y),
                      P = g === o ? v.isActive : null;
                    !1 === P && (d = e);
                    let b = y === l[g] && y !== a[g] && x;
                    if (
                      (b && n && t.manuallyAnimateOnMount && (b = !1),
                      (v.protectedKeys = { ...c }),
                      (!v.isActive && null === P) ||
                        (!y && !v.prevProp) ||
                        m(y) ||
                        "boolean" == typeof y)
                    )
                      continue;
                    let T =
                        ((f = v.prevProp),
                        "string" == typeof y
                          ? y !== f
                          : !!Array.isArray(y) && !t6(y, f)),
                      w =
                        T || (g === o && v.isActive && !b && x) || (e > d && x),
                      A = !1,
                      S = Array.isArray(y) ? y : [y],
                      V = S.reduce(r, {});
                    !1 === P && (V = {});
                    let { prevResolvedValues: E = {} } = v,
                      C = { ...E, ...V },
                      M = (t) => {
                        ((w = !0),
                          h.has(t) && ((A = !0), h.delete(t)),
                          (v.needsAnimating[t] = !0));
                      };
                    for (let t in C) {
                      let e = V[t],
                        i = E[t];
                      if (!c.hasOwnProperty(t))
                        (tT(e) && tT(i) ? t6(e, i) : e === i)
                          ? void 0 !== e && h.has(t)
                            ? M(t)
                            : (v.protectedKeys[t] = !0)
                          : void 0 !== e
                            ? M(t)
                            : h.add(t);
                    }
                    ((v.prevProp = y),
                      (v.prevResolvedValues = V),
                      v.isActive && (c = { ...c, ...V }),
                      n && t.blockInitialAnimation && (w = !1),
                      w &&
                        (!b || A) &&
                        u.push(
                          ...S.map((t) => ({
                            animation: t,
                            options: { type: g, ...s },
                          })),
                        ));
                  }
                  if (h.size) {
                    let e = {};
                    (h.forEach((i) => {
                      let n = t.getBaseTarget(i);
                      void 0 !== n && (e[i] = n);
                    }),
                      u.push({ animation: e }));
                  }
                  let g = !!u.length;
                  return (
                    n &&
                      (!1 === a.initial || a.initial === a.animate) &&
                      !t.manuallyAnimateOnMount &&
                      (g = !1),
                    (n = !1),
                    g ? e(u) : Promise.resolve()
                  );
                }
                return {
                  animateChanges: s,
                  setActive: function (e, n, r) {
                    var o;
                    if (i[e].isActive === n) return Promise.resolve();
                    (null === (o = t.variantChildren) ||
                      void 0 === o ||
                      o.forEach((t) => {
                        var i;
                        return null === (i = t.animationState) || void 0 === i
                          ? void 0
                          : i.setActive(e, n);
                      }),
                      (i[e].isActive = n));
                    let a = s(r, e);
                    for (let t in i) i[t].protectedKeys = {};
                    return a;
                  },
                  setAnimateFunction: function (i) {
                    e = i(t);
                  },
                  getState: () => i,
                };
              })(t)));
        }
        updateAnimationControlsSubscription() {
          let { animate: t } = this.node.getProps();
          (this.unmount(), m(t) && (this.unmount = t.subscribe(this.node)));
        }
        mount() {
          this.updateAnimationControlsSubscription();
        }
        update() {
          let { animate: t } = this.node.getProps(),
            { animate: e } = this.node.prevProps || {};
          t !== e && this.updateAnimationControlsSubscription();
        }
        unmount() {}
      }
      let iz = 0;
      class iY extends tq {
        constructor() {
          (super(...arguments), (this.id = iz++));
        }
        update() {
          if (!this.node.presenceContext) return;
          let {
              isPresent: t,
              onExitComplete: e,
              custom: i,
            } = this.node.presenceContext,
            { isPresent: n } = this.node.prevPresenceContext || {};
          if (!this.node.animationState || t === n) return;
          let r = this.node.animationState.setActive("exit", !t, {
            custom: null != i ? i : this.node.getProps().custom,
          });
          e && !t && r.then(() => e(this.id));
        }
        mount() {
          let { register: t } = this.node.presenceContext || {};
          t && (this.unmount = t(this.id));
        }
        unmount() {}
      }
      let iX = (t, e) => Math.abs(t - e);
      class iG {
        constructor(
          t,
          e,
          {
            transformPagePoint: i,
            contextWindow: n,
            dragSnapToOrigin: r = !1,
          } = {},
        ) {
          if (
            ((this.startEvent = null),
            (this.lastMoveEvent = null),
            (this.lastMoveEventInfo = null),
            (this.handlers = {}),
            (this.contextWindow = window),
            (this.updatePoint = () => {
              if (!(this.lastMoveEvent && this.lastMoveEventInfo)) return;
              let t = iK(this.lastMoveEventInfo, this.history),
                e = null !== this.startEvent,
                i =
                  (function (t, e) {
                    let i = iX(t.x, e.x),
                      n = iX(t.y, e.y);
                    return Math.sqrt(i ** 2 + n ** 2);
                  })(t.offset, { x: 0, y: 0 }) >= 3;
              if (!e && !i) return;
              let { point: n } = t,
                { timestamp: r } = tR;
              this.history.push({ ...n, timestamp: r });
              let { onStart: s, onMove: o } = this.handlers;
              (e ||
                (s && s(this.lastMoveEvent, t),
                (this.startEvent = this.lastMoveEvent)),
                o && o(this.lastMoveEvent, t));
            }),
            (this.handlePointerMove = (t, e) => {
              ((this.lastMoveEvent = t),
                (this.lastMoveEventInfo = iq(e, this.transformPagePoint)),
                tD.update(this.updatePoint, !0));
            }),
            (this.handlePointerUp = (t, e) => {
              this.end();
              let {
                onEnd: i,
                onSessionEnd: n,
                resumeAnimation: r,
              } = this.handlers;
              if (
                (this.dragSnapToOrigin && r && r(),
                !(this.lastMoveEvent && this.lastMoveEventInfo))
              )
                return;
              let s = iK(
                "pointercancel" === t.type
                  ? this.lastMoveEventInfo
                  : iq(e, this.transformPagePoint),
                this.history,
              );
              (this.startEvent && i && i(t, s), n && n(t, s));
            }),
            !tO(t))
          )
            return;
          ((this.dragSnapToOrigin = r),
            (this.handlers = e),
            (this.transformPagePoint = i),
            (this.contextWindow = n || window));
          let s = tU(t),
            o = iq(s, this.transformPagePoint),
            { point: a } = o,
            { timestamp: l } = tR;
          this.history = [{ ...a, timestamp: l }];
          let { onSessionStart: u } = e;
          (u && u(t, iK(o, this.history)),
            (this.removeListeners = tW(
              tN(this.contextWindow, "pointermove", this.handlePointerMove),
              tN(this.contextWindow, "pointerup", this.handlePointerUp),
              tN(this.contextWindow, "pointercancel", this.handlePointerUp),
            )));
        }
        updateHandlers(t) {
          this.handlers = t;
        }
        end() {
          (this.removeListeners && this.removeListeners(),
            tk(this.updatePoint));
        }
      }
      function iq(t, e) {
        return e ? { point: e(t.point) } : t;
      }
      function iZ(t, e) {
        return { x: t.x - e.x, y: t.y - e.y };
      }
      function iK({ point: t }, e) {
        return {
          point: t,
          delta: iZ(t, i_(e)),
          offset: iZ(t, e[0]),
          velocity: (function (t, e) {
            if (t.length < 2) return { x: 0, y: 0 };
            let i = t.length - 1,
              n = null,
              r = i_(t);
            for (
              ;
              i >= 0 && ((n = t[i]), !(r.timestamp - n.timestamp > t7(0.1)));
            )
              i--;
            if (!n) return { x: 0, y: 0 };
            let s = et(r.timestamp - n.timestamp);
            if (0 === s) return { x: 0, y: 0 };
            let o = { x: (r.x - n.x) / s, y: (r.y - n.y) / s };
            return (o.x === 1 / 0 && (o.x = 0), o.y === 1 / 0 && (o.y = 0), o);
          })(e, 0),
        };
      }
      function i_(t) {
        return t[t.length - 1];
      }
      function iJ(t) {
        return t.max - t.min;
      }
      function iQ(t, e = 0, i = 0.01) {
        return Math.abs(t - e) <= i;
      }
      function i0(t, e, i, n = 0.5) {
        ((t.origin = n),
          (t.originPoint = eM(e.min, e.max, t.origin)),
          (t.scale = iJ(i) / iJ(e)),
          (iQ(t.scale, 1, 1e-4) || isNaN(t.scale)) && (t.scale = 1),
          (t.translate = eM(i.min, i.max, t.origin) - t.originPoint),
          (iQ(t.translate) || isNaN(t.translate)) && (t.translate = 0));
      }
      function i1(t, e, i, n) {
        (i0(t.x, e.x, i.x, n ? n.originX : void 0),
          i0(t.y, e.y, i.y, n ? n.originY : void 0));
      }
      function i5(t, e, i) {
        ((t.min = i.min + e.min), (t.max = t.min + iJ(e)));
      }
      function i2(t, e, i) {
        ((t.min = e.min - i.min), (t.max = t.min + iJ(e)));
      }
      function i3(t, e, i) {
        (i2(t.x, e.x, i.x), i2(t.y, e.y, i.y));
      }
      function i9(t, e, i) {
        return {
          min: void 0 !== e ? t.min + e : void 0,
          max: void 0 !== i ? t.max + i - (t.max - t.min) : void 0,
        };
      }
      function i4(t, e) {
        let i = e.min - t.min,
          n = e.max - t.max;
        return (
          e.max - e.min < t.max - t.min && ([i, n] = [n, i]),
          { min: i, max: n }
        );
      }
      function i6(t, e, i) {
        return { min: i8(t, e), max: i8(t, i) };
      }
      function i8(t, e) {
        return "number" == typeof t ? t : t[e] || 0;
      }
      let i7 = () => ({ translate: 0, scale: 1, origin: 0, originPoint: 0 }),
        nt = () => ({ x: i7(), y: i7() }),
        ne = () => ({ min: 0, max: 0 }),
        ni = () => ({ x: ne(), y: ne() });
      function nn(t) {
        return [t("x"), t("y")];
      }
      function nr({ top: t, left: e, right: i, bottom: n }) {
        return { x: { min: e, max: i }, y: { min: t, max: n } };
      }
      function ns(t) {
        return void 0 === t || 1 === t;
      }
      function no({ scale: t, scaleX: e, scaleY: i }) {
        return !ns(t) || !ns(e) || !ns(i);
      }
      function na(t) {
        return no(t) || nl(t) || t.z || t.rotate || t.rotateX || t.rotateY;
      }
      function nl(t) {
        var e, i;
        return ((e = t.x) && "0%" !== e) || ((i = t.y) && "0%" !== i);
      }
      function nu(t, e, i, n, r) {
        return (void 0 !== r && (t = n + r * (t - n)), n + i * (t - n) + e);
      }
      function nh(t, e = 0, i = 1, n, r) {
        ((t.min = nu(t.min, e, i, n, r)), (t.max = nu(t.max, e, i, n, r)));
      }
      function nc(t, { x: e, y: i }) {
        (nh(t.x, e.translate, e.scale, e.originPoint),
          nh(t.y, i.translate, i.scale, i.originPoint));
      }
      function nd(t) {
        return Number.isInteger(t)
          ? t
          : t > 1.0000000000001 || t < 0.999999999999
            ? t
            : 1;
      }
      function np(t, e) {
        ((t.min = t.min + e), (t.max = t.max + e));
      }
      function nm(t, e, [i, n, r]) {
        let s = void 0 !== e[r] ? e[r] : 0.5,
          o = eM(t.min, t.max, s);
        nh(t, e[i], e[n], o, e.scale);
      }
      let nf = ["x", "scaleX", "originX"],
        ng = ["y", "scaleY", "originY"];
      function nv(t, e) {
        (nm(t.x, e, nf), nm(t.y, e, ng));
      }
      function ny(t, e) {
        return nr(
          (function (t, e) {
            if (!e) return t;
            let i = e({ x: t.left, y: t.top }),
              n = e({ x: t.right, y: t.bottom });
            return { top: i.y, left: i.x, bottom: n.y, right: n.x };
          })(t.getBoundingClientRect(), e),
        );
      }
      let nx = ({ current: t }) => (t ? t.ownerDocument.defaultView : null),
        nP = new WeakMap();
      class nb {
        constructor(t) {
          ((this.openGlobalLock = null),
            (this.isDragging = !1),
            (this.currentDirection = null),
            (this.originPoint = { x: 0, y: 0 }),
            (this.constraints = !1),
            (this.hasMutatedConstraints = !1),
            (this.elastic = ni()),
            (this.visualElement = t));
        }
        start(t, { snapToCursor: e = !1 } = {}) {
          let { presenceContext: i } = this.visualElement;
          if (i && !1 === i.isPresent) return;
          let { dragSnapToOrigin: n } = this.getProps();
          this.panSession = new iG(
            t,
            {
              onSessionStart: (t) => {
                let { dragSnapToOrigin: i } = this.getProps();
                (i ? this.pauseAnimation() : this.stopAnimation(),
                  e && this.snapToCursor(tU(t, "page").point));
              },
              onStart: (t, e) => {
                let {
                  drag: i,
                  dragPropagation: n,
                  onDragStart: r,
                } = this.getProps();
                if (
                  i &&
                  !n &&
                  (this.openGlobalLock && this.openGlobalLock(),
                  (this.openGlobalLock = tX(i)),
                  !this.openGlobalLock)
                )
                  return;
                ((this.isDragging = !0),
                  (this.currentDirection = null),
                  this.resolveConstraints(),
                  this.visualElement.projection &&
                    ((this.visualElement.projection.isAnimationBlocked = !0),
                    (this.visualElement.projection.target = void 0)),
                  nn((t) => {
                    let e = this.getAxisMotionValue(t).get() || 0;
                    if (Z.test(e)) {
                      let { projection: i } = this.visualElement;
                      if (i && i.layout) {
                        let n = i.layout.layoutBox[t];
                        if (n) {
                          let t = iJ(n);
                          e = t * (parseFloat(e) / 100);
                        }
                      }
                    }
                    this.originPoint[t] = e;
                  }),
                  r && tD.update(() => r(t, e), !1, !0));
                let { animationState: s } = this.visualElement;
                s && s.setActive("whileDrag", !0);
              },
              onMove: (t, e) => {
                let {
                  dragPropagation: i,
                  dragDirectionLock: n,
                  onDirectionLock: r,
                  onDrag: s,
                } = this.getProps();
                if (!i && !this.openGlobalLock) return;
                let { offset: o } = e;
                if (n && null === this.currentDirection) {
                  ((this.currentDirection = (function (t, e = 10) {
                    let i = null;
                    return (
                      Math.abs(t.y) > e
                        ? (i = "y")
                        : Math.abs(t.x) > e && (i = "x"),
                      i
                    );
                  })(o)),
                    null !== this.currentDirection &&
                      r &&
                      r(this.currentDirection));
                  return;
                }
                (this.updateAxis("x", e.point, o),
                  this.updateAxis("y", e.point, o),
                  this.visualElement.render(),
                  s && s(t, e));
              },
              onSessionEnd: (t, e) => this.stop(t, e),
              resumeAnimation: () =>
                nn((t) => {
                  var e;
                  return (
                    "paused" === this.getAnimationState(t) &&
                    (null === (e = this.getAxisMotionValue(t).animation) ||
                    void 0 === e
                      ? void 0
                      : e.play())
                  );
                }),
            },
            {
              transformPagePoint: this.visualElement.getTransformPagePoint(),
              dragSnapToOrigin: n,
              contextWindow: nx(this.visualElement),
            },
          );
        }
        stop(t, e) {
          let i = this.isDragging;
          if ((this.cancel(), !i)) return;
          let { velocity: n } = e;
          this.startAnimation(n);
          let { onDragEnd: r } = this.getProps();
          r && tD.update(() => r(t, e));
        }
        cancel() {
          this.isDragging = !1;
          let { projection: t, animationState: e } = this.visualElement;
          (t && (t.isAnimationBlocked = !1),
            this.panSession && this.panSession.end(),
            (this.panSession = void 0));
          let { dragPropagation: i } = this.getProps();
          (!i &&
            this.openGlobalLock &&
            (this.openGlobalLock(), (this.openGlobalLock = null)),
            e && e.setActive("whileDrag", !1));
        }
        updateAxis(t, e, i) {
          let { drag: n } = this.getProps();
          if (!i || !nT(t, n, this.currentDirection)) return;
          let r = this.getAxisMotionValue(t),
            s = this.originPoint[t] + i[t];
          (this.constraints &&
            this.constraints[t] &&
            (s = (function (t, { min: e, max: i }, n) {
              return (
                void 0 !== e && t < e
                  ? (t = n ? eM(e, t, n.min) : Math.max(t, e))
                  : void 0 !== i &&
                    t > i &&
                    (t = n ? eM(i, t, n.max) : Math.min(t, i)),
                t
              );
            })(s, this.constraints[t], this.elastic[t])),
            r.set(s));
        }
        resolveConstraints() {
          var t;
          let { dragConstraints: e, dragElastic: i } = this.getProps(),
            n =
              this.visualElement.projection &&
              !this.visualElement.projection.layout
                ? this.visualElement.projection.measure(!1)
                : null === (t = this.visualElement.projection) || void 0 === t
                  ? void 0
                  : t.layout,
            r = this.constraints;
          (e && d(e)
            ? this.constraints ||
              (this.constraints = this.resolveRefConstraints())
            : e && n
              ? (this.constraints = (function (
                  t,
                  { top: e, left: i, bottom: n, right: r },
                ) {
                  return { x: i9(t.x, i, r), y: i9(t.y, e, n) };
                })(n.layoutBox, e))
              : (this.constraints = !1),
            (this.elastic = (function (t = 0.35) {
              return (
                !1 === t ? (t = 0) : !0 === t && (t = 0.35),
                { x: i6(t, "left", "right"), y: i6(t, "top", "bottom") }
              );
            })(i)),
            r !== this.constraints &&
              n &&
              this.constraints &&
              !this.hasMutatedConstraints &&
              nn((t) => {
                this.getAxisMotionValue(t) &&
                  (this.constraints[t] = (function (t, e) {
                    let i = {};
                    return (
                      void 0 !== e.min && (i.min = e.min - t.min),
                      void 0 !== e.max && (i.max = e.max - t.min),
                      i
                    );
                  })(n.layoutBox[t], this.constraints[t]));
              }));
        }
        resolveRefConstraints() {
          var t;
          let { dragConstraints: e, onMeasureDragConstraints: i } =
            this.getProps();
          if (!e || !d(e)) return !1;
          let n = e.current;
          tE(
            null !== n,
            "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.",
          );
          let { projection: r } = this.visualElement;
          if (!r || !r.layout) return !1;
          let s = (function (t, e, i) {
              let n = ny(t, i),
                { scroll: r } = e;
              return (r && (np(n.x, r.offset.x), np(n.y, r.offset.y)), n);
            })(n, r.root, this.visualElement.getTransformPagePoint()),
            o = { x: i4((t = r.layout.layoutBox).x, s.x), y: i4(t.y, s.y) };
          if (i) {
            let t = i(
              (function ({ x: t, y: e }) {
                return { top: e.min, right: t.max, bottom: e.max, left: t.min };
              })(o),
            );
            ((this.hasMutatedConstraints = !!t), t && (o = nr(t)));
          }
          return o;
        }
        startAnimation(t) {
          let {
              drag: e,
              dragMomentum: i,
              dragElastic: n,
              dragTransition: r,
              dragSnapToOrigin: s,
              onDragTransitionEnd: o,
            } = this.getProps(),
            a = this.constraints || {},
            l = nn((o) => {
              if (!nT(o, e, this.currentDirection)) return;
              let l = (a && a[o]) || {};
              s && (l = { min: 0, max: 0 });
              let u = {
                type: "inertia",
                velocity: i ? t[o] : 0,
                bounceStiffness: n ? 200 : 1e6,
                bounceDamping: n ? 40 : 1e7,
                timeConstant: 750,
                restDelta: 1,
                restSpeed: 10,
                ...r,
                ...l,
              };
              return this.startAxisValueAnimation(o, u);
            });
          return Promise.all(l).then(o);
        }
        startAxisValueAnimation(t, e) {
          let i = this.getAxisMotionValue(t);
          return i.start(iT(t, i, 0, e));
        }
        stopAnimation() {
          nn((t) => this.getAxisMotionValue(t).stop());
        }
        pauseAnimation() {
          nn((t) => {
            var e;
            return null === (e = this.getAxisMotionValue(t).animation) ||
              void 0 === e
              ? void 0
              : e.pause();
          });
        }
        getAnimationState(t) {
          var e;
          return null === (e = this.getAxisMotionValue(t).animation) ||
            void 0 === e
            ? void 0
            : e.state;
        }
        getAxisMotionValue(t) {
          let e = "_drag" + t.toUpperCase(),
            i = this.visualElement.getProps(),
            n = i[e];
          return (
            n ||
            this.visualElement.getValue(
              t,
              (i.initial ? i.initial[t] : void 0) || 0,
            )
          );
        }
        snapToCursor(t) {
          nn((e) => {
            let { drag: i } = this.getProps();
            if (!nT(e, i, this.currentDirection)) return;
            let { projection: n } = this.visualElement,
              r = this.getAxisMotionValue(e);
            if (n && n.layout) {
              let { min: i, max: s } = n.layout.layoutBox[e];
              r.set(t[e] - eM(i, s, 0.5));
            }
          });
        }
        scalePositionWithinConstraints() {
          if (!this.visualElement.current) return;
          let { drag: t, dragConstraints: e } = this.getProps(),
            { projection: i } = this.visualElement;
          if (!d(e) || !i || !this.constraints) return;
          this.stopAnimation();
          let n = { x: 0, y: 0 };
          nn((t) => {
            let e = this.getAxisMotionValue(t);
            if (e) {
              let i = e.get();
              n[t] = (function (t, e) {
                let i = 0.5,
                  n = iJ(t),
                  r = iJ(e);
                return (
                  r > n
                    ? (i = eK(e.min, e.max - n, t.min))
                    : n > r && (i = eK(t.min, t.max - r, e.min)),
                  U(0, 1, i)
                );
              })({ min: i, max: i }, this.constraints[t]);
            }
          });
          let { transformTemplate: r } = this.visualElement.getProps();
          ((this.visualElement.current.style.transform = r
            ? r({}, "")
            : "none"),
            i.root && i.root.updateScroll(),
            i.updateLayout(),
            this.resolveConstraints(),
            nn((e) => {
              if (!nT(e, t, null)) return;
              let i = this.getAxisMotionValue(e),
                { min: r, max: s } = this.constraints[e];
              i.set(eM(r, s, n[e]));
            }));
        }
        addListeners() {
          if (!this.visualElement.current) return;
          nP.set(this.visualElement, this);
          let t = this.visualElement.current,
            e = tN(t, "pointerdown", (t) => {
              let { drag: e, dragListener: i = !0 } = this.getProps();
              e && i && this.start(t);
            }),
            i = () => {
              let { dragConstraints: t } = this.getProps();
              d(t) && (this.constraints = this.resolveRefConstraints());
            },
            { projection: n } = this.visualElement,
            r = n.addEventListener("measure", i);
          (n &&
            !n.layout &&
            (n.root && n.root.updateScroll(), n.updateLayout()),
            i());
          let s = tB(window, "resize", () =>
              this.scalePositionWithinConstraints(),
            ),
            o = n.addEventListener(
              "didUpdate",
              ({ delta: t, hasLayoutChanged: e }) => {
                this.isDragging &&
                  e &&
                  (nn((e) => {
                    let i = this.getAxisMotionValue(e);
                    i &&
                      ((this.originPoint[e] += t[e].translate),
                      i.set(i.get() + t[e].translate));
                  }),
                  this.visualElement.render());
              },
            );
          return () => {
            (s(), e(), r(), o && o());
          };
        }
        getProps() {
          let t = this.visualElement.getProps(),
            {
              drag: e = !1,
              dragDirectionLock: i = !1,
              dragPropagation: n = !1,
              dragConstraints: r = !1,
              dragElastic: s = 0.35,
              dragMomentum: o = !0,
            } = t;
          return {
            ...t,
            drag: e,
            dragDirectionLock: i,
            dragPropagation: n,
            dragConstraints: r,
            dragElastic: s,
            dragMomentum: o,
          };
        }
      }
      function nT(t, e, i) {
        return (!0 === e || e === t) && (null === i || i === t);
      }
      class nw extends tq {
        constructor(t) {
          (super(t),
            (this.removeGroupControls = tE),
            (this.removeListeners = tE),
            (this.controls = new nb(t)));
        }
        mount() {
          let { dragControls: t } = this.node.getProps();
          (t && (this.removeGroupControls = t.subscribe(this.controls)),
            (this.removeListeners = this.controls.addListeners() || tE));
        }
        unmount() {
          (this.removeGroupControls(), this.removeListeners());
        }
      }
      let nA = (t) => (e, i) => {
        t && tD.update(() => t(e, i));
      };
      class nS extends tq {
        constructor() {
          (super(...arguments), (this.removePointerDownListener = tE));
        }
        onPointerDown(t) {
          this.session = new iG(t, this.createPanHandlers(), {
            transformPagePoint: this.node.getTransformPagePoint(),
            contextWindow: nx(this.node),
          });
        }
        createPanHandlers() {
          let {
            onPanSessionStart: t,
            onPanStart: e,
            onPan: i,
            onPanEnd: n,
          } = this.node.getProps();
          return {
            onSessionStart: nA(t),
            onStart: nA(e),
            onMove: i,
            onEnd: (t, e) => {
              (delete this.session, n && tD.update(() => n(t, e)));
            },
          };
        }
        mount() {
          this.removePointerDownListener = tN(
            this.node.current,
            "pointerdown",
            (t) => this.onPointerDown(t),
          );
        }
        update() {
          this.session && this.session.updateHandlers(this.createPanHandlers());
        }
        unmount() {
          (this.removePointerDownListener(),
            this.session && this.session.end());
        }
      }
      let nV = { hasAnimatedSinceResize: !0, hasEverUpdated: !1 };
      function nE(t, e) {
        return e.max === e.min ? 0 : (t / (e.max - e.min)) * 100;
      }
      let nC = {
        correct: (t, e) => {
          if (!e.target) return t;
          if ("string" == typeof t) {
            if (!K.test(t)) return t;
            t = parseFloat(t);
          }
          let i = nE(t, e.target.x),
            n = nE(t, e.target.y);
          return `${i}% ${n}%`;
        },
      };
      class nM extends n.Component {
        componentDidMount() {
          let {
              visualElement: t,
              layoutGroup: e,
              switchLayoutGroup: i,
              layoutId: n,
            } = this.props,
            { projection: r } = t;
          (Object.assign(E, nk),
            r &&
              (e.group && e.group.add(r),
              i && i.register && n && i.register(r),
              r.root.didUpdate(),
              r.addEventListener("animationComplete", () => {
                this.safeToRemove();
              }),
              r.setOptions({
                ...r.options,
                onExitComplete: () => this.safeToRemove(),
              })),
            (nV.hasEverUpdated = !0));
        }
        getSnapshotBeforeUpdate(t) {
          let {
              layoutDependency: e,
              visualElement: i,
              drag: n,
              isPresent: r,
            } = this.props,
            s = i.projection;
          return (
            s &&
              ((s.isPresent = r),
              n || t.layoutDependency !== e || void 0 === e
                ? s.willUpdate()
                : this.safeToRemove(),
              t.isPresent === r ||
                (r
                  ? s.promote()
                  : s.relegate() ||
                    tD.postRender(() => {
                      let t = s.getStack();
                      (t && t.members.length) || this.safeToRemove();
                    }))),
            null
          );
        }
        componentDidUpdate() {
          let { projection: t } = this.props.visualElement;
          t &&
            (t.root.didUpdate(),
            queueMicrotask(() => {
              !t.currentAnimation && t.isLead() && this.safeToRemove();
            }));
        }
        componentWillUnmount() {
          let {
              visualElement: t,
              layoutGroup: e,
              switchLayoutGroup: i,
            } = this.props,
            { projection: n } = t;
          n &&
            (n.scheduleCheckAfterUnmount(),
            e && e.group && e.group.remove(n),
            i && i.deregister && i.deregister(n));
        }
        safeToRemove() {
          let { safeToRemove: t } = this.props;
          t && t();
        }
        render() {
          return null;
        }
      }
      function nD(t) {
        let [e, i] = (function () {
            let t = (0, n.useContext)(o);
            if (null === t) return [!0, null];
            let { isPresent: e, onExitComplete: i, register: r } = t,
              s = (0, n.useId)();
            return (
              (0, n.useEffect)(() => r(s), []),
              !e && i ? [!1, () => i && i(s)] : [!0]
            );
          })(),
          r = (0, n.useContext)(T);
        return n.createElement(nM, {
          ...t,
          layoutGroup: r,
          switchLayoutGroup: (0, n.useContext)(w),
          isPresent: e,
          safeToRemove: i,
        });
      }
      let nk = {
          borderRadius: {
            ...nC,
            applyTo: [
              "borderTopLeftRadius",
              "borderTopRightRadius",
              "borderBottomLeftRadius",
              "borderBottomRightRadius",
            ],
          },
          borderTopLeftRadius: nC,
          borderTopRightRadius: nC,
          borderBottomLeftRadius: nC,
          borderBottomRightRadius: nC,
          boxShadow: {
            correct: (t, { treeScale: e, projectionDelta: i }) => {
              let n = ez.parse(t);
              if (n.length > 5) return t;
              let r = ez.createTransformer(t),
                s = "number" != typeof n[0] ? 1 : 0,
                o = i.x.scale * e.x,
                a = i.y.scale * e.y;
              ((n[0 + s] /= o), (n[1 + s] /= a));
              let l = eM(o, a, 0.5);
              return (
                "number" == typeof n[2 + s] && (n[2 + s] /= l),
                "number" == typeof n[3 + s] && (n[3 + s] /= l),
                r(n)
              );
            },
          },
        },
        nR = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"],
        nL = nR.length,
        nj = (t) => ("string" == typeof t ? parseFloat(t) : t),
        nF = (t) => "number" == typeof t || K.test(t);
      function nB(t, e) {
        return void 0 !== t[e] ? t[e] : t.borderRadius;
      }
      let nO = nI(0, 0.5, em),
        nU = nI(0.5, 0.95, tE);
      function nI(t, e, i) {
        return (n) => (n < t ? 0 : n > e ? 1 : i(eK(t, e, n)));
      }
      function nN(t, e) {
        ((t.min = e.min), (t.max = e.max));
      }
      function n$(t, e) {
        (nN(t.x, e.x), nN(t.y, e.y));
      }
      function nW(t, e, i, n, r) {
        return (
          (t -= e),
          (t = n + (1 / i) * (t - n)),
          void 0 !== r && (t = n + (1 / r) * (t - n)),
          t
        );
      }
      function nH(t, e, [i, n, r], s, o) {
        !(function (t, e = 0, i = 1, n = 0.5, r, s = t, o = t) {
          if (Z.test(e)) {
            e = parseFloat(e);
            let t = eM(o.min, o.max, e / 100);
            e = t - o.min;
          }
          if ("number" != typeof e) return;
          let a = eM(s.min, s.max, n);
          (t === s && (a -= e),
            (t.min = nW(t.min, e, i, a, r)),
            (t.max = nW(t.max, e, i, a, r)));
        })(t, e[i], e[n], e[r], e.scale, s, o);
      }
      let nz = ["x", "scaleX", "originX"],
        nY = ["y", "scaleY", "originY"];
      function nX(t, e, i, n) {
        (nH(t.x, e, nz, i ? i.x : void 0, n ? n.x : void 0),
          nH(t.y, e, nY, i ? i.y : void 0, n ? n.y : void 0));
      }
      function nG(t) {
        return 0 === t.translate && 1 === t.scale;
      }
      function nq(t) {
        return nG(t.x) && nG(t.y);
      }
      function nZ(t, e) {
        return (
          Math.round(t.x.min) === Math.round(e.x.min) &&
          Math.round(t.x.max) === Math.round(e.x.max) &&
          Math.round(t.y.min) === Math.round(e.y.min) &&
          Math.round(t.y.max) === Math.round(e.y.max)
        );
      }
      function nK(t) {
        return iJ(t.x) / iJ(t.y);
      }
      class n_ {
        constructor() {
          this.members = [];
        }
        add(t) {
          (iS(this.members, t), t.scheduleRender());
        }
        remove(t) {
          if (
            (iV(this.members, t),
            t === this.prevLead && (this.prevLead = void 0),
            t === this.lead)
          ) {
            let t = this.members[this.members.length - 1];
            t && this.promote(t);
          }
        }
        relegate(t) {
          let e;
          let i = this.members.findIndex((e) => t === e);
          if (0 === i) return !1;
          for (let t = i; t >= 0; t--) {
            let i = this.members[t];
            if (!1 !== i.isPresent) {
              e = i;
              break;
            }
          }
          return !!e && (this.promote(e), !0);
        }
        promote(t, e) {
          let i = this.lead;
          if (t !== i && ((this.prevLead = i), (this.lead = t), t.show(), i)) {
            (i.instance && i.scheduleRender(),
              t.scheduleRender(),
              (t.resumeFrom = i),
              e && (t.resumeFrom.preserveOpacity = !0),
              i.snapshot &&
                ((t.snapshot = i.snapshot),
                (t.snapshot.latestValues =
                  i.animationValues || i.latestValues)),
              t.root && t.root.isUpdating && (t.isLayoutDirty = !0));
            let { crossfade: n } = t.options;
            !1 === n && i.hide();
          }
        }
        exitAnimationComplete() {
          this.members.forEach((t) => {
            let { options: e, resumingFrom: i } = t;
            (e.onExitComplete && e.onExitComplete(),
              i && i.options.onExitComplete && i.options.onExitComplete());
          });
        }
        scheduleRender() {
          this.members.forEach((t) => {
            t.instance && t.scheduleRender(!1);
          });
        }
        removeLeadSnapshot() {
          this.lead && this.lead.snapshot && (this.lead.snapshot = void 0);
        }
      }
      function nJ(t, e, i) {
        let n = "",
          r = t.x.translate / e.x,
          s = t.y.translate / e.y;
        if (
          ((r || s) && (n = `translate3d(${r}px, ${s}px, 0) `),
          (1 !== e.x || 1 !== e.y) && (n += `scale(${1 / e.x}, ${1 / e.y}) `),
          i)
        ) {
          let { rotate: t, rotateX: e, rotateY: r } = i;
          (t && (n += `rotate(${t}deg) `),
            e && (n += `rotateX(${e}deg) `),
            r && (n += `rotateY(${r}deg) `));
        }
        let o = t.x.scale * e.x,
          a = t.y.scale * e.y;
        return (
          (1 !== o || 1 !== a) && (n += `scale(${o}, ${a})`),
          n || "none"
        );
      }
      let nQ = (t, e) => t.depth - e.depth;
      class n0 {
        constructor() {
          ((this.children = []), (this.isDirty = !1));
        }
        add(t) {
          (iS(this.children, t), (this.isDirty = !0));
        }
        remove(t) {
          (iV(this.children, t), (this.isDirty = !0));
        }
        forEach(t) {
          (this.isDirty && this.children.sort(nQ),
            (this.isDirty = !1),
            this.children.forEach(t));
        }
      }
      let n1 = ["", "X", "Y", "Z"],
        n5 = { visibility: "hidden" },
        n2 = 0,
        n3 = {
          type: "projectionFrame",
          totalNodes: 0,
          resolvedTargetDeltas: 0,
          recalculatedProjection: 0,
        };
      function n9({
        attachResizeListener: t,
        defaultParent: e,
        measureScroll: i,
        checkIsScrollRoot: n,
        resetTransform: r,
      }) {
        return class {
          constructor(t = {}, i = null == e ? void 0 : e()) {
            ((this.id = n2++),
              (this.animationId = 0),
              (this.children = new Set()),
              (this.options = {}),
              (this.isTreeAnimating = !1),
              (this.isAnimationBlocked = !1),
              (this.isLayoutDirty = !1),
              (this.isProjectionDirty = !1),
              (this.isSharedProjectionDirty = !1),
              (this.isTransformDirty = !1),
              (this.updateManuallyBlocked = !1),
              (this.updateBlockedByResize = !1),
              (this.isUpdating = !1),
              (this.isSVG = !1),
              (this.needsReset = !1),
              (this.shouldResetTransform = !1),
              (this.treeScale = { x: 1, y: 1 }),
              (this.eventHandlers = new Map()),
              (this.hasTreeAnimated = !1),
              (this.updateScheduled = !1),
              (this.projectionUpdateScheduled = !1),
              (this.checkUpdateFailed = () => {
                this.isUpdating &&
                  ((this.isUpdating = !1), this.clearAllSnapshots());
              }),
              (this.updateProjection = () => {
                ((this.projectionUpdateScheduled = !1),
                  (n3.totalNodes =
                    n3.resolvedTargetDeltas =
                    n3.recalculatedProjection =
                      0),
                  this.nodes.forEach(n8),
                  this.nodes.forEach(rs),
                  this.nodes.forEach(ro),
                  this.nodes.forEach(n7),
                  window.MotionDebug && window.MotionDebug.record(n3));
              }),
              (this.hasProjected = !1),
              (this.isVisible = !0),
              (this.animationProgress = 0),
              (this.sharedNodes = new Map()),
              (this.latestValues = t),
              (this.root = i ? i.root || i : this),
              (this.path = i ? [...i.path, i] : []),
              (this.parent = i),
              (this.depth = i ? i.depth + 1 : 0));
            for (let t = 0; t < this.path.length; t++)
              this.path[t].shouldResetTransform = !0;
            this.root === this && (this.nodes = new n0());
          }
          addEventListener(t, e) {
            return (
              this.eventHandlers.has(t) || this.eventHandlers.set(t, new iE()),
              this.eventHandlers.get(t).add(e)
            );
          }
          notifyListeners(t, ...e) {
            let i = this.eventHandlers.get(t);
            i && i.notify(...e);
          }
          hasListeners(t) {
            return this.eventHandlers.has(t);
          }
          mount(e, i = this.root.hasTreeAnimated) {
            if (this.instance) return;
            ((this.isSVG = e instanceof SVGElement && "svg" !== e.tagName),
              (this.instance = e));
            let { layoutId: n, layout: r, visualElement: s } = this.options;
            if (
              (s && !s.current && s.mount(e),
              this.root.nodes.add(this),
              this.parent && this.parent.children.add(this),
              i && (r || n) && (this.isLayoutDirty = !0),
              t)
            ) {
              let i;
              let n = () => (this.root.updateBlockedByResize = !1);
              t(e, () => {
                ((this.root.updateBlockedByResize = !0),
                  i && i(),
                  (i = (function (t, e) {
                    let i = performance.now(),
                      n = ({ timestamp: r }) => {
                        let s = r - i;
                        s >= e && (tk(n), t(s - e));
                      };
                    return (tD.read(n, !0), () => tk(n));
                  })(n, 250)),
                  nV.hasAnimatedSinceResize &&
                    ((nV.hasAnimatedSinceResize = !1), this.nodes.forEach(rr)));
              });
            }
            (n && this.root.registerSharedNode(n, this),
              !1 !== this.options.animate &&
                s &&
                (n || r) &&
                this.addEventListener(
                  "didUpdate",
                  ({
                    delta: t,
                    hasLayoutChanged: e,
                    hasRelativeTargetChanged: i,
                    layout: n,
                  }) => {
                    if (this.isTreeAnimationBlocked()) {
                      ((this.target = void 0), (this.relativeTarget = void 0));
                      return;
                    }
                    let r =
                        this.options.transition ||
                        s.getDefaultTransition() ||
                        rd,
                      {
                        onLayoutAnimationStart: o,
                        onLayoutAnimationComplete: a,
                      } = s.getProps(),
                      l = !this.targetLayout || !nZ(this.targetLayout, n) || i,
                      u = !e && i;
                    if (
                      this.options.layoutRoot ||
                      (this.resumeFrom && this.resumeFrom.instance) ||
                      u ||
                      (e && (l || !this.currentAnimation))
                    ) {
                      (this.resumeFrom &&
                        ((this.resumingFrom = this.resumeFrom),
                        (this.resumingFrom.resumingFrom = void 0)),
                        this.setAnimationOrigin(t, u));
                      let e = { ...iP(r, "layout"), onPlay: o, onComplete: a };
                      ((s.shouldReduceMotion || this.options.layoutRoot) &&
                        ((e.delay = 0), (e.type = !1)),
                        this.startAnimation(e));
                    } else
                      (e || rr(this),
                        this.isLead() &&
                          this.options.onExitComplete &&
                          this.options.onExitComplete());
                    this.targetLayout = n;
                  },
                ));
          }
          unmount() {
            (this.options.layoutId && this.willUpdate(),
              this.root.nodes.remove(this));
            let t = this.getStack();
            (t && t.remove(this),
              this.parent && this.parent.children.delete(this),
              (this.instance = void 0),
              tk(this.updateProjection));
          }
          blockUpdate() {
            this.updateManuallyBlocked = !0;
          }
          unblockUpdate() {
            this.updateManuallyBlocked = !1;
          }
          isUpdateBlocked() {
            return this.updateManuallyBlocked || this.updateBlockedByResize;
          }
          isTreeAnimationBlocked() {
            return (
              this.isAnimationBlocked ||
              (this.parent && this.parent.isTreeAnimationBlocked()) ||
              !1
            );
          }
          startUpdate() {
            !this.isUpdateBlocked() &&
              ((this.isUpdating = !0),
              this.nodes && this.nodes.forEach(ra),
              this.animationId++);
          }
          getTransformTemplate() {
            let { visualElement: t } = this.options;
            return t && t.getProps().transformTemplate;
          }
          willUpdate(t = !0) {
            if (
              ((this.root.hasTreeAnimated = !0), this.root.isUpdateBlocked())
            ) {
              this.options.onExitComplete && this.options.onExitComplete();
              return;
            }
            if (
              (this.root.isUpdating || this.root.startUpdate(),
              this.isLayoutDirty)
            )
              return;
            this.isLayoutDirty = !0;
            for (let t = 0; t < this.path.length; t++) {
              let e = this.path[t];
              ((e.shouldResetTransform = !0),
                e.updateScroll("snapshot"),
                e.options.layoutRoot && e.willUpdate(!1));
            }
            let { layoutId: e, layout: i } = this.options;
            if (void 0 === e && !i) return;
            let n = this.getTransformTemplate();
            ((this.prevTransformTemplateValue = n
              ? n(this.latestValues, "")
              : void 0),
              this.updateSnapshot(),
              t && this.notifyListeners("willUpdate"));
          }
          update() {
            this.updateScheduled = !1;
            let t = this.isUpdateBlocked();
            if (t) {
              (this.unblockUpdate(),
                this.clearAllSnapshots(),
                this.nodes.forEach(re));
              return;
            }
            (this.isUpdating || this.nodes.forEach(ri),
              (this.isUpdating = !1),
              this.nodes.forEach(rn),
              this.nodes.forEach(n4),
              this.nodes.forEach(n6),
              this.clearAllSnapshots());
            let e = performance.now();
            ((tR.delta = U(0, 1e3 / 60, e - tR.timestamp)),
              (tR.timestamp = e),
              (tR.isProcessing = !0),
              tL.update.process(tR),
              tL.preRender.process(tR),
              tL.render.process(tR),
              (tR.isProcessing = !1));
          }
          didUpdate() {
            this.updateScheduled ||
              ((this.updateScheduled = !0),
              queueMicrotask(() => this.update()));
          }
          clearAllSnapshots() {
            (this.nodes.forEach(rt), this.sharedNodes.forEach(rl));
          }
          scheduleUpdateProjection() {
            this.projectionUpdateScheduled ||
              ((this.projectionUpdateScheduled = !0),
              tD.preRender(this.updateProjection, !1, !0));
          }
          scheduleCheckAfterUnmount() {
            tD.postRender(() => {
              this.isLayoutDirty
                ? this.root.didUpdate()
                : this.root.checkUpdateFailed();
            });
          }
          updateSnapshot() {
            !this.snapshot && this.instance && (this.snapshot = this.measure());
          }
          updateLayout() {
            if (
              !this.instance ||
              (this.updateScroll(),
              !(this.options.alwaysMeasureLayout && this.isLead()) &&
                !this.isLayoutDirty)
            )
              return;
            if (this.resumeFrom && !this.resumeFrom.instance)
              for (let t = 0; t < this.path.length; t++) {
                let e = this.path[t];
                e.updateScroll();
              }
            let t = this.layout;
            ((this.layout = this.measure(!1)),
              (this.layoutCorrected = ni()),
              (this.isLayoutDirty = !1),
              (this.projectionDelta = void 0),
              this.notifyListeners("measure", this.layout.layoutBox));
            let { visualElement: e } = this.options;
            e &&
              e.notify(
                "LayoutMeasure",
                this.layout.layoutBox,
                t ? t.layoutBox : void 0,
              );
          }
          updateScroll(t = "measure") {
            let e = !!(this.options.layoutScroll && this.instance);
            (this.scroll &&
              this.scroll.animationId === this.root.animationId &&
              this.scroll.phase === t &&
              (e = !1),
              e &&
                (this.scroll = {
                  animationId: this.root.animationId,
                  phase: t,
                  isRoot: n(this.instance),
                  offset: i(this.instance),
                }));
          }
          resetTransform() {
            if (!r) return;
            let t = this.isLayoutDirty || this.shouldResetTransform,
              e = this.projectionDelta && !nq(this.projectionDelta),
              i = this.getTransformTemplate(),
              n = i ? i(this.latestValues, "") : void 0,
              s = n !== this.prevTransformTemplateValue;
            t &&
              (e || na(this.latestValues) || s) &&
              (r(this.instance, n),
              (this.shouldResetTransform = !1),
              this.scheduleRender());
          }
          measure(t = !0) {
            var e;
            let i = this.measurePageBox(),
              n = this.removeElementScroll(i);
            return (
              t && (n = this.removeTransform(n)),
              rf((e = n).x),
              rf(e.y),
              {
                animationId: this.root.animationId,
                measuredBox: i,
                layoutBox: n,
                latestValues: {},
                source: this.id,
              }
            );
          }
          measurePageBox() {
            let { visualElement: t } = this.options;
            if (!t) return ni();
            let e = t.measureViewportBox(),
              { scroll: i } = this.root;
            return (i && (np(e.x, i.offset.x), np(e.y, i.offset.y)), e);
          }
          removeElementScroll(t) {
            let e = ni();
            n$(e, t);
            for (let i = 0; i < this.path.length; i++) {
              let n = this.path[i],
                { scroll: r, options: s } = n;
              if (n !== this.root && r && s.layoutScroll) {
                if (r.isRoot) {
                  n$(e, t);
                  let { scroll: i } = this.root;
                  i && (np(e.x, -i.offset.x), np(e.y, -i.offset.y));
                }
                (np(e.x, r.offset.x), np(e.y, r.offset.y));
              }
            }
            return e;
          }
          applyTransform(t, e = !1) {
            let i = ni();
            n$(i, t);
            for (let t = 0; t < this.path.length; t++) {
              let n = this.path[t];
              (!e &&
                n.options.layoutScroll &&
                n.scroll &&
                n !== n.root &&
                nv(i, { x: -n.scroll.offset.x, y: -n.scroll.offset.y }),
                na(n.latestValues) && nv(i, n.latestValues));
            }
            return (na(this.latestValues) && nv(i, this.latestValues), i);
          }
          removeTransform(t) {
            let e = ni();
            n$(e, t);
            for (let t = 0; t < this.path.length; t++) {
              let i = this.path[t];
              if (!i.instance || !na(i.latestValues)) continue;
              no(i.latestValues) && i.updateSnapshot();
              let n = ni(),
                r = i.measurePageBox();
              (n$(n, r),
                nX(
                  e,
                  i.latestValues,
                  i.snapshot ? i.snapshot.layoutBox : void 0,
                  n,
                ));
            }
            return (na(this.latestValues) && nX(e, this.latestValues), e);
          }
          setTargetDelta(t) {
            ((this.targetDelta = t),
              this.root.scheduleUpdateProjection(),
              (this.isProjectionDirty = !0));
          }
          setOptions(t) {
            this.options = {
              ...this.options,
              ...t,
              crossfade: void 0 === t.crossfade || t.crossfade,
            };
          }
          clearMeasurements() {
            ((this.scroll = void 0),
              (this.layout = void 0),
              (this.snapshot = void 0),
              (this.prevTransformTemplateValue = void 0),
              (this.targetDelta = void 0),
              (this.target = void 0),
              (this.isLayoutDirty = !1));
          }
          forceRelativeParentToResolveTarget() {
            this.relativeParent &&
              this.relativeParent.resolvedRelativeTargetAt !== tR.timestamp &&
              this.relativeParent.resolveTargetDelta(!0);
          }
          resolveTargetDelta(t = !1) {
            var e, i, n, r;
            let s = this.getLead();
            (this.isProjectionDirty ||
              (this.isProjectionDirty = s.isProjectionDirty),
              this.isTransformDirty ||
                (this.isTransformDirty = s.isTransformDirty),
              this.isSharedProjectionDirty ||
                (this.isSharedProjectionDirty = s.isSharedProjectionDirty));
            let o = !!this.resumingFrom || this !== s,
              a = !(
                t ||
                (o && this.isSharedProjectionDirty) ||
                this.isProjectionDirty ||
                (null === (e = this.parent) || void 0 === e
                  ? void 0
                  : e.isProjectionDirty) ||
                this.attemptToResolveRelativeTarget
              );
            if (a) return;
            let { layout: l, layoutId: u } = this.options;
            if (this.layout && (l || u)) {
              if (
                ((this.resolvedRelativeTargetAt = tR.timestamp),
                !this.targetDelta && !this.relativeTarget)
              ) {
                let t = this.getClosestProjectingParent();
                t && t.layout && 1 !== this.animationProgress
                  ? ((this.relativeParent = t),
                    this.forceRelativeParentToResolveTarget(),
                    (this.relativeTarget = ni()),
                    (this.relativeTargetOrigin = ni()),
                    i3(
                      this.relativeTargetOrigin,
                      this.layout.layoutBox,
                      t.layout.layoutBox,
                    ),
                    n$(this.relativeTarget, this.relativeTargetOrigin))
                  : (this.relativeParent = this.relativeTarget = void 0);
              }
              if (this.relativeTarget || this.targetDelta) {
                if (
                  ((this.target ||
                    ((this.target = ni()), (this.targetWithTransforms = ni())),
                  this.relativeTarget &&
                    this.relativeTargetOrigin &&
                    this.relativeParent &&
                    this.relativeParent.target)
                    ? (this.forceRelativeParentToResolveTarget(),
                      (i = this.target),
                      (n = this.relativeTarget),
                      (r = this.relativeParent.target),
                      i5(i.x, n.x, r.x),
                      i5(i.y, n.y, r.y))
                    : this.targetDelta
                      ? (this.resumingFrom
                          ? (this.target = this.applyTransform(
                              this.layout.layoutBox,
                            ))
                          : n$(this.target, this.layout.layoutBox),
                        nc(this.target, this.targetDelta))
                      : n$(this.target, this.layout.layoutBox),
                  this.attemptToResolveRelativeTarget)
                ) {
                  this.attemptToResolveRelativeTarget = !1;
                  let t = this.getClosestProjectingParent();
                  t &&
                  !!t.resumingFrom == !!this.resumingFrom &&
                  !t.options.layoutScroll &&
                  t.target &&
                  1 !== this.animationProgress
                    ? ((this.relativeParent = t),
                      this.forceRelativeParentToResolveTarget(),
                      (this.relativeTarget = ni()),
                      (this.relativeTargetOrigin = ni()),
                      i3(this.relativeTargetOrigin, this.target, t.target),
                      n$(this.relativeTarget, this.relativeTargetOrigin))
                    : (this.relativeParent = this.relativeTarget = void 0);
                }
                n3.resolvedTargetDeltas++;
              }
            }
          }
          getClosestProjectingParent() {
            return !this.parent ||
              no(this.parent.latestValues) ||
              nl(this.parent.latestValues)
              ? void 0
              : this.parent.isProjecting()
                ? this.parent
                : this.parent.getClosestProjectingParent();
          }
          isProjecting() {
            return !!(
              (this.relativeTarget ||
                this.targetDelta ||
                this.options.layoutRoot) &&
              this.layout
            );
          }
          calcProjection() {
            var t;
            let e = this.getLead(),
              i = !!this.resumingFrom || this !== e,
              n = !0;
            if (
              ((this.isProjectionDirty ||
                (null === (t = this.parent) || void 0 === t
                  ? void 0
                  : t.isProjectionDirty)) &&
                (n = !1),
              i &&
                (this.isSharedProjectionDirty || this.isTransformDirty) &&
                (n = !1),
              this.resolvedRelativeTargetAt === tR.timestamp && (n = !1),
              n)
            )
              return;
            let { layout: r, layoutId: s } = this.options;
            if (
              ((this.isTreeAnimating = !!(
                (this.parent && this.parent.isTreeAnimating) ||
                this.currentAnimation ||
                this.pendingAnimation
              )),
              this.isTreeAnimating ||
                (this.targetDelta = this.relativeTarget = void 0),
              !this.layout || !(r || s))
            )
              return;
            n$(this.layoutCorrected, this.layout.layoutBox);
            let o = this.treeScale.x,
              a = this.treeScale.y;
            ((function (t, e, i, n = !1) {
              let r, s;
              let o = i.length;
              if (o) {
                e.x = e.y = 1;
                for (let a = 0; a < o; a++) {
                  s = (r = i[a]).projectionDelta;
                  let o = r.instance;
                  (!o || !o.style || "contents" !== o.style.display) &&
                    (n &&
                      r.options.layoutScroll &&
                      r.scroll &&
                      r !== r.root &&
                      nv(t, { x: -r.scroll.offset.x, y: -r.scroll.offset.y }),
                    s && ((e.x *= s.x.scale), (e.y *= s.y.scale), nc(t, s)),
                    n && na(r.latestValues) && nv(t, r.latestValues));
                }
                ((e.x = nd(e.x)), (e.y = nd(e.y)));
              }
            })(this.layoutCorrected, this.treeScale, this.path, i),
              e.layout &&
                !e.target &&
                (1 !== this.treeScale.x || 1 !== this.treeScale.y) &&
                (e.target = e.layout.layoutBox));
            let { target: l } = e;
            if (!l) {
              this.projectionTransform &&
                ((this.projectionDelta = nt()),
                (this.projectionTransform = "none"),
                this.scheduleRender());
              return;
            }
            this.projectionDelta ||
              ((this.projectionDelta = nt()),
              (this.projectionDeltaWithTransform = nt()));
            let u = this.projectionTransform;
            (i1(
              this.projectionDelta,
              this.layoutCorrected,
              l,
              this.latestValues,
            ),
              (this.projectionTransform = nJ(
                this.projectionDelta,
                this.treeScale,
              )),
              (this.projectionTransform !== u ||
                this.treeScale.x !== o ||
                this.treeScale.y !== a) &&
                ((this.hasProjected = !0),
                this.scheduleRender(),
                this.notifyListeners("projectionUpdate", l)),
              n3.recalculatedProjection++);
          }
          hide() {
            this.isVisible = !1;
          }
          show() {
            this.isVisible = !0;
          }
          scheduleRender(t = !0) {
            if (
              (this.options.scheduleRender && this.options.scheduleRender(), t)
            ) {
              let t = this.getStack();
              t && t.scheduleRender();
            }
            this.resumingFrom &&
              !this.resumingFrom.instance &&
              (this.resumingFrom = void 0);
          }
          setAnimationOrigin(t, e = !1) {
            let i;
            let n = this.snapshot,
              r = n ? n.latestValues : {},
              s = { ...this.latestValues },
              o = nt();
            ((this.relativeParent && this.relativeParent.options.layoutRoot) ||
              (this.relativeTarget = this.relativeTargetOrigin = void 0),
              (this.attemptToResolveRelativeTarget = !e));
            let a = ni(),
              l = n ? n.source : void 0,
              u = this.layout ? this.layout.source : void 0,
              h = l !== u,
              c = this.getStack(),
              d = !c || c.members.length <= 1,
              p = !!(
                h &&
                !d &&
                !0 === this.options.crossfade &&
                !this.path.some(rc)
              );
            ((this.animationProgress = 0),
              (this.mixTargetDelta = (e) => {
                let n = e / 1e3;
                if (
                  (ru(o.x, t.x, n),
                  ru(o.y, t.y, n),
                  this.setTargetDelta(o),
                  this.relativeTarget &&
                    this.relativeTargetOrigin &&
                    this.layout &&
                    this.relativeParent &&
                    this.relativeParent.layout)
                ) {
                  var l, u, c, m;
                  (i3(
                    a,
                    this.layout.layoutBox,
                    this.relativeParent.layout.layoutBox,
                  ),
                    (c = this.relativeTarget),
                    (m = this.relativeTargetOrigin),
                    rh(c.x, m.x, a.x, n),
                    rh(c.y, m.y, a.y, n),
                    i &&
                      ((l = this.relativeTarget),
                      (u = i),
                      l.x.min === u.x.min &&
                        l.x.max === u.x.max &&
                        l.y.min === u.y.min &&
                        l.y.max === u.y.max) &&
                      (this.isProjectionDirty = !1),
                    i || (i = ni()),
                    n$(i, this.relativeTarget));
                }
                (h &&
                  ((this.animationValues = s),
                  (function (t, e, i, n, r, s) {
                    r
                      ? ((t.opacity = eM(
                          0,
                          void 0 !== i.opacity ? i.opacity : 1,
                          nO(n),
                        )),
                        (t.opacityExit = eM(
                          void 0 !== e.opacity ? e.opacity : 1,
                          0,
                          nU(n),
                        )))
                      : s &&
                        (t.opacity = eM(
                          void 0 !== e.opacity ? e.opacity : 1,
                          void 0 !== i.opacity ? i.opacity : 1,
                          n,
                        ));
                    for (let r = 0; r < nL; r++) {
                      let s = `border${nR[r]}Radius`,
                        o = nB(e, s),
                        a = nB(i, s);
                      if (void 0 === o && void 0 === a) continue;
                      (o || (o = 0), a || (a = 0));
                      let l = 0 === o || 0 === a || nF(o) === nF(a);
                      l
                        ? ((t[s] = Math.max(eM(nj(o), nj(a), n), 0)),
                          (Z.test(a) || Z.test(o)) && (t[s] += "%"))
                        : (t[s] = a);
                    }
                    (e.rotate || i.rotate) &&
                      (t.rotate = eM(e.rotate || 0, i.rotate || 0, n));
                  })(s, r, this.latestValues, n, p, d)),
                  this.root.scheduleUpdateProjection(),
                  this.scheduleRender(),
                  (this.animationProgress = n));
              }),
              this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0));
          }
          startAnimation(t) {
            (this.notifyListeners("animationStart"),
              this.currentAnimation && this.currentAnimation.stop(),
              this.resumingFrom &&
                this.resumingFrom.currentAnimation &&
                this.resumingFrom.currentAnimation.stop(),
              this.pendingAnimation &&
                (tk(this.pendingAnimation), (this.pendingAnimation = void 0)),
              (this.pendingAnimation = tD.update(() => {
                ((nV.hasAnimatedSinceResize = !0),
                  (this.currentAnimation = (function (t, e, i) {
                    let n = k(t) ? t : ik(t);
                    return (n.start(iT("", n, 1e3, i)), n.animation);
                  })(0, 0, {
                    ...t,
                    onUpdate: (e) => {
                      (this.mixTargetDelta(e), t.onUpdate && t.onUpdate(e));
                    },
                    onComplete: () => {
                      (t.onComplete && t.onComplete(),
                        this.completeAnimation());
                    },
                  })),
                  this.resumingFrom &&
                    (this.resumingFrom.currentAnimation =
                      this.currentAnimation),
                  (this.pendingAnimation = void 0));
              })));
          }
          completeAnimation() {
            this.resumingFrom &&
              ((this.resumingFrom.currentAnimation = void 0),
              (this.resumingFrom.preserveOpacity = void 0));
            let t = this.getStack();
            (t && t.exitAnimationComplete(),
              (this.resumingFrom =
                this.currentAnimation =
                this.animationValues =
                  void 0),
              this.notifyListeners("animationComplete"));
          }
          finishAnimation() {
            (this.currentAnimation &&
              (this.mixTargetDelta && this.mixTargetDelta(1e3),
              this.currentAnimation.stop()),
              this.completeAnimation());
          }
          applyTransformsToTarget() {
            let t = this.getLead(),
              {
                targetWithTransforms: e,
                target: i,
                layout: n,
                latestValues: r,
              } = t;
            if (e && i && n) {
              if (
                this !== t &&
                this.layout &&
                n &&
                rg(
                  this.options.animationType,
                  this.layout.layoutBox,
                  n.layoutBox,
                )
              ) {
                i = this.target || ni();
                let e = iJ(this.layout.layoutBox.x);
                ((i.x.min = t.target.x.min), (i.x.max = i.x.min + e));
                let n = iJ(this.layout.layoutBox.y);
                ((i.y.min = t.target.y.min), (i.y.max = i.y.min + n));
              }
              (n$(e, i),
                nv(e, r),
                i1(
                  this.projectionDeltaWithTransform,
                  this.layoutCorrected,
                  e,
                  r,
                ));
            }
          }
          registerSharedNode(t, e) {
            this.sharedNodes.has(t) || this.sharedNodes.set(t, new n_());
            let i = this.sharedNodes.get(t);
            i.add(e);
            let n = e.options.initialPromotionConfig;
            e.promote({
              transition: n ? n.transition : void 0,
              preserveFollowOpacity:
                n && n.shouldPreserveFollowOpacity
                  ? n.shouldPreserveFollowOpacity(e)
                  : void 0,
            });
          }
          isLead() {
            let t = this.getStack();
            return !t || t.lead === this;
          }
          getLead() {
            var t;
            let { layoutId: e } = this.options;
            return (
              (e &&
                (null === (t = this.getStack()) || void 0 === t
                  ? void 0
                  : t.lead)) ||
              this
            );
          }
          getPrevLead() {
            var t;
            let { layoutId: e } = this.options;
            return e
              ? null === (t = this.getStack()) || void 0 === t
                ? void 0
                : t.prevLead
              : void 0;
          }
          getStack() {
            let { layoutId: t } = this.options;
            if (t) return this.root.sharedNodes.get(t);
          }
          promote({
            needsReset: t,
            transition: e,
            preserveFollowOpacity: i,
          } = {}) {
            let n = this.getStack();
            (n && n.promote(this, i),
              t && ((this.projectionDelta = void 0), (this.needsReset = !0)),
              e && this.setOptions({ transition: e }));
          }
          relegate() {
            let t = this.getStack();
            return !!t && t.relegate(this);
          }
          resetRotation() {
            let { visualElement: t } = this.options;
            if (!t) return;
            let e = !1,
              { latestValues: i } = t;
            if (
              ((i.rotate || i.rotateX || i.rotateY || i.rotateZ) && (e = !0),
              !e)
            )
              return;
            let n = {};
            for (let e = 0; e < n1.length; e++) {
              let r = "rotate" + n1[e];
              i[r] && ((n[r] = i[r]), t.setStaticValue(r, 0));
            }
            for (let e in (t.render(), n)) t.setStaticValue(e, n[e]);
            t.scheduleRender();
          }
          getProjectionStyles(t) {
            var e, i;
            if (!this.instance || this.isSVG) return;
            if (!this.isVisible) return n5;
            let n = { visibility: "" },
              r = this.getTransformTemplate();
            if (this.needsReset)
              return (
                (this.needsReset = !1),
                (n.opacity = ""),
                (n.pointerEvents =
                  tS(null == t ? void 0 : t.pointerEvents) || ""),
                (n.transform = r ? r(this.latestValues, "") : "none"),
                n
              );
            let s = this.getLead();
            if (!this.projectionDelta || !this.layout || !s.target) {
              let e = {};
              return (
                this.options.layoutId &&
                  ((e.opacity =
                    void 0 !== this.latestValues.opacity
                      ? this.latestValues.opacity
                      : 1),
                  (e.pointerEvents =
                    tS(null == t ? void 0 : t.pointerEvents) || "")),
                this.hasProjected &&
                  !na(this.latestValues) &&
                  ((e.transform = r ? r({}, "") : "none"),
                  (this.hasProjected = !1)),
                e
              );
            }
            let o = s.animationValues || s.latestValues;
            (this.applyTransformsToTarget(),
              (n.transform = nJ(
                this.projectionDeltaWithTransform,
                this.treeScale,
                o,
              )),
              r && (n.transform = r(o, n.transform)));
            let { x: a, y: l } = this.projectionDelta;
            for (let t in ((n.transformOrigin = `${100 * a.origin}% ${100 * l.origin}% 0`),
            s.animationValues
              ? (n.opacity =
                  s === this
                    ? null !==
                        (i =
                          null !== (e = o.opacity) && void 0 !== e
                            ? e
                            : this.latestValues.opacity) && void 0 !== i
                      ? i
                      : 1
                    : this.preserveOpacity
                      ? this.latestValues.opacity
                      : o.opacityExit)
              : (n.opacity =
                  s === this
                    ? void 0 !== o.opacity
                      ? o.opacity
                      : ""
                    : void 0 !== o.opacityExit
                      ? o.opacityExit
                      : 0),
            E)) {
              if (void 0 === o[t]) continue;
              let { correct: e, applyTo: i } = E[t],
                r = "none" === n.transform ? o[t] : e(o[t], s);
              if (i) {
                let t = i.length;
                for (let e = 0; e < t; e++) n[i[e]] = r;
              } else n[t] = r;
            }
            return (
              this.options.layoutId &&
                (n.pointerEvents =
                  s === this
                    ? tS(null == t ? void 0 : t.pointerEvents) || ""
                    : "none"),
              n
            );
          }
          clearSnapshot() {
            this.resumeFrom = this.snapshot = void 0;
          }
          resetTree() {
            (this.root.nodes.forEach((t) => {
              var e;
              return null === (e = t.currentAnimation) || void 0 === e
                ? void 0
                : e.stop();
            }),
              this.root.nodes.forEach(re),
              this.root.sharedNodes.clear());
          }
        };
      }
      function n4(t) {
        t.updateLayout();
      }
      function n6(t) {
        var e;
        let i =
          (null === (e = t.resumeFrom) || void 0 === e ? void 0 : e.snapshot) ||
          t.snapshot;
        if (t.isLead() && t.layout && i && t.hasListeners("didUpdate")) {
          let { layoutBox: e, measuredBox: n } = t.layout,
            { animationType: r } = t.options,
            s = i.source !== t.layout.source;
          "size" === r
            ? nn((t) => {
                let n = s ? i.measuredBox[t] : i.layoutBox[t],
                  r = iJ(n);
                ((n.min = e[t].min), (n.max = n.min + r));
              })
            : rg(r, i.layoutBox, e) &&
              nn((n) => {
                let r = s ? i.measuredBox[n] : i.layoutBox[n],
                  o = iJ(e[n]);
                ((r.max = r.min + o),
                  t.relativeTarget &&
                    !t.currentAnimation &&
                    ((t.isProjectionDirty = !0),
                    (t.relativeTarget[n].max = t.relativeTarget[n].min + o)));
              });
          let o = nt();
          i1(o, e, i.layoutBox);
          let a = nt();
          s
            ? i1(a, t.applyTransform(n, !0), i.measuredBox)
            : i1(a, e, i.layoutBox);
          let l = !nq(o),
            u = !1;
          if (!t.resumeFrom) {
            let n = t.getClosestProjectingParent();
            if (n && !n.resumeFrom) {
              let { snapshot: r, layout: s } = n;
              if (r && s) {
                let o = ni();
                i3(o, i.layoutBox, r.layoutBox);
                let a = ni();
                (i3(a, e, s.layoutBox),
                  nZ(o, a) || (u = !0),
                  n.options.layoutRoot &&
                    ((t.relativeTarget = a),
                    (t.relativeTargetOrigin = o),
                    (t.relativeParent = n)));
              }
            }
          }
          t.notifyListeners("didUpdate", {
            layout: e,
            snapshot: i,
            delta: a,
            layoutDelta: o,
            hasLayoutChanged: l,
            hasRelativeTargetChanged: u,
          });
        } else if (t.isLead()) {
          let { onExitComplete: e } = t.options;
          e && e();
        }
        t.options.transition = void 0;
      }
      function n8(t) {
        (n3.totalNodes++,
          t.parent &&
            (t.isProjecting() ||
              (t.isProjectionDirty = t.parent.isProjectionDirty),
            t.isSharedProjectionDirty ||
              (t.isSharedProjectionDirty = !!(
                t.isProjectionDirty ||
                t.parent.isProjectionDirty ||
                t.parent.isSharedProjectionDirty
              )),
            t.isTransformDirty ||
              (t.isTransformDirty = t.parent.isTransformDirty)));
      }
      function n7(t) {
        t.isProjectionDirty =
          t.isSharedProjectionDirty =
          t.isTransformDirty =
            !1;
      }
      function rt(t) {
        t.clearSnapshot();
      }
      function re(t) {
        t.clearMeasurements();
      }
      function ri(t) {
        t.isLayoutDirty = !1;
      }
      function rn(t) {
        let { visualElement: e } = t.options;
        (e &&
          e.getProps().onBeforeLayoutMeasure &&
          e.notify("BeforeLayoutMeasure"),
          t.resetTransform());
      }
      function rr(t) {
        (t.finishAnimation(),
          (t.targetDelta = t.relativeTarget = t.target = void 0),
          (t.isProjectionDirty = !0));
      }
      function rs(t) {
        t.resolveTargetDelta();
      }
      function ro(t) {
        t.calcProjection();
      }
      function ra(t) {
        t.resetRotation();
      }
      function rl(t) {
        t.removeLeadSnapshot();
      }
      function ru(t, e, i) {
        ((t.translate = eM(e.translate, 0, i)),
          (t.scale = eM(e.scale, 1, i)),
          (t.origin = e.origin),
          (t.originPoint = e.originPoint));
      }
      function rh(t, e, i, n) {
        ((t.min = eM(e.min, i.min, n)), (t.max = eM(e.max, i.max, n)));
      }
      function rc(t) {
        return t.animationValues && void 0 !== t.animationValues.opacityExit;
      }
      let rd = { duration: 0.45, ease: [0.4, 0, 0.1, 1] },
        rp = (t) =>
          "undefined" != typeof navigator &&
          navigator.userAgent.toLowerCase().includes(t),
        rm = rp("applewebkit/") && !rp("chrome/") ? Math.round : tE;
      function rf(t) {
        ((t.min = rm(t.min)), (t.max = rm(t.max)));
      }
      function rg(t, e, i) {
        return (
          "position" === t ||
          ("preserve-aspect" === t && !iQ(nK(e), nK(i), 0.2))
        );
      }
      let rv = n9({
          attachResizeListener: (t, e) => tB(t, "resize", e),
          measureScroll: () => ({
            x: document.documentElement.scrollLeft || document.body.scrollLeft,
            y: document.documentElement.scrollTop || document.body.scrollTop,
          }),
          checkIsScrollRoot: () => !0,
        }),
        ry = { current: void 0 },
        rx = n9({
          measureScroll: (t) => ({ x: t.scrollLeft, y: t.scrollTop }),
          defaultParent: () => {
            if (!ry.current) {
              let t = new rv({});
              (t.mount(window),
                t.setOptions({ layoutScroll: !0 }),
                (ry.current = t));
            }
            return ry.current;
          },
          resetTransform: (t, e) => {
            t.style.transform = void 0 !== e ? e : "none";
          },
          checkIsScrollRoot: (t) =>
            "fixed" === window.getComputedStyle(t).position,
        }),
        rP = /var\((--[a-zA-Z0-9-_]+),? ?([a-zA-Z0-9 ()%#.,-]+)?\)/;
      function rb(t, e, i = 1) {
        tE(
          i <= 4,
          `Max CSS variable fallback depth detected in property "${t}". This may indicate a circular fallback dependency.`,
        );
        let [n, r] = (function (t) {
          let e = rP.exec(t);
          if (!e) return [,];
          let [, i, n] = e;
          return [i, n];
        })(t);
        if (!n) return;
        let s = window.getComputedStyle(e).getPropertyValue(n);
        if (s) {
          let t = s.trim();
          return iA(t) ? parseFloat(t) : t;
        }
        return B(r) ? rb(r, e, i + 1) : r;
      }
      let rT = new Set([
          "width",
          "height",
          "top",
          "left",
          "right",
          "bottom",
          "x",
          "y",
          "translateX",
          "translateY",
        ]),
        rw = (t) => rT.has(t),
        rA = (t) => Object.keys(t).some(rw),
        rS = (t) => t === I || t === K,
        rV = (t, e) => parseFloat(t.split(", ")[e]),
        rE =
          (t, e) =>
          (i, { transform: n }) => {
            if ("none" === n || !n) return 0;
            let r = n.match(/^matrix3d\((.+)\)$/);
            if (r) return rV(r[1], e);
            {
              let e = n.match(/^matrix\((.+)\)$/);
              return e ? rV(e[1], t) : 0;
            }
          },
        rC = new Set(["x", "y", "z"]),
        rM = C.filter((t) => !rC.has(t)),
        rD = {
          width: ({ x: t }, { paddingLeft: e = "0", paddingRight: i = "0" }) =>
            t.max - t.min - parseFloat(e) - parseFloat(i),
          height: ({ y: t }, { paddingTop: e = "0", paddingBottom: i = "0" }) =>
            t.max - t.min - parseFloat(e) - parseFloat(i),
          top: (t, { top: e }) => parseFloat(e),
          left: (t, { left: e }) => parseFloat(e),
          bottom: ({ y: t }, { top: e }) => parseFloat(e) + (t.max - t.min),
          right: ({ x: t }, { left: e }) => parseFloat(e) + (t.max - t.min),
          x: rE(4, 13),
          y: rE(5, 14),
        };
      ((rD.translateX = rD.x), (rD.translateY = rD.y));
      let rk = (t, e, i) => {
          let n = e.measureViewportBox(),
            r = e.current,
            s = getComputedStyle(r),
            { display: o } = s,
            a = {};
          ("none" === o && e.setStaticValue("display", t.display || "block"),
            i.forEach((t) => {
              a[t] = rD[t](n, s);
            }),
            e.render());
          let l = e.measureViewportBox();
          return (
            i.forEach((i) => {
              let n = e.getValue(i);
              (n && n.jump(a[i]), (t[i] = rD[i](l, s)));
            }),
            t
          );
        },
        rR = (t, e, i = {}, n = {}) => {
          ((e = { ...e }), (n = { ...n }));
          let r = Object.keys(e).filter(rw),
            s = [],
            o = !1,
            l = [];
          if (
            (r.forEach((r) => {
              let a;
              let u = t.getValue(r);
              if (!t.hasValue(r)) return;
              let h = i[r],
                c = ij(h),
                d = e[r];
              if (tT(d)) {
                let t = d.length,
                  e = null === d[0] ? 1 : 0;
                c = ij((h = d[e]));
                for (let i = e; i < t && null !== d[i]; i++)
                  a
                    ? tE(
                        ij(d[i]) === a,
                        "All keyframes must be of the same type",
                      )
                    : tE(
                        (a = ij(d[i])) === c || (rS(c) && rS(a)),
                        "Keyframes must be of the same dimension as the current value",
                      );
              } else a = ij(d);
              if (c !== a) {
                if (rS(c) && rS(a)) {
                  let t = u.get();
                  ("string" == typeof t && u.set(parseFloat(t)),
                    "string" == typeof d
                      ? (e[r] = parseFloat(d))
                      : Array.isArray(d) &&
                        a === K &&
                        (e[r] = d.map(parseFloat)));
                } else
                  (null == c ? void 0 : c.transform) &&
                  (null == a ? void 0 : a.transform) &&
                  (0 === h || 0 === d)
                    ? 0 === h
                      ? u.set(a.transform(h))
                      : (e[r] = c.transform(d))
                    : (o ||
                        ((s = (function (t) {
                          let e = [];
                          return (
                            rM.forEach((i) => {
                              let n = t.getValue(i);
                              void 0 !== n &&
                                (e.push([i, n.get()]),
                                n.set(i.startsWith("scale") ? 1 : 0));
                            }),
                            e.length && t.render(),
                            e
                          );
                        })(t)),
                        (o = !0)),
                      l.push(r),
                      (n[r] = void 0 !== n[r] ? n[r] : e[r]),
                      u.jump(d));
              }
            }),
            !l.length)
          )
            return { target: e, transitionEnd: n };
          {
            let i = l.indexOf("height") >= 0 ? window.pageYOffset : null,
              r = rk(e, t, l);
            return (
              s.length &&
                s.forEach(([e, i]) => {
                  t.getValue(e).set(i);
                }),
              t.render(),
              a && null !== i && window.scrollTo({ top: i }),
              { target: r, transitionEnd: n }
            );
          }
        },
        rL = (t, e, i, n) => {
          let r = (function (t, { ...e }, i) {
            let n = t.current;
            if (!(n instanceof Element)) return { target: e, transitionEnd: i };
            for (let r in (i && (i = { ...i }),
            t.values.forEach((t) => {
              let e = t.get();
              if (!B(e)) return;
              let i = rb(e, n);
              i && t.set(i);
            }),
            e)) {
              let t = e[r];
              if (!B(t)) continue;
              let s = rb(t, n);
              s && ((e[r] = s), i || (i = {}), void 0 === i[r] && (i[r] = t));
            }
            return { target: e, transitionEnd: i };
          })(t, e, n);
          return (function (t, e, i, n) {
            return rA(e) ? rR(t, e, i, n) : { target: e, transitionEnd: n };
          })(t, (e = r.target), i, (n = r.transitionEnd));
        },
        rj = { current: null },
        rF = { current: !1 },
        rB = new WeakMap(),
        rO = Object.keys(b),
        rU = rO.length,
        rI = [
          "AnimationStart",
          "AnimationComplete",
          "Update",
          "BeforeLayoutMeasure",
          "LayoutMeasure",
          "LayoutAnimationStart",
          "LayoutAnimationComplete",
        ],
        rN = g.length;
      class r$ {
        constructor(
          {
            parent: t,
            props: e,
            presenceContext: i,
            reducedMotionConfig: n,
            visualState: r,
          },
          s = {},
        ) {
          ((this.current = null),
            (this.children = new Set()),
            (this.isVariantNode = !1),
            (this.isControllingVariants = !1),
            (this.shouldReduceMotion = null),
            (this.values = new Map()),
            (this.features = {}),
            (this.valueSubscriptions = new Map()),
            (this.prevMotionValues = {}),
            (this.events = {}),
            (this.propEventSubscriptions = {}),
            (this.notifyUpdate = () =>
              this.notify("Update", this.latestValues)),
            (this.render = () => {
              this.current &&
                (this.triggerBuild(),
                this.renderInstance(
                  this.current,
                  this.renderState,
                  this.props.style,
                  this.projection,
                ));
            }),
            (this.scheduleRender = () => tD.render(this.render, !1, !0)));
          let { latestValues: o, renderState: a } = r;
          ((this.latestValues = o),
            (this.baseTarget = { ...o }),
            (this.initialValues = e.initial ? { ...o } : {}),
            (this.renderState = a),
            (this.parent = t),
            (this.props = e),
            (this.presenceContext = i),
            (this.depth = t ? t.depth + 1 : 0),
            (this.reducedMotionConfig = n),
            (this.options = s),
            (this.isControllingVariants = v(e)),
            (this.isVariantNode = y(e)),
            this.isVariantNode && (this.variantChildren = new Set()),
            (this.manuallyAnimateOnMount = !!(t && t.current)));
          let { willChange: l, ...u } = this.scrapeMotionValuesFromProps(e, {});
          for (let t in u) {
            let e = u[t];
            void 0 !== o[t] && k(e) && (e.set(o[t], !1), iw(l) && l.add(t));
          }
        }
        scrapeMotionValuesFromProps(t, e) {
          return {};
        }
        mount(t) {
          ((this.current = t),
            rB.set(t, this),
            this.projection &&
              !this.projection.instance &&
              this.projection.mount(t),
            this.parent &&
              this.isVariantNode &&
              !this.isControllingVariants &&
              (this.removeFromVariantTree = this.parent.addVariantChild(this)),
            this.values.forEach((t, e) => this.bindToMotionValue(e, t)),
            rF.current ||
              (function () {
                if (((rF.current = !0), a)) {
                  if (window.matchMedia) {
                    let t = window.matchMedia("(prefers-reduced-motion)"),
                      e = () => (rj.current = t.matches);
                    (t.addListener(e), e());
                  } else rj.current = !1;
                }
              })(),
            (this.shouldReduceMotion =
              "never" !== this.reducedMotionConfig &&
              ("always" === this.reducedMotionConfig || rj.current)),
            this.parent && this.parent.children.add(this),
            this.update(this.props, this.presenceContext));
        }
        unmount() {
          for (let t in (rB.delete(this.current),
          this.projection && this.projection.unmount(),
          tk(this.notifyUpdate),
          tk(this.render),
          this.valueSubscriptions.forEach((t) => t()),
          this.removeFromVariantTree && this.removeFromVariantTree(),
          this.parent && this.parent.children.delete(this),
          this.events))
            this.events[t].clear();
          for (let t in this.features) this.features[t].unmount();
          this.current = null;
        }
        bindToMotionValue(t, e) {
          let i = M.has(t),
            n = e.on("change", (e) => {
              ((this.latestValues[t] = e),
                this.props.onUpdate && tD.update(this.notifyUpdate, !1, !0),
                i &&
                  this.projection &&
                  (this.projection.isTransformDirty = !0));
            }),
            r = e.on("renderRequest", this.scheduleRender);
          this.valueSubscriptions.set(t, () => {
            (n(), r());
          });
        }
        sortNodePosition(t) {
          return this.current &&
            this.sortInstanceNodePosition &&
            this.type === t.type
            ? this.sortInstanceNodePosition(this.current, t.current)
            : 0;
        }
        loadFeatures({ children: t, ...e }, i, n, r) {
          let s, o;
          for (let t = 0; t < rU; t++) {
            let i = rO[t],
              {
                isEnabled: n,
                Feature: r,
                ProjectionNode: a,
                MeasureLayout: l,
              } = b[i];
            (a && (s = a),
              n(e) &&
                (!this.features[i] && r && (this.features[i] = new r(this)),
                l && (o = l)));
          }
          if (
            ("html" === this.type || "svg" === this.type) &&
            !this.projection &&
            s
          ) {
            this.projection = new s(
              this.latestValues,
              this.parent && this.parent.projection,
            );
            let {
              layoutId: t,
              layout: i,
              drag: n,
              dragConstraints: o,
              layoutScroll: a,
              layoutRoot: l,
            } = e;
            this.projection.setOptions({
              layoutId: t,
              layout: i,
              alwaysMeasureLayout: !!n || (o && d(o)),
              visualElement: this,
              scheduleRender: () => this.scheduleRender(),
              animationType: "string" == typeof i ? i : "both",
              initialPromotionConfig: r,
              layoutScroll: a,
              layoutRoot: l,
            });
          }
          return o;
        }
        updateFeatures() {
          for (let t in this.features) {
            let e = this.features[t];
            e.isMounted ? e.update() : (e.mount(), (e.isMounted = !0));
          }
        }
        triggerBuild() {
          this.build(
            this.renderState,
            this.latestValues,
            this.options,
            this.props,
          );
        }
        measureViewportBox() {
          return this.current
            ? this.measureInstanceViewportBox(this.current, this.props)
            : ni();
        }
        getStaticValue(t) {
          return this.latestValues[t];
        }
        setStaticValue(t, e) {
          this.latestValues[t] = e;
        }
        makeTargetAnimatable(t, e = !0) {
          return this.makeTargetAnimatableFromInstance(t, this.props, e);
        }
        update(t, e) {
          ((t.transformTemplate || this.props.transformTemplate) &&
            this.scheduleRender(),
            (this.prevProps = this.props),
            (this.props = t),
            (this.prevPresenceContext = this.presenceContext),
            (this.presenceContext = e));
          for (let e = 0; e < rI.length; e++) {
            let i = rI[e];
            this.propEventSubscriptions[i] &&
              (this.propEventSubscriptions[i](),
              delete this.propEventSubscriptions[i]);
            let n = t["on" + i];
            n && (this.propEventSubscriptions[i] = this.on(i, n));
          }
          ((this.prevMotionValues = (function (t, e, i) {
            let { willChange: n } = e;
            for (let r in e) {
              let s = e[r],
                o = i[r];
              if (k(s)) (t.addValue(r, s), iw(n) && n.add(r));
              else if (k(o))
                (t.addValue(r, ik(s, { owner: t })), iw(n) && n.remove(r));
              else if (o !== s) {
                if (t.hasValue(r)) {
                  let e = t.getValue(r);
                  e.hasAnimated || e.set(s);
                } else {
                  let e = t.getStaticValue(r);
                  t.addValue(r, ik(void 0 !== e ? e : s, { owner: t }));
                }
              }
            }
            for (let n in i) void 0 === e[n] && t.removeValue(n);
            return e;
          })(
            this,
            this.scrapeMotionValuesFromProps(t, this.prevProps),
            this.prevMotionValues,
          )),
            this.handleChildMotionValue && this.handleChildMotionValue());
        }
        getProps() {
          return this.props;
        }
        getVariant(t) {
          return this.props.variants ? this.props.variants[t] : void 0;
        }
        getDefaultTransition() {
          return this.props.transition;
        }
        getTransformPagePoint() {
          return this.props.transformPagePoint;
        }
        getClosestVariantNode() {
          return this.isVariantNode
            ? this
            : this.parent
              ? this.parent.getClosestVariantNode()
              : void 0;
        }
        getVariantContext(t = !1) {
          if (t) return this.parent ? this.parent.getVariantContext() : void 0;
          if (!this.isControllingVariants) {
            let t = (this.parent && this.parent.getVariantContext()) || {};
            return (
              void 0 !== this.props.initial && (t.initial = this.props.initial),
              t
            );
          }
          let e = {};
          for (let t = 0; t < rN; t++) {
            let i = g[t],
              n = this.props[i];
            (p(n) || !1 === n) && (e[i] = n);
          }
          return e;
        }
        addVariantChild(t) {
          let e = this.getClosestVariantNode();
          if (e)
            return (
              e.variantChildren && e.variantChildren.add(t),
              () => e.variantChildren.delete(t)
            );
        }
        addValue(t, e) {
          (e !== this.values.get(t) &&
            (this.removeValue(t), this.bindToMotionValue(t, e)),
            this.values.set(t, e),
            (this.latestValues[t] = e.get()));
        }
        removeValue(t) {
          this.values.delete(t);
          let e = this.valueSubscriptions.get(t);
          (e && (e(), this.valueSubscriptions.delete(t)),
            delete this.latestValues[t],
            this.removeValueFromRenderState(t, this.renderState));
        }
        hasValue(t) {
          return this.values.has(t);
        }
        getValue(t, e) {
          if (this.props.values && this.props.values[t])
            return this.props.values[t];
          let i = this.values.get(t);
          return (
            void 0 === i &&
              void 0 !== e &&
              ((i = ik(e, { owner: this })), this.addValue(t, i)),
            i
          );
        }
        readValue(t) {
          var e;
          return void 0 === this.latestValues[t] && this.current
            ? null !== (e = this.getBaseTargetFromProps(this.props, t)) &&
              void 0 !== e
              ? e
              : this.readValueFromInstance(this.current, t, this.options)
            : this.latestValues[t];
        }
        setBaseTarget(t, e) {
          this.baseTarget[t] = e;
        }
        getBaseTarget(t) {
          var e;
          let { initial: i } = this.props,
            n =
              "string" == typeof i || "object" == typeof i
                ? null === (e = tb(this.props, i)) || void 0 === e
                  ? void 0
                  : e[t]
                : void 0;
          if (i && void 0 !== n) return n;
          let r = this.getBaseTargetFromProps(this.props, t);
          return void 0 === r || k(r)
            ? void 0 !== this.initialValues[t] && void 0 === n
              ? void 0
              : this.baseTarget[t]
            : r;
        }
        on(t, e) {
          return (
            this.events[t] || (this.events[t] = new iE()),
            this.events[t].add(e)
          );
        }
        notify(t, ...e) {
          this.events[t] && this.events[t].notify(...e);
        }
      }
      class rW extends r$ {
        sortInstanceNodePosition(t, e) {
          return 2 & t.compareDocumentPosition(e) ? 1 : -1;
        }
        getBaseTargetFromProps(t, e) {
          return t.style ? t.style[e] : void 0;
        }
        removeValueFromRenderState(t, { vars: e, style: i }) {
          (delete e[t], delete i[t]);
        }
        makeTargetAnimatableFromInstance(
          { transition: t, transitionEnd: e, ...i },
          { transformValues: n },
          r,
        ) {
          let s = (function (t, e, i) {
            let n = {};
            for (let r in t) {
              let t = (function (t, e) {
                if (!e) return;
                let i = e[t] || e.default || e;
                return i.from;
              })(r, e);
              if (void 0 !== t) n[r] = t;
              else {
                let t = i.getValue(r);
                t && (n[r] = t.get());
              }
            }
            return n;
          })(i, t || {}, this);
          if ((n && (e && (e = n(e)), i && (i = n(i)), s && (s = n(s))), r)) {
            !(function (t, e, i) {
              var n, r;
              let s = Object.keys(e).filter((e) => !t.hasValue(e)),
                o = s.length;
              if (o)
                for (let a = 0; a < o; a++) {
                  let o = s[a],
                    l = e[o],
                    u = null;
                  (Array.isArray(l) && (u = l[0]),
                    null === u &&
                      (u =
                        null !==
                          (r =
                            null !== (n = i[o]) && void 0 !== n
                              ? n
                              : t.readValue(o)) && void 0 !== r
                          ? r
                          : e[o]),
                    null != u &&
                      ("string" == typeof u && (iA(u) || ix(u))
                        ? (u = parseFloat(u))
                        : !iB(u) && ez.test(l) && (u = iy(o, l)),
                      t.addValue(o, ik(u, { owner: t })),
                      void 0 === i[o] && (i[o] = u),
                      null !== u && t.setBaseTarget(o, u)));
                }
            })(this, i, s);
            let t = rL(this, i, s, e);
            ((e = t.transitionEnd), (i = t.target));
          }
          return { transition: t, transitionEnd: e, ...i };
        }
      }
      class rH extends rW {
        constructor() {
          (super(...arguments), (this.type = "html"));
        }
        readValueFromInstance(t, e) {
          if (M.has(e)) {
            let t = iv(e);
            return (t && t.default) || 0;
          }
          {
            let i = window.getComputedStyle(t),
              n = (F(e) ? i.getPropertyValue(e) : i[e]) || 0;
            return "string" == typeof n ? n.trim() : n;
          }
        }
        measureInstanceViewportBox(t, { transformPagePoint: e }) {
          return ny(t, e);
        }
        build(t, e, i, n) {
          ti(t, e, i, n.transformTemplate);
        }
        scrapeMotionValuesFromProps(t, e) {
          return tx(t, e);
        }
        handleChildMotionValue() {
          this.childSubscription &&
            (this.childSubscription(), delete this.childSubscription);
          let { children: t } = this.props;
          k(t) &&
            (this.childSubscription = t.on("change", (t) => {
              this.current && (this.current.textContent = `${t}`);
            }));
        }
        renderInstance(t, e, i, n) {
          tg(t, e, i, n);
        }
      }
      class rz extends rW {
        constructor() {
          (super(...arguments), (this.type = "svg"), (this.isSVGTag = !1));
        }
        getBaseTargetFromProps(t, e) {
          return t[e];
        }
        readValueFromInstance(t, e) {
          if (M.has(e)) {
            let t = iv(e);
            return (t && t.default) || 0;
          }
          return ((e = tv.has(e) ? e : h(e)), t.getAttribute(e));
        }
        measureInstanceViewportBox() {
          return ni();
        }
        scrapeMotionValuesFromProps(t, e) {
          return tP(t, e);
        }
        build(t, e, i, n) {
          td(t, e, i, this.isSVGTag, n.transformTemplate);
        }
        renderInstance(t, e, i, n) {
          ty(t, e, i, n);
        }
        mount(t) {
          ((this.isSVGTag = tm(t.tagName)), super.mount(t));
        }
      }
      let rY = (t, e) =>
          V(t)
            ? new rz(e, { enableHardwareAcceleration: !1 })
            : new rH(e, { enableHardwareAcceleration: !0 }),
        rX = {
          animation: { Feature: iH },
          exit: { Feature: iY },
          inView: { Feature: t4 },
          tap: { Feature: t0 },
          focus: { Feature: t_ },
          hover: { Feature: tK },
          pan: { Feature: nS },
          drag: { Feature: nw, ProjectionNode: rx, MeasureLayout: nD },
          layout: { ProjectionNode: rx, MeasureLayout: nD },
        },
        rG = (function (t) {
          function e(e, i = {}) {
            return (function ({
              preloadedFeatures: t,
              createVisualElement: e,
              useRender: i,
              useVisualState: h,
              Component: m,
            }) {
              t &&
                (function (t) {
                  for (let e in t) b[e] = { ...b[e], ...t[e] };
                })(t);
              let f = (0, n.forwardRef)(function (f, g) {
                var y;
                let P;
                let b = {
                    ...(0, n.useContext)(r),
                    ...f,
                    layoutId: (function ({ layoutId: t }) {
                      let e = (0, n.useContext)(T).id;
                      return e && void 0 !== t ? e + "-" + t : t;
                    })(f),
                  },
                  { isStatic: A } = b,
                  S = (function (t) {
                    let { initial: e, animate: i } = (function (t, e) {
                      if (v(t)) {
                        let { initial: e, animate: i } = t;
                        return {
                          initial: !1 === e || p(e) ? e : void 0,
                          animate: p(i) ? i : void 0,
                        };
                      }
                      return !1 !== t.inherit ? e : {};
                    })(t, (0, n.useContext)(s));
                    return (0, n.useMemo)(
                      () => ({ initial: e, animate: i }),
                      [x(e), x(i)],
                    );
                  })(f),
                  V = h(f, A);
                if (!A && a) {
                  S.visualElement = (function (t, e, i, a) {
                    let { visualElement: h } = (0, n.useContext)(s),
                      d = (0, n.useContext)(u),
                      p = (0, n.useContext)(o),
                      m = (0, n.useContext)(r).reducedMotion,
                      f = (0, n.useRef)();
                    ((a = a || d.renderer),
                      !f.current &&
                        a &&
                        (f.current = a(t, {
                          visualState: e,
                          parent: h,
                          props: i,
                          presenceContext: p,
                          blockInitialAnimation: !!p && !1 === p.initial,
                          reducedMotionConfig: m,
                        })));
                    let g = f.current;
                    (0, n.useInsertionEffect)(() => {
                      g && g.update(i, p);
                    });
                    let v = (0, n.useRef)(!!(i[c] && !window.HandoffComplete));
                    return (
                      l(() => {
                        g &&
                          (g.render(),
                          v.current &&
                            g.animationState &&
                            g.animationState.animateChanges());
                      }),
                      (0, n.useEffect)(() => {
                        g &&
                          (g.updateFeatures(),
                          !v.current &&
                            g.animationState &&
                            g.animationState.animateChanges(),
                          v.current &&
                            ((v.current = !1), (window.HandoffComplete = !0)));
                      }),
                      g
                    );
                  })(m, V, b, e);
                  let i = (0, n.useContext)(w),
                    a = (0, n.useContext)(u).strict;
                  S.visualElement &&
                    (P = S.visualElement.loadFeatures(b, a, t, i));
                }
                return n.createElement(
                  s.Provider,
                  { value: S },
                  P && S.visualElement
                    ? n.createElement(P, {
                        visualElement: S.visualElement,
                        ...b,
                      })
                    : null,
                  i(
                    m,
                    f,
                    ((y = S.visualElement),
                    (0, n.useCallback)(
                      (t) => {
                        (t && V.mount && V.mount(t),
                          y && (t ? y.mount(t) : y.unmount()),
                          g &&
                            ("function" == typeof g
                              ? g(t)
                              : d(g) && (g.current = t)));
                      },
                      [y],
                    )),
                    V,
                    A,
                    S.visualElement,
                  ),
                );
              });
              return ((f[A] = m), f);
            })(t(e, i));
          }
          if ("undefined" == typeof Proxy) return e;
          let i = new Map();
          return new Proxy(e, {
            get: (t, n) => (i.has(n) || i.set(n, e(n)), i.get(n)),
          });
        })((t, e) =>
          (function (t, { forwardMotionProps: e = !1 }, i, r) {
            let s = V(t) ? tj : tF;
            return {
              ...s,
              preloadedFeatures: i,
              useRender: (function (t = !1) {
                return (e, i, r, { latestValues: s }, o) => {
                  let a = V(e) ? tf : ts,
                    l = a(i, s, o, e),
                    u = (function (t, e, i) {
                      let n = {};
                      for (let r in t)
                        ("values" !== r || "object" != typeof t.values) &&
                          (tl(r) ||
                            (!0 === i && ta(r)) ||
                            (!e && !ta(r)) ||
                            (t.draggable && r.startsWith("onDrag"))) &&
                          (n[r] = t[r]);
                      return n;
                    })(i, "string" == typeof e, t),
                    h = { ...u, ...l, ref: r },
                    { children: c } = i,
                    d = (0, n.useMemo)(() => (k(c) ? c.get() : c), [c]);
                  return (0, n.createElement)(e, { ...h, children: d });
                };
              })(e),
              createVisualElement: r,
              Component: t,
            };
          })(t, e, rX, rY),
        );
    },
  }));

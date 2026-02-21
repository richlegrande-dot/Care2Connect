(() => {
  var e = {};
  ((e.id = 635),
    (e.ids = [635]),
    (e.modules = {
      55403: (e) => {
        "use strict";
        e.exports = require("next/dist/client/components/request-async-storage.external");
      },
      94749: (e) => {
        "use strict";
        e.exports = require("next/dist/client/components/static-generation-async-storage.external");
      },
      20399: (e) => {
        "use strict";
        e.exports = require("next/dist/compiled/next-server/app-page.runtime.prod.js");
      },
      25528: (e) => {
        "use strict";
        e.exports = require("next/dist\\client\\components\\action-async-storage.external.js");
      },
      91877: (e) => {
        "use strict";
        e.exports = require("next/dist\\client\\components\\request-async-storage.external.js");
      },
      25319: (e) => {
        "use strict";
        e.exports = require("next/dist\\client\\components\\static-generation-async-storage.external.js");
      },
      47169: (e, t, r) => {
        "use strict";
        (r.r(t),
          r.d(t, {
            GlobalError: () => o.a,
            __next_app__: () => f,
            originalPathname: () => d,
            pages: () => u,
            routeModule: () => h,
            tree: () => c,
          }));
        var n = r(36577),
          i = r(55533),
          a = r(40443),
          o = r.n(a),
          l = r(53320),
          s = {};
        for (let e in l)
          0 >
            [
              "default",
              "tree",
              "pages",
              "GlobalError",
              "originalPathname",
              "__next_app__",
              "routeModule",
            ].indexOf(e) && (s[e] = () => l[e]);
        r.d(t, s);
        let c = [
            "",
            {
              children: [
                "system",
                {
                  children: [
                    "__PAGE__",
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(r.bind(r, 53738)),
                        "C:\\Users\\richl\\Care2system\\frontend\\app\\system\\page.tsx",
                      ],
                    },
                  ],
                },
                {},
              ],
            },
            {
              layout: [
                () => Promise.resolve().then(r.bind(r, 18685)),
                "C:\\Users\\richl\\Care2system\\frontend\\app\\layout.tsx",
              ],
              "not-found": [
                () => Promise.resolve().then(r.t.bind(r, 31459, 23)),
                "next/dist/client/components/not-found-error",
              ],
            },
          ],
          u = [
            "C:\\Users\\richl\\Care2system\\frontend\\app\\system\\page.tsx",
          ],
          d = "/system/page",
          f = { require: r, loadChunk: () => Promise.resolve() },
          h = new n.AppPageRouteModule({
            definition: {
              kind: i.x.APP_PAGE,
              page: "/system/page",
              pathname: "/system",
              bundlePath: "",
              filename: "",
              appPaths: [],
            },
            userland: { loaderTree: c },
          });
      },
      20717: (e, t, r) => {
        (Promise.resolve().then(r.bind(r, 56253)),
          Promise.resolve().then(r.bind(r, 9690)),
          Promise.resolve().then(r.bind(r, 33999)));
      },
      183: (e, t, r) => {
        Promise.resolve().then(r.bind(r, 32639));
      },
      19191: (e, t, r) => {
        (Promise.resolve().then(r.t.bind(r, 28913, 23)),
          Promise.resolve().then(r.t.bind(r, 50409, 23)),
          Promise.resolve().then(r.t.bind(r, 75054, 23)),
          Promise.resolve().then(r.t.bind(r, 34892, 23)),
          Promise.resolve().then(r.t.bind(r, 80356, 23)),
          Promise.resolve().then(r.t.bind(r, 73559, 23)));
      },
      56253: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { Providers: () => l }));
        var n = r(73658),
          i = r(58758),
          a = r(60459),
          o = r(55459);
        function l({ children: e }) {
          let [t] = (0, o.useState)(
            () =>
              new i.S({
                defaultOptions: { queries: { staleTime: 3e5, gcTime: 6e5 } },
              }),
          );
          return n.jsx(a.aH, { client: t, children: e });
        }
      },
      32639: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { default: () => wd }));
        var n,
          i,
          a = {};
        (r.r(a),
          r.d(a, {
            scaleBand: () => iW,
            scaleDiverging: () =>
              function e() {
                var t = a6(sh()(aU));
                return (
                  (t.copy = function () {
                    return su(t, e());
                  }),
                  iR.apply(t, arguments)
                );
              },
            scaleDivergingLog: () =>
              function e() {
                var t = or(sh()).domain([0.1, 1, 10]);
                return (
                  (t.copy = function () {
                    return su(t, e()).base(t.base());
                  }),
                  iR.apply(t, arguments)
                );
              },
            scaleDivergingPow: () => sp,
            scaleDivergingSqrt: () => sy,
            scaleDivergingSymlog: () =>
              function e() {
                var t = oa(sh());
                return (
                  (t.copy = function () {
                    return su(t, e()).constant(t.constant());
                  }),
                  iR.apply(t, arguments)
                );
              },
            scaleIdentity: () =>
              function e(t) {
                var r;
                function n(e) {
                  return null == e || isNaN((e = +e)) ? r : e;
                }
                return (
                  (n.invert = n),
                  (n.domain = n.range =
                    function (e) {
                      return arguments.length
                        ? ((t = Array.from(e, aR)), n)
                        : t.slice();
                    }),
                  (n.unknown = function (e) {
                    return arguments.length ? ((r = e), n) : r;
                  }),
                  (n.copy = function () {
                    return e(t).unknown(r);
                  }),
                  (t = arguments.length ? Array.from(t, aR) : [0, 1]),
                  a6(n)
                );
              },
            scaleImplicit: () => iB,
            scaleLinear: () =>
              function e() {
                var t = aq();
                return (
                  (t.copy = function () {
                    return aW(t, e());
                  }),
                  iL.apply(t, arguments),
                  a6(t)
                );
              },
            scaleLog: () =>
              function e() {
                let t = or(aH()).domain([1, 10]);
                return (
                  (t.copy = () => aW(t, e()).base(t.base())),
                  iL.apply(t, arguments),
                  t
                );
              },
            scaleOrdinal: () => iK,
            scalePoint: () => iH,
            scalePow: () => ou,
            scaleQuantile: () =>
              function e() {
                var t,
                  r = [],
                  n = [],
                  i = [];
                function a() {
                  var e = 0,
                    t = Math.max(1, n.length);
                  for (i = Array(t - 1); ++e < t; )
                    i[e - 1] = (function (e, t, r = i3) {
                      if (!(!(n = e.length) || isNaN((t = +t)))) {
                        if (t <= 0 || n < 2) return +r(e[0], 0, e);
                        if (t >= 1) return +r(e[n - 1], n - 1, e);
                        var n,
                          i = (n - 1) * t,
                          a = Math.floor(i),
                          o = +r(e[a], a, e);
                        return o + (+r(e[a + 1], a + 1, e) - o) * (i - a);
                      }
                    })(r, e / t);
                  return o;
                }
                function o(e) {
                  return null == e || isNaN((e = +e)) ? t : n[i5(i, e)];
                }
                return (
                  (o.invertExtent = function (e) {
                    var t = n.indexOf(e);
                    return t < 0
                      ? [NaN, NaN]
                      : [
                          t > 0 ? i[t - 1] : r[0],
                          t < i.length ? i[t] : r[r.length - 1],
                        ];
                  }),
                  (o.domain = function (e) {
                    if (!arguments.length) return r.slice();
                    for (let t of ((r = []), e))
                      null == t || isNaN((t = +t)) || r.push(t);
                    return (r.sort(iJ), a());
                  }),
                  (o.range = function (e) {
                    return arguments.length
                      ? ((n = Array.from(e)), a())
                      : n.slice();
                  }),
                  (o.unknown = function (e) {
                    return arguments.length ? ((t = e), o) : t;
                  }),
                  (o.quantiles = function () {
                    return i.slice();
                  }),
                  (o.copy = function () {
                    return e().domain(r).range(n).unknown(t);
                  }),
                  iL.apply(o, arguments)
                );
              },
            scaleQuantize: () =>
              function e() {
                var t,
                  r = 0,
                  n = 1,
                  i = 1,
                  a = [0.5],
                  o = [0, 1];
                function l(e) {
                  return null != e && e <= e ? o[i5(a, e, 0, i)] : t;
                }
                function s() {
                  var e = -1;
                  for (a = Array(i); ++e < i; )
                    a[e] = ((e + 1) * n - (e - i) * r) / (i + 1);
                  return l;
                }
                return (
                  (l.domain = function (e) {
                    return arguments.length
                      ? (([r, n] = e), (r = +r), (n = +n), s())
                      : [r, n];
                  }),
                  (l.range = function (e) {
                    return arguments.length
                      ? ((i = (o = Array.from(e)).length - 1), s())
                      : o.slice();
                  }),
                  (l.invertExtent = function (e) {
                    var t = o.indexOf(e);
                    return t < 0
                      ? [NaN, NaN]
                      : t < 1
                        ? [r, a[0]]
                        : t >= i
                          ? [a[i - 1], n]
                          : [a[t - 1], a[t]];
                  }),
                  (l.unknown = function (e) {
                    return (arguments.length && (t = e), l);
                  }),
                  (l.thresholds = function () {
                    return a.slice();
                  }),
                  (l.copy = function () {
                    return e().domain([r, n]).range(o).unknown(t);
                  }),
                  iL.apply(a6(l), arguments)
                );
              },
            scaleRadial: () =>
              function e() {
                var t,
                  r = aq(),
                  n = [0, 1],
                  i = !1;
                function a(e) {
                  var n,
                    a = Math.sign((n = r(e))) * Math.sqrt(Math.abs(n));
                  return isNaN(a) ? t : i ? Math.round(a) : a;
                }
                return (
                  (a.invert = function (e) {
                    return r.invert(of(e));
                  }),
                  (a.domain = function (e) {
                    return arguments.length ? (r.domain(e), a) : r.domain();
                  }),
                  (a.range = function (e) {
                    return arguments.length
                      ? (r.range((n = Array.from(e, aR)).map(of)), a)
                      : n.slice();
                  }),
                  (a.rangeRound = function (e) {
                    return a.range(e).round(!0);
                  }),
                  (a.round = function (e) {
                    return arguments.length ? ((i = !!e), a) : i;
                  }),
                  (a.clamp = function (e) {
                    return arguments.length ? (r.clamp(e), a) : r.clamp();
                  }),
                  (a.unknown = function (e) {
                    return arguments.length ? ((t = e), a) : t;
                  }),
                  (a.copy = function () {
                    return e(r.domain(), n)
                      .round(i)
                      .clamp(r.clamp())
                      .unknown(t);
                  }),
                  iL.apply(a, arguments),
                  a6(a)
                );
              },
            scaleSequential: () =>
              function e() {
                var t = a6(sc()(aU));
                return (
                  (t.copy = function () {
                    return su(t, e());
                  }),
                  iR.apply(t, arguments)
                );
              },
            scaleSequentialLog: () =>
              function e() {
                var t = or(sc()).domain([1, 10]);
                return (
                  (t.copy = function () {
                    return su(t, e()).base(t.base());
                  }),
                  iR.apply(t, arguments)
                );
              },
            scaleSequentialPow: () => sd,
            scaleSequentialQuantile: () =>
              function e() {
                var t = [],
                  r = aU;
                function n(e) {
                  if (null != e && !isNaN((e = +e)))
                    return r((i5(t, e, 1) - 1) / (t.length - 1));
                }
                return (
                  (n.domain = function (e) {
                    if (!arguments.length) return t.slice();
                    for (let r of ((t = []), e))
                      null == r || isNaN((r = +r)) || t.push(r);
                    return (t.sort(iJ), n);
                  }),
                  (n.interpolator = function (e) {
                    return arguments.length ? ((r = e), n) : r;
                  }),
                  (n.range = function () {
                    return t.map((e, n) => r(n / (t.length - 1)));
                  }),
                  (n.quantiles = function (e) {
                    return Array.from({ length: e + 1 }, (r, n) =>
                      (function (e, t, r) {
                        if (
                          !(
                            !(n = (e = Float64Array.from(
                              (function* (e, t) {
                                if (void 0 === t)
                                  for (let t of e)
                                    null != t && (t = +t) >= t && (yield t);
                                else {
                                  let r = -1;
                                  for (let n of e)
                                    null != (n = t(n, ++r, e)) &&
                                      (n = +n) >= n &&
                                      (yield n);
                                }
                              })(e, void 0),
                            )).length) || isNaN((t = +t))
                          )
                        ) {
                          if (t <= 0 || n < 2) return op(e);
                          if (t >= 1) return oh(e);
                          var n,
                            i = (n - 1) * t,
                            a = Math.floor(i),
                            o = oh(
                              (function e(t, r, n = 0, i = 1 / 0, a) {
                                if (
                                  ((r = Math.floor(r)),
                                  (n = Math.floor(Math.max(0, n))),
                                  (i = Math.floor(Math.min(t.length - 1, i))),
                                  !(n <= r && r <= i))
                                )
                                  return t;
                                for (
                                  a =
                                    void 0 === a
                                      ? oy
                                      : (function (e = iJ) {
                                          if (e === iJ) return oy;
                                          if ("function" != typeof e)
                                            throw TypeError(
                                              "compare is not a function",
                                            );
                                          return (t, r) => {
                                            let n = e(t, r);
                                            return n || 0 === n
                                              ? n
                                              : (0 === e(r, r)) -
                                                  (0 === e(t, t));
                                          };
                                        })(a);
                                  i > n;
                                ) {
                                  if (i - n > 600) {
                                    let o = i - n + 1,
                                      l = r - n + 1,
                                      s = Math.log(o),
                                      c = 0.5 * Math.exp((2 * s) / 3),
                                      u =
                                        0.5 *
                                        Math.sqrt((s * c * (o - c)) / o) *
                                        (l - o / 2 < 0 ? -1 : 1),
                                      d = Math.max(
                                        n,
                                        Math.floor(r - (l * c) / o + u),
                                      ),
                                      f = Math.min(
                                        i,
                                        Math.floor(r + ((o - l) * c) / o + u),
                                      );
                                    e(t, r, d, f, a);
                                  }
                                  let o = t[r],
                                    l = n,
                                    s = i;
                                  for (
                                    om(t, n, r), a(t[i], o) > 0 && om(t, n, i);
                                    l < s;
                                  ) {
                                    for (
                                      om(t, l, s), ++l, --s;
                                      0 > a(t[l], o);
                                    )
                                      ++l;
                                    for (; a(t[s], o) > 0; ) --s;
                                  }
                                  (0 === a(t[n], o)
                                    ? om(t, n, s)
                                    : om(t, ++s, i),
                                    s <= r && (n = s + 1),
                                    r <= s && (i = s - 1));
                                }
                                return t;
                              })(e, a).subarray(0, a + 1),
                            );
                          return o + (op(e.subarray(a + 1)) - o) * (i - a);
                        }
                      })(t, n / e),
                    );
                  }),
                  (n.copy = function () {
                    return e(r).domain(t);
                  }),
                  iR.apply(n, arguments)
                );
              },
            scaleSequentialSqrt: () => sf,
            scaleSequentialSymlog: () =>
              function e() {
                var t = oa(sc());
                return (
                  (t.copy = function () {
                    return su(t, e()).constant(t.constant());
                  }),
                  iR.apply(t, arguments)
                );
              },
            scaleSqrt: () => od,
            scaleSymlog: () =>
              function e() {
                var t = oa(aH());
                return (
                  (t.copy = function () {
                    return aW(t, e()).constant(t.constant());
                  }),
                  iL.apply(t, arguments)
                );
              },
            scaleThreshold: () =>
              function e() {
                var t,
                  r = [0.5],
                  n = [0, 1],
                  i = 1;
                function a(e) {
                  return null != e && e <= e ? n[i5(r, e, 0, i)] : t;
                }
                return (
                  (a.domain = function (e) {
                    return arguments.length
                      ? ((i = Math.min(
                          (r = Array.from(e)).length,
                          n.length - 1,
                        )),
                        a)
                      : r.slice();
                  }),
                  (a.range = function (e) {
                    return arguments.length
                      ? ((n = Array.from(e)),
                        (i = Math.min(r.length, n.length - 1)),
                        a)
                      : n.slice();
                  }),
                  (a.invertExtent = function (e) {
                    var t = n.indexOf(e);
                    return [r[t - 1], r[t]];
                  }),
                  (a.unknown = function (e) {
                    return arguments.length ? ((t = e), a) : t;
                  }),
                  (a.copy = function () {
                    return e().domain(r).range(n).unknown(t);
                  }),
                  iL.apply(a, arguments)
                );
              },
            scaleTime: () => sl,
            scaleUtc: () => ss,
            tickFormat: () => a3,
          }));
        var o = r(73658),
          l = r(55459),
          s = r(32241),
          c = r(20082);
        function u({ onAuthenticated: e, onCancel: t }) {
          let [r, n] = (0, l.useState)(""),
            [i, a] = (0, l.useState)(""),
            [s, u] = (0, l.useState)(0),
            [d, f] = (0, l.useState)(!1),
            [h, p] = (0, l.useState)(!1),
            y = async (t) => {
              if ((t.preventDefault(), d)) {
                a("Too many failed attempts. Please wait 5 minutes.");
                return;
              }
              if (!r) {
                a("Password required");
                return;
              }
              (p(!0), a(""));
              try {
                let t = "https://api.care2connects.org".replace(/\/api$/, ""),
                  n = await fetch(`${t}/admin/auth`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: r }),
                  });
                if (!n.ok) {
                  if (503 === n.status)
                    a("API unavailable. Server may be starting up.");
                  else if (404 === n.status)
                    a("API endpoint not found. Check server configuration.");
                  else {
                    let e = s + 1;
                    (u(e),
                      e >= 5
                        ? (f(!0),
                          a("Too many failed attempts. Locked for 5 minutes."),
                          setTimeout(() => {
                            (f(!1), u(0));
                          }, 3e5))
                        : a(`Invalid password (${e}/5 attempts)`));
                  }
                  return;
                }
                let i = await n.json();
                if (i.ok && i.token)
                  (sessionStorage.setItem("system-admin-token", i.token),
                    sessionStorage.setItem(
                      "system-admin-expires",
                      String(Date.now() + 1e3 * i.expiresIn),
                    ),
                    e(i.token));
                else {
                  let e = s + 1;
                  (u(e),
                    e >= 5
                      ? (f(!0),
                        a("Too many failed attempts. Locked for 5 minutes."),
                        setTimeout(() => {
                          (f(!1), u(0));
                        }, 3e5))
                      : a(`Invalid password (${e}/5 attempts)`));
                }
              } catch (e) {
                (console.error("Auth error:", e),
                  a(
                    `Connection failed: ${e instanceof Error ? e.message : "Network error"}. Check server connection.`,
                  ));
              } finally {
                p(!1);
              }
            };
          return o.jsx("div", {
            className:
              "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50",
            children: (0, o.jsxs)("div", {
              className:
                "bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4",
              children: [
                (0, o.jsxs)("div", {
                  className: "flex justify-between items-center mb-6",
                  children: [
                    o.jsx("h2", {
                      className: "text-2xl font-bold text-gray-900",
                      children: "System Access",
                    }),
                    o.jsx("button", {
                      onClick: t,
                      className: "text-gray-400 hover:text-gray-600 transition",
                      "aria-label": "Close",
                      children: o.jsx(c.Z, { size: 24 }),
                    }),
                  ],
                }),
                o.jsx("p", {
                  className: "text-gray-600 mb-6",
                  children:
                    "This area is password-protected. Enter the system password to continue.",
                }),
                (0, o.jsxs)("form", {
                  onSubmit: y,
                  children: [
                    (0, o.jsxs)("div", {
                      className: "mb-4",
                      children: [
                        o.jsx("label", {
                          htmlFor: "password",
                          className:
                            "block text-sm font-medium text-gray-700 mb-2",
                          children: "Password",
                        }),
                        o.jsx("input", {
                          type: "password",
                          id: "password",
                          value: r,
                          onChange: (e) => n(e.target.value),
                          disabled: d || h,
                          className:
                            "w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed",
                          placeholder: "Enter password",
                          autoFocus: !0,
                        }),
                      ],
                    }),
                    i &&
                      o.jsx("div", {
                        className:
                          "mb-4 p-3 bg-red-50 border border-red-200 rounded-md",
                        children: o.jsx("p", {
                          className: "text-sm text-red-700",
                          children: i,
                        }),
                      }),
                    (0, o.jsxs)("div", {
                      className: "flex gap-3",
                      children: [
                        o.jsx("button", {
                          type: "submit",
                          disabled: d || h,
                          className:
                            "flex-1 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition",
                          children: h ? "Authenticating..." : "Access System",
                        }),
                        o.jsx("button", {
                          type: "button",
                          onClick: t,
                          disabled: h,
                          className:
                            "px-6 py-3 border border-gray-300 rounded-md font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition",
                          children: "Cancel",
                        }),
                      ],
                    }),
                  ],
                }),
                o.jsx("p", {
                  className: "mt-4 text-xs text-gray-500 text-center",
                  children: "Session expires after 30 minutes of inactivity",
                }),
              ],
            }),
          });
        }
        function d() {
          for (var e, t, r = 0, n = "", i = arguments.length; r < i; r++)
            (e = arguments[r]) &&
              (t = (function e(t) {
                var r,
                  n,
                  i = "";
                if ("string" == typeof t || "number" == typeof t) i += t;
                else if ("object" == typeof t) {
                  if (Array.isArray(t)) {
                    var a = t.length;
                    for (r = 0; r < a; r++)
                      t[r] && (n = e(t[r])) && (i && (i += " "), (i += n));
                  } else for (n in t) t[n] && (i && (i += " "), (i += n));
                }
                return i;
              })(e)) &&
              (n && (n += " "), (n += t));
          return n;
        }
        var f = r(12167),
          h = r.n(f),
          p = r(63596),
          y = r.n(p),
          m = (e) => (0 === e ? 0 : e > 0 ? 1 : -1),
          v = (e) => "number" == typeof e && e != +e,
          g = (e) => "string" == typeof e && e.indexOf("%") === e.length - 1,
          b = (e) => ("number" == typeof e || e instanceof Number) && !v(e),
          x = (e) => b(e) || "string" == typeof e,
          w = 0,
          j = (e) => {
            var t = ++w;
            return "".concat(e || "").concat(t);
          },
          O = function (e, t) {
            var r,
              n =
                arguments.length > 2 && void 0 !== arguments[2]
                  ? arguments[2]
                  : 0,
              i =
                arguments.length > 3 && void 0 !== arguments[3] && arguments[3];
            if (!b(e) && "string" != typeof e) return n;
            if (g(e)) {
              if (null == t) return n;
              var a = e.indexOf("%");
              r = (t * parseFloat(e.slice(0, a))) / 100;
            } else r = +e;
            return (v(r) && (r = n), i && null != t && r > t && (r = t), r);
          },
          P = (e) => {
            if (!Array.isArray(e)) return !1;
            for (var t = e.length, r = {}, n = 0; n < t; n++) {
              if (r[e[n]]) return !0;
              r[e[n]] = !0;
            }
            return !1;
          };
        function S(e, t, r) {
          return b(e) && b(t) ? e + r * (t - e) : t;
        }
        function k(e, t, r) {
          if (e && e.length)
            return e.find(
              (e) => e && ("function" == typeof t ? t(e) : y()(e, t)) === r,
            );
        }
        var N = (e) => null == e,
          E = (e) =>
            N(e) ? e : "".concat(e.charAt(0).toUpperCase()).concat(e.slice(1));
        function _(e) {
          return null != e;
        }
        function A() {}
        var M = function (e, t) {
            for (
              var r = arguments.length, n = Array(r > 2 ? r - 2 : 0), i = 2;
              i < r;
              i++
            )
              n[i - 2] = arguments[i];
            if (
              "undefined" != typeof console &&
              console.warn &&
              (void 0 === t &&
                console.warn("LogUtils requires an error message argument"),
              !e)
            ) {
              if (void 0 === t)
                console.warn(
                  "Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.",
                );
              else {
                var a = 0;
                console.warn(t.replace(/%s/g, () => n[a++]));
              }
            }
          },
          C = (e, t, r) => {
            var {
                width: n = "100%",
                height: i = "100%",
                aspect: a,
                maxHeight: o,
              } = r,
              l = g(n) ? e : Number(n),
              s = g(i) ? t : Number(i);
            return (
              a &&
                a > 0 &&
                (l ? (s = l / a) : s && (l = s * a),
                o && null != s && s > o && (s = o)),
              { calculatedWidth: l, calculatedHeight: s }
            );
          },
          T = { width: 0, height: 0, overflow: "visible" },
          D = { width: 0, overflowX: "visible" },
          I = { height: 0, overflowY: "visible" },
          z = {},
          L = (e) => {
            var { width: t, height: r } = e,
              n = g(t),
              i = g(r);
            return n && i ? T : n ? D : i ? I : z;
          };
        function R(e) {
          return Number.isFinite(e);
        }
        function $(e) {
          return "number" == typeof e && e > 0 && Number.isFinite(e);
        }
        function U() {
          return (U = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function F(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function B(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? F(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : F(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var K = (0, l.createContext)({ width: -1, height: -1 });
        function W(e) {
          var { children: t, width: r, height: n } = e,
            i = (0, l.useMemo)(() => ({ width: r, height: n }), [r, n]);
          return $(i.width) && $(i.height)
            ? l.createElement(K.Provider, { value: i }, t)
            : null;
        }
        var H = () => (0, l.useContext)(K),
          q = (0, l.forwardRef)((e, t) => {
            var {
                aspect: r,
                initialDimension: n = { width: -1, height: -1 },
                width: i,
                height: a,
                minWidth: o = 0,
                minHeight: s,
                maxHeight: c,
                children: u,
                debounce: f = 0,
                id: p,
                className: y,
                onResize: m,
                style: v = {},
              } = e,
              g = (0, l.useRef)(null),
              b = (0, l.useRef)();
            ((b.current = m), (0, l.useImperativeHandle)(t, () => g.current));
            var [x, w] = (0, l.useState)({
                containerWidth: n.width,
                containerHeight: n.height,
              }),
              j = (0, l.useCallback)((e, t) => {
                w((r) => {
                  var n = Math.round(e),
                    i = Math.round(t);
                  return r.containerWidth === n && r.containerHeight === i
                    ? r
                    : { containerWidth: n, containerHeight: i };
                });
              }, []);
            (0, l.useEffect)(() => {
              if (null == g.current || "undefined" == typeof ResizeObserver)
                return A;
              var e = (e) => {
                var t,
                  { width: r, height: n } = e[0].contentRect;
                (j(r, n),
                  null === (t = b.current) || void 0 === t || t.call(b, r, n));
              };
              f > 0 && (e = h()(e, f, { trailing: !0, leading: !1 }));
              var t = new ResizeObserver(e),
                { width: r, height: n } = g.current.getBoundingClientRect();
              return (
                j(r, n),
                t.observe(g.current),
                () => {
                  t.disconnect();
                }
              );
            }, [j, f]);
            var { containerWidth: O, containerHeight: P } = x;
            M(!r || r > 0, "The aspect(%s) must be greater than zero.", r);
            var { calculatedWidth: S, calculatedHeight: k } = C(O, P, {
              width: i,
              height: a,
              aspect: r,
              maxHeight: c,
            });
            return (
              M(
                (null != S && S > 0) || (null != k && k > 0),
                "The width(%s) and height(%s) of chart should be greater than 0,\n       please check the style of container, or the props width(%s) and height(%s),\n       or add a minWidth(%s) or minHeight(%s) or use aspect(%s) to control the\n       height and width.",
                S,
                k,
                i,
                a,
                o,
                s,
                r,
              ),
              l.createElement(
                "div",
                {
                  id: p ? "".concat(p) : void 0,
                  className: d("recharts-responsive-container", y),
                  style: B(
                    B({}, v),
                    {},
                    {
                      width: i,
                      height: a,
                      minWidth: o,
                      minHeight: s,
                      maxHeight: c,
                    },
                  ),
                  ref: g,
                },
                l.createElement(
                  "div",
                  { style: L({ width: i, height: a }) },
                  l.createElement(W, { width: S, height: k }, u),
                ),
              )
            );
          }),
          V = (0, l.forwardRef)((e, t) => {
            var r = H();
            if ($(r.width) && $(r.height)) return e.children;
            var { width: n, height: i } = (function (e) {
                var { width: t, height: r, aspect: n } = e,
                  i = t,
                  a = r;
                return (
                  void 0 === i && void 0 === a
                    ? ((i = "100%"), (a = "100%"))
                    : void 0 === i
                      ? (i = n && n > 0 ? void 0 : "100%")
                      : void 0 === a && (a = n && n > 0 ? void 0 : "100%"),
                  { width: i, height: a }
                );
              })({ width: e.width, height: e.height, aspect: e.aspect }),
              { calculatedWidth: a, calculatedHeight: o } = C(void 0, void 0, {
                width: n,
                height: i,
                aspect: e.aspect,
                maxHeight: e.maxHeight,
              });
            return b(a) && b(o)
              ? l.createElement(W, { width: a, height: o }, e.children)
              : l.createElement(q, U({}, e, { width: n, height: i, ref: t }));
          }),
          Z = Symbol.for("immer-nothing"),
          Y = Symbol.for("immer-draftable"),
          G = Symbol.for("immer-state");
        function X(e, ...t) {
          throw Error(
            `[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`,
          );
        }
        var Q = Object,
          J = Q.getPrototypeOf,
          ee = "constructor",
          et = "prototype",
          er = "configurable",
          en = "enumerable",
          ei = "writable",
          ea = "value",
          eo = (e) => !!e && !!e[G];
        function el(e) {
          return (
            !!e && (eu(e) || em(e) || !!e[Y] || !!e[ee]?.[Y] || ev(e) || eg(e))
          );
        }
        var es = Q[et][ee].toString(),
          ec = new WeakMap();
        function eu(e) {
          if (!e || !eb(e)) return !1;
          let t = J(e);
          if (null === t || t === Q[et]) return !0;
          let r = Q.hasOwnProperty.call(t, ee) && t[ee];
          if (r === Object) return !0;
          if (!ex(r)) return !1;
          let n = ec.get(r);
          return (
            void 0 === n && ((n = Function.toString.call(r)), ec.set(r, n)),
            n === es
          );
        }
        function ed(e, t, r = !0) {
          if (0 === ef(e)) {
            let n = r ? Reflect.ownKeys(e) : Q.keys(e);
            n.forEach((r) => {
              t(r, e[r], e);
            });
          } else e.forEach((r, n) => t(n, r, e));
        }
        function ef(e) {
          let t = e[G];
          return t ? t.type_ : em(e) ? 1 : ev(e) ? 2 : eg(e) ? 3 : 0;
        }
        var eh = (e, t, r = ef(e)) =>
            2 === r ? e.has(t) : Q[et].hasOwnProperty.call(e, t),
          ep = (e, t, r = ef(e)) => (2 === r ? e.get(t) : e[t]),
          ey = (e, t, r, n = ef(e)) => {
            2 === n ? e.set(t, r) : 3 === n ? e.add(r) : (e[t] = r);
          },
          em = Array.isArray,
          ev = (e) => e instanceof Map,
          eg = (e) => e instanceof Set,
          eb = (e) => "object" == typeof e,
          ex = (e) => "function" == typeof e,
          ew = (e) => "boolean" == typeof e,
          ej = (e) => e.copy_ || e.base_,
          eO = (e) => (e.modified_ ? e.copy_ : e.base_);
        function eP(e, t) {
          if (ev(e)) return new Map(e);
          if (eg(e)) return new Set(e);
          if (em(e)) return Array[et].slice.call(e);
          let r = eu(e);
          if (!0 !== t && ("class_only" !== t || r)) {
            let t = J(e);
            if (null !== t && r) return { ...e };
            let n = Q.create(t);
            return Q.assign(n, e);
          }
          {
            let t = Q.getOwnPropertyDescriptors(e);
            delete t[G];
            let r = Reflect.ownKeys(t);
            for (let n = 0; n < r.length; n++) {
              let i = r[n],
                a = t[i];
              (!1 === a[ei] && ((a[ei] = !0), (a[er] = !0)),
                (a.get || a.set) &&
                  (t[i] = { [er]: !0, [ei]: !0, [en]: a[en], [ea]: e[i] }));
            }
            return Q.create(J(e), t);
          }
        }
        function eS(e, t = !1) {
          return (
            eN(e) ||
              eo(e) ||
              !el(e) ||
              (ef(e) > 1 &&
                Q.defineProperties(e, {
                  set: ek,
                  add: ek,
                  clear: ek,
                  delete: ek,
                }),
              Q.freeze(e),
              t &&
                ed(
                  e,
                  (e, t) => {
                    eS(t, !0);
                  },
                  !1,
                )),
            e
          );
        }
        var ek = {
          [ea]: function () {
            X(2);
          },
        };
        function eN(e) {
          return !(null !== e && eb(e)) || Q.isFrozen(e);
        }
        var eE = "MapSet",
          e_ = "Patches",
          eA = {};
        function eM(e) {
          let t = eA[e];
          return (t || X(0, e), t);
        }
        var eC = (e) => !!eA[e],
          eT = () => sO,
          eD = (e, t) => ({
            drafts_: [],
            parent_: e,
            immer_: t,
            canAutoFreeze_: !0,
            unfinalizedDrafts_: 0,
            handledSet_: new Set(),
            processedForPatches_: new Set(),
            mapSetPlugin_: eC(eE) ? eM(eE) : void 0,
          });
        function eI(e, t) {
          t &&
            ((e.patchPlugin_ = eM(e_)),
            (e.patches_ = []),
            (e.inversePatches_ = []),
            (e.patchListener_ = t));
        }
        function ez(e) {
          (eL(e), e.drafts_.forEach(e$), (e.drafts_ = null));
        }
        function eL(e) {
          e === sO && (sO = e.parent_);
        }
        var eR = (e) => (sO = eD(sO, e));
        function e$(e) {
          let t = e[G];
          0 === t.type_ || 1 === t.type_ ? t.revoke_() : (t.revoked_ = !0);
        }
        function eU(e, t) {
          t.unfinalizedDrafts_ = t.drafts_.length;
          let r = t.drafts_[0],
            n = void 0 !== e && e !== r;
          if (n) {
            (r[G].modified_ && (ez(t), X(4)), el(e) && (e = eF(t, e)));
            let { patchPlugin_: n } = t;
            n && n.generateReplacementPatches_(r[G].base_, e, t);
          } else e = eF(t, r);
          return (
            (function (e, t, r = !1) {
              !e.parent_ &&
                e.immer_.autoFreeze_ &&
                e.canAutoFreeze_ &&
                eS(t, r);
            })(t, e, !0),
            ez(t),
            t.patches_ && t.patchListener_(t.patches_, t.inversePatches_),
            e !== Z ? e : void 0
          );
        }
        function eF(e, t) {
          if (eN(t)) return t;
          let r = t[G];
          if (!r) {
            let r = eV(t, e.handledSet_, e);
            return r;
          }
          if (!eK(r, e)) return t;
          if (!r.modified_) return r.base_;
          if (!r.finalized_) {
            let { callbacks_: t } = r;
            if (t)
              for (; t.length > 0; ) {
                let r = t.pop();
                r(e);
              }
            eq(r, e);
          }
          return r.copy_;
        }
        function eB(e) {
          ((e.finalized_ = !0), e.scope_.unfinalizedDrafts_--);
        }
        var eK = (e, t) => e.scope_ === t,
          eW = [];
        function eH(e, t, r, n) {
          let i = ej(e),
            a = e.type_;
          if (void 0 !== n) {
            let e = ep(i, n, a);
            if (e === t) {
              ey(i, n, r, a);
              return;
            }
          }
          if (!e.draftLocations_) {
            let t = (e.draftLocations_ = new Map());
            ed(i, (e, r) => {
              if (eo(r)) {
                let n = t.get(r) || [];
                (n.push(e), t.set(r, n));
              }
            });
          }
          let o = e.draftLocations_.get(t) ?? eW;
          for (let e of o) ey(i, e, r, a);
        }
        function eq(e, t) {
          let r =
            e.modified_ &&
            !e.finalized_ &&
            (3 === e.type_ || (e.assigned_?.size ?? 0) > 0);
          if (r) {
            let { patchPlugin_: r } = t;
            if (r) {
              let n = r.getPath(e);
              n && r.generatePatches_(e, n, t);
            }
            eB(e);
          }
        }
        function eV(e, t, r) {
          return (
            (!r.immer_.autoFreeze_ && r.unfinalizedDrafts_ < 1) ||
              eo(e) ||
              t.has(e) ||
              !el(e) ||
              eN(e) ||
              (t.add(e),
              ed(e, (n, i) => {
                if (eo(i)) {
                  let t = i[G];
                  if (eK(t, r)) {
                    let r = eO(t);
                    (ey(e, n, r, e.type_), eB(t));
                  }
                } else el(i) && eV(i, t, r);
              })),
            e
          );
        }
        var eZ = {
            get(e, t) {
              if (t === G) return e;
              let r = ej(e);
              if (!eh(r, t, e.type_))
                return (function (e, t, r) {
                  let n = eX(t, r);
                  return n ? (ea in n ? n[ea] : n.get?.call(e.draft_)) : void 0;
                })(e, r, t);
              let n = r[t];
              if (e.finalized_ || !el(n)) return n;
              if (n === eG(e.base_, t)) {
                eJ(e);
                let r = 1 === e.type_ ? +t : t,
                  i = e0(e.scope_, n, e, r);
                return (e.copy_[r] = i);
              }
              return n;
            },
            has: (e, t) => t in ej(e),
            ownKeys: (e) => Reflect.ownKeys(ej(e)),
            set(e, t, r) {
              let n = eX(ej(e), t);
              if (n?.set) return (n.set.call(e.draft_, r), !0);
              if (!e.modified_) {
                let n = eG(ej(e), t),
                  i = n?.[G];
                if (i && i.base_ === r)
                  return ((e.copy_[t] = r), e.assigned_.set(t, !1), !0);
                if (
                  (r === n ? 0 !== r || 1 / r == 1 / n : r != r && n != n) &&
                  (void 0 !== r || eh(e.base_, t, e.type_))
                )
                  return !0;
                (eJ(e), eQ(e));
              }
              return (
                !!(
                  (e.copy_[t] === r && (void 0 !== r || t in e.copy_)) ||
                  (Number.isNaN(r) && Number.isNaN(e.copy_[t]))
                ) ||
                ((e.copy_[t] = r),
                e.assigned_.set(t, !0),
                (function (e, t, r) {
                  let { scope_: n } = e;
                  if (eo(r)) {
                    let i = r[G];
                    eK(i, n) &&
                      i.callbacks_.push(function () {
                        eJ(e);
                        let n = eO(i);
                        eH(e, r, n, t);
                      });
                  } else
                    el(r) &&
                      e.callbacks_.push(function () {
                        let i = ej(e);
                        ep(i, t, e.type_) === r &&
                          n.drafts_.length > 1 &&
                          (e.assigned_.get(t) ?? !1) === !0 &&
                          e.copy_ &&
                          eV(ep(e.copy_, t, e.type_), n.handledSet_, n);
                      });
                })(e, t, r),
                !0)
              );
            },
            deleteProperty: (e, t) => (
              eJ(e),
              void 0 !== eG(e.base_, t) || t in e.base_
                ? (e.assigned_.set(t, !1), eQ(e))
                : e.assigned_.delete(t),
              e.copy_ && delete e.copy_[t],
              !0
            ),
            getOwnPropertyDescriptor(e, t) {
              let r = ej(e),
                n = Reflect.getOwnPropertyDescriptor(r, t);
              return n
                ? {
                    [ei]: !0,
                    [er]: 1 !== e.type_ || "length" !== t,
                    [en]: n[en],
                    [ea]: r[t],
                  }
                : n;
            },
            defineProperty() {
              X(11);
            },
            getPrototypeOf: (e) => J(e.base_),
            setPrototypeOf() {
              X(12);
            },
          },
          eY = {};
        function eG(e, t) {
          let r = e[G],
            n = r ? ej(r) : e;
          return n[t];
        }
        function eX(e, t) {
          if (!(t in e)) return;
          let r = J(e);
          for (; r; ) {
            let e = Object.getOwnPropertyDescriptor(r, t);
            if (e) return e;
            r = J(r);
          }
        }
        function eQ(e) {
          !e.modified_ && ((e.modified_ = !0), e.parent_ && eQ(e.parent_));
        }
        function eJ(e) {
          e.copy_ ||
            ((e.assigned_ = new Map()),
            (e.copy_ = eP(e.base_, e.scope_.immer_.useStrictShallowCopy_)));
        }
        function e0(e, t, r, n) {
          let [i, a] = ev(t)
              ? eM(eE).proxyMap_(t, r)
              : eg(t)
                ? eM(eE).proxySet_(t, r)
                : (function (e, t) {
                    let r = em(e),
                      n = {
                        type_: r ? 1 : 0,
                        scope_: t ? t.scope_ : eT(),
                        modified_: !1,
                        finalized_: !1,
                        assigned_: void 0,
                        parent_: t,
                        base_: e,
                        draft_: null,
                        copy_: null,
                        revoke_: null,
                        isManual_: !1,
                        callbacks_: void 0,
                      },
                      i = n,
                      a = eZ;
                    r && ((i = [n]), (a = eY));
                    let { revoke: o, proxy: l } = Proxy.revocable(i, a);
                    return ((n.draft_ = l), (n.revoke_ = o), [l, n]);
                  })(t, r),
            o = r?.scope_ ?? eT();
          return (
            o.drafts_.push(i),
            (a.callbacks_ = r?.callbacks_ ?? []),
            (a.key_ = n),
            r && void 0 !== n
              ? (function (e, t, r) {
                  e.callbacks_.push(function (n) {
                    if (!t || !eK(t, n)) return;
                    n.mapSetPlugin_?.fixSetContents(t);
                    let i = eO(t);
                    (eH(e, t.draft_ ?? t, i, r), eq(t, n));
                  });
                })(r, a, n)
              : a.callbacks_.push(function (e) {
                  e.mapSetPlugin_?.fixSetContents(a);
                  let { patchPlugin_: t } = e;
                  a.modified_ && t && t.generatePatches_(a, [], e);
                }),
            i
          );
        }
        function e1(e) {
          return (
            eo(e) || X(10, e),
            (function e(t) {
              let r;
              if (!el(t) || eN(t)) return t;
              let n = t[G],
                i = !0;
              if (n) {
                if (!n.modified_) return n.base_;
                ((n.finalized_ = !0),
                  (r = eP(t, n.scope_.immer_.useStrictShallowCopy_)),
                  (i = n.scope_.immer_.shouldUseStrictIteration()));
              } else r = eP(t, !0);
              return (
                ed(
                  r,
                  (t, n) => {
                    ey(r, t, e(n));
                  },
                  i,
                ),
                n && (n.finalized_ = !1),
                r
              );
            })(e)
          );
        }
        (ed(eZ, (e, t) => {
          eY[e] = function () {
            let e = arguments;
            return ((e[0] = e[0][0]), t.apply(this, e));
          };
        }),
          (eY.deleteProperty = function (e, t) {
            return eY.set.call(this, e, t, void 0);
          }),
          (eY.set = function (e, t, r) {
            return eZ.set.call(this, e[0], t, r, e[0]);
          }));
        var e2 = new (class {
          constructor(e) {
            ((this.autoFreeze_ = !0),
              (this.useStrictShallowCopy_ = !1),
              (this.useStrictIteration_ = !1),
              (this.produce = (e, t, r) => {
                let n;
                if (ex(e) && !ex(t)) {
                  let r = t;
                  t = e;
                  let n = this;
                  return function (e = r, ...i) {
                    return n.produce(e, (e) => t.call(this, e, ...i));
                  };
                }
                if ((ex(t) || X(6), void 0 === r || ex(r) || X(7), el(e))) {
                  let i = eR(this),
                    a = e0(i, e, void 0),
                    o = !0;
                  try {
                    ((n = t(a)), (o = !1));
                  } finally {
                    o ? ez(i) : eL(i);
                  }
                  return (eI(i, r), eU(n, i));
                }
                if (e && eb(e)) X(1, e);
                else {
                  if (
                    (void 0 === (n = t(e)) && (n = e),
                    n === Z && (n = void 0),
                    this.autoFreeze_ && eS(n, !0),
                    r)
                  ) {
                    let t = [],
                      i = [];
                    (eM(e_).generateReplacementPatches_(e, n, {
                      patches_: t,
                      inversePatches_: i,
                    }),
                      r(t, i));
                  }
                  return n;
                }
              }),
              (this.produceWithPatches = (e, t) => {
                let r, n;
                if (ex(e))
                  return (t, ...r) =>
                    this.produceWithPatches(t, (t) => e(t, ...r));
                let i = this.produce(e, t, (e, t) => {
                  ((r = e), (n = t));
                });
                return [i, r, n];
              }),
              ew(e?.autoFreeze) && this.setAutoFreeze(e.autoFreeze),
              ew(e?.useStrictShallowCopy) &&
                this.setUseStrictShallowCopy(e.useStrictShallowCopy),
              ew(e?.useStrictIteration) &&
                this.setUseStrictIteration(e.useStrictIteration));
          }
          createDraft(e) {
            (el(e) || X(8), eo(e) && (e = e1(e)));
            let t = eR(this),
              r = e0(t, e, void 0);
            return ((r[G].isManual_ = !0), eL(t), r);
          }
          finishDraft(e, t) {
            let r = e && e[G];
            (r && r.isManual_) || X(9);
            let { scope_: n } = r;
            return (eI(n, t), eU(void 0, n));
          }
          setAutoFreeze(e) {
            this.autoFreeze_ = e;
          }
          setUseStrictShallowCopy(e) {
            this.useStrictShallowCopy_ = e;
          }
          setUseStrictIteration(e) {
            this.useStrictIteration_ = e;
          }
          shouldUseStrictIteration() {
            return this.useStrictIteration_;
          }
          applyPatches(e, t) {
            let r;
            for (r = t.length - 1; r >= 0; r--) {
              let n = t[r];
              if (0 === n.path.length && "replace" === n.op) {
                e = n.value;
                break;
              }
            }
            r > -1 && (t = t.slice(r + 1));
            let n = eM(e_).applyPatches_;
            return eo(e) ? n(e, t) : this.produce(e, (e) => n(e, t));
          }
        })().produce;
        function e3(e) {
          return `Minified Redux error #${e}; visit https://redux.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
        }
        var e6 =
            ("function" == typeof Symbol && Symbol.observable) ||
            "@@observable",
          e5 = () =>
            Math.random().toString(36).substring(7).split("").join("."),
          e4 = {
            INIT: `@@redux/INIT${e5()}`,
            REPLACE: `@@redux/REPLACE${e5()}`,
            PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${e5()}`,
          };
        function e7(e) {
          if ("object" != typeof e || null === e) return !1;
          let t = e;
          for (; null !== Object.getPrototypeOf(t); )
            t = Object.getPrototypeOf(t);
          return (
            Object.getPrototypeOf(e) === t || null === Object.getPrototypeOf(e)
          );
        }
        function e8(e) {
          let t;
          let r = Object.keys(e),
            n = {};
          for (let t = 0; t < r.length; t++) {
            let i = r[t];
            "function" == typeof e[i] && (n[i] = e[i]);
          }
          let i = Object.keys(n);
          try {
            !(function (e) {
              Object.keys(e).forEach((t) => {
                let r = e[t],
                  n = r(void 0, { type: e4.INIT });
                if (void 0 === n) throw Error(e3(12));
                if (void 0 === r(void 0, { type: e4.PROBE_UNKNOWN_ACTION() }))
                  throw Error(e3(13));
              });
            })(n);
          } catch (e) {
            t = e;
          }
          return function (e = {}, r) {
            if (t) throw t;
            let a = !1,
              o = {};
            for (let t = 0; t < i.length; t++) {
              let l = i[t],
                s = n[l],
                c = e[l],
                u = s(c, r);
              if (void 0 === u) throw (r && r.type, Error(e3(14)));
              ((o[l] = u), (a = a || u !== c));
            }
            return (a = a || i.length !== Object.keys(e).length) ? o : e;
          };
        }
        function e9(...e) {
          return 0 === e.length
            ? (e) => e
            : 1 === e.length
              ? e[0]
              : e.reduce(
                  (e, t) =>
                    (...r) =>
                      e(t(...r)),
                );
        }
        function te(e) {
          return e7(e) && "type" in e && "string" == typeof e.type;
        }
        function tt(e) {
          return ({ dispatch: t, getState: r }) =>
            (n) =>
            (i) =>
              "function" == typeof i ? i(t, r, e) : n(i);
        }
        var tr = tt(),
          tn = function () {
            if (0 != arguments.length)
              return "object" == typeof arguments[0]
                ? e9
                : e9.apply(null, arguments);
          },
          ti = (e) => e && "function" == typeof e.match;
        function ta(e, t) {
          function r(...n) {
            if (t) {
              let r = t(...n);
              if (!r) throw Error(t6(0));
              return {
                type: e,
                payload: r.payload,
                ...("meta" in r && { meta: r.meta }),
                ...("error" in r && { error: r.error }),
              };
            }
            return { type: e, payload: n[0] };
          }
          return (
            (r.toString = () => `${e}`),
            (r.type = e),
            (r.match = (t) => te(t) && t.type === e),
            r
          );
        }
        function to(e) {
          return ["type", "payload", "error", "meta"].indexOf(e) > -1;
        }
        var tl = class e extends Array {
          constructor(...t) {
            (super(...t), Object.setPrototypeOf(this, e.prototype));
          }
          static get [Symbol.species]() {
            return e;
          }
          concat(...e) {
            return super.concat.apply(this, e);
          }
          prepend(...t) {
            return 1 === t.length && Array.isArray(t[0])
              ? new e(...t[0].concat(this))
              : new e(...t.concat(this));
          }
        };
        function ts(e) {
          return el(e) ? e2(e, () => {}) : e;
        }
        function tc(e, t, r) {
          return e.has(t) ? e.get(t) : e.set(t, r(t)).get(t);
        }
        var tu = () =>
            function (e) {
              let {
                  thunk: t = !0,
                  immutableCheck: r = !0,
                  serializableCheck: n = !0,
                  actionCreatorCheck: i = !0,
                } = e ?? {},
                a = new tl();
              return (
                t &&
                  ("boolean" == typeof t
                    ? a.push(tr)
                    : a.push(tt(t.extraArgument))),
                a
              );
            },
          td = "RTK_autoBatch",
          tf = () => (e) => ({ payload: e, meta: { [td]: !0 } }),
          th = (e) => (t) => {
            setTimeout(t, e);
          },
          tp =
            (e = { type: "raf" }) =>
            (t) =>
            (...r) => {
              let n = t(...r),
                i = !0,
                a = !1,
                o = !1,
                l = new Set(),
                s =
                  "tick" === e.type
                    ? queueMicrotask
                    : "raf" === e.type
                      ? th(10)
                      : "callback" === e.type
                        ? e.queueNotification
                        : th(e.timeout),
                c = () => {
                  ((o = !1), a && ((a = !1), l.forEach((e) => e())));
                };
              return Object.assign({}, n, {
                subscribe(e) {
                  let t = n.subscribe(() => i && e());
                  return (
                    l.add(e),
                    () => {
                      (t(), l.delete(e));
                    }
                  );
                },
                dispatch(e) {
                  try {
                    return (
                      (a = !(i = !e?.meta?.[td])) && !o && ((o = !0), s(c)),
                      n.dispatch(e)
                    );
                  } finally {
                    i = !0;
                  }
                },
              });
            },
          ty = (e) =>
            function (t) {
              let { autoBatch: r = !0 } = t ?? {},
                n = new tl(e);
              return (r && n.push(tp("object" == typeof r ? r : void 0)), n);
            };
        function tm(e) {
          let t;
          let r = {},
            n = [],
            i = {
              addCase(e, t) {
                let n = "string" == typeof e ? e : e.type;
                if (!n) throw Error(t6(28));
                if (n in r) throw Error(t6(29));
                return ((r[n] = t), i);
              },
              addAsyncThunk: (e, t) => (
                t.pending && (r[e.pending.type] = t.pending),
                t.rejected && (r[e.rejected.type] = t.rejected),
                t.fulfilled && (r[e.fulfilled.type] = t.fulfilled),
                t.settled && n.push({ matcher: e.settled, reducer: t.settled }),
                i
              ),
              addMatcher: (e, t) => (n.push({ matcher: e, reducer: t }), i),
              addDefaultCase: (e) => ((t = e), i),
            };
          return (e(i), [r, n, t]);
        }
        var tv = (e, t) => (ti(e) ? e.match(t) : e(t)),
          tg = (e = 21) => {
            let t = "",
              r = e;
            for (; r--; )
              t +=
                "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW"[
                  (64 * Math.random()) | 0
                ];
            return t;
          },
          tb = ["name", "message", "stack", "code"],
          tx = Symbol.for("rtk-slice-createasyncthunk"),
          tw =
            (((sj = tw || {}).reducer = "reducer"),
            (sj.reducerWithPrepare = "reducerWithPrepare"),
            (sj.asyncThunk = "asyncThunk"),
            sj),
          tj = (function ({ creators: e } = {}) {
            let t = e?.asyncThunk?.[tx];
            return function (e) {
              let r;
              let { name: n, reducerPath: i = n } = e;
              if (!n) throw Error(t6(11));
              let a =
                  ("function" == typeof e.reducers
                    ? e.reducers(
                        (function () {
                          function e(e, t) {
                            return {
                              _reducerDefinitionType: "asyncThunk",
                              payloadCreator: e,
                              ...t,
                            };
                          }
                          return (
                            (e.withTypes = () => e),
                            {
                              reducer: (e) =>
                                Object.assign(
                                  { [e.name]: (...t) => e(...t) }[e.name],
                                  { _reducerDefinitionType: "reducer" },
                                ),
                              preparedReducer: (e, t) => ({
                                _reducerDefinitionType: "reducerWithPrepare",
                                prepare: e,
                                reducer: t,
                              }),
                              asyncThunk: e,
                            }
                          );
                        })(),
                      )
                    : e.reducers) || {},
                o = Object.keys(a),
                l = {
                  sliceCaseReducersByName: {},
                  sliceCaseReducersByType: {},
                  actionCreators: {},
                  sliceMatchers: [],
                },
                s = {
                  addCase(e, t) {
                    let r = "string" == typeof e ? e : e.type;
                    if (!r) throw Error(t6(12));
                    if (r in l.sliceCaseReducersByType) throw Error(t6(13));
                    return ((l.sliceCaseReducersByType[r] = t), s);
                  },
                  addMatcher: (e, t) => (
                    l.sliceMatchers.push({ matcher: e, reducer: t }),
                    s
                  ),
                  exposeAction: (e, t) => ((l.actionCreators[e] = t), s),
                  exposeCaseReducer: (e, t) => (
                    (l.sliceCaseReducersByName[e] = t),
                    s
                  ),
                };
              function c() {
                let [t = {}, r = [], n] =
                    "function" == typeof e.extraReducers
                      ? tm(e.extraReducers)
                      : [e.extraReducers],
                  i = { ...t, ...l.sliceCaseReducersByType };
                return (function (e, t) {
                  let r;
                  let [n, i, a] = tm(t);
                  if ("function" == typeof e) r = () => ts(e());
                  else {
                    let t = ts(e);
                    r = () => t;
                  }
                  function o(e = r(), t) {
                    let o = [
                      n[t.type],
                      ...i
                        .filter(({ matcher: e }) => e(t))
                        .map(({ reducer: e }) => e),
                    ];
                    return (
                      0 === o.filter((e) => !!e).length && (o = [a]),
                      o.reduce((e, r) => {
                        if (r) {
                          if (eo(e)) {
                            let n = r(e, t);
                            return void 0 === n ? e : n;
                          }
                          if (el(e)) return e2(e, (e) => r(e, t));
                          {
                            let n = r(e, t);
                            if (void 0 === n) {
                              if (null === e) return e;
                              throw Error(
                                "A case reducer on a non-draftable value must not return undefined",
                              );
                            }
                            return n;
                          }
                        }
                        return e;
                      }, e)
                    );
                  }
                  return ((o.getInitialState = r), o);
                })(e.initialState, (e) => {
                  for (let t in i) e.addCase(t, i[t]);
                  for (let t of l.sliceMatchers)
                    e.addMatcher(t.matcher, t.reducer);
                  for (let t of r) e.addMatcher(t.matcher, t.reducer);
                  n && e.addDefaultCase(n);
                });
              }
              o.forEach((r) => {
                let i = a[r],
                  o = {
                    reducerName: r,
                    type: `${n}/${r}`,
                    createNotation: "function" == typeof e.reducers,
                  };
                "asyncThunk" === i._reducerDefinitionType
                  ? (function ({ type: e, reducerName: t }, r, n, i) {
                      if (!i) throw Error(t6(18));
                      let {
                          payloadCreator: a,
                          fulfilled: o,
                          pending: l,
                          rejected: s,
                          settled: c,
                          options: u,
                        } = r,
                        d = i(e, a, u);
                      (n.exposeAction(t, d),
                        o && n.addCase(d.fulfilled, o),
                        l && n.addCase(d.pending, l),
                        s && n.addCase(d.rejected, s),
                        c && n.addMatcher(d.settled, c),
                        n.exposeCaseReducer(t, {
                          fulfilled: o || tO,
                          pending: l || tO,
                          rejected: s || tO,
                          settled: c || tO,
                        }));
                    })(o, i, s, t)
                  : (function (
                      { type: e, reducerName: t, createNotation: r },
                      n,
                      i,
                    ) {
                      let a, o;
                      if ("reducer" in n) {
                        if (
                          r &&
                          "reducerWithPrepare" !== n._reducerDefinitionType
                        )
                          throw Error(t6(17));
                        ((a = n.reducer), (o = n.prepare));
                      } else a = n;
                      i.addCase(e, a)
                        .exposeCaseReducer(t, a)
                        .exposeAction(t, o ? ta(e, o) : ta(e));
                    })(o, i, s);
              });
              let u = (e) => e,
                d = new Map(),
                f = new WeakMap();
              function h(e, t) {
                return (r || (r = c()), r(e, t));
              }
              function p() {
                return (r || (r = c()), r.getInitialState());
              }
              function y(t, r = !1) {
                function n(e) {
                  let i = e[t];
                  return (void 0 === i && r && (i = tc(f, n, p)), i);
                }
                function i(t = u) {
                  let n = tc(d, r, () => new WeakMap());
                  return tc(n, t, () => {
                    let n = {};
                    for (let [i, a] of Object.entries(e.selectors ?? {}))
                      n[i] = (function (e, t, r, n) {
                        function i(a, ...o) {
                          let l = t(a);
                          return (void 0 === l && n && (l = r()), e(l, ...o));
                        }
                        return ((i.unwrapped = e), i);
                      })(a, t, () => tc(f, t, p), r);
                    return n;
                  });
                }
                return {
                  reducerPath: t,
                  getSelectors: i,
                  get selectors() {
                    return i(n);
                  },
                  selectSlice: n,
                };
              }
              let m = {
                name: n,
                reducer: h,
                actions: l.actionCreators,
                caseReducers: l.sliceCaseReducersByName,
                getInitialState: p,
                ...y(i),
                injectInto(e, { reducerPath: t, ...r } = {}) {
                  let n = t ?? i;
                  return (
                    e.inject({ reducerPath: n, reducer: h }, r),
                    { ...m, ...y(n, !0) }
                  );
                },
              };
              return m;
            };
          })();
        function tO() {}
        var tP = "listener",
          tS = "completed",
          tk = "cancelled",
          tN = `task-${tk}`,
          tE = `task-${tS}`,
          t_ = `${tP}-${tk}`,
          tA = `${tP}-${tS}`,
          tM = class {
            constructor(e) {
              ((this.name = "TaskAbortError"),
                (this.code = e),
                (this.message = `task ${tk} (reason: ${e})`));
            }
          },
          tC = (e, t) => {
            if ("function" != typeof e) throw TypeError(t6(32));
          },
          tT = () => {},
          tD = (e, t = tT) => (e.catch(t), e),
          tI = (e, t) => (
            e.addEventListener("abort", t, { once: !0 }),
            () => e.removeEventListener("abort", t)
          ),
          tz = (e) => {
            if (e.aborted) throw new tM(e.reason);
          };
        function tL(e, t) {
          let r = tT;
          return new Promise((n, i) => {
            let a = () => i(new tM(e.reason));
            if (e.aborted) {
              a();
              return;
            }
            ((r = tI(e, a)), t.finally(() => r()).then(n, i));
          }).finally(() => {
            r = tT;
          });
        }
        var tR = async (e, t) => {
            try {
              await Promise.resolve();
              let t = await e();
              return { status: "ok", value: t };
            } catch (e) {
              return {
                status: e instanceof tM ? "cancelled" : "rejected",
                error: e,
              };
            } finally {
              t?.();
            }
          },
          t$ = (e) => (t) => tD(tL(e, t).then((t) => (tz(e), t))),
          tU = (e) => {
            let t = t$(e);
            return (e) => t(new Promise((t) => setTimeout(t, e)));
          },
          { assign: tF } = Object,
          tB = {},
          tK = "listenerMiddleware",
          tW = (e, t) => {
            let r = (t) => tI(e, () => t.abort(e.reason));
            return (n, i) => {
              tC(n, "taskExecutor");
              let a = new AbortController();
              r(a);
              let o = tR(
                async () => {
                  (tz(e), tz(a.signal));
                  let t = await n({
                    pause: t$(a.signal),
                    delay: tU(a.signal),
                    signal: a.signal,
                  });
                  return (tz(a.signal), t);
                },
                () => a.abort(tE),
              );
              return (
                i?.autoJoin && t.push(o.catch(tT)),
                {
                  result: t$(e)(o),
                  cancel() {
                    a.abort(tN);
                  },
                }
              );
            };
          },
          tH = (e, t) => {
            let r = async (r, n) => {
              tz(t);
              let i = () => {},
                a = new Promise((t, n) => {
                  let a = e({
                    predicate: r,
                    effect: (e, r) => {
                      (r.unsubscribe(),
                        t([e, r.getState(), r.getOriginalState()]));
                    },
                  });
                  i = () => {
                    (a(), n());
                  };
                }),
                o = [a];
              null != n && o.push(new Promise((e) => setTimeout(e, n, null)));
              try {
                let e = await tL(t, Promise.race(o));
                return (tz(t), e);
              } finally {
                i();
              }
            };
            return (e, t) => tD(r(e, t));
          },
          tq = (e) => {
            let {
              type: t,
              actionCreator: r,
              matcher: n,
              predicate: i,
              effect: a,
            } = e;
            if (t) i = ta(t).match;
            else if (r) ((t = r.type), (i = r.match));
            else if (n) i = n;
            else if (i);
            else throw Error(t6(21));
            return (
              tC(a, "options.listener"),
              { predicate: i, type: t, effect: a }
            );
          },
          tV = tF(
            (e) => {
              let { type: t, predicate: r, effect: n } = tq(e),
                i = {
                  id: tg(),
                  effect: n,
                  type: t,
                  predicate: r,
                  pending: new Set(),
                  unsubscribe: () => {
                    throw Error(t6(22));
                  },
                };
              return i;
            },
            { withTypes: () => tV },
          ),
          tZ = (e, t) => {
            let { type: r, effect: n, predicate: i } = tq(t);
            return Array.from(e.values()).find((e) => {
              let t = "string" == typeof r ? e.type === r : e.predicate === i;
              return t && e.effect === n;
            });
          },
          tY = (e) => {
            e.pending.forEach((e) => {
              e.abort(t_);
            });
          },
          tG = (e, t) => () => {
            for (let e of t.keys()) tY(e);
            e.clear();
          },
          tX = (e, t, r) => {
            try {
              e(t, r);
            } catch (e) {
              setTimeout(() => {
                throw e;
              }, 0);
            }
          },
          tQ = tF(ta(`${tK}/add`), { withTypes: () => tQ }),
          tJ = ta(`${tK}/removeAll`),
          t0 = tF(ta(`${tK}/remove`), { withTypes: () => t0 }),
          t1 = (...e) => {
            console.error(`${tK}/error`, ...e);
          },
          t2 = (e = {}) => {
            let t = new Map(),
              r = new Map(),
              n = (e) => {
                let t = r.get(e) ?? 0;
                r.set(e, t + 1);
              },
              i = (e) => {
                let t = r.get(e) ?? 1;
                1 === t ? r.delete(e) : r.set(e, t - 1);
              },
              { extra: a, onError: o = t1 } = e;
            tC(o, "onError");
            let l = (e) => (
                (e.unsubscribe = () => t.delete(e.id)),
                t.set(e.id, e),
                (t) => {
                  (e.unsubscribe(), t?.cancelActive && tY(e));
                }
              ),
              s = (e) => {
                let r = tZ(t, e) ?? tV(e);
                return l(r);
              };
            tF(s, { withTypes: () => s });
            let c = (e) => {
              let r = tZ(t, e);
              return (r && (r.unsubscribe(), e.cancelActive && tY(r)), !!r);
            };
            tF(c, { withTypes: () => c });
            let u = async (e, r, l, c) => {
                let u = new AbortController(),
                  d = tH(s, u.signal),
                  f = [];
                try {
                  (e.pending.add(u),
                    n(e),
                    await Promise.resolve(
                      e.effect(
                        r,
                        tF({}, l, {
                          getOriginalState: c,
                          condition: (e, t) => d(e, t).then(Boolean),
                          take: d,
                          delay: tU(u.signal),
                          pause: t$(u.signal),
                          extra: a,
                          signal: u.signal,
                          fork: tW(u.signal, f),
                          unsubscribe: e.unsubscribe,
                          subscribe: () => {
                            t.set(e.id, e);
                          },
                          cancelActiveListeners: () => {
                            e.pending.forEach((e, t, r) => {
                              e !== u && (e.abort(t_), r.delete(e));
                            });
                          },
                          cancel: () => {
                            (u.abort(t_), e.pending.delete(u));
                          },
                          throwIfCancelled: () => {
                            tz(u.signal);
                          },
                        }),
                      ),
                    ));
                } catch (e) {
                  e instanceof tM || tX(o, e, { raisedBy: "effect" });
                } finally {
                  (await Promise.all(f),
                    u.abort(tA),
                    i(e),
                    e.pending.delete(u));
                }
              },
              d = tG(t, r);
            return {
              middleware: (e) => (r) => (n) => {
                let i;
                if (!te(n)) return r(n);
                if (tQ.match(n)) return s(n.payload);
                if (tJ.match(n)) {
                  d();
                  return;
                }
                if (t0.match(n)) return c(n.payload);
                let a = e.getState(),
                  l = () => {
                    if (a === tB) throw Error(t6(23));
                    return a;
                  };
                try {
                  if (((i = r(n)), t.size > 0)) {
                    let r = e.getState(),
                      i = Array.from(t.values());
                    for (let t of i) {
                      let i = !1;
                      try {
                        i = t.predicate(n, r, a);
                      } catch (e) {
                        ((i = !1), tX(o, e, { raisedBy: "predicate" }));
                      }
                      i && u(t, n, e, l);
                    }
                  }
                } finally {
                  a = tB;
                }
                return i;
              },
              startListening: s,
              stopListening: c,
              clearListeners: d,
            };
          },
          t3 = Symbol.for("rtk-state-proxy-original");
        function t6(e) {
          return `Minified Redux Toolkit error #${e}; visit https://redux-toolkit.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
        }
        function t5(e, t) {
          if (t) {
            var r = Number.parseInt(t, 10);
            if (!v(r)) return null == e ? void 0 : e[r];
          }
        }
        var t4 = tj({
            name: "options",
            initialState: {
              chartName: "",
              tooltipPayloadSearcher: void 0,
              eventEmitter: void 0,
              defaultTooltipEventType: "axis",
            },
            reducers: {
              createEventEmitter: (e) => {
                null == e.eventEmitter &&
                  (e.eventEmitter = Symbol("rechartsEventEmitter"));
              },
            },
          }),
          t7 = t4.reducer,
          { createEventEmitter: t8 } = t4.actions;
        r(18665);
        var t9 = Symbol.for("react.forward_ref"),
          re = Symbol.for("react.memo"),
          rt = { notify() {}, get: () => [] },
          rr =
            "undefined" != typeof navigator &&
            "ReactNative" === navigator.product
              ? l.useLayoutEffect
              : l.useEffect;
        function rn(e, t) {
          return e === t
            ? 0 !== e || 0 !== t || 1 / e == 1 / t
            : e != e && t != t;
        }
        var ri = {
            childContextTypes: !0,
            contextType: !0,
            contextTypes: !0,
            defaultProps: !0,
            displayName: !0,
            getDefaultProps: !0,
            getDerivedStateFromError: !0,
            getDerivedStateFromProps: !0,
            mixins: !0,
            propTypes: !0,
            type: !0,
          },
          ra = {
            $$typeof: !0,
            compare: !0,
            defaultProps: !0,
            displayName: !0,
            propTypes: !0,
            type: !0,
          },
          ro = {
            [t9]: {
              $$typeof: !0,
              render: !0,
              defaultProps: !0,
              displayName: !0,
              propTypes: !0,
            },
            [re]: ra,
          };
        (Object.getOwnPropertyNames,
          Object.getOwnPropertySymbols,
          Object.getOwnPropertyDescriptor,
          Object.getPrototypeOf,
          Object.prototype);
        var rl = Symbol.for("react-redux-context"),
          rs = "undefined" != typeof globalThis ? globalThis : {},
          rc = (function () {
            if (!l.createContext) return {};
            let e = (rs[rl] ??= new Map()),
              t = e.get(l.createContext);
            return (
              t || ((t = l.createContext(null)), e.set(l.createContext, t)),
              t
            );
          })(),
          ru = function (e) {
            let { children: t, context: r, serverState: n, store: i } = e,
              a = l.useMemo(() => {
                let e = (function (e, t) {
                  let r;
                  let n = rt,
                    i = 0,
                    a = !1;
                  function o() {
                    c.onStateChange && c.onStateChange();
                  }
                  function l() {
                    if ((i++, !r)) {
                      let i, a;
                      ((r = t ? t.addNestedSub(o) : e.subscribe(o)),
                        (i = null),
                        (a = null),
                        (n = {
                          clear() {
                            ((i = null), (a = null));
                          },
                          notify() {
                            (() => {
                              let e = i;
                              for (; e; ) (e.callback(), (e = e.next));
                            })();
                          },
                          get() {
                            let e = [],
                              t = i;
                            for (; t; ) (e.push(t), (t = t.next));
                            return e;
                          },
                          subscribe(e) {
                            let t = !0,
                              r = (a = { callback: e, next: null, prev: a });
                            return (
                              r.prev ? (r.prev.next = r) : (i = r),
                              function () {
                                t &&
                                  null !== i &&
                                  ((t = !1),
                                  r.next
                                    ? (r.next.prev = r.prev)
                                    : (a = r.prev),
                                  r.prev
                                    ? (r.prev.next = r.next)
                                    : (i = r.next));
                              }
                            );
                          },
                        }));
                    }
                  }
                  function s() {
                    (i--,
                      r && 0 === i && (r(), (r = void 0), n.clear(), (n = rt)));
                  }
                  let c = {
                    addNestedSub: function (e) {
                      l();
                      let t = n.subscribe(e),
                        r = !1;
                      return () => {
                        r || ((r = !0), t(), s());
                      };
                    },
                    notifyNestedSubs: function () {
                      n.notify();
                    },
                    handleChangeWrapper: o,
                    isSubscribed: function () {
                      return a;
                    },
                    trySubscribe: function () {
                      a || ((a = !0), l());
                    },
                    tryUnsubscribe: function () {
                      a && ((a = !1), s());
                    },
                    getListeners: () => n,
                  };
                  return c;
                })(i);
                return {
                  store: i,
                  subscription: e,
                  getServerState: n ? () => n : void 0,
                };
              }, [i, n]),
              o = l.useMemo(() => i.getState(), [i]);
            return (
              rr(() => {
                let { subscription: e } = a;
                return (
                  (e.onStateChange = e.notifyNestedSubs),
                  e.trySubscribe(),
                  o !== i.getState() && e.notifyNestedSubs(),
                  () => {
                    (e.tryUnsubscribe(), (e.onStateChange = void 0));
                  }
                );
              }, [a, o]),
              l.createElement((r || rc).Provider, { value: a }, t)
            );
          },
          rd = Symbol.for("immer-nothing"),
          rf = Symbol.for("immer-draftable"),
          rh = Symbol.for("immer-state");
        function rp(e, ...t) {
          throw Error(
            `[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`,
          );
        }
        var ry = Object.getPrototypeOf;
        function rm(e) {
          return !!e && !!e[rh];
        }
        function rv(e) {
          return (
            !!e &&
            (rx(e) ||
              Array.isArray(e) ||
              !!e[rf] ||
              !!e.constructor?.[rf] ||
              rS(e) ||
              rk(e))
          );
        }
        var rg = Object.prototype.constructor.toString(),
          rb = new WeakMap();
        function rx(e) {
          if (!e || "object" != typeof e) return !1;
          let t = Object.getPrototypeOf(e);
          if (null === t || t === Object.prototype) return !0;
          let r = Object.hasOwnProperty.call(t, "constructor") && t.constructor;
          if (r === Object) return !0;
          if ("function" != typeof r) return !1;
          let n = rb.get(r);
          return (
            void 0 === n && ((n = Function.toString.call(r)), rb.set(r, n)),
            n === rg
          );
        }
        function rw(e, t, r = !0) {
          if (0 === rj(e)) {
            let n = r ? Reflect.ownKeys(e) : Object.keys(e);
            n.forEach((r) => {
              t(r, e[r], e);
            });
          } else e.forEach((r, n) => t(n, r, e));
        }
        function rj(e) {
          let t = e[rh];
          return t ? t.type_ : Array.isArray(e) ? 1 : rS(e) ? 2 : rk(e) ? 3 : 0;
        }
        function rO(e, t) {
          return 2 === rj(e)
            ? e.has(t)
            : Object.prototype.hasOwnProperty.call(e, t);
        }
        function rP(e, t, r) {
          let n = rj(e);
          2 === n ? e.set(t, r) : 3 === n ? e.add(r) : (e[t] = r);
        }
        function rS(e) {
          return e instanceof Map;
        }
        function rk(e) {
          return e instanceof Set;
        }
        function rN(e) {
          return e.copy_ || e.base_;
        }
        function rE(e, t) {
          if (rS(e)) return new Map(e);
          if (rk(e)) return new Set(e);
          if (Array.isArray(e)) return Array.prototype.slice.call(e);
          let r = rx(e);
          if (!0 !== t && ("class_only" !== t || r)) {
            let t = ry(e);
            if (null !== t && r) return { ...e };
            let n = Object.create(t);
            return Object.assign(n, e);
          }
          {
            let t = Object.getOwnPropertyDescriptors(e);
            delete t[rh];
            let r = Reflect.ownKeys(t);
            for (let n = 0; n < r.length; n++) {
              let i = r[n],
                a = t[i];
              (!1 === a.writable && ((a.writable = !0), (a.configurable = !0)),
                (a.get || a.set) &&
                  (t[i] = {
                    configurable: !0,
                    writable: !0,
                    enumerable: a.enumerable,
                    value: e[i],
                  }));
            }
            return Object.create(ry(e), t);
          }
        }
        function r_(e, t = !1) {
          return (
            rM(e) ||
              rm(e) ||
              !rv(e) ||
              (rj(e) > 1 &&
                Object.defineProperties(e, {
                  set: rA,
                  add: rA,
                  clear: rA,
                  delete: rA,
                }),
              Object.freeze(e),
              t && Object.values(e).forEach((e) => r_(e, !0))),
            e
          );
        }
        var rA = {
          value: function () {
            rp(2);
          },
        };
        function rM(e) {
          return null === e || "object" != typeof e || Object.isFrozen(e);
        }
        var rC = {};
        function rT(e) {
          let t = rC[e];
          return (t || rp(0, e), t);
        }
        function rD(e, t) {
          t &&
            (rT("Patches"),
            (e.patches_ = []),
            (e.inversePatches_ = []),
            (e.patchListener_ = t));
        }
        function rI(e) {
          (rz(e), e.drafts_.forEach(rR), (e.drafts_ = null));
        }
        function rz(e) {
          e === sP && (sP = e.parent_);
        }
        function rL(e) {
          return (sP = {
            drafts_: [],
            parent_: sP,
            immer_: e,
            canAutoFreeze_: !0,
            unfinalizedDrafts_: 0,
          });
        }
        function rR(e) {
          let t = e[rh];
          0 === t.type_ || 1 === t.type_ ? t.revoke_() : (t.revoked_ = !0);
        }
        function r$(e, t) {
          t.unfinalizedDrafts_ = t.drafts_.length;
          let r = t.drafts_[0],
            n = void 0 !== e && e !== r;
          return (
            n
              ? (r[rh].modified_ && (rI(t), rp(4)),
                rv(e) && ((e = rU(t, e)), t.parent_ || rB(t, e)),
                t.patches_ &&
                  rT("Patches").generateReplacementPatches_(
                    r[rh].base_,
                    e,
                    t.patches_,
                    t.inversePatches_,
                  ))
              : (e = rU(t, r, [])),
            rI(t),
            t.patches_ && t.patchListener_(t.patches_, t.inversePatches_),
            e !== rd ? e : void 0
          );
        }
        function rU(e, t, r) {
          if (rM(t)) return t;
          let n = e.immer_.shouldUseStrictIteration(),
            i = t[rh];
          if (!i) return (rw(t, (n, a) => rF(e, i, t, n, a, r), n), t);
          if (i.scope_ !== e) return t;
          if (!i.modified_) return (rB(e, i.base_, !0), i.base_);
          if (!i.finalized_) {
            ((i.finalized_ = !0), i.scope_.unfinalizedDrafts_--);
            let t = i.copy_,
              a = t,
              o = !1;
            (3 === i.type_ && ((a = new Set(t)), t.clear(), (o = !0)),
              rw(a, (n, a) => rF(e, i, t, n, a, r, o), n),
              rB(e, t, !1),
              r &&
                e.patches_ &&
                rT("Patches").generatePatches_(
                  i,
                  r,
                  e.patches_,
                  e.inversePatches_,
                ));
          }
          return i.copy_;
        }
        function rF(e, t, r, n, i, a, o) {
          if (null == i || ("object" != typeof i && !o)) return;
          let l = rM(i);
          if (!l || o) {
            if (rm(i)) {
              let o =
                  a && t && 3 !== t.type_ && !rO(t.assigned_, n)
                    ? a.concat(n)
                    : void 0,
                l = rU(e, i, o);
              if ((rP(r, n, l), !rm(l))) return;
              e.canAutoFreeze_ = !1;
            } else o && r.add(i);
            if (rv(i) && !l) {
              if (
                (!e.immer_.autoFreeze_ && e.unfinalizedDrafts_ < 1) ||
                (t && t.base_ && t.base_[n] === i && l)
              )
                return;
              (rU(e, i),
                (!t || !t.scope_.parent_) &&
                  "symbol" != typeof n &&
                  (rS(r)
                    ? r.has(n)
                    : Object.prototype.propertyIsEnumerable.call(r, n)) &&
                  rB(e, i));
            }
          }
        }
        function rB(e, t, r = !1) {
          !e.parent_ && e.immer_.autoFreeze_ && e.canAutoFreeze_ && r_(t, r);
        }
        var rK = {
            get(e, t) {
              if (t === rh) return e;
              let r = rN(e);
              if (!rO(r, t))
                return (function (e, t, r) {
                  let n = rq(t, r);
                  return n
                    ? "value" in n
                      ? n.value
                      : n.get?.call(e.draft_)
                    : void 0;
                })(e, r, t);
              let n = r[t];
              return e.finalized_ || !rv(n)
                ? n
                : n === rH(e.base_, t)
                  ? (rZ(e), (e.copy_[t] = rY(n, e)))
                  : n;
            },
            has: (e, t) => t in rN(e),
            ownKeys: (e) => Reflect.ownKeys(rN(e)),
            set(e, t, r) {
              let n = rq(rN(e), t);
              if (n?.set) return (n.set.call(e.draft_, r), !0);
              if (!e.modified_) {
                let n = rH(rN(e), t),
                  i = n?.[rh];
                if (i && i.base_ === r)
                  return ((e.copy_[t] = r), (e.assigned_[t] = !1), !0);
                if (
                  (r === n ? 0 !== r || 1 / r == 1 / n : r != r && n != n) &&
                  (void 0 !== r || rO(e.base_, t))
                )
                  return !0;
                (rZ(e), rV(e));
              }
              return (
                !!(
                  (e.copy_[t] === r && (void 0 !== r || t in e.copy_)) ||
                  (Number.isNaN(r) && Number.isNaN(e.copy_[t]))
                ) || ((e.copy_[t] = r), (e.assigned_[t] = !0), !0)
              );
            },
            deleteProperty: (e, t) => (
              void 0 !== rH(e.base_, t) || t in e.base_
                ? ((e.assigned_[t] = !1), rZ(e), rV(e))
                : delete e.assigned_[t],
              e.copy_ && delete e.copy_[t],
              !0
            ),
            getOwnPropertyDescriptor(e, t) {
              let r = rN(e),
                n = Reflect.getOwnPropertyDescriptor(r, t);
              return n
                ? {
                    writable: !0,
                    configurable: 1 !== e.type_ || "length" !== t,
                    enumerable: n.enumerable,
                    value: r[t],
                  }
                : n;
            },
            defineProperty() {
              rp(11);
            },
            getPrototypeOf: (e) => ry(e.base_),
            setPrototypeOf() {
              rp(12);
            },
          },
          rW = {};
        function rH(e, t) {
          let r = e[rh],
            n = r ? rN(r) : e;
          return n[t];
        }
        function rq(e, t) {
          if (!(t in e)) return;
          let r = ry(e);
          for (; r; ) {
            let e = Object.getOwnPropertyDescriptor(r, t);
            if (e) return e;
            r = ry(r);
          }
        }
        function rV(e) {
          !e.modified_ && ((e.modified_ = !0), e.parent_ && rV(e.parent_));
        }
        function rZ(e) {
          e.copy_ ||
            (e.copy_ = rE(e.base_, e.scope_.immer_.useStrictShallowCopy_));
        }
        function rY(e, t) {
          let r = rS(e)
              ? rT("MapSet").proxyMap_(e, t)
              : rk(e)
                ? rT("MapSet").proxySet_(e, t)
                : (function (e, t) {
                    let r = Array.isArray(e),
                      n = {
                        type_: r ? 1 : 0,
                        scope_: t ? t.scope_ : sP,
                        modified_: !1,
                        finalized_: !1,
                        assigned_: {},
                        parent_: t,
                        base_: e,
                        draft_: null,
                        copy_: null,
                        revoke_: null,
                        isManual_: !1,
                      },
                      i = n,
                      a = rK;
                    r && ((i = [n]), (a = rW));
                    let { revoke: o, proxy: l } = Proxy.revocable(i, a);
                    return ((n.draft_ = l), (n.revoke_ = o), l);
                  })(e, t),
            n = t ? t.scope_ : sP;
          return (n.drafts_.push(r), r);
        }
        (rw(rK, (e, t) => {
          rW[e] = function () {
            return ((arguments[0] = arguments[0][0]), t.apply(this, arguments));
          };
        }),
          (rW.deleteProperty = function (e, t) {
            return rW.set.call(this, e, t, void 0);
          }),
          (rW.set = function (e, t, r) {
            return rK.set.call(this, e[0], t, r, e[0]);
          }),
          new (class {
            constructor(e) {
              ((this.autoFreeze_ = !0),
                (this.useStrictShallowCopy_ = !1),
                (this.useStrictIteration_ = !0),
                (this.produce = (e, t, r) => {
                  let n;
                  if ("function" == typeof e && "function" != typeof t) {
                    let r = t;
                    t = e;
                    let n = this;
                    return function (e = r, ...i) {
                      return n.produce(e, (e) => t.call(this, e, ...i));
                    };
                  }
                  if (
                    ("function" != typeof t && rp(6),
                    void 0 !== r && "function" != typeof r && rp(7),
                    rv(e))
                  ) {
                    let i = rL(this),
                      a = rY(e, void 0),
                      o = !0;
                    try {
                      ((n = t(a)), (o = !1));
                    } finally {
                      o ? rI(i) : rz(i);
                    }
                    return (rD(i, r), r$(n, i));
                  }
                  if (e && "object" == typeof e) rp(1, e);
                  else {
                    if (
                      (void 0 === (n = t(e)) && (n = e),
                      n === rd && (n = void 0),
                      this.autoFreeze_ && r_(n, !0),
                      r)
                    ) {
                      let t = [],
                        i = [];
                      (rT("Patches").generateReplacementPatches_(e, n, t, i),
                        r(t, i));
                    }
                    return n;
                  }
                }),
                (this.produceWithPatches = (e, t) => {
                  let r, n;
                  if ("function" == typeof e)
                    return (t, ...r) =>
                      this.produceWithPatches(t, (t) => e(t, ...r));
                  let i = this.produce(e, t, (e, t) => {
                    ((r = e), (n = t));
                  });
                  return [i, r, n];
                }),
                "boolean" == typeof e?.autoFreeze &&
                  this.setAutoFreeze(e.autoFreeze),
                "boolean" == typeof e?.useStrictShallowCopy &&
                  this.setUseStrictShallowCopy(e.useStrictShallowCopy),
                "boolean" == typeof e?.useStrictIteration &&
                  this.setUseStrictIteration(e.useStrictIteration));
            }
            createDraft(e) {
              var t;
              (rv(e) || rp(8),
                rm(e) &&
                  (rm((t = e)) || rp(10, t),
                  (e = (function e(t) {
                    let r;
                    if (!rv(t) || rM(t)) return t;
                    let n = t[rh],
                      i = !0;
                    if (n) {
                      if (!n.modified_) return n.base_;
                      ((n.finalized_ = !0),
                        (r = rE(t, n.scope_.immer_.useStrictShallowCopy_)),
                        (i = n.scope_.immer_.shouldUseStrictIteration()));
                    } else r = rE(t, !0);
                    return (
                      rw(
                        r,
                        (t, n) => {
                          rP(r, t, e(n));
                        },
                        i,
                      ),
                      n && (n.finalized_ = !1),
                      r
                    );
                  })(t))));
              let r = rL(this),
                n = rY(e, void 0);
              return ((n[rh].isManual_ = !0), rz(r), n);
            }
            finishDraft(e, t) {
              let r = e && e[rh];
              (r && r.isManual_) || rp(9);
              let { scope_: n } = r;
              return (rD(n, t), r$(void 0, n));
            }
            setAutoFreeze(e) {
              this.autoFreeze_ = e;
            }
            setUseStrictShallowCopy(e) {
              this.useStrictShallowCopy_ = e;
            }
            setUseStrictIteration(e) {
              this.useStrictIteration_ = e;
            }
            shouldUseStrictIteration() {
              return this.useStrictIteration_;
            }
            applyPatches(e, t) {
              let r;
              for (r = t.length - 1; r >= 0; r--) {
                let n = t[r];
                if (0 === n.path.length && "replace" === n.op) {
                  e = n.value;
                  break;
                }
              }
              r > -1 && (t = t.slice(r + 1));
              let n = rT("Patches").applyPatches_;
              return rm(e) ? n(e, t) : this.produce(e, (e) => n(e, t));
            }
          })().produce);
        var rG = {
            active: !1,
            index: null,
            dataKey: void 0,
            graphicalItemId: void 0,
            coordinate: void 0,
          },
          rX = tj({
            name: "tooltip",
            initialState: {
              itemInteraction: { click: rG, hover: rG },
              axisInteraction: { click: rG, hover: rG },
              keyboardInteraction: rG,
              syncInteraction: {
                active: !1,
                index: null,
                dataKey: void 0,
                label: void 0,
                coordinate: void 0,
                sourceViewBox: void 0,
                graphicalItemId: void 0,
              },
              tooltipItemPayloads: [],
              settings: {
                shared: void 0,
                trigger: "hover",
                axisId: 0,
                active: !1,
                defaultIndex: void 0,
              },
            },
            reducers: {
              addTooltipEntrySettings: {
                reducer(e, t) {
                  e.tooltipItemPayloads.push(t.payload);
                },
                prepare: tf(),
              },
              replaceTooltipEntrySettings: {
                reducer(e, t) {
                  var { prev: r, next: n } = t.payload,
                    i = e1(e).tooltipItemPayloads.indexOf(r);
                  i > -1 && (e.tooltipItemPayloads[i] = n);
                },
                prepare: tf(),
              },
              removeTooltipEntrySettings: {
                reducer(e, t) {
                  var r = e1(e).tooltipItemPayloads.indexOf(t.payload);
                  r > -1 && e.tooltipItemPayloads.splice(r, 1);
                },
                prepare: tf(),
              },
              setTooltipSettingsState(e, t) {
                e.settings = t.payload;
              },
              setActiveMouseOverItemIndex(e, t) {
                ((e.syncInteraction.active = !1),
                  (e.keyboardInteraction.active = !1),
                  (e.itemInteraction.hover.active = !0),
                  (e.itemInteraction.hover.index = t.payload.activeIndex),
                  (e.itemInteraction.hover.dataKey = t.payload.activeDataKey),
                  (e.itemInteraction.hover.graphicalItemId =
                    t.payload.activeGraphicalItemId),
                  (e.itemInteraction.hover.coordinate =
                    t.payload.activeCoordinate));
              },
              mouseLeaveChart(e) {
                ((e.itemInteraction.hover.active = !1),
                  (e.axisInteraction.hover.active = !1));
              },
              mouseLeaveItem(e) {
                e.itemInteraction.hover.active = !1;
              },
              setActiveClickItemIndex(e, t) {
                ((e.syncInteraction.active = !1),
                  (e.itemInteraction.click.active = !0),
                  (e.keyboardInteraction.active = !1),
                  (e.itemInteraction.click.index = t.payload.activeIndex),
                  (e.itemInteraction.click.dataKey = t.payload.activeDataKey),
                  (e.itemInteraction.click.graphicalItemId =
                    t.payload.activeGraphicalItemId),
                  (e.itemInteraction.click.coordinate =
                    t.payload.activeCoordinate));
              },
              setMouseOverAxisIndex(e, t) {
                ((e.syncInteraction.active = !1),
                  (e.axisInteraction.hover.active = !0),
                  (e.keyboardInteraction.active = !1),
                  (e.axisInteraction.hover.index = t.payload.activeIndex),
                  (e.axisInteraction.hover.dataKey = t.payload.activeDataKey),
                  (e.axisInteraction.hover.coordinate =
                    t.payload.activeCoordinate));
              },
              setMouseClickAxisIndex(e, t) {
                ((e.syncInteraction.active = !1),
                  (e.keyboardInteraction.active = !1),
                  (e.axisInteraction.click.active = !0),
                  (e.axisInteraction.click.index = t.payload.activeIndex),
                  (e.axisInteraction.click.dataKey = t.payload.activeDataKey),
                  (e.axisInteraction.click.coordinate =
                    t.payload.activeCoordinate));
              },
              setSyncInteraction(e, t) {
                e.syncInteraction = t.payload;
              },
              setKeyboardInteraction(e, t) {
                ((e.keyboardInteraction.active = t.payload.active),
                  (e.keyboardInteraction.index = t.payload.activeIndex),
                  (e.keyboardInteraction.coordinate =
                    t.payload.activeCoordinate),
                  (e.keyboardInteraction.dataKey = t.payload.activeDataKey));
              },
            },
          }),
          {
            addTooltipEntrySettings: rQ,
            replaceTooltipEntrySettings: rJ,
            removeTooltipEntrySettings: r0,
            setTooltipSettingsState: r1,
            setActiveMouseOverItemIndex: r2,
            mouseLeaveItem: r3,
            mouseLeaveChart: r6,
            setActiveClickItemIndex: r5,
            setMouseOverAxisIndex: r4,
            setMouseClickAxisIndex: r7,
            setSyncInteraction: r8,
            setKeyboardInteraction: r9,
          } = rX.actions,
          ne = rX.reducer,
          nt = tj({
            name: "chartData",
            initialState: {
              chartData: void 0,
              computedData: void 0,
              dataStartIndex: 0,
              dataEndIndex: 0,
            },
            reducers: {
              setChartData(e, t) {
                if (((e.chartData = t.payload), null == t.payload)) {
                  ((e.dataStartIndex = 0), (e.dataEndIndex = 0));
                  return;
                }
                t.payload.length > 0 &&
                  e.dataEndIndex !== t.payload.length - 1 &&
                  (e.dataEndIndex = t.payload.length - 1);
              },
              setComputedData(e, t) {
                e.computedData = t.payload;
              },
              setDataStartEndIndexes(e, t) {
                var { startIndex: r, endIndex: n } = t.payload;
                (null != r && (e.dataStartIndex = r),
                  null != n && (e.dataEndIndex = n));
              },
            },
          }),
          {
            setChartData: nr,
            setDataStartEndIndexes: nn,
            setComputedData: ni,
          } = nt.actions,
          na = nt.reducer,
          no = tj({
            name: "chartLayout",
            initialState: {
              layoutType: "horizontal",
              width: 0,
              height: 0,
              margin: { top: 5, right: 5, bottom: 5, left: 5 },
              scale: 1,
            },
            reducers: {
              setLayout(e, t) {
                e.layoutType = t.payload;
              },
              setChartSize(e, t) {
                ((e.width = t.payload.width), (e.height = t.payload.height));
              },
              setMargin(e, t) {
                var r, n, i, a;
                ((e.margin.top =
                  null !== (r = t.payload.top) && void 0 !== r ? r : 0),
                  (e.margin.right =
                    null !== (n = t.payload.right) && void 0 !== n ? n : 0),
                  (e.margin.bottom =
                    null !== (i = t.payload.bottom) && void 0 !== i ? i : 0),
                  (e.margin.left =
                    null !== (a = t.payload.left) && void 0 !== a ? a : 0));
              },
              setScale(e, t) {
                e.scale = t.payload;
              },
            },
          }),
          {
            setMargin: nl,
            setLayout: ns,
            setChartSize: nc,
            setScale: nu,
          } = no.actions,
          nd = no.reducer,
          nf = (e) => (Array.isArray(e) ? e : [e]),
          nh = 0,
          np = class {
            constructor(e, t = ny) {
              ((this.revision = nh),
                (this._isEqual = ny),
                (this._value = this._lastValue = e),
                (this._isEqual = t));
            }
            get value() {
              return this._value;
            }
            set value(e) {
              this.value !== e && ((this._value = e), (this.revision = ++nh));
            }
          };
        function ny(e, t) {
          return e === t;
        }
        function nm(e) {
          return (
            e instanceof np || console.warn("Not a valid cell! ", e),
            e.value
          );
        }
        var nv = (e, t) => !1;
        function ng() {
          return (function (e, t = ny) {
            return new np(null, t);
          })(0, nv);
        }
        var nb = (e) => {
          let t = e.collectionTag;
          (null === t && (t = e.collectionTag = ng()), nm(t));
        };
        Symbol();
        var nx = 0,
          nw = Object.getPrototypeOf({}),
          nj = class {
            constructor(e) {
              ((this.proxy = new Proxy(this, nO)),
                (this.tag = ng()),
                (this.tags = {}),
                (this.children = {}),
                (this.collectionTag = null),
                (this.id = nx++),
                (this.value = e),
                (this.value = e),
                (this.tag.value = e));
            }
          },
          nO = {
            get(e, t) {
              let r = (function () {
                let { value: r } = e,
                  n = Reflect.get(r, t);
                if ("symbol" == typeof t || t in nw) return n;
                if ("object" == typeof n && null !== n) {
                  var i;
                  let r = e.children[t];
                  return (
                    void 0 === r &&
                      (r = e.children[t] =
                        Array.isArray((i = n)) ? new nP(i) : new nj(i)),
                    r.tag && nm(r.tag),
                    r.proxy
                  );
                }
                {
                  let r = e.tags[t];
                  return (
                    void 0 === r && ((r = e.tags[t] = ng()).value = n),
                    nm(r),
                    n
                  );
                }
              })();
              return r;
            },
            ownKeys: (e) => (nb(e), Reflect.ownKeys(e.value)),
            getOwnPropertyDescriptor: (e, t) =>
              Reflect.getOwnPropertyDescriptor(e.value, t),
            has: (e, t) => Reflect.has(e.value, t),
          },
          nP = class {
            constructor(e) {
              ((this.proxy = new Proxy([this], nS)),
                (this.tag = ng()),
                (this.tags = {}),
                (this.children = {}),
                (this.collectionTag = null),
                (this.id = nx++),
                (this.value = e),
                (this.value = e),
                (this.tag.value = e));
            }
          },
          nS = {
            get: ([e], t) => ("length" === t && nb(e), nO.get(e, t)),
            ownKeys: ([e]) => nO.ownKeys(e),
            getOwnPropertyDescriptor: ([e], t) =>
              nO.getOwnPropertyDescriptor(e, t),
            has: ([e], t) => nO.has(e, t),
          },
          nk =
            "undefined" != typeof WeakRef
              ? WeakRef
              : class {
                  constructor(e) {
                    this.value = e;
                  }
                  deref() {
                    return this.value;
                  }
                };
        function nN() {
          return { s: 0, v: void 0, o: null, p: null };
        }
        function nE(e, t = {}) {
          let r,
            n = nN(),
            { resultEqualityCheck: i } = t,
            a = 0;
          function o() {
            let t,
              o = n,
              { length: l } = arguments;
            for (let e = 0; e < l; e++) {
              let t = arguments[e];
              if (
                "function" == typeof t ||
                ("object" == typeof t && null !== t)
              ) {
                let e = o.o;
                null === e && (o.o = e = new WeakMap());
                let r = e.get(t);
                void 0 === r ? ((o = nN()), e.set(t, o)) : (o = r);
              } else {
                let e = o.p;
                null === e && (o.p = e = new Map());
                let r = e.get(t);
                void 0 === r ? ((o = nN()), e.set(t, o)) : (o = r);
              }
            }
            let s = o;
            if (1 === o.s) t = o.v;
            else if (((t = e.apply(null, arguments)), a++, i)) {
              let e = r?.deref?.() ?? r;
              null != e && i(e, t) && ((t = e), 0 !== a && a--);
              let n =
                ("object" == typeof t && null !== t) || "function" == typeof t;
              r = n ? new nk(t) : t;
            }
            return ((s.s = 1), (s.v = t), t);
          }
          return (
            (o.clearCache = () => {
              ((n = nN()), o.resetResultsCount());
            }),
            (o.resultsCount = () => a),
            (o.resetResultsCount = () => {
              a = 0;
            }),
            o
          );
        }
        var n_ = (function (e, ...t) {
            let r =
                "function" == typeof e ? { memoize: e, memoizeOptions: t } : e,
              n = (...e) => {
                let t,
                  n = 0,
                  i = 0,
                  a = {},
                  o = e.pop();
                ("object" == typeof o && ((a = o), (o = e.pop())),
                  (function (
                    e,
                    t = `expected a function, instead received ${typeof e}`,
                  ) {
                    if ("function" != typeof e) throw TypeError(t);
                  })(
                    o,
                    `createSelector expects an output function after the inputs, but received: [${typeof o}]`,
                  ));
                let l = { ...r, ...a },
                  {
                    memoize: s,
                    memoizeOptions: c = [],
                    argsMemoize: u = nE,
                    argsMemoizeOptions: d = [],
                    devModeChecks: f = {},
                  } = l,
                  h = nf(c),
                  p = nf(d),
                  y = (function (e) {
                    let t = Array.isArray(e[0]) ? e[0] : e;
                    return (
                      (function (
                        e,
                        t = "expected all items to be functions, instead received the following types: ",
                      ) {
                        if (!e.every((e) => "function" == typeof e)) {
                          let r = e
                            .map((e) =>
                              "function" == typeof e
                                ? `function ${e.name || "unnamed"}()`
                                : typeof e,
                            )
                            .join(", ");
                          throw TypeError(`${t}[${r}]`);
                        }
                      })(
                        t,
                        "createSelector expects all input-selectors to be functions, but received the following types: ",
                      ),
                      t
                    );
                  })(e),
                  m = s(
                    function () {
                      return (n++, o.apply(null, arguments));
                    },
                    ...h,
                  ),
                  v = u(
                    function () {
                      i++;
                      let e = (function (e, t) {
                        let r = [],
                          { length: n } = e;
                        for (let i = 0; i < n; i++) r.push(e[i].apply(null, t));
                        return r;
                      })(y, arguments);
                      return (t = m.apply(null, e));
                    },
                    ...p,
                  );
                return Object.assign(v, {
                  resultFunc: o,
                  memoizedResultFunc: m,
                  dependencies: y,
                  dependencyRecomputations: () => i,
                  resetDependencyRecomputations: () => {
                    i = 0;
                  },
                  lastResult: () => t,
                  recomputations: () => n,
                  resetRecomputations: () => {
                    n = 0;
                  },
                  memoize: s,
                  argsMemoize: u,
                });
              };
            return (Object.assign(n, { withTypes: () => n }), n);
          })(nE),
          nA = Object.assign(
            (e, t = n_) => {
              !(function (
                e,
                t = `expected an object, instead received ${typeof e}`,
              ) {
                if ("object" != typeof e) throw TypeError(t);
              })(
                e,
                `createStructuredSelector expects first argument to be an object where each property is a selector, instead received a ${typeof e}`,
              );
              let r = Object.keys(e),
                n = r.map((t) => e[t]),
                i = t(n, (...e) =>
                  e.reduce((e, t, n) => ((e[r[n]] = t), e), {}),
                );
              return i;
            },
            { withTypes: () => nA },
          ),
          nM = r(92337),
          nC = (0, l.createContext)(null),
          nT = (e) => e,
          nD = () => {
            var e = (0, l.useContext)(nC);
            return e ? e.store.dispatch : nT;
          },
          nI = () => {},
          nz = () => nI,
          nL = (e, t) => e === t;
        function nR(e) {
          var t = (0, l.useContext)(nC);
          return (0, nM.useSyncExternalStoreWithSelector)(
            t ? t.subscription.addNestedSub : nz,
            t ? t.store.getState : nI,
            t ? t.store.getState : nI,
            t ? e : nI,
            nL,
          );
        }
        var n$ = r(67672),
          nU = r.n(n$),
          nF = (e) => e.legend.settings,
          nB = n_([(e) => e.legend.payload, nF], (e, t) => {
            var { itemSorter: r } = t,
              n = e.flat(1);
            return r ? nU()(n, r) : n;
          });
        function nK(e, t) {
          if ((i = e.length) > 1)
            for (var r, n, i, a = 1, o = e[t[0]], l = o.length; a < i; ++a)
              for (n = o, o = e[t[a]], r = 0; r < l; ++r)
                o[r][1] += o[r][0] = isNaN(n[r][1]) ? n[r][0] : n[r][1];
        }
        function nW(e) {
          return "object" == typeof e && "length" in e ? e : Array.from(e);
        }
        function nH(e) {
          return function () {
            return e;
          };
        }
        function nq(e) {
          for (var t = e.length, r = Array(t); --t >= 0; ) r[t] = t;
          return r;
        }
        function nV(e, t) {
          return e[t];
        }
        function nZ(e) {
          let t = [];
          return ((t.key = e), t);
        }
        function nY(e, t, r) {
          return Array.isArray(e) && e && t + r !== 0 ? e.slice(t, r + 1) : e;
        }
        function nG(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function nX(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? nG(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : nG(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function nQ(e, t, r) {
          return N(e) || N(t)
            ? r
            : x(t)
              ? y()(e, t, r)
              : "function" == typeof t
                ? t(e)
                : r;
        }
        Array.prototype.slice;
        var nJ = (e, t, r) => {
            if (t && r) {
              var { width: n, height: i } = r,
                { align: a, verticalAlign: o, layout: l } = t;
              if (
                ("vertical" === l || ("horizontal" === l && "middle" === o)) &&
                "center" !== a &&
                b(e[a])
              )
                return nX(nX({}, e), {}, { [a]: e[a] + (n || 0) });
              if (
                ("horizontal" === l || ("vertical" === l && "center" === a)) &&
                "middle" !== o &&
                b(e[o])
              )
                return nX(nX({}, e), {}, { [o]: e[o] + (i || 0) });
            }
            return e;
          },
          n0 = (e, t) =>
            ("horizontal" === e && "xAxis" === t) ||
            ("vertical" === e && "yAxis" === t) ||
            ("centric" === e && "angleAxis" === t) ||
            ("radial" === e && "radiusAxis" === t),
          n1 = (e, t, r, n) => {
            if (n) return e.map((e) => e.coordinate);
            var i,
              a,
              o = e.map(
                (e) => (
                  e.coordinate === t && (i = !0),
                  e.coordinate === r && (a = !0),
                  e.coordinate
                ),
              );
            return (i || o.push(t), a || o.push(r), o);
          },
          n2 = (e, t, r) => {
            if (!e) return null;
            var {
              duplicateDomain: n,
              type: i,
              range: a,
              scale: o,
              realScaleType: l,
              isCategorical: s,
              categoricalDomain: c,
              tickCount: u,
              ticks: d,
              niceTicks: f,
              axisType: h,
            } = e;
            if (!o) return null;
            var p = "scaleBand" === l && o.bandwidth ? o.bandwidth() / 2 : 2,
              y =
                (t || r) && "category" === i && o.bandwidth
                  ? o.bandwidth() / p
                  : 0;
            return ((y =
              "angleAxis" === h && a && a.length >= 2
                ? 2 * m(a[0] - a[1]) * y
                : y),
            t && (d || f))
              ? (d || f || [])
                  .map((e, t) => ({
                    coordinate: o(n ? n.indexOf(e) : e) + y,
                    value: e,
                    offset: y,
                    index: t,
                  }))
                  .filter((e) => !v(e.coordinate))
              : s && c
                ? c.map((e, t) => ({
                    coordinate: o(e) + y,
                    value: e,
                    index: t,
                    offset: y,
                  }))
                : o.ticks && !r && null != u
                  ? o
                      .ticks(u)
                      .map((e, t) => ({
                        coordinate: o(e) + y,
                        value: e,
                        offset: y,
                        index: t,
                      }))
                  : o
                      .domain()
                      .map((e, t) => ({
                        coordinate: o(e) + y,
                        value: n ? n[e] : e,
                        index: t,
                        offset: y,
                      }));
          },
          n3 = (e) => {
            var t = e.domain();
            if (t && !(t.length <= 2)) {
              var r = t.length,
                n = e.range(),
                i = Math.min(n[0], n[1]) - 1e-4,
                a = Math.max(n[0], n[1]) + 1e-4,
                o = e(t[0]),
                l = e(t[r - 1]);
              (o < i || o > a || l < i || l > a) && e.domain([t[0], t[r - 1]]);
            }
          },
          n6 = {
            sign: (e) => {
              var t = e.length;
              if (!(t <= 0))
                for (var r = 0, n = e[0].length; r < n; ++r)
                  for (var i = 0, a = 0, o = 0; o < t; ++o) {
                    var l = v(e[o][r][1]) ? e[o][r][0] : e[o][r][1];
                    l >= 0
                      ? ((e[o][r][0] = i),
                        (e[o][r][1] = i + l),
                        (i = e[o][r][1]))
                      : ((e[o][r][0] = a),
                        (e[o][r][1] = a + l),
                        (a = e[o][r][1]));
                  }
            },
            expand: function (e, t) {
              if ((n = e.length) > 0) {
                for (var r, n, i, a = 0, o = e[0].length; a < o; ++a) {
                  for (i = r = 0; r < n; ++r) i += e[r][a][1] || 0;
                  if (i) for (r = 0; r < n; ++r) e[r][a][1] /= i;
                }
                nK(e, t);
              }
            },
            none: nK,
            silhouette: function (e, t) {
              if ((r = e.length) > 0) {
                for (var r, n = 0, i = e[t[0]], a = i.length; n < a; ++n) {
                  for (var o = 0, l = 0; o < r; ++o) l += e[o][n][1] || 0;
                  i[n][1] += i[n][0] = -l / 2;
                }
                nK(e, t);
              }
            },
            wiggle: function (e, t) {
              if ((i = e.length) > 0 && (n = (r = e[t[0]]).length) > 0) {
                for (var r, n, i, a = 0, o = 1; o < n; ++o) {
                  for (var l = 0, s = 0, c = 0; l < i; ++l) {
                    for (
                      var u = e[t[l]],
                        d = u[o][1] || 0,
                        f = (d - (u[o - 1][1] || 0)) / 2,
                        h = 0;
                      h < l;
                      ++h
                    ) {
                      var p = e[t[h]];
                      f += (p[o][1] || 0) - (p[o - 1][1] || 0);
                    }
                    ((s += d), (c += f * d));
                  }
                  ((r[o - 1][1] += r[o - 1][0] = a), s && (a -= c / s));
                }
                ((r[o - 1][1] += r[o - 1][0] = a), nK(e, t));
              }
            },
            positive: (e) => {
              var t = e.length;
              if (!(t <= 0))
                for (var r = 0, n = e[0].length; r < n; ++r)
                  for (var i = 0, a = 0; a < t; ++a) {
                    var o = v(e[a][r][1]) ? e[a][r][0] : e[a][r][1];
                    o >= 0
                      ? ((e[a][r][0] = i),
                        (e[a][r][1] = i + o),
                        (i = e[a][r][1]))
                      : ((e[a][r][0] = 0), (e[a][r][1] = 0));
                  }
            },
          },
          n5 = (e, t, r) => {
            var n = n6[r];
            return (function () {
              var e = nH([]),
                t = nq,
                r = nK,
                n = nV;
              function i(i) {
                var a,
                  o,
                  l = Array.from(e.apply(this, arguments), nZ),
                  s = l.length,
                  c = -1;
                for (let e of i)
                  for (a = 0, ++c; a < s; ++a)
                    (l[a][c] = [0, +n(e, l[a].key, c, i)]).data = e;
                for (a = 0, o = nW(t(l)); a < s; ++a) l[o[a]].index = a;
                return (r(l, o), l);
              }
              return (
                (i.keys = function (t) {
                  return arguments.length
                    ? ((e = "function" == typeof t ? t : nH(Array.from(t))), i)
                    : e;
                }),
                (i.value = function (e) {
                  return arguments.length
                    ? ((n = "function" == typeof e ? e : nH(+e)), i)
                    : n;
                }),
                (i.order = function (e) {
                  return arguments.length
                    ? ((t =
                        null == e
                          ? nq
                          : "function" == typeof e
                            ? e
                            : nH(Array.from(e))),
                      i)
                    : t;
                }),
                (i.offset = function (e) {
                  return arguments.length ? ((r = null == e ? nK : e), i) : r;
                }),
                i
              );
            })()
              .keys(t)
              .value((e, t) => Number(nQ(e, t, 0)))
              .order(nq)
              .offset(n)(e);
          };
        function n4(e) {
          var {
            axis: t,
            ticks: r,
            bandSize: n,
            entry: i,
            index: a,
            dataKey: o,
          } = e;
          if ("category" === t.type) {
            if (!t.allowDuplicatedCategory && t.dataKey && !N(i[t.dataKey])) {
              var l = k(r, "value", i[t.dataKey]);
              if (l) return l.coordinate + n / 2;
            }
            return r[a] ? r[a].coordinate + n / 2 : null;
          }
          var s = nQ(i, N(o) ? t.dataKey : o);
          return N(s) ? null : t.scale(s);
        }
        var n7 = (e) => {
            var t = e.flat(2).filter(b);
            return [Math.min(...t), Math.max(...t)];
          },
          n8 = (e) => [e[0] === 1 / 0 ? 0 : e[0], e[1] === -1 / 0 ? 0 : e[1]],
          n9 = (e, t, r) => {
            if (null != e)
              return n8(
                Object.keys(e).reduce(
                  (n, i) => {
                    var { stackedData: a } = e[i],
                      o = a.reduce(
                        (e, n) => {
                          var i = n7(nY(n, t, r));
                          return [Math.min(e[0], i[0]), Math.max(e[1], i[1])];
                        },
                        [1 / 0, -1 / 0],
                      );
                    return [Math.min(o[0], n[0]), Math.max(o[1], n[1])];
                  },
                  [1 / 0, -1 / 0],
                ),
              );
          },
          ie = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/,
          it = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/,
          ir = (e, t, r) => {
            if (e && e.scale && e.scale.bandwidth) {
              var n = e.scale.bandwidth();
              if (!r || n > 0) return n;
            }
            if (e && t && t.length >= 2) {
              for (
                var i = nU()(t, (e) => e.coordinate),
                  a = 1 / 0,
                  o = 1,
                  l = i.length;
                o < l;
                o++
              ) {
                var s = i[o],
                  c = i[o - 1];
                a = Math.min((s.coordinate || 0) - (c.coordinate || 0), a);
              }
              return a === 1 / 0 ? 0 : a;
            }
            return r ? void 0 : 0;
          };
        function ii(e) {
          var {
            tooltipEntrySettings: t,
            dataKey: r,
            payload: n,
            value: i,
            name: a,
          } = e;
          return nX(
            nX({}, t),
            {},
            { dataKey: r, payload: n, value: i, name: a },
          );
        }
        function ia(e, t) {
          return e ? String(e) : "string" == typeof t ? t : void 0;
        }
        var io = (e, t) =>
            "horizontal" === t
              ? e.chartX
              : "vertical" === t
                ? e.chartY
                : void 0,
          il = (e, t) => ("centric" === t ? e.angle : e.radius),
          is = (e) => e.layout.width,
          ic = (e) => e.layout.height,
          iu = (e) => e.layout.scale,
          id = (e) => e.layout.margin,
          ih = n_(
            (e) => e.cartesianAxis.xAxis,
            (e) => Object.values(e),
          ),
          ip = n_(
            (e) => e.cartesianAxis.yAxis,
            (e) => Object.values(e),
          );
        function iy(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function im(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? iy(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : iy(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var iv = n_(
            [
              is,
              ic,
              id,
              (e) => e.brush.height,
              function (e) {
                return ip(e).reduce(
                  (e, t) =>
                    "left" !== t.orientation || t.mirror || t.hide
                      ? e
                      : e + ("number" == typeof t.width ? t.width : 60),
                  0,
                );
              },
              function (e) {
                return ip(e).reduce(
                  (e, t) =>
                    "right" !== t.orientation || t.mirror || t.hide
                      ? e
                      : e + ("number" == typeof t.width ? t.width : 60),
                  0,
                );
              },
              function (e) {
                return ih(e).reduce(
                  (e, t) =>
                    "top" !== t.orientation || t.mirror || t.hide
                      ? e
                      : e + t.height,
                  0,
                );
              },
              function (e) {
                return ih(e).reduce(
                  (e, t) =>
                    "bottom" !== t.orientation || t.mirror || t.hide
                      ? e
                      : e + t.height,
                  0,
                );
              },
              nF,
              (e) => e.legend.size,
            ],
            (e, t, r, n, i, a, o, l, s, c) => {
              var u = { left: (r.left || 0) + i, right: (r.right || 0) + a },
                d = im(
                  im(
                    {},
                    { top: (r.top || 0) + o, bottom: (r.bottom || 0) + l },
                  ),
                  u,
                ),
                f = d.bottom;
              d.bottom += n;
              var h = e - (d = nJ(d, s, c)).left - d.right,
                p = t - d.top - d.bottom;
              return im(
                im({ brushBottom: f }, d),
                {},
                { width: Math.max(h, 0), height: Math.max(p, 0) },
              );
            },
          ),
          ig = n_(iv, (e) => ({
            x: e.left,
            y: e.top,
            width: e.width,
            height: e.height,
          })),
          ib = n_(is, ic, (e, t) => ({ x: 0, y: 0, width: e, height: t })),
          ix = (0, l.createContext)(null),
          iw = () => null != (0, l.useContext)(ix),
          ij = (e) => e.brush,
          iO = n_([ij, iv, id], (e, t, r) => ({
            height: e.height,
            x: b(e.x) ? e.x : t.left,
            y: b(e.y)
              ? e.y
              : t.top +
                t.height +
                t.brushBottom -
                ((null == r ? void 0 : r.bottom) || 0),
            width: b(e.width) ? e.width : t.width,
          }));
        function iP(e) {
          if (e)
            return {
              x: e.x,
              y: e.y,
              upperWidth: "upperWidth" in e ? e.upperWidth : e.width,
              lowerWidth: "lowerWidth" in e ? e.lowerWidth : e.width,
              width: e.width,
              height: e.height,
            };
        }
        var iS = () => {
            var e,
              t = iw(),
              r = nR(ig),
              n = nR(iO),
              i = null === (e = nR(ij)) || void 0 === e ? void 0 : e.padding;
            return t && n && i
              ? {
                  width: n.width - i.left - i.right,
                  height: n.height - i.top - i.bottom,
                  x: i.left,
                  y: i.top,
                }
              : r;
          },
          ik = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: 0,
            height: 0,
            brushBottom: 0,
          },
          iN = () => {
            var e;
            return null !== (e = nR(iv)) && void 0 !== e ? e : ik;
          },
          iE = () => nR(is),
          i_ = () => nR(ic),
          iA = () => nR((e) => e.layout.margin),
          iM = (e) => e.layout.layoutType,
          iC = () => nR(iM),
          iT = () => void 0 !== iC(),
          iD = (e) => {
            var t = nD(),
              r = iw(),
              { width: n, height: i } = e,
              a = H(),
              o = n,
              s = i;
            return (
              a &&
                ((o = a.width > 0 ? a.width : n),
                (s = a.height > 0 ? a.height : i)),
              (0, l.useEffect)(() => {
                !r && $(o) && $(s) && t(nc({ width: o, height: s }));
              }, [t, r, o, s]),
              null
            );
          },
          iI = r(26464),
          iz = r.n(iI);
        function iL(e, t) {
          switch (arguments.length) {
            case 0:
              break;
            case 1:
              this.range(e);
              break;
            default:
              this.range(t).domain(e);
          }
          return this;
        }
        function iR(e, t) {
          switch (arguments.length) {
            case 0:
              break;
            case 1:
              "function" == typeof e ? this.interpolator(e) : this.range(e);
              break;
            default:
              (this.domain(e),
                "function" == typeof t ? this.interpolator(t) : this.range(t));
          }
          return this;
        }
        class i$ extends Map {
          constructor(e, t = iF) {
            if (
              (super(),
              Object.defineProperties(this, {
                _intern: { value: new Map() },
                _key: { value: t },
              }),
              null != e)
            )
              for (let [t, r] of e) this.set(t, r);
          }
          get(e) {
            return super.get(iU(this, e));
          }
          has(e) {
            return super.has(iU(this, e));
          }
          set(e, t) {
            return super.set(
              (function ({ _intern: e, _key: t }, r) {
                let n = t(r);
                return e.has(n) ? e.get(n) : (e.set(n, r), r);
              })(this, e),
              t,
            );
          }
          delete(e) {
            return super.delete(
              (function ({ _intern: e, _key: t }, r) {
                let n = t(r);
                return (e.has(n) && ((r = e.get(n)), e.delete(n)), r);
              })(this, e),
            );
          }
        }
        function iU({ _intern: e, _key: t }, r) {
          let n = t(r);
          return e.has(n) ? e.get(n) : r;
        }
        function iF(e) {
          return null !== e && "object" == typeof e ? e.valueOf() : e;
        }
        let iB = Symbol("implicit");
        function iK() {
          var e = new i$(),
            t = [],
            r = [],
            n = iB;
          function i(i) {
            let a = e.get(i);
            if (void 0 === a) {
              if (n !== iB) return n;
              e.set(i, (a = t.push(i) - 1));
            }
            return r[a % r.length];
          }
          return (
            (i.domain = function (r) {
              if (!arguments.length) return t.slice();
              for (let n of ((t = []), (e = new i$()), r))
                e.has(n) || e.set(n, t.push(n) - 1);
              return i;
            }),
            (i.range = function (e) {
              return arguments.length ? ((r = Array.from(e)), i) : r.slice();
            }),
            (i.unknown = function (e) {
              return arguments.length ? ((n = e), i) : n;
            }),
            (i.copy = function () {
              return iK(t, r).unknown(n);
            }),
            iL.apply(i, arguments),
            i
          );
        }
        function iW() {
          var e,
            t,
            r = iK().unknown(void 0),
            n = r.domain,
            i = r.range,
            a = 0,
            o = 1,
            l = !1,
            s = 0,
            c = 0,
            u = 0.5;
          function d() {
            var r = n().length,
              d = o < a,
              f = d ? o : a,
              h = d ? a : o;
            ((e = (h - f) / Math.max(1, r - s + 2 * c)),
              l && (e = Math.floor(e)),
              (f += (h - f - e * (r - s)) * u),
              (t = e * (1 - s)),
              l && ((f = Math.round(f)), (t = Math.round(t))));
            var p = (function (e, t, r) {
              ((e = +e),
                (t = +t),
                (r =
                  (i = arguments.length) < 2
                    ? ((t = e), (e = 0), 1)
                    : i < 3
                      ? 1
                      : +r));
              for (
                var n = -1,
                  i = 0 | Math.max(0, Math.ceil((t - e) / r)),
                  a = Array(i);
                ++n < i;
              )
                a[n] = e + n * r;
              return a;
            })(r).map(function (t) {
              return f + e * t;
            });
            return i(d ? p.reverse() : p);
          }
          return (
            delete r.unknown,
            (r.domain = function (e) {
              return arguments.length ? (n(e), d()) : n();
            }),
            (r.range = function (e) {
              return arguments.length
                ? (([a, o] = e), (a = +a), (o = +o), d())
                : [a, o];
            }),
            (r.rangeRound = function (e) {
              return (([a, o] = e), (a = +a), (o = +o), (l = !0), d());
            }),
            (r.bandwidth = function () {
              return t;
            }),
            (r.step = function () {
              return e;
            }),
            (r.round = function (e) {
              return arguments.length ? ((l = !!e), d()) : l;
            }),
            (r.padding = function (e) {
              return arguments.length ? ((s = Math.min(1, (c = +e))), d()) : s;
            }),
            (r.paddingInner = function (e) {
              return arguments.length ? ((s = Math.min(1, e)), d()) : s;
            }),
            (r.paddingOuter = function (e) {
              return arguments.length ? ((c = +e), d()) : c;
            }),
            (r.align = function (e) {
              return arguments.length
                ? ((u = Math.max(0, Math.min(1, e))), d())
                : u;
            }),
            (r.copy = function () {
              return iW(n(), [a, o])
                .round(l)
                .paddingInner(s)
                .paddingOuter(c)
                .align(u);
            }),
            iL.apply(d(), arguments)
          );
        }
        function iH() {
          return (function e(t) {
            var r = t.copy;
            return (
              (t.padding = t.paddingOuter),
              delete t.paddingInner,
              delete t.paddingOuter,
              (t.copy = function () {
                return e(r());
              }),
              t
            );
          })(iW.apply(null, arguments).paddingInner(1));
        }
        let iq = Math.sqrt(50),
          iV = Math.sqrt(10),
          iZ = Math.sqrt(2);
        function iY(e, t, r) {
          let n, i, a;
          let o = (t - e) / Math.max(0, r),
            l = Math.floor(Math.log10(o)),
            s = o / Math.pow(10, l),
            c = s >= iq ? 10 : s >= iV ? 5 : s >= iZ ? 2 : 1;
          return (l < 0
            ? ((n = Math.round(e * (a = Math.pow(10, -l) / c))),
              (i = Math.round(t * a)),
              n / a < e && ++n,
              i / a > t && --i,
              (a = -a))
            : ((n = Math.round(e / (a = Math.pow(10, l) * c))),
              (i = Math.round(t / a)),
              n * a < e && ++n,
              i * a > t && --i),
          i < n && 0.5 <= r && r < 2)
            ? iY(e, t, 2 * r)
            : [n, i, a];
        }
        function iG(e, t, r) {
          if (((t = +t), (e = +e), !((r = +r) > 0))) return [];
          if (e === t) return [e];
          let n = t < e,
            [i, a, o] = n ? iY(t, e, r) : iY(e, t, r);
          if (!(a >= i)) return [];
          let l = a - i + 1,
            s = Array(l);
          if (n) {
            if (o < 0) for (let e = 0; e < l; ++e) s[e] = -((a - e) / o);
            else for (let e = 0; e < l; ++e) s[e] = (a - e) * o;
          } else if (o < 0) for (let e = 0; e < l; ++e) s[e] = -((i + e) / o);
          else for (let e = 0; e < l; ++e) s[e] = (i + e) * o;
          return s;
        }
        function iX(e, t, r) {
          return iY((e = +e), (t = +t), (r = +r))[2];
        }
        function iQ(e, t, r) {
          ((t = +t), (e = +e), (r = +r));
          let n = t < e,
            i = n ? iX(t, e, r) : iX(e, t, r);
          return (n ? -1 : 1) * (i < 0 ? -(1 / i) : i);
        }
        function iJ(e, t) {
          return null == e || null == t
            ? NaN
            : e < t
              ? -1
              : e > t
                ? 1
                : e >= t
                  ? 0
                  : NaN;
        }
        function i0(e, t) {
          return null == e || null == t
            ? NaN
            : t < e
              ? -1
              : t > e
                ? 1
                : t >= e
                  ? 0
                  : NaN;
        }
        function i1(e) {
          let t, r, n;
          function i(e, n, i = 0, a = e.length) {
            if (i < a) {
              if (0 !== t(n, n)) return a;
              do {
                let t = (i + a) >>> 1;
                0 > r(e[t], n) ? (i = t + 1) : (a = t);
              } while (i < a);
            }
            return i;
          }
          return (
            2 !== e.length
              ? ((t = iJ),
                (r = (t, r) => iJ(e(t), r)),
                (n = (t, r) => e(t) - r))
              : ((t = e === iJ || e === i0 ? e : i2), (r = e), (n = e)),
            {
              left: i,
              center: function (e, t, r = 0, a = e.length) {
                let o = i(e, t, r, a - 1);
                return o > r && n(e[o - 1], t) > -n(e[o], t) ? o - 1 : o;
              },
              right: function (e, n, i = 0, a = e.length) {
                if (i < a) {
                  if (0 !== t(n, n)) return a;
                  do {
                    let t = (i + a) >>> 1;
                    0 >= r(e[t], n) ? (i = t + 1) : (a = t);
                  } while (i < a);
                }
                return i;
              },
            }
          );
        }
        function i2() {
          return 0;
        }
        function i3(e) {
          return null === e ? NaN : +e;
        }
        let i6 = i1(iJ),
          i5 = i6.right;
        function i4(e, t, r) {
          ((e.prototype = t.prototype = r), (r.constructor = e));
        }
        function i7(e, t) {
          var r = Object.create(e.prototype);
          for (var n in t) r[n] = t[n];
          return r;
        }
        function i8() {}
        (i6.left, i1(i3).center);
        var i9 = "\\s*([+-]?\\d+)\\s*",
          ae = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",
          at = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
          ar = /^#([0-9a-f]{3,8})$/,
          an = RegExp(`^rgb\\(${i9},${i9},${i9}\\)$`),
          ai = RegExp(`^rgb\\(${at},${at},${at}\\)$`),
          aa = RegExp(`^rgba\\(${i9},${i9},${i9},${ae}\\)$`),
          ao = RegExp(`^rgba\\(${at},${at},${at},${ae}\\)$`),
          al = RegExp(`^hsl\\(${ae},${at},${at}\\)$`),
          as = RegExp(`^hsla\\(${ae},${at},${at},${ae}\\)$`),
          ac = {
            aliceblue: 15792383,
            antiquewhite: 16444375,
            aqua: 65535,
            aquamarine: 8388564,
            azure: 15794175,
            beige: 16119260,
            bisque: 16770244,
            black: 0,
            blanchedalmond: 16772045,
            blue: 255,
            blueviolet: 9055202,
            brown: 10824234,
            burlywood: 14596231,
            cadetblue: 6266528,
            chartreuse: 8388352,
            chocolate: 13789470,
            coral: 16744272,
            cornflowerblue: 6591981,
            cornsilk: 16775388,
            crimson: 14423100,
            cyan: 65535,
            darkblue: 139,
            darkcyan: 35723,
            darkgoldenrod: 12092939,
            darkgray: 11119017,
            darkgreen: 25600,
            darkgrey: 11119017,
            darkkhaki: 12433259,
            darkmagenta: 9109643,
            darkolivegreen: 5597999,
            darkorange: 16747520,
            darkorchid: 10040012,
            darkred: 9109504,
            darksalmon: 15308410,
            darkseagreen: 9419919,
            darkslateblue: 4734347,
            darkslategray: 3100495,
            darkslategrey: 3100495,
            darkturquoise: 52945,
            darkviolet: 9699539,
            deeppink: 16716947,
            deepskyblue: 49151,
            dimgray: 6908265,
            dimgrey: 6908265,
            dodgerblue: 2003199,
            firebrick: 11674146,
            floralwhite: 16775920,
            forestgreen: 2263842,
            fuchsia: 16711935,
            gainsboro: 14474460,
            ghostwhite: 16316671,
            gold: 16766720,
            goldenrod: 14329120,
            gray: 8421504,
            green: 32768,
            greenyellow: 11403055,
            grey: 8421504,
            honeydew: 15794160,
            hotpink: 16738740,
            indianred: 13458524,
            indigo: 4915330,
            ivory: 16777200,
            khaki: 15787660,
            lavender: 15132410,
            lavenderblush: 16773365,
            lawngreen: 8190976,
            lemonchiffon: 16775885,
            lightblue: 11393254,
            lightcoral: 15761536,
            lightcyan: 14745599,
            lightgoldenrodyellow: 16448210,
            lightgray: 13882323,
            lightgreen: 9498256,
            lightgrey: 13882323,
            lightpink: 16758465,
            lightsalmon: 16752762,
            lightseagreen: 2142890,
            lightskyblue: 8900346,
            lightslategray: 7833753,
            lightslategrey: 7833753,
            lightsteelblue: 11584734,
            lightyellow: 16777184,
            lime: 65280,
            limegreen: 3329330,
            linen: 16445670,
            magenta: 16711935,
            maroon: 8388608,
            mediumaquamarine: 6737322,
            mediumblue: 205,
            mediumorchid: 12211667,
            mediumpurple: 9662683,
            mediumseagreen: 3978097,
            mediumslateblue: 8087790,
            mediumspringgreen: 64154,
            mediumturquoise: 4772300,
            mediumvioletred: 13047173,
            midnightblue: 1644912,
            mintcream: 16121850,
            mistyrose: 16770273,
            moccasin: 16770229,
            navajowhite: 16768685,
            navy: 128,
            oldlace: 16643558,
            olive: 8421376,
            olivedrab: 7048739,
            orange: 16753920,
            orangered: 16729344,
            orchid: 14315734,
            palegoldenrod: 15657130,
            palegreen: 10025880,
            paleturquoise: 11529966,
            palevioletred: 14381203,
            papayawhip: 16773077,
            peachpuff: 16767673,
            peru: 13468991,
            pink: 16761035,
            plum: 14524637,
            powderblue: 11591910,
            purple: 8388736,
            rebeccapurple: 6697881,
            red: 16711680,
            rosybrown: 12357519,
            royalblue: 4286945,
            saddlebrown: 9127187,
            salmon: 16416882,
            sandybrown: 16032864,
            seagreen: 3050327,
            seashell: 16774638,
            sienna: 10506797,
            silver: 12632256,
            skyblue: 8900331,
            slateblue: 6970061,
            slategray: 7372944,
            slategrey: 7372944,
            snow: 16775930,
            springgreen: 65407,
            steelblue: 4620980,
            tan: 13808780,
            teal: 32896,
            thistle: 14204888,
            tomato: 16737095,
            turquoise: 4251856,
            violet: 15631086,
            wheat: 16113331,
            white: 16777215,
            whitesmoke: 16119285,
            yellow: 16776960,
            yellowgreen: 10145074,
          };
        function au() {
          return this.rgb().formatHex();
        }
        function ad() {
          return this.rgb().formatRgb();
        }
        function af(e) {
          var t, r;
          return (
            (e = (e + "").trim().toLowerCase()),
            (t = ar.exec(e))
              ? ((r = t[1].length),
                (t = parseInt(t[1], 16)),
                6 === r
                  ? ah(t)
                  : 3 === r
                    ? new am(
                        ((t >> 8) & 15) | ((t >> 4) & 240),
                        ((t >> 4) & 15) | (240 & t),
                        ((15 & t) << 4) | (15 & t),
                        1,
                      )
                    : 8 === r
                      ? ap(
                          (t >> 24) & 255,
                          (t >> 16) & 255,
                          (t >> 8) & 255,
                          (255 & t) / 255,
                        )
                      : 4 === r
                        ? ap(
                            ((t >> 12) & 15) | ((t >> 8) & 240),
                            ((t >> 8) & 15) | ((t >> 4) & 240),
                            ((t >> 4) & 15) | (240 & t),
                            (((15 & t) << 4) | (15 & t)) / 255,
                          )
                        : null)
              : (t = an.exec(e))
                ? new am(t[1], t[2], t[3], 1)
                : (t = ai.exec(e))
                  ? new am(
                      (255 * t[1]) / 100,
                      (255 * t[2]) / 100,
                      (255 * t[3]) / 100,
                      1,
                    )
                  : (t = aa.exec(e))
                    ? ap(t[1], t[2], t[3], t[4])
                    : (t = ao.exec(e))
                      ? ap(
                          (255 * t[1]) / 100,
                          (255 * t[2]) / 100,
                          (255 * t[3]) / 100,
                          t[4],
                        )
                      : (t = al.exec(e))
                        ? aj(t[1], t[2] / 100, t[3] / 100, 1)
                        : (t = as.exec(e))
                          ? aj(t[1], t[2] / 100, t[3] / 100, t[4])
                          : ac.hasOwnProperty(e)
                            ? ah(ac[e])
                            : "transparent" === e
                              ? new am(NaN, NaN, NaN, 0)
                              : null
          );
        }
        function ah(e) {
          return new am((e >> 16) & 255, (e >> 8) & 255, 255 & e, 1);
        }
        function ap(e, t, r, n) {
          return (n <= 0 && (e = t = r = NaN), new am(e, t, r, n));
        }
        function ay(e, t, r, n) {
          var i;
          return 1 == arguments.length
            ? ((i = e) instanceof i8 || (i = af(i)), i)
              ? new am((i = i.rgb()).r, i.g, i.b, i.opacity)
              : new am()
            : new am(e, t, r, null == n ? 1 : n);
        }
        function am(e, t, r, n) {
          ((this.r = +e), (this.g = +t), (this.b = +r), (this.opacity = +n));
        }
        function av() {
          return `#${aw(this.r)}${aw(this.g)}${aw(this.b)}`;
        }
        function ag() {
          let e = ab(this.opacity);
          return `${1 === e ? "rgb(" : "rgba("}${ax(this.r)}, ${ax(this.g)}, ${ax(this.b)}${1 === e ? ")" : `, ${e})`}`;
        }
        function ab(e) {
          return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
        }
        function ax(e) {
          return Math.max(0, Math.min(255, Math.round(e) || 0));
        }
        function aw(e) {
          return ((e = ax(e)) < 16 ? "0" : "") + e.toString(16);
        }
        function aj(e, t, r, n) {
          return (
            n <= 0
              ? (e = t = r = NaN)
              : r <= 0 || r >= 1
                ? (e = t = NaN)
                : t <= 0 && (e = NaN),
            new aP(e, t, r, n)
          );
        }
        function aO(e) {
          if (e instanceof aP) return new aP(e.h, e.s, e.l, e.opacity);
          if ((e instanceof i8 || (e = af(e)), !e)) return new aP();
          if (e instanceof aP) return e;
          var t = (e = e.rgb()).r / 255,
            r = e.g / 255,
            n = e.b / 255,
            i = Math.min(t, r, n),
            a = Math.max(t, r, n),
            o = NaN,
            l = a - i,
            s = (a + i) / 2;
          return (
            l
              ? ((o =
                  t === a
                    ? (r - n) / l + (r < n) * 6
                    : r === a
                      ? (n - t) / l + 2
                      : (t - r) / l + 4),
                (l /= s < 0.5 ? a + i : 2 - a - i),
                (o *= 60))
              : (l = s > 0 && s < 1 ? 0 : o),
            new aP(o, l, s, e.opacity)
          );
        }
        function aP(e, t, r, n) {
          ((this.h = +e), (this.s = +t), (this.l = +r), (this.opacity = +n));
        }
        function aS(e) {
          return (e = (e || 0) % 360) < 0 ? e + 360 : e;
        }
        function ak(e) {
          return Math.max(0, Math.min(1, e || 0));
        }
        function aN(e, t, r) {
          return (
            (e < 60
              ? t + ((r - t) * e) / 60
              : e < 180
                ? r
                : e < 240
                  ? t + ((r - t) * (240 - e)) / 60
                  : t) * 255
          );
        }
        function aE(e, t, r, n, i) {
          var a = e * e,
            o = a * e;
          return (
            ((1 - 3 * e + 3 * a - o) * t +
              (4 - 6 * a + 3 * o) * r +
              (1 + 3 * e + 3 * a - 3 * o) * n +
              o * i) /
            6
          );
        }
        (i4(i8, af, {
          copy(e) {
            return Object.assign(new this.constructor(), this, e);
          },
          displayable() {
            return this.rgb().displayable();
          },
          hex: au,
          formatHex: au,
          formatHex8: function () {
            return this.rgb().formatHex8();
          },
          formatHsl: function () {
            return aO(this).formatHsl();
          },
          formatRgb: ad,
          toString: ad,
        }),
          i4(
            am,
            ay,
            i7(i8, {
              brighter(e) {
                return (
                  (e =
                    null == e
                      ? 1.4285714285714286
                      : Math.pow(1.4285714285714286, e)),
                  new am(this.r * e, this.g * e, this.b * e, this.opacity)
                );
              },
              darker(e) {
                return (
                  (e = null == e ? 0.7 : Math.pow(0.7, e)),
                  new am(this.r * e, this.g * e, this.b * e, this.opacity)
                );
              },
              rgb() {
                return this;
              },
              clamp() {
                return new am(
                  ax(this.r),
                  ax(this.g),
                  ax(this.b),
                  ab(this.opacity),
                );
              },
              displayable() {
                return (
                  -0.5 <= this.r &&
                  this.r < 255.5 &&
                  -0.5 <= this.g &&
                  this.g < 255.5 &&
                  -0.5 <= this.b &&
                  this.b < 255.5 &&
                  0 <= this.opacity &&
                  this.opacity <= 1
                );
              },
              hex: av,
              formatHex: av,
              formatHex8: function () {
                return `#${aw(this.r)}${aw(this.g)}${aw(this.b)}${aw((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
              },
              formatRgb: ag,
              toString: ag,
            }),
          ),
          i4(
            aP,
            function (e, t, r, n) {
              return 1 == arguments.length
                ? aO(e)
                : new aP(e, t, r, null == n ? 1 : n);
            },
            i7(i8, {
              brighter(e) {
                return (
                  (e =
                    null == e
                      ? 1.4285714285714286
                      : Math.pow(1.4285714285714286, e)),
                  new aP(this.h, this.s, this.l * e, this.opacity)
                );
              },
              darker(e) {
                return (
                  (e = null == e ? 0.7 : Math.pow(0.7, e)),
                  new aP(this.h, this.s, this.l * e, this.opacity)
                );
              },
              rgb() {
                var e = (this.h % 360) + (this.h < 0) * 360,
                  t = isNaN(e) || isNaN(this.s) ? 0 : this.s,
                  r = this.l,
                  n = r + (r < 0.5 ? r : 1 - r) * t,
                  i = 2 * r - n;
                return new am(
                  aN(e >= 240 ? e - 240 : e + 120, i, n),
                  aN(e, i, n),
                  aN(e < 120 ? e + 240 : e - 120, i, n),
                  this.opacity,
                );
              },
              clamp() {
                return new aP(
                  aS(this.h),
                  ak(this.s),
                  ak(this.l),
                  ab(this.opacity),
                );
              },
              displayable() {
                return (
                  ((0 <= this.s && this.s <= 1) || isNaN(this.s)) &&
                  0 <= this.l &&
                  this.l <= 1 &&
                  0 <= this.opacity &&
                  this.opacity <= 1
                );
              },
              formatHsl() {
                let e = ab(this.opacity);
                return `${1 === e ? "hsl(" : "hsla("}${aS(this.h)}, ${100 * ak(this.s)}%, ${100 * ak(this.l)}%${1 === e ? ")" : `, ${e})`}`;
              },
            }),
          ));
        let a_ = (e) => () => e;
        function aA(e, t) {
          var r = t - e;
          return r
            ? function (t) {
                return e + t * r;
              }
            : a_(isNaN(e) ? t : e);
        }
        let aM = (function e(t) {
          var r,
            n =
              1 == (r = +(r = t))
                ? aA
                : function (e, t) {
                    var n, i, a;
                    return t - e
                      ? ((n = e),
                        (i = t),
                        (n = Math.pow(n, (a = r))),
                        (i = Math.pow(i, a) - n),
                        (a = 1 / a),
                        function (e) {
                          return Math.pow(n + e * i, a);
                        })
                      : a_(isNaN(e) ? t : e);
                  };
          function i(e, t) {
            var r = n((e = ay(e)).r, (t = ay(t)).r),
              i = n(e.g, t.g),
              a = n(e.b, t.b),
              o = aA(e.opacity, t.opacity);
            return function (t) {
              return (
                (e.r = r(t)),
                (e.g = i(t)),
                (e.b = a(t)),
                (e.opacity = o(t)),
                e + ""
              );
            };
          }
          return ((i.gamma = e), i);
        })(1);
        function aC(e) {
          return function (t) {
            var r,
              n,
              i = t.length,
              a = Array(i),
              o = Array(i),
              l = Array(i);
            for (r = 0; r < i; ++r)
              ((n = ay(t[r])),
                (a[r] = n.r || 0),
                (o[r] = n.g || 0),
                (l[r] = n.b || 0));
            return (
              (a = e(a)),
              (o = e(o)),
              (l = e(l)),
              (n.opacity = 1),
              function (e) {
                return ((n.r = a(e)), (n.g = o(e)), (n.b = l(e)), n + "");
              }
            );
          };
        }
        function aT(e, t) {
          return (
            (e = +e),
            (t = +t),
            function (r) {
              return e * (1 - r) + t * r;
            }
          );
        }
        (aC(function (e) {
          var t = e.length - 1;
          return function (r) {
            var n =
                r <= 0
                  ? (r = 0)
                  : r >= 1
                    ? ((r = 1), t - 1)
                    : Math.floor(r * t),
              i = e[n],
              a = e[n + 1],
              o = n > 0 ? e[n - 1] : 2 * i - a,
              l = n < t - 1 ? e[n + 2] : 2 * a - i;
            return aE((r - n / t) * t, o, i, a, l);
          };
        }),
          aC(function (e) {
            var t = e.length;
            return function (r) {
              var n = Math.floor(((r %= 1) < 0 ? ++r : r) * t),
                i = e[(n + t - 1) % t],
                a = e[n % t],
                o = e[(n + 1) % t],
                l = e[(n + 2) % t];
              return aE((r - n / t) * t, i, a, o, l);
            };
          }));
        var aD = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
          aI = RegExp(aD.source, "g");
        function az(e, t) {
          var r,
            n,
            i = typeof t;
          return null == t || "boolean" === i
            ? a_(t)
            : ("number" === i
                ? aT
                : "string" === i
                  ? (n = af(t))
                    ? ((t = n), aM)
                    : function (e, t) {
                        var r,
                          n,
                          i,
                          a,
                          o,
                          l = (aD.lastIndex = aI.lastIndex = 0),
                          s = -1,
                          c = [],
                          u = [];
                        for (
                          e += "", t += "";
                          (i = aD.exec(e)) && (a = aI.exec(t));
                        )
                          ((o = a.index) > l &&
                            ((o = t.slice(l, o)),
                            c[s] ? (c[s] += o) : (c[++s] = o)),
                            (i = i[0]) === (a = a[0])
                              ? c[s]
                                ? (c[s] += a)
                                : (c[++s] = a)
                              : ((c[++s] = null),
                                u.push({ i: s, x: aT(i, a) })),
                            (l = aI.lastIndex));
                        return (
                          l < t.length &&
                            ((o = t.slice(l)),
                            c[s] ? (c[s] += o) : (c[++s] = o)),
                          c.length < 2
                            ? u[0]
                              ? ((r = u[0].x),
                                function (e) {
                                  return r(e) + "";
                                })
                              : ((n = t),
                                function () {
                                  return n;
                                })
                            : ((t = u.length),
                              function (e) {
                                for (var r, n = 0; n < t; ++n)
                                  c[(r = u[n]).i] = r.x(e);
                                return c.join("");
                              })
                        );
                      }
                  : t instanceof af
                    ? aM
                    : t instanceof Date
                      ? function (e, t) {
                          var r = new Date();
                          return (
                            (e = +e),
                            (t = +t),
                            function (n) {
                              return (r.setTime(e * (1 - n) + t * n), r);
                            }
                          );
                        }
                      : ((r = t),
                          !ArrayBuffer.isView(r) || r instanceof DataView)
                        ? Array.isArray(t)
                          ? function (e, t) {
                              var r,
                                n = t ? t.length : 0,
                                i = e ? Math.min(n, e.length) : 0,
                                a = Array(i),
                                o = Array(n);
                              for (r = 0; r < i; ++r) a[r] = az(e[r], t[r]);
                              for (; r < n; ++r) o[r] = t[r];
                              return function (e) {
                                for (r = 0; r < i; ++r) o[r] = a[r](e);
                                return o;
                              };
                            }
                          : ("function" != typeof t.valueOf &&
                                "function" != typeof t.toString) ||
                              isNaN(t)
                            ? function (e, t) {
                                var r,
                                  n = {},
                                  i = {};
                                for (r in ((null === e ||
                                  "object" != typeof e) &&
                                  (e = {}),
                                (null === t || "object" != typeof t) &&
                                  (t = {}),
                                t))
                                  r in e
                                    ? (n[r] = az(e[r], t[r]))
                                    : (i[r] = t[r]);
                                return function (e) {
                                  for (r in n) i[r] = n[r](e);
                                  return i;
                                };
                              }
                            : aT
                        : function (e, t) {
                            t || (t = []);
                            var r,
                              n = e ? Math.min(t.length, e.length) : 0,
                              i = t.slice();
                            return function (a) {
                              for (r = 0; r < n; ++r)
                                i[r] = e[r] * (1 - a) + t[r] * a;
                              return i;
                            };
                          })(e, t);
        }
        function aL(e, t) {
          return (
            (e = +e),
            (t = +t),
            function (r) {
              return Math.round(e * (1 - r) + t * r);
            }
          );
        }
        function aR(e) {
          return +e;
        }
        var a$ = [0, 1];
        function aU(e) {
          return e;
        }
        function aF(e, t) {
          var r;
          return (t -= e = +e)
            ? function (r) {
                return (r - e) / t;
              }
            : ((r = isNaN(t) ? NaN : 0.5),
              function () {
                return r;
              });
        }
        function aB(e, t, r) {
          var n = e[0],
            i = e[1],
            a = t[0],
            o = t[1];
          return (
            i < n
              ? ((n = aF(i, n)), (a = r(o, a)))
              : ((n = aF(n, i)), (a = r(a, o))),
            function (e) {
              return a(n(e));
            }
          );
        }
        function aK(e, t, r) {
          var n = Math.min(e.length, t.length) - 1,
            i = Array(n),
            a = Array(n),
            o = -1;
          for (
            e[n] < e[0] &&
            ((e = e.slice().reverse()), (t = t.slice().reverse()));
            ++o < n;
          )
            ((i[o] = aF(e[o], e[o + 1])), (a[o] = r(t[o], t[o + 1])));
          return function (t) {
            var r = i5(e, t, 1, n) - 1;
            return a[r](i[r](t));
          };
        }
        function aW(e, t) {
          return t
            .domain(e.domain())
            .range(e.range())
            .interpolate(e.interpolate())
            .clamp(e.clamp())
            .unknown(e.unknown());
        }
        function aH() {
          var e,
            t,
            r,
            n,
            i,
            a,
            o = a$,
            l = a$,
            s = az,
            c = aU;
          function u() {
            var e,
              t,
              r,
              s = Math.min(o.length, l.length);
            return (
              c !== aU &&
                ((e = o[0]),
                (t = o[s - 1]),
                e > t && ((r = e), (e = t), (t = r)),
                (c = function (r) {
                  return Math.max(e, Math.min(t, r));
                })),
              (n = s > 2 ? aK : aB),
              (i = a = null),
              d
            );
          }
          function d(t) {
            return null == t || isNaN((t = +t))
              ? r
              : (i || (i = n(o.map(e), l, s)))(e(c(t)));
          }
          return (
            (d.invert = function (r) {
              return c(t((a || (a = n(l, o.map(e), aT)))(r)));
            }),
            (d.domain = function (e) {
              return arguments.length
                ? ((o = Array.from(e, aR)), u())
                : o.slice();
            }),
            (d.range = function (e) {
              return arguments.length ? ((l = Array.from(e)), u()) : l.slice();
            }),
            (d.rangeRound = function (e) {
              return ((l = Array.from(e)), (s = aL), u());
            }),
            (d.clamp = function (e) {
              return arguments.length ? ((c = !!e || aU), u()) : c !== aU;
            }),
            (d.interpolate = function (e) {
              return arguments.length ? ((s = e), u()) : s;
            }),
            (d.unknown = function (e) {
              return arguments.length ? ((r = e), d) : r;
            }),
            function (r, n) {
              return ((e = r), (t = n), u());
            }
          );
        }
        function aq() {
          return aH()(aU, aU);
        }
        var aV =
          /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
        function aZ(e) {
          var t;
          if (!(t = aV.exec(e))) throw Error("invalid format: " + e);
          return new aY({
            fill: t[1],
            align: t[2],
            sign: t[3],
            symbol: t[4],
            zero: t[5],
            width: t[6],
            comma: t[7],
            precision: t[8] && t[8].slice(1),
            trim: t[9],
            type: t[10],
          });
        }
        function aY(e) {
          ((this.fill = void 0 === e.fill ? " " : e.fill + ""),
            (this.align = void 0 === e.align ? ">" : e.align + ""),
            (this.sign = void 0 === e.sign ? "-" : e.sign + ""),
            (this.symbol = void 0 === e.symbol ? "" : e.symbol + ""),
            (this.zero = !!e.zero),
            (this.width = void 0 === e.width ? void 0 : +e.width),
            (this.comma = !!e.comma),
            (this.precision = void 0 === e.precision ? void 0 : +e.precision),
            (this.trim = !!e.trim),
            (this.type = void 0 === e.type ? "" : e.type + ""));
        }
        function aG(e, t) {
          if (
            (r = (e = t ? e.toExponential(t - 1) : e.toExponential()).indexOf(
              "e",
            )) < 0
          )
            return null;
          var r,
            n = e.slice(0, r);
          return [n.length > 1 ? n[0] + n.slice(2) : n, +e.slice(r + 1)];
        }
        function aX(e) {
          return (e = aG(Math.abs(e))) ? e[1] : NaN;
        }
        function aQ(e, t) {
          var r = aG(e, t);
          if (!r) return e + "";
          var n = r[0],
            i = r[1];
          return i < 0
            ? "0." + Array(-i).join("0") + n
            : n.length > i + 1
              ? n.slice(0, i + 1) + "." + n.slice(i + 1)
              : n + Array(i - n.length + 2).join("0");
        }
        ((aZ.prototype = aY.prototype),
          (aY.prototype.toString = function () {
            return (
              this.fill +
              this.align +
              this.sign +
              this.symbol +
              (this.zero ? "0" : "") +
              (void 0 === this.width ? "" : Math.max(1, 0 | this.width)) +
              (this.comma ? "," : "") +
              (void 0 === this.precision
                ? ""
                : "." + Math.max(0, 0 | this.precision)) +
              (this.trim ? "~" : "") +
              this.type
            );
          }));
        let aJ = {
          "%": (e, t) => (100 * e).toFixed(t),
          b: (e) => Math.round(e).toString(2),
          c: (e) => e + "",
          d: function (e) {
            return Math.abs((e = Math.round(e))) >= 1e21
              ? e.toLocaleString("en").replace(/,/g, "")
              : e.toString(10);
          },
          e: (e, t) => e.toExponential(t),
          f: (e, t) => e.toFixed(t),
          g: (e, t) => e.toPrecision(t),
          o: (e) => Math.round(e).toString(8),
          p: (e, t) => aQ(100 * e, t),
          r: aQ,
          s: function (e, t) {
            var r = aG(e, t);
            if (!r) return e + "";
            var n = r[0],
              i = r[1],
              a =
                i - (sS = 3 * Math.max(-8, Math.min(8, Math.floor(i / 3)))) + 1,
              o = n.length;
            return a === o
              ? n
              : a > o
                ? n + Array(a - o + 1).join("0")
                : a > 0
                  ? n.slice(0, a) + "." + n.slice(a)
                  : "0." +
                    Array(1 - a).join("0") +
                    aG(e, Math.max(0, t + a - 1))[0];
          },
          X: (e) => Math.round(e).toString(16).toUpperCase(),
          x: (e) => Math.round(e).toString(16),
        };
        function a0(e) {
          return e;
        }
        var a1 = Array.prototype.map,
          a2 = [
            "y",
            "z",
            "a",
            "f",
            "p",
            "n",
            "\xb5",
            "m",
            "",
            "k",
            "M",
            "G",
            "T",
            "P",
            "E",
            "Z",
            "Y",
          ];
        function a3(e, t, r, n) {
          var i,
            a,
            o = iQ(e, t, r);
          switch ((n = aZ(null == n ? ",f" : n)).type) {
            case "s":
              var l = Math.max(Math.abs(e), Math.abs(t));
              return (
                null != n.precision ||
                  isNaN(
                    (a = Math.max(
                      0,
                      3 * Math.max(-8, Math.min(8, Math.floor(aX(l) / 3))) -
                        aX(Math.abs(o)),
                    )),
                  ) ||
                  (n.precision = a),
                sE(n, l)
              );
            case "":
            case "e":
            case "g":
            case "p":
            case "r":
              null != n.precision ||
                isNaN(
                  (a =
                    Math.max(
                      0,
                      aX(
                        Math.abs(Math.max(Math.abs(e), Math.abs(t))) -
                          (i = Math.abs((i = o))),
                      ) - aX(i),
                    ) + 1),
                ) ||
                (n.precision = a - ("e" === n.type));
              break;
            case "f":
            case "%":
              null != n.precision ||
                isNaN((a = Math.max(0, -aX(Math.abs(o))))) ||
                (n.precision = a - ("%" === n.type) * 2);
          }
          return sN(n);
        }
        function a6(e) {
          var t = e.domain;
          return (
            (e.ticks = function (e) {
              var r = t();
              return iG(r[0], r[r.length - 1], null == e ? 10 : e);
            }),
            (e.tickFormat = function (e, r) {
              var n = t();
              return a3(n[0], n[n.length - 1], null == e ? 10 : e, r);
            }),
            (e.nice = function (r) {
              null == r && (r = 10);
              var n,
                i,
                a = t(),
                o = 0,
                l = a.length - 1,
                s = a[o],
                c = a[l],
                u = 10;
              for (
                c < s && ((i = s), (s = c), (c = i), (i = o), (o = l), (l = i));
                u-- > 0;
              ) {
                if ((i = iX(s, c, r)) === n)
                  return ((a[o] = s), (a[l] = c), t(a));
                if (i > 0)
                  ((s = Math.floor(s / i) * i), (c = Math.ceil(c / i) * i));
                else if (i < 0)
                  ((s = Math.ceil(s * i) / i), (c = Math.floor(c * i) / i));
                else break;
                n = i;
              }
              return e;
            }),
            e
          );
        }
        function a5(e, t) {
          e = e.slice();
          var r,
            n = 0,
            i = e.length - 1,
            a = e[n],
            o = e[i];
          return (
            o < a && ((r = n), (n = i), (i = r), (r = a), (a = o), (o = r)),
            (e[n] = t.floor(a)),
            (e[i] = t.ceil(o)),
            e
          );
        }
        function a4(e) {
          return Math.log(e);
        }
        function a7(e) {
          return Math.exp(e);
        }
        function a8(e) {
          return -Math.log(-e);
        }
        function a9(e) {
          return -Math.exp(-e);
        }
        function oe(e) {
          return isFinite(e) ? +("1e" + e) : e < 0 ? 0 : e;
        }
        function ot(e) {
          return (t, r) => -e(-t, r);
        }
        function or(e) {
          let t, r;
          let n = e(a4, a7),
            i = n.domain,
            a = 10;
          function o() {
            var o, l;
            return (
              (t =
                (o = a) === Math.E
                  ? Math.log
                  : (10 === o && Math.log10) ||
                    (2 === o && Math.log2) ||
                    ((o = Math.log(o)), (e) => Math.log(e) / o)),
              (r =
                10 === (l = a)
                  ? oe
                  : l === Math.E
                    ? Math.exp
                    : (e) => Math.pow(l, e)),
              i()[0] < 0 ? ((t = ot(t)), (r = ot(r)), e(a8, a9)) : e(a4, a7),
              n
            );
          }
          return (
            (n.base = function (e) {
              return arguments.length ? ((a = +e), o()) : a;
            }),
            (n.domain = function (e) {
              return arguments.length ? (i(e), o()) : i();
            }),
            (n.ticks = (e) => {
              let n, o;
              let l = i(),
                s = l[0],
                c = l[l.length - 1],
                u = c < s;
              u && ([s, c] = [c, s]);
              let d = t(s),
                f = t(c),
                h = null == e ? 10 : +e,
                p = [];
              if (!(a % 1) && f - d < h) {
                if (((d = Math.floor(d)), (f = Math.ceil(f)), s > 0)) {
                  for (; d <= f; ++d)
                    for (n = 1; n < a; ++n)
                      if (!((o = d < 0 ? n / r(-d) : n * r(d)) < s)) {
                        if (o > c) break;
                        p.push(o);
                      }
                } else
                  for (; d <= f; ++d)
                    for (n = a - 1; n >= 1; --n)
                      if (!((o = d > 0 ? n / r(-d) : n * r(d)) < s)) {
                        if (o > c) break;
                        p.push(o);
                      }
                2 * p.length < h && (p = iG(s, c, h));
              } else p = iG(d, f, Math.min(f - d, h)).map(r);
              return u ? p.reverse() : p;
            }),
            (n.tickFormat = (e, i) => {
              if (
                (null == e && (e = 10),
                null == i && (i = 10 === a ? "s" : ","),
                "function" != typeof i &&
                  (a % 1 || null != (i = aZ(i)).precision || (i.trim = !0),
                  (i = sN(i))),
                e === 1 / 0)
              )
                return i;
              let o = Math.max(1, (a * e) / n.ticks().length);
              return (e) => {
                let n = e / r(Math.round(t(e)));
                return (n * a < a - 0.5 && (n *= a), n <= o ? i(e) : "");
              };
            }),
            (n.nice = () =>
              i(
                a5(i(), {
                  floor: (e) => r(Math.floor(t(e))),
                  ceil: (e) => r(Math.ceil(t(e))),
                }),
              )),
            n
          );
        }
        function on(e) {
          return function (t) {
            return Math.sign(t) * Math.log1p(Math.abs(t / e));
          };
        }
        function oi(e) {
          return function (t) {
            return Math.sign(t) * Math.expm1(Math.abs(t)) * e;
          };
        }
        function oa(e) {
          var t = 1,
            r = e(on(1), oi(t));
          return (
            (r.constant = function (r) {
              return arguments.length ? e(on((t = +r)), oi(t)) : t;
            }),
            a6(r)
          );
        }
        function oo(e) {
          return function (t) {
            return t < 0 ? -Math.pow(-t, e) : Math.pow(t, e);
          };
        }
        function ol(e) {
          return e < 0 ? -Math.sqrt(-e) : Math.sqrt(e);
        }
        function os(e) {
          return e < 0 ? -e * e : e * e;
        }
        function oc(e) {
          var t = e(aU, aU),
            r = 1;
          return (
            (t.exponent = function (t) {
              return arguments.length
                ? 1 == (r = +t)
                  ? e(aU, aU)
                  : 0.5 === r
                    ? e(ol, os)
                    : e(oo(r), oo(1 / r))
                : r;
            }),
            a6(t)
          );
        }
        function ou() {
          var e = oc(aH());
          return (
            (e.copy = function () {
              return aW(e, ou()).exponent(e.exponent());
            }),
            iL.apply(e, arguments),
            e
          );
        }
        function od() {
          return ou.apply(null, arguments).exponent(0.5);
        }
        function of(e) {
          return Math.sign(e) * e * e;
        }
        function oh(e, t) {
          let r;
          if (void 0 === t)
            for (let t of e)
              null != t && (r < t || (void 0 === r && t >= t)) && (r = t);
          else {
            let n = -1;
            for (let i of e)
              null != (i = t(i, ++n, e)) &&
                (r < i || (void 0 === r && i >= i)) &&
                (r = i);
          }
          return r;
        }
        function op(e, t) {
          let r;
          if (void 0 === t)
            for (let t of e)
              null != t && (r > t || (void 0 === r && t >= t)) && (r = t);
          else {
            let n = -1;
            for (let i of e)
              null != (i = t(i, ++n, e)) &&
                (r > i || (void 0 === r && i >= i)) &&
                (r = i);
          }
          return r;
        }
        function oy(e, t) {
          return (
            (null == e || !(e >= e)) - (null == t || !(t >= t)) ||
            (e < t ? -1 : e > t ? 1 : 0)
          );
        }
        function om(e, t, r) {
          let n = e[t];
          ((e[t] = e[r]), (e[r] = n));
        }
        ((sN = (sk = (function (e) {
          var t,
            r,
            n,
            i =
              void 0 === e.grouping || void 0 === e.thousands
                ? a0
                : ((t = a1.call(e.grouping, Number)),
                  (r = e.thousands + ""),
                  function (e, n) {
                    for (
                      var i = e.length, a = [], o = 0, l = t[0], s = 0;
                      i > 0 &&
                      l > 0 &&
                      (s + l + 1 > n && (l = Math.max(1, n - s)),
                      a.push(e.substring((i -= l), i + l)),
                      !((s += l + 1) > n));
                    )
                      l = t[(o = (o + 1) % t.length)];
                    return a.reverse().join(r);
                  }),
            a = void 0 === e.currency ? "" : e.currency[0] + "",
            o = void 0 === e.currency ? "" : e.currency[1] + "",
            l = void 0 === e.decimal ? "." : e.decimal + "",
            s =
              void 0 === e.numerals
                ? a0
                : ((n = a1.call(e.numerals, String)),
                  function (e) {
                    return e.replace(/[0-9]/g, function (e) {
                      return n[+e];
                    });
                  }),
            c = void 0 === e.percent ? "%" : e.percent + "",
            u = void 0 === e.minus ? "−" : e.minus + "",
            d = void 0 === e.nan ? "NaN" : e.nan + "";
          function f(e) {
            var t = (e = aZ(e)).fill,
              r = e.align,
              n = e.sign,
              f = e.symbol,
              h = e.zero,
              p = e.width,
              y = e.comma,
              m = e.precision,
              v = e.trim,
              g = e.type;
            ("n" === g
              ? ((y = !0), (g = "g"))
              : aJ[g] || (void 0 === m && (m = 12), (v = !0), (g = "g")),
              (h || ("0" === t && "=" === r)) &&
                ((h = !0), (t = "0"), (r = "=")));
            var b =
                "$" === f
                  ? a
                  : "#" === f && /[boxX]/.test(g)
                    ? "0" + g.toLowerCase()
                    : "",
              x = "$" === f ? o : /[%p]/.test(g) ? c : "",
              w = aJ[g],
              j = /[defgprs%]/.test(g);
            function O(e) {
              var a,
                o,
                c,
                f = b,
                O = x;
              if ("c" === g) ((O = w(e) + O), (e = ""));
              else {
                var P = (e = +e) < 0 || 1 / e < 0;
                if (
                  ((e = isNaN(e) ? d : w(Math.abs(e), m)),
                  v &&
                    (e = (function (e) {
                      e: for (var t, r = e.length, n = 1, i = -1; n < r; ++n)
                        switch (e[n]) {
                          case ".":
                            i = t = n;
                            break;
                          case "0":
                            (0 === i && (i = n), (t = n));
                            break;
                          default:
                            if (!+e[n]) break e;
                            i > 0 && (i = 0);
                        }
                      return i > 0 ? e.slice(0, i) + e.slice(t + 1) : e;
                    })(e)),
                  P && 0 == +e && "+" !== n && (P = !1),
                  (f =
                    (P
                      ? "(" === n
                        ? n
                        : u
                      : "-" === n || "(" === n
                        ? ""
                        : n) + f),
                  (O =
                    ("s" === g ? a2[8 + sS / 3] : "") +
                    O +
                    (P && "(" === n ? ")" : "")),
                  j)
                ) {
                  for (a = -1, o = e.length; ++a < o; )
                    if (48 > (c = e.charCodeAt(a)) || c > 57) {
                      ((O = (46 === c ? l + e.slice(a + 1) : e.slice(a)) + O),
                        (e = e.slice(0, a)));
                      break;
                    }
                }
              }
              y && !h && (e = i(e, 1 / 0));
              var S = f.length + e.length + O.length,
                k = S < p ? Array(p - S + 1).join(t) : "";
              switch (
                (y &&
                  h &&
                  ((e = i(k + e, k.length ? p - O.length : 1 / 0)), (k = "")),
                r)
              ) {
                case "<":
                  e = f + e + O + k;
                  break;
                case "=":
                  e = f + k + e + O;
                  break;
                case "^":
                  e = k.slice(0, (S = k.length >> 1)) + f + e + O + k.slice(S);
                  break;
                default:
                  e = k + f + e + O;
              }
              return s(e);
            }
            return (
              (m =
                void 0 === m
                  ? 6
                  : /[gprs]/.test(g)
                    ? Math.max(1, Math.min(21, m))
                    : Math.max(0, Math.min(20, m))),
              (O.toString = function () {
                return e + "";
              }),
              O
            );
          }
          return {
            format: f,
            formatPrefix: function (e, t) {
              var r = f((((e = aZ(e)).type = "f"), e)),
                n = 3 * Math.max(-8, Math.min(8, Math.floor(aX(t) / 3))),
                i = Math.pow(10, -n),
                a = a2[8 + n / 3];
              return function (e) {
                return r(i * e) + a;
              };
            },
          };
        })({ thousands: ",", grouping: [3], currency: ["$", ""] })).format),
          (sE = sk.formatPrefix));
        let ov = 864e5,
          og = 7 * ov,
          ob = 30 * ov,
          ox = 365 * ov,
          ow = new Date(),
          oj = new Date();
        function oO(e, t, r, n) {
          function i(t) {
            return (
              e((t = 0 == arguments.length ? new Date() : new Date(+t))),
              t
            );
          }
          return (
            (i.floor = (t) => (e((t = new Date(+t))), t)),
            (i.ceil = (r) => (e((r = new Date(r - 1))), t(r, 1), e(r), r)),
            (i.round = (e) => {
              let t = i(e),
                r = i.ceil(e);
              return e - t < r - e ? t : r;
            }),
            (i.offset = (e, r) => (
              t((e = new Date(+e)), null == r ? 1 : Math.floor(r)),
              e
            )),
            (i.range = (r, n, a) => {
              let o;
              let l = [];
              if (
                ((r = i.ceil(r)),
                (a = null == a ? 1 : Math.floor(a)),
                !(r < n) || !(a > 0))
              )
                return l;
              do (l.push((o = new Date(+r))), t(r, a), e(r));
              while (o < r && r < n);
              return l;
            }),
            (i.filter = (r) =>
              oO(
                (t) => {
                  if (t >= t) for (; e(t), !r(t); ) t.setTime(t - 1);
                },
                (e, n) => {
                  if (e >= e) {
                    if (n < 0) for (; ++n <= 0; ) for (; t(e, -1), !r(e); );
                    else for (; --n >= 0; ) for (; t(e, 1), !r(e); );
                  }
                },
              )),
            r &&
              ((i.count = (t, n) => (
                ow.setTime(+t),
                oj.setTime(+n),
                e(ow),
                e(oj),
                Math.floor(r(ow, oj))
              )),
              (i.every = (e) =>
                isFinite((e = Math.floor(e))) && e > 0
                  ? e > 1
                    ? i.filter(
                        n
                          ? (t) => n(t) % e == 0
                          : (t) => i.count(0, t) % e == 0,
                      )
                    : i
                  : null)),
            i
          );
        }
        let oP = oO(
          () => {},
          (e, t) => {
            e.setTime(+e + t);
          },
          (e, t) => t - e,
        );
        ((oP.every = (e) =>
          isFinite((e = Math.floor(e))) && e > 0
            ? e > 1
              ? oO(
                  (t) => {
                    t.setTime(Math.floor(t / e) * e);
                  },
                  (t, r) => {
                    t.setTime(+t + r * e);
                  },
                  (t, r) => (r - t) / e,
                )
              : oP
            : null),
          oP.range);
        let oS = oO(
          (e) => {
            e.setTime(e - e.getMilliseconds());
          },
          (e, t) => {
            e.setTime(+e + 1e3 * t);
          },
          (e, t) => (t - e) / 1e3,
          (e) => e.getUTCSeconds(),
        );
        oS.range;
        let ok = oO(
          (e) => {
            e.setTime(e - e.getMilliseconds() - 1e3 * e.getSeconds());
          },
          (e, t) => {
            e.setTime(+e + 6e4 * t);
          },
          (e, t) => (t - e) / 6e4,
          (e) => e.getMinutes(),
        );
        ok.range;
        let oN = oO(
          (e) => {
            e.setUTCSeconds(0, 0);
          },
          (e, t) => {
            e.setTime(+e + 6e4 * t);
          },
          (e, t) => (t - e) / 6e4,
          (e) => e.getUTCMinutes(),
        );
        oN.range;
        let oE = oO(
          (e) => {
            e.setTime(
              e -
                e.getMilliseconds() -
                1e3 * e.getSeconds() -
                6e4 * e.getMinutes(),
            );
          },
          (e, t) => {
            e.setTime(+e + 36e5 * t);
          },
          (e, t) => (t - e) / 36e5,
          (e) => e.getHours(),
        );
        oE.range;
        let o_ = oO(
          (e) => {
            e.setUTCMinutes(0, 0, 0);
          },
          (e, t) => {
            e.setTime(+e + 36e5 * t);
          },
          (e, t) => (t - e) / 36e5,
          (e) => e.getUTCHours(),
        );
        o_.range;
        let oA = oO(
          (e) => e.setHours(0, 0, 0, 0),
          (e, t) => e.setDate(e.getDate() + t),
          (e, t) =>
            (t - e - (t.getTimezoneOffset() - e.getTimezoneOffset()) * 6e4) /
            ov,
          (e) => e.getDate() - 1,
        );
        oA.range;
        let oM = oO(
          (e) => {
            e.setUTCHours(0, 0, 0, 0);
          },
          (e, t) => {
            e.setUTCDate(e.getUTCDate() + t);
          },
          (e, t) => (t - e) / ov,
          (e) => e.getUTCDate() - 1,
        );
        oM.range;
        let oC = oO(
          (e) => {
            e.setUTCHours(0, 0, 0, 0);
          },
          (e, t) => {
            e.setUTCDate(e.getUTCDate() + t);
          },
          (e, t) => (t - e) / ov,
          (e) => Math.floor(e / ov),
        );
        function oT(e) {
          return oO(
            (t) => {
              (t.setDate(t.getDate() - ((t.getDay() + 7 - e) % 7)),
                t.setHours(0, 0, 0, 0));
            },
            (e, t) => {
              e.setDate(e.getDate() + 7 * t);
            },
            (e, t) =>
              (t - e - (t.getTimezoneOffset() - e.getTimezoneOffset()) * 6e4) /
              og,
          );
        }
        oC.range;
        let oD = oT(0),
          oI = oT(1),
          oz = oT(2),
          oL = oT(3),
          oR = oT(4),
          o$ = oT(5),
          oU = oT(6);
        function oF(e) {
          return oO(
            (t) => {
              (t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 7 - e) % 7)),
                t.setUTCHours(0, 0, 0, 0));
            },
            (e, t) => {
              e.setUTCDate(e.getUTCDate() + 7 * t);
            },
            (e, t) => (t - e) / og,
          );
        }
        (oD.range, oI.range, oz.range, oL.range, oR.range, o$.range, oU.range);
        let oB = oF(0),
          oK = oF(1),
          oW = oF(2),
          oH = oF(3),
          oq = oF(4),
          oV = oF(5),
          oZ = oF(6);
        (oB.range, oK.range, oW.range, oH.range, oq.range, oV.range, oZ.range);
        let oY = oO(
          (e) => {
            (e.setDate(1), e.setHours(0, 0, 0, 0));
          },
          (e, t) => {
            e.setMonth(e.getMonth() + t);
          },
          (e, t) =>
            t.getMonth() -
            e.getMonth() +
            (t.getFullYear() - e.getFullYear()) * 12,
          (e) => e.getMonth(),
        );
        oY.range;
        let oG = oO(
          (e) => {
            (e.setUTCDate(1), e.setUTCHours(0, 0, 0, 0));
          },
          (e, t) => {
            e.setUTCMonth(e.getUTCMonth() + t);
          },
          (e, t) =>
            t.getUTCMonth() -
            e.getUTCMonth() +
            (t.getUTCFullYear() - e.getUTCFullYear()) * 12,
          (e) => e.getUTCMonth(),
        );
        oG.range;
        let oX = oO(
          (e) => {
            (e.setMonth(0, 1), e.setHours(0, 0, 0, 0));
          },
          (e, t) => {
            e.setFullYear(e.getFullYear() + t);
          },
          (e, t) => t.getFullYear() - e.getFullYear(),
          (e) => e.getFullYear(),
        );
        ((oX.every = (e) =>
          isFinite((e = Math.floor(e))) && e > 0
            ? oO(
                (t) => {
                  (t.setFullYear(Math.floor(t.getFullYear() / e) * e),
                    t.setMonth(0, 1),
                    t.setHours(0, 0, 0, 0));
                },
                (t, r) => {
                  t.setFullYear(t.getFullYear() + r * e);
                },
              )
            : null),
          oX.range);
        let oQ = oO(
          (e) => {
            (e.setUTCMonth(0, 1), e.setUTCHours(0, 0, 0, 0));
          },
          (e, t) => {
            e.setUTCFullYear(e.getUTCFullYear() + t);
          },
          (e, t) => t.getUTCFullYear() - e.getUTCFullYear(),
          (e) => e.getUTCFullYear(),
        );
        function oJ(e, t, r, n, i, a) {
          let o = [
            [oS, 1, 1e3],
            [oS, 5, 5e3],
            [oS, 15, 15e3],
            [oS, 30, 3e4],
            [a, 1, 6e4],
            [a, 5, 3e5],
            [a, 15, 9e5],
            [a, 30, 18e5],
            [i, 1, 36e5],
            [i, 3, 108e5],
            [i, 6, 216e5],
            [i, 12, 432e5],
            [n, 1, ov],
            [n, 2, 2 * ov],
            [r, 1, og],
            [t, 1, ob],
            [t, 3, 3 * ob],
            [e, 1, ox],
          ];
          function l(t, r, n) {
            let i = Math.abs(r - t) / n,
              a = i1(([, , e]) => e).right(o, i);
            if (a === o.length) return e.every(iQ(t / ox, r / ox, n));
            if (0 === a) return oP.every(Math.max(iQ(t, r, n), 1));
            let [l, s] = o[i / o[a - 1][2] < o[a][2] / i ? a - 1 : a];
            return l.every(s);
          }
          return [
            function (e, t, r) {
              let n = t < e;
              n && ([e, t] = [t, e]);
              let i = r && "function" == typeof r.range ? r : l(e, t, r),
                a = i ? i.range(e, +t + 1) : [];
              return n ? a.reverse() : a;
            },
            l,
          ];
        }
        ((oQ.every = (e) =>
          isFinite((e = Math.floor(e))) && e > 0
            ? oO(
                (t) => {
                  (t.setUTCFullYear(Math.floor(t.getUTCFullYear() / e) * e),
                    t.setUTCMonth(0, 1),
                    t.setUTCHours(0, 0, 0, 0));
                },
                (t, r) => {
                  t.setUTCFullYear(t.getUTCFullYear() + r * e);
                },
              )
            : null),
          oQ.range);
        let [o0, o1] = oJ(oQ, oG, oB, oC, o_, oN),
          [o2, o3] = oJ(oX, oY, oD, oA, oE, ok);
        function o6(e) {
          if (0 <= e.y && e.y < 100) {
            var t = new Date(-1, e.m, e.d, e.H, e.M, e.S, e.L);
            return (t.setFullYear(e.y), t);
          }
          return new Date(e.y, e.m, e.d, e.H, e.M, e.S, e.L);
        }
        function o5(e) {
          if (0 <= e.y && e.y < 100) {
            var t = new Date(Date.UTC(-1, e.m, e.d, e.H, e.M, e.S, e.L));
            return (t.setUTCFullYear(e.y), t);
          }
          return new Date(Date.UTC(e.y, e.m, e.d, e.H, e.M, e.S, e.L));
        }
        function o4(e, t, r) {
          return { y: e, m: t, d: r, H: 0, M: 0, S: 0, L: 0 };
        }
        var o7 = { "-": "", _: " ", 0: "0" },
          o8 = /^\s*\d+/,
          o9 = /^%/,
          le = /[\\^$*+?|[\]().{}]/g;
        function lt(e, t, r) {
          var n = e < 0 ? "-" : "",
            i = (n ? -e : e) + "",
            a = i.length;
          return n + (a < r ? Array(r - a + 1).join(t) + i : i);
        }
        function lr(e) {
          return e.replace(le, "\\$&");
        }
        function ln(e) {
          return RegExp("^(?:" + e.map(lr).join("|") + ")", "i");
        }
        function li(e) {
          return new Map(e.map((e, t) => [e.toLowerCase(), t]));
        }
        function la(e, t, r) {
          var n = o8.exec(t.slice(r, r + 1));
          return n ? ((e.w = +n[0]), r + n[0].length) : -1;
        }
        function lo(e, t, r) {
          var n = o8.exec(t.slice(r, r + 1));
          return n ? ((e.u = +n[0]), r + n[0].length) : -1;
        }
        function ll(e, t, r) {
          var n = o8.exec(t.slice(r, r + 2));
          return n ? ((e.U = +n[0]), r + n[0].length) : -1;
        }
        function ls(e, t, r) {
          var n = o8.exec(t.slice(r, r + 2));
          return n ? ((e.V = +n[0]), r + n[0].length) : -1;
        }
        function lc(e, t, r) {
          var n = o8.exec(t.slice(r, r + 2));
          return n ? ((e.W = +n[0]), r + n[0].length) : -1;
        }
        function lu(e, t, r) {
          var n = o8.exec(t.slice(r, r + 4));
          return n ? ((e.y = +n[0]), r + n[0].length) : -1;
        }
        function ld(e, t, r) {
          var n = o8.exec(t.slice(r, r + 2));
          return n
            ? ((e.y = +n[0] + (+n[0] > 68 ? 1900 : 2e3)), r + n[0].length)
            : -1;
        }
        function lf(e, t, r) {
          var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(t.slice(r, r + 6));
          return n
            ? ((e.Z = n[1] ? 0 : -(n[2] + (n[3] || "00"))), r + n[0].length)
            : -1;
        }
        function lh(e, t, r) {
          var n = o8.exec(t.slice(r, r + 1));
          return n ? ((e.q = 3 * n[0] - 3), r + n[0].length) : -1;
        }
        function lp(e, t, r) {
          var n = o8.exec(t.slice(r, r + 2));
          return n ? ((e.m = n[0] - 1), r + n[0].length) : -1;
        }
        function ly(e, t, r) {
          var n = o8.exec(t.slice(r, r + 2));
          return n ? ((e.d = +n[0]), r + n[0].length) : -1;
        }
        function lm(e, t, r) {
          var n = o8.exec(t.slice(r, r + 3));
          return n ? ((e.m = 0), (e.d = +n[0]), r + n[0].length) : -1;
        }
        function lv(e, t, r) {
          var n = o8.exec(t.slice(r, r + 2));
          return n ? ((e.H = +n[0]), r + n[0].length) : -1;
        }
        function lg(e, t, r) {
          var n = o8.exec(t.slice(r, r + 2));
          return n ? ((e.M = +n[0]), r + n[0].length) : -1;
        }
        function lb(e, t, r) {
          var n = o8.exec(t.slice(r, r + 2));
          return n ? ((e.S = +n[0]), r + n[0].length) : -1;
        }
        function lx(e, t, r) {
          var n = o8.exec(t.slice(r, r + 3));
          return n ? ((e.L = +n[0]), r + n[0].length) : -1;
        }
        function lw(e, t, r) {
          var n = o8.exec(t.slice(r, r + 6));
          return n ? ((e.L = Math.floor(n[0] / 1e3)), r + n[0].length) : -1;
        }
        function lj(e, t, r) {
          var n = o9.exec(t.slice(r, r + 1));
          return n ? r + n[0].length : -1;
        }
        function lO(e, t, r) {
          var n = o8.exec(t.slice(r));
          return n ? ((e.Q = +n[0]), r + n[0].length) : -1;
        }
        function lP(e, t, r) {
          var n = o8.exec(t.slice(r));
          return n ? ((e.s = +n[0]), r + n[0].length) : -1;
        }
        function lS(e, t) {
          return lt(e.getDate(), t, 2);
        }
        function lk(e, t) {
          return lt(e.getHours(), t, 2);
        }
        function lN(e, t) {
          return lt(e.getHours() % 12 || 12, t, 2);
        }
        function lE(e, t) {
          return lt(1 + oA.count(oX(e), e), t, 3);
        }
        function l_(e, t) {
          return lt(e.getMilliseconds(), t, 3);
        }
        function lA(e, t) {
          return l_(e, t) + "000";
        }
        function lM(e, t) {
          return lt(e.getMonth() + 1, t, 2);
        }
        function lC(e, t) {
          return lt(e.getMinutes(), t, 2);
        }
        function lT(e, t) {
          return lt(e.getSeconds(), t, 2);
        }
        function lD(e) {
          var t = e.getDay();
          return 0 === t ? 7 : t;
        }
        function lI(e, t) {
          return lt(oD.count(oX(e) - 1, e), t, 2);
        }
        function lz(e) {
          var t = e.getDay();
          return t >= 4 || 0 === t ? oR(e) : oR.ceil(e);
        }
        function lL(e, t) {
          return (
            (e = lz(e)),
            lt(oR.count(oX(e), e) + (4 === oX(e).getDay()), t, 2)
          );
        }
        function lR(e) {
          return e.getDay();
        }
        function l$(e, t) {
          return lt(oI.count(oX(e) - 1, e), t, 2);
        }
        function lU(e, t) {
          return lt(e.getFullYear() % 100, t, 2);
        }
        function lF(e, t) {
          return lt((e = lz(e)).getFullYear() % 100, t, 2);
        }
        function lB(e, t) {
          return lt(e.getFullYear() % 1e4, t, 4);
        }
        function lK(e, t) {
          var r = e.getDay();
          return lt(
            (e = r >= 4 || 0 === r ? oR(e) : oR.ceil(e)).getFullYear() % 1e4,
            t,
            4,
          );
        }
        function lW(e) {
          var t = e.getTimezoneOffset();
          return (
            (t > 0 ? "-" : ((t *= -1), "+")) +
            lt((t / 60) | 0, "0", 2) +
            lt(t % 60, "0", 2)
          );
        }
        function lH(e, t) {
          return lt(e.getUTCDate(), t, 2);
        }
        function lq(e, t) {
          return lt(e.getUTCHours(), t, 2);
        }
        function lV(e, t) {
          return lt(e.getUTCHours() % 12 || 12, t, 2);
        }
        function lZ(e, t) {
          return lt(1 + oM.count(oQ(e), e), t, 3);
        }
        function lY(e, t) {
          return lt(e.getUTCMilliseconds(), t, 3);
        }
        function lG(e, t) {
          return lY(e, t) + "000";
        }
        function lX(e, t) {
          return lt(e.getUTCMonth() + 1, t, 2);
        }
        function lQ(e, t) {
          return lt(e.getUTCMinutes(), t, 2);
        }
        function lJ(e, t) {
          return lt(e.getUTCSeconds(), t, 2);
        }
        function l0(e) {
          var t = e.getUTCDay();
          return 0 === t ? 7 : t;
        }
        function l1(e, t) {
          return lt(oB.count(oQ(e) - 1, e), t, 2);
        }
        function l2(e) {
          var t = e.getUTCDay();
          return t >= 4 || 0 === t ? oq(e) : oq.ceil(e);
        }
        function l3(e, t) {
          return (
            (e = l2(e)),
            lt(oq.count(oQ(e), e) + (4 === oQ(e).getUTCDay()), t, 2)
          );
        }
        function l6(e) {
          return e.getUTCDay();
        }
        function l5(e, t) {
          return lt(oK.count(oQ(e) - 1, e), t, 2);
        }
        function l4(e, t) {
          return lt(e.getUTCFullYear() % 100, t, 2);
        }
        function l7(e, t) {
          return lt((e = l2(e)).getUTCFullYear() % 100, t, 2);
        }
        function l8(e, t) {
          return lt(e.getUTCFullYear() % 1e4, t, 4);
        }
        function l9(e, t) {
          var r = e.getUTCDay();
          return lt(
            (e = r >= 4 || 0 === r ? oq(e) : oq.ceil(e)).getUTCFullYear() % 1e4,
            t,
            4,
          );
        }
        function se() {
          return "+0000";
        }
        function st() {
          return "%";
        }
        function sr(e) {
          return +e;
        }
        function sn(e) {
          return Math.floor(+e / 1e3);
        }
        function si(e) {
          return new Date(e);
        }
        function sa(e) {
          return e instanceof Date ? +e : +new Date(+e);
        }
        function so(e, t, r, n, i, a, o, l, s, c) {
          var u = aq(),
            d = u.invert,
            f = u.domain,
            h = c(".%L"),
            p = c(":%S"),
            y = c("%I:%M"),
            m = c("%I %p"),
            v = c("%a %d"),
            g = c("%b %d"),
            b = c("%B"),
            x = c("%Y");
          function w(e) {
            return (
              s(e) < e
                ? h
                : l(e) < e
                  ? p
                  : o(e) < e
                    ? y
                    : a(e) < e
                      ? m
                      : n(e) < e
                        ? i(e) < e
                          ? v
                          : g
                        : r(e) < e
                          ? b
                          : x
            )(e);
          }
          return (
            (u.invert = function (e) {
              return new Date(d(e));
            }),
            (u.domain = function (e) {
              return arguments.length ? f(Array.from(e, sa)) : f().map(si);
            }),
            (u.ticks = function (t) {
              var r = f();
              return e(r[0], r[r.length - 1], null == t ? 10 : t);
            }),
            (u.tickFormat = function (e, t) {
              return null == t ? w : c(t);
            }),
            (u.nice = function (e) {
              var r = f();
              return (
                (e && "function" == typeof e.range) ||
                  (e = t(r[0], r[r.length - 1], null == e ? 10 : e)),
                e ? f(a5(r, e)) : u
              );
            }),
            (u.copy = function () {
              return aW(u, so(e, t, r, n, i, a, o, l, s, c));
            }),
            u
          );
        }
        function sl() {
          return iL.apply(
            so(o2, o3, oX, oY, oD, oA, oE, ok, oS, sA).domain([
              new Date(2e3, 0, 1),
              new Date(2e3, 0, 2),
            ]),
            arguments,
          );
        }
        function ss() {
          return iL.apply(
            so(o0, o1, oQ, oG, oB, oM, o_, oN, oS, sM).domain([
              Date.UTC(2e3, 0, 1),
              Date.UTC(2e3, 0, 2),
            ]),
            arguments,
          );
        }
        function sc() {
          var e,
            t,
            r,
            n,
            i,
            a = 0,
            o = 1,
            l = aU,
            s = !1;
          function c(t) {
            return null == t || isNaN((t = +t))
              ? i
              : l(
                  0 === r
                    ? 0.5
                    : ((t = (n(t) - e) * r),
                      s ? Math.max(0, Math.min(1, t)) : t),
                );
          }
          function u(e) {
            return function (t) {
              var r, n;
              return arguments.length
                ? (([r, n] = t), (l = e(r, n)), c)
                : [l(0), l(1)];
            };
          }
          return (
            (c.domain = function (i) {
              return arguments.length
                ? (([a, o] = i),
                  (e = n((a = +a))),
                  (t = n((o = +o))),
                  (r = e === t ? 0 : 1 / (t - e)),
                  c)
                : [a, o];
            }),
            (c.clamp = function (e) {
              return arguments.length ? ((s = !!e), c) : s;
            }),
            (c.interpolator = function (e) {
              return arguments.length ? ((l = e), c) : l;
            }),
            (c.range = u(az)),
            (c.rangeRound = u(aL)),
            (c.unknown = function (e) {
              return arguments.length ? ((i = e), c) : i;
            }),
            function (i) {
              return (
                (n = i),
                (e = i(a)),
                (t = i(o)),
                (r = e === t ? 0 : 1 / (t - e)),
                c
              );
            }
          );
        }
        function su(e, t) {
          return t
            .domain(e.domain())
            .interpolator(e.interpolator())
            .clamp(e.clamp())
            .unknown(e.unknown());
        }
        function sd() {
          var e = oc(sc());
          return (
            (e.copy = function () {
              return su(e, sd()).exponent(e.exponent());
            }),
            iR.apply(e, arguments)
          );
        }
        function sf() {
          return sd.apply(null, arguments).exponent(0.5);
        }
        function sh() {
          var e,
            t,
            r,
            n,
            i,
            a,
            o,
            l = 0,
            s = 0.5,
            c = 1,
            u = 1,
            d = aU,
            f = !1;
          function h(e) {
            return isNaN((e = +e))
              ? o
              : ((e = 0.5 + ((e = +a(e)) - t) * (u * e < u * t ? n : i)),
                d(f ? Math.max(0, Math.min(1, e)) : e));
          }
          function p(e) {
            return function (t) {
              var r, n, i;
              return arguments.length
                ? (([r, n, i] = t),
                  (d = (function (e, t) {
                    void 0 === t && ((t = e), (e = az));
                    for (
                      var r = 0,
                        n = t.length - 1,
                        i = t[0],
                        a = Array(n < 0 ? 0 : n);
                      r < n;
                    )
                      a[r] = e(i, (i = t[++r]));
                    return function (e) {
                      var t = Math.max(
                        0,
                        Math.min(n - 1, Math.floor((e *= n))),
                      );
                      return a[t](e - t);
                    };
                  })(e, [r, n, i])),
                  h)
                : [d(0), d(0.5), d(1)];
            };
          }
          return (
            (h.domain = function (o) {
              return arguments.length
                ? (([l, s, c] = o),
                  (e = a((l = +l))),
                  (t = a((s = +s))),
                  (r = a((c = +c))),
                  (n = e === t ? 0 : 0.5 / (t - e)),
                  (i = t === r ? 0 : 0.5 / (r - t)),
                  (u = t < e ? -1 : 1),
                  h)
                : [l, s, c];
            }),
            (h.clamp = function (e) {
              return arguments.length ? ((f = !!e), h) : f;
            }),
            (h.interpolator = function (e) {
              return arguments.length ? ((d = e), h) : d;
            }),
            (h.range = p(az)),
            (h.rangeRound = p(aL)),
            (h.unknown = function (e) {
              return arguments.length ? ((o = e), h) : o;
            }),
            function (o) {
              return (
                (a = o),
                (e = o(l)),
                (t = o(s)),
                (r = o(c)),
                (n = e === t ? 0 : 0.5 / (t - e)),
                (i = t === r ? 0 : 0.5 / (r - t)),
                (u = t < e ? -1 : 1),
                h
              );
            }
          );
        }
        function sp() {
          var e = oc(sh());
          return (
            (e.copy = function () {
              return su(e, sp()).exponent(e.exponent());
            }),
            iR.apply(e, arguments)
          );
        }
        function sy() {
          return sp.apply(null, arguments).exponent(0.5);
        }
        ((sA = (s_ = (function (e) {
          var t = e.dateTime,
            r = e.date,
            n = e.time,
            i = e.periods,
            a = e.days,
            o = e.shortDays,
            l = e.months,
            s = e.shortMonths,
            c = ln(i),
            u = li(i),
            d = ln(a),
            f = li(a),
            h = ln(o),
            p = li(o),
            y = ln(l),
            m = li(l),
            v = ln(s),
            g = li(s),
            b = {
              a: function (e) {
                return o[e.getDay()];
              },
              A: function (e) {
                return a[e.getDay()];
              },
              b: function (e) {
                return s[e.getMonth()];
              },
              B: function (e) {
                return l[e.getMonth()];
              },
              c: null,
              d: lS,
              e: lS,
              f: lA,
              g: lF,
              G: lK,
              H: lk,
              I: lN,
              j: lE,
              L: l_,
              m: lM,
              M: lC,
              p: function (e) {
                return i[+(e.getHours() >= 12)];
              },
              q: function (e) {
                return 1 + ~~(e.getMonth() / 3);
              },
              Q: sr,
              s: sn,
              S: lT,
              u: lD,
              U: lI,
              V: lL,
              w: lR,
              W: l$,
              x: null,
              X: null,
              y: lU,
              Y: lB,
              Z: lW,
              "%": st,
            },
            x = {
              a: function (e) {
                return o[e.getUTCDay()];
              },
              A: function (e) {
                return a[e.getUTCDay()];
              },
              b: function (e) {
                return s[e.getUTCMonth()];
              },
              B: function (e) {
                return l[e.getUTCMonth()];
              },
              c: null,
              d: lH,
              e: lH,
              f: lG,
              g: l7,
              G: l9,
              H: lq,
              I: lV,
              j: lZ,
              L: lY,
              m: lX,
              M: lQ,
              p: function (e) {
                return i[+(e.getUTCHours() >= 12)];
              },
              q: function (e) {
                return 1 + ~~(e.getUTCMonth() / 3);
              },
              Q: sr,
              s: sn,
              S: lJ,
              u: l0,
              U: l1,
              V: l3,
              w: l6,
              W: l5,
              x: null,
              X: null,
              y: l4,
              Y: l8,
              Z: se,
              "%": st,
            },
            w = {
              a: function (e, t, r) {
                var n = h.exec(t.slice(r));
                return n
                  ? ((e.w = p.get(n[0].toLowerCase())), r + n[0].length)
                  : -1;
              },
              A: function (e, t, r) {
                var n = d.exec(t.slice(r));
                return n
                  ? ((e.w = f.get(n[0].toLowerCase())), r + n[0].length)
                  : -1;
              },
              b: function (e, t, r) {
                var n = v.exec(t.slice(r));
                return n
                  ? ((e.m = g.get(n[0].toLowerCase())), r + n[0].length)
                  : -1;
              },
              B: function (e, t, r) {
                var n = y.exec(t.slice(r));
                return n
                  ? ((e.m = m.get(n[0].toLowerCase())), r + n[0].length)
                  : -1;
              },
              c: function (e, r, n) {
                return P(e, t, r, n);
              },
              d: ly,
              e: ly,
              f: lw,
              g: ld,
              G: lu,
              H: lv,
              I: lv,
              j: lm,
              L: lx,
              m: lp,
              M: lg,
              p: function (e, t, r) {
                var n = c.exec(t.slice(r));
                return n
                  ? ((e.p = u.get(n[0].toLowerCase())), r + n[0].length)
                  : -1;
              },
              q: lh,
              Q: lO,
              s: lP,
              S: lb,
              u: lo,
              U: ll,
              V: ls,
              w: la,
              W: lc,
              x: function (e, t, n) {
                return P(e, r, t, n);
              },
              X: function (e, t, r) {
                return P(e, n, t, r);
              },
              y: ld,
              Y: lu,
              Z: lf,
              "%": lj,
            };
          function j(e, t) {
            return function (r) {
              var n,
                i,
                a,
                o = [],
                l = -1,
                s = 0,
                c = e.length;
              for (r instanceof Date || (r = new Date(+r)); ++l < c; )
                37 === e.charCodeAt(l) &&
                  (o.push(e.slice(s, l)),
                  null != (i = o7[(n = e.charAt(++l))])
                    ? (n = e.charAt(++l))
                    : (i = "e" === n ? " " : "0"),
                  (a = t[n]) && (n = a(r, i)),
                  o.push(n),
                  (s = l + 1));
              return (o.push(e.slice(s, l)), o.join(""));
            };
          }
          function O(e, t) {
            return function (r) {
              var n,
                i,
                a = o4(1900, void 0, 1);
              if (P(a, e, (r += ""), 0) != r.length) return null;
              if ("Q" in a) return new Date(a.Q);
              if ("s" in a) return new Date(1e3 * a.s + ("L" in a ? a.L : 0));
              if (
                (!t || "Z" in a || (a.Z = 0),
                "p" in a && (a.H = (a.H % 12) + 12 * a.p),
                void 0 === a.m && (a.m = "q" in a ? a.q : 0),
                "V" in a)
              ) {
                if (a.V < 1 || a.V > 53) return null;
                ("w" in a || (a.w = 1),
                  "Z" in a
                    ? ((n =
                        (i = (n = o5(o4(a.y, 0, 1))).getUTCDay()) > 4 || 0 === i
                          ? oK.ceil(n)
                          : oK(n)),
                      (n = oM.offset(n, (a.V - 1) * 7)),
                      (a.y = n.getUTCFullYear()),
                      (a.m = n.getUTCMonth()),
                      (a.d = n.getUTCDate() + ((a.w + 6) % 7)))
                    : ((n =
                        (i = (n = o6(o4(a.y, 0, 1))).getDay()) > 4 || 0 === i
                          ? oI.ceil(n)
                          : oI(n)),
                      (n = oA.offset(n, (a.V - 1) * 7)),
                      (a.y = n.getFullYear()),
                      (a.m = n.getMonth()),
                      (a.d = n.getDate() + ((a.w + 6) % 7))));
              } else
                ("W" in a || "U" in a) &&
                  ("w" in a || (a.w = "u" in a ? a.u % 7 : "W" in a ? 1 : 0),
                  (i =
                    "Z" in a
                      ? o5(o4(a.y, 0, 1)).getUTCDay()
                      : o6(o4(a.y, 0, 1)).getDay()),
                  (a.m = 0),
                  (a.d =
                    "W" in a
                      ? ((a.w + 6) % 7) + 7 * a.W - ((i + 5) % 7)
                      : a.w + 7 * a.U - ((i + 6) % 7)));
              return "Z" in a
                ? ((a.H += (a.Z / 100) | 0), (a.M += a.Z % 100), o5(a))
                : o6(a);
            };
          }
          function P(e, t, r, n) {
            for (var i, a, o = 0, l = t.length, s = r.length; o < l; ) {
              if (n >= s) return -1;
              if (37 === (i = t.charCodeAt(o++))) {
                if (
                  !(a = w[(i = t.charAt(o++)) in o7 ? t.charAt(o++) : i]) ||
                  (n = a(e, r, n)) < 0
                )
                  return -1;
              } else if (i != r.charCodeAt(n++)) return -1;
            }
            return n;
          }
          return (
            (b.x = j(r, b)),
            (b.X = j(n, b)),
            (b.c = j(t, b)),
            (x.x = j(r, x)),
            (x.X = j(n, x)),
            (x.c = j(t, x)),
            {
              format: function (e) {
                var t = j((e += ""), b);
                return (
                  (t.toString = function () {
                    return e;
                  }),
                  t
                );
              },
              parse: function (e) {
                var t = O((e += ""), !1);
                return (
                  (t.toString = function () {
                    return e;
                  }),
                  t
                );
              },
              utcFormat: function (e) {
                var t = j((e += ""), x);
                return (
                  (t.toString = function () {
                    return e;
                  }),
                  t
                );
              },
              utcParse: function (e) {
                var t = O((e += ""), !0);
                return (
                  (t.toString = function () {
                    return e;
                  }),
                  t
                );
              },
            }
          );
        })({
          dateTime: "%x, %X",
          date: "%-m/%-d/%Y",
          time: "%-I:%M:%S %p",
          periods: ["AM", "PM"],
          days: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          months: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ],
          shortMonths: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
        })).format),
          s_.parse,
          (sM = s_.utcFormat),
          s_.utcParse);
        var sm = (e) => e.chartData,
          sv = n_([sm], (e) => {
            var t = null != e.chartData ? e.chartData.length - 1 : 0;
            return {
              chartData: e.chartData,
              computedData: e.computedData,
              dataEndIndex: t,
              dataStartIndex: 0,
            };
          }),
          sg = (e, t, r, n) => (n ? sv(e) : sm(e));
        function sb(e) {
          if (Array.isArray(e) && 2 === e.length) {
            var [t, r] = e;
            if (R(t) && R(r)) return !0;
          }
          return !1;
        }
        function sx(e, t, r) {
          return r ? e : [Math.min(e[0], t[0]), Math.max(e[1], t[1])];
        }
        function sw(e, t) {
          if (
            t &&
            "function" != typeof e &&
            Array.isArray(e) &&
            2 === e.length
          ) {
            var r,
              n,
              [i, a] = e;
            if (R(i)) r = i;
            else if ("function" == typeof i) return;
            if (R(a)) n = a;
            else if ("function" == typeof a) return;
            var o = [r, n];
            if (sb(o)) return o;
          }
        }
        var sj,
          sO,
          sP,
          sS,
          sk,
          sN,
          sE,
          s_,
          sA,
          sM,
          sC,
          sT,
          sD = !0,
          sI = "[DecimalError] ",
          sz = sI + "Invalid argument: ",
          sL = sI + "Exponent out of range: ",
          sR = Math.floor,
          s$ = Math.pow,
          sU = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
          sF = sR(1286742750677284.5),
          sB = {};
        function sK(e, t) {
          var r,
            n,
            i,
            a,
            o,
            l,
            s,
            c,
            u = e.constructor,
            d = u.precision;
          if (!e.s || !t.s) return (t.s || (t = new u(e)), sD ? sJ(t, d) : t);
          if (
            ((s = e.d),
            (c = t.d),
            (o = e.e),
            (i = t.e),
            (s = s.slice()),
            (a = o - i))
          ) {
            for (
              a < 0
                ? ((n = s), (a = -a), (l = c.length))
                : ((n = c), (i = o), (l = s.length)),
                a > (l = (o = Math.ceil(d / 7)) > l ? o + 1 : l + 1) &&
                  ((a = l), (n.length = 1)),
                n.reverse();
              a--;
            )
              n.push(0);
            n.reverse();
          }
          for (
            (l = s.length) - (a = c.length) < 0 &&
              ((a = l), (n = c), (c = s), (s = n)),
              r = 0;
            a;
          )
            ((r = ((s[--a] = s[a] + c[a] + r) / 1e7) | 0), (s[a] %= 1e7));
          for (r && (s.unshift(r), ++i), l = s.length; 0 == s[--l]; ) s.pop();
          return ((t.d = s), (t.e = i), sD ? sJ(t, d) : t);
        }
        function sW(e, t, r) {
          if (e !== ~~e || e < t || e > r) throw Error(sz + e);
        }
        function sH(e) {
          var t,
            r,
            n,
            i = e.length - 1,
            a = "",
            o = e[0];
          if (i > 0) {
            for (a += o, t = 1; t < i; t++)
              ((r = 7 - (n = e[t] + "").length) && (a += sG(r)), (a += n));
            (r = 7 - (n = (o = e[t]) + "").length) && (a += sG(r));
          } else if (0 === o) return "0";
          for (; o % 10 == 0; ) o /= 10;
          return a + o;
        }
        ((sB.absoluteValue = sB.abs =
          function () {
            var e = new this.constructor(this);
            return (e.s && (e.s = 1), e);
          }),
          (sB.comparedTo = sB.cmp =
            function (e) {
              var t, r, n, i;
              if (((e = new this.constructor(e)), this.s !== e.s))
                return this.s || -e.s;
              if (this.e !== e.e) return (this.e > e.e) ^ (this.s < 0) ? 1 : -1;
              for (
                t = 0, r = (n = this.d.length) < (i = e.d.length) ? n : i;
                t < r;
                ++t
              )
                if (this.d[t] !== e.d[t])
                  return (this.d[t] > e.d[t]) ^ (this.s < 0) ? 1 : -1;
              return n === i ? 0 : (n > i) ^ (this.s < 0) ? 1 : -1;
            }),
          (sB.decimalPlaces = sB.dp =
            function () {
              var e = this.d.length - 1,
                t = (e - this.e) * 7;
              if ((e = this.d[e])) for (; e % 10 == 0; e /= 10) t--;
              return t < 0 ? 0 : t;
            }),
          (sB.dividedBy = sB.div =
            function (e) {
              return sq(this, new this.constructor(e));
            }),
          (sB.dividedToIntegerBy = sB.idiv =
            function (e) {
              var t = this.constructor;
              return sJ(sq(this, new t(e), 0, 1), t.precision);
            }),
          (sB.equals = sB.eq =
            function (e) {
              return !this.cmp(e);
            }),
          (sB.exponent = function () {
            return sZ(this);
          }),
          (sB.greaterThan = sB.gt =
            function (e) {
              return this.cmp(e) > 0;
            }),
          (sB.greaterThanOrEqualTo = sB.gte =
            function (e) {
              return this.cmp(e) >= 0;
            }),
          (sB.isInteger = sB.isint =
            function () {
              return this.e > this.d.length - 2;
            }),
          (sB.isNegative = sB.isneg =
            function () {
              return this.s < 0;
            }),
          (sB.isPositive = sB.ispos =
            function () {
              return this.s > 0;
            }),
          (sB.isZero = function () {
            return 0 === this.s;
          }),
          (sB.lessThan = sB.lt =
            function (e) {
              return 0 > this.cmp(e);
            }),
          (sB.lessThanOrEqualTo = sB.lte =
            function (e) {
              return 1 > this.cmp(e);
            }),
          (sB.logarithm = sB.log =
            function (e) {
              var t,
                r = this.constructor,
                n = r.precision,
                i = n + 5;
              if (void 0 === e) e = new r(10);
              else if ((e = new r(e)).s < 1 || e.eq(sT))
                throw Error(sI + "NaN");
              if (this.s < 1) throw Error(sI + (this.s ? "NaN" : "-Infinity"));
              return this.eq(sT)
                ? new r(0)
                : ((sD = !1),
                  (t = sq(sX(this, i), sX(e, i), i)),
                  (sD = !0),
                  sJ(t, n));
            }),
          (sB.minus = sB.sub =
            function (e) {
              return (
                (e = new this.constructor(e)),
                this.s == e.s ? s0(this, e) : sK(this, ((e.s = -e.s), e))
              );
            }),
          (sB.modulo = sB.mod =
            function (e) {
              var t,
                r = this.constructor,
                n = r.precision;
              if (!(e = new r(e)).s) throw Error(sI + "NaN");
              return this.s
                ? ((sD = !1),
                  (t = sq(this, e, 0, 1).times(e)),
                  (sD = !0),
                  this.minus(t))
                : sJ(new r(this), n);
            }),
          (sB.naturalExponential = sB.exp =
            function () {
              return sV(this);
            }),
          (sB.naturalLogarithm = sB.ln =
            function () {
              return sX(this);
            }),
          (sB.negated = sB.neg =
            function () {
              var e = new this.constructor(this);
              return ((e.s = -e.s || 0), e);
            }),
          (sB.plus = sB.add =
            function (e) {
              return (
                (e = new this.constructor(e)),
                this.s == e.s ? sK(this, e) : s0(this, ((e.s = -e.s), e))
              );
            }),
          (sB.precision = sB.sd =
            function (e) {
              var t, r, n;
              if (void 0 !== e && !!e !== e && 1 !== e && 0 !== e)
                throw Error(sz + e);
              if (
                ((t = sZ(this) + 1),
                (r = 7 * (n = this.d.length - 1) + 1),
                (n = this.d[n]))
              ) {
                for (; n % 10 == 0; n /= 10) r--;
                for (n = this.d[0]; n >= 10; n /= 10) r++;
              }
              return e && t > r ? t : r;
            }),
          (sB.squareRoot = sB.sqrt =
            function () {
              var e,
                t,
                r,
                n,
                i,
                a,
                o,
                l = this.constructor;
              if (this.s < 1) {
                if (!this.s) return new l(0);
                throw Error(sI + "NaN");
              }
              for (
                e = sZ(this),
                  sD = !1,
                  0 == (i = Math.sqrt(+this)) || i == 1 / 0
                    ? (((t = sH(this.d)).length + e) % 2 == 0 && (t += "0"),
                      (i = Math.sqrt(t)),
                      (e = sR((e + 1) / 2) - (e < 0 || e % 2)),
                      (n = new l(
                        (t =
                          i == 1 / 0
                            ? "5e" + e
                            : (t = i.toExponential()).slice(
                                0,
                                t.indexOf("e") + 1,
                              ) + e),
                      )))
                    : (n = new l(i.toString())),
                  i = o = (r = l.precision) + 3;
                ;
              )
                if (
                  ((n = (a = n).plus(sq(this, a, o + 2)).times(0.5)),
                  sH(a.d).slice(0, o) === (t = sH(n.d)).slice(0, o))
                ) {
                  if (((t = t.slice(o - 3, o + 1)), i == o && "4999" == t)) {
                    if ((sJ(a, r + 1, 0), a.times(a).eq(this))) {
                      n = a;
                      break;
                    }
                  } else if ("9999" != t) break;
                  o += 4;
                }
              return ((sD = !0), sJ(n, r));
            }),
          (sB.times = sB.mul =
            function (e) {
              var t,
                r,
                n,
                i,
                a,
                o,
                l,
                s,
                c,
                u = this.constructor,
                d = this.d,
                f = (e = new u(e)).d;
              if (!this.s || !e.s) return new u(0);
              for (
                e.s *= this.s,
                  r = this.e + e.e,
                  (s = d.length) < (c = f.length) &&
                    ((a = d), (d = f), (f = a), (o = s), (s = c), (c = o)),
                  a = [],
                  n = o = s + c;
                n--;
              )
                a.push(0);
              for (n = c; --n >= 0; ) {
                for (t = 0, i = s + n; i > n; )
                  ((l = a[i] + f[n] * d[i - n - 1] + t),
                    (a[i--] = (l % 1e7) | 0),
                    (t = (l / 1e7) | 0));
                a[i] = ((a[i] + t) % 1e7) | 0;
              }
              for (; !a[--o]; ) a.pop();
              return (
                t ? ++r : a.shift(),
                (e.d = a),
                (e.e = r),
                sD ? sJ(e, u.precision) : e
              );
            }),
          (sB.toDecimalPlaces = sB.todp =
            function (e, t) {
              var r = this,
                n = r.constructor;
              return ((r = new n(r)), void 0 === e)
                ? r
                : (sW(e, 0, 1e9),
                  void 0 === t ? (t = n.rounding) : sW(t, 0, 8),
                  sJ(r, e + sZ(r) + 1, t));
            }),
          (sB.toExponential = function (e, t) {
            var r,
              n = this,
              i = n.constructor;
            return (
              void 0 === e
                ? (r = s1(n, !0))
                : (sW(e, 0, 1e9),
                  void 0 === t ? (t = i.rounding) : sW(t, 0, 8),
                  (r = s1((n = sJ(new i(n), e + 1, t)), !0, e + 1))),
              r
            );
          }),
          (sB.toFixed = function (e, t) {
            var r,
              n,
              i = this.constructor;
            return void 0 === e
              ? s1(this)
              : (sW(e, 0, 1e9),
                void 0 === t ? (t = i.rounding) : sW(t, 0, 8),
                (r = s1(
                  (n = sJ(new i(this), e + sZ(this) + 1, t)).abs(),
                  !1,
                  e + sZ(n) + 1,
                )),
                this.isneg() && !this.isZero() ? "-" + r : r);
          }),
          (sB.toInteger = sB.toint =
            function () {
              var e = this.constructor;
              return sJ(new e(this), sZ(this) + 1, e.rounding);
            }),
          (sB.toNumber = function () {
            return +this;
          }),
          (sB.toPower = sB.pow =
            function (e) {
              var t,
                r,
                n,
                i,
                a,
                o,
                l = this,
                s = l.constructor,
                c = +(e = new s(e));
              if (!e.s) return new s(sT);
              if (!(l = new s(l)).s) {
                if (e.s < 1) throw Error(sI + "Infinity");
                return l;
              }
              if (l.eq(sT)) return l;
              if (((n = s.precision), e.eq(sT))) return sJ(l, n);
              if (((o = (t = e.e) >= (r = e.d.length - 1)), (a = l.s), o)) {
                if ((r = c < 0 ? -c : c) <= 9007199254740991) {
                  for (
                    i = new s(sT), t = Math.ceil(n / 7 + 4), sD = !1;
                    r % 2 && s2((i = i.times(l)).d, t), 0 !== (r = sR(r / 2));
                  )
                    s2((l = l.times(l)).d, t);
                  return ((sD = !0), e.s < 0 ? new s(sT).div(i) : sJ(i, n));
                }
              } else if (a < 0) throw Error(sI + "NaN");
              return (
                (a = a < 0 && 1 & e.d[Math.max(t, r)] ? -1 : 1),
                (l.s = 1),
                (sD = !1),
                (i = e.times(sX(l, n + 12))),
                (sD = !0),
                ((i = sV(i)).s = a),
                i
              );
            }),
          (sB.toPrecision = function (e, t) {
            var r,
              n,
              i = this,
              a = i.constructor;
            return (
              void 0 === e
                ? ((r = sZ(i)), (n = s1(i, r <= a.toExpNeg || r >= a.toExpPos)))
                : (sW(e, 1, 1e9),
                  void 0 === t ? (t = a.rounding) : sW(t, 0, 8),
                  (r = sZ((i = sJ(new a(i), e, t)))),
                  (n = s1(i, e <= r || r <= a.toExpNeg, e))),
              n
            );
          }),
          (sB.toSignificantDigits = sB.tosd =
            function (e, t) {
              var r = this.constructor;
              return (
                void 0 === e
                  ? ((e = r.precision), (t = r.rounding))
                  : (sW(e, 1, 1e9),
                    void 0 === t ? (t = r.rounding) : sW(t, 0, 8)),
                sJ(new r(this), e, t)
              );
            }),
          (sB.toString =
            sB.valueOf =
            sB.val =
            sB.toJSON =
            sB[Symbol.for("nodejs.util.inspect.custom")] =
              function () {
                var e = sZ(this),
                  t = this.constructor;
                return s1(this, e <= t.toExpNeg || e >= t.toExpPos);
              }));
        var sq = (function () {
          function e(e, t) {
            var r,
              n = 0,
              i = e.length;
            for (e = e.slice(); i--; )
              ((r = e[i] * t + n), (e[i] = (r % 1e7) | 0), (n = (r / 1e7) | 0));
            return (n && e.unshift(n), e);
          }
          function t(e, t, r, n) {
            var i, a;
            if (r != n) a = r > n ? 1 : -1;
            else
              for (i = a = 0; i < r; i++)
                if (e[i] != t[i]) {
                  a = e[i] > t[i] ? 1 : -1;
                  break;
                }
            return a;
          }
          function r(e, t, r) {
            for (var n = 0; r--; )
              ((e[r] -= n),
                (n = e[r] < t[r] ? 1 : 0),
                (e[r] = 1e7 * n + e[r] - t[r]));
            for (; !e[0] && e.length > 1; ) e.shift();
          }
          return function (n, i, a, o) {
            var l,
              s,
              c,
              u,
              d,
              f,
              h,
              p,
              y,
              m,
              v,
              g,
              b,
              x,
              w,
              j,
              O,
              P,
              S = n.constructor,
              k = n.s == i.s ? 1 : -1,
              N = n.d,
              E = i.d;
            if (!n.s) return new S(n);
            if (!i.s) throw Error(sI + "Division by zero");
            for (
              c = 0,
                s = n.e - i.e,
                O = E.length,
                w = N.length,
                p = (h = new S(k)).d = [];
              E[c] == (N[c] || 0);
            )
              ++c;
            if (
              (E[c] > (N[c] || 0) && --s,
              (g =
                null == a
                  ? (a = S.precision)
                  : o
                    ? a + (sZ(n) - sZ(i)) + 1
                    : a) < 0)
            )
              return new S(0);
            if (((g = (g / 7 + 2) | 0), (c = 0), 1 == O))
              for (u = 0, E = E[0], g++; (c < w || u) && g--; c++)
                ((b = 1e7 * u + (N[c] || 0)),
                  (p[c] = (b / E) | 0),
                  (u = (b % E) | 0));
            else {
              for (
                (u = (1e7 / (E[0] + 1)) | 0) > 1 &&
                  ((E = e(E, u)),
                  (N = e(N, u)),
                  (O = E.length),
                  (w = N.length)),
                  x = O,
                  m = (y = N.slice(0, O)).length;
                m < O;
              )
                y[m++] = 0;
              ((P = E.slice()).unshift(0), (j = E[0]), E[1] >= 1e7 / 2 && ++j);
              do
                ((u = 0),
                  (l = t(E, y, O, m)) < 0
                    ? ((v = y[0]),
                      O != m && (v = 1e7 * v + (y[1] || 0)),
                      (u = (v / j) | 0) > 1
                        ? (u >= 1e7 && (u = 1e7 - 1),
                          (f = (d = e(E, u)).length),
                          (m = y.length),
                          1 == (l = t(d, y, f, m)) &&
                            (u--, r(d, O < f ? P : E, f)))
                        : (0 == u && (l = u = 1), (d = E.slice())),
                      (f = d.length) < m && d.unshift(0),
                      r(y, d, m),
                      -1 == l &&
                        ((m = y.length),
                        (l = t(E, y, O, m)) < 1 &&
                          (u++, r(y, O < m ? P : E, m))),
                      (m = y.length))
                    : 0 === l && (u++, (y = [0])),
                  (p[c++] = u),
                  l && y[0] ? (y[m++] = N[x] || 0) : ((y = [N[x]]), (m = 1)));
              while ((x++ < w || void 0 !== y[0]) && g--);
            }
            return (p[0] || p.shift(), (h.e = s), sJ(h, o ? a + sZ(h) + 1 : a));
          };
        })();
        function sV(e, t) {
          var r,
            n,
            i,
            a,
            o,
            l = 0,
            s = 0,
            c = e.constructor,
            u = c.precision;
          if (sZ(e) > 16) throw Error(sL + sZ(e));
          if (!e.s) return new c(sT);
          for (
            null == t ? ((sD = !1), (o = u)) : (o = t), a = new c(0.03125);
            e.abs().gte(0.1);
          )
            ((e = e.times(a)), (s += 5));
          for (
            o += ((Math.log(s$(2, s)) / Math.LN10) * 2 + 5) | 0,
              r = n = i = new c(sT),
              c.precision = o;
            ;
          ) {
            if (
              ((n = sJ(n.times(e), o)),
              (r = r.times(++l)),
              sH((a = i.plus(sq(n, r, o))).d).slice(0, o) ===
                sH(i.d).slice(0, o))
            ) {
              for (; s--; ) i = sJ(i.times(i), o);
              return ((c.precision = u), null == t ? ((sD = !0), sJ(i, u)) : i);
            }
            i = a;
          }
        }
        function sZ(e) {
          for (var t = 7 * e.e, r = e.d[0]; r >= 10; r /= 10) t++;
          return t;
        }
        function sY(e, t, r) {
          if (t > e.LN10.sd())
            throw (
              (sD = !0),
              r && (e.precision = r),
              Error(sI + "LN10 precision limit exceeded")
            );
          return sJ(new e(e.LN10), t);
        }
        function sG(e) {
          for (var t = ""; e--; ) t += "0";
          return t;
        }
        function sX(e, t) {
          var r,
            n,
            i,
            a,
            o,
            l,
            s,
            c,
            u,
            d = 1,
            f = e,
            h = f.d,
            p = f.constructor,
            y = p.precision;
          if (f.s < 1) throw Error(sI + (f.s ? "NaN" : "-Infinity"));
          if (f.eq(sT)) return new p(0);
          if ((null == t ? ((sD = !1), (c = y)) : (c = t), f.eq(10)))
            return (null == t && (sD = !0), sY(p, c));
          if (
            ((c += 10),
            (p.precision = c),
            (n = (r = sH(h)).charAt(0)),
            !(15e14 > Math.abs((a = sZ(f)))))
          )
            return (
              (s = sY(p, c + 2, y).times(a + "")),
              (f = sX(new p(n + "." + r.slice(1)), c - 10).plus(s)),
              (p.precision = y),
              null == t ? ((sD = !0), sJ(f, y)) : f
            );
          for (; (n < 7 && 1 != n) || (1 == n && r.charAt(1) > 3); )
            ((n = (r = sH((f = f.times(e)).d)).charAt(0)), d++);
          for (
            a = sZ(f),
              n > 1
                ? ((f = new p("0." + r)), a++)
                : (f = new p(n + "." + r.slice(1))),
              l = o = f = sq(f.minus(sT), f.plus(sT), c),
              u = sJ(f.times(f), c),
              i = 3;
            ;
          ) {
            if (
              ((o = sJ(o.times(u), c)),
              sH((s = l.plus(sq(o, new p(i), c))).d).slice(0, c) ===
                sH(l.d).slice(0, c))
            )
              return (
                (l = l.times(2)),
                0 !== a && (l = l.plus(sY(p, c + 2, y).times(a + ""))),
                (l = sq(l, new p(d), c)),
                (p.precision = y),
                null == t ? ((sD = !0), sJ(l, y)) : l
              );
            ((l = s), (i += 2));
          }
        }
        function sQ(e, t) {
          var r, n, i;
          for (
            (r = t.indexOf(".")) > -1 && (t = t.replace(".", "")),
              (n = t.search(/e/i)) > 0
                ? (r < 0 && (r = n),
                  (r += +t.slice(n + 1)),
                  (t = t.substring(0, n)))
                : r < 0 && (r = t.length),
              n = 0;
            48 === t.charCodeAt(n);
          )
            ++n;
          for (i = t.length; 48 === t.charCodeAt(i - 1); ) --i;
          if ((t = t.slice(n, i))) {
            if (
              ((i -= n),
              (r = r - n - 1),
              (e.e = sR(r / 7)),
              (e.d = []),
              (n = (r + 1) % 7),
              r < 0 && (n += 7),
              n < i)
            ) {
              for (n && e.d.push(+t.slice(0, n)), i -= 7; n < i; )
                e.d.push(+t.slice(n, (n += 7)));
              n = 7 - (t = t.slice(n)).length;
            } else n -= i;
            for (; n--; ) t += "0";
            if ((e.d.push(+t), sD && (e.e > sF || e.e < -sF)))
              throw Error(sL + r);
          } else ((e.s = 0), (e.e = 0), (e.d = [0]));
          return e;
        }
        function sJ(e, t, r) {
          var n,
            i,
            a,
            o,
            l,
            s,
            c,
            u,
            d = e.d;
          for (o = 1, a = d[0]; a >= 10; a /= 10) o++;
          if ((n = t - o) < 0) ((n += 7), (i = t), (c = d[(u = 0)]));
          else {
            if ((u = Math.ceil((n + 1) / 7)) >= (a = d.length)) return e;
            for (o = 1, c = a = d[u]; a >= 10; a /= 10) o++;
            ((n %= 7), (i = n - 7 + o));
          }
          if (
            (void 0 !== r &&
              ((l = ((c / (a = s$(10, o - i - 1))) % 10) | 0),
              (s = t < 0 || void 0 !== d[u + 1] || c % a),
              (s =
                r < 4
                  ? (l || s) && (0 == r || r == (e.s < 0 ? 3 : 2))
                  : l > 5 ||
                    (5 == l &&
                      (4 == r ||
                        s ||
                        (6 == r &&
                          ((n > 0
                            ? i > 0
                              ? c / s$(10, o - i)
                              : 0
                            : d[u - 1]) %
                            10) &
                            1) ||
                        r == (e.s < 0 ? 8 : 7))))),
            t < 1 || !d[0])
          )
            return (
              s
                ? ((a = sZ(e)),
                  (d.length = 1),
                  (t = t - a - 1),
                  (d[0] = s$(10, (7 - (t % 7)) % 7)),
                  (e.e = sR(-t / 7) || 0))
                : ((d.length = 1), (d[0] = e.e = e.s = 0)),
              e
            );
          if (
            (0 == n
              ? ((d.length = u), (a = 1), u--)
              : ((d.length = u + 1),
                (a = s$(10, 7 - n)),
                (d[u] =
                  i > 0 ? (((c / s$(10, o - i)) % s$(10, i)) | 0) * a : 0)),
            s)
          )
            for (;;) {
              if (0 == u) {
                1e7 == (d[0] += a) && ((d[0] = 1), ++e.e);
                break;
              }
              if (((d[u] += a), 1e7 != d[u])) break;
              ((d[u--] = 0), (a = 1));
            }
          for (n = d.length; 0 === d[--n]; ) d.pop();
          if (sD && (e.e > sF || e.e < -sF)) throw Error(sL + sZ(e));
          return e;
        }
        function s0(e, t) {
          var r,
            n,
            i,
            a,
            o,
            l,
            s,
            c,
            u,
            d,
            f = e.constructor,
            h = f.precision;
          if (!e.s || !t.s)
            return (t.s ? (t.s = -t.s) : (t = new f(e)), sD ? sJ(t, h) : t);
          if (
            ((s = e.d),
            (d = t.d),
            (n = t.e),
            (c = e.e),
            (s = s.slice()),
            (o = c - n))
          ) {
            for (
              (u = o < 0)
                ? ((r = s), (o = -o), (l = d.length))
                : ((r = d), (n = c), (l = s.length)),
                o > (i = Math.max(Math.ceil(h / 7), l) + 2) &&
                  ((o = i), (r.length = 1)),
                r.reverse(),
                i = o;
              i--;
            )
              r.push(0);
            r.reverse();
          } else {
            for (
              (u = (i = s.length) < (l = d.length)) && (l = i), i = 0;
              i < l;
              i++
            )
              if (s[i] != d[i]) {
                u = s[i] < d[i];
                break;
              }
            o = 0;
          }
          for (
            u && ((r = s), (s = d), (d = r), (t.s = -t.s)),
              l = s.length,
              i = d.length - l;
            i > 0;
            --i
          )
            s[l++] = 0;
          for (i = d.length; i > o; ) {
            if (s[--i] < d[i]) {
              for (a = i; a && 0 === s[--a]; ) s[a] = 1e7 - 1;
              (--s[a], (s[i] += 1e7));
            }
            s[i] -= d[i];
          }
          for (; 0 === s[--l]; ) s.pop();
          for (; 0 === s[0]; s.shift()) --n;
          return s[0] ? ((t.d = s), (t.e = n), sD ? sJ(t, h) : t) : new f(0);
        }
        function s1(e, t, r) {
          var n,
            i = sZ(e),
            a = sH(e.d),
            o = a.length;
          return (
            t
              ? (r && (n = r - o) > 0
                  ? (a = a.charAt(0) + "." + a.slice(1) + sG(n))
                  : o > 1 && (a = a.charAt(0) + "." + a.slice(1)),
                (a = a + (i < 0 ? "e" : "e+") + i))
              : i < 0
                ? ((a = "0." + sG(-i - 1) + a),
                  r && (n = r - o) > 0 && (a += sG(n)))
                : i >= o
                  ? ((a += sG(i + 1 - o)),
                    r && (n = r - i - 1) > 0 && (a = a + "." + sG(n)))
                  : ((n = i + 1) < o && (a = a.slice(0, n) + "." + a.slice(n)),
                    r &&
                      (n = r - o) > 0 &&
                      (i + 1 === o && (a += "."), (a += sG(n)))),
            e.s < 0 ? "-" + a : a
          );
        }
        function s2(e, t) {
          if (e.length > t) return ((e.length = t), !0);
        }
        function s3(e) {
          if (!e || "object" != typeof e) throw Error(sI + "Object expected");
          var t,
            r,
            n,
            i = [
              "precision",
              1,
              1e9,
              "rounding",
              0,
              8,
              "toExpNeg",
              -1 / 0,
              0,
              "toExpPos",
              0,
              1 / 0,
            ];
          for (t = 0; t < i.length; t += 3)
            if (void 0 !== (n = e[(r = i[t])])) {
              if (sR(n) === n && n >= i[t + 1] && n <= i[t + 2]) this[r] = n;
              else throw Error(sz + r + ": " + n);
            }
          if (void 0 !== (n = e[(r = "LN10")])) {
            if (n == Math.LN10) this[r] = new this(n);
            else throw Error(sz + r + ": " + n);
          }
          return this;
        }
        var sC = (function e(t) {
          var r, n, i;
          function a(e) {
            if (!(this instanceof a)) return new a(e);
            if (((this.constructor = a), e instanceof a)) {
              ((this.s = e.s),
                (this.e = e.e),
                (this.d = (e = e.d) ? e.slice() : e));
              return;
            }
            if ("number" == typeof e) {
              if (0 * e != 0) throw Error(sz + e);
              if (e > 0) this.s = 1;
              else if (e < 0) ((e = -e), (this.s = -1));
              else {
                ((this.s = 0), (this.e = 0), (this.d = [0]));
                return;
              }
              if (e === ~~e && e < 1e7) {
                ((this.e = 0), (this.d = [e]));
                return;
              }
              return sQ(this, e.toString());
            }
            if ("string" != typeof e) throw Error(sz + e);
            if (
              (45 === e.charCodeAt(0)
                ? ((e = e.slice(1)), (this.s = -1))
                : (this.s = 1),
              sU.test(e))
            )
              sQ(this, e);
            else throw Error(sz + e);
          }
          if (
            ((a.prototype = sB),
            (a.ROUND_UP = 0),
            (a.ROUND_DOWN = 1),
            (a.ROUND_CEIL = 2),
            (a.ROUND_FLOOR = 3),
            (a.ROUND_HALF_UP = 4),
            (a.ROUND_HALF_DOWN = 5),
            (a.ROUND_HALF_EVEN = 6),
            (a.ROUND_HALF_CEIL = 7),
            (a.ROUND_HALF_FLOOR = 8),
            (a.clone = e),
            (a.config = a.set = s3),
            void 0 === t && (t = {}),
            t)
          )
            for (
              r = 0,
                i = ["precision", "rounding", "toExpNeg", "toExpPos", "LN10"];
              r < i.length;
            )
              t.hasOwnProperty((n = i[r++])) || (t[n] = this[n]);
          return (a.config(t), a);
        })({
          precision: 20,
          rounding: 4,
          toExpNeg: -7,
          toExpPos: 21,
          LN10: "2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286",
        });
        sT = new sC(1);
        let s6 = sC;
        var s5 = (e) => e,
          s4 = {},
          s7 = (e) => e === s4,
          s8 = (e) =>
            function t() {
              return 0 == arguments.length ||
                (1 == arguments.length &&
                  s7(arguments.length <= 0 ? void 0 : arguments[0]))
                ? t
                : e(...arguments);
            },
          s9 = (e, t) =>
            1 === e
              ? t
              : s8(function () {
                  for (
                    var r = arguments.length, n = Array(r), i = 0;
                    i < r;
                    i++
                  )
                    n[i] = arguments[i];
                  var a = n.filter((e) => e !== s4).length;
                  return a >= e
                    ? t(...n)
                    : s9(
                        e - a,
                        s8(function () {
                          for (
                            var e = arguments.length, r = Array(e), i = 0;
                            i < e;
                            i++
                          )
                            r[i] = arguments[i];
                          return t(
                            ...n.map((e) => (s7(e) ? r.shift() : e)),
                            ...r,
                          );
                        }),
                      );
                }),
          ce = (e, t) => {
            for (var r = [], n = e; n < t; ++n) r[n - e] = n;
            return r;
          },
          ct = s9(
            (n = (e, t) =>
              Array.isArray(t)
                ? t.map(e)
                : Object.keys(t)
                    .map((e) => t[e])
                    .map(e)).length,
            n,
          ),
          cr = function () {
            for (var e = arguments.length, t = Array(e), r = 0; r < e; r++)
              t[r] = arguments[r];
            if (!t.length) return s5;
            var n = t.reverse(),
              i = n[0],
              a = n.slice(1);
            return function () {
              return a.reduce((e, t) => t(e), i(...arguments));
            };
          },
          cn = (e) =>
            Array.isArray(e) ? e.reverse() : e.split("").reverse().join("");
        function ci(e) {
          return 0 === e
            ? 1
            : Math.floor(new s6(e).abs().log(10).toNumber()) + 1;
        }
        function ca(e, t, r) {
          for (var n = new s6(e), i = 0, a = []; n.lt(t) && i < 1e5; )
            (a.push(n.toNumber()), (n = n.add(r)), i++);
          return a;
        }
        var co = (e) => {
            var [t, r] = e,
              [n, i] = [t, r];
            return (t > r && ([n, i] = [r, t]), [n, i]);
          },
          cl = (e, t, r) => {
            if (e.lte(0)) return new s6(0);
            var n = ci(e.toNumber()),
              i = new s6(10).pow(n),
              a = e.div(i),
              o = 1 !== n ? 0.05 : 0.1,
              l = new s6(Math.ceil(a.div(o).toNumber())).add(r).mul(o).mul(i);
            return new s6(t ? l.toNumber() : Math.ceil(l.toNumber()));
          },
          cs = (e, t, r) => {
            var n = new s6(1),
              i = new s6(e);
            if (!i.isint() && r) {
              var a = Math.abs(e);
              a < 1
                ? ((n = new s6(10).pow(ci(e) - 1)),
                  (i = new s6(Math.floor(i.div(n).toNumber())).mul(n)))
                : a > 1 && (i = new s6(Math.floor(e)));
            } else
              0 === e
                ? (i = new s6(Math.floor((t - 1) / 2)))
                : r || (i = new s6(Math.floor(e)));
            var o = Math.floor((t - 1) / 2);
            return cr(
              ct((e) => i.add(new s6(e - o).mul(n)).toNumber()),
              ce,
            )(0, t);
          },
          cc = function (e, t, r, n) {
            var i,
              a =
                arguments.length > 4 && void 0 !== arguments[4]
                  ? arguments[4]
                  : 0;
            if (!Number.isFinite((t - e) / (r - 1)))
              return {
                step: new s6(0),
                tickMin: new s6(0),
                tickMax: new s6(0),
              };
            var o = cl(new s6(t).sub(e).div(r - 1), n, a),
              l = Math.ceil(
                (i =
                  e <= 0 && t >= 0
                    ? new s6(0)
                    : (i = new s6(e).add(t).div(2)).sub(new s6(i).mod(o)))
                  .sub(e)
                  .div(o)
                  .toNumber(),
              ),
              s = Math.ceil(new s6(t).sub(i).div(o).toNumber()),
              c = l + s + 1;
            return c > r
              ? cc(e, t, r, n, a + 1)
              : (c < r &&
                  ((s = t > 0 ? s + (r - c) : s),
                  (l = t > 0 ? l : l + (r - c))),
                {
                  step: o,
                  tickMin: i.sub(new s6(l).mul(o)),
                  tickMax: i.add(new s6(s).mul(o)),
                });
          },
          cu = function (e) {
            var [t, r] = e,
              n =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : 6,
              i =
                !(arguments.length > 2) ||
                void 0 === arguments[2] ||
                arguments[2],
              a = Math.max(n, 2),
              [o, l] = co([t, r]);
            if (o === -1 / 0 || l === 1 / 0) {
              var s =
                l === 1 / 0
                  ? [o, ...ce(0, n - 1).map(() => 1 / 0)]
                  : [...ce(0, n - 1).map(() => -1 / 0), l];
              return t > r ? cn(s) : s;
            }
            if (o === l) return cs(o, n, i);
            var { step: c, tickMin: u, tickMax: d } = cc(o, l, a, i, 0),
              f = ca(u, d.add(new s6(0.1).mul(c)), c);
            return t > r ? cn(f) : f;
          },
          cd = function (e, t) {
            var [r, n] = e,
              i =
                !(arguments.length > 2) ||
                void 0 === arguments[2] ||
                arguments[2],
              [a, o] = co([r, n]);
            if (a === -1 / 0 || o === 1 / 0) return [r, n];
            if (a === o) return [a];
            var l = cl(new s6(o).sub(a).div(Math.max(t, 2) - 1), i, 0),
              s = [...ca(new s6(a), new s6(o), l), o];
            return (
              !1 === i && (s = s.map((e) => Math.round(e))),
              r > n ? cn(s) : s
            );
          },
          cf = (e) => e.rootProps.stackOffset,
          ch = (e) => e.rootProps.reverseStackOrder,
          cp = (e) => e.options.chartName,
          cy = (e) => e.rootProps.syncId,
          cm = (e) => e.rootProps.syncMethod,
          cv = (e) => e.options.eventEmitter;
        function cg(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function cb(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? cg(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : cg(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var cx = Math.PI / 180,
          cw = (e) => (180 * e) / Math.PI,
          cj = (e, t, r, n) => ({
            x: e + Math.cos(-cx * n) * r,
            y: t + Math.sin(-cx * n) * r,
          }),
          cO = (e, t) => {
            var { x: r, y: n } = e,
              { x: i, y: a } = t;
            return Math.sqrt((r - i) ** 2 + (n - a) ** 2);
          },
          cP = (e, t) => {
            var { x: r, y: n } = e,
              { cx: i, cy: a } = t,
              o = cO({ x: r, y: n }, { x: i, y: a });
            if (o <= 0) return { radius: o, angle: 0 };
            var l = Math.acos((r - i) / o);
            return (
              n > a && (l = 2 * Math.PI - l),
              { radius: o, angle: cw(l), angleInRadian: l }
            );
          },
          cS = (e) => {
            var { startAngle: t, endAngle: r } = e,
              n = Math.min(Math.floor(t / 360), Math.floor(r / 360));
            return { startAngle: t - 360 * n, endAngle: r - 360 * n };
          },
          ck = (e, t) => {
            var { startAngle: r, endAngle: n } = t;
            return e + 360 * Math.min(Math.floor(r / 360), Math.floor(n / 360));
          },
          cN = (e, t) => {
            var r,
              { chartX: n, chartY: i } = e,
              { radius: a, angle: o } = cP({ x: n, y: i }, t),
              { innerRadius: l, outerRadius: s } = t;
            if (a < l || a > s || 0 === a) return null;
            var { startAngle: c, endAngle: u } = cS(t),
              d = o;
            if (c <= u) {
              for (; d > u; ) d -= 360;
              for (; d < c; ) d += 360;
              r = d >= c && d <= u;
            } else {
              for (; d > c; ) d -= 360;
              for (; d < u; ) d += 360;
              r = d >= u && d <= c;
            }
            return r ? cb(cb({}, t), {}, { radius: a, angle: ck(d, t) }) : null;
          },
          cE = {
            grid: -100,
            barBackground: -50,
            area: 100,
            cursorRectangle: 200,
            bar: 300,
            line: 400,
            axis: 500,
            scatter: 600,
            activeBar: 1e3,
            cursorLine: 1100,
            activeDot: 1200,
            label: 2e3,
          },
          c_ = {
            allowDecimals: !1,
            allowDuplicatedCategory: !0,
            angleAxisId: 0,
            axisLine: !0,
            axisLineType: "polygon",
            cx: 0,
            cy: 0,
            orientation: "outer",
            reversed: !1,
            scale: "auto",
            tick: !0,
            tickLine: !0,
            tickSize: 8,
            type: "category",
            zIndex: cE.axis,
          },
          cA = {
            allowDataOverflow: !1,
            allowDecimals: !1,
            allowDuplicatedCategory: !0,
            angle: 0,
            axisLine: !0,
            includeHidden: !1,
            label: !1,
            orientation: "right",
            radiusAxisId: 0,
            reversed: !1,
            scale: "auto",
            stroke: "#ccc",
            tick: !0,
            tickCount: 5,
            type: "number",
            zIndex: cE.axis,
          },
          cM = (e, t) =>
            e && t ? (null != e && e.reversed ? [t[1], t[0]] : t) : void 0,
          cC = {
            allowDataOverflow: !1,
            allowDecimals: !1,
            allowDuplicatedCategory: !1,
            dataKey: void 0,
            domain: void 0,
            id: c_.angleAxisId,
            includeHidden: !1,
            name: void 0,
            reversed: c_.reversed,
            scale: c_.scale,
            tick: c_.tick,
            tickCount: void 0,
            ticks: void 0,
            type: c_.type,
            unit: void 0,
          },
          cT = {
            allowDataOverflow: cA.allowDataOverflow,
            allowDecimals: !1,
            allowDuplicatedCategory: cA.allowDuplicatedCategory,
            dataKey: void 0,
            domain: void 0,
            id: cA.radiusAxisId,
            includeHidden: !1,
            name: void 0,
            reversed: !1,
            scale: cA.scale,
            tick: cA.tick,
            tickCount: cA.tickCount,
            ticks: void 0,
            type: cA.type,
            unit: void 0,
          },
          cD = {
            allowDataOverflow: !1,
            allowDecimals: !1,
            allowDuplicatedCategory: c_.allowDuplicatedCategory,
            dataKey: void 0,
            domain: void 0,
            id: c_.angleAxisId,
            includeHidden: !1,
            name: void 0,
            reversed: !1,
            scale: c_.scale,
            tick: c_.tick,
            tickCount: void 0,
            ticks: void 0,
            type: "number",
            unit: void 0,
          },
          cI = {
            allowDataOverflow: cA.allowDataOverflow,
            allowDecimals: !1,
            allowDuplicatedCategory: cA.allowDuplicatedCategory,
            dataKey: void 0,
            domain: void 0,
            id: cA.radiusAxisId,
            includeHidden: !1,
            name: void 0,
            reversed: !1,
            scale: cA.scale,
            tick: cA.tick,
            tickCount: cA.tickCount,
            ticks: void 0,
            type: "category",
            unit: void 0,
          },
          cz = (e, t) =>
            null != e.polarAxis.angleAxis[t]
              ? e.polarAxis.angleAxis[t]
              : "radial" === e.layout.layoutType
                ? cD
                : cC,
          cL = (e, t) =>
            null != e.polarAxis.radiusAxis[t]
              ? e.polarAxis.radiusAxis[t]
              : "radial" === e.layout.layoutType
                ? cI
                : cT,
          cR = (e) => e.polarOptions,
          c$ = n_([is, ic, iv], function (e, t) {
            var r =
              arguments.length > 2 && void 0 !== arguments[2]
                ? arguments[2]
                : {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    brushBottom: 0,
                  };
            return (
              Math.min(
                Math.abs(e - (r.left || 0) - (r.right || 0)),
                Math.abs(t - (r.top || 0) - (r.bottom || 0)),
              ) / 2
            );
          }),
          cU = n_([cR, c$], (e, t) => {
            if (null != e) return O(e.innerRadius, t, 0);
          }),
          cF = n_([cR, c$], (e, t) => {
            if (null != e) return O(e.outerRadius, t, 0.8 * t);
          }),
          cB = n_([cR], (e) => {
            if (null == e) return [0, 0];
            var { startAngle: t, endAngle: r } = e;
            return [t, r];
          });
        n_([cz, cB], cM);
        var cK = n_([c$, cU, cF], (e, t, r) => {
          if (null != e && null != t && null != r) return [t, r];
        });
        n_([cL, cK], cM);
        var cW = n_([iM, cR, cU, cF, is, ic], (e, t, r, n, i, a) => {
            if (
              ("centric" === e || "radial" === e) &&
              null != t &&
              null != r &&
              null != n
            ) {
              var { cx: o, cy: l, startAngle: s, endAngle: c } = t;
              return {
                cx: O(o, i, i / 2),
                cy: O(l, a, a / 2),
                innerRadius: r,
                outerRadius: n,
                startAngle: s,
                endAngle: c,
                clockWise: !1,
              };
            }
          }),
          cH = (e, t) => t,
          cq = (e, t, r) => r;
        function cV(e) {
          return null == e ? void 0 : e.id;
        }
        function cZ(e, t, r) {
          var { chartData: n = [] } = t,
            { allowDuplicatedCategory: i, dataKey: a } = r,
            o = new Map();
          return (
            e.forEach((e) => {
              var t,
                r = null !== (t = e.data) && void 0 !== t ? t : n;
              if (null != r && 0 !== r.length) {
                var l = cV(e);
                r.forEach((t, r) => {
                  var n,
                    s = null == a || i ? r : String(nQ(t, a, null)),
                    c = nQ(t, e.dataKey, 0);
                  (Object.assign((n = o.has(s) ? o.get(s) : {}), { [l]: c }),
                    o.set(s, n));
                });
              }
            }),
            Array.from(o.values())
          );
        }
        function cY(e) {
          return null != e.stackId && null != e.dataKey;
        }
        var cG = (e, t) =>
          e === t || (null != e && null != t && e[0] === t[0] && e[1] === t[1]);
        function cX(e, t) {
          return (
            (!!(Array.isArray(e) && Array.isArray(t)) &&
              0 === e.length &&
              0 === t.length) ||
            e === t
          );
        }
        var cQ = (e) => {
            var t = iM(e);
            return "horizontal" === t
              ? "xAxis"
              : "vertical" === t
                ? "yAxis"
                : "centric" === t
                  ? "angleAxis"
                  : "radiusAxis";
          },
          cJ = (e) => e.tooltip.settings.axisId;
        function c0(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function c1(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? c0(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : c0(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var c2 = [0, "auto"],
          c3 = {
            allowDataOverflow: !1,
            allowDecimals: !0,
            allowDuplicatedCategory: !0,
            angle: 0,
            dataKey: void 0,
            domain: void 0,
            height: 30,
            hide: !0,
            id: 0,
            includeHidden: !1,
            interval: "preserveEnd",
            minTickGap: 5,
            mirror: !1,
            name: void 0,
            orientation: "bottom",
            padding: { left: 0, right: 0 },
            reversed: !1,
            scale: "auto",
            tick: !0,
            tickCount: 5,
            tickFormatter: void 0,
            ticks: void 0,
            type: "category",
            unit: void 0,
          },
          c6 = (e, t) => e.cartesianAxis.xAxis[t],
          c5 = (e, t) => {
            var r = c6(e, t);
            return null == r ? c3 : r;
          },
          c4 = {
            allowDataOverflow: !1,
            allowDecimals: !0,
            allowDuplicatedCategory: !0,
            angle: 0,
            dataKey: void 0,
            domain: c2,
            hide: !0,
            id: 0,
            includeHidden: !1,
            interval: "preserveEnd",
            minTickGap: 5,
            mirror: !1,
            name: void 0,
            orientation: "left",
            padding: { top: 0, bottom: 0 },
            reversed: !1,
            scale: "auto",
            tick: !0,
            tickCount: 5,
            tickFormatter: void 0,
            ticks: void 0,
            type: "number",
            unit: void 0,
            width: 60,
          },
          c7 = (e, t) => e.cartesianAxis.yAxis[t],
          c8 = (e, t) => {
            var r = c7(e, t);
            return null == r ? c4 : r;
          },
          c9 = {
            domain: [0, "auto"],
            includeHidden: !1,
            reversed: !1,
            allowDataOverflow: !1,
            allowDuplicatedCategory: !1,
            dataKey: void 0,
            id: 0,
            name: "",
            range: [64, 64],
            scale: "auto",
            type: "number",
            unit: "",
          },
          ue = (e, t) => {
            var r = e.cartesianAxis.zAxis[t];
            return null == r ? c9 : r;
          },
          ut = (e, t, r) => {
            switch (t) {
              case "xAxis":
                return c5(e, r);
              case "yAxis":
                return c8(e, r);
              case "zAxis":
                return ue(e, r);
              case "angleAxis":
                return cz(e, r);
              case "radiusAxis":
                return cL(e, r);
              default:
                throw Error("Unexpected axis type: ".concat(t));
            }
          },
          ur = (e, t, r) => {
            switch (t) {
              case "xAxis":
                return c5(e, r);
              case "yAxis":
                return c8(e, r);
              case "angleAxis":
                return cz(e, r);
              case "radiusAxis":
                return cL(e, r);
              default:
                throw Error("Unexpected axis type: ".concat(t));
            }
          },
          un = (e) =>
            e.graphicalItems.cartesianItems.some((e) => "bar" === e.type) ||
            e.graphicalItems.polarItems.some((e) => "radialBar" === e.type);
        function ui(e, t) {
          return (r) => {
            switch (e) {
              case "xAxis":
                return "xAxisId" in r && r.xAxisId === t;
              case "yAxis":
                return "yAxisId" in r && r.yAxisId === t;
              case "zAxis":
                return "zAxisId" in r && r.zAxisId === t;
              case "angleAxis":
                return "angleAxisId" in r && r.angleAxisId === t;
              case "radiusAxis":
                return "radiusAxisId" in r && r.radiusAxisId === t;
              default:
                return !1;
            }
          };
        }
        var ua = (e) => e.graphicalItems.cartesianItems,
          uo = n_([cH, cq], ui),
          ul = (e, t, r) =>
            e
              .filter(r)
              .filter(
                (e) => (null == t ? void 0 : t.includeHidden) === !0 || !e.hide,
              ),
          us = n_([ua, ut, uo], ul, {
            memoizeOptions: { resultEqualityCheck: cX },
          }),
          uc = n_([us], (e) =>
            e.filter((e) => "area" === e.type || "bar" === e.type).filter(cY),
          ),
          uu = (e) =>
            e.filter((e) => !("stackId" in e) || void 0 === e.stackId),
          ud = n_([us], uu),
          uf = (e) =>
            e
              .map((e) => e.data)
              .filter(Boolean)
              .flat(1),
          uh = n_([us], uf, { memoizeOptions: { resultEqualityCheck: cX } }),
          up = (e, t) => {
            var { chartData: r = [], dataStartIndex: n, dataEndIndex: i } = t;
            return e.length > 0 ? e : r.slice(n, i + 1);
          },
          uy = n_([uh, sg], up),
          um = (e, t, r) =>
            (null == t ? void 0 : t.dataKey) != null
              ? e.map((e) => ({ value: nQ(e, t.dataKey) }))
              : r.length > 0
                ? r
                    .map((e) => e.dataKey)
                    .flatMap((t) => e.map((e) => ({ value: nQ(e, t) })))
                : e.map((e) => ({ value: e })),
          uv = n_([uy, ut, us], um);
        function ug(e, t) {
          switch (e) {
            case "xAxis":
              return "x" === t.direction;
            case "yAxis":
              return "y" === t.direction;
            default:
              return !1;
          }
        }
        function ub(e) {
          if (x(e) || e instanceof Date) {
            var t = Number(e);
            if (R(t)) return t;
          }
        }
        function ux(e) {
          if (Array.isArray(e)) {
            var t = [ub(e[0]), ub(e[1])];
            return sb(t) ? t : void 0;
          }
          var r = ub(e);
          if (null != r) return [r, r];
        }
        function uw(e) {
          return e.map(ub).filter(_);
        }
        var uj = (e) => {
            var t = cQ(e),
              r = cJ(e);
            return ur(e, t, r);
          },
          uO = n_([uj], (e) => (null == e ? void 0 : e.dataKey)),
          uP = n_([uc, sg, uj], cZ),
          uS = (e, t, r, n) =>
            Object.fromEntries(
              Object.entries(
                t.reduce(
                  (e, t) => (
                    null == t.stackId ||
                      (null == e[t.stackId] && (e[t.stackId] = []),
                      e[t.stackId].push(t)),
                    e
                  ),
                  {},
                ),
              ).map((t) => {
                var [i, a] = t,
                  o = n ? [...a].reverse() : a;
                return [
                  i,
                  { stackedData: n5(e, o.map(cV), r), graphicalItems: o },
                ];
              }),
            ),
          uk = n_([uP, uc, cf, ch], uS),
          uN = (e, t, r, n) => {
            var { dataStartIndex: i, dataEndIndex: a } = t;
            if (null == n && "zAxis" !== r) {
              var o = n9(e, i, a);
              if (null == o || 0 !== o[0] || 0 !== o[1]) return o;
            }
          },
          uE = n_([ut], (e) => e.allowDataOverflow),
          u_ = (e) => {
            var t;
            if (null == e || !("domain" in e)) return c2;
            if (null != e.domain) return e.domain;
            if (null != e.ticks) {
              if ("number" === e.type) {
                var r = uw(e.ticks);
                return [Math.min(...r), Math.max(...r)];
              }
              if ("category" === e.type) return e.ticks.map(String);
            }
            return null !== (t = null == e ? void 0 : e.domain) && void 0 !== t
              ? t
              : c2;
          },
          uA = n_([ut], u_),
          uM = n_([uA, uE], sw),
          uC = n_([uk, sm, cH, uM], uN, {
            memoizeOptions: { resultEqualityCheck: cG },
          }),
          uT = (e) => e.errorBars,
          uD = function () {
            for (var e = arguments.length, t = Array(e), r = 0; r < e; r++)
              t[r] = arguments[r];
            var n = t.filter(Boolean);
            if (0 !== n.length) {
              var i = n.flat();
              return [Math.min(...i), Math.max(...i)];
            }
          },
          uI = (e, t, r, n, i) => {
            var a, o;
            if (
              (r.length > 0 &&
                e.forEach((e) => {
                  r.forEach((r) => {
                    var l,
                      s,
                      c =
                        null === (l = n[r.id]) || void 0 === l
                          ? void 0
                          : l.filter((e) => ug(i, e)),
                      u = nQ(
                        e,
                        null !== (s = t.dataKey) && void 0 !== s
                          ? s
                          : r.dataKey,
                      ),
                      d = (function (e, t, r) {
                        return !r || "number" != typeof t || v(t) || !r.length
                          ? []
                          : uw(
                              r.flatMap((r) => {
                                var n,
                                  i,
                                  a = nQ(e, r.dataKey);
                                if (
                                  (Array.isArray(a)
                                    ? ([n, i] = a)
                                    : (n = i = a),
                                  R(n) && R(i))
                                )
                                  return [t - n, t + i];
                              }),
                            );
                      })(e, u, c);
                    if (d.length >= 2) {
                      var f = Math.min(...d),
                        h = Math.max(...d);
                      ((null == a || f < a) && (a = f),
                        (null == o || h > o) && (o = h));
                    }
                    var p = ux(u);
                    null != p &&
                      ((a = null == a ? p[0] : Math.min(a, p[0])),
                      (o = null == o ? p[1] : Math.max(o, p[1])));
                  });
                }),
              (null == t ? void 0 : t.dataKey) != null &&
                e.forEach((e) => {
                  var r = ux(nQ(e, t.dataKey));
                  null != r &&
                    ((a = null == a ? r[0] : Math.min(a, r[0])),
                    (o = null == o ? r[1] : Math.max(o, r[1])));
                }),
              R(a) && R(o))
            )
              return [a, o];
          },
          uz = n_([uy, ut, ud, uT, cH], uI, {
            memoizeOptions: { resultEqualityCheck: cG },
          });
        function uL(e) {
          var { value: t } = e;
          if (x(t) || t instanceof Date) return t;
        }
        var uR = (e, t, r) => {
            var n = e.map(uL).filter((e) => null != e);
            return r &&
              (null == t.dataKey || (t.allowDuplicatedCategory && P(n)))
              ? iz()(0, e.length)
              : t.allowDuplicatedCategory
                ? n
                : Array.from(new Set(n));
          },
          u$ = (e) => e.referenceElements.dots,
          uU = (e, t, r) =>
            e
              .filter((e) => "extendDomain" === e.ifOverflow)
              .filter((e) =>
                "xAxis" === t ? e.xAxisId === r : e.yAxisId === r,
              ),
          uF = n_([u$, cH, cq], uU),
          uB = (e) => e.referenceElements.areas,
          uK = n_([uB, cH, cq], uU),
          uW = (e) => e.referenceElements.lines,
          uH = n_([uW, cH, cq], uU),
          uq = (e, t) => {
            var r = uw(e.map((e) => ("xAxis" === t ? e.x : e.y)));
            if (0 !== r.length) return [Math.min(...r), Math.max(...r)];
          },
          uV = n_(uF, cH, uq),
          uZ = (e, t) => {
            var r = uw(
              e.flatMap((e) => [
                "xAxis" === t ? e.x1 : e.y1,
                "xAxis" === t ? e.x2 : e.y2,
              ]),
            );
            if (0 !== r.length) return [Math.min(...r), Math.max(...r)];
          },
          uY = n_([uK, cH], uZ),
          uG = (e, t) => {
            var r = e.flatMap((e) =>
              "xAxis" === t
                ? (function (e) {
                    if (null != e.x) return uw([e.x]);
                    var t,
                      r =
                        null === (t = e.segment) || void 0 === t
                          ? void 0
                          : t.map((e) => e.x);
                    return null == r || 0 === r.length ? [] : uw(r);
                  })(e)
                : (function (e) {
                    if (null != e.y) return uw([e.y]);
                    var t,
                      r =
                        null === (t = e.segment) || void 0 === t
                          ? void 0
                          : t.map((e) => e.y);
                    return null == r || 0 === r.length ? [] : uw(r);
                  })(e),
            );
            if (0 !== r.length) return [Math.min(...r), Math.max(...r)];
          },
          uX = n_([uH, cH], uG),
          uQ = n_(uV, uX, uY, (e, t, r) => uD(e, r, t)),
          uJ = (e, t, r, n, i, a, o, l) =>
            null != r
              ? r
              : (function (e, t, r) {
                  if (r || null != t) {
                    if ("function" == typeof e && null != t)
                      try {
                        var n = e(t, r);
                        if (sb(n)) return sx(n, t, r);
                      } catch (e) {}
                    if (Array.isArray(e) && 2 === e.length) {
                      var i,
                        a,
                        [o, l] = e;
                      if ("auto" === o) null != t && (i = Math.min(...t));
                      else if (b(o)) i = o;
                      else if ("function" == typeof o)
                        try {
                          null != t && (i = o(null == t ? void 0 : t[0]));
                        } catch (e) {}
                      else if ("string" == typeof o && ie.test(o)) {
                        var s = ie.exec(o);
                        if (null == s || null == t) i = void 0;
                        else {
                          var c = +s[1];
                          i = t[0] - c;
                        }
                      } else i = null == t ? void 0 : t[0];
                      if ("auto" === l) null != t && (a = Math.max(...t));
                      else if (b(l)) a = l;
                      else if ("function" == typeof l)
                        try {
                          null != t && (a = l(null == t ? void 0 : t[1]));
                        } catch (e) {}
                      else if ("string" == typeof l && it.test(l)) {
                        var u = it.exec(l);
                        if (null == u || null == t) a = void 0;
                        else {
                          var d = +u[1];
                          a = t[1] + d;
                        }
                      } else a = null == t ? void 0 : t[1];
                      var f = [i, a];
                      if (sb(f)) return null == t ? f : sx(f, t, r);
                    }
                  }
                })(
                  t,
                  ("vertical" === o && "xAxis" === l) ||
                    ("horizontal" === o && "yAxis" === l)
                    ? uD(n, a, i)
                    : uD(a, i),
                  e.allowDataOverflow,
                ),
          u0 = n_([ut, uA, uM, uC, uz, uQ, iM, cH], uJ, {
            memoizeOptions: { resultEqualityCheck: cG },
          }),
          u1 = [0, 1],
          u2 = (e, t, r, n, i, a, o) => {
            if ((null != e && null != r && 0 !== r.length) || void 0 !== o) {
              var l,
                { dataKey: s, type: c } = e,
                u = n0(t, a);
              return u && null == s
                ? iz()(
                    0,
                    null !== (l = null == r ? void 0 : r.length) && void 0 !== l
                      ? l
                      : 0,
                  )
                : "category" === c
                  ? uR(n, e, u)
                  : "expand" === i
                    ? u1
                    : o;
            }
          },
          u3 = n_([ut, iM, uy, uv, cf, cH, u0], u2),
          u6 = (e, t, r, n, i) => {
            if (null != e) {
              var { scale: o, type: l } = e;
              if ("auto" === o)
                return "radial" === t && "radiusAxis" === i
                  ? "band"
                  : "radial" === t && "angleAxis" === i
                    ? "linear"
                    : "category" === l &&
                        n &&
                        (n.indexOf("LineChart") >= 0 ||
                          n.indexOf("AreaChart") >= 0 ||
                          (n.indexOf("ComposedChart") >= 0 && !r))
                      ? "point"
                      : "category" === l
                        ? "band"
                        : "linear";
              if ("string" == typeof o) {
                var s = "scale".concat(E(o));
                return s in a ? s : "point";
              }
            }
          },
          u5 = n_([ut, iM, un, cp, cH], u6);
        function u4(e, t, r, n) {
          if (null != r && null != n) {
            if ("function" == typeof e.scale)
              return e.scale.copy().domain(r).range(n);
            var i = (function (e) {
              if (null != e) {
                if (e in a) return a[e]();
                var t = "scale".concat(E(e));
                if (t in a) return a[t]();
              }
            })(t);
            if (null != i) {
              var o = i.domain(r).range(n);
              return (n3(o), o);
            }
          }
        }
        var u7 = (e, t, r) => {
            var n = u_(t);
            return "auto" !== r && "linear" !== r
              ? void 0
              : null != t &&
                  t.tickCount &&
                  Array.isArray(n) &&
                  ("auto" === n[0] || "auto" === n[1]) &&
                  sb(e)
                ? cu(e, t.tickCount, t.allowDecimals)
                : null != t && t.tickCount && "number" === t.type && sb(e)
                  ? cd(e, t.tickCount, t.allowDecimals)
                  : void 0;
          },
          u8 = n_([u3, ur, u5], u7),
          u9 = (e, t, r, n) =>
            "angleAxis" !== n &&
            (null == e ? void 0 : e.type) === "number" &&
            sb(t) &&
            Array.isArray(r) &&
            r.length > 0
              ? [Math.min(t[0], r[0]), Math.max(t[1], r[r.length - 1])]
              : t,
          de = n_([ut, u3, u8, cH], u9),
          dt = n_(uv, ut, (e, t) => {
            if (t && "number" === t.type) {
              var r = 1 / 0,
                n = Array.from(uw(e.map((e) => e.value))).sort((e, t) => e - t);
              if (n.length < 2) return 1 / 0;
              var i = n[n.length - 1] - n[0];
              if (0 === i) return 1 / 0;
              for (var a = 0; a < n.length - 1; a++)
                r = Math.min(r, n[a + 1] - n[a]);
              return r / i;
            }
          }),
          dr = n_(
            dt,
            iM,
            (e) => e.rootProps.barCategoryGap,
            iv,
            (e, t, r, n) => n,
            (e, t, r, n, i) => {
              if (!R(e)) return 0;
              var a = "vertical" === t ? n.height : n.width;
              if ("gap" === i) return (e * a) / 2;
              if ("no-gap" === i) {
                var o = O(r, e * a),
                  l = (e * a) / 2;
                return l - o - ((l - o) / a) * o;
              }
              return 0;
            },
          ),
          dn = n_(
            c5,
            (e, t) => {
              var r = c5(e, t);
              return null == r || "string" != typeof r.padding
                ? 0
                : dr(e, "xAxis", t, r.padding);
            },
            (e, t) => {
              if (null == e) return { left: 0, right: 0 };
              var r,
                n,
                { padding: i } = e;
              return "string" == typeof i
                ? { left: t, right: t }
                : {
                    left: (null !== (r = i.left) && void 0 !== r ? r : 0) + t,
                    right: (null !== (n = i.right) && void 0 !== n ? n : 0) + t,
                  };
            },
          ),
          di = n_(
            c8,
            (e, t) => {
              var r = c8(e, t);
              return null == r || "string" != typeof r.padding
                ? 0
                : dr(e, "yAxis", t, r.padding);
            },
            (e, t) => {
              if (null == e) return { top: 0, bottom: 0 };
              var r,
                n,
                { padding: i } = e;
              return "string" == typeof i
                ? { top: t, bottom: t }
                : {
                    top: (null !== (r = i.top) && void 0 !== r ? r : 0) + t,
                    bottom:
                      (null !== (n = i.bottom) && void 0 !== n ? n : 0) + t,
                  };
            },
          ),
          da = n_([iv, dn, iO, ij, (e, t, r) => r], (e, t, r, n, i) => {
            var { padding: a } = n;
            return i
              ? [a.left, r.width - a.right]
              : [e.left + t.left, e.left + e.width - t.right];
          }),
          dl = n_([iv, iM, di, iO, ij, (e, t, r) => r], (e, t, r, n, i, a) => {
            var { padding: o } = i;
            return a
              ? [n.height - o.bottom, o.top]
              : "horizontal" === t
                ? [e.top + e.height - r.bottom, e.top + r.top]
                : [e.top + r.top, e.top + e.height - r.bottom];
          }),
          ds = (e, t, r, n) => {
            var i;
            switch (t) {
              case "xAxis":
                return da(e, r, n);
              case "yAxis":
                return dl(e, r, n);
              case "zAxis":
                return null === (i = ue(e, r)) || void 0 === i
                  ? void 0
                  : i.range;
              case "angleAxis":
                return cB(e);
              case "radiusAxis":
                return cK(e, r);
              default:
                return;
            }
          },
          dc = n_([ut, ds], cM),
          du = n_([ut, u5, de, dc], u4);
        function dd(e, t) {
          return e.id < t.id ? -1 : e.id > t.id ? 1 : 0;
        }
        n_([us, uT, cH], (e, t, r) =>
          e
            .flatMap((e) => t[e.id])
            .filter(Boolean)
            .filter((e) => ug(r, e)),
        );
        var df = (e, t) => t,
          dh = (e, t, r) => r,
          dp = n_(ih, df, dh, (e, t, r) =>
            e
              .filter((e) => e.orientation === t)
              .filter((e) => e.mirror === r)
              .sort(dd),
          ),
          dy = n_(ip, df, dh, (e, t, r) =>
            e
              .filter((e) => e.orientation === t)
              .filter((e) => e.mirror === r)
              .sort(dd),
          ),
          dm = (e, t) => ({ width: e.width, height: t.height }),
          dv = (e, t) => ({
            width: "number" == typeof t.width ? t.width : 60,
            height: e.height,
          }),
          dg = n_(iv, c5, dm),
          db = (e, t, r) => {
            switch (t) {
              case "top":
                return e.top;
              case "bottom":
                return r - e.bottom;
              default:
                return 0;
            }
          },
          dx = (e, t, r) => {
            switch (t) {
              case "left":
                return e.left;
              case "right":
                return r - e.right;
              default:
                return 0;
            }
          },
          dw = n_(ic, iv, dp, df, dh, (e, t, r, n, i) => {
            var a,
              o = {};
            return (
              r.forEach((r) => {
                var l = dm(t, r);
                null == a && (a = db(t, n, e));
                var s = ("top" === n && !i) || ("bottom" === n && i);
                ((o[r.id] = a - Number(s) * l.height),
                  (a += (s ? -1 : 1) * l.height));
              }),
              o
            );
          }),
          dj = n_(is, iv, dy, df, dh, (e, t, r, n, i) => {
            var a,
              o = {};
            return (
              r.forEach((r) => {
                var l = dv(t, r);
                null == a && (a = dx(t, n, e));
                var s = ("left" === n && !i) || ("right" === n && i);
                ((o[r.id] = a - Number(s) * l.width),
                  (a += (s ? -1 : 1) * l.width));
              }),
              o
            );
          }),
          dO = n_(
            [
              iv,
              c5,
              (e, t) => {
                var r = c5(e, t);
                if (null != r) return dw(e, r.orientation, r.mirror);
              },
              (e, t) => t,
            ],
            (e, t, r, n) => {
              if (null != t) {
                var i = null == r ? void 0 : r[n];
                return null == i ? { x: e.left, y: 0 } : { x: e.left, y: i };
              }
            },
          ),
          dP = n_(
            [
              iv,
              c8,
              (e, t) => {
                var r = c8(e, t);
                if (null != r) return dj(e, r.orientation, r.mirror);
              },
              (e, t) => t,
            ],
            (e, t, r, n) => {
              if (null != t) {
                var i = null == r ? void 0 : r[n];
                return null == i ? { x: 0, y: e.top } : { x: i, y: e.top };
              }
            },
          ),
          dS = n_(iv, c8, (e, t) => ({
            width: "number" == typeof t.width ? t.width : 60,
            height: e.height,
          })),
          dk = (e, t, r, n) => {
            if (null != r) {
              var { allowDuplicatedCategory: i, type: a, dataKey: o } = r,
                l = n0(e, n),
                s = t.map((e) => e.value);
              if (o && l && "category" === a && i && P(s)) return s;
            }
          },
          dN = n_([iM, uv, ut, cH], dk),
          dE = (e, t, r, n) => {
            if (null != r && null != r.dataKey) {
              var { type: i, scale: a } = r;
              if (n0(e, n) && ("number" === i || "auto" !== a))
                return t.map((e) => e.value);
            }
          },
          d_ = n_([iM, uv, ur, cH], dE),
          dA = n_(
            [
              iM,
              (e, t, r) => {
                switch (t) {
                  case "xAxis":
                    return c5(e, r);
                  case "yAxis":
                    return c8(e, r);
                  default:
                    throw Error("Unexpected axis type: ".concat(t));
                }
              },
              u5,
              du,
              dN,
              d_,
              ds,
              u8,
              cH,
            ],
            (e, t, r, n, i, a, o, l, s) => {
              if (null != t) {
                var c = n0(e, s);
                return {
                  angle: t.angle,
                  interval: t.interval,
                  minTickGap: t.minTickGap,
                  orientation: t.orientation,
                  tick: t.tick,
                  tickCount: t.tickCount,
                  tickFormatter: t.tickFormatter,
                  ticks: t.ticks,
                  type: t.type,
                  unit: t.unit,
                  axisType: s,
                  categoricalDomain: a,
                  duplicateDomain: i,
                  isCategorical: c,
                  niceTicks: l,
                  range: o,
                  realScaleType: r,
                  scale: n,
                };
              }
            },
          ),
          dM = n_(
            [iM, ur, u5, du, u8, ds, dN, d_, cH],
            (e, t, r, n, i, a, o, l, s) => {
              if (null != t && null != n) {
                var c = n0(e, s),
                  { type: u, ticks: d, tickCount: f } = t,
                  h =
                    "scaleBand" === r && "function" == typeof n.bandwidth
                      ? n.bandwidth() / 2
                      : 2,
                  p = "category" === u && n.bandwidth ? n.bandwidth() / h : 0;
                p =
                  "angleAxis" === s && null != a && a.length >= 2
                    ? 2 * m(a[0] - a[1]) * p
                    : p;
                var y = d || i;
                return y
                  ? y
                      .map((e, t) => ({
                        index: t,
                        coordinate: n(o ? o.indexOf(e) : e) + p,
                        value: e,
                        offset: p,
                      }))
                      .filter((e) => R(e.coordinate))
                  : c && l
                    ? l
                        .map((e, t) => ({
                          coordinate: n(e) + p,
                          value: e,
                          index: t,
                          offset: p,
                        }))
                        .filter((e) => R(e.coordinate))
                    : n.ticks
                      ? n
                          .ticks(f)
                          .map((e) => ({
                            coordinate: n(e) + p,
                            value: e,
                            offset: p,
                          }))
                      : n
                          .domain()
                          .map((e, t) => ({
                            coordinate: n(e) + p,
                            value: o ? o[e] : e,
                            index: t,
                            offset: p,
                          }));
              }
            },
          ),
          dC = n_([iM, ur, du, ds, dN, d_, cH], (e, t, r, n, i, a, o) => {
            if (null != t && null != r && null != n && n[0] !== n[1]) {
              var l = n0(e, o),
                { tickCount: s } = t,
                c = 0;
              return ((c =
                "angleAxis" === o && (null == n ? void 0 : n.length) >= 2
                  ? 2 * m(n[0] - n[1]) * c
                  : c),
              l && a)
                ? a.map((e, t) => ({
                    coordinate: r(e) + c,
                    value: e,
                    index: t,
                    offset: c,
                  }))
                : r.ticks
                  ? r
                      .ticks(s)
                      .map((e) => ({
                        coordinate: r(e) + c,
                        value: e,
                        offset: c,
                      }))
                  : r
                      .domain()
                      .map((e, t) => ({
                        coordinate: r(e) + c,
                        value: i ? i[e] : e,
                        index: t,
                        offset: c,
                      }));
            }
          }),
          dT = n_(ut, du, (e, t) => {
            if (null != e && null != t) return c1(c1({}, e), {}, { scale: t });
          }),
          dD = n_([ut, u5, u3, dc], u4);
        n_(
          (e, t, r) => ue(e, r),
          dD,
          (e, t) => {
            if (null != e && null != t) return c1(c1({}, e), {}, { scale: t });
          },
        );
        var dI = n_([iM, ih, ip], (e, t, r) => {
            switch (e) {
              case "horizontal":
                return t.some((e) => e.reversed)
                  ? "right-to-left"
                  : "left-to-right";
              case "vertical":
                return r.some((e) => e.reversed)
                  ? "bottom-to-top"
                  : "top-to-bottom";
              case "centric":
              case "radial":
                return "left-to-right";
              default:
                return;
            }
          }),
          dz = (e) => e.options.defaultTooltipEventType,
          dL = (e) => e.options.validateTooltipEventTypes;
        function dR(e, t, r) {
          if (null == e) return t;
          var n = e ? "axis" : "item";
          return null == r ? t : r.includes(n) ? n : t;
        }
        function d$(e, t) {
          return dR(t, dz(e), dL(e));
        }
        var dU = (e, t) => {
          var r,
            n = Number(t);
          if (!v(n) && null != t)
            return n >= 0
              ? null == e || null === (r = e[n]) || void 0 === r
                ? void 0
                : r.value
              : void 0;
        };
        function dF(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function dB(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? dF(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : dF(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var dK = (e, t, r, n) => {
            if (null == t) return rG;
            var i = (function (e, t, r) {
              return "axis" === t
                ? "click" === r
                  ? e.axisInteraction.click
                  : e.axisInteraction.hover
                : "click" === r
                  ? e.itemInteraction.click
                  : e.itemInteraction.hover;
            })(e, t, r);
            if (null == i) return rG;
            if (i.active) return i;
            if (e.keyboardInteraction.active) return e.keyboardInteraction;
            if (e.syncInteraction.active && null != e.syncInteraction.index)
              return e.syncInteraction;
            var a = !0 === e.settings.active;
            if (null != i.index) {
              if (a) return dB(dB({}, i), {}, { active: !0 });
            } else if (null != n)
              return {
                active: !0,
                coordinate: void 0,
                dataKey: void 0,
                index: n,
                graphicalItemId: void 0,
              };
            return dB(dB({}, rG), {}, { coordinate: i.coordinate });
          },
          dW = (e, t, r, n) => {
            var i = null == e ? void 0 : e.index;
            if (null == i) return null;
            var a = Number(i);
            if (!R(a)) return i;
            var o = Infinity;
            t.length > 0 && (o = t.length - 1);
            var l = Math.max(0, Math.min(a, o)),
              s = t[l];
            return null == s
              ? String(l)
              : !(function (e, t, r) {
                    if (null == r || null == t) return !0;
                    var n,
                      i,
                      a,
                      o = nQ(e, t);
                    return (
                      !(null != o && sb(r)) ||
                      ((n = (function (e) {
                        if ("number" == typeof e)
                          return Number.isFinite(e) ? e : void 0;
                        if (e instanceof Date) {
                          var t = e.valueOf();
                          return Number.isFinite(t) ? t : void 0;
                        }
                        var r = Number(e);
                        return Number.isFinite(r) ? r : void 0;
                      })(o)),
                      (i = r[0]),
                      (a = r[1]),
                      void 0 !== n &&
                        n >= Math.min(i, a) &&
                        n <= Math.max(i, a))
                    );
                  })(s, r, n)
                ? null
                : String(l);
          },
          dH = (e, t, r, n, i, a, o, l) => {
            if (null != a && null != l) {
              var s = o[0],
                c = null == s ? void 0 : l(s.positions, a);
              if (null != c) return c;
              var u = null == i ? void 0 : i[Number(a)];
              if (u)
                return "horizontal" === r
                  ? { x: u.coordinate, y: (n.top + t) / 2 }
                  : { x: (n.left + e) / 2, y: u.coordinate };
            }
          },
          dq = (e, t, r, n) => {
            var i;
            return "axis" === t
              ? e.tooltipItemPayloads
              : 0 === e.tooltipItemPayloads.length
                ? []
                : null ==
                      (i =
                        "hover" === r
                          ? e.itemInteraction.hover.dataKey
                          : e.itemInteraction.click.dataKey) && null != n
                  ? [e.tooltipItemPayloads[0]]
                  : e.tooltipItemPayloads.filter((e) => {
                      var t;
                      return (
                        (null === (t = e.settings) || void 0 === t
                          ? void 0
                          : t.dataKey) === i
                      );
                    });
          },
          dV = (e) => e.options.tooltipPayloadSearcher,
          dZ = (e) => e.tooltip;
        function dY(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function dG(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? dY(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : dY(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var dX = (e, t, r, n, i, a, o) => {
            if (null != t && null != a) {
              var {
                chartData: l,
                computedData: s,
                dataStartIndex: c,
                dataEndIndex: u,
              } = r;
              return e.reduce((e, r) => {
                var d,
                  f,
                  h,
                  { dataDefinedOnItem: p, settings: y } = r,
                  m = null != p ? p : l,
                  v = Array.isArray(m) ? nY(m, c, u) : m,
                  g =
                    null !== (d = null == y ? void 0 : y.dataKey) &&
                    void 0 !== d
                      ? d
                      : n,
                  b = null == y ? void 0 : y.nameKey;
                return (
                  Array.isArray(
                    (f =
                      n &&
                      Array.isArray(v) &&
                      !Array.isArray(v[0]) &&
                      "axis" === o
                        ? k(v, n, i)
                        : a(v, t, s, b)),
                  )
                    ? f.forEach((t) => {
                        var r = dG(
                          dG({}, y),
                          {},
                          {
                            name: t.name,
                            unit: t.unit,
                            color: void 0,
                            fill: void 0,
                          },
                        );
                        e.push(
                          ii({
                            tooltipEntrySettings: r,
                            dataKey: t.dataKey,
                            payload: t.payload,
                            value: nQ(t.payload, t.dataKey),
                            name: t.name,
                          }),
                        );
                      })
                    : e.push(
                        ii({
                          tooltipEntrySettings: y,
                          dataKey: g,
                          payload: f,
                          value: nQ(f, g),
                          name:
                            null !== (h = nQ(f, b)) && void 0 !== h
                              ? h
                              : null == y
                                ? void 0
                                : y.name,
                        }),
                      ),
                  e
                );
              }, []);
            }
          },
          dQ = n_([uj, iM, un, cp, cQ], u6),
          dJ = n_(
            [
              (e) => e.graphicalItems.cartesianItems,
              (e) => e.graphicalItems.polarItems,
            ],
            (e, t) => [...e, ...t],
          ),
          d0 = n_([cQ, cJ], ui),
          d1 = n_([dJ, uj, d0], ul, {
            memoizeOptions: { resultEqualityCheck: cX },
          }),
          d2 = n_([d1], (e) => e.filter(cY)),
          d3 = n_([d1], uf, { memoizeOptions: { resultEqualityCheck: cX } }),
          d6 = n_([d3, sm], up),
          d5 = n_([d2, sm, uj], cZ),
          d4 = n_([d6, uj, d1], um),
          d7 = n_([uj], u_),
          d8 = n_([uj], (e) => e.allowDataOverflow),
          d9 = n_([d7, d8], sw),
          fe = n_([d1], (e) => e.filter(cY)),
          ft = n_([d5, fe, cf, ch], uS),
          fr = n_([ft, sm, cQ, d9], uN),
          fn = n_([d1], uu),
          fi = n_([d6, uj, fn, uT, cQ], uI, {
            memoizeOptions: { resultEqualityCheck: cG },
          }),
          fa = n_([u$, cQ, cJ], uU),
          fo = n_([fa, cQ], uq),
          fl = n_([uB, cQ, cJ], uU),
          fs = n_([fl, cQ], uZ),
          fc = n_([uW, cQ, cJ], uU),
          fu = n_([fc, cQ], uG),
          fd = n_([fo, fu, fs], uD),
          ff = n_([uj, d7, d9, fr, fi, fd, iM, cQ], uJ),
          fh = n_([uj, iM, d6, d4, cf, cQ, ff], u2),
          fp = n_([fh, uj, dQ], u7),
          fy = n_([uj, fh, fp, cQ], u9),
          fm = (e) => {
            var t = cQ(e),
              r = cJ(e);
            return ds(e, t, r, !1);
          },
          fv = n_([uj, fm], cM),
          fg = n_([uj, dQ, fy, fv], u4),
          fb = n_([iM, d4, uj, cQ], dk),
          fx = n_([iM, d4, uj, cQ], dE),
          fw = n_(
            [iM, uj, dQ, fg, fm, fb, fx, cQ],
            (e, t, r, n, i, a, o, l) => {
              if (t) {
                var { type: s } = t,
                  c = n0(e, l);
                if (n) {
                  var u =
                      "scaleBand" === r && n.bandwidth ? n.bandwidth() / 2 : 2,
                    d = "category" === s && n.bandwidth ? n.bandwidth() / u : 0;
                  return ((d =
                    "angleAxis" === l &&
                    null != i &&
                    (null == i ? void 0 : i.length) >= 2
                      ? 2 * m(i[0] - i[1]) * d
                      : d),
                  c && o)
                    ? o.map((e, t) => ({
                        coordinate: n(e) + d,
                        value: e,
                        index: t,
                        offset: d,
                      }))
                    : n
                        .domain()
                        .map((e, t) => ({
                          coordinate: n(e) + d,
                          value: a ? a[e] : e,
                          index: t,
                          offset: d,
                        }));
                }
              }
            },
          ),
          fj = n_([dz, dL, (e) => e.tooltip.settings], (e, t, r) =>
            dR(r.shared, e, t),
          ),
          fO = (e) => e.tooltip.settings.trigger,
          fP = (e) => e.tooltip.settings.defaultIndex,
          fS = n_([dZ, fj, fO, fP], dK),
          fk = n_([fS, d6, uO, fh], dW),
          fN = n_([fw, fk], dU),
          fE = n_([fS], (e) => {
            if (e) return e.dataKey;
          });
        n_([fS], (e) => {
          if (e) return e.graphicalItemId;
        });
        var f_ = n_([dZ, fj, fO, fP], dq),
          fA = n_([is, ic, iM, iv, fw, fP, f_, dV], dH),
          fM = n_([fS, fA], (e, t) =>
            null != e && e.coordinate ? e.coordinate : t,
          ),
          fC = n_([fS], (e) => e.active),
          fT = n_([f_, fk, sm, uO, fN, dV, fj], dX),
          fD = n_([fT], (e) => {
            if (null != e) {
              var t = e.map((e) => e.payload).filter((e) => null != e);
              return Array.from(new Set(t));
            }
          });
        function fI(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function fz(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? fI(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : fI(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var fL = (e, t, r, n) => {
            var i = t.find((e) => e && e.index === r);
            if (i) {
              if ("horizontal" === e) return { x: i.coordinate, y: n.chartY };
              if ("vertical" === e) return { x: n.chartX, y: i.coordinate };
            }
            return { x: 0, y: 0 };
          },
          fR = (e, t, r, n) => {
            var i = t.find((e) => e && e.index === r);
            if (i) {
              if ("centric" === e) {
                var a = i.coordinate,
                  { radius: o } = n;
                return fz(
                  fz(fz({}, n), cj(n.cx, n.cy, o, a)),
                  {},
                  { angle: a, radius: o },
                );
              }
              var l = i.coordinate,
                { angle: s } = n;
              return fz(
                fz(fz({}, n), cj(n.cx, n.cy, l, s)),
                {},
                { angle: s, radius: l },
              );
            }
            return {
              angle: 0,
              clockWise: !1,
              cx: 0,
              cy: 0,
              endAngle: 0,
              innerRadius: 0,
              outerRadius: 0,
              radius: 0,
              startAngle: 0,
              x: 0,
              y: 0,
            };
          },
          f$ = (e, t, r, n, i) => {
            var a,
              o = -1,
              l =
                null !== (a = null == t ? void 0 : t.length) && void 0 !== a
                  ? a
                  : 0;
            if (l <= 1 || null == e) return 0;
            if (
              "angleAxis" === n &&
              null != i &&
              1e-6 >= Math.abs(Math.abs(i[1] - i[0]) - 360)
            )
              for (var s = 0; s < l; s++) {
                var c = s > 0 ? r[s - 1].coordinate : r[l - 1].coordinate,
                  u = r[s].coordinate,
                  d = s >= l - 1 ? r[0].coordinate : r[s + 1].coordinate,
                  f = void 0;
                if (m(u - c) !== m(d - u)) {
                  var h = [];
                  if (m(d - u) === m(i[1] - i[0])) {
                    f = d;
                    var p = u + i[1] - i[0];
                    ((h[0] = Math.min(p, (p + c) / 2)),
                      (h[1] = Math.max(p, (p + c) / 2)));
                  } else {
                    f = c;
                    var y = d + i[1] - i[0];
                    ((h[0] = Math.min(u, (y + u) / 2)),
                      (h[1] = Math.max(u, (y + u) / 2)));
                  }
                  var v = [Math.min(u, (f + u) / 2), Math.max(u, (f + u) / 2)];
                  if ((e > v[0] && e <= v[1]) || (e >= h[0] && e <= h[1])) {
                    ({ index: o } = r[s]);
                    break;
                  }
                } else {
                  var g = Math.min(c, d),
                    b = Math.max(c, d);
                  if (e > (g + u) / 2 && e <= (b + u) / 2) {
                    ({ index: o } = r[s]);
                    break;
                  }
                }
              }
            else if (t) {
              for (var x = 0; x < l; x++)
                if (
                  (0 === x &&
                    e <= (t[x].coordinate + t[x + 1].coordinate) / 2) ||
                  (x > 0 &&
                    x < l - 1 &&
                    e > (t[x].coordinate + t[x - 1].coordinate) / 2 &&
                    e <= (t[x].coordinate + t[x + 1].coordinate) / 2) ||
                  (x === l - 1 &&
                    e > (t[x].coordinate + t[x - 1].coordinate) / 2)
                ) {
                  ({ index: o } = t[x]);
                  break;
                }
            }
            return o;
          },
          fU = () => nR(cp),
          fF = (e, t) => t,
          fB = (e, t, r) => r,
          fK = (e, t, r, n) => n,
          fW = n_(fw, (e) => nU()(e, (e) => e.coordinate)),
          fH = n_([dZ, fF, fB, fK], dK),
          fq = n_([fH, d6, uO, fh], dW),
          fV = (e, t, r) => {
            if (null != t) {
              var n = dZ(e);
              return "axis" === t
                ? "hover" === r
                  ? n.axisInteraction.hover.dataKey
                  : n.axisInteraction.click.dataKey
                : "hover" === r
                  ? n.itemInteraction.hover.dataKey
                  : n.itemInteraction.click.dataKey;
            }
          },
          fZ = n_([dZ, fF, fB, fK], dq),
          fY = n_([is, ic, iM, iv, fw, fK, fZ, dV], dH),
          fG = n_([fH, fY], (e, t) => {
            var r;
            return null !== (r = e.coordinate) && void 0 !== r ? r : t;
          }),
          fX = n_([fw, fq], dU),
          fQ = n_([fZ, fq, sm, uO, fX, dV, fF], dX),
          fJ = n_([fH, fq], (e, t) => ({
            isActive: e.active && null != t,
            activeIndex: t,
          })),
          f0 = (e, t, r, n, i, a, o) => {
            if (
              e &&
              r &&
              n &&
              i &&
              (function (e, t) {
                var { chartX: r, chartY: n } = e;
                return (
                  r >= t.left &&
                  r <= t.left + t.width &&
                  n >= t.top &&
                  n <= t.top + t.height
                );
              })(e, o)
            ) {
              var l = f$(io(e, t), a, i, r, n),
                s = fL(t, i, l, e);
              return { activeIndex: String(l), activeCoordinate: s };
            }
          },
          f1 = (e, t, r, n, i, a, o) => {
            if (e && n && i && a && r) {
              var l = cN(e, r);
              if (l) {
                var s = f$(il(l, t), o, a, n, i),
                  c = fR(t, a, s, l);
                return { activeIndex: String(s), activeCoordinate: c };
              }
            }
          },
          f2 = n_(
            [(e, t) => t, iM, cW, cQ, fv, fw, fW, iv],
            (e, t, r, n, i, a, o, l) =>
              e && t && n && i && a
                ? "horizontal" === t || "vertical" === t
                  ? f0(e, t, n, i, a, o, l)
                  : f1(e, t, r, n, i, a, o)
                : void 0,
          ),
          f3 = (e) => {
            var t = e.currentTarget.getBoundingClientRect(),
              r = t.width / e.currentTarget.offsetWidth,
              n = t.height / e.currentTarget.offsetHeight;
            return {
              chartX: Math.round((e.clientX - t.left) / r),
              chartY: Math.round((e.clientY - t.top) / n),
            };
          },
          f6 = ta("mouseClick"),
          f5 = t2();
        f5.startListening({
          actionCreator: f6,
          effect: (e, t) => {
            var r = e.payload,
              n = f2(t.getState(), f3(r));
            (null == n ? void 0 : n.activeIndex) != null &&
              t.dispatch(
                r7({
                  activeIndex: n.activeIndex,
                  activeDataKey: void 0,
                  activeCoordinate: n.activeCoordinate,
                }),
              );
          },
        });
        var f4 = ta("mouseMove"),
          f7 = t2(),
          f8 = null;
        function f9(e, t) {
          return t instanceof HTMLElement
            ? "HTMLElement <"
                .concat(t.tagName, ' class="')
                .concat(t.className, '">')
            : t === window
              ? "global.window"
              : "children" === e && "object" == typeof t && null !== t
                ? "<<CHILDREN>>"
                : t;
        }
        function he(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function ht(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? he(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : he(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        f7.startListening({
          actionCreator: f4,
          effect: (e, t) => {
            var r = e.payload;
            null !== f8 && cancelAnimationFrame(f8);
            var n = f3(r);
            f8 = requestAnimationFrame(() => {
              var e = t.getState();
              if ("axis" === d$(e, e.tooltip.settings.shared)) {
                var r = f2(e, n);
                (null == r ? void 0 : r.activeIndex) != null
                  ? t.dispatch(
                      r4({
                        activeIndex: r.activeIndex,
                        activeDataKey: void 0,
                        activeCoordinate: r.activeCoordinate,
                      }),
                    )
                  : t.dispatch(r6());
              }
              f8 = null;
            });
          },
        });
        var hr = tj({
            name: "cartesianAxis",
            initialState: { xAxis: {}, yAxis: {}, zAxis: {} },
            reducers: {
              addXAxis: {
                reducer(e, t) {
                  e.xAxis[t.payload.id] = t.payload;
                },
                prepare: tf(),
              },
              replaceXAxis: {
                reducer(e, t) {
                  var { prev: r, next: n } = t.payload;
                  void 0 !== e.xAxis[r.id] &&
                    (r.id !== n.id && delete e.xAxis[r.id],
                    (e.xAxis[n.id] = n));
                },
                prepare: tf(),
              },
              removeXAxis: {
                reducer(e, t) {
                  delete e.xAxis[t.payload.id];
                },
                prepare: tf(),
              },
              addYAxis: {
                reducer(e, t) {
                  e.yAxis[t.payload.id] = t.payload;
                },
                prepare: tf(),
              },
              replaceYAxis: {
                reducer(e, t) {
                  var { prev: r, next: n } = t.payload;
                  void 0 !== e.yAxis[r.id] &&
                    (r.id !== n.id && delete e.yAxis[r.id],
                    (e.yAxis[n.id] = n));
                },
                prepare: tf(),
              },
              removeYAxis: {
                reducer(e, t) {
                  delete e.yAxis[t.payload.id];
                },
                prepare: tf(),
              },
              addZAxis: {
                reducer(e, t) {
                  e.zAxis[t.payload.id] = t.payload;
                },
                prepare: tf(),
              },
              replaceZAxis: {
                reducer(e, t) {
                  var { prev: r, next: n } = t.payload;
                  void 0 !== e.zAxis[r.id] &&
                    (r.id !== n.id && delete e.zAxis[r.id],
                    (e.zAxis[n.id] = n));
                },
                prepare: tf(),
              },
              removeZAxis: {
                reducer(e, t) {
                  delete e.zAxis[t.payload.id];
                },
                prepare: tf(),
              },
              updateYAxisWidth(e, t) {
                var { id: r, width: n } = t.payload,
                  i = e.yAxis[r];
                if (i) {
                  var a = i.widthHistory || [];
                  if (
                    3 === a.length &&
                    a[0] === a[2] &&
                    n === a[1] &&
                    n !== i.width &&
                    1 >= Math.abs(n - a[0])
                  )
                    return;
                  var o = [...a, n].slice(-3);
                  e.yAxis[r] = ht(
                    ht({}, e.yAxis[r]),
                    {},
                    { width: n, widthHistory: o },
                  );
                }
              },
            },
          }),
          {
            addXAxis: hn,
            replaceXAxis: hi,
            removeXAxis: ha,
            addYAxis: ho,
            replaceYAxis: hl,
            removeYAxis: hs,
            addZAxis: hc,
            replaceZAxis: hu,
            removeZAxis: hd,
            updateYAxisWidth: hf,
          } = hr.actions,
          hh = hr.reducer,
          hp = tj({
            name: "graphicalItems",
            initialState: { cartesianItems: [], polarItems: [] },
            reducers: {
              addCartesianGraphicalItem: {
                reducer(e, t) {
                  e.cartesianItems.push(t.payload);
                },
                prepare: tf(),
              },
              replaceCartesianGraphicalItem: {
                reducer(e, t) {
                  var { prev: r, next: n } = t.payload,
                    i = e1(e).cartesianItems.indexOf(r);
                  i > -1 && (e.cartesianItems[i] = n);
                },
                prepare: tf(),
              },
              removeCartesianGraphicalItem: {
                reducer(e, t) {
                  var r = e1(e).cartesianItems.indexOf(t.payload);
                  r > -1 && e.cartesianItems.splice(r, 1);
                },
                prepare: tf(),
              },
              addPolarGraphicalItem: {
                reducer(e, t) {
                  e.polarItems.push(t.payload);
                },
                prepare: tf(),
              },
              removePolarGraphicalItem: {
                reducer(e, t) {
                  var r = e1(e).polarItems.indexOf(t.payload);
                  r > -1 && e.polarItems.splice(r, 1);
                },
                prepare: tf(),
              },
            },
          }),
          {
            addCartesianGraphicalItem: hy,
            replaceCartesianGraphicalItem: hm,
            removeCartesianGraphicalItem: hv,
            addPolarGraphicalItem: hg,
            removePolarGraphicalItem: hb,
          } = hp.actions,
          hx = hp.reducer,
          hw = tj({
            name: "referenceElements",
            initialState: { dots: [], areas: [], lines: [] },
            reducers: {
              addDot: (e, t) => {
                e.dots.push(t.payload);
              },
              removeDot: (e, t) => {
                var r = e1(e).dots.findIndex((e) => e === t.payload);
                -1 !== r && e.dots.splice(r, 1);
              },
              addArea: (e, t) => {
                e.areas.push(t.payload);
              },
              removeArea: (e, t) => {
                var r = e1(e).areas.findIndex((e) => e === t.payload);
                -1 !== r && e.areas.splice(r, 1);
              },
              addLine: (e, t) => {
                e.lines.push(t.payload);
              },
              removeLine: (e, t) => {
                var r = e1(e).lines.findIndex((e) => e === t.payload);
                -1 !== r && e.lines.splice(r, 1);
              },
            },
          }),
          {
            addDot: hj,
            removeDot: hO,
            addArea: hP,
            removeArea: hS,
            addLine: hk,
            removeLine: hN,
          } = hw.actions,
          hE = hw.reducer,
          h_ = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
          hA = tj({
            name: "brush",
            initialState: h_,
            reducers: {
              setBrushSettings: (e, t) => (null == t.payload ? h_ : t.payload),
            },
          }),
          { setBrushSettings: hM } = hA.actions,
          hC = hA.reducer,
          hT = tj({
            name: "legend",
            initialState: {
              settings: {
                layout: "horizontal",
                align: "center",
                verticalAlign: "middle",
                itemSorter: "value",
              },
              size: { width: 0, height: 0 },
              payload: [],
            },
            reducers: {
              setLegendSize(e, t) {
                ((e.size.width = t.payload.width),
                  (e.size.height = t.payload.height));
              },
              setLegendSettings(e, t) {
                ((e.settings.align = t.payload.align),
                  (e.settings.layout = t.payload.layout),
                  (e.settings.verticalAlign = t.payload.verticalAlign),
                  (e.settings.itemSorter = t.payload.itemSorter));
              },
              addLegendPayload: {
                reducer(e, t) {
                  e.payload.push(t.payload);
                },
                prepare: tf(),
              },
              replaceLegendPayload: {
                reducer(e, t) {
                  var { prev: r, next: n } = t.payload,
                    i = e1(e).payload.indexOf(r);
                  i > -1 && (e.payload[i] = n);
                },
                prepare: tf(),
              },
              removeLegendPayload: {
                reducer(e, t) {
                  var r = e1(e).payload.indexOf(t.payload);
                  r > -1 && e.payload.splice(r, 1);
                },
                prepare: tf(),
              },
            },
          }),
          {
            setLegendSize: hD,
            setLegendSettings: hI,
            addLegendPayload: hz,
            replaceLegendPayload: hL,
            removeLegendPayload: hR,
          } = hT.actions,
          h$ = hT.reducer,
          hU = {
            accessibilityLayer: !0,
            barCategoryGap: "10%",
            barGap: 4,
            barSize: void 0,
            className: void 0,
            maxBarSize: void 0,
            stackOffset: "none",
            syncId: void 0,
            syncMethod: "index",
            baseValue: void 0,
            reverseStackOrder: !1,
          },
          hF = tj({
            name: "rootProps",
            initialState: hU,
            reducers: {
              updateOptions: (e, t) => {
                var r;
                ((e.accessibilityLayer = t.payload.accessibilityLayer),
                  (e.barCategoryGap = t.payload.barCategoryGap),
                  (e.barGap =
                    null !== (r = t.payload.barGap) && void 0 !== r
                      ? r
                      : hU.barGap),
                  (e.barSize = t.payload.barSize),
                  (e.maxBarSize = t.payload.maxBarSize),
                  (e.stackOffset = t.payload.stackOffset),
                  (e.syncId = t.payload.syncId),
                  (e.syncMethod = t.payload.syncMethod),
                  (e.className = t.payload.className),
                  (e.baseValue = t.payload.baseValue),
                  (e.reverseStackOrder = t.payload.reverseStackOrder));
              },
            },
          }),
          hB = hF.reducer,
          { updateOptions: hK } = hF.actions,
          hW = tj({
            name: "polarAxis",
            initialState: { radiusAxis: {}, angleAxis: {} },
            reducers: {
              addRadiusAxis(e, t) {
                e.radiusAxis[t.payload.id] = t.payload;
              },
              removeRadiusAxis(e, t) {
                delete e.radiusAxis[t.payload.id];
              },
              addAngleAxis(e, t) {
                e.angleAxis[t.payload.id] = t.payload;
              },
              removeAngleAxis(e, t) {
                delete e.angleAxis[t.payload.id];
              },
            },
          }),
          {
            addRadiusAxis: hH,
            removeRadiusAxis: hq,
            addAngleAxis: hV,
            removeAngleAxis: hZ,
          } = hW.actions,
          hY = hW.reducer,
          hG = tj({
            name: "polarOptions",
            initialState: null,
            reducers: { updatePolarOptions: (e, t) => t.payload },
          }),
          { updatePolarOptions: hX } = hG.actions,
          hQ = hG.reducer,
          hJ = ta("keyDown"),
          h0 = ta("focus"),
          h1 = t2();
        (h1.startListening({
          actionCreator: hJ,
          effect: (e, t) => {
            var r = t.getState();
            if (!1 !== r.rootProps.accessibilityLayer) {
              var { keyboardInteraction: n } = r.tooltip,
                i = e.payload;
              if ("ArrowRight" === i || "ArrowLeft" === i || "Enter" === i) {
                var a = dW(n, d6(r), uO(r), fh(r)),
                  o = null == a ? -1 : Number(a);
                if (Number.isFinite(o) && !(o < 0)) {
                  var l = fw(r);
                  if ("Enter" === i) {
                    var s = fY(r, "axis", "hover", String(n.index));
                    t.dispatch(
                      r9({
                        active: !n.active,
                        activeIndex: n.index,
                        activeDataKey: n.dataKey,
                        activeCoordinate: s,
                      }),
                    );
                    return;
                  }
                  var c =
                    o +
                    ("ArrowRight" === i ? 1 : -1) *
                      ("left-to-right" === dI(r) ? 1 : -1);
                  if (null != l && !(c >= l.length) && !(c < 0)) {
                    var u = fY(r, "axis", "hover", String(c));
                    t.dispatch(
                      r9({
                        active: !0,
                        activeIndex: c.toString(),
                        activeDataKey: void 0,
                        activeCoordinate: u,
                      }),
                    );
                  }
                }
              }
            }
          },
        }),
          h1.startListening({
            actionCreator: h0,
            effect: (e, t) => {
              var r = t.getState();
              if (!1 !== r.rootProps.accessibilityLayer) {
                var { keyboardInteraction: n } = r.tooltip;
                if (!n.active && null == n.index) {
                  var i = fY(r, "axis", "hover", String("0"));
                  t.dispatch(
                    r9({
                      activeDataKey: void 0,
                      active: !0,
                      activeIndex: "0",
                      activeCoordinate: i,
                    }),
                  );
                }
              }
            },
          }));
        var h2 = ta("externalEvent"),
          h3 = t2(),
          h6 = new Map();
        h3.startListening({
          actionCreator: h2,
          effect: (e, t) => {
            var { handler: r, reactEvent: n } = e.payload;
            if (null != r) {
              n.persist();
              var i = n.type,
                a = h6.get(i);
              void 0 !== a && cancelAnimationFrame(a);
              var o = requestAnimationFrame(() => {
                try {
                  var e = t.getState(),
                    a = {
                      activeCoordinate: fM(e),
                      activeDataKey: fE(e),
                      activeIndex: fk(e),
                      activeLabel: fN(e),
                      activeTooltipIndex: fk(e),
                      isTooltipActive: fC(e),
                    };
                  r(a, n);
                } finally {
                  h6.delete(i);
                }
              });
              h6.set(i, o);
            }
          },
        });
        var h5 = n_([dZ], (e) => e.tooltipItemPayloads),
          h4 = n_([h5, dV, (e, t, r) => t, (e, t, r) => r], (e, t, r, n) => {
            var i = e.find((e) => e.settings.dataKey === n);
            if (null != i) {
              var { positions: a } = i;
              if (null != a) return t(a, r);
            }
          }),
          h7 = ta("touchMove"),
          h8 = t2();
        h8.startListening({
          actionCreator: h7,
          effect: (e, t) => {
            var r = e.payload;
            if (null != r.touches && 0 !== r.touches.length) {
              var n = t.getState(),
                i = d$(n, n.tooltip.settings.shared);
              if ("axis" === i) {
                var a = f2(
                  n,
                  f3({
                    clientX: r.touches[0].clientX,
                    clientY: r.touches[0].clientY,
                    currentTarget: r.currentTarget,
                  }),
                );
                (null == a ? void 0 : a.activeIndex) != null &&
                  t.dispatch(
                    r4({
                      activeIndex: a.activeIndex,
                      activeDataKey: void 0,
                      activeCoordinate: a.activeCoordinate,
                    }),
                  );
              } else if ("item" === i) {
                var o,
                  l = r.touches[0];
                if (null == document.elementFromPoint) return;
                var s = document.elementFromPoint(l.clientX, l.clientY);
                if (!s || !s.getAttribute) return;
                var c = s.getAttribute("data-recharts-item-index"),
                  u =
                    null !==
                      (o = s.getAttribute("data-recharts-item-data-key")) &&
                    void 0 !== o
                      ? o
                      : void 0,
                  d = h4(t.getState(), c, u);
                t.dispatch(
                  r2({ activeDataKey: u, activeIndex: c, activeCoordinate: d }),
                );
              }
            }
          },
        });
        var h9 = tj({
            name: "errorBars",
            initialState: {},
            reducers: {
              addErrorBar: (e, t) => {
                var { itemId: r, errorBar: n } = t.payload;
                (e[r] || (e[r] = []), e[r].push(n));
              },
              replaceErrorBar: (e, t) => {
                var { itemId: r, prev: n, next: i } = t.payload;
                e[r] &&
                  (e[r] = e[r].map((e) =>
                    e.dataKey === n.dataKey && e.direction === n.direction
                      ? i
                      : e,
                  ));
              },
              removeErrorBar: (e, t) => {
                var { itemId: r, errorBar: n } = t.payload;
                e[r] &&
                  (e[r] = e[r].filter(
                    (e) =>
                      e.dataKey !== n.dataKey || e.direction !== n.direction,
                  ));
              },
            },
          }),
          {
            addErrorBar: pe,
            replaceErrorBar: pt,
            removeErrorBar: pr,
          } = h9.actions,
          pn = h9.reducer,
          pi = { devToolsEnabled: !1, isSsr: !0 };
        function pa(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function po(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? pa(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : pa(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var pl = {
            zIndexMap: Object.values(cE).reduce(
              (e, t) =>
                po(
                  po({}, e),
                  {},
                  {
                    [t]: {
                      elementId: void 0,
                      panoramaElementId: void 0,
                      consumers: 0,
                    },
                  },
                ),
              {},
            ),
          },
          ps = new Set(Object.values(cE)),
          pc = tj({
            name: "zIndex",
            initialState: pl,
            reducers: {
              registerZIndexPortal: {
                reducer: (e, t) => {
                  var { zIndex: r } = t.payload;
                  e.zIndexMap[r]
                    ? (e.zIndexMap[r].consumers += 1)
                    : (e.zIndexMap[r] = {
                        consumers: 1,
                        elementId: void 0,
                        panoramaElementId: void 0,
                      });
                },
                prepare: tf(),
              },
              unregisterZIndexPortal: {
                reducer: (e, t) => {
                  var { zIndex: r } = t.payload;
                  e.zIndexMap[r] &&
                    ((e.zIndexMap[r].consumers -= 1),
                    e.zIndexMap[r].consumers <= 0 &&
                      !ps.has(r) &&
                      delete e.zIndexMap[r]);
                },
                prepare: tf(),
              },
              registerZIndexPortalId: {
                reducer: (e, t) => {
                  var { zIndex: r, elementId: n, isPanorama: i } = t.payload;
                  e.zIndexMap[r]
                    ? i
                      ? (e.zIndexMap[r].panoramaElementId = n)
                      : (e.zIndexMap[r].elementId = n)
                    : (e.zIndexMap[r] = {
                        consumers: 0,
                        elementId: i ? void 0 : n,
                        panoramaElementId: i ? n : void 0,
                      });
                },
                prepare: tf(),
              },
              unregisterZIndexPortalId: {
                reducer: (e, t) => {
                  var { zIndex: r } = t.payload;
                  e.zIndexMap[r] &&
                    (t.payload.isPanorama
                      ? (e.zIndexMap[r].panoramaElementId = void 0)
                      : (e.zIndexMap[r].elementId = void 0));
                },
                prepare: tf(),
              },
            },
          }),
          {
            registerZIndexPortal: pu,
            unregisterZIndexPortal: pd,
            registerZIndexPortalId: pf,
            unregisterZIndexPortalId: ph,
          } = pc.actions,
          pp = e8({
            brush: hC,
            cartesianAxis: hh,
            chartData: na,
            errorBars: pn,
            graphicalItems: hx,
            layout: nd,
            legend: h$,
            options: t7,
            polarAxis: hY,
            polarOptions: hQ,
            referenceElements: hE,
            rootProps: hB,
            tooltip: ne,
            zIndex: pc.reducer,
          }),
          py = function (e) {
            var t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : "Chart";
            return (function (e) {
              let t, r;
              let n = tu(),
                {
                  reducer: i,
                  middleware: a,
                  devTools: o = !0,
                  duplicateMiddlewareCheck: l = !0,
                  preloadedState: s,
                  enhancers: c,
                } = e || {};
              if ("function" == typeof i) t = i;
              else if (e7(i)) t = e8(i);
              else throw Error(t6(1));
              r = "function" == typeof a ? a(n) : n();
              let u = e9;
              o && (u = tn({ trace: !1, ...("object" == typeof o && o) }));
              let d = (function (...e) {
                  return (t) => (r, n) => {
                    let i = t(r, n),
                      a = () => {
                        throw Error(e3(15));
                      },
                      o = {
                        getState: i.getState,
                        dispatch: (e, ...t) => a(e, ...t),
                      },
                      l = e.map((e) => e(o));
                    return ((a = e9(...l)(i.dispatch)), { ...i, dispatch: a });
                  };
                })(...r),
                f = ty(d),
                h = "function" == typeof c ? c(f) : f(),
                p = u(...h);
              return (function e(t, r, n) {
                if ("function" != typeof t) throw Error(e3(2));
                if (
                  ("function" == typeof r && "function" == typeof n) ||
                  ("function" == typeof n && "function" == typeof arguments[3])
                )
                  throw Error(e3(0));
                if (
                  ("function" == typeof r &&
                    void 0 === n &&
                    ((n = r), (r = void 0)),
                  void 0 !== n)
                ) {
                  if ("function" != typeof n) throw Error(e3(1));
                  return n(e)(t, r);
                }
                let i = t,
                  a = r,
                  o = new Map(),
                  l = o,
                  s = 0,
                  c = !1;
                function u() {
                  l === o &&
                    ((l = new Map()),
                    o.forEach((e, t) => {
                      l.set(t, e);
                    }));
                }
                function d() {
                  if (c) throw Error(e3(3));
                  return a;
                }
                function f(e) {
                  if ("function" != typeof e) throw Error(e3(4));
                  if (c) throw Error(e3(5));
                  let t = !0;
                  u();
                  let r = s++;
                  return (
                    l.set(r, e),
                    function () {
                      if (t) {
                        if (c) throw Error(e3(6));
                        ((t = !1), u(), l.delete(r), (o = null));
                      }
                    }
                  );
                }
                function h(e) {
                  if (!e7(e)) throw Error(e3(7));
                  if (void 0 === e.type) throw Error(e3(8));
                  if ("string" != typeof e.type) throw Error(e3(17));
                  if (c) throw Error(e3(9));
                  try {
                    ((c = !0), (a = i(a, e)));
                  } finally {
                    c = !1;
                  }
                  let t = (o = l);
                  return (
                    t.forEach((e) => {
                      e();
                    }),
                    e
                  );
                }
                return (
                  h({ type: e4.INIT }),
                  {
                    dispatch: h,
                    subscribe: f,
                    getState: d,
                    replaceReducer: function (e) {
                      if ("function" != typeof e) throw Error(e3(10));
                      ((i = e), h({ type: e4.REPLACE }));
                    },
                    [e6]: function () {
                      return {
                        subscribe(e) {
                          if ("object" != typeof e || null === e)
                            throw Error(e3(11));
                          function t() {
                            e.next && e.next(d());
                          }
                          t();
                          let r = f(t);
                          return { unsubscribe: r };
                        },
                        [e6]() {
                          return this;
                        },
                      };
                    },
                  }
                );
              })(t, s, p);
            })({
              reducer: pp,
              preloadedState: e,
              middleware: (e) =>
                e({
                  serializableCheck: !1,
                  immutableCheck: !["commonjs", "es6", "production"].includes(
                    "es6",
                  ),
                }).concat([
                  f5.middleware,
                  f7.middleware,
                  h1.middleware,
                  h3.middleware,
                  h8.middleware,
                ]),
              enhancers: (e) => {
                var t = e;
                return (
                  "function" == typeof e && (t = e()),
                  t.concat(tp({ type: "raf" }))
                );
              },
              devTools: pi.devToolsEnabled && {
                serialize: { replacer: f9 },
                name: "recharts-".concat(t),
              },
            });
          };
        function pm(e) {
          var { preloadedState: t, children: r, reduxStoreName: n } = e,
            i = iw(),
            a = (0, l.useRef)(null);
          return i
            ? r
            : (null == a.current && (a.current = py(t, n)),
              l.createElement(ru, { context: nC, store: a.current }, r));
        }
        var pv = (e) => {
            var { chartData: t } = e,
              r = nD(),
              n = iw();
            return (
              (0, l.useEffect)(
                () =>
                  n
                    ? () => {}
                    : (r(nr(t)),
                      () => {
                        r(nr(void 0));
                      }),
                [t, r, n],
              ),
              null
            );
          },
          pg = new Set([
            "axisLine",
            "tickLine",
            "activeBar",
            "activeDot",
            "activeLabel",
            "activeShape",
            "allowEscapeViewBox",
            "background",
            "cursor",
            "dot",
            "label",
            "line",
            "margin",
            "padding",
            "position",
            "shape",
            "style",
            "tick",
            "wrapperStyle",
          ]);
        function pb(e, t) {
          for (var r of new Set([...Object.keys(e), ...Object.keys(t)]))
            if (pg.has(r)) {
              if (null == e[r] && null == t[r]) continue;
              if (
                !(function (e, t) {
                  if (rn(e, t)) return !0;
                  if (
                    "object" != typeof e ||
                    null === e ||
                    "object" != typeof t ||
                    null === t
                  )
                    return !1;
                  let r = Object.keys(e),
                    n = Object.keys(t);
                  if (r.length !== n.length) return !1;
                  for (let n = 0; n < r.length; n++)
                    if (
                      !Object.prototype.hasOwnProperty.call(t, r[n]) ||
                      !rn(e[r[n]], t[r[n]])
                    )
                      return !1;
                  return !0;
                })(e[r], t[r])
              )
                return !1;
            } else {
              var n, i;
              if (
                ((n = e[r]),
                (i = t[r]),
                (null != n || null != i) &&
                  ("number" == typeof n && "number" == typeof i
                    ? n !== i && (n == n || i == i)
                    : n !== i))
              )
                return !1;
            }
          return !0;
        }
        var px = (0, l.memo)(function (e) {
          var { layout: t, margin: r } = e,
            n = nD(),
            i = iw();
          return (
            (0, l.useEffect)(() => {
              i || (n(ns(t)), n(nl(r)));
            }, [n, i, t, r]),
            null
          );
        }, pb);
        function pw(e) {
          var t = nD();
          return (
            (0, l.useEffect)(() => {
              t(hK(e));
            }, [t, e]),
            null
          );
        }
        var pj = () => {
            var e;
            return (
              null === (e = nR((e) => e.rootProps.accessibilityLayer)) ||
              void 0 === e ||
              e
            );
          },
          pO = [
            "dangerouslySetInnerHTML",
            "onCopy",
            "onCopyCapture",
            "onCut",
            "onCutCapture",
            "onPaste",
            "onPasteCapture",
            "onCompositionEnd",
            "onCompositionEndCapture",
            "onCompositionStart",
            "onCompositionStartCapture",
            "onCompositionUpdate",
            "onCompositionUpdateCapture",
            "onFocus",
            "onFocusCapture",
            "onBlur",
            "onBlurCapture",
            "onChange",
            "onChangeCapture",
            "onBeforeInput",
            "onBeforeInputCapture",
            "onInput",
            "onInputCapture",
            "onReset",
            "onResetCapture",
            "onSubmit",
            "onSubmitCapture",
            "onInvalid",
            "onInvalidCapture",
            "onLoad",
            "onLoadCapture",
            "onError",
            "onErrorCapture",
            "onKeyDown",
            "onKeyDownCapture",
            "onKeyPress",
            "onKeyPressCapture",
            "onKeyUp",
            "onKeyUpCapture",
            "onAbort",
            "onAbortCapture",
            "onCanPlay",
            "onCanPlayCapture",
            "onCanPlayThrough",
            "onCanPlayThroughCapture",
            "onDurationChange",
            "onDurationChangeCapture",
            "onEmptied",
            "onEmptiedCapture",
            "onEncrypted",
            "onEncryptedCapture",
            "onEnded",
            "onEndedCapture",
            "onLoadedData",
            "onLoadedDataCapture",
            "onLoadedMetadata",
            "onLoadedMetadataCapture",
            "onLoadStart",
            "onLoadStartCapture",
            "onPause",
            "onPauseCapture",
            "onPlay",
            "onPlayCapture",
            "onPlaying",
            "onPlayingCapture",
            "onProgress",
            "onProgressCapture",
            "onRateChange",
            "onRateChangeCapture",
            "onSeeked",
            "onSeekedCapture",
            "onSeeking",
            "onSeekingCapture",
            "onStalled",
            "onStalledCapture",
            "onSuspend",
            "onSuspendCapture",
            "onTimeUpdate",
            "onTimeUpdateCapture",
            "onVolumeChange",
            "onVolumeChangeCapture",
            "onWaiting",
            "onWaitingCapture",
            "onAuxClick",
            "onAuxClickCapture",
            "onClick",
            "onClickCapture",
            "onContextMenu",
            "onContextMenuCapture",
            "onDoubleClick",
            "onDoubleClickCapture",
            "onDrag",
            "onDragCapture",
            "onDragEnd",
            "onDragEndCapture",
            "onDragEnter",
            "onDragEnterCapture",
            "onDragExit",
            "onDragExitCapture",
            "onDragLeave",
            "onDragLeaveCapture",
            "onDragOver",
            "onDragOverCapture",
            "onDragStart",
            "onDragStartCapture",
            "onDrop",
            "onDropCapture",
            "onMouseDown",
            "onMouseDownCapture",
            "onMouseEnter",
            "onMouseLeave",
            "onMouseMove",
            "onMouseMoveCapture",
            "onMouseOut",
            "onMouseOutCapture",
            "onMouseOver",
            "onMouseOverCapture",
            "onMouseUp",
            "onMouseUpCapture",
            "onSelect",
            "onSelectCapture",
            "onTouchCancel",
            "onTouchCancelCapture",
            "onTouchEnd",
            "onTouchEndCapture",
            "onTouchMove",
            "onTouchMoveCapture",
            "onTouchStart",
            "onTouchStartCapture",
            "onPointerDown",
            "onPointerDownCapture",
            "onPointerMove",
            "onPointerMoveCapture",
            "onPointerUp",
            "onPointerUpCapture",
            "onPointerCancel",
            "onPointerCancelCapture",
            "onPointerEnter",
            "onPointerEnterCapture",
            "onPointerLeave",
            "onPointerLeaveCapture",
            "onPointerOver",
            "onPointerOverCapture",
            "onPointerOut",
            "onPointerOutCapture",
            "onGotPointerCapture",
            "onGotPointerCaptureCapture",
            "onLostPointerCapture",
            "onLostPointerCaptureCapture",
            "onScroll",
            "onScrollCapture",
            "onWheel",
            "onWheelCapture",
            "onAnimationStart",
            "onAnimationStartCapture",
            "onAnimationEnd",
            "onAnimationEndCapture",
            "onAnimationIteration",
            "onAnimationIterationCapture",
            "onTransitionEnd",
            "onTransitionEndCapture",
          ];
        function pP(e) {
          return "string" == typeof e && pO.includes(e);
        }
        var pS = new Set([
          "aria-activedescendant",
          "aria-atomic",
          "aria-autocomplete",
          "aria-busy",
          "aria-checked",
          "aria-colcount",
          "aria-colindex",
          "aria-colspan",
          "aria-controls",
          "aria-current",
          "aria-describedby",
          "aria-details",
          "aria-disabled",
          "aria-errormessage",
          "aria-expanded",
          "aria-flowto",
          "aria-haspopup",
          "aria-hidden",
          "aria-invalid",
          "aria-keyshortcuts",
          "aria-label",
          "aria-labelledby",
          "aria-level",
          "aria-live",
          "aria-modal",
          "aria-multiline",
          "aria-multiselectable",
          "aria-orientation",
          "aria-owns",
          "aria-placeholder",
          "aria-posinset",
          "aria-pressed",
          "aria-readonly",
          "aria-relevant",
          "aria-required",
          "aria-roledescription",
          "aria-rowcount",
          "aria-rowindex",
          "aria-rowspan",
          "aria-selected",
          "aria-setsize",
          "aria-sort",
          "aria-valuemax",
          "aria-valuemin",
          "aria-valuenow",
          "aria-valuetext",
          "className",
          "color",
          "height",
          "id",
          "lang",
          "max",
          "media",
          "method",
          "min",
          "name",
          "style",
          "target",
          "width",
          "role",
          "tabIndex",
          "accentHeight",
          "accumulate",
          "additive",
          "alignmentBaseline",
          "allowReorder",
          "alphabetic",
          "amplitude",
          "arabicForm",
          "ascent",
          "attributeName",
          "attributeType",
          "autoReverse",
          "azimuth",
          "baseFrequency",
          "baselineShift",
          "baseProfile",
          "bbox",
          "begin",
          "bias",
          "by",
          "calcMode",
          "capHeight",
          "clip",
          "clipPath",
          "clipPathUnits",
          "clipRule",
          "colorInterpolation",
          "colorInterpolationFilters",
          "colorProfile",
          "colorRendering",
          "contentScriptType",
          "contentStyleType",
          "cursor",
          "cx",
          "cy",
          "d",
          "decelerate",
          "descent",
          "diffuseConstant",
          "direction",
          "display",
          "divisor",
          "dominantBaseline",
          "dur",
          "dx",
          "dy",
          "edgeMode",
          "elevation",
          "enableBackground",
          "end",
          "exponent",
          "externalResourcesRequired",
          "fill",
          "fillOpacity",
          "fillRule",
          "filter",
          "filterRes",
          "filterUnits",
          "floodColor",
          "floodOpacity",
          "focusable",
          "fontFamily",
          "fontSize",
          "fontSizeAdjust",
          "fontStretch",
          "fontStyle",
          "fontVariant",
          "fontWeight",
          "format",
          "from",
          "fx",
          "fy",
          "g1",
          "g2",
          "glyphName",
          "glyphOrientationHorizontal",
          "glyphOrientationVertical",
          "glyphRef",
          "gradientTransform",
          "gradientUnits",
          "hanging",
          "horizAdvX",
          "horizOriginX",
          "href",
          "ideographic",
          "imageRendering",
          "in2",
          "in",
          "intercept",
          "k1",
          "k2",
          "k3",
          "k4",
          "k",
          "kernelMatrix",
          "kernelUnitLength",
          "kerning",
          "keyPoints",
          "keySplines",
          "keyTimes",
          "lengthAdjust",
          "letterSpacing",
          "lightingColor",
          "limitingConeAngle",
          "local",
          "markerEnd",
          "markerHeight",
          "markerMid",
          "markerStart",
          "markerUnits",
          "markerWidth",
          "mask",
          "maskContentUnits",
          "maskUnits",
          "mathematical",
          "mode",
          "numOctaves",
          "offset",
          "opacity",
          "operator",
          "order",
          "orient",
          "orientation",
          "origin",
          "overflow",
          "overlinePosition",
          "overlineThickness",
          "paintOrder",
          "panose1",
          "pathLength",
          "patternContentUnits",
          "patternTransform",
          "patternUnits",
          "pointerEvents",
          "pointsAtX",
          "pointsAtY",
          "pointsAtZ",
          "preserveAlpha",
          "preserveAspectRatio",
          "primitiveUnits",
          "r",
          "radius",
          "refX",
          "refY",
          "renderingIntent",
          "repeatCount",
          "repeatDur",
          "requiredExtensions",
          "requiredFeatures",
          "restart",
          "result",
          "rotate",
          "rx",
          "ry",
          "seed",
          "shapeRendering",
          "slope",
          "spacing",
          "specularConstant",
          "specularExponent",
          "speed",
          "spreadMethod",
          "startOffset",
          "stdDeviation",
          "stemh",
          "stemv",
          "stitchTiles",
          "stopColor",
          "stopOpacity",
          "strikethroughPosition",
          "strikethroughThickness",
          "string",
          "stroke",
          "strokeDasharray",
          "strokeDashoffset",
          "strokeLinecap",
          "strokeLinejoin",
          "strokeMiterlimit",
          "strokeOpacity",
          "strokeWidth",
          "surfaceScale",
          "systemLanguage",
          "tableValues",
          "targetX",
          "targetY",
          "textAnchor",
          "textDecoration",
          "textLength",
          "textRendering",
          "to",
          "transform",
          "u1",
          "u2",
          "underlinePosition",
          "underlineThickness",
          "unicode",
          "unicodeBidi",
          "unicodeRange",
          "unitsPerEm",
          "vAlphabetic",
          "values",
          "vectorEffect",
          "version",
          "vertAdvY",
          "vertOriginX",
          "vertOriginY",
          "vHanging",
          "vIdeographic",
          "viewTarget",
          "visibility",
          "vMathematical",
          "widths",
          "wordSpacing",
          "writingMode",
          "x1",
          "x2",
          "x",
          "xChannelSelector",
          "xHeight",
          "xlinkActuate",
          "xlinkArcrole",
          "xlinkHref",
          "xlinkRole",
          "xlinkShow",
          "xlinkTitle",
          "xlinkType",
          "xmlBase",
          "xmlLang",
          "xmlns",
          "xmlnsXlink",
          "xmlSpace",
          "y1",
          "y2",
          "y",
          "yChannelSelector",
          "z",
          "zoomAndPan",
          "ref",
          "key",
          "angle",
        ]);
        function pk(e) {
          return "string" == typeof e && pS.has(e);
        }
        function pN(e) {
          return "string" == typeof e && e.startsWith("data-");
        }
        function pE(e) {
          if ("object" != typeof e || null === e) return {};
          var t = {};
          for (var r in e)
            Object.prototype.hasOwnProperty.call(e, r) &&
              (pk(r) || pN(r)) &&
              (t[r] = e[r]);
          return t;
        }
        function p_(e) {
          return null == e
            ? null
            : (0, l.isValidElement)(e) &&
                "object" == typeof e.props &&
                null !== e.props
              ? pE(e.props)
              : "object" != typeof e || Array.isArray(e)
                ? null
                : pE(e);
        }
        function pA(e) {
          var t = {};
          for (var r in e)
            Object.prototype.hasOwnProperty.call(e, r) &&
              (pk(r) || pN(r) || pP(r)) &&
              (t[r] = e[r]);
          return t;
        }
        var pM = [
          "children",
          "width",
          "height",
          "viewBox",
          "className",
          "style",
          "title",
          "desc",
        ];
        function pC() {
          return (pC = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        var pT = (0, l.forwardRef)((e, t) => {
            var {
                children: r,
                width: n,
                height: i,
                viewBox: a,
                className: o,
                style: s,
                title: c,
                desc: u,
              } = e,
              f = (function (e, t) {
                if (null == e) return {};
                var r,
                  n,
                  i = (function (e, t) {
                    if (null == e) return {};
                    var r = {};
                    for (var n in e)
                      if ({}.hasOwnProperty.call(e, n)) {
                        if (-1 !== t.indexOf(n)) continue;
                        r[n] = e[n];
                      }
                    return r;
                  })(e, t);
                if (Object.getOwnPropertySymbols) {
                  var a = Object.getOwnPropertySymbols(e);
                  for (n = 0; n < a.length; n++)
                    ((r = a[n]),
                      -1 === t.indexOf(r) &&
                        {}.propertyIsEnumerable.call(e, r) &&
                        (i[r] = e[r]));
                }
                return i;
              })(e, pM),
              h = a || { width: n, height: i, x: 0, y: 0 },
              p = d("recharts-surface", o);
            return l.createElement(
              "svg",
              pC({}, pA(f), {
                className: p,
                width: n,
                height: i,
                style: s,
                viewBox: ""
                  .concat(h.x, " ")
                  .concat(h.y, " ")
                  .concat(h.width, " ")
                  .concat(h.height),
                ref: t,
              }),
              l.createElement("title", null, c),
              l.createElement("desc", null, u),
              r,
            );
          }),
          pD =
            null !== (i = l["useId".toString()]) && void 0 !== i
              ? i
              : () => {
                  var [e] = l.useState(() => j("uid-"));
                  return e;
                };
        function pI(e, t) {
          var r = pD();
          return t || (e ? "".concat(e, "-").concat(r) : r);
        }
        var pz = n_(
            (e) => e.zIndex.zIndexMap,
            (e, t) => t,
            (e, t, r) => r,
            (e, t, r) => {
              if (null != t) {
                var n = e[t];
                return null == n
                  ? void 0
                  : r
                    ? n.panoramaElementId
                    : n.elementId;
              }
            },
          ),
          pL = n_(
            (e) => e.zIndex.zIndexMap,
            (e) => {
              var t = Object.keys(e)
                .map((e) => parseInt(e, 10))
                .concat(Object.values(cE));
              return Array.from(new Set(t)).sort((e, t) => e - t);
            },
            {
              memoizeOptions: {
                resultEqualityCheck: function (e, t) {
                  if (e.length === t.length) {
                    for (var r = 0; r < e.length; r++)
                      if (e[r] !== t[r]) return !1;
                    return !0;
                  }
                  return !1;
                },
              },
            },
          );
        function pR(e) {
          var { zIndex: t, isPanorama: r } = e,
            n = r ? "recharts-zindex-panorama-" : "recharts-zindex-",
            i = pI("".concat(n).concat(t)),
            a = nD();
          return (
            (0, l.useLayoutEffect)(
              () => (
                a(pf({ zIndex: t, elementId: i, isPanorama: r })),
                () => {
                  a(ph({ zIndex: t, isPanorama: r }));
                }
              ),
              [a, t, i, r],
            ),
            l.createElement("g", { tabIndex: -1, id: i })
          );
        }
        function p$(e) {
          var { children: t, isPanorama: r } = e,
            n = nR(pL);
          if (!n || 0 === n.length) return t;
          var i = n.filter((e) => e < 0),
            a = n.filter((e) => e > 0);
          return l.createElement(
            l.Fragment,
            null,
            i.map((e) =>
              l.createElement(pR, { key: e, zIndex: e, isPanorama: r }),
            ),
            t,
            a.map((e) =>
              l.createElement(pR, { key: e, zIndex: e, isPanorama: r }),
            ),
          );
        }
        var pU = ["children"];
        function pF() {
          return (pF = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        var pB = { width: "100%", height: "100%", display: "block" },
          pK = (0, l.forwardRef)((e, t) => {
            var r,
              n,
              i = iE(),
              a = i_(),
              o = pj();
            if (!$(i) || !$(a)) return null;
            var { children: s, otherAttributes: c, title: u, desc: d } = e;
            return (
              null != c &&
                ((r =
                  "number" == typeof c.tabIndex ? c.tabIndex : o ? 0 : void 0),
                (n =
                  "string" == typeof c.role
                    ? c.role
                    : o
                      ? "application"
                      : void 0)),
              l.createElement(
                pT,
                pF({}, c, {
                  title: u,
                  desc: d,
                  role: n,
                  tabIndex: r,
                  width: i,
                  height: a,
                  style: pB,
                  ref: t,
                }),
                s,
              )
            );
          }),
          pW = (e) => {
            var { children: t } = e,
              r = nR(iO);
            if (!r) return null;
            var { width: n, height: i, y: a, x: o } = r;
            return l.createElement(pT, { width: n, height: i, x: o, y: a }, t);
          },
          pH = (0, l.forwardRef)((e, t) => {
            var { children: r } = e,
              n = (function (e, t) {
                if (null == e) return {};
                var r,
                  n,
                  i = (function (e, t) {
                    if (null == e) return {};
                    var r = {};
                    for (var n in e)
                      if ({}.hasOwnProperty.call(e, n)) {
                        if (-1 !== t.indexOf(n)) continue;
                        r[n] = e[n];
                      }
                    return r;
                  })(e, t);
                if (Object.getOwnPropertySymbols) {
                  var a = Object.getOwnPropertySymbols(e);
                  for (n = 0; n < a.length; n++)
                    ((r = a[n]),
                      -1 === t.indexOf(r) &&
                        {}.propertyIsEnumerable.call(e, r) &&
                        (i[r] = e[r]));
                }
                return i;
              })(e, pU);
            return iw()
              ? l.createElement(
                  pW,
                  null,
                  l.createElement(p$, { isPanorama: !0 }, r),
                )
              : l.createElement(
                  pK,
                  pF({ ref: t }, n),
                  l.createElement(p$, { isPanorama: !1 }, r),
                );
          }),
          pq = new (r(43571))(),
          pV = "recharts.syncEvent.tooltip",
          pZ = "recharts.syncEvent.brush";
        function pY(e) {
          return e.tooltip.syncInteraction;
        }
        var pG = ["x", "y"];
        function pX(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function pQ(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? pX(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : pX(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var pJ = (0, l.createContext)(null),
          p0 = () => (0, l.useContext)(pJ),
          p1 = (0, l.createContext)(null),
          p2 = () => (0, l.useContext)(p1);
        function p3(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function p6() {
          return (p6 = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        var p5 = () => (
          (function () {
            var e,
              t,
              r,
              n,
              i,
              a,
              o,
              s,
              c,
              u,
              d,
              f = nD();
            ((0, l.useEffect)(() => {
              f(t8());
            }, [f]),
              (e = nR(cy)),
              (t = nR(cv)),
              (r = nD()),
              (n = nR(cm)),
              (i = nR(fw)),
              (a = iC()),
              (o = iS()),
              (s = nR((e) => e.rootProps.className)),
              (0, l.useEffect)(() => {
                if (null == e) return A;
                var l = (l, s, c) => {
                  if (t !== c && e === l) {
                    if ("index" === n) {
                      if (
                        o &&
                        null != s &&
                        null !== (u = s.payload) &&
                        void 0 !== u &&
                        u.coordinate &&
                        s.payload.sourceViewBox
                      ) {
                        var u,
                          d,
                          f = s.payload.coordinate,
                          { x: h, y: p } = f,
                          y = (function (e, t) {
                            if (null == e) return {};
                            var r,
                              n,
                              i = (function (e, t) {
                                if (null == e) return {};
                                var r = {};
                                for (var n in e)
                                  if ({}.hasOwnProperty.call(e, n)) {
                                    if (-1 !== t.indexOf(n)) continue;
                                    r[n] = e[n];
                                  }
                                return r;
                              })(e, t);
                            if (Object.getOwnPropertySymbols) {
                              var a = Object.getOwnPropertySymbols(e);
                              for (n = 0; n < a.length; n++)
                                ((r = a[n]),
                                  -1 === t.indexOf(r) &&
                                    {}.propertyIsEnumerable.call(e, r) &&
                                    (i[r] = e[r]));
                            }
                            return i;
                          })(f, pG),
                          {
                            x: m,
                            y: v,
                            width: g,
                            height: b,
                          } = s.payload.sourceViewBox,
                          x = pQ(
                            pQ({}, y),
                            {},
                            {
                              x: o.x + (g ? (h - m) / g : 0) * o.width,
                              y: o.y + (b ? (p - v) / b : 0) * o.height,
                            },
                          );
                        r(
                          pQ(
                            pQ({}, s),
                            {},
                            {
                              payload: pQ(
                                pQ({}, s.payload),
                                {},
                                { coordinate: x },
                              ),
                            },
                          ),
                        );
                      } else r(s);
                      return;
                    }
                    if (null != i) {
                      if ("function" == typeof n) {
                        var w = n(i, {
                          activeTooltipIndex:
                            null == s.payload.index
                              ? void 0
                              : Number(s.payload.index),
                          isTooltipActive: s.payload.active,
                          activeIndex:
                            null == s.payload.index
                              ? void 0
                              : Number(s.payload.index),
                          activeLabel: s.payload.label,
                          activeDataKey: s.payload.dataKey,
                          activeCoordinate: s.payload.coordinate,
                        });
                        d = i[w];
                      } else
                        "value" === n &&
                          (d = i.find(
                            (e) => String(e.value) === s.payload.label,
                          ));
                      var { coordinate: j } = s.payload;
                      if (
                        null == d ||
                        !1 === s.payload.active ||
                        null == j ||
                        null == o
                      ) {
                        r(
                          r8({
                            active: !1,
                            coordinate: void 0,
                            dataKey: void 0,
                            index: null,
                            label: void 0,
                            sourceViewBox: void 0,
                            graphicalItemId: void 0,
                          }),
                        );
                        return;
                      }
                      var { x: O, y: P } = j,
                        S = Math.min(O, o.x + o.width),
                        k = Math.min(P, o.y + o.height),
                        N = {
                          x: "horizontal" === a ? d.coordinate : S,
                          y: "horizontal" === a ? k : d.coordinate,
                        };
                      r(
                        r8({
                          active: s.payload.active,
                          coordinate: N,
                          dataKey: s.payload.dataKey,
                          index: String(d.index),
                          label: s.payload.label,
                          sourceViewBox: s.payload.sourceViewBox,
                          graphicalItemId: s.payload.graphicalItemId,
                        }),
                      );
                    }
                  }
                };
                return (
                  pq.on(pV, l),
                  () => {
                    pq.off(pV, l);
                  }
                );
              }, [s, r, t, e, n, i, a, o]),
              (c = nR(cy)),
              (u = nR(cv)),
              (d = nD()),
              (0, l.useEffect)(() => {
                if (null == c) return A;
                var e = (e, t, r) => {
                  u !== r && c === e && d(nn(t));
                };
                return (
                  pq.on(pZ, e),
                  () => {
                    pq.off(pZ, e);
                  }
                );
              }, [d, u, c]));
          })(),
          null
        );
        function p4(e) {
          if ("number" == typeof e) return e;
          if ("string" == typeof e) {
            var t = parseFloat(e);
            if (!Number.isNaN(t)) return t;
          }
          return 0;
        }
        var p7 = (0, l.forwardRef)((e, t) => {
            var r,
              n,
              i = (0, l.useRef)(null),
              [a, o] = (0, l.useState)({
                containerWidth: p4(
                  null === (r = e.style) || void 0 === r ? void 0 : r.width,
                ),
                containerHeight: p4(
                  null === (n = e.style) || void 0 === n ? void 0 : n.height,
                ),
              }),
              s = (0, l.useCallback)((e, t) => {
                o((r) => {
                  var n = Math.round(e),
                    i = Math.round(t);
                  return r.containerWidth === n && r.containerHeight === i
                    ? r
                    : { containerWidth: n, containerHeight: i };
                });
              }, []),
              c = (0, l.useCallback)(
                (e) => {
                  if (
                    ("function" == typeof t && t(e),
                    null != e && "undefined" != typeof ResizeObserver)
                  ) {
                    var { width: r, height: n } = e.getBoundingClientRect();
                    s(r, n);
                    var a = new ResizeObserver((e) => {
                      var { width: t, height: r } = e[0].contentRect;
                      s(t, r);
                    });
                    (a.observe(e), (i.current = a));
                  }
                },
                [t, s],
              );
            return (
              (0, l.useEffect)(
                () => () => {
                  var e = i.current;
                  null != e && e.disconnect();
                },
                [s],
              ),
              l.createElement(
                l.Fragment,
                null,
                l.createElement(iD, {
                  width: a.containerWidth,
                  height: a.containerHeight,
                }),
                l.createElement("div", p6({ ref: c }, e)),
              )
            );
          }),
          p8 = (0, l.forwardRef)((e, t) => {
            var { width: r, height: n } = e,
              [i, a] = (0, l.useState)({
                containerWidth: p4(r),
                containerHeight: p4(n),
              }),
              o = (0, l.useCallback)((e, t) => {
                a((r) => {
                  var n = Math.round(e),
                    i = Math.round(t);
                  return r.containerWidth === n && r.containerHeight === i
                    ? r
                    : { containerWidth: n, containerHeight: i };
                });
              }, []),
              s = (0, l.useCallback)(
                (e) => {
                  if (("function" == typeof t && t(e), null != e)) {
                    var { width: r, height: n } = e.getBoundingClientRect();
                    o(r, n);
                  }
                },
                [t, o],
              );
            return l.createElement(
              l.Fragment,
              null,
              l.createElement(iD, {
                width: i.containerWidth,
                height: i.containerHeight,
              }),
              l.createElement("div", p6({ ref: s }, e)),
            );
          }),
          p9 = (0, l.forwardRef)((e, t) => {
            var { width: r, height: n } = e;
            return l.createElement(
              l.Fragment,
              null,
              l.createElement(iD, { width: r, height: n }),
              l.createElement("div", p6({ ref: t }, e)),
            );
          }),
          ye = (0, l.forwardRef)((e, t) => {
            var { width: r, height: n } = e;
            return g(r) || g(n)
              ? l.createElement(p8, p6({}, e, { ref: t }))
              : l.createElement(p9, p6({}, e, { ref: t }));
          }),
          yt = (0, l.forwardRef)((e, t) => {
            var {
                children: r,
                className: n,
                height: i,
                onClick: a,
                onContextMenu: o,
                onDoubleClick: s,
                onMouseDown: c,
                onMouseEnter: u,
                onMouseLeave: f,
                onMouseMove: h,
                onMouseUp: p,
                onTouchEnd: y,
                onTouchMove: m,
                onTouchStart: v,
                style: g,
                width: b,
                responsive: x,
                dispatchTouchEvents: w = !0,
              } = e,
              j = (0, l.useRef)(null),
              O = nD(),
              [P, S] = (0, l.useState)(null),
              [k, N] = (0, l.useState)(null),
              E = (function () {
                var e = nD(),
                  [t, r] = (0, l.useState)(null),
                  n = nR(iu);
                return (
                  (0, l.useEffect)(() => {
                    if (null != t) {
                      var r = t.getBoundingClientRect().width / t.offsetWidth;
                      R(r) && r !== n && e(nu(r));
                    }
                  }, [t, e, n]),
                  r
                );
              })(),
              _ = H(),
              A = (null == _ ? void 0 : _.width) > 0 ? _.width : b,
              M = (null == _ ? void 0 : _.height) > 0 ? _.height : i,
              C = (0, l.useCallback)(
                (e) => {
                  (E(e),
                    "function" == typeof t && t(e),
                    S(e),
                    N(e),
                    null != e && (j.current = e));
                },
                [E, t, S, N],
              ),
              T = (0, l.useCallback)(
                (e) => {
                  (O(f6(e)), O(h2({ handler: a, reactEvent: e })));
                },
                [O, a],
              ),
              D = (0, l.useCallback)(
                (e) => {
                  (O(f4(e)), O(h2({ handler: u, reactEvent: e })));
                },
                [O, u],
              ),
              I = (0, l.useCallback)(
                (e) => {
                  (O(r6()), O(h2({ handler: f, reactEvent: e })));
                },
                [O, f],
              ),
              z = (0, l.useCallback)(
                (e) => {
                  (O(f4(e)), O(h2({ handler: h, reactEvent: e })));
                },
                [O, h],
              ),
              L = (0, l.useCallback)(() => {
                O(h0());
              }, [O]),
              $ = (0, l.useCallback)(
                (e) => {
                  O(hJ(e.key));
                },
                [O],
              ),
              U = (0, l.useCallback)(
                (e) => {
                  O(h2({ handler: o, reactEvent: e }));
                },
                [O, o],
              ),
              F = (0, l.useCallback)(
                (e) => {
                  O(h2({ handler: s, reactEvent: e }));
                },
                [O, s],
              ),
              B = (0, l.useCallback)(
                (e) => {
                  O(h2({ handler: c, reactEvent: e }));
                },
                [O, c],
              ),
              K = (0, l.useCallback)(
                (e) => {
                  O(h2({ handler: p, reactEvent: e }));
                },
                [O, p],
              ),
              W = (0, l.useCallback)(
                (e) => {
                  O(h2({ handler: v, reactEvent: e }));
                },
                [O, v],
              ),
              q = (0, l.useCallback)(
                (e) => {
                  (w && O(h7(e)), O(h2({ handler: m, reactEvent: e })));
                },
                [O, w, m],
              ),
              V = (0, l.useCallback)(
                (e) => {
                  O(h2({ handler: y, reactEvent: e }));
                },
                [O, y],
              );
            return l.createElement(
              pJ.Provider,
              { value: P },
              l.createElement(
                p1.Provider,
                { value: k },
                l.createElement(
                  !0 === x ? p7 : ye,
                  {
                    width: null != A ? A : null == g ? void 0 : g.width,
                    height: null != M ? M : null == g ? void 0 : g.height,
                    className: d("recharts-wrapper", n),
                    style: (function (e) {
                      for (var t = 1; t < arguments.length; t++) {
                        var r = null != arguments[t] ? arguments[t] : {};
                        t % 2
                          ? p3(Object(r), !0).forEach(function (t) {
                              var n, i;
                              ((n = t),
                                (i = r[t]),
                                (n = (function (e) {
                                  var t = (function (e, t) {
                                    if ("object" != typeof e || !e) return e;
                                    var r = e[Symbol.toPrimitive];
                                    if (void 0 !== r) {
                                      var n = r.call(e, t || "default");
                                      if ("object" != typeof n) return n;
                                      throw TypeError(
                                        "@@toPrimitive must return a primitive value.",
                                      );
                                    }
                                    return ("string" === t ? String : Number)(
                                      e,
                                    );
                                  })(e, "string");
                                  return "symbol" == typeof t ? t : t + "";
                                })(n)) in e
                                  ? Object.defineProperty(e, n, {
                                      value: i,
                                      enumerable: !0,
                                      configurable: !0,
                                      writable: !0,
                                    })
                                  : (e[n] = i));
                            })
                          : Object.getOwnPropertyDescriptors
                            ? Object.defineProperties(
                                e,
                                Object.getOwnPropertyDescriptors(r),
                              )
                            : p3(Object(r)).forEach(function (t) {
                                Object.defineProperty(
                                  e,
                                  t,
                                  Object.getOwnPropertyDescriptor(r, t),
                                );
                              });
                      }
                      return e;
                    })(
                      {
                        position: "relative",
                        cursor: "default",
                        width: A,
                        height: M,
                      },
                      g,
                    ),
                    onClick: T,
                    onContextMenu: U,
                    onDoubleClick: F,
                    onFocus: L,
                    onKeyDown: $,
                    onMouseDown: B,
                    onMouseEnter: D,
                    onMouseLeave: I,
                    onMouseMove: z,
                    onMouseUp: K,
                    onTouchEnd: V,
                    onTouchMove: q,
                    onTouchStart: W,
                    ref: C,
                  },
                  l.createElement(p5, null),
                  r,
                ),
              ),
            );
          }),
          yr = n_([iv], (e) => ({
            top: e.top,
            bottom: e.bottom,
            left: e.left,
            right: e.right,
          })),
          yn = n_([yr, is, ic], (e, t, r) => {
            if (e && null != t && null != r)
              return {
                x: e.left,
                y: e.top,
                width: Math.max(0, t - e.left - e.right),
                height: Math.max(0, r - e.top - e.bottom),
              };
          }),
          yi = () => nR(yn),
          ya = () => nR(fD),
          yo = (0, l.createContext)(void 0),
          yl = (e) => {
            var { children: t } = e,
              [r] = (0, l.useState)("".concat(j("recharts"), "-clip")),
              n = yi();
            if (null == n) return null;
            var { x: i, y: a, width: o, height: s } = n;
            return l.createElement(
              yo.Provider,
              { value: r },
              l.createElement(
                "defs",
                null,
                l.createElement(
                  "clipPath",
                  { id: r },
                  l.createElement("rect", { x: i, y: a, height: s, width: o }),
                ),
              ),
              t,
            );
          },
          ys = [
            "width",
            "height",
            "responsive",
            "children",
            "className",
            "style",
            "compact",
            "title",
            "desc",
          ],
          yc = (0, l.forwardRef)((e, t) => {
            var {
                width: r,
                height: n,
                responsive: i,
                children: a,
                className: o,
                style: s,
                compact: c,
                title: u,
                desc: d,
              } = e,
              f = pE(
                (function (e, t) {
                  if (null == e) return {};
                  var r,
                    n,
                    i = (function (e, t) {
                      if (null == e) return {};
                      var r = {};
                      for (var n in e)
                        if ({}.hasOwnProperty.call(e, n)) {
                          if (-1 !== t.indexOf(n)) continue;
                          r[n] = e[n];
                        }
                      return r;
                    })(e, t);
                  if (Object.getOwnPropertySymbols) {
                    var a = Object.getOwnPropertySymbols(e);
                    for (n = 0; n < a.length; n++)
                      ((r = a[n]),
                        -1 === t.indexOf(r) &&
                          {}.propertyIsEnumerable.call(e, r) &&
                          (i[r] = e[r]));
                  }
                  return i;
                })(e, ys),
              );
            return c
              ? l.createElement(
                  l.Fragment,
                  null,
                  l.createElement(iD, { width: r, height: n }),
                  l.createElement(
                    pH,
                    { otherAttributes: f, title: u, desc: d },
                    a,
                  ),
                )
              : l.createElement(
                  yt,
                  {
                    className: o,
                    style: s,
                    width: r,
                    height: n,
                    responsive: null != i && i,
                    onClick: e.onClick,
                    onMouseLeave: e.onMouseLeave,
                    onMouseEnter: e.onMouseEnter,
                    onMouseMove: e.onMouseMove,
                    onMouseDown: e.onMouseDown,
                    onMouseUp: e.onMouseUp,
                    onContextMenu: e.onContextMenu,
                    onDoubleClick: e.onDoubleClick,
                    onTouchStart: e.onTouchStart,
                    onTouchMove: e.onTouchMove,
                    onTouchEnd: e.onTouchEnd,
                  },
                  l.createElement(
                    pH,
                    { otherAttributes: f, title: u, desc: d, ref: t },
                    l.createElement(yl, null, a),
                  ),
                );
          });
        function yu(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function yd(e, t) {
          var r = (function (e) {
            for (var t = 1; t < arguments.length; t++) {
              var r = null != arguments[t] ? arguments[t] : {};
              t % 2
                ? yu(Object(r), !0).forEach(function (t) {
                    var n, i;
                    ((n = t),
                      (i = r[t]),
                      (n = (function (e) {
                        var t = (function (e, t) {
                          if ("object" != typeof e || !e) return e;
                          var r = e[Symbol.toPrimitive];
                          if (void 0 !== r) {
                            var n = r.call(e, t || "default");
                            if ("object" != typeof n) return n;
                            throw TypeError(
                              "@@toPrimitive must return a primitive value.",
                            );
                          }
                          return ("string" === t ? String : Number)(e);
                        })(e, "string");
                        return "symbol" == typeof t ? t : t + "";
                      })(n)) in e
                        ? Object.defineProperty(e, n, {
                            value: i,
                            enumerable: !0,
                            configurable: !0,
                            writable: !0,
                          })
                        : (e[n] = i));
                  })
                : Object.getOwnPropertyDescriptors
                  ? Object.defineProperties(
                      e,
                      Object.getOwnPropertyDescriptors(r),
                    )
                  : yu(Object(r)).forEach(function (t) {
                      Object.defineProperty(
                        e,
                        t,
                        Object.getOwnPropertyDescriptor(r, t),
                      );
                    });
            }
            return e;
          })({}, e);
          return Object.keys(t).reduce(
            (e, r) => (void 0 === e[r] && void 0 !== t[r] && (e[r] = t[r]), e),
            r,
          );
        }
        function yf() {
          return (yf = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        var yh = {
            accessibilityLayer: !0,
            barCategoryGap: "10%",
            barGap: 4,
            layout: "horizontal",
            margin: { top: 5, right: 5, bottom: 5, left: 5 },
            responsive: !1,
            reverseStackOrder: !1,
            stackOffset: "none",
            syncMethod: "index",
          },
          yp = (0, l.forwardRef)(function (e, t) {
            var r,
              n = yd(e.categoricalChartProps, yh),
              {
                chartName: i,
                defaultTooltipEventType: a,
                validateTooltipEventTypes: o,
                tooltipPayloadSearcher: s,
                categoricalChartProps: c,
              } = e;
            return l.createElement(
              pm,
              {
                preloadedState: {
                  options: {
                    chartName: i,
                    defaultTooltipEventType: a,
                    validateTooltipEventTypes: o,
                    tooltipPayloadSearcher: s,
                    eventEmitter: void 0,
                  },
                },
                reduxStoreName: null !== (r = c.id) && void 0 !== r ? r : i,
              },
              l.createElement(pv, { chartData: c.data }),
              l.createElement(px, { layout: n.layout, margin: n.margin }),
              l.createElement(pw, {
                baseValue: n.baseValue,
                accessibilityLayer: n.accessibilityLayer,
                barCategoryGap: n.barCategoryGap,
                maxBarSize: n.maxBarSize,
                stackOffset: n.stackOffset,
                barGap: n.barGap,
                barSize: n.barSize,
                syncId: n.syncId,
                syncMethod: n.syncMethod,
                className: n.className,
                reverseStackOrder: n.reverseStackOrder,
              }),
              l.createElement(yc, yf({}, n, { ref: t })),
            );
          }),
          yy = ["axis"],
          ym = (0, l.forwardRef)((e, t) =>
            l.createElement(yp, {
              chartName: "LineChart",
              defaultTooltipEventType: "axis",
              validateTooltipEventTypes: yy,
              tooltipPayloadSearcher: t5,
              categoricalChartProps: e,
              ref: t,
            }),
          );
        class yv {
          constructor(e) {
            ((function (e, t, r) {
              var n;
              (t =
                "symbol" ==
                typeof (n = (function (e, t) {
                  if ("object" != typeof e || !e) return e;
                  var r = e[Symbol.toPrimitive];
                  if (void 0 !== r) {
                    var n = r.call(e, t || "default");
                    if ("object" != typeof n) return n;
                    throw TypeError(
                      "@@toPrimitive must return a primitive value.",
                    );
                  }
                  return ("string" === t ? String : Number)(e);
                })(t, "string"))
                  ? n
                  : n + "") in e
                ? Object.defineProperty(e, t, {
                    value: r,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0,
                  })
                : (e[t] = r);
            })(this, "cache", new Map()),
              (this.maxSize = e));
          }
          get(e) {
            var t = this.cache.get(e);
            return (
              void 0 !== t && (this.cache.delete(e), this.cache.set(e, t)),
              t
            );
          }
          set(e, t) {
            if (this.cache.has(e)) this.cache.delete(e);
            else if (this.cache.size >= this.maxSize) {
              var r = this.cache.keys().next().value;
              null != r && this.cache.delete(r);
            }
            this.cache.set(e, t);
          }
          clear() {
            this.cache.clear();
          }
          size() {
            return this.cache.size;
          }
        }
        function yg(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        var yb = (function (e) {
            for (var t = 1; t < arguments.length; t++) {
              var r = null != arguments[t] ? arguments[t] : {};
              t % 2
                ? yg(Object(r), !0).forEach(function (t) {
                    var n, i;
                    ((n = t),
                      (i = r[t]),
                      (n = (function (e) {
                        var t = (function (e, t) {
                          if ("object" != typeof e || !e) return e;
                          var r = e[Symbol.toPrimitive];
                          if (void 0 !== r) {
                            var n = r.call(e, t || "default");
                            if ("object" != typeof n) return n;
                            throw TypeError(
                              "@@toPrimitive must return a primitive value.",
                            );
                          }
                          return ("string" === t ? String : Number)(e);
                        })(e, "string");
                        return "symbol" == typeof t ? t : t + "";
                      })(n)) in e
                        ? Object.defineProperty(e, n, {
                            value: i,
                            enumerable: !0,
                            configurable: !0,
                            writable: !0,
                          })
                        : (e[n] = i));
                  })
                : Object.getOwnPropertyDescriptors
                  ? Object.defineProperties(
                      e,
                      Object.getOwnPropertyDescriptors(r),
                    )
                  : yg(Object(r)).forEach(function (t) {
                      Object.defineProperty(
                        e,
                        t,
                        Object.getOwnPropertyDescriptor(r, t),
                      );
                    });
            }
            return e;
          })({}, { cacheSize: 2e3, enableCache: !0 }),
          yx = new yv(yb.cacheSize),
          yw = {
            position: "absolute",
            top: "-20000px",
            left: 0,
            padding: 0,
            margin: 0,
            border: "none",
            whiteSpace: "pre",
          },
          yj = "recharts_measurement_span",
          yO = (e, t) => {
            try {
              var r = document.getElementById(yj);
              (r ||
                ((r = document.createElement("span")).setAttribute("id", yj),
                r.setAttribute("aria-hidden", "true"),
                document.body.appendChild(r)),
                Object.assign(r.style, yw, t),
                (r.textContent = "".concat(e)));
              var n = r.getBoundingClientRect();
              return { width: n.width, height: n.height };
            } catch (e) {
              return { width: 0, height: 0 };
            }
          },
          yP = function (e) {
            var t,
              r,
              n,
              i,
              a,
              o,
              l =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : {};
            if (null == e || pi.isSsr) return { width: 0, height: 0 };
            if (!yb.enableCache) return yO(e, l);
            var s =
                ((t = l.fontSize || ""),
                (r = l.fontFamily || ""),
                (n = l.fontWeight || ""),
                (i = l.fontStyle || ""),
                (a = l.letterSpacing || ""),
                (o = l.textTransform || ""),
                ""
                  .concat(e, "|")
                  .concat(t, "|")
                  .concat(r, "|")
                  .concat(n, "|")
                  .concat(i, "|")
                  .concat(a, "|")
                  .concat(o)),
              c = yx.get(s);
            if (c) return c;
            var u = yO(e, l);
            return (yx.set(s, u), u);
          };
        class yS {
          static create(e) {
            return new yS(e);
          }
          constructor(e) {
            this.scale = e;
          }
          get domain() {
            return this.scale.domain;
          }
          get range() {
            return this.scale.range;
          }
          get rangeMin() {
            return this.range()[0];
          }
          get rangeMax() {
            return this.range()[1];
          }
          get bandwidth() {
            return this.scale.bandwidth;
          }
          apply(e) {
            var { bandAware: t, position: r } =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : {};
            if (void 0 !== e) {
              if (r)
                switch (r) {
                  case "start":
                  default:
                    return this.scale(e);
                  case "middle":
                    var n = this.bandwidth ? this.bandwidth() / 2 : 0;
                    return this.scale(e) + n;
                  case "end":
                    var i = this.bandwidth ? this.bandwidth() : 0;
                    return this.scale(e) + i;
                }
              if (t) {
                var a = this.bandwidth ? this.bandwidth() / 2 : 0;
                return this.scale(e) + a;
              }
              return this.scale(e);
            }
          }
          isInRange(e) {
            var t = this.range(),
              r = t[0],
              n = t[t.length - 1];
            return r <= n ? e >= r && e <= n : e >= n && e <= r;
          }
        }
        (function (e, t, r) {
          var n;
          (t =
            "symbol" ==
            typeof (n = (function (e, t) {
              if ("object" != typeof e || !e) return e;
              var r = e[Symbol.toPrimitive];
              if (void 0 !== r) {
                var n = r.call(e, t || "default");
                if ("object" != typeof n) return n;
                throw TypeError("@@toPrimitive must return a primitive value.");
              }
              return ("string" === t ? String : Number)(e);
            })(t, "string"))
              ? n
              : n + "") in e
            ? Object.defineProperty(e, t, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              })
            : (e[t] = r);
        })(yS, "EPS", 1e-4);
        var yk = function (e) {
          var { width: t, height: r } = e,
            n =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 0,
            i = ((((n % 180) + 180) % 180) * Math.PI) / 180,
            a = Math.atan(r / t);
          return Math.abs(
            i > a && i < Math.PI - a ? r / Math.sin(i) : t / Math.cos(i),
          );
        };
        function yN(e, t) {
          if (t < 1) return [];
          if (1 === t) return e;
          for (var r = [], n = 0; n < e.length; n += t) r.push(e[n]);
          return r;
        }
        function yE(e, t, r, n, i) {
          if (e * t < e * n || e * t > e * i) return !1;
          var a = r();
          return (
            e * (t - (e * a) / 2 - n) >= 0 && e * (t + (e * a) / 2 - i) <= 0
          );
        }
        function y_(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function yA(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? y_(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : y_(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function yM(e, t, r) {
          var n,
            {
              tick: i,
              ticks: a,
              viewBox: o,
              minTickGap: l,
              orientation: s,
              interval: c,
              tickFormatter: u,
              unit: d,
              angle: f,
            } = e;
          if (!a || !a.length || !i) return [];
          if (b(c) || pi.isSsr)
            return null !== (n = yN(a, (b(c) ? c : 0) + 1)) && void 0 !== n
              ? n
              : [];
          var h = "top" === s || "bottom" === s ? "width" : "height",
            p =
              d && "width" === h
                ? yP(d, { fontSize: t, letterSpacing: r })
                : { width: 0, height: 0 },
            y = (e, n) => {
              var i,
                a = "function" == typeof u ? u(e.value, n) : e.value;
              return "width" === h
                ? yk(
                    {
                      width:
                        (i = yP(a, { fontSize: t, letterSpacing: r })).width +
                        p.width,
                      height: i.height + p.height,
                    },
                    f,
                  )
                : yP(a, { fontSize: t, letterSpacing: r })[h];
            },
            v = a.length >= 2 ? m(a[1].coordinate - a[0].coordinate) : 1,
            g = (function (e, t, r) {
              var n = "width" === r,
                { x: i, y: a, width: o, height: l } = e;
              return 1 === t
                ? { start: n ? i : a, end: n ? i + o : a + l }
                : { start: n ? i + o : a + l, end: n ? i : a };
            })(o, v, h);
          return "equidistantPreserveStart" === c
            ? (function (e, t, r, n, i) {
                for (
                  var a,
                    o = (n || []).slice(),
                    { start: l, end: s } = t,
                    c = 0,
                    u = 1,
                    d = l;
                  u <= o.length;
                )
                  if (
                    (a = (function () {
                      var t,
                        a = null == n ? void 0 : n[c];
                      if (void 0 === a) return { v: yN(n, u) };
                      var o = c,
                        f = () => (void 0 === t && (t = r(a, o)), t),
                        h = a.coordinate,
                        p = 0 === c || yE(e, h, f, d, s);
                      (p || ((c = 0), (d = l), (u += 1)),
                        p && ((d = h + e * (f() / 2 + i)), (c += u)));
                    })())
                  )
                    return a.v;
                return [];
              })(v, g, y, a, l)
            : ("preserveStart" === c || "preserveStartEnd" === c
                ? (function (e, t, r, n, i, a) {
                    var o = (n || []).slice(),
                      l = o.length,
                      { start: s, end: c } = t;
                    if (a) {
                      var u = n[l - 1],
                        d = r(u, l - 1),
                        f = e * (u.coordinate + (e * d) / 2 - c);
                      ((o[l - 1] = u =
                        yA(
                          yA({}, u),
                          {},
                          {
                            tickCoord:
                              f > 0 ? u.coordinate - f * e : u.coordinate,
                          },
                        )),
                        null != u.tickCoord &&
                          yE(e, u.tickCoord, () => d, s, c) &&
                          ((c = u.tickCoord - e * (d / 2 + i)),
                          (o[l - 1] = yA(yA({}, u), {}, { isShow: !0 }))));
                    }
                    for (
                      var h = a ? l - 1 : l,
                        p = function (t) {
                          var n,
                            a = o[t],
                            l = () => (void 0 === n && (n = r(a, t)), n);
                          if (0 === t) {
                            var u = e * (a.coordinate - (e * l()) / 2 - s);
                            o[t] = a = yA(
                              yA({}, a),
                              {},
                              {
                                tickCoord:
                                  u < 0 ? a.coordinate - u * e : a.coordinate,
                              },
                            );
                          } else
                            o[t] = a = yA(
                              yA({}, a),
                              {},
                              { tickCoord: a.coordinate },
                            );
                          null != a.tickCoord &&
                            yE(e, a.tickCoord, l, s, c) &&
                            ((s = a.tickCoord + e * (l() / 2 + i)),
                            (o[t] = yA(yA({}, a), {}, { isShow: !0 })));
                        },
                        y = 0;
                      y < h;
                      y++
                    )
                      p(y);
                    return o;
                  })(v, g, y, a, l, "preserveStartEnd" === c)
                : (function (e, t, r, n, i) {
                    for (
                      var a = (n || []).slice(),
                        o = a.length,
                        { start: l } = t,
                        { end: s } = t,
                        c = function (t) {
                          var n,
                            c = a[t],
                            u = () => (void 0 === n && (n = r(c, t)), n);
                          if (t === o - 1) {
                            var d = e * (c.coordinate + (e * u()) / 2 - s);
                            a[t] = c = yA(
                              yA({}, c),
                              {},
                              {
                                tickCoord:
                                  d > 0 ? c.coordinate - d * e : c.coordinate,
                              },
                            );
                          } else
                            a[t] = c = yA(
                              yA({}, c),
                              {},
                              { tickCoord: c.coordinate },
                            );
                          null != c.tickCoord &&
                            yE(e, c.tickCoord, u, l, s) &&
                            ((s = c.tickCoord - e * (u() / 2 + i)),
                            (a[t] = yA(yA({}, c), {}, { isShow: !0 })));
                        },
                        u = o - 1;
                      u >= 0;
                      u--
                    )
                      c(u);
                    return a;
                  })(v, g, y, a, l)
              ).filter((e) => e.isShow);
        }
        var yC = ["children", "className"];
        function yT() {
          return (yT = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        var yD = l.forwardRef((e, t) => {
            var { children: r, className: n } = e,
              i = (function (e, t) {
                if (null == e) return {};
                var r,
                  n,
                  i = (function (e, t) {
                    if (null == e) return {};
                    var r = {};
                    for (var n in e)
                      if ({}.hasOwnProperty.call(e, n)) {
                        if (-1 !== t.indexOf(n)) continue;
                        r[n] = e[n];
                      }
                    return r;
                  })(e, t);
                if (Object.getOwnPropertySymbols) {
                  var a = Object.getOwnPropertySymbols(e);
                  for (n = 0; n < a.length; n++)
                    ((r = a[n]),
                      -1 === t.indexOf(r) &&
                        {}.propertyIsEnumerable.call(e, r) &&
                        (i[r] = e[r]));
                }
                return i;
              })(e, yC),
              a = d("recharts-layer", n);
            return l.createElement(
              "g",
              yT({ className: a }, pA(i), { ref: t }),
              r,
            );
          }),
          yI = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([*/])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/,
          yz = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([+-])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/,
          yL = /^px|cm|vh|vw|em|rem|%|mm|in|pt|pc|ex|ch|vmin|vmax|Q$/,
          yR = /(-?\d+(?:\.\d+)?)([a-zA-Z%]+)?/,
          y$ = {
            cm: 96 / 2.54,
            mm: 96 / 25.4,
            pt: 96 / 72,
            pc: 16,
            in: 96,
            Q: 96 / 101.6,
            px: 1,
          },
          yU = Object.keys(y$);
        class yF {
          static parse(e) {
            var t,
              [, r, n] = null !== (t = yR.exec(e)) && void 0 !== t ? t : [];
            return new yF(parseFloat(r), null != n ? n : "");
          }
          constructor(e, t) {
            ((this.num = e),
              (this.unit = t),
              (this.num = e),
              (this.unit = t),
              v(e) && (this.unit = ""),
              "" === t || yL.test(t) || ((this.num = NaN), (this.unit = "")),
              yU.includes(t) && ((this.num = e * y$[t]), (this.unit = "px")));
          }
          add(e) {
            return this.unit !== e.unit
              ? new yF(NaN, "")
              : new yF(this.num + e.num, this.unit);
          }
          subtract(e) {
            return this.unit !== e.unit
              ? new yF(NaN, "")
              : new yF(this.num - e.num, this.unit);
          }
          multiply(e) {
            return "" !== this.unit && "" !== e.unit && this.unit !== e.unit
              ? new yF(NaN, "")
              : new yF(this.num * e.num, this.unit || e.unit);
          }
          divide(e) {
            return "" !== this.unit && "" !== e.unit && this.unit !== e.unit
              ? new yF(NaN, "")
              : new yF(this.num / e.num, this.unit || e.unit);
          }
          toString() {
            return "".concat(this.num).concat(this.unit);
          }
          isNaN() {
            return v(this.num);
          }
        }
        function yB(e) {
          if (e.includes("NaN")) return "NaN";
          for (var t = e; t.includes("*") || t.includes("/"); ) {
            var r,
              [, n, i, a] = null !== (r = yI.exec(t)) && void 0 !== r ? r : [],
              o = yF.parse(null != n ? n : ""),
              l = yF.parse(null != a ? a : ""),
              s = "*" === i ? o.multiply(l) : o.divide(l);
            if (s.isNaN()) return "NaN";
            t = t.replace(yI, s.toString());
          }
          for (; t.includes("+") || /.-\d+(?:\.\d+)?/.test(t); ) {
            var c,
              [, u, d, f] = null !== (c = yz.exec(t)) && void 0 !== c ? c : [],
              h = yF.parse(null != u ? u : ""),
              p = yF.parse(null != f ? f : ""),
              y = "+" === d ? h.add(p) : h.subtract(p);
            if (y.isNaN()) return "NaN";
            t = t.replace(yz, y.toString());
          }
          return t;
        }
        var yK = /\(([^()]*)\)/;
        function yW(e) {
          var t = (function (e) {
            try {
              var t;
              return (
                (t = e.replace(/\s+/g, "")),
                (t = (function (e) {
                  for (var t, r = e; null != (t = yK.exec(r)); ) {
                    var [, n] = t;
                    r = r.replace(yK, yB(n));
                  }
                  return r;
                })(t)),
                (t = yB(t))
              );
            } catch (e) {
              return "NaN";
            }
          })(e.slice(5, -1));
          return "NaN" === t ? "" : t;
        }
        var yH = [
            "x",
            "y",
            "lineHeight",
            "capHeight",
            "fill",
            "scaleToFit",
            "textAnchor",
            "verticalAnchor",
          ],
          yq = ["dx", "dy", "angle", "className", "breakAll"];
        function yV() {
          return (yV = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function yZ(e, t) {
          if (null == e) return {};
          var r,
            n,
            i = (function (e, t) {
              if (null == e) return {};
              var r = {};
              for (var n in e)
                if ({}.hasOwnProperty.call(e, n)) {
                  if (-1 !== t.indexOf(n)) continue;
                  r[n] = e[n];
                }
              return r;
            })(e, t);
          if (Object.getOwnPropertySymbols) {
            var a = Object.getOwnPropertySymbols(e);
            for (n = 0; n < a.length; n++)
              ((r = a[n]),
                -1 === t.indexOf(r) &&
                  {}.propertyIsEnumerable.call(e, r) &&
                  (i[r] = e[r]));
          }
          return i;
        }
        var yY = /[ \f\n\r\t\v\u2028\u2029]+/,
          yG = (e) => {
            var { children: t, breakAll: r, style: n } = e;
            try {
              var i = [];
              N(t) || (i = r ? t.toString().split("") : t.toString().split(yY));
              var a = i.map((e) => ({ word: e, width: yP(e, n).width })),
                o = r ? 0 : yP("\xa0", n).width;
              return { wordsWithComputedWidth: a, spaceWidth: o };
            } catch (e) {
              return null;
            }
          },
          yX = (e, t, r, n) =>
            e.reduce((e, i) => {
              var { word: a, width: o } = i,
                l = e[e.length - 1];
              return (
                l &&
                null != o &&
                (null == t || n || l.width + o + r < Number(t))
                  ? (l.words.push(a), (l.width += o + r))
                  : e.push({ words: [a], width: o }),
                e
              );
            }, []),
          yQ = (e) => e.reduce((e, t) => (e.width > t.width ? e : t)),
          yJ = (e, t, r, n, i, a, o, l) => {
            var s = yG({
              breakAll: r,
              style: n,
              children: e.slice(0, t) + "…",
            });
            if (!s) return [!1, []];
            var c = yX(s.wordsWithComputedWidth, a, o, l);
            return [c.length > i || yQ(c).width > Number(a), c];
          },
          y0 = (e, t, r, n, i) => {
            var a,
              { maxLines: o, children: l, style: s, breakAll: c } = e,
              u = b(o),
              d = String(l),
              f = yX(t, n, r, i);
            if (!u || i || !(f.length > o || yQ(f).width > Number(n))) return f;
            for (
              var h = 0, p = d.length - 1, y = 0;
              h <= p && y <= d.length - 1;
            ) {
              var m = Math.floor((h + p) / 2),
                [v, g] = yJ(d, m - 1, c, s, o, n, r, i),
                [x] = yJ(d, m, c, s, o, n, r, i);
              if ((v || x || (h = m + 1), v && x && (p = m - 1), !v && x)) {
                a = g;
                break;
              }
              y++;
            }
            return a || f;
          },
          y1 = (e) => [
            { words: N(e) ? [] : e.toString().split(yY), width: void 0 },
          ],
          y2 = (e) => {
            var {
              width: t,
              scaleToFit: r,
              children: n,
              style: i,
              breakAll: a,
              maxLines: o,
            } = e;
            if ((t || r) && !pi.isSsr) {
              var l = yG({ breakAll: a, children: n, style: i });
              if (!l) return y1(n);
              var { wordsWithComputedWidth: s, spaceWidth: c } = l;
              return y0(
                { breakAll: a, children: n, maxLines: o, style: i },
                s,
                c,
                t,
                !!r,
              );
            }
            return y1(n);
          },
          y3 = "#808080",
          y6 = {
            angle: 0,
            breakAll: !1,
            capHeight: "0.71em",
            fill: y3,
            lineHeight: "1em",
            scaleToFit: !1,
            textAnchor: "start",
            verticalAnchor: "end",
            x: 0,
            y: 0,
          },
          Text = (0, l.forwardRef)((e, t) => {
            var r,
              n = yd(e, y6),
              {
                x: i,
                y: a,
                lineHeight: o,
                capHeight: s,
                fill: c,
                scaleToFit: u,
                textAnchor: f,
                verticalAnchor: h,
              } = n,
              p = yZ(n, yH),
              y = (0, l.useMemo)(
                () =>
                  y2({
                    breakAll: p.breakAll,
                    children: p.children,
                    maxLines: p.maxLines,
                    scaleToFit: u,
                    style: p.style,
                    width: p.width,
                  }),
                [p.breakAll, p.children, p.maxLines, u, p.style, p.width],
              ),
              { dx: m, dy: v, angle: g, className: w, breakAll: j } = p,
              O = yZ(p, yq);
            if (!x(i) || !x(a) || 0 === y.length) return null;
            var P = Number(i) + (b(m) ? m : 0),
              S = Number(a) + (b(v) ? v : 0);
            if (!R(P) || !R(S)) return null;
            switch (h) {
              case "start":
                r = yW("calc(".concat(s, ")"));
                break;
              case "middle":
                r = yW(
                  "calc("
                    .concat((y.length - 1) / 2, " * -")
                    .concat(o, " + (")
                    .concat(s, " / 2))"),
                );
                break;
              default:
                r = yW("calc(".concat(y.length - 1, " * -").concat(o, ")"));
            }
            var k = [];
            if (u) {
              var N = y[0].width,
                { width: E } = p;
              k.push("scale(".concat(b(E) && b(N) ? E / N : 1, ")"));
            }
            return (
              g &&
                k.push(
                  "rotate(".concat(g, ", ").concat(P, ", ").concat(S, ")"),
                ),
              k.length && (O.transform = k.join(" ")),
              l.createElement(
                "text",
                yV({}, pA(O), {
                  ref: t,
                  x: P,
                  y: S,
                  className: d("recharts-text", w),
                  textAnchor: f,
                  fill: c.includes("url") ? y3 : c,
                }),
                y.map((e, t) => {
                  var n = e.words.join(j ? "" : " ");
                  return l.createElement(
                    "tspan",
                    {
                      x: P,
                      dy: 0 === t ? r : o,
                      key: "".concat(n, "-").concat(t),
                    },
                    n,
                  );
                }),
              )
            );
          });
        Text.displayName = "Text";
        var y5 = r(54222);
        function y4(e) {
          var { zIndex: t, children: r } = e,
            n = iT() && void 0 !== t && 0 !== t,
            i = iw(),
            a = nD();
          (0, l.useLayoutEffect)(
            () =>
              n
                ? (a(pu({ zIndex: t })),
                  () => {
                    a(pd({ zIndex: t }));
                  })
                : A,
            [a, t, n],
          );
          var o = nR((e) => pz(e, t, i));
          if (!n) return r;
          if (!o) return null;
          var s = document.getElementById(o);
          return s ? (0, y5.createPortal)(r, s) : null;
        }
        var y7 = ["labelRef"];
        function y8(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function y9(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? y8(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : y8(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function me() {
          return (me = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        var mt = (0, l.createContext)(null),
          mr = (e) => {
            var {
                x: t,
                y: r,
                upperWidth: n,
                lowerWidth: i,
                width: a,
                height: o,
                children: s,
              } = e,
              c = (0, l.useMemo)(
                () => ({
                  x: t,
                  y: r,
                  upperWidth: n,
                  lowerWidth: i,
                  width: a,
                  height: o,
                }),
                [t, r, n, i, a, o],
              );
            return l.createElement(mt.Provider, { value: c }, s);
          },
          mn = () => {
            var e = (0, l.useContext)(mt),
              t = iS();
            return e || iP(t);
          },
          mi = (0, l.createContext)(null),
          ma = () => {
            var e = (0, l.useContext)(mi),
              t = nR(cW);
            return e || t;
          },
          mo = (e) => {
            var { value: t, formatter: r } = e,
              n = N(e.children) ? t : e.children;
            return "function" == typeof r ? r(n) : n;
          },
          ml = (e) => null != e && "function" == typeof e,
          ms = (e, t) => m(t - e) * Math.min(Math.abs(t - e), 360),
          mc = (e, t, r, n, i) => {
            var a,
              o,
              { offset: s, className: c } = e,
              {
                cx: u,
                cy: f,
                innerRadius: h,
                outerRadius: p,
                startAngle: y,
                endAngle: m,
                clockWise: v,
              } = i,
              g = (h + p) / 2,
              b = ms(y, m),
              x = b >= 0 ? 1 : -1;
            switch (t) {
              case "insideStart":
                ((a = y + x * s), (o = v));
                break;
              case "insideEnd":
                ((a = m - x * s), (o = !v));
                break;
              case "end":
                ((a = m + x * s), (o = v));
                break;
              default:
                throw Error("Unsupported position ".concat(t));
            }
            o = b <= 0 ? o : !o;
            var w = cj(u, f, g, a),
              O = cj(u, f, g, a + (o ? 1 : -1) * 359),
              P = "M"
                .concat(w.x, ",")
                .concat(w.y, "\n    A")
                .concat(g, ",")
                .concat(g, ",0,1,")
                .concat(o ? 0 : 1, ",\n    ")
                .concat(O.x, ",")
                .concat(O.y),
              S = N(e.id) ? j("recharts-radial-line-") : e.id;
            return l.createElement(
              "text",
              me({}, n, {
                dominantBaseline: "central",
                className: d("recharts-radial-bar-label", c),
              }),
              l.createElement(
                "defs",
                null,
                l.createElement("path", { id: S, d: P }),
              ),
              l.createElement("textPath", { xlinkHref: "#".concat(S) }, r),
            );
          },
          mu = (e, t, r) => {
            var {
                cx: n,
                cy: i,
                innerRadius: a,
                outerRadius: o,
                startAngle: l,
                endAngle: s,
              } = e,
              c = (l + s) / 2;
            if ("outside" === r) {
              var { x: u, y: d } = cj(n, i, o + t, c);
              return {
                x: u,
                y: d,
                textAnchor: u >= n ? "start" : "end",
                verticalAnchor: "middle",
              };
            }
            if ("center" === r)
              return {
                x: n,
                y: i,
                textAnchor: "middle",
                verticalAnchor: "middle",
              };
            if ("centerTop" === r)
              return {
                x: n,
                y: i,
                textAnchor: "middle",
                verticalAnchor: "start",
              };
            if ("centerBottom" === r)
              return {
                x: n,
                y: i,
                textAnchor: "middle",
                verticalAnchor: "end",
              };
            var { x: f, y: h } = cj(n, i, (a + o) / 2, c);
            return {
              x: f,
              y: h,
              textAnchor: "middle",
              verticalAnchor: "middle",
            };
          },
          md = (e) => "cx" in e && b(e.cx),
          mf = (e, t) => {
            var r,
              { parentViewBox: n, offset: i, position: a } = e;
            null == n || md(n) || (r = n);
            var { x: o, y: l, upperWidth: s, lowerWidth: c, height: u } = t,
              d = o + (s - c) / 2,
              f = (o + d) / 2,
              h = (s + c) / 2,
              p = u >= 0 ? 1 : -1,
              y = p * i,
              m = p > 0 ? "end" : "start",
              v = p > 0 ? "start" : "end",
              x = s >= 0 ? 1 : -1,
              w = x * i,
              j = x > 0 ? "end" : "start",
              P = x > 0 ? "start" : "end";
            if ("top" === a)
              return y9(
                y9(
                  {},
                  {
                    x: o + s / 2,
                    y: l - y,
                    textAnchor: "middle",
                    verticalAnchor: m,
                  },
                ),
                r ? { height: Math.max(l - r.y, 0), width: s } : {},
              );
            if ("bottom" === a)
              return y9(
                y9(
                  {},
                  {
                    x: d + c / 2,
                    y: l + u + y,
                    textAnchor: "middle",
                    verticalAnchor: v,
                  },
                ),
                r
                  ? { height: Math.max(r.y + r.height - (l + u), 0), width: c }
                  : {},
              );
            if ("left" === a) {
              var S = {
                x: f - w,
                y: l + u / 2,
                textAnchor: j,
                verticalAnchor: "middle",
              };
              return y9(
                y9({}, S),
                r ? { width: Math.max(S.x - r.x, 0), height: u } : {},
              );
            }
            if ("right" === a) {
              var k = {
                x: f + h + w,
                y: l + u / 2,
                textAnchor: P,
                verticalAnchor: "middle",
              };
              return y9(
                y9({}, k),
                r ? { width: Math.max(r.x + r.width - k.x, 0), height: u } : {},
              );
            }
            var N = r ? { width: h, height: u } : {};
            return "insideLeft" === a
              ? y9(
                  {
                    x: f + w,
                    y: l + u / 2,
                    textAnchor: P,
                    verticalAnchor: "middle",
                  },
                  N,
                )
              : "insideRight" === a
                ? y9(
                    {
                      x: f + h - w,
                      y: l + u / 2,
                      textAnchor: j,
                      verticalAnchor: "middle",
                    },
                    N,
                  )
                : "insideTop" === a
                  ? y9(
                      {
                        x: o + s / 2,
                        y: l + y,
                        textAnchor: "middle",
                        verticalAnchor: v,
                      },
                      N,
                    )
                  : "insideBottom" === a
                    ? y9(
                        {
                          x: d + c / 2,
                          y: l + u - y,
                          textAnchor: "middle",
                          verticalAnchor: m,
                        },
                        N,
                      )
                    : "insideTopLeft" === a
                      ? y9(
                          {
                            x: o + w,
                            y: l + y,
                            textAnchor: P,
                            verticalAnchor: v,
                          },
                          N,
                        )
                      : "insideTopRight" === a
                        ? y9(
                            {
                              x: o + s - w,
                              y: l + y,
                              textAnchor: j,
                              verticalAnchor: v,
                            },
                            N,
                          )
                        : "insideBottomLeft" === a
                          ? y9(
                              {
                                x: d + w,
                                y: l + u - y,
                                textAnchor: P,
                                verticalAnchor: m,
                              },
                              N,
                            )
                          : "insideBottomRight" === a
                            ? y9(
                                {
                                  x: d + c - w,
                                  y: l + u - y,
                                  textAnchor: j,
                                  verticalAnchor: m,
                                },
                                N,
                              )
                            : a &&
                                "object" == typeof a &&
                                (b(a.x) || g(a.x)) &&
                                (b(a.y) || g(a.y))
                              ? y9(
                                  {
                                    x: o + O(a.x, h),
                                    y: l + O(a.y, u),
                                    textAnchor: "end",
                                    verticalAnchor: "end",
                                  },
                                  N,
                                )
                              : y9(
                                  {
                                    x: o + s / 2,
                                    y: l + u / 2,
                                    textAnchor: "middle",
                                    verticalAnchor: "middle",
                                  },
                                  N,
                                );
          },
          mh = {
            angle: 0,
            offset: 5,
            zIndex: cE.label,
            position: "middle",
            textBreakAll: !1,
          };
        function mp(e) {
          var t,
            r,
            n,
            i,
            a = yd(e, mh),
            {
              viewBox: o,
              position: s,
              value: c,
              children: u,
              content: f,
              className: h = "",
              textBreakAll: p,
              labelRef: y,
            } = a,
            m = ma(),
            v = mn();
          if (
            !(r =
              null == o
                ? "center" === s
                  ? v
                  : null != m
                    ? m
                    : v
                : md(o)
                  ? o
                  : iP(o)) ||
            (N(c) &&
              N(u) &&
              !(0, l.isValidElement)(f) &&
              "function" != typeof f)
          )
            return null;
          var g = y9(y9({}, a), {}, { viewBox: r });
          if ((0, l.isValidElement)(f)) {
            var { labelRef: b } = g,
              x = (function (e, t) {
                if (null == e) return {};
                var r,
                  n,
                  i = (function (e, t) {
                    if (null == e) return {};
                    var r = {};
                    for (var n in e)
                      if ({}.hasOwnProperty.call(e, n)) {
                        if (-1 !== t.indexOf(n)) continue;
                        r[n] = e[n];
                      }
                    return r;
                  })(e, t);
                if (Object.getOwnPropertySymbols) {
                  var a = Object.getOwnPropertySymbols(e);
                  for (n = 0; n < a.length; n++)
                    ((r = a[n]),
                      -1 === t.indexOf(r) &&
                        {}.propertyIsEnumerable.call(e, r) &&
                        (i[r] = e[r]));
                }
                return i;
              })(g, y7);
            return (0, l.cloneElement)(f, x);
          }
          if ("function" == typeof f) {
            if (((n = (0, l.createElement)(f, g)), (0, l.isValidElement)(n)))
              return n;
          } else n = mo(a);
          var w = pA(a);
          if (md(r)) {
            if ("insideStart" === s || "insideEnd" === s || "end" === s)
              return mc(a, s, n, w, r);
            i = mu(r, a.offset, a.position);
          } else i = mf(a, r);
          return l.createElement(
            y4,
            { zIndex: a.zIndex },
            l.createElement(
              Text,
              me({ ref: y, className: d("recharts-label", h) }, w, i, {
                textAnchor:
                  "start" === (t = w.textAnchor) ||
                  "middle" === t ||
                  "end" === t ||
                  "inherit" === t
                    ? w.textAnchor
                    : i.textAnchor,
                breakAll: p,
              }),
              n,
            ),
          );
        }
        mp.displayName = "Label";
        var my = (e, t, r) => {
          if (!e) return null;
          var n = { viewBox: t, labelRef: r };
          return !0 === e
            ? l.createElement(mp, me({ key: "label-implicit" }, n))
            : x(e)
              ? l.createElement(mp, me({ key: "label-implicit", value: e }, n))
              : (0, l.isValidElement)(e)
                ? e.type === mp
                  ? (0, l.cloneElement)(e, y9({ key: "label-implicit" }, n))
                  : l.createElement(
                      mp,
                      me({ key: "label-implicit", content: e }, n),
                    )
                : ml(e)
                  ? l.createElement(
                      mp,
                      me({ key: "label-implicit", content: e }, n),
                    )
                  : e && "object" == typeof e
                    ? l.createElement(
                        mp,
                        me({}, e, { key: "label-implicit" }, n),
                      )
                    : null;
        };
        function mm(e) {
          var { label: t, labelRef: r } = e;
          return my(t, mn(), r) || null;
        }
        var mv = (e) => "radius" in e && "startAngle" in e && "endAngle" in e,
          mg = (e, t) => {
            if (!e || "function" == typeof e || "boolean" == typeof e)
              return null;
            var r = e;
            if (
              ((0, l.isValidElement)(e) && (r = e.props),
              "object" != typeof r && "function" != typeof r)
            )
              return null;
            var n = {};
            return (
              Object.keys(r).forEach((e) => {
                pP(e) && (n[e] = t || ((t) => r[e](r, t)));
              }),
              n
            );
          },
          mb = (e, t, r) => (n) => (e(t, r, n), null),
          mx = (e, t, r) => {
            if (null === e || ("object" != typeof e && "function" != typeof e))
              return null;
            var n = null;
            return (
              Object.keys(e).forEach((i) => {
                var a = e[i];
                pP(i) &&
                  "function" == typeof a &&
                  (n || (n = {}), (n[i] = mb(a, t, r)));
              }),
              n
            );
          },
          mw = (e) => {
            var {
                ticks: t,
                label: r,
                labelGapWithTick: n = 5,
                tickSize: i = 0,
                tickMargin: a = 0,
              } = e,
              o = 0;
            if (t) {
              Array.from(t).forEach((e) => {
                if (e) {
                  var t = e.getBoundingClientRect();
                  t.width > o && (o = t.width);
                }
              });
              var l = r ? r.getBoundingClientRect().width : 0;
              return Math.round(o + (i + a) + l + (r ? n : 0));
            }
            return 0;
          },
          mj = [
            "axisLine",
            "width",
            "height",
            "className",
            "hide",
            "ticks",
            "axisType",
          ];
        function mO() {
          return (mO = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function mP(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function mS(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? mP(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : mP(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var mk = {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          viewBox: { x: 0, y: 0, width: 0, height: 0 },
          orientation: "bottom",
          ticks: [],
          stroke: "#666",
          tickLine: !0,
          axisLine: !0,
          tick: !0,
          mirror: !1,
          minTickGap: 5,
          tickSize: 6,
          tickMargin: 2,
          interval: "preserveEnd",
          zIndex: cE.axis,
        };
        function mN(e) {
          var {
            x: t,
            y: r,
            width: n,
            height: i,
            orientation: a,
            mirror: o,
            axisLine: s,
            otherSvgProps: c,
          } = e;
          if (!s) return null;
          var u = mS(mS(mS({}, c), pE(s)), {}, { fill: "none" });
          if ("top" === a || "bottom" === a) {
            var f = +(("top" === a && !o) || ("bottom" === a && o));
            u = mS(
              mS({}, u),
              {},
              { x1: t, y1: r + f * i, x2: t + n, y2: r + f * i },
            );
          } else {
            var h = +(("left" === a && !o) || ("right" === a && o));
            u = mS(
              mS({}, u),
              {},
              { x1: t + h * n, y1: r, x2: t + h * n, y2: r + i },
            );
          }
          return l.createElement(
            "line",
            mO({}, u, {
              className: d("recharts-cartesian-axis-line", y()(s, "className")),
            }),
          );
        }
        function mE(e) {
          var t,
            { option: r, tickProps: n, value: i } = e,
            a = d(n.className, "recharts-cartesian-axis-tick-value");
          if (l.isValidElement(r))
            t = l.cloneElement(r, mS(mS({}, n), {}, { className: a }));
          else if ("function" == typeof r)
            t = r(mS(mS({}, n), {}, { className: a }));
          else {
            var o = "recharts-cartesian-axis-tick-value";
            ("boolean" != typeof r &&
              (o = d(o, null == r ? void 0 : r.className)),
              (t = l.createElement(Text, mO({}, n, { className: o }), i)));
          }
          return t;
        }
        var m_ = (0, l.forwardRef)((e, t) => {
            var {
                ticks: r = [],
                tick: n,
                tickLine: i,
                stroke: a,
                tickFormatter: o,
                unit: s,
                padding: c,
                tickTextProps: u,
                orientation: f,
                mirror: h,
                x: p,
                y: m,
                width: v,
                height: g,
                tickSize: x,
                tickMargin: w,
                fontSize: j,
                letterSpacing: O,
                getTicksConfig: P,
                events: S,
                axisType: k,
              } = e,
              N = yM(mS(mS({}, P), {}, { ticks: r }), j, O),
              E = (function (e, t) {
                switch (e) {
                  case "left":
                    return t ? "start" : "end";
                  case "right":
                    return t ? "end" : "start";
                  default:
                    return "middle";
                }
              })(f, h),
              _ = (function (e, t) {
                switch (e) {
                  case "left":
                  case "right":
                    return "middle";
                  case "top":
                    return t ? "start" : "end";
                  default:
                    return t ? "end" : "start";
                }
              })(f, h),
              A = pE(P),
              M = p_(n),
              C = {};
            "object" == typeof i && (C = i);
            var T = mS(mS({}, A), {}, { fill: "none" }, C),
              D = N.map((e) =>
                mS(
                  { entry: e },
                  (function (e, t, r, n, i, a, o, l, s) {
                    var c,
                      u,
                      d,
                      f,
                      h,
                      p,
                      y = l ? -1 : 1,
                      m = e.tickSize || o,
                      v = b(e.tickCoord) ? e.tickCoord : e.coordinate;
                    switch (a) {
                      case "top":
                        ((c = u = e.coordinate),
                          (p = (d = (f = r + +!l * i) - y * m) - y * s),
                          (h = v));
                        break;
                      case "left":
                        ((d = f = e.coordinate),
                          (h = (c = (u = t + +!l * n) - y * m) - y * s),
                          (p = v));
                        break;
                      case "right":
                        ((d = f = e.coordinate),
                          (h = (c = (u = t + +l * n) + y * m) + y * s),
                          (p = v));
                        break;
                      default:
                        ((c = u = e.coordinate),
                          (p = (d = (f = r + +l * i) + y * m) + y * s),
                          (h = v));
                    }
                    return {
                      line: { x1: c, y1: d, x2: u, y2: f },
                      tick: { x: h, y: p },
                    };
                  })(e, p, m, v, g, f, x, h, w),
                ),
              ),
              I = D.map((e) => {
                var { entry: t, line: r } = e;
                return l.createElement(
                  yD,
                  {
                    className: "recharts-cartesian-axis-tick",
                    key: "tick-"
                      .concat(t.value, "-")
                      .concat(t.coordinate, "-")
                      .concat(t.tickCoord),
                  },
                  i &&
                    l.createElement(
                      "line",
                      mO({}, T, r, {
                        className: d(
                          "recharts-cartesian-axis-tick-line",
                          y()(i, "className"),
                        ),
                      }),
                    ),
                );
              }),
              z = D.map((e, t) => {
                var { entry: r, tick: i } = e,
                  d = mS(
                    mS(
                      mS(
                        mS({ textAnchor: E, verticalAnchor: _ }, A),
                        {},
                        { stroke: "none", fill: a },
                        M,
                      ),
                      i,
                    ),
                    {},
                    {
                      index: t,
                      payload: r,
                      visibleTicksCount: N.length,
                      tickFormatter: o,
                      padding: c,
                    },
                    u,
                  );
                return l.createElement(
                  yD,
                  mO(
                    {
                      className: "recharts-cartesian-axis-tick-label",
                      key: "tick-label-"
                        .concat(r.value, "-")
                        .concat(r.coordinate, "-")
                        .concat(r.tickCoord),
                    },
                    mx(S, r, t),
                  ),
                  n &&
                    l.createElement(mE, {
                      option: n,
                      tickProps: d,
                      value: ""
                        .concat(
                          "function" == typeof o ? o(r.value, t) : r.value,
                        )
                        .concat(s || ""),
                    }),
                );
              });
            return l.createElement(
              "g",
              {
                className: "recharts-cartesian-axis-ticks recharts-".concat(
                  k,
                  "-ticks",
                ),
              },
              z.length > 0 &&
                l.createElement(
                  y4,
                  { zIndex: cE.label },
                  l.createElement(
                    "g",
                    {
                      className:
                        "recharts-cartesian-axis-tick-labels recharts-".concat(
                          k,
                          "-tick-labels",
                        ),
                      ref: t,
                    },
                    z,
                  ),
                ),
              I.length > 0 &&
                l.createElement(
                  "g",
                  {
                    className:
                      "recharts-cartesian-axis-tick-lines recharts-".concat(
                        k,
                        "-tick-lines",
                      ),
                  },
                  I,
                ),
            );
          }),
          mA = (0, l.forwardRef)((e, t) => {
            var {
                axisLine: r,
                width: n,
                height: i,
                className: a,
                hide: o,
                ticks: s,
                axisType: c,
              } = e,
              u = (function (e, t) {
                if (null == e) return {};
                var r,
                  n,
                  i = (function (e, t) {
                    if (null == e) return {};
                    var r = {};
                    for (var n in e)
                      if ({}.hasOwnProperty.call(e, n)) {
                        if (-1 !== t.indexOf(n)) continue;
                        r[n] = e[n];
                      }
                    return r;
                  })(e, t);
                if (Object.getOwnPropertySymbols) {
                  var a = Object.getOwnPropertySymbols(e);
                  for (n = 0; n < a.length; n++)
                    ((r = a[n]),
                      -1 === t.indexOf(r) &&
                        {}.propertyIsEnumerable.call(e, r) &&
                        (i[r] = e[r]));
                }
                return i;
              })(e, mj),
              [f, h] = (0, l.useState)(""),
              [p, y] = (0, l.useState)(""),
              m = (0, l.useRef)(null);
            (0, l.useImperativeHandle)(t, () => ({
              getCalculatedWidth: () => {
                var t;
                return mw({
                  ticks: m.current,
                  label:
                    null === (t = e.labelRef) || void 0 === t
                      ? void 0
                      : t.current,
                  labelGapWithTick: 5,
                  tickSize: e.tickSize,
                  tickMargin: e.tickMargin,
                });
              },
            }));
            var v = (0, l.useCallback)(
              (e) => {
                if (e) {
                  var t = e.getElementsByClassName(
                    "recharts-cartesian-axis-tick-value",
                  );
                  m.current = t;
                  var r = t[0];
                  if (r) {
                    var n = window.getComputedStyle(r),
                      i = n.fontSize,
                      a = n.letterSpacing;
                    (i !== f || a !== p) && (h(i), y(a));
                  }
                }
              },
              [f, p],
            );
            return o || (null != n && n <= 0) || (null != i && i <= 0)
              ? null
              : l.createElement(
                  y4,
                  { zIndex: e.zIndex },
                  l.createElement(
                    yD,
                    { className: d("recharts-cartesian-axis", a) },
                    l.createElement(mN, {
                      x: e.x,
                      y: e.y,
                      width: n,
                      height: i,
                      orientation: e.orientation,
                      mirror: e.mirror,
                      axisLine: r,
                      otherSvgProps: pE(e),
                    }),
                    l.createElement(m_, {
                      ref: v,
                      axisType: c,
                      events: u,
                      fontSize: f,
                      getTicksConfig: e,
                      height: e.height,
                      letterSpacing: p,
                      mirror: e.mirror,
                      orientation: e.orientation,
                      padding: e.padding,
                      stroke: e.stroke,
                      tick: e.tick,
                      tickFormatter: e.tickFormatter,
                      tickLine: e.tickLine,
                      tickMargin: e.tickMargin,
                      tickSize: e.tickSize,
                      tickTextProps: e.tickTextProps,
                      ticks: s,
                      unit: e.unit,
                      width: e.width,
                      x: e.x,
                      y: e.y,
                    }),
                    l.createElement(
                      mr,
                      {
                        x: e.x,
                        y: e.y,
                        width: e.width,
                        height: e.height,
                        lowerWidth: e.width,
                        upperWidth: e.width,
                      },
                      l.createElement(mm, {
                        label: e.label,
                        labelRef: e.labelRef,
                      }),
                      e.children,
                    ),
                  ),
                );
          }),
          mM = l.forwardRef((e, t) => {
            var r = yd(e, mk);
            return l.createElement(mA, mO({}, r, { ref: t }));
          });
        mM.displayName = "CartesianAxis";
        var mC = ["x1", "y1", "x2", "y2", "key"],
          mT = ["offset"],
          mD = ["xAxisId", "yAxisId"],
          mI = ["xAxisId", "yAxisId"];
        function mz(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function mL(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? mz(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : mz(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function mR() {
          return (mR = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function m$(e, t) {
          if (null == e) return {};
          var r,
            n,
            i = (function (e, t) {
              if (null == e) return {};
              var r = {};
              for (var n in e)
                if ({}.hasOwnProperty.call(e, n)) {
                  if (-1 !== t.indexOf(n)) continue;
                  r[n] = e[n];
                }
              return r;
            })(e, t);
          if (Object.getOwnPropertySymbols) {
            var a = Object.getOwnPropertySymbols(e);
            for (n = 0; n < a.length; n++)
              ((r = a[n]),
                -1 === t.indexOf(r) &&
                  {}.propertyIsEnumerable.call(e, r) &&
                  (i[r] = e[r]));
          }
          return i;
        }
        var mU = (e) => {
          var { fill: t } = e;
          if (!t || "none" === t) return null;
          var { fillOpacity: r, x: n, y: i, width: a, height: o, ry: s } = e;
          return l.createElement("rect", {
            x: n,
            y: i,
            ry: s,
            width: a,
            height: o,
            stroke: "none",
            fill: t,
            fillOpacity: r,
            className: "recharts-cartesian-grid-bg",
          });
        };
        function mF(e) {
          var { option: t, lineItemProps: r } = e;
          if (l.isValidElement(t)) n = l.cloneElement(t, r);
          else if ("function" == typeof t) n = t(r);
          else {
            var n,
              i,
              { x1: a, y1: o, x2: s, y2: c, key: u } = r,
              d = null !== (i = pE(m$(r, mC))) && void 0 !== i ? i : {},
              { offset: f } = d,
              h = m$(d, mT);
            n = l.createElement(
              "line",
              mR({}, h, { x1: a, y1: o, x2: s, y2: c, fill: "none", key: u }),
            );
          }
          return n;
        }
        function mB(e) {
          var { x: t, width: r, horizontal: n = !0, horizontalPoints: i } = e;
          if (!n || !i || !i.length) return null;
          var { xAxisId: a, yAxisId: o } = e,
            s = m$(e, mD),
            c = i.map((e, i) => {
              var a = mL(
                mL({}, s),
                {},
                {
                  x1: t,
                  y1: e,
                  x2: t + r,
                  y2: e,
                  key: "line-".concat(i),
                  index: i,
                },
              );
              return l.createElement(mF, {
                key: "line-".concat(i),
                option: n,
                lineItemProps: a,
              });
            });
          return l.createElement(
            "g",
            { className: "recharts-cartesian-grid-horizontal" },
            c,
          );
        }
        function mK(e) {
          var { y: t, height: r, vertical: n = !0, verticalPoints: i } = e;
          if (!n || !i || !i.length) return null;
          var { xAxisId: a, yAxisId: o } = e,
            s = m$(e, mI),
            c = i.map((e, i) => {
              var a = mL(
                mL({}, s),
                {},
                {
                  x1: e,
                  y1: t,
                  x2: e,
                  y2: t + r,
                  key: "line-".concat(i),
                  index: i,
                },
              );
              return l.createElement(mF, {
                option: n,
                lineItemProps: a,
                key: "line-".concat(i),
              });
            });
          return l.createElement(
            "g",
            { className: "recharts-cartesian-grid-vertical" },
            c,
          );
        }
        function mW(e) {
          var {
            horizontalFill: t,
            fillOpacity: r,
            x: n,
            y: i,
            width: a,
            height: o,
            horizontalPoints: s,
            horizontal: c = !0,
          } = e;
          if (!c || !t || !t.length || null == s) return null;
          var u = s.map((e) => Math.round(e + i - i)).sort((e, t) => e - t);
          i !== u[0] && u.unshift(0);
          var d = u.map((e, s) => {
            var c = u[s + 1] ? u[s + 1] - e : i + o - e;
            if (c <= 0) return null;
            var d = s % t.length;
            return l.createElement("rect", {
              key: "react-".concat(s),
              y: e,
              x: n,
              height: c,
              width: a,
              stroke: "none",
              fill: t[d],
              fillOpacity: r,
              className: "recharts-cartesian-grid-bg",
            });
          });
          return l.createElement(
            "g",
            { className: "recharts-cartesian-gridstripes-horizontal" },
            d,
          );
        }
        function mH(e) {
          var {
            vertical: t = !0,
            verticalFill: r,
            fillOpacity: n,
            x: i,
            y: a,
            width: o,
            height: s,
            verticalPoints: c,
          } = e;
          if (!t || !r || !r.length) return null;
          var u = c.map((e) => Math.round(e + i - i)).sort((e, t) => e - t);
          i !== u[0] && u.unshift(0);
          var d = u.map((e, t) => {
            var c = u[t + 1] ? u[t + 1] - e : i + o - e;
            if (c <= 0) return null;
            var d = t % r.length;
            return l.createElement("rect", {
              key: "react-".concat(t),
              x: e,
              y: a,
              width: c,
              height: s,
              stroke: "none",
              fill: r[d],
              fillOpacity: n,
              className: "recharts-cartesian-grid-bg",
            });
          });
          return l.createElement(
            "g",
            { className: "recharts-cartesian-gridstripes-vertical" },
            d,
          );
        }
        var mq = (e, t) => {
            var { xAxis: r, width: n, height: i, offset: a } = e;
            return n1(
              yM(
                mL(
                  mL(mL({}, mk), r),
                  {},
                  {
                    ticks: n2(r, !0),
                    viewBox: { x: 0, y: 0, width: n, height: i },
                  },
                ),
              ),
              a.left,
              a.left + a.width,
              t,
            );
          },
          mV = (e, t) => {
            var { yAxis: r, width: n, height: i, offset: a } = e;
            return n1(
              yM(
                mL(
                  mL(mL({}, mk), r),
                  {},
                  {
                    ticks: n2(r, !0),
                    viewBox: { x: 0, y: 0, width: n, height: i },
                  },
                ),
              ),
              a.top,
              a.top + a.height,
              t,
            );
          },
          mZ = {
            horizontal: !0,
            vertical: !0,
            horizontalPoints: [],
            verticalPoints: [],
            stroke: "#ccc",
            fill: "none",
            verticalFill: [],
            horizontalFill: [],
            xAxisId: 0,
            yAxisId: 0,
            syncWithTicks: !1,
            zIndex: cE.grid,
          };
        function mY(e) {
          var t = iE(),
            r = i_(),
            n = iN(),
            i = mL(
              mL({}, yd(e, mZ)),
              {},
              {
                x: b(e.x) ? e.x : n.left,
                y: b(e.y) ? e.y : n.top,
                width: b(e.width) ? e.width : n.width,
                height: b(e.height) ? e.height : n.height,
              },
            ),
            {
              xAxisId: a,
              yAxisId: o,
              x: s,
              y: c,
              width: u,
              height: d,
              syncWithTicks: f,
              horizontalValues: h,
              verticalValues: p,
            } = i,
            y = iw(),
            m = nR((e) => dA(e, "xAxis", a, y)),
            v = nR((e) => dA(e, "yAxis", o, y));
          if (!$(u) || !$(d) || !b(s) || !b(c)) return null;
          var g = i.verticalCoordinatesGenerator || mq,
            x = i.horizontalCoordinatesGenerator || mV,
            { horizontalPoints: w, verticalPoints: j } = i;
          if ((!w || !w.length) && "function" == typeof x) {
            var O = h && h.length,
              P = x(
                {
                  yAxis: v
                    ? mL(mL({}, v), {}, { ticks: O ? h : v.ticks })
                    : void 0,
                  width: null != t ? t : u,
                  height: null != r ? r : d,
                  offset: n,
                },
                !!O || f,
              );
            (M(
              Array.isArray(P),
              "horizontalCoordinatesGenerator should return Array but instead it returned [".concat(
                typeof P,
                "]",
              ),
            ),
              Array.isArray(P) && (w = P));
          }
          if ((!j || !j.length) && "function" == typeof g) {
            var S = p && p.length,
              k = g(
                {
                  xAxis: m
                    ? mL(mL({}, m), {}, { ticks: S ? p : m.ticks })
                    : void 0,
                  width: null != t ? t : u,
                  height: null != r ? r : d,
                  offset: n,
                },
                !!S || f,
              );
            (M(
              Array.isArray(k),
              "verticalCoordinatesGenerator should return Array but instead it returned [".concat(
                typeof k,
                "]",
              ),
            ),
              Array.isArray(k) && (j = k));
          }
          return l.createElement(
            y4,
            { zIndex: i.zIndex },
            l.createElement(
              "g",
              { className: "recharts-cartesian-grid" },
              l.createElement(mU, {
                fill: i.fill,
                fillOpacity: i.fillOpacity,
                x: i.x,
                y: i.y,
                width: i.width,
                height: i.height,
                ry: i.ry,
              }),
              l.createElement(mW, mR({}, i, { horizontalPoints: w })),
              l.createElement(mH, mR({}, i, { verticalPoints: j })),
              l.createElement(
                mB,
                mR({}, i, {
                  offset: n,
                  horizontalPoints: w,
                  xAxis: m,
                  yAxis: v,
                }),
              ),
              l.createElement(
                mK,
                mR({}, i, { offset: n, verticalPoints: j, xAxis: m, yAxis: v }),
              ),
            ),
          );
        }
        mY.displayName = "CartesianGrid";
        var mG = ["domain", "range"],
          mX = ["domain", "range"];
        function mQ(e, t) {
          if (null == e) return {};
          var r,
            n,
            i = (function (e, t) {
              if (null == e) return {};
              var r = {};
              for (var n in e)
                if ({}.hasOwnProperty.call(e, n)) {
                  if (-1 !== t.indexOf(n)) continue;
                  r[n] = e[n];
                }
              return r;
            })(e, t);
          if (Object.getOwnPropertySymbols) {
            var a = Object.getOwnPropertySymbols(e);
            for (n = 0; n < a.length; n++)
              ((r = a[n]),
                -1 === t.indexOf(r) &&
                  {}.propertyIsEnumerable.call(e, r) &&
                  (i[r] = e[r]));
          }
          return i;
        }
        function mJ(e, t) {
          return (
            e === t ||
            (!!(Array.isArray(e) && 2 === e.length && Array.isArray(t)) &&
              2 === t.length &&
              e[0] === t[0] &&
              e[1] === t[1])
          );
        }
        function m0(e, t) {
          if (e === t) return !0;
          var { domain: r, range: n } = e,
            i = mQ(e, mG),
            { domain: a, range: o } = t,
            l = mQ(t, mX);
          return !!(mJ(r, a) && mJ(n, o)) && pb(i, l);
        }
        var m1 = ["dangerouslySetInnerHTML", "ticks"],
          m2 = ["id"];
        function m3() {
          return (m3 = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function m6(e, t) {
          if (null == e) return {};
          var r,
            n,
            i = (function (e, t) {
              if (null == e) return {};
              var r = {};
              for (var n in e)
                if ({}.hasOwnProperty.call(e, n)) {
                  if (-1 !== t.indexOf(n)) continue;
                  r[n] = e[n];
                }
              return r;
            })(e, t);
          if (Object.getOwnPropertySymbols) {
            var a = Object.getOwnPropertySymbols(e);
            for (n = 0; n < a.length; n++)
              ((r = a[n]),
                -1 === t.indexOf(r) &&
                  {}.propertyIsEnumerable.call(e, r) &&
                  (i[r] = e[r]));
          }
          return i;
        }
        function m5(e) {
          var t = nD(),
            r = (0, l.useRef)(null);
          return (
            (0, l.useLayoutEffect)(() => {
              (null === r.current
                ? t(hn(e))
                : r.current !== e && t(hi({ prev: r.current, next: e })),
                (r.current = e));
            }, [e, t]),
            (0, l.useLayoutEffect)(
              () => () => {
                r.current && (t(ha(r.current)), (r.current = null));
              },
              [t],
            ),
            null
          );
        }
        var m4 = (e) => {
            var { xAxisId: t, className: r } = e,
              n = nR(ib),
              i = iw(),
              a = "xAxis",
              o = nR((e) => du(e, a, t, i)),
              s = nR((e) => dM(e, a, t, i)),
              c = nR((e) => dg(e, t)),
              u = nR((e) => dO(e, t)),
              f = nR((e) => c6(e, t));
            if (null == c || null == u || null == f) return null;
            var { dangerouslySetInnerHTML: h, ticks: p } = e,
              y = m6(e, m1),
              { id: m } = f,
              v = m6(f, m2);
            return l.createElement(
              mM,
              m3({}, y, v, {
                scale: o,
                x: u.x,
                y: u.y,
                width: c.width,
                height: c.height,
                className: d("recharts-".concat(a, " ").concat(a), r),
                viewBox: n,
                ticks: s,
                axisType: a,
              }),
            );
          },
          m7 = {
            allowDataOverflow: c3.allowDataOverflow,
            allowDecimals: c3.allowDecimals,
            allowDuplicatedCategory: c3.allowDuplicatedCategory,
            angle: c3.angle,
            axisLine: mk.axisLine,
            height: c3.height,
            hide: !1,
            includeHidden: c3.includeHidden,
            interval: c3.interval,
            minTickGap: c3.minTickGap,
            mirror: c3.mirror,
            orientation: c3.orientation,
            padding: c3.padding,
            reversed: c3.reversed,
            scale: c3.scale,
            tick: c3.tick,
            tickCount: c3.tickCount,
            tickLine: mk.tickLine,
            tickSize: mk.tickSize,
            type: c3.type,
            xAxisId: 0,
          },
          m8 = l.memo((e) => {
            var t = yd(e, m7);
            return l.createElement(
              l.Fragment,
              null,
              l.createElement(m5, {
                allowDataOverflow: t.allowDataOverflow,
                allowDecimals: t.allowDecimals,
                allowDuplicatedCategory: t.allowDuplicatedCategory,
                angle: t.angle,
                dataKey: t.dataKey,
                domain: t.domain,
                height: t.height,
                hide: t.hide,
                id: t.xAxisId,
                includeHidden: t.includeHidden,
                interval: t.interval,
                minTickGap: t.minTickGap,
                mirror: t.mirror,
                name: t.name,
                orientation: t.orientation,
                padding: t.padding,
                reversed: t.reversed,
                scale: t.scale,
                tick: t.tick,
                tickCount: t.tickCount,
                tickFormatter: t.tickFormatter,
                ticks: t.ticks,
                type: t.type,
                unit: t.unit,
              }),
              l.createElement(m4, t),
            );
          }, m0);
        m8.displayName = "XAxis";
        var m9 = ["dangerouslySetInnerHTML", "ticks"],
          ve = ["id"];
        function vt() {
          return (vt = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function vr(e, t) {
          if (null == e) return {};
          var r,
            n,
            i = (function (e, t) {
              if (null == e) return {};
              var r = {};
              for (var n in e)
                if ({}.hasOwnProperty.call(e, n)) {
                  if (-1 !== t.indexOf(n)) continue;
                  r[n] = e[n];
                }
              return r;
            })(e, t);
          if (Object.getOwnPropertySymbols) {
            var a = Object.getOwnPropertySymbols(e);
            for (n = 0; n < a.length; n++)
              ((r = a[n]),
                -1 === t.indexOf(r) &&
                  {}.propertyIsEnumerable.call(e, r) &&
                  (i[r] = e[r]));
          }
          return i;
        }
        function vn(e) {
          var t = nD(),
            r = (0, l.useRef)(null);
          return (
            (0, l.useLayoutEffect)(() => {
              (null === r.current
                ? t(ho(e))
                : r.current !== e && t(hl({ prev: r.current, next: e })),
                (r.current = e));
            }, [e, t]),
            (0, l.useLayoutEffect)(
              () => () => {
                r.current && (t(hs(r.current)), (r.current = null));
              },
              [t],
            ),
            null
          );
        }
        var vi = (e) => {
            var { yAxisId: t, className: r, width: n, label: i } = e,
              a = (0, l.useRef)(null),
              o = (0, l.useRef)(null),
              s = nR(ib),
              c = iw(),
              u = nD(),
              f = "yAxis",
              h = nR((e) => du(e, f, t, c)),
              p = nR((e) => dS(e, t)),
              y = nR((e) => dP(e, t)),
              m = nR((e) => dM(e, f, t, c)),
              v = nR((e) => c7(e, t));
            if (
              ((0, l.useLayoutEffect)(() => {
                if (
                  !("auto" !== n || !p || ml(i) || (0, l.isValidElement)(i)) &&
                  null != v
                ) {
                  var e = a.current;
                  if (e) {
                    var r = e.getCalculatedWidth();
                    Math.round(p.width) !== Math.round(r) &&
                      u(hf({ id: t, width: r }));
                  }
                }
              }, [m, p, u, i, t, n, v]),
              null == p || null == y || null == v)
            )
              return null;
            var { dangerouslySetInnerHTML: g, ticks: b } = e,
              x = vr(e, m9),
              { id: w } = v,
              j = vr(v, ve);
            return l.createElement(
              mM,
              vt({}, x, j, {
                ref: a,
                labelRef: o,
                scale: h,
                x: y.x,
                y: y.y,
                tickTextProps: "auto" === n ? { width: void 0 } : { width: n },
                width: p.width,
                height: p.height,
                className: d("recharts-".concat(f, " ").concat(f), r),
                viewBox: s,
                ticks: m,
                axisType: f,
              }),
            );
          },
          va = {
            allowDataOverflow: c4.allowDataOverflow,
            allowDecimals: c4.allowDecimals,
            allowDuplicatedCategory: c4.allowDuplicatedCategory,
            angle: c4.angle,
            axisLine: mk.axisLine,
            hide: !1,
            includeHidden: c4.includeHidden,
            interval: c4.interval,
            minTickGap: c4.minTickGap,
            mirror: c4.mirror,
            orientation: c4.orientation,
            padding: c4.padding,
            reversed: c4.reversed,
            scale: c4.scale,
            tick: c4.tick,
            tickCount: c4.tickCount,
            tickLine: mk.tickLine,
            tickSize: mk.tickSize,
            type: c4.type,
            width: c4.width,
            yAxisId: 0,
          },
          vo = l.memo((e) => {
            var t = yd(e, va);
            return l.createElement(
              l.Fragment,
              null,
              l.createElement(vn, {
                interval: t.interval,
                id: t.yAxisId,
                scale: t.scale,
                type: t.type,
                domain: t.domain,
                allowDataOverflow: t.allowDataOverflow,
                dataKey: t.dataKey,
                allowDuplicatedCategory: t.allowDuplicatedCategory,
                allowDecimals: t.allowDecimals,
                tickCount: t.tickCount,
                padding: t.padding,
                includeHidden: t.includeHidden,
                reversed: t.reversed,
                ticks: t.ticks,
                width: t.width,
                orientation: t.orientation,
                mirror: t.mirror,
                hide: t.hide,
                unit: t.unit,
                name: t.name,
                angle: t.angle,
                minTickGap: t.minTickGap,
                tick: t.tick,
                tickFormatter: t.tickFormatter,
              }),
              l.createElement(vi, t),
            );
          }, m0);
        function vl() {
          return (vl = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function vs(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function vc(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? vs(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : vs(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function vu(e) {
          return Array.isArray(e) && x(e[0]) && x(e[1]) ? e.join(" ~ ") : e;
        }
        vo.displayName = "YAxis";
        var vd = (e) => {
            var {
                separator: t = " : ",
                contentStyle: r = {},
                itemStyle: n = {},
                labelStyle: i = {},
                payload: a,
                formatter: o,
                itemSorter: s,
                wrapperClassName: c,
                labelClassName: u,
                label: f,
                labelFormatter: h,
                accessibilityLayer: p = !1,
              } = e,
              y = vc(
                {
                  margin: 0,
                  padding: 10,
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  whiteSpace: "nowrap",
                },
                r,
              ),
              m = vc({ margin: 0 }, i),
              v = !N(f),
              g = v ? f : "",
              b = d("recharts-default-tooltip", c),
              w = d("recharts-tooltip-label", u);
            return (
              v && h && null != a && (g = h(f, a)),
              l.createElement(
                "div",
                vl(
                  { className: b, style: y },
                  p ? { role: "status", "aria-live": "assertive" } : {},
                ),
                l.createElement(
                  "p",
                  { className: w, style: m },
                  l.isValidElement(g) ? g : "".concat(g),
                ),
                (() => {
                  if (a && a.length) {
                    var e = (s ? nU()(a, s) : a).map((e, r) => {
                      if ("none" === e.type) return null;
                      var i = e.formatter || o || vu,
                        { value: s, name: c } = e,
                        u = s,
                        d = c;
                      if (i) {
                        var f = i(s, c, e, r, a);
                        if (Array.isArray(f)) [u, d] = f;
                        else {
                          if (null == f) return null;
                          u = f;
                        }
                      }
                      var h = vc(
                        {
                          display: "block",
                          paddingTop: 4,
                          paddingBottom: 4,
                          color: e.color || "#000",
                        },
                        n,
                      );
                      return l.createElement(
                        "li",
                        {
                          className: "recharts-tooltip-item",
                          key: "tooltip-item-".concat(r),
                          style: h,
                        },
                        x(d)
                          ? l.createElement(
                              "span",
                              { className: "recharts-tooltip-item-name" },
                              d,
                            )
                          : null,
                        x(d)
                          ? l.createElement(
                              "span",
                              { className: "recharts-tooltip-item-separator" },
                              t,
                            )
                          : null,
                        l.createElement(
                          "span",
                          { className: "recharts-tooltip-item-value" },
                          u,
                        ),
                        l.createElement(
                          "span",
                          { className: "recharts-tooltip-item-unit" },
                          e.unit || "",
                        ),
                      );
                    });
                    return l.createElement(
                      "ul",
                      {
                        className: "recharts-tooltip-item-list",
                        style: { padding: 0, margin: 0 },
                      },
                      e,
                    );
                  }
                  return null;
                })(),
              )
            );
          },
          vf = "recharts-tooltip-wrapper",
          vh = { visibility: "hidden" };
        function vp(e) {
          var {
            allowEscapeViewBox: t,
            coordinate: r,
            key: n,
            offsetTopLeft: i,
            position: a,
            reverseDirection: o,
            tooltipDimension: l,
            viewBox: s,
            viewBoxDimension: c,
          } = e;
          if (a && b(a[n])) return a[n];
          var u = r[n] - l - (i > 0 ? i : 0),
            d = r[n] + i;
          if (t[n]) return o[n] ? u : d;
          var f = s[n];
          return null == f
            ? 0
            : o[n]
              ? u < f
                ? Math.max(d, f)
                : Math.max(u, f)
              : null == c
                ? 0
                : d + l > f + c
                  ? Math.max(u, f)
                  : Math.max(d, f);
        }
        function vy(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function vm(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? vy(Object(r), !0).forEach(function (t) {
                  vv(e, t, r[t]);
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : vy(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function vv(e, t, r) {
          var n;
          return (
            (t =
              "symbol" ==
              typeof (n = (function (e, t) {
                if ("object" != typeof e || !e) return e;
                var r = e[Symbol.toPrimitive];
                if (void 0 !== r) {
                  var n = r.call(e, t || "default");
                  if ("object" != typeof n) return n;
                  throw TypeError(
                    "@@toPrimitive must return a primitive value.",
                  );
                }
                return ("string" === t ? String : Number)(e);
              })(t, "string"))
                ? n
                : n + "") in e
              ? Object.defineProperty(e, t, {
                  value: r,
                  enumerable: !0,
                  configurable: !0,
                  writable: !0,
                })
              : (e[t] = r),
            e
          );
        }
        class vg extends l.PureComponent {
          constructor() {
            (super(...arguments),
              vv(this, "state", {
                dismissed: !1,
                dismissedAtCoordinate: { x: 0, y: 0 },
              }),
              vv(this, "handleKeyDown", (e) => {
                if ("Escape" === e.key) {
                  var t, r, n, i;
                  this.setState({
                    dismissed: !0,
                    dismissedAtCoordinate: {
                      x:
                        null !==
                          (t =
                            null === (r = this.props.coordinate) || void 0 === r
                              ? void 0
                              : r.x) && void 0 !== t
                          ? t
                          : 0,
                      y:
                        null !==
                          (n =
                            null === (i = this.props.coordinate) || void 0 === i
                              ? void 0
                              : i.y) && void 0 !== n
                          ? n
                          : 0,
                    },
                  });
                }
              }));
          }
          componentDidMount() {
            document.addEventListener("keydown", this.handleKeyDown);
          }
          componentWillUnmount() {
            document.removeEventListener("keydown", this.handleKeyDown);
          }
          componentDidUpdate() {
            var e, t;
            this.state.dismissed &&
              ((null === (e = this.props.coordinate) || void 0 === e
                ? void 0
                : e.x) !== this.state.dismissedAtCoordinate.x ||
                (null === (t = this.props.coordinate) || void 0 === t
                  ? void 0
                  : t.y) !== this.state.dismissedAtCoordinate.y) &&
              (this.state.dismissed = !1);
          }
          render() {
            var {
                active: e,
                allowEscapeViewBox: t,
                animationDuration: r,
                animationEasing: n,
                children: i,
                coordinate: a,
                hasPayload: o,
                isAnimationActive: s,
                offset: c,
                position: u,
                reverseDirection: f,
                useTranslate3d: h,
                viewBox: p,
                wrapperStyle: y,
                lastBoundingBox: m,
                innerRef: v,
                hasPortalFromProps: g,
              } = this.props,
              { cssClasses: x, cssProperties: w } = (function (e) {
                var t,
                  r,
                  n,
                  {
                    allowEscapeViewBox: i,
                    coordinate: a,
                    offsetTopLeft: o,
                    position: l,
                    reverseDirection: s,
                    tooltipBox: c,
                    useTranslate3d: u,
                    viewBox: f,
                  } = e;
                return {
                  cssProperties:
                    c.height > 0 && c.width > 0 && a
                      ? (function (e) {
                          var {
                            translateX: t,
                            translateY: r,
                            useTranslate3d: n,
                          } = e;
                          return {
                            transform: n
                              ? "translate3d("
                                  .concat(t, "px, ")
                                  .concat(r, "px, 0)")
                              : "translate(".concat(t, "px, ").concat(r, "px)"),
                          };
                        })({
                          translateX: (r = vp({
                            allowEscapeViewBox: i,
                            coordinate: a,
                            key: "x",
                            offsetTopLeft: o,
                            position: l,
                            reverseDirection: s,
                            tooltipDimension: c.width,
                            viewBox: f,
                            viewBoxDimension: f.width,
                          })),
                          translateY: (n = vp({
                            allowEscapeViewBox: i,
                            coordinate: a,
                            key: "y",
                            offsetTopLeft: o,
                            position: l,
                            reverseDirection: s,
                            tooltipDimension: c.height,
                            viewBox: f,
                            viewBoxDimension: f.height,
                          })),
                          useTranslate3d: u,
                        })
                      : vh,
                  cssClasses: (function (e) {
                    var { coordinate: t, translateX: r, translateY: n } = e;
                    return d(vf, {
                      ["".concat(vf, "-right")]:
                        b(r) && t && b(t.x) && r >= t.x,
                      ["".concat(vf, "-left")]: b(r) && t && b(t.x) && r < t.x,
                      ["".concat(vf, "-bottom")]:
                        b(n) && t && b(t.y) && n >= t.y,
                      ["".concat(vf, "-top")]: b(n) && t && b(t.y) && n < t.y,
                    });
                  })({ translateX: r, translateY: n, coordinate: a }),
                };
              })({
                allowEscapeViewBox: t,
                coordinate: a,
                offsetTopLeft: c,
                position: u,
                reverseDirection: f,
                tooltipBox: { height: m.height, width: m.width },
                useTranslate3d: h,
                viewBox: p,
              }),
              j = g
                ? {}
                : vm(
                    vm(
                      {
                        transition:
                          s && e
                            ? "transform ".concat(r, "ms ").concat(n)
                            : void 0,
                      },
                      w,
                    ),
                    {},
                    {
                      pointerEvents: "none",
                      visibility:
                        !this.state.dismissed && e && o ? "visible" : "hidden",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    },
                  ),
              O = vm(
                vm({}, j),
                {},
                {
                  visibility:
                    !this.state.dismissed && e && o ? "visible" : "hidden",
                },
                y,
              );
            return l.createElement(
              "div",
              {
                xmlns: "http://www.w3.org/1999/xhtml",
                tabIndex: -1,
                className: x,
                style: O,
                ref: v,
              },
              i,
            );
          }
        }
        var vb = r(33278),
          vx = r.n(vb);
        function vw(e, t, r) {
          return !0 === t
            ? vx()(e, r)
            : "function" == typeof t
              ? vx()(e, t)
              : e;
        }
        function vj() {
          var e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : [],
            [t, r] = (0, l.useState)({ height: 0, left: 0, top: 0, width: 0 }),
            n = (0, l.useCallback)(
              (e) => {
                if (null != e) {
                  var n = e.getBoundingClientRect(),
                    i = {
                      height: n.height,
                      left: n.left,
                      top: n.top,
                      width: n.width,
                    };
                  (Math.abs(i.height - t.height) > 1 ||
                    Math.abs(i.left - t.left) > 1 ||
                    Math.abs(i.top - t.top) > 1 ||
                    Math.abs(i.width - t.width) > 1) &&
                    r({
                      height: i.height,
                      left: i.left,
                      top: i.top,
                      width: i.width,
                    });
                }
              },
              [t.width, t.height, t.top, t.left, ...e],
            );
          return [t, n];
        }
        function vO() {}
        function vP(e, t, r) {
          e._context.bezierCurveTo(
            (2 * e._x0 + e._x1) / 3,
            (2 * e._y0 + e._y1) / 3,
            (e._x0 + 2 * e._x1) / 3,
            (e._y0 + 2 * e._y1) / 3,
            (e._x0 + 4 * e._x1 + t) / 6,
            (e._y0 + 4 * e._y1 + r) / 6,
          );
        }
        function vS(e) {
          this._context = e;
        }
        function vk(e) {
          this._context = e;
        }
        function vN(e) {
          this._context = e;
        }
        ((vS.prototype = {
          areaStart: function () {
            this._line = 0;
          },
          areaEnd: function () {
            this._line = NaN;
          },
          lineStart: function () {
            ((this._x0 = this._x1 = this._y0 = this._y1 = NaN),
              (this._point = 0));
          },
          lineEnd: function () {
            switch (this._point) {
              case 3:
                vP(this, this._x1, this._y1);
              case 2:
                this._context.lineTo(this._x1, this._y1);
            }
            ((this._line || (0 !== this._line && 1 === this._point)) &&
              this._context.closePath(),
              (this._line = 1 - this._line));
          },
          point: function (e, t) {
            switch (((e = +e), (t = +t), this._point)) {
              case 0:
                ((this._point = 1),
                  this._line
                    ? this._context.lineTo(e, t)
                    : this._context.moveTo(e, t));
                break;
              case 1:
                this._point = 2;
                break;
              case 2:
                ((this._point = 3),
                  this._context.lineTo(
                    (5 * this._x0 + this._x1) / 6,
                    (5 * this._y0 + this._y1) / 6,
                  ));
              default:
                vP(this, e, t);
            }
            ((this._x0 = this._x1),
              (this._x1 = e),
              (this._y0 = this._y1),
              (this._y1 = t));
          },
        }),
          (vk.prototype = {
            areaStart: vO,
            areaEnd: vO,
            lineStart: function () {
              ((this._x0 =
                this._x1 =
                this._x2 =
                this._x3 =
                this._x4 =
                this._y0 =
                this._y1 =
                this._y2 =
                this._y3 =
                this._y4 =
                  NaN),
                (this._point = 0));
            },
            lineEnd: function () {
              switch (this._point) {
                case 1:
                  (this._context.moveTo(this._x2, this._y2),
                    this._context.closePath());
                  break;
                case 2:
                  (this._context.moveTo(
                    (this._x2 + 2 * this._x3) / 3,
                    (this._y2 + 2 * this._y3) / 3,
                  ),
                    this._context.lineTo(
                      (this._x3 + 2 * this._x2) / 3,
                      (this._y3 + 2 * this._y2) / 3,
                    ),
                    this._context.closePath());
                  break;
                case 3:
                  (this.point(this._x2, this._y2),
                    this.point(this._x3, this._y3),
                    this.point(this._x4, this._y4));
              }
            },
            point: function (e, t) {
              switch (((e = +e), (t = +t), this._point)) {
                case 0:
                  ((this._point = 1), (this._x2 = e), (this._y2 = t));
                  break;
                case 1:
                  ((this._point = 2), (this._x3 = e), (this._y3 = t));
                  break;
                case 2:
                  ((this._point = 3),
                    (this._x4 = e),
                    (this._y4 = t),
                    this._context.moveTo(
                      (this._x0 + 4 * this._x1 + e) / 6,
                      (this._y0 + 4 * this._y1 + t) / 6,
                    ));
                  break;
                default:
                  vP(this, e, t);
              }
              ((this._x0 = this._x1),
                (this._x1 = e),
                (this._y0 = this._y1),
                (this._y1 = t));
            },
          }),
          (vN.prototype = {
            areaStart: function () {
              this._line = 0;
            },
            areaEnd: function () {
              this._line = NaN;
            },
            lineStart: function () {
              ((this._x0 = this._x1 = this._y0 = this._y1 = NaN),
                (this._point = 0));
            },
            lineEnd: function () {
              ((this._line || (0 !== this._line && 3 === this._point)) &&
                this._context.closePath(),
                (this._line = 1 - this._line));
            },
            point: function (e, t) {
              switch (((e = +e), (t = +t), this._point)) {
                case 0:
                  this._point = 1;
                  break;
                case 1:
                  this._point = 2;
                  break;
                case 2:
                  this._point = 3;
                  var r = (this._x0 + 4 * this._x1 + e) / 6,
                    n = (this._y0 + 4 * this._y1 + t) / 6;
                  this._line
                    ? this._context.lineTo(r, n)
                    : this._context.moveTo(r, n);
                  break;
                case 3:
                  this._point = 4;
                default:
                  vP(this, e, t);
              }
              ((this._x0 = this._x1),
                (this._x1 = e),
                (this._y0 = this._y1),
                (this._y1 = t));
            },
          }));
        class vE {
          constructor(e, t) {
            ((this._context = e), (this._x = t));
          }
          areaStart() {
            this._line = 0;
          }
          areaEnd() {
            this._line = NaN;
          }
          lineStart() {
            this._point = 0;
          }
          lineEnd() {
            ((this._line || (0 !== this._line && 1 === this._point)) &&
              this._context.closePath(),
              (this._line = 1 - this._line));
          }
          point(e, t) {
            switch (((e = +e), (t = +t), this._point)) {
              case 0:
                ((this._point = 1),
                  this._line
                    ? this._context.lineTo(e, t)
                    : this._context.moveTo(e, t));
                break;
              case 1:
                this._point = 2;
              default:
                this._x
                  ? this._context.bezierCurveTo(
                      (this._x0 = (this._x0 + e) / 2),
                      this._y0,
                      this._x0,
                      t,
                      e,
                      t,
                    )
                  : this._context.bezierCurveTo(
                      this._x0,
                      (this._y0 = (this._y0 + t) / 2),
                      e,
                      this._y0,
                      e,
                      t,
                    );
            }
            ((this._x0 = e), (this._y0 = t));
          }
        }
        function v_(e) {
          this._context = e;
        }
        function vA(e) {
          this._context = e;
        }
        function vM(e) {
          return new vA(e);
        }
        function vC(e, t, r) {
          var n = e._x1 - e._x0,
            i = t - e._x1,
            a = (e._y1 - e._y0) / (n || (i < 0 && -0)),
            o = (r - e._y1) / (i || (n < 0 && -0));
          return (
            ((a < 0 ? -1 : 1) + (o < 0 ? -1 : 1)) *
              Math.min(
                Math.abs(a),
                Math.abs(o),
                0.5 * Math.abs((a * i + o * n) / (n + i)),
              ) || 0
          );
        }
        function vT(e, t) {
          var r = e._x1 - e._x0;
          return r ? ((3 * (e._y1 - e._y0)) / r - t) / 2 : t;
        }
        function vD(e, t, r) {
          var n = e._x0,
            i = e._y0,
            a = e._x1,
            o = e._y1,
            l = (a - n) / 3;
          e._context.bezierCurveTo(n + l, i + l * t, a - l, o - l * r, a, o);
        }
        function vI(e) {
          this._context = e;
        }
        function vz(e) {
          this._context = new vL(e);
        }
        function vL(e) {
          this._context = e;
        }
        function vR(e) {
          this._context = e;
        }
        function v$(e) {
          var t,
            r,
            n = e.length - 1,
            i = Array(n),
            a = Array(n),
            o = Array(n);
          for (
            i[0] = 0, a[0] = 2, o[0] = e[0] + 2 * e[1], t = 1;
            t < n - 1;
            ++t
          )
            ((i[t] = 1), (a[t] = 4), (o[t] = 4 * e[t] + 2 * e[t + 1]));
          for (
            i[n - 1] = 2, a[n - 1] = 7, o[n - 1] = 8 * e[n - 1] + e[n], t = 1;
            t < n;
            ++t
          )
            ((r = i[t] / a[t - 1]), (a[t] -= r), (o[t] -= r * o[t - 1]));
          for (i[n - 1] = o[n - 1] / a[n - 1], t = n - 2; t >= 0; --t)
            i[t] = (o[t] - i[t + 1]) / a[t];
          for (t = 0, a[n - 1] = (e[n] + i[n - 1]) / 2; t < n - 1; ++t)
            a[t] = 2 * e[t + 1] - i[t + 1];
          return [i, a];
        }
        function vU(e, t) {
          ((this._context = e), (this._t = t));
        }
        ((v_.prototype = {
          areaStart: vO,
          areaEnd: vO,
          lineStart: function () {
            this._point = 0;
          },
          lineEnd: function () {
            this._point && this._context.closePath();
          },
          point: function (e, t) {
            ((e = +e),
              (t = +t),
              this._point
                ? this._context.lineTo(e, t)
                : ((this._point = 1), this._context.moveTo(e, t)));
          },
        }),
          (vA.prototype = {
            areaStart: function () {
              this._line = 0;
            },
            areaEnd: function () {
              this._line = NaN;
            },
            lineStart: function () {
              this._point = 0;
            },
            lineEnd: function () {
              ((this._line || (0 !== this._line && 1 === this._point)) &&
                this._context.closePath(),
                (this._line = 1 - this._line));
            },
            point: function (e, t) {
              switch (((e = +e), (t = +t), this._point)) {
                case 0:
                  ((this._point = 1),
                    this._line
                      ? this._context.lineTo(e, t)
                      : this._context.moveTo(e, t));
                  break;
                case 1:
                  this._point = 2;
                default:
                  this._context.lineTo(e, t);
              }
            },
          }),
          (vI.prototype = {
            areaStart: function () {
              this._line = 0;
            },
            areaEnd: function () {
              this._line = NaN;
            },
            lineStart: function () {
              ((this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN),
                (this._point = 0));
            },
            lineEnd: function () {
              switch (this._point) {
                case 2:
                  this._context.lineTo(this._x1, this._y1);
                  break;
                case 3:
                  vD(this, this._t0, vT(this, this._t0));
              }
              ((this._line || (0 !== this._line && 1 === this._point)) &&
                this._context.closePath(),
                (this._line = 1 - this._line));
            },
            point: function (e, t) {
              var r = NaN;
              if (((t = +t), (e = +e) !== this._x1 || t !== this._y1)) {
                switch (this._point) {
                  case 0:
                    ((this._point = 1),
                      this._line
                        ? this._context.lineTo(e, t)
                        : this._context.moveTo(e, t));
                    break;
                  case 1:
                    this._point = 2;
                    break;
                  case 2:
                    ((this._point = 3),
                      vD(this, vT(this, (r = vC(this, e, t))), r));
                    break;
                  default:
                    vD(this, this._t0, (r = vC(this, e, t)));
                }
                ((this._x0 = this._x1),
                  (this._x1 = e),
                  (this._y0 = this._y1),
                  (this._y1 = t),
                  (this._t0 = r));
              }
            },
          }),
          ((vz.prototype = Object.create(vI.prototype)).point = function (
            e,
            t,
          ) {
            vI.prototype.point.call(this, t, e);
          }),
          (vL.prototype = {
            moveTo: function (e, t) {
              this._context.moveTo(t, e);
            },
            closePath: function () {
              this._context.closePath();
            },
            lineTo: function (e, t) {
              this._context.lineTo(t, e);
            },
            bezierCurveTo: function (e, t, r, n, i, a) {
              this._context.bezierCurveTo(t, e, n, r, a, i);
            },
          }),
          (vR.prototype = {
            areaStart: function () {
              this._line = 0;
            },
            areaEnd: function () {
              this._line = NaN;
            },
            lineStart: function () {
              ((this._x = []), (this._y = []));
            },
            lineEnd: function () {
              var e = this._x,
                t = this._y,
                r = e.length;
              if (r) {
                if (
                  (this._line
                    ? this._context.lineTo(e[0], t[0])
                    : this._context.moveTo(e[0], t[0]),
                  2 === r)
                )
                  this._context.lineTo(e[1], t[1]);
                else
                  for (var n = v$(e), i = v$(t), a = 0, o = 1; o < r; ++a, ++o)
                    this._context.bezierCurveTo(
                      n[0][a],
                      i[0][a],
                      n[1][a],
                      i[1][a],
                      e[o],
                      t[o],
                    );
              }
              ((this._line || (0 !== this._line && 1 === r)) &&
                this._context.closePath(),
                (this._line = 1 - this._line),
                (this._x = this._y = null));
            },
            point: function (e, t) {
              (this._x.push(+e), this._y.push(+t));
            },
          }),
          (vU.prototype = {
            areaStart: function () {
              this._line = 0;
            },
            areaEnd: function () {
              this._line = NaN;
            },
            lineStart: function () {
              ((this._x = this._y = NaN), (this._point = 0));
            },
            lineEnd: function () {
              (0 < this._t &&
                this._t < 1 &&
                2 === this._point &&
                this._context.lineTo(this._x, this._y),
                (this._line || (0 !== this._line && 1 === this._point)) &&
                  this._context.closePath(),
                this._line >= 0 &&
                  ((this._t = 1 - this._t), (this._line = 1 - this._line)));
            },
            point: function (e, t) {
              switch (((e = +e), (t = +t), this._point)) {
                case 0:
                  ((this._point = 1),
                    this._line
                      ? this._context.lineTo(e, t)
                      : this._context.moveTo(e, t));
                  break;
                case 1:
                  this._point = 2;
                default:
                  if (this._t <= 0)
                    (this._context.lineTo(this._x, t),
                      this._context.lineTo(e, t));
                  else {
                    var r = this._x * (1 - this._t) + e * this._t;
                    (this._context.lineTo(r, this._y),
                      this._context.lineTo(r, t));
                  }
              }
              ((this._x = e), (this._y = t));
            },
          }));
        let vF = Math.PI,
          vB = 2 * vF,
          vK = vB - 1e-6;
        function vW(e) {
          this._ += e[0];
          for (let t = 1, r = e.length; t < r; ++t)
            this._ += arguments[t] + e[t];
        }
        class vH {
          constructor(e) {
            ((this._x0 = this._y0 = this._x1 = this._y1 = null),
              (this._ = ""),
              (this._append =
                null == e
                  ? vW
                  : (function (e) {
                      let t = Math.floor(e);
                      if (!(t >= 0)) throw Error(`invalid digits: ${e}`);
                      if (t > 15) return vW;
                      let r = 10 ** t;
                      return function (e) {
                        this._ += e[0];
                        for (let t = 1, n = e.length; t < n; ++t)
                          this._ += Math.round(arguments[t] * r) / r + e[t];
                      };
                    })(e)));
          }
          moveTo(e, t) {
            this
              ._append`M${(this._x0 = this._x1 = +e)},${(this._y0 = this._y1 = +t)}`;
          }
          closePath() {
            null !== this._x1 &&
              ((this._x1 = this._x0), (this._y1 = this._y0), this._append`Z`);
          }
          lineTo(e, t) {
            this._append`L${(this._x1 = +e)},${(this._y1 = +t)}`;
          }
          quadraticCurveTo(e, t, r, n) {
            this._append`Q${+e},${+t},${(this._x1 = +r)},${(this._y1 = +n)}`;
          }
          bezierCurveTo(e, t, r, n, i, a) {
            this
              ._append`C${+e},${+t},${+r},${+n},${(this._x1 = +i)},${(this._y1 = +a)}`;
          }
          arcTo(e, t, r, n, i) {
            if (((e = +e), (t = +t), (r = +r), (n = +n), (i = +i) < 0))
              throw Error(`negative radius: ${i}`);
            let a = this._x1,
              o = this._y1,
              l = r - e,
              s = n - t,
              c = a - e,
              u = o - t,
              d = c * c + u * u;
            if (null === this._x1)
              this._append`M${(this._x1 = e)},${(this._y1 = t)}`;
            else if (d > 1e-6) {
              if (Math.abs(u * l - s * c) > 1e-6 && i) {
                let f = r - a,
                  h = n - o,
                  p = l * l + s * s,
                  y = Math.sqrt(p),
                  m = Math.sqrt(d),
                  v =
                    i *
                    Math.tan(
                      (vF -
                        Math.acos((p + d - (f * f + h * h)) / (2 * y * m))) /
                        2,
                    ),
                  g = v / m,
                  b = v / y;
                (Math.abs(g - 1) > 1e-6 &&
                  this._append`L${e + g * c},${t + g * u}`,
                  this
                    ._append`A${i},${i},0,0,${+(u * f > c * h)},${(this._x1 = e + b * l)},${(this._y1 = t + b * s)}`);
              } else this._append`L${(this._x1 = e)},${(this._y1 = t)}`;
            }
          }
          arc(e, t, r, n, i, a) {
            if (((e = +e), (t = +t), (a = !!a), (r = +r) < 0))
              throw Error(`negative radius: ${r}`);
            let o = r * Math.cos(n),
              l = r * Math.sin(n),
              s = e + o,
              c = t + l,
              u = 1 ^ a,
              d = a ? n - i : i - n;
            (null === this._x1
              ? this._append`M${s},${c}`
              : (Math.abs(this._x1 - s) > 1e-6 ||
                  Math.abs(this._y1 - c) > 1e-6) &&
                this._append`L${s},${c}`,
              r &&
                (d < 0 && (d = (d % vB) + vB),
                d > vK
                  ? this
                      ._append`A${r},${r},0,1,${u},${e - o},${t - l}A${r},${r},0,1,${u},${(this._x1 = s)},${(this._y1 = c)}`
                  : d > 1e-6 &&
                    this
                      ._append`A${r},${r},0,${+(d >= vF)},${u},${(this._x1 = e + r * Math.cos(i))},${(this._y1 = t + r * Math.sin(i))}`));
          }
          rect(e, t, r, n) {
            this
              ._append`M${(this._x0 = this._x1 = +e)},${(this._y0 = this._y1 = +t)}h${(r = +r)}v${+n}h${-r}Z`;
          }
          toString() {
            return this._;
          }
        }
        function vq(e) {
          let t = 3;
          return (
            (e.digits = function (r) {
              if (!arguments.length) return t;
              if (null == r) t = null;
              else {
                let e = Math.floor(r);
                if (!(e >= 0)) throw RangeError(`invalid digits: ${r}`);
                t = e;
              }
              return e;
            }),
            () => new vH(t)
          );
        }
        function vV(e) {
          return e[0];
        }
        function vZ(e) {
          return e[1];
        }
        function vY(e, t) {
          var r = nH(!0),
            n = null,
            i = vM,
            a = null,
            o = vq(l);
          function l(l) {
            var s,
              c,
              u,
              d = (l = nW(l)).length,
              f = !1;
            for (null == n && (a = i((u = o()))), s = 0; s <= d; ++s)
              (!(s < d && r((c = l[s]), s, l)) === f &&
                ((f = !f) ? a.lineStart() : a.lineEnd()),
                f && a.point(+e(c, s, l), +t(c, s, l)));
            if (u) return ((a = null), u + "" || null);
          }
          return (
            (e = "function" == typeof e ? e : void 0 === e ? vV : nH(e)),
            (t = "function" == typeof t ? t : void 0 === t ? vZ : nH(t)),
            (l.x = function (t) {
              return arguments.length
                ? ((e = "function" == typeof t ? t : nH(+t)), l)
                : e;
            }),
            (l.y = function (e) {
              return arguments.length
                ? ((t = "function" == typeof e ? e : nH(+e)), l)
                : t;
            }),
            (l.defined = function (e) {
              return arguments.length
                ? ((r = "function" == typeof e ? e : nH(!!e)), l)
                : r;
            }),
            (l.curve = function (e) {
              return arguments.length
                ? ((i = e), null != n && (a = i(n)), l)
                : i;
            }),
            (l.context = function (e) {
              return arguments.length
                ? (null == e ? (n = a = null) : (a = i((n = e))), l)
                : n;
            }),
            l
          );
        }
        function vG(e, t, r) {
          var n = null,
            i = nH(!0),
            a = null,
            o = vM,
            l = null,
            s = vq(c);
          function c(c) {
            var u,
              d,
              f,
              h,
              p,
              y = (c = nW(c)).length,
              m = !1,
              v = Array(y),
              g = Array(y);
            for (null == a && (l = o((p = s()))), u = 0; u <= y; ++u) {
              if (!(u < y && i((h = c[u]), u, c)) === m) {
                if ((m = !m)) ((d = u), l.areaStart(), l.lineStart());
                else {
                  for (l.lineEnd(), l.lineStart(), f = u - 1; f >= d; --f)
                    l.point(v[f], g[f]);
                  (l.lineEnd(), l.areaEnd());
                }
              }
              m &&
                ((v[u] = +e(h, u, c)),
                (g[u] = +t(h, u, c)),
                l.point(n ? +n(h, u, c) : v[u], r ? +r(h, u, c) : g[u]));
            }
            if (p) return ((l = null), p + "" || null);
          }
          function u() {
            return vY().defined(i).curve(o).context(a);
          }
          return (
            (e = "function" == typeof e ? e : void 0 === e ? vV : nH(+e)),
            (t = "function" == typeof t ? t : void 0 === t ? nH(0) : nH(+t)),
            (r = "function" == typeof r ? r : void 0 === r ? vZ : nH(+r)),
            (c.x = function (t) {
              return arguments.length
                ? ((e = "function" == typeof t ? t : nH(+t)), (n = null), c)
                : e;
            }),
            (c.x0 = function (t) {
              return arguments.length
                ? ((e = "function" == typeof t ? t : nH(+t)), c)
                : e;
            }),
            (c.x1 = function (e) {
              return arguments.length
                ? ((n = null == e ? null : "function" == typeof e ? e : nH(+e)),
                  c)
                : n;
            }),
            (c.y = function (e) {
              return arguments.length
                ? ((t = "function" == typeof e ? e : nH(+e)), (r = null), c)
                : t;
            }),
            (c.y0 = function (e) {
              return arguments.length
                ? ((t = "function" == typeof e ? e : nH(+e)), c)
                : t;
            }),
            (c.y1 = function (e) {
              return arguments.length
                ? ((r = null == e ? null : "function" == typeof e ? e : nH(+e)),
                  c)
                : r;
            }),
            (c.lineX0 = c.lineY0 =
              function () {
                return u().x(e).y(t);
              }),
            (c.lineY1 = function () {
              return u().x(e).y(r);
            }),
            (c.lineX1 = function () {
              return u().x(n).y(t);
            }),
            (c.defined = function (e) {
              return arguments.length
                ? ((i = "function" == typeof e ? e : nH(!!e)), c)
                : i;
            }),
            (c.curve = function (e) {
              return arguments.length
                ? ((o = e), null != a && (l = o(a)), c)
                : o;
            }),
            (c.context = function (e) {
              return arguments.length
                ? (null == e ? (a = l = null) : (l = o((a = e))), c)
                : a;
            }),
            c
          );
        }
        function vX() {
          return (vX = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function vQ(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function vJ(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? vQ(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : vQ(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        vH.prototype;
        var v0 = {
            curveBasisClosed: function (e) {
              return new vk(e);
            },
            curveBasisOpen: function (e) {
              return new vN(e);
            },
            curveBasis: function (e) {
              return new vS(e);
            },
            curveBumpX: function (e) {
              return new vE(e, !0);
            },
            curveBumpY: function (e) {
              return new vE(e, !1);
            },
            curveLinearClosed: function (e) {
              return new v_(e);
            },
            curveLinear: vM,
            curveMonotoneX: function (e) {
              return new vI(e);
            },
            curveMonotoneY: function (e) {
              return new vz(e);
            },
            curveNatural: function (e) {
              return new vR(e);
            },
            curveStep: function (e) {
              return new vU(e, 0.5);
            },
            curveStepAfter: function (e) {
              return new vU(e, 1);
            },
            curveStepBefore: function (e) {
              return new vU(e, 0);
            },
          },
          v1 = (e) => R(e.x) && R(e.y),
          v2 = (e) => null != e.base && v1(e.base) && v1(e),
          v3 = (e) => e.x,
          v6 = (e) => e.y,
          v5 = (e, t) => {
            if ("function" == typeof e) return e;
            var r = "curve".concat(E(e));
            return ("curveMonotone" === r || "curveBump" === r) && t
              ? v0["".concat(r).concat("vertical" === t ? "Y" : "X")]
              : v0[r] || vM;
          },
          v4 = (e) => {
            var {
                type: t = "linear",
                points: r = [],
                baseLine: n,
                layout: i,
                connectNulls: a = !1,
              } = e,
              o = v5(t, i),
              l = a ? r.filter(v1) : r;
            if (Array.isArray(n)) {
              var s = r.map((e, t) => vJ(vJ({}, e), {}, { base: n[t] }));
              return (
                "vertical" === i
                  ? vG()
                      .y(v6)
                      .x1(v3)
                      .x0((e) => e.base.x)
                  : vG()
                      .x(v3)
                      .y1(v6)
                      .y0((e) => e.base.y)
              )
                .defined(v2)
                .curve(o)(a ? s.filter(v2) : s);
            }
            return (
              "vertical" === i && b(n)
                ? vG().y(v6).x1(v3).x0(n)
                : b(n)
                  ? vG().x(v3).y1(v6).y0(n)
                  : vY().x(v3).y(v6)
            )
              .defined(v1)
              .curve(o)(l);
          },
          v7 = (e) => {
            var { className: t, points: r, path: n, pathRef: i } = e;
            if ((!r || !r.length) && !n) return null;
            var a = r && r.length ? v4(e) : n;
            return l.createElement(
              "path",
              vX({}, pE(e), mg(e), {
                className: d("recharts-curve", t),
                d: null === a ? void 0 : a,
                ref: i,
              }),
            );
          },
          v8 = ["x", "y", "top", "left", "width", "height", "className"];
        function v9() {
          return (v9 = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function ge(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        var gt = (e, t, r, n, i, a) =>
            "M"
              .concat(e, ",")
              .concat(i, "v")
              .concat(n, "M")
              .concat(a, ",")
              .concat(t, "h")
              .concat(r),
          gr = (e) => {
            var {
                x: t = 0,
                y: r = 0,
                top: n = 0,
                left: i = 0,
                width: a = 0,
                height: o = 0,
                className: s,
              } = e,
              c = (function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = null != arguments[t] ? arguments[t] : {};
                  t % 2
                    ? ge(Object(r), !0).forEach(function (t) {
                        var n, i;
                        ((n = t),
                          (i = r[t]),
                          (n = (function (e) {
                            var t = (function (e, t) {
                              if ("object" != typeof e || !e) return e;
                              var r = e[Symbol.toPrimitive];
                              if (void 0 !== r) {
                                var n = r.call(e, t || "default");
                                if ("object" != typeof n) return n;
                                throw TypeError(
                                  "@@toPrimitive must return a primitive value.",
                                );
                              }
                              return ("string" === t ? String : Number)(e);
                            })(e, "string");
                            return "symbol" == typeof t ? t : t + "";
                          })(n)) in e
                            ? Object.defineProperty(e, n, {
                                value: i,
                                enumerable: !0,
                                configurable: !0,
                                writable: !0,
                              })
                            : (e[n] = i));
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(
                          e,
                          Object.getOwnPropertyDescriptors(r),
                        )
                      : ge(Object(r)).forEach(function (t) {
                          Object.defineProperty(
                            e,
                            t,
                            Object.getOwnPropertyDescriptor(r, t),
                          );
                        });
                }
                return e;
              })(
                { x: t, y: r, top: n, left: i, width: a, height: o },
                (function (e, t) {
                  if (null == e) return {};
                  var r,
                    n,
                    i = (function (e, t) {
                      if (null == e) return {};
                      var r = {};
                      for (var n in e)
                        if ({}.hasOwnProperty.call(e, n)) {
                          if (-1 !== t.indexOf(n)) continue;
                          r[n] = e[n];
                        }
                      return r;
                    })(e, t);
                  if (Object.getOwnPropertySymbols) {
                    var a = Object.getOwnPropertySymbols(e);
                    for (n = 0; n < a.length; n++)
                      ((r = a[n]),
                        -1 === t.indexOf(r) &&
                          {}.propertyIsEnumerable.call(e, r) &&
                          (i[r] = e[r]));
                  }
                  return i;
                })(e, v8),
              );
            return b(t) && b(r) && b(a) && b(o) && b(n) && b(i)
              ? l.createElement(
                  "path",
                  v9({}, pA(c), {
                    className: d("recharts-cross", s),
                    d: gt(t, r, a, o, n, i),
                  }),
                )
              : null;
          };
        function gn(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function gi(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? gn(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : gn(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var ga = (e) =>
            e.replace(/([A-Z])/g, (e) => "-".concat(e.toLowerCase())),
          go = (e, t, r) =>
            e
              .map((e) => "".concat(ga(e), " ").concat(t, "ms ").concat(r))
              .join(","),
          gl = (e, t) =>
            [Object.keys(e), Object.keys(t)].reduce((e, t) =>
              e.filter((e) => t.includes(e)),
            ),
          gs = (e, t) =>
            Object.keys(t).reduce(
              (r, n) => gi(gi({}, r), {}, { [n]: e(n, t[n]) }),
              {},
            );
        function gc(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function gu(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? gc(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : gc(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var gd = (e, t, r) => e + (t - e) * r,
          gf = (e) => {
            var { from: t, to: r } = e;
            return t !== r;
          },
          gh = (e, t, r) => {
            var n = gs((t, r) => {
              if (gf(r)) {
                var [n, i] = e(r.from, r.to, r.velocity);
                return gu(gu({}, r), {}, { from: n, velocity: i });
              }
              return r;
            }, t);
            return r < 1
              ? gs(
                  (e, t) =>
                    gf(t)
                      ? gu(
                          gu({}, t),
                          {},
                          {
                            velocity: gd(t.velocity, n[e].velocity, r),
                            from: gd(t.from, n[e].from, r),
                          },
                        )
                      : t,
                  t,
                )
              : gh(e, n, r - 1);
          };
        let gp = (e, t, r, n, i, a) => {
          var o = gl(e, t);
          return null == r
            ? () => (i(gu(gu({}, e), t)), () => {})
            : !0 === r.isStepper
              ? (function (e, t, r, n, i, a) {
                  var o,
                    l = n.reduce(
                      (r, n) =>
                        gu(
                          gu({}, r),
                          {},
                          { [n]: { from: e[n], velocity: 0, to: t[n] } },
                        ),
                      {},
                    ),
                    s = () => gs((e, t) => t.from, l),
                    c = () => !Object.values(l).filter(gf).length,
                    u = null,
                    d = (n) => {
                      o || (o = n);
                      var f = (n - o) / r.dt;
                      ((l = gh(r, l, f)),
                        i(gu(gu(gu({}, e), t), s())),
                        (o = n),
                        c() || (u = a.setTimeout(d)));
                    };
                  return () => (
                    (u = a.setTimeout(d)),
                    () => {
                      var e;
                      null === (e = u) || void 0 === e || e();
                    }
                  );
                })(e, t, r, o, i, a)
              : (function (e, t, r, n, i, a, o) {
                  var l,
                    s = null,
                    c = i.reduce(
                      (r, n) => gu(gu({}, r), {}, { [n]: [e[n], t[n]] }),
                      {},
                    ),
                    u = (i) => {
                      l || (l = i);
                      var d = (i - l) / n,
                        f = gs((e, t) => gd(...t, r(d)), c);
                      if ((a(gu(gu(gu({}, e), t), f)), d < 1))
                        s = o.setTimeout(u);
                      else {
                        var h = gs((e, t) => gd(...t, r(1)), c);
                        a(gu(gu(gu({}, e), t), h));
                      }
                    };
                  return () => (
                    (s = o.setTimeout(u)),
                    () => {
                      var e;
                      null === (e = s) || void 0 === e || e();
                    }
                  );
                })(e, t, r, n, o, i, a);
        };
        var gy = (e, t) => [0, 3 * e, 3 * t - 6 * e, 3 * e - 3 * t + 1],
          gm = (e, t) => e.map((e, r) => e * t ** r).reduce((e, t) => e + t),
          gv = (e, t) => (r) => gm(gy(e, t), r),
          gg = (e, t) => (r) =>
            gm(
              [
                ...gy(e, t)
                  .map((e, t) => e * t)
                  .slice(1),
                0,
              ],
              r,
            ),
          gb = function () {
            for (var e = arguments.length, t = Array(e), r = 0; r < e; r++)
              t[r] = arguments[r];
            if (1 === t.length)
              switch (t[0]) {
                case "linear":
                  return [0, 0, 1, 1];
                case "ease":
                  return [0.25, 0.1, 0.25, 1];
                case "ease-in":
                  return [0.42, 0, 1, 1];
                case "ease-out":
                  return [0.42, 0, 0.58, 1];
                case "ease-in-out":
                  return [0, 0, 0.58, 1];
                default:
                  var n,
                    i = t[0].split("(");
                  if (
                    "cubic-bezier" === i[0] &&
                    (null === (n = i[1]) || void 0 === n
                      ? void 0
                      : n.split(")")[0].split(",").length) === 4
                  ) {
                    var a = i[1]
                      .split(")")[0]
                      .split(",")
                      .map((e) => parseFloat(e));
                    return [a[0], a[1], a[2], a[3]];
                  }
              }
            return 4 === t.length ? t : [0, 0, 1, 1];
          },
          gx = (e, t, r, n) => {
            var i = gv(e, r),
              a = gv(t, n),
              o = gg(e, r),
              l = (e) => (e > 1 ? 1 : e < 0 ? 0 : e),
              s = (e) => {
                for (var t = e > 1 ? 1 : e, r = t, n = 0; n < 8; ++n) {
                  var s = i(r) - t,
                    c = o(r);
                  if (1e-4 > Math.abs(s - t) || c < 1e-4) break;
                  r = l(r - s / c);
                }
                return a(r);
              };
            return ((s.isStepper = !1), s);
          },
          gw = function () {
            return gx(...gb(...arguments));
          },
          gj = function () {
            var e =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : {},
              { stiff: t = 100, damping: r = 8, dt: n = 17 } = e,
              i = (e, i, a) => {
                var o = a + ((-(e - i) * t - a * r) * n) / 1e3,
                  l = (a * n) / 1e3 + e;
                return 1e-4 > Math.abs(l - i) && 1e-4 > Math.abs(o)
                  ? [i, 0]
                  : [l, o];
              };
            return ((i.isStepper = !0), (i.dt = n), i);
          },
          gO = (e) => {
            if ("string" == typeof e)
              switch (e) {
                case "ease":
                case "ease-in-out":
                case "ease-out":
                case "ease-in":
                case "linear":
                  return gw(e);
                case "spring":
                  return gj();
                default:
                  if ("cubic-bezier" === e.split("(")[0]) return gw(e);
              }
            return "function" == typeof e ? e : null;
          };
        class gP {
          setTimeout(e) {
            var t =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : 0,
              r = performance.now(),
              n = null,
              i = (a) => {
                a - r >= t
                  ? e(a)
                  : "function" == typeof requestAnimationFrame &&
                    (n = requestAnimationFrame(i));
              };
            return (
              (n = requestAnimationFrame(i)),
              () => {
                null != n && cancelAnimationFrame(n);
              }
            );
          }
        }
        var gS = (0, l.createContext)(function () {
            var e, t, r, n, i;
            return (
              (e = new gP()),
              (t = () => null),
              (r = !1),
              (n = null),
              (i = (a) => {
                if (!r) {
                  if (Array.isArray(a)) {
                    if (!a.length) return;
                    var [o, ...l] = a;
                    if ("number" == typeof o) {
                      n = e.setTimeout(i.bind(null, l), o);
                      return;
                    }
                    (i(o), (n = e.setTimeout(i.bind(null, l))));
                    return;
                  }
                  ("string" == typeof a && t(a),
                    "object" == typeof a && t(a),
                    "function" == typeof a && a());
                }
              }),
              {
                stop: () => {
                  r = !0;
                },
                start: (e) => {
                  ((r = !1), n && (n(), (n = null)), i(e));
                },
                subscribe: (e) => (
                  (t = e),
                  () => {
                    t = () => null;
                  }
                ),
                getTimeoutController: () => e,
              }
            );
          }),
          gk = {
            begin: 0,
            duration: 1e3,
            easing: "ease",
            isActive: !0,
            canBegin: !0,
            onAnimationEnd: () => {},
            onAnimationStart: () => {},
          },
          gN = { t: 0 },
          gE = { t: 1 };
        function g_(e) {
          var t,
            r,
            n,
            i = yd(e, gk),
            {
              isActive: a,
              canBegin: o,
              duration: s,
              easing: c,
              begin: u,
              onAnimationEnd: d,
              onAnimationStart: f,
              children: h,
            } = i,
            p = "auto" === a ? !pi.isSsr : a,
            y =
              ((t = i.animationId),
              (r = i.animationManager),
              (n = (0, l.useContext)(gS)),
              (0, l.useMemo)(() => (null != r ? r : n(t)), [t, r, n])),
            [m, v] = (0, l.useState)(p ? gN : gE),
            g = (0, l.useRef)(null);
          return (
            (0, l.useEffect)(() => {
              p || v(gE);
            }, [p]),
            (0, l.useEffect)(() => {
              if (!p || !o) return A;
              var e = gp(gN, gE, gO(c), s, v, y.getTimeoutController());
              return (
                y.start([
                  f,
                  u,
                  () => {
                    g.current = e();
                  },
                  s,
                  d,
                ]),
                () => {
                  (y.stop(), g.current && g.current(), d());
                }
              );
            }, [p, o, s, c, u, f, d, y]),
            h(m.t)
          );
        }
        function gA(e) {
          var t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : "animation-",
            r = (0, l.useRef)(j(t)),
            n = (0, l.useRef)(e);
          return (
            n.current !== e && ((r.current = j(t)), (n.current = e)),
            r.current
          );
        }
        var gM = ["radius"],
          gC = ["radius"];
        function gT(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function gD(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? gT(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : gT(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function gI() {
          return (gI = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function gz(e, t) {
          if (null == e) return {};
          var r,
            n,
            i = (function (e, t) {
              if (null == e) return {};
              var r = {};
              for (var n in e)
                if ({}.hasOwnProperty.call(e, n)) {
                  if (-1 !== t.indexOf(n)) continue;
                  r[n] = e[n];
                }
              return r;
            })(e, t);
          if (Object.getOwnPropertySymbols) {
            var a = Object.getOwnPropertySymbols(e);
            for (n = 0; n < a.length; n++)
              ((r = a[n]),
                -1 === t.indexOf(r) &&
                  {}.propertyIsEnumerable.call(e, r) &&
                  (i[r] = e[r]));
          }
          return i;
        }
        var gL = (e, t, r, n, i) => {
            var a,
              o = Math.min(Math.abs(r) / 2, Math.abs(n) / 2),
              l = n >= 0 ? 1 : -1,
              s = r >= 0 ? 1 : -1,
              c = (n >= 0 && r >= 0) || (n < 0 && r < 0) ? 1 : 0;
            if (o > 0 && i instanceof Array) {
              for (var u = [0, 0, 0, 0], d = 0; d < 4; d++)
                u[d] = i[d] > o ? o : i[d];
              ((a = "M".concat(e, ",").concat(t + l * u[0])),
                u[0] > 0 &&
                  (a += "A "
                    .concat(u[0], ",")
                    .concat(u[0], ",0,0,")
                    .concat(c, ",")
                    .concat(e + s * u[0], ",")
                    .concat(t)),
                (a += "L ".concat(e + r - s * u[1], ",").concat(t)),
                u[1] > 0 &&
                  (a += "A "
                    .concat(u[1], ",")
                    .concat(u[1], ",0,0,")
                    .concat(c, ",\n        ")
                    .concat(e + r, ",")
                    .concat(t + l * u[1])),
                (a += "L ".concat(e + r, ",").concat(t + n - l * u[2])),
                u[2] > 0 &&
                  (a += "A "
                    .concat(u[2], ",")
                    .concat(u[2], ",0,0,")
                    .concat(c, ",\n        ")
                    .concat(e + r - s * u[2], ",")
                    .concat(t + n)),
                (a += "L ".concat(e + s * u[3], ",").concat(t + n)),
                u[3] > 0 &&
                  (a += "A "
                    .concat(u[3], ",")
                    .concat(u[3], ",0,0,")
                    .concat(c, ",\n        ")
                    .concat(e, ",")
                    .concat(t + n - l * u[3])),
                (a += "Z"));
            } else if (o > 0 && i === +i && i > 0) {
              var f = Math.min(o, i);
              a = "M "
                .concat(e, ",")
                .concat(t + l * f, "\n            A ")
                .concat(f, ",")
                .concat(f, ",0,0,")
                .concat(c, ",")
                .concat(e + s * f, ",")
                .concat(t, "\n            L ")
                .concat(e + r - s * f, ",")
                .concat(t, "\n            A ")
                .concat(f, ",")
                .concat(f, ",0,0,")
                .concat(c, ",")
                .concat(e + r, ",")
                .concat(t + l * f, "\n            L ")
                .concat(e + r, ",")
                .concat(t + n - l * f, "\n            A ")
                .concat(f, ",")
                .concat(f, ",0,0,")
                .concat(c, ",")
                .concat(e + r - s * f, ",")
                .concat(t + n, "\n            L ")
                .concat(e + s * f, ",")
                .concat(t + n, "\n            A ")
                .concat(f, ",")
                .concat(f, ",0,0,")
                .concat(c, ",")
                .concat(e, ",")
                .concat(t + n - l * f, " Z");
            } else
              a = "M "
                .concat(e, ",")
                .concat(t, " h ")
                .concat(r, " v ")
                .concat(n, " h ")
                .concat(-r, " Z");
            return a;
          },
          gR = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            radius: 0,
            isAnimationActive: !1,
            isUpdateAnimationActive: !1,
            animationBegin: 0,
            animationDuration: 1500,
            animationEasing: "ease",
          },
          g$ = (e) => {
            var t = yd(e, gR),
              r = (0, l.useRef)(null),
              [n, i] = (0, l.useState)(-1);
            (0, l.useEffect)(() => {
              if (r.current && r.current.getTotalLength)
                try {
                  var e = r.current.getTotalLength();
                  e && i(e);
                } catch (e) {}
            }, []);
            var {
                x: a,
                y: o,
                width: s,
                height: c,
                radius: u,
                className: f,
              } = t,
              {
                animationEasing: h,
                animationDuration: p,
                animationBegin: y,
                isAnimationActive: m,
                isUpdateAnimationActive: v,
              } = t,
              g = (0, l.useRef)(s),
              b = (0, l.useRef)(c),
              x = (0, l.useRef)(a),
              w = (0, l.useRef)(o),
              j = gA(
                (0, l.useMemo)(
                  () => ({ x: a, y: o, width: s, height: c, radius: u }),
                  [a, o, s, c, u],
                ),
                "rectangle-",
              );
            if (
              a !== +a ||
              o !== +o ||
              s !== +s ||
              c !== +c ||
              0 === s ||
              0 === c
            )
              return null;
            var O = d("recharts-rectangle", f);
            if (!v) {
              var P = pA(t),
                { radius: k } = P,
                N = gz(P, gM);
              return l.createElement(
                "path",
                gI({}, N, {
                  radius: "number" == typeof u ? u : void 0,
                  className: O,
                  d: gL(a, o, s, c, u),
                }),
              );
            }
            var E = g.current,
              _ = b.current,
              A = x.current,
              M = w.current,
              C = "0px ".concat(-1 === n ? 1 : n, "px"),
              T = "".concat(n, "px 0px"),
              D = go(
                ["strokeDasharray"],
                p,
                "string" == typeof h ? h : gR.animationEasing,
              );
            return l.createElement(
              g_,
              {
                animationId: j,
                key: j,
                canBegin: n > 0,
                duration: p,
                easing: h,
                isActive: v,
                begin: y,
              },
              (e) => {
                var n,
                  i = S(E, s, e),
                  d = S(_, c, e),
                  f = S(A, a, e),
                  h = S(M, o, e);
                (r.current &&
                  ((g.current = i),
                  (b.current = d),
                  (x.current = f),
                  (w.current = h)),
                  (n = m
                    ? e > 0
                      ? { transition: D, strokeDasharray: T }
                      : { strokeDasharray: C }
                    : { strokeDasharray: T }));
                var p = pA(t),
                  { radius: y } = p,
                  v = gz(p, gC);
                return l.createElement(
                  "path",
                  gI({}, v, {
                    radius: "number" == typeof u ? u : void 0,
                    className: O,
                    d: gL(f, h, i, d, u),
                    ref: r,
                    style: gD(gD({}, n), t.style),
                  }),
                );
              },
            );
          };
        function gU(e) {
          var { cx: t, cy: r, radius: n, startAngle: i, endAngle: a } = e;
          return {
            points: [cj(t, r, n, i), cj(t, r, n, a)],
            cx: t,
            cy: r,
            radius: n,
            startAngle: i,
            endAngle: a,
          };
        }
        function gF() {
          return (gF = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        var gB = (e, t) => m(t - e) * Math.min(Math.abs(t - e), 359.999),
          gK = (e) => {
            var {
                cx: t,
                cy: r,
                radius: n,
                angle: i,
                sign: a,
                isExternal: o,
                cornerRadius: l,
                cornerIsExternal: s,
              } = e,
              c = l * (o ? 1 : -1) + n,
              u = Math.asin(l / c) / cx,
              d = s ? i : i + a * u;
            return {
              center: cj(t, r, c, d),
              circleTangency: cj(t, r, n, d),
              lineTangency: cj(t, r, c * Math.cos(u * cx), s ? i - a * u : i),
              theta: u,
            };
          },
          gW = (e) => {
            var {
                cx: t,
                cy: r,
                innerRadius: n,
                outerRadius: i,
                startAngle: a,
                endAngle: o,
              } = e,
              l = gB(a, o),
              s = a + l,
              c = cj(t, r, i, a),
              u = cj(t, r, i, s),
              d = "M "
                .concat(c.x, ",")
                .concat(c.y, "\n    A ")
                .concat(i, ",")
                .concat(i, ",0,\n    ")
                .concat(+(Math.abs(l) > 180), ",")
                .concat(+(a > s), ",\n    ")
                .concat(u.x, ",")
                .concat(u.y, "\n  ");
            if (n > 0) {
              var f = cj(t, r, n, a),
                h = cj(t, r, n, s);
              d += "L "
                .concat(h.x, ",")
                .concat(h.y, "\n            A ")
                .concat(n, ",")
                .concat(n, ",0,\n            ")
                .concat(+(Math.abs(l) > 180), ",")
                .concat(+(a <= s), ",\n            ")
                .concat(f.x, ",")
                .concat(f.y, " Z");
            } else d += "L ".concat(t, ",").concat(r, " Z");
            return d;
          },
          gH = (e) => {
            var {
                cx: t,
                cy: r,
                innerRadius: n,
                outerRadius: i,
                cornerRadius: a,
                forceCornerRadius: o,
                cornerIsExternal: l,
                startAngle: s,
                endAngle: c,
              } = e,
              u = m(c - s),
              {
                circleTangency: d,
                lineTangency: f,
                theta: h,
              } = gK({
                cx: t,
                cy: r,
                radius: i,
                angle: s,
                sign: u,
                cornerRadius: a,
                cornerIsExternal: l,
              }),
              {
                circleTangency: p,
                lineTangency: y,
                theta: v,
              } = gK({
                cx: t,
                cy: r,
                radius: i,
                angle: c,
                sign: -u,
                cornerRadius: a,
                cornerIsExternal: l,
              }),
              g = l ? Math.abs(s - c) : Math.abs(s - c) - h - v;
            if (g < 0)
              return o
                ? "M "
                    .concat(f.x, ",")
                    .concat(f.y, "\n        a")
                    .concat(a, ",")
                    .concat(a, ",0,0,1,")
                    .concat(2 * a, ",0\n        a")
                    .concat(a, ",")
                    .concat(a, ",0,0,1,")
                    .concat(-(2 * a), ",0\n      ")
                : gW({
                    cx: t,
                    cy: r,
                    innerRadius: n,
                    outerRadius: i,
                    startAngle: s,
                    endAngle: c,
                  });
            var b = "M "
              .concat(f.x, ",")
              .concat(f.y, "\n    A")
              .concat(a, ",")
              .concat(a, ",0,0,")
              .concat(+(u < 0), ",")
              .concat(d.x, ",")
              .concat(d.y, "\n    A")
              .concat(i, ",")
              .concat(i, ",0,")
              .concat(+(g > 180), ",")
              .concat(+(u < 0), ",")
              .concat(p.x, ",")
              .concat(p.y, "\n    A")
              .concat(a, ",")
              .concat(a, ",0,0,")
              .concat(+(u < 0), ",")
              .concat(y.x, ",")
              .concat(y.y, "\n  ");
            if (n > 0) {
              var {
                  circleTangency: x,
                  lineTangency: w,
                  theta: j,
                } = gK({
                  cx: t,
                  cy: r,
                  radius: n,
                  angle: s,
                  sign: u,
                  isExternal: !0,
                  cornerRadius: a,
                  cornerIsExternal: l,
                }),
                {
                  circleTangency: O,
                  lineTangency: P,
                  theta: S,
                } = gK({
                  cx: t,
                  cy: r,
                  radius: n,
                  angle: c,
                  sign: -u,
                  isExternal: !0,
                  cornerRadius: a,
                  cornerIsExternal: l,
                }),
                k = l ? Math.abs(s - c) : Math.abs(s - c) - j - S;
              if (k < 0 && 0 === a)
                return "".concat(b, "L").concat(t, ",").concat(r, "Z");
              b += "L"
                .concat(P.x, ",")
                .concat(P.y, "\n      A")
                .concat(a, ",")
                .concat(a, ",0,0,")
                .concat(+(u < 0), ",")
                .concat(O.x, ",")
                .concat(O.y, "\n      A")
                .concat(n, ",")
                .concat(n, ",0,")
                .concat(+(k > 180), ",")
                .concat(+(u > 0), ",")
                .concat(x.x, ",")
                .concat(x.y, "\n      A")
                .concat(a, ",")
                .concat(a, ",0,0,")
                .concat(+(u < 0), ",")
                .concat(w.x, ",")
                .concat(w.y, "Z");
            } else b += "L".concat(t, ",").concat(r, "Z");
            return b;
          },
          gq = {
            cx: 0,
            cy: 0,
            innerRadius: 0,
            outerRadius: 0,
            startAngle: 0,
            endAngle: 0,
            cornerRadius: 0,
            forceCornerRadius: !1,
            cornerIsExternal: !1,
          },
          gV = (e) => {
            var t,
              r = yd(e, gq),
              {
                cx: n,
                cy: i,
                innerRadius: a,
                outerRadius: o,
                cornerRadius: s,
                forceCornerRadius: c,
                cornerIsExternal: u,
                startAngle: f,
                endAngle: h,
                className: p,
              } = r;
            if (o < a || f === h) return null;
            var y = d("recharts-sector", p),
              m = o - a,
              v = O(s, m, 0, !0);
            return (
              (t =
                v > 0 && 360 > Math.abs(f - h)
                  ? gH({
                      cx: n,
                      cy: i,
                      innerRadius: a,
                      outerRadius: o,
                      cornerRadius: Math.min(v, m / 2),
                      forceCornerRadius: c,
                      cornerIsExternal: u,
                      startAngle: f,
                      endAngle: h,
                    })
                  : gW({
                      cx: n,
                      cy: i,
                      innerRadius: a,
                      outerRadius: o,
                      startAngle: f,
                      endAngle: h,
                    })),
              l.createElement("path", gF({}, pA(r), { className: y, d: t }))
            );
          };
        function gZ(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function gY(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? gZ(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : gZ(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var gG = () => nR(uj),
          gX = () => {
            var e = gG(),
              t = nR(fw),
              r = nR(fg);
            return e && r
              ? ir(gY(gY({}, e), {}, { scale: r }), t)
              : ir(void 0, t);
          };
        function gQ() {
          return (gQ = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function gJ(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function g0(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? gJ(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : gJ(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function g1(e) {
          var { cursor: t, cursorComp: r, cursorProps: n } = e;
          return (0, l.isValidElement)(t)
            ? (0, l.cloneElement)(t, n)
            : (0, l.createElement)(r, n);
        }
        function g2(e) {
          var t,
            r,
            n,
            i,
            a,
            {
              coordinate: o,
              payload: s,
              index: c,
              offset: u,
              tooltipAxisBandSize: f,
              layout: h,
              cursor: p,
              tooltipEventType: y,
              chartName: m,
            } = e;
          if (!p || !o || ("ScatterChart" !== m && "axis" !== y)) return null;
          if ("ScatterChart" === m) ((n = o), (i = gr), (a = cE.cursorLine));
          else if ("BarChart" === m)
            ((t = f / 2),
              (n = {
                stroke: "none",
                fill: "#ccc",
                x: "horizontal" === h ? o.x - t : u.left + 0.5,
                y: "horizontal" === h ? u.top + 0.5 : o.y - t,
                width: "horizontal" === h ? f : u.width - 1,
                height: "horizontal" === h ? u.height - 1 : f,
              }),
              (i = g$),
              (a = cE.cursorRectangle));
          else if ("radial" === h && mv(o)) {
            var { cx: v, cy: g, radius: b, startAngle: x, endAngle: w } = gU(o);
            ((n = {
              cx: v,
              cy: g,
              startAngle: x,
              endAngle: w,
              innerRadius: b,
              outerRadius: b,
            }),
              (i = gV),
              (a = cE.cursorLine));
          } else
            ((n = {
              points: (function (e, t, r) {
                if ("horizontal" === e)
                  return [
                    { x: t.x, y: r.top },
                    { x: t.x, y: r.top + r.height },
                  ];
                if ("vertical" === e)
                  return [
                    { x: r.left, y: t.y },
                    { x: r.left + r.width, y: t.y },
                  ];
                if (mv(t)) {
                  if ("centric" === e) {
                    var {
                        cx: n,
                        cy: i,
                        innerRadius: a,
                        outerRadius: o,
                        angle: l,
                      } = t,
                      s = cj(n, i, a, l),
                      c = cj(n, i, o, l);
                    return [
                      { x: s.x, y: s.y },
                      { x: c.x, y: c.y },
                    ];
                  }
                  return gU(t);
                }
              })(h, o, u),
            }),
              (i = v7),
              (a = cE.cursorLine));
          var j =
              "object" == typeof p && "className" in p ? p.className : void 0,
            O = g0(
              g0(
                g0(g0({ stroke: "#ccc", pointerEvents: "none" }, u), n),
                p_(p),
              ),
              {},
              {
                payload: s,
                payloadIndex: c,
                className: d("recharts-tooltip-cursor", j),
              },
            );
          return l.createElement(
            y4,
            { zIndex: null !== (r = e.zIndex) && void 0 !== r ? r : a },
            l.createElement(g1, { cursor: p, cursorComp: i, cursorProps: O }),
          );
        }
        function g3(e) {
          var t = gX(),
            r = iN(),
            n = iC(),
            i = fU();
          return null == t || null == r || null == n || null == i
            ? null
            : l.createElement(
                g2,
                gQ({}, e, {
                  offset: r,
                  layout: n,
                  tooltipAxisBandSize: t,
                  chartName: i,
                }),
              );
        }
        function g6(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function g5(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? g6(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : g6(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function g4(e) {
          return e.dataKey;
        }
        var g7 = [],
          g8 = {
            allowEscapeViewBox: { x: !1, y: !1 },
            animationDuration: 400,
            animationEasing: "ease",
            axisId: 0,
            contentStyle: {},
            cursor: !0,
            filterNull: !0,
            isAnimationActive: "auto",
            itemSorter: "name",
            itemStyle: {},
            labelStyle: {},
            offset: 10,
            reverseDirection: { x: !1, y: !1 },
            separator: " : ",
            trigger: "hover",
            useTranslate3d: !1,
            wrapperStyle: {},
          };
        function g9(e) {
          var t,
            r,
            n,
            i,
            a,
            o,
            s,
            c,
            u,
            d,
            f = yd(e, g8),
            {
              active: h,
              allowEscapeViewBox: p,
              animationDuration: y,
              animationEasing: m,
              content: v,
              filterNull: g,
              isAnimationActive: b,
              offset: x,
              payloadUniqBy: w,
              position: j,
              reverseDirection: O,
              useTranslate3d: P,
              wrapperStyle: S,
              cursor: k,
              shared: N,
              trigger: E,
              defaultIndex: _,
              portal: A,
              axisId: M,
            } = f,
            C = nD(),
            T = "number" == typeof _ ? String(_) : _;
          (0, l.useEffect)(() => {
            C(
              r1({
                shared: N,
                trigger: E,
                axisId: M,
                active: h,
                defaultIndex: T,
              }),
            );
          }, [C, N, E, M, h, T]);
          var D = iS(),
            I = pj(),
            z = nR((e) => d$(e, N)),
            { activeIndex: L, isActive: R } =
              null !== (u = nR((e) => fJ(e, z, E, T))) && void 0 !== u ? u : {},
            $ = nR((e) => fQ(e, z, E, T)),
            U = nR((e) => fX(e, z, E, T)),
            F = nR((e) => fG(e, z, E, T)),
            B = p0(),
            K = null !== (d = null != h ? h : R) && void 0 !== d && d,
            [W, H] = vj([$, K]),
            q = "axis" === z ? U : void 0;
          ((t = nR((e) => fV(e, z, E))),
            (r = nR(cv)),
            (n = nR(cy)),
            (i = nR(cm)),
            (o = null == (a = nR(pY)) ? void 0 : a.active),
            (s = iS()),
            (0, l.useEffect)(() => {
              if (!o && null != n && null != r) {
                var e = r8({
                  active: K,
                  coordinate: F,
                  dataKey: t,
                  index: L,
                  label: "number" == typeof q ? String(q) : q,
                  sourceViewBox: s,
                  graphicalItemId: void 0,
                });
                pq.emit(pV, n, e, r);
              }
            }, [o, F, t, L, q, r, n, i, K, s]));
          var V = null != A ? A : B;
          if (null == V || null == D || null == z) return null;
          var Z = null != $ ? $ : g7;
          (K || (Z = g7),
            g &&
              Z.length &&
              (Z = vw(
                Z.filter(
                  (e) => null != e.value && (!0 !== e.hide || f.includeHidden),
                ),
                w,
                g4,
              )));
          var Y = Z.length > 0,
            G = l.createElement(
              vg,
              {
                allowEscapeViewBox: p,
                animationDuration: y,
                animationEasing: m,
                isAnimationActive: b,
                active: K,
                coordinate: F,
                hasPayload: Y,
                offset: x,
                position: j,
                reverseDirection: O,
                useTranslate3d: P,
                viewBox: D,
                wrapperStyle: S,
                lastBoundingBox: W,
                innerRef: H,
                hasPortalFromProps: !!A,
              },
              ((c = g5(
                g5({}, f),
                {},
                {
                  payload: Z,
                  label: q,
                  active: K,
                  activeIndex: L,
                  coordinate: F,
                  accessibilityLayer: I,
                },
              )),
              l.isValidElement(v)
                ? l.cloneElement(v, c)
                : "function" == typeof v
                  ? l.createElement(v, c)
                  : l.createElement(vd, c)),
            );
          return l.createElement(
            l.Fragment,
            null,
            (0, y5.createPortal)(G, V),
            K &&
              l.createElement(g3, {
                cursor: k,
                tooltipEventType: z,
                coordinate: F,
                payload: Z,
                index: L,
              }),
          );
        }
        let be = Math.cos,
          bt = Math.sin,
          br = Math.sqrt,
          bn = Math.PI,
          bi = 2 * bn,
          ba = {
            draw(e, t) {
              let r = br(t / bn);
              (e.moveTo(r, 0), e.arc(0, 0, r, 0, bi));
            },
          },
          bo = br(1 / 3),
          bl = 2 * bo,
          bs = bt(bn / 10) / bt((7 * bn) / 10),
          bc = bt(bi / 10) * bs,
          bu = -be(bi / 10) * bs,
          bd = br(3),
          bf = br(3) / 2,
          bh = 1 / br(12),
          bp = (bh / 2 + 1) * 3;
        (br(3), br(3));
        var by = ["type", "size", "sizeType"];
        function bm() {
          return (bm = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function bv(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function bg(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? bv(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : bv(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var bb = {
            symbolCircle: ba,
            symbolCross: {
              draw(e, t) {
                let r = br(t / 5) / 2;
                (e.moveTo(-3 * r, -r),
                  e.lineTo(-r, -r),
                  e.lineTo(-r, -3 * r),
                  e.lineTo(r, -3 * r),
                  e.lineTo(r, -r),
                  e.lineTo(3 * r, -r),
                  e.lineTo(3 * r, r),
                  e.lineTo(r, r),
                  e.lineTo(r, 3 * r),
                  e.lineTo(-r, 3 * r),
                  e.lineTo(-r, r),
                  e.lineTo(-3 * r, r),
                  e.closePath());
              },
            },
            symbolDiamond: {
              draw(e, t) {
                let r = br(t / bl),
                  n = r * bo;
                (e.moveTo(0, -r),
                  e.lineTo(n, 0),
                  e.lineTo(0, r),
                  e.lineTo(-n, 0),
                  e.closePath());
              },
            },
            symbolSquare: {
              draw(e, t) {
                let r = br(t),
                  n = -r / 2;
                e.rect(n, n, r, r);
              },
            },
            symbolStar: {
              draw(e, t) {
                let r = br(0.8908130915292852 * t),
                  n = bc * r,
                  i = bu * r;
                (e.moveTo(0, -r), e.lineTo(n, i));
                for (let t = 1; t < 5; ++t) {
                  let a = (bi * t) / 5,
                    o = be(a),
                    l = bt(a);
                  (e.lineTo(l * r, -o * r),
                    e.lineTo(o * n - l * i, l * n + o * i));
                }
                e.closePath();
              },
            },
            symbolTriangle: {
              draw(e, t) {
                let r = -br(t / (3 * bd));
                (e.moveTo(0, 2 * r),
                  e.lineTo(-bd * r, -r),
                  e.lineTo(bd * r, -r),
                  e.closePath());
              },
            },
            symbolWye: {
              draw(e, t) {
                let r = br(t / bp),
                  n = r / 2,
                  i = r * bh,
                  a = r * bh + r,
                  o = -n;
                (e.moveTo(n, i),
                  e.lineTo(n, a),
                  e.lineTo(o, a),
                  e.lineTo(-0.5 * n - bf * i, bf * n + -0.5 * i),
                  e.lineTo(-0.5 * n - bf * a, bf * n + -0.5 * a),
                  e.lineTo(-0.5 * o - bf * a, bf * o + -0.5 * a),
                  e.lineTo(-0.5 * n + bf * i, -0.5 * i - bf * n),
                  e.lineTo(-0.5 * n + bf * a, -0.5 * a - bf * n),
                  e.lineTo(-0.5 * o + bf * a, -0.5 * a - bf * o),
                  e.closePath());
              },
            },
          },
          bx = Math.PI / 180,
          bw = (e) => bb["symbol".concat(E(e))] || ba,
          bj = (e, t, r) => {
            if ("area" === t) return e;
            switch (r) {
              case "cross":
                return (5 * e * e) / 9;
              case "diamond":
                return (0.5 * e * e) / Math.sqrt(3);
              case "square":
                return e * e;
              case "star":
                var n = 18 * bx;
                return (
                  1.25 *
                  e *
                  e *
                  (Math.tan(n) - Math.tan(2 * n) * Math.tan(n) ** 2)
                );
              case "triangle":
                return (Math.sqrt(3) * e * e) / 4;
              case "wye":
                return ((21 - 10 * Math.sqrt(3)) * e * e) / 8;
              default:
                return (Math.PI * e * e) / 4;
            }
          },
          bO = (e) => {
            var { type: t = "circle", size: r = 64, sizeType: n = "area" } = e,
              i = bg(
                bg(
                  {},
                  (function (e, t) {
                    if (null == e) return {};
                    var r,
                      n,
                      i = (function (e, t) {
                        if (null == e) return {};
                        var r = {};
                        for (var n in e)
                          if ({}.hasOwnProperty.call(e, n)) {
                            if (-1 !== t.indexOf(n)) continue;
                            r[n] = e[n];
                          }
                        return r;
                      })(e, t);
                    if (Object.getOwnPropertySymbols) {
                      var a = Object.getOwnPropertySymbols(e);
                      for (n = 0; n < a.length; n++)
                        ((r = a[n]),
                          -1 === t.indexOf(r) &&
                            {}.propertyIsEnumerable.call(e, r) &&
                            (i[r] = e[r]));
                    }
                    return i;
                  })(e, by),
                ),
                {},
                { type: t, size: r, sizeType: n },
              ),
              a = "circle";
            "string" == typeof t && (a = t);
            var { className: o, cx: s, cy: c } = i,
              u = pA(i);
            return b(s) && b(c) && b(r)
              ? l.createElement(
                  "path",
                  bm({}, u, {
                    className: d("recharts-symbols", o),
                    transform: "translate(".concat(s, ", ").concat(c, ")"),
                    d: (() => {
                      var e = bw(a),
                        t = (function (e, t) {
                          let r = null,
                            n = vq(i);
                          function i() {
                            let i;
                            if (
                              (r || (r = i = n()),
                              e
                                .apply(this, arguments)
                                .draw(r, +t.apply(this, arguments)),
                              i)
                            )
                              return ((r = null), i + "" || null);
                          }
                          return (
                            (e = "function" == typeof e ? e : nH(e || ba)),
                            (t =
                              "function" == typeof t
                                ? t
                                : nH(void 0 === t ? 64 : +t)),
                            (i.type = function (t) {
                              return arguments.length
                                ? ((e = "function" == typeof t ? t : nH(t)), i)
                                : e;
                            }),
                            (i.size = function (e) {
                              return arguments.length
                                ? ((t = "function" == typeof e ? e : nH(+e)), i)
                                : t;
                            }),
                            (i.context = function (e) {
                              return arguments.length
                                ? ((r = null == e ? null : e), i)
                                : r;
                            }),
                            i
                          );
                        })()
                          .type(e)
                          .size(bj(r, n, a))();
                      if (null !== t) return t;
                    })(),
                  }),
                )
              : null;
          };
        function bP() {
          return (bP = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function bS(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        bO.registerSymbol = (e, t) => {
          bb["symbol".concat(E(e))] = t;
        };
        var bk = {
          align: "center",
          iconSize: 14,
          inactiveColor: "#ccc",
          layout: "horizontal",
          verticalAlign: "middle",
        };
        function bN(e) {
          var t,
            { data: r, iconType: n, inactiveColor: i } = e,
            a = 32 / 6,
            o = 32 / 3,
            s = r.inactive ? i : r.color,
            c = null != n ? n : r.type;
          if ("none" === c) return null;
          if ("plainline" === c)
            return l.createElement("line", {
              strokeWidth: 4,
              fill: "none",
              stroke: s,
              strokeDasharray:
                null === (t = r.payload) || void 0 === t
                  ? void 0
                  : t.strokeDasharray,
              x1: 0,
              y1: 16,
              x2: 32,
              y2: 16,
              className: "recharts-legend-icon",
            });
          if ("line" === c)
            return l.createElement("path", {
              strokeWidth: 4,
              fill: "none",
              stroke: s,
              d: "M0,"
                .concat(16, "h")
                .concat(o, "\n            A")
                .concat(a, ",")
                .concat(a, ",0,1,1,")
                .concat(2 * o, ",")
                .concat(16, "\n            H")
                .concat(32, "M")
                .concat(2 * o, ",")
                .concat(16, "\n            A")
                .concat(a, ",")
                .concat(a, ",0,1,1,")
                .concat(o, ",")
                .concat(16),
              className: "recharts-legend-icon",
            });
          if ("rect" === c)
            return l.createElement("path", {
              stroke: "none",
              fill: s,
              d: "M0,"
                .concat(4, "h")
                .concat(32, "v")
                .concat(24, "h")
                .concat(-32, "z"),
              className: "recharts-legend-icon",
            });
          if (l.isValidElement(r.legendIcon)) {
            var u = (function (e) {
              for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                  ? bS(Object(r), !0).forEach(function (t) {
                      var n, i;
                      ((n = t),
                        (i = r[t]),
                        (n = (function (e) {
                          var t = (function (e, t) {
                            if ("object" != typeof e || !e) return e;
                            var r = e[Symbol.toPrimitive];
                            if (void 0 !== r) {
                              var n = r.call(e, t || "default");
                              if ("object" != typeof n) return n;
                              throw TypeError(
                                "@@toPrimitive must return a primitive value.",
                              );
                            }
                            return ("string" === t ? String : Number)(e);
                          })(e, "string");
                          return "symbol" == typeof t ? t : t + "";
                        })(n)) in e
                          ? Object.defineProperty(e, n, {
                              value: i,
                              enumerable: !0,
                              configurable: !0,
                              writable: !0,
                            })
                          : (e[n] = i));
                    })
                  : Object.getOwnPropertyDescriptors
                    ? Object.defineProperties(
                        e,
                        Object.getOwnPropertyDescriptors(r),
                      )
                    : bS(Object(r)).forEach(function (t) {
                        Object.defineProperty(
                          e,
                          t,
                          Object.getOwnPropertyDescriptor(r, t),
                        );
                      });
              }
              return e;
            })({}, r);
            return (delete u.legendIcon, l.cloneElement(r.legendIcon, u));
          }
          return l.createElement(bO, {
            fill: s,
            cx: 16,
            cy: 16,
            size: 32,
            sizeType: "diameter",
            type: c,
          });
        }
        function bE(e) {
          var {
              payload: t,
              iconSize: r,
              layout: n,
              formatter: i,
              inactiveColor: a,
              iconType: o,
            } = e,
            s = { x: 0, y: 0, width: 32, height: 32 },
            c = {
              display: "horizontal" === n ? "inline-block" : "block",
              marginRight: 10,
            },
            u = {
              display: "inline-block",
              verticalAlign: "middle",
              marginRight: 4,
            };
          return t.map((t, n) => {
            var f = t.formatter || i,
              h = d({
                "recharts-legend-item": !0,
                ["legend-item-".concat(n)]: !0,
                inactive: t.inactive,
              });
            if ("none" === t.type) return null;
            var p = t.inactive ? a : t.color,
              y = f ? f(t.value, t, n) : t.value;
            return l.createElement(
              "li",
              bP(
                { className: h, style: c, key: "legend-item-".concat(n) },
                mx(e, t, n),
              ),
              l.createElement(
                pT,
                {
                  width: r,
                  height: r,
                  viewBox: s,
                  style: u,
                  "aria-label": "".concat(y, " legend icon"),
                },
                l.createElement(bN, { data: t, iconType: o, inactiveColor: a }),
              ),
              l.createElement(
                "span",
                { className: "recharts-legend-item-text", style: { color: p } },
                y,
              ),
            );
          });
        }
        var b_ = (e) => {
            var t = yd(e, bk),
              { payload: r, layout: n, align: i } = t;
            return r && r.length
              ? l.createElement(
                  "ul",
                  {
                    className: "recharts-default-legend",
                    style: {
                      padding: 0,
                      margin: 0,
                      textAlign: "horizontal" === n ? i : "left",
                    },
                  },
                  l.createElement(bE, bP({}, t, { payload: r })),
                )
              : null;
          },
          bA = ["contextPayload"];
        function bM() {
          return (bM = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function bC(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function bT(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? bC(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : bC(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function bD(e) {
          return e.value;
        }
        function bI(e) {
          var { contextPayload: t } = e,
            r = (function (e, t) {
              if (null == e) return {};
              var r,
                n,
                i = (function (e, t) {
                  if (null == e) return {};
                  var r = {};
                  for (var n in e)
                    if ({}.hasOwnProperty.call(e, n)) {
                      if (-1 !== t.indexOf(n)) continue;
                      r[n] = e[n];
                    }
                  return r;
                })(e, t);
              if (Object.getOwnPropertySymbols) {
                var a = Object.getOwnPropertySymbols(e);
                for (n = 0; n < a.length; n++)
                  ((r = a[n]),
                    -1 === t.indexOf(r) &&
                      {}.propertyIsEnumerable.call(e, r) &&
                      (i[r] = e[r]));
              }
              return i;
            })(e, bA),
            n = vw(t, e.payloadUniqBy, bD),
            i = bT(bT({}, r), {}, { payload: n });
          return l.isValidElement(e.content)
            ? l.cloneElement(e.content, i)
            : "function" == typeof e.content
              ? l.createElement(e.content, i)
              : l.createElement(b_, i);
        }
        function bz(e) {
          var t = nD();
          return (
            (0, l.useEffect)(() => {
              t(hI(e));
            }, [t, e]),
            null
          );
        }
        function bL(e) {
          var t = nD();
          return (
            (0, l.useEffect)(
              () => (
                t(hD(e)),
                () => {
                  t(hD({ width: 0, height: 0 }));
                }
              ),
              [t, e],
            ),
            null
          );
        }
        var bR = {
          align: "center",
          iconSize: 14,
          itemSorter: "value",
          layout: "horizontal",
          verticalAlign: "bottom",
        };
        function b$(e) {
          var t,
            r = yd(e, bR),
            n = nR(nB),
            i = p2(),
            a = iA(),
            { width: o, height: s, wrapperStyle: c, portal: u } = r,
            [d, f] = vj([n]),
            h = iE(),
            p = i_();
          if (null == h || null == p) return null;
          var y =
              h -
              ((null == a ? void 0 : a.left) || 0) -
              ((null == a ? void 0 : a.right) || 0),
            m =
              "vertical" === (t = r.layout) && b(s)
                ? { height: s }
                : "horizontal" === t
                  ? { width: o || y }
                  : null,
            v = u
              ? c
              : bT(
                  bT(
                    {
                      position: "absolute",
                      width: (null == m ? void 0 : m.width) || o || "auto",
                      height: (null == m ? void 0 : m.height) || s || "auto",
                    },
                    (function (e, t, r, n, i, a) {
                      var o,
                        l,
                        { layout: s, align: c, verticalAlign: u } = t;
                      return (
                        (e &&
                          ((void 0 !== e.left && null !== e.left) ||
                            (void 0 !== e.right && null !== e.right))) ||
                          (o =
                            "center" === c && "vertical" === s
                              ? { left: ((n || 0) - a.width) / 2 }
                              : "right" === c
                                ? { right: (r && r.right) || 0 }
                                : { left: (r && r.left) || 0 }),
                        (e &&
                          ((void 0 !== e.top && null !== e.top) ||
                            (void 0 !== e.bottom && null !== e.bottom))) ||
                          (l =
                            "middle" === u
                              ? { top: ((i || 0) - a.height) / 2 }
                              : "bottom" === u
                                ? { bottom: (r && r.bottom) || 0 }
                                : { top: (r && r.top) || 0 }),
                        bT(bT({}, o), l)
                      );
                    })(c, r, a, h, p, d),
                  ),
                  c,
                ),
            g = null != u ? u : i;
          if (null == g || null == n) return null;
          var x = l.createElement(
            "div",
            { className: "recharts-legend-wrapper", style: v, ref: f },
            l.createElement(bz, {
              layout: r.layout,
              align: r.align,
              verticalAlign: r.verticalAlign,
              itemSorter: r.itemSorter,
            }),
            !u && l.createElement(bL, { width: d.width, height: d.height }),
            l.createElement(
              bI,
              bM({}, r, m, {
                margin: a,
                chartWidth: h,
                chartHeight: p,
                contextPayload: n,
              }),
            ),
          );
          return (0, y5.createPortal)(x, g);
        }
        b$.displayName = "Legend";
        var bU = r(29898),
          bF = r.n(bU),
          bB = ["valueAccessor"],
          bK = ["dataKey", "clockWise", "id", "textBreakAll", "zIndex"];
        function bW() {
          return (bW = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function bH(e, t) {
          if (null == e) return {};
          var r,
            n,
            i = (function (e, t) {
              if (null == e) return {};
              var r = {};
              for (var n in e)
                if ({}.hasOwnProperty.call(e, n)) {
                  if (-1 !== t.indexOf(n)) continue;
                  r[n] = e[n];
                }
              return r;
            })(e, t);
          if (Object.getOwnPropertySymbols) {
            var a = Object.getOwnPropertySymbols(e);
            for (n = 0; n < a.length; n++)
              ((r = a[n]),
                -1 === t.indexOf(r) &&
                  {}.propertyIsEnumerable.call(e, r) &&
                  (i[r] = e[r]));
          }
          return i;
        }
        var bq = (e) => (Array.isArray(e.value) ? bF()(e.value) : e.value),
          bV = (0, l.createContext)(void 0),
          bZ = bV.Provider,
          bY = (0, l.createContext)(void 0);
        function bG(e) {
          var { valueAccessor: t = bq } = e,
            r = bH(e, bB),
            { dataKey: n, clockWise: i, id: a, textBreakAll: o, zIndex: s } = r,
            c = bH(r, bK),
            u = (0, l.useContext)(bV),
            d = (0, l.useContext)(bY),
            f = u || d;
          return f && f.length
            ? l.createElement(
                y4,
                { zIndex: null != s ? s : cE.label },
                l.createElement(
                  yD,
                  { className: "recharts-label-list" },
                  f.map((e, i) => {
                    var s,
                      u = N(n) ? t(e, i) : nQ(e && e.payload, n),
                      d = N(a) ? {} : { id: "".concat(a, "-").concat(i) };
                    return l.createElement(
                      mp,
                      bW({ key: "label-".concat(i) }, pA(e), c, d, {
                        fill:
                          null !== (s = r.fill) && void 0 !== s ? s : e.fill,
                        parentViewBox: e.parentViewBox,
                        value: u,
                        textBreakAll: o,
                        viewBox: e.viewBox,
                        index: i,
                        zIndex: 0,
                      }),
                    );
                  }),
                ),
              )
            : null;
        }
        function bX(e) {
          var { label: t } = e;
          return t
            ? !0 === t
              ? l.createElement(bG, { key: "labelList-implicit" })
              : l.isValidElement(t) || ml(t)
                ? l.createElement(bG, { key: "labelList-implicit", content: t })
                : "object" == typeof t
                  ? l.createElement(
                      bG,
                      bW({ key: "labelList-implicit" }, t, {
                        type: String(t.type),
                      }),
                    )
                  : null
            : null;
        }
        function bQ() {
          return (bQ = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        (bY.Provider, (bG.displayName = "LabelList"));
        var bJ = (e) => {
          var { cx: t, cy: r, r: n, className: i } = e,
            a = d("recharts-dot", i);
          return b(t) && b(r) && b(n)
            ? l.createElement(
                "circle",
                bQ({}, pE(e), mg(e), { className: a, cx: t, cy: r, r: n }),
              )
            : null;
        };
        r(21912);
        var b0 = (e) =>
            !e || "object" != typeof e || !("clipDot" in e) || !!e.clipDot,
          b1 = ["points"];
        function b2(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function b3(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? b2(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : b2(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function b6() {
          return (b6 = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function b5(e) {
          var { option: t, dotProps: r, className: n } = e;
          if ((0, l.isValidElement)(t)) return (0, l.cloneElement)(t, r);
          if ("function" == typeof t) return t(r);
          var i = d(n, "boolean" != typeof t ? t.className : ""),
            a = null != r ? r : {},
            { points: o } = a,
            s = (function (e, t) {
              if (null == e) return {};
              var r,
                n,
                i = (function (e, t) {
                  if (null == e) return {};
                  var r = {};
                  for (var n in e)
                    if ({}.hasOwnProperty.call(e, n)) {
                      if (-1 !== t.indexOf(n)) continue;
                      r[n] = e[n];
                    }
                  return r;
                })(e, t);
              if (Object.getOwnPropertySymbols) {
                var a = Object.getOwnPropertySymbols(e);
                for (n = 0; n < a.length; n++)
                  ((r = a[n]),
                    -1 === t.indexOf(r) &&
                      {}.propertyIsEnumerable.call(e, r) &&
                      (i[r] = e[r]));
              }
              return i;
            })(a, b1);
          return l.createElement(bJ, b6({}, s, { className: i }));
        }
        function b4(e) {
          var {
            points: t,
            dot: r,
            className: n,
            dotClassName: i,
            dataKey: a,
            baseProps: o,
            needClip: s,
            clipPathId: c,
            zIndex: u = cE.scatter,
          } = e;
          if (null == t || (!r && 1 !== t.length)) return null;
          var d = b0(r),
            f =
              null == r
                ? null
                : (0, l.isValidElement)(r)
                  ? pA(r.props)
                  : "object" != typeof r || Array.isArray(r)
                    ? null
                    : pA(r),
            h = t.map((e, n) => {
              var s,
                c,
                u = b3(
                  b3(b3({ r: 3 }, o), f),
                  {},
                  {
                    index: n,
                    cx: null !== (s = e.x) && void 0 !== s ? s : void 0,
                    cy: null !== (c = e.y) && void 0 !== c ? c : void 0,
                    dataKey: a,
                    value: e.value,
                    payload: e.payload,
                    points: t,
                  },
                );
              return l.createElement(b5, {
                key: "dot-".concat(n),
                option: r,
                dotProps: u,
                className: i,
              });
            }),
            p = {};
          return (
            s &&
              null != c &&
              (p.clipPath = "url(#clipPath-"
                .concat(d ? "" : "dots-")
                .concat(c, ")")),
            l.createElement(
              y4,
              { zIndex: u },
              l.createElement(yD, b6({ className: n }, p), h),
            )
          );
        }
        function b7(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function b8(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? b7(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : b7(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        var b9 = (e) => {
          var t,
            {
              point: r,
              childIndex: n,
              mainColor: i,
              activeDot: a,
              dataKey: o,
              clipPath: s,
            } = e;
          if (!1 === a || null == r.x || null == r.y) return null;
          var c = b8(
            b8(
              b8(
                {},
                {
                  index: n,
                  dataKey: o,
                  cx: r.x,
                  cy: r.y,
                  r: 4,
                  fill: null != i ? i : "none",
                  strokeWidth: 2,
                  stroke: "#fff",
                  payload: r.payload,
                  value: r.value,
                },
              ),
              p_(a),
            ),
            mg(a),
          );
          return (
            (t = (0, l.isValidElement)(a)
              ? (0, l.cloneElement)(a, c)
              : "function" == typeof a
                ? a(c)
                : l.createElement(bJ, c)),
            l.createElement(
              yD,
              { className: "recharts-active-dot", clipPath: s },
              t,
            )
          );
        };
        function xe(e) {
          var {
              points: t,
              mainColor: r,
              activeDot: n,
              itemDataKey: i,
              clipPath: a,
              zIndex: o = cE.activeDot,
            } = e,
            s = nR(fk),
            c = ya();
          if (null == t || null == c) return null;
          var u = t.find((e) => c.includes(e.payload));
          return N(u)
            ? null
            : l.createElement(
                y4,
                { zIndex: o },
                l.createElement(b9, {
                  point: u,
                  childIndex: Number(s),
                  mainColor: r,
                  dataKey: i,
                  activeDot: n,
                  clipPath: a,
                }),
              );
        }
        function xt(e) {
          var { tooltipEntrySettings: t } = e,
            r = nD(),
            n = iw(),
            i = (0, l.useRef)(null);
          return (
            (0, l.useLayoutEffect)(() => {
              n ||
                (null === i.current
                  ? r(rQ(t))
                  : i.current !== t && r(rJ({ prev: i.current, next: t })),
                (i.current = t));
            }, [t, r, n]),
            (0, l.useLayoutEffect)(
              () => () => {
                i.current && (r(r0(i.current)), (i.current = null));
              },
              [r],
            ),
            null
          );
        }
        var xr = ["children"],
          xn = (0, l.createContext)({
            data: [],
            xAxisId: "xAxis-0",
            yAxisId: "yAxis-0",
            dataPointFormatter: () => ({ x: 0, y: 0, value: 0 }),
            errorBarOffset: 0,
          });
        function xi(e) {
          var { children: t } = e,
            r = (function (e, t) {
              if (null == e) return {};
              var r,
                n,
                i = (function (e, t) {
                  if (null == e) return {};
                  var r = {};
                  for (var n in e)
                    if ({}.hasOwnProperty.call(e, n)) {
                      if (-1 !== t.indexOf(n)) continue;
                      r[n] = e[n];
                    }
                  return r;
                })(e, t);
              if (Object.getOwnPropertySymbols) {
                var a = Object.getOwnPropertySymbols(e);
                for (n = 0; n < a.length; n++)
                  ((r = a[n]),
                    -1 === t.indexOf(r) &&
                      {}.propertyIsEnumerable.call(e, r) &&
                      (i[r] = e[r]));
              }
              return i;
            })(e, xr);
          return l.createElement(xn.Provider, { value: r }, t);
        }
        function xa(e, t) {
          var r,
            n,
            i = nR((t) => c5(t, e)),
            a = nR((e) => c8(e, t)),
            o =
              null !== (r = null == i ? void 0 : i.allowDataOverflow) &&
              void 0 !== r
                ? r
                : c3.allowDataOverflow,
            l =
              null !== (n = null == a ? void 0 : a.allowDataOverflow) &&
              void 0 !== n
                ? n
                : c4.allowDataOverflow;
          return { needClip: o || l, needClipX: o, needClipY: l };
        }
        function xo(e) {
          var { xAxisId: t, yAxisId: r, clipPathId: n } = e,
            i = yi(),
            { needClipX: a, needClipY: o, needClip: s } = xa(t, r);
          if (!s || !i) return null;
          var { x: c, y: u, width: d, height: f } = i;
          return l.createElement(
            "clipPath",
            { id: "clipPath-".concat(n) },
            l.createElement("rect", {
              x: a ? c : c - d / 2,
              y: o ? u : u - f / 2,
              width: a ? d : 2 * d,
              height: o ? f : 2 * f,
            }),
          );
        }
        var xl = (e, t, r, n) => dT(e, "xAxis", t, n),
          xs = (e, t, r, n) => dC(e, "xAxis", t, n),
          xc = (e, t, r, n) => dT(e, "yAxis", r, n),
          xu = (e, t, r, n) => dC(e, "yAxis", r, n),
          xd = n_([iM, xl, xc, xs, xu], (e, t, r, n, i) =>
            n0(e, "xAxis") ? ir(t, n, !1) : ir(r, i, !1),
          );
        function xf(e) {
          return "line" === e.type;
        }
        var xh = n_([ua, (e, t, r, n, i) => i], (e, t) =>
            e.filter(xf).find((e) => e.id === t),
          ),
          xp = n_(
            [iM, xl, xc, xs, xu, xh, xd, sg],
            (e, t, r, n, i, a, o, l) => {
              var s,
                { chartData: c, dataStartIndex: u, dataEndIndex: d } = l;
              if (
                null != a &&
                null != t &&
                null != r &&
                null != n &&
                null != i &&
                0 !== n.length &&
                0 !== i.length &&
                null != o &&
                ("horizontal" === e || "vertical" === e)
              ) {
                var { dataKey: f, data: h } = a;
                if (
                  null !=
                  (s =
                    null != h && h.length > 0
                      ? h
                      : null == c
                        ? void 0
                        : c.slice(u, d + 1))
                )
                  return (function (e) {
                    var {
                      layout: t,
                      xAxis: r,
                      yAxis: n,
                      xAxisTicks: i,
                      yAxisTicks: a,
                      dataKey: o,
                      bandSize: l,
                      displayedData: s,
                    } = e;
                    return s
                      .map((e, s) => {
                        var c = nQ(e, o);
                        if ("horizontal" === t)
                          return {
                            x: n4({
                              axis: r,
                              ticks: i,
                              bandSize: l,
                              entry: e,
                              index: s,
                            }),
                            y: N(c) ? null : n.scale(c),
                            value: c,
                            payload: e,
                          };
                        var u = N(c) ? null : r.scale(c),
                          d = n4({
                            axis: n,
                            ticks: a,
                            bandSize: l,
                            entry: e,
                            index: s,
                          });
                        return null == u || null == d
                          ? null
                          : { x: u, y: d, value: c, payload: e };
                      })
                      .filter(Boolean);
                  })({
                    layout: e,
                    xAxis: t,
                    yAxis: r,
                    xAxisTicks: n,
                    yAxisTicks: i,
                    dataKey: f,
                    bandSize: o,
                    displayedData: s,
                  });
              }
            },
          );
        function xy(e) {
          var { legendPayload: t } = e,
            r = nD(),
            n = iw(),
            i = (0, l.useRef)(null);
          return (
            (0, l.useLayoutEffect)(() => {
              n ||
                (null === i.current
                  ? r(hz(t))
                  : i.current !== t && r(hL({ prev: i.current, next: t })),
                (i.current = t));
            }, [r, n, t]),
            (0, l.useLayoutEffect)(
              () => () => {
                i.current && (r(hR(i.current)), (i.current = null));
              },
              [r],
            ),
            null
          );
        }
        var xm = (0, l.createContext)(void 0),
          xv = (e) => {
            var { id: t, type: r, children: n } = e,
              i = pI("recharts-".concat(r), t);
            return l.createElement(xm.Provider, { value: i }, n(i));
          },
          xg = (0, l.memo)((e) => {
            var t = nD(),
              r = (0, l.useRef)(null);
            return (
              (0, l.useLayoutEffect)(() => {
                (null === r.current
                  ? t(hy(e))
                  : r.current !== e && t(hm({ prev: r.current, next: e })),
                  (r.current = e));
              }, [t, e]),
              (0, l.useLayoutEffect)(
                () => () => {
                  r.current && (t(hv(r.current)), (r.current = null));
                },
                [t],
              ),
              null
            );
          }),
          xb = r(65546),
          xx = r.n(xb);
        function xw(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function xj(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? xw(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : xw(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function xO() {
          return (xO = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        var xP = (e, t, r, n, i) => {
            var a = r - n;
            return (
              "M ".concat(e, ",").concat(t) +
              "L ".concat(e + r, ",").concat(t) +
              "L ".concat(e + r - a / 2, ",").concat(t + i) +
              "L ".concat(e + r - a / 2 - n, ",").concat(t + i) +
              "L ".concat(e, ",").concat(t, " Z")
            );
          },
          xS = {
            x: 0,
            y: 0,
            upperWidth: 0,
            lowerWidth: 0,
            height: 0,
            isUpdateAnimationActive: !1,
            animationBegin: 0,
            animationDuration: 1500,
            animationEasing: "ease",
          },
          xk = (e) => {
            var t = yd(e, xS),
              {
                x: r,
                y: n,
                upperWidth: i,
                lowerWidth: a,
                height: o,
                className: s,
              } = t,
              {
                animationEasing: c,
                animationDuration: u,
                animationBegin: f,
                isUpdateAnimationActive: h,
              } = t,
              p = (0, l.useRef)(null),
              [y, m] = (0, l.useState)(-1),
              v = (0, l.useRef)(i),
              g = (0, l.useRef)(a),
              b = (0, l.useRef)(o),
              x = (0, l.useRef)(r),
              w = (0, l.useRef)(n),
              j = gA(e, "trapezoid-");
            if (
              ((0, l.useEffect)(() => {
                if (p.current && p.current.getTotalLength)
                  try {
                    var e = p.current.getTotalLength();
                    e && m(e);
                  } catch (e) {}
              }, []),
              r !== +r ||
                n !== +n ||
                i !== +i ||
                a !== +a ||
                o !== +o ||
                (0 === i && 0 === a) ||
                0 === o)
            )
              return null;
            var O = d("recharts-trapezoid", s);
            if (!h)
              return l.createElement(
                "g",
                null,
                l.createElement(
                  "path",
                  xO({}, pA(t), { className: O, d: xP(r, n, i, a, o) }),
                ),
              );
            var P = v.current,
              k = g.current,
              N = b.current,
              E = x.current,
              _ = w.current,
              A = "0px ".concat(-1 === y ? 1 : y, "px"),
              M = "".concat(y, "px 0px"),
              C = go(["strokeDasharray"], u, c);
            return l.createElement(
              g_,
              {
                animationId: j,
                key: j,
                canBegin: y > 0,
                duration: u,
                easing: c,
                isActive: h,
                begin: f,
              },
              (e) => {
                var s = S(P, i, e),
                  c = S(k, a, e),
                  u = S(N, o, e),
                  d = S(E, r, e),
                  f = S(_, n, e);
                p.current &&
                  ((v.current = s),
                  (g.current = c),
                  (b.current = u),
                  (x.current = d),
                  (w.current = f));
                var h =
                  e > 0
                    ? { transition: C, strokeDasharray: M }
                    : { strokeDasharray: A };
                return l.createElement(
                  "path",
                  xO({}, pA(t), {
                    className: O,
                    d: xP(d, f, s, c, u),
                    ref: p,
                    style: xj(xj({}, h), t.style),
                  }),
                );
              },
            );
          },
          xN = ["option", "shapeType", "propTransformer", "activeClassName"];
        function xE(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function x_(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? xE(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : xE(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function xA(e, t) {
          return x_(x_({}, t), e);
        }
        function xM(e) {
          var { shapeType: t, elementProps: r } = e;
          switch (t) {
            case "rectangle":
              return l.createElement(g$, r);
            case "trapezoid":
              return l.createElement(xk, r);
            case "sector":
              return l.createElement(gV, r);
            case "symbols":
              if ("symbols" === t) return l.createElement(bO, r);
              break;
            case "curve":
              return l.createElement(v7, r);
            default:
              return null;
          }
        }
        function xC(e) {
          var t,
            {
              option: r,
              shapeType: n,
              propTransformer: i = xA,
              activeClassName: a = "recharts-active-shape",
            } = e,
            o = (function (e, t) {
              if (null == e) return {};
              var r,
                n,
                i = (function (e, t) {
                  if (null == e) return {};
                  var r = {};
                  for (var n in e)
                    if ({}.hasOwnProperty.call(e, n)) {
                      if (-1 !== t.indexOf(n)) continue;
                      r[n] = e[n];
                    }
                  return r;
                })(e, t);
              if (Object.getOwnPropertySymbols) {
                var a = Object.getOwnPropertySymbols(e);
                for (n = 0; n < a.length; n++)
                  ((r = a[n]),
                    -1 === t.indexOf(r) &&
                      {}.propertyIsEnumerable.call(e, r) &&
                      (i[r] = e[r]));
              }
              return i;
            })(e, xN);
          if ((0, l.isValidElement)(r))
            t = (0, l.cloneElement)(
              r,
              x_(x_({}, o), (0, l.isValidElement)(r) ? r.props : r),
            );
          else if ("function" == typeof r) t = r(o, o.index);
          else if (xx()(r) && "boolean" != typeof r) {
            var s = i(r, o);
            t = l.createElement(xM, { shapeType: n, elementProps: s });
          } else t = l.createElement(xM, { shapeType: n, elementProps: o });
          return o.isActive ? l.createElement(yD, { className: a }, t) : t;
        }
        var xT = ["id"],
          xD = ["type", "layout", "connectNulls", "needClip", "shape"],
          xI = [
            "activeDot",
            "animateNewValues",
            "animationBegin",
            "animationDuration",
            "animationEasing",
            "connectNulls",
            "dot",
            "hide",
            "isAnimationActive",
            "label",
            "legendType",
            "xAxisId",
            "yAxisId",
            "id",
          ];
        function xz() {
          return (xz = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var r = arguments[t];
                  for (var n in r)
                    ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
                }
                return e;
              }).apply(null, arguments);
        }
        function xL(e, t) {
          var r = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            (t &&
              (n = n.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              r.push.apply(r, n));
          }
          return r;
        }
        function xR(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? xL(Object(r), !0).forEach(function (t) {
                  var n, i;
                  ((n = t),
                    (i = r[t]),
                    (n = (function (e) {
                      var t = (function (e, t) {
                        if ("object" != typeof e || !e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                          var n = r.call(e, t || "default");
                          if ("object" != typeof n) return n;
                          throw TypeError(
                            "@@toPrimitive must return a primitive value.",
                          );
                        }
                        return ("string" === t ? String : Number)(e);
                      })(e, "string");
                      return "symbol" == typeof t ? t : t + "";
                    })(n)) in e
                      ? Object.defineProperty(e, n, {
                          value: i,
                          enumerable: !0,
                          configurable: !0,
                          writable: !0,
                        })
                      : (e[n] = i));
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r),
                  )
                : xL(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t),
                    );
                  });
          }
          return e;
        }
        function x$(e, t) {
          if (null == e) return {};
          var r,
            n,
            i = (function (e, t) {
              if (null == e) return {};
              var r = {};
              for (var n in e)
                if ({}.hasOwnProperty.call(e, n)) {
                  if (-1 !== t.indexOf(n)) continue;
                  r[n] = e[n];
                }
              return r;
            })(e, t);
          if (Object.getOwnPropertySymbols) {
            var a = Object.getOwnPropertySymbols(e);
            for (n = 0; n < a.length; n++)
              ((r = a[n]),
                -1 === t.indexOf(r) &&
                  {}.propertyIsEnumerable.call(e, r) &&
                  (i[r] = e[r]));
          }
          return i;
        }
        var xU = (e) => {
            var { dataKey: t, name: r, stroke: n, legendType: i, hide: a } = e;
            return [
              {
                inactive: a,
                dataKey: t,
                type: i,
                color: n,
                value: ia(r, t),
                payload: e,
              },
            ];
          },
          xF = l.memo((e) => {
            var {
                dataKey: t,
                data: r,
                stroke: n,
                strokeWidth: i,
                fill: a,
                name: o,
                hide: s,
                unit: c,
                tooltipType: u,
              } = e,
              d = {
                dataDefinedOnItem: r,
                positions: void 0,
                settings: {
                  stroke: n,
                  strokeWidth: i,
                  fill: a,
                  dataKey: t,
                  nameKey: void 0,
                  name: ia(o, t),
                  hide: s,
                  type: u,
                  color: n,
                  unit: c,
                },
              };
            return l.createElement(xt, { tooltipEntrySettings: d });
          }),
          xB = (e, t) => "".concat(t, "px ").concat(e - t, "px"),
          xK = (e, t, r) => {
            var n = r.reduce((e, t) => e + t);
            if (!n) return xB(t, e);
            for (
              var i = e % n, a = t - e, o = [], l = 0, s = 0;
              l < r.length;
              s += r[l], ++l
            )
              if (s + r[l] > i) {
                o = [...r.slice(0, l), i - s];
                break;
              }
            var c = o.length % 2 == 0 ? [0, a] : [a];
            return [
              ...(function (e, t) {
                for (
                  var r = e.length % 2 != 0 ? [...e, 0] : e, n = [], i = 0;
                  i < t;
                  ++i
                )
                  n = [...n, ...r];
                return n;
              })(r, Math.floor(e / n)),
              ...o,
              ...c,
            ]
              .map((e) => "".concat(e, "px"))
              .join(", ");
          };
        function xW(e) {
          var { clipPathId: t, points: r, props: n } = e,
            { dot: i, dataKey: a, needClip: o } = n,
            { id: s } = n,
            c = pE(x$(n, xT));
          return l.createElement(b4, {
            points: r,
            dot: i,
            className: "recharts-line-dots",
            dotClassName: "recharts-line-dot",
            dataKey: a,
            baseProps: c,
            needClip: o,
            clipPathId: t,
          });
        }
        function xH(e) {
          var { showLabels: t, children: r, points: n } = e,
            i = (0, l.useMemo)(
              () =>
                null == n
                  ? void 0
                  : n.map((e) => {
                      var t,
                        r,
                        n = {
                          x: null !== (t = e.x) && void 0 !== t ? t : 0,
                          y: null !== (r = e.y) && void 0 !== r ? r : 0,
                          width: 0,
                          lowerWidth: 0,
                          upperWidth: 0,
                          height: 0,
                        };
                      return xR(
                        xR({}, n),
                        {},
                        {
                          value: e.value,
                          payload: e.payload,
                          viewBox: n,
                          parentViewBox: void 0,
                          fill: void 0,
                        },
                      );
                    }),
              [n],
            );
          return l.createElement(bZ, { value: t ? i : void 0 }, r);
        }
        function xq(e) {
          var {
              clipPathId: t,
              pathRef: r,
              points: n,
              strokeDasharray: i,
              props: a,
            } = e,
            { type: o, layout: s, connectNulls: c, needClip: u, shape: d } = a,
            f = xR(
              xR({}, pA(x$(a, xD))),
              {},
              {
                fill: "none",
                className: "recharts-line-curve",
                clipPath: u ? "url(#clipPath-".concat(t, ")") : void 0,
                points: n,
                type: o,
                layout: s,
                connectNulls: c,
                strokeDasharray: null != i ? i : a.strokeDasharray,
              },
            );
          return l.createElement(
            l.Fragment,
            null,
            (null == n ? void 0 : n.length) > 1 &&
              l.createElement(
                xC,
                xz({ shapeType: "curve", option: d }, f, { pathRef: r }),
              ),
            l.createElement(xW, { points: n, clipPathId: t, props: a }),
          );
        }
        function xV(e) {
          var {
              clipPathId: t,
              props: r,
              pathRef: n,
              previousPointsRef: i,
              longestAnimatedLengthRef: a,
            } = e,
            {
              points: o,
              strokeDasharray: s,
              isAnimationActive: c,
              animationBegin: u,
              animationDuration: d,
              animationEasing: f,
              animateNewValues: h,
              width: p,
              height: y,
              onAnimationEnd: m,
              onAnimationStart: v,
            } = r,
            g = i.current,
            b = gA(o, "recharts-line-"),
            x = (0, l.useRef)(b),
            [w, j] = (0, l.useState)(!1),
            O = (0, l.useCallback)(() => {
              ("function" == typeof m && m(), j(!1));
            }, [m]),
            P = (0, l.useCallback)(() => {
              ("function" == typeof v && v(), j(!0));
            }, [v]),
            k = (function (e) {
              try {
                return (e && e.getTotalLength && e.getTotalLength()) || 0;
              } catch (e) {
                return 0;
              }
            })(n.current),
            N = (0, l.useRef)(0);
          x.current !== b && ((N.current = a.current), (x.current = b));
          var E = N.current;
          return l.createElement(
            xH,
            { points: o, showLabels: !w },
            r.children,
            l.createElement(
              g_,
              {
                animationId: b,
                begin: u,
                duration: d,
                isActive: c,
                easing: f,
                onAnimationEnd: O,
                onAnimationStart: P,
                key: b,
              },
              (e) => {
                var u,
                  d = Math.min(S(E, k + E, e), k);
                if (
                  ((u = c
                    ? s
                      ? xK(
                          d,
                          k,
                          ""
                            .concat(s)
                            .split(/[,\s]+/gim)
                            .map((e) => parseFloat(e)),
                        )
                      : xB(k, d)
                    : null == s
                      ? void 0
                      : String(s)),
                  e > 0 &&
                    k > 0 &&
                    ((i.current = o), (a.current = Math.max(a.current, d))),
                  g)
                ) {
                  var f = g.length / o.length,
                    m =
                      1 === e
                        ? o
                        : o.map((t, r) => {
                            var n = Math.floor(r * f);
                            if (g[n]) {
                              var i = g[n];
                              return xR(
                                xR({}, t),
                                {},
                                { x: S(i.x, t.x, e), y: S(i.y, t.y, e) },
                              );
                            }
                            return h
                              ? xR(
                                  xR({}, t),
                                  {},
                                  { x: S(2 * p, t.x, e), y: S(y / 2, t.y, e) },
                                )
                              : xR(xR({}, t), {}, { x: t.x, y: t.y });
                          });
                  return (
                    (i.current = m),
                    l.createElement(xq, {
                      props: r,
                      points: m,
                      clipPathId: t,
                      pathRef: n,
                      strokeDasharray: u,
                    })
                  );
                }
                return l.createElement(xq, {
                  props: r,
                  points: o,
                  clipPathId: t,
                  pathRef: n,
                  strokeDasharray: u,
                });
              },
            ),
            l.createElement(bX, { label: r.label }),
          );
        }
        function xZ(e) {
          var { clipPathId: t, props: r } = e,
            n = (0, l.useRef)(null),
            i = (0, l.useRef)(0),
            a = (0, l.useRef)(null);
          return l.createElement(xV, {
            props: r,
            clipPathId: t,
            previousPointsRef: n,
            longestAnimatedLengthRef: i,
            pathRef: a,
          });
        }
        var xY = (e, t) => {
          var r, n;
          return {
            x: null !== (r = e.x) && void 0 !== r ? r : void 0,
            y: null !== (n = e.y) && void 0 !== n ? n : void 0,
            value: e.value,
            errorVal: nQ(e.payload, t),
          };
        };
        class xG extends l.Component {
          render() {
            var {
              hide: e,
              dot: t,
              points: r,
              className: n,
              xAxisId: i,
              yAxisId: a,
              top: o,
              left: s,
              width: c,
              height: u,
              id: f,
              needClip: h,
              zIndex: p,
            } = this.props;
            if (e) return null;
            var y = d("recharts-line", n),
              { r: m, strokeWidth: v } = (function (e) {
                var t = p_(e);
                if (null != t) {
                  var { r, strokeWidth: n } = t,
                    i = Number(r),
                    a = Number(n);
                  return (
                    (Number.isNaN(i) || i < 0) && (i = 3),
                    (Number.isNaN(a) || a < 0) && (a = 2),
                    { r: i, strokeWidth: a }
                  );
                }
                return { r: 3, strokeWidth: 2 };
              })(t),
              g = b0(t),
              b = 2 * m + v,
              x = h
                ? "url(#clipPath-".concat(g ? "" : "dots-").concat(f, ")")
                : void 0;
            return l.createElement(
              y4,
              { zIndex: p },
              l.createElement(
                yD,
                { className: y },
                h &&
                  l.createElement(
                    "defs",
                    null,
                    l.createElement(xo, {
                      clipPathId: f,
                      xAxisId: i,
                      yAxisId: a,
                    }),
                    !g &&
                      l.createElement(
                        "clipPath",
                        { id: "clipPath-dots-".concat(f) },
                        l.createElement("rect", {
                          x: s - b / 2,
                          y: o - b / 2,
                          width: c + b,
                          height: u + b,
                        }),
                      ),
                  ),
                l.createElement(
                  xi,
                  {
                    xAxisId: i,
                    yAxisId: a,
                    data: r,
                    dataPointFormatter: xY,
                    errorBarOffset: 0,
                  },
                  l.createElement(xZ, { props: this.props, clipPathId: f }),
                ),
              ),
              l.createElement(xe, {
                activeDot: this.props.activeDot,
                points: r,
                mainColor: this.props.stroke,
                itemDataKey: this.props.dataKey,
                clipPath: x,
              }),
            );
          }
        }
        var xX = {
          activeDot: !0,
          animateNewValues: !0,
          animationBegin: 0,
          animationDuration: 1500,
          animationEasing: "ease",
          connectNulls: !1,
          dot: !0,
          fill: "#fff",
          hide: !1,
          isAnimationActive: "auto",
          label: !1,
          legendType: "line",
          stroke: "#3182bd",
          strokeWidth: 1,
          xAxisId: 0,
          yAxisId: 0,
          zIndex: cE.line,
          type: "linear",
        };
        function xQ(e) {
          var t = yd(e, xX),
            {
              activeDot: r,
              animateNewValues: n,
              animationBegin: i,
              animationDuration: a,
              animationEasing: o,
              connectNulls: s,
              dot: c,
              hide: u,
              isAnimationActive: d,
              label: f,
              legendType: h,
              xAxisId: p,
              yAxisId: y,
              id: m,
            } = t,
            v = x$(t, xI),
            { needClip: g } = xa(p, y),
            b = yi(),
            x = iC(),
            w = iw(),
            j = nR((e) => xp(e, p, y, w, m));
          if (
            ("horizontal" !== x && "vertical" !== x) ||
            null == j ||
            null == b
          )
            return null;
          var { height: O, width: P, x: S, y: k } = b;
          return l.createElement(
            xG,
            xz({}, v, {
              id: m,
              connectNulls: s,
              dot: c,
              activeDot: r,
              animateNewValues: n,
              animationBegin: i,
              animationDuration: a,
              animationEasing: o,
              isAnimationActive: d,
              hide: u,
              label: f,
              legendType: h,
              xAxisId: p,
              yAxisId: y,
              points: j,
              layout: x,
              height: O,
              width: P,
              left: S,
              top: k,
              needClip: g,
            }),
          );
        }
        var xJ = l.memo(function (e) {
          var t = yd(e, xX),
            r = iw();
          return l.createElement(xv, { id: t.id, type: "line" }, (e) =>
            l.createElement(
              l.Fragment,
              null,
              l.createElement(xy, { legendPayload: xU(t) }),
              l.createElement(xF, {
                dataKey: t.dataKey,
                data: t.data,
                stroke: t.stroke,
                strokeWidth: t.strokeWidth,
                fill: t.fill,
                name: t.name,
                hide: t.hide,
                unit: t.unit,
                tooltipType: t.tooltipType,
              }),
              l.createElement(xg, {
                type: "line",
                id: e,
                data: t.data,
                xAxisId: t.xAxisId,
                yAxisId: t.yAxisId,
                zAxisId: 0,
                dataKey: t.dataKey,
                hide: t.hide,
                isPanorama: r,
              }),
              l.createElement(xQ, xz({}, t, { id: e })),
            ),
          );
        }, pb);
        function x0({ token: e }) {
          let [t, r] = (0, l.useState)([]),
            [n, i] = (0, l.useState)(!0),
            a = async () => {
              try {
                let t = await fetch(
                  "https://api.care2connects.org/health/history?limit=50",
                  { headers: { Authorization: `Bearer ${e}` } },
                );
                if (t.ok) {
                  let e = await t.json();
                  r(e.history || []);
                }
              } catch (e) {
                console.error("Failed to fetch health history:", e);
              } finally {
                i(!1);
              }
            };
          if (
            ((0, l.useEffect)(() => {
              a();
              let e = setInterval(a, 3e4);
              return () => clearInterval(e);
            }, [e]),
            n)
          )
            return o.jsx("div", {
              className:
                "bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center",
              children: o.jsx("div", {
                className: "text-gray-500",
                children: "Loading health data...",
              }),
            });
          if (0 === t.length)
            return o.jsx("div", {
              className:
                "bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center",
              children: o.jsx("div", {
                className: "text-gray-500",
                children: "No health data available",
              }),
            });
          let s = t
            .slice()
            .reverse()
            .map((e, t) => ({
              index: t,
              time: new Date(e.timestamp).toLocaleTimeString(),
              ready: "ready" === e.status ? 1 : 0,
              degraded: "degraded" === e.status ? 1 : 0,
              dbOk: e.services?.db?.ok ? 1 : 0,
              storageOk: e.services?.storage?.ok ? 1 : 0,
            }));
          return (0, o.jsxs)("div", {
            className: "bg-white rounded-lg shadow p-6",
            children: [
              o.jsx("h3", {
                className: "text-lg font-semibold text-gray-900 mb-4",
                children: "Health Status Timeline",
              }),
              o.jsx(V, {
                width: "100%",
                height: 300,
                children: (0, o.jsxs)(ym, {
                  data: s,
                  children: [
                    o.jsx(mY, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
                    o.jsx(m8, {
                      dataKey: "time",
                      stroke: "#6b7280",
                      tick: { fontSize: 12 },
                      interval: "preserveStartEnd",
                    }),
                    o.jsx(vo, {
                      stroke: "#6b7280",
                      tick: { fontSize: 12 },
                      domain: [0, 1],
                      ticks: [0, 1],
                      tickFormatter: (e) => (1 === e ? "OK" : "DOWN"),
                    }),
                    o.jsx(g9, {
                      contentStyle: {
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                      },
                      formatter: (e) => (1 === e ? "OK" : "DOWN"),
                    }),
                    o.jsx(b$, {}),
                    o.jsx(xJ, {
                      type: "stepAfter",
                      dataKey: "ready",
                      stroke: "#10b981",
                      strokeWidth: 2,
                      name: "Ready",
                      dot: !1,
                    }),
                    o.jsx(xJ, {
                      type: "stepAfter",
                      dataKey: "degraded",
                      stroke: "#f59e0b",
                      strokeWidth: 2,
                      name: "Degraded",
                      dot: !1,
                    }),
                    o.jsx(xJ, {
                      type: "stepAfter",
                      dataKey: "dbOk",
                      stroke: "#3b82f6",
                      strokeWidth: 1,
                      name: "Database",
                      dot: !1,
                    }),
                    o.jsx(xJ, {
                      type: "stepAfter",
                      dataKey: "storageOk",
                      stroke: "#8b5cf6",
                      strokeWidth: 1,
                      name: "Storage",
                      dot: !1,
                    }),
                  ],
                }),
              }),
              (0, o.jsxs)("div", {
                className: "mt-4 grid grid-cols-4 gap-4 text-sm",
                children: [
                  (0, o.jsxs)("div", {
                    className: "text-center",
                    children: [
                      o.jsx("div", {
                        className: "text-2xl font-bold text-green-600",
                        children: s.filter((e) => 1 === e.ready).length,
                      }),
                      o.jsx("div", {
                        className: "text-gray-600",
                        children: "Ready",
                      }),
                    ],
                  }),
                  (0, o.jsxs)("div", {
                    className: "text-center",
                    children: [
                      o.jsx("div", {
                        className: "text-2xl font-bold text-yellow-600",
                        children: s.filter((e) => 1 === e.degraded).length,
                      }),
                      o.jsx("div", {
                        className: "text-gray-600",
                        children: "Degraded",
                      }),
                    ],
                  }),
                  (0, o.jsxs)("div", {
                    className: "text-center",
                    children: [
                      o.jsx("div", {
                        className: "text-2xl font-bold text-blue-600",
                        children: s.filter((e) => 1 === e.dbOk).length,
                      }),
                      o.jsx("div", {
                        className: "text-gray-600",
                        children: "DB OK",
                      }),
                    ],
                  }),
                  (0, o.jsxs)("div", {
                    className: "text-center",
                    children: [
                      o.jsx("div", {
                        className: "text-2xl font-bold text-purple-600",
                        children: s.filter((e) => 1 === e.storageOk).length,
                      }),
                      o.jsx("div", {
                        className: "text-gray-600",
                        children: "Storage OK",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        }
        xJ.displayName = "Line";
        var x1 = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let x2 = (0, x1.Z)("Cloud", [
            [
              "path",
              {
                d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",
                key: "p7xjir",
              },
            ],
          ]),
          x3 = "careconnect.publicTunnelUrl";
        function x6({ token: e }) {
          let [t, r] = (0, l.useState)(null),
            [n, i] = (0, l.useState)(!0),
            [a, s] = (0, l.useState)(null),
            [c, u] = (0, l.useState)(""),
            [d, f] = (0, l.useState)(!1),
            [h, p] = (0, l.useState)(null);
          ((0, l.useEffect)(() => {
            let e = localStorage.getItem(x3);
            e && u(e);
          }, []),
            (0, l.useEffect)(() => {
              (f(
                (function (e) {
                  if (!e || !e.startsWith("https://")) return !1;
                  try {
                    return (new URL(e), !0);
                  } catch {
                    return !1;
                  }
                })(c),
              ),
                c ? localStorage.setItem(x3, c) : localStorage.removeItem(x3));
            }, [c]),
            (0, l.useEffect)(() => {
              let t = async () => {
                (i(!0), s(null));
                try {
                  let t = {};
                  e && (t.Authorization = `Bearer ${e}`);
                  let n = await fetch(
                    "https://api.care2connects.org/admin/setup/tunnel/cloudflare",
                    { headers: t },
                  );
                  if (!n.ok) throw Error("Failed to load tunnel guidance");
                  r(await n.json());
                } catch (e) {
                  s(String(e.message || e));
                } finally {
                  i(!1);
                }
              };
              t();
            }, [e]));
          let y = async (e) => {
              try {
                await navigator.clipboard.writeText(e);
              } catch (e) {
                console.error("Copy failed", e);
              }
            },
            m = async () => {
              if (!e) return p({ allowed: !1, reason: "Not authenticated" });
              p({ status: "pending" });
              try {
                let t = await fetch(
                    "https://api.care2connects.org/admin/setup/tunnel/cloudflare/preflight",
                    {
                      method: "POST",
                      headers: { Authorization: `Bearer ${e}` },
                    },
                  ),
                  r = await t.json();
                p(r);
              } catch (e) {
                p({ allowed: !1, reason: String(e) });
              }
            },
            v = "/api/payments/stripe-webhook";
          return (0, o.jsxs)("div", {
            className: "bg-white rounded-lg shadow p-6",
            children: [
              o.jsx("div", {
                className: "flex items-center justify-between mb-4",
                children: (0, o.jsxs)("div", {
                  className: "flex items-center gap-3",
                  children: [
                    o.jsx(x2, { className: "text-blue-600" }),
                    o.jsx("h3", {
                      className: "text-lg font-semibold",
                      children: "Public Webhook URL (Cloudflare Tunnel)",
                    }),
                  ],
                }),
              }),
              n
                ? o.jsx("div", {
                    className: "text-sm text-gray-600",
                    children: "Loading tunnel guidance...",
                  })
                : a
                  ? o.jsx("div", {
                      className: "text-sm text-red-600",
                      children: a,
                    })
                  : t &&
                    (0, o.jsxs)("div", {
                      className: "space-y-3",
                      children: [
                        (0, o.jsxs)("div", {
                          className: "text-sm text-gray-700",
                          children: [
                            "Backend port: ",
                            o.jsx("span", {
                              className: "font-medium",
                              children: t.backendPort,
                            }),
                          ],
                        }),
                        (0, o.jsxs)("div", {
                          className: "text-sm text-gray-700",
                          children: [
                            "Local target: ",
                            o.jsx("span", {
                              className: "font-medium",
                              children: t.localTarget,
                            }),
                          ],
                        }),
                        (0, o.jsxs)("div", {
                          className: "text-sm text-gray-700",
                          children: [
                            "Webhook path: ",
                            o.jsx("span", {
                              className: "font-medium",
                              children: v,
                            }),
                          ],
                        }),
                        (0, o.jsxs)("div", {
                          className: "grid grid-cols-1 md:grid-cols-2 gap-2",
                          children: [
                            o.jsx("div", {
                              className: "flex items-center gap-2",
                              children: o.jsx("button", {
                                onClick: () => y(t.installUrl),
                                className:
                                  "px-3 py-1 bg-gray-100 rounded text-sm",
                                children: "Copy cloudflared install URL",
                              }),
                            }),
                            o.jsx("div", {
                              className: "flex items-center gap-2",
                              children: o.jsx("button", {
                                onClick: () => y(t.quickTunnelCommand),
                                className:
                                  "px-3 py-1 bg-gray-100 rounded text-sm",
                                children: "Copy quick tunnel command",
                              }),
                            }),
                          ],
                        }),
                        (0, o.jsxs)("div", {
                          className: "pt-2",
                          children: [
                            o.jsx("label", {
                              className: "text-sm text-gray-700",
                              children: "Public tunnel URL",
                            }),
                            (0, o.jsxs)("div", {
                              className: "flex gap-2 mt-1",
                              children: [
                                o.jsx("input", {
                                  "aria-label": "public-tunnel-url",
                                  value: c,
                                  onChange: (e) => u(e.target.value),
                                  placeholder: "https://xxxx.trycloudflare.com",
                                  className: "flex-1 border rounded px-3 py-2",
                                }),
                                o.jsx("button", {
                                  onClick: () => {
                                    (u(""), localStorage.removeItem(x3));
                                  },
                                  className: "px-3 py-2 bg-gray-100 rounded",
                                  children: "Clear",
                                }),
                              ],
                            }),
                            !d &&
                              c &&
                              o.jsx("div", {
                                className: "text-xs text-red-600 mt-1",
                                children:
                                  "Invalid public tunnel URL — must start with https:// and be a valid URL",
                              }),
                          ],
                        }),
                        (0, o.jsxs)("div", {
                          children: [
                            o.jsx("label", {
                              className: "text-sm text-gray-700",
                              children: "Computed Stripe webhook endpoint",
                            }),
                            (0, o.jsxs)("div", {
                              className: "mt-1 flex items-center gap-2",
                              children: [
                                o.jsx("div", {
                                  className:
                                    "flex-1 bg-gray-50 border rounded px-3 py-2 text-sm break-words",
                                  children: d
                                    ? `${c.replace(/\/$/, "")}${v}`
                                    : "Paste a valid public tunnel URL to compute the Stripe endpoint.",
                                }),
                                o.jsx("button", {
                                  onClick: () =>
                                    d && y(`${c.replace(/\/$/, "")}${v}`),
                                  className: "px-3 py-2 bg-gray-100 rounded",
                                  children: "Copy",
                                }),
                              ],
                            }),
                            o.jsx("div", {
                              className: "text-xs text-gray-500 mt-2",
                              children:
                                "Paste this into Stripe Dashboard / Workbench as your webhook endpoint.",
                            }),
                          ],
                        }),
                        (0, o.jsxs)("div", {
                          className: "pt-2",
                          children: [
                            o.jsx("div", {
                              className: "text-sm text-gray-700",
                              children: "Stripe CLI fallback command",
                            }),
                            (0, o.jsxs)("div", {
                              className: "mt-1 flex items-center gap-2",
                              children: [
                                o.jsx("div", {
                                  className:
                                    "flex-1 bg-gray-50 border rounded px-3 py-2 text-sm",
                                  children: `stripe listen --forward-to ${t.localTarget}${v}`,
                                }),
                                o.jsx("button", {
                                  onClick: () =>
                                    y(
                                      `stripe listen --forward-to ${t.localTarget}${v}`,
                                    ),
                                  className: "px-3 py-2 bg-gray-100 rounded",
                                  children: "Copy",
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, o.jsxs)("div", {
                          className: "pt-4 border-t pt-4",
                          children: [
                            (0, o.jsxs)("div", {
                              className: "flex items-center justify-between",
                              children: [
                                o.jsx("div", {
                                  className: "text-sm text-gray-700",
                                  children: "Quick check",
                                }),
                                o.jsx("button", {
                                  onClick: m,
                                  className:
                                    "px-3 py-1 bg-blue-600 text-white rounded text-sm",
                                  children: "Check cloudflared installation",
                                }),
                              ],
                            }),
                            h &&
                              (0, o.jsxs)("div", {
                                className: "mt-2 text-sm",
                                children: [
                                  !1 === h.allowed &&
                                    o.jsx("div", {
                                      className: "text-gray-600",
                                      children:
                                        "ALLOW_SYSTEM_COMMANDS is disabled. Install manually using the link above.",
                                    }),
                                  !0 === h.cloudflaredInstalled &&
                                    (0, o.jsxs)("div", {
                                      className: "text-green-600",
                                      children: [
                                        "cloudflared installed: ",
                                        h.version,
                                      ],
                                    }),
                                  !1 === h.cloudflaredInstalled &&
                                    (0, o.jsxs)("div", {
                                      className: "text-red-600",
                                      children: [
                                        "cloudflared not found: ",
                                        h.reason || "unknown",
                                      ],
                                    }),
                                  "pending" === h.status &&
                                    o.jsx("div", {
                                      className: "text-gray-600",
                                      children: "Checking...",
                                    }),
                                ],
                              }),
                          ],
                        }),
                      ],
                    }),
            ],
          });
        }
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let x5 = (0, x1.Z)("Globe", [
            ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
            [
              "path",
              {
                d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",
                key: "13o1zl",
              },
            ],
            ["path", { d: "M2 12h20", key: "9i4pu4" }],
          ]),
          x4 = (0, x1.Z)("RefreshCw", [
            [
              "path",
              {
                d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
                key: "v9h5vc",
              },
            ],
            ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
            [
              "path",
              {
                d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
                key: "3uifl3",
              },
            ],
            ["path", { d: "M8 16H3v5", key: "1cv678" }],
          ]),
          x7 = (0, x1.Z)("Wifi", [
            ["path", { d: "M5 13a10 10 0 0 1 14 0", key: "6v8j51" }],
            ["path", { d: "M8.5 16.5a5 5 0 0 1 7 0", key: "sej527" }],
            ["path", { d: "M2 8.82a15 15 0 0 1 20 0", key: "dnpr2z" }],
            [
              "line",
              { x1: "12", x2: "12.01", y1: "20", y2: "20", key: "of4bc4" },
            ],
          ]);
        var x8 = r(81165);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let x9 = (0, x1.Z)("XCircle", [
            ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
            ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
            ["path", { d: "m9 9 6 6", key: "z0biqf" }],
          ]),
          we = (0, x1.Z)("AlertTriangle", [
            [
              "path",
              {
                d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
                key: "c3ski4",
              },
            ],
            ["path", { d: "M12 9v4", key: "juzpu7" }],
            ["path", { d: "M12 17h.01", key: "p32p05" }],
          ]);
        var wt = r(3228),
          wr = r(64542);
        function wn({ token: e }) {
          let [t, r] = (0, l.useState)(null),
            [n, i] = (0, l.useState)(null),
            [a, s] = (0, l.useState)(!1),
            [c, u] = (0, l.useState)(!1),
            [d, f] = (0, l.useState)(!1),
            [h, p] = (0, l.useState)(null);
          (0, l.useEffect)(() => {
            e && y();
          }, [e]);
          let y = async () => {
              if (e) {
                s(!0);
                try {
                  let t = await fetch(
                    "https://api.care2connects.org/admin/setup/connectivity/status",
                    { headers: { Authorization: `Bearer ${e}` } },
                  );
                  t.ok
                    ? r(await t.json())
                    : console.error(
                        "Failed to load connectivity status:",
                        t.statusText,
                      );
                } catch (e) {
                  console.error("Error loading connectivity status:", e);
                } finally {
                  s(!1);
                }
              }
            },
            m = async () => {
              if (e) {
                u(!0);
                try {
                  let t = await fetch(
                    "https://api.care2connects.org/admin/setup/connectivity/test",
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${e}`,
                        "Content-Type": "application/json",
                      },
                    },
                  );
                  t.ok
                    ? (i(await t.json()), await y())
                    : console.error(
                        "Failed to run connectivity test:",
                        t.statusText,
                      );
                } catch (e) {
                  console.error("Error running connectivity test:", e);
                } finally {
                  u(!1);
                }
              }
            },
            v = async (e, t) => {
              try {
                (await navigator.clipboard.writeText(e),
                  p(t),
                  setTimeout(() => p(null), 2e3));
              } catch (e) {
                console.error("Failed to copy to clipboard:", e);
              }
            },
            g = (() => {
              if (!t?.dnsChecks) return { success: !1, message: "No DNS data" };
              let e = t.dnsChecks.find(
                  (e) =>
                    !e.resolver.includes("8.8.8.8") &&
                    !e.resolver.includes("1.1.1.1"),
                ),
                r = t.dnsChecks.find((e) => e.resolver.includes("8.8.8.8")),
                n = t.dnsChecks.find((e) => e.resolver.includes("1.1.1.1"));
              return e?.success
                ? { success: !0, message: "Local DNS resolved" }
                : r?.success || n?.success
                  ? {
                      success: !0,
                      message: "Global DNS working (local cache pending)",
                    }
                  : { success: !1, message: "DNS resolution failed" };
            })(),
            b = (() => {
              let e = [];
              return (
                t?.publicUrl &&
                  e.push({
                    label: "Production Webhook URL",
                    url: `${t.publicUrl}/api/payments/stripe-webhook`,
                    type: "production",
                  }),
                t?.tunnelStatus.lastKnownUrl &&
                  e.push({
                    label: "Temporary Tunnel URL",
                    url: `${t.tunnelStatus.lastKnownUrl}/api/payments/stripe-webhook`,
                    type: "temporary",
                  }),
                e
              );
            })();
          return (0, o.jsxs)("div", {
            className: "bg-white rounded-lg shadow",
            children: [
              o.jsx("div", {
                className:
                  "p-6 cursor-pointer hover:bg-gray-50 transition-colors",
                onClick: () => f(!d),
                children: (0, o.jsxs)("div", {
                  className: "flex items-center justify-between",
                  children: [
                    (0, o.jsxs)("div", {
                      className: "flex items-center gap-3",
                      children: [
                        o.jsx("div", {
                          className: `p-2 rounded-full ${g.success && t?.tlsStatus.success !== !1 ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`,
                          children: o.jsx(x5, { size: 24 }),
                        }),
                        (0, o.jsxs)("div", {
                          children: [
                            o.jsx("h3", {
                              className: "text-lg font-semibold text-gray-900",
                              children: "Connectivity",
                            }),
                            o.jsx("p", {
                              className: "text-sm text-gray-500",
                              children: g.message,
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, o.jsxs)("div", {
                      className: "flex items-center gap-2",
                      children: [
                        (0, o.jsxs)("button", {
                          onClick: (e) => {
                            (e.stopPropagation(), m());
                          },
                          disabled: c || a,
                          className:
                            "text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1",
                          children: [
                            c
                              ? o.jsx(x4, {
                                  className: "animate-spin",
                                  size: 14,
                                })
                              : o.jsx(x7, { size: 14 }),
                            c ? "Testing..." : "Test",
                          ],
                        }),
                        o.jsx("span", {
                          className: "text-gray-400 text-sm",
                          children: d ? "▼" : "▶",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              d &&
                o.jsx("div", {
                  className: "px-6 pb-6 border-t border-gray-100",
                  children: (0, o.jsxs)("div", {
                    className: "space-y-6",
                    children: [
                      (0, o.jsxs)("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                        children: [
                          (0, o.jsxs)("div", {
                            children: [
                              o.jsx("h4", {
                                className: "font-medium text-gray-900 mb-2",
                                children: "Domain Configuration",
                              }),
                              (0, o.jsxs)("div", {
                                className: "space-y-1 text-sm",
                                children: [
                                  (0, o.jsxs)("div", {
                                    children: [
                                      "Domain: ",
                                      o.jsx("span", {
                                        className: "font-mono",
                                        children: t?.domain || "Not configured",
                                      }),
                                    ],
                                  }),
                                  (0, o.jsxs)("div", {
                                    children: [
                                      "Backend Port: ",
                                      o.jsx("span", {
                                        className: "font-mono",
                                        children: t?.backendPort,
                                      }),
                                    ],
                                  }),
                                  (0, o.jsxs)("div", {
                                    children: [
                                      "Public URL: ",
                                      o.jsx("span", {
                                        className: "font-mono",
                                        children: t?.publicUrl || "Not set",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          (0, o.jsxs)("div", {
                            children: [
                              o.jsx("h4", {
                                className: "font-medium text-gray-900 mb-2",
                                children: "SSL/TLS Status",
                              }),
                              o.jsx("div", {
                                className: "flex items-center gap-2",
                                children: t?.tlsStatus.enabled
                                  ? t.tlsStatus.success
                                    ? (0, o.jsxs)(o.Fragment, {
                                        children: [
                                          o.jsx(x8.Z, {
                                            className: "text-green-600",
                                            size: 16,
                                          }),
                                          " ",
                                          o.jsx("span", {
                                            className: "text-sm",
                                            children: "Valid certificate",
                                          }),
                                        ],
                                      })
                                    : (0, o.jsxs)(o.Fragment, {
                                        children: [
                                          o.jsx(x9, {
                                            className: "text-red-600",
                                            size: 16,
                                          }),
                                          " ",
                                          o.jsx("span", {
                                            className: "text-sm",
                                            children: "Certificate error",
                                          }),
                                        ],
                                      })
                                  : (0, o.jsxs)(o.Fragment, {
                                      children: [
                                        o.jsx(we, {
                                          className: "text-yellow-600",
                                          size: 16,
                                        }),
                                        " ",
                                        o.jsx("span", {
                                          className: "text-sm",
                                          children: "No HTTPS configured",
                                        }),
                                      ],
                                    }),
                              }),
                              t?.tlsStatus.error &&
                                o.jsx("div", {
                                  className: "text-xs text-red-600 mt-1",
                                  children: t.tlsStatus.error,
                                }),
                            ],
                          }),
                        ],
                      }),
                      (0, o.jsxs)("div", {
                        children: [
                          o.jsx("h4", {
                            className: "font-medium text-gray-900 mb-2",
                            children: "DNS Resolution Status",
                          }),
                          o.jsx("div", {
                            className: "space-y-2",
                            children: t?.dnsChecks.map((e, t) =>
                              o.jsxs(
                                "div",
                                {
                                  className:
                                    "flex items-center justify-between p-2 bg-gray-50 rounded text-sm",
                                  children: [
                                    o.jsxs("div", {
                                      className: "flex items-center gap-2",
                                      children: [
                                        e.success
                                          ? o.jsx(x8.Z, {
                                              className: "text-green-600",
                                              size: 14,
                                            })
                                          : o.jsx(x9, {
                                              className: "text-red-600",
                                              size: 14,
                                            }),
                                        o.jsx("span", { children: e.resolver }),
                                      ],
                                    }),
                                    o.jsx("div", {
                                      className: "text-gray-600",
                                      children: e.success
                                        ? o.jsxs("span", {
                                            children: [
                                              e.addresses?.join(", "),
                                              " (",
                                              e.timing,
                                              "ms)",
                                            ],
                                          })
                                        : o.jsx("span", {
                                            className: "text-red-600",
                                            children: e.error,
                                          }),
                                    }),
                                  ],
                                },
                                t,
                              ),
                            ),
                          }),
                        ],
                      }),
                      b.length > 0 &&
                        (0, o.jsxs)("div", {
                          children: [
                            o.jsx("h4", {
                              className: "font-medium text-gray-900 mb-2",
                              children: "Stripe Webhook URLs",
                            }),
                            o.jsx("div", {
                              className: "space-y-2",
                              children: b.map((e, t) =>
                                (0, o.jsxs)(
                                  "div",
                                  {
                                    className: "p-3 bg-gray-50 rounded",
                                    children: [
                                      (0, o.jsxs)("div", {
                                        className:
                                          "flex items-center justify-between mb-1",
                                        children: [
                                          o.jsx("span", {
                                            className:
                                              "text-sm font-medium text-gray-700",
                                            children: e.label,
                                          }),
                                          (0, o.jsxs)("div", {
                                            className:
                                              "flex items-center gap-1",
                                            children: [
                                              (0, o.jsxs)("button", {
                                                onClick: () =>
                                                  v(e.url, e.label),
                                                className:
                                                  "text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center gap-1",
                                                children: [
                                                  o.jsx(wt.Z, { size: 12 }),
                                                  h === e.label
                                                    ? "Copied!"
                                                    : "Copy",
                                                ],
                                              }),
                                              (0, o.jsxs)("button", {
                                                onClick: () =>
                                                  window.open(e.url, "_blank"),
                                                className:
                                                  "text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded flex items-center gap-1",
                                                children: [
                                                  o.jsx(wr.Z, { size: 12 }),
                                                  "Test",
                                                ],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                      o.jsx("div", {
                                        className:
                                          "text-xs font-mono text-gray-600",
                                        children: e.url,
                                      }),
                                    ],
                                  },
                                  t,
                                ),
                              ),
                            }),
                          ],
                        }),
                      n &&
                        (0, o.jsxs)("div", {
                          children: [
                            o.jsx("h4", {
                              className: "font-medium text-gray-900 mb-2",
                              children: "Latest Test Results",
                            }),
                            (0, o.jsxs)("div", {
                              className: "space-y-2",
                              children: [
                                (0, o.jsxs)("div", {
                                  className:
                                    "grid grid-cols-1 md:grid-cols-3 gap-2",
                                  children: [
                                    (0, o.jsxs)("div", {
                                      className: `p-2 rounded text-sm ${n.tests.local.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`,
                                      children: [
                                        (0, o.jsxs)("div", {
                                          className:
                                            "flex items-center gap-1 font-medium",
                                          children: [
                                            n.tests.local.success
                                              ? o.jsx(x8.Z, { size: 14 })
                                              : o.jsx(x9, { size: 14 }),
                                            "Local (",
                                            n.tests.local.status,
                                            ")",
                                          ],
                                        }),
                                        (0, o.jsxs)("div", {
                                          className: "text-xs mt-1",
                                          children: [
                                            n.tests.local.timing,
                                            "ms",
                                          ],
                                        }),
                                      ],
                                    }),
                                    (0, o.jsxs)("div", {
                                      className: `p-2 rounded text-sm ${n.tests.public.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`,
                                      children: [
                                        (0, o.jsxs)("div", {
                                          className:
                                            "flex items-center gap-1 font-medium",
                                          children: [
                                            n.tests.public.success
                                              ? o.jsx(x8.Z, { size: 14 })
                                              : o.jsx(x9, { size: 14 }),
                                            "Public (",
                                            n.tests.public.status || "N/A",
                                            ")",
                                          ],
                                        }),
                                        (0, o.jsxs)("div", {
                                          className: "text-xs mt-1",
                                          children: [
                                            n.tests.public.timing || 0,
                                            "ms",
                                          ],
                                        }),
                                      ],
                                    }),
                                    (0, o.jsxs)("div", {
                                      className: `p-2 rounded text-sm ${n.tests.webhook.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`,
                                      children: [
                                        (0, o.jsxs)("div", {
                                          className:
                                            "flex items-center gap-1 font-medium",
                                          children: [
                                            n.tests.webhook.success
                                              ? o.jsx(x8.Z, { size: 14 })
                                              : o.jsx(x9, { size: 14 }),
                                            "Webhook (",
                                            n.tests.webhook.status || "N/A",
                                            ")",
                                          ],
                                        }),
                                        (0, o.jsxs)("div", {
                                          className: "text-xs mt-1",
                                          children: [
                                            n.tests.webhook.timing || 0,
                                            "ms",
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                n.recommendations.length > 0 &&
                                  (0, o.jsxs)("div", {
                                    className: "mt-3 p-3 bg-blue-50 rounded",
                                    children: [
                                      o.jsx("h5", {
                                        className:
                                          "text-sm font-medium text-blue-900 mb-1",
                                        children: "Recommendations",
                                      }),
                                      o.jsx("ul", {
                                        className:
                                          "text-sm text-blue-800 space-y-1",
                                        children: n.recommendations.map(
                                          (e, t) =>
                                            (0, o.jsxs)(
                                              "li",
                                              {
                                                className:
                                                  "flex items-start gap-1",
                                                children: [
                                                  o.jsx("span", {
                                                    className:
                                                      "text-blue-600 mt-0.5",
                                                    children: "•",
                                                  }),
                                                  o.jsx("span", {
                                                    children: e,
                                                  }),
                                                ],
                                              },
                                              t,
                                            ),
                                        ),
                                      }),
                                    ],
                                  }),
                              ],
                            }),
                          ],
                        }),
                      (0, o.jsxs)("div", {
                        className:
                          "flex justify-between items-center pt-4 border-t border-gray-100",
                        children: [
                          (0, o.jsxs)("span", {
                            className: "text-xs text-gray-500",
                            children: [
                              "Last updated: ",
                              t
                                ? new Date(t.timestamp).toLocaleTimeString()
                                : "Never",
                            ],
                          }),
                          (0, o.jsxs)("button", {
                            onClick: y,
                            disabled: a,
                            className:
                              "text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1",
                            children: [
                              o.jsx(x4, {
                                className: a ? "animate-spin" : "",
                                size: 14,
                              }),
                              "Refresh",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
            ],
          });
        }
        var wi = r(96849);
        function wa({ token: e }) {
          let [t, r] = (0, l.useState)(null),
            [n, i] = (0, l.useState)(!1),
            [a, s] = (0, l.useState)(!1);
          (0, l.useEffect)(() => {
            e && c();
          }, [e]);
          let c = async () => {
              if (e) {
                i(!0);
                try {
                  let t = await fetch(
                    "https://api.care2connects.org/admin/setup/tunnel/cloudflare/preflight",
                    { headers: { Authorization: `Bearer ${e}` } },
                  );
                  t.ok
                    ? r(await t.json())
                    : console.error(
                        "Failed to load tunnel preflight data:",
                        t.statusText,
                      );
                } catch (e) {
                  console.error("Error loading tunnel preflight data:", e);
                } finally {
                  i(!1);
                }
              }
            },
            u = t
              ? t.cloudflared.installed
                ? t.versionCheck.isOutdated || t.warnings.length > 0
                  ? "yellow"
                  : "green"
                : "red"
              : "gray",
            d = t
              ? t.cloudflared.installed
                ? t.versionCheck.isOutdated
                  ? `Version ${t.versionCheck.current} is outdated`
                  : t.warnings.length > 0
                    ? `${t.warnings.length} warnings found`
                    : "Cloudflared ready"
                : "Cloudflared not installed"
              : "Loading...";
          return (0, o.jsxs)("div", {
            className: "bg-white rounded-lg shadow",
            children: [
              o.jsx("div", {
                className:
                  "p-6 cursor-pointer hover:bg-gray-50 transition-colors",
                onClick: () => s(!a),
                children: (0, o.jsxs)("div", {
                  className: "flex items-center justify-between",
                  children: [
                    (0, o.jsxs)("div", {
                      className: "flex items-center gap-3",
                      children: [
                        o.jsx("div", {
                          className: `p-2 rounded-full ${"green" === u ? "bg-green-100 text-green-600" : "yellow" === u ? "bg-yellow-100 text-yellow-600" : "red" === u ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`,
                          children: o.jsx(x2, { size: 24 }),
                        }),
                        (0, o.jsxs)("div", {
                          children: [
                            o.jsx("h3", {
                              className: "text-lg font-semibold text-gray-900",
                              children: "Cloudflare Tunnel Status",
                            }),
                            o.jsx("p", {
                              className: "text-sm text-gray-500",
                              children: d,
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, o.jsxs)("div", {
                      className: "flex items-center gap-2",
                      children: [
                        (0, o.jsxs)("button", {
                          onClick: (e) => {
                            (e.stopPropagation(), c());
                          },
                          disabled: n,
                          className:
                            "text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1",
                          children: [
                            n
                              ? o.jsx(x4, {
                                  className: "animate-spin",
                                  size: 14,
                                })
                              : o.jsx(x4, { size: 14 }),
                            n ? "Checking..." : "Check",
                          ],
                        }),
                        o.jsx("span", {
                          className: "text-gray-400 text-sm",
                          children: a ? "▼" : "▶",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              a &&
                o.jsx("div", {
                  className: "px-6 pb-6 border-t border-gray-100",
                  children: (0, o.jsxs)("div", {
                    className: "space-y-6",
                    children: [
                      (0, o.jsxs)("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                        children: [
                          (0, o.jsxs)("div", {
                            children: [
                              o.jsx("h4", {
                                className: "font-medium text-gray-900 mb-2",
                                children: "Installation Status",
                              }),
                              (0, o.jsxs)("div", {
                                className: "space-y-2",
                                children: [
                                  (0, o.jsxs)("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                      t?.cloudflared.installed
                                        ? o.jsx(x8.Z, {
                                            className: "text-green-600",
                                            size: 16,
                                          })
                                        : o.jsx(x9, {
                                            className: "text-red-600",
                                            size: 16,
                                          }),
                                      o.jsx("span", {
                                        className: "text-sm",
                                        children: t?.cloudflared.installed
                                          ? "Installed"
                                          : "Not installed",
                                      }),
                                    ],
                                  }),
                                  t?.cloudflared.version &&
                                    (0, o.jsxs)("div", {
                                      className: "text-sm text-gray-600",
                                      children: [
                                        "Current version: ",
                                        o.jsx("span", {
                                          className: "font-mono",
                                          children: t.cloudflared.version,
                                        }),
                                      ],
                                    }),
                                  t?.cloudflared.path &&
                                    (0, o.jsxs)("div", {
                                      className: "text-sm text-gray-600",
                                      children: [
                                        "Path: ",
                                        o.jsx("span", {
                                          className: "font-mono text-xs",
                                          children: t.cloudflared.path,
                                        }),
                                      ],
                                    }),
                                  t?.cloudflared.error &&
                                    o.jsx("div", {
                                      className: "text-sm text-red-600",
                                      children: t.cloudflared.error,
                                    }),
                                ],
                              }),
                            ],
                          }),
                          (0, o.jsxs)("div", {
                            children: [
                              o.jsx("h4", {
                                className: "font-medium text-gray-900 mb-2",
                                children: "Version Status",
                              }),
                              (0, o.jsxs)("div", {
                                className: "space-y-2",
                                children: [
                                  (0, o.jsxs)("div", {
                                    className: "text-sm",
                                    children: [
                                      "Recommended: ",
                                      (0, o.jsxs)("span", {
                                        className: "font-mono",
                                        children: [
                                          t?.versionCheck.recommendedMin,
                                          "+",
                                        ],
                                      }),
                                    ],
                                  }),
                                  t?.versionCheck.isOutdated &&
                                    (0, o.jsxs)("div", {
                                      className: "flex items-center gap-2",
                                      children: [
                                        o.jsx(we, {
                                          className: "text-yellow-600",
                                          size: 16,
                                        }),
                                        o.jsx("span", {
                                          className: "text-sm text-yellow-800",
                                          children: "Version outdated",
                                        }),
                                      ],
                                    }),
                                  t?.versionCheck.upgradeCommand &&
                                    (0, o.jsxs)("div", {
                                      className: "mt-2",
                                      children: [
                                        o.jsx("div", {
                                          className:
                                            "text-xs text-gray-600 mb-1",
                                          children: "Upgrade command:",
                                        }),
                                        o.jsx("div", {
                                          className:
                                            "bg-gray-100 p-2 rounded font-mono text-xs",
                                          children:
                                            t.versionCheck.upgradeCommand,
                                        }),
                                      ],
                                    }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, o.jsxs)("div", {
                        children: [
                          o.jsx("h4", {
                            className: "font-medium text-gray-900 mb-2",
                            children: "System Information",
                          }),
                          o.jsx("div", {
                            className: "bg-gray-50 p-3 rounded",
                            children: (0, o.jsxs)("div", {
                              className: "grid grid-cols-3 gap-4 text-sm",
                              children: [
                                (0, o.jsxs)("div", {
                                  children: [
                                    o.jsx("span", {
                                      className: "text-gray-600",
                                      children: "OS:",
                                    }),
                                    o.jsx("span", {
                                      className: "ml-2 font-mono",
                                      children: t?.systemCheck.os,
                                    }),
                                  ],
                                }),
                                (0, o.jsxs)("div", {
                                  children: [
                                    o.jsx("span", {
                                      className: "text-gray-600",
                                      children: "Arch:",
                                    }),
                                    o.jsx("span", {
                                      className: "ml-2 font-mono",
                                      children: t?.systemCheck.arch,
                                    }),
                                  ],
                                }),
                                (0, o.jsxs)("div", {
                                  children: [
                                    o.jsx("span", {
                                      className: "text-gray-600",
                                      children: "Node:",
                                    }),
                                    o.jsx("span", {
                                      className: "ml-2 font-mono",
                                      children: t?.systemCheck.node,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                        ],
                      }),
                      t &&
                        t.warnings.length > 0 &&
                        (0, o.jsxs)("div", {
                          children: [
                            o.jsx("h4", {
                              className: "font-medium text-gray-900 mb-2",
                              children: "Warnings",
                            }),
                            o.jsx("div", {
                              className: "space-y-2",
                              children: t.warnings.map((e, t) =>
                                (0, o.jsxs)(
                                  "div",
                                  {
                                    className:
                                      "flex items-start gap-2 p-2 bg-yellow-50 rounded",
                                    children: [
                                      o.jsx(we, {
                                        className: "text-yellow-600 mt-0.5",
                                        size: 14,
                                      }),
                                      o.jsx("span", {
                                        className: "text-sm text-yellow-800",
                                        children: e,
                                      }),
                                    ],
                                  },
                                  t,
                                ),
                              ),
                            }),
                          ],
                        }),
                      t &&
                        t.recommendations.length > 0 &&
                        (0, o.jsxs)("div", {
                          children: [
                            o.jsx("h4", {
                              className: "font-medium text-gray-900 mb-2",
                              children: "Recommendations",
                            }),
                            o.jsx("div", {
                              className: "space-y-2",
                              children: t.recommendations.map((e, t) =>
                                (0, o.jsxs)(
                                  "div",
                                  {
                                    className:
                                      "flex items-start gap-2 p-2 bg-blue-50 rounded",
                                    children: [
                                      o.jsx("div", {
                                        className: "text-blue-600 mt-0.5",
                                        children: "•",
                                      }),
                                      o.jsx("span", {
                                        className: "text-sm text-blue-800",
                                        children: e,
                                      }),
                                    ],
                                  },
                                  t,
                                ),
                              ),
                            }),
                          ],
                        }),
                      (0, o.jsxs)("div", {
                        className:
                          "flex flex-wrap gap-2 pt-4 border-t border-gray-100",
                        children: [
                          !t?.cloudflared.installed &&
                            (0, o.jsxs)("button", {
                              onClick: () =>
                                window.open(
                                  "https://github.com/cloudflare/cloudflared/releases",
                                  "_blank",
                                ),
                              className:
                                "text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1",
                              children: [
                                o.jsx(wi.Z, { size: 14 }),
                                "Download Cloudflared",
                              ],
                            }),
                          (0, o.jsxs)("button", {
                            onClick: () =>
                              window.open(
                                "https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/",
                                "_blank",
                              ),
                            className:
                              "text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 flex items-center gap-1",
                            children: [
                              o.jsx(wr.Z, { size: 14 }),
                              "Installation Guide",
                            ],
                          }),
                          t?.versionCheck.isOutdated &&
                            (0, o.jsxs)("button", {
                              onClick: () =>
                                window.open(
                                  "https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/#windows",
                                  "_blank",
                                ),
                              className:
                                "text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 flex items-center gap-1",
                              children: [
                                o.jsx(wr.Z, { size: 14 }),
                                "Upgrade Guide",
                              ],
                            }),
                        ],
                      }),
                      (0, o.jsxs)("div", {
                        className:
                          "text-xs text-gray-500 pt-2 border-t border-gray-100",
                        children: [
                          "Last checked: ",
                          t
                            ? new Date(t.timestamp).toLocaleTimeString()
                            : "Never",
                        ],
                      }),
                    ],
                  }),
                }),
            ],
          });
        }
        var wo = r(17872),
          wl = r(40289);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let ws = (0, x1.Z)("Activity", [
          ["path", { d: "M22 12h-4l-3 9L9 3l-3 9H2", key: "d5dnw9" }],
        ]);
        var wc = r(62939);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let wu = (0, x1.Z)("Play", [
          ["polygon", { points: "5 3 19 12 5 21 5 3", key: "191637" }],
        ]);
        function wd() {
          let e = (0, s.useRouter)(),
            [t, r] = (0, l.useState)(null),
            [n, i] = (0, l.useState)(!1),
            [a, c] = (0, l.useState)(null),
            [d, f] = (0, l.useState)([]),
            [h, p] = (0, l.useState)(null),
            [y, m] = (0, l.useState)(null),
            [v, g] = (0, l.useState)(!1),
            [b, x] = (0, l.useState)(!0),
            [w, j] = (0, l.useState)(!1),
            [O, P] = (0, l.useState)(null),
            [S, k] = (0, l.useState)({});
          ((0, l.useEffect)(() => {
            let e = sessionStorage.getItem("system-admin-token"),
              t = sessionStorage.getItem("system-admin-expires");
            e && t && Date.now() < parseInt(t)
              ? (r(e), i(!1))
              : (i(!0),
                sessionStorage.removeItem("system-admin-token"),
                sessionStorage.removeItem("system-admin-expires"));
          }, []),
            (0, l.useEffect)(() => {
              if (!t) return;
              let e = () =>
                  "https://api.care2connects.org".replace(/\/api$/, ""),
                r = async () => {
                  try {
                    let r = e(),
                      n = await fetch(`${r}/health/status`);
                    n.ok && c(await n.json());
                    let i = await fetch(`${r}/admin/user-errors`, {
                      headers: { Authorization: `Bearer ${t}` },
                    });
                    if (i.ok) {
                      let e = await i.json();
                      f(e.errors || []);
                    }
                  } catch (e) {
                    console.error("Failed to fetch system data:", e);
                  } finally {
                    x(!1);
                  }
                };
              r();
              let n = setInterval(async () => {
                try {
                  let t = e(),
                    r = await fetch(`${t}/health/status`);
                  r.ok && c(await r.json());
                } catch (e) {
                  console.error("Health poll failed:", e);
                }
              }, 1e4);
              return () => clearInterval(n);
            }, [t]));
          let N = (e) => {
              if (!a) return;
              let t = {};
              ("status" === e
                ? (t = {
                    title: "System Status",
                    integrity: a.integrity || null,
                    blockingReasons: a.integrity?.blockingReasons || [],
                  })
                : "database" === e
                  ? (t = {
                      title: "Database",
                      ok: a.services?.db?.ok,
                      detail: a.services?.db?.detail,
                      connectedSince: a.connectedSince?.db || "never",
                    })
                  : "storage" === e &&
                    (t = {
                      title: "Storage",
                      ok: a.services?.storage?.ok,
                      detail: a.services?.storage?.detail,
                      connectedSince: a.connectedSince?.storage || "never",
                    }),
                P(t),
                j(!0));
            },
            E = async (e) => {
              if (!t)
                return k((t) => ({
                  ...t,
                  [e]: { ok: !1, message: "Not authenticated" },
                }));
              k((t) => ({ ...t, [e]: { status: "pending" } }));
              try {
                let r = "https://api.care2connects.org".replace(/\/api$/, ""),
                  n = await fetch(`${r}/admin/${e}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${t}` },
                  }),
                  i = await n.json();
                k((t) => ({
                  ...t,
                  [e]: { status: n.ok ? "success" : "manual", data: i },
                }));
              } catch (t) {
                k((r) => ({
                  ...r,
                  [e]: { status: "error", error: String(t) },
                }));
              }
            },
            _ = async () => {
              if (t) {
                g(!0);
                try {
                  let e = "https://api.care2connects.org".replace(/\/api$/, ""),
                    r = await fetch(`${e}/admin/run-tests`, {
                      method: "POST",
                      headers: { Authorization: `Bearer ${t}` },
                    });
                  if (r.ok) {
                    let e = await r.json();
                    m(e);
                  }
                } catch (e) {
                  console.error("Failed to run tests:", e);
                } finally {
                  g(!1);
                }
              }
            };
          if (n)
            return o.jsx(u, {
              onAuthenticated: (e) => {
                (r(e), i(!1));
              },
              onCancel: () => e.push("/"),
            });
          if (b)
            return o.jsx("div", {
              className:
                "min-h-screen bg-gray-50 flex items-center justify-center",
              children: o.jsx("div", {
                className: "text-gray-600",
                children: "Loading system data...",
              }),
            });
          let A =
            a?.status === "ready"
              ? "green"
              : a?.status === "degraded"
                ? "yellow"
                : "red";
          return (0, o.jsxs)("div", {
            className: "min-h-screen bg-gray-50",
            children: [
              o.jsx("div", {
                className: "bg-white border-b border-gray-200 shadow-sm",
                children: o.jsx("div", {
                  className: "max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8",
                  children: (0, o.jsxs)("div", {
                    className: "flex justify-between items-center",
                    children: [
                      (0, o.jsxs)("div", {
                        className: "flex items-center gap-3",
                        children: [
                          o.jsx(wo.Z, { className: "text-blue-600", size: 28 }),
                          o.jsx("h1", {
                            className: "text-2xl font-bold text-gray-900",
                            children: "System Diagnostics Console",
                          }),
                        ],
                      }),
                      (0, o.jsxs)("div", {
                        className: "flex items-center gap-4",
                        children: [
                          o.jsx("button", {
                            onClick: () => e.push("/"),
                            className:
                              "text-sm text-gray-600 hover:text-gray-900",
                            children: "← Back to Portal",
                          }),
                          o.jsx("button", {
                            onClick: () => {
                              (sessionStorage.removeItem("system-admin-token"),
                                sessionStorage.removeItem(
                                  "system-admin-expires",
                                ),
                                r(null),
                                i(!0));
                            },
                            className:
                              "text-sm text-gray-600 hover:text-gray-900",
                            children: "Logout",
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              }),
              (0, o.jsxs)("div", {
                className: "max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8",
                children: [
                  (0, o.jsxs)("div", {
                    className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8",
                    children: [
                      o.jsx("div", {
                        role: "button",
                        onClick: () => N("status"),
                        className:
                          "bg-white rounded-lg shadow p-6 cursor-pointer",
                        children: (0, o.jsxs)("div", {
                          className: "flex items-center justify-between",
                          children: [
                            (0, o.jsxs)("div", {
                              children: [
                                o.jsx("p", {
                                  className: "text-sm text-gray-600",
                                  children: "Status",
                                }),
                                o.jsx("p", {
                                  className: `text-2xl font-bold capitalize text-${A}-600`,
                                  children: a?.status || "Unknown",
                                }),
                              ],
                            }),
                            "green" === A &&
                              o.jsx(x8.Z, {
                                className: "text-green-500",
                                size: 32,
                              }),
                            "yellow" === A &&
                              o.jsx(wl.Z, {
                                className: "text-yellow-500",
                                size: 32,
                              }),
                            "red" === A &&
                              o.jsx(x9, {
                                className: "text-red-500",
                                size: 32,
                              }),
                          ],
                        }),
                      }),
                      o.jsx("div", {
                        role: "button",
                        onClick: () => N("database"),
                        className:
                          "bg-white rounded-lg shadow p-6 cursor-pointer",
                        children: (0, o.jsxs)("div", {
                          className: "flex items-center justify-between",
                          children: [
                            (0, o.jsxs)("div", {
                              children: [
                                o.jsx("p", {
                                  className: "text-sm text-gray-600",
                                  children: "Database",
                                }),
                                o.jsx("p", {
                                  className: `text-2xl font-bold ${a?.services?.db?.ok ? "text-green-600" : "text-red-600"}`,
                                  children: a?.services?.db?.ok
                                    ? "Connected"
                                    : "Disconnected",
                                }),
                              ],
                            }),
                            o.jsx(ws, {
                              className: a?.services?.db?.ok
                                ? "text-green-500"
                                : "text-red-500",
                              size: 32,
                            }),
                          ],
                        }),
                      }),
                      o.jsx("div", {
                        role: "button",
                        onClick: () => N("storage"),
                        className:
                          "bg-white rounded-lg shadow p-6 cursor-pointer",
                        children: (0, o.jsxs)("div", {
                          className: "flex items-center justify-between",
                          children: [
                            (0, o.jsxs)("div", {
                              children: [
                                o.jsx("p", {
                                  className: "text-sm text-gray-600",
                                  children: "Storage",
                                }),
                                o.jsx("p", {
                                  className: `text-2xl font-bold ${a?.services?.storage?.ok ? "text-green-600" : "text-red-600"}`,
                                  children: a?.services?.storage?.ok
                                    ? "Connected"
                                    : "Disconnected",
                                }),
                              ],
                            }),
                            o.jsx(wc.Z, {
                              className: a?.services?.storage?.ok
                                ? "text-green-500"
                                : "text-red-500",
                              size: 32,
                            }),
                          ],
                        }),
                      }),
                      o.jsx("div", {
                        className: "bg-white rounded-lg shadow p-6",
                        children: (0, o.jsxs)("div", {
                          className: "flex items-center justify-between",
                          children: [
                            (0, o.jsxs)("div", {
                              children: [
                                o.jsx("p", {
                                  className: "text-sm text-gray-600",
                                  children: "User Errors",
                                }),
                                o.jsx("p", {
                                  className: "text-2xl font-bold text-gray-900",
                                  children: d.length,
                                }),
                              ],
                            }),
                            o.jsx(wl.Z, {
                              className: "text-orange-500",
                              size: 32,
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                  (0, o.jsxs)("div", {
                    className: "bg-white rounded-lg shadow p-6 mb-8",
                    children: [
                      (0, o.jsxs)("div", {
                        className: "flex items-center justify-between mb-4",
                        children: [
                          o.jsx("h3", {
                            className: "text-lg font-semibold text-gray-900",
                            children: "Setup Helpers",
                          }),
                          o.jsx("p", {
                            className: "text-sm text-gray-500",
                            children: "One-click helpers (demo/dev only)",
                          }),
                        ],
                      }),
                      (0, o.jsxs)("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                        children: [
                          (0, o.jsxs)("div", {
                            className: "space-y-2",
                            children: [
                              o.jsx("button", {
                                onClick: () => E("fix/db"),
                                className:
                                  "w-full bg-blue-600 text-white px-4 py-2 rounded",
                                children: "Start Demo Database",
                              }),
                              o.jsx("div", {
                                className: "text-sm text-gray-600",
                                children:
                                  S["fix/db"]?.status === "pending"
                                    ? "Starting..."
                                    : S["fix/db"]?.data?.command ||
                                      (S["fix/db"]?.status === "success"
                                        ? "Started"
                                        : ""),
                              }),
                            ],
                          }),
                          (0, o.jsxs)("div", {
                            className: "space-y-2",
                            children: [
                              o.jsx("button", {
                                onClick: () => E("fix/email-inbox"),
                                className:
                                  "w-full bg-blue-600 text-white px-4 py-2 rounded",
                                children: "Start Local Email Inbox",
                              }),
                              o.jsx("div", {
                                className: "text-sm text-gray-600",
                                children:
                                  S["fix/email-inbox"]?.data?.inboxUrl ||
                                  S["fix/email-inbox"]?.data?.command ||
                                  "",
                              }),
                            ],
                          }),
                          (0, o.jsxs)("div", {
                            className: "space-y-2",
                            children: [
                              o.jsx("button", {
                                onClick: () => E("fix/install-evts"),
                                className:
                                  "w-full bg-blue-600 text-white px-4 py-2 rounded",
                                children: "Install EVTS Model",
                              }),
                              o.jsx("div", {
                                className: "text-sm text-gray-600",
                                children:
                                  S["fix/install-evts"]?.data?.command ||
                                  S["fix/install-evts"]?.data?.message ||
                                  "",
                              }),
                            ],
                          }),
                          (0, o.jsxs)("div", {
                            className: "space-y-2",
                            children: [
                              o.jsx("button", {
                                onClick: () => E("fix/stripe-webhook"),
                                className:
                                  "w-full bg-blue-600 text-white px-4 py-2 rounded",
                                children: "Stripe Webhook Helper",
                              }),
                              o.jsx("div", {
                                className: "text-sm text-gray-600",
                                children:
                                  S["fix/stripe-webhook"]?.data?.command ||
                                  S["fix/stripe-webhook"]?.data?.message ||
                                  "",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  t &&
                    o.jsx("div", {
                      className: "mt-8",
                      children: o.jsx(wn, { token: t }),
                    }),
                  t &&
                    o.jsx("div", {
                      className: "mt-8",
                      children: o.jsx(wa, { token: t }),
                    }),
                  t &&
                    o.jsx("div", {
                      className: "mt-8",
                      children: o.jsx(x6, { token: t }),
                    }),
                  a?.degradedReasons &&
                    a.degradedReasons.length > 0 &&
                    (0, o.jsxs)("div", {
                      className:
                        "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8",
                      children: [
                        o.jsx("h3", {
                          className:
                            "text-sm font-semibold text-yellow-900 mb-2",
                          children: "Degraded Reasons:",
                        }),
                        o.jsx("ul", {
                          className:
                            "list-disc list-inside text-sm text-yellow-800 space-y-1",
                          children: a.degradedReasons.map((e, t) =>
                            o.jsx("li", { children: e }, t),
                          ),
                        }),
                      ],
                    }),
                  w &&
                    O &&
                    o.jsx("div", {
                      className:
                        "fixed inset-0 bg-black/40 z-40 flex items-end md:items-center justify-center p-4",
                      children: (0, o.jsxs)("div", {
                        className:
                          "bg-white rounded-t-lg md:rounded-lg shadow-2xl w-full md:w-3/4 max-h-[80vh] overflow-y-auto p-6",
                        children: [
                          (0, o.jsxs)("div", {
                            className: "flex justify-between items-center mb-4",
                            children: [
                              o.jsx("h3", {
                                className: "text-xl font-bold",
                                children: O.title,
                              }),
                              o.jsx("button", {
                                onClick: () => j(!1),
                                className: "text-gray-500",
                                children: "✕",
                              }),
                            ],
                          }),
                          (0, o.jsxs)("div", {
                            className: "space-y-4 text-sm text-gray-800",
                            children: [
                              O.integrity &&
                                (0, o.jsxs)("div", {
                                  children: [
                                    (0, o.jsxs)("p", {
                                      className: "font-medium",
                                      children: [
                                        "Integrity Mode: ",
                                        o.jsx("span", {
                                          className: "font-semibold",
                                          children: O.integrity.mode,
                                        }),
                                      ],
                                    }),
                                    o.jsx("p", {
                                      className: "mt-2",
                                      children: "Blocking Reasons:",
                                    }),
                                    o.jsx("ul", {
                                      className: "list-disc list-inside",
                                      children: O.blockingReasons.map((e, t) =>
                                        o.jsx("li", { children: e }, t),
                                      ),
                                    }),
                                  ],
                                }),
                              void 0 !== O.ok &&
                                (0, o.jsxs)("div", {
                                  children: [
                                    (0, o.jsxs)("p", {
                                      className: "font-medium",
                                      children: [
                                        "State: ",
                                        o.jsx("span", {
                                          className: `font-semibold ${O.ok ? "text-green-600" : "text-red-600"}`,
                                          children: O.ok
                                            ? "Connected"
                                            : "Disconnected",
                                        }),
                                      ],
                                    }),
                                    (0, o.jsxs)("p", {
                                      className: "mt-2",
                                      children: ["Detail: ", O.detail],
                                    }),
                                    (0, o.jsxs)("p", {
                                      className: "mt-2",
                                      children: [
                                        "Connected since: ",
                                        O.connectedSince,
                                      ],
                                    }),
                                    (0, o.jsxs)("div", {
                                      className: "mt-4",
                                      children: [
                                        o.jsx("p", {
                                          className: "font-medium",
                                          children: "Fix Steps",
                                        }),
                                        o.jsx("pre", {
                                          className:
                                            "bg-gray-50 p-3 rounded text-xs mt-2",
                                          children: O.ok
                                            ? "No action required"
                                            : "docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  t && o.jsx(x0, { token: t }),
                  (0, o.jsxs)("div", {
                    className: "bg-white rounded-lg shadow p-6 mt-8",
                    children: [
                      (0, o.jsxs)("div", {
                        className: "flex justify-between items-center mb-4",
                        children: [
                          o.jsx("h3", {
                            className: "text-lg font-semibold text-gray-900",
                            children: "System Tests",
                          }),
                          o.jsx("button", {
                            onClick: _,
                            disabled: v,
                            className:
                              "flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition",
                            children: v
                              ? (0, o.jsxs)(o.Fragment, {
                                  children: [
                                    o.jsx(x4, {
                                      className: "animate-spin",
                                      size: 16,
                                    }),
                                    "Running...",
                                  ],
                                })
                              : (0, o.jsxs)(o.Fragment, {
                                  children: [
                                    o.jsx(wu, { size: 16 }),
                                    "Run Tests",
                                  ],
                                }),
                          }),
                        ],
                      }),
                      y &&
                        (0, o.jsxs)("div", {
                          className: "space-y-3",
                          children: [
                            (0, o.jsxs)("div", {
                              className:
                                "flex items-center justify-between text-sm",
                              children: [
                                (0, o.jsxs)("span", {
                                  className: "text-gray-600",
                                  children: [
                                    "Started: ",
                                    new Date(y.startedAt).toLocaleTimeString(),
                                  ],
                                }),
                                (0, o.jsxs)("span", {
                                  className: "text-gray-600",
                                  children: [
                                    "Finished: ",
                                    new Date(y.finishedAt).toLocaleTimeString(),
                                  ],
                                }),
                              ],
                            }),
                            y.results.map((e) =>
                              (0, o.jsxs)(
                                "div",
                                {
                                  className:
                                    "flex items-center justify-between p-3 bg-gray-50 rounded",
                                  children: [
                                    o.jsx("span", {
                                      className: "font-medium text-gray-900",
                                      children: e.name,
                                    }),
                                    (0, o.jsxs)("div", {
                                      className: "flex items-center gap-2",
                                      children: [
                                        e.duration &&
                                          (0, o.jsxs)("span", {
                                            className: "text-xs text-gray-500",
                                            children: [e.duration, "ms"],
                                          }),
                                        e.ok
                                          ? o.jsx(x8.Z, {
                                              className: "text-green-500",
                                              size: 20,
                                            })
                                          : o.jsx(x9, {
                                              className: "text-red-500",
                                              size: 20,
                                            }),
                                      ],
                                    }),
                                  ],
                                },
                                e.name,
                              ),
                            ),
                          ],
                        }),
                    ],
                  }),
                  (0, o.jsxs)("div", {
                    className: "bg-white rounded-lg shadow p-6 mt-8",
                    children: [
                      o.jsx("h3", {
                        className: "text-lg font-semibold text-gray-900 mb-4",
                        children: "User Reported Errors",
                      }),
                      0 === d.length
                        ? o.jsx("p", {
                            className: "text-gray-500 text-center py-8",
                            children: "No user errors reported",
                          })
                        : o.jsx("div", {
                            className: "overflow-x-auto",
                            children: (0, o.jsxs)("table", {
                              className: "min-w-full divide-y divide-gray-200",
                              children: [
                                o.jsx("thead", {
                                  className: "bg-gray-50",
                                  children: (0, o.jsxs)("tr", {
                                    children: [
                                      o.jsx("th", {
                                        className:
                                          "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                                        children: "Time",
                                      }),
                                      o.jsx("th", {
                                        className:
                                          "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                                        children: "Category",
                                      }),
                                      o.jsx("th", {
                                        className:
                                          "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                                        children: "Page",
                                      }),
                                      o.jsx("th", {
                                        className:
                                          "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                                        children: "Suspected Cause",
                                      }),
                                      o.jsx("th", {
                                        className:
                                          "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                                        children: "Confidence",
                                      }),
                                      o.jsx("th", {
                                        className:
                                          "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                                        children: "Status",
                                      }),
                                    ],
                                  }),
                                }),
                                o.jsx("tbody", {
                                  className:
                                    "bg-white divide-y divide-gray-200",
                                  children: d
                                    .slice(0, 10)
                                    .map((e) =>
                                      (0, o.jsxs)(
                                        "tr",
                                        {
                                          onClick: () => p(e),
                                          className:
                                            "hover:bg-gray-50 cursor-pointer",
                                          children: [
                                            o.jsx("td", {
                                              className:
                                                "px-4 py-3 text-sm text-gray-900",
                                              children: new Date(
                                                e.timestamp,
                                              ).toLocaleString(),
                                            }),
                                            o.jsx("td", {
                                              className: "px-4 py-3 text-sm",
                                              children: o.jsx("span", {
                                                className:
                                                  "px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs",
                                                children: e.rootCause.category,
                                              }),
                                            }),
                                            o.jsx("td", {
                                              className:
                                                "px-4 py-3 text-sm text-gray-900",
                                              children: e.page || "Unknown",
                                            }),
                                            o.jsx("td", {
                                              className:
                                                "px-4 py-3 text-sm text-gray-600",
                                              children:
                                                e.rootCause.suspectedCause,
                                            }),
                                            o.jsx("td", {
                                              className: "px-4 py-3 text-sm",
                                              children: o.jsx("span", {
                                                className: `px-2 py-1 rounded text-xs ${"high" === e.rootCause.confidence ? "bg-green-100 text-green-800" : "medium" === e.rootCause.confidence ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`,
                                                children:
                                                  e.rootCause.confidence,
                                              }),
                                            }),
                                            o.jsx("td", {
                                              className:
                                                "px-4 py-3 text-sm text-gray-900 capitalize",
                                              children: e.status,
                                            }),
                                          ],
                                        },
                                        e.id,
                                      ),
                                    ),
                                }),
                              ],
                            }),
                          }),
                    ],
                  }),
                  h &&
                    o.jsx("div", {
                      className:
                        "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4",
                      children: o.jsx("div", {
                        className:
                          "bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",
                        children: (0, o.jsxs)("div", {
                          className: "p-6",
                          children: [
                            (0, o.jsxs)("div", {
                              className:
                                "flex justify-between items-start mb-4",
                              children: [
                                o.jsx("h3", {
                                  className: "text-xl font-bold text-gray-900",
                                  children: "Error Details",
                                }),
                                o.jsx("button", {
                                  onClick: () => p(null),
                                  className:
                                    "text-gray-400 hover:text-gray-600",
                                  children: "✕",
                                }),
                              ],
                            }),
                            (0, o.jsxs)("div", {
                              className: "space-y-4",
                              children: [
                                (0, o.jsxs)("div", {
                                  children: [
                                    o.jsx("p", {
                                      className:
                                        "text-sm font-medium text-gray-700",
                                      children: "Timestamp",
                                    }),
                                    o.jsx("p", {
                                      className: "text-gray-900",
                                      children: new Date(
                                        h.timestamp,
                                      ).toLocaleString(),
                                    }),
                                  ],
                                }),
                                (0, o.jsxs)("div", {
                                  children: [
                                    o.jsx("p", {
                                      className:
                                        "text-sm font-medium text-gray-700",
                                      children: "Message",
                                    }),
                                    o.jsx("p", {
                                      className: "text-gray-900",
                                      children: h.message,
                                    }),
                                  ],
                                }),
                                (0, o.jsxs)("div", {
                                  children: [
                                    o.jsx("p", {
                                      className:
                                        "text-sm font-medium text-gray-700",
                                      children: "Page",
                                    }),
                                    o.jsx("p", {
                                      className: "text-gray-900",
                                      children: h.page || "Unknown",
                                    }),
                                  ],
                                }),
                                (0, o.jsxs)("div", {
                                  className: "border-t pt-4",
                                  children: [
                                    o.jsx("p", {
                                      className:
                                        "text-sm font-medium text-gray-700 mb-2",
                                      children: "Root Cause Analysis",
                                    }),
                                    (0, o.jsxs)("div", {
                                      className:
                                        "bg-blue-50 p-4 rounded-lg space-y-3",
                                      children: [
                                        (0, o.jsxs)("div", {
                                          children: [
                                            o.jsx("p", {
                                              className:
                                                "text-xs font-medium text-blue-900",
                                              children: "Category",
                                            }),
                                            o.jsx("p", {
                                              className: "text-blue-800",
                                              children: h.rootCause.category,
                                            }),
                                          ],
                                        }),
                                        (0, o.jsxs)("div", {
                                          children: [
                                            o.jsx("p", {
                                              className:
                                                "text-xs font-medium text-blue-900",
                                              children: "Suspected Cause",
                                            }),
                                            o.jsx("p", {
                                              className: "text-blue-800",
                                              children:
                                                h.rootCause.suspectedCause,
                                            }),
                                          ],
                                        }),
                                        (0, o.jsxs)("div", {
                                          children: [
                                            o.jsx("p", {
                                              className:
                                                "text-xs font-medium text-blue-900",
                                              children: "Recommended Fix",
                                            }),
                                            o.jsx("p", {
                                              className: "text-blue-800",
                                              children:
                                                h.rootCause.recommendedFix,
                                            }),
                                          ],
                                        }),
                                        (0, o.jsxs)("div", {
                                          children: [
                                            o.jsx("p", {
                                              className:
                                                "text-xs font-medium text-blue-900",
                                              children: "Confidence",
                                            }),
                                            o.jsx("p", {
                                              className:
                                                "text-blue-800 capitalize",
                                              children: h.rootCause.confidence,
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                    }),
                ],
              }),
            ],
          });
        }
      },
      9690: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { default: () => s }));
        var n = r(73658),
          i = r(84874),
          a = r.n(i),
          o = r(32241),
          l = r(17872);
        function s() {
          let e = (0, o.usePathname)();
          return "/system" === e
            ? null
            : n.jsx("header", {
                className: "bg-white shadow-sm border-b border-gray-200",
                children: n.jsx("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                  children: (0, n.jsxs)("div", {
                    className: "flex justify-between items-center py-4",
                    children: [
                      (0, n.jsxs)("div", {
                        className: "flex items-center gap-4",
                        children: [
                          n.jsx(a(), {
                            href: "/",
                            className: "flex items-center gap-2",
                            children: n.jsx("div", {
                              className: "text-3xl font-black text-blue-900",
                              children: "CareConnect",
                            }),
                          }),
                          n.jsx("div", {
                            className:
                              "hidden sm:block text-sm text-gray-600 font-medium border-l border-gray-300 pl-4",
                            children: "Community-Supported Homeless Initiative",
                          }),
                        ],
                      }),
                      (0, n.jsxs)("div", {
                        className: "flex items-center gap-6",
                        children: [
                          (0, n.jsxs)("nav", {
                            className: "hidden md:flex items-center gap-6",
                            children: [
                              n.jsx(a(), {
                                href: "/about",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "About",
                              }),
                              n.jsx(a(), {
                                href: "/resources",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Resources",
                              }),
                              n.jsx(a(), {
                                href: "/find",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Find",
                              }),
                              n.jsx(a(), {
                                href: "/support",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Support",
                              }),
                            ],
                          }),
                          (0, n.jsxs)(a(), {
                            href: "/system",
                            className:
                              "flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition group",
                            title: "System Diagnostics",
                            children: [
                              n.jsx(l.Z, {
                                size: 16,
                                className: "group-hover:text-blue-600",
                              }),
                              n.jsx("span", {
                                className: "hidden sm:inline",
                                children: "System",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              });
        }
      },
      63596: (e, t, r) => {
        "use strict";
        e.exports = r(97275).get;
      },
      65546: (e, t, r) => {
        "use strict";
        e.exports = r(8951).isPlainObject;
      },
      29898: (e, t, r) => {
        "use strict";
        e.exports = r(89594).last;
      },
      26464: (e, t, r) => {
        "use strict";
        e.exports = r(66879).range;
      },
      67672: (e, t, r) => {
        "use strict";
        e.exports = r(54050).sortBy;
      },
      12167: (e, t, r) => {
        "use strict";
        e.exports = r(27550).throttle;
      },
      33278: (e, t, r) => {
        "use strict";
        e.exports = r(74768).uniqBy;
      },
      63088: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.isUnsafeProperty = function (e) {
            return "__proto__" === e;
          }));
      },
      33583: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.flatten = function (e, t = 1) {
            let r = [],
              n = Math.floor(t),
              i = (e, t) => {
                for (let a = 0; a < e.length; a++) {
                  let o = e[a];
                  Array.isArray(o) && t < n ? i(o, t + 1) : r.push(o);
                }
              };
            return (i(e, 0), r);
          }));
      },
      99707: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.last = function (e) {
            return e[e.length - 1];
          }));
      },
      48157: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.uniqBy = function (e, t) {
            let r = new Map();
            for (let n = 0; n < e.length; n++) {
              let i = e[n],
                a = t(i);
              r.has(a) || r.set(a, i);
            }
            return Array.from(r.values());
          }));
      },
      98311: (e, t) => {
        "use strict";
        function r(e) {
          return "symbol" == typeof e
            ? 1
            : null === e
              ? 2
              : void 0 === e
                ? 3
                : e != e
                  ? 4
                  : 0;
        }
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.compareValues = (e, t, n) => {
            if (e !== t) {
              let i = r(e),
                a = r(t);
              if (i === a && 0 === i) {
                if (e < t) return "desc" === n ? 1 : -1;
                if (e > t) return "desc" === n ? -1 : 1;
              }
              return "desc" === n ? a - i : i - a;
            }
            return 0;
          }));
      },
      39549: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.getSymbols = function (e) {
            return Object.getOwnPropertySymbols(e).filter((t) =>
              Object.prototype.propertyIsEnumerable.call(e, t),
            );
          }));
      },
      4152: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.getTag = function (e) {
            return null == e
              ? void 0 === e
                ? "[object Undefined]"
                : "[object Null]"
              : Object.prototype.toString.call(e);
          }));
      },
      39163: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.isDeepKey = function (e) {
            switch (typeof e) {
              case "number":
              case "symbol":
                return !1;
              case "string":
                return e.includes(".") || e.includes("[") || e.includes("]");
            }
          }));
      },
      70215: (e, t) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let r = /^(?:0|[1-9]\d*)$/;
        t.isIndex = function (e, t = Number.MAX_SAFE_INTEGER) {
          switch (typeof e) {
            case "number":
              return Number.isInteger(e) && e >= 0 && e < t;
            case "symbol":
              return !1;
            case "string":
              return r.test(e);
          }
        };
      },
      21119: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(70215),
          i = r(67608),
          a = r(99115),
          o = r(73284);
        t.isIterateeCall = function (e, t, r) {
          return (
            !!a.isObject(r) &&
            ((!!("number" == typeof t && i.isArrayLike(r) && n.isIndex(t)) &&
              t < r.length) ||
              ("string" == typeof t && t in r)) &&
            o.eq(r[t], e)
          );
        };
      },
      12223: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(94257),
          i = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
          a = /^\w*$/;
        t.isKey = function (e, t) {
          return (
            !Array.isArray(e) &&
            (!!(
              "number" == typeof e ||
              "boolean" == typeof e ||
              null == e ||
              n.isSymbol(e)
            ) ||
              ("string" == typeof e && (a.test(e) || !i.test(e))) ||
              (null != t && Object.hasOwn(t, e)))
          );
        };
      },
      78948: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.argumentsTag = "[object Arguments]"),
          (t.arrayBufferTag = "[object ArrayBuffer]"),
          (t.arrayTag = "[object Array]"),
          (t.bigInt64ArrayTag = "[object BigInt64Array]"),
          (t.bigUint64ArrayTag = "[object BigUint64Array]"),
          (t.booleanTag = "[object Boolean]"),
          (t.dataViewTag = "[object DataView]"),
          (t.dateTag = "[object Date]"),
          (t.errorTag = "[object Error]"),
          (t.float32ArrayTag = "[object Float32Array]"),
          (t.float64ArrayTag = "[object Float64Array]"),
          (t.functionTag = "[object Function]"),
          (t.int16ArrayTag = "[object Int16Array]"),
          (t.int32ArrayTag = "[object Int32Array]"),
          (t.int8ArrayTag = "[object Int8Array]"),
          (t.mapTag = "[object Map]"),
          (t.numberTag = "[object Number]"),
          (t.objectTag = "[object Object]"),
          (t.regexpTag = "[object RegExp]"),
          (t.setTag = "[object Set]"),
          (t.stringTag = "[object String]"),
          (t.symbolTag = "[object Symbol]"),
          (t.uint16ArrayTag = "[object Uint16Array]"),
          (t.uint32ArrayTag = "[object Uint32Array]"),
          (t.uint8ArrayTag = "[object Uint8Array]"),
          (t.uint8ClampedArrayTag = "[object Uint8ClampedArray]"));
      },
      80282: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.toArray = function (e) {
            return Array.isArray(e) ? e : Array.from(e);
          }));
      },
      60867: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.toKey = function (e) {
            return "string" == typeof e || "symbol" == typeof e
              ? e
              : Object.is(e?.valueOf?.(), -0)
                ? "-0"
                : String(e);
          }));
      },
      89594: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(99707),
          i = r(80282),
          a = r(67608);
        t.last = function (e) {
          if (a.isArrayLike(e)) return n.last(i.toArray(e));
        };
      },
      10425: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(98311),
          i = r(12223),
          a = r(31773);
        t.orderBy = function (e, t, r, o) {
          if (null == e) return [];
          ((r = o ? void 0 : r),
            Array.isArray(e) || (e = Object.values(e)),
            Array.isArray(t) || (t = null == t ? [null] : [t]),
            0 === t.length && (t = [null]),
            Array.isArray(r) || (r = null == r ? [] : [r]),
            (r = r.map((e) => String(e))));
          let l = (e, t) => {
              let r = e;
              for (let e = 0; e < t.length && null != r; ++e) r = r[t[e]];
              return r;
            },
            s = (e, t) =>
              null == t || null == e
                ? t
                : "object" == typeof e && "key" in e
                  ? Object.hasOwn(t, e.key)
                    ? t[e.key]
                    : l(t, e.path)
                  : "function" == typeof e
                    ? e(t)
                    : Array.isArray(e)
                      ? l(t, e)
                      : "object" == typeof t
                        ? t[e]
                        : t,
            c = t.map((e) =>
              (Array.isArray(e) && 1 === e.length && (e = e[0]),
              null == e ||
                "function" == typeof e ||
                Array.isArray(e) ||
                i.isKey(e))
                ? e
                : { key: e, path: a.toPath(e) },
            ),
            u = e.map((e) => ({
              original: e,
              criteria: c.map((t) => s(t, e)),
            }));
          return u
            .slice()
            .sort((e, t) => {
              for (let i = 0; i < c.length; i++) {
                let a = n.compareValues(e.criteria[i], t.criteria[i], r[i]);
                if (0 !== a) return a;
              }
              return 0;
            })
            .map((e) => e.original);
        };
      },
      54050: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(10425),
          i = r(33583),
          a = r(21119);
        t.sortBy = function (e, ...t) {
          let r = t.length;
          return (
            r > 1 && a.isIterateeCall(e, t[0], t[1])
              ? (t = [])
              : r > 2 && a.isIterateeCall(t[0], t[1], t[2]) && (t = [t[0]]),
            n.orderBy(e, i.flatten(t), ["asc"])
          );
        };
      },
      74768: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(48157),
          i = r(74823),
          a = r(53432),
          o = r(20978);
        t.uniqBy = function (e, t = i.identity) {
          return a.isArrayLikeObject(e)
            ? n.uniqBy(Array.from(e), o.iteratee(t))
            : [];
        };
      },
      59523: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(99565);
        t.debounce = function (e, t = 0, r = {}) {
          let i;
          "object" != typeof r && (r = {});
          let { leading: a = !1, trailing: o = !0, maxWait: l } = r,
            s = [, ,];
          (a && (s[0] = "leading"), o && (s[1] = "trailing"));
          let c = null,
            u = n.debounce(
              function (...t) {
                ((i = e.apply(this, t)), (c = null));
              },
              t,
              { edges: s },
            ),
            d = function (...t) {
              return (
                null != l &&
                (null === c && (c = Date.now()), Date.now() - c >= l)
                  ? ((i = e.apply(this, t)),
                    (c = Date.now()),
                    u.cancel(),
                    u.schedule())
                  : u.apply(this, t),
                i
              );
            };
          return ((d.cancel = u.cancel), (d.flush = () => (u.flush(), i)), d);
        };
      },
      27550: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(59523);
        t.throttle = function (e, t = 0, r = {}) {
          let { leading: i = !0, trailing: a = !0 } = r;
          return n.debounce(e, t, { leading: i, maxWait: t, trailing: a });
        };
      },
      66879: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(21119),
          i = r(4636);
        t.range = function (e, t, r) {
          (r &&
            "number" != typeof r &&
            n.isIterateeCall(e, t, r) &&
            (t = r = void 0),
            (e = i.toFinite(e)),
            void 0 === t ? ((t = e), (e = 0)) : (t = i.toFinite(t)),
            (r = void 0 === r ? (e < t ? 1 : -1) : i.toFinite(r)));
          let a = Math.max(Math.ceil((t - e) / (r || 1)), 0),
            o = Array(a);
          for (let t = 0; t < a; t++) ((o[t] = e), (e += r));
          return o;
        };
      },
      64938: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(43179);
        t.cloneDeep = function (e) {
          return n.cloneDeepWith(e);
        };
      },
      43179: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(73093),
          i = r(78948);
        t.cloneDeepWith = function (e, t) {
          return n.cloneDeepWith(e, (r, a, o, l) => {
            let s = t?.(r, a, o, l);
            if (void 0 !== s) return s;
            if ("object" == typeof e)
              switch (Object.prototype.toString.call(e)) {
                case i.numberTag:
                case i.stringTag:
                case i.booleanTag: {
                  let t = new e.constructor(e?.valueOf());
                  return (n.copyProperties(t, e), t);
                }
                case i.argumentsTag: {
                  let t = {};
                  return (
                    n.copyProperties(t, e),
                    (t.length = e.length),
                    (t[Symbol.iterator] = e[Symbol.iterator]),
                    t
                  );
                }
                default:
                  return;
              }
          });
        };
      },
      97275: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(63088),
          i = r(39163),
          a = r(60867),
          o = r(31773);
        t.get = function e(t, r, l) {
          if (null == t) return l;
          switch (typeof r) {
            case "string": {
              if (n.isUnsafeProperty(r)) return l;
              let a = t[r];
              if (void 0 === a) {
                if (i.isDeepKey(r)) return e(t, o.toPath(r), l);
                return l;
              }
              return a;
            }
            case "number":
            case "symbol": {
              "number" == typeof r && (r = a.toKey(r));
              let e = t[r];
              if (void 0 === e) return l;
              return e;
            }
            default: {
              if (Array.isArray(r))
                return (function (e, t, r) {
                  if (0 === t.length) return r;
                  let i = e;
                  for (let e = 0; e < t.length; e++) {
                    if (null == i || n.isUnsafeProperty(t[e])) return r;
                    i = i[t[e]];
                  }
                  return void 0 === i ? r : i;
                })(t, r, l);
              if (
                ((r = Object.is(r?.valueOf(), -0) ? "-0" : String(r)),
                n.isUnsafeProperty(r))
              )
                return l;
              let e = t[r];
              if (void 0 === e) return l;
              return e;
            }
          }
        };
      },
      34927: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(39163),
          i = r(70215),
          a = r(59936),
          o = r(31773);
        t.has = function (e, t) {
          let r;
          if (
            0 ===
            (r = Array.isArray(t)
              ? t
              : "string" == typeof t && n.isDeepKey(t) && e?.[t] == null
                ? o.toPath(t)
                : [t]).length
          )
            return !1;
          let l = e;
          for (let e = 0; e < r.length; e++) {
            let t = r[e];
            if (null == l || !Object.hasOwn(l, t)) {
              let e =
                (Array.isArray(l) || a.isArguments(l)) &&
                i.isIndex(t) &&
                t < l.length;
              if (!e) return !1;
            }
            l = l[t];
          }
          return !0;
        };
      },
      63764: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(97275);
        t.property = function (e) {
          return function (t) {
            return n.get(t, e);
          };
        };
      },
      59936: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(4152);
        t.isArguments = function (e) {
          return (
            null !== e &&
            "object" == typeof e &&
            "[object Arguments]" === n.getTag(e)
          );
        };
      },
      67608: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(63094);
        t.isArrayLike = function (e) {
          return null != e && "function" != typeof e && n.isLength(e.length);
        };
      },
      53432: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(67608),
          i = r(21640);
        t.isArrayLikeObject = function (e) {
          return i.isObjectLike(e) && n.isArrayLike(e);
        };
      },
      4222: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(2599);
        t.isMatch = function (e, t) {
          return n.isMatchWith(e, t, () => void 0);
        };
      },
      2599: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(99115),
          i = r(32967),
          a = r(73284);
        function o(e, t, r, c) {
          if (t === e) return !0;
          switch (typeof t) {
            case "object":
              return (function (e, t, r, n) {
                if (null == t) return !0;
                if (Array.isArray(t)) return l(e, t, r, n);
                if (t instanceof Map)
                  return (function (e, t, r, n) {
                    if (0 === t.size) return !0;
                    if (!(e instanceof Map)) return !1;
                    for (let [i, a] of t.entries()) {
                      let o = e.get(i),
                        l = r(o, a, i, e, t, n);
                      if (!1 === l) return !1;
                    }
                    return !0;
                  })(e, t, r, n);
                if (t instanceof Set) return s(e, t, r, n);
                let a = Object.keys(t);
                if (null == e || i.isPrimitive(e)) return 0 === a.length;
                if (0 === a.length) return !0;
                if (n?.has(t)) return n.get(t) === e;
                n?.set(t, e);
                try {
                  for (let o = 0; o < a.length; o++) {
                    let l = a[o];
                    if (
                      (!i.isPrimitive(e) && !(l in e)) ||
                      (void 0 === t[l] && void 0 !== e[l]) ||
                      (null === t[l] && null !== e[l])
                    )
                      return !1;
                    let s = r(e[l], t[l], l, e, t, n);
                    if (!s) return !1;
                  }
                  return !0;
                } finally {
                  n?.delete(t);
                }
              })(e, t, r, c);
            case "function": {
              let n = Object.keys(t);
              if (n.length > 0) return o(e, { ...t }, r, c);
              return a.eq(e, t);
            }
            default:
              if (!n.isObject(e)) return a.eq(e, t);
              if ("string" == typeof t) return "" === t;
              return !0;
          }
        }
        function l(e, t, r, n) {
          if (0 === t.length) return !0;
          if (!Array.isArray(e)) return !1;
          let i = new Set();
          for (let a = 0; a < t.length; a++) {
            let o = t[a],
              l = !1;
            for (let s = 0; s < e.length; s++) {
              if (i.has(s)) continue;
              let c = e[s],
                u = !1,
                d = r(c, o, a, e, t, n);
              if ((d && (u = !0), u)) {
                (i.add(s), (l = !0));
                break;
              }
            }
            if (!l) return !1;
          }
          return !0;
        }
        function s(e, t, r, n) {
          return 0 === t.size || (e instanceof Set && l([...e], [...t], r, n));
        }
        ((t.isMatchWith = function e(t, r, n) {
          return "function" != typeof n
            ? e(t, r, () => void 0)
            : o(
                t,
                r,
                function e(t, r, i, a, l, s) {
                  let c = n(t, r, i, a, l, s);
                  return void 0 !== c ? !!c : o(t, r, e, s);
                },
                new Map(),
              );
        }),
          (t.isSetMatch = s));
      },
      99115: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.isObject = function (e) {
            return (
              null !== e && ("object" == typeof e || "function" == typeof e)
            );
          }));
      },
      21640: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.isObjectLike = function (e) {
            return "object" == typeof e && null !== e;
          }));
      },
      8951: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.isPlainObject = function (e) {
            if ("object" != typeof e || null == e) return !1;
            if (null === Object.getPrototypeOf(e)) return !0;
            if ("[object Object]" !== Object.prototype.toString.call(e)) {
              let t = e[Symbol.toStringTag];
              if (null == t) return !1;
              let r = !Object.getOwnPropertyDescriptor(e, Symbol.toStringTag)
                ?.writable;
              return !r && e.toString() === `[object ${t}]`;
            }
            let t = e;
            for (; null !== Object.getPrototypeOf(t); )
              t = Object.getPrototypeOf(t);
            return Object.getPrototypeOf(e) === t;
          }));
      },
      94257: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.isSymbol = function (e) {
            return "symbol" == typeof e || e instanceof Symbol;
          }));
      },
      68891: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(4222),
          i = r(17262);
        t.matches = function (e) {
          return ((e = i.cloneDeep(e)), (t) => n.isMatch(t, e));
        };
      },
      16568: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(4222),
          i = r(60867),
          a = r(64938),
          o = r(97275),
          l = r(34927);
        t.matchesProperty = function (e, t) {
          switch (typeof e) {
            case "object":
              Object.is(e?.valueOf(), -0) && (e = "-0");
              break;
            case "number":
              e = i.toKey(e);
          }
          return (
            (t = a.cloneDeep(t)),
            function (r) {
              let i = o.get(r, e);
              return void 0 === i
                ? l.has(r, e)
                : void 0 === t
                  ? void 0 === i
                  : n.isMatch(i, t);
            }
          );
        };
      },
      73284: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.eq = function (e, t) {
            return e === t || (Number.isNaN(e) && Number.isNaN(t));
          }));
      },
      20978: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(74823),
          i = r(63764),
          a = r(68891),
          o = r(16568);
        t.iteratee = function (e) {
          if (null == e) return n.identity;
          switch (typeof e) {
            case "function":
              return e;
            case "object":
              if (Array.isArray(e) && 2 === e.length)
                return o.matchesProperty(e[0], e[1]);
              return a.matches(e);
            case "string":
            case "symbol":
            case "number":
              return i.property(e);
          }
        };
      },
      4636: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(47335);
        t.toFinite = function (e) {
          if (!e) return 0 === e ? e : 0;
          if ((e = n.toNumber(e)) === 1 / 0 || e === -1 / 0) {
            let t = e < 0 ? -1 : 1;
            return t * Number.MAX_VALUE;
          }
          return e == e ? e : 0;
        };
      },
      47335: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(94257);
        t.toNumber = function (e) {
          return n.isSymbol(e) ? NaN : Number(e);
        };
      },
      31773: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(79628),
          i = r(60867);
        t.toPath = function (e) {
          if (Array.isArray(e)) return e.map(i.toKey);
          if ("symbol" == typeof e) return [e];
          e = n.toString(e);
          let t = [],
            r = e.length;
          if (0 === r) return t;
          let a = 0,
            o = "",
            l = "",
            s = !1;
          for (46 === e.charCodeAt(0) && (t.push(""), a++); a < r; ) {
            let n = e[a];
            (l
              ? "\\" === n && a + 1 < r
                ? (o += e[++a])
                : n === l
                  ? (l = "")
                  : (o += n)
              : s
                ? '"' === n || "'" === n
                  ? (l = n)
                  : "]" === n
                    ? ((s = !1), t.push(o), (o = ""))
                    : (o += n)
                : "[" === n
                  ? ((s = !0), o && (t.push(o), (o = "")))
                  : "." === n
                    ? o && (t.push(o), (o = ""))
                    : (o += n),
              a++);
          }
          return (o && t.push(o), t);
        };
      },
      79628: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.toString = function e(t) {
            if (null == t) return "";
            if ("string" == typeof t) return t;
            if (Array.isArray(t)) return t.map(e).join(",");
            let r = String(t);
            return "0" === r && Object.is(Number(t), -0) ? "-0" : r;
          }));
      },
      99565: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.debounce = function (e, t, { signal: r, edges: n } = {}) {
            let i;
            let a = null,
              o = null != n && n.includes("leading"),
              l = null == n || n.includes("trailing"),
              s = () => {
                null !== a && (e.apply(i, a), (i = void 0), (a = null));
              },
              c = () => {
                (l && s(), h());
              },
              u = null,
              d = () => {
                (null != u && clearTimeout(u),
                  (u = setTimeout(() => {
                    ((u = null), c());
                  }, t)));
              },
              f = () => {
                null !== u && (clearTimeout(u), (u = null));
              },
              h = () => {
                (f(), (i = void 0), (a = null));
              },
              p = function (...e) {
                if (r?.aborted) return;
                ((i = this), (a = e));
                let t = null == u;
                (d(), o && t && s());
              };
            return (
              (p.schedule = d),
              (p.cancel = h),
              (p.flush = () => {
                s();
              }),
              r?.addEventListener("abort", h, { once: !0 }),
              p
            );
          }));
      },
      74823: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.identity = function (e) {
            return e;
          }));
      },
      17262: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(73093);
        t.cloneDeep = function (e) {
          return n.cloneDeepWithImpl(e, void 0, e, new Map(), void 0);
        };
      },
      73093: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
        let n = r(39549),
          i = r(4152),
          a = r(78948),
          o = r(32967),
          l = r(95804);
        function s(e, t, r, n = new Map(), u) {
          let d = u?.(e, t, r, n);
          if (void 0 !== d) return d;
          if (o.isPrimitive(e)) return e;
          if (n.has(e)) return n.get(e);
          if (Array.isArray(e)) {
            let t = Array(e.length);
            n.set(e, t);
            for (let i = 0; i < e.length; i++) t[i] = s(e[i], i, r, n, u);
            return (
              Object.hasOwn(e, "index") && (t.index = e.index),
              Object.hasOwn(e, "input") && (t.input = e.input),
              t
            );
          }
          if (e instanceof Date) return new Date(e.getTime());
          if (e instanceof RegExp) {
            let t = new RegExp(e.source, e.flags);
            return ((t.lastIndex = e.lastIndex), t);
          }
          if (e instanceof Map) {
            let t = new Map();
            for (let [i, a] of (n.set(e, t), e)) t.set(i, s(a, i, r, n, u));
            return t;
          }
          if (e instanceof Set) {
            let t = new Set();
            for (let i of (n.set(e, t), e)) t.add(s(i, void 0, r, n, u));
            return t;
          }
          if ("undefined" != typeof Buffer && Buffer.isBuffer(e))
            return e.subarray();
          if (l.isTypedArray(e)) {
            let t = new (Object.getPrototypeOf(e).constructor)(e.length);
            n.set(e, t);
            for (let i = 0; i < e.length; i++) t[i] = s(e[i], i, r, n, u);
            return t;
          }
          if (
            e instanceof ArrayBuffer ||
            ("undefined" != typeof SharedArrayBuffer &&
              e instanceof SharedArrayBuffer)
          )
            return e.slice(0);
          if (e instanceof DataView) {
            let t = new DataView(e.buffer.slice(0), e.byteOffset, e.byteLength);
            return (n.set(e, t), c(t, e, r, n, u), t);
          }
          if ("undefined" != typeof File && e instanceof File) {
            let t = new File([e], e.name, { type: e.type });
            return (n.set(e, t), c(t, e, r, n, u), t);
          }
          if ("undefined" != typeof Blob && e instanceof Blob) {
            let t = new Blob([e], { type: e.type });
            return (n.set(e, t), c(t, e, r, n, u), t);
          }
          if (e instanceof Error) {
            let t = new e.constructor();
            return (
              n.set(e, t),
              (t.message = e.message),
              (t.name = e.name),
              (t.stack = e.stack),
              (t.cause = e.cause),
              c(t, e, r, n, u),
              t
            );
          }
          if (e instanceof Boolean) {
            let t = new Boolean(e.valueOf());
            return (n.set(e, t), c(t, e, r, n, u), t);
          }
          if (e instanceof Number) {
            let t = new Number(e.valueOf());
            return (n.set(e, t), c(t, e, r, n, u), t);
          }
          if (e instanceof String) {
            let t = new String(e.valueOf());
            return (n.set(e, t), c(t, e, r, n, u), t);
          }
          if (
            "object" == typeof e &&
            (function (e) {
              switch (i.getTag(e)) {
                case a.argumentsTag:
                case a.arrayTag:
                case a.arrayBufferTag:
                case a.dataViewTag:
                case a.booleanTag:
                case a.dateTag:
                case a.float32ArrayTag:
                case a.float64ArrayTag:
                case a.int8ArrayTag:
                case a.int16ArrayTag:
                case a.int32ArrayTag:
                case a.mapTag:
                case a.numberTag:
                case a.objectTag:
                case a.regexpTag:
                case a.setTag:
                case a.stringTag:
                case a.symbolTag:
                case a.uint8ArrayTag:
                case a.uint8ClampedArrayTag:
                case a.uint16ArrayTag:
                case a.uint32ArrayTag:
                  return !0;
                default:
                  return !1;
              }
            })(e)
          ) {
            let t = Object.create(Object.getPrototypeOf(e));
            return (n.set(e, t), c(t, e, r, n, u), t);
          }
          return e;
        }
        function c(e, t, r = e, i, a) {
          let o = [...Object.keys(t), ...n.getSymbols(t)];
          for (let n = 0; n < o.length; n++) {
            let l = o[n],
              c = Object.getOwnPropertyDescriptor(e, l);
            (null == c || c.writable) && (e[l] = s(t[l], l, r, i, a));
          }
        }
        ((t.cloneDeepWith = function (e, t) {
          return s(e, void 0, e, new Map(), t);
        }),
          (t.cloneDeepWithImpl = s),
          (t.copyProperties = c));
      },
      63094: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.isLength = function (e) {
            return Number.isSafeInteger(e) && e >= 0;
          }));
      },
      32967: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.isPrimitive = function (e) {
            return (
              null == e || ("object" != typeof e && "function" != typeof e)
            );
          }));
      },
      95804: (e, t) => {
        "use strict";
        (Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          (t.isTypedArray = function (e) {
            return ArrayBuffer.isView(e) && !(e instanceof DataView);
          }));
      },
      43571: (e) => {
        "use strict";
        var t = Object.prototype.hasOwnProperty,
          r = "~";
        function n() {}
        function i(e, t, r) {
          ((this.fn = e), (this.context = t), (this.once = r || !1));
        }
        function a(e, t, n, a, o) {
          if ("function" != typeof n)
            throw TypeError("The listener must be a function");
          var l = new i(n, a || e, o),
            s = r ? r + t : t;
          return (
            e._events[s]
              ? e._events[s].fn
                ? (e._events[s] = [e._events[s], l])
                : e._events[s].push(l)
              : ((e._events[s] = l), e._eventsCount++),
            e
          );
        }
        function o(e, t) {
          0 == --e._eventsCount ? (e._events = new n()) : delete e._events[t];
        }
        function l() {
          ((this._events = new n()), (this._eventsCount = 0));
        }
        (Object.create &&
          ((n.prototype = Object.create(null)), new n().__proto__ || (r = !1)),
          (l.prototype.eventNames = function () {
            var e,
              n,
              i = [];
            if (0 === this._eventsCount) return i;
            for (n in (e = this._events))
              t.call(e, n) && i.push(r ? n.slice(1) : n);
            return Object.getOwnPropertySymbols
              ? i.concat(Object.getOwnPropertySymbols(e))
              : i;
          }),
          (l.prototype.listeners = function (e) {
            var t = r ? r + e : e,
              n = this._events[t];
            if (!n) return [];
            if (n.fn) return [n.fn];
            for (var i = 0, a = n.length, o = Array(a); i < a; i++)
              o[i] = n[i].fn;
            return o;
          }),
          (l.prototype.listenerCount = function (e) {
            var t = r ? r + e : e,
              n = this._events[t];
            return n ? (n.fn ? 1 : n.length) : 0;
          }),
          (l.prototype.emit = function (e, t, n, i, a, o) {
            var l = r ? r + e : e;
            if (!this._events[l]) return !1;
            var s,
              c,
              u = this._events[l],
              d = arguments.length;
            if (u.fn) {
              switch ((u.once && this.removeListener(e, u.fn, void 0, !0), d)) {
                case 1:
                  return (u.fn.call(u.context), !0);
                case 2:
                  return (u.fn.call(u.context, t), !0);
                case 3:
                  return (u.fn.call(u.context, t, n), !0);
                case 4:
                  return (u.fn.call(u.context, t, n, i), !0);
                case 5:
                  return (u.fn.call(u.context, t, n, i, a), !0);
                case 6:
                  return (u.fn.call(u.context, t, n, i, a, o), !0);
              }
              for (c = 1, s = Array(d - 1); c < d; c++) s[c - 1] = arguments[c];
              u.fn.apply(u.context, s);
            } else {
              var f,
                h = u.length;
              for (c = 0; c < h; c++)
                switch (
                  (u[c].once && this.removeListener(e, u[c].fn, void 0, !0), d)
                ) {
                  case 1:
                    u[c].fn.call(u[c].context);
                    break;
                  case 2:
                    u[c].fn.call(u[c].context, t);
                    break;
                  case 3:
                    u[c].fn.call(u[c].context, t, n);
                    break;
                  case 4:
                    u[c].fn.call(u[c].context, t, n, i);
                    break;
                  default:
                    if (!s)
                      for (f = 1, s = Array(d - 1); f < d; f++)
                        s[f - 1] = arguments[f];
                    u[c].fn.apply(u[c].context, s);
                }
            }
            return !0;
          }),
          (l.prototype.on = function (e, t, r) {
            return a(this, e, t, r, !1);
          }),
          (l.prototype.once = function (e, t, r) {
            return a(this, e, t, r, !0);
          }),
          (l.prototype.removeListener = function (e, t, n, i) {
            var a = r ? r + e : e;
            if (!this._events[a]) return this;
            if (!t) return (o(this, a), this);
            var l = this._events[a];
            if (l.fn)
              l.fn !== t ||
                (i && !l.once) ||
                (n && l.context !== n) ||
                o(this, a);
            else {
              for (var s = 0, c = [], u = l.length; s < u; s++)
                (l[s].fn !== t ||
                  (i && !l[s].once) ||
                  (n && l[s].context !== n)) &&
                  c.push(l[s]);
              c.length
                ? (this._events[a] = 1 === c.length ? c[0] : c)
                : o(this, a);
            }
            return this;
          }),
          (l.prototype.removeAllListeners = function (e) {
            var t;
            return (
              e
                ? ((t = r ? r + e : e), this._events[t] && o(this, t))
                : ((this._events = new n()), (this._eventsCount = 0)),
              this
            );
          }),
          (l.prototype.off = l.prototype.removeListener),
          (l.prototype.addListener = l.prototype.on),
          (l.prefixed = r),
          (l.EventEmitter = l),
          (e.exports = l));
      },
      40289: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var n = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, n.Z)("AlertCircle", [
          ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
          ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
          [
            "line",
            { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" },
          ],
        ]);
      },
      81165: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var n = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, n.Z)("CheckCircle", [
          ["path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14", key: "g774vq" }],
          ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }],
        ]);
      },
      3228: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var n = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, n.Z)("Copy", [
          [
            "rect",
            {
              width: "14",
              height: "14",
              x: "8",
              y: "8",
              rx: "2",
              ry: "2",
              key: "17jyea",
            },
          ],
          [
            "path",
            {
              d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
              key: "zix9uf",
            },
          ],
        ]);
      },
      96849: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var n = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, n.Z)("Download", [
          [
            "path",
            { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" },
          ],
          ["polyline", { points: "7 10 12 15 17 10", key: "2ggqvy" }],
          ["line", { x1: "12", x2: "12", y1: "15", y2: "3", key: "1vk2je" }],
        ]);
      },
      64542: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var n = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, n.Z)("ExternalLink", [
          [
            "path",
            {
              d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
              key: "a6xqqp",
            },
          ],
          ["polyline", { points: "15 3 21 3 21 9", key: "mznyad" }],
          ["line", { x1: "10", x2: "21", y1: "14", y2: "3", key: "18c3s4" }],
        ]);
      },
      62939: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var n = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, n.Z)("FileText", [
          [
            "path",
            {
              d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",
              key: "1nnpy2",
            },
          ],
          ["polyline", { points: "14 2 14 8 20 8", key: "1ew0cm" }],
          ["line", { x1: "16", x2: "8", y1: "13", y2: "13", key: "14keom" }],
          ["line", { x1: "16", x2: "8", y1: "17", y2: "17", key: "17nazh" }],
          ["line", { x1: "10", x2: "8", y1: "9", y2: "9", key: "1a5vjj" }],
        ]);
      },
      20082: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var n = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, n.Z)("X", [
          ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
          ["path", { d: "m6 6 12 12", key: "d8bk6v" }],
        ]);
      },
      93498: (e, t) => {
        "use strict";
        /** @license React v17.0.2
         * react-is.production.min.js
         *
         * Copyright (c) Facebook, Inc. and its affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */ var r = 60103,
          n = 60106,
          i = 60107,
          a = 60108,
          o = 60114,
          l = 60109,
          s = 60110,
          c = 60112,
          u = 60113,
          d = 60120,
          f = 60115,
          h = 60116;
        if ("function" == typeof Symbol && Symbol.for) {
          var p = Symbol.for;
          (p("react.element"),
            p("react.portal"),
            p("react.fragment"),
            p("react.strict_mode"),
            p("react.profiler"),
            p("react.provider"),
            p("react.context"),
            p("react.forward_ref"),
            p("react.suspense"),
            p("react.suspense_list"),
            p("react.memo"),
            p("react.lazy"),
            p("react.block"),
            p("react.server.block"),
            p("react.fundamental"),
            p("react.debug_trace_mode"),
            p("react.legacy_hidden"));
        }
      },
      21912: (e, t, r) => {
        "use strict";
        r(93498);
      },
      10243: (e, t, r) => {
        "use strict";
        /**
         * @license React
         * use-sync-external-store-shim.production.js
         *
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */ var n = r(55459);
        ("function" == typeof Object.is && Object.is,
          n.useState,
          n.useEffect,
          n.useLayoutEffect,
          n.useDebugValue,
          (t.useSyncExternalStore =
            void 0 !== n.useSyncExternalStore
              ? n.useSyncExternalStore
              : function (e, t) {
                  return t();
                }));
      },
      87094: (e, t, r) => {
        "use strict";
        /**
         * @license React
         * use-sync-external-store-shim/with-selector.production.js
         *
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */ var n = r(55459),
          i = r(37339),
          a =
            "function" == typeof Object.is
              ? Object.is
              : function (e, t) {
                  return (
                    (e === t && (0 !== e || 1 / e == 1 / t)) ||
                    (e != e && t != t)
                  );
                },
          o = i.useSyncExternalStore,
          l = n.useRef,
          s = n.useEffect,
          c = n.useMemo,
          u = n.useDebugValue;
        t.useSyncExternalStoreWithSelector = function (e, t, r, n, i) {
          var d = l(null);
          if (null === d.current) {
            var f = { hasValue: !1, value: null };
            d.current = f;
          } else f = d.current;
          var h = o(
            e,
            (d = c(
              function () {
                function e(e) {
                  if (!s) {
                    if (
                      ((s = !0),
                      (o = e),
                      (e = n(e)),
                      void 0 !== i && f.hasValue)
                    ) {
                      var t = f.value;
                      if (i(t, e)) return (l = t);
                    }
                    return (l = e);
                  }
                  if (((t = l), a(o, e))) return t;
                  var r = n(e);
                  return void 0 !== i && i(t, r)
                    ? ((o = e), t)
                    : ((o = e), (l = r));
                }
                var o,
                  l,
                  s = !1,
                  c = void 0 === r ? null : r;
                return [
                  function () {
                    return e(t());
                  },
                  null === c
                    ? void 0
                    : function () {
                        return e(c());
                      },
                ];
              },
              [t, r, n, i],
            ))[0],
            d[1],
          );
          return (
            s(
              function () {
                ((f.hasValue = !0), (f.value = h));
              },
              [h],
            ),
            u(h),
            h
          );
        };
      },
      79153: (e, t, r) => {
        "use strict";
        /**
         * @license React
         * use-sync-external-store-with-selector.production.js
         *
         * Copyright (c) Meta Platforms, Inc. and affiliates.
         *
         * This source code is licensed under the MIT license found in the
         * LICENSE file in the root directory of this source tree.
         */ var n = r(55459);
        ("function" == typeof Object.is && Object.is,
          n.useSyncExternalStore,
          n.useRef,
          n.useEffect,
          n.useMemo,
          n.useDebugValue);
      },
      37339: (e, t, r) => {
        "use strict";
        e.exports = r(10243);
      },
      92337: (e, t, r) => {
        "use strict";
        e.exports = r(87094);
      },
      18665: (e, t, r) => {
        "use strict";
        r(79153);
      },
      18685: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { default: () => v, metadata: () => m }));
        var n = r(31487),
          i = r(72972),
          a = r.n(i);
        r(40642);
        var o = r(19894);
        let l = (0, o.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx`,
          ),
          { __esModule: s, $$typeof: c } = l;
        l.default;
        let u = (0, o.createProxy)(
          String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx#Providers`,
        );
        var d = r(15762);
        let f = (0, o.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\components\Header.tsx`,
          ),
          { __esModule: h, $$typeof: p } = f,
          y = f.default,
          m = {
            title: "CareConnect - Supporting Our Community",
            description:
              "A platform connecting individuals experiencing homelessness with resources, opportunities, and community support.",
            keywords:
              "homeless support, community resources, job opportunities, donations, assistance",
          };
        function v({ children: e }) {
          return n.jsx("html", {
            lang: "en",
            children: n.jsx("body", {
              className: a().className,
              children: (0, n.jsxs)(u, {
                children: [
                  n.jsx(y, {}),
                  n.jsx("div", {
                    className: "min-h-screen bg-gray-50",
                    children: n.jsx("main", { children: e }),
                  }),
                  n.jsx(d.x7, {
                    position: "top-right",
                    toastOptions: {
                      duration: 4e3,
                      style: { background: "#363636", color: "#fff" },
                      success: { style: { background: "#10b981" } },
                      error: { style: { background: "#ef4444" } },
                    },
                  }),
                ],
              }),
            }),
          });
        }
      },
      53738: (e, t, r) => {
        "use strict";
        (r.r(t),
          r.d(t, { $$typeof: () => o, __esModule: () => a, default: () => s }));
        var n = r(19894);
        let i = (0, n.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\system\page.tsx`,
          ),
          { __esModule: a, $$typeof: o } = i,
          l = i.default,
          s = l;
      },
      40642: () => {},
    }));
  var t = require("../../webpack-runtime.js");
  t.C(e);
  var r = (e) => t((t.s = e)),
    n = t.X(0, [623, 934], () => r(47169));
  module.exports = n;
})();

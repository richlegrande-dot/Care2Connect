(() => {
  var e = {};
  ((e.id = 931),
    (e.ids = [931]),
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
      96604: (e, t, s) => {
        "use strict";
        (s.r(t),
          s.d(t, {
            GlobalError: () => l.a,
            __next_app__: () => m,
            originalPathname: () => x,
            pages: () => d,
            routeModule: () => h,
            tree: () => c,
          }));
        var r = s(36577),
          a = s(55533),
          n = s(40443),
          l = s.n(n),
          i = s(53320),
          o = {};
        for (let e in i)
          0 >
            [
              "default",
              "tree",
              "pages",
              "GlobalError",
              "originalPathname",
              "__next_app__",
              "routeModule",
            ].indexOf(e) && (o[e] = () => i[e]);
        s.d(t, o);
        let c = [
            "",
            {
              children: [
                "__PAGE__",
                {},
                {
                  page: [
                    () => Promise.resolve().then(s.bind(s, 78401)),
                    "C:\\Users\\richl\\Care2system\\frontend\\app\\page.tsx",
                  ],
                },
              ],
            },
            {
              layout: [
                () => Promise.resolve().then(s.bind(s, 18685)),
                "C:\\Users\\richl\\Care2system\\frontend\\app\\layout.tsx",
              ],
              "not-found": [
                () => Promise.resolve().then(s.t.bind(s, 31459, 23)),
                "next/dist/client/components/not-found-error",
              ],
            },
          ],
          d = ["C:\\Users\\richl\\Care2system\\frontend\\app\\page.tsx"],
          x = "/page",
          m = { require: s, loadChunk: () => Promise.resolve() },
          h = new r.AppPageRouteModule({
            definition: {
              kind: a.x.APP_PAGE,
              page: "/page",
              pathname: "/",
              bundlePath: "",
              filename: "",
              appPaths: [],
            },
            userland: { loaderTree: c },
          });
      },
      20717: (e, t, s) => {
        (Promise.resolve().then(s.bind(s, 56253)),
          Promise.resolve().then(s.bind(s, 9690)),
          Promise.resolve().then(s.bind(s, 33999)));
      },
      19191: (e, t, s) => {
        (Promise.resolve().then(s.t.bind(s, 28913, 23)),
          Promise.resolve().then(s.t.bind(s, 50409, 23)),
          Promise.resolve().then(s.t.bind(s, 75054, 23)),
          Promise.resolve().then(s.t.bind(s, 34892, 23)),
          Promise.resolve().then(s.t.bind(s, 80356, 23)),
          Promise.resolve().then(s.t.bind(s, 73559, 23)));
      },
      69227: (e, t, s) => {
        Promise.resolve().then(s.t.bind(s, 30910, 23));
      },
      56253: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { Providers: () => i }));
        var r = s(73658),
          a = s(58758),
          n = s(60459),
          l = s(55459);
        function i({ children: e }) {
          let [t] = (0, l.useState)(
            () =>
              new a.S({
                defaultOptions: { queries: { staleTime: 3e5, gcTime: 6e5 } },
              }),
          );
          return r.jsx(n.aH, { client: t, children: e });
        }
      },
      9690: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => o }));
        var r = s(73658),
          a = s(84874),
          n = s.n(a),
          l = s(32241),
          i = s(17872);
        function o() {
          let e = (0, l.usePathname)();
          return "/system" === e
            ? null
            : r.jsx("header", {
                className: "bg-white shadow-sm border-b border-gray-200",
                children: r.jsx("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                  children: (0, r.jsxs)("div", {
                    className: "flex justify-between items-center py-4",
                    children: [
                      (0, r.jsxs)("div", {
                        className: "flex items-center gap-4",
                        children: [
                          r.jsx(n(), {
                            href: "/",
                            className: "flex items-center gap-2",
                            children: r.jsx("div", {
                              className: "text-3xl font-black text-blue-900",
                              children: "CareConnect",
                            }),
                          }),
                          r.jsx("div", {
                            className:
                              "hidden sm:block text-sm text-gray-600 font-medium border-l border-gray-300 pl-4",
                            children: "Community-Supported Homeless Initiative",
                          }),
                        ],
                      }),
                      (0, r.jsxs)("div", {
                        className: "flex items-center gap-6",
                        children: [
                          (0, r.jsxs)("nav", {
                            className: "hidden md:flex items-center gap-6",
                            children: [
                              r.jsx(n(), {
                                href: "/about",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "About",
                              }),
                              r.jsx(n(), {
                                href: "/resources",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Resources",
                              }),
                              r.jsx(n(), {
                                href: "/find",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Find",
                              }),
                              r.jsx(n(), {
                                href: "/support",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Support",
                              }),
                            ],
                          }),
                          (0, r.jsxs)(n(), {
                            href: "/system",
                            className:
                              "flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition group",
                            title: "System Diagnostics",
                            children: [
                              r.jsx(i.Z, {
                                size: 16,
                                className: "group-hover:text-blue-600",
                              }),
                              r.jsx("span", {
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
      18685: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => j, metadata: () => g }));
        var r = s(31487),
          a = s(72972),
          n = s.n(a);
        s(40642);
        var l = s(19894);
        let i = (0, l.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx`,
          ),
          { __esModule: o, $$typeof: c } = i;
        i.default;
        let d = (0, l.createProxy)(
          String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx#Providers`,
        );
        var x = s(15762);
        let m = (0, l.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\components\Header.tsx`,
          ),
          { __esModule: h, $$typeof: u } = m,
          p = m.default,
          g = {
            title: "CareConnect - Supporting Our Community",
            description:
              "A platform connecting individuals experiencing homelessness with resources, opportunities, and community support.",
            keywords:
              "homeless support, community resources, job opportunities, donations, assistance",
          };
        function j({ children: e }) {
          return r.jsx("html", {
            lang: "en",
            children: r.jsx("body", {
              className: n().className,
              children: (0, r.jsxs)(d, {
                children: [
                  r.jsx(p, {}),
                  r.jsx("div", {
                    className: "min-h-screen bg-gray-50",
                    children: r.jsx("main", { children: e }),
                  }),
                  r.jsx(x.x7, {
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
      78401: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => p }));
        var r = s(31487),
          a = s(35115),
          n = s.n(a),
          l = s(43196);
        let i = l.forwardRef(function ({ title: e, titleId: t, ...s }, r) {
            return l.createElement(
              "svg",
              Object.assign(
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  strokeWidth: 1.5,
                  stroke: "currentColor",
                  "aria-hidden": "true",
                  "data-slot": "icon",
                  ref: r,
                  "aria-labelledby": t,
                },
                s,
              ),
              e ? l.createElement("title", { id: t }, e) : null,
              l.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
              }),
            );
          }),
          o = l.forwardRef(function ({ title: e, titleId: t, ...s }, r) {
            return l.createElement(
              "svg",
              Object.assign(
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  strokeWidth: 1.5,
                  stroke: "currentColor",
                  "aria-hidden": "true",
                  "data-slot": "icon",
                  ref: r,
                  "aria-labelledby": t,
                },
                s,
              ),
              e ? l.createElement("title", { id: t }, e) : null,
              l.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.602H7.923a3.375 3.375 0 0 0-3.285 2.602l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m19.5 0a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3m19.5 0a3 3 0 0 0-3-3H5.25a3 3 0 0 0-3 3m16.5 0h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Z",
              }),
            );
          }),
          c = l.forwardRef(function ({ title: e, titleId: t, ...s }, r) {
            return l.createElement(
              "svg",
              Object.assign(
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  strokeWidth: 1.5,
                  stroke: "currentColor",
                  "aria-hidden": "true",
                  "data-slot": "icon",
                  ref: r,
                  "aria-labelledby": t,
                },
                s,
              ),
              e ? l.createElement("title", { id: t }, e) : null,
              l.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
              }),
            );
          }),
          d = l.forwardRef(function ({ title: e, titleId: t, ...s }, r) {
            return l.createElement(
              "svg",
              Object.assign(
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  strokeWidth: 1.5,
                  stroke: "currentColor",
                  "aria-hidden": "true",
                  "data-slot": "icon",
                  ref: r,
                  "aria-labelledby": t,
                },
                s,
              ),
              e ? l.createElement("title", { id: t }, e) : null,
              l.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
              }),
            );
          }),
          x = l.forwardRef(function ({ title: e, titleId: t, ...s }, r) {
            return l.createElement(
              "svg",
              Object.assign(
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  strokeWidth: 1.5,
                  stroke: "currentColor",
                  "aria-hidden": "true",
                  "data-slot": "icon",
                  ref: r,
                  "aria-labelledby": t,
                },
                s,
              ),
              e ? l.createElement("title", { id: t }, e) : null,
              l.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z",
              }),
            );
          }),
          m = l.forwardRef(function ({ title: e, titleId: t, ...s }, r) {
            return l.createElement(
              "svg",
              Object.assign(
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  strokeWidth: 1.5,
                  stroke: "currentColor",
                  "aria-hidden": "true",
                  "data-slot": "icon",
                  ref: r,
                  "aria-labelledby": t,
                },
                s,
              ),
              e ? l.createElement("title", { id: t }, e) : null,
              l.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z",
              }),
            );
          }),
          h = l.forwardRef(function ({ title: e, titleId: t, ...s }, r) {
            return l.createElement(
              "svg",
              Object.assign(
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  strokeWidth: 1.5,
                  stroke: "currentColor",
                  "aria-hidden": "true",
                  "data-slot": "icon",
                  ref: r,
                  "aria-labelledby": t,
                },
                s,
              ),
              e ? l.createElement("title", { id: t }, e) : null,
              l.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
              }),
              l.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z",
              }),
            );
          }),
          u = l.forwardRef(function ({ title: e, titleId: t, ...s }, r) {
            return l.createElement(
              "svg",
              Object.assign(
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  strokeWidth: 1.5,
                  stroke: "currentColor",
                  "aria-hidden": "true",
                  "data-slot": "icon",
                  ref: r,
                  "aria-labelledby": t,
                },
                s,
              ),
              e ? l.createElement("title", { id: t }, e) : null,
              l.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z",
              }),
            );
          });
        function p() {
          return (0, r.jsxs)("div", {
            className:
              "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50",
            children: [
              r.jsx("div", {
                className:
                  "bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-2.5 px-4 text-center text-sm font-semibold border-b-2 border-blue-700 shadow-md",
                children: (0, r.jsxs)("div", {
                  className:
                    "max-w-7xl mx-auto flex items-center justify-between",
                  children: [
                    r.jsx("div", { className: "flex-1" }),
                    (0, r.jsxs)("div", {
                      className: "flex items-center justify-center gap-2",
                      children: [
                        r.jsx(i, { className: "w-4 h-4" }),
                        r.jsx("span", { children: "Community Support Portal" }),
                        r.jsx("span", {
                          className: "hidden sm:inline text-blue-200 mx-2",
                          children: "•",
                        }),
                        r.jsx("span", {
                          className: "hidden sm:inline text-xs text-blue-200",
                          children: "Powered by Local Services",
                        }),
                      ],
                    }),
                    r.jsx("div", {
                      className: "flex-1 flex justify-end",
                      children: (0, r.jsxs)(n(), {
                        href: "/health",
                        className:
                          "flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors",
                        title: "System Health Dashboard",
                        children: [
                          r.jsx(o, { className: "w-4 h-4" }),
                          r.jsx("span", { children: "Status" }),
                        ],
                      }),
                    }),
                  ],
                }),
              }),
              (0, r.jsxs)("section", {
                className: "relative py-16 md:py-24",
                children: [
                  r.jsx("div", {
                    className: "absolute inset-0 opacity-[0.03]",
                    style: {
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)",
                      backgroundSize: "40px 40px",
                    },
                  }),
                  (0, r.jsxs)("div", {
                    className:
                      "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10",
                    children: [
                      r.jsx("div", {
                        className:
                          "bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 md:p-12",
                        children: (0, r.jsxs)("div", {
                          className: "grid md:grid-cols-2 gap-12 items-center",
                          children: [
                            (0, r.jsxs)("div", {
                              children: [
                                (0, r.jsxs)("div", {
                                  className:
                                    "inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-900 rounded-full text-sm font-bold mb-6 border border-blue-200",
                                  children: [
                                    r.jsx(c, { className: "w-4 h-4" }),
                                    r.jsx("span", {
                                      children:
                                        "A collaboration between local government and community partners",
                                    }),
                                  ],
                                }),
                                (0, r.jsxs)("h1", {
                                  className:
                                    "text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight",
                                  children: [
                                    "Welcome to",
                                    r.jsx("br", {}),
                                    r.jsx("span", {
                                      className: "text-blue-800",
                                      children: "CareConnect",
                                    }),
                                  ],
                                }),
                                r.jsx("p", {
                                  className:
                                    "text-lg text-gray-700 mb-8 leading-relaxed",
                                  children:
                                    "A Community-Supported Portal for People Experiencing Homelessness",
                                }),
                                (0, r.jsxs)("div", {
                                  className: "space-y-4 mb-8",
                                  children: [
                                    r.jsx("h3", {
                                      className:
                                        "font-bold text-gray-900 text-lg",
                                      children: "What You Can Do:",
                                    }),
                                    (0, r.jsxs)("div", {
                                      className: "flex items-start gap-3",
                                      children: [
                                        r.jsx(d, {
                                          className:
                                            "w-6 h-6 text-green-600 flex-shrink-0 mt-0.5",
                                        }),
                                        (0, r.jsxs)("div", {
                                          children: [
                                            r.jsx("h4", {
                                              className:
                                                "font-semibold text-gray-900",
                                              children: "Share Your Story",
                                            }),
                                            r.jsx("p", {
                                              className:
                                                "text-sm text-gray-600",
                                              children:
                                                "Record your voice to help others understand your journey",
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    (0, r.jsxs)("div", {
                                      className: "flex items-start gap-3",
                                      children: [
                                        r.jsx(d, {
                                          className:
                                            "w-6 h-6 text-green-600 flex-shrink-0 mt-0.5",
                                        }),
                                        (0, r.jsxs)("div", {
                                          children: [
                                            r.jsx("h4", {
                                              className:
                                                "font-semibold text-gray-900",
                                              children: "Get Support Tools",
                                            }),
                                            r.jsx("p", {
                                              className:
                                                "text-sm text-gray-600",
                                              children:
                                                "Create QR codes and fundraising materials",
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    (0, r.jsxs)("div", {
                                      className: "flex items-start gap-3",
                                      children: [
                                        r.jsx(d, {
                                          className:
                                            "w-6 h-6 text-green-600 flex-shrink-0 mt-0.5",
                                        }),
                                        (0, r.jsxs)("div", {
                                          children: [
                                            r.jsx("h4", {
                                              className:
                                                "font-semibold text-gray-900",
                                              children:
                                                "Connect with Community",
                                            }),
                                            r.jsx("p", {
                                              className:
                                                "text-sm text-gray-600",
                                              children:
                                                "Make it easy for people to help you",
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, r.jsxs)("div", {
                              className:
                                "flex flex-col items-center justify-center",
                              children: [
                                r.jsx(n(), {
                                  href: "/tell-your-story",
                                  children: (0, r.jsxs)("div", {
                                    className: "relative group cursor-pointer",
                                    children: [
                                      r.jsx("div", {
                                        className:
                                          "w-56 h-56 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-4 border-white animate-breathing",
                                        children: (0, r.jsxs)("div", {
                                          className:
                                            "text-center text-white px-4",
                                          children: [
                                            r.jsx(x, {
                                              className:
                                                "w-16 h-16 mx-auto mb-2 drop-shadow-lg",
                                            }),
                                            (0, r.jsxs)("div", {
                                              className:
                                                "font-extrabold text-base leading-tight tracking-wider",
                                              children: [
                                                "PRESS TO",
                                                r.jsx("br", {}),
                                                "TELL YOUR",
                                                r.jsx("br", {}),
                                                "STORY",
                                              ],
                                            }),
                                          ],
                                        }),
                                      }),
                                      r.jsx("div", {
                                        className:
                                          "absolute -inset-4 bg-red-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10",
                                      }),
                                    ],
                                  }),
                                }),
                                r.jsx("div", {
                                  className: "mt-8 text-center max-w-xs",
                                  children: (0, r.jsxs)("p", {
                                    className:
                                      "text-sm text-gray-600 font-medium leading-relaxed",
                                    children: [
                                      "You're in control. You can stop at any time.",
                                      r.jsx("br", {}),
                                      r.jsx("span", {
                                        className: "text-gray-800",
                                        children:
                                          "Your story helps connect you with support and resources.",
                                      }),
                                    ],
                                  }),
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                      (0, r.jsxs)("div", {
                        className: "mt-12",
                        children: [
                          r.jsx("h2", {
                            className:
                              "text-2xl font-bold text-center text-gray-900 mb-8",
                            children: "Additional Support Tools",
                          }),
                          r.jsx("p", {
                            className:
                              "text-center text-gray-600 mb-8 max-w-2xl mx-auto",
                            children:
                              "Everything you need to connect with your community",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              r.jsx("section", {
                className: "py-20 bg-white",
                children: (0, r.jsxs)("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                  children: [
                    (0, r.jsxs)("div", {
                      className: "text-center mb-16",
                      children: [
                        r.jsx("h3", {
                          className: "text-3xl font-bold text-gray-900 mb-4",
                          children: "How CareConnect Helps",
                        }),
                        r.jsx("p", {
                          className: "text-xl text-gray-600 max-w-2xl mx-auto",
                          children:
                            "transcription with native language support creates Our platform provides comprehensive support through technology, compassion, and community connection.",
                        }),
                      ],
                    }),
                    (0, r.jsxs)("div", {
                      className: "grid md:grid-cols-2 lg:grid-cols-4 gap-8",
                      children: [
                        (0, r.jsxs)("div", {
                          className: "card-hover text-center",
                          children: [
                            r.jsx("div", {
                              className:
                                "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4",
                              children: r.jsx(x, {
                                className: "w-8 h-8 text-blue-600",
                              }),
                            }),
                            r.jsx("h4", {
                              className: "text-xl font-semibold mb-3",
                              children: "Share Your Story",
                            }),
                            r.jsx("p", {
                              className: "text-gray-600",
                              children:
                                "Record your story with our easy-to-use voice recorder. AI helps create your profile while preserving your unique voice.",
                            }),
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          className: "card-hover text-center",
                          children: [
                            r.jsx("div", {
                              className:
                                "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4",
                              children: r.jsx(m, {
                                className: "w-8 h-8 text-green-600",
                              }),
                            }),
                            r.jsx("h4", {
                              className: "text-xl font-semibold mb-3",
                              children: "Find Work",
                            }),
                            r.jsx("p", {
                              className: "text-gray-600",
                              children:
                                "Get personalized job recommendations, cover letter assistance, and connect with employers who value your skills.",
                            }),
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          className: "card-hover text-center",
                          children: [
                            r.jsx("div", {
                              className:
                                "w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4",
                              children: r.jsx(h, {
                                className: "w-8 h-8 text-purple-600",
                              }),
                            }),
                            r.jsx("h4", {
                              className: "text-xl font-semibold mb-3",
                              children: "Access Resources",
                            }),
                            r.jsx("p", {
                              className: "text-gray-600",
                              children:
                                "Find local shelters, food banks, healthcare, job training, and other essential services in your area.",
                            }),
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          className: "card-hover text-center",
                          children: [
                            r.jsx("div", {
                              className:
                                "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4",
                              children: r.jsx(u, {
                                className: "w-8 h-8 text-red-600",
                              }),
                            }),
                            r.jsx("h4", {
                              className: "text-xl font-semibold mb-3",
                              children: "Receive Support",
                            }),
                            r.jsx("p", {
                              className: "text-gray-600",
                              children:
                                "Connect with donors who want to help, access an AI assistant for guidance, and join a supportive community.",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              r.jsx("section", {
                className: "py-20 bg-gray-50",
                children: (0, r.jsxs)("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                  children: [
                    (0, r.jsxs)("div", {
                      className: "text-center mb-16",
                      children: [
                        r.jsx("h3", {
                          className: "text-3xl font-bold text-gray-900 mb-4",
                          children: "Fundraising & Support Tools",
                        }),
                        r.jsx("p", {
                          className: "text-xl text-gray-600 max-w-2xl mx-auto",
                          children:
                            "Create professional fundraising materials and connect with donors through our AI-powered platform.",
                        }),
                      ],
                    }),
                    (0, r.jsxs)("div", {
                      className: "grid md:grid-cols-3 gap-8",
                      children: [
                        (0, r.jsxs)("div", {
                          className:
                            "bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow",
                          children: [
                            r.jsx("div", {
                              className:
                                "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4",
                              children: r.jsx(x, {
                                className: "w-8 h-8 text-blue-600",
                              }),
                            }),
                            r.jsx("h4", {
                              className: "text-xl font-bold text-center mb-3",
                              children: "Record Your Story",
                            }),
                            r.jsx("p", {
                              className: "text-gray-600 text-center mb-6",
                              children:
                                "Tell your story with our voice recorder. AI analyzes it and creates your profile automatically.",
                            }),
                            r.jsx(n(), {
                              href: "/tell-story",
                              className:
                                "block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors",
                              children: "Start Recording",
                            }),
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          className:
                            "bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow",
                          children: [
                            r.jsx("div", {
                              className:
                                "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4",
                              children: r.jsx("svg", {
                                className: "w-8 h-8 text-green-600",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: r.jsx("path", {
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: 2,
                                  d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                                }),
                              }),
                            }),
                            r.jsx("h4", {
                              className: "text-xl font-bold text-center mb-3",
                              children: "GoFundMe Creator",
                            }),
                            r.jsx("p", {
                              className: "text-gray-600 text-center mb-6",
                              children:
                                "AI helps create complete GoFundMe campaigns with auto-filled forms and step-by-step guidance.",
                            }),
                            r.jsx(n(), {
                              href: "/gfm/extract",
                              className:
                                "block w-full text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors",
                              children: "Create Campaign",
                            }),
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          className:
                            "bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow",
                          children: [
                            r.jsx("div", {
                              className:
                                "w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4",
                              children: r.jsx("svg", {
                                className: "w-8 h-8 text-purple-600",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: r.jsx("path", {
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: 2,
                                  d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
                                }),
                              }),
                            }),
                            r.jsx("h4", {
                              className: "text-xl font-bold text-center mb-3",
                              children: "QR Code Donations",
                            }),
                            r.jsx("p", {
                              className: "text-gray-600 text-center mb-6",
                              children:
                                "Generate QR codes for instant donations. People scan and donate with debit/credit cards securely.",
                            }),
                            r.jsx("div", {
                              className: "text-center",
                              children: r.jsx("span", {
                                className:
                                  "text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded",
                                children: "Generated with campaigns",
                              }),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              r.jsx("section", {
                className: "py-20 bg-gray-900",
                children: (0, r.jsxs)("div", {
                  className:
                    "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center",
                  children: [
                    r.jsx("h3", {
                      className:
                        "text-3xl md:text-4xl font-bold text-white mb-6",
                      children: "Ready to Share Your Story?",
                    }),
                    r.jsx("p", {
                      className: "text-xl text-gray-300 mb-8 max-w-2xl mx-auto",
                      children:
                        "Your experiences, skills, and dreams matter. Let us help you connect with the resources and opportunities you need.",
                    }),
                    (0, r.jsxs)(n(), {
                      href: "/tell-story",
                      className:
                        "btn-primary text-lg px-8 py-4 inline-flex items-center space-x-3",
                      children: [
                        r.jsx(x, { className: "w-6 h-6" }),
                        r.jsx("span", { children: "Get Started Now" }),
                      ],
                    }),
                  ],
                }),
              }),
              r.jsx("footer", {
                className: "bg-white border-t border-gray-200",
                children: (0, r.jsxs)("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
                  children: [
                    (0, r.jsxs)("div", {
                      className: "grid md:grid-cols-2 lg:grid-cols-5 gap-8",
                      children: [
                        (0, r.jsxs)("div", {
                          className: "col-span-2",
                          children: [
                            r.jsx("h4", {
                              className:
                                "text-lg font-semibold mb-4 gradient-text",
                              children: "CareConnect",
                            }),
                            r.jsx("p", {
                              className: "text-gray-600 mb-4",
                              children:
                                "Empowering individuals experiencing homelessness through technology, resources, and community support.",
                            }),
                            r.jsx("p", {
                              className: "text-sm text-gray-500",
                              children:
                                "Built with privacy, dignity, and respect at its core.",
                            }),
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          children: [
                            r.jsx("h5", {
                              className: "font-semibold mb-4",
                              children: "For Individuals",
                            }),
                            (0, r.jsxs)("ul", {
                              className: "space-y-2 text-gray-600",
                              children: [
                                r.jsx("li", {
                                  children: r.jsx(n(), {
                                    href: "/tell-story",
                                    className: "hover:text-gray-900",
                                    children: "Share Your Story",
                                  }),
                                }),
                                r.jsx("li", {
                                  children: r.jsx(n(), {
                                    href: "/resources",
                                    className: "hover:text-gray-900",
                                    children: "Find Resources",
                                  }),
                                }),
                                r.jsx("li", {
                                  children: r.jsx(n(), {
                                    href: "/jobs",
                                    className: "hover:text-gray-900",
                                    children: "Job Search",
                                  }),
                                }),
                                r.jsx("li", {
                                  children: r.jsx(n(), {
                                    href: "/privacy",
                                    className: "hover:text-gray-900",
                                    children: "Privacy Policy",
                                  }),
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          children: [
                            r.jsx("h5", {
                              className: "font-semibold mb-4",
                              children: "For Supporters",
                            }),
                            (0, r.jsxs)("ul", {
                              className: "space-y-2 text-gray-600",
                              children: [
                                r.jsx("li", {
                                  children: r.jsx(n(), {
                                    href: "/browse-profiles",
                                    className: "hover:text-gray-900",
                                    children: "Support Someone",
                                  }),
                                }),
                                r.jsx("li", {
                                  children: r.jsx(n(), {
                                    href: "/volunteer",
                                    className: "hover:text-gray-900",
                                    children: "Volunteer",
                                  }),
                                }),
                                r.jsx("li", {
                                  children: r.jsx(n(), {
                                    href: "/organizations",
                                    className: "hover:text-gray-900",
                                    children: "Partner With Us",
                                  }),
                                }),
                                r.jsx("li", {
                                  children: r.jsx(n(), {
                                    href: "/contact",
                                    className: "hover:text-gray-900",
                                    children: "Contact",
                                  }),
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          children: [
                            r.jsx("h5", {
                              className: "font-semibold mb-4",
                              children: "System Admin",
                            }),
                            (0, r.jsxs)("ul", {
                              className: "space-y-2 text-gray-600",
                              children: [
                                r.jsx("li", {
                                  children: r.jsx(n(), {
                                    href: "/health",
                                    className: "hover:text-gray-900",
                                    children: "System Health",
                                  }),
                                }),
                                r.jsx("li", {
                                  children: r.jsx(n(), {
                                    href: "/admin/knowledge",
                                    className: "hover:text-gray-900",
                                    children: "Knowledge Vault",
                                  }),
                                }),
                                r.jsx("li", {
                                  children: r.jsx(n(), {
                                    href: "/admin/knowledge/incidents",
                                    className: "hover:text-gray-900",
                                    children: "Pipeline Incidents",
                                  }),
                                }),
                                r.jsx("li", {
                                  children: r.jsx(n(), {
                                    href: "/admin/knowledge/audit",
                                    className: "hover:text-gray-900",
                                    children: "Audit Logs",
                                  }),
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    r.jsx("div", {
                      className:
                        "border-t border-gray-200 mt-8 pt-8 text-center text-gray-500",
                      children: r.jsx("p", {
                        children:
                          "\xa9 2024 CareConnect. Made with ❤️ for our community.",
                      }),
                    }),
                  ],
                }),
              }),
            ],
          });
        }
      },
      43462: (e, t, s) => {
        "use strict";
        let { createProxy: r } = s(19894);
        e.exports = r(
          "C:\\Users\\richl\\Care2system\\node_modules\\next\\dist\\client\\link.js",
        );
      },
      35115: (e, t, s) => {
        "use strict";
        e.exports = s(43462);
      },
      40642: () => {},
    }));
  var t = require("../webpack-runtime.js");
  t.C(e);
  var s = (e) => t((t.s = e)),
    r = t.X(0, [623, 934], () => s(96604));
  module.exports = r;
})();

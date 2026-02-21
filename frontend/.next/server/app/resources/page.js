(() => {
  var e = {};
  ((e.id = 126),
    (e.ids = [126]),
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
      45338: (e, t, r) => {
        "use strict";
        (r.r(t),
          r.d(t, {
            GlobalError: () => a.a,
            __next_app__: () => u,
            originalPathname: () => m,
            pages: () => d,
            routeModule: () => x,
            tree: () => c,
          }));
        var s = r(36577),
          n = r(55533),
          i = r(40443),
          a = r.n(i),
          o = r(53320),
          l = {};
        for (let e in o)
          0 >
            [
              "default",
              "tree",
              "pages",
              "GlobalError",
              "originalPathname",
              "__next_app__",
              "routeModule",
            ].indexOf(e) && (l[e] = () => o[e]);
        r.d(t, l);
        let c = [
            "",
            {
              children: [
                "resources",
                {
                  children: [
                    "__PAGE__",
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(r.bind(r, 89479)),
                        "C:\\Users\\richl\\Care2system\\frontend\\app\\resources\\page.tsx",
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
          d = [
            "C:\\Users\\richl\\Care2system\\frontend\\app\\resources\\page.tsx",
          ],
          m = "/resources/page",
          u = { require: r, loadChunk: () => Promise.resolve() },
          x = new s.AppPageRouteModule({
            definition: {
              kind: n.x.APP_PAGE,
              page: "/resources/page",
              pathname: "/resources",
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
      91210: (e, t, r) => {
        Promise.resolve().then(r.bind(r, 8177));
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
        (r.r(t), r.d(t, { Providers: () => o }));
        var s = r(73658),
          n = r(58758),
          i = r(60459),
          a = r(55459);
        function o({ children: e }) {
          let [t] = (0, a.useState)(
            () =>
              new n.S({
                defaultOptions: { queries: { staleTime: 3e5, gcTime: 6e5 } },
              }),
          );
          return s.jsx(i.aH, { client: t, children: e });
        }
      },
      8177: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { default: () => h }));
        var s = r(73658),
          n = r(55459),
          i = r(84874),
          a = r.n(i),
          o = r(38207),
          l = r(87990);
        let c = n.forwardRef(function ({ title: e, titleId: t, ...r }, s) {
          return n.createElement(
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
                ref: s,
                "aria-labelledby": t,
              },
              r,
            ),
            e ? n.createElement("title", { id: t }, e) : null,
            n.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              d: "M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819",
            }),
          );
        });
        var d = r(17287);
        let m = n.forwardRef(function ({ title: e, titleId: t, ...r }, s) {
          return n.createElement(
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
                ref: s,
                "aria-labelledby": t,
              },
              r,
            ),
            e ? n.createElement("title", { id: t }, e) : null,
            n.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              d: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z",
            }),
          );
        });
        var u = r(7673);
        let x = n.forwardRef(function ({ title: e, titleId: t, ...r }, s) {
          return n.createElement(
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
                ref: s,
                "aria-labelledby": t,
              },
              r,
            ),
            e ? n.createElement("title", { id: t }, e) : null,
            n.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              d: "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z",
            }),
          );
        });
        function h() {
          return (0, s.jsxs)("div", {
            className:
              "min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50",
            children: [
              s.jsx("div", {
                className: "bg-white shadow-sm border-b",
                children: s.jsx("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
                  children: (0, s.jsxs)(o.E.div, {
                    initial: { opacity: 0, y: -20 },
                    animate: { opacity: 1, y: 0 },
                    className: "text-center",
                    children: [
                      s.jsx(l.Z, {
                        className: "w-16 h-16 text-blue-600 mx-auto mb-4",
                      }),
                      s.jsx("h1", {
                        className: "text-4xl font-black text-gray-900 mb-2",
                        children: "Resource Discovery",
                      }),
                      s.jsx("p", {
                        className: "text-xl text-gray-600",
                        children:
                          "Connecting you with essential services and opportunities",
                      }),
                    ],
                  }),
                }),
              }),
              (0, s.jsxs)("div", {
                className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16",
                children: [
                  (0, s.jsxs)(o.E.div, {
                    initial: { opacity: 0, scale: 0.95 },
                    animate: { opacity: 1, scale: 1 },
                    transition: { delay: 0.2 },
                    className:
                      "bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-xl p-8 mb-12 text-center",
                    children: [
                      s.jsx("div", {
                        className: "inline-block mb-4",
                        children: s.jsx("span", {
                          className:
                            "px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-bold",
                          children: "V2 FEATURE",
                        }),
                      }),
                      s.jsx("h2", {
                        className: "text-3xl font-bold text-gray-900 mb-4",
                        children: "In Development for V2 Release",
                      }),
                      s.jsx("p", {
                        className:
                          "text-lg text-gray-700 max-w-2xl mx-auto mb-6",
                        children:
                          "We're building a comprehensive resource discovery system that will help you find and access essential services in real-time. This feature will be part of our V2 platform with AI-powered assistance.",
                      }),
                      s.jsx(a(), {
                        href: "/about",
                        className:
                          "inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors",
                        children: "Learn About V2 Roadmap",
                      }),
                    ],
                  }),
                  (0, s.jsxs)(o.E.div, {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: { delay: 0.4 },
                    className: "mb-12",
                    children: [
                      s.jsx("h2", {
                        className:
                          "text-2xl font-bold text-gray-900 mb-6 text-center",
                        children: "What's Coming in V2",
                      }),
                      s.jsx("div", {
                        className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6",
                        children: [
                          {
                            icon: c,
                            title: "Shelter Availability",
                            description:
                              "Real-time bed availability at nearby shelters with direct contact information",
                            color: "blue",
                          },
                          {
                            icon: d.Z,
                            title: "Food Programs",
                            description:
                              "Locations and schedules for food banks, soup kitchens, and meal programs",
                            color: "red",
                          },
                          {
                            icon: m,
                            title: "Support Services",
                            description:
                              "Healthcare, mental health, addiction recovery, and counseling services",
                            color: "green",
                          },
                          {
                            icon: u.Z,
                            title: "Employment Help",
                            description:
                              "Job listings, training programs, and career development resources",
                            color: "orange",
                          },
                          {
                            icon: x,
                            title: "Location-Based Search",
                            description:
                              "Find resources near you with maps and directions",
                            color: "purple",
                          },
                          {
                            icon: l.Z,
                            title: "AI-Guided Navigation",
                            description:
                              "Personalized assistance to help you access the right resources",
                            color: "indigo",
                          },
                        ].map((e, t) =>
                          (0, s.jsxs)(
                            o.E.div,
                            {
                              initial: { opacity: 0, y: 20 },
                              animate: { opacity: 1, y: 0 },
                              transition: { delay: 0.5 + 0.1 * t },
                              className:
                                "bg-white rounded-lg p-6 shadow-md border-2 border-dashed border-gray-200",
                              children: [
                                s.jsx(e.icon, {
                                  className: `w-12 h-12 text-${e.color}-600 mb-4`,
                                }),
                                s.jsx("h3", {
                                  className:
                                    "text-lg font-bold text-gray-900 mb-2",
                                  children: e.title,
                                }),
                                s.jsx("p", {
                                  className: "text-gray-600 text-sm",
                                  children: e.description,
                                }),
                              ],
                            },
                            t,
                          ),
                        ),
                      }),
                    ],
                  }),
                  (0, s.jsxs)(o.E.div, {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.8 },
                    className:
                      "bg-white rounded-xl p-8 shadow-lg border-2 border-blue-200",
                    children: [
                      s.jsx("h2", {
                        className:
                          "text-2xl font-bold text-gray-900 mb-4 text-center",
                        children: "What You Can Do Right Now",
                      }),
                      s.jsx("p", {
                        className: "text-gray-600 text-center mb-6",
                        children:
                          "While we build V2, you can use these features today:",
                      }),
                      (0, s.jsxs)("div", {
                        className: "grid md:grid-cols-2 gap-4",
                        children: [
                          (0, s.jsxs)(a(), {
                            href: "/tell-story",
                            className:
                              "flex flex-col items-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border-2 border-blue-200",
                            children: [
                              s.jsx("div", {
                                className:
                                  "w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3",
                                children: s.jsx("svg", {
                                  className: "w-6 h-6 text-white",
                                  fill: "none",
                                  viewBox: "0 0 24 24",
                                  stroke: "currentColor",
                                  children: s.jsx("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
                                  }),
                                }),
                              }),
                              s.jsx("h3", {
                                className: "font-bold text-gray-900 mb-1",
                                children: "Tell Your Story",
                              }),
                              s.jsx("p", {
                                className: "text-sm text-gray-600 text-center",
                                children: "Create your fundraising profile",
                              }),
                            ],
                          }),
                          (0, s.jsxs)(a(), {
                            href: "/support",
                            className:
                              "flex flex-col items-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border-2 border-purple-200",
                            children: [
                              s.jsx("div", {
                                className:
                                  "w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3",
                                children: s.jsx("svg", {
                                  className: "w-6 h-6 text-white",
                                  fill: "none",
                                  viewBox: "0 0 24 24",
                                  stroke: "currentColor",
                                  children: s.jsx("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
                                  }),
                                }),
                              }),
                              s.jsx("h3", {
                                className: "font-bold text-gray-900 mb-1",
                                children: "Get Support",
                              }),
                              s.jsx("p", {
                                className: "text-sm text-gray-600 text-center",
                                children: "Submit a support ticket",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  s.jsx(o.E.div, {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: { delay: 1 },
                    className: "mt-12 text-center text-gray-500 text-sm",
                    children: (0, s.jsxs)("p", {
                      children: [
                        "Have feedback or suggestions for the resources you'd like to see?",
                        " ",
                        s.jsx(a(), {
                          href: "/support",
                          className:
                            "text-blue-600 hover:underline font-semibold",
                          children: "Let us know",
                        }),
                      ],
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
        (r.r(t), r.d(t, { default: () => l }));
        var s = r(73658),
          n = r(84874),
          i = r.n(n),
          a = r(32241),
          o = r(17872);
        function l() {
          let e = (0, a.usePathname)();
          return "/system" === e
            ? null
            : s.jsx("header", {
                className: "bg-white shadow-sm border-b border-gray-200",
                children: s.jsx("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                  children: (0, s.jsxs)("div", {
                    className: "flex justify-between items-center py-4",
                    children: [
                      (0, s.jsxs)("div", {
                        className: "flex items-center gap-4",
                        children: [
                          s.jsx(i(), {
                            href: "/",
                            className: "flex items-center gap-2",
                            children: s.jsx("div", {
                              className: "text-3xl font-black text-blue-900",
                              children: "CareConnect",
                            }),
                          }),
                          s.jsx("div", {
                            className:
                              "hidden sm:block text-sm text-gray-600 font-medium border-l border-gray-300 pl-4",
                            children: "Community-Supported Homeless Initiative",
                          }),
                        ],
                      }),
                      (0, s.jsxs)("div", {
                        className: "flex items-center gap-6",
                        children: [
                          (0, s.jsxs)("nav", {
                            className: "hidden md:flex items-center gap-6",
                            children: [
                              s.jsx(i(), {
                                href: "/about",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "About",
                              }),
                              s.jsx(i(), {
                                href: "/resources",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Resources",
                              }),
                              s.jsx(i(), {
                                href: "/find",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Find",
                              }),
                              s.jsx(i(), {
                                href: "/support",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Support",
                              }),
                            ],
                          }),
                          (0, s.jsxs)(i(), {
                            href: "/system",
                            className:
                              "flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition group",
                            title: "System Diagnostics",
                            children: [
                              s.jsx(o.Z, {
                                size: 16,
                                className: "group-hover:text-blue-600",
                              }),
                              s.jsx("span", {
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
      18685: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { default: () => b, metadata: () => g }));
        var s = r(31487),
          n = r(72972),
          i = r.n(n);
        r(40642);
        var a = r(19894);
        let o = (0, a.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx`,
          ),
          { __esModule: l, $$typeof: c } = o;
        o.default;
        let d = (0, a.createProxy)(
          String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx#Providers`,
        );
        var m = r(15762);
        let u = (0, a.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\components\Header.tsx`,
          ),
          { __esModule: x, $$typeof: h } = u,
          p = u.default,
          g = {
            title: "CareConnect - Supporting Our Community",
            description:
              "A platform connecting individuals experiencing homelessness with resources, opportunities, and community support.",
            keywords:
              "homeless support, community resources, job opportunities, donations, assistance",
          };
        function b({ children: e }) {
          return s.jsx("html", {
            lang: "en",
            children: s.jsx("body", {
              className: i().className,
              children: (0, s.jsxs)(d, {
                children: [
                  s.jsx(p, {}),
                  s.jsx("div", {
                    className: "min-h-screen bg-gray-50",
                    children: s.jsx("main", { children: e }),
                  }),
                  s.jsx(m.x7, {
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
      89479: (e, t, r) => {
        "use strict";
        (r.r(t),
          r.d(t, { $$typeof: () => a, __esModule: () => i, default: () => l }));
        var s = r(19894);
        let n = (0, s.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\resources\page.tsx`,
          ),
          { __esModule: i, $$typeof: a } = n,
          o = n.default,
          l = o;
      },
      40642: () => {},
      7673: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var s = r(55459);
        let n = s.forwardRef(function ({ title: e, titleId: t, ...r }, n) {
            return s.createElement(
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
                  ref: n,
                  "aria-labelledby": t,
                },
                r,
              ),
              e ? s.createElement("title", { id: t }, e) : null,
              s.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z",
              }),
            );
          }),
          i = n;
      },
      17287: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var s = r(55459);
        let n = s.forwardRef(function ({ title: e, titleId: t, ...r }, n) {
            return s.createElement(
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
                  ref: n,
                  "aria-labelledby": t,
                },
                r,
              ),
              e ? s.createElement("title", { id: t }, e) : null,
              s.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z",
              }),
            );
          }),
          i = n;
      },
      87990: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var s = r(55459);
        let n = s.forwardRef(function ({ title: e, titleId: t, ...r }, n) {
            return s.createElement(
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
                  ref: n,
                  "aria-labelledby": t,
                },
                r,
              ),
              e ? s.createElement("title", { id: t }, e) : null,
              s.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z",
              }),
            );
          }),
          i = n;
      },
    }));
  var t = require("../../webpack-runtime.js");
  t.C(e);
  var r = (e) => t((t.s = e)),
    s = t.X(0, [623, 934, 207], () => r(45338));
  module.exports = s;
})();

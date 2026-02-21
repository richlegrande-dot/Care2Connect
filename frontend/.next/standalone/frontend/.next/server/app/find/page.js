(() => {
  var e = {};
  ((e.id = 199),
    (e.ids = [199]),
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
      51516: (e, t, s) => {
        "use strict";
        (s.r(t),
          s.d(t, {
            GlobalError: () => n.a,
            __next_app__: () => m,
            originalPathname: () => x,
            pages: () => c,
            routeModule: () => h,
            tree: () => d,
          }));
        var r = s(36577),
          a = s(55533),
          i = s(40443),
          n = s.n(i),
          l = s(53320),
          o = {};
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
            ].indexOf(e) && (o[e] = () => l[e]);
        s.d(t, o);
        let d = [
            "",
            {
              children: [
                "find",
                {
                  children: [
                    "__PAGE__",
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(s.bind(s, 89989)),
                        "C:\\Users\\richl\\Care2system\\frontend\\app\\find\\page.tsx",
                      ],
                    },
                  ],
                },
                {},
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
          c = ["C:\\Users\\richl\\Care2system\\frontend\\app\\find\\page.tsx"],
          x = "/find/page",
          m = { require: s, loadChunk: () => Promise.resolve() },
          h = new r.AppPageRouteModule({
            definition: {
              kind: a.x.APP_PAGE,
              page: "/find/page",
              pathname: "/find",
              bundlePath: "",
              filename: "",
              appPaths: [],
            },
            userland: { loaderTree: d },
          });
      },
      64450: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 28769));
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
      28769: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => m }));
        var r = s(73658),
          a = s(55459),
          i = s(84874),
          n = s.n(i),
          l = s(38207),
          o = s(6561),
          d = s(52797);
        let c = a.forwardRef(function ({ title: e, titleId: t, ...s }, r) {
          return a.createElement(
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
            e ? a.createElement("title", { id: t }, e) : null,
            a.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
            }),
          );
        });
        var x = s(60846);
        function m() {
          let [e, t] = (0, a.useState)("id"),
            [s, i] = (0, a.useState)(""),
            [m, h] = (0, a.useState)(!1),
            [u, p] = (0, a.useState)([]),
            [g, b] = (0, a.useState)(""),
            [y, f] = (0, a.useState)(!1),
            v = (e) =>
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                e,
              ),
            j = async (t) => {
              (t.preventDefault(), h(!0), b(""), p([]), f(!0));
              try {
                if (!s.trim()) throw Error("Please enter a search value");
                if ("id" === e) {
                  if (!v(s.trim()))
                    throw Error(
                      "Invalid ticket ID format. Please enter a valid UUID.",
                    );
                  try {
                    let e = await x.h.get(`/tickets/${s.trim()}`);
                    p([e]);
                  } catch (e) {
                    if (404 === e.status)
                      throw Error("No ticket found with this ID");
                    throw e;
                  }
                } else {
                  let t = await x.h.get("/profiles/search", {
                    contact: s.trim(),
                    type: e,
                  });
                  p(t);
                }
              } catch (e) {
                b(e.message || "Search failed. Please try again.");
              } finally {
                h(!1);
              }
            },
            w = (e) =>
              new Date(e).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
            N = (e) =>
              ({
                DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-300",
                PUBLISHED: "bg-green-100 text-green-800 border-green-300",
                PENDING: "bg-blue-100 text-blue-800 border-blue-300",
                CLOSED: "bg-gray-100 text-gray-800 border-gray-300",
              })[e] || "bg-gray-100 text-gray-800 border-gray-300";
          return (0, r.jsxs)("div", {
            className:
              "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50",
            children: [
              r.jsx("div", {
                className: "bg-white shadow-sm border-b",
                children: r.jsx("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
                  children: (0, r.jsxs)(l.E.div, {
                    initial: { opacity: 0, y: -20 },
                    animate: { opacity: 1, y: 0 },
                    className: "text-center",
                    children: [
                      r.jsx(o.Z, {
                        className: "w-16 h-16 text-indigo-600 mx-auto mb-4",
                      }),
                      r.jsx("h1", {
                        className: "text-4xl font-black text-gray-900 mb-2",
                        children: "Find a Profile",
                      }),
                      r.jsx("p", {
                        className: "text-xl text-gray-600",
                        children: "Search for profiles to view or support",
                      }),
                    ],
                  }),
                }),
              }),
              (0, r.jsxs)("div", {
                className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
                children: [
                  r.jsx(l.E.div, {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.1 },
                    className:
                      "bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-indigo-100",
                    children: (0, r.jsxs)("form", {
                      onSubmit: j,
                      className: "space-y-6",
                      children: [
                        (0, r.jsxs)("div", {
                          children: [
                            r.jsx("label", {
                              className:
                                "block text-sm font-semibold text-gray-900 mb-3",
                              children: "Search By",
                            }),
                            r.jsx("div", {
                              className: "grid grid-cols-3 gap-3",
                              children: [
                                {
                                  value: "id",
                                  label: "Ticket ID",
                                  icon: "\uD83C\uDFAB",
                                },
                                { value: "email", label: "Email", icon: "✉️" },
                                {
                                  value: "phone",
                                  label: "Phone",
                                  icon: "\uD83D\uDCF1",
                                },
                              ].map((s) =>
                                (0, r.jsxs)(
                                  "button",
                                  {
                                    type: "button",
                                    onClick: () => {
                                      (t(s.value), i(""), p([]), b(""), f(!1));
                                    },
                                    className: `px-4 py-3 rounded-lg font-semibold transition-all ${e === s.value ? "bg-indigo-600 text-white shadow-lg scale-105" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
                                    children: [
                                      r.jsx("span", {
                                        className: "mr-2",
                                        children: s.icon,
                                      }),
                                      s.label,
                                    ],
                                  },
                                  s.value,
                                ),
                              ),
                            }),
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          children: [
                            r.jsx("label", {
                              htmlFor: "searchValue",
                              className:
                                "block text-sm font-semibold text-gray-900 mb-2",
                              children:
                                "id" === e
                                  ? "Ticket ID"
                                  : "email" === e
                                    ? "Email Address"
                                    : "Phone Number",
                            }),
                            (0, r.jsxs)("div", {
                              className: "relative",
                              children: [
                                r.jsx("input", {
                                  type: "text",
                                  id: "searchValue",
                                  value: s,
                                  onChange: (e) => i(e.target.value),
                                  placeholder:
                                    "id" === e
                                      ? "e.g., 123e4567-e89b-12d3-a456-426614174000"
                                      : "email" === e
                                        ? "e.g., person@example.com"
                                        : "e.g., +1234567890",
                                  className:
                                    "w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors",
                                  required: !0,
                                }),
                                r.jsx(o.Z, {
                                  className:
                                    "absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400",
                                }),
                              ],
                            }),
                            "id" === e &&
                              r.jsx("p", {
                                className: "text-xs text-gray-500 mt-1",
                                children:
                                  "Ticket ID is a UUID format (e.g., xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)",
                              }),
                          ],
                        }),
                        r.jsx("button", {
                          type: "submit",
                          disabled: m,
                          className:
                            "w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl",
                          children: m
                            ? (0, r.jsxs)("span", {
                                className:
                                  "flex items-center justify-center gap-2",
                                children: [
                                  (0, r.jsxs)("svg", {
                                    className: "animate-spin h-5 w-5",
                                    viewBox: "0 0 24 24",
                                    children: [
                                      r.jsx("circle", {
                                        className: "opacity-25",
                                        cx: "12",
                                        cy: "12",
                                        r: "10",
                                        stroke: "currentColor",
                                        strokeWidth: "4",
                                        fill: "none",
                                      }),
                                      r.jsx("path", {
                                        className: "opacity-75",
                                        fill: "currentColor",
                                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
                                      }),
                                    ],
                                  }),
                                  "Searching...",
                                ],
                              })
                            : "Search",
                        }),
                      ],
                    }),
                  }),
                  g &&
                    r.jsx(l.E.div, {
                      initial: { opacity: 0, scale: 0.95 },
                      animate: { opacity: 1, scale: 1 },
                      className:
                        "mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4",
                      children: r.jsx("p", {
                        className: "text-red-800 font-semibold",
                        children: g,
                      }),
                    }),
                  y &&
                    !m &&
                    0 === u.length &&
                    !g &&
                    (0, r.jsxs)(l.E.div, {
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      className:
                        "text-center py-12 bg-white rounded-xl shadow-md border-2 border-gray-200",
                      children: [
                        r.jsx(d.Z, {
                          className: "w-16 h-16 text-gray-400 mx-auto mb-4",
                        }),
                        r.jsx("h3", {
                          className: "text-xl font-bold text-gray-900 mb-2",
                          children: "No Results Found",
                        }),
                        r.jsx("p", {
                          className: "text-gray-600 mb-4",
                          children: "No profiles match your search criteria",
                        }),
                        (0, r.jsxs)("p", {
                          className: "text-sm text-gray-500",
                          children: [
                            "Try searching with a different ",
                            "id" === e ? "ticket ID" : e,
                          ],
                        }),
                      ],
                    }),
                  u.length > 0 &&
                    (0, r.jsxs)(l.E.div, {
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      className: "space-y-4",
                      children: [
                        (0, r.jsxs)("h2", {
                          className: "text-2xl font-bold text-gray-900 mb-4",
                          children: [
                            u.length,
                            " ",
                            1 === u.length ? "Profile" : "Profiles",
                            " Found",
                          ],
                        }),
                        u.map((e, t) =>
                          r.jsx(
                            l.E.div,
                            {
                              initial: { opacity: 0, x: -20 },
                              animate: { opacity: 1, x: 0 },
                              transition: { delay: 0.1 * t },
                              className:
                                "bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all p-6",
                              children: r.jsx("div", {
                                className: "flex items-start justify-between",
                                children: (0, r.jsxs)("div", {
                                  className: "flex-1",
                                  children: [
                                    (0, r.jsxs)("div", {
                                      className: "flex items-center gap-3 mb-2",
                                      children: [
                                        r.jsx(d.Z, {
                                          className: "w-8 h-8 text-indigo-600",
                                        }),
                                        r.jsx("h3", {
                                          className:
                                            "text-xl font-bold text-gray-900",
                                          children:
                                            e.displayName || "Anonymous",
                                        }),
                                        r.jsx("span", {
                                          className: `px-3 py-1 rounded-full text-xs font-semibold border ${N(e.status)}`,
                                          children: e.status,
                                        }),
                                      ],
                                    }),
                                    (0, r.jsxs)("div", {
                                      className:
                                        "flex items-center gap-4 text-sm text-gray-600 mb-4",
                                      children: [
                                        (0, r.jsxs)("div", {
                                          className: "flex items-center gap-1",
                                          children: [
                                            r.jsx(c, { className: "w-4 h-4" }),
                                            (0, r.jsxs)("span", {
                                              children: [
                                                "Created ",
                                                w(e.createdAt),
                                              ],
                                            }),
                                          ],
                                        }),
                                        (0, r.jsxs)("div", {
                                          className:
                                            "font-mono text-xs text-gray-500",
                                          children: [
                                            "ID: ",
                                            e.id.slice(0, 8),
                                            "...",
                                          ],
                                        }),
                                      ],
                                    }),
                                    (0, r.jsxs)(n(), {
                                      href: `/profile/${e.id}`,
                                      className:
                                        "inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors",
                                      children: [
                                        "View Profile",
                                        r.jsx("svg", {
                                          className: "w-4 h-4",
                                          fill: "none",
                                          viewBox: "0 0 24 24",
                                          stroke: "currentColor",
                                          children: r.jsx("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 2,
                                            d: "M9 5l7 7-7 7",
                                          }),
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              }),
                            },
                            e.id,
                          ),
                        ),
                      ],
                    }),
                  (0, r.jsxs)(l.E.div, {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: { delay: 0.4 },
                    className:
                      "mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-200",
                    children: [
                      r.jsx("h3", {
                        className:
                          "font-bold text-gray-900 mb-4 text-center text-xl",
                        children: "Need Help Finding Someone?",
                      }),
                      (0, r.jsxs)("div", {
                        className: "grid md:grid-cols-2 gap-4 text-sm",
                        children: [
                          (0, r.jsxs)("div", {
                            className:
                              "bg-white rounded-lg p-4 border border-blue-200",
                            children: [
                              r.jsx("h4", {
                                className: "font-semibold text-gray-900 mb-2",
                                children: "Search by Ticket ID",
                              }),
                              r.jsx("p", {
                                className: "text-gray-600",
                                children:
                                  "If you have the exact ticket ID (UUID format), you can search directly for that profile",
                              }),
                            ],
                          }),
                          (0, r.jsxs)("div", {
                            className:
                              "bg-white rounded-lg p-4 border border-purple-200",
                            children: [
                              r.jsx("h4", {
                                className: "font-semibold text-gray-900 mb-2",
                                children: "Search by Contact",
                              }),
                              r.jsx("p", {
                                className: "text-gray-600",
                                children:
                                  "Search by email or phone number to find profiles associated with that contact information",
                              }),
                            ],
                          }),
                        ],
                      }),
                      r.jsx("div", {
                        className: "mt-4 text-center",
                        children: r.jsx(n(), {
                          href: "/support",
                          className:
                            "text-indigo-600 hover:underline font-semibold",
                          children:
                            "Still can't find who you're looking for? Contact support",
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        }
      },
      56253: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { Providers: () => l }));
        var r = s(73658),
          a = s(58758),
          i = s(60459),
          n = s(55459);
        function l({ children: e }) {
          let [t] = (0, n.useState)(
            () =>
              new a.S({
                defaultOptions: { queries: { staleTime: 3e5, gcTime: 6e5 } },
              }),
          );
          return r.jsx(i.aH, { client: t, children: e });
        }
      },
      9690: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => o }));
        var r = s(73658),
          a = s(84874),
          i = s.n(a),
          n = s(32241),
          l = s(17872);
        function o() {
          let e = (0, n.usePathname)();
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
                          r.jsx(i(), {
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
                              r.jsx(i(), {
                                href: "/about",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "About",
                              }),
                              r.jsx(i(), {
                                href: "/resources",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Resources",
                              }),
                              r.jsx(i(), {
                                href: "/find",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Find",
                              }),
                              r.jsx(i(), {
                                href: "/support",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Support",
                              }),
                            ],
                          }),
                          (0, r.jsxs)(i(), {
                            href: "/system",
                            className:
                              "flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition group",
                            title: "System Diagnostics",
                            children: [
                              r.jsx(l.Z, {
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
      60846: (e, t, s) => {
        "use strict";
        s.d(t, { h: () => a });
        class r {
          async request(e, t = {}) {
            let s = `${this.baseUrl}${e}`;
            try {
              let e = await fetch(s, {
                  ...t,
                  headers: { "Content-Type": "application/json", ...t.headers },
                }),
                r = e.headers.get("content-type"),
                a = r?.includes("application/json");
              if (!e.ok) {
                let t = Error(a ? (await e.json()).error : e.statusText);
                throw ((t.status = e.status), t);
              }
              return a ? await e.json() : await e.text();
            } catch (e) {
              throw (e.status || (e.status = 0), e);
            }
          }
          async get(e, t) {
            let s = t ? "?" + new URLSearchParams(t).toString() : "";
            return this.request(`${e}${s}`, { method: "GET" });
          }
          async post(e, t) {
            return this.request(e, { method: "POST", body: JSON.stringify(t) });
          }
          async put(e, t) {
            return this.request(e, { method: "PUT", body: JSON.stringify(t) });
          }
          async delete(e) {
            return this.request(e, { method: "DELETE" });
          }
          async checkHealth() {
            return this.get("/health/status");
          }
          async checkDbHealth() {
            return this.get("/health/db");
          }
          constructor() {
            this.baseUrl = "/api";
          }
        }
        let a = new r();
      },
      89989: (e, t, s) => {
        "use strict";
        (s.r(t),
          s.d(t, { $$typeof: () => n, __esModule: () => i, default: () => o }));
        var r = s(19894);
        let a = (0, r.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\find\page.tsx`,
          ),
          { __esModule: i, $$typeof: n } = a,
          l = a.default,
          o = l;
      },
      18685: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => b, metadata: () => g }));
        var r = s(31487),
          a = s(72972),
          i = s.n(a);
        s(40642);
        var n = s(19894);
        let l = (0, n.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx`,
          ),
          { __esModule: o, $$typeof: d } = l;
        l.default;
        let c = (0, n.createProxy)(
          String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx#Providers`,
        );
        var x = s(15762);
        let m = (0, n.createProxy)(
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
        function b({ children: e }) {
          return r.jsx("html", {
            lang: "en",
            children: r.jsx("body", {
              className: i().className,
              children: (0, r.jsxs)(c, {
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
      40642: () => {},
      6561: (e, t, s) => {
        "use strict";
        s.d(t, { Z: () => i });
        var r = s(55459);
        let a = r.forwardRef(function ({ title: e, titleId: t, ...s }, a) {
            return r.createElement(
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
                  ref: a,
                  "aria-labelledby": t,
                },
                s,
              ),
              e ? r.createElement("title", { id: t }, e) : null,
              r.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
              }),
            );
          }),
          i = a;
      },
      52797: (e, t, s) => {
        "use strict";
        s.d(t, { Z: () => i });
        var r = s(55459);
        let a = r.forwardRef(function ({ title: e, titleId: t, ...s }, a) {
            return r.createElement(
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
                  ref: a,
                  "aria-labelledby": t,
                },
                s,
              ),
              e ? r.createElement("title", { id: t }, e) : null,
              r.createElement("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
              }),
            );
          }),
          i = a;
      },
    }));
  var t = require("../../webpack-runtime.js");
  t.C(e);
  var s = (e) => t((t.s = e)),
    r = t.X(0, [623, 934, 207], () => s(51516));
  module.exports = r;
})();

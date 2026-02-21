(() => {
  var e = {};
  ((e.id = 220),
    (e.ids = [220]),
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
      3893: (e, t, s) => {
        "use strict";
        (s.r(t),
          s.d(t, {
            GlobalError: () => n.a,
            __next_app__: () => u,
            originalPathname: () => m,
            pages: () => d,
            routeModule: () => p,
            tree: () => c,
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
        let c = [
            "",
            {
              children: [
                "support",
                {
                  children: [
                    "__PAGE__",
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(s.bind(s, 27869)),
                        "C:\\Users\\richl\\Care2system\\frontend\\app\\support\\page.tsx",
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
          d = [
            "C:\\Users\\richl\\Care2system\\frontend\\app\\support\\page.tsx",
          ],
          m = "/support/page",
          u = { require: s, loadChunk: () => Promise.resolve() },
          p = new r.AppPageRouteModule({
            definition: {
              kind: a.x.APP_PAGE,
              page: "/support/page",
              pathname: "/support",
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
      6547: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 75477));
      },
      19191: (e, t, s) => {
        (Promise.resolve().then(s.t.bind(s, 28913, 23)),
          Promise.resolve().then(s.t.bind(s, 50409, 23)),
          Promise.resolve().then(s.t.bind(s, 75054, 23)),
          Promise.resolve().then(s.t.bind(s, 34892, 23)),
          Promise.resolve().then(s.t.bind(s, 80356, 23)),
          Promise.resolve().then(s.t.bind(s, 73559, 23)));
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
      75477: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => x }));
        var r = s(73658),
          a = s(55459),
          i = s.n(a),
          n = s(84874),
          l = s.n(n),
          o = s(38207);
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
              d: "M16.712 4.33a9.027 9.027 0 0 1 1.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 0 0-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 0 1 0 9.424m-4.138-5.976a3.736 3.736 0 0 0-.88-1.388 3.737 3.737 0 0 0-1.388-.88m2.268 2.268a3.765 3.765 0 0 1 0 2.528m-2.268-4.796a3.765 3.765 0 0 0-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 0 1-1.388.88m2.268-2.268 4.138 3.448m0 0a9.027 9.027 0 0 1-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0-3.448-4.138m3.448 4.138a9.014 9.014 0 0 1-9.424 0m5.976-4.138a3.765 3.765 0 0 1-2.528 0m0 0a3.736 3.736 0 0 1-1.388-.88 3.737 3.737 0 0 1-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 0 1-1.652-1.306 9.027 9.027 0 0 1-1.306-1.652m0 0 4.138-3.448M4.33 16.712a9.014 9.014 0 0 1 0-9.424m4.138 5.976a3.765 3.765 0 0 1 0-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 0 1 1.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 0 0-1.652 1.306A9.025 9.025 0 0 0 4.33 7.288",
            }),
          );
        });
        var d = s(91913),
          m = s(24303);
        let u = a.forwardRef(function ({ title: e, titleId: t, ...s }, r) {
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
              d: "M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z",
            }),
          );
        });
        var p = s(60846);
        function x() {
          let [e, t] = (0, a.useState)({
              reporterName: "",
              isGuest: !1,
              message: "",
              recordingTicketId: "",
              contactValue: "",
              contactType: "",
              pageUrl: "",
            }),
            [s, n] = (0, a.useState)(!1),
            [x, h] = (0, a.useState)({ type: null, message: "" }),
            [g, b] = (0, a.useState)("checking");
          i().useEffect(() => {
            p.h
              .checkDbHealth()
              .then(() => b("healthy"))
              .catch(() => b("unhealthy"));
          }, []);
          let y = async (s) => {
            (s.preventDefault(), n(!0), h({ type: null, message: "" }));
            try {
              if (!e.message.trim()) throw Error("Please describe your issue");
              if (!e.isGuest && !e.reporterName.trim())
                throw Error('Please enter your name or select "I am a guest"');
              let s = {
                  reporterName: e.isGuest ? "Guest" : e.reporterName,
                  isGuest: e.isGuest,
                  message: e.message,
                  recordingTicketId: e.recordingTicketId || null,
                  contactValue: e.contactValue || null,
                  contactType: e.contactType || null,
                  pageUrl: e.pageUrl || null,
                },
                r = await p.h.post("/support/tickets", s);
              (h({
                type: "success",
                message: "Support ticket submitted successfully!",
                ticketId: r.id,
              }),
                t({
                  reporterName: "",
                  isGuest: !1,
                  message: "",
                  recordingTicketId: "",
                  contactValue: "",
                  contactType: "",
                  pageUrl: "",
                }));
            } catch (s) {
              let t = "Failed to submit support ticket";
              (503 === s.status
                ? (t =
                    "System unavailable due to database connectivity. Please try again later.")
                : 400 === s.status
                  ? (t = s.message || "Invalid ticket data")
                  : 404 === s.status && e.recordingTicketId
                    ? (t =
                        "Recording ticket not found. Please check the ticket ID.")
                    : s.message && (t = s.message),
                h({ type: "error", message: t }));
            } finally {
              n(!1);
            }
          };
          return (0, r.jsxs)("div", {
            className:
              "min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50",
            children: [
              r.jsx("div", {
                className: "bg-white shadow-sm border-b",
                children: r.jsx("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
                  children: (0, r.jsxs)(o.E.div, {
                    initial: { opacity: 0, y: -20 },
                    animate: { opacity: 1, y: 0 },
                    className: "text-center",
                    children: [
                      r.jsx(c, {
                        className: "w-16 h-16 text-purple-600 mx-auto mb-4",
                      }),
                      r.jsx("h1", {
                        className: "text-4xl font-black text-gray-900 mb-2",
                        children: "Get Support",
                      }),
                      r.jsx("p", {
                        className: "text-xl text-gray-600",
                        children:
                          "We're here to help. Submit a support ticket and we'll get back to you.",
                      }),
                    ],
                  }),
                }),
              }),
              (0, r.jsxs)("div", {
                className: "max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
                children: [
                  "unhealthy" === g &&
                    (0, r.jsxs)(o.E.div, {
                      initial: { opacity: 0, y: -10 },
                      animate: { opacity: 1, y: 0 },
                      className:
                        "mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3",
                      children: [
                        r.jsx(d.Z, {
                          className:
                            "w-6 h-6 text-red-600 flex-shrink-0 mt-0.5",
                        }),
                        (0, r.jsxs)("div", {
                          children: [
                            r.jsx("h3", {
                              className: "font-bold text-red-900 mb-1",
                              children: "System Offline",
                            }),
                            r.jsx("p", {
                              className: "text-sm text-red-800",
                              children:
                                "The system is currently unavailable due to database connectivity issues. Support ticket submission is temporarily disabled.",
                            }),
                          ],
                        }),
                      ],
                    }),
                  "success" === x.type &&
                    (0, r.jsxs)(o.E.div, {
                      initial: { opacity: 0, scale: 0.95 },
                      animate: { opacity: 1, scale: 1 },
                      className:
                        "mb-6 bg-green-50 border-2 border-green-300 rounded-lg p-6",
                      children: [
                        (0, r.jsxs)("div", {
                          className: "flex items-start gap-3 mb-4",
                          children: [
                            r.jsx(m.Z, {
                              className: "w-8 h-8 text-green-600 flex-shrink-0",
                            }),
                            (0, r.jsxs)("div", {
                              children: [
                                r.jsx("h3", {
                                  className:
                                    "font-bold text-green-900 text-lg mb-1",
                                  children: x.message,
                                }),
                                (0, r.jsxs)("p", {
                                  className: "text-green-800",
                                  children: [
                                    "Ticket ID: ",
                                    r.jsx("span", {
                                      className: "font-mono font-semibold",
                                      children: x.ticketId,
                                    }),
                                  ],
                                }),
                                r.jsx("p", {
                                  className: "text-sm text-green-700 mt-2",
                                  children:
                                    "We'll review your ticket and get back to you as soon as possible.",
                                }),
                              ],
                            }),
                          ],
                        }),
                        r.jsx("button", {
                          onClick: () => h({ type: null, message: "" }),
                          className:
                            "text-green-700 hover:text-green-900 font-semibold text-sm underline",
                          children: "Submit another ticket",
                        }),
                      ],
                    }),
                  "error" === x.type &&
                    (0, r.jsxs)(o.E.div, {
                      initial: { opacity: 0, scale: 0.95 },
                      animate: { opacity: 1, scale: 1 },
                      className:
                        "mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3",
                      children: [
                        r.jsx(u, {
                          className:
                            "w-6 h-6 text-red-600 flex-shrink-0 mt-0.5",
                        }),
                        (0, r.jsxs)("div", {
                          children: [
                            r.jsx("h3", {
                              className: "font-bold text-red-900 mb-1",
                              children: "Error",
                            }),
                            r.jsx("p", {
                              className: "text-sm text-red-800",
                              children: x.message,
                            }),
                          ],
                        }),
                      ],
                    }),
                  r.jsx(o.E.div, {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.2 },
                    className:
                      "bg-white rounded-xl shadow-lg p-8 border-2 border-purple-100",
                    children: (0, r.jsxs)("form", {
                      onSubmit: y,
                      className: "space-y-6",
                      children: [
                        (0, r.jsxs)("div", {
                          className:
                            "flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200",
                          children: [
                            r.jsx("input", {
                              type: "checkbox",
                              id: "isGuest",
                              checked: e.isGuest,
                              onChange: (s) =>
                                t({ ...e, isGuest: s.target.checked }),
                              className:
                                "w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500",
                            }),
                            r.jsx("label", {
                              htmlFor: "isGuest",
                              className:
                                "text-sm font-semibold text-gray-900 cursor-pointer",
                              children: "I am a guest (anonymous submission)",
                            }),
                          ],
                        }),
                        !e.isGuest &&
                          (0, r.jsxs)("div", {
                            children: [
                              (0, r.jsxs)("label", {
                                htmlFor: "reporterName",
                                className:
                                  "block text-sm font-semibold text-gray-900 mb-2",
                                children: [
                                  "Your Name ",
                                  r.jsx("span", {
                                    className: "text-red-500",
                                    children: "*",
                                  }),
                                ],
                              }),
                              r.jsx("input", {
                                type: "text",
                                id: "reporterName",
                                value: e.reporterName,
                                onChange: (s) =>
                                  t({ ...e, reporterName: s.target.value }),
                                className:
                                  "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors",
                                placeholder: "Enter your name",
                                required: !e.isGuest,
                              }),
                            ],
                          }),
                        (0, r.jsxs)("div", {
                          children: [
                            (0, r.jsxs)("label", {
                              htmlFor: "message",
                              className:
                                "block text-sm font-semibold text-gray-900 mb-2",
                              children: [
                                "Describe Your Issue ",
                                r.jsx("span", {
                                  className: "text-red-500",
                                  children: "*",
                                }),
                              ],
                            }),
                            r.jsx("textarea", {
                              id: "message",
                              value: e.message,
                              onChange: (s) =>
                                t({ ...e, message: s.target.value }),
                              rows: 6,
                              className:
                                "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors resize-none",
                              placeholder: "Tell us what you need help with...",
                              required: !0,
                            }),
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          className: "border-t-2 border-gray-100 pt-6",
                          children: [
                            r.jsx("h3", {
                              className: "font-semibold text-gray-900 mb-4",
                              children: "Optional: Link to Recording Profile",
                            }),
                            (0, r.jsxs)("div", {
                              children: [
                                r.jsx("label", {
                                  htmlFor: "recordingTicketId",
                                  className:
                                    "block text-sm font-medium text-gray-700 mb-2",
                                  children: "Recording Ticket ID",
                                }),
                                r.jsx("input", {
                                  type: "text",
                                  id: "recordingTicketId",
                                  value: e.recordingTicketId,
                                  onChange: (s) =>
                                    t({
                                      ...e,
                                      recordingTicketId: s.target.value,
                                    }),
                                  className:
                                    "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors",
                                  placeholder:
                                    "e.g., 123e4567-e89b-12d3-a456-426614174000",
                                }),
                                r.jsx("p", {
                                  className: "text-xs text-gray-500 mt-1",
                                  children:
                                    "If your issue is related to a recording profile, enter the ticket ID",
                                }),
                              ],
                            }),
                          ],
                        }),
                        r.jsx("div", {
                          className: "flex gap-4",
                          children: r.jsx("button", {
                            type: "submit",
                            disabled: s || "unhealthy" === g,
                            className:
                              "flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl",
                            children: s
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
                                    "Submitting...",
                                  ],
                                })
                              : "Submit Support Ticket",
                          }),
                        }),
                      ],
                    }),
                  }),
                  (0, r.jsxs)(o.E.div, {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: { delay: 0.4 },
                    className: "mt-8 text-center text-gray-600",
                    children: [
                      (0, r.jsxs)("p", {
                        className: "mb-4",
                        children: [
                          "Need to check on a profile or donate?",
                          " ",
                          r.jsx(l(), {
                            href: "/find",
                            className:
                              "text-purple-600 hover:underline font-semibold",
                            children: "Find a profile",
                          }),
                        ],
                      }),
                      r.jsx("p", {
                        className: "text-sm text-gray-500",
                        children:
                          "For urgent issues, please contact emergency services (911)",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
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
          { __esModule: o, $$typeof: c } = l;
        l.default;
        let d = (0, n.createProxy)(
          String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx#Providers`,
        );
        var m = s(15762);
        let u = (0, n.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\components\Header.tsx`,
          ),
          { __esModule: p, $$typeof: x } = u,
          h = u.default,
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
              children: (0, r.jsxs)(d, {
                children: [
                  r.jsx(h, {}),
                  r.jsx("div", {
                    className: "min-h-screen bg-gray-50",
                    children: r.jsx("main", { children: e }),
                  }),
                  r.jsx(m.x7, {
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
      27869: (e, t, s) => {
        "use strict";
        (s.r(t),
          s.d(t, { $$typeof: () => n, __esModule: () => i, default: () => o }));
        var r = s(19894);
        let a = (0, r.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\support\page.tsx`,
          ),
          { __esModule: i, $$typeof: n } = a,
          l = a.default,
          o = l;
      },
      40642: () => {},
      24303: (e, t, s) => {
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
                d: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
              }),
            );
          }),
          i = a;
      },
      91913: (e, t, s) => {
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
                d: "m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
              }),
            );
          }),
          i = a;
      },
    }));
  var t = require("../../webpack-runtime.js");
  t.C(e);
  var s = (e) => t((t.s = e)),
    r = t.X(0, [623, 934, 207], () => s(3893));
  module.exports = r;
})();

(() => {
  var e = {};
  ((e.id = 675),
    (e.ids = [675]),
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
      65382: (e, t, s) => {
        "use strict";
        (s.r(t),
          s.d(t, {
            GlobalError: () => i.a,
            __next_app__: () => x,
            originalPathname: () => m,
            pages: () => c,
            routeModule: () => u,
            tree: () => o,
          }));
        var r = s(36577),
          a = s(55533),
          n = s(40443),
          i = s.n(n),
          d = s(53320),
          l = {};
        for (let e in d)
          0 >
            [
              "default",
              "tree",
              "pages",
              "GlobalError",
              "originalPathname",
              "__next_app__",
              "routeModule",
            ].indexOf(e) && (l[e] = () => d[e]);
        s.d(t, l);
        let o = [
            "",
            {
              children: [
                "admin",
                {
                  children: [
                    "knowledge",
                    {
                      children: [
                        "audit",
                        {
                          children: [
                            "[auditId]",
                            {
                              children: [
                                "__PAGE__",
                                {},
                                {
                                  page: [
                                    () =>
                                      Promise.resolve().then(s.bind(s, 41044)),
                                    "C:\\Users\\richl\\Care2system\\frontend\\app\\admin\\knowledge\\audit\\[auditId]\\page.tsx",
                                  ],
                                },
                              ],
                            },
                            {},
                          ],
                        },
                        {},
                      ],
                    },
                    {},
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
          c = [
            "C:\\Users\\richl\\Care2system\\frontend\\app\\admin\\knowledge\\audit\\[auditId]\\page.tsx",
          ],
          m = "/admin/knowledge/audit/[auditId]/page",
          x = { require: s, loadChunk: () => Promise.resolve() },
          u = new r.AppPageRouteModule({
            definition: {
              kind: a.x.APP_PAGE,
              page: "/admin/knowledge/audit/[auditId]/page",
              pathname: "/admin/knowledge/audit/[auditId]",
              bundlePath: "",
              filename: "",
              appPaths: [],
            },
            userland: { loaderTree: o },
          });
      },
      68135: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 23743));
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
      23743: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => d }));
        var r = s(73658),
          a = s(55459),
          n = s(32241),
          i = s(9567);
        function d({ params: e }) {
          let t = (0, n.useRouter)(),
            [s, d] = (0, a.useState)(null),
            [l, o] = (0, a.useState)(!0);
          (0, a.useEffect)(() => {
            c();
          }, [e.auditId]);
          let c = async () => {
            o(!0);
            try {
              let s = localStorage.getItem("adminToken"),
                r = await fetch(`/api/admin/knowledge/audit/${e.auditId}`, {
                  headers: { Authorization: `Bearer ${s}` },
                });
              if (r.ok) {
                let e = await r.json();
                d(e);
              } else
                404 === r.status &&
                  (alert("Audit log not found"),
                  t.push("/admin/knowledge/audit"));
            } catch (e) {
              console.error("Error fetching audit log:", e);
            } finally {
              o(!1);
            }
          };
          return l
            ? r.jsx(i.t, {
                children: r.jsx("div", {
                  className: "min-h-screen flex items-center justify-center",
                  children: (0, r.jsxs)("div", {
                    className: "text-center",
                    children: [
                      r.jsx("div", {
                        className:
                          "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4",
                      }),
                      r.jsx("p", {
                        className: "text-gray-600",
                        children: "Loading audit log...",
                      }),
                    ],
                  }),
                }),
              })
            : s
              ? r.jsx(i.t, {
                  children: (0, r.jsxs)("div", {
                    className: "min-h-screen bg-gray-50",
                    children: [
                      r.jsx("div", {
                        className: "bg-white border-b border-gray-200",
                        children: (0, r.jsxs)("div", {
                          className:
                            "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6",
                          children: [
                            r.jsx("button", {
                              onClick: () => t.push("/admin/knowledge/audit"),
                              className:
                                "text-sm text-blue-600 hover:text-blue-700 mb-2 flex items-center",
                              children: "← Back to Audit Logs",
                            }),
                            r.jsx("h1", {
                              className: "text-3xl font-bold text-gray-900",
                              children: "Audit Log Detail",
                            }),
                            r.jsx("p", {
                              className: "mt-1 text-sm text-gray-500",
                              children: s.id,
                            }),
                          ],
                        }),
                      }),
                      (0, r.jsxs)("div", {
                        className:
                          "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
                        children: [
                          (0, r.jsxs)("div", {
                            className: "bg-white rounded-lg shadow mb-6 p-6",
                            children: [
                              (0, r.jsxs)("div", {
                                className:
                                  "grid grid-cols-2 md:grid-cols-4 gap-6",
                                children: [
                                  (0, r.jsxs)("div", {
                                    children: [
                                      r.jsx("div", {
                                        className:
                                          "text-sm font-medium text-gray-500 mb-1",
                                        children: "Action",
                                      }),
                                      r.jsx("div", {
                                        className: `inline-block px-3 py-1 rounded-md border font-semibold ${((
                                          e,
                                        ) => {
                                          switch (e) {
                                            case "CREATE":
                                              return "text-green-600 bg-green-50 border-green-200";
                                            case "UPDATE":
                                              return "text-blue-600 bg-blue-50 border-blue-200";
                                            case "DELETE":
                                              return "text-red-600 bg-red-50 border-red-200";
                                            default:
                                              return "text-gray-600 bg-gray-50 border-gray-200";
                                          }
                                        })(s.action)}`,
                                        children: s.action,
                                      }),
                                    ],
                                  }),
                                  (0, r.jsxs)("div", {
                                    children: [
                                      r.jsx("div", {
                                        className:
                                          "text-sm font-medium text-gray-500 mb-1",
                                        children: "Entity Type",
                                      }),
                                      r.jsx("div", {
                                        className: "text-gray-900 font-medium",
                                        children: s.entityType.replace(
                                          "_",
                                          " ",
                                        ),
                                      }),
                                    ],
                                  }),
                                  (0, r.jsxs)("div", {
                                    children: [
                                      r.jsx("div", {
                                        className:
                                          "text-sm font-medium text-gray-500 mb-1",
                                        children: "Actor",
                                      }),
                                      r.jsx("div", {
                                        className: "text-gray-900 font-medium",
                                        children: s.actor,
                                      }),
                                    ],
                                  }),
                                  (0, r.jsxs)("div", {
                                    children: [
                                      r.jsx("div", {
                                        className:
                                          "text-sm font-medium text-gray-500 mb-1",
                                        children: "Timestamp",
                                      }),
                                      r.jsx("div", {
                                        className: "text-gray-900 font-medium",
                                        children: new Date(
                                          s.createdAt,
                                        ).toLocaleString(),
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, r.jsxs)("div", {
                                className: "mt-6",
                                children: [
                                  r.jsx("div", {
                                    className:
                                      "text-sm font-medium text-gray-500 mb-1",
                                    children: "Entity ID",
                                  }),
                                  r.jsx("div", {
                                    className:
                                      "text-gray-900 font-mono text-sm",
                                    children: s.entityId,
                                  }),
                                  s.relatedEntity &&
                                    r.jsx("button", {
                                      onClick: () => {
                                        "KNOWLEDGE_SOURCE" === s.entityType &&
                                          t.push(
                                            `/admin/knowledge/${s.entityId}`,
                                          );
                                      },
                                      className:
                                        "mt-2 text-blue-600 hover:text-blue-700 text-sm underline",
                                      children: "View Entity",
                                    }),
                                ],
                              }),
                              s.reason &&
                                (0, r.jsxs)("div", {
                                  className: "mt-6",
                                  children: [
                                    r.jsx("div", {
                                      className:
                                        "text-sm font-medium text-gray-500 mb-1",
                                      children: "Reason",
                                    }),
                                    r.jsx("div", {
                                      className: "text-gray-900",
                                      children: s.reason,
                                    }),
                                  ],
                                }),
                            ],
                          }),
                          "UPDATE" === s.action &&
                            s.diffJson &&
                            (0, r.jsxs)("div", {
                              className: "bg-white rounded-lg shadow mb-6 p-6",
                              children: [
                                r.jsx("h2", {
                                  className:
                                    "text-lg font-semibold text-gray-900 mb-4",
                                  children: "Changes",
                                }),
                                r.jsx("div", {
                                  className: "space-y-4",
                                  children: Object.entries(s.diffJson).map(
                                    ([e, t]) =>
                                      (0, r.jsxs)(
                                        "div",
                                        {
                                          className:
                                            "border-l-4 border-blue-500 pl-4",
                                          children: [
                                            r.jsx("div", {
                                              className:
                                                "text-sm font-medium text-gray-700 mb-2",
                                              children: e,
                                            }),
                                            (0, r.jsxs)("div", {
                                              className:
                                                "grid grid-cols-2 gap-4",
                                              children: [
                                                (0, r.jsxs)("div", {
                                                  children: [
                                                    r.jsx("div", {
                                                      className:
                                                        "text-xs text-gray-500 mb-1",
                                                      children: "Before",
                                                    }),
                                                    r.jsx("pre", {
                                                      className:
                                                        "bg-red-50 border border-red-200 rounded p-2 text-sm overflow-x-auto",
                                                      children: JSON.stringify(
                                                        t.before,
                                                        null,
                                                        2,
                                                      ),
                                                    }),
                                                  ],
                                                }),
                                                (0, r.jsxs)("div", {
                                                  children: [
                                                    r.jsx("div", {
                                                      className:
                                                        "text-xs text-gray-500 mb-1",
                                                      children: "After",
                                                    }),
                                                    r.jsx("pre", {
                                                      className:
                                                        "bg-green-50 border border-green-200 rounded p-2 text-sm overflow-x-auto",
                                                      children: JSON.stringify(
                                                        t.after,
                                                        null,
                                                        2,
                                                      ),
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        },
                                        e,
                                      ),
                                  ),
                                }),
                              ],
                            }),
                          "CREATE" !== s.action &&
                            s.beforeJson &&
                            (0, r.jsxs)("div", {
                              className: "bg-white rounded-lg shadow mb-6 p-6",
                              children: [
                                r.jsx("h2", {
                                  className:
                                    "text-lg font-semibold text-gray-900 mb-4",
                                  children: "Before State",
                                }),
                                r.jsx("pre", {
                                  className:
                                    "bg-gray-50 border border-gray-200 rounded p-4 text-sm overflow-x-auto",
                                  children: JSON.stringify(
                                    s.beforeJson,
                                    null,
                                    2,
                                  ),
                                }),
                              ],
                            }),
                          "DELETE" !== s.action &&
                            s.afterJson &&
                            (0, r.jsxs)("div", {
                              className: "bg-white rounded-lg shadow mb-6 p-6",
                              children: [
                                r.jsx("h2", {
                                  className:
                                    "text-lg font-semibold text-gray-900 mb-4",
                                  children: "After State",
                                }),
                                r.jsx("pre", {
                                  className:
                                    "bg-gray-50 border border-gray-200 rounded p-4 text-sm overflow-x-auto",
                                  children: JSON.stringify(
                                    s.afterJson,
                                    null,
                                    2,
                                  ),
                                }),
                              ],
                            }),
                        ],
                      }),
                    ],
                  }),
                })
              : r.jsx(i.t, {
                  children: r.jsx("div", {
                    className: "min-h-screen flex items-center justify-center",
                    children: (0, r.jsxs)("div", {
                      className: "text-center",
                      children: [
                        r.jsx("p", {
                          className: "text-gray-600",
                          children: "Audit log not found",
                        }),
                        r.jsx("button", {
                          onClick: () => t.push("/admin/knowledge/audit"),
                          className:
                            "mt-4 text-blue-600 hover:text-blue-700 underline",
                          children: "Back to Audit Logs",
                        }),
                      ],
                    }),
                  }),
                });
        }
      },
      56253: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { Providers: () => d }));
        var r = s(73658),
          a = s(58758),
          n = s(60459),
          i = s(55459);
        function d({ children: e }) {
          let [t] = (0, i.useState)(
            () =>
              new a.S({
                defaultOptions: { queries: { staleTime: 3e5, gcTime: 6e5 } },
              }),
          );
          return r.jsx(n.aH, { client: t, children: e });
        }
      },
      9567: (e, t, s) => {
        "use strict";
        s.d(t, { t: () => i });
        var r = s(73658),
          a = s(55459),
          n = s(32241);
        function i({ children: e }) {
          let [t, s] = (0, a.useState)(!1),
            [i, d] = (0, a.useState)(!0),
            [l, o] = (0, a.useState)(""),
            [c, m] = (0, a.useState)("");
          ((0, n.useRouter)(),
            (0, a.useEffect)(() => {
              let e = localStorage.getItem("adminToken");
              e ? x(e) : d(!1);
            }, []));
          let x = async (e) => {
              try {
                let t = await fetch("/api/admin/db/connection-info", {
                  headers: { Authorization: `Bearer ${e}` },
                });
                t.ok ? s(!0) : localStorage.removeItem("adminToken");
              } catch (e) {
                s(!0);
              } finally {
                d(!1);
              }
            },
            u = async (e) => {
              (e.preventDefault(), m(""));
              try {
                let e = await fetch("/api/admin/db/connection-info", {
                  headers: { Authorization: `Bearer ${l}` },
                });
                e.ok
                  ? (localStorage.setItem("adminToken", l), s(!0), o(""))
                  : m("Invalid admin password");
              } catch (e) {
                m("Authentication failed - server may be unavailable");
              }
            };
          return i
            ? r.jsx("div", {
                className:
                  "min-h-screen flex items-center justify-center bg-gray-50",
                children: (0, r.jsxs)("div", {
                  className: "text-center",
                  children: [
                    r.jsx("div", {
                      className:
                        "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4",
                    }),
                    r.jsx("p", {
                      className: "text-gray-600",
                      children: "Verifying authentication...",
                    }),
                  ],
                }),
              })
            : t
              ? (0, r.jsxs)("div", {
                  children: [
                    (0, r.jsxs)("div", {
                      className:
                        "bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center",
                      children: [
                        (0, r.jsxs)("div", {
                          className: "flex items-center space-x-2",
                          children: [
                            r.jsx("div", {
                              className: "w-2 h-2 bg-green-500 rounded-full",
                            }),
                            r.jsx("span", {
                              className: "text-sm text-gray-600",
                              children: "Admin authenticated",
                            }),
                          ],
                        }),
                        r.jsx("button", {
                          onClick: () => {
                            (localStorage.removeItem("adminToken"),
                              s(!1),
                              o(""));
                          },
                          className:
                            "text-sm text-gray-600 hover:text-gray-900 underline",
                          children: "Logout",
                        }),
                      ],
                    }),
                    e,
                  ],
                })
              : r.jsx("div", {
                  className:
                    "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100",
                  children: r.jsx("div", {
                    className: "max-w-md w-full mx-4",
                    children: (0, r.jsxs)("div", {
                      className: "bg-white rounded-lg shadow-xl p-8",
                      children: [
                        (0, r.jsxs)("div", {
                          className: "text-center mb-8",
                          children: [
                            r.jsx("div", {
                              className:
                                "inline-block p-3 bg-blue-100 rounded-full mb-4",
                              children: r.jsx("svg", {
                                className: "w-8 h-8 text-blue-600",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: r.jsx("path", {
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: 2,
                                  d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                                }),
                              }),
                            }),
                            r.jsx("h2", {
                              className:
                                "text-2xl font-bold text-gray-900 mb-2",
                              children: "Admin Access Required",
                            }),
                            r.jsx("p", {
                              className: "text-gray-600",
                              children:
                                "Enter admin password to access Knowledge Vault",
                            }),
                          ],
                        }),
                        (0, r.jsxs)("form", {
                          onSubmit: u,
                          className: "space-y-4",
                          children: [
                            (0, r.jsxs)("div", {
                              children: [
                                r.jsx("label", {
                                  htmlFor: "password",
                                  className:
                                    "block text-sm font-medium text-gray-700 mb-1",
                                  children: "Admin Password",
                                }),
                                r.jsx("input", {
                                  id: "password",
                                  type: "password",
                                  value: l,
                                  onChange: (e) => o(e.target.value),
                                  placeholder: "Enter admin password",
                                  className:
                                    "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                  autoFocus: !0,
                                  required: !0,
                                }),
                              ],
                            }),
                            c &&
                              r.jsx("div", {
                                className:
                                  "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded",
                                children: c,
                              }),
                            r.jsx("button", {
                              type: "submit",
                              className:
                                "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors",
                              children: "Unlock",
                            }),
                          ],
                        }),
                        r.jsx("div", {
                          className: "mt-6 text-center text-sm text-gray-500",
                          children: r.jsx("p", {
                            children:
                              "This is the same password used for the System Health page",
                          }),
                        }),
                      ],
                    }),
                  }),
                });
        }
      },
      9690: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => l }));
        var r = s(73658),
          a = s(84874),
          n = s.n(a),
          i = s(32241),
          d = s(17872);
        function l() {
          let e = (0, i.usePathname)();
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
                              r.jsx(d.Z, {
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
      41044: (e, t, s) => {
        "use strict";
        (s.r(t),
          s.d(t, { $$typeof: () => i, __esModule: () => n, default: () => l }));
        var r = s(19894);
        let a = (0, r.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\admin\knowledge\audit\[auditId]\page.tsx`,
          ),
          { __esModule: n, $$typeof: i } = a,
          d = a.default,
          l = d;
      },
      18685: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => b, metadata: () => p }));
        var r = s(31487),
          a = s(72972),
          n = s.n(a);
        s(40642);
        var i = s(19894);
        let d = (0, i.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx`,
          ),
          { __esModule: l, $$typeof: o } = d;
        d.default;
        let c = (0, i.createProxy)(
          String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx#Providers`,
        );
        var m = s(15762);
        let x = (0, i.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\components\Header.tsx`,
          ),
          { __esModule: u, $$typeof: h } = x,
          g = x.default,
          p = {
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
              className: n().className,
              children: (0, r.jsxs)(c, {
                children: [
                  r.jsx(g, {}),
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
      40642: () => {},
    }));
  var t = require("../../../../../webpack-runtime.js");
  t.C(e);
  var s = (e) => t((t.s = e)),
    r = t.X(0, [623, 934], () => s(65382));
  module.exports = r;
})();

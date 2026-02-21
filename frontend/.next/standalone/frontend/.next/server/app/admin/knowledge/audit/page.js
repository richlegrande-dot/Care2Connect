(() => {
  var e = {};
  ((e.id = 987),
    (e.ids = [987]),
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
      64419: (e, t, s) => {
        "use strict";
        (s.r(t),
          s.d(t, {
            GlobalError: () => n.a,
            __next_app__: () => m,
            originalPathname: () => x,
            pages: () => c,
            routeModule: () => u,
            tree: () => o,
          }));
        var r = s(36577),
          a = s(55533),
          i = s(40443),
          n = s.n(i),
          l = s(53320),
          d = {};
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
            ].indexOf(e) && (d[e] = () => l[e]);
        s.d(t, d);
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
                            "__PAGE__",
                            {},
                            {
                              page: [
                                () => Promise.resolve().then(s.bind(s, 53968)),
                                "C:\\Users\\richl\\Care2system\\frontend\\app\\admin\\knowledge\\audit\\page.tsx",
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
            "C:\\Users\\richl\\Care2system\\frontend\\app\\admin\\knowledge\\audit\\page.tsx",
          ],
          x = "/admin/knowledge/audit/page",
          m = { require: s, loadChunk: () => Promise.resolve() },
          u = new r.AppPageRouteModule({
            definition: {
              kind: a.x.APP_PAGE,
              page: "/admin/knowledge/audit/page",
              pathname: "/admin/knowledge/audit",
              bundlePath: "",
              filename: "",
              appPaths: [],
            },
            userland: { loaderTree: o },
          });
      },
      46965: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 95032));
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
      95032: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => l }));
        var r = s(73658),
          a = s(55459),
          i = s(32241),
          n = s(9567);
        function l() {
          let e = (0, i.useRouter)(),
            t = (0, i.useSearchParams)(),
            [s, l] = (0, a.useState)([]),
            [d, o] = (0, a.useState)(!0),
            [c, x] = (0, a.useState)(1),
            [m, u] = (0, a.useState)(1),
            [h, p] = (0, a.useState)(null),
            [g, y] = (0, a.useState)(t?.get("action") || ""),
            [b, f] = (0, a.useState)(t?.get("entityType") || ""),
            [j, v] = (0, a.useState)(t?.get("entityId") || "");
          (0, a.useEffect)(() => {
            (N(), w());
          }, [c, g, b, j]);
          let N = async () => {
              o(!0);
              try {
                let e = localStorage.getItem("adminToken"),
                  t = new URLSearchParams({
                    page: c.toString(),
                    limit: "50",
                    ...(g && { action: g }),
                    ...(b && { entityType: b }),
                    ...(j && { entityId: j }),
                  }),
                  s = await fetch(`/api/admin/knowledge/audit?${t}`, {
                    headers: { Authorization: `Bearer ${e}` },
                  });
                if (s.ok) {
                  let e = await s.json();
                  (l(e.logs), u(e.pagination.pages));
                }
              } catch (e) {
                console.error("Error fetching audit logs:", e);
              } finally {
                o(!1);
              }
            },
            w = async () => {
              try {
                let e = localStorage.getItem("adminToken"),
                  t = await fetch("/api/admin/knowledge/audit/stats/summary", {
                    headers: { Authorization: `Bearer ${e}` },
                  });
                if (t.ok) {
                  let e = await t.json();
                  p(e);
                }
              } catch (e) {
                console.error("Error fetching audit stats:", e);
              }
            },
            k = (e) => {
              switch (e) {
                case "CREATE":
                  return "bg-green-100 text-green-800";
                case "UPDATE":
                  return "bg-blue-100 text-blue-800";
                case "DELETE":
                  return "bg-red-100 text-red-800";
                default:
                  return "bg-gray-100 text-gray-800";
              }
            };
          return r.jsx(n.t, {
            children: (0, r.jsxs)("div", {
              className: "min-h-screen bg-gray-50",
              children: [
                r.jsx("div", {
                  className: "bg-white border-b border-gray-200",
                  children: r.jsx("div", {
                    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6",
                    children: r.jsx("div", {
                      className: "flex justify-between items-center",
                      children: (0, r.jsxs)("div", {
                        children: [
                          r.jsx("button", {
                            onClick: () => e.push("/admin/knowledge"),
                            className:
                              "text-sm text-blue-600 hover:text-blue-700 mb-2 flex items-center",
                            children: "← Back to Knowledge Vault",
                          }),
                          r.jsx("h1", {
                            className: "text-3xl font-bold text-gray-900",
                            children: "Audit Logs",
                          }),
                          r.jsx("p", {
                            className: "mt-1 text-sm text-gray-500",
                            children:
                              "View all changes to knowledge sources and chunks",
                          }),
                        ],
                      }),
                    }),
                  }),
                }),
                (0, r.jsxs)("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
                  children: [
                    h &&
                      (0, r.jsxs)("div", {
                        className: "bg-white rounded-lg shadow mb-6 p-6",
                        children: [
                          r.jsx("h2", {
                            className:
                              "text-lg font-semibold text-gray-900 mb-4",
                            children: "Audit Statistics",
                          }),
                          (0, r.jsxs)("div", {
                            className: "grid grid-cols-2 md:grid-cols-5 gap-4",
                            children: [
                              (0, r.jsxs)("div", {
                                className: "text-center",
                                children: [
                                  r.jsx("div", {
                                    className:
                                      "text-2xl font-bold text-gray-900",
                                    children: h.total,
                                  }),
                                  r.jsx("div", {
                                    className: "text-xs text-gray-500",
                                    children: "Total Logs",
                                  }),
                                ],
                              }),
                              (0, r.jsxs)("div", {
                                className: "text-center",
                                children: [
                                  r.jsx("div", {
                                    className:
                                      "text-2xl font-bold text-green-600",
                                    children: h.byAction.create,
                                  }),
                                  r.jsx("div", {
                                    className: "text-xs text-gray-500",
                                    children: "Creates",
                                  }),
                                ],
                              }),
                              (0, r.jsxs)("div", {
                                className: "text-center",
                                children: [
                                  r.jsx("div", {
                                    className:
                                      "text-2xl font-bold text-blue-600",
                                    children: h.byAction.update,
                                  }),
                                  r.jsx("div", {
                                    className: "text-xs text-gray-500",
                                    children: "Updates",
                                  }),
                                ],
                              }),
                              (0, r.jsxs)("div", {
                                className: "text-center",
                                children: [
                                  r.jsx("div", {
                                    className:
                                      "text-2xl font-bold text-red-600",
                                    children: h.byAction.delete,
                                  }),
                                  r.jsx("div", {
                                    className: "text-xs text-gray-500",
                                    children: "Deletes",
                                  }),
                                ],
                              }),
                              (0, r.jsxs)("div", {
                                className: "text-center",
                                children: [
                                  (0, r.jsxs)("div", {
                                    className:
                                      "text-sm font-medium text-gray-700 mb-1",
                                    children: [
                                      "Sources: ",
                                      h.byEntityType.knowledgeSource,
                                    ],
                                  }),
                                  (0, r.jsxs)("div", {
                                    className:
                                      "text-sm font-medium text-gray-700",
                                    children: [
                                      "Chunks: ",
                                      h.byEntityType.knowledgeChunk,
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    r.jsx("div", {
                      className: "bg-white rounded-lg shadow mb-6 p-4",
                      children: (0, r.jsxs)("div", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                        children: [
                          (0, r.jsxs)("div", {
                            children: [
                              r.jsx("label", {
                                className:
                                  "block text-sm font-medium text-gray-700 mb-1",
                                children: "Action",
                              }),
                              (0, r.jsxs)("select", {
                                value: g,
                                onChange: (e) => {
                                  (y(e.target.value), x(1));
                                },
                                className:
                                  "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500",
                                children: [
                                  r.jsx("option", {
                                    value: "",
                                    children: "All Actions",
                                  }),
                                  r.jsx("option", {
                                    value: "CREATE",
                                    children: "Create",
                                  }),
                                  r.jsx("option", {
                                    value: "UPDATE",
                                    children: "Update",
                                  }),
                                  r.jsx("option", {
                                    value: "DELETE",
                                    children: "Delete",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          (0, r.jsxs)("div", {
                            children: [
                              r.jsx("label", {
                                className:
                                  "block text-sm font-medium text-gray-700 mb-1",
                                children: "Entity Type",
                              }),
                              (0, r.jsxs)("select", {
                                value: b,
                                onChange: (e) => {
                                  (f(e.target.value), x(1));
                                },
                                className:
                                  "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500",
                                children: [
                                  r.jsx("option", {
                                    value: "",
                                    children: "All Types",
                                  }),
                                  r.jsx("option", {
                                    value: "KNOWLEDGE_SOURCE",
                                    children: "Knowledge Source",
                                  }),
                                  r.jsx("option", {
                                    value: "KNOWLEDGE_CHUNK",
                                    children: "Knowledge Chunk",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          (0, r.jsxs)("div", {
                            children: [
                              r.jsx("label", {
                                className:
                                  "block text-sm font-medium text-gray-700 mb-1",
                                children: "Entity ID",
                              }),
                              r.jsx("input", {
                                type: "text",
                                value: j,
                                onChange: (e) => {
                                  (v(e.target.value), x(1));
                                },
                                placeholder: "Filter by entity ID...",
                                className:
                                  "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500",
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    r.jsx("div", {
                      className: "bg-white rounded-lg shadow overflow-hidden",
                      children: d
                        ? (0, r.jsxs)("div", {
                            className: "text-center py-12",
                            children: [
                              r.jsx("div", {
                                className:
                                  "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto",
                              }),
                              r.jsx("p", {
                                className: "mt-4 text-gray-600",
                                children: "Loading audit logs...",
                              }),
                            ],
                          })
                        : 0 === s.length
                          ? r.jsx("div", {
                              className: "text-center py-12",
                              children: r.jsx("p", {
                                className: "text-gray-500",
                                children: "No audit logs found",
                              }),
                            })
                          : (0, r.jsxs)(r.Fragment, {
                              children: [
                                (0, r.jsxs)("table", {
                                  className:
                                    "min-w-full divide-y divide-gray-200",
                                  children: [
                                    r.jsx("thead", {
                                      className: "bg-gray-50",
                                      children: (0, r.jsxs)("tr", {
                                        children: [
                                          r.jsx("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Timestamp",
                                          }),
                                          r.jsx("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Action",
                                          }),
                                          r.jsx("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Entity",
                                          }),
                                          r.jsx("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Actor",
                                          }),
                                          r.jsx("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Reason",
                                          }),
                                          r.jsx("th", {
                                            className:
                                              "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Details",
                                          }),
                                        ],
                                      }),
                                    }),
                                    r.jsx("tbody", {
                                      className:
                                        "bg-white divide-y divide-gray-200",
                                      children: s.map((t) =>
                                        (0, r.jsxs)(
                                          "tr",
                                          {
                                            className: "hover:bg-gray-50",
                                            children: [
                                              r.jsx("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
                                                children: new Date(
                                                  t.createdAt,
                                                ).toLocaleString(),
                                              }),
                                              r.jsx("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap",
                                                children: r.jsx("span", {
                                                  className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${k(t.action)}`,
                                                  children: t.action,
                                                }),
                                              }),
                                              (0, r.jsxs)("td", {
                                                className:
                                                  "px-6 py-4 text-sm text-gray-900",
                                                children: [
                                                  r.jsx("div", {
                                                    className: "font-medium",
                                                    children:
                                                      t.entityType.replace(
                                                        "_",
                                                        " ",
                                                      ),
                                                  }),
                                                  r.jsx("div", {
                                                    className:
                                                      "text-xs text-gray-500 truncate max-w-xs",
                                                    children: t.entityId,
                                                  }),
                                                ],
                                              }),
                                              r.jsx("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
                                                children: t.actor,
                                              }),
                                              r.jsx("td", {
                                                className:
                                                  "px-6 py-4 text-sm text-gray-500",
                                                children: r.jsx("div", {
                                                  className:
                                                    "max-w-xs truncate",
                                                  children: t.reason || "-",
                                                }),
                                              }),
                                              r.jsx("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap text-right text-sm font-medium",
                                                children: r.jsx("button", {
                                                  onClick: () =>
                                                    e.push(
                                                      `/admin/knowledge/audit/${t.id}`,
                                                    ),
                                                  className:
                                                    "text-blue-600 hover:text-blue-900",
                                                  children: "View",
                                                }),
                                              }),
                                            ],
                                          },
                                          t.id,
                                        ),
                                      ),
                                    }),
                                  ],
                                }),
                                m > 1 &&
                                  (0, r.jsxs)("div", {
                                    className:
                                      "bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200",
                                    children: [
                                      r.jsx("button", {
                                        onClick: () => x(Math.max(1, c - 1)),
                                        disabled: 1 === c,
                                        className:
                                          "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50",
                                        children: "Previous",
                                      }),
                                      (0, r.jsxs)("span", {
                                        className: "text-sm text-gray-700",
                                        children: ["Page ", c, " of ", m],
                                      }),
                                      r.jsx("button", {
                                        onClick: () => x(Math.min(m, c + 1)),
                                        disabled: c === m,
                                        className:
                                          "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50",
                                        children: "Next",
                                      }),
                                    ],
                                  }),
                              ],
                            }),
                    }),
                  ],
                }),
              ],
            }),
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
      9567: (e, t, s) => {
        "use strict";
        s.d(t, { t: () => n });
        var r = s(73658),
          a = s(55459),
          i = s(32241);
        function n({ children: e }) {
          let [t, s] = (0, a.useState)(!1),
            [n, l] = (0, a.useState)(!0),
            [d, o] = (0, a.useState)(""),
            [c, x] = (0, a.useState)("");
          ((0, i.useRouter)(),
            (0, a.useEffect)(() => {
              let e = localStorage.getItem("adminToken");
              e ? m(e) : l(!1);
            }, []));
          let m = async (e) => {
              try {
                let t = await fetch("/api/admin/db/connection-info", {
                  headers: { Authorization: `Bearer ${e}` },
                });
                t.ok ? s(!0) : localStorage.removeItem("adminToken");
              } catch (e) {
                s(!0);
              } finally {
                l(!1);
              }
            },
            u = async (e) => {
              (e.preventDefault(), x(""));
              try {
                let e = await fetch("/api/admin/db/connection-info", {
                  headers: { Authorization: `Bearer ${d}` },
                });
                e.ok
                  ? (localStorage.setItem("adminToken", d), s(!0), o(""))
                  : x("Invalid admin password");
              } catch (e) {
                x("Authentication failed - server may be unavailable");
              }
            };
          return n
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
                                  value: d,
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
        (s.r(t), s.d(t, { default: () => d }));
        var r = s(73658),
          a = s(84874),
          i = s.n(a),
          n = s(32241),
          l = s(17872);
        function d() {
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
      53968: (e, t, s) => {
        "use strict";
        (s.r(t),
          s.d(t, { $$typeof: () => n, __esModule: () => i, default: () => d }));
        var r = s(19894);
        let a = (0, r.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\admin\knowledge\audit\page.tsx`,
          ),
          { __esModule: i, $$typeof: n } = a,
          l = a.default,
          d = l;
      },
      18685: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => y, metadata: () => g }));
        var r = s(31487),
          a = s(72972),
          i = s.n(a);
        s(40642);
        var n = s(19894);
        let l = (0, n.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx`,
          ),
          { __esModule: d, $$typeof: o } = l;
        l.default;
        let c = (0, n.createProxy)(
          String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx#Providers`,
        );
        var x = s(15762);
        let m = (0, n.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\components\Header.tsx`,
          ),
          { __esModule: u, $$typeof: h } = m,
          p = m.default,
          g = {
            title: "CareConnect - Supporting Our Community",
            description:
              "A platform connecting individuals experiencing homelessness with resources, opportunities, and community support.",
            keywords:
              "homeless support, community resources, job opportunities, donations, assistance",
          };
        function y({ children: e }) {
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
    }));
  var t = require("../../../../webpack-runtime.js");
  t.C(e);
  var s = (e) => t((t.s = e)),
    r = t.X(0, [623, 934], () => s(64419));
  module.exports = r;
})();

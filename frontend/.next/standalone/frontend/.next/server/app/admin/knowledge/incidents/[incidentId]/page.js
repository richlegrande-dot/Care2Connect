(() => {
  var e = {};
  ((e.id = 592),
    (e.ids = [592]),
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
      99856: (e, t, s) => {
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
        var a = s(36577),
          n = s(55533),
          r = s(40443),
          i = s.n(r),
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
                        "incidents",
                        {
                          children: [
                            "[incidentId]",
                            {
                              children: [
                                "__PAGE__",
                                {},
                                {
                                  page: [
                                    () =>
                                      Promise.resolve().then(s.bind(s, 48566)),
                                    "C:\\Users\\richl\\Care2system\\frontend\\app\\admin\\knowledge\\incidents\\[incidentId]\\page.tsx",
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
            "C:\\Users\\richl\\Care2system\\frontend\\app\\admin\\knowledge\\incidents\\[incidentId]\\page.tsx",
          ],
          m = "/admin/knowledge/incidents/[incidentId]/page",
          x = { require: s, loadChunk: () => Promise.resolve() },
          u = new a.AppPageRouteModule({
            definition: {
              kind: n.x.APP_PAGE,
              page: "/admin/knowledge/incidents/[incidentId]/page",
              pathname: "/admin/knowledge/incidents/[incidentId]",
              bundlePath: "",
              filename: "",
              appPaths: [],
            },
            userland: { loaderTree: o },
          });
      },
      48618: (e, t, s) => {
        Promise.resolve().then(s.bind(s, 53017));
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
      53017: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => o }));
        var a = s(73658),
          n = s(55459),
          r = s(32241),
          i = s(9567);
        let l = {
            INFO: "bg-blue-100 text-blue-800",
            WARN: "bg-yellow-100 text-yellow-800",
            ERROR: "bg-red-100 text-red-800",
            CRITICAL: "bg-purple-100 text-purple-800",
          },
          d = {
            OPEN: "bg-orange-100 text-orange-800",
            RESOLVED: "bg-green-100 text-green-800",
            AUTO_RESOLVED: "bg-teal-100 text-teal-800",
          };
        function o({ params: e }) {
          let t = (0, r.useRouter)(),
            [s, o] = (0, n.useState)(null),
            [c, m] = (0, n.useState)(!0),
            [x, u] = (0, n.useState)(null),
            [h, g] = (0, n.useState)(null),
            [p, b] = (0, n.useState)(!1),
            [f, y] = (0, n.useState)(null),
            [j, N] = (0, n.useState)(""),
            [v, w] = (0, n.useState)({
              context: !1,
              knowledge: !0,
              recommendations: !0,
            });
          (0, n.useEffect)(() => {
            k();
          }, [e.incidentId]);
          let k = async () => {
              try {
                (m(!0), u(null));
                let t = localStorage.getItem("adminToken");
                if (!t) throw Error("No admin token found");
                let s = await fetch(
                  `http://localhost:3005/admin/incidents/${e.incidentId}`,
                  { headers: { "x-admin-password": t } },
                );
                if (!s.ok)
                  throw Error(`Failed to fetch incident: ${s.statusText}`);
                let a = await s.json();
                o(a.incident);
              } catch (e) {
                (console.error("Error fetching incident:", e),
                  u(e instanceof Error ? e.message : "Unknown error"));
              } finally {
                m(!1);
              }
            },
            C = async () => {
              if (s)
                try {
                  (b(!0), y(null));
                  let e = localStorage.getItem("adminToken");
                  if (!e) throw Error("No admin token found");
                  let t = await fetch(
                    `http://localhost:3005/admin/incidents/${s.id}/investigate`,
                    {
                      method: "POST",
                      headers: {
                        "x-admin-password": e,
                        "Content-Type": "application/json",
                      },
                    },
                  );
                  if (!t.ok)
                    throw Error(`Investigation failed: ${t.statusText}`);
                  let a = await t.json();
                  (y({ type: "investigate", data: a }), o(a.incident), g(null));
                } catch (e) {
                  (console.error("Error investigating:", e),
                    alert(
                      e instanceof Error ? e.message : "Investigation failed",
                    ));
                } finally {
                  b(!1);
                }
            },
            S = async () => {
              if (
                s &&
                confirm(
                  "⚠️ Self-heal will attempt automated recovery. This may modify ticket data. Continue?",
                )
              )
                try {
                  (b(!0), y(null));
                  let e = localStorage.getItem("adminToken");
                  if (!e) throw Error("No admin token found");
                  let t = await fetch(
                    `http://localhost:3005/admin/incidents/${s.id}/self-heal`,
                    {
                      method: "POST",
                      headers: {
                        "x-admin-password": e,
                        "Content-Type": "application/json",
                      },
                    },
                  );
                  if (!t.ok) throw Error(`Self-heal failed: ${t.statusText}`);
                  let a = await t.json();
                  (y({ type: "selfHeal", data: a }), g(null), await k());
                } catch (e) {
                  (console.error("Error self-healing:", e),
                    alert(e instanceof Error ? e.message : "Self-heal failed"));
                } finally {
                  b(!1);
                }
            },
            D = async (e) => {
              if (s)
                try {
                  b(!0);
                  let t = localStorage.getItem("adminToken");
                  if (!t) throw Error("No admin token found");
                  let a = await fetch(
                    `http://localhost:3005/admin/incidents/${s.id}`,
                    {
                      method: "PATCH",
                      headers: {
                        "x-admin-password": t,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ status: e }),
                    },
                  );
                  if (!a.ok) throw Error(`Update failed: ${a.statusText}`);
                  await k();
                } catch (e) {
                  (console.error("Error updating status:", e),
                    alert(e instanceof Error ? e.message : "Update failed"));
                } finally {
                  b(!1);
                }
            },
            E = async () => {
              if (s && j.trim())
                try {
                  b(!0);
                  let e = localStorage.getItem("adminToken");
                  if (!e) throw Error("No admin token found");
                  let t = await fetch(
                    `http://localhost:3005/admin/incidents/${s.id}`,
                    {
                      method: "PATCH",
                      headers: {
                        "x-admin-password": e,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ notes: j.trim() }),
                    },
                  );
                  if (!t.ok)
                    throw Error(`Failed to add notes: ${t.statusText}`);
                  (N(""), g(null), await k());
                } catch (e) {
                  (console.error("Error adding notes:", e),
                    alert(
                      e instanceof Error ? e.message : "Failed to add notes",
                    ));
                } finally {
                  b(!1);
                }
            },
            P = (e) => {
              w((t) => ({ ...t, [e]: !t[e] }));
            };
          return c
            ? a.jsx(i.t, {
                children: a.jsx("div", {
                  className: "min-h-screen bg-gray-50 p-8",
                  children: a.jsx("div", {
                    className: "max-w-5xl mx-auto",
                    children: a.jsx("div", {
                      className: "flex items-center justify-center py-12",
                      children: a.jsx("div", {
                        className:
                          "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600",
                      }),
                    }),
                  }),
                }),
              })
            : x || !s
              ? a.jsx(i.t, {
                  children: a.jsx("div", {
                    className: "min-h-screen bg-gray-50 p-8",
                    children: a.jsx("div", {
                      className: "max-w-5xl mx-auto",
                      children: (0, a.jsxs)("div", {
                        className: "bg-white rounded-lg shadow p-8",
                        children: [
                          a.jsx("h2", {
                            className:
                              "text-xl font-semibold text-red-600 mb-4",
                            children: "Error",
                          }),
                          a.jsx("p", {
                            className: "text-gray-700",
                            children: x || "Incident not found",
                          }),
                          a.jsx("button", {
                            onClick: () => t.back(),
                            className:
                              "mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300",
                            children: "Go Back",
                          }),
                        ],
                      }),
                    }),
                  }),
                })
              : a.jsx(i.t, {
                  children: a.jsx("div", {
                    className: "min-h-screen bg-gray-50 p-8",
                    children: (0, a.jsxs)("div", {
                      className: "max-w-5xl mx-auto",
                      children: [
                        (0, a.jsxs)("div", {
                          className: "mb-6 flex items-center justify-between",
                          children: [
                            (0, a.jsxs)("button", {
                              onClick: () => t.back(),
                              className:
                                "flex items-center text-blue-600 hover:text-blue-800",
                              children: [
                                a.jsx("span", {
                                  className: "mr-2",
                                  children: "←",
                                }),
                                " Back to Incidents",
                              ],
                            }),
                            (0, a.jsxs)("div", {
                              className: "text-sm text-gray-500",
                              children: ["ID: ", s.id.substring(0, 12), "..."],
                            }),
                          ],
                        }),
                        f &&
                          a.jsx("div", {
                            className:
                              "mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4",
                            children: (0, a.jsxs)("div", {
                              className: "flex justify-between items-start",
                              children: [
                                (0, a.jsxs)("div", {
                                  children: [
                                    a.jsx("h3", {
                                      className:
                                        "font-semibold text-blue-900 mb-2",
                                      children:
                                        "investigate" === f.type
                                          ? "\uD83D\uDD0D Investigation Complete"
                                          : "\uD83D\uDD27 Self-Heal Complete",
                                    }),
                                    "investigate" === f.type &&
                                      a.jsx("p", {
                                        className: "text-sm text-blue-800",
                                        children:
                                          "Diagnostics updated. Check the Context section for new findings.",
                                      }),
                                    "selfHeal" === f.type &&
                                      (0, a.jsxs)("div", {
                                        className: "text-sm text-blue-800",
                                        children: [
                                          a.jsx("p", {
                                            className: "font-medium mb-1",
                                            children: f.data.success
                                              ? "✅ Success"
                                              : "❌ Failed",
                                          }),
                                          a.jsx("p", {
                                            className: "mb-2",
                                            children: f.data.message,
                                          }),
                                          f.data.details &&
                                            f.data.details.length > 0 &&
                                            a.jsx("ul", {
                                              className:
                                                "list-disc list-inside space-y-1",
                                              children: f.data.details.map(
                                                (e, t) =>
                                                  a.jsx(
                                                    "li",
                                                    { children: e },
                                                    t,
                                                  ),
                                              ),
                                            }),
                                        ],
                                      }),
                                  ],
                                }),
                                a.jsx("button", {
                                  onClick: () => y(null),
                                  className:
                                    "text-blue-600 hover:text-blue-800",
                                  children: "✕",
                                }),
                              ],
                            }),
                          }),
                        (0, a.jsxs)("div", {
                          className:
                            "bg-white rounded-lg shadow-lg overflow-hidden mb-6",
                          children: [
                            (0, a.jsxs)("div", {
                              className: "p-6 border-b border-gray-200",
                              children: [
                                a.jsx("div", {
                                  className: "flex items-start justify-between",
                                  children: (0, a.jsxs)("div", {
                                    className: "flex-1",
                                    children: [
                                      (0, a.jsxs)("div", {
                                        className:
                                          "flex items-center gap-2 mb-2",
                                        children: [
                                          a.jsx("span", {
                                            className: `px-3 py-1 text-sm font-medium rounded ${l[s.severity]}`,
                                            children: s.severity,
                                          }),
                                          a.jsx("span", {
                                            className: `px-3 py-1 text-sm font-medium rounded ${d[s.status]}`,
                                            children: s.status,
                                          }),
                                          a.jsx("span", {
                                            className:
                                              "px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded",
                                            children: s.stage,
                                          }),
                                        ],
                                      }),
                                      a.jsx("h1", {
                                        className:
                                          "text-2xl font-bold text-gray-900 mb-2",
                                        children: s.errorMessage,
                                      }),
                                      s.errorCode &&
                                        (0, a.jsxs)("p", {
                                          className: "text-sm text-gray-600",
                                          children: [
                                            "Error Code: ",
                                            s.errorCode,
                                          ],
                                        }),
                                    ],
                                  }),
                                }),
                                (0, a.jsxs)("div", {
                                  className:
                                    "mt-4 grid grid-cols-2 gap-4 text-sm",
                                  children: [
                                    (0, a.jsxs)("div", {
                                      children: [
                                        a.jsx("span", {
                                          className: "text-gray-500",
                                          children: "Created:",
                                        }),
                                        " ",
                                        a.jsx("span", {
                                          className: "font-medium",
                                          children: new Date(
                                            s.createdAt,
                                          ).toLocaleString(),
                                        }),
                                      ],
                                    }),
                                    (0, a.jsxs)("div", {
                                      children: [
                                        a.jsx("span", {
                                          className: "text-gray-500",
                                          children: "Updated:",
                                        }),
                                        " ",
                                        a.jsx("span", {
                                          className: "font-medium",
                                          children: new Date(
                                            s.updatedAt,
                                          ).toLocaleString(),
                                        }),
                                      ],
                                    }),
                                    s.resolvedAt &&
                                      (0, a.jsxs)("div", {
                                        children: [
                                          a.jsx("span", {
                                            className: "text-gray-500",
                                            children: "Resolved:",
                                          }),
                                          " ",
                                          a.jsx("span", {
                                            className: "font-medium",
                                            children: new Date(
                                              s.resolvedAt,
                                            ).toLocaleString(),
                                          }),
                                        ],
                                      }),
                                  ],
                                }),
                                s.ticket &&
                                  (0, a.jsxs)("div", {
                                    className: "mt-4 p-4 bg-gray-50 rounded-md",
                                    children: [
                                      a.jsx("h3", {
                                        className:
                                          "font-semibold text-gray-900 mb-2",
                                        children: "Related Ticket",
                                      }),
                                      (0, a.jsxs)("div", {
                                        className: "text-sm",
                                        children: [
                                          (0, a.jsxs)("p", {
                                            children: [
                                              a.jsx("span", {
                                                className: "text-gray-600",
                                                children: "Name:",
                                              }),
                                              " ",
                                              a.jsx("span", {
                                                className: "font-medium",
                                                children:
                                                  s.ticket.displayName ||
                                                  "Unnamed",
                                              }),
                                            ],
                                          }),
                                          (0, a.jsxs)("p", {
                                            children: [
                                              a.jsx("span", {
                                                className: "text-gray-600",
                                                children: "Contact Type:",
                                              }),
                                              " ",
                                              a.jsx("span", {
                                                className: "font-medium",
                                                children: s.ticket.contactType,
                                              }),
                                            ],
                                          }),
                                          (0, a.jsxs)("p", {
                                            children: [
                                              a.jsx("span", {
                                                className: "text-gray-600",
                                                children: "Status:",
                                              }),
                                              " ",
                                              a.jsx("span", {
                                                className: "font-medium",
                                                children: s.ticket.status,
                                              }),
                                            ],
                                          }),
                                          a.jsx("p", {
                                            className: "mt-2",
                                            children: a.jsx("a", {
                                              href: `/admin/tickets/${s.ticketId}`,
                                              className:
                                                "text-blue-600 hover:text-blue-800 underline",
                                              children: "View Ticket →",
                                            }),
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                              ],
                            }),
                            (0, a.jsxs)("div", {
                              className:
                                "p-6 bg-gray-50 border-b border-gray-200",
                              children: [
                                (0, a.jsxs)("div", {
                                  className: "flex flex-wrap gap-3",
                                  children: [
                                    "OPEN" === s.status &&
                                      (0, a.jsxs)(a.Fragment, {
                                        children: [
                                          a.jsx("button", {
                                            onClick: C,
                                            disabled: p,
                                            className:
                                              "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                            children: p
                                              ? "Investigating..."
                                              : "\uD83D\uDD0D Investigate",
                                          }),
                                          a.jsx("button", {
                                            onClick: S,
                                            disabled: p,
                                            className:
                                              "px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                            children: p
                                              ? "Healing..."
                                              : "\uD83D\uDD27 Self-Heal",
                                          }),
                                          a.jsx("button", {
                                            onClick: () => D("RESOLVED"),
                                            disabled: p,
                                            className:
                                              "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                            children: "✓ Mark Resolved",
                                          }),
                                        ],
                                      }),
                                    "OPEN" !== s.status &&
                                      a.jsx("button", {
                                        onClick: () => D("OPEN"),
                                        disabled: p,
                                        className:
                                          "px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                        children: "Reopen",
                                      }),
                                    a.jsx("button", {
                                      onClick: () => g("notes"),
                                      className:
                                        "px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700",
                                      children: "\uD83D\uDCDD Add Notes",
                                    }),
                                  ],
                                }),
                                "notes" === h &&
                                  (0, a.jsxs)("div", {
                                    className:
                                      "mt-4 p-4 bg-white rounded-md border border-gray-300",
                                    children: [
                                      a.jsx("label", {
                                        className:
                                          "block text-sm font-medium text-gray-700 mb-2",
                                        children: "Add Notes",
                                      }),
                                      a.jsx("textarea", {
                                        value: j,
                                        onChange: (e) => N(e.target.value),
                                        placeholder: "Enter your notes here...",
                                        rows: 4,
                                        className:
                                          "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                                      }),
                                      (0, a.jsxs)("div", {
                                        className: "mt-2 flex gap-2",
                                        children: [
                                          a.jsx("button", {
                                            onClick: E,
                                            disabled: p || !j.trim(),
                                            className:
                                              "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                            children: "Save Notes",
                                          }),
                                          a.jsx("button", {
                                            onClick: () => {
                                              (g(null), N(""));
                                            },
                                            className:
                                              "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300",
                                            children: "Cancel",
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                              ],
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          className: "bg-white rounded-lg shadow mb-6",
                          children: [
                            (0, a.jsxs)("button", {
                              onClick: () => P("knowledge"),
                              className:
                                "w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50",
                              children: [
                                (0, a.jsxs)("h2", {
                                  className:
                                    "text-lg font-semibold text-gray-900",
                                  children: [
                                    "\uD83D\uDCDA Knowledge Vault Matches (",
                                    s.knowledgeBindings.length,
                                    ")",
                                  ],
                                }),
                                a.jsx("span", {
                                  className: "text-gray-400",
                                  children: v.knowledge ? "▼" : "▶",
                                }),
                              ],
                            }),
                            v.knowledge &&
                              a.jsx("div", {
                                className: "px-6 pb-6",
                                children:
                                  0 === s.knowledgeBindings.length
                                    ? a.jsx("p", {
                                        className: "text-gray-500 italic",
                                        children:
                                          "No knowledge matches found for this incident.",
                                      })
                                    : a.jsx("div", {
                                        className: "space-y-4",
                                        children: s.knowledgeBindings.map((e) =>
                                          (0, a.jsxs)(
                                            "div",
                                            {
                                              className:
                                                "border border-gray-200 rounded-md p-4",
                                              children: [
                                                (0, a.jsxs)("div", {
                                                  className:
                                                    "flex justify-between items-start mb-2",
                                                  children: [
                                                    a.jsx("h3", {
                                                      className:
                                                        "font-semibold text-gray-900",
                                                      children:
                                                        e.chunk.source.title,
                                                    }),
                                                    null !== e.score &&
                                                      (0, a.jsxs)("span", {
                                                        className:
                                                          "text-sm text-gray-600",
                                                        children: [
                                                          "Score: ",
                                                          (
                                                            100 * e.score
                                                          ).toFixed(0),
                                                          "%",
                                                        ],
                                                      }),
                                                  ],
                                                }),
                                                e.reason &&
                                                  a.jsx("p", {
                                                    className:
                                                      "text-sm text-blue-600 mb-2 italic",
                                                    children: e.reason,
                                                  }),
                                                a.jsx("p", {
                                                  className:
                                                    "text-sm text-gray-700 mb-3 whitespace-pre-wrap",
                                                  children: e.chunk.text,
                                                }),
                                                e.chunk.metadata.tags &&
                                                  e.chunk.metadata.tags.length >
                                                    0 &&
                                                  a.jsx("div", {
                                                    className:
                                                      "flex flex-wrap gap-2 mb-2",
                                                    children:
                                                      e.chunk.metadata.tags.map(
                                                        (e, t) =>
                                                          a.jsx(
                                                            "span",
                                                            {
                                                              className:
                                                                "px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded",
                                                              children: e,
                                                            },
                                                            t,
                                                          ),
                                                      ),
                                                  }),
                                                e.chunk.metadata.actions &&
                                                  e.chunk.metadata.actions
                                                    .length > 0 &&
                                                  (0, a.jsxs)("div", {
                                                    className:
                                                      "mt-3 bg-gray-50 rounded p-3",
                                                    children: [
                                                      a.jsx("h4", {
                                                        className:
                                                          "text-sm font-semibold text-gray-900 mb-2",
                                                        children:
                                                          "Suggested Actions:",
                                                      }),
                                                      a.jsx("ul", {
                                                        className: "space-y-1",
                                                        children:
                                                          e.chunk.metadata.actions.map(
                                                            (e, t) =>
                                                              (0, a.jsxs)(
                                                                "li",
                                                                {
                                                                  className:
                                                                    "text-sm text-gray-700",
                                                                  children: [
                                                                    (0, a.jsxs)(
                                                                      "span",
                                                                      {
                                                                        className:
                                                                          "font-medium",
                                                                        children:
                                                                          [
                                                                            e.type,
                                                                            ":",
                                                                          ],
                                                                      },
                                                                    ),
                                                                    " ",
                                                                    e.description,
                                                                  ],
                                                                },
                                                                t,
                                                              ),
                                                          ),
                                                      }),
                                                    ],
                                                  }),
                                                a.jsx("a", {
                                                  href: `/admin/knowledge/${e.chunk.source.id}`,
                                                  className:
                                                    "inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 underline",
                                                  children: "View Source →",
                                                }),
                                              ],
                                            },
                                            e.id,
                                          ),
                                        ),
                                      }),
                              }),
                          ],
                        }),
                        s.recommendationsJson &&
                          (0, a.jsxs)("div", {
                            className: "bg-white rounded-lg shadow mb-6",
                            children: [
                              (0, a.jsxs)("button", {
                                onClick: () => P("recommendations"),
                                className:
                                  "w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50",
                                children: [
                                  a.jsx("h2", {
                                    className:
                                      "text-lg font-semibold text-gray-900",
                                    children: "\uD83D\uDCA1 Recommendations",
                                  }),
                                  a.jsx("span", {
                                    className: "text-gray-400",
                                    children: v.recommendations ? "▼" : "▶",
                                  }),
                                ],
                              }),
                              v.recommendations &&
                                a.jsx("div", {
                                  className: "px-6 pb-6",
                                  children: a.jsx("pre", {
                                    className:
                                      "bg-gray-50 p-4 rounded-md text-sm overflow-x-auto",
                                    children: JSON.stringify(
                                      s.recommendationsJson,
                                      null,
                                      2,
                                    ),
                                  }),
                                }),
                            ],
                          }),
                        (0, a.jsxs)("div", {
                          className: "bg-white rounded-lg shadow",
                          children: [
                            (0, a.jsxs)("button", {
                              onClick: () => P("context"),
                              className:
                                "w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50",
                              children: [
                                a.jsx("h2", {
                                  className:
                                    "text-lg font-semibold text-gray-900",
                                  children:
                                    "\uD83D\uDD0D Context & Diagnostics",
                                }),
                                a.jsx("span", {
                                  className: "text-gray-400",
                                  children: v.context ? "▼" : "▶",
                                }),
                              ],
                            }),
                            v.context &&
                              a.jsx("div", {
                                className: "px-6 pb-6",
                                children: a.jsx("pre", {
                                  className:
                                    "bg-gray-50 p-4 rounded-md text-sm overflow-x-auto max-h-96 overflow-y-auto",
                                  children: JSON.stringify(
                                    s.contextJson,
                                    null,
                                    2,
                                  ),
                                }),
                              }),
                          ],
                        }),
                      ],
                    }),
                  }),
                });
        }
      },
      56253: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { Providers: () => l }));
        var a = s(73658),
          n = s(58758),
          r = s(60459),
          i = s(55459);
        function l({ children: e }) {
          let [t] = (0, i.useState)(
            () =>
              new n.S({
                defaultOptions: { queries: { staleTime: 3e5, gcTime: 6e5 } },
              }),
          );
          return a.jsx(r.aH, { client: t, children: e });
        }
      },
      9567: (e, t, s) => {
        "use strict";
        s.d(t, { t: () => i });
        var a = s(73658),
          n = s(55459),
          r = s(32241);
        function i({ children: e }) {
          let [t, s] = (0, n.useState)(!1),
            [i, l] = (0, n.useState)(!0),
            [d, o] = (0, n.useState)(""),
            [c, m] = (0, n.useState)("");
          ((0, r.useRouter)(),
            (0, n.useEffect)(() => {
              let e = localStorage.getItem("adminToken");
              e ? x(e) : l(!1);
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
                l(!1);
              }
            },
            u = async (e) => {
              (e.preventDefault(), m(""));
              try {
                let e = await fetch("/api/admin/db/connection-info", {
                  headers: { Authorization: `Bearer ${d}` },
                });
                e.ok
                  ? (localStorage.setItem("adminToken", d), s(!0), o(""))
                  : m("Invalid admin password");
              } catch (e) {
                m("Authentication failed - server may be unavailable");
              }
            };
          return i
            ? a.jsx("div", {
                className:
                  "min-h-screen flex items-center justify-center bg-gray-50",
                children: (0, a.jsxs)("div", {
                  className: "text-center",
                  children: [
                    a.jsx("div", {
                      className:
                        "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4",
                    }),
                    a.jsx("p", {
                      className: "text-gray-600",
                      children: "Verifying authentication...",
                    }),
                  ],
                }),
              })
            : t
              ? (0, a.jsxs)("div", {
                  children: [
                    (0, a.jsxs)("div", {
                      className:
                        "bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center",
                      children: [
                        (0, a.jsxs)("div", {
                          className: "flex items-center space-x-2",
                          children: [
                            a.jsx("div", {
                              className: "w-2 h-2 bg-green-500 rounded-full",
                            }),
                            a.jsx("span", {
                              className: "text-sm text-gray-600",
                              children: "Admin authenticated",
                            }),
                          ],
                        }),
                        a.jsx("button", {
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
              : a.jsx("div", {
                  className:
                    "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100",
                  children: a.jsx("div", {
                    className: "max-w-md w-full mx-4",
                    children: (0, a.jsxs)("div", {
                      className: "bg-white rounded-lg shadow-xl p-8",
                      children: [
                        (0, a.jsxs)("div", {
                          className: "text-center mb-8",
                          children: [
                            a.jsx("div", {
                              className:
                                "inline-block p-3 bg-blue-100 rounded-full mb-4",
                              children: a.jsx("svg", {
                                className: "w-8 h-8 text-blue-600",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: a.jsx("path", {
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: 2,
                                  d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                                }),
                              }),
                            }),
                            a.jsx("h2", {
                              className:
                                "text-2xl font-bold text-gray-900 mb-2",
                              children: "Admin Access Required",
                            }),
                            a.jsx("p", {
                              className: "text-gray-600",
                              children:
                                "Enter admin password to access Knowledge Vault",
                            }),
                          ],
                        }),
                        (0, a.jsxs)("form", {
                          onSubmit: u,
                          className: "space-y-4",
                          children: [
                            (0, a.jsxs)("div", {
                              children: [
                                a.jsx("label", {
                                  htmlFor: "password",
                                  className:
                                    "block text-sm font-medium text-gray-700 mb-1",
                                  children: "Admin Password",
                                }),
                                a.jsx("input", {
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
                              a.jsx("div", {
                                className:
                                  "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded",
                                children: c,
                              }),
                            a.jsx("button", {
                              type: "submit",
                              className:
                                "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors",
                              children: "Unlock",
                            }),
                          ],
                        }),
                        a.jsx("div", {
                          className: "mt-6 text-center text-sm text-gray-500",
                          children: a.jsx("p", {
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
        var a = s(73658),
          n = s(84874),
          r = s.n(n),
          i = s(32241),
          l = s(17872);
        function d() {
          let e = (0, i.usePathname)();
          return "/system" === e
            ? null
            : a.jsx("header", {
                className: "bg-white shadow-sm border-b border-gray-200",
                children: a.jsx("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                  children: (0, a.jsxs)("div", {
                    className: "flex justify-between items-center py-4",
                    children: [
                      (0, a.jsxs)("div", {
                        className: "flex items-center gap-4",
                        children: [
                          a.jsx(r(), {
                            href: "/",
                            className: "flex items-center gap-2",
                            children: a.jsx("div", {
                              className: "text-3xl font-black text-blue-900",
                              children: "CareConnect",
                            }),
                          }),
                          a.jsx("div", {
                            className:
                              "hidden sm:block text-sm text-gray-600 font-medium border-l border-gray-300 pl-4",
                            children: "Community-Supported Homeless Initiative",
                          }),
                        ],
                      }),
                      (0, a.jsxs)("div", {
                        className: "flex items-center gap-6",
                        children: [
                          (0, a.jsxs)("nav", {
                            className: "hidden md:flex items-center gap-6",
                            children: [
                              a.jsx(r(), {
                                href: "/about",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "About",
                              }),
                              a.jsx(r(), {
                                href: "/resources",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Resources",
                              }),
                              a.jsx(r(), {
                                href: "/find",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Find",
                              }),
                              a.jsx(r(), {
                                href: "/support",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Support",
                              }),
                            ],
                          }),
                          (0, a.jsxs)(r(), {
                            href: "/system",
                            className:
                              "flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition group",
                            title: "System Diagnostics",
                            children: [
                              a.jsx(l.Z, {
                                size: 16,
                                className: "group-hover:text-blue-600",
                              }),
                              a.jsx("span", {
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
      48566: (e, t, s) => {
        "use strict";
        (s.r(t),
          s.d(t, { $$typeof: () => i, __esModule: () => r, default: () => d }));
        var a = s(19894);
        let n = (0, a.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\admin\knowledge\incidents\[incidentId]\page.tsx`,
          ),
          { __esModule: r, $$typeof: i } = n,
          l = n.default,
          d = l;
      },
      18685: (e, t, s) => {
        "use strict";
        (s.r(t), s.d(t, { default: () => b, metadata: () => p }));
        var a = s(31487),
          n = s(72972),
          r = s.n(n);
        s(40642);
        var i = s(19894);
        let l = (0, i.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx`,
          ),
          { __esModule: d, $$typeof: o } = l;
        l.default;
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
          return a.jsx("html", {
            lang: "en",
            children: a.jsx("body", {
              className: r().className,
              children: (0, a.jsxs)(c, {
                children: [
                  a.jsx(g, {}),
                  a.jsx("div", {
                    className: "min-h-screen bg-gray-50",
                    children: a.jsx("main", { children: e }),
                  }),
                  a.jsx(m.x7, {
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
    a = t.X(0, [623, 934], () => s(99856));
  module.exports = a;
})();

(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [592],
  {
    52128: function (e, t, s) {
      Promise.resolve().then(s.bind(s, 15724));
    },
    15724: function (e, t, s) {
      "use strict";
      (s.r(t),
        s.d(t, {
          default: function () {
            return o;
          },
        }));
      var a = s(37821),
        n = s(58078),
        r = s(46179),
        l = s(39052);
      let i = {
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
      function o(e) {
        let { params: t } = e,
          s = (0, r.useRouter)(),
          [o, c] = (0, n.useState)(null),
          [m, x] = (0, n.useState)(!0),
          [u, h] = (0, n.useState)(null),
          [g, p] = (0, n.useState)(null),
          [b, f] = (0, n.useState)(!1),
          [y, j] = (0, n.useState)(null),
          [N, w] = (0, n.useState)(""),
          [v, k] = (0, n.useState)({
            context: !1,
            knowledge: !0,
            recommendations: !0,
          });
        (0, n.useEffect)(() => {
          S();
        }, [t.incidentId]);
        let S = async () => {
            try {
              (x(!0), h(null));
              let e = localStorage.getItem("adminToken");
              if (!e) throw Error("No admin token found");
              let s = await fetch(
                "http://localhost:3005/admin/incidents/".concat(t.incidentId),
                { headers: { "x-admin-password": e } },
              );
              if (!s.ok)
                throw Error("Failed to fetch incident: ".concat(s.statusText));
              let a = await s.json();
              c(a.incident);
            } catch (e) {
              (console.error("Error fetching incident:", e),
                h(e instanceof Error ? e.message : "Unknown error"));
            } finally {
              x(!1);
            }
          },
          D = async () => {
            if (o)
              try {
                (f(!0), j(null));
                let e = localStorage.getItem("adminToken");
                if (!e) throw Error("No admin token found");
                let t = await fetch(
                  "http://localhost:3005/admin/incidents/".concat(
                    o.id,
                    "/investigate",
                  ),
                  {
                    method: "POST",
                    headers: {
                      "x-admin-password": e,
                      "Content-Type": "application/json",
                    },
                  },
                );
                if (!t.ok)
                  throw Error("Investigation failed: ".concat(t.statusText));
                let s = await t.json();
                (j({ type: "investigate", data: s }), c(s.incident), p(null));
              } catch (e) {
                (console.error("Error investigating:", e),
                  alert(
                    e instanceof Error ? e.message : "Investigation failed",
                  ));
              } finally {
                f(!1);
              }
          },
          E = async () => {
            if (
              o &&
              confirm(
                "⚠️ Self-heal will attempt automated recovery. This may modify ticket data. Continue?",
              )
            )
              try {
                (f(!0), j(null));
                let e = localStorage.getItem("adminToken");
                if (!e) throw Error("No admin token found");
                let t = await fetch(
                  "http://localhost:3005/admin/incidents/".concat(
                    o.id,
                    "/self-heal",
                  ),
                  {
                    method: "POST",
                    headers: {
                      "x-admin-password": e,
                      "Content-Type": "application/json",
                    },
                  },
                );
                if (!t.ok)
                  throw Error("Self-heal failed: ".concat(t.statusText));
                let s = await t.json();
                (j({ type: "selfHeal", data: s }), p(null), await S());
              } catch (e) {
                (console.error("Error self-healing:", e),
                  alert(e instanceof Error ? e.message : "Self-heal failed"));
              } finally {
                f(!1);
              }
          },
          C = async (e) => {
            if (o)
              try {
                f(!0);
                let t = localStorage.getItem("adminToken");
                if (!t) throw Error("No admin token found");
                let s = await fetch(
                  "http://localhost:3005/admin/incidents/".concat(o.id),
                  {
                    method: "PATCH",
                    headers: {
                      "x-admin-password": t,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: e }),
                  },
                );
                if (!s.ok) throw Error("Update failed: ".concat(s.statusText));
                await S();
              } catch (e) {
                (console.error("Error updating status:", e),
                  alert(e instanceof Error ? e.message : "Update failed"));
              } finally {
                f(!1);
              }
          },
          T = async () => {
            if (o && N.trim())
              try {
                f(!0);
                let e = localStorage.getItem("adminToken");
                if (!e) throw Error("No admin token found");
                let t = await fetch(
                  "http://localhost:3005/admin/incidents/".concat(o.id),
                  {
                    method: "PATCH",
                    headers: {
                      "x-admin-password": e,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ notes: N.trim() }),
                  },
                );
                if (!t.ok)
                  throw Error("Failed to add notes: ".concat(t.statusText));
                (w(""), p(null), await S());
              } catch (e) {
                (console.error("Error adding notes:", e),
                  alert(
                    e instanceof Error ? e.message : "Failed to add notes",
                  ));
              } finally {
                f(!1);
              }
          },
          I = (e) => {
            k((t) => ({ ...t, [e]: !t[e] }));
          };
        return m
          ? (0, a.jsx)(l.t, {
              children: (0, a.jsx)("div", {
                className: "min-h-screen bg-gray-50 p-8",
                children: (0, a.jsx)("div", {
                  className: "max-w-5xl mx-auto",
                  children: (0, a.jsx)("div", {
                    className: "flex items-center justify-center py-12",
                    children: (0, a.jsx)("div", {
                      className:
                        "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600",
                    }),
                  }),
                }),
              }),
            })
          : u || !o
            ? (0, a.jsx)(l.t, {
                children: (0, a.jsx)("div", {
                  className: "min-h-screen bg-gray-50 p-8",
                  children: (0, a.jsx)("div", {
                    className: "max-w-5xl mx-auto",
                    children: (0, a.jsxs)("div", {
                      className: "bg-white rounded-lg shadow p-8",
                      children: [
                        (0, a.jsx)("h2", {
                          className: "text-xl font-semibold text-red-600 mb-4",
                          children: "Error",
                        }),
                        (0, a.jsx)("p", {
                          className: "text-gray-700",
                          children: u || "Incident not found",
                        }),
                        (0, a.jsx)("button", {
                          onClick: () => s.back(),
                          className:
                            "mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300",
                          children: "Go Back",
                        }),
                      ],
                    }),
                  }),
                }),
              })
            : (0, a.jsx)(l.t, {
                children: (0, a.jsx)("div", {
                  className: "min-h-screen bg-gray-50 p-8",
                  children: (0, a.jsxs)("div", {
                    className: "max-w-5xl mx-auto",
                    children: [
                      (0, a.jsxs)("div", {
                        className: "mb-6 flex items-center justify-between",
                        children: [
                          (0, a.jsxs)("button", {
                            onClick: () => s.back(),
                            className:
                              "flex items-center text-blue-600 hover:text-blue-800",
                            children: [
                              (0, a.jsx)("span", {
                                className: "mr-2",
                                children: "←",
                              }),
                              " Back to Incidents",
                            ],
                          }),
                          (0, a.jsxs)("div", {
                            className: "text-sm text-gray-500",
                            children: ["ID: ", o.id.substring(0, 12), "..."],
                          }),
                        ],
                      }),
                      y &&
                        (0, a.jsx)("div", {
                          className:
                            "mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4",
                          children: (0, a.jsxs)("div", {
                            className: "flex justify-between items-start",
                            children: [
                              (0, a.jsxs)("div", {
                                children: [
                                  (0, a.jsx)("h3", {
                                    className:
                                      "font-semibold text-blue-900 mb-2",
                                    children:
                                      "investigate" === y.type
                                        ? "\uD83D\uDD0D Investigation Complete"
                                        : "\uD83D\uDD27 Self-Heal Complete",
                                  }),
                                  "investigate" === y.type &&
                                    (0, a.jsx)("p", {
                                      className: "text-sm text-blue-800",
                                      children:
                                        "Diagnostics updated. Check the Context section for new findings.",
                                    }),
                                  "selfHeal" === y.type &&
                                    (0, a.jsxs)("div", {
                                      className: "text-sm text-blue-800",
                                      children: [
                                        (0, a.jsx)("p", {
                                          className: "font-medium mb-1",
                                          children: y.data.success
                                            ? "✅ Success"
                                            : "❌ Failed",
                                        }),
                                        (0, a.jsx)("p", {
                                          className: "mb-2",
                                          children: y.data.message,
                                        }),
                                        y.data.details &&
                                          y.data.details.length > 0 &&
                                          (0, a.jsx)("ul", {
                                            className:
                                              "list-disc list-inside space-y-1",
                                            children: y.data.details.map(
                                              (e, t) =>
                                                (0, a.jsx)(
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
                              (0, a.jsx)("button", {
                                onClick: () => j(null),
                                className: "text-blue-600 hover:text-blue-800",
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
                              (0, a.jsx)("div", {
                                className: "flex items-start justify-between",
                                children: (0, a.jsxs)("div", {
                                  className: "flex-1",
                                  children: [
                                    (0, a.jsxs)("div", {
                                      className: "flex items-center gap-2 mb-2",
                                      children: [
                                        (0, a.jsx)("span", {
                                          className:
                                            "px-3 py-1 text-sm font-medium rounded ".concat(
                                              i[o.severity],
                                            ),
                                          children: o.severity,
                                        }),
                                        (0, a.jsx)("span", {
                                          className:
                                            "px-3 py-1 text-sm font-medium rounded ".concat(
                                              d[o.status],
                                            ),
                                          children: o.status,
                                        }),
                                        (0, a.jsx)("span", {
                                          className:
                                            "px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded",
                                          children: o.stage,
                                        }),
                                      ],
                                    }),
                                    (0, a.jsx)("h1", {
                                      className:
                                        "text-2xl font-bold text-gray-900 mb-2",
                                      children: o.errorMessage,
                                    }),
                                    o.errorCode &&
                                      (0, a.jsxs)("p", {
                                        className: "text-sm text-gray-600",
                                        children: ["Error Code: ", o.errorCode],
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
                                      (0, a.jsx)("span", {
                                        className: "text-gray-500",
                                        children: "Created:",
                                      }),
                                      " ",
                                      (0, a.jsx)("span", {
                                        className: "font-medium",
                                        children: new Date(
                                          o.createdAt,
                                        ).toLocaleString(),
                                      }),
                                    ],
                                  }),
                                  (0, a.jsxs)("div", {
                                    children: [
                                      (0, a.jsx)("span", {
                                        className: "text-gray-500",
                                        children: "Updated:",
                                      }),
                                      " ",
                                      (0, a.jsx)("span", {
                                        className: "font-medium",
                                        children: new Date(
                                          o.updatedAt,
                                        ).toLocaleString(),
                                      }),
                                    ],
                                  }),
                                  o.resolvedAt &&
                                    (0, a.jsxs)("div", {
                                      children: [
                                        (0, a.jsx)("span", {
                                          className: "text-gray-500",
                                          children: "Resolved:",
                                        }),
                                        " ",
                                        (0, a.jsx)("span", {
                                          className: "font-medium",
                                          children: new Date(
                                            o.resolvedAt,
                                          ).toLocaleString(),
                                        }),
                                      ],
                                    }),
                                ],
                              }),
                              o.ticket &&
                                (0, a.jsxs)("div", {
                                  className: "mt-4 p-4 bg-gray-50 rounded-md",
                                  children: [
                                    (0, a.jsx)("h3", {
                                      className:
                                        "font-semibold text-gray-900 mb-2",
                                      children: "Related Ticket",
                                    }),
                                    (0, a.jsxs)("div", {
                                      className: "text-sm",
                                      children: [
                                        (0, a.jsxs)("p", {
                                          children: [
                                            (0, a.jsx)("span", {
                                              className: "text-gray-600",
                                              children: "Name:",
                                            }),
                                            " ",
                                            (0, a.jsx)("span", {
                                              className: "font-medium",
                                              children:
                                                o.ticket.displayName ||
                                                "Unnamed",
                                            }),
                                          ],
                                        }),
                                        (0, a.jsxs)("p", {
                                          children: [
                                            (0, a.jsx)("span", {
                                              className: "text-gray-600",
                                              children: "Contact Type:",
                                            }),
                                            " ",
                                            (0, a.jsx)("span", {
                                              className: "font-medium",
                                              children: o.ticket.contactType,
                                            }),
                                          ],
                                        }),
                                        (0, a.jsxs)("p", {
                                          children: [
                                            (0, a.jsx)("span", {
                                              className: "text-gray-600",
                                              children: "Status:",
                                            }),
                                            " ",
                                            (0, a.jsx)("span", {
                                              className: "font-medium",
                                              children: o.ticket.status,
                                            }),
                                          ],
                                        }),
                                        (0, a.jsx)("p", {
                                          className: "mt-2",
                                          children: (0, a.jsx)("a", {
                                            href: "/admin/tickets/".concat(
                                              o.ticketId,
                                            ),
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
                                  "OPEN" === o.status &&
                                    (0, a.jsxs)(a.Fragment, {
                                      children: [
                                        (0, a.jsx)("button", {
                                          onClick: D,
                                          disabled: b,
                                          className:
                                            "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                          children: b
                                            ? "Investigating..."
                                            : "\uD83D\uDD0D Investigate",
                                        }),
                                        (0, a.jsx)("button", {
                                          onClick: E,
                                          disabled: b,
                                          className:
                                            "px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                          children: b
                                            ? "Healing..."
                                            : "\uD83D\uDD27 Self-Heal",
                                        }),
                                        (0, a.jsx)("button", {
                                          onClick: () => C("RESOLVED"),
                                          disabled: b,
                                          className:
                                            "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                          children: "✓ Mark Resolved",
                                        }),
                                      ],
                                    }),
                                  "OPEN" !== o.status &&
                                    (0, a.jsx)("button", {
                                      onClick: () => C("OPEN"),
                                      disabled: b,
                                      className:
                                        "px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                      children: "Reopen",
                                    }),
                                  (0, a.jsx)("button", {
                                    onClick: () => p("notes"),
                                    className:
                                      "px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700",
                                    children: "\uD83D\uDCDD Add Notes",
                                  }),
                                ],
                              }),
                              "notes" === g &&
                                (0, a.jsxs)("div", {
                                  className:
                                    "mt-4 p-4 bg-white rounded-md border border-gray-300",
                                  children: [
                                    (0, a.jsx)("label", {
                                      className:
                                        "block text-sm font-medium text-gray-700 mb-2",
                                      children: "Add Notes",
                                    }),
                                    (0, a.jsx)("textarea", {
                                      value: N,
                                      onChange: (e) => w(e.target.value),
                                      placeholder: "Enter your notes here...",
                                      rows: 4,
                                      className:
                                        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                                    }),
                                    (0, a.jsxs)("div", {
                                      className: "mt-2 flex gap-2",
                                      children: [
                                        (0, a.jsx)("button", {
                                          onClick: T,
                                          disabled: b || !N.trim(),
                                          className:
                                            "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                                          children: "Save Notes",
                                        }),
                                        (0, a.jsx)("button", {
                                          onClick: () => {
                                            (p(null), w(""));
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
                            onClick: () => I("knowledge"),
                            className:
                              "w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50",
                            children: [
                              (0, a.jsxs)("h2", {
                                className:
                                  "text-lg font-semibold text-gray-900",
                                children: [
                                  "\uD83D\uDCDA Knowledge Vault Matches (",
                                  o.knowledgeBindings.length,
                                  ")",
                                ],
                              }),
                              (0, a.jsx)("span", {
                                className: "text-gray-400",
                                children: v.knowledge ? "▼" : "▶",
                              }),
                            ],
                          }),
                          v.knowledge &&
                            (0, a.jsx)("div", {
                              className: "px-6 pb-6",
                              children:
                                0 === o.knowledgeBindings.length
                                  ? (0, a.jsx)("p", {
                                      className: "text-gray-500 italic",
                                      children:
                                        "No knowledge matches found for this incident.",
                                    })
                                  : (0, a.jsx)("div", {
                                      className: "space-y-4",
                                      children: o.knowledgeBindings.map((e) =>
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
                                                  (0, a.jsx)("h3", {
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
                                                        (100 * e.score).toFixed(
                                                          0,
                                                        ),
                                                        "%",
                                                      ],
                                                    }),
                                                ],
                                              }),
                                              e.reason &&
                                                (0, a.jsx)("p", {
                                                  className:
                                                    "text-sm text-blue-600 mb-2 italic",
                                                  children: e.reason,
                                                }),
                                              (0, a.jsx)("p", {
                                                className:
                                                  "text-sm text-gray-700 mb-3 whitespace-pre-wrap",
                                                children: e.chunk.text,
                                              }),
                                              e.chunk.metadata.tags &&
                                                e.chunk.metadata.tags.length >
                                                  0 &&
                                                (0, a.jsx)("div", {
                                                  className:
                                                    "flex flex-wrap gap-2 mb-2",
                                                  children:
                                                    e.chunk.metadata.tags.map(
                                                      (e, t) =>
                                                        (0, a.jsx)(
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
                                                    (0, a.jsx)("h4", {
                                                      className:
                                                        "text-sm font-semibold text-gray-900 mb-2",
                                                      children:
                                                        "Suggested Actions:",
                                                    }),
                                                    (0, a.jsx)("ul", {
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
                                              (0, a.jsx)("a", {
                                                href: "/admin/knowledge/".concat(
                                                  e.chunk.source.id,
                                                ),
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
                      o.recommendationsJson &&
                        (0, a.jsxs)("div", {
                          className: "bg-white rounded-lg shadow mb-6",
                          children: [
                            (0, a.jsxs)("button", {
                              onClick: () => I("recommendations"),
                              className:
                                "w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50",
                              children: [
                                (0, a.jsx)("h2", {
                                  className:
                                    "text-lg font-semibold text-gray-900",
                                  children: "\uD83D\uDCA1 Recommendations",
                                }),
                                (0, a.jsx)("span", {
                                  className: "text-gray-400",
                                  children: v.recommendations ? "▼" : "▶",
                                }),
                              ],
                            }),
                            v.recommendations &&
                              (0, a.jsx)("div", {
                                className: "px-6 pb-6",
                                children: (0, a.jsx)("pre", {
                                  className:
                                    "bg-gray-50 p-4 rounded-md text-sm overflow-x-auto",
                                  children: JSON.stringify(
                                    o.recommendationsJson,
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
                            onClick: () => I("context"),
                            className:
                              "w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50",
                            children: [
                              (0, a.jsx)("h2", {
                                className:
                                  "text-lg font-semibold text-gray-900",
                                children: "\uD83D\uDD0D Context & Diagnostics",
                              }),
                              (0, a.jsx)("span", {
                                className: "text-gray-400",
                                children: v.context ? "▼" : "▶",
                              }),
                            ],
                          }),
                          v.context &&
                            (0, a.jsx)("div", {
                              className: "px-6 pb-6",
                              children: (0, a.jsx)("pre", {
                                className:
                                  "bg-gray-50 p-4 rounded-md text-sm overflow-x-auto max-h-96 overflow-y-auto",
                                children: JSON.stringify(
                                  o.contextJson,
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
    39052: function (e, t, s) {
      "use strict";
      s.d(t, {
        t: function () {
          return l;
        },
      });
      var a = s(37821),
        n = s(58078),
        r = s(46179);
      function l(e) {
        let { children: t } = e,
          [s, l] = (0, n.useState)(!1),
          [i, d] = (0, n.useState)(!0),
          [o, c] = (0, n.useState)(""),
          [m, x] = (0, n.useState)("");
        ((0, r.useRouter)(),
          (0, n.useEffect)(() => {
            let e = localStorage.getItem("adminToken");
            e ? u(e) : d(!1);
          }, []));
        let u = async (e) => {
            try {
              let t = await fetch("/api/admin/db/connection-info", {
                headers: { Authorization: "Bearer ".concat(e) },
              });
              t.ok ? l(!0) : localStorage.removeItem("adminToken");
            } catch (e) {
              l(!0);
            } finally {
              d(!1);
            }
          },
          h = async (e) => {
            (e.preventDefault(), x(""));
            try {
              let e = await fetch("/api/admin/db/connection-info", {
                headers: { Authorization: "Bearer ".concat(o) },
              });
              e.ok
                ? (localStorage.setItem("adminToken", o), l(!0), c(""))
                : x("Invalid admin password");
            } catch (e) {
              x("Authentication failed - server may be unavailable");
            }
          };
        return i
          ? (0, a.jsx)("div", {
              className:
                "min-h-screen flex items-center justify-center bg-gray-50",
              children: (0, a.jsxs)("div", {
                className: "text-center",
                children: [
                  (0, a.jsx)("div", {
                    className:
                      "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4",
                  }),
                  (0, a.jsx)("p", {
                    className: "text-gray-600",
                    children: "Verifying authentication...",
                  }),
                ],
              }),
            })
          : s
            ? (0, a.jsxs)("div", {
                children: [
                  (0, a.jsxs)("div", {
                    className:
                      "bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center",
                    children: [
                      (0, a.jsxs)("div", {
                        className: "flex items-center space-x-2",
                        children: [
                          (0, a.jsx)("div", {
                            className: "w-2 h-2 bg-green-500 rounded-full",
                          }),
                          (0, a.jsx)("span", {
                            className: "text-sm text-gray-600",
                            children: "Admin authenticated",
                          }),
                        ],
                      }),
                      (0, a.jsx)("button", {
                        onClick: () => {
                          (localStorage.removeItem("adminToken"), l(!1), c(""));
                        },
                        className:
                          "text-sm text-gray-600 hover:text-gray-900 underline",
                        children: "Logout",
                      }),
                    ],
                  }),
                  t,
                ],
              })
            : (0, a.jsx)("div", {
                className:
                  "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100",
                children: (0, a.jsx)("div", {
                  className: "max-w-md w-full mx-4",
                  children: (0, a.jsxs)("div", {
                    className: "bg-white rounded-lg shadow-xl p-8",
                    children: [
                      (0, a.jsxs)("div", {
                        className: "text-center mb-8",
                        children: [
                          (0, a.jsx)("div", {
                            className:
                              "inline-block p-3 bg-blue-100 rounded-full mb-4",
                            children: (0, a.jsx)("svg", {
                              className: "w-8 h-8 text-blue-600",
                              fill: "none",
                              stroke: "currentColor",
                              viewBox: "0 0 24 24",
                              children: (0, a.jsx)("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                              }),
                            }),
                          }),
                          (0, a.jsx)("h2", {
                            className: "text-2xl font-bold text-gray-900 mb-2",
                            children: "Admin Access Required",
                          }),
                          (0, a.jsx)("p", {
                            className: "text-gray-600",
                            children:
                              "Enter admin password to access Knowledge Vault",
                          }),
                        ],
                      }),
                      (0, a.jsxs)("form", {
                        onSubmit: h,
                        className: "space-y-4",
                        children: [
                          (0, a.jsxs)("div", {
                            children: [
                              (0, a.jsx)("label", {
                                htmlFor: "password",
                                className:
                                  "block text-sm font-medium text-gray-700 mb-1",
                                children: "Admin Password",
                              }),
                              (0, a.jsx)("input", {
                                id: "password",
                                type: "password",
                                value: o,
                                onChange: (e) => c(e.target.value),
                                placeholder: "Enter admin password",
                                className:
                                  "w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                autoFocus: !0,
                                required: !0,
                              }),
                            ],
                          }),
                          m &&
                            (0, a.jsx)("div", {
                              className:
                                "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded",
                              children: m,
                            }),
                          (0, a.jsx)("button", {
                            type: "submit",
                            className:
                              "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors",
                            children: "Unlock",
                          }),
                        ],
                      }),
                      (0, a.jsx)("div", {
                        className: "mt-6 text-center text-sm text-gray-500",
                        children: (0, a.jsx)("p", {
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
    8489: function (e, t, s) {
      "use strict";
      var a = s(58078),
        n = Symbol.for("react.element"),
        r = Symbol.for("react.fragment"),
        l = Object.prototype.hasOwnProperty,
        i =
          a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
            .ReactCurrentOwner,
        d = { key: !0, ref: !0, __self: !0, __source: !0 };
      function o(e, t, s) {
        var a,
          r = {},
          o = null,
          c = null;
        for (a in (void 0 !== s && (o = "" + s),
        void 0 !== t.key && (o = "" + t.key),
        void 0 !== t.ref && (c = t.ref),
        t))
          l.call(t, a) && !d.hasOwnProperty(a) && (r[a] = t[a]);
        if (e && e.defaultProps)
          for (a in (t = e.defaultProps)) void 0 === r[a] && (r[a] = t[a]);
        return {
          $$typeof: n,
          type: e,
          key: o,
          ref: c,
          props: r,
          _owner: i.current,
        };
      }
      ((t.Fragment = r), (t.jsx = o), (t.jsxs = o));
    },
    37821: function (e, t, s) {
      "use strict";
      e.exports = s(8489);
    },
    46179: function (e, t, s) {
      e.exports = s(85353);
    },
  },
  function (e) {
    (e.O(0, [115, 835, 744], function () {
      return e((e.s = 52128));
    }),
      (_N_E = e.O()));
  },
]);

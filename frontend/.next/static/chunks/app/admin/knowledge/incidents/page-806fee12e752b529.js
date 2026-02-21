(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [809],
  {
    82732: function (e, t, s) {
      Promise.resolve().then(s.bind(s, 36258));
    },
    36258: function (e, t, s) {
      "use strict";
      (s.r(t),
        s.d(t, {
          default: function () {
            return o;
          },
        }));
      var a = s(37821),
        r = s(58078),
        n = s(46179),
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
      function o() {
        let e = (0, n.useRouter)(),
          [t, s] = (0, r.useState)([]),
          [o, c] = (0, r.useState)(null),
          [x, m] = (0, r.useState)({
            page: 1,
            limit: 50,
            total: 0,
            totalPages: 0,
          }),
          [u, h] = (0, r.useState)(!0),
          [g, p] = (0, r.useState)(null),
          [b, y] = (0, r.useState)(""),
          [f, j] = (0, r.useState)(""),
          [v, N] = (0, r.useState)(""),
          [w, k] = (0, r.useState)("");
        (0, r.useEffect)(() => {
          (S(), E());
        }, [x.page, b, f, v, w]);
        let S = async () => {
            try {
              (h(!0), p(null));
              let e = localStorage.getItem("adminToken");
              if (!e) throw Error("No admin token found");
              let t = new URLSearchParams({
                page: x.page.toString(),
                limit: x.limit.toString(),
              });
              (b && t.append("status", b),
                f && t.append("stage", f),
                v && t.append("severity", v),
                w && t.append("ticketId", w));
              let a = await fetch(
                "http://localhost:3005/admin/incidents?".concat(t),
                { headers: { "x-admin-password": e } },
              );
              if (!a.ok)
                throw Error("Failed to fetch incidents: ".concat(a.statusText));
              let r = await a.json();
              (s(r.incidents), m(r.pagination));
            } catch (e) {
              (console.error("Error fetching incidents:", e),
                p(e instanceof Error ? e.message : "Unknown error"));
            } finally {
              h(!1);
            }
          },
          E = async () => {
            try {
              let e = localStorage.getItem("adminToken");
              if (!e) return;
              let t = new URLSearchParams();
              w && t.append("ticketId", w);
              let s = await fetch(
                "http://localhost:3005/admin/incidents/stats?".concat(t),
                { headers: { "x-admin-password": e } },
              );
              if (s.ok) {
                let e = await s.json();
                c(e);
              }
            } catch (e) {
              console.error("Error fetching stats:", e);
            }
          },
          R = (t) => {
            e.push("/admin/knowledge/incidents/".concat(t));
          };
        return (0, a.jsx)(l.t, {
          children: (0, a.jsx)("div", {
            className: "min-h-screen bg-gray-50 p-8",
            children: (0, a.jsxs)("div", {
              className: "max-w-7xl mx-auto",
              children: [
                (0, a.jsxs)("div", {
                  className: "mb-8",
                  children: [
                    (0, a.jsx)("h1", {
                      className: "text-3xl font-bold text-gray-900 mb-2",
                      children: "Pipeline Incidents",
                    }),
                    (0, a.jsx)("p", {
                      className: "text-gray-600",
                      children:
                        "Monitor pipeline failures and quality issues with Knowledge Vault recommendations",
                    }),
                  ],
                }),
                o &&
                  (0, a.jsxs)("div", {
                    className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-8",
                    children: [
                      (0, a.jsxs)("div", {
                        className: "bg-white rounded-lg shadow p-6",
                        children: [
                          (0, a.jsx)("div", {
                            className: "text-sm font-medium text-gray-500 mb-1",
                            children: "Total Incidents",
                          }),
                          (0, a.jsx)("div", {
                            className: "text-3xl font-bold text-gray-900",
                            children: o.total,
                          }),
                        ],
                      }),
                      (0, a.jsxs)("div", {
                        className: "bg-white rounded-lg shadow p-6",
                        children: [
                          (0, a.jsx)("div", {
                            className: "text-sm font-medium text-gray-500 mb-1",
                            children: "Open",
                          }),
                          (0, a.jsx)("div", {
                            className: "text-3xl font-bold text-orange-600",
                            children: o.byStatus.OPEN || 0,
                          }),
                        ],
                      }),
                      (0, a.jsxs)("div", {
                        className: "bg-white rounded-lg shadow p-6",
                        children: [
                          (0, a.jsx)("div", {
                            className: "text-sm font-medium text-gray-500 mb-1",
                            children: "Resolved",
                          }),
                          (0, a.jsx)("div", {
                            className: "text-3xl font-bold text-green-600",
                            children: o.byStatus.RESOLVED || 0,
                          }),
                        ],
                      }),
                      (0, a.jsxs)("div", {
                        className: "bg-white rounded-lg shadow p-6",
                        children: [
                          (0, a.jsx)("div", {
                            className: "text-sm font-medium text-gray-500 mb-1",
                            children: "Auto-Resolved",
                          }),
                          (0, a.jsx)("div", {
                            className: "text-3xl font-bold text-teal-600",
                            children: o.byStatus.AUTO_RESOLVED || 0,
                          }),
                        ],
                      }),
                    ],
                  }),
                (0, a.jsxs)("div", {
                  className: "bg-white rounded-lg shadow p-6 mb-6",
                  children: [
                    (0, a.jsxs)("div", {
                      className: "flex items-center justify-between mb-4",
                      children: [
                        (0, a.jsx)("h2", {
                          className: "text-lg font-semibold text-gray-900",
                          children: "Filters",
                        }),
                        (b || f || v || w) &&
                          (0, a.jsx)("button", {
                            onClick: () => {
                              (y(""),
                                j(""),
                                N(""),
                                k(""),
                                m({ ...x, page: 1 }));
                            },
                            className:
                              "text-sm text-blue-600 hover:text-blue-800",
                            children: "Clear All",
                          }),
                      ],
                    }),
                    (0, a.jsxs)("div", {
                      className: "grid grid-cols-1 md:grid-cols-4 gap-4",
                      children: [
                        (0, a.jsxs)("div", {
                          children: [
                            (0, a.jsx)("label", {
                              className:
                                "block text-sm font-medium text-gray-700 mb-1",
                              children: "Status",
                            }),
                            (0, a.jsxs)("select", {
                              value: b,
                              onChange: (e) => y(e.target.value),
                              className:
                                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                              children: [
                                (0, a.jsx)("option", {
                                  value: "",
                                  children: "All",
                                }),
                                (0, a.jsx)("option", {
                                  value: "OPEN",
                                  children: "Open",
                                }),
                                (0, a.jsx)("option", {
                                  value: "RESOLVED",
                                  children: "Resolved",
                                }),
                                (0, a.jsx)("option", {
                                  value: "AUTO_RESOLVED",
                                  children: "Auto-Resolved",
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          children: [
                            (0, a.jsx)("label", {
                              className:
                                "block text-sm font-medium text-gray-700 mb-1",
                              children: "Stage",
                            }),
                            (0, a.jsxs)("select", {
                              value: f,
                              onChange: (e) => j(e.target.value),
                              className:
                                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                              children: [
                                (0, a.jsx)("option", {
                                  value: "",
                                  children: "All",
                                }),
                                (0, a.jsx)("option", {
                                  value: "TRANSCRIPTION",
                                  children: "Transcription",
                                }),
                                (0, a.jsx)("option", {
                                  value: "ANALYSIS",
                                  children: "Analysis",
                                }),
                                (0, a.jsx)("option", {
                                  value: "DRAFT",
                                  children: "Draft",
                                }),
                                (0, a.jsx)("option", {
                                  value: "STRIPE",
                                  children: "Stripe",
                                }),
                                (0, a.jsx)("option", {
                                  value: "WEBHOOK",
                                  children: "Webhook",
                                }),
                                (0, a.jsx)("option", {
                                  value: "DB",
                                  children: "Database",
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          children: [
                            (0, a.jsx)("label", {
                              className:
                                "block text-sm font-medium text-gray-700 mb-1",
                              children: "Severity",
                            }),
                            (0, a.jsxs)("select", {
                              value: v,
                              onChange: (e) => N(e.target.value),
                              className:
                                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                              children: [
                                (0, a.jsx)("option", {
                                  value: "",
                                  children: "All",
                                }),
                                (0, a.jsx)("option", {
                                  value: "INFO",
                                  children: "Info",
                                }),
                                (0, a.jsx)("option", {
                                  value: "WARN",
                                  children: "Warning",
                                }),
                                (0, a.jsx)("option", {
                                  value: "ERROR",
                                  children: "Error",
                                }),
                                (0, a.jsx)("option", {
                                  value: "CRITICAL",
                                  children: "Critical",
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          children: [
                            (0, a.jsx)("label", {
                              className:
                                "block text-sm font-medium text-gray-700 mb-1",
                              children: "Ticket ID",
                            }),
                            (0, a.jsx)("input", {
                              type: "text",
                              value: w,
                              onChange: (e) => k(e.target.value),
                              placeholder: "Filter by ticket...",
                              className:
                                "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                (0, a.jsx)("div", {
                  className: "bg-white rounded-lg shadow overflow-hidden",
                  children:
                    u && 0 === t.length
                      ? (0, a.jsxs)("div", {
                          className: "p-8 text-center text-gray-500",
                          children: [
                            (0, a.jsx)("div", {
                              className:
                                "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4",
                            }),
                            "Loading incidents...",
                          ],
                        })
                      : g
                        ? (0, a.jsxs)("div", {
                            className: "p-8 text-center text-red-600",
                            children: ["Error: ", g],
                          })
                        : 0 === t.length
                          ? (0, a.jsx)("div", {
                              className: "p-8 text-center text-gray-500",
                              children:
                                "No incidents found. Try adjusting your filters.",
                            })
                          : (0, a.jsxs)(a.Fragment, {
                              children: [
                                (0, a.jsxs)("table", {
                                  className:
                                    "min-w-full divide-y divide-gray-200",
                                  children: [
                                    (0, a.jsx)("thead", {
                                      className: "bg-gray-50",
                                      children: (0, a.jsxs)("tr", {
                                        children: [
                                          (0, a.jsx)("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Timestamp",
                                          }),
                                          (0, a.jsx)("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Stage",
                                          }),
                                          (0, a.jsx)("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Severity",
                                          }),
                                          (0, a.jsx)("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Ticket",
                                          }),
                                          (0, a.jsx)("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Status",
                                          }),
                                          (0, a.jsx)("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Knowledge",
                                          }),
                                        ],
                                      }),
                                    }),
                                    (0, a.jsx)("tbody", {
                                      className:
                                        "bg-white divide-y divide-gray-200",
                                      children: t.map((e) => {
                                        var t;
                                        return (0, a.jsxs)(
                                          "tr",
                                          {
                                            onClick: () => R(e.id),
                                            className:
                                              "hover:bg-gray-50 cursor-pointer transition-colors",
                                            children: [
                                              (0, a.jsx)("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                                                children: new Date(
                                                  e.createdAt,
                                                ).toLocaleString(),
                                              }),
                                              (0, a.jsx)("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap",
                                                children: (0, a.jsx)("span", {
                                                  className:
                                                    "px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded",
                                                  children: e.stage,
                                                }),
                                              }),
                                              (0, a.jsx)("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap",
                                                children: (0, a.jsx)("span", {
                                                  className:
                                                    "px-2 py-1 text-xs font-medium rounded ".concat(
                                                      i[e.severity] ||
                                                        "bg-gray-100 text-gray-800",
                                                    ),
                                                  children: e.severity,
                                                }),
                                              }),
                                              (0, a.jsx)("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap text-sm",
                                                children: e.ticket
                                                  ? (0, a.jsxs)("div", {
                                                      children: [
                                                        (0, a.jsx)("div", {
                                                          className:
                                                            "font-medium text-gray-900",
                                                          children:
                                                            e.ticket
                                                              .displayName ||
                                                            "Unnamed",
                                                        }),
                                                        (0, a.jsxs)("div", {
                                                          className:
                                                            "text-gray-500 text-xs",
                                                          children: [
                                                            null ===
                                                              (t =
                                                                e.ticketId) ||
                                                            void 0 === t
                                                              ? void 0
                                                              : t.substring(
                                                                  0,
                                                                  8,
                                                                ),
                                                            "...",
                                                          ],
                                                        }),
                                                      ],
                                                    })
                                                  : (0, a.jsx)("span", {
                                                      className:
                                                        "text-gray-400",
                                                      children: "System-wide",
                                                    }),
                                              }),
                                              (0, a.jsx)("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap",
                                                children: (0, a.jsx)("span", {
                                                  className:
                                                    "px-2 py-1 text-xs font-medium rounded ".concat(
                                                      d[e.status] ||
                                                        "bg-gray-100 text-gray-800",
                                                    ),
                                                  children: e.status,
                                                }),
                                              }),
                                              (0, a.jsx)("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
                                                children:
                                                  e.knowledgeBindings.length > 0
                                                    ? (0, a.jsxs)("span", {
                                                        className:
                                                          "text-blue-600",
                                                        children: [
                                                          e.knowledgeBindings
                                                            .length,
                                                          " match",
                                                          1 !==
                                                          e.knowledgeBindings
                                                            .length
                                                            ? "es"
                                                            : "",
                                                        ],
                                                      })
                                                    : (0, a.jsx)("span", {
                                                        className:
                                                          "text-gray-400",
                                                        children: "None",
                                                      }),
                                              }),
                                            ],
                                          },
                                          e.id,
                                        );
                                      }),
                                    }),
                                  ],
                                }),
                                x.totalPages > 1 &&
                                  (0, a.jsxs)("div", {
                                    className:
                                      "px-6 py-4 flex items-center justify-between border-t border-gray-200",
                                    children: [
                                      (0, a.jsxs)("div", {
                                        className: "text-sm text-gray-700",
                                        children: [
                                          "Showing page ",
                                          x.page,
                                          " of ",
                                          x.totalPages,
                                          " (",
                                          x.total,
                                          " total)",
                                        ],
                                      }),
                                      (0, a.jsxs)("div", {
                                        className: "flex gap-2",
                                        children: [
                                          (0, a.jsx)("button", {
                                            onClick: () =>
                                              m({ ...x, page: x.page - 1 }),
                                            disabled: 1 === x.page,
                                            className:
                                              "px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
                                            children: "Previous",
                                          }),
                                          (0, a.jsx)("button", {
                                            onClick: () =>
                                              m({ ...x, page: x.page + 1 }),
                                            disabled: x.page >= x.totalPages,
                                            className:
                                              "px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
                                            children: "Next",
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                              ],
                            }),
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
        r = s(58078),
        n = s(46179);
      function l(e) {
        let { children: t } = e,
          [s, l] = (0, r.useState)(!1),
          [i, d] = (0, r.useState)(!0),
          [o, c] = (0, r.useState)(""),
          [x, m] = (0, r.useState)("");
        ((0, n.useRouter)(),
          (0, r.useEffect)(() => {
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
            (e.preventDefault(), m(""));
            try {
              let e = await fetch("/api/admin/db/connection-info", {
                headers: { Authorization: "Bearer ".concat(o) },
              });
              e.ok
                ? (localStorage.setItem("adminToken", o), l(!0), c(""))
                : m("Invalid admin password");
            } catch (e) {
              m("Authentication failed - server may be unavailable");
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
                          x &&
                            (0, a.jsx)("div", {
                              className:
                                "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded",
                              children: x,
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
        r = Symbol.for("react.element"),
        n = Symbol.for("react.fragment"),
        l = Object.prototype.hasOwnProperty,
        i =
          a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
            .ReactCurrentOwner,
        d = { key: !0, ref: !0, __self: !0, __source: !0 };
      function o(e, t, s) {
        var a,
          n = {},
          o = null,
          c = null;
        for (a in (void 0 !== s && (o = "" + s),
        void 0 !== t.key && (o = "" + t.key),
        void 0 !== t.ref && (c = t.ref),
        t))
          l.call(t, a) && !d.hasOwnProperty(a) && (n[a] = t[a]);
        if (e && e.defaultProps)
          for (a in (t = e.defaultProps)) void 0 === n[a] && (n[a] = t[a]);
        return {
          $$typeof: r,
          type: e,
          key: o,
          ref: c,
          props: n,
          _owner: i.current,
        };
      }
      ((t.Fragment = n), (t.jsx = o), (t.jsxs = o));
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
      return e((e.s = 82732));
    }),
      (_N_E = e.O()));
  },
]);

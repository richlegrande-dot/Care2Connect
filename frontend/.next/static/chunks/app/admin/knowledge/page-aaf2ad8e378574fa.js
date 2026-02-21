(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [466],
  {
    19222: function (e, t, s) {
      Promise.resolve().then(s.bind(s, 13852));
    },
    13852: function (e, t, s) {
      "use strict";
      (s.r(t),
        s.d(t, {
          default: function () {
            return i;
          },
        }));
      var a = s(37821),
        r = s(58078),
        n = s(46179),
        l = s(39052);
      function i() {
        let e = (0, n.useRouter)(),
          [t, s] = (0, r.useState)([]),
          [i, d] = (0, r.useState)(!0),
          [c, o] = (0, r.useState)(""),
          [x, m] = (0, r.useState)(""),
          [u, h] = (0, r.useState)(1),
          [p, g] = (0, r.useState)(1),
          [b, f] = (0, r.useState)(null),
          [y, j] = (0, r.useState)(!1);
        (0, r.useEffect)(() => {
          (v(), w());
        }, [u, x, c]);
        let v = async () => {
            d(!0);
            try {
              let e = localStorage.getItem("adminToken"),
                t = new URLSearchParams({
                  page: u.toString(),
                  limit: "20",
                  ...(x && { type: x }),
                  ...(c && { search: c }),
                }),
                a = await fetch("/api/admin/knowledge/sources?".concat(t), {
                  headers: { Authorization: "Bearer ".concat(e) },
                });
              if (a.ok) {
                let e = await a.json();
                (s(e.sources), g(e.pagination.pages));
              }
            } catch (e) {
              console.error("Error fetching sources:", e);
            } finally {
              d(!1);
            }
          },
          w = async () => {
            try {
              let e = localStorage.getItem("adminToken"),
                t = await fetch("/api/admin/knowledge/database/overview", {
                  headers: { Authorization: "Bearer ".concat(e) },
                });
              if (t.ok) {
                let e = await t.json();
                f(e);
              }
            } catch (e) {
              console.error("Error fetching DB overview:", e);
            }
          },
          N = async (e, t) => {
            if (
              confirm(
                'Delete "'.concat(
                  t,
                  '"? This will soft-delete the source and keep it in the database.',
                ),
              )
            )
              try {
                let t = localStorage.getItem("adminToken"),
                  s = await fetch("/api/admin/knowledge/sources/".concat(e), {
                    method: "DELETE",
                    headers: {
                      Authorization: "Bearer ".concat(t),
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      reason: "Deleted from Knowledge Vault admin interface",
                    }),
                  });
                s.ok ? v() : alert("Failed to delete source");
              } catch (e) {
                alert("Error deleting source");
              }
          };
        return (0, a.jsxs)(l.t, {
          children: [
            (0, a.jsxs)("div", {
              className: "min-h-screen bg-gray-50",
              children: [
                (0, a.jsx)("div", {
                  className: "bg-white border-b border-gray-200",
                  children: (0, a.jsx)("div", {
                    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6",
                    children: (0, a.jsxs)("div", {
                      className: "flex justify-between items-center",
                      children: [
                        (0, a.jsxs)("div", {
                          children: [
                            (0, a.jsx)("h1", {
                              className: "text-3xl font-bold text-gray-900",
                              children: "Knowledge Vault Admin",
                            }),
                            (0, a.jsx)("p", {
                              className: "mt-1 text-sm text-gray-500",
                              children:
                                "Manage knowledge sources and chunks with full audit logging",
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          className: "flex space-x-3",
                          children: [
                            (0, a.jsx)("button", {
                              onClick: () =>
                                e.push("/admin/knowledge/incidents"),
                              className:
                                "px-4 py-2 border border-purple-300 bg-purple-50 rounded-md text-sm font-medium text-purple-700 hover:bg-purple-100",
                              children: "\uD83D\uDD0D Incidents",
                            }),
                            (0, a.jsx)("button", {
                              onClick: () => e.push("/admin/knowledge/audit"),
                              className:
                                "px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50",
                              children: "View Audit Logs",
                            }),
                            (0, a.jsx)("button", {
                              onClick: () => j(!0),
                              className:
                                "px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700",
                              children: "New Source",
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                }),
                (0, a.jsxs)("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
                  children: [
                    b &&
                      (0, a.jsxs)("div", {
                        className: "bg-white rounded-lg shadow mb-6 p-6",
                        children: [
                          (0, a.jsx)("h2", {
                            className:
                              "text-lg font-semibold text-gray-900 mb-4",
                            children: "Database Overview",
                          }),
                          (0, a.jsx)("div", {
                            className:
                              "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4",
                            children: b.tables.map((e) =>
                              (0, a.jsxs)(
                                "div",
                                {
                                  className: "text-center",
                                  children: [
                                    (0, a.jsx)("div", {
                                      className:
                                        "text-2xl font-bold text-blue-600",
                                      children: e.count,
                                    }),
                                    (0, a.jsx)("div", {
                                      className: "text-xs text-gray-500",
                                      children: e.name,
                                    }),
                                    void 0 !== e.deleted &&
                                      (0, a.jsxs)("div", {
                                        className: "text-xs text-red-500",
                                        children: ["(", e.deleted, " deleted)"],
                                      }),
                                  ],
                                },
                                e.name,
                              ),
                            ),
                          }),
                        ],
                      }),
                    (0, a.jsx)("div", {
                      className: "bg-white rounded-lg shadow mb-6 p-4",
                      children: (0, a.jsxs)("div", {
                        className: "flex flex-col sm:flex-row gap-4",
                        children: [
                          (0, a.jsx)("input", {
                            type: "text",
                            placeholder: "Search by title or URL...",
                            value: c,
                            onChange: (e) => o(e.target.value),
                            className:
                              "flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          }),
                          (0, a.jsxs)("select", {
                            value: x,
                            onChange: (e) => m(e.target.value),
                            className:
                              "px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500",
                            children: [
                              (0, a.jsx)("option", {
                                value: "",
                                children: "All Types",
                              }),
                              (0, a.jsx)("option", {
                                value: "DOCUMENTATION",
                                children: "Documentation",
                              }),
                              (0, a.jsx)("option", {
                                value: "WEBSITE",
                                children: "Website",
                              }),
                              (0, a.jsx)("option", {
                                value: "API",
                                children: "API",
                              }),
                              (0, a.jsx)("option", {
                                value: "OTHER",
                                children: "Other",
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    (0, a.jsx)("div", {
                      className: "bg-white rounded-lg shadow overflow-hidden",
                      children: i
                        ? (0, a.jsxs)("div", {
                            className: "text-center py-12",
                            children: [
                              (0, a.jsx)("div", {
                                className:
                                  "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto",
                              }),
                              (0, a.jsx)("p", {
                                className: "mt-4 text-gray-600",
                                children: "Loading sources...",
                              }),
                            ],
                          })
                        : 0 === t.length
                          ? (0, a.jsxs)("div", {
                              className: "text-center py-12",
                              children: [
                                (0, a.jsx)("p", {
                                  className: "text-gray-500",
                                  children: "No knowledge sources found",
                                }),
                                (0, a.jsx)("button", {
                                  onClick: () => j(!0),
                                  className:
                                    "mt-4 text-blue-600 hover:text-blue-700 underline",
                                  children: "Create your first source",
                                }),
                              ],
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
                                            children: "Title",
                                          }),
                                          (0, a.jsx)("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Type",
                                          }),
                                          (0, a.jsx)("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Chunks",
                                          }),
                                          (0, a.jsx)("th", {
                                            className:
                                              "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Updated",
                                          }),
                                          (0, a.jsx)("th", {
                                            className:
                                              "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider",
                                            children: "Actions",
                                          }),
                                        ],
                                      }),
                                    }),
                                    (0, a.jsx)("tbody", {
                                      className:
                                        "bg-white divide-y divide-gray-200",
                                      children: t.map((t) =>
                                        (0, a.jsxs)(
                                          "tr",
                                          {
                                            className: t.isDeleted
                                              ? "opacity-50 bg-red-50"
                                              : "hover:bg-gray-50",
                                            children: [
                                              (0, a.jsxs)("td", {
                                                className: "px-6 py-4",
                                                children: [
                                                  (0, a.jsxs)("div", {
                                                    className:
                                                      "text-sm font-medium text-gray-900",
                                                    children: [
                                                      t.title,
                                                      t.isDeleted &&
                                                        (0, a.jsx)("span", {
                                                          className:
                                                            "ml-2 text-xs text-red-600",
                                                          children: "(Deleted)",
                                                        }),
                                                    ],
                                                  }),
                                                  t.url &&
                                                    (0, a.jsx)("div", {
                                                      className:
                                                        "text-sm text-gray-500 truncate max-w-md",
                                                      children: t.url,
                                                    }),
                                                ],
                                              }),
                                              (0, a.jsx)("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap",
                                                children: (0, a.jsx)("span", {
                                                  className:
                                                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800",
                                                  children: t.sourceType,
                                                }),
                                              }),
                                              (0, a.jsx)("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
                                                children: t._count.chunks,
                                              }),
                                              (0, a.jsx)("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap text-sm text-gray-500",
                                                children: new Date(
                                                  t.updatedAt,
                                                ).toLocaleDateString(),
                                              }),
                                              (0, a.jsxs)("td", {
                                                className:
                                                  "px-6 py-4 whitespace-nowrap text-right text-sm font-medium",
                                                children: [
                                                  (0, a.jsx)("button", {
                                                    onClick: () =>
                                                      e.push(
                                                        "/admin/knowledge/".concat(
                                                          t.id,
                                                        ),
                                                      ),
                                                    className:
                                                      "text-blue-600 hover:text-blue-900 mr-4",
                                                    children: "Edit",
                                                  }),
                                                  !t.isDeleted &&
                                                    (0, a.jsx)("button", {
                                                      onClick: () =>
                                                        N(t.id, t.title),
                                                      className:
                                                        "text-red-600 hover:text-red-900",
                                                      children: "Delete",
                                                    }),
                                                ],
                                              }),
                                            ],
                                          },
                                          t.id,
                                        ),
                                      ),
                                    }),
                                  ],
                                }),
                                p > 1 &&
                                  (0, a.jsxs)("div", {
                                    className:
                                      "bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200",
                                    children: [
                                      (0, a.jsx)("button", {
                                        onClick: () => h(Math.max(1, u - 1)),
                                        disabled: 1 === u,
                                        className:
                                          "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50",
                                        children: "Previous",
                                      }),
                                      (0, a.jsxs)("span", {
                                        className: "text-sm text-gray-700",
                                        children: ["Page ", u, " of ", p],
                                      }),
                                      (0, a.jsx)("button", {
                                        onClick: () => h(Math.min(p, u + 1)),
                                        disabled: u === p,
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
            y &&
              (0, a.jsx)("div", {
                className:
                  "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",
                children: (0, a.jsxs)("div", {
                  className: "bg-white rounded-lg max-w-md w-full p-6",
                  children: [
                    (0, a.jsx)("h3", {
                      className: "text-lg font-semibold mb-4",
                      children: "Create New Source",
                    }),
                    (0, a.jsx)("p", {
                      className: "text-gray-600 mb-4",
                      children:
                        "Feature coming soon: Full source creation form with title, type, URL, and license fields.",
                    }),
                    (0, a.jsx)("button", {
                      onClick: () => j(!1),
                      className:
                        "w-full px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300",
                      children: "Close",
                    }),
                  ],
                }),
              }),
          ],
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
          [c, o] = (0, r.useState)(""),
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
                headers: { Authorization: "Bearer ".concat(c) },
              });
              e.ok
                ? (localStorage.setItem("adminToken", c), l(!0), o(""))
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
                          (localStorage.removeItem("adminToken"), l(!1), o(""));
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
                                value: c,
                                onChange: (e) => o(e.target.value),
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
      function c(e, t, s) {
        var a,
          n = {},
          c = null,
          o = null;
        for (a in (void 0 !== s && (c = "" + s),
        void 0 !== t.key && (c = "" + t.key),
        void 0 !== t.ref && (o = t.ref),
        t))
          l.call(t, a) && !d.hasOwnProperty(a) && (n[a] = t[a]);
        if (e && e.defaultProps)
          for (a in (t = e.defaultProps)) void 0 === n[a] && (n[a] = t[a]);
        return {
          $$typeof: r,
          type: e,
          key: c,
          ref: o,
          props: n,
          _owner: i.current,
        };
      }
      ((t.Fragment = n), (t.jsx = c), (t.jsxs = c));
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
      return e((e.s = 19222));
    }),
      (_N_E = e.O()));
  },
]);

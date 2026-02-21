(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [635],
  {
    47922: function (e, s, t) {
      Promise.resolve().then(t.bind(t, 5256));
    },
    5256: function (e, s, t) {
      "use strict";
      (t.r(s),
        t.d(s, {
          default: function () {
            return A;
          },
        }));
      var a = t(37821),
        l = t(58078),
        i = t(46179),
        n = t(5032);
      function r(e) {
        let { onAuthenticated: s, onCancel: t } = e,
          [i, r] = (0, l.useState)(""),
          [d, c] = (0, l.useState)(""),
          [o, x] = (0, l.useState)(0),
          [m, u] = (0, l.useState)(!1),
          [h, g] = (0, l.useState)(!1),
          p = async (e) => {
            if ((e.preventDefault(), m)) {
              c("Too many failed attempts. Please wait 5 minutes.");
              return;
            }
            if (!i) {
              c("Password required");
              return;
            }
            (g(!0), c(""));
            try {
              let e = "https://api.care2connects.org".replace(/\/api$/, ""),
                t = await fetch("".concat(e, "/admin/auth"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ password: i }),
                });
              if (!t.ok) {
                if (503 === t.status)
                  c("API unavailable. Server may be starting up.");
                else if (404 === t.status)
                  c("API endpoint not found. Check server configuration.");
                else {
                  let e = o + 1;
                  (x(e),
                    e >= 5
                      ? (u(!0),
                        c("Too many failed attempts. Locked for 5 minutes."),
                        setTimeout(() => {
                          (u(!1), x(0));
                        }, 3e5))
                      : c("Invalid password (".concat(e, "/5 attempts)")));
                }
                return;
              }
              let a = await t.json();
              if (a.ok && a.token)
                (sessionStorage.setItem("system-admin-token", a.token),
                  sessionStorage.setItem(
                    "system-admin-expires",
                    String(Date.now() + 1e3 * a.expiresIn),
                  ),
                  s(a.token));
              else {
                let e = o + 1;
                (x(e),
                  e >= 5
                    ? (u(!0),
                      c("Too many failed attempts. Locked for 5 minutes."),
                      setTimeout(() => {
                        (u(!1), x(0));
                      }, 3e5))
                    : c("Invalid password (".concat(e, "/5 attempts)")));
              }
            } catch (e) {
              (console.error("Auth error:", e),
                c(
                  "Connection failed: ".concat(
                    e instanceof Error ? e.message : "Network error",
                    ". Check server connection.",
                  ),
                ));
            } finally {
              g(!1);
            }
          };
        return (0, a.jsx)("div", {
          className:
            "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50",
          children: (0, a.jsxs)("div", {
            className:
              "bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4",
            children: [
              (0, a.jsxs)("div", {
                className: "flex justify-between items-center mb-6",
                children: [
                  (0, a.jsx)("h2", {
                    className: "text-2xl font-bold text-gray-900",
                    children: "System Access",
                  }),
                  (0, a.jsx)("button", {
                    onClick: t,
                    className: "text-gray-400 hover:text-gray-600 transition",
                    "aria-label": "Close",
                    children: (0, a.jsx)(n.Z, { size: 24 }),
                  }),
                ],
              }),
              (0, a.jsx)("p", {
                className: "text-gray-600 mb-6",
                children:
                  "This area is password-protected. Enter the system password to continue.",
              }),
              (0, a.jsxs)("form", {
                onSubmit: p,
                children: [
                  (0, a.jsxs)("div", {
                    className: "mb-4",
                    children: [
                      (0, a.jsx)("label", {
                        htmlFor: "password",
                        className:
                          "block text-sm font-medium text-gray-700 mb-2",
                        children: "Password",
                      }),
                      (0, a.jsx)("input", {
                        type: "password",
                        id: "password",
                        value: i,
                        onChange: (e) => r(e.target.value),
                        disabled: m || h,
                        className:
                          "w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed",
                        placeholder: "Enter password",
                        autoFocus: !0,
                      }),
                    ],
                  }),
                  d &&
                    (0, a.jsx)("div", {
                      className:
                        "mb-4 p-3 bg-red-50 border border-red-200 rounded-md",
                      children: (0, a.jsx)("p", {
                        className: "text-sm text-red-700",
                        children: d,
                      }),
                    }),
                  (0, a.jsxs)("div", {
                    className: "flex gap-3",
                    children: [
                      (0, a.jsx)("button", {
                        type: "submit",
                        disabled: m || h,
                        className:
                          "flex-1 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition",
                        children: h ? "Authenticating..." : "Access System",
                      }),
                      (0, a.jsx)("button", {
                        type: "button",
                        onClick: t,
                        disabled: h,
                        className:
                          "px-6 py-3 border border-gray-300 rounded-md font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition",
                        children: "Cancel",
                      }),
                    ],
                  }),
                ],
              }),
              (0, a.jsx)("p", {
                className: "mt-4 text-xs text-gray-500 text-center",
                children: "Session expires after 30 minutes of inactivity",
              }),
            ],
          }),
        });
      }
      var d = t(23023),
        c = t(35684),
        o = t(80897),
        x = t(72864),
        m = t(59654),
        u = t(72877),
        h = t(91847),
        g = t(7527);
      function p(e) {
        let { token: s } = e,
          [t, i] = (0, l.useState)([]),
          [n, r] = (0, l.useState)(!0),
          p = async () => {
            try {
              let e = await fetch(
                "".concat(
                  "https://api.care2connects.org",
                  "/health/history?limit=50",
                ),
                { headers: { Authorization: "Bearer ".concat(s) } },
              );
              if (e.ok) {
                let s = await e.json();
                i(s.history || []);
              }
            } catch (e) {
              console.error("Failed to fetch health history:", e);
            } finally {
              r(!1);
            }
          };
        if (
          ((0, l.useEffect)(() => {
            p();
            let e = setInterval(p, 3e4);
            return () => clearInterval(e);
          }, [s]),
          n)
        )
          return (0, a.jsx)("div", {
            className:
              "bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center",
            children: (0, a.jsx)("div", {
              className: "text-gray-500",
              children: "Loading health data...",
            }),
          });
        if (0 === t.length)
          return (0, a.jsx)("div", {
            className:
              "bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center",
            children: (0, a.jsx)("div", {
              className: "text-gray-500",
              children: "No health data available",
            }),
          });
        let j = t
          .slice()
          .reverse()
          .map((e, s) => {
            var t, a, l, i;
            return {
              index: s,
              time: new Date(e.timestamp).toLocaleTimeString(),
              ready: "ready" === e.status ? 1 : 0,
              degraded: "degraded" === e.status ? 1 : 0,
              dbOk: (
                null === (a = e.services) || void 0 === a
                  ? void 0
                  : null === (t = a.db) || void 0 === t
                    ? void 0
                    : t.ok
              )
                ? 1
                : 0,
              storageOk: (
                null === (i = e.services) || void 0 === i
                  ? void 0
                  : null === (l = i.storage) || void 0 === l
                    ? void 0
                    : l.ok
              )
                ? 1
                : 0,
            };
          });
        return (0, a.jsxs)("div", {
          className: "bg-white rounded-lg shadow p-6",
          children: [
            (0, a.jsx)("h3", {
              className: "text-lg font-semibold text-gray-900 mb-4",
              children: "Health Status Timeline",
            }),
            (0, a.jsx)(d.h, {
              width: "100%",
              height: 300,
              children: (0, a.jsxs)(c.w, {
                data: j,
                children: [
                  (0, a.jsx)(o.q, {
                    strokeDasharray: "3 3",
                    stroke: "#e5e7eb",
                  }),
                  (0, a.jsx)(x.K, {
                    dataKey: "time",
                    stroke: "#6b7280",
                    tick: { fontSize: 12 },
                    interval: "preserveStartEnd",
                  }),
                  (0, a.jsx)(m.B, {
                    stroke: "#6b7280",
                    tick: { fontSize: 12 },
                    domain: [0, 1],
                    ticks: [0, 1],
                    tickFormatter: (e) => (1 === e ? "OK" : "DOWN"),
                  }),
                  (0, a.jsx)(u.u, {
                    contentStyle: {
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    },
                    formatter: (e) => (1 === e ? "OK" : "DOWN"),
                  }),
                  (0, a.jsx)(h.D, {}),
                  (0, a.jsx)(g.x1, {
                    type: "stepAfter",
                    dataKey: "ready",
                    stroke: "#10b981",
                    strokeWidth: 2,
                    name: "Ready",
                    dot: !1,
                  }),
                  (0, a.jsx)(g.x1, {
                    type: "stepAfter",
                    dataKey: "degraded",
                    stroke: "#f59e0b",
                    strokeWidth: 2,
                    name: "Degraded",
                    dot: !1,
                  }),
                  (0, a.jsx)(g.x1, {
                    type: "stepAfter",
                    dataKey: "dbOk",
                    stroke: "#3b82f6",
                    strokeWidth: 1,
                    name: "Database",
                    dot: !1,
                  }),
                  (0, a.jsx)(g.x1, {
                    type: "stepAfter",
                    dataKey: "storageOk",
                    stroke: "#8b5cf6",
                    strokeWidth: 1,
                    name: "Storage",
                    dot: !1,
                  }),
                ],
              }),
            }),
            (0, a.jsxs)("div", {
              className: "mt-4 grid grid-cols-4 gap-4 text-sm",
              children: [
                (0, a.jsxs)("div", {
                  className: "text-center",
                  children: [
                    (0, a.jsx)("div", {
                      className: "text-2xl font-bold text-green-600",
                      children: j.filter((e) => 1 === e.ready).length,
                    }),
                    (0, a.jsx)("div", {
                      className: "text-gray-600",
                      children: "Ready",
                    }),
                  ],
                }),
                (0, a.jsxs)("div", {
                  className: "text-center",
                  children: [
                    (0, a.jsx)("div", {
                      className: "text-2xl font-bold text-yellow-600",
                      children: j.filter((e) => 1 === e.degraded).length,
                    }),
                    (0, a.jsx)("div", {
                      className: "text-gray-600",
                      children: "Degraded",
                    }),
                  ],
                }),
                (0, a.jsxs)("div", {
                  className: "text-center",
                  children: [
                    (0, a.jsx)("div", {
                      className: "text-2xl font-bold text-blue-600",
                      children: j.filter((e) => 1 === e.dbOk).length,
                    }),
                    (0, a.jsx)("div", {
                      className: "text-gray-600",
                      children: "DB OK",
                    }),
                  ],
                }),
                (0, a.jsxs)("div", {
                  className: "text-center",
                  children: [
                    (0, a.jsx)("div", {
                      className: "text-2xl font-bold text-purple-600",
                      children: j.filter((e) => 1 === e.storageOk).length,
                    }),
                    (0, a.jsx)("div", {
                      className: "text-gray-600",
                      children: "Storage OK",
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
      var j = t(94179);
      let v = "careconnect.publicTunnelUrl";
      function b(e) {
        let { token: s } = e,
          [t, i] = (0, l.useState)(null),
          [n, r] = (0, l.useState)(!0),
          [d, c] = (0, l.useState)(null),
          [o, x] = (0, l.useState)(""),
          [m, u] = (0, l.useState)(!1),
          [h, g] = (0, l.useState)(null);
        ((0, l.useEffect)(() => {
          let e = localStorage.getItem(v);
          e && x(e);
        }, []),
          (0, l.useEffect)(() => {
            (u(
              (function (e) {
                if (!e || !e.startsWith("https://")) return !1;
                try {
                  return (new URL(e), !0);
                } catch (e) {
                  return !1;
                }
              })(o),
            ),
              o ? localStorage.setItem(v, o) : localStorage.removeItem(v));
          }, [o]),
          (0, l.useEffect)(() => {
            let e = async () => {
              (r(!0), c(null));
              try {
                let e = {};
                s && (e.Authorization = "Bearer ".concat(s));
                let t = await fetch(
                  "".concat(
                    "https://api.care2connects.org",
                    "/admin/setup/tunnel/cloudflare",
                  ),
                  { headers: e },
                );
                if (!t.ok) throw Error("Failed to load tunnel guidance");
                i(await t.json());
              } catch (e) {
                c(String(e.message || e));
              } finally {
                r(!1);
              }
            };
            e();
          }, [s]));
        let p = async (e) => {
            try {
              await navigator.clipboard.writeText(e);
            } catch (e) {
              console.error("Copy failed", e);
            }
          },
          b = async () => {
            if (!s) return g({ allowed: !1, reason: "Not authenticated" });
            g({ status: "pending" });
            try {
              let e = await fetch(
                  "".concat(
                    "https://api.care2connects.org",
                    "/admin/setup/tunnel/cloudflare/preflight",
                  ),
                  {
                    method: "POST",
                    headers: { Authorization: "Bearer ".concat(s) },
                  },
                ),
                t = await e.json();
              g(t);
            } catch (e) {
              g({ allowed: !1, reason: String(e) });
            }
          },
          y = "/api/payments/stripe-webhook";
        return (0, a.jsxs)("div", {
          className: "bg-white rounded-lg shadow p-6",
          children: [
            (0, a.jsx)("div", {
              className: "flex items-center justify-between mb-4",
              children: (0, a.jsxs)("div", {
                className: "flex items-center gap-3",
                children: [
                  (0, a.jsx)(j.Z, { className: "text-blue-600" }),
                  (0, a.jsx)("h3", {
                    className: "text-lg font-semibold",
                    children: "Public Webhook URL (Cloudflare Tunnel)",
                  }),
                ],
              }),
            }),
            n
              ? (0, a.jsx)("div", {
                  className: "text-sm text-gray-600",
                  children: "Loading tunnel guidance...",
                })
              : d
                ? (0, a.jsx)("div", {
                    className: "text-sm text-red-600",
                    children: d,
                  })
                : t &&
                  (0, a.jsxs)("div", {
                    className: "space-y-3",
                    children: [
                      (0, a.jsxs)("div", {
                        className: "text-sm text-gray-700",
                        children: [
                          "Backend port: ",
                          (0, a.jsx)("span", {
                            className: "font-medium",
                            children: t.backendPort,
                          }),
                        ],
                      }),
                      (0, a.jsxs)("div", {
                        className: "text-sm text-gray-700",
                        children: [
                          "Local target: ",
                          (0, a.jsx)("span", {
                            className: "font-medium",
                            children: t.localTarget,
                          }),
                        ],
                      }),
                      (0, a.jsxs)("div", {
                        className: "text-sm text-gray-700",
                        children: [
                          "Webhook path: ",
                          (0, a.jsx)("span", {
                            className: "font-medium",
                            children: y,
                          }),
                        ],
                      }),
                      (0, a.jsxs)("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-2",
                        children: [
                          (0, a.jsx)("div", {
                            className: "flex items-center gap-2",
                            children: (0, a.jsx)("button", {
                              onClick: () => p(t.installUrl),
                              className:
                                "px-3 py-1 bg-gray-100 rounded text-sm",
                              children: "Copy cloudflared install URL",
                            }),
                          }),
                          (0, a.jsx)("div", {
                            className: "flex items-center gap-2",
                            children: (0, a.jsx)("button", {
                              onClick: () => p(t.quickTunnelCommand),
                              className:
                                "px-3 py-1 bg-gray-100 rounded text-sm",
                              children: "Copy quick tunnel command",
                            }),
                          }),
                        ],
                      }),
                      (0, a.jsxs)("div", {
                        className: "pt-2",
                        children: [
                          (0, a.jsx)("label", {
                            className: "text-sm text-gray-700",
                            children: "Public tunnel URL",
                          }),
                          (0, a.jsxs)("div", {
                            className: "flex gap-2 mt-1",
                            children: [
                              (0, a.jsx)("input", {
                                "aria-label": "public-tunnel-url",
                                value: o,
                                onChange: (e) => x(e.target.value),
                                placeholder: "https://xxxx.trycloudflare.com",
                                className: "flex-1 border rounded px-3 py-2",
                              }),
                              (0, a.jsx)("button", {
                                onClick: () => {
                                  (x(""), localStorage.removeItem(v));
                                },
                                className: "px-3 py-2 bg-gray-100 rounded",
                                children: "Clear",
                              }),
                            ],
                          }),
                          !m &&
                            o &&
                            (0, a.jsx)("div", {
                              className: "text-xs text-red-600 mt-1",
                              children:
                                "Invalid public tunnel URL — must start with https:// and be a valid URL",
                            }),
                        ],
                      }),
                      (0, a.jsxs)("div", {
                        children: [
                          (0, a.jsx)("label", {
                            className: "text-sm text-gray-700",
                            children: "Computed Stripe webhook endpoint",
                          }),
                          (0, a.jsxs)("div", {
                            className: "mt-1 flex items-center gap-2",
                            children: [
                              (0, a.jsx)("div", {
                                className:
                                  "flex-1 bg-gray-50 border rounded px-3 py-2 text-sm break-words",
                                children: m
                                  ? "".concat(o.replace(/\/$/, "")).concat(y)
                                  : "Paste a valid public tunnel URL to compute the Stripe endpoint.",
                              }),
                              (0, a.jsx)("button", {
                                onClick: () =>
                                  m &&
                                  p("".concat(o.replace(/\/$/, "")).concat(y)),
                                className: "px-3 py-2 bg-gray-100 rounded",
                                children: "Copy",
                              }),
                            ],
                          }),
                          (0, a.jsx)("div", {
                            className: "text-xs text-gray-500 mt-2",
                            children:
                              "Paste this into Stripe Dashboard / Workbench as your webhook endpoint.",
                          }),
                        ],
                      }),
                      (0, a.jsxs)("div", {
                        className: "pt-2",
                        children: [
                          (0, a.jsx)("div", {
                            className: "text-sm text-gray-700",
                            children: "Stripe CLI fallback command",
                          }),
                          (0, a.jsxs)("div", {
                            className: "mt-1 flex items-center gap-2",
                            children: [
                              (0, a.jsx)("div", {
                                className:
                                  "flex-1 bg-gray-50 border rounded px-3 py-2 text-sm",
                                children: "stripe listen --forward-to "
                                  .concat(t.localTarget)
                                  .concat(y),
                              }),
                              (0, a.jsx)("button", {
                                onClick: () =>
                                  p(
                                    "stripe listen --forward-to "
                                      .concat(t.localTarget)
                                      .concat(y),
                                  ),
                                className: "px-3 py-2 bg-gray-100 rounded",
                                children: "Copy",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, a.jsxs)("div", {
                        className: "pt-4 border-t pt-4",
                        children: [
                          (0, a.jsxs)("div", {
                            className: "flex items-center justify-between",
                            children: [
                              (0, a.jsx)("div", {
                                className: "text-sm text-gray-700",
                                children: "Quick check",
                              }),
                              (0, a.jsx)("button", {
                                onClick: b,
                                className:
                                  "px-3 py-1 bg-blue-600 text-white rounded text-sm",
                                children: "Check cloudflared installation",
                              }),
                            ],
                          }),
                          h &&
                            (0, a.jsxs)("div", {
                              className: "mt-2 text-sm",
                              children: [
                                !1 === h.allowed &&
                                  (0, a.jsx)("div", {
                                    className: "text-gray-600",
                                    children:
                                      "ALLOW_SYSTEM_COMMANDS is disabled. Install manually using the link above.",
                                  }),
                                !0 === h.cloudflaredInstalled &&
                                  (0, a.jsxs)("div", {
                                    className: "text-green-600",
                                    children: [
                                      "cloudflared installed: ",
                                      h.version,
                                    ],
                                  }),
                                !1 === h.cloudflaredInstalled &&
                                  (0, a.jsxs)("div", {
                                    className: "text-red-600",
                                    children: [
                                      "cloudflared not found: ",
                                      h.reason || "unknown",
                                    ],
                                  }),
                                "pending" === h.status &&
                                  (0, a.jsx)("div", {
                                    className: "text-gray-600",
                                    children: "Checking...",
                                  }),
                              ],
                            }),
                        ],
                      }),
                    ],
                  }),
          ],
        });
      }
      var y = t(60608),
        N = t(12953),
        f = t(1749),
        w = t(6026),
        k = t(39300),
        S = t(18347),
        C = t(57775),
        z = t(92789);
      function T(e) {
        let { token: s } = e,
          [t, i] = (0, l.useState)(null),
          [n, r] = (0, l.useState)(null),
          [d, c] = (0, l.useState)(!1),
          [o, x] = (0, l.useState)(!1),
          [m, u] = (0, l.useState)(!1),
          [h, g] = (0, l.useState)(null);
        (0, l.useEffect)(() => {
          s && p();
        }, [s]);
        let p = async () => {
            if (s) {
              c(!0);
              try {
                let e = await fetch(
                  "".concat(
                    "https://api.care2connects.org",
                    "/admin/setup/connectivity/status",
                  ),
                  { headers: { Authorization: "Bearer ".concat(s) } },
                );
                e.ok
                  ? i(await e.json())
                  : console.error(
                      "Failed to load connectivity status:",
                      e.statusText,
                    );
              } catch (e) {
                console.error("Error loading connectivity status:", e);
              } finally {
                c(!1);
              }
            }
          },
          j = async () => {
            if (s) {
              x(!0);
              try {
                let e = await fetch(
                  "".concat(
                    "https://api.care2connects.org",
                    "/admin/setup/connectivity/test",
                  ),
                  {
                    method: "POST",
                    headers: {
                      Authorization: "Bearer ".concat(s),
                      "Content-Type": "application/json",
                    },
                  },
                );
                e.ok
                  ? (r(await e.json()), await p())
                  : console.error(
                      "Failed to run connectivity test:",
                      e.statusText,
                    );
              } catch (e) {
                console.error("Error running connectivity test:", e);
              } finally {
                x(!1);
              }
            }
          },
          v = async (e, s) => {
            try {
              (await navigator.clipboard.writeText(e),
                g(s),
                setTimeout(() => g(null), 2e3));
            } catch (e) {
              console.error("Failed to copy to clipboard:", e);
            }
          },
          b = (() => {
            if (!(null == t ? void 0 : t.dnsChecks))
              return { success: !1, message: "No DNS data" };
            let e = t.dnsChecks.find(
                (e) =>
                  !e.resolver.includes("8.8.8.8") &&
                  !e.resolver.includes("1.1.1.1"),
              ),
              s = t.dnsChecks.find((e) => e.resolver.includes("8.8.8.8")),
              a = t.dnsChecks.find((e) => e.resolver.includes("1.1.1.1"));
            return (null == e ? void 0 : e.success)
              ? { success: !0, message: "Local DNS resolved" }
              : (null == s ? void 0 : s.success) ||
                  (null == a ? void 0 : a.success)
                ? {
                    success: !0,
                    message: "Global DNS working (local cache pending)",
                  }
                : { success: !1, message: "DNS resolution failed" };
          })(),
          T = (() => {
            let e = [];
            return (
              (null == t ? void 0 : t.publicUrl) &&
                e.push({
                  label: "Production Webhook URL",
                  url: "".concat(t.publicUrl, "/api/payments/stripe-webhook"),
                  type: "production",
                }),
              (null == t ? void 0 : t.tunnelStatus.lastKnownUrl) &&
                e.push({
                  label: "Temporary Tunnel URL",
                  url: "".concat(
                    t.tunnelStatus.lastKnownUrl,
                    "/api/payments/stripe-webhook",
                  ),
                  type: "temporary",
                }),
              e
            );
          })();
        return (0, a.jsxs)("div", {
          className: "bg-white rounded-lg shadow",
          children: [
            (0, a.jsx)("div", {
              className:
                "p-6 cursor-pointer hover:bg-gray-50 transition-colors",
              onClick: () => u(!m),
              children: (0, a.jsxs)("div", {
                className: "flex items-center justify-between",
                children: [
                  (0, a.jsxs)("div", {
                    className: "flex items-center gap-3",
                    children: [
                      (0, a.jsx)("div", {
                        className: "p-2 rounded-full ".concat(
                          b.success &&
                            (null == t ? void 0 : t.tlsStatus.success) !== !1
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-600",
                        ),
                        children: (0, a.jsx)(y.Z, { size: 24 }),
                      }),
                      (0, a.jsxs)("div", {
                        children: [
                          (0, a.jsx)("h3", {
                            className: "text-lg font-semibold text-gray-900",
                            children: "Connectivity",
                          }),
                          (0, a.jsx)("p", {
                            className: "text-sm text-gray-500",
                            children: b.message,
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, a.jsxs)("div", {
                    className: "flex items-center gap-2",
                    children: [
                      (0, a.jsxs)("button", {
                        onClick: (e) => {
                          (e.stopPropagation(), j());
                        },
                        disabled: o || d,
                        className:
                          "text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1",
                        children: [
                          o
                            ? (0, a.jsx)(N.Z, {
                                className: "animate-spin",
                                size: 14,
                              })
                            : (0, a.jsx)(f.Z, { size: 14 }),
                          o ? "Testing..." : "Test",
                        ],
                      }),
                      (0, a.jsx)("span", {
                        className: "text-gray-400 text-sm",
                        children: m ? "▼" : "▶",
                      }),
                    ],
                  }),
                ],
              }),
            }),
            m &&
              (0, a.jsx)("div", {
                className: "px-6 pb-6 border-t border-gray-100",
                children: (0, a.jsxs)("div", {
                  className: "space-y-6",
                  children: [
                    (0, a.jsxs)("div", {
                      className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                      children: [
                        (0, a.jsxs)("div", {
                          children: [
                            (0, a.jsx)("h4", {
                              className: "font-medium text-gray-900 mb-2",
                              children: "Domain Configuration",
                            }),
                            (0, a.jsxs)("div", {
                              className: "space-y-1 text-sm",
                              children: [
                                (0, a.jsxs)("div", {
                                  children: [
                                    "Domain: ",
                                    (0, a.jsx)("span", {
                                      className: "font-mono",
                                      children:
                                        (null == t ? void 0 : t.domain) ||
                                        "Not configured",
                                    }),
                                  ],
                                }),
                                (0, a.jsxs)("div", {
                                  children: [
                                    "Backend Port: ",
                                    (0, a.jsx)("span", {
                                      className: "font-mono",
                                      children:
                                        null == t ? void 0 : t.backendPort,
                                    }),
                                  ],
                                }),
                                (0, a.jsxs)("div", {
                                  children: [
                                    "Public URL: ",
                                    (0, a.jsx)("span", {
                                      className: "font-mono",
                                      children:
                                        (null == t ? void 0 : t.publicUrl) ||
                                        "Not set",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          children: [
                            (0, a.jsx)("h4", {
                              className: "font-medium text-gray-900 mb-2",
                              children: "SSL/TLS Status",
                            }),
                            (0, a.jsx)("div", {
                              className: "flex items-center gap-2",
                              children: (
                                null == t ? void 0 : t.tlsStatus.enabled
                              )
                                ? t.tlsStatus.success
                                  ? (0, a.jsxs)(a.Fragment, {
                                      children: [
                                        (0, a.jsx)(w.Z, {
                                          className: "text-green-600",
                                          size: 16,
                                        }),
                                        " ",
                                        (0, a.jsx)("span", {
                                          className: "text-sm",
                                          children: "Valid certificate",
                                        }),
                                      ],
                                    })
                                  : (0, a.jsxs)(a.Fragment, {
                                      children: [
                                        (0, a.jsx)(k.Z, {
                                          className: "text-red-600",
                                          size: 16,
                                        }),
                                        " ",
                                        (0, a.jsx)("span", {
                                          className: "text-sm",
                                          children: "Certificate error",
                                        }),
                                      ],
                                    })
                                : (0, a.jsxs)(a.Fragment, {
                                    children: [
                                      (0, a.jsx)(S.Z, {
                                        className: "text-yellow-600",
                                        size: 16,
                                      }),
                                      " ",
                                      (0, a.jsx)("span", {
                                        className: "text-sm",
                                        children: "No HTTPS configured",
                                      }),
                                    ],
                                  }),
                            }),
                            (null == t ? void 0 : t.tlsStatus.error) &&
                              (0, a.jsx)("div", {
                                className: "text-xs text-red-600 mt-1",
                                children: t.tlsStatus.error,
                              }),
                          ],
                        }),
                      ],
                    }),
                    (0, a.jsxs)("div", {
                      children: [
                        (0, a.jsx)("h4", {
                          className: "font-medium text-gray-900 mb-2",
                          children: "DNS Resolution Status",
                        }),
                        (0, a.jsx)("div", {
                          className: "space-y-2",
                          children:
                            null == t
                              ? void 0
                              : t.dnsChecks.map((e, s) => {
                                  var t;
                                  return (0, a.jsxs)(
                                    "div",
                                    {
                                      className:
                                        "flex items-center justify-between p-2 bg-gray-50 rounded text-sm",
                                      children: [
                                        (0, a.jsxs)("div", {
                                          className: "flex items-center gap-2",
                                          children: [
                                            e.success
                                              ? (0, a.jsx)(w.Z, {
                                                  className: "text-green-600",
                                                  size: 14,
                                                })
                                              : (0, a.jsx)(k.Z, {
                                                  className: "text-red-600",
                                                  size: 14,
                                                }),
                                            (0, a.jsx)("span", {
                                              children: e.resolver,
                                            }),
                                          ],
                                        }),
                                        (0, a.jsx)("div", {
                                          className: "text-gray-600",
                                          children: e.success
                                            ? (0, a.jsxs)("span", {
                                                children: [
                                                  null === (t = e.addresses) ||
                                                  void 0 === t
                                                    ? void 0
                                                    : t.join(", "),
                                                  " (",
                                                  e.timing,
                                                  "ms)",
                                                ],
                                              })
                                            : (0, a.jsx)("span", {
                                                className: "text-red-600",
                                                children: e.error,
                                              }),
                                        }),
                                      ],
                                    },
                                    s,
                                  );
                                }),
                        }),
                      ],
                    }),
                    T.length > 0 &&
                      (0, a.jsxs)("div", {
                        children: [
                          (0, a.jsx)("h4", {
                            className: "font-medium text-gray-900 mb-2",
                            children: "Stripe Webhook URLs",
                          }),
                          (0, a.jsx)("div", {
                            className: "space-y-2",
                            children: T.map((e, s) =>
                              (0, a.jsxs)(
                                "div",
                                {
                                  className: "p-3 bg-gray-50 rounded",
                                  children: [
                                    (0, a.jsxs)("div", {
                                      className:
                                        "flex items-center justify-between mb-1",
                                      children: [
                                        (0, a.jsx)("span", {
                                          className:
                                            "text-sm font-medium text-gray-700",
                                          children: e.label,
                                        }),
                                        (0, a.jsxs)("div", {
                                          className: "flex items-center gap-1",
                                          children: [
                                            (0, a.jsxs)("button", {
                                              onClick: () => v(e.url, e.label),
                                              className:
                                                "text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center gap-1",
                                              children: [
                                                (0, a.jsx)(C.Z, { size: 12 }),
                                                h === e.label
                                                  ? "Copied!"
                                                  : "Copy",
                                              ],
                                            }),
                                            (0, a.jsxs)("button", {
                                              onClick: () =>
                                                window.open(e.url, "_blank"),
                                              className:
                                                "text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded flex items-center gap-1",
                                              children: [
                                                (0, a.jsx)(z.Z, { size: 12 }),
                                                "Test",
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    (0, a.jsx)("div", {
                                      className:
                                        "text-xs font-mono text-gray-600",
                                      children: e.url,
                                    }),
                                  ],
                                },
                                s,
                              ),
                            ),
                          }),
                        ],
                      }),
                    n &&
                      (0, a.jsxs)("div", {
                        children: [
                          (0, a.jsx)("h4", {
                            className: "font-medium text-gray-900 mb-2",
                            children: "Latest Test Results",
                          }),
                          (0, a.jsxs)("div", {
                            className: "space-y-2",
                            children: [
                              (0, a.jsxs)("div", {
                                className:
                                  "grid grid-cols-1 md:grid-cols-3 gap-2",
                                children: [
                                  (0, a.jsxs)("div", {
                                    className: "p-2 rounded text-sm ".concat(
                                      n.tests.local.success
                                        ? "bg-green-50 text-green-800"
                                        : "bg-red-50 text-red-800",
                                    ),
                                    children: [
                                      (0, a.jsxs)("div", {
                                        className:
                                          "flex items-center gap-1 font-medium",
                                        children: [
                                          n.tests.local.success
                                            ? (0, a.jsx)(w.Z, { size: 14 })
                                            : (0, a.jsx)(k.Z, { size: 14 }),
                                          "Local (",
                                          n.tests.local.status,
                                          ")",
                                        ],
                                      }),
                                      (0, a.jsxs)("div", {
                                        className: "text-xs mt-1",
                                        children: [n.tests.local.timing, "ms"],
                                      }),
                                    ],
                                  }),
                                  (0, a.jsxs)("div", {
                                    className: "p-2 rounded text-sm ".concat(
                                      n.tests.public.success
                                        ? "bg-green-50 text-green-800"
                                        : "bg-red-50 text-red-800",
                                    ),
                                    children: [
                                      (0, a.jsxs)("div", {
                                        className:
                                          "flex items-center gap-1 font-medium",
                                        children: [
                                          n.tests.public.success
                                            ? (0, a.jsx)(w.Z, { size: 14 })
                                            : (0, a.jsx)(k.Z, { size: 14 }),
                                          "Public (",
                                          n.tests.public.status || "N/A",
                                          ")",
                                        ],
                                      }),
                                      (0, a.jsxs)("div", {
                                        className: "text-xs mt-1",
                                        children: [
                                          n.tests.public.timing || 0,
                                          "ms",
                                        ],
                                      }),
                                    ],
                                  }),
                                  (0, a.jsxs)("div", {
                                    className: "p-2 rounded text-sm ".concat(
                                      n.tests.webhook.success
                                        ? "bg-green-50 text-green-800"
                                        : "bg-red-50 text-red-800",
                                    ),
                                    children: [
                                      (0, a.jsxs)("div", {
                                        className:
                                          "flex items-center gap-1 font-medium",
                                        children: [
                                          n.tests.webhook.success
                                            ? (0, a.jsx)(w.Z, { size: 14 })
                                            : (0, a.jsx)(k.Z, { size: 14 }),
                                          "Webhook (",
                                          n.tests.webhook.status || "N/A",
                                          ")",
                                        ],
                                      }),
                                      (0, a.jsxs)("div", {
                                        className: "text-xs mt-1",
                                        children: [
                                          n.tests.webhook.timing || 0,
                                          "ms",
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              n.recommendations.length > 0 &&
                                (0, a.jsxs)("div", {
                                  className: "mt-3 p-3 bg-blue-50 rounded",
                                  children: [
                                    (0, a.jsx)("h5", {
                                      className:
                                        "text-sm font-medium text-blue-900 mb-1",
                                      children: "Recommendations",
                                    }),
                                    (0, a.jsx)("ul", {
                                      className:
                                        "text-sm text-blue-800 space-y-1",
                                      children: n.recommendations.map((e, s) =>
                                        (0, a.jsxs)(
                                          "li",
                                          {
                                            className: "flex items-start gap-1",
                                            children: [
                                              (0, a.jsx)("span", {
                                                className:
                                                  "text-blue-600 mt-0.5",
                                                children: "•",
                                              }),
                                              (0, a.jsx)("span", {
                                                children: e,
                                              }),
                                            ],
                                          },
                                          s,
                                        ),
                                      ),
                                    }),
                                  ],
                                }),
                            ],
                          }),
                        ],
                      }),
                    (0, a.jsxs)("div", {
                      className:
                        "flex justify-between items-center pt-4 border-t border-gray-100",
                      children: [
                        (0, a.jsxs)("span", {
                          className: "text-xs text-gray-500",
                          children: [
                            "Last updated: ",
                            t
                              ? new Date(t.timestamp).toLocaleTimeString()
                              : "Never",
                          ],
                        }),
                        (0, a.jsxs)("button", {
                          onClick: p,
                          disabled: d,
                          className:
                            "text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1",
                          children: [
                            (0, a.jsx)(N.Z, {
                              className: d ? "animate-spin" : "",
                              size: 14,
                            }),
                            "Refresh",
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
          ],
        });
      }
      var D = t(66693);
      function Z(e) {
        let { token: s } = e,
          [t, i] = (0, l.useState)(null),
          [n, r] = (0, l.useState)(!1),
          [d, c] = (0, l.useState)(!1);
        (0, l.useEffect)(() => {
          s && o();
        }, [s]);
        let o = async () => {
            if (s) {
              r(!0);
              try {
                let e = await fetch(
                  "".concat(
                    "https://api.care2connects.org",
                    "/admin/setup/tunnel/cloudflare/preflight",
                  ),
                  { headers: { Authorization: "Bearer ".concat(s) } },
                );
                e.ok
                  ? i(await e.json())
                  : console.error(
                      "Failed to load tunnel preflight data:",
                      e.statusText,
                    );
              } catch (e) {
                console.error("Error loading tunnel preflight data:", e);
              } finally {
                r(!1);
              }
            }
          },
          x = t
            ? t.cloudflared.installed
              ? t.versionCheck.isOutdated || t.warnings.length > 0
                ? "yellow"
                : "green"
              : "red"
            : "gray",
          m = t
            ? t.cloudflared.installed
              ? t.versionCheck.isOutdated
                ? "Version ".concat(t.versionCheck.current, " is outdated")
                : t.warnings.length > 0
                  ? "".concat(t.warnings.length, " warnings found")
                  : "Cloudflared ready"
              : "Cloudflared not installed"
            : "Loading...";
        return (0, a.jsxs)("div", {
          className: "bg-white rounded-lg shadow",
          children: [
            (0, a.jsx)("div", {
              className:
                "p-6 cursor-pointer hover:bg-gray-50 transition-colors",
              onClick: () => c(!d),
              children: (0, a.jsxs)("div", {
                className: "flex items-center justify-between",
                children: [
                  (0, a.jsxs)("div", {
                    className: "flex items-center gap-3",
                    children: [
                      (0, a.jsx)("div", {
                        className: "p-2 rounded-full ".concat(
                          "green" === x
                            ? "bg-green-100 text-green-600"
                            : "yellow" === x
                              ? "bg-yellow-100 text-yellow-600"
                              : "red" === x
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-600",
                        ),
                        children: (0, a.jsx)(j.Z, { size: 24 }),
                      }),
                      (0, a.jsxs)("div", {
                        children: [
                          (0, a.jsx)("h3", {
                            className: "text-lg font-semibold text-gray-900",
                            children: "Cloudflare Tunnel Status",
                          }),
                          (0, a.jsx)("p", {
                            className: "text-sm text-gray-500",
                            children: m,
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, a.jsxs)("div", {
                    className: "flex items-center gap-2",
                    children: [
                      (0, a.jsxs)("button", {
                        onClick: (e) => {
                          (e.stopPropagation(), o());
                        },
                        disabled: n,
                        className:
                          "text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1",
                        children: [
                          n
                            ? (0, a.jsx)(N.Z, {
                                className: "animate-spin",
                                size: 14,
                              })
                            : (0, a.jsx)(N.Z, { size: 14 }),
                          n ? "Checking..." : "Check",
                        ],
                      }),
                      (0, a.jsx)("span", {
                        className: "text-gray-400 text-sm",
                        children: d ? "▼" : "▶",
                      }),
                    ],
                  }),
                ],
              }),
            }),
            d &&
              (0, a.jsx)("div", {
                className: "px-6 pb-6 border-t border-gray-100",
                children: (0, a.jsxs)("div", {
                  className: "space-y-6",
                  children: [
                    (0, a.jsxs)("div", {
                      className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                      children: [
                        (0, a.jsxs)("div", {
                          children: [
                            (0, a.jsx)("h4", {
                              className: "font-medium text-gray-900 mb-2",
                              children: "Installation Status",
                            }),
                            (0, a.jsxs)("div", {
                              className: "space-y-2",
                              children: [
                                (0, a.jsxs)("div", {
                                  className: "flex items-center gap-2",
                                  children: [
                                    (
                                      null == t
                                        ? void 0
                                        : t.cloudflared.installed
                                    )
                                      ? (0, a.jsx)(w.Z, {
                                          className: "text-green-600",
                                          size: 16,
                                        })
                                      : (0, a.jsx)(k.Z, {
                                          className: "text-red-600",
                                          size: 16,
                                        }),
                                    (0, a.jsx)("span", {
                                      className: "text-sm",
                                      children: (
                                        null == t
                                          ? void 0
                                          : t.cloudflared.installed
                                      )
                                        ? "Installed"
                                        : "Not installed",
                                    }),
                                  ],
                                }),
                                (null == t ? void 0 : t.cloudflared.version) &&
                                  (0, a.jsxs)("div", {
                                    className: "text-sm text-gray-600",
                                    children: [
                                      "Current version: ",
                                      (0, a.jsx)("span", {
                                        className: "font-mono",
                                        children: t.cloudflared.version,
                                      }),
                                    ],
                                  }),
                                (null == t ? void 0 : t.cloudflared.path) &&
                                  (0, a.jsxs)("div", {
                                    className: "text-sm text-gray-600",
                                    children: [
                                      "Path: ",
                                      (0, a.jsx)("span", {
                                        className: "font-mono text-xs",
                                        children: t.cloudflared.path,
                                      }),
                                    ],
                                  }),
                                (null == t ? void 0 : t.cloudflared.error) &&
                                  (0, a.jsx)("div", {
                                    className: "text-sm text-red-600",
                                    children: t.cloudflared.error,
                                  }),
                              ],
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          children: [
                            (0, a.jsx)("h4", {
                              className: "font-medium text-gray-900 mb-2",
                              children: "Version Status",
                            }),
                            (0, a.jsxs)("div", {
                              className: "space-y-2",
                              children: [
                                (0, a.jsxs)("div", {
                                  className: "text-sm",
                                  children: [
                                    "Recommended: ",
                                    (0, a.jsxs)("span", {
                                      className: "font-mono",
                                      children: [
                                        null == t
                                          ? void 0
                                          : t.versionCheck.recommendedMin,
                                        "+",
                                      ],
                                    }),
                                  ],
                                }),
                                (null == t
                                  ? void 0
                                  : t.versionCheck.isOutdated) &&
                                  (0, a.jsxs)("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                      (0, a.jsx)(S.Z, {
                                        className: "text-yellow-600",
                                        size: 16,
                                      }),
                                      (0, a.jsx)("span", {
                                        className: "text-sm text-yellow-800",
                                        children: "Version outdated",
                                      }),
                                    ],
                                  }),
                                (null == t
                                  ? void 0
                                  : t.versionCheck.upgradeCommand) &&
                                  (0, a.jsxs)("div", {
                                    className: "mt-2",
                                    children: [
                                      (0, a.jsx)("div", {
                                        className: "text-xs text-gray-600 mb-1",
                                        children: "Upgrade command:",
                                      }),
                                      (0, a.jsx)("div", {
                                        className:
                                          "bg-gray-100 p-2 rounded font-mono text-xs",
                                        children: t.versionCheck.upgradeCommand,
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
                      children: [
                        (0, a.jsx)("h4", {
                          className: "font-medium text-gray-900 mb-2",
                          children: "System Information",
                        }),
                        (0, a.jsx)("div", {
                          className: "bg-gray-50 p-3 rounded",
                          children: (0, a.jsxs)("div", {
                            className: "grid grid-cols-3 gap-4 text-sm",
                            children: [
                              (0, a.jsxs)("div", {
                                children: [
                                  (0, a.jsx)("span", {
                                    className: "text-gray-600",
                                    children: "OS:",
                                  }),
                                  (0, a.jsx)("span", {
                                    className: "ml-2 font-mono",
                                    children:
                                      null == t ? void 0 : t.systemCheck.os,
                                  }),
                                ],
                              }),
                              (0, a.jsxs)("div", {
                                children: [
                                  (0, a.jsx)("span", {
                                    className: "text-gray-600",
                                    children: "Arch:",
                                  }),
                                  (0, a.jsx)("span", {
                                    className: "ml-2 font-mono",
                                    children:
                                      null == t ? void 0 : t.systemCheck.arch,
                                  }),
                                ],
                              }),
                              (0, a.jsxs)("div", {
                                children: [
                                  (0, a.jsx)("span", {
                                    className: "text-gray-600",
                                    children: "Node:",
                                  }),
                                  (0, a.jsx)("span", {
                                    className: "ml-2 font-mono",
                                    children:
                                      null == t ? void 0 : t.systemCheck.node,
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                    t &&
                      t.warnings.length > 0 &&
                      (0, a.jsxs)("div", {
                        children: [
                          (0, a.jsx)("h4", {
                            className: "font-medium text-gray-900 mb-2",
                            children: "Warnings",
                          }),
                          (0, a.jsx)("div", {
                            className: "space-y-2",
                            children: t.warnings.map((e, s) =>
                              (0, a.jsxs)(
                                "div",
                                {
                                  className:
                                    "flex items-start gap-2 p-2 bg-yellow-50 rounded",
                                  children: [
                                    (0, a.jsx)(S.Z, {
                                      className: "text-yellow-600 mt-0.5",
                                      size: 14,
                                    }),
                                    (0, a.jsx)("span", {
                                      className: "text-sm text-yellow-800",
                                      children: e,
                                    }),
                                  ],
                                },
                                s,
                              ),
                            ),
                          }),
                        ],
                      }),
                    t &&
                      t.recommendations.length > 0 &&
                      (0, a.jsxs)("div", {
                        children: [
                          (0, a.jsx)("h4", {
                            className: "font-medium text-gray-900 mb-2",
                            children: "Recommendations",
                          }),
                          (0, a.jsx)("div", {
                            className: "space-y-2",
                            children: t.recommendations.map((e, s) =>
                              (0, a.jsxs)(
                                "div",
                                {
                                  className:
                                    "flex items-start gap-2 p-2 bg-blue-50 rounded",
                                  children: [
                                    (0, a.jsx)("div", {
                                      className: "text-blue-600 mt-0.5",
                                      children: "•",
                                    }),
                                    (0, a.jsx)("span", {
                                      className: "text-sm text-blue-800",
                                      children: e,
                                    }),
                                  ],
                                },
                                s,
                              ),
                            ),
                          }),
                        ],
                      }),
                    (0, a.jsxs)("div", {
                      className:
                        "flex flex-wrap gap-2 pt-4 border-t border-gray-100",
                      children: [
                        !(null == t ? void 0 : t.cloudflared.installed) &&
                          (0, a.jsxs)("button", {
                            onClick: () =>
                              window.open(
                                "https://github.com/cloudflare/cloudflared/releases",
                                "_blank",
                              ),
                            className:
                              "text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1",
                            children: [
                              (0, a.jsx)(D.Z, { size: 14 }),
                              "Download Cloudflared",
                            ],
                          }),
                        (0, a.jsxs)("button", {
                          onClick: () =>
                            window.open(
                              "https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/",
                              "_blank",
                            ),
                          className:
                            "text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 flex items-center gap-1",
                          children: [
                            (0, a.jsx)(z.Z, { size: 14 }),
                            "Installation Guide",
                          ],
                        }),
                        (null == t ? void 0 : t.versionCheck.isOutdated) &&
                          (0, a.jsxs)("button", {
                            onClick: () =>
                              window.open(
                                "https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/#windows",
                                "_blank",
                              ),
                            className:
                              "text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 flex items-center gap-1",
                            children: [
                              (0, a.jsx)(z.Z, { size: 14 }),
                              "Upgrade Guide",
                            ],
                          }),
                      ],
                    }),
                    (0, a.jsxs)("div", {
                      className:
                        "text-xs text-gray-500 pt-2 border-t border-gray-100",
                      children: [
                        "Last checked: ",
                        t
                          ? new Date(t.timestamp).toLocaleTimeString()
                          : "Never",
                      ],
                    }),
                  ],
                }),
              }),
          ],
        });
      }
      var L = t(60893),
        R = t(34270),
        I = t(8227),
        O = t(23587),
        P = t(45753);
      function A() {
        var e,
          s,
          t,
          n,
          d,
          c,
          o,
          x,
          m,
          u,
          h,
          g,
          j,
          v,
          y,
          f,
          S,
          C,
          z,
          D,
          A,
          E,
          U,
          F,
          W,
          B,
          _,
          K;
        let M = (0, i.useRouter)(),
          [$, q] = (0, l.useState)(null),
          [H, V] = (0, l.useState)(!1),
          [G, J] = (0, l.useState)(null),
          [Q, Y] = (0, l.useState)([]),
          [X, ee] = (0, l.useState)(null),
          [es, et] = (0, l.useState)(null),
          [ea, el] = (0, l.useState)(!1),
          [ei, en] = (0, l.useState)(!0),
          [er, ed] = (0, l.useState)(!1),
          [ec, eo] = (0, l.useState)(null),
          [ex, em] = (0, l.useState)({});
        ((0, l.useEffect)(() => {
          let e = sessionStorage.getItem("system-admin-token"),
            s = sessionStorage.getItem("system-admin-expires");
          e && s && Date.now() < parseInt(s)
            ? (q(e), V(!1))
            : (V(!0),
              sessionStorage.removeItem("system-admin-token"),
              sessionStorage.removeItem("system-admin-expires"));
        }, []),
          (0, l.useEffect)(() => {
            if (!$) return;
            let e = () => "https://api.care2connects.org".replace(/\/api$/, ""),
              s = async () => {
                try {
                  let s = e(),
                    t = await fetch("".concat(s, "/health/status"));
                  t.ok && J(await t.json());
                  let a = await fetch("".concat(s, "/admin/user-errors"), {
                    headers: { Authorization: "Bearer ".concat($) },
                  });
                  if (a.ok) {
                    let e = await a.json();
                    Y(e.errors || []);
                  }
                } catch (e) {
                  console.error("Failed to fetch system data:", e);
                } finally {
                  en(!1);
                }
              };
            s();
            let t = setInterval(async () => {
              try {
                let s = e(),
                  t = await fetch("".concat(s, "/health/status"));
                t.ok && J(await t.json());
              } catch (e) {
                console.error("Health poll failed:", e);
              }
            }, 1e4);
            return () => clearInterval(t);
          }, [$]));
        let eu = (e) => {
            var s, t, a, l, i, n, r, d, c, o, x;
            if (!G) return;
            let m = {};
            ("status" === e
              ? (m = {
                  title: "System Status",
                  integrity: G.integrity || null,
                  blockingReasons:
                    (null === (s = G.integrity) || void 0 === s
                      ? void 0
                      : s.blockingReasons) || [],
                })
              : "database" === e
                ? (m = {
                    title: "Database",
                    ok:
                      null === (a = G.services) || void 0 === a
                        ? void 0
                        : null === (t = a.db) || void 0 === t
                          ? void 0
                          : t.ok,
                    detail:
                      null === (i = G.services) || void 0 === i
                        ? void 0
                        : null === (l = i.db) || void 0 === l
                          ? void 0
                          : l.detail,
                    connectedSince:
                      (null === (n = G.connectedSince) || void 0 === n
                        ? void 0
                        : n.db) || "never",
                  })
                : "storage" === e &&
                  (m = {
                    title: "Storage",
                    ok:
                      null === (d = G.services) || void 0 === d
                        ? void 0
                        : null === (r = d.storage) || void 0 === r
                          ? void 0
                          : r.ok,
                    detail:
                      null === (o = G.services) || void 0 === o
                        ? void 0
                        : null === (c = o.storage) || void 0 === c
                          ? void 0
                          : c.detail,
                    connectedSince:
                      (null === (x = G.connectedSince) || void 0 === x
                        ? void 0
                        : x.storage) || "never",
                  }),
              eo(m),
              ed(!0));
          },
          eh = async (e) => {
            if (!$)
              return em((s) => ({
                ...s,
                [e]: { ok: !1, message: "Not authenticated" },
              }));
            em((s) => ({ ...s, [e]: { status: "pending" } }));
            try {
              let s = "https://api.care2connects.org".replace(/\/api$/, ""),
                t = await fetch("".concat(s, "/admin/").concat(e), {
                  method: "POST",
                  headers: { Authorization: "Bearer ".concat($) },
                }),
                a = await t.json();
              em((s) => ({
                ...s,
                [e]: { status: t.ok ? "success" : "manual", data: a },
              }));
            } catch (s) {
              em((t) => ({ ...t, [e]: { status: "error", error: String(s) } }));
            }
          },
          eg = async () => {
            if ($) {
              el(!0);
              try {
                let e = "https://api.care2connects.org".replace(/\/api$/, ""),
                  s = await fetch("".concat(e, "/admin/run-tests"), {
                    method: "POST",
                    headers: { Authorization: "Bearer ".concat($) },
                  });
                if (s.ok) {
                  let e = await s.json();
                  et(e);
                }
              } catch (e) {
                console.error("Failed to run tests:", e);
              } finally {
                el(!1);
              }
            }
          };
        if (H)
          return (0, a.jsx)(r, {
            onAuthenticated: (e) => {
              (q(e), V(!1));
            },
            onCancel: () => M.push("/"),
          });
        if (ei)
          return (0, a.jsx)("div", {
            className:
              "min-h-screen bg-gray-50 flex items-center justify-center",
            children: (0, a.jsx)("div", {
              className: "text-gray-600",
              children: "Loading system data...",
            }),
          });
        let ep =
          (null == G ? void 0 : G.status) === "ready"
            ? "green"
            : (null == G ? void 0 : G.status) === "degraded"
              ? "yellow"
              : "red";
        return (0, a.jsxs)("div", {
          className: "min-h-screen bg-gray-50",
          children: [
            (0, a.jsx)("div", {
              className: "bg-white border-b border-gray-200 shadow-sm",
              children: (0, a.jsx)("div", {
                className: "max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8",
                children: (0, a.jsxs)("div", {
                  className: "flex justify-between items-center",
                  children: [
                    (0, a.jsxs)("div", {
                      className: "flex items-center gap-3",
                      children: [
                        (0, a.jsx)(L.Z, {
                          className: "text-blue-600",
                          size: 28,
                        }),
                        (0, a.jsx)("h1", {
                          className: "text-2xl font-bold text-gray-900",
                          children: "System Diagnostics Console",
                        }),
                      ],
                    }),
                    (0, a.jsxs)("div", {
                      className: "flex items-center gap-4",
                      children: [
                        (0, a.jsx)("button", {
                          onClick: () => M.push("/"),
                          className:
                            "text-sm text-gray-600 hover:text-gray-900",
                          children: "← Back to Portal",
                        }),
                        (0, a.jsx)("button", {
                          onClick: () => {
                            (sessionStorage.removeItem("system-admin-token"),
                              sessionStorage.removeItem("system-admin-expires"),
                              q(null),
                              V(!0));
                          },
                          className:
                            "text-sm text-gray-600 hover:text-gray-900",
                          children: "Logout",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            }),
            (0, a.jsxs)("div", {
              className: "max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8",
              children: [
                (0, a.jsxs)("div", {
                  className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8",
                  children: [
                    (0, a.jsx)("div", {
                      role: "button",
                      onClick: () => eu("status"),
                      className:
                        "bg-white rounded-lg shadow p-6 cursor-pointer",
                      children: (0, a.jsxs)("div", {
                        className: "flex items-center justify-between",
                        children: [
                          (0, a.jsxs)("div", {
                            children: [
                              (0, a.jsx)("p", {
                                className: "text-sm text-gray-600",
                                children: "Status",
                              }),
                              (0, a.jsx)("p", {
                                className:
                                  "text-2xl font-bold capitalize text-".concat(
                                    ep,
                                    "-600",
                                  ),
                                children:
                                  (null == G ? void 0 : G.status) || "Unknown",
                              }),
                            ],
                          }),
                          "green" === ep &&
                            (0, a.jsx)(w.Z, {
                              className: "text-green-500",
                              size: 32,
                            }),
                          "yellow" === ep &&
                            (0, a.jsx)(R.Z, {
                              className: "text-yellow-500",
                              size: 32,
                            }),
                          "red" === ep &&
                            (0, a.jsx)(k.Z, {
                              className: "text-red-500",
                              size: 32,
                            }),
                        ],
                      }),
                    }),
                    (0, a.jsx)("div", {
                      role: "button",
                      onClick: () => eu("database"),
                      className:
                        "bg-white rounded-lg shadow p-6 cursor-pointer",
                      children: (0, a.jsxs)("div", {
                        className: "flex items-center justify-between",
                        children: [
                          (0, a.jsxs)("div", {
                            children: [
                              (0, a.jsx)("p", {
                                className: "text-sm text-gray-600",
                                children: "Database",
                              }),
                              (0, a.jsx)("p", {
                                className: "text-2xl font-bold ".concat(
                                  (
                                    null == G
                                      ? void 0
                                      : null === (s = G.services) ||
                                          void 0 === s
                                        ? void 0
                                        : null === (e = s.db) || void 0 === e
                                          ? void 0
                                          : e.ok
                                  )
                                    ? "text-green-600"
                                    : "text-red-600",
                                ),
                                children: (
                                  null == G
                                    ? void 0
                                    : null === (n = G.services) || void 0 === n
                                      ? void 0
                                      : null === (t = n.db) || void 0 === t
                                        ? void 0
                                        : t.ok
                                )
                                  ? "Connected"
                                  : "Disconnected",
                              }),
                            ],
                          }),
                          (0, a.jsx)(I.Z, {
                            className: (
                              null == G
                                ? void 0
                                : null === (c = G.services) || void 0 === c
                                  ? void 0
                                  : null === (d = c.db) || void 0 === d
                                    ? void 0
                                    : d.ok
                            )
                              ? "text-green-500"
                              : "text-red-500",
                            size: 32,
                          }),
                        ],
                      }),
                    }),
                    (0, a.jsx)("div", {
                      role: "button",
                      onClick: () => eu("storage"),
                      className:
                        "bg-white rounded-lg shadow p-6 cursor-pointer",
                      children: (0, a.jsxs)("div", {
                        className: "flex items-center justify-between",
                        children: [
                          (0, a.jsxs)("div", {
                            children: [
                              (0, a.jsx)("p", {
                                className: "text-sm text-gray-600",
                                children: "Storage",
                              }),
                              (0, a.jsx)("p", {
                                className: "text-2xl font-bold ".concat(
                                  (
                                    null == G
                                      ? void 0
                                      : null === (x = G.services) ||
                                          void 0 === x
                                        ? void 0
                                        : null === (o = x.storage) ||
                                            void 0 === o
                                          ? void 0
                                          : o.ok
                                  )
                                    ? "text-green-600"
                                    : "text-red-600",
                                ),
                                children: (
                                  null == G
                                    ? void 0
                                    : null === (u = G.services) || void 0 === u
                                      ? void 0
                                      : null === (m = u.storage) || void 0 === m
                                        ? void 0
                                        : m.ok
                                )
                                  ? "Connected"
                                  : "Disconnected",
                              }),
                            ],
                          }),
                          (0, a.jsx)(O.Z, {
                            className: (
                              null == G
                                ? void 0
                                : null === (g = G.services) || void 0 === g
                                  ? void 0
                                  : null === (h = g.storage) || void 0 === h
                                    ? void 0
                                    : h.ok
                            )
                              ? "text-green-500"
                              : "text-red-500",
                            size: 32,
                          }),
                        ],
                      }),
                    }),
                    (0, a.jsx)("div", {
                      className: "bg-white rounded-lg shadow p-6",
                      children: (0, a.jsxs)("div", {
                        className: "flex items-center justify-between",
                        children: [
                          (0, a.jsxs)("div", {
                            children: [
                              (0, a.jsx)("p", {
                                className: "text-sm text-gray-600",
                                children: "User Errors",
                              }),
                              (0, a.jsx)("p", {
                                className: "text-2xl font-bold text-gray-900",
                                children: Q.length,
                              }),
                            ],
                          }),
                          (0, a.jsx)(R.Z, {
                            className: "text-orange-500",
                            size: 32,
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
                (0, a.jsxs)("div", {
                  className: "bg-white rounded-lg shadow p-6 mb-8",
                  children: [
                    (0, a.jsxs)("div", {
                      className: "flex items-center justify-between mb-4",
                      children: [
                        (0, a.jsx)("h3", {
                          className: "text-lg font-semibold text-gray-900",
                          children: "Setup Helpers",
                        }),
                        (0, a.jsx)("p", {
                          className: "text-sm text-gray-500",
                          children: "One-click helpers (demo/dev only)",
                        }),
                      ],
                    }),
                    (0, a.jsxs)("div", {
                      className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                      children: [
                        (0, a.jsxs)("div", {
                          className: "space-y-2",
                          children: [
                            (0, a.jsx)("button", {
                              onClick: () => eh("fix/db"),
                              className:
                                "w-full bg-blue-600 text-white px-4 py-2 rounded",
                              children: "Start Demo Database",
                            }),
                            (0, a.jsx)("div", {
                              className: "text-sm text-gray-600",
                              children:
                                (null === (j = ex["fix/db"]) || void 0 === j
                                  ? void 0
                                  : j.status) === "pending"
                                  ? "Starting..."
                                  : (null === (y = ex["fix/db"]) || void 0 === y
                                      ? void 0
                                      : null === (v = y.data) || void 0 === v
                                        ? void 0
                                        : v.command) ||
                                    ((null === (f = ex["fix/db"]) ||
                                    void 0 === f
                                      ? void 0
                                      : f.status) === "success"
                                      ? "Started"
                                      : ""),
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          className: "space-y-2",
                          children: [
                            (0, a.jsx)("button", {
                              onClick: () => eh("fix/email-inbox"),
                              className:
                                "w-full bg-blue-600 text-white px-4 py-2 rounded",
                              children: "Start Local Email Inbox",
                            }),
                            (0, a.jsx)("div", {
                              className: "text-sm text-gray-600",
                              children:
                                (null === (C = ex["fix/email-inbox"]) ||
                                void 0 === C
                                  ? void 0
                                  : null === (S = C.data) || void 0 === S
                                    ? void 0
                                    : S.inboxUrl) ||
                                (null === (D = ex["fix/email-inbox"]) ||
                                void 0 === D
                                  ? void 0
                                  : null === (z = D.data) || void 0 === z
                                    ? void 0
                                    : z.command) ||
                                "",
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          className: "space-y-2",
                          children: [
                            (0, a.jsx)("button", {
                              onClick: () => eh("fix/install-evts"),
                              className:
                                "w-full bg-blue-600 text-white px-4 py-2 rounded",
                              children: "Install EVTS Model",
                            }),
                            (0, a.jsx)("div", {
                              className: "text-sm text-gray-600",
                              children:
                                (null === (E = ex["fix/install-evts"]) ||
                                void 0 === E
                                  ? void 0
                                  : null === (A = E.data) || void 0 === A
                                    ? void 0
                                    : A.command) ||
                                (null === (F = ex["fix/install-evts"]) ||
                                void 0 === F
                                  ? void 0
                                  : null === (U = F.data) || void 0 === U
                                    ? void 0
                                    : U.message) ||
                                "",
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          className: "space-y-2",
                          children: [
                            (0, a.jsx)("button", {
                              onClick: () => eh("fix/stripe-webhook"),
                              className:
                                "w-full bg-blue-600 text-white px-4 py-2 rounded",
                              children: "Stripe Webhook Helper",
                            }),
                            (0, a.jsx)("div", {
                              className: "text-sm text-gray-600",
                              children:
                                (null === (B = ex["fix/stripe-webhook"]) ||
                                void 0 === B
                                  ? void 0
                                  : null === (W = B.data) || void 0 === W
                                    ? void 0
                                    : W.command) ||
                                (null === (K = ex["fix/stripe-webhook"]) ||
                                void 0 === K
                                  ? void 0
                                  : null === (_ = K.data) || void 0 === _
                                    ? void 0
                                    : _.message) ||
                                "",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                $ &&
                  (0, a.jsx)("div", {
                    className: "mt-8",
                    children: (0, a.jsx)(T, { token: $ }),
                  }),
                $ &&
                  (0, a.jsx)("div", {
                    className: "mt-8",
                    children: (0, a.jsx)(Z, { token: $ }),
                  }),
                $ &&
                  (0, a.jsx)("div", {
                    className: "mt-8",
                    children: (0, a.jsx)(b, { token: $ }),
                  }),
                (null == G ? void 0 : G.degradedReasons) &&
                  G.degradedReasons.length > 0 &&
                  (0, a.jsxs)("div", {
                    className:
                      "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8",
                    children: [
                      (0, a.jsx)("h3", {
                        className: "text-sm font-semibold text-yellow-900 mb-2",
                        children: "Degraded Reasons:",
                      }),
                      (0, a.jsx)("ul", {
                        className:
                          "list-disc list-inside text-sm text-yellow-800 space-y-1",
                        children: G.degradedReasons.map((e, s) =>
                          (0, a.jsx)("li", { children: e }, s),
                        ),
                      }),
                    ],
                  }),
                er &&
                  ec &&
                  (0, a.jsx)("div", {
                    className:
                      "fixed inset-0 bg-black/40 z-40 flex items-end md:items-center justify-center p-4",
                    children: (0, a.jsxs)("div", {
                      className:
                        "bg-white rounded-t-lg md:rounded-lg shadow-2xl w-full md:w-3/4 max-h-[80vh] overflow-y-auto p-6",
                      children: [
                        (0, a.jsxs)("div", {
                          className: "flex justify-between items-center mb-4",
                          children: [
                            (0, a.jsx)("h3", {
                              className: "text-xl font-bold",
                              children: ec.title,
                            }),
                            (0, a.jsx)("button", {
                              onClick: () => ed(!1),
                              className: "text-gray-500",
                              children: "✕",
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          className: "space-y-4 text-sm text-gray-800",
                          children: [
                            ec.integrity &&
                              (0, a.jsxs)("div", {
                                children: [
                                  (0, a.jsxs)("p", {
                                    className: "font-medium",
                                    children: [
                                      "Integrity Mode: ",
                                      (0, a.jsx)("span", {
                                        className: "font-semibold",
                                        children: ec.integrity.mode,
                                      }),
                                    ],
                                  }),
                                  (0, a.jsx)("p", {
                                    className: "mt-2",
                                    children: "Blocking Reasons:",
                                  }),
                                  (0, a.jsx)("ul", {
                                    className: "list-disc list-inside",
                                    children: ec.blockingReasons.map((e, s) =>
                                      (0, a.jsx)("li", { children: e }, s),
                                    ),
                                  }),
                                ],
                              }),
                            void 0 !== ec.ok &&
                              (0, a.jsxs)("div", {
                                children: [
                                  (0, a.jsxs)("p", {
                                    className: "font-medium",
                                    children: [
                                      "State: ",
                                      (0, a.jsx)("span", {
                                        className: "font-semibold ".concat(
                                          ec.ok
                                            ? "text-green-600"
                                            : "text-red-600",
                                        ),
                                        children: ec.ok
                                          ? "Connected"
                                          : "Disconnected",
                                      }),
                                    ],
                                  }),
                                  (0, a.jsxs)("p", {
                                    className: "mt-2",
                                    children: ["Detail: ", ec.detail],
                                  }),
                                  (0, a.jsxs)("p", {
                                    className: "mt-2",
                                    children: [
                                      "Connected since: ",
                                      ec.connectedSince,
                                    ],
                                  }),
                                  (0, a.jsxs)("div", {
                                    className: "mt-4",
                                    children: [
                                      (0, a.jsx)("p", {
                                        className: "font-medium",
                                        children: "Fix Steps",
                                      }),
                                      (0, a.jsx)("pre", {
                                        className:
                                          "bg-gray-50 p-3 rounded text-xs mt-2",
                                        children: ec.ok
                                          ? "No action required"
                                          : "docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                          ],
                        }),
                      ],
                    }),
                  }),
                $ && (0, a.jsx)(p, { token: $ }),
                (0, a.jsxs)("div", {
                  className: "bg-white rounded-lg shadow p-6 mt-8",
                  children: [
                    (0, a.jsxs)("div", {
                      className: "flex justify-between items-center mb-4",
                      children: [
                        (0, a.jsx)("h3", {
                          className: "text-lg font-semibold text-gray-900",
                          children: "System Tests",
                        }),
                        (0, a.jsx)("button", {
                          onClick: eg,
                          disabled: ea,
                          className:
                            "flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition",
                          children: ea
                            ? (0, a.jsxs)(a.Fragment, {
                                children: [
                                  (0, a.jsx)(N.Z, {
                                    className: "animate-spin",
                                    size: 16,
                                  }),
                                  "Running...",
                                ],
                              })
                            : (0, a.jsxs)(a.Fragment, {
                                children: [
                                  (0, a.jsx)(P.Z, { size: 16 }),
                                  "Run Tests",
                                ],
                              }),
                        }),
                      ],
                    }),
                    es &&
                      (0, a.jsxs)("div", {
                        className: "space-y-3",
                        children: [
                          (0, a.jsxs)("div", {
                            className:
                              "flex items-center justify-between text-sm",
                            children: [
                              (0, a.jsxs)("span", {
                                className: "text-gray-600",
                                children: [
                                  "Started: ",
                                  new Date(es.startedAt).toLocaleTimeString(),
                                ],
                              }),
                              (0, a.jsxs)("span", {
                                className: "text-gray-600",
                                children: [
                                  "Finished: ",
                                  new Date(es.finishedAt).toLocaleTimeString(),
                                ],
                              }),
                            ],
                          }),
                          es.results.map((e) =>
                            (0, a.jsxs)(
                              "div",
                              {
                                className:
                                  "flex items-center justify-between p-3 bg-gray-50 rounded",
                                children: [
                                  (0, a.jsx)("span", {
                                    className: "font-medium text-gray-900",
                                    children: e.name,
                                  }),
                                  (0, a.jsxs)("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                      e.duration &&
                                        (0, a.jsxs)("span", {
                                          className: "text-xs text-gray-500",
                                          children: [e.duration, "ms"],
                                        }),
                                      e.ok
                                        ? (0, a.jsx)(w.Z, {
                                            className: "text-green-500",
                                            size: 20,
                                          })
                                        : (0, a.jsx)(k.Z, {
                                            className: "text-red-500",
                                            size: 20,
                                          }),
                                    ],
                                  }),
                                ],
                              },
                              e.name,
                            ),
                          ),
                        ],
                      }),
                  ],
                }),
                (0, a.jsxs)("div", {
                  className: "bg-white rounded-lg shadow p-6 mt-8",
                  children: [
                    (0, a.jsx)("h3", {
                      className: "text-lg font-semibold text-gray-900 mb-4",
                      children: "User Reported Errors",
                    }),
                    0 === Q.length
                      ? (0, a.jsx)("p", {
                          className: "text-gray-500 text-center py-8",
                          children: "No user errors reported",
                        })
                      : (0, a.jsx)("div", {
                          className: "overflow-x-auto",
                          children: (0, a.jsxs)("table", {
                            className: "min-w-full divide-y divide-gray-200",
                            children: [
                              (0, a.jsx)("thead", {
                                className: "bg-gray-50",
                                children: (0, a.jsxs)("tr", {
                                  children: [
                                    (0, a.jsx)("th", {
                                      className:
                                        "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                                      children: "Time",
                                    }),
                                    (0, a.jsx)("th", {
                                      className:
                                        "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                                      children: "Category",
                                    }),
                                    (0, a.jsx)("th", {
                                      className:
                                        "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                                      children: "Page",
                                    }),
                                    (0, a.jsx)("th", {
                                      className:
                                        "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                                      children: "Suspected Cause",
                                    }),
                                    (0, a.jsx)("th", {
                                      className:
                                        "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                                      children: "Confidence",
                                    }),
                                    (0, a.jsx)("th", {
                                      className:
                                        "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase",
                                      children: "Status",
                                    }),
                                  ],
                                }),
                              }),
                              (0, a.jsx)("tbody", {
                                className: "bg-white divide-y divide-gray-200",
                                children: Q.slice(0, 10).map((e) =>
                                  (0, a.jsxs)(
                                    "tr",
                                    {
                                      onClick: () => ee(e),
                                      className:
                                        "hover:bg-gray-50 cursor-pointer",
                                      children: [
                                        (0, a.jsx)("td", {
                                          className:
                                            "px-4 py-3 text-sm text-gray-900",
                                          children: new Date(
                                            e.timestamp,
                                          ).toLocaleString(),
                                        }),
                                        (0, a.jsx)("td", {
                                          className: "px-4 py-3 text-sm",
                                          children: (0, a.jsx)("span", {
                                            className:
                                              "px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs",
                                            children: e.rootCause.category,
                                          }),
                                        }),
                                        (0, a.jsx)("td", {
                                          className:
                                            "px-4 py-3 text-sm text-gray-900",
                                          children: e.page || "Unknown",
                                        }),
                                        (0, a.jsx)("td", {
                                          className:
                                            "px-4 py-3 text-sm text-gray-600",
                                          children: e.rootCause.suspectedCause,
                                        }),
                                        (0, a.jsx)("td", {
                                          className: "px-4 py-3 text-sm",
                                          children: (0, a.jsx)("span", {
                                            className:
                                              "px-2 py-1 rounded text-xs ".concat(
                                                "high" ===
                                                  e.rootCause.confidence
                                                  ? "bg-green-100 text-green-800"
                                                  : "medium" ===
                                                      e.rootCause.confidence
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-gray-100 text-gray-800",
                                              ),
                                            children: e.rootCause.confidence,
                                          }),
                                        }),
                                        (0, a.jsx)("td", {
                                          className:
                                            "px-4 py-3 text-sm text-gray-900 capitalize",
                                          children: e.status,
                                        }),
                                      ],
                                    },
                                    e.id,
                                  ),
                                ),
                              }),
                            ],
                          }),
                        }),
                  ],
                }),
                X &&
                  (0, a.jsx)("div", {
                    className:
                      "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4",
                    children: (0, a.jsx)("div", {
                      className:
                        "bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",
                      children: (0, a.jsxs)("div", {
                        className: "p-6",
                        children: [
                          (0, a.jsxs)("div", {
                            className: "flex justify-between items-start mb-4",
                            children: [
                              (0, a.jsx)("h3", {
                                className: "text-xl font-bold text-gray-900",
                                children: "Error Details",
                              }),
                              (0, a.jsx)("button", {
                                onClick: () => ee(null),
                                className: "text-gray-400 hover:text-gray-600",
                                children: "✕",
                              }),
                            ],
                          }),
                          (0, a.jsxs)("div", {
                            className: "space-y-4",
                            children: [
                              (0, a.jsxs)("div", {
                                children: [
                                  (0, a.jsx)("p", {
                                    className:
                                      "text-sm font-medium text-gray-700",
                                    children: "Timestamp",
                                  }),
                                  (0, a.jsx)("p", {
                                    className: "text-gray-900",
                                    children: new Date(
                                      X.timestamp,
                                    ).toLocaleString(),
                                  }),
                                ],
                              }),
                              (0, a.jsxs)("div", {
                                children: [
                                  (0, a.jsx)("p", {
                                    className:
                                      "text-sm font-medium text-gray-700",
                                    children: "Message",
                                  }),
                                  (0, a.jsx)("p", {
                                    className: "text-gray-900",
                                    children: X.message,
                                  }),
                                ],
                              }),
                              (0, a.jsxs)("div", {
                                children: [
                                  (0, a.jsx)("p", {
                                    className:
                                      "text-sm font-medium text-gray-700",
                                    children: "Page",
                                  }),
                                  (0, a.jsx)("p", {
                                    className: "text-gray-900",
                                    children: X.page || "Unknown",
                                  }),
                                ],
                              }),
                              (0, a.jsxs)("div", {
                                className: "border-t pt-4",
                                children: [
                                  (0, a.jsx)("p", {
                                    className:
                                      "text-sm font-medium text-gray-700 mb-2",
                                    children: "Root Cause Analysis",
                                  }),
                                  (0, a.jsxs)("div", {
                                    className:
                                      "bg-blue-50 p-4 rounded-lg space-y-3",
                                    children: [
                                      (0, a.jsxs)("div", {
                                        children: [
                                          (0, a.jsx)("p", {
                                            className:
                                              "text-xs font-medium text-blue-900",
                                            children: "Category",
                                          }),
                                          (0, a.jsx)("p", {
                                            className: "text-blue-800",
                                            children: X.rootCause.category,
                                          }),
                                        ],
                                      }),
                                      (0, a.jsxs)("div", {
                                        children: [
                                          (0, a.jsx)("p", {
                                            className:
                                              "text-xs font-medium text-blue-900",
                                            children: "Suspected Cause",
                                          }),
                                          (0, a.jsx)("p", {
                                            className: "text-blue-800",
                                            children:
                                              X.rootCause.suspectedCause,
                                          }),
                                        ],
                                      }),
                                      (0, a.jsxs)("div", {
                                        children: [
                                          (0, a.jsx)("p", {
                                            className:
                                              "text-xs font-medium text-blue-900",
                                            children: "Recommended Fix",
                                          }),
                                          (0, a.jsx)("p", {
                                            className: "text-blue-800",
                                            children:
                                              X.rootCause.recommendedFix,
                                          }),
                                        ],
                                      }),
                                      (0, a.jsxs)("div", {
                                        children: [
                                          (0, a.jsx)("p", {
                                            className:
                                              "text-xs font-medium text-blue-900",
                                            children: "Confidence",
                                          }),
                                          (0, a.jsx)("p", {
                                            className:
                                              "text-blue-800 capitalize",
                                            children: X.rootCause.confidence,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  }),
              ],
            }),
          ],
        });
      }
    },
  },
  function (e) {
    (e.O(0, [527, 115, 835, 744], function () {
      return e((e.s = 47922));
    }),
      (_N_E = e.O()));
  },
]);

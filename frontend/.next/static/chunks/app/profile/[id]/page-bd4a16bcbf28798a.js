(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [495],
  {
    14577: function (e, t, s) {
      Promise.resolve().then(s.bind(s, 82286));
    },
    82286: function (e, t, s) {
      "use strict";
      (s.r(t),
        s.d(t, {
          default: function () {
            return b;
          },
        }));
      var r = s(37821),
        a = s(58078),
        l = s(96871),
        n = s.n(l),
        o = s(46179),
        i = s(6384),
        d = s(26200),
        c = s(8361),
        x = s(14270);
      let h = a.forwardRef(function ({ title: e, titleId: t, ...s }, r) {
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
            d: "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
          }),
        );
      });
      var u = s(54231),
        m = s(90185);
      function b() {
        let e = (0, o.useParams)(),
          t = (null == e ? void 0 : e.id) || "",
          [s, l] = (0, a.useState)(null),
          [b, p] = (0, a.useState)(null),
          [g, y] = (0, a.useState)([]),
          [f, v] = (0, a.useState)(!0),
          [j, N] = (0, a.useState)(""),
          [w, k] = (0, a.useState)(!0),
          [E, S] = (0, a.useState)(!1),
          [C, D] = (0, a.useState)("25"),
          [Z, L] = (0, a.useState)("USD"),
          [M, R] = (0, a.useState)(""),
          [P, A] = (0, a.useState)(null),
          [U, O] = (0, a.useState)(null),
          [T, B] = (0, a.useState)(!1),
          [q, F] = (0, a.useState)("");
        (0, a.useEffect)(() => {
          _();
        }, [t]);
        let _ = async () => {
            (v(!0), N(""));
            try {
              let e = await m.h.checkDbHealth();
              if ((k(e.ready), !e.ready)) {
                N("System offline due to database connectivity");
                return;
              }
              let s = await m.h.get("/tickets/".concat(t));
              l(s);
              try {
                let e = await m.h.get(
                  "/tickets/".concat(t, "/donations/total"),
                );
                p(e);
              } catch (e) {
                console.error("Failed to load donation totals:", e);
              }
              try {
                let e = await m.h.get("/tickets/".concat(t, "/donations"));
                y(e);
              } catch (e) {
                console.error("Failed to load donations:", e);
              }
            } catch (e) {
              404 === e.status
                ? N("Profile not found")
                : 503 === e.status
                  ? (N("System unavailable due to database connectivity"),
                    k(!1))
                  : N(e.message || "Failed to load profile");
            } finally {
              v(!1);
            }
          },
          G = async () => {
            (B(!0), F(""), A(null), O(null));
            try {
              let e = parseFloat(C);
              if (isNaN(e) || e <= 0)
                throw Error("Please enter a valid donation amount");
              let r = {
                  amount: e,
                  currency: Z,
                  description:
                    M ||
                    "Support for ".concat(
                      (null == s ? void 0 : s.displayName) || "profile",
                    ),
                },
                a = await m.h.post("/tickets/".concat(t, "/create-payment"), r);
              (A(a.qrCodeBase64), O(a.checkoutUrl));
            } catch (e) {
              F(e.message || "Failed to generate donation QR code");
            } finally {
              B(!1);
            }
          },
          I = async () => {
            (B(!0), F(""));
            try {
              let e = await m.h.get("/tickets/".concat(t, "/qr-code"));
              (A(e.qrCodeBase64), O(e.checkoutUrl), S(!0));
            } catch (e) {
              F(e.message || "No existing QR code found");
            } finally {
              B(!1);
            }
          },
          Q = (e) =>
            e
              ? new Date(e).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A",
          H = (e, t) =>
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: t,
            }).format(e),
          W = (e) =>
            ({
              PAID: "bg-green-100 text-green-800 border-green-300",
              REFUNDED: "bg-yellow-100 text-yellow-800 border-yellow-300",
              DISPUTED: "bg-red-100 text-red-800 border-red-300",
              EXPIRED: "bg-gray-100 text-gray-800 border-gray-300",
            })[e] || "bg-gray-100 text-gray-800 border-gray-300";
        return f
          ? (0, r.jsx)("div", {
              className:
                "min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center",
              children: (0, r.jsxs)("div", {
                className: "text-center",
                children: [
                  (0, r.jsx)("div", {
                    className:
                      "animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4",
                  }),
                  (0, r.jsx)("p", {
                    className: "text-gray-600 font-semibold",
                    children: "Loading profile...",
                  }),
                ],
              }),
            })
          : j
            ? (0, r.jsx)("div", {
                className:
                  "min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4",
                children: (0, r.jsxs)("div", {
                  className:
                    "max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center",
                  children: [
                    (0, r.jsx)(d.Z, {
                      className: "w-16 h-16 text-red-500 mx-auto mb-4",
                    }),
                    (0, r.jsx)("h2", {
                      className: "text-2xl font-bold text-gray-900 mb-2",
                      children: "Error",
                    }),
                    (0, r.jsx)("p", {
                      className: "text-gray-600 mb-6",
                      children: j,
                    }),
                    (0, r.jsxs)(n(), {
                      href: "/find",
                      className:
                        "inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors",
                      children: [
                        (0, r.jsx)(c.Z, { className: "w-5 h-5" }),
                        "Back to Search",
                      ],
                    }),
                  ],
                }),
              })
            : (0, r.jsxs)("div", {
                className:
                  "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50",
                children: [
                  (0, r.jsx)("div", {
                    className: "bg-white shadow-sm border-b",
                    children: (0, r.jsxs)("div", {
                      className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6",
                      children: [
                        (0, r.jsxs)(n(), {
                          href: "/find",
                          className:
                            "inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-4 transition-colors",
                          children: [
                            (0, r.jsx)(c.Z, { className: "w-5 h-5" }),
                            "Back to Search",
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          className: "flex items-center gap-4",
                          children: [
                            (0, r.jsx)(x.Z, {
                              className: "w-12 h-12 text-blue-600",
                            }),
                            (0, r.jsxs)("div", {
                              children: [
                                (0, r.jsx)("h1", {
                                  className:
                                    "text-3xl font-black text-gray-900",
                                  children:
                                    (null == s ? void 0 : s.displayName) ||
                                    "Anonymous Profile",
                                }),
                                (0, r.jsx)("p", {
                                  className: "text-gray-600",
                                  children: "Profile Details & Donations",
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                  (0, r.jsxs)("div", {
                    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
                    children: [
                      !w &&
                        (0, r.jsx)("div", {
                          className:
                            "mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4",
                          children: (0, r.jsx)("p", {
                            className: "text-red-800 font-semibold",
                            children:
                              "System offline - donation actions are temporarily disabled",
                          }),
                        }),
                      (0, r.jsxs)("div", {
                        className: "grid lg:grid-cols-3 gap-8",
                        children: [
                          (0, r.jsxs)("div", {
                            className: "lg:col-span-1 space-y-6",
                            children: [
                              (0, r.jsxs)(i.E.div, {
                                initial: { opacity: 0, x: -20 },
                                animate: { opacity: 1, x: 0 },
                                className:
                                  "bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100",
                                children: [
                                  (0, r.jsx)("h2", {
                                    className:
                                      "text-xl font-bold text-gray-900 mb-4",
                                    children: "Profile Information",
                                  }),
                                  (0, r.jsxs)("div", {
                                    className: "space-y-3",
                                    children: [
                                      (0, r.jsxs)("div", {
                                        children: [
                                          (0, r.jsx)("p", {
                                            className: "text-sm text-gray-500",
                                            children: "Status",
                                          }),
                                          (0, r.jsx)("p", {
                                            className:
                                              "font-semibold text-gray-900",
                                            children:
                                              null == s ? void 0 : s.status,
                                          }),
                                        ],
                                      }),
                                      (0, r.jsxs)("div", {
                                        children: [
                                          (0, r.jsx)("p", {
                                            className: "text-sm text-gray-500",
                                            children: "Created",
                                          }),
                                          (0, r.jsx)("p", {
                                            className:
                                              "font-semibold text-gray-900",
                                            children: Q(
                                              null == s ? void 0 : s.createdAt,
                                            ),
                                          }),
                                        ],
                                      }),
                                      (0, r.jsxs)("div", {
                                        children: [
                                          (0, r.jsx)("p", {
                                            className: "text-sm text-gray-500",
                                            children: "Ticket ID",
                                          }),
                                          (0, r.jsx)("p", {
                                            className:
                                              "font-mono text-xs text-gray-700 break-all",
                                            children: null == s ? void 0 : s.id,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              b &&
                                (0, r.jsxs)(i.E.div, {
                                  initial: { opacity: 0, x: -20 },
                                  animate: { opacity: 1, x: 0 },
                                  transition: { delay: 0.1 },
                                  className:
                                    "bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-6 border-2 border-green-200",
                                  children: [
                                    (0, r.jsxs)("h2", {
                                      className:
                                        "text-xl font-bold text-gray-900 mb-4 flex items-center gap-2",
                                      children: [
                                        (0, r.jsx)(h, {
                                          className: "w-6 h-6 text-green-600",
                                        }),
                                        "Donation Totals",
                                      ],
                                    }),
                                    (0, r.jsxs)("div", {
                                      className: "space-y-3",
                                      children: [
                                        (0, r.jsxs)("div", {
                                          children: [
                                            (0, r.jsx)("p", {
                                              className:
                                                "text-sm text-gray-600",
                                              children: "Total Received",
                                            }),
                                            (0, r.jsx)("p", {
                                              className:
                                                "text-2xl font-bold text-green-600",
                                              children: H(
                                                b.totalPaid,
                                                b.currency,
                                              ),
                                            }),
                                          ],
                                        }),
                                        b.totalRefunded > 0 &&
                                          (0, r.jsxs)("div", {
                                            children: [
                                              (0, r.jsx)("p", {
                                                className:
                                                  "text-sm text-gray-600",
                                                children: "Refunded",
                                              }),
                                              (0, r.jsx)("p", {
                                                className:
                                                  "text-lg font-semibold text-yellow-600",
                                                children: H(
                                                  b.totalRefunded,
                                                  b.currency,
                                                ),
                                              }),
                                            ],
                                          }),
                                        (0, r.jsxs)("div", {
                                          className:
                                            "pt-3 border-t border-gray-300",
                                          children: [
                                            (0, r.jsx)("p", {
                                              className:
                                                "text-sm text-gray-600",
                                              children: "Net Total",
                                            }),
                                            (0, r.jsx)("p", {
                                              className:
                                                "text-2xl font-bold text-gray-900",
                                              children: H(
                                                b.netTotal,
                                                b.currency,
                                              ),
                                            }),
                                          ],
                                        }),
                                        b.lastDonationAt &&
                                          (0, r.jsxs)("div", {
                                            className: "text-xs text-gray-500",
                                            children: [
                                              "Last donation: ",
                                              Q(b.lastDonationAt),
                                            ],
                                          }),
                                      ],
                                    }),
                                  ],
                                }),
                            ],
                          }),
                          (0, r.jsxs)("div", {
                            className: "lg:col-span-2 space-y-6",
                            children: [
                              (0, r.jsxs)(i.E.div, {
                                initial: { opacity: 0, y: 20 },
                                animate: { opacity: 1, y: 0 },
                                className:
                                  "bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100",
                                children: [
                                  (0, r.jsx)("h2", {
                                    className:
                                      "text-2xl font-bold text-gray-900 mb-2",
                                    children: "Support This Profile",
                                  }),
                                  (0, r.jsx)("div", {
                                    className:
                                      "bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6",
                                    children: (0, r.jsxs)("p", {
                                      className: "text-sm text-yellow-800",
                                      children: [
                                        (0, r.jsx)("strong", {
                                          children: "Please verify:",
                                        }),
                                        " Only donate if you have verified this profile with the recipient. Care2Connect does not verify profile authenticity.",
                                      ],
                                    }),
                                  }),
                                  E
                                    ? (0, r.jsx)("div", {
                                        className: "space-y-4",
                                        children: P
                                          ? (0, r.jsxs)("div", {
                                              className: "text-center",
                                              children: [
                                                (0, r.jsx)("div", {
                                                  className:
                                                    "bg-white p-6 rounded-lg border-2 border-purple-300 inline-block",
                                                  children: (0, r.jsx)("img", {
                                                    src: "data:image/png;base64,".concat(
                                                      P,
                                                    ),
                                                    alt: "Donation QR Code",
                                                    className:
                                                      "w-64 h-64 mx-auto",
                                                  }),
                                                }),
                                                (0, r.jsxs)("div", {
                                                  className: "mt-4 space-y-3",
                                                  children: [
                                                    U &&
                                                      (0, r.jsx)("a", {
                                                        href: U,
                                                        target: "_blank",
                                                        rel: "noopener noreferrer",
                                                        className:
                                                          "block px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors",
                                                        children:
                                                          "Open Checkout Page",
                                                      }),
                                                    (0, r.jsx)("button", {
                                                      onClick: () => {
                                                        (S(!1), A(null), _());
                                                      },
                                                      className:
                                                        "block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors",
                                                      children: "Close",
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            })
                                          : (0, r.jsxs)(r.Fragment, {
                                              children: [
                                                (0, r.jsxs)("div", {
                                                  className:
                                                    "grid md:grid-cols-2 gap-4",
                                                  children: [
                                                    (0, r.jsxs)("div", {
                                                      children: [
                                                        (0, r.jsx)("label", {
                                                          className:
                                                            "block text-sm font-semibold text-gray-900 mb-2",
                                                          children: "Amount",
                                                        }),
                                                        (0, r.jsxs)("div", {
                                                          className: "relative",
                                                          children: [
                                                            (0, r.jsx)("span", {
                                                              className:
                                                                "absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold",
                                                              children: "$",
                                                            }),
                                                            (0, r.jsx)(
                                                              "input",
                                                              {
                                                                type: "number",
                                                                value: C,
                                                                onChange: (e) =>
                                                                  D(
                                                                    e.target
                                                                      .value,
                                                                  ),
                                                                min: "1",
                                                                step: "0.01",
                                                                className:
                                                                  "w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors",
                                                              },
                                                            ),
                                                          ],
                                                        }),
                                                      ],
                                                    }),
                                                    (0, r.jsxs)("div", {
                                                      children: [
                                                        (0, r.jsx)("label", {
                                                          className:
                                                            "block text-sm font-semibold text-gray-900 mb-2",
                                                          children: "Currency",
                                                        }),
                                                        (0, r.jsxs)("select", {
                                                          value: Z,
                                                          onChange: (e) =>
                                                            L(e.target.value),
                                                          className:
                                                            "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors",
                                                          children: [
                                                            (0, r.jsx)(
                                                              "option",
                                                              {
                                                                value: "USD",
                                                                children: "USD",
                                                              },
                                                            ),
                                                            (0, r.jsx)(
                                                              "option",
                                                              {
                                                                value: "EUR",
                                                                children: "EUR",
                                                              },
                                                            ),
                                                            (0, r.jsx)(
                                                              "option",
                                                              {
                                                                value: "GBP",
                                                                children: "GBP",
                                                              },
                                                            ),
                                                          ],
                                                        }),
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                                (0, r.jsxs)("div", {
                                                  children: [
                                                    (0, r.jsx)("label", {
                                                      className:
                                                        "block text-sm font-semibold text-gray-900 mb-2",
                                                      children:
                                                        "Message (Optional)",
                                                    }),
                                                    (0, r.jsx)("input", {
                                                      type: "text",
                                                      value: M,
                                                      onChange: (e) =>
                                                        R(e.target.value),
                                                      placeholder:
                                                        "Add a personal message",
                                                      className:
                                                        "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors",
                                                    }),
                                                  ],
                                                }),
                                                q &&
                                                  (0, r.jsx)("div", {
                                                    className:
                                                      "bg-red-50 border border-red-300 rounded-lg p-3 text-red-800 text-sm",
                                                    children: q,
                                                  }),
                                                (0, r.jsxs)("div", {
                                                  className: "flex gap-3",
                                                  children: [
                                                    (0, r.jsx)("button", {
                                                      onClick: G,
                                                      disabled: T,
                                                      className:
                                                        "flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors",
                                                      children: T
                                                        ? "Generating..."
                                                        : "Generate QR Code",
                                                    }),
                                                    (0, r.jsx)("button", {
                                                      onClick: () => {
                                                        (S(!1), A(null), F(""));
                                                      },
                                                      className:
                                                        "px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors",
                                                      children: "Cancel",
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                      })
                                    : (0, r.jsxs)("div", {
                                        className: "flex gap-4",
                                        children: [
                                          (0, r.jsxs)("button", {
                                            onClick: () => S(!0),
                                            disabled: !w,
                                            className:
                                              "flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg",
                                            children: [
                                              (0, r.jsx)(u.Z, {
                                                className:
                                                  "w-6 h-6 inline mr-2",
                                              }),
                                              "Generate Donation QR",
                                            ],
                                          }),
                                          (0, r.jsx)("button", {
                                            onClick: I,
                                            disabled: !w || T,
                                            className:
                                              "px-6 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors",
                                            children: "Load Existing QR",
                                          }),
                                        ],
                                      }),
                                ],
                              }),
                              (0, r.jsxs)(i.E.div, {
                                initial: { opacity: 0, y: 20 },
                                animate: { opacity: 1, y: 0 },
                                transition: { delay: 0.2 },
                                className:
                                  "bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100",
                                children: [
                                  (0, r.jsx)("h2", {
                                    className:
                                      "text-2xl font-bold text-gray-900 mb-4",
                                    children: "Donation History",
                                  }),
                                  0 === g.length
                                    ? (0, r.jsx)("p", {
                                        className:
                                          "text-gray-500 text-center py-8",
                                        children: "No donations yet",
                                      })
                                    : (0, r.jsx)("div", {
                                        className: "overflow-x-auto",
                                        children: (0, r.jsxs)("table", {
                                          className: "w-full",
                                          children: [
                                            (0, r.jsx)("thead", {
                                              children: (0, r.jsxs)("tr", {
                                                className:
                                                  "border-b-2 border-gray-200",
                                                children: [
                                                  (0, r.jsx)("th", {
                                                    className:
                                                      "text-left py-3 px-2 text-sm font-semibold text-gray-600",
                                                    children: "Donor",
                                                  }),
                                                  (0, r.jsx)("th", {
                                                    className:
                                                      "text-left py-3 px-2 text-sm font-semibold text-gray-600",
                                                    children: "Amount",
                                                  }),
                                                  (0, r.jsx)("th", {
                                                    className:
                                                      "text-left py-3 px-2 text-sm font-semibold text-gray-600",
                                                    children: "Status",
                                                  }),
                                                  (0, r.jsx)("th", {
                                                    className:
                                                      "text-left py-3 px-2 text-sm font-semibold text-gray-600",
                                                    children: "Date",
                                                  }),
                                                ],
                                              }),
                                            }),
                                            (0, r.jsx)("tbody", {
                                              children: g.map((e) =>
                                                (0, r.jsxs)(
                                                  "tr",
                                                  {
                                                    className:
                                                      "border-b border-gray-100 hover:bg-gray-50",
                                                    children: [
                                                      (0, r.jsxs)("td", {
                                                        className:
                                                          "py-3 px-2 text-sm",
                                                        children: [
                                                          e.donorLastName ||
                                                            "Anonymous",
                                                          e.donorCountry &&
                                                            (0, r.jsxs)(
                                                              "span",
                                                              {
                                                                className:
                                                                  "text-xs text-gray-500 ml-1",
                                                                children: [
                                                                  "(",
                                                                  e.donorCountry,
                                                                  ")",
                                                                ],
                                                              },
                                                            ),
                                                        ],
                                                      }),
                                                      (0, r.jsx)("td", {
                                                        className:
                                                          "py-3 px-2 text-sm font-semibold",
                                                        children: H(
                                                          e.amount,
                                                          e.currency,
                                                        ),
                                                      }),
                                                      (0, r.jsx)("td", {
                                                        className: "py-3 px-2",
                                                        children: (0, r.jsx)(
                                                          "span",
                                                          {
                                                            className:
                                                              "px-2 py-1 rounded-full text-xs font-semibold border ".concat(
                                                                W(e.status),
                                                              ),
                                                            children: e.status,
                                                          },
                                                        ),
                                                      }),
                                                      (0, r.jsx)("td", {
                                                        className:
                                                          "py-3 px-2 text-sm text-gray-600",
                                                        children: Q(
                                                          e.paidAt ||
                                                            e.createdAt,
                                                        ),
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
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              });
      }
    },
    90185: function (e, t, s) {
      "use strict";
      s.d(t, {
        h: function () {
          return a;
        },
      });
      class r {
        async request(e) {
          let t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : {},
            s = "".concat(this.baseUrl).concat(e);
          try {
            let e = await fetch(s, {
                ...t,
                headers: { "Content-Type": "application/json", ...t.headers },
              }),
              r = e.headers.get("content-type"),
              a = null == r ? void 0 : r.includes("application/json");
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
          return this.request("".concat(e).concat(s), { method: "GET" });
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
    46179: function (e, t, s) {
      e.exports = s(85353);
    },
    8361: function (e, t, s) {
      "use strict";
      var r = s(58078);
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
            d: "M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18",
          }),
        );
      });
      t.Z = a;
    },
    26200: function (e, t, s) {
      "use strict";
      var r = s(58078);
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
            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z",
          }),
        );
      });
      t.Z = a;
    },
    54231: function (e, t, s) {
      "use strict";
      var r = s(58078);
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
            d: "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z",
          }),
          r.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z",
          }),
        );
      });
      t.Z = a;
    },
    14270: function (e, t, s) {
      "use strict";
      var r = s(58078);
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
      });
      t.Z = a;
    },
  },
  function (e) {
    (e.O(0, [54, 590, 115, 835, 744], function () {
      return e((e.s = 14577));
    }),
      (_N_E = e.O()));
  },
]);

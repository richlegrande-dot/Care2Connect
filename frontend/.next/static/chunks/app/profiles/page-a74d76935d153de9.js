(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [403],
  {
    32058: function (e, t, r) {
      Promise.resolve().then(r.bind(r, 19868));
    },
    19868: function (e, t, r) {
      "use strict";
      (r.r(t),
        r.d(t, {
          default: function () {
            return g;
          },
        }));
      var a = r(37821),
        s = r(58078),
        o = r(46179),
        i = r(10808),
        n = r(19972),
        l = r(12408),
        c = r(16717),
        d = r(55466);
      let u = s.forwardRef(function ({ title: e, titleId: t, ...r }, a) {
        return s.createElement(
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
            r,
          ),
          e ? s.createElement("title", { id: t }, e) : null,
          s.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
          }),
        );
      });
      var m = r(97485),
        p = r(96871),
        f = r.n(p);
      let h = () => {
        {
          let e = window.location.hostname;
          if ("localhost" === e || "127.0.0.1" === e)
            return "http://localhost:3003";
        }
        return "https://api.care2connects.org";
      };
      function g() {
        let e = (0, o.useRouter)(),
          [t, r] = (0, s.useState)(""),
          [p, g] = (0, s.useState)([]),
          [x, b] = (0, s.useState)(!1),
          [y, v] = (0, s.useState)(!1),
          [w, j] = (0, s.useState)("general"),
          [N, k] = (0, s.useState)(""),
          [E, C] = (0, s.useState)(""),
          [I, D] = (0, s.useState)(""),
          [S, O] = (0, s.useState)(!1),
          A = async () => {
            if (!t.trim()) {
              m.default.error("Please enter a ticket ID to search");
              return;
            }
            b(!0);
            try {
              let e = h(),
                r = await fetch(
                  "".concat(e, "/api/story/").concat(t.trim(), "/status"),
                );
              if (r.ok) {
                let a = await r.json(),
                  s = await fetch(
                    "".concat(e, "/api/profile/").concat(t.trim()),
                  ),
                  o = null;
                (s.ok && (o = await s.json()),
                  g([
                    {
                      id: t.trim(),
                      status: a.status,
                      name: null == o ? void 0 : o.name,
                      location: null == o ? void 0 : o.location,
                      createdAt:
                        (null == o ? void 0 : o.createdAt) ||
                        new Date().toISOString(),
                      updatedAt:
                        (null == o ? void 0 : o.updatedAt) ||
                        new Date().toISOString(),
                      qrCodeUrl: a.assetsReady
                        ? ""
                            .concat(e, "/api/profile/")
                            .concat(t.trim(), "/qrcode.png")
                        : void 0,
                      gofundmeDraftUrl: a.assetsReady
                        ? ""
                            .concat(e, "/api/profile/")
                            .concat(t.trim(), "/gofundme-draft.docx")
                        : void 0,
                      story: null == o ? void 0 : o.story,
                    },
                  ]),
                  m.default.success("Ticket found!"));
              } else if (404 === r.status)
                (m.default.error(
                  "Ticket not found. Please check the ID and try again.",
                ),
                  g([]));
              else throw Error("Failed to search for ticket");
            } catch (e) {
              (console.error("Search error:", e),
                m.default.error("Failed to search. Please try again."),
                g([]));
            } finally {
              b(!1);
            }
          },
          T = (t) => {
            e.push("/profile/".concat(t));
          },
          R = async () => {
            if (!N.trim()) {
              m.default.error("Please enter a message");
              return;
            }
            O(!0);
            try {
              let e = h(),
                t = await fetch("".concat(e, "/api/support/ticket"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ticketId: I.trim() || null,
                    category: w,
                    message: N,
                    contact: E.trim() || null,
                    systemSnapshot: {
                      url: window.location.href,
                      userAgent: navigator.userAgent,
                      timestamp: new Date().toISOString(),
                    },
                  }),
                });
              if (!t.ok) throw Error("Failed to submit support ticket");
              (m.default.success("Support ticket submitted successfully!"),
                j("general"),
                k(""),
                C(""),
                D(""),
                v(!1));
            } catch (e) {
              (console.error("Support ticket error:", e),
                m.default.error(
                  "Failed to submit support ticket. Please try again.",
                ));
            } finally {
              O(!1);
            }
          },
          L = (e) => {
            switch (e) {
              case "COMPLETED":
                return (0, a.jsx)(i.Z, { className: "w-6 h-6 text-green-500" });
              case "FAILED":
                return (0, a.jsx)(n.Z, { className: "w-6 h-6 text-red-500" });
              case "PROCESSING":
              case "TRANSCRIBING":
              case "ANALYZING":
              case "GENERATING_QR":
              case "GENERATING_DOC":
                return (0, a.jsx)(l.Z, {
                  className: "w-6 h-6 text-yellow-500 animate-spin",
                });
              default:
                return (0, a.jsx)(c.Z, { className: "w-6 h-6 text-gray-400" });
            }
          },
          P = (e) =>
            ({
              CREATED: "Created",
              UPLOADING: "Uploading",
              TRANSCRIBING: "Transcribing",
              ANALYZING: "Analyzing",
              GENERATING_QR: "Generating QR Code",
              GENERATING_DOC: "Generating Document",
              COMPLETED: "Completed",
              FAILED: "Failed",
            })[e] || e,
          _ = (e) =>
            new Date(e).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
        return (0, a.jsx)("div", {
          className: "min-h-screen bg-gray-50 py-12",
          children: (0, a.jsxs)("div", {
            className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
            children: [
              (0, a.jsxs)("div", {
                className: "text-center mb-12",
                children: [
                  (0, a.jsx)("h1", {
                    className: "text-4xl font-bold text-gray-900 mb-4",
                    children: "Search Your Profile",
                  }),
                  (0, a.jsx)("p", {
                    className: "text-lg text-gray-600",
                    children:
                      "Enter your ticket ID to find and resume your profile",
                  }),
                ],
              }),
              (0, a.jsxs)("div", {
                className: "bg-white rounded-lg shadow-md p-6 mb-8",
                children: [
                  (0, a.jsxs)("div", {
                    className: "flex gap-4",
                    children: [
                      (0, a.jsxs)("div", {
                        className: "flex-1",
                        children: [
                          (0, a.jsx)("label", {
                            htmlFor: "search",
                            className: "sr-only",
                            children: "Ticket ID",
                          }),
                          (0, a.jsx)("input", {
                            type: "text",
                            id: "search",
                            value: t,
                            onChange: (e) => r(e.target.value),
                            onKeyPress: (e) => "Enter" === e.key && A(),
                            placeholder:
                              "Enter your ticket ID (e.g., abc123-def456-ghi789)",
                            className:
                              "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                          }),
                        ],
                      }),
                      (0, a.jsx)("button", {
                        onClick: A,
                        disabled: x,
                        className:
                          "px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center",
                        children: x
                          ? (0, a.jsxs)(a.Fragment, {
                              children: [
                                (0, a.jsxs)("svg", {
                                  className:
                                    "animate-spin -ml-1 mr-2 h-5 w-5 text-white",
                                  xmlns: "http://www.w3.org/2000/svg",
                                  fill: "none",
                                  viewBox: "0 0 24 24",
                                  children: [
                                    (0, a.jsx)("circle", {
                                      className: "opacity-25",
                                      cx: "12",
                                      cy: "12",
                                      r: "10",
                                      stroke: "currentColor",
                                      strokeWidth: "4",
                                    }),
                                    (0, a.jsx)("path", {
                                      className: "opacity-75",
                                      fill: "currentColor",
                                      d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
                                    }),
                                  ],
                                }),
                                "Searching...",
                              ],
                            })
                          : (0, a.jsxs)(a.Fragment, {
                              children: [
                                (0, a.jsx)(d.Z, { className: "w-5 h-5 mr-2" }),
                                "Search",
                              ],
                            }),
                      }),
                    ],
                  }),
                  (0, a.jsx)("div", {
                    className: "mt-4 text-sm text-gray-500",
                    children: (0, a.jsxs)("p", {
                      children: [
                        (0, a.jsx)("strong", { children: "Tip:" }),
                        " Your ticket ID was provided after you recorded your story. Check your email or notes.",
                      ],
                    }),
                  }),
                ],
              }),
              p.length > 0 &&
                (0, a.jsxs)("div", {
                  className: "space-y-4 mb-8",
                  children: [
                    (0, a.jsx)("h2", {
                      className: "text-2xl font-bold text-gray-900",
                      children: "Results",
                    }),
                    p.map((e) =>
                      (0, a.jsx)(
                        "div",
                        {
                          className: "bg-white rounded-lg shadow-md p-6",
                          children: (0, a.jsxs)("div", {
                            className: "flex items-start justify-between",
                            children: [
                              (0, a.jsxs)("div", {
                                className: "flex-1",
                                children: [
                                  (0, a.jsxs)("div", {
                                    className: "flex items-center gap-3 mb-2",
                                    children: [
                                      L(e.status),
                                      (0, a.jsx)("h3", {
                                        className:
                                          "text-xl font-semibold text-gray-900",
                                        children: e.name || "Anonymous User",
                                      }),
                                    ],
                                  }),
                                  (0, a.jsxs)("div", {
                                    className:
                                      "space-y-1 text-sm text-gray-600 mb-4",
                                    children: [
                                      (0, a.jsxs)("p", {
                                        children: [
                                          (0, a.jsx)("strong", {
                                            children: "Ticket ID:",
                                          }),
                                          " ",
                                          (0, a.jsx)("code", {
                                            className:
                                              "bg-gray-100 px-2 py-1 rounded",
                                            children: e.id,
                                          }),
                                        ],
                                      }),
                                      e.location &&
                                        (0, a.jsxs)("p", {
                                          children: [
                                            (0, a.jsx)("strong", {
                                              children: "Location:",
                                            }),
                                            " ",
                                            e.location,
                                          ],
                                        }),
                                      (0, a.jsxs)("p", {
                                        children: [
                                          (0, a.jsx)("strong", {
                                            children: "Status:",
                                          }),
                                          " ",
                                          (0, a.jsx)("span", {
                                            className: "font-medium ".concat(
                                              "COMPLETED" === e.status
                                                ? "text-green-600"
                                                : "FAILED" === e.status
                                                  ? "text-red-600"
                                                  : "text-yellow-600",
                                            ),
                                            children: P(e.status),
                                          }),
                                        ],
                                      }),
                                      (0, a.jsxs)("p", {
                                        children: [
                                          (0, a.jsx)("strong", {
                                            children: "Created:",
                                          }),
                                          " ",
                                          _(e.createdAt),
                                        ],
                                      }),
                                      (0, a.jsxs)("p", {
                                        children: [
                                          (0, a.jsx)("strong", {
                                            children: "Last Updated:",
                                          }),
                                          " ",
                                          _(e.updatedAt),
                                        ],
                                      }),
                                    ],
                                  }),
                                  "COMPLETED" === e.status &&
                                    (0, a.jsxs)("div", {
                                      className: "flex gap-2 mb-4 text-sm",
                                      children: [
                                        e.qrCodeUrl &&
                                          (0, a.jsxs)("span", {
                                            className:
                                              "inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full",
                                            children: [
                                              (0, a.jsx)(i.Z, {
                                                className: "w-4 h-4 mr-1",
                                              }),
                                              "QR Code Ready",
                                            ],
                                          }),
                                        e.gofundmeDraftUrl &&
                                          (0, a.jsxs)("span", {
                                            className:
                                              "inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full",
                                            children: [
                                              (0, a.jsx)(i.Z, {
                                                className: "w-4 h-4 mr-1",
                                              }),
                                              "Document Ready",
                                            ],
                                          }),
                                        e.story &&
                                          (0, a.jsxs)("span", {
                                            className:
                                              "inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full",
                                            children: [
                                              (0, a.jsx)(i.Z, {
                                                className: "w-4 h-4 mr-1",
                                              }),
                                              "Transcript Available",
                                            ],
                                          }),
                                      ],
                                    }),
                                ],
                              }),
                              (0, a.jsx)("div", {
                                className: "ml-4",
                                children: (0, a.jsx)("button", {
                                  onClick: () => T(e.id),
                                  className:
                                    "px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition",
                                  children: "Resume",
                                }),
                              }),
                            ],
                          }),
                        },
                        e.id,
                      ),
                    ),
                  ],
                }),
              t &&
                0 === p.length &&
                !x &&
                (0, a.jsxs)("div", {
                  className: "text-center py-12",
                  children: [
                    (0, a.jsx)(u, {
                      className: "w-16 h-16 text-gray-400 mx-auto mb-4",
                    }),
                    (0, a.jsx)("h3", {
                      className: "text-xl font-semibold text-gray-900 mb-2",
                      children: "No profile found",
                    }),
                    (0, a.jsx)("p", {
                      className: "text-gray-600 mb-6",
                      children:
                        "We couldn't find a profile with that ticket ID. Please check the ID and try again.",
                    }),
                    (0, a.jsx)(f(), {
                      href: "/tell-your-story",
                      className:
                        "inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition",
                      children: "Create a New Profile",
                    }),
                  ],
                }),
              (0, a.jsxs)("div", {
                className: "bg-white rounded-lg shadow-md p-6 mt-12",
                children: [
                  (0, a.jsxs)("div", {
                    className: "flex items-start justify-between mb-4",
                    children: [
                      (0, a.jsxs)("div", {
                        children: [
                          (0, a.jsx)("h2", {
                            className: "text-2xl font-bold text-gray-900 mb-2",
                            children: "Need Help?",
                          }),
                          (0, a.jsx)("p", {
                            className: "text-gray-600",
                            children:
                              "Having trouble finding your profile or experiencing issues? Submit a support ticket.",
                          }),
                        ],
                      }),
                      !y &&
                        (0, a.jsx)("button", {
                          onClick: () => v(!0),
                          className:
                            "px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition",
                          children: "Get Support",
                        }),
                    ],
                  }),
                  y &&
                    (0, a.jsxs)("div", {
                      className: "mt-6 space-y-4 border-t pt-6",
                      children: [
                        (0, a.jsxs)("div", {
                          children: [
                            (0, a.jsx)("label", {
                              htmlFor: "support-ticket-id",
                              className:
                                "block text-sm font-medium text-gray-700 mb-1",
                              children: "Your Ticket ID (Optional)",
                            }),
                            (0, a.jsx)("input", {
                              type: "text",
                              id: "support-ticket-id",
                              value: I,
                              onChange: (e) => D(e.target.value),
                              placeholder: "If you have one",
                              className:
                                "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          children: [
                            (0, a.jsx)("label", {
                              htmlFor: "support-category",
                              className:
                                "block text-sm font-medium text-gray-700 mb-1",
                              children: "Issue Category",
                            }),
                            (0, a.jsxs)("select", {
                              id: "support-category",
                              value: w,
                              onChange: (e) => j(e.target.value),
                              className:
                                "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
                              children: [
                                (0, a.jsx)("option", {
                                  value: "general",
                                  children: "General Question",
                                }),
                                (0, a.jsx)("option", {
                                  value: "cannot-find-profile",
                                  children: "Can't Find My Profile",
                                }),
                                (0, a.jsx)("option", {
                                  value: "processing-stuck",
                                  children: "Processing Stuck/Failed",
                                }),
                                (0, a.jsx)("option", {
                                  value: "missing-assets",
                                  children: "Missing QR Code or Document",
                                }),
                                (0, a.jsx)("option", {
                                  value: "technical-issue",
                                  children: "Technical Issue",
                                }),
                                (0, a.jsx)("option", {
                                  value: "other",
                                  children: "Other",
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          children: [
                            (0, a.jsxs)("label", {
                              htmlFor: "support-message",
                              className:
                                "block text-sm font-medium text-gray-700 mb-1",
                              children: [
                                "Message ",
                                (0, a.jsx)("span", {
                                  className: "text-red-500",
                                  children: "*",
                                }),
                              ],
                            }),
                            (0, a.jsx)("textarea", {
                              id: "support-message",
                              value: N,
                              onChange: (e) => k(e.target.value),
                              rows: 4,
                              placeholder: "Please describe your issue...",
                              className:
                                "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          children: [
                            (0, a.jsx)("label", {
                              htmlFor: "support-contact",
                              className:
                                "block text-sm font-medium text-gray-700 mb-1",
                              children: "Contact (Email or Phone) (Optional)",
                            }),
                            (0, a.jsx)("input", {
                              type: "text",
                              id: "support-contact",
                              value: E,
                              onChange: (e) => C(e.target.value),
                              placeholder: "How can we reach you?",
                              className:
                                "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
                            }),
                          ],
                        }),
                        (0, a.jsxs)("div", {
                          className: "flex gap-3",
                          children: [
                            (0, a.jsx)("button", {
                              onClick: R,
                              disabled: S,
                              className:
                                "px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition",
                              children: S ? "Submitting..." : "Submit Ticket",
                            }),
                            (0, a.jsx)("button", {
                              onClick: () => v(!1),
                              className:
                                "px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition",
                              children: "Cancel",
                            }),
                          ],
                        }),
                      ],
                    }),
                ],
              }),
              (0, a.jsx)("div", {
                className: "mt-8 text-center",
                children: (0, a.jsx)(f(), {
                  href: "/",
                  className: "text-blue-600 hover:text-blue-700 font-medium",
                  children: "← Back to Home",
                }),
              }),
            ],
          }),
        });
      }
    },
    8489: function (e, t, r) {
      "use strict";
      var a = r(58078),
        s = Symbol.for("react.element"),
        o = Symbol.for("react.fragment"),
        i = Object.prototype.hasOwnProperty,
        n =
          a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
            .ReactCurrentOwner,
        l = { key: !0, ref: !0, __self: !0, __source: !0 };
      function c(e, t, r) {
        var a,
          o = {},
          c = null,
          d = null;
        for (a in (void 0 !== r && (c = "" + r),
        void 0 !== t.key && (c = "" + t.key),
        void 0 !== t.ref && (d = t.ref),
        t))
          i.call(t, a) && !l.hasOwnProperty(a) && (o[a] = t[a]);
        if (e && e.defaultProps)
          for (a in (t = e.defaultProps)) void 0 === o[a] && (o[a] = t[a]);
        return {
          $$typeof: s,
          type: e,
          key: c,
          ref: d,
          props: o,
          _owner: n.current,
        };
      }
      ((t.Fragment = o), (t.jsx = c), (t.jsxs = c));
    },
    37821: function (e, t, r) {
      "use strict";
      e.exports = r(8489);
    },
    96871: function (e, t, r) {
      e.exports = r(92054);
    },
    46179: function (e, t, r) {
      e.exports = r(85353);
    },
    10808: function (e, t, r) {
      "use strict";
      var a = r(58078);
      let s = a.forwardRef(function ({ title: e, titleId: t, ...r }, s) {
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
              ref: s,
              "aria-labelledby": t,
            },
            r,
          ),
          e ? a.createElement("title", { id: t }, e) : null,
          a.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
          }),
        );
      });
      t.Z = s;
    },
    12408: function (e, t, r) {
      "use strict";
      var a = r(58078);
      let s = a.forwardRef(function ({ title: e, titleId: t, ...r }, s) {
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
              ref: s,
              "aria-labelledby": t,
            },
            r,
          ),
          e ? a.createElement("title", { id: t }, e) : null,
          a.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
          }),
        );
      });
      t.Z = s;
    },
    55466: function (e, t, r) {
      "use strict";
      var a = r(58078);
      let s = a.forwardRef(function ({ title: e, titleId: t, ...r }, s) {
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
              ref: s,
              "aria-labelledby": t,
            },
            r,
          ),
          e ? a.createElement("title", { id: t }, e) : null,
          a.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
          }),
        );
      });
      t.Z = s;
    },
    16717: function (e, t, r) {
      "use strict";
      var a = r(58078);
      let s = a.forwardRef(function ({ title: e, titleId: t, ...r }, s) {
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
              ref: s,
              "aria-labelledby": t,
            },
            r,
          ),
          e ? a.createElement("title", { id: t }, e) : null,
          a.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z",
          }),
        );
      });
      t.Z = s;
    },
    19972: function (e, t, r) {
      "use strict";
      var a = r(58078);
      let s = a.forwardRef(function ({ title: e, titleId: t, ...r }, s) {
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
              ref: s,
              "aria-labelledby": t,
            },
            r,
          ),
          e ? a.createElement("title", { id: t }, e) : null,
          a.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
          }),
        );
      });
      t.Z = s;
    },
    97485: function (e, t, r) {
      "use strict";
      let a, s;
      (r.r(t),
        r.d(t, {
          CheckmarkIcon: function () {
            return J;
          },
          ErrorIcon: function () {
            return W;
          },
          LoaderIcon: function () {
            return Q;
          },
          ToastBar: function () {
            return el;
          },
          ToastIcon: function () {
            return er;
          },
          Toaster: function () {
            return em;
          },
          default: function () {
            return ep;
          },
          resolveValue: function () {
            return k;
          },
          toast: function () {
            return $;
          },
          useToaster: function () {
            return z;
          },
          useToasterStore: function () {
            return F;
          },
        }));
      var o,
        i = r(58078);
      let n = { data: "" },
        l = (e) => {
          if ("object" == typeof window) {
            let t =
              (e ? e.querySelector("#_goober") : window._goober) ||
              Object.assign(document.createElement("style"), {
                innerHTML: " ",
                id: "_goober",
              });
            return (
              (t.nonce = window.__nonce__),
              t.parentNode || (e || document.head).appendChild(t),
              t.firstChild
            );
          }
          return e || n;
        },
        c = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,
        d = /\/\*[^]*?\*\/|  +/g,
        u = /\n+/g,
        m = (e, t) => {
          let r = "",
            a = "",
            s = "";
          for (let o in e) {
            let i = e[o];
            "@" == o[0]
              ? "i" == o[1]
                ? (r = o + " " + i + ";")
                : (a +=
                    "f" == o[1]
                      ? m(i, o)
                      : o + "{" + m(i, "k" == o[1] ? "" : t) + "}")
              : "object" == typeof i
                ? (a += m(
                    i,
                    t
                      ? t.replace(/([^,])+/g, (e) =>
                          o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g, (t) =>
                            /&/.test(t)
                              ? t.replace(/&/g, e)
                              : e
                                ? e + " " + t
                                : t,
                          ),
                        )
                      : o,
                  ))
                : null != i &&
                  ((o = /^--/.test(o)
                    ? o
                    : o.replace(/[A-Z]/g, "-$&").toLowerCase()),
                  (s += m.p ? m.p(o, i) : o + ":" + i + ";"));
          }
          return r + (t && s ? t + "{" + s + "}" : s) + a;
        },
        p = {},
        f = (e) => {
          if ("object" == typeof e) {
            let t = "";
            for (let r in e) t += r + f(e[r]);
            return t;
          }
          return e;
        },
        h = (e, t, r, a, s) => {
          var o;
          let i = f(e),
            n =
              p[i] ||
              (p[i] = ((e) => {
                let t = 0,
                  r = 11;
                for (; t < e.length; ) r = (101 * r + e.charCodeAt(t++)) >>> 0;
                return "go" + r;
              })(i));
          if (!p[n]) {
            let t =
              i !== e
                ? e
                : ((e) => {
                    let t,
                      r,
                      a = [{}];
                    for (; (t = c.exec(e.replace(d, ""))); )
                      t[4]
                        ? a.shift()
                        : t[3]
                          ? ((r = t[3].replace(u, " ").trim()),
                            a.unshift((a[0][r] = a[0][r] || {})))
                          : (a[0][t[1]] = t[2].replace(u, " ").trim());
                    return a[0];
                  })(e);
            p[n] = m(s ? { ["@keyframes " + n]: t } : t, r ? "" : "." + n);
          }
          let l = r && p.g ? p.g : null;
          return (
            r && (p.g = p[n]),
            (o = p[n]),
            l
              ? (t.data = t.data.replace(l, o))
              : -1 === t.data.indexOf(o) &&
                (t.data = a ? o + t.data : t.data + o),
            n
          );
        },
        g = (e, t, r) =>
          e.reduce((e, a, s) => {
            let o = t[s];
            if (o && o.call) {
              let e = o(r),
                t = (e && e.props && e.props.className) || (/^go/.test(e) && e);
              o = t
                ? "." + t
                : e && "object" == typeof e
                  ? e.props
                    ? ""
                    : m(e, "")
                  : !1 === e
                    ? ""
                    : e;
            }
            return e + a + (null == o ? "" : o);
          }, "");
      function x(e) {
        let t = this || {},
          r = e.call ? e(t.p) : e;
        return h(
          r.unshift
            ? r.raw
              ? g(r, [].slice.call(arguments, 1), t.p)
              : r.reduce(
                  (e, r) => Object.assign(e, r && r.call ? r(t.p) : r),
                  {},
                )
            : r,
          l(t.target),
          t.g,
          t.o,
          t.k,
        );
      }
      x.bind({ g: 1 });
      let b,
        y,
        v,
        w = x.bind({ k: 1 });
      function j(e, t) {
        let r = this || {};
        return function () {
          let a = arguments;
          function s(o, i) {
            let n = Object.assign({}, o),
              l = n.className || s.className;
            ((r.p = Object.assign({ theme: y && y() }, n)),
              (r.o = / *go\d+/.test(l)),
              (n.className = x.apply(r, a) + (l ? " " + l : "")),
              t && (n.ref = i));
            let c = e;
            return (
              e[0] && ((c = n.as || e), delete n.as),
              v && c[0] && v(n),
              b(c, n)
            );
          }
          return t ? t(s) : s;
        };
      }
      var N = (e) => "function" == typeof e,
        k = (e, t) => (N(e) ? e(t) : e),
        E = ((a = 0), () => (++a).toString()),
        C = () => {
          if (void 0 === s && "u" > typeof window) {
            let e = matchMedia("(prefers-reduced-motion: reduce)");
            s = !e || e.matches;
          }
          return s;
        },
        I = "default",
        D = (e, t) => {
          let { toastLimit: r } = e.settings;
          switch (t.type) {
            case 0:
              return { ...e, toasts: [t.toast, ...e.toasts].slice(0, r) };
            case 1:
              return {
                ...e,
                toasts: e.toasts.map((e) =>
                  e.id === t.toast.id ? { ...e, ...t.toast } : e,
                ),
              };
            case 2:
              let { toast: a } = t;
              return D(e, {
                type: e.toasts.find((e) => e.id === a.id) ? 1 : 0,
                toast: a,
              });
            case 3:
              let { toastId: s } = t;
              return {
                ...e,
                toasts: e.toasts.map((e) =>
                  e.id === s || void 0 === s
                    ? { ...e, dismissed: !0, visible: !1 }
                    : e,
                ),
              };
            case 4:
              return void 0 === t.toastId
                ? { ...e, toasts: [] }
                : { ...e, toasts: e.toasts.filter((e) => e.id !== t.toastId) };
            case 5:
              return { ...e, pausedAt: t.time };
            case 6:
              let o = t.time - (e.pausedAt || 0);
              return {
                ...e,
                pausedAt: void 0,
                toasts: e.toasts.map((e) => ({
                  ...e,
                  pauseDuration: e.pauseDuration + o,
                })),
              };
          }
        },
        S = [],
        O = { toasts: [], pausedAt: void 0, settings: { toastLimit: 20 } },
        A = {},
        T = (e, t = I) => {
          ((A[t] = D(A[t] || O, e)),
            S.forEach(([e, r]) => {
              e === t && r(A[t]);
            }));
        },
        R = (e) => Object.keys(A).forEach((t) => T(e, t)),
        L = (e) =>
          Object.keys(A).find((t) => A[t].toasts.some((t) => t.id === e)),
        P =
          (e = I) =>
          (t) => {
            T(t, e);
          },
        _ = {
          blank: 4e3,
          error: 4e3,
          success: 2e3,
          loading: 1 / 0,
          custom: 4e3,
        },
        F = (e = {}, t = I) => {
          let [r, a] = (0, i.useState)(A[t] || O),
            s = (0, i.useRef)(A[t]);
          (0, i.useEffect)(
            () => (
              s.current !== A[t] && a(A[t]),
              S.push([t, a]),
              () => {
                let e = S.findIndex(([e]) => e === t);
                e > -1 && S.splice(e, 1);
              }
            ),
            [t],
          );
          let o = r.toasts.map((t) => {
            var r, a, s;
            return {
              ...e,
              ...e[t.type],
              ...t,
              removeDelay:
                t.removeDelay ||
                (null == (r = e[t.type]) ? void 0 : r.removeDelay) ||
                (null == e ? void 0 : e.removeDelay),
              duration:
                t.duration ||
                (null == (a = e[t.type]) ? void 0 : a.duration) ||
                (null == e ? void 0 : e.duration) ||
                _[t.type],
              style: {
                ...e.style,
                ...(null == (s = e[t.type]) ? void 0 : s.style),
                ...t.style,
              },
            };
          });
          return { ...r, toasts: o };
        },
        Z = (e, t = "blank", r) => ({
          createdAt: Date.now(),
          visible: !0,
          dismissed: !1,
          type: t,
          ariaProps: { role: "status", "aria-live": "polite" },
          message: e,
          pauseDuration: 0,
          ...r,
          id: (null == r ? void 0 : r.id) || E(),
        }),
        M = (e) => (t, r) => {
          let a = Z(t, e, r);
          return (P(a.toasterId || L(a.id))({ type: 2, toast: a }), a.id);
        },
        $ = (e, t) => M("blank")(e, t);
      (($.error = M("error")),
        ($.success = M("success")),
        ($.loading = M("loading")),
        ($.custom = M("custom")),
        ($.dismiss = (e, t) => {
          let r = { type: 3, toastId: e };
          t ? P(t)(r) : R(r);
        }),
        ($.dismissAll = (e) => $.dismiss(void 0, e)),
        ($.remove = (e, t) => {
          let r = { type: 4, toastId: e };
          t ? P(t)(r) : R(r);
        }),
        ($.removeAll = (e) => $.remove(void 0, e)),
        ($.promise = (e, t, r) => {
          let a = $.loading(t.loading, {
            ...r,
            ...(null == r ? void 0 : r.loading),
          });
          return (
            "function" == typeof e && (e = e()),
            e
              .then((e) => {
                let s = t.success ? k(t.success, e) : void 0;
                return (
                  s
                    ? $.success(s, {
                        id: a,
                        ...r,
                        ...(null == r ? void 0 : r.success),
                      })
                    : $.dismiss(a),
                  e
                );
              })
              .catch((e) => {
                let s = t.error ? k(t.error, e) : void 0;
                s
                  ? $.error(s, {
                      id: a,
                      ...r,
                      ...(null == r ? void 0 : r.error),
                    })
                  : $.dismiss(a);
              }),
            e
          );
        }));
      var G = 1e3,
        z = (e, t = "default") => {
          let { toasts: r, pausedAt: a } = F(e, t),
            s = (0, i.useRef)(new Map()).current,
            o = (0, i.useCallback)((e, t = G) => {
              if (s.has(e)) return;
              let r = setTimeout(() => {
                (s.delete(e), n({ type: 4, toastId: e }));
              }, t);
              s.set(e, r);
            }, []);
          (0, i.useEffect)(() => {
            if (a) return;
            let e = Date.now(),
              s = r.map((r) => {
                if (r.duration === 1 / 0) return;
                let a = (r.duration || 0) + r.pauseDuration - (e - r.createdAt);
                if (a < 0) {
                  r.visible && $.dismiss(r.id);
                  return;
                }
                return setTimeout(() => $.dismiss(r.id, t), a);
              });
            return () => {
              s.forEach((e) => e && clearTimeout(e));
            };
          }, [r, a, t]);
          let n = (0, i.useCallback)(P(t), [t]),
            l = (0, i.useCallback)(() => {
              n({ type: 5, time: Date.now() });
            }, [n]),
            c = (0, i.useCallback)(
              (e, t) => {
                n({ type: 1, toast: { id: e, height: t } });
              },
              [n],
            ),
            d = (0, i.useCallback)(() => {
              a && n({ type: 6, time: Date.now() });
            }, [a, n]),
            u = (0, i.useCallback)(
              (e, t) => {
                let {
                    reverseOrder: a = !1,
                    gutter: s = 8,
                    defaultPosition: o,
                  } = t || {},
                  i = r.filter(
                    (t) => (t.position || o) === (e.position || o) && t.height,
                  ),
                  n = i.findIndex((t) => t.id === e.id),
                  l = i.filter((e, t) => t < n && e.visible).length;
                return i
                  .filter((e) => e.visible)
                  .slice(...(a ? [l + 1] : [0, l]))
                  .reduce((e, t) => e + (t.height || 0) + s, 0);
              },
              [r],
            );
          return (
            (0, i.useEffect)(() => {
              r.forEach((e) => {
                if (e.dismissed) o(e.id, e.removeDelay);
                else {
                  let t = s.get(e.id);
                  t && (clearTimeout(t), s.delete(e.id));
                }
              });
            }, [r, o]),
            {
              toasts: r,
              handlers: {
                updateHeight: c,
                startPause: l,
                endPause: d,
                calculateOffset: u,
              },
            }
          );
        },
        B = w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,
        U = w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,
        H = w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,
        W = j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${(e) => e.primary || "#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${B} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${U} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${(e) => e.secondary || "#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${H} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,
        Y = w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,
        Q = j("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${(e) => e.secondary || "#e0e0e0"};
  border-right-color: ${(e) => e.primary || "#616161"};
  animation: ${Y} 1s linear infinite;
`,
        q = w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,
        V = w`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,
        J = j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${(e) => e.primary || "#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${q} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${V} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${(e) => e.secondary || "#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,
        K = j("div")`
  position: absolute;
`,
        X = j("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,
        ee = w`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,
        et = j("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ee} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,
        er = ({ toast: e }) => {
          let { icon: t, type: r, iconTheme: a } = e;
          return void 0 !== t
            ? "string" == typeof t
              ? i.createElement(et, null, t)
              : t
            : "blank" === r
              ? null
              : i.createElement(
                  X,
                  null,
                  i.createElement(Q, { ...a }),
                  "loading" !== r &&
                    i.createElement(
                      K,
                      null,
                      "error" === r
                        ? i.createElement(W, { ...a })
                        : i.createElement(J, { ...a }),
                    ),
                );
        },
        ea = (e) => `
0% {transform: translate3d(0,${-200 * e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,
        es = (e) => `
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150 * e}%,-1px) scale(.6); opacity:0;}
`,
        eo = j("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,
        ei = j("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,
        en = (e, t) => {
          let r = e.includes("top") ? 1 : -1,
            [a, s] = C()
              ? [
                  "0%{opacity:0;} 100%{opacity:1;}",
                  "0%{opacity:1;} 100%{opacity:0;}",
                ]
              : [ea(r), es(r)];
          return {
            animation: t
              ? `${w(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`
              : `${w(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`,
          };
        },
        el = i.memo(({ toast: e, position: t, style: r, children: a }) => {
          let s = e.height
              ? en(e.position || t || "top-center", e.visible)
              : { opacity: 0 },
            o = i.createElement(er, { toast: e }),
            n = i.createElement(ei, { ...e.ariaProps }, k(e.message, e));
          return i.createElement(
            eo,
            { className: e.className, style: { ...s, ...r, ...e.style } },
            "function" == typeof a
              ? a({ icon: o, message: n })
              : i.createElement(i.Fragment, null, o, n),
          );
        });
      ((o = i.createElement),
        (m.p = void 0),
        (b = o),
        (y = void 0),
        (v = void 0));
      var ec = ({
          id: e,
          className: t,
          style: r,
          onHeightUpdate: a,
          children: s,
        }) => {
          let o = i.useCallback(
            (t) => {
              if (t) {
                let r = () => {
                  a(e, t.getBoundingClientRect().height);
                };
                (r(),
                  new MutationObserver(r).observe(t, {
                    subtree: !0,
                    childList: !0,
                    characterData: !0,
                  }));
              }
            },
            [e, a],
          );
          return i.createElement("div", { ref: o, className: t, style: r }, s);
        },
        ed = (e, t) => {
          let r = e.includes("top"),
            a = e.includes("center")
              ? { justifyContent: "center" }
              : e.includes("right")
                ? { justifyContent: "flex-end" }
                : {};
          return {
            left: 0,
            right: 0,
            display: "flex",
            position: "absolute",
            transition: C() ? void 0 : "all 230ms cubic-bezier(.21,1.02,.73,1)",
            transform: `translateY(${t * (r ? 1 : -1)}px)`,
            ...(r ? { top: 0 } : { bottom: 0 }),
            ...a,
          };
        },
        eu = x`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,
        em = ({
          reverseOrder: e,
          position: t = "top-center",
          toastOptions: r,
          gutter: a,
          children: s,
          toasterId: o,
          containerStyle: n,
          containerClassName: l,
        }) => {
          let { toasts: c, handlers: d } = z(r, o);
          return i.createElement(
            "div",
            {
              "data-rht-toaster": o || "",
              style: {
                position: "fixed",
                zIndex: 9999,
                top: 16,
                left: 16,
                right: 16,
                bottom: 16,
                pointerEvents: "none",
                ...n,
              },
              className: l,
              onMouseEnter: d.startPause,
              onMouseLeave: d.endPause,
            },
            c.map((r) => {
              let o = r.position || t,
                n = ed(
                  o,
                  d.calculateOffset(r, {
                    reverseOrder: e,
                    gutter: a,
                    defaultPosition: t,
                  }),
                );
              return i.createElement(
                ec,
                {
                  id: r.id,
                  key: r.id,
                  onHeightUpdate: d.updateHeight,
                  className: r.visible ? eu : "",
                  style: n,
                },
                "custom" === r.type
                  ? k(r.message, r)
                  : s
                    ? s(r)
                    : i.createElement(el, { toast: r, position: o }),
              );
            }),
          );
        },
        ep = $;
    },
  },
  function (e) {
    (e.O(0, [54, 115, 835, 744], function () {
      return e((e.s = 32058));
    }),
      (_N_E = e.O()));
  },
]);

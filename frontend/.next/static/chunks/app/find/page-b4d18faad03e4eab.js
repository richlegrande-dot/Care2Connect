(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [199],
  {
    9317: function (e, t, a) {
      Promise.resolve().then(a.bind(a, 90141));
    },
    90141: function (e, t, a) {
      "use strict";
      (a.r(t),
        a.d(t, {
          default: function () {
            return h;
          },
        }));
      var r = a(37821),
        s = a(58078),
        i = a(96871),
        l = a.n(i),
        n = a(6384),
        o = a(55466),
        c = a(14270);
      let d = s.forwardRef(function ({ title: e, titleId: t, ...a }, r) {
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
              ref: r,
              "aria-labelledby": t,
            },
            a,
          ),
          e ? s.createElement("title", { id: t }, e) : null,
          s.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
          }),
        );
      });
      var x = a(90185);
      function h() {
        let [e, t] = (0, s.useState)("id"),
          [a, i] = (0, s.useState)(""),
          [h, m] = (0, s.useState)(!1),
          [u, g] = (0, s.useState)([]),
          [b, p] = (0, s.useState)(""),
          [y, f] = (0, s.useState)(!1),
          w = (e) =>
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              e,
            ),
          j = async (t) => {
            (t.preventDefault(), m(!0), p(""), g([]), f(!0));
            try {
              if (!a.trim()) throw Error("Please enter a search value");
              if ("id" === e) {
                if (!w(a.trim()))
                  throw Error(
                    "Invalid ticket ID format. Please enter a valid UUID.",
                  );
                try {
                  let e = await x.h.get("/tickets/".concat(a.trim()));
                  g([e]);
                } catch (e) {
                  if (404 === e.status)
                    throw Error("No ticket found with this ID");
                  throw e;
                }
              } else {
                let t = await x.h.get("/profiles/search", {
                  contact: a.trim(),
                  type: e,
                });
                g(t);
              }
            } catch (e) {
              p(e.message || "Search failed. Please try again.");
            } finally {
              m(!1);
            }
          },
          v = (e) =>
            new Date(e).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          N = (e) =>
            ({
              DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-300",
              PUBLISHED: "bg-green-100 text-green-800 border-green-300",
              PENDING: "bg-blue-100 text-blue-800 border-blue-300",
              CLOSED: "bg-gray-100 text-gray-800 border-gray-300",
            })[e] || "bg-gray-100 text-gray-800 border-gray-300";
        return (0, r.jsxs)("div", {
          className:
            "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50",
          children: [
            (0, r.jsx)("div", {
              className: "bg-white shadow-sm border-b",
              children: (0, r.jsx)("div", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
                children: (0, r.jsxs)(n.E.div, {
                  initial: { opacity: 0, y: -20 },
                  animate: { opacity: 1, y: 0 },
                  className: "text-center",
                  children: [
                    (0, r.jsx)(o.Z, {
                      className: "w-16 h-16 text-indigo-600 mx-auto mb-4",
                    }),
                    (0, r.jsx)("h1", {
                      className: "text-4xl font-black text-gray-900 mb-2",
                      children: "Find a Profile",
                    }),
                    (0, r.jsx)("p", {
                      className: "text-xl text-gray-600",
                      children: "Search for profiles to view or support",
                    }),
                  ],
                }),
              }),
            }),
            (0, r.jsxs)("div", {
              className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
              children: [
                (0, r.jsx)(n.E.div, {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.1 },
                  className:
                    "bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-indigo-100",
                  children: (0, r.jsxs)("form", {
                    onSubmit: j,
                    className: "space-y-6",
                    children: [
                      (0, r.jsxs)("div", {
                        children: [
                          (0, r.jsx)("label", {
                            className:
                              "block text-sm font-semibold text-gray-900 mb-3",
                            children: "Search By",
                          }),
                          (0, r.jsx)("div", {
                            className: "grid grid-cols-3 gap-3",
                            children: [
                              {
                                value: "id",
                                label: "Ticket ID",
                                icon: "\uD83C\uDFAB",
                              },
                              { value: "email", label: "Email", icon: "✉️" },
                              {
                                value: "phone",
                                label: "Phone",
                                icon: "\uD83D\uDCF1",
                              },
                            ].map((a) =>
                              (0, r.jsxs)(
                                "button",
                                {
                                  type: "button",
                                  onClick: () => {
                                    (t(a.value), i(""), g([]), p(""), f(!1));
                                  },
                                  className:
                                    "px-4 py-3 rounded-lg font-semibold transition-all ".concat(
                                      e === a.value
                                        ? "bg-indigo-600 text-white shadow-lg scale-105"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                                    ),
                                  children: [
                                    (0, r.jsx)("span", {
                                      className: "mr-2",
                                      children: a.icon,
                                    }),
                                    a.label,
                                  ],
                                },
                                a.value,
                              ),
                            ),
                          }),
                        ],
                      }),
                      (0, r.jsxs)("div", {
                        children: [
                          (0, r.jsx)("label", {
                            htmlFor: "searchValue",
                            className:
                              "block text-sm font-semibold text-gray-900 mb-2",
                            children:
                              "id" === e
                                ? "Ticket ID"
                                : "email" === e
                                  ? "Email Address"
                                  : "Phone Number",
                          }),
                          (0, r.jsxs)("div", {
                            className: "relative",
                            children: [
                              (0, r.jsx)("input", {
                                type: "text",
                                id: "searchValue",
                                value: a,
                                onChange: (e) => i(e.target.value),
                                placeholder:
                                  "id" === e
                                    ? "e.g., 123e4567-e89b-12d3-a456-426614174000"
                                    : "email" === e
                                      ? "e.g., person@example.com"
                                      : "e.g., +1234567890",
                                className:
                                  "w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors",
                                required: !0,
                              }),
                              (0, r.jsx)(o.Z, {
                                className:
                                  "absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400",
                              }),
                            ],
                          }),
                          "id" === e &&
                            (0, r.jsx)("p", {
                              className: "text-xs text-gray-500 mt-1",
                              children:
                                "Ticket ID is a UUID format (e.g., xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)",
                            }),
                        ],
                      }),
                      (0, r.jsx)("button", {
                        type: "submit",
                        disabled: h,
                        className:
                          "w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl",
                        children: h
                          ? (0, r.jsxs)("span", {
                              className:
                                "flex items-center justify-center gap-2",
                              children: [
                                (0, r.jsxs)("svg", {
                                  className: "animate-spin h-5 w-5",
                                  viewBox: "0 0 24 24",
                                  children: [
                                    (0, r.jsx)("circle", {
                                      className: "opacity-25",
                                      cx: "12",
                                      cy: "12",
                                      r: "10",
                                      stroke: "currentColor",
                                      strokeWidth: "4",
                                      fill: "none",
                                    }),
                                    (0, r.jsx)("path", {
                                      className: "opacity-75",
                                      fill: "currentColor",
                                      d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
                                    }),
                                  ],
                                }),
                                "Searching...",
                              ],
                            })
                          : "Search",
                      }),
                    ],
                  }),
                }),
                b &&
                  (0, r.jsx)(n.E.div, {
                    initial: { opacity: 0, scale: 0.95 },
                    animate: { opacity: 1, scale: 1 },
                    className:
                      "mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4",
                    children: (0, r.jsx)("p", {
                      className: "text-red-800 font-semibold",
                      children: b,
                    }),
                  }),
                y &&
                  !h &&
                  0 === u.length &&
                  !b &&
                  (0, r.jsxs)(n.E.div, {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    className:
                      "text-center py-12 bg-white rounded-xl shadow-md border-2 border-gray-200",
                    children: [
                      (0, r.jsx)(c.Z, {
                        className: "w-16 h-16 text-gray-400 mx-auto mb-4",
                      }),
                      (0, r.jsx)("h3", {
                        className: "text-xl font-bold text-gray-900 mb-2",
                        children: "No Results Found",
                      }),
                      (0, r.jsx)("p", {
                        className: "text-gray-600 mb-4",
                        children: "No profiles match your search criteria",
                      }),
                      (0, r.jsxs)("p", {
                        className: "text-sm text-gray-500",
                        children: [
                          "Try searching with a different ",
                          "id" === e ? "ticket ID" : e,
                        ],
                      }),
                    ],
                  }),
                u.length > 0 &&
                  (0, r.jsxs)(n.E.div, {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    className: "space-y-4",
                    children: [
                      (0, r.jsxs)("h2", {
                        className: "text-2xl font-bold text-gray-900 mb-4",
                        children: [
                          u.length,
                          " ",
                          1 === u.length ? "Profile" : "Profiles",
                          " Found",
                        ],
                      }),
                      u.map((e, t) =>
                        (0, r.jsx)(
                          n.E.div,
                          {
                            initial: { opacity: 0, x: -20 },
                            animate: { opacity: 1, x: 0 },
                            transition: { delay: 0.1 * t },
                            className:
                              "bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all p-6",
                            children: (0, r.jsx)("div", {
                              className: "flex items-start justify-between",
                              children: (0, r.jsxs)("div", {
                                className: "flex-1",
                                children: [
                                  (0, r.jsxs)("div", {
                                    className: "flex items-center gap-3 mb-2",
                                    children: [
                                      (0, r.jsx)(c.Z, {
                                        className: "w-8 h-8 text-indigo-600",
                                      }),
                                      (0, r.jsx)("h3", {
                                        className:
                                          "text-xl font-bold text-gray-900",
                                        children: e.displayName || "Anonymous",
                                      }),
                                      (0, r.jsx)("span", {
                                        className:
                                          "px-3 py-1 rounded-full text-xs font-semibold border ".concat(
                                            N(e.status),
                                          ),
                                        children: e.status,
                                      }),
                                    ],
                                  }),
                                  (0, r.jsxs)("div", {
                                    className:
                                      "flex items-center gap-4 text-sm text-gray-600 mb-4",
                                    children: [
                                      (0, r.jsxs)("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                          (0, r.jsx)(d, {
                                            className: "w-4 h-4",
                                          }),
                                          (0, r.jsxs)("span", {
                                            children: [
                                              "Created ",
                                              v(e.createdAt),
                                            ],
                                          }),
                                        ],
                                      }),
                                      (0, r.jsxs)("div", {
                                        className:
                                          "font-mono text-xs text-gray-500",
                                        children: [
                                          "ID: ",
                                          e.id.slice(0, 8),
                                          "...",
                                        ],
                                      }),
                                    ],
                                  }),
                                  (0, r.jsxs)(l(), {
                                    href: "/profile/".concat(e.id),
                                    className:
                                      "inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors",
                                    children: [
                                      "View Profile",
                                      (0, r.jsx)("svg", {
                                        className: "w-4 h-4",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        children: (0, r.jsx)("path", {
                                          strokeLinecap: "round",
                                          strokeLinejoin: "round",
                                          strokeWidth: 2,
                                          d: "M9 5l7 7-7 7",
                                        }),
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            }),
                          },
                          e.id,
                        ),
                      ),
                    ],
                  }),
                (0, r.jsxs)(n.E.div, {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { delay: 0.4 },
                  className:
                    "mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-200",
                  children: [
                    (0, r.jsx)("h3", {
                      className:
                        "font-bold text-gray-900 mb-4 text-center text-xl",
                      children: "Need Help Finding Someone?",
                    }),
                    (0, r.jsxs)("div", {
                      className: "grid md:grid-cols-2 gap-4 text-sm",
                      children: [
                        (0, r.jsxs)("div", {
                          className:
                            "bg-white rounded-lg p-4 border border-blue-200",
                          children: [
                            (0, r.jsx)("h4", {
                              className: "font-semibold text-gray-900 mb-2",
                              children: "Search by Ticket ID",
                            }),
                            (0, r.jsx)("p", {
                              className: "text-gray-600",
                              children:
                                "If you have the exact ticket ID (UUID format), you can search directly for that profile",
                            }),
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          className:
                            "bg-white rounded-lg p-4 border border-purple-200",
                          children: [
                            (0, r.jsx)("h4", {
                              className: "font-semibold text-gray-900 mb-2",
                              children: "Search by Contact",
                            }),
                            (0, r.jsx)("p", {
                              className: "text-gray-600",
                              children:
                                "Search by email or phone number to find profiles associated with that contact information",
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, r.jsx)("div", {
                      className: "mt-4 text-center",
                      children: (0, r.jsx)(l(), {
                        href: "/support",
                        className:
                          "text-indigo-600 hover:underline font-semibold",
                        children:
                          "Still can't find who you're looking for? Contact support",
                      }),
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
    },
    90185: function (e, t, a) {
      "use strict";
      a.d(t, {
        h: function () {
          return s;
        },
      });
      class r {
        async request(e) {
          let t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : {},
            a = "".concat(this.baseUrl).concat(e);
          try {
            let e = await fetch(a, {
                ...t,
                headers: { "Content-Type": "application/json", ...t.headers },
              }),
              r = e.headers.get("content-type"),
              s = null == r ? void 0 : r.includes("application/json");
            if (!e.ok) {
              let t = Error(s ? (await e.json()).error : e.statusText);
              throw ((t.status = e.status), t);
            }
            return s ? await e.json() : await e.text();
          } catch (e) {
            throw (e.status || (e.status = 0), e);
          }
        }
        async get(e, t) {
          let a = t ? "?" + new URLSearchParams(t).toString() : "";
          return this.request("".concat(e).concat(a), { method: "GET" });
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
      let s = new r();
    },
    55466: function (e, t, a) {
      "use strict";
      var r = a(58078);
      let s = r.forwardRef(function ({ title: e, titleId: t, ...a }, s) {
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
              ref: s,
              "aria-labelledby": t,
            },
            a,
          ),
          e ? r.createElement("title", { id: t }, e) : null,
          r.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
          }),
        );
      });
      t.Z = s;
    },
    14270: function (e, t, a) {
      "use strict";
      var r = a(58078);
      let s = r.forwardRef(function ({ title: e, titleId: t, ...a }, s) {
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
              ref: s,
              "aria-labelledby": t,
            },
            a,
          ),
          e ? r.createElement("title", { id: t }, e) : null,
          r.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
          }),
        );
      });
      t.Z = s;
    },
  },
  function (e) {
    (e.O(0, [54, 590, 115, 835, 744], function () {
      return e((e.s = 9317));
    }),
      (_N_E = e.O()));
  },
]);

(() => {
  var e = {};
  ((e.id = 810),
    (e.ids = [810]),
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
      39491: (e) => {
        "use strict";
        e.exports = require("assert");
      },
      14300: (e) => {
        "use strict";
        e.exports = require("buffer");
      },
      57147: (e) => {
        "use strict";
        e.exports = require("fs");
      },
      12781: (e) => {
        "use strict";
        e.exports = require("stream");
      },
      73837: (e) => {
        "use strict";
        e.exports = require("util");
      },
      59796: (e) => {
        "use strict";
        e.exports = require("zlib");
      },
      58515: (e, t, r) => {
        "use strict";
        (r.r(t),
          r.d(t, {
            GlobalError: () => o.a,
            __next_app__: () => u,
            originalPathname: () => h,
            pages: () => c,
            routeModule: () => f,
            tree: () => d,
          }));
        var s = r(36577),
          i = r(55533),
          n = r(40443),
          o = r.n(n),
          a = r(53320),
          l = {};
        for (let e in a)
          0 >
            [
              "default",
              "tree",
              "pages",
              "GlobalError",
              "originalPathname",
              "__next_app__",
              "routeModule",
            ].indexOf(e) && (l[e] = () => a[e]);
        r.d(t, l);
        let d = [
            "",
            {
              children: [
                "funding-setup",
                {
                  children: [
                    "[clientId]",
                    {
                      children: [
                        "__PAGE__",
                        {},
                        {
                          page: [
                            () => Promise.resolve().then(r.bind(r, 91551)),
                            "C:\\Users\\richl\\Care2system\\frontend\\app\\funding-setup\\[clientId]\\page.tsx",
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
            {
              layout: [
                () => Promise.resolve().then(r.bind(r, 18685)),
                "C:\\Users\\richl\\Care2system\\frontend\\app\\layout.tsx",
              ],
              "not-found": [
                () => Promise.resolve().then(r.t.bind(r, 31459, 23)),
                "next/dist/client/components/not-found-error",
              ],
            },
          ],
          c = [
            "C:\\Users\\richl\\Care2system\\frontend\\app\\funding-setup\\[clientId]\\page.tsx",
          ],
          h = "/funding-setup/[clientId]/page",
          u = { require: r, loadChunk: () => Promise.resolve() },
          f = new s.AppPageRouteModule({
            definition: {
              kind: i.x.APP_PAGE,
              page: "/funding-setup/[clientId]/page",
              pathname: "/funding-setup/[clientId]",
              bundlePath: "",
              filename: "",
              appPaths: [],
            },
            userland: { loaderTree: d },
          });
      },
      63043: (e, t, r) => {
        Promise.resolve().then(r.bind(r, 67337));
      },
      20717: (e, t, r) => {
        (Promise.resolve().then(r.bind(r, 56253)),
          Promise.resolve().then(r.bind(r, 9690)),
          Promise.resolve().then(r.bind(r, 33999)));
      },
      19191: (e, t, r) => {
        (Promise.resolve().then(r.t.bind(r, 28913, 23)),
          Promise.resolve().then(r.t.bind(r, 50409, 23)),
          Promise.resolve().then(r.t.bind(r, 75054, 23)),
          Promise.resolve().then(r.t.bind(r, 34892, 23)),
          Promise.resolve().then(r.t.bind(r, 80356, 23)),
          Promise.resolve().then(r.t.bind(r, 73559, 23)));
      },
      67337: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { default: () => R }));
        var s = r(73658),
          i = r(55459),
          n = r.n(i),
          o = r(32241),
          a = r(81165),
          l = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let d = (0, l.Z)("HelpCircle", [
          ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
          [
            "path",
            { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" },
          ],
          ["path", { d: "M12 17h.01", key: "p32p05" }],
        ]);
        var c = r(40289);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let h = (0, l.Z)("Info", [
          ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
          ["path", { d: "M12 16v-4", key: "1dtifu" }],
          ["path", { d: "M12 8h.01", key: "e9boi3" }],
        ]);
        function u({ data: e, onComplete: t, onBack: r, onHelp: n }) {
          let [o, l] = (0, i.useState)({
              fullName: e.fullName || e.extractedFields?.name?.value || "",
              zipCode: e.zipCode || "",
              dateOfBirth: e.dateOfBirth || "",
              email: e.email || "",
              phone: e.phone || "",
              consent: e.consent || !1,
            }),
            [d, u] = (0, i.useState)({}),
            [f, p] = (0, i.useState)(!1);
          (0, i.useEffect)(() => {
            e.missingFields && e.missingFields.length > 0 && p(!0);
          }, [e.missingFields]);
          let m = (e, t) => {
              switch (e) {
                case "fullName":
                  if (!t || t.trim().length < 2)
                    return "Full name is required (at least 2 characters)";
                  break;
                case "zipCode":
                  if (!t || !/^\d{5}$/.test(t))
                    return "Valid 5-digit ZIP code is required";
                  break;
                case "dateOfBirth":
                  if (!t) return "Date of birth is required";
                  let r = g(t);
                  if (r < 18) return "Must be at least 18 years old";
                  break;
                case "email":
                  if (t && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t))
                    return "Invalid email format";
                  break;
                case "phone":
                  if (t && !/^\d{10}$/.test(t.replace(/\D/g, "")))
                    return "Phone must be 10 digits";
                  break;
                case "consent":
                  if (!t) return "You must agree to proceed";
              }
              return "";
            },
            g = (e) => {
              let t = new Date(),
                r = new Date(e),
                s = t.getFullYear() - r.getFullYear(),
                i = t.getMonth() - r.getMonth();
              return (
                (i < 0 || (0 === i && t.getDate() < r.getDate())) && s--,
                s
              );
            },
            x = (e, t) => {
              (l((r) => ({ ...r, [e]: t })),
                d[e] &&
                  u((t) => {
                    let r = { ...t };
                    return (delete r[e], r);
                  }));
            },
            b = (e) => {
              let t = m(e, o[e]);
              t && u((r) => ({ ...r, [e]: t }));
            },
            y = () => {
              let e = {};
              if (
                (["fullName", "zipCode", "dateOfBirth", "consent"].forEach(
                  (t) => {
                    let r = m(t, o[t]);
                    r && (e[t] = r);
                  },
                ),
                o.email)
              ) {
                let t = m("email", o.email);
                t && (e.email = t);
              }
              if (o.phone) {
                let t = m("phone", o.phone);
                t && (e.phone = t);
              }
              return (u(e), 0 === Object.keys(e).length);
            },
            w = (t) => {
              let r = e.extractedFields?.[t];
              if (!r) return null;
              let i = r.confidence || 0,
                n = "gray",
                o = "Unknown";
              return (
                i >= 0.85
                  ? ((n = "green"), (o = "High confidence"))
                  : i >= 0.6
                    ? ((n = "yellow"), (o = "Medium confidence"))
                    : ((n = "red"), (o = "Low confidence")),
                s.jsx("span", {
                  className: `ml-2 px-2 py-1 text-xs rounded bg-${n}-100 text-${n}-700 border border-${n}-200`,
                  children: o,
                })
              );
            };
          return (0, s.jsxs)("form", {
            onSubmit: (e) => {
              if ((e.preventDefault(), y())) t(o);
              else {
                let e = Object.keys(d)[0],
                  t = document.getElementById(`field-${e}`);
                t && t.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            },
            className: "space-y-6",
            children: [
              (0, s.jsxs)("div", {
                children: [
                  s.jsx("h2", {
                    className: "text-xl font-semibold text-gray-900 mb-2",
                    children: "Confirm Your Details",
                  }),
                  s.jsx("p", {
                    className: "text-gray-600",
                    children:
                      "Review and complete the information we extracted from your recording. Required fields are marked with *.",
                  }),
                ],
              }),
              e.missingFields &&
                e.missingFields.length > 0 &&
                (0, s.jsxs)("div", {
                  className:
                    "bg-yellow-50 border border-yellow-200 rounded-lg p-4",
                  children: [
                    (0, s.jsxs)("div", {
                      className: "flex items-start",
                      children: [
                        s.jsx(c.Z, {
                          className:
                            "w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5",
                        }),
                        (0, s.jsxs)("div", {
                          className: "flex-1",
                          children: [
                            s.jsx("h3", {
                              className:
                                "text-sm font-medium text-yellow-800 mb-2",
                              children: "Missing Information Detected",
                            }),
                            s.jsx("p", {
                              className: "text-sm text-yellow-700 mb-3",
                              children:
                                "We couldn't extract all required information from your recording. Please provide the following:",
                            }),
                            s.jsx("ul", {
                              className:
                                "list-disc list-inside text-sm text-yellow-700 space-y-1",
                              children: e.missingFields.map((e, t) =>
                                s.jsx("li", { children: e }, t),
                              ),
                            }),
                            e.followUpQuestions &&
                              e.followUpQuestions.length > 0 &&
                              (0, s.jsxs)("button", {
                                type: "button",
                                onClick: () => p(!f),
                                className:
                                  "mt-3 text-sm text-yellow-800 underline hover:text-yellow-900",
                                children: [
                                  f ? "Hide" : "Show",
                                  " follow-up questions",
                                ],
                              }),
                          ],
                        }),
                      ],
                    }),
                    f &&
                      e.followUpQuestions &&
                      s.jsx("div", {
                        className: "mt-4 pl-8 space-y-2",
                        children: e.followUpQuestions.map((e, t) =>
                          (0, s.jsxs)(
                            "div",
                            {
                              className:
                                "flex items-start text-sm text-yellow-700",
                              children: [
                                s.jsx("span", {
                                  className: "mr-2",
                                  children: "•",
                                }),
                                s.jsx("span", { children: e }),
                              ],
                            },
                            t,
                          ),
                        ),
                      }),
                  ],
                }),
              (0, s.jsxs)("div", {
                className: "space-y-4",
                children: [
                  (0, s.jsxs)("div", {
                    id: "field-fullName",
                    children: [
                      (0, s.jsxs)("label", {
                        className:
                          "block text-sm font-medium text-gray-700 mb-1",
                        children: [
                          "Full Name ",
                          s.jsx("span", {
                            className: "text-red-500",
                            children: "*",
                          }),
                          w("name"),
                        ],
                      }),
                      s.jsx("input", {
                        type: "text",
                        value: o.fullName,
                        onChange: (e) => x("fullName", e.target.value),
                        onBlur: () => b("fullName"),
                        className: `
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${d.fullName ? "border-red-500" : "border-gray-300"}
            `,
                        placeholder: "John Smith",
                      }),
                      d.fullName &&
                        (0, s.jsxs)("p", {
                          className:
                            "mt-1 text-sm text-red-600 flex items-center",
                          children: [
                            s.jsx(c.Z, { className: "w-4 h-4 mr-1" }),
                            d.fullName,
                          ],
                        }),
                    ],
                  }),
                  (0, s.jsxs)("div", {
                    id: "field-zipCode",
                    children: [
                      (0, s.jsxs)("label", {
                        className:
                          "block text-sm font-medium text-gray-700 mb-1",
                        children: [
                          "ZIP Code ",
                          s.jsx("span", {
                            className: "text-red-500",
                            children: "*",
                          }),
                          w("location"),
                        ],
                      }),
                      s.jsx("input", {
                        type: "text",
                        value: o.zipCode,
                        onChange: (e) =>
                          x(
                            "zipCode",
                            e.target.value.replace(/\D/g, "").slice(0, 5),
                          ),
                        onBlur: () => b("zipCode"),
                        className: `
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${d.zipCode ? "border-red-500" : "border-gray-300"}
            `,
                        placeholder: "90001",
                        maxLength: 5,
                      }),
                      d.zipCode &&
                        (0, s.jsxs)("p", {
                          className:
                            "mt-1 text-sm text-red-600 flex items-center",
                          children: [
                            s.jsx(c.Z, { className: "w-4 h-4 mr-1" }),
                            d.zipCode,
                          ],
                        }),
                    ],
                  }),
                  (0, s.jsxs)("div", {
                    id: "field-dateOfBirth",
                    children: [
                      (0, s.jsxs)("label", {
                        className:
                          "block text-sm font-medium text-gray-700 mb-1",
                        children: [
                          "Date of Birth ",
                          s.jsx("span", {
                            className: "text-red-500",
                            children: "*",
                          }),
                          w("age"),
                        ],
                      }),
                      s.jsx("input", {
                        type: "date",
                        value: o.dateOfBirth,
                        onChange: (e) => x("dateOfBirth", e.target.value),
                        onBlur: () => b("dateOfBirth"),
                        max: new Date().toISOString().split("T")[0],
                        className: `
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${d.dateOfBirth ? "border-red-500" : "border-gray-300"}
            `,
                      }),
                      d.dateOfBirth &&
                        (0, s.jsxs)("p", {
                          className:
                            "mt-1 text-sm text-red-600 flex items-center",
                          children: [
                            s.jsx(c.Z, { className: "w-4 h-4 mr-1" }),
                            d.dateOfBirth,
                          ],
                        }),
                      o.dateOfBirth &&
                        !d.dateOfBirth &&
                        (0, s.jsxs)("p", {
                          className:
                            "mt-1 text-sm text-gray-500 flex items-center",
                          children: [
                            s.jsx(h, { className: "w-4 h-4 mr-1" }),
                            "Age: ",
                            g(o.dateOfBirth),
                            " years old",
                          ],
                        }),
                    ],
                  }),
                  (0, s.jsxs)("div", {
                    id: "field-email",
                    children: [
                      s.jsx("label", {
                        className:
                          "block text-sm font-medium text-gray-700 mb-1",
                        children: "Email (Optional)",
                      }),
                      s.jsx("input", {
                        type: "email",
                        value: o.email,
                        onChange: (e) => x("email", e.target.value),
                        onBlur: () => b("email"),
                        className: `
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${d.email ? "border-red-500" : "border-gray-300"}
            `,
                        placeholder: "your.email@example.com",
                      }),
                      d.email &&
                        (0, s.jsxs)("p", {
                          className:
                            "mt-1 text-sm text-red-600 flex items-center",
                          children: [
                            s.jsx(c.Z, { className: "w-4 h-4 mr-1" }),
                            d.email,
                          ],
                        }),
                    ],
                  }),
                  (0, s.jsxs)("div", {
                    id: "field-phone",
                    children: [
                      s.jsx("label", {
                        className:
                          "block text-sm font-medium text-gray-700 mb-1",
                        children: "Phone (Optional)",
                      }),
                      s.jsx("input", {
                        type: "tel",
                        value: o.phone,
                        onChange: (e) => x("phone", e.target.value),
                        onBlur: () => b("phone"),
                        className: `
              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${d.phone ? "border-red-500" : "border-gray-300"}
            `,
                        placeholder: "(555) 123-4567",
                      }),
                      d.phone &&
                        (0, s.jsxs)("p", {
                          className:
                            "mt-1 text-sm text-red-600 flex items-center",
                          children: [
                            s.jsx(c.Z, { className: "w-4 h-4 mr-1" }),
                            d.phone,
                          ],
                        }),
                    ],
                  }),
                  (0, s.jsxs)("div", {
                    id: "field-consent",
                    className: "border-t pt-4",
                    children: [
                      (0, s.jsxs)("label", {
                        className: "flex items-start",
                        children: [
                          s.jsx("input", {
                            type: "checkbox",
                            checked: o.consent,
                            onChange: (e) => x("consent", e.target.checked),
                            className:
                              "mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded",
                          }),
                          (0, s.jsxs)("span", {
                            className: "ml-3 text-sm text-gray-700",
                            children: [
                              "I confirm that the information provided is accurate and I consent to CareConnect using this information to help me create fundraising materials. I understand that CareConnect does not create or publish GoFundMe campaigns on my behalf. ",
                              s.jsx("span", {
                                className: "text-red-500",
                                children: "*",
                              }),
                            ],
                          }),
                        ],
                      }),
                      d.consent &&
                        (0, s.jsxs)("p", {
                          className:
                            "mt-2 text-sm text-red-600 flex items-center ml-7",
                          children: [
                            s.jsx(c.Z, { className: "w-4 h-4 mr-1" }),
                            d.consent,
                          ],
                        }),
                    ],
                  }),
                ],
              }),
              (0, s.jsxs)("div", {
                className: "flex items-center justify-between pt-6 border-t",
                children: [
                  s.jsx("button", {
                    type: "button",
                    onClick: n,
                    className:
                      "text-blue-600 hover:text-blue-700 text-sm font-medium",
                    children: "Need help?",
                  }),
                  (0, s.jsxs)("div", {
                    className: "flex space-x-3",
                    children: [
                      s.jsx("button", {
                        type: "button",
                        onClick: r,
                        className:
                          "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium",
                        children: "Back",
                      }),
                      (0, s.jsxs)("button", {
                        type: "submit",
                        className:
                          "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center",
                        children: [
                          "Next: Generate QR Code",
                          s.jsx(a.Z, { className: "w-4 h-4 ml-2" }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        }
        var f = r(3228),
          p = r(96849);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let m = (0, l.Z)("Printer", [
          ["polyline", { points: "6 9 6 2 18 2 18 9", key: "1306q4" }],
          [
            "path",
            {
              d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
              key: "143wyd",
            },
          ],
          [
            "rect",
            { width: "12", height: "8", x: "6", y: "14", key: "5ipwut" },
          ],
        ]);
        var g = r(64542),
          x = r(91460);
        function b({
          data: e,
          onComplete: t,
          onBack: r,
          onHelp: n,
          clientId: o,
        }) {
          let [l, d] = (0, i.useState)(""),
            [h, u] = (0, i.useState)(""),
            [b, y] = (0, i.useState)(""),
            [w, v] = (0, i.useState)(!1),
            [N, j] = (0, i.useState)(!1),
            [_, C] = (0, i.useState)(!1);
          (0, i.useEffect)(() => {
            k();
          }, [o]);
          let k = async () => {
              v(!0);
              try {
                let t = e.publicSlug || `donate-${o.slice(0, 8)}`,
                  r = `/donate/${t}`;
                (y(t), u(r));
                let s = await x.toDataURL(r, {
                  width: 400,
                  margin: 2,
                  color: { dark: "#000000", light: "#FFFFFF" },
                });
                d(s);
              } catch (e) {
                console.error("[QRCodeStep] Error generating QR code:", e);
              } finally {
                v(!1);
              }
            },
            E = async () => {
              try {
                (await navigator.clipboard.writeText(h),
                  j(!0),
                  setTimeout(() => j(!1), 2e3));
              } catch (e) {
                console.error("[QRCodeStep] Error copying URL:", e);
              }
            };
          return (0, s.jsxs)("div", {
            className: "space-y-6",
            children: [
              (0, s.jsxs)("div", {
                children: [
                  s.jsx("h2", {
                    className: "text-xl font-semibold text-gray-900 mb-2",
                    children: "Generate Donation QR Code",
                  }),
                  s.jsx("p", {
                    className: "text-gray-600",
                    children:
                      "Create a scannable QR code that links to your secure donation page",
                  }),
                ],
              }),
              w
                ? (0, s.jsxs)("div", {
                    className:
                      "flex flex-col items-center justify-center py-12",
                    children: [
                      s.jsx("div", {
                        className:
                          "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4",
                      }),
                      s.jsx("p", {
                        className: "text-gray-600",
                        children: "Generating your QR code...",
                      }),
                    ],
                  })
                : (0, s.jsxs)(s.Fragment, {
                    children: [
                      s.jsx("div", {
                        className:
                          "bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8",
                        children: s.jsx("div", {
                          className: "flex flex-col items-center",
                          children:
                            l &&
                            (0, s.jsxs)(s.Fragment, {
                              children: [
                                s.jsx("img", {
                                  src: l,
                                  alt: "Donation QR Code",
                                  className:
                                    "w-64 h-64 mb-6 bg-white p-4 rounded-lg shadow-sm",
                                }),
                                (0, s.jsxs)("div", {
                                  className:
                                    "bg-white rounded-lg p-4 w-full max-w-md shadow-sm",
                                  children: [
                                    s.jsx("p", {
                                      className:
                                        "text-sm text-gray-600 mb-2 text-center",
                                      children: "Donation Page URL:",
                                    }),
                                    (0, s.jsxs)("div", {
                                      className: "flex items-center space-x-2",
                                      children: [
                                        s.jsx("input", {
                                          type: "text",
                                          value: h,
                                          readOnly: !0,
                                          className:
                                            "flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm",
                                        }),
                                        s.jsx("button", {
                                          onClick: E,
                                          className:
                                            "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center",
                                          title: "Copy URL",
                                          children: N
                                            ? (0, s.jsxs)(s.Fragment, {
                                                children: [
                                                  s.jsx(a.Z, {
                                                    className: "w-4 h-4 mr-1",
                                                  }),
                                                  "Copied!",
                                                ],
                                              })
                                            : (0, s.jsxs)(s.Fragment, {
                                                children: [
                                                  s.jsx(f.Z, {
                                                    className: "w-4 h-4 mr-1",
                                                  }),
                                                  "Copy",
                                                ],
                                              }),
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                        }),
                      }),
                      (0, s.jsxs)("div", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                        children: [
                          (0, s.jsxs)("button", {
                            onClick: () => {
                              if (!l) return;
                              let e = document.createElement("a");
                              ((e.href = l),
                                (e.download = `donation-qr-${b}.png`),
                                document.body.appendChild(e),
                                e.click(),
                                document.body.removeChild(e));
                            },
                            className:
                              "flex items-center justify-center px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors",
                            children: [
                              s.jsx(p.Z, { className: "w-5 h-5 mr-2" }),
                              "Download PNG",
                            ],
                          }),
                          (0, s.jsxs)("button", {
                            onClick: () => {
                              let t = window.open("", "_blank");
                              t &&
                                (t.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Donation QR Code - ${e.fullName || "CareConnect"}</title>
          <style>
            @page {
              margin: 1in;
            }
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            p {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
            img {
              max-width: 300px;
              margin: 20px auto;
            }
            .url {
              font-size: 12px;
              word-break: break-all;
              margin-top: 20px;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <h1>Support ${e.fullName || "This Campaign"}</h1>
          <p>Scan this QR code to make a donation</p>
          <img src="${l}" alt="Donation QR Code" />
          <p>Or visit:</p>
          <div class="url">${h}</div>
          <p style="margin-top: 40px; font-size: 10px; color: #999;">
            Powered by CareConnect
          </p>
        </body>
      </html>
    `),
                                t.document.close(),
                                t.focus(),
                                setTimeout(() => {
                                  t.print();
                                }, 250));
                            },
                            className:
                              "flex items-center justify-center px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors",
                            children: [
                              s.jsx(m, { className: "w-5 h-5 mr-2" }),
                              "Print QR Code",
                            ],
                          }),
                          (0, s.jsxs)("a", {
                            href: h,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className:
                              "flex items-center justify-center px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors",
                            children: [
                              s.jsx(g.Z, { className: "w-5 h-5 mr-2" }),
                              "Test Link",
                            ],
                          }),
                        ],
                      }),
                      (0, s.jsxs)("div", {
                        className:
                          "bg-blue-50 border border-blue-200 rounded-lg p-6",
                        children: [
                          (0, s.jsxs)("button", {
                            onClick: () => C(!_),
                            className:
                              "flex items-center justify-between w-full text-left",
                            children: [
                              s.jsx("h3", {
                                className:
                                  "text-sm font-semibold text-blue-900",
                                children: "How donations work",
                              }),
                              s.jsx("span", {
                                className: "text-blue-600",
                                children: _ ? "−" : "+",
                              }),
                            ],
                          }),
                          _ &&
                            (0, s.jsxs)("div", {
                              className: "mt-4 space-y-3 text-sm text-blue-800",
                              children: [
                                (0, s.jsxs)("div", {
                                  className: "flex items-start",
                                  children: [
                                    s.jsx("span", {
                                      className: "mr-2",
                                      children: "1.",
                                    }),
                                    s.jsx("p", {
                                      children:
                                        "Donors scan your QR code or visit your donation page URL",
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  className: "flex items-start",
                                  children: [
                                    s.jsx("span", {
                                      className: "mr-2",
                                      children: "2.",
                                    }),
                                    s.jsx("p", {
                                      children:
                                        "They're taken to your secure CareConnect donation page",
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  className: "flex items-start",
                                  children: [
                                    s.jsx("span", {
                                      className: "mr-2",
                                      children: "3.",
                                    }),
                                    s.jsx("p", {
                                      children:
                                        "Donors enter their debit/credit card information via Stripe Checkout",
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  className: "flex items-start",
                                  children: [
                                    s.jsx("span", {
                                      className: "mr-2",
                                      children: "4.",
                                    }),
                                    (0, s.jsxs)("p", {
                                      children: [
                                        s.jsx("strong", {
                                          children:
                                            "No card data is stored by CareConnect",
                                        }),
                                        " — all payment processing is handled securely by Stripe",
                                      ],
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  className: "flex items-start",
                                  children: [
                                    s.jsx("span", {
                                      className: "mr-2",
                                      children: "5.",
                                    }),
                                    s.jsx("p", {
                                      children:
                                        "You receive funds directly to your connected bank account",
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  className:
                                    "mt-4 p-3 bg-blue-100 rounded border border-blue-300",
                                  children: [
                                    s.jsx("p", {
                                      className: "font-medium",
                                      children:
                                        "✓ PCI-DSS compliant payment processing",
                                    }),
                                    s.jsx("p", {
                                      className: "font-medium",
                                      children:
                                        "✓ Industry-standard encryption",
                                    }),
                                    s.jsx("p", {
                                      className: "font-medium",
                                      children:
                                        "✓ No storage of sensitive card data",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                        ],
                      }),
                      s.jsx("div", {
                        className:
                          "bg-gray-50 border border-gray-200 rounded-lg p-4",
                        children: (0, s.jsxs)("div", {
                          className: "flex items-start",
                          children: [
                            s.jsx(c.Z, {
                              className:
                                "w-5 h-5 text-gray-600 mr-3 flex-shrink-0 mt-0.5",
                            }),
                            (0, s.jsxs)("div", {
                              className: "text-sm text-gray-700",
                              children: [
                                s.jsx("p", {
                                  className: "font-medium mb-1",
                                  children: "Privacy & Security",
                                }),
                                s.jsx("p", {
                                  children:
                                    "This QR code links to your public donation page. Anyone with this code can view your campaign and make donations. Do not share with anyone you don't want to have access to your fundraising page.",
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
              (0, s.jsxs)("div", {
                className: "flex items-center justify-between pt-6 border-t",
                children: [
                  s.jsx("button", {
                    type: "button",
                    onClick: n,
                    className:
                      "text-blue-600 hover:text-blue-700 text-sm font-medium",
                    children: "Need help?",
                  }),
                  (0, s.jsxs)("div", {
                    className: "flex space-x-3",
                    children: [
                      s.jsx("button", {
                        type: "button",
                        onClick: r,
                        className:
                          "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium",
                        children: "Back",
                      }),
                      (0, s.jsxs)("button", {
                        onClick: () => {
                          t({
                            publicSlug: b,
                            qrCodeUrl: l,
                            donationPageUrl: h,
                          });
                        },
                        disabled: w,
                        className:
                          "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed",
                        children: [
                          "Next: GoFundMe Draft",
                          s.jsx(a.Z, { className: "w-4 h-4 ml-2" }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        }
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let y = (0, l.Z)("PenLine", [
          ["path", { d: "M12 20h9", key: "t2du7b" }],
          [
            "path",
            {
              d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z",
              key: "ymcmye",
            },
          ],
        ]);
        var w = r(62939);
        function v({
          data: e,
          onComplete: t,
          onBack: r,
          onHelp: n,
          clientId: o,
        }) {
          let [l, d] = (0, i.useState)({
              title: "",
              goal: "",
              category: "",
              location: "",
              beneficiary: "",
              story: "",
              summary: "",
            }),
            [c, h] = (0, i.useState)(null),
            [u, m] = (0, i.useState)(null),
            [g, x] = (0, i.useState)(!1);
          (0, i.useEffect)(() => {
            b();
          }, [e]);
          let b = () => {
              let t = e.extractedFields || {},
                r = t.name?.value?.split(" ")[0] || "this campaign",
                s = t.category?.value || "their goal",
                i = `Help ${r} with ${s}`,
                n =
                  t.story?.value ||
                  `My name is ${t.name?.value || "[Your Name]"}. ${t.age?.value ? `I am ${t.age.value} years old and ` : ""}I am reaching out for support with ${s}. 

I am located in ${t.location?.value || "[Your Location]"} and am working towards raising ${t.goalAmount?.value ? `$${t.goalAmount.value}` : "[Goal Amount]"} to help me get back on my feet.

${t.beneficiary?.value === "myself" ? "This fundraiser is for myself." : `This fundraiser is to help ${t.beneficiary?.value || "a loved one"}.`}

Every donation, no matter how small, will make a meaningful difference in my life. Thank you for your support and generosity.`,
                o = n.slice(0, 150) + "...";
              (d({
                title: i,
                goal: t.goalAmount?.value || "5000",
                category: t.category?.value || "other",
                location: t.location?.value || "",
                beneficiary: t.beneficiary?.value || "myself",
                story: n,
                summary: o,
              }),
                (e.gofundmeDraft = {
                  title: i,
                  goal: t.goalAmount?.value || "5000",
                  category: t.category?.value || "other",
                  location: t.location?.value || "",
                  beneficiary: t.beneficiary?.value || "myself",
                  story: n,
                  summary: o,
                }));
            },
            v = async (e, t) => {
              try {
                (await navigator.clipboard.writeText(t),
                  h(e),
                  setTimeout(() => h(null), 2e3));
              } catch (e) {
                console.error("[GoFundMeDraftStep] Error copying:", e);
              }
            },
            N = (t, r) => {
              (d((e) => ({ ...e, [t]: r })),
                e.gofundmeDraft && (e.gofundmeDraft[t] = r));
            },
            j = async () => {
              x(!0);
              try {
                let e = await fetch(`/api/export/word/${o}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(l),
                });
                if (e.ok) {
                  let t = await e.blob(),
                    r = window.URL.createObjectURL(t),
                    s = document.createElement("a");
                  ((s.href = r),
                    (s.download = `gofundme-draft-${o}.docx`),
                    document.body.appendChild(s),
                    s.click(),
                    window.URL.revokeObjectURL(r),
                    document.body.removeChild(s));
                } else console.error("[GoFundMeDraftStep] Word export failed");
              } catch (e) {
                console.error(
                  "[GoFundMeDraftStep] Error downloading Word doc:",
                  e,
                );
              } finally {
                x(!1);
              }
            },
            _ = (e, t, r = !1, i = "") => {
              let n = l[t],
                o = c === t,
                d = u === t;
              return (0, s.jsxs)("div", {
                className: "bg-white border border-gray-300 rounded-lg p-4",
                children: [
                  (0, s.jsxs)("div", {
                    className: "flex items-center justify-between mb-3",
                    children: [
                      s.jsx("label", {
                        className: "text-sm font-semibold text-gray-900",
                        children: e,
                      }),
                      (0, s.jsxs)("div", {
                        className: "flex space-x-2",
                        children: [
                          (0, s.jsxs)("button", {
                            onClick: () => m(d ? null : t),
                            className:
                              "text-blue-600 hover:text-blue-700 text-sm flex items-center",
                            title: "Edit",
                            children: [
                              s.jsx(y, { className: "w-4 h-4 mr-1" }),
                              d ? "Done" : "Edit",
                            ],
                          }),
                          s.jsx("button", {
                            onClick: () => v(t, n),
                            className:
                              "text-green-600 hover:text-green-700 text-sm flex items-center",
                            title: "Copy",
                            children: o
                              ? (0, s.jsxs)(s.Fragment, {
                                  children: [
                                    s.jsx(a.Z, { className: "w-4 h-4 mr-1" }),
                                    "Copied!",
                                  ],
                                })
                              : (0, s.jsxs)(s.Fragment, {
                                  children: [
                                    s.jsx(f.Z, { className: "w-4 h-4 mr-1" }),
                                    "Copy",
                                  ],
                                }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  d
                    ? r
                      ? s.jsx("textarea", {
                          value: n,
                          onChange: (e) => N(t, e.target.value),
                          className:
                            "w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          rows: 10,
                          placeholder: i,
                        })
                      : s.jsx("input", {
                          type: "text",
                          value: n,
                          onChange: (e) => N(t, e.target.value),
                          className:
                            "w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          placeholder: i,
                        })
                    : s.jsx("div", {
                        className: `${r ? "whitespace-pre-wrap" : ""} text-gray-700 bg-gray-50 p-3 rounded`,
                        children:
                          n ||
                          s.jsx("span", {
                            className: "text-gray-400",
                            children: i,
                          }),
                      }),
                ],
              });
            };
          return (0, s.jsxs)("div", {
            className: "space-y-6",
            children: [
              (0, s.jsxs)("div", {
                children: [
                  s.jsx("h2", {
                    className: "text-xl font-semibold text-gray-900 mb-2",
                    children: "Prepare GoFundMe Draft",
                  }),
                  s.jsx("p", {
                    className: "text-gray-600",
                    children:
                      "Review and edit the auto-generated content below. You can copy each field directly into GoFundMe's website.",
                  }),
                ],
              }),
              s.jsx("div", {
                className: "bg-blue-50 border border-blue-200 rounded-lg p-4",
                children: (0, s.jsxs)("div", {
                  className: "flex items-start",
                  children: [
                    s.jsx(y, {
                      className:
                        "w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5",
                    }),
                    (0, s.jsxs)("div", {
                      className: "text-sm text-blue-800",
                      children: [
                        s.jsx("p", {
                          className: "font-medium mb-1",
                          children: "You can edit anything!",
                        }),
                        s.jsx("p", {
                          children:
                            'Click the "Edit" button next to any field to customize the text. Changes are saved automatically.',
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              (0, s.jsxs)("div", {
                className: "space-y-4",
                children: [
                  _(
                    "Campaign Title",
                    "title",
                    !1,
                    "Help [Name] with [Category]",
                  ),
                  _("Fundraising Goal ($)", "goal", !1, "5000"),
                  _(
                    "Category",
                    "category",
                    !1,
                    "medical, housing, emergency, etc.",
                  ),
                  _("Location", "location", !1, "City, State"),
                  _("Beneficiary", "beneficiary", !1, "myself or someone else"),
                  _(
                    "Short Summary (150 chars)",
                    "summary",
                    !0,
                    "Brief description for preview...",
                  ),
                  _("Full Story", "story", !0, "Tell your story in detail..."),
                ],
              }),
              (0, s.jsxs)("div", {
                className: "bg-gray-50 border border-gray-300 rounded-lg p-6",
                children: [
                  s.jsx("h3", {
                    className: "text-sm font-semibold text-gray-900 mb-3",
                    children: "Suggested Cover Media Checklist (Optional)",
                  }),
                  s.jsx("p", {
                    className: "text-sm text-gray-600 mb-4",
                    children:
                      "GoFundMe campaigns with photos or videos receive more donations. Consider adding:",
                  }),
                  (0, s.jsxs)("ul", {
                    className: "space-y-2 text-sm text-gray-700",
                    children: [
                      (0, s.jsxs)("li", {
                        className: "flex items-start",
                        children: [
                          s.jsx("span", { className: "mr-2", children: "•" }),
                          s.jsx("span", {
                            children:
                              "A clear photo of yourself or the beneficiary",
                          }),
                        ],
                      }),
                      (0, s.jsxs)("li", {
                        className: "flex items-start",
                        children: [
                          s.jsx("span", { className: "mr-2", children: "•" }),
                          s.jsx("span", {
                            children: "Photos showing the situation or need",
                          }),
                        ],
                      }),
                      (0, s.jsxs)("li", {
                        className: "flex items-start",
                        children: [
                          s.jsx("span", { className: "mr-2", children: "•" }),
                          s.jsx("span", {
                            children:
                              "A short video (30-60 seconds) telling your story",
                          }),
                        ],
                      }),
                      (0, s.jsxs)("li", {
                        className: "flex items-start",
                        children: [
                          s.jsx("span", { className: "mr-2", children: "•" }),
                          s.jsx("span", {
                            children: "Documents or receipts (if relevant)",
                          }),
                        ],
                      }),
                    ],
                  }),
                  s.jsx("p", {
                    className: "text-xs text-gray-500 mt-4",
                    children:
                      "Note: CareConnect does not generate photos or videos. You'll need to upload these directly to GoFundMe.",
                  }),
                ],
              }),
              s.jsx("div", {
                className:
                  "bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6",
                children: (0, s.jsxs)("div", {
                  className: "flex items-center justify-between",
                  children: [
                    (0, s.jsxs)("div", {
                      className: "flex items-start",
                      children: [
                        s.jsx(w.Z, {
                          className:
                            "w-6 h-6 text-green-600 mr-3 flex-shrink-0",
                        }),
                        (0, s.jsxs)("div", {
                          children: [
                            s.jsx("h3", {
                              className:
                                "text-sm font-semibold text-gray-900 mb-1",
                              children: "Download as Word Document (.docx)",
                            }),
                            s.jsx("p", {
                              className: "text-sm text-gray-600",
                              children:
                                "Get a professionally formatted document with all your campaign details that you can print or edit offline.",
                            }),
                          ],
                        }),
                      ],
                    }),
                    s.jsx("button", {
                      onClick: j,
                      disabled: g,
                      className:
                        "ml-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
                      children: g
                        ? (0, s.jsxs)(s.Fragment, {
                            children: [
                              s.jsx("div", {
                                className:
                                  "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2",
                              }),
                              "Downloading...",
                            ],
                          })
                        : (0, s.jsxs)(s.Fragment, {
                            children: [
                              s.jsx(p.Z, { className: "w-4 h-4 mr-2" }),
                              "Download .docx",
                            ],
                          }),
                    }),
                  ],
                }),
              }),
              s.jsx("div", {
                className:
                  "bg-yellow-50 border border-yellow-200 rounded-lg p-4",
                children: s.jsx("div", {
                  className: "flex items-start",
                  children: (0, s.jsxs)("div", {
                    className: "text-sm text-yellow-800",
                    children: [
                      s.jsx("p", {
                        className: "font-semibold mb-2",
                        children:
                          "⚠️ Important: CareConnect Does NOT Publish to GoFundMe",
                      }),
                      (0, s.jsxs)("p", {
                        children: [
                          "This is a ",
                          s.jsx("strong", { children: "draft only" }),
                          ". You must manually create your GoFundMe campaign by visiting",
                          s.jsx("a", {
                            href: "https://www.gofundme.com/c/start",
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "text-yellow-900 underline ml-1",
                            children: "gofundme.com/c/start",
                          }),
                          " and copying these fields into their form.",
                        ],
                      }),
                      s.jsx("p", {
                        className: "mt-2",
                        children:
                          "The next step will guide you through the GoFundMe creation process step-by-step.",
                      }),
                    ],
                  }),
                }),
              }),
              (0, s.jsxs)("div", {
                className: "flex items-center justify-between pt-6 border-t",
                children: [
                  s.jsx("button", {
                    type: "button",
                    onClick: n,
                    className:
                      "text-blue-600 hover:text-blue-700 text-sm font-medium",
                    children: "Need help?",
                  }),
                  (0, s.jsxs)("div", {
                    className: "flex space-x-3",
                    children: [
                      s.jsx("button", {
                        type: "button",
                        onClick: r,
                        className:
                          "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium",
                        children: "Back",
                      }),
                      (0, s.jsxs)("button", {
                        onClick: () => {
                          t({ gofundmeDraft: l });
                        },
                        className:
                          "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center",
                        children: [
                          "Next: GoFundMe Wizard",
                          s.jsx(a.Z, { className: "w-4 h-4 ml-2" }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        }
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let N = (0, l.Z)("ChevronDown", [
            ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }],
          ]),
          j = (0, l.Z)("ChevronRight", [
            ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }],
          ]),
          Image = (0, l.Z)("Image", [
            [
              "rect",
              {
                width: "18",
                height: "18",
                x: "3",
                y: "3",
                rx: "2",
                ry: "2",
                key: "1m3agn",
              },
            ],
            ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
            [
              "path",
              { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" },
            ],
          ]);
        function _({ data: e, onComplete: t, onBack: r, onHelp: n }) {
          let [o, l] = (0, i.useState)(1),
            [d, c] = (0, i.useState)(new Set()),
            [h, u] = (0, i.useState)(null),
            p = [
              {
                id: 1,
                title: "Start Your Fundraiser",
                description: "Visit GoFundMe and begin the creation process",
                screenshot: "/gofundme-steps/step1-start.png",
                instructions: [
                  "Go to https://www.gofundme.com/c/start",
                  'Click the green "Start a GoFundMe" button',
                  "If you have an account, sign in. Otherwise, continue as guest (you'll create an account later)",
                ],
                troubleshooting: [
                  "If the button doesn't work, try refreshing the page or using a different browser",
                  "Make sure you're using the main GoFundMe site (not a third-party platform)",
                ],
              },
              {
                id: 2,
                title: "Choose Who You're Fundraising For",
                description: "Select the beneficiary of your campaign",
                screenshot: "/gofundme-steps/step2-beneficiary.png",
                instructions: [
                  'Select "Myself" if you are the beneficiary',
                  'Select "Someone else" if raising funds for another person',
                  'Select "Charity" if raising funds for a registered nonprofit',
                ],
                copyFields: [
                  {
                    label: "Beneficiary",
                    value: e.gofundmeDraft?.beneficiary || "myself",
                  },
                ],
                troubleshooting: [
                  "If fundraising for someone else, you'll need their permission and details",
                  "Charity fundraisers have different verification requirements",
                ],
              },
              {
                id: 3,
                title: "Select a Category",
                description:
                  "Choose the category that best describes your fundraiser",
                screenshot: "/gofundme-steps/step3-category.png",
                instructions: [
                  "Choose from: Medical, Emergency, Education, Animals, Community, Funeral, Events, Sports, etc.",
                  "Select the category that most closely matches your situation",
                  "This helps donors find your campaign",
                ],
                copyFields: [
                  {
                    label: "Category",
                    value: e.gofundmeDraft?.category || "other",
                  },
                ],
                troubleshooting: [
                  'If unsure, choose "Other" and explain in your story',
                  "You can change the category later if needed",
                ],
              },
              {
                id: 4,
                title: "Set Your Fundraising Goal",
                description: "Enter your target amount",
                screenshot: "/gofundme-steps/step4-goal.png",
                instructions: [
                  "Enter the total amount you need to raise",
                  "Be realistic and specific about your goal",
                  "You can adjust this amount later if needed",
                ],
                copyFields: [
                  {
                    label: "Goal Amount",
                    value: `$${e.gofundmeDraft?.goal || "5000"}`,
                  },
                ],
                troubleshooting: [
                  "Break down your goal in your story to show donors how funds will be used",
                  'Don\'t worry about setting a "perfect" amount—you can always adjust',
                ],
              },
              {
                id: 5,
                title: "Add Your Location",
                description: "Provide your city and state/province",
                screenshot: "/gofundme-steps/step5-location.png",
                instructions: [
                  "Enter your city name in the location field",
                  "Select your state/province from the dropdown",
                  "This helps with local discovery and builds trust with donors",
                ],
                copyFields: [
                  { label: "Location", value: e.gofundmeDraft?.location || "" },
                ],
                troubleshooting: [
                  "If your location doesn't appear, try entering just the city name",
                  "You can use the beneficiary's location if fundraising for someone else",
                ],
              },
              {
                id: 6,
                title: "Add Your Fundraiser Title",
                description: "Create a clear, compelling title",
                screenshot: "/gofundme-steps/step6-title.png",
                instructions: [
                  "Keep it short, clear, and descriptive (50-80 characters)",
                  "Include the beneficiary's name and the reason",
                  'Example: "Help John Smith Recover from Surgery"',
                ],
                copyFields: [
                  {
                    label: "Campaign Title",
                    value: e.gofundmeDraft?.title || "",
                  },
                ],
                troubleshooting: [
                  "Avoid ALL CAPS or excessive punctuation",
                  "Make it specific enough to stand out but not too long",
                ],
              },
              {
                id: 7,
                title: "Tell Your Story",
                description: "Write your campaign narrative",
                screenshot: "/gofundme-steps/step7-story.png",
                instructions: [
                  "Paste your story from CareConnect into the text editor",
                  "Format with paragraphs, headings, and line breaks",
                  "Add bullet points if listing expenses",
                  "Be honest, specific, and personal",
                  "Explain how funds will be used",
                ],
                copyFields: [
                  { label: "Full Story", value: e.gofundmeDraft?.story || "" },
                ],
                troubleshooting: [
                  "If text doesn't paste correctly, try pasting as plain text (Ctrl+Shift+V)",
                  "Use the editor toolbar to add formatting",
                  "Keep paragraphs short for easier reading",
                ],
              },
              {
                id: 8,
                title: "Add Cover Photo or Video",
                description: "Upload visual media to your campaign",
                screenshot: "/gofundme-steps/step8-media.png",
                instructions: [
                  'Click "Add photo" or "Add video"',
                  "Upload a clear, high-quality image of yourself or the beneficiary",
                  "Recommended: 1200x900 pixels or larger",
                  "Videos should be 30-90 seconds and tell your story",
                  "You can add multiple photos",
                ],
                troubleshooting: [
                  "Campaigns with photos receive 3x more donations",
                  "If upload fails, try reducing image size",
                  "Accepted formats: JPG, PNG, GIF (photos), MP4 (videos)",
                  "CareConnect does not generate photos—you must provide your own",
                ],
              },
              {
                id: 9,
                title: "Review Your Campaign",
                description: "Check all details before publishing",
                screenshot: "/gofundme-steps/step9-review.png",
                instructions: [
                  "Review all information for accuracy",
                  "Check spelling and grammar",
                  "Verify goal amount and category",
                  "Preview how your campaign will look to donors",
                  "Make any final edits",
                ],
                troubleshooting: [
                  "Take your time—first impressions matter",
                  "Ask a friend to review before publishing",
                  "You can edit most fields after publishing",
                ],
              },
              {
                id: 10,
                title: "Create Account & Publish",
                description: "Set up your GoFundMe account and go live",
                screenshot: "/gofundme-steps/step10-publish.png",
                instructions: [
                  "Create a GoFundMe account (if you haven't already)",
                  "Verify your email address",
                  "Agree to GoFundMe's terms of service",
                  'Click "Publish" to make your campaign live',
                  "Your campaign is now public and accepting donations!",
                ],
                troubleshooting: [
                  "Check your email for verification link",
                  "If verification email doesn't arrive, check spam folder",
                  "You must verify your identity to withdraw funds",
                ],
              },
              {
                id: 11,
                title: "Connect Bank Account",
                description: "Set up withdrawals (required to receive funds)",
                screenshot: "/gofundme-steps/step11-bank.png",
                instructions: [
                  "Go to your campaign dashboard",
                  'Click "Withdraw funds" or "Set up withdrawals"',
                  "Choose your bank from the list (or enter manually)",
                  "Provide your routing number and account number",
                  "Verify your identity (photo ID may be required)",
                  "Processing takes 2-5 business days for first withdrawal",
                ],
                troubleshooting: [
                  "Bank account must be in the beneficiary's name",
                  "You cannot withdraw funds without identity verification",
                  "GoFundMe uses secure, encrypted connections for banking info",
                  "If verification fails, contact GoFundMe support",
                ],
              },
              {
                id: 12,
                title: "Share Your Campaign",
                description: "Spread the word to reach your goal",
                screenshot: "/gofundme-steps/step12-share.png",
                instructions: [
                  "Use the CareConnect QR code for offline sharing",
                  "Share on Facebook, Twitter, Instagram, and other social media",
                  "Send direct messages or emails to friends and family",
                  "Post updates regularly to keep donors engaged",
                  "Thank donors publicly and privately",
                ],
                copyFields: [
                  {
                    label: "Donation Page URL",
                    value: e.donationPageUrl || "",
                  },
                ],
                troubleshooting: [
                  "Share multiple times—not everyone sees your first post",
                  "Personalize your sharing messages",
                  "Post updates at least weekly",
                  "Use your CareConnect QR code for in-person sharing",
                ],
              },
            ],
            m = (e) => {
              l(o === e ? 0 : e);
            },
            x = (e) => {
              c((t) => {
                let r = new Set(t);
                return (r.has(e) ? r.delete(e) : r.add(e), r);
              });
            },
            b = async (e, t) => {
              try {
                (await navigator.clipboard.writeText(e),
                  u(t),
                  setTimeout(() => u(null), 2e3));
              } catch (e) {
                console.error("[GoFundMeWizard] Error copying:", e);
              }
            },
            y = (e) => {
              let t = o === e.id,
                r = d.has(e.id);
              return (0, s.jsxs)(
                "div",
                {
                  className:
                    "border border-gray-300 rounded-lg overflow-hidden",
                  children: [
                    (0, s.jsxs)("button", {
                      onClick: () => m(e.id),
                      className: `
            w-full flex items-center justify-between p-4 text-left transition-colors
            ${r ? "bg-green-50 hover:bg-green-100" : "bg-white hover:bg-gray-50"}
          `,
                      children: [
                        (0, s.jsxs)("div", {
                          className: "flex items-center flex-1",
                          children: [
                            s.jsx("span", {
                              className: `
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3
              ${r ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}
            `,
                              children: r
                                ? s.jsx(a.Z, { className: "w-5 h-5" })
                                : e.id,
                            }),
                            (0, s.jsxs)("div", {
                              children: [
                                s.jsx("h3", {
                                  className:
                                    "text-sm font-semibold text-gray-900",
                                  children: e.title,
                                }),
                                s.jsx("p", {
                                  className: "text-xs text-gray-600 mt-1",
                                  children: e.description,
                                }),
                              ],
                            }),
                          ],
                        }),
                        t
                          ? s.jsx(N, {
                              className: "w-5 h-5 text-gray-500 flex-shrink-0",
                            })
                          : s.jsx(j, {
                              className: "w-5 h-5 text-gray-500 flex-shrink-0",
                            }),
                      ],
                    }),
                    t &&
                      s.jsx("div", {
                        className: "p-6 bg-gray-50 border-t border-gray-200",
                        children: (0, s.jsxs)("div", {
                          className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
                          children: [
                            s.jsx("div", {
                              className:
                                "bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-center",
                              children: e.screenshot
                                ? s.jsx("img", {
                                    src: e.screenshot,
                                    alt: `Screenshot: ${e.title}`,
                                    className: "max-w-full h-auto rounded",
                                    onError: (e) => {
                                      ((e.currentTarget.style.display = "none"),
                                        (e.currentTarget.parentElement.innerHTML = `
                        <div class="text-center text-gray-400 py-12">
                          <div class="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                          </div>
                          <p class="text-sm">Screenshot placeholder</p>
                        </div>
                      `));
                                    },
                                  })
                                : (0, s.jsxs)("div", {
                                    className:
                                      "text-center text-gray-400 py-12",
                                    children: [
                                      s.jsx(Image, {
                                        className: "w-16 h-16 mx-auto mb-4",
                                      }),
                                      s.jsx("p", {
                                        className: "text-sm",
                                        children: "Screenshot placeholder",
                                      }),
                                    ],
                                  }),
                            }),
                            (0, s.jsxs)("div", {
                              className: "space-y-4",
                              children: [
                                (0, s.jsxs)("div", {
                                  children: [
                                    s.jsx("h4", {
                                      className:
                                        "text-sm font-semibold text-gray-900 mb-2",
                                      children: "What to do:",
                                    }),
                                    s.jsx("ul", {
                                      className: "space-y-2",
                                      children: e.instructions.map((e, t) =>
                                        (0, s.jsxs)(
                                          "li",
                                          {
                                            className:
                                              "flex items-start text-sm text-gray-700",
                                            children: [
                                              (0, s.jsxs)("span", {
                                                className:
                                                  "mr-2 text-blue-600 font-bold",
                                                children: [t + 1, "."],
                                              }),
                                              s.jsx("span", { children: e }),
                                            ],
                                          },
                                          t,
                                        ),
                                      ),
                                    }),
                                  ],
                                }),
                                e.copyFields &&
                                  e.copyFields.length > 0 &&
                                  (0, s.jsxs)("div", {
                                    className:
                                      "bg-blue-50 border border-blue-200 rounded-lg p-4",
                                    children: [
                                      s.jsx("h4", {
                                        className:
                                          "text-sm font-semibold text-gray-900 mb-3",
                                        children: "Copy from CareConnect:",
                                      }),
                                      s.jsx("div", {
                                        className: "space-y-2",
                                        children: e.copyFields.map((e, t) =>
                                          (0, s.jsxs)(
                                            "div",
                                            {
                                              className: "bg-white rounded p-2",
                                              children: [
                                                (0, s.jsxs)("div", {
                                                  className:
                                                    "flex items-center justify-between mb-1",
                                                  children: [
                                                    s.jsx("span", {
                                                      className:
                                                        "text-xs font-medium text-gray-600",
                                                      children: e.label,
                                                    }),
                                                    s.jsx("button", {
                                                      onClick: () =>
                                                        b(e.value, e.label),
                                                      className:
                                                        "text-blue-600 hover:text-blue-700 text-xs flex items-center",
                                                      children:
                                                        h === e.label
                                                          ? (0, s.jsxs)(
                                                              s.Fragment,
                                                              {
                                                                children: [
                                                                  s.jsx(a.Z, {
                                                                    className:
                                                                      "w-3 h-3 mr-1",
                                                                  }),
                                                                  "Copied!",
                                                                ],
                                                              },
                                                            )
                                                          : (0, s.jsxs)(
                                                              s.Fragment,
                                                              {
                                                                children: [
                                                                  s.jsx(f.Z, {
                                                                    className:
                                                                      "w-3 h-3 mr-1",
                                                                  }),
                                                                  "Copy",
                                                                ],
                                                              },
                                                            ),
                                                    }),
                                                  ],
                                                }),
                                                s.jsx("div", {
                                                  className:
                                                    "text-sm text-gray-900 break-words",
                                                  children:
                                                    e.value.length > 100
                                                      ? e.value.slice(0, 100) +
                                                        "..."
                                                      : e.value,
                                                }),
                                              ],
                                            },
                                            t,
                                          ),
                                        ),
                                      }),
                                    ],
                                  }),
                                e.troubleshooting &&
                                  e.troubleshooting.length > 0 &&
                                  (0, s.jsxs)("div", {
                                    className:
                                      "bg-yellow-50 border border-yellow-200 rounded-lg p-4",
                                    children: [
                                      s.jsx("h4", {
                                        className:
                                          "text-sm font-semibold text-gray-900 mb-2",
                                        children: "Common problems:",
                                      }),
                                      s.jsx("ul", {
                                        className: "space-y-1",
                                        children: e.troubleshooting.map(
                                          (e, t) =>
                                            (0, s.jsxs)(
                                              "li",
                                              {
                                                className:
                                                  "flex items-start text-xs text-gray-700",
                                                children: [
                                                  s.jsx("span", {
                                                    className: "mr-2",
                                                    children: "•",
                                                  }),
                                                  s.jsx("span", {
                                                    children: e,
                                                  }),
                                                ],
                                              },
                                              t,
                                            ),
                                        ),
                                      }),
                                    ],
                                  }),
                                s.jsx("button", {
                                  onClick: () => x(e.id),
                                  className: `
                    w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors
                    ${r ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
                  `,
                                  children: r
                                    ? "✓ Completed"
                                    : "Mark as Complete",
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                  ],
                },
                e.id,
              );
            },
            w = d.size,
            v = p.length,
            _ = Math.round((w / v) * 100);
          return (0, s.jsxs)("div", {
            className: "space-y-6",
            children: [
              (0, s.jsxs)("div", {
                children: [
                  s.jsx("h2", {
                    className: "text-xl font-semibold text-gray-900 mb-2",
                    children: "Finalize GoFundMe Manually",
                  }),
                  s.jsx("p", {
                    className: "text-gray-600",
                    children:
                      "Follow these step-by-step instructions to create your campaign on GoFundMe's website.",
                  }),
                ],
              }),
              (0, s.jsxs)("div", {
                className: "bg-white border border-gray-300 rounded-lg p-4",
                children: [
                  (0, s.jsxs)("div", {
                    className: "flex items-center justify-between mb-2",
                    children: [
                      s.jsx("span", {
                        className: "text-sm font-medium text-gray-700",
                        children: "Progress",
                      }),
                      (0, s.jsxs)("span", {
                        className: "text-sm font-medium text-gray-900",
                        children: [w, " of ", v, " steps"],
                      }),
                    ],
                  }),
                  s.jsx("div", {
                    className: "w-full bg-gray-200 rounded-full h-2",
                    children: s.jsx("div", {
                      className:
                        "bg-green-600 h-2 rounded-full transition-all duration-300",
                      style: { width: `${_}%` },
                    }),
                  }),
                ],
              }),
              s.jsx("div", {
                className: "bg-blue-50 border border-blue-200 rounded-lg p-4",
                children: (0, s.jsxs)("div", {
                  className: "flex items-start",
                  children: [
                    s.jsx(g.Z, {
                      className:
                        "w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5",
                    }),
                    (0, s.jsxs)("div", {
                      className: "flex-1",
                      children: [
                        s.jsx("h3", {
                          className: "text-sm font-semibold text-blue-900 mb-1",
                          children: "Official GoFundMe Guide",
                        }),
                        s.jsx("p", {
                          className: "text-sm text-blue-800 mb-3",
                          children:
                            "For the most up-to-date instructions, visit GoFundMe's official documentation:",
                        }),
                        s.jsx("a", {
                          href: "https://support.gofundme.com/hc/en-us/articles/360001992627-Creating-a-GoFundMe-from-start-to-finish",
                          target: "_blank",
                          rel: "noopener noreferrer",
                          className:
                            "text-sm text-blue-600 hover:text-blue-700 underline",
                          children:
                            "Creating a GoFundMe from start to finish →",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              s.jsx("div", {
                className: "space-y-3",
                children: p.map((e) => y(e)),
              }),
              (0, s.jsxs)("div", {
                className: "flex items-center justify-between pt-6 border-t",
                children: [
                  s.jsx("button", {
                    type: "button",
                    onClick: n,
                    className:
                      "text-blue-600 hover:text-blue-700 text-sm font-medium",
                    children: "Need help?",
                  }),
                  (0, s.jsxs)("div", {
                    className: "flex space-x-3",
                    children: [
                      s.jsx("button", {
                        type: "button",
                        onClick: r,
                        className:
                          "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium",
                        children: "Back",
                      }),
                      (0, s.jsxs)("button", {
                        onClick: () => t({}),
                        className:
                          "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center",
                        children: [
                          "Next: Download Print Kit",
                          s.jsx(a.Z, { className: "w-4 h-4 ml-2" }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        }
        function C({ data: e, onBack: t, clientId: r }) {
          let [n, o] = (0, i.useState)(null),
            l = () => {
              if (!e.qrCodeUrl) return;
              let t = document.createElement("a");
              ((t.href = e.qrCodeUrl),
                (t.download = `donation-qr-${e.publicSlug || r}.png`),
                document.body.appendChild(t),
                t.click(),
                document.body.removeChild(t));
            },
            d = async () => {
              o("word");
              try {
                let t = await fetch(`/api/export/word/${r}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(e.gofundmeDraft || {}),
                });
                if (t.ok) {
                  let e = await t.blob(),
                    s = window.URL.createObjectURL(e),
                    i = document.createElement("a");
                  ((i.href = s),
                    (i.download = `gofundme-draft-${r}.docx`),
                    document.body.appendChild(i),
                    i.click(),
                    window.URL.revokeObjectURL(s),
                    document.body.removeChild(i));
                }
              } catch (e) {
                console.error("[PrintKitStep] Error downloading Word doc:", e);
              } finally {
                o(null);
              }
            },
            c = async () => {
              (o("all"),
                l(),
                await new Promise((e) => setTimeout(e, 500)),
                await d(),
                o(null));
            };
          return (0, s.jsxs)("div", {
            className: "space-y-6",
            children: [
              (0, s.jsxs)("div", {
                children: [
                  s.jsx("h2", {
                    className: "text-xl font-semibold text-gray-900 mb-2",
                    children: "Download Print Kit",
                  }),
                  s.jsx("p", {
                    className: "text-gray-600",
                    children:
                      "Get all your fundraising materials in one place. Download, print, and share!",
                  }),
                ],
              }),
              s.jsx("div", {
                className:
                  "bg-green-50 border-2 border-green-300 rounded-lg p-6",
                children: (0, s.jsxs)("div", {
                  className: "flex items-start",
                  children: [
                    s.jsx(a.Z, {
                      className:
                        "w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1",
                    }),
                    (0, s.jsxs)("div", {
                      children: [
                        s.jsx("h3", {
                          className:
                            "text-lg font-semibold text-green-900 mb-2",
                          children:
                            "\uD83C\uDF89 Congratulations! Your funding setup is complete.",
                        }),
                        s.jsx("p", {
                          className: "text-green-800",
                          children:
                            "You've successfully prepared all the materials needed to launch your fundraising campaign. Download your print kit below and follow the GoFundMe wizard instructions to publish your campaign.",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              (0, s.jsxs)("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                children: [
                  (0, s.jsxs)("div", {
                    className:
                      "bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors",
                    children: [
                      (0, s.jsxs)("div", {
                        className: "flex items-center mb-4",
                        children: [
                          s.jsx(Image, {
                            className: "w-8 h-8 text-blue-600 mr-3",
                          }),
                          (0, s.jsxs)("div", {
                            children: [
                              s.jsx("h3", {
                                className:
                                  "text-sm font-semibold text-gray-900",
                                children: "QR Code (PNG)",
                              }),
                              s.jsx("p", {
                                className: "text-xs text-gray-600",
                                children: "High-resolution donation QR code",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, s.jsxs)("button", {
                        onClick: l,
                        disabled: !e.qrCodeUrl,
                        className:
                          "w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
                        children: [
                          s.jsx(p.Z, { className: "w-4 h-4 mr-2" }),
                          "Download PNG",
                        ],
                      }),
                    ],
                  }),
                  (0, s.jsxs)("div", {
                    className:
                      "bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors",
                    children: [
                      (0, s.jsxs)("div", {
                        className: "flex items-center mb-4",
                        children: [
                          s.jsx(w.Z, {
                            className: "w-8 h-8 text-green-600 mr-3",
                          }),
                          (0, s.jsxs)("div", {
                            children: [
                              s.jsx("h3", {
                                className:
                                  "text-sm font-semibold text-gray-900",
                                children: "Campaign Draft (.docx)",
                              }),
                              s.jsx("p", {
                                className: "text-xs text-gray-600",
                                children: "Formatted GoFundMe document",
                              }),
                            ],
                          }),
                        ],
                      }),
                      s.jsx("button", {
                        onClick: d,
                        disabled: "word" === n,
                        className:
                          "w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
                        children:
                          "word" === n
                            ? (0, s.jsxs)(s.Fragment, {
                                children: [
                                  s.jsx("div", {
                                    className:
                                      "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2",
                                  }),
                                  "Downloading...",
                                ],
                              })
                            : (0, s.jsxs)(s.Fragment, {
                                children: [
                                  s.jsx(p.Z, { className: "w-4 h-4 mr-2" }),
                                  "Download .docx",
                                ],
                              }),
                      }),
                    ],
                  }),
                ],
              }),
              s.jsx("div", {
                className:
                  "bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6",
                children: (0, s.jsxs)("div", {
                  className: "flex items-center justify-between",
                  children: [
                    (0, s.jsxs)("div", {
                      className: "flex items-start flex-1",
                      children: [
                        s.jsx(m, {
                          className:
                            "w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-1",
                        }),
                        (0, s.jsxs)("div", {
                          children: [
                            s.jsx("h3", {
                              className:
                                "text-sm font-semibold text-gray-900 mb-1",
                              children: "One-Page Print Summary",
                            }),
                            s.jsx("p", {
                              className: "text-sm text-gray-600",
                              children:
                                "Print-optimized page with all your campaign details, QR code, and next steps checklist. Perfect for keeping on hand or sharing with support coordinators.",
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, s.jsxs)("button", {
                      onClick: () => {
                        let t = window.open("", "_blank");
                        if (!t) return;
                        let r = e.gofundmeDraft || {};
                        (t.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fundraising Campaign Summary - ${e.fullName || "CareConnect"}</title>
          <style>
            @page {
              margin: 1in;
              size: letter;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
              color: #1a1a1a;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 10px;
            }
            h2 {
              font-size: 18px;
              margin-top: 30px;
              margin-bottom: 10px;
              color: #2563eb;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .field-label {
              font-weight: bold;
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .field-value {
              background: #f5f5f5;
              padding: 10px;
              border-radius: 5px;
              margin-bottom: 15px;
              border-left: 3px solid #2563eb;
            }
            .qr-section {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              border: 2px dashed #ccc;
              page-break-inside: avoid;
            }
            .qr-section img {
              max-width: 300px;
              margin: 15px auto;
            }
            .url {
              font-size: 12px;
              word-break: break-all;
              background: #f0f0f0;
              padding: 10px;
              border-radius: 5px;
              margin-top: 10px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
              font-size: 10px;
              color: #999;
              text-align: center;
            }
            .checklist {
              list-style: none;
              padding-left: 0;
            }
            .checklist li {
              padding: 5px 0;
              padding-left: 25px;
              position: relative;
            }
            .checklist li:before {
              content: "☐";
              position: absolute;
              left: 0;
              font-size: 18px;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>Fundraising Campaign Summary</h1>
          
          <div class="section">
            <h2>Personal Information</h2>
            <div class="field-label">Full Name</div>
            <div class="field-value">${e.fullName || "Not provided"}</div>
            
            <div class="field-label">ZIP Code</div>
            <div class="field-value">${e.zipCode || "Not provided"}</div>
            
            <div class="field-label">Email</div>
            <div class="field-value">${e.email || "Not provided"}</div>
          </div>

          <div class="section">
            <h2>Campaign Details</h2>
            <div class="field-label">Campaign Title</div>
            <div class="field-value">${r.title || "Not provided"}</div>
            
            <div class="field-label">Fundraising Goal</div>
            <div class="field-value">$${r.goal || "5000"}</div>
            
            <div class="field-label">Category</div>
            <div class="field-value">${r.category || "Not provided"}</div>
            
            <div class="field-label">Location</div>
            <div class="field-value">${r.location || "Not provided"}</div>
            
            <div class="field-label">Beneficiary</div>
            <div class="field-value">${r.beneficiary || "Not provided"}</div>
          </div>

          <div class="section">
            <h2>Campaign Story</h2>
            <div class="field-value" style="white-space: pre-wrap;">${r.story || "Not provided"}</div>
          </div>

          ${
            e.qrCodeUrl
              ? `
            <div class="qr-section">
              <h2>Donation QR Code</h2>
              <p>Scan this code to donate</p>
              <img src="${e.qrCodeUrl}" alt="Donation QR Code" />
              <div class="url">${e.donationPageUrl || ""}</div>
            </div>
          `
              : ""
          }

          <div class="section">
            <h2>Next Steps Checklist</h2>
            <ul class="checklist">
              <li>Create GoFundMe account at gofundme.com/c/start</li>
              <li>Enter campaign details from this document</li>
              <li>Upload cover photo or video</li>
              <li>Review and publish campaign</li>
              <li>Connect bank account for withdrawals</li>
              <li>Share campaign using QR code and social media</li>
              <li>Post regular updates to engage donors</li>
            </ul>
          </div>

          <div class="footer">
            <p>Generated by CareConnect on ${new Date().toLocaleDateString()}</p>
            <p>For support, contact: workflown8n@gmail.com</p>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
              Print This Page
            </button>
          </div>
        </body>
      </html>
    `),
                          t.document.close(),
                          t.focus(),
                          setTimeout(() => {
                            t.print();
                          }, 250));
                      },
                      className:
                        "ml-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center whitespace-nowrap",
                      children: [
                        s.jsx(m, { className: "w-4 h-4 mr-2" }),
                        "Print Summary",
                      ],
                    }),
                  ],
                }),
              }),
              s.jsx("div", {
                className: "bg-gray-50 border border-gray-300 rounded-lg p-6",
                children: (0, s.jsxs)("div", {
                  className: "text-center",
                  children: [
                    s.jsx("h3", {
                      className: "text-lg font-semibold text-gray-900 mb-2",
                      children: "Download Everything",
                    }),
                    s.jsx("p", {
                      className: "text-sm text-gray-600 mb-4",
                      children:
                        "Get all files at once (QR code PNG + Word document)",
                    }),
                    s.jsx("button", {
                      onClick: c,
                      disabled: "all" === n,
                      className:
                        "px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium text-lg flex items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed",
                      children:
                        "all" === n
                          ? (0, s.jsxs)(s.Fragment, {
                              children: [
                                s.jsx("div", {
                                  className:
                                    "animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2",
                                }),
                                "Downloading...",
                              ],
                            })
                          : (0, s.jsxs)(s.Fragment, {
                              children: [
                                s.jsx(p.Z, { className: "w-5 h-5 mr-2" }),
                                "Download All Files",
                              ],
                            }),
                    }),
                  ],
                }),
              }),
              (0, s.jsxs)("div", {
                className: "bg-blue-50 border border-blue-200 rounded-lg p-6",
                children: [
                  s.jsx("h3", {
                    className: "text-sm font-semibold text-blue-900 mb-3",
                    children: "\uD83D\uDCE6 What's Included in Your Print Kit",
                  }),
                  (0, s.jsxs)("div", {
                    className: "space-y-2 text-sm text-blue-800",
                    children: [
                      (0, s.jsxs)("div", {
                        className: "flex items-start",
                        children: [
                          s.jsx("span", { className: "mr-2", children: "✓" }),
                          (0, s.jsxs)("span", {
                            children: [
                              s.jsx("strong", { children: "QR Code PNG:" }),
                              " High-resolution image for printing on flyers, posters, or business cards",
                            ],
                          }),
                        ],
                      }),
                      (0, s.jsxs)("div", {
                        className: "flex items-start",
                        children: [
                          s.jsx("span", { className: "mr-2", children: "✓" }),
                          (0, s.jsxs)("span", {
                            children: [
                              s.jsx("strong", {
                                children: "Campaign Draft (Word):",
                              }),
                              " Formatted document with title, story, goal, and all details",
                            ],
                          }),
                        ],
                      }),
                      (0, s.jsxs)("div", {
                        className: "flex items-start",
                        children: [
                          s.jsx("span", { className: "mr-2", children: "✓" }),
                          (0, s.jsxs)("span", {
                            children: [
                              s.jsx("strong", {
                                children: "Donation Page URL:",
                              }),
                              " Direct link to your CareConnect donation page",
                            ],
                          }),
                        ],
                      }),
                      (0, s.jsxs)("div", {
                        className: "flex items-start",
                        children: [
                          s.jsx("span", { className: "mr-2", children: "✓" }),
                          (0, s.jsxs)("span", {
                            children: [
                              s.jsx("strong", { children: "Print Summary:" }),
                              " One-page overview with QR code and checklist",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, s.jsxs)("div", {
                className:
                  "bg-yellow-50 border border-yellow-200 rounded-lg p-6",
                children: [
                  s.jsx("h3", {
                    className: "text-sm font-semibold text-yellow-900 mb-3",
                    children: "\uD83D\uDE80 Next Steps",
                  }),
                  (0, s.jsxs)("ol", {
                    className: "space-y-2 text-sm text-yellow-800",
                    children: [
                      (0, s.jsxs)("li", {
                        className: "flex items-start",
                        children: [
                          s.jsx("span", {
                            className: "mr-2 font-bold",
                            children: "1.",
                          }),
                          (0, s.jsxs)("span", {
                            children: [
                              "Visit ",
                              s.jsx("a", {
                                href: "https://www.gofundme.com/c/start",
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "underline",
                                children: "gofundme.com/c/start",
                              }),
                              " and create your campaign using the draft",
                            ],
                          }),
                        ],
                      }),
                      (0, s.jsxs)("li", {
                        className: "flex items-start",
                        children: [
                          s.jsx("span", {
                            className: "mr-2 font-bold",
                            children: "2.",
                          }),
                          s.jsx("span", {
                            children:
                              "Upload photos or videos to your GoFundMe campaign",
                          }),
                        ],
                      }),
                      (0, s.jsxs)("li", {
                        className: "flex items-start",
                        children: [
                          s.jsx("span", {
                            className: "mr-2 font-bold",
                            children: "3.",
                          }),
                          s.jsx("span", {
                            children:
                              "Publish your GoFundMe and connect your bank account",
                          }),
                        ],
                      }),
                      (0, s.jsxs)("li", {
                        className: "flex items-start",
                        children: [
                          s.jsx("span", {
                            className: "mr-2 font-bold",
                            children: "4.",
                          }),
                          s.jsx("span", {
                            children:
                              "Share your CareConnect QR code and donation link everywhere!",
                          }),
                        ],
                      }),
                      (0, s.jsxs)("li", {
                        className: "flex items-start",
                        children: [
                          s.jsx("span", {
                            className: "mr-2 font-bold",
                            children: "5.",
                          }),
                          s.jsx("span", {
                            children:
                              "Post regular updates to keep donors engaged",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, s.jsxs)("div", {
                className: "flex items-center justify-between pt-6 border-t",
                children: [
                  s.jsx("button", {
                    type: "button",
                    onClick: t,
                    className:
                      "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium",
                    children: "Back",
                  }),
                  s.jsx("button", {
                    onClick: () => (window.location.href = "/dashboard"),
                    className:
                      "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium",
                    children: "Go to Dashboard",
                  }),
                ],
              }),
            ],
          });
        }
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let k = (0, l.Z)("Send", [
          ["path", { d: "m22 2-7 20-4-9-9-4Z", key: "1q3vgg" }],
          ["path", { d: "M22 2 11 13", key: "nzbqef" }],
        ]);
        var E = r(20082);
        let T = [
            { value: "gofundme_blocked", label: "GoFundMe Account Issues" },
            { value: "qr_problem", label: "QR Code Not Working" },
            { value: "transcription_problem", label: "Transcription Issues" },
            {
              value: "missing_fields",
              label: "Missing or Incorrect Information",
            },
            { value: "download_problem", label: "Download or Print Issues" },
            { value: "other", label: "Other Issue" },
          ],
          P = {
            confirm_details: "Help with Confirming Details",
            qr_code: "Help with QR Code Generation",
            gofundme_draft: "Help with GoFundMe Draft",
            gofundme_wizard: "Help with GoFundMe Setup",
            general: "Get Help",
          };
        function I({ context: e, onClose: t, clientId: r }) {
          let [n, o] = (0, i.useState)({
              issueType: "gofundme_wizard" === e ? "gofundme_blocked" : "other",
              description: "",
              contactEmail: "",
              contactPhone: "",
            }),
            [l, d] = (0, i.useState)(!1),
            [h, u] = (0, i.useState)("idle"),
            f = (e, t) => {
              o((r) => ({ ...r, [e]: t }));
            },
            p = async (t) => {
              if ((t.preventDefault(), n.description.trim())) {
                (d(!0), u("idle"));
                try {
                  let t = await fetch("/api/support/tickets", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...n, context: e, clientId: r }),
                  });
                  (await t.json(), t.ok ? u("success") : u("error"));
                } catch (e) {
                  (console.error("[HelpModal] Error submitting ticket:", e),
                    u("error"));
                } finally {
                  d(!1);
                }
              }
            };
          return s.jsx("div", {
            className:
              "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
            children: (0, s.jsxs)("div", {
              className:
                "bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",
              children: [
                (0, s.jsxs)("div", {
                  className:
                    "sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between",
                  children: [
                    s.jsx("h2", {
                      className: "text-lg font-semibold text-gray-900",
                      children: P[e] || "Get Help",
                    }),
                    s.jsx("button", {
                      onClick: t,
                      className:
                        "text-gray-400 hover:text-gray-600 transition-colors",
                      disabled: l,
                      children: s.jsx(E.Z, { className: "w-6 h-6" }),
                    }),
                  ],
                }),
                s.jsx("div", {
                  className: "px-6 py-6",
                  children:
                    "success" === h
                      ? (0, s.jsxs)("div", {
                          className: "text-center py-8",
                          children: [
                            s.jsx(a.Z, {
                              className:
                                "w-16 h-16 text-green-600 mx-auto mb-4",
                            }),
                            s.jsx("h3", {
                              className:
                                "text-xl font-semibold text-gray-900 mb-2",
                              children: "Message Received!",
                            }),
                            s.jsx("p", {
                              className: "text-gray-600 mb-6",
                              children:
                                "Thank you for reaching out. We've received your support request and will respond as soon as possible.",
                            }),
                            (0, s.jsxs)("p", {
                              className: "text-sm text-gray-500 mb-4",
                              children: [
                                "You should receive a confirmation email at ",
                                s.jsx("strong", {
                                  children: "workflown8n@gmail.com",
                                }),
                              ],
                            }),
                            s.jsx("button", {
                              onClick: t,
                              className:
                                "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium",
                              children: "Close",
                            }),
                          ],
                        })
                      : "fallback" === h
                        ? null
                        : "error" === h
                          ? (0, s.jsxs)("div", {
                              className: "text-center py-8",
                              children: [
                                s.jsx(c.Z, {
                                  className:
                                    "w-16 h-16 text-red-600 mx-auto mb-4",
                                }),
                                s.jsx("h3", {
                                  className:
                                    "text-xl font-semibold text-gray-900 mb-2",
                                  children: "Submission Error",
                                }),
                                s.jsx("p", {
                                  className: "text-gray-600 mb-6",
                                  children:
                                    "We encountered an error submitting your support request. Please try again or visit the admin health page to view support logs.",
                                }),
                                (0, s.jsxs)("div", {
                                  className: "space-y-3",
                                  children: [
                                    s.jsx("p", {
                                      className: "text-sm text-gray-700",
                                      children:
                                        "Visit the admin health page to view support logs.",
                                    }),
                                    s.jsx("button", {
                                      onClick: () => u("idle"),
                                      className:
                                        "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium",
                                      children: "Try Again",
                                    }),
                                  ],
                                }),
                              ],
                            })
                          : (0, s.jsxs)("form", {
                              onSubmit: p,
                              className: "space-y-4",
                              children: [
                                (0, s.jsxs)("div", {
                                  children: [
                                    (0, s.jsxs)("label", {
                                      className:
                                        "block text-sm font-medium text-gray-700 mb-1",
                                      children: [
                                        "What do you need help with? ",
                                        s.jsx("span", {
                                          className: "text-red-500",
                                          children: "*",
                                        }),
                                      ],
                                    }),
                                    s.jsx("select", {
                                      value: n.issueType,
                                      onChange: (e) =>
                                        f("issueType", e.target.value),
                                      className:
                                        "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                      required: !0,
                                      children: T.map((e) =>
                                        s.jsx(
                                          "option",
                                          { value: e.value, children: e.label },
                                          e.value,
                                        ),
                                      ),
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  children: [
                                    (0, s.jsxs)("label", {
                                      className:
                                        "block text-sm font-medium text-gray-700 mb-1",
                                      children: [
                                        "Please describe your issue ",
                                        s.jsx("span", {
                                          className: "text-red-500",
                                          children: "*",
                                        }),
                                      ],
                                    }),
                                    s.jsx("textarea", {
                                      value: n.description,
                                      onChange: (e) =>
                                        f("description", e.target.value),
                                      className:
                                        "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                      rows: 6,
                                      placeholder:
                                        "Tell us what's happening and we'll do our best to help...",
                                      required: !0,
                                    }),
                                    s.jsx("p", {
                                      className: "mt-1 text-xs text-gray-500",
                                      children:
                                        "Be as specific as possible so we can assist you quickly",
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  children: [
                                    s.jsx("label", {
                                      className:
                                        "block text-sm font-medium text-gray-700 mb-1",
                                      children: "Contact Email (Optional)",
                                    }),
                                    s.jsx("input", {
                                      type: "email",
                                      value: n.contactEmail,
                                      onChange: (e) =>
                                        f("contactEmail", e.target.value),
                                      className:
                                        "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                      placeholder: "your.email@example.com",
                                    }),
                                    s.jsx("p", {
                                      className: "mt-1 text-xs text-gray-500",
                                      children:
                                        "If you'd like us to respond directly to you",
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  children: [
                                    s.jsx("label", {
                                      className:
                                        "block text-sm font-medium text-gray-700 mb-1",
                                      children: "Contact Phone (Optional)",
                                    }),
                                    s.jsx("input", {
                                      type: "tel",
                                      value: n.contactPhone,
                                      onChange: (e) =>
                                        f("contactPhone", e.target.value),
                                      className:
                                        "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                      placeholder: "(555) 123-4567",
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  className:
                                    "bg-blue-50 border border-blue-200 rounded-lg p-4",
                                  children: [
                                    (0, s.jsxs)("p", {
                                      className: "text-sm text-blue-800",
                                      children: [
                                        s.jsx("strong", {
                                          children:
                                            "Your message will be sent to:",
                                        }),
                                        " workflown8n@gmail.com",
                                      ],
                                    }),
                                    s.jsx("p", {
                                      className: "text-xs text-blue-700 mt-1",
                                      children:
                                        "We typically respond within 24-48 hours",
                                    }),
                                  ],
                                }),
                                (0, s.jsxs)("div", {
                                  className:
                                    "flex items-center justify-end space-x-3 pt-4 border-t",
                                  children: [
                                    s.jsx("button", {
                                      type: "button",
                                      onClick: t,
                                      className:
                                        "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium",
                                      disabled: l,
                                      children: "Cancel",
                                    }),
                                    s.jsx("button", {
                                      type: "submit",
                                      disabled: l || !n.description.trim(),
                                      className:
                                        "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed",
                                      children: l
                                        ? (0, s.jsxs)(s.Fragment, {
                                            children: [
                                              s.jsx("div", {
                                                className:
                                                  "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2",
                                              }),
                                              "Submitting...",
                                            ],
                                          })
                                        : (0, s.jsxs)(s.Fragment, {
                                            children: [
                                              s.jsx(k, {
                                                className: "w-4 h-4 mr-2",
                                              }),
                                              "Submit Request",
                                            ],
                                          }),
                                    }),
                                  ],
                                }),
                              ],
                            }),
                }),
              ],
            }),
          });
        }
        let A = [
          {
            id: 1,
            title: "Confirm Your Details",
            description: "Verify and complete information",
          },
          {
            id: 2,
            title: "Generate Donation QR Code",
            description: "Create shareable donation link",
          },
          {
            id: 3,
            title: "Prepare GoFundMe Draft",
            description: "Review auto-generated content",
          },
          {
            id: 4,
            title: "Finalize GoFundMe Manually",
            description: "Step-by-step guide",
          },
          {
            id: 5,
            title: "Download Print Kit",
            description: "Get all materials",
          },
        ];
        function R() {
          let e = (0, o.useParams)();
          (0, o.useRouter)();
          let t = e?.clientId || "",
            [r, l] = (0, i.useState)(1),
            [c, h] = (0, i.useState)({
              fullName: "",
              zipCode: "",
              dateOfBirth: "",
              email: "",
              phone: "",
              consent: !1,
              extractedFields: {},
              missingFields: [],
              followUpQuestions: [],
            }),
            [f, p] = (0, i.useState)(!0),
            [m, g] = (0, i.useState)(!1),
            [x, y] = (0, i.useState)("");
          ((0, i.useEffect)(() => {
            let e = async () => {
              p(!0);
              try {
                let e = localStorage.getItem(`funding-wizard-${t}`);
                e && h(JSON.parse(e));
                let r = await fetch(`/api/analysis/${t}`);
                if (r.ok) {
                  let e = await r.json();
                  h((t) => ({
                    ...t,
                    extractedFields: e.extractedFields || {},
                    missingFields: e.missingFields || [],
                    followUpQuestions: e.followUpQuestions || [],
                    fullName: e.extractedFields?.name?.value || t.fullName,
                    zipCode: w(e.extractedFields?.location?.value) || t.zipCode,
                  }));
                }
              } catch (e) {
                console.error("[FundingWizard] Error loading client data:", e);
              } finally {
                p(!1);
              }
            };
            t && e();
          }, [t]),
            (0, i.useEffect)(() => {
              !f &&
                t &&
                localStorage.setItem(`funding-wizard-${t}`, JSON.stringify(c));
            }, [c, t, f]));
          let w = (e) => {
              if (!e) return "";
              let t = e.match(/\b\d{5}\b/);
              return t ? t[0] : "";
            },
            N = (e) => {
              (h((t) => ({ ...t, ...e })), r < A.length && l(r + 1));
            },
            j = () => {
              r > 1 && l(r - 1);
            },
            k = (e) => {
              (y(e), g(!0));
            };
          return f
            ? s.jsx("div", {
                className:
                  "min-h-screen bg-gray-50 flex items-center justify-center",
                children: (0, s.jsxs)("div", {
                  className: "text-center",
                  children: [
                    s.jsx("div", {
                      className:
                        "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4",
                    }),
                    s.jsx("p", {
                      className: "text-gray-600",
                      children: "Loading your information...",
                    }),
                  ],
                }),
              })
            : (0, s.jsxs)("div", {
                className: "min-h-screen bg-gray-50 py-8",
                children: [
                  (0, s.jsxs)("div", {
                    className: "max-w-6xl mx-auto px-4",
                    children: [
                      (0, s.jsxs)("div", {
                        className: "bg-white rounded-lg shadow-sm p-6 mb-6",
                        children: [
                          s.jsx("h1", {
                            className: "text-2xl font-bold text-gray-900 mb-2",
                            children: "Funding Setup Wizard",
                          }),
                          s.jsx("p", {
                            className: "text-gray-600",
                            children:
                              "Complete the following steps to finalize your fundraising campaign",
                          }),
                        ],
                      }),
                      s.jsx("div", {
                        className: "bg-white rounded-lg shadow-sm p-6 mb-6",
                        children: s.jsx("div", {
                          className: "mb-8",
                          children: s.jsx("div", {
                            className: "flex items-center justify-between",
                            children: A.map((e, t) =>
                              (0, s.jsxs)(
                                n().Fragment,
                                {
                                  children: [
                                    (0, s.jsxs)("div", {
                                      className:
                                        "flex flex-col items-center flex-1",
                                      children: [
                                        s.jsx("div", {
                                          className: `
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  transition-colors duration-200
                  ${r === e.id ? "bg-blue-600 text-white" : r > e.id ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"}
                `,
                                          children:
                                            r > e.id
                                              ? s.jsx(a.Z, {
                                                  className: "w-5 h-5",
                                                })
                                              : e.id,
                                        }),
                                        (0, s.jsxs)("div", {
                                          className: "mt-2 text-center",
                                          children: [
                                            s.jsx("p", {
                                              className: `text-sm font-medium ${r === e.id ? "text-blue-600" : "text-gray-600"}`,
                                              children: e.title,
                                            }),
                                            s.jsx("p", {
                                              className:
                                                "text-xs text-gray-500 mt-1 max-w-[150px]",
                                              children: e.description,
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    t < A.length - 1 &&
                                      s.jsx("div", {
                                        className: `
                  h-1 flex-1 mx-2 transition-colors duration-200
                  ${r > e.id ? "bg-green-600" : "bg-gray-200"}
                `,
                                      }),
                                  ],
                                },
                                e.id,
                              ),
                            ),
                          }),
                        }),
                      }),
                      s.jsx("div", {
                        className: "bg-white rounded-lg shadow-sm p-8",
                        children: (() => {
                          switch (r) {
                            case 1:
                              return s.jsx(u, {
                                data: c,
                                onComplete: N,
                                onBack: j,
                                onHelp: () => k("confirm_details"),
                              });
                            case 2:
                              return s.jsx(b, {
                                data: c,
                                onComplete: N,
                                onBack: j,
                                onHelp: () => k("qr_code"),
                                clientId: t,
                              });
                            case 3:
                              return s.jsx(v, {
                                data: c,
                                onComplete: N,
                                onBack: j,
                                onHelp: () => k("gofundme_draft"),
                                clientId: t,
                              });
                            case 4:
                              return s.jsx(_, {
                                data: c,
                                onComplete: N,
                                onBack: j,
                                onHelp: () => k("gofundme_wizard"),
                              });
                            case 5:
                              return s.jsx(C, {
                                data: c,
                                onBack: j,
                                clientId: t,
                              });
                            default:
                              return null;
                          }
                        })(),
                      }),
                      s.jsx("button", {
                        onClick: () => k("general"),
                        className:
                          "fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors",
                        title: "Need help?",
                        children: s.jsx(d, { className: "w-6 h-6" }),
                      }),
                    ],
                  }),
                  m &&
                    s.jsx(I, { context: x, onClose: () => g(!1), clientId: t }),
                ],
              });
        }
      },
      56253: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { Providers: () => a }));
        var s = r(73658),
          i = r(58758),
          n = r(60459),
          o = r(55459);
        function a({ children: e }) {
          let [t] = (0, o.useState)(
            () =>
              new i.S({
                defaultOptions: { queries: { staleTime: 3e5, gcTime: 6e5 } },
              }),
          );
          return s.jsx(n.aH, { client: t, children: e });
        }
      },
      9690: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { default: () => l }));
        var s = r(73658),
          i = r(84874),
          n = r.n(i),
          o = r(32241),
          a = r(17872);
        function l() {
          let e = (0, o.usePathname)();
          return "/system" === e
            ? null
            : s.jsx("header", {
                className: "bg-white shadow-sm border-b border-gray-200",
                children: s.jsx("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                  children: (0, s.jsxs)("div", {
                    className: "flex justify-between items-center py-4",
                    children: [
                      (0, s.jsxs)("div", {
                        className: "flex items-center gap-4",
                        children: [
                          s.jsx(n(), {
                            href: "/",
                            className: "flex items-center gap-2",
                            children: s.jsx("div", {
                              className: "text-3xl font-black text-blue-900",
                              children: "CareConnect",
                            }),
                          }),
                          s.jsx("div", {
                            className:
                              "hidden sm:block text-sm text-gray-600 font-medium border-l border-gray-300 pl-4",
                            children: "Community-Supported Homeless Initiative",
                          }),
                        ],
                      }),
                      (0, s.jsxs)("div", {
                        className: "flex items-center gap-6",
                        children: [
                          (0, s.jsxs)("nav", {
                            className: "hidden md:flex items-center gap-6",
                            children: [
                              s.jsx(n(), {
                                href: "/about",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "About",
                              }),
                              s.jsx(n(), {
                                href: "/resources",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Resources",
                              }),
                              s.jsx(n(), {
                                href: "/find",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Find",
                              }),
                              s.jsx(n(), {
                                href: "/support",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Support",
                              }),
                            ],
                          }),
                          (0, s.jsxs)(n(), {
                            href: "/system",
                            className:
                              "flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition group",
                            title: "System Diagnostics",
                            children: [
                              s.jsx(a.Z, {
                                size: 16,
                                className: "group-hover:text-blue-600",
                              }),
                              s.jsx("span", {
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
      56724: (e) => {
        "use strict";
        var t = {
          single_source_shortest_paths: function (e, r, s) {
            var i,
              n,
              o,
              a,
              l,
              d,
              c,
              h = {},
              u = {};
            u[r] = 0;
            var f = t.PriorityQueue.make();
            for (f.push(r, 0); !f.empty(); )
              for (o in ((n = (i = f.pop()).value),
              (a = i.cost),
              (l = e[n] || {})))
                l.hasOwnProperty(o) &&
                  ((d = a + l[o]),
                  (c = u[o]),
                  (void 0 === u[o] || c > d) &&
                    ((u[o] = d), f.push(o, d), (h[o] = n)));
            if (void 0 !== s && void 0 === u[s])
              throw Error(
                ["Could not find a path from ", r, " to ", s, "."].join(""),
              );
            return h;
          },
          extract_shortest_path_from_predecessor_list: function (e, t) {
            for (var r = [], s = t; s; ) (r.push(s), e[s], (s = e[s]));
            return (r.reverse(), r);
          },
          find_path: function (e, r, s) {
            var i = t.single_source_shortest_paths(e, r, s);
            return t.extract_shortest_path_from_predecessor_list(i, s);
          },
          PriorityQueue: {
            make: function (e) {
              var r,
                s = t.PriorityQueue,
                i = {};
              for (r in ((e = e || {}), s))
                s.hasOwnProperty(r) && (i[r] = s[r]);
              return (
                (i.queue = []),
                (i.sorter = e.sorter || s.default_sorter),
                i
              );
            },
            default_sorter: function (e, t) {
              return e.cost - t.cost;
            },
            push: function (e, t) {
              (this.queue.push({ value: e, cost: t }),
                this.queue.sort(this.sorter));
            },
            pop: function () {
              return this.queue.shift();
            },
            empty: function () {
              return 0 === this.queue.length;
            },
          },
        };
        e.exports = t;
      },
      40289: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var s = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, s.Z)("AlertCircle", [
          ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
          ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
          [
            "line",
            { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" },
          ],
        ]);
      },
      81165: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var s = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, s.Z)("CheckCircle", [
          ["path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14", key: "g774vq" }],
          ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }],
        ]);
      },
      3228: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var s = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, s.Z)("Copy", [
          [
            "rect",
            {
              width: "14",
              height: "14",
              x: "8",
              y: "8",
              rx: "2",
              ry: "2",
              key: "17jyea",
            },
          ],
          [
            "path",
            {
              d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
              key: "zix9uf",
            },
          ],
        ]);
      },
      96849: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var s = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, s.Z)("Download", [
          [
            "path",
            { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" },
          ],
          ["polyline", { points: "7 10 12 15 17 10", key: "2ggqvy" }],
          ["line", { x1: "12", x2: "12", y1: "15", y2: "3", key: "1vk2je" }],
        ]);
      },
      64542: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var s = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, s.Z)("ExternalLink", [
          [
            "path",
            {
              d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
              key: "a6xqqp",
            },
          ],
          ["polyline", { points: "15 3 21 3 21 9", key: "mznyad" }],
          ["line", { x1: "10", x2: "21", y1: "14", y2: "3", key: "18c3s4" }],
        ]);
      },
      62939: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var s = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, s.Z)("FileText", [
          [
            "path",
            {
              d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",
              key: "1nnpy2",
            },
          ],
          ["polyline", { points: "14 2 14 8 20 8", key: "1ew0cm" }],
          ["line", { x1: "16", x2: "8", y1: "13", y2: "13", key: "14keom" }],
          ["line", { x1: "16", x2: "8", y1: "17", y2: "17", key: "17nazh" }],
          ["line", { x1: "10", x2: "8", y1: "9", y2: "9", key: "1a5vjj" }],
        ]);
      },
      20082: (e, t, r) => {
        "use strict";
        r.d(t, { Z: () => i });
        var s = r(80600);
        /**
         * @license lucide-react v0.294.0 - ISC
         *
         * This source code is licensed under the ISC license.
         * See the LICENSE file in the root directory of this source tree.
         */ let i = (0, s.Z)("X", [
          ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
          ["path", { d: "m6 6 12 12", key: "d8bk6v" }],
        ]);
      },
      74263: (e, t, r) => {
        "use strict";
        let s = r(36255),
          i = [
            function () {},
            function (e, t, r, s) {
              if (s === t.length) throw Error("Ran out of data");
              let i = t[s];
              ((e[r] = i), (e[r + 1] = i), (e[r + 2] = i), (e[r + 3] = 255));
            },
            function (e, t, r, s) {
              if (s + 1 >= t.length) throw Error("Ran out of data");
              let i = t[s];
              ((e[r] = i),
                (e[r + 1] = i),
                (e[r + 2] = i),
                (e[r + 3] = t[s + 1]));
            },
            function (e, t, r, s) {
              if (s + 2 >= t.length) throw Error("Ran out of data");
              ((e[r] = t[s]),
                (e[r + 1] = t[s + 1]),
                (e[r + 2] = t[s + 2]),
                (e[r + 3] = 255));
            },
            function (e, t, r, s) {
              if (s + 3 >= t.length) throw Error("Ran out of data");
              ((e[r] = t[s]),
                (e[r + 1] = t[s + 1]),
                (e[r + 2] = t[s + 2]),
                (e[r + 3] = t[s + 3]));
            },
          ],
          n = [
            function () {},
            function (e, t, r, s) {
              let i = t[0];
              ((e[r] = i), (e[r + 1] = i), (e[r + 2] = i), (e[r + 3] = s));
            },
            function (e, t, r) {
              let s = t[0];
              ((e[r] = s), (e[r + 1] = s), (e[r + 2] = s), (e[r + 3] = t[1]));
            },
            function (e, t, r, s) {
              ((e[r] = t[0]),
                (e[r + 1] = t[1]),
                (e[r + 2] = t[2]),
                (e[r + 3] = s));
            },
            function (e, t, r) {
              ((e[r] = t[0]),
                (e[r + 1] = t[1]),
                (e[r + 2] = t[2]),
                (e[r + 3] = t[3]));
            },
          ];
        t.dataToBitMap = function (e, t) {
          let r,
            o,
            a,
            l,
            d = t.width,
            c = t.height,
            h = t.depth,
            u = t.bpp,
            f = t.interlace;
          if (8 !== h) {
            let t, s;
            ((t = []),
              (s = 0),
              (r = {
                get: function (r) {
                  for (; t.length < r; )
                    !(function () {
                      let r, i, n, o;
                      if (s === e.length) throw Error("Ran out of data");
                      let a = e[s];
                      switch ((s++, h)) {
                        default:
                          throw Error("unrecognised depth");
                        case 16:
                          ((n = e[s]), s++, t.push((a << 8) + n));
                          break;
                        case 4:
                          ((n = 15 & a), (o = a >> 4), t.push(o, n));
                          break;
                        case 2:
                          ((r = 3 & a),
                            (i = (a >> 2) & 3),
                            (n = (a >> 4) & 3),
                            (o = (a >> 6) & 3),
                            t.push(o, n, i, r));
                          break;
                        case 1:
                          ((r = (a >> 4) & 1),
                            (i = (a >> 5) & 1),
                            (n = (a >> 6) & 1),
                            (o = (a >> 7) & 1),
                            t.push(
                              o,
                              n,
                              i,
                              r,
                              (a >> 3) & 1,
                              (a >> 2) & 1,
                              (a >> 1) & 1,
                              1 & a,
                            ));
                      }
                    })();
                  let i = t.slice(0, r);
                  return ((t = t.slice(r)), i);
                },
                resetAfterLine: function () {
                  t.length = 0;
                },
                end: function () {
                  if (s !== e.length) throw Error("extra data found");
                },
              }));
          }
          o = h <= 8 ? Buffer.alloc(d * c * 4) : new Uint16Array(d * c * 4);
          let p = Math.pow(2, h) - 1,
            m = 0;
          if (f)
            ((a = s.getImagePasses(d, c)), (l = s.getInterlaceIterator(d, c)));
          else {
            let e = 0;
            ((l = function () {
              let t = e;
              return ((e += 4), t);
            }),
              (a = [{ width: d, height: c }]));
          }
          for (let t = 0; t < a.length; t++)
            8 === h
              ? (m = (function (e, t, r, s, n, o) {
                  let a = e.width,
                    l = e.height,
                    d = e.index;
                  for (let e = 0; e < l; e++)
                    for (let l = 0; l < a; l++) {
                      let a = r(l, e, d);
                      (i[s](t, n, a, o), (o += s));
                    }
                  return o;
                })(a[t], o, l, u, e, m))
              : (function (e, t, r, s, i, o) {
                  let a = e.width,
                    l = e.height,
                    d = e.index;
                  for (let e = 0; e < l; e++) {
                    for (let l = 0; l < a; l++) {
                      let a = i.get(s),
                        c = r(l, e, d);
                      n[s](t, a, c, o);
                    }
                    i.resetAfterLine();
                  }
                })(a[t], o, l, u, r, p);
          if (8 === h) {
            if (m !== e.length) throw Error("extra data found");
          } else r.end();
          return o;
        };
      },
      60143: (e, t, r) => {
        "use strict";
        let s = r(40587);
        e.exports = function (e, t, r, i) {
          let n =
            -1 !==
            [s.COLORTYPE_COLOR_ALPHA, s.COLORTYPE_ALPHA].indexOf(i.colorType);
          if (i.colorType === i.inputColorType) {
            let t;
            let r =
              ((t = new ArrayBuffer(2)),
              new DataView(t).setInt16(0, 256, !0),
              256 !== new Int16Array(t)[0]);
            if (8 === i.bitDepth || (16 === i.bitDepth && r)) return e;
          }
          let o = 16 !== i.bitDepth ? e : new Uint16Array(e.buffer),
            a = 255,
            l = s.COLORTYPE_TO_BPP_MAP[i.inputColorType];
          4 !== l || i.inputHasAlpha || (l = 3);
          let d = s.COLORTYPE_TO_BPP_MAP[i.colorType];
          16 === i.bitDepth && ((a = 65535), (d *= 2));
          let c = Buffer.alloc(t * r * d),
            h = 0,
            u = 0,
            f = i.bgColor || {};
          (void 0 === f.red && (f.red = a),
            void 0 === f.green && (f.green = a),
            void 0 === f.blue && (f.blue = a));
          for (let e = 0; e < r; e++)
            for (let e = 0; e < t; e++) {
              let e = (function () {
                let e, t, r;
                let l = a;
                switch (i.inputColorType) {
                  case s.COLORTYPE_COLOR_ALPHA:
                    ((l = o[h + 3]),
                      (e = o[h]),
                      (t = o[h + 1]),
                      (r = o[h + 2]));
                    break;
                  case s.COLORTYPE_COLOR:
                    ((e = o[h]), (t = o[h + 1]), (r = o[h + 2]));
                    break;
                  case s.COLORTYPE_ALPHA:
                    ((l = o[h + 1]), (t = e = o[h]), (r = e));
                    break;
                  case s.COLORTYPE_GRAYSCALE:
                    ((t = e = o[h]), (r = e));
                    break;
                  default:
                    throw Error(
                      "input color type:" +
                        i.inputColorType +
                        " is not supported at present",
                    );
                }
                return (
                  i.inputHasAlpha &&
                    !n &&
                    ((l /= a),
                    (e = Math.min(
                      Math.max(Math.round((1 - l) * f.red + l * e), 0),
                      a,
                    )),
                    (t = Math.min(
                      Math.max(Math.round((1 - l) * f.green + l * t), 0),
                      a,
                    )),
                    (r = Math.min(
                      Math.max(Math.round((1 - l) * f.blue + l * r), 0),
                      a,
                    ))),
                  { red: e, green: t, blue: r, alpha: l }
                );
              })(o, h);
              switch (i.colorType) {
                case s.COLORTYPE_COLOR_ALPHA:
                case s.COLORTYPE_COLOR:
                  8 === i.bitDepth
                    ? ((c[u] = e.red),
                      (c[u + 1] = e.green),
                      (c[u + 2] = e.blue),
                      n && (c[u + 3] = e.alpha))
                    : (c.writeUInt16BE(e.red, u),
                      c.writeUInt16BE(e.green, u + 2),
                      c.writeUInt16BE(e.blue, u + 4),
                      n && c.writeUInt16BE(e.alpha, u + 6));
                  break;
                case s.COLORTYPE_ALPHA:
                case s.COLORTYPE_GRAYSCALE: {
                  let t = (e.red + e.green + e.blue) / 3;
                  8 === i.bitDepth
                    ? ((c[u] = t), n && (c[u + 1] = e.alpha))
                    : (c.writeUInt16BE(t, u),
                      n && c.writeUInt16BE(e.alpha, u + 2));
                  break;
                }
                default:
                  throw Error("unrecognised color Type " + i.colorType);
              }
              ((h += l), (u += d));
            }
          return c;
        };
      },
      57580: (e, t, r) => {
        "use strict";
        let s = r(73837),
          i = r(12781),
          n = (e.exports = function () {
            (i.call(this),
              (this._buffers = []),
              (this._buffered = 0),
              (this._reads = []),
              (this._paused = !1),
              (this._encoding = "utf8"),
              (this.writable = !0));
          });
        (s.inherits(n, i),
          (n.prototype.read = function (e, t) {
            (this._reads.push({
              length: Math.abs(e),
              allowLess: e < 0,
              func: t,
            }),
              process.nextTick(
                function () {
                  (this._process(),
                    this._paused &&
                      this._reads &&
                      this._reads.length > 0 &&
                      ((this._paused = !1), this.emit("drain")));
                }.bind(this),
              ));
          }),
          (n.prototype.write = function (e, t) {
            let r;
            return this.writable
              ? ((r = Buffer.isBuffer(e)
                  ? e
                  : Buffer.from(e, t || this._encoding)),
                this._buffers.push(r),
                (this._buffered += r.length),
                this._process(),
                this._reads && 0 === this._reads.length && (this._paused = !0),
                this.writable && !this._paused)
              : (this.emit("error", Error("Stream not writable")), !1);
          }),
          (n.prototype.end = function (e, t) {
            (e && this.write(e, t),
              (this.writable = !1),
              this._buffers &&
                (0 === this._buffers.length
                  ? this._end()
                  : (this._buffers.push(null), this._process())));
          }),
          (n.prototype.destroySoon = n.prototype.end),
          (n.prototype._end = function () {
            (this._reads.length > 0 &&
              this.emit("error", Error("Unexpected end of input")),
              this.destroy());
          }),
          (n.prototype.destroy = function () {
            this._buffers &&
              ((this.writable = !1),
              (this._reads = null),
              (this._buffers = null),
              this.emit("close"));
          }),
          (n.prototype._processReadAllowingLess = function (e) {
            this._reads.shift();
            let t = this._buffers[0];
            t.length > e.length
              ? ((this._buffered -= e.length),
                (this._buffers[0] = t.slice(e.length)),
                e.func.call(this, t.slice(0, e.length)))
              : ((this._buffered -= t.length),
                this._buffers.shift(),
                e.func.call(this, t));
          }),
          (n.prototype._processRead = function (e) {
            this._reads.shift();
            let t = 0,
              r = 0,
              s = Buffer.alloc(e.length);
            for (; t < e.length; ) {
              let i = this._buffers[r++],
                n = Math.min(i.length, e.length - t);
              (i.copy(s, t, 0, n),
                (t += n),
                n !== i.length && (this._buffers[--r] = i.slice(n)));
            }
            (r > 0 && this._buffers.splice(0, r),
              (this._buffered -= e.length),
              e.func.call(this, s));
          }),
          (n.prototype._process = function () {
            try {
              for (
                ;
                this._buffered > 0 && this._reads && this._reads.length > 0;
              ) {
                let e = this._reads[0];
                if (e.allowLess) this._processReadAllowingLess(e);
                else if (this._buffered >= e.length) this._processRead(e);
                else break;
              }
              this._buffers && !this.writable && this._end();
            } catch (e) {
              this.emit("error", e);
            }
          }));
      },
      40587: (e) => {
        "use strict";
        e.exports = {
          PNG_SIGNATURE: [137, 80, 78, 71, 13, 10, 26, 10],
          TYPE_IHDR: 1229472850,
          TYPE_IEND: 1229278788,
          TYPE_IDAT: 1229209940,
          TYPE_PLTE: 1347179589,
          TYPE_tRNS: 1951551059,
          TYPE_gAMA: 1732332865,
          COLORTYPE_GRAYSCALE: 0,
          COLORTYPE_PALETTE: 1,
          COLORTYPE_COLOR: 2,
          COLORTYPE_ALPHA: 4,
          COLORTYPE_PALETTE_COLOR: 3,
          COLORTYPE_COLOR_ALPHA: 6,
          COLORTYPE_TO_BPP_MAP: { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 },
          GAMMA_DIVISION: 1e5,
        };
      },
      91435: (e) => {
        "use strict";
        let t = [];
        !(function () {
          for (let e = 0; e < 256; e++) {
            let r = e;
            for (let e = 0; e < 8; e++)
              1 & r ? (r = 3988292384 ^ (r >>> 1)) : (r >>>= 1);
            t[e] = r;
          }
        })();
        let r = (e.exports = function () {
          this._crc = -1;
        });
        ((r.prototype.write = function (e) {
          for (let r = 0; r < e.length; r++)
            this._crc = t[(this._crc ^ e[r]) & 255] ^ (this._crc >>> 8);
          return !0;
        }),
          (r.prototype.crc32 = function () {
            return -1 ^ this._crc;
          }),
          (r.crc32 = function (e) {
            let r = -1;
            for (let s = 0; s < e.length; s++)
              r = t[(r ^ e[s]) & 255] ^ (r >>> 8);
            return -1 ^ r;
          }));
      },
      96740: (e, t, r) => {
        "use strict";
        let s = r(53248),
          i = {
            0: function (e, t, r, s, i) {
              for (let n = 0; n < r; n++) s[i + n] = e[t + n];
            },
            1: function (e, t, r, s, i, n) {
              for (let o = 0; o < r; o++) {
                let r = o >= n ? e[t + o - n] : 0,
                  a = e[t + o] - r;
                s[i + o] = a;
              }
            },
            2: function (e, t, r, s, i) {
              for (let n = 0; n < r; n++) {
                let o = t > 0 ? e[t + n - r] : 0,
                  a = e[t + n] - o;
                s[i + n] = a;
              }
            },
            3: function (e, t, r, s, i, n) {
              for (let o = 0; o < r; o++) {
                let a = o >= n ? e[t + o - n] : 0,
                  l = t > 0 ? e[t + o - r] : 0,
                  d = e[t + o] - ((a + l) >> 1);
                s[i + o] = d;
              }
            },
            4: function (e, t, r, i, n, o) {
              for (let a = 0; a < r; a++) {
                let l = a >= o ? e[t + a - o] : 0,
                  d = t > 0 ? e[t + a - r] : 0,
                  c = t > 0 && a >= o ? e[t + a - (r + o)] : 0,
                  h = e[t + a] - s(l, d, c);
                i[n + a] = h;
              }
            },
          },
          n = {
            0: function (e, t, r) {
              let s = 0,
                i = t + r;
              for (let r = t; r < i; r++) s += Math.abs(e[r]);
              return s;
            },
            1: function (e, t, r, s) {
              let i = 0;
              for (let n = 0; n < r; n++) {
                let r = n >= s ? e[t + n - s] : 0;
                i += Math.abs(e[t + n] - r);
              }
              return i;
            },
            2: function (e, t, r) {
              let s = 0,
                i = t + r;
              for (let n = t; n < i; n++) {
                let i = t > 0 ? e[n - r] : 0;
                s += Math.abs(e[n] - i);
              }
              return s;
            },
            3: function (e, t, r, s) {
              let i = 0;
              for (let n = 0; n < r; n++) {
                let o = n >= s ? e[t + n - s] : 0,
                  a = t > 0 ? e[t + n - r] : 0;
                i += Math.abs(e[t + n] - ((o + a) >> 1));
              }
              return i;
            },
            4: function (e, t, r, i) {
              let n = 0;
              for (let o = 0; o < r; o++) {
                let a = o >= i ? e[t + o - i] : 0,
                  l = t > 0 ? e[t + o - r] : 0,
                  d = t > 0 && o >= i ? e[t + o - (r + i)] : 0;
                n += Math.abs(e[t + o] - s(a, l, d));
              }
              return n;
            },
          };
        e.exports = function (e, t, r, s, o) {
          let a;
          if ("filterType" in s && -1 !== s.filterType) {
            if ("number" == typeof s.filterType) a = [s.filterType];
            else throw Error("unrecognised filter types");
          } else a = [0, 1, 2, 3, 4];
          16 === s.bitDepth && (o *= 2);
          let l = t * o,
            d = 0,
            c = 0,
            h = Buffer.alloc((l + 1) * r),
            u = a[0];
          for (let t = 0; t < r; t++) {
            if (a.length > 1) {
              let t = 1 / 0;
              for (let r = 0; r < a.length; r++) {
                let s = n[a[r]](e, c, l, o);
                s < t && ((u = a[r]), (t = s));
              }
            }
            ((h[d] = u), d++, i[u](e, c, l, h, d, o), (d += l), (c += l));
          }
          return h;
        };
      },
      78318: (e, t, r) => {
        "use strict";
        let s = r(73837),
          i = r(57580),
          n = r(21335),
          o = (e.exports = function (e) {
            i.call(this);
            let t = [],
              r = this;
            ((this._filter = new n(e, {
              read: this.read.bind(this),
              write: function (e) {
                t.push(e);
              },
              complete: function () {
                r.emit("complete", Buffer.concat(t));
              },
            })),
              this._filter.start());
          });
        s.inherits(o, i);
      },
      43679: (e, t, r) => {
        "use strict";
        let s = r(95648),
          i = r(21335);
        t.process = function (e, t) {
          let r = [],
            n = new s(e);
          return (
            new i(t, {
              read: n.read.bind(n),
              write: function (e) {
                r.push(e);
              },
              complete: function () {},
            }).start(),
            n.process(),
            Buffer.concat(r)
          );
        };
      },
      21335: (e, t, r) => {
        "use strict";
        let s = r(36255),
          i = r(53248);
        function n(e, t, r) {
          let s = e * t;
          return (8 !== r && (s = Math.ceil(s / (8 / r))), s);
        }
        let o = (e.exports = function (e, t) {
          let r = e.width,
            i = e.height,
            o = e.interlace,
            a = e.bpp,
            l = e.depth;
          if (
            ((this.read = t.read),
            (this.write = t.write),
            (this.complete = t.complete),
            (this._imageIndex = 0),
            (this._images = []),
            o)
          ) {
            let e = s.getImagePasses(r, i);
            for (let t = 0; t < e.length; t++)
              this._images.push({
                byteWidth: n(e[t].width, a, l),
                height: e[t].height,
                lineIndex: 0,
              });
          } else
            this._images.push({
              byteWidth: n(r, a, l),
              height: i,
              lineIndex: 0,
            });
          8 === l
            ? (this._xComparison = a)
            : 16 === l
              ? (this._xComparison = 2 * a)
              : (this._xComparison = 1);
        });
        ((o.prototype.start = function () {
          this.read(
            this._images[this._imageIndex].byteWidth + 1,
            this._reverseFilterLine.bind(this),
          );
        }),
          (o.prototype._unFilterType1 = function (e, t, r) {
            let s = this._xComparison,
              i = s - 1;
            for (let n = 0; n < r; n++) {
              let r = e[1 + n],
                o = n > i ? t[n - s] : 0;
              t[n] = r + o;
            }
          }),
          (o.prototype._unFilterType2 = function (e, t, r) {
            let s = this._lastLine;
            for (let i = 0; i < r; i++) {
              let r = e[1 + i],
                n = s ? s[i] : 0;
              t[i] = r + n;
            }
          }),
          (o.prototype._unFilterType3 = function (e, t, r) {
            let s = this._xComparison,
              i = s - 1,
              n = this._lastLine;
            for (let o = 0; o < r; o++) {
              let r = e[1 + o],
                a = n ? n[o] : 0,
                l = Math.floor(((o > i ? t[o - s] : 0) + a) / 2);
              t[o] = r + l;
            }
          }),
          (o.prototype._unFilterType4 = function (e, t, r) {
            let s = this._xComparison,
              n = s - 1,
              o = this._lastLine;
            for (let a = 0; a < r; a++) {
              let r = e[1 + a],
                l = o ? o[a] : 0,
                d = i(a > n ? t[a - s] : 0, l, a > n && o ? o[a - s] : 0);
              t[a] = r + d;
            }
          }),
          (o.prototype._reverseFilterLine = function (e) {
            let t,
              r = e[0],
              s = this._images[this._imageIndex],
              i = s.byteWidth;
            if (0 === r) t = e.slice(1, i + 1);
            else
              switch (((t = Buffer.alloc(i)), r)) {
                case 1:
                  this._unFilterType1(e, t, i);
                  break;
                case 2:
                  this._unFilterType2(e, t, i);
                  break;
                case 3:
                  this._unFilterType3(e, t, i);
                  break;
                case 4:
                  this._unFilterType4(e, t, i);
                  break;
                default:
                  throw Error("Unrecognised filter type - " + r);
              }
            (this.write(t),
              s.lineIndex++,
              s.lineIndex >= s.height
                ? ((this._lastLine = null),
                  this._imageIndex++,
                  (s = this._images[this._imageIndex]))
                : (this._lastLine = t),
              s
                ? this.read(s.byteWidth + 1, this._reverseFilterLine.bind(this))
                : ((this._lastLine = null), this.complete()));
          }));
      },
      54505: (e) => {
        "use strict";
        e.exports = function (e, t) {
          let r = t.depth,
            s = t.width,
            i = t.height,
            n = t.colorType,
            o = t.transColor,
            a = t.palette,
            l = e;
          return (
            3 === n
              ? (function (e, t, r, s, i) {
                  let n = 0;
                  for (let o = 0; o < s; o++)
                    for (let s = 0; s < r; s++) {
                      let r = i[e[n]];
                      if (!r) throw Error("index " + e[n] + " not in palette");
                      for (let e = 0; e < 4; e++) t[n + e] = r[e];
                      n += 4;
                    }
                })(e, l, s, i, a)
              : (o &&
                  (function (e, t, r, s, i) {
                    let n = 0;
                    for (let o = 0; o < s; o++)
                      for (let s = 0; s < r; s++) {
                        let r = !1;
                        if (
                          (1 === i.length
                            ? i[0] === e[n] && (r = !0)
                            : i[0] === e[n] &&
                              i[1] === e[n + 1] &&
                              i[2] === e[n + 2] &&
                              (r = !0),
                          r)
                        )
                          for (let e = 0; e < 4; e++) t[n + e] = 0;
                        n += 4;
                      }
                  })(e, l, s, i, o),
                8 !== r &&
                  (16 === r && (l = Buffer.alloc(s * i * 4)),
                  (function (e, t, r, s, i) {
                    let n = Math.pow(2, i) - 1,
                      o = 0;
                    for (let i = 0; i < s; i++)
                      for (let s = 0; s < r; s++) {
                        for (let r = 0; r < 4; r++)
                          t[o + r] = Math.floor((255 * e[o + r]) / n + 0.5);
                        o += 4;
                      }
                  })(e, l, s, i, r))),
            l
          );
        };
      },
      36255: (e, t) => {
        "use strict";
        let r = [
          { x: [0], y: [0] },
          { x: [4], y: [0] },
          { x: [0, 4], y: [4] },
          { x: [2, 6], y: [0, 4] },
          { x: [0, 2, 4, 6], y: [2, 6] },
          { x: [1, 3, 5, 7], y: [0, 2, 4, 6] },
          { x: [0, 1, 2, 3, 4, 5, 6, 7], y: [1, 3, 5, 7] },
        ];
        ((t.getImagePasses = function (e, t) {
          let s = [],
            i = e % 8,
            n = t % 8,
            o = (e - i) / 8,
            a = (t - n) / 8;
          for (let e = 0; e < r.length; e++) {
            let t = r[e],
              l = o * t.x.length,
              d = a * t.y.length;
            for (let e = 0; e < t.x.length; e++)
              if (t.x[e] < i) l++;
              else break;
            for (let e = 0; e < t.y.length; e++)
              if (t.y[e] < n) d++;
              else break;
            l > 0 && d > 0 && s.push({ width: l, height: d, index: e });
          }
          return s;
        }),
          (t.getInterlaceIterator = function (e) {
            return function (t, s, i) {
              let n = t % r[i].x.length,
                o = ((t - n) / r[i].x.length) * 8 + r[i].x[n],
                a = s % r[i].y.length;
              return (
                4 * o + (((s - a) / r[i].y.length) * 8 + r[i].y[a]) * e * 4
              );
            };
          }));
      },
      67509: (e, t, r) => {
        "use strict";
        let s = r(73837),
          i = r(12781),
          n = r(40587),
          o = r(11957),
          a = (e.exports = function (e) {
            (i.call(this),
              (this._packer = new o(e || {})),
              (this._deflate = this._packer.createDeflate()),
              (this.readable = !0));
          });
        (s.inherits(a, i),
          (a.prototype.pack = function (e, t, r, s) {
            (this.emit("data", Buffer.from(n.PNG_SIGNATURE)),
              this.emit("data", this._packer.packIHDR(t, r)),
              s && this.emit("data", this._packer.packGAMA(s)));
            let i = this._packer.filterData(e, t, r);
            (this._deflate.on("error", this.emit.bind(this, "error")),
              this._deflate.on(
                "data",
                function (e) {
                  this.emit("data", this._packer.packIDAT(e));
                }.bind(this),
              ),
              this._deflate.on(
                "end",
                function () {
                  (this.emit("data", this._packer.packIEND()),
                    this.emit("end"));
                }.bind(this),
              ),
              this._deflate.end(i));
          }));
      },
      17943: (e, t, r) => {
        "use strict";
        let s = !0,
          i = r(59796);
        i.deflateSync || (s = !1);
        let n = r(40587),
          o = r(11957);
        e.exports = function (e, t) {
          if (!s)
            throw Error(
              "To use the sync capability of this library in old node versions, please pin pngjs to v2.3.0",
            );
          let r = new o(t || {}),
            a = [];
          (a.push(Buffer.from(n.PNG_SIGNATURE)),
            a.push(r.packIHDR(e.width, e.height)),
            e.gamma && a.push(r.packGAMA(e.gamma)));
          let l = r.filterData(e.data, e.width, e.height),
            d = i.deflateSync(l, r.getDeflateOptions());
          if (((l = null), !d || !d.length))
            throw Error("bad png - invalid compressed data response");
          return (
            a.push(r.packIDAT(d)),
            a.push(r.packIEND()),
            Buffer.concat(a)
          );
        };
      },
      11957: (e, t, r) => {
        "use strict";
        let s = r(40587),
          i = r(91435),
          n = r(60143),
          o = r(96740),
          a = r(59796),
          l = (e.exports = function (e) {
            if (
              ((this._options = e),
              (e.deflateChunkSize = e.deflateChunkSize || 32768),
              (e.deflateLevel = null != e.deflateLevel ? e.deflateLevel : 9),
              (e.deflateStrategy =
                null != e.deflateStrategy ? e.deflateStrategy : 3),
              (e.inputHasAlpha = null == e.inputHasAlpha || e.inputHasAlpha),
              (e.deflateFactory = e.deflateFactory || a.createDeflate),
              (e.bitDepth = e.bitDepth || 8),
              (e.colorType =
                "number" == typeof e.colorType
                  ? e.colorType
                  : s.COLORTYPE_COLOR_ALPHA),
              (e.inputColorType =
                "number" == typeof e.inputColorType
                  ? e.inputColorType
                  : s.COLORTYPE_COLOR_ALPHA),
              -1 ===
                [
                  s.COLORTYPE_GRAYSCALE,
                  s.COLORTYPE_COLOR,
                  s.COLORTYPE_COLOR_ALPHA,
                  s.COLORTYPE_ALPHA,
                ].indexOf(e.colorType))
            )
              throw Error(
                "option color type:" +
                  e.colorType +
                  " is not supported at present",
              );
            if (
              -1 ===
              [
                s.COLORTYPE_GRAYSCALE,
                s.COLORTYPE_COLOR,
                s.COLORTYPE_COLOR_ALPHA,
                s.COLORTYPE_ALPHA,
              ].indexOf(e.inputColorType)
            )
              throw Error(
                "option input color type:" +
                  e.inputColorType +
                  " is not supported at present",
              );
            if (8 !== e.bitDepth && 16 !== e.bitDepth)
              throw Error(
                "option bit depth:" +
                  e.bitDepth +
                  " is not supported at present",
              );
          });
        ((l.prototype.getDeflateOptions = function () {
          return {
            chunkSize: this._options.deflateChunkSize,
            level: this._options.deflateLevel,
            strategy: this._options.deflateStrategy,
          };
        }),
          (l.prototype.createDeflate = function () {
            return this._options.deflateFactory(this.getDeflateOptions());
          }),
          (l.prototype.filterData = function (e, t, r) {
            let i = n(e, t, r, this._options),
              a = s.COLORTYPE_TO_BPP_MAP[this._options.colorType];
            return o(i, t, r, this._options, a);
          }),
          (l.prototype._packChunk = function (e, t) {
            let r = t ? t.length : 0,
              s = Buffer.alloc(r + 12);
            return (
              s.writeUInt32BE(r, 0),
              s.writeUInt32BE(e, 4),
              t && t.copy(s, 8),
              s.writeInt32BE(i.crc32(s.slice(4, s.length - 4)), s.length - 4),
              s
            );
          }),
          (l.prototype.packGAMA = function (e) {
            let t = Buffer.alloc(4);
            return (
              t.writeUInt32BE(Math.floor(e * s.GAMMA_DIVISION), 0),
              this._packChunk(s.TYPE_gAMA, t)
            );
          }),
          (l.prototype.packIHDR = function (e, t) {
            let r = Buffer.alloc(13);
            return (
              r.writeUInt32BE(e, 0),
              r.writeUInt32BE(t, 4),
              (r[8] = this._options.bitDepth),
              (r[9] = this._options.colorType),
              (r[10] = 0),
              (r[11] = 0),
              (r[12] = 0),
              this._packChunk(s.TYPE_IHDR, r)
            );
          }),
          (l.prototype.packIDAT = function (e) {
            return this._packChunk(s.TYPE_IDAT, e);
          }),
          (l.prototype.packIEND = function () {
            return this._packChunk(s.TYPE_IEND, null);
          }));
      },
      53248: (e) => {
        "use strict";
        e.exports = function (e, t, r) {
          let s = e + t - r,
            i = Math.abs(s - e),
            n = Math.abs(s - t),
            o = Math.abs(s - r);
          return i <= n && i <= o ? e : n <= o ? t : r;
        };
      },
      41149: (e, t, r) => {
        "use strict";
        let s = r(73837),
          i = r(59796),
          n = r(57580),
          o = r(78318),
          a = r(58979),
          l = r(74263),
          d = r(54505),
          c = (e.exports = function (e) {
            (n.call(this),
              (this._parser = new a(e, {
                read: this.read.bind(this),
                error: this._handleError.bind(this),
                metadata: this._handleMetaData.bind(this),
                gamma: this.emit.bind(this, "gamma"),
                palette: this._handlePalette.bind(this),
                transColor: this._handleTransColor.bind(this),
                finished: this._finished.bind(this),
                inflateData: this._inflateData.bind(this),
                simpleTransparency: this._simpleTransparency.bind(this),
                headersFinished: this._headersFinished.bind(this),
              })),
              (this._options = e),
              (this.writable = !0),
              this._parser.start());
          });
        (s.inherits(c, n),
          (c.prototype._handleError = function (e) {
            (this.emit("error", e),
              (this.writable = !1),
              this.destroy(),
              this._inflate && this._inflate.destroy && this._inflate.destroy(),
              this._filter &&
                (this._filter.destroy(),
                this._filter.on("error", function () {})),
              (this.errord = !0));
          }),
          (c.prototype._inflateData = function (e) {
            if (!this._inflate) {
              if (this._bitmapInfo.interlace)
                ((this._inflate = i.createInflate()),
                  this._inflate.on("error", this.emit.bind(this, "error")),
                  this._filter.on("complete", this._complete.bind(this)),
                  this._inflate.pipe(this._filter));
              else {
                let e =
                    (((this._bitmapInfo.width *
                      this._bitmapInfo.bpp *
                      this._bitmapInfo.depth +
                      7) >>
                      3) +
                      1) *
                    this._bitmapInfo.height,
                  t = Math.max(e, i.Z_MIN_CHUNK);
                this._inflate = i.createInflate({ chunkSize: t });
                let r = e,
                  s = this.emit.bind(this, "error");
                (this._inflate.on("error", function (e) {
                  r && s(e);
                }),
                  this._filter.on("complete", this._complete.bind(this)));
                let n = this._filter.write.bind(this._filter);
                (this._inflate.on("data", function (e) {
                  r &&
                    (e.length > r && (e = e.slice(0, r)),
                    (r -= e.length),
                    n(e));
                }),
                  this._inflate.on("end", this._filter.end.bind(this._filter)));
              }
            }
            this._inflate.write(e);
          }),
          (c.prototype._handleMetaData = function (e) {
            ((this._metaData = e),
              (this._bitmapInfo = Object.create(e)),
              (this._filter = new o(this._bitmapInfo)));
          }),
          (c.prototype._handleTransColor = function (e) {
            this._bitmapInfo.transColor = e;
          }),
          (c.prototype._handlePalette = function (e) {
            this._bitmapInfo.palette = e;
          }),
          (c.prototype._simpleTransparency = function () {
            this._metaData.alpha = !0;
          }),
          (c.prototype._headersFinished = function () {
            this.emit("metadata", this._metaData);
          }),
          (c.prototype._finished = function () {
            this.errord ||
              (this._inflate
                ? this._inflate.end()
                : this.emit("error", "No Inflate block"));
          }),
          (c.prototype._complete = function (e) {
            let t;
            if (!this.errord) {
              try {
                let r = l.dataToBitMap(e, this._bitmapInfo);
                ((t = d(r, this._bitmapInfo)), (r = null));
              } catch (e) {
                this._handleError(e);
                return;
              }
              this.emit("parsed", t);
            }
          }));
      },
      75446: (e, t, r) => {
        "use strict";
        let s = !0,
          i = r(59796),
          n = r(83015);
        i.deflateSync || (s = !1);
        let o = r(95648),
          a = r(43679),
          l = r(58979),
          d = r(74263),
          c = r(54505);
        e.exports = function (e, t) {
          let r, h, u, f;
          if (!s)
            throw Error(
              "To use the sync capability of this library in old node versions, please pin pngjs to v2.3.0",
            );
          let p = [],
            m = new o(e);
          if (
            (new l(t, {
              read: m.read.bind(m),
              error: function (e) {
                r = e;
              },
              metadata: function (e) {
                h = e;
              },
              gamma: function (e) {
                u = e;
              },
              palette: function (e) {
                h.palette = e;
              },
              transColor: function (e) {
                h.transColor = e;
              },
              inflateData: function (e) {
                p.push(e);
              },
              simpleTransparency: function () {
                h.alpha = !0;
              },
            }).start(),
            m.process(),
            r)
          )
            throw r;
          let g = Buffer.concat(p);
          if (((p.length = 0), h.interlace)) f = i.inflateSync(g);
          else {
            let e = (((h.width * h.bpp * h.depth + 7) >> 3) + 1) * h.height;
            f = n(g, { chunkSize: e, maxLength: e });
          }
          if (((g = null), !f || !f.length))
            throw Error("bad png - invalid inflate data response");
          let x = a.process(f, h);
          g = null;
          let b = d.dataToBitMap(x, h);
          x = null;
          let y = c(b, h);
          return ((h.data = y), (h.gamma = u || 0), h);
        };
      },
      58979: (e, t, r) => {
        "use strict";
        let s = r(40587),
          i = r(91435),
          n = (e.exports = function (e, t) {
            ((this._options = e),
              (e.checkCRC = !1 !== e.checkCRC),
              (this._hasIHDR = !1),
              (this._hasIEND = !1),
              (this._emittedHeadersFinished = !1),
              (this._palette = []),
              (this._colorType = 0),
              (this._chunks = {}),
              (this._chunks[s.TYPE_IHDR] = this._handleIHDR.bind(this)),
              (this._chunks[s.TYPE_IEND] = this._handleIEND.bind(this)),
              (this._chunks[s.TYPE_IDAT] = this._handleIDAT.bind(this)),
              (this._chunks[s.TYPE_PLTE] = this._handlePLTE.bind(this)),
              (this._chunks[s.TYPE_tRNS] = this._handleTRNS.bind(this)),
              (this._chunks[s.TYPE_gAMA] = this._handleGAMA.bind(this)),
              (this.read = t.read),
              (this.error = t.error),
              (this.metadata = t.metadata),
              (this.gamma = t.gamma),
              (this.transColor = t.transColor),
              (this.palette = t.palette),
              (this.parsed = t.parsed),
              (this.inflateData = t.inflateData),
              (this.finished = t.finished),
              (this.simpleTransparency = t.simpleTransparency),
              (this.headersFinished = t.headersFinished || function () {}));
          });
        ((n.prototype.start = function () {
          this.read(s.PNG_SIGNATURE.length, this._parseSignature.bind(this));
        }),
          (n.prototype._parseSignature = function (e) {
            let t = s.PNG_SIGNATURE;
            for (let r = 0; r < t.length; r++)
              if (e[r] !== t[r]) {
                this.error(Error("Invalid file signature"));
                return;
              }
            this.read(8, this._parseChunkBegin.bind(this));
          }),
          (n.prototype._parseChunkBegin = function (e) {
            let t = e.readUInt32BE(0),
              r = e.readUInt32BE(4),
              n = "";
            for (let t = 4; t < 8; t++) n += String.fromCharCode(e[t]);
            let o = !!(32 & e[4]);
            if (!this._hasIHDR && r !== s.TYPE_IHDR) {
              this.error(Error("Expected IHDR on beggining"));
              return;
            }
            if (
              ((this._crc = new i()),
              this._crc.write(Buffer.from(n)),
              this._chunks[r])
            )
              return this._chunks[r](t);
            if (!o) {
              this.error(Error("Unsupported critical chunk type " + n));
              return;
            }
            this.read(t + 4, this._skipChunk.bind(this));
          }),
          (n.prototype._skipChunk = function () {
            this.read(8, this._parseChunkBegin.bind(this));
          }),
          (n.prototype._handleChunkEnd = function () {
            this.read(4, this._parseChunkEnd.bind(this));
          }),
          (n.prototype._parseChunkEnd = function (e) {
            let t = e.readInt32BE(0),
              r = this._crc.crc32();
            if (this._options.checkCRC && r !== t) {
              this.error(Error("Crc error - " + t + " - " + r));
              return;
            }
            this._hasIEND || this.read(8, this._parseChunkBegin.bind(this));
          }),
          (n.prototype._handleIHDR = function (e) {
            this.read(e, this._parseIHDR.bind(this));
          }),
          (n.prototype._parseIHDR = function (e) {
            this._crc.write(e);
            let t = e.readUInt32BE(0),
              r = e.readUInt32BE(4),
              i = e[8],
              n = e[9],
              o = e[10],
              a = e[11],
              l = e[12];
            if (8 !== i && 4 !== i && 2 !== i && 1 !== i && 16 !== i) {
              this.error(Error("Unsupported bit depth " + i));
              return;
            }
            if (!(n in s.COLORTYPE_TO_BPP_MAP)) {
              this.error(Error("Unsupported color type"));
              return;
            }
            if (0 !== o) {
              this.error(Error("Unsupported compression method"));
              return;
            }
            if (0 !== a) {
              this.error(Error("Unsupported filter method"));
              return;
            }
            if (0 !== l && 1 !== l) {
              this.error(Error("Unsupported interlace method"));
              return;
            }
            this._colorType = n;
            let d = s.COLORTYPE_TO_BPP_MAP[this._colorType];
            ((this._hasIHDR = !0),
              this.metadata({
                width: t,
                height: r,
                depth: i,
                interlace: !!l,
                palette: !!(n & s.COLORTYPE_PALETTE),
                color: !!(n & s.COLORTYPE_COLOR),
                alpha: !!(n & s.COLORTYPE_ALPHA),
                bpp: d,
                colorType: n,
              }),
              this._handleChunkEnd());
          }),
          (n.prototype._handlePLTE = function (e) {
            this.read(e, this._parsePLTE.bind(this));
          }),
          (n.prototype._parsePLTE = function (e) {
            this._crc.write(e);
            let t = Math.floor(e.length / 3);
            for (let r = 0; r < t; r++)
              this._palette.push([e[3 * r], e[3 * r + 1], e[3 * r + 2], 255]);
            (this.palette(this._palette), this._handleChunkEnd());
          }),
          (n.prototype._handleTRNS = function (e) {
            (this.simpleTransparency(),
              this.read(e, this._parseTRNS.bind(this)));
          }),
          (n.prototype._parseTRNS = function (e) {
            if (
              (this._crc.write(e),
              this._colorType === s.COLORTYPE_PALETTE_COLOR)
            ) {
              if (0 === this._palette.length) {
                this.error(Error("Transparency chunk must be after palette"));
                return;
              }
              if (e.length > this._palette.length) {
                this.error(Error("More transparent colors than palette size"));
                return;
              }
              for (let t = 0; t < e.length; t++) this._palette[t][3] = e[t];
              this.palette(this._palette);
            }
            (this._colorType === s.COLORTYPE_GRAYSCALE &&
              this.transColor([e.readUInt16BE(0)]),
              this._colorType === s.COLORTYPE_COLOR &&
                this.transColor([
                  e.readUInt16BE(0),
                  e.readUInt16BE(2),
                  e.readUInt16BE(4),
                ]),
              this._handleChunkEnd());
          }),
          (n.prototype._handleGAMA = function (e) {
            this.read(e, this._parseGAMA.bind(this));
          }),
          (n.prototype._parseGAMA = function (e) {
            (this._crc.write(e),
              this.gamma(e.readUInt32BE(0) / s.GAMMA_DIVISION),
              this._handleChunkEnd());
          }),
          (n.prototype._handleIDAT = function (e) {
            (this._emittedHeadersFinished ||
              ((this._emittedHeadersFinished = !0), this.headersFinished()),
              this.read(-e, this._parseIDAT.bind(this, e)));
          }),
          (n.prototype._parseIDAT = function (e, t) {
            if (
              (this._crc.write(t),
              this._colorType === s.COLORTYPE_PALETTE_COLOR &&
                0 === this._palette.length)
            )
              throw Error("Expected palette not found");
            this.inflateData(t);
            let r = e - t.length;
            r > 0 ? this._handleIDAT(r) : this._handleChunkEnd();
          }),
          (n.prototype._handleIEND = function (e) {
            this.read(e, this._parseIEND.bind(this));
          }),
          (n.prototype._parseIEND = function (e) {
            (this._crc.write(e),
              (this._hasIEND = !0),
              this._handleChunkEnd(),
              this.finished && this.finished());
          }));
      },
      3467: (e, t, r) => {
        "use strict";
        let s = r(75446),
          i = r(17943);
        ((t.read = function (e, t) {
          return s(e, t || {});
        }),
          (t.write = function (e, t) {
            return i(e, t);
          }));
      },
      207: (e, t, r) => {
        "use strict";
        let s = r(73837),
          i = r(12781),
          n = r(41149),
          o = r(67509),
          a = r(3467),
          l = (t.y = function (e) {
            (i.call(this),
              (e = e || {}),
              (this.width = 0 | e.width),
              (this.height = 0 | e.height),
              (this.data =
                this.width > 0 && this.height > 0
                  ? Buffer.alloc(4 * this.width * this.height)
                  : null),
              e.fill && this.data && this.data.fill(0),
              (this.gamma = 0),
              (this.readable = this.writable = !0),
              (this._parser = new n(e)),
              this._parser.on("error", this.emit.bind(this, "error")),
              this._parser.on("close", this._handleClose.bind(this)),
              this._parser.on("metadata", this._metadata.bind(this)),
              this._parser.on("gamma", this._gamma.bind(this)),
              this._parser.on(
                "parsed",
                function (e) {
                  ((this.data = e), this.emit("parsed", e));
                }.bind(this),
              ),
              (this._packer = new o(e)),
              this._packer.on("data", this.emit.bind(this, "data")),
              this._packer.on("end", this.emit.bind(this, "end")),
              this._parser.on("close", this._handleClose.bind(this)),
              this._packer.on("error", this.emit.bind(this, "error")));
          });
        (s.inherits(l, i),
          (l.sync = a),
          (l.prototype.pack = function () {
            return (
              this.data && this.data.length
                ? process.nextTick(
                    function () {
                      this._packer.pack(
                        this.data,
                        this.width,
                        this.height,
                        this.gamma,
                      );
                    }.bind(this),
                  )
                : this.emit("error", "No data provided"),
              this
            );
          }),
          (l.prototype.parse = function (e, t) {
            if (t) {
              let e, r;
              ((e = function (e) {
                (this.removeListener("error", r),
                  (this.data = e),
                  t(null, this));
              }.bind(this)),
                (r = function (r) {
                  (this.removeListener("parsed", e), t(r, null));
                }.bind(this)),
                this.once("parsed", e),
                this.once("error", r));
            }
            return (this.end(e), this);
          }),
          (l.prototype.write = function (e) {
            return (this._parser.write(e), !0);
          }),
          (l.prototype.end = function (e) {
            this._parser.end(e);
          }),
          (l.prototype._metadata = function (e) {
            ((this.width = e.width),
              (this.height = e.height),
              this.emit("metadata", e));
          }),
          (l.prototype._gamma = function (e) {
            this.gamma = e;
          }),
          (l.prototype._handleClose = function () {
            this._parser.writable ||
              this._packer.readable ||
              this.emit("close");
          }),
          (l.bitblt = function (e, t, r, s, i, n, o, a) {
            if (
              ((s |= 0),
              (i |= 0),
              (n |= 0),
              (o |= 0),
              (a |= 0),
              (r |= 0) > e.width ||
                s > e.height ||
                r + i > e.width ||
                s + n > e.height)
            )
              throw Error("bitblt reading outside image");
            if (
              o > t.width ||
              a > t.height ||
              o + i > t.width ||
              a + n > t.height
            )
              throw Error("bitblt writing outside image");
            for (let l = 0; l < n; l++)
              e.data.copy(
                t.data,
                ((a + l) * t.width + o) << 2,
                ((s + l) * e.width + r) << 2,
                ((s + l) * e.width + r + i) << 2,
              );
          }),
          (l.prototype.bitblt = function (e, t, r, s, i, n, o) {
            return (l.bitblt(this, e, t, r, s, i, n, o), this);
          }),
          (l.adjustGamma = function (e) {
            if (e.gamma) {
              for (let t = 0; t < e.height; t++)
                for (let r = 0; r < e.width; r++) {
                  let s = (e.width * t + r) << 2;
                  for (let t = 0; t < 3; t++) {
                    let r = e.data[s + t] / 255;
                    ((r = Math.pow(r, 1 / 2.2 / e.gamma)),
                      (e.data[s + t] = Math.round(255 * r)));
                  }
                }
              e.gamma = 0;
            }
          }),
          (l.prototype.adjustGamma = function () {
            l.adjustGamma(this);
          }));
      },
      83015: (e, t, r) => {
        "use strict";
        let s = r(39491).ok,
          i = r(59796),
          n = r(73837),
          o = r(14300).kMaxLength;
        function a(e) {
          if (!(this instanceof a)) return new a(e);
          (e && e.chunkSize < i.Z_MIN_CHUNK && (e.chunkSize = i.Z_MIN_CHUNK),
            i.Inflate.call(this, e),
            (this._offset =
              void 0 === this._offset ? this._outOffset : this._offset),
            (this._buffer = this._buffer || this._outBuffer),
            e && null != e.maxLength && (this._maxLength = e.maxLength));
        }
        function l(e, t) {
          (t && process.nextTick(t),
            e._handle && (e._handle.close(), (e._handle = null)));
        }
        function d(e, t) {
          return (function (e, t) {
            if (
              ("string" == typeof t && (t = Buffer.from(t)),
              !(t instanceof Buffer))
            )
              throw TypeError("Not a string or buffer");
            let r = e._finishFlushFlag;
            return (null == r && (r = i.Z_FINISH), e._processChunk(t, r));
          })(new a(t), e);
        }
        ((a.prototype._processChunk = function (e, t, r) {
          let n, a;
          if ("function" == typeof r)
            return i.Inflate._processChunk.call(this, e, t, r);
          let d = this,
            c = e && e.length,
            h = this._chunkSize - this._offset,
            u = this._maxLength,
            f = 0,
            p = [],
            m = 0;
          (this.on("error", function (e) {
            n = e;
          }),
            s(this._handle, "zlib binding closed"));
          do
            a =
              (a = this._handle.writeSync(
                t,
                e,
                f,
                c,
                this._buffer,
                this._offset,
                h,
              )) || this._writeState;
          while (
            !this._hadError &&
            (function (e, t) {
              if (d._hadError) return;
              let r = h - t;
              if ((s(r >= 0, "have should not go down"), r > 0)) {
                let e = d._buffer.slice(d._offset, d._offset + r);
                if (
                  ((d._offset += r),
                  e.length > u && (e = e.slice(0, u)),
                  p.push(e),
                  (m += e.length),
                  0 == (u -= e.length))
                )
                  return !1;
              }
              return (
                (0 === t || d._offset >= d._chunkSize) &&
                  ((h = d._chunkSize),
                  (d._offset = 0),
                  (d._buffer = Buffer.allocUnsafe(d._chunkSize))),
                0 === t && ((f += c - e), (c = e), !0)
              );
            })(a[0], a[1])
          );
          if (this._hadError) throw n;
          if (m >= o)
            throw (
              l(this),
              RangeError(
                "Cannot create final Buffer. It would be larger than 0x" +
                  o.toString(16) +
                  " bytes",
              )
            );
          let g = Buffer.concat(p, m);
          return (l(this), g);
        }),
          n.inherits(a, i.Inflate),
          (e.exports = t = d),
          (t.Inflate = a),
          (t.createInflate = function (e) {
            return new a(e);
          }),
          (t.inflateSync = d));
      },
      95648: (e) => {
        "use strict";
        let t = (e.exports = function (e) {
          ((this._buffer = e), (this._reads = []));
        });
        ((t.prototype.read = function (e, t) {
          this._reads.push({ length: Math.abs(e), allowLess: e < 0, func: t });
        }),
          (t.prototype.process = function () {
            for (; this._reads.length > 0 && this._buffer.length; ) {
              let e = this._reads[0];
              if (
                this._buffer.length &&
                (this._buffer.length >= e.length || e.allowLess)
              ) {
                this._reads.shift();
                let t = this._buffer;
                ((this._buffer = t.slice(e.length)),
                  e.func.call(this, t.slice(0, e.length)));
              } else break;
            }
            return this._reads.length > 0
              ? Error("There are some read requests waitng on finished stream")
              : this._buffer.length > 0
                ? Error("unrecognised content at end of stream")
                : void 0;
          }));
      },
      50643: (e, t, r) => {
        let s = r(55515),
          i = r(86322),
          n = r(4960),
          o = r(51122);
        function a(e, t, r, n, o) {
          let a = [].slice.call(arguments, 1),
            l = a.length,
            d = "function" == typeof a[l - 1];
          if (!d && !s()) throw Error("Callback required as last argument");
          if (d) {
            if (l < 2) throw Error("Too few arguments provided");
            2 === l
              ? ((o = r), (r = t), (t = n = void 0))
              : 3 === l &&
                (t.getContext && void 0 === o
                  ? ((o = n), (n = void 0))
                  : ((o = n), (n = r), (r = t), (t = void 0)));
          } else {
            if (l < 1) throw Error("Too few arguments provided");
            return (
              1 === l
                ? ((r = t), (t = n = void 0))
                : 2 !== l || t.getContext || ((n = r), (r = t), (t = void 0)),
              new Promise(function (s, o) {
                try {
                  let o = i.create(r, n);
                  s(e(o, t, n));
                } catch (e) {
                  o(e);
                }
              })
            );
          }
          try {
            let s = i.create(r, n);
            o(null, e(s, t, n));
          } catch (e) {
            o(e);
          }
        }
        (i.create,
          (t.toCanvas = a.bind(null, n.render)),
          a.bind(null, n.renderToDataURL),
          a.bind(null, function (e, t, r) {
            return o.render(e, r);
          }));
      },
      55515: (e) => {
        "use strict";
        e.exports = function () {
          return (
            "function" == typeof Promise &&
            Promise.prototype &&
            Promise.prototype.then
          );
        };
      },
      38086: (e, t, r) => {
        let s = r(33181).getSymbolSize;
        ((t.getRowColCoords = function (e) {
          if (1 === e) return [];
          let t = Math.floor(e / 7) + 2,
            r = s(e),
            i = 145 === r ? 26 : 2 * Math.ceil((r - 13) / (2 * t - 2)),
            n = [r - 7];
          for (let e = 1; e < t - 1; e++) n[e] = n[e - 1] - i;
          return (n.push(6), n.reverse());
        }),
          (t.getPositions = function (e) {
            let r = [],
              s = t.getRowColCoords(e),
              i = s.length;
            for (let e = 0; e < i; e++)
              for (let t = 0; t < i; t++)
                (0 !== e || 0 !== t) &&
                  (0 !== e || t !== i - 1) &&
                  (e !== i - 1 || 0 !== t) &&
                  r.push([s[e], s[t]]);
            return r;
          }));
      },
      27554: (e, t, r) => {
        "use strict";
        let s = r(21988),
          i = [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N",
            "O",
            "P",
            "Q",
            "R",
            "S",
            "T",
            "U",
            "V",
            "W",
            "X",
            "Y",
            "Z",
            " ",
            "$",
            "%",
            "*",
            "+",
            "-",
            ".",
            "/",
            ":",
          ];
        function n(e) {
          ((this.mode = s.ALPHANUMERIC), (this.data = e));
        }
        ((n.getBitsLength = function (e) {
          return 11 * Math.floor(e / 2) + 6 * (e % 2);
        }),
          (n.prototype.getLength = function () {
            return this.data.length;
          }),
          (n.prototype.getBitsLength = function () {
            return n.getBitsLength(this.data.length);
          }),
          (n.prototype.write = function (e) {
            let t;
            for (t = 0; t + 2 <= this.data.length; t += 2) {
              let r = 45 * i.indexOf(this.data[t]);
              ((r += i.indexOf(this.data[t + 1])), e.put(r, 11));
            }
            this.data.length % 2 && e.put(i.indexOf(this.data[t]), 6);
          }),
          (e.exports = n));
      },
      39157: (e) => {
        "use strict";
        function t() {
          ((this.buffer = []), (this.length = 0));
        }
        ((t.prototype = {
          get: function (e) {
            return (
              ((this.buffer[Math.floor(e / 8)] >>> (7 - (e % 8))) & 1) == 1
            );
          },
          put: function (e, t) {
            for (let r = 0; r < t; r++)
              this.putBit(((e >>> (t - r - 1)) & 1) == 1);
          },
          getLengthInBits: function () {
            return this.length;
          },
          putBit: function (e) {
            let t = Math.floor(this.length / 8);
            (this.buffer.length <= t && this.buffer.push(0),
              e && (this.buffer[t] |= 128 >>> (this.length % 8)),
              this.length++);
          },
        }),
          (e.exports = t));
      },
      36850: (e) => {
        "use strict";
        function t(e) {
          if (!e || e < 1)
            throw Error("BitMatrix size must be defined and greater than 0");
          ((this.size = e),
            (this.data = new Uint8Array(e * e)),
            (this.reservedBit = new Uint8Array(e * e)));
        }
        ((t.prototype.set = function (e, t, r, s) {
          let i = e * this.size + t;
          ((this.data[i] = r), s && (this.reservedBit[i] = !0));
        }),
          (t.prototype.get = function (e, t) {
            return this.data[e * this.size + t];
          }),
          (t.prototype.xor = function (e, t, r) {
            this.data[e * this.size + t] ^= r;
          }),
          (t.prototype.isReserved = function (e, t) {
            return this.reservedBit[e * this.size + t];
          }),
          (e.exports = t));
      },
      96322: (e, t, r) => {
        "use strict";
        let s = r(21988);
        function i(e) {
          ((this.mode = s.BYTE),
            "string" == typeof e
              ? (this.data = new TextEncoder().encode(e))
              : (this.data = new Uint8Array(e)));
        }
        ((i.getBitsLength = function (e) {
          return 8 * e;
        }),
          (i.prototype.getLength = function () {
            return this.data.length;
          }),
          (i.prototype.getBitsLength = function () {
            return i.getBitsLength(this.data.length);
          }),
          (i.prototype.write = function (e) {
            for (let t = 0, r = this.data.length; t < r; t++)
              e.put(this.data[t], 8);
          }),
          (e.exports = i));
      },
      1623: (e, t, r) => {
        let s = r(15312),
          i = [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 2, 2, 4, 1, 2, 4, 4, 2, 4, 4,
            4, 2, 4, 6, 5, 2, 4, 6, 6, 2, 5, 8, 8, 4, 5, 8, 8, 4, 5, 8, 11, 4,
            8, 10, 11, 4, 9, 12, 16, 4, 9, 16, 16, 6, 10, 12, 18, 6, 10, 17, 16,
            6, 11, 16, 19, 6, 13, 18, 21, 7, 14, 21, 25, 8, 16, 20, 25, 8, 17,
            23, 25, 9, 17, 23, 34, 9, 18, 25, 30, 10, 20, 27, 32, 12, 21, 29,
            35, 12, 23, 34, 37, 12, 25, 34, 40, 13, 26, 35, 42, 14, 28, 38, 45,
            15, 29, 40, 48, 16, 31, 43, 51, 17, 33, 45, 54, 18, 35, 48, 57, 19,
            37, 51, 60, 19, 38, 53, 63, 20, 40, 56, 66, 21, 43, 59, 70, 22, 45,
            62, 74, 24, 47, 65, 77, 25, 49, 68, 81,
          ],
          n = [
            7, 10, 13, 17, 10, 16, 22, 28, 15, 26, 36, 44, 20, 36, 52, 64, 26,
            48, 72, 88, 36, 64, 96, 112, 40, 72, 108, 130, 48, 88, 132, 156, 60,
            110, 160, 192, 72, 130, 192, 224, 80, 150, 224, 264, 96, 176, 260,
            308, 104, 198, 288, 352, 120, 216, 320, 384, 132, 240, 360, 432,
            144, 280, 408, 480, 168, 308, 448, 532, 180, 338, 504, 588, 196,
            364, 546, 650, 224, 416, 600, 700, 224, 442, 644, 750, 252, 476,
            690, 816, 270, 504, 750, 900, 300, 560, 810, 960, 312, 588, 870,
            1050, 336, 644, 952, 1110, 360, 700, 1020, 1200, 390, 728, 1050,
            1260, 420, 784, 1140, 1350, 450, 812, 1200, 1440, 480, 868, 1290,
            1530, 510, 924, 1350, 1620, 540, 980, 1440, 1710, 570, 1036, 1530,
            1800, 570, 1064, 1590, 1890, 600, 1120, 1680, 1980, 630, 1204, 1770,
            2100, 660, 1260, 1860, 2220, 720, 1316, 1950, 2310, 750, 1372, 2040,
            2430,
          ];
        ((t.getBlocksCount = function (e, t) {
          switch (t) {
            case s.L:
              return i[(e - 1) * 4 + 0];
            case s.M:
              return i[(e - 1) * 4 + 1];
            case s.Q:
              return i[(e - 1) * 4 + 2];
            case s.H:
              return i[(e - 1) * 4 + 3];
            default:
              return;
          }
        }),
          (t.getTotalCodewordsCount = function (e, t) {
            switch (t) {
              case s.L:
                return n[(e - 1) * 4 + 0];
              case s.M:
                return n[(e - 1) * 4 + 1];
              case s.Q:
                return n[(e - 1) * 4 + 2];
              case s.H:
                return n[(e - 1) * 4 + 3];
              default:
                return;
            }
          }));
      },
      15312: (e, t) => {
        ((t.L = { bit: 1 }),
          (t.M = { bit: 0 }),
          (t.Q = { bit: 3 }),
          (t.H = { bit: 2 }),
          (t.isValid = function (e) {
            return e && void 0 !== e.bit && e.bit >= 0 && e.bit < 4;
          }),
          (t.from = function (e, r) {
            if (t.isValid(e)) return e;
            try {
              return (function (e) {
                if ("string" != typeof e) throw Error("Param is not a string");
                let r = e.toLowerCase();
                switch (r) {
                  case "l":
                  case "low":
                    return t.L;
                  case "m":
                  case "medium":
                    return t.M;
                  case "q":
                  case "quartile":
                    return t.Q;
                  case "h":
                  case "high":
                    return t.H;
                  default:
                    throw Error("Unknown EC Level: " + e);
                }
              })(e);
            } catch (e) {
              return r;
            }
          }));
      },
      60535: (e, t, r) => {
        let s = r(33181).getSymbolSize;
        t.getPositions = function (e) {
          let t = s(e);
          return [
            [0, 0],
            [t - 7, 0],
            [0, t - 7],
          ];
        };
      },
      11688: (e, t, r) => {
        let s = r(33181),
          i = s.getBCHDigit(1335);
        t.getEncodedBits = function (e, t) {
          let r = (e.bit << 3) | t,
            n = r << 10;
          for (; s.getBCHDigit(n) - i >= 0; )
            n ^= 1335 << (s.getBCHDigit(n) - i);
          return ((r << 10) | n) ^ 21522;
        };
      },
      88235: (e, t) => {
        let r = new Uint8Array(512),
          s = new Uint8Array(256);
        ((function () {
          let e = 1;
          for (let t = 0; t < 255; t++)
            ((r[t] = e), (s[e] = t), 256 & (e <<= 1) && (e ^= 285));
          for (let e = 255; e < 512; e++) r[e] = r[e - 255];
        })(),
          (t.log = function (e) {
            if (e < 1) throw Error("log(" + e + ")");
            return s[e];
          }),
          (t.exp = function (e) {
            return r[e];
          }),
          (t.mul = function (e, t) {
            return 0 === e || 0 === t ? 0 : r[s[e] + s[t]];
          }));
      },
      82737: (e, t, r) => {
        "use strict";
        let s = r(21988),
          i = r(33181);
        function n(e) {
          ((this.mode = s.KANJI), (this.data = e));
        }
        ((n.getBitsLength = function (e) {
          return 13 * e;
        }),
          (n.prototype.getLength = function () {
            return this.data.length;
          }),
          (n.prototype.getBitsLength = function () {
            return n.getBitsLength(this.data.length);
          }),
          (n.prototype.write = function (e) {
            let t;
            for (t = 0; t < this.data.length; t++) {
              let r = i.toSJIS(this.data[t]);
              if (r >= 33088 && r <= 40956) r -= 33088;
              else if (r >= 57408 && r <= 60351) r -= 49472;
              else
                throw Error(
                  "Invalid SJIS character: " +
                    this.data[t] +
                    "\nMake sure your charset is UTF-8",
                );
              ((r = ((r >>> 8) & 255) * 192 + (255 & r)), e.put(r, 13));
            }
          }),
          (e.exports = n));
      },
      1378: (e, t) => {
        t.Patterns = {
          PATTERN000: 0,
          PATTERN001: 1,
          PATTERN010: 2,
          PATTERN011: 3,
          PATTERN100: 4,
          PATTERN101: 5,
          PATTERN110: 6,
          PATTERN111: 7,
        };
        let r = { N1: 3, N2: 3, N3: 40, N4: 10 };
        ((t.isValid = function (e) {
          return null != e && "" !== e && !isNaN(e) && e >= 0 && e <= 7;
        }),
          (t.from = function (e) {
            return t.isValid(e) ? parseInt(e, 10) : void 0;
          }),
          (t.getPenaltyN1 = function (e) {
            let t = e.size,
              s = 0,
              i = 0,
              n = 0,
              o = null,
              a = null;
            for (let l = 0; l < t; l++) {
              ((i = n = 0), (o = a = null));
              for (let d = 0; d < t; d++) {
                let t = e.get(l, d);
                (t === o
                  ? i++
                  : (i >= 5 && (s += r.N1 + (i - 5)), (o = t), (i = 1)),
                  (t = e.get(d, l)) === a
                    ? n++
                    : (n >= 5 && (s += r.N1 + (n - 5)), (a = t), (n = 1)));
              }
              (i >= 5 && (s += r.N1 + (i - 5)),
                n >= 5 && (s += r.N1 + (n - 5)));
            }
            return s;
          }),
          (t.getPenaltyN2 = function (e) {
            let t = e.size,
              s = 0;
            for (let r = 0; r < t - 1; r++)
              for (let i = 0; i < t - 1; i++) {
                let t =
                  e.get(r, i) +
                  e.get(r, i + 1) +
                  e.get(r + 1, i) +
                  e.get(r + 1, i + 1);
                (4 === t || 0 === t) && s++;
              }
            return s * r.N2;
          }),
          (t.getPenaltyN3 = function (e) {
            let t = e.size,
              s = 0,
              i = 0,
              n = 0;
            for (let r = 0; r < t; r++) {
              i = n = 0;
              for (let o = 0; o < t; o++)
                ((i = ((i << 1) & 2047) | e.get(r, o)),
                  o >= 10 && (1488 === i || 93 === i) && s++,
                  (n = ((n << 1) & 2047) | e.get(o, r)),
                  o >= 10 && (1488 === n || 93 === n) && s++);
            }
            return s * r.N3;
          }),
          (t.getPenaltyN4 = function (e) {
            let t = 0,
              s = e.data.length;
            for (let r = 0; r < s; r++) t += e.data[r];
            let i = Math.abs(Math.ceil((100 * t) / s / 5) - 10);
            return i * r.N4;
          }),
          (t.applyMask = function (e, r) {
            let s = r.size;
            for (let i = 0; i < s; i++)
              for (let n = 0; n < s; n++)
                r.isReserved(n, i) ||
                  r.xor(
                    n,
                    i,
                    (function (e, r, s) {
                      switch (e) {
                        case t.Patterns.PATTERN000:
                          return (r + s) % 2 == 0;
                        case t.Patterns.PATTERN001:
                          return r % 2 == 0;
                        case t.Patterns.PATTERN010:
                          return s % 3 == 0;
                        case t.Patterns.PATTERN011:
                          return (r + s) % 3 == 0;
                        case t.Patterns.PATTERN100:
                          return (
                            (Math.floor(r / 2) + Math.floor(s / 3)) % 2 == 0
                          );
                        case t.Patterns.PATTERN101:
                          return ((r * s) % 2) + ((r * s) % 3) == 0;
                        case t.Patterns.PATTERN110:
                          return (((r * s) % 2) + ((r * s) % 3)) % 2 == 0;
                        case t.Patterns.PATTERN111:
                          return (((r * s) % 3) + ((r + s) % 2)) % 2 == 0;
                        default:
                          throw Error("bad maskPattern:" + e);
                      }
                    })(e, n, i),
                  );
          }),
          (t.getBestMask = function (e, r) {
            let s = Object.keys(t.Patterns).length,
              i = 0,
              n = 1 / 0;
            for (let o = 0; o < s; o++) {
              (r(o), t.applyMask(o, e));
              let s =
                t.getPenaltyN1(e) +
                t.getPenaltyN2(e) +
                t.getPenaltyN3(e) +
                t.getPenaltyN4(e);
              (t.applyMask(o, e), s < n && ((n = s), (i = o)));
            }
            return i;
          }));
      },
      21988: (e, t, r) => {
        let s = r(72864),
          i = r(46569);
        ((t.NUMERIC = { id: "Numeric", bit: 1, ccBits: [10, 12, 14] }),
          (t.ALPHANUMERIC = {
            id: "Alphanumeric",
            bit: 2,
            ccBits: [9, 11, 13],
          }),
          (t.BYTE = { id: "Byte", bit: 4, ccBits: [8, 16, 16] }),
          (t.KANJI = { id: "Kanji", bit: 8, ccBits: [8, 10, 12] }),
          (t.MIXED = { bit: -1 }),
          (t.getCharCountIndicator = function (e, t) {
            if (!e.ccBits) throw Error("Invalid mode: " + e);
            if (!s.isValid(t)) throw Error("Invalid version: " + t);
            return t >= 1 && t < 10
              ? e.ccBits[0]
              : t < 27
                ? e.ccBits[1]
                : e.ccBits[2];
          }),
          (t.getBestModeForData = function (e) {
            return i.testNumeric(e)
              ? t.NUMERIC
              : i.testAlphanumeric(e)
                ? t.ALPHANUMERIC
                : i.testKanji(e)
                  ? t.KANJI
                  : t.BYTE;
          }),
          (t.toString = function (e) {
            if (e && e.id) return e.id;
            throw Error("Invalid mode");
          }),
          (t.isValid = function (e) {
            return e && e.bit && e.ccBits;
          }),
          (t.from = function (e, r) {
            if (t.isValid(e)) return e;
            try {
              return (function (e) {
                if ("string" != typeof e) throw Error("Param is not a string");
                let r = e.toLowerCase();
                switch (r) {
                  case "numeric":
                    return t.NUMERIC;
                  case "alphanumeric":
                    return t.ALPHANUMERIC;
                  case "kanji":
                    return t.KANJI;
                  case "byte":
                    return t.BYTE;
                  default:
                    throw Error("Unknown mode: " + e);
                }
              })(e);
            } catch (e) {
              return r;
            }
          }));
      },
      73895: (e, t, r) => {
        "use strict";
        let s = r(21988);
        function i(e) {
          ((this.mode = s.NUMERIC), (this.data = e.toString()));
        }
        ((i.getBitsLength = function (e) {
          return 10 * Math.floor(e / 3) + (e % 3 ? (e % 3) * 3 + 1 : 0);
        }),
          (i.prototype.getLength = function () {
            return this.data.length;
          }),
          (i.prototype.getBitsLength = function () {
            return i.getBitsLength(this.data.length);
          }),
          (i.prototype.write = function (e) {
            let t, r;
            for (t = 0; t + 3 <= this.data.length; t += 3)
              ((r = parseInt(this.data.substr(t, 3), 10)), e.put(r, 10));
            let s = this.data.length - t;
            s > 0 &&
              ((r = parseInt(this.data.substr(t), 10)), e.put(r, 3 * s + 1));
          }),
          (e.exports = i));
      },
      7371: (e, t, r) => {
        let s = r(88235);
        ((t.mul = function (e, t) {
          let r = new Uint8Array(e.length + t.length - 1);
          for (let i = 0; i < e.length; i++)
            for (let n = 0; n < t.length; n++) r[i + n] ^= s.mul(e[i], t[n]);
          return r;
        }),
          (t.mod = function (e, t) {
            let r = new Uint8Array(e);
            for (; r.length - t.length >= 0; ) {
              let e = r[0];
              for (let i = 0; i < t.length; i++) r[i] ^= s.mul(t[i], e);
              let i = 0;
              for (; i < r.length && 0 === r[i]; ) i++;
              r = r.slice(i);
            }
            return r;
          }),
          (t.generateECPolynomial = function (e) {
            let r = new Uint8Array([1]);
            for (let i = 0; i < e; i++)
              r = t.mul(r, new Uint8Array([1, s.exp(i)]));
            return r;
          }));
      },
      86322: (e, t, r) => {
        let s = r(33181),
          i = r(15312),
          n = r(39157),
          o = r(36850),
          a = r(38086),
          l = r(60535),
          d = r(1378),
          c = r(1623),
          h = r(38410),
          u = r(32398),
          f = r(11688),
          p = r(21988),
          m = r(66416);
        function g(e, t, r) {
          let s, i;
          let n = e.size,
            o = f.getEncodedBits(t, r);
          for (s = 0; s < 15; s++)
            ((i = ((o >> s) & 1) == 1),
              s < 6
                ? e.set(s, 8, i, !0)
                : s < 8
                  ? e.set(s + 1, 8, i, !0)
                  : e.set(n - 15 + s, 8, i, !0),
              s < 8
                ? e.set(8, n - s - 1, i, !0)
                : s < 9
                  ? e.set(8, 15 - s - 1 + 1, i, !0)
                  : e.set(8, 15 - s - 1, i, !0));
          e.set(n - 8, 8, 1, !0);
        }
        t.create = function (e, t) {
          let r, f;
          if (void 0 === e || "" === e) throw Error("No input text");
          let x = i.M;
          return (
            void 0 !== t &&
              ((x = i.from(t.errorCorrectionLevel, i.M)),
              (r = u.from(t.version)),
              (f = d.from(t.maskPattern)),
              t.toSJISFunc && s.setToSJISFunction(t.toSJISFunc)),
            (function (e, t, r, i) {
              let f;
              if (Array.isArray(e)) f = m.fromArray(e);
              else if ("string" == typeof e) {
                let s = t;
                if (!s) {
                  let t = m.rawSplit(e);
                  s = u.getBestVersionForData(t, r);
                }
                f = m.fromString(e, s || 40);
              } else throw Error("Invalid data");
              let x = u.getBestVersionForData(f, r);
              if (!x)
                throw Error(
                  "The amount of data is too big to be stored in a QR Code",
                );
              if (t) {
                if (t < x)
                  throw Error(
                    "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " +
                      x +
                      ".\n",
                  );
              } else t = x;
              let b = (function (e, t, r) {
                  let i = new n();
                  r.forEach(function (t) {
                    (i.put(t.mode.bit, 4),
                      i.put(t.getLength(), p.getCharCountIndicator(t.mode, e)),
                      t.write(i));
                  });
                  let o = s.getSymbolTotalCodewords(e),
                    a = c.getTotalCodewordsCount(e, t),
                    l = (o - a) * 8;
                  for (
                    i.getLengthInBits() + 4 <= l && i.put(0, 4);
                    i.getLengthInBits() % 8 != 0;
                  )
                    i.putBit(0);
                  let d = (l - i.getLengthInBits()) / 8;
                  for (let e = 0; e < d; e++) i.put(e % 2 ? 17 : 236, 8);
                  return (function (e, t, r) {
                    let i, n;
                    let o = s.getSymbolTotalCodewords(t),
                      a = c.getTotalCodewordsCount(t, r),
                      l = o - a,
                      d = c.getBlocksCount(t, r),
                      u = o % d,
                      f = d - u,
                      p = Math.floor(o / d),
                      m = Math.floor(l / d),
                      g = m + 1,
                      x = p - m,
                      b = new h(x),
                      y = 0,
                      w = Array(d),
                      v = Array(d),
                      N = 0,
                      j = new Uint8Array(e.buffer);
                    for (let e = 0; e < d; e++) {
                      let t = e < f ? m : g;
                      ((w[e] = j.slice(y, y + t)),
                        (v[e] = b.encode(w[e])),
                        (y += t),
                        (N = Math.max(N, t)));
                    }
                    let _ = new Uint8Array(o),
                      C = 0;
                    for (i = 0; i < N; i++)
                      for (n = 0; n < d; n++)
                        i < w[n].length && (_[C++] = w[n][i]);
                    for (i = 0; i < x; i++)
                      for (n = 0; n < d; n++) _[C++] = v[n][i];
                    return _;
                  })(i, e, t);
                })(t, r, f),
                y = s.getSymbolSize(t),
                w = new o(y);
              return (
                (function (e, t) {
                  let r = e.size,
                    s = l.getPositions(t);
                  for (let t = 0; t < s.length; t++) {
                    let i = s[t][0],
                      n = s[t][1];
                    for (let t = -1; t <= 7; t++)
                      if (!(i + t <= -1) && !(r <= i + t))
                        for (let s = -1; s <= 7; s++)
                          n + s <= -1 ||
                            r <= n + s ||
                            ((t >= 0 && t <= 6 && (0 === s || 6 === s)) ||
                            (s >= 0 && s <= 6 && (0 === t || 6 === t)) ||
                            (t >= 2 && t <= 4 && s >= 2 && s <= 4)
                              ? e.set(i + t, n + s, !0, !0)
                              : e.set(i + t, n + s, !1, !0));
                  }
                })(w, t),
                (function (e) {
                  let t = e.size;
                  for (let r = 8; r < t - 8; r++) {
                    let t = r % 2 == 0;
                    (e.set(r, 6, t, !0), e.set(6, r, t, !0));
                  }
                })(w),
                (function (e, t) {
                  let r = a.getPositions(t);
                  for (let t = 0; t < r.length; t++) {
                    let s = r[t][0],
                      i = r[t][1];
                    for (let t = -2; t <= 2; t++)
                      for (let r = -2; r <= 2; r++)
                        -2 === t ||
                        2 === t ||
                        -2 === r ||
                        2 === r ||
                        (0 === t && 0 === r)
                          ? e.set(s + t, i + r, !0, !0)
                          : e.set(s + t, i + r, !1, !0);
                  }
                })(w, t),
                g(w, r, 0),
                t >= 7 &&
                  (function (e, t) {
                    let r, s, i;
                    let n = e.size,
                      o = u.getEncodedBits(t);
                    for (let t = 0; t < 18; t++)
                      ((r = Math.floor(t / 3)),
                        (s = (t % 3) + n - 8 - 3),
                        (i = ((o >> t) & 1) == 1),
                        e.set(r, s, i, !0),
                        e.set(s, r, i, !0));
                  })(w, t),
                (function (e, t) {
                  let r = e.size,
                    s = -1,
                    i = r - 1,
                    n = 7,
                    o = 0;
                  for (let a = r - 1; a > 0; a -= 2)
                    for (6 === a && a--; ; ) {
                      for (let r = 0; r < 2; r++)
                        if (!e.isReserved(i, a - r)) {
                          let s = !1;
                          (o < t.length && (s = ((t[o] >>> n) & 1) == 1),
                            e.set(i, a - r, s),
                            -1 == --n && (o++, (n = 7)));
                        }
                      if ((i += s) < 0 || r <= i) {
                        ((i -= s), (s = -s));
                        break;
                      }
                    }
                })(w, b),
                isNaN(i) && (i = d.getBestMask(w, g.bind(null, w, r))),
                d.applyMask(i, w),
                g(w, r, i),
                {
                  modules: w,
                  version: t,
                  errorCorrectionLevel: r,
                  maskPattern: i,
                  segments: f,
                }
              );
            })(e, r, x, f)
          );
        };
      },
      38410: (e, t, r) => {
        "use strict";
        let s = r(7371);
        function i(e) {
          ((this.genPoly = void 0),
            (this.degree = e),
            this.degree && this.initialize(this.degree));
        }
        ((i.prototype.initialize = function (e) {
          ((this.degree = e),
            (this.genPoly = s.generateECPolynomial(this.degree)));
        }),
          (i.prototype.encode = function (e) {
            if (!this.genPoly) throw Error("Encoder not initialized");
            let t = new Uint8Array(e.length + this.degree);
            t.set(e);
            let r = s.mod(t, this.genPoly),
              i = this.degree - r.length;
            if (i > 0) {
              let e = new Uint8Array(this.degree);
              return (e.set(r, i), e);
            }
            return r;
          }),
          (e.exports = i));
      },
      46569: (e, t) => {
        let r = "[0-9]+",
          s =
            "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
        s = s.replace(/u/g, "\\u");
        let i = "(?:(?![A-Z0-9 $%*+\\-./:]|" + s + ")(?:.|[\r\n]))+";
        ((t.KANJI = RegExp(s, "g")),
          (t.BYTE_KANJI = RegExp("[^A-Z0-9 $%*+\\-./:]+", "g")),
          (t.BYTE = RegExp(i, "g")),
          (t.NUMERIC = RegExp(r, "g")),
          (t.ALPHANUMERIC = RegExp("[A-Z $%*+\\-./:]+", "g")));
        let n = RegExp("^" + s + "$"),
          o = RegExp("^" + r + "$"),
          a = RegExp("^[A-Z0-9 $%*+\\-./:]+$");
        ((t.testKanji = function (e) {
          return n.test(e);
        }),
          (t.testNumeric = function (e) {
            return o.test(e);
          }),
          (t.testAlphanumeric = function (e) {
            return a.test(e);
          }));
      },
      66416: (e, t, r) => {
        let s = r(21988),
          i = r(73895),
          n = r(27554),
          o = r(96322),
          a = r(82737),
          l = r(46569),
          d = r(33181),
          c = r(56724);
        function h(e) {
          return unescape(encodeURIComponent(e)).length;
        }
        function u(e, t, r) {
          let s;
          let i = [];
          for (; null !== (s = e.exec(r)); )
            i.push({
              data: s[0],
              index: s.index,
              mode: t,
              length: s[0].length,
            });
          return i;
        }
        function f(e) {
          let t, r;
          let i = u(l.NUMERIC, s.NUMERIC, e),
            n = u(l.ALPHANUMERIC, s.ALPHANUMERIC, e);
          d.isKanjiModeEnabled()
            ? ((t = u(l.BYTE, s.BYTE, e)), (r = u(l.KANJI, s.KANJI, e)))
            : ((t = u(l.BYTE_KANJI, s.BYTE, e)), (r = []));
          let o = i.concat(n, t, r);
          return o
            .sort(function (e, t) {
              return e.index - t.index;
            })
            .map(function (e) {
              return { data: e.data, mode: e.mode, length: e.length };
            });
        }
        function p(e, t) {
          switch (t) {
            case s.NUMERIC:
              return i.getBitsLength(e);
            case s.ALPHANUMERIC:
              return n.getBitsLength(e);
            case s.KANJI:
              return a.getBitsLength(e);
            case s.BYTE:
              return o.getBitsLength(e);
          }
        }
        function m(e, t) {
          let r;
          let l = s.getBestModeForData(e);
          if ((r = s.from(t, l)) !== s.BYTE && r.bit < l.bit)
            throw Error(
              '"' +
                e +
                '" cannot be encoded with mode ' +
                s.toString(r) +
                ".\n Suggested mode is: " +
                s.toString(l),
            );
          switch (
            (r !== s.KANJI || d.isKanjiModeEnabled() || (r = s.BYTE), r)
          ) {
            case s.NUMERIC:
              return new i(e);
            case s.ALPHANUMERIC:
              return new n(e);
            case s.KANJI:
              return new a(e);
            case s.BYTE:
              return new o(e);
          }
        }
        ((t.fromArray = function (e) {
          return e.reduce(function (e, t) {
            return (
              "string" == typeof t
                ? e.push(m(t, null))
                : t.data && e.push(m(t.data, t.mode)),
              e
            );
          }, []);
        }),
          (t.fromString = function (e, r) {
            let i = f(e, d.isKanjiModeEnabled()),
              n = (function (e) {
                let t = [];
                for (let r = 0; r < e.length; r++) {
                  let i = e[r];
                  switch (i.mode) {
                    case s.NUMERIC:
                      t.push([
                        i,
                        {
                          data: i.data,
                          mode: s.ALPHANUMERIC,
                          length: i.length,
                        },
                        { data: i.data, mode: s.BYTE, length: i.length },
                      ]);
                      break;
                    case s.ALPHANUMERIC:
                      t.push([
                        i,
                        { data: i.data, mode: s.BYTE, length: i.length },
                      ]);
                      break;
                    case s.KANJI:
                      t.push([
                        i,
                        { data: i.data, mode: s.BYTE, length: h(i.data) },
                      ]);
                      break;
                    case s.BYTE:
                      t.push([
                        { data: i.data, mode: s.BYTE, length: h(i.data) },
                      ]);
                  }
                }
                return t;
              })(i),
              o = (function (e, t) {
                let r = {},
                  i = { start: {} },
                  n = ["start"];
                for (let o = 0; o < e.length; o++) {
                  let a = e[o],
                    l = [];
                  for (let e = 0; e < a.length; e++) {
                    let d = a[e],
                      c = "" + o + e;
                    (l.push(c),
                      (r[c] = { node: d, lastCount: 0 }),
                      (i[c] = {}));
                    for (let e = 0; e < n.length; e++) {
                      let o = n[e];
                      r[o] && r[o].node.mode === d.mode
                        ? ((i[o][c] =
                            p(r[o].lastCount + d.length, d.mode) -
                            p(r[o].lastCount, d.mode)),
                          (r[o].lastCount += d.length))
                        : (r[o] && (r[o].lastCount = d.length),
                          (i[o][c] =
                            p(d.length, d.mode) +
                            4 +
                            s.getCharCountIndicator(d.mode, t)));
                    }
                  }
                  n = l;
                }
                for (let e = 0; e < n.length; e++) i[n[e]].end = 0;
                return { map: i, table: r };
              })(n, r),
              a = c.find_path(o.map, "start", "end"),
              l = [];
            for (let e = 1; e < a.length - 1; e++) l.push(o.table[a[e]].node);
            return t.fromArray(
              l.reduce(function (e, t) {
                let r = e.length - 1 >= 0 ? e[e.length - 1] : null;
                return (
                  r && r.mode === t.mode
                    ? (e[e.length - 1].data += t.data)
                    : e.push(t),
                  e
                );
              }, []),
            );
          }),
          (t.rawSplit = function (e) {
            return t.fromArray(f(e, d.isKanjiModeEnabled()));
          }));
      },
      33181: (e, t) => {
        let r;
        let s = [
          0, 26, 44, 70, 100, 134, 172, 196, 242, 292, 346, 404, 466, 532, 581,
          655, 733, 815, 901, 991, 1085, 1156, 1258, 1364, 1474, 1588, 1706,
          1828, 1921, 2051, 2185, 2323, 2465, 2611, 2761, 2876, 3034, 3196,
          3362, 3532, 3706,
        ];
        ((t.getSymbolSize = function (e) {
          if (!e) throw Error('"version" cannot be null or undefined');
          if (e < 1 || e > 40)
            throw Error('"version" should be in range from 1 to 40');
          return 4 * e + 17;
        }),
          (t.getSymbolTotalCodewords = function (e) {
            return s[e];
          }),
          (t.getBCHDigit = function (e) {
            let t = 0;
            for (; 0 !== e; ) (t++, (e >>>= 1));
            return t;
          }),
          (t.setToSJISFunction = function (e) {
            if ("function" != typeof e)
              throw Error('"toSJISFunc" is not a valid function.');
            r = e;
          }),
          (t.isKanjiModeEnabled = function () {
            return void 0 !== r;
          }),
          (t.toSJIS = function (e) {
            return r(e);
          }));
      },
      72864: (e, t) => {
        t.isValid = function (e) {
          return !isNaN(e) && e >= 1 && e <= 40;
        };
      },
      32398: (e, t, r) => {
        let s = r(33181),
          i = r(1623),
          n = r(15312),
          o = r(21988),
          a = r(72864),
          l = s.getBCHDigit(7973);
        function d(e, t) {
          return o.getCharCountIndicator(e, t) + 4;
        }
        ((t.from = function (e, t) {
          return a.isValid(e) ? parseInt(e, 10) : t;
        }),
          (t.getCapacity = function (e, t, r) {
            if (!a.isValid(e)) throw Error("Invalid QR Code version");
            void 0 === r && (r = o.BYTE);
            let n = s.getSymbolTotalCodewords(e),
              l = i.getTotalCodewordsCount(e, t),
              c = (n - l) * 8;
            if (r === o.MIXED) return c;
            let h = c - d(r, e);
            switch (r) {
              case o.NUMERIC:
                return Math.floor((h / 10) * 3);
              case o.ALPHANUMERIC:
                return Math.floor((h / 11) * 2);
              case o.KANJI:
                return Math.floor(h / 13);
              case o.BYTE:
              default:
                return Math.floor(h / 8);
            }
          }),
          (t.getBestVersionForData = function (e, r) {
            let s;
            let i = n.from(r, n.M);
            if (Array.isArray(e)) {
              if (e.length > 1)
                return (function (e, r) {
                  for (let s = 1; s <= 40; s++) {
                    let i = (function (e, t) {
                      let r = 0;
                      return (
                        e.forEach(function (e) {
                          let s = d(e.mode, t);
                          r += s + e.getBitsLength();
                        }),
                        r
                      );
                    })(e, s);
                    if (i <= t.getCapacity(s, r, o.MIXED)) return s;
                  }
                })(e, i);
              if (0 === e.length) return 1;
              s = e[0];
            } else s = e;
            return (function (e, r, s) {
              for (let i = 1; i <= 40; i++)
                if (r <= t.getCapacity(i, s, e)) return i;
            })(s.mode, s.getLength(), i);
          }),
          (t.getEncodedBits = function (e) {
            if (!a.isValid(e) || e < 7) throw Error("Invalid QR Code version");
            let t = e << 12;
            for (; s.getBCHDigit(t) - l >= 0; )
              t ^= 7973 << (s.getBCHDigit(t) - l);
            return (e << 12) | t;
          }));
      },
      91460: (e, t, r) => {
        "use strict";
        e.exports = r(82238);
      },
      4960: (e, t, r) => {
        let s = r(1429);
        ((t.render = function (e, t, r) {
          var i;
          let n = r,
            o = t;
          (void 0 !== n || (t && t.getContext) || ((n = t), (t = void 0)),
            t ||
              (o = (function () {
                try {
                  return document.createElement("canvas");
                } catch (e) {
                  throw Error("You need to specify a canvas element");
                }
              })()),
            (n = s.getOptions(n)));
          let a = s.getImageWidth(e.modules.size, n),
            l = o.getContext("2d"),
            d = l.createImageData(a, a);
          return (
            s.qrToImageData(d.data, e, n),
            (i = o),
            l.clearRect(0, 0, i.width, i.height),
            i.style || (i.style = {}),
            (i.height = a),
            (i.width = a),
            (i.style.height = a + "px"),
            (i.style.width = a + "px"),
            l.putImageData(d, 0, 0),
            o
          );
        }),
          (t.renderToDataURL = function (e, r, s) {
            let i = s;
            (void 0 !== i || (r && r.getContext) || ((i = r), (r = void 0)),
              i || (i = {}));
            let n = t.render(e, r, i),
              o = i.type || "image/png",
              a = i.rendererOpts || {};
            return n.toDataURL(o, a.quality);
          }));
      },
      65349: (e, t, r) => {
        let s = r(57147),
          i = r(207).y,
          n = r(1429);
        ((t.render = function (e, t) {
          let r = n.getOptions(t),
            s = r.rendererOpts,
            o = n.getImageWidth(e.modules.size, r);
          ((s.width = o), (s.height = o));
          let a = new i(s);
          return (n.qrToImageData(a.data, e, r), a);
        }),
          (t.renderToDataURL = function (e, r, s) {
            (void 0 === s && ((s = r), (r = void 0)),
              t.renderToBuffer(e, r, function (e, t) {
                e && s(e);
                let r = "data:image/png;base64,";
                ((r += t.toString("base64")), s(null, r));
              }));
          }),
          (t.renderToBuffer = function (e, r, s) {
            void 0 === s && ((s = r), (r = void 0));
            let i = t.render(e, r),
              n = [];
            (i.on("error", s),
              i.on("data", function (e) {
                n.push(e);
              }),
              i.on("end", function () {
                s(null, Buffer.concat(n));
              }),
              i.pack());
          }),
          (t.renderToFile = function (e, r, i, n) {
            void 0 === n && ((n = i), (i = void 0));
            let o = !1,
              a = (...e) => {
                o || ((o = !0), n.apply(null, e));
              },
              l = s.createWriteStream(e);
            (l.on("error", a), l.on("close", a), t.renderToFileStream(l, r, i));
          }),
          (t.renderToFileStream = function (e, r, s) {
            let i = t.render(r, s);
            i.pack().pipe(e);
          }));
      },
      51122: (e, t, r) => {
        let s = r(1429);
        function i(e, t) {
          let r = e.a / 255,
            s = t + '="' + e.hex + '"';
          return r < 1
            ? s + " " + t + '-opacity="' + r.toFixed(2).slice(1) + '"'
            : s;
        }
        function n(e, t, r) {
          let s = e + t;
          return (void 0 !== r && (s += " " + r), s);
        }
        t.render = function (e, t, r) {
          let o = s.getOptions(t),
            a = e.modules.size,
            l = e.modules.data,
            d = a + 2 * o.margin,
            c = o.color.light.a
              ? "<path " +
                i(o.color.light, "fill") +
                ' d="M0 0h' +
                d +
                "v" +
                d +
                'H0z"/>'
              : "",
            h =
              "<path " +
              i(o.color.dark, "stroke") +
              ' d="' +
              (function (e, t, r) {
                let s = "",
                  i = 0,
                  o = !1,
                  a = 0;
                for (let l = 0; l < e.length; l++) {
                  let d = Math.floor(l % t),
                    c = Math.floor(l / t);
                  (d || o || (o = !0),
                    e[l]
                      ? (a++,
                        (l > 0 && d > 0 && e[l - 1]) ||
                          ((s += o ? n("M", d + r, 0.5 + c + r) : n("m", i, 0)),
                          (i = 0),
                          (o = !1)),
                        (d + 1 < t && e[l + 1]) || ((s += n("h", a)), (a = 0)))
                      : i++);
                }
                return s;
              })(l, a, o.margin) +
              '"/>',
            u = o.width
              ? 'width="' + o.width + '" height="' + o.width + '" '
              : "",
            f =
              '<svg xmlns="http://www.w3.org/2000/svg" ' +
              u +
              ('viewBox="0 0 ' + d) +
              " " +
              d +
              '" shape-rendering="crispEdges">' +
              c +
              h +
              "</svg>\n";
          return ("function" == typeof r && r(null, f), f);
        };
      },
      70576: (e, t, r) => {
        let s = r(51122);
        ((t.render = s.render),
          (t.renderToFile = function (e, s, i, n) {
            void 0 === n && ((n = i), (i = void 0));
            let o = r(57147),
              a = t.render(s, i);
            o.writeFile(
              e,
              '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
                a,
              n,
            );
          }));
      },
      92024: (e, t, r) => {
        let s = r(95127),
          i = r(69043);
        t.render = function (e, t, r) {
          return t && t.small ? i.render(e, t, r) : s.render(e, t, r);
        };
      },
      69043: (e, t) => {
        let r = "\x1b[37m",
          s = "\x1b[30m",
          i = "\x1b[0m",
          n = "\x1b[47m" + s,
          o = "\x1b[40m" + r,
          a = function (e, t, r, s) {
            let i = t + 1;
            return r >= i || s >= i || s < -1 || r < -1
              ? "0"
              : r >= t || s >= t || s < 0 || r < 0
                ? "1"
                : e[s * t + r]
                  ? "2"
                  : "1";
          },
          l = function (e, t, r, s) {
            return a(e, t, r, s) + a(e, t, r, s + 1);
          };
        t.render = function (e, t, a) {
          var d, c;
          let h = e.modules.size,
            u = e.modules.data,
            f = !!(t && t.inverse),
            p = t && t.inverse ? o : n,
            m = {
              "00": i + " " + p,
              "01": i + (d = f ? s : r) + "▄" + p,
              "02": i + (c = f ? r : s) + "▄" + p,
              10: i + d + "▀" + p,
              11: " ",
              12: "▄",
              20: i + c + "▀" + p,
              21: "▀",
              22: "█",
            },
            g = i + "\n" + p,
            x = p;
          for (let e = -1; e < h + 1; e += 2) {
            for (let t = -1; t < h; t++) x += m[l(u, h, t, e)];
            x += m[l(u, h, h, e)] + g;
          }
          return ((x += i), "function" == typeof a && a(null, x), x);
        };
      },
      95127: (e, t) => {
        t.render = function (e, t, r) {
          let s = e.modules.size,
            i = e.modules.data,
            n = "\x1b[47m  \x1b[0m",
            o = "",
            a = Array(s + 3).join(n),
            l = [, ,].join(n);
          o += a + "\n";
          for (let e = 0; e < s; ++e) {
            o += n;
            for (let t = 0; t < s; t++)
              o += i[e * s + t] ? "\x1b[40m  \x1b[0m" : n;
            o += l + "\n";
          }
          return ((o += a + "\n"), "function" == typeof r && r(null, o), o);
        };
      },
      48842: (e, t, r) => {
        let s = r(1429),
          i = { WW: " ", WB: "▄", BB: "█", BW: "▀" },
          n = { BB: " ", BW: "▄", WW: "█", WB: "▀" };
        ((t.render = function (e, t, r) {
          let o = s.getOptions(t),
            a = i;
          ("#ffffff" === o.color.dark.hex || "#000000" === o.color.light.hex) &&
            (a = n);
          let l = e.modules.size,
            d = e.modules.data,
            c = "",
            h = Array(l + 2 * o.margin + 1).join(a.WW);
          h = Array(o.margin / 2 + 1).join(h + "\n");
          let u = Array(o.margin + 1).join(a.WW);
          c += h;
          for (let e = 0; e < l; e += 2) {
            c += u;
            for (let t = 0; t < l; t++) {
              var f;
              let r = d[e * l + t],
                s = d[(e + 1) * l + t];
              c +=
                ((f = a),
                r && s ? f.BB : r && !s ? f.BW : !r && s ? f.WB : f.WW);
            }
            c += u + "\n";
          }
          return (
            (c += h.slice(0, -1)),
            "function" == typeof r && r(null, c),
            c
          );
        }),
          (t.renderToFile = function (e, s, i, n) {
            void 0 === n && ((n = i), (i = void 0));
            let o = r(57147),
              a = t.render(s, i);
            o.writeFile(e, a, n);
          }));
      },
      1429: (e, t) => {
        function r(e) {
          if (
            ("number" == typeof e && (e = e.toString()), "string" != typeof e)
          )
            throw Error("Color should be defined as hex string");
          let t = e.slice().replace("#", "").split("");
          if (t.length < 3 || 5 === t.length || t.length > 8)
            throw Error("Invalid hex color: " + e);
          ((3 === t.length || 4 === t.length) &&
            (t = Array.prototype.concat.apply(
              [],
              t.map(function (e) {
                return [e, e];
              }),
            )),
            6 === t.length && t.push("F", "F"));
          let r = parseInt(t.join(""), 16);
          return {
            r: (r >> 24) & 255,
            g: (r >> 16) & 255,
            b: (r >> 8) & 255,
            a: 255 & r,
            hex: "#" + t.slice(0, 6).join(""),
          };
        }
        ((t.getOptions = function (e) {
          (e || (e = {}), e.color || (e.color = {}));
          let t =
              void 0 === e.margin || null === e.margin || e.margin < 0
                ? 4
                : e.margin,
            s = e.width && e.width >= 21 ? e.width : void 0,
            i = e.scale || 4;
          return {
            width: s,
            scale: s ? 4 : i,
            margin: t,
            color: {
              dark: r(e.color.dark || "#000000ff"),
              light: r(e.color.light || "#ffffffff"),
            },
            type: e.type,
            rendererOpts: e.rendererOpts || {},
          };
        }),
          (t.getScale = function (e, t) {
            return t.width && t.width >= e + 2 * t.margin
              ? t.width / (e + 2 * t.margin)
              : t.scale;
          }),
          (t.getImageWidth = function (e, r) {
            let s = t.getScale(e, r);
            return Math.floor((e + 2 * r.margin) * s);
          }),
          (t.qrToImageData = function (e, r, s) {
            let i = r.modules.size,
              n = r.modules.data,
              o = t.getScale(i, s),
              a = Math.floor((i + 2 * s.margin) * o),
              l = s.margin * o,
              d = [s.color.light, s.color.dark];
            for (let t = 0; t < a; t++)
              for (let r = 0; r < a; r++) {
                let c = (t * a + r) * 4,
                  h = s.color.light;
                if (t >= l && r >= l && t < a - l && r < a - l) {
                  let e = Math.floor((t - l) / o),
                    s = Math.floor((r - l) / o);
                  h = d[n[e * i + s] ? 1 : 0];
                }
                ((e[c++] = h.r), (e[c++] = h.g), (e[c++] = h.b), (e[c] = h.a));
              }
          }));
      },
      82238: (e, t, r) => {
        let s = r(55515),
          i = r(86322),
          n = r(65349),
          o = r(48842),
          a = r(92024),
          l = r(70576);
        function d(e, t, r) {
          if (void 0 === e) throw Error("String required as first argument");
          if ((void 0 === r && ((r = t), (t = {})), "function" != typeof r)) {
            if (s()) ((t = r || {}), (r = null));
            else throw Error("Callback required as last argument");
          }
          return { opts: t, cb: r };
        }
        function c(e) {
          switch (e) {
            case "svg":
              return l;
            case "txt":
            case "utf8":
              return o;
            default:
              return n;
          }
        }
        function h(e, t, r) {
          if (!r.cb)
            return new Promise(function (s, n) {
              try {
                let o = i.create(t, r.opts);
                return e(o, r.opts, function (e, t) {
                  return e ? n(e) : s(t);
                });
              } catch (e) {
                n(e);
              }
            });
          try {
            let s = i.create(t, r.opts);
            return e(s, r.opts, r.cb);
          } catch (e) {
            r.cb(e);
          }
        }
        ((t.create = i.create),
          (t.toCanvas = r(50643).toCanvas),
          (t.toString = function (e, t, r) {
            let s = d(e, t, r),
              i = s.opts ? s.opts.type : void 0,
              n = (function (e) {
                switch (e) {
                  case "svg":
                    return l;
                  case "terminal":
                    return a;
                  default:
                    return o;
                }
              })(i);
            return h(n.render, e, s);
          }),
          (t.toDataURL = function (e, t, r) {
            let s = d(e, t, r),
              i = c(s.opts.type);
            return h(i.renderToDataURL, e, s);
          }),
          (t.toBuffer = function (e, t, r) {
            let s = d(e, t, r),
              i = c(s.opts.type);
            return h(i.renderToBuffer, e, s);
          }),
          (t.toFile = function (e, t, r, i) {
            if (
              "string" != typeof e ||
              !("string" == typeof t || "object" == typeof t)
            )
              throw Error("Invalid argument");
            if (arguments.length < 3 && !s())
              throw Error("Too few arguments provided");
            let n = d(t, r, i),
              o =
                n.opts.type ||
                e.slice(((e.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase(),
              a = c(o),
              l = a.renderToFile.bind(null, e);
            return h(l, t, n);
          }),
          (t.toFileStream = function (e, t, r) {
            if (arguments.length < 2) throw Error("Too few arguments provided");
            let s = d(t, r, e.emit.bind(e, "error")),
              i = c("png"),
              n = i.renderToFileStream.bind(null, e);
            h(n, t, s);
          }));
      },
      91551: (e, t, r) => {
        "use strict";
        (r.r(t),
          r.d(t, { $$typeof: () => o, __esModule: () => n, default: () => l }));
        var s = r(19894);
        let i = (0, s.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\funding-setup\[clientId]\page.tsx`,
          ),
          { __esModule: n, $$typeof: o } = i,
          a = i.default,
          l = a;
      },
      18685: (e, t, r) => {
        "use strict";
        (r.r(t), r.d(t, { default: () => x, metadata: () => g }));
        var s = r(31487),
          i = r(72972),
          n = r.n(i);
        r(40642);
        var o = r(19894);
        let a = (0, o.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx`,
          ),
          { __esModule: l, $$typeof: d } = a;
        a.default;
        let c = (0, o.createProxy)(
          String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx#Providers`,
        );
        var h = r(15762);
        let u = (0, o.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\components\Header.tsx`,
          ),
          { __esModule: f, $$typeof: p } = u,
          m = u.default,
          g = {
            title: "CareConnect - Supporting Our Community",
            description:
              "A platform connecting individuals experiencing homelessness with resources, opportunities, and community support.",
            keywords:
              "homeless support, community resources, job opportunities, donations, assistance",
          };
        function x({ children: e }) {
          return s.jsx("html", {
            lang: "en",
            children: s.jsx("body", {
              className: n().className,
              children: (0, s.jsxs)(c, {
                children: [
                  s.jsx(m, {}),
                  s.jsx("div", {
                    className: "min-h-screen bg-gray-50",
                    children: s.jsx("main", { children: e }),
                  }),
                  s.jsx(h.x7, {
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
  var t = require("../../../webpack-runtime.js");
  t.C(e);
  var r = (e) => t((t.s = e)),
    s = t.X(0, [623, 934], () => r(58515));
  module.exports = s;
})();

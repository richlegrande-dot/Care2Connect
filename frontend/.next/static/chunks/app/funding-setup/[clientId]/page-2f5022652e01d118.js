(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [810],
  {
    35530: function (e, t, s) {
      Promise.resolve().then(s.bind(s, 90458));
    },
    90458: function (e, t, s) {
      "use strict";
      (s.r(t),
        s.d(t, {
          default: function () {
            return M;
          },
        }));
      var n = s(37821),
        a = s(58078),
        r = s(46179),
        l = s(6026),
        o = s(23772),
        i = s(34270),
        d = s(48115);
      function c(e) {
        var t, s;
        let { data: r, onComplete: o, onBack: c, onHelp: m } = e,
          [u, h] = (0, a.useState)({
            fullName:
              r.fullName ||
              (null === (s = r.extractedFields) || void 0 === s
                ? void 0
                : null === (t = s.name) || void 0 === t
                  ? void 0
                  : t.value) ||
              "",
            zipCode: r.zipCode || "",
            dateOfBirth: r.dateOfBirth || "",
            email: r.email || "",
            phone: r.phone || "",
            consent: r.consent || !1,
          }),
          [x, p] = (0, a.useState)({}),
          [g, b] = (0, a.useState)(!1);
        (0, a.useEffect)(() => {
          r.missingFields && r.missingFields.length > 0 && b(!0);
        }, [r.missingFields]);
        let f = (e, t) => {
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
                let s = y(t);
                if (s < 18) return "Must be at least 18 years old";
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
          y = (e) => {
            let t = new Date(),
              s = new Date(e),
              n = t.getFullYear() - s.getFullYear(),
              a = t.getMonth() - s.getMonth();
            return (
              (a < 0 || (0 === a && t.getDate() < s.getDate())) && n--,
              n
            );
          },
          v = (e, t) => {
            (h((s) => ({ ...s, [e]: t })),
              x[e] &&
                p((t) => {
                  let s = { ...t };
                  return (delete s[e], s);
                }));
          },
          j = (e) => {
            let t = f(e, u[e]);
            t && p((s) => ({ ...s, [e]: t }));
          },
          N = () => {
            let e = {};
            if (
              (["fullName", "zipCode", "dateOfBirth", "consent"].forEach(
                (t) => {
                  let s = f(t, u[t]);
                  s && (e[t] = s);
                },
              ),
              u.email)
            ) {
              let t = f("email", u.email);
              t && (e.email = t);
            }
            if (u.phone) {
              let t = f("phone", u.phone);
              t && (e.phone = t);
            }
            return (p(e), 0 === Object.keys(e).length);
          },
          w = (e) => {
            var t;
            let s =
              null === (t = r.extractedFields) || void 0 === t ? void 0 : t[e];
            if (!s) return null;
            let a = s.confidence || 0,
              l = "gray",
              o = "Unknown";
            return (
              a >= 0.85
                ? ((l = "green"), (o = "High confidence"))
                : a >= 0.6
                  ? ((l = "yellow"), (o = "Medium confidence"))
                  : ((l = "red"), (o = "Low confidence")),
              (0, n.jsx)("span", {
                className: "ml-2 px-2 py-1 text-xs rounded bg-"
                  .concat(l, "-100 text-")
                  .concat(l, "-700 border border-")
                  .concat(l, "-200"),
                children: o,
              })
            );
          };
        return (0, n.jsxs)("form", {
          onSubmit: (e) => {
            if ((e.preventDefault(), N())) o(u);
            else {
              let e = Object.keys(x)[0],
                t = document.getElementById("field-".concat(e));
              t && t.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          },
          className: "space-y-6",
          children: [
            (0, n.jsxs)("div", {
              children: [
                (0, n.jsx)("h2", {
                  className: "text-xl font-semibold text-gray-900 mb-2",
                  children: "Confirm Your Details",
                }),
                (0, n.jsx)("p", {
                  className: "text-gray-600",
                  children:
                    "Review and complete the information we extracted from your recording. Required fields are marked with *.",
                }),
              ],
            }),
            r.missingFields &&
              r.missingFields.length > 0 &&
              (0, n.jsxs)("div", {
                className:
                  "bg-yellow-50 border border-yellow-200 rounded-lg p-4",
                children: [
                  (0, n.jsxs)("div", {
                    className: "flex items-start",
                    children: [
                      (0, n.jsx)(i.Z, {
                        className:
                          "w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5",
                      }),
                      (0, n.jsxs)("div", {
                        className: "flex-1",
                        children: [
                          (0, n.jsx)("h3", {
                            className:
                              "text-sm font-medium text-yellow-800 mb-2",
                            children: "Missing Information Detected",
                          }),
                          (0, n.jsx)("p", {
                            className: "text-sm text-yellow-700 mb-3",
                            children:
                              "We couldn't extract all required information from your recording. Please provide the following:",
                          }),
                          (0, n.jsx)("ul", {
                            className:
                              "list-disc list-inside text-sm text-yellow-700 space-y-1",
                            children: r.missingFields.map((e, t) =>
                              (0, n.jsx)("li", { children: e }, t),
                            ),
                          }),
                          r.followUpQuestions &&
                            r.followUpQuestions.length > 0 &&
                            (0, n.jsxs)("button", {
                              type: "button",
                              onClick: () => b(!g),
                              className:
                                "mt-3 text-sm text-yellow-800 underline hover:text-yellow-900",
                              children: [
                                g ? "Hide" : "Show",
                                " follow-up questions",
                              ],
                            }),
                        ],
                      }),
                    ],
                  }),
                  g &&
                    r.followUpQuestions &&
                    (0, n.jsx)("div", {
                      className: "mt-4 pl-8 space-y-2",
                      children: r.followUpQuestions.map((e, t) =>
                        (0, n.jsxs)(
                          "div",
                          {
                            className:
                              "flex items-start text-sm text-yellow-700",
                            children: [
                              (0, n.jsx)("span", {
                                className: "mr-2",
                                children: "•",
                              }),
                              (0, n.jsx)("span", { children: e }),
                            ],
                          },
                          t,
                        ),
                      ),
                    }),
                ],
              }),
            (0, n.jsxs)("div", {
              className: "space-y-4",
              children: [
                (0, n.jsxs)("div", {
                  id: "field-fullName",
                  children: [
                    (0, n.jsxs)("label", {
                      className: "block text-sm font-medium text-gray-700 mb-1",
                      children: [
                        "Full Name ",
                        (0, n.jsx)("span", {
                          className: "text-red-500",
                          children: "*",
                        }),
                        w("name"),
                      ],
                    }),
                    (0, n.jsx)("input", {
                      type: "text",
                      value: u.fullName,
                      onChange: (e) => v("fullName", e.target.value),
                      onBlur: () => j("fullName"),
                      className:
                        "\n              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\n              ".concat(
                          x.fullName ? "border-red-500" : "border-gray-300",
                          "\n            ",
                        ),
                      placeholder: "John Smith",
                    }),
                    x.fullName &&
                      (0, n.jsxs)("p", {
                        className:
                          "mt-1 text-sm text-red-600 flex items-center",
                        children: [
                          (0, n.jsx)(i.Z, { className: "w-4 h-4 mr-1" }),
                          x.fullName,
                        ],
                      }),
                  ],
                }),
                (0, n.jsxs)("div", {
                  id: "field-zipCode",
                  children: [
                    (0, n.jsxs)("label", {
                      className: "block text-sm font-medium text-gray-700 mb-1",
                      children: [
                        "ZIP Code ",
                        (0, n.jsx)("span", {
                          className: "text-red-500",
                          children: "*",
                        }),
                        w("location"),
                      ],
                    }),
                    (0, n.jsx)("input", {
                      type: "text",
                      value: u.zipCode,
                      onChange: (e) =>
                        v(
                          "zipCode",
                          e.target.value.replace(/\D/g, "").slice(0, 5),
                        ),
                      onBlur: () => j("zipCode"),
                      className:
                        "\n              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\n              ".concat(
                          x.zipCode ? "border-red-500" : "border-gray-300",
                          "\n            ",
                        ),
                      placeholder: "90001",
                      maxLength: 5,
                    }),
                    x.zipCode &&
                      (0, n.jsxs)("p", {
                        className:
                          "mt-1 text-sm text-red-600 flex items-center",
                        children: [
                          (0, n.jsx)(i.Z, { className: "w-4 h-4 mr-1" }),
                          x.zipCode,
                        ],
                      }),
                  ],
                }),
                (0, n.jsxs)("div", {
                  id: "field-dateOfBirth",
                  children: [
                    (0, n.jsxs)("label", {
                      className: "block text-sm font-medium text-gray-700 mb-1",
                      children: [
                        "Date of Birth ",
                        (0, n.jsx)("span", {
                          className: "text-red-500",
                          children: "*",
                        }),
                        w("age"),
                      ],
                    }),
                    (0, n.jsx)("input", {
                      type: "date",
                      value: u.dateOfBirth,
                      onChange: (e) => v("dateOfBirth", e.target.value),
                      onBlur: () => j("dateOfBirth"),
                      max: new Date().toISOString().split("T")[0],
                      className:
                        "\n              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\n              ".concat(
                          x.dateOfBirth ? "border-red-500" : "border-gray-300",
                          "\n            ",
                        ),
                    }),
                    x.dateOfBirth &&
                      (0, n.jsxs)("p", {
                        className:
                          "mt-1 text-sm text-red-600 flex items-center",
                        children: [
                          (0, n.jsx)(i.Z, { className: "w-4 h-4 mr-1" }),
                          x.dateOfBirth,
                        ],
                      }),
                    u.dateOfBirth &&
                      !x.dateOfBirth &&
                      (0, n.jsxs)("p", {
                        className:
                          "mt-1 text-sm text-gray-500 flex items-center",
                        children: [
                          (0, n.jsx)(d.Z, { className: "w-4 h-4 mr-1" }),
                          "Age: ",
                          y(u.dateOfBirth),
                          " years old",
                        ],
                      }),
                  ],
                }),
                (0, n.jsxs)("div", {
                  id: "field-email",
                  children: [
                    (0, n.jsx)("label", {
                      className: "block text-sm font-medium text-gray-700 mb-1",
                      children: "Email (Optional)",
                    }),
                    (0, n.jsx)("input", {
                      type: "email",
                      value: u.email,
                      onChange: (e) => v("email", e.target.value),
                      onBlur: () => j("email"),
                      className:
                        "\n              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\n              ".concat(
                          x.email ? "border-red-500" : "border-gray-300",
                          "\n            ",
                        ),
                      placeholder: "your.email@example.com",
                    }),
                    x.email &&
                      (0, n.jsxs)("p", {
                        className:
                          "mt-1 text-sm text-red-600 flex items-center",
                        children: [
                          (0, n.jsx)(i.Z, { className: "w-4 h-4 mr-1" }),
                          x.email,
                        ],
                      }),
                  ],
                }),
                (0, n.jsxs)("div", {
                  id: "field-phone",
                  children: [
                    (0, n.jsx)("label", {
                      className: "block text-sm font-medium text-gray-700 mb-1",
                      children: "Phone (Optional)",
                    }),
                    (0, n.jsx)("input", {
                      type: "tel",
                      value: u.phone,
                      onChange: (e) => v("phone", e.target.value),
                      onBlur: () => j("phone"),
                      className:
                        "\n              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent\n              ".concat(
                          x.phone ? "border-red-500" : "border-gray-300",
                          "\n            ",
                        ),
                      placeholder: "(555) 123-4567",
                    }),
                    x.phone &&
                      (0, n.jsxs)("p", {
                        className:
                          "mt-1 text-sm text-red-600 flex items-center",
                        children: [
                          (0, n.jsx)(i.Z, { className: "w-4 h-4 mr-1" }),
                          x.phone,
                        ],
                      }),
                  ],
                }),
                (0, n.jsxs)("div", {
                  id: "field-consent",
                  className: "border-t pt-4",
                  children: [
                    (0, n.jsxs)("label", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("input", {
                          type: "checkbox",
                          checked: u.consent,
                          onChange: (e) => v("consent", e.target.checked),
                          className:
                            "mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded",
                        }),
                        (0, n.jsxs)("span", {
                          className: "ml-3 text-sm text-gray-700",
                          children: [
                            "I confirm that the information provided is accurate and I consent to CareConnect using this information to help me create fundraising materials. I understand that CareConnect does not create or publish GoFundMe campaigns on my behalf. ",
                            (0, n.jsx)("span", {
                              className: "text-red-500",
                              children: "*",
                            }),
                          ],
                        }),
                      ],
                    }),
                    x.consent &&
                      (0, n.jsxs)("p", {
                        className:
                          "mt-2 text-sm text-red-600 flex items-center ml-7",
                        children: [
                          (0, n.jsx)(i.Z, { className: "w-4 h-4 mr-1" }),
                          x.consent,
                        ],
                      }),
                  ],
                }),
              ],
            }),
            (0, n.jsxs)("div", {
              className: "flex items-center justify-between pt-6 border-t",
              children: [
                (0, n.jsx)("button", {
                  type: "button",
                  onClick: m,
                  className:
                    "text-blue-600 hover:text-blue-700 text-sm font-medium",
                  children: "Need help?",
                }),
                (0, n.jsxs)("div", {
                  className: "flex space-x-3",
                  children: [
                    (0, n.jsx)("button", {
                      type: "button",
                      onClick: c,
                      className:
                        "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium",
                      children: "Back",
                    }),
                    (0, n.jsxs)("button", {
                      type: "submit",
                      className:
                        "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center",
                      children: [
                        "Next: Generate QR Code",
                        (0, n.jsx)(l.Z, { className: "w-4 h-4 ml-2" }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
      var m = s(57775),
        u = s(66693),
        h = s(55787),
        x = s(92789),
        p = s(4646);
      function g(e) {
        let { data: t, onComplete: s, onBack: r, onHelp: o, clientId: d } = e,
          [c, g] = (0, a.useState)(""),
          [b, f] = (0, a.useState)(""),
          [y, v] = (0, a.useState)(""),
          [j, N] = (0, a.useState)(!1),
          [w, C] = (0, a.useState)(!1),
          [k, F] = (0, a.useState)(!1);
        (0, a.useEffect)(() => {
          S();
        }, [d]);
        let S = async () => {
            N(!0);
            try {
              let e = t.publicSlug || "donate-".concat(d.slice(0, 8)),
                s = window.location.origin,
                n = "".concat(s, "/donate/").concat(e);
              (v(e), f(n));
              let a = await p.toDataURL(n, {
                width: 400,
                margin: 2,
                color: { dark: "#000000", light: "#FFFFFF" },
              });
              g(a);
            } catch (e) {
              console.error("[QRCodeStep] Error generating QR code:", e);
            } finally {
              N(!1);
            }
          },
          D = async () => {
            try {
              (await navigator.clipboard.writeText(b),
                C(!0),
                setTimeout(() => C(!1), 2e3));
            } catch (e) {
              console.error("[QRCodeStep] Error copying URL:", e);
            }
          };
        return (0, n.jsxs)("div", {
          className: "space-y-6",
          children: [
            (0, n.jsxs)("div", {
              children: [
                (0, n.jsx)("h2", {
                  className: "text-xl font-semibold text-gray-900 mb-2",
                  children: "Generate Donation QR Code",
                }),
                (0, n.jsx)("p", {
                  className: "text-gray-600",
                  children:
                    "Create a scannable QR code that links to your secure donation page",
                }),
              ],
            }),
            j
              ? (0, n.jsxs)("div", {
                  className: "flex flex-col items-center justify-center py-12",
                  children: [
                    (0, n.jsx)("div", {
                      className:
                        "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4",
                    }),
                    (0, n.jsx)("p", {
                      className: "text-gray-600",
                      children: "Generating your QR code...",
                    }),
                  ],
                })
              : (0, n.jsxs)(n.Fragment, {
                  children: [
                    (0, n.jsx)("div", {
                      className:
                        "bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8",
                      children: (0, n.jsx)("div", {
                        className: "flex flex-col items-center",
                        children:
                          c &&
                          (0, n.jsxs)(n.Fragment, {
                            children: [
                              (0, n.jsx)("img", {
                                src: c,
                                alt: "Donation QR Code",
                                className:
                                  "w-64 h-64 mb-6 bg-white p-4 rounded-lg shadow-sm",
                              }),
                              (0, n.jsxs)("div", {
                                className:
                                  "bg-white rounded-lg p-4 w-full max-w-md shadow-sm",
                                children: [
                                  (0, n.jsx)("p", {
                                    className:
                                      "text-sm text-gray-600 mb-2 text-center",
                                    children: "Donation Page URL:",
                                  }),
                                  (0, n.jsxs)("div", {
                                    className: "flex items-center space-x-2",
                                    children: [
                                      (0, n.jsx)("input", {
                                        type: "text",
                                        value: b,
                                        readOnly: !0,
                                        className:
                                          "flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm",
                                      }),
                                      (0, n.jsx)("button", {
                                        onClick: D,
                                        className:
                                          "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center",
                                        title: "Copy URL",
                                        children: w
                                          ? (0, n.jsxs)(n.Fragment, {
                                              children: [
                                                (0, n.jsx)(l.Z, {
                                                  className: "w-4 h-4 mr-1",
                                                }),
                                                "Copied!",
                                              ],
                                            })
                                          : (0, n.jsxs)(n.Fragment, {
                                              children: [
                                                (0, n.jsx)(m.Z, {
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
                    (0, n.jsxs)("div", {
                      className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                      children: [
                        (0, n.jsxs)("button", {
                          onClick: () => {
                            if (!c) return;
                            let e = document.createElement("a");
                            ((e.href = c),
                              (e.download = "donation-qr-".concat(y, ".png")),
                              document.body.appendChild(e),
                              e.click(),
                              document.body.removeChild(e));
                          },
                          className:
                            "flex items-center justify-center px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors",
                          children: [
                            (0, n.jsx)(u.Z, { className: "w-5 h-5 mr-2" }),
                            "Download PNG",
                          ],
                        }),
                        (0, n.jsxs)("button", {
                          onClick: () => {
                            let e = window.open("", "_blank");
                            e &&
                              (e.document.write(
                                "\n      <!DOCTYPE html>\n      <html>\n        <head>\n          <title>Donation QR Code - "
                                  .concat(
                                    t.fullName || "CareConnect",
                                    "</title>\n          <style>\n            @page {\n              margin: 1in;\n            }\n            body {\n              font-family: Arial, sans-serif;\n              text-align: center;\n              padding: 20px;\n            }\n            h1 {\n              font-size: 24px;\n              margin-bottom: 10px;\n            }\n            p {\n              font-size: 14px;\n              color: #666;\n              margin-bottom: 20px;\n            }\n            img {\n              max-width: 300px;\n              margin: 20px auto;\n            }\n            .url {\n              font-size: 12px;\n              word-break: break-all;\n              margin-top: 20px;\n              padding: 10px;\n              background: #f5f5f5;\n              border-radius: 5px;\n            }\n          </style>\n        </head>\n        <body>\n          <h1>Support ",
                                  )
                                  .concat(
                                    t.fullName || "This Campaign",
                                    '</h1>\n          <p>Scan this QR code to make a donation</p>\n          <img src="',
                                  )
                                  .concat(
                                    c,
                                    '" alt="Donation QR Code" />\n          <p>Or visit:</p>\n          <div class="url">',
                                  )
                                  .concat(
                                    b,
                                    '</div>\n          <p style="margin-top: 40px; font-size: 10px; color: #999;">\n            Powered by CareConnect\n          </p>\n        </body>\n      </html>\n    ',
                                  ),
                              ),
                              e.document.close(),
                              e.focus(),
                              setTimeout(() => {
                                e.print();
                              }, 250));
                          },
                          className:
                            "flex items-center justify-center px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors",
                          children: [
                            (0, n.jsx)(h.Z, { className: "w-5 h-5 mr-2" }),
                            "Print QR Code",
                          ],
                        }),
                        (0, n.jsxs)("a", {
                          href: b,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          className:
                            "flex items-center justify-center px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors",
                          children: [
                            (0, n.jsx)(x.Z, { className: "w-5 h-5 mr-2" }),
                            "Test Link",
                          ],
                        }),
                      ],
                    }),
                    (0, n.jsxs)("div", {
                      className:
                        "bg-blue-50 border border-blue-200 rounded-lg p-6",
                      children: [
                        (0, n.jsxs)("button", {
                          onClick: () => F(!k),
                          className:
                            "flex items-center justify-between w-full text-left",
                          children: [
                            (0, n.jsx)("h3", {
                              className: "text-sm font-semibold text-blue-900",
                              children: "How donations work",
                            }),
                            (0, n.jsx)("span", {
                              className: "text-blue-600",
                              children: k ? "−" : "+",
                            }),
                          ],
                        }),
                        k &&
                          (0, n.jsxs)("div", {
                            className: "mt-4 space-y-3 text-sm text-blue-800",
                            children: [
                              (0, n.jsxs)("div", {
                                className: "flex items-start",
                                children: [
                                  (0, n.jsx)("span", {
                                    className: "mr-2",
                                    children: "1.",
                                  }),
                                  (0, n.jsx)("p", {
                                    children:
                                      "Donors scan your QR code or visit your donation page URL",
                                  }),
                                ],
                              }),
                              (0, n.jsxs)("div", {
                                className: "flex items-start",
                                children: [
                                  (0, n.jsx)("span", {
                                    className: "mr-2",
                                    children: "2.",
                                  }),
                                  (0, n.jsx)("p", {
                                    children:
                                      "They're taken to your secure CareConnect donation page",
                                  }),
                                ],
                              }),
                              (0, n.jsxs)("div", {
                                className: "flex items-start",
                                children: [
                                  (0, n.jsx)("span", {
                                    className: "mr-2",
                                    children: "3.",
                                  }),
                                  (0, n.jsx)("p", {
                                    children:
                                      "Donors enter their debit/credit card information via Stripe Checkout",
                                  }),
                                ],
                              }),
                              (0, n.jsxs)("div", {
                                className: "flex items-start",
                                children: [
                                  (0, n.jsx)("span", {
                                    className: "mr-2",
                                    children: "4.",
                                  }),
                                  (0, n.jsxs)("p", {
                                    children: [
                                      (0, n.jsx)("strong", {
                                        children:
                                          "No card data is stored by CareConnect",
                                      }),
                                      " — all payment processing is handled securely by Stripe",
                                    ],
                                  }),
                                ],
                              }),
                              (0, n.jsxs)("div", {
                                className: "flex items-start",
                                children: [
                                  (0, n.jsx)("span", {
                                    className: "mr-2",
                                    children: "5.",
                                  }),
                                  (0, n.jsx)("p", {
                                    children:
                                      "You receive funds directly to your connected bank account",
                                  }),
                                ],
                              }),
                              (0, n.jsxs)("div", {
                                className:
                                  "mt-4 p-3 bg-blue-100 rounded border border-blue-300",
                                children: [
                                  (0, n.jsx)("p", {
                                    className: "font-medium",
                                    children:
                                      "✓ PCI-DSS compliant payment processing",
                                  }),
                                  (0, n.jsx)("p", {
                                    className: "font-medium",
                                    children: "✓ Industry-standard encryption",
                                  }),
                                  (0, n.jsx)("p", {
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
                    (0, n.jsx)("div", {
                      className:
                        "bg-gray-50 border border-gray-200 rounded-lg p-4",
                      children: (0, n.jsxs)("div", {
                        className: "flex items-start",
                        children: [
                          (0, n.jsx)(i.Z, {
                            className:
                              "w-5 h-5 text-gray-600 mr-3 flex-shrink-0 mt-0.5",
                          }),
                          (0, n.jsxs)("div", {
                            className: "text-sm text-gray-700",
                            children: [
                              (0, n.jsx)("p", {
                                className: "font-medium mb-1",
                                children: "Privacy & Security",
                              }),
                              (0, n.jsx)("p", {
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
            (0, n.jsxs)("div", {
              className: "flex items-center justify-between pt-6 border-t",
              children: [
                (0, n.jsx)("button", {
                  type: "button",
                  onClick: o,
                  className:
                    "text-blue-600 hover:text-blue-700 text-sm font-medium",
                  children: "Need help?",
                }),
                (0, n.jsxs)("div", {
                  className: "flex space-x-3",
                  children: [
                    (0, n.jsx)("button", {
                      type: "button",
                      onClick: r,
                      className:
                        "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium",
                      children: "Back",
                    }),
                    (0, n.jsxs)("button", {
                      onClick: () => {
                        s({ publicSlug: y, qrCodeUrl: c, donationPageUrl: b });
                      },
                      disabled: j,
                      className:
                        "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed",
                      children: [
                        "Next: GoFundMe Draft",
                        (0, n.jsx)(l.Z, { className: "w-4 h-4 ml-2" }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
      var b = s(1961),
        f = s(23587);
      function y(e) {
        let { data: t, onComplete: s, onBack: r, onHelp: o, clientId: i } = e,
          [d, c] = (0, a.useState)({
            title: "",
            goal: "",
            category: "",
            location: "",
            beneficiary: "",
            story: "",
            summary: "",
          }),
          [h, x] = (0, a.useState)(null),
          [p, g] = (0, a.useState)(null),
          [y, v] = (0, a.useState)(!1);
        (0, a.useEffect)(() => {
          j();
        }, [t]);
        let j = () => {
            var e, s, n, a, r, l, o, i, d, m, u, h, x, p, g, b, f, y;
            let v = t.extractedFields || {},
              j =
                (null === (s = v.name) || void 0 === s
                  ? void 0
                  : null === (e = s.value) || void 0 === e
                    ? void 0
                    : e.split(" ")[0]) || "this campaign",
              N =
                (null === (n = v.category) || void 0 === n
                  ? void 0
                  : n.value) || "their goal",
              w = "Help ".concat(j, " with ").concat(N),
              C =
                (null === (a = v.story) || void 0 === a ? void 0 : a.value) ||
                "My name is "
                  .concat(
                    (null === (r = v.name) || void 0 === r
                      ? void 0
                      : r.value) || "[Your Name]",
                    ". ",
                  )
                  .concat(
                    (null === (l = v.age) || void 0 === l ? void 0 : l.value)
                      ? "I am ".concat(v.age.value, " years old and ")
                      : "",
                    "I am reaching out for support with ",
                  )
                  .concat(N, ". \n\nI am located in ")
                  .concat(
                    (null === (o = v.location) || void 0 === o
                      ? void 0
                      : o.value) || "[Your Location]",
                    " and am working towards raising ",
                  )
                  .concat(
                    (
                      null === (i = v.goalAmount) || void 0 === i
                        ? void 0
                        : i.value
                    )
                      ? "$".concat(v.goalAmount.value)
                      : "[Goal Amount]",
                    " to help me get back on my feet.\n\n",
                  )
                  .concat(
                    (null === (d = v.beneficiary) || void 0 === d
                      ? void 0
                      : d.value) === "myself"
                      ? "This fundraiser is for myself."
                      : "This fundraiser is to help ".concat(
                          (null === (m = v.beneficiary) || void 0 === m
                            ? void 0
                            : m.value) || "a loved one",
                          ".",
                        ),
                    "\n\nEvery donation, no matter how small, will make a meaningful difference in my life. Thank you for your support and generosity.",
                  ),
              k = C.slice(0, 150) + "...";
            (c({
              title: w,
              goal:
                (null === (u = v.goalAmount) || void 0 === u
                  ? void 0
                  : u.value) || "5000",
              category:
                (null === (h = v.category) || void 0 === h
                  ? void 0
                  : h.value) || "other",
              location:
                (null === (x = v.location) || void 0 === x
                  ? void 0
                  : x.value) || "",
              beneficiary:
                (null === (p = v.beneficiary) || void 0 === p
                  ? void 0
                  : p.value) || "myself",
              story: C,
              summary: k,
            }),
              (t.gofundmeDraft = {
                title: w,
                goal:
                  (null === (g = v.goalAmount) || void 0 === g
                    ? void 0
                    : g.value) || "5000",
                category:
                  (null === (b = v.category) || void 0 === b
                    ? void 0
                    : b.value) || "other",
                location:
                  (null === (f = v.location) || void 0 === f
                    ? void 0
                    : f.value) || "",
                beneficiary:
                  (null === (y = v.beneficiary) || void 0 === y
                    ? void 0
                    : y.value) || "myself",
                story: C,
                summary: k,
              }));
          },
          N = async (e, t) => {
            try {
              (await navigator.clipboard.writeText(t),
                x(e),
                setTimeout(() => x(null), 2e3));
            } catch (e) {
              console.error("[GoFundMeDraftStep] Error copying:", e);
            }
          },
          w = (e, s) => {
            (c((t) => ({ ...t, [e]: s })),
              t.gofundmeDraft && (t.gofundmeDraft[e] = s));
          },
          C = async () => {
            v(!0);
            try {
              let e = await fetch("/api/export/word/".concat(i), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(d),
              });
              if (e.ok) {
                let t = await e.blob(),
                  s = window.URL.createObjectURL(t),
                  n = document.createElement("a");
                ((n.href = s),
                  (n.download = "gofundme-draft-".concat(i, ".docx")),
                  document.body.appendChild(n),
                  n.click(),
                  window.URL.revokeObjectURL(s),
                  document.body.removeChild(n));
              } else console.error("[GoFundMeDraftStep] Word export failed");
            } catch (e) {
              console.error(
                "[GoFundMeDraftStep] Error downloading Word doc:",
                e,
              );
            } finally {
              v(!1);
            }
          },
          k = function (e, t) {
            let s =
                arguments.length > 2 && void 0 !== arguments[2] && arguments[2],
              a =
                arguments.length > 3 && void 0 !== arguments[3]
                  ? arguments[3]
                  : "",
              r = d[t],
              o = h === t,
              i = p === t;
            return (0, n.jsxs)("div", {
              className: "bg-white border border-gray-300 rounded-lg p-4",
              children: [
                (0, n.jsxs)("div", {
                  className: "flex items-center justify-between mb-3",
                  children: [
                    (0, n.jsx)("label", {
                      className: "text-sm font-semibold text-gray-900",
                      children: e,
                    }),
                    (0, n.jsxs)("div", {
                      className: "flex space-x-2",
                      children: [
                        (0, n.jsxs)("button", {
                          onClick: () => g(i ? null : t),
                          className:
                            "text-blue-600 hover:text-blue-700 text-sm flex items-center",
                          title: "Edit",
                          children: [
                            (0, n.jsx)(b.Z, { className: "w-4 h-4 mr-1" }),
                            i ? "Done" : "Edit",
                          ],
                        }),
                        (0, n.jsx)("button", {
                          onClick: () => N(t, r),
                          className:
                            "text-green-600 hover:text-green-700 text-sm flex items-center",
                          title: "Copy",
                          children: o
                            ? (0, n.jsxs)(n.Fragment, {
                                children: [
                                  (0, n.jsx)(l.Z, {
                                    className: "w-4 h-4 mr-1",
                                  }),
                                  "Copied!",
                                ],
                              })
                            : (0, n.jsxs)(n.Fragment, {
                                children: [
                                  (0, n.jsx)(m.Z, {
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
                i
                  ? s
                    ? (0, n.jsx)("textarea", {
                        value: r,
                        onChange: (e) => w(t, e.target.value),
                        className:
                          "w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        rows: 10,
                        placeholder: a,
                      })
                    : (0, n.jsx)("input", {
                        type: "text",
                        value: r,
                        onChange: (e) => w(t, e.target.value),
                        className:
                          "w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        placeholder: a,
                      })
                  : (0, n.jsx)("div", {
                      className: "".concat(
                        s ? "whitespace-pre-wrap" : "",
                        " text-gray-700 bg-gray-50 p-3 rounded",
                      ),
                      children:
                        r ||
                        (0, n.jsx)("span", {
                          className: "text-gray-400",
                          children: a,
                        }),
                    }),
              ],
            });
          };
        return (0, n.jsxs)("div", {
          className: "space-y-6",
          children: [
            (0, n.jsxs)("div", {
              children: [
                (0, n.jsx)("h2", {
                  className: "text-xl font-semibold text-gray-900 mb-2",
                  children: "Prepare GoFundMe Draft",
                }),
                (0, n.jsx)("p", {
                  className: "text-gray-600",
                  children:
                    "Review and edit the auto-generated content below. You can copy each field directly into GoFundMe's website.",
                }),
              ],
            }),
            (0, n.jsx)("div", {
              className: "bg-blue-50 border border-blue-200 rounded-lg p-4",
              children: (0, n.jsxs)("div", {
                className: "flex items-start",
                children: [
                  (0, n.jsx)(b.Z, {
                    className:
                      "w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5",
                  }),
                  (0, n.jsxs)("div", {
                    className: "text-sm text-blue-800",
                    children: [
                      (0, n.jsx)("p", {
                        className: "font-medium mb-1",
                        children: "You can edit anything!",
                      }),
                      (0, n.jsx)("p", {
                        children:
                          'Click the "Edit" button next to any field to customize the text. Changes are saved automatically.',
                      }),
                    ],
                  }),
                ],
              }),
            }),
            (0, n.jsxs)("div", {
              className: "space-y-4",
              children: [
                k("Campaign Title", "title", !1, "Help [Name] with [Category]"),
                k("Fundraising Goal ($)", "goal", !1, "5000"),
                k(
                  "Category",
                  "category",
                  !1,
                  "medical, housing, emergency, etc.",
                ),
                k("Location", "location", !1, "City, State"),
                k("Beneficiary", "beneficiary", !1, "myself or someone else"),
                k(
                  "Short Summary (150 chars)",
                  "summary",
                  !0,
                  "Brief description for preview...",
                ),
                k("Full Story", "story", !0, "Tell your story in detail..."),
              ],
            }),
            (0, n.jsxs)("div", {
              className: "bg-gray-50 border border-gray-300 rounded-lg p-6",
              children: [
                (0, n.jsx)("h3", {
                  className: "text-sm font-semibold text-gray-900 mb-3",
                  children: "Suggested Cover Media Checklist (Optional)",
                }),
                (0, n.jsx)("p", {
                  className: "text-sm text-gray-600 mb-4",
                  children:
                    "GoFundMe campaigns with photos or videos receive more donations. Consider adding:",
                }),
                (0, n.jsxs)("ul", {
                  className: "space-y-2 text-sm text-gray-700",
                  children: [
                    (0, n.jsxs)("li", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("span", {
                          className: "mr-2",
                          children: "•",
                        }),
                        (0, n.jsx)("span", {
                          children:
                            "A clear photo of yourself or the beneficiary",
                        }),
                      ],
                    }),
                    (0, n.jsxs)("li", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("span", {
                          className: "mr-2",
                          children: "•",
                        }),
                        (0, n.jsx)("span", {
                          children: "Photos showing the situation or need",
                        }),
                      ],
                    }),
                    (0, n.jsxs)("li", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("span", {
                          className: "mr-2",
                          children: "•",
                        }),
                        (0, n.jsx)("span", {
                          children:
                            "A short video (30-60 seconds) telling your story",
                        }),
                      ],
                    }),
                    (0, n.jsxs)("li", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("span", {
                          className: "mr-2",
                          children: "•",
                        }),
                        (0, n.jsx)("span", {
                          children: "Documents or receipts (if relevant)",
                        }),
                      ],
                    }),
                  ],
                }),
                (0, n.jsx)("p", {
                  className: "text-xs text-gray-500 mt-4",
                  children:
                    "Note: CareConnect does not generate photos or videos. You'll need to upload these directly to GoFundMe.",
                }),
              ],
            }),
            (0, n.jsx)("div", {
              className:
                "bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6",
              children: (0, n.jsxs)("div", {
                className: "flex items-center justify-between",
                children: [
                  (0, n.jsxs)("div", {
                    className: "flex items-start",
                    children: [
                      (0, n.jsx)(f.Z, {
                        className: "w-6 h-6 text-green-600 mr-3 flex-shrink-0",
                      }),
                      (0, n.jsxs)("div", {
                        children: [
                          (0, n.jsx)("h3", {
                            className:
                              "text-sm font-semibold text-gray-900 mb-1",
                            children: "Download as Word Document (.docx)",
                          }),
                          (0, n.jsx)("p", {
                            className: "text-sm text-gray-600",
                            children:
                              "Get a professionally formatted document with all your campaign details that you can print or edit offline.",
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, n.jsx)("button", {
                    onClick: C,
                    disabled: y,
                    className:
                      "ml-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
                    children: y
                      ? (0, n.jsxs)(n.Fragment, {
                          children: [
                            (0, n.jsx)("div", {
                              className:
                                "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2",
                            }),
                            "Downloading...",
                          ],
                        })
                      : (0, n.jsxs)(n.Fragment, {
                          children: [
                            (0, n.jsx)(u.Z, { className: "w-4 h-4 mr-2" }),
                            "Download .docx",
                          ],
                        }),
                  }),
                ],
              }),
            }),
            (0, n.jsx)("div", {
              className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4",
              children: (0, n.jsx)("div", {
                className: "flex items-start",
                children: (0, n.jsxs)("div", {
                  className: "text-sm text-yellow-800",
                  children: [
                    (0, n.jsx)("p", {
                      className: "font-semibold mb-2",
                      children:
                        "⚠️ Important: CareConnect Does NOT Publish to GoFundMe",
                    }),
                    (0, n.jsxs)("p", {
                      children: [
                        "This is a ",
                        (0, n.jsx)("strong", { children: "draft only" }),
                        ". You must manually create your GoFundMe campaign by visiting",
                        (0, n.jsx)("a", {
                          href: "https://www.gofundme.com/c/start",
                          target: "_blank",
                          rel: "noopener noreferrer",
                          className: "text-yellow-900 underline ml-1",
                          children: "gofundme.com/c/start",
                        }),
                        " and copying these fields into their form.",
                      ],
                    }),
                    (0, n.jsx)("p", {
                      className: "mt-2",
                      children:
                        "The next step will guide you through the GoFundMe creation process step-by-step.",
                    }),
                  ],
                }),
              }),
            }),
            (0, n.jsxs)("div", {
              className: "flex items-center justify-between pt-6 border-t",
              children: [
                (0, n.jsx)("button", {
                  type: "button",
                  onClick: o,
                  className:
                    "text-blue-600 hover:text-blue-700 text-sm font-medium",
                  children: "Need help?",
                }),
                (0, n.jsxs)("div", {
                  className: "flex space-x-3",
                  children: [
                    (0, n.jsx)("button", {
                      type: "button",
                      onClick: r,
                      className:
                        "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium",
                      children: "Back",
                    }),
                    (0, n.jsxs)("button", {
                      onClick: () => {
                        s({ gofundmeDraft: d });
                      },
                      className:
                        "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center",
                      children: [
                        "Next: GoFundMe Wizard",
                        (0, n.jsx)(l.Z, { className: "w-4 h-4 ml-2" }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
      var v = s(11654),
        j = s(70383),
        N = s(33963);
      function w(e) {
        var t, s, r, o, i, d;
        let { data: c, onComplete: u, onBack: h, onHelp: p } = e,
          [g, b] = (0, a.useState)(1),
          [f, y] = (0, a.useState)(new Set()),
          [w, C] = (0, a.useState)(null),
          k = [
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
                  value:
                    (null === (t = c.gofundmeDraft) || void 0 === t
                      ? void 0
                      : t.beneficiary) || "myself",
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
                  value:
                    (null === (s = c.gofundmeDraft) || void 0 === s
                      ? void 0
                      : s.category) || "other",
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
                  value: "$".concat(
                    (null === (r = c.gofundmeDraft) || void 0 === r
                      ? void 0
                      : r.goal) || "5000",
                  ),
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
                {
                  label: "Location",
                  value:
                    (null === (o = c.gofundmeDraft) || void 0 === o
                      ? void 0
                      : o.location) || "",
                },
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
                  value:
                    (null === (i = c.gofundmeDraft) || void 0 === i
                      ? void 0
                      : i.title) || "",
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
                {
                  label: "Full Story",
                  value:
                    (null === (d = c.gofundmeDraft) || void 0 === d
                      ? void 0
                      : d.story) || "",
                },
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
                { label: "Donation Page URL", value: c.donationPageUrl || "" },
              ],
              troubleshooting: [
                "Share multiple times—not everyone sees your first post",
                "Personalize your sharing messages",
                "Post updates at least weekly",
                "Use your CareConnect QR code for in-person sharing",
              ],
            },
          ],
          F = (e) => {
            b(g === e ? 0 : e);
          },
          S = (e) => {
            y((t) => {
              let s = new Set(t);
              return (s.has(e) ? s.delete(e) : s.add(e), s);
            });
          },
          D = async (e, t) => {
            try {
              (await navigator.clipboard.writeText(e),
                C(t),
                setTimeout(() => C(null), 2e3));
            } catch (e) {
              console.error("[GoFundMeWizard] Error copying:", e);
            }
          },
          P = (e) => {
            let t = g === e.id,
              s = f.has(e.id);
            return (0, n.jsxs)(
              "div",
              {
                className: "border border-gray-300 rounded-lg overflow-hidden",
                children: [
                  (0, n.jsxs)("button", {
                    onClick: () => F(e.id),
                    className:
                      "\n            w-full flex items-center justify-between p-4 text-left transition-colors\n            ".concat(
                        s
                          ? "bg-green-50 hover:bg-green-100"
                          : "bg-white hover:bg-gray-50",
                        "\n          ",
                      ),
                    children: [
                      (0, n.jsxs)("div", {
                        className: "flex items-center flex-1",
                        children: [
                          (0, n.jsx)("span", {
                            className:
                              "\n              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3\n              ".concat(
                                s
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-700",
                                "\n            ",
                              ),
                            children: s
                              ? (0, n.jsx)(l.Z, { className: "w-5 h-5" })
                              : e.id,
                          }),
                          (0, n.jsxs)("div", {
                            children: [
                              (0, n.jsx)("h3", {
                                className:
                                  "text-sm font-semibold text-gray-900",
                                children: e.title,
                              }),
                              (0, n.jsx)("p", {
                                className: "text-xs text-gray-600 mt-1",
                                children: e.description,
                              }),
                            ],
                          }),
                        ],
                      }),
                      t
                        ? (0, n.jsx)(v.Z, {
                            className: "w-5 h-5 text-gray-500 flex-shrink-0",
                          })
                        : (0, n.jsx)(j.Z, {
                            className: "w-5 h-5 text-gray-500 flex-shrink-0",
                          }),
                    ],
                  }),
                  t &&
                    (0, n.jsx)("div", {
                      className: "p-6 bg-gray-50 border-t border-gray-200",
                      children: (0, n.jsxs)("div", {
                        className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
                        children: [
                          (0, n.jsx)("div", {
                            className:
                              "bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-center",
                            children: e.screenshot
                              ? (0, n.jsx)("img", {
                                  src: e.screenshot,
                                  alt: "Screenshot: ".concat(e.title),
                                  className: "max-w-full h-auto rounded",
                                  onError: (e) => {
                                    ((e.currentTarget.style.display = "none"),
                                      (e.currentTarget.parentElement.innerHTML =
                                        '\n                        <div class="text-center text-gray-400 py-12">\n                          <div class="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">\n                            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>\n                          </div>\n                          <p class="text-sm">Screenshot placeholder</p>\n                        </div>\n                      '));
                                  },
                                })
                              : (0, n.jsxs)("div", {
                                  className: "text-center text-gray-400 py-12",
                                  children: [
                                    (0, n.jsx)(N.Z, {
                                      className: "w-16 h-16 mx-auto mb-4",
                                    }),
                                    (0, n.jsx)("p", {
                                      className: "text-sm",
                                      children: "Screenshot placeholder",
                                    }),
                                  ],
                                }),
                          }),
                          (0, n.jsxs)("div", {
                            className: "space-y-4",
                            children: [
                              (0, n.jsxs)("div", {
                                children: [
                                  (0, n.jsx)("h4", {
                                    className:
                                      "text-sm font-semibold text-gray-900 mb-2",
                                    children: "What to do:",
                                  }),
                                  (0, n.jsx)("ul", {
                                    className: "space-y-2",
                                    children: e.instructions.map((e, t) =>
                                      (0, n.jsxs)(
                                        "li",
                                        {
                                          className:
                                            "flex items-start text-sm text-gray-700",
                                          children: [
                                            (0, n.jsxs)("span", {
                                              className:
                                                "mr-2 text-blue-600 font-bold",
                                              children: [t + 1, "."],
                                            }),
                                            (0, n.jsx)("span", { children: e }),
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
                                (0, n.jsxs)("div", {
                                  className:
                                    "bg-blue-50 border border-blue-200 rounded-lg p-4",
                                  children: [
                                    (0, n.jsx)("h4", {
                                      className:
                                        "text-sm font-semibold text-gray-900 mb-3",
                                      children: "Copy from CareConnect:",
                                    }),
                                    (0, n.jsx)("div", {
                                      className: "space-y-2",
                                      children: e.copyFields.map((e, t) =>
                                        (0, n.jsxs)(
                                          "div",
                                          {
                                            className: "bg-white rounded p-2",
                                            children: [
                                              (0, n.jsxs)("div", {
                                                className:
                                                  "flex items-center justify-between mb-1",
                                                children: [
                                                  (0, n.jsx)("span", {
                                                    className:
                                                      "text-xs font-medium text-gray-600",
                                                    children: e.label,
                                                  }),
                                                  (0, n.jsx)("button", {
                                                    onClick: () =>
                                                      D(e.value, e.label),
                                                    className:
                                                      "text-blue-600 hover:text-blue-700 text-xs flex items-center",
                                                    children:
                                                      w === e.label
                                                        ? (0, n.jsxs)(
                                                            n.Fragment,
                                                            {
                                                              children: [
                                                                (0, n.jsx)(
                                                                  l.Z,
                                                                  {
                                                                    className:
                                                                      "w-3 h-3 mr-1",
                                                                  },
                                                                ),
                                                                "Copied!",
                                                              ],
                                                            },
                                                          )
                                                        : (0, n.jsxs)(
                                                            n.Fragment,
                                                            {
                                                              children: [
                                                                (0, n.jsx)(
                                                                  m.Z,
                                                                  {
                                                                    className:
                                                                      "w-3 h-3 mr-1",
                                                                  },
                                                                ),
                                                                "Copy",
                                                              ],
                                                            },
                                                          ),
                                                  }),
                                                ],
                                              }),
                                              (0, n.jsx)("div", {
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
                                (0, n.jsxs)("div", {
                                  className:
                                    "bg-yellow-50 border border-yellow-200 rounded-lg p-4",
                                  children: [
                                    (0, n.jsx)("h4", {
                                      className:
                                        "text-sm font-semibold text-gray-900 mb-2",
                                      children: "Common problems:",
                                    }),
                                    (0, n.jsx)("ul", {
                                      className: "space-y-1",
                                      children: e.troubleshooting.map((e, t) =>
                                        (0, n.jsxs)(
                                          "li",
                                          {
                                            className:
                                              "flex items-start text-xs text-gray-700",
                                            children: [
                                              (0, n.jsx)("span", {
                                                className: "mr-2",
                                                children: "•",
                                              }),
                                              (0, n.jsx)("span", {
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
                              (0, n.jsx)("button", {
                                onClick: () => S(e.id),
                                className:
                                  "\n                    w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors\n                    ".concat(
                                    s
                                      ? "bg-green-600 text-white hover:bg-green-700"
                                      : "bg-gray-200 text-gray-700 hover:bg-gray-300",
                                    "\n                  ",
                                  ),
                                children: s
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
          G = f.size,
          M = k.length,
          R = Math.round((G / M) * 100);
        return (0, n.jsxs)("div", {
          className: "space-y-6",
          children: [
            (0, n.jsxs)("div", {
              children: [
                (0, n.jsx)("h2", {
                  className: "text-xl font-semibold text-gray-900 mb-2",
                  children: "Finalize GoFundMe Manually",
                }),
                (0, n.jsx)("p", {
                  className: "text-gray-600",
                  children:
                    "Follow these step-by-step instructions to create your campaign on GoFundMe's website.",
                }),
              ],
            }),
            (0, n.jsxs)("div", {
              className: "bg-white border border-gray-300 rounded-lg p-4",
              children: [
                (0, n.jsxs)("div", {
                  className: "flex items-center justify-between mb-2",
                  children: [
                    (0, n.jsx)("span", {
                      className: "text-sm font-medium text-gray-700",
                      children: "Progress",
                    }),
                    (0, n.jsxs)("span", {
                      className: "text-sm font-medium text-gray-900",
                      children: [G, " of ", M, " steps"],
                    }),
                  ],
                }),
                (0, n.jsx)("div", {
                  className: "w-full bg-gray-200 rounded-full h-2",
                  children: (0, n.jsx)("div", {
                    className:
                      "bg-green-600 h-2 rounded-full transition-all duration-300",
                    style: { width: "".concat(R, "%") },
                  }),
                }),
              ],
            }),
            (0, n.jsx)("div", {
              className: "bg-blue-50 border border-blue-200 rounded-lg p-4",
              children: (0, n.jsxs)("div", {
                className: "flex items-start",
                children: [
                  (0, n.jsx)(x.Z, {
                    className:
                      "w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5",
                  }),
                  (0, n.jsxs)("div", {
                    className: "flex-1",
                    children: [
                      (0, n.jsx)("h3", {
                        className: "text-sm font-semibold text-blue-900 mb-1",
                        children: "Official GoFundMe Guide",
                      }),
                      (0, n.jsx)("p", {
                        className: "text-sm text-blue-800 mb-3",
                        children:
                          "For the most up-to-date instructions, visit GoFundMe's official documentation:",
                      }),
                      (0, n.jsx)("a", {
                        href: "https://support.gofundme.com/hc/en-us/articles/360001992627-Creating-a-GoFundMe-from-start-to-finish",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className:
                          "text-sm text-blue-600 hover:text-blue-700 underline",
                        children: "Creating a GoFundMe from start to finish →",
                      }),
                    ],
                  }),
                ],
              }),
            }),
            (0, n.jsx)("div", {
              className: "space-y-3",
              children: k.map((e) => P(e)),
            }),
            (0, n.jsxs)("div", {
              className: "flex items-center justify-between pt-6 border-t",
              children: [
                (0, n.jsx)("button", {
                  type: "button",
                  onClick: p,
                  className:
                    "text-blue-600 hover:text-blue-700 text-sm font-medium",
                  children: "Need help?",
                }),
                (0, n.jsxs)("div", {
                  className: "flex space-x-3",
                  children: [
                    (0, n.jsx)("button", {
                      type: "button",
                      onClick: h,
                      className:
                        "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium",
                      children: "Back",
                    }),
                    (0, n.jsxs)("button", {
                      onClick: () => u({}),
                      className:
                        "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center",
                      children: [
                        "Next: Download Print Kit",
                        (0, n.jsx)(l.Z, { className: "w-4 h-4 ml-2" }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
      function C(e) {
        let { data: t, onBack: s, clientId: r } = e,
          [o, i] = (0, a.useState)(null),
          d = () => {
            if (!t.qrCodeUrl) return;
            let e = document.createElement("a");
            ((e.href = t.qrCodeUrl),
              (e.download = "donation-qr-".concat(t.publicSlug || r, ".png")),
              document.body.appendChild(e),
              e.click(),
              document.body.removeChild(e));
          },
          c = async () => {
            i("word");
            try {
              let e = await fetch("/api/export/word/".concat(r), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(t.gofundmeDraft || {}),
              });
              if (e.ok) {
                let t = await e.blob(),
                  s = window.URL.createObjectURL(t),
                  n = document.createElement("a");
                ((n.href = s),
                  (n.download = "gofundme-draft-".concat(r, ".docx")),
                  document.body.appendChild(n),
                  n.click(),
                  window.URL.revokeObjectURL(s),
                  document.body.removeChild(n));
              }
            } catch (e) {
              console.error("[PrintKitStep] Error downloading Word doc:", e);
            } finally {
              i(null);
            }
          },
          m = async () => {
            (i("all"),
              d(),
              await new Promise((e) => setTimeout(e, 500)),
              await c(),
              i(null));
          };
        return (0, n.jsxs)("div", {
          className: "space-y-6",
          children: [
            (0, n.jsxs)("div", {
              children: [
                (0, n.jsx)("h2", {
                  className: "text-xl font-semibold text-gray-900 mb-2",
                  children: "Download Print Kit",
                }),
                (0, n.jsx)("p", {
                  className: "text-gray-600",
                  children:
                    "Get all your fundraising materials in one place. Download, print, and share!",
                }),
              ],
            }),
            (0, n.jsx)("div", {
              className: "bg-green-50 border-2 border-green-300 rounded-lg p-6",
              children: (0, n.jsxs)("div", {
                className: "flex items-start",
                children: [
                  (0, n.jsx)(l.Z, {
                    className: "w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1",
                  }),
                  (0, n.jsxs)("div", {
                    children: [
                      (0, n.jsx)("h3", {
                        className: "text-lg font-semibold text-green-900 mb-2",
                        children:
                          "\uD83C\uDF89 Congratulations! Your funding setup is complete.",
                      }),
                      (0, n.jsx)("p", {
                        className: "text-green-800",
                        children:
                          "You've successfully prepared all the materials needed to launch your fundraising campaign. Download your print kit below and follow the GoFundMe wizard instructions to publish your campaign.",
                      }),
                    ],
                  }),
                ],
              }),
            }),
            (0, n.jsxs)("div", {
              className: "grid grid-cols-1 md:grid-cols-2 gap-6",
              children: [
                (0, n.jsxs)("div", {
                  className:
                    "bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors",
                  children: [
                    (0, n.jsxs)("div", {
                      className: "flex items-center mb-4",
                      children: [
                        (0, n.jsx)(N.Z, {
                          className: "w-8 h-8 text-blue-600 mr-3",
                        }),
                        (0, n.jsxs)("div", {
                          children: [
                            (0, n.jsx)("h3", {
                              className: "text-sm font-semibold text-gray-900",
                              children: "QR Code (PNG)",
                            }),
                            (0, n.jsx)("p", {
                              className: "text-xs text-gray-600",
                              children: "High-resolution donation QR code",
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, n.jsxs)("button", {
                      onClick: d,
                      disabled: !t.qrCodeUrl,
                      className:
                        "w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
                      children: [
                        (0, n.jsx)(u.Z, { className: "w-4 h-4 mr-2" }),
                        "Download PNG",
                      ],
                    }),
                  ],
                }),
                (0, n.jsxs)("div", {
                  className:
                    "bg-white border-2 border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors",
                  children: [
                    (0, n.jsxs)("div", {
                      className: "flex items-center mb-4",
                      children: [
                        (0, n.jsx)(f.Z, {
                          className: "w-8 h-8 text-green-600 mr-3",
                        }),
                        (0, n.jsxs)("div", {
                          children: [
                            (0, n.jsx)("h3", {
                              className: "text-sm font-semibold text-gray-900",
                              children: "Campaign Draft (.docx)",
                            }),
                            (0, n.jsx)("p", {
                              className: "text-xs text-gray-600",
                              children: "Formatted GoFundMe document",
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, n.jsx)("button", {
                      onClick: c,
                      disabled: "word" === o,
                      className:
                        "w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
                      children:
                        "word" === o
                          ? (0, n.jsxs)(n.Fragment, {
                              children: [
                                (0, n.jsx)("div", {
                                  className:
                                    "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2",
                                }),
                                "Downloading...",
                              ],
                            })
                          : (0, n.jsxs)(n.Fragment, {
                              children: [
                                (0, n.jsx)(u.Z, { className: "w-4 h-4 mr-2" }),
                                "Download .docx",
                              ],
                            }),
                    }),
                  ],
                }),
              ],
            }),
            (0, n.jsx)("div", {
              className:
                "bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6",
              children: (0, n.jsxs)("div", {
                className: "flex items-center justify-between",
                children: [
                  (0, n.jsxs)("div", {
                    className: "flex items-start flex-1",
                    children: [
                      (0, n.jsx)(h.Z, {
                        className:
                          "w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-1",
                      }),
                      (0, n.jsxs)("div", {
                        children: [
                          (0, n.jsx)("h3", {
                            className:
                              "text-sm font-semibold text-gray-900 mb-1",
                            children: "One-Page Print Summary",
                          }),
                          (0, n.jsx)("p", {
                            className: "text-sm text-gray-600",
                            children:
                              "Print-optimized page with all your campaign details, QR code, and next steps checklist. Perfect for keeping on hand or sharing with support coordinators.",
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, n.jsxs)("button", {
                    onClick: () => {
                      let e = window.open("", "_blank");
                      if (!e) return;
                      let s = t.gofundmeDraft || {};
                      (e.document.write(
                        "\n      <!DOCTYPE html>\n      <html>\n        <head>\n          <title>Fundraising Campaign Summary - "
                          .concat(
                            t.fullName || "CareConnect",
                            '</title>\n          <style>\n            @page {\n              margin: 1in;\n              size: letter;\n            }\n            body {\n              font-family: Arial, sans-serif;\n              line-height: 1.6;\n              color: #333;\n              padding: 20px;\n              max-width: 800px;\n              margin: 0 auto;\n            }\n            h1 {\n              font-size: 24px;\n              margin-bottom: 10px;\n              color: #1a1a1a;\n              border-bottom: 3px solid #2563eb;\n              padding-bottom: 10px;\n            }\n            h2 {\n              font-size: 18px;\n              margin-top: 30px;\n              margin-bottom: 10px;\n              color: #2563eb;\n            }\n            .section {\n              margin-bottom: 25px;\n              page-break-inside: avoid;\n            }\n            .field-label {\n              font-weight: bold;\n              color: #666;\n              font-size: 12px;\n              text-transform: uppercase;\n              margin-bottom: 5px;\n            }\n            .field-value {\n              background: #f5f5f5;\n              padding: 10px;\n              border-radius: 5px;\n              margin-bottom: 15px;\n              border-left: 3px solid #2563eb;\n            }\n            .qr-section {\n              text-align: center;\n              margin: 30px 0;\n              padding: 20px;\n              border: 2px dashed #ccc;\n              page-break-inside: avoid;\n            }\n            .qr-section img {\n              max-width: 300px;\n              margin: 15px auto;\n            }\n            .url {\n              font-size: 12px;\n              word-break: break-all;\n              background: #f0f0f0;\n              padding: 10px;\n              border-radius: 5px;\n              margin-top: 10px;\n            }\n            .footer {\n              margin-top: 50px;\n              padding-top: 20px;\n              border-top: 1px solid #ccc;\n              font-size: 10px;\n              color: #999;\n              text-align: center;\n            }\n            .checklist {\n              list-style: none;\n              padding-left: 0;\n            }\n            .checklist li {\n              padding: 5px 0;\n              padding-left: 25px;\n              position: relative;\n            }\n            .checklist li:before {\n              content: "☐";\n              position: absolute;\n              left: 0;\n              font-size: 18px;\n            }\n            @media print {\n              .no-print {\n                display: none;\n              }\n            }\n          </style>\n        </head>\n        <body>\n          <h1>Fundraising Campaign Summary</h1>\n          \n          <div class="section">\n            <h2>Personal Information</h2>\n            <div class="field-label">Full Name</div>\n            <div class="field-value">',
                          )
                          .concat(
                            t.fullName || "Not provided",
                            '</div>\n            \n            <div class="field-label">ZIP Code</div>\n            <div class="field-value">',
                          )
                          .concat(
                            t.zipCode || "Not provided",
                            '</div>\n            \n            <div class="field-label">Email</div>\n            <div class="field-value">',
                          )
                          .concat(
                            t.email || "Not provided",
                            '</div>\n          </div>\n\n          <div class="section">\n            <h2>Campaign Details</h2>\n            <div class="field-label">Campaign Title</div>\n            <div class="field-value">',
                          )
                          .concat(
                            s.title || "Not provided",
                            '</div>\n            \n            <div class="field-label">Fundraising Goal</div>\n            <div class="field-value">$',
                          )
                          .concat(
                            s.goal || "5000",
                            '</div>\n            \n            <div class="field-label">Category</div>\n            <div class="field-value">',
                          )
                          .concat(
                            s.category || "Not provided",
                            '</div>\n            \n            <div class="field-label">Location</div>\n            <div class="field-value">',
                          )
                          .concat(
                            s.location || "Not provided",
                            '</div>\n            \n            <div class="field-label">Beneficiary</div>\n            <div class="field-value">',
                          )
                          .concat(
                            s.beneficiary || "Not provided",
                            '</div>\n          </div>\n\n          <div class="section">\n            <h2>Campaign Story</h2>\n            <div class="field-value" style="white-space: pre-wrap;">',
                          )
                          .concat(
                            s.story || "Not provided",
                            "</div>\n          </div>\n\n          ",
                          )
                          .concat(
                            t.qrCodeUrl
                              ? '\n            <div class="qr-section">\n              <h2>Donation QR Code</h2>\n              <p>Scan this code to donate</p>\n              <img src="'
                                  .concat(
                                    t.qrCodeUrl,
                                    '" alt="Donation QR Code" />\n              <div class="url">',
                                  )
                                  .concat(
                                    t.donationPageUrl || "",
                                    "</div>\n            </div>\n          ",
                                  )
                              : "",
                            '\n\n          <div class="section">\n            <h2>Next Steps Checklist</h2>\n            <ul class="checklist">\n              <li>Create GoFundMe account at gofundme.com/c/start</li>\n              <li>Enter campaign details from this document</li>\n              <li>Upload cover photo or video</li>\n              <li>Review and publish campaign</li>\n              <li>Connect bank account for withdrawals</li>\n              <li>Share campaign using QR code and social media</li>\n              <li>Post regular updates to engage donors</li>\n            </ul>\n          </div>\n\n          <div class="footer">\n            <p>Generated by CareConnect on ',
                          )
                          .concat(
                            new Date().toLocaleDateString(),
                            '</p>\n            <p>For support, contact: workflown8n@gmail.com</p>\n          </div>\n\n          <div class="no-print" style="margin-top: 30px; text-align: center;">\n            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">\n              Print This Page\n            </button>\n          </div>\n        </body>\n      </html>\n    ',
                          ),
                      ),
                        e.document.close(),
                        e.focus(),
                        setTimeout(() => {
                          e.print();
                        }, 250));
                    },
                    className:
                      "ml-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center whitespace-nowrap",
                    children: [
                      (0, n.jsx)(h.Z, { className: "w-4 h-4 mr-2" }),
                      "Print Summary",
                    ],
                  }),
                ],
              }),
            }),
            (0, n.jsx)("div", {
              className: "bg-gray-50 border border-gray-300 rounded-lg p-6",
              children: (0, n.jsxs)("div", {
                className: "text-center",
                children: [
                  (0, n.jsx)("h3", {
                    className: "text-lg font-semibold text-gray-900 mb-2",
                    children: "Download Everything",
                  }),
                  (0, n.jsx)("p", {
                    className: "text-sm text-gray-600 mb-4",
                    children:
                      "Get all files at once (QR code PNG + Word document)",
                  }),
                  (0, n.jsx)("button", {
                    onClick: m,
                    disabled: "all" === o,
                    className:
                      "px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium text-lg flex items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed",
                    children:
                      "all" === o
                        ? (0, n.jsxs)(n.Fragment, {
                            children: [
                              (0, n.jsx)("div", {
                                className:
                                  "animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2",
                              }),
                              "Downloading...",
                            ],
                          })
                        : (0, n.jsxs)(n.Fragment, {
                            children: [
                              (0, n.jsx)(u.Z, { className: "w-5 h-5 mr-2" }),
                              "Download All Files",
                            ],
                          }),
                  }),
                ],
              }),
            }),
            (0, n.jsxs)("div", {
              className: "bg-blue-50 border border-blue-200 rounded-lg p-6",
              children: [
                (0, n.jsx)("h3", {
                  className: "text-sm font-semibold text-blue-900 mb-3",
                  children: "\uD83D\uDCE6 What's Included in Your Print Kit",
                }),
                (0, n.jsxs)("div", {
                  className: "space-y-2 text-sm text-blue-800",
                  children: [
                    (0, n.jsxs)("div", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("span", {
                          className: "mr-2",
                          children: "✓",
                        }),
                        (0, n.jsxs)("span", {
                          children: [
                            (0, n.jsx)("strong", { children: "QR Code PNG:" }),
                            " High-resolution image for printing on flyers, posters, or business cards",
                          ],
                        }),
                      ],
                    }),
                    (0, n.jsxs)("div", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("span", {
                          className: "mr-2",
                          children: "✓",
                        }),
                        (0, n.jsxs)("span", {
                          children: [
                            (0, n.jsx)("strong", {
                              children: "Campaign Draft (Word):",
                            }),
                            " Formatted document with title, story, goal, and all details",
                          ],
                        }),
                      ],
                    }),
                    (0, n.jsxs)("div", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("span", {
                          className: "mr-2",
                          children: "✓",
                        }),
                        (0, n.jsxs)("span", {
                          children: [
                            (0, n.jsx)("strong", {
                              children: "Donation Page URL:",
                            }),
                            " Direct link to your CareConnect donation page",
                          ],
                        }),
                      ],
                    }),
                    (0, n.jsxs)("div", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("span", {
                          className: "mr-2",
                          children: "✓",
                        }),
                        (0, n.jsxs)("span", {
                          children: [
                            (0, n.jsx)("strong", {
                              children: "Print Summary:",
                            }),
                            " One-page overview with QR code and checklist",
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            (0, n.jsxs)("div", {
              className: "bg-yellow-50 border border-yellow-200 rounded-lg p-6",
              children: [
                (0, n.jsx)("h3", {
                  className: "text-sm font-semibold text-yellow-900 mb-3",
                  children: "\uD83D\uDE80 Next Steps",
                }),
                (0, n.jsxs)("ol", {
                  className: "space-y-2 text-sm text-yellow-800",
                  children: [
                    (0, n.jsxs)("li", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("span", {
                          className: "mr-2 font-bold",
                          children: "1.",
                        }),
                        (0, n.jsxs)("span", {
                          children: [
                            "Visit ",
                            (0, n.jsx)("a", {
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
                    (0, n.jsxs)("li", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("span", {
                          className: "mr-2 font-bold",
                          children: "2.",
                        }),
                        (0, n.jsx)("span", {
                          children:
                            "Upload photos or videos to your GoFundMe campaign",
                        }),
                      ],
                    }),
                    (0, n.jsxs)("li", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("span", {
                          className: "mr-2 font-bold",
                          children: "3.",
                        }),
                        (0, n.jsx)("span", {
                          children:
                            "Publish your GoFundMe and connect your bank account",
                        }),
                      ],
                    }),
                    (0, n.jsxs)("li", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("span", {
                          className: "mr-2 font-bold",
                          children: "4.",
                        }),
                        (0, n.jsx)("span", {
                          children:
                            "Share your CareConnect QR code and donation link everywhere!",
                        }),
                      ],
                    }),
                    (0, n.jsxs)("li", {
                      className: "flex items-start",
                      children: [
                        (0, n.jsx)("span", {
                          className: "mr-2 font-bold",
                          children: "5.",
                        }),
                        (0, n.jsx)("span", {
                          children:
                            "Post regular updates to keep donors engaged",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            (0, n.jsxs)("div", {
              className: "flex items-center justify-between pt-6 border-t",
              children: [
                (0, n.jsx)("button", {
                  type: "button",
                  onClick: s,
                  className:
                    "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium",
                  children: "Back",
                }),
                (0, n.jsx)("button", {
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
      var k = s(83633),
        F = s(5032);
      let S = [
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
        D = {
          confirm_details: "Help with Confirming Details",
          qr_code: "Help with QR Code Generation",
          gofundme_draft: "Help with GoFundMe Draft",
          gofundme_wizard: "Help with GoFundMe Setup",
          general: "Get Help",
        };
      function P(e) {
        let { context: t, onClose: s, clientId: r } = e,
          [o, d] = (0, a.useState)({
            issueType: "gofundme_wizard" === t ? "gofundme_blocked" : "other",
            description: "",
            contactEmail: "",
            contactPhone: "",
          }),
          [c, m] = (0, a.useState)(!1),
          [u, h] = (0, a.useState)("idle"),
          x = (e, t) => {
            d((s) => ({ ...s, [e]: t }));
          },
          p = async (e) => {
            if ((e.preventDefault(), o.description.trim())) {
              (m(!0), h("idle"));
              try {
                let e = await fetch("/api/support/tickets", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...o, context: t, clientId: r }),
                });
                (await e.json(), e.ok ? h("success") : h("error"));
              } catch (e) {
                (console.error("[HelpModal] Error submitting ticket:", e),
                  h("error"));
              } finally {
                m(!1);
              }
            }
          };
        return (0, n.jsx)("div", {
          className:
            "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
          children: (0, n.jsxs)("div", {
            className:
              "bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",
            children: [
              (0, n.jsxs)("div", {
                className:
                  "sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between",
                children: [
                  (0, n.jsx)("h2", {
                    className: "text-lg font-semibold text-gray-900",
                    children: D[t] || "Get Help",
                  }),
                  (0, n.jsx)("button", {
                    onClick: s,
                    className:
                      "text-gray-400 hover:text-gray-600 transition-colors",
                    disabled: c,
                    children: (0, n.jsx)(F.Z, { className: "w-6 h-6" }),
                  }),
                ],
              }),
              (0, n.jsx)("div", {
                className: "px-6 py-6",
                children:
                  "success" === u
                    ? (0, n.jsxs)("div", {
                        className: "text-center py-8",
                        children: [
                          (0, n.jsx)(l.Z, {
                            className: "w-16 h-16 text-green-600 mx-auto mb-4",
                          }),
                          (0, n.jsx)("h3", {
                            className:
                              "text-xl font-semibold text-gray-900 mb-2",
                            children: "Message Received!",
                          }),
                          (0, n.jsx)("p", {
                            className: "text-gray-600 mb-6",
                            children:
                              "Thank you for reaching out. We've received your support request and will respond as soon as possible.",
                          }),
                          (0, n.jsxs)("p", {
                            className: "text-sm text-gray-500 mb-4",
                            children: [
                              "You should receive a confirmation email at ",
                              (0, n.jsx)("strong", {
                                children: "workflown8n@gmail.com",
                              }),
                            ],
                          }),
                          (0, n.jsx)("button", {
                            onClick: s,
                            className:
                              "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium",
                            children: "Close",
                          }),
                        ],
                      })
                    : "fallback" === u
                      ? null
                      : "error" === u
                        ? (0, n.jsxs)("div", {
                            className: "text-center py-8",
                            children: [
                              (0, n.jsx)(i.Z, {
                                className:
                                  "w-16 h-16 text-red-600 mx-auto mb-4",
                              }),
                              (0, n.jsx)("h3", {
                                className:
                                  "text-xl font-semibold text-gray-900 mb-2",
                                children: "Submission Error",
                              }),
                              (0, n.jsx)("p", {
                                className: "text-gray-600 mb-6",
                                children:
                                  "We encountered an error submitting your support request. Please try again or visit the admin health page to view support logs.",
                              }),
                              (0, n.jsxs)("div", {
                                className: "space-y-3",
                                children: [
                                  (0, n.jsx)("p", {
                                    className: "text-sm text-gray-700",
                                    children:
                                      "Visit the admin health page to view support logs.",
                                  }),
                                  (0, n.jsx)("button", {
                                    onClick: () => h("idle"),
                                    className:
                                      "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium",
                                    children: "Try Again",
                                  }),
                                ],
                              }),
                            ],
                          })
                        : (0, n.jsxs)("form", {
                            onSubmit: p,
                            className: "space-y-4",
                            children: [
                              (0, n.jsxs)("div", {
                                children: [
                                  (0, n.jsxs)("label", {
                                    className:
                                      "block text-sm font-medium text-gray-700 mb-1",
                                    children: [
                                      "What do you need help with? ",
                                      (0, n.jsx)("span", {
                                        className: "text-red-500",
                                        children: "*",
                                      }),
                                    ],
                                  }),
                                  (0, n.jsx)("select", {
                                    value: o.issueType,
                                    onChange: (e) =>
                                      x("issueType", e.target.value),
                                    className:
                                      "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                    required: !0,
                                    children: S.map((e) =>
                                      (0, n.jsx)(
                                        "option",
                                        { value: e.value, children: e.label },
                                        e.value,
                                      ),
                                    ),
                                  }),
                                ],
                              }),
                              (0, n.jsxs)("div", {
                                children: [
                                  (0, n.jsxs)("label", {
                                    className:
                                      "block text-sm font-medium text-gray-700 mb-1",
                                    children: [
                                      "Please describe your issue ",
                                      (0, n.jsx)("span", {
                                        className: "text-red-500",
                                        children: "*",
                                      }),
                                    ],
                                  }),
                                  (0, n.jsx)("textarea", {
                                    value: o.description,
                                    onChange: (e) =>
                                      x("description", e.target.value),
                                    className:
                                      "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                    rows: 6,
                                    placeholder:
                                      "Tell us what's happening and we'll do our best to help...",
                                    required: !0,
                                  }),
                                  (0, n.jsx)("p", {
                                    className: "mt-1 text-xs text-gray-500",
                                    children:
                                      "Be as specific as possible so we can assist you quickly",
                                  }),
                                ],
                              }),
                              (0, n.jsxs)("div", {
                                children: [
                                  (0, n.jsx)("label", {
                                    className:
                                      "block text-sm font-medium text-gray-700 mb-1",
                                    children: "Contact Email (Optional)",
                                  }),
                                  (0, n.jsx)("input", {
                                    type: "email",
                                    value: o.contactEmail,
                                    onChange: (e) =>
                                      x("contactEmail", e.target.value),
                                    className:
                                      "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                    placeholder: "your.email@example.com",
                                  }),
                                  (0, n.jsx)("p", {
                                    className: "mt-1 text-xs text-gray-500",
                                    children:
                                      "If you'd like us to respond directly to you",
                                  }),
                                ],
                              }),
                              (0, n.jsxs)("div", {
                                children: [
                                  (0, n.jsx)("label", {
                                    className:
                                      "block text-sm font-medium text-gray-700 mb-1",
                                    children: "Contact Phone (Optional)",
                                  }),
                                  (0, n.jsx)("input", {
                                    type: "tel",
                                    value: o.contactPhone,
                                    onChange: (e) =>
                                      x("contactPhone", e.target.value),
                                    className:
                                      "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                                    placeholder: "(555) 123-4567",
                                  }),
                                ],
                              }),
                              (0, n.jsxs)("div", {
                                className:
                                  "bg-blue-50 border border-blue-200 rounded-lg p-4",
                                children: [
                                  (0, n.jsxs)("p", {
                                    className: "text-sm text-blue-800",
                                    children: [
                                      (0, n.jsx)("strong", {
                                        children:
                                          "Your message will be sent to:",
                                      }),
                                      " workflown8n@gmail.com",
                                    ],
                                  }),
                                  (0, n.jsx)("p", {
                                    className: "text-xs text-blue-700 mt-1",
                                    children:
                                      "We typically respond within 24-48 hours",
                                  }),
                                ],
                              }),
                              (0, n.jsxs)("div", {
                                className:
                                  "flex items-center justify-end space-x-3 pt-4 border-t",
                                children: [
                                  (0, n.jsx)("button", {
                                    type: "button",
                                    onClick: s,
                                    className:
                                      "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium",
                                    disabled: c,
                                    children: "Cancel",
                                  }),
                                  (0, n.jsx)("button", {
                                    type: "submit",
                                    disabled: c || !o.description.trim(),
                                    className:
                                      "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed",
                                    children: c
                                      ? (0, n.jsxs)(n.Fragment, {
                                          children: [
                                            (0, n.jsx)("div", {
                                              className:
                                                "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2",
                                            }),
                                            "Submitting...",
                                          ],
                                        })
                                      : (0, n.jsxs)(n.Fragment, {
                                          children: [
                                            (0, n.jsx)(k.Z, {
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
      let G = [
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
      function M() {
        let e = (0, r.useParams)();
        (0, r.useRouter)();
        let t = (null == e ? void 0 : e.clientId) || "",
          [s, i] = (0, a.useState)(1),
          [d, m] = (0, a.useState)({
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
          [u, h] = (0, a.useState)(!0),
          [x, p] = (0, a.useState)(!1),
          [b, f] = (0, a.useState)("");
        ((0, a.useEffect)(() => {
          let e = async () => {
            h(!0);
            try {
              let e = localStorage.getItem("funding-wizard-".concat(t));
              e && m(JSON.parse(e));
              let s = await fetch("/api/analysis/".concat(t));
              if (s.ok) {
                let e = await s.json();
                m((t) => {
                  var s, n, a, r;
                  return {
                    ...t,
                    extractedFields: e.extractedFields || {},
                    missingFields: e.missingFields || [],
                    followUpQuestions: e.followUpQuestions || [],
                    fullName:
                      (null === (n = e.extractedFields) || void 0 === n
                        ? void 0
                        : null === (s = n.name) || void 0 === s
                          ? void 0
                          : s.value) || t.fullName,
                    zipCode:
                      v(
                        null === (r = e.extractedFields) || void 0 === r
                          ? void 0
                          : null === (a = r.location) || void 0 === a
                            ? void 0
                            : a.value,
                      ) || t.zipCode,
                  };
                });
              }
            } catch (e) {
              console.error("[FundingWizard] Error loading client data:", e);
            } finally {
              h(!1);
            }
          };
          t && e();
        }, [t]),
          (0, a.useEffect)(() => {
            !u &&
              t &&
              localStorage.setItem(
                "funding-wizard-".concat(t),
                JSON.stringify(d),
              );
          }, [d, t, u]));
        let v = (e) => {
            if (!e) return "";
            let t = e.match(/\b\d{5}\b/);
            return t ? t[0] : "";
          },
          j = (e) => {
            (m((t) => ({ ...t, ...e })), s < G.length && i(s + 1));
          },
          N = () => {
            s > 1 && i(s - 1);
          },
          k = (e) => {
            (f(e), p(!0));
          };
        return u
          ? (0, n.jsx)("div", {
              className:
                "min-h-screen bg-gray-50 flex items-center justify-center",
              children: (0, n.jsxs)("div", {
                className: "text-center",
                children: [
                  (0, n.jsx)("div", {
                    className:
                      "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4",
                  }),
                  (0, n.jsx)("p", {
                    className: "text-gray-600",
                    children: "Loading your information...",
                  }),
                ],
              }),
            })
          : (0, n.jsxs)("div", {
              className: "min-h-screen bg-gray-50 py-8",
              children: [
                (0, n.jsxs)("div", {
                  className: "max-w-6xl mx-auto px-4",
                  children: [
                    (0, n.jsxs)("div", {
                      className: "bg-white rounded-lg shadow-sm p-6 mb-6",
                      children: [
                        (0, n.jsx)("h1", {
                          className: "text-2xl font-bold text-gray-900 mb-2",
                          children: "Funding Setup Wizard",
                        }),
                        (0, n.jsx)("p", {
                          className: "text-gray-600",
                          children:
                            "Complete the following steps to finalize your fundraising campaign",
                        }),
                      ],
                    }),
                    (0, n.jsx)("div", {
                      className: "bg-white rounded-lg shadow-sm p-6 mb-6",
                      children: (0, n.jsx)("div", {
                        className: "mb-8",
                        children: (0, n.jsx)("div", {
                          className: "flex items-center justify-between",
                          children: G.map((e, t) =>
                            (0, n.jsxs)(
                              a.Fragment,
                              {
                                children: [
                                  (0, n.jsxs)("div", {
                                    className:
                                      "flex flex-col items-center flex-1",
                                    children: [
                                      (0, n.jsx)("div", {
                                        className:
                                          "\n                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium\n                  transition-colors duration-200\n                  ".concat(
                                            s === e.id
                                              ? "bg-blue-600 text-white"
                                              : s > e.id
                                                ? "bg-green-600 text-white"
                                                : "bg-gray-200 text-gray-600",
                                            "\n                ",
                                          ),
                                        children:
                                          s > e.id
                                            ? (0, n.jsx)(l.Z, {
                                                className: "w-5 h-5",
                                              })
                                            : e.id,
                                      }),
                                      (0, n.jsxs)("div", {
                                        className: "mt-2 text-center",
                                        children: [
                                          (0, n.jsx)("p", {
                                            className:
                                              "text-sm font-medium ".concat(
                                                s === e.id
                                                  ? "text-blue-600"
                                                  : "text-gray-600",
                                              ),
                                            children: e.title,
                                          }),
                                          (0, n.jsx)("p", {
                                            className:
                                              "text-xs text-gray-500 mt-1 max-w-[150px]",
                                            children: e.description,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  t < G.length - 1 &&
                                    (0, n.jsx)("div", {
                                      className:
                                        "\n                  h-1 flex-1 mx-2 transition-colors duration-200\n                  ".concat(
                                          s > e.id
                                            ? "bg-green-600"
                                            : "bg-gray-200",
                                          "\n                ",
                                        ),
                                    }),
                                ],
                              },
                              e.id,
                            ),
                          ),
                        }),
                      }),
                    }),
                    (0, n.jsx)("div", {
                      className: "bg-white rounded-lg shadow-sm p-8",
                      children: (() => {
                        switch (s) {
                          case 1:
                            return (0, n.jsx)(c, {
                              data: d,
                              onComplete: j,
                              onBack: N,
                              onHelp: () => k("confirm_details"),
                            });
                          case 2:
                            return (0, n.jsx)(g, {
                              data: d,
                              onComplete: j,
                              onBack: N,
                              onHelp: () => k("qr_code"),
                              clientId: t,
                            });
                          case 3:
                            return (0, n.jsx)(y, {
                              data: d,
                              onComplete: j,
                              onBack: N,
                              onHelp: () => k("gofundme_draft"),
                              clientId: t,
                            });
                          case 4:
                            return (0, n.jsx)(w, {
                              data: d,
                              onComplete: j,
                              onBack: N,
                              onHelp: () => k("gofundme_wizard"),
                            });
                          case 5:
                            return (0, n.jsx)(C, {
                              data: d,
                              onBack: N,
                              clientId: t,
                            });
                          default:
                            return null;
                        }
                      })(),
                    }),
                    (0, n.jsx)("button", {
                      onClick: () => k("general"),
                      className:
                        "fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors",
                      title: "Need help?",
                      children: (0, n.jsx)(o.Z, { className: "w-6 h-6" }),
                    }),
                  ],
                }),
                x &&
                  (0, n.jsx)(P, {
                    context: b,
                    onClose: () => p(!1),
                    clientId: t,
                  }),
              ],
            });
      }
    },
  },
  function (e) {
    (e.O(0, [17, 115, 835, 744], function () {
      return e((e.s = 35530));
    }),
      (_N_E = e.O()));
  },
]);

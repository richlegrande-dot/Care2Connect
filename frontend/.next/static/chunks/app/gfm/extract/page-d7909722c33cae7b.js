(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [316],
  {
    1991: function (e, t, r) {
      Promise.resolve().then(r.bind(r, 85704));
    },
    85704: function (e, t, r) {
      "use strict";
      (r.r(t),
        r.d(t, {
          default: function () {
            return m;
          },
        }));
      var s = r(37821),
        a = r(58078),
        o = r(46179),
        n = r(96871),
        i = r.n(n),
        l = r(97485),
        c = r(16717);
      let d = a.forwardRef(function ({ title: e, titleId: t, ...r }, s) {
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
            d: "M6 18 18 6M6 6l12 12",
          }),
        );
      });
      var u = function (e) {
        if (e && Array.isArray(e.questions)) {
          let {
              questions: t,
              currentDraft: r,
              isOpen: o,
              onComplete: n,
              onSkip: i,
              onClose: l,
            } = e,
            [u, m] = (0, a.useState)(0),
            [p, f] = (0, a.useState)({}),
            [h, x] = (0, a.useState)(""),
            [g, y] = (0, a.useState)({}),
            b = (0, a.useRef)(null);
          if (!o) return null;
          if (
            ((0, a.useEffect)(() => {
              o && b.current && b.current.focus();
            }, [o]),
            0 === t.length)
          )
            return (0, s.jsx)("div", {
              tabIndex: -1,
              onKeyDown: (e) => {
                "Escape" === e.key && (null == l || l());
              },
              className:
                "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
              children: (0, s.jsx)("div", {
                className:
                  "bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto",
                children: (0, s.jsxs)("div", {
                  className: "p-6",
                  children: [
                    (0, s.jsxs)("div", {
                      className: "flex items-start justify-between mb-4",
                      children: [
                        (0, s.jsxs)("div", {
                          className: "flex items-center",
                          children: [
                            (0, s.jsx)(c.Z, {
                              className: "w-6 h-6 text-blue-600 mr-2",
                            }),
                            (0, s.jsx)("h3", {
                              className: "text-lg font-semibold text-gray-900",
                              children: "Follow-up Questions",
                            }),
                          ],
                        }),
                        (0, s.jsx)("button", {
                          onClick: () => (null == l ? void 0 : l()),
                          className:
                            "text-gray-400 hover:text-gray-600 transition-colors",
                          "aria-label": "Close dialog",
                          children: (0, s.jsx)(d, { className: "w-6 h-6" }),
                        }),
                      ],
                    }),
                    (0, s.jsx)("p", {
                      className: "text-gray-600",
                      children: "No questions available.",
                    }),
                  ],
                }),
              }),
            });
          let v = t[u],
            w = {
              field: v.field,
              question: v.question,
              type: "text",
              options: v.suggestions,
            };
          (0, a.useEffect)(() => {
            x(p[v.field] || "");
          }, [u, p, v.field]);
          let j = (e, t) => {
              if (!e.trim()) return "Please provide an answer.";
              if ("goalAmount" === t) {
                let t = parseFloat(e.replace(/[$,]/g, ""));
                if (isNaN(t) || t <= 0) return "Please enter a valid amount.";
              }
              return null;
            },
            N = () => {
              let e = j(h, v.field);
              if (e) {
                y({ [v.field]: e });
                return;
              }
              y({});
              let r = { ...p, [v.field]: h };
              (f(r), u < t.length - 1 ? m((e) => e + 1) : null == n || n(r));
            },
            k = () => (null == l ? void 0 : l()),
            S = (e) => {
              var t;
              return r
                ? e.replace(
                    /\[Name\]/g,
                    (null === (t = r.name) || void 0 === t
                      ? void 0
                      : t.value) || "",
                  )
                : e;
            },
            C = (e) => {
              let t = S(e);
              (x(t), y({}));
            };
          return (0, s.jsx)("div", {
            ref: b,
            tabIndex: -1,
            onKeyDown: (e) => {
              "Escape" === e.key && k();
            },
            className:
              "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
            children: (0, s.jsx)("div", {
              className:
                "bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto",
              children: (0, s.jsxs)("div", {
                className: "p-6",
                children: [
                  (0, s.jsxs)("div", {
                    className: "flex items-start justify-between mb-4",
                    children: [
                      (0, s.jsxs)("div", {
                        className: "flex items-center",
                        children: [
                          (0, s.jsx)(c.Z, {
                            className: "w-6 h-6 text-blue-600 mr-2",
                          }),
                          (0, s.jsx)("h3", {
                            className: "text-lg font-semibold text-gray-900",
                            children: "Follow-up Questions",
                          }),
                        ],
                      }),
                      (0, s.jsx)("button", {
                        onClick: k,
                        className:
                          "text-gray-400 hover:text-gray-600 transition-colors",
                        "aria-label": "Close dialog",
                        children: (0, s.jsx)(d, { className: "w-6 h-6" }),
                      }),
                    ],
                  }),
                  (0, s.jsxs)("div", {
                    className: "mb-4 text-center",
                    children: [
                      (0, s.jsxs)("span", {
                        className: "text-sm text-gray-600",
                        children: [u + 1, " of ", t.length],
                      }),
                      (0, s.jsx)("p", {
                        className: "text-sm text-gray-600",
                        children: "Improve your campaign",
                      }),
                    ],
                  }),
                  (0, s.jsxs)("div", {
                    className: "mb-6",
                    children: [
                      (0, s.jsx)("p", {
                        className: "text-gray-800 text-lg mb-2",
                        children: w.question,
                      }),
                      v.context &&
                        (0, s.jsx)("p", {
                          className: "text-gray-600 text-sm mb-4",
                          children: v.context,
                        }),
                      (0, s.jsxs)("form", {
                        onSubmit: (e) => {
                          (e.preventDefault(), N());
                        },
                        children: [
                          (0, s.jsx)("input", {
                            "aria-label": w.question,
                            className:
                              "w-full px-4 py-3 border-2 rounded-lg ".concat(
                                g[v.field]
                                  ? "border-red-300"
                                  : "border-gray-300",
                              ),
                            value: h,
                            onChange: (e) => {
                              (x(e.target.value), g[v.field] && y({}));
                            },
                          }),
                          g[v.field] &&
                            (0, s.jsx)("p", {
                              className: "text-red-600 text-sm mt-1",
                              children: g[v.field],
                            }),
                          v.suggestions &&
                            (0, s.jsx)("div", {
                              className: "mt-3 flex flex-wrap gap-2",
                              children: v.suggestions.map((e) =>
                                (0, s.jsx)(
                                  "button",
                                  {
                                    type: "button",
                                    onClick: () => C(e),
                                    className:
                                      "px-3 py-1 border rounded hover:bg-gray-50",
                                    children: S(e),
                                  },
                                  e,
                                ),
                              ),
                            }),
                          (0, s.jsxs)("div", {
                            className: "flex gap-3 mt-6",
                            children: [
                              u > 0 &&
                                (0, s.jsx)("button", {
                                  type: "button",
                                  onClick: () => {
                                    let e = { ...p, [v.field]: h };
                                    (f(e), y({}), u > 0 && m((e) => e - 1));
                                  },
                                  className:
                                    "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50",
                                  children: "Back",
                                }),
                              (0, s.jsx)("button", {
                                type: "submit",
                                className:
                                  "flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700",
                                children:
                                  u === t.length - 1 ? "Finish" : "Next",
                              }),
                              (0, s.jsx)("button", {
                                type: "button",
                                onClick: () => (null == i ? void 0 : i()),
                                className:
                                  "px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50",
                                children: "Skip",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, s.jsxs)("div", {
                    className:
                      "text-sm text-gray-500 bg-gray-50 rounded-lg p-3",
                    children: [
                      (0, s.jsxs)("p", {
                        className: "mb-1",
                        children: [
                          "\uD83D\uDCA1 ",
                          (0, s.jsx)("strong", { children: "Why do we ask?" }),
                        ],
                      }),
                      (0, s.jsx)("p", {
                        children:
                          "This information helps create a complete and compelling campaign that donors can trust and connect with.",
                      }),
                    ],
                  }),
                ],
              }),
            }),
          });
        }
        let {
            question: t,
            onAnswer: r,
            onSkip: o,
            onClose: n,
            progress: i,
          } = e,
          [l, u] = (0, a.useState)(""),
          [m, p] = (0, a.useState)(!1),
          f = async (e) => {
            if ((e.preventDefault(), l.trim())) {
              p(!0);
              try {
                await r(l.trim());
              } catch (e) {
                console.error("Error submitting answer:", e);
              } finally {
                p(!1);
              }
            }
          };
        return (0, s.jsx)("div", {
          className:
            "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
          children: (0, s.jsx)("div", {
            className:
              "bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto",
            children: (0, s.jsxs)("div", {
              className: "p-6",
              children: [
                (0, s.jsxs)("div", {
                  className: "flex items-start justify-between mb-4",
                  children: [
                    (0, s.jsxs)("div", {
                      className: "flex items-center",
                      children: [
                        (0, s.jsx)(c.Z, {
                          className: "w-6 h-6 text-blue-600 mr-2",
                        }),
                        (0, s.jsx)("h3", {
                          className: "text-lg font-semibold text-gray-900",
                          children: "Quick Question",
                        }),
                      ],
                    }),
                    (0, s.jsx)("button", {
                      onClick: n,
                      className:
                        "text-gray-400 hover:text-gray-600 transition-colors",
                      "aria-label": "Close dialog",
                      children: (0, s.jsx)(d, { className: "w-6 h-6" }),
                    }),
                  ],
                }),
                i &&
                  (0, s.jsxs)("div", {
                    className: "mb-4",
                    children: [
                      (0, s.jsxs)("div", {
                        className:
                          "flex justify-between text-sm text-gray-600 mb-1",
                        children: [
                          (0, s.jsxs)("span", {
                            children: [
                              "Question ",
                              i.current + 1,
                              " of ",
                              i.total,
                            ],
                          }),
                          (0, s.jsxs)("span", {
                            children: [
                              Math.round(((i.current + 1) / i.total) * 100),
                              "%",
                            ],
                          }),
                        ],
                      }),
                      (0, s.jsx)("div", {
                        className: "w-full bg-gray-200 rounded-full h-2",
                        children: (0, s.jsx)("div", {
                          className:
                            "bg-blue-600 h-2 rounded-full transition-all duration-300",
                          style: {
                            width: "".concat(
                              ((i.current + 1) / i.total) * 100,
                              "%",
                            ),
                          },
                        }),
                      }),
                    ],
                  }),
                (0, s.jsxs)("div", {
                  className: "mb-6",
                  children: [
                    (0, s.jsx)("p", {
                      className: "text-gray-800 text-lg mb-4",
                      children: t.question,
                    }),
                    (0, s.jsxs)("form", {
                      onSubmit: f,
                      children: [
                        (() => {
                          switch (t.type) {
                            case "select":
                              var e;
                              return (0, s.jsxs)("select", {
                                value: l,
                                onChange: (e) => u(e.target.value),
                                className:
                                  "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",
                                "aria-label": t.question,
                                required: !0,
                                children: [
                                  (0, s.jsx)("option", {
                                    value: "",
                                    children: "Please select...",
                                  }),
                                  null === (e = t.options) || void 0 === e
                                    ? void 0
                                    : e.map((e) =>
                                        (0, s.jsx)(
                                          "option",
                                          { value: e, children: e },
                                          e,
                                        ),
                                      ),
                                ],
                              });
                            case "number":
                              return (0, s.jsx)("input", {
                                type: "number",
                                value: l,
                                onChange: (e) => u(e.target.value),
                                className:
                                  "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",
                                placeholder: "Enter amount",
                                min: "1",
                                required: !0,
                              });
                            case "date":
                              return (0, s.jsx)("input", {
                                type: "text",
                                value: l,
                                onChange: (e) => u(e.target.value),
                                className:
                                  "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",
                                placeholder: "MM/DD/YYYY",
                                pattern: "\\\\d{1,2}/\\\\d{1,2}/\\\\d{4}",
                                required: !0,
                              });
                            default:
                              return (0, s.jsx)("textarea", {
                                value: l,
                                onChange: (e) => u(e.target.value),
                                className:
                                  "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",
                                rows: "shortSummary" === t.field ? 3 : 1,
                                placeholder: "Type your answer...",
                                required: !0,
                              });
                          }
                        })(),
                        "date" === t.type &&
                          (0, s.jsx)("p", {
                            className: "text-sm text-gray-500 mt-1",
                            children:
                              "Please use MM/DD/YYYY format (e.g., 01/15/1990)",
                          }),
                        "number" === t.type &&
                          "goalAmount" === t.field &&
                          (0, s.jsx)("p", {
                            className: "text-sm text-gray-500 mt-1",
                            children:
                              "Enter the total amount you hope to raise",
                          }),
                        (0, s.jsxs)("div", {
                          className: "flex gap-3 mt-6",
                          children: [
                            (0, s.jsx)("button", {
                              type: "submit",
                              disabled: !l.trim() || m,
                              className:
                                "flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors",
                              children: m ? "Submitting..." : "Continue",
                            }),
                            (0, s.jsx)("button", {
                              type: "button",
                              onClick: () => {
                                o();
                              },
                              disabled: m,
                              className:
                                "px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors",
                              children: "Skip",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                (0, s.jsxs)("div", {
                  className: "text-sm text-gray-500 bg-gray-50 rounded-lg p-3",
                  children: [
                    (0, s.jsxs)("p", {
                      className: "mb-1",
                      children: [
                        "\uD83D\uDCA1 ",
                        (0, s.jsx)("strong", { children: "Why do we ask?" }),
                      ],
                    }),
                    (0, s.jsx)("p", {
                      children:
                        "This information helps create a complete and compelling campaign that donors can trust and connect with.",
                    }),
                  ],
                }),
              ],
            }),
          }),
        });
      };
      function m() {
        var e, t;
        let r = (0, o.useRouter)();
        (0, o.useSearchParams)();
        let [n, c] = (0, a.useState)(null),
          [d, m] = (0, a.useState)(!1),
          [p, f] = (0, a.useState)(""),
          [h, x] = (0, a.useState)(!1),
          [g, y] = (0, a.useState)(!1),
          [b, v] = (0, a.useState)(null),
          [w, j] = (0, a.useState)(null);
        (0, a.useEffect)(() => {
          N();
        }, []);
        let N = async () => {
            try {
              let e = await fetch(
                  "".concat(
                    "https://api.care2connects.org",
                    "/api/transcription/status",
                  ),
                ),
                t = await e.json();
              t.success && t.data.fallbackMode && x(!0);
            } catch (e) {
              (console.error("Status check error:", e), x(!0));
            }
          },
          k = async () => {
            if (!p.trim()) {
              l.default.error("Please enter your story transcript");
              return;
            }
            m(!0);
            try {
              let r = await fetch(
                  "".concat(
                    "https://api.care2connects.org",
                    "/api/transcription/text",
                  ),
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ transcript: p.trim() }),
                  },
                ),
                s = await r.json();
              if (s.success) {
                var e, t;
                (c(s.data.extraction),
                  (null === (t = s.data.extraction.draft) || void 0 === t
                    ? void 0
                    : null === (e = t.followUpQuestions) || void 0 === e
                      ? void 0
                      : e.length) > 0
                    ? await S(s.data.extraction.draft)
                    : l.default.success("Story processed successfully!"));
              } else l.default.error(s.error || "Failed to process transcript");
            } catch (e) {
              (console.error("Processing error:", e),
                l.default.error("Failed to process your story"));
            } finally {
              m(!1);
            }
          },
          S = async (e) => {
            try {
              let t = await fetch(
                  "".concat(
                    "https://api.care2connects.org",
                    "/api/transcription/followup/start",
                  ),
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      draftId: "draft_".concat(Date.now()),
                      userId: "anonymous_user",
                    }),
                  },
                ),
                r = await t.json();
              r.success && (j(r.data.sessionId), await C(r.data.sessionId, e));
            } catch (e) {
              (console.error("Follow-up session error:", e),
                l.default.error("Error starting follow-up questions"));
            }
          },
          C = async (e, t) => {
            try {
              let r = await fetch(
                  ""
                    .concat(
                      "https://api.care2connects.org",
                      "/api/transcription/followup/",
                    )
                    .concat(e, "/question?draft=")
                    .concat(encodeURIComponent(JSON.stringify(t))),
                ),
                s = await r.json();
              s.success &&
                (s.data.completed
                  ? (y(!1), l.default.success("All questions completed!"))
                  : (v(s.data.question), y(!0)));
            } catch (e) {
              console.error("Get question error:", e);
            }
          },
          E = async (e) => {
            if (w)
              try {
                let t = await fetch(
                  ""
                    .concat(
                      "https://api.care2connects.org",
                      "/api/transcription/followup/",
                    )
                    .concat(w, "/answer"),
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ answer: e }),
                  },
                );
                t.ok && n && (await C(w, n.draft));
              } catch (e) {
                (console.error("Submit answer error:", e),
                  l.default.error("Failed to submit answer"));
              }
          },
          O = async () => {
            if (w && n)
              try {
                await C(w, n.draft);
              } catch (e) {
                console.error("Skip error:", e);
              }
          },
          _ = (e, t) => {
            if (!(null == e ? void 0 : e.value)) return null;
            let r = e.confidence || 0;
            return (0, s.jsxs)("div", {
              className: "border rounded-lg p-3 mb-3",
              children: [
                (0, s.jsxs)("div", {
                  className: "flex justify-between items-center mb-2",
                  children: [
                    (0, s.jsx)("span", {
                      className: "font-medium text-gray-700",
                      children: t,
                    }),
                    (0, s.jsxs)("span", {
                      className: "text-sm ".concat(
                        r > 0.7
                          ? "text-green-600"
                          : r > 0.4
                            ? "text-yellow-600"
                            : "text-red-600",
                      ),
                      children: [
                        r > 0.7 ? "✅" : r > 0.4 ? "⚠️" : "❓",
                        " ",
                        Math.round(100 * r),
                        "%",
                      ],
                    }),
                  ],
                }),
                (0, s.jsx)("div", {
                  className: "text-gray-900",
                  children:
                    "object" == typeof e.value
                      ? JSON.stringify(e.value)
                      : String(e.value),
                }),
              ],
            });
          };
        return (0, s.jsx)("div", {
          className: "min-h-screen bg-gray-50 py-8",
          children: (0, s.jsxs)("div", {
            className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
            children: [
              (0, s.jsxs)("div", {
                className: "text-center mb-8",
                children: [
                  (0, s.jsx)("h1", {
                    className: "text-3xl font-bold text-gray-900 mb-4",
                    children: "Story Analysis & GoFundMe Setup",
                  }),
                  (0, s.jsx)("p", {
                    className: "text-lg text-gray-600",
                    children:
                      "AI will analyze your story and auto-fill GoFundMe campaign fields",
                  }),
                ],
              }),
              (0, s.jsxs)("div", {
                className: "grid lg:grid-cols-2 gap-8",
                children: [
                  (0, s.jsxs)("div", {
                    className: "bg-white rounded-lg shadow p-6",
                    children: [
                      (0, s.jsx)("h2", {
                        className: "text-xl font-semibold mb-4",
                        children: "Your Story",
                      }),
                      h
                        ? (0, s.jsxs)("div", {
                            children: [
                              (0, s.jsx)("div", {
                                className:
                                  "mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg",
                                children: (0, s.jsxs)("p", {
                                  className: "text-blue-800 text-sm",
                                  children: [
                                    (0, s.jsx)("strong", {
                                      children: "Manual Mode:",
                                    }),
                                    " Please paste your story transcript below. Our AI will analyze it and help create your GoFundMe campaign.",
                                  ],
                                }),
                              }),
                              (0, s.jsx)("textarea", {
                                value: p,
                                onChange: (e) => f(e.target.value),
                                className:
                                  "w-full h-40 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",
                                placeholder:
                                  "Please type or paste your story here... Tell us about your situation, what help you need, and what you hope to achieve.",
                              }),
                              (0, s.jsxs)("div", {
                                className:
                                  "mt-4 flex justify-between items-center",
                                children: [
                                  (0, s.jsxs)("span", {
                                    className: "text-sm text-gray-500",
                                    children: [p.length, " characters"],
                                  }),
                                  (0, s.jsx)("button", {
                                    onClick: k,
                                    disabled: !p.trim() || d,
                                    className:
                                      "btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed",
                                    children: d
                                      ? "Processing..."
                                      : "Analyze Story",
                                  }),
                                ],
                              }),
                            ],
                          })
                        : (0, s.jsxs)("div", {
                            className: "text-center py-8",
                            children: [
                              (0, s.jsx)("p", {
                                className: "text-gray-600 mb-4",
                                children:
                                  "Audio transcription will be processed here once uploaded from the recording page.",
                              }),
                              (0, s.jsx)(i(), {
                                href: "/tell-story",
                                className: "btn-primary",
                                children: "Go to Recording",
                              }),
                            ],
                          }),
                    ],
                  }),
                  (0, s.jsxs)("div", {
                    className: "bg-white rounded-lg shadow p-6",
                    children: [
                      (0, s.jsx)("h2", {
                        className: "text-xl font-semibold mb-4",
                        children: "Extracted Information",
                      }),
                      n
                        ? (0, s.jsxs)("div", {
                            children: [
                              (null === (e = n.warnings) || void 0 === e
                                ? void 0
                                : e.length) > 0 &&
                                (0, s.jsxs)("div", {
                                  className:
                                    "mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg",
                                  children: [
                                    (0, s.jsx)("h4", {
                                      className:
                                        "font-medium text-yellow-800 mb-1",
                                      children: "Warnings:",
                                    }),
                                    (0, s.jsx)("ul", {
                                      className: "text-sm text-yellow-700",
                                      children: n.warnings.map((e, t) =>
                                        (0, s.jsxs)(
                                          "li",
                                          { children: ["• ", e] },
                                          t,
                                        ),
                                      ),
                                    }),
                                  ],
                                }),
                              (0, s.jsxs)("div", {
                                className: "space-y-3",
                                children: [
                                  _(n.draft.name, "Name"),
                                  _(n.draft.title, "Campaign Title"),
                                  _(n.draft.category, "Category"),
                                  _(n.draft.goalAmount, "Goal Amount"),
                                  _(n.draft.location, "Location"),
                                  _(n.draft.shortSummary, "Summary"),
                                ],
                              }),
                              (null === (t = n.draft.missingFields) ||
                              void 0 === t
                                ? void 0
                                : t.length) > 0 &&
                                (0, s.jsxs)("div", {
                                  className:
                                    "mt-4 p-3 bg-red-50 border border-red-200 rounded-lg",
                                  children: [
                                    (0, s.jsx)("h4", {
                                      className:
                                        "font-medium text-red-800 mb-1",
                                      children: "Missing Information:",
                                    }),
                                    (0, s.jsxs)("p", {
                                      className: "text-sm text-red-700",
                                      children: [
                                        n.draft.missingFields.join(", "),
                                        " - We'll ask follow-up questions for these.",
                                      ],
                                    }),
                                  ],
                                }),
                              (0, s.jsx)("div", {
                                className: "mt-6",
                                children: (0, s.jsx)("button", {
                                  onClick: () => {
                                    (null == n ? void 0 : n.draft) &&
                                      (localStorage.setItem(
                                        "gfm_extracted_draft",
                                        JSON.stringify(n.draft),
                                      ),
                                      r.push("/gfm/review"));
                                  },
                                  className: "w-full btn-primary",
                                  children: "Continue to GoFundMe Stepper →",
                                }),
                              }),
                            ],
                          })
                        : (0, s.jsx)("div", {
                            className: "text-center py-8 text-gray-500",
                            children:
                              "Process your story to see extracted information here",
                          }),
                    ],
                  }),
                ],
              }),
              (0, s.jsxs)("div", {
                className: "mt-8 flex justify-between",
                children: [
                  (0, s.jsx)(i(), {
                    href: "/tell-story",
                    className: "btn-secondary",
                    children: "← Back to Recording",
                  }),
                  (0, s.jsx)(i(), {
                    href: "/",
                    className: "btn-secondary",
                    children: "Cancel & Go Home",
                  }),
                ],
              }),
              g &&
                b &&
                (0, s.jsx)(u, {
                  question: b,
                  onAnswer: E,
                  onSkip: O,
                  onClose: () => y(!1),
                }),
            ],
          }),
        });
      }
    },
    8489: function (e, t, r) {
      "use strict";
      var s = r(58078),
        a = Symbol.for("react.element"),
        o = Symbol.for("react.fragment"),
        n = Object.prototype.hasOwnProperty,
        i =
          s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
            .ReactCurrentOwner,
        l = { key: !0, ref: !0, __self: !0, __source: !0 };
      function c(e, t, r) {
        var s,
          o = {},
          c = null,
          d = null;
        for (s in (void 0 !== r && (c = "" + r),
        void 0 !== t.key && (c = "" + t.key),
        void 0 !== t.ref && (d = t.ref),
        t))
          n.call(t, s) && !l.hasOwnProperty(s) && (o[s] = t[s]);
        if (e && e.defaultProps)
          for (s in (t = e.defaultProps)) void 0 === o[s] && (o[s] = t[s]);
        return {
          $$typeof: a,
          type: e,
          key: c,
          ref: d,
          props: o,
          _owner: i.current,
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
    16717: function (e, t, r) {
      "use strict";
      var s = r(58078);
      let a = s.forwardRef(function ({ title: e, titleId: t, ...r }, a) {
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
            d: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z",
          }),
        );
      });
      t.Z = a;
    },
    97485: function (e, t, r) {
      "use strict";
      let s, a;
      (r.r(t),
        r.d(t, {
          CheckmarkIcon: function () {
            return K;
          },
          ErrorIcon: function () {
            return W;
          },
          LoaderIcon: function () {
            return J;
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
            return L;
          },
          useToaster: function () {
            return Y;
          },
          useToasterStore: function () {
            return F;
          },
        }));
      var o,
        n = r(58078);
      let i = { data: "" },
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
          return e || i;
        },
        c = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,
        d = /\/\*[^]*?\*\/|  +/g,
        u = /\n+/g,
        m = (e, t) => {
          let r = "",
            s = "",
            a = "";
          for (let o in e) {
            let n = e[o];
            "@" == o[0]
              ? "i" == o[1]
                ? (r = o + " " + n + ";")
                : (s +=
                    "f" == o[1]
                      ? m(n, o)
                      : o + "{" + m(n, "k" == o[1] ? "" : t) + "}")
              : "object" == typeof n
                ? (s += m(
                    n,
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
                : null != n &&
                  ((o = /^--/.test(o)
                    ? o
                    : o.replace(/[A-Z]/g, "-$&").toLowerCase()),
                  (a += m.p ? m.p(o, n) : o + ":" + n + ";"));
          }
          return r + (t && a ? t + "{" + a + "}" : a) + s;
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
        h = (e, t, r, s, a) => {
          var o;
          let n = f(e),
            i =
              p[n] ||
              (p[n] = ((e) => {
                let t = 0,
                  r = 11;
                for (; t < e.length; ) r = (101 * r + e.charCodeAt(t++)) >>> 0;
                return "go" + r;
              })(n));
          if (!p[i]) {
            let t =
              n !== e
                ? e
                : ((e) => {
                    let t,
                      r,
                      s = [{}];
                    for (; (t = c.exec(e.replace(d, ""))); )
                      t[4]
                        ? s.shift()
                        : t[3]
                          ? ((r = t[3].replace(u, " ").trim()),
                            s.unshift((s[0][r] = s[0][r] || {})))
                          : (s[0][t[1]] = t[2].replace(u, " ").trim());
                    return s[0];
                  })(e);
            p[i] = m(a ? { ["@keyframes " + i]: t } : t, r ? "" : "." + i);
          }
          let l = r && p.g ? p.g : null;
          return (
            r && (p.g = p[i]),
            (o = p[i]),
            l
              ? (t.data = t.data.replace(l, o))
              : -1 === t.data.indexOf(o) &&
                (t.data = s ? o + t.data : t.data + o),
            i
          );
        },
        x = (e, t, r) =>
          e.reduce((e, s, a) => {
            let o = t[a];
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
            return e + s + (null == o ? "" : o);
          }, "");
      function g(e) {
        let t = this || {},
          r = e.call ? e(t.p) : e;
        return h(
          r.unshift
            ? r.raw
              ? x(r, [].slice.call(arguments, 1), t.p)
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
      g.bind({ g: 1 });
      let y,
        b,
        v,
        w = g.bind({ k: 1 });
      function j(e, t) {
        let r = this || {};
        return function () {
          let s = arguments;
          function a(o, n) {
            let i = Object.assign({}, o),
              l = i.className || a.className;
            ((r.p = Object.assign({ theme: b && b() }, i)),
              (r.o = / *go\d+/.test(l)),
              (i.className = g.apply(r, s) + (l ? " " + l : "")),
              t && (i.ref = n));
            let c = e;
            return (
              e[0] && ((c = i.as || e), delete i.as),
              v && c[0] && v(i),
              y(c, i)
            );
          }
          return t ? t(a) : a;
        };
      }
      var N = (e) => "function" == typeof e,
        k = (e, t) => (N(e) ? e(t) : e),
        S = ((s = 0), () => (++s).toString()),
        C = () => {
          if (void 0 === a && "u" > typeof window) {
            let e = matchMedia("(prefers-reduced-motion: reduce)");
            a = !e || e.matches;
          }
          return a;
        },
        E = "default",
        O = (e, t) => {
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
              let { toast: s } = t;
              return O(e, {
                type: e.toasts.find((e) => e.id === s.id) ? 1 : 0,
                toast: s,
              });
            case 3:
              let { toastId: a } = t;
              return {
                ...e,
                toasts: e.toasts.map((e) =>
                  e.id === a || void 0 === a
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
        _ = [],
        D = { toasts: [], pausedAt: void 0, settings: { toastLimit: 20 } },
        I = {},
        A = (e, t = E) => {
          ((I[t] = O(I[t] || D, e)),
            _.forEach(([e, r]) => {
              e === t && r(I[t]);
            }));
        },
        P = (e) => Object.keys(I).forEach((t) => A(e, t)),
        T = (e) =>
          Object.keys(I).find((t) => I[t].toasts.some((t) => t.id === e)),
        M =
          (e = E) =>
          (t) => {
            A(t, e);
          },
        $ = {
          blank: 4e3,
          error: 4e3,
          success: 2e3,
          loading: 1 / 0,
          custom: 4e3,
        },
        F = (e = {}, t = E) => {
          let [r, s] = (0, n.useState)(I[t] || D),
            a = (0, n.useRef)(I[t]);
          (0, n.useEffect)(
            () => (
              a.current !== I[t] && s(I[t]),
              _.push([t, s]),
              () => {
                let e = _.findIndex(([e]) => e === t);
                e > -1 && _.splice(e, 1);
              }
            ),
            [t],
          );
          let o = r.toasts.map((t) => {
            var r, s, a;
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
                (null == (s = e[t.type]) ? void 0 : s.duration) ||
                (null == e ? void 0 : e.duration) ||
                $[t.type],
              style: {
                ...e.style,
                ...(null == (a = e[t.type]) ? void 0 : a.style),
                ...t.style,
              },
            };
          });
          return { ...r, toasts: o };
        },
        q = (e, t = "blank", r) => ({
          createdAt: Date.now(),
          visible: !0,
          dismissed: !1,
          type: t,
          ariaProps: { role: "status", "aria-live": "polite" },
          message: e,
          pauseDuration: 0,
          ...r,
          id: (null == r ? void 0 : r.id) || S(),
        }),
        z = (e) => (t, r) => {
          let s = q(t, e, r);
          return (M(s.toasterId || T(s.id))({ type: 2, toast: s }), s.id);
        },
        L = (e, t) => z("blank")(e, t);
      ((L.error = z("error")),
        (L.success = z("success")),
        (L.loading = z("loading")),
        (L.custom = z("custom")),
        (L.dismiss = (e, t) => {
          let r = { type: 3, toastId: e };
          t ? M(t)(r) : P(r);
        }),
        (L.dismissAll = (e) => L.dismiss(void 0, e)),
        (L.remove = (e, t) => {
          let r = { type: 4, toastId: e };
          t ? M(t)(r) : P(r);
        }),
        (L.removeAll = (e) => L.remove(void 0, e)),
        (L.promise = (e, t, r) => {
          let s = L.loading(t.loading, {
            ...r,
            ...(null == r ? void 0 : r.loading),
          });
          return (
            "function" == typeof e && (e = e()),
            e
              .then((e) => {
                let a = t.success ? k(t.success, e) : void 0;
                return (
                  a
                    ? L.success(a, {
                        id: s,
                        ...r,
                        ...(null == r ? void 0 : r.success),
                      })
                    : L.dismiss(s),
                  e
                );
              })
              .catch((e) => {
                let a = t.error ? k(t.error, e) : void 0;
                a
                  ? L.error(a, {
                      id: s,
                      ...r,
                      ...(null == r ? void 0 : r.error),
                    })
                  : L.dismiss(s);
              }),
            e
          );
        }));
      var R = 1e3,
        Y = (e, t = "default") => {
          let { toasts: r, pausedAt: s } = F(e, t),
            a = (0, n.useRef)(new Map()).current,
            o = (0, n.useCallback)((e, t = R) => {
              if (a.has(e)) return;
              let r = setTimeout(() => {
                (a.delete(e), i({ type: 4, toastId: e }));
              }, t);
              a.set(e, r);
            }, []);
          (0, n.useEffect)(() => {
            if (s) return;
            let e = Date.now(),
              a = r.map((r) => {
                if (r.duration === 1 / 0) return;
                let s = (r.duration || 0) + r.pauseDuration - (e - r.createdAt);
                if (s < 0) {
                  r.visible && L.dismiss(r.id);
                  return;
                }
                return setTimeout(() => L.dismiss(r.id, t), s);
              });
            return () => {
              a.forEach((e) => e && clearTimeout(e));
            };
          }, [r, s, t]);
          let i = (0, n.useCallback)(M(t), [t]),
            l = (0, n.useCallback)(() => {
              i({ type: 5, time: Date.now() });
            }, [i]),
            c = (0, n.useCallback)(
              (e, t) => {
                i({ type: 1, toast: { id: e, height: t } });
              },
              [i],
            ),
            d = (0, n.useCallback)(() => {
              s && i({ type: 6, time: Date.now() });
            }, [s, i]),
            u = (0, n.useCallback)(
              (e, t) => {
                let {
                    reverseOrder: s = !1,
                    gutter: a = 8,
                    defaultPosition: o,
                  } = t || {},
                  n = r.filter(
                    (t) => (t.position || o) === (e.position || o) && t.height,
                  ),
                  i = n.findIndex((t) => t.id === e.id),
                  l = n.filter((e, t) => t < i && e.visible).length;
                return n
                  .filter((e) => e.visible)
                  .slice(...(s ? [l + 1] : [0, l]))
                  .reduce((e, t) => e + (t.height || 0) + a, 0);
              },
              [r],
            );
          return (
            (0, n.useEffect)(() => {
              r.forEach((e) => {
                if (e.dismissed) o(e.id, e.removeDelay);
                else {
                  let t = a.get(e.id);
                  t && (clearTimeout(t), a.delete(e.id));
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
        G = w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,
        B = w`
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

  animation: ${G} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${B} 0.15s ease-out forwards;
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
        Z = w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,
        J = j("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${(e) => e.secondary || "#e0e0e0"};
  border-right-color: ${(e) => e.primary || "#616161"};
  animation: ${Z} 1s linear infinite;
`,
        Q = w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,
        U = w`
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
        K = j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${(e) => e.primary || "#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Q} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${U} 0.2s ease-out forwards;
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
        V = j("div")`
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
          let { icon: t, type: r, iconTheme: s } = e;
          return void 0 !== t
            ? "string" == typeof t
              ? n.createElement(et, null, t)
              : t
            : "blank" === r
              ? null
              : n.createElement(
                  X,
                  null,
                  n.createElement(J, { ...s }),
                  "loading" !== r &&
                    n.createElement(
                      V,
                      null,
                      "error" === r
                        ? n.createElement(W, { ...s })
                        : n.createElement(K, { ...s }),
                    ),
                );
        },
        es = (e) => `
0% {transform: translate3d(0,${-200 * e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,
        ea = (e) => `
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
        en = j("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,
        ei = (e, t) => {
          let r = e.includes("top") ? 1 : -1,
            [s, a] = C()
              ? [
                  "0%{opacity:0;} 100%{opacity:1;}",
                  "0%{opacity:1;} 100%{opacity:0;}",
                ]
              : [es(r), ea(r)];
          return {
            animation: t
              ? `${w(s)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`
              : `${w(a)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`,
          };
        },
        el = n.memo(({ toast: e, position: t, style: r, children: s }) => {
          let a = e.height
              ? ei(e.position || t || "top-center", e.visible)
              : { opacity: 0 },
            o = n.createElement(er, { toast: e }),
            i = n.createElement(en, { ...e.ariaProps }, k(e.message, e));
          return n.createElement(
            eo,
            { className: e.className, style: { ...a, ...r, ...e.style } },
            "function" == typeof s
              ? s({ icon: o, message: i })
              : n.createElement(n.Fragment, null, o, i),
          );
        });
      ((o = n.createElement),
        (m.p = void 0),
        (y = o),
        (b = void 0),
        (v = void 0));
      var ec = ({
          id: e,
          className: t,
          style: r,
          onHeightUpdate: s,
          children: a,
        }) => {
          let o = n.useCallback(
            (t) => {
              if (t) {
                let r = () => {
                  s(e, t.getBoundingClientRect().height);
                };
                (r(),
                  new MutationObserver(r).observe(t, {
                    subtree: !0,
                    childList: !0,
                    characterData: !0,
                  }));
              }
            },
            [e, s],
          );
          return n.createElement("div", { ref: o, className: t, style: r }, a);
        },
        ed = (e, t) => {
          let r = e.includes("top"),
            s = e.includes("center")
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
            ...s,
          };
        },
        eu = g`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,
        em = ({
          reverseOrder: e,
          position: t = "top-center",
          toastOptions: r,
          gutter: s,
          children: a,
          toasterId: o,
          containerStyle: i,
          containerClassName: l,
        }) => {
          let { toasts: c, handlers: d } = Y(r, o);
          return n.createElement(
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
                ...i,
              },
              className: l,
              onMouseEnter: d.startPause,
              onMouseLeave: d.endPause,
            },
            c.map((r) => {
              let o = r.position || t,
                i = ed(
                  o,
                  d.calculateOffset(r, {
                    reverseOrder: e,
                    gutter: s,
                    defaultPosition: t,
                  }),
                );
              return n.createElement(
                ec,
                {
                  id: r.id,
                  key: r.id,
                  onHeightUpdate: d.updateHeight,
                  className: r.visible ? eu : "",
                  style: i,
                },
                "custom" === r.type
                  ? k(r.message, r)
                  : a
                    ? a(r)
                    : n.createElement(el, { toast: r, position: o }),
              );
            }),
          );
        },
        ep = L;
    },
  },
  function (e) {
    (e.O(0, [54, 115, 835, 744], function () {
      return e((e.s = 1991));
    }),
      (_N_E = e.O()));
  },
]);

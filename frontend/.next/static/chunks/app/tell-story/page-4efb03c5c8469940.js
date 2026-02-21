(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [972],
  {
    57068: function (e, a, s) {
      "use strict";
      s.d(a, {
        Z: function () {
          return n;
        },
      });
      var t = s(58078),
        r = {
          xmlns: "http://www.w3.org/2000/svg",
          width: 24,
          height: 24,
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        };
      /**
       * @license lucide-react v0.294.0 - ISC
       *
       * This source code is licensed under the ISC license.
       * See the LICENSE file in the root directory of this source tree.
       */ let i = (e) =>
          e
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .toLowerCase()
            .trim(),
        n = (e, a) => {
          let s = (0, t.forwardRef)(
            (
              {
                color: s = "currentColor",
                size: n = 24,
                strokeWidth: l = 2,
                absoluteStrokeWidth: c,
                className: o = "",
                children: d,
                ...m
              },
              x,
            ) =>
              (0, t.createElement)(
                "svg",
                {
                  ref: x,
                  ...r,
                  width: n,
                  height: n,
                  stroke: s,
                  strokeWidth: c ? (24 * Number(l)) / Number(n) : l,
                  className: ["lucide", `lucide-${i(e)}`, o].join(" "),
                  ...m,
                },
                [
                  ...a.map(([e, a]) => (0, t.createElement)(e, a)),
                  ...(Array.isArray(d) ? d : [d]),
                ],
              ),
          );
          return ((s.displayName = `${e}`), s);
        };
    },
    93923: function (e, a, s) {
      Promise.resolve().then(s.bind(s, 8170));
    },
    8170: function (e, a, s) {
      "use strict";
      (s.r(a),
        s.d(a, {
          default: function () {
            return w;
          },
        }));
      var t = s(37821),
        r = s(58078),
        i = s(46179),
        n = s(88060),
        l = s(8361),
        c = s(10808),
        o = s(58265),
        d = s(10360),
        m = s(61970),
        x = s(71255),
        u = s(97485),
        h = s(96871),
        p = s.n(h),
        f = s(54011),
        b = s.n(f),
        y = s(57068);
      /**
       * @license lucide-react v0.294.0 - ISC
       *
       * This source code is licensed under the ISC license.
       * See the LICENSE file in the root directory of this source tree.
       */ let j = (0, y.Z)("Check", [
        ["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }],
      ]);
      function g(e) {
        let { onComplete: a, duration: s = 5e3 } = e,
          [i, n] = (0, r.useState)([
            {
              id: "transcribe",
              label: "Transcribing your story",
              completed: !1,
            },
            {
              id: "extract",
              label: "Extracting key information",
              completed: !1,
            },
            { id: "qr", label: "Preparing QR donation code", completed: !1 },
            {
              id: "gofundme",
              label: "Drafting GoFundMe template",
              completed: !1,
            },
            { id: "finalize", label: "Finalizing your report", completed: !1 },
          ]);
        return (
          (0, r.useEffect)(() => {
            let e = s / i.length;
            i.forEach((s, t) => {
              setTimeout(() => {
                (n((e) =>
                  e.map((e, a) => (a === t ? { ...e, completed: !0 } : e)),
                ),
                  t === i.length - 1 && setTimeout(a, 800));
              }, e * t);
            });
          }, [s, a]),
          (0, t.jsxs)("div", {
            role: "dialog",
            "aria-live": "polite",
            "aria-label": "Processing your story",
            className:
              "jsx-800bca46b4bf46ca fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center z-50",
            children: [
              (0, t.jsxs)("div", {
                className: "jsx-800bca46b4bf46ca max-w-2xl w-full mx-4",
                children: [
                  (0, t.jsx)("div", {
                    className: "jsx-800bca46b4bf46ca relative mb-12",
                    children: (0, t.jsxs)("div", {
                      className:
                        "jsx-800bca46b4bf46ca bg-white shadow-2xl rounded-lg p-12 transform transition-all duration-1000 animate-slide-up",
                      children: [
                        (0, t.jsxs)("div", {
                          className: "jsx-800bca46b4bf46ca space-y-3 mb-8",
                          children: [
                            (0, t.jsx)("div", {
                              style: { animationDelay: "0.2s" },
                              className:
                                "jsx-800bca46b4bf46ca h-4 bg-gray-200 rounded animate-fill-line",
                            }),
                            (0, t.jsx)("div", {
                              style: { animationDelay: "0.4s" },
                              className:
                                "jsx-800bca46b4bf46ca h-4 bg-gray-200 rounded animate-fill-line w-3/4",
                            }),
                          ],
                        }),
                        (0, t.jsx)("div", {
                          className: "jsx-800bca46b4bf46ca space-y-2 mb-8",
                          children: [...Array(8)].map((e, a) =>
                            (0, t.jsx)(
                              "div",
                              {
                                style: {
                                  animationDelay: "".concat(0.6 + 0.1 * a, "s"),
                                  width:
                                    a % 3 == 0
                                      ? "100%"
                                      : a % 3 == 1
                                        ? "95%"
                                        : "90%",
                                },
                                className:
                                  "jsx-800bca46b4bf46ca h-2 bg-gray-100 rounded animate-fill-line",
                              },
                              a,
                            ),
                          ),
                        }),
                        (0, t.jsx)("div", {
                          style: { animationDelay: "1.8s" },
                          className:
                            "jsx-800bca46b4bf46ca h-3 bg-gray-200 rounded animate-fill-line w-1/2",
                        }),
                      ],
                    }),
                  }),
                  (0, t.jsxs)("div", {
                    className:
                      "jsx-800bca46b4bf46ca bg-white rounded-lg shadow-xl p-8",
                    children: [
                      (0, t.jsx)("h2", {
                        className:
                          "jsx-800bca46b4bf46ca text-2xl font-bold text-gray-900 mb-6 text-center",
                        children: "Processing Your Story",
                      }),
                      (0, t.jsx)("div", {
                        className: "jsx-800bca46b4bf46ca space-y-4",
                        children: i.map((e) =>
                          (0, t.jsxs)(
                            "div",
                            {
                              className:
                                "jsx-800bca46b4bf46ca flex items-center gap-4",
                              children: [
                                (0, t.jsx)("div", {
                                  className:
                                    "jsx-800bca46b4bf46ca " +
                                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ".concat(
                                      e.completed
                                        ? "bg-green-500 scale-100"
                                        : "bg-gray-200 scale-90",
                                    ),
                                  children:
                                    e.completed &&
                                    (0, t.jsx)(j, {
                                      className: "text-white",
                                      size: 16,
                                    }),
                                }),
                                (0, t.jsx)("div", {
                                  className: "jsx-800bca46b4bf46ca flex-1",
                                  children: (0, t.jsx)("p", {
                                    className:
                                      "jsx-800bca46b4bf46ca " +
                                      "text-sm font-medium transition-colors duration-300 ".concat(
                                        e.completed
                                          ? "text-green-700"
                                          : "text-gray-500",
                                      ),
                                    children: e.label,
                                  }),
                                }),
                                e.completed &&
                                  (0, t.jsx)("div", {
                                    className:
                                      "jsx-800bca46b4bf46ca flex-shrink-0",
                                    children: (0, t.jsx)("div", {
                                      className:
                                        "jsx-800bca46b4bf46ca h-1 w-8 bg-green-500 rounded animate-check-dash",
                                    }),
                                  }),
                              ],
                            },
                            e.id,
                          ),
                        ),
                      }),
                      (0, t.jsx)("div", {
                        className: "jsx-800bca46b4bf46ca mt-6 text-center",
                        children: (0, t.jsxs)("div", {
                          className: "jsx-800bca46b4bf46ca inline-flex gap-2",
                          children: [
                            (0, t.jsx)("div", {
                              style: { animationDelay: "0s" },
                              className:
                                "jsx-800bca46b4bf46ca w-2 h-2 bg-blue-500 rounded-full animate-bounce",
                            }),
                            (0, t.jsx)("div", {
                              style: { animationDelay: "0.1s" },
                              className:
                                "jsx-800bca46b4bf46ca w-2 h-2 bg-blue-500 rounded-full animate-bounce",
                            }),
                            (0, t.jsx)("div", {
                              style: { animationDelay: "0.2s" },
                              className:
                                "jsx-800bca46b4bf46ca w-2 h-2 bg-blue-500 rounded-full animate-bounce",
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                ],
              }),
              (0, t.jsx)(b(), {
                id: "800bca46b4bf46ca",
                children:
                  "@-webkit-keyframes slide-up{from{opacity:0;-webkit-transform:translatey(20px);transform:translatey(20px)}to{opacity:1;-webkit-transform:translatey(0);transform:translatey(0)}}@-moz-keyframes slide-up{from{opacity:0;-moz-transform:translatey(20px);transform:translatey(20px)}to{opacity:1;-moz-transform:translatey(0);transform:translatey(0)}}@-o-keyframes slide-up{from{opacity:0;-o-transform:translatey(20px);transform:translatey(20px)}to{opacity:1;-o-transform:translatey(0);transform:translatey(0)}}@keyframes slide-up{from{opacity:0;-webkit-transform:translatey(20px);-moz-transform:translatey(20px);-o-transform:translatey(20px);transform:translatey(20px)}to{opacity:1;-webkit-transform:translatey(0);-moz-transform:translatey(0);-o-transform:translatey(0);transform:translatey(0)}}@-webkit-keyframes fill-line{from{width:0;opacity:0}to{width:100%;opacity:1}}@-moz-keyframes fill-line{from{width:0;opacity:0}to{width:100%;opacity:1}}@-o-keyframes fill-line{from{width:0;opacity:0}to{width:100%;opacity:1}}@keyframes fill-line{from{width:0;opacity:0}to{width:100%;opacity:1}}@-webkit-keyframes check-dash{from{width:0}to{width:2rem}}@-moz-keyframes check-dash{from{width:0}to{width:2rem}}@-o-keyframes check-dash{from{width:0}to{width:2rem}}@keyframes check-dash{from{width:0}to{width:2rem}}.animate-slide-up.jsx-800bca46b4bf46ca{-webkit-animation:slide-up.8s ease-out;-moz-animation:slide-up.8s ease-out;-o-animation:slide-up.8s ease-out;animation:slide-up.8s ease-out}.animate-fill-line.jsx-800bca46b4bf46ca{-webkit-animation:fill-line.6s ease-out forwards;-moz-animation:fill-line.6s ease-out forwards;-o-animation:fill-line.6s ease-out forwards;animation:fill-line.6s ease-out forwards;width:0}.animate-check-dash.jsx-800bca46b4bf46ca{-webkit-animation:check-dash.3s ease-out;-moz-animation:check-dash.3s ease-out;-o-animation:check-dash.3s ease-out;animation:check-dash.3s ease-out}",
              }),
            ],
          })
        );
      }
      function w() {
        let [e, a] = (0, r.useState)(!1),
          [s, h] = (0, r.useState)(!1),
          [f, b] = (0, r.useState)(null),
          [y, j] = (0, r.useState)(null),
          [w, N] = (0, r.useState)(0),
          [v, k] = (0, r.useState)(!1),
          [S, C] = (0, r.useState)(!1),
          [P, R] = (0, r.useState)(!0),
          [z, F] = (0, r.useState)(!1),
          [Z, T] = (0, r.useState)(!1),
          [E, D] = (0, r.useState)(!1),
          I = (0, r.useRef)(null),
          A = (0, r.useRef)(null),
          M = (0, r.useRef)(null),
          Y = (0, i.useRouter)();
        (0, r.useEffect)(
          () => () => {
            (M.current && clearInterval(M.current),
              y && URL.revokeObjectURL(y));
          },
          [y],
        );
        let O = async () => {
            try {
              let e = await navigator.mediaDevices.getUserMedia({ audio: !0 }),
                s = new MediaRecorder(e);
              I.current = s;
              let t = [];
              ((s.ondataavailable = (e) => {
                e.data.size > 0 && t.push(e.data);
              }),
                (s.onstop = () => {
                  let a = new Blob(t, { type: "audio/webm" });
                  b(a);
                  let s = URL.createObjectURL(a);
                  (j(s), e.getTracks().forEach((e) => e.stop()));
                }),
                s.start(),
                a(!0),
                N(0),
                (M.current = setInterval(() => {
                  N((e) => e + 1);
                }, 1e3)),
                u.default.success("Recording started!"));
            } catch (e) {
              (console.error("Error starting recording:", e),
                u.default.error(
                  "Could not access microphone. Please check permissions.",
                ));
            }
          },
          L = async () => {
            if (!f) {
              u.default.error("Please record your story first");
              return;
            }
            if (!z) {
              u.default.error("Please give consent to continue");
              return;
            }
            C(!0);
            try {
              let e = await fetch(
                "".concat(
                  "https://api.care2connects.org",
                  "/api/auth/anonymous",
                ),
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                },
              );
              if (!e.ok) throw Error("Failed to create user session");
              let a = await e.json(),
                s = a.data.userId;
              await fetch(
                "".concat(
                  "https://api.care2connects.org",
                  "/api/auth/update-consent",
                ),
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: s,
                    consentGiven: !0,
                    isProfilePublic: Z,
                  }),
                },
              );
              let t = new FormData();
              (t.append("audio", f, "story.webm"), t.append("userId", s));
              let r = await fetch(
                "".concat("https://api.care2connects.org", "/api/transcribe"),
                { method: "POST", body: t },
              );
              if (!r.ok) throw Error("Failed to upload audio");
              let i = await r.json(),
                n = await fetch(
                  "".concat("https://api.care2connects.org", "/api/profile"),
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userId: s,
                      transcript: i.data.transcript,
                      profileData: i.data.profileData,
                      consentGiven: !0,
                      isProfilePublic: Z,
                    }),
                  },
                );
              if (!n.ok) throw Error("Failed to create profile");
              (await n.json(),
                u.default.success(
                  "Your story has been processed successfully!",
                ),
                C(!1),
                D(!0));
            } catch (e) {
              (console.error("Upload error:", e),
                u.default.error(
                  "Failed to process your story. Please try again.",
                ),
                C(!1));
            }
          };
        return P
          ? (0, t.jsx)("div", {
              className: "min-h-screen bg-gray-50 py-12",
              children: (0, t.jsx)("div", {
                className: "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8",
                children: (0, t.jsxs)("div", {
                  className: "bg-white rounded-lg shadow-md p-8",
                  children: [
                    (0, t.jsxs)("div", {
                      className: "text-center mb-8",
                      children: [
                        (0, t.jsx)("h1", {
                          className: "text-3xl font-bold text-gray-900 mb-4",
                          children: "Before We Begin",
                        }),
                        (0, t.jsx)("p", {
                          className: "text-lg text-gray-600",
                          children:
                            "Your privacy and dignity are our top priorities. Please review the following information.",
                        }),
                      ],
                    }),
                    (0, t.jsxs)("div", {
                      className: "space-y-6",
                      children: [
                        (0, t.jsx)("div", {
                          className: "bg-blue-50 rounded-lg p-6",
                          children: (0, t.jsxs)("div", {
                            className: "flex items-start",
                            children: [
                              (0, t.jsx)(n.Z, {
                                className:
                                  "w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0",
                              }),
                              (0, t.jsxs)("div", {
                                children: [
                                  (0, t.jsx)("h3", {
                                    className:
                                      "font-semibold text-blue-900 mb-2",
                                    children: "How Your Story Will Be Used",
                                  }),
                                  (0, t.jsxs)("ul", {
                                    className:
                                      "text-blue-800 space-y-1 text-sm",
                                    children: [
                                      (0, t.jsx)("li", {
                                        children:
                                          "• We'll transcribe your audio recording using secure AI technology",
                                      }),
                                      (0, t.jsx)("li", {
                                        children:
                                          "• Your story helps create a personalized profile with resources and opportunities",
                                      }),
                                      (0, t.jsx)("li", {
                                        children:
                                          "• You control who can see your profile and information",
                                      }),
                                      (0, t.jsx)("li", {
                                        children:
                                          "• You can delete your story and profile at any time",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                        (0, t.jsxs)("div", {
                          className: "space-y-4",
                          children: [
                            (0, t.jsxs)("div", {
                              className: "flex items-start",
                              children: [
                                (0, t.jsx)("input", {
                                  type: "checkbox",
                                  id: "consent",
                                  checked: z,
                                  onChange: (e) => F(e.target.checked),
                                  className:
                                    "mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded",
                                }),
                                (0, t.jsxs)("label", {
                                  htmlFor: "consent",
                                  className: "text-gray-700",
                                  children: [
                                    (0, t.jsx)("span", {
                                      className: "font-medium",
                                      children: "I consent to sharing my story",
                                    }),
                                    " and understand that:",
                                    (0, t.jsxs)("ul", {
                                      className:
                                        "mt-2 text-sm text-gray-600 space-y-1",
                                      children: [
                                        (0, t.jsx)("li", {
                                          children:
                                            "• My audio will be processed to create a text transcript",
                                        }),
                                        (0, t.jsx)("li", {
                                          children:
                                            "• AI will help extract key information to create my profile",
                                        }),
                                        (0, t.jsx)("li", {
                                          children:
                                            "• My information will be stored securely and encrypted",
                                        }),
                                        (0, t.jsx)("li", {
                                          children:
                                            "• I retain full control over my data and can delete it anytime",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, t.jsxs)("div", {
                              className: "flex items-start",
                              children: [
                                (0, t.jsx)("input", {
                                  type: "checkbox",
                                  id: "public",
                                  checked: Z,
                                  onChange: (e) => T(e.target.checked),
                                  className:
                                    "mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded",
                                }),
                                (0, t.jsxs)("label", {
                                  htmlFor: "public",
                                  className: "text-gray-700",
                                  children: [
                                    (0, t.jsx)("span", {
                                      className: "font-medium",
                                      children: "Make my profile public",
                                    }),
                                    " (optional)",
                                    (0, t.jsx)("p", {
                                      className: "mt-1 text-sm text-gray-600",
                                      children:
                                        "Allow others to view my story and profile. This helps potential donors and supporters find me, but you can change this setting anytime.",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, t.jsxs)("div", {
                          className: "flex justify-between pt-6",
                          children: [
                            (0, t.jsxs)(p(), {
                              href: "/",
                              className: "btn-ghost flex items-center",
                              children: [
                                (0, t.jsx)(l.Z, { className: "w-4 h-4 mr-2" }),
                                "Back to Home",
                              ],
                            }),
                            (0, t.jsx)("button", {
                              onClick: () => R(!1),
                              disabled: !z,
                              className:
                                "btn-primary disabled:opacity-50 disabled:cursor-not-allowed",
                              children: "Continue to Recording",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            })
          : (0, t.jsx)("div", {
              className: "min-h-screen bg-gray-50 py-12",
              children: (0, t.jsxs)("div", {
                className: "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8",
                children: [
                  (0, t.jsxs)("div", {
                    className: "bg-white rounded-lg shadow-md p-8",
                    children: [
                      (0, t.jsxs)("div", {
                        className: "text-center mb-8",
                        children: [
                          (0, t.jsx)("h1", {
                            className: "text-3xl font-bold text-gray-900 mb-4",
                            children: "Tell Your Story",
                          }),
                          (0, t.jsx)("p", {
                            className: "text-lg text-gray-600",
                            children:
                              "Share your experiences, skills, and dreams. Your story matters and helps us connect you with the right resources and opportunities.",
                          }),
                          (0, t.jsxs)("div", {
                            className:
                              "mt-4 flex flex-wrap items-center justify-center gap-2 text-sm",
                            children: [
                              (0, t.jsxs)("div", {
                                className:
                                  "inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full",
                                children: [
                                  (0, t.jsx)(c.Z, { className: "w-4 h-4" }),
                                  (0, t.jsx)("span", {
                                    children: "AI Transcription",
                                  }),
                                ],
                              }),
                              (0, t.jsxs)("div", {
                                className:
                                  "inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full",
                                children: [
                                  (0, t.jsx)(c.Z, { className: "w-4 h-4" }),
                                  (0, t.jsx)("span", {
                                    children: "Multi-Language Support",
                                  }),
                                ],
                              }),
                              (0, t.jsxs)("div", {
                                className:
                                  "inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full",
                                children: [
                                  (0, t.jsx)(c.Z, { className: "w-4 h-4" }),
                                  (0, t.jsx)("span", {
                                    children: "Auto Profile Creation",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, t.jsxs)("div", {
                        className: "text-center space-y-6",
                        children: [
                          (0, t.jsx)("div", {
                            className: "h-32 flex items-center justify-center",
                            children: e
                              ? (0, t.jsxs)("div", {
                                  className: "flex items-center space-x-2",
                                  children: [
                                    (0, t.jsx)("div", {
                                      className:
                                        "recording-pulse w-16 h-16 bg-red-500 rounded-full flex items-center justify-center",
                                      children: (0, t.jsx)(o.Z, {
                                        className: "w-8 h-8 text-white",
                                      }),
                                    }),
                                    (0, t.jsx)("div", {
                                      className: "audio-visualizer",
                                      children: [...Array(8)].map((e, a) =>
                                        (0, t.jsx)(
                                          "div",
                                          {
                                            className: "audio-bar",
                                            style: {
                                              animationDelay: "".concat(
                                                0.1 * a,
                                                "s",
                                              ),
                                            },
                                          },
                                          a,
                                        ),
                                      ),
                                    }),
                                  ],
                                })
                              : f
                                ? (0, t.jsx)("div", {
                                    className:
                                      "w-16 h-16 bg-green-500 rounded-full flex items-center justify-center",
                                    children: (0, t.jsx)(c.Z, {
                                      className: "w-8 h-8 text-white",
                                    }),
                                  })
                                : (0, t.jsx)("div", {
                                    className:
                                      "w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center",
                                    children: (0, t.jsx)(o.Z, {
                                      className: "w-8 h-8 text-gray-600",
                                    }),
                                  }),
                          }),
                          (0, t.jsx)("div", {
                            className: "text-2xl font-mono text-gray-700",
                            children: ""
                              .concat(Math.floor(w / 60), ":")
                              .concat((w % 60).toString().padStart(2, "0")),
                          }),
                          (0, t.jsx)("div", {
                            className: "text-center",
                            children: e
                              ? (0, t.jsx)("p", {
                                  className: "text-red-600 font-medium",
                                  children: s
                                    ? "Recording Paused"
                                    : "Recording...",
                                })
                              : f
                                ? (0, t.jsx)("p", {
                                    className: "text-green-600 font-medium",
                                    children: "Recording Complete",
                                  })
                                : (0, t.jsx)("p", {
                                    className: "text-gray-600",
                                    children: "Ready to record",
                                  }),
                          }),
                          (0, t.jsxs)("div", {
                            className: "flex justify-center space-x-4",
                            children: [
                              !e &&
                                !f &&
                                (0, t.jsxs)("button", {
                                  onClick: O,
                                  className:
                                    "btn-primary flex items-center space-x-2",
                                  children: [
                                    (0, t.jsx)(o.Z, { className: "w-5 h-5" }),
                                    (0, t.jsx)("span", {
                                      children: "Start Recording",
                                    }),
                                  ],
                                }),
                              e &&
                                (0, t.jsxs)(t.Fragment, {
                                  children: [
                                    (0, t.jsx)("button", {
                                      onClick: () => {
                                        I.current &&
                                          e &&
                                          (s
                                            ? (I.current.resume(),
                                              h(!1),
                                              (M.current = setInterval(() => {
                                                N((e) => e + 1);
                                              }, 1e3)))
                                            : (I.current.pause(),
                                              h(!0),
                                              M.current &&
                                                clearInterval(M.current)));
                                      },
                                      className:
                                        "btn-secondary flex items-center space-x-2",
                                      children: s
                                        ? (0, t.jsxs)(t.Fragment, {
                                            children: [
                                              (0, t.jsx)(d.Z, {
                                                className: "w-5 h-5",
                                              }),
                                              (0, t.jsx)("span", {
                                                children: "Resume",
                                              }),
                                            ],
                                          })
                                        : (0, t.jsxs)(t.Fragment, {
                                            children: [
                                              (0, t.jsx)(m.Z, {
                                                className: "w-5 h-5",
                                              }),
                                              (0, t.jsx)("span", {
                                                children: "Pause",
                                              }),
                                            ],
                                          }),
                                    }),
                                    (0, t.jsxs)("button", {
                                      onClick: () => {
                                        I.current &&
                                          e &&
                                          (I.current.stop(),
                                          a(!1),
                                          h(!1),
                                          M.current && clearInterval(M.current),
                                          u.default.success(
                                            "Recording completed!",
                                          ));
                                      },
                                      className:
                                        "btn-outline flex items-center space-x-2",
                                      children: [
                                        (0, t.jsx)(x.Z, {
                                          className: "w-5 h-5",
                                        }),
                                        (0, t.jsx)("span", {
                                          children: "Stop",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              f &&
                                (0, t.jsxs)(t.Fragment, {
                                  children: [
                                    (0, t.jsx)("button", {
                                      onClick: () => {
                                        A.current &&
                                          (v
                                            ? (A.current.pause(), k(!1))
                                            : (A.current.play(), k(!0)));
                                      },
                                      className:
                                        "btn-secondary flex items-center space-x-2",
                                      children: v
                                        ? (0, t.jsxs)(t.Fragment, {
                                            children: [
                                              (0, t.jsx)(m.Z, {
                                                className: "w-5 h-5",
                                              }),
                                              (0, t.jsx)("span", {
                                                children: "Pause",
                                              }),
                                            ],
                                          })
                                        : (0, t.jsxs)(t.Fragment, {
                                            children: [
                                              (0, t.jsx)(d.Z, {
                                                className: "w-5 h-5",
                                              }),
                                              (0, t.jsx)("span", {
                                                children: "Play",
                                              }),
                                            ],
                                          }),
                                    }),
                                    (0, t.jsx)("button", {
                                      onClick: () => {
                                        (b(null), j(null), N(0), k(!1));
                                      },
                                      className: "btn-ghost",
                                      children: "Record Again",
                                    }),
                                  ],
                                }),
                            ],
                          }),
                          y &&
                            (0, t.jsx)("audio", {
                              ref: A,
                              src: y,
                              onEnded: () => k(!1),
                              className: "hidden",
                            }),
                          f &&
                            (0, t.jsxs)("div", {
                              className: "pt-8 border-t border-gray-200",
                              children: [
                                (0, t.jsx)("button", {
                                  onClick: L,
                                  disabled: S,
                                  className:
                                    "btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed",
                                  children: S
                                    ? (0, t.jsxs)(t.Fragment, {
                                        children: [
                                          (0, t.jsx)("div", {
                                            className: "spinner mr-2",
                                          }),
                                          "Processing Your Story...",
                                        ],
                                      })
                                    : "Create My Profile",
                                }),
                                (0, t.jsx)("p", {
                                  className: "text-sm text-gray-500 mt-2",
                                  children:
                                    "This will transcribe your audio and create your personalized profile",
                                }),
                              ],
                            }),
                        ],
                      }),
                      (0, t.jsxs)("div", {
                        className: "mt-12 bg-gray-50 rounded-lg p-6",
                        children: [
                          (0, t.jsx)("h3", {
                            className: "font-semibold mb-3",
                            children: "Recording Tips:",
                          }),
                          (0, t.jsxs)("ul", {
                            className: "text-sm text-gray-600 space-y-1",
                            children: [
                              (0, t.jsx)("li", {
                                children:
                                  "• Find a quiet place with minimal background noise",
                              }),
                              (0, t.jsx)("li", {
                                children:
                                  "• Speak clearly and at a normal pace",
                              }),
                              (0, t.jsx)("li", {
                                children:
                                  "• Share your experiences, skills, goals, and current needs",
                              }),
                              (0, t.jsx)("li", {
                                children:
                                  "• Mention any job history, talents, or things you're good at",
                              }),
                              (0, t.jsx)("li", {
                                children:
                                  "• Don't worry about being perfect - just be yourself",
                              }),
                              (0, t.jsx)("li", {
                                children:
                                  "• You can pause and resume anytime, or start over if needed",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  E &&
                    (0, t.jsx)(g, {
                      onComplete: () => {
                        Y.push("/gfm/extract");
                      },
                      duration: 5e3,
                    }),
                ],
              }),
            });
      }
    },
  },
  function (e) {
    (e.O(0, [54, 317, 115, 835, 744], function () {
      return e((e.s = 93923));
    }),
      (_N_E = e.O()));
  },
]);

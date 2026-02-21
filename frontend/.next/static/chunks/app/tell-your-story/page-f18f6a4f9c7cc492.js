(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [235],
  {
    50037: function (e, a, s) {
      Promise.resolve().then(s.bind(s, 88143));
    },
    88143: function (e, a, s) {
      "use strict";
      (s.r(a),
        s.d(a, {
          default: function () {
            return v;
          },
        }));
      var t = s(37821),
        r = s(54011),
        l = s.n(r),
        n = s(58078),
        c = s(46179),
        i = s(88060),
        o = s(8361);
      let d = n.forwardRef(function ({ title: e, titleId: a, ...s }, t) {
        return n.createElement(
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
              ref: t,
              "aria-labelledby": a,
            },
            s,
          ),
          e ? n.createElement("title", { id: a }, e) : null,
          n.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z",
          }),
        );
      });
      var x = s(58265),
        u = s(24012),
        m = s(54231),
        h = s(10808),
        j = s(10360),
        b = s(61970),
        p = s(71255),
        g = s(97485),
        f = s(96871),
        y = s.n(f);
      let N = () => {
        {
          let e = window.location.hostname;
          if ("localhost" === e || "127.0.0.1" === e)
            return "http://localhost:3003";
        }
        return "https://api.care2connects.org";
      };
      function v() {
        let [e, a] = (0, n.useState)(!1),
          [s, r] = (0, n.useState)(!1),
          [f, v] = (0, n.useState)(null),
          [w, k] = (0, n.useState)(null),
          [R, C] = (0, n.useState)(0),
          [Z, S] = (0, n.useState)(!1),
          [E, M] = (0, n.useState)(!0),
          [F, A] = (0, n.useState)(!1),
          [L, P] = (0, n.useState)(!1),
          [I, T] = (0, n.useState)(!1),
          [G, B] = (0, n.useState)(null),
          [D, O] = (0, n.useState)(""),
          [U, Y] = (0, n.useState)(0),
          [z, H] = (0, n.useState)(""),
          [Q, W] = (0, n.useState)(""),
          [_, q] = (0, n.useState)(""),
          [J, V] = (0, n.useState)("en"),
          K = (0, n.useRef)(null),
          X = (0, n.useRef)(null),
          $ = (0, n.useRef)(null),
          ee = (0, n.useRef)(null),
          ea = (0, c.useRouter)();
        (0, n.useEffect)(
          () => () => {
            ($.current && clearInterval($.current),
              ee.current && clearInterval(ee.current),
              w && URL.revokeObjectURL(w));
          },
          [w],
        );
        let es = async () => {
            try {
              let e = await navigator.mediaDevices.getUserMedia({ audio: !0 }),
                s = new MediaRecorder(e);
              K.current = s;
              let t = [];
              ((s.ondataavailable = (e) => {
                e.data.size > 0 && t.push(e.data);
              }),
                (s.onstop = () => {
                  let a = new Blob(t, { type: "audio/webm" });
                  v(a);
                  let s = URL.createObjectURL(a);
                  (k(s), e.getTracks().forEach((e) => e.stop()));
                }),
                s.start(),
                a(!0),
                C(0),
                ($.current = setInterval(() => {
                  C((e) => e + 1);
                }, 1e3)),
                g.default.success("Recording started!"));
            } catch (e) {
              (console.error("Error starting recording:", e),
                g.default.error(
                  "Could not access microphone. Please check permissions.",
                ));
            }
          },
          et = async () => {
            if (!f) {
              g.default.error("Please record your story first");
              return;
            }
            if (!F) {
              g.default.error("Please give consent to continue");
              return;
            }
            (T(!0), O("Creating your profile..."), Y(0));
            try {
              let e = N(),
                a = await fetch("".concat(e, "/api/story/start"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: z || null,
                    age: Q || null,
                    location: _ || null,
                    language: J,
                  }),
                });
              if (!a.ok) throw Error("Failed to start story processing");
              let s = await a.json(),
                t = s.ticketId;
              (B(t), O("Uploading your recording..."), Y(10));
              let r = new FormData();
              (r.append("audio", f, "story.webm"), r.append("language", J));
              let l = await fetch(
                "".concat(e, "/api/story/").concat(t, "/upload"),
                { method: "POST", body: r },
              );
              if (!l.ok) throw Error("Failed to upload audio");
              (Y(20),
                er(t),
                g.default.success(
                  "Processing started! This may take a few moments...",
                ));
            } catch (e) {
              (console.error("Upload error:", e),
                g.default.error(
                  "Failed to process your story. Please try again.",
                ),
                T(!1),
                O(""),
                Y(0));
            }
          },
          er = (e) => {
            let a = N();
            ee.current = setInterval(async () => {
              try {
                let s = await fetch(
                  "".concat(a, "/api/story/").concat(e, "/status"),
                );
                if (!s.ok) throw Error("Failed to fetch status");
                let t = await s.json();
                (O(el(t.status)),
                  Y(t.progress),
                  "COMPLETED" === t.status &&
                    (ee.current && clearInterval(ee.current),
                    O("All done!"),
                    Y(100),
                    setTimeout(() => {
                      ea.push("/profile/".concat(e));
                    }, 1500)),
                  "FAILED" === t.status &&
                    (ee.current && clearInterval(ee.current),
                    g.default.error("Processing failed. Please try again."),
                    T(!1),
                    O(""),
                    Y(0)));
              } catch (e) {
                console.error("Status polling error:", e);
              }
            }, 2e3);
          },
          el = (e) =>
            ({
              CREATED: "Initializing...",
              UPLOADING: "Uploading your recording...",
              TRANSCRIBING: "Transcribing your story...",
              ANALYZING: "Analyzing and extracting details...",
              GENERATING_QR: "Generating your QR code...",
              GENERATING_DOC: "Creating your GoFundMe draft...",
              COMPLETED: "All done!",
              FAILED: "Processing failed",
            })[e] || "Processing...";
        return E
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
                              (0, t.jsx)(i.Z, {
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
                                          "• Your story helps create a personalized profile with QR code and GoFundMe draft",
                                      }),
                                      (0, t.jsx)("li", {
                                        children:
                                          "• You control who can see your profile and information",
                                      }),
                                      (0, t.jsx)("li", {
                                        children:
                                          "• You can access your profile anytime with your unique ID",
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
                                  checked: F,
                                  onChange: (e) => A(e.target.checked),
                                  className:
                                    "mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded",
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
                                            "• A QR code and GoFundMe draft will be generated for me",
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
                                  checked: L,
                                  onChange: (e) => P(e.target.checked),
                                  className:
                                    "mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded",
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
                                        "Allow others to view my story and profile. This helps potential donors and supporters find me.",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, t.jsxs)("div", {
                          className: "space-y-4 pt-6 border-t",
                          children: [
                            (0, t.jsx)("h3", {
                              className: "font-semibold text-gray-900",
                              children:
                                "Tell us a bit about yourself (optional)",
                            }),
                            (0, t.jsxs)("div", {
                              className: "grid grid-cols-1 gap-4",
                              children: [
                                (0, t.jsxs)("div", {
                                  children: [
                                    (0, t.jsx)("label", {
                                      htmlFor: "name",
                                      className:
                                        "block text-sm font-medium text-gray-700 mb-1",
                                      children: "Name",
                                    }),
                                    (0, t.jsx)("input", {
                                      type: "text",
                                      id: "name",
                                      value: z,
                                      onChange: (e) => H(e.target.value),
                                      placeholder: "Your name",
                                      className:
                                        "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
                                    }),
                                  ],
                                }),
                                (0, t.jsxs)("div", {
                                  className: "grid grid-cols-2 gap-4",
                                  children: [
                                    (0, t.jsxs)("div", {
                                      children: [
                                        (0, t.jsx)("label", {
                                          htmlFor: "age",
                                          className:
                                            "block text-sm font-medium text-gray-700 mb-1",
                                          children: "Age",
                                        }),
                                        (0, t.jsx)("input", {
                                          type: "number",
                                          id: "age",
                                          value: Q,
                                          onChange: (e) => W(e.target.value),
                                          placeholder: "Age",
                                          className:
                                            "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
                                        }),
                                      ],
                                    }),
                                    (0, t.jsxs)("div", {
                                      children: [
                                        (0, t.jsx)("label", {
                                          htmlFor: "location",
                                          className:
                                            "block text-sm font-medium text-gray-700 mb-1",
                                          children: "Location",
                                        }),
                                        (0, t.jsx)("input", {
                                          type: "text",
                                          id: "location",
                                          value: _,
                                          onChange: (e) => q(e.target.value),
                                          placeholder: "City, State",
                                          className:
                                            "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                (0, t.jsxs)("div", {
                                  children: [
                                    (0, t.jsx)("label", {
                                      htmlFor: "language",
                                      className:
                                        "block text-sm font-medium text-gray-700 mb-1",
                                      children: "Language",
                                    }),
                                    (0, t.jsxs)("select", {
                                      id: "language",
                                      value: J,
                                      onChange: (e) => V(e.target.value),
                                      className:
                                        "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
                                      children: [
                                        (0, t.jsx)("option", {
                                          value: "auto",
                                          children: "Auto-detect",
                                        }),
                                        (0, t.jsx)("option", {
                                          value: "en",
                                          children: "English",
                                        }),
                                        (0, t.jsx)("option", {
                                          value: "es",
                                          children: "Spanish",
                                        }),
                                        (0, t.jsx)("option", {
                                          value: "fr",
                                          children: "French",
                                        }),
                                        (0, t.jsx)("option", {
                                          value: "de",
                                          children: "German",
                                        }),
                                        (0, t.jsx)("option", {
                                          value: "zh",
                                          children: "Chinese",
                                        }),
                                        (0, t.jsx)("option", {
                                          value: "ja",
                                          children: "Japanese",
                                        }),
                                        (0, t.jsx)("option", {
                                          value: "ko",
                                          children: "Korean",
                                        }),
                                        (0, t.jsx)("option", {
                                          value: "pt",
                                          children: "Portuguese",
                                        }),
                                        (0, t.jsx)("option", {
                                          value: "ru",
                                          children: "Russian",
                                        }),
                                        (0, t.jsx)("option", {
                                          value: "ar",
                                          children: "Arabic",
                                        }),
                                        (0, t.jsx)("option", {
                                          value: "hi",
                                          children: "Hindi",
                                        }),
                                      ],
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
                            (0, t.jsxs)(y(), {
                              href: "/",
                              className:
                                "inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition",
                              children: [
                                (0, t.jsx)(o.Z, { className: "w-4 h-4 mr-2" }),
                                "Back to Home",
                              ],
                            }),
                            (0, t.jsx)("button", {
                              onClick: () => M(!1),
                              disabled: !F,
                              className:
                                "px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition",
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
          : I
            ? (0, t.jsx)("div", {
                className:
                  "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4",
                children: (0, t.jsx)("div", {
                  className: "max-w-lg w-full",
                  children: (0, t.jsxs)("div", {
                    className:
                      "bg-white rounded-2xl shadow-2xl p-12 text-center",
                    children: [
                      (0, t.jsxs)("div", {
                        className: "mb-8 relative",
                        children: [
                          (0, t.jsx)("div", {
                            className:
                              "absolute inset-0 flex items-center justify-center",
                            children: (0, t.jsx)("div", {
                              className:
                                "w-32 h-32 bg-blue-100 rounded-full animate-ping opacity-20",
                            }),
                          }),
                          (0, t.jsx)("div", {
                            className:
                              "relative flex items-center justify-center",
                            children: (0, t.jsx)("div", {
                              className:
                                "w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse",
                              children: (0, t.jsx)(d, {
                                className: "w-12 h-12 text-white",
                              }),
                            }),
                          }),
                        ],
                      }),
                      (0, t.jsx)("h2", {
                        className: "text-3xl font-bold text-gray-900 mb-4",
                        children: "Processing Your Story",
                      }),
                      (0, t.jsx)("p", {
                        className: "text-lg text-gray-600 mb-8",
                        children: D,
                      }),
                      (0, t.jsx)("div", {
                        className: "w-full bg-gray-200 rounded-full h-3 mb-4",
                        children: (0, t.jsx)("div", {
                          className:
                            "bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500",
                          style: { width: "".concat(U, "%") },
                        }),
                      }),
                      (0, t.jsxs)("p", {
                        className: "text-sm text-gray-500",
                        children: [U, "% complete"],
                      }),
                      (0, t.jsxs)("div", {
                        className: "mt-8 grid grid-cols-4 gap-2 text-xs",
                        children: [
                          (0, t.jsxs)("div", {
                            className: "flex flex-col items-center ".concat(
                              U >= 10 ? "text-blue-600" : "text-gray-400",
                            ),
                            children: [
                              (0, t.jsx)(x.Z, { className: "w-6 h-6 mb-1" }),
                              (0, t.jsx)("span", { children: "Upload" }),
                            ],
                          }),
                          (0, t.jsxs)("div", {
                            className: "flex flex-col items-center ".concat(
                              U >= 40 ? "text-blue-600" : "text-gray-400",
                            ),
                            children: [
                              (0, t.jsx)(u.Z, { className: "w-6 h-6 mb-1" }),
                              (0, t.jsx)("span", { children: "Transcribe" }),
                            ],
                          }),
                          (0, t.jsxs)("div", {
                            className: "flex flex-col items-center ".concat(
                              U >= 70 ? "text-blue-600" : "text-gray-400",
                            ),
                            children: [
                              (0, t.jsx)(m.Z, { className: "w-6 h-6 mb-1" }),
                              (0, t.jsx)("span", { children: "QR Code" }),
                            ],
                          }),
                          (0, t.jsxs)("div", {
                            className: "flex flex-col items-center ".concat(
                              U >= 90 ? "text-blue-600" : "text-gray-400",
                            ),
                            children: [
                              (0, t.jsx)(u.Z, { className: "w-6 h-6 mb-1" }),
                              (0, t.jsx)("span", { children: "Document" }),
                            ],
                          }),
                        ],
                      }),
                      (0, t.jsx)("div", {
                        className: "mt-8 p-4 bg-blue-50 rounded-lg",
                        children: (0, t.jsxs)("p", {
                          className: "text-sm text-blue-800",
                          children: [
                            (0, t.jsx)("strong", { children: "Hang tight!" }),
                            " We're creating your profile, QR code, and GoFundMe draft document.",
                          ],
                        }),
                      }),
                    ],
                  }),
                }),
              })
            : (0, t.jsxs)("div", {
                className: "jsx-a9a0ace15b22e2a3 min-h-screen bg-gray-50 py-12",
                children: [
                  (0, t.jsx)("div", {
                    className:
                      "jsx-a9a0ace15b22e2a3 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8",
                    children: (0, t.jsxs)("div", {
                      className:
                        "jsx-a9a0ace15b22e2a3 bg-white rounded-lg shadow-md p-8",
                      children: [
                        (0, t.jsxs)("div", {
                          className: "jsx-a9a0ace15b22e2a3 text-center mb-8",
                          children: [
                            (0, t.jsx)("h1", {
                              className:
                                "jsx-a9a0ace15b22e2a3 text-3xl font-bold text-gray-900 mb-4",
                              children: "Tell Your Story",
                            }),
                            (0, t.jsx)("p", {
                              className:
                                "jsx-a9a0ace15b22e2a3 text-lg text-gray-600",
                              children:
                                "Share your experiences, skills, and dreams. Your story matters and helps us create your personalized support profile.",
                            }),
                            (0, t.jsxs)("div", {
                              className:
                                "jsx-a9a0ace15b22e2a3 mt-4 flex flex-wrap items-center justify-center gap-2 text-sm",
                              children: [
                                (0, t.jsxs)("div", {
                                  className:
                                    "jsx-a9a0ace15b22e2a3 inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full",
                                  children: [
                                    (0, t.jsx)(h.Z, { className: "w-4 h-4" }),
                                    (0, t.jsx)("span", {
                                      className: "jsx-a9a0ace15b22e2a3",
                                      children: "AI Transcription",
                                    }),
                                  ],
                                }),
                                (0, t.jsxs)("div", {
                                  className:
                                    "jsx-a9a0ace15b22e2a3 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full",
                                  children: [
                                    (0, t.jsx)(h.Z, { className: "w-4 h-4" }),
                                    (0, t.jsx)("span", {
                                      className: "jsx-a9a0ace15b22e2a3",
                                      children: "QR Code Generated",
                                    }),
                                  ],
                                }),
                                (0, t.jsxs)("div", {
                                  className:
                                    "jsx-a9a0ace15b22e2a3 inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full",
                                  children: [
                                    (0, t.jsx)(h.Z, { className: "w-4 h-4" }),
                                    (0, t.jsx)("span", {
                                      className: "jsx-a9a0ace15b22e2a3",
                                      children: "GoFundMe Draft",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, t.jsxs)("div", {
                          className:
                            "jsx-a9a0ace15b22e2a3 text-center space-y-6",
                          children: [
                            (0, t.jsx)("div", {
                              className:
                                "jsx-a9a0ace15b22e2a3 h-32 flex items-center justify-center",
                              children: e
                                ? (0, t.jsxs)("div", {
                                    className:
                                      "jsx-a9a0ace15b22e2a3 flex items-center space-x-4",
                                    children: [
                                      (0, t.jsxs)("div", {
                                        className:
                                          "jsx-a9a0ace15b22e2a3 relative w-16 h-16 bg-red-500 rounded-full flex items-center justify-center",
                                        children: [
                                          (0, t.jsx)("div", {
                                            className:
                                              "jsx-a9a0ace15b22e2a3 absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75",
                                          }),
                                          (0, t.jsx)(x.Z, {
                                            className:
                                              "w-8 h-8 text-white relative z-10",
                                          }),
                                        ],
                                      }),
                                      (0, t.jsx)("div", {
                                        className:
                                          "jsx-a9a0ace15b22e2a3 flex items-end space-x-1 h-12",
                                        children: [...Array(8)].map((e, a) =>
                                          (0, t.jsx)(
                                            "div",
                                            {
                                              style: {
                                                animation:
                                                  "audioBar 0.8s ease-in-out ".concat(
                                                    0.1 * a,
                                                    "s infinite",
                                                  ),
                                                height: "50%",
                                              },
                                              className:
                                                "jsx-a9a0ace15b22e2a3 w-2 bg-red-500 rounded-full",
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
                                        "jsx-a9a0ace15b22e2a3 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center",
                                      children: (0, t.jsx)(h.Z, {
                                        className: "w-8 h-8 text-white",
                                      }),
                                    })
                                  : (0, t.jsx)("div", {
                                      className:
                                        "jsx-a9a0ace15b22e2a3 w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center",
                                      children: (0, t.jsx)(x.Z, {
                                        className: "w-8 h-8 text-gray-600",
                                      }),
                                    }),
                            }),
                            (0, t.jsx)("div", {
                              className:
                                "jsx-a9a0ace15b22e2a3 text-3xl font-mono text-gray-700",
                              children: ""
                                .concat(Math.floor(R / 60), ":")
                                .concat((R % 60).toString().padStart(2, "0")),
                            }),
                            (0, t.jsx)("div", {
                              className: "jsx-a9a0ace15b22e2a3 text-center",
                              children: e
                                ? (0, t.jsx)("p", {
                                    className:
                                      "jsx-a9a0ace15b22e2a3 text-red-600 font-medium",
                                    children: s
                                      ? "Recording Paused"
                                      : "Recording...",
                                  })
                                : f
                                  ? (0, t.jsx)("p", {
                                      className:
                                        "jsx-a9a0ace15b22e2a3 text-green-600 font-medium",
                                      children: "Recording Complete ✓",
                                    })
                                  : (0, t.jsx)("p", {
                                      className:
                                        "jsx-a9a0ace15b22e2a3 text-gray-600",
                                      children: "Ready to record",
                                    }),
                            }),
                            (0, t.jsxs)("div", {
                              className:
                                "jsx-a9a0ace15b22e2a3 flex justify-center space-x-4",
                              children: [
                                !e &&
                                  !f &&
                                  (0, t.jsxs)("button", {
                                    onClick: es,
                                    className:
                                      "jsx-a9a0ace15b22e2a3 inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition shadow-lg",
                                    children: [
                                      (0, t.jsx)(x.Z, {
                                        className: "w-5 h-5 mr-2",
                                      }),
                                      (0, t.jsx)("span", {
                                        className: "jsx-a9a0ace15b22e2a3",
                                        children: "Start Recording",
                                      }),
                                    ],
                                  }),
                                e &&
                                  (0, t.jsxs)(t.Fragment, {
                                    children: [
                                      (0, t.jsx)("button", {
                                        onClick: () => {
                                          K.current &&
                                            e &&
                                            (s
                                              ? (K.current.resume(),
                                                r(!1),
                                                ($.current = setInterval(() => {
                                                  C((e) => e + 1);
                                                }, 1e3)))
                                              : (K.current.pause(),
                                                r(!0),
                                                $.current &&
                                                  clearInterval($.current)));
                                        },
                                        className:
                                          "jsx-a9a0ace15b22e2a3 inline-flex items-center px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition",
                                        children: s
                                          ? (0, t.jsxs)(t.Fragment, {
                                              children: [
                                                (0, t.jsx)(j.Z, {
                                                  className: "w-5 h-5 mr-2",
                                                }),
                                                (0, t.jsx)("span", {
                                                  className:
                                                    "jsx-a9a0ace15b22e2a3",
                                                  children: "Resume",
                                                }),
                                              ],
                                            })
                                          : (0, t.jsxs)(t.Fragment, {
                                              children: [
                                                (0, t.jsx)(b.Z, {
                                                  className: "w-5 h-5 mr-2",
                                                }),
                                                (0, t.jsx)("span", {
                                                  className:
                                                    "jsx-a9a0ace15b22e2a3",
                                                  children: "Pause",
                                                }),
                                              ],
                                            }),
                                      }),
                                      (0, t.jsxs)("button", {
                                        onClick: () => {
                                          K.current &&
                                            e &&
                                            (K.current.stop(),
                                            a(!1),
                                            r(!1),
                                            $.current &&
                                              clearInterval($.current),
                                            g.default.success(
                                              "Recording completed!",
                                            ));
                                        },
                                        className:
                                          "jsx-a9a0ace15b22e2a3 inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition",
                                        children: [
                                          (0, t.jsx)(p.Z, {
                                            className: "w-5 h-5 mr-2",
                                          }),
                                          (0, t.jsx)("span", {
                                            className: "jsx-a9a0ace15b22e2a3",
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
                                          X.current &&
                                            (Z
                                              ? (X.current.pause(), S(!1))
                                              : (X.current.play(), S(!0)));
                                        },
                                        className:
                                          "jsx-a9a0ace15b22e2a3 inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition",
                                        children: Z
                                          ? (0, t.jsxs)(t.Fragment, {
                                              children: [
                                                (0, t.jsx)(b.Z, {
                                                  className: "w-5 h-5 mr-2",
                                                }),
                                                (0, t.jsx)("span", {
                                                  className:
                                                    "jsx-a9a0ace15b22e2a3",
                                                  children: "Pause Playback",
                                                }),
                                              ],
                                            })
                                          : (0, t.jsxs)(t.Fragment, {
                                              children: [
                                                (0, t.jsx)(j.Z, {
                                                  className: "w-5 h-5 mr-2",
                                                }),
                                                (0, t.jsx)("span", {
                                                  className:
                                                    "jsx-a9a0ace15b22e2a3",
                                                  children: "Play Recording",
                                                }),
                                              ],
                                            }),
                                      }),
                                      (0, t.jsx)("button", {
                                        onClick: () => {
                                          (v(null), k(null), C(0), S(!1));
                                        },
                                        className:
                                          "jsx-a9a0ace15b22e2a3 inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition",
                                        children: "Record Again",
                                      }),
                                    ],
                                  }),
                              ],
                            }),
                            w &&
                              (0, t.jsx)("audio", {
                                ref: X,
                                src: w,
                                onEnded: () => S(!1),
                                className: "jsx-a9a0ace15b22e2a3 hidden",
                              }),
                            f &&
                              (0, t.jsxs)("div", {
                                className:
                                  "jsx-a9a0ace15b22e2a3 pt-8 border-t border-gray-200",
                                children: [
                                  (0, t.jsx)("button", {
                                    onClick: et,
                                    disabled: I,
                                    className:
                                      "jsx-a9a0ace15b22e2a3 inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105",
                                    children: I
                                      ? (0, t.jsxs)(t.Fragment, {
                                          children: [
                                            (0, t.jsxs)("svg", {
                                              xmlns:
                                                "http://www.w3.org/2000/svg",
                                              fill: "none",
                                              viewBox: "0 0 24 24",
                                              className:
                                                "jsx-a9a0ace15b22e2a3 animate-spin -ml-1 mr-3 h-5 w-5 text-white",
                                              children: [
                                                (0, t.jsx)("circle", {
                                                  cx: "12",
                                                  cy: "12",
                                                  r: "10",
                                                  stroke: "currentColor",
                                                  strokeWidth: "4",
                                                  className:
                                                    "jsx-a9a0ace15b22e2a3 opacity-25",
                                                }),
                                                (0, t.jsx)("path", {
                                                  fill: "currentColor",
                                                  d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
                                                  className:
                                                    "jsx-a9a0ace15b22e2a3 opacity-75",
                                                }),
                                              ],
                                            }),
                                            "Processing...",
                                          ],
                                        })
                                      : (0, t.jsxs)(t.Fragment, {
                                          children: [
                                            (0, t.jsx)(d, {
                                              className: "w-6 h-6 mr-2",
                                            }),
                                            "Create My Profile & Documents",
                                          ],
                                        }),
                                  }),
                                  (0, t.jsx)("p", {
                                    className:
                                      "jsx-a9a0ace15b22e2a3 text-sm text-gray-500 mt-3",
                                    children:
                                      "This will transcribe your story, generate a QR code, and create a GoFundMe draft document",
                                  }),
                                ],
                              }),
                          ],
                        }),
                        (0, t.jsxs)("div", {
                          className:
                            "jsx-a9a0ace15b22e2a3 mt-12 bg-blue-50 rounded-lg p-6 border border-blue-100",
                          children: [
                            (0, t.jsxs)("h3", {
                              className:
                                "jsx-a9a0ace15b22e2a3 font-semibold text-blue-900 mb-3 flex items-center",
                              children: [
                                (0, t.jsx)(i.Z, { className: "w-5 h-5 mr-2" }),
                                "Recording Tips:",
                              ],
                            }),
                            (0, t.jsxs)("ul", {
                              className:
                                "jsx-a9a0ace15b22e2a3 text-sm text-blue-800 space-y-2",
                              children: [
                                (0, t.jsxs)("li", {
                                  className:
                                    "jsx-a9a0ace15b22e2a3 flex items-start",
                                  children: [
                                    (0, t.jsx)("span", {
                                      className:
                                        "jsx-a9a0ace15b22e2a3 text-blue-600 mr-2",
                                      children: "•",
                                    }),
                                    (0, t.jsx)("span", {
                                      className: "jsx-a9a0ace15b22e2a3",
                                      children:
                                        "Find a quiet place with minimal background noise",
                                    }),
                                  ],
                                }),
                                (0, t.jsxs)("li", {
                                  className:
                                    "jsx-a9a0ace15b22e2a3 flex items-start",
                                  children: [
                                    (0, t.jsx)("span", {
                                      className:
                                        "jsx-a9a0ace15b22e2a3 text-blue-600 mr-2",
                                      children: "•",
                                    }),
                                    (0, t.jsx)("span", {
                                      className: "jsx-a9a0ace15b22e2a3",
                                      children:
                                        "Speak clearly and at a normal pace",
                                    }),
                                  ],
                                }),
                                (0, t.jsxs)("li", {
                                  className:
                                    "jsx-a9a0ace15b22e2a3 flex items-start",
                                  children: [
                                    (0, t.jsx)("span", {
                                      className:
                                        "jsx-a9a0ace15b22e2a3 text-blue-600 mr-2",
                                      children: "•",
                                    }),
                                    (0, t.jsx)("span", {
                                      className: "jsx-a9a0ace15b22e2a3",
                                      children:
                                        "Share your experiences, skills, goals, and current needs",
                                    }),
                                  ],
                                }),
                                (0, t.jsxs)("li", {
                                  className:
                                    "jsx-a9a0ace15b22e2a3 flex items-start",
                                  children: [
                                    (0, t.jsx)("span", {
                                      className:
                                        "jsx-a9a0ace15b22e2a3 text-blue-600 mr-2",
                                      children: "•",
                                    }),
                                    (0, t.jsx)("span", {
                                      className: "jsx-a9a0ace15b22e2a3",
                                      children:
                                        "Mention any job history, talents, or things you're good at",
                                    }),
                                  ],
                                }),
                                (0, t.jsxs)("li", {
                                  className:
                                    "jsx-a9a0ace15b22e2a3 flex items-start",
                                  children: [
                                    (0, t.jsx)("span", {
                                      className:
                                        "jsx-a9a0ace15b22e2a3 text-blue-600 mr-2",
                                      children: "•",
                                    }),
                                    (0, t.jsx)("span", {
                                      className: "jsx-a9a0ace15b22e2a3",
                                      children:
                                        "Don't worry about being perfect - just be yourself!",
                                    }),
                                  ],
                                }),
                                (0, t.jsxs)("li", {
                                  className:
                                    "jsx-a9a0ace15b22e2a3 flex items-start",
                                  children: [
                                    (0, t.jsx)("span", {
                                      className:
                                        "jsx-a9a0ace15b22e2a3 text-blue-600 mr-2",
                                      children: "•",
                                    }),
                                    (0, t.jsx)("span", {
                                      className: "jsx-a9a0ace15b22e2a3",
                                      children:
                                        "You can pause and resume anytime, or start over if needed",
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
                  (0, t.jsx)(l(), {
                    id: "a9a0ace15b22e2a3",
                    children:
                      "@-webkit-keyframes audioBar{0%,100%{height:20%}50%{height:100%}}@-moz-keyframes audioBar{0%,100%{height:20%}50%{height:100%}}@-o-keyframes audioBar{0%,100%{height:20%}50%{height:100%}}@keyframes audioBar{0%,100%{height:20%}50%{height:100%}}",
                  }),
                ],
              });
      }
    },
    24012: function (e, a, s) {
      "use strict";
      var t = s(58078);
      let r = t.forwardRef(function ({ title: e, titleId: a, ...s }, r) {
        return t.createElement(
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
              "aria-labelledby": a,
            },
            s,
          ),
          e ? t.createElement("title", { id: a }, e) : null,
          t.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
          }),
        );
      });
      a.Z = r;
    },
    54231: function (e, a, s) {
      "use strict";
      var t = s(58078);
      let r = t.forwardRef(function ({ title: e, titleId: a, ...s }, r) {
        return t.createElement(
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
              "aria-labelledby": a,
            },
            s,
          ),
          e ? t.createElement("title", { id: a }, e) : null,
          t.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z",
          }),
          t.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z",
          }),
        );
      });
      a.Z = r;
    },
  },
  function (e) {
    (e.O(0, [54, 317, 115, 835, 744], function () {
      return e((e.s = 50037));
    }),
      (_N_E = e.O()));
  },
]);

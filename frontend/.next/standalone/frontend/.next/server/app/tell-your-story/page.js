(() => {
  var e = {};
  ((e.id = 235),
    (e.ids = [235]),
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
      98689: (e, a, s) => {
        "use strict";
        (s.r(a),
          s.d(a, {
            GlobalError: () => n.a,
            __next_app__: () => u,
            originalPathname: () => x,
            pages: () => d,
            routeModule: () => m,
            tree: () => o,
          }));
        var t = s(36577),
          r = s(55533),
          l = s(40443),
          n = s.n(l),
          i = s(53320),
          c = {};
        for (let e in i)
          0 >
            [
              "default",
              "tree",
              "pages",
              "GlobalError",
              "originalPathname",
              "__next_app__",
              "routeModule",
            ].indexOf(e) && (c[e] = () => i[e]);
        s.d(a, c);
        let o = [
            "",
            {
              children: [
                "tell-your-story",
                {
                  children: [
                    "__PAGE__",
                    {},
                    {
                      page: [
                        () => Promise.resolve().then(s.bind(s, 60756)),
                        "C:\\Users\\richl\\Care2system\\frontend\\app\\tell-your-story\\page.tsx",
                      ],
                    },
                  ],
                },
                {},
              ],
            },
            {
              layout: [
                () => Promise.resolve().then(s.bind(s, 18685)),
                "C:\\Users\\richl\\Care2system\\frontend\\app\\layout.tsx",
              ],
              "not-found": [
                () => Promise.resolve().then(s.t.bind(s, 31459, 23)),
                "next/dist/client/components/not-found-error",
              ],
            },
          ],
          d = [
            "C:\\Users\\richl\\Care2system\\frontend\\app\\tell-your-story\\page.tsx",
          ],
          x = "/tell-your-story/page",
          u = { require: s, loadChunk: () => Promise.resolve() },
          m = new t.AppPageRouteModule({
            definition: {
              kind: r.x.APP_PAGE,
              page: "/tell-your-story/page",
              pathname: "/tell-your-story",
              bundlePath: "",
              filename: "",
              appPaths: [],
            },
            userland: { loaderTree: o },
          });
      },
      20717: (e, a, s) => {
        (Promise.resolve().then(s.bind(s, 56253)),
          Promise.resolve().then(s.bind(s, 9690)),
          Promise.resolve().then(s.bind(s, 33999)));
      },
      68656: (e, a, s) => {
        Promise.resolve().then(s.bind(s, 41657));
      },
      19191: (e, a, s) => {
        (Promise.resolve().then(s.t.bind(s, 28913, 23)),
          Promise.resolve().then(s.t.bind(s, 50409, 23)),
          Promise.resolve().then(s.t.bind(s, 75054, 23)),
          Promise.resolve().then(s.t.bind(s, 34892, 23)),
          Promise.resolve().then(s.t.bind(s, 80356, 23)),
          Promise.resolve().then(s.t.bind(s, 73559, 23)));
      },
      56253: (e, a, s) => {
        "use strict";
        (s.r(a), s.d(a, { Providers: () => i }));
        var t = s(73658),
          r = s(58758),
          l = s(60459),
          n = s(55459);
        function i({ children: e }) {
          let [a] = (0, n.useState)(
            () =>
              new r.S({
                defaultOptions: { queries: { staleTime: 3e5, gcTime: 6e5 } },
              }),
          );
          return t.jsx(l.aH, { client: a, children: e });
        }
      },
      41657: (e, a, s) => {
        "use strict";
        (s.r(a), s.d(a, { default: () => N }));
        var t = s(73658),
          r = s(14168),
          l = s.n(r),
          n = s(55459),
          i = s(32241),
          c = s(28317),
          o = s(35626);
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
        var x = s(10546),
          u = s(51044),
          m = s(76856),
          h = s(24303),
          p = s(82397),
          j = s(20572),
          b = s(62043),
          g = s(33999),
          f = s(84874),
          y = s.n(f);
        let v = () => "https://api.care2connects.org";
        function N() {
          let [e, a] = (0, n.useState)(!1),
            [s, r] = (0, n.useState)(!1),
            [f, N] = (0, n.useState)(null),
            [w, k] = (0, n.useState)(null),
            [C, P] = (0, n.useState)(0),
            [S, R] = (0, n.useState)(!1),
            [M, Z] = (0, n.useState)(!0),
            [E, A] = (0, n.useState)(!1),
            [F, L] = (0, n.useState)(!1),
            [I, T] = (0, n.useState)(!1),
            [_, G] = (0, n.useState)(null),
            [U, $] = (0, n.useState)(""),
            [O, B] = (0, n.useState)(0),
            [D, q] = (0, n.useState)(""),
            [z, H] = (0, n.useState)(""),
            [Y, Q] = (0, n.useState)(""),
            [W, J] = (0, n.useState)("en"),
            V = (0, n.useRef)(null),
            K = (0, n.useRef)(null),
            X = (0, n.useRef)(null),
            ee = (0, n.useRef)(null),
            ea = (0, i.useRouter)();
          (0, n.useEffect)(
            () => () => {
              (X.current && clearInterval(X.current),
                ee.current && clearInterval(ee.current),
                w && URL.revokeObjectURL(w));
            },
            [w],
          );
          let es = async () => {
              try {
                let e = await navigator.mediaDevices.getUserMedia({
                    audio: !0,
                  }),
                  s = new MediaRecorder(e);
                V.current = s;
                let t = [];
                ((s.ondataavailable = (e) => {
                  e.data.size > 0 && t.push(e.data);
                }),
                  (s.onstop = () => {
                    let a = new Blob(t, { type: "audio/webm" });
                    N(a);
                    let s = URL.createObjectURL(a);
                    (k(s), e.getTracks().forEach((e) => e.stop()));
                  }),
                  s.start(),
                  a(!0),
                  P(0),
                  (X.current = setInterval(() => {
                    P((e) => e + 1);
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
              if (!E) {
                g.default.error("Please give consent to continue");
                return;
              }
              (T(!0), $("Creating your profile..."), B(0));
              try {
                let e = v(),
                  a = await fetch(`${e}/api/story/start`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: D || null,
                      age: z || null,
                      location: Y || null,
                      language: W,
                    }),
                  });
                if (!a.ok) throw Error("Failed to start story processing");
                let s = await a.json(),
                  t = s.ticketId;
                (G(t), $("Uploading your recording..."), B(10));
                let r = new FormData();
                (r.append("audio", f, "story.webm"), r.append("language", W));
                let l = await fetch(`${e}/api/story/${t}/upload`, {
                  method: "POST",
                  body: r,
                });
                if (!l.ok) throw Error("Failed to upload audio");
                (B(20),
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
                  $(""),
                  B(0));
              }
            },
            er = (e) => {
              let a = v();
              ee.current = setInterval(async () => {
                try {
                  let s = await fetch(`${a}/api/story/${e}/status`);
                  if (!s.ok) throw Error("Failed to fetch status");
                  let t = await s.json();
                  ($(el(t.status)),
                    B(t.progress),
                    "COMPLETED" === t.status &&
                      (ee.current && clearInterval(ee.current),
                      $("All done!"),
                      B(100),
                      setTimeout(() => {
                        ea.push(`/profile/${e}`);
                      }, 1500)),
                    "FAILED" === t.status &&
                      (ee.current && clearInterval(ee.current),
                      g.default.error("Processing failed. Please try again."),
                      T(!1),
                      $(""),
                      B(0)));
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
          return M
            ? t.jsx("div", {
                className: "min-h-screen bg-gray-50 py-12",
                children: t.jsx("div", {
                  className: "max-w-2xl mx-auto px-4 sm:px-6 lg:px-8",
                  children: (0, t.jsxs)("div", {
                    className: "bg-white rounded-lg shadow-md p-8",
                    children: [
                      (0, t.jsxs)("div", {
                        className: "text-center mb-8",
                        children: [
                          t.jsx("h1", {
                            className: "text-3xl font-bold text-gray-900 mb-4",
                            children: "Before We Begin",
                          }),
                          t.jsx("p", {
                            className: "text-lg text-gray-600",
                            children:
                              "Your privacy and dignity are our top priorities. Please review the following information.",
                          }),
                        ],
                      }),
                      (0, t.jsxs)("div", {
                        className: "space-y-6",
                        children: [
                          t.jsx("div", {
                            className: "bg-blue-50 rounded-lg p-6",
                            children: (0, t.jsxs)("div", {
                              className: "flex items-start",
                              children: [
                                t.jsx(c.Z, {
                                  className:
                                    "w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0",
                                }),
                                (0, t.jsxs)("div", {
                                  children: [
                                    t.jsx("h3", {
                                      className:
                                        "font-semibold text-blue-900 mb-2",
                                      children: "How Your Story Will Be Used",
                                    }),
                                    (0, t.jsxs)("ul", {
                                      className:
                                        "text-blue-800 space-y-1 text-sm",
                                      children: [
                                        t.jsx("li", {
                                          children:
                                            "• We'll transcribe your audio recording using secure AI technology",
                                        }),
                                        t.jsx("li", {
                                          children:
                                            "• Your story helps create a personalized profile with QR code and GoFundMe draft",
                                        }),
                                        t.jsx("li", {
                                          children:
                                            "• You control who can see your profile and information",
                                        }),
                                        t.jsx("li", {
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
                                  t.jsx("input", {
                                    type: "checkbox",
                                    id: "consent",
                                    checked: E,
                                    onChange: (e) => A(e.target.checked),
                                    className:
                                      "mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded",
                                  }),
                                  (0, t.jsxs)("label", {
                                    htmlFor: "consent",
                                    className: "text-gray-700",
                                    children: [
                                      t.jsx("span", {
                                        className: "font-medium",
                                        children:
                                          "I consent to sharing my story",
                                      }),
                                      " and understand that:",
                                      (0, t.jsxs)("ul", {
                                        className:
                                          "mt-2 text-sm text-gray-600 space-y-1",
                                        children: [
                                          t.jsx("li", {
                                            children:
                                              "• My audio will be processed to create a text transcript",
                                          }),
                                          t.jsx("li", {
                                            children:
                                              "• AI will help extract key information to create my profile",
                                          }),
                                          t.jsx("li", {
                                            children:
                                              "• My information will be stored securely and encrypted",
                                          }),
                                          t.jsx("li", {
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
                                  t.jsx("input", {
                                    type: "checkbox",
                                    id: "public",
                                    checked: F,
                                    onChange: (e) => L(e.target.checked),
                                    className:
                                      "mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded",
                                  }),
                                  (0, t.jsxs)("label", {
                                    htmlFor: "public",
                                    className: "text-gray-700",
                                    children: [
                                      t.jsx("span", {
                                        className: "font-medium",
                                        children: "Make my profile public",
                                      }),
                                      " (optional)",
                                      t.jsx("p", {
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
                              t.jsx("h3", {
                                className: "font-semibold text-gray-900",
                                children:
                                  "Tell us a bit about yourself (optional)",
                              }),
                              (0, t.jsxs)("div", {
                                className: "grid grid-cols-1 gap-4",
                                children: [
                                  (0, t.jsxs)("div", {
                                    children: [
                                      t.jsx("label", {
                                        htmlFor: "name",
                                        className:
                                          "block text-sm font-medium text-gray-700 mb-1",
                                        children: "Name",
                                      }),
                                      t.jsx("input", {
                                        type: "text",
                                        id: "name",
                                        value: D,
                                        onChange: (e) => q(e.target.value),
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
                                          t.jsx("label", {
                                            htmlFor: "age",
                                            className:
                                              "block text-sm font-medium text-gray-700 mb-1",
                                            children: "Age",
                                          }),
                                          t.jsx("input", {
                                            type: "number",
                                            id: "age",
                                            value: z,
                                            onChange: (e) => H(e.target.value),
                                            placeholder: "Age",
                                            className:
                                              "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
                                          }),
                                        ],
                                      }),
                                      (0, t.jsxs)("div", {
                                        children: [
                                          t.jsx("label", {
                                            htmlFor: "location",
                                            className:
                                              "block text-sm font-medium text-gray-700 mb-1",
                                            children: "Location",
                                          }),
                                          t.jsx("input", {
                                            type: "text",
                                            id: "location",
                                            value: Y,
                                            onChange: (e) => Q(e.target.value),
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
                                      t.jsx("label", {
                                        htmlFor: "language",
                                        className:
                                          "block text-sm font-medium text-gray-700 mb-1",
                                        children: "Language",
                                      }),
                                      (0, t.jsxs)("select", {
                                        id: "language",
                                        value: W,
                                        onChange: (e) => J(e.target.value),
                                        className:
                                          "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
                                        children: [
                                          t.jsx("option", {
                                            value: "auto",
                                            children: "Auto-detect",
                                          }),
                                          t.jsx("option", {
                                            value: "en",
                                            children: "English",
                                          }),
                                          t.jsx("option", {
                                            value: "es",
                                            children: "Spanish",
                                          }),
                                          t.jsx("option", {
                                            value: "fr",
                                            children: "French",
                                          }),
                                          t.jsx("option", {
                                            value: "de",
                                            children: "German",
                                          }),
                                          t.jsx("option", {
                                            value: "zh",
                                            children: "Chinese",
                                          }),
                                          t.jsx("option", {
                                            value: "ja",
                                            children: "Japanese",
                                          }),
                                          t.jsx("option", {
                                            value: "ko",
                                            children: "Korean",
                                          }),
                                          t.jsx("option", {
                                            value: "pt",
                                            children: "Portuguese",
                                          }),
                                          t.jsx("option", {
                                            value: "ru",
                                            children: "Russian",
                                          }),
                                          t.jsx("option", {
                                            value: "ar",
                                            children: "Arabic",
                                          }),
                                          t.jsx("option", {
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
                                  t.jsx(o.Z, { className: "w-4 h-4 mr-2" }),
                                  "Back to Home",
                                ],
                              }),
                              t.jsx("button", {
                                onClick: () => Z(!1),
                                disabled: !E,
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
              ? t.jsx("div", {
                  className:
                    "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4",
                  children: t.jsx("div", {
                    className: "max-w-lg w-full",
                    children: (0, t.jsxs)("div", {
                      className:
                        "bg-white rounded-2xl shadow-2xl p-12 text-center",
                      children: [
                        (0, t.jsxs)("div", {
                          className: "mb-8 relative",
                          children: [
                            t.jsx("div", {
                              className:
                                "absolute inset-0 flex items-center justify-center",
                              children: t.jsx("div", {
                                className:
                                  "w-32 h-32 bg-blue-100 rounded-full animate-ping opacity-20",
                              }),
                            }),
                            t.jsx("div", {
                              className:
                                "relative flex items-center justify-center",
                              children: t.jsx("div", {
                                className:
                                  "w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse",
                                children: t.jsx(d, {
                                  className: "w-12 h-12 text-white",
                                }),
                              }),
                            }),
                          ],
                        }),
                        t.jsx("h2", {
                          className: "text-3xl font-bold text-gray-900 mb-4",
                          children: "Processing Your Story",
                        }),
                        t.jsx("p", {
                          className: "text-lg text-gray-600 mb-8",
                          children: U,
                        }),
                        t.jsx("div", {
                          className: "w-full bg-gray-200 rounded-full h-3 mb-4",
                          children: t.jsx("div", {
                            className:
                              "bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500",
                            style: { width: `${O}%` },
                          }),
                        }),
                        (0, t.jsxs)("p", {
                          className: "text-sm text-gray-500",
                          children: [O, "% complete"],
                        }),
                        (0, t.jsxs)("div", {
                          className: "mt-8 grid grid-cols-4 gap-2 text-xs",
                          children: [
                            (0, t.jsxs)("div", {
                              className: `flex flex-col items-center ${O >= 10 ? "text-blue-600" : "text-gray-400"}`,
                              children: [
                                t.jsx(x.Z, { className: "w-6 h-6 mb-1" }),
                                t.jsx("span", { children: "Upload" }),
                              ],
                            }),
                            (0, t.jsxs)("div", {
                              className: `flex flex-col items-center ${O >= 40 ? "text-blue-600" : "text-gray-400"}`,
                              children: [
                                t.jsx(u.Z, { className: "w-6 h-6 mb-1" }),
                                t.jsx("span", { children: "Transcribe" }),
                              ],
                            }),
                            (0, t.jsxs)("div", {
                              className: `flex flex-col items-center ${O >= 70 ? "text-blue-600" : "text-gray-400"}`,
                              children: [
                                t.jsx(m.Z, { className: "w-6 h-6 mb-1" }),
                                t.jsx("span", { children: "QR Code" }),
                              ],
                            }),
                            (0, t.jsxs)("div", {
                              className: `flex flex-col items-center ${O >= 90 ? "text-blue-600" : "text-gray-400"}`,
                              children: [
                                t.jsx(u.Z, { className: "w-6 h-6 mb-1" }),
                                t.jsx("span", { children: "Document" }),
                              ],
                            }),
                          ],
                        }),
                        t.jsx("div", {
                          className: "mt-8 p-4 bg-blue-50 rounded-lg",
                          children: (0, t.jsxs)("p", {
                            className: "text-sm text-blue-800",
                            children: [
                              t.jsx("strong", { children: "Hang tight!" }),
                              " We're creating your profile, QR code, and GoFundMe draft document.",
                            ],
                          }),
                        }),
                      ],
                    }),
                  }),
                })
              : (0, t.jsxs)("div", {
                  className:
                    "jsx-a9a0ace15b22e2a3 min-h-screen bg-gray-50 py-12",
                  children: [
                    t.jsx("div", {
                      className:
                        "jsx-a9a0ace15b22e2a3 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8",
                      children: (0, t.jsxs)("div", {
                        className:
                          "jsx-a9a0ace15b22e2a3 bg-white rounded-lg shadow-md p-8",
                        children: [
                          (0, t.jsxs)("div", {
                            className: "jsx-a9a0ace15b22e2a3 text-center mb-8",
                            children: [
                              t.jsx("h1", {
                                className:
                                  "jsx-a9a0ace15b22e2a3 text-3xl font-bold text-gray-900 mb-4",
                                children: "Tell Your Story",
                              }),
                              t.jsx("p", {
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
                                      t.jsx(h.Z, { className: "w-4 h-4" }),
                                      t.jsx("span", {
                                        className: "jsx-a9a0ace15b22e2a3",
                                        children: "AI Transcription",
                                      }),
                                    ],
                                  }),
                                  (0, t.jsxs)("div", {
                                    className:
                                      "jsx-a9a0ace15b22e2a3 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full",
                                    children: [
                                      t.jsx(h.Z, { className: "w-4 h-4" }),
                                      t.jsx("span", {
                                        className: "jsx-a9a0ace15b22e2a3",
                                        children: "QR Code Generated",
                                      }),
                                    ],
                                  }),
                                  (0, t.jsxs)("div", {
                                    className:
                                      "jsx-a9a0ace15b22e2a3 inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full",
                                    children: [
                                      t.jsx(h.Z, { className: "w-4 h-4" }),
                                      t.jsx("span", {
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
                              t.jsx("div", {
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
                                            t.jsx("div", {
                                              className:
                                                "jsx-a9a0ace15b22e2a3 absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75",
                                            }),
                                            t.jsx(x.Z, {
                                              className:
                                                "w-8 h-8 text-white relative z-10",
                                            }),
                                          ],
                                        }),
                                        t.jsx("div", {
                                          className:
                                            "jsx-a9a0ace15b22e2a3 flex items-end space-x-1 h-12",
                                          children: [...Array(8)].map((e, a) =>
                                            t.jsx(
                                              "div",
                                              {
                                                style: {
                                                  animation: `audioBar 0.8s ease-in-out ${0.1 * a}s infinite`,
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
                                    ? t.jsx("div", {
                                        className:
                                          "jsx-a9a0ace15b22e2a3 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center",
                                        children: t.jsx(h.Z, {
                                          className: "w-8 h-8 text-white",
                                        }),
                                      })
                                    : t.jsx("div", {
                                        className:
                                          "jsx-a9a0ace15b22e2a3 w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center",
                                        children: t.jsx(x.Z, {
                                          className: "w-8 h-8 text-gray-600",
                                        }),
                                      }),
                              }),
                              t.jsx("div", {
                                className:
                                  "jsx-a9a0ace15b22e2a3 text-3xl font-mono text-gray-700",
                                children: `${Math.floor(C / 60)}:${(C % 60).toString().padStart(2, "0")}`,
                              }),
                              t.jsx("div", {
                                className: "jsx-a9a0ace15b22e2a3 text-center",
                                children: e
                                  ? t.jsx("p", {
                                      className:
                                        "jsx-a9a0ace15b22e2a3 text-red-600 font-medium",
                                      children: s
                                        ? "Recording Paused"
                                        : "Recording...",
                                    })
                                  : f
                                    ? t.jsx("p", {
                                        className:
                                          "jsx-a9a0ace15b22e2a3 text-green-600 font-medium",
                                        children: "Recording Complete ✓",
                                      })
                                    : t.jsx("p", {
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
                                        t.jsx(x.Z, {
                                          className: "w-5 h-5 mr-2",
                                        }),
                                        t.jsx("span", {
                                          className: "jsx-a9a0ace15b22e2a3",
                                          children: "Start Recording",
                                        }),
                                      ],
                                    }),
                                  e &&
                                    (0, t.jsxs)(t.Fragment, {
                                      children: [
                                        t.jsx("button", {
                                          onClick: () => {
                                            V.current &&
                                              e &&
                                              (s
                                                ? (V.current.resume(),
                                                  r(!1),
                                                  (X.current = setInterval(
                                                    () => {
                                                      P((e) => e + 1);
                                                    },
                                                    1e3,
                                                  )))
                                                : (V.current.pause(),
                                                  r(!0),
                                                  X.current &&
                                                    clearInterval(X.current)));
                                          },
                                          className:
                                            "jsx-a9a0ace15b22e2a3 inline-flex items-center px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition",
                                          children: s
                                            ? (0, t.jsxs)(t.Fragment, {
                                                children: [
                                                  t.jsx(p.Z, {
                                                    className: "w-5 h-5 mr-2",
                                                  }),
                                                  t.jsx("span", {
                                                    className:
                                                      "jsx-a9a0ace15b22e2a3",
                                                    children: "Resume",
                                                  }),
                                                ],
                                              })
                                            : (0, t.jsxs)(t.Fragment, {
                                                children: [
                                                  t.jsx(j.Z, {
                                                    className: "w-5 h-5 mr-2",
                                                  }),
                                                  t.jsx("span", {
                                                    className:
                                                      "jsx-a9a0ace15b22e2a3",
                                                    children: "Pause",
                                                  }),
                                                ],
                                              }),
                                        }),
                                        (0, t.jsxs)("button", {
                                          onClick: () => {
                                            V.current &&
                                              e &&
                                              (V.current.stop(),
                                              a(!1),
                                              r(!1),
                                              X.current &&
                                                clearInterval(X.current),
                                              g.default.success(
                                                "Recording completed!",
                                              ));
                                          },
                                          className:
                                            "jsx-a9a0ace15b22e2a3 inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition",
                                          children: [
                                            t.jsx(b.Z, {
                                              className: "w-5 h-5 mr-2",
                                            }),
                                            t.jsx("span", {
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
                                        t.jsx("button", {
                                          onClick: () => {
                                            K.current &&
                                              (S
                                                ? (K.current.pause(), R(!1))
                                                : (K.current.play(), R(!0)));
                                          },
                                          className:
                                            "jsx-a9a0ace15b22e2a3 inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition",
                                          children: S
                                            ? (0, t.jsxs)(t.Fragment, {
                                                children: [
                                                  t.jsx(j.Z, {
                                                    className: "w-5 h-5 mr-2",
                                                  }),
                                                  t.jsx("span", {
                                                    className:
                                                      "jsx-a9a0ace15b22e2a3",
                                                    children: "Pause Playback",
                                                  }),
                                                ],
                                              })
                                            : (0, t.jsxs)(t.Fragment, {
                                                children: [
                                                  t.jsx(p.Z, {
                                                    className: "w-5 h-5 mr-2",
                                                  }),
                                                  t.jsx("span", {
                                                    className:
                                                      "jsx-a9a0ace15b22e2a3",
                                                    children: "Play Recording",
                                                  }),
                                                ],
                                              }),
                                        }),
                                        t.jsx("button", {
                                          onClick: () => {
                                            (N(null), k(null), P(0), R(!1));
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
                                t.jsx("audio", {
                                  ref: K,
                                  src: w,
                                  onEnded: () => R(!1),
                                  className: "jsx-a9a0ace15b22e2a3 hidden",
                                }),
                              f &&
                                (0, t.jsxs)("div", {
                                  className:
                                    "jsx-a9a0ace15b22e2a3 pt-8 border-t border-gray-200",
                                  children: [
                                    t.jsx("button", {
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
                                                  t.jsx("circle", {
                                                    cx: "12",
                                                    cy: "12",
                                                    r: "10",
                                                    stroke: "currentColor",
                                                    strokeWidth: "4",
                                                    className:
                                                      "jsx-a9a0ace15b22e2a3 opacity-25",
                                                  }),
                                                  t.jsx("path", {
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
                                              t.jsx(d, {
                                                className: "w-6 h-6 mr-2",
                                              }),
                                              "Create My Profile & Documents",
                                            ],
                                          }),
                                    }),
                                    t.jsx("p", {
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
                                  t.jsx(c.Z, { className: "w-5 h-5 mr-2" }),
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
                                      t.jsx("span", {
                                        className:
                                          "jsx-a9a0ace15b22e2a3 text-blue-600 mr-2",
                                        children: "•",
                                      }),
                                      t.jsx("span", {
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
                                      t.jsx("span", {
                                        className:
                                          "jsx-a9a0ace15b22e2a3 text-blue-600 mr-2",
                                        children: "•",
                                      }),
                                      t.jsx("span", {
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
                                      t.jsx("span", {
                                        className:
                                          "jsx-a9a0ace15b22e2a3 text-blue-600 mr-2",
                                        children: "•",
                                      }),
                                      t.jsx("span", {
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
                                      t.jsx("span", {
                                        className:
                                          "jsx-a9a0ace15b22e2a3 text-blue-600 mr-2",
                                        children: "•",
                                      }),
                                      t.jsx("span", {
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
                                      t.jsx("span", {
                                        className:
                                          "jsx-a9a0ace15b22e2a3 text-blue-600 mr-2",
                                        children: "•",
                                      }),
                                      t.jsx("span", {
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
                                      t.jsx("span", {
                                        className:
                                          "jsx-a9a0ace15b22e2a3 text-blue-600 mr-2",
                                        children: "•",
                                      }),
                                      t.jsx("span", {
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
                    t.jsx(l(), {
                      id: "a9a0ace15b22e2a3",
                      children:
                        "@-webkit-keyframes audioBar{0%,100%{height:20%}50%{height:100%}}@-moz-keyframes audioBar{0%,100%{height:20%}50%{height:100%}}@-o-keyframes audioBar{0%,100%{height:20%}50%{height:100%}}@keyframes audioBar{0%,100%{height:20%}50%{height:100%}}",
                    }),
                  ],
                });
        }
      },
      9690: (e, a, s) => {
        "use strict";
        (s.r(a), s.d(a, { default: () => c }));
        var t = s(73658),
          r = s(84874),
          l = s.n(r),
          n = s(32241),
          i = s(17872);
        function c() {
          let e = (0, n.usePathname)();
          return "/system" === e
            ? null
            : t.jsx("header", {
                className: "bg-white shadow-sm border-b border-gray-200",
                children: t.jsx("div", {
                  className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                  children: (0, t.jsxs)("div", {
                    className: "flex justify-between items-center py-4",
                    children: [
                      (0, t.jsxs)("div", {
                        className: "flex items-center gap-4",
                        children: [
                          t.jsx(l(), {
                            href: "/",
                            className: "flex items-center gap-2",
                            children: t.jsx("div", {
                              className: "text-3xl font-black text-blue-900",
                              children: "CareConnect",
                            }),
                          }),
                          t.jsx("div", {
                            className:
                              "hidden sm:block text-sm text-gray-600 font-medium border-l border-gray-300 pl-4",
                            children: "Community-Supported Homeless Initiative",
                          }),
                        ],
                      }),
                      (0, t.jsxs)("div", {
                        className: "flex items-center gap-6",
                        children: [
                          (0, t.jsxs)("nav", {
                            className: "hidden md:flex items-center gap-6",
                            children: [
                              t.jsx(l(), {
                                href: "/about",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "About",
                              }),
                              t.jsx(l(), {
                                href: "/resources",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Resources",
                              }),
                              t.jsx(l(), {
                                href: "/find",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Find",
                              }),
                              t.jsx(l(), {
                                href: "/support",
                                className:
                                  "text-sm font-medium text-gray-700 hover:text-blue-600 transition",
                                children: "Support",
                              }),
                            ],
                          }),
                          (0, t.jsxs)(l(), {
                            href: "/system",
                            className:
                              "flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition group",
                            title: "System Diagnostics",
                            children: [
                              t.jsx(i.Z, {
                                size: 16,
                                className: "group-hover:text-blue-600",
                              }),
                              t.jsx("span", {
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
      18685: (e, a, s) => {
        "use strict";
        (s.r(a), s.d(a, { default: () => b, metadata: () => j }));
        var t = s(31487),
          r = s(72972),
          l = s.n(r);
        s(40642);
        var n = s(19894);
        let i = (0, n.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx`,
          ),
          { __esModule: c, $$typeof: o } = i;
        i.default;
        let d = (0, n.createProxy)(
          String.raw`C:\Users\richl\Care2system\frontend\app\providers.tsx#Providers`,
        );
        var x = s(15762);
        let u = (0, n.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\components\Header.tsx`,
          ),
          { __esModule: m, $$typeof: h } = u,
          p = u.default,
          j = {
            title: "CareConnect - Supporting Our Community",
            description:
              "A platform connecting individuals experiencing homelessness with resources, opportunities, and community support.",
            keywords:
              "homeless support, community resources, job opportunities, donations, assistance",
          };
        function b({ children: e }) {
          return t.jsx("html", {
            lang: "en",
            children: t.jsx("body", {
              className: l().className,
              children: (0, t.jsxs)(d, {
                children: [
                  t.jsx(p, {}),
                  t.jsx("div", {
                    className: "min-h-screen bg-gray-50",
                    children: t.jsx("main", { children: e }),
                  }),
                  t.jsx(x.x7, {
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
      60756: (e, a, s) => {
        "use strict";
        (s.r(a),
          s.d(a, { $$typeof: () => n, __esModule: () => l, default: () => c }));
        var t = s(19894);
        let r = (0, t.createProxy)(
            String.raw`C:\Users\richl\Care2system\frontend\app\tell-your-story\page.tsx`,
          ),
          { __esModule: l, $$typeof: n } = r,
          i = r.default,
          c = i;
      },
      40642: () => {},
      51044: (e, a, s) => {
        "use strict";
        s.d(a, { Z: () => l });
        var t = s(55459);
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
          }),
          l = r;
      },
      76856: (e, a, s) => {
        "use strict";
        s.d(a, { Z: () => l });
        var t = s(55459);
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
          }),
          l = r;
      },
    }));
  var a = require("../../webpack-runtime.js");
  a.C(e);
  var s = (e) => a((a.s = e)),
    t = a.X(0, [623, 934, 20], () => s(98689));
  module.exports = t;
})();

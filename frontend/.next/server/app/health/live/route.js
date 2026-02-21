"use strict";
(() => {
  var e = {};
  ((e.id = 134),
    (e.ids = [134]),
    (e.modules = {
      30517: (e) => {
        e.exports = require("next/dist/compiled/next-server/app-route.runtime.prod.js");
      },
      9586: (e, t, r) => {
        (r.r(t),
          r.d(t, {
            headerHooks: () => m,
            originalPathname: () => g,
            patchFetch: () => f,
            requestAsyncStorage: () => h,
            routeModule: () => d,
            serverHooks: () => c,
            staticGenerationAsyncStorage: () => p,
            staticGenerationBailout: () => v,
          }));
        var a = {};
        (r.r(a), r.d(a, { GET: () => u, dynamic: () => l }));
        var n = r(96963),
          o = r(55533),
          i = r(82698),
          s = r(85999);
        async function u() {
          return s.Z.json({
            status: "alive",
            timestamp: new Date().toISOString(),
            message: "Frontend is running",
          });
        }
        let l = "force-dynamic",
          d = new n.AppRouteRouteModule({
            definition: {
              kind: o.x.APP_ROUTE,
              page: "/health/live/route",
              pathname: "/health/live",
              filename: "route",
              bundlePath: "app/health/live/route",
            },
            resolvedPagePath:
              "C:\\Users\\richl\\Care2system\\frontend\\app\\health\\live\\route.ts",
            nextConfigOutput: "standalone",
            userland: a,
          }),
          {
            requestAsyncStorage: h,
            staticGenerationAsyncStorage: p,
            serverHooks: c,
            headerHooks: m,
            staticGenerationBailout: v,
          } = d,
          g = "/health/live/route";
        function f() {
          return (0, i.patchFetch)({
            serverHooks: c,
            staticGenerationAsyncStorage: p,
          });
        }
      },
    }));
  var t = require("../../../webpack-runtime.js");
  t.C(e);
  var r = (e) => t((t.s = e)),
    a = t.X(0, [623, 508], () => r(9586));
  module.exports = a;
})();

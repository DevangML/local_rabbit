/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-cf3919ed'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "apple-touch-icon-180x180.png",
    "revision": "9ddd2eef323df6a7989f28ab1a2af0eb"
  }, {
    "url": "assets/About-8ZaV7iyu.js",
    "revision": null
  }, {
    "url": "assets/AIAnalyzer-DhP9rBr2.js",
    "revision": null
  }, {
    "url": "assets/Contact-CodfHFSb.js",
    "revision": null
  }, {
    "url": "assets/DiffViewerContainer-BjnHtZNU.js",
    "revision": null
  }, {
    "url": "assets/DiffViewerContainer-Ckdu1zIy.css",
    "revision": null
  }, {
    "url": "assets/Documentation-BsZq6auU.js",
    "revision": null
  }, {
    "url": "assets/ImpactView-DYVxe-EH.js",
    "revision": null
  }, {
    "url": "assets/index-B9d_ryMT.css",
    "revision": null
  }, {
    "url": "assets/index-BoqOyRBV.js",
    "revision": null
  }, {
    "url": "assets/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_QOW4Ep0-DEN69lup.woff2",
    "revision": null
  }, {
    "url": "assets/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_R-W4Ep0-BdERMBEW.woff2",
    "revision": null
  }, {
    "url": "assets/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_ROW4-C_5wUCW5.woff2",
    "revision": null
  }, {
    "url": "assets/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_S-W4Ep0-BJn9WoS4.woff2",
    "revision": null
  }, {
    "url": "assets/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_SeW4Ep0-Q6o0JNvR.woff2",
    "revision": null
  }, {
    "url": "assets/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_SuW4Ep0-D_EPU6CM.woff2",
    "revision": null
  }, {
    "url": "assets/mui-vendor-DdnxAU54.js",
    "revision": null
  }, {
    "url": "assets/Products-wGXGhukP.js",
    "revision": null
  }, {
    "url": "assets/QualityCheck-RPA8AsFS.js",
    "revision": null
  }, {
    "url": "assets/react-vendor-rxifB3tO.js",
    "revision": null
  }, {
    "url": "assets/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPx_cwhsk-BehTv68k.woff2",
    "revision": null
  }, {
    "url": "assets/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPx3cwhsk-BIM06flf.woff2",
    "revision": null
  }, {
    "url": "assets/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPx7cwhsk-DIC32ArD.woff2",
    "revision": null
  }, {
    "url": "assets/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwg-6fWv1k7M.woff2",
    "revision": null
  }, {
    "url": "assets/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxPcwhsk-D3oMJlXt.woff2",
    "revision": null
  }, {
    "url": "assets/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxTcwhsk-Buze_B52.woff2",
    "revision": null
  }, {
    "url": "assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa0ZL7SUc-CMZtQduZ.woff2",
    "revision": null
  }, {
    "url": "assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1pL7SUc-CaVNZxsx.woff2",
    "revision": null
  }, {
    "url": "assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7-C2S99t-D.woff2",
    "revision": null
  }, {
    "url": "assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc-CFHvXkgd.woff2",
    "revision": null
  }, {
    "url": "assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc-B2xhLi22.woff2",
    "revision": null
  }, {
    "url": "assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc-CBcvBZtf.woff2",
    "revision": null
  }, {
    "url": "assets/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7SUc-CGAr0uHJ.woff2",
    "revision": null
  }, {
    "url": "assets/vendor-Bliiys59.js",
    "revision": null
  }, {
    "url": "assets/vendor-Cg1sXqY3.css",
    "revision": null
  }, {
    "url": "favicon.ico",
    "revision": "294fe7f8e9076a50b155f557091307ee"
  }, {
    "url": "index.html",
    "revision": "4e6e32c06f65f8f6d93aef1064361064"
  }, {
    "url": "logo.svg",
    "revision": "c894c1bd05fce0584caaf33a30b3d11e"
  }, {
    "url": "maskable-icon-512x512.png",
    "revision": "1e9d9e5116846ee6ca41bd63c61287e4"
  }, {
    "url": "pwa-192x192.png",
    "revision": "7a07b7d43fce506e2f750c89c8b3e2fc"
  }, {
    "url": "pwa-512x512.png",
    "revision": "affc9dc1158e14757084cb8127ecd6bc"
  }, {
    "url": "pwa-64x64.png",
    "revision": "97b27e8c8389c04c4c0ac326d0588255"
  }, {
    "url": "favicon.ico",
    "revision": "294fe7f8e9076a50b155f557091307ee"
  }, {
    "url": "pwa-192x192.png",
    "revision": "7a07b7d43fce506e2f750c89c8b3e2fc"
  }, {
    "url": "pwa-512x512.png",
    "revision": "affc9dc1158e14757084cb8127ecd6bc"
  }, {
    "url": "manifest.webmanifest",
    "revision": "45dcca85e31d57f5818f8eef0e95f496"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
//# sourceMappingURL=sw.js.map

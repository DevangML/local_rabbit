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
define(['./workbox-c306be4a'], (function (workbox) { 'use strict';

  self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "apple-touch-icon-180x180.png",
    "revision": "9ddd2eef323df6a7989f28ab1a2af0eb"
  }, {
    "url": "assets/About-B19TXuP4.js",
    "revision": null
  }, {
    "url": "assets/AIAnalyzer-D3RUUULu.js",
    "revision": null
  }, {
    "url": "assets/Alert-gVoirwP2.js",
    "revision": null
  }, {
    "url": "assets/CardContent-BS5Eaavd.js",
    "revision": null
  }, {
    "url": "assets/Chip-DD03iqZP.js",
    "revision": null
  }, {
    "url": "assets/Contact-1o97ktXs.js",
    "revision": null
  }, {
    "url": "assets/DiffViewerContainer-Ckdu1zIy.css",
    "revision": null
  }, {
    "url": "assets/DiffViewerContainer-CQ0X7ql6.js",
    "revision": null
  }, {
    "url": "assets/Documentation-Cg1sXqY3.css",
    "revision": null
  }, {
    "url": "assets/Documentation-CWdLM92R.js",
    "revision": null
  }, {
    "url": "assets/Grid-BBkqdGyp.js",
    "revision": null
  }, {
    "url": "assets/ImpactView-CZrpyPix.js",
    "revision": null
  }, {
    "url": "assets/index-B9d_ryMT.css",
    "revision": null
  }, {
    "url": "assets/index-Ck9E2Ycp.js",
    "revision": null
  }, {
    "url": "assets/Products-rhwJSFS0.js",
    "revision": null
  }, {
    "url": "assets/QualityCheck-0ZZ3Ayr4.js",
    "revision": null
  }, {
    "url": "assets/Stack-379qmAHl.js",
    "revision": null
  }, {
    "url": "assets/useSlot-C28mivwc.js",
    "revision": null
  }, {
    "url": "assets/workbox-window.prod.es5-B9K5rw8f.js",
    "revision": null
  }, {
    "url": "favicon.ico",
    "revision": "294fe7f8e9076a50b155f557091307ee"
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
    "url": "apple-touch-icon-180x180.png",
    "revision": "9ddd2eef323df6a7989f28ab1a2af0eb"
  }, {
    "url": "favicon.ico",
    "revision": "294fe7f8e9076a50b155f557091307ee"
  }, {
    "url": "index.html",
    "revision": "06118f9d23ff491f2abaecdc35d652fb"
  }, {
    "url": "logo.svg",
    "revision": "c894c1bd05fce0584caaf33a30b3d11e"
  }, {
    "url": "manifest.json",
    "revision": "9fe88bc047190ba3543baf8c95c1625d"
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
    "url": "sw.js",
    "revision": "9229d03e343ad4fabb529cfda265dc29"
  }, {
    "url": "manifest.webmanifest",
    "revision": "9bd091887f06ac6344788ed123dda213"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/api\./i, new workbox.NetworkFirst({
    "cacheName": "api-cache",
    "networkTimeoutSeconds": 10,
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 200,
      maxAgeSeconds: 2592000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/\/index\.html$/i, new workbox.NetworkFirst({
    "cacheName": "html-cache",
    plugins: []
  }), 'GET');

}));
//# sourceMappingURL=sw.js.map

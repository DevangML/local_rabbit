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
    "url": "assets/About-7DpYr8bh.js",
    "revision": null
  }, {
    "url": "assets/AIAnalyzer-B22IC8zq.js",
    "revision": null
  }, {
    "url": "assets/Alert-BhuvVyDJ.js",
    "revision": null
  }, {
    "url": "assets/CardContent-def-3Ftp.js",
    "revision": null
  }, {
    "url": "assets/Chip-B9vRR6Bu.js",
    "revision": null
  }, {
    "url": "assets/Contact-qd_H4Jg5.js",
    "revision": null
  }, {
    "url": "assets/DiffViewerContainer-Ckdu1zIy.css",
    "revision": null
  }, {
    "url": "assets/DiffViewerContainer-nUiO9g6e.js",
    "revision": null
  }, {
    "url": "assets/Documentation-Cb2GpUV5.js",
    "revision": null
  }, {
    "url": "assets/Documentation-Cg1sXqY3.css",
    "revision": null
  }, {
    "url": "assets/Grid-DR9lLDEG.js",
    "revision": null
  }, {
    "url": "assets/ImpactView-DGOHgS3T.js",
    "revision": null
  }, {
    "url": "assets/index-CrLyKiK8.css",
    "revision": null
  }, {
    "url": "assets/index-K_m0r3Nf.js",
    "revision": null
  }, {
    "url": "assets/Products-BwPMH46S.js",
    "revision": null
  }, {
    "url": "assets/QualityCheck-DQe5uOMc.js",
    "revision": null
  }, {
    "url": "assets/Stack-CkPwWYk0.js",
    "revision": null
  }, {
    "url": "assets/useSlot-CI_DgnQ-.js",
    "revision": null
  }, {
    "url": "favicon.ico",
    "revision": "294fe7f8e9076a50b155f557091307ee"
  }, {
    "url": "index.html",
    "revision": "22de46755606ba662dac138316d4cf28"
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
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "apple-touch-icon-180x180.png",
    "revision": "9ddd2eef323df6a7989f28ab1a2af0eb"
  }, {
    "url": "favicon.ico",
    "revision": "294fe7f8e9076a50b155f557091307ee"
  }, {
    "url": "index.html",
    "revision": "6ee79441cf28f6368f217734cc16524e"
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

}));
//# sourceMappingURL=sw.js.map

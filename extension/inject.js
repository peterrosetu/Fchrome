console.log("inject proxy start!")

function inject_script(code) {
  var script = document.createElement("script");
  script.innerHTML = code;
  script.onload = script.onreadystatechange = function () {
    script.onreadystatechange = script.onload = null;
  }
  var html = document.getElementsByTagName("html")[0];
  html.appendChild(script);
  html.removeChild(script);
}

var hookers = [
  "config-proxy-hook",
  "config-iframe-proxy-hook",
  "config-function-proxy-hook",
  "config-hook-console",
  "config-hook-random",
  "config-hook-random-freeze",
  "config-hook-time-performance",
  "config-hook-time-freeze",
  "config-hook-time-freeze-number",
  "config-hook-encrypt-normal",
  "config-hook-JSON.parse",
  "config-hook-JSON.stringify",
  "config-proxy-hook-window",
  "config-proxy-hook-screen",
  "config-proxy-hook-document",
  "config-proxy-hook-navigator",
  "config-proxy-hook-history",
  "config-proxy-hook-sessionStorage",
  "config-proxy-hook-localStorage",
  "config-proxy-hook-location",
  "config-proxy-hook-performance",
  "config-proxy-hook-indexedDB",
  "config-proxy-hook-crypto",
]

function injectfunc(e, window) {
  var dta_parse = JSON.parse
  var dta_stringify = JSON.stringify


  dtavm.proxy_map = {
    window: e["config-proxy-hook-window"]?dtavm.proxy(window_jyl, "window"):window_jyl,
    screen: e["config-proxy-hook-screen"]?dtavm.proxy(screen_jyl, "screen"):screen_jyl,
    document: e["config-proxy-hook-document"]?dtavm.proxy(document_jyl, "document"):document_jyl,
    navigator: e["config-proxy-hook-navigator"]?dtavm.proxy(navigator_jyl, "navigator"):navigator_jyl,
    history: e["config-proxy-hook-history"]?dtavm.proxy(history_jyl, "history"):history_jyl,
    sessionStorage: e["config-proxy-hook-sessionStorage"]?dtavm.proxy(sessionStorage_jyl, "sessionStorage"):sessionStorage_jyl,
    localStorage: e["config-proxy-hook-localStorage"]?dtavm.proxy(localStorage_jyl, "localStorage"):localStorage_jyl,
    location: e["config-proxy-hook-location"]?dtavm.proxy(location_jyl, "location"):location_jyl,
    performance: e["config-proxy-hook-performance"]?dtavm.proxy(performance_jyl, "performance"):performance_jyl,
    indexedDB: e["config-proxy-hook-indexedDB"]?dtavm.proxy(indexedDB_jyl, "indexedDB"):indexedDB_jyl,
    crypto: e["config-proxy-hook-crypto"]?dtavm.proxy(crypto_jyl, "crypto"):crypto_jyl,
  }

  globalThis = dtavm.proxy(window_jyl, "globalThis")
  Object.defineProperties(globalThis, {
    'window': {
      configurable: false,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["window"]
      },
      set: undefined
    },
    'self': {
      configurable: true,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["window"]
      },
      set: function set() {
        debuggee;
      }
    },
    'top': {
      configurable: false,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["window"]
      },
      set: undefined
    },
    'parent': {
      configurable: true,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["window"]
      },
      set: function set() {
        debuggee;
      }
    },
    'frames': {
      configurable: true,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["window"]
      },
      set: function set() {
        debuggee;
      }
    },
    'screen': {
      configurable: true,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["screen"]
      },
      set: function set() {
        debuggee;
      }
    },
    'performance': {
      configurable: true,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["performance"]
      },
      set: function set() {
        debuggee;
      }
    },
    'document': {
      configurable: false,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["document"]
      },
      set: undefined
    },
    'navigator': {
      configurable: true,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["navigator"]
      },
      set: undefined
    },
    'history': {
      configurable: true,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["history"]
      },
      set: undefined
    },
    'sessionStorage': {
      configurable: true,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["sessionStorage"]
      },
      set: undefined
    },
    'localStorage': {
      configurable: true,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["localStorage"]
      },
      set: undefined
    },
    'location': {
      configurable: false,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["location"]
      },
      set: function set() {
        debuggee;
      }
    },
    'indexedDB': {
      configurable: true,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["indexedDB"]
      },
      set: undefined
    },
    'crypto': {
      configurable: true,
      enumerable: true,
      get: function get() {
        return dtavm.proxy_map["crypto"]
      },
      set: undefined
    },
  })

  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["window"].get, "get window");

  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["self"].get, "get self");
  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["self"].set, "set self");

  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["top"].get, "get top");

  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["parent"].get, "get parent");
  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["parent"].set, "set parent");

  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["frames"].get, "get frames");
  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["frames"].set, "set frames");

  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["screen"].get, "get screen");
  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["screen"].set, "set screen");

  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["performance"].get, "get performance");
  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["performance"].set, "set performance");

  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["document"].get, "get document");
  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["navigator"].get, "get navigator");
  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["history"].get, "get history");
  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["sessionStorage"].get, "get sessionStorage");
  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["localStorage"].get, "get localStorage");

  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["location"].get, "get location");
  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["location"].set, "set location");

  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["indexedDB"].get, "get indexedDB");
  dtavm.func_set_native(Object.getOwnPropertyDescriptors(globalThis)["crypto"].get, "get crypto");


  if (e["config-hook-console"]) {
    for (let key in Object.getOwnPropertyDescriptors(console)) {
      if (typeof console[key] == "function") {
        console[key] = function () { }
        dtavm.func_set_native(console[key], key)
      }
    }
  }
  if (e["config-hook-random"] && e["config-hook-random-freeze"]) {
    Math.random = function random() { return 0.5 }
    dtavm.func_set_native(Math.random)
  }
  if (e["config-hook-random"] && e["config-hook-time-freeze"]) {
    dtavm.Date = Date
    var ftime = +e["config-hook-time-freeze-number"]
    Date = function (_Date) {
      var bind = Function.bind;
      var unbind = bind.bind(bind);
      function instantiate(constructor, args) {
        return new (unbind(constructor, null).apply(null, args));
      }
      var names = Object.getOwnPropertyNames(_Date);
      for (var i = 0; i < names.length; i++) {
        if (names[i] in Date)
          continue;
        var desc = Object.getOwnPropertyDescriptor(_Date, names[i]);
        Object.defineProperty(Date, names[i], desc);
      }
      function Date() {
        var date = instantiate(_Date, [ftime]); // 固定返回某一个时间点
        return date;
      }
      Date.prototype = _Date.prototype
      dtavm.func_set_native(Date);
      return Date;
    }(Date);
    Date.now = function now() { return ftime }
    dtavm.func_set_native(Date.now)
  }
  if (e["config-hook-random"] && e["config-hook-time-performance"]) {
    Performance.prototype.now = function now() { return 1024 }
    dtavm.func_set_native(Performance.prototype.now)
  }
  if (e["config-hook-encrypt-normal"]) {
    if (e["config-hook-JSON.parse"]) {
      JSON.parse = function parse() {
        var res = dta_parse.apply(this, arguments)
        if (e["config-hook-JSON.parse"]) {
          dtavm.log('[JSON.parse]:', arguments, res)
        }
        return res
      }
      dtavm.func_set_native(JSON.parse)
    }
    if (e["config-hook-JSON.stringify"]) {
      JSON.stringify = function stringify() {
        var res = dta_stringify.apply(this, arguments)
        if (e["config-hook-JSON.stringify"]) {
          dtavm.log('[JSON.stringify]:', arguments, res)
        }
        return res;
      }
      dtavm.func_set_native(JSON.stringify)
    }
  }

}
var code_hookdom;
chrome.storage.local.get(hookers, function (result) {
  if (result["config-proxy-hook"]) {
    console.log("启动代理器替换全局对象!")
    inject_script(dtavm.proxy_start.toString() + "\nproxy_start()")



    inject_script(code_hookdom = `(${injectfunc})(${JSON.stringify(result)},window)`);
    if (result["config-iframe-proxy-hook"]) {
      console.log("启动iframe代理器!")
      inject_script(dtavm.iframe_proxy_start.toString() + "\iframe_proxy_start()")
    }
    if (result["config-function-proxy-hook"]) {
      console.log("启动function代理器!")
      inject_script(dtavm.function_proxy.toString() + "\nfunction_proxy()")
    }
  } else {
    console.log("不启动代理器替换全局对象!")
  }
})
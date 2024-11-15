dtavm = {}
dtavm.proxy_start = function proxy_start(e) {
    dtavm = {
        proxy_map: {},
        iframe_proxy_map: {},
        log_env_cache: {},
        log_env: function () {},
    }
    var unhook_func_list = [];

    // todo 在写环境的时候 对undefined的属性 并没有in对象中的进行剔除 （目前是在has代理器中判断 如果判断为false则去删除）
    // todo 没in在对象中 case del delete对象
    if (e["config-log-hook"]) {
        var expurl;
        var dta_Error = Error;
        if ((e["config-hook-regexp-url"] || '').trim()) {
            expurl = RegExp((e["config-hook-regexp-url"] || '').trim())
            RegExp.prototype.dta_test = RegExp.prototype.test
            String.prototype.dta_split = String.prototype.split
        }
        dtavm.log_env = function (call_type, WatchName, key, result, call_type2) {
            if (expurl){
                var stack_list = dta_Error().stack.dta_split('\n').slice(3)
                if (!stack_list.some(stack => expurl.dta_test(stack))) {
                    return;
                }
            }
            var now_obj;
            if (call_type !== "prototype") {
                var split_name_list = WatchName.split(".")
                for (let i = 0; i < split_name_list.length; i++) {
                    if (!dtavm.log_env_cache.hasOwnProperty(split_name_list[i])) {
                        if (!now_obj) {
                            dtavm.log_env_cache[split_name_list[i]] = {}
                        } else {
                            now_obj[split_name_list[i]] = {}
                        }
                    }
                    if (now_obj) {
                        now_obj = now_obj[split_name_list[i]]
                    } else {
                        now_obj = dtavm.log_env_cache[split_name_list[i]]
                    }
                }
            } else {
                if (!dtavm.log_env_cache.hasOwnProperty("prototype")) {
                    dtavm.log_env_cache["prototype"] = {}
                }
                if (!dtavm.log_env_cache["prototype"].hasOwnProperty(WatchName)) {
                    dtavm.log_env_cache["prototype"][WatchName] = {}
                }
                now_obj = dtavm.log_env_cache["prototype"][WatchName]
            }
            switch (call_type) {
                case "func":
                    // todo 记录入参出参
                    // now_obj[key] = function(){}
                    break;
                case "get":
                    if (typeof result == "function") {
                        now_obj[key] = function () { }
                    } else if (typeof result == "object") {
                        if (result instanceof Array) {
                            now_obj[key] = []
                        } else if (result == null) {
                            now_obj[key] = null
                        } else {
                            now_obj[key] = {}
                        }
                    } else if (result instanceof Object) {
                        now_obj[key] = {}
                    } else {
                        now_obj[key] = result
                    }
                    break;
                case "set":
                    break;
                case "del":
                    delete now_obj[key]
                    break;
                case "prototype":
                    switch (call_type2) {
                        case "get":
                            if (typeof result == "function") {
                                now_obj[key] = function () { }
                            } else if (typeof result == "object") {
                                if (result instanceof Array) {
                                    now_obj[key] = []
                                } else if (result == null) {
                                    now_obj[key] = null
                                } else {
                                    now_obj[key] = {}
                                }
                            } else if (result instanceof Object) {
                                now_obj[key] = {}
                            } else {
                                now_obj[key] = result
                            }
                            break;
                        case "set":
                            break;
                        case "func":
                            // todo 记录入参出参
                            now_obj[key] = function () { }
                            break;
                        default:
                            dtavm.log("未知参数2", call_type, WatchName, key, result, call_type2);
                            break;
                    }
                    break;
                default:
                    dtavm.log("未知参数", call_type, WatchName, key, result);
                    break;
            }
        }
        if ((e["config-hook-exclude-func"] || '').trim()){
            unhook_func_list = (e["config-hook-exclude-func"] || '').trim().split(",");
        }
    }

    dtavm.rawlog = console.log
    dtavm.rawclear = console.clear
    dtavm.log = dtavm.rawlog
    delete rawlog
        // 保护伪造函数toString
        ; (() => {
            const $toString = Function.toString
            const myFunction_toString_symbol = Symbol('('.concat('', ')_', (Math.random()) + '').toString(36))
            const myToString = function () {
                return typeof this === 'function' && this[myFunction_toString_symbol] || $toString.call(this)
            }
            function set_native(func, key, value) {
                Object.defineProperty(func, key, {
                    enumerable: false,
                    configurable: true,
                    writable: true,
                    value: value
                })
            }
            delete Function.prototype.toString
            set_native(Function.prototype, "toString", myToString)
            set_native(Function.prototype.toString, myFunction_toString_symbol, "function toString() { [native code] }")
            globalThis.dtavm.func_set_native = (func, name) => {
                set_native(func, myFunction_toString_symbol, `function ${name || func.name || ''}() { [native code] }`)
            }
        }).call(this);

    dtavm.proxy = function (obj, objname, type) {
        function getSubstrings(parts) {
            const results = [];

            for (let i = 0; i < parts.length; i++) {
                results.push(parts.slice(i).join('.'));
            }

            return results;
        }

        function check_proxy(WatchName, result, handler) {
            var proxy_res;

            if (WatchName.includes(".")) {
                // 嵌套代理
                var split_name = WatchName.split(".")
                // window.navigator 要直接返回 navigator
                if (split_name[0] === "window" || split_name[0] === "globalThis" || split_name[0] === "self"
                    || split_name[0] === "top" || split_name[0] === "frames" || split_name[0] === "parent") {
                    var split_name_list = getSubstrings(split_name)
                    for (let i = 0; i < split_name_list.length; i++) {
                        if (unhook_func_list.includes(split_name_list[i])){
                            return result;
                        }
                        if (dtavm.proxy_map.hasOwnProperty(split_name_list[i])) {
                            return dtavm.proxy_map[split_name_list[i]]
                        }
                    }
                    proxy_res = new Proxy(result, handler)
                    dtavm.proxy_map[WatchName] = proxy_res
                    return proxy_res
                }
            }
            if (unhook_func_list.includes(WatchName)){
                return result;
            }
            // 单次代理
            if (dtavm.proxy_map.hasOwnProperty(WatchName)) {
                return dtavm.proxy_map[WatchName]
            }
            proxy_res = new Proxy(result, handler)

            if (WatchName.includes("contentWindow_")) {
                if (dtavm.iframe_proxy_map.hasOwnProperty(WatchName)) {
                    return dtavm.iframe_proxy_map[WatchName]
                }
                dtavm.iframe_proxy_map[WatchName] = proxy_res
            } else {
                dtavm.proxy_map[WatchName] = proxy_res
            }
            return proxy_res
        }

        function check_iframe_proxy(WatchName, result, handler) {
            var proxy_res;
            var split_name = WatchName.split(".")
            if (split_name[0].includes("contentWindow_")) {
                var split_name_list = getSubstrings(split_name).splice(1)
                for (let i = 0; i < split_name_list.length; i++) {
                    var name;
                    if (split_name_list[i].includes("window")) {
                        name = split_name[0] + "." + split_name_list[i]
                    } else {
                        name = split_name[0] + ".window." + split_name_list[i]
                    }
                    if (dtavm.iframe_proxy_map.hasOwnProperty(name)) {
                        return dtavm.iframe_proxy_map[name]
                    }
                }
            }

            if (dtavm.iframe_proxy_map.hasOwnProperty(WatchName)) {
                return dtavm.iframe_proxy_map[WatchName]
            }
            proxy_res = new Proxy(result, handler)
            dtavm.iframe_proxy_map[WatchName] = proxy_res
            return proxy_res
        }

        function getMethodHandler(WatchName, target_obj) {
            let methodhandler = {
                apply(target, thisArg, argArray) {
                    if (this.target_obj) {
                        thisArg = this.target_obj
                    }
                    var err;
                    try {
                        var result = Reflect.apply(target, thisArg, argArray)
                    } catch (e) {
                        dtavm.log(`[${WatchName}] apply function name is [${target.name}], argArray is `, argArray, `error is `, e);
                        err = e;
                    }
                    if (!!target.name) {
                        dtavm.log_env("func", WatchName, target.name)
                    }
                    if (err) {
                        throw err;
                    }

                    if (target.name !== "toString") {
                        if (WatchName === "window.console") {
                        }
                        else if (!target.name) {
                            dtavm.log(`[${WatchName}] apply not name function, argArray is `, argArray, `result is `, result);
                        }
                        else if (result instanceof Promise) {
                            result.then((data) => {
                                dtavm.log(`[${WatchName}] apply function name is [${target.name}], argArray is `, argArray, `result is `, data);
                            })
                        } else {
                            dtavm.log(`[${WatchName}] apply function name is [${target.name}], argArray is `, argArray, `result is `, result);
                        }
                    } else {
                        dtavm.log(`[${WatchName}] apply function name is [${target.name}], argArray is `, argArray, `result is `, result);
                    }
                    return result
                },
                construct(target, argArray, newTarget) {
                    var err;
                    try {
                        var result = Reflect.construct(target, argArray, newTarget)
                    } catch (e) {
                        dtavm.log(`[${WatchName}] construct function name is [${target.name}], argArray is `, argArray, `error is `, e);
                        err = e;
                    }
                    if (!!target.name) {
                        dtavm.log_env("func", WatchName, target.name)
                    }
                    if (err) {
                        throw err;
                    }
                    dtavm.log(`[${WatchName}] construct function name is [${target.name}], argArray is `, argArray, `result is `, result);
                    return result;
                }
            }
            methodhandler.target_obj = target_obj
            return methodhandler
        }

        function getObjhandler(WatchName) {
            let handler = {
                get(target, propKey, receiver) {
                    let result;
                    // todo location.toString()报错  Uncaught TypeError: 'get' on proxy: property 'toString' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value (expected 'function toString() { [native code] }' but got 'function toString() { [native code] }')
                    // 只能改源码修改location的toString 和 valueof熟悉改为可配置 这样就可能被检测了最好还是不要代理location
                    // if (WatchName === "location"){
                    //     // result = location_jyl[propKey]
                    //     dtavm.log(`[${WatchName}] getting propKey is [`, propKey, `], result is [`, result, `]`);
                    //     if (propKey === 'toString' || propKey === 'valueOf') {
                    //         return Reflect.get(target, propKey, receiver).bind(target);
                    //     }

                    //     if (typeof result == "function"){
                    //         // result = result.bind(target)
                    //         // dtavm.func_set_native(result, propKey)
                    //         return check_proxy(`${WatchName}.${propKey}`, result, getMethodHandler(WatchName, target))
                    //     }
                    //     return result
                    // }
                    // // 确保 document.location == window.location = true
                    if ((WatchName === "window" || WatchName === "document") && propKey === "location") {
                        result = dtavm.proxy_map["location"]
                        dtavm.log(`[${WatchName}] getting propKey is [`, propKey, `], result is [`, result, `]`);
                        dtavm.log_env("get", WatchName, propKey, result)
                        return result
                    }
                    result = target[propKey]
                    dtavm.log_env("get", WatchName, propKey, result)
                    if (WatchName === "document" && propKey === "all") {
                        dtavm.log(`[${WatchName}] getting propKey is [`, propKey, `], result is [`, result, `]`);
                        return result
                    }
                    if (result instanceof Object) {
                        if (typeof result === "function") {
                            dtavm.log(`[${WatchName}] getting propKey is [`, propKey, `] , it is function`)
                            return check_proxy(`${WatchName}.${propKey}`, result, getMethodHandler(WatchName, target))
                        }
                        else {
                            dtavm.log(`[${WatchName}] getting propKey is [`, propKey, `], result is [`, result, `]`);
                            if (propKey == "location" || result instanceof Array) {
                                // 不代理 location 和 Array（因为无法用代理器覆盖他的get方法）
                                return result
                            }
                        }
                        return check_proxy(`${WatchName}.${propKey}`, result, getObjhandler(`${WatchName}.${propKey}`))
                    } else if (WatchName.includes("contentWindow_") || WatchName.includes("contentDocument_")) {
                        // 这里不用instanceof Object 因为iframe里面的Object不同于主环境的Object 会返回false
                        if (typeof result == "object") {
                            dtavm.log(`[${WatchName}] getting propKey is [`, propKey, `], result is [`, result, `]`);
                            if (!result || propKey == "location" || result instanceof Array) {
                                return result;
                            }
                            return check_iframe_proxy(`${WatchName}.${propKey}`, result, getObjhandler(`${WatchName}.${propKey}`))
                        } else if (typeof result == "function") {
                            dtavm.log(`[${WatchName}] getting propKey is [`, propKey, `] , it is function`)
                            return check_iframe_proxy(`${WatchName}.${propKey}`, result, getMethodHandler(WatchName, target))
                        }
                    }
                    dtavm.log(`[${WatchName}] getting propKey is [`, propKey, `], result is [`, result, `]`);
                    return result;
                },
                set(target, propKey, value, receiver) {
                    if (value instanceof Object) {
                        dtavm.log(`[${WatchName}] setting propKey is [`, propKey, `], value is [`, value, `]`);
                    } else {
                        dtavm.log(`[${WatchName}] setting propKey is [`, propKey, `], value is [`, value, `]`);
                    }
                    try {
                        Reflect.set(target, propKey, value, receiver);
                    } catch (e) {
                        target[propKey] = value;
                    }
                    //dtavm.log_env("set", WatchName, propKey, value)
                    return value;
                },
                has(target, propKey) {
                    var result = Reflect.has(target, propKey);
                    dtavm.log(`[${WatchName}] has propKey [`, propKey, `], result is [`, result, `]`)
                    if (result) {
                        dtavm.log_env("get", WatchName, propKey, target[propKey])
                    } else{
                        dtavm.log_env("del", WatchName, propKey)
                    }
                    return result;
                },
                deleteProperty(target, propKey) {
                    var result = Reflect.deleteProperty(target, propKey);
                    dtavm.log(`[${WatchName}] delete propKey [`, propKey, `], result is [`, result, `]`)
                    return result;
                },
                defineProperty(target, propKey, attributes) {
                    var result = Reflect.defineProperty(target, propKey, attributes);
                    dtavm.log(`[${WatchName}] defineProperty propKey [`, propKey, `] attributes is [`, attributes, `], result is [`, result, `]`)
                    return result
                },
                getPrototypeOf(target) {
                    var result = Reflect.getPrototypeOf(target)
                    dtavm.log(`[${WatchName}] getPrototypeOf result is [`, result, `]`)
                    return result;
                },
                setPrototypeOf(target, proto) {
                    dtavm.log(`[${WatchName}] setPrototypeOf proto is [`, proto, `]`)
                    return Reflect.setPrototypeOf(target, proto);
                },
                ownKeys(target) {
                    var result = Reflect.ownKeys(target)
                    dtavm.log(`[${WatchName}] invoke ownkeys; result is `, result)
                    return result
                },
                // preventExtensions(target) {
                //     dtavm.log(`[${WatchName}] preventExtensions`)
                //     return Reflect.preventExtensions(target);
                // },
                // isExtensible(target) {
                //     var result = Reflect.isExtensible(target)
                //     dtavm.log(`[${WatchName}] isExtensible, result is [`,result,`]`)
                //     return result;
                // },
            }
            return handler;
        }

        if (type === "method") {
            return check_proxy(objname, obj, getMethodHandler(objname));
        }
        return check_proxy(objname, obj, getObjhandler(objname));
    }
}
dtavm.iframe_proxy_start = function iframe_proxy_start() {
    function defineProperty(obj, key, value, configurable, enumerable, writable, getter, setter) {
        let attr = {
            configurable: configurable,
            enumerable: enumerable
        }
        if (value !== undefined) {
            attr["value"] = value
        }
        if (writable !== undefined) {
            attr["writable"] = writable
        }
        if (getter) {
            attr["get"] = getter
        }
        if (setter) {
            attr["set"] = setter
        }

        Object.defineProperty(obj, key, attr)
    }
    dtavm.raw_contentWindow_get = Object.getOwnPropertyDescriptors(HTMLIFrameElement.prototype)["contentWindow"].get
    dtavm.raw_contentDocument_get = Object.getOwnPropertyDescriptors(HTMLIFrameElement.prototype)["contentDocument"].get

    defineProperty(HTMLIFrameElement.prototype, "contentWindow", undefined, true, true, undefined, function () {
        var result = dtavm.raw_contentWindow_get.call(this);
        if (!this._name) {
            this._name = +new Date() + "_" + (Math.random() + "").split(".")[1]
        }
        dtavm.log(`[HTMLIFrameElement.prototype] getting propKey is [contentWindow_${this._name}], value is`, result);
        if (result) {
            return dtavm.proxy(result, "contentWindow_" + this._name + ".window");
        } else {
            return result;
        }
    }, undefined)
    defineProperty(HTMLIFrameElement.prototype, "contentDocument", undefined, true, true, undefined, function () {
        var result = dtavm.raw_contentDocument_get.call(this);
        if (!this._name) {
            this._name = +new Date() + "_" + (Math.random() + "").split(".")[1]
        }
        dtavm.log(`[HTMLIFrameElement.prototype] getting propKey is [contentWindow_${this._name}.document], value is`, result);
        if (result) {
            return dtavm.proxy(result, "contentWindow_" + this._name + ".window.document");
        } else {
            return result;
        }

    }, undefined)
    dtavm.func_set_native(Object.getOwnPropertyDescriptors(HTMLIFrameElement.prototype)["contentWindow"].get, "contentWindow");
    dtavm.func_set_native(Object.getOwnPropertyDescriptors(HTMLIFrameElement.prototype)["contentDocument"].get, "contentDocument");
}
dtavm.function_proxy = function function_proxy() {
    // todo hook 这种 new (Function.bind.apply(X, J))
    let filter_func_list = ["Function", "eval", "Object", "Array", "Number", "parseFloat", "parseInt", "Boolean", "String", "Symbol", "Date", "Promise", "RegExp", "Error", "AggregateError", "EvalError", "RangeError", "ReferenceError", "SyntaxError", "TypeError", "URIError", "ArrayBuffer", "Uint8Array", "Int8Array", "Uint16Array", "Int16Array", "Uint32Array", "Int32Array", "Float32Array", "Float64Array", "Uint8ClampedArray", "BigUint64Array", "BigInt64Array", "DataView", "Map", "BigInt", "Set", "WeakMap", "WeakSet", "Proxy", "FinalizationRegistry", "WeakRef", "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "escape", "unescape", "isFinite", "isNaN", "SharedArrayBuffer", "VMError", "Buffer"];
    const all_func = Reflect.ownKeys(globalThis)
    const globalFunctions = all_func.filter((key) => {
        var result = globalThis[key];
        if (typeof result === 'function' && !filter_func_list.includes(key)) {
            eval(`${key}=window.${key}`)
            return key;
        }
    });
    dtavm.log("hook 全局函数列表", globalFunctions)

}
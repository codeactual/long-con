(function() {
    function require(path, parent, orig) {
        var resolved = require.resolve(path);
        if (null == resolved) {
            orig = orig || path;
            parent = parent || "root";
            var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
            err.path = orig;
            err.parent = parent;
            err.require = true;
            throw err;
        }
        var module = require.modules[resolved];
        if (!module.exports) {
            module.exports = {};
            module.client = module.component = true;
            module.call(this, module.exports, require.relative(resolved), module);
        }
        return module.exports;
    }
    require.modules = {};
    require.aliases = {};
    require.resolve = function(path) {
        if (path.charAt(0) === "/") path = path.slice(1);
        var index = path + "/index.js";
        var paths = [ path, path + ".js", path + ".json", path + "/index.js", path + "/index.json" ];
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            if (require.modules.hasOwnProperty(path)) return path;
        }
        if (require.aliases.hasOwnProperty(index)) {
            return require.aliases[index];
        }
    };
    require.normalize = function(curr, path) {
        var segs = [];
        if ("." != path.charAt(0)) return path;
        curr = curr.split("/");
        path = path.split("/");
        for (var i = 0; i < path.length; ++i) {
            if (".." == path[i]) {
                curr.pop();
            } else if ("." != path[i] && "" != path[i]) {
                segs.push(path[i]);
            }
        }
        return curr.concat(segs).join("/");
    };
    require.register = function(path, definition) {
        require.modules[path] = definition;
    };
    require.alias = function(from, to) {
        if (!require.modules.hasOwnProperty(from)) {
            throw new Error('Failed to alias "' + from + '", it does not exist');
        }
        require.aliases[to] = from;
    };
    require.relative = function(parent) {
        var p = require.normalize(parent, "..");
        function lastIndexOf(arr, obj) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === obj) return i;
            }
            return -1;
        }
        function localRequire(path) {
            var resolved = localRequire.resolve(path);
            return require(resolved, parent, path);
        }
        localRequire.resolve = function(path) {
            var c = path.charAt(0);
            if ("/" == c) return path.slice(1);
            if ("." == c) return require.normalize(p, path);
            var segs = parent.split("/");
            var i = lastIndexOf(segs, "deps") + 1;
            if (!i) i = 0;
            path = segs.slice(0, i + 1).join("/") + "/deps/" + path;
            return path;
        };
        localRequire.exists = function(path) {
            return require.modules.hasOwnProperty(localRequire.resolve(path));
        };
        return localRequire;
    };
    require.register("visionmedia-configurable.js/index.js", function(exports, require, module) {
        module.exports = function(obj) {
            obj.settings = {};
            obj.set = function(name, val) {
                if (1 == arguments.length) {
                    for (var key in name) {
                        this.set(key, name[key]);
                    }
                } else {
                    this.settings[name] = val;
                }
                return this;
            };
            obj.get = function(name) {
                return this.settings[name];
            };
            obj.enable = function(name) {
                return this.set(name, true);
            };
            obj.disable = function(name) {
                return this.set(name, false);
            };
            obj.enabled = function(name) {
                return !!this.get(name);
            };
            obj.disabled = function(name) {
                return !this.get(name);
            };
            return obj;
        };
    });
    require.register("codeactual-extend/index.js", function(exports, require, module) {
        module.exports = function extend(object) {
            var args = Array.prototype.slice.call(arguments, 1);
            for (var i = 0, source; source = args[i]; i++) {
                if (!source) continue;
                for (var property in source) {
                    object[property] = source[property];
                }
            }
            return object;
        };
    });
    require.register("qualiancy-tea-properties/lib/properties.js", function(exports, require, module) {
        var exports = module.exports = {};
        exports.get = function(obj, path) {
            var parsed = parsePath(path);
            return getPathValue(parsed, obj);
        };
        exports.set = function(obj, path, val) {
            var parsed = parsePath(path);
            setPathValue(parsed, val, obj);
        };
        function defined(val) {
            return "undefined" === typeof val;
        }
        function parsePath(path) {
            var str = path.replace(/\[/g, ".["), parts = str.match(/(\\\.|[^.]+?)+/g);
            return parts.map(function(value) {
                var re = /\[(\d+)\]$/, mArr = re.exec(value);
                if (mArr) return {
                    i: parseFloat(mArr[1])
                }; else return {
                    p: value
                };
            });
        }
        function getPathValue(parsed, obj) {
            var tmp = obj, res;
            for (var i = 0, l = parsed.length; i < l; i++) {
                var part = parsed[i];
                if (tmp) {
                    if (!defined(part.p)) tmp = tmp[part.p]; else if (!defined(part.i)) tmp = tmp[part.i];
                    if (i == l - 1) res = tmp;
                } else {
                    res = undefined;
                }
            }
            return res;
        }
        function setPathValue(parsed, val, obj) {
            var tmp = obj;
            for (var i = 0, l = parsed.length; i < l; i++) {
                var part = parsed[i];
                if (!defined(tmp)) {
                    if (i == l - 1) {
                        if (!defined(part.p)) tmp[part.p] = val; else if (!defined(part.i)) tmp[part.i] = val;
                    } else {
                        if (!defined(part.p) && tmp[part.p]) tmp = tmp[part.p]; else if (!defined(part.i) && tmp[part.i]) tmp = tmp[part.i]; else {
                            var next = parsed[i + 1];
                            if (!defined(part.p)) {
                                tmp[part.p] = {};
                                tmp = tmp[part.p];
                            } else if (!defined(part.i)) {
                                tmp[part.i] = [];
                                tmp = tmp[part.i];
                            }
                        }
                    }
                } else {
                    if (i == l - 1) tmp = val; else if (!defined(part.p)) tmp = {}; else if (!defined(part.i)) tmp = [];
                }
            }
        }
    });
    require.register("long-con/lib/component/main.js", function(exports, require, module) {
        module.exports = {
            requireComponent: require
        };
    });
    require.alias("visionmedia-configurable.js/index.js", "long-con/deps/configurable.js/index.js");
    require.alias("codeactual-extend/index.js", "long-con/deps/extend/index.js");
    require.alias("qualiancy-tea-properties/lib/properties.js", "long-con/deps/tea-properties/lib/properties.js");
    require.alias("qualiancy-tea-properties/lib/properties.js", "long-con/deps/tea-properties/index.js");
    require.alias("qualiancy-tea-properties/lib/properties.js", "qualiancy-tea-properties/index.js");
    require.alias("long-con/lib/component/main.js", "long-con/index.js");
    if (typeof exports == "object") {
        module.exports = require("long-con");
    } else if (typeof define == "function" && define.amd) {
        define(function() {
            return require("long-con");
        });
    } else {
        window["nc"] = require("long-con");
    }
})();
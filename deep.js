/*global reduce, count, shift*/

function feach(obj, func) {
    if (obj instanceof Array) {
        return obj.forEach(func);
    }
    if (typeof obj === "object") {
        var key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                func(obj[key], key, obj);
            }
        }
        return;
    }
    throw "Illegal forEach on non object nor array variable";
}

function map(obj, func) {
    if (obj instanceof Array) {
        return obj.map(func);
    }
    if (typeof obj === "object") {
        var key, result = [];

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                result.push(func(obj[key], key, obj));
            }
        }
        return result;
    }
    throw "Illegal map on non object nor array variable";
}

function rduce(obj, func, result) {
    if (obj instanceof Array) {
        return obj.reduce(func, result);
    }
    if (typeof obj === "object") {
        var key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                result = func(result, obj[key], key, obj);
            }
        }
        return result;
    }
    throw "Illegal rduce on non object nor array variable";
}

function count(obj) {
    if (obj instanceof Array || typeof obj === "object") {
        return rduce(
            obj,
            function (total) {
                return total + 1;
            },
            0
        );
    }
    return 1;
}

function unshift(obj, value) {
    if (obj instanceof Array) {
        if (obj[0] instanceof Array || typeof obj[0] === "object") {
            unshift(obj[0], value);
        } else {
            obj[0] = value;
        }
    } else if (typeof obj === "object") {
        rduce(obj,
            function (value, old, key, obj) {
                if (old instanceof Array || typeof old === "object") {
                    unshift(old, value);
                } else if (value !== undefined) {
                    obj[key] = value;
                }
            },
            value
        );
    } else {
        return value;
    }
    return obj;
}

function shift(obj) {
    if (obj instanceof Array) {
        return obj.shift();
    }
    if (typeof obj === "object") {
        return rduce(obj,
            function (result, value, key, obj) {
                if (result === undefined) {
                    delete obj[key];
                    return value;
                }
                return result;
            }
        );
    }
    return obj;
}

function shiftKey(obj) {
    if (obj instanceof Array) {
        obj.shift();
        return 0;
    }
    if (typeof obj === "object") {
        return rduce(obj,
            function (result, value, key, obj) {
                if (result === undefined) {
                    delete obj[key];
                    return key;
                }
                return result;
            }
        );
    }
    return obj;
}

function merge(obj1, obj2) {
    if (obj2 !== undefined) {
        feach(obj2,
            function forEachMerge(value, key) {
                obj1[key] = value;
            });
    }
    return obj1;
}

var deep = (function buildDeep() {
    function deepArray(obj, fields, up) {
        var result = fields.reduce(
            function (result, field) {
                var res;

                if (obj instanceof Array|| typeof obj === "object") {
                    res = map(
                        obj,
                        function (el) {
                            return deep(el, field, up);
                        }
                    );
                } else {
                    res = deep(obj, field, up);
                }
                result.push(res);
                return result;
            },
            []
        );

        if (count(result) < 2) {
            return result.shift();
        }
        return result;
    }

    function deepObject(obj, fields, up) {
        var result = rduce(
            fields,
            function (result, value, field) {
                var temp = field !== "" ? obj[field] : obj,
                    res;

                if (typeof value === "string") {
                    if (up) {
                        return obj;
                    }
                    result[value || field] = temp;
                } else {
                    res = deep(temp, value, up);
                    if (typeof field === "object" && typeof res === "object") {
                        result = merge(result, res);
                    } else {//if (res !== undefined) {
                        result[field] = res;
                    }
                }
                return result;
            },
            {}
        );

        if (count(result) < 2) {
            return shift(result);
        }
        return result;
    }

    function deepFunction(obj, f) {
        return f(obj);
    }

    function deepString(obj, field, up) {
        if (field === "" || up === true) {
            return obj;
        }
        return obj[field];
    }

    return function deep(obj, fields, up) {
        if (obj !== undefined &&
                fields !== undefined &&
                count(fields) > 0) {
            var func;

            if (typeof fields === "string" ||
                    typeof fields === "number") {
                func = deepString;
            } else if (typeof fields === "function") {
                func = deepFunction;
            } else if (fields instanceof Array) {
                func = deepArray;
            } else if (typeof fields === "object") {
                func = deepObject;
            }
            return func(obj, fields, up);
        }
        return obj;
    };
}());

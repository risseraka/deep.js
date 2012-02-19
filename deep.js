var is = (function () {
    function buildTypeFunc(type) {
        return function (obj) {
            return Object.prototype.toString.call(obj) === "[object " + type + "]";
        };
    }

    var that = {},
        types = ["Array", "RegExp", "Date", "Number", "String", "Object", "Function"],
        i;

    for (i = types.length - 1; i >= 0; i -= 1) {
        that[types[i]] = buildTypeFunc(types[i]);
    }
    return that;
}());

function rduce(obj, func, result) {
    if (is.Array(obj)) {
        return obj.reduce(func, result);
    } else if (is.Object(obj)) {
        var i;

        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                result = func(result, obj[i], i, obj);
            }
        }
        return result;
    }
    throw "Illegal rduce on non object nor array variable";
}

var deep = (function () {
    function deepStraight(obj, field, up) {
        if (up) {
            return obj;
        }
        if (obj !== undefined) {
            return obj[field];
        }
    }

    function deepArr(obj, fields, up) {
        return fields.map(
            function (field) {
                return obj.map(
                    function (value) {
                        return deep(value, field, up);
                    }
                );
            }
        );
    }

    function deepObj(obj, fields, up) {
        var result = rduce(
            fields,
            function (result, fields, key) {
                var res = deep(obj[key], fields, up);

                result.push(res);
                return result;
            },
            []
        );
        return result;
    }

    return function deep(obj, fields, up) {
        if (!fields) {
            return obj;
        }

        var result;

        if (is.Object(fields)) {
            result = deepObj(obj, fields, up);
        } else if (is.Array(fields)) {
            result = deepArr(obj, fields, up);
        } else {
            result = deepStraight(obj, fields, up);
        }
        if (is.Array(result) &&
                result.length === 1) {
            result = result.shift();
        }
        return result;
    };
}());
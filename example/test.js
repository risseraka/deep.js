/*global deep, console*/

function buildTests(obj, test) {
    function plusOne(a) {
        if (a !== undefined) {
            return a + 1;
        }
    }

    function getLength(a) {
        if (a !== undefined) {
            return a["length"];
        }
    }

    function identity(a) {
        return a;
    }

    function buildTest(object, values, responses) {
        return values.map(
            function (value, i) {
                var temp = JSON.parse(JSON.stringify(object));

                return [[obj, unshift(temp, value)], responses[i]];
            }
        );
    }

    var resArr;
    if (obj instanceof Array || typeof obj === "object") {
        resArr = map(obj, identity);
        plusOnedMap = map(obj, plusOne);
        resLengthMap = map(obj, getLength);
        plusOnedResLengthMap = map(obj, function (a) {
            return plusOne(getLength(a));
        });
    }

    var resLength = getLength(obj),
        plusOned = plusOne(obj),
        plusOnedResLength = resLength !== undefined ? plusOne(resLength) : undefined,
        resLengthToString = resLength !== undefined ? resLength.toString : undefined;

    var values = ["", {}, [], plusOne, "length"];

    var testundefined = [
        [[obj], obj]
    ];

    var testString = buildTest(
        "",
        values,
        [
            obj,
            obj,
            obj,
            plusOned,
            resLength
        ]
    );

    var testObject = buildTest(
        {"": ""},
        values,
        [
            obj,
            obj,
            obj,
            plusOned,
            obj,
        ]
    );

    var testObjectString = buildTest(
        {"length": ""},
        values.concat([
            "alias",
            {"toString": ""}
        ]),
        [
            resLength,
            resLength,
            resLength,
            plusOnedResLength,
            resLength,
            resLength,
            resLength !== undefined ?
                resLength.toString :
                undefined
        ]
    );

    var testObjectObject = buildTest(
        {"": "", "length": ""},
        values.concat([
            "alias",
            {"length": ""}
        ]),
        [
            {"": obj, "length": resLength},
            {"": obj, "length": resLength},
            {"": obj, "length": resLength},
            {"": plusOned, "length": resLength},
            resLength,
            {"alias": obj, "length": resLength},
            {"": resLength, "length": resLength}
        ]
    );

    var testArray = buildTest(
        [],
        values,
        (obj instanceof Array || typeof obj === "object") ?
            [
                resArr,
                resArr,
                resArr,
                plusOnedMap,
                resLengthMap,
            ] :
            [
                obj,
                obj,
                obj,
                plusOned,
                resLength,
            ]
    );

    var testArrayObject = buildTest(
        [{"": ""}],
        values,
        (obj instanceof Array || typeof obj === "object") ?
            [
                resArr,
                resArr,
                resArr,
                plusOnedMap,
                resArr,
            ] :
            [
                obj,
                obj,
                obj,
                plusOned,
                obj,
            ]
    );

    var testArrayArray = buildTest(
        ["", ""],
        values,
        (obj instanceof Array || typeof obj === "object") ?
            [
                [resArr, resArr],
                [resArr, resArr],
                [resArr, resArr],
                [plusOnedMap, resArr],
                [resLengthMap, resArr]
            ] :
            [
                [obj, obj],
                [obj, obj],
                [obj, obj],
                [plusOned, obj],
                [resLength, obj]
            ]
    );

    var testArrayObjectLength = buildTest(
        [{"length": ""}],
        values,
        (obj instanceof Array || typeof obj === "object") ?
            [
                resLengthMap,
                resLengthMap,
                resLengthMap,
                plusOnedResLengthMap,
                resLengthMap
            ] :
            [
                resLength,
                resLength,
                resLength,
                plusOnedResLength,
                resLength
            ]
    );

    var testArrayObjectLengthToString = buildTest(
        [{"length": {"toString": ""}}],
        values,
        (obj instanceof Array || typeof obj === "object") ?
            [
                resLengthMap,
                resLengthMap,
                resLengthMap,
                plusOnedResLengthMap,
                resLengthMap
            ] :
            [
                resLengthToString,
                resLengthToString,
                resLengthToString,
                plusOne(resLengthToString),
                resLengthToString
            ]
    );

    var testArrayArrayObjectLengthToString = buildTest(
        ["", {"length": {"toString": ""}}],
        values,
        (obj instanceof Array || typeof obj === "object") ?
            [
                [resArr, resLengthMap],
                [resArr, resLengthMap],
                [resArr, resLengthMap],
                [plusOnedMap, resLengthMap],
                [resLengthMap, resLengthMap]
            ] :
            [
                [obj, resLengthToString],
                [obj, resLengthToString],
                [obj, resLengthToString],
                [plusOned, resLengthToString],
                [resLength, resLengthToString]
            ]
    );

    return [].concat(testundefined, testString, testObject, testObjectString, testObjectObject,
         testArray, testArrayObject, testArrayArray, testArrayObjectLength,
         testArrayObjectLengthToString, testArrayArrayObjectLengthToString);
}

function runTests(tests, detailed) {
    var result = tests.map(
            function passingTests(test, i) {
                var params = test[0],
                    actual,
                    passed = true,
                    expected = test[1];

                try {
                    if (params[0] !== undefined) {
                        actual = deep.apply(this, params);

                        if (typeof expected === "function") {
                            passed = actual === expected;
                        } else {
                            passed = JSON.stringify(actual) === JSON.stringify(expected);
                        }
                    } else {
                        expected = undefined;
                    }
                } catch (e) {
                    passed = false;
                }
                if (detailed) {
                    console.log(i + ":", passed, params, actual, expected);
                }
                return passed;
            }
        ),
        ok = 0,
        notok = 0;

    result.forEach(function (passed) {
            if (passed === true) {
                ok += 1;
            } else {
                notok += 1;
            }
        });

    if (notok === 0) {
        console.log("All tests passed successfully!");
    } else {
        console.log("Tests failed!", ok, "/", result.length, "(failed:", notok + ")");
    }
}

function runAllTests() {
    var tests = [1, "test", [1, 2, 3], {"1": 2, "3": 4}];

    tests.map(
        function (test) {
            console.log("Running tests on:", JSON.stringify(test));
            runTests(buildTests(test));
        }
    );
}

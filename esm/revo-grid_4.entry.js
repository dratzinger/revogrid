import { g as getRenderingRef, f as forceUpdate, h, r as registerInstance, c as getElement } from './index-b7d7b9ba.js';

const appendToMap = (map, propName, value) => {
    const items = map.get(propName);
    if (!items) {
        map.set(propName, [value]);
    }
    else if (!items.includes(value)) {
        items.push(value);
    }
};
const debounce = (fn, ms) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            timeoutId = 0;
            fn(...args);
        }, ms);
    };
};

/**
 * Check if a possible element isConnected.
 * The property might not be there, so we check for it.
 *
 * We want it to return true if isConnected is not a property,
 * otherwise we would remove these elements and would not update.
 *
 * Better leak in Edge than to be useless.
 */
const isConnected = (maybeElement) => !('isConnected' in maybeElement) || maybeElement.isConnected;
const cleanupElements = debounce((map) => {
    for (let key of map.keys()) {
        map.set(key, map.get(key).filter(isConnected));
    }
}, 2000);
const stencilSubscription = ({ on }) => {
    const elmsToUpdate = new Map();
    if (typeof getRenderingRef === 'function') {
        // If we are not in a stencil project, we do nothing.
        // This function is not really exported by @stencil/core.
        on('get', (propName) => {
            const elm = getRenderingRef();
            if (elm) {
                appendToMap(elmsToUpdate, propName, elm);
            }
        });
        on('set', (propName) => {
            const elements = elmsToUpdate.get(propName);
            if (elements) {
                elmsToUpdate.set(propName, elements.filter(forceUpdate));
            }
            cleanupElements(elmsToUpdate);
        });
        on('reset', () => {
            elmsToUpdate.forEach((elms) => elms.forEach(forceUpdate));
            cleanupElements(elmsToUpdate);
        });
    }
};

const createObservableMap = (defaultState) => {
    let states = new Map(Object.entries(defaultState !== null && defaultState !== void 0 ? defaultState : {}));
    const handlers = {
        get: [],
        set: [],
        reset: [],
    };
    const reset = () => {
        states = new Map(Object.entries(defaultState !== null && defaultState !== void 0 ? defaultState : {}));
        handlers.reset.forEach((cb) => cb());
    };
    const get = (propName) => {
        handlers.get.forEach((cb) => cb(propName));
        return states.get(propName);
    };
    const set = (propName, value) => {
        const oldValue = states.get(propName);
        if (oldValue !== value || typeof value === 'object') {
            states.set(propName, value);
            handlers.set.forEach((cb) => cb(propName, value, oldValue));
        }
    };
    const state = (typeof Proxy === 'undefined'
        ? {}
        : new Proxy(defaultState, {
            get(_, propName) {
                return get(propName);
            },
            ownKeys(_) {
                return Array.from(states.keys());
            },
            getOwnPropertyDescriptor() {
                return {
                    enumerable: true,
                    configurable: true,
                };
            },
            has(_, propName) {
                return states.has(propName);
            },
            set(_, propName, value) {
                set(propName, value);
                return true;
            },
        }));
    const on = (eventName, callback) => {
        handlers[eventName].push(callback);
        return () => {
            removeFromArray(handlers[eventName], callback);
        };
    };
    const onChange = (propName, cb) => {
        const unSet = on('set', (key, newValue) => {
            if (key === propName) {
                cb(newValue);
            }
        });
        const unReset = on('reset', () => cb(defaultState[propName]));
        return () => {
            unSet();
            unReset();
        };
    };
    const use = (...subscriptions) => subscriptions.forEach((subscription) => {
        if (subscription.set) {
            on('set', subscription.set);
        }
        if (subscription.get) {
            on('get', subscription.get);
        }
        if (subscription.reset) {
            on('reset', subscription.reset);
        }
    });
    return {
        state,
        get,
        set,
        on,
        onChange,
        use,
        reset,
    };
};
const removeFromArray = (array, item) => {
    const index = array.indexOf(item);
    if (index >= 0) {
        array[index] = array[array.length - 1];
        array.length--;
    }
};

const createStore = (defaultState) => {
    const map = createObservableMap(defaultState);
    stencilSubscription(map);
    return map;
};

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

var _isPrototype = isPrototype;

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

var _overArg = overArg;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = _overArg(Object.keys, Object);

var _nativeKeys = nativeKeys;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto$1.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!_isPrototype(object)) {
    return _nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

var _baseKeys = baseKeys;

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = _freeGlobal || freeSelf || Function('return this')();

var _root = root;

/** Built-in value references. */
var Symbol$1 = _root.Symbol;

var _Symbol = Symbol$1;

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto$2.toString;

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty$1.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

var _getRawTag = getRawTag;

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$3.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

var _objectToString = objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag$1 && symToStringTag$1 in Object(value))
    ? _getRawTag(value)
    : _objectToString(value);
}

var _baseGetTag = baseGetTag;

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject;

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject_1(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = _baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

var isFunction_1 = isFunction;

/** Used to detect overreaching core-js shims. */
var coreJsData = _root['__core-js_shared__'];

var _coreJsData = coreJsData;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

var _isMasked = isMasked;

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

var _toSource = toSource;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto$1 = Function.prototype,
    objectProto$4 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$4.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString$1.call(hasOwnProperty$2).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject_1(value) || _isMasked(value)) {
    return false;
  }
  var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
  return pattern.test(_toSource(value));
}

var _baseIsNative = baseIsNative;

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

var _getValue = getValue;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = _getValue(object, key);
  return _baseIsNative(value) ? value : undefined;
}

var _getNative = getNative;

/* Built-in method references that are verified to be native. */
var DataView = _getNative(_root, 'DataView');

var _DataView = DataView;

/* Built-in method references that are verified to be native. */
var Map$1 = _getNative(_root, 'Map');

var _Map = Map$1;

/* Built-in method references that are verified to be native. */
var Promise = _getNative(_root, 'Promise');

var _Promise = Promise;

/* Built-in method references that are verified to be native. */
var Set = _getNative(_root, 'Set');

var _Set = Set;

/* Built-in method references that are verified to be native. */
var WeakMap$1 = _getNative(_root, 'WeakMap');

var _WeakMap = WeakMap$1;

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = _toSource(_DataView),
    mapCtorString = _toSource(_Map),
    promiseCtorString = _toSource(_Promise),
    setCtorString = _toSource(_Set),
    weakMapCtorString = _toSource(_WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = _baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (_Map && getTag(new _Map) != mapTag) ||
    (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
    (_Set && getTag(new _Set) != setTag) ||
    (_WeakMap && getTag(new _WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = _baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? _toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

var _getTag = getTag;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

var isLength_1 = isLength;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength_1(value.length) && !isFunction_1(value);
}

var isArrayLike_1 = isArrayLike;

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

var isArray_1 = isArray;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike;

/** `Object#toString` result references. */
var stringTag = '[object String]';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray_1(value) && isObjectLike_1(value) && _baseGetTag(value) == stringTag);
}

var isString_1 = isString;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

var _baseProperty = baseProperty;

/**
 * Gets the size of an ASCII `string`.
 *
 * @private
 * @param {string} string The string inspect.
 * @returns {number} Returns the string size.
 */
var asciiSize = _baseProperty('length');

var _asciiSize = asciiSize;

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

var _hasUnicode = hasUnicode;

/** Used to compose unicode character classes. */
var rsAstralRange$1 = '\\ud800-\\udfff',
    rsComboMarksRange$1 = '\\u0300-\\u036f',
    reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange$1 = '\\u20d0-\\u20ff',
    rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1,
    rsVarRange$1 = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange$1 + ']',
    rsCombo = '[' + rsComboRange$1 + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange$1 + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsZWJ$1 = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange$1 + ']?',
    rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Gets the size of a Unicode `string`.
 *
 * @private
 * @param {string} string The string inspect.
 * @returns {number} Returns the string size.
 */
function unicodeSize(string) {
  var result = reUnicode.lastIndex = 0;
  while (reUnicode.test(string)) {
    ++result;
  }
  return result;
}

var _unicodeSize = unicodeSize;

/**
 * Gets the number of symbols in `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the string size.
 */
function stringSize(string) {
  return _hasUnicode(string)
    ? _unicodeSize(string)
    : _asciiSize(string);
}

var _stringSize = stringSize;

/** `Object#toString` result references. */
var mapTag$1 = '[object Map]',
    setTag$1 = '[object Set]';

/**
 * Gets the size of `collection` by returning its length for array-like
 * values or the number of own enumerable string keyed properties for objects.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object|string} collection The collection to inspect.
 * @returns {number} Returns the collection size.
 * @example
 *
 * _.size([1, 2, 3]);
 * // => 3
 *
 * _.size({ 'a': 1, 'b': 2 });
 * // => 2
 *
 * _.size('pebbles');
 * // => 7
 */
function size(collection) {
  if (collection == null) {
    return 0;
  }
  if (isArrayLike_1(collection)) {
    return isString_1(collection) ? _stringSize(collection) : collection.length;
  }
  var tag = _getTag(collection);
  if (tag == mapTag$1 || tag == setTag$1) {
    return collection.size;
  }
  return _baseKeys(collection).length;
}

var size_1 = size;

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

var _arrayEach = arrayEach;

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

var _createBaseFor = createBaseFor;

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = _createBaseFor();

var _baseFor = baseFor;

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

var _baseTimes = baseTimes;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
}

var _baseIsArguments = baseIsArguments;

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$5.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
  return isObjectLike_1(value) && hasOwnProperty$3.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

var isArguments_1 = isArguments;

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

var stubFalse_1 = stubFalse;

var isBuffer_1 = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports =  exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? _root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse_1;

module.exports = isBuffer;
});

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$1 : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

var _isIndex = isIndex;

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag$1 = '[object Function]',
    mapTag$2 = '[object Map]',
    numberTag = '[object Number]',
    objectTag$1 = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag$2 = '[object Set]',
    stringTag$1 = '[object String]',
    weakMapTag$1 = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag$1 = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag$2] = typedArrayTags[numberTag] =
typedArrayTags[objectTag$1] = typedArrayTags[regexpTag] =
typedArrayTags[setTag$2] = typedArrayTags[stringTag$1] =
typedArrayTags[weakMapTag$1] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike_1(value) &&
    isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
}

var _baseIsTypedArray = baseIsTypedArray;

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

var _baseUnary = baseUnary;

var _nodeUtil = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports =  exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && _freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;
});

/* Node.js helper references. */
var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

var isTypedArray_1 = isTypedArray;

/** Used for built-in method references. */
var objectProto$6 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$6.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray_1(value),
      isArg = !isArr && isArguments_1(value),
      isBuff = !isArr && !isArg && isBuffer_1(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? _baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$4.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           _isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

var _arrayLikeKeys = arrayLikeKeys;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
}

var keys_1 = keys;

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && _baseFor(object, iteratee, keys_1);
}

var _baseForOwn = baseForOwn;

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike_1(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

var _createBaseEach = createBaseEach;

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = _createBaseEach(_baseForOwn);

var _baseEach = baseEach;

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

var identity_1 = identity;

/**
 * Casts `value` to `identity` if it's not a function.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Function} Returns cast function.
 */
function castFunction(value) {
  return typeof value == 'function' ? value : identity_1;
}

var _castFunction = castFunction;

/**
 * Iterates over elements of `collection` and invokes `iteratee` for each element.
 * The iteratee is invoked with three arguments: (value, index|key, collection).
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length"
 * property are iterated like arrays. To avoid this behavior use `_.forIn`
 * or `_.forOwn` for object iteration.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @alias each
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 * @see _.forEachRight
 * @example
 *
 * _.forEach([1, 2], function(value) {
 *   console.log(value);
 * });
 * // => Logs `1` then `2`.
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forEach(collection, iteratee) {
  var func = isArray_1(collection) ? _arrayEach : _baseEach;
  return func(collection, _castFunction(iteratee));
}

var forEach_1 = forEach;

var each = forEach_1;

/**
* Global stores data
*/
function setStore(store, data) {
    each(data, (val, key) => {
        store.set(key, val);
    });
}

class DataProviderObject {
    constructor(store) {
        this.store = store;
    }
    data(r, c) {
        const { prop, model } = this.rowDataModel(r, c);
        return model[prop] || '';
    }
    rowDataModel(r, c) {
        var _a;
        const prop = (_a = this.store.get('columns')[c]) === null || _a === void 0 ? void 0 : _a.prop;
        const model = this.store.get('data')[r] || {};
        return {
            prop, model
        };
    }
}
class HeaderProviderObject {
    constructor(store) {
        this.store = store;
    }
    data(c) {
        var _a;
        return ((_a = this.store.get('columns')[c]) === null || _a === void 0 ? void 0 : _a.name) || '';
    }
    template(c) {
        return this.store.get('columns')[c].cellTemplate;
    }
}
class DataProvider {
    constructor(store) {
        this.store = store;
        this.columnProvider = new HeaderProviderObject(this.store);
        this.dataProvider = new DataProviderObject(this.store);
    }
    data(r, c) {
        const tpl = this.columnProvider.template(c);
        if (tpl) {
            return tpl(h, this.dataProvider.rowDataModel(r, c));
        }
        return this.dataProvider.data(r, c);
    }
    header(c) {
        return this.columnProvider.data(c);
    }
}

class DataSource {
    constructor(store) {
        this.store = store;
        this.provider = new DataProvider(this.store);
    }
    setData(data) {
        setStore(this.store, { data });
    }
    setColumn(columns) {
        setStore(this.store, { columns });
    }
}

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike_1(value) && _baseGetTag(value) == symbolTag);
}

var isSymbol_1 = isSymbol;

/** Used as references for the maximum length and index of an array. */
var MAX_ARRAY_LENGTH = 4294967295,
    MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeFloor = Math.floor,
    nativeMin = Math.min;

/**
 * The base implementation of `_.sortedIndexBy` and `_.sortedLastIndexBy`
 * which invokes `iteratee` for `value` and each element of `array` to compute
 * their sort ranking. The iteratee is invoked with one argument; (value).
 *
 * @private
 * @param {Array} array The sorted array to inspect.
 * @param {*} value The value to evaluate.
 * @param {Function} iteratee The iteratee invoked per element.
 * @param {boolean} [retHighest] Specify returning the highest qualified index.
 * @returns {number} Returns the index at which `value` should be inserted
 *  into `array`.
 */
function baseSortedIndexBy(array, value, iteratee, retHighest) {
  value = iteratee(value);

  var low = 0,
      high = array == null ? 0 : array.length,
      valIsNaN = value !== value,
      valIsNull = value === null,
      valIsSymbol = isSymbol_1(value),
      valIsUndefined = value === undefined;

  while (low < high) {
    var mid = nativeFloor((low + high) / 2),
        computed = iteratee(array[mid]),
        othIsDefined = computed !== undefined,
        othIsNull = computed === null,
        othIsReflexive = computed === computed,
        othIsSymbol = isSymbol_1(computed);

    if (valIsNaN) {
      var setLow = retHighest || othIsReflexive;
    } else if (valIsUndefined) {
      setLow = othIsReflexive && (retHighest || othIsDefined);
    } else if (valIsNull) {
      setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
    } else if (valIsSymbol) {
      setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
    } else if (othIsNull || othIsSymbol) {
      setLow = false;
    } else {
      setLow = retHighest ? (computed <= value) : (computed < value);
    }
    if (setLow) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return nativeMin(high, MAX_ARRAY_INDEX);
}

var _baseSortedIndexBy = baseSortedIndexBy;

/** Used as references for the maximum length and index of an array. */
var MAX_ARRAY_LENGTH$1 = 4294967295,
    HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH$1 >>> 1;

/**
 * The base implementation of `_.sortedIndex` and `_.sortedLastIndex` which
 * performs a binary search of `array` to determine the index at which `value`
 * should be inserted into `array` in order to maintain its sort order.
 *
 * @private
 * @param {Array} array The sorted array to inspect.
 * @param {*} value The value to evaluate.
 * @param {boolean} [retHighest] Specify returning the highest qualified index.
 * @returns {number} Returns the index at which `value` should be inserted
 *  into `array`.
 */
function baseSortedIndex(array, value, retHighest) {
  var low = 0,
      high = array == null ? low : array.length;

  if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
    while (low < high) {
      var mid = (low + high) >>> 1,
          computed = array[mid];

      if (computed !== null && !isSymbol_1(computed) &&
          (retHighest ? (computed <= value) : (computed < value))) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return high;
  }
  return _baseSortedIndexBy(array, value, identity_1, retHighest);
}

var _baseSortedIndex = baseSortedIndex;

/**
 * Uses a binary search to determine the lowest index at which `value`
 * should be inserted into `array` in order to maintain its sort order.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The sorted array to inspect.
 * @param {*} value The value to evaluate.
 * @returns {number} Returns the index at which `value` should be inserted
 *  into `array`.
 * @example
 *
 * _.sortedIndex([30, 50], 40);
 * // => 1
 */
function sortedIndex(array, value) {
  return _baseSortedIndex(array, value);
}

var sortedIndex_1 = sortedIndex;

function range(size, startAt = 0) {
    const res = [];
    const end = startAt + size;
    for (let i = startAt; i < end; i++) {
        res.push(i);
    }
    return res;
}
// (arr1[index1] < arr2[index2])
function simpleCompare(el1, el2) {
    return el1 < el2;
}
function mergeSortedArray(arr1, arr2, compareFn = simpleCompare) {
    const merged = [];
    let index1 = 0;
    let index2 = 0;
    let current = 0;
    while (current < (arr1.length + arr2.length)) {
        let isArr1Depleted = index1 >= arr1.length;
        let isArr2Depleted = index2 >= arr2.length;
        if (!isArr1Depleted && (isArr2Depleted || compareFn(arr1[index1], arr2[index2]))) {
            merged[current] = arr1[index1];
            index1++;
        }
        else {
            merged[current] = arr2[index2];
            index2++;
        }
        current++;
    }
    return merged;
}
function getScrollbarWidth(doc) {
    // Creating invisible container
    const outer = doc.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // forcing scrollbar to appear
    outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    doc.body.appendChild(outer);
    // Creating inner element and placing it in the container
    const inner = doc.createElement('div');
    outer.appendChild(inner);
    // Calculating difference between container's full width and the child width
    const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
    // Removing temporary elements from the DOM
    outer.parentNode.removeChild(outer);
    return scrollbarWidth;
}

/**
* Update items based on new scroll position
* If viewport wasn't changed fully simple recombination of positions
* Otherwise rebuild viewport items
*/
function getUpdatedItemsByPosition(pos, items, realCount, virtualSize, dimension) {
    const activeItem = getOffset(dimension, pos, dimension.originItemSize);
    const firstItem = getFirstItem(items);
    let toUpdate;
    // do simple position replacement if items already present in viewport
    if (firstItem) {
        let changedOffsetStart = activeItem.itemIndex - (firstItem.itemIndex || 0);
        if (changedOffsetStart) {
            // try todo simple recombination
            const newData = recombineByOffset({
                newItem: activeItem,
                prevItem: firstItem,
                dimension: dimension,
                positiveDirection: changedOffsetStart > -1,
                offset: Math.abs(changedOffsetStart)
            }, items);
            if (newData) {
                toUpdate = newData;
            }
            // if partial replacement add items if revo-viewport has some space left
            if (toUpdate) {
                const extra = addMissingItems(activeItem, realCount, virtualSize, toUpdate, dimension);
                if (extra.items.length) {
                    toUpdate.items.push(...extra.items);
                    toUpdate.itemIndexes.push(...extra.itemIndexes);
                }
            }
        }
    }
    // new collection if no items after replacement full replacement
    if (!toUpdate) {
        toUpdate = getItems({
            sizes: dimension.sizes,
            start: activeItem.start,
            startIndex: activeItem.itemIndex,
            origSize: dimension.originItemSize,
            maxSize: virtualSize,
            maxCount: realCount
        });
    }
    return toUpdate;
}
// if partial replacement add items if revo-viewport has some space left
function addMissingItems(firstItem, realCount, virtualSize, existingCollection, dimension) {
    const lastItem = getLastItem(existingCollection);
    const data = getItems({
        sizes: dimension.sizes,
        start: lastItem.end,
        startIndex: lastItem.itemIndex + 1,
        origSize: dimension.originItemSize,
        maxSize: virtualSize - (lastItem.end - firstItem.start),
        maxCount: realCount - lastItem.itemIndex
    });
    return {
        items: data.items,
        itemIndexes: range(data.items.length, existingCollection.items.length)
    };
}
// get first item in revo-viewport
function getOffset(dimension, pos, origSize) {
    const item = {
        itemIndex: 0,
        start: 0,
        end: 0
    };
    const currentPlace = dimension.indexes.length ? sortedIndex_1(dimension.positionIndexes, pos) : 0;
    // not found or first index
    if (!currentPlace) {
        item.itemIndex = Math.floor(pos / origSize);
        item.start = item.itemIndex * origSize;
        item.end = item.start + origSize;
        return item;
    }
    const positionItem = dimension.positionIndexToCoordinate[currentPlace - 1];
    // if item has specified size
    if (positionItem.end > pos) {
        return positionItem;
    }
    // special size item was present before
    const relativePos = pos - positionItem.end;
    const relativeIndex = Math.floor(relativePos / origSize);
    item.itemIndex = positionItem.itemIndex + 1 + relativeIndex;
    item.start = positionItem.end + relativeIndex * origSize;
    item.end = item.start + origSize;
    return item;
}
// get revo-viewport items parameters, caching position and calculating items count in revo-viewport
function getItems(opt, currentSize = 0) {
    const items = [];
    const itemIndexes = [];
    let index = opt.startIndex;
    let size = currentSize;
    let i = 0;
    while (size <= opt.maxSize && i < opt.maxCount) {
        const newSize = getItemSize(index, opt.sizes, opt.origSize);
        itemIndexes.push(i);
        items.push({
            start: opt.start + size,
            end: opt.start + size + newSize,
            itemIndex: index,
            size: newSize
        });
        size += newSize;
        index++;
        i++;
    }
    return { items, itemIndexes };
}
/**
* Do batch items recombination
* If items not overlapped with existing viewport returns null
*/
function recombineByOffset(data, state) {
    const indexSize = state.itemIndexes.length;
    // if offset out of revo-viewport, makes sense whole redraw
    if (data.offset > indexSize) {
        return null;
    }
    if (data.positiveDirection) {
        let lastItem = getLastItem(state);
        for (let i = 0; i < data.offset; i++) {
            const newIndex = lastItem.itemIndex + 1;
            const size = getItemSize(newIndex, data.dimension.sizes, data.dimension.originItemSize);
            // if item overlapped limit break a loop
            if (lastItem.end + size > data.dimension.realSize) {
                break;
            }
            state.items[state.itemIndexes[i]] = lastItem = {
                itemIndex: newIndex,
                start: lastItem.end,
                end: lastItem.end + size,
                size: size
            };
        }
        // push item to the end
        state.itemIndexes.push(...state.itemIndexes.splice(0, data.offset));
    }
    else {
        const changed = indexSize - data.offset;
        let firstItem = getFirstItem(state);
        for (let i = indexSize - 1; i >= changed; i--) {
            const newIndex = firstItem.itemIndex - 1;
            const size = getItemSize(newIndex, data.dimension.sizes, data.dimension.originItemSize);
            state.items[state.itemIndexes[i]] = firstItem = {
                itemIndex: newIndex,
                start: firstItem.start - size,
                end: firstItem.start,
                size: size
            };
        }
        // push item to the start
        state.itemIndexes.unshift(...state.itemIndexes.splice(changed, indexSize - 1));
    }
    return {
        items: [...state.items],
        itemIndexes: [...state.itemIndexes]
    };
}
function getItemSize(index, sizes, origSize) {
    if (sizes[index]) {
        return sizes[index];
    }
    return origSize;
}
function isActiveRange(pos, item) {
    return item && pos >= item.start && pos <= item.end;
}
function getFirstItem(s) {
    return s.items[s.itemIndexes[0]];
}
function getLastItem(s) {
    return s.items[s.itemIndexes[s.itemIndexes.length - 1]];
}

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array == null ? 0 : array.length;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

var _arrayReduce = arrayReduce;

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

var _listCacheClear = listCacheClear;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

var eq_1 = eq;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq_1(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

var _assocIndexOf = assocIndexOf;

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

var _listCacheDelete = listCacheDelete;

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

var _listCacheGet = listCacheGet;

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return _assocIndexOf(this.__data__, key) > -1;
}

var _listCacheHas = listCacheHas;

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

var _listCacheSet = listCacheSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = _listCacheClear;
ListCache.prototype['delete'] = _listCacheDelete;
ListCache.prototype.get = _listCacheGet;
ListCache.prototype.has = _listCacheHas;
ListCache.prototype.set = _listCacheSet;

var _ListCache = ListCache;

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new _ListCache;
  this.size = 0;
}

var _stackClear = stackClear;

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

var _stackDelete = stackDelete;

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

var _stackGet = stackGet;

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

var _stackHas = stackHas;

/* Built-in method references that are verified to be native. */
var nativeCreate = _getNative(Object, 'create');

var _nativeCreate = nativeCreate;

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
  this.size = 0;
}

var _hashClear = hashClear;

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

var _hashDelete = hashDelete;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$7 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (_nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty$5.call(data, key) ? data[key] : undefined;
}

var _hashGet = hashGet;

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$6.call(data, key);
}

var _hashHas = hashHas;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
  return this;
}

var _hashSet = hashSet;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = _hashClear;
Hash.prototype['delete'] = _hashDelete;
Hash.prototype.get = _hashGet;
Hash.prototype.has = _hashHas;
Hash.prototype.set = _hashSet;

var _Hash = Hash;

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new _Hash,
    'map': new (_Map || _ListCache),
    'string': new _Hash
  };
}

var _mapCacheClear = mapCacheClear;

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

var _isKeyable = isKeyable;

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return _isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

var _getMapData = getMapData;

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = _getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

var _mapCacheDelete = mapCacheDelete;

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return _getMapData(this, key).get(key);
}

var _mapCacheGet = mapCacheGet;

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return _getMapData(this, key).has(key);
}

var _mapCacheHas = mapCacheHas;

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = _getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

var _mapCacheSet = mapCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = _mapCacheClear;
MapCache.prototype['delete'] = _mapCacheDelete;
MapCache.prototype.get = _mapCacheGet;
MapCache.prototype.has = _mapCacheHas;
MapCache.prototype.set = _mapCacheSet;

var _MapCache = MapCache;

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof _ListCache) {
    var pairs = data.__data__;
    if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new _MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

var _stackSet = stackSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new _ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = _stackClear;
Stack.prototype['delete'] = _stackDelete;
Stack.prototype.get = _stackGet;
Stack.prototype.has = _stackHas;
Stack.prototype.set = _stackSet;

var _Stack = Stack;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED$2);
  return this;
}

var _setCacheAdd = setCacheAdd;

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

var _setCacheHas = setCacheHas;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new _MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
SetCache.prototype.has = _setCacheHas;

var _SetCache = SetCache;

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

var _arraySome = arraySome;

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

var _cacheHas = cacheHas;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new _SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!_arraySome(other, function(othValue, othIndex) {
            if (!_cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

var _equalArrays = equalArrays;

/** Built-in value references. */
var Uint8Array = _root.Uint8Array;

var _Uint8Array = Uint8Array;

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

var _mapToArray = mapToArray;

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

var _setToArray = setToArray;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$1 = 1,
    COMPARE_UNORDERED_FLAG$1 = 2;

/** `Object#toString` result references. */
var boolTag$1 = '[object Boolean]',
    dateTag$1 = '[object Date]',
    errorTag$1 = '[object Error]',
    mapTag$3 = '[object Map]',
    numberTag$1 = '[object Number]',
    regexpTag$1 = '[object RegExp]',
    setTag$3 = '[object Set]',
    stringTag$2 = '[object String]',
    symbolTag$1 = '[object Symbol]';

var arrayBufferTag$1 = '[object ArrayBuffer]',
    dataViewTag$2 = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol ? _Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag$2:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag$1:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new _Uint8Array(object), new _Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag$1:
    case dateTag$1:
    case numberTag$1:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq_1(+object, +other);

    case errorTag$1:
      return object.name == other.name && object.message == other.message;

    case regexpTag$1:
    case stringTag$2:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag$3:
      var convert = _mapToArray;

    case setTag$3:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1;
      convert || (convert = _setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG$1;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag$1:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

var _equalByTag = equalByTag;

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

var _arrayPush = arrayPush;

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
}

var _baseGetAllKeys = baseGetAllKeys;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

var _arrayFilter = arrayFilter;

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

var stubArray_1 = stubArray;

/** Used for built-in method references. */
var objectProto$9 = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable$1 = objectProto$9.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray_1 : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return _arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable$1.call(object, symbol);
  });
};

var _getSymbols = getSymbols;

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return _baseGetAllKeys(object, keys_1, _getSymbols);
}

var _getAllKeys = getAllKeys;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$2 = 1;

/** Used for built-in method references. */
var objectProto$a = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$7 = objectProto$a.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
      objProps = _getAllKeys(object),
      objLength = objProps.length,
      othProps = _getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$7.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

var _equalObjects = equalObjects;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$3 = 1;

/** `Object#toString` result references. */
var argsTag$2 = '[object Arguments]',
    arrayTag$1 = '[object Array]',
    objectTag$2 = '[object Object]';

/** Used for built-in method references. */
var objectProto$b = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$8 = objectProto$b.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray_1(object),
      othIsArr = isArray_1(other),
      objTag = objIsArr ? arrayTag$1 : _getTag(object),
      othTag = othIsArr ? arrayTag$1 : _getTag(other);

  objTag = objTag == argsTag$2 ? objectTag$2 : objTag;
  othTag = othTag == argsTag$2 ? objectTag$2 : othTag;

  var objIsObj = objTag == objectTag$2,
      othIsObj = othTag == objectTag$2,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer_1(object)) {
    if (!isBuffer_1(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new _Stack);
    return (objIsArr || isTypedArray_1(object))
      ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG$3)) {
    var objIsWrapped = objIsObj && hasOwnProperty$8.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty$8.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new _Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new _Stack);
  return _equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

var _baseIsEqualDeep = baseIsEqualDeep;

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike_1(value) && !isObjectLike_1(other))) {
    return value !== value && other !== other;
  }
  return _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

var _baseIsEqual = baseIsEqual;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$4 = 1,
    COMPARE_UNORDERED_FLAG$2 = 2;

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new _Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$4 | COMPARE_UNORDERED_FLAG$2, customizer, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

var _baseIsMatch = baseIsMatch;

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject_1(value);
}

var _isStrictComparable = isStrictComparable;

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys_1(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, _isStrictComparable(value)];
  }
  return result;
}

var _getMatchData = getMatchData;

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

var _matchesStrictComparable = matchesStrictComparable;

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = _getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return _matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || _baseIsMatch(object, source, matchData);
  };
}

var _baseMatches = baseMatches;

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray_1(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol_1(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

var _isKey = isKey;

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || _MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = _MapCache;

var memoize_1 = memoize;

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize_1(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

var _memoizeCapped = memoizeCapped;

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = _memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

var _stringToPath = stringToPath;

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

var _arrayMap = arrayMap;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
    symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray_1(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return _arrayMap(value, baseToString) + '';
  }
  if (isSymbol_1(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

var _baseToString = baseToString;

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : _baseToString(value);
}

var toString_1 = toString;

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray_1(value)) {
    return value;
  }
  return _isKey(value, object) ? [value] : _stringToPath(toString_1(value));
}

var _castPath = castPath;

/** Used as references for various `Number` constants. */
var INFINITY$1 = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol_1(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
}

var _toKey = toKey;

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = _castPath(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[_toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

var _baseGet = baseGet;

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : _baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

var get_1 = get;

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

var _baseHasIn = baseHasIn;

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = _castPath(path, object);

  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = _toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength_1(length) && _isIndex(key, length) &&
    (isArray_1(object) || isArguments_1(object));
}

var _hasPath = hasPath;

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && _hasPath(object, path, _baseHasIn);
}

var hasIn_1 = hasIn;

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$5 = 1,
    COMPARE_UNORDERED_FLAG$3 = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (_isKey(path) && _isStrictComparable(srcValue)) {
    return _matchesStrictComparable(_toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get_1(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn_1(object, path)
      : _baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
  };
}

var _baseMatchesProperty = baseMatchesProperty;

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return _baseGet(object, path);
  };
}

var _basePropertyDeep = basePropertyDeep;

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return _isKey(path) ? _baseProperty(_toKey(path)) : _basePropertyDeep(path);
}

var property_1 = property;

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity_1;
  }
  if (typeof value == 'object') {
    return isArray_1(value)
      ? _baseMatchesProperty(value[0], value[1])
      : _baseMatches(value);
  }
  return property_1(value);
}

var _baseIteratee = baseIteratee;

/**
 * The base implementation of `_.reduce` and `_.reduceRight`, without support
 * for iteratee shorthands, which iterates over `collection` using `eachFunc`.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} accumulator The initial value.
 * @param {boolean} initAccum Specify using the first or last element of
 *  `collection` as the initial value.
 * @param {Function} eachFunc The function to iterate over `collection`.
 * @returns {*} Returns the accumulated value.
 */
function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
  eachFunc(collection, function(value, index, collection) {
    accumulator = initAccum
      ? (initAccum = false, value)
      : iteratee(accumulator, value, index, collection);
  });
  return accumulator;
}

var _baseReduce = baseReduce;

/**
 * Reduces `collection` to a value which is the accumulated result of running
 * each element in `collection` thru `iteratee`, where each successive
 * invocation is supplied the return value of the previous. If `accumulator`
 * is not given, the first element of `collection` is used as the initial
 * value. The iteratee is invoked with four arguments:
 * (accumulator, value, index|key, collection).
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `_.reduce`, `_.reduceRight`, and `_.transform`.
 *
 * The guarded methods are:
 * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `orderBy`,
 * and `sortBy`
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @returns {*} Returns the accumulated value.
 * @see _.reduceRight
 * @example
 *
 * _.reduce([1, 2], function(sum, n) {
 *   return sum + n;
 * }, 0);
 * // => 3
 *
 * _.reduce({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
 *   (result[value] || (result[value] = [])).push(key);
 *   return result;
 * }, {});
 * // => { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
 */
function reduce(collection, iteratee, accumulator) {
  var func = isArray_1(collection) ? _arrayReduce : _baseReduce,
      initAccum = arguments.length < 3;

  return func(collection, _baseIteratee(iteratee), accumulator, initAccum, _baseEach);
}

var reduce_1 = reduce;

/**
* Pre-calculation dimension sizes and sizes for each cell
*/
function calculateDimensionData(state, newSizes) {
    let positionIndexes = [];
    const positionIndexToCoordinate = {};
    const itemIndexToCoordinate = {};
    // to compare how real width changed
    let newTotal = 0;
    // combine all sizes
    const sizes = Object.assign(Object.assign({}, state.sizes), newSizes);
    // prepare order sorted new sizes and calculate changed real size
    let newIndexes = [];
    each(newSizes, (size, index) => {
        // if first introduced custom size
        if (!state.sizes[index]) {
            newTotal += size - state.originItemSize;
            newIndexes.splice(sortedIndex_1(newIndexes, parseInt(index, 10)), 0, parseInt(index, 10));
        }
        else {
            newTotal += size - state.sizes[index];
        }
    });
    // add order to cached order collection for faster linking
    const updatedIndexesCache = mergeSortedArray(state.indexes, newIndexes);
    // fill new coordinates
    reduce_1(updatedIndexesCache, (previous, itemIndex, i) => {
        const newItem = {
            itemIndex,
            start: 0,
            end: 0
        };
        if (previous) {
            newItem.start = (itemIndex - previous.itemIndex - 1) * state.originItemSize + previous.end;
        }
        else {
            newItem.start = itemIndex * state.originItemSize;
        }
        newItem.end = newItem.start + sizes[itemIndex];
        positionIndexes.push(newItem.start);
        itemIndexToCoordinate[itemIndex] = positionIndexToCoordinate[i] = newItem;
        return newItem;
    }, undefined);
    return {
        indexes: updatedIndexesCache,
        realSize: state.realSize + newTotal,
        sizes,
        positionIndexes,
        positionIndexToCoordinate,
        itemIndexToCoordinate
    };
}

/**
* Storing pre-calculated
* Dimension information and sizes
*/
function initialState() {
    return {
        indexes: [],
        // item index to size
        sizes: {},
        // order in indexes[] to coordinate
        positionIndexToCoordinate: {},
        // initial element to coordinate ^
        itemIndexToCoordinate: {},
        positionIndexes: [],
        // size which all items can take
        realSize: 0,
        // initial item size if it wasn't changed
        originItemSize: 0
    };
}
const rowsStore = createStore(initialState());
const colsStore = createStore(initialState());
function getCurrentState(type) {
    const state = initialState();
    const keys = Object.keys(state);
    let store = type === 'col' ? colsStore : rowsStore;
    return reduce_1(keys, (r, k) => {
        const data = store.get(k);
        r[k] = data;
        return r;
    }, state);
}
function getStoreByType(type) {
    switch (type) {
        case 'col':
            return colsStore;
        case 'row':
            return rowsStore;
    }
}
function setSettings(data, dimensionType) {
    const store = getStoreByType(dimensionType);
    setStore(store, { originItemSize: data });
}
function setRealSize(count, dimensionType) {
    const store = getStoreByType(dimensionType);
    let realSize = 0;
    for (let i = 0; i < count; i++) {
        realSize += store.get('sizes')[i] || store.get('originItemSize');
    }
    setStore(store, { realSize });
}
function setDimensionSize(sizes, dimensionType) {
    const store = getStoreByType(dimensionType);
    setStore(store, calculateDimensionData(getCurrentState(dimensionType), sizes));
    setViewPortDimension(sizes, dimensionType);
}

/**
* Store is responsible for visible
* Viewport information for each dimension
* Redraw items during scrolling
*/
function initialState$1() {
    return {
        items: [],
        itemIndexes: [],
        frameOffset: 0,
        virtualSize: 0,
        realCount: 0
    };
}
const rowsStore$1 = createStore(initialState$1());
const colsStore$1 = createStore(initialState$1());
function getStoreByType$1(type) {
    switch (type) {
        case 'col':
            return colsStore$1;
        case 'row':
            return rowsStore$1;
    }
}
function getItems$1(store) {
    return {
        items: store.get('items'),
        itemIndexes: store.get('itemIndexes')
    };
}
function setViewport(data, dimensionType) {
    const store = getStoreByType$1(dimensionType);
    if (!data.virtualSize) {
        store.set('itemIndexes', []);
        store.set('items', []);
    }
    setStore(store, data);
}
function setViewPortCoordinate(position, dimensionType) {
    const store = getStoreByType$1(dimensionType);
    // no visible data to calculate
    if (!store.get('virtualSize')) {
        return;
    }
    const dimension = getCurrentState(dimensionType);
    const outsize = store.get('frameOffset') * 2 * dimension.originItemSize;
    const virtualSize = store.get('virtualSize') + outsize;
    let maxCoordinate = 0;
    if (dimension.realSize > virtualSize) {
        maxCoordinate = dimension.realSize - virtualSize;
    }
    let pos = position;
    pos -= store.get('frameOffset') * dimension.originItemSize;
    pos = pos < 0 ? 0 : pos < maxCoordinate ? pos : maxCoordinate;
    const firstItem = getFirstItem(getItems$1(store));
    const lastItem = getLastItem(getItems$1(store));
    // left position changed
    if (!isActiveRange(pos, firstItem)) {
        const toUpdate = getUpdatedItemsByPosition(pos, getItems$1(store), store.get('realCount'), virtualSize, dimension);
        setStore(store, toUpdate);
        // right position changed
    }
    else if (firstItem && (store.get('virtualSize') + pos) > (lastItem === null || lastItem === void 0 ? void 0 : lastItem.end)) {
        const toUpdate = addMissingItems(firstItem, store.get('realCount'), virtualSize + pos - firstItem.start, getItems$1(store), dimension);
        setStore(store, {
            items: [...store.get('items'), ...toUpdate.items],
            itemIndexes: [...store.get('itemIndexes'), ...toUpdate.itemIndexes]
        });
    }
}
function setViewPortDimension(sizes, dimensionType) {
    const store = getStoreByType$1(dimensionType);
    // viewport not inited
    if (!store.get('items').length) {
        return;
    }
    const items = store.get('items');
    let changedCoordinate = 0;
    for (let i of store.get('itemIndexes')) {
        let changedSize = 0;
        const item = items[i];
        // change pos if size change present before
        if (changedCoordinate) {
            item.start += changedCoordinate;
            item.end += changedCoordinate;
        }
        // change size
        const size = sizes[item.itemIndex] || 0;
        if (size) {
            changedSize = size - item.size;
            changedCoordinate += changedSize;
            item.size = size;
        }
        if (changedSize || changedCoordinate) {
            items[i] = Object.assign({}, item);
        }
    }
    setStore(store, { items });
}

/**
* Storing initial data and column information
*/
const store = createStore({
    data: [],
    columns: []
});
const dataStore = new DataSource(store);
function setColumn(data) {
    const cols = size_1(data);
    dataStore.setColumn(data);
    setViewport({ realCount: cols }, 'col');
    setRealSize(cols, 'col');
}
function setData(data) {
    const rows = size_1(data);
    dataStore.setData(data);
    setViewport({ realCount: rows }, 'row');
    setRealSize(rows, 'row');
}

const revoGridCss = ":host{display:block;height:100%}.header{position:relative;height:30px;display:table-cell}.header-wrapper{height:0;display:table-row}.viewport-wrapper{display:block;width:100%;height:100%}.viewport{display:block;height:100%;max-width:100%;position:relative;float:left}.viewport-layer{display:block;height:100%;width:100%;position:relative}.data-cell{position:absolute;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-box-shadow:0 1px 0 0 #b5b5b5, 1px 0 0 0 #b5b5b5;box-shadow:0 1px 0 0 #b5b5b5, 1px 0 0 0 #b5b5b5;height:100%;text-align:center}.row{position:absolute;width:100%;left:0}.data-header-cell{position:absolute;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-box-shadow:0 1px 0 0 #b5b5b5, 1px 0 0 0 #b5b5b5;box-shadow:0 1px 0 0 #b5b5b5, 1px 0 0 0 #b5b5b5;height:100%;text-align:center}.horizontal-wrapper{height:100%;overflow-x:auto;overflow-y:hidden}.inner-content-table{display:table;height:100%;width:100%;position:relative;z-index:0}.vertical-wrapper{display:table-row;position:relative}.vertical-inner{overflow-y:auto;height:100%;-ms-overflow-style:none;}.vertical-inner::-webkit-scrollbar{display:none;-webkit-appearance:none}.vertical-scroll{position:absolute;right:0;overflow-y:auto;overflow-x:visible;z-index:1;top:0;bottom:0}.vertical-scroll>div{width:1px}";

const initialSettings = {
    defaultColumnSize: 80,
    defaultRowSize: 30,
    frameSize: 10,
    dimensions: undefined
};
const RevoGrid = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.dimensions = {};
        this.settings = initialSettings;
        // data is array of objects
        this.source = [];
        // if source provided as object header 'prop' will link to the object field
        this.columns = [];
    }
    onSettingsChange(newVal, oldVal) {
        if (!oldVal || newVal.frameSize !== oldVal.frameSize) {
            setViewport({ frameOffset: newVal.frameSize || 0 }, 'row');
            setViewport({ frameOffset: newVal.frameSize || 0 }, 'col');
        }
        if (!oldVal || newVal.defaultRowSize !== oldVal.defaultRowSize) {
            setSettings(this.settings.defaultRowSize, 'row');
        }
        if (!oldVal || newVal.defaultColumnSize !== oldVal.defaultColumnSize) {
            setSettings(this.settings.defaultColumnSize, 'col');
        }
    }
    dataChanged(newVal) {
        setData(newVal);
    }
    columnChanged(newVal) {
        setColumn(newVal);
    }
    async componentWillLoad() {
        this.onSettingsChange(this.settings);
        setDimensionSize(this.dimensions.row, 'row');
        setDimensionSize(this.dimensions.col, 'col');
        this.columnChanged(this.columns);
        this.dataChanged(this.source);
    }
    async componentDidLoad() {
        if (!('ResizeObserver' in window)) {
            // Loads polyfill asynchronously, only if required.
            const module = await import('./resize-observer-c95f17fa.js');
            window.ResizeObserver = module.ResizeObserver;
        }
        this.resizeObserver = new ResizeObserver(async () => {
            setViewport({ virtualSize: this.element.clientHeight }, 'row');
            setViewport({ virtualSize: this.element.clientWidth }, 'col');
            await this.viewport.scrollX();
            await this.viewport.scrollY();
        });
        this.resizeObserver.observe(this.element);
    }
    componentDidUnload() {
        var _a;
        (_a = this.resizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
    }
    render() {
        return h("revogr-viewport-scrollable", { class: 'viewport', ref: (el) => { this.viewport = el; } }, h("revogr-header", { slot: 'header', class: 'header' }), h("revogr-data", { slot: 'content', class: 'viewport-layer' }));
    }
    get element() { return getElement(this); }
    static get watchers() { return {
        "settings": ["onSettingsChange"],
        "source": ["dataChanged"],
        "columns": ["columnChanged"]
    }; }
};
RevoGrid.style = revoGridCss;

const RevogrData = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    render() {
        const rowsEls = [];
        for (let row of rowsStore$1.get('items')) {
            const cells = [];
            for (let col of colsStore$1.get('items')) {
                cells.push(h("div", { class: 'data-cell', style: { width: `${col.size}px`, transform: `translateX(${col.start}px)` } }, dataStore.provider.data(row.itemIndex, col.itemIndex)));
            }
            rowsEls.push(h("div", { class: 'row', style: { height: `${row.size}px`, transform: `translateY(${row.start}px)` } }, cells));
        }
        return rowsEls;
    }
    get element() { return getElement(this); }
};

var interact_min = createCommonjsModule(function (module, exports) {
/* interact.js 1.8.4 | https://raw.github.com/taye/interact.js/master/LICENSE */
!function(e){module.exports=e();}(function(){function e(t){var n;return function(e){return n||t(n={exports:{},parent:e},n.exports),n.exports}}var O=e(function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),t.Scope=t.ActionName=void 0;var n=f(k),o=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==p(e)&&"function"!=typeof e)return {default:e};var t=c();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(pt),i=f(It),a=f(Ct),u=f(Ut),s=f(fn),l=f(Tn),r=f(E({}));function c(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return c=function(){return e},e}function f(e){return e&&e.__esModule?e:{default:e}}function p(e){return (p="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function d(e,t){return !t||"object"!==p(t)&&"function"!=typeof t?function(e){if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}(e):t}function v(e,t,n){return (v="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=y(e)););return e}(e,t);if(r){var o=Object.getOwnPropertyDescriptor(r,t);return o.get?o.get.call(n):o.value}})(e,t,n||e)}function y(e){return (y=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function m(e,t){return (m=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function g(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function h(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function b(e,t,n){return t&&h(e.prototype,t),n&&h(e,n),e}function O(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var w,P=o.win,_=o.browser,x=o.raf,S=o.events;(t.ActionName=w)||(t.ActionName=w={});var j=function(){function e(){var t=this;g(this,e),O(this,"id","__interact_scope_".concat(Math.floor(100*Math.random()))),O(this,"listenerMaps",[]),O(this,"browser",_),O(this,"events",S),O(this,"utils",o),O(this,"defaults",o.clone(i.default)),O(this,"Eventable",a.default),O(this,"actions",{names:[],methodDict:{},eventTypes:[]}),O(this,"InteractEvent",l.default),O(this,"Interactable",void 0),O(this,"interactables",new s.default(this)),O(this,"_win",void 0),O(this,"document",void 0),O(this,"window",void 0),O(this,"documents",[]),O(this,"_plugins",{list:[],map:{}}),O(this,"onWindowUnload",function(e){return t.removeDocument(e.target)});var r=this;this.Interactable=function(){function n(){return g(this,n),d(this,y(n).apply(this,arguments))}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&m(e,t);}(n,u["default"]),b(n,[{key:"set",value:function(e){return v(y(n.prototype),"set",this).call(this,e),r.fire("interactable:set",{options:e,interactable:this}),this}},{key:"unset",value:function(){v(y(n.prototype),"unset",this).call(this);for(var e=r.interactions.list.length-1;0<=e;e--){var t=r.interactions.list[e];t.interactable===this&&(t.stop(),r.fire("interactions:destroy",{interaction:t}),t.destroy(),2<r.interactions.list.length&&r.interactions.list.splice(e,1));}r.fire("interactable:unset",{interactable:this});}},{key:"_defaults",get:function(){return r.defaults}}]),n}();}return b(e,[{key:"addListeners",value:function(e,t){this.listenerMaps.push({id:t,map:e});}},{key:"fire",value:function(e,t){for(var n=0;n<this.listenerMaps.length;n++){var r=this.listenerMaps[n].map[e];if(r&&!1===r(t,this,e))return !1}}},{key:"init",value:function(e){return M(this,e)}},{key:"pluginIsInstalled",value:function(e){return this._plugins.map[e.id]||-1!==this._plugins.list.indexOf(e)}},{key:"usePlugin",value:function(e,t){if(this.pluginIsInstalled(e))return this;if(e.id&&(this._plugins.map[e.id]=e),this._plugins.list.push(e),e.install&&e.install(this,t),e.listeners&&e.before){for(var n=0,r=this.listenerMaps.length,o=e.before.reduce(function(e,t){return e[t]=!0,e},{});n<r;n++){if(o[this.listenerMaps[n].id])break}this.listenerMaps.splice(n,0,{id:e.id,map:e.listeners});}else e.listeners&&this.listenerMaps.push({id:e.id,map:e.listeners});return this}},{key:"addDocument",value:function(e,t){if(-1!==this.getDocIndex(e))return !1;var n=P.getWindow(e);t=t?o.extend({},t):{},this.documents.push({doc:e,options:t}),S.documents.push(e),e!==this.document&&S.add(n,"unload",this.onWindowUnload),this.fire("scope:add-document",{doc:e,window:n,scope:this,options:t});}},{key:"removeDocument",value:function(e){var t=this.getDocIndex(e),n=P.getWindow(e),r=this.documents[t].options;S.remove(n,"unload",this.onWindowUnload),this.documents.splice(t,1),S.documents.splice(t,1),this.fire("scope:remove-document",{doc:e,window:n,scope:this,options:r});}},{key:"getDocIndex",value:function(e){for(var t=0;t<this.documents.length;t++)if(this.documents[t].doc===e)return t;return -1}},{key:"getDocOptions",value:function(e){var t=this.getDocIndex(e);return -1===t?null:this.documents[t].options}},{key:"now",value:function(){return (this.window.Date||Date).now()}}]),e}();function M(e,t){return P.init(t),n.default.init(t),_.init(t),x.init(t),S.init(t),e.usePlugin(r.default),e.document=t.document,e.window=t,e}t.Scope=j;}),E=e(function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var P=n(j),u=n(k),f=n(De),_=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==l(e)&&"function"!=typeof e)return {default:e};var t=a();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(J),s=n(g({})),o=n(Qn);O({});function a(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return a=function(){return e},e}function n(e){return e&&e.__esModule?e:{default:e}}function l(e){return (l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function x(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if(!(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e)))return;var n=[],r=!0,o=!1,i=void 0;try{for(var a,u=e[Symbol.iterator]();!(r=(a=u.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){o=!0,i=e;}finally{try{r||null==u.return||u.return();}finally{if(o)throw i}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}function c(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function p(e,t){return !t||"object"!==l(t)&&"function"!=typeof t?function(e){if(void 0!==e)return e;throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}(e):t}function d(e){return (d=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function v(e,t){return (v=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var y=["pointerDown","pointerMove","pointerUp","updatePointer","removePointer","windowBlur"];function m(O,w){return function(e){var t=w.interactions.list,n=_.getPointerType(e),r=x(_.getEventTargets(e),2),o=r[0],i=r[1],a=[];if(/^touch/.test(e.type)){w.prevTouchTime=w.now();for(var u=0;u<e.changedTouches.length;u++){var s=e.changedTouches[u],l={pointer:s,pointerId:_.getPointerId(s),pointerType:n,eventType:e.type,eventTarget:o,curEventTarget:i,scope:w},c=S(l);a.push([l.pointer,l.eventTarget,l.curEventTarget,c]);}}else{var f=!1;if(!P.default.supportsPointerEvent&&/mouse/.test(e.type)){for(var p=0;p<t.length&&!f;p++)f="mouse"!==t[p].pointerType&&t[p].pointerIsDown;f=f||w.now()-w.prevTouchTime<500||0===e.timeStamp;}if(!f){var d={pointer:e,pointerId:_.getPointerId(e),pointerType:n,eventType:e.type,curEventTarget:i,eventTarget:o,scope:w},v=S(d);a.push([d.pointer,d.eventTarget,d.curEventTarget,v]);}}for(var y=0;y<a.length;y++){var m=x(a[y],4),g=m[0],h=m[1],b=m[2];m[3][O](g,e,h,b);}}}function S(e){var t=e.pointerType,n=e.scope,r={interaction:o.default.search(e),searchDetails:e};return n.fire("interactions:find",r),r.interaction||n.interactions.new({pointerType:t})}function r(e,t){var n=e.doc,r=e.scope,o=e.options,i=r.interactions.docEvents,a=f.default[t];for(var u in r.browser.isIOS&&!o.events&&(o.events={passive:!1}),f.default.delegatedEvents)a(n,u,f.default.delegateListener),a(n,u,f.default.delegateUseCapture,!0);for(var s=o&&o.events,l=0;l<i.length;l++){var c=i[l];a(n,c.type,c.listener,s);}}var i={id:"core/interactions",install:function(o){for(var e={},t=0;t<y.length;t++){var n=y[t];e[n]=m(n,o);}var r,i=P.default.pEventTypes;function a(){for(var e=0;e<o.interactions.list.length;e++){var t=o.interactions.list[e];if(t.pointerIsDown&&"touch"===t.pointerType&&!t._interacting)for(var n=function(){var n=t.pointers[r];o.documents.some(function(e){var t=e.doc;return (0, C.nodeContains)(t,n.downTarget)})||t.removePointer(n.pointer,n.event);},r=0;r<t.pointers.length;r++){n();}}}(r=u.default.PointerEvent?[{type:i.down,listener:a},{type:i.down,listener:e.pointerDown},{type:i.move,listener:e.pointerMove},{type:i.up,listener:e.pointerUp},{type:i.cancel,listener:e.pointerUp}]:[{type:"mousedown",listener:e.pointerDown},{type:"mousemove",listener:e.pointerMove},{type:"mouseup",listener:e.pointerUp},{type:"touchstart",listener:a},{type:"touchstart",listener:e.pointerDown},{type:"touchmove",listener:e.pointerMove},{type:"touchend",listener:e.pointerUp},{type:"touchcancel",listener:e.pointerUp}]).push({type:"blur",listener:function(e){for(var t=0;t<o.interactions.list.length;t++){o.interactions.list[t].documentBlur(e);}}}),o.prevTouchTime=0,o.Interaction=function(){function e(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),p(this,d(e).apply(this,arguments))}var t,n;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&v(e,t);}(e,s["default"]),t=e,(n=[{key:"_now",value:function(){return o.now()}},{key:"pointerMoveTolerance",get:function(){return o.interactions.pointerMoveTolerance},set:function(e){o.interactions.pointerMoveTolerance=e;}}])&&c(t.prototype,n),e}(),o.interactions={list:[],new:function(e){e.scopeFire=function(e,t){return o.fire(e,t)};var t=new o.Interaction(e);return o.interactions.list.push(t),t},listeners:e,docEvents:r,pointerMoveTolerance:1};},listeners:{"scope:add-document":function(e){return r(e,"add")},"scope:remove-document":function(e){return r(e,"remove")}},onDocSignal:r,doOnInteractions:m,methodNames:y};t.default=i;}),g=e(function(e,t){function a(e){return (a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"PointerInfo",{enumerable:!0,get:function(){return u.default}}),t.default=t.Interaction=t._ProxyMethods=t._ProxyValues=void 0;var n,c,r,f,o,p=l(pt),d=l(Tn),u=(n=Hn)&&n.__esModule?n:{default:n},i=O({});function s(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return s=function(){return e},e}function l(e){if(e&&e.__esModule)return e;if(null===e||"object"!==a(e)&&"function"!=typeof e)return {default:e};var t=s();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}function v(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function y(e,t,n){return t&&v(e.prototype,t),n&&v(e,n),e}function m(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}t._ProxyValues=c,(r=c||(t._ProxyValues=c={})).interactable="",r.element="",r.prepared="",r.pointerIsDown="",r.pointerWasMoved="",r._proxy="",t._ProxyMethods=f,(o=f||(t._ProxyMethods=f={})).start="",o.move="",o.end="",o.stop="",o.interacting="";var g=0,h=function(){function l(e){var t=this,n=e.pointerType,r=e.scopeFire;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,l),m(this,"interactable",null),m(this,"element",null),m(this,"rect",void 0),m(this,"_rects",void 0),m(this,"edges",void 0),m(this,"_scopeFire",void 0),m(this,"prepared",{name:null,axis:null,edges:null}),m(this,"pointerType",void 0),m(this,"pointers",[]),m(this,"downEvent",null),m(this,"downPointer",{}),m(this,"_latestPointer",{pointer:null,event:null,eventTarget:null}),m(this,"prevEvent",null),m(this,"pointerIsDown",!1),m(this,"pointerWasMoved",!1),m(this,"_interacting",!1),m(this,"_ending",!1),m(this,"_stopped",!0),m(this,"_proxy",null),m(this,"simulation",null),m(this,"doMove",p.warnOnce(function(e){this.move(e);},"The interaction.doMove() method has been renamed to interaction.move()")),m(this,"coords",{start:p.pointer.newCoords(),prev:p.pointer.newCoords(),cur:p.pointer.newCoords(),delta:p.pointer.newCoords(),velocity:p.pointer.newCoords()}),m(this,"_id",g++),this._scopeFire=r,this.pointerType=n;var o=this;this._proxy={};function i(e){Object.defineProperty(t._proxy,e,{get:function(){return o[e]}});}for(var a in c)i(a);function u(e){Object.defineProperty(t._proxy,e,{value:function(){return o[e].apply(o,arguments)}});}for(var s in f)u(s);this._scopeFire("interactions:new",{interaction:this});}return y(l,[{key:"pointerMoveTolerance",get:function(){return 1}}]),y(l,[{key:"pointerDown",value:function(e,t,n){var r=this.updatePointer(e,t,n,!0);this._scopeFire("interactions:down",{pointer:e,event:t,eventTarget:n,pointerIndex:r,type:"down",interaction:this});}},{key:"start",value:function(e,t,n){return !(this.interacting()||!this.pointerIsDown||this.pointers.length<(e.name===i.ActionName.Gesture?2:1)||!t.options[e.name].enabled)&&(p.copyAction(this.prepared,e),this.interactable=t,this.element=n,this.rect=t.getRect(n),this.edges=p.extend({},this.prepared.edges),this._stopped=!1,this._interacting=this._doPhase({interaction:this,event:this.downEvent,phase:d.EventPhase.Start})&&!this._stopped,this._interacting)}},{key:"pointerMove",value:function(e,t,n){this.simulation||this.modifiers&&this.modifiers.endResult||(this.updatePointer(e,t,n,!1),p.pointer.setCoords(this.coords.cur,this.pointers.map(function(e){return e.pointer}),this._now()));var r,o,i=this.coords.cur.page.x===this.coords.prev.page.x&&this.coords.cur.page.y===this.coords.prev.page.y&&this.coords.cur.client.x===this.coords.prev.client.x&&this.coords.cur.client.y===this.coords.prev.client.y;this.pointerIsDown&&!this.pointerWasMoved&&(r=this.coords.cur.client.x-this.coords.start.client.x,o=this.coords.cur.client.y-this.coords.start.client.y,this.pointerWasMoved=p.hypot(r,o)>this.pointerMoveTolerance);var a={pointer:e,pointerIndex:this.getPointerIndex(e),event:t,type:"move",eventTarget:n,dx:r,dy:o,duplicate:i,interaction:this};i||(p.pointer.setCoordDeltas(this.coords.delta,this.coords.prev,this.coords.cur),p.pointer.setCoordVelocity(this.coords.velocity,this.coords.delta)),this._scopeFire("interactions:move",a),i||(this.interacting()&&(a.type=null,this.move(a)),this.pointerWasMoved&&p.pointer.copyCoords(this.coords.prev,this.coords.cur));}},{key:"move",value:function(e){e&&e.event||p.pointer.setZeroCoords(this.coords.delta),(e=p.extend({pointer:this._latestPointer.pointer,event:this._latestPointer.event,eventTarget:this._latestPointer.eventTarget,interaction:this},e||{})).phase=d.EventPhase.Move,this._doPhase(e);}},{key:"pointerUp",value:function(e,t,n,r){var o=this.getPointerIndex(e);-1===o&&(o=this.updatePointer(e,t,n,!1));var i=/cancel$/i.test(t.type)?"cancel":"up";this._scopeFire("interactions:".concat(i),{pointer:e,pointerIndex:o,event:t,eventTarget:n,type:i,curEventTarget:r,interaction:this}),this.simulation||this.end(t),this.pointerIsDown=!1,this.removePointer(e,t);}},{key:"documentBlur",value:function(e){this.end(e),this._scopeFire("interactions:blur",{event:e,type:"blur",interaction:this});}},{key:"end",value:function(e){var t;this._ending=!0,e=e||this._latestPointer.event,this.interacting()&&(t=this._doPhase({event:e,interaction:this,phase:d.EventPhase.End})),!(this._ending=!1)===t&&this.stop();}},{key:"currentAction",value:function(){return this._interacting?this.prepared.name:null}},{key:"interacting",value:function(){return this._interacting}},{key:"stop",value:function(){this._scopeFire("interactions:stop",{interaction:this}),this.interactable=this.element=null,this._interacting=!1,this._stopped=!0,this.prepared.name=this.prevEvent=null;}},{key:"getPointerIndex",value:function(e){var t=p.pointer.getPointerId(e);return "mouse"===this.pointerType||"pen"===this.pointerType?this.pointers.length-1:p.arr.findIndex(this.pointers,function(e){return e.id===t})}},{key:"getPointerInfo",value:function(e){return this.pointers[this.getPointerIndex(e)]}},{key:"updatePointer",value:function(e,t,n,r){var o=p.pointer.getPointerId(e),i=this.getPointerIndex(e),a=this.pointers[i];return r=!1!==r&&(r||/(down|start)$/i.test(t.type)),a?a.pointer=e:(a=new u.default(o,e,t,null,null),i=this.pointers.length,this.pointers.push(a)),r&&(this.pointerIsDown=!0,this.interacting()||(p.pointer.setCoords(this.coords.start,this.pointers.map(function(e){return e.pointer}),this._now()),p.pointer.copyCoords(this.coords.cur,this.coords.start),p.pointer.copyCoords(this.coords.prev,this.coords.start),p.pointer.pointerExtend(this.downPointer,e),this.downEvent=t,a.downTime=this.coords.cur.timeStamp,a.downTarget=n,this.pointerWasMoved=!1)),this._updateLatestPointer(e,t,n),this._scopeFire("interactions:update-pointer",{pointer:e,event:t,eventTarget:n,down:r,pointerInfo:a,pointerIndex:i,interaction:this}),i}},{key:"removePointer",value:function(e,t){var n=this.getPointerIndex(e);if(-1!==n){var r=this.pointers[n];this._scopeFire("interactions:remove-pointer",{pointer:e,event:t,eventTarget:null,pointerIndex:n,pointerInfo:r,interaction:this}),this.pointers.splice(n,1);}}},{key:"_updateLatestPointer",value:function(e,t,n){this._latestPointer.pointer=e,this._latestPointer.event=t,this._latestPointer.eventTarget=n;}},{key:"destroy",value:function(){this._latestPointer.pointer=null,this._latestPointer.event=null,this._latestPointer.eventTarget=null;}},{key:"_createPreparedEvent",value:function(e,t,n,r){var o=this.prepared.name;return new d.default(this,e,o,t,this.element,null,n,r)}},{key:"_fireEvent",value:function(e){this.interactable.fire(e),(!this.prevEvent||e.timeStamp>=this.prevEvent.timeStamp)&&(this.prevEvent=e);}},{key:"_doPhase",value:function(e){var t=e.event,n=e.phase,r=e.preEnd,o=e.type,i=this.rect,a=this.coords.delta;if(i&&n===d.EventPhase.Move){var u=this.edges||this.prepared.edges||{left:!0,right:!0,top:!0,bottom:!0};p.rect.addEdges(u,i,a[this.interactable.options.deltaSource]),i.width=i.right-i.left,i.height=i.bottom-i.top;}if(!1===this._scopeFire("interactions:before-action-".concat(n),e))return !1;var s=e.iEvent=this._createPreparedEvent(t,n,r,o);return this._scopeFire("interactions:action-".concat(n),e),"start"===n&&(this.prevEvent=s),this._fireEvent(s),this._scopeFire("interactions:after-action-".concat(n),e),!0}},{key:"_now",value:function(){return Date.now()}}]),l}(),b=t.Interaction=h;t.default=b;}),k={};Object.defineProperty(k,"__esModule",{value:!0}),k.default=void 0;var n={init:function(e){var t=e;n.document=t.document,n.DocumentFragment=t.DocumentFragment||r,n.SVGElement=t.SVGElement||r,n.SVGSVGElement=t.SVGSVGElement||r,n.SVGElementInstance=t.SVGElementInstance||r,n.Element=t.Element||r,n.HTMLElement=t.HTMLElement||n.Element,n.Event=t.Event,n.Touch=t.Touch||r,n.PointerEvent=t.PointerEvent||t.MSPointerEvent;},document:null,DocumentFragment:null,SVGElement:null,SVGSVGElement:null,SVGElementInstance:null,Element:null,HTMLElement:null,Event:null,Touch:null,PointerEvent:null};function r(){}var t=n;k.default=t;var u={};function o(e,t){for(var n=0;n<t.length;n++){var r=t[n];e.push(r);}return e}function i(e,t){for(var n=0;n<e.length;n++)if(t(e[n],n,e))return n;return -1}Object.defineProperty(u,"__esModule",{value:!0}),u.contains=function(e,t){return -1!==e.indexOf(t)},u.remove=function(e,t){return e.splice(e.indexOf(t),1)},u.merge=o,u.from=function(e){return o([],e)},u.findIndex=i,u.find=function(e,t){return e[i(e,t)]};var a={};Object.defineProperty(a,"__esModule",{value:!0}),a.default=void 0;a.default=function(e){return !(!e||!e.Window)&&e instanceof e.Window};var s={};Object.defineProperty(s,"__esModule",{value:!0}),s.init=p,s.getWindow=d,s.default=void 0;var l,c=(l=a)&&l.__esModule?l:{default:l};var f={realWindow:void 0,window:void 0,getWindow:d,init:p};function p(e){var t=(f.realWindow=e).document.createTextNode("");t.ownerDocument!==e.document&&"function"==typeof e.wrap&&e.wrap(t)===t&&(e=e.wrap(e)),f.window=e;}function d(e){return (0, c.default)(e)?e:(e.ownerDocument||e).defaultView||f.window}"undefined"==typeof window?(f.window=void 0,f.realWindow=void 0):p(window),f.init=p;var v=f;s.default=v;var y={};Object.defineProperty(y,"__esModule",{value:!0}),y.array=y.plainObject=y.element=y.string=y.bool=y.number=y.func=y.object=y.docFrag=y.window=void 0;var m=b(a),h=b(s);function b(e){return e&&e.__esModule?e:{default:e}}function w(e){return (w="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}y.window=function(e){return e===h.default.window||(0, m.default)(e)};y.docFrag=function(e){return P(e)&&11===e.nodeType};var P=function(e){return !!e&&"object"===w(e)};y.object=P;function _(e){return "function"==typeof e}y.func=_;y.number=function(e){return "number"==typeof e};y.bool=function(e){return "boolean"==typeof e};y.string=function(e){return "string"==typeof e};y.element=function(e){if(!e||"object"!==w(e))return !1;var t=h.default.getWindow(e)||h.default.window;return /object|function/.test(w(t.Element))?e instanceof t.Element:1===e.nodeType&&"string"==typeof e.nodeName};y.plainObject=function(e){return P(e)&&!!e.constructor&&/function Object\b/.test(e.constructor.toString())};y.array=function(e){return P(e)&&void 0!==e.length&&_(e.splice)};var j={};function x(e){return (x="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(j,"__esModule",{value:!0}),j.default=void 0;var S=I(k),M=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==x(e)&&"function"!=typeof e)return {default:e};var t=T();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(y),D=I(s);function T(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return T=function(){return e},e}function I(e){return e&&e.__esModule?e:{default:e}}var A={init:function(e){var t=S.default.Element,n=D.default.window.navigator;A.supportsTouch="ontouchstart"in e||M.func(e.DocumentTouch)&&S.default.document instanceof e.DocumentTouch,A.supportsPointerEvent=!1!==n.pointerEnabled&&!!S.default.PointerEvent,A.isIOS=/iP(hone|od|ad)/.test(n.platform),A.isIOS7=/iP(hone|od|ad)/.test(n.platform)&&/OS 7[^\d]/.test(n.appVersion),A.isIe9=/MSIE 9/.test(n.userAgent),A.isOperaMobile="Opera"===n.appName&&A.supportsTouch&&/Presto/.test(n.userAgent),A.prefixedMatchesSelector="matches"in t.prototype?"matches":"webkitMatchesSelector"in t.prototype?"webkitMatchesSelector":"mozMatchesSelector"in t.prototype?"mozMatchesSelector":"oMatchesSelector"in t.prototype?"oMatchesSelector":"msMatchesSelector",A.pEventTypes=A.supportsPointerEvent?S.default.PointerEvent===e.MSPointerEvent?{up:"MSPointerUp",down:"MSPointerDown",over:"mouseover",out:"mouseout",move:"MSPointerMove",cancel:"MSPointerCancel"}:{up:"pointerup",down:"pointerdown",over:"pointerover",out:"pointerout",move:"pointermove",cancel:"pointercancel"}:null,A.wheelEvent="onmousewheel"in S.default.document?"mousewheel":"wheel";},supportsTouch:null,supportsPointerEvent:null,isIOS7:null,isIOS:null,isIe9:null,isOperaMobile:null,prefixedMatchesSelector:null,pEventTypes:null,wheelEvent:null};var z=A;j.default=z;var C={};function R(e){return (R="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(C,"__esModule",{value:!0}),C.nodeContains=function(e,t){for(;t;){if(t===e)return !0;t=t.parentNode;}return !1},C.closest=function(e,t){for(;N.element(e);){if(G(e,t))return e;e=V(e);}return null},C.parentNode=V,C.matchesSelector=G,C.indexOfDeepestElement=function(e){var t,n,r=[],o=e[0],i=o?0:-1;for(t=1;t<e.length;t++){var a=e[t];if(a&&a!==o)if(o){if(a.parentNode!==a.ownerDocument)if(o.parentNode!==a.ownerDocument)if(a.parentNode!==o.parentNode){if(!r.length)for(var u=o,s=void 0;(s=U(u))&&s!==u.ownerDocument;)r.unshift(u),u=s;var l=void 0;if(o instanceof X.default.HTMLElement&&a instanceof X.default.SVGElement&&!(a instanceof X.default.SVGSVGElement)){if(a===o.parentNode)continue;l=a.ownerSVGElement;}else l=a;for(var c=[];l.parentNode!==l.ownerDocument;)c.unshift(l),l=U(l);for(n=0;c[n]&&c[n]===r[n];)n++;for(var f=[c[n-1],c[n],r[n]],p=f[0].lastChild;p;){if(p===f[1]){o=a,i=t,r=c;break}if(p===f[2])break;p=p.previousSibling;}}else{var d=parseInt((0, Y.getWindow)(o).getComputedStyle(o).zIndex,10)||0,v=parseInt((0, Y.getWindow)(a).getComputedStyle(a).zIndex,10)||0;d<=v&&(o=a,i=t);}else o=a,i=t;}else o=a,i=t;}return i},C.matchesUpTo=function(e,t,n){for(;N.element(e);){if(G(e,t))return !0;if((e=V(e))===n)return G(e,t)}return !1},C.getActualElement=function(e){return e instanceof X.default.SVGElementInstance?e.correspondingUseElement:e},C.getScrollXY=B,C.getElementClientRect=H,C.getElementRect=function(e){var t=H(e);if(!W.default.isIOS7&&t){var n=B(Y.default.getWindow(e));t.left+=n.x,t.right+=n.x,t.top+=n.y,t.bottom+=n.y;}return t},C.getPath=function(e){var t=[];for(;e;)t.push(e),e=V(e);return t},C.trySelector=function(e){return !!N.string(e)&&(X.default.document.querySelector(e),!0)};var W=q(j),X=q(k),N=L(y),Y=L(s);function F(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return F=function(){return e},e}function L(e){if(e&&e.__esModule)return e;if(null===e||"object"!==R(e)&&"function"!=typeof e)return {default:e};var t=F();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}function q(e){return e&&e.__esModule?e:{default:e}}function V(e){var t=e.parentNode;if(N.docFrag(t)){for(;(t=t.host)&&N.docFrag(t););return t}return t}function G(e,t){return Y.default.window!==Y.default.realWindow&&(t=t.replace(/\/deep\//g," ")),e[W.default.prefixedMatchesSelector](t)}var U=function(e){return e.parentNode?e.parentNode:e.host};function B(e){return {x:(e=e||Y.default.window).scrollX||e.document.documentElement.scrollLeft,y:e.scrollY||e.document.documentElement.scrollTop}}function H(e){var t=e instanceof X.default.SVGElement?e.getBoundingClientRect():e.getClientRects()[0];return t&&{left:t.left,right:t.right,top:t.top,bottom:t.bottom,width:t.width||t.right-t.left,height:t.height||t.bottom-t.top}}var K={};Object.defineProperty(K,"__esModule",{value:!0}),K.default=void 0;K.default=function(e,t){return Math.sqrt(e*e+t*t)};var $={};function Q(e,t){for(var n in t){var r=Q.prefixedPropREs,o=!1;for(var i in r)if(0===n.indexOf(i)&&r[i].test(n)){o=!0;break}o||"function"==typeof t[n]||(e[n]=t[n]);}return e}Object.defineProperty($,"__esModule",{value:!0}),$.default=void 0,Q.prefixedPropREs={webkit:/(Movement[XY]|Radius[XY]|RotationAngle|Force)$/,moz:/(Pressure)$/};var Z=Q;$.default=Z;var J={};function ee(e){return (ee="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(J,"__esModule",{value:!0}),J.copyCoords=function(e,t){e.page=e.page||{},e.page.x=t.page.x,e.page.y=t.page.y,e.client=e.client||{},e.client.x=t.client.x,e.client.y=t.client.y,e.timeStamp=t.timeStamp;},J.setCoordDeltas=function(e,t,n){e.page.x=n.page.x-t.page.x,e.page.y=n.page.y-t.page.y,e.client.x=n.client.x-t.client.x,e.client.y=n.client.y-t.client.y,e.timeStamp=n.timeStamp-t.timeStamp;},J.setCoordVelocity=function(e,t){var n=Math.max(t.timeStamp/1e3,.001);e.page.x=t.page.x/n,e.page.y=t.page.y/n,e.client.x=t.client.x/n,e.client.y=t.client.y/n,e.timeStamp=n;},J.setZeroCoords=function(e){e.page.x=0,e.page.y=0,e.client.x=0,e.client.y=0;},J.isNativePointer=ce,J.getXY=fe,J.getPageXY=pe,J.getClientXY=de,J.getPointerId=function(e){return ie.number(e.pointerId)?e.pointerId:e.identifier},J.setCoords=function(e,t,n){var r=1<t.length?ye(t):t[0],o={};pe(r,o),e.page.x=o.x,e.page.y=o.y,de(r,o),e.client.x=o.x,e.client.y=o.y,e.timeStamp=n;},J.getTouchPair=ve,J.pointerAverage=ye,J.touchBBox=function(e){if(!(e.length||e.touches&&1<e.touches.length))return null;var t=ve(e),n=Math.min(t[0].pageX,t[1].pageX),r=Math.min(t[0].pageY,t[1].pageY),o=Math.max(t[0].pageX,t[1].pageX),i=Math.max(t[0].pageY,t[1].pageY);return {x:n,y:r,left:n,top:r,right:o,bottom:i,width:o-n,height:i-r}},J.touchDistance=function(e,t){var n=t+"X",r=t+"Y",o=ve(e),i=o[0][n]-o[1][n],a=o[0][r]-o[1][r];return (0, oe.default)(i,a)},J.touchAngle=function(e,t){var n=t+"X",r=t+"Y",o=ve(e),i=o[1][n]-o[0][n],a=o[1][r]-o[0][r];return 180*Math.atan2(a,i)/Math.PI},J.getPointerType=function(e){return ie.string(e.pointerType)?e.pointerType:ie.number(e.pointerType)?[void 0,void 0,"touch","pen","mouse"][e.pointerType]:/touch/.test(e.type)||e instanceof ne.default.Touch?"touch":"mouse"},J.getEventTargets=function(e){var t=ie.func(e.composedPath)?e.composedPath():e.path;return [re.getActualElement(t?t[0]:e.target),re.getActualElement(e.currentTarget)]},J.newCoords=function(){return {page:{x:0,y:0},client:{x:0,y:0},timeStamp:0}},J.coordsToEvent=function(e){return {coords:e,get page(){return this.coords.page},get client(){return this.coords.client},get timeStamp(){return this.coords.timeStamp},get pageX(){return this.coords.page.x},get pageY(){return this.coords.page.y},get clientX(){return this.coords.client.x},get clientY(){return this.coords.client.y},get pointerId(){return this.coords.pointerId},get target(){return this.coords.target},get type(){return this.coords.type},get pointerType(){return this.coords.pointerType},get buttons(){return this.coords.buttons}}},Object.defineProperty(J,"pointerExtend",{enumerable:!0,get:function(){return ae.default}});var te=le(j),ne=le(k),re=se(C),oe=le(K),ie=se(y),ae=le($);function ue(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return ue=function(){return e},e}function se(e){if(e&&e.__esModule)return e;if(null===e||"object"!==ee(e)&&"function"!=typeof e)return {default:e};var t=ue();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}function le(e){return e&&e.__esModule?e:{default:e}}function ce(e){return e instanceof ne.default.Event||e instanceof ne.default.Touch}function fe(e,t,n){return (n=n||{}).x=t[(e=e||"page")+"X"],n.y=t[e+"Y"],n}function pe(e,t){return t=t||{x:0,y:0},te.default.isOperaMobile&&ce(e)?(fe("screen",e,t),t.x+=window.scrollX,t.y+=window.scrollY):fe("page",e,t),t}function de(e,t){return t=t||{},te.default.isOperaMobile&&ce(e)?fe("screen",e,t):fe("client",e,t),t}function ve(e){var t=[];return ie.array(e)?(t[0]=e[0],t[1]=e[1]):"touchend"===e.type?1===e.touches.length?(t[0]=e.touches[0],t[1]=e.changedTouches[0]):0===e.touches.length&&(t[0]=e.changedTouches[0],t[1]=e.changedTouches[1]):(t[0]=e.touches[0],t[1]=e.touches[1]),t}function ye(e){for(var t={pageX:0,pageY:0,clientX:0,clientY:0,screenX:0,screenY:0},n=0;n<e.length;n++){var r=e[n];for(var o in t)t[o]+=r[o];}for(var i in t)t[i]/=e.length;return t}var me={};Object.defineProperty(me,"__esModule",{value:!0}),me.default=function(e,t){for(var n in t)e[n]=t[n];return e};var ge={};function he(e){return (he="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(ge,"__esModule",{value:!0}),ge.getStringOptionResult=_e,ge.resolveRectLike=function(e,t,n,r){var o=e;we.string(o)?o=_e(o,t,n):we.func(o)&&(o=o.apply(void 0,function(e){return function(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}(r)));we.element(o)&&(o=(0, C.getElementRect)(o));return o},ge.rectToXY=function(e){return e&&{x:"x"in e?e.x:e.left,y:"y"in e?e.y:e.top}},ge.xywhToTlbr=function(e){!e||"left"in e&&"top"in e||((e=(0, Oe.default)({},e)).left=e.x||0,e.top=e.y||0,e.right=e.right||e.left+e.width,e.bottom=e.bottom||e.top+e.height);return e},ge.tlbrToXywh=function(e){!e||"x"in e&&"y"in e||((e=(0, Oe.default)({},e)).x=e.left||0,e.y=e.top||0,e.width=e.width||e.right||0-e.x,e.height=e.height||e.bottom||0-e.y);return e},ge.addEdges=function(e,t,n){e.left&&(t.left+=n.x);e.right&&(t.right+=n.x);e.top&&(t.top+=n.y);e.bottom&&(t.bottom+=n.y);t.width=t.right-t.left,t.height=t.bottom-t.top;};var be,Oe=(be=me)&&be.__esModule?be:{default:be},we=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==he(e)&&"function"!=typeof e)return {default:e};var t=Pe();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(y);function Pe(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Pe=function(){return e},e}function _e(e,t,n){return "parent"===e?(0, C.parentNode)(n):"self"===e?t.getRect(n):(0, C.closest)(n,e)}var xe={};function Se(e){return (Se="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(xe,"__esModule",{value:!0}),xe.default=function e(t){var n={};for(var r in t){var o=t[r];Me.plainObject(o)?n[r]=e(o):Me.array(o)?n[r]=je.from(o):n[r]=o;}return n};var je=ke(u),Me=ke(y);function Ee(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Ee=function(){return e},e}function ke(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Se(e)&&"function"!=typeof e)return {default:e};var t=Ee();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}var De={};function Te(e){return (Te="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(De,"__esModule",{value:!0}),De.default=De.FakeEvent=void 0;var Ie,Ae=Xe(C),ze=Xe(y),Ce=(Ie=$)&&Ie.__esModule?Ie:{default:Ie},Re=Xe(J);function We(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return We=function(){return e},e}function Xe(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Te(e)&&"function"!=typeof e)return {default:e};var t=We();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}function Ne(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function Ye(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if(!(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e)))return;var n=[],r=!0,o=!1,i=void 0;try{for(var a,u=e[Symbol.iterator]();!(r=(a=u.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){o=!0,i=e;}finally{try{r||null==u.return||u.return();}finally{if(o)throw i}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}var Fe=[],Le=[],qe={},Ve=[];function Ge(e,t,n,r){var o=Ke(r),i=Fe.indexOf(e),a=Le[i];a||(a={events:{},typeCount:0},i=Fe.push(e)-1,Le.push(a)),a.events[t]||(a.events[t]=[],a.typeCount++),e.removeEventListener&&!(0, u.contains)(a.events[t],n)&&(e.addEventListener(t,n,Qe.supportsOptions?o:!!o.capture),a.events[t].push(n));}function Ue(e,t,n,r){var o=Ke(r),i=Fe.indexOf(e),a=Le[i];if(a&&a.events)if("all"!==t){if(a.events[t]){var u=a.events[t].length;if("all"===n){for(var s=0;s<u;s++)Ue(e,t,a.events[t][s],o);return}for(var l=0;l<u;l++)if(e.removeEventListener&&a.events[t][l]===n){e.removeEventListener(t,n,Qe.supportsOptions?o:!!o.capture),a.events[t].splice(l,1);break}a.events[t]&&0===a.events[t].length&&(a.events[t]=null,a.typeCount--);}a.typeCount||(Le.splice(i,1),Fe.splice(i,1));}else for(t in a.events)a.events.hasOwnProperty(t)&&Ue(e,t,"all");}function Be(e,t){for(var n=Ke(t),r=new $e(e),o=qe[e.type],i=Ye(Re.getEventTargets(e),1)[0],a=i;ze.element(a);){for(var u=0;u<o.selectors.length;u++){var s=o.selectors[u],l=o.contexts[u];if(Ae.matchesSelector(a,s)&&Ae.nodeContains(l,i)&&Ae.nodeContains(l,a)){var c=o.listeners[u];r.currentTarget=a;for(var f=0;f<c.length;f++){var p=Ye(c[f],3),d=p[0],v=p[1],y=p[2];v===!!n.capture&&y===n.passive&&d(r);}}}a=Ae.parentNode(a);}}function He(e){return Be.call(this,e,!0)}function Ke(e){return ze.object(e)?e:{capture:e}}var $e=function(){function o(e){var t,n,r;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,o),this.originalEvent=e,r=void 0,(n="currentTarget")in(t=this)?Object.defineProperty(t,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[n]=r,(0, Ce.default)(this,e);}var e,t;return e=o,(t=[{key:"preventOriginalDefault",value:function(){this.originalEvent.preventDefault();}},{key:"stopPropagation",value:function(){this.originalEvent.stopPropagation();}},{key:"stopImmediatePropagation",value:function(){this.originalEvent.stopImmediatePropagation();}}])&&Ne(e.prototype,t),o}();De.FakeEvent=$e;var Qe={add:Ge,remove:Ue,addDelegate:function(e,t,n,r,o){var i=Ke(o);if(!qe[n]){qe[n]={contexts:[],listeners:[],selectors:[]};for(var a=0;a<Ve.length;a++){var u=Ve[a];Ge(u,n,Be),Ge(u,n,He,!0);}}var s,l=qe[n];for(s=l.selectors.length-1;0<=s&&(l.selectors[s]!==e||l.contexts[s]!==t);s--);-1===s&&(s=l.selectors.length,l.selectors.push(e),l.contexts.push(t),l.listeners.push([])),l.listeners[s].push([r,!!i.capture,i.passive]);},removeDelegate:function(e,t,n,r,o){var i,a=Ke(o),u=qe[n],s=!1;if(u)for(i=u.selectors.length-1;0<=i;i--)if(u.selectors[i]===e&&u.contexts[i]===t){for(var l=u.listeners[i],c=l.length-1;0<=c;c--){var f=Ye(l[c],3),p=f[0],d=f[1],v=f[2];if(p===r&&d===!!a.capture&&v===a.passive){l.splice(c,1),l.length||(u.selectors.splice(i,1),u.contexts.splice(i,1),u.listeners.splice(i,1),Ue(t,n,Be),Ue(t,n,He,!0),u.selectors.length||(qe[n]=null)),s=!0;break}}if(s)break}},delegateListener:Be,delegateUseCapture:He,delegatedEvents:qe,documents:Ve,supportsOptions:!1,supportsPassive:!1,_elements:Fe,_targets:Le,init:function(e){e.document.createElement("div").addEventListener("test",null,{get capture(){return Qe.supportsOptions=!0},get passive(){return Qe.supportsPassive=!0}});}},Ze=Qe;De.default=Ze;var Je={};Object.defineProperty(Je,"__esModule",{value:!0}),Je.default=function(e,t,n){var r=e.options[n],o=r&&r.origin||e.options.origin,i=(0, ge.resolveRectLike)(o,e,t,[e&&t]);return (0, ge.rectToXY)(i)||{x:0,y:0}};var et={};function tt(e){return (tt="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(et,"__esModule",{value:!0}),et.default=function n(t,r,o){o=o||{};ot.string(t)&&-1!==t.search(" ")&&(t=at(t));if(ot.array(t))return t.reduce(function(e,t){return (0, rt.default)(e,n(t,r,o))},o);ot.object(t)&&(r=t,t="");if(ot.func(r))o[t]=o[t]||[],o[t].push(r);else if(ot.array(r))for(var e=0;e<r.length;e++){var i=r[e];n(t,i,o);}else if(ot.object(r))for(var a in r){var u=at(a).map(function(e){return "".concat(t).concat(e)});n(u,r[a],o);}return o};var nt,rt=(nt=me)&&nt.__esModule?nt:{default:nt},ot=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==tt(e)&&"function"!=typeof e)return {default:e};var t=it();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(y);function it(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return it=function(){return e},e}function at(e){return e.trim().split(/ +/)}var ut={};Object.defineProperty(ut,"__esModule",{value:!0}),ut.default=void 0;var st,lt,ct=0;var ft={request:function(e){return st(e)},cancel:function(e){return lt(e)},init:function(e){if(st=e.requestAnimationFrame,lt=e.cancelAnimationFrame,!st)for(var t=["ms","moz","webkit","o"],n=0;n<t.length;n++){var r=t[n];st=e["".concat(r,"RequestAnimationFrame")],lt=e["".concat(r,"CancelAnimationFrame")]||e["".concat(r,"CancelRequestAnimationFrame")];}st||(st=function(e){var t=Date.now(),n=Math.max(0,16-(t-ct)),r=setTimeout(function(){e(t+n);},n);return ct=t+n,r},lt=function(e){return clearTimeout(e)});}};ut.default=ft;var pt={};function dt(e){return (dt="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(pt,"__esModule",{value:!0}),pt.warnOnce=function(e,t){var n=!1;return function(){return n||(bt.default.window.console.warn(t),n=!0),e.apply(this,arguments)}},pt._getQBezierValue=Tt,pt.getQuadraticCurvePoint=function(e,t,n,r,o,i,a){return {x:Tt(a,e,n,o),y:Tt(a,t,r,i)}},pt.easeOutQuad=function(e,t,n,r){return -n*(e/=r)*(e-2)+t},pt.copyAction=function(e,t){return e.name=t.name,e.axis=t.axis,e.edges=t.edges,e},Object.defineProperty(pt,"win",{enumerable:!0,get:function(){return bt.default}}),Object.defineProperty(pt,"browser",{enumerable:!0,get:function(){return Ot.default}}),Object.defineProperty(pt,"clone",{enumerable:!0,get:function(){return wt.default}}),Object.defineProperty(pt,"events",{enumerable:!0,get:function(){return Pt.default}}),Object.defineProperty(pt,"extend",{enumerable:!0,get:function(){return _t.default}}),Object.defineProperty(pt,"getOriginXY",{enumerable:!0,get:function(){return xt.default}}),Object.defineProperty(pt,"hypot",{enumerable:!0,get:function(){return St.default}}),Object.defineProperty(pt,"normalizeListeners",{enumerable:!0,get:function(){return jt.default}}),Object.defineProperty(pt,"raf",{enumerable:!0,get:function(){return Mt.default}}),pt.rect=pt.pointer=pt.is=pt.dom=pt.arr=void 0;var vt=Dt(u);pt.arr=vt;var yt=Dt(C);pt.dom=yt;var mt=Dt(y);pt.is=mt;var gt=Dt(J);pt.pointer=gt;var ht=Dt(ge);pt.rect=ht;var bt=Et(s),Ot=Et(j),wt=Et(xe),Pt=Et(De),_t=Et(me),xt=Et(Je),St=Et(K),jt=Et(et),Mt=Et(ut);function Et(e){return e&&e.__esModule?e:{default:e}}function kt(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return kt=function(){return e},e}function Dt(e){if(e&&e.__esModule)return e;if(null===e||"object"!==dt(e)&&"function"!=typeof e)return {default:e};var t=kt();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}function Tt(e,t,n,r){var o=1-e;return o*o*t+2*o*e*n+e*e*r}var It={};Object.defineProperty(It,"__esModule",{value:!0}),It.default=It.defaults=void 0;var At={base:{preventDefault:"auto",deltaSource:"page"},perAction:{enabled:!1,origin:{x:0,y:0}},actions:{}},zt=It.defaults=At;It.default=zt;var Ct={};function Rt(e){return (Rt="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(Ct,"__esModule",{value:!0}),Ct.default=void 0;var Wt=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Rt(e)&&"function"!=typeof e)return {default:e};var t=Ft();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(u),Xt=Yt(me),Nt=Yt(et);function Yt(e){return e&&e.__esModule?e:{default:e}}function Ft(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Ft=function(){return e},e}function Lt(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function qt(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Vt(e,t){for(var n=0;n<t.length;n++){var r=t[n];if(e.immediatePropagationStopped)break;r(e);}}var Gt=function(){function t(e){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),qt(this,"options",void 0),qt(this,"types",{}),qt(this,"propagationStopped",!1),qt(this,"immediatePropagationStopped",!1),qt(this,"global",void 0),this.options=(0, Xt.default)({},e||{});}var e,n;return e=t,(n=[{key:"fire",value:function(e){var t,n=this.global;(t=this.types[e.type])&&Vt(e,t),!e.propagationStopped&&n&&(t=n[e.type])&&Vt(e,t);}},{key:"on",value:function(e,t){var n=(0, Nt.default)(e,t);for(e in n)this.types[e]=Wt.merge(this.types[e]||[],n[e]);}},{key:"off",value:function(e,t){var n=(0, Nt.default)(e,t);for(e in n){var r=this.types[e];if(r&&r.length)for(var o=0;o<n[e].length;o++){var i=n[e][o],a=r.indexOf(i);-1!==a&&r.splice(a,1);}}}},{key:"getRect",value:function(){return null}}])&&Lt(e.prototype,n),t}();Ct.default=Gt;var Ut={};function Bt(e){return (Bt="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(Ut,"__esModule",{value:!0}),Ut.default=Ut.Interactable=void 0;var Ht=on(u),Kt=nn(j),$t=nn(xe),Qt=nn(De),Zt=nn(me),Jt=on(y),en=nn(et),tn=nn(Ct);function nn(e){return e&&e.__esModule?e:{default:e}}function rn(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return rn=function(){return e},e}function on(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Bt(e)&&"function"!=typeof e)return {default:e};var t=rn();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}function an(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function un(e,t,n){return t&&an(e.prototype,t),n&&an(e,n),e}function sn(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var ln=function(){function r(e,t,n){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,r),sn(this,"options",void 0),sn(this,"_actions",void 0),sn(this,"target",void 0),sn(this,"events",new tn.default),sn(this,"_context",void 0),sn(this,"_win",void 0),sn(this,"_doc",void 0),this._actions=t.actions,this.target=e,this._context=t.context||n,this._win=(0, s.getWindow)((0, C.trySelector)(e)?this._context:e),this._doc=this._win.document,this.set(t);}return un(r,[{key:"_defaults",get:function(){return {base:{},perAction:{},actions:{}}}}]),un(r,[{key:"setOnEvents",value:function(e,t){return Jt.func(t.onstart)&&this.on("".concat(e,"start"),t.onstart),Jt.func(t.onmove)&&this.on("".concat(e,"move"),t.onmove),Jt.func(t.onend)&&this.on("".concat(e,"end"),t.onend),Jt.func(t.oninertiastart)&&this.on("".concat(e,"inertiastart"),t.oninertiastart),this}},{key:"updatePerActionListeners",value:function(e,t,n){(Jt.array(t)||Jt.object(t))&&this.off(e,t),(Jt.array(n)||Jt.object(n))&&this.on(e,n);}},{key:"setPerAction",value:function(e,t){var n=this._defaults;for(var r in t){var o=r,i=this.options[e],a=t[o];"listeners"===o&&this.updatePerActionListeners(e,i.listeners,a),Jt.array(a)?i[o]=Ht.from(a):Jt.plainObject(a)?(i[o]=(0, Zt.default)(i[o]||{},(0, $t.default)(a)),Jt.object(n.perAction[o])&&"enabled"in n.perAction[o]&&(i[o].enabled=!1!==a.enabled)):Jt.bool(a)&&Jt.object(n.perAction[o])?i[o].enabled=a:i[o]=a;}}},{key:"getRect",value:function(e){return e=e||(Jt.element(this.target)?this.target:null),Jt.string(this.target)&&(e=e||this._context.querySelector(this.target)),(0, C.getElementRect)(e)}},{key:"rectChecker",value:function(e){return Jt.func(e)?(this.getRect=e,this):null===e?(delete this.getRect,this):this.getRect}},{key:"_backCompatOption",value:function(e,t){if((0, C.trySelector)(t)||Jt.object(t)){this.options[e]=t;for(var n=0;n<this._actions.names.length;n++){var r=this._actions.names[n];this.options[r][e]=t;}return this}return this.options[e]}},{key:"origin",value:function(e){return this._backCompatOption("origin",e)}},{key:"deltaSource",value:function(e){return "page"===e||"client"===e?(this.options.deltaSource=e,this):this.options.deltaSource}},{key:"context",value:function(){return this._context}},{key:"inContext",value:function(e){return this._context===e.ownerDocument||(0, C.nodeContains)(this._context,e)}},{key:"testIgnoreAllow",value:function(e,t,n){return !this.testIgnore(e.ignoreFrom,t,n)&&this.testAllow(e.allowFrom,t,n)}},{key:"testAllow",value:function(e,t,n){return !e||!!Jt.element(n)&&(Jt.string(e)?(0, C.matchesUpTo)(n,e,t):!!Jt.element(e)&&(0, C.nodeContains)(e,n))}},{key:"testIgnore",value:function(e,t,n){return !(!e||!Jt.element(n))&&(Jt.string(e)?(0, C.matchesUpTo)(n,e,t):!!Jt.element(e)&&(0, C.nodeContains)(e,n))}},{key:"fire",value:function(e){return this.events.fire(e),this}},{key:"_onOff",value:function(e,t,n,r){Jt.object(t)&&!Jt.array(t)&&(r=n,n=null);var o="on"===e?"add":"remove",i=(0, en.default)(t,n);for(var a in i){"wheel"===a&&(a=Kt.default.wheelEvent);for(var u=0;u<i[a].length;u++){var s=i[a][u];Ht.contains(this._actions.eventTypes,a)?this.events[e](a,s):Jt.string(this.target)?Qt.default["".concat(o,"Delegate")](this.target,this._context,a,s,r):Qt.default[o](this.target,a,s,r);}}return this}},{key:"on",value:function(e,t,n){return this._onOff("on",e,t,n)}},{key:"off",value:function(e,t,n){return this._onOff("off",e,t,n)}},{key:"set",value:function(e){var t=this._defaults;for(var n in Jt.object(e)||(e={}),this.options=(0, $t.default)(t.base),this._actions.methodDict){var r=n,o=this._actions.methodDict[r];this.options[r]={},this.setPerAction(r,(0, Zt.default)((0, Zt.default)({},t.perAction),t.actions[r])),this[o](e[r]);}for(var i in e)Jt.func(this[i])&&this[i](e[i]);return this}},{key:"unset",value:function(){if(Qt.default.remove(this.target,"all"),Jt.string(this.target))for(var e in Qt.default.delegatedEvents){var t=Qt.default.delegatedEvents[e];t.selectors[0]===this.target&&t.contexts[0]===this._context&&(t.selectors.splice(0,1),t.contexts.splice(0,1),t.listeners.splice(0,1)),Qt.default.remove(this._context,e,Qt.default.delegateListener),Qt.default.remove(this._context,e,Qt.default.delegateUseCapture,!0);}else Qt.default.remove(this.target,"all");}}]),r}(),cn=Ut.Interactable=ln;Ut.default=cn;var fn={};function pn(e){return (pn="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(fn,"__esModule",{value:!0}),fn.default=void 0;var dn,vn=bn(u),yn=bn(C),mn=(dn=me)&&dn.__esModule?dn:{default:dn},gn=bn(y);function hn(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return hn=function(){return e},e}function bn(e){if(e&&e.__esModule)return e;if(null===e||"object"!==pn(e)&&"function"!=typeof e)return {default:e};var t=hn();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}function On(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function wn(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var Pn=function(){function t(e){var a=this;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),this.scope=e,wn(this,"list",[]),wn(this,"selectorMap",{}),e.addListeners({"interactable:unset":function(e){var t=e.interactable,n=t.target,r=t._context,o=gn.string(n)?a.selectorMap[n]:n[a.scope.id],i=o.findIndex(function(e){return e.context===r});o[i]&&(o[i].context=null,o[i].interactable=null),o.splice(i,1);}});}var e,n;return e=t,(n=[{key:"new",value:function(e,t){t=(0, mn.default)(t||{},{actions:this.scope.actions});var n=new this.scope.Interactable(e,t,this.scope.document),r={context:n._context,interactable:n};return this.scope.addDocument(n._doc),this.list.push(n),gn.string(e)?(this.selectorMap[e]||(this.selectorMap[e]=[]),this.selectorMap[e].push(r)):(n.target[this.scope.id]||Object.defineProperty(e,this.scope.id,{value:[],configurable:!0}),e[this.scope.id].push(r)),this.scope.fire("interactable:new",{target:e,options:t,interactable:n,win:this.scope._win}),n}},{key:"get",value:function(t,e){var n=e&&e.context||this.scope.document,r=gn.string(t),o=r?this.selectorMap[t]:t[this.scope.id];if(!o)return null;var i=vn.find(o,function(e){return e.context===n&&(r||e.interactable.inContext(t))});return i&&i.interactable}},{key:"forEachMatch",value:function(e,t){for(var n=0;n<this.list.length;n++){var r=this.list[n],o=void 0;if((gn.string(r.target)?gn.element(e)&&yn.matchesSelector(e,r.target):e===r.target)&&r.inContext(e)&&(o=t(r)),void 0!==o)return o}}}])&&On(e.prototype,n),t}();fn.default=Pn;var _n,xn,Sn={};function jn(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function Mn(e,t,n){return t&&jn(e.prototype,t),n&&jn(e,n),e}function En(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}Object.defineProperty(Sn,"__esModule",{value:!0}),Sn.default=Sn.BaseEvent=Sn.EventPhase=void 0,Sn.EventPhase=_n,(xn=_n||(Sn.EventPhase=_n={})).Start="start",xn.Move="move",xn.End="end",xn._NONE="";var kn=function(){function t(e){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),En(this,"type",void 0),En(this,"target",void 0),En(this,"currentTarget",void 0),En(this,"interactable",void 0),En(this,"_interaction",void 0),En(this,"timeStamp",void 0),En(this,"immediatePropagationStopped",!1),En(this,"propagationStopped",!1),this._interaction=e;}return Mn(t,[{key:"interaction",get:function(){return this._interaction._proxy}}]),Mn(t,[{key:"preventDefault",value:function(){}},{key:"stopPropagation",value:function(){this.propagationStopped=!0;}},{key:"stopImmediatePropagation",value:function(){this.immediatePropagationStopped=this.propagationStopped=!0;}}]),t}(),Dn=Sn.BaseEvent=kn;Sn.default=Dn;var Tn={};Object.defineProperty(Tn,"__esModule",{value:!0}),Tn.default=Tn.InteractEvent=Tn.EventPhase=void 0;var In,An,zn=Nn(me),Cn=Nn(Je),Rn=Nn(K),Wn=Nn(Sn),Xn=Nn(It);function Nn(e){return e&&e.__esModule?e:{default:e}}function Yn(e){return (Yn="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function Fn(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function Ln(e){return (Ln=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function qn(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function Vn(e,t){return (Vn=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function Gn(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}Tn.EventPhase=In,(An=In||(Tn.EventPhase=In={})).Start="start",An.Move="move",An.End="end",An._NONE="";var Un=function(){function h(e,t,n,r,o,i,a,u){var s,l,c;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,h),l=this,s=!(c=Ln(h).call(this,e))||"object"!==Yn(c)&&"function"!=typeof c?qn(l):c,Gn(qn(s),"target",void 0),Gn(qn(s),"currentTarget",void 0),Gn(qn(s),"relatedTarget",void 0),Gn(qn(s),"screenX",void 0),Gn(qn(s),"screenY",void 0),Gn(qn(s),"button",void 0),Gn(qn(s),"buttons",void 0),Gn(qn(s),"ctrlKey",void 0),Gn(qn(s),"shiftKey",void 0),Gn(qn(s),"altKey",void 0),Gn(qn(s),"metaKey",void 0),Gn(qn(s),"page",void 0),Gn(qn(s),"client",void 0),Gn(qn(s),"delta",void 0),Gn(qn(s),"rect",void 0),Gn(qn(s),"x0",void 0),Gn(qn(s),"y0",void 0),Gn(qn(s),"t0",void 0),Gn(qn(s),"dt",void 0),Gn(qn(s),"duration",void 0),Gn(qn(s),"clientX0",void 0),Gn(qn(s),"clientY0",void 0),Gn(qn(s),"velocity",void 0),Gn(qn(s),"speed",void 0),Gn(qn(s),"swipe",void 0),Gn(qn(s),"timeStamp",void 0),Gn(qn(s),"dragEnter",void 0),Gn(qn(s),"dragLeave",void 0),Gn(qn(s),"axes",void 0),Gn(qn(s),"preEnd",void 0),o=o||e.element;var f=e.interactable,p=(f&&f.options||Xn.default).deltaSource,d=(0, Cn.default)(f,o,n),v="start"===r,y="end"===r,m=v?qn(s):e.prevEvent,g=v?e.coords.start:y?{page:m.page,client:m.client,timeStamp:e.coords.cur.timeStamp}:e.coords.cur;return s.page=(0, zn.default)({},g.page),s.client=(0, zn.default)({},g.client),s.rect=(0, zn.default)({},e.rect),s.timeStamp=g.timeStamp,y||(s.page.x-=d.x,s.page.y-=d.y,s.client.x-=d.x,s.client.y-=d.y),s.ctrlKey=t.ctrlKey,s.altKey=t.altKey,s.shiftKey=t.shiftKey,s.metaKey=t.metaKey,s.button=t.button,s.buttons=t.buttons,s.target=o,s.currentTarget=o,s.relatedTarget=i||null,s.preEnd=a,s.type=u||n+(r||""),s.interactable=f,s.t0=v?e.pointers[e.pointers.length-1].downTime:m.t0,s.x0=e.coords.start.page.x-d.x,s.y0=e.coords.start.page.y-d.y,s.clientX0=e.coords.start.client.x-d.x,s.clientY0=e.coords.start.client.y-d.y,s.delta=v||y?{x:0,y:0}:{x:s[p].x-m[p].x,y:s[p].y-m[p].y},s.dt=e.coords.delta.timeStamp,s.duration=s.timeStamp-s.t0,s.velocity=(0, zn.default)({},e.coords.velocity[p]),s.speed=(0, Rn.default)(s.velocity.x,s.velocity.y),s.swipe=y||"inertiastart"===r?s.getSwipe():null,s}var e,t;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&Vn(e,t);}(h,Wn["default"]),e=h,(t=[{key:"getSwipe",value:function(){var e=this._interaction;if(e.prevEvent.speed<600||150<this.timeStamp-e.prevEvent.timeStamp)return null;var t=180*Math.atan2(e.prevEvent.velocityY,e.prevEvent.velocityX)/Math.PI;t<0&&(t+=360);var n=112.5<=t&&t<247.5,r=202.5<=t&&t<337.5;return {up:r,down:!r&&22.5<=t&&t<157.5,left:n,right:!n&&(292.5<=t||t<67.5),angle:t,speed:e.prevEvent.speed,velocity:{x:e.prevEvent.velocityX,y:e.prevEvent.velocityY}}}},{key:"preventDefault",value:function(){}},{key:"stopImmediatePropagation",value:function(){this.immediatePropagationStopped=this.propagationStopped=!0;}},{key:"stopPropagation",value:function(){this.propagationStopped=!0;}},{key:"pageX",get:function(){return this.page.x},set:function(e){this.page.x=e;}},{key:"pageY",get:function(){return this.page.y},set:function(e){this.page.y=e;}},{key:"clientX",get:function(){return this.client.x},set:function(e){this.client.x=e;}},{key:"clientY",get:function(){return this.client.y},set:function(e){this.client.y=e;}},{key:"dx",get:function(){return this.delta.x},set:function(e){this.delta.x=e;}},{key:"dy",get:function(){return this.delta.y},set:function(e){this.delta.y=e;}},{key:"velocityX",get:function(){return this.velocity.x},set:function(e){this.velocity.x=e;}},{key:"velocityY",get:function(){return this.velocity.y},set:function(e){this.velocity.y=e;}}])&&Fn(e.prototype,t),h}(),Bn=Tn.InteractEvent=Un;Tn.default=Bn;var Hn={};Object.defineProperty(Hn,"__esModule",{value:!0}),Hn.default=Hn.PointerInfo=void 0;function Kn(e,t,n,r,o){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,Kn),this.id=e,this.pointer=t,this.event=n,this.downTime=r,this.downTarget=o;}var $n=Hn.PointerInfo=Kn;Hn.default=$n;var Qn={};function Zn(e){return (Zn="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(Qn,"__esModule",{value:!0}),Qn.default=void 0;var Jn=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Zn(e)&&"function"!=typeof e)return {default:e};var t=er();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(C);function er(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return er=function(){return e},e}var tr={methodOrder:["simulationResume","mouseOrPen","hasPointer","idle"],search:function(e){for(var t=0;t<tr.methodOrder.length;t++){var n;n=tr.methodOrder[t];var r=tr[n](e);if(r)return r}return null},simulationResume:function(e){var t=e.pointerType,n=e.eventType,r=e.eventTarget,o=e.scope;if(!/down|start/i.test(n))return null;for(var i=0;i<o.interactions.list.length;i++){var a=o.interactions.list[i],u=r;if(a.simulation&&a.simulation.allowResume&&a.pointerType===t)for(;u;){if(u===a.element)return a;u=Jn.parentNode(u);}}return null},mouseOrPen:function(e){var t,n=e.pointerId,r=e.pointerType,o=e.eventType,i=e.scope;if("mouse"!==r&&"pen"!==r)return null;for(var a=0;a<i.interactions.list.length;a++){var u=i.interactions.list[a];if(u.pointerType===r){if(u.simulation&&!nr(u,n))continue;if(u.interacting())return u;t=t||u;}}if(t)return t;for(var s=0;s<i.interactions.list.length;s++){var l=i.interactions.list[s];if(!(l.pointerType!==r||/down/i.test(o)&&l.simulation))return l}return null},hasPointer:function(e){for(var t=e.pointerId,n=e.scope,r=0;r<n.interactions.list.length;r++){var o=n.interactions.list[r];if(nr(o,t))return o}return null},idle:function(e){for(var t=e.pointerType,n=e.scope,r=0;r<n.interactions.list.length;r++){var o=n.interactions.list[r];if(1===o.pointers.length){var i=o.interactable;if(i&&(!i.options.gesture||!i.options.gesture.enabled))continue}else if(2<=o.pointers.length)continue;if(!o.interacting()&&t===o.pointerType)return o}return null}};function nr(e,t){return e.pointers.some(function(e){return e.id===t})}var rr=tr;Qn.default=rr;var or={};function ir(e){return (ir="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(or,"__esModule",{value:!0}),or.default=void 0;var ar=O({}),ur=cr(u),sr=cr(y);function lr(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return lr=function(){return e},e}function cr(e){if(e&&e.__esModule)return e;if(null===e||"object"!==ir(e)&&"function"!=typeof e)return {default:e};var t=lr();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}function fr(e){var t=e.interaction;if("drag"===t.prepared.name){var n=t.prepared.axis;"x"===n?(t.coords.cur.page.y=t.coords.start.page.y,t.coords.cur.client.y=t.coords.start.client.y,t.coords.velocity.client.y=0,t.coords.velocity.page.y=0):"y"===n&&(t.coords.cur.page.x=t.coords.start.page.x,t.coords.cur.client.x=t.coords.start.client.x,t.coords.velocity.client.x=0,t.coords.velocity.page.x=0);}}function pr(e){var t=e.iEvent,n=e.interaction;if("drag"===n.prepared.name){var r=n.prepared.axis;if("x"===r||"y"===r){var o="x"===r?"y":"x";t.page[o]=n.coords.start.page[o],t.client[o]=n.coords.start.client[o],t.delta[o]=0;}}}ar.ActionName.Drag="drag";var dr={id:"actions/drag",install:function(e){var t=e.actions,n=e.Interactable,r=e.defaults;n.prototype.draggable=dr.draggable,t[ar.ActionName.Drag]=dr,t.names.push(ar.ActionName.Drag),ur.merge(t.eventTypes,["dragstart","dragmove","draginertiastart","dragresume","dragend"]),t.methodDict.drag="draggable",r.actions.drag=dr.defaults;},listeners:{"interactions:before-action-move":fr,"interactions:action-resume":fr,"interactions:action-move":pr,"auto-start:check":function(e){var t=e.interaction,n=e.interactable,r=e.buttons,o=n.options.drag;if(o&&o.enabled&&(!t.pointerIsDown||!/mouse|pointer/.test(t.pointerType)||0!=(r&n.options.drag.mouseButtons)))return !(e.action={name:ar.ActionName.Drag,axis:"start"===o.lockAxis?o.startAxis:o.lockAxis})}},draggable:function(e){return sr.object(e)?(this.options.drag.enabled=!1!==e.enabled,this.setPerAction(ar.ActionName.Drag,e),this.setOnEvents(ar.ActionName.Drag,e),/^(xy|x|y|start)$/.test(e.lockAxis)&&(this.options.drag.lockAxis=e.lockAxis),/^(xy|x|y)$/.test(e.startAxis)&&(this.options.drag.startAxis=e.startAxis),this):sr.bool(e)?(this.options.drag.enabled=e,this):this.options.drag},beforeMove:fr,move:pr,defaults:{startAxis:"xy",lockAxis:"xy"},getCursor:function(){return "move"}},vr=dr;or.default=vr;var yr={};Object.defineProperty(yr,"__esModule",{value:!0}),yr.default=void 0;var mr,gr=(mr=Sn)&&mr.__esModule?mr:{default:mr},hr=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Or(e)&&"function"!=typeof e)return {default:e};var t=br();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(u);function br(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return br=function(){return e},e}function Or(e){return (Or="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function wr(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function Pr(e){return (Pr=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function _r(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function xr(e,t){return (xr=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function Sr(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var jr=function(){function l(e,t,n){var r,o,i;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,l),o=this,r=!(i=Pr(l).call(this,t._interaction))||"object"!==Or(i)&&"function"!=typeof i?_r(o):i,Sr(_r(r),"target",void 0),Sr(_r(r),"dropzone",void 0),Sr(_r(r),"dragEvent",void 0),Sr(_r(r),"relatedTarget",void 0),Sr(_r(r),"draggable",void 0),Sr(_r(r),"timeStamp",void 0),Sr(_r(r),"propagationStopped",!1),Sr(_r(r),"immediatePropagationStopped",!1);var a="dragleave"===n?e.prev:e.cur,u=a.element,s=a.dropzone;return r.type=n,r.target=u,r.currentTarget=u,r.dropzone=s,r.dragEvent=t,r.relatedTarget=t.target,r.draggable=t.interactable,r.timeStamp=t.timeStamp,r}var e,t;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&xr(e,t);}(l,gr["default"]),e=l,(t=[{key:"reject",value:function(){var r=this,e=this._interaction.dropState;if("dropactivate"===this.type||this.dropzone&&e.cur.dropzone===this.dropzone&&e.cur.element===this.target)if(e.prev.dropzone=this.dropzone,e.prev.element=this.target,e.rejected=!0,e.events.enter=null,this.stopImmediatePropagation(),"dropactivate"===this.type){var t=e.activeDrops,n=hr.findIndex(t,function(e){var t=e.dropzone,n=e.element;return t===r.dropzone&&n===r.target});e.activeDrops.splice(n,1);var o=new l(e,this.dragEvent,"dropdeactivate");o.dropzone=this.dropzone,o.target=this.target,this.dropzone.fire(o);}else this.dropzone.fire(new l(e,this.dragEvent,"dragleave"));}},{key:"preventDefault",value:function(){}},{key:"stopPropagation",value:function(){this.propagationStopped=!0;}},{key:"stopImmediatePropagation",value:function(){this.immediatePropagationStopped=this.propagationStopped=!0;}}])&&wr(e.prototype,t),l}();yr.default=jr;var Mr={};function Er(e){return (Er="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(Mr,"__esModule",{value:!0}),Mr.default=void 0;var kr=O({}),Dr=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Er(e)&&"function"!=typeof e)return {default:e};var t=Ar();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(pt),Tr=zr(or),Ir=zr(yr);function Ar(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Ar=function(){return e},e}function zr(e){return e&&e.__esModule?e:{default:e}}function Cr(e,t){for(var n=0;n<e.slice().length;n++){var r=e.slice()[n],o=r.dropzone,i=r.element;t.dropzone=o,t.target=i,o.fire(t),t.propagationStopped=t.immediatePropagationStopped=!1;}}function Rr(e,t){for(var n=function(e,t){for(var n=e.interactables,r=[],o=0;o<n.list.length;o++){var i=n.list[o];if(i.options.drop.enabled){var a=i.options.drop.accept;if(!(Dr.is.element(a)&&a!==t||Dr.is.string(a)&&!Dr.dom.matchesSelector(t,a)||Dr.is.func(a)&&!a({dropzone:i,draggableElement:t})))for(var u=Dr.is.string(i.target)?i._context.querySelectorAll(i.target):Dr.is.array(i.target)?i.target:[i.target],s=0;s<u.length;s++){var l=u[s];l!==t&&r.push({dropzone:i,element:l});}}}return r}(e,t),r=0;r<n.length;r++){var o=n[r];o.rect=o.dropzone.getRect(o.element);}return n}function Wr(e,t,n){for(var r=e.dropState,o=e.interactable,i=e.element,a=[],u=0;u<r.activeDrops.length;u++){var s=r.activeDrops[u],l=s.dropzone,c=s.element,f=s.rect;a.push(l.dropCheck(t,n,o,i,c,f)?c:null);}var p=Dr.dom.indexOfDeepestElement(a);return r.activeDrops[p]||null}function Xr(e,t,n){var r=e.dropState,o={enter:null,leave:null,activate:null,deactivate:null,move:null,drop:null};return "dragstart"===n.type&&(o.activate=new Ir.default(r,n,"dropactivate"),o.activate.target=null,o.activate.dropzone=null),"dragend"===n.type&&(o.deactivate=new Ir.default(r,n,"dropdeactivate"),o.deactivate.target=null,o.deactivate.dropzone=null),r.rejected||(r.cur.element!==r.prev.element&&(r.prev.dropzone&&(o.leave=new Ir.default(r,n,"dragleave"),n.dragLeave=o.leave.target=r.prev.element,n.prevDropzone=o.leave.dropzone=r.prev.dropzone),r.cur.dropzone&&(o.enter=new Ir.default(r,n,"dragenter"),n.dragEnter=r.cur.element,n.dropzone=r.cur.dropzone)),"dragend"===n.type&&r.cur.dropzone&&(o.drop=new Ir.default(r,n,"drop"),n.dropzone=r.cur.dropzone,n.relatedTarget=r.cur.element),"dragmove"===n.type&&r.cur.dropzone&&(o.move=new Ir.default(r,n,"dropmove"),(o.move.dragmove=n).dropzone=r.cur.dropzone)),o}function Nr(e,t){var n=e.dropState,r=n.activeDrops,o=n.cur,i=n.prev;t.leave&&i.dropzone.fire(t.leave),t.move&&o.dropzone.fire(t.move),t.enter&&o.dropzone.fire(t.enter),t.drop&&o.dropzone.fire(t.drop),t.deactivate&&Cr(r,t.deactivate),n.prev.dropzone=o.dropzone,n.prev.element=o.element;}function Yr(e,t){var n=e.interaction,r=e.iEvent,o=e.event;if("dragmove"===r.type||"dragend"===r.type){var i=n.dropState;t.dynamicDrop&&(i.activeDrops=Rr(t,n.element));var a=r,u=Wr(n,a,o);i.rejected=i.rejected&&!!u&&u.dropzone===i.cur.dropzone&&u.element===i.cur.element,i.cur.dropzone=u&&u.dropzone,i.cur.element=u&&u.element,i.events=Xr(n,0,a);}}var Fr={id:"actions/drop",install:function(t){var e=t.actions,n=t.interact,r=t.Interactable,o=t.defaults;t.usePlugin(Tr.default),r.prototype.dropzone=function(e){return function(e,t){if(Dr.is.object(t)){if(e.options.drop.enabled=!1!==t.enabled,t.listeners){var n=Dr.normalizeListeners(t.listeners),r=Object.keys(n).reduce(function(e,t){return e[/^(enter|leave)/.test(t)?"drag".concat(t):/^(activate|deactivate|move)/.test(t)?"drop".concat(t):t]=n[t],e},{});e.off(e.options.drop.listeners),e.on(r),e.options.drop.listeners=r;}return Dr.is.func(t.ondrop)&&e.on("drop",t.ondrop),Dr.is.func(t.ondropactivate)&&e.on("dropactivate",t.ondropactivate),Dr.is.func(t.ondropdeactivate)&&e.on("dropdeactivate",t.ondropdeactivate),Dr.is.func(t.ondragenter)&&e.on("dragenter",t.ondragenter),Dr.is.func(t.ondragleave)&&e.on("dragleave",t.ondragleave),Dr.is.func(t.ondropmove)&&e.on("dropmove",t.ondropmove),/^(pointer|center)$/.test(t.overlap)?e.options.drop.overlap=t.overlap:Dr.is.number(t.overlap)&&(e.options.drop.overlap=Math.max(Math.min(1,t.overlap),0)),"accept"in t&&(e.options.drop.accept=t.accept),"checker"in t&&(e.options.drop.checker=t.checker),e}if(Dr.is.bool(t))return e.options.drop.enabled=t,e;return e.options.drop}(this,e)},r.prototype.dropCheck=function(e,t,n,r,o,i){return function(e,t,n,r,o,i,a){var u=!1;if(!(a=a||e.getRect(i)))return !!e.options.drop.checker&&e.options.drop.checker(t,n,u,e,i,r,o);var s=e.options.drop.overlap;if("pointer"===s){var l=Dr.getOriginXY(r,o,kr.ActionName.Drag),c=Dr.pointer.getPageXY(t);c.x+=l.x,c.y+=l.y;var f=c.x>a.left&&c.x<a.right,p=c.y>a.top&&c.y<a.bottom;u=f&&p;}var d=r.getRect(o);if(d&&"center"===s){var v=d.left+d.width/2,y=d.top+d.height/2;u=v>=a.left&&v<=a.right&&y>=a.top&&y<=a.bottom;}if(d&&Dr.is.number(s)){var m=Math.max(0,Math.min(a.right,d.right)-Math.max(a.left,d.left))*Math.max(0,Math.min(a.bottom,d.bottom)-Math.max(a.top,d.top))/(d.width*d.height);u=s<=m;}e.options.drop.checker&&(u=e.options.drop.checker(t,n,u,e,i,r,o));return u}(this,e,t,n,r,o,i)},n.dynamicDrop=function(e){return Dr.is.bool(e)?(t.dynamicDrop=e,n):t.dynamicDrop},Dr.arr.merge(e.eventTypes,["dragenter","dragleave","dropactivate","dropdeactivate","dropmove","drop"]),e.methodDict.drop="dropzone",t.dynamicDrop=!1,o.actions.drop=Fr.defaults;},listeners:{"interactions:before-action-start":function(e){var t=e.interaction;"drag"===t.prepared.name&&(t.dropState={cur:{dropzone:null,element:null},prev:{dropzone:null,element:null},rejected:null,events:null,activeDrops:[]});},"interactions:after-action-start":function(e,t){var n=e.interaction,r=(e.iEvent);if("drag"===n.prepared.name){var o=n.dropState;o.activeDrops=null,o.events=null,o.activeDrops=Rr(t,n.element),o.events=Xr(n,0,r),o.events.activate&&(Cr(o.activeDrops,o.events.activate),t.fire("actions/drop:start",{interaction:n,dragEvent:r}));}},"interactions:action-move":Yr,"interactions:action-end":Yr,"interactions:after-action-move":function(e,t){var n=e.interaction,r=e.iEvent;"drag"===n.prepared.name&&(Nr(n,n.dropState.events),t.fire("actions/drop:move",{interaction:n,dragEvent:r}),n.dropState.events={});},"interactions:after-action-end":function(e,t){var n=e.interaction,r=e.iEvent;"drag"===n.prepared.name&&(Nr(n,n.dropState.events),t.fire("actions/drop:end",{interaction:n,dragEvent:r}));},"interactions:stop":function(e){var t=e.interaction;if("drag"===t.prepared.name){var n=t.dropState;n&&(n.activeDrops=null,n.events=null,n.cur.dropzone=null,n.cur.element=null,n.prev.dropzone=null,n.prev.element=null,n.rejected=!1);}}},getActiveDrops:Rr,getDrop:Wr,getDropEvents:Xr,fireDropEvents:Nr,defaults:{enabled:!1,accept:null,overlap:"pointer"}},Lr=Fr;Mr.default=Lr;var qr={};function Vr(e){return (Vr="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(qr,"__esModule",{value:!0}),qr.default=void 0;var Gr,Ur=(Gr=Tn)&&Gr.__esModule?Gr:{default:Gr},Br=O({}),Hr=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Vr(e)&&"function"!=typeof e)return {default:e};var t=Kr();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(pt);function Kr(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Kr=function(){return e},e}function $r(e){var t=e.interaction,n=e.iEvent,r=e.event,o=e.phase;if("gesture"===t.prepared.name){var i=t.pointers.map(function(e){return e.pointer}),a="start"===o,u="end"===o,s=t.interactable.options.deltaSource;if(n.touches=[i[0],i[1]],a)n.distance=Hr.pointer.touchDistance(i,s),n.box=Hr.pointer.touchBBox(i),n.scale=1,n.ds=0,n.angle=Hr.pointer.touchAngle(i,s),n.da=0,t.gesture.startDistance=n.distance,t.gesture.startAngle=n.angle;else if(u||r instanceof Ur.default){var l=t.prevEvent;n.distance=l.distance,n.box=l.box,n.scale=l.scale,n.ds=0,n.angle=l.angle,n.da=0;}else n.distance=Hr.pointer.touchDistance(i,s),n.box=Hr.pointer.touchBBox(i),n.scale=n.distance/t.gesture.startDistance,n.angle=Hr.pointer.touchAngle(i,s),n.ds=n.scale-t.gesture.scale,n.da=n.angle-t.gesture.angle;t.gesture.distance=n.distance,t.gesture.angle=n.angle,Hr.is.number(n.scale)&&n.scale!==1/0&&!isNaN(n.scale)&&(t.gesture.scale=n.scale);}}Br.ActionName.Gesture="gesture";var Qr={id:"actions/gesture",before:["actions/drag","actions/resize"],install:function(e){var t=e.actions,n=e.Interactable,r=e.defaults;n.prototype.gesturable=function(e){return Hr.is.object(e)?(this.options.gesture.enabled=!1!==e.enabled,this.setPerAction(Br.ActionName.Gesture,e),this.setOnEvents(Br.ActionName.Gesture,e),this):Hr.is.bool(e)?(this.options.gesture.enabled=e,this):this.options.gesture},t[Br.ActionName.Gesture]=Qr,t.names.push(Br.ActionName.Gesture),Hr.arr.merge(t.eventTypes,["gesturestart","gesturemove","gestureend"]),t.methodDict.gesture="gesturable",r.actions.gesture=Qr.defaults;},listeners:{"interactions:action-start":$r,"interactions:action-move":$r,"interactions:action-end":$r,"interactions:new":function(e){e.interaction.gesture={angle:0,distance:0,scale:1,startAngle:0,startDistance:0};},"auto-start:check":function(e){if(!(e.interaction.pointers.length<2)){var t=e.interactable.options.gesture;if(t&&t.enabled)return !(e.action={name:Br.ActionName.Gesture})}}},defaults:{},getCursor:function(){return ""}},Zr=Qr;qr.default=Zr;var Jr={};function eo(e){return (eo="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(Jr,"__esModule",{value:!0}),Jr.default=void 0;g({});var to,no=O({}),ro=so(u),oo=so(C),io=(to=me)&&to.__esModule?to:{default:to},ao=so(y);function uo(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return uo=function(){return e},e}function so(e){if(e&&e.__esModule)return e;if(null===e||"object"!==eo(e)&&"function"!=typeof e)return {default:e};var t=uo();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}function lo(e,t,n,r,o,i,a){if(!t)return !1;if(!0===t){var u=ao.number(i.width)?i.width:i.right-i.left,s=ao.number(i.height)?i.height:i.bottom-i.top;if(a=Math.min(a,("left"===e||"right"===e?u:s)/2),u<0&&("left"===e?e="right":"right"===e&&(e="left")),s<0&&("top"===e?e="bottom":"bottom"===e&&(e="top")),"left"===e)return n.x<(0<=u?i.left:i.right)+a;if("top"===e)return n.y<(0<=s?i.top:i.bottom)+a;if("right"===e)return n.x>(0<=u?i.right:i.left)-a;if("bottom"===e)return n.y>(0<=s?i.bottom:i.top)-a}return !!ao.element(r)&&(ao.element(t)?t===r:oo.matchesUpTo(r,t,o))}function co(e){var t=e.iEvent,n=e.interaction;n.prepared.name===no.ActionName.Resize&&n.resizeAxes&&(n.interactable.options.resize.square?("y"===n.resizeAxes?t.delta.x=t.delta.y:t.delta.y=t.delta.x,t.axes="xy"):(t.axes=n.resizeAxes,"x"===n.resizeAxes?t.delta.y=0:"y"===n.resizeAxes&&(t.delta.x=0)));}var fo={id:"actions/resize",before:["actions/drag"],install:function(t){var e=t.actions,n=t.browser,r=t.Interactable,o=t.defaults;fo.cursors=n.isIe9?{x:"e-resize",y:"s-resize",xy:"se-resize",top:"n-resize",left:"w-resize",bottom:"s-resize",right:"e-resize",topleft:"se-resize",bottomright:"se-resize",topright:"ne-resize",bottomleft:"ne-resize"}:{x:"ew-resize",y:"ns-resize",xy:"nwse-resize",top:"ns-resize",left:"ew-resize",bottom:"ns-resize",right:"ew-resize",topleft:"nwse-resize",bottomright:"nwse-resize",topright:"nesw-resize",bottomleft:"nesw-resize"},fo.defaultMargin=n.supportsTouch||n.supportsPointerEvent?20:10,r.prototype.resizable=function(e){return function(e,t,n){if(ao.object(t))return e.options.resize.enabled=!1!==t.enabled,e.setPerAction(no.ActionName.Resize,t),e.setOnEvents(no.ActionName.Resize,t),ao.string(t.axis)&&/^x$|^y$|^xy$/.test(t.axis)?e.options.resize.axis=t.axis:null===t.axis&&(e.options.resize.axis=n.defaults.actions.resize.axis),ao.bool(t.preserveAspectRatio)?e.options.resize.preserveAspectRatio=t.preserveAspectRatio:ao.bool(t.square)&&(e.options.resize.square=t.square),e;if(ao.bool(t))return e.options.resize.enabled=t,e;return e.options.resize}(this,e,t)},e[no.ActionName.Resize]=fo,e.names.push(no.ActionName.Resize),ro.merge(e.eventTypes,["resizestart","resizemove","resizeinertiastart","resizeresume","resizeend"]),e.methodDict.resize="resizable",o.actions.resize=fo.defaults;},listeners:{"interactions:new":function(e){e.interaction.resizeAxes="xy";},"interactions:action-start":function(e){!function(e){var t=e.iEvent,n=e.interaction;if("resize"===n.prepared.name&&n.prepared.edges){var r=n.rect;n._rects={start:(0, io.default)({},r),corrected:(0, io.default)({},r),previous:(0, io.default)({},r),delta:{left:0,right:0,width:0,top:0,bottom:0,height:0}},t.edges=n.prepared.edges,t.rect=n._rects.corrected,t.deltaRect=n._rects.delta;}}(e),co(e);},"interactions:action-move":function(e){!function(e){var t=e.iEvent,n=e.interaction;if("resize"===n.prepared.name&&n.prepared.edges){var r=n.interactable.options.resize.invert,o="reposition"===r||"negate"===r,i=n.rect,a=n._rects,u=a.start,s=a.corrected,l=a.delta,c=a.previous;if((0, io.default)(c,s),o){if((0, io.default)(s,i),"reposition"===r){if(s.top>s.bottom){var f=s.top;s.top=s.bottom,s.bottom=f;}if(s.left>s.right){var p=s.left;s.left=s.right,s.right=p;}}}else s.top=Math.min(i.top,u.bottom),s.bottom=Math.max(i.bottom,u.top),s.left=Math.min(i.left,u.right),s.right=Math.max(i.right,u.left);for(var d in s.width=s.right-s.left,s.height=s.bottom-s.top,s)l[d]=s[d]-c[d];t.edges=n.prepared.edges,t.rect=s,t.deltaRect=l;}}(e),co(e);},"interactions:action-end":function(e){var t=e.iEvent,n=e.interaction;"resize"===n.prepared.name&&n.prepared.edges&&(t.edges=n.prepared.edges,t.rect=n._rects.corrected,t.deltaRect=n._rects.delta);},"auto-start:check":function(e){var t=e.interaction,n=e.interactable,r=e.element,o=e.rect,i=e.buttons;if(o){var a=(0, io.default)({},t.coords.cur.page),u=n.options.resize;if(u&&u.enabled&&(!t.pointerIsDown||!/mouse|pointer/.test(t.pointerType)||0!=(i&u.mouseButtons))){if(ao.object(u.edges)){var s={left:!1,right:!1,top:!1,bottom:!1};for(var l in s)s[l]=lo(l,u.edges[l],a,t._latestPointer.eventTarget,r,o,u.margin||fo.defaultMargin);s.left=s.left&&!s.right,s.top=s.top&&!s.bottom,(s.left||s.right||s.top||s.bottom)&&(e.action={name:no.ActionName.Resize,edges:s});}else{var c="y"!==u.axis&&a.x>o.right-fo.defaultMargin,f="x"!==u.axis&&a.y>o.bottom-fo.defaultMargin;(c||f)&&(e.action={name:"resize",axes:(c?"x":"")+(f?"y":"")});}return !e.action&&void 0}}}},defaults:{square:!(no.ActionName.Resize="resize"),preserveAspectRatio:!1,axis:"xy",margin:NaN,edges:null,invert:"none"},cursors:null,getCursor:function(e){var t=e.edges,n=e.axis,r=e.name,o=fo.cursors,i=null;if(n)i=o[r+n];else if(t){for(var a="",u=["top","bottom","left","right"],s=0;s<u.length;s++){var l=u[s];t[l]&&(a+=l);}i=o[a];}return i},defaultMargin:null},po=fo;Jr.default=po;var vo={};Object.defineProperty(vo,"__esModule",{value:!0}),vo.install=function(e){e.usePlugin(go.default),e.usePlugin(ho.default),e.usePlugin(yo.default),e.usePlugin(mo.default);},Object.defineProperty(vo,"drag",{enumerable:!0,get:function(){return yo.default}}),Object.defineProperty(vo,"drop",{enumerable:!0,get:function(){return mo.default}}),Object.defineProperty(vo,"gesture",{enumerable:!0,get:function(){return go.default}}),Object.defineProperty(vo,"resize",{enumerable:!0,get:function(){return ho.default}}),vo.id=void 0;var yo=bo(or),mo=bo(Mr),go=bo(qr),ho=bo(Jr);function bo(e){return e&&e.__esModule?e:{default:e}}vo.id="actions";var Oo={};function wo(e){return (wo="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(Oo,"__esModule",{value:!0}),Oo.getContainer=ko,Oo.getScroll=Do,Oo.getScrollSize=function(e){xo.window(e)&&(e=window.document.body);return {x:e.scrollWidth,y:e.scrollHeight}},Oo.getScrollSizeDelta=function(e,t){var n=e.interaction,r=e.element,o=n&&n.interactable.options[n.prepared.name].autoScroll;if(!o||!o.enabled)return t(),{x:0,y:0};var i=ko(o.container,n.interactable,r),a=Do(i);t();var u=Do(i);return {x:u.x-a.x,y:u.y-a.y}},Oo.default=void 0;var Po,_o=Mo(C),xo=Mo(y),So=(Po=ut)&&Po.__esModule?Po:{default:Po};function jo(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return jo=function(){return e},e}function Mo(e){if(e&&e.__esModule)return e;if(null===e||"object"!==wo(e)&&"function"!=typeof e)return {default:e};var t=jo();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}var Eo={defaults:{enabled:!1,margin:60,container:null,speed:300},now:Date.now,interaction:null,i:0,x:0,y:0,isScrolling:!1,prevTime:0,margin:0,speed:0,start:function(e){Eo.isScrolling=!0,So.default.cancel(Eo.i),(e.autoScroll=Eo).interaction=e,Eo.prevTime=Eo.now(),Eo.i=So.default.request(Eo.scroll);},stop:function(){Eo.isScrolling=!1,Eo.interaction&&(Eo.interaction.autoScroll=null),So.default.cancel(Eo.i);},scroll:function(){var e=Eo.interaction,t=e.interactable,n=e.element,r=e.prepared.name,o=t.options[r].autoScroll,i=ko(o.container,t,n),a=Eo.now(),u=(a-Eo.prevTime)/1e3,s=o.speed*u;if(1<=s){var l={x:Eo.x*s,y:Eo.y*s};if(l.x||l.y){var c=Do(i);xo.window(i)?i.scrollBy(l.x,l.y):i&&(i.scrollLeft+=l.x,i.scrollTop+=l.y);var f=Do(i),p={x:f.x-c.x,y:f.y-c.y};(p.x||p.y)&&t.fire({type:"autoscroll",target:n,interactable:t,delta:p,interaction:e,container:i});}Eo.prevTime=a;}Eo.isScrolling&&(So.default.cancel(Eo.i),Eo.i=So.default.request(Eo.scroll));},check:function(e,t){var n=e.options;return n[t].autoScroll&&n[t].autoScroll.enabled},onInteractionMove:function(e){var t=e.interaction,n=e.pointer;if(t.interacting()&&Eo.check(t.interactable,t.prepared.name))if(t.simulation)Eo.x=Eo.y=0;else{var r,o,i,a,u=t.interactable,s=t.element,l=t.prepared.name,c=u.options[l].autoScroll,f=ko(c.container,u,s);if(xo.window(f))a=n.clientX<Eo.margin,r=n.clientY<Eo.margin,o=n.clientX>f.innerWidth-Eo.margin,i=n.clientY>f.innerHeight-Eo.margin;else{var p=_o.getElementClientRect(f);a=n.clientX<p.left+Eo.margin,r=n.clientY<p.top+Eo.margin,o=n.clientX>p.right-Eo.margin,i=n.clientY>p.bottom-Eo.margin;}Eo.x=o?1:a?-1:0,Eo.y=i?1:r?-1:0,Eo.isScrolling||(Eo.margin=c.margin,Eo.speed=c.speed,Eo.start(t));}}};function ko(e,t,n){return (xo.string(e)?(0, ge.getStringOptionResult)(e,t,n):e)||(0, s.getWindow)(n)}function Do(e){return xo.window(e)&&(e=window.document.body),{x:e.scrollLeft,y:e.scrollTop}}var To={id:"auto-scroll",install:function(e){var t=e.defaults,n=e.actions;(e.autoScroll=Eo).now=function(){return e.now()},n.eventTypes.push("autoscroll"),t.perAction.autoScroll=Eo.defaults;},listeners:{"interactions:new":function(e){e.interaction.autoScroll=null;},"interactions:destroy":function(e){e.interaction.autoScroll=null,Eo.stop(),Eo.interaction&&(Eo.interaction=null);},"interactions:stop":Eo.stop,"interactions:action-move":function(e){return Eo.onInteractionMove(e)}}};Oo.default=To;var Io={};function Ao(e){return (Ao="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(Io,"__esModule",{value:!0}),Io.default=void 0;var zo=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Ao(e)&&"function"!=typeof e)return {default:e};var t=Co();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(y);function Co(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Co=function(){return e},e}function Ro(e){return zo.bool(e)?(this.options.styleCursor=e,this):null===e?(delete this.options.styleCursor,this):this.options.styleCursor}function Wo(e){return zo.func(e)?(this.options.actionChecker=e,this):null===e?(delete this.options.actionChecker,this):this.options.actionChecker}var Xo={id:"auto-start/interactableMethods",install:function(d){var e=d.Interactable;e.prototype.getAction=function(e,t,n,r){var o,i,a,u,s,l,c,f,p=(i=t,a=n,u=r,s=d,l=(o=this).getRect(u),c=i.buttons||{0:1,1:4,3:8,4:16}[i.button],f={action:null,interactable:o,interaction:a,element:u,rect:l,buttons:c},s.fire("auto-start:check",f),f.action);return this.options.actionChecker?this.options.actionChecker(e,t,p,this,r,n):p},e.prototype.ignoreFrom=(0, pt.warnOnce)(function(e){return this._backCompatOption("ignoreFrom",e)},"Interactable.ignoreFrom() has been deprecated. Use Interactble.draggable({ignoreFrom: newValue})."),e.prototype.allowFrom=(0, pt.warnOnce)(function(e){return this._backCompatOption("allowFrom",e)},"Interactable.allowFrom() has been deprecated. Use Interactble.draggable({allowFrom: newValue})."),e.prototype.actionChecker=Wo,e.prototype.styleCursor=Ro;}};Io.default=Xo;var No={};function Yo(e){return (Yo="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(No,"__esModule",{value:!0}),No.default=void 0;var Fo,Lo=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Yo(e)&&"function"!=typeof e)return {default:e};var t=Vo();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(pt),qo=(Fo=Io)&&Fo.__esModule?Fo:{default:Fo};function Vo(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Vo=function(){return e},e}function Go(e,t,n,r,o){return t.testIgnoreAllow(t.options[e.name],n,r)&&t.options[e.name].enabled&&Ko(t,n,e,o)?e:null}function Uo(e,t,n,r,o,i,a){for(var u=0,s=r.length;u<s;u++){var l=r[u],c=o[u],f=l.getAction(t,n,e,c);if(f){var p=Go(f,l,c,i,a);if(p)return {action:p,interactable:l,element:c}}}return {action:null,interactable:null,element:null}}function Bo(e,t,n,r,o){var i=[],a=[],u=r;function s(e){i.push(e),a.push(u);}for(;Lo.is.element(u);){i=[],a=[],o.interactables.forEachMatch(u,s);var l=Uo(e,t,n,i,a,r,o);if(l.action&&!l.interactable.options[l.action.name].manualStart)return l;u=Lo.dom.parentNode(u);}return {action:null,interactable:null,element:null}}function Ho(e,t,n){var r=t.action,o=t.interactable,i=t.element;r=r||{name:null},e.interactable=o,e.element=i,Lo.copyAction(e.prepared,r),e.rect=o&&r.name?o.getRect(i):null,Zo(e,n),n.fire("autoStart:prepared",{interaction:e});}function Ko(e,t,n,r){var o=e.options,i=o[n.name].max,a=o[n.name].maxPerElement,u=r.autoStart.maxInteractions,s=0,l=0,c=0;if(!(i&&a&&u))return !1;for(var f=0;f<r.interactions.list.length;f++){var p=r.interactions.list[f],d=p.prepared.name;if(p.interacting()){if(u<=++s)return !1;if(p.interactable===e){if(i<=(l+=d===n.name?1:0))return !1;if(p.element===t&&(c++,d===n.name&&a<=c))return !1}}}return 0<u}function $o(e,t){return Lo.is.number(e)?(t.autoStart.maxInteractions=e,this):t.autoStart.maxInteractions}function Qo(e,t,n){var r=n.autoStart.cursorElement;r&&r!==e&&(r.style.cursor=""),e.ownerDocument.documentElement.style.cursor=t,e.style.cursor=t,n.autoStart.cursorElement=t?e:null;}function Zo(e,t){var n=e.interactable,r=e.element,o=e.prepared;if("mouse"===e.pointerType&&n&&n.options.styleCursor){var i="";if(o.name){var a=n.options[o.name].cursorChecker;i=Lo.is.func(a)?a(o,n,r,e._interacting):t.actions[o.name].getCursor(o);}Qo(e.element,i||"",t);}else t.autoStart.cursorElement&&Qo(t.autoStart.cursorElement,"",t);}var Jo={id:"auto-start/base",before:["actions","action/drag","actions/resize","actions/gesture"],install:function(t){var e=t.interact,n=t.defaults;t.usePlugin(qo.default),n.base.actionChecker=null,n.base.styleCursor=!0,Lo.extend(n.perAction,{manualStart:!1,max:1/0,maxPerElement:1,allowFrom:null,ignoreFrom:null,mouseButtons:1}),e.maxInteractions=function(e){return $o(e,t)},t.autoStart={maxInteractions:1/0,withinInteractionLimit:Ko,cursorElement:null};},listeners:{"interactions:down":function(e,t){var n=e.interaction,r=e.pointer,o=e.event,i=e.eventTarget;n.interacting()||Ho(n,Bo(n,r,o,i,t),t);},"interactions:move":function(e,t){var n,r,o,i,a,u;r=t,o=(n=e).interaction,i=n.pointer,a=n.event,u=n.eventTarget,"mouse"!==o.pointerType||o.pointerIsDown||o.interacting()||Ho(o,Bo(o,i,a,u,r),r),function(e,t){var n=e.interaction;if(n.pointerIsDown&&!n.interacting()&&n.pointerWasMoved&&n.prepared.name){t.fire("autoStart:before-start",e);var r=n.interactable,o=n.prepared.name;o&&r&&(r.options[o].manualStart||!Ko(r,n.element,n.prepared,t)?n.stop():(n.start(n.prepared,r,n.element),Zo(n,t)));}}(e,t);},"interactions:stop":function(e,t){var n=e.interaction,r=n.interactable;r&&r.options.styleCursor&&Qo(n.element,"",t);}},maxInteractions:$o,withinInteractionLimit:Ko,validateAction:Go};No.default=Jo;var ei={};function ti(e){return (ti="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(ei,"__esModule",{value:!0}),ei.default=void 0;var ni,ri=O({}),oi=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==ti(e)&&"function"!=typeof e)return {default:e};var t=ai();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(y),ii=(ni=No)&&ni.__esModule?ni:{default:ni};function ai(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return ai=function(){return e},e}var ui={id:"auto-start/dragAxis",listeners:{"autoStart:before-start":function(e,r){var o=e.interaction,i=e.eventTarget,t=e.dx,n=e.dy;if("drag"===o.prepared.name){var a=Math.abs(t),u=Math.abs(n),s=o.interactable.options.drag,l=s.startAxis,c=u<a?"x":a<u?"y":"xy";if(o.prepared.axis="start"===s.lockAxis?c[0]:s.lockAxis,"xy"!=c&&"xy"!==l&&l!==c){o.prepared.name=null;function f(e){if(e!==o.interactable){var t=o.interactable.options.drag;if(!t.manualStart&&e.testIgnoreAllow(t,p,i)){var n=e.getAction(o.downPointer,o.downEvent,o,p);if(n&&n.name===ri.ActionName.Drag&&function(e,t){if(!t)return !1;var n=t.options[ri.ActionName.Drag].startAxis;return "xy"===e||"xy"===n||n===e}(c,e)&&ii.default.validateAction(n,e,p,i,r))return e}}}for(var p=i;oi.element(p);){var d=r.interactables.forEachMatch(p,f);if(d){o.prepared.name=ri.ActionName.Drag,o.interactable=d,o.element=p;break}p=(0, C.parentNode)(p);}}}}}};ei.default=ui;var si={};Object.defineProperty(si,"__esModule",{value:!0}),si.default=void 0;var li,ci=(li=No)&&li.__esModule?li:{default:li};function fi(e){var t=e.prepared&&e.prepared.name;if(!t)return null;var n=e.interactable.options;return n[t].hold||n[t].delay}var pi={id:"auto-start/hold",install:function(e){var t=e.defaults;e.usePlugin(ci.default),t.perAction.hold=0,t.perAction.delay=0;},listeners:{"interactions:new":function(e){e.interaction.autoStartHoldTimer=null;},"autoStart:prepared":function(e){var t=e.interaction,n=fi(t);0<n&&(t.autoStartHoldTimer=setTimeout(function(){t.start(t.prepared,t.interactable,t.element);},n));},"interactions:move":function(e){var t=e.interaction,n=e.duplicate;t.pointerWasMoved&&!n&&clearTimeout(t.autoStartHoldTimer);},"autoStart:before-start":function(e){var t=e.interaction;0<fi(t)&&(t.prepared.name=null);}},getHoldDuration:fi};si.default=pi;var di={};Object.defineProperty(di,"__esModule",{value:!0}),di.install=function(e){e.usePlugin(vi.default),e.usePlugin(mi.default),e.usePlugin(yi.default);},Object.defineProperty(di,"autoStart",{enumerable:!0,get:function(){return vi.default}}),Object.defineProperty(di,"dragAxis",{enumerable:!0,get:function(){return yi.default}}),Object.defineProperty(di,"hold",{enumerable:!0,get:function(){return mi.default}}),di.id=void 0;var vi=gi(No),yi=gi(ei),mi=gi(si);function gi(e){return e&&e.__esModule?e:{default:e}}di.id="auto-start";var hi={};function bi(e){return (bi="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(hi,"__esModule",{value:!0}),hi.install=ji,hi.default=void 0;var Oi,wi=(Oi=De)&&Oi.__esModule?Oi:{default:Oi},Pi=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==bi(e)&&"function"!=typeof e)return {default:e};var t=_i();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(y);function _i(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return _i=function(){return e},e}function xi(e){return /^(always|never|auto)$/.test(e)?(this.options.preventDefault=e,this):Pi.bool(e)?(this.options.preventDefault=e?"always":"never",this):this.options.preventDefault}function Si(e){var t=e.interaction,n=e.event;t.interactable&&t.interactable.checkAndPreventDefault(n);}function ji(r){var e=r.Interactable;e.prototype.preventDefault=xi,e.prototype.checkAndPreventDefault=function(e){return function(e,t,n){var r=e.options.preventDefault;if("never"!==r)if("always"!==r){if(wi.default.supportsPassive&&/^touch(start|move)$/.test(n.type)){var o=(0, s.getWindow)(n.target).document,i=t.getDocOptions(o);if(!i||!i.events||!1!==i.events.passive)return}/^(mouse|pointer|touch)*(down|start)/i.test(n.type)||Pi.element(n.target)&&(0, C.matchesSelector)(n.target,"input,select,textarea,[contenteditable=true],[contenteditable=true] *")||n.preventDefault();}else n.preventDefault();}(this,r,e)},r.interactions.docEvents.push({type:"dragstart",listener:function(e){for(var t=0;t<r.interactions.list.length;t++){var n=r.interactions.list[t];if(n.element&&(n.element===e.target||(0, C.nodeContains)(n.element,e.target)))return void n.interactable.checkAndPreventDefault(e)}}});}var Mi={id:"core/interactablePreventDefault",install:ji,listeners:["down","move","up","cancel"].reduce(function(e,t){return e["interactions:".concat(t)]=Si,e},{})};hi.default=Mi;var Ei={};function ki(e){return (ki="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(Ei,"__esModule",{value:!0}),Ei.default=void 0;var Di,Ti,Ai=(function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==ki(e)&&"function"!=typeof e)return {default:e};var t=Ci();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(y));function Ci(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Ci=function(){return e},e}(Ti=Di=Di||{}).touchAction="touchAction",Ti.boxSizing="boxSizing",Ti.noListeners="noListeners";var Ni="dev-tools",Yi={id:Ni,install:function(){}};Ei.default=Yi;var Fi={};function Li(e){return (Li="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(Fi,"__esModule",{value:!0}),Fi.startAll=Ki,Fi.setAll=$i,Fi.prepareStates=Ji,Fi.setCoords=ea,Fi.restoreCoords=ta,Fi.shouldDo=na,Fi.getRectOffset=ra,Fi.makeModifier=function(e,r){function t(e){var t=e||{};for(var n in t.enabled=!1!==t.enabled,o)n in t||(t[n]=o[n]);return {options:t,methods:i,name:r}}var o=e.defaults,i={start:e.start,set:e.set,beforeEnd:e.beforeEnd,stop:e.stop};r&&"string"==typeof r&&(t._defaults=o,t._methods=i);return t},Fi.default=void 0;var qi,Vi=(qi=me)&&qi.__esModule?qi:{default:qi},Gi=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Li(e)&&"function"!=typeof e)return {default:e};var t=Ui();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(ge);function Ui(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Ui=function(){return e},e}function Bi(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if(!(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e)))return;var n=[],r=!0,o=!1,i=void 0;try{for(var a,u=e[Symbol.iterator]();!(r=(a=u.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){o=!0,i=e;}finally{try{r||null==u.return||u.return();}finally{if(o)throw i}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}function Hi(e,t,n,r){var o=e.interaction,i=e.phase,a=o.interactable,u=o.element,s=o.edges,l=Ji(function(e){var n=e.interactable.options[e.prepared.name],t=n.modifiers;if(t&&t.length)return t.filter(function(e){return !e.options||!1!==e.options.enabled});return ["snap","snapSize","snapEdges","restrict","restrictEdges","restrictSize"].map(function(e){var t=n[e];return t&&t.enabled&&{options:t,methods:t._methods}}).filter(function(e){return !!e})}(o)),c=(0, Vi.default)({},o.rect),f=ra(c,t);o.modifiers.startOffset=f,o.modifiers.startDelta={x:0,y:0};var p={interaction:o,interactable:a,element:u,pageCoords:t,phase:i,rect:c,edges:s,startOffset:f,states:l,preEnd:!1,requireEndOnly:!1,prevCoords:n,prevRect:r};return o.modifiers.states=l,o.modifiers.result=null,Ki(p),o.modifiers.result=$i(p)}function Ki(e){for(var t=e.states,n=0;n<t.length;n++){var r=t[n];r.methods.start&&(e.state=r).methods.start(e);}e.interaction.edges=e.edges;}function $i(e){var t=e.prevCoords,n=e.prevRect,r=e.phase,o=e.preEnd,i=e.requireEndOnly,a=e.states,u=e.rect;e.coords=(0, Vi.default)({},e.pageCoords),e.rect=(0, Vi.default)({},u);for(var s={delta:{x:0,y:0},rectDelta:{left:0,right:0,top:0,bottom:0},coords:e.coords,rect:e.rect,eventProps:[],changed:!0},l=e.edges||{left:!0,right:!0,top:!0,bottom:!0},c=0;c<a.length;c++){var f=a[c],p=f.options,d=(0, Vi.default)({},e.coords),v=null;f.methods.set&&na(p,o,i,r)&&(v=(e.state=f).methods.set(e),Gi.addEdges(l,e.rect,{x:e.coords.x-d.x,y:e.coords.y-d.y})),s.eventProps.push(v);}s.delta.x=e.coords.x-e.pageCoords.x,s.delta.y=e.coords.y-e.pageCoords.y,s.rectDelta.left=e.rect.left-u.left,s.rectDelta.right=e.rect.right-u.right,s.rectDelta.top=e.rect.top-u.top,s.rectDelta.bottom=e.rect.bottom-u.bottom;var y=!n||s.rect.left!==n.left||s.rect.right!==n.right||s.rect.top!==n.top||s.rect.bottom!==n.bottom;return s.changed=!t||t.x!==s.coords.x||t.y!==s.coords.y||y,s}function Qi(e){var t=e.interaction,n=e.phase,r=e.preEnd,o=e.skipModifiers,i=t.interactable,a=t.element,u=o?t.modifiers.states.slice(o):t.modifiers.states,s=e.prevCoords||(t.modifiers.result?t.modifiers.result.coords:null),l=e.prevRect||(t.modifiers.result?t.modifiers.result.rect:null),c=$i({interaction:t,interactable:i,element:a,preEnd:r,phase:n,pageCoords:e.modifiedCoords||t.coords.cur.page,prevCoords:s,rect:t.rect,edges:t.edges,prevRect:l,states:u,requireEndOnly:!1});if(!(t.modifiers.result=c).changed&&t.interacting())return !1;if(e.modifiedCoords){var f=t.coords.cur.page,p=e.modifiedCoords.x-f.x,d=e.modifiedCoords.y-f.y;c.coords.x+=p,c.coords.y+=d,c.delta.x+=p,c.delta.y+=d;}ea(e);}function Zi(e){var t=e.interaction,n=t.modifiers.states;if(n&&n.length){for(var r=(0, Vi.default)({states:n,interactable:t.interactable,element:t.element,rect:null},e),o=0;o<n.length;o++){var i=n[o];(r.state=i).methods.stop&&i.methods.stop(r);}e.interaction.modifiers.states=null,e.interaction.modifiers.endResult=null;}}function Ji(e){for(var t=[],n=0;n<e.length;n++){var r=e[n],o=r.options,i=r.methods,a=r.name;o&&!1===o.enabled||t.push({options:o,methods:i,index:n,name:a});}return t}function ea(e){var t=e.interaction,n=e.phase,r=t.coords.cur,o=t.coords.start,i=t.modifiers,a=i.result,u=i.startDelta,s=a.delta;"start"===n&&(0, Vi.default)(t.modifiers.startDelta,a.delta);for(var l=0;l<[[o,u],[r,s]].length;l++){var c=Bi([[o,u],[r,s]][l],2),f=c[0],p=c[1];f.page.x+=p.x,f.page.y+=p.y,f.client.x+=p.x,f.client.y+=p.y;}var d=t.modifiers.result.rectDelta,v=e.rect||t.rect;v.left+=d.left,v.right+=d.right,v.top+=d.top,v.bottom+=d.bottom,v.width=v.right-v.left,v.height=v.bottom-v.top;}function ta(e){var t=e.interaction,n=t.coords,r=t.rect,o=t.modifiers;if(o.result){for(var i=o.startDelta,a=o.result,u=a.delta,s=a.rectDelta,l=[[n.start,i],[n.cur,u]],c=0;c<l.length;c++){var f=Bi(l[c],2),p=f[0],d=f[1];p.page.x-=d.x,p.page.y-=d.y,p.client.x-=d.x,p.client.y-=d.y;}r.left-=s.left,r.right-=s.right,r.top-=s.top,r.bottom-=s.bottom;}}function na(e,t,n,r){return e?!1!==e.enabled&&(t||!e.endOnly)&&(!n||e.endOnly||e.alwaysOnEnd)&&(e.setStart||"start"!==r):!n}function ra(e,t){return e?{left:t.x-e.left,top:t.y-e.top,right:e.right-t.x,bottom:e.bottom-t.y}:{left:0,top:0,right:0,bottom:0}}function oa(e){var t=e.iEvent,n=e.interaction.modifiers.result;n&&(t.modifiers=n.eventProps);}var ia={id:"modifiers/base",install:function(e){e.defaults.perAction.modifiers=[];},listeners:{"interactions:new":function(e){e.interaction.modifiers={startOffset:{left:0,right:0,top:0,bottom:0},states:null,result:null,endResult:null,startDelta:null};},"interactions:before-action-start":function(e){Hi(e,e.interaction.coords.start.page,null,null),ea(e);},"interactions:after-action-start":ta,"interactions:before-action-move":Qi,"interactions:after-action-move":ta,"interactions:action-resume":function(e){var t=e.interaction.modifiers.result,n=t.coords,r=t.rect;Zi(e),Hi(e,e.interaction.coords.cur.page,n,r),Qi(e);},"interactions:before-action-end":function(e){var t=e.interaction,n=e.event,r=e.noPreEnd,o=t.modifiers.states;if(!r&&o&&o.length)for(var i=!1,a=0;a<o.length;a++){var u=o[a],s=(e.state=u).options,l=u.methods,c=l.beforeEnd&&l.beforeEnd(e);if(c)return t.modifiers.endResult=c,!1;!i&&na(s,!0,!0)&&(t.move({event:n,preEnd:!0}),i=!0);}},"interactions:action-start":oa,"interactions:action-move":oa,"interactions:action-end":oa,"interactions:stop":Zi},before:["actions","action/drag","actions/resize","actions/gesture"]};Fi.default=ia;var aa={};function ua(e){return (ua="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(aa,"__esModule",{value:!0}),aa.default=void 0;var sa,la=da(Fi),ca=da(pt),fa=(sa=ut)&&sa.__esModule?sa:{default:sa};function pa(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return pa=function(){return e},e}function da(e){if(e&&e.__esModule)return e;if(null===e||"object"!==ua(e)&&"function"!=typeof e)return {default:e};var t=pa();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}function va(e,t){var n=ha(e),r=n.resistance,o=-Math.log(n.endSpeed/t.v0)/r;t.x0=e.prevEvent.page.x,t.y0=e.prevEvent.page.y,t.t0=t.startEvent.timeStamp/1e3,t.sx=t.sy=0,t.modifiedXe=t.xe=(t.vx0-o)/r,t.modifiedYe=t.ye=(t.vy0-o)/r,t.te=o,t.lambda_v0=r/t.v0,t.one_ve_v0=1-n.endSpeed/t.v0;}function ya(e){ga(e),ca.pointer.setCoordDeltas(e.coords.delta,e.coords.prev,e.coords.cur),ca.pointer.setCoordVelocity(e.coords.velocity,e.coords.delta);var t=e.inertia,n=ha(e).resistance,r=e._now()/1e3-t.t0;if(r<t.te){var o=1-(Math.exp(-n*r)-t.lambda_v0)/t.one_ve_v0;if(t.modifiedXe===t.xe&&t.modifiedYe===t.ye)t.sx=t.xe*o,t.sy=t.ye*o;else{var i=ca.getQuadraticCurvePoint(0,0,t.xe,t.ye,t.modifiedXe,t.modifiedYe,o);t.sx=i.x,t.sy=i.y;}e.move({event:t.startEvent}),t.timeout=fa.default.request(function(){return ya(e)});}else t.sx=t.modifiedXe,t.sy=t.modifiedYe,e.move({event:t.startEvent}),e.end(t.startEvent),t.active=!1,e.simulation=null;ca.pointer.copyCoords(e.coords.prev,e.coords.cur);}function ma(e){ga(e);var t=e.inertia,n=e._now()-t.t0,r=ha(e).smoothEndDuration;n<r?(t.sx=ca.easeOutQuad(n,0,t.xe,r),t.sy=ca.easeOutQuad(n,0,t.ye,r),e.move({event:t.startEvent}),t.timeout=fa.default.request(function(){return ma(e)})):(t.sx=t.xe,t.sy=t.ye,e.move({event:t.startEvent}),e.end(t.startEvent),t.smoothEnd=t.active=!1,e.simulation=null);}function ga(e){var t=e.inertia;if(t.active){var n=t.upCoords.page,r=t.upCoords.client;ca.pointer.setCoords(e.coords.cur,[{pageX:n.x+t.sx,pageY:n.y+t.sy,clientX:r.x+t.sx,clientY:r.y+t.sy}],e._now());}}function ha(e){var t=e.interactable,n=e.prepared;return t&&t.options&&n.name&&t.options[n.name].inertia}Tn.EventPhase.Resume="resume",Tn.EventPhase.InertiaStart="inertiastart";var ba={id:"inertia",install:function(e){var t=e.defaults;e.usePlugin(la.default),t.perAction.inertia={enabled:!1,resistance:10,minSpeed:100,endSpeed:10,allowResume:!0,smoothEndDuration:300};},listeners:{"interactions:new":function(e){e.interaction.inertia={active:!1,smoothEnd:!1,allowResume:!1,upCoords:{},timeout:null};},"interactions:before-action-end":function(e,t){var n=e.interaction,r=e.event,o=e.noPreEnd,i=n.inertia;if(!n.interacting()||n.simulation&&n.simulation.active||o)return null;var a,u=ha(n),s=n._now(),l=n.coords.velocity.client,c=ca.hypot(l.x,l.y),f=!1,p=u&&u.enabled&&"gesture"!==n.prepared.name&&r!==i.startEvent,d=p&&s-n.coords.cur.timeStamp<50&&c>u.minSpeed&&c>u.endSpeed,v={interaction:n,interactable:n.interactable,element:n.element,rect:n.rect,edges:n.edges,pageCoords:n.coords.cur.page,states:p&&n.modifiers.states.map(function(e){return ca.extend({},e)}),preEnd:!0,prevCoords:null,prevRect:null,requireEndOnly:null,phase:Tn.EventPhase.InertiaStart};return p&&!d&&(v.prevCoords=n.modifiers.result.coords,v.prevRect=n.modifiers.result.rect,v.requireEndOnly=!1,f=(a=la.setAll(v)).changed),d||f?(ca.pointer.copyCoords(i.upCoords,n.coords.cur),la.setCoords(v),n.pointers[0].pointer=i.startEvent=new t.InteractEvent(n,r,n.prepared.name,Tn.EventPhase.InertiaStart,n.element),la.restoreCoords(v),i.t0=s,i.active=!0,i.allowResume=u.allowResume,n.simulation=i,n.interactable.fire(i.startEvent),d?(i.vx0=n.coords.velocity.client.x,i.vy0=n.coords.velocity.client.y,i.v0=c,va(n,i),ca.extend(v.pageCoords,n.coords.cur.page),v.pageCoords.x+=i.xe,v.pageCoords.y+=i.ye,v.prevCoords=null,v.prevRect=null,v.requireEndOnly=!0,a=la.setAll(v),i.modifiedXe+=a.delta.x,i.modifiedYe+=a.delta.y,i.timeout=fa.default.request(function(){return ya(n)})):(i.smoothEnd=!0,i.xe=a.delta.x,i.ye=a.delta.y,i.sx=i.sy=0,i.timeout=fa.default.request(function(){return ma(n)})),!1):null},"interactions:down":function(e,t){var n=e.interaction,r=e.event,o=e.pointer,i=e.eventTarget,a=n.inertia;if(a.active)for(var u=i;ca.is.element(u);){if(u===n.element){fa.default.cancel(a.timeout),a.active=!1,n.simulation=null,n.updatePointer(o,r,i,!0),ca.pointer.setCoords(n.coords.cur,n.pointers.map(function(e){return e.pointer}),n._now());var s={interaction:n,phase:Tn.EventPhase.Resume};t.fire("interactions:action-resume",s);var l=new t.InteractEvent(n,r,n.prepared.name,Tn.EventPhase.Resume,n.element);n._fireEvent(l),ca.pointer.copyCoords(n.coords.prev,n.coords.cur);break}u=ca.dom.parentNode(u);}},"interactions:stop":function(e){var t=e.interaction,n=t.inertia;n.active&&(fa.default.cancel(n.timeout),n.active=!1,t.simulation=null);}},before:["modifiers/base"],calcInertia:va,inertiaTick:ya,smothEndTick:ma,updateInertiaCoords:ga};aa.default=ba;var Oa={};Object.defineProperty(Oa,"__esModule",{value:!0}),Oa.default=void 0;var wa,Pa=(wa=me)&&wa.__esModule?wa:{default:wa};function _a(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter(function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable})),n.push.apply(n,r);}return n}function xa(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?_a(Object(n),!0).forEach(function(e){Sa(t,e,n[e]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):_a(Object(n)).forEach(function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e));});}return t}function Sa(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function ja(e,t,n){var r=e.startCoords,o=e.edgeSign;t?n.y=r.y+(n.x-r.x)*o:n.x=r.x+(n.y-r.y)*o;}function Ma(e,t,n,r){var o=e.startRect,i=e.startCoords,a=e.ratio,u=e.edgeSign;if(t){var s=r.width/a;n.y=i.y+(s-o.height)*u;}else{var l=r.height*a;n.x=i.x+(l-o.width)*u;}}var Ea={start:function(e){var t=e.state,n=e.rect,r=e.edges,o=e.pageCoords,i=t.options.ratio,a=t.options,u=a.equalDelta,s=a.modifiers;"preserve"===i&&(i=n.width/n.height),t.startCoords=(0, Pa.default)({},o),t.startRect=(0, Pa.default)({},n),t.ratio=i,t.equalDelta=u;var l=t.linkedEdges={top:r.top||r.left&&!r.bottom,left:r.left||r.top&&!r.right,bottom:r.bottom||r.right&&!r.top,right:r.right||r.bottom&&!r.left};if(t.xIsPrimaryAxis=!(!r.left&&!r.right),t.equalDelta)t.edgeSign=(l.left?1:-1)*(l.top?1:-1);else{var c=t.xIsPrimaryAxis?l.top:l.left;t.edgeSign=c?-1:1;}if((0, Pa.default)(e.edges,l),s&&s.length)return t.subStates=(0, Fi.prepareStates)(s).map(function(e){return e.options=xa({},e.options),e}),(0, Fi.startAll)(xa({},e,{states:t.subStates}))},set:function(e){var t=e.state,n=e.rect,r=e.coords,o=(0, Pa.default)({},r),i=t.equalDelta?ja:Ma;if(i(t,t.xIsPrimaryAxis,r,n),!t.subStates)return null;var a=(0, Pa.default)({},n);(0, ge.addEdges)(t.linkedEdges,a,{x:r.x-o.x,y:r.y-o.y});var u=(0, Fi.setAll)(xa({},e,{rect:a,edges:t.linkedEdges,pageCoords:r,states:t.subStates,prevCoords:r,prevRect:a})),s=u.delta;u.changed&&(i(t,Math.abs(s.x)>Math.abs(s.y),u.coords,u.rect),(0, Pa.default)(r,u.coords));return u.eventProps},defaults:{ratio:"preserve",equalDelta:!1,modifiers:[],enabled:!1}};Oa.default=Ea;var ka={};function Da(e){return (Da="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(ka,"__esModule",{value:!0}),ka.getRestrictionRect=Wa,ka.default=void 0;var Ta,Ia=(Ta=me)&&Ta.__esModule?Ta:{default:Ta},Aa=Ra(y),za=Ra(ge);function Ca(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Ca=function(){return e},e}function Ra(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Da(e)&&"function"!=typeof e)return {default:e};var t=Ca();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}function Wa(e,t,n){return Aa.func(e)?za.resolveRectLike(e,t.interactable,t.element,[n.x,n.y,t]):za.resolveRectLike(e,t.interactable,t.element)}var Xa={start:function(e){var t=e.rect,n=e.startOffset,r=e.state,o=e.interaction,i=e.pageCoords,a=r.options,u=a.elementRect,s=(0, Ia.default)({left:0,top:0,right:0,bottom:0},a.offset||{});if(t&&u){var l=Wa(a.restriction,o,i);if(l){var c=l.right-l.left-t.width,f=l.bottom-l.top-t.height;c<0&&(s.left+=c,s.right+=c),f<0&&(s.top+=f,s.bottom+=f);}s.left+=n.left-t.width*u.left,s.top+=n.top-t.height*u.top,s.right+=n.right-t.width*(1-u.right),s.bottom+=n.bottom-t.height*(1-u.bottom);}r.offset=s;},set:function(e){var t=e.coords,n=e.interaction,r=e.state,o=r.options,i=r.offset,a=Wa(o.restriction,n,t);if(a){var u=za.xywhToTlbr(a);t.x=Math.max(Math.min(u.right-i.right,t.x),u.left+i.left),t.y=Math.max(Math.min(u.bottom-i.bottom,t.y),u.top+i.top);}},defaults:{restriction:null,elementRect:null,offset:null,endOnly:!1,enabled:!1}};ka.default=Xa;var Na={};function Ya(e){return (Ya="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(Na,"__esModule",{value:!0}),Na.default=void 0;var Fa,La=(Fa=me)&&Fa.__esModule?Fa:{default:Fa},qa=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Ya(e)&&"function"!=typeof e)return {default:e};var t=Va();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(ge);function Va(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Va=function(){return e},e}var Ga={top:1/0,left:1/0,bottom:-1/0,right:-1/0},Ua={top:-1/0,left:-1/0,bottom:1/0,right:1/0};function Ba(e,t){for(var n=["top","left","bottom","right"],r=0;r<n.length;r++){var o=n[r];o in e||(e[o]=t[o]);}return e}var Ha={noInner:Ga,noOuter:Ua,start:function(e){var t,n=e.interaction,r=e.startOffset,o=e.state,i=o.options;if(i){var a=(0, ka.getRestrictionRect)(i.offset,n,n.coords.start.page);t=qa.rectToXY(a);}t=t||{x:0,y:0},o.offset={top:t.y+r.top,left:t.x+r.left,bottom:t.y-r.bottom,right:t.x-r.right};},set:function(e){var t=e.coords,n=e.edges,r=e.interaction,o=e.state,i=o.offset,a=o.options;if(n){var u=(0, La.default)({},t),s=(0, ka.getRestrictionRect)(a.inner,r,u)||{},l=(0, ka.getRestrictionRect)(a.outer,r,u)||{};Ba(s,Ga),Ba(l,Ua),n.top?t.y=Math.min(Math.max(l.top+i.top,u.y),s.top+i.top):n.bottom&&(t.y=Math.max(Math.min(l.bottom+i.bottom,u.y),s.bottom+i.bottom)),n.left?t.x=Math.min(Math.max(l.left+i.left,u.x),s.left+i.left):n.right&&(t.x=Math.max(Math.min(l.right+i.right,u.x),s.right+i.right));}},defaults:{inner:null,outer:null,offset:null,endOnly:!1,enabled:!1}};Na.default=Ha;var Ka={};Object.defineProperty(Ka,"__esModule",{value:!0}),Ka.default=void 0;var $a=Za(me),Qa=Za(ka);function Za(e){return e&&e.__esModule?e:{default:e}}var Ja=(0, $a.default)({get elementRect(){return {top:0,left:0,bottom:1,right:1}},set elementRect(e){}},Qa.default.defaults),eu={start:Qa.default.start,set:Qa.default.set,defaults:Ja};Ka.default=eu;var tu={};function nu(e){return (nu="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(tu,"__esModule",{value:!0}),tu.default=void 0;var ru=uu(me),ou=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==nu(e)&&"function"!=typeof e)return {default:e};var t=au();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(ge),iu=uu(Na);function au(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return au=function(){return e},e}function uu(e){return e&&e.__esModule?e:{default:e}}var su={width:-1/0,height:-1/0},lu={width:1/0,height:1/0};var cu={start:function(e){return iu.default.start(e)},set:function(e){var t=e.interaction,n=e.state,r=e.rect,o=e.edges,i=n.options;if(o){var a=ou.tlbrToXywh((0, ka.getRestrictionRect)(i.min,t,e.coords))||su,u=ou.tlbrToXywh((0, ka.getRestrictionRect)(i.max,t,e.coords))||lu;n.options={endOnly:i.endOnly,inner:(0, ru.default)({},iu.default.noInner),outer:(0, ru.default)({},iu.default.noOuter)},o.top?(n.options.inner.top=r.bottom-a.height,n.options.outer.top=r.bottom-u.height):o.bottom&&(n.options.inner.bottom=r.top+a.height,n.options.outer.bottom=r.top+u.height),o.left?(n.options.inner.left=r.right-a.width,n.options.outer.left=r.right-u.width):o.right&&(n.options.inner.right=r.left+a.width,n.options.outer.right=r.left+u.width),iu.default.set(e),n.options=i;}},defaults:{min:null,max:null,endOnly:!1,enabled:!1}};tu.default=cu;var fu={};function pu(e){return (pu="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(fu,"__esModule",{value:!0}),fu.default=void 0;var du=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==pu(e)&&"function"!=typeof e)return {default:e};var t=vu();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(pt);function vu(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return vu=function(){return e},e}var yu={start:function(e){var t,n,r,o=e.interaction,i=e.interactable,a=e.element,u=e.rect,s=e.state,l=e.startOffset,c=s.options,f=c.offsetWithOrigin?(n=(t=e).interaction.element,du.rect.rectToXY(du.rect.resolveRectLike(t.state.options.origin,null,null,[n]))||du.getOriginXY(t.interactable,n,t.interaction.prepared.name)):{x:0,y:0};if("startCoords"===c.offset)r={x:o.coords.start.page.x,y:o.coords.start.page.y};else{var p=du.rect.resolveRectLike(c.offset,i,a,[o]);(r=du.rect.rectToXY(p)||{x:0,y:0}).x+=f.x,r.y+=f.y;}var d=c.relativePoints;s.offsets=u&&d&&d.length?d.map(function(e,t){return {index:t,relativePoint:e,x:l.left-u.width*e.x+r.x,y:l.top-u.height*e.y+r.y}}):[du.extend({index:0,relativePoint:null},r)];},set:function(e){var t=e.interaction,n=e.coords,r=e.state,o=r.options,i=r.offsets,a=du.getOriginXY(t.interactable,t.element,t.prepared.name),u=du.extend({},n),s=[];o.offsetWithOrigin||(u.x-=a.x,u.y-=a.y);for(var l=0;l<i.length;l++)for(var c=i[l],f=u.x-c.x,p=u.y-c.y,d=0,v=o.targets.length;d<v;d++){var y=o.targets[d],m=void 0;(m=du.is.func(y)?y(f,p,t,c,d):y)&&s.push({x:(du.is.number(m.x)?m.x:f)+c.x,y:(du.is.number(m.y)?m.y:p)+c.y,range:du.is.number(m.range)?m.range:o.range,source:y,index:d,offset:c});}for(var g={target:null,inRange:!1,distance:0,range:0,delta:{x:0,y:0}},h=0;h<s.length;h++){var b=s[h],O=b.range,w=b.x-u.x,P=b.y-u.y,_=du.hypot(w,P),x=_<=O;O===1/0&&g.inRange&&g.range!==1/0&&(x=!1),g.target&&!(x?g.inRange&&O!==1/0?_/O<g.distance/g.range:O===1/0&&g.range!==1/0||_<g.distance:!g.inRange&&_<g.distance)||(g.target=b,g.distance=_,g.range=O,g.inRange=x,g.delta.x=w,g.delta.y=P);}return g.inRange&&(n.x=g.target.x,n.y=g.target.y),r.closest=g},defaults:{range:1/0,targets:null,offset:null,offsetWithOrigin:!0,origin:null,relativePoints:null,endOnly:!1,enabled:!1}};fu.default=yu;var mu={};function gu(e){return (gu="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(mu,"__esModule",{value:!0}),mu.default=void 0;var hu=Pu(me),bu=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==gu(e)&&"function"!=typeof e)return {default:e};var t=wu();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(y),Ou=Pu(fu);function wu(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return wu=function(){return e},e}function Pu(e){return e&&e.__esModule?e:{default:e}}function _u(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if(!(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e)))return;var n=[],r=!0,o=!1,i=void 0;try{for(var a,u=e[Symbol.iterator]();!(r=(a=u.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){o=!0,i=e;}finally{try{r||null==u.return||u.return();}finally{if(o)throw i}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}var xu={start:function(e){var t=e.state,n=e.edges,r=t.options;if(!n)return null;e.state={options:{targets:null,relativePoints:[{x:n.left?0:1,y:n.top?0:1}],offset:r.offset||"self",origin:{x:0,y:0},range:r.range}},t.targetFields=t.targetFields||[["width","height"],["x","y"]],Ou.default.start(e),t.offsets=e.state.offsets,e.state=t;},set:function(e){var t=e.interaction,n=e.state,r=e.coords,o=n.options,i=n.offsets,a={x:r.x-i[0].x,y:r.y-i[0].y};n.options=(0, hu.default)({},o),n.options.targets=[];for(var u=0;u<(o.targets||[]).length;u++){var s=(o.targets||[])[u],l=void 0;if(l=bu.func(s)?s(a.x,a.y,t):s){for(var c=0;c<n.targetFields.length;c++){var f=_u(n.targetFields[c],2),p=f[0],d=f[1];if(p in l||d in l){l.x=l[p],l.y=l[d];break}}n.options.targets.push(l);}}var v=Ou.default.set(e);return n.options=o,v},defaults:{range:1/0,targets:null,offset:null,endOnly:!1,enabled:!1}};mu.default=xu;var Su={};Object.defineProperty(Su,"__esModule",{value:!0}),Su.default=void 0;var ju=ku(xe),Mu=ku(me),Eu=ku(mu);function ku(e){return e&&e.__esModule?e:{default:e}}var Du={start:function(e){var t=e.edges;return t?(e.state.targetFields=e.state.targetFields||[[t.left?"left":"right",t.top?"top":"bottom"]],Eu.default.start(e)):null},set:Eu.default.set,defaults:(0, Mu.default)((0, ju.default)(Eu.default.defaults),{offset:{x:0,y:0}})};Su.default=Du;var Tu={};Object.defineProperty(Tu,"__esModule",{value:!0}),Tu.aspectRatio=Tu.restrictSize=Tu.restrictEdges=Tu.restrictRect=Tu.restrict=Tu.snapEdges=Tu.snapSize=Tu.snap=void 0;var Iu=Yu(Oa),Au=Yu(Na),zu=Yu(ka),Cu=Yu(Ka),Ru=Yu(tu),Wu=Yu(Su),Xu=Yu(fu),Nu=Yu(mu);function Yu(e){return e&&e.__esModule?e:{default:e}}var Fu=(0, Fi.makeModifier)(Xu.default,"snap");Tu.snap=Fu;var Lu=(0, Fi.makeModifier)(Nu.default,"snapSize");Tu.snapSize=Lu;var qu=(0, Fi.makeModifier)(Wu.default,"snapEdges");Tu.snapEdges=qu;var Vu=(0, Fi.makeModifier)(zu.default,"restrict");Tu.restrict=Vu;var Gu=(0, Fi.makeModifier)(Cu.default,"restrictRect");Tu.restrictRect=Gu;var Uu=(0, Fi.makeModifier)(Au.default,"restrictEdges");Tu.restrictEdges=Uu;var Bu=(0, Fi.makeModifier)(Ru.default,"restrictSize");Tu.restrictSize=Bu;var Hu=(0, Fi.makeModifier)(Iu.default,"aspectRatio");Tu.aspectRatio=Hu;var Ku={};Object.defineProperty(Ku,"__esModule",{value:!0}),Ku.PointerEvent=Ku.default=void 0;var $u,Qu=($u=Sn)&&$u.__esModule?$u:{default:$u},Zu=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==es(e)&&"function"!=typeof e)return {default:e};var t=Ju();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(J);function Ju(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Ju=function(){return e},e}function es(e){return (es="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function ts(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function ns(e){return (ns=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function rs(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function os(e,t){return (os=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function is(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var as=function(){function f(e,t,n,r,o,i){var a,u,s;if(!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,f),u=this,a=!(s=ns(f).call(this,o))||"object"!==es(s)&&"function"!=typeof s?rs(u):s,is(rs(a),"type",void 0),is(rs(a),"originalEvent",void 0),is(rs(a),"pointerId",void 0),is(rs(a),"pointerType",void 0),is(rs(a),"double",void 0),is(rs(a),"pageX",void 0),is(rs(a),"pageY",void 0),is(rs(a),"clientX",void 0),is(rs(a),"clientY",void 0),is(rs(a),"dt",void 0),is(rs(a),"eventable",void 0),Zu.pointerExtend(rs(a),n),n!==t&&Zu.pointerExtend(rs(a),t),a.timeStamp=i,a.originalEvent=n,a.type=e,a.pointerId=Zu.getPointerId(t),a.pointerType=Zu.getPointerType(t),a.target=r,a.currentTarget=null,"tap"===e){var l=o.getPointerIndex(t);a.dt=a.timeStamp-o.pointers[l].downTime;var c=a.timeStamp-o.tapTime;a.double=!!(o.prevTap&&"doubletap"!==o.prevTap.type&&o.prevTap.target===a.target&&c<500);}else"doubletap"===e&&(a.dt=t.timeStamp-o.tapTime);return a}var e,t;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&os(e,t);}(f,Qu["default"]),e=f,(t=[{key:"_subtractOrigin",value:function(e){var t=e.x,n=e.y;return this.pageX-=t,this.pageY-=n,this.clientX-=t,this.clientY-=n,this}},{key:"_addOrigin",value:function(e){var t=e.x,n=e.y;return this.pageX+=t,this.pageY+=n,this.clientX+=t,this.clientY+=n,this}},{key:"preventDefault",value:function(){this.originalEvent.preventDefault();}}])&&ts(e.prototype,t),f}();Ku.PointerEvent=Ku.default=as;var us={};function ss(e){return (ss="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(us,"__esModule",{value:!0}),us.default=void 0;ps(g({})),O({});var ls=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==ss(e)&&"function"!=typeof e)return {default:e};var t=fs();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(pt),cs=ps(Ku);function fs(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return fs=function(){return e},e}function ps(e){return e&&e.__esModule?e:{default:e}}var ds={id:"pointer-events/base",install:function(e){e.pointerEvents=ds,e.defaults.actions.pointerEvents=ds.defaults;},listeners:{"interactions:new":function(e){var t=e.interaction;t.prevTap=null,t.tapTime=0;},"interactions:update-pointer":function(e){var t=e.down,n=e.pointerInfo;if(!t&&n.hold)return;n.hold={duration:1/0,timeout:null};},"interactions:move":function(e,t){var n=e.interaction,r=e.pointer,o=e.event,i=e.eventTarget,a=e.duplicate,u=n.getPointerIndex(r);a||n.pointerIsDown&&!n.pointerWasMoved||(n.pointerIsDown&&clearTimeout(n.pointers[u].hold.timeout),vs({interaction:n,pointer:r,event:o,eventTarget:i,type:"move"},t));},"interactions:down":function(e,t){!function(e,t){for(var n=e.interaction,r=e.pointer,o=e.event,i=e.eventTarget,a=e.pointerIndex,u=n.pointers[a].hold,s=ls.dom.getPath(i),l={interaction:n,pointer:r,event:o,eventTarget:i,type:"hold",targets:[],path:s,node:null},c=0;c<s.length;c++){var f=s[c];l.node=f,t.fire("pointerEvents:collect-targets",l);}if(!l.targets.length)return;for(var p=1/0,d=0;d<l.targets.length;d++){var v=l.targets[d].eventable.options.holdDuration;v<p&&(p=v);}u.duration=p,u.timeout=setTimeout(function(){vs({interaction:n,eventTarget:i,pointer:r,event:o,type:"hold"},t);},p);}(e,t),vs(e,t);},"interactions:up":function(e,t){var n,r,o,i,a,u;ms(e),vs(e,t),r=t,o=(n=e).interaction,i=n.pointer,a=n.event,u=n.eventTarget,o.pointerWasMoved||vs({interaction:o,eventTarget:u,pointer:i,event:a,type:"tap"},r);},"interactions:cancel":function(e,t){ms(e),vs(e,t);}},PointerEvent:cs.default,fire:vs,collectEventTargets:ys,defaults:{holdDuration:600,ignoreFrom:null,allowFrom:null,origin:{x:0,y:0}},types:["down","move","up","cancel","tap","doubletap","hold"]};function vs(e,t){var n=e.interaction,r=e.pointer,o=e.event,i=e.eventTarget,a=e.type,u=e.targets,s=void 0===u?ys(e,t):u,l=new cs.default(a,r,o,i,n,t.now());t.fire("pointerEvents:new",{pointerEvent:l});for(var c={interaction:n,pointer:r,event:o,eventTarget:i,targets:s,type:a,pointerEvent:l},f=0;f<s.length;f++){var p=s[f];for(var d in p.props||{})l[d]=p.props[d];var v=ls.getOriginXY(p.eventable,p.node);if(l._subtractOrigin(v),l.eventable=p.eventable,l.currentTarget=p.node,p.eventable.fire(l),l._addOrigin(v),l.immediatePropagationStopped||l.propagationStopped&&f+1<s.length&&s[f+1].node!==l.currentTarget)break}if(t.fire("pointerEvents:fired",c),"tap"===a){var y=l.double?vs({interaction:n,pointer:r,event:o,eventTarget:i,type:"doubletap"},t):l;n.prevTap=y,n.tapTime=y.timeStamp;}return l}function ys(e,t){var n=e.interaction,r=e.pointer,o=e.event,i=e.eventTarget,a=e.type,u=n.getPointerIndex(r),s=n.pointers[u];if("tap"===a&&(n.pointerWasMoved||!s||s.downTarget!==i))return [];for(var l=ls.dom.getPath(i),c={interaction:n,pointer:r,event:o,eventTarget:i,type:a,path:l,targets:[],node:null},f=0;f<l.length;f++){var p=l[f];c.node=p,t.fire("pointerEvents:collect-targets",c);}return "hold"===a&&(c.targets=c.targets.filter(function(e){return e.eventable.options.holdDuration===n.pointers[u].hold.duration})),c.targets}function ms(e){var t=e.interaction,n=e.pointerIndex;t.pointers[n].hold&&clearTimeout(t.pointers[n].hold.timeout);}var gs=ds;us.default=gs;var hs={};Object.defineProperty(hs,"__esModule",{value:!0}),hs.default=void 0;var bs=Os(us);function Os(e){return e&&e.__esModule?e:{default:e}}function ws(e){var t=e.interaction;t.holdIntervalHandle&&(clearInterval(t.holdIntervalHandle),t.holdIntervalHandle=null);}var Ps={id:"pointer-events/holdRepeat",install:function(e){e.usePlugin(bs.default);var t=e.pointerEvents;t.defaults.holdRepeatInterval=0,t.types.push("holdrepeat");},listeners:["move","up","cancel","endall"].reduce(function(e,t){return e["pointerEvents:".concat(t)]=ws,e},{"pointerEvents:new":function(e){var t=e.pointerEvent;"hold"===t.type&&(t.count=(t.count||0)+1);},"pointerEvents:fired":function(e,t){var n=e.interaction,r=e.pointerEvent,o=e.eventTarget,i=e.targets;if("hold"===r.type&&i.length){var a=i[0].eventable.options.holdRepeatInterval;a<=0||(n.holdIntervalHandle=setTimeout(function(){t.pointerEvents.fire({interaction:n,eventTarget:o,type:"hold",pointer:r,event:r},t);},a));}}})};hs.default=Ps;var _s={};Object.defineProperty(_s,"__esModule",{value:!0}),_s.default=void 0;var xs,Ss=(xs=me)&&xs.__esModule?xs:{default:xs};function js(e){return (0, Ss.default)(this.events.options,e),this}var Ms={id:"pointer-events/interactableTargets",install:function(e){var t=e.pointerEvents,n=e.actions,r=e.Interactable;(0, u.merge)(n.eventTypes,t.types),r.prototype.pointerEvents=js;var o=r.prototype._backCompatOption;r.prototype._backCompatOption=function(e,t){var n=o.call(this,e,t);return n===this&&(this.events.options[e]=t),n};},listeners:{"pointerEvents:collect-targets":function(e,t){var r=e.targets,o=e.node,i=e.type,a=e.eventTarget;t.interactables.forEachMatch(o,function(e){var t=e.events,n=t.options;t.types[i]&&t.types[i].length&&e.testIgnoreAllow(n,o,a)&&r.push({node:o,eventable:t,props:{interactable:e}});});},"interactable:new":function(e){var t=e.interactable;t.events.getRect=function(e){return t.getRect(e)};},"interactable:set":function(e,t){var n=e.interactable,r=e.options;(0, Ss.default)(n.events.options,t.pointerEvents.defaults),(0, Ss.default)(n.events.options,r.pointerEvents||{});}}};_s.default=Ms;var Es={};function ks(e){return (ks="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(Es,"__esModule",{value:!0}),Es.install=function(e){e.usePlugin(Ds),e.usePlugin(Ts.default),e.usePlugin(Is.default);},Object.defineProperty(Es,"holdRepeat",{enumerable:!0,get:function(){return Ts.default}}),Object.defineProperty(Es,"interactableTargets",{enumerable:!0,get:function(){return Is.default}}),Es.pointerEvents=Es.id=void 0;var Ds=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==ks(e)&&"function"!=typeof e)return {default:e};var t=zs();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(us);Es.pointerEvents=Ds;var Ts=As(hs),Is=As(_s);function As(e){return e&&e.__esModule?e:{default:e}}function zs(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return zs=function(){return e},e}Es.id="pointer-events";var Cs={};Object.defineProperty(Cs,"__esModule",{value:!0}),Cs.install=Ws,Cs.default=void 0;g({});function Ws(t){for(var e=t.actions,n=t.Interactable,r=0;r<e.names.length;r++){var o=e.names[r];e.eventTypes.push("".concat(o,"reflow"));}n.prototype.reflow=function(e){return function(u,s,l){function e(){var t=c[d],e=u.getRect(t);if(!e)return "break";var n=pt.arr.find(l.interactions.list,function(e){return e.interacting()&&e.interactable===u&&e.element===t&&e.prepared.name===s.name}),r=void 0;if(n)n.move(),p&&(r=n._reflowPromise||new f(function(e){n._reflowResolve=e;}));else{var o=pt.rect.tlbrToXywh(e),i={page:{x:o.x,y:o.y},client:{x:o.x,y:o.y},timeStamp:l.now()},a=pt.pointer.coordsToEvent(i);r=function(e,t,n,r,o){var i=e.interactions.new({pointerType:"reflow"}),a={interaction:i,event:o,pointer:o,eventTarget:n,phase:Tn.EventPhase.Reflow};i.interactable=t,i.element=n,i.prepared=(0, pt.extend)({},r),i.prevEvent=o,i.updatePointer(o,o,n,!0),i._doPhase(a);var u=pt.win.window.Promise?new pt.win.window.Promise(function(e){i._reflowResolve=e;}):null;i._reflowPromise=u,i.start(r,t,n),i._interacting?(i.move(a),i.end(o)):i.stop();return i.removePointer(o,o),i.pointerIsDown=!1,u}(l,u,t,s,a);}p&&p.push(r);}for(var c=pt.is.string(u.target)?pt.arr.from(u._context.querySelectorAll(u.target)):[u.target],f=pt.win.window.Promise,p=f?[]:null,d=0;d<c.length;d++){if("break"===e())break}return p&&f.all(p).then(function(){return u})}(this,e,t)};}var Xs={id:Tn.EventPhase.Reflow="reflow",install:Ws,listeners:{"interactions:stop":function(e,t){var n=e.interaction;n.pointerType===Tn.EventPhase.Reflow&&(n._reflowResolve&&n._reflowResolve(),pt.arr.remove(t.interactions.list,n));}}};Cs.default=Xs;var Ns={};function Ys(e){return (Ys="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(Ns,"__esModule",{value:!0}),Ns.default=Ns.scope=Ns.interact=void 0;var Fs=O({}),Ls=Us(j),qs=Us(De),Vs=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Ys(e)&&"function"!=typeof e)return {default:e};var t=Gs();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(pt);function Gs(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Gs=function(){return e},e}function Us(e){return e&&e.__esModule?e:{default:e}}var Bs={},Hs=new Fs.Scope;Ns.scope=Hs;function Ks(e,t){var n=Hs.interactables.get(e,t);return n||((n=Hs.interactables.new(e,t)).events.global=Bs),n}(Ns.interact=Ks).use=function(e,t){return Hs.usePlugin(e,t),Ks},Ks.isSet=function(e,t){return !!Hs.interactables.get(e,t&&t.context)},Ks.on=function(e,t,n){Vs.is.string(e)&&-1!==e.search(" ")&&(e=e.trim().split(/ +/));if(Vs.is.array(e)){for(var r=0;r<e.length;r++){var o;o=e[r],Ks.on(o,t,n);}return Ks}if(Vs.is.object(e)){for(var i in e)Ks.on(i,e[i],t);return Ks}Vs.arr.contains(Hs.actions.eventTypes,e)?Bs[e]?Bs[e].push(t):Bs[e]=[t]:qs.default.add(Hs.document,e,t,{options:n});return Ks},Ks.off=function(e,t,n){Vs.is.string(e)&&-1!==e.search(" ")&&(e=e.trim().split(/ +/));if(Vs.is.array(e)){for(var r=0;r<e.length;r++){var o;o=e[r],Ks.off(o,t,n);}return Ks}if(Vs.is.object(e)){for(var i in e)Ks.off(i,e[i],t);return Ks}var a;Vs.arr.contains(Hs.actions.eventTypes,e)?e in Bs&&-1!==(a=Bs[e].indexOf(t))&&Bs[e].splice(a,1):qs.default.remove(Hs.document,e,t,n);return Ks},Ks.debug=function(){return Hs},Ks.getPointerAverage=Vs.pointer.pointerAverage,Ks.getTouchBBox=Vs.pointer.touchBBox,Ks.getTouchDistance=Vs.pointer.touchDistance,Ks.getTouchAngle=Vs.pointer.touchAngle,Ks.getElementRect=Vs.dom.getElementRect,Ks.getElementClientRect=Vs.dom.getElementClientRect,Ks.matchesSelector=Vs.dom.matchesSelector,Ks.closest=Vs.dom.closest,Ks.supportsTouch=function(){return Ls.default.supportsTouch},Ks.supportsPointerEvent=function(){return Ls.default.supportsPointerEvent},Ks.stop=function(){for(var e=0;e<Hs.interactions.list.length;e++){Hs.interactions.list[e].stop();}return Ks},Ks.pointerMoveTolerance=function(e){if(Vs.is.number(e))return Hs.interactions.pointerMoveTolerance=e,Ks;return Hs.interactions.pointerMoveTolerance},Hs.addListeners({"interactable:unset":function(e){var t=e.interactable;Hs.interactables.list.splice(Hs.interactables.list.indexOf(t),1);for(var n=0;n<Hs.interactions.list.length;n++){var r=Hs.interactions.list[n];r.interactable===t&&r.interacting()&&!r._ending&&r.stop();}}}),Ks.addDocument=function(e,t){return Hs.addDocument(e,t)},Ks.removeDocument=function(e){return Hs.removeDocument(e)};var $s=Hs.interact=Ks;Ns.default=$s;var Qs={};function Zs(e){return (Zs="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(Qs,"__esModule",{value:!0}),Qs.init=function(e){for(var t in sl.scope.init(e),sl.default.use(nl.default),sl.default.use(al),sl.default.use(rl.default),sl.default.use(ol.default),sl.default.use(tl),sl.default.use(Js),il){var n=il[t],r=n._defaults,o=n._methods;r._methods=o,sl.scope.defaults.perAction[t]=r;}sl.default.use(el.default),sl.default.use(ul.default),0;return sl.default},Qs.default=void 0;var Js=fl(vo),el=ll(Oo),tl=fl(di),nl=ll(hi),rl=(ll(aa)),ol=ll(Fi),il=fl(Tu),al=fl(Es),ul=ll(Cs),sl=fl(Ns);function ll(e){return e&&e.__esModule?e:{default:e}}function cl(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return cl=function(){return e},e}function fl(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Zs(e)&&"function"!=typeof e)return {default:e};var t=cl();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}sl.default.version="1.8.4";var pl=sl.default;Qs.default=pl;var dl={};function vl(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if(!(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e)))return;var n=[],r=!0,o=!1,i=void 0;try{for(var a,u=e[Symbol.iterator]();!(r=(a=u.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){o=!0,i=e;}finally{try{r||null==u.return||u.return();}finally{if(o)throw i}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}Object.defineProperty(dl,"__esModule",{value:!0}),dl.default=void 0;function yl(v){function e(e,t){for(var n=v.range,r=v.limits,o=void 0===r?{left:-1/0,right:1/0,top:-1/0,bottom:1/0}:r,i=v.offset,a=void 0===i?{x:0,y:0}:i,u={range:n,grid:v,x:null,y:null},s=0;s<y.length;s++){var l=vl(y[s],2),c=l[0],f=l[1],p=Math.round((e-a.x)/v[c]),d=Math.round((t-a.y)/v[f]);u[c]=Math.max(o.left,Math.min(o.right,p*v[c]+a.x)),u[f]=Math.max(o.top,Math.min(o.bottom,d*v[f]+a.y));}return u}var y=[["x","y"],["left","top"],["right","bottom"],["width","height"]].filter(function(e){var t=vl(e,2),n=t[0],r=t[1];return n in v||r in v});return e.grid=v,e.coordFields=y,e}dl.default=yl;var ml={};Object.defineProperty(ml,"__esModule",{value:!0}),Object.defineProperty(ml,"grid",{enumerable:!0,get:function(){return hl.default}});var gl,hl=(gl=dl)&&gl.__esModule?gl:{default:gl};var bl={};Object.defineProperty(bl,"__esModule",{value:!0}),bl.init=El,bl.default=void 0;var Ol,wl=jl(Qs),Pl=jl(Tu),_l=(Ol=me)&&Ol.__esModule?Ol:{default:Ol},xl=jl(ml);function Sl(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Sl=function(){return e},e}function jl(e){if(e&&e.__esModule)return e;if(null===e||"object"!==Ml(e)&&"function"!=typeof e)return {default:e};var t=Sl();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}return n.default=e,t&&t.set(e,n),n}function Ml(e){return (Ml="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function El(e){return (0, wl.init)(e),wl.default.use({id:"interactjs",install:function(){wl.default.modifiers=(0, _l.default)({},Pl),wl.default.snappers=xl,wl.default.createSnapGrid=wl.default.snappers.grid;}})}"object"===("undefined"==typeof window?"undefined":Ml(window))&&window&&El(window);var kl=wl.default;bl.default=kl;var Dl={exports:{}};Object.defineProperty(Dl.exports,"__esModule",{value:!0});var Tl={};Dl.exports.default=void 0;var Il=function(e){if(e&&e.__esModule)return e;if(null===e||"object"!==zl(e)&&"function"!=typeof e)return {default:e};var t=Al();if(t&&t.has(e))return t.get(e);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var i=r?Object.getOwnPropertyDescriptor(e,o):null;i&&(i.get||i.set)?Object.defineProperty(n,o,i):n[o]=e[o];}n.default=e,t&&t.set(e,n);return n}(bl);function Al(){if("function"!=typeof WeakMap)return null;var e=new WeakMap;return Al=function(){return e},e}function zl(e){return (zl="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}if(Object.keys(Il).forEach(function(e){"default"!==e&&"__esModule"!==e&&(Object.prototype.hasOwnProperty.call(Tl,e)||Object.defineProperty(Dl.exports,e,{enumerable:!0,get:function(){return Il[e]}}));}),"object"===zl(Dl)&&Dl)try{Dl.exports=Il.default;}catch(e){}Il.default.default=Il.default,Il.default.init=Il.init;var Cl=Il.default;return Dl.exports.default=Cl,Dl=Dl.exports});


});

const interact = unwrapExports(interact_min);

const ViewportDataComponent = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    componentWillLoad() {
        interact('.data-header-cell').resizable({
            edges: { bottom: false, right: true },
            onend: event => {
                const index = parseInt(event.target.getAttribute('data-col'), 10);
                setDimensionSize({ [index]: event.rect.width }, 'col');
                event.target.style.width = `${event.rect.width}px`;
            }
        });
    }
    render() {
        const cells = [];
        for (let col of colsStore$1.get('items')) {
            cells.push(h("div", { class: 'data-header-cell', "data-col": col.itemIndex, style: { width: `${col.size}px`, transform: `translateX(${col.start}px)` } }, dataStore.provider.header(col.itemIndex)));
        }
        return cells;
    }
    get element() { return getElement(this); }
};

const RevogrViewportScrollable = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.scrollSize = 0;
        this.preventArtificialScroll = false;
        this.scrollVirtY = () => {
            if (this.preventArtificialScroll) {
                this.preventArtificialScroll = false;
                return;
            }
            const target = this.verticalVirtScroll;
            const top = (target === null || target === void 0 ? void 0 : target.scrollTop) || 0;
            setViewPortCoordinate(top, 'row');
            if (this.verticalScroll) {
                this.preventArtificialScroll = true;
                this.verticalScroll.scrollTop = top;
            }
        };
    }
    async scrollX(x) {
        var _a;
        if (x) {
            this.horizontalScroll.scrollLeft = x;
        }
        setViewPortCoordinate(x || ((_a = this.horizontalScroll) === null || _a === void 0 ? void 0 : _a.scrollLeft) || 0, 'col');
    }
    async scrollY(y) {
        var _a;
        if (this.preventArtificialScroll) {
            this.preventArtificialScroll = false;
            return;
        }
        const top = y || ((_a = this.verticalScroll) === null || _a === void 0 ? void 0 : _a.scrollTop) || 0;
        setViewPortCoordinate(top, 'row');
        if (this.verticalVirtScroll) {
            this.preventArtificialScroll = true;
            this.verticalVirtScroll.scrollTop = top;
        }
    }
    componentWillLoad() {
        this.scrollSize = getScrollbarWidth(document);
        let oldValY = rowsStore.get('realSize');
        let oldValX = colsStore.get('realSize');
        this.scrollX();
        this.scrollY();
        rowsStore.onChange('realSize', (newVal) => {
            if (newVal < oldValY) {
                this.verticalScroll.scrollLeft += newVal - oldValY;
            }
            oldValY = newVal;
        });
        colsStore.onChange('realSize', (newVal) => {
            if (newVal < oldValX) {
                this.horizontalScroll.scrollLeft += newVal - oldValX;
            }
            oldValX = newVal;
        });
    }
    componentDidRender() {
        // has vertical scroll
        if (this.verticalVirtScroll.scrollHeight > this.verticalVirtScroll.clientHeight) {
            const scrollSize = this.scrollSize || 20;
            this.verticalVirtScroll.style.top = `${this.header.clientHeight}px`;
            this.verticalVirtScroll.style.width = `${scrollSize}px`;
            this.verticalScroll.style.marginRight = `${scrollSize}px`;
        }
        else {
            this.verticalVirtScroll.style.width = '0';
            this.verticalScroll.style.marginRight = '0';
        }
        // has horizontal scroll
        if (this.horizontalScroll.scrollWidth > this.horizontalScroll.clientWidth) {
            this.verticalVirtScroll.style.bottom = `${this.scrollSize}px`;
        }
        else {
            this.verticalVirtScroll.style.bottom = '0';
        }
    }
    render() {
        return [
            h("div", { class: 'vertical-scroll', ref: (el) => { this.verticalVirtScroll = el; }, onScroll: () => this.scrollVirtY() }, h("div", { style: { height: `${rowsStore.get('realSize')}px` } })),
            h("div", { class: 'horizontal-wrapper', ref: (el) => { this.horizontalScroll = el; }, onScroll: () => this.scrollX() }, h("div", { class: 'inner-content-table' }, h("div", { class: 'header-wrapper', ref: (el) => { this.header = el; } }, h("slot", { name: 'header' })), h("div", { class: 'vertical-wrapper' }, h("div", { class: 'vertical-inner', ref: (el) => { this.verticalScroll = el; }, onScroll: () => this.scrollY() }, h("div", { style: { height: `${rowsStore.get('realSize')}px`, width: `${colsStore.get('realSize')}px` } }, h("slot", { name: 'content' }))))))
        ];
    }
};

export { RevoGrid as revo_grid, RevogrData as revogr_data, ViewportDataComponent as revogr_header, RevogrViewportScrollable as revogr_viewport_scrollable };

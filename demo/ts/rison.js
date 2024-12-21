"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quote = quote;
exports.encode = encode;
exports.encode_object = encode_object;
exports.encode_array = encode_array;
exports.encode_uri = encode_uri;
exports.decode = decode;
exports.decode_object = decode_object;
exports.decode_array = decode_array;
// Based on https://github.com/Nanonid/rison at e64af6c096fd30950ec32cfd48526ca6ee21649d (Jun 9, 2017)
function assert(condition) {
    if (!condition) {
        throw new Error('Assertion failed');
    }
}
function fail(fail_message, user_message, args) {
    var assert_line = fail_message;
    if (user_message) {
        assert_line += ": ".concat(user_message);
    }
    if (args.length > 0) {
        try {
            assert_line += ', ' + JSON.stringify(args);
        }
        catch (e) { }
    }
    throw new Error(assert_line);
}
function unwrap(x, message) {
    var extra_info = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        extra_info[_i - 2] = arguments[_i];
    }
    if (x === undefined || x === null) {
        fail('Unwrap failed', message, extra_info);
    }
    return x;
}
function isString(x) {
    return typeof x === 'string' || x instanceof String;
}
//////////////////////////////////////////////////
//
//  the stringifier is based on
//    http://json.org/json.js as of 2006-04-28 from json.org
//  the parser is based on
//    http://osteele.com/sources/openlaszlo/json
//
/*
 * we divide the uri-safe glyphs into three sets
 *   <rison> - used by rison                         ' ! : ( ) ,
 *   <reserved> - not common in strings, reserved    * @ $ & ; =
 *
 * we define <identifier> as anything that's not forbidden
 */
/**
 * punctuation characters that are legal inside ids.
 */
// this var isn't actually used
//rison.idchar_punctuation = "_-./~";
var not_idchar = " '!:(),*@$";
/**
 * characters that are illegal as the start of an id
 * this is so ids can't look like numbers.
 */
var not_idstart = '-0123456789';
var _a = (function () {
    var _idrx = '[^' + not_idstart + not_idchar + '][^' + not_idchar + ']*';
    return [
        new RegExp('^' + _idrx + '$'),
        // regexp to find the end of an id when parsing
        // g flag on the regexp is necessary for iterative regexp.exec()
        new RegExp(_idrx, 'g'),
    ];
})(), id_ok = _a[0], next_id = _a[1];
/**
 * this is like encodeURIComponent() but quotes fewer characters.
 *
 * @see rison.uri_ok
 *
 * encodeURIComponent passes   ~!*()-_.'
 * rison.quote also passes   ,:@$/
 *   and quotes " " as "+" instead of "%20"
 */
function quote(x) {
    if (/^[-A-Za-z0-9~!*()_.',:@$/]*$/.test(x))
        return x;
    return encodeURIComponent(x)
        .replace(/%2C/g, ',')
        .replace(/%3A/g, ':')
        .replace(/%40/g, '@')
        .replace(/%24/g, '$')
        .replace(/%2F/g, '/')
        .replace(/%20/g, '+');
}
//
//  based on json.js 2006-04-28 from json.org
//  license: http://www.json.org/license.html
//
//  hacked by nix for use in uris.
//
// url-ok but quoted in strings
var string_table = {
    "'": true,
    '!': true,
};
var Encoders = /** @class */ (function () {
    function Encoders() {
    }
    Encoders.array = function (x) {
        var a = ['!('];
        var b;
        var i;
        var l = x.length;
        var v;
        for (i = 0; i < l; i += 1) {
            v = enc(x[i]);
            if (typeof v == 'string') {
                if (b) {
                    a[a.length] = ',';
                }
                a[a.length] = v;
                b = true;
            }
        }
        a[a.length] = ')';
        return a.join('');
    };
    Encoders.boolean = function (x) {
        if (x)
            return '!t';
        return '!f';
    };
    Encoders.null = function () {
        return '!n';
    };
    Encoders.number = function (x) {
        if (!isFinite(x))
            return '!n';
        // strip '+' out of exponent, '-' is ok though
        return String(x).replace(/\+/, '');
    };
    Encoders.object = function (x) {
        if (x) {
            // because typeof null === 'object'
            if (x instanceof Array) {
                return Encoders.array(x);
            }
            var a = ['('];
            var b = false;
            var i = void 0;
            var v = void 0;
            var k = void 0;
            var ki = void 0;
            var ks = [];
            for (var i_1 in x)
                ks[ks.length] = i_1;
            ks.sort();
            for (ki = 0; ki < ks.length; ki++) {
                i = ks[ki];
                v = enc(x[i]);
                if (typeof v == 'string') {
                    if (b) {
                        a[a.length] = ',';
                    }
                    k = isNaN(parseInt(i)) ? Encoders.string(i) : Encoders.number(parseInt(i));
                    a.push(k, ':', v);
                    b = true;
                }
            }
            a[a.length] = ')';
            return a.join('');
        }
        return '!n';
    };
    Encoders.string = function (x) {
        if (x === '')
            return "''";
        if (id_ok.test(x))
            return x;
        x = x.replace(/(['!])/g, function (a, b) {
            if (string_table[b])
                return '!' + b;
            return b;
        });
        return "'" + x + "'";
    };
    Encoders.undefined = function () {
        // ignore undefined just like JSON
        return undefined;
    };
    return Encoders;
}());
var encode_table = {
    array: Encoders.array,
    object: Encoders.object,
    boolean: Encoders.boolean,
    string: Encoders.string,
    number: Encoders.number,
    null: Encoders.null,
    undefined: Encoders.undefined,
};
function enc(v) {
    if (v && typeof v === 'object' && 'toJSON' in v && typeof v.toJSON === 'function')
        v = v.toJSON();
    if ((typeof v) in encode_table) {
        return encode_table[typeof v](v);
    }
}
/**
 * rison-encode a javascript structure
 *
 *  implemementation based on Douglas Crockford's json.js:
 *    http://json.org/json.js as of 2006-04-28 from json.org
 *
 */
function encode(v) {
    return enc(v);
}
/**
 * rison-encode a javascript object without surrounding parens
 *
 */
function encode_object(v) {
    if (typeof v != 'object' || v === null || v instanceof Array)
        throw new Error('rison.encode_object expects an object argument');
    var r = unwrap(encode_table[typeof v](v));
    return r.substring(1, r.length - 1);
}
/**
 * rison-encode a javascript array without surrounding parens
 *
 */
function encode_array(v) {
    if (!(v instanceof Array))
        throw new Error('rison.encode_array expects an array argument');
    var r = unwrap(encode_table[typeof v](v));
    return r.substring(2, r.length - 1);
}
/**
 * rison-encode and uri-encode a javascript structure
 *
 */
function encode_uri(v) {
    return quote(unwrap(encode_table[typeof v](v)));
}
//
// based on openlaszlo-json and hacked by nix for use in uris.
//
// Author: Oliver Steele
// Copyright: Copyright 2006 Oliver Steele.  All rights reserved.
// Homepage: http://osteele.com/sources/openlaszlo/json
// License: MIT License.
// Version: 1.0
/**
 * parse a rison string into a javascript structure.
 *
 * this is the simplest decoder entry point.
 *
 *  based on Oliver Steele's OpenLaszlo-JSON
 *     http://osteele.com/sources/openlaszlo/json
 */
function decode(r) {
    var p = new Parser();
    return p.parse(r);
}
/**
 * parse an o-rison string into a javascript structure.
 *
 * this simply adds parentheses around the string before parsing.
 */
function decode_object(r) {
    return decode('(' + r + ')');
}
/**
 * parse an a-rison string into a javascript structure.
 *
 * this simply adds array markup around the string before parsing.
 */
function decode_array(r) {
    return decode('!(' + r + ')');
}
var Parser = /** @class */ (function () {
    function Parser() {
        var _this = this;
        this.string = '';
        this.index = -1;
        this.table = {
            '!': function () {
                var s = _this.string;
                var c = s.charAt(_this.index++);
                if (!c)
                    return _this.error('"!" at end of input');
                var x = Parser.bangs[c];
                if (typeof x == 'function') {
                    // eslint-disable-next-line no-useless-call
                    return x.call(null, _this);
                }
                else if (typeof x === 'undefined') {
                    return _this.error('unknown literal: "!' + c + '"');
                }
                return x;
            },
            '(': function () {
                var o = {};
                var c;
                var count = 0;
                while ((c = _this.next()) !== ')') {
                    if (count) {
                        if (c !== ',')
                            _this.error("missing ','");
                    }
                    else if (c === ',') {
                        _this.error("extra ','");
                    }
                    else
                        --_this.index;
                    var k = _this.readValue();
                    if (typeof k == 'undefined')
                        return undefined;
                    if (_this.next() !== ':')
                        _this.error("missing ':'");
                    var v = _this.readValue();
                    if (typeof v == 'undefined')
                        return undefined;
                    o[k] = v;
                    count++;
                }
                return o;
            },
            "'": function () {
                var s = _this.string;
                var i = _this.index;
                var start = i;
                var segments = [];
                var c;
                while ((c = s.charAt(i++)) !== "'") {
                    //if (i == s.length) return this.error('unmatched "\'"');
                    if (!c)
                        _this.error('unmatched "\'"');
                    if (c === '!') {
                        if (start < i - 1)
                            segments.push(s.slice(start, i - 1));
                        c = s.charAt(i++);
                        if ("!'".includes(c)) {
                            segments.push(c);
                        }
                        else {
                            _this.error('invalid string escape: "!' + c + '"');
                        }
                        start = i;
                    }
                }
                if (start < i - 1)
                    segments.push(s.slice(start, i - 1));
                _this.index = i;
                return segments.length === 1 ? segments[0] : segments.join('');
            },
            // Also any digit.  The statement that follows this table
            // definition fills in the digits.
            '-': function () {
                var s = _this.string;
                var i = _this.index;
                var start = i - 1;
                var state = 'int';
                var permittedSigns = '-';
                var transitions = {
                    'int+.': 'frac',
                    'int+e': 'exp',
                    'frac+e': 'exp',
                };
                do {
                    var c = s.charAt(i++);
                    if (!c)
                        break;
                    if ('0' <= c && c <= '9')
                        continue;
                    if (permittedSigns.includes(c)) {
                        permittedSigns = '';
                        continue;
                    }
                    state = transitions[state + '+' + c.toLowerCase()];
                    if (state === 'exp')
                        permittedSigns = '-';
                } while (state);
                _this.index = --i;
                s = s.slice(start, i);
                if (s === '-')
                    _this.error('invalid number');
                return Number(s);
            },
        };
        // copy table['-'] to each of table[i] | i <- '0'..'9':
        for (var i = 0; i <= 9; i++)
            this.table[String(i)] = this.table['-'];
    }
    /**
     * parse a rison string into a javascript structure.
     */
    Parser.prototype.parse = function (str) {
        this.string = str;
        this.index = 0;
        var value = this.readValue();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this.next())
            this.error("unable to parse string as rison: '" + encode(str) + "'");
        return value;
    };
    Parser.prototype.error = function (message) {
        throw new Error('rison parser error: ' + message);
    };
    Parser.prototype.readValue = function () {
        var c = this.next();
        var fn = c && this.table[c];
        if (fn)
            return fn.apply(this);
        // fell through table, parse as an id
        var s = this.string;
        var i = this.index - 1;
        // Regexp.lastIndex may not work right in IE before 5.5?
        // g flag on the regexp is also necessary
        next_id.lastIndex = i;
        var m = unwrap(next_id.exec(s));
        // console.log('matched id', i, r.lastIndex);
        if (m.length > 0) {
            var id = m[0];
            this.index = i + id.length;
            return id; // a string
        }
        if (c)
            this.error("invalid character: '" + c + "'");
        this.error('empty expression');
    };
    Parser.prototype.next = function () {
        var c;
        var s = this.string;
        var i = this.index;
        do {
            if (i === s.length)
                return undefined;
            c = s.charAt(i++);
        } while (Parser.WHITESPACE.includes(c));
        this.index = i;
        return c;
    };
    Parser.parse_array = function (parser) {
        var ar = [];
        var c;
        while ((c = parser.next()) !== ')') {
            if (!c)
                return parser.error("unmatched '!('");
            if (ar.length) {
                if (c !== ',')
                    parser.error("missing ','");
            }
            else if (c === ',') {
                return parser.error("extra ','");
            }
            else
                --parser.index;
            var n = parser.readValue();
            if (n === undefined)
                return undefined;
            ar.push(n);
        }
        return ar;
    };
    /**
     * a string containing acceptable whitespace characters.
     * by default the rison decoder tolerates no whitespace.
     * to accept whitespace set rison.parser.WHITESPACE = " \t\n\r\f";
     */
    Parser.WHITESPACE = '';
    Parser.bangs = {
        t: true,
        f: false,
        n: null,
        '(': Parser.parse_array,
    };
    return Parser;
}());

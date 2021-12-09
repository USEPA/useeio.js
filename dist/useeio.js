(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.useeio = {}));
})(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    /**
     * Provides utility functions for working with matrix data.
     */
    var Matrix = /** @class */ (function () {
        /**
         * Creates a new matrix instance from the given data.
         */
        function Matrix(data) {
            this.data = data;
            this.rows = data.length;
            this.cols = this.rows === 0 ? 0 : data[0].length;
        }
        /**
         * Creates a new dense `m * n` matrix with all entries set to `0`.
         *
         * @param rows The number of rows `m`.
         * @param cols The number of columns `n`.
         */
        Matrix.zeros = function (rows, cols) {
            var data = new Array(rows);
            for (var row = 0; row < rows; row++) {
                var v = new Array(cols);
                for (var col = 0; col < cols; col++) {
                    v[col] = 0;
                }
                data[row] = v;
            }
            return new Matrix(data);
        };
        /**
         * Get the element at the given row and column: `A[i, j]`.
         */
        Matrix.prototype.get = function (row, col) {
            return this.data[row][col];
        };
        /**
         * Get the row with the given index `i`: `A[i,:]`.
         */
        Matrix.prototype.getRow = function (row) {
            return this.data[row].slice();
        };
        /**
         * Get the column with the given index `j`: `A[:,j]`.
         */
        Matrix.prototype.getCol = function (col) {
            var vals = new Array(this.rows);
            for (var row = 0; row < this.rows; row++) {
                vals[row] = this.get(row, col);
            }
            return vals;
        };
        /**
         * Set the entry at the given row and column to the given value.
         */
        Matrix.prototype.set = function (row, col, val) {
            this.data[row][col] = val;
        };
        /**
         * Scales the columns with the given vector `f`: `A * diag(f)`.
         */
        Matrix.prototype.scaleColumns = function (f) {
            var m = Matrix.zeros(this.rows, this.cols);
            for (var row = 0; row < this.rows; row++) {
                for (var col = 0; col < this.cols; col++) {
                    var v = this.get(row, col) * f[col];
                    m.set(row, col, v);
                }
            }
            return m;
        };
        /**
         * Scales the rows with the given vector `f`: `diag(f) * A`.
         */
        Matrix.prototype.scaleRows = function (f) {
            var m = Matrix.zeros(this.rows, this.cols);
            for (var row = 0; row < this.rows; row++) {
                for (var col = 0; col < this.cols; col++) {
                    var v = this.get(row, col) * f[row];
                    m.set(row, col, v);
                }
            }
            return m;
        };
        /**
         * Performs a matrix-vector-multiplication with the given `v`: `A * v`.
         */
        Matrix.prototype.multiplyVector = function (v) {
            return this.data.map(function (row) { return row.reduce(function (sum, x, j) {
                var vj = v[j];
                if (x && vj) {
                    return sum + (x * vj);
                }
                return sum;
            }, 0); });
        };
        return Matrix;
    }());

    function zeros(len) {
        return new Array(len).fill(0);
    }
    function ones(len) {
        return new Array(len).fill(1);
    }
    function max(xs) {
        if (!xs || xs.length === 0) {
            return 0;
        }
        return xs.reduce(function (maxval, x) { return Math.max(maxval, x); });
    }
    var CommodityVector = /** @class */ (function () {
        function CommodityVector() {
        }
        CommodityVector.directImpactsOf = function (model, vector) {
            return __awaiter(this, void 0, void 0, function () {
                var v, D;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            v = vector instanceof Matrix
                                ? vector.getCol(0)
                                : vector;
                            return [4 /*yield*/, model.matrix("D")];
                        case 1:
                            D = _a.sent();
                            return [2 /*return*/, D.multiplyVector(v)];
                    }
                });
            });
        };
        CommodityVector.directRequirementsOf = function (model, vector) {
            return __awaiter(this, void 0, void 0, function () {
                var v, A;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            v = vector instanceof Matrix
                                ? vector.getCol(0)
                                : vector;
                            return [4 /*yield*/, model.matrix("A")];
                        case 1:
                            A = _a.sent();
                            return [2 /*return*/, A.multiplyVector(v)];
                    }
                });
            });
        };
        CommodityVector.directDownstreamsOf = function (model, vector) {
            return __awaiter(this, void 0, void 0, function () {
                var v, A, n, d, _i, _a, row, j;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            v = vector instanceof Matrix
                                ? vector.getCol(0)
                                : vector;
                            return [4 /*yield*/, model.matrix("A")];
                        case 1:
                            A = _b.sent();
                            n = Math.min(A.cols, v.length);
                            d = zeros(n);
                            for (_i = 0, _a = A.data; _i < _a.length; _i++) {
                                row = _a[_i];
                                for (j = 0; j < n; j++) {
                                    d[j] += row[j] * v[j];
                                }
                            }
                            return [2 /*return*/, d];
                    }
                });
            });
        };
        return CommodityVector;
    }());

    /**
     * An enumeration of the valid indicator groups of the USEEIO API.
     */
    exports.IndicatorGroup = void 0;
    (function (IndicatorGroup) {
        IndicatorGroup["IMPACT_POTENTIAL"] = "Impact Potential";
        IndicatorGroup["RESOURCE_USE"] = "Resource Use";
        IndicatorGroup["WASTE_GENERATED"] = "Waste Generated";
        IndicatorGroup["ECONOMIC_SOCIAL"] = "Economic & Social";
        IndicatorGroup["CHEMICAL_RELEASES"] = "Chemical Releases";
    })(exports.IndicatorGroup || (exports.IndicatorGroup = {}));
    /**
     * A demand vector maps sector IDs to their demand values.
     */
    var DemandVector = /** @class */ (function () {
        function DemandVector(entries) {
            this.map = {};
            if (entries) {
                for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    var e = entries_1[_i];
                    this.map[e.sector] = e.amount;
                }
            }
        }
        DemandVector.prototype.get = function (sectorId) {
            var val = this.map[sectorId];
            if (!val) {
                return 0.0;
            }
            return val;
        };
        return DemandVector;
    }());

    var NaicsMap = /** @class */ (function () {
        function NaicsMap(_map) {
            this._map = _map;
        }
        NaicsMap.of = function (model) {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var crosswalk, modelInfo, modelSchema, naicsCol, modelCol, i, header, map, minSize, _i, _b, mapping, naicsCode, beaCode, mapped;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, model.sectorCrosswalk()];
                        case 1:
                            crosswalk = _c.sent();
                            if (!crosswalk
                                || !crosswalk.header
                                || crosswalk.header.length === 0
                                || !crosswalk.mappings
                                || crosswalk.mappings.length === 0) {
                                return [2 /*return*/, new NaicsMap({})];
                            }
                            return [4 /*yield*/, model.info()];
                        case 2:
                            modelInfo = _c.sent();
                            modelSchema = (_a = modelInfo === null || modelInfo === void 0 ? void 0 : modelInfo.sectorschema) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                            naicsCol = -1;
                            modelCol = -1;
                            for (i = 0; i < crosswalk.header.length; i++) {
                                if (naicsCol >= 0 && modelCol >= 0) {
                                    break;
                                }
                                header = crosswalk.header[i].toLowerCase();
                                if (header === "naics") {
                                    naicsCol = i;
                                    continue;
                                }
                                if (modelSchema && header == modelSchema) {
                                    modelCol = i;
                                    continue;
                                }
                                // if there is no model schema available we try to
                                // map the BEA detail column
                                if (!modelCol
                                    && header.includes("bea")
                                    && header.includes("detail")) {
                                    modelCol = i;
                                }
                            }
                            if (naicsCol < 0 || modelCol < 0) {
                                return [2 /*return*/, new NaicsMap({})];
                            }
                            map = {};
                            minSize = Math.max(naicsCol, modelCol) + 1;
                            for (_i = 0, _b = crosswalk.mappings; _i < _b.length; _i++) {
                                mapping = _b[_i];
                                if (mapping.length < minSize) {
                                    continue;
                                }
                                naicsCode = mapping[naicsCol].trim();
                                beaCode = mapping[modelCol].trim();
                                if (naicsCode.length == 0 || beaCode.length == 0) {
                                    continue;
                                }
                                mapped = map[naicsCode];
                                if (!mapped) {
                                    map[naicsCode] = [beaCode];
                                }
                                else {
                                    mapped.push(beaCode);
                                }
                            }
                            return [2 /*return*/, new NaicsMap(map)];
                    }
                });
            });
        };
        /**
         * Maps the given NAICS codes to a list of corresponding BEA
         * codes based on the underlying model-schema of this map.
         *
         * @param naics the NAICS codes that should be mapped.
         */
        NaicsMap.prototype.toBea = function (naics) {
            if (!naics) {
                return [];
            }
            var naicsCodes = naics instanceof Array
                ? naics
                : [naics];
            var bea = {};
            for (var _i = 0, naicsCodes_1 = naicsCodes; _i < naicsCodes_1.length; _i++) {
                var naic = naicsCodes_1[_i];
                var mapped = this._map[naic];
                if (mapped) {
                    for (var _a = 0, mapped_1 = mapped; _a < mapped_1.length; _a++) {
                        var code = mapped_1[_a];
                        bea[code] = true;
                    }
                }
            }
            return Object.keys(bea);
        };
        return NaicsMap;
    }());

    function modelOf(config) {
        var api = new WebApi(config);
        return new WebModel(api, config.model);
    }
    /**
     * A class for low level web API calls. The widgets should typically use an
     * instance of the `Model` class for accessing the web API instead as it
     * provides advanced features like typed requests, caching, etc.
     */
    var WebApi = /** @class */ (function () {
        /**
         * Creates a new instance based on the given configuration.
         */
        function WebApi(_config) {
            this._config = _config;
            if (!_config || !_config.endpoint) {
                throw new Error('invalid endpoint');
            }
            var endpoint = _config.endpoint;
            if (!endpoint.endsWith("/")) {
                endpoint += "/";
            }
            this._endpoint = endpoint;
        }
        WebApi.prototype.isJsonDump = function () {
            return this._config.asJsonFiles === true;
        };
        /**
         * Returns information about the available models of this API endpoint. This
         * is the only request that has no prefix of the model ID. For all other
         * requests, just use `get(<path>)` that will automatically add the model ID
         * as a prefix to the request path.
         */
        WebApi.prototype.getModelInfos = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.getJson("models")];
                });
            });
        };
        /**
         * Performs a `get` request on this API endpoint for the given path and
         * returns the response as JSON.
         *
         * @param path the path segments of the request
         * @returns a promise of the requested resource
         */
        WebApi.prototype.getJson = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var url, req;
                return __generator(this, function (_a) {
                    url = this._target.apply(this, path);
                    if (this._config.asJsonFiles) {
                        if (!url.endsWith(".json")) {
                            url += ".json";
                        }
                    }
                    req = this._request("GET", url);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            req.onload = function () {
                                if (req.status === 200) {
                                    try {
                                        var t = JSON.parse(req.responseText);
                                        resolve(t);
                                    }
                                    catch (err) {
                                        reject("failed to parse response for: "
                                            + url + ": " + err);
                                    }
                                }
                                else {
                                    reject("request " + url + " failed: " + req.statusText);
                                }
                            };
                            req.send();
                        })];
                });
            });
        };
        WebApi.prototype.getText = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var url, req;
                return __generator(this, function (_a) {
                    url = this._target.apply(this, path);
                    req = this._request("GET", url);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            req.onload = function () {
                                if (req.status === 200) {
                                    try {
                                        resolve(req.responseText);
                                    }
                                    catch (err) {
                                        reject("failed to parse response for: "
                                            + url + ": " + err);
                                    }
                                }
                                else {
                                    reject("request " + url + " failed: " + req.statusText);
                                }
                            };
                            req.send();
                        })];
                });
            });
        };
        /**
         * Performs a `post` with the given data on the given path, e.g.
         * `/calculate`.
         */
        WebApi.prototype.post = function (data) {
            var path = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                path[_i - 1] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var url, req;
                return __generator(this, function (_a) {
                    url = this._target.apply(this, path);
                    req = this._request("POST", url);
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            req.onload = function () {
                                if (req.status === 200) {
                                    try {
                                        var t = JSON.parse(req.responseText);
                                        resolve(t);
                                    }
                                    catch (err) {
                                        reject("failed to parse response for POST "
                                            + url + ": " + err);
                                    }
                                }
                                else {
                                    reject("request POST " + url + " failed: " + req.statusText);
                                }
                            };
                            req.send(JSON.stringify(data));
                        })];
                });
            });
        };
        /**
         * Returns the full path to a resource target of this API endpoint.
         *
         * @param path the path segments of the resource (e.g. `'modelv2', 'sectors'`)
         * @returns the full path of the resource target (e.g.
         * `http://localhost/api/modelv2/sectors`)
         */
        WebApi.prototype._target = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            if (!path) {
                return this._endpoint;
            }
            var target = this._endpoint;
            for (var _a = 0, path_1 = path; _a < path_1.length; _a++) {
                var p = path_1[_a];
                if (!p) {
                    continue;
                }
                if (!target.endsWith("/")) {
                    target += "/";
                }
                target += p;
            }
            return target;
        };
        WebApi.prototype._request = function (method, url) {
            var req = new XMLHttpRequest();
            req.open(method, url);
            req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            if (this._config.apikey) {
                req.setRequestHeader("x-api-key", this._config.apikey);
            }
            return req;
        };
        return WebApi;
    }());
    /**
     * A `Model` instance caches the results of API requests and provides additional
     * functions like aggregating multi-regional sectors of an USEEIO model.
     * Different widgets that access the same web-API should use the same `Model`
     * instance for efficiency reasons.
     */
    var WebModel = /** @class */ (function () {
        function WebModel(api, modelId) {
            this.api = api;
            this.modelId = modelId;
            this._matrices = {};
            this._demands = {};
            this._totalResults = {};
        }
        WebModel.prototype.id = function () {
            return this.modelId;
        };
        WebModel.prototype.info = function () {
            return __awaiter(this, void 0, void 0, function () {
                var infos, _i, infos_1, info;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!this._info) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.api.getModelInfos()];
                        case 1:
                            infos = _a.sent();
                            for (_i = 0, infos_1 = infos; _i < infos_1.length; _i++) {
                                info = infos_1[_i];
                                if (info.id == this.id()) {
                                    this._info = info;
                                    break;
                                }
                            }
                            _a.label = 2;
                        case 2: return [2 /*return*/, this._info];
                    }
                });
            });
        };
        /**
         * Returns the sectors of the USEEIO model.
         */
        WebModel.prototype.sectors = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!!this._sectors) return [3 /*break*/, 2];
                            _a = this;
                            return [4 /*yield*/, this.api.getJson(this.modelId, "sectors")];
                        case 1:
                            _a._sectors = _b.sent();
                            _b.label = 2;
                        case 2: return [2 /*return*/, this._sectors || []];
                    }
                });
            });
        };
        /**
         * Returns true if this is a multi-regional model, i.e. it has sectors with
         * different location codes.
         */
        WebModel.prototype.isMultiRegional = function () {
            return __awaiter(this, void 0, void 0, function () {
                var sectors, loc, _i, sectors_1, sector;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (typeof this._isMultiRegional === "boolean") {
                                return [2 /*return*/, this._isMultiRegional];
                            }
                            return [4 /*yield*/, this.sectors()];
                        case 1:
                            sectors = _a.sent();
                            for (_i = 0, sectors_1 = sectors; _i < sectors_1.length; _i++) {
                                sector = sectors_1[_i];
                                if (!sector.location) {
                                    continue;
                                }
                                if (!loc) {
                                    loc = sector.location;
                                    continue;
                                }
                                if (loc !== sector.location) {
                                    this._isMultiRegional = true;
                                    return [2 /*return*/, true];
                                }
                            }
                            this._isMultiRegional = false;
                            return [2 /*return*/, false];
                    }
                });
            });
        };
        /**
         * Returns the indicators of the USEEIO model.
         */
        WebModel.prototype.indicators = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!!this._indicators) return [3 /*break*/, 2];
                            _a = this;
                            return [4 /*yield*/, this.api.getJson(this.modelId, "indicators")];
                        case 1:
                            _a._indicators = _b.sent();
                            _b.label = 2;
                        case 2: return [2 /*return*/, this._indicators || []];
                    }
                });
            });
        };
        /**
         * Returns the information of the available demand vectors of the USEEIO
         * model.
         */
        WebModel.prototype.demands = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!!this._demandInfos) return [3 /*break*/, 2];
                            _a = this;
                            return [4 /*yield*/, this.api.getJson(this.modelId, "demands")];
                        case 1:
                            _a._demandInfos = _b.sent();
                            _b.label = 2;
                        case 2: return [2 /*return*/, this._demandInfos || []];
                    }
                });
            });
        };
        /**
         * Returns the demand vector with the given ID.
         */
        WebModel.prototype.demand = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var d;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            d = this._demands[id];
                            if (d) {
                                return [2 /*return*/, d];
                            }
                            return [4 /*yield*/, this.api.getJson(this.modelId, "demands", id)];
                        case 1:
                            d = _a.sent();
                            this._demands[id] = d;
                            return [2 /*return*/, d];
                    }
                });
            });
        };
        /**
         * Get the ID of the (first) demand vector for the given specification.
         */
        WebModel.prototype.findDemand = function (spec) {
            return __awaiter(this, void 0, void 0, function () {
                var demands, demand;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.demands()];
                        case 1:
                            demands = _a.sent();
                            demand = demands.find(function (d) {
                                if (spec.id && d.id !== spec.id) {
                                    return false;
                                }
                                if (spec.type && d.type !== spec.type) {
                                    return false;
                                }
                                if (spec.system && d.system !== spec.system) {
                                    return false;
                                }
                                /* TODO: location codes in the sectors are not the same
                                 * as in the demand vectors.
                                if (spec.location && d.location !== spec.location) {
                                    return false;
                                }
                                */
                                return !(spec.year && d.year !== spec.year);
                            });
                            return [2 /*return*/, demand ? demand.id : null];
                    }
                });
            });
        };
        /**
         * Returns the matrix with the given name from the model.
         */
        WebModel.prototype.matrix = function (name) {
            return __awaiter(this, void 0, void 0, function () {
                var m, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            m = this._matrices[name];
                            if (m) {
                                return [2 /*return*/, m];
                            }
                            return [4 /*yield*/, this.api.getJson(this.modelId, "matrix", name)];
                        case 1:
                            data = _a.sent();
                            m = new Matrix(data);
                            this._matrices[name] = m;
                            return [2 /*return*/, m];
                    }
                });
            });
        };
        /**
         * Get the column of the matrix with the given name from the model.
         */
        WebModel.prototype.column = function (matrix, index) {
            return __awaiter(this, void 0, void 0, function () {
                var m;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.api.isJsonDump()) {
                                return [2 /*return*/, this.api.getJson(this.modelId, "matrix", matrix + "?col=" + index)];
                            }
                            return [4 /*yield*/, this.matrix(matrix)];
                        case 1:
                            m = _a.sent();
                            return [2 /*return*/, m.getCol(index)];
                    }
                });
            });
        };
        /**
         * Runs a calculation for the given setup. Note that this will run the
         * calculation locally if the API is defined to fetch JSON files. Depending
         * on the calculation type this may needs quite some calculation time and
         * data.
         */
        WebModel.prototype.calculate = function (setup) {
            return __awaiter(this, void 0, void 0, function () {
                var indicators, sectors, demand, sectorIdx, N, data, L, s, _a, D;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this.api.isJsonDump()) {
                                return [2 /*return*/, this.api.post(setup, this.modelId, "calculate")];
                            }
                            return [4 /*yield*/, this.indicators()];
                        case 1:
                            indicators = _b.sent();
                            return [4 /*yield*/, this.sectors()];
                        case 2:
                            sectors = _b.sent();
                            demand = new Array(sectors.length).fill(10);
                            sectorIdx = {};
                            sectors.reduce(function (idx, sector) {
                                idx[sector.id] = sector.index;
                                return idx;
                            }, sectorIdx);
                            setup.demand.forEach(function (entry) {
                                var i = sectorIdx[entry.sector];
                                if (i === 0 || i) {
                                    demand[i] = entry.amount;
                                }
                            });
                            return [4 /*yield*/, this.matrix("N")];
                        case 3:
                            N = _b.sent();
                            _a = setup.perspective;
                            switch (_a) {
                                case "direct": return [3 /*break*/, 4];
                                case "intermediate": return [3 /*break*/, 7];
                                case "final": return [3 /*break*/, 9];
                            }
                            return [3 /*break*/, 10];
                        case 4: return [4 /*yield*/, this.matrix("L")];
                        case 5:
                            L = _b.sent();
                            s = L.multiplyVector(demand);
                            return [4 /*yield*/, this.matrix("D")];
                        case 6:
                            D = _b.sent();
                            data = D.scaleColumns(s).data;
                            return [3 /*break*/, 11];
                        case 7: return [4 /*yield*/, this.matrix("L")];
                        case 8:
                            L = _b.sent();
                            s = L.multiplyVector(demand);
                            data = N.scaleColumns(s).data;
                            return [3 /*break*/, 11];
                        case 9:
                            data = N.scaleColumns(demand).data;
                            return [3 /*break*/, 11];
                        case 10: throw new Error("unknown perspective " + setup.perspective);
                        case 11: return [2 /*return*/, {
                                data: data,
                                indicators: indicators.map(function (indicator) { return indicator.code; }),
                                sectors: sectors.map(function (sector) { return sector.id; }),
                                totals: N.multiplyVector(demand),
                            }];
                    }
                });
            });
        };
        /**
         * Get the total indicator result for the given demand vector and
         * perspective. If the demand vector is specified by an ID, results are
         * cached.
         */
        WebModel.prototype.getTotalResults = function (demand) {
            return __awaiter(this, void 0, void 0, function () {
                var setup, totals, demandVector, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!Array.isArray(demand)) return [3 /*break*/, 2];
                            setup = {
                                perspective: "final",
                                demand: demand,
                            };
                            return [4 /*yield*/, this.calculate(setup)];
                        case 1: return [2 /*return*/, (_a.sent()).totals];
                        case 2:
                            totals = this._totalResults[demand];
                            if (totals && totals.length > 0)
                                return [2 /*return*/, totals];
                            return [4 /*yield*/, this.demand(demand)];
                        case 3:
                            demandVector = _a.sent();
                            return [4 /*yield*/, this.calculate({
                                    perspective: "final",
                                    demand: demandVector,
                                })];
                        case 4:
                            result = _a.sent();
                            if (!result)
                                return [2 /*return*/, []];
                            this._totalResults[demand] = result.totals;
                            return [2 /*return*/, result.totals];
                    }
                });
            });
        };
        /**
         * Creates a sector aggregation in case of a multi-regional model. If this
         * is a single-region model, the sectors are just indexed by their code
         * (which should be unique then).
         */
        WebModel.prototype.singleRegionSectors = function () {
            return __awaiter(this, void 0, void 0, function () {
                var sectors, multiRegional, index, aggSectors, aggIndex, i, _i, sectors_2, s;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this._sectorAggregation) {
                                return [2 /*return*/, this._sectorAggregation];
                            }
                            return [4 /*yield*/, this.sectors()];
                        case 1:
                            sectors = _a.sent();
                            return [4 /*yield*/, this.isMultiRegional()];
                        case 2:
                            multiRegional = _a.sent();
                            // no aggregation in case of single-region models
                            if (!multiRegional) {
                                index = sectors.reduce(function (idx, sector) {
                                    idx[sector.code] = sector.index;
                                    return idx;
                                }, {});
                                this._sectorAggregation = {
                                    index: index,
                                    sectors: sectors
                                };
                                return [2 /*return*/, this._sectorAggregation];
                            }
                            aggSectors = [];
                            aggIndex = {};
                            i = 0;
                            for (_i = 0, sectors_2 = sectors; _i < sectors_2.length; _i++) {
                                s = sectors_2[_i];
                                if (aggIndex[s.code] === undefined) {
                                    aggIndex[s.code] = i;
                                    aggSectors[i] = {
                                        code: s.code,
                                        id: s.code,
                                        index: i,
                                        name: s.name,
                                        description: s.description,
                                    };
                                    i++;
                                }
                            }
                            this._sectorAggregation = {
                                index: aggIndex,
                                sectors: aggSectors,
                            };
                            return [2 /*return*/, this._sectorAggregation];
                    }
                });
            });
        };
        WebModel.prototype.sectorCrosswalk = function () {
            return __awaiter(this, void 0, void 0, function () {
                var text, lines, parseLine, header, mappings, i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this._sectorCrosswalk) {
                                return [2 /*return*/, this._sectorCrosswalk];
                            }
                            return [4 /*yield*/, this.api.getText("sectorcrosswalk.csv")];
                        case 1:
                            text = _a.sent();
                            lines = text.split(/\r?\n/);
                            if (lines.length == 0) {
                                return [2 /*return*/, { header: [], mappings: [] }];
                            }
                            parseLine = function (line) {
                                var feed = line.trim();
                                var parsed = [];
                                if (feed.length == 0) {
                                    return parsed;
                                }
                                var inQuotes = false;
                                var buffer = "";
                                for (var i = 0; i < feed.length; i++) {
                                    var c = feed.charAt(i);
                                    if (inQuotes) {
                                        if (c == '"') {
                                            inQuotes = false;
                                        }
                                        else {
                                            buffer += c;
                                        }
                                        continue;
                                    }
                                    if (c == '"') {
                                        inQuotes = true;
                                        continue;
                                    }
                                    if (c == ",") {
                                        parsed.push(buffer);
                                        buffer = "";
                                        continue;
                                    }
                                    buffer += c;
                                }
                                parsed.push(buffer);
                                return parsed;
                            };
                            header = parseLine(lines[0]);
                            mappings = [];
                            for (i = 1; i < lines.length; i++) {
                                mappings.push(parseLine(lines[i]));
                            }
                            this._sectorCrosswalk = { header: header, mappings: mappings };
                            return [2 /*return*/, this._sectorCrosswalk];
                    }
                });
            });
        };
        return WebModel;
    }());

    exports.CommodityVector = CommodityVector;
    exports.DemandVector = DemandVector;
    exports.Matrix = Matrix;
    exports.NaicsMap = NaicsMap;
    exports.WebApi = WebApi;
    exports.WebModel = WebModel;
    exports.max = max;
    exports.modelOf = modelOf;
    exports.ones = ones;
    exports.zeros = zeros;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

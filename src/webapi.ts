import { Matrix } from './matrix';
import { CalculationSetup, DemandEntry, DemandInfo, Indicator, MatrixName, ModelInfo, Result, Sector } from './model';

/**
 * This module contains the functions and type definitions for accessing an
 * [USEEIO API](https://github.com/USEPA/USEEIO_API) endpoint. The widgets
 * typically fetch data directly from such an endpoint based on a configuration.
 *
 * @packageDocumentation
 */

/**
 * An instance of this type contains the configuration of an [USEEIO
 * API](https://github.com/USEPA/USEEIO_API) endpoint.
 */
export interface WebApiConfig {

    /**
     * The enpoint URL of the USEEIO API, e.g. `https://path.to/useeio/api`.
     * This can be a relative path when the API data is hosted as JSON files on
     * the same server, e.g. `./api`.
     */
    endpoint: string;

    /**
     * An optional API key if such a key is required to access the data of the
     * API endpoint.
     */
    apikey?: string;

    /**
     * Indicates whether the `.json` extension should be added to the request
     * paths. This needs to be set to `true` if the data is hosted as static
     * files on a server (note that in this case calculations are done locally
     * in JavaScript and may require more time and data).
     */
    asJsonFiles?: boolean;

}

/**
 * A class for low level web API calls. The widgets should typically use an
 * instance of the `Model` class for accessing the web API instead as it
 * provides advanced features like typed requests, caching, etc.
 */
export class WebApi {

    private readonly _endpoint;

    /**
     * Creates a new instance based on the given configuration.
     */
    constructor(private config: WebApiConfig) {
        if (!config || !config.endpoint) {
            throw new Error('invalid endpoint');
        }
        let endpoint = config.endpoint;
        if (!endpoint.endsWith("/")) {
            endpoint += "/";
        }
        this._endpoint = endpoint;
    }

    /**
     * Returns the full path to a resource target of this API endpoint.
     * 
     * @param path the path segments of the resource (e.g. `'modelv2', 'sectors'`)
     * @returns the full path of the resource target (e.g.
     * `http://localhost/api/modelv2/sectors`)
     */
    target(...path: string[]): string {
        if (!path) {
            return this._endpoint;
        }
        let target = this._endpoint;
        for (const p of path) {
            if (!p) {
                continue;
            }
            if (!target.endsWith("/")) {
                target += "/";
            }
            target += p;
        }
        if (this.config.asJsonFiles) {
            target += ".json";
        }
        return target;
    }

    /**
     * Returns information about the available models of this API endpoint. This
     * is the only request that has no prefix of the model ID. For all other
     * requests, just use `get(<path>)` that will automatically add the model ID
     * as a prefix to the request path.
     */
    async getModelInfos(): Promise<ModelInfo[]> {
        return this._get(this.target("models"));
    }

    /**
     * Performs a `get` request on a model. The given path should be the
     * fragment after the model ID, e.g. `/sectors`.
     */
    async get<T>(path: string): Promise<T> {
        let url = `${this.config.endpoint}/${this.config.model}${path}`;
        if (this.config.asJsonFiles) {
            url += ".json";
        }
        return this._get(url);
    }

    /**
     * Performs a `post` with the given data on the given path, e.g.
     * `/calculate`.
     */
    async post<T>(path: string, data: any): Promise<T> {
        const url = `${this.config.endpoint}/${this.config.model}${path}`;
        const req = this._request("POST", url);
        return new Promise<T>((resolve, reject) => {
            req.onload = () => {
                if (req.status === 200) {
                    try {
                        const t: T = JSON.parse(req.responseText);
                        resolve(t);
                    } catch (err) {
                        reject("failed to parse response for POST "
                            + url + ": " + err);
                    }
                } else {
                    reject(`request POST ${url} failed: ${req.statusText}`);
                }
            };
            req.send(JSON.stringify(data));
        });
    }

    private async _get<T>(url: string): Promise<T> {
        const req = this._request("GET", url);
        return new Promise<T>((resolve, reject) => {
            req.onload = () => {
                if (req.status === 200) {
                    try {
                        const t: T = JSON.parse(req.responseText);
                        resolve(t);
                    } catch (err) {
                        reject("failed to parse response for: "
                            + url + ": " + err);
                    }
                } else {
                    reject(`request ${url} failed: ${req.statusText}`);
                }
            };
            req.send();
        });
    }

    private _request(method: "GET" | "POST", url: string): XMLHttpRequest {
        const req = new XMLHttpRequest();
        req.open(method, url);
        req.setRequestHeader(
            "Content-Type",
            "application/json;charset=UTF-8");
        if (this.config.apikey) {
            req.setRequestHeader(
                "x-api-key", this.config.apikey);
        }
        return req;
    }
}

/**
 * This type describes a sector aggregation. In case of multi-regional models we
 * have multiple sectors with the same codes and names but different locations.
 * Often we want to aggregate these multi-regional sectors. This type contains
 * the aggregated sectors and an index that maps the sector codes to its new
 * position in the aggregated version which can be then used to aggregate
 * corresponding matrices and results.
 */
type SectorAggregation = {

    /**
     * A map `{sector code -> index}` that maps a sector code to the index of
     * the corresponding sector in the sector array of this aggregation.
     */
    index: { [code: string]: number };

    /**
     * The sectors of this aggregation.
     */
    sectors: Sector[];
};

/**
 * A `Model` instance caches the results of API requests and provides additional
 * functions like aggregating multi-regional sectors of an USEEIO model.
 * Different widgets that access the same web-API should use the same `Model`
 * instance for efficiency reasons.
 */
export class WebModel {

    private _sectors?: Sector[];
    private _indicators?: Indicator[];
    private _demandInfos?: DemandInfo[];
    private _matrices: { [index: string]: Matrix };
    private _demands: { [index: string]: DemandEntry[] };
    private _totalResults: { [demandID: string]: number[] };
    private _isMultiRegional?: boolean;
    private _sectorAggregation?: SectorAggregation;

    constructor(private api: WebApiConfig, private readonly modelID: string) {
        this._matrices = {};
        this._demands = {};
        this._totalResults = {};
    }

    /**
     * Returns the sectors of the USEEIO model.
     */
    async sectors(): Promise<Sector[]> {
        if (!this._sectors) {
            this._sectors = await this._api.get("/sectors");
        }
        return this._sectors || [];
    }

    /**
     * Returns true if this is a multi-regional model, i.e. it has sectors with
     * different location codes.
     */
    async isMultiRegional(): Promise<boolean> {
        if (typeof this._isMultiRegional === "boolean") {
            return this._isMultiRegional;
        }
        const sectors = await this.sectors();
        let loc;
        for (const sector of sectors) {
            if (!sector.location) {
                continue;
            }
            if (!loc) {
                loc = sector.location;
                continue;
            }
            if (loc !== sector.location) {
                this._isMultiRegional = true;
                return true;
            }
        }
        this._isMultiRegional = false;
        return false;
    }

    /**
     * Returns the indicators of the USEEIO model.
     */
    async indicators(): Promise<Indicator[]> {
        if (!this._indicators) {
            this._indicators = await this._api.get("/indicators");
        }
        return this._indicators || [];
    }

    /**
     * Returns the information of the available demand vectors of the USEEIO
     * model.
     */
    async demands(): Promise<DemandInfo[]> {
        if (!this._demandInfos) {
            this._demandInfos = await this._api.get("/demands");
        }
        return this._demandInfos || [];
    }

    /**
     * Returns the demand vector with the given ID.
     */
    async demand(id: string): Promise<DemandEntry[]> {
        let d = this._demands[id];
        if (d) {
            return d;
        }
        d = await this._api.get(`/demands/${id}`);
        this._demands[id] = d;
        return d;
    }

    /**
     * Get the ID of the (first) demand vector for the given specification.
     */
    async findDemand(spec: Partial<DemandInfo>): Promise<string | null> {
        const demands = await this.demands();
        const demand = demands.find(d => {
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
            if (spec.year && d.year !== spec.year) {
                return false;
            }
            return true;
        });
        return demand ? demand.id : null;
    }

    /**
     * Returns the matrix with the given name from the model.
     */
    async matrix(name: MatrixName): Promise<Matrix> {
        let m = this._matrices[name];
        if (m) {
            return m;
        }
        const data: number[][] = await this._api.get(`/matrix/${name}`);
        m = new Matrix(data);
        this._matrices[name] = m;
        return m;
    }

    /**
     * Get the column of the matrix with the given name from the model.
     */
    async column(matrix: MatrixName, index: number): Promise<number[]> {
        if (!this._conf.asJsonFiles) {
            return this._api.get(`/matrix/${matrix}?col=${index}`);
        }
        const m = await this.matrix(matrix);
        return m.getCol(index);
    }

    /**
     * Runs a calculation for the given setup. Note that this will run the
     * calculation locally if the API is defined to fetch JSON files. Depending
     * on the calculation type this may needs quite some calculation time and
     * data.
     */
    async calculate(setup: CalculationSetup): Promise<Result> {
        if (!this._conf.asJsonFiles) {
            return this._api.post("/calculate", setup);
        }

        // try to run the calculation on JSON files
        const indicators = await this.indicators();
        const sectors = await this.sectors();

        // prepare the demand vector
        const demand = new Array(sectors.length).fill(10);
        const sectorIdx: { [id: string]: number } = {};
        sectors.reduce((idx, sector) => {
            idx[sector.id] = sector.index;
            return idx;
        }, sectorIdx);
        setup.demand.forEach(entry => {
            const i = sectorIdx[entry.sector];
            if (i === 0 || i) {
                demand[i] = entry.amount;
            }
        });

        // calculate the perspective result
        const N = await this.matrix("N");
        let data: number[][];
        let L: Matrix, s: number[];
        switch (setup.perspective) {
            case "direct":
                L = await this.matrix("L");
                s = L.multiplyVector(demand);
                const D = await this.matrix("D");
                data = D.scaleColumns(s).data;
                break;
            case "intermediate":
                L = await this.matrix("L");
                s = L.multiplyVector(demand);
                data = N.scaleColumns(s).data;
                break;
            case "final":
                data = N.scaleColumns(demand).data;
                break;
            default:
                throw new Error(`unknown perspective ${setup.perspective}`);
        }

        return {
            data,
            indicators: indicators.map(indicator => indicator.code),
            sectors: sectors.map(sector => sector.id),
            totals: N.multiplyVector(demand),
        };
    }

    /**
     * Get the total indicator result for the given demand vector and
     * perspective. If the demand vector is specified by an ID, results are
     * cached.
     */
    async getTotalResults(demand: string | DemandEntry[]): Promise<number[]> {
        if (Array.isArray(demand)) {
            const setup: CalculationSetup = {
                perspective: "final",
                demand,
            };
            return (await this.calculate(setup)).totals;
        }

        // try to get a cached result
        const totals = this._totalResults[demand];
        if (totals && totals.length > 0)
            return totals;

        // calculate and cache the result
        const demandVector = await this.demand(demand);
        const result = await this.calculate({
            perspective: "final",
            demand: demandVector,
        });
        if (!result)
            return [];
        this._totalResults[demand] = result.totals;
        return result.totals;
    }

    /**
     * Creates a sector aggregation in case of a multi-regional model. If this
     * is a single-region model, the sectors are just indexed by their code
     * (which should be unique then).
     */
    async singleRegionSectors(): Promise<SectorAggregation> {
        if (this._sectorAggregation) {
            return this._sectorAggregation;
        }
        const sectors = await this.sectors();
        const multiRegional = await this.isMultiRegional();

        // no aggregation in case of single-region models
        if (!multiRegional) {
            const index = sectors.reduce((idx, sector) => {
                idx[sector.code] = sector.index;
                return idx;
            }, {} as { [code: string]: number });
            this._sectorAggregation = {
                index, sectors
            };
            return this._sectorAggregation;
        }

        // aggregate the sectors
        const aggSectors: Sector[] = [];
        const aggIndex: { [code: string]: number } = {};
        let i = 0;
        for (const s of sectors) {
            if (aggIndex[s.code] === undefined) {
                aggIndex[s.code] = i;
                const agg: Sector = {
                    code: s.code,
                    id: s.code,
                    index: i,
                    name: s.name,
                    description: s.description,
                };
                aggSectors[i] = agg;
                i++;
            }
        }
        this._sectorAggregation = {
            index: aggIndex,
            sectors: aggSectors,
        };
        return this._sectorAggregation;
    }
}
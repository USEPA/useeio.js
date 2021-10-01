import {Matrix} from './matrix';
import {
  CalculationSetup,
  DemandEntry,
  DemandInfo,
  Indicator,
  MatrixName,
  ModelInfo,
  Result,
  Sector,
  SectorCrosswalk,
} from './model';

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
   * The ID of the input-output model that should be used (an API endpoint
   * can host multiple models which are identified by an unique ID).
   */
  model?: string;

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

export function modelOf(config: WebApiConfig & { model: string }) {
  const api = new WebApi(config);
  return new WebModel(api, config.model);
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
  constructor(private _config: WebApiConfig) {
    if (!_config || !_config.endpoint) {
      throw new Error('invalid endpoint');
    }
    let endpoint = _config.endpoint;
    if (!endpoint.endsWith("/")) {
      endpoint += "/";
    }
    this._endpoint = endpoint;
  }

  isJsonDump(): boolean {
    return this._config.asJsonFiles === true;
  }

  /**
   * Returns information about the available models of this API endpoint. This
   * is the only request that has no prefix of the model ID. For all other
   * requests, just use `get(<path>)` that will automatically add the model ID
   * as a prefix to the request path.
   */
  async getModelInfos(): Promise<ModelInfo[]> {
    return this.getJson("models");
  }

  /**
   * Performs a `get` request on this API endpoint for the given path and
   * returns the response as JSON.
   *
   * @param path the path segments of the request
   * @returns a promise of the requested resource
   */
  async getJson<T>(...path: string[]): Promise<T> {

    // construct the URL
    let url = this._target(...path);
    if (this._config.asJsonFiles) {
      if (!url.endsWith(".json")) {
        url += ".json";
      }
    }

    // perform the request
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

  async getText(...path: string[]): Promise<string> {
    let url = this._target(...path);
    const req = this._request("GET", url);
    return new Promise<string>((resolve, reject) => {
      req.onload = () => {
        if (req.status === 200) {
          try {
            resolve(req.responseText);
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

  /**
   * Performs a `post` with the given data on the given path, e.g.
   * `/calculate`.
   */
  async post<T>(data: any, ...path: string[]): Promise<T> {
    const url = this._target(...path);
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

  /**
   * Returns the full path to a resource target of this API endpoint.
   *
   * @param path the path segments of the resource (e.g. `'modelv2', 'sectors'`)
   * @returns the full path of the resource target (e.g.
   * `http://localhost/api/modelv2/sectors`)
   */
  private _target(...path: string[]): string {
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
    return target;
  }

  private _request(method: "GET" | "POST", url: string): XMLHttpRequest {
    const req = new XMLHttpRequest();
    req.open(method, url);
    req.setRequestHeader(
      "Content-Type",
      "application/json;charset=UTF-8");
    if (this._config.apikey) {
      req.setRequestHeader(
        "x-api-key", this._config.apikey);
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
  private readonly _matrices: { [index: string]: Matrix };
  private readonly _demands: { [index: string]: DemandEntry[] };
  private readonly _totalResults: { [demandID: string]: number[] };
  private _isMultiRegional?: boolean;
  private _sectorAggregation?: SectorAggregation;
  private _sectorCrosswalk?: SectorCrosswalk;

  constructor(private api: WebApi, private readonly modelId: string) {
    this._matrices = {};
    this._demands = {};
    this._totalResults = {};
  }

  id(): string {
    return this.modelId;
  }

  /**
   * Returns the sectors of the USEEIO model.
   */
  async sectors(): Promise<Sector[]> {
    if (!this._sectors) {
      this._sectors = await this.api.getJson(this.modelId, "sectors");
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
      this._indicators = await this.api.getJson(this.modelId, "indicators");
    }
    return this._indicators || [];
  }

  /**
   * Returns the information of the available demand vectors of the USEEIO
   * model.
   */
  async demands(): Promise<DemandInfo[]> {
    if (!this._demandInfos) {
      this._demandInfos = await this.api.getJson(this.modelId, "demands");
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
    d = await this.api.getJson(this.modelId, "demands", id);
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
      return !(spec.year && d.year !== spec.year);

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
    const data: number[][] = await this.api.getJson(this.modelId, "matrix", name);
    m = new Matrix(data);
    this._matrices[name] = m;
    return m;
  }

  /**
   * Get the column of the matrix with the given name from the model.
   */
  async column(matrix: MatrixName, index: number): Promise<number[]> {
    if (!this.api.isJsonDump()) {
      return this.api.getJson(this.modelId, "matrix", `${matrix}?col=${index}`);
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
    if (!this.api.isJsonDump()) {
      return this.api.post(setup, this.modelId, "calculate");
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
    return this._sectorAggregation;
  }

  async sectorCrosswalk(): Promise<SectorCrosswalk> {
    if (this._sectorCrosswalk) {
      return this._sectorCrosswalk;
    }
    const text = await this.api.getText("sectorcrosswalk.csv");
    const lines = text.split(/\r?\n/);
    if (lines.length == 0) {
      return {header: [], mappings: []}
    }

    const parseLine = (line: string): string[] => {
      const feed = line.trim();
      const parsed: string[] = [];
      if (feed.length == 0) {
        return parsed;
      }
      let inQuotes = false;
      let buffer = "";
      for (let i = 0; i < feed.length; i++) {
        const c = feed.charAt(i);
        if (inQuotes) {
          if (c == '"') {
            inQuotes = false;
          } else {
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
          continue
        }
        buffer += c;
      }
      parsed.push(buffer);
      return parsed;
    };

    const header = parseLine(lines[0]);
    const mappings: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      mappings.push(parseLine(lines[i]));
    }
    this._sectorCrosswalk = {header, mappings};
    return this._sectorCrosswalk;
  }

}
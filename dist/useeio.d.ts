declare module "matrix" {
    /**
     * Provides utility functions for working with matrix data.
     */
    export class Matrix {
        readonly data: number[][];
        /**
         * Creates a new dense `m * n` matrix with all entries set to `0`.
         *
         * @param rows The number of rows `m`.
         * @param cols The number of columns `n`.
         */
        static zeros(rows: number, cols: number): Matrix;
        /**
         * The number of columns of this matrix.
         */
        readonly cols: number;
        /**
         * The number of rows of this matrix.
         */
        readonly rows: number;
        /**
         * Creates a new matrix instance from the given data.
         */
        constructor(data: number[][]);
        /**
         * Get the element at the given row and column: `A[i, j]`.
         */
        get(row: number, col: number): number;
        /**
         * Get the row with the given index `i`: `A[i,:]`.
         */
        getRow(row: number): number[];
        /**
         * Get the column with the given index `j`: `A[:,j]`.
         */
        getCol(col: number): number[];
        /**
         * Set the entry at the given row and column to the given value.
         */
        set(row: number, col: number, val: number): void;
        /**
         * Scales the columns with the given vector `f`: `A * diag(f)`.
         */
        scaleColumns(f: number[]): Matrix;
        /**
         * Scales the rows with the given vector `f`: `diag(f) * A`.
         */
        scaleRows(f: number[]): Matrix;
        /**
         * Performs a matrix-vector-multiplication with the given `v`: `A * v`.
         */
        multiplyVector(v: number[]): number[];
    }
}
declare module "model" {
    /**
     * An enumeration of the valid indicator groups of the USEEIO API.
     */
    export enum IndicatorGroup {
        IMPACT_POTENTIAL = "Impact Potential",
        RESOURCE_USE = "Resource Use",
        WASTE_GENERATED = "Waste Generated",
        ECONOMIC_SOCIAL = "Economic & Social",
        CHEMICAL_RELEASES = "Chemical Releases"
    }
    /**
     * An environmental, economic, or social indicator of the corresponding USEEIO
     * model.
     */
    export interface Indicator {
        /**
         * The ID of the indicator.
         */
        id: string;
        /**
         * The matrix index of the indicator in the corresponding USEEIO model. This
         * is the 0-based row or column of this indicator in the respective matrices
         * of the model.
         */
        index: number;
        /**
         * The full indicator name, e.g. `Acidification potential`.
         */
        name: string;
        /**
         * A short indicator code, e.g. `ACID`.
         */
        code: string;
        /**
         * The unit in which results of this indicator are given.
         */
        unit: string;
        /**
         * The indicator group.
         */
        group: IndicatorGroup;
        /**
         * A simplefied name of the indicator.
         */
        simplename: string;
        /**
         * A simple name for the indicator unit.
         */
        simpleunit: string;
    }
    /**
     * Contains some meta-data of an USEEIO model.
     */
    export interface ModelInfo {
        /**
         * The unique ID of the USEEIO model that is used in the request paths for
         * the web API.
         */
        id: string;
        /**
         * A descriptive name of the model.
         */
        name: string;
        /**
         * The regional scope of the model.
         */
        location?: string;
        /**
         * An optional model description.
         */
        description?: string;
        hash?: string;
        sectorschema?: string;
    }
    /**
     * Describes an industry sector in an USEEIO model.
     */
    export interface Sector {
        /**
         * The unique ID of the sector.
         */
        id: string;
        /**
         * The matrix index of the sector in the corresponding USEEIO model. This
         * is the 0-based row or column of this sector in the respective matrices
         * of the model.
         */
        index: number;
        /**
         * The sector name.
         */
        name: string;
        /**
         * The classification code of the sector.
         */
        code: string;
        /**
         * Indicates the location of the sector. In a multi-regional model there
         * can be multiple sectors with the same code but different locations.
         */
        location?: string;
        /**
         * An optional description of the sector.
         */
        description?: string;
    }
    /**
     * Describes the type of a demand vector. This is equivalent to the analysis
     * type in the SMM tools. A demand vector of the type "Consumption" includes the
     * final demand of households, government, etc. wheras a demand vector of the
     * type "Production" focuses on the production of goods and services.
     */
    export type DemandType = "Consumption" | "Production";
    /**
     * DemandInfo contains the meta data of a standard demand vector. The request
     * `<endpoint>/<model id>/demands` returns a list of `DemandInfo` objects.
     */
    export interface DemandInfo {
        /**
         * The ID of the demand vector that is used for the API request.
         */
        id: string;
        /**
         * The year for which the demand vector is valid.
         */
        year: number;
        /**
         * The regional scope of the demand vector.
         */
        location: string;
        /**
         * The general scope of the demand vector (e.g. `Full system`, `Food
         * system`, ...).
         */
        system: string;
        /**
         * The type of the demand vector.
         */
        type: DemandType;
    }
    /**
     * DemandEntry describes an entry in a specific demand vector. The request
     * `<endpoint>/<model id>/demands/<demand id>` returns the demand vector with
     * the given ID as list of such entry objects.
     */
    export interface DemandEntry {
        sector: string;
        amount: number;
    }
    /**
     * A demand vector maps sector IDs to their demand values.
     */
    export class DemandVector {
        private map;
        constructor(entries: DemandEntry[]);
        get(sectorId: string): number;
    }
    /**
     * Describes the perspective of a calculation result:
     *
     * * `direct`: direct contribution results: `D * diag(s)`
     * * `intermediate`: direct + upstream results at each point of the supply chain
     *    (without loop correction): `D * L * diag(s)`
     * * `final`: final results related to the demand vector: `D * L * diag(d)`
     */
    export type ResultPerspective = "direct" | "intermediate" | "final";
    /**
     * The setup of a calculation request.
     */
    export interface CalculationSetup {
        /**
         * The desired result perspective.
         */
        perspective: ResultPerspective;
        /**
         * The demand vector.
         */
        demand: DemandEntry[];
    }
    /**
     * The calculation result.
     */
    export interface Result {
        /**
         * The indicator IDs in matrix order.
         */
        indicators: string[];
        /**
         * The sector IDs in matrix order.
         */
        sectors: string[];
        /**
         * An indicator * sector matrix with the results of the requested
         * perspective (direct, intermediate, or final results).
         */
        data: number[][];
        /**
         * The total result (which is the same for each result perspective).
         */
        totals: number[];
    }
    /**
     * The currently supported matrices, see:
     * https://github.com/USEPA/USEEIO_API/blob/master/doc/data_format.md
     */
    export type MatrixName = "A" | "A_d" | "B" | "C" | "D" | "L" | "L_d" | "M" | "M_d" | "N" | "N_d" | "Phi" | "q" | "Rho" | "U" | "U_d" | "V" | "x";
    /**
     * The sector crosswalk contains mappings between different sector
     * classification schemes.
     */
    export interface SectorCrosswalk {
        header: string[];
        mappings: string[][];
    }
    export enum Region {
        DOMESTIC = "DOMESTIC",
        NON_DOMESTIC = "NON_DOMESTIC",
        ALL = "ALL"
    }
}
declare module "webapi" {
    import { Matrix } from "matrix";
    import { CalculationSetup, DemandEntry, DemandInfo, Indicator, MatrixName, ModelInfo, Result, Sector, SectorCrosswalk } from "model";
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
    export function modelOf(config: WebApiConfig & {
        model: string;
    }): WebModel;
    /**
     * A class for low level web API calls. The widgets should typically use an
     * instance of the `Model` class for accessing the web API instead as it
     * provides advanced features like typed requests, caching, etc.
     */
    export class WebApi {
        private _config;
        private readonly _endpoint;
        /**
         * Creates a new instance based on the given configuration.
         */
        constructor(_config: WebApiConfig);
        isJsonDump(): boolean;
        /**
         * Returns information about the available models of this API endpoint. This
         * is the only request that has no prefix of the model ID. For all other
         * requests, just use `get(<path>)` that will automatically add the model ID
         * as a prefix to the request path.
         */
        getModelInfos(): Promise<ModelInfo[]>;
        /**
         * Performs a `get` request on this API endpoint for the given path and
         * returns the response as JSON.
         *
         * @param path the path segments of the request
         * @returns a promise of the requested resource
         */
        getJson<T>(...path: string[]): Promise<T>;
        getText(...path: string[]): Promise<string>;
        /**
         * Performs a `post` with the given data on the given path, e.g.
         * `/calculate`.
         */
        post<T>(data: any, ...path: string[]): Promise<T>;
        /**
         * Returns the full path to a resource target of this API endpoint.
         *
         * @param path the path segments of the resource (e.g. `'modelv2', 'sectors'`)
         * @returns the full path of the resource target (e.g.
         * `http://localhost/api/modelv2/sectors`)
         */
        private _target;
        private _request;
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
        index: {
            [code: string]: number;
        };
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
        private api;
        private readonly modelId;
        private _sectors?;
        private _indicators?;
        private _demandInfos?;
        private readonly _matrices;
        private readonly _demands;
        private readonly _totalResults;
        private _isMultiRegional?;
        private _sectorAggregation?;
        private _sectorCrosswalk?;
        private _info?;
        constructor(api: WebApi, modelId: string);
        id(): string;
        info(): Promise<ModelInfo | undefined>;
        /**
         * Returns the sectors of the USEEIO model.
         */
        sectors(): Promise<Sector[]>;
        /**
         * Returns true if this is a multi-regional model, i.e. it has sectors with
         * different location codes.
         */
        isMultiRegional(): Promise<boolean>;
        /**
         * Returns the indicators of the USEEIO model.
         */
        indicators(): Promise<Indicator[]>;
        /**
         * Returns the information of the available demand vectors of the USEEIO
         * model.
         */
        demands(): Promise<DemandInfo[]>;
        /**
         * Returns the demand vector with the given ID.
         */
        demand(id: string): Promise<DemandEntry[]>;
        /**
         * Get the ID of the (first) demand vector for the given specification.
         */
        findDemand(spec: Partial<DemandInfo>): Promise<string | null>;
        /**
         * Returns the matrix with the given name from the model.
         */
        matrix(name: MatrixName): Promise<Matrix>;
        /**
         * Get the column of the matrix with the given name from the model.
         */
        column(matrix: MatrixName, index: number): Promise<number[]>;
        /**
         * Runs a calculation for the given setup. Note that this will run the
         * calculation locally if the API is defined to fetch JSON files. Depending
         * on the calculation type this may needs quite some calculation time and
         * data.
         */
        calculate(setup: CalculationSetup): Promise<Result>;
        /**
         * Get the total indicator result for the given demand vector and
         * perspective. If the demand vector is specified by an ID, results are
         * cached.
         */
        getTotalResults(demand: string | DemandEntry[]): Promise<number[]>;
        /**
         * Creates a sector aggregation in case of a multi-regional model. If this
         * is a single-region model, the sectors are just indexed by their code
         * (which should be unique then).
         */
        singleRegionSectors(): Promise<SectorAggregation>;
        sectorCrosswalk(): Promise<SectorCrosswalk>;
    }
}
declare module "calc" {
    import { Matrix } from "matrix";
    import { WebModel } from "webapi";
    export function zeros(len: number): number[];
    export function ones(len: number): number[];
    export function max(xs: number[]): number;
    export class CommodityVector {
        static directImpactsOf(model: WebModel, vector: Matrix | number[]): Promise<number[]>;
        static directRequirementsOf(model: WebModel, vector: Matrix | number[]): Promise<number[]>;
        static directDownstreamsOf(model: WebModel, vector: Matrix | number[]): Promise<number[]>;
    }
}
declare module "sectors" {
    import { WebModel } from "webapi";
    export class NaicsMap {
        private readonly _map;
        private constructor();
        static of(model: WebModel): Promise<NaicsMap>;
        /**
         * Maps the given NAICS codes to a list of corresponding BEA
         * codes based on the underlying model-schema of this map.
         *
         * @param naics the NAICS codes that should be mapped.
         */
        toBea(naics: string | string[]): string[];
    }
}
declare module "useeio" {
    export * from "calc";
    export * from "matrix";
    export * from "model";
    export * from "sectors";
    export * from "webapi";
}

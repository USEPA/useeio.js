/**
 * An enumeration of the valid indicator groups of the USEEIO API.
 */
export enum IndicatorGroup {
  IMPACT_POTENTIAL = "Impact Potential",
  RESOURCE_USE = "Resource Use",
  WASTE_GENERATED = "Waste Generated",
  ECONOMIC_SOCIAL = "Economic & Social",
  CHEMICAL_RELEASES = "Chemical Releases",
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
 * Describes the perspective of a calculation result:
 *
 * * `direct`: direct contribution results: `D * diag(s)`
 * * `intermediate`: direct + upstream results at each point of the supply chain
 *    (without loop correction): `D * L * diag(s)`
 * * `final`: final results related to the demand vector: `D * L * diag(d)`
 */
export type ResultPerspective =
  "direct"
  | "intermediate"
  | "final";

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
export type MatrixName =
  "A"
  | "A_d"
  | "B"
  | "C"
  | "D"
  | "L"
  | "L_d"
  | "M"
  | "M_d"
  | "N"
  | "N_d"
  | "Phi"
  | "q"
  | "Rho"
  | "U"
  | "U_d"
  | "V"
  | "x";

/**
 * The sector crosswalk contains mappings between different sector
 * classification schemes.
 */
export interface SectorCrosswalk {
  header: string[];
  mappings: string[][];
}
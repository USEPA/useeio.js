import {WebModel} from "./webapi";

export class NaicsMap {

  private constructor(private readonly _map: { [key: string]: string[] }) {
  }

  static async of(model: WebModel): Promise<NaicsMap> {

    // load the sector crosswalk from the API
    const crosswalk = await model.sectorCrosswalk();
    if (!crosswalk
      || !crosswalk.header
      || crosswalk.header.length === 0
      || !crosswalk.mappings
      || crosswalk.mappings.length === 0) {
      return new NaicsMap({});
    }

    // select the columns for the mapping
    const modelInfo = await model.info();
    const modelSchema = modelInfo?.sectorschema?.toLowerCase();
    let naicsCol = -1;
    let modelCol = -1;
    for (let i = 0; i < crosswalk.header.length; i++) {
      if (naicsCol >= 0 && modelCol >= 0) {
        break;
      }
      const header = crosswalk.header[i].toLowerCase();
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
      return new NaicsMap({});
    }

    // create the mapping
    const map: { [key: string]: string[] } = {};
    const minSize = Math.max(naicsCol, modelCol) + 1;
    for (const mapping of crosswalk.mappings) {
      if (mapping.length < minSize) {
        continue;
      }
      const naicsCode = mapping[naicsCol].trim();
      const beaCode = mapping[modelCol].trim();
      if (naicsCode.length == 0 || beaCode.length == 0) {
        continue;
      }

      const mapped = map[naicsCode];
      if (!mapped) {
        map[naicsCode] = [beaCode];
      } else {
        mapped.push(beaCode);
      }
    }
    return new NaicsMap(map);
  }

  /**
   * Maps the given NAICS codes to a list of corresponding BEA
   * codes based on the underlying model-schema of this map.
   *
   * @param naics the NAICS codes that should be mapped.
   */
  toBea(naics: string | string[]): string[] {
    if (!naics) {
      return [];
    }
    const naicsCodes = naics instanceof Array
      ? naics
      : [naics];
    const bea: { [key: string]: boolean } = {};
    for (const naic of naicsCodes) {
      const mapped = this._map[naic];
      if (mapped) {
        for (const code of mapped) {
          bea[code] = true;
        }
      }
    }
    return Object.keys(bea);
  }

}
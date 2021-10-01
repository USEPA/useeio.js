import {WebModel} from "./webapi";

export class NaicsMap {

  private constructor(private readonly _map: {[key: string]: string[]}) {
  }

  static async of(model: WebModel): Promise<NaicsMap> {
    const map = {};
    const crosswalk = await model.sectorCrosswalk();

    return new NaicsMap(map);
  }

}
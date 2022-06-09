import { Sector } from "./model";
import { WebModel } from "./webapi"

export class SectorAnalysis {

  constructor(
    readonly model: WebModel,
    readonly sector: Sector,
    readonly normalizationTotals: number[]) {
  }

  /**
   * Creates a sector analysis based on the calculation result of a specified
   * demand vector.
   * 
   * @param model the IO model
   * @param sector the IO sector of the analysis
   * @param demandId the ID of the demand vector for the analysis
   */
  static async of(model: WebModel, sector: Sector, demandId: string):
    Promise<SectorAnalysis> {
    const demand = await model.demand(demandId);
    const result = await model.calculate({
      perspective: "direct",
      demand,
    });
    return new SectorAnalysis(model, sector, result.totals);
  }

  async getEnvironmentalProfile(directOnly = false): Promise<number[]> {
    const profile = await (directOnly
      ? this.model.column("D", this.sector.index)
      : this.model.column("N", this.sector.index));
    for (let i = 0; i < profile.length; i++) {
      profile[i] /= this.normalizationTotals[i];
    }
    return profile;
  }
}
import { zeros } from "./calc";
import { Sector } from "./model";
import { WebModel } from "./webapi"

/**
 * Contains the indicator results related to one USD output of a sector for
 * different scopes. 
 */
export interface ScopePartition {
  direct: number[];
  upstreamDomestic: number[];
  upstreamNonDomestic: number[];
  upstreamTotal: number[];
  total: number[];
}

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

  async getImpactsByScope(): Promise<ScopePartition> {
    const total = await this.model.column("N", this.sector.index);
    const direct = await this.model.column("D", this.sector.index);
    const domesticTotal = await this.model.column("N_d", this.sector.index);

    const upstreamTotal = zeros(total.length);
    const upstreamDomestic = zeros(total.length);
    const upstreamNonDomestic = zeros(total.length);

    for (let i = 0; i < total.length; i++) {
      upstreamTotal[i] = total[i] - direct[i];
      upstreamDomestic[i] = domesticTotal[i] - direct[i];
      upstreamNonDomestic[i] = upstreamTotal[i] - upstreamDomestic[i];
    }

    return {
      direct,
      total,
      upstreamTotal,
      upstreamDomestic,
      upstreamNonDomestic,
    }
  }
}
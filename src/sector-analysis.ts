import { zeros } from "./calc";
import { Indicator, Tensor, Sector } from "./model";
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
      ? this.model.column(Tensor.D, this.sector.index)
      : this.model.column(Tensor.N, this.sector.index));
    for (let i = 0; i < profile.length; i++) {
      profile[i] /= this.normalizationTotals[i];
    }
    return profile;
  }

  async getImpactsByScope(): Promise<ScopePartition> {
    const total = await this.model.column(Tensor.N, this.sector.index);
    const direct = await this.model.column(Tensor.D, this.sector.index);
    const domesticTotal = await this.model.column(Tensor.N_d, this.sector.index);

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

  /**
   * Get the impacts of the direct purchases of the analyzed sector. Returned is
   * an array in sector-form with a result for each sector in the model. The
   * results are based on 1 USD of output of the analyzed sector. When this
   * function is called with multiple indicators a normalized single score is
   * calculated.
   */
  async getPurchaseImpacts(ix: Indicator | Indicator[]): Promise<number[]> {
    const purchases = await this.model.column(Tensor.A, this.sector.index);
    if (!Array.isArray(ix)) {
      // simply scale the indicator row of N by purchase amounts 
      const impacts = await this.model.row(Tensor.N, ix.index);
      return impacts.map((val, idx) => val * purchases[idx]);
    } else {
      // calculate single scores for multiple indicators
      const results = zeros(purchases.length);
      const N = await this.model.matrix(Tensor.N);
      for (let j = 0; j < purchases.length; j++) {
        const norm = new EuclideanNormalizer(this.normalizationTotals);
        const p = purchases[j];
        for (const indicator of ix) {
          norm.add(indicator.index, p * N.get(indicator.index, j));
        }
        results[j] = norm.finish();
      }
      return results;
    }
  }

  async getSupplyChainImpacts(ix: Indicator | Indicator[]): Promise<number[]> {
    const scaling = await this.model.column(Tensor.L, this.sector.index);
    if (!Array.isArray(ix)) {
      // simply scale the indicator row of D by the scaling vector
      const impacts = await this.model.row(Tensor.D, ix.index);
      return impacts.map((val, idx) => val * scaling[idx]);
    } else {
       // calculate single scores for multiple indicators
       const results = zeros(scaling.length);
       const D = await this.model.matrix(Tensor.D);
       for (let j = 0; j < scaling.length; j++) {
         const norm = new EuclideanNormalizer(this.normalizationTotals);
         const s = scaling[j];
         for (const indicator of ix) {
           norm.add(indicator.index, s * D.get(indicator.index, j));
         }
         results[j] = norm.finish();
       }
       return results;
    }
  }
}

abstract class Normalizer {
  protected value = 0;

  constructor(readonly totals: number[]) {
  }

  abstract add(idx: number, next: number): void;

  abstract finish(): number;
}

class SimpleNormalizer extends Normalizer {

  add(idx: number, next: number) {
    if (next === 0) {
      return;
    }
    const total = this.totals[idx];
    if (total === 0) {
      return;
    }
    this.value += next / total;
  }

  finish(): number {
    return this.value;
  }
}

class EuclideanNormalizer extends Normalizer {

  add(idx: number, next: number) {
    if (next === 0) {
      return;
    }
    const total = this.totals[idx];
    if (total === 0) {
      return;
    }
    const v = Math.pow(next / total, 2);
    if (next > 0) {
      this.value += v;
    } else {
      this.value -= v;
    }
  }

  finish(): number {
    return this.value > 0
      ? Math.sqrt(this.value)
      : 0;
  }
}
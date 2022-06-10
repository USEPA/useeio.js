import { Matrix } from "./matrix";
import { Tensor } from "./model";
import { WebModel } from "./webapi";

export function zeros(len: number): number[] {
  return new Array(len).fill(0);
}

export function ones(len: number): number[] {
  return new Array(len).fill(1);
}

export function max(xs: number[]): number {
  if (!xs || xs.length === 0) {
    return 0;
  }
  return xs.reduce((maxval, x) => Math.max(maxval, x));
}

export class CommodityVector {

  static async directImpactsOf(
    model: WebModel, vector: Matrix | number[]): Promise<number[]> {
    const v = vector instanceof Matrix
      ? vector.getCol(0)
      : vector;
    const D = await model.matrix(Tensor.D);
    return D.multiplyVector(v);
  }

  static async directRequirementsOf(
    model: WebModel, vector: Matrix | number[]): Promise<number[]> {
    const v = vector instanceof Matrix
      ? vector.getCol(0)
      : vector;
    const A = await model.matrix(Tensor.A);
    return A.multiplyVector(v);
  }

  static async directDownstreamsOf(
    model: WebModel, vector: Matrix | number[]): Promise<number[]> {
    const v = vector instanceof Matrix
      ? vector.getCol(0)
      : vector;
    const A = await model.matrix(Tensor.A);
    const n = Math.min(A.cols, v.length);
    const d = zeros(n);
    for (const row of A.data) {
      for (let j = 0; j < n; j++) {
        d[j] += row[j] * v[j];
      }
    }
    return d;
  }

}

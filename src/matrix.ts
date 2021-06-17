/**
 * Provides utility functions for working with matrix data.
 */
export class Matrix {

    /**
     * Creates a new dense `m * n` matrix with all entries set to `0`.
     *
     * @param rows The number of rows `m`.
     * @param cols The number of columns `n`.
     */
    public static zeros(rows: number, cols: number): Matrix {
        const data = new Array<number[]>(rows);
        for (let row = 0; row < rows; row++) {
            const v = new Array<number>(cols);
            for (let col = 0; col < cols; col++) {
                v[col] = 0;
            }
            data[row] = v;
        }
        return new Matrix(data);
    }

    /**
     * The number of columns of this matrix.
     */
    public readonly cols: number;

    /**
     * The number of rows of this matrix.
     */
    public readonly rows: number;

    /**
     * Creates a new matrix instance from the given data.
     */
    constructor(public readonly data: number[][]) {
        this.rows = data.length;
        this.cols = this.rows === 0 ? 0 : data[0].length;
    }

    /**
     * Get the element at the given row and column: `A[i, j]`.
     */
    public get(row: number, col: number): number {
        return this.data[row][col];
    }

    /**
     * Get the row with the given index `i`: `A[i,:]`.
     */
    public getRow(row: number): number[] {
        return this.data[row].slice();
    }

    /**
     * Get the column with the given index `j`: `A[:,j]`.
     */
    public getCol(col: number): number[] {
        const vals = new Array<number>(this.rows);
        for (let row = 0; row < this.rows; row++) {
            vals[row] = this.get(row, col);
        }
        return vals;
    }

    /**
     * Set the entry at the given row and column to the given value.
     */
    public set(row: number, col: number, val: number) {
        this.data[row][col] = val;
    }

    /**
     * Scales the columns with the given vector `f`: `A * diag(f)`.
     */
    public scaleColumns(f: number[]): Matrix {
        const m = Matrix.zeros(this.rows, this.cols);
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const v = this.get(row, col) * f[col];
                m.set(row, col, v);
            }
        }
        return m;
    }

    /**
     * Scales the rows with the given vector `f`: `diag(f) * A`.
     */
    public scaleRows(f: number[]): Matrix {
        const m = Matrix.zeros(this.rows, this.cols);
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const v = this.get(row, col) * f[row];
                m.set(row, col, v);
            }
        }
        return m;
    }

    /**
     * Performs a matrix-vector-multiplication with the given `v`: `A * v`.
     */
    public multiplyVector(v: number[]): number[] {
        return this.data.map(row => row.reduce((sum, x, j) => {
            const vj = v[j];
            if (x && vj) {
                return sum + (x * vj);
            }
            return sum;
        }, 0));
    }
}

/** @typedef {import("../dist/webapi").WebApi} WebApi */
/** @typedef {import("../dist/webapi").WebModel} WebModel */

/** @type WebApi */
var webApi = webApi;

describe("matrix requests", () => {

  it("WebModel.matrix", async () => {
    await eachModel(async model => {
      const matrices = [
        "A",
        "B",
        "C",
        "D",
        "L",
        "N"
      ];
      console.log(`load matrices from model ${model.id()}`);
      for (const m of matrices) {
        const matrix = await model.matrix(m);
        chai.assert.isOk(matrix);
        chai.assert.isTrue(matrix.cols > 0);
        chai.assert.isTrue(matrix.rows > 0);
        console.log(`  - ${matrix.rows} x ${matrix.cols} matrix ${m}`);
      }
    });
  });

});


/**
 * @param {(model: WebModel) => void} fn the model callback
 */
 async function eachModel(fn) {
  for (const info of await webApi.getModelInfos()) {
    /** @type WebModel */
    const model = new useeio.WebModel(webApi, info.id);
    fn(model);
  }
}
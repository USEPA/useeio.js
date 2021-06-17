/** @typedef {import("../dist/webapi").WebApi} WebApi */
/** @typedef {import("../dist/webapi").WebModel} WebModel */

/** @type WebApi */
var webApi = webApi;

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

describe("model requests", () => {

  it("WebApi.getModelInfos", async () => {
    const modelInfos = await webApi.getModelInfos();
    chai.assert.isTrue(modelInfos.length > 0);
    console.log(`fetched ${modelInfos.length} model infos:`);
    for (const info of modelInfos) {
      assert.isOk(info.id);
      assert.isOk(info.name);
      console.log(`  - ${info.name}`);
    }
  });

  it("WebModel.getSectors", async () => {
    for (const info of await webApi.getModelInfos()) {
      /** @type WebModel */
      const model = new useeio.WebModel(webApi, info.id);
      const sectors = await model.sectors();
      assert.isTrue(sectors.length > 0);
      console.log(`fetched ${sectors.length} sectors from model ${info.id}`)
      let i = 0;
      for (const sector of sectors) {
        console.log(`  - ${sector.code} - ${sector.name}`)
        i++;
        if (i > 4) {
          console.log(`  - ...`);
          break;
        }
      }
    }
  });

  it("WebModel.getIndicators", async () => {
    await eachModel(async model => {
      const indicators = await model.indicators();
      const n = indicators.length;
      assert.isTrue(n > 0);
      console.log(`fetched ${n} indicators from model ${model.id()}`);
      let i = 0;
      for (const indicator of indicators) {
        console.log(`  - ${indicator.code} - ${indicator.name}`);
        i++;
        if (i > 4) {
          console.log(`  - ...`);
          break;
        }
      }
    })
  });
});


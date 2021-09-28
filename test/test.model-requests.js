/// <reference types="../dist/USEEIO" />
/** @type {import('USEEIO')} */
var USEEIO = USEEIO;
/** @type {import('USEEIO').WebApi} */
var webApi = webApi;


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

  it("WebModel.sectors", async () => {
    await eachModel(async model => {
      const sectors = await model.sectors();
      assert.isTrue(sectors.length > 0);
      console.log(`fetched ${sectors.length} sectors from model ${model.id()}`)
      printFirstOf(sectors, sector => {
        chai.assert.isOk(sector.id);
        chai.assert.isOk(sector.code);
        chai.assert.isOk(sector.name);
        return `${sector.code} - ${sector.name}`;
      });
    });
  });

  it("WebModel.indicators", async () => {
    await eachModel(async model => {
      const indicators = await model.indicators();
      const n = indicators.length;
      assert.isTrue(n > 0);
      console.log(`fetched ${n} indicators from model ${model.id()}`);
      printFirstOf(indicators, indicator => {
        chai.assert.isOk(indicator.id);
        chai.assert.isOk(indicator.code);
        chai.assert.isOk(indicator.name);
        return `${indicator.code} - ${indicator.name}`;
      });
    });
  });

  it("WebModel.demands", async () => {
    await eachModel(async model => {
      const demandInfos = await model.demands();
      const n = demandInfos.length;
      assert.isTrue(n > 0);
      console.log(`fetched ${n} demand infos from model ${model.id()}`)
      printFirstOf(demandInfos, info => {
        chai.assert.isOk(info.id);
        return info.id;
      });
    });
  });

  it("WebModel.demand", async () => {
    await eachModel(async model => {
      const demandInfos = await model.demands();
      for (const info of demandInfos) {
        var demand = await model.demand(info.id);
        chai.assert.isTrue(demand.length > 0);
        for (const entry of demand) {
          chai.assert.isString(entry.sector);
          chai.assert.isNumber(entry.amount);
        }
      }
      console.log(`checked ${demandInfos.length} demand vectors in` +
        ` model ${model.id()}`);
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

/**
 * @param {T[]} xs the array
 * @param {(x: T) => string} fn the function that maps an element to a string
 * @template T
 */
function printFirstOf(xs, fn) {
  let i = 0;
  for (const x of xs) {
    console.log(`  - ${fn(x)}`);
    i++;
    if (i > 4 && i < xs.length) {
      console.log(`  - ..`);
      break;
    }
  }
}
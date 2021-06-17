describe("basic API requests", () => {

  it("get model infos", async () => {
    const modelInfos = await webApi.getModelInfos();
    chai.assert.isTrue(modelInfos.length > 0);
  });

});

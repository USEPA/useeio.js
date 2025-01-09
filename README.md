# useeio.js

The useeio.js repo contains a JavaScript client API for the [USEEIO
API](https://github.com/USEPA/USEEIO_API) that runs in the browser. It is written in TypeScript and uses [rollup.js](https://rollupjs.org) with the [typescript2 plugin](https://www.npmjs.com/package/rollup-plugin-typescript2) to create a single UMD bundle; [terser](https://terser.org/) is then used to create a minified bundle.

## Impact Reports

[Javascript reports for the US EPA's 50 state models](https://model.earth/useeio.js/footprint) reside in the [model.earth fork](https://github.com/modelearth/useeio.js) of the useeio.js repo.

You can contribute to the 50 state javascript reports without running building commands.

## Build Comands

These are not necessary to contribute [50 state javascript report](https://model.earth/useeio.js/footprint) updates.

When new model versions are published by US EPA, it may be necessary to build useeio.js and useeio-widgets to deploy updates for the [USEEIO React Widgets](https://model.earth/io/charts/).

The useeio-widgets build pulls the bundle (dist/useeio.js or dist/useeio.min.js) from the useeio.js repo. 
The dependency resides in useeio-widgets/package.json. You can use either of these:

"useeio": "github:USEPA/useeio.js"  
"useeio": "github:modelearth/useeio.js"

To build useeio.js, run the following in the useeio.js folder.

	npm install
	npm run build

If you'd like, you can generate a minified file with the following command.  
You may want to avoid minifying so you can see what lines any issues occur on.

	npm run build:minjs

## Install option

`useeio.js` is not on `npmjs.org`. Instead, you can install it from Github directly:

	npm install git+https://github.com/USEPA/useeio.js.git

As stated above, the useeio-widgets package.json contains a useeio.js dependency:

	"useeio": "github:USEPA/useeio.js"

## Dump API data locally
This project contains a script for downloading a JSON dump of an USEEIO-API instance:

	node scripts/dumpjson.js --endpoint {URL}

Where `{URL}` is some API endpoint. Formerly https://smmtool.app.cloud.gov/api.
If the API requires a key, append --apikey [Add API key here]
You can [register for an API key](https://github.com/USEPA/USEEIO_API/wiki/Use-the-API) via the US EPA's contact link.


The 50 state json files are pre-generated for you at [https://model.earth/OpenFootprint/impacts](https://model.earth/OpenFootprint/impacts)

Model.earth developers use the following [http-server setup steps](https://model.earth/localsite/start/steps/) with port 8887.

Alternatively you can host the json files via [npm http-server](https://www.npmjs.com/package/http-server) and the following:

```bash
# just install it once, globally
npm install http-server -g

# host the data folder on port 8080, allowing CORS
http-server ./data -p 8080 --cors

# Alternative
http-server ../OpenFootprint/impacts/2020 -p 8080 --cors
```
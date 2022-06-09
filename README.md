# useeio.js
`useeio.js` is a JavaScript client API for the [USEEIO
API](https://github.com/USEPA/USEEIO_API) that runs in the browser. It is
written in TypeScript and uses [rollup.js](https://rollupjs.org) with the
[typescript2 plugin](https://www.npmjs.com/package/rollup-plugin-typescript2)
to create a single UMD bundle; [terser](https://terser.org/) is then used
to create a minified bundle.


## Usage

`useeio.js` is not on `npmjs.org` yet but you can just install it from Github
directly:

```
$ npm install git+https://github.com/msrocka/useeio.js.git
```

Alternatively, you can download and build it locally:

```bash
$ cd {some folder}
$ git clone https://github.com/msrocka/useeio.js.git
$ cd useeio.js
$ npm install
$ npm run build
```


## Dump API data locally
This project contains a script for downloading a JSON dump of an USEEIO-API
instance:

```
$ node scripts\dumpjson.js --endpoint {URL}
```

Where `{URL}` is some API endpoint, like https://smmtool.app.cloud.gov/api. You
can then host the dump locally, e.g. via
[htpp-server](https://www.npmjs.com/package/http-server):


```bash
# just install it once, globally
npm install http-server -g

# host the data folder on port 8080, allowing CORS
http-server ./data -p 8080 --cors
```
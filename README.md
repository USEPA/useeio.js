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

```bash
$ cd {some folder}
$ git clone https://github.com/msrocka/useeio.js.git
$ cd useeio.js
$ npm run build
```

Then, in the project where you want to use it:


## Dump API data locally

```
$ node scripts\dumpjson.js --endpoint {URL}
```

https://smmtool.app.cloud.gov/api

```
$ python3 -m http.server --directory data 8080
```

```bash
# 
npm install http-server -g

http-server ./data -p 8080 --cors

```
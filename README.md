# useeio.js
`useeio.js` is a JavaScript client API for the [USEEIO
API](https://github.com/USEPA/USEEIO_API) that runs in the browser. It is
written in TypeScript and uses [rollup.js](https://rollupjs.org) with the
[typescript2 plugin](https://www.npmjs.com/package/rollup-plugin-typescript2)
to create a single UMD bundle; [terser](https://terser.org/) is then used
to create a minified bundle.

## Build and usage
`useeio.js` is not on `npmjs.org` yet. In order to use it currently, you need
to build and install it locally:

```bash
$ cd {some folder}
$ git clone https://github.com/msrocka/useeio.js.git
$ cd useeio.js
$ npm run build
```

Then, in the project where you want to use it:

```
$ npm install {some folder}/useeio.js
```

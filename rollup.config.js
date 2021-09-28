import typescript from 'rollup-plugin-typescript2';

export default {
	input: 'src/index.ts',
  output: [
    {
      file: 'dist/useeio.umd.js',
      format: 'umd',
      name: 'USEEIO'
    }
  ],

	plugins: [
		typescript(/*{ plugin options }*/)
	]
}

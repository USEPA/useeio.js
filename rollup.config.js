import typescript from 'rollup-plugin-typescript2';

export default {
	input: 'src/USEEIO.ts',
  output: [
    {
      file: 'dist/USEEIO.umd.js',
      format: 'umd',
      name: 'USEEIO'
    }
  ],

	plugins: [
		typescript(/*{ plugin options }*/)
	]
}

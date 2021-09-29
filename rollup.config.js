import typescript from 'rollup-plugin-typescript2';

export default {
	input: 'src/useeio.ts',
  output: [
    {
      file: 'dist/useeio.js',
      format: 'umd',
      name: 'useeio'
    }
  ],

	plugins: [
		typescript(/*{ plugin options }*/)
	]
}

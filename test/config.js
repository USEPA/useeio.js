
// enable type-hints
/// <reference types="../dist/useeio" />
/** @type {import('useeio')} */
var useeio = useeio;

/*
const model = useeio.modelOf({
  endpoint: 'http://localhost:8080/api',
  model: 'USEEIOv2.0',
  asJsonFiles: true,
});
*/

const model = useeio.modelOf({
  endpoint: 'https://smmtool.app.cloud.gov/api',
  model: 'USEEIOv2.0.1-411',
  asJsonFiles: false,
});

function formatCell(input, format) {
    // If format is none or blank, return input as it is.
    if (format === 'none' || format === '') {
        return input;
    }

    // Format as scientific notation
    if (format === 'scientific') {
        return input.toExponential(1);
    }

    // Format as easy
    if (input >= 1e9) {
        // Round to billions
        return (input / 1e9).toFixed(1) + ' Billion';
    } else if (input >= 1e6) {
        // Round to millions
        return (input / 1e6).toFixed(1) + ' Million';
    } else if (input >= 1e3) {
        // Round to thousands
        return (input / 1e3).toFixed(1) + ' K';
    } else if (input >= 100) {
        // Round to one decimal
        return input.toFixed(1);
    } else {
        // Format with scientific notation with one digit after decimal
        return input.toExponential(1);
    }
}

// Test cases
console.log(formatCell(42262000000, 'easy')); // Output: "42.3 Billion"
console.log(formatCell(9500000, 'easy'));     // Output: "9.5 Million"
console.log(formatCell(50000, 'easy'));       // Output: "50.0 K"
console.log(formatCell(99.9, 'easy'));        // Output: "99.9" - BUG, displays as 1.0e+2
console.log(formatCell(0.0005, 'easy'));      // Output: "5.0e-4"
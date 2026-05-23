import { rationalize } from 'mathjs';

try {
    const expr = '5*x + 4 - (x + 10)';
    const res = rationalize(expr, {}, true);
    console.log("Coefficients:", res.coefficients);
    console.log("Expression:", res.expression.toString());
} catch (e) {
    console.error(e);
}

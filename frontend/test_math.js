import { simplify } from 'mathjs';

function solveEquation(eqStr) {
    try {
        console.log("Original:", eqStr);
        const parts = eqStr.split('=');
        if (parts.length !== 2) return null;

        let left = parts[0].trim();
        let right = parts[1].trim();

        // Standardize: left - (right) = 0
        const stdExpr = `(${left}) - (${right})`;
        console.log("Standardized:", stdExpr);

        // Simplify it
        const simplified = simplify(stdExpr);
        console.log("Simplified to 0:", simplified.toString());

        // Find variables
        const activeNodes = [];
        simplified.filter(node => {
            if (node.isSymbolNode) activeNodes.push(node.name);
        });
        const variables = [...new Set(activeNodes)];
        console.log("Variables:", variables);

        if (variables.length !== 1) {
            console.log("Cannot solve dynamically for multiple/zero variables in this basic script.");
            return;
        }

        const v = variables[0];

        // Evaluate at v = 0 and v = 1 to find linear coefficients
        const f0 = simplified.evaluate({ [v]: 0 });
        const f1 = simplified.evaluate({ [v]: 1 });
        const f2 = simplified.evaluate({ [v]: 2 });

        console.log(`f(0)=${f0}, f(1)=${f1}, f(2)=${f2}`);

        // Check if linear: f(2) - f(1) == f(1) - f(0)
        const isLinear = Math.abs((f2 - f1) - (f1 - f0)) < 1e-10;

        if (isLinear) {
            // ax + b = 0
            const b = f0;
            const a = f1 - f0;
            if (a === 0) {
                console.log("No solution or infinite solutions.");
                return;
            }
            const solution = -b / a;
            console.log(`Linear solution: ${v} = ${solution}`);
        } else {
            // Check if quadratic? ax^2 + bx + c = 0
            const c = f0;
            const a = (f2 - 2 * f1 + c) / 2;
            const b = f1 - c - a;

            // verify f(-1) matches
            const fm1 = simplified.evaluate({ [v]: -1 });
            const expected_fm1 = a - b + c;
            if (Math.abs(fm1 - expected_fm1) < 1e-10) {
                const disc = b * b - 4 * a * c;
                if (disc < 0) {
                    console.log("No real roots.");
                } else if (Math.abs(disc) < 1e-10) {
                    console.log(`Quadratic solution: ${v} = ${-b / (2 * a)}`);
                } else {
                    const r1 = (-b + Math.sqrt(disc)) / (2 * a);
                    const r2 = (-b - Math.sqrt(disc)) / (2 * a);
                    console.log(`Quadratic solutions: ${v} = ${r1}, ${v} = ${r2}`);
                }
            } else {
                console.log("Equation is higher order or non-polynomial.");
            }
        }
    } catch (e) {
        console.error(e);
    }
}

solveEquation('5x + 4 = x + 10');
solveEquation('2*x + 5 = 15');
solveEquation('x^2 - 4 = 0');
solveEquation('x^2 + 5x + 6 = 0');

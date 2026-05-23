import * as math from 'mathjs';

/**
 * Attempts to numerically solve a linear or quadratic algebraic equation.
 * Returns an object with { success, result, steps } or { success: false }
 */
export function solveAlgebraEquation(expression) {
    try {
        if (!expression.includes('=')) {
            return { success: false }; // Not an equation
        }

        const parts = expression.split('=');
        if (parts.length !== 2) return { success: false };

        const left = parts[0].trim();
        const right = parts[1].trim();

        // Standardize: left - (right) = 0
        const stdExpr = `(${left}) - (${right})`;
        const stdFormStr = `${left} - (${right}) = 0`;

        const simplified = math.simplify(stdExpr);
        const simplifiedStr = `${simplified.toString()} = 0`;

        const activeNodes = [];
        simplified.filter(node => {
            if (node.isSymbolNode) activeNodes.push(node.name);
        });
        const variables = [...new Set(activeNodes)];

        if (variables.length !== 1) {
            // Cannot confidently solve multivariate mathematically in this simple numerical hook
            return { success: false };
        }

        const v = variables[0];

        let steps = [
            { label: 'Original', text: expression },
            { label: 'Standardize', text: stdFormStr },
            { label: 'Simplify', text: simplifiedStr }
        ];

        // Evaluate at v = 0, 1, 2 to find coefficients
        const f0 = simplified.evaluate({ [v]: 0 });
        const f1 = simplified.evaluate({ [v]: 1 });
        const f2 = simplified.evaluate({ [v]: 2 });

        const isLinear = Math.abs((f2 - f1) - (f1 - f0)) < 1e-10;

        if (isLinear) {
            const b = f0;
            const a = f1 - f0;
            if (Math.abs(a) < 1e-10) {
                return { success: false }; // No sol or infinite sol
            }
            const solutionVal = -b / a;
            const solution = Number(solutionVal.toFixed(10)); // Floating point protection
            const resText = `${v} = ${solution}`;

            steps.push({ label: 'Isolate', text: `${a} * ${v} = ${-b}` });
            steps.push({ label: 'Final', text: resText });

            return { success: true, result: resText, steps };
        } else {
            // Quadratic check
            const c = f0;
            const a = (f2 - 2 * f1 + c) / 2;
            const b = f1 - c - a;

            const fm1 = simplified.evaluate({ [v]: -1 });
            const expected_fm1 = a - b + c;

            if (Math.abs(fm1 - expected_fm1) < 1e-10) {
                const disc = b * b - 4 * a * c;
                if (disc < 0) {
                    return { success: false, reason: "No real roots" };
                } else if (Math.abs(disc) < 1e-10) {
                    const sol = Number((-b / (2 * a)).toFixed(10));
                    const resText = `${v} = ${sol}`;
                    steps.push({ label: 'Final', text: resText });
                    return { success: true, result: resText, steps };
                } else {
                    const r1 = Number(((-b + Math.sqrt(disc)) / (2 * a)).toFixed(10));
                    const r2 = Number(((-b - Math.sqrt(disc)) / (2 * a)).toFixed(10));
                    const resText = `${v} = ${r1}, ${v} = ${r2}`;
                    steps.push({ label: 'Final', text: resText });
                    return { success: true, result: resText, steps };
                }
            }
        }

        return { success: false };

    } catch (err) {
        console.error('Algebra Solver Error:', err);
        return { success: false };
    }
}

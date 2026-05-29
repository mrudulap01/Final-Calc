import { rationalize } from 'mathjs';

try {
    const expr = '5*x + 4 - (x + 10)';
    // rationalize returns an object if the third argument is true
    // wait, rationalize in mathjs v15 might be different. Let's see.
    const res = rationalize(expr);
    console.log(res.toString());

    // Test implicit multiplication regex
    let raw = '2x + 5y - 3sin(x) + 4(x+1) + x^2 - 4 = 0';
    let normalized = raw.replace(/\s+/g, '');

    // Replace unicode
    normalized = normalized.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

    // Add implicit multiplication
    // number followed by letter or (
    normalized = normalized.replace(/(\d)([a-zA-Z\(])/g, '$1*$2');
    // letter followed by letter (like x y) -> not sure if we want x*y, user said variables x,y,z
    // ) followed by letter or digit or (
    normalized = normalized.replace(/(\))([a-zA-Z0-9\(])/g, '$1*$2');

    console.log("Raw:", raw);
    console.log("Normalized:", normalized);

} catch (e) {
    console.error(e);
}

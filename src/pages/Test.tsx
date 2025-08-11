// External modules
import React from "react";

// Types
type Term = ">" | "<";

interface SumByTermConfig {
    term: Term;
    num: number;
}

export default function Test() {
    function sumByTerm({ term, num }: SumByTermConfig) {
        return (...args: number[]) => {
            switch (term) {
                case ">": return args.filter((x) => x > num).reduce((acc, val) => acc + val, 0);
                case "<": return args.filter((x) => x < num).reduce((acc, val) => acc + val, 0);
                default:
                    throw new Error('term not identified');
            }
        };
    }

    const a = sumByTerm({ term: ">", num: 5 })(3, 7, 5, 2, 8, 1, 4, 6, 9, 0);
    const b = sumByTerm({ term: "<", num: 3 })(3, 7, 5, 2, 8, 1, 4, 6, 9, 0);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Return Sum By Term</h1>
            <div>
                <p><strong>A result (sum of numbers &gt; 5):</strong> {a}</p>
                <p><strong>B result (sum of numbers &lt; 3):</strong> {b}</p>
            </div>
            <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px" }}>
                <h3>Test Data:</h3>
                <p>Array: [3, 7, 5, 2, 8, 1, 4, 6, 9, 0]</p>
                <p>A: Sum of numbers greater than 5 = {a}</p>
                <p>B: Sum of numbers less than 3 = {b}</p>
            </div>
        </div>
    );
}

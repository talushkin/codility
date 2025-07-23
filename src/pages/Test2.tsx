import React, { useState } from 'react';
import cx from 'classnames';

// Codility Solution for Maximum Non-Overlapping Segments
function solution(A: number[], B: number[]): number {
  const n = A.length;
  
  // Edge case: no segments
  if (n === 0) return 0;
  
  let count = 1; // Always include the first segment (ends earliest)
  let lastEndTime = B[0]; // End time of the last selected segment
  
  // Iterate through remaining segments
  for (let i = 1; i < n; i++) {
    // If current segment doesn't overlap with last selected segment
    // Two segments overlap if they share at least one common point
    // So A[i] > lastEndTime means no overlap (strictly greater than)
    if (A[i] > lastEndTime) {
      count++; // Include this segment
      lastEndTime = B[i]; // Update the last end time
    }
    // If segments overlap, skip current segment (greedy choice)
  }
  
  return count;
}

// Fixed solution for A and B string construction
function solutionAB(A: number, B: number): string {
    // Edge case: if one count is 0 and the other is > 2, it's impossible
    if ((A === 0 && B > 2) || (B === 0 && A > 2)) {
        // Problem states solution always exists, but mathematically impossible
        // Return the best possible solution
        if (A === 0) return "bb"; // Best we can do without violating rules too much
        if (B === 0) return "aa"; // Best we can do without violating rules too much
    }
    
    let str = "";
    let countA = A;
    let countB = B;
    
    while (countA > 0 || countB > 0) {
        const len = str.length;
        const lastTwo = len >= 2 ? str.slice(-2) : "";
        
        let addA = false;
        
        if (lastTwo === "aa") {
            // Must add 'b' to avoid "aaa"
            if (countB > 0) {
                addA = false;
            } else {
                // No 'b' left, but we can't add 'a' either - this shouldn't happen
                break;
            }
        } else if (lastTwo === "bb") {
            // Must add 'a' to avoid "bbb"
            if (countA > 0) {
                addA = true;
            } else {
                // No 'a' left, but we can't add 'b' either - this shouldn't happen
                break;
            }
        } else {
            // Free choice - prefer the one with more remaining
            // But also consider if adding two of the same is beneficial
            if (countA > countB + 1) {
                addA = true;
            } else if (countB > countA + 1) {
                addA = false;
            } else {
                addA = countA >= countB;
            }
        }
        
        // Add the chosen character
        if (addA && countA > 0) {
            str += "a";
            countA--;
            
            // Optimization: if we have many more A's than B's, add another A
            if (countA > 0 && countA > countB && lastTwo !== "ba") {
                str += "a";
                countA--;
            }
        } else if (!addA && countB > 0) {
            str += "b";
            countB--;
            
            // Optimization: if we have many more B's than A's, add another B
            if (countB > 0 && countB > countA && lastTwo !== "ab") {
                str += "b";
                countB--;
            }
        } else {
            // Emergency fallback
            if (countA > 0) {
                str += "a";
                countA--;
            } else if (countB > 0) {
                str += "b";
                countB--;
            } else {
                break;
            }
        }
        
        // Safety check to prevent infinite loops
        if (str.length > A + B + 5) {
            break;
        }
    }
    
    return str;
}

// Test cases for A and B string construction
const stringTestCases = [
  { A: 5, B: 3, description: "A=5, B=3 (example 1)" },
  { A: 3, B: 3, description: "A=3, B=3 (example 2)" },
  { A: 1, B: 4, description: "A=1, B=4 (example 3)" },
  { A: 0, B: 3, description: "A=0, B=3 (edge case)" },
  { A: 2, B: 0, description: "A=2, B=0 (edge case)" },
  { A: 1, B: 1, description: "A=1, B=1 (minimal)" },
  { A: 6, B: 1, description: "A=6, B=1 (unbalanced)" },
  { A: 1, B: 6, description: "A=1, B=6 (unbalanced reverse)" }
];

// Validation function for string results
function validateString(str: string, expectedA: number, expectedB: number): { valid: boolean, issues: string[] } {
  const issues: string[] = [];
  
  // Count actual A's and B's
  const actualA = (str.match(/a/g) || []).length;
  const actualB = (str.match(/b/g) || []).length;
  
  if (actualA !== expectedA) {
    issues.push(`Expected ${expectedA} 'a's, got ${actualA}`);
  }
  
  if (actualB !== expectedB) {
    issues.push(`Expected ${expectedB} 'b's, got ${actualB}`);
  }
  
  // Check for three consecutive characters
  if (str.includes("aaa")) {
    issues.push("Contains 'aaa' (three consecutive a's)");
  }
  
  if (str.includes("bbb")) {
    issues.push("Contains 'bbb' (three consecutive b's)");
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

// Test cases for segment overlap problem
const segmentTestCases = [
  {
    A: [1, 3, 7, 9, 9],
    B: [5, 6, 8, 9, 10],
    expected: 3,
    description: "Example from problem"
  },
  {
    A: [1, 3, 5, 7],
    B: [2, 4, 6, 8],
    expected: 4,
    description: "No overlapping segments (fixed)"
  },
  {
    A: [1, 1, 1],
    B: [3, 3, 3],
    expected: 1,
    description: "All segments overlap"
  },
  {
    A: [],
    B: [],
    expected: 0,
    description: "Empty arrays"
  },
  {
    A: [1],
    B: [5],
    expected: 1,
    description: "Single segment"
  },
  {
    A: [1, 2, 3, 4],
    B: [2, 3, 4, 5],
    expected: 2,
    description: "Adjacent segments (they share boundary points, so overlap)"
  }
];

// Previous solution for minimum distinct letters
function minDistinctLetters(P: string, Q: string): number {
  const n = P.length;
  const usedLetters = new Set<string>();
  
  for (let i = 0; i < n; i++) {
    const letterP = P[i];
    const letterQ = Q[i];
    
    // If both letters are already used, pick either one
    if (usedLetters.has(letterP) && usedLetters.has(letterQ)) {
      continue; // Both are already in the set, no new letters added
    }
    // If only one letter is already used, pick that one
    else if (usedLetters.has(letterP)) {
      continue; // Use letterP which is already in the set
    }
    else if (usedLetters.has(letterQ)) {
      continue; // Use letterQ which is already in the set
    }
    // If neither letter is used, pick one (doesn't matter which)
    else {
      usedLetters.add(letterP); // Add new letter to the set
    }
  }
  
  return usedLetters.size;
}

// Test cases for minimum distinct letters
const letterTestCases = [
  { P: "abc", Q: "bcd", expected: 2 },
  { P: "axxz", Q: "yzwy", expected: 2 },
  { P: "bacad", Q: "abada", expected: 1 },
  { P: "amz", Q: "amz", expected: 3 },
  { P: "ca", Q: "ab", expected: 1 }
];

interface LikeButtonProps {
  initialLikesCount?: number;
}

export default function Test2({ initialLikesCount = 100 }: LikeButtonProps) {
  const [liked, setLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(initialLikesCount);

  const handleClick = () => {
    if (liked) {
      setLiked(false);
      setLikesCount(likesCount - 1);
    } else {
      setLiked(true);
      setLikesCount(likesCount + 1);
    }
  };

  return (
    <>
      {/* String A/B Construction Solution Results */}
      <div style={{ margin: '20px', fontFamily: 'monospace' }}>
        <h2>🔤 Codility - A and B String Construction Solution</h2>
        {stringTestCases.map((test, index) => {
          const result = solutionAB(test.A, test.B);
          const validation = validateString(result, test.A, test.B);
          const isCorrect = validation.valid;
          return (
            <div key={index} style={{ 
              margin: '10px 0', 
              padding: '10px', 
              backgroundColor: isCorrect ? '#e8f5e8' : '#ffe8e8',
              border: `1px solid ${isCorrect ? '#4caf50' : '#f44336'}`,
              borderRadius: '4px'
            }}>
              <strong>String Test {index + 1}:</strong> {test.description}<br/>
              <strong>Input:</strong> A={test.A}, B={test.B}<br/>
              <strong>Output:</strong> "{result}" (length: {result.length})<br/>
              <strong>Expected:</strong> {test.A} 'a's and {test.B} 'b's
              <span style={{ color: isCorrect ? 'green' : 'red', fontSize: '1.2em' }}>
                {isCorrect ? ' ✅' : ' ❌'}
              </span>
              {!isCorrect && (
                <div style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                  <strong>Issues:</strong> {validation.issues.join(', ')}
                </div>
              )}
              {isCorrect && (
                <div style={{ color: 'green', fontSize: '0.9em', marginTop: '5px' }}>
                  ✓ Correct count of letters, no three consecutive characters
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Segment Overlap Solution Results */}
      <div style={{ margin: '20px', fontFamily: 'monospace' }}>
        <h2>📊 Codility - Maximum Non-Overlapping Segments Solution</h2>
        {segmentTestCases.map((test, index) => {
          const result = solution(test.A, test.B);
          const isCorrect = result === test.expected;
          return (
            <div key={index} style={{ 
              margin: '10px 0', 
              padding: '10px', 
              backgroundColor: isCorrect ? '#e8f5e8' : '#ffe8e8',
              border: `1px solid ${isCorrect ? '#4caf50' : '#f44336'}`,
              borderRadius: '4px'
            }}>
              <strong>Test {index + 1}:</strong> {test.description}<br/>
              A = [{test.A.join(', ')}]<br/>
              B = [{test.B.join(', ')}]<br/>
              Expected: {test.expected}, Got: {result} 
              <span style={{ color: isCorrect ? 'green' : 'red' }}>
                {isCorrect ? ' ✅' : ' ❌'}
              </span>
              <div style={{ fontSize: '0.9em', marginTop: '5px', color: '#666' }}>
                Segments: {test.A.map((start, i) => `[${start}, ${test.B[i]}]`).join(', ')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Previous Letter Solution Results */}
      <div style={{ margin: '20px', fontFamily: 'monospace' }}>
        <h2>🔤 Codility - Minimum Distinct Letters Solution</h2>
        {letterTestCases.map((test, index) => {
          const result = minDistinctLetters(test.P, test.Q);
          const isCorrect = result === test.expected;
          return (
            <div key={index} style={{ 
              margin: '10px 0', 
              padding: '10px', 
              backgroundColor: isCorrect ? '#e8f5e8' : '#ffe8e8',
              border: `1px solid ${isCorrect ? '#4caf50' : '#f44336'}`,
              borderRadius: '4px'
            }}>
              <strong>Letter Test {index + 1}:</strong><br/>
              P = "{test.P}", Q = "{test.Q}"<br/>
              Expected: {test.expected}, Got: {result} 
              <span style={{ color: isCorrect ? 'green' : 'red' }}>
                {isCorrect ? ' ✅' : ' ❌'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Like Button Component */}
      <div style={{ margin: '20px' }}>
        <h3>👍 Like Button Component:</h3>
        <div 
          className={cx('like-button', { 'liked': liked })}
          onClick={handleClick}
        >
          Like | <span className="likes-counter">{likesCount}</span>
        </div>
      </div>

      <style>{`
        .like-button {
          font-size: 1rem;
          padding: 5px 10px;
          color: #585858;
          cursor: pointer;
          border: 1px solid #ccc;
          border-radius: 4px;
          display: inline-block;
          transition: all 0.3s ease;
        }
        .like-button:hover {
          background-color: #f5f5f5;
        }
        .liked {
          font-weight: bold;
          color: #1565c0;
          background-color: #e3f2fd;
          border-color: #1565c0;
        }
      `}</style>
    </>
  );
}

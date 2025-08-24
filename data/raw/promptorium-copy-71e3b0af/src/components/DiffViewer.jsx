import React, { useMemo } from 'react';

// Simple word-based diffing logic
function simpleDiff(oldStr, newStr) {
  // Ensure inputs are strings to prevent errors
  const oldText = typeof oldStr === 'string' ? oldStr : '';
  const newText = typeof newStr === 'string' ? newStr : '';
  
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);
  const dp = Array(oldWords.length + 1).fill(null).map(() => Array(newWords.length + 1).fill(0));

  for (let i = 1; i <= oldWords.length; i++) {
    for (let j = 1; j <= newWords.length; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result = [];
  let i = oldWords.length, j = newWords.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      result.unshift({ type: 'common', value: oldWords[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', value: newWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.unshift({ type: 'removed', value: oldWords[i - 1] });
      i--;
    } else {
      // Safeguard to prevent infinite loops
      break;
    }
  }
  return result;
}


export default function DiffViewer({ oldText, newText }) {
  const diffResult = useMemo(() => {
    try {
      return simpleDiff(oldText, newText);
    } catch (e) {
      console.error("Error creating diff:", e);
      return null; // Return null on error to indicate failure
    }
  }, [oldText, newText]);

  // Add extra check to ensure diffResult is an array before mapping
  if (!Array.isArray(diffResult)) {
    // This can happen if an error was caught in useMemo.
    // We render an error message instead of crashing.
    return (
      <div className="p-4 rounded-xl text-yellow-400" style={{ backgroundColor: 'rgba(252, 211, 77, 0.1)' }}>
        לא ניתן היה להציג את ההבדלים עקב שגיאה.
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl leading-relaxed text-sm whitespace-pre-wrap" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      {diffResult.map((part, index) => {
        const style = {
          display: 'inline',
          transition: 'background-color 0.3s ease',
        };
        if (part.type === 'added') {
          style.backgroundColor = 'rgba(74, 222, 128, 0.15)';
          style.color = '#86efac';
          style.textDecoration = 'underline';
          style.textDecorationColor = 'rgba(74, 222, 128, 0.5)';

        } else if (part.type === 'removed') {
          style.backgroundColor = 'rgba(248, 113, 113, 0.15)';
          style.color = '#fca5a5';
          style.textDecoration = 'line-through';
          style.textDecorationColor = 'rgba(248, 113, 113, 0.5)';
        }
        return <span key={index} style={style}>{part.value}</span>;
      })}
    </div>
  );
}
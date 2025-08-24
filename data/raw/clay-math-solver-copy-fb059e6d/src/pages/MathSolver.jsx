import React, { useState } from "react";
import { InvokeLLM } from "@/api/integrations";
import { MathProblem } from "@/api/entities";

import ProblemInput from "../components/solver/ProblemInput";
import DifficultySelector from "../components/solver/DifficultySelector";
import SampleProblems from "../components/solver/SampleProblems";
import SolutionDisplay from "../components/solver/SolutionDisplay";
import ApiKeyManager from "../components/solver/ApiKeyManager";

export default function MathSolver() {
  const [difficulty, setDifficulty] = useState("high_school");
  const [solution, setSolution] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const solveProblem = async (problem) => {
    setIsLoading(true);
    setSolution(null);
    
    try {
      const apiKey = localStorage.getItem("openai_api_key");
      const isAdvanced = difficulty === 'high_school' || difficulty === 'college';
      
      let modelInstruction = '';
      if (apiKey && isAdvanced) {
        modelInstruction = `
          The user has provided their own OpenAI API key to access more advanced models.
          Please use your most capable and up-to-date model for this solution (e.g., GPT-4 Turbo if available).
          This ensures the highest quality response for this advanced problem.
        `;
      }
      
      const prompt = `
        You are a math tutor helping a student solve a ${difficulty.replace('_', ' ')} level math problem.
        ${modelInstruction}
        Problem: ${problem}
        
        Please provide a detailed step-by-step solution with clear explanations.
        Break down the solution into logical steps that a student can follow.
        Include the reasoning behind each step.
        
        Format your response as a JSON object with:
        - problem: the original problem
        - difficulty: the difficulty level
        - category: the math category (arithmetic, algebra, geometry, trigonometry, calculus, statistics, word_problems)
        - steps: an array of step objects with "description" and "calculation" fields
        - final_answer: the final answer
        - explanation: a summary explanation of the solution approach
      `;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            problem: { type: "string" },
            difficulty: { type: "string" },
            category: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  calculation: { type: "string" }
                }
              }
            },
            final_answer: { type: "string" },
            explanation: { type: "string" }
          }
        }
      });

      setSolution(response);
      
      // Save to database
      await MathProblem.create({
        problem: response.problem,
        difficulty: response.difficulty,
        category: response.category,
        solution: JSON.stringify(response.steps),
        final_answer: response.final_answer,
        explanation: response.explanation
      });
      
    } catch (error) {
      console.error("Error solving problem:", error);
      setSolution({
        problem,
        steps: [{ description: "Sorry, I encountered an error solving this problem. Please try again.", calculation: "" }],
        final_answer: "Error occurred",
        explanation: "Please check your problem format and try again."
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <DifficultySelector 
        selectedDifficulty={difficulty} 
        onSelect={(newDifficulty) => {
          setDifficulty(newDifficulty);
          setSolution(null);
        }} 
      />
      
      <ApiKeyManager isVisible={difficulty === 'high_school' || difficulty === 'college'} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <ProblemInput onSolve={solveProblem} isLoading={isLoading} />
          <SampleProblems 
            difficulty={difficulty} 
            onSelectProblem={solveProblem} 
          />
        </div>
        
        <div className="lg:sticky lg:top-8 lg:self-start">
          <SolutionDisplay solution={solution} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
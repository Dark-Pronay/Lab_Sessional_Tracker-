'use server';

/**
 * @fileOverview Flow to calculate the final grade of a student based on a weighted rubric.
 *
 * - calculateFinalGrade - Calculates the final grade based on a pre-calculated total percentage.
 * - CalculateFinalGradeInput - The input type for the calculateFinalGrade function.
 * - CalculateFinalGradeOutput - The return type for the calculateFinalGrade function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateFinalGradeInputSchema = z.object({
  totalPercentage: z.number().describe('The final calculated percentage score for the student (0-100).'),
  weightedScores: z.object({
      lab: z.string().describe('Weighted score from labs (out of 60).'),
      quiz: z.string().describe('Weighted score from quiz (out of 15).'),
      viva: z.string().describe('Weighted score from viva (out of 15).'),
      attendance: z.string().describe('Weighted score from attendance (out of 10).'),
  }),
  actualScores: z.object({
      totalLabMarks: z.number().describe('Total raw lab marks obtained.'),
      quizScore: z.number().describe('Raw quiz score obtained.'),
      vivaScore: z.number().describe('Raw viva score obtained.'),
      attendancePercentage: z.string().describe('Overall attendance percentage.'),
  }),
  maxScores: z.object({
      lab: z.number().describe('Maximum possible raw lab marks.'),
      quiz: z.number().describe('Maximum possible raw quiz score.'),
      viva: z.number().describe('Maximum possible raw viva score.'),
  })
});
export type CalculateFinalGradeInput = z.infer<typeof CalculateFinalGradeInputSchema>;

const CalculateFinalGradeOutputSchema = z.object({
  finalGrade: z.string().describe('The final letter grade of the student (e.g., A, B, C).'),
  totalMarks: z.number().describe('The final total percentage score obtained by the student (out of 100).'),
});
export type CalculateFinalGradeOutput = z.infer<typeof CalculateFinalGradeOutputSchema>;

export async function calculateFinalGrade(input: CalculateFinalGradeInput): Promise<CalculateFinalGradeOutput> {
  // The AI's job is just to determine the letter grade from the final percentage.
  const flowResult = await calculateFinalGradeFlow(input);

  // We combine the AI's letter grade with the precise number calculated in our action.
  return {
    ...flowResult,
    totalMarks: parseFloat(input.totalPercentage.toFixed(2)),
  };
}

const calculateFinalGradePrompt = ai.definePrompt({
  name: 'calculateFinalGradePrompt',
  input: {schema: CalculateFinalGradeInputSchema},
  // The AI only needs to determine the letter grade. The final number is handled by our code.
  output: {schema: z.object({ finalGrade: z.string() })}, 
  prompt: 
  ` You are an expert academic evaluator and student-performance diagnostician.
The student's current scores reflect partial course progress, not final results.

Your task is to analyze the student's academic behavior and predict the most likely final grade the student may achieve if the observed behavior continues.

The student's current calculated percentage so far is: {{totalPercentage}}%

This percentage is derived from the following received-to-date components:

Lab / Class Performance: {{actualScores.totalLabMarks}} out of {{maxScores.lab}}

Quiz Score: {{actualScores.quizScore}} out of {{maxScores.quiz}}

Viva Score: {{actualScores.vivaScore}} out of {{maxScores.viva}}

Attendance so far: {{actualScores.attendancePercentage}}%

Mandatory Calculation & Insight Rules (Highest Priority)

Course evaluation follows credit-based weighting (0.75 or 1.5 credit).

Class performance, quizzes, viva, and attendance must be interpreted according to their credit-defined contribution.

Attendance marks must be mapped strictly using the institutional attendance table for the corresponding credit.

Weekly class performance must be scaled using the credit-specific multiplier.

If any inferred logic conflicts with these rules, these rules override all others.

Predictive Evaluation Principles

Do not treat future or missing assessments as zero.

Current performance indicates engagement, consistency, and momentum.

Strong early performance implies potential for high final achievement.
even if he performed first week great then he will considedered as probable high achiever you can not give him F.But if in 2nd week and afterwards he performed bad then it will decrease his chances.its kind of work like that probable future outcome based on current performance.along with this Also strictly follow that- if all weeks data are present then calculate final grade based on that only, no probability will be applied then

Attendance consistency strengthens prediction confidence.

Based on the observed performance pattern and the enforced calculation rules, assign:

Predicted Final Letter Grade

One primary behavior tag

Grade Rubric

A: 70–100

B: 55–70

C: 45–55

D: 40–45

F: Below 40

Behavior Tags (choose ONE)

High Achiever

Consistent Performer

Improving

Average / Stable

At Risk

Strict Output Format

Predicted Grade: <LETTER>:<TAG> `,
});

const calculateFinalGradeFlow = ai.defineFlow(
  {
    name: 'calculateFinalGradeFlow',
    inputSchema: CalculateFinalGradeInputSchema,
    outputSchema: z.object({ finalGrade: z.string() }),
  },
  async input => {
    const {output} = await calculateFinalGradePrompt(input);
    return output!;
  }
);
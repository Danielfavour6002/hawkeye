'use server';
/**
 * @fileOverview An AI agent that provides explanations for network behavior anomalies based on a given prompt.
 *
 * - promptBasedAnomalyExplanation - A function that takes a prompt describing network behavior and returns an explanation of whether it's considered anomalous.
 * - PromptBasedAnomalyExplanationInput - The input type for the promptBasedAnomalyExplanation function.
 * - PromptBasedAnomalyExplanationOutput - The return type for the promptBasedAnomalyExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PromptBasedAnomalyExplanationInputSchema = z.object({
  networkBehaviorDescription: z.string().describe('A description of the network behavior to be analyzed.'),
});
export type PromptBasedAnomalyExplanationInput = z.infer<typeof PromptBasedAnomalyExplanationInputSchema>;

const PromptBasedAnomalyExplanationOutputSchema = z.object({
  isAnomalous: z.boolean().describe('Whether the described network behavior is considered anomalous.'),
  explanation: z.string().describe('An explanation of why the network behavior is considered anomalous or not.'),
});
export type PromptBasedAnomalyExplanationOutput = z.infer<typeof PromptBasedAnomalyExplanationOutputSchema>;

export async function promptBasedAnomalyExplanation(input: PromptBasedAnomalyExplanationInput): Promise<PromptBasedAnomalyExplanationOutput> {
  return promptBasedAnomalyExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'promptBasedAnomalyExplanationPrompt',
  input: {schema: PromptBasedAnomalyExplanationInputSchema},
  output: {schema: PromptBasedAnomalyExplanationOutputSchema},
  prompt: `You are a network security expert analyzing network traffic data.
  Based on your training on the NSL-KDD dataset, determine if the following network behavior is anomalous:

  Description: {{{networkBehaviorDescription}}}

  Provide a detailed explanation for your determination, including specific features or patterns that contribute to your decision.
  Indicate isAnomalous field true or false based on your analysis.
  `,
});

const promptBasedAnomalyExplanationFlow = ai.defineFlow(
  {
    name: 'promptBasedAnomalyExplanationFlow',
    inputSchema: PromptBasedAnomalyExplanationInputSchema,
    outputSchema: PromptBasedAnomalyExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

// Summarize the intrusion data into a string.
'use server';
/**
 * @fileOverview Summarizes intrusion data to provide a daily security overview for administrators.
 *
 * - summarizeIntrusionData - A function that takes intrusion data and returns a summary.
 * - SummarizeIntrusionDataInput - The input type for the summarizeIntrusionData function.
 * - SummarizeIntrusionDataOutput - The return type for the summarizeIntrusionData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIntrusionDataInputSchema = z.object({
  intrusionData: z
    .string()
    .describe(
      'A string containing the raw intrusion data to be summarized.  This can include details like timestamps, IP addresses, attack types, severity levels, and any other relevant information captured by the intrusion detection system.'
    ),
});
export type SummarizeIntrusionDataInput = z.infer<
  typeof SummarizeIntrusionDataInputSchema
>;

const SummarizeIntrusionDataOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the intrusion data, highlighting key events, trends, and potential security threats identified in the provided logs.'
    ),
});
export type SummarizeIntrusionDataOutput = z.infer<
  typeof SummarizeIntrusionDataOutputSchema
>;

export async function summarizeIntrusionData(
  input: SummarizeIntrusionDataInput
): Promise<SummarizeIntrusionDataOutput> {
  return summarizeIntrusionDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeIntrusionDataPrompt',
  input: {schema: SummarizeIntrusionDataInputSchema},
  output: {schema: SummarizeIntrusionDataOutputSchema},
  prompt: `You are an expert security analyst tasked with summarizing network intrusion data for a daily security briefing.

  Your goal is to provide a clear and concise overview of the key security events, trends, and potential threats identified in the provided logs.

  Consider these aspects when creating the summary:

  - Significant intrusion attempts and their severity.
  - The types of attacks observed (e.g., malware, phishing, DDoS).
  - Affected systems or areas of the network.
  - Overall security posture and any recommended actions.

  Here is the intrusion data:

  {{intrusionData}}
  `,
});

const summarizeIntrusionDataFlow = ai.defineFlow(
  {
    name: 'summarizeIntrusionDataFlow',
    inputSchema: SummarizeIntrusionDataInputSchema,
    outputSchema: SummarizeIntrusionDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

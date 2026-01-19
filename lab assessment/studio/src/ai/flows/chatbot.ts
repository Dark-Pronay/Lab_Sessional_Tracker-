'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user message to respond to'),
});

const ChatOutputSchema = z.object({
  response: z.string().describe('The chatbot response'),
});

export async function chat(input: {message: string}): Promise<{response: string}> {
  const flowResult = await chatFlow(input);
  return flowResult;
}

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a helpful assistant for LabTracker Pro, a lab performance tracking system.

You help users with:
- Understanding how to use the system
- Course creation and management
- Student enrollment and tracking
- Performance analytics and grading
- General questions about lab assessment

User question: {{message}}

Provide a helpful, concise response. Be friendly and professional.`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await chatPrompt(input);
    return output!;
  }
);
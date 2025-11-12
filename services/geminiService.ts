import { GoogleGenAI, Modality } from "@google/genai";

/**
 * A pass-through function for the prompt. In a real-world scenario,
 * this could be used to refine or translate the prompt using another AI call.
 * For this application, the prompt construction is already advanced, so we pass it directly.
 * @param prompt The original user prompt.
 * @returns A promise that resolves with the same prompt.
 */
export const translatePrompt = async (prompt: string): Promise<string> => {
  return Promise.resolve(prompt);
};

/**
 * Generates or edits an image using the Gemini API based on a prompt and optional reference images.
 * @param prompt The text prompt for generation or editing.
 * @param base64Images An array of base64 encoded reference images.
 * @param _aspectRatio The desired aspect ratio string. This parameter is accounted for
 * in the image preprocessing step and not directly passed to the model API.
 * @returns A promise that resolves with the base64 data of the generated image.
 */
export const generateImage = async (
  prompt: string,
  base64Images: string[],
  _aspectRatio: string
): Promise<string> => {
  // ROBUSTNESS FIX: Instantiate a new GoogleGenAI client for every call.
  // This is the definitive fix for the "fails on second generation" error. It ensures
  // that each request is stateless and uses a fresh, clean connection to the API,
  // preventing any session-related instability from the previous request.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use the recommended model for general image generation and editing.
  const model = 'gemini-2.5-flash-image';
  
  const parts: any[] = [];
  
  // Add reference images first, if any
  base64Images.forEach(imgData => {
    parts.push({
      inlineData: {
        data: imgData,
        mimeType: 'image/jpeg',
      },
    });
  });
  
  const effectivePrompt = prompt.trim() === '' ? 'A high-quality, photorealistic image based on the reference.' : prompt;

  // FIDELITY REINFORCEMENT V2: The prompt has been made even more strict and detailed
  // to force the model to prioritize identity preservation above all else.
  const highFidelityPrompt = `
    **PRIMARY DIRECTIVE: EXACT LIKENESS.**
    Your most critical and non-negotiable task is to replicate the person in the reference image with 100% accuracy. The generated person MUST be the SAME individual.
    - **Face:** Do not alter facial structure, eye color, nose shape, or any unique facial features.
    - **Identity:** The output must be a photorealistic match to the reference person, not a similar-looking individual.
    - **All other instructions are subordinate to this directive.**

    **Secondary Task (Creative Brief):**
    ${effectivePrompt}

    **Final Check:** Before finalizing, verify the person in your generated image is an exact likeness of the person in the reference photo.
  `;
  parts.push({ text: highFidelityPrompt });


  if (parts.length === 0) {
    throw new Error("A prompt or reference image is required to generate an image.");
  }

  // Call the generateContent API with the correct structure for image generation/editing.
  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: parts },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const candidate = response.candidates?.[0];
  if (!candidate || !candidate.content || !candidate.content.parts) {
      const blockReason = response.promptFeedback?.blockReason;
      if (blockReason) {
          throw new Error(`Generation failed due to safety policies: ${blockReason}`);
      }
      throw new Error('The API did not return a valid response. Please try again.');
  }

  for (const part of candidate.content.parts) {
    if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
      return part.inlineData.data;
    }
  }

  throw new Error('The API did not return an image. Please adjust your prompt and try again.');
};

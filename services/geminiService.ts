import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to show this error to the user.
  // For this context, throwing an error is sufficient.
  throw new Error("API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const base64ToGeminiPart = (base64: string, mimeType: string) => {
  // Strips the data URL prefix, e.g., "data:image/png;base64,"
  const pureBase64 = base64.substring(base64.indexOf(',') + 1);
  return {
    inlineData: {
      data: pureBase64,
      mimeType,
    },
  };
};

export const transformImageToTron = async (base64ImageData: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

  const imagePart = base64ToGeminiPart(base64ImageData, 'image/png');
  const textPart = {
    text: "Transform the person in this image into a character from the Tron movie. The character should have glowing neon lines on their suit. The background should be a dark, futuristic grid with red, orange, and blue neon light effects. In the background, display the text 'DEVOXX' in a prominent neon font. The overall aesthetic should be dark, high-tech, and inspired by the Tron movie franchise.",
  };

  try {
    const result = await model.generateContent([textPart, imagePart]);
    const response = await result.response;
    const firstCandidate = response.candidates[0];
    if (!firstCandidate.content || !firstCandidate.content.parts || firstCandidate.content.parts.length === 0) {
      throw new Error("AI did not return any content.");
    }
    const firstPart = firstCandidate.content.parts[0];
    if (firstPart.inlineData) {
      const mimeType = firstPart.inlineData.mimeType;
      const base64Data = firstPart.inlineData.data;
      return `data:${mimeType};base64,${base64Data}`;
    }
    
    // Fallback if no image is found
    throw new Error("AI did not return an image. It might have responded with text only.");

  } catch (error) {
    console.error("Error transforming image:", error);
    throw new Error("Failed to generate the Tron image. Please try again.");
  }
};

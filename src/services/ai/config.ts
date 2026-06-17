export const MODELS = {
  TEXT: "gemini-flash-latest",
  IMAGE: "gemini-2.5-flash-image"
};

export const ai = {
  models: {
    generateContent: async ({ model, contents, config }: { model: string; contents: any; config?: any }) => {
      const endpoint = model === MODELS.IMAGE ? '/api/ai/generate-image' : '/api/ai/generate-content';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          // Normalize contents to array if it's a string or single object
          contents: Array.isArray(contents) ? contents : (typeof contents === 'string' ? [{ parts: [{ text: contents }] }] : [contents]),
          config
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "AI Generation failed");
      }

      const data = await res.json();

      // Return a shape similar to the SDK's response
      return {
        text: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
        candidates: data.candidates,
        // Helper to mimic SDK's response.text()
        get response() {
           return { text: () => this.text };
        }
      };
    }
  }
};

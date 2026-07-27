import { useSettingsStore } from '../../store/useSettingsStore';

export const MODELS = {
  TEXT: "gemini-flash-latest",
  IMAGE: "gemini-2.5-flash-image"
};

export const ai = {
  models: {
    generateContent: async ({ model, contents, config }: { model: string; contents: any; config?: any }) => {
      const settings = useSettingsStore.getState();
      const finalModel = (model === MODELS.TEXT || model === "gemini-1.5-flash") ? (settings.gemini_model || model) : model;
      const endpoint = finalModel === MODELS.IMAGE ? '/api/ai/generate-image' : '/api/ai/generate-content';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (settings.gemini_key) {
        headers['x-gemini-key'] = settings.gemini_key;
      }
      if (settings.openai_key) {
        headers['x-openai-key'] = settings.openai_key;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: finalModel,
          // Normalize contents to array if it's a string or single object
          contents: Array.isArray(contents) ? contents : (typeof contents === 'string' ? [{ parts: [{ text: contents }] }] : [contents]),
          config,
          tools: config?.tools
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

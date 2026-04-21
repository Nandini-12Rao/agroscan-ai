// AgroScan AI - Plant disease prediction via Lovable AI Gemini vision
import { corsHeaders } from "@supabase/supabase-js/cors";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const systemPrompt = `You are AgroScan AI, an expert plant pathologist. Analyze the provided leaf image and identify the plant and any disease present.

Respond ONLY by calling the report_diagnosis function with:
- plant_name: the plant species (e.g., "Tomato", "Apple", "Potato")
- disease_name: the disease name, or "Healthy" if no disease detected
- is_healthy: true if the plant looks healthy
- confidence: your confidence as a number 0-100
- description: 1-2 sentence description of the condition
- remedies: array of 3-5 concrete treatment steps (empty if healthy)
- prevention: array of 3-5 preventive measures

If the image is NOT a plant/leaf, set plant_name to "Unknown", disease_name to "Not a plant image", confidence 0, and explain in description.`;

const tools = [
  {
    type: "function",
    function: {
      name: "report_diagnosis",
      description: "Report the plant disease diagnosis",
      parameters: {
        type: "object",
        properties: {
          plant_name: { type: "string" },
          disease_name: { type: "string" },
          is_healthy: { type: "boolean" },
          confidence: { type: "number" },
          description: { type: "string" },
          remedies: { type: "array", items: { type: "string" } },
          prevention: { type: "array", items: { type: "string" } },
        },
        required: ["plant_name", "disease_name", "is_healthy", "confidence", "description", "remedies", "prevention"],
        additionalProperties: false,
      },
    },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { imageUrl, language = "en" } = await req.json();
    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const langInstruction =
      language === "hi"
        ? "Respond with description, remedies, and prevention in Hindi (हिन्दी)."
        : language === "te"
          ? "Respond with description, remedies, and prevention in Telugu (తెలుగు)."
          : "Respond in English.";

    const aiResp = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt + " " + langInstruction },
          {
            role: "user",
            content: [
              { type: "text", text: "Diagnose this plant leaf." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "report_diagnosis" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No diagnosis returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const diagnosis = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(diagnosis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("predict error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

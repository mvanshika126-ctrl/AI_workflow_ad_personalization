async function run() {
  const url = document.getElementById("urlInput").value;
  const adPrompt = document.getElementById("promptInput").value;

  const output = document.getElementById("output");

  try {
    output.innerText = "Fetching page content...";

    // STEP 1: Fetch page content via Jina
    const res = await fetch("https://r.jina.ai/" + url);
    const pageContent = await res.text();

    output.innerText = "Generating personalized CRO content...";

    // STEP 2: Send to AI (replace THIS with your actual API call)
    const aiResponse = await callAI(pageContent, adPrompt);

    // STEP 3: Clean response (in case model returns markdown)
    const cleaned = extractJSON(aiResponse);

    const data = JSON.parse(cleaned);

    // STEP 4: Inject into existing DOM (enhancement, not replacement)
    document.getElementById("headline").innerText = data.headline || "";
    document.getElementById("subtext").innerText = data.subtext || "";
    document.getElementById("cta").innerText = data.cta || "";

    output.innerText = "Page personalized successfully.";

  } catch (err) {
    console.error(err);
    output.innerText = "Error generating personalized page.";
  }
}


/**
 * STEP 5: AI CALL (replace API key + endpoint)
 * You can use OpenAI or Claude here.
 */
async function callAI(pageContent, adPrompt) {

  const prompt = `
You are a CRO (Conversion Rate Optimization) expert.

You will receive:
1. A landing page content
2. An ad creative

TASK:
- Improve conversion rate
- Personalize messaging based on ad
- Keep structure minimal

Return ONLY valid JSON:
{
  "headline": "...",
  "subtext": "...",
  "cta": "..."
}

LANDING PAGE:
${pageContent}

AD CREATIVE:
${adPrompt}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_API_KEY_HERE"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a CRO expert." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })
  });

  const data = await response.json();

  return data.choices[0].message.content;
}


/**
 * STEP 6: Extract JSON safely from LLM output
 * Handles cases where model returns extra text
 */
function extractJSON(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return text.substring(start, end + 1);
}

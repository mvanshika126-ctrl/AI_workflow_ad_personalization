// -----------------------------
// 1. Fetch webpage HTML
// -----------------------------
async function fetchPage(url) {
  try {
    const res = await fetch(url);
    return await res.text();
  } catch (err) {
    console.error("Fetch failed:", err);
    return "";
  }
}

// -----------------------------
// 2. Extract structured content
// -----------------------------
function extractContent(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  return {
    headings: [...doc.querySelectorAll("h1,h2")].map(e => e.innerText.trim()),
    paragraphs: [...doc.querySelectorAll("p")].map(e => e.innerText.trim()),
    buttons: [...doc.querySelectorAll("button,a")].map(e => e.innerText.trim())
  };
}

// -----------------------------
// 3. Build strict AI prompt
// -----------------------------
function buildPrompt(structure, userPrompt) {
  return `
You are a STRICT CONTENT TRANSFORMATION ENGINE.

CRITICAL RULES:
- Do NOT change structure
- Do NOT add or remove fields
- Only rewrite text values
- Keep array lengths EXACTLY the same
- Do NOT invent new sections or content
- Preserve meaning of original page

INPUT JSON:
${JSON.stringify(structure)}

USER REQUEST:
${userPrompt}

OUTPUT FORMAT:
Return ONLY valid JSON in this structure:
{
  "headings": [...],
  "paragraphs": [...],
  "buttons": [...]
}
`;
}

// -----------------------------
// 4. AI API call (YOU MUST CONFIGURE THIS)
// -----------------------------
async function callAI(prompt) {
  try {
    const res = await fetch("YOUR_AI_ENDPOINT_HERE", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_KEY"
      },
      body: JSON.stringify({
        prompt: prompt
      })
    });

    const data = await res.json();

    // expects AI to return JSON string in data.output
    return JSON.parse(data.output);

  } catch (err) {
    console.error("AI call failed:", err);
    return {
      headings: [],
      paragraphs: [],
      buttons: []
    };
  }
}

// -----------------------------
// 5. Apply AI changes to original HTML
// -----------------------------
function applyChanges(originalHTML, updated) {
  const doc = new DOMParser().parseFromString(originalHTML, "text/html");

  // Update headings
  let i = 0;
  doc.querySelectorAll("h1,h2").forEach(el => {
    if (updated.headings && updated.headings[i]) {
      el.innerText = updated.headings[i++];
    }
  });

  // Update paragraphs
  i = 0;
  doc.querySelectorAll("p").forEach(el => {
    if (updated.paragraphs && updated.paragraphs[i]) {
      el.innerText = updated.paragraphs[i++];
    }
  });

  // Update buttons/links
  i = 0;
  doc.querySelectorAll("button,a").forEach(el => {
    if (updated.buttons && updated.buttons[i]) {
      el.innerText = updated.buttons[i++];
    }
  });

  return doc.documentElement.outerHTML;
}

// -----------------------------
// 6. Main function (runs everything)
// -----------------------------
async function run() {
  const url = document.getElementById("urlInput").value;
  const userPrompt = document.getElementById("promptInput").value;

  if (!url) {
    alert("Please enter a URL");
    return;
  }

  // Step 1: fetch page
  const html = await fetchPage(url);

  if (!html) {
    alert("Failed to fetch page");
    return;
  }

  // Step 2: extract structure
  const structured = extractContent(html);

  // Step 3: build AI prompt
  const prompt = buildPrompt(structured, userPrompt);

  // Step 4: get AI response
  const updated = await callAI(prompt);

  // Step 5: rebuild page
  const finalHTML = applyChanges(html, updated);

  // Step 6: render output
  document.getElementById("output").innerHTML = finalHTML;
}

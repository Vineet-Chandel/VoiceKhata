const apiKey = "dummy";
fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: "gemini-1.5-flash",
    messages: [{role: "system", content: "system text"}, {role: "user", content: "hi"}],
    temperature: 0.5,
    max_tokens: 900
  })
}).then(res => res.text()).then(console.log);

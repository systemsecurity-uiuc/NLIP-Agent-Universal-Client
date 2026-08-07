const requestBox = document.getElementById("request");
const responseBox = document.getElementById("response");
const endpointInput = document.getElementById("endpoint");
const agentSelect = document.getElementById("agent");
const statusText = document.getElementById("status");

const endpoints = {
  knowledge: "https://halo-pays-garlic-costume.trycloudflare.com/nlip",
  builder: "https://telephone-indicators-behavior-listen.trycloudflare.com/nlip",
  custom: ""
};

const templates = {
  knowledge: {
    messageType: "request",
    format: "text",
    subformat: "english",
    content: "What is NLIP?"
  },
  builder: {
    messageType: "request",
    format: "text",
    subformat: "english",
    content: "Create an NLIP message asking the knowledge agent to explain ECMA-434 security profiles."
  },
  security: {
    messageType: "request",
    format: "text",
    subformat: "english",
    content: "What does ECMA-434 describe for NLIP security?"
  }
};

function setTemplate(name) {
  requestBox.value = JSON.stringify(templates[name], null, 2);
  if (name === "builder") {
    setAgent("builder");
  } else if (agentSelect.value !== "custom") {
    setAgent("knowledge");
  }
}

function setAgent(name) {
  agentSelect.value = name;
  if (name !== "custom") {
    endpointInput.value = endpoints[name];
  }
  statusText.textContent = "Endpoint selected. Use Check status before a demo.";
}

function healthUrl(endpointUrl) {
  const url = new URL(endpointUrl);
  const originalPath = url.pathname;
  url.pathname = url.pathname.replace(/\/nlip\/?$/, "/health");
  if (url.pathname === originalPath) {
    url.pathname = "/health";
  }
  return url.toString();
}

function renderResponse(text, response) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    responseBox.textContent = response.ok ? text : `HTTP ${response.status}\n\n${text}`;
    return;
  }

  responseBox.textContent = JSON.stringify(parsed, null, 2);
  if (!response.ok) {
    statusText.textContent = `Request failed with HTTP ${response.status}.`;
    return;
  }

  const warning = parsed?.content?.extra?.llm_error || parsed?.content?.llm_error;
  if (warning) {
    statusText.textContent = "Response returned with a model warning; see llm_error.";
  } else {
    statusText.textContent = "Request completed successfully.";
  }
}

async function sendMessage() {
  let payload;
  try {
    payload = JSON.parse(requestBox.value);
  } catch (error) {
    responseBox.textContent = `Invalid JSON: ${error.message}`;
    return;
  }

  responseBox.textContent = "Sending...";
  try {
    const response = await fetch(endpointInput.value, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    renderResponse(text, response);
  } catch (error) {
    responseBox.textContent = `Request failed: ${error.message}`;
    statusText.textContent = "Request failed before the endpoint returned a response.";
  }
}

async function checkStatus() {
  statusText.textContent = "Checking endpoint...";
  try {
    const response = await fetch(healthUrl(endpointInput.value), {method: "GET"});
    const text = await response.text();
    if (!response.ok) {
      statusText.textContent = `Health check failed with HTTP ${response.status}.`;
      responseBox.textContent = text;
      return;
    }

    try {
      const parsed = JSON.parse(text);
      statusText.textContent = `${parsed.agent || "Endpoint"} is ${parsed.status || "reachable"} using ${parsed.model || "configured model"}.`;
      responseBox.textContent = JSON.stringify(parsed, null, 2);
    } catch {
      statusText.textContent = "Endpoint is reachable, but health response was not JSON.";
      responseBox.textContent = text;
    }
  } catch (error) {
    statusText.textContent = `Health check failed: ${error.message}`;
  }
}

document.getElementById("knowledge").addEventListener("click", () => setTemplate("knowledge"));
document.getElementById("builder").addEventListener("click", () => setTemplate("builder"));
document.getElementById("security").addEventListener("click", () => setTemplate("security"));
document.getElementById("check").addEventListener("click", checkStatus);
document.getElementById("send").addEventListener("click", sendMessage);
agentSelect.addEventListener("change", () => {
  if (agentSelect.value === "custom") {
    statusText.textContent = "Custom endpoint selected.";
    endpointInput.focus();
    return;
  }
  setAgent(agentSelect.value);
});

setAgent("knowledge");
setTemplate("knowledge");

const requestBox = document.getElementById("request");
const responseBox = document.getElementById("response");
const endpointInput = document.getElementById("endpoint");

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
    try {
      responseBox.textContent = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      responseBox.textContent = text;
    }
  } catch (error) {
    responseBox.textContent = `Request failed: ${error.message}`;
  }
}

document.getElementById("knowledge").addEventListener("click", () => setTemplate("knowledge"));
document.getElementById("builder").addEventListener("click", () => setTemplate("builder"));
document.getElementById("security").addEventListener("click", () => setTemplate("security"));
document.getElementById("send").addEventListener("click", sendMessage);

setTemplate("knowledge");

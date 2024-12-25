const { OpenAI } = require("@arakoodev/edgechains.js/ai");

const path = require("path");
const Jsonnet = require("@arakoodev/jsonnet");
const jsonnet = new Jsonnet();

const secretsPath = path.join(__dirname, "../../jsonnet/secrets.jsonnet");
const apiKey = JSON.parse(jsonnet.evaluateFile(secretsPath)).openai_api_key;
const openai = new OpenAI({ apiKey });

function extractJson(content: string) {
  const regex = /\{(?:[^{}]|{[^{}]*})*\}/g;
  const match = content.match(regex);

  if (match) {
    return match[0].replace(/"([^"]*)"/g, (match) =>
      match.replace(/\n/g, "\\n")
    );
  } else {
    return "";
  }
}

async function callOpenAI(systemPrompt: string, userPrompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 1024,
      temperature: 0.5,
      response_format: {
        type: "json_object",
      },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    let content = completion.choices[0]?.message?.content?.trim() ?? "";
    console.log("OpenAI Output: \n", content);
    if (content && content.includes("{") && content.includes("}")) {
      content = extractJson(content);
    }

    console.log(`Content: ${content}`);
    return content;
  } catch (e) {
    throw new Error("Error in generating result");
  }
}

async function openAIcall() {
  return async (systemPrompt: string, userPrompt: string) => {
    let content = {
      status: true,
      email: "",
      sms: "",
    };

    let results = "";

    results = await callOpenAI(systemPrompt, userPrompt);
    try {
      if (results) {
        const parsedResults = JSON.parse(results);
        content = { ...content, ...parsedResults, status: true };
      }
    } catch (err) {
      throw new Error("Error in returning result");
    }

    return JSON.stringify(content);
  };
}

module.exports = openAIcall;

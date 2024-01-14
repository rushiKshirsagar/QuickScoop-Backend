const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const ModelConnect = async (message, lengthOfSummary) => {
  // const lengthOfSummary = req.body.length || 25;
  // const { message } = req.body;
  const addSummarizationText =
    message +
    "." +
    " " +
    `Summarize the above article in ${lengthOfSummary} words.`;

  try {
    if (!message) {
      console.log("No message!");
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: addSummarizationText }],
      });
      return response.choices[0].message.content;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = ModelConnect;

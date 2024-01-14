const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: "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",
});

const ModelConnect = async (req) => {
  const lengthOfSummary = req.body.length || 25;
  const { message } = req.body;
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
      return {
        summary: response.choices[0].message.content,
        inputText: req.body.message,
        lengthOfSummary: req.body.length || 25,
      };
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = ModelConnect;

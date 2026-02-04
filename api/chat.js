import Vellum from "vellum-ai";

const vellum = new Vellum({ 
  apiKey: process.env.VELLUM_API_KEY 
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, user_id } = req.body;

  if (!message || !user_id) {
    return res.status(400).json({ error: "Missing message or user_id" });
  }

  try {
    const response = await vellum.executeWorkflowStream({
      workflowDeploymentName: process.env.VELLUM_DEPLOYMENT_NAME,
      inputs: [],
      chatHistory: [{ role: "USER", text: message }],
      externalId: `zalo-${user_id}`,
    });

    let reply = "";
    for await (const event of response) {
      if (event.type === "WORKFLOW.EXECUTION.FULFILLED") {
        const output = event.outputs.find(o => o.name === "response");
        reply = output?.value || "Ủa, tui không hiểu 😅";
      }
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Bot đang bận 😢" });
  }
}


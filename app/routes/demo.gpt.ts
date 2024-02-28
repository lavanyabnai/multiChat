// app/routes/demo/chat.js
export const loader = async ({ request }) => {
  const urlSearchParams = new URL(request.url).searchParams;
  const prompt = urlSearchParams.get("prompt");

  if (!prompt) {
    return new Response("Prompt is required", { status: 400 });
  }

  const openAIResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
    },
  );

  console.log(openAIResponse);

  if (!openAIResponse.ok) {
    // Handle errors from OpenAI
    return new Response("Error calling OpenAI", {
      status: openAIResponse.status,
    });
  }

  const stream = new ReadableStream({
    start(controller) {
      const reader = openAIResponse.body.getReader();
      return pump();

      function pump() {
        return reader.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          return pump();
        });
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
 
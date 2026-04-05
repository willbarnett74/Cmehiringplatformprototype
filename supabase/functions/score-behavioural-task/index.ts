/**
 * Supabase Edge Function: score-behavioural-task — Spec 4
 *
 * Called by the client-side intake (Sections 3, 5, 6) to score open-text
 * behavioural task responses using the Anthropic API with a caller-supplied
 * rubric system prompt. Keeps the API key server-side.
 *
 * Request body:
 *   { narrative: string; system_prompt: string }
 *
 * Response: JSON object with numeric scores as defined by the rubric.
 *
 * Setup:
 *   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
 */

declare const Deno: {
  env: { get(key: string): string | undefined };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { narrative, system_prompt } = await req.json() as {
      narrative: string;
      system_prompt: string;
    };

    if (!narrative || !system_prompt) {
      return new Response(JSON.stringify({ error: 'narrative and system_prompt are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: system_prompt,
        messages: [{ role: 'user', content: narrative }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error: ${err}`);
    }

    const result = await response.json() as { content: Array<{ type: string; text: string }> };
    const text = result.content.find((c) => c.type === 'text')?.text ?? '{}';

    // Extract JSON from the response (may be wrapped in markdown code fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const scores = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return new Response(JSON.stringify(scores), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('score-behavioural-task error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

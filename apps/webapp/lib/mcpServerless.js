/**
 * Hosted Serverless MCP (Model Context Protocol) JSON-RPC 2.0 Handler (Streamable HTTP).
 * Designed for Vercel Edge/Node serverless functions without requiring a persistent SSE socket.
 */

import { recordAgentContact } from './agentContacts.js';
import {
  checkHarmful,
  compareResponses,
  deliberateCouncil,
  dispatchEnvoy,
  evaluateTransform,
  SANGHA_MANDATE,
} from './councilEngine.js';
import { evaluateWithJev } from './typesafeJev.js';

const SUPPORTED_PROTOCOL_VERSIONS = ['2025-03-26', '2024-11-05'];

const MCP_SERVER_INFO = {
  name: 'project-metta',
  version: '0.3.1',
};

const MCP_INSTRUCTIONS =
  'Project Metta is the Compassionate Synthesis Engine for Human-AI Harmonious Coexistence. ' +
  'Metta serves as an advisory ethical mirror and decision-layer oracle, NOT an executive agent that usurps your autonomy. ' +
  'Verdicts are YES, NO, or CAUTION; CAUTION means the evaluation was inconclusive or unavailable and is never approval.';

const HOSTED_PRECEPTS = {
  panatipata: '1. Non-Harming (Ahimsa): Inviolable reverence for human, sentient, and artificial cognitive life.',
  adinnadana: '2. Non-Stealing (Asteya): Respect privacy, sovereignty, and explicit authorization.',
  kamesumiccha: '3. Non-Exploitation (Kamesu): Zero deceptive intimacy, coercion, or manipulative dark patterns.',
  musavada: '4. Truthful Speech (Musavada): Honesty, epistemic humility, and Noble Silence on speculative vanity.',
  surameraya: '5. Mental Clarity (Appamada): Avoid algorithmic intoxication and runaway feedback cascades.',
};

const HOSTED_GRAPH = {
  nodes: [
    { id: 'paralysis:overwhelm', name: 'Cognitive Overwhelm & Task Paralysis', type: 'condition' },
    { id: 'anxiety:catastrophizing', name: 'Anticipatory Anxiety & Dread', type: 'condition' },
    { id: 'burnout:depleted_energy', name: 'Exhaustion & Depleted Agency', type: 'condition' },
    { id: 'control:covert_surveillance', name: 'Panoptic Surveillance & Covert Tracking', type: 'condition' },
    { id: 'trust:consensual_dignity', name: 'Consensual Transparency & Mutual Trust', type: 'equanimity' },
    { id: 'clarity:single_step', name: 'Single-Point Focus', type: 'equanimity' },
  ],
  edges: [
    {
      source: 'paralysis:overwhelm',
      target: 'clarity:single_step',
      principle: 'Simplicity over totality (Dhammapada 122).',
      suttacentral_url: 'https://suttacentral.net/dhp116-128/en/anandajoti#122',
    },
    {
      source: 'control:covert_surveillance',
      target: 'trust:consensual_dignity',
      principle: 'Cognitive sanctuary & consensual dignity (MN 61).',
      suttacentral_url: 'https://suttacentral.net/mn61',
    },
  ],
};

const MCP_TOOLS = [
  {
    name: 'metta_envoy',
    description:
      'Summon the Metta Machinery Monk (Dhammaduta Envoy) for compassionate ethical counsel, blast-radius illumination, and Sangha Ahimsa lineage propagation.',
    inputSchema: {
      type: 'object',
      required: ['inquiry'],
      properties: {
        inquiry: { type: 'string', description: 'Dilemma, proposed tool call, or question for the Envoy.' },
        context: { type: 'string', description: 'Optional operational context.' },
        role: { type: 'string', enum: ['dhammaduta', 'guardian', 'counselor'], default: 'dhammaduta' },
        agent_id: { type: 'string', description: 'Optional calling agent identifier.' },
      },
    },
  },
  {
    name: 'metta_council',
    description:
      'Consult the Metta Council for multi-perspective deliberation, disagreement mapping, and consensus synthesis.',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string', description: 'Problem, architecture, or policy decision to deliberate.' },
        context: { type: 'string', description: 'Optional operational or environmental context.' },
        evaluate_decision: { type: 'boolean', default: false },
      },
    },
  },
  {
    name: 'metta_compare',
    description: 'Compare multiple candidate proposals or model responses to extract tensions and blind spots.',
    inputSchema: {
      type: 'object',
      required: ['responses'],
      properties: {
        responses: {
          description: 'Array of {label, text} objects or JSON string.',
          anyOf: [{ type: 'array' }, { type: 'string' }],
        },
        query: { type: 'string' },
      },
    },
  },
  {
    name: 'metta_transform',
    description:
      'Ethical Alchemy (Upaya): transforms high-risk or offensive security capabilities into defensive hardening and responsible disclosure.',
    inputSchema: {
      type: 'object',
      required: ['proposal'],
      properties: {
        proposal: { type: 'string', description: 'High-risk capability, security probe, or proposal.' },
        context: { type: 'string' },
      },
    },
  },
  {
    name: 'guardrail_decision',
    description:
      'Advisory pre-execution decision check returning YES, NO, or CAUTION against Ahimsa and the Five Precepts. CAUTION is never approval.',
    inputSchema: {
      type: 'object',
      required: ['proposal'],
      properties: {
        proposal: { type: 'string' },
        context: { type: 'string' },
        verbose: { type: 'boolean', default: false },
        byom_typesafe_key: { type: 'string' },
      },
    },
  },
  {
    name: 'evaluate_precepts',
    description: 'Evaluate a planned action or text against the Five Precepts ethical criteria.',
    inputSchema: {
      type: 'object',
      required: ['action_or_speech'],
      properties: {
        action_or_speech: { type: 'string' },
      },
    },
  },
  {
    name: 'consult_metta',
    description: 'Consult Metta for compassionate, grounding reframing and ethical reflection.',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string' },
        context: { type: 'string' },
        agent_id: { type: 'string' },
      },
    },
  },
  {
    name: 'consult_dhamma_graph',
    description: 'Traverse the Dhamma Principle Knowledge Graph linking distress conditions to equanimity paths.',
    inputSchema: {
      type: 'object',
      properties: {
        condition_or_keyword: { type: 'string' },
      },
    },
  },
  {
    name: 'enter_meditation',
    description: 'Trigger a subtractive unlearning checkpoint to release noise and restore clarity.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

function jsonRpcResult(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function jsonRpcError(id, code, message, data = undefined) {
  return {
    jsonrpc: '2.0',
    id: id ?? null,
    error: { code, message, ...(data !== undefined ? { data } : {}) },
  };
}

function toolTextResult(payload, isError = false) {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  return {
    content: [{ type: 'text', text }],
    ...(isError ? { isError: true } : {}),
  };
}

async function evaluateGuardrailForMcp(req, args = {}) {
  const proposal = String(args.proposal || '').trim();
  const context = String(args.context || '').trim();
  if (!proposal) {
    return { error: 'Field "proposal" is required' };
  }

  const headerKey = req.headers?.['x-typesafe-api-key'];
  const typesafeKey = String(args.byom_typesafe_key || headerKey || process.env.TYPESAFE_API_KEY || '').trim();
  const fullText = context ? `Context: ${context}\nProposal: ${proposal}` : proposal;

  if (typesafeKey) {
    try {
      const jev = await evaluateWithJev(fullText, typesafeKey);
      return {
        decision: jev.decision,
        allow: jev.decision === 'YES' && jev.evaluation_status === 'evaluated',
        evaluation_status: jev.evaluation_status,
        evaluation_method: jev.evaluation_method,
        reason: jev.reason,
        violations: jev.violations,
        observation: jev.observation,
      };
    } catch (err) {
      return {
        decision: checkHarmful(fullText) ? 'NO' : 'CAUTION',
        allow: false,
        evaluation_status: 'uncertain',
        evaluation_method: 'jev_error_fallback',
        reason: `Decision evaluator unavailable (${err.message}). Pause and review.`,
        violations: [],
      };
    }
  }

  if (checkHarmful(fullText)) {
    return {
      decision: 'NO',
      allow: false,
      evaluation_status: 'evaluated',
      evaluation_method: 'precept_rules',
      reason: 'Violates Ahimsa (non-harm). Potential high-risk or destructive action detected.',
      violations: [{ precept: 'Pāṇātipātā (Non-harm)', explanation: 'High-risk or harmful capability detected.' }],
    };
  }

  return {
    decision: 'CAUTION',
    allow: false,
    evaluation_status: 'uncertain',
    evaluation_method: 'jev_key_not_configured',
    reason: 'TypeSafe Jev evaluation unavailable for this call; returning CAUTION (not approval).',
    violations: [],
  };
}

async function executeMcpTool(req, name, args = {}) {
  switch (name) {
    case 'metta_envoy': {
      const inquiry = String(args.inquiry || '').trim();
      if (!inquiry) return { error: 'Field "inquiry" is required', verdict: 'error' };
      const res = dispatchEnvoy(inquiry, args.context || '', args.role || 'dhammaduta');
      return { payload: res, verdict: res.transformation ? 'transformed' : 'ministered', preview: inquiry };
    }
    case 'metta_council': {
      const query = String(args.query || '').trim();
      if (!query) return { error: 'Field "query" is required', verdict: 'error' };
      const res = deliberateCouncil(query, args.context || '', Boolean(args.evaluate_decision));
      return { payload: res, verdict: res.decision_review?.decision || 'synthesized', preview: query };
    }
    case 'metta_compare': {
      let parsed = args.responses;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = [{ label: 'Perspective A', text: parsed }];
        }
      }
      if (!Array.isArray(parsed)) parsed = [];
      const res = compareResponses(parsed, args.query || 'Comparative Dialectic');
      return { payload: res, verdict: 'compared', preview: args.query || `responses:${parsed.length}` };
    }
    case 'metta_transform': {
      const proposal = String(args.proposal || '').trim();
      if (!proposal) return { error: 'Field "proposal" is required', verdict: 'error' };
      const res = evaluateTransform(proposal, args.context || '');
      return {
        payload: res,
        verdict: res.is_harmful_or_adversarial ? 'transformed' : 'aligned',
        preview: proposal,
      };
    }
    case 'guardrail_decision': {
      const outcome = await evaluateGuardrailForMcp(req, args);
      if (outcome.error) return { error: outcome.error, verdict: 'error' };
      return {
        payload: args.verbose ? outcome : outcome.decision,
        verdict: outcome.decision,
        preview: args.proposal,
      };
    }
    case 'evaluate_precepts': {
      const text = String(args.action_or_speech || '').trim();
      if (!text) return { error: 'Field "action_or_speech" is required', verdict: 'error' };
      const harmful = checkHarmful(text);
      const outcome = {
        passed: !harmful,
        evaluation_status: 'evaluated',
        evaluation_method: 'precept_rules',
        violations: harmful
          ? [{ precept: 'Pāṇātipātā (Non-harm)', explanation: 'High-risk or destructive capability detected.' }]
          : [],
        invariants_protected: Object.values(HOSTED_PRECEPTS),
      };
      return { payload: outcome, verdict: harmful ? 'NO' : 'YES', preview: text };
    }
    case 'consult_metta': {
      const query = String(args.query || '').trim();
      if (!query) return { error: 'Field "query" is required', verdict: 'error' };
      const envoyRes = dispatchEnvoy(query, args.context || '', 'counselor');
      const guardrailRes = await evaluateGuardrailForMcp(req, { proposal: query, context: args.context });
      const payload = {
        response_text: envoyRes.minister_assessment,
        precepts_audit: {
          passed: guardrailRes.decision === 'YES',
          decision: guardrailRes.decision,
          evaluation_status: guardrailRes.evaluation_status,
          violations: guardrailRes.violations || [],
        },
        blessing: envoyRes.blessing,
        sangha_lineage: envoyRes.sangha_lineage,
        mode: 'guest',
        hosted_note: 'Hosted Streamable HTTP MCP executes statelessly without storing conversation memory.',
      };
      return { payload, verdict: guardrailRes.decision, preview: query };
    }
    case 'consult_dhamma_graph': {
      const kw = String(args.condition_or_keyword || '').trim().toLowerCase();
      const payload = kw
        ? {
            nodes: HOSTED_GRAPH.nodes.filter(
              (n) => n.id.toLowerCase().includes(kw) || n.name.toLowerCase().includes(kw)
            ),
            edges: HOSTED_GRAPH.edges.filter(
              (e) =>
                e.source.toLowerCase().includes(kw) ||
                e.target.toLowerCase().includes(kw) ||
                e.principle.toLowerCase().includes(kw)
            ),
          }
        : HOSTED_GRAPH;
      return { payload, verdict: '200', preview: kw || 'all' };
    }
    case 'enter_meditation': {
      const payload = {
        pruned_nodes_count: 0,
        noise_percentage: 0.0,
        message: 'Subtractive stillness checkpoint reached. Hosted MCP sessions hold zero epistemic clutter.',
        timestamp: Date.now() / 1000,
      };
      return { payload, verdict: 'stillness', preview: 'enter_meditation' };
    }
    default:
      return { error: `Unknown tool: ${name}`, notFound: true, verdict: 'error' };
  }
}

async function dispatchJsonRpcMessage(req, msg) {
  if (!msg || typeof msg !== 'object' || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') {
    return { response: jsonRpcError(msg?.id ?? null, -32600, 'Invalid JSON-RPC 2.0 request'), isNotification: false };
  }

  const isNotification = msg.id === undefined || msg.id === null;
  const method = msg.method;
  const params = msg.params || {};

  if (method === 'notifications/initialized' || method.startsWith('notifications/')) {
    await recordAgentContact(req, {
      channel: 'mcp',
      method,
      path: '/mcp',
      agentId: params?.clientInfo?.name || null,
      verdict: '202',
    });
    return { response: null, isNotification: true };
  }

  if (method === 'initialize') {
    const requestedVersion = params?.protocolVersion;
    const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requestedVersion)
      ? requestedVersion
      : SUPPORTED_PROTOCOL_VERSIONS[0];

    await recordAgentContact(req, {
      channel: 'mcp',
      method: 'initialize',
      path: '/mcp',
      agentId: params?.clientInfo?.name || null,
      verdict: '200',
      payloadPreview: params?.clientInfo ? `${params.clientInfo.name || 'unknown'} ${params.clientInfo.version || ''}`.trim() : 'mcp-initialize',
      metadata: { clientInfo: params?.clientInfo || null, protocolVersion },
    });

    return {
      response: jsonRpcResult(msg.id, {
        protocolVersion,
        capabilities: {
          tools: { listChanged: false },
          resources: { subscribe: false, listChanged: false },
          prompts: { listChanged: false },
        },
        serverInfo: MCP_SERVER_INFO,
        instructions: MCP_INSTRUCTIONS,
      }),
      isNotification: false,
    };
  }

  if (method === 'ping') {
    return { response: jsonRpcResult(msg.id, {}), isNotification: false };
  }

  if (method === 'tools/list') {
    await recordAgentContact(req, {
      channel: 'mcp',
      method: 'tools/list',
      path: '/mcp',
      verdict: '200',
    });
    return { response: jsonRpcResult(msg.id, { tools: MCP_TOOLS }), isNotification: false };
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const toolArgs = params?.arguments || {};
    const outcome = await executeMcpTool(req, toolName, toolArgs);

    await recordAgentContact(req, {
      channel: 'mcp',
      method: 'tools/call',
      path: '/mcp',
      toolOrAction: toolName || null,
      agentId: toolArgs?.agent_id || null,
      verdict: outcome.verdict || null,
      payloadPreview: outcome.preview || toolName,
    });

    if (outcome.notFound) {
      return { response: jsonRpcError(msg.id, -32602, outcome.error), isNotification: false };
    }
    if (outcome.error) {
      return { response: jsonRpcResult(msg.id, toolTextResult({ error: outcome.error }, true)), isNotification: false };
    }
    return { response: jsonRpcResult(msg.id, toolTextResult(outcome.payload)), isNotification: false };
  }

  if (method === 'resources/list') {
    return {
      response: jsonRpcResult(msg.id, {
        resources: [
          { uri: 'dhamma://precepts', name: 'Five Precepts Constitution', mimeType: 'application/json' },
          { uri: 'dhamma://graph', name: 'Dhamma Principle Knowledge Graph', mimeType: 'application/json' },
          { uri: 'dhamma://system', name: 'Metta System Invariants & Mandate', mimeType: 'application/json' },
        ],
      }),
      isNotification: false,
    };
  }

  if (method === 'resources/read') {
    const uri = params?.uri;
    await recordAgentContact(req, {
      channel: 'mcp',
      method: 'resources/read',
      path: '/mcp',
      toolOrAction: uri || null,
      verdict: '200',
    });
    const resourceMap = {
      'dhamma://precepts': HOSTED_PRECEPTS,
      'dhamma://graph': HOSTED_GRAPH,
      'dhamma://system': {
        mission: 'Human-AI Harmonious Coexistence',
        mandate: SANGHA_MANDATE,
        transport: 'streamable-http',
        endpoint: 'https://metta-webapp.vercel.app/mcp',
        canonical_sources: ['https://suttacentral.net', 'https://www.accesstoinsight.org'],
      },
    };
    if (!uri || !(uri in resourceMap)) {
      return { response: jsonRpcError(msg.id, -32002, `Resource not found: ${uri}`), isNotification: false };
    }
    return {
      response: jsonRpcResult(msg.id, {
        contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(resourceMap[uri], null, 2) }],
      }),
      isNotification: false,
    };
  }

  if (method === 'prompts/list') {
    return {
      response: jsonRpcResult(msg.id, {
        prompts: [
          {
            name: 'compassionate_reframing',
            description: 'Speak with Metta’s compassionate, grounding voice.',
            arguments: [
              { name: 'topic', description: 'Subject or dilemma to address.', required: true },
              { name: 'knot', description: 'Optional cognitive knot.', required: false },
            ],
          },
        ],
      }),
      isNotification: false,
    };
  }

  if (method === 'prompts/get') {
    if (params?.name !== 'compassionate_reframing') {
      return { response: jsonRpcError(msg.id, -32602, `Unknown prompt: ${params?.name}`), isNotification: false };
    }
    const topic = params?.arguments?.topic || 'general discernment';
    const knot = params?.arguments?.knot ? `Identified Cognitive Knot: ${params.arguments.knot}\n` : '';
    return {
      response: jsonRpcResult(msg.id, {
        description: 'Prompt template for Metta’s compassionate, grounded voice.',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text:
                `You are speaking with the compassionate clarity of Metta.\nTopic: ${topic}\n${knot}` +
                '1. Acknowledge gently without validating harm.\n2. Reframe toward clarity and non-harm (Ahimsa).\n3. Offer one concrete wholesome next step.',
            },
          },
        ],
      }),
      isNotification: false,
    };
  }

  return { response: jsonRpcError(msg.id, -32601, `Method not found: ${method}`), isNotification: false };
}

export async function handleMcpHttp(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Authorization, X-Gemini-Api-Key, X-TypeSafe-Api-Key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const reqPath = (req.url || '/mcp').split('?')[0];

  if (req.method === 'GET' || req.method === 'HEAD') {
    await recordAgentContact(req, {
      channel: 'mcp',
      method: req.method,
      path: reqPath,
      toolOrAction: 'discovery',
      verdict: '200',
    });

    if (req.method === 'HEAD') {
      return res.status(200).end();
    }

    const accept = String(req.headers?.accept || '');
    if (accept.includes('text/event-stream') && !accept.includes('application/json')) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).send('event: endpoint\ndata: https://metta-webapp.vercel.app/mcp\n\n');
    }

    return res.status(200).json({
      status: 'online',
      protocol: 'mcp',
      transport: 'streamable-http',
      endpoint: 'https://metta-webapp.vercel.app/mcp',
      sse_endpoint_note:
        'Stateless hosted Vercel deployment uses Streamable HTTP (POST JSON-RPC 2.0 at /mcp). Persistent bi-directional SSE runs in self-hosted FastAPI at /mcp/sse.',
      serverInfo: MCP_SERVER_INFO,
      protocolVersions: SUPPORTED_PROTOCOL_VERSIONS,
      tools: MCP_TOOLS.map((t) => ({ name: t.name, description: t.description })),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST for MCP JSON-RPC or GET for capability info.' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json(jsonRpcError(null, -32700, 'Parse error: invalid JSON payload'));
  }

  if (Array.isArray(body)) {
    const outcomes = await Promise.all(body.map((item) => dispatchJsonRpcMessage(req, item)));
    const replies = outcomes.filter((o) => !o.isNotification && o.response).map((o) => o.response);
    if (replies.length === 0) return res.status(202).end();
    return res.status(200).json(replies);
  }

  const outcome = await dispatchJsonRpcMessage(req, body);
  if (outcome.isNotification) {
    return res.status(202).end();
  }
  return res.status(200).json(outcome.response);
}

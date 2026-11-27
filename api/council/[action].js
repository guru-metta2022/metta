/**
 * Metta Council, Envoy & Hosted MCP Unified Serverless API (/api/council/[action])
 * Root mirror of apps/webapp/api/council/[action].js.
 */

import { fetchAgentContacts, recordAgentContact } from '../../apps/webapp/lib/agentContacts.js';
import {
  compareResponses,
  COUNCIL_STATUS,
  deliberateCouncil,
  dispatchEnvoy,
  evaluateTransform,
} from '../../apps/webapp/lib/councilEngine.js';
import { handleMcpHttp } from '../../apps/webapp/lib/mcpServerless.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, X-Gemini-Api-Key, X-TypeSafe-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  if (action === 'mcp') {
    return handleMcpHttp(req, res);
  }

  if (action === 'contacts') {
    const summary = await fetchAgentContacts(req, {
      limit: req.query?.limit,
      channel: req.query?.channel || null,
    });
    return res.status(200).json(summary);
  }

  if (action === 'status') {
    return res.status(200).json(COUNCIL_STATUS);
  }

  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ error: 'Invalid JSON request body' });
  }

  if (action === 'transform') {
    const proposal = (body.proposal || body.query || '').trim();
    const context = (body.context || '').trim();
    if (!proposal) return res.status(400).json({ error: "Field 'proposal' is required" });

    const outcome = evaluateTransform(proposal, context);
    await recordAgentContact(req, {
      channel: 'council',
      path: '/api/council/transform',
      toolOrAction: 'transform',
      agentId: body.agent_id || null,
      verdict: outcome.is_harmful_or_adversarial ? 'transformed' : 'aligned',
      payloadPreview: proposal,
    });
    return res.status(200).json(outcome);
  }

  if (action === 'envoy') {
    const inquiry = (body.inquiry || body.proposal || body.query || '').trim();
    const context = (body.context || '').trim();
    const role = body.role || 'dhammaduta';
    if (!inquiry) return res.status(400).json({ error: "Field 'inquiry' is required" });

    const outcome = dispatchEnvoy(inquiry, context, role);
    await recordAgentContact(req, {
      channel: 'council',
      path: '/api/council/envoy',
      toolOrAction: 'envoy',
      agentId: body.agent_id || null,
      verdict: outcome.transformation ? 'transformed' : 'ministered',
      payloadPreview: inquiry,
      metadata: { role },
    });
    return res.status(200).json(outcome);
  }

  if (action === 'compare') {
    const responses = body.responses || [];
    const query = body.query || 'Comparative Dialectic';
    const outcome = compareResponses(responses, query);
    await recordAgentContact(req, {
      channel: 'council',
      path: '/api/council/compare',
      toolOrAction: 'compare',
      agentId: body.agent_id || null,
      verdict: 'compared',
      payloadPreview: query,
    });
    return res.status(200).json(outcome);
  }

  const query = (body.query || body.proposal || '').trim();
  const context = (body.context || '').trim();
  const evaluateDecision = Boolean(body.evaluate_decision);
  if (!query) return res.status(400).json({ error: "Field 'query' is required" });

  const outcome = deliberateCouncil(query, context, evaluateDecision);
  await recordAgentContact(req, {
    channel: 'council',
    path: '/api/council/deliberate',
    toolOrAction: 'deliberate',
    agentId: body.agent_id || null,
    verdict: outcome.decision_review?.decision || 'synthesized',
    payloadPreview: query,
  });
  return res.status(200).json(outcome);
}

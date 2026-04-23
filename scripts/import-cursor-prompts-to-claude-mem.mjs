#!/usr/bin/env bun
/**
 * One-shot import of Cursor agent chat history into claude-mem by replaying
 * user prompts via POST /api/sessions/init (platform: cursor).
 *
 * Does NOT import tool traces (would queue the memory SDK per observation).
 * Safe to re-run: skips transcripts whose user-prompt count already matches the DB.
 *
 * Usage:
 *   bun scripts/import-cursor-prompts-to-claude-mem.mjs
 *
 * Appends only missing prompts (matches by count per session so live hooks + import coexist).
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, sep } from 'node:path';
import { Database } from 'bun:sqlite';

/** Collect *.jsonl under ~/.cursor/projects/.../agent-transcripts/ (no extra deps). */
function findCursorAgentJsonl(rootDir) {
  const out = [];
  function walk(dir) {
    if (!existsSync(dir)) return;
    let names;
    try {
      names = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of names) {
      const p = join(dir, name);
      let st;
      try {
        st = statSync(p);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(p);
      else if (name.endsWith('.jsonl')) out.push(p);
    }
  }
  walk(rootDir);
  return out.filter((f) => f.includes(`${sep}agent-transcripts${sep}`));
}

function loadSettings() {
  const path = join(homedir(), '.claude-mem', 'settings.json');
  if (!existsSync(path)) return { host: '127.0.0.1', port: '37777', dataDir: join(homedir(), '.claude-mem') };
  try {
    const j = JSON.parse(readFileSync(path, 'utf8'));
    const env = j.env ?? j;
    return {
      host: env.CLAUDE_MEM_WORKER_HOST || '127.0.0.1',
      port: env.CLAUDE_MEM_WORKER_PORT || '37777',
      dataDir: env.CLAUDE_MEM_DATA_DIR || join(homedir(), '.claude-mem'),
    };
  } catch {
    return { host: '127.0.0.1', port: '37777', dataDir: join(homedir(), '.claude-mem') };
  }
}

/** Cursor project slug: Users-<user>-<path-with-dashes> → human-ish project label */
function projectFromCursorPath(filePath) {
  const m = filePath.match(/\/projects\/([^/]+)\/agent-transcripts\//);
  const slug = m ? m[1] : 'cursor-import';
  const tail = slug.replace(/^Users-[^-]+-/, '');
  if (tail && tail !== slug) {
    return tail.replace(/-/g, ' ');
  }
  return slug.replace(/-/g, ' ');
}

function extractUserPrompt(entry) {
  if (entry?.role !== 'user') return null;
  const parts = entry?.message?.content;
  if (!Array.isArray(parts)) return null;
  const text = parts.find((c) => c?.type === 'text' && typeof c.text === 'string');
  if (!text?.text) return null;
  return text.text
    .replace(/^<user_query>\s*/i, '')
    .replace(/<\/user_query>\s*$/i, '')
    .trim();
}

function sessionUuidFromPath(filePath) {
  const match = filePath.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return match ? match[0] : null;
}

async function main() {
  const { host, port, dataDir } = loadSettings();
  const base = `http://${host}:${port}`;
  const dbPath = join(dataDir, 'claude-mem.db');

  if (!existsSync(dbPath)) {
    console.error(`claude-mem database not found: ${dbPath}`);
    process.exit(1);
  }

  const db = new Database(dbPath, { readonly: true });
  const countStmt = db.prepare('SELECT COUNT(*) AS c FROM user_prompts WHERE content_session_id = ?');

  const files = findCursorAgentJsonl(join(homedir(), '.cursor', 'projects'));
  if (files.length === 0) {
    console.log(`No transcript files matched: ${pattern}`);
    process.exit(0);
  }

  let filesProcessed = 0;
  let promptsImported = 0;
  let filesSkipped = 0;

  for (const filePath of files.sort()) {
    const contentSessionId = sessionUuidFromPath(filePath);
    if (!contentSessionId) {
      console.warn(`Skip (no UUID in path): ${filePath}`);
      continue;
    }

    const raw = readFileSync(filePath, 'utf8');
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);

    const userPrompts = [];
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        const p = extractUserPrompt(entry);
        if (p) userPrompts.push(p);
      } catch {
        /* ignore bad lines */
      }
    }

    if (userPrompts.length === 0) {
      console.log(`Skip (no user messages): ${filePath}`);
      continue;
    }

    const existing = countStmt.get(contentSessionId)?.c ?? 0;
    const promptsToSend = userPrompts.slice(existing);

    if (promptsToSend.length === 0) {
      filesSkipped++;
      console.log(`Skip (already synced ${existing}/${userPrompts.length} prompts): ${contentSessionId}`);
      continue;
    }

    const project = projectFromCursorPath(filePath);

    if (existing > 0) {
      console.log(`Appending ${promptsToSend.length} prompt(s) (${existing} already in DB) — ${contentSessionId}`);
    }

    for (const prompt of promptsToSend) {
      const body = {
        contentSessionId,
        project,
        prompt: prompt.length ? prompt : '[empty prompt]',
        platformSource: 'cursor',
      };

      const res = await fetch(`${base}/api/sessions/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error(`init failed ${res.status}: ${t.slice(0, 200)}`);
        process.exit(1);
      }

      const j = await res.json();
      if (j.skipped && j.reason === 'private') {
        console.log(`  (skipped private prompt)`);
      } else {
        promptsImported++;
      }
    }

    filesProcessed++;
    console.log(`Imported ${promptsToSend.length} user prompt(s) — session ${contentSessionId} — project "${project}"`);
  }

  db.close();

  console.log(`\nDone. Files updated: ${filesProcessed}, prompts written: ${promptsImported}, files skipped: ${filesSkipped}`);
  console.log('Regenerate Cursor context if needed: hooks will update .cursor/rules on the next session, or run your usual claude-mem context flow.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

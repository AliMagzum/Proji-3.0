import { randomBytes } from 'crypto';

export interface DomainCred { name: string; key: string; password: string }

interface UserRecord {
  email: string;
  passwordHash: string;
  lobbyKey: string;
  role: 'manager' | 'employer';
  allowedDomains: string[];
  domainKey?: string;
}

interface CredsFile {
  manager: UserRecord;
  employer: UserRecord;
  domains: DomainCred[];
}

// ─── Data source ──────────────────────────────────────────────────────────────
// In production (Vercel): reads from CREDS_JSON environment variable.
// In local dev: reads from data/credentials.json file.
// Writes are only possible in local dev.

function readCreds(): CredsFile {
  // Production: CREDS_JSON env var (set in Vercel dashboard)
  if (process.env.CREDS_JSON) {
    return JSON.parse(process.env.CREDS_JSON) as CredsFile;
  }

  // Local dev: read from file
  if (process.env.NODE_ENV !== 'production') {
    // Dynamic require to avoid bundling fs in edge/client
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs   = require('fs')   as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const FILE = path.join(process.cwd(), 'data', 'credentials.json');
    return JSON.parse(fs.readFileSync(FILE, 'utf-8')) as CredsFile;
  }

  // Production without CREDS_JSON — return safe defaults (login will fail)
  console.error('[credentials] CREDS_JSON env var is not set. Authentication will not work.');
  return {
    manager:  { email: '', passwordHash: '', lobbyKey: '', role: 'manager',  allowedDomains: ['all'] },
    employer: { email: '', passwordHash: '', lobbyKey: '', role: 'employer', allowedDomains: [] },
    domains:  [],
  };
}

function writeCreds(data: CredsFile): void {
  if (process.env.CREDS_JSON || process.env.NODE_ENV === 'production') {
    // On Vercel: filesystem is read-only — writes are silently ignored.
    // To persist domain key changes, connect a database (see MIGRATION_GUIDE.md).
    console.warn('[credentials] writeCreds: filesystem writes not available in production. Change ignored.');
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs   = require('fs')   as typeof import('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path') as typeof import('path');
  const FILE = path.join(process.cwd(), 'data', 'credentials.json');
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function findUser(email: string): UserRecord | null {
  const data = readCreds();
  if (data.manager.email === email)  return data.manager;
  if (data.employer.email === email) return data.employer;
  return null;
}

export function getDomainCreds(): DomainCred[] {
  return readCreds().domains;
}

export function getDomainKey(domain: string): string | null {
  return readCreds().domains.find((d) => d.name === domain)?.key ?? null;
}

export function verifyDomainKey(domain: string, key: string): boolean {
  return getDomainKey(domain) === key;
}

export function updateDomainField(domain: string, field: 'key' | 'password', value: string) {
  const data = readCreds();
  const idx = data.domains.findIndex((d) => d.name === domain);
  if (idx === -1) throw new Error('Domain not found');
  data.domains[idx][field] = value;
  writeCreds(data);
  return data.domains[idx];
}

export function generateKey(prefix: string): string {
  const part = randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${part}`;
}

export function getDomainPrefix(domain: string): string {
  const map: Record<string, string> = {
    'Общий': 'GEN', 'Финансы': 'FIN', 'Маркетинг': 'MKT',
    'Стратегия': 'STR', 'Операции': 'OPS', 'Юридический': 'LEG',
    'Управление': 'MGT', 'Производство': 'PRD', 'Оборудование': 'EQP',
  };
  return map[domain] ?? 'DOM';
}

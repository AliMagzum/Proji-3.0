/**
 * Organization — localStorage или tokens.kz через BFF (/api/tokens/...).
 */

import { isTokensApiClientEnabled } from './tokens-api/config';
import { tokensBff } from './tokens-api/client';

export interface Organization {
  /** Локальный ключ; для API = String(organizationId) */
  id: string;
  name: string;
  role: 'admin' | 'member';
  joinedAt: string;
  /** Числовые id с tokens.kz (если подключён API) */
  organizationId?: number;
  workspaceId?: number;
}

export interface InviteRecord {
  code: string;
  orgId: string;
  orgName: string;
  createdAt: string;
  organizationId?: number;
  workspaceId?: number;
}

const ORG_KEY = 'proji_organization';
const INVITES_KEY = 'proji_invite_codes';

function readInvites(): InviteRecord[] {
  try {
    return JSON.parse(localStorage.getItem(INVITES_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeInvites(list: InviteRecord[]) {
  localStorage.setItem(INVITES_KEY, JSON.stringify(list));
}

export function getOrganization(): Organization | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(ORG_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setOrganization(org: Organization) {
  localStorage.setItem(ORG_KEY, JSON.stringify(org));
}

export function clearOrganization() {
  localStorage.removeItem(ORG_KEY);
}

export function hasOrganization(): boolean {
  return !!getOrganization();
}

/** Id воркспейса для канбана и чата */
export function getWorkspaceId(org: Organization | null): string | null {
  if (!org) return null;
  if (org.workspaceId != null) return String(org.workspaceId);
  return org.id;
}

export function isApiOrganization(org: Organization | null): boolean {
  return Boolean(org?.workspaceId != null && isTokensApiClientEnabled());
}

export function generateInviteCode(): string {
  const segment = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PROJI-${segment()}${segment()}`;
}

export function registerInvite(record: InviteRecord) {
  const list = readInvites().filter((i) => i.code !== record.code);
  writeInvites([...list, record]);
}

export function findInvite(code: string): InviteRecord | undefined {
  const normalized = code.trim().toUpperCase();
  return readInvites().find((i) => i.code.toUpperCase() === normalized);
}

export async function createOrganization(
  name: string,
): Promise<{ org: Organization; inviteCode: string }> {
  if (isTokensApiClientEnabled()) {
    const data = await tokensBff.createOrg(name);
    const org: Organization = {
      id: String(data.organizationId),
      organizationId: data.organizationId,
      workspaceId: data.workspaceId,
      name: data.name,
      role: 'admin',
      joinedAt: new Date().toISOString(),
    };
    setOrganization(org);
    registerInvite({
      code: data.inviteCode,
      orgId: org.id,
      orgName: org.name,
      organizationId: data.organizationId,
      workspaceId: data.workspaceId,
      createdAt: new Date().toISOString(),
    });
    return { org, inviteCode: data.inviteCode };
  }

  const id = `org_${Date.now().toString(36)}`;
  const inviteCode = generateInviteCode();
  const org: Organization = {
    id,
    name: name.trim(),
    role: 'admin',
    joinedAt: new Date().toISOString(),
  };
  setOrganization(org);
  registerInvite({
    code: inviteCode,
    orgId: id,
    orgName: org.name,
    createdAt: new Date().toISOString(),
  });
  return { org, inviteCode };
}

export async function joinOrganization(code: string): Promise<Organization | null> {
  if (isTokensApiClientEnabled()) {
    try {
      const data = await tokensBff.joinOrg(code);
      const org: Organization = {
        id: String(data.organizationId),
        organizationId: data.organizationId,
        workspaceId: data.workspaceId,
        name: data.name,
        role: 'member',
        joinedAt: new Date().toISOString(),
      };
      setOrganization(org);
      return org;
    } catch {
      /* fall through to local invite */
    }
  }

  const invite = findInvite(code);
  if (!invite) return null;
  const org: Organization = {
    id: invite.orgId,
    organizationId: invite.organizationId,
    workspaceId: invite.workspaceId,
    name: invite.orgName,
    role: 'member',
    joinedAt: new Date().toISOString(),
  };
  setOrganization(org);
  return org;
}

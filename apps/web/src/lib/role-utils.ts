/**
 * Role-based view tiers for CyberPulse AVA.
 * Determines what content is shown to each user type.
 */

export type ViewTier = 'frontline' | 'office' | 'security' | 'manager';
export type DemoAccountKey = 'frontline' | 'office' | 'manager' | 'security';

export interface DemoAccountOption {
  key: DemoAccountKey;
  label: string;
  description: string;
  displayName: string;
  role: string;
  jobTitle: string;
  department: string;
  viewLabel: string;
  levelLabel: string;
}

export const DEMO_ACCOUNT_OPTIONS: DemoAccountOption[] = [
  {
    key: 'frontline',
    label: 'Frontline Worker',
    description: 'Operational view with core security basics.',
    displayName: 'Liam Patel',
    role: 'Frontline Worker',
    jobTitle: 'Warehouse Operator',
    department: 'Operations',
    viewLabel: 'Frontline Worker',
    levelLabel: 'Level 1 · Recruit',
  },
  {
    key: 'office',
    label: 'Office Staff',
    description: 'Desk-based view with everyday compliance guidance.',
    displayName: 'Maya Chen',
    role: 'Office Staff',
    jobTitle: 'Operations Coordinator',
    department: 'Administration',
    viewLabel: 'Office Staff',
    levelLabel: 'Level 2 · Defender',
  },
  {
    key: 'manager',
    label: 'Manager',
    description: 'Leadership view with team oversight and coaching.',
    displayName: 'Daniel Brooks',
    role: 'Manager',
    jobTitle: 'Operations Manager',
    department: 'Management',
    viewLabel: 'Manager',
    levelLabel: 'Level 3 · Protector',
  },
  {
    key: 'security',
    label: 'IT Security',
    description: 'Advanced security view with incident visibility.',
    displayName: 'Ava Singh',
    role: 'IT Security',
    jobTitle: 'Security Analyst',
    department: 'IT Security',
    viewLabel: 'IT Security',
    levelLabel: 'Level 4 · Cyber Guardian',
  },
];

const DEMO_ACCOUNT_STORAGE_KEY = 'cyberpulse-demo-account';

const SECURITY_ROLES = [
  'security engineer', 'soc analyst', 'cloud security architect',
  'security architect', 'it manager', 'it director', 'devops engineer',
  'ciso', 'security analyst', 'information security', 'cybersecurity',
  'network engineer', 'infrastructure'
];

const MANAGER_ROLES = [
  'manager', 'director', 'head of', 'vp ', 'vice president',
  'hr director', 'regional sales manager'
];

const FRONTLINE_ROLES = [
  'operator', 'technician', 'worker', 'associate', 'operative',
  'line worker', 'production', 'warehouse', 'driver', 'field'
];

export function getStoredDemoAccount(): DemoAccountKey {
  if (typeof window === 'undefined') return 'office';
  const stored = window.localStorage.getItem(DEMO_ACCOUNT_STORAGE_KEY) as DemoAccountKey | null;
  return stored && DEMO_ACCOUNT_OPTIONS.some((option) => option.key === stored) ? stored : 'office';
}

export function setStoredDemoAccount(account: DemoAccountKey) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_ACCOUNT_STORAGE_KEY, account);
}

export function getDisplayName(
  user?: { displayName?: string | null; name?: string | null; username?: string | null; email?: string | null } | null,
  fallback = 'there'
) {
  return user?.displayName || user?.name || user?.username || user?.email || fallback;
}

export function getEffectiveUserProfile(
  user?: {
    displayName?: string | null;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    role?: string | null;
    jobTitle?: string | null;
    department?: string | null;
    [key: string]: unknown;
  } | null
) {
  const selected = getStoredDemoAccount();
  const account = DEMO_ACCOUNT_OPTIONS.find((option) => option.key === selected);
  const displayName = getDisplayName(user, account?.displayName || 'there');

  return {
    ...user,
    displayName,
    role: account?.role ?? user?.role ?? 'Office Staff',
    jobTitle: account?.jobTitle ?? user?.jobTitle ?? null,
    department: account?.department ?? user?.department ?? null,
    viewLabel: account?.viewLabel ?? 'Office Staff',
    levelLabel: account?.levelLabel ?? 'Level 2 · Defender',
  };
}

export function getViewTier(role?: string | null, jobTitle?: string | null): ViewTier {
  const combined = `${role || ''} ${jobTitle || ''}`.toLowerCase();

  if (SECURITY_ROLES.some(r => combined.includes(r))) return 'security';
  if (MANAGER_ROLES.some(r => combined.includes(r))) return 'manager';
  if (FRONTLINE_ROLES.some(r => combined.includes(r))) return 'frontline';
  return 'office';
}

export function isSecurityTier(tier: ViewTier) {
  return tier === 'security';
}

export function canSeeAdvancedData(tier: ViewTier) {
  return tier === 'security';
}

/** Plain-English status label based on active alerts and compliance */
export function getSecurityStatus(
  criticalAlerts: number,
  highAlerts: number,
  compliantDevices: number,
  totalDevices: number
): { label: string; color: string; emoji: string } {
  const nonCompliantCount = totalDevices - compliantDevices;
  if (criticalAlerts > 0 || nonCompliantCount > 2) {
    return { label: 'Action Required', color: 'text-red-500', emoji: '🔴' };
  }
  if (highAlerts > 0 || nonCompliantCount > 0) {
    return { label: 'Attention Needed', color: 'text-amber-500', emoji: '🟡' };
  }
  return { label: 'Safe', color: 'text-emerald-500', emoji: '🟢' };
}

/** Translate technical severity to plain English */
export function friendlySeverity(severity: string): string {
  switch (severity) {
    case 'critical': return 'Urgent';
    case 'high': return 'Important';
    case 'medium': return 'Moderate';
    case 'low': return 'Low Priority';
    case 'informational': return 'For Your Info';
    default: return severity;
  }
}

/** Plain English score description */
export function scoreDescription(score: number): string {
  if (score >= 90) return 'Excellent — you are well protected.';
  if (score >= 80) return 'Good — your account and device are well protected.';
  if (score >= 70) return 'Fair — a few things could be improved.';
  if (score >= 60) return 'Needs Attention — please complete the recommended actions.';
  return 'At Risk — immediate action is required to protect your account.';
}

/** Gamification level from points */
export function getLevelFromPoints(points: number): { level: number; title: string; nextAt: number } {
  if (points >= 200) return { level: 5, title: 'Security Champion', nextAt: 999 };
  if (points >= 120) return { level: 4, title: 'Cyber Guardian', nextAt: 200 };
  if (points >= 70)  return { level: 3, title: 'Protector', nextAt: 120 };
  if (points >= 30)  return { level: 2, title: 'Defender', nextAt: 70 };
  return { level: 1, title: 'Recruit', nextAt: 30 };
}

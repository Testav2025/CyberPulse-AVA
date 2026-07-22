/**
 * Role-based view tiers for CyberPulse AVA.
 * Determines what content is shown to each user type.
 */

export type ViewTier = 'frontline' | 'office' | 'security' | 'manager';

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

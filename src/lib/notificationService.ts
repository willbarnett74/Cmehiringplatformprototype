/**
 * Notification Service — Spec 9
 *
 * Manages in-app notifications for both employers and candidates.
 *
 * In production this is backed by a Supabase `notifications` table:
 *   id          uuid PK
 *   user_id     uuid FK → profiles.id
 *   type        enum review_due | pulse_check | stage_change | reminder | insight_update
 *   engagement_id uuid FK → engagements.id (nullable)
 *   message     text
 *   read        boolean default false
 *   action_url  text (nullable)
 *   created_at  timestamptz default now()
 *
 * Real-time updates come via Supabase Realtime subscriptions filtered by user_id.
 * This module simulates that with a simple in-memory store + listener pattern.
 */

export type NotificationType =
  | 'review_due'
  | 'pulse_check'
  | 'stage_change'
  | 'reminder'
  | 'insight_update';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  engagementId?: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// ── In-memory store (simulates the notifications table) ─────────────────────

let _notifications: Notification[] = [
  // Employer notifications
  {
    id: 'n1',
    userId: 'employer-1',
    type: 'review_due',
    engagementId: 'eng-1',
    message: "Jordan Chen's 30-day review is due. Complete their performance snapshot to strengthen your hiring insights.",
    read: false,
    actionUrl: '#candidates',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'n2',
    userId: 'employer-1',
    type: 'insight_update',
    message: 'New hiring insight available for your team.',
    read: false,
    actionUrl: '#insights',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: 'n3',
    userId: 'employer-1',
    type: 'reminder',
    engagementId: 'eng-2',
    message: "Reminder: Casey Wong's performance review is still pending.",
    read: true,
    actionUrl: '#candidates',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  // Candidate notifications
  {
    id: 'n4',
    userId: 'candidate-1',
    type: 'stage_change',
    message: 'Your application status with TechCorp Inc. has been updated to Final Round.',
    read: false,
    actionUrl: '#opportunities',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'n5',
    userId: 'candidate-1',
    type: 'pulse_check',
    message: "Quick check-in: how's your new role going? Takes 2 minutes.",
    read: false,
    actionUrl: '#pulse',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

// ── Listener pattern (simulates Supabase Realtime) ───────────────────────────

type Listener = () => void;
let _listeners: Listener[] = [];

export function subscribeToNotifications(fn: Listener): () => void {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

function notifyListeners() {
  _listeners.forEach((fn) => fn());
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getNotifications(userId: string): Notification[] {
  return [..._notifications]
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getUnreadCount(userId: string): number {
  return _notifications.filter((n) => n.userId === userId && !n.read).length;
}

export function markAsRead(notificationId: string): void {
  _notifications = _notifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n,
  );
  notifyListeners();
}

export function markAllAsRead(userId: string): void {
  _notifications = _notifications.map((n) =>
    n.userId === userId ? { ...n, read: true } : n,
  );
  notifyListeners();
}

export function createNotification(
  notification: Omit<Notification, 'id' | 'createdAt'>,
): Notification {
  const newNotification: Notification = {
    ...notification,
    id: Math.random().toString(36).slice(2),
    createdAt: new Date(),
  };
  _notifications = [newNotification, ..._notifications];
  notifyListeners();
  return newNotification;
}

// ── Helpers for building notification messages ────────────────────────────────

export function buildReviewDueMessage(candidateName: string, day: 30 | 90): string {
  return `${candidateName}'s ${day}-day review is due. Complete their performance snapshot to strengthen your hiring insights.`;
}

export function buildPulseCheckMessage(day: 30 | 90): string {
  return `Quick check-in: how's your new role going after ${day} days? Takes 2 minutes.`;
}

export function buildStageChangeMessage(companyName: string, newStage: string): string {
  return `Your application status with ${companyName} has been updated to ${newStage}.`;
}

export function buildReminderMessage(candidateName: string): string {
  return `Reminder: ${candidateName}'s performance review is still pending.`;
}

// ── Format helpers ────────────────────────────────────────────────────────────

export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

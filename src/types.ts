/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Competition {
  id: string;
  title: string;
  level: string;
  category: string;
  tags: string[];
  status: string;
  registrationStatus: 'open' | 'closed' | 'upcoming';
  degree?: string;
  channel?: string;
  deadline?: string;
  daysRemaining?: number;
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  level: string;
  category: string;
  requirement: string;
  window: string;
  windowStatus: 'normal' | 'ending' | 'closed';
}

export interface Notification {
  id: string;
  title: string;
  time: string;
  isRead: boolean;
}

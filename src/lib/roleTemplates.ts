/**
 * Role Templates — 10 categories with research-backed dimension weights
 * 
 * Uses the correct 6-dimension trait framework:
 *   learning_velocity, ownership_follow_through, resilience,
 *   communication_confidence, relational_intelligence, motivational_fit
 * 
 * Weights sum to 100 with 5% minimum floor per dimension.
 * Motivation signals indicate the primary motivational sub-dimensions for each role.
 */

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trait_weights: {
    learning_velocity: number;
    ownership_follow_through: number;
    resilience: number;
    communication_confidence: number;
    relational_intelligence: number;
    motivational_fit: number;
  };
  motivation_signals: string[];
}

// 10 role templates matching the spec
export const roleTemplates: RoleTemplate[] = [
  {
    id: 'sales',
    name: 'Sales',
    description: 'Client-facing role focused on relationship building, resilience under rejection, and ownership of pipeline outcomes',
    category: 'Sales',
    trait_weights: {
      ownership_follow_through: 25,
      resilience: 20,
      communication_confidence: 20,
      motivational_fit: 15,
      learning_velocity: 12,
      relational_intelligence: 8,
    },
    motivation_signals: ['recognition', 'impact'],
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Process-oriented role requiring strong ownership, resilience under operational pressure, and systematic learning',
    category: 'Operations',
    trait_weights: {
      ownership_follow_through: 32,
      resilience: 22,
      learning_velocity: 18,
      relational_intelligence: 15,
      communication_confidence: 8,
      motivational_fit: 5,
    },
    motivation_signals: ['mastery', 'autonomy'],
  },
  {
    id: 'client-services',
    name: 'Client Services',
    description: 'Relationship-driven role managing client satisfaction, retention, and trust-building over time',
    category: 'Client Services',
    trait_weights: {
      relational_intelligence: 25,
      motivational_fit: 22,
      communication_confidence: 20,
      resilience: 15,
      ownership_follow_through: 13,
      learning_velocity: 5,
    },
    motivation_signals: ['impact', 'recognition'],
  },
  {
    id: 'marketing-creative',
    name: 'Marketing / Creative',
    description: 'Creative and strategic role balancing innovation, brand thinking, and cross-functional influence',
    category: 'Marketing',
    trait_weights: {
      learning_velocity: 28,
      motivational_fit: 22,
      ownership_follow_through: 20,
      communication_confidence: 15,
      relational_intelligence: 10,
      resilience: 5,
    },
    motivation_signals: ['mastery', 'autonomy'],
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Precision-focused role requiring strong ownership of accuracy, analytical thinking, and methodical learning',
    category: 'Finance',
    trait_weights: {
      ownership_follow_through: 37,
      resilience: 18,
      learning_velocity: 18,
      relational_intelligence: 12,
      communication_confidence: 10,
      motivational_fit: 5,
    },
    motivation_signals: ['mastery', 'recognition'],
  },
  {
    id: 'technical-engineering',
    name: 'Technical / Engineering',
    description: 'Technical problem-solving role requiring rapid learning, deep ownership of systems, and intrinsic motivation',
    category: 'Engineering',
    trait_weights: {
      learning_velocity: 28,
      ownership_follow_through: 25,
      motivational_fit: 20,
      resilience: 12,
      communication_confidence: 10,
      relational_intelligence: 5,
    },
    motivation_signals: ['mastery', 'autonomy'],
  },
  {
    id: 'people-culture',
    name: 'People & Culture',
    description: 'People-focused role managing talent, culture, and organisational development through relational depth',
    category: 'People & Culture',
    trait_weights: {
      relational_intelligence: 28,
      motivational_fit: 22,
      communication_confidence: 20,
      learning_velocity: 13,
      ownership_follow_through: 12,
      resilience: 5,
    },
    motivation_signals: ['impact', 'mastery'],
  },
  {
    id: 'leadership-management',
    name: 'Leadership / Management',
    description: 'Strategic leadership role requiring resilience under ambiguity, relational depth, and ownership of team outcomes',
    category: 'Leadership',
    trait_weights: {
      resilience: 22,
      relational_intelligence: 22,
      ownership_follow_through: 20,
      communication_confidence: 18,
      learning_velocity: 13,
      motivational_fit: 5,
    },
    motivation_signals: ['impact', 'recognition'],
  },
  {
    id: 'strategy-consulting',
    name: 'Strategy / Consulting',
    description: 'Analytical and advisory role requiring rapid learning, clear communication, and intrinsic drive for mastery',
    category: 'Consulting',
    trait_weights: {
      learning_velocity: 25,
      communication_confidence: 22,
      motivational_fit: 20,
      ownership_follow_through: 18,
      resilience: 10,
      relational_intelligence: 5,
    },
    motivation_signals: ['mastery', 'impact'],
  },
  {
    id: 'admin-coordination',
    name: 'Admin / Coordination',
    description: 'Process and coordination role requiring consistent follow-through, relational awareness, and reliability',
    category: 'Admin',
    trait_weights: {
      ownership_follow_through: 35,
      relational_intelligence: 22,
      motivational_fit: 18,
      resilience: 15,
      communication_confidence: 5,
      learning_velocity: 5,
    },
    motivation_signals: ['mastery', 'recognition'],
  },
];

// Helper function to get template by ID
export function getRoleTemplateById(id: string): RoleTemplate | undefined {
  return roleTemplates.find((template) => template.id === id);
}

// Helper function to get all categories
export function getRoleCategories(): string[] {
  return Array.from(new Set(roleTemplates.map((t) => t.category)));
}

// Helper function to get all template names for display
export function getRoleTemplateNames(): string[] {
  return roleTemplates.map(t => t.name);
}

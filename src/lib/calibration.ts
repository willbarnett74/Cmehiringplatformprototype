// Calibration utility functions for performance calibration versions

export interface CalibrationCriteria {
  criterion_1?: string;
  criterion_2?: string;
  criterion_3?: string;
  criterion_4?: string;
  kpi_targets?: string;
}

export interface CalibrationVersion {
  id: string;
  role_template_id: string | null;
  version_number: number;
  criteria: CalibrationCriteria;
  created_at: string;
}

// Mock storage key for localStorage
const CALIBRATION_STORAGE_KEY = 'cme_calibration_versions';

// Get all calibration versions from localStorage
function getStoredCalibrations(): CalibrationVersion[] {
  try {
    const stored = localStorage.getItem(CALIBRATION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save calibrations to localStorage
function saveCalibrations(calibrations: CalibrationVersion[]): void {
  try {
    localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(calibrations));
  } catch (error) {
    console.error('Failed to save calibrations:', error);
  }
}

// Get active (latest version) criteria for a role template
export function getActiveCriteria(roleTemplateId: string | null): CalibrationCriteria | null {
  const calibrations = getStoredCalibrations();
  
  // Filter by role template and get the highest version number
  const versionsForTemplate = calibrations
    .filter((c) => c.role_template_id === roleTemplateId)
    .sort((a, b) => b.version_number - a.version_number);
  
  return versionsForTemplate.length > 0 ? versionsForTemplate[0].criteria : null;
}

// Upsert calibration - NEVER overwrites, always creates new version
export function upsertCalibration(
  roleTemplateId: string | null,
  criteria: CalibrationCriteria
): CalibrationVersion {
  const calibrations = getStoredCalibrations();
  
  // Find existing versions for this role template
  const existingVersions = calibrations.filter(
    (c) => c.role_template_id === roleTemplateId
  );
  
  // Determine next version number (1 for first save, increment for subsequent)
  const nextVersionNumber = existingVersions.length > 0
    ? Math.max(...existingVersions.map((v) => v.version_number)) + 1
    : 1;
  
  // Create new version
  const newVersion: CalibrationVersion = {
    id: `calibration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role_template_id: roleTemplateId,
    version_number: nextVersionNumber,
    criteria,
    created_at: new Date().toISOString(),
  };
  
  // Add to calibrations and save
  calibrations.push(newVersion);
  saveCalibrations(calibrations);
  
  console.log('Calibration saved:', {
    roleTemplateId,
    versionNumber: nextVersionNumber,
    criteria,
  });
  
  return newVersion;
}

// Get all versions for a role template (for history tracking)
export function getCalibrationHistory(roleTemplateId: string | null): CalibrationVersion[] {
  const calibrations = getStoredCalibrations();
  return calibrations
    .filter((c) => c.role_template_id === roleTemplateId)
    .sort((a, b) => b.version_number - a.version_number);
}

// Clear all calibrations (for testing/demo purposes)
export function clearAllCalibrations(): void {
  localStorage.removeItem(CALIBRATION_STORAGE_KEY);
}

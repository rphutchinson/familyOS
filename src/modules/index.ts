/**
 * FamilyOS Module System Entry Point
 *
 * This file registers all available modules and provides the main
 * interface for the module system
 */

import { moduleRegistry } from './module-registry';
import { healthcareModule } from '@/app/healthcare/healthcare-module';

/**
 * Register all available modules
 */
export function initializeModuleSystem() {
  console.log('Initializing FamilyOS module system...');

  // Register core modules
  moduleRegistry.register(healthcareModule);

  // Future modules will be registered here:
  // moduleRegistry.register(todoModule);
  // moduleRegistry.register(mealPlanningModule);
  // moduleRegistry.register(calendarModule);
  // moduleRegistry.register(streamingModule);

  console.log(`Registered ${moduleRegistry.getAllModules().length} modules`);

  return moduleRegistry;
}

/**
 * Get the module registry instance
 */
export function getModuleRegistry() {
  return moduleRegistry;
}

/**
 * Initialize modules and return registry
 */
export function setupFamilyOS() {
  return initializeModuleSystem();
}

// Export common module utilities
export { moduleRegistry } from './module-registry';
export { BaseModule } from './base-module';
export { FamilyDataProvider, useFamilyData, useCurrentUser, useFamilyMembers, useAppSettings } from '@/app/family/family-context';
export { useAppStore } from '@/lib/stores/app-store';

// Export module implementations
export { healthcareModule } from '@/app/healthcare/healthcare-module';
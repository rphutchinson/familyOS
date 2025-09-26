/**
 * FamilyOS Module System Entry Point
 *
 * This file registers all available modules and provides the main
 * interface for the module system
 */

import { moduleRegistry } from './shared/module-registry';
import { healthcareModule } from './healthcare/healthcare-module';

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
export { moduleRegistry } from './shared/module-registry';
export { BaseModule } from './shared/base-module';
export { FamilyDataProvider, useFamilyData, useCurrentUser, useFamilyMembers, useAppSettings } from './shared/family-context';
export { useAppStore } from './core/app-store';

// Export module implementations
export { healthcareModule } from './healthcare/healthcare-module';
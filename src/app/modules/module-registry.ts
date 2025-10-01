import { FamilyModule } from '@/types';
import { BaseModule } from './base-module';

/**
 * Central registry for managing FamilyOS modules
 * Handles module registration, discovery, and lifecycle
 */
class ModuleRegistry {
  private modules: Map<string, BaseModule> = new Map();
  private initialized: Set<string> = new Set();

  /**
   * Register a new module with the registry
   */
  register(module: BaseModule): void {
    if (this.modules.has(module.id)) {
      console.warn(`Module ${module.id} is already registered`);
      return;
    }

    this.modules.set(module.id, module);
    console.log(`Registered module: ${module.name} (${module.id})`);
  }

  /**
   * Unregister a module from the registry
   */
  unregister(moduleId: string): void {
    const moduleInstance = this.modules.get(moduleId);
    if (moduleInstance && this.initialized.has(moduleId)) {
      // Cleanup module if it was initialized
      moduleInstance.cleanup?.();
      this.initialized.delete(moduleId);
    }

    this.modules.delete(moduleId);
    console.log(`Unregistered module: ${moduleId}`);
  }

  /**
   * Get a module by ID
   */
  getModule(moduleId: string): BaseModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Get all registered modules
   */
  getAllModules(): BaseModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get enabled modules only
   */
  getEnabledModules(): BaseModule[] {
    return this.getAllModules().filter(module => module.enabled);
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(category: BaseModule['category']): FamilyModule[] {
    return this.getAllModules().filter(module => module.category === category);
  }

  /**
   * Initialize a specific module
   */
  async initializeModule(moduleId: string): Promise<boolean> {
    const moduleInstance = this.modules.get(moduleId);
    if (!moduleInstance) {
      console.error(`Module ${moduleId} not found`);
      return false;
    }

    if (this.initialized.has(moduleId)) {
      console.log(`Module ${moduleId} already initialized`);
      return true;
    }

    try {
      await moduleInstance.initialize?.();
      this.initialized.add(moduleId);
      console.log(`Module ${moduleId} initialized successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to initialize module ${moduleId}:`, error);
      return false;
    }
  }

  /**
   * Initialize all enabled modules
   */
  async initializeEnabledModules(): Promise<void> {
    const enabledModules = this.getEnabledModules();
    const initPromises = enabledModules.map(module =>
      this.initializeModule(module.id)
    );

    const results = await Promise.allSettled(initPromises);
    const failed = results.filter(result => result.status === 'rejected').length;

    if (failed > 0) {
      console.warn(`${failed} modules failed to initialize`);
    }

    console.log(`Initialized ${enabledModules.length - failed} modules successfully`);
  }

  /**
   * Check if a module is initialized
   */
  isInitialized(moduleId: string): boolean {
    return this.initialized.has(moduleId);
  }

  /**
   * Enable a module
   */
  enableModule(moduleId: string): void {
    const moduleInstance = this.modules.get(moduleId);
    if (moduleInstance) {
      moduleInstance.enabled = true;
      console.log(`Enabled module: ${moduleId}`);
    }
  }

  /**
   * Disable a module
   */
  disableModule(moduleId: string): void {
    const moduleInstance = this.modules.get(moduleId);
    if (moduleInstance) {
      moduleInstance.enabled = false;
      if (this.initialized.has(moduleId)) {
        moduleInstance.cleanup?.();
        this.initialized.delete(moduleId);
      }
      console.log(`Disabled module: ${moduleId}`);
    }
  }

  /**
   * Get all routes from enabled modules
   */
  getAllRoutes() {
    return this.getEnabledModules()
      .flatMap(module => module.getRoutes?.() || []);
  }

  /**
   * Get all components from enabled modules
   */
  getAllComponents() {
    return this.getEnabledModules()
      .flatMap(module => module.getComponents?.() || []);
  }
}

// Create and export a singleton instance
export const moduleRegistry = new ModuleRegistry();

// Export the class for testing
export { ModuleRegistry };
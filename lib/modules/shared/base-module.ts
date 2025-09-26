import { FamilyModule } from '@/types';

/**
 * Base abstract class that all FamilyOS modules should extend
 * Provides common functionality and enforces the module interface
 */
export abstract class BaseModule implements FamilyModule {
  abstract id: string;
  abstract name: string;
  abstract icon: any;
  abstract description: string;
  abstract version: string;
  abstract category: 'health' | 'productivity' | 'entertainment' | 'finance' | 'other';

  // Default implementations
  enabled: boolean = true;
  requiredPermissions?: string[];
  familyMemberAccess: 'all' | 'self' | 'adults' | 'custom' = 'all';

  // Lifecycle methods - can be overridden
  async initialize(): Promise<void> {
    console.log(`Initializing ${this.name} module`);
  }

  async cleanup(): Promise<void> {
    console.log(`Cleaning up ${this.name} module`);
  }

  // Content methods - can be overridden
  getRoutes() {
    return [];
  }

  getComponents() {
    return [];
  }

  // Utility methods for all modules
  protected log(message: string): void {
    console.log(`[${this.name}] ${message}`);
  }

  protected logError(error: string | Error): void {
    console.error(`[${this.name}] ${error}`);
  }

  // Check if module is enabled
  isEnabled(): boolean {
    return this.enabled;
  }

  // Toggle module state
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}
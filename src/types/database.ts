// MongoDB document interfaces for FamilyOS

import { ObjectId } from 'mongodb';
import {
  FamilyRelationship,
  FamilyPreferences,
  FamilyMemberMetadata,
  ModulePermissions,
  HealthcareSpecialty,
  QuickAddData
} from './index';

/**
 * Family Collection Document
 */
export interface FamilyDocument {
  _id: ObjectId;
  name: string;
  inviteCode: string;
  ownerId: string; // Better Auth user ID
  createdAt: Date;
  updatedAt: Date;
  settings?: {
    timezone?: string;
    locale?: string;
  };
}

/**
 * Family Member Collection Document
 */
export interface FamilyMemberDocument {
  _id: ObjectId;
  familyId: ObjectId;
  userId?: string; // Optional - links to Better Auth user

  // Core member data
  name: string;
  relationship: FamilyRelationship;
  color: string;
  isDefault: boolean;

  // Preferences and metadata
  preferences?: FamilyPreferences;
  metadata?: FamilyMemberMetadata;
  modulePermissions?: ModulePermissions;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID who created this member
}

/**
 * Healthcare Provider Collection Document
 */
export interface HealthcareProviderDocument {
  _id: ObjectId;
  familyId: ObjectId;

  // Core provider data
  providerName: string;
  portalUrl: string;
  specialty: HealthcareSpecialty;
  familyMemberIds: ObjectId[];
  loginUsername?: string;
  notes?: string;
  lastUsed?: Date;
  autoDetected: boolean;
  quickAddData?: QuickAddData;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Client-safe family data (without MongoDB ObjectIds)
 */
export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  settings?: {
    timezone?: string;
    locale?: string;
  };
}

/**
 * Client-safe family member data
 */
export interface FamilyMemberData {
  id: string;
  familyId: string;
  userId?: string;
  name: string;
  relationship: FamilyRelationship;
  color: string;
  isDefault: boolean;
  preferences?: FamilyPreferences;
  metadata?: FamilyMemberMetadata;
  modulePermissions?: ModulePermissions;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Client-safe healthcare provider data
 */
export interface HealthcareProviderData {
  id: string;
  familyId: string;
  providerName: string;
  portalUrl: string;
  specialty: HealthcareSpecialty;
  familyMemberIds: string[];
  loginUsername?: string;
  notes?: string;
  lastUsed?: string;
  autoDetected: boolean;
  quickAddData?: QuickAddData;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Input types for creating entities
 */
export interface CreateFamilyInput {
  name: string;
  ownerId: string;
}

export interface CreateFamilyMemberInput {
  name: string;
  relationship: FamilyRelationship;
  color: string;
  isDefault?: boolean;
  userId?: string;
  preferences?: FamilyPreferences;
  metadata?: FamilyMemberMetadata;
  modulePermissions?: ModulePermissions;
}

export interface CreateProviderInput {
  providerName: string;
  portalUrl: string;
  specialty: HealthcareSpecialty;
  familyMemberIds: string[];
  loginUsername?: string;
  notes?: string;
  autoDetected: boolean;
  quickAddData?: QuickAddData;
}

/**
 * Todo Collection Document
 */
export interface TodoDocument {
  _id: ObjectId;
  familyId: ObjectId;
  description: string;
  assignedMemberIds: ObjectId[];
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Client-safe todo data
 */
export interface Todo {
  id: string;
  familyId: string;
  description: string;
  assignedMemberIds: string[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * Input types for todo operations
 */
export interface CreateTodoInput {
  description: string;
  assignedMemberIds?: string[];
}

export interface UpdateTodoInput {
  description?: string;
  assignedMemberIds?: string[];
}

/**
 * Server Action result types
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export function handleDatabaseError(error: any, req: Request, res: Response, next: NextFunction) {
  console.error('Database operation error:', error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: 'Not Found',
      message: error.message,
    });
  }

  if (error instanceof DatabaseError) {
    return res.status(500).json({
      success: false,
      error: 'Database Error',
      message: error.message,
      code: error.code,
    });
  }

  // Generic error handling
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
  });
}

export async function gracefulShutdown() {
  console.log('Initiating graceful shutdown...');

  try {
    // Create final backups before shutdown
    const { DatabaseManager } = await import('./index');
    await DatabaseManager.initialize(); // This will create backups
    console.log('Final backups created successfully');
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
  }

  process.exit(0);
}

// Setup graceful shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export function validateEnvironment() {
  const requiredEnvVars = ['DATA_DIR', 'NODE_ENV'];
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Ensure DATA_DIR exists
  const fs = require('fs-extra');
  const path = require('path');

  const dataDir = process.env.DATA_DIR!;
  if (!fs.existsSync(dataDir)) {
    fs.ensureDirSync(dataDir);
    console.log(`Created data directory: ${dataDir}`);
  }

  const backupDir = path.join(dataDir, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.ensureDirSync(backupDir);
    console.log(`Created backup directory: ${backupDir}`);
  }
}

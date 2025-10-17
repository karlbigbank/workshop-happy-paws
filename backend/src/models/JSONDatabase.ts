import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

export class JSONDatabase<T extends { id: string }> {
  private filePath: string;
  private lockFilePath: string;
  private schema: z.ZodSchema<T>;

  constructor(fileName: string, schema: z.ZodSchema<T>) {
    this.filePath = path.join(process.env.DATA_DIR || 'data', fileName);
    this.lockFilePath = `${this.filePath}.lock`;
    this.schema = schema;
    this.ensureFileExists();
  }

  private async ensureFileExists(): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.filePath));

      if (!await fs.pathExists(this.filePath)) {
        await fs.writeJson(this.filePath, [], { spaces: 2 });
      }
    } catch (error) {
      console.error(`Error ensuring file exists for ${this.filePath}:`, error);
      throw new Error(`Failed to initialize database file: ${this.filePath}`);
    }
  }

  private async acquireLock(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      try {
        await fs.writeFile(this.lockFilePath, process.pid.toString(), { flag: 'wx' });
        return;
      } catch (error: any) {
        if (error.code === 'EEXIST') {
          // Lock file exists, wait and retry
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        } else {
          throw error;
        }
      }
    }

    throw new Error(`Failed to acquire lock after ${maxAttempts} attempts`);
  }

  private async releaseLock(): Promise<void> {
    try {
      await fs.unlink(this.lockFilePath);
    } catch (error) {
      console.warn(`Failed to release lock: ${error}`);
    }
  }

  private async atomicWrite(data: T[]): Promise<void> {
    const tempFilePath = `${this.filePath}.tmp`;

    try {
      await this.acquireLock();

      // Write to temporary file first
      await fs.writeJson(tempFilePath, data, { spaces: 2 });

      // Atomic rename
      await fs.rename(tempFilePath, this.filePath);

    } catch (error) {
      // Cleanup temp file if it exists
      if (await fs.pathExists(tempFilePath)) {
        await fs.unlink(tempFilePath);
      }
      throw error;
    } finally {
      await this.releaseLock();
    }
  }

  private async readData(): Promise<T[]> {
    try {
      const data = await fs.readJson(this.filePath);

      if (!Array.isArray(data)) {
        throw new Error('Database file does not contain an array');
      }

      return data;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty array
        return [];
      }

      console.error(`Error reading data from ${this.filePath}:`, error);

      // Try to recover from backup
      return await this.recoverFromBackup();
    }
  }

  private async recoverFromBackup(): Promise<T[]> {
    const backupDir = path.join(path.dirname(this.filePath), 'backups');
    const fileName = path.basename(this.filePath);

    try {
      const backupFiles = await fs.readdir(backupDir);
      const relevantBackups = backupFiles
        .filter(file => file.startsWith(fileName.replace('.json', '')))
        .sort()
        .reverse();

      for (const backupFile of relevantBackups) {
        try {
          const backupPath = path.join(backupDir, backupFile);
          const backupData = await fs.readJson(backupPath);

          if (Array.isArray(backupData)) {
            console.log(`Recovered data from backup: ${backupFile}`);

            // Restore the main file
            await this.atomicWrite(backupData);
            return backupData;
          }
        } catch (backupError) {
          console.warn(`Failed to read backup ${backupFile}:`, backupError);
        }
      }
    } catch (error) {
      console.warn('No backups available for recovery');
    }

    // If no backup recovery possible, return empty array
    console.warn('Initializing with empty data due to recovery failure');
    return [];
  }

  async createBackup(): Promise<void> {
    try {
      const data = await this.readData();
      const backupDir = path.join(path.dirname(this.filePath), 'backups');
      await fs.ensureDir(backupDir);

      const fileName = path.basename(this.filePath, '.json');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `${fileName}-${timestamp}.json`);

      await fs.writeJson(backupPath, data, { spaces: 2 });
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  // CRUD Operations

  async findAll(): Promise<T[]> {
    return await this.readData();
  }

  async findById(id: string): Promise<T | null> {
    const data = await this.readData();
    return data.find(item => item.id === id) || null;
  }

  async findMany(filter: Partial<T>): Promise<T[]> {
    const data = await this.readData();

    return data.filter(item => {
      return Object.entries(filter).every(([key, value]) => {
        return (item as any)[key] === value;
      });
    });
  }

  async create(itemData: Omit<T, 'id'>): Promise<T> {
    // Generate ID and validate data
    const newItem = {
      ...itemData,
      id: uuidv4(),
    } as T;

    // Validate with schema
    const validatedItem = this.schema.parse(newItem);

    const data = await this.readData();
    data.push(validatedItem);

    await this.atomicWrite(data);
    return validatedItem;
  }

  async update(id: string, updateData: Partial<Omit<T, 'id'>>): Promise<T | null> {
    const data = await this.readData();
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
      return null;
    }

    const updatedItem = {
      ...data[index],
      ...updateData,
    } as T;

    // Validate updated item
    const validatedItem = this.schema.parse(updatedItem);

    data[index] = validatedItem;
    await this.atomicWrite(data);

    return validatedItem;
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.readData();
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
      return false;
    }

    data.splice(index, 1);
    await this.atomicWrite(data);

    return true;
  }

  async count(): Promise<number> {
    const data = await this.readData();
    return data.length;
  }

  async paginate(page: number = 1, limit: number = 10): Promise<{ items: T[]; total: number; page: number; totalPages: number }> {
    const data = await this.readData();
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const items = data.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      totalPages,
    };
  }
}


'use server';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * @fileOverview Server Action for handling file uploads to the local public directory.
 * 
 * This action receives a FormData object containing a file, saves it to 
 * public/uploads/, and returns the relative URL.
 */

export async function uploadFileAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure the uploads directory exists in the public folder
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Create a unique filename to prevent overwriting
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const path = join(uploadDir, filename);

    // Write the file to the local filesystem
    await writeFile(path, buffer);

    // Return the relative URL for use in the app
    return { 
      success: true, 
      url: `/uploads/${filename}` 
    };
  } catch (error: any) {
    console.error('Local upload error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to save file locally' 
    };
  }
}

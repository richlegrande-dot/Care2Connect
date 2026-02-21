/**
 * Simple JSON-based data store for V1 MVP
 * This provides a lightweight storage solution that can easily migrate to a real database later
 */

const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Data directory
const DATA_DIR = path.join(__dirname, 'data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');
const RECORDINGS_FILE = path.join(DATA_DIR, 'recordings.json');

// Ensure data directory and files exist
async function initializeDataStore() {
  try {
    await fs.ensureDir(DATA_DIR);
    
    if (!await fs.pathExists(PROFILES_FILE)) {
      await fs.writeJson(PROFILES_FILE, [], { spaces: 2 });
    }
    
    if (!await fs.pathExists(RECORDINGS_FILE)) {
      await fs.writeJson(RECORDINGS_FILE, [], { spaces: 2 });
    }
    
    console.log('✅ Data store initialized');
  } catch (error) {
    console.error('❌ Failed to initialize data store:', error);
    throw error;
  }
}

// Generic helper functions
async function readData(filePath) {
  try {
    return await fs.readJson(filePath);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

async function writeData(filePath, data) {
  try {
    await fs.writeJson(filePath, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

// ===========================
// PERSON PROFILE OPERATIONS
// ===========================

/**
 * Find or create a PersonProfile
 * Uses (name + email) OR (name + phone) as unique identity
 */
async function findOrCreateProfile({ name, email, phone }) {
  if (!name || (!email && !phone)) {
    throw new Error('Name and at least one contact method (email or phone) are required');
  }

  const profiles = await readData(PROFILES_FILE);
  
  // Normalize inputs for comparison
  const normalizedName = name.trim().toLowerCase();
  const normalizedEmail = email ? email.trim().toLowerCase() : null;
  const normalizedPhone = phone ? phone.trim().replace(/\D/g, '') : null; // Remove non-digits
  
  // Find existing profile
  const existingProfile = profiles.find(p => {
    const profileName = p.name.toLowerCase();
    const profileEmail = p.email ? p.email.toLowerCase() : null;
    const profilePhone = p.phone ? p.phone.replace(/\D/g, '') : null;
    
    // Match by name + email OR name + phone
    if (normalizedEmail && profileEmail) {
      if (profileName === normalizedName && profileEmail === normalizedEmail) {
        return true;
      }
    }
    
    if (normalizedPhone && profilePhone) {
      if (profileName === normalizedName && profilePhone === normalizedPhone) {
        return true;
      }
    }
    
    return false;
  });
  
  if (existingProfile) {
    // Update timestamp
    existingProfile.updatedAt = new Date().toISOString();
    await writeData(PROFILES_FILE, profiles);
    return existingProfile;
  }
  
  // Create new profile
  const newProfile = {
    id: uuidv4(),
    name: name.trim(),
    email: email ? email.trim() : null,
    phone: phone ? phone.trim() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  profiles.push(newProfile);
  await writeData(PROFILES_FILE, profiles);
  
  return newProfile;
}

/**
 * Search for profiles by name and contact info
 * Requires both name and (email OR phone) for privacy
 */
async function searchProfiles({ name, email, phone }) {
  if (!name) {
    throw new Error('Name is required for search');
  }
  
  if (!email && !phone) {
    throw new Error('Email or phone is required for search');
  }
  
  const profiles = await readData(PROFILES_FILE);
  const recordings = await readData(RECORDINGS_FILE);
  
  const normalizedName = name.trim().toLowerCase();
  const normalizedEmail = email ? email.trim().toLowerCase() : null;
  const normalizedPhone = phone ? phone.trim().replace(/\D/g, '') : null;
  
  // Find matching profiles
  const matches = profiles.filter(p => {
    const profileName = p.name.toLowerCase();
    const profileEmail = p.email ? p.email.toLowerCase() : null;
    const profilePhone = p.phone ? p.phone.replace(/\D/g, '') : null;
    
    // Must match name
    if (!profileName.includes(normalizedName)) {
      return false;
    }
    
    // Must match email OR phone
    if (normalizedEmail && profileEmail && profileEmail === normalizedEmail) {
      return true;
    }
    
    if (normalizedPhone && profilePhone && profilePhone === normalizedPhone) {
      return true;
    }
    
    return false;
  });
  
  // Attach recordings to each profile
  return matches.map(profile => ({
    ...profile,
    recordings: recordings
      .filter(r => r.personId === profile.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }));
}

/**
 * Get a profile by ID with its recordings
 */
async function getProfileById(profileId) {
  const profiles = await readData(PROFILES_FILE);
  const recordings = await readData(RECORDINGS_FILE);
  
  const profile = profiles.find(p => p.id === profileId);
  
  if (!profile) {
    return null;
  }
  
  return {
    ...profile,
    recordings: recordings
      .filter(r => r.personId === profileId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  };
}

// ===========================
// STORY RECORDING OPERATIONS
// ===========================

/**
 * Create a new recording record
 */
async function createRecording({ personId, audioUrl, duration }) {
  const recordings = await readData(RECORDINGS_FILE);
  
  const newRecording = {
    id: uuidv4(),
    personId: personId || null,
    audioUrl,
    storagePath: audioUrl, // For v1, same as audioUrl
    duration: duration || null,
    transcript: null,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  recordings.push(newRecording);
  await writeData(RECORDINGS_FILE, recordings);
  
  return newRecording;
}

/**
 * Get a recording by ID
 */
async function getRecordingById(recordingId) {
  const recordings = await readData(RECORDINGS_FILE);
  return recordings.find(r => r.id === recordingId) || null;
}

/**
 * Update a recording
 */
async function updateRecording(recordingId, updates) {
  const recordings = await readData(RECORDINGS_FILE);
  const index = recordings.findIndex(r => r.id === recordingId);
  
  if (index === -1) {
    throw new Error('Recording not found');
  }
  
  recordings[index] = {
    ...recordings[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await writeData(RECORDINGS_FILE, recordings);
  return recordings[index];
}

/**
 * Get recordings by person ID
 */
async function getRecordingsByPersonId(personId) {
  const recordings = await readData(RECORDINGS_FILE);
  return recordings
    .filter(r => r.personId === personId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Link a recording to a profile
 */
async function linkRecordingToProfile(recordingId, personId) {
  return await updateRecording(recordingId, { personId });
}

// ===========================
// STATISTICS & UTILITIES
// ===========================

/**
 * Get statistics
 */
async function getStats() {
  const profiles = await readData(PROFILES_FILE);
  const recordings = await readData(RECORDINGS_FILE);
  
  return {
    totalProfiles: profiles.length,
    totalRecordings: recordings.length,
    recordingsWithProfiles: recordings.filter(r => r.personId).length,
    recordingsWithoutProfiles: recordings.filter(r => !r.personId).length
  };
}

module.exports = {
  initializeDataStore,
  // Profile operations
  findOrCreateProfile,
  searchProfiles,
  getProfileById,
  // Recording operations
  createRecording,
  getRecordingById,
  updateRecording,
  getRecordingsByPersonId,
  linkRecordingToProfile,
  // Utilities
  getStats
};

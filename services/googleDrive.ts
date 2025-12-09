import { gapi } from 'gapi-script';

// Google Drive API Configuration
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const APP_FOLDER_NAME = 'EduAI_CompetitiveExams';

let isInitialized = false;

/**
 * Initialize Google API client
 */
export const initGoogleDrive = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isInitialized) {
      resolve();
      return;
    }

    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        });
        isInitialized = true;
        console.log('Google Drive API initialized');
        resolve();
      } catch (error) {
        console.error('Error initializing Google Drive API:', error);
        reject(error);
      }
    });
  });
};

/**
 * Sign in to Google account
 */
export const signInToGoogle = async (): Promise<gapi.auth2.GoogleUser> => {
  try {
    await initGoogleDrive();
    const auth = gapi.auth2.getAuthInstance();
    return await auth.signIn();
  } catch (error) {
    console.error('Error signing in to Google:', error);
    throw error;
  }
};

/**
 * Sign out from Google account
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    const auth = gapi.auth2.getAuthInstance();
    if (auth) {
      await auth.signOut();
    }
  } catch (error) {
    console.error('Error signing out from Google:', error);
    throw error;
  }
};

/**
 * Check if user is signed in to Google
 */
export const isSignedInToGoogle = (): boolean => {
  try {
    if (!isInitialized) return false;
    const auth = gapi.auth2.getAuthInstance();
    return auth ? auth.isSignedIn.get() : false;
  } catch (error) {
    return false;
  }
};

/**
 * Get or create the app folder in Google Drive
 */
const getOrCreateAppFolder = async (): Promise<string> => {
  try {
    // Search for existing folder
    const response = await gapi.client.request({
      path: '/drive/v3/files',
      method: 'GET',
      params: {
        q: `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
      },
    });

    const files = response.result.files || [];
    if (files.length > 0) {
      return files[0].id;
    }

    // Create new folder if not exists
    const createResponse = await gapi.client.request({
      path: '/drive/v3/files',
      method: 'POST',
      body: {
        name: APP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      },
    });

    return createResponse.result.id;
  } catch (error) {
    console.error('Error getting/creating app folder:', error);
    throw error;
  }
};

/**
 * Upload or update user data to Google Drive
 */
export const uploadUserDataToDrive = async (
  email: string,
  userData: any,
  testResults: any[]
): Promise<void> => {
  try {
    await initGoogleDrive();
    
    if (!isSignedInToGoogle()) {
      throw new Error('Not signed in to Google');
    }

    const folderId = await getOrCreateAppFolder();
    const fileName = `user_data_${email.replace(/[^a-zA-Z0-9]/g, '_')}.json`;

    // Prepare data to upload
    const data = {
      email,
      userData,
      testResults,
      lastUpdated: new Date().toISOString(),
    };

    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });

    // Search for existing file
    const searchResponse = await gapi.client.request({
      path: '/drive/v3/files',
      method: 'GET',
      params: {
        q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
      },
    });

    const files = searchResponse.result.files || [];
    
    if (files.length > 0) {
      // Update existing file
      const fileId = files[0].id;
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const metadata = {
        name: fileName,
        mimeType: 'application/json',
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        content +
        closeDelim;

      await gapi.client.request({
        path: `/upload/drive/v3/files/${fileId}`,
        method: 'PATCH',
        params: { uploadType: 'multipart' },
        headers: {
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body: multipartRequestBody,
      });

      console.log('User data updated in Google Drive');
    } else {
      // Create new file
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const metadata = {
        name: fileName,
        mimeType: 'application/json',
        parents: [folderId],
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        content +
        closeDelim;

      await gapi.client.request({
        path: '/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: {
          'Content-Type': `multipart/related; boundary="${boundary}"`,
        },
        body: multipartRequestBody,
      });

      console.log('User data uploaded to Google Drive');
    }
  } catch (error) {
    console.error('Error uploading user data to Drive:', error);
    throw error;
  }
};

/**
 * Download user data from Google Drive
 */
export const downloadUserDataFromDrive = async (
  email: string
): Promise<{ userData: any; testResults: any[] } | null> => {
  try {
    await initGoogleDrive();
    
    if (!isSignedInToGoogle()) {
      throw new Error('Not signed in to Google');
    }

    const folderId = await getOrCreateAppFolder();
    const fileName = `user_data_${email.replace(/[^a-zA-Z0-9]/g, '_')}.json`;

    // Search for the file
    const searchResponse = await gapi.client.request({
      path: '/drive/v3/files',
      method: 'GET',
      params: {
        q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
      },
    });

    const files = searchResponse.result.files || [];
    
    if (files.length === 0) {
      console.log('No user data found in Google Drive');
      return null;
    }

    // Download the file content
    const fileId = files[0].id;
    const downloadResponse = await gapi.client.request({
      path: `/drive/v3/files/${fileId}`,
      method: 'GET',
      params: { alt: 'media' },
    });

    const data = downloadResponse.result;
    console.log('User data downloaded from Google Drive');
    
    return {
      userData: data.userData,
      testResults: data.testResults || [],
    };
  } catch (error) {
    console.error('Error downloading user data from Drive:', error);
    throw error;
  }
};

/**
 * Auto-sync user data (call this periodically or on data changes)
 */
export const autoSyncUserData = async (
  email: string,
  userData: any,
  testResults: any[]
): Promise<boolean> => {
  try {
    if (!isSignedInToGoogle()) {
      console.log('Not signed in to Google, skipping auto-sync');
      return false;
    }

    await uploadUserDataToDrive(email, userData, testResults);
    return true;
  } catch (error) {
    console.error('Auto-sync failed:', error);
    return false;
  }
};

/**
 * Get current user's Google email
 */
export const getGoogleUserEmail = (): string | null => {
  try {
    if (!isSignedInToGoogle()) return null;
    const auth = gapi.auth2.getAuthInstance();
    const user = auth.currentUser.get();
    const profile = user.getBasicProfile();
    return profile.getEmail();
  } catch (error) {
    console.error('Error getting Google user email:', error);
    return null;
  }
};

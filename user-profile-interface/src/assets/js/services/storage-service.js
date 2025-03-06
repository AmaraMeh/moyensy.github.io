const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { initializeApp } = require('firebase/app');
const firebaseConfig = require('../firebase-config');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param {File} file - The file to be uploaded.
 * @param {string} userId - The user ID to create a unique path for the file.
 * @returns {Promise<string>} - The download URL of the uploaded file.
 */
const uploadFile = async (file, userId) => {
    if (!file) throw new Error('No file provided');

    const storageRef = ref(storage, `avatars/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
};

module.exports = {
    uploadFile,
};
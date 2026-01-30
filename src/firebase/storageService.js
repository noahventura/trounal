import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export async function uploadScreenshot(userId, tradeId, file) {
  const storageRef = ref(storage, `screenshots/${userId}/${tradeId}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

export async function uploadScreenshotFromDataURL(userId, tradeId, dataURL) {
  // Convert data URL to blob
  const response = await fetch(dataURL);
  const blob = await response.blob();

  const storageRef = ref(storage, `screenshots/${userId}/${tradeId}`);

  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

export async function deleteScreenshot(userId, tradeId) {
  try {
    const storageRef = ref(storage, `screenshots/${userId}/${tradeId}`);
    await deleteObject(storageRef);
  } catch (error) {
    // Ignore if file doesn't exist
    if (error.code !== 'storage/object-not-found') {
      throw error;
    }
  }
}

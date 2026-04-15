import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadPrescription({ uid, episodeId = "temp", file }) {
  const safeName = (file?.name || "prescription").replace(/[^\w.-]+/g, "_");
  const path = `users/${uid}/episodes/${episodeId}/prescriptions/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}


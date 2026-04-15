import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import {
  addDoc,
  collection,
  getDocs,
  query,
  Timestamp,
  updateDoc as updateDocFs,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

// -----------------------------
// Profile
// -----------------------------

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const SEX_OPTIONS = ["Male", "Female", "Other"];

export function isProfileComplete(profile) {
  if (!profile) return false;
  return Boolean(profile.name && profile.age && profile.sex && profile.bloodGroup);
}

export async function getUserProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function upsertUserProfile(uid, data) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return;
  }
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

// -----------------------------
// Episodes
// -----------------------------

export const SYMPTOM_OPTIONS = [
  "Fever",
  "Cough",
  "Cold / Runny nose",
  "Headache",
  "Body pain",
  "Sore throat",
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Stomach pain",
  "Dizziness",
  "Breathing difficulty",
  "Fatigue",
  "Skin rash",
];

export const MED_SOURCE_OPTIONS = ["Self (medical shop)", "Doctor"];

export function episodesCol(uid) {
  return collection(db, "users", uid, "episodes");
}

export function episodeDoc(uid, episodeId) {
  return doc(db, "users", uid, "episodes", episodeId);
}

export function entriesCol(uid, episodeId) {
  return collection(db, "users", uid, "episodes", episodeId, "entries");
}

export async function createEpisode(uid, { original }) {
  // Use client timestamp so dashboard queries work immediately.
  const now = Timestamp.now();
  const epRef = await addDoc(episodesCol(uid), {
    status: "Active",
    createdAt: now,
    completedAt: null,
  });

  await addDoc(entriesCol(uid, epRef.id), {
    type: "original",
    createdAt: now,
    ...original,
  });

  return epRef.id;
}

export async function addContinuation(uid, episodeId, entry) {
  const now = Timestamp.now();
  await addDoc(entriesCol(uid, episodeId), {
    type: "update",
    createdAt: now,
    ...entry,
  });
}

export async function markEpisodeCompleted(uid, episodeId) {
  const now = Timestamp.now();
  await updateDocFs(episodeDoc(uid, episodeId), {
    status: "Completed",
    completedAt: now,
  });
}

export async function getEpisode(uid, episodeId) {
  const snap = await getDoc(episodeDoc(uid, episodeId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getEpisodeEntries(uid, episodeId) {
  const snap = await getDocs(entriesCol(uid, episodeId));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return items.sort((a, b) => {
    const at = a?.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bt = b?.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return at - bt;
  });
}

export async function getActiveEpisodes(uid) {
  const q = query(episodesCol(uid), where("status", "==", "Active"));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return items.sort((a, b) => {
    const at = a?.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bt = b?.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return bt - at;
  });
}

export async function getCompletedEpisodes(uid) {
  const q = query(episodesCol(uid), where("status", "==", "Completed"));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return items.sort((a, b) => {
    const at = a?.completedAt?.toDate ? a.completedAt.toDate().getTime() : 0;
    const bt = b?.completedAt?.toDate ? b.completedAt.toDate().getTime() : 0;
    return bt - at;
  });
}

export async function getLatestEntrySummary(uid, episodeId) {
  const snap = await getDocs(entriesCol(uid, episodeId));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => {
    const at = a?.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const bt = b?.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return bt - at;
  });
  return items[0] || null;
}


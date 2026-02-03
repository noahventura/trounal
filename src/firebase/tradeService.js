import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from './config';

const TRADES_COLLECTION = 'trades';
const CHECKLIST_COLLECTION = 'checklists';
const FEEDBACK_COLLECTION = 'feedback';

// Convert Firestore timestamp to JS Date
const convertTimestamp = (trade) => ({
  ...trade,
  date: trade.date?.toDate ? trade.date.toDate() : new Date(trade.date)
});

// TRADES

export function subscribeToTrades(userId, callback) {
  const q = query(
    collection(db, TRADES_COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const trades = snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamp(doc.data())
    }));
    callback(trades);
  });
}

export async function addTrade(userId, trade) {
  const tradeData = {
    ...trade,
    userId,
    date: Timestamp.fromDate(new Date(trade.date)),
    createdAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, TRADES_COLLECTION), tradeData);
  return docRef.id;
}

export async function updateTrade(tradeId, updates) {
  const tradeRef = doc(db, TRADES_COLLECTION, tradeId);
  await updateDoc(tradeRef, updates);
}

export async function deleteTrade(tradeId) {
  const tradeRef = doc(db, TRADES_COLLECTION, tradeId);
  await deleteDoc(tradeRef);
}

// CHECKLIST

export function subscribeToChecklist(userId, callback) {
  const q = query(
    collection(db, CHECKLIST_COLLECTION),
    where('userId', '==', userId),
    orderBy('order', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Sort by order, fallback to createdAt for items without order
    items.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
    callback(items);
  });
}

export async function addChecklistItem(userId, text, order = 0) {
  const itemData = {
    text,
    checked: false,
    userId,
    order,
    createdAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, CHECKLIST_COLLECTION), itemData);
  return docRef.id;
}

export async function updateChecklistItem(itemId, updates) {
  const itemRef = doc(db, CHECKLIST_COLLECTION, itemId);
  await updateDoc(itemRef, updates);
}

export async function deleteChecklistItem(itemId) {
  const itemRef = doc(db, CHECKLIST_COLLECTION, itemId);
  await deleteDoc(itemRef);
}

export async function updateChecklistOrder(items) {
  const updates = items.map((item, index) => {
    const itemRef = doc(db, CHECKLIST_COLLECTION, item.id);
    return updateDoc(itemRef, { order: index });
  });
  await Promise.all(updates);
}

// FEEDBACK

export async function addFeedback(userId, userEmail, feedback) {
  const feedbackData = {
    userId,
    userEmail,
    type: feedback.type, // 'feature' or 'bug'
    title: feedback.title,
    description: feedback.description,
    status: 'pending',
    createdAt: Timestamp.now()
  };

  const docRef = await addDoc(collection(db, FEEDBACK_COLLECTION), feedbackData);
  return docRef.id;
}

export function subscribeToAllFeedback(callback) {
  const q = query(
    collection(db, FEEDBACK_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
    }));
    callback(items);
  });
}

export async function updateFeedbackStatus(feedbackId, status) {
  const feedbackRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
  await updateDoc(feedbackRef, { status });
}

export async function deleteFeedback(feedbackId) {
  const feedbackRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
  await deleteDoc(feedbackRef);
}

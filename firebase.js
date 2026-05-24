// firebase.js — HabitPro Firebase + Auth + Data Layer
// Replace firebaseConfig with your own project credentials.

const firebaseConfig = {
  apiKey: "AIzaSyBf43QscgVcIGP2qkzGn0Kc5WJRHU4rdps",
  authDomain: "habitpro-d6ac0.firebaseapp.com",
  projectId: "habitpro-d6ac0",
  storageBucket: "habitpro-d6ac0.firebasestorage.app",
  messagingSenderId: "99830954805",
  appId: "1:99830954805:web:a6fd52028eefc4eb8cea7c"
};

// --- Firebase Init ---
let db = null;
let firebaseReady = false;

(function initFirebase() {
  try {
    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    db.settings({ experimentalForceLongPolling: false });
    firebaseReady = true;
    console.log('✅ Firebase + Firestore ready');
  } catch (e) {
    console.warn('⚠️ Firebase unavailable — localStorage mode active.', e.message);
    db = null;
    firebaseReady = false;
  }
})();

// --- Crypto Utilities ---
async function hashPassword(password) {
  try {
    const encoded = new TextEncoder().encode(password);
    const buffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (e) {
    // Fallback simple hash for environments without subtle crypto
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) - hash) + password.charCodeAt(i);
      hash |= 0;
    }
    return 'fb_' + Math.abs(hash).toString(16);
  }
}

// --- localStorage Helpers ---
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}
function lsGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; }
}
function lsDel(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}

// --- User Auth (email + password) ---
function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  const e = normalizeEmail(email);
  if (!e || e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

async function emailExists(email) {
  const key = normalizeEmail(email);
  if (db) {
    try {
      const doc = await db.collection('users').doc(key).get();
      return doc.exists;
    } catch (e) {}
  }
  return lsGet('hp_user_' + key) !== null;
}

async function registerUser(email, password) {
  const key = normalizeEmail(email);
  if (!isValidEmail(key)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' };
  }
  if (await emailExists(key)) {
    return { success: false, error: 'An account with this email already exists.' };
  }
  const passwordHash = await hashPassword(password);
  const userData = {
    email: key,
    passwordHash,
    createdAt: new Date().toISOString()
  };
  lsSet('hp_user_' + key, userData);
  if (db) {
    try { await db.collection('users').doc(key).set(userData); } catch (e) {}
  }
  return { success: true, email: key };
}

async function loginUser(email, password) {
  const key = normalizeEmail(email);
  if (!key || !password) return { success: false, error: 'Please fill in both fields.' };
  if (!isValidEmail(key)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  const passwordHash = await hashPassword(password);

  if (db) {
    try {
      const doc = await db.collection('users').doc(key).get();
      if (doc.exists) {
        if (doc.data().passwordHash === passwordHash) return { success: true, email: key };
        return { success: false, error: 'Incorrect password.' };
      }
    } catch (e) {}
  }

  const user = lsGet('hp_user_' + key);
  if (!user) return { success: false, error: 'No account found for this email.' };
  if (user.passwordHash !== passwordHash) return { success: false, error: 'Incorrect password.' };
  return { success: true, email: key };
}

/** Change password for signed-in user (current password required) */
async function changePassword(email, currentPassword, newPassword) {
  const key = normalizeEmail(email);
  if (!key || !isValidEmail(key)) {
    return { success: false, error: 'Invalid session. Please sign in again.' };
  }
  if (!currentPassword || !newPassword) {
    return { success: false, error: 'Please fill in all password fields.' };
  }
  if (newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters.' };
  }
  if (currentPassword === newPassword) {
    return { success: false, error: 'New password must be different from your current password.' };
  }

  const currentHash = await hashPassword(currentPassword);
  let storedHash = null;
  let userRecord = lsGet('hp_user_' + key);

  if (db) {
    try {
      const doc = await db.collection('users').doc(key).get();
      if (doc.exists) {
        storedHash = doc.data().passwordHash;
        userRecord = { ...userRecord, ...doc.data(), email: key };
      }
    } catch (e) {}
  }
  if (!storedHash && userRecord) storedHash = userRecord.passwordHash;

  if (!storedHash) {
    return { success: false, error: 'Account not found.' };
  }
  if (storedHash !== currentHash) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  const newHash = await hashPassword(newPassword);
  const updated = {
    ...(userRecord || { email: key }),
    email: key,
    passwordHash: newHash,
    passwordUpdatedAt: new Date().toISOString(),
  };
  lsSet('hp_user_' + key, updated);
  if (db) {
    try {
      await db.collection('users').doc(key).set(
        { passwordHash: newHash, passwordUpdatedAt: updated.passwordUpdatedAt },
        { merge: true }
      );
    } catch (e) {}
  }
  return { success: true };
}

// --- Firestore CRUD with localStorage fallback ---
function _lsCollectionPrefix(username, collection) {
  return `${username.toLowerCase()}_${collection}_`;
}

async function saveToFirestore(username, collection, docId, data) {
  const key = username.toLowerCase();
  const lsKey = _lsCollectionPrefix(key, collection) + docId;
  const payload = { ...data, _id: docId };
  lsSet(lsKey, payload);
  if (db) {
    try {
      await db.collection('users').doc(key).collection(collection).doc(docId).set(data, { merge: true });
    } catch (e) {}
  }
  return docId;
}

async function loadFromFirestore(username, collection) {
  const key = username.toLowerCase();
  if (db) {
    try {
      const snap = await db.collection('users').doc(key).collection(collection).get();
      if (!snap.empty) {
        const results = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
        // Sync back to localStorage
        results.forEach(item => {
          lsSet(_lsCollectionPrefix(key, collection) + item._id, item);
        });
        return results;
      }
    } catch (e) {}
  }
  // localStorage fallback
  const prefix = _lsCollectionPrefix(key, collection);
  const results = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      const val = lsGet(k);
      if (val) results.push(val);
    }
  }
  return results;
}

async function deleteFromFirestore(username, collection, docId) {
  const key = username.toLowerCase();
  lsDel(_lsCollectionPrefix(key, collection) + docId);
  if (db) {
    try {
      await db.collection('users').doc(key).collection(collection).doc(docId).delete();
    } catch (e) {}
  }
}

async function deleteAllUserData(username) {
  const key = username.toLowerCase();
  const prefix = key + '_';
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) toRemove.push(k);
  }
  toRemove.forEach(k => localStorage.removeItem(k));
}

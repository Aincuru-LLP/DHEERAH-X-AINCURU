import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBP2Hi-KE3kuraoPZ5o5zJrXJfs_Bg1MsA",
  authDomain: "dheerah-7f854.firebaseapp.com",
  projectId: "dheerah-7f854",
  storageBucket: "dheerah-7f854.firebasestorage.app",
  messagingSenderId: "893074169898",
  appId: "1:893074169898:web:ad4752864fbebf4c6ae353",
  measurementId: "G-4B5617GRPS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = 'admin@dheerah.com';
const ADMIN_PASSWORD = 'Admin@Password123';

async function main() {
  console.log(`Setting up admin user (${ADMIN_EMAIL})...`);
  let uid = '';
  try {
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    uid = cred.user.uid;
    console.log(`✓ Admin user created in Firebase Auth with UID: ${uid}`);
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('• Admin user already exists in Firebase Auth. Signing in to retrieve UID...');
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      uid = cred.user.uid;
      console.log(`✓ Signed in with UID: ${uid}`);
    } else {
      console.error('✗ Auth creation error:', err.code, err.message);
      process.exit(1);
    }
  }

  // Create or update admin user profile in Firestore
  await setDoc(doc(db, 'users', uid), {
    uid,
    email: ADMIN_EMAIL,
    fullName: 'Dheerah Admin',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  console.log('✓ Firestore profile created with role: "admin"');
  console.log('\n--- Admin Credentials ---');
  console.log(`Path:     /admin`);
  console.log(`Email:    ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});

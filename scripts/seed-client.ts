import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp, getDocs, collection } from 'firebase/firestore';
import { FABRICS } from '../src/constants';

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
const db = getFirestore(app);

const COUPONS = [
  {
    code: 'WEDDING50',
    description: 'Extra 10% off bridal silks',
    kind: 'percent',
    value: 10,
    maxDiscount: 10000,
    minSubtotal: 0,
    active: true,
  },
  {
    code: 'UPI10',
    description: '10% UPI cashback (up to ₹500)',
    kind: 'percent',
    value: 10,
    maxDiscount: 500,
    minSubtotal: 0,
    active: true,
  },
];

const REVIEWS = [
  {
    id: 'rev-1',
    fabricId: '1',
    authorName: 'Ananya Sharma',
    rating: 5,
    title: 'Exquisite Mashru silk quality',
    body: 'The handfeel is extraordinary. You can feel the heritage craft. Stitched into a festive jacket and received countless compliments.',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 864e5).toISOString()
  },
  {
    id: 'rev-2',
    fabricId: '1',
    authorName: 'Pooja Reddy',
    rating: 5,
    title: 'Authentic Mandvi weave',
    body: 'The dual-tone sheen of silk on cotton backing is genuine. Beautiful finish and quick delivery.',
    status: 'approved',
    createdAt: new Date(Date.now() - 12 * 864e5).toISOString()
  },
  {
    id: 'rev-3',
    fabricId: '2',
    authorName: 'Sunita Mehra',
    rating: 5,
    title: 'Real zari shines brilliantly',
    body: 'Purchased for my daughter’s wedding lehenga. Authentic zari craftsmanship is hard to find online; this surpassed expectations.',
    status: 'approved',
    createdAt: new Date(Date.now() - 8 * 864e5).toISOString()
  },
  {
    id: 'rev-4',
    fabricId: '3',
    authorName: 'Meera Kulkarni',
    rating: 5,
    title: 'True double-ikat Patola masterwork',
    body: 'Precision of the geometric pattern is museum quality. An absolute heirloom piece.',
    status: 'approved',
    createdAt: new Date(Date.now() - 15 * 864e5).toISOString()
  }
];

async function seed() {
  console.log(`Connecting to Firestore project: ${firebaseConfig.projectId}...`);

  console.log(`Seeding ${FABRICS.length} products...`);
  for (const fabric of FABRICS) {
    await setDoc(doc(db, 'products', fabric.id), {
      ...fabric,
      id: fabric.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  console.log(`✓ ${FABRICS.length} products seeded.`);

  console.log(`Seeding ${COUPONS.length} coupons...`);
  for (const coupon of COUPONS) {
    await setDoc(doc(db, 'coupons', coupon.code), {
      ...coupon,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  console.log(`✓ ${COUPONS.length} coupons seeded.`);

  console.log(`Seeding ${REVIEWS.length} sample reviews...`);
  for (const review of REVIEWS) {
    await setDoc(doc(db, 'reviews', review.id), {
      ...review,
      createdAt: review.createdAt
    });
  }
  console.log(`✓ ${REVIEWS.length} reviews seeded.`);

  console.log('✓ All Firestore baseline collections seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

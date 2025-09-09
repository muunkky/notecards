#!/usr/bin/env node

/**
 * Simple Card Data Inspector
 * Check what's actually in the database
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Firebase config (from your firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyBYEyPgnlvKX1k8YrUPzaJsN_7_EzajAys",
  authDomain: "notecards-1b054.firebaseapp.com",
  projectId: "notecards-1b054",
  storageBucket: "notecards-1b054.firebasestorage.app",
  messagingSenderId: "553189010695",
  appId: "1:553189010695:web:060922e1fc0b9323e869a2",
  measurementId: "G-S308GDHJGL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspectData() {
  console.log('🔍 Inspecting Firestore data structure...');
  
  try {
    // Check decks collection
    console.log('\n📦 Checking decks collection...');
    const decksSnapshot = await getDocs(collection(db, 'decks'));
    console.log(`Found ${decksSnapshot.size} decks`);
    
    decksSnapshot.forEach(async (deckDoc) => {
      const deckData = deckDoc.data();
      console.log(`\nDeck: ${deckDoc.id}`);
      console.log(`  Title: ${deckData.title}`);
      console.log(`  Owner: ${deckData.ownerId}`);
      
      // Check cards subcollection for this deck
      try {
        const cardsSnapshot = await getDocs(collection(db, 'decks', deckDoc.id, 'cards'));
        console.log(`  Cards in subcollection: ${cardsSnapshot.size}`);
        
        cardsSnapshot.forEach((cardDoc) => {
          const cardData = cardDoc.data();
          console.log(`    Card ${cardDoc.id}: ${cardData.title}`);
        });
      } catch (cardError) {
        console.log(`  Error accessing cards: ${cardError.message}`);
      }
    });
    
    // Check if there's a top-level cards collection (shouldn't exist)
    console.log('\n📄 Checking top-level cards collection...');
    try {
      const topCardsSnapshot = await getDocs(collection(db, 'cards'));
      console.log(`Found ${topCardsSnapshot.size} cards in top-level collection`);
      
      if (topCardsSnapshot.size > 0) {
        console.log('⚠️  WARNING: Cards found in top-level collection - this might be the issue!');
        topCardsSnapshot.forEach((cardDoc) => {
          const cardData = cardDoc.data();
          console.log(`  Top-level card ${cardDoc.id}: ${cardData.title} (deckId: ${cardData.deckId})`);
        });
      }
    } catch (topCardsError) {
      console.log(`No top-level cards collection or access denied: ${topCardsError.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error inspecting data:', error.message);
  }
}

inspectData().then(() => {
  console.log('\n✅ Data inspection complete');
  process.exit(0);
}).catch(console.error);

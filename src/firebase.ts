import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";

// Firebase configuration from firebase-applet-config.json
const firebaseConfig = {
  projectId: "knowledgeable-sanctum-gsjh2",
  appId: "1:568637517018:web:fdcad9ae95414ea84b89e3",
  apiKey: "AIzaSyALtPnOVJeqK7v--w-xKtGXhNBd5ZBkq54",
  authDomain: "knowledgeable-sanctum-gsjh2.firebaseapp.com",
  databaseId: "ai-studio-4665b785-0067-4559-9ea7-29aee9e8f9b4",
  storageBucket: "knowledgeable-sanctum-gsjh2.firebasestorage.app",
  messagingSenderId: "568637517018"
};

// Initialize Firebase and Firestore instances
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.databaseId);

export interface Booking {
  id: string; // e.g. "08:00"
  slot: string; // e.g. "08:00 - 08:20"
  projectTitle: string;
  members: string;
  materials: string[];
  customMaterials: string;
  createdAt: number;
}

export interface Slot {
  id: string; // e.g. "08:00"
  time: string; // e.g. "08:00 - 08:20"
}

export interface TeacherConfig {
  passwordHash: string; // stored simple password
}

const BOOKINGS_COLLECTION = "bookings";
const SLOTS_COLLECTION = "slots";
const CONFIG_COLLECTION = "config";
const CONFIG_TEACHER_DOC = "teacher";

export const DEFAULT_SLOTS: Slot[] = [
  { id: "08:00", time: "08:00 - 08:20" },
  { id: "08:20", time: "08:20 - 08:40" },
  { id: "08:40", time: "08:40 - 09:00" },
  { id: "09:00", time: "09:00 - 09:20" },
  { id: "09:20", time: "09:20 - 09:40" },
  { id: "09:40", time: "09:40 - 10:00" },
  { id: "10:00", time: "10:00 - 10:20" },
  { id: "10:20", time: "10:20 - 10:40" },
  { id: "10:40", time: "10:40 - 11:00" },
];

// Get all slots (with default seeding if empty)
export async function getSlots(): Promise<Slot[]> {
  try {
    const colRef = collection(db, SLOTS_COLLECTION);
    const querySnapshot = await getDocs(colRef);
    const slotsList: Slot[] = [];
    querySnapshot.forEach((doc) => {
      slotsList.push({ id: doc.id, ...doc.data() } as Slot);
    });

    if (slotsList.length === 0) {
      console.log("Seeding default slots to Firestore...");
      for (const slot of DEFAULT_SLOTS) {
        await setDoc(doc(db, SLOTS_COLLECTION, slot.id), slot);
      }
      localStorage.setItem("eduschedule_slots", JSON.stringify(DEFAULT_SLOTS));
      return DEFAULT_SLOTS;
    }

    const sorted = slotsList.sort((a, b) => a.id.localeCompare(b.id));
    localStorage.setItem("eduschedule_slots", JSON.stringify(sorted));
    return sorted;
  } catch (error) {
    console.error("Erro ao carregar slots do Firestore, usando cache ou padrão:", error);
    const local = localStorage.getItem("eduschedule_slots");
    if (local) {
      try {
        return JSON.parse(local) as Slot[];
      } catch (e) {
        return DEFAULT_SLOTS;
      }
    }
    return DEFAULT_SLOTS;
  }
}

// Save a slot
export async function saveSlot(slot: Slot): Promise<void> {
  const local = localStorage.getItem("eduschedule_slots");
  let slotsList: Slot[] = [];
  if (local) {
    try {
      slotsList = JSON.parse(local) as Slot[];
    } catch (e) {
      slotsList = [];
    }
  }
  slotsList = slotsList.filter((s) => s.id !== slot.id);
  slotsList.push(slot);
  slotsList.sort((a, b) => a.id.localeCompare(b.id));
  localStorage.setItem("eduschedule_slots", JSON.stringify(slotsList));

  try {
    const docRef = doc(db, SLOTS_COLLECTION, slot.id);
    await setDoc(docRef, slot);
  } catch (error) {
    console.error("Erro ao salvar slot no Firestore:", error);
  }
}

// Delete a slot
export async function deleteSlot(slotId: string): Promise<void> {
  const local = localStorage.getItem("eduschedule_slots");
  if (local) {
    try {
      let slotsList = JSON.parse(local) as Slot[];
      slotsList = slotsList.filter((s) => s.id !== slotId);
      localStorage.setItem("eduschedule_slots", JSON.stringify(slotsList));
    } catch (e) {
      console.error(e);
    }
  }

  try {
    const docRef = doc(db, SLOTS_COLLECTION, slotId);
    await deleteDoc(docRef);
    
    // Also delete any booking associated with this slot if it exists!
    const bookingRef = doc(db, BOOKINGS_COLLECTION, slotId);
    await deleteDoc(bookingRef);
  } catch (error) {
    console.error("Erro ao excluir slot no Firestore:", error);
  }
}

// Initialize the default password in Firestore if not already present
export async function initializeTeacherPassword() {
  try {
    // Sync local storage with default password if not already there
    if (!localStorage.getItem("eduschedule_teacher_password")) {
      localStorage.setItem("eduschedule_teacher_password", "senha");
    }

    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_TEACHER_DOC);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      // Set default password to "senha"
      await setDoc(docRef, { password: "senha" });
    } else {
      // Sync local storage with DB password
      const dbPwd = docSnap.data().password || "senha";
      localStorage.setItem("eduschedule_teacher_password", dbPwd);
    }
  } catch (error) {
    console.error("Erro ao inicializar senha do professor (usando offline):", error);
  }
}

// Get teacher password (or fallback to "senha")
export async function getTeacherPassword(): Promise<string> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_TEACHER_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const pwd = docSnap.data().password || "senha";
      localStorage.setItem("eduschedule_teacher_password", pwd);
      return pwd;
    }
  } catch (error) {
    console.error("Erro ao buscar senha do Firestore, usando local:", error);
  }
  return localStorage.getItem("eduschedule_teacher_password") || "senha";
}

// Update teacher password
export async function updateTeacherPassword(newPassword: string): Promise<boolean> {
  try {
    localStorage.setItem("eduschedule_teacher_password", newPassword);
    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_TEACHER_DOC);
    await setDoc(docRef, { password: newPassword }, { merge: true });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar senha no Firestore (salvo localmente):", error);
    // Return true since we saved it locally and can still log in offline
    return true;
  }
}

// Get all bookings
export async function getBookings(): Promise<Booking[]> {
  try {
    const colRef = collection(db, BOOKINGS_COLLECTION);
    const querySnapshot = await getDocs(colRef);
    const bookings: Booking[] = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() } as Booking);
    });
    const sorted = bookings.sort((a, b) => a.id.localeCompare(b.id));
    localStorage.setItem("eduschedule_bookings", JSON.stringify(sorted));
    return sorted;
  } catch (error) {
    console.error("Erro ao carregar agendamentos do Firestore, usando cache local:", error);
    const local = localStorage.getItem("eduschedule_bookings");
    if (local) {
      try {
        return JSON.parse(local) as Booking[];
      } catch (e) {
        return [];
      }
    }
    return [];
  }
}

// Save a booking
export async function saveBooking(booking: Omit<Booking, "createdAt">): Promise<void> {
  const fullBooking: Booking = {
    ...booking,
    createdAt: Date.now()
  };

  // Update local storage immediately for responsive offline capabilities
  const local = localStorage.getItem("eduschedule_bookings");
  let bookings: Booking[] = [];
  if (local) {
    try {
      bookings = JSON.parse(local) as Booking[];
    } catch (e) {
      bookings = [];
    }
  }
  bookings = bookings.filter((b) => b.id !== booking.id);
  bookings.push(fullBooking);
  bookings.sort((a, b) => a.id.localeCompare(b.id));
  localStorage.setItem("eduschedule_bookings", JSON.stringify(bookings));

  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, booking.id);
    await setDoc(docRef, fullBooking);
  } catch (error) {
    console.error("Erro ao salvar agendamento no Firestore (salvo localmente):", error);
  }
}

// Delete a booking
export async function deleteBooking(slotId: string): Promise<void> {
  // Update local storage first
  const local = localStorage.getItem("eduschedule_bookings");
  if (local) {
    try {
      let bookings = JSON.parse(local) as Booking[];
      bookings = bookings.filter((b) => b.id !== slotId);
      localStorage.setItem("eduschedule_bookings", JSON.stringify(bookings));
    } catch (e) {
      console.error(e);
    }
  }

  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, slotId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar agendamento no Firestore (removido localmente):", error);
  }
}

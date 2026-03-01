import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// ==========================================
// LAYANAN SIMULASI PEMBIAYAAN
// ==========================================

const simulasiCollection = collection(db, 'simulasi_pembiayaan');

export const simulasiService = {
  // Simpan data simulasi pembiayaan baru
  simpanSimulasi: async (dataSimulasi) => {
    try {
      const docRef = await addDoc(simulasiCollection, {
        ...dataSimulasi,
        createdAt: new Date(),
        status: 'draft', // draft, diajukan, disetujui, ditolak
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error saving simulasi:", error);
      return { success: false, error: error.message };
    }
  },

  // Ambil semua riwayat simulasi berdasarkan user/nasabah
  getRiwayatSimulasi: async (userId) => {
    try {
      const q = query(simulasiCollection, where("userId", "==", userId), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data };
    } catch (error) {
      console.error("Error getting simulasi history:", error);
      return { success: false, error: error.message };
    }
  }
};


// ==========================================
// LAYANAN TABUNGAN UMROH
// ==========================================

const tabunganUmrohCollection = collection(db, 'tabungan_umroh');

export const tabunganUmrohService = {
  // Buat rencana tabungan umroh baru
  buatRencanaTabungan: async (dataTabungan) => {
    try {
      const docRef = await addDoc(tabunganUmrohCollection, {
        ...dataTabungan,
        createdAt: new Date(),
        status: 'aktif', // aktif, tercapai, dibatalkan
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creating umroh plan:", error);
      return { success: false, error: error.message };
    }
  },

  // Update saldo tabungan (setoran baru)
  updateSaldoTabungan: async (planId, saldoBaru) => {
    try {
      const planRef = doc(db, 'tabungan_umroh', planId);
      await updateDoc(planRef, {
        saldoSaatIni: saldoBaru,
        lastUpdated: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating saldo:", error);
      return { success: false, error: error.message };
    }
  }
};


// ==========================================
// LAYANAN REMINDER JATUH TEMPO
// ==========================================

const tagihanCollection = collection(db, 'reminder_tagihan');

export const tagihanService = {
  // Ambil daftar tagihan berdasarkan role (admin lihat semua, nasabah lihat milik sendiri)
  getDaftarTagihan: async (role, userId = null) => {
    try {
      let q = query(tagihanCollection, orderBy("tanggalJatuhTempo", "asc"));
      
      // Jika nasabah, filter hanya data mereka
      if (role === 'nasabah' && userId) {
        q = query(tagihanCollection, where("userId", "==", userId), orderBy("tanggalJatuhTempo", "asc"));
      }
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data };
      
    } catch (error) {
      console.error("Error getting tagihan:", error);
      return { success: false, error: error.message };
    }
  },
  
  // Ubah status tagihan menjadi lunas
  bayarTagihan: async (tagihanId) => {
    try {
      const tagihanRef = doc(db, 'reminder_tagihan', tagihanId);
      await updateDoc(tagihanRef, {
        status: 'lunas',
        tanggalBayar: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error("Error paying tagihan:", error);
      return { success: false, error: error.message };
    }
  }
};

import { 
  collection, 
  addDoc, 
  getDocs, 
  doc,
  getDoc,
  updateDoc, 
  query, 
  where,
  orderBy,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './firebaseConfig';

// ==========================================
// LAYANAN AUTENTIKASI DAN USER
// ==========================================

export const authService = {
  // Register Nasabah baru
  registerUser: async (userData) => {
    try {
      // 1. Buat akun di Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      const user = userCredential.user;

      // 2. Simpan detail profil ke Firestore database
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        namaLengkap: userData.namaLengkap,
        tempatTanggalLahir: userData.tempatTanggalLahir,
        alamat: userData.alamat,
        noWhatsapp: userData.noWhatsapp,
        email: userData.email,
        role: 'nasabah', // Hardcode role default
        is_active: false, // Menunggu persetujuan admin
        createdAt: serverTimestamp(),
      });

      return { success: true, user };
    } catch (error) {
      console.error("Error pendaftaran:", error);
      let errorMessage = "Gagal mendaftar. Silakan coba lagi.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email ini sudah terdaftar.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password terlalu lemah (minimal 6 karakter).";
      }
      return { success: false, error: errorMessage };
    }
  },

  // Login Pengguna
  loginUser: async (email, password) => {
    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Ambil data user dari Firestore untuk mendapatkan role & is_active
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        // Cek apakah akun aktif (Khusus Nasabah)
        if (userData.role === 'nasabah' && !userData.is_active) {
          // Secara teknis mereka berhasil login di auth, 
          // tapi kita tolak masuk dasbor karena belum diverifikasi
          return { 
            success: false, 
            error: "Akun Nasabah Anda masih berstatus PENDING. Silakan menunggu persetujuan Admin." 
          };
        }

        // Susun session lokal
        const sessionData = {
          uid: user.uid,
          email: user.email,
          namaLengkap: userData.namaLengkap,
          role: userData.role,
          menus: userData.menus || [], // Ambil menu-menu atau reset
          noWhatsapp: userData.noWhatsapp || '',
          alamat: userData.alamat || '',
          margin: userData.margin || null // Tambahkan margin spesifik
        };
        // Simpan ke localstorage
        localStorage.setItem('syariahfin_user', JSON.stringify(sessionData));

        return { success: true, user: sessionData };
      } else {
        return { success: false, error: "Data profil pengguna tidak ditemukan di server." };
      }
    } catch (error) {
      console.error("Error login:", error);
      let errorMessage = "Kombinasi email dan password salah.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Email atau password yang Anda masukkan salah.";
      }
      return { success: false, error: errorMessage };
    }
  },

  getUserProfile: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { success: true, data: userSnap.data() };
      }
      return { success: false, error: "User not found" };
    } catch (error) {
      console.error("Error getting user profile:", error);
      return { success: false, error: error.message };
    }
  },

  // Mengambil daftar pengguna untuk halaman Admin
  getUsers: async () => {
    try {
      const q = query(collection(db, 'users'), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        margin: doc.data().margin || null
      }));
      return { success: true, data };
    } catch (error) {
      console.error("Error getting users:", error);
      return { success: false, error: error.message };
    }
  },

  // Admin: Update role atau status user (dan approval)
  updateUserRoleStatus: async (userId, dataUpdate) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, dataUpdate);
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }
  },

  // Nasabah/Admin: Update Profile Setting (Nama, Alamat, No WA, Password)
  updateUserProfile: async (userId, dataUpdate) => {
    try {
      // 1. Update ke Firestore (tabel user)
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        namaLengkap: dataUpdate.namaLengkap,
        noWhatsapp: dataUpdate.noWhatsapp,
        alamat: dataUpdate.alamat
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }
  },

  // Admin: Hapus user dari Firestore
  // Note: Menghapus dari 'users' tidak otomatis menghapus dari Firebase Auth
  // Penghapusan Auth idealnya pakai Firebase Admin SDK di backend.
  deleteUser: async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, error: error.message };
    }
  }
};

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
// LAYANAN PENGATURAN SISTEM
// ==========================================
export const systemService = {
  getMarginSetting: async () => {
    try {
      const docRef = doc(db, 'settings', 'pembiayaan');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().marginRate) {
        return { success: true, margin: docSnap.data().marginRate };
      }
      return { success: true, margin: 10 }; // Default 10%
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  updateMarginSetting: async (newMargin) => {
    try {
      const docRef = doc(db, 'settings', 'pembiayaan');
      await setDoc(docRef, { marginRate: newMargin }, { merge: true });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
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
      let q = query(tagihanCollection);
      
      // Jika nasabah, filter hanya data mereka
      if (role === 'nasabah' && userId) {
        q = query(tagihanCollection, where("userId", "==", userId));
      }
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Urutkan di JS (menghindari limitasi filter Firebase ketika ada data null/lama yang tidak memiliki field)
      data.sort((a, b) => {
        const dateA = a.tanggalJatuhTempo?.toDate() || a.tanggalPengajuan?.toDate() || new Date();
        const dateB = b.tanggalJatuhTempo?.toDate() || b.tanggalPengajuan?.toDate() || new Date();
        return dateA - dateB;
      });

      return { success: true, data };
      
    } catch (error) {
      console.error("Error getting tagihan:", error);
      return { success: false, error: error.message };
    }
  },

  // Buat tagihan / ajuan pembiayaan baru dari Simulasi
  buatTagihanBaru: async (dataTagihan) => {
    try {
      const docRef = await addDoc(tagihanCollection, {
        ...dataTagihan,
        tanggalPengajuan: new Date(),
        tanggalJatuhTempo: new Date(), // Firebase mengekslusi dokumen yang tidak punya atribut pada fungsi orderBy()
        status: 'pending' // pending persetujuan admin -> berubah ke belum_dibayar setelah diapprove
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creating tagihan:", error);
      return { success: false, error: error.message };
    }
  },

  // Admin mengubah status tagihan
  updateStatusTagihan: async (tagihanId, statusBaru) => {
    try {
      const tagihanRef = doc(db, 'reminder_tagihan', tagihanId);
      await updateDoc(tagihanRef, { status: statusBaru });
      return { success: true };
    } catch (error) {
      console.error("Error updating status tagihan:", error);
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

// ==========================================
// PENGELOLAAN DOKUMEN / MEDIA (KYC/KTP dll)
// ==========================================
export const documentService = {
  uploadFile: async (file, pathFolder = "dokumen_kyc") => {
    if (!file) return { success: false, error: "Tidak ada file" };
    try {
      // Buat referensi file unik
      const fileName = `${Date.now()}_${file.name}`;
      const fileRef = ref(storage, `${pathFolder}/${fileName}`);
      
      // Proses upload
      const snapshot = await uploadBytes(fileRef, file);
      
      // Ambil public url nya
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error("Error uploading file to storage:", error);
      return { 
        success: false, 
        error: "Gagal unggah. Pastikan Firebase Storage Rules terbuka, atau periksa koneksi." 
      };
    }
  }
};

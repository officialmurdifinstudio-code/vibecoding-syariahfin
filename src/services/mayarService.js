const MAYAR_API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTNhNmY5ZC02YzI2LTQyYmMtOTFlMi1jNzJkNmVmMWM2MWQiLCJhY2NvdW50SWQiOiJiN2E2OGQ4ZC1lYjJmLTQ4YWQtYWY2ZC05NmQwMjVkMDk2YmQiLCJjcmVhdGVkQXQiOiIxNzcyNDYwNzE4NTQ1Iiwicm9sZSI6ImRldmVsb3BlciIsInN1YiI6InJvc2ltdXJkaWZpbi5tdXJkaWZpbkBnbWFpbC5jb20iLCJuYW1lIjoiTXVyZGlmaW4gU3R1ZGlvIiwibGluayI6Im11cmRpZmluc3R1ZGlvIiwiaXNTZWxmRG9tYWluIjpudWxsLCJpYXQiOjE3NzI0NjA3MTh9.AzbHeaq3aKt25q6IE04xVGzhM3g9nW9MQN8zZV8HTbbco6sXpL1uA7v_-9osLCNHcdbvesyQPjzKztPlKIw_RMu0sk8sVfCBEzPWM-Iy3xSnbZpn4ARGDFVp2sBZbK5xsJY30mDdfD8gvgNFt8KM-noXO_oIGy3aVyHc6tWqHubMGzEaN2CFvmUYZeTDBQJg-L2rYKqdHw4yeOSkO87zP8_wV9lDRjDyDPeSiPl-IRFGrKlVsNEZC8jPnNJUqrfTO6MBkQVQppwcKIdgjVPtf8JgO58jK1ozi4N8r-H1VmdUVYKYJm8Kace5VP-YzRd2Js6H_M3AiyhLt_DzNX7xXw';

export const mayarService = {
  createPaymentLink: async (dataTagihan) => {
    try {
      // Siapkan payload standar Mayar (sesuaikan dengan dokumentasi Mayar)
      const payload = {
        name: dataTagihan.namaNasabah || dataTagihan.userName || 'Nasabah Syariahfin',
        email: dataTagihan.email || 'nasabah@syariahfin.com',
        mobile: dataTagihan.noHp || '080000000000', // Wajib di Mayar API
        amount: dataTagihan.nominal || dataTagihan.cicilanPerBulan,
        description: `Pembayaran Cicilan: ${dataTagihan.namaBarang || dataTagihan.namaTujuan}`,
      };

      const res = await fetch('https://api.mayar.id/hl/v1/payment/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MAYAR_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();
      
      // Biasanya payload kembali di Mayar ada di { data: { link: '...' } }
      if (res.ok && responseData.data && responseData.data.link) {
        return { success: true, link: responseData.data.link };
      } else {
        // Mayar seringkali mengembalikan array of object untuk validation error
        let errorMsg = responseData.message || responseData.messages;
        if (Array.isArray(errorMsg)) errorMsg = errorMsg.map(e => e.message || JSON.stringify(e)).join(', ');
        return { success: false, error: errorMsg || "Gagal membuat Link Mayar" };
      }
    } catch (e) {
      console.error("Mayar API Error:", e);
      return { success: false, error: "Terjadi masalah jaringan ke Server Mayar." };
    }
  }
};

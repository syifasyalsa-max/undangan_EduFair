const elNama = document.getElementById('guest-name');

if (elNama) {
    const params = new URLSearchParams(window.location.search);

    const to = params.get('to');
    const instansi = params.get('instansi');
    const kategori = params.get('kategori');

    // Menampilkan nama tamu
    if (to) {
        elNama.textContent = to;

        const rsvpNama = document.getElementById('rsvp-nama');
        if (rsvpNama) {
            rsvpNama.value = to;
        }
    }

    // Menampilkan instansi
    if (instansi) {
        const guestInstansi = document.getElementById('guest-instansi');
        const rsvpInstansi = document.getElementById('rsvp-instansi');

        if (guestInstansi) {
            guestInstansi.textContent = instansi;
        }

        if (rsvpInstansi) {
            rsvpInstansi.value = instansi;
        }
    }

    // Menampilkan kategori
    if (kategori) {
        const guestKategori = document.getElementById('guest-kategori');

        if (guestKategori) {
            guestKategori.textContent = kategori;
        }
    }

    // FORM RSVP
    const rsvpForm = document.getElementById('rsvp-form');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const nama = document.getElementById('rsvp-nama').value;
            const status = document.getElementById('rsvp-status').value;

            const msg = document.getElementById('rsvp-msg');

            if (msg) {
                msg.textContent =
                    `✅ Terima kasih ${nama}, konfirmasi "${status}" berhasil dicatat!`;

                msg.style.display = 'block';
            }
        });
    }
}


// ==========================================
// 2. LOGIKA HALAMAN ADMIN (admin.html)
// ==========================================

const tbody = document.getElementById('tabelTamu');

if (tbody) {

    const statusMuat = document.getElementById('status-muat');
    const fileInput = document.getElementById('csvFile');

    // Link menuju halaman undangan
    const baseUrl = window.location.href
        .split('?')[0]
        .replace('admin.html', 'index.html');


    // ==========================================
    // 3. FORMAT NOMOR WHATSAPP
    // ==========================================

    function formatNomor(nomor) {

        nomor = String(nomor || '').trim();

        // Hapus tanda +, spasi, strip, dan karakter lain
        nomor = nomor.replace(/\D/g, '');

        // Ubah 08 menjadi 628
        if (nomor.startsWith('08')) {
            nomor = '62' + nomor.substring(1);
        }

        // Ubah 8 menjadi 628
        else if (nomor.startsWith('8')) {
            nomor = '62' + nomor;
        }

        return nomor;
    }


    // ==========================================
    // 4. MEMBACA CSV OTOMATIS
    // ==========================================

    function muatCSV() {

        statusMuat.textContent = 'Memuat data tamu...';

        fetch('data-tamu.csv?t=' + Date.now())

            .then(response => {

                if (!response.ok) {
                    throw new Error('File CSV tidak ditemukan');
                }

                return response.text();
            })

            .then(csvText => {
                prosesCSV(csvText);
            })

            .catch(error => {

                statusMuat.textContent =
                    'Gagal memuat CSV. Silakan upload file secara manual.';

                console.error(error);
            });
    }


    // ==========================================
    // 5. UPLOAD CSV MANUAL
    // ==========================================

    if (fileInput) {

        fileInput.addEventListener('change', function(e) {

            const file = e.target.files[0];

            if (!file) return;

            statusMuat.textContent = 'Memproses file CSV...';

            prosesCSV(file);
        });
    }


    // ==========================================
    // 6. PROSES DAN TAMPILKAN DATA CSV
    // ==========================================

    function prosesCSV(source) {

        Papa.parse(source, {

            header: true,

            skipEmptyLines: true,

            transformHeader: header =>
                header.trim().replace(/^\uFEFF/, ''),

            complete: function(results) {

                const data = results.data.filter(row =>
                    row.nama_tamu && row.nama_tamu.trim()
                );

                tbody.innerHTML = '';

                statusMuat.textContent =
                    `${data.length} data tamu berhasil dimuat.`;


                // Jika CSV kosong
                if (data.length === 0) {

                    tbody.innerHTML = `
                        <tr>
                            <td colspan="6" style="text-align:center; padding:20px;">
                                Tidak ada data tamu.
                            </td>
                        </tr>
                    `;

                    return;
                }


                // Menampilkan setiap data tamu
                data.forEach(row => {

                    // Format nomor WhatsApp
                    const nomorWA = formatNomor(row.no_whatsapp);


                    // Membuat link undangan personal
                    const linkUndangan =
                        `${baseUrl}?to=${encodeURIComponent(row.nama_tamu)}&instansi=${encodeURIComponent(row.instansi || '')}&kategori=${encodeURIComponent(row.kategori || '')}`;


                    // Membuat pesan WhatsApp
                    const pesan =
                        `Yth. Bapak/Ibu *${row.nama_tamu}* (${row.instansi || '-'}).\n` +
                        `Kami mengundang Anda untuk menghadiri acara *Edu Fair & Career Day 2026* di SMKN 6 Kota Tangerang Selatan.\n\n` +
                        `Berikut link undangan digital Anda:\n${linkUndangan}`;


                    // Membuat link WhatsApp
                    const linkWA =
                        `https://wa.me/${nomorWA}?text=${encodeURIComponent(pesan)}`;


                    // Membuat baris tabel
                    const tr = document.createElement('tr');


                    // Kolom ID
                    const tdID = document.createElement('td');
                    tdID.textContent = row.id || '-';
                    tr.appendChild(tdID);


                    // Kolom Nama
                    const tdNama = document.createElement('td');

                    const strong = document.createElement('strong');
                    strong.textContent = row.nama_tamu;

                    tdNama.appendChild(strong);
                    tr.appendChild(tdNama);


                    // Kolom Instansi
                    const tdInstansi = document.createElement('td');
                    tdInstansi.textContent = row.instansi || '-';
                    tr.appendChild(tdInstansi);


                    // Kolom Kategori
                    const tdKategori = document.createElement('td');

                    const spanKategori = document.createElement('span');
                    spanKategori.textContent = row.kategori || '-';

                    spanKategori.style.background = '#f1f5f9';
                    spanKategori.style.padding = '4px 10px';
                    spanKategori.style.borderRadius = '6px';
                    spanKategori.style.fontSize = '0.82rem';
                    spanKategori.style.fontWeight = '600';
                    spanKategori.style.color = '#334155';

                    tdKategori.appendChild(spanKategori);
                    tr.appendChild(tdKategori);


                    // Kolom Nomor WhatsApp
                    const tdNomor = document.createElement('td');

                    tdNomor.textContent = nomorWA
                        ? '+' + nomorWA
                        : '-';

                    tr.appendChild(tdNomor);


                    // Kolom Tombol WhatsApp
                    const tdAksi = document.createElement('td');

                    if (nomorWA.length >= 10 && nomorWA.length <= 15) {

                        const tombolWA = document.createElement('a');

                        tombolWA.href = linkWA;
                        tombolWA.target = '_blank';
                        tombolWA.rel = 'noopener noreferrer';
                        tombolWA.className = 'btn-wa-gold';
                        tombolWA.textContent = 'Kirim WhatsApp';

                        tdAksi.appendChild(tombolWA);

                    } else {

                        tdAksi.textContent = 'Nomor tidak valid';
                    }

                    tr.appendChild(tdAksi);


                    // Masukkan baris ke tabel
                    tbody.appendChild(tr);

                });


                // Informasi error CSV jika ada
                if (results.errors.length > 0) {
                    console.warn('Peringatan CSV:', results.errors);
                }
            },

            error: function(error) {

                statusMuat.textContent =
                    'Gagal membaca file CSV: ' + error.message;

                console.error(error);
            }
        });
    }

    muatCSV();

}

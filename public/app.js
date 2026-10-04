const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const today = () => iso(new Date());
const curYear = () => String(new Date().getFullYear());
const getStartOfWeek = (d = new Date()) => {
  const dt = new Date(d);
  const diff = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - diff);
  return iso(dt);
};

const K = 'lpi_db', S = 'lpi_user', $ = s => document.querySelector(s);
const roundDec = (n, d = 2) => Math.round((Number(n) || 0) * Math.pow(10, d)) / Math.pow(10, d);
const itemTot = i => roundDec((Number(i.qty) || 0) * (Number(i.price) || 0));
const rp = n => 'Rp' + Math.round(n || 0).toLocaleString('id-ID');
const fd = d => new Date(d + 'T00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  PAL = ['#FF7200', '#16a34a', '#2563eb', '#9333ea', '#dc2626', '#0891b2', '#ca8a04', '#64748b', '#be185d'];

let db = null, user = null;

// Hak akses peran umum
const can = a =>
  ({
    input: ['Super Admin', 'Admin', 'Operator'],
    edit: ['Super Admin', 'Admin', 'Operator'],
    del: ['Super Admin', 'Admin'],
    master: ['Super Admin', 'Admin'],
    users: ['Super Admin'],
  }[a] || []).includes(user ? user.role : '');

// Hak akses granular: Operator hanya dapat mengedit transaksi yang dibuatnya sendiri
const canEditPurchase = p => {
  if (!user || !p) return false;
  if (['Super Admin', 'Admin'].includes(user.role)) return true;
  if (user.role === 'Operator') {
    return p.createdById === user.id || p.by === user.name;
  }
  return false;
};

const tot = p => (p.items || []).reduce((s, i) => roundDec(s + itemTot(i)), 0);
const locN = c => (db.locations.find(l => l.code == c) || { name: c }).name;
const rows = f =>
  db.purchases
    .filter(
      p =>
        (!f.y || p.date.slice(0, 4) == f.y) &&
        (!f.m || p.date.slice(5, 7) == f.m) &&
        (!f.g || p.loc == f.g) &&
        (!f.a || p.date >= f.a) &&
        (!f.b || p.date <= f.b)
    )
    .flatMap(p => p.items.filter(i => !f.c || i.cat == f.c).map(i => ({ p, i, t: itemTot(i) })));

const sum = a => roundDec(a.reduce((s, x) => s + x.t, 0));
const ntx = a => new Set(a.map(x => x.p.id)).size;
const grp = (a, k) => {
  const o = {};
  a.forEach(x => {
    const y = k(x);
    o[y] = roundDec((o[y] || 0) + x.t);
  });
  return o;
};

const toast = m => {
  const t = $('#toast');
  if (!t) return;
  t.textContent = m;
  t.style.display = 'block';
  setTimeout(() => (t.style.display = 'none'), 2500);
};

const opt = (a, v, all) =>
  (all ? `<option value="">${all}</option>` : '') +
  a
    .map(x => {
      const [val, l] = Array.isArray(x) ? x : [x, x];
      return `<option value="${esc(val)}"${val == v ? ' selected' : ''}>${esc(l)}</option>`;
    })
    .join('');

const yrs = () => [...new Set(db.purchases.map(p => p.date.slice(0, 4)).concat(curYear()))].sort();

const hbar = o => {
  const e = Object.entries(o).sort((a, b) => b[1] - a[1]),
    mx = Math.max(1, ...e.map(x => x[1]));
  return (
    e
      .map(
        ([k, v]) =>
          `<div class="bar"><i>${esc(k)}</i><div><u style="width:${(v / mx) * 100}%"></u></div><em>${rp(
            v
          )}</em></div>`
      )
      .join('') || '<p>Belum ada data.</p>'
  );
};

function line(v) {
  const mx = Math.max(1, ...v),
    w = 600,
    h = 180,
    x = i => 30 + (i * (w - 50)) / 11,
    y = n => h - 20 - (n / mx) * (h - 40);
  return `<svg viewBox="0 0 ${w} ${h}" width="100%"><polyline fill="none" stroke="#FF7200" stroke-width="3" points="${v
    .map((n, i) => x(i) + ',' + y(n))
    .join(' ')}"/>${v
    .map(
      (n, i) =>
        `<circle cx="${x(i)}" cy="${y(n)}" r="4" fill="#FF7200"><title>${MON[i]}: ${rp(
          n
        )}</title></circle><text x="${x(i)}" y="${h - 4}" font-size="11" text-anchor="middle" fill="#6b7280">${
          MON[i]
        }</text>`
    )
    .join('')}</svg>`;
}

function multiLineChart(series, labels) {
  const w = 700, h = 240;
  const allValues = series.flatMap(s => s.data);
  const mx = Math.max(1, ...allValues);
  const x = i => 40 + (i * (w - 70)) / (labels.length - 1 || 1);
  const y = n => h - 30 - (n / mx) * (h - 60);

  const linesSvg = series.map((s, idx) => {
    const color = PAL[idx % PAL.length];
    const points = s.data.map((val, i) => `${x(i)},${y(val)}`).join(' ');
    const dots = s.data.map((val, i) => `<circle cx="${x(i)}" cy="${y(val)}" r="3.5" fill="${color}"><title>${s.name} - ${labels[i]}: ${rp(val)}</title></circle>`).join('');
    return `<polyline fill="none" stroke="${color}" stroke-width="2.5" points="${points}" opacity="0.9" />${dots}`;
  }).join('');

  const xLabels = labels.map((l, i) => `<text x="${x(i)}" y="${h - 8}" font-size="10" text-anchor="middle" fill="#6b7280">${l}</text>`).join('');
  const legend = series.map((s, idx) => `<span style="font-size:12px;margin-right:12px;display:inline-flex;align-items:center"><b style="display:inline-block;width:10px;height:10px;background:${PAL[idx % PAL.length]};margin-right:4px;border-radius:2px"></b>${esc(s.name)}</span>`).join('');

  return `<div><svg viewBox="0 0 ${w} ${h}" width="100%" style="overflow:visible">${linesSvg}${xLabels}</svg><div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px">${legend}</div></div>`;
}

function donut(o) {
  const e = Object.entries(o).sort((a, b) => b[1] - a[1]),
    s = e.reduce((a, x) => a + x[1], 0) || 1;
  let a = 0;
  const g = e
    .map(([k, v], i) => {
      const f = a;
      a += (v / s) * 100;
      return `${PAL[i % 9]} ${f}% ${a}%`;
    })
    .join(',');
  return `<div class="donut"><div style="background:conic-gradient(${
    g || '#eee 0 100%'
  })"></div><div class="lg">${e
    .map(
      ([k, v], i) =>
        `<span><b style="background:${PAL[i % 9]}"></b>${esc(k)} — ${rp(v)} (${Math.round((v / s) * 100)}%)</span>`
    )
    .join('')}</div></div>`;
}

const F = { y: curYear(), m: '', g: '', c: '' },
  L = { q: '', a: '', b: '', g: '', c: '', o: '', pg: 1 },
  RW = { a: getStartOfWeek(), b: today(), g: '', c: '' },
  RB = { y: curYear(), g: '', c: '' };

let draft = null;

const NAV = [
  ['dashboard', 'Dashboard'],
  ['h', 'Pembelian'],
  ['pembelian', 'Daftar Pembelian'],
  ['baru', 'Tambah Pembelian'],
  ['h', 'Rekap'],
  ['mingguan', 'Rekap Mingguan'],
  ['bulanan', 'Rekap Bulanan'],
  ['h', 'Master Data'],
  ['m/locations', 'Lokasi/Gedung'],
  ['m/products', 'Barang'],
  ['m/categories', 'Kategori'],
  ['m/units', 'Satuan'],
  ['h', 'Sistem'],
  ['users', 'Pengguna'],
  ['setelan', 'Pengaturan'],
];

function toggleNotif() {
  const m = $('#notifDropdown');
  if (m) m.style.display = m.style.display === 'block' ? 'none' : 'block';
}

function doGlobalSearch(val) {
  L.q = (val || '').trim();
  L.pg = 1;
  location.hash = '#/pembelian';
}

function formalPrint(title = 'LAPORAN PEMBELIAN OPERASIONAL') {
  const printHeader = `
    <div class="print-header">
      <h2>LEMBAGA PENDIDIKAN ISLAM (LPI) SARI BUMI</h2>
      <p>Jl. Raden Patah No. 12 Sidoarjo • Telp: (031) 8941234 • Email: operasional@lpi-saribumi.sch.id</p>
      <h3 style="margin-top:10px;text-decoration:underline">${title}</h3>
      <p style="font-size:8pt">Dicetak pada: ${new Date().toLocaleString('id-ID')} | Dicetak oleh: ${esc(user.name)} (${user.role})</p>
    </div>
  `;
  const printFooter = `
    <div class="print-footer">
      <div class="print-sig">
        Mengetahui / Memeriksa,<br><strong>Kepala Sarpras & Operasional</strong>
        <div class="line"></div>
        ( .................................... )
      </div>
      <div class="print-sig">
        Petugas Pembelian,<br><strong>Operator Administrasi</strong>
        <div class="line"></div>
        ( ${esc(user.name)} )
      </div>
    </div>
  `;
  let existingHeader = document.querySelector('.print-header');
  let existingFooter = document.querySelector('.print-footer');
  if (existingHeader) existingHeader.remove();
  if (existingFooter) existingFooter.remove();

  const pg = document.querySelector('.pg');
  if (pg) {
    pg.insertAdjacentHTML('afterbegin', printHeader);
    pg.insertAdjacentHTML('beforeend', printFooter);
  }
  window.print();
}

function go() {
  if (!user || !db) return login();
  const h = location.hash.slice(2) || 'dashboard',
    [pg, a, b] = h.split('/'),
    V = {
      dashboard,
      pembelian: list,
      baru: () => form(),
      detail: () => detail(+a),
      edit: () => form(+a),
      mingguan: rweek,
      bulanan: rmonth,
      m: () => master(a),
      users: usr,
      setelan: settingsPage,
    };
  const cur = h.startsWith('m/') ? h : pg,
    title = (NAV.find(n => n[0] == cur) || [0, 'Detail Pembelian'])[1];

  const recentBig = db.purchases.filter(p => tot(p) > 500000).slice(-3);
  const notifList = [
    { title: 'Validitas Nota > Rp500.000', text: 'Wajib cap basah vendor & paraf Kepala Unit bersangkutan.' },
    ...recentBig.map(p => ({ title: `Nota ${p.no} (${rp(tot(p))})`, text: `${esc(locN(p.loc))} — ${fd(p.date)}` })),
  ];

  $('#app').innerHTML = `
    <div class="side">
      <h2>☪ LPI Pembelian</h2>
      ${NAV.map(([p, l]) =>
        p == 'h' ? `<small>${l}</small>` : `<a href="#/${p}" class="${p == cur ? 'on' : ''}">${l}</a>`
      ).join('')}
    </div>
    <div class="main">
      <div class="top">
        <div class="top-left">
          <h1>${title}</h1>
          <div class="top-search">
            <input type="search" placeholder="🔍 Cari transaksi, gedung, barang..." value="${esc(L.q)}" onkeydown="if(event.key==='Enter')doGlobalSearch(this.value)">
          </div>
        </div>
        <div class="top-right">
          <div class="notif-wrap">
            <button class="btn s sm notif-btn" onclick="toggleNotif()">
              🔔 Notifikasi <span class="notif-badge">${notifList.length}</span>
            </button>
            <div id="notifDropdown" class="notif-menu">
              <h4>Pemberitahuan Sistem</h4>
              ${notifList.map(n => `<div class="notif-item"><strong>${n.title}</strong>${n.text}</div>`).join('')}
            </div>
          </div>
          <span><strong>${esc(user.name)}</strong> <small style="color:var(--m)">(${user.role})</small></span>
          <button class="btn s sm" onclick="logout()">Keluar</button>
        </div>
      </div>
      <div class="pg">${(V[pg] || dashboard)()}</div>
    </div>
  `;
}

function login() {
  $('#app').innerHTML = `
    <div class="card login">
      <h2 style="color:#FF7200;text-align:center">☪ Sistem Pembelian LPI</h2>
      <p style="color:#6b7280;font-size:12px;text-align:center;margin-bottom:16px">Lembaga Pendidikan Islam Sari Bumi Sidoarjo</p>
      <input id="u" placeholder="Username (misal: operator / admin / super)">
      <input id="p" type="password" placeholder="Password">
      <button class="btn" style="width:100%;margin-top:8px" onclick="doLogin()">Masuk</button>
      <p style="color:#6b7280;font-size:11px;margin-top:14px;line-height:1.4">Akun Default:<br>• super / super123 (Super Admin)<br>• admin / admin123 (Admin)<br>• operator / operator123 (Operator)</p>
    </div>
  `;
}

function dashboard() {
  const curT = today(),
    curW = getStartOfWeek();
  const r = rows(F),
    k = { g: F.g, c: F.c };
  const all = rows(k),
    td = all.filter(x => x.p.date == curT),
    wk = all.filter(x => x.p.date >= curW),
    mo = all.filter(x => x.p.date.slice(0, 7) == curT.slice(0, 7));
  const mr = rows({ y: F.y, g: F.g, c: F.c }),
    mv = MON.map((_, i) => sum(mr.filter(x => +x.p.date.slice(5, 7) == i + 1)));
  const recent = db.purchases
    .filter(p => !F.g || p.loc == F.g)
    .slice(-6)
    .reverse();

  return `<div class="bar2 noprint"><select onchange="F.y=this.value;go()">${opt(yrs(), F.y)}</select><select onchange="F.m=this.value;go()">${opt(
    MON.map((m, i) => [String(i + 1).padStart(2, '0'), m]),
    F.m,
    'Semua Bulan'
  )}</select><select onchange="F.g=this.value;go()">${opt(
    db.locations.map(l => [l.code, l.name]),
    F.g,
    'Semua Gedung'
  )}</select><select onchange="F.c=this.value;go()">${opt(
    db.categories.map(c => c.name),
    F.c,
    'Semua Kategori'
  )}</select></div>
  <div class="grid">${[
    ['Pengeluaran Hari Ini', rp(sum(td))],
    ['Pengeluaran Minggu Ini', rp(sum(wk))],
    ['Pengeluaran Bulan Ini', rp(sum(mo))],
    ['Jumlah Transaksi (filter)', ntx(r)],
  ]
    .map(([a, b]) => `<div class="card kpi"><span>${a}</span><b>${b}</b></div>`)
    .join('')}</div>
  <div class="grid g2"><div class="card"><h3>Pengeluaran per Gedung</h3>${hbar(
    grp(r, x => locN(x.p.loc))
  )}</div><div class="card"><h3>Tren Pengeluaran Bulanan ${F.y}</h3>${line(mv)}</div></div>
  <div class="card"><h3>Pengeluaran Berdasarkan Kategori</h3>${donut(grp(r, x => x.i.cat))}</div>
  <div class="card sc"><h3>Transaksi Terbaru</h3><table><tr><th>No. Transaksi<th>Tanggal<th>Gedung<th class="n">Total</tr>${recent
    .map(
      p =>
        `<tr><td><a href="#/detail/${p.id}">${p.no}</a><td>${fd(p.date)}<td>${esc(locN(p.loc))}<td class="n">${rp(
          tot(p)
        )}</tr>`
    )
    .join('')}</table></div>`;
}

function list() {
  const q = L.q.toLowerCase(),
    ps = db.purchases
      .filter(
        p =>
          (!q ||
            p.no.toLowerCase().includes(q) ||
            locN(p.loc).toLowerCase().includes(q) ||
            p.items.some(i => i.name.toLowerCase().includes(q))) &&
          (!L.a || p.date >= L.a) &&
          (!L.b || p.date <= L.b) &&
          (!L.g || p.loc == L.g) &&
          (!L.c || p.items.some(i => i.cat == L.c)) &&
          (!L.o || p.by == L.o)
      )
      .reverse(),
    pp = 10,
    pc = Math.max(1, Math.ceil(ps.length / pp));
  L.pg = Math.min(L.pg, pc);
  const f = (k, v) => `L.${k}=${v};L.pg=1;go()`;

  // Filter operator dinamis dari pengguna dan transaksi yang ada
  const operators = [...new Set((db.users || []).map(u => u.name).concat(db.purchases.map(p => p.by)))].filter(Boolean).sort();

  return `<div class="card"><div class="bar2 noprint"><input placeholder="Cari no. transaksi, barang, gedung" value="${esc(
    L.q
  )}" onchange="${f('q', 'this.value')}" size="24"><input type="date" value="${L.a}" onchange="${f(
    'a',
    'this.value'
  )}"><input type="date" value="${L.b}" onchange="${f('b', 'this.value')}"><select onchange="${f(
    'g',
    'this.value'
  )}">${opt(
    db.locations.map(l => [l.code, l.name]),
    L.g,
    'Semua Gedung'
  )}</select><select onchange="${f('c', 'this.value')}">${opt(
    db.categories.map(c => c.name),
    L.c,
    'Semua Kategori'
  )}</select><select onchange="${f('o', 'this.value')}">${opt(
    operators,
    L.o,
    'Semua Operator'
  )}</select>${can('input') ? '<a class="btn" href="#/baru">+ Tambah Pembelian</a>' : ''}<button class="btn s" onclick="xl()">Unduh Excel (.xlsx)</button><button class="btn s" onclick="formalPrint('DAFTAR TRANSAKSI PEMBELIAN')">Cetak / PDF</button></div>
  <div class="sc"><table id="tl"><thead><tr><th>No. Transaksi<th>Tanggal<th>Gedung<th class="n">Jumlah Item<th class="n">Total<th>Operator<th class="noprint">Aksi</tr></thead><tbody>${ps
    .slice((L.pg - 1) * pp, L.pg * pp)
    .map(
      p =>
        `<tr><td>${p.no}<td>${fd(p.date)}<td>${esc(locN(p.loc))}<td class="n">${p.items.length}<td class="n">${rp(
          tot(p)
        )}<td>${esc(p.by)}<td class="noprint"><a class="btn s sm" href="#/detail/${p.id}">Detail</a> ${
          canEditPurchase(p) ? `<a class="btn s sm" href="#/edit/${p.id}">Edit</a>` : ''
        }</tr>`
    )
    .join('') || '<tr><td colspan=7>Tidak ada transaksi.</tr>'}</tbody></table></div>
  <div class="pgn noprint"><span>${ps.length} transaksi</span><button class="btn s sm" ${
    L.pg < 2 ? 'disabled' : ''
  } onclick="L.pg--;go()">‹</button>${L.pg}/${pc}<button class="btn s sm" ${
    L.pg >= pc ? 'disabled' : ''
  } onclick="L.pg++;go()">›</button></div></div>`;
}

function detail(id) {
  const p = db.purchases.find(x => x.id == id);
  if (!p) return '<div class="card">Transaksi tidak ditemukan.</div>';
  return `<div class="card"><h2>${p.no}</h2><p>Gedung: <b>${esc(locN(p.loc))}</b><br>Tanggal: ${fd(
    p.date
  )}<br>Operator: <b>${esc(p.by)}</b>${p.upd ? `<br>Diubah terakhir oleh: ${esc(p.upd)}` : ''}<br>Keterangan: ${
    esc(p.desc) || '-'
  }</p><div class="sc"><table id="td"><thead><tr><th>Barang<th>Kategori<th class="n">Qty<th>Satuan<th class="n">Harga<th class="n">Total</tr></thead><tbody>${p.items
    .map(
      i =>
        `<tr><td>${esc(i.name)}<td>${esc(i.cat)}<td class="n">${i.qty}<td>${esc(i.unit)}<td class="n">${rp(
          i.price
        )}<td class="n">${rp(itemTot(i))}</tr>`
    )
    .join('')}</tbody></table></div><div class="tot">Total: ${rp(tot(p))}</div>
  <div class="bar2 noprint">${
    canEditPurchase(p) ? `<a class="btn" href="#/edit/${p.id}">Edit</a>` : ''
  }<button class="btn s" onclick="formalPrint('BUKTI TRANSAKSI PEMBELIAN (${p.no})')">Cetak Bukti Transaksi</button><button class="btn s" onclick="xl()">Unduh Excel</button>${can('del') ? `<button class="btn d" onclick="delP(${p.id})">Hapus</button>` : ''}<a class="btn s" href="#/pembelian">Kembali</a></div></div>`;
}

function form(id) {
  if (!can('input') && !id) return '<div class="card">Anda tidak memiliki akses menambah transaksi.</div>';
  const existing = id && db.purchases.find(x => x.id == id);
  if (id && existing && !canEditPurchase(existing)) {
    return '<div class="card"><p style="color:var(--r)">Anda tidak memiliki hak akses untuk mengedit transaksi ini. Operator hanya dapat mengubah transaksi yang dibuat oleh akunnya sendiri.</p><a class="btn s" href="#/pembelian">Kembali</a></div>';
  }

  if (!draft || draft.eid != id) {
    draft = existing
      ? {
          eid: id,
          date: existing.date,
          loc: existing.loc,
          desc: existing.desc,
          items: existing.items.map(it => ({
            productId: it.productId || null,
            name: it.name,
            cat: it.cat,
            qty: it.qty,
            unit: it.unit,
            price: it.price,
          })),
        }
      : {
          eid: id,
          date: today(),
          loc: '',
          desc: '',
          items: [{ productId: null, name: '', cat: 'ATK', qty: 1, unit: 'pcs', price: 0 }],
        };
  }
  return `<div class="card"><div class="bar2"><label>Tanggal <input type="date" value="${
    draft.date
  }" onchange="draft.date=this.value"></label><label>Gedung <select onchange="draft.loc=this.value">${opt(
    db.locations.filter(l => l.on).map(l => [l.code, l.name]),
    draft.loc,
    'Pilih gedung'
  )}</select></label><input placeholder="Keterangan (opsional)" value="${esc(
    draft.desc
  )}" oninput="draft.desc=this.value" size="30"></div>
  <datalist id="pl">${db.products
    .filter(p => p.on)
    .map(
      p =>
        `<option value="${esc(p.name)}" data-id="${p.id}" label="${esc(p.code ? '[' + p.code + '] ' : '')}${esc(p.name)} (${esc(p.category)} - ${rp(p.price)}/${esc(p.unit)})"></option>`
    )
    .join('')}</datalist><div class="sc"><table><thead><tr><th>Barang<th>Kategori<th>Qty<th>Satuan<th>Harga<th class="n">Total<th></tr></thead><tbody id="it">${itRows()}</tbody></table></div>
  <p><button class="btn" onclick="draft.items.push({productId:null,name:'',cat:'ATK',qty:1,unit:'pcs',price:0});$('#it').innerHTML=itRows();calc()">+ Tambah Barang</button></p><div class="tot" id="gt"></div>
  <div class="bar2"><button class="btn" onclick="saveP()">Simpan</button><a class="btn s" href="#/pembelian" onclick="draft=null">Batal</a></div></div>`;
}

const itRows = () =>
  draft.items
    .map(
      (it, n) =>
        `<tr><td><input list="pl" value="${esc(it.name)}" placeholder="Pilih/ketik barang" oninput="draft.items[${n}].name=this.value" onchange="pick(${n},this.value)"><td><select onchange="draft.items[${n}].cat=this.value">${opt(
          db.categories.map(c => c.name),
          it.cat
        )}</select><td><input type="number" min="0" step="any" style="width:80px" value="${
          it.qty
        }" oninput="draft.items[${n}].qty=+this.value;calc()"><td><select onchange="draft.items[${n}].unit=this.value">${opt(
          db.units.map(u => u.name),
          it.unit
        )}</select><td><input type="number" min="0" style="width:120px" value="${
          it.price
        }" oninput="draft.items[${n}].price=+this.value;calc()"><td class="n" id="r${n}">${rp(
          itemTot(it)
        )}<td><button class="btn d sm" onclick="if(draft.items.length>1){draft.items.splice(${n},1);$('#it').innerHTML=itRows();calc()}">✕</button></tr>`
    )
    .join('');

function calc() {
  draft.items.forEach((i, n) => {
    const e = $('#r' + n);
    if (e) e.textContent = rp(itemTot(i));
  });
  const grandTotal = draft.items.reduce((s, i) => roundDec(s + itemTot(i)), 0);
  $('#gt').textContent = 'Total Transaksi: ' + rp(grandTotal);
}

function pick(n, v) {
  const trimmed = (v || '').trim();
  const opts = Array.from(document.querySelectorAll('#pl option'));
  const match = opts.find(o => o.value.toLowerCase() === trimmed.toLowerCase());
  const optId = match ? Number(match.getAttribute('data-id')) : null;
  const p =
    (optId && db.products.find(x => x.id === optId)) ||
    db.products.find(x => x.name.toLowerCase() === trimmed.toLowerCase() || (x.code && x.code.toLowerCase() === trimmed.toLowerCase()));
  const i = draft.items[n];
  if (p) {
    i.productId = p.id;
    i.name = p.name;
    i.cat = p.category;
    i.unit = p.unit;
    if (!i.price) i.price = p.price;
  } else {
    i.productId = null;
    i.name = trimmed;
  }
  $('#it').innerHTML = itRows();
  calc();
}

function rweek() {
  const r = rows(RW),
    by = {};
  r.forEach(x => {
    const o = (by[x.p.loc] = by[x.p.loc] || { t: 0, s: new Set(), n: 0 });
    o.t = roundDec(o.t + x.t);
    o.n++;
    o.s.add(x.p.id);
  });
  return `<div class="card"><div class="bar2 noprint"><input type="date" value="${
    RW.a
  }" onchange="RW.a=this.value;go()"><input type="date" value="${RW.b}" onchange="RW.b=this.value;go()"><select onchange="RW.g=this.value;go()">${opt(
    db.locations.map(l => [l.code, l.name]),
    RW.g,
    'Semua Gedung'
  )}</select><select onchange="RW.c=this.value;go()">${opt(
    db.categories.map(c => c.name),
    RW.c,
    'Semua Kategori'
  )}</select><a class="btn s" href="/api/export/weekly?${new URLSearchParams({
    a: RW.a,
    b: RW.b,
    g: RW.g,
    c: RW.c,
  })}">Unduh Excel Resmi (.xlsx)</a><button class="btn s" onclick="formalPrint('REKAP PENGELUARAN MINGGUAN')">Cetak / PDF</button></div>
  <div class="grid"><div class="card kpi"><span>Total Transaksi</span><b>${ntx(
    r
  )}</b></div><div class="card kpi"><span>Total Item</span><b>${r.length}</b></div><div class="card kpi"><span>Total Pengeluaran</span><b>${rp(
    sum(r)
  )}</b></div></div>
  <div class="sc"><table id="rt"><thead><tr><th>Gedung<th class="n">Transaksi<th class="n">Item<th class="n">Pengeluaran</tr></thead><tbody>${
    Object.entries(by)
      .map(
        ([k, o]) =>
          `<tr><td>${esc(locN(k))}<td class="n">${o.s.size}<td class="n">${o.n}<td class="n">${rp(o.t)}</tr>`
      )
      .join('') || '<tr><td colspan=4>Tidak ada data.</tr>'
  }</tbody></table></div><h3>Breakdown Pengeluaran Harian</h3>${hbar(grp(r, x => fd(x.p.date)))}</div>`;
}

function rmonth() {
  const r = rows(RB),
    gs = db.locations.filter(l => !RB.g || l.code == RB.g),
    mv = MON.map((_, i) => sum(r.filter(x => +x.p.date.slice(5, 7) == i + 1)));

  // Data series per gedung untuk grafik perbandingan antar bulan (PRD Bagian 8)
  const seriesPerGedung = gs.map(l => {
    const locRows = r.filter(x => x.p.loc == l.code);
    return {
      name: l.name,
      data: MON.map((_, i) => sum(locRows.filter(x => +x.p.date.slice(5, 7) == i + 1))),
    };
  }).filter(s => s.data.some(v => v > 0));

  return `<div class="card"><div class="bar2 noprint"><select onchange="RB.y=this.value;go()">${opt(
    yrs(),
    RB.y
  )}</select><select onchange="RB.g=this.value;go()">${opt(
    db.locations.map(l => [l.code, l.name]),
    RB.g,
    'Semua Gedung'
  )}</select><select onchange="RB.c=this.value;go()">${opt(
    db.categories.map(c => c.name),
    RB.c,
    'Semua Kategori'
  )}</select><a class="btn s" href="/api/export/monthly?${new URLSearchParams({
    y: RB.y,
    g: RB.g,
    c: RB.c,
  })}">Unduh Excel Matrix (.xlsx)</a><button class="btn s" onclick="formalPrint('REKAP PENGELUARAN BULANAN TAHUN ' + RB.y)">Cetak / PDF</button></div>
  <div class="grid"><div class="card kpi"><span>Total Transaksi</span><b>${ntx(
    r
  )}</b></div><div class="card kpi"><span>Total Pengeluaran</span><b>${rp(sum(r))}</b></div></div>
  <div class="sc"><table id="rt"><thead><tr><th>Gedung${MON.map(m => `<th class="n">${m}`).join(
    ''
  )}<th class="n">Total</tr></thead><tbody>${gs
    .map(l => {
      const a = r.filter(x => x.p.loc == l.code);
      return `<tr><td>${esc(l.name)}${MON.map(
        (_, i) => `<td class="n">${rp(sum(a.filter(x => +x.p.date.slice(5, 7) == i + 1)))}`
      ).join('')}<td class="n"><b>${rp(sum(a))}</b></tr>`;
    })
    .join('')}<tr><th>Total${mv.map(v => `<th class="n">${rp(v)}`).join('')}<th class="n">${rp(
    sum(r)
  )}</tr></tbody></table></div>
  <h3>Perbandingan Pengeluaran Antar Gedung Sepanjang Tahun ${RB.y}</h3>
  <div class="card" style="padding:20px 16px">${multiLineChart(seriesPerGedung, MON)}</div>
  <h3>Tren Pengeluaran Total Bulanan</h3>
  <div class="card">${line(mv)}</div></div>`;
}

const MC = {
  locations: ['Lokasi/Gedung', ['code', 'Kode Gedung'], ['name', 'Nama Gedung'], ['description', 'Keterangan']],
  products: ['Barang', ['code', 'Kode Barang'], ['name', 'Nama Barang'], ['category', 'Kategori'], ['unit', 'Satuan'], ['price', 'Harga Default (Rp)']],
  categories: ['Kategori', ['name', 'Nama Kategori'], ['description', 'Deskripsi']],
  units: ['Satuan', ['name', 'Nama Satuan'], ['symbol', 'Simbol Satuan']],
};

function master(k) {
  const c = MC[k];
  if (!c) return '';
  const f = c.slice(1);
  return `<div class="card"><div class="bar2 noprint">${
    can('master') ? `<button class="btn" onclick="mAdd('${k}')">+ Tambah ${c[0]}</button>` : ''
  }</div><div class="sc"><table><thead><tr>${f
    .map(x => `<th>${x[1]}`)
    .join('')}<th>Status<th class="noprint">Aksi</tr></thead><tbody>${db[k]
    .map(
      (r, i) =>
        `<tr>${f.map(x => `<td>${esc(r[x[0]])}`).join('')}<td><span class="badge ${r.on ? '' : 'off'}">${
          r.on ? 'Aktif' : 'Nonaktif'
        }</span><td class="noprint">${
          can('master')
            ? `<button class="btn s sm" onclick="mEdit('${k}',${i})">Edit</button> <button class="btn s sm" onclick="mTog('${k}',${i})">${
                r.on ? 'Nonaktifkan' : 'Aktifkan'
              }</button>`
            : ''
        }</tr>`
    )
    .join('')}</tbody></table></div></div>`;
}

function mAsk(k, o) {
  const r = { on: 1, ...o };
  for (const [f, l] of MC[k].slice(1)) {
    let defVal = r[f] !== undefined ? r[f] : '';
    const v = prompt(`${l}:`, defVal);
    if (v === null) return null;
    if (!v.trim() && f === 'name') return toast('Nama wajib diisi') || null;
    r[f] = v.trim();
  }
  return r;
}

function usr() {
  if (!can('users')) return '<div class="card">Hanya Super Admin yang dapat mengakses manajemen pengguna.</div>';
  return `<div class="card"><div class="bar2 noprint"><button class="btn" onclick="uAdd()">+ Tambah Pengguna</button></div><div class="sc"><table><thead><tr><th>Username<th>Nama<th>Email<th>Role<th>Status<th class="noprint">Aksi</tr></thead><tbody>${db.users
    .map(
      (x, i) =>
        `<tr><td><b>${esc(x.username)}</b><td>${esc(x.name)}<td>${esc(x.email || '-')}<td>${x.role}<td><span class="badge ${
          x.on ? '' : 'off'
        }">${x.on ? 'Aktif' : 'Nonaktif'}</span><td class="noprint"><button class="btn s sm" onclick="uEdit(${i})">Edit</button> <button class="btn s sm" onclick="uTog(${i})">${
          x.on ? 'Nonaktifkan' : 'Aktifkan'
        }</button></tr>`
    )
    .join('')}</tbody></table></div></div>`;
}

function settingsPage() {
  return `
    <div class="grid g2">
      <div class="card">
        <h3>🏢 Lembaga Pendidikan Islam (LPI) Sari Bumi</h3>
        <p style="color:var(--m);line-height:1.6">
          Sistem Pengadaan & Pembelian Operasional Terpadu.<br>
          <strong>Alamat:</strong> Jl. Raden Patah No. 12, Sidoarjo, Jawa Timur<br>
          <strong>Unit Naungan:</strong> KB/TK, SD, SMP, SMA, Asrama/Matham, dan TU Umum.
        </p>
        <hr style="border:0;border-top:1px solid var(--b);margin:12px 0">
        <h4>📋 Kebijakan Otorisasi Pembelian</h4>
        <ul style="color:var(--m);padding-left:18px;line-height:1.6">
          <li>Transaksi > <strong>Rp500.000</strong> wajib dilampiri nota berkop & tanda tangan Kepala Unit.</li>
          <li>Format kode otomatis: <code>PB-YYYYMMDD-XXX</code> (nomor urut per hari).</li>
          <li>Operator hanya memiliki hak akses mengubah transaksi yang diinput oleh akunnya sendiri.</li>
        </ul>
      </div>

      <div class="card">
        <h3>🔒 Keamanan Akun Saya</h3>
        <p style="color:var(--m)">Akun login saat ini: <b>${esc(user.name)}</b> (${user.role})</p>
        <div style="margin:12px 0">
          <label style="display:block;margin-bottom:6px">Ganti Password:</label>
          <input type="password" id="np1" placeholder="Password baru (min. 6 karakter)" style="width:100%;margin-bottom:8px">
          <input type="password" id="np2" placeholder="Ulangi password baru" style="width:100%;margin-bottom:8px">
          <button class="btn" onclick="changeMyPassword()">Perbarui Password</button>
        </div>
        <hr style="border:0;border-top:1px solid var(--b);margin:12px 0">
        <h4>📊 Statistik Database</h4>
        <p style="color:var(--m);font-size:12px">
          • Lokasi/Gedung: <b>${db.locations.length}</b><br>
          • Master Barang: <b>${db.products.length}</b><br>
          • Total Transaksi: <b>${db.purchases.length}</b><br>
          • Status Database: <span class="badge">PostgreSQL Connected</span>
        </p>
      </div>
    </div>
  `;
}

async function changeMyPassword() {
  const p1 = $('#np1').value;
  const p2 = $('#np2').value;
  if (!p1 || p1.length < 6) return toast('Password baru minimal 6 karakter');
  if (p1 !== p2) return toast('Konfirmasi password tidak cocok');
  try {
    await api('/api/users/' + user.id, 'PUT', { name: user.name, role: user.role, on: 1, password: p1 });
    $('#np1').value = '';
    $('#np2').value = '';
    toast('Password berhasil diperbarui');
  } catch (e) {
    toast(e.message);
  }
}

async function api(u, m = 'GET', b) {
  const r = await fetch(u, {
      method: m,
      headers: { 'Content-Type': 'application/json' },
      body: b && JSON.stringify(b),
    }),
    d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Gagal');
  return d;
}

async function load() {
  db = await api('/api/db');
}

async function boot() {
  try {
    user = await api('/api/me');
    await load();
  } catch {
    user = null;
  }
  go();
}

async function doLogin() {
  try {
    user = await api('/api/login', 'POST', { username: $('#u').value.trim(), password: $('#p').value });
    await load();
    location.hash = '#/dashboard';
    go();
  } catch (e) {
    toast(e.message);
  }
}

async function logout() {
  await api('/api/logout', 'POST');
  user = null;
  db = null;
  go();
}

async function delP(id) {
  if (!confirm('Hapus transaksi ini? Tindakan tidak dapat dibatalkan.')) return;
  try {
    await api('/api/purchases/' + id, 'DELETE');
    await load();
    toast('Transaksi dihapus');
    location.hash = '#/pembelian';
  } catch (e) {
    toast(e.message);
  }
}

async function saveP() {
  const d = draft;
  if (!d.loc) return toast('Pilih gedung');
  if (!d.date) return toast('Isi tanggal');
  for (const i of d.items) {
    if (!String(i.name || '').trim()) return toast('Nama barang wajib diisi');
    if (!(Number(i.qty) > 0)) return toast('Qty harus lebih dari 0');
    if (Number(i.price) < 0 || isNaN(i.price)) return toast('Harga tidak boleh negatif');
  }
  try {
    const payload = {
      date: d.date,
      loc: d.loc,
      desc: d.desc,
      items: d.items.map(i => ({
        productId: i.productId || null,
        name: String(i.name).trim(),
        cat: i.cat,
        qty: Number(i.qty),
        unit: i.unit,
        price: Number(i.price),
      })),
    };
    const res = await api(d.eid ? '/api/purchases/' + d.eid : '/api/purchases', d.eid ? 'PUT' : 'POST', payload);
    await load();
    draft = null;
    toast(res.no ? 'Transaksi disimpan: ' + res.no : 'Transaksi disimpan');
    location.hash = '#/pembelian';
  } catch (e) {
    toast(e.message);
  }
}

async function mSave(k, r, id) {
  try {
    await api('/api/master/' + k + (id ? '/' + id : ''), id ? 'PUT' : 'POST', r);
    await load();
    go();
  } catch (e) {
    toast(e.message);
  }
}

function mAdd(k) {
  const r = mAsk(k, {});
  if (r) mSave(k, r);
}

function mEdit(k, i) {
  const r = mAsk(k, db[k][i]);
  if (r) mSave(k, r, db[k][i].id);
}

function mTog(k, i) {
  const o = db[k][i];
  mSave(k, { ...o, on: o.on ? 0 : 1 }, o.id);
}

function xl() {
  location.href = '/api/export/purchases?' + new URLSearchParams({ a: L.a, b: L.b, g: L.g, c: L.c });
}

async function uSave(r, id) {
  try {
    await api('/api/users' + (id ? '/' + id : ''), id ? 'PUT' : 'POST', r);
    await load();
    go();
  } catch (e) {
    toast(e.message);
  }
}

function uAsk(o) {
  const username = o.username || prompt('Username:');
  if (!username) return null;
  const name = prompt('Nama Lengkap:', o.name || '');
  if (!name) return null;
  const email = prompt('Email (opsional):', o.email || '');
  const role = prompt('Role (Super Admin / Admin / Operator / Viewer):', o.role || 'Operator');
  if (!role) return null;
  const password = prompt(
    o.id ? 'Password baru (kosongkan jika tidak diubah):' : 'Password (min. 6 karakter):',
    ''
  );
  if (password === null) return null;
  return { username, name, email, role, password, on: o.on ?? 1 };
}

function uAdd() {
  const r = uAsk({});
  if (r) uSave(r);
}

function uEdit(i) {
  const o = db.users[i],
    r = uAsk(o);
  if (r) uSave(r, o.id);
}

function uTog(i) {
  const o = db.users[i];
  uSave({ ...o, on: o.on ? 0 : 1 }, o.id);
}

window.onhashchange = go;
boot();

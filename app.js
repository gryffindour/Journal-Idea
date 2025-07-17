// app.js

const express = require('express');
const bodyParser = require('body-parser');
const Datastore = require('nedb');
const methodOverride = require('method-override');

const app = express();
const port = 3000;

// Inisialisasi database
const db = new Datastore({ filename: 'database.db', autoload: true });

// Konfigurasi EJS sebagai template engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Untuk PUT dan DELETE dari form HTML

// --- Rute Aplikasi ---

// Halaman Beranda (Membaca semua item - READ)
app.get('/', (req, res) => {
    db.find({}, (err, items) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan saat mengambil data.');
        }
        res.render('index', { items: items });
    });
});

// Halaman Tambah Item (CREATE - Form)
app.get('/add', (req, res) => {
    res.render('add');
});

// Proses Tambah Item (CREATE - Submit Form)
app.post('/items', (req, res) => {
    const newItem = {
        name: req.body.name,
        description: req.body.description
    };
    db.insert(newItem, (err, doc) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan saat menyimpan data.');
        }
        console.log('Item berhasil ditambahkan:', doc);
        res.redirect('/');
    });
});

// Halaman Edit Item (UPDATE - Form)
app.get('/edit/:id', (req, res) => {
    db.findOne({ _id: req.params.id }, (err, item) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan saat mencari data.');
        }
        if (!item) {
            return res.status(404).send('Item tidak ditemukan.');
        }
        res.render('edit', { item: item });
    });
});

// Proses Edit Item (UPDATE - Submit Form)
app.put('/items/:id', (req, res) => {
    const updatedItem = {
        name: req.body.name,
        description: req.body.description
    };
    db.update({ _id: req.params.id }, { $set: updatedItem }, {}, (err, numReplaced) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan saat memperbarui data.');
        }
        console.log('Item berhasil diperbarui:', numReplaced);
        res.redirect('/');
    });
});

// Proses Hapus Item (DELETE)
app.delete('/items/:id', (req, res) => {
    db.remove({ _id: req.params.id }, {}, (err, numRemoved) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan saat menghapus data.');
        }
        console.log('Item berhasil dihapus:', numRemoved);
        res.redirect('/');
    });
});

// Jalankan server
app.listen(port, () => {
    console.log(`Aplikasi CRUD berjalan di http://localhost:${port}`);
});
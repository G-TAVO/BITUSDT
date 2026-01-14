const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(express.static("public"));

/* =========================
   CONFIG ADMIN
========================= */

const ADMIN = {
  email: "admin@bitusdt.com",
  // password: amAdmin1998
  password: "$2b$10$Q6Y9s3H7PpZ1cYv9mL8M9O7z0E1YpQJx1H5E3N9kPq4sQ0sJp" 
};

/* =========================
   BASE DE DATOS LOCAL
========================= */

if (!fs.existsSync("users.json")) {
  fs.writeFileSync("users.json", "[]");
}

/* =========================
   REGISTRO
========================= */

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  let users = JSON.parse(fs.readFileSync("users.json"));

  let exist = users.find(u => u.email === email);
  if (exist) return res.json({ msg: "Correo ya registrado" });

  let hash = await bcrypt.hash(password, 10);

  users.push({
    email,
    password: hash,
    saldo: 0,
    wallet: ""
  });

  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
  res.json({ msg: "Registro exitoso", ok: true });
});

/* =========================
   LOGIN
========================= */

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // ADMIN
  if (email === ADMIN.email) {
    let ok = await bcrypt.compare(password, ADMIN.password);
    if (!ok) return res.json({ msg: "Clave admin incorrecta" });

    return res.json({
      ok: true,
      rol: "admin"
    });
  }

  // USERS
  let users = JSON.parse(fs.readFileSync("users.json"));
  let user = users.find(u => u.email === email);

  if (!user) return res.json({ msg: "Usuario no existe" });

  let ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ msg: "Clave incorrecta" });

  res.json({
    ok: true,
    rol: "user",
    email: user.email,
    saldo: user.saldo,
    wallet: user.wallet
  });
});

/* =========================
   ADMIN VER USUARIOS
========================= */

app.get("/api/admin/users", (req, res) => {
  let users = JSON.parse(fs.readFileSync("users.json"));
  res.json(users);
});

/* =========================
   ADMIN APROBAR INVERSION
========================= */

app.post("/api/admin/aprobar", (req, res) => {
  const { email, monto } = req.body;

  let users = JSON.parse(fs.readFileSync("users.json"));
  let user = users.find(u => u.email === email);

  if (!user) return res.json({ msg: "Usuario no existe" });

  user.saldo += Number(monto);

  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
  res.json({ ok: true, msg: "Inversión aprobada" });
});

/* =========================
   PUERTO
========================= */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor activo en puerto", PORT);
});

app.post("/api/register", async (req, res) => {
  try {
    const { nombre, cedula, telefono, whatsapp, email, password } = req.body;

    // ✅ Validaciones reales
    if (!nombre || !cedula || !telefono || !whatsapp || !email || !password) {
      return res.status(400).json({ ok: false, msg: "Todos los campos son obligatorios" });
    }

    if (password.length < 4) {
      return res.json({ ok: false, msg: "La contraseña debe tener mínimo 4 caracteres" });
    }

    const existeEmail = await User.findOne({ email });
    if (existeEmail) {
      return res.json({ ok: false, msg: "Este correo ya está registrado" });
    }

    const existeCedula = await User.findOne({ cedula });
    if (existeCedula) {
      return res.json({ ok: false, msg: "Esta cédula ya está registrada" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      nombre,
      cedula,
      telefono,
      whatsapp,
      email,
      password: hashed
    });

    res.json({ ok: true, msg: "Registro exitoso 🎉" });

  } catch (err) {
    console.log("ERROR REGISTER:", err);
    res.status(500).json({ ok: false, msg: err.message });
  }
});

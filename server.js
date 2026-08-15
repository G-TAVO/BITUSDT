// ============================================================
// SERVER.JS - JUEGO TAVO DEMO
// ============================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

// ============================================================
// CONFIGURACIÓN
// ============================================================

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log("🚀 Iniciando servidor Juego Tavo Demo...");

// ============================================================
// MONGODB
// ============================================================

// En Render configura:
// MONGO_URI=mongodb+srv://USUARIO:CONTRASEÑA@cluster.mongodb.net/juegoTavo

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ Falta la variable MONGO_URI");
    process.exit(1);
}

// ============================================================
// CONEXIÓN MONGO
// ============================================================

mongoose.connect(MONGO_URI)
    .then(() => {

        console.log("✅ MongoDB conectado");

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log("🚀 Servidor activo en puerto " + PORT);
        });

    })
    .catch(err => {

        console.error("❌ Error MongoDB:", err);

    });

// ============================================================
// CONFIGURACIÓN ADMIN
// ============================================================

const ADMIN_EMAIL =
    process.env.ADMIN_EMAIL || "admin@tavo.com";

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD || "1234";

// ============================================================
// CONFIGURACIÓN DEL JUEGO DEMO
// ============================================================

const SALDO_INICIAL = 0;

const APUESTA_MINIMA = 1000;

const RETIRO_MINIMO = 10000;

const NUMERO_MINIMO = 0;

const NUMERO_MAXIMO = 99;

// ============================================================
// PREMIOS DEMO
// ============================================================

const PREMIOS = {

    1000: 3000,
    2000: 5000,
    3000: 6000,
    4000: 7000,
    5000: 8000,
    6000: 9000,
    7000: 10000,
    8000: 11000,
    9000: 12000,
    10000: 20000

};

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function fecha() {

    return new Date().toLocaleString("es-CO");

}

function numeroAleatorio(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}

function limpiarEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();

}

// ============================================================
// MODELO USUARIO
// ============================================================

const UserSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: true
    },

    cedula: {
        type: String,
        default: ""
    },

    telefono: {
        type: String,
        required: true
    },

    whatsapp: {
        type: String,
        default: ""
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    saldo: {
        type: Number,
        default: SALDO_INICIAL
    },

    nequi: {
        type: String,
        default: ""
    },

    bloqueado: {
        type: Boolean,
        default: false
    },

    fechaRegistro: {
        type: String,
        default: fecha
    }

});

const User = mongoose.model(
    "usuarios_juego",
    UserSchema
);

// ============================================================
// MODELO PARTIDA
// ============================================================

const JuegoSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },

    nombre: {
        type: String,
        default: ""
    },

    numeroElegido: {
        type: Number,
        required: true
    },

    numeroRuleta: {
        type: Number,
        required: true
    },

    apuesta: {
        type: Number,
        required: true
    },

    premio: {
        type: Number,
        default: 0
    },

    resultado: {
        type: String,
        enum: [
            "gano",
            "perdio"
        ]
    },

    saldoAntes: {
        type: Number,
        default: 0
    },

    saldoDespues: {
        type: Number,
        default: 0
    },

    fecha: {
        type: String,
        default: fecha
    }

});

const Juego = mongoose.model(
    "partidas_juego",
    JuegoSchema
);

// ============================================================
// MODELO MOVIMIENTOS
// ============================================================

const MovimientoSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },

    tipo: {
        type: String,
        required: true
    },

    monto: {
        type: Number,
        required: true
    },

    saldoAntes: {
        type: Number,
        default: 0
    },

    saldoDespues: {
        type: Number,
        default: 0
    },

    detalle: {
        type: String,
        default: ""
    },

    fecha: {
        type: String,
        default: fecha
    }

});

const Movimiento = mongoose.model(
    "movimientos_juego",
    MovimientoSchema
);

// ============================================================
// MODELO RETIROS
// ============================================================

const RetiroSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },

    nombre: {
        type: String,
        default: ""
    },

    nequi: {
        type: String,
        default: ""
    },

    monto: {
        type: Number,
        required: true
    },

    estado: {
        type: String,
        default: "pendiente"
    },

    fecha: {
        type: String,
        default: fecha
    }

});

const Retiro = mongoose.model(
    "retiros_demo",
    RetiroSchema
);

// ============================================================
// MODELO RECARGAS
// ============================================================

const RecargaSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },

    nombre: {
        type: String,
        default: ""
    },

    monto: {
        type: Number,
        required: true
    },

    tipo: {
        type: String,
        default: "recarga_demo"
    },

    fecha: {
        type: String,
        default: fecha
    }

});

const Recarga = mongoose.model(
    "recargas_demo",
    RecargaSchema
);

// ============================================================
// REGISTRO
// ============================================================

app.post("/api/register", async (req, res) => {

    try {

        const {
            nombre,
            cedula,
            telefono,
            whatsapp,
            email,
            password
        } = req.body;

        if (
            !nombre ||
            !telefono ||
            !email ||
            !password
        ) {

            return res.json({

                ok: false,
                msg: "Faltan datos obligatorios"

            });

        }

        const emailLimpio =
            limpiarEmail(email);

        const existe =
            await User.findOne({
                email: emailLimpio
            });

        if (existe) {

            return res.json({

                ok: false,
                msg: "Este correo ya está registrado"

            });

        }

        const hash =
            await bcrypt.hash(
                password,
                10
            );

        const usuario =
            await User.create({

                nombre: nombre.trim(),

                cedula: cedula || "",

                telefono: telefono.trim(),

                whatsapp: whatsapp || "",

                email: emailLimpio,

                password: hash,

                saldo: SALDO_INICIAL

            });

        res.json({

            ok: true,

            msg: "Cuenta creada correctamente",

            usuario: {

                nombre: usuario.nombre,

                email: usuario.email,

                saldo: usuario.saldo,

                rol: "user"

            }

        });

    } catch (error) {

        console.error(
            "❌ Error registro:",
            error
        );

        res.json({

            ok: false,

            msg: "Error al crear la cuenta"

        });

    }

});

// ============================================================
// LOGIN
// ============================================================

app.post("/api/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const emailLimpio =
            limpiarEmail(email);

        // ====================================================
        // ADMIN
        // ====================================================

        if (
            emailLimpio ===
            ADMIN_EMAIL.toLowerCase() &&
            password === ADMIN_PASSWORD
        ) {

            return res.json({

                ok: true,

                usuario: {

                    nombre: "Administrador",

                    email: ADMIN_EMAIL,

                    rol: "admin"

                }

            });

        }

        // ====================================================
        // USUARIO
        // ====================================================

        const user =
            await User.findOne({
                email: emailLimpio
            });

        if (!user) {

            return res.json({

                ok: false,

                msg: "Usuario no encontrado"

            });

        }

        if (user.bloqueado) {

            return res.json({

                ok: false,

                msg: "Tu cuenta está bloqueada"

            });

        }

        const correcto =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!correcto) {

            return res.json({

                ok: false,

                msg: "Contraseña incorrecta"

            });

        }

        res.json({

            ok: true,

            usuario: {

                nombre: user.nombre,

                email: user.email,

                telefono: user.telefono,

                whatsapp: user.whatsapp,

                nequi: user.nequi,

                saldo: Number(user.saldo || 0),

                rol: "user"

            }

        });

    } catch (error) {

        console.error(
            "❌ Error login:",
            error
        );

        res.json({

            ok: false,

            msg: "Error al iniciar sesión"

        });

    }

});

// ============================================================
// PERFIL
// ============================================================

app.get(
    "/api/perfil/:email",
    async (req, res) => {

        try {

            const email =
                limpiarEmail(
                    req.params.email
                );

            const user =
                await User.findOne({
                    email
                }).select("-password");

            if (!user) {

                return res.json({

                    ok: false,

                    msg:
                        "Usuario no encontrado"

                });

            }

            res.json({

                ok: true,

                usuario: user

            });

        } catch {

            res.json({

                ok: false,

                msg:
                    "Error obteniendo perfil"

            });

        }

    }
);

// ============================================================
// GUARDAR NEQUI
// ============================================================

app.post(
    "/api/nequi",
    async (req, res) => {

        try {

            const {
                email,
                nequi
            } = req.body;

            if (!email || !nequi) {

                return res.json({

                    ok: false,

                    msg:
                        "Número Nequi requerido"

                });

            }

            await User.updateOne(

                {
                    email:
                        limpiarEmail(email)
                },

                {
                    nequi:
                        String(nequi).trim()
                }

            );

            res.json({

                ok: true,

                msg:
                    "Número Nequi guardado"

            });

        } catch {

            res.json({

                ok: false,

                msg:
                    "No se pudo guardar el Nequi"

            });

        }

    }
);

// ============================================================
// PREMIOS
// ============================================================

app.get(
    "/api/premios",
    (req, res) => {

        res.json({

            ok: true,

            apuestaMinima:
                APUESTA_MINIMA,

            retiroMinimo:
                RETIRO_MINIMO,

            premios:
                PREMIOS

        });

    }
);

// ============================================================
// JUGAR
// ============================================================

app.post(
    "/api/jugar",
    async (req, res) => {

        try {

            const {
                email,
                numero,
                apuesta
            } = req.body;

            const emailLimpio =
                limpiarEmail(email);

            const numeroElegido =
                Number(numero);

            const valorApuesta =
                Number(apuesta);

            // =================================================
            // VALIDAR USUARIO
            // =================================================

            if (!emailLimpio) {

                return res.json({

                    ok: false,

                    msg:
                        "Usuario no válido"

                });

            }

            // =================================================
            // VALIDAR NÚMERO
            // =================================================

            if (
                !Number.isInteger(
                    numeroElegido
                ) ||
                numeroElegido <
                    NUMERO_MINIMO ||
                numeroElegido >
                    NUMERO_MAXIMO
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "El número debe estar entre 0 y 100"

                });

            }

            // =================================================
            // VALIDAR APUESTA
            // =================================================

            if (
                !Number.isInteger(
                    valorApuesta
                ) ||
                valorApuesta <
                    APUESTA_MINIMA
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "La apuesta mínima es de $1.000 demo"

                });

            }

            // =================================================
            // VALIDAR TABLA DE PREMIOS
            // =================================================

            if (
                !Object.prototype.hasOwnProperty.call(
                    PREMIOS,
                    valorApuesta
                )
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "Esta cantidad de apuesta no está disponible"

                });

            }

            // =================================================
            // BUSCAR USUARIO
            // =================================================

            const user =
                await User.findOne({
                    email: emailLimpio
                });

            if (!user) {

                return res.json({

                    ok: false,

                    msg:
                        "Usuario no encontrado"

                });

            }

            if (user.bloqueado) {

                return res.json({

                    ok: false,

                    msg:
                        "Usuario bloqueado"

                });

            }

            // =================================================
            // SALDO ACTUAL
            // =================================================

            const saldoAntes =
                Number(user.saldo || 0);

            // =================================================
            // COMPROBAR SALDO
            // =================================================

            if (
                saldoAntes <
                valorApuesta
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "Saldo demo insuficiente",

                    saldo:
                        saldoAntes

                });

            }

            // =================================================
            // GENERAR NÚMERO
            // =================================================

            const numeroRuleta =
                numeroAleatorio(
                    NUMERO_MINIMO,
                    NUMERO_MAXIMO
                );

            // =================================================
            // DETERMINAR RESULTADO
            // =================================================

            const gano =
                numeroRuleta ===
                numeroElegido;

            let premio = 0;

            if (gano) {

                premio =
                    Number(
                        PREMIOS[
                            valorApuesta
                        ]
                    );

            }

            // =================================================
            // CALCULAR SALDO
            // =================================================

            // SIEMPRE se descuenta primero
            // la apuesta.

            let saldoDespues =
                saldoAntes -
                valorApuesta;

            // Si gana se suma el premio.

            if (gano) {

                saldoDespues += premio;

            }

            // Evitar números negativos.

            if (saldoDespues < 0) {

                saldoDespues = 0;

            }

            // =================================================
            // GUARDAR SALDO
            // =================================================

            user.saldo =
                saldoDespues;

            await user.save();

            // =================================================
            // GUARDAR PARTIDA
            // =================================================

            await Juego.create({

                email:
                    user.email,

                nombre:
                    user.nombre,

                numeroElegido,

                numeroRuleta,

                apuesta:
                    valorApuesta,

                premio,

                resultado:
                    gano
                        ? "gano"
                        : "perdio",

                saldoAntes,

                saldoDespues,

                fecha:
                    fecha()

            });

            // =================================================
            // GUARDAR MOVIMIENTO
            // =================================================

            await Movimiento.create({

                email:
                    user.email,

                tipo:
                    gano
                        ? "premio_demo"
                        : "apuesta_demo",

                monto:
                    gano
                        ? premio
                        : valorApuesta,

                saldoAntes,

                saldoDespues,

                detalle:
                    gano
                        ?
                        `Ganó premio demo. Número elegido: ${numeroElegido}. Ruleta: ${numeroRuleta}. Apuesta: $${valorApuesta}. Premio: $${premio}.`
                        :
                        `Perdió apuesta demo. Número elegido: ${numeroElegido}. Ruleta: ${numeroRuleta}. Apuesta: $${valorApuesta}.`,

                fecha:
                    fecha()

            });

            // =================================================
            // RESPUESTA
            // =================================================

            res.json({

                ok: true,

                resultado:
                    gano
                        ? "gano"
                        : "perdio",

                numeroElegido,

                numeroRuleta,

                apuesta:
                    valorApuesta,

                premio,

                saldoAntes,

                saldo:
                    saldoDespues,

                saldoDespues,

                mensaje:
                    gano
                        ?
                        `🎉 ¡Ganaste $${premio.toLocaleString("es-CO")} demo!`
                        :
                        `😔 No ganaste esta vez. Salió el ${numeroRuleta}. Se descontaron $${valorApuesta.toLocaleString("es-CO")} demo.`

            });

        } catch (error) {

            console.error(
                "❌ Error jugando:",
                error
            );

            res.json({

                ok: false,

                msg:
                    "Error procesando la partida"

            });

        }

    }
);

// ============================================================
// HISTORIAL
// ============================================================

app.get(
    "/api/historial/:email",
    async (req, res) => {

        try {

            const email =
                limpiarEmail(
                    req.params.email
                );

            const data =
                await Juego.find({
                    email
                })
                .sort({
                    _id: -1
                })
                .limit(100);

            res.json({

                ok: true,

                historial:
                    data

            });

        } catch {

            res.json({

                ok: false,

                historial: []

            });

        }

    }
);

// ============================================================
// MOVIMIENTOS
// ============================================================

app.get(
    "/api/movimientos/:email",
    async (req, res) => {

        try {

            const email =
                limpiarEmail(
                    req.params.email
                );

            const data =
                await Movimiento.find({
                    email
                })
                .sort({
                    _id: -1
                })
                .limit(100);

            res.json({

                ok: true,

                movimientos:
                    data

            });

        } catch {

            res.json({

                ok: false,

                movimientos: []

            });

        }

    }
);

// ============================================================
// SOLICITAR RETIRO
// ============================================================

app.post(
    "/api/solicitar-retiro",
    async (req, res) => {

        try {

            const {
                email,
                monto,
                nequi
            } = req.body;

            const emailLimpio =
                limpiarEmail(email);

            const valor =
                Number(monto);

            const user =
                await User.findOne({
                    email:
                        emailLimpio
                });

            if (!user) {

                return res.json({

                    ok: false,

                    msg:
                        "Usuario no encontrado"

                });

            }

            if (user.bloqueado) {

                return res.json({

                    ok: false,

                    msg:
                        "Usuario bloqueado"

                });

            }

            if (
                !Number.isInteger(valor)
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "Monto inválido"

                });

            }

            if (
                valor <
                RETIRO_MINIMO
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "El retiro mínimo es de $10.000 demo"

                });

            }

            if (
                valor >
                Number(user.saldo || 0)
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "No tienes suficiente saldo demo"

                });

            }

            const numeroNequi =
                nequi ||
                user.nequi;

            if (!numeroNequi) {

                return res.json({

                    ok: false,

                    msg:
                        "Debes registrar tu número Nequi demo"

                });

            }

            const pendiente =
                await Retiro.findOne({

                    email:
                        emailLimpio,

                    estado:
                        "pendiente"

                });

            if (pendiente) {

                return res.json({

                    ok: false,

                    msg:
                        "Ya tienes un retiro demo pendiente"

                });

            }

            // =================================================
            // DESCONTAR SALDO
            // =================================================

            const saldoAntes =
                Number(user.saldo || 0);

            user.saldo =
                saldoAntes -
                valor;

            await user.save();

            // =================================================
            // CREAR RETIRO
            // =================================================

            await Retiro.create({

                email:
                    user.email,

                nombre:
                    user.nombre,

                nequi:
                    numeroNequi,

                monto:
                    valor,

                estado:
                    "pendiente",

                fecha:
                    fecha()

            });

            // =================================================
            // MOVIMIENTO
            // =================================================

            await Movimiento.create({

                email:
                    user.email,

                tipo:
                    "retiro_demo",

                monto:
                    valor,

                saldoAntes,

                saldoDespues:
                    user.saldo,

                detalle:
                    "Solicitud de retiro demo enviada",

                fecha:
                    fecha()

            });

            res.json({

                ok: true,

                msg:
                    "Solicitud de retiro demo enviada",

                saldo:
                    user.saldo

            });

        } catch (error) {

            console.error(
                "❌ Error retiro:",
                error
            );

            res.json({

                ok: false,

                msg:
                    "Error procesando retiro"

            });

        }

    }
);

// ============================================================
// MIS RETIROS
// ============================================================

app.get(
    "/api/mis-retiros/:email",
    async (req, res) => {

        try {

            const email =
                limpiarEmail(
                    req.params.email
                );

            const retiros =
                await Retiro.find({
                    email
                })
                .sort({
                    _id: -1
                })
                .limit(50);

            res.json({

                ok: true,

                retiros

            });

        } catch {

            res.json({

                ok: false,

                retiros: []

            });

        }

    }
);

// ============================================================
// ADMIN - VER USUARIOS
// ============================================================

app.get(
    "/api/admin/usuarios",
    async (req, res) => {

        try {

            const usuarios =
                await User.find(
                    {},
                    {
                        password: 0
                    }
                )
                .sort({
                    _id: -1
                });

            res.json({

                ok: true,

                usuarios

            });

        } catch {

            res.json({

                ok: false,

                usuarios: []

            });

        }

    }
);

// ============================================================
// ADMIN - EDITAR SALDO DIRECTAMENTE
// ============================================================

app.post(
    "/api/admin/editar-saldo",
    async (req, res) => {

        try {

            const {
                email,
                saldo
            } = req.body;

            const emailLimpio =
                limpiarEmail(email);

            const nuevoSaldo =
                Number(saldo);

            if (!emailLimpio) {

                return res.json({

                    ok: false,

                    msg:
                        "Correo requerido"

                });

            }

            if (
                !Number.isFinite(
                    nuevoSaldo
                ) ||
                nuevoSaldo < 0
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "Saldo inválido"

                });

            }

            const user =
                await User.findOne({
                    email:
                        emailLimpio
                });

            if (!user) {

                return res.json({

                    ok: false,

                    msg:
                        "Usuario no encontrado"

                });

            }

            const saldoAntes =
                Number(user.saldo || 0);

            user.saldo =
                Math.floor(
                    nuevoSaldo
                );

            await user.save();

            await Movimiento.create({

                email:
                    user.email,

                tipo:
                    "edicion_saldo_admin",

                monto:
                    Math.abs(
                        user.saldo -
                        saldoAntes
                    ),

                saldoAntes,

                saldoDespues:
                    user.saldo,

                detalle:
                    `Administrador cambió el saldo demo de $${saldoAntes} a $${user.saldo}.`,

                fecha:
                    fecha()

            });

            res.json({

                ok: true,

                msg:
                    "Saldo actualizado correctamente",

                saldo:
                    user.saldo

            });

        } catch (error) {

            console.error(
                "❌ Error editando saldo:",
                error
            );

            res.json({

                ok: false,

                msg:
                    "Error editando saldo"

            });

        }

    }
);

// ============================================================
// ADMIN - RUTA ALTERNATIVA PARA EDITAR SALDO
// ============================================================

app.post(
    "/api/admin/saldo",
    async (req, res) => {

        try {

            const {
                email,
                saldo
            } = req.body;

            const emailLimpio =
                limpiarEmail(email);

            const nuevoSaldo =
                Number(saldo);

            if (
                !emailLimpio ||
                !Number.isFinite(
                    nuevoSaldo
                ) ||
                nuevoSaldo < 0
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "Datos inválidos"

                });

            }

            const user =
                await User.findOne({
                    email:
                        emailLimpio
                });

            if (!user) {

                return res.json({

                    ok: false,

                    msg:
                        "Usuario no encontrado"

                });

            }

            const saldoAntes =
                Number(user.saldo || 0);

            user.saldo =
                Math.floor(
                    nuevoSaldo
                );

            await user.save();

            await Movimiento.create({

                email:
                    user.email,

                tipo:
                    "edicion_saldo_admin",

                monto:
                    Math.abs(
                        user.saldo -
                        saldoAntes
                    ),

                saldoAntes,

                saldoDespues:
                    user.saldo,

                detalle:
                    `Administrador estableció el saldo demo en $${user.saldo}.`,

                fecha:
                    fecha()

            });

            res.json({

                ok: true,

                msg:
                    "Saldo actualizado correctamente",

                saldo:
                    user.saldo

            });

        } catch (error) {

            console.error(
                "❌ Error actualizando saldo:",
                error
            );

            res.json({

                ok: false,

                msg:
                    "Error actualizando saldo"

            });

        }

    }
);

// ============================================================
// ADMIN - RECARGAR SALDO
// ============================================================

app.post(
    "/api/admin/recargar",
    async (req, res) => {

        try {

            const {
                email,
                monto
            } = req.body;

            const valor =
                Number(monto);

            if (
                !Number.isInteger(valor) ||
                valor <= 0
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "Monto de recarga inválido"

                });

            }

            const user =
                await User.findOne({

                    email:
                        limpiarEmail(email)

                });

            if (!user) {

                return res.json({

                    ok: false,

                    msg:
                        "Usuario no encontrado"

                });

            }

            const saldoAntes =
                Number(user.saldo || 0);

            user.saldo =
                saldoAntes +
                valor;

            await user.save();

            await Recarga.create({

                email:
                    user.email,

                nombre:
                    user.nombre,

                monto:
                    valor,

                tipo:
                    "recarga_demo_admin",

                fecha:
                    fecha()

            });

            await Movimiento.create({

                email:
                    user.email,

                tipo:
                    "recarga_demo",

                monto:
                    valor,

                saldoAntes,

                saldoDespues:
                    user.saldo,

                detalle:
                    "Administrador agregó saldo demo",

                fecha:
                    fecha()

            });

            res.json({

                ok: true,

                msg:
                    "Saldo demo agregado correctamente",

                saldo:
                    user.saldo

            });

        } catch (error) {

            console.error(
                "❌ Error recarga:",
                error
            );

            res.json({

                ok: false,

                msg:
                    "Error agregando saldo demo"

            });

        }

    }
);

// ============================================================
// ADMIN - QUITAR SALDO
// ============================================================

app.post(
    "/api/admin/quitar-saldo",
    async (req, res) => {

        try {

            const {
                email,
                monto
            } = req.body;

            const valor =
                Number(monto);

            if (
                !Number.isInteger(valor) ||
                valor <= 0
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "Monto inválido"

                });

            }

            const user =
                await User.findOne({

                    email:
                        limpiarEmail(email)

                });

            if (!user) {

                return res.json({

                    ok: false,

                    msg:
                        "Usuario no encontrado"

                });

            }

            const saldoAntes =
                Number(user.saldo || 0);

            if (
                valor >
                saldoAntes
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "El usuario no tiene ese saldo demo"

                });

            }

            user.saldo =
                saldoAntes -
                valor;

            await user.save();

            await Movimiento.create({

                email:
                    user.email,

                tipo:
                    "ajuste_admin",

                monto:
                    valor,

                saldoAntes,

                saldoDespues:
                    user.saldo,

                detalle:
                    "Administrador retiró saldo demo",

                fecha:
                    fecha()

            });

            res.json({

                ok: true,

                msg:
                    "Saldo demo descontado",

                saldo:
                    user.saldo

            });

        } catch (error) {

            console.error(
                "❌ Error descontando saldo:",
                error
            );

            res.json({

                ok: false,

                msg:
                    "Error descontando saldo"

            });

        }

    }
);

// ============================================================
// ADMIN - BLOQUEAR
// ============================================================

app.post(
    "/api/admin/bloquear",
    async (req, res) => {

        try {

            await User.updateOne(

                {
                    email:
                        limpiarEmail(
                            req.body.email
                        )
                },

                {
                    bloqueado:
                        true
                }

            );

            res.json({

                ok: true,

                msg:
                    "Usuario bloqueado"

            });

        } catch {

            res.json({

                ok: false,

                msg:
                    "Error bloqueando usuario"

            });

        }

    }
);

// ============================================================
// ADMIN - DESBLOQUEAR
// ============================================================

app.post(
    "/api/admin/desbloquear",
    async (req, res) => {

        try {

            await User.updateOne(

                {
                    email:
                        limpiarEmail(
                            req.body.email
                        )
                },

                {
                    bloqueado:
                        false
                }

            );

            res.json({

                ok: true,

                msg:
                    "Usuario desbloqueado"

            });

        } catch {

            res.json({

                ok: false,

                msg:
                    "Error desbloqueando usuario"

            });

        }

    }
);

// ============================================================
// ADMIN - VER RETIROS
// ============================================================

app.get(
    "/api/admin/retiros",
    async (req, res) => {

        try {

            const retiros =
                await Retiro.find()
                .sort({
                    _id: -1
                });

            res.json({

                ok: true,

                retiros

            });

        } catch {

            res.json({

                ok: false,

                retiros: []

            });

        }

    }
);

// ============================================================
// ADMIN - APROBAR RETIRO
// ============================================================

app.post(
    "/api/admin/aprobar-retiro",
    async (req, res) => {

        try {

            const {
                id
            } = req.body;

            const retiro =
                await Retiro.findById(id);

            if (!retiro) {

                return res.json({

                    ok: false,

                    msg:
                        "Retiro no encontrado"

                });

            }

            if (
                retiro.estado !==
                "pendiente"
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "Este retiro ya fue procesado"

                });

            }

            retiro.estado =
                "aprobado";

            await retiro.save();

            await Movimiento.create({

                email:
                    retiro.email,

                tipo:
                    "retiro_aprobado_demo",

                monto:
                    retiro.monto,

                saldoAntes:
                    0,

                saldoDespues:
                    0,

                detalle:
                    "Retiro demo aprobado por administrador",

                fecha:
                    fecha()

            });

            res.json({

                ok: true,

                msg:
                    "Retiro demo aprobado"

            });

        } catch (error) {

            console.error(
                "❌ Error aprobando retiro:",
                error
            );

            res.json({

                ok: false,

                msg:
                    "Error aprobando retiro"

            });

        }

    }
);

// ============================================================
// ADMIN - RECHAZAR RETIRO
// ============================================================

app.post(
    "/api/admin/rechazar-retiro",
    async (req, res) => {

        try {

            const {
                id
            } = req.body;

            const retiro =
                await Retiro.findById(id);

            if (!retiro) {

                return res.json({

                    ok: false,

                    msg:
                        "Retiro no encontrado"

                });

            }

            if (
                retiro.estado !==
                "pendiente"
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "Este retiro ya fue procesado"

                });

            }

            const user =
                await User.findOne({

                    email:
                        retiro.email

                });

            if (user) {

                const saldoAntes =
                    Number(user.saldo || 0);

                user.saldo =
                    saldoAntes +
                    Number(retiro.monto);

                await user.save();

                await Movimiento.create({

                    email:
                        user.email,

                    tipo:
                        "retiro_rechazado_demo",

                    monto:
                        retiro.monto,

                    saldoAntes,

                    saldoDespues:
                        user.saldo,

                    detalle:
                        "Retiro demo rechazado. Saldo demo devuelto.",

                    fecha:
                        fecha()

                });

            }

            retiro.estado =
                "rechazado";

            await retiro.save();

            res.json({

                ok: true,

                msg:
                    "Retiro rechazado y saldo demo devuelto"

            });

        } catch (error) {

            console.error(
                "❌ Error rechazando retiro:",
                error
            );

            res.json({

                ok: false,

                msg:
                    "Error rechazando retiro"

            });

        }

    }
);

// ============================================================
// ADMIN - TODAS LAS PARTIDAS
// ============================================================

app.get(
    "/api/admin/partidas",
    async (req, res) => {

        try {

            const partidas =
                await Juego.find()
                .sort({
                    _id: -1
                })
                .limit(500);

            res.json({

                ok: true,

                partidas

            });

        } catch {

            res.json({

                ok: false,

                partidas: []

            });

        }

    }
);

// ============================================================
// ADMIN - RECARGAS
// ============================================================

app.get(
    "/api/admin/recargas",
    async (req, res) => {

        try {

            const recargas =
                await Recarga.find()
                .sort({
                    _id: -1
                })
                .limit(500);

            res.json({

                ok: true,

                recargas

            });

        } catch {

            res.json({

                ok: false,

                recargas: []

            });

        }

    }
);

// ============================================================
// ADMIN - MOVIMIENTOS
// ============================================================

app.get(
    "/api/admin/movimientos",
    async (req, res) => {

        try {

            const movimientos =
                await Movimiento.find()
                .sort({
                    _id: -1
                })
                .limit(500);

            res.json({

                ok: true,

                movimientos

            });

        } catch {

            res.json({

                ok: false,

                movimientos: []

            });

        }

    }
);

// ============================================================
// ADMIN - ESTADÍSTICAS
// ============================================================

app.get(
    "/api/admin/estadisticas",
    async (req, res) => {

        try {

            const usuarios =
                await User.countDocuments();

            const partidas =
                await Juego.countDocuments();

            const retirosPendientes =
                await Retiro.countDocuments({

                    estado:
                        "pendiente"

                });

            const partidasGanadas =
                await Juego.countDocuments({

                    resultado:
                        "gano"

                });

            const partidasPerdidas =
                await Juego.countDocuments({

                    resultado:
                        "perdio"

                });

            const saldoUsuarios =
                await User.aggregate([

                    {

                        $group: {

                            _id: null,

                            total: {

                                $sum:
                                    "$saldo"

                            }

                        }

                    }

                ]);

            const dineroDemoTotal =
                saldoUsuarios.length
                    ? saldoUsuarios[0].total
                    : 0;

            res.json({

                ok: true,

                estadisticas: {

                    usuarios,

                    partidas,

                    partidasGanadas,

                    partidasPerdidas,

                    retirosPendientes,

                    dineroDemoTotal

                }

            });

        } catch (error) {

            console.error(
                "❌ Error estadísticas:",
                error
            );

            res.json({

                ok: false,

                msg:
                    "No se pudieron obtener estadísticas"

            });

        }

    }
);

// ============================================================
// RUTA PRINCIPAL
// ============================================================

app.get(
    "/",
    (req, res) => {

        res.send(`

            <html>

            <head>

                <title>
                    Juego Tavo Demo
                </title>

            </head>

            <body style="
                font-family:Arial;
                background:#0f172a;
                color:white;
                text-align:center;
                padding:50px;
            ">

                <h1>
                    🎰 Juego Tavo Demo
                </h1>

                <p>
                    Servidor funcionando correctamente 🚀
                </p>

                <p>
                    🪙 Sistema de dinero ficticio / demo
                </p>

            </body>

            </html>

        `);

    }
);

// ============================================================
// 404
// ============================================================

app.use(
    (req, res) => {

        res.status(404).json({

            ok: false,

            msg:
                "Ruta no encontrada"

        });

    }
);

// ============================================================
// ERROR GENERAL
// ============================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "❌ Error general:",
            err
        );

        res.status(500).json({

            ok: false,

            msg:
                "Error interno del servidor"

        });

    }
);

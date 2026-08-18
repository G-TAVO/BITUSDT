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

console.log("🚀 Iniciando Juego Tavo Demo...");

// ============================================================
// CONFIGURACIÓN GENERAL
// ============================================================

const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI;

const ADMIN_EMAIL =
    process.env.ADMIN_EMAIL || "admin@tavo.com";

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD || "1234";

// ============================================================
// REGLAS DEL JUEGO
// ============================================================

const SALDO_INICIAL = 0;

const APUESTA_MINIMA = 1000;

const RETIRO_MINIMO = 10000;

// IMPORTANTE: 00 hasta 99
const NUMERO_MINIMO = 0;
const NUMERO_MAXIMO = 99;

// ============================================================
// PREMIOS DEMO
// ============================================================

// MODIFICADO:
// Premios nuevos para la demo.
// Cada premio equivale a 5 veces la apuesta.

const PREMIOS = {

    1000: 5000,
    2000: 8000,
    3000: 11000,
    4000: 14000,
    5000: 17000,
    6000: 20000,
    7000: 23000,
    8000: 26000,
    9000: 29000,
    10000: 35000

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

function numeroVisual(numero) {

    return String(numero).padStart(2, "0");

}

// ============================================================
// MONGODB
// ============================================================

if (!MONGO_URI) {

    console.error(
        "❌ ERROR: Falta la variable MONGO_URI en Render."
    );

    process.exit(1);

}

// ============================================================
// MODELO USUARIO
// ============================================================

const UserSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: true,
        trim: true
    },

    cedula: {
        type: String,
        default: ""
    },

    telefono: {
        type: String,
        required: true,
        trim: true
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
        enum: [
            "pendiente",
            "aprobado",
            "rechazado"
        ],
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

    motivo: {
        type: String,
        default: ""
    },

    tipo: {
        type: String,
        default: "recarga_demo_admin"
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
// LOGIN
// ============================================================

app.post("/api/login", async (req, res) => {

    try {

        const email =
            limpiarEmail(req.body.email);

        const password =
            String(req.body.password || "");

        // ADMIN

        if (
            email ===
            limpiarEmail(ADMIN_EMAIL) &&
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

        // USUARIO

        const user =
            await User.findOne({
                email
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

                nombre:
                    String(nombre).trim(),

                cedula:
                    String(cedula || "").trim(),

                telefono:
                    String(telefono).trim(),

                whatsapp:
                    String(whatsapp || "").trim(),

                email:
                    emailLimpio,

                password:
                    hash,

                saldo:
                    SALDO_INICIAL

            });

        res.json({

            ok: true,

            msg: "Cuenta creada correctamente",

            usuario: {

                nombre:
                    usuario.nombre,

                email:
                    usuario.email,

                saldo:
                    usuario.saldo,

                rol:
                    "user"

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

            const usuario =
                await User.findOne({
                    email
                }).select("-password");

            if (!usuario) {

                return res.json({

                    ok: false,

                    msg: "Usuario no encontrado"

                });

            }

            res.json({

                ok: true,

                usuario

            });

        } catch (error) {

            console.error(error);

            res.json({

                ok: false,

                msg: "Error obteniendo perfil"

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

            const email =
                limpiarEmail(
                    req.body.email
                );

            const nequi =
                String(
                    req.body.nequi || ""
                ).trim();

            if (!email || !nequi) {

                return res.json({

                    ok: false,

                    msg: "Número Nequi requerido"

                });

            }

            const user =
                await User.findOne({
                    email
                });

            if (!user) {

                return res.json({

                    ok: false,

                    msg: "Usuario no encontrado"

                });

            }

            user.nequi = nequi;

            await user.save();

            res.json({

                ok: true,

                msg: "Número Nequi guardado"

            });

        } catch (error) {

            console.error(error);

            res.json({

                ok: false,

                msg: "No se pudo guardar el Nequi"

            });

        }

    }
);

// ============================================================
// INFORMACIÓN DEL JUEGO
// ============================================================

app.get(
    "/api/premios",
    (req, res) => {

        res.json({

            ok: true,

            numeroMinimo:
                NUMERO_MINIMO,

            numeroMaximo:
                NUMERO_MAXIMO,

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

            const email =
                limpiarEmail(
                    req.body.email
                );

            const numero =
                Number(req.body.numero);

            const apuesta =
                Number(req.body.apuesta);

            // VALIDAR EMAIL

            if (!email) {

                return res.json({

                    ok: false,

                    msg: "Usuario no válido"

                });

            }

            // VALIDAR NÚMERO

            if (
                !Number.isInteger(numero) ||
                numero < NUMERO_MINIMO ||
                numero > NUMERO_MAXIMO
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "El número debe estar entre 00 y 99"

                });

            }

            // VALIDAR APUESTA

            if (
                !Number.isInteger(apuesta) ||
                apuesta < APUESTA_MINIMA
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "La apuesta mínima es de $1.000 demo"

                });

            }

            // VALIDAR APUESTA DISPONIBLE

            if (
                !Object.prototype.hasOwnProperty.call(
                    PREMIOS,
                    apuesta
                )
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "Esta cantidad de apuesta no está disponible"

                });

            }

            // BUSCAR USUARIO

            const user =
                await User.findOne({
                    email
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

                    msg: "Usuario bloqueado"

                });

            }

            // SALDO

            const saldoAntes =
                Number(user.saldo || 0);

            if (saldoAntes < apuesta) {

                return res.json({

                    ok: false,

                    msg: "Saldo demo insuficiente",

                    saldo: saldoAntes

                });

            }

            // ==================================================
            // PROBABILIDAD DE GANAR
            // ==================================================

            // 5% de probabilidad de ganar.
            // Aproximadamente 1 de cada 20 partidas.

            const PROBABILIDAD_GANAR = 0.05;

            const ganaPorProbabilidad =
                Math.random() < PROBABILIDAD_GANAR;


            // ==================================================
            // NÚMERO DE LA RULETA
            // ==================================================

            let numeroRuleta;


            if (ganaPorProbabilidad) {

                // En una partida ganadora,
                // el número coincide con el elegido.

                numeroRuleta =
                    numero;

            } else {

                // En una partida perdida,
                // generamos un número diferente.

                do {

                    numeroRuleta =
                        numeroAleatorio(
                            NUMERO_MINIMO,
                            NUMERO_MAXIMO
                        );

                } while (
                    numeroRuleta === numero
                );

            }


            // ==================================================
            // RESULTADO
            // ==================================================

            const gano =
                numeroRuleta === numero;

            let premio = 0;


            if (gano) {

                premio =
                    Number(
                        PREMIOS[apuesta]
                    );

            }


            // ==================================================
            // SALDO FINAL
            // ==================================================

            let saldoDespues =
                saldoAntes - apuesta;

            if (gano) {

                saldoDespues += premio;

            }

            if (saldoDespues < 0) {

                saldoDespues = 0;

            }


            // ==================================================
            // ACTUALIZAR USUARIO
            // ==================================================

            user.saldo =
                saldoDespues;

            await user.save();


            // ==================================================
            // GUARDAR PARTIDA
            // ==================================================

            await Juego.create({

                email:
                    user.email,

                nombre:
                    user.nombre,

                numeroElegido:
                    numero,

                numeroRuleta:
                    numeroRuleta,

                apuesta:
                    apuesta,

                premio:
                    premio,

                resultado:
                    gano
                        ? "gano"
                        : "perdio",

                saldoAntes:
                    saldoAntes,

                saldoDespues:
                    saldoDespues,

                fecha:
                    fecha()

            });


            // ==================================================
            // GUARDAR MOVIMIENTO
            // ==================================================

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
                        : apuesta,

                saldoAntes:
                    saldoAntes,

                saldoDespues:
                    saldoDespues,

                detalle:
                    gano
                        ?
                        `Ganó premio demo. Número elegido ${numeroVisual(numero)}. Salió ${numeroVisual(numeroRuleta)}.`
                        :
                        `Perdió apuesta demo. Número elegido ${numeroVisual(numero)}. Salió ${numeroVisual(numeroRuleta)}.`,

                fecha:
                    fecha()

            });


            // ==================================================
            // RESPUESTA
            // ==================================================

            res.json({

                ok: true,

                resultado:
                    gano
                        ? "gano"
                        : "perdio",

                numeroElegido:
                    numero,

                numeroElegidoVisual:
                    numeroVisual(numero),

                numeroRuleta:
                    numeroRuleta,

                numeroRuletaVisual:
                    numeroVisual(numeroRuleta),

                apuesta:
                    apuesta,

                premio:
                    premio,

                saldoAntes:
                    saldoAntes,

                saldo:
                    saldoDespues,

                saldoDespues:
                    saldoDespues,

                mensaje:
                    gano
                        ?
                        `🎉 ¡Ganaste $${premio.toLocaleString("es-CO")} demo!`
                        :
                        `😔 Salió el ${numeroVisual(numeroRuleta)}. Perdiste $${apuesta.toLocaleString("es-CO")} demo.`

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
// ELIMINAR HISTORIAL DEL USUARIO
// ============================================================

app.delete(
    "/api/historial/:email",
    async (req, res) => {

        try {

            const email =
                limpiarEmail(
                    req.params.email
                );

            if (!email) {

                return res.json({

                    ok: false,

                    msg: "Usuario no válido"

                });

            }

            const resultado =
                await Juego.deleteMany({
                    email
                });

            res.json({

                ok: true,

                msg: "Historial eliminado correctamente",

                eliminadas:
                    resultado.deletedCount

            });

        } catch (error) {

            console.error(
                "❌ Error eliminando historial:",
                error
            );

            res.json({

                ok: false,

                msg: "No se pudo eliminar el historial"

            });

        }

    }
);
// ============================================================
// HISTORIAL DEL USUARIO
// ============================================================

app.get(
    "/api/historial/:email",
    async (req, res) => {

        try {

            const email =
                limpiarEmail(
                    req.params.email
                );

            const historial =
                await Juego.find({
                    email
                })
                .sort({
                    _id: -1
                })
                .limit(100);

            res.json({

                ok: true,

                historial

            });

        } catch (error) {

            res.json({

                ok: false,

                historial: []

            });

        }

    }
);

// ============================================================
// MOVIMIENTOS DEL USUARIO
// ============================================================

app.get(
    "/api/movimientos/:email",
    async (req, res) => {

        try {

            const email =
                limpiarEmail(
                    req.params.email
                );

            const movimientos =
                await Movimiento.find({
                    email
                })
                .sort({
                    _id: -1
                })
                .limit(100);

            res.json({

                ok: true,

                movimientos

            });

        } catch (error) {

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

            const email =
                limpiarEmail(
                    req.body.email
                );

            const monto =
                Number(req.body.monto);

            const user =
                await User.findOne({
                    email
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

                    msg: "Usuario bloqueado"

                });

            }

            if (
                !Number.isInteger(monto) ||
                monto <= 0
            ) {

                return res.json({

                    ok: false,

                    msg: "Monto inválido"

                });

            }

            if (monto < RETIRO_MINIMO) {

                return res.json({

                    ok: false,

                    msg:
                        "El retiro mínimo es de $10.000 demo"

                });

            }

            const saldo =
                Number(user.saldo || 0);

            if (monto > saldo) {

                return res.json({

                    ok: false,

                    msg:
                        "No tienes suficiente saldo demo"

                });

            }

            const numeroNequi =
                String(
                    req.body.nequi ||
                    user.nequi ||
                    ""
                ).trim();

            if (!numeroNequi) {

                return res.json({

                    ok: false,

                    msg:
                        "Debes registrar tu número Nequi demo"

                });

            }

            const pendiente =
                await Retiro.findOne({

                    email,

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

            const saldoAntes =
                saldo;

            user.saldo =
                saldo - monto;

            await user.save();

            await Retiro.create({

                email:
                    user.email,

                nombre:
                    user.nombre,

                nequi:
                    numeroNequi,

                monto:
                    monto,

                estado:
                    "pendiente",

                fecha:
                    fecha()

            });

            await Movimiento.create({

                email:
                    user.email,

                tipo:
                    "retiro_demo",

                monto:
                    monto,

                saldoAntes:
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

                msg: "Error procesando retiro"

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
// ADMIN - USUARIOS
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

        } catch (error) {

            console.error(error);

            res.json({

                ok: false,

                usuarios: []

            });

        }

    }
);

// ============================================================
// ADMIN - RECARGAR DEMO
// ============================================================

app.post(
    "/api/admin/recargar",
    async (req, res) => {

        try {

            const email =
                limpiarEmail(
                    req.body.email
                );

            const monto =
                Number(req.body.monto);

            const motivo =
                String(
                    req.body.motivo ||
                    "Recarga manual del administrador"
                ).trim();

            if (!email) {

                return res.json({

                    ok: false,

                    msg: "Correo requerido"

                });

            }

            if (
                !Number.isInteger(monto) ||
                monto <= 0
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "Monto de recarga inválido"

                });

            }

            const user =
                await User.findOne({
                    email
                });

            if (!user) {

                return res.json({

                    ok: false,

                    msg: "Usuario no encontrado"

                });

            }

            const saldoAntes =
                Number(user.saldo || 0);

            user.saldo =
                saldoAntes + monto;

            await user.save();

            await Recarga.create({

                email:
                    user.email,

                nombre:
                    user.nombre,

                monto:
                    monto,

                motivo:
                    motivo,

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
                    monto,

                saldoAntes:
                    saldoAntes,

                saldoDespues:
                    user.saldo,

                detalle:
                    motivo,

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

            const email =
                limpiarEmail(
                    req.body.email
                );

            const monto =
                Number(req.body.monto);

            if (
                !email ||
                !Number.isInteger(monto) ||
                monto <= 0
            ) {

                return res.json({

                    ok: false,

                    msg: "Datos inválidos"

                });

            }

            const user =
                await User.findOne({
                    email
                });

            if (!user) {

                return res.json({

                    ok: false,

                    msg: "Usuario no encontrado"

                });

            }

            const saldoAntes =
                Number(user.saldo || 0);

            if (monto > saldoAntes) {

                return res.json({

                    ok: false,

                    msg:
                        "El usuario no tiene ese saldo demo"

                });

            }

            user.saldo =
                saldoAntes - monto;

            await user.save();

            await Movimiento.create({

                email:
                    user.email,

                tipo:
                    "ajuste_admin",

                monto:
                    monto,

                saldoAntes:
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

            console.error(error);

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

            const email =
                limpiarEmail(
                    req.body.email
                );

            const result =
                await User.updateOne(

                    {
                        email
                    },

                    {
                        bloqueado:
                            true
                    }

                );

            if (
                result.matchedCount === 0
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "Usuario no encontrado"

                });

            }

            res.json({

                ok: true,

                msg:
                    "Usuario bloqueado"

            });

        } catch (error) {

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

            const email =
                limpiarEmail(
                    req.body.email
                );

            const result =
                await User.updateOne(

                    {
                        email
                    },

                    {
                        bloqueado:
                            false
                    }

                );

            if (
                result.matchedCount === 0
            ) {

                return res.json({

                    ok: false,

                    msg:
                        "Usuario no encontrado"

                });

            }

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
// ADMIN - RETIROS
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

            const retiro =
                await Retiro.findById(
                    req.body.id
                );

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

            console.error(error);

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

            const retiro =
                await Retiro.findById(
                    req.body.id
                );

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

                    saldoAntes:
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

            console.error(error);

            res.json({

                ok: false,

                msg:
                    "Error rechazando retiro"

            });

        }

    }
);

// ============================================================
// ADMIN - PARTIDAS
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

            const resultadoSaldo =
                await User.aggregate([

                    {

                        $group: {

                            _id:
                                null,

                            total: {

                                $sum:
                                    "$saldo"

                            }

                        }

                    }

                ]);

            const dineroDemoTotal =
                resultadoSaldo.length
                    ? Number(
                        resultadoSaldo[0].total || 0
                    )
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

            console.error(error);

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

<!DOCTYPE html>

<html lang="es">

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width,initial-scale=1">

<title>Juego Tavo Demo</title>

</head>

<body style="
font-family:Arial;
background:#0f172a;
color:white;
text-align:center;
padding:40px;
">

<h1>🎰 Juego Tavo Demo</h1>

<p>✅ Servidor funcionando correctamente</p>

<p>🪙 Dinero ficticio / demo</p>

<p>🔢 Números disponibles: 00 - 99</p>

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

// ============================================================
// CONECTAR MONGODB Y ARRANCAR SERVIDOR
// ============================================================

mongoose.connect(MONGO_URI)

    .then(() => {

        console.log(
            "✅ MongoDB conectado correctamente"
        );

        app.listen(
            PORT,
            () => {

                console.log(
                    "🚀 Servidor activo en puerto " +
                    PORT
                );

            }
        );

    })

    .catch(error => {

        console.error(
            "❌ Error conectando MongoDB:",
            error
        );

        process.exit(1);

    });

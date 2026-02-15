let usuarioActual = null;

/* ================= MOSTRAR REGISTRO ================= */

function mostrarRegistro(){
  document.getElementById("loginBox").classList.add("hide");
  document.getElementById("registerBox").classList.remove("hide");
}

/* ================= VOLVER LOGIN ================= */

function volverLogin(){
  document.getElementById("registerBox").classList.add("hide");
  document.getElementById("loginBox").classList.remove("hide");
}

/* ================= LOGIN ================= */

async function login(){

  const email = document.getElementById("l_email").value.trim();
  const password = document.getElementById("l_pass").value;
  const terminos = document.getElementById("terminos").checked;

  document.getElementById("loginMsg").innerText = "";

  if(!terminos){
    alert("Debe aceptar los términos y condiciones");
    return;
  }

  if(!email || !password){
    alert("Complete todos los campos");
    return;
  }

  try{

    const res = await fetch("/api/login",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ email, password })
    });

    // 🔐 Si el servidor devuelve error 500 o 404
    if(!res.ok){
      document.getElementById("loginMsg").innerText =
        "Error servidor: " + res.status;
      return;
    }

    const data = await res.json();

    if(!data.ok){
      document.getElementById("loginMsg").innerText =
        data.msg || "Credenciales incorrectas";
      return;
    }

    // ADMIN
    if(data.rol === "admin"){
      alert("Bienvenido Admin");
      window.location.reload();
      return;
    }

    usuarioActual = data.user;

    document.getElementById("loginBox").classList.add("hide");
    document.getElementById("registerBox").classList.add("hide");
    document.getElementById("panel").classList.remove("hide");

    cargarPanel();

  }catch(error){
    console.error(error);
    document.getElementById("loginMsg").innerText =
      "No conecta con el servidor";
  }
}

/* ================= REGISTRO ================= */

async function register(){

  const nombre = document.getElementById("r_nombre").value.trim();
  const email = document.getElementById("r_email").value.trim();
  const password = document.getElementById("r_pass").value;

  if(!nombre || !email || !password){
    alert("Complete todos los campos");
    return;
  }

  if(password.length < 6){
    alert("La contraseña debe tener mínimo 6 caracteres");
    return;
  }

  try{

    const res = await fetch("/api/register",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ nombre, email, password })
    });

    if(!res.ok){
      alert("Error servidor: " + res.status);
      return;
    }

    const data = await res.json();
    alert(data.msg);

    if(data.ok){
      volverLogin();
    }

  }catch(error){
    console.error(error);
    alert("No conecta con el servidor");
  }
}

/* ================= CARGAR PANEL ================= */

function cargarPanel(){

  if(!usuarioActual) return;

  document.getElementById("nombreUser").innerText =
    usuarioActual.nombre || "Sin nombre";

  document.getElementById("saldo").innerText =
    usuarioActual.saldo || 0;

  document.getElementById("dia").innerText =
    usuarioActual.dias || 0;
}

/* ================= EDITAR NOMBRE ================= */

async function editarNombre(){

  if(!usuarioActual) return;

  let nuevo = prompt("Escribe tu nombre completo");

  if(!nuevo || nuevo.trim() === ""){
    alert("Nombre inválido");
    return;
  }

  try{

    const res = await fetch("/api/nombre",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        email:usuarioActual.email,
        nombre:nuevo.trim()
      })
    });

    if(!res.ok){
      alert("Error servidor");
      return;
    }

    const data = await res.json();
    alert(data.msg);

    if(data.ok){
      usuarioActual.nombre = nuevo.trim();
      cargarPanel();
    }

  }catch(error){
    console.error(error);
    alert("No conecta con el servidor");
  }
}

/* ================= INVERTIR ================= */

async function invertir(){

  if(!usuarioActual) return;

  const monto = Number(document.getElementById("monto").value);

  if(isNaN(monto) || monto <= 0){
    alert("Ingrese un monto válido");
    return;
  }

  try{

    const res = await fetch("/api/invertir",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        email:usuarioActual.email,
        monto
      })
    });

    if(!res.ok){
      alert("Error servidor");
      return;
    }

    const data = await res.json();
    alert(data.msg);

  }catch(error){
    console.error(error);
    alert("No conecta con el servidor");
  }
}

/* ================= AGREGAR WALLET ================= */

async function agregarWallet(){

  if(!usuarioActual) return;

  let wallet = prompt("Pega tu billetera TRC20");

  if(!wallet || wallet.trim() === ""){
    alert("Debe ingresar una billetera válida");
    return;
  }

  try{

    const res = await fetch("/api/wallet",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        email:usuarioActual.email,
        wallet:wallet.trim()
      })
    });

    if(!res.ok){
      alert("Error servidor");
      return;
    }

    const data = await res.json();
    alert(data.msg);

    if(data.ok){
      usuarioActual.wallet = wallet.trim();
    }

  }catch(error){
    console.error(error);
    alert("No conecta con el servidor");
  }
}

/* ================= RETIRAR ================= */

async function retirar(){

  if(!usuarioActual) return;

  try{

    const res = await fetch("/api/retirar",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        email:usuarioActual.email
      })
    });

    if(!res.ok){
      alert("Error servidor");
      return;
    }

    const data = await res.json();
    alert(data.msg);

  }catch(error){
    console.error(error);
    alert("No conecta con el servidor");
  }
}

/* ================= INVITAR ================= */

function invitar(){
  window.open("https://wa.me/?text=Regístrate aquí https://bitusdt-1.onrender.com");
}

/* ================= LOGOUT ================= */

function logout(){
  location.reload();
      }

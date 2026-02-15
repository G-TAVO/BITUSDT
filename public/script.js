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

  if(email === "" || password === ""){
    alert("Complete todos los campos");
    return;
  }

  try{

    const res = await fetch("/api/login",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ email, password })
    });

    const data = await res.json();

    if(!data.ok){
      document.getElementById("loginMsg").innerText = data.msg;
      return;
    }

    // ADMIN
    if(data.rol === "admin"){
      window.location.reload(); // mantiene tu lógica original
      return;
    }

    usuarioActual = data.user;

    document.getElementById("loginBox").classList.add("hide");
    document.getElementById("registerBox").classList.add("hide");
    document.getElementById("panel").classList.remove("hide");

    cargarPanel();

  }catch(error){
    alert("Error de conexión");
  }
}

/* ================= REGISTRO ================= */

async function register(){

  const nombre = document.getElementById("r_nombre").value.trim();
  const email = document.getElementById("r_email").value.trim();
  const password = document.getElementById("r_pass").value;

  if(nombre === "" || email === "" || password === ""){
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

    const data = await res.json();
    alert(data.msg);

    if(data.ok){
      volverLogin();
    }

  }catch(error){
    alert("Error de conexión");
  }
}

/* ================= CARGAR PANEL ================= */

function cargarPanel(){

  document.getElementById("nombreUser").innerText =
    usuarioActual.nombre || "Sin nombre";

  document.getElementById("saldo").innerText =
    usuarioActual.saldo;

  document.getElementById("dia").innerText =
    usuarioActual.dias;
}

/* ================= EDITAR NOMBRE ================= */

async function editarNombre(){

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

    const data = await res.json();
    alert(data.msg);

    if(data.ok){
      usuarioActual.nombre = nuevo.trim();
      cargarPanel();
    }

  }catch(error){
    alert("Error de conexión");
  }
}

/* ================= INVERTIR ================= */

async function invertir(){

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

    const data = await res.json();
    alert(data.msg);

  }catch(error){
    alert("Error de conexión");
  }
}

/* ================= AGREGAR WALLET ================= */

async function agregarWallet(){

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

    const data = await res.json();
    alert(data.msg);

    if(data.ok){
      usuarioActual.wallet = wallet.trim();
    }

  }catch(error){
    alert("Error de conexión");
  }
}

/* ================= RETIRAR ================= */

async function retirar(){

  try{

    const res = await fetch("/api/retirar",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        email:usuarioActual.email
      })
    });

    const data = await res.json();
    alert(data.msg);

  }catch(error){
    alert("Error de conexión");
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

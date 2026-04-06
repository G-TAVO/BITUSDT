let usuarioActual = null;

// MOSTRAR REGISTRO
function mostrarRegistro(){
  loginBox.classList.add("hide");
  registerBox.classList.remove("hide");
  panel.classList.add("hide");
  admin.classList.add("hide");
}

// VOLVER LOGIN
function volverLogin(){
  registerBox.classList.add("hide");
  loginBox.classList.remove("hide");
  panel.classList.add("hide");
  admin.classList.add("hide");
}

// LOGIN
async function login(){

  loginMsg.innerText = "";

  const res = await fetch("/api/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      email:l_email.value,
      password:l_pass.value
    })
  });

  const data = await res.json();

  if(!data.ok){
    loginMsg.innerText = data.msg;
    return;
  }

  usuarioActual = data.user;

  // OCULTAR TODO
  loginBox.classList.add("hide");
  registerBox.classList.add("hide");
  panel.classList.add("hide");
  admin.classList.add("hide");

  if(data.rol === "admin"){
    admin.classList.remove("hide");
    cargarAdmin();
  }else{
    panel.classList.remove("hide");
    cargarPanel();
  }
}

// REGISTRO
async function register(){

  if(!r_email.value || !r_pass.value){
    alert("Complete todos los campos");
    return;
  }

  const res = await fetch("/api/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      email: r_email.value,
      password: r_pass.value
    })
  });

  const data = await res.json();
  alert(data.msg);

  if(data.ok) volverLogin();
}

// PANEL (Usuario)
function cargarPanel(){
  document.getElementById("tituloPanel").innerText = usuarioActual.email;

  document.getElementById("saldoPendiente").innerText = usuarioActual.saldoPendiente ?? 0;
  document.getElementById("montoPrestamo").innerText = usuarioActual.montoPrestamo ?? 0;
  document.getElementById("diasRestantes").innerText = usuarioActual.diasPrestamo ?? 0;

  telefono.innerText = usuarioActual.telefono
    ? usuarioActual.telefono
    : "No registrado";
}

// SOLICITAR PRÉSTAMO
async function solicitarPrestamo(){

  if(!monto.value){
    alert("Ingrese un monto");
    return;
  }

  const res = await fetch("/api/solicitar-prestamo",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      email: usuarioActual.email,
      monto: monto.value
    })
  });

  const data = await res.json();
  alert(data.msg);
}

// ACTUALIZAR TELÉFONO
async function actualizarTelefono(){

  let t = prompt("Ingresa tu número de teléfono");
  if(!t || t.trim() === ""){
    alert("Debe ingresar un número válido");
    return;
  }

  const res = await fetch("/api/telefono",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      email: usuarioActual.email,
      telefono: t
    })
  });

  const data = await res.json();
  alert(data.msg);

  if(data.ok){
    usuarioActual.telefono = t;
    cargarPanel();
  }
}

// SOLICITAR ABONO
async function solicitarAbono(){

  if(!monto.value){
    alert("Ingrese el monto a abonar");
    return;
  }

  const res = await fetch("/api/solicitar-abono",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      email: usuarioActual.email,
      monto: monto.value
    })
  });

  const data = await res.json();
  alert(data.msg);
}

// INVITAR
function invitar(){
  window.open("https://wa.me/?text=Solicita tu préstamo aquí: https://tuapp.com");
}

// LOGOUT
function logout(){
  location.reload();
}

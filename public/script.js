let usuarioActual = null;

function mostrarRegistro(){
  loginBox.classList.add("hide");
  registerBox.classList.remove("hide");
}

function volverLogin(){
  registerBox.classList.add("hide");
  loginBox.classList.remove("hide");
}

async function login(){
  const res = await fetch("/api/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      email:l_email.value,
      password:l_pass.value
    })
  });
  const data = await res.json();
  if(!data.ok) return alert(data.msg);

  usuarioActual = data.user;

  loginBox.classList.add("hide");
  registerBox.classList.add("hide");

  if(data.rol === "admin"){
    admin.classList.remove("hide");
    cargarAdmin();
  }else{
    panel.classList.remove("hide");
    cargarPanel();
  }
}

function cargarPanel(){
  tituloPanel.innerText =
    usuarioActual.nombre && usuarioActual.nombre !== ""
      ? usuarioActual.nombre
      : "Usuario";

  saldo.innerText = usuarioActual.saldo;
  dia.innerText = usuarioActual.dias;
}

async function agregarNombre(){
  let n = prompt("Ingrese su nombre");
  if(!n) return;

  const res = await fetch("/api/nombre",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      email:usuarioActual.email,
      nombre:n
    })
  });
  const data = await res.json();
  alert(data.msg);
  if(data.ok){
    usuarioActual.nombre = n;
    cargarPanel();
  }
}

async function invertir(){
  const monto = prompt("Monto a invertir");
  if(!monto) return;

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
}

function logout(){
  location.reload();
}

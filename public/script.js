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

  if(!data.ok){
    loginMsg.innerText = data.msg;
    return;
  }

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
  tituloPanel.innerText = usuarioActual.nombre || "Usuario";
  correoUsuario.innerText = usuarioActual.email;
  saldo.innerText = usuarioActual.saldo;
  dia.innerText = usuarioActual.dias;
}

async function agregarNombre(){
  const n = prompt("Ingrese su nombre");
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

async function cargarAdmin(){
  const res = await fetch("/api/solicitudes");
  const data = await res.json();

  let html = "";

  data.forEach(s=>{
    html += `
    <div class="card">
      👤 Nombre: <b>${s.nombre || "No registrado"}</b><br>
      📧 Correo: <b>${s.email}</b><br>
      💰 Saldo actual: <b>${s.saldoActual ?? 0}</b><br>
      💸 Monto: <b>${s.monto}</b><br>
      📌 Tipo: <b>${s.tipo}</b><br>
      👛 Wallet: <b>${s.wallet || "No registrada"}</b><br>
      <button class="btn-invertir" onclick="aprobar('${s._id}')">Aprobar</button>
      <button class="btn-retirar" onclick="rechazar('${s._id}')">Rechazar</button>
    </div>`;
  });

  lista.innerHTML = html;
}

async function aprobar(id){
  await fetch("/api/aprobar",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id})
  });
  cargarAdmin();
}

async function rechazar(id){
  await fetch("/api/rechazar",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({id})
  });
  cargarAdmin();
}

function logout(){
  location.reload();
}

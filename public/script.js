let usuarioActual=null;

// MOSTRAR REGISTRO
function mostrarRegistro(){
loginBox.classList.add("hide");
registerBox.classList.remove("hide");
}

// VOLVER LOGIN
function volverLogin(){
registerBox.classList.add("hide");
loginBox.classList.remove("hide");
}

// LOGIN
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
loginMsg.innerText=data.msg;
return;
}

usuarioActual=data.user;
loginBox.classList.add("hide");

if(data.rol==="admin"){
admin.classList.remove("hide");
cargarAdmin();
}else{
panel.classList.remove("hide");
cargarPanel();
}
}

// REGISTRO
async function register(){

if(!r_email.value||!r_pass.value){
alert("Complete todos los campos");
return;
}

const res = await fetch("/api/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email:r_email.value,
password:r_pass.value
})
});

const data = await res.json();
alert(data.msg);

if(data.ok) volverLogin();
}

// PANEL
function cargarPanel(){
saldo.innerText=usuarioActual.saldo;
dia.innerText=usuarioActual.dias;
wallet.innerText=walletAdmin;
}

// INVERTIR
async function invertir(){

await fetch("/api/invertir",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email:usuarioActual.email,
monto:monto.value
})
});

alert("Solicitud enviada al admin");
}

// AGREGAR WALLET
async function agregarWallet(){

let w = prompt("Pega tu billetera TRC20");

if(!w){
alert("Debe pegar una billetera");
return;
}

await fetch("/api/wallet",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email:usuarioActual.email,
wallet:w
})
});

alert("Billetera guardada");
}

// RETIRAR
async function retirar(){

const res = await fetch("/api/retirar",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email:usuarioActual.email
})
});

const data = await res.json();
alert(data.msg);
}

// INVITAR
function invitar(){
window.open("https://wa.me/?text=Regístrate aquí https://bitusdt.onrender.com");
}

// COPIAR
function copiarWallet(){
navigator.clipboard.writeText(walletAdmin);
alert("Billetera copiada");
}

// LOGOUT
function logout(){
location.reload();
}

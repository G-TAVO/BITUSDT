let saldo=0,total=0,hoy=0;
let users=0,invTotal=0;

function show(id){
document.querySelectorAll("section").forEach(s=>s.classList.remove("active"));
document.getElementById(id).classList.add("active");
}

// Registro
function register(){
users++;
msg.innerText="Registro exitoso (demo)";
}

// Login
function login(){
loginMsg.innerText="Bienvenido (modo demo)";
show("dash");
}

// Invertir (simulado)
function invert(){
let val=parseInt(amount.value);
saldo+=val;
invTotal+=val;
hoy+=val*0.05;
total+=val*0.05;

update();
invMsg.innerText="Inversión simulada exitosa";
}

function update(){
document.getElementById("saldo").innerText=saldo.toFixed(2)+" USDT";
document.getElementById("hoy").innerText=hoy.toFixed(2)+" USDT";
document.getElementById("total").innerText=total.toFixed(2)+" USDT";
document.getElementById("users").innerText=users;
document.getElementById("totalInv").innerText=invTotal+" USDT";
}


let saldo=0,total=0,hoy=0;
let users=0,invTotal=0;

// REGISTRO
async function register(){

const data={
email:rCorreo.value,
password:rPass.value
};

const res = await fetch("/api/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});

const json = await res.json();
alert(json.msg);
}

// LOGIN
async function login(){

const data={
email: loginEmail.value,
password: loginPass.value
};

const res = await fetch("/api/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});

const json = await res.json();
alert(json.msg);

if(json.ok){

localStorage.setItem("rol",json.rol);

if(json.rol=="admin"){
location="admin.html";
}else{
location="panel.html";
}
}
}

// INVERTIR (SIMULADO)
function invertir(){

let val=parseInt(amount.value);

saldo+=val;
invTotal+=val;
hoy+=val*0.05;
total+=val*0.05;

update();
alert("Solicitud enviada al admin");
}

// ACTUALIZAR
function update(){
saldoTxt.innerText=saldo+" USDT";
hoyTxt.innerText=hoy.toFixed(2)+" USDT";
totalTxt.innerText=total.toFixed(2)+" USDT";
}

// SALIR
function logout(){
localStorage.clear();
location="login.html";
}

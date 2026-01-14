// VERIFICAR SESIÓN
if(localStorage.getItem("rol")=="admin"){
if(location.pathname.includes("login") ||
location.pathname.includes("index")){
location="admin.html";
}
}

if(localStorage.getItem("rol")=="user"){
if(location.pathname.includes("admin")){
location="panel.html";
}
}

// REGISTRO
async function registrar(){

const data={
email:rCorreo.value,
password:rPass.value
};

const res = await fetch("/api/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});

let j = await res.json();
alert(j.msg);
}

// LOGIN
async function login(){

const data={
email:loginEmail.value,
password:loginPass.value
};

const res = await fetch("/api/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});

let j = await res.json();
if(!j.ok) return alert(j.msg);

// GUARDAR ROL
localStorage.setItem("rol",j.rol);

if(j.rol=="admin"){
location="admin.html";
}else{
location="panel.html";
}
}

// CERRAR
function logout(){
localStorage.clear();
location="login.html";
}

function show(id){
document.querySelectorAll("section").forEach(s=>{
s.classList.remove("active");
});
document.getElementById(id).classList.add("active");
}

// REGISTRO
async function register(){

const email = document.getElementById("r_email").value;
const pass  = document.getElementById("r_pass").value;

if(!email || !pass){
alert("Complete todos los campos");
return;
}

try{

const res = await fetch("/api/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email:email,
password:pass
})
});

const json = await res.json();
alert(json.msg);

if(json.ok){
volverLogin();
}

}catch(err){
alert("Error de conexión con el servidor");
}
}


// LOGIN
async function login(){

const email = document.getElementById("l_email").value;
const pass  = document.getElementById("l_pass").value;

try{

const res = await fetch("/api/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email:email,
password:pass
})
});

const json = await res.json();
document.getElementById("loginMsg").innerText=json.msg;

if(json.ok){

localStorage.setItem("rol",json.rol);

if(json.rol==="admin"){
window.location="admin.html";
}else{
localStorage.setItem("user",JSON.stringify(json.user));
window.location="panel.html";
}

}

}catch(err){
document.getElementById("loginMsg").innerText="Error de conexión";
}
}

// MOSTRAR REGISTRO
function mostrarRegistro(){
document.getElementById("loginBox").classList.add("hide");
document.getElementById("registerBox").classList.remove("hide");
}

// VOLVER LOGIN
function volverLogin(){
document.getElementById("registerBox").classList.add("hide");
document.getElementById("loginBox").classList.remove("hide");
}

// CERRAR
function logout(){
localStorage.clear();
window.location="login.html";
}

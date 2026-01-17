function show(id){
document.querySelectorAll("section").forEach(s=>{
s.classList.remove("active");
});
document.getElementById(id).classList.add("active");
}

// REGISTRO
async function register(){

if(!r_email.value || !r_pass.value){
alert("Complete todos los campos");
return;
}

const data={
email:r_email.value,
password:r_pass.value
};

try{

const res = await fetch("/api/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
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

const data={
email: loginEmail.value,
password: loginPass.value
};

try{

const res = await fetch("/api/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});

const json = await res.json();
loginMsg.innerText=json.msg;

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
loginMsg.innerText="Error de conexión";
}
}

// CERRAR
function logout(){
localStorage.clear();
window.location="login.html";
}


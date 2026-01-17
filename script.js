function show(id){
document.querySelectorAll("section").forEach(s=>{
s.classList.remove("active");
});
document.getElementById(id).classList.add("active");
}

// REGISTRO
async function register(){

if(!email.value || !password.value){
msg.innerText="Complete todos los campos";
return;
}

const data={
email:email.value,
password:password.value
};

try{

const res = await fetch("/api/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});

const json = await res.json();
msg.innerText=json.msg;

}catch(err){
msg.innerText="Error de conexión";
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


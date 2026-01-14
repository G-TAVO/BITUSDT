function show(id){
document.querySelectorAll("section").forEach(s=>{
s.classList.remove("active");
});
document.getElementById(id).classList.add("active");
}

// REGISTRO
async function register(){
const data={
nombre:nombre.value,
email:email.value,
password:password.value
};

const res = await fetch("/api/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});

const json = await res.json();
msg.innerText=json.msg;
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
loginMsg.innerText=json.msg;

if(json.ok){

// ADMIN
if(
loginEmail.value=="admin@bitusdt.com" &&
loginPass.value=="amAdmin1998"
){
    localStorage.setItem("rol","admin");
    window.location="Admin.html";
}else{
    localStorage.setItem("rol","user");
    window.location="Panel.html";
}

}
}

// CERRAR SESIÓN
function logout(){
localStorage.clear();
window.location="login.html";
}




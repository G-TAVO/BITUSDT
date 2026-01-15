function show(id){
document.querySelectorAll("section").forEach(s=>{
s.classList.remove("active");
});
document.getElementById(id).classList.add("active");
}

function ver(id){
let p=document.getElementById(id);
p.type=p.type=="password"?"text":"password";
}

async function register(){
let res = await fetch("/api/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email:r_email.value,
password:r_pass.value
})
});
let data = await res.json();
r_msg.innerText=data.msg;
}

async function login(){
let res = await fetch("/api/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email:l_email.value,
password:l_pass.value
})
});
let data = await res.json();

if(data.ok){
alert("Bienvenido "+data.rol);
}else{
l_msg.innerText=data.msg;
}
}

async function forgot(){
let res = await fetch("/api/forgot",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
email:f_email.value
})
});
let data = await res.json();
f_msg.innerText=data.msg;
}


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

let j = await res.json();
alert(j.msg);
}

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

if(j.rol=="admin"){
location="admin.html";
}else{
location="panel.html";
}
}

function logout(){
location="login.html";
}

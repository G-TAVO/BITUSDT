let token="";
let userRol="";

// LOGIN
async function login(){

let correo=lemail.value;
let pass=lpass.value;

let res=await fetch("/api/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({correo,pass})
});

let data=await res.json();

if(!res.ok){
alert(data.msg);
return;
}

token=data.token;
userRol=data.rol;

if(userRol=="admin"){
show("admin");
loadAdmin();
}else{
show("panel");
}
}

// REGISTRO
async function register(){

let nombre=rname.value;
let correo=remail.value;
let pass=rpass.value;

let res=await fetch("/api/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({nombre,correo,pass})
});

let data=await res.json();
alert(data.msg);
show("login");
}

// INVERTIR
async function invertir(){

let m=monto.value;

let res=await fetch("/api/invert",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+token
},
body:JSON.stringify({monto:Number(m)})
});

let data=await res.json();
alert(data.msg);
}

// ADMIN
async function loadAdmin(){

let res=await fetch("/api/requests",{
headers:{
"Authorization":"Bearer "+token
}
});

let data=await res.json();

let html="";

data.forEach((s,i)=>{

if(s.estado=="pendiente"){

html+=`
<p>
${s.correo} invierte ${s.monto}
<button onclick="aprobar(${i})">Aceptar</button>
</p>
`;
}

});

admin.innerHTML=`
<h2>ADMIN</h2>
<button onclick="logout()">Salir</button>
${html||"No solicitudes"}
`;
}

// APROBAR
async function aprobar(i){

let res=await fetch("/api/approve/"+i,{
method:"POST",
headers:{
"Authorization":"Bearer "+token
}
});

let data=await res.json();
alert(data.msg);
loadAdmin();
}

// SALIR
function logout(){
token="";
show("login");
}


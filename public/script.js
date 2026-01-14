
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

if(json.rol=="admin"){
 window.location="/admin";
}else{
 window.location="panel.html";
}

}
}

// CERRAR SESIÓN
async function logout(){
 await fetch("/api/logout");
 window.location="login.html";
}




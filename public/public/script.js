
function registrar(){

let nombre = document.getElementById("nombre").value;
let email = document.getElementById("email").value;
let password = document.getElementById("password").value;

fetch("/api/register",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({nombre,email,password})
})
.then(res=>res.json())
.then(data=>{
document.getElementById("msg").innerText = data.mensaje;
})
.catch(err=>{
alert("Error servidor");
});
}

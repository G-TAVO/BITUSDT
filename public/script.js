
/* ======================
   MOSTRAR SECCIONES
====================== */
function mostrar(id){
document.querySelectorAll(".card")
.forEach(d=>d.classList.add("oculto"));

document.getElementById(id)
.classList.remove("oculto");
}

/* ======================
   GUARDAR WALLET
====================== */
function guardarWallet(){
alert("Wallet guardada (demo)");
}

/* ======================
   SOLICITAR INVERSIÓN
====================== */
function solicitar(){
alert("Solicitud enviada al admin");
}

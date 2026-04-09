<script>
async function registrar() {

    const nombre = document.getElementById("nombre").value.trim();
    const cedula = document.getElementById("cedula").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // ================= VALIDACIONES =================

    if(!nombre || !cedula || !telefono || !whatsapp || !email || !password){
        alert("⚠️ Todos los campos son obligatorios.");
        return;
    }

    if(cedula.length < 5){
        alert("⚠️ La cédula no es válida.");
        return;
    }

    if(telefono.length < 7){
        alert("⚠️ El teléfono no es válido.");
        return;
    }

    if(whatsapp.length < 7){
        alert("⚠️ El WhatsApp no es válido.");
        return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if(!emailRegex.test(email)){
        alert("⚠️ Ingresa un correo válido.");
        return;
    }

    if(password.length < 4){
        alert("⚠️ La contraseña debe tener mínimo 4 caracteres.");
        return;
    }

    // Datos a enviar
    const data = { 
        nombre, 
        cedula, 
        telefono, 
        whatsapp, 
        email, 
        password 
    };

    try{
        const res = await fetch("/api/register", {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify(data)
        });

        const result = await res.json();

        if(result.ok){
            alert("✅ Registro exitoso");
            window.location.href = "login.html";
        }else{
            alert("❌ " + result.msg);
        }

    }catch(error){
        alert("❌ Error de conexión con el servidor");
        console.error(error);
    }
}
</script>

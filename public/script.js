<script>

async function registrar(){

    const nombre =
        document.getElementById("nombre")
        .value
        .trim();

    const telefono =
        document.getElementById("telefono")
        .value
        .trim();

    const email =
        document.getElementById("email")
        .value
        .trim();

    const password =
        document.getElementById("password")
        .value
        .trim();

    const password2 =
        document.getElementById("password2")
        .value
        .trim();

    const terminos =
        document.getElementById("terminos")
        .checked;


    // ==========================
    // VALIDACIONES
    // ==========================

    if(
        !nombre ||
        !telefono ||
        !email ||
        !password ||
        !password2
    ){

        alert("⚠️ Todos los campos son obligatorios.");

        return;
    }


    if(nombre.length < 3){

        alert(
            "⚠️ Ingresa tu nombre completo."
        );

        return;
    }


    if(telefono.length < 7){

        alert(
            "⚠️ El número de teléfono no es válido."
        );

        return;
    }


    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if(!emailRegex.test(email)){

        alert(
            "⚠️ Ingresa un correo electrónico válido."
        );

        return;
    }


    if(password.length < 6){

        alert(
            "⚠️ La contraseña debe tener mínimo 6 caracteres."
        );

        return;
    }


    if(password !== password2){

        alert(
            "⚠️ Las contraseñas no coinciden."
        );

        return;
    }


    if(!terminos){

        alert(
            "⚠️ Debes aceptar el funcionamiento de la aplicación DEMO."
        );

        return;
    }


    // ==========================
    // DATOS
    // ==========================

    const data = {

        nombre,
        telefono,
        email,
        password

    };


    // ==========================
    // BOTÓN
    // ==========================

    const boton =
        document.getElementById("btnRegistrar");


    if(boton){

        boton.disabled = true;

        boton.innerText =
            "Creando cuenta...";
    }


    // ==========================
    // ENVIAR AL SERVIDOR
    // ==========================

    try{

        const res =
            await fetch(
                "/api/register",
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:
                    JSON.stringify(data)
                }
            );


        const result =
            await res.json();


        // ==========================
        // RESULTADO
        // ==========================

        if(result.ok){

            alert(
                "✅ Registro exitoso.\n\n" +
                "Tu cuenta DEMO fue creada correctamente."
            );


            window.location.href =
                "login.html";


        }else{

            alert(
                "❌ " +
                (
                    result.msg ||
                    "No se pudo crear la cuenta."
                )
            );

        }


    }catch(error){

        console.error(
            "Error:",
            error
        );


        alert(
            "❌ Error de conexión con el servidor."
        );

    }


    // ==========================
    // RESTAURAR BOTÓN
    // ==========================

    if(boton){

        boton.disabled = false;

        boton.innerText =
            "🎮 CREAR CUENTA";
    }

}

</script>

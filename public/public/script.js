async function register(){

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const msgEl = document.getElementById("msg");
  msgEl.style.color = "white";
  msgEl.innerText = "Registrando...";

  try{
    const res = await fetch("/register",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      // IMPORTANTE: enviamos { username, email, password } porque el servidor lo espera así
      body:JSON.stringify({
        username: name,
        email: email,
        password: password
      })
    });

    const data = await res.json();

    if (data && (data.success === true || data.msg === "Registro exitoso" || data.message === "Usuario registrado")) {
      msgEl.style.color = "lightgreen";
      msgEl.innerText = data.message || data.msg || "Registro exitoso ✅";
    } else {
      msgEl.style.color = "red";
      // manejar distintos formatos de respuesta
      msgEl.innerText = data.message || data.msg || JSON.stringify(data);
    }
  } catch(err){
    msgEl.style.color = "red";
    msgEl.innerText = "Error de conexión";
    console.error(err);
  }
}

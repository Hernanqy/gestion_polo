import { useState } from "react";

const usuariosInternos = {
  integracion: "integracion@polo.local",
  museo: "museo@polo.local",
  bioparque: "bioparque@polo.local",
  educativo: "educativo@polo.local",
};

export default function LoginScreen({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [errorTexto, setErrorTexto] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(event) {
    event.preventDefault();

    const usuarioLimpio = usuario.trim().toLowerCase();
    const emailInterno = usuariosInternos[usuarioLimpio];

    if (!emailInterno) {
      setErrorTexto("Usuario no reconocido. Usá integracion, museo, bioparque o educativo.");
      return;
    }

    setErrorTexto("");
    setCargando(true);

    try {
      await onLogin(emailInterno, password);
    } catch (error) {
      setErrorTexto("No se pudo ingresar. Revisá usuario y contraseña.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="app">
      <section className="loginScreen">
        <div className="loginBox">
          <p className="eyebrow">Polo Gestión</p>
          <h1>Ingresar</h1>
          <p>
            Usá el usuario asignado. La app cargará automáticamente el rol y los permisos.
          </p>

          <form onSubmit={enviar}>
            <label>
              Usuario
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="integracion / museo / bioparque / educativo"
                autoComplete="username"
                required
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                autoComplete="current-password"
                required
              />
            </label>

            {errorTexto && <div className="loginError">{errorTexto}</div>}

            <button disabled={cargando}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

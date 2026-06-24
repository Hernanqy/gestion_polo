import { useMemo, useState } from "react";
import "./App.css";

const roles = {
  integracion: "Coordinación de Integración",
  museo: "Coordinación Museo",
  bioparque: "Dirección Bioparque",
  educativo: "Equipo Educativo",
};

const etapas = [
  {
    id: "solicitud",
    titulo: "Solicitudes / revisión",
    texto: "Pedidos nuevos o propuestas devueltas para corregir.",
    color: "naranja",
  },
  {
    id: "creacion",
    titulo: "En creación",
    texto: "El equipo educativo está trabajando la propuesta.",
    color: "verde",
  },
  {
    id: "revision",
    titulo: "En revisión",
    texto: "La propuesta fue enviada a coordinación.",
    color: "azul",
  },
  {
    id: "aprobada",
    titulo: "Aprobadas",
    texto: "La propuesta fue confirmada.",
    color: "lima",
  },
  {
    id: "insumos",
    titulo: "Insumos",
    texto: "Se prepara el pedido de materiales y recursos.",
    color: "tierra",
  },
  {
    id: "publicacion",
    titulo: "Publicación",
    texto: "Se prepara el texto informativo para prensa.",
    color: "dorado",
  },
];

const solicitudVacia = {
  area: "Museo",
  titulo: "",
  publico: "",
  edad: "",
  cantidad: "",
  fecha: "",
  espacio: "",
  tipo: "Taller",
  objetivo: "",
  recursos: "",
  criterios: "",
  limite: "",
};

const propuestaVacia = {
  nombre: "",
  responsable: "",
  objetivo: "",
  inicio: "",
  desarrollo: "",
  cierre: "",
  materiales: "",
  duracion: "",
  adaptaciones: "",
  necesidades: "",
  cuestiones: "",
};

const inicial = [
  {
    id: crypto.randomUUID(),
    etapa: "solicitud",
    modo: "nuevo",
    area: "Museo",
    solicita: "Coordinación Museo",
    solicitud: {
      area: "Museo",
      titulo: "Taller introductorio para visita escolar",
      publico: "Escuela primaria",
      edad: "8 a 10 años",
      cantidad: "30 estudiantes",
      fecha: "A definir",
      espacio: "Sala del Museo",
      tipo: "Taller",
      objetivo: "Diseñar una actividad breve, participativa y de divulgación.",
      recursos: "Mesas, materiales simples y objetos de apoyo.",
      criterios: "Lenguaje claro, duración breve y dinámica participativa.",
      limite: "Viernes",
    },
    propuesta: null,
    evaluacion: null,
    insumos: {
      descripcion: "",
      responsable: "",
      estado: "Pendiente",
    },
    prensa: {
      titulo: "",
      texto: "",
      estado: "Pendiente",
    },
  },
];

function App() {
  const [rol, setRol] = useState("");
  const [vista, setVista] = useState("roles");

  const [items, setItems] = useState(() => {
    const guardado = localStorage.getItem("polo_gestion_flujo_integral_v6");
    return guardado ? JSON.parse(guardado) : inicial;
  });

  const [solicitudForm, setSolicitudForm] = useState(solicitudVacia);
  const [propuestaForm, setPropuestaForm] = useState(propuestaVacia);
  const [observacionesRevision, setObservacionesRevision] = useState("");
  const [motivoDesestimacion, setMotivoDesestimacion] = useState("");
  const [insumosForm, setInsumosForm] = useState({
    descripcion: "",
    responsable: "",
    estado: "Pendiente",
  });
  const [prensaForm, setPrensaForm] = useState({
    titulo: "",
    texto: "",
    estado: "Pendiente",
  });
  const [seleccionadoId, setSeleccionadoId] = useState(null);

  const seleccionado = items.find((item) => item.id === seleccionadoId);

  const baseVisible = useMemo(() => {
    let lista = items.filter((item) => item.etapa !== "desestimada");

    if (rol === "museo") {
      lista = lista.filter((item) => item.area === "Museo");
    }

    if (rol === "bioparque") {
      lista = lista.filter((item) => item.area === "Bioparque");
    }

    return lista;
  }, [items, rol]);

  const tableroItems = useMemo(
    () => baseVisible.filter((item) => etapas.some((etapa) => etapa.id === item.etapa)),
    [baseVisible]
  );

  const listas = useMemo(
    () => baseVisible.filter((item) => item.etapa === "lista"),
    [baseVisible]
  );

  const cuestionesPendientes = useMemo(
    () =>
      baseVisible.filter(
        (item) => item.propuesta?.cuestiones && item.propuesta.cuestiones.trim()
      ),
    [baseVisible]
  );

  function guardar(nuevos) {
    setItems(nuevos);
    localStorage.setItem("polo_gestion_flujo_integral_v6", JSON.stringify(nuevos));
  }

  function seleccionarRol(nuevoRol) {
    setRol(nuevoRol);
    setVista("menu");
  }

  function cambiarRol() {
    setRol("");
    setVista("roles");
    setSeleccionadoId(null);
  }

  function puedeCrearSolicitud() {
    return rol === "integracion" || rol === "museo" || rol === "bioparque";
  }

  function puedeEvaluar(item) {
    if (item.etapa !== "revision") return false;
    if (rol === "integracion") return true;
    if (rol === "museo" && item.area === "Museo") return true;
    if (rol === "bioparque" && item.area === "Bioparque") return true;
    return false;
  }

  function puedeGestionarFinal(item) {
    if (rol === "integracion") return true;
    if (rol === "museo" && item.area === "Museo") return true;
    if (rol === "bioparque" && item.area === "Bioparque") return true;
    return false;
  }

  function crearSolicitud(event) {
    event.preventDefault();
    if (!solicitudForm.titulo.trim()) return;

    const area =
      rol === "museo"
        ? "Museo"
        : rol === "bioparque"
        ? "Bioparque"
        : solicitudForm.area;

    const nuevoItem = {
      id: crypto.randomUUID(),
      etapa: "solicitud",
      modo: "nuevo",
      area,
      solicita: roles[rol],
      solicitud: {
        ...solicitudForm,
        area,
      },
      propuesta: null,
      evaluacion: null,
      insumos: {
        descripcion: "",
        responsable: "",
        estado: "Pendiente",
      },
      prensa: {
        titulo: "",
        texto: "",
        estado: "Pendiente",
      },
    };

    guardar([nuevoItem, ...items]);
    setSolicitudForm({ ...solicitudVacia, area });
    setVista("tablero");
  }

  function crearPropuestaPropia(event) {
    event.preventDefault();
    if (!propuestaForm.nombre.trim()) return;

    const area = solicitudForm.area || "Museo";

    const nuevoItem = {
      id: crypto.randomUUID(),
      etapa: "revision",
      modo: "espontanea",
      area,
      solicita: "Equipo Educativo",
      solicitud: {
        area,
        titulo: propuestaForm.nombre,
        publico: solicitudForm.publico || "A definir",
        edad: solicitudForm.edad || "A definir",
        cantidad: solicitudForm.cantidad || "A definir",
        fecha: solicitudForm.fecha || "A definir",
        espacio: solicitudForm.espacio || "A definir",
        tipo: solicitudForm.tipo || "Actividad educativa",
        objetivo: propuestaForm.objetivo || "Propuesta generada por el equipo educativo.",
        recursos: solicitudForm.recursos || "A definir",
        criterios: solicitudForm.criterios || "Propuesta espontánea del equipo educativo.",
        limite: solicitudForm.limite || "Sin definir",
      },
      propuesta: {
        ...propuestaForm,
      },
      evaluacion: null,
      insumos: {
        descripcion: "",
        responsable: "",
        estado: "Pendiente",
      },
      prensa: {
        titulo: "",
        texto: "",
        estado: "Pendiente",
      },
    };

    guardar([nuevoItem, ...items]);
    setSolicitudForm(solicitudVacia);
    setPropuestaForm(propuestaVacia);
    setVista("tablero");
  }

  function tomarSolicitud(item) {
    guardar(
      items.map((actual) =>
        actual.id === item.id
          ? {
              ...actual,
              etapa: "creacion",
            }
          : actual
      )
    );
  }

  function abrirCargaPropuesta(item) {
    setSeleccionadoId(item.id);
    setPropuestaForm(item.propuesta || propuestaVacia);
    setVista("cargarPropuesta");
  }

  function guardarBorradorPropuesta() {
    guardar(
      items.map((item) =>
        item.id === seleccionadoId
          ? {
              ...item,
              etapa: "creacion",
              propuesta: propuestaForm,
            }
          : item
      )
    );
    setVista("tablero");
  }

  function enviarPropuesta(event) {
    event.preventDefault();

    guardar(
      items.map((item) =>
        item.id === seleccionadoId
          ? {
              ...item,
              etapa: "revision",
              modo: item.modo === "revision" ? "revision" : item.modo,
              propuesta: propuestaForm,
            }
          : item
      )
    );

    setSeleccionadoId(null);
    setPropuestaForm(propuestaVacia);
    setVista("tablero");
  }

  function abrirEvaluacion(item) {
    setSeleccionadoId(item.id);
    setObservacionesRevision("");
    setMotivoDesestimacion("");
    setVista("evaluacion");
  }

  function aprobarPropuesta() {
    guardar(
      items.map((item) =>
        item.id === seleccionadoId
          ? {
              ...item,
              etapa: "aprobada",
              modo: "aprobada",
              evaluacion: {
                resultado: "Aprobada",
                observaciones: "",
              },
            }
          : item
      )
    );
    setSeleccionadoId(null);
    setVista("tablero");
  }

  function devolverRevision() {
    const observaciones =
      observacionesRevision.trim() ||
      "La propuesta requiere ajustes indicados por coordinación.";

    guardar(
      items.map((item) =>
        item.id === seleccionadoId
          ? {
              ...item,
              etapa: "solicitud",
              modo: "revision",
              evaluacion: {
                resultado: "Revisión",
                observaciones,
              },
            }
          : item
      )
    );

    setSeleccionadoId(null);
    setObservacionesRevision("");
    setVista("tablero");
  }

  function desestimar() {
    const motivo =
      motivoDesestimacion.trim() || "La propuesta no avanza en este formato.";

    guardar(
      items.map((item) =>
        item.id === seleccionadoId
          ? {
              ...item,
              etapa: "desestimada",
              modo: "desestimada",
              evaluacion: {
                resultado: "Desestimada",
                observaciones: motivo,
              },
            }
          : item
      )
    );

    setSeleccionadoId(null);
    setMotivoDesestimacion("");
    setVista("tablero");
  }

  function abrirDocumentoFinal(item) {
    setSeleccionadoId(item.id);
    setInsumosForm(
      item.insumos || { descripcion: "", responsable: "", estado: "Pendiente" }
    );
    setVista("documentoFinal");
  }

  function guardarDocumentoEInsumos(event) {
    event.preventDefault();

    guardar(
      items.map((item) =>
        item.id === seleccionadoId
          ? {
              ...item,
              etapa: "insumos",
              insumos: {
                ...insumosForm,
                estado: "Pendiente de validación",
              },
            }
          : item
      )
    );

    setSeleccionadoId(null);
    setVista("tablero");
  }

  function pasarAPublicacion(item) {
    guardar(
      items.map((actual) =>
        actual.id === item.id
          ? {
              ...actual,
              etapa: "publicacion",
              insumos: {
                ...actual.insumos,
                estado: "Aprobados",
              },
            }
          : actual
      )
    );
  }

  function abrirPublicacion(item) {
    setSeleccionadoId(item.id);
    setPrensaForm({
      titulo:
        item.prensa?.titulo ||
        item.propuesta?.nombre ||
        item.solicitud.titulo,
      texto:
        item.prensa?.texto ||
        `Se realizará la propuesta "${item.propuesta?.nombre || item.solicitud.titulo}", destinada a ${item.solicitud.publico || "público participante"}, en ${item.solicitud.espacio || "el Polo"}. La actividad busca ${item.propuesta?.objetivo || item.solicitud.objetivo}.`,
      estado: "Pendiente de publicación",
    });
    setVista("publicacionForm");
  }

  function guardarPublicacion(event) {
    event.preventDefault();

    guardar(
      items.map((item) =>
        item.id === seleccionadoId
          ? {
              ...item,
              etapa: "lista",
              prensa: {
                ...prensaForm,
                estado: "Publicada / vigente",
              },
            }
          : item
      )
    );

    setSeleccionadoId(null);
    setVista("listas");
  }

  function abrirPropuestaLista(item) {
    setSeleccionadoId(item.id);
    setVista("documentoLista");
  }

  function imprimirDocumento() {
    window.print();
  }

  function copiarDocumento() {
    if (!seleccionado) return;
    navigator.clipboard?.writeText(generarDocumento(seleccionado));
  }

  function descargarDocumentoHtml() {
    if (!seleccionado) return;

    const html = generarHtmlDocumento(seleccionado);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const nombre =
      seleccionado.propuesta?.nombre ||
      seleccionado.solicitud.titulo ||
      "propuesta";

    link.href = url;
    link.download = `${limpiarNombreArchivo(nombre)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (vista === "roles") {
    return (
      <main className="app">
        <section className="roleScreen">
          <p className="eyebrow">Polo Gestión</p>
          <h1>Ingresar como</h1>
          <p>Seleccioná el rol para ver solo las acciones correspondientes.</p>

          <div className="roleGrid">
            <button onClick={() => seleccionarRol("integracion")}>
              <span>🧭</span>
              <strong>Coordinación de Integración</strong>
              <small>Vista general del Polo, seguimiento y articulación.</small>
            </button>

            <button onClick={() => seleccionarRol("museo")}>
              <span>🏛️</span>
              <strong>Coordinación Museo</strong>
              <small>Solicitudes, revisión y seguimiento del Museo.</small>
            </button>

            <button onClick={() => seleccionarRol("bioparque")}>
              <span>🌿</span>
              <strong>Dirección Bioparque</strong>
              <small>Solicitudes, revisión y seguimiento del Bioparque.</small>
            </button>

            <button onClick={() => seleccionarRol("educativo")}>
              <span>👥</span>
              <strong>Equipo Educativo</strong>
              <small>Tomar solicitudes, crear propuestas y resolver observaciones.</small>
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="topbar noPrint">
        <button className="brand" onClick={() => setVista("menu")}>
          Polo Gestión
        </button>

        <div className="currentRole">
          <span>{roles[rol]}</span>
          <button onClick={cambiarRol}>Cambiar rol</button>
        </div>

        {vista !== "menu" && (
          <button className="volver" onClick={() => setVista("menu")}>
            Volver al menú
          </button>
        )}
      </header>

      {vista === "menu" && (
        <>
          <section className="hero">
            <p className="eyebrow">Sistema interno</p>
            <h1>Polo Gestión</h1>
            <p>
              Vista actual: <strong>{roles[rol]}</strong>. Ingresá al módulo correspondiente
              según tu responsabilidad.
            </p>
          </section>

          <section className="menuGrid">
            <button className="menuCard" onClick={() => setVista("tablero")}>
              <span>🗂️</span>
              <strong>Tablero de gestión</strong>
              <small>Solicitudes, creación, revisión, aprobación, insumos y publicación.</small>
            </button>

            {puedeCrearSolicitud() && (
              <button className="menuCard" onClick={() => setVista("crearSolicitud")}>
                <span>➕</span>
                <strong>Cargar solicitud</strong>
                <small>Crear una ficha estandarizada para el equipo educativo.</small>
              </button>
            )}

            {rol === "educativo" && (
              <button className="menuCard" onClick={() => setVista("crearPropuestaPropia")}>
                <span>💡</span>
                <strong>Crear propuesta propia</strong>
                <small>Presentar una idea educativa sin solicitud previa.</small>
              </button>
            )}

            {rol === "educativo" && (
              <button className="menuCard" onClick={() => setVista("cuestiones")}>
                <span>📝</span>
                <strong>Cuestiones a resolver</strong>
                <small>Dudas, necesidades o condiciones cargadas en propuestas.</small>
              </button>
            )}

            <button className="menuCard" onClick={() => setVista("listas")}>
              <span>✅</span>
              <strong>Propuestas listas</strong>
              <small>Ver propuestas vigentes con insumos y gacetilla final. Total: {listas.length}</small>
            </button>

            <button className="menuCard" onClick={() => setVista("agenda")}>
              <span>📅</span>
              <strong>Agenda semanal</strong>
              <small>Próxima etapa: turnos, fechas y responsables.</small>
            </button>
          </section>
        </>
      )}

      {vista === "agenda" && <ModuloPendiente titulo="Agenda semanal" />}

      {vista === "tablero" && (
        <>
          <section className="screenHeader">
            <p className="eyebrow">Diseño educativo</p>
            <h2>Tablero por etapas</h2>
            <p>
              El circuito operativo es: solicitud, creación de propuesta, revisión,
              aprobación, insumos y publicación.
            </p>
          </section>

          <section className="resumenEtapas">
            {etapas.map((etapa) => (
              <article className={`contador ${etapa.color}`} key={etapa.id}>
                <strong>{tableroItems.filter((item) => item.etapa === etapa.id).length}</strong>
                <span>{etapa.titulo}</span>
              </article>
            ))}
          </section>

          <section className="kanban">
            {etapas.map((etapa) => {
              const itemsEtapa = tableroItems.filter((item) => item.etapa === etapa.id);

              return (
                <div className={`columna ${etapa.color}`} key={etapa.id}>
                  <div className="columnaHeader">
                    <strong>{etapa.titulo}</strong>
                    <small>{etapa.texto}</small>
                    <b>{itemsEtapa.length}</b>
                  </div>

                  {itemsEtapa.length === 0 && <p className="empty">Sin tarjetas.</p>}

                  {itemsEtapa.map((item) => (
                    <article className="tarjeta" key={item.id}>
                      <div className="chips">
                        <span>{item.area}</span>
                        <span>{item.solicitud.tipo}</span>
                        {item.modo === "revision" && <span>Para revisión</span>}
                        {item.modo === "espontanea" && <span>Propuesta propia</span>}
                      </div>

                      <h3>{item.solicitud.titulo}</h3>
                      <p>{item.solicitud.objetivo}</p>

                      <small>Público: {item.solicitud.publico || "Sin definir"}</small>
                      <small>Fecha: {item.solicitud.fecha || "Sin definir"}</small>
                      <small>Límite: {item.solicitud.limite || "Sin definir"}</small>

                      {item.evaluacion?.resultado === "Revisión" && (
                        <div className="alerta">
                          <strong>Revisión solicitada</strong>
                          <p>{item.evaluacion.observaciones}</p>
                        </div>
                      )}

                      {item.propuesta && (
                        <div className="nota">
                          <strong>Propuesta educativa</strong>
                          <p>{item.propuesta.nombre || "Sin nombre cargado"}</p>
                        </div>
                      )}

                      {item.propuesta?.cuestiones && (
                        <div className="alerta">
                          <strong>Cuestiones a resolver</strong>
                          <p>{item.propuesta.cuestiones}</p>
                        </div>
                      )}

                      {item.insumos?.descripcion && (
                        <div className="nota">
                          <strong>Insumos</strong>
                          <p>{item.insumos.descripcion}</p>
                        </div>
                      )}

                      <div className="acciones">
                        {rol === "educativo" && item.etapa === "solicitud" && (
                          <button onClick={() => tomarSolicitud(item)}>
                            {item.modo === "revision" ? "Tomar revisión" : "Tomar solicitud"}
                          </button>
                        )}

                        {rol === "educativo" && item.etapa === "creacion" && (
                          <button onClick={() => abrirCargaPropuesta(item)}>
                            Cargar actividad
                          </button>
                        )}

                        {puedeEvaluar(item) && (
                          <button onClick={() => abrirEvaluacion(item)}>
                            Evaluar
                          </button>
                        )}

                        {puedeGestionarFinal(item) && item.etapa === "aprobada" && (
                          <button onClick={() => abrirDocumentoFinal(item)}>
                            Documento final e insumos
                          </button>
                        )}

                        {puedeGestionarFinal(item) && item.etapa === "insumos" && (
                          <button onClick={() => pasarAPublicacion(item)}>
                            Pasar a publicación
                          </button>
                        )}

                        {puedeGestionarFinal(item) && item.etapa === "publicacion" && (
                          <button onClick={() => abrirPublicacion(item)}>
                            Cargar texto para prensa
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              );
            })}
          </section>
        </>
      )}

      {vista === "crearSolicitud" && (
        <>
          <section className="screenHeader">
            <p className="eyebrow">Ficha estandarizada</p>
            <h2>Cargar solicitud educativa</h2>
            <p>
              Esta ficha inicia el circuito. El equipo educativo la verá completa antes de
              crear la propuesta.
            </p>
          </section>

          <form className="formPanel" onSubmit={crearSolicitud}>
            <label>
              Área solicitante
              <select
                value={
                  rol === "museo"
                    ? "Museo"
                    : rol === "bioparque"
                    ? "Bioparque"
                    : solicitudForm.area
                }
                disabled={rol === "museo" || rol === "bioparque"}
                onChange={(e) =>
                  setSolicitudForm({ ...solicitudForm, area: e.target.value })
                }
              >
                <option>Museo</option>
                <option>Bioparque</option>
                <option>Integrada</option>
              </select>
            </label>

            <label>
              Título de la solicitud
              <input
                value={solicitudForm.titulo}
                onChange={(e) =>
                  setSolicitudForm({ ...solicitudForm, titulo: e.target.value })
                }
                placeholder="Ej: Taller de fósiles para visita escolar"
              />
            </label>

            <label>
              Público destinatario
              <input
                value={solicitudForm.publico}
                onChange={(e) =>
                  setSolicitudForm({ ...solicitudForm, publico: e.target.value })
                }
                placeholder="Escuela, centro de día, público general..."
              />
            </label>

            <label>
              Edad aproximada
              <input
                value={solicitudForm.edad}
                onChange={(e) =>
                  setSolicitudForm({ ...solicitudForm, edad: e.target.value })
                }
                placeholder="Ej: 6 a 8 años"
              />
            </label>

            <label>
              Cantidad estimada
              <input
                value={solicitudForm.cantidad}
                onChange={(e) =>
                  setSolicitudForm({ ...solicitudForm, cantidad: e.target.value })
                }
                placeholder="Ej: 30 participantes"
              />
            </label>

            <label>
              Fecha tentativa
              <input
                value={solicitudForm.fecha}
                onChange={(e) =>
                  setSolicitudForm({ ...solicitudForm, fecha: e.target.value })
                }
                placeholder="Ej: Semana posterior a vacaciones"
              />
            </label>

            <label>
              Espacio
              <input
                value={solicitudForm.espacio}
                onChange={(e) =>
                  setSolicitudForm({ ...solicitudForm, espacio: e.target.value })
                }
                placeholder="Museo, Bioparque, Domo, sendero..."
              />
            </label>

            <label>
              Tipo de propuesta esperada
              <select
                value={solicitudForm.tipo}
                onChange={(e) =>
                  setSolicitudForm({ ...solicitudForm, tipo: e.target.value })
                }
              >
                <option>Taller</option>
                <option>Recorrido</option>
                <option>Actividad breve</option>
                <option>Estación educativa</option>
                <option>Juego / dinámica</option>
                <option>Actividad integrada</option>
              </select>
            </label>

            <label>
              Objetivo de la solicitud
              <textarea
                value={solicitudForm.objetivo}
                onChange={(e) =>
                  setSolicitudForm({ ...solicitudForm, objetivo: e.target.value })
                }
                placeholder="Qué se busca lograr con la actividad"
              />
            </label>

            <label>
              Recursos disponibles
              <textarea
                value={solicitudForm.recursos}
                onChange={(e) =>
                  setSolicitudForm({ ...solicitudForm, recursos: e.target.value })
                }
                placeholder="Materiales, espacios, personal, equipamiento disponible..."
              />
            </label>

            <label>
              Criterios u observaciones
              <textarea
                value={solicitudForm.criterios}
                onChange={(e) =>
                  setSolicitudForm({ ...solicitudForm, criterios: e.target.value })
                }
                placeholder="Duración, tono, límites, cuidados, condiciones..."
              />
            </label>

            <label>
              Fecha límite para presentar propuesta
              <input
                value={solicitudForm.limite}
                onChange={(e) =>
                  setSolicitudForm({ ...solicitudForm, limite: e.target.value })
                }
                placeholder="Ej: Viernes 12 hs"
              />
            </label>

            <button>Publicar solicitud</button>
          </form>
        </>
      )}

      {vista === "crearPropuestaPropia" && (
        <>
          <section className="screenHeader">
            <p className="eyebrow">Equipo educativo</p>
            <h2>Crear propuesta propia</h2>
            <p>
              Esta propuesta no nace de una solicitud previa. Se envía directamente a revisión
              para solicitud previa. Se envía directamente que pueda ser evaluada por la coordinación correspondiente.
            </p>
          </section>

          <div className="layout">
            <form className="formPanel" onSubmit={crearPropuestaPropia}>
              <label>
                Área sugerida
                <select
                  value={solicitudForm.area}
                  onChange={(e) =>
                    setSolicitudForm({ ...solicitudForm, area: e.target.value })
                  }
                >
                  <option>Museo</option>
                  <option>Bioparque</option>
                  <option>Integrada</option>
                </select>
              </label>

              <label>
                Nombre de la propuesta
                <input
                  value={propuestaForm.nombre}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, nombre: e.target.value })
                  }
                  placeholder="Ej: Exploradores del Museo"
                />
              </label>

              <label>
                Responsable / equipo
                <input
                  value={propuestaForm.responsable}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, responsable: e.target.value })
                  }
                  placeholder="Quién la propone o coordina"
                />
              </label>

              <label>
                Público destinatario
                <input
                  value={solicitudForm.publico}
                  onChange={(e) =>
                    setSolicitudForm({ ...solicitudForm, publico: e.target.value })
                  }
                  placeholder="Escuelas, infancias, familias, jóvenes, instituciones..."
                />
              </label>

              <label>
                Edad aproximada
                <input
                  value={solicitudForm.edad}
                  onChange={(e) =>
                    setSolicitudForm({ ...solicitudForm, edad: e.target.value })
                  }
                  placeholder="Ej: 6 a 10 años"
                />
              </label>

              <label>
                Cantidad estimada
                <input
                  value={solicitudForm.cantidad}
                  onChange={(e) =>
                    setSolicitudForm({ ...solicitudForm, cantidad: e.target.value })
                  }
                  placeholder="Ej: 25 participantes"
                />
              </label>

              <label>
                Fecha tentativa
                <input
                  value={solicitudForm.fecha}
                  onChange={(e) =>
                    setSolicitudForm({ ...solicitudForm, fecha: e.target.value })
                  }
                  placeholder="Ej: A definir"
                />
              </label>

              <label>
                Espacio sugerido
                <input
                  value={solicitudForm.espacio}
                  onChange={(e) =>
                    setSolicitudForm({ ...solicitudForm, espacio: e.target.value })
                  }
                  placeholder="Museo, Bioparque, Domo, sendero, sala..."
                />
              </label>

              <label>
                Tipo de propuesta
                <select
                  value={solicitudForm.tipo}
                  onChange={(e) =>
                    setSolicitudForm({ ...solicitudForm, tipo: e.target.value })
                  }
                >
                  <option>Taller</option>
                  <option>Recorrido</option>
                  <option>Actividad breve</option>
                  <option>Estación educativa</option>
                  <option>Juego / dinámica</option>
                  <option>Actividad integrada</option>
                </select>
              </label>

              <label>
                Objetivo de la actividad
                <textarea
                  value={propuestaForm.objetivo}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, objetivo: e.target.value })
                  }
                />
              </label>

              <label>
                Inicio
                <textarea
                  value={propuestaForm.inicio}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, inicio: e.target.value })
                  }
                />
              </label>

              <label>
                Desarrollo
                <textarea
                  value={propuestaForm.desarrollo}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, desarrollo: e.target.value })
                  }
                />
              </label>

              <label>
                Cierre
                <textarea
                  value={propuestaForm.cierre}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, cierre: e.target.value })
                  }
                />
              </label>

              <label>
                Materiales necesarios
                <textarea
                  value={propuestaForm.materiales}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, materiales: e.target.value })
                  }
                />
              </label>

              <label>
                Duración estimada
                <input
                  value={propuestaForm.duracion}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, duracion: e.target.value })
                  }
                />
              </label>

              <label>
                Adaptaciones posibles
                <textarea
                  value={propuestaForm.adaptaciones}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, adaptaciones: e.target.value })
                  }
                />
              </label>

              <label>
                Necesidades para avanzar
                <textarea
                  value={propuestaForm.necesidades}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, necesidades: e.target.value })
                  }
                />
              </label>

              <label>
                Cuestiones a resolver
                <textarea
                  value={propuestaForm.cuestiones}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, cuestiones: e.target.value })
                  }
                />
              </label>

              <button>Enviar propuesta a revisión</button>
            </form>

            <section className="formPanel">
              <div className="nota">
                <strong>Cómo entra al circuito</strong>
                <p>
                  Al enviarla, la propuesta pasa directamente a la columna <b>En revisión</b>.
                  Desde ahí puede ser aprobada, enviada a revisión o desestimada.
                </p>
              </div>

              <div className="alerta">
                <strong>Importante</strong>
                <p>
                  Esta opción no reemplaza las solicitudes de coordinación. Sirve para que el
                  equipo educativo pueda proponer nuevas actividades de manera ordenada.
                </p>
              </div>
            </section>
          </div>
        </>
      )}

      {vista === "cargarPropuesta" && seleccionado && (
        <>
          <section className="screenHeader">
            <p className="eyebrow">Equipo educativo</p>
            <h2>Cargar actividad</h2>
            <p>{seleccionado.solicitud.titulo}</p>
          </section>

          <div className="layout">
            <section className="formPanel">
              <div className="nota">
                <strong>Ficha cargada por coordinación</strong>
                <p><b>Área:</b> {seleccionado.solicitud.area}</p>
                <p><b>Público:</b> {seleccionado.solicitud.publico}</p>
                <p><b>Edad:</b> {seleccionado.solicitud.edad}</p>
                <p><b>Cantidad:</b> {seleccionado.solicitud.cantidad}</p>
                <p><b>Fecha:</b> {seleccionado.solicitud.fecha}</p>
                <p><b>Espacio:</b> {seleccionado.solicitud.espacio}</p>
                <p><b>Objetivo:</b> {seleccionado.solicitud.objetivo}</p>
                <p><b>Recursos:</b> {seleccionado.solicitud.recursos}</p>
                <p><b>Criterios:</b> {seleccionado.solicitud.criterios}</p>
              </div>

              {seleccionado.evaluacion?.resultado === "Revisión" && (
                <div className="alerta">
                  <strong>Correcciones solicitadas</strong>
                  <p>{seleccionado.evaluacion.observaciones}</p>
                </div>
              )}
            </section>

            <form className="formPanel" onSubmit={enviarPropuesta}>
              <label>
                Nombre de la actividad
                <input
                  value={propuestaForm.nombre}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, nombre: e.target.value })
                  }
                />
              </label>

              <label>
                Responsable / equipo
                <input
                  value={propuestaForm.responsable}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, responsable: e.target.value })
                  }
                />
              </label>

              <label>
                Objetivo de la actividad
                <textarea
                  value={propuestaForm.objetivo}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, objetivo: e.target.value })
                  }
                />
              </label>

              <label>
                Inicio
                <textarea
                  value={propuestaForm.inicio}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, inicio: e.target.value })
                  }
                />
              </label>

              <label>
                Desarrollo
                <textarea
                  value={propuestaForm.desarrollo}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, desarrollo: e.target.value })
                  }
                />
              </label>

              <label>
                Cierre
                <textarea
                  value={propuestaForm.cierre}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, cierre: e.target.value })
                  }
                />
              </label>

              <label>
                Materiales necesarios
                <textarea
                  value={propuestaForm.materiales}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, materiales: e.target.value })
                  }
                />
              </label>

              <label>
                Duración estimada
                <input
                  value={propuestaForm.duracion}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, duracion: e.target.value })
                  }
                />
              </label>

              <label>
                Adaptaciones posibles
                <textarea
                  value={propuestaForm.adaptaciones}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, adaptaciones: e.target.value })
                  }
                />
              </label>

              <label>
                Necesidades para avanzar
                <textarea
                  value={propuestaForm.necesidades}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, necesidades: e.target.value })
                  }
                />
              </label>

              <label>
                Cuestiones a resolver
                <textarea
                  value={propuestaForm.cuestiones}
                  onChange={(e) =>
                    setPropuestaForm({ ...propuestaForm, cuestiones: e.target.value })
                  }
                />
              </label>

              <div className="acciones">
                <button type="button" className="secundario" onClick={guardarBorradorPropuesta}>
                  Guardar borrador
                </button>
                <button>Enviar a evaluación</button>
              </div>
            </form>
          </div>
        </>
      )}

      {vista === "evaluacion" && seleccionado && (
        <>
          <section className="screenHeader">
            <p className="eyebrow">Coordinación</p>
            <h2>Evaluar propuesta</h2>
            <p>{seleccionado.solicitud.titulo}</p>
          </section>

          <div className="layout">
            <section className="formPanel">
              <div className="nota">
                <strong>Solicitud original</strong>
                <p>{seleccionado.solicitud.objetivo}</p>
              </div>

              <div className="nota">
                <strong>Propuesta del educativo</strong>
                <p><b>Nombre:</b> {seleccionado.propuesta?.nombre}</p>
                <p><b>Responsable:</b> {seleccionado.propuesta?.responsable}</p>
                <p><b>Objetivo:</b> {seleccionado.propuesta?.objetivo}</p>
                <p><b>Inicio:</b> {seleccionado.propuesta?.inicio}</p>
                <p><b>Desarrollo:</b> {seleccionado.propuesta?.desarrollo}</p>
                <p><b>Cierre:</b> {seleccionado.propuesta?.cierre}</p>
                <p><b>Materiales:</b> {seleccionado.propuesta?.materiales}</p>
                <p><b>Duración:</b> {seleccionado.propuesta?.duracion}</p>
                <p><b>Adaptaciones:</b> {seleccionado.propuesta?.adaptaciones}</p>
                <p><b>Necesidades:</b> {seleccionado.propuesta?.necesidades}</p>
                <p><b>Cuestiones a resolver:</b> {seleccionado.propuesta?.cuestiones}</p>
              </div>
            </section>

            <section className="formPanel">
              <label>
                Observaciones para revisión
                <textarea
                  value={observacionesRevision}
                  onChange={(e) => setObservacionesRevision(e.target.value)}
                />
              </label>

              <label>
                Motivo si se desestima
                <textarea
                  value={motivoDesestimacion}
                  onChange={(e) => setMotivoDesestimacion(e.target.value)}
                />
              </label>

              <div className="acciones">
                <button type="button" onClick={aprobarPropuesta}>Aprobar</button>
                <button type="button" className="secundario" onClick={devolverRevision}>
                  Enviar a revisión
                </button>
                <button type="button" className="secundario" onClick={desestimar}>
                  Desestimar
                </button>
              </div>
            </section>
          </div>
        </>
      )}

      {vista === "documentoFinal" && seleccionado && (
        <>
          <section className="screenHeader">
            <p className="eyebrow">Propuesta aprobada</p>
            <h2>Documento final e insumos</h2>
            <p>
              Documento estandarizado generado a partir de la solicitud y la propuesta aprobada.
            </p>
          </section>

          <div className="layout">
            <section className="formPanel">
              <div className="documentBox">
                <pre>{generarDocumento(seleccionado)}</pre>
              </div>

              <button type="button" onClick={copiarDocumento}>
                Copiar documento
              </button>
            </section>

            <form className="formPanel" onSubmit={guardarDocumentoEInsumos}>
              <label>
                Solicitud de insumos
                <textarea
                  value={insumosForm.descripcion}
                  onChange={(e) =>
                    setInsumosForm({ ...insumosForm, descripcion: e.target.value })
                  }
                  placeholder="Materiales, cantidades, impresiones, sonido, espacios, personal..."
                />
              </label>

              <label>
                Responsable de gestionar el pedido
                <input
                  value={insumosForm.responsable}
                  onChange={(e) =>
                    setInsumosForm({ ...insumosForm, responsable: e.target.value })
                  }
                  placeholder="Nombre o área responsable"
                />
              </label>

              <button>Guardar y pasar a insumos</button>
            </form>
          </div>
        </>
      )}

      {vista === "publicacionForm" && seleccionado && (
        <>
          <section className="screenHeader">
            <p className="eyebrow">Publicación</p>
            <h2>Texto para prensa</h2>
            <p>
              Esta información puede enviarse al área de prensa para elaborar la gacetilla.
            </p>
          </section>

          <form className="formPanel" onSubmit={guardarPublicacion}>
            <label>
              Título sugerido
              <input
                value={prensaForm.titulo}
                onChange={(e) =>
                  setPrensaForm({ ...prensaForm, titulo: e.target.value })
                }
              />
            </label>

            <label>
              Texto informativo para prensa
              <textarea
                value={prensaForm.texto}
                onChange={(e) =>
                  setPrensaForm({ ...prensaForm, texto: e.target.value })
                }
              />
            </label>

            <button>Guardar publicación y pasar a propuestas listas</button>
          </form>
        </>
      )}

      {vista === "cuestiones" && (
        <>
          <section className="screenHeader">
            <p className="eyebrow">Equipo educativo</p>
            <h2>Cuestiones a resolver</h2>
            <p>
              Registro de dudas, necesidades o condiciones cargadas durante la creación de propuestas.
            </p>
          </section>

          <section className="itemsList">
            {cuestionesPendientes.length === 0 && (
              <div className="formPanel">No hay cuestiones cargadas.</div>
            )}

            {cuestionesPendientes.map((item) => (
              <article className="tarjetaLista" key={item.id}>
                <h3>{item.solicitud.titulo}</h3>
                <p>{item.propuesta.cuestiones}</p>
                <small>Área: {item.area}</small>
              </article>
            ))}
          </section>
        </>
      )}

      {vista === "listas" && (
        <>
          <section className="screenHeader">
            <p className="eyebrow">Propuestas vigentes</p>
            <h2>Propuestas listas</h2>
            <p>
              Acá quedan las propuestas ya publicadas. Cada box abre un documento listo para imprimir
              con una estética unificada.
            </p>
          </section>

          <section className="readyGrid">
            {listas.length === 0 && (
              <div className="formPanel">Todavía no hay propuestas listas.</div>
            )}

            {listas.map((item) => (
              <button
                key={item.id}
                className="readyCard"
                onClick={() => abrirPropuestaLista(item)}
              >
                <div className="readyIcon">{iconoTipo(item.solicitud.tipo)}</div>

                <div className="readyContent">
                  <strong>{item.propuesta?.nombre || item.solicitud.titulo}</strong>
                  <small>{item.area}</small>
                  <small>{item.solicitud.titulo}</small>
                </div>

                <span className="readyArrow">→</span>
              </button>
            ))}
          </section>
        </>
      )}

      {vista === "documentoLista" && seleccionado && (
        <>
          <section className="screenHeader noPrint">
            <p className="eyebrow">Documento imprimible</p>
            <h2>{seleccionado.propuesta?.nombre || seleccionado.solicitud.titulo}</h2>
            <p>
              Documento final de propuesta aprobada, con insumos y texto para gacetilla.
            </p>

            <div className="acciones">
              <button type="button" onClick={imprimirDocumento}>
                Imprimir / guardar PDF
              </button>

              <button type="button" onClick={descargarDocumentoHtml}>
                Descargar documento
              </button>

              <button type="button" className="secundario" onClick={copiarDocumento}>
                Copiar contenido
              </button>

              <button type="button" className="secundario" onClick={() => setVista("listas")}>
                Volver a propuestas listas
              </button>
            </div>
          </section>

          <section className="printSheet">
            <div className="docHero">
              <div className="docHeroLeft">
                <img
                  className="docLogo"
                  src="/logo-la-maxima.png"
                  alt="La Máxima Polo Educativo y Recreativo"
                />
              </div>

              <div className="docHeroRight">
                <p className="docKicker">Propuesta aprobada</p>
                <h2>{seleccionado.propuesta?.nombre || seleccionado.solicitud.titulo}</h2>
                <p>
                  Documento final de actividad vigente. Incluye la propuesta educativa aprobada,
                  la organización operativa, los insumos necesarios y la información base para
                  comunicación institucional.
                </p>

                <div className="docMetaGrid">
                  <div>
                    <span>Área</span>
                    <strong>{seleccionado.area}</strong>
                  </div>

                  <div>
                    <span>Tipo</span>
                    <strong>{seleccionado.solicitud.tipo || "Sin definir"}</strong>
                  </div>

                  <div>
                    <span>Público</span>
                    <strong>{seleccionado.solicitud.publico || "Sin definir"}</strong>
                  </div>

                  <div>
                    <span>Duración</span>
                    <strong>{seleccionado.propuesta?.duracion || "Sin definir"}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="docMainGrid">
              <DocSection number="01" title="Nombre de la actividad" featured>
                <p>{seleccionado.propuesta?.nombre || seleccionado.solicitud.titulo}</p>
              </DocSection>

              <DocSection number="02" title="Responsable / equipo">
                <p>{seleccionado.propuesta?.responsable || "Sin responsable cargado"}</p>
              </DocSection>

              <DocSection number="03" title="Público destinatario">
                <p>{seleccionado.solicitud.publico || "Sin definir"}</p>
                <p><b>Edad:</b> {seleccionado.solicitud.edad || "Sin definir"}</p>
                <p><b>Cupo:</b> {seleccionado.solicitud.cantidad || "Sin definir"}</p>
              </DocSection>

              <DocSection number="04" title="Objetivo de la actividad" wide>
                <p>{seleccionado.propuesta?.objetivo || "Sin objetivo cargado."}</p>
              </DocSection>

              <DocSection number="05" title="Inicio" wide>
                <p>{seleccionado.propuesta?.inicio || "Sin inicio cargado."}</p>
              </DocSection>

              <DocSection number="06" title="Desarrollo" wide>
                <p>{seleccionado.propuesta?.desarrollo || "Sin desarrollo cargado."}</p>
              </DocSection>

              <DocSection number="07" title="Cierre" wide>
                <p>{seleccionado.propuesta?.cierre || "Sin cierre cargado."}</p>
              </DocSection>

              <DocSection number="08" title="Espacio, fecha y duración">
                <p><b>Espacio:</b> {seleccionado.solicitud.espacio || "Sin definir"}</p>
                <p><b>Fecha tentativa:</b> {seleccionado.solicitud.fecha || "Sin definir"}</p>
                <p><b>Duración:</b> {seleccionado.propuesta?.duracion || "Sin definir"}</p>
              </DocSection>

              <DocSection number="09" title="Materiales de la actividad">
                <p>{seleccionado.propuesta?.materiales || "Sin materiales cargados."}</p>
              </DocSection>

              <DocSection number="10" title="Solicitud de insumos">
                <p><b>Pedido:</b> {seleccionado.insumos?.descripcion || "Sin insumos cargados."}</p>
                <p><b>Responsable:</b> {seleccionado.insumos?.responsable || "Sin definir"}</p>
                <p><b>Estado:</b> {seleccionado.insumos?.estado || "Sin definir"}</p>
              </DocSection>

              <DocSection number="11" title="Logística necesaria">
                <p>{seleccionado.propuesta?.necesidades || "No se registraron necesidades logísticas."}</p>
              </DocSection>

              <DocSection number="12" title="Inclusión y adaptaciones">
                <p>{seleccionado.propuesta?.adaptaciones || "Sin adaptaciones cargadas."}</p>
              </DocSection>

              <DocSection number="13" title="Cuestiones a resolver">
                <p>{seleccionado.propuesta?.cuestiones || "Sin cuestiones pendientes registradas."}</p>
              </DocSection>

              <DocSection number="14" title="Información para prensa" press>
                <p><b>{seleccionado.prensa?.titulo || "Sin título cargado"}</b></p>
                <p>{seleccionado.prensa?.texto || "Sin texto informativo cargado."}</p>
              </DocSection>
            </div>

            <footer className="docFooter">
              <strong>LA MÁXIMA</strong>
              <span>Polo Educativo y Recreativo · Propuesta aprobada</span>
            </footer>
          </section>
        </>
      )}
    </main>
  );
}

function DocSection({ number, title, children, featured, wide, press }) {
  const className = [
    "docSection",
    featured ? "featured" : "",
    wide ? "wide" : "",
    press ? "press" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={className}>
      <div className="docNumber">{number}</div>
      <div>
        <h3>{title}</h3>
        {children}
      </div>
    </article>
  );
}

function ModuloPendiente({ titulo }) {
  return (
    <section className="screenHeader">
      <p className="eyebrow">Módulo en preparación</p>
      <h2>{titulo}</h2>
      <p>Este módulo queda reservado para una próxima etapa.</p>
    </section>
  );
}

function iconoTipo(tipo) {
  if (tipo === "Taller") return "🧪";
  if (tipo === "Recorrido") return "🚶";
  if (tipo === "Actividad breve") return "⚡";
  if (tipo === "Estación educativa") return "🧩";
  if (tipo === "Juego / dinámica") return "🎯";
  return "🌿";
}

function limpiarNombreArchivo(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generarDocumento(item) {
  return `PROPUESTA EDUCATIVA VIGENTE

ÁREA
${item.area}

PROPUESTA EDUCATIVA APROBADA
Nombre: ${item.propuesta?.nombre || ""}
Responsable: ${item.propuesta?.responsable || ""}
Público: ${item.solicitud.publico || ""}
Edad: ${item.solicitud.edad || ""}
Cupo: ${item.solicitud.cantidad || ""}
Espacio: ${item.solicitud.espacio || ""}
Fecha tentativa: ${item.solicitud.fecha || ""}
Tipo de propuesta: ${item.solicitud.tipo || ""}
Duración: ${item.propuesta?.duracion || ""}

OBJETIVO
${item.propuesta?.objetivo || ""}

SECUENCIA
Inicio: ${item.propuesta?.inicio || ""}
Desarrollo: ${item.propuesta?.desarrollo || ""}
Cierre: ${item.propuesta?.cierre || ""}

MATERIALES DE LA ACTIVIDAD
${item.propuesta?.materiales || ""}

LOGÍSTICA / NECESIDADES
${item.propuesta?.necesidades || ""}

INCLUSIÓN Y ADAPTACIONES
${item.propuesta?.adaptaciones || ""}

CUESTIONES A RESOLVER
${item.propuesta?.cuestiones || ""}

INSUMOS
Pedido: ${item.insumos?.descripcion || ""}
Responsable: ${item.insumos?.responsable || ""}
Estado: ${item.insumos?.estado || ""}

GACETILLA / PRENSA
Título sugerido: ${item.prensa?.titulo || ""}
Texto informativo: ${item.prensa?.texto || ""}
Estado: ${item.prensa?.estado || ""}`;
}
function esc(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function generarHtmlDocumento(item) {
  const nombre = esc(item.propuesta?.nombre || item.solicitud.titulo);
  const area = esc(item.area);
  const tipo = esc(item.solicitud.tipo);
  const publico = esc(item.solicitud.publico);
  const duracion = esc(item.propuesta?.duracion || "Sin definir");
  const logoSrc = `${window.location.origin}/logo-la-maxima.png`;

  const section = (number, title, body, extraClass = "") => `
    <article class="docSection ${extraClass}">
      <div class="docNumber">${number}</div>
      <div>
        <h3>${esc(title)}</h3>
        ${body}
      </div>
    </article>
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${nombre}</title>
<style>
  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 28px;
    background: #090909;
    color: #f7f7f7;
    font-family: Inter, "Segoe UI", Arial, sans-serif;
  }

  .printSheet {
    max-width: 1120px;
    margin: 0 auto;
    background:
      radial-gradient(circle at 15% 5%, rgba(240,196,25,0.18), transparent 26%),
      linear-gradient(145deg, #111111, #050505);
    color: #f7f7f7;
    border-radius: 34px;
    padding: 30px;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 24px 70px rgba(0,0,0,0.45);
    overflow: hidden;
  }

  .docHero {
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
    gap: 30px;
    align-items: center;
    margin-bottom: 26px;
    min-height: 330px;
  }

  .docHeroLeft {
    display: grid;
    place-items: center;
    min-height: 280px;
    border-radius: 30px;
    background:
      radial-gradient(circle at center, rgba(240,196,25,0.12), transparent 58%),
      linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015));
    border: 1px solid rgba(255,255,255,0.08);
  }

  .docLogo {
    width: min(100%, 520px);
    max-height: 220px;
    object-fit: contain;
    filter:
      drop-shadow(0 22px 35px rgba(0,0,0,0.45))
      drop-shadow(0 0 18px rgba(240,196,25,0.12));
  }

  .docKicker {
    margin: 0 0 10px;
    color: #f0c419;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-size: 0.78rem;
    font-weight: 900;
  }

  .docHeroRight h2 {
    margin: 0 0 14px;
    color: white;
    font-size: clamp(2.6rem, 6vw, 5rem);
    line-height: 0.9;
    letter-spacing: -0.07em;
  }

  .docHeroRight p {
    color: rgba(255,255,255,0.72);
    line-height: 1.6;
    max-width: 620px;
  }

  .docMetaGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin-top: 24px;
  }

  .docMetaGrid div {
    border-radius: 20px;
    padding: 16px;
    background: linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025));
    border: 1px solid rgba(255,255,255,0.08);
  }

  .docMetaGrid span {
    display: block;
    margin-bottom: 6px;
    color: #f0c419;
    font-size: 0.75rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .docMetaGrid strong {
    display: block;
    color: white;
    line-height: 1.25;
  }

  .docMainGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .docSection {
    display: grid;
    grid-template-columns: 58px 1fr;
    gap: 14px;
    padding: 17px;
    border-radius: 24px;
    background: linear-gradient(145deg, rgba(255,255,255,0.065), rgba(255,255,255,0.025));
    border: 1px solid rgba(255,255,255,0.08);
    break-inside: avoid;
  }

  .docSection.featured,
  .docSection.wide,
  .docSection.press {
    grid-column: 1 / -1;
  }

  .docSection.press {
    background:
      linear-gradient(145deg, rgba(240,196,25,0.12), rgba(255,255,255,0.025));
  }

  .docNumber {
    width: 58px;
    height: 58px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    background: rgba(240,196,25,0.16);
    color: #f0c419;
    font-size: 1.1rem;
    font-weight: 900;
  }

  .docSection h3 {
    margin: 0 0 8px;
    color: #ffffff;
    font-size: 1rem;
  }

  .docSection p {
    margin: 0 0 7px;
    color: rgba(255,255,255,0.76);
    line-height: 1.5;
    font-size: 0.9rem;
  }

  .docFooter {
    margin-top: 24px;
    padding-top: 18px;
    border-top: 1px solid rgba(255,255,255,0.1);
    display: flex;
    justify-content: space-between;
    gap: 14px;
    color: rgba(255,255,255,0.65);
    font-size: 0.9rem;
  }

  .docFooter strong {
    color: #f0c419;
  }

  @media print {
    body {
      padding: 0;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .printSheet {
      max-width: none;
      min-height: 100vh;
      border-radius: 0;
      border: 0;
      box-shadow: none;
    }
  }
</style>
</head>
<body>
  <section class="printSheet">
    <div class="docHero">
      <div class="docHeroLeft">
        <img class="docLogo" src="${logoSrc}" alt="La Máxima Polo Educativo y Recreativo" />
      </div>

      <div class="docHeroRight">
        <p class="docKicker">Propuesta aprobada</p>
        <h2>${nombre}</h2>
        <p>Documento final de actividad vigente. Incluye la propuesta educativa aprobada, la organización operativa, los insumos necesarios y la información base para comunicación institucional.</p>

        <div class="docMetaGrid">
          <div><span>Área</span><strong>${area}</strong></div>
          <div><span>Tipo</span><strong>${tipo}</strong></div>
          <div><span>Público</span><strong>${publico}</strong></div>
          <div><span>Duración</span><strong>${duracion}</strong></div>
        </div>
      </div>
    </div>

    <div class="docMainGrid">
      ${section("01", "Nombre de la actividad", `<p>${nombre}</p>`, "featured")}
      ${section("02", "Responsable / equipo", `<p>${esc(item.propuesta?.responsable || "Sin responsable cargado")}</p>`)}
      ${section("03", "Público destinatario", `<p>${esc(item.solicitud.publico || "Sin definir")}</p><p><b>Edad:</b> ${esc(item.solicitud.edad || "Sin definir")}</p><p><b>Cupo:</b> ${esc(item.solicitud.cantidad || "Sin definir")}</p>`)}
      ${section("04", "Objetivo de la actividad", `<p>${esc(item.propuesta?.objetivo || "Sin objetivo cargado.")}</p>`, "wide")}
      ${section("05", "Inicio", `<p>${esc(item.propuesta?.inicio || "Sin inicio cargado.")}</p>`, "wide")}
      ${section("06", "Desarrollo", `<p>${esc(item.propuesta?.desarrollo || "Sin desarrollo cargado.")}</p>`, "wide")}
      ${section("07", "Cierre", `<p>${esc(item.propuesta?.cierre || "Sin cierre cargado.")}</p>`, "wide")}
      ${section("08", "Espacio, fecha y duración", `<p><b>Espacio:</b> ${esc(item.solicitud.espacio || "Sin definir")}</p><p><b>Fecha tentativa:</b> ${esc(item.solicitud.fecha || "Sin definir")}</p><p><b>Duración:</b> ${esc(item.propuesta?.duracion || "Sin definir")}</p>`)}
      ${section("09", "Materiales de la actividad", `<p>${esc(item.propuesta?.materiales || "Sin materiales cargados.")}</p>`)}
      ${section("10", "Solicitud de insumos", `<p><b>Pedido:</b> ${esc(item.insumos?.descripcion || "Sin insumos cargados.")}</p><p><b>Responsable:</b> ${esc(item.insumos?.responsable || "Sin definir")}</p><p><b>Estado:</b> ${esc(item.insumos?.estado || "Sin definir")}</p>`)}
      ${section("11", "Logística necesaria", `<p>${esc(item.propuesta?.necesidades || "No se registraron necesidades logísticas.")}</p>`)}
      ${section("12", "Inclusión y adaptaciones", `<p>${esc(item.propuesta?.adaptaciones || "Sin adaptaciones cargadas.")}</p>`)}
      ${section("13", "Cuestiones a resolver", `<p>${esc(item.propuesta?.cuestiones || "Sin cuestiones pendientes registradas.")}</p>`)}
      ${section("14", "Información para prensa", `<p><b>${esc(item.prensa?.titulo || "Sin título cargado")}</b></p><p>${esc(item.prensa?.texto || "Sin texto informativo cargado.")}</p>`, "press")}
    </div>

    <footer class="docFooter">
      <strong>LA MÁXIMA</strong>
      <span>Polo Educativo y Recreativo · Propuesta aprobada</span>
    </footer>
  </section>
</body>
</html>`;
}
export default App;


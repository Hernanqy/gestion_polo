import { supabase } from "./supabaseClient";

export async function cargarPerfil() {
  const { data, error } = await supabase
    .from("profiles")
    .select("nombre, role, area")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function cargarPropuestas() {
  const { data, error } = await supabase
    .from("propuestas")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(rowToItem);
}

export async function guardarPropuestasModificadas(items) {
  if (!items || items.length === 0) {
    return;
  }

  const rows = items.map(itemToRow);

  const { error } = await supabase
    .from("propuestas")
    .upsert(rows, { onConflict: "id" });

  if (error) throw error;
}

function itemToRow(item) {
  return {
    id: item.id,
    etapa: item.etapa,
    modo: item.modo || null,
    area: item.area,
    solicita: item.solicita || null,
    solicitud: item.solicitud || {},
    propuesta: item.propuesta || null,
    evaluacion: item.evaluacion || null,
    insumos: item.insumos || {},
    prensa: item.prensa || {},
  };
}

function rowToItem(row) {
  return {
    id: row.id,
    etapa: row.etapa,
    modo: row.modo,
    area: row.area,
    solicita: row.solicita,
    solicitud: row.solicitud || {},
    propuesta: row.propuesta || null,
    evaluacion: row.evaluacion || null,
    insumos: row.insumos || {},
    prensa: row.prensa || {},
  };
}

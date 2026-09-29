// Prepara un objeto para enviarlo al backend (.NET):
// - Convierte "" a null en fechas y números (evita 400 al deserializar DateTime?/int?).
// - Quita colecciones de navegación que el PUT no necesita.
export const limpiarPayload = (obj, { fechas = [], numeros = [], omitir = [] } = {}) => {
  const data = { ...obj };
  fechas.forEach((k) => {
    if (data[k] === "" || data[k] === undefined) data[k] = null;
  });
  numeros.forEach((k) => {
    data[k] = data[k] === "" || data[k] === null || data[k] === undefined ? null : Number(data[k]);
  });
  omitir.forEach((k) => delete data[k]);
  return data;
};

export const aLista = (data) => (Array.isArray(data) ? data : data?.$values ?? []);

export const descargarBlob = (blob, nombre) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

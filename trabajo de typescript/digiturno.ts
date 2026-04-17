export {};
// ============================================================
//  SIMULACIÓN 4 — DIGITURNO
//  TypeScript estricto — Compatible con Bun
// ============================================================

// ── TIPOS (unión de literales — práctica 2026) ────────────────
type TipoTurno   = "Normal" | "Preferencial";
type EstadoTurno = "Esperando" | "En atención" | "Atendido";

interface Modulo {
  readonly id:          number;
  readonly nombre:      string;
  disponible:           boolean;
  readonly atiendeTipo: TipoTurno[];
}

interface Turno {
  readonly codigo:      string;
  readonly nombre:      string;
  readonly tipo:        TipoTurno;
  readonly horaLlegada: string;
  estado:               EstadoTurno;
  horaFin?:             string;       // opcional: solo existe al finalizar
}

// ── DATOS ────────────────────────────────────────────────────

const modulos: Modulo[] = [
  { id: 1, nombre: "Caja 1",      disponible: true,  atiendeTipo: ["Normal", "Preferencial"] },
  { id: 2, nombre: "Caja 2",      disponible: true,  atiendeTipo: ["Normal"]                 },
  { id: 3, nombre: "Información", disponible: false, atiendeTipo: ["Normal", "Preferencial"] },
];

let cola:               Turno[] = [];
let historialAtendidos: Turno[] = [];

let contadorNormal       = 0;
let contadorPreferencial = 0;

// ── UTILIDADES ───────────────────────────────────────────────

const horaActual = (): string => new Date().toLocaleTimeString("es-CO");

const generarCodigoTurno = (tipo: TipoTurno): string => {
  if (tipo === "Preferencial") {
    contadorPreferencial++;
    return `P-${String(contadorPreferencial).padStart(3, "0")}`;
  }
  contadorNormal++;
  return `N-${String(contadorNormal).padStart(3, "0")}`;
};

// ── 1. ASIGNAR TURNO ─────────────────────────────────────────
const asignarTurno = (nombre: string, tipo: TipoTurno = "Normal"): void => {
  const nuevoTurno: Turno = {
    codigo:      generarCodigoTurno(tipo),
    nombre,
    tipo,
    horaLlegada: horaActual(),
    estado:      "Esperando",
    // horaFin no se asigna aquí (campo opcional)
  };

  cola.push(nuevoTurno);

  console.log(`\n🎫 Turno asignado:`);
  console.log(`   Código   : ${nuevoTurno.codigo}`);
  console.log(`   Persona  : ${nombre}`);
  console.log(`   Tipo     : ${tipo}`);
  console.log(`   Posición : ${cola.length} en la fila`);
  console.log(`   Hora     : ${nuevoTurno.horaLlegada}\n`);
};

// ── 2. LLAMAR SIGUIENTE ──────────────────────────────────────
const llamarSiguiente = (idModulo: number): void => {
  const modulo = modulos.find((m) => m.id === idModulo);

  if (modulo === undefined) {
    console.log(`❌ Módulo ${idModulo} no existe.`);
    return;
  }
  if (!modulo.disponible) {
    console.log(`❌ El módulo "${modulo.nombre}" no está disponible.`);
    return;
  }
  if (cola.length === 0) {
    console.log("⚠️  La cola está vacía.");
    return;
  }

  // Preferenciales tienen prioridad — filter retorna Turno[]
  const preferenciales = cola.filter(
    (t) => t.tipo === "Preferencial" && t.estado === "Esperando"
  );
  const normales = cola.filter(
    (t) => t.tipo === "Normal" && t.estado === "Esperando"
  );

  // noUncheckedIndexedAccess: [0] retorna T | undefined
  const turnoAAtender: Turno | undefined =
    preferenciales.length > 0 ? preferenciales[0] : normales[0];

  if (turnoAAtender === undefined) {
    console.log("⚠️  No hay turnos en espera.");
    return;
  }

  turnoAAtender.estado = "En atención";

  console.log(`\n📢 ¡Turno llamado!`);
  console.log(`   ${turnoAAtender.codigo} — ${turnoAAtender.nombre}`);
  console.log(`   Diríjase al módulo: ${modulo.nombre}\n`);
};

// ── 3. FINALIZAR ATENCIÓN ────────────────────────────────────
const finalizarAtencion = (codigoTurno: string): void => {
  const turno = cola.find((t) => t.codigo === codigoTurno);

  if (turno === undefined) {
    console.log(`❌ No se encontró el turno ${codigoTurno} en la cola.`);
    return;
  }

  turno.estado  = "Atendido";
  turno.horaFin = horaActual();    // ahora existe el campo opcional

  historialAtendidos.push(turno);
  cola = cola.filter((t) => t.codigo !== codigoTurno);

  console.log(`✅ Turno ${codigoTurno} (${turno.nombre}) — Atendido.\n`);
};

// ── 4. VER COLA ──────────────────────────────────────────────
const verCola = (): void => {
  const enEspera   = cola.filter((t) => t.estado === "Esperando");
  const enAtencion = cola.filter((t) => t.estado === "En atención");

  console.log("\n════════════════════════════════════════");
  console.log("          🎫  COLA DE ESPERA           ");
  console.log("════════════════════════════════════════");
  console.log(`  Personas en espera   : ${enEspera.length}`);
  console.log(`  En atención ahora    : ${enAtencion.length}`);
  console.log(`  Total en cola        : ${cola.length}`);
  console.log("────────────────────────────────────────");

  if (cola.length === 0) {
    console.log("  (Cola vacía)");
  } else {
    cola
      .map(
        (t, i) =>
          `  ${i + 1}. [${t.codigo}] ${t.nombre.padEnd(15)}  ${t.tipo.padEnd(14)}  ${t.estado}`
      )
      .forEach((l) => console.log(l));
  }

  console.log("════════════════════════════════════════\n");
};

// ── 5. VER HISTORIAL ─────────────────────────────────────────
const verHistorial = (): void => {
  if (historialAtendidos.length === 0) {
    console.log("\n📋 Aún no se ha atendido ningún turno.\n");
    return;
  }

  console.log("\n════════════════════════════════════════");
  console.log("         📋  HISTORIAL DE ATENDIDOS     ");
  console.log("════════════════════════════════════════");

  historialAtendidos
    .map((t) => `  [${t.codigo}] ${t.nombre.padEnd(15)}  ${t.tipo}`)
    .forEach((l) => console.log(l));

  const totalNormal = historialAtendidos.reduce(
    (acc, t) => acc + (t.tipo === "Normal" ? 1 : 0),
    0
  );
  const totalPreferencial = historialAtendidos.reduce(
    (acc, t) => acc + (t.tipo === "Preferencial" ? 1 : 0),
    0
  );

  console.log("────────────────────────────────────────");
  console.log(`  Normales atendidos      : ${totalNormal}`);
  console.log(`  Preferenciales atendidos: ${totalPreferencial}`);
  console.log(`  Total atendidos         : ${historialAtendidos.length}`);
  console.log("════════════════════════════════════════\n");
};

// ── 6. CANCELAR TURNO ────────────────────────────────────────
const cancelarTurno = (codigoTurno: string): void => {
  const turno = cola.find((t) => t.codigo === codigoTurno);

  if (turno === undefined) {
    console.log(`❌ Turno ${codigoTurno} no encontrado en la cola.`);
    return;
  }

  cola = cola.filter((t) => t.codigo !== codigoTurno);
  console.log(`🗑️  Turno ${codigoTurno} (${turno.nombre}) cancelado.\n`);
};

// ── DEMOSTRACIÓN ─────────────────────────────────────────────
console.log("╔══════════════════════════════════╗");
console.log("║      SIMULACIÓN: DIGITURNO       ║");
console.log("╚══════════════════════════════════╝\n");

console.log("--- Asignar turnos ---");
asignarTurno("Carlos Mora",    "Normal");
asignarTurno("Elena Vargas",   "Normal");
asignarTurno("Abuela Rosa",    "Preferencial");
asignarTurno("Pedro Salcedo",  "Normal");
asignarTurno("Señor en silla", "Preferencial");

console.log("--- Ver cola actual ---");
verCola();

console.log("--- Llamar siguiente (preferencial primero) ---");
llamarSiguiente(1);

console.log("--- Finalizar atención del preferencial ---");
finalizarAtencion("P-001");

console.log("--- Llamar siguiente ---");
llamarSiguiente(1);

console.log("--- Ver cola actualizada ---");
verCola();

console.log("--- Carlos se retira de la cola ---");
cancelarTurno("N-001");

console.log("--- Ver historial ---");
verHistorial();

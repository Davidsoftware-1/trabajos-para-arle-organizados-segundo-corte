export {};
// ============================================================
//  SIMULACIÓN 1 — SISTEMA DE RESERVA DE HOTEL
//  TypeScript estricto — Compatible con Bun
//  tsconfig: strict, noUncheckedIndexedAccess,
//            exactOptionalPropertyTypes, noImplicitReturns
// ============================================================

// ── TIPOS ────────────────────────────────────────────────────

interface Cliente {
  readonly nombre:    string;
  readonly documento: string;
}

// Union de literales: solo estos valores son válidos
type TipoHabitacion = "Individual" | "Doble" | "Suite";

interface Habitacion {
  readonly id:    number;
  readonly tipo:  TipoHabitacion;
  readonly camas: number;
  readonly precioPorNoche: number;
  disponible: boolean;         // cambia al reservar / cancelar
}

interface Reserva {
  readonly numeroReserva: string;
  readonly cliente:       Cliente;
  readonly habitacion:    Habitacion;
  readonly noches:        number;
  readonly total:         number;
}

// ── DATOS ────────────────────────────────────────────────────

const habitaciones: Habitacion[] = [
  { id: 101, tipo: "Individual", camas: 1, precioPorNoche: 80_000,  disponible: true  },
  { id: 102, tipo: "Individual", camas: 1, precioPorNoche: 80_000,  disponible: true  },
  { id: 201, tipo: "Doble",      camas: 2, precioPorNoche: 130_000, disponible: true  },
  { id: 202, tipo: "Doble",      camas: 2, precioPorNoche: 130_000, disponible: false },
  { id: 301, tipo: "Suite",      camas: 3, precioPorNoche: 250_000, disponible: true  },
  { id: 302, tipo: "Suite",      camas: 3, precioPorNoche: 250_000, disponible: true  },
];

let reservas: Reserva[] = [];
let contadorReservas = 1000;

// ── UTILIDADES ───────────────────────────────────────────────

const generarNumeroReserva = (): string => `RES-${++contadorReservas}`;

const formatearPrecio = (valor: number): string =>
  `$${valor.toLocaleString("es-CO")}`;

// Retorna undefined si no existe — noUncheckedIndexedAccess lo exige
const buscarHabitacion = (id: number): Habitacion | undefined =>
  habitaciones.find((h) => h.id === id);

const buscarReserva = (numeroReserva: string): Reserva | undefined =>
  reservas.find((r) => r.numeroReserva === numeroReserva);

// ── 1. VER DISPONIBLES ───────────────────────────────────────
const verDisponibles = (): void => {
  const disponibles = habitaciones.filter((h) => h.disponible);

  if (disponibles.length === 0) {
    console.log("\n❌ No hay habitaciones disponibles.");
    return;
  }

  console.log("\n════════════════════════════════════════");
  console.log("       🏨  HABITACIONES DISPONIBLES     ");
  console.log("════════════════════════════════════════");

  disponibles
    .map((h) =>
      `  Hab. ${h.id}  │  ${h.tipo.padEnd(10)}  │  ${h.camas} cama(s)  │  ${formatearPrecio(h.precioPorNoche)}/noche`
    )
    .forEach((l) => console.log(l));

  console.log("════════════════════════════════════════\n");
};

// ── 2. CREAR RESERVA ─────────────────────────────────────────
const crearReserva = (
  cliente: Cliente,
  idHabitacion: number,
  noches: number
): void => {
  const habitacion = buscarHabitacion(idHabitacion);

  if (habitacion === undefined) {
    console.log(`❌ La habitación ${idHabitacion} no existe.`);
    return;
  }
  if (!habitacion.disponible) {
    console.log(`❌ La habitación ${idHabitacion} no está disponible.`);
    return;
  }
  if (noches <= 0) {
    console.log("❌ El número de noches debe ser mayor a 0.");
    return;
  }

  const total = habitacion.precioPorNoche * noches;

  const nuevaReserva: Reserva = {
    numeroReserva: generarNumeroReserva(),
    cliente,
    habitacion,
    noches,
    total,
  };

  reservas.push(nuevaReserva);
  habitacion.disponible = false;

  console.log(`\n✅ Reserva creada:`);
  console.log(`   N° Reserva : ${nuevaReserva.numeroReserva}`);
  console.log(`   Cliente    : ${cliente.nombre}`);
  console.log(`   Habitación : ${habitacion.id} (${habitacion.tipo})`);
  console.log(`   Noches     : ${noches}`);
  console.log(`   Total      : ${formatearPrecio(total)}\n`);
};

// ── 3. CANCELAR RESERVA ──────────────────────────────────────
const cancelarReserva = (numeroReserva: string): void => {
  const reserva = buscarReserva(numeroReserva);

  if (reserva === undefined) {
    console.log(`❌ No existe reserva ${numeroReserva}.`);
    return;
  }

  reserva.habitacion.disponible = true;
  reservas = reservas.filter((r) => r.numeroReserva !== numeroReserva);

  console.log(
    `\n🗑️  Reserva ${numeroReserva} cancelada. Hab. ${reserva.habitacion.id} disponible.\n`
  );
};

// ── 4. VER RESERVAS ──────────────────────────────────────────
const verReservas = (): void => {
  if (reservas.length === 0) {
    console.log("\n📋 No hay reservas registradas.\n");
    return;
  }

  console.log("\n════════════════════════════════════════");
  console.log("         📋  RESERVAS ACTIVAS           ");
  console.log("════════════════════════════════════════");

  reservas
    .map(
      (r) =>
        `  ${r.numeroReserva}  │  ${r.cliente.nombre.padEnd(15)}  │  Hab.${r.habitacion.id}  │  ${r.noches} noche(s)  │  ${formatearPrecio(r.total)}`
    )
    .forEach((l) => console.log(l));

  console.log("════════════════════════════════════════\n");
};

// ── 5. FILTRAR POR TIPO ──────────────────────────────────────
const filtrarPorTipo = (tipo: TipoHabitacion): void => {
  const resultado = reservas.filter((r) => r.habitacion.tipo === tipo);

  if (resultado.length === 0) {
    console.log(`\n🔍 No hay reservas de tipo "${tipo}".\n`);
    return;
  }

  console.log(`\n🔍 Reservas de habitación "${tipo}":`);
  resultado.forEach((r) =>
    console.log(`   ${r.numeroReserva}  →  ${r.cliente.nombre}  (${r.noches} noche(s))`)
  );
  console.log();
};

// ── 6. RESUMEN DE INGRESOS ────────────────────────────────────
const resumenIngresos = (): void => {
  if (reservas.length === 0) {
    console.log("\n💰 No hay reservas para calcular ingresos.\n");
    return;
  }

  const ingresoTotal = reservas
    .map((r) => r.total)
    .reduce((acc, total) => acc + total, 0);

  console.log(`\n💰 Total de reservas activas : ${reservas.length}`);
  console.log(`   Ingresos acumulados       : ${formatearPrecio(ingresoTotal)}\n`);
};

// ── 7. RESUMEN POR TIPO ───────────────────────────────────────
const resumenPorTipo = (): void => {
  const tipos = [...new Set(reservas.map((r) => r.habitacion.tipo))];

  console.log("\n📊 Ingresos por tipo de habitación:");

  tipos.forEach((tipo) => {
    const reservasTipo = reservas.filter((r) => r.habitacion.tipo === tipo);
    const subtotal = reservasTipo.reduce((acc, r) => acc + r.total, 0);
    console.log(
      `   ${tipo.padEnd(12)} →  ${reservasTipo.length} reserva(s)  →  ${formatearPrecio(subtotal)}`
    );
  });
  console.log();
};

// ── DEMOSTRACIÓN ─────────────────────────────────────────────
console.log("╔══════════════════════════════════════╗");
console.log("║   SIMULACIÓN: SISTEMA RESERVA HOTEL  ║");
console.log("╚══════════════════════════════════════╝\n");

console.log("--- Habitaciones disponibles ---");
verDisponibles();

console.log("--- Crear reservas ---");
crearReserva({ nombre: "Ana Torres",    documento: "111111" }, 101, 2);
crearReserva({ nombre: "Luis Gómez",    documento: "222222" }, 201, 4);
crearReserva({ nombre: "María Ruiz",    documento: "333333" }, 301, 1);
crearReserva({ nombre: "Pedro Salcedo", documento: "444444" }, 301, 3); // ya ocupada

console.log("--- Ver todas las reservas ---");
verReservas();

console.log("--- Habitaciones disponibles después de reservas ---");
verDisponibles();

console.log("--- Resumen de ingresos ---");
resumenIngresos();

console.log("--- Cancelar reserva RES-1001 ---");
cancelarReserva("RES-1001");

console.log("--- Reservas tras cancelación ---");
verReservas();

console.log("--- Filtrar por tipo Suite ---");
filtrarPorTipo("Suite");

console.log("--- Ingresos por tipo de habitación ---");
resumenPorTipo();

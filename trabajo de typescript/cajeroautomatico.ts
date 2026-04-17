export {};
// ============================================================
//  SIMULACIÓN 2 — CAJERO AUTOMÁTICO
//  TypeScript estricto — Compatible con Bun
// ============================================================

interface CuentaBancaria {
  readonly numero:  string;
  readonly titular: string;
  readonly pin:     string;
  saldo:            number;
}

type TipoTransaccion =
  | "Retiro"
  | "Consignación"
  | `Transferencia → ${string}`;

interface Transaccion {
  readonly cuenta:  string;
  readonly titular: string;
  readonly tipo:    TipoTransaccion;
  readonly monto:   number;
  readonly fecha:   string;
}

const cuentas: CuentaBancaria[] = [
  { numero: "001", titular: "Ana Torres", pin: "1234", saldo: 500_000   },
  { numero: "002", titular: "Luis Gómez", pin: "5678", saldo: 1_200_000 },
  { numero: "003", titular: "María Ruiz", pin: "9999", saldo: 75_000    },
];

let transacciones: Transaccion[] = [];
let sesionActiva: CuentaBancaria | null = null;

const formatearPrecio = (valor: number): string =>
  `$${valor.toLocaleString("es-CO")}`;

const ahora = (): string => new Date().toLocaleString("es-CO");

const registrarTransaccion = (
  cuenta: CuentaBancaria,
  tipo: TipoTransaccion,
  monto: number
): void => {
  transacciones.push({ cuenta: cuenta.numero, titular: cuenta.titular, tipo, monto, fecha: ahora() });
};

const buscarCuenta = (numero: string): CuentaBancaria | undefined =>
  cuentas.find((c) => c.numero === numero);

// Retorna la cuenta activa o undefined — narrowing seguro en cada función
const obtenerSesion = (): CuentaBancaria | undefined => {
  if (sesionActiva === null) {
    console.log("🔒 Debe iniciar sesión para realizar esta operación.");
    return undefined;
  }
  return sesionActiva;
};

const iniciarSesion = (numeroCuenta: string, pin: string): boolean => {
  const cuenta = buscarCuenta(numeroCuenta);
  if (cuenta === undefined) { console.log("❌ Número de cuenta no encontrado."); return false; }
  if (cuenta.pin !== pin)   { console.log("❌ PIN incorrecto."); return false; }
  sesionActiva = cuenta;
  console.log(`\n✅ Bienvenido/a, ${cuenta.titular}. Sesión iniciada.`);
  return true;
};

const cerrarSesion = (): void => {
  if (sesionActiva === null) { console.log("⚠️  No hay sesión activa."); return; }
  console.log(`\n👋 Sesión cerrada. Hasta luego, ${sesionActiva.titular}.`);
  sesionActiva = null;
};

const consultarSaldo = (): void => {
  const c = obtenerSesion();
  if (c === undefined) return;
  console.log("\n════════════════════════════════");
  console.log("       💳  CONSULTA DE SALDO    ");
  console.log("════════════════════════════════");
  console.log(`  Titular : ${c.titular}`);
  console.log(`  Cuenta  : ${c.numero}`);
  console.log(`  Saldo   : ${formatearPrecio(c.saldo)}`);
  console.log("════════════════════════════════\n");
};

const retirar = (monto: number): void => {
  const c = obtenerSesion();
  if (c === undefined) return;
  if (monto <= 0)        { console.log("❌ El monto debe ser mayor a $0."); return; }
  if (monto > c.saldo)   { console.log(`❌ Saldo insuficiente. Saldo: ${formatearPrecio(c.saldo)}`); return; }
  c.saldo -= monto;
  registrarTransaccion(c, "Retiro", monto);
  console.log(`\n💵 Retiro exitoso: ${formatearPrecio(monto)}`);
  console.log(`   Saldo restante: ${formatearPrecio(c.saldo)}\n`);
};

const consignar = (monto: number): void => {
  const c = obtenerSesion();
  if (c === undefined) return;
  if (monto <= 0) { console.log("❌ El monto debe ser mayor a $0."); return; }
  c.saldo += monto;
  registrarTransaccion(c, "Consignación", monto);
  console.log(`\n✅ Consignación exitosa: ${formatearPrecio(monto)}`);
  console.log(`   Nuevo saldo: ${formatearPrecio(c.saldo)}\n`);
};

const transferir = (numeroCuentaDestino: string, monto: number): void => {
  const c = obtenerSesion();
  if (c === undefined) return;
  if (monto <= 0)                          { console.log("❌ El monto debe ser mayor a $0."); return; }
  if (numeroCuentaDestino === c.numero)    { console.log("❌ No puede transferir a su propia cuenta."); return; }
  const destino = buscarCuenta(numeroCuentaDestino);
  if (destino === undefined)               { console.log(`❌ La cuenta ${numeroCuentaDestino} no existe.`); return; }
  if (monto > c.saldo)                     { console.log(`❌ Saldo insuficiente. Saldo: ${formatearPrecio(c.saldo)}`); return; }
  c.saldo       -= monto;
  destino.saldo += monto;
  const tipo: TipoTransaccion = `Transferencia → ${destino.titular}`;
  registrarTransaccion(c, tipo, monto);
  console.log(`\n🔄 Transferencia exitosa:`);
  console.log(`   Enviado a   : ${destino.titular} (${destino.numero})`);
  console.log(`   Monto       : ${formatearPrecio(monto)}`);
  console.log(`   Saldo actual: ${formatearPrecio(c.saldo)}\n`);
};

const verHistorial = (): void => {
  const c = obtenerSesion();
  if (c === undefined) return;
  const movimientos = transacciones.filter((t) => t.cuenta === c.numero);
  if (movimientos.length === 0) { console.log("\n📄 No hay movimientos.\n"); return; }

  console.log("\n════════════════════════════════════════════════");
  console.log("         📄  HISTORIAL DE MOVIMIENTOS          ");
  console.log("════════════════════════════════════════════════");

  movimientos
    .map((t) => `  ${t.tipo.padEnd(30)}  ${formatearPrecio(t.monto).padStart(14)}  │  ${t.fecha}`)
    .forEach((l) => console.log(l));

  const totalRetirado   = movimientos.filter((t) => t.tipo === "Retiro").reduce((acc, t) => acc + t.monto, 0);
  const totalConsignado = movimientos.filter((t) => t.tipo === "Consignación").reduce((acc, t) => acc + t.monto, 0);

  console.log("────────────────────────────────────────────────");
  console.log(`  Total retirado   : ${formatearPrecio(totalRetirado)}`);
  console.log(`  Total consignado : ${formatearPrecio(totalConsignado)}`);
  console.log("════════════════════════════════════════════════\n");
};

// ── DEMOSTRACIÓN ─────────────────────────────────────────────
console.log("╔══════════════════════════════════╗");
console.log("║   SIMULACIÓN: CAJERO AUTOMÁTICO  ║");
console.log("╚══════════════════════════════════╝\n");

console.log("--- Intentar operar sin sesión ---");
consultarSaldo();
console.log("\n--- Iniciar sesión con PIN incorrecto ---");
iniciarSesion("001", "0000");
console.log("\n--- Iniciar sesión correctamente ---");
iniciarSesion("001", "1234");
console.log("\n--- Consultar saldo ---");
consultarSaldo();
console.log("--- Retirar $150.000 ---");
retirar(150_000);
console.log("--- Intentar retirar más de lo disponible ---");
retirar(9_999_999);
console.log("--- Consignar $300.000 ---");
consignar(300_000);
console.log("--- Transferir $80.000 a cuenta 002 ---");
transferir("002", 80_000);
console.log("--- Ver historial de movimientos ---");
verHistorial();
console.log("--- Cerrar sesión ---");
cerrarSesion();

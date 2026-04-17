export {};
// ============================================================
//  SIMULACIÓN 5 — VENTA DE BOLETAS PARA EL ESTADIO
//  TypeScript estricto — Compatible con Bun
// ============================================================

// ── TIPOS ────────────────────────────────────────────────────

type NombreZona =
  | "Norte (Popular)"
  | "Sur (Popular)"
  | "Occidental (Platea)"
  | "Oriental (Platea)"
  | "Palco VIP";

interface Zona {
  readonly id:       number;
  readonly nombre:   NombreZona;
  readonly precio:   number;
  readonly capacidad: number;
  vendidas:          number;
}

interface Comprador {
  readonly nombre:    string;
  readonly documento: string;
}

interface Venta {
  readonly idVenta:   string;
  readonly comprador: Comprador;
  readonly zona:      NombreZona;
  readonly idZona:    number;
  readonly cantidad:  number;
  readonly total:     number;
  readonly fecha:     string;
}

// ── DATOS ────────────────────────────────────────────────────

const zonas: Zona[] = [
  { id: 1, nombre: "Norte (Popular)",     precio: 25_000,  capacidad: 500, vendidas: 0 },
  { id: 2, nombre: "Sur (Popular)",       precio: 25_000,  capacidad: 500, vendidas: 0 },
  { id: 3, nombre: "Occidental (Platea)", precio: 80_000,  capacidad: 200, vendidas: 0 },
  { id: 4, nombre: "Oriental (Platea)",   precio: 80_000,  capacidad: 200, vendidas: 0 },
  { id: 5, nombre: "Palco VIP",           precio: 180_000, capacidad: 50,  vendidas: 0 },
];

let ventas:         Venta[] = [];
let contadorVentas  = 0;

// ── UTILIDADES ───────────────────────────────────────────────

const formatearPrecio = (valor: number): string =>
  `$${valor.toLocaleString("es-CO")}`;

const ahora = (): string => new Date().toLocaleString("es-CO");

const buscarZona = (id: number): Zona | undefined =>
  zonas.find((z) => z.id === id);

const disponiblesEnZona = (zona: Zona): number =>
  zona.capacidad - zona.vendidas;

// ── 1. VER DISPONIBILIDAD ────────────────────────────────────
const verDisponibilidad = (): void => {
  console.log("\n════════════════════════════════════════════════════════");
  console.log("                 🏟️  ESTADIO — ZONAS                  ");
  console.log("════════════════════════════════════════════════════════");

  zonas
    .map((z) => {
      const disponibles = disponiblesEnZona(z);
      const estado = disponibles === 0 ? "⛔ AGOTADO" : `✅ ${disponibles} disp.`;
      return (
        `  [${z.id}] ${z.nombre.padEnd(22)}  ${formatearPrecio(z.precio).padStart(10)}` +
        `  │  ${estado}`
      );
    })
    .forEach((l) => console.log(l));

  console.log("════════════════════════════════════════════════════════\n");
};

// ── 2. COMPRAR BOLETAS ───────────────────────────────────────
const comprarBoletas = (
  comprador: Comprador,
  idZona: number,
  cantidad: number
): void => {
  const zona = buscarZona(idZona);

  if (zona === undefined) {
    console.log(`❌ Zona con id ${idZona} no existe.`);
    return;
  }

  const disponibles = disponiblesEnZona(zona);

  if (disponibles === 0) {
    console.log(`❌ La zona "${zona.nombre}" está agotada.`);
    return;
  }
  if (cantidad > disponibles) {
    console.log(`❌ Solo quedan ${disponibles} boletas en "${zona.nombre}".`);
    return;
  }
  if (cantidad <= 0) {
    console.log("❌ La cantidad debe ser mayor a 0.");
    return;
  }

  const total = zona.precio * cantidad;
  zona.vendidas += cantidad;
  contadorVentas++;

  const nuevaVenta: Venta = {
    idVenta:   `BOL-${String(contadorVentas).padStart(4, "0")}`,
    comprador,
    zona:      zona.nombre,
    idZona:    zona.id,
    cantidad,
    total,
    fecha:     ahora(),
  };

  ventas.push(nuevaVenta);

  console.log(`\n🎟️  Compra exitosa — Recibo:`);
  console.log(`   Número venta : ${nuevaVenta.idVenta}`);
  console.log(`   Comprador    : ${comprador.nombre}`);
  console.log(`   Zona         : ${zona.nombre}`);
  console.log(`   Boletas      : ${cantidad}`);
  console.log(`   Precio unit. : ${formatearPrecio(zona.precio)}`);
  console.log(`   TOTAL        : ${formatearPrecio(total)}\n`);
};

// ── 3. VER VENTAS ────────────────────────────────────────────
const verVentas = (): void => {
  if (ventas.length === 0) {
    console.log("\n📋 No se han realizado ventas aún.\n");
    return;
  }

  console.log("\n════════════════════════════════════════════════════════");
  console.log("                  📋  REGISTRO DE VENTAS               ");
  console.log("════════════════════════════════════════════════════════");

  ventas
    .map(
      (v) =>
        `  ${v.idVenta}  │  ${v.comprador.nombre.padEnd(18)}  │  ${v.zona.padEnd(22)}` +
        `  │  x${v.cantidad}  │  ${formatearPrecio(v.total)}`
    )
    .forEach((l) => console.log(l));

  console.log("════════════════════════════════════════════════════════\n");
};

// ── 4. REPORTE DE INGRESOS ───────────────────────────────────
const reporteIngresos = (): void => {
  if (ventas.length === 0) {
    console.log("\n💰 Sin ventas para reportar.\n");
    return;
  }

  const ingresoTotal = ventas
    .map((v) => v.total)
    .reduce((acc, total) => acc + total, 0);

  const boletasTotales = ventas.reduce((acc, v) => acc + v.cantidad, 0);

  console.log("\n════════════════════════════════════════");
  console.log("         💰  REPORTE DE INGRESOS        ");
  console.log("════════════════════════════════════════");
  console.log(`  Transacciones realizadas : ${ventas.length}`);
  console.log(`  Boletas vendidas         : ${boletasTotales}`);
  console.log(`  Ingresos totales         : ${formatearPrecio(ingresoTotal)}`);
  console.log("════════════════════════════════════════\n");
};

// ── 5. REPORTE POR ZONA ──────────────────────────────────────
const reportePorZona = (): void => {
  console.log("\n📊 Ventas por zona:");

  zonas.forEach((zona) => {
    const ventasZona = ventas.filter((v) => v.idZona === zona.id);
    const ingresos   = ventasZona.reduce((acc, v) => acc + v.total, 0);
    const ocupacion  = `${zona.vendidas}/${zona.capacidad}`;

    console.log(
      `   ${zona.nombre.padEnd(24)}  vendidas: ${ocupacion.padEnd(8)}  ingresos: ${formatearPrecio(ingresos)}`
    );
  });
  console.log();
};

// ── 6. BUSCAR POR COMPRADOR ──────────────────────────────────
const buscarVentasPorComprador = (documento: string): void => {
  const misCompras = ventas.filter((v) => v.comprador.documento === documento);

  if (misCompras.length === 0) {
    console.log(`\n🔍 No se encontraron compras para el documento ${documento}.\n`);
    return;
  }

  console.log(`\n🔍 Compras registradas para documento ${documento}:`);
  misCompras.forEach((v) =>
    console.log(
      `   ${v.idVenta}  →  ${v.zona}  ×${v.cantidad}  →  ${formatearPrecio(v.total)}`
    )
  );
  console.log();
};

// ── 7. DEVOLVER BOLETAS ──────────────────────────────────────
const devolverBoletas = (idVenta: string): void => {
  const venta = ventas.find((v) => v.idVenta === idVenta);

  if (venta === undefined) {
    console.log(`❌ Venta ${idVenta} no encontrada.`);
    return;
  }

  const zona = buscarZona(venta.idZona);
  if (zona !== undefined) {
    zona.vendidas -= venta.cantidad;
  }

  ventas = ventas.filter((v) => v.idVenta !== idVenta);

  console.log(`\n↩️  Devolución exitosa:`);
  console.log(`   ${venta.cantidad} boleta(s) de ${venta.zona} devuelta(s).`);
  console.log(`   Reembolso: ${formatearPrecio(venta.total)}\n`);
};

// ── DEMOSTRACIÓN ─────────────────────────────────────────────
console.log("╔══════════════════════════════════════╗");
console.log("║  SIMULACIÓN: BOLETAS PARA ESTADIO    ║");
console.log("╚══════════════════════════════════════╝\n");

console.log("--- Disponibilidad inicial ---");
verDisponibilidad();

console.log("--- Comprar boletas ---");
comprarBoletas({ nombre: "Carlos Pérez",  documento: "123456" }, 1, 5);
comprarBoletas({ nombre: "María Gómez",   documento: "789012" }, 5, 2);
comprarBoletas({ nombre: "Luis Martínez", documento: "345678" }, 3, 4);
comprarBoletas({ nombre: "Carlos Pérez",  documento: "123456" }, 5, 1);

console.log("--- Disponibilidad actualizada ---");
verDisponibilidad();

console.log("--- Todas las ventas ---");
verVentas();

console.log("--- Reporte de ingresos ---");
reporteIngresos();

console.log("--- Reporte por zona ---");
reportePorZona();

console.log("--- Buscar compras de Carlos (123456) ---");
buscarVentasPorComprador("123456");

console.log("--- Devolver boletas de BOL-0001 ---");
devolverBoletas("BOL-0001");

console.log("--- Disponibilidad final ---");
verDisponibilidad();

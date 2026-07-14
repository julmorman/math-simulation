// Inicialización de datos históricos e inputs
const COST_BASE_2026 = 151; // En miles de millones (billions)
const PBI_BASE_2026 = 28000; // En miles de millones (billions)

const pbiGrowthInput = document.getElementById('pbiGrowth') as HTMLInputElement;
const screenGrowthInput = document.getElementById('screenGrowth') as HTMLInputElement;
const nudgeEffectInput = document.getElementById('nudgeEffect') as HTMLInputElement;

// Elementos de la UI para mostrar valores
const pbiVal = document.getElementById('pbiVal') as HTMLElement;
const screenVal = document.getElementById('screenVal') as HTMLElement;
const nudgeVal = document.getElementById('nudgeVal') as HTMLElement;
const lostPbiTotalElem = document.getElementById('lostPbiTotal') as HTMLElement;
const finalCostElem = document.getElementById('finalCost') as HTMLElement;

// Configuración de años para la proyección (Próximas 3 décadas)
const startYear = 2026;
const projectionYears = 30;
let labels: number[] = [];
for (let i = 0; i <= projectionYears; i++) labels.push(startYear + i);

// Reemplazá la sección de "Configurar Chart.js" en tu src/main.ts con esto:
const ctx = (document.getElementById('projectionChart') as HTMLCanvasElement).getContext('2d')!;
// @ts-ignore
let projectionChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [
      { label: 'PBI Potencial (Óptimo)', data: [], borderColor: '#34d399', backgroundColor: 'transparent', tension: 0.2, borderWidth: 3 }, // Verde Esmeralda
      { label: 'PBI Real Proyectado', data: [], borderColor: '#38bdf8', backgroundColor: 'transparent', tension: 0.2, borderWidth: 3 }, // Celeste Eléctrico
      { label: 'Costo de Adicción Digital', data: [], borderColor: '#ff6b00', backgroundColor: 'transparent', tension: 0.2, borderWidth: 2, yAxisID: 'y1', borderDash: [5, 5] } // Naranja Fluo Línea de Puntos
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#a1a1aa', font: { family: 'JetBrains Mono', size: 11 } } // Color de etiquetas gris claro
      }
    },
    scales: {
      y: { type: 'linear', display: true, position: 'left', grid: { color: '#18181b' }, ticks: { color: '#a1a1aa' }, title: { display: true, text: 'PBI (Billones US$)', color: '#a1a1aa' } },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#ff6b00' }, title: { display: true, text: 'Costo (Miles de Millones US$)', color: '#ff6b00' } }
    }
  }
});

// Función de simulación matemática (Motor Predictivo basado estrictamente en datos de EE. UU.)
function calculateProjections() {
  // Captura de datos tangibles de los sliders
  const pbiRate = parseFloat(pbiGrowthInput.value) / 100;
  const horasUso = parseFloat(screenGrowthInput.value); // Unidad: Horas diarias (Crítico > 5h)
  const prohibicionColegios = parseFloat(nudgeEffectInput.value) / 100; // Unidad: % de colegios

  // Actualizar las etiquetas de la interfaz con sus unidades correctas
  pbiVal.innerText = pbiGrowthInput.value + "%";
  screenVal.innerText = horasUso.toFixed(1) + " hrs";
  nudgeVal.innerText = (prohibicionColegios * 100).toFixed(0) + "%";

  let pbiPotencialData: string[] = [];
  let pbiRealData: string[] = [];
  let costoData: string[] = [];

  let currentPbiPotencial = PBI_BASE_2026;
  let currentPbiReal = PBI_BASE_2026;
  let accumulatedLostPbi = 0;

  // Factor de penalización matemática si se superan las 5 horas críticas del artículo
  const factorExceso = horasUso > 5 ? 1 + (horasUso - 5) * 0.25 : 1 - (5 - horasUso) * 0.1;
  
  // Factor de mitigación real basado en la efectividad de la prohibición escolar (hasta un 30% de reducción del impacto)
  const factorMitigacion = 1 - (prohibicionColegios * 0.3);

  for (let t = 0; t <= projectionYears; t++) {
    // Costo proyectado para EE. UU. combinando el costo base de 151B con las variables físicas medibles
    let currentCosto = COST_BASE_2026 * factorExceso * factorMitigacion * Math.pow(1 + 0.015, t);
    
    if (t > 0) {
      currentPbiPotencial *= (1 + pbiRate);
      // Afectación directa al PBI basada en el 56% de pérdida de productividad (86.3B / 151B)
      let perdidaProductividad = currentCosto * (86.3 / 151);
      currentPbiReal = currentPbiReal * (1 + pbiRate) - perdidaProductividad;
      accumulatedLostPbi += (currentPbiPotencial - currentPbiReal);
    }

    pbiPotencialData.push((currentPbiPotencial / 1000).toFixed(2));
    pbiRealData.push((currentPbiReal / 1000).toFixed(2));
    costoData.push(currentCosto.toFixed(2));
  }

  // Actualizar UI con los resultados macroeconómicos de EE. UU.
  lostPbiTotalElem.innerText = `US$ ${(accumulatedLostPbi / 1000).toFixed(2)} T`;
  finalCostElem.innerText = `US$ ${costoData[costoData.length - 1]} B`;

  projectionChart.data.datasets[0].data = pbiPotencialData;
  projectionChart.data.datasets[1].data = pbiRealData;
  projectionChart.data.datasets[2].data = costoData;
  projectionChart.update();
}

// Listeners para interactividad en tiempo real
pbiGrowthInput.addEventListener('input', calculateProjections);
screenGrowthInput.addEventListener('input', calculateProjections);
nudgeEffectInput.addEventListener('input', calculateProjections);

// Ejecución inicial
calculateProjections();
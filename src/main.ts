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

// Configurar Chart.js
const ctx = (document.getElementById('projectionChart') as HTMLCanvasElement).getContext('2d')!;
// @ts-ignore
let projectionChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [
      { label: 'PBI Potencial (Sin Costo Digital)', data: [], borderColor: '#34d399', backgroundColor: 'transparent', tension: 0.1 },
      { label: 'PBI Real Proyectado', data: [], borderColor: '#60a5fa', backgroundColor: 'transparent', tension: 0.1 },
      { label: 'Costo Anual por Adicción', data: [], borderColor: '#f87171', backgroundColor: 'transparent', tension: 0.1, yAxisID: 'y1' }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'PBI (En Billones US$)' } },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Costo Digital (En Miles de Millones US$)' } }
    }
  }
});

// Función de simulación matemática (Motor Predictivo)
function calculateProjections() {
  const pbiRate = parseFloat(pbiGrowthInput.value) / 100;
  const screenRate = parseFloat(screenGrowthInput.value) / 100;
  const nudgeFactor = parseFloat(nudgeEffectInput.value) / 100;

  // Actualizar etiquetas de texto
  pbiVal.innerText = pbiGrowthInput.value;
  screenVal.innerText = screenGrowthInput.value;
  nudgeVal.innerText = nudgeEffectInput.value;

  let pbiPotencialData: string[] = [];
  let pbiRealData: string[] = [];
  let costoData: string[] = [];

  let currentPbiPotencial = PBI_BASE_2026;
  let currentPbiReal = PBI_BASE_2026;
  let accumulatedLostPbi = 0;

  for (let t = 0; t <= projectionYears; t++) {
    let currentCosto = COST_BASE_2026 * Math.pow(1 + screenRate, t) * (1 - nudgeFactor * 0.5);
    
    if (t > 0) {
      currentPbiPotencial *= (1 + pbiRate);
      currentPbiReal = currentPbiReal * (1 + pbiRate) - (currentCosto * 0.56);
      accumulatedLostPbi += (currentPbiPotencial - currentPbiReal);
    }

    pbiPotencialData.push((currentPbiPotencial / 1000).toFixed(2));
    pbiRealData.push((currentPbiReal / 1000).toFixed(2));
    costoData.push(currentCosto.toFixed(2));
  }

  lostPbiTotalElem.innerText = `US$ ${(accumulatedLostPbi / 1000).toFixed(2)} Trillion`;
  finalCostElem.innerText = `US$ ${costoData[costoData.length - 1]} Billion`;

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
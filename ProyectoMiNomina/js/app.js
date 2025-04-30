(() => {
  // ——— Variables de estado ———
  let selectedYear, selectedMonth;

  // ——— Elementos del DOM ———
  const prevMonthBtn    = document.getElementById('prevMonth');
  const nextMonthBtn    = document.getElementById('nextMonth');
  const currentMonthEl  = document.getElementById('currentMonth');
  const ingresosMesEl   = document.getElementById('ingresosMes');
  const gastosMesEl     = document.getElementById('gastosMes');
  const balanceMesEl    = document.getElementById('balanceMes');
  // nuevos punteros a los codes:
  const diasCodeEl      = document.getElementById('diasTrabajadosCode');
  const gastosCodeEl    = document.getElementById('gastosRegistradosCode');
  const balanceCodeEl   = document.getElementById('balanceCode');
  const calendarioEl    = document.querySelector('.calendario');
  const listaDiasEl     = document.getElementById('listaDiasTrabajados');
  const listaGastosEl   = document.getElementById('listaGastos');
  const formDia         = document.getElementById('registroForm');
  const formGasto       = document.getElementById('registroGastoForm');

  // Modal
  const overlay   = document.getElementById('modalOverlay');
  const modalText = document.getElementById('modalText');
  const btnYes    = document.getElementById('modalYes');
  const btnNo     = document.getElementById('modalNo');

  // ——— Helpers de modal ———
  function showConfirm(text, onYes, onNo) {
    modalText.textContent = text;
    btnYes.style.display = '';
    btnNo.textContent = 'No';
    overlay.style.display = 'flex';
    btnYes.onclick = () => { overlay.style.display = 'none'; onYes(); };
    btnNo .onclick = () => { overlay.style.display = 'none'; if(onNo) onNo(); };
  }

  function showMessage(text) {
    modalText.textContent = text;
    btnYes.style.display = 'none';
    btnNo.textContent = 'Cerrar';
    overlay.style.display = 'flex';
    btnNo.onclick = () => { overlay.style.display = 'none'; };
  }

  // ——— Utilidades de fecha ———
  function pad(n){ return String(n).padStart(2,'0'); }
  function formatMonth(m,y){
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return `${meses[m]} ${y}`;
  }
  
  function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    // month-1 porque en JS enero es 0
    return new Date(year, month - 1, day);
  }

   // formatea "YYYY-MM-DD" a "Jueves 3 de abril del 2025"
  function formatDate(dateStr) {
  const d = parseLocalDate(dateStr);
  const dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio', 'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} del ${d.getFullYear()}`;
}

  // ——— Lógica de datos ———
  function registrarDiaTrabajado(fecha, tipo, festivo) {
    const tMedio    = 28500, tComp = 60300, multF = 1.75;
    let pago = tipo==='medio'? tMedio : tComp;
    if(festivo) pago *= multF;

    const registros = JSON.parse(localStorage.getItem('diasTrabajados')||'[]');
    if(registros.some(r=>r.fecha===fecha)){
      showMessage(`Ya existe registro en ${fecha}`);
      return null;
    }
    const nuevo = { fecha, tipo, festivo, total: pago };
    registros.push(nuevo);
    localStorage.setItem('diasTrabajados', JSON.stringify(registros));
    return nuevo;
  }

  function calcularIngresosMes() {
    const regs = JSON.parse(localStorage.getItem('diasTrabajados')||'[]');
    return regs
      .filter(r => {
        const d = new Date(r.fecha);
        return d.getFullYear()===selectedYear && d.getMonth()===selectedMonth;
      })
      .reduce((sum,r)=> sum + r.total, 0);
  }

  function registrarGasto(concepto, valor) {
    if(!concepto|| isNaN(valor)|| valor<=0){
      showMessage('Concepto válido y valor > 0, por favor.');
      return null;
    }
    const all = JSON.parse(localStorage.getItem('gastos')||'[]');
    const mesKey = `${selectedYear}-${pad(selectedMonth+1)}`;
    const nuevo = { month: mesKey, concepto, valor };
    all.push(nuevo);
    localStorage.setItem('gastos', JSON.stringify(all));
    return nuevo;
  }

  function calcularGastosMes() {
    const all = JSON.parse(localStorage.getItem('gastos')||'[]');
    const mesKey = `${selectedYear}-${pad(selectedMonth+1)}`;
    return all
      .filter(g => g.month===mesKey)
      .reduce((sum,g)=> sum + g.valor, 0);
      
  }

  // ——— Renderizado ———
  function generarCalendario() {
    const regs = JSON.parse(localStorage.getItem('diasTrabajados')||'[]');
    const primerDia = new Date(selectedYear, selectedMonth, 1).getDay();
    const ultimoDia = new Date(selectedYear, selectedMonth+1, 0).getDate();
    calendarioEl.innerHTML = '';

    ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
      .forEach(d=> calendarioEl.innerHTML += `<div><strong>${d}</strong></div>`);
    for(let i=0;i<primerDia;i++) calendarioEl.innerHTML += '<div></div>';
    for(let d=1; d<=ultimoDia; d++){
      const fstr = `${selectedYear}-${pad(selectedMonth+1)}-${pad(d)}`;
      const reg = regs.find(r=>r.fecha===fstr);
      const estilo = reg
        ? 'background: var(--color-optionall); color: #fff;'
        : '';
      calendarioEl.innerHTML += `
      <div style="${estilo}">
      ${d}
      ${reg
      ? `<br><small>$${Math.round(reg.total)
        .toLocaleString('en-US')}</small>`
      : ''}
</div>`;

    }
  }

  function listarDiasTrabajados() {
    const registros = JSON.parse(localStorage.getItem('diasTrabajados') || '[]')
      .filter(r => {
        const d = parseLocalDate(r.fecha);
        return d.getFullYear() === selectedYear && d.getMonth()    === selectedMonth;
      })
      .sort((a, b) => parseLocalDate(b.fecha) - parseLocalDate(a.fecha));
  
    listaDiasEl.innerHTML = '';
    registros.forEach(r => {
      const card = document.createElement('div');
      card.className = 'card';
  
      const fechaFormateada = formatDate(r.fecha);
      const pagoStr = Math.round(r.total).toLocaleString('en-US');
  
      const badgeClass = r.festivo ? 'festivo' : '';
      const badgeText  = r.festivo ? 'Festivo' : '';
  
      card.innerHTML = `
      <div class="card-content">
        <div class="card-name">
          ${fechaFormateada}
          <span class="badge ${badgeClass}">${badgeText}</span>
        </div>
        <div>Pago: $${pagoStr}</div>
      </div>
      <button class="btn-delete">Eliminar?</button>
    `;
  
      card.querySelector('.btn-delete').addEventListener('click', () => {
        showConfirm(
          `¿Eliminar día ${fechaFormateada}?`,
          () => {
            const todos = JSON.parse(localStorage.getItem('diasTrabajados') || '[]')
                          .filter(x => x.fecha !== r.fecha);
            localStorage.setItem('diasTrabajados', JSON.stringify(todos));
            updateAll();
          }
        );
      });
  
      listaDiasEl.appendChild(card);
    });
  }
  
  
  function listarGastos() {
    const all = JSON.parse(localStorage.getItem('gastos')||'[]')
      .map((g,i)=> ({...g, idx:i}))
      .filter(g=> g.month===`${selectedYear}-${pad(selectedMonth+1)}`);

    listaGastosEl.innerHTML = '';
    all.forEach(g => {
      const card = document.createElement('div');
      card.className = 'card';
      const valorStr = Number(g.valor).toLocaleString('en-US');
      
      card.innerHTML = `
      <div class="card-content">
        <div class="card-name">
          ${g.concepto}
        </div>
      <div>$${valorStr}</div>
      </div>
      <button class="btn-delete">Eliminar? </button>
    `;

      listaGastosEl.appendChild(card);
      card.querySelector('.btn-delete')
        .addEventListener('click', () => {
          showConfirm(
            `¿Eliminar gasto "${g.concepto}"?`,
            () => {
              const gastos = JSON.parse(localStorage.getItem('gastos')||'[]');
              gastos.splice(g.idx,1);
              localStorage.setItem('gastos', JSON.stringify(gastos));
              updateAll();
            }
          );
        });
    });
  }

  // ——— Navegación de meses ———
  function changeMonth(delta) {
    selectedMonth += delta;
    if (selectedMonth < 0)    { selectedMonth = 11; selectedYear--; }
    if (selectedMonth > 11)   { selectedMonth = 0;  selectedYear++; }
    updateAll();
  }

    // ——— Nuevas funciones de conteo ———
  function contarDiasTrabajadosMes() {
    const regs = JSON.parse(localStorage.getItem('diasTrabajados')||'[]');
    return regs.filter(r => {
      const d = new Date(r.fecha);
      return d.getFullYear()===selectedYear && d.getMonth()===selectedMonth;
    }).length;
  }

  function contarGastosRegistradosMes() {
    const all = JSON.parse(localStorage.getItem('gastos')||'[]');
    const mesKey = `${selectedYear}-${pad(selectedMonth+1)}`;
    return all.filter(g => g.month===mesKey).length;
  }

  // ——— Refrescar toda la vista ———
  function updateAll() {
    const ingresos = calcularIngresosMes();
    const gastos   = calcularGastosMes();
    const bal      = ingresos - gastos;

    currentMonthEl.textContent = formatMonth(selectedMonth, selectedYear);
    ingresosMesEl.textContent  = ingresos.toLocaleString('en-US');   // e.g. "100,000"
    gastosMesEl.textContent    = gastos  .toLocaleString('en-US');   // e.g. "  2,345"
    balanceMesEl.textContent   = bal     .toLocaleString('en-US');   // e.g. "-1,234"

    diasCodeEl.textContent     = `${contarDiasTrabajadosMes()} días trabajados`;
    gastosCodeEl.textContent   = `${contarGastosRegistradosMes()} gastos registrados`;
    balanceCodeEl.textContent  = bal < 0 ? 'Fondos insuficientes' : 'Ahorro';

    generarCalendario();
    listarDiasTrabajados();
    listarGastos();
  }

// ——— Inicialización ———
function init() {
  const hoy = new Date();
  selectedYear  = hoy.getFullYear();
  selectedMonth = hoy.getMonth();

  prevMonthBtn.addEventListener('click', () => changeMonth(-1));
  nextMonthBtn.addEventListener('click', () => changeMonth( 1));

    formDia.addEventListener('submit', e => {
      e.preventDefault();
      const f = formDia.fecha.value;
      const t = formDia.tipoDia.value;
      const fs= formDia.esFestivo.checked;
      const reg = registrarDiaTrabajado(f,t,fs);
      if (reg) {
        showMessage(`Día ${f} registrado.\nTotal: $${Math.round(reg.total)}`);
        formDia.reset();
        updateAll();
      }
    });

    formGasto.addEventListener('submit', e => {
      e.preventDefault();
      const c = document.getElementById('conceptoGasto').value.trim();
      const v = parseFloat(document.getElementById('valorGasto').value);
      const g = registrarGasto(c,v);
      if (g) {
        showMessage(`Gasto "${c}" agregado: $${v.toFixed(2)}`);
        formGasto.reset();
        updateAll();
      }
    });

    updateAll();
  }

// ——— Generar documento PDF con formato específico ———
async function generarCuentaCobroPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Datos fijos del ejemplo (puedes hacerlos variables luego)
  const nombre     = 'Juan Pérez';
  const cedula     = '0123456789';
  const concepto   = 'Servicio de mesero';
  const empresa    = 'Mi Empresa S.A.S.';
  const nit        = '123456789-0';
  const ciudad     = 'Pereira';

  // Fecha actual
  const hoy = new Date();
  const dia = hoy.getDate();
  const mesTexto = formatMonth(hoy.getMonth(), hoy.getFullYear()).split(' ')[0];
  const año = hoy.getFullYear();
  const fechaTexto = `${ciudad}, ${dia} de ${mesTexto} del ${año}`;

  // Ingresos actuales
  const total = calcularIngresosMes();
  const valorTexto = `$${total.toLocaleString('en-US')}`;

  // Generación del PDF
  let y = 30;
  doc.setFontSize(12);
  doc.text(fechaTexto, 20, y); y += 40;

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('CUENTA DE COBRO', 105, y, { align: 'center' }); y += 20;
  doc.setFont(undefined, 'normal');

  doc.setFontSize(12);
  doc.text(empresa, 105, y, { align: 'center' }); y += 6;
  doc.text(nit, 105, y, { align: 'center' }); y += 20;

  doc.text('DEBE A:', 105, y, { align: 'center' }); y += 20;
  doc.text(nombre, 105, y, { align: 'center' }); y += 6;
  doc.text(`C.C. ${cedula}`, 105, y, { align: 'center' }); y += 20;

  doc.text('LA SUMA DE:', 105, y, { align: 'center' }); y += 10;
  doc.setFontSize(14);
  doc.text(valorTexto, 105, y, { align: 'center' }); y += 20;

  doc.setFontSize(12);
  doc.text('CONCEPTO:', 105, y, { align: 'center' }); y += 10;
  doc.text(concepto, 105, y, { align: 'center' }); y += 30;

  
  doc.text('___________________________', 20, y); y += 6;
  doc.text(nombre, 20, y); y += 6;
  doc.text(`C.C. ${cedula}`, 20, y); y += 10;

  // Descargar
  doc.save(`Cuenta_de_Cobro_${año}_${hoy.getMonth() + 1}.pdf`);
}

// Botón
const btnWord = document.getElementById('btnGenerarWord');
btnWord.addEventListener('click', generarCuentaCobroPDF);


  window.addEventListener('load', init);

  
})();

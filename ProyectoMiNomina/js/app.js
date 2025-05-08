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
  async function registrarDiaTrabajado(fecha, tipo, festivo) {
    try {
      // Si el usuario está autenticado, usar la API
      if (window.apiService && window.apiService.isAuthenticated()) {
        const response = await window.apiService.workDay.createWorkDay({
          date: fecha,
          type: tipo,
          isHoliday: festivo
        });
        
        if (response.success) {
          return response.data;
        } else {
          showMessage(response.message || 'Error al registrar día trabajado');
          return null;
        }
      } else {
        // Fallback a localStorage si no hay autenticación
        const tMedio = 28500, tComp = 60300, multF = 1.75;
        let pago = tipo === 'medio' ? tMedio : tComp;
        if (festivo) pago *= multF;

        const registros = JSON.parse(localStorage.getItem('diasTrabajados') || '[]');
        if (registros.some(r => r.fecha === fecha)) {
          showMessage(`Ya existe registro en ${fecha}`);
          return null;
        }
        const nuevo = { 
          id: Date.now(), // ID único basado en timestamp
          fecha, 
          tipo, 
          festivo, 
          total: pago,
          // Añadir propiedades para compatibilidad con API
          date: fecha,
          type: tipo,
          isHoliday: festivo,
          amount: pago
        };
        registros.push(nuevo);
        localStorage.setItem('diasTrabajados', JSON.stringify(registros));
        return nuevo;
      }
    } catch (error) {
      console.error('Error al registrar día trabajado:', error);
      showMessage('Error al registrar día trabajado: ' + (error.message || 'Error desconocido'));
      return null;
    }
  }

  async function calcularIngresosMes() {
    try {
      // Si el usuario está autenticado, usar la API
      if (window.apiService && window.apiService.isAuthenticated()) {
        const response = await window.apiService.workDay.getWorkDaysSummary(selectedYear, selectedMonth + 1);
        if (response.success && response.data) {
          return response.data.totalAmount || 0;
        }
        return 0;
      } else {
        // Fallback a localStorage si no hay autenticación
        const regs = JSON.parse(localStorage.getItem('diasTrabajados') || '[]');
        return regs
          .filter(r => {
            const d = new Date(r.fecha);
            return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
          })
          .reduce((sum, r) => sum + (parseFloat(r.total) || parseFloat(r.amount) || 0), 0);
      }
    } catch (error) {
      console.error('Error al calcular ingresos del mes:', error);
      return 0;
    }
  }

  async function registrarGasto(concepto, valor, tag = 'Personal', isRecurring = false) {
    if (!concepto || isNaN(valor) || valor <= 0) {
      showMessage('Concepto válido y valor > 0, por favor.');
      return null;
    }
    
    try {
      // Si el usuario está autenticado, usar la API
      if (window.apiService && window.apiService.isAuthenticated()) {
        const response = await window.apiService.expense.createExpense({
          concept: concepto,
          amount: valor,
          tag: tag,
          date: `${selectedYear}-${pad(selectedMonth + 1)}-01`, // Primer día del mes seleccionado
          isRecurring: isRecurring
        });
        
        if (response.success) {
          return response.data;
        } else {
          showMessage(response.message || 'Error al registrar gasto');
          return null;
        }
      } else {
        // Fallback a localStorage si no hay autenticación
        const all = JSON.parse(localStorage.getItem('gastos') || '[]');
        const mesKey = `${selectedYear}-${pad(selectedMonth + 1)}`;
        const nuevo = { 
          id: Date.now(), // ID único basado en timestamp
          month: mesKey, 
          concepto, 
          valor, 
          tag, 
          isRecurring,
          // Añadir propiedades para compatibilidad con API
          concept: concepto,
          amount: valor,
          date: `${selectedYear}-${pad(selectedMonth + 1)}-01`
        };
        all.push(nuevo);
        localStorage.setItem('gastos', JSON.stringify(all));
        return nuevo;
      }
    } catch (error) {
      console.error('Error al registrar gasto:', error);
      showMessage('Error al registrar gasto: ' + (error.message || 'Error desconocido'));
      return null;
    }
  }

  async function calcularGastosMes() {
    try {
      // Si el usuario está autenticado, usar la API
      if (window.apiService && window.apiService.isAuthenticated()) {
        const response = await window.apiService.expense.getExpensesSummary(selectedYear, selectedMonth + 1);
        if (response.success && response.data && response.data.total) {
          return response.data.total.totalAmount || 0;
        }
        return 0;
      } else {
        // Fallback a localStorage si no hay autenticación
        const all = JSON.parse(localStorage.getItem('gastos') || '[]');
        const mesKey = `${selectedYear}-${pad(selectedMonth + 1)}`;
        return all
          .filter(g => g.month === mesKey)
          .reduce((sum, g) => sum + parseFloat(g.valor || g.amount || 0), 0);
      }
    } catch (error) {
      console.error('Error al calcular gastos del mes:', error);
      return 0;
    }
  }

  // ——— Renderizado ———
  async function generarCalendario() {
    let workDays = [];
    
    try {
      // Si el usuario está autenticado, usar la API
      if (window.apiService && window.apiService.isAuthenticated()) {
        const response = await window.apiService.workDay.getWorkDays(selectedYear, selectedMonth + 1);
        if (response.success) {
          workDays = response.data || [];
        }
      } else {
        // Fallback a localStorage si no hay autenticación
        workDays = JSON.parse(localStorage.getItem('diasTrabajados') || '[]');
      }
    } catch (error) {
      console.error('Error al obtener días trabajados:', error);
      workDays = [];
    }
    
    const primerDia = new Date(selectedYear, selectedMonth, 1).getDay();
    const ultimoDia = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    calendarioEl.innerHTML = '';

    ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      .forEach(d => calendarioEl.innerHTML += `<div><strong>${d}</strong></div>`);
    
    for (let i = 0; i < primerDia; i++) calendarioEl.innerHTML += '<div></div>';
    
    for (let d = 1; d <= ultimoDia; d++) {
      const fstr = `${selectedYear}-${pad(selectedMonth + 1)}-${pad(d)}`;
      
      // Buscar el día trabajado en la lista
      let reg;
      if (window.apiService && window.apiService.isAuthenticated()) {
        reg = workDays.find(r => {
          const fecha = r.date || r.fecha;
          return fecha === fstr;
        });
      } else {
        reg = workDays.find(r => r.fecha === fstr);
      }
      
      const estilo = reg
        ? 'background: var(--color-optionall); color: #fff;'
        : '';
        
      let pago = 0;
      if (reg) {
        if (window.apiService && window.apiService.isAuthenticated()) {
          pago = reg.amount || reg.total || 0;
        } else {
          pago = reg.total || 0;
        }
      }
      
      calendarioEl.innerHTML += `
      <div style="${estilo}">
      ${d}
      ${reg
        ? `<br><small>$${Math.round(pago).toLocaleString('en-US')}</small>`
        : ''}
      </div>`;
    }
  }

  async function listarDiasTrabajados() {
    let workDays = [];
    
    try {
      // Si el usuario está autenticado, usar la API
      if (window.apiService && window.apiService.isAuthenticated()) {
        const response = await window.apiService.workDay.getWorkDays(selectedYear, selectedMonth + 1);
        if (response.success) {
          workDays = response.data || [];
        }
      } else {
        // Fallback a localStorage si no hay autenticación
        workDays = JSON.parse(localStorage.getItem('diasTrabajados') || '[]')
          .filter(r => {
            const d = parseLocalDate(r.fecha);
            return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
          });
      }
      
      // Ordenar por fecha (más reciente primero)
      workDays.sort((a, b) => {
        const fechaA = a.date || a.fecha;
        const fechaB = b.date || b.fecha;
        return parseLocalDate(fechaB) - parseLocalDate(fechaA);
      });
      
      listaDiasEl.innerHTML = '';
      
      workDays.forEach(r => {
        const card = document.createElement('div');
        card.className = 'card-list';
        
        // Adaptar propiedades según el origen de los datos
        const fecha = r.date || r.fecha;
        const fechaFormateada = formatDate(fecha);
        const pago = r.amount || r.total || 0;
        const pagoStr = Math.round(pago).toLocaleString('en-US');
        const esFestivo = r.isHoliday || r.festivo || false;
        
        const badgeClass = esFestivo ? 'festivo' : '';
        const badgeText = esFestivo ? 'Festivo' : '';
        
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
            async () => {
              try {
                if (window.apiService && window.apiService.isAuthenticated()) {
                  // Eliminar usando la API
                  await window.apiService.workDay.deleteWorkDay(r.id);
                } else {
                  // Fallback a localStorage si no hay autenticación
                  const todos = JSON.parse(localStorage.getItem('diasTrabajados') || '[]')
                    .filter(x => (x.fecha !== fecha && x.date !== fecha));
                  localStorage.setItem('diasTrabajados', JSON.stringify(todos));
                }
                updateAll();
              } catch (error) {
                console.error('Error al eliminar día trabajado:', error);
                showMessage('Error al eliminar día trabajado: ' + (error.message || 'Error desconocido'));
              }
            }
          );
        });
        
        listaDiasEl.appendChild(card);
      });
    } catch (error) {
      console.error('Error al listar días trabajados:', error);
      listaDiasEl.innerHTML = '<div class="error-message">Error al cargar los días trabajados</div>';
    }
  }
  
  
  async function listarGastos() {
    let expenses = [];
    
    try {
      // Si el usuario está autenticado, usar la API
      if (window.apiService && window.apiService.isAuthenticated()) {
        const response = await window.apiService.expense.getExpenses(selectedYear, selectedMonth + 1);
        if (response.success) {
          expenses = response.data || [];
        }
      } else {
        // Fallback a localStorage si no hay autenticación
        expenses = JSON.parse(localStorage.getItem('gastos') || '[]')
          .map((g, i) => ({ ...g, idx: i }))
          .filter(g => g.month === `${selectedYear}-${pad(selectedMonth + 1)}`);
      }
      
      listaGastosEl.innerHTML = '';
      
      if (expenses.length === 0) {
        listaGastosEl.innerHTML = '<div class="info-message">No hay gastos registrados para este mes</div>';
        return;
      }
      
      expenses.forEach(g => {
        const card = document.createElement('div');
        card.className = 'card-list';
        
        // Adaptar propiedades según el origen de los datos
        const concepto = g.concept || g.concepto;
        const valor = g.amount || g.valor || 0;
        const valorStr = Number(valor).toLocaleString('en-US');
        const tag = g.tag || 'Personal';
        const isRecurring = g.isRecurring || false;
        
        // Añadir clase según la etiqueta
        let tagClass = '';
        if (tag === 'Fijo') tagClass = 'tag-fijo';
        else if (tag === 'Imprevisto') tagClass = 'tag-imprevisto';
        else if (tag === 'Personal') tagClass = 'tag-personal';
        
        card.innerHTML = `
        <div class="card-content">
          <div class="card-name">
            ${concepto}
            <span class="badge ${tagClass}">${tag}</span>
            ${isRecurring ? '<span class="badge tag-recurring">Recurrente</span>' : ''}
          </div>
          <div>$${valorStr}</div>
        </div>
        <button class="btn-delete">Eliminar?</button>
        `;
        
        listaGastosEl.appendChild(card);
        
        card.querySelector('.btn-delete').addEventListener('click', () => {
          showConfirm(
            `¿Eliminar gasto "${concepto}"?`,
            async () => {
              try {
                if (window.apiService && window.apiService.isAuthenticated()) {
                  // Eliminar usando la API
                  await window.apiService.expense.deleteExpense(g.id);
                } else {
                  // Eliminar de localStorage
                  const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
                  gastos.splice(g.idx, 1);
                  localStorage.setItem('gastos', JSON.stringify(gastos));
                }
                updateAll();
              } catch (error) {
                console.error('Error al eliminar gasto:', error);
                showMessage('Error al eliminar gasto: ' + (error.message || 'Error desconocido'));
              }
            }
          );
        });
      });
    } catch (error) {
      console.error('Error al listar gastos:', error);
      listaGastosEl.innerHTML = '<div class="error-message">Error al cargar los gastos</div>';
    }
  }

  // ——— Navegación de meses ———
  function changeMonth(delta) {
    selectedMonth += delta;
    if (selectedMonth < 0)    { selectedMonth = 11; selectedYear--; }
    if (selectedMonth > 11)   { selectedMonth = 0;  selectedYear++; }
    updateAll();
  }

    // ——— Nuevas funciones de conteo ———
  async function contarDiasTrabajadosMes() {
    try {
      // Si el usuario está autenticado, usar la API
      if (window.apiService && window.apiService.isAuthenticated()) {
        const response = await window.apiService.workDay.getWorkDaysSummary(selectedYear, selectedMonth + 1);
        if (response.success && response.data) {
          return response.data.count || 0;
        }
        return 0;
      } else {
        // Fallback a localStorage si no hay autenticación
        const regs = JSON.parse(localStorage.getItem('diasTrabajados')||'[]');
        return regs.filter(r => {
          const d = new Date(r.fecha);
          return d.getFullYear()===selectedYear && d.getMonth()===selectedMonth;
        }).length;
      }
    } catch (error) {
      console.error('Error al contar días trabajados:', error);
      return 0;
    }
  }

  async function contarGastosRegistradosMes() {
    try {
      // Si el usuario está autenticado, usar la API
      if (window.apiService && window.apiService.isAuthenticated()) {
        const response = await window.apiService.expense.getExpensesSummary(selectedYear, selectedMonth + 1);
        if (response.success && response.data && response.data.total) {
          return response.data.total.count || 0;
        }
        return 0;
      } else {
        // Fallback a localStorage si no hay autenticación
        const all = JSON.parse(localStorage.getItem('gastos')||'[]');
        const mesKey = `${selectedYear}-${pad(selectedMonth+1)}`;
        return all.filter(g => g.month===mesKey).length;
      }
    } catch (error) {
      console.error('Error al contar gastos:', error);
      return 0;
    }
  }

  // ——— Refrescar toda la vista ———
  async function updateAll() {
    try {
      const ingresos = await calcularIngresosMes();
      const gastos = await calcularGastosMes();
      const bal = ingresos - gastos;
      
      currentMonthEl.textContent = formatMonth(selectedMonth, selectedYear);
      ingresosMesEl.textContent = ingresos.toLocaleString('en-US');
      gastosMesEl.textContent = gastos.toLocaleString('en-US');
      balanceMesEl.textContent = bal.toLocaleString('en-US');
      
      // Contar días trabajados y gastos
      const diasTrabajados = await contarDiasTrabajadosMes();
      const gastosRegistrados = await contarGastosRegistradosMes();
      
      diasCodeEl.textContent = `${diasTrabajados} días trabajados`;
      gastosCodeEl.textContent = `${gastosRegistrados} gastos registrados`;
      balanceCodeEl.textContent = bal < 0 ? 'Fondos insuficientes' : 'Ahorro';
      
      // Actualizar vistas
      await generarCalendario();
      await listarDiasTrabajados();
      await listarGastos();
    } catch (error) {
      console.error('Error al actualizar la vista:', error);
      showMessage('Error al actualizar la vista: ' + (error.message || 'Error desconocido'));
    }
  }

// ——— Inicialización ———
async function init() {
  const hoy = new Date();
  selectedYear = hoy.getFullYear();
  selectedMonth = hoy.getMonth();

  // Inicializar servicios de API y autenticación si están disponibles
  if (window.authService) {
    window.authService.init();
  }

  prevMonthBtn.addEventListener('click', () => changeMonth(-1));
  nextMonthBtn.addEventListener('click', () => changeMonth(1));

  formDia.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = formDia.fecha.value;
    const t = formDia.tipoDia.value;
    const fs = formDia.esFestivo.checked;
    
    try {
      const reg = await registrarDiaTrabajado(f, t, fs);
      if (reg) {
        const total = reg.amount || reg.total || 0;
        showMessage(`Día ${f} registrado.\nTotal: $${Math.round(total)}`);
        formDia.reset();
        await updateAll();
      }
    } catch (error) {
      console.error('Error al registrar día:', error);
      showMessage('Error al registrar día: ' + (error.message || 'Error desconocido'));
    }
  });

  formGasto.addEventListener('submit', async (e) => {
    e.preventDefault();
    const c = document.getElementById('conceptoGasto').value.trim();
    const v = parseFloat(document.getElementById('valorGasto').value);
    
    // Obtener la etiqueta seleccionada
    let tag = 'Personal';
    const tagSelect = document.getElementById('tagGasto');
    if (tagSelect) {
      tag = tagSelect.value;
    }
    
    // Los gastos fijos son automáticamente recurrentes
    let isRecurring = tag === 'Fijo';
    
    try {
      // Si el usuario está autenticado, usar la API
      if (window.apiService && window.apiService.isAuthenticated()) {
        const response = await window.apiService.expense.createExpense({
          concept: c,
          amount: v,
          tag: tag,
          date: `${selectedYear}-${pad(selectedMonth + 1)}-01`, // Primer día del mes seleccionado
          isRecurring: isRecurring
        });
        
        if (response.success) {
          showMessage(`Gasto "${c}" agregado: $${v.toFixed(2)}`);
          formGasto.reset();
          await updateAll();
        }
      } else {
        // Fallback a localStorage si no hay autenticación
        const g = await registrarGasto(c, v, tag, isRecurring);
        if (g) {
          showMessage(`Gasto "${c}" agregado: $${v.toFixed(2)}`);
          formGasto.reset();
          await updateAll();
        }
      }
    } catch (error) {
      console.error('Error al registrar gasto:', error);
      showMessage('Error al registrar gasto: ' + (error.message || 'Error desconocido'));
    }
  });

  // Botón para generar gastos recurrentes (si existe)
  const btnGenerarRecurrentes = document.getElementById('btnGenerarRecurrentes');
  if (btnGenerarRecurrentes) {
    btnGenerarRecurrentes.addEventListener('click', async () => {
      try {
        if (window.apiService && window.apiService.isAuthenticated()) {
          // Primero obtenemos los gastos fijos del mes actual
          const expensesResponse = await window.apiService.expense.getExpenses(
            selectedYear, 
            selectedMonth + 1,
            'Fijo'
          );
          
          // Luego generamos los gastos recurrentes
          const response = await window.apiService.expense.generateRecurringExpenses(
            selectedYear, 
            selectedMonth + 1
          );
          
          if (response.success) {
            const count = response.data.length;
            let message = `Gastos recurrentes para este mes.`;
            
            // Si hay gastos fijos, mostrar un resumen
            if (expensesResponse.success && expensesResponse.data.length > 0) {
              const fixedExpenses = expensesResponse.data;
              const totalFixed = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
              
              message += `\n\nResumen de Gastos Fijos del Mes:\n`;
              message += `Total: $${Math.round(totalFixed).toLocaleString('en-US')}\n\n`;
              
              // Mostrar detalle de cada gasto fijo
              fixedExpenses.forEach(expense => {
                message += `- ${expense.concept}: $${Math.round(expense.amount).toLocaleString('en-US')}\n`;
              });
            } else {
              message += `\n\nNo hay gastos fijos registrados para este mes.`;
            }
            
            showMessage(message);
            await updateAll();
          }
        } else {
          showMessage('Debe iniciar sesión para usar esta función.');
        }
      } catch (error) {
        console.error('Error al generar gastos recurrentes:', error);
        showMessage('Error al generar gastos recurrentes: ' + (error.message || 'Error desconocido'));
      }
    });
  }

  await updateAll();
}

// ——— Generar documento PDF con formato específico ———
async function generarCuentaCobroPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  try {
    // Obtener datos del usuario si está autenticado
    let userData = {
      name: 'Juan Pérez',
      identification: '0123456789',
      companyName: 'Mi Empresa S.A.S.',
      companyNit: '123456789-0',
      companyCity: 'Pereira',
    };
    
    // Si el usuario está autenticado, obtener sus datos del perfil
    if (window.apiService && window.apiService.isAuthenticated()) {
      try {
        const response = await window.apiService.auth.getProfile();
        if (response.success && response.data) {
          userData = {
            name: response.data.name || userData.name,
            identification: response.data.identification || userData.identification,
            companyName: response.data.companyName || userData.companyName,
            companyNit: response.data.companyNit || userData.companyNit,
            companyCity: response.data.companyCity || userData.companyCity,
          };
        }
      } catch (error) {
        console.error('Error al obtener perfil de usuario:', error);
      }
    }
    
    const nombre = userData.name;
    const cedula = userData.identification;
    const concepto = 'Servicios prestados';
    const empresa = userData.companyName;
    const nit = userData.companyNit;
    const ciudad = userData.companyCity;

    // Fecha actual
    const hoy = new Date();
    const dia = hoy.getDate();
    const mesTexto = formatMonth(hoy.getMonth(), hoy.getFullYear()).split(' ')[0];
    const año = hoy.getFullYear();
    const fechaTexto = `${ciudad}, ${dia} de ${mesTexto} del ${año}`;

    // Ingresos actuales
    const total = await calcularIngresosMes();
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
  } catch (error) {
    console.error('Error al generar PDF:', error);
    showMessage('Error al generar PDF: ' + (error.message || 'Error desconocido'));
  }
}

// Botón
const btnWord = document.getElementById('btnGenerarWord');
btnWord.addEventListener('click', generarCuentaCobroPDF);


  window.addEventListener('load', init);

  
})();

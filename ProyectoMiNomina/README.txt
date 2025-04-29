# Mi Nómina - Proyecto de Gestión de Ingresos y Gastos

Bienvenido al proyecto **Mi Nómina**, una aplicación web sencilla e intuitiva que te permite registrar y gestionar tus días trabajados, gastos mensuales y generar cuentas de cobro en formato PDF de manera automática.

Este README documenta toda la estructura, funcionamiento, tecnologías utilizadas y guía de uso.

---

## ✨ Características principales

- **Registrar días trabajados**: Guarda la fecha, tipo de jornada (medio tiempo o tiempo completo) y si fue un día festivo. (INCOMPLETO : Se necesita que el usuario pueda agregar sus propias jornadas,
con sus respectivos pagos)
- **Registrar gastos del mes**: Guarda gastos con concepto y valor.
- **Visualizar calendario del mes**: Muestra los días trabajados resaltados.
- **Listado de días trabajados recientes**: Visualiza días trabajados ordenados, con formato amigable.
- **Listado de gastos recientes**: Visualiza los gastos registrados por mes.
- **Resumen mensual**:
  - Total ingresos.
  - Total gastos.
  - Balance neto (muestra "Fondos insuficientes" si el balance es negativo).
- **Generar Cuenta de Cobro (PDF)**: Genera automáticamente un documento PDF formal basado en los ingresos mensuales.(INCOMPLETO : Se necesita que el usuario pueda ingresar al iniciar sesion, sus datos,
para luego poder utilizarlos en la generacion de la cuenta de cobro)

(INCOMPLETO: Se debe de realizar el login para cada usuario en especifico)

---

## 🛠️ Tecnologías utilizadas

- **HTML5** y **CSS3**: Estructura y estilo.
- **JavaScript Vanilla (ES6+)**: Lógica y dinámica.
- **LocalStorage**: Almacenamiento de datos local.
- **jsPDF**: Generación de documentos PDF en el navegador.

Bibliotecas externas:
- [jsPDF 2.5.1](https://cdnjs.com/libraries/jspdf)

---

## 📂 Estructura del proyecto

```
/ (raíz del proyecto)
├── index.html          # Estructura HTML principal
├── css/
│   └── styles.css      # Estilos personalizados
├── js/
│   └── app.js          # Lógica y manejo de eventos
├── README.md           # (este archivo)
```


## 🧠 Detalles técnicos importantes

- **Registro de días trabajados**:
  - Tiempo completo y medio tiempo manejan tarifas diferentes.
  - Los días festivos aplican un incremento al pago.
  - La información se almacena en LocalStorage (`diasTrabajados`).

- **Registro de gastos**:
  - Se guarda el concepto y valor.
  - Asociado al mes y año actuales.
  - Información guardada en LocalStorage (`gastos`).

- **Resumen y balance**:
  - Calculado automáticamente para el mes y año seleccionados.
  - Actualiza en tiempo real al registrar o eliminar días o gastos.

- **Generación del PDF**:
  - Usa datos fijos de empresa, nombre, cédula y concepto.(Esto se cambiará proximamente)
  - El PDF incluye:
    - Fecha de emisión.
    - Empresa y NIT.
    - Nombre del trabajador y C.C.
    - Total a pagar.
    - Concepto del cobro.
    - Espacio de firma.(El usuario deberá poder subir un fotografia de su firma)

---

## 🖌️ Detalles de diseño

- Diseño minimalista y responsivo.
- Interacción intuitiva:
  - Botones visibles sólo al pasar el puntero.
  - Difuminado de tarjetas al hacer hover.
- Modal de confirmación amigable para eliminar días o gastos.

---

## 📅 Mejoras futuras sugeridas

- Soporte para múltiples perfiles de usuario.
- Configuración de empresa y datos dinámicos.
- Exportar resumen mensual completo en PDF.
- Estadísticas de ahorro vs gasto mensual.

---

## 🧑‍💻 Autor y créditos

Proyecto desarrollado con dedicación para aprender y practicar manejo de datos locales, generación de documentos en el cliente, y buenas prácticas de organización de aplicaciones web.

¡Gracias por usar **Mi Nómina**!

---



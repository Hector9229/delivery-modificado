/**
 * prototipo-delivery-b/script.js — Variante B (A/B)
 * Modificaciones:
 * - Fondo gris en header + letras blancas
 * - Botón para eliminar platos en el resumen
 * - Animación de confirmación al agregar plato
 */

(function () {
  'use strict';

  var RESTAURANTES = [
    { id: 'r1', nombre: 'Pizzería Napoli', categoria: 'pizza', img: './assets/rest-r1.svg' },
    { id: 'r2', nombre: 'Sushi Roll', categoria: 'asiatica', img: './assets/rest-r2.svg' },
    { id: 'r3', nombre: 'Burger Norte', categoria: 'hamburguesas', img: './assets/rest-r3.svg' },
    { id: 'r4', nombre: 'Mamma Mia Express', categoria: 'pizza', img: './assets/rest-r4.svg' }
  ];

  var MENU = {
    r1: [
      { id: 'm1', nombre: 'Margarita', precio: 8.5, img: './assets/dish-m1.svg' },
      { id: 'm2', nombre: 'Cuatro quesos', precio: 10.9, img: './assets/dish-m2.svg' }
    ],
    r2: [
      { id: 'm3', nombre: 'Menú maki (12 pzs)', precio: 14.0, img: './assets/dish-m3.svg' },
      { id: 'm4', nombre: 'Yakisoba', precio: 9.5, img: './assets/dish-m4.svg' }
    ],
    r3: [
      { id: 'm5', nombre: 'Clásica + patatas', precio: 11.0, img: './assets/dish-m5.svg' },
      { id: 'm6', nombre: 'Veggie', precio: 10.5, img: './assets/dish-m6.svg' }
    ],
    r4: [
      { id: 'm7', nombre: 'Calzone', precio: 9.0, img: './assets/dish-m7.svg' },
      { id: 'm8', nombre: 'Prosciutto', precio: 11.5, img: './assets/dish-m8.svg' }
    ]
  };

  var restauranteActual = null;
  var pedido = [];

  // Elementos del DOM
  var elFiltro = document.getElementById('filtro-cat');
  var elListaRest = document.getElementById('lista-restaurantes');
  var elStepRest = document.getElementById('step-restaurante');
  var elStepProd = document.getElementById('step-productos');
  var elStepRes = document.getElementById('step-resumen');
  var elStepConf = document.getElementById('step-confirmacion');
  var elTituloRest = document.getElementById('titulo-restaurante');
  var elListaPlatos = document.getElementById('lista-platos');
  var elListaResumen = document.getElementById('lista-resumen');
  var elResumenVacio = document.getElementById('resumen-vacio');
  var elTotal = document.getElementById('total-delivery');

  function mostrarSoloPanel(panel) {
    var panels = [elStepRest, elStepProd, elStepRes, elStepConf];
    panels.forEach(p => {
      var on = p === panel;
      p.classList.toggle('active', on);
      p.hidden = !on;
    });
    actualizarIndicadoresPasos(panel);
  }

  function actualizarIndicadoresPasos(panel) {
    var n = '0';
    if (panel === elStepRest) n = '1';
    if (panel === elStepProd) n = '2';
    if (panel === elStepRes) n = '3';
    if (panel === elStepConf) n = '3';

    document.querySelectorAll('[data-step-indicator]').forEach(el => {
      var step = el.getAttribute('data-step-indicator');
      el.classList.toggle('active', step === n || (panel === elStepConf && step === '3'));
    });
  }

  function filtrarRestaurantes() {
    var cat = elFiltro.value;
    elListaRest.innerHTML = '';
    RESTAURANTES.forEach(r => {
      if (cat !== 'todas' && r.categoria !== cat) return;

      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card-rest';
      btn.setAttribute('data-rest', r.id);
      btn.innerHTML = `
        <span class="card-rest__media"><img src="${r.img}" width="72" height="72" alt="" loading="lazy"></span>
        <span class="card-rest__body"><strong>${escapeHtml(r.nombre)}</strong><span class="tag">${escapeHtml(r.categoria)}</span></span>
      `;
      li.appendChild(btn);
      elListaRest.appendChild(li);
    });
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;');
  }

  function abrirMenu(restId) {
    restauranteActual = restId;
    var r = RESTAURANTES.find(rest => rest.id === restId);
    elTituloRest.textContent = r ? r.nombre : 'Menú';

    var platos = MENU[restId] || [];
    elListaPlatos.innerHTML = '';

    platos.forEach(pl => {
      var li = document.createElement('li');
      li.className = 'plato-row';
      li.innerHTML = `
        <img class="plato-thumb" src="${pl.img}" width="52" height="52" alt="">
        <div class="plato-info"><span class="plato-nombre">${escapeHtml(pl.nombre)}</span></div>
        <span class="plato-precio">${formatEuros(pl.precio)}</span>
        <button type="button" class="btn-mini" 
                data-add-plato="${pl.id}" 
                data-nombre="${escapeAttr(pl.nombre)}" 
                data-precio="${pl.precio}" 
                data-img="${escapeAttr(pl.img)}">+</button>
      `;
      elListaPlatos.appendChild(li);
    });

    mostrarSoloPanel(elStepProd);
  }

  function lineaPedido(idPlato) {
    return pedido.find(item => item.idPlato === idPlato);
  }

  function agregarPlato(idPlato, nombre, precio, img) {
    var linea = lineaPedido(idPlato);
    if (linea) {
      linea.cantidad += 1;
    } else {
      pedido.push({ idPlato, nombre, precioUnit: precio, cantidad: 1, img });
    }

    // Animación de confirmación
    mostrarConfirmacionAgregado(nombre);
  }

  function mostrarConfirmacionAgregado(nombre) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; 
      bottom: 90px; 
      left: 50%; 
      transform: translateX(-50%);
      background: #ff3008; 
      color: white; 
      padding: 14px 24px; 
      border-radius: 999px;
      font-weight: 600; 
      box-shadow: 0 6px 20px rgba(255,48,8,0.4);
      z-index: 10000; 
      white-space: nowrap; 
      font-size: 1rem;
      animation: slideUp 0.3s ease forwards, fadeOut 2.8s 0.6s forwards;
    `;
    toast.textContent = `✓ ${nombre} agregado`;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
  }

  function eliminarPlato(idPlato) {
    pedido = pedido.filter(item => item.idPlato !== idPlato);
    pintarResumen();
  }

  function totalPedido() {
    return pedido.reduce((sum, item) => sum + item.precioUnit * item.cantidad, 0);
  }

  function formatEuros(n) {
    return Number(n).toFixed(2).replace('.', ',') + ' €';
  }

  function pintarResumen() {
    elListaResumen.innerHTML = '';

    if (pedido.length === 0) {
      elResumenVacio.hidden = false;
    } else {
      elResumenVacio.hidden = true;
    }

    pedido.forEach(l => {
      var li = document.createElement('li');
      li.className = 'resumen-line';
      li.innerHTML = `
        <img class="resumen-thumb" src="${l.img}" width="40" height="40" alt="">
        <span class="resumen-nombre">${escapeHtml(l.nombre)} × ${l.cantidad}</span>
        <span class="resumen-precio">${formatEuros(l.precioUnit * l.cantidad)}</span>
        <button type="button" class="btn-eliminar" data-delete-plato="${l.idPlato}" title="Eliminar">✕</button>
      `;
      elListaResumen.appendChild(li);
    });

    elTotal.textContent = formatEuros(totalPedido());
  }

  // ====================== EVENTOS ======================

  elListaRest.addEventListener('click', e => {
    var btn = e.target.closest('[data-rest]');
    if (btn) abrirMenu(btn.getAttribute('data-rest'));
  });

  elFiltro.addEventListener('change', filtrarRestaurantes);

  elListaPlatos.addEventListener('click', e => {
    var b = e.target.closest('[data-add-plato]');
    if (!b) return;
    var id = b.getAttribute('data-add-plato');
    var nombre = b.getAttribute('data-nombre');
    var precio = parseFloat(b.getAttribute('data-precio'));
    var img = b.getAttribute('data-img') || '';
    agregarPlato(id, nombre, precio, img);
  });

  // Eliminar plato desde el resumen
  elListaResumen.addEventListener('click', e => {
    var btn = e.target.closest('[data-delete-plato]');
    if (btn) {
      var idPlato = btn.getAttribute('data-delete-plato');
      eliminarPlato(idPlato);
    }
  });

  document.getElementById('btn-volver-rest').addEventListener('click', () => mostrarSoloPanel(elStepRest));
  
  document.getElementById('btn-carrito').addEventListener('click', () => {
    pintarResumen();
    mostrarSoloPanel(elStepRes);
  });

  document.getElementById('btn-seguir-comprando').addEventListener('click', () => {
    if (restauranteActual) abrirMenu(restauranteActual);
    else mostrarSoloPanel(elStepRest);
  });

  document.getElementById('btn-comprar').addEventListener('click', () => {
    if (pedido.length === 0) {
      alert('Añada al menos un plato antes de confirmar.');
      return;
    }
    var nombreRest = RESTAURANTES.find(r => r.id === restauranteActual)?.nombre || '';
    document.getElementById('msg-confirm').textContent = 
      `Su pedido en ${nombreRest} por ${formatEuros(totalPedido())} está en preparación. Tiempo aproximado: 35 minutos.`;
    
    pedido = [];
    pintarResumen();
    mostrarSoloPanel(elStepConf);
  });

  document.getElementById('btn-nuevo').addEventListener('click', () => {
    restauranteActual = null;
    mostrarSoloPanel(elStepRest);
  });

  // Estilos del botón eliminar y animación del toast
  const style = document.createElement('style');
  style.textContent = `
    .btn-eliminar {
      background: #ff3008;
      color: white;
      border: none;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      font-size: 16px;
      cursor: pointer;
      margin-left: 10px;
      flex-shrink: 0;
    }
    .btn-eliminar:hover {
      background: #e62b06;
      transform: scale(1.1);
    }

    @keyframes slideUp {
      from { transform: translate(-50%, 30px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes fadeOut {
      to { opacity: 0; transform: translate(-50%, 10px); }
    }
  `;
  document.head.appendChild(style);

  // Inicializar página
  filtrarRestaurantes();
})();

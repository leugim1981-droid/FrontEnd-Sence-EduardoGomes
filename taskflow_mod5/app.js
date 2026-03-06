/* =========================================================
   TaskFlow – App JS (POO + DOM + Eventos + Asincronía + API)
   ========================================================= */

/* ---------------------------
   Helpers
--------------------------- */
const $ = (selector) => document.querySelector(selector);

const formatDateTime = (date) =>
  new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(date);

const daysToMs = (days) => days * 24 * 60 * 60 * 1000;

const safeJSONParse = (value, fallback) => {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
};

const toast = (() => {
  const el = $('#toast');
  let timer = null;

  return (message) => {
    el.textContent = message;
    el.classList.add('toast--show');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove('toast--show'), 2200);
  };
})();

/* ---------------------------
   POO: Clase Tarea
--------------------------- */
class Tarea {
  constructor({ id, descripcion, estado = 'pendiente', fechaCreacion = new Date(), fechaLimite = null }) {
    this.id = id;
    this.descripcion = descripcion;
    this.estado = estado; // 'pendiente' | 'completada'
    this.fechaCreacion = fechaCreacion instanceof Date ? fechaCreacion : new Date(fechaCreacion);
    this.fechaLimite = fechaLimite ? new Date(fechaLimite) : null;
  }

  cambiarEstado = () => {
    this.estado = this.estado === 'pendiente' ? 'completada' : 'pendiente';
  };

  actualizarDescripcion = (nuevaDescripcion) => {
    this.descripcion = nuevaDescripcion;
  };

  actualizarFechaLimite = (nuevaFechaLimite) => {
    this.fechaLimite = nuevaFechaLimite ? new Date(nuevaFechaLimite) : null;
  };

  get estaVencida() {
    if (!this.fechaLimite) return false;
    return this.estado !== 'completada' && new Date() > this.fechaLimite;
  }

  get resumen() {
    // template literals (ES6)
    return `${this.descripcion} (${this.estado})`;
  }
}

/* ---------------------------
   POO: Clase GestorTareas
--------------------------- */
class GestorTareas {
  #tareas = [];
  #storageKey = 'taskflow.tareas';

  constructor() {
    this.cargarDesdeLocalStorage();
  }

  get tareas() {
    return [...this.#tareas]; // spread operator
  }

  agregarTarea = ({ descripcion, fechaLimite }) => {
    const tarea = new Tarea({
      id: crypto.randomUUID(),
      descripcion,
      fechaLimite: fechaLimite || null
    });

    this.#tareas = [tarea, ...this.#tareas];
    this.guardarEnLocalStorage();
    return tarea;
  };

  eliminarTarea = (id) => {
    this.#tareas = this.#tareas.filter((t) => t.id !== id);
    this.guardarEnLocalStorage();
  };

  cambiarEstadoTarea = (id) => {
    const tarea = this.#tareas.find((t) => t.id === id);
    if (tarea) {
      tarea.cambiarEstado();
      this.guardarEnLocalStorage();
    }
  };

  editarTarea = (id, { descripcion, fechaLimite }) => {
    const tarea = this.#tareas.find((t) => t.id === id);
    if (!tarea) return;

    if (typeof descripcion === 'string') tarea.actualizarDescripcion(descripcion);
    if (fechaLimite !== undefined) tarea.actualizarFechaLimite(fechaLimite);

    this.guardarEnLocalStorage();
  };

  borrarTodo = () => {
    this.#tareas = [];
    this.guardarEnLocalStorage();
  };

  filtrar = (filtro) => {
    if (filtro === 'pending') return this.#tareas.filter((t) => t.estado === 'pendiente');
    if (filtro === 'done') return this.#tareas.filter((t) => t.estado === 'completada');
    return this.#tareas;
  };

  guardarEnLocalStorage = () => {
    const data = this.#tareas.map((t) => ({
      id: t.id,
      descripcion: t.descripcion,
      estado: t.estado,
      fechaCreacion: t.fechaCreacion.toISOString(),
      fechaLimite: t.fechaLimite ? t.fechaLimite.toISOString() : null
    }));
    localStorage.setItem(this.#storageKey, JSON.stringify(data));
  };

  cargarDesdeLocalStorage = () => {
    const raw = localStorage.getItem(this.#storageKey);
    const data = safeJSONParse(raw, []);

    this.#tareas = data.map((t) => new Tarea(t));
  };
}

/* ---------------------------
   DOM references
--------------------------- */
const taskForm = $('#taskForm');
const taskDesc = $('#taskDesc');
const taskDue = $('#taskDue');
const taskList = $('#taskList');
const emptyState = $('#emptyState');
const charCount = $('#charCount');
const clearAllBtn = $('#clearAllBtn');
const loadApiBtn = $('#loadApiBtn');
const saveApiBtn = $('#saveApiBtn');
const apiStatus = $('#apiStatus');

/* ---------------------------
   Estado de UI
--------------------------- */
const gestor = new GestorTareas();
let filtroActual = 'all';
let countdownTimers = new Map(); // id -> intervalId

/* ---------------------------
   Render
--------------------------- */
const setEmptyState = (hasItems) => {
  emptyState.style.display = hasItems ? 'none' : 'block';
};

const badgeHTML = (tarea) => {
  if (tarea.estado === 'completada') return '<span class="badge badge--done">✓ Completada</span>';
  if (tarea.estaVencida) return '<span class="badge badge--overdue">⚠ Vencida</span>';
  return '<span class="badge badge--pending">⏳ Pendiente</span>';
};

const countdownText = (tarea) => {
  if (!tarea.fechaLimite) return '';
  const now = new Date();
  const diff = tarea.fechaLimite - now;

  if (diff <= 0) return 'Tiempo límite alcanzado';
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  // destructuring + template literals
  const parts = { days, hours, mins, secs };
  const { days: d, hours: h, mins: m, secs: s } = parts;

  const pad2 = (n) => String(n).padStart(2, '0');
  return `⏱ ${d}d ${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};

const clearCountdowns = () => {
  for (const [, intervalId] of countdownTimers) clearInterval(intervalId);
  countdownTimers.clear();
};

const startCountdownForTask = (taskId) => {
  // evita duplicar intervalos
  if (countdownTimers.has(taskId)) return;

  const intervalId = setInterval(() => {
    const el = document.querySelector(`[data-countdown="${taskId}"]`);
    if (!el) {
      clearInterval(intervalId);
      countdownTimers.delete(taskId);
      return;
    }

    const tarea = gestor.tareas.find((t) => t.id === taskId);
    if (!tarea || tarea.estado === 'completada' || !tarea.fechaLimite) {
      el.textContent = '';
      clearInterval(intervalId);
      countdownTimers.delete(taskId);
      return;
    }

    el.textContent = countdownText(tarea);
  }, 1000);

  countdownTimers.set(taskId, intervalId);
};

const render = () => {
  clearCountdowns();

  const tareas = gestor.filtrar(filtroActual);
  taskList.innerHTML = '';

  setEmptyState(tareas.length > 0);

  tareas.forEach((tarea) => {
    const li = document.createElement('li');
    li.className = 'task';
    li.dataset.id = tarea.id;

    li.innerHTML = `
      <div class="task__main">
        <div class="task__desc">${tarea.descripcion}</div>
        <div class="task__meta">
          ${badgeHTML(tarea)}
          <span class="badge">🗓 Creada: ${formatDateTime(tarea.fechaCreacion)}</span>
          ${tarea.fechaLimite ? `<span class="badge">🎯 Límite: ${new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(tarea.fechaLimite)}</span>` : ''}
          <span class="badge" data-countdown="${tarea.id}">${tarea.estado !== 'completada' ? countdownText(tarea) : ''}</span>
        </div>
      </div>

      <div class="task__actions">
        <button class="iconBtn" data-action="toggle" title="Cambiar estado">✅</button>
        <button class="iconBtn" data-action="edit" title="Editar">✏️</button>
        <button class="iconBtn" data-action="delete" title="Eliminar">🗑️</button>
      </div>
    `;

    taskList.appendChild(li);

    if (tarea.fechaLimite && tarea.estado !== 'completada') {
      startCountdownForTask(tarea.id);
    }
  });
};

/* ---------------------------
   Eventos: formulario
--------------------------- */
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const descripcion = taskDesc.value.trim();
  const fechaLimite = taskDue.value ? new Date(taskDue.value) : null;

  if (!descripcion) return;

  // Asincronía: simulamos retardo al agregar (setTimeout)
  apiStatus.textContent = '';
  toast('Agregando tarea... (simulación de retardo)');

  setTimeout(() => {
    gestor.agregarTarea({
      descripcion,
      // guardamos ISO para ser consistentes
      fechaLimite: fechaLimite ? fechaLimite.toISOString() : null
    });

    render();
    taskDesc.value = '';
    taskDue.value = '';
    charCount.textContent = '0 / 80';

    // Notificación tras 2 segundos (extra requerido)
    setTimeout(() => toast('✅ Tarea agregada'), 2000);
  }, 650);
});

/* keyup para interactividad (contador de caracteres) */
taskDesc.addEventListener('keyup', (e) => {
  const max = 80;
  const value = e.target.value.slice(0, max);
  if (e.target.value !== value) e.target.value = value;
  charCount.textContent = `${value.length} / ${max}`;
});

/* mouseover para interactividad (tip simple) */
taskForm.addEventListener('mouseover', () => {
  $('#formTip').textContent = 'Tip: describe claro y breve para facilitar la gestión';
});
taskForm.addEventListener('mouseleave', () => {
  $('#formTip').textContent = 'Tip: presiona Enter para agregar';
});

/* ---------------------------
   Eventos: acciones por delegación
--------------------------- */
taskList.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;
  const li = e.target.closest('.task');
  const id = li?.dataset.id;
  if (!id) return;

  if (action === 'toggle') {
    gestor.cambiarEstadoTarea(id);
    render();
    toast('Estado actualizado');
    return;
  }

  if (action === 'delete') {
    gestor.eliminarTarea(id);
    render();
    toast('Tarea eliminada');
    return;
  }

  if (action === 'edit') {
    const tarea = gestor.tareas.find((t) => t.id === id);
    if (!tarea) return;

    const nuevaDesc = prompt('Editar descripción:', tarea.descripcion);
    if (nuevaDesc === null) return;

    const nuevaDescTrim = nuevaDesc.trim();
    if (!nuevaDescTrim) {
      toast('No se guardó: descripción vacía');
      return;
    }

    const nuevaFecha = prompt(
      'Editar fecha límite (YYYY-MM-DD). Deja vacío para quitarla:',
      tarea.fechaLimite ? tarea.fechaLimite.toISOString().slice(0, 10) : ''
    );

    const fechaLimite = nuevaFecha ? new Date(nuevaFecha).toISOString() : null;

    gestor.editarTarea(id, { descripcion: nuevaDescTrim, fechaLimite });
    render();
    toast('Tarea editada');
  }
});

/* ---------------------------
   Filtros
--------------------------- */
document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    filtroActual = chip.dataset.filter;

    document.querySelectorAll('.chip').forEach((c) => c.classList.remove('chip--active'));
    chip.classList.add('chip--active');

    render();
  });
});

/* ---------------------------
   Borrar todo
--------------------------- */
clearAllBtn.addEventListener('click', () => {
  if (!confirm('¿Seguro que quieres borrar TODAS las tareas?')) return;
  gestor.borrarTodo();
  render();
  toast('Se borraron todas las tareas');
});

/* ---------------------------
   API: JSONPlaceholder (fetch + try/catch)
   - GET: traer 5 tareas demo
   - POST: simular guardado
--------------------------- */
const API_URL = 'https://jsonplaceholder.typicode.com/todos';

const setApiStatus = (text) => {
  apiStatus.textContent = text;
};

const obtenerTareasAPI = async () => {
  try {
    setApiStatus('Cargando desde API...');

    const res = await fetch(`${API_URL}?_limit=5`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // convertimos a tareas locales
    data.forEach((item) => {
      const { title, completed, id } = item; // destructuring
      gestor.agregarTarea({
        descripcion: `API #${id}: ${title}`,
        fechaLimite: completed ? null : new Date(Date.now() + daysToMs(2)).toISOString()
      });
    });

    render();
    toast('✅ Tareas demo cargadas');
    setApiStatus('Listo ✅');
  } catch (err) {
    console.error(err);
    setApiStatus('Error al cargar ❌');
    toast('Error al obtener tareas de API (ver consola)');
  }
};

const guardarTareaAPI = async () => {
  try {
    setApiStatus('Guardando (POST)...');

    const payload = {
      title: 'TaskFlow demo task',
      completed: false,
      userId: 1
    };

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    setApiStatus(`POST OK ✅ (id devuelto: ${data.id})`);
    toast('POST realizado (simulado)');
  } catch (err) {
    console.error(err);
    setApiStatus('Error en POST ❌');
    toast('Error al guardar en API (ver consola)');
  }
};

loadApiBtn.addEventListener('click', obtenerTareasAPI);
saveApiBtn.addEventListener('click', guardarTareaAPI);

/* ---------------------------
   Inicialización
--------------------------- */
render();

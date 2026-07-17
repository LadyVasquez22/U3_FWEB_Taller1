const btnEvaluar = document.getElementById("btnEvaluar");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnListar = document.getElementById("btnListar");
const btnBuscar = document.getElementById("btnBuscar");
const btnRanking = document.getElementById("btnRanking");

// Arreglo global solicitado para guardar el historial.
const estudiantes = [];

btnEvaluar.addEventListener("click", evaluarEstudiante);
btnLimpiar.addEventListener("click", limpiarFormulario);
btnListar.addEventListener("click", () => mostrarTabla(estudiantes));
btnRanking.addEventListener("click", mostrarRanking);
btnBuscar.addEventListener("click", buscarEstudiante);

function evaluarEstudiante() {
    const nombre = document.getElementById("nombre").value.trim();
    const carrera = document.getElementById("carrera").value;
    const textosNotas = ["nota1", "nota2", "nota3", "nota4"].map(obtenerNota);

    if (!nombre || !carrera || textosNotas.some(texto => texto === "")) {
        mostrarResultado("Debe completar todos los campos.", "danger");
        return;
    }
    if (nombre.length < 5) {
        mostrarResultado("El nombre debe tener al menos 5 caracteres.", "danger");
        return;
    }
    if (nombreRepetido(nombre)) {
        mostrarResultado("Ya existe un estudiante registrado con ese nombre.", "danger");
        return;
    }

    const notas = textosNotas.map(Number);
    if (existeNotaInvalida(notas)) {
        mostrarResultado("Cada nota debe ser un número entre 0 y 20.", "danger");
        return;
    }

    const promedio = calcularPromedio(notas);
    const promedioEspecial = calcularPromedioEspecial(notas);
    const notaMayor = obtenerNotaMayor(notas);
    const notaMenor = obtenerNotaMenor(notas);
    const estado = clasificarEstado(promedio);
    const rendimiento = clasificarRendimiento(promedio);
    const beca = calcularBeca(carrera, promedio);
    const recomendacion = generarRecomendacion(promedio);
    const conteoNotas = contarNotas(notas);

    const estudiante = {
        nombre,
        carrera,
        notas,
        promedio: Number(promedio.toFixed(2)),
        promedioEspecial: Number(promedioEspecial.toFixed(2)),
        notaMayor,
        notaMenor,
        estado,
        rendimiento,
        beca: beca.mensaje,
        recomendacion
    };

    estudiantes.push(estudiante);
    mostrarResultado(construirMensaje(estudiante, conteoNotas), obtenerColorEstado(estado));
    mostrarBeca(beca);
    mostrarJSON(estudiante);
    actualizarResumenCurso();
}

function obtenerNota(id) {
    return document.getElementById(id).value.trim();
}

function existeNotaInvalida(notas) {
    return notas.some(nota => !Number.isFinite(nota) || nota < 0 || nota > 20);
}

function calcularPromedio(notas) {
    return notas.reduce((suma, nota) => suma + nota, 0) / notas.length;
}

function obtenerNotaMayor(notas) {
    return Math.max(...notas);
}

function obtenerNotaMenor(notas) {
    return Math.min(...notas);
}

function calcularPromedioEspecial(notas) {
    const copia = [...notas];
    copia.splice(copia.indexOf(obtenerNotaMenor(copia)), 1);
    return calcularPromedio(copia);
}

function clasificarEstado(promedio) {
    if (promedio >= 14) return "Aprobado";
    if (promedio >= 10) return "Recuperación";
    return "Reprobado";
}

function contarNotas(notas) {
    const conteo = { aprobadas: 0, recuperacion: 0, reprobadas: 0 };
    notas.forEach(nota => {
        if (nota >= 14) conteo.aprobadas++;
        else if (nota >= 10) conteo.recuperacion++;
        else conteo.reprobadas++;
    });
    return conteo;
}

function generarRecomendacion(promedio) {
    if (promedio >= 18) return "Mantener el desempeño y apoyar a compañeros.";
    if (promedio >= 14) return "Reforzar temas específicos.";
    if (promedio >= 10) return "Asistir a tutorías y practicar ejercicios.";
    return "Repetir contenidos base y solicitar acompañamiento.";
}

function clasificarRendimiento(promedio) {
    if (promedio >= 18) return "Alto";
    if (promedio >= 14) return "Medio";
    if (promedio >= 10) return "Básico";
    return "Bajo";
}

function calcularBeca(carrera, promedio) {
    if (carrera === "TI" && promedio > 18) return { mensaje: "Beca académica del 100%", color: "success" };
    if (carrera === "Software" && promedio > 17) return { mensaje: "Beca académica del 80%", color: "primary" };
    if (carrera === "Sistemas" && promedio > 16) return { mensaje: "Beca académica del 60%", color: "warning" };
    return { mensaje: "Sin beca académica", color: "secondary" };
}

function normalizarNombre(nombre) {
    return nombre.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
}

function nombreRepetido(nombre) {
    return estudiantes.some(estudiante => normalizarNombre(estudiante.nombre) === normalizarNombre(nombre));
}

function obtenerColorEstado(estado) {
    if (estado === "Aprobado") return "success";
    if (estado === "Recuperación") return "warning";
    return "danger";
}

function construirMensaje(estudiante, conteo) {
    return `Nombre: ${estudiante.nombre}\nCarrera: ${estudiante.carrera}\nPromedio: ${estudiante.promedio.toFixed(2)}\nPromedio especial: ${estudiante.promedioEspecial.toFixed(2)}\nEstado: ${estudiante.estado}\nRendimiento: ${estudiante.rendimiento}\nNota más alta: ${estudiante.notaMayor}\nNota más baja: ${estudiante.notaMenor}\nNotas aprobadas: ${conteo.aprobadas}\nNotas en recuperación: ${conteo.recuperacion}\nNotas reprobadas: ${conteo.reprobadas}\nRecomendación: ${estudiante.recomendacion}`;
}

function mostrarResultado(mensaje, tipo) {
    const resultado = document.getElementById("resultado");
    resultado.className = `alert alert-${tipo} mt-4`;
    resultado.style.whiteSpace = "pre-line";
    resultado.textContent = mensaje;
}

function mostrarBeca(beca) {
    const mensajeBeca = document.getElementById("mensajeBeca");
    mensajeBeca.className = `alert alert-${beca.color}`;
    mensajeBeca.textContent = beca.mensaje;
}

function mostrarJSON(estudiante) {
    const salida = document.getElementById("salidaJSON");
    salida.classList.remove("d-none");
    salida.textContent = JSON.stringify(estudiante, null, 2);
}

function actualizarResumenCurso() {
    const total = estudiantes.length;
    document.getElementById("totalEstudiantes").textContent = `Total: ${total}`;
    if (total === 0) {
        document.getElementById("resumenCurso").textContent = "Aún no hay estudiantes evaluados.";
        return;
    }

    const estados = { Aprobado: 0, Recuperación: 0, Reprobado: 0 };
    estudiantes.forEach(estudiante => estados[estudiante.estado]++);
    const promedioCurso = estudiantes.reduce((suma, estudiante) => suma + estudiante.promedio, 0) / total;
    const ordenados = [...estudiantes].sort((a, b) => b.promedio - a.promedio);
    const mejor = ordenados[0];
    const menor = ordenados[ordenados.length - 1];

    document.getElementById("resumenCurso").textContent = `Aprobados: ${estados.Aprobado} | Recuperación: ${estados.Recuperación} | Reprobados: ${estados.Reprobado} | Promedio general: ${promedioCurso.toFixed(2)} | Mejor promedio: ${mejor.nombre} (${mejor.promedio.toFixed(2)}) | Menor promedio: ${menor.nombre} (${menor.promedio.toFixed(2)})`;
}

function mostrarTabla(lista) {
    const cuerpo = document.getElementById("cuerpoTabla");
    cuerpo.innerHTML = "";
    lista.forEach((estudiante, indice) => {
        const fila = document.createElement("tr");
        [indice + 1, estudiante.nombre, estudiante.carrera, estudiante.promedio.toFixed(2), estudiante.estado, estudiante.rendimiento, estudiante.beca].forEach(valor => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });
        cuerpo.appendChild(fila);
    });
    document.getElementById("contenedorTabla").classList.toggle("d-none", lista.length === 0);
    if (lista.length === 0) mostrarMensajeBusqueda("No hay estudiantes para mostrar.", "secondary");
}

function mostrarRanking() {
    const ranking = [...estudiantes].sort((a, b) => b.promedio - a.promedio);
    mostrarTabla(ranking);
}

function buscarEstudiante() {
    const nombre = document.getElementById("nombreBusqueda").value;
    if (!nombre.trim()) {
        mostrarMensajeBusqueda("Escriba un nombre para buscar.", "warning");
        return;
    }
    const encontrado = estudiantes.find(estudiante => normalizarNombre(estudiante.nombre) === normalizarNombre(nombre));
    if (!encontrado) {
        mostrarMensajeBusqueda("No se encontró un estudiante con ese nombre.", "danger");
        return;
    }
    mostrarMensajeBusqueda(`${encontrado.nombre} | Promedio: ${encontrado.promedio.toFixed(2)} | Estado: ${encontrado.estado} | ${encontrado.beca}`, "success");
    mostrarTabla([encontrado]);
}

function mostrarMensajeBusqueda(mensaje, tipo) {
    const resultado = document.getElementById("resultadoBusqueda");
    resultado.className = `alert alert-${tipo} mt-3`;
    resultado.textContent = mensaje;
}

function limpiarFormulario() {
    ["nombre", "nota1", "nota2", "nota3", "nota4"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("carrera").value = "";
    document.getElementById("resultado").className = "alert mt-4 d-none";
    document.getElementById("mensajeBeca").className = "alert d-none";
    document.getElementById("salidaJSON").className = "bg-dark text-white p-3 rounded d-none";
}

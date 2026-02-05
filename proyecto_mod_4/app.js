/*************************************************
 * Proyecto Final Módulo 4 
 * Aplicación en consola con JavaScript
 * Autor: Eduardo Gomes
 *************************************************/

// Mensaje inicial
console.log("Bienvenido a la aplicación del Módulo 4");

// ================================
// VARIABLES Y ENTRADA DE DATOS
// ================================

// Pedimos dos números al usuario
let numero1 = Number(prompt("Ingresa el primer número"));
let numero2 = Number(prompt("Ingresa el segundo número"));

// Validación básica de datos
if (isNaN(numero1) || isNaN(numero2)) {
  alert("Debes ingresar números válidos");
} else {

  // ================================
  // FUNCIONES MATEMÁTICAS
  // ================================

  // Función suma
  function sumar(a, b) {
    return a + b;
  }

  // Función resta
  function restar(a, b) {
    return a - b;
  }

  // Función multiplicación
  function multiplicar(a, b) {
    return a * b;
  }

  // Función división con validación
  function dividir(a, b) {
    if (b === 0) {
      return "Error: no se puede dividir por cero";
    }
    return a / b;
  }

  // ================================
  // MENÚ DE OPCIONES
  // ================================

  let opcion = prompt(
    "Elige una operación:\n" +
    "1 - Sumar\n" +
    "2 - Restar\n" +
    "3 - Multiplicar\n" +
    "4 - Dividir"
  );

  let resultado;

  // Uso de switch
  switch (opcion) {
    case "1":
      resultado = sumar(numero1, numero2);
      break;
    case "2":
      resultado = restar(numero1, numero2);
      break;
    case "3":
      resultado = multiplicar(numero1, numero2);
      break;
    case "4":
      resultado = dividir(numero1, numero2);
      break;
    default:
      resultado = "Opción no válida";
  }

  // Mostrar resultado
  console.log("Resultado:", resultado);
  alert("Resultado: " + resultado);
}

// ================================
// ARREGLOS Y CICLOS
// ================================

// Arreglo de números
let numeros = [3, 7, 12, 18, 25];

// Recorrer arreglo con for
console.log("Lista de números:");
for (let i = 0; i < numeros.length; i++) {
  console.log(numeros[i]);
}

// Función para filtrar números mayores a 10
function filtrarMayoresA10(arr) {
  let resultado = [];
  for (let num of arr) {
    if (num > 10) {
      resultado.push(num);
    }
  }
  return resultado;
}

console.log("Números mayores a 10:", filtrarMayoresA10(numeros));

// ================================
// OBJETOS
// ================================

// Objeto usuario
let usuario = {
  nombre: "Carlos",
  edad: 28,
  saludar: function () {
    return "Hola, mi nombre es " + this.nombre;
  }
};

console.log(usuario.saludar());

// Arreglo de objetos
let usuarios = [
  { nombre: "Ana", edad: 22 },
  { nombre: "Luis", edad: 19 },
  { nombre: "Pedro", edad: 35 }
];

// Recorrer arreglo de objetos con forEach
usuarios.forEach(function (u) {
  console.log(u.nombre + " tiene " + u.edad + " años");
});

console.log("Fin de la aplicación");

let categorias = {};
let conceptos = [];
let currentCategory = "";
let timerInterval;
let aciertos = 0;
let errores = 0;
let esperandoPosicionNeutral = false;

// Referencia al audio
const backgroundMusic = document.getElementById('background-music');
const paso = document.getElementById('paso');
const acierto = document.getElementById('acierto');
const fin = document.getElementById('fin');

// Cargar categorías desde el archivo categorias.txt
fetch('categorias.txt')
    .then(response => response.text())
    .then(data => {
        const lines = data.split('\n'); // Separar por líneas
        lines.forEach(line => {
            const items = line.trim().split(','); // Separar por comas
            const categoria = items[0]; // Primer elemento es la categoría
            const conceptos = items.slice(1); // Resto son los conceptos
            categorias[categoria] = conceptos;
        });
        mostrarCategorias();
    });

// Mostrar la lista de categorías
function mostrarCategorias() {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';

    for (let categoria in categorias) {
        const li = document.createElement('li');
        li.textContent = categoria;
        li.addEventListener('click', () => {
            iniciarJuego(categoria);
        });
        categoryList.appendChild(li);
    }
}

// Iniciar el juego con la categoría seleccionada
function iniciarJuego(categoria) {
    currentCategory = categoria;
    conceptos = [...categorias[categoria]]; // Copiar conceptos
    shuffleArray(conceptos); // Mezclar los conceptos aleatoriamente
    aciertos = 0;
    errores = 0;
    oculta('categoria-screen');
    muestra('juego-screen');
    oculta('resultado-screen');


    let seconds = 5;
    const timerElement = document.getElementById('concepto');

    const countdown = setInterval(() => {
      seconds--;
      timerElement.textContent = seconds;

      if (seconds <= 0) {
        clearInterval(countdown);
        // Aquí puedes agregar el código que se ejecuta después del temporizador

        iniciarTemporizador();
        mostrarSiguienteConcepto();
    
        // Iniciar la música
        // backgroundMusic.play();
    
      }
    }, 1000);

}

// Mostrar un concepto aleatorio de la lista mezclada
function mostrarSiguienteConcepto() {
    if (conceptos.length > 0) {
        const concepto = conceptos.pop(); // Tomar el último concepto de la lista aleatoria
        document.getElementById('concepto').textContent = concepto;
    } else {
        finalizarJuego();
    }
}

// Mezclar los conceptos usando el algoritmo Fisher-Yates
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Iniciar el temporizador de 3 minutos
function iniciarTemporizador() {

    let tiempoRestante = 60; // 1 minutos en segundos
    timerInterval = setInterval(() => {
        tiempoRestante--;
        const minutos = Math.floor(tiempoRestante / 60);
        const segundos = tiempoRestante % 60;
        document.getElementById('timer').textContent = `${minutos}:${segundos < 10 ? '0' + segundos : segundos}`;
        if (tiempoRestante <= 0) {
            clearInterval(timerInterval);
            finalizarJuego();
        }
    }, 1000);
    if (window.DeviceOrientationEvent) {
        requestDeviceOrientation
        
        //alert('Soportado !')
    } else {
        alert('Browser NO Soportado !')
    } 
}

function requestDeviceOrientation () {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
        if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', () => { detectarMovimiento });
        }
        })
    .catch(console.error);
    } else {
    // handle regular non iOS 13+ devices
        console.log ("not iOS");
        window.addEventListener('deviceorientation', detectarMovimiento, false);
    }
  }

// Detectar gestos del dispositivo (aciertos/errores)
function detectarMovimiento(event) {
    // Mostrar el valor actual de beta
    alpha = event.alpha;
    beta = event.beta;
    gamma = Math.trunc( event.gamma ) ;
    document.getElementById('betaValue').textContent = `Gamma: ${gamma}`;
    // Comprobar si estamos esperando la posición neutral
    if (esperandoPosicionNeutral) {
        // La posición neutral es cuando el dispositivo está en vertical (beta ~90)
        if (gamma < -45 && gamma >= -90 || gamma > 45 && gamma < 90 ) { // Permitir una variación de 20 grados en beta
            esperandoPosicionNeutral = false; // El dispositivo volvió a la posición neutral
        }
        return; // No hacer nada mientras se espera la posición neutral
    } else {
        // Movimiento hacia abajo (beta > 100 grados) para acierto
        if ( 5 < gamma && gamma < 30 ) {
            aciertos++;
            acierto.play();
            //actualizarContador();
            esperandoPosicionNeutral = true; // Esperar a que vuelva a la posición original
            mostrarSiguienteConcepto();
        }
        // Movimiento hacia arriba (beta < 80 grados) para error
        else if ( -30 < gamma && gamma < -5 ) {
            errores++;
            paso.play();
            //actualizarContador();
            esperandoPosicionNeutral = true; // Esperar a que vuelva a la posición original
            mostrarSiguienteConcepto();
        }
    }
}


// Finalizar el juego y mostrar los resultados
function finalizarJuego() {
    clearInterval(timerInterval);
    window.removeEventListener('deviceorientation', detectarMovimiento);

    oculta('juego-screen');
    muestra('resultado-screen');
    document.getElementById('correct-count').textContent = aciertos;
    document.getElementById('wrong-count').textContent = errores;
    
    fin.play();

    // Detener la música
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Reiniciar la música
}

// Reiniciar el juego
document.getElementById('restart-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    oculta('resultado-screen');
    muestra('categoria-screen');
    oculta('juego-screen');
});

// Cancelar el juego
document.getElementById('cancel-btn').addEventListener('click', () => {
    finalizarJuego();
});

function muestra(elemento) {
    var x = document.getElementById(elemento);
    //if (x.style.display === "none") {
      x.style.display = "block";
    //} 
  }

function oculta(elemento) {
    var x = document.getElementById(elemento);
    //if (x.style.display === "block") {
      x.style.display = "none";
    //}
  }

  
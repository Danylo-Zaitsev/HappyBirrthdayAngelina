window.onload = () => {
    const mazeContainer = document.getElementById('maze-container');
    const mazeImg = document.getElementById('maze-img');
    const canvas = document.getElementById('maze-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const messageDiv = document.getElementById('message');
    const nextButton = document.getElementById('next-button');

    let imgLoaded = false;
    let gameActive = false;
    let collisionTimeout = null;
    let naturalWidth = 0;
    let naturalHeight = 0;

    // --- !!! УВАГА: ЦЕ ПРИБЛИЗНІ НАЛАШТУВАННЯ - ЇХ ТРЕБА ПЕРЕВІРИТИ І ЗМІНИТИ !!! ---

    // !!! ВСТАВ СЮДИ ТОЧНИЙ RGB КОЛІР СТІН ТВОГО ЛАБІРИНТУ (визнач піпеткою!) !!!
    const WALL_COLOR_RGB = [102, 0, 204]; // ПРИКЛАД ФІОЛЕТОВОГО - ЗАМІНИ НА СВІЙ!

    // Колір шляху (ймовірно, білий, але перевір!)
    const PATH_COLOR_RGB = [255, 255, 255];

    // !!! ВСТАВ СЮДИ ТОЧНІ КООРДИНАТИ СТАРТОВОЇ ЗОНИ (x1, y1, x2, y2) !!!
    // Координати зони СТАРТУ ("Початок" внизу зліва) - ПРИБЛИЗНІ!
    const START_AREA = { x1: 10, y1: 280, x2: 50, y2: 380 }; // ЗАМІНИ НА СВОЇ!

    // !!! ВСТАВ СЮДИ ТОЧНІ КООРДИНАТИ ФІНІШНОЇ ЗОНИ (x1, y1, x2, y2) !!!
    // Координати зони ФІНІШУ ("Кінець" вгорі справа) - ПРИБЛИЗНІ!
    const FINISH_AREA = { x1: 500, y1: 20, x2: 590, y2: 80 }; // ЗАМІНИ НА СВОЇ!

    // Допуск для порівняння кольорів (можна змінити: 5, 10, 15, 20...)
    const COLOR_TOLERANCE = 15;

    // --- Кінець налаштувань ---


    // Функція для отримання позиції миші відносно елемента (враховує масштабування)
    function getMousePos(element, evt) {
        if (!naturalWidth || !naturalHeight) return { x: 0, y: 0 };
        const rect = element.getBoundingClientRect();
        const scaleX = naturalWidth / element.width;
        const scaleY = naturalHeight / element.height;
        return {
            x: Math.round((evt.clientX - rect.left) * scaleX),
            y: Math.round((evt.clientY - rect.top) * scaleY)
        };
    }

    // Функція для перевірки, чи координати знаходяться в зоні
    function isInArea(x, y, area) {
        return x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2;
    }

    // Функція для отримання кольору пікселя
    function getPixelColor(x, y) {
        if (!imgLoaded || !ctx || x < 0 || x >= naturalWidth || y < 0 || y >= naturalHeight) {
            return null;
        }
        try {
            const pixelData = ctx.getImageData(x, y, 1, 1).data;
            return [pixelData[0], pixelData[1], pixelData[2]]; // RGB
        } catch (e) {
            console.error("Помилка отримання даних пікселя:", e);
            return null;
        }
    }

    // Функція для порівняння кольорів з допуском
    function colorsMatch(color1, color2, tolerance = COLOR_TOLERANCE) {
        if (!color1 || !color2) return false;
        return Math.abs(color1[0] - color2[0]) <= tolerance &&
               Math.abs(color1[1] - color2[1]) <= tolerance &&
               Math.abs(color1[2] - color2[2]) <= tolerance;
    }

    // Обробник руху миші
    function handleMouseMove(event) {
        if (!imgLoaded || collisionTimeout) return;

        const pos = getMousePos(mazeImg, event);
        const pixelColor = getPixelColor(pos.x, pos.y);

        // Логування для діагностики (відкрий консоль F12)
         console.log(`Pos: (${pos.x}, ${pos.y}), Color: ${JSON.stringify(pixelColor)}, Active: ${gameActive}, IsWall: ${colorsMatch(pixelColor, WALL_COLOR_RGB)}, IsPath: ${colorsMatch(pixelColor, PATH_COLOR_RGB)}`);

        if (!pixelColor) {
            if (gameActive) {
                console.log("Вийшли за межі!");
                 triggerCollision("Ой, ти вийшла за межі! Повертайся на старт.", 'rgba(255, 152, 0, 0.85)');
            }
             return;
         }

        // Перевірка старту
        if (!gameActive && isInArea(pos.x, pos.y, START_AREA) && colorsMatch(pixelColor, PATH_COLOR_RGB)) {
            console.log("Гра почалась!");
            gameActive = true;
            messageDiv.style.display = 'none';
            nextButton.style.display = 'none';
            return;
        }

        if (!gameActive) return;

        // Перевірка фінішу
        if (isInArea(pos.x, pos.y, FINISH_AREA) && colorsMatch(pixelColor, PATH_COLOR_RGB)) {
            console.log("Фініш!");
            gameActive = false;
            messageDiv.textContent = "Вітаю! Ти пройшла лабіринт кохання!";
            messageDiv.style.backgroundColor = 'rgba(76, 175, 80, 0.85)';
            messageDiv.style.display = 'block';
            nextButton.style.display = 'inline-block';
            return;
        }

        // Перевірка зіткнення зі стіною
        if (colorsMatch(pixelColor, WALL_COLOR_RGB)) {
            console.log("Зіткнення!");
             triggerCollision("Будь обережніша, спробуй ще, кохання!", 'rgba(233, 30, 99, 0.85)');
            return;
        }
    }

    // Функція для обробки зіткнення або виходу за межі
    function triggerCollision(msgText, bgColor) {
         if (collisionTimeout) return;
         gameActive = false;
         messageDiv.textContent = msgText;
         messageDiv.style.backgroundColor = bgColor;
         messageDiv.style.display = 'block';
         nextButton.style.display = 'none';

         collisionTimeout = setTimeout(() => {
             collisionTimeout = null;
         }, 500);
    }

     // Обробник виходу миші за межі контейнера лабіринту
     function handleMouseLeave() {
         if (gameActive) {
             console.log("Миша покинула лабіринт під час гри.");
              triggerCollision("Треба починати знову зі старту!", 'rgba(255, 152, 0, 0.85)');
         }
     }

    // --- Ініціалізація ---
    mazeImg.onload = () => {
        console.log("Зображення лабіринту завантажено.");
        naturalWidth = mazeImg.naturalWidth;
        naturalHeight = mazeImg.naturalHeight;
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        ctx.drawImage(mazeImg, 0, 0, canvas.width, canvas.height);
        imgLoaded = true;
        console.log(`Канвас готовий. Розмір: ${naturalWidth}x${naturalHeight}`);

        const startZoneDiv = document.getElementById('start-zone');
        const finishZoneDiv = document.getElementById('finish-zone');
        if (startZoneDiv) {
             startZoneDiv.style.left = `${START_AREA.x1}px`;
             startZoneDiv.style.top = `${START_AREA.y1}px`;
         }
         if (finishZoneDiv) {
             finishZoneDiv.style.left = `${FINISH_AREA.x1}px`;
             finishZoneDiv.style.top = `${FINISH_AREA.y1}px`;
             finishZoneDiv.style.width = `${FINISH_AREA.x2 - FINISH_AREA.x1}px`;
             finishZoneDiv.style.height = `${FINISH_AREA.y2 - FINISH_AREA.y1}px`;
         }
        console.log("Візуальні зони позиціоновані (приблизно).");
    };

     mazeImg.onerror = () => {
         console.error("Помилка завантаження зображення лабіринту!");
         messageDiv.textContent = "Не вдалося завантажити лабіринт :(";
         messageDiv.style.display = 'block';
     };

     // !!! ОСЬ ТУТ ВИПРАВЛЕНО НА .jpg !!!
     mazeImg.src = "maze.jpg"; // Встановлюємо правильний src


    // Додаємо слухачів подій
    mazeContainer.addEventListener('mousemove', handleMouseMove);
    mazeContainer.addEventListener('mouseleave', handleMouseLeave);
};
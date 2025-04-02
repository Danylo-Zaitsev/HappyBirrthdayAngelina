window.onload = () => {
    // Отримуємо елементи DOM
    const mazeContainer = document.getElementById('maze-container');
    const mazeImg = document.getElementById('maze-img');
    const canvas = document.getElementById('maze-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const collisionModal = document.getElementById('collision-modal');
    const collisionMessage = document.getElementById('collision-message');
    const retryButton = document.getElementById('retry-button');
    const nextMazeButton = document.getElementById('next-maze-button');
    const successMessage = document.getElementById('success-message');

    // Перевірка знаходження елементів
    if (!collisionModal) console.error("Елемент 'collision-modal' не знайдено!");
    if (!retryButton) console.error("Елемент 'retry-button' не знайдено!");
    if (!nextMazeButton) console.error("Елемент 'next-maze-button' не знайдено!");
    // if (!successMessage) console.warn("Елемент 'success-message' не знайдено.");

    // Змінні стану гри
    let imgLoaded = false;
    let isGameOver = false; // Блокування після програшу
    let isGameWon = false;  // Блокування після виграшу
    let naturalWidth = 0;
    let naturalHeight = 0;

    // --- Налаштування ---
    const WALL_COLOR_RGB = [140, 82, 255]; // Колір стін
    const PATH_COLOR_RGB = [255, 255, 255]; // Колір шляху (білий)
    const COLOR_TOLERANCE = 15; // Допуск для кольорів

    // !!! ВАЖЛИВО: ВСТАВ СЮДИ ТОЧНІ КООРДИНАТИ ЗОНИ "КІНЕЦЬ" !!!
    // Визнач координати (x1, y1, x2, y2) прямокутника навколо виходу "Кінець"
    // на твоєму зображенні maze.jpg (використовуй редактор або DevTools).
    const FINISH_AREA = { x1: 500, y1: 20, x2: 590, y2: 80 }; // <-- ЗАМІНИ ЦІ ПРИБЛИЗНІ ЗНАЧЕННЯ!
    // ---------------------------------------------------------

    // --- Допоміжні функції ---
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

    function getPixelColor(x, y) {
        if (!imgLoaded || !ctx || x < 0 || x >= naturalWidth || y < 0 || y >= naturalHeight) return null;
        try {
            const pixelData = ctx.getImageData(x, y, 1, 1).data;
            return [pixelData[0], pixelData[1], pixelData[2]];
        } catch (e) { console.error("Помилка getPixelColor:", e); return null; }
    }

    function colorsMatch(color1, color2, tolerance = COLOR_TOLERANCE) {
        if (!color1 || !color2) return false;
        return Math.abs(color1[0] - color2[0]) <= tolerance &&
               Math.abs(color1[1] - color2[1]) <= tolerance &&
               Math.abs(color1[2] - color2[2]) <= tolerance;
    }

    function isInArea(x, y, area) {
         if (typeof area?.x1 !== 'number' || typeof area?.y1 !== 'number' ||
             typeof area?.x2 !== 'number' || typeof area?.y2 !== 'number') {
            console.error("Неправильні координати зони:", area); return false;
         }
        return x >= area.x1 && x <= area.x2 && y >= area.y1 && y <= area.y2;
    }

    // --- Основна логіка ---
    function handleMouseMove(event) {
        if (!imgLoaded || isGameOver || isGameWon) return; // Не обробляти, якщо гра закінчена

        const pos = getMousePos(mazeImg, event);
        const pixelColor = getPixelColor(pos.x, pos.y);

        if (!pixelColor) return; // За межами

        // 1. Перевірка стіни
        if (colorsMatch(pixelColor, WALL_COLOR_RGB)) {
            console.log("Зіткнення!");
            triggerGameOver("Обережно! Спробуй ще раз, кохання!");
            return;
        }
        // 2. Перевірка фінішу
        else if (isInArea(pos.x, pos.y, FINISH_AREA) && colorsMatch(pixelColor, PATH_COLOR_RGB)) {
             console.log("Фініш!");
             triggerGameWin();
             return;
        }
    }

    function triggerGameOver(msgText) {
        if (isGameOver || isGameWon) return;
        isGameOver = true;
        console.log("Гра заблокована (програш)");
        if (collisionMessage) collisionMessage.textContent = msgText;
        if (collisionModal) collisionModal.style.display = 'flex';
        else alert(msgText);
    }

    function triggerGameWin() {
        if (isGameOver || isGameWon) return;
        isGameWon = true;
        console.log("Гра виграна!");
        if (successMessage) successMessage.style.display = 'block';
        if (nextMazeButton) nextMazeButton.style.display = 'inline-block';
        if (collisionModal) collisionModal.style.display = 'none'; // Ховаємо вікно програшу, якщо воно було
    }

    function retryGame() {
        console.log("Натиснуто Спробувати ще раз. Скидання...");
        if (collisionModal) collisionModal.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';
        if (nextMazeButton) nextMazeButton.style.display = 'none';
        isGameWon = false;

        // Затримка перед розблокуванням isGameOver
        setTimeout(() => {
            isGameOver = false;
            console.log("Гра розблокована.");
        }, 200); // 0.2 секунди
    }

    function handleMouseLeave() {
        // Можна додати логіку програшу при виході
    }

    // --- Ініціалізація ---
    mazeImg.onload = () => {
        console.log("Зображення лабіринту завантажено.");
        naturalWidth = mazeImg.naturalWidth;
        naturalHeight = mazeImg.naturalHeight;
        if (naturalWidth === 0 || naturalHeight === 0) { /* ... обробка помилки ... */ return; }
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        try {
            ctx.drawImage(mazeImg, 0, 0, canvas.width, canvas.height);
            imgLoaded = true;
            console.log(`Канвас готовий. Розмір: ${naturalWidth}x${naturalHeight}`);
        } catch (e) { /* ... обробка помилки ... */ }
    };

     mazeImg.onerror = () => { /* ... обробка помилки ... */ };

     mazeImg.src = "maze.jpg"; // Завантаження

    // Додаємо слухачів подій
    if(mazeContainer) {
        mazeContainer.addEventListener('mousemove', handleMouseMove);
        mazeContainer.addEventListener('mouseleave', handleMouseLeave);
    } else { console.error("Контейнер 'maze-container' не знайдено!"); }

    if (retryButton) {
        retryButton.addEventListener('click', retryGame);
    } // Помилка виведена при завантаженні, якщо не знайдено

};
// Чекаємо, доки завантажиться вся структура сторінки
document.addEventListener('DOMContentLoaded', () => {

    // Знаходимо потрібні елементи
    const answerOptionsContainer = document.getElementById('answer-options');
    const feedbackMessage = document.getElementById('riddle-feedback');
    const successModal = document.getElementById('riddle-success-modal');

    // Перевіряємо, чи всі елементи знайдено
    if (!answerOptionsContainer || !feedbackMessage || !successModal) {
        console.error('Помилка: Не знайдено один з елементів для загадки (answer-options, riddle-feedback або riddle-success-modal). Перевір HTML.');
        return; // Зупиняємо виконання, якщо щось не знайдено
    }

    // Додаємо ОДИН обробник подій на контейнер з кнопками
    answerOptionsContainer.addEventListener('click', (event) => {
        // Перевіряємо, чи клікнули саме на кнопку всередині контейнера
        if (event.target.classList.contains('answer-button')) {
            const clickedButton = event.target;
            const isCorrect = clickedButton.getAttribute('data-correct') === 'true';

            if (isCorrect) {
                // Правильна відповідь
                console.log("Правильна відповідь!");
                feedbackMessage.style.display = 'none'; // Ховаємо повідомлення про помилку (якщо було)
                successModal.style.display = 'flex'; // Показуємо вікно успіху
            } else {
                // Неправильна відповідь
                console.log("Неправильна відповідь");
                feedbackMessage.style.display = 'block'; // Показуємо повідомлення про помилку
                successModal.style.display = 'none'; // Ховаємо вікно успіху (якщо було)

                // Необов'язково: сховати повідомлення про помилку через деякий час
                // setTimeout(() => {
                //     feedbackMessage.style.display = 'none';
                // }, 2500); // Сховати через 2.5 секунди
            }
        }
    });

});
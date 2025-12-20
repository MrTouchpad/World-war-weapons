// Функции для каруселей на главной странице
function initMainCarousel() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (!carouselItems.length || !prevBtn || !nextBtn) return;
    
    let currentIndex = 0;

    function showSlide(index) {
        carouselItems.forEach(item => item.classList.remove('active'));
        carouselItems[index].classList.add('active');
        currentIndex = index;
    }

    prevBtn.addEventListener('click', () => {
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = carouselItems.length - 1;
        showSlide(newIndex);
    });

    nextBtn.addEventListener('click', () => {
        let newIndex = currentIndex + 1;
        if (newIndex >= carouselItems.length) newIndex = 0;
        showSlide(newIndex);
    });
}

// Функции для каруселей в арсенале
function initArsenalCarousels() {
    document.querySelectorAll('.weapon-carousel').forEach(carousel => {
        const container = carousel.querySelector('.carousel-container');
        const items = container.querySelectorAll('.carousel-item');
        const indicators = carousel.parentElement.querySelectorAll('.indicator');
        const prevBtn = carousel.querySelector('.prev-btn');
        const nextBtn = carousel.querySelector('.next-btn');
        
        if (!items.length) return;
        
        let currentIndex = 0;

        function showItem(index) {
            items.forEach(item => item.classList.remove('active'));
            indicators.forEach(indicator => indicator.classList.remove('active'));
            
            items[index].classList.add('active');
            if (indicators[index]) {
                indicators[index].classList.add('active');
            }
            currentIndex = index;
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                let newIndex = currentIndex - 1;
                if (newIndex < 0) newIndex = items.length - 1;
                showItem(newIndex);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                let newIndex = currentIndex + 1;
                if (newIndex >= items.length) newIndex = 0;
                showItem(newIndex);
            });
        }

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showItem(index);
            });
        });
    });
}

// Функция для работающего поиска по сайту
function initSearch() {
    const searchButtons = document.querySelectorAll('.search-button');
    const searchInputs = document.querySelectorAll('.search-input');
    
    // Инициализация поля поиска
    function initializeSearchField() {
        searchInputs.forEach(input => {
            // Проверяем, есть ли сохраненный поиск
            const lastSearch = localStorage.getItem('lastSearch');
            const searchCleared = localStorage.getItem('searchCleared');
            
            // Если поиск был очищен, очищаем поле
            if (searchCleared === 'true') {
                input.value = '';
            } 
            // Иначе восстанавливаем последний поиск
            else if (lastSearch) {
                input.value = lastSearch;
            }
        });
    }
    
    // Функция поиска и выделения на текущей странице
    function searchAndHighlight(searchTerm) {
        // Удаляем предыдущие выделения
        removeHighlights();
        
        // Если поисковый запрос пустой
        if (!searchTerm.trim()) {
            return false;
        }
        
        // Получаем все текстовые элементы
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const nodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.parentNode.nodeName !== 'SCRIPT' && 
                node.parentNode.nodeName !== 'STYLE' &&
                node.parentNode.nodeName !== 'TEXTAREA' &&
                node.parentNode.className !== 'search-input') {
                nodes.push(node);
            }
        }
        
        let found = false;
        let firstHighlight = null;
        
        // Ищем и выделяем совпадения
        nodes.forEach(textNode => {
            const text = textNode.textContent;
            const parent = textNode.parentNode;
            
            if (text.toLowerCase().includes(searchTerm.toLowerCase())) {
                found = true;
                
                // Создаем новый элемент с выделением
                const fragment = document.createDocumentFragment();
                const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
                
                parts.forEach(part => {
                    if (part.toLowerCase() === searchTerm.toLowerCase()) {
                        const mark = document.createElement('mark');
                        mark.className = 'search-highlight';
                        mark.textContent = part;
                        fragment.appendChild(mark);
                        
                        // Запоминаем первый найденный элемент для скролла
                        if (!firstHighlight) {
                            firstHighlight = mark;
                        }
                    } else if (part !== '') {
                        fragment.appendChild(document.createTextNode(part));
                    }
                });
                
                // Заменяем текстовый узел на фрагмент
                parent.replaceChild(fragment, textNode);
            }
        });
        
        // Прокручиваем к первому найденному элементу
        if (firstHighlight) {
            setTimeout(() => {
                firstHighlight.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                
                // Добавляем анимацию мигания
                firstHighlight.style.animation = 'highlightPulse 2s';
                setTimeout(() => {
                    firstHighlight.style.animation = '';
                }, 2000);
            }, 100);
        }
        
        // Показываем сообщение о результатах поиска
        showSearchStatus(searchTerm, found);
        
        return found;
    }
    
    // Функция удаления всех выделений
    function removeHighlights() {
        const highlights = document.querySelectorAll('mark.search-highlight');
        highlights.forEach(mark => {
            const parent = mark.parentNode;
            if (parent) {
                const text = document.createTextNode(mark.textContent);
                parent.replaceChild(text, mark);
                
                // Нормализуем родительский элемент
                parent.normalize();
            }
        });
    }
    
    // Функция показа статуса поиска
    function showSearchStatus(searchTerm, found) {
        // Удаляем предыдущее сообщение
        const existingStatus = document.getElementById('search-status-message');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // Создаем новое сообщение
        const statusMessage = document.createElement('div');
        statusMessage.id = 'search-status-message';
        statusMessage.className = 'search-status-message';
        
        if (found) {
            statusMessage.innerHTML = `
                <span>Найдены совпадения по запросу: "<strong>${searchTerm}</strong>"</span>
                <button class="clear-highlights">Очистить поиск</button>
            `;
            statusMessage.classList.add('found');
        } else {
            statusMessage.innerHTML = `
                <span>По запросу "<strong>${searchTerm}</strong>" ничего не найдено</span>
                <button class="clear-highlights">Очистить поиск</button>
            `;
            statusMessage.classList.add('not-found');
        }
        
        // Добавляем в начало main
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(statusMessage, main.firstChild);
            
            // Автоматически скрываем сообщение через 5 секунд
            setTimeout(() => {
                if (statusMessage.parentNode) {
                    statusMessage.style.opacity = '0';
                    statusMessage.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        if (statusMessage.parentNode) {
                            statusMessage.remove();
                        }
                    }, 300);
                }
            }, 5000);
            
            // Обработчик кнопки очистки
            const clearBtn = statusMessage.querySelector('.clear-highlights');
            if (clearBtn) {
                clearBtn.addEventListener('click', function() {
                    // Удаляем выделения
                    removeHighlights();
                    
                    // Удаляем сообщение
                    statusMessage.remove();
                    
                    // Очищаем все поля поиска на странице
                    searchInputs.forEach(input => {
                        input.value = '';
                    });
                    
                    // Удаляем сохраненный поиск
                    localStorage.removeItem('lastSearch');
                    
                    // Устанавливаем флаг, что поиск очищен
                    localStorage.setItem('searchCleared', 'true');
                    
                    // Фокусируемся на поле поиска
                    if (searchInputs.length > 0) {
                        searchInputs[0].focus();
                    }
                });
            }
        }
    }
    
    // Функция глобальной очистки поиска
    function clearGlobalSearch() {
        // Очищаем поле поиска
        searchInputs.forEach(input => {
            input.value = '';
        });
        
        // Удаляем сохраненный поиск
        localStorage.removeItem('lastSearch');
        
        // Устанавливаем флаг, что поиск очищен
        localStorage.setItem('searchCleared', 'true');
        
        // Удаляем выделения
        removeHighlights();
        
        // Удаляем сообщение о статусе
        const statusMessage = document.getElementById('search-status-message');
        if (statusMessage) {
            statusMessage.remove();
        }
    }
    
    // Обработчики для кнопок поиска
    searchButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const searchContainer = this.closest('.search-container');
            if (!searchContainer) return;
            
            const searchInput = searchContainer.querySelector('.search-input');
            if (!searchInput) return;
            
            const searchTerm = searchInput.value.trim();
            
            if (!searchTerm) {
                alert('Введите поисковый запрос');
                searchInput.focus();
                return;
            }
            
            // Сбрасываем флаг очистки
            localStorage.setItem('searchCleared', 'false');
            
            // Сохраняем поисковый запрос
            localStorage.setItem('lastSearch', searchTerm);
            
            // Синхронизируем все поля поиска на странице
            searchInputs.forEach(input => {
                if (input !== searchInput) {
                    input.value = searchTerm;
                }
            });
            
            // Выполняем поиск и выделение
            searchAndHighlight(searchTerm);
            
            // Сохраняем в историю поиска
            saveSearchHistory(searchTerm);
        });
    });
    
    // Обработка нажатия Enter в поле поиска
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchButton = this.nextElementSibling;
                if (searchButton && searchButton.classList.contains('search-button')) {
                    searchButton.click();
                }
            }
        });
        
        // Синхронизация при вводе
        input.addEventListener('input', function() {
            const value = this.value;
            
            // Синхронизируем все поля поиска на странице
            searchInputs.forEach(otherInput => {
                if (otherInput !== this) {
                    otherInput.value = value;
                }
            });
            
            // Если поле пустое, очищаем поиск
            if (value.trim() === '') {
                // Удаляем выделения
                removeHighlights();
                
                // Удаляем сообщение о статусе
                const statusMessage = document.getElementById('search-status-message');
                if (statusMessage) {
                    statusMessage.remove();
                }
                
                // Удаляем сохраненный поиск
                localStorage.removeItem('lastSearch');
                
                // Устанавливаем флаг, что поиск очищен
                localStorage.setItem('searchCleared', 'true');
            } else {
                // Если что-то вводим, сбрасываем флаг очистки
                localStorage.setItem('searchCleared', 'false');
            }
        });
        
        // Событие при фокусе
        input.addEventListener('focus', function() {
            // Если флаг очистки установлен, очищаем поле
            const searchCleared = localStorage.getItem('searchCleared');
            if (searchCleared === 'true') {
                this.value = '';
                // Синхронизируем все поля на странице
                searchInputs.forEach(otherInput => {
                    if (otherInput !== this) {
                        otherInput.value = '';
                    }
                });
            }
        });
    });
    
    // Функция сохранения истории поиска
    function saveSearchHistory(searchTerm) {
        try {
            let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
            
            // Удаляем дубликаты
            searchHistory = searchHistory.filter(term => term !== searchTerm);
            
            // Добавляем новый запрос в начало
            searchHistory.unshift(searchTerm);
            
            // Ограничиваем историю 10 последними запросами
            if (searchHistory.length > 10) {
                searchHistory = searchHistory.slice(0, 10);
            }
            
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        } catch (e) {
            console.error('Не удалось сохранить историю поиска:', e);
        }
    }
    
    // Инициализация при загрузке
    initializeSearchField();
    
    // Автоматически выполняем поиск при загрузке, если есть сохраненный запрос и он не был очищен
    const lastSearch = localStorage.getItem('lastSearch');
    const searchCleared = localStorage.getItem('searchCleared');
    
    if (lastSearch && searchCleared !== 'true') {
        setTimeout(() => {
            if (lastSearch.trim()) {
                searchAndHighlight(lastSearch);
            }
        }, 500);
    }
}

// Функция для формы контактов
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const greetingDiv = document.getElementById('greeting');
    const successMessage = document.getElementById('successMessage');
    const greetingText = document.getElementById('greetingText');
    const savedFeedback = document.getElementById('savedFeedback');
    const editFormBtn = document.getElementById('editForm');
    const showFormBtn = document.getElementById('showForm');
    
    if (!contactForm) return;
    
    // Проверяем, есть ли сохраненные данные
    const savedName = localStorage.getItem('userName');
    const savedEmail = localStorage.getItem('userEmail');
    const savedCategory = localStorage.getItem('userCategory');
    const savedFeedbackText = localStorage.getItem('userFeedback');
    
    if (savedName && savedEmail) {
        // Показываем приветствие
        greetingText.textContent = `Здравствуйте, ${savedName}!`;
        savedFeedback.textContent = `Ваш последний отзыв (${savedCategory}): ${savedFeedbackText}`;
        greetingDiv.style.display = 'block';
        contactForm.style.display = 'none';
    } else {
        greetingDiv.style.display = 'none';
        contactForm.style.display = 'block';
    }
    
    // Обработка отправки формы
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const category = document.getElementById('category').value;
        const feedback = document.getElementById('feedback').value;
        
        // Сохраняем в localStorage
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userCategory', category);
        localStorage.setItem('userFeedback', feedback);
        
        // Показываем сообщение об успехе
        contactForm.style.display = 'none';
        successMessage.style.display = 'block';
    });
    
    // Кнопка редактирования
    if (editFormBtn) {
        editFormBtn.addEventListener('click', function() {
            greetingDiv.style.display = 'none';
            contactForm.style.display = 'block';
        });
    }
    
    // Кнопка показа формы снова
    if (showFormBtn) {
        showFormBtn.addEventListener('click', function() {
            successMessage.style.display = 'none';
            contactForm.style.display = 'block';
            contactForm.reset();
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    
    initSearch();
    
    if (currentPath.includes('index.html') || currentPath === '/' || currentPath.includes('/index')) {
        initMainCarousel();
    }
    
    if (currentPath.includes('arsenal.html')) {
        initArsenalCarousels();
    }
    
    if (currentPath.includes('form.html')) {
        initContactForm();
    }
});
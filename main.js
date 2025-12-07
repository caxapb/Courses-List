import { availableCourses } from './data/courses.js';

const searchInput = document.querySelector('.search-input');
const state = {
  search: '',
  category: 'All',
  limit: 9,
};
const COURSES = availableCourses.slice();
const CATEGORIES = new Map([['All', 0]]);
init();

function init() {
  updateCategoryCounts();
  loadCurrentPage();
  setupListeners();
}

function updateCategoryCounts() {
  ` Функция для формирования и подсчета количества курсов в каждой категории.
    На основе полученного списка курсов формируется map, в котором лежат пары категория-количество
    После генерации разметки списка категорий, формируется внутреннее содержимое элементов-спанов: 
    число, означающее количество курсов
    Как исходная точка, обозначаем категорию All как активную (выбранную)
  `
  // Подсчет категорий
  COURSES.forEach((course) => {
    const current = CATEGORIES.get(course.category) || 0;
    CATEGORIES.set(course.category, current + 1);
  });
  CATEGORIES.set('All', COURSES.length);

  // Формирование разметки для категорий
  renderCategories();

  // После того как разметка была сформирована, эдитим числа внутри
  const countSpans = document.querySelectorAll('.choose-category-count');
  countSpans.forEach((span) => {
    const categoryName = span.dataset.categoryName;
    if (categoryName === 'All') {
      span.innerHTML = `${COURSES.length}`;
    } else {
      span.innerHTML = `${CATEGORIES.get(categoryName) || 0}`;
    }
  });

  // Выбираем "Все" как текущий выбор категории
  document.getElementsByClassName('choose-category-button')[0].classList.add('choose-category-button-active');
}

function renderCategories() {
  ` Функция для генерации разметки списка категорий
    В выбранный контенер по очереди кладем разметку для каждой категории, включая All
  `
  const categoriesContainer = document.querySelector('.choose-category-container');
  categoriesContainer.innerHTML = '';
  for (const [category, value] of CATEGORIES) {
    categoriesContainer.innerHTML += `    
    <div class="choose-category-item">
      <button class="choose-category-button" data-category-name="${category}">
        <span class="choose-category-name">${category}</span>
        <span class="choose-category-count" data-category-name="${category}"></span>
      </button>
    </div>
    `;
  }
}

function loadCurrentPage() {
  ` Функция для формирования текущего списка карточек, которые будут отображаться
    Требуется для поддержки пагинации (Загрузить больше)
  `
  const filtered = getFilteredCourses();
  const pageItems = filtered.slice(0, state.limit);
  renderCards(pageItems);
}


function getFilteredCourses() {
  ` Функция для фильтра по курсам на основе выбранной категории и поиска
    По данным, хранящимся в состоянии state, фильтруем сначала по категории, 
    а затем по тексту из поискового поля
  `

  const { search, category } = state;
  let filtered;

  if (category !== 'All') {
    filtered = COURSES.filter((course) => course.category === category);
  } else {
    filtered = COURSES.slice();
  }

  if (search) {
    filtered = filtered.filter((course) => {
      return course.title.toLowerCase().includes(search);
    });
  }
  return filtered;
}


function renderCards(cards) {
  ` Функция для рендера карточек курсов
    Полученные курсы уже отфильтрованы и необходимо создать HTML разметку для каждого
    Если длина полученного списка 0, значит после фильтрации не было найдено подхожящий курсов
    Для каждого курса создаем тег article, в котором лежат изображение автора, и информация о курсе
  `

  const coursesGrid = document.querySelector('.courses-grid-container');
  coursesGrid.innerHTML = '';

  if (!cards.length) {
    coursesGrid.innerHTML =
      '<p class="courses-empty">No courses found.</p>';
    return;
  }

  cards.forEach((course) => {
    const badgeColor = defineCategoryColor(course.category);

    coursesGrid.innerHTML += `
    <article class="card">
      <img src="${course.image}" alt="${course.title}">
      <div class="card-content">
        <div>
          <span class="badge" style="background-color: ${badgeColor};">${course.category}</span>
        </div>
        <p class="course-title">${course.title}</p>
        <p>
          <span class="course-price">$${course.price} </span>
          <span class="course-author">| by ${course.author}</span>
        </p>
      </div>
    </article>
    `;
  });
}

function defineCategoryColor(category) {
  ` Функция для определения цвета на основе категории
    Так как каждая карточка курса помечена категорией с соответствующим цветом,
    необходимо определить этот цвет
  `
  switch (category) {
    case "Marketing":      return "#03CEA4"; 
    case "Management":     return "#5A87FC";
    case "HR & Recruting": return "#F89828";
    case "Design":         return "#F52F6E";
    case "Development":    return "#7772F1";
    default:               return "#1E212C";
  }
}



function setupListeners() {
  ` Функция для задавания ивент слушателей
    1) Кнопки для фильтра по категории. На каждую кнопку вешаем слушатель кликов. При нажатии берем имя
    выбранной категории из data аттрибута, если эта категория уже активна, то ничего не делаем. Иначе
    удаляем класс -active у каждой категории, а выбранной добавляем его. Также при нажатии - сброс 
    количества отображаемых карточек: избежать кейса, когда пользователь находится в поле Маркетинг,
    нажимает "загрузить еще", и при обратном переходе на вкладку "все" отображаются так же 9 карточек
    2) Поиск. При изменении контента в поле input получаем этот контент и созраняем его в состоянии state
    3) Дополнительная загрузка карточек. Увеличение лимита в состоянии
    Во всех слушателях после обработки событий "перегазружаем" страницу с помощью loadCurrentPage() 
  `

  const categoryButtons = Array.from(document.getElementsByClassName('choose-category-button'));
  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const activeCategory = button.dataset.categoryName;
      if (activeCategory === state.category) return;

      state.category = activeCategory;

      categoryButtons.forEach((btn) =>
        btn.classList.remove('choose-category-button-active')
      );
      button.classList.add('choose-category-button-active');
      state.limit = 9;
      loadCurrentPage();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      state.search = event.target.value.toLowerCase();
      loadCurrentPage();
    });
  }

  const button = document.querySelector('.load-more-button');
  button.addEventListener('click', () => {
    state.limit += 9;
    loadCurrentPage();
  })
}

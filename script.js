axios.defaults.headers.common['Authorization'] = 'BtXNJoiFoeQE4oiiOTK7wiYj';

let currentQuizz; // define o quizz escolhido para responder
let screenContainer = document.querySelector('.screen'); // define uma variavel que armazena o conteudo atual da tela
let arrayQuizzes; // lista de quizzes
let idCurrentQuestion = 0;
let percentage = 0;
let score = 0;

getAllQuizzes(); //inicia a aplicação realizando um get de todos os quizzes e enviando no promise.then a renderização

//go to create form page
function showForm() {
  document.querySelector('.screen').classList.add('hide');
  document.querySelector('.create-quizz').classList.remove('hide');
}

// get todos os quizzes da api
function getAllQuizzes() {
  let promise = axios.get(
    'https://mock-api.driven.com.br/api/vs/buzzquizz/quizzes'
  );
  promise.then(renderAllQuizzes);
}

// renderiza todos os quizzes
// não está renderizando o do usuário pois ainda não foi feito o local storage
function renderAllQuizzes(resp) {
  renderHomeScreen();
  arrayQuizzes = resp.data;

  let quizzGallery = document.querySelector('.all-quizzes .quizz-gallery');

  for (let i = 0; i < arrayQuizzes.length; i++) {
    quizzGallery.innerHTML += `
    <div class="quizz" onclick="getQuizz(${arrayQuizzes[i].id})" data-test="others-quiz">
        <img src="${arrayQuizzes[i].image}">
        <div class="degrade"></div>
        <span>${arrayQuizzes[i].title}</span>
    </div>
    `;
  }
}

//renderiza a tela inicial (Tela 1 do Figma)
function renderHomeScreen() {
  screenContainer.innerHTML = '';

  screenContainer.innerHTML = `
    
        <div class="quizzes-user">
            <div class="your-quizzes">
                <h2>Seus Quizzes</h2>
                <ion-icon
                name="add-circle"
                class="novo-quizz"
                onclick="showForm()"
                ></ion-icon>
            </div>
            <div class="no-quizz">
                <p>Você não criou nenhum quizz ainda :(</p>
                <button type="button" onclick="showForm()">Criar Quizz</button>
            </div>
        </div>
        <div class="all-quizzes">
            <h2>Todos os Quizzes</h2>
            <div class="quizz-gallery">
            </div>
        </div>
    `;
}

// get quizz da api de acordo pelo id
function getQuizz(id) {
  let promise = axios.get(
    `https://mock-api.driven.com.br/api/vs/buzzquizz/quizzes/${id}`
  );
  promise.then(displayQuizz);
}

//exibe o quizz de acordo com o id (Tela 2 de acordo com o figma)
function displayQuizz(quizz) {
  currentQuizz = quizz.data;
  screenContainer.innerHTML = '';
  generateBanner();
  generateQuestions();
}

// gera o banner do quizz de acordo com a imagem e o titulo
function generateBanner() {
  screenContainer.innerHTML += `
    <div class="banner-quizz">
        <img src="${currentQuizz.image}">
        <p>${currentQuizz.title}</p>
    </div>
    `;
}

// gera as perguntas do quiz de acordo com a quantidade
function generateQuestions() {
  for (let i = 0; i < currentQuizz.questions.length; i++) {
    screenContainer.innerHTML += `
        <div class="question-container">
            <div class="question${i} questions">
                <p>${currentQuizz.questions[i].title}</p>
            </div>
            <div class="options${i} options">
            </div>
        </div>`;

    generateOptions(i);
    document.querySelector(
      `.question${i}`
    ).style.backgroundColor = `${currentQuizz.questions[i].color}`;
  }

  screenContainer.innerHTML += `
        <div class="question-container result-box hide"></div>
    `;

  generateButtons();
}

// gera as opçoes do quizz a partir do ID da pergunta
function generateOptions(questionID) {
  let divOptions = document.querySelector(`.screen .options${questionID}`);

  let answers = currentQuizz.questions[questionID].answers;
  answers = answers.sort(comparador);

  for (let i = 0; i < answers.length; i++) {
    // se a resposta atual for a correta ele vai criar ela com a classe
    // `option correct`
    if (answers[i].isCorrectAnswer) {
      divOptions.innerHTML += `
            <div class="option correct" onclick="selectOption(this)">
                <img src="${answers[i].image}">
                <p>${answers[i].text}</p>
            </div>
        `;
      // se a resposta não for a correta, só vai gerar com a classe option
    } else {
      divOptions.innerHTML += `
            <div class="option" onclick="selectOption(this)">
                <img src="${answers[i].image}">
                <p>${answers[i].text}</p>
            </div>
        `;
    }
  }
  // vai retornar a divOptions para ser usada na função de gerar perguntas
  return divOptions;
}

// comportamento de respostas

// seleciona a opção de acordo com a escolha do usuário através do click
function selectOption(option) {
  let options = option.parentNode.querySelectorAll('.option');
  let selected = option.parentNode.querySelector('.not-selected');

  if (selected === null && isCurrentQuestion(option)) {
    options.forEach((element) => {
      if (element !== option) {
        element.classList.add('not-selected');
      }
    });

    checkAsnwer(option, options);
  }
}

// verifica se a opção escolhida pelo usuário está correta ou não
function checkAsnwer(option, options) {
  let correctAnswer = option.parentNode.querySelector('.option.correct');

  options.forEach((element) => {
    if (element === correctAnswer) {
      element.classList.add('correct-option');
    } else {
      element.classList.add('validated-option');
    }
  });

  if (correctAnswer === option) {
    score++;
  }
}

// verifica se o usuário está respondendo a pergunta atual
function isCurrentQuestion(option) {
  let currentQuestion = option.parentNode.parentNode.querySelector(
    `.questions.question${idCurrentQuestion}`
  );

  if (currentQuestion !== null) {
    idCurrentQuestion++;

    let nextQuestion = document.querySelector(`.question${idCurrentQuestion}`);
    console.log(idCurrentQuestion);
    setTimeout(function () {
      if (idCurrentQuestion === currentQuizz.questions.length) {
        generateResultBox();
        document.querySelector('.result-box').classList.remove('hide');
        document.querySelector('.buttons').classList.remove('hide');

        document
          .querySelector('.result-box')
          .scrollIntoView({ behavior: 'smooth' });
      } else {
        nextQuestion.parentNode.scrollIntoView({ behavior: 'smooth' });
      }
    }, 2000);

    return currentQuestion;
  }
}

// finalização do quizz

// gera a caixa de resultado de acordo com o nível
function generateResultBox() {
  let questionBox = document.querySelector('.question-container.result-box');

  let level = currentQuizz.levels[checkLevel()];

  let title = level.title;
  let img = level.image;
  let description = level.text;

  questionBox.innerHTML = `
          <div class="question${currentQuizz.questions.length}">
              <p>${percentage}% de acerto: ${title}</p>
          </div>
          <div class="container-box">
              <img src="${img}">
              <p>${description}</p>
          </div>
  `;
}

// verifica o nivel de acordo com os acertos e erros do quizz
function checkLevel() {
  percentage = Math.round((score / currentQuizz.questions.length) * 100);

  let levels = currentQuizz.levels;

  for (let i = levels.length - 1; i >= 0; i--) {
    let minValue = currentQuizz.levels[i].minValue;

    if (percentage >= minValue) {
      return i;
    }
  }
}

// navegação após o quizz

function generateButtons() {
  screenContainer.innerHTML += `
        <div class="buttons hide">
            <div class="btn-restart" onclick="restartQuizz()">
                <p>Reiniciar Quizz</p>
            </div>
            <div class="goto-home" onclick="gotoHome()">
                <p>Volta para home</p>
            </div>
        </div>
    `;
}

// reseta as variaveis do quizz atual
function resetAttributes() {
  currentQuizz;
  arrayQuizzes;
  idCurrentQuestion = 0;
  percentage = 0;
  score = 0;
}

// not implemented
function restartQuizz() {
  resetAttributes();

  let reset;

  reset = document.querySelectorAll('.correct-option');
  reset.forEach((element) => {
    element.classList.remove('correct-option');
  });

  reset = document.querySelectorAll('.validated-option');
  reset.forEach((element) => {
    element.classList.remove('validated-option');
  });

  reset = document.querySelectorAll('.not-selected');
  reset.forEach((element) => {
    element.classList.remove('not-selected');
  });

  document.querySelector('.result-box').classList.add('hide');
  document.querySelector('.buttons').classList.add('hide');

  document
    .querySelector('.banner-quizz')
    .scrollIntoView({ behavior: 'smooth' });
}

function gotoHome() {
  screenContainer.innerHTML = '';
  resetAttributes();
  getAllQuizzes();
}

//quizz creation

let newQuizzTitle;
let newQuizzUrl;
let newQuizzQuestions;
let newQuizzLevels;

//quizz creation - basic information
function quizzCreationBasic() {
  newQuizzTitle = document.querySelector('.form-questions :nth-child(1)').value;
  newQuizzUrl = document.querySelector('.form-questions :nth-child(2)').value;
  newQuizzQuestions = document.querySelector(
    '.form-questions :nth-child(3)'
  ).value;
  newQuizzLevels = document.querySelector(
    '.form-questions :nth-child(4)'
  ).value;
  if (newQuizzTitle.length < 20 || newQuizzTitle > 65)
    alert('O título do quizz deve ter no mínimo 20 e no máximo 65 caracteres');
  else if (
    newQuizzUrl.slice(0, 8) !== 'https://' &&
    newQuizzUrl.slice(0, 7) !== 'http://'
  )
    alert(`A URL da imagem deve iniciar com http:// ou https://`);
  else if (newQuizzQuestions < 3)
    alert('O quizz deve possuir no mínimo 3 perguntas');
  else if (newQuizzLevels < 2) alert('O quizz deve possuir no mínimo 2 níveis');
  else renderQuestionsPage();
}

function hideQuestionDetails(element) {
  element
    .querySelector('.field-header')
    .querySelector('img')
    .classList.toggle('hide');
  element.querySelector('.user-input').classList.toggle('hide');
}

function renderQuestionsPage() {
  document.querySelector('.new-quizz-basic-information').classList.add('hide');
  document.querySelector('.new-quizz-questions').classList.remove('hide');
  document.querySelector('.new-questions').innerHTML = '';
  for (let i = 1; i <= newQuizzQuestions; i++) {
    document.querySelector('.new-questions').innerHTML += `
        <div class="form-questions" onclick="hideQuestionDetails(this)">
            <div class="field-header">
                <h3>Pergunta ${i}</h3>
                <img src="assets/edit.png"/>
            </div>
            <div class="user-input hide">
                <input placeholder="Texto da pergunta"/>
                <input placeholder="Cor de fundo da pergunta"/>
                <h3>Resposta correta</h3>
                <input placeholder="Resposta correta"/>
                <input placeholder="URL da imagem"/>
                <h3>Respostas incorretas</h3>
                <input placeholder="Resposta incorreta 1"/>
                <input placeholder="URL da imagem 1"/>
                <br><br>
                <input placeholder="Resposta incorreta 2"/>
                <input placeholder="URL da imagem 2"/>
                <br><br>  
                <input placeholder="Resposta incorreta 3"/>
                <input placeholder="URL da imagem 3"/> 
            </div>
        </div>
        `;
    console.log(document.querySelector('.new-questions :nth-child(1)'));
    if (i === 1)
      hideQuestionDetails(
        document.querySelector('.new-questions :nth-child(1)')
      );
  }
}

function comparador() {
  return Math.random() - 0.5;
}

axios.defaults.headers.common['Authorization'] = 'BtXNJoiFoeQE4oiiOTK7wiYj';

let currentQuizz; // define o quizz escolhido para responder
let screenContainer = document.querySelector('.home-screen'); // define uma variavel que armazena o conteudo
let arrayQuizzes; // lista de quizzes

getAllQuizzes(); //inicia a aplicação realizando um get de todos os quizzes e enviando no promise.then a renderização

function showForm() {
  document.querySelector('.home-screen').classList.add('hide');
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
  console.log(quizzGallery);

  for (let i = 0; i < arrayQuizzes.length; i++) {
    quizzGallery.innerHTML += `
    <div class="quizz" onclick="getQuizz(${arrayQuizzes[i].id})">
        <img src="${arrayQuizzes[i].image}">
        <div class="degrade"></div>
        <span>${arrayQuizzes[i].title}</span>
    </div>
    `;
  }
}

//renderiza a tela inicial
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

//exibe o quizz de acordo com o id
function displayQuizz(quizz) {
  screenContainer.innerHTML = '';
}

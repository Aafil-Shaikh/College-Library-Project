// Define the necessary URLs and elements
const url = new URL(location.href);
const APILINK = 'http://localhost:3000/api/v1/books/';
const SEARCHAPI = 'http://localhost:3000/api/v1/books/';

const goTopBtn = document.getElementById("goTopBtn");
const header = document.getElementById("header");
const form = document.getElementById("form");
const search = document.getElementById("search-bar");
const insertBtn = document.getElementById("insert-btn");
const main = document.getElementById("panel");

// Store original card appearance after withdrawing edit function
let originalLook;   

// Debounce the render function to avoid flickering
const debouncedSearch = debounce(render, 400);

// Fetch books from the API
function fetchBooks(url) {
  return fetch(url).then(res => res.json());
}

// Display the number of results
function displayResultsCount(data) {
  const noOfRecords = Object.keys(data).length
    const msg = document.createElement('h6')
    msg.setAttribute("class","author")
    msg.style.marginBottom = "-1.5em"
    msg.style.paddingLeft = "10px"
    msg.style.color = "#7b8591"
    msg.innerText = noOfRecords + " results"
    main.appendChild(msg)
}

// Render book cards
function renderBookCards(book) {
  const card= document.createElement('div')
  card.setAttribute("class", "card");
  card.setAttribute("id", book._id)
  card.innerHTML = `
    <div class="card-image">
      <img src="/resources/coverTemp.jpg" class="coverTemp">
    </div>
    <div class="card-content">
      <h3 class="title">${book.title}</h3>
      <h6 class="author">${book.author}</h6>
      <p class="desc">${book.desc}</p>
    </div>
    <div class="card-buttons">
      <button onclick= "editBook('${book._id}','${book.title}','${book.author}','${book.desc}')" >Edit</button>
      <button onclick= "confirmDelete('${book._id}')"> Delete</button>
    </div>
  `
  main.appendChild(card)
}

// Fetch and display books
function fetchAndDisplayBooks(url) {
  fetchBooks(url)
    .then(function(data) {
      displayResultsCount(data);
      data.forEach(renderBookCards);
    });
}

// Render function to display books based on search
function render(e){
  btn = document.getElementById("insert-btn")
  btn.style.display = "block";
  e.preventDefault();
  main.innerHTML = '';
  const searchItem = search.value;

  if(searchItem){
    fetchAndDisplayBooks(SEARCHAPI + searchItem);
  }else if(searchItem == ""){
    fetchAndDisplayBooks(SEARCHAPI);
  }
};

// Function to enable book editing
function editBook(id, title, author, desc) {
  const element = document.getElementById(id);
  const titleInputId = "title" + id;
  const authorInputId = "author" + id;
  const descInputId = "desc" + id;
  const cardContents = element.firstElementChild.nextElementSibling;
  const cardButtons = element.lastElementChild;

  element.style.transition = "1ms";
  element.style.border = "2px solid #1480e0";
  originalLook = element.innerHTML;
  originalStyle = element.style;

  cardContents.innerHTML = `
    <input class="title editInput" type="text" id="${titleInputId}" value="${title}"><br>
    <input class="author editInput" type="text" id="${authorInputId}" value="${author}"><br>
    <textarea rows="6" maxlength="300" class="desc editInput" type="text" id="${descInputId}" >${desc}</textarea>
  `;
  cardButtons.innerHTML = `
    <button onclick="saveBook('${titleInputId}','${authorInputId}','${descInputId}','${id}')">Save</button>
    <button id="backbtn${id}">Back</button>
  `;

  const backbtn = cardButtons.lastElementChild;
  backbtn.addEventListener("click", (e) => {
    element.innerHTML = originalLook;
    element.style = originalStyle;
  });
}

// Function to insert a new book
function insertBook(){
  main.innerHTML = '';

  const card = document.createElement('div');
  card.setAttribute("class", "card");

  const cardContent = document.createElement('div');
  cardContent.setAttribute("class", "card-content");
  cardContent.innerHTML = `
    <input class="title editInput" type="text" id="titleInputId" placeholder="Book Title"><br>
    <input class="author editInput" type="text" id="authorInputId" placeholder="Author name"><br>
    <textarea rows="6" maxlength="300" class="desc editInput" type="text" id="descInputId" placeholder="Book description"></textarea>
  `
  const cardButtons = document.createElement('div');
  cardButtons.setAttribute("class", "card-buttons");
  cardButtons.innerHTML = `
    <button onclick= "saveBook('titleInputId','authorInputId','descInputId')" >Add</button>
    <button>Back</button>
  `

  card.appendChild(cardContent)
  card.appendChild(cardButtons)

  card.style.border = "2px solid #1480e0"

  const btn = document.getElementById("insert-btn")
  btn.style.display = "none";

  const backbtn = cardButtons.lastElementChild
  backbtn.addEventListener("click", render)

  main.appendChild(card)
}

// Function to save a book
function saveBook(titleInputId, authorInputId, descInputId, id = "") {
  const title = document.getElementById(titleInputId).value;
  const author = document.getElementById(authorInputId).value;
  const desc = document.getElementById(descInputId).value;

  if (title === "" || author === "" || desc === "") {
    alert("All the fields need to be filled!");
    return;
  }

  const bookData = {
    title,
    author,
    desc
  };

  const url = id ? `${APILINK}${id}` : `${APILINK}new`;
  const method = id ? 'PUT' : 'POST';

  fetch(url, {
    method,
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookData)
  })
    .then(res => res.json())
    .then(res => {
      location.reload();
    });
}

// Function to confirm deletion
function confirmDelete(id){
  const dialogBox = document.getElementById('popupbg')
  dialogBox.style.display = 'block'
  const yesBtn = document.getElementById('yes-btn')
  const noBtn = document.getElementById('no-btn')
  yesBtn.addEventListener('click', function(){
    deleteBook(id)
    dialogBox.style.display = 'none'
  })
  noBtn.addEventListener('click',function(){
    dialogBox.style.display = 'none'
  })
}

// Function to delete a book
function deleteBook(id){
  fetch(APILINK + id, {method: 'DELETE'})
  .then(res => res.json())
  .then(res => {
    console.log(res)
    location.reload()
  });
}

// Debounce function to limit the frequency of a function's execution
function debounce(func, delay) {
  let timer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

// Scroll to top button functionality
goTopBtn.addEventListener("click", function(event) {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Event listeners for search and form submission
form.addEventListener("submit", render)
form.addEventListener("input", debouncedSearch)

// Event listener for insert button
insertBtn.addEventListener("click", insertBook);

// Initial book rendering
fetchAndDisplayBooks(APILINK);
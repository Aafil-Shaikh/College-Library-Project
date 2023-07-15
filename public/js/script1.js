document.addEventListener('DOMContentLoaded', () => {
  
  const goTopBtn = document.getElementById("goTopBtn");
  const header = document.getElementById("header");
  const form = document.getElementById("form");
  const search = document.getElementById("search-bar");
  const insertBtn = document.getElementById("insert-btn");
  const main = document.getElementById("panel");

  insertBtn.addEventListener('click', insertBook)

  const deleteButtons = document.querySelectorAll('#delete-btn');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const cardDiv = button.closest('.card');
      const cardId = cardDiv.id;
      console.log('Card ID:', cardId);
      confirmDelete(cardId)
    });

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
      fetch(`/api/v1/books/${id}`, {method: 'DELETE'})
      .then(res => res.json())
      .then(res => {
        // console.log(res)
        location.reload()
      });
    }

    const editButtons = document.querySelectorAll('#edit-btn');
    editButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const cardDiv = button.closest('.card');
        const cardId = cardDiv.id;
        console.log(cardId)
      });
    })
  });

  

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
    // cardButtons.innerHTML = `
    //   <button onclick= "saveBook('titleInputId','authorInputId','descInputId')" >Add</button>
    //   <button>Back</button>
    // `

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit';
    const backBtn = document.createElement('button');
    backBtn.textContent = 'back';

    cardButtons.appendChild(submitBtn)
    cardButtons.appendChild(backBtn)

    card.appendChild(cardContent)
    card.appendChild(cardButtons)

    card.style.border = "2px solid #1480e0"

    const btn = document.getElementById("insert-btn")
    btn.style.display = "none";

    // const backBtn = cardButtons.lastElementChild
    // backBtn.addEventListener("click", render)

    main.appendChild(card)

    submitBtn.addEventListener('click', () => {

      const title = document.getElementById('titleInputId').value
      const author = document.getElementById('authorInputId').value
      const desc = document.getElementById('descInputId').value

      const bookData = {
        title,
        author,
        desc
      };

      fetch('/api/v1/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
      })
        .then(response => {response.json()})
        .then(data => {
          card.remove();
          location.reload();
        })
        .catch(error => {
          console.error(error);
        });
    })
    
  }

})
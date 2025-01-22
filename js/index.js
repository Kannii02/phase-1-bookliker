document.addEventListener("DOMContentLoaded", function() {
    const bookList = document.getElementById("list");
    const showPanel = document.getElementById("show-panel");

    let currentUser = { id: 1, username: "pouros" }; 

    function fetchBooks() {
        fetch("http://localhost:3000/books")
            .then(response => response.json())
            .then(books => {
                bookList.innerHTML = ""; 
                books.forEach(book => {
                    const li = document.createElement("li");
                    li.textContent = book.title;
                    li.dataset.id = book.id;
                    li.style.cursor = "pointer"; 
                    bookList.appendChild(li);
                });
            });
    }

    fetchBooks(); 

    bookList.addEventListener("click", (event) => {
        if (event.target.tagName === "LI") {
            const bookId = event.target.dataset.id;

            fetch(`http://localhost:3000/books/${bookId}`)
                .then(response => response.json())
                .then(book => {
                    const userHasLiked = book.users.some(user => user.id === currentUser.id);

                    showPanel.innerHTML = `
                        <h2>${book.title}</h2>
                        <img src="${book.img_url}" style="width:150px;">
                        <p>${book.description}</p>
                        <h3>Liked by:</h3>
                        <ul id="likes-list">
                            ${book.users.map(user => `<li>${user.username}</li>`).join("")}
                        </ul>
                        <button id="like-button" data-id="${book.id}">
                            ${userHasLiked ? "Unlike" : "Like"}
                        </button>
                    `;

                    document.getElementById("like-button").addEventListener("click", () => likeBook(book));
                });
        }
    });

    function likeBook(book) {
        const userIndex = book.users.findIndex(user => user.id === currentUser.id);
        const likeButton = document.getElementById("like-button");

        if (userIndex !== -1) {
            book.users.splice(userIndex, 1);
            likeButton.textContent = "Like";
        } else {
            book.users.push(currentUser);
            likeButton.textContent = "Unlike";
        }
    
        fetch(`http://localhost:3000/books/${book.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ users: book.users })
        })
        .then(response => response.json())
        .then(updatedBook => {
            document.getElementById("likes-list").innerHTML = updatedBook.users
                .map(user => `<li>${user.username}</li>`)
                .join("");
        });
    }
});

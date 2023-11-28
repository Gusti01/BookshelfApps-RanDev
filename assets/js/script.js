const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      book.year = parseInt(book.year);
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  console.log(books);
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function addBook() {
  const textTitle = document.getElementById("title").value;
  const textAuthor = document.getElementById("author").value;
  const year = document.getElementById("year").value;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    textTitle,
    textAuthor,
    year,
    false
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function editBookFromCompleted(bookId) {
  const book = findBook(bookId);
  if (!book) return;

  const bookContainer = document.getElementById(`book-${bookId}`);
  if (!bookContainer) return;

  const editForm = document.createElement("form");
  editForm.classList.add("edit-form");
  editForm.onsubmit = function (event) {
    event.preventDefault();
    submitEditForm(bookId);
  };

  const labelTitle = document.createElement("label");
  labelTitle.innerText = "Judul Buku";

  const editTitleInput = document.createElement("input");
  editTitleInput.type = "text";
  editTitleInput.value = book.title;
  editTitleInput.classList.add("edit-title-input");
  editTitleInput.required = true;

  const labelAuthor = document.createElement("label");
  labelAuthor.innerText = "Nama Pengarang";

  const editAuthorInput = document.createElement("input");
  editAuthorInput.type = "text";
  editAuthorInput.value = book.author;
  editAuthorInput.classList.add("edit-author-input");
  editAuthorInput.required = true;

  const labelYear = document.createElement("label");
  labelYear.innerText = "Tahun Terbit";

  const editYearInput = document.createElement("input");
  editYearInput.type = "number";
  editYearInput.value = book.year;
  editYearInput.classList.add("edit-year-input");
  editYearInput.required = true;

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.innerText = "Simpan";

  editForm.append(
    labelTitle,
    editTitleInput,
    labelAuthor,
    editAuthorInput,
    labelYear,
    editYearInput,
    saveButton
  );

  const editButton = bookContainer.querySelector(".edit-button");
  if (editButton) {
    editButton.style.display = "none";
  }
  bookContainer.appendChild(editForm);
  editForm.classList.add("show");
}

function submitEditForm(bookId) {
  const book = findBook(bookId);
  if (!book) return;
  const editForm = document.querySelector(`#book-${bookId} .edit-form`);
  if (!editForm) return;
  const newTitle = editForm.querySelector(".edit-title-input").value;
  const newAuthor = editForm.querySelector(".edit-author-input").value;
  const newYear = editForm.querySelector(".edit-year-input").value;

  book.title = newTitle;
  book.author = newAuthor;
  book.year = newYear;

  editForm.style.display = "none";

  const bookContainer = document.getElementById(`book-${bookId}`);
  const editButton = bookContainer.querySelector(".edit-button");
  if (editButton) {
    editButton.style.display = "block";
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  editForm.classList.remove("show");
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;
  const isConfirm = window.confirm("Apakah anda yakin ingin menghapus ?");

  if (isConfirm) {
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;

  const textTimestamp = document.createElement("p");
  textTimestamp.innerText = bookObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textTimestamp);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");

    checkButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    editButton.addEventListener("click", function () {
      editBookFromCompleted(bookObject.id);
    });
    container.append(checkButton, editButton, trashButton);
  }

  return container;
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById("reads");
  uncompletedBOOKList.innerHTML = "";

  const completedBOOKList = document.getElementById("completed-reads");
  completedBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBOOKList.append(bookElement);
    } else {
      completedBOOKList.append(bookElement);
    }
  }
});

const searchInput = document.getElementById("search-input");
const readsContainer = document.getElementById("reads");
const completedReadsContainer = document.getElementById("completed-reads");

searchInput.addEventListener("input", function (event) {
  event.preventDefault();
  performSearch();
});

function performSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  const allBooks = document.querySelectorAll(".list-item .item");

  for (let i = 0; i < allBooks.length; i++) {
    const bookTitle = allBooks[i].innerText.toLowerCase();
    const bookContainer = allBooks[i].closest(".item");

    if (bookTitle.includes(searchTerm)) {
      bookContainer.style.display = "flex";
    } else {
      bookContainer.style.display = "none";
    }
  }
}

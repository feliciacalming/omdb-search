import axios from "axios";
import { IMovie } from "./models/IMovie";
import { IMovieExtended } from "./models/IMovieExtended";
import { IOmdbResponse } from "./models/IOmdbResponse";

//startpage och input
const startpageContainer: HTMLDivElement = document.createElement("div");
const startpageText: HTMLHeadingElement = document.createElement("h1");

const inputContainer: HTMLElement = document.createElement("section");
const userInput: HTMLInputElement = document.createElement("input");
userInput.type = "text";
const inputBtn: HTMLButtonElement = document.createElement("button");

startpageContainer.classList.add("startpage-container");
startpageText.classList.add("header");
inputContainer.classList.add("input");
userInput.classList.add("input__text");
inputBtn.classList.add("input__btn");

userInput.placeholder = "vad vill du kolla på?";
inputBtn.innerHTML = "Search!";
startpageText.innerHTML = "omdb search";

//search result
const movieSearchResultsContainer: HTMLDivElement =
  document.createElement("div");
const errorMsgContainer: HTMLDivElement = document.createElement("div");
const errorMsg: HTMLParagraphElement = document.createElement("p");
const nextBtn: HTMLButtonElement = document.createElement("button");
let currentPage: number = 1;

errorMsgContainer.classList.add("input__error");
movieSearchResultsContainer.classList.add("search-result-container");
nextBtn.classList.add("nextpageBtn");

nextBtn.innerHTML = "next page";

//funktion för att sätta textmarkören i inputrutan när sidan laddas
function setCaret() {
  userInput.select();
  userInput.setSelectionRange(userInput.value.length, userInput.value.length);
}

setCaret();

//funktion för att hämta filmer från omdb
function searchForMovies() {
  movieSearchResultsContainer.innerHTML = "";
  errorMsg.innerHTML = "";

  axios
    .get<IOmdbResponse>(
      `https://omdbapi.com/?apikey=db07c8df&s=${userInput.value}&page=${currentPage}`
    )
    .then((response) => {
      if (response.status >= 200 && response.status <= 299) {
        return response;
      } else {
        throw Error(response.statusText);
      }
    })
    .then((response) => {
      handleData(response.data.Search);
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
      errorMsg.innerHTML =
        "Whoops! Kunde inte hitta det du sökte efter. :( Prova igen!";
    });
}

//funktion som skapar html av listan med filmer
function handleData(movie: IMovie[]) {
  for (let i = 0; i < movie.length; i++) {
    let movieContainer: HTMLDivElement = document.createElement("div");
    let title: HTMLHeadingElement = document.createElement("h1");
    let image: HTMLImageElement = document.createElement("img");

    movieContainer.classList.add("movie");
    title.classList.add("movie__title");
    image.classList.add("movie__poster");
    startpageContainer.classList.add("startpage-container--moveUp");
    startpageText.classList.add("header--moveUp");

    title.innerHTML = movie[i].Title + ", " + " " + movie[i].Year;
    image.src = movie[i].Poster;

    movieContainer.addEventListener("click", () => {
      displayModal(movie[i]);

      // window.open("https://www.imdb.com/title/" + movie[i].imdbID, "_blank");
    });

    movieContainer.appendChild(title);
    movieContainer.appendChild(image);
    movieSearchResultsContainer.appendChild(movieContainer);
    movieSearchResultsContainer.appendChild(nextBtn);
  }
}

// funktion för att skapa och visa en modal "pop-up" med mer info när man klickar på en film
// (som jag skapat själv istället för att använda bootstrap av nån anledning :) )

function displayModal(movie: IMovie) {
  axios
    .get<IMovieExtended>(
      "https://omdbapi.com/?apikey=db07c8df&i=" + movie.imdbID
    )
    .then((response) => {
      console.log(response.data);

      let modal: HTMLDivElement = document.createElement("div");
      let modalContainer: HTMLElement = document.createElement("section");
      let modalContent: HTMLElement = document.createElement("article");

      let img: HTMLImageElement = document.createElement("img");
      let title: HTMLHeadingElement = document.createElement("h3");
      let year: HTMLHeadingElement = document.createElement("h5");
      let actors: HTMLHeadingElement = document.createElement("h6");
      let director: HTMLHeadingElement = document.createElement("h6");
      let plot: HTMLParagraphElement = document.createElement("p");

      img.src = response.data.Poster;
      title.innerHTML = response.data.Title;
      year.innerHTML = response.data.Released;
      director.innerHTML = response.data.Director;
      plot.innerHTML = response.data.Plot;

      director.innerHTML = "Director: " + response.data.Director;
      actors.innerHTML = "Actors: " + response.data.Actors;

      modal.classList.add("modal");
      modalContainer.classList.add("modal__container");
      modalContent.classList.add("modal__content");
      img.classList.add("modal__img");
      title.classList.add("modal__title");
      year.classList.add("modal__year");
      director.classList.add("modal__director");
      actors.classList.add("modal__actors");
      plot.classList.add("modal__plot");

      modal.style.display = "block";

      movieSearchResultsContainer.addEventListener(
        "click",
        () => (modal.style.display = "none")
      );

      modalContainer.appendChild(img);
      modalContent.appendChild(title);
      modalContent.appendChild(year);
      modalContent.appendChild(director);
      modalContent.appendChild(actors);
      modalContent.append(plot);
      modalContainer.appendChild(modalContent);
      modal.appendChild(modalContainer);
      movieSearchResultsContainer.appendChild(modal);
    });
}

//eventlistener för att tömma input-texten när den är i fokus
userInput.addEventListener("focus", () => {
  userInput.value = "";
  userInput.placeholder = "";
});

//eventlistener för att börja söka efter filmer när man skrivit tre tecken
// userInput.addEventListener("input", () => {
//   // if (userInput.value.length > 2) {
//   searchForMovies();
//   // }
// });

//eventlistener för sök-knappen:
inputBtn.addEventListener("click", searchForMovies);

//eventlistener för att kunna trycka på "enter" istället för att klicka på sök-knappen
//(eftersom jag inte använt av mig av submit-knapp)
userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchForMovies();
  }
});

//eventlistener för header:
startpageText.addEventListener("click", () => {
  location.reload();
});

//eventlistener för att visa fler resultat:
nextBtn.addEventListener("click", () => {
  currentPage++;
  axios
    .get<IOmdbResponse>(
      `https://omdbapi.com/?apikey=db07c8df&s=${userInput.value}&page=${currentPage}`
    )
    .then((response) => {
      handleData(response.data.Search);
      window.scrollTo(0, document.body.scrollHeight);
    });
});

//appendChild
inputContainer.appendChild(userInput);
inputContainer.appendChild(inputBtn);
inputContainer.appendChild(errorMsgContainer);
startpageContainer.appendChild(startpageText);
startpageContainer.appendChild(inputContainer);
startpageContainer.appendChild(movieSearchResultsContainer);
errorMsgContainer.appendChild(errorMsg);
document.body.appendChild(startpageContainer);

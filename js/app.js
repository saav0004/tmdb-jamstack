const APP = {
  df: new DocumentFragment(),
  cat: "",
  queryString: "",
  h3MessageScreen: document.querySelector(".content__message"),
  init: () => {
    if (location.hash) {
      const splitArray = location.hash.split("/");
      const [, media, id, title] = splitArray;
      if (document.body.id !== "index") {
        // console.log("estoy en el credit fetch");
        APP.creditsFetch(media, id);
      } else {
        APP.getFetch(media, id);
        // console.log(splitArray);
        let urlInput = document.querySelector("#keyWordInput");
        urlInput.value = decodeURIComponent(id);
        APP.cat = media;

        if (media === "movie") {
          document.querySelector("#movies").checked = true;
        } else {
          document.querySelector("#tv-series").checked = true;
        }
      }
    }
    APP.eventListeners();
  },
  eventListeners: () => {
    let category = document.querySelector(".radio__buttons");
    category.addEventListener("change", APP.getCategory);
    document.querySelector("form").addEventListener("submit", APP.getData);
    window.addEventListener("popstate", APP.stateHandler);
  },
  getCategory: (ev) => {
    APP.cat = ev.target.getAttribute("value");
    // console.log(APP.cat);
  },
  getData: (ev) => {
    ev.preventDefault();
    let input = document.querySelector("#keyWordInput").value.trim();
    if (document.body.id === "index") {
      APP.queryString = input;
      if (!APP.cat) {
        APP.h3MessageScreen.innerHTML = "";
        APP.showScreenMessage("Please select a category");
        // console.log("Please select a category");
        return;
      }
      if (!APP.queryString) {
        APP.showScreenMessage("Please write in the field");
        // console.log("Please write in the field");
        return;
      }
      //object, title (ignore), url concatenate
      history.pushState({}, "", "#" + `/${APP.cat}/${APP.queryString}`);
      APP.getFetch(APP.cat, APP.queryString);
    } else {
      location.href = `index.html#/${APP.cat}/${input}`;
    }
  },
  getFetch: (media, string) => {
    let key = "516113cfd57ae5d6cb785a6c5bb76fc0";
    let url = `https://api.themoviedb.org/3/search/${media}?query=${string}&api_key=${key}`;
    let queryBox = document.querySelector("#keyWordInput");
    fetch(url)
      .then((response) => {
        // console.log("got response");
        return response.json();
      })
      .then((data) => {
        // console.log(data);
        let ul = document.querySelector(".movie__ul");
        if (data.results.length === 0) {
          APP.h3MessageScreen.innerHTML = "";
          ul.innerHTML = "";
          APP.showScreenMessage(
            `There are no results for "${queryBox.value}", please try another title.`
          );
        } else if (APP.cat === "movie") {
          // console.log("movie is working");
          APP.h3MessageScreen.innerHTML = "";
          ul.innerHTML = "";
          APP.movieConstructor(data);
          APP.showScreenMessage(
            `Movie titles related to: "${queryBox.value}" `
          );
        } else {
          ul.innerHTML = "";
          APP.h3MessageScreen.innerHTML = "";
          // console.log("tv is working");
          APP.tvConstructor(data);
          APP.showScreenMessage(`TV titles related to: "${queryBox.value}"`);
        }
        ul.append(APP.df);
      });
  },
  movieConstructor: function (data) {
    // console.log(data["results"]);
    data["results"].forEach((item) => {
      console.log(item);
      console.log(item.original_title);
      console.log(item.id);
      const li = document.createElement("li");
      if (item.poster_path === null) {
        li.innerHTML = `<a class="a__li" href="#"><img class="poster__img" src="../images/film-reel-cinema-svgrepo-com.svg"></a><div><h3>${item.original_title}</h3>
        <p>${item.overview}</p></div>
        `;
      } else {
        li.innerHTML = `<a class="a__li" href="/credits.html#/movie/${item.id}"><img class="poster__img" src="https://image.tmdb.org/t/p/w500/${item.poster_path}"></a><div><h3>${item.original_title}</h3>
        <p>${item.overview}</p><button>Learn More</button></div>`;
      }
      APP.df.append(li);
    });
  },
  tvConstructor: function (data) {
    console.log(data["results"]);
    data["results"].forEach((item) => {
      const li = document.createElement("li");

      if (item.poster_path === null) {
        li.innerHTML = `
        <a class="a__li" href="#"><img class="poster__img" src="./images/placeholder.png"><a/><div><h3>${item.name}</h3>
        <p>${item.overview}</p></div>`;
      } else {
        li.innerHTML = `<a class="a__li" href="/credits.html#/tv/${item.id}/${APP.queryString}"><img class="poster__img" src="https://image.tmdb.org/t/p/w500/${item.poster_path}"></a><div><h3>${item.name}</h3>
        <p>${item.overview}</p></div>`;
      }
      APP.df.append(li);
    });
  },
  showScreenMessage: (msg) => {
    APP.h3MessageScreen.innerHTML = msg;
  },
  stateHandler: function (ev) {
    console.log("changed");
    if (location.hash) {
      if (document.body.id === "index") {
        let [, cat, queryString] = location.hash.split("/");
        APP.getFetch(cat, decodeURIComponent(queryString));
        APP.queryString = document.querySelector("#keyWordInput");
        APP.queryString.value = decodeURIComponent(queryString);
        APP.cat = cat;
        if (cat === "movie") {
          document.querySelector("#movies").checked = true;
        } else {
          document.querySelector("#tv-series").checked = true;
        }
      } else {
        let [, cat, id] = location.hash.split("/");
        APP.creditsFetch(cat, id);
      }
    }
  },
  creditsFetch: (cat, id) => {
    console.log(cat, id);
    let key = "516113cfd57ae5d6cb785a6c5bb76fc0";
    let url = `https://api.themoviedb.org/3/${cat}/${id}/credits?api_key=${key}`;
    console.log(url);
    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        APP.constructCredits(data);
      })
      .catch();
  },
  constructCredits: (data) => {
    let ul = document.querySelector(".credits__ul");
    ul.innerHTML = data.cast.map((item) => {
      if (item.profile_path === null) {
        return `<li><img class="poster__img" src="../images/film-reel-cinema-svgrepo-com.svg"></li>`;
      } else {
        return `"<li><img class="poster__img" src="https://image.tmdb.org/t/p/original/${item.profile_path}">
        <h3>${item.name}</h3>
        <p>Popularity: ${item.popularity}/100</p></li>"`;
      }
    });
  },
};

document.addEventListener("DOMContentLoaded", APP.init);

// credits shape:
// https://api.themoviedb.org/3/movie/${item.id}/credits?api_key=516113cfd57ae5d6cb785a6c5bb76fc0"

// const baseURL = "https://api.themoviedb.org";
// const movieSearchURL = `/3/search/movie?api_key=`;
// const tvSearchURL = `/3/search/tv?api_key=`;
// const movieCreditsURL = `/3/movie/{movie_id}/credits?api_key=`;
// const tvCreditsURL = `/3/tv/{tv_id}/credits?api_key=`;

// const API = {
//   imgBaseURL: `https://image.tmdb.org`,
//   imgBaseURL: `https://image.tmdb.org/t/p/w500/${data.poster_path}`, -> main picture
// ? img src
//<img src="https://image.tmdb.org/t/p/w500/${data.poster_path}">

//   backdrop_sizes: ["w300", "w780", "w1280", "original"],
//   logo_sizes: ["w45", "w92", "w154", "w185", "w300", "w500", "original"],
//   poster_sizes: ["w92", "w154", "w185", "w342", "w500", "w780", "original"],
//   profile_sizes: ["w45", "w185", "h632", "original"],
//   still_sizes: ["w92", "w185", "w300", "original"],
// };

// fetch();

// let url = "";
// let choice = "";
// let queryString = "";

// API key
// https://api.themoviedb.org/3/movie/550?api_key=516113cfd57ae5d6cb785a6c5bb76fc0

// ! Project Checklist
// ? Design

// * Responsive mobile first layout.
// * Show|movie cards change orientation to make better use of available space.
// * Credit cards shown as a grid.
// ? Custom accessible colour scheme.
// ? Google fonts used.
// * All the colours and font sizes are accessible and readable at all screen sizes.
// * Good design principles are applied.

// ? Security

// * Use Content-Security-Policy <meta> tag to limit what is allowed to be loaded
// * Use NetworkError class to track and handle fetch response problems
// * All errors are reported to the user on the webpage, in the HTML.

// ? Navigation

// ? Searches for movies and shows happen on the same page - index.html
// ? Search results are shown on index.html
// ! The cast for a show or movie is shown on credits.html
// * Details about the search and/or show and/or movie should be passed through the hash value of the url
// * As an alternative to the hash values you can use history.state for most navigation. However, you will still need a way to pass parameters between index.html and credits.html. This will require hash or querystring values.
// * Users need to be able to search for a movie or a tv show from either page
// * The user should be able to click the back and forward buttons in the browser to step through previous searches. popstate()

// ? Features

// ? The user should be able to easily tell if they are searching for a movie or a show.
// ? The user should be able to easily tell if they viewing search results for a movie or a show.
// ? If the image value for a movie, show, or actor is null then there needs to be a placeholder image in the card.
// * Finished version of the site runs on Github Pages from the main branch.

// ? Code

// ? Main script loaded as a module.
// * Namespaces are used to hold all your functions.
// * NetworkError class is imported to be used.
// * History.pushState, History.replaceState, and window.location are used for navigation.
// * Popstate event used to capture navigation done with the back and forward buttons.
// * Search is done with fetch and TMDB API.
// * All the console.log commands are removed or commented out in the final version.
// * No errors appearing in the console while the app runs.
// * All HTML, static and generated, is valid.
// * CSS, fonts, scripts, and images are all in their own folders.

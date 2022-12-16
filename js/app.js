import { NetworkError } from "./utils.js";

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
        if (media === "movie") {
          document.querySelector("#movies").checked = true;
          APP.cat = media;
        } else {
          document.querySelector("#tv-series").checked = true;
          APP.cat = media;
        }
        APP.creditsFetch(media, id, title);
      } else {
        APP.getFetch(media, id);
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
  },
  getData: (ev) => {
    ev.preventDefault();
    let input = document.querySelector("#keyWordInput").value.trim();
    if (document.body.id === "index") {
      APP.queryString = input;
      if (!APP.cat) {
        APP.h3MessageScreen.innerHTML = "";
        APP.showScreenMessage("Please select a category");
        return;
      }
      if (!APP.queryString) {
        APP.showScreenMessage("Please write in the field");
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
        if (!response.ok) {
          throw new NetworkError("API call not working", response);
        }
        return response.json();
      })
      .then((data) => {
        let ul = document.querySelector(".movie__ul");
        if (data.results.length === 0) {
          APP.h3MessageScreen.innerHTML = "";
          ul.innerHTML = "";
          APP.showScreenMessage(
            `There are no results for "${queryBox.value}", please try another title.`
          );
        } else if (APP.cat === "movie") {
          APP.h3MessageScreen.innerHTML = "";
          ul.innerHTML = "";
          APP.movieConstructor(data);
          APP.showScreenMessage(
            `Movie titles related to: "${queryBox.value}" `
          );
        } else {
          ul.innerHTML = "";
          APP.h3MessageScreen.innerHTML = "";
          APP.tvConstructor(data);
          APP.showScreenMessage(`TV titles related to: "${queryBox.value}"`);
        }
        ul.append(APP.df);
      })
      .catch((err) => {
        return APP.errorFunction(true, err);
      });
  },
  movieConstructor: function (data) {
    data["results"].forEach((item) => {
      const li = document.createElement("li");
      if (item.poster_path === null) {
        li.innerHTML = `<a class="a__li" href="#"><img class="poster__img" src="../images/film-reel-cinema-svgrepo-com.svg"></a><div><h3>${item.original_title}</h3>
        <p>${item.overview}</p><a href=credits.html#/movie/${item.id}/${APP.queryString}><button class="btn">Learn More</button></a></div>
        `;
      } else {
        li.innerHTML = `<a class="a__li" href=credits.html#/movie/${item.id}/${APP.queryString}><img class="poster__img" src="https://image.tmdb.org/t/p/w500/${item.poster_path}"></a><div><h3>${item.original_title}</h3>
        <p>${item.overview}</p><a href=credits.html#/movie/${item.id}><button class="btn">Learn More</button></a></div>`;
      }
      APP.df.append(li);
    });
  },
  tvConstructor: function (data) {
    data["results"].forEach((item) => {
      const li = document.createElement("li");

      if (item.poster_path === null) {
        li.innerHTML = `
        <a class="a__li" href="#"><img class="poster__img" src="./images/placeholder.png"><a/><div><h3>${item.name}</h3>
        <p>${item.overview}</p><a href=credits.html#/tv/${item.id}/${APP.queryString}><button class="btn">Learn More</button></a></div>`;
      } else {
        li.innerHTML = `<a class="a__li" href=/credits.html#/tv/${item.id}/${APP.queryString}><img class="poster__img" src="https://image.tmdb.org/t/p/w500/${item.poster_path}"></a><div><h3>${item.name}</h3>
        <p>${item.overview}</p><a href=credits.html#/tv/${item.id}/${APP.queryString}><button class="btn">Learn More</button></a></div>`;
      }
      APP.df.append(li);
    });
  },
  showScreenMessage: (msg) => {
    APP.h3MessageScreen.innerHTML = msg;
  },
  stateHandler: function (ev) {
    if (location.hash) {
      if (document.body.id === "index") {
        let [, cat, queryString] = location.hash.split("/");
        APP.cat = cat;
        APP.queryString = document.querySelector("#keyWordInput");
        APP.queryString.value = decodeURIComponent(queryString);
        APP.getFetch(cat, decodeURIComponent(queryString));
        if (cat === "movie") {
          document.querySelector("#movies").checked = true;
        } else {
          document.querySelector("#tv-series").checked = true;
        }
      } else {
        let [, cat, id] = location.hash.split("/");
        APP.cat = cat;
        APP.creditsFetch(cat, id);
      }
    }
  },
  creditsFetch: (cat, id, title) => {
    let userInput = document.getElementById("keyWordInput");
    userInput.value = decodeURIComponent(title);
    let key = "516113cfd57ae5d6cb785a6c5bb76fc0";
    let url = `https://api.themoviedb.org/3/${cat}/${id}/credits?api_key=${key}`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new NetworkError("API call not working", response);
        }
        return response.json();
      })
      .then((data) => {
        APP.constructCredits(data);
      })
      .catch((err) => {
        return APP.errorFunction(true, err);
      });
  },
  constructCredits: (data) => {
    let ul = document.querySelector(".credits__ul");
    ul.innerHTML = data.cast
      .map((item) => {
        if (item.profile_path === null) {
          return `<li class="credits__li"><img class="poster__img" src="../images/film-reel-cinema-svgrepo-com.svg"></li>`;
        } else {
          return `<li class="credits__li"><img class="poster__img" src="https://image.tmdb.org/t/p/original/${item.profile_path}">
        <h3>${item.name}</h3>
        <p>Popularity: ${item.popularity}/100</p></li>`;
        }
      })
      .join("");
  },
  errorFunction: (err) => {
    if (err.status === 404) {
      APP.h3MessageScreen.innerHTML = `Hmm...We were unable to obtain the info information... :( Try again!`;
    } else {
      APP.h3MessageScreen.innerHTML = `Please check your internet connection and try again.`;
    }
  },
};

document.addEventListener("DOMContentLoaded", APP.init);

let allPkms = []; //Pokemon namen

let currentPkms = []; //Pokemon namen für die Suche

let BASE_URL = `https://pokeapi.co/api/v2/pokemon/`

let PokeDetails = {}; //Objekt mit Details der Pokemons

let allResults =[]; //results werden hier Stück für Stück ergänzt. 


function init() {
    let path = `?limit=20&offset=0`
    getPokemons(path);
}


// Namen der Pokemon holen
async function getPokemons (path) {
    let response = await fetch (BASE_URL + path)
    let responseAsJson = await response.json()
    let results = responseAsJson.results //Hier wird das results array aus json in ein array hineingeladen
    allResults = allResults.concat(results); //das sind dann alle Pokemons 
    loadPokes (results)
    await pokeDetails(allResults)
    renderPokes ()  
}

// Vorschleife für das Namen/Details laden, jedes Pokemon aus results wird reingeladen
function loadPokes (results) {
    for (let i=0; i< results.length; i++) {
        let pokeName = results[i].name.charAt(0).toUpperCase() + results[i].name.slice(1);
        allPkms.push(pokeName) //array mit den großgeschriebenen Namen der Pokemons
    }  
}

//Pokemondetails laden in ein Objekt
async function pokeDetails (allResults) {
    const offset =  Object.keys(PokeDetails).length
    for (let i = offset; i < allResults.length; i++)  
    {
    const detailResponse = await fetch(allResults[i].url);
    const pokeDetail = await detailResponse.json(); 
    PokeDetails[i] =pokeDetail //Hier erstelle ich ein Objekt mit den Details zu jedem Pokemon
    }
}

// PokeBilder laden
function renderPokes () {
let contentRef = document.getElementById("names")
contentRef.innerHTML = ""; 

 for (let i= 0; i< allPkms.length; i++) {
    if (!PokeDetails[i].types[1]) {
        showPokeWithOneType (i)
    }
    else {
        showPokeWithTwoTypes (i)
    }
 }
 renderButton()
}

//Suchfunktion
function filterAndShowNames(filterWord) {
    let contentRef = document.getElementById("names")
    contentRef.innerHTML = ""; 
    if (filterWord.length < 3) {
    renderPokes()
  } else {
    currentPkms = allPkms.filter(name => name.toLowerCase().startsWith(filterWord.toLowerCase()));
    renderPokesSearch()
  } 
}

//Gesuchte Pokes laden
function renderPokesSearch() {
    let contentRef = document.getElementById("names")
    contentRef.innerHTML = ""; 
    for (let index= 0; index< currentPkms.length; index++) {
    const name = currentPkms[index]
    const i = allPkms.findIndex(p => p.toLowerCase() === name.toLowerCase());
    if (i === -1) continue; // Falls kein passender Index gefunden wurde
    if (!PokeDetails[i].types[1]) {
      showPokeWithOneType(i);
    } else {
      showPokeWithTwoTypes(i);
    }
  }
  renderButton()
}

//Weitere Pokes laden
function renderMorePokes() {
    const offset = Object.keys(PokeDetails).length; 
    let path = `?limit=20&offset=${offset}`
    getPokemons(path);
}

//Detailkarte laden

function showDetails(i) {
  document.getElementById("names").classList.add("d_none")
  document.getElementById("button").classList.add("d_none")
  document.getElementById("blue_overlay").classList.remove("d_none")
  document.getElementById("body").classList.add("noscroll")
  renderPokeDetails(i)
}

function renderPokeDetails (i) {
  let abilities = getAbilities(i)
  if (!PokeDetails[i].types[1]) {
        getTemplateOneTyp (i, abilities)
    }
    else {
        getTemplateTwoTypes (i, abilities)
    }
}

function closeDialogue() {
  document.getElementById("blue_overlay").classList.add("d_none")
  document.getElementById("body").classList.remove("noscroll")
  document.getElementById("names").classList.remove("d_none")
  document.getElementById("button").classList.remove("d_none")
}

function preventBubbling(event) {
   event.stopPropagation()
}

function getAbilities (i) {
  let abilitiesPoke = [] ;  
  if (PokeDetails[i].abilities[0]) {
    abilitiesPoke.push(PokeDetails[i].abilities[0].ability.name) }
  if (PokeDetails[i].abilities[1]) {
    abilitiesPoke.push(PokeDetails[i].abilities[1].ability.name)}
  if (PokeDetails[i].abilities[2]) {
    abilitiesPoke.push(PokeDetails[i].abilities[2].ability.name)}
 return abilitiesPoke
}

function renderMain(i) {
  renderPokeDetails (i)
}

function renderStat (i, event) {
  preventBubbling(event)
  document.getElementById("main").disabled = false;
  document.getElementById("stat").disabled = true;
  document.getElementById("all_details").innerHTML ="";
  renderStatTemplate(i)
}
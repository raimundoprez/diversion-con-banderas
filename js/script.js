const errorNotice = document.getElementById("error-notice");
const countriesList = document.getElementById("countries-list");

const endpoint = "https://restcountries.com/v3.1/all?fields=name,flags,capital,population,car";

let countryInfo = null;

const countryInfoClass = "countryInfo";

async function getAllCountries() {
    try {
        const response = await fetch(endpoint);

        if (!response.ok)
            throw new Error("El servidor devolvió el estado " + response.status);

        const data = await response.json();

        if (!Array.isArray(data))
            throw new Error("El servidor no devolvió un objeto de tipo array");

        return data;
    }
    catch(error) {
        console.log("Error al solicitar el listado de países del servidor: " + error.message);
    }
}

function countrySorter(c1, c2) {
    c1 = c1.name?.common ?? "";
    c2 = c2.name?.common ?? "";

    return c1.localeCompare(c2, "en", {sensitivity: "base"});
}

function removeCountryInfo() {
    if (countryInfo) {
        const nameContainer = document.querySelector(`.${countryInfoClass} > div > div > h2`);
        const name = nameContainer ? nameContainer.innerText : "";

        countryInfo.remove();
        countryInfo = null;

        return name;
    }
}

function showCountryInfo(data) {
    const name = removeCountryInfo();

    if (name && name === data.name)
        return;

    countryInfo = document.createElement("div");
    countryInfo.classList.add(countryInfoClass);

    countryInfo.innerHTML = `
        <div>
            <img src="${data.flag}" alt="${data.alt}">
            <div>
                <h2>${data.name}</h2>
                <p><span>Capital: </span><span>${data.capital.join(", ")}</span></p>
                <p><span>Población: </span><span>${data.population}</span></p>
                <p><span>Lado de la carretera: </span><span>${data.side}</span></p>
            </div>
        </div>
    `;
    
    const button = document.createElement("button");

    button.addEventListener("click", removeCountryInfo);
    button.innerText = "Cerrar";

    countryInfo.appendChild(button);
    document.body.appendChild(countryInfo);
}

getAllCountries().then(countries => {
    if (!countries) {
        errorNotice.innerText = "Se ha producido un error al solicitar la lista de países. Prueba a recargar la página.";
        return;
    }

    //ordenar países alfabéticamente
    countries.sort(countrySorter);

    const elements = countries.map(country => {
        const element = document.createElement("li");
        const flagImage = document.createElement("img");
        const countryName = document.createElement("h2");

        flagImage.setAttribute("src", country.flags?.png);
        flagImage.setAttribute("alt", country.flags?.alt);

        countryName.innerText = country.name?.common;

        const data = {
            name: country.name?.common,
            flag: country.flags?.png,
            alt: country.flags?.alt,
            capital: Array.isArray(country.capital) ? [...country.capital] : [],
            population: country.population,
            side: country.car?.side
        };

        flagImage.addEventListener("click", () => {
            showCountryInfo(data);
        });

        element.appendChild(flagImage);
        element.appendChild(countryName);

        return element;
    });

    const fragment = document.createDocumentFragment();

    elements.forEach(element => fragment.appendChild(element));

    countriesList.appendChild(fragment);
});
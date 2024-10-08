let cities = []; // Global declaration
let points = {};
const categories = [
    "CulinaryScene",
    "EscapeRooms",
    "NightlifeAndEntertainment",
    "OutdoorActivitiesAndNature",
    "ClimateAndWeather",
    "AdultEntertainment"
];
let currentComparison = {};

$(document).ready(function() {
$.getJSON('data.json', function(data) {
    console.log('Data loaded:', data);
    cities = data.cities;
    console.log('Cities array:', cities);
    initialize();
}).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Failed to load city data:', textStatus, errorThrown);
    alert('Failed to load city data.');
});

    function initialize() {
        console.log('Initializing...');
        
        console.log('Checking localStorage for points...');
        // Initialize points from local storage or set to 10
        if (localStorage.getItem('points')) {
            console.log('Points found in localStorage');
            points = JSON.parse(localStorage.getItem('points'));
        } else {
            console.log('Setting default points');
            cities.forEach(city => {
                points[city.city] = 10;
            });
        }
        console.log('Points after initialization:', points);

        console.log('Checking localStorage for currentComparison...');
        // Load current comparison from local storage or generate a new one
        if (localStorage.getItem('currentComparison')) {
            console.log('currentComparison found in localStorage');
            currentComparison = JSON.parse(localStorage.getItem('currentComparison'));
            console.log('Restoring comparison...');
            restoreComparison();
        } else {
            console.log('Generating new comparison...');
            generateComparison();
        }

        console.log('Building points list...');
        buildPointsList();
        console.log('Updating validation message...');
        updateValidationMessage();
        console.log('Initialization complete');
    }

    function buildPointsList() {
    const pointsList = $('#points-list');
    pointsList.empty();

    let citiesWithPoints = cities.map(city => ({
        city: city.city,
        points: points[city.city]
    }));

    // Sort the array from highest to lowest points
    citiesWithPoints.sort((a, b) => b.points - a.points);

    // Build the points list
    citiesWithPoints.forEach(cityData => {
        const cityId = cityData.city.replace(/[^a-zA-Z0-9]/g, '_');
        const cityDiv = $(`
            <div class="city-points">
                <span>${cityData.city}</span>
                <div>
                    <button onclick="adjustPoints('${cityData.city}', 1)">▲</button>
                    <span id="points-${cityId}">${cityData.points}</span>
                    <button onclick="adjustPoints('${cityData.city}', -1)">▼</button>
                </div>
            </div>
        `);
        pointsList.append(cityDiv);
    });
}

window.adjustPoints = function(cityName, change) {
    points[cityName] += change;
    if (points[cityName] < 0) points[cityName] = 0;
    updatePointsDisplay(cityName);
    updateValidationMessage();
    buildPointsList();
    saveState();
}

window.vote = function(side) {
    const winner = side === 'left' ? currentComparison.leftCity : currentComparison.rightCity;
    const loser = side === 'left' ? currentComparison.rightCity : currentComparison.leftCity;

    // Adjust Points
    if (points[loser] > 0) {
        points[winner]++;
        points[loser]--;
        updatePointsDisplay(winner);
        updatePointsDisplay(loser);
        updateValidationMessage();
        buildPointsList();
        saveState();
    }

    // Generate Next Comparison
    generateComparison();
}

function updatePointsDisplay(cityName) {
    const cityId = cityName.replace(/[^a-zA-Z0-9]/g, '_');
    $(`#points-${cityId}`).text(points[cityName]);
}

    function updateValidationMessage() {
        const totalPoints = Object.values(points).reduce((a, b) => a + b, 0);
        const validationMessage = $('#validation-message');
        if (totalPoints === 170) { // Assuming 17 cities * 10 points each
            validationMessage.text('Valid distribution').removeClass('invalid').addClass('valid');
        } else {
            validationMessage.text(`Total points distributed: ${totalPoints}`).removeClass('valid').addClass('invalid');
        }
    }

function generateComparison() {
    const category = categories[Math.floor(Math.random() * categories.length)];
    let cityIndices = [];
    while (cityIndices.length < 2) {
        let index = Math.floor(Math.random() * cities.length);
        if (!cityIndices.includes(index)) {
            cityIndices.push(index);
        }
    }
    const leftCity = cities[cityIndices[0]];
    const rightCity = cities[cityIndices[1]];

    const categoryName = category.replace(/([A-Z])/g, ' $1').trim();

    $('#left-city-name').text(leftCity.city).removeClass().addClass('animate__animated animate__fadeInLeft');
    $('#left-category').text(categoryName).removeClass().addClass('animate__animated animate__fadeInLeft');
    $('#left-text').text(leftCity.categories[category]).removeClass().addClass('animate__animated animate__fadeInLeft');

    $('#right-city-name').text(rightCity.city).removeClass().addClass('animate__animated animate__fadeInRight');
    $('#right-category').text(categoryName).removeClass().addClass('animate__animated animate__fadeInRight');
    $('#right-text').text(rightCity.categories[category]).removeClass().addClass('animate__animated animate__fadeInRight');

    // Update Images
    updateBackgroundImage('left', leftCity.city, category);
    updateBackgroundImage('right', rightCity.city, category);

    // Initialize Parallax if available
    if (typeof Parallax !== 'undefined') {
        $('.parallax-container').each(function() {
            if (!$(this).data('plugin_parallax')) {
                new Parallax(this);
            }
        });
    } else {
        console.warn('Parallax library not loaded. Skipping parallax initialization.');
    }

    // Store Current Comparison
    currentComparison = {
        category: category,
        leftCity: leftCity.city,
        rightCity: rightCity.city
    };

    // Save state
    saveState();
}

    function restoreComparison() {
        const leftCity = cities.find(city => city.city === currentComparison.leftCity);
        const rightCity = cities.find(city => city.city === currentComparison.rightCity);
        const category = currentComparison.category;
        const categoryName = category.replace(/([A-Z])/g, ' $1').trim();

        $('#left-city-name').text(leftCity.city).removeClass().addClass('animate__animated animate__fadeInLeft');
        $('#left-category').text(categoryName).removeClass().addClass('animate__animated animate__fadeInLeft');
        $('#left-text').text(leftCity.categories[category]).removeClass().addClass('animate__animated animate__fadeInLeft');

        $('#right-city-name').text(rightCity.city).removeClass().addClass('animate__animated animate__fadeInRight');
        $('#right-category').text(categoryName).removeClass().addClass('animate__animated animate__fadeInRight');
        $('#right-text').text(rightCity.categories[category]).removeClass().addClass('animate__animated animate__fadeInRight');

        // Update Images
        updateBackgroundImage('left', leftCity.city, category);
        updateBackgroundImage('right', rightCity.city, category);

        // Initialize Parallax
        $('.parallax-container').each(function() {
            if (!$(this).data('plugin_parallax')) {
                new Parallax(this);
            }
        });
    }

    function updateBackgroundImage(side, cityName, category) {
        const cityFolder = cityName.replace(/[\s\/]+/g, '').toLowerCase();
        const categoryFolder = category;
        const numImages = 5; // Adjust based on actual number of images
        const imageNumber = Math.floor(Math.random() * numImages) + 1;
        const imagePath = `${cityFolder}/${categoryFolder}/${imageNumber}.jpg`;
        $(`#${side}-pane .parallax-container`).attr('data-image-src', imagePath);
    }


    // Save State to Local Storage
    function saveState() {
        localStorage.setItem('points', JSON.stringify(points));
        localStorage.setItem('currentComparison', JSON.stringify(currentComparison));
    }

    // Reset Points and Clear Local Storage
    window.resetPoints = function() {
        if (confirm('Are you sure you want to reset all points?')) {
            localStorage.clear();
            points = {};
            currentComparison = {};
            initialize();
        }
    }

    // Copy Results to Clipboard
    window.copyResults = function() {
        let resultsArray = [];

        // Sort cities before copying
        let sortedCities = Object.keys(points).sort((a, b) => points[b] - points[a]);

        sortedCities.forEach(cityName => {
            resultsArray.push(`${cityName}: ${points[cityName]}`);
        });

        let results = resultsArray.join('\n');

        navigator.clipboard.writeText(results).then(() => {
            alert('Results copied to clipboard!');
        }, () => {
            alert('Failed to copy results.');
        });
    }
});
